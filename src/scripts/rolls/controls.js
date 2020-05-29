export default function() {

	Hooks.on('renderChatLog', chatLogHook);

	registerSettings();
};

function registerSettings() {
	game.settings.register('mess', `${game.userId}.adv-selector`, {
		name: 'Mess - Advantage Selector',
		default: 'normal',
		type: String,
		scope: 'user'
	});
	game.settings.register('mess', `${game.userId}.autoroll-selector`, {
		name: 'Mess - Autoroll Selector',
		default: {hit: false, dmg: false},
		type: Object,
		scope: 'user'
	});
}

async function chatLogHook(app, html, data) {
	html[0].classList.add('mess');
	const div = document.createElement('div');
	div.classList.add('mess-roll-control');

	const advSelector = game.settings.get('mess', `${game.userId}.adv-selector`);
	const autoRollSelector = game.settings.get('mess', `${game.userId}.autoroll-selector`);
	const templateData = {
		advantage: advSelector === 'advantage',
		normal: advSelector ===  'normal',
		disadvantage: advSelector ===  'disadvantage',
		...autoRollSelector
	}

	div.insertAdjacentHTML('afterbegin', await renderTemplate('modules/mess/templates/roll-control.html', templateData));

	div.querySelectorAll('.mess-adv-selector a').forEach(e => {
		e.addEventListener('click', async function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			const arr = Array.from(ev.currentTarget.parentNode.querySelectorAll('a'));
			const currIdx = arr.findIndex(e => e.classList.contains('mess-selected'));
			arr[currIdx].classList.remove('mess-selected');
			const newSelected = arr[(currIdx + 1) % arr.length];
			newSelected.classList.add('mess-selected');
			game.settings.set('mess', `${game.userId}.adv-selector`, newSelected.name);
		});
		// Toggle in the opposite direction with right click
		e.addEventListener('contextmenu', async function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			const arr = Array.from(ev.currentTarget.parentNode.querySelectorAll('a'));
			const currIdx = arr.findIndex(e => e.classList.contains('mess-selected'));
			arr[currIdx].classList.remove('mess-selected');
			const newSelected = arr[(currIdx + arr.length - 1) % arr.length]; // add length cause javascripts modulo is strange
			newSelected.classList.add('mess-selected');
			game.settings.set('mess', `${game.userId}.adv-selector`, newSelected.name);
		})
	});
	div.querySelectorAll('.mess-autoroll-selector a') .forEach(e => {
		e.addEventListener('click', async function(ev) {
			ev.preventDefault();
			ev.stopPropagation();

			
			ev.currentTarget.classList.toggle('mess-selected');
			let data = game.settings.get('mess', `${game.userId}.autoroll-selector`);
			data[ev.currentTarget.name] = ev.currentTarget.classList.contains('mess-selected');
			game.settings.set('mess', `${game.userId}.autoroll-selector`, data);
		})
	});

	const controls = document.getElementById('chat-controls');
	controls.insertBefore(div, controls.childNodes[0]);
}