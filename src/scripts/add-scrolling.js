export default async function addScolling() {
	Hooks.on('renderActorSheet', async function (app,  html, data) {
		html[0].querySelectorAll('input[data-dtype="Number"], .item-uses input').forEach(el => {
			el.addEventListener('wheel', ev => {
				ev.preventDefault();
				ev.stopPropagation();
				if (ev.deltaY < 0)
					ev.currentTarget.value = Number(ev.currentTarget.value) + 1;
				if (ev.deltaY > 0)
					ev.currentTarget.value = Math.max(Number(ev.currentTarget.value) - 1, 0);

				$(ev.currentTarget).change()
			});
		})
	});
}