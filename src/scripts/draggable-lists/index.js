import {DraggableList} from './draggable-list';

export function initDraggableLists() {
   // make sure my listeners to get bound _before_ the class owns get bound to the elements
  // Only needed for the "root" directory though.. :/
  const oldFun = SidebarDirectory.prototype.activateListeners;
  SidebarDirectory.prototype.activateListeners = function(html) {
    const list = html[0].querySelectorAll('.directory-list, .subdirectory');
    list.forEach(e => new DraggableList(e, '.entity'));
    oldFun.call(this, html);
  }

  // this does work, since on default most sheets have their drop function bound to the form, not the item list!
  Hooks.on('renderActorSheet', (app, html, options) => {
    const list = html[0].querySelectorAll('.item-list');
    list.forEach(e => new DraggableList(e, '.item'));
  });
}