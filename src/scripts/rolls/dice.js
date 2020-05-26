function getD20Modifier() {
	return document.getElementById('mess-roll-mod').value;
}

function getAdvantageSettings() {
	return game.settings.get('mess', `${game.userId}.adv-selector`);
}

export async function rollD20(data) {
	let adv = getAdvantageSettings();
	// Determine the d20 roll and modifiers
	let nd = 1;
	let mods = data.halflingLucky ? "r=1" : "";

	// Handle advantage
	if ( adv === "advantage" ) {
		nd = data.elvenAccuracy ? 3 : 2;
		mods += "kh";
		data.title += ` (${game.i18n.localize("DND5E.Advantage")})`;
	}

	// Handle disadvantage
	else if ( adv === "disadvantage" ) {
		nd = 2;
		mods += "kl";
		data.title += ` (${game.i18n.localize("DND5E.Disadvantage")})`;
	}

	// Include the d20 roll
	let diceFormula = `${nd}d20${mods}`;
	if (data.reliableTalent) diceFormula = `{${nd}d20${mods},10}kh`;
	data.parts.unshift(diceFormula);

	const d20Mod = getD20Modifier();
	if (d20Mod)
		data.parts.push(d20Mod);
	
	let r = new Roll(data.parts.join('+'), data);
	r.roll();
	const d20 = r.parts[0].total;
	let templateData = {...data, 
		tooltip: await r.getTooltip(),
		roll: r,
		crit:  d20 >= 20,
		fumble: d20 <= 1
	}

	const template = await renderTemplate('modules/mess/templates/roll-card.html', templateData);

	let chatData = {
		user: game.user._id,
		type: CONST.CHAT_MESSAGE_TYPES.OTHER,
		content: template,
		speaker: {
			actor: this,
			alias: this.name
		}
	};
	let rollMode = game.settings.get("core", "rollMode");
	if ( ["gmroll", "blindroll"].includes(rollMode) ) chatData["whisper"] = ChatMessage.getWhisperIDs("GM");
	if ( rollMode === "blindroll" ) chatData["blind"] = true;

	ChatMessage.create(chatData);
}

/**
 * Extracts the data needed for an attack roll.
 * @param {ActorEntity} actor
 * @param {ItemEntity} item 
 */
export async function getToHitData({actor, item}) {
	if (!item.hasAttack) return null;
	const actorData = actor.data.data;
	const itemData = item.data.data;
	const flags = actor.data.flags.dnd5e || {};
	
	let rollData = item.getRollData();

	// Define Roll bonuses
	const parts = [`@mod`];
	if ( (item.data.type !== "weapon") || itemData.proficient ) {
		parts.push("@prof");
	}
	rollData.parts = parts;

	// Expanded weapon critical threshold
	if (( item.data.type === "weapon" ) && flags.weaponCriticalThreshold) {
		rollData.critical = parseInt(flags.weaponCriticalThreshold);
	}

	// Elven Accuracy
	if ( ["weapon", "spell"].includes(item.data.type) ) {
		if (flags.elvenAccuracy && ["dex", "int", "wis", "cha"].includes(item.abilityMod)) {
			rollData.elvenAccuracy = true;
		}
	}

	// Apply Halfling Lucky
	if ( flags.halflingLucky ) rollData.halflingLucky = true;

	// Attack Bonus
	const actorBonus = actorData.bonuses[itemData.actionType] || {};
	if ( itemData.attackBonus || actorBonus.attack ) {
		// parts.push("@atk");
		rollData["atk"] = [itemData.attackBonus, actorBonus.attack].filterJoin(" + ");
		if (!isNaN(Number(rollData["atk"]))) {
			parts.push("@atk");
		}
	}

	let roll = new Roll(rollData.parts.join('+'), rollData);
	rollData.totalModifier = roll._safeEval(roll.formula);
	rollData.totalModifier = rollData.totalModifier >= 0 ? '+' + rollData.totalModifier : rollData.totalModifier;
	if (rollData["atk"] && !roll._formula.includes('@atk')) {
		rollData.parts.push("@atk");
		roll = new Roll(rollData.parts.join('+'), rollData);
		rollData.totalModifier += `+${rollData["atk"]}`;
	}

	const situationalModifier = getD20Modifier();
	if (situationalModifier) {
		rollData.parts.push(situationalModifier);
		roll = new Roll(rollData.parts.join('+'), rollData);
		rollData.totalModifier += `+${situationalModifier}`;
	}
	rollData.formula = roll.formula;
	rollData.terms = roll._formula;
	return rollData;
}

/**
 * Rolls the to hit roll and updates the html target. Also updates the message if found.
 * @param {Click Event} ev event targetting the button which initiated a real or virtual click event
 */
export async function rollToHit(ev) {
	// Extract card data
	const button = ev.currentTarget;
	button.disabled = true;
	const card = button.closest(".chat-card");
	const messageId = card.closest(".message").dataset.messageId;
	// Check if user owns chat message, else return
	if (messageId) {
		const message = game.messages.get(messageId);
		if (!(message.owner || message.isAuthor)) {
			ui.notifications.error('You do not own the permissions to make that roll!');
			return;
		}
	}
	// Get the Actor from a synthetic Token
	const actor = CONFIG.Item.entityClass._getChatCardActor(card);
	if (!actor.owner) return false;

	// Get the Item
	const item = actor.getOwnedItem(card.dataset.itemId);
	if ( !item ) {
		return ui.notifications.error(`The requested item ${card.dataset.itemId} no longer exists on Actor ${actor.name}`)
	}

	let rollData = await getToHitData({actor, item});
	let adv = getAdvantageSettings();
	// Determine the d20 roll and modifiers
	let nd = 1;
	let mods = rollData.halflingLucky ? "r=1" : "";

	// Handle advantage
	if ( adv === "advantage" ) {
		nd = rollData.elvenAccuracy ? 3 : 2;
		mods += "kh";
	}

	// Handle disadvantage
	else if ( adv === "disadvantage" ) {
		nd = 2;
		mods += "kl";
	}

	// Include the d20 roll
	rollData.parts.unshift(`${nd}d20${mods}`);
	
	let r = new Roll(rollData.parts.join('+'), rollData);
	r.roll();
	let div = document.createElement('div');
	div.title = `${rollData.parts[0]}+${rollData.terms} = ${r.formula} = ${r.total}. Click to see rolls.`;
	div.classList.add('dice-roll');
	div.classList.add('mess-dice-result');
	const span = div.appendChild(document.createElement('span'));
	span.innerText = r.total;
	div.insertAdjacentHTML('beforeend', await r.getTooltip());
	const tooltip = div.childNodes[1];
	tooltip.classList.add('hidden');
	const crit = rollData.critical || 20;
	const fumble = rollData.fumble || 1;

	const d20 = r.parts[0].total;
	if (d20 >= crit) {
		span.classList.add('crit');
		card.querySelector('.mess-chat-dmg .mess-chat-roll-type').innerHTML += ' - Crit!'
		card.querySelectorAll('.mess-button-dmg').forEach((e, idx) => {
			const formula = e.dataset.formula;
			const r = new Roll(formula);
			r.alter(0, 2);
			e.innerHTML = `<i class="fas fa-dice-d20"></i> ${r.formula}`
			e.dataset.formula = r.formula;
		});
	}
	if (d20 <= fumble)
		span.classList.add('fumble');

	ev.currentTarget.parentNode.replaceChild(div, ev.currentTarget);
	if (messageId) {
		const message = game.messages.get(messageId);
		message.update({content: card.parentNode.innerHTML});
	}
}

export async function getDmgData({actor, item, spellLevel = null}) {
	if (!item.hasDamage) return null;
	const actorData = actor.data.data;
	const itemData = item.data.data;
	let rollData = item.getRollData();
	
	if ( spellLevel ) rollData.item.level = spellLevel;

	rollData.parts = duplicate(itemData.damage.parts);
	if (itemData.damage.versatile) 
		rollData.parts.splice(1, 0, [itemData.damage.versatile, "versatile"]);
	
	if (item.data.type === 'spell') {
		if (itemData.scaling.mode === 'cantrip') {
			let newDmgPart = [rollData.parts[0][0]];
			const lvl = actor.data.type === 'character' ? actorData.details.level : actorData.details.spellLevel;
			item._scaleCantripDamage(newDmgPart, lvl, itemData.scaling.formula);
			rollData.parts[0][0] = newDmgPart[0];
		} else if (spellLevel && (itemData.scaling.mode === 'level') && itemData.scaling.formula ) {
			let newDmgPart = [];
			item._scaleSpellDamage(newDmgPart, itemData.level, spellLevel, itemData.scaling.formula)
			if (newDmgPart.length > 0) {
				newDmgPart.push('upcast dice');
				rollData.parts.push(newDmgPart);
			}
		}
	}
	
	const actorBonus = actorData.bonuses[itemData.actionType] || {};
	if (actorBonus.damage && parseInt(actorBonus.damage ) !== 0) {
		parts[0][0] += "+@dmg";
		rollData["dmg"] = actorBonus.damage;
	}

	for (let part of rollData.parts) {
		let roll = new Roll(part[0], rollData);
		const dmgType = CONFIG.DND5E.damageTypes[part[1]];
		if (dmgType)
			part[1] = game.i18n.localize('DND5E.Damage' + CONFIG.DND5E.damageTypes[part[1]]);
		else if (part[1] === 'versatile')
			part[1] = game.i18n.localize('DND5E.Versatile');
		part.push(roll.formula);
	}

	return rollData;
}

/**
 * Rolls the dmg dice listed. If the event points towards an existing message the message will get updated
 * @param {Event} ev 
 */
export async function rollDmg(ev) {
	// Extract card data
	const button = ev.currentTarget;
	button.disabled = true;
	const card = button.closest(".chat-card");
	const messageId = card.closest(".message").dataset.messageId;

	// Check if user owns chat message, else return
	if (messageId) {
		const message = game.messages.get(messageId);
		if (!(message.owner || message.isAuthor)) {
			ui.notifications.error('You do not own the permissions to make that roll!');
			return;
		}
	}
	const formula = button.dataset.formula;

	let r = new Roll(formula);
	r.roll();
	let div = document.createElement('div');
	div.title = `${button.dataset.terms} = ${r.formula} = ${r.total}. Click to see rolls.`;
	div.classList.add('dice-roll');
	div.classList.add('mess-dice-result');
	const span = div.appendChild(document.createElement('span'));
	span.innerText = r.total;
	div.insertAdjacentHTML('beforeend', await r.getTooltip());
	const tooltip = div.childNodes[1];
	tooltip.classList.add('hidden');

	ev.currentTarget.parentNode.replaceChild(div, ev.currentTarget);

	if (messageId) {
		const message = game.messages.get(messageId);
		message.update({content: card.parentNode.innerHTML});
	}
}