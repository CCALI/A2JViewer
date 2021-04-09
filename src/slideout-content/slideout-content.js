import DefineMap from 'can-define/map/map'
// import CanList from 'can-list'
// import DefineList from 'can-define/list/list'
import Component from 'can-component'
import template from './slideout-content.stache'

/**
 * @property {DefineMap} debugPanel.ViewModel
 * @parent <slideout-content>
 *
 * `<slideout-content>`'s viewModel.
 */
export let SlideoutContentVM = DefineMap.extend('SlideoutContentVM', {
  appState: {}
})

export default Component.extend({
  view: template,
  ViewModel: SlideoutContentVM,
  tag: 'slideout-content'
})