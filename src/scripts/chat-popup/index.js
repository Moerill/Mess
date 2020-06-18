export function initChatPopUp() {
	Hooks.on('renderChatMessage', (app, html, options) => {
		if (document.getElementById('chat').classList.contains('active')) return;


		console.log('rendering chat message');
		console.log(app, html, options);
		console.log(document.getElementById('chat').classList.contains('active'))
	});

	const hud = document.getElementById('hud');

	let popupDiv = hud.appendChild(document.createElement('div'));
	popupDiv.classList.add('mess-chat-popup')
}