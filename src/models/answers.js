import DefineMap from 'can-define/map/map'
import Answer from '~/src/models/answer'
import canReflect from 'can-reflect'
import CONST from '~/src/models/constants'
import cString from '@caliorg/a2jdeps/utils/string'
import cDate from '@caliorg/a2jdeps/utils/date'
import readableList from '~/src/util/readable-list'

const boundForRevision = new WeakSet()
const skipRevisionKeys = { revision: true, lang: true }

function onPatches (observable, handler) {
  if (!observable || boundForRevision.has(observable)) {
    return
  }
  if (typeof canReflect.onPatches !== 'function') {
    return
  }
  boundForRevision.add(observable)
  canReflect.onPatches(observable, handler)
}

export default DefineMap.extend('AnswersModel', { seal: false }, {
  '*': Answer,

  lang: {
    Type: DefineMap,
    serialize: false
  },

  /**
   * Cheap observable token incremented when any answer value changes.
   * Bind to this instead of answers.serialize() so templates do not walk
   * the entire answer map on every keystroke.
   */
  revision: {
    type: 'number',
    default: 0,
    serialize: false
  },

  varExists: function (prop) {
    const key = prop.trim().toLowerCase()
    const hasKey = canReflect.hasOwnKey(this, key)

    if (hasKey) {
      return this[key]
    } else {
      return null
    }
  },

  varCreate: function (varName, varType, varRepeat) {
    // TODO: this should handle missing params, possibly wrong order as well
    const varNameKey = varName.toLowerCase()
    const newAnswer = new Answer({
      name: varName,
      type: varType || 'Text',
      repeating: varRepeat || false,
      values: [null]
    })

    canReflect.setKeyValue(this, varNameKey, newAnswer)
    this.bindAnswer(newAnswer)

    return newAnswer
  },

  varGet: function (varName, varIndex, opts) {
    let varAnswerModel = this.varExists(varName)

    if (!varAnswerModel) return undefined

    if (typeof varIndex === 'undefined' || varIndex === null || varIndex === '') {
      // TODO: handle this side effect of a readableList in a better way/different place
      if (varAnswerModel.repeating) {
        // Repeating variable without an index returns a readable list for display
        return readableList(varAnswerModel.values, this.lang)
      }

      varIndex = 1
    }

    let val = varAnswerModel.values[varIndex]

    switch (varAnswerModel.type) {
      case CONST.vtNumber:
        if (opts && opts.num2num === true) {
          // Handle text numbers with commas and decimals
          // zero is edge case that returns itself
          if (val !== 0) {
            val = cString.textToNumber(val)
          }
        }

        break

      case CONST.vtDate:
        if (opts && opts.date2num === true) {
          // For calculations like comparing dates or adding days we convert date to number,
          //  daysSince1970, like A2J 4.
          if (val) {
            // 11/28/06 If date is blank DON'T convert to number.
            // this number represents the date as days since epoch, '01/01/1970'
            val = cDate.dateToDays(val)
          }
        }

        break

      case CONST.vtText:
        if (opts && opts.date2num === true && cString.ismdy(val)) {
          // If it's a date type or looks like a date type, convert to number of days.
          // Why is this needed? TODO:
          val = cDate.dateToDays(val)
        }

        break

      case CONST.vtTF:
        if (typeof val === 'string') {
          val = val.toLowerCase() === 'true'
        }
        break
    }

    return val
  },

  varSet: function (varName, varVal, varIndex) {
    let varAnswerModel = this.varExists(varName)

    // TODO: this legacy auto create behavior causes bugs - should throw Author error instead
    if (varAnswerModel === null) {
      // Create variable at runtime
      const repeating = !((typeof varIndex === 'undefined') || (varIndex === null) || (varIndex === '') || (varIndex === 0))
      varAnswerModel = this.varCreate(varName, CONST.vtText, repeating, '')
    }

    if ((typeof varIndex === 'undefined') || (varIndex === null) || (varIndex === '')) {
      varIndex = 0
    }

    // Handle type conversion, like number to date and null to proper `notanswered` values.
    switch (varAnswerModel.type) {
      case CONST.vtDate:
        if (typeof varVal === 'number') {
          // this can take a second format param. default is 'MM/DD/YYYY' if no second param sent
          varVal = cDate.dateToString(varVal)
        }
        break
      case CONST.vtText:
        if (varVal === null) {
          varVal = ''
        }
        break
      case CONST.vtTF:
        if (typeof varVal !== 'boolean') {
          varVal = undefined
        }
        break
    }

    // Reset all values or set new single value
    if (varIndex === 0 && varVal === null) {
      canReflect.setKeyValue(varAnswerModel, 'values', [null])
    } else if (varIndex === 0) { // don't overwrite 0th value of null
      canReflect.setKeyValue(varAnswerModel.values, 1, varVal)
    } else {
      canReflect.setKeyValue(varAnswerModel.values, varIndex, varVal)
    }

    this.bumpRevision()

    // courtesy return for tests
    return varAnswerModel
  },

  bumpRevision () {
    this.revision += 1
  },

  bindAnswer (answer) {
    if (!answer || typeof answer !== 'object') {
      return
    }

    const bump = () => this.bumpRevision()

    onPatches(answer, (patches) => {
      patches.forEach((patch) => {
        if (patch.key === 'values' && patch.value) {
          onPatches(patch.value, bump)
        }
      })
      bump()
    })

    if (answer.values) {
      onPatches(answer.values, bump)
    }
  },

  init () {
    const bindAndBump = (patches) => {
      let shouldBump = false
      patches.forEach((patch) => {
        if (skipRevisionKeys[patch.key]) {
          return
        }
        shouldBump = true
        const value = patch.value !== undefined ? patch.value : this[patch.key]
        this.bindAnswer(value)
      })
      if (shouldBump) {
        this.bumpRevision()
      }
    }

    onPatches(this, bindAndBump)

    canReflect.eachKey(this, (value, key) => {
      if (skipRevisionKeys[key]) {
        return
      }
      this.bindAnswer(value)
    })
  }
})
