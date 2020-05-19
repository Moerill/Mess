(window.webpackJsonp=window.webpackJsonp||[]).push([["add-scrolling"],{"./src/scripts/add-scrolling.js":
/*!**************************************!*\
  !*** ./src/scripts/add-scrolling.js ***!
  \**************************************/
/*! exports provided: default */function(e,t,r){"use strict";async function n(){Hooks.on("renderActorSheet",(async function(e,t,r){t[0].querySelectorAll('input[data-dtype="Number"], .item-uses input').forEach(e=>{e.addEventListener("wheel",e=>{e.preventDefault(),e.stopPropagation(),e.deltaY<0&&(e.currentTarget.value=Number(e.currentTarget.value)+1),e.deltaY>0&&(e.currentTarget.value=Math.max(Number(e.currentTarget.value)-1,0)),$(e.currentTarget).change()})})}))}r.r(t),r.d(t,"default",(function(){return n}))}}]);
//# sourceMappingURL=add-scrolling.1c30.js.map