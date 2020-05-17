async function sortItemListAlphabetically(lists, actorId) {
	const actor = await fromUuid(`Actor.${actorId}`);
	let concatList = lists.map(e => e.items || e.spells).flat();
	concatList.sort(function (a, b) {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;
		return 0;
	});
	let siblings = [concatList.shift()];
	let sortUpdates = [];
	for (; concatList.length > 0; siblings.push(concatList.shift())) {
		sortUpdates = (SortingHelpers.performIntegerSort(concatList[0], {
			target: siblings[siblings.length-1], 
			siblings: duplicate(siblings),
			sortBefore: false}));		
	}
	const updateData = sortUpdates.map(u => {
		let update = u.update;
		update._id = u.target._id;
		return update;
	})
	actor.updateEmbeddedEntity('OwnedItem', updateData);
}

async function addAlphabeticalSorter(app, html, data) {
	if (!data.actor._id) return;
	const header = html.querySelectorAll('.filter-list');

	header.forEach(el => {
		const type = el.closest('.tab').dataset.tab;
		const btn = document.createElement('a');
		btn.innerHTML = '<i class="fas fa-sort"></i>';
		btn.classList.add('mess-sort-btn');
		btn.title = `Sort ${type} alphabetically.`;
		btn.style.flex = 0;
		btn.style.margin = "0 5px 0 0";
		btn.addEventListener('click',	(ev) => sortItemListAlphabetically(data[type], data.actor._id))
		el.prepend(btn);
	});
}

export default async function itemSortBtn() {
	Hooks.on('renderActorSheet', (app, html, data) => {
		addAlphabeticalSorter(app, html[0], data);
	});
}