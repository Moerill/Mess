import {DraggableList} from './draggable-list';

export function initDraggableLists() {
   // make sure my listeners to get bound _before_ the class owns get bound to the elements
  // Only needed for the "root" directory though.. :/
  const oldFun = SidebarDirectory.prototype.activateListeners;
  SidebarDirectory.prototype.activateListeners = function(html) {
    // const list = html[0].querySelectorAll('.directory-list, .directory-item');
    // list.forEach(e => new DraggableList(e, '.entity'));
    const list = html[0].querySelector('.directory-list');
    new DraggableList(list, '.entity, .folder', {dir: '.folder'});
    oldFun.call(this, html);
  }

  // this does work, since on default most sheets have their drop function bound to the form, not the item list!
  Hooks.on('renderActorSheet', (app, html, options) => {
    const list = html[0].querySelectorAll('.item-list');
    list.forEach(e => new DraggableList(e, '.item'));
  });

  SceneDirectory.prototype._onLazyLoadImage = function(entries, observer) {
    for ( let e of entries ) {
      if ( !e.isIntersecting ) continue;
      const li = e.target;

      // Background Image
      if ( li.dataset.backgroundImage ) {
        li.children[0].style["background-image"] = `url("${li.dataset.backgroundImage}")`;
        delete li.dataset.backgroundImage;
      }

      // Avatar image
      const img = li.querySelector("img");
      if ( img && img.dataset.src ) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }

      // No longer observe the target
      observer.unobserve(e.target);
    }
  }
}