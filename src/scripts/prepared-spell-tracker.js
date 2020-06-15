export default async function addPreparedSpellTracker() {
	Hooks.on('renderActorSheet', async function (app,  html, data) {
		const actor = await fromUuid(`Actor.${data.actor._id}`);
		if (actor.isNPC) return;
		
		const spellDc = html[0].querySelector('.spell-dc');
		if (!spellDc) return;
		let tracker = document.createElement('div');
		tracker.classList.add('spell-detail');
		tracker.classList.add('spell-slots');
		tracker.style.flex = '1';
		tracker.style.border = 'none';
		const spanPrep = tracker.appendChild(document.createElement('span'));
		spanPrep.innerText = `${game.i18n.localize('MESS.actorSheet.preparedSpellTracker')}: ${data.preparedSpells}`;

		const sep = tracker.appendChild(document.createElement('span'));
		sep.innerText = ' / ';
		sep.classList.add('sep');

		const max = tracker.appendChild(document.createElement('input'));
		max.type = 'text';
		max.value = actor.getFlag('mess', 'maxPreparedSpells') || 0;
		max.addEventListener('change', async function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			const val = Number(ev.currentTarget.value);
			if (isNaN(val)) {
				ev.currentTarget.value = actor.getFlag('mess', 'maxPreparedSpells') || 0;
				return false;
			}

			actor.setFlag('mess', 'maxPreparedSpells', val);
			return false;
		});
		
		if (app.constructor.name === 'Tidy5eSheet') {
			const el = html[0].querySelector('.spellcasting-ability');
			el.appendChild(tracker, el);
		} else {
			const el = html[0].querySelector('.spellbook .inventory-list');
			tracker.style.flex = '0';
			tracker.style.alignSelf = 'flex-start';
			tracker.style.margin = '0 8px';
			el.parentNode.insertBefore(tracker, el);
		}
	});
}