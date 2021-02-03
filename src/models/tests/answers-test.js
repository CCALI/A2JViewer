import { assert } from 'chai'
import Answers from '~/src/models/answers'

import 'steal-mocha'

describe('Answers Model', function () {
  let answers
  beforeEach(() => {
    answers = new Answers()
  })

  afterEach(() => {
    answers = null
  })

  it('varExists and varCreate', function () {
    let varExists = answers.varExists('foo')
    assert.equal(varExists, null, 'should return null if var does not exist')

    let answerModel = answers.varCreate('foo', 'text', false)
    varExists = answers.varExists('foo')
    assert.deepEqual(varExists.serialize(), answerModel.serialize(), 'should return the answerModel if it exists')

    answerModel = answers.varCreate('bar', 'text', false)
    varExists = answers.varExists('bar')
    assert.deepEqual(varExists.serialize(), answerModel.serialize(), 'handles repeated varCreate calls')
  })
  it('does not set TF vars to non boolean values', function () {
    answers.varCreate('gotMilk', 'TF', 'false')

    answers.varSet('gotMilk', 'maximus', 1)
    assert.equal(answers.varGet('gotMilk', 1), undefined, 'should return undefined for no boolean types')
    answers.varSet('gotMilk', null, 1)
    assert.equal(answers.varGet('gotMilk', 1), undefined, 'should return undefined when nulled out')
  })

  it('should set proper boolean values for TF vars', function () {
    answers.varCreate('gotMilk', 'TF', 'false')

    answers.varSet('gotMilk', true, 1)
    assert.equal(answers.varGet('gotMilk', 1), true, 'did not set to boolean true')
    answers.varSet('gotMilk', false, 1)
    assert.equal(answers.varGet('gotMilk', 1), false, 'did not set to boolean false')
  })

  it('should get boolean values for TF vars', function () {
    answers.varCreate('gotMilk', 'TF', 'false')
    assert.equal(answers.varGet('gotMilk', 1), undefined, 'new TF vars should be set to undefined')

    answers.gotmilk.values.push('true')
    assert.equal(answers.varGet('gotMilk', 1), true, 'should cast legacy string values to boolean')
  })

  it('handles zero and falsy values for number types', function () {
    answers.varCreate('numberFest', 'number', 'false')
    assert.equal(answers.varGet('numberFest', 1), undefined, 'should get undefined when unanswered')

    answers.varSet('numberFest', 0, 1)
    assert.equal(answers.varGet('numberFest', 1), 0, 'should get 0 when value is 0')

    answers.varSet('numberFest', null, 1)
    assert.equal(answers.varGet('numberFest', 1), null, 'should get null as when number cleared by logic')
  })
})
