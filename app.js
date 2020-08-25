import deparam from 'can-deparam'
import route from 'can-route'
import startApp from './start-app'
import config from '~/src/config/'
import _isEmpty from 'lodash/isEmpty'
import _assign from 'lodash/assign'
import AppState from '~/src/models/app-state'
import Interview from '~/src/models/interview'
import MemoryState from '~/src/models/memory-state'
import PersistedState from '~/src/models/persisted-state'

import 'can-3-4-compat/dom-mutation-events'

import '~/src/mobile/util/helpers'
import '~/src/calculator/jquery.plugin'
import '~/src/calculator/jquery.calculator'
import '~/src/calculator/jquery.calculator.css'

// State attrs not needing persistance, such as showing/hiding the table of contents.
// Load configuration from desktop into mobile
const qsParams = deparam(window.location.search.substring(1))
const mState = new MemoryState(_isEmpty(qsParams)
  ? config
  : _assign({}, config, qsParams))

// AJAX request for interview json
const interviewPromise = Interview.findOne({
  url: mState.attr('templateURL'),
  resume: mState.attr('getDataURL')
})

// Local storage request for any existing answers
const persistedStatePromise = PersistedState.findOne()

// Route state
const rState = new AppState()
rState.connectedCallback(document.body)

route.register('view/{view}/page/{page}')
route.register('view/{view}/page/{page}/{repeatVarValue}')
route.register('view/{view}/page/{page}/{repeatVarValue}/{outerLoopVarValue}')
route.data = rState

Promise.all([interviewPromise, persistedStatePromise])
  .then(function ([interview, pState]) {
    startApp({ interview, pState, mState, rState })
  })
