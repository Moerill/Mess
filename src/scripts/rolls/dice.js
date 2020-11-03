import { getTargetToken, hasTarget } from './util.js';

/**
 * All the functions provided here are heavily based on Foundrys DnD5e system, authored by Atropos.
 * Original repository: https://gitlab.com/foundrynet/dnd5e
 * Original Author: Atropos
 * License: GNU GPLv3
 */

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
	let mods = data.halflingLucky ? 'r=1' : '';

	// Handle advantage
	if (adv === 'advantage') {
		nd = data.elvenAccuracy ? 3 : 2;
		mods += 'kh';
		data.title += ` (${game.i18n.localize('DND5E.Advantage')})`;
	}

	// Handle disadvantage
	else if (adv === 'disadvantage') {
		nd = 2;
		mods += 'kl';
		data.title += ` (${game.i18n.localize('DND5E.Disadvantage')})`;
	}

	// Include the d20 roll
	let diceFormula = `${nd}d20${mods}`;
	if (data.reliableTalent) diceFormula = `{${nd}d20${mods},10}kh`;
	data.parts.unshift(diceFormula);

	const d20Mod = getD20Modifier();
	if (d20Mod) data.parts.push(d20Mod);

	let r = new Roll(data.parts.join('+'), data);
	r.roll();
	const d20 = r.parts[0].total;
	let templateData = {
		...data,
		tooltip: await r.getTooltip(),
		roll: r,
		crit: d20 >= 20,
		fumble: d20 <= 1,
		isGM: game.user.isGM,
		showRolls: game.settings.get('mess', `${game.userId}.autoshow-selector`),
	};

	const template = await renderTemplate(
		'modules/mess/templates/roll-card.html',
		templateData
	);

	let chatData = {
		user: game.user._id,
		type: CONST.CHAT_MESSAGE_TYPES.OTHER,
		content: template,
		speaker: {
			actor: this,
			alias: this.name,
		},
	};
	let rollMode = game.settings.get('core', 'rollMode');
	if (['gmroll', 'blindroll'].includes(rollMode))
		chatData['whisper'] = ChatMessage.getWhisperIDs('GM');
	if (rollMode === 'blindroll') chatData['blind'] = true;
	const dsn = game.mess.diceSoNice;
	if (dsn) {
		let whispers = null;
		let blind = false;
		if (['gmroll', 'blindroll'].includes(rollMode))
			whispers = ChatMessage.getWhisperIDs('GM');
		if (rollMode === 'blindroll') blind = true;

		await game.dice3d.showForRoll(r, game.user, true, whispers, blind);
	}
	ChatMessage.create(chatData);
}

/**
 * Extracts the data needed for an attack roll.
 * @param {ActorEntity} actor
 * @param {ItemEntity} item
 */
export async function getToHitData({ actor, item }) {
	if (!item.hasAttack) return null;
	const actorData = actor.data.data;
	const itemData = item.data.data;
	const flags = actor.data.flags.dnd5e || {};

	let rollData = item.getRollData();

	// Define Roll bonuses
	const parts = [`@mod`];
	if (item.data.type !== 'weapon' || itemData.proficient) {
		parts.push('@prof');
	}
	rollData.parts = parts;

	// Expanded weapon critical threshold
	if (item.data.type === 'weapon' && flags.weaponCriticalThreshold) {
		rollData.critical = parseInt(flags.weaponCriticalThreshold);
	}

	// Elven Accuracy
	if (['weapon', 'spell'].includes(item.data.type)) {
		if (
			flags.elvenAccuracy &&
			['dex', 'int', 'wis', 'cha'].includes(item.abilityMod)
		) {
			rollData.elvenAccuracy = true;
		}
	}

	// Apply Halfling Lucky
	if (flags.halflingLucky) rollData.halflingLucky = true;

	// Attack Bonus
	const actorBonus = actorData.bonuses[itemData.actionType] || {};
	if (itemData.attackBonus || actorBonus.attack) {
		// parts.push("@atk");
		rollData['atk'] = [itemData.attackBonus, actorBonus.attack].filterJoin(
			' + '
		);
		
		if (!isNaN(Number(rollData['atk']))) {
			parts.push('@atk');
		}
	}

	let roll = new Roll(rollData.parts.join('+'), rollData);

	roll.roll(); // Simulate a roll to get the data "compiled"
	
	rollData.totalModifier = roll._safeEval(Roll.cleanFormula(roll.terms));
	rollData.totalModifier =
		rollData.totalModifier >= 0
			? '+' + rollData.totalModifier
			: rollData.totalModifier;
	// if (rollData['atk'] && !roll._formula.includes('@atk')) {
	// 	rollData.parts.push('@atk');
	// 	roll = new Roll(rollData.parts.join('+'), rollData);
	// 	rollData.totalModifier += `+(${rollData['atk']})`;
	// }

	const situationalModifier = getD20Modifier();
	if (situationalModifier) {
		rollData.parts.push(situationalModifier);
		roll = new Roll(rollData.parts.join('+'), rollData);
		rollData.totalModifier += `+(${situationalModifier})`;
	}
	// Check if the extra modifiers to have some kind of roll in them.. if no add them to the modifier
	try {
		const mod = roll._safeEval(Roll.cleanFormula(rollData.totalModifier));
		rollData.totalModifier = mod >= 0 ? '+' + mod : mod;
	} catch (e) {}

	rollData.totalModifier = rollData.totalModifier;
	rollData.formula = roll.formula;
	rollData.terms = Roll.cleanFormula(roll.terms);
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
	const card = button.closest('.chat-card');
	const messageId = card.closest('.message').dataset.messageId;
	// Check if user owns chat message, else return
	if (messageId) {
		ev.stopPropagation();
		ev.preventDefault();
		const message = game.messages.get(messageId);
		if (!(message.owner || message.isAuthor)) {
			ui.notifications.error(
				'You do not own the permissions to make that roll!'
			);
			return false;
		}
	}
	// Get the Actor from a synthetic Token
	const actor = CONFIG.Item.entityClass._getChatCardActor(card);
	if (!actor.owner) return false;

	// Get the Item
	const item = actor.getOwnedItem(card.dataset.itemId);
	if (!item) {
		return ui.notifications.error(
			`The requested item ${card.dataset.itemId} no longer exists on Actor ${actor.name}`
		);
	}

	let rollData = await getToHitData({ actor, item });
	

	let adv = getAdvantageSettings();
	// Determine the d20 roll and modifiers
	let nd = 1;
	let mods = rollData.halflingLucky ? 'r=1' : '';

	// Handle advantage
	if (adv === 'advantage') {
		nd = rollData.elvenAccuracy ? 3 : 2;
		mods += 'kh';
	}

	// Handle disadvantage
	else if (adv === 'disadvantage') {
		nd = 2;
		mods += 'kl';
	}

	// Include the d20 roll
	rollData.parts.unshift(`${nd}d20${mods}`);

	let r = new Roll(rollData.parts.join('+'), rollData);
	r.roll();
	let div = document.createElement('div');
	// div.title = `${rollData.parts[0]}+${rollData.terms} = ${r.formula} = ${r.total}. Click to see rolls.`;
	div.classList.add('dice-roll');
	div.classList.add('mess-dice-result');
	if (game.user.isGM) div.classList.add('mess-gm-dice');
	const span = div.appendChild(document.createElement('span'));
	span.classList.add('mess-roll-container');
	span.innerHTML = `<span class='mess-roll-total'>${r.total}</span>`;

	div.insertAdjacentHTML('beforeend', await r.getTooltip());
	let customTooltip = '';
	const terms = rollData.terms.split('+'); // only adding + terms here anyway
	const dataTerms = rollData.formula.split(/(?=[+-])/);
	for (let i = 0; i < terms.length; i++) {
		const term = terms[i];
		const num = Number(dataTerms[i]);
		if (isNaN(num)) continue;
		customTooltip += `<section class="tooltip-part">
			<div class="dice">
				<p class="part-formula">
					${term}
					<span class="part-total">${num >= 0 ? '+' + num : num}</span>
				</p>
			</div>
		</section>`;
	}
	div
		.querySelector('.dice-tooltip')
		.insertAdjacentHTML('beforeend', customTooltip);

	const tooltip = div.childNodes[1];
	tooltip.classList.add('hidden');
	const crit = rollData.critical || 20;
	const fumble = rollData.fumble || 1;

	const d20 = r.parts[0].total;

	// if (hasTarget(button)) {
	// 	// Check if hit
	// 	const target = getTargetToken(button);
	// 	const ac = target.actor.data.data.attributes.ac.value;
	// 	if (ac) {
	// 		if ((r.total >= ac && d20 > fumble) || d20 >= crit) {
	// 			span.classList.add('mess-hit');
	// 		} else {
	// 			span.classList.add('mess-miss');
	// 		}
	// 	}
	// }

	if (d20 >= crit) {
		span.classList.add('crit');
		card.querySelector('.mess-chat-dmg .mess-chat-roll-type').innerHTML +=
			' - Crit!';
		card.querySelectorAll('.mess-button-dmg').forEach((e, idx) => {
			const rgx = new RegExp(Die.rgx.die, 'g');
			const formula = e.dataset.formula.replace(rgx, (match, nd, d, mods) => {
				if (game.settings.get('mess', 'max-critical'))
					mods = ' + ' + nd * d + (mods || '');
				else {
					nd = nd * 2;
					mods = mods || '';
				}
				return nd + 'd' + d + mods;
			});
			e.innerHTML = `<i class="fas fa-dice-d20"></i> ${formula}`;
			e.dataset.formula = formula;
		});
	}
	if (d20 <= fumble) span.classList.add('fumble');

	if (messageId) {
		updateMessage(messageId, r, card, ev.currentTarget, div);
	} else {
		ev.currentTarget.parentNode.replaceChild(div, ev.currentTarget);
	}

	return r;
}

export async function getDmgData({ actor, item, spellLevel = null }) {
	if (!item.hasDamage) return null;
	const actorData = actor.data.data;
	const itemData = item.data.data;
	let rollData = item.getRollData();

	if (spellLevel) rollData.item.level = spellLevel;

	rollData.parts = duplicate(itemData.damage.parts);
	if (itemData.damage.versatile)
		rollData.parts.splice(1, 0, [itemData.damage.versatile, 'versatile']);

	// Only apply for items that are not bonus dmg themself
	if (!item.getFlag('mess', 'isBonusDamage'))
		for (let itm of actor.items) {
			// skip self
			if (itm.id === item.id) continue;

			let bnsDmgParts = [];
			if (itm.getFlag('mess', 'isBonusDamage')) {
				if (itm.hasDamage) {
					const itmData = itm.data.data;
					bnsDmgParts.push(itmData.damage.parts[0][0]);
					var lbl = itm.name;
					if (itmData.damage.parts[0][1].length > 0)
						lbl += ` - ${game.i18n.localize(
							'DND5E.Damage' +
								CONFIG.DND5E.damageTypes[itmData.damage.parts[0][1]]
						)}`;
					bnsDmgParts.push(lbl);
				}
			}
			if (bnsDmgParts.length > 0) rollData.parts.push(bnsDmgParts);
		}

	if (item.data.type === 'spell') {
		if (itemData.scaling.mode === 'cantrip') {
			let newDmgPart = [rollData.parts[0][0]];
			const lvl =
				actor.data.type === 'character'
					? actorData.details.level
					: actorData.details.spellLevel;
			item._scaleCantripDamage(newDmgPart, itemData.scaling.formula, lvl);

			rollData.parts[0][0] = newDmgPart[0];
		} else if (
			spellLevel &&
			itemData.scaling.mode === 'level' &&
			itemData.scaling.formula
		) {
			let newDmgPart = [];
			item._scaleSpellDamage(
				newDmgPart,
				itemData.level,
				spellLevel,
				itemData.scaling.formula
			);
			if (newDmgPart.length > 0) {
				newDmgPart.push('upcast dice');
				rollData.parts.push(newDmgPart);
			}
		}
	}

	const actorBonus = actorData.bonuses[itemData.actionType] || {};
	if (actorBonus.damage && parseInt(actorBonus.damage) !== 0) {
		rollData.parts[0][0] += '+@dmg';
		rollData['dmg'] = actorBonus.damage;
	}

	for (let part of rollData.parts) {
		let roll = new Roll(part[0], rollData);
		const dmgType = CONFIG.DND5E.damageTypes[part[1]];
		if (dmgType)
			part[1] = game.i18n.localize(
				'DND5E.Damage' + CONFIG.DND5E.damageTypes[part[1]]
			);
		else if (part[1] === 'versatile')
			part[1] = game.i18n.localize('DND5E.Versatile');

		//evalute damage formula's for example "ceil(@classes.rogue.levels/2))d6" -> "4d6"
		let terms = roll.terms.map((t, i, terms) => {
			if (t instanceof Roll) {
				hasInner = true;
				t.evaluate();
				roll._dice = roll._dice.concat(t.dice);
				const priorMath = i > 0 && terms[i - 1].split(' ').pop() in Math;
				return priorMath ? `(${t.total})` : String(t.total);
			}
			return t;
		});
		part.push(Roll.cleanFormula(terms));
	}

	return rollData;
}

/**
 * Rolls the dmg dice listed. If the event points towards an existing message the message will get updated
 * @param {Event} ev
 */
export async function rollDmg(ev) {
	const contextMenu = ev.currentTarget.parentNode.querySelector(
		'#context-menu'
	);
	if (contextMenu) contextMenu.remove();
	// Extract card data
	const button = ev.currentTarget;
	button.disabled = true;
	const card = button.closest('.chat-card');
	const messageId = card.closest('.message').dataset.messageId;

	// Check if user owns chat message, else return
	if (messageId) {
		ev.stopPropagation();
		ev.preventDefault();
		const message = game.messages.get(messageId);
		if (!(message.owner || message.isAuthor)) {
			ui.notifications.error(
				'You do not own the permissions to make that roll!'
			);
			return false;
		}
	}
	const formula = button.dataset.formula;

	let r = new Roll(formula);
	r.roll();
	let div = document.createElement('div');
	// div.title = `${button.dataset.terms} = ${r.formula} = ${r.total}. Click to see rolls.`;
	div.classList.add('dice-roll');
	div.classList.add('mess-dice-result');
	if (game.user.isGM) div.classList.add('mess-gm-dice');

	// small helper to detect if versatile dmg was rolled
	const dmgType = button.nextElementSibling.innerText;
	if (dmgType === game.i18n.localize('DND5E.Versatile'))
		div.classList.add('mess-versatile');

	const span = div.appendChild(document.createElement('span'));
	span.classList.add('mess-roll-container');
	span.innerHTML = `<span class='mess-roll-total'>${r.total}</span>`;
	div.insertAdjacentHTML('beforeend', await r.getTooltip());
	let customTooltip = '';
	const terms = button.dataset.terms.split(/(?=[+-])/);
	const dataTerms = formula
		.split(/(?=[+-])/)
		.filter((e) => e !== '+' && e !== '-'); // filter single + and -
	// i really sh ould put this into a function............
	for (let i = 0; i < terms.length; i++) {
		const term = terms[i];
		const num = Number(dataTerms[i].replace(/\s/g, ''));

		if (isNaN(num)) continue;
		customTooltip += `<section class="tooltip-part">
			<div class="dice">
				<p class="part-formula">
					${term}
					<span class="part-total">${num >= 0 ? '+' + num : num}</span>
				</p>
			</div>
		</section>`;
	}
	div
		.querySelector('.dice-tooltip')
		.insertAdjacentHTML('beforeend', customTooltip);
	const tooltip = div.childNodes[1];
	tooltip.classList.add('hidden');

	if (messageId) {
		updateMessage(messageId, r, card, ev.currentTarget, div);
	} else {
		ev.currentTarget.parentNode.replaceChild(div, ev.currentTarget);
	}
	return r;
}

async function updateMessage(messageId, roll, card, target, div) {
	const message = game.messages.get(messageId);
	const dsn = game.mess.diceSoNice;
	if (dsn) {
		let rollMode = game.settings.get('core', 'rollMode');
		let whispers = null;
		let blind = false;
		if (['gmroll', 'blindroll'].includes(rollMode))
			whispers = ChatMessage.getWhisperIDs('GM');
		if (rollMode === 'blindroll') blind = true;

		card.querySelectorAll('button').forEach((e) => (e.disabled = true));
		await game.dice3d.showForRoll(roll, game.user, true, whispers, blind);
	} else {
		AudioHelper.play({ src: CONFIG.sounds.dice }, true);
	}
	target.parentNode.replaceChild(div, target);
	message.update({ content: card.parentNode.innerHTML });
}
