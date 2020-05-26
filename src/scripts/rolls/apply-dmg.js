export default function modifyApplyDmg() {
	Hooks.on('getChatLogEntryContext', function (html, options) {
		setProperty(game, 'mess.chatLogEntryContextOptions', options);
		
		// Modify existing applies to only work on default rolls and not mess-rolls
		const canApply = li => canvas.tokens.controlled.length 
												&& li.find(".dice-roll .dice-result").length;
		for (let i = 1; i < options.length; i++) 
			options[i].condition = canApply;
	});
}