export default async function addPreparedSpellTracker() {
	Hooks.on('renderActorSheet', async function (app,  html, data) {
		const actor = await fromUuid(`Actor.${data.actor._id}`);
		const spellDc = html[0].querySelector('.spell-dc');
		if (!spellDc) return;
		let tracker = document.createElement('div');
		tracker.classList.add('spell-slots');
		tracker.style.flex = '1';
		tracker.style.border = 'none';
		const spanPrep = tracker.appendChild(document.createElement('span'));
		spanPrep.innerText = `prepared spells: ${data.preparedSpells}`;
		spanPrep.classList.add('spell-max');

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
		spellDc.parentNode.insertBefore(tracker, spellDc);
	});
}