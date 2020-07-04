function getAllDmg(li) {
	const results = Array.from(li[0].parentNode.querySelectorAll('.mess-dice-result:not(.mess-versatile')).map(e => Number(e.querySelector('span').innerText));
	return results.reduce((a, b) => a + b, 0);
}

function getAllVersatile(li) {
	const resultArray = Array.from(li[0].parentNode.querySelectorAll('.mess-dice-result'));
	if (resultArray.length > 1 && resultArray[1].classList.contains('mess-versatile'))
		resultArray.splice(0,1)
	const results = resultArray.map(e => Number(e.querySelector('span').innerText));
	return results.reduce((a, b) => a + b, 0);
}

export default function modifyApplyDmg() {
	const canApply = (li) => true || canvas.tokens.controlled.length;
	const canApplyNonVersatile = (li) => canApply(li) && li[0].parentNode.querySelector('.mess-dice-result:not(.mess-versatile)');
	const canApplyVersatile = (li) => canApply(li) && li[0].parentNode.querySelector('.mess-versatile');
	const hasTarget = (li) => !!li[0].closest('.mess-attack-card').dataset.targetId;
	const hasNoTarget = (li) => !hasTarget(li);
	const contextOptionsDmg = [
		{
			name: game.i18n.localize("MESS.attackCard.contextMenu.applyTarget"),
			condition: hasTarget
		},
		{
			name: game.i18n.localize("MESS.attackCard.contextMenu.applySelected"),
			condition: hasNoTarget
		},
		{
			name: game.i18n.localize("MESS.attackCard.contextMenu.dmg"),
			condition: canApplyNonVersatile,
			icon: '<i class="fas fa-user-injured"></i>'
		},
		{
			name: 'full',
			icon: '',
			condition: canApplyNonVersatile,
			callback: (target, li) => applyDamage(li, 1),
			content: (li) => `<span>${getAllDmg(li)}</span><label>${game.i18n.localize("MESS.attackCard.contextMenu.full")}</label>`
		},
		{
			name: 'half',
			icon: '',
			condition: canApplyNonVersatile,
			callback: (target, li) => applyDamage(li, 1),
			content: (li) => `<span>${Math.max(Math.floor(getAllDmg(li) * 0.5), 1)}</span><label>${game.i18n.localize("MESS.attackCard.contextMenu.half")}</label>`
		},
		{
			name: 'double',
			icon: '',
			condition: canApplyNonVersatile,
			callback: (target, li) => applyDamage(li, 1),
			content: (li) => `<span>${Math.floor(getAllDmg(li) * 2)}</span><label>${game.i18n.localize("MESS.attackCard.contextMenu.double")}</label>`
		},
		{
			name: game.i18n.localize("MESS.attackCard.contextMenu.healing"),
			condition: canApplyNonVersatile,
			icon: '<i class="fas fa-prescription-bottle-alt"></i>'
		},
		{
			name: 'full',
			icon: '',
			condition: canApplyNonVersatile,
			callback: (target, li) => applyDamage(li, -1),
			content: (li) => `<span>${getAllDmg(li)}</span><label>${game.i18n.localize("MESS.attackCard.contextMenu.full")}</label>`
		},
		{
			name: [game.i18n.localize('DND5E.Versatile'), ' - ', game.i18n.localize("MESS.attackCard.contextMenu.dmg")],
			condition: canApplyVersatile,
			icon: '<i class="fas fa-user-injured"></i>'
		},
		{
			name: 'full',
			icon: '',
			condition: canApplyVersatile,
			callback: (target, li) => applyDamage(li, 1),
			content: (li) => `<span>${getAllVersatile(li)}</span><label>${game.i18n.localize("MESS.attackCard.contextMenu.full")}</label>`
		},
		{
			name: 'half',
			icon: '',
			condition: canApplyVersatile,
			callback: (target, li) => applyDamage(li, 1),
			content: (li) => `<span>${Math.max(Math.floor(getAllVersatile(li) * 0.5), 1)}</span><label>${game.i18n.localize("MESS.attackCard.contextMenu.half")}</label>`
		},
		{
			name: 'double',
			icon: '',
			condition: canApplyVersatile,
			callback: (target, li) => applyDamage(li, 1),
			content: (li) => `<span>${Math.floor(getAllVersatile(li) * 2)}</span><label>${game.i18n.localize("MESS.attackCard.contextMenu.double")}</label>`
		},
		{
			name: [game.i18n.localize('DND5E.Versatile'), ' - ', game.i18n.localize("MESS.attackCard.contextMenu.healing")],
			condition: canApplyVersatile,
			icon: '<i class="fas fa-prescription-bottle-alt"></i>'
		},
		{
			name: 'full',
			icon: '',
			condition: canApplyVersatile,
			callback: (target, li) => applyDamage(li, -1),
			content: (li) => `<span>${getAllVersatile(li)}</span><label>${game.i18n.localize("MESS.attackCard.contextMenu.full")}</label>`
		}
	]


	const contextOptionsRoll = [
		{
			name: game.i18n.localize("MESS.attackCard.contextMenu.applyTarget"),
			condition: hasTarget
		},
		{
			name: game.i18n.localize("MESS.attackCard.contextMenu.applySelected"),
			condition: hasNoTarget
		},
		{
			name: game.i18n.localize("MESS.attackCard.contextMenu.dmg"),
			condition: canApply,
			icon: '<i class="fas fa-user-injured"></i>'
		},
		{
			name: 'full',
			icon: '',
			condition: canApply,
			callback: (target, li) => applyDamage(li, 1),
			content: (li) => `<span>${li[0].querySelector('span').innerText}</span><label>${game.i18n.localize("MESS.attackCard.contextMenu.full")}</label>`
		},
		{
			name: 'half',
			icon: '',
			condition: canApply,
			callback: (target, li) => applyDamage(li, 1),
			content: (li) => `<span>${Math.max(Math.floor(Number(li[0].querySelector('span').innerText) * 0.5), 1)}</span><label>${game.i18n.localize("MESS.attackCard.contextMenu.half")}</label>`
		},
		{
			name: 'double',
			icon: '',
			condition: canApply,
			callback: (target, li) => applyDamage(li, 1),
			content: (li) => `<span>${Math.floor(Number(li[0].querySelector('span').innerText) * 2)}</span><label>${game.i18n.localize("MESS.attackCard.contextMenu.double")}</label>`
		},
		{
			name: game.i18n.localize("MESS.attackCard.contextMenu.healing"),
			condition: canApply,
			icon: '<i class="fas fa-prescription-bottle-alt"></i>'
		},
		{
			name: 'full',
			icon: '',
			condition: canApply,
			callback: (target, li) => applyDamage(li, -1),
			content: (li) => `<span>${li[0].querySelector('span').innerText}</span>`
		}
	]


	ContextMenu.prototype.bind = Function('"use strict"; return  ( function ' + ContextMenu.prototype.bind.toString().replace(/this\.render\(parent\)/,`this.render(parent, event)`) + ')')();

	Hooks.on('renderChatLog', (app, html, options) => {
		new MessContextMenu(html.find('#chat-log'), ".mess-chat-dmg .mess-dice-result", contextOptionsRoll);
		new MessContextMenu(html.find('#chat-log'), ".mess-chat-dmg .mess-chat-roll-type", contextOptionsDmg);
	})

	Hooks.on('getChatLogEntryContext', function (html, options) {
		setProperty(game, 'mess.chatLogEntryContextOptions', options);
		
		// Modify existing applies to only work on default rolls and not mess-rolls
		const canApply = li => canvas.tokens.controlled.length 
												&& li.find(".dice-roll .dice-result").length;
		for (let i = 1; i < options.length; i++) 
			options[i].condition = canApply;
	});
}

class MessContextMenu extends ContextMenu {
	constructor(...args) {
		super(...args);

		this._menuItems = this.menuItems;
	}

	render(target, event) {
		const filteredItems = this._menuItems.filter(item => {
			if (!item.condition) return true;
			if (!(item.condition instanceof Function)) return item.condition;
			return item.condition(target);
		})

		if (filteredItems.length) event.stopPropagation();
		else return;
		this.menuItems = filteredItems.map(e => {
			if (e.content)
				e.name = e.content(target);
			return e;
		});

    let html = $("#context-menu").length ? $("#context-menu") : $('<nav id="context-menu"></nav>');
    let ol = $('<ol class="context-items"></ol>');
    html.html(ol);

		const frag = document.createDocumentFragment();
		for (let item of this.menuItems) {
			const li = document.createElement('li')
			
			if (item.name instanceof Array)
				item.name = item.name.map(e => game.i18n.localize(e)).join("");

			if (item.icon)
				li.innerHTML = `${item.icon}${game.i18n.localize(item.name)}`;
			else
				li.innerHTML = game.i18n.localize(item.name);

			if (item.callback) {
				li.addEventListener('click',  ev => {
					ev.preventDefault();
					ev.stopPropagation();
					item.callback(target, li);
					this.close();
				});
				li.classList.add('context-item');
			} else
				li.classList.add('mess-context-menu-header');

			frag.appendChild(li);
		}

		ol[0].appendChild(frag);

    // Append to target
    this._setPosition(html, target);

    // Animate open the menu
    return this._animateOpen(html);
	}

	_setPosition(html, target) {
		html.removeClass("expand-up expand-down");
		super._setPosition(html, target);
	}
}

async function applyDamage(target, sign) {
	const amount = Number(target.querySelector('span').innerText);
	const card = target.closest('.mess-attack-card')
	const targetId = card.dataset.targetId
	if (targetId) {
		const sceneId = card.dataset.sceneId;
		const scene = game.scenes.get(sceneId);
		if (!scene) {
			ui.notifications.error(game.i18n.localize("MESS.attackCard.applyDamage.sceneNotFound"));
			return;
		}
		const token = new Token(scene.getEmbeddedEntity("Token", targetId));
		if (!token) {
			ui.notifications.error(game.i18n.localize("MESS.attackCard.applyDamage.targetNotFound"));
			return;
		}
		if (!token.owner) {
			ui.notifications.error(game.i18n.localize("MESS.attackCard.applyDamage.targetNotOwner"));
			return;
		}
		const actor = token.actor;
		actor.applyDamage(amount, sign);
	} else {
		const tokens = canvas.tokens.controlled;
		if (!tokens.length) {
			ui.notifications.error(game.i18n.localize('MESS.attackCard.contextMenu.error'));
			return;
		}
		
		for (const token of tokens) {
			const a = token.actor;
			a.applyDamage(amount, sign);
		}
	}
}