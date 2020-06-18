import { rolling } from './rolls';
import { MessSettings } from './settings.js';
import {dndTemplateSettings, changeTemplates } from './modify-templates.js';
import { changePlaceables } from './change-placeables.js';
import itemSortBtn from './actor-item-sort-btn.js';
import preparedSpellTracker from './prepared-spell-tracker.js';
import addScrolling from './add-scrolling.js';

import {initDraggableLists} from './draggable-lists';
import {initChatPopUp} from './chat-popup';

Hooks.on('ready', async function() {
	if (game.settings.get('mess', 'actor-item-sort'))
		itemSortBtn();
	if (game.settings.get('mess', 'prepared-spell-tracker'))
		preparedSpellTracker();
	if (game.settings.get('mess', 'add-scrolling'))
		addScrolling();
	
	if (CONFIG.debug.mess) {
		const actor = (await fromUuid('Actor.xV3LUAg05Pz5MFTS'));
		actor.sheet.render(true);
	}

	// initChatPopUp();

	if (!game.user.isGM)
	return;
	// Edit next line to match module.
	const module = game.modules.get("mess");
	const title = module.data.title;
	const moduleVersion = module.data.version;
	game.settings.register(title, 'version', {
		name: `${title} Version`,
		default: "0.0.0",
		type: String,
		scope: 'world',
	});
	const oldVersion = game.settings.get(title, "version");

	if (!isNewerVersion(moduleVersion, oldVersion))
		return;

	(await import(
								/* webpackChunkName: "welcome-screen" */
								'./welcome-screen.js'
								)
							).default();
});

Hooks.on('init', function() {
	game.mess = {};
	CONFIG.debug.mess = false;
	MessSettings.init();

	rolling();

	dndTemplateSettings();
	changeTemplates();
	if (game.settings.get('mess', 'change-placeables'))
		changePlaceables();
	if (game.settings.get('mess', 'better-draggable-lists'))
		initDraggableLists();
});
