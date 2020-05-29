import {rollD20, getToHitData, rollToHit, getDmgData, rollDmg} from './dice.js';


export default function() {
	setupHooks();
}

/**
 * Initializes all the hoohks!
 */
function setupHooks() {
	Hooks.on('preCreateChatMessage', preCreateChatMessageHook);
	Hooks.on('renderActorSheet', actorSheetHook);

	// Bind my own chatListeners to the item class and execute them.
	Hooks.on('ready', chatListeners.bind(CONFIG.Item.entityClass));
}

/**
 * Makes sure one attack is rolled for every chat card that has a dmg or attack button.
 * @param {Object} data chat message data
 */
async function preCreateChatMessageHook(data) {
	const div = document.createElement('div');
	div.insertAdjacentHTML('afterbegin',  data.content);
	let btn = div.querySelector('button[data-action="attack"]');
	if (!btn)
		btn = div.querySelector('button[data-action="damage"]');
	
	if (btn)
		renderAttack({currentTarget: btn});
}

/**
 * Renders an attack chat card
 * @param {Click Event} ev pointing towards the card that is supposed to initiate the event.
 */
async function renderAttack(ev) {
	if (ev.type === 'click') {
		ev.preventDefault();
		ev.stopPropagation();
	}

	// Extract card data
	const button = ev.currentTarget;
	button.disabled = true;
	const card = button.closest(".chat-card");

	// Get the Actor from a synthetic Token
	const actor = CONFIG.Item.entityClass._getChatCardActor(card);

	if ( !actor || !actor.owner) return;

	// Get the Item
	const item = actor.getOwnedItem(card.dataset.itemId);
	if ( !item ) {
		return ui.notifications.error(`The requested item ${card.dataset.itemId} no longer exists on Actor ${actor.name}`)
	}

	let targets = game.user.targets;
	// Don't roll for all targets if its an AoE, due to only rolling e.g. dmg once for all targets
	// TODO: Maybe add target list or chat cards for making saving throws
	// or not, since it would just spam the chatlog.. hmm
	const areaSkill = Object.keys(CONFIG.DND5E.areaTargetTypes).includes(getProperty(item, 'data.data.target.type'));
	if (!targets.size || areaSkill)
		targets =  [{data: {
				name: "someone",
				img: ""
			}
		}];
	const spellLevel = parseInt(card.dataset.spellLevel) || null;

	const template = 'modules/mess/templates/attack-card.html';

	const attackData = {
		actor, item,
		toHit: await getToHitData({actor, item}),
		dmgs: await getDmgData({actor, item, spellLevel}),
		sceneId: canvas.scene.id,
		user: game.user.id
	}

	const autoroll = game.settings.get('mess', `${game.userId}.autoroll-selector`);

	let rollMode = game.settings.get("core", "rollMode");
	for (const target of targets) {
		const allowed = await item._handleResourceConsumption({isCard: false, isAttack: true});
		const attackTemplateData = {
									...attackData, 
									target: target.data,
									flavor: item.data.data.chatFlavor.replace(/\[target\.name\]/g, target.data.name),
									allowed
								};
		let html = await renderTemplate(template, attackTemplateData);

		

		if (autoroll.hit || autoroll.dmg) 
			html = await autoRoll(autoroll, html);


		let chatData = {
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: {
        actor: item.actor._id,
        token: item.actor.token,
        alias: item.actor.name
			}
		};
		if ( ["gmroll", "blindroll"].includes(rollMode) ) chatData["whisper"] = ChatMessage.getWhisperIDs("GM");
		if ( rollMode === "blindroll" ) chatData["blind"] = true;
	
		ChatMessage.create(chatData);
	}

	button.disabled = false;
}

/**
 * Autorolls hit or dmg, depending on which flag is set and replaces the template string.
 * @param {Object} autoroll Defining whether to autoroll hit or dmg
 * @param {String} template Defining the html template where the roll should happen.
 */
async function autoRoll(autoroll, template) {
	let card = document.createElement('div');
	card.classList.add('message');
	card.insertAdjacentHTML('afterbegin', template);
	if (autoroll.hit) {
		let toHitBtn = card.querySelector('.mess-button-to-hit');
		if (toHitBtn)
			await rollToHit({currentTarget: toHitBtn});
	}

	if (autoroll.dmg) {
		const btns = Array.from(card.querySelectorAll('.mess-button-dmg'));
		for (const btn of btns)
			await rollDmg({currentTarget: btn});
	}
	return card.innerHTML;
}

/**
 * Hook onto the Actor Sheet rendering, modifying the listeners for the roll ability and roll skill check events
 * @param {*} app 
 * @param {*} html 
 * @param {*} data 
 */
async function actorSheetHook(app, html, data) {
	// TODO: Redo this with proper methods... this currently ignores the cool new modifier field
	// maybe just ignore replace the abilitysave etc functions
	const abilityMods = html[0].querySelectorAll('.ability-mod, .ability-name');
	$(abilityMods).off(); // find smth better here!
	abilityMods.forEach(e => e.addEventListener('click', function(ev) {
		ev.stopPropagation();
		ev.preventDefault();

		const abilityId = ev.currentTarget.closest('.ability').dataset.ability;
		const label = CONFIG.DND5E.abilities[abilityId];
    const abl = app.object.data.data.abilities[abilityId];
    const parts = ["@mod"];
    const data = {mod: abl.mod};
    const feats = app.object.data.flags.dnd5e || {};

    // Add feat-related proficiency bonuses
    if ( feats.remarkableAthlete && DND5E.characterFlags.remarkableAthlete.abilities.includes(abilityId) ) {
      parts.push("@proficiency");
      data.proficiency = Math.ceil(0.5 * this.data.data.attributes.prof);
    }
    else if ( feats.jackOfAllTrades ) {
      parts.push("@proficiency");
      data.proficiency = Math.floor(0.5 * this.data.data.attributes.prof);
    }

    // Add global actor bonus
    let actorBonus = getProperty(app.object.data.data.bonuses, "abilities.check");
    if ( !!actorBonus ) {
      parts.push("@checkBonus");
      data.checkBonus = actorBonus;
		}
		
		data.parts = parts;

		data.title = game.i18n.format("DND5E.AbilityPromptTitle", {ability: label});

		rollD20.bind(app.object)(data);
		return true;
	}));
	const saveMods = html[0].querySelectorAll('.ability-save');
	saveMods.forEach(e => e.addEventListener('click', function(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		const abilityId = ev.currentTarget.closest('.ability').dataset.ability;
		const label = CONFIG.DND5E.abilities[abilityId];
    const abl = app.object.data.data.abilities[abilityId];
    const parts = ["@mod"];
    const data = {mod: abl.mod};

    // Include proficiency bonus
    if ( abl.prof > 0 ) {
      parts.push("@prof");
      data.prof = abl.prof;
    }

    // Include a global actor ability save bonus
    const actorBonus = getProperty(app.object.data.data.bonuses, "abilities.save");
    if ( !!actorBonus ) {
      parts.push("@saveBonus");
      data.saveBonus = actorBonus;
    }
		data.title = game.i18n.format("DND5E.SavePromptTitle", {ability: label});
		data.parts = parts;
		rollD20.bind(app.object)(data);
	}));

	const skills = html[0].querySelectorAll('.skill-name');
	$(skills).off();
	skills.forEach(e => e.addEventListener('click', function(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		const skillId = ev.currentTarget.closest('.skill').dataset.skill;
		const skl = app.object.data.data.skills[skillId];

    // Compose roll parts and data
    const parts = ["@mod"];
    const data = {mod: skl.mod + skl.prof};
    if ( skl.bonus ) {
      data["skillBonus"] = skl.bonus;
      parts.push("@skillBonus");
    }

    // Reliable Talent applies to any skill check we have full or better proficiency in
    const reliableTalent = (skl.value >= 1 && app.object.getFlag("dnd5e", "reliableTalent"));
		data.parts =  parts;
		data.title = game.i18n.format("DND5E.SkillPromptTitle", {skill: CONFIG.DND5E.skills[skillId]});

		rollD20.bind(app.object)(data);
		return false;
	}))
}

/**
 * My own chat listeners
 */
function chatListeners() {
	const html = $(document.getElementById('chat-log'));
	html.on('click', '.card-buttons button', onChatCardAction.bind(this));
	// html.on('click', '.item-name', this._onChatCardToggleContent.bind(this));
	
	// lets just use this for even more listeners
	html.on('mouseenter', '.mess-chat-target', onMouseEnterTarget);
	html.on('mouseleave', '.mess-chat-target', onMouseLeaveTarget);
	html.on('dblclick', '.mess-chat-target', onDblClickTarget);

	html.on('click', '.mess-button-to-hit', rollToHit);
	html.on('click', '.mess-button-dmg', rollDmg);
}

// Only overwrite stuff for attack buttons
async function onChatCardAction (ev) {
	if (ev.currentTarget.dataset.action === 'attack')
		return renderAttack(ev);
	if (ev.currentTarget.dataset.action === 'damage')
		return renderAttack(ev);
	if (ev.currentTarget.dataset.placeTemplate)
		return renderTemplate(ev);

	return this._onChatCardAction(ev);		
}

/*****************************************************
 * Mouse Listeners for the target img for chat cards *
 *****************************************************/

async function onMouseEnterTarget(ev) {
	ev.preventDefault();
	ev.stopPropagation();
	const token = await getTargetToken(ev);
	if (!token) return false;

	token._onHoverIn();
}

async function onMouseLeaveTarget(ev) {
	ev.preventDefault();
	ev.stopPropagation();
	const token = await getTargetToken(ev);
	if (!token || !token.visible) return false;
	
	token._onHoverOut();
}

async function onDblClickTarget(ev) {
	ev.preventDefault();
	ev.stopPropagation();
	const token = await getTargetToken(ev);
	if (!token || !token.visible) return false;
	
	const pos = token.center;
	canvas.animatePan({x: pos.x, y: pos.y})
}

async function getTargetToken(ev) {
	const card = ev.currentTarget.closest('.mess-attack-card');
	const sceneId = card.dataset.sceneId;
	if (sceneId !== canvas.scene.id) return false;
	const tokenId = card.dataset.targetId;
	if (!tokenId) return false;

	const token = canvas.tokens.placeables.find(e => e.id === tokenId);
	if (!token) return false;
	return token;
}