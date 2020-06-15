export class MessSettings extends FormApplication {
	static init() {
		const isDnD = game.system.id === 'dnd5e';
		
		game.settings.register('mess', 'actor-item-sort', {
			name: "Activate item sort button.",
			hint: "Adds a button to actor sheets for sorting all items of that category alphabetically.",
			scope: "world",
			config: false,
			default: isDnD,
			type: Boolean
		})
	
		game.settings.register('mess', 'better-draggable', {
			name: "Activate better drag'n'drop workflow.",
			scope: "world",
			config: false,// Change if implemented
			default: isDnD,
			type: Boolean
		})
	
		game.settings.register('mess', 'prepared-spell-tracker', {
			name: "Activate prepared spell tracker",
			hint: "Adds a tracker to the spellbook tab, providing a way to track the allowed maximum of prepared spells.",
			scope: "world",
			config: false,
			default: isDnD,
			type: Boolean
		})
	
		game.settings.register('mess', 'add-scrolling', {
			name: "Activating numerical field scrolling.",
			hint: "Lets you in-/decrease numerical fields in the Actor sheet using the mouse wheel when focused.",
			scope: "world",
			config: false,
			default: isDnD,
			type: Boolean
		});
	
		game.settings.register('mess', 'modify-rolling', {
			name: "Alternative Rolling.",
			hint: "Changes the way rolling is displayed and executed for DnD5e. Reload for all connected clients is required for this to take effect if changed!",
			scope: "world",
			config: false,
			default: isDnD,
			type: Boolean
		});
	
		game.settings.register('mess', 'modify-templates', {
			name: "Activate modified templates.",
			hint: "Makes templates texture fill scaling instead of tiling and does allow the usage of videos as texture. Reload for all connected clients is required for this to take effect if changed!",
			scope: "world",
			config: false,
			default: true,
			type: Boolean
		});
		
		game.settings.register('mess', 'change-placeables', {
			name: "Activate placeables changes.",
			hint: "Changes some behaviours of placeables, like preview snapping to grid. Reload for all connected clients is required for this to take effect if changed!",
			scope: "world",
			config: false,
			default: true,
			type: Boolean
		});	
		if (isDnD)
			game.settings.registerMenu('mess', 'templateTexture', {
				name: game.i18n.localize('MESS.FVTTSettings.description'),
				label: game.i18n.localize('MESS.FVTTSettings.button'),
				// hint: "!",
				icon: "fas fa-mug-hot",
				type: MessSettings,
				restricted: true
			});

		game.settings.register('mess', 'templateTexture', {
			name: "Activate placeables changes.",
			hint: "Changes some behaviours of placeables, like preview snapping to grid. Reload for all connected clients is required for this to take effect if changed!",
			scope: "world",
			default: true,
			type: Object
		});	

		game.settings.register('mess', 'max-critical', {
			name: "Activate maximum critical rolls.",
			hint: "Changes behaviour of critical damage rolls to maximize the damage of the extra dice for criticals!",
			scope: "world",
			config: false,
			default: false,
			type: Boolean
		});


		game.settings.register('mess', 'templateTexture', {
			name: "Activate placeables changes.",
			hint: "Changes some behaviours of placeables, like preview snapping to grid. Reload for all connected clients is required for this to take effect if changed!",
			scope: "world",
			config: false,
			default: true,
			type: Object
		});	

		game.settings.register('mess', 'templateAutoTargeting', {
			scope: "world",
			default: true,
			type: Boolean
		})

		game.settings.register('mess', 'templateDrawBordersOnlyOnHighlight', {
			scope: "world",
			default: true,
			type: Boolean
		})

		this.loadTemplates();
	}
	static loadTemplates() {
		loadTemplates([
			'modules/mess/templates/settings/templates.html',
			'modules/mess/templates/settings/dnd5e.html',
			'modules/mess/templates/settings/misc.html'
		]);
	}

	static get defaultOptions() {
		return {
			...super.defaultOptions,
			template: "modules/mess/templates/settings/settings.html",
			height: "auto",
			title: "Mess - Moerills enhancing super-suit(e) - Settings Menu",
			width: 600,
			classes: ["mess", "settings"],
			tabs: [ 
				{
					navSelector: '.tabs',
					contentSelector: 'form',
					initial: 'name'
				} 
			],
			submitOnClose: true
		}
	}

	constructor(object = {}, options) {
		super(object, options);
		this.object = game.settings.get('mess', 'templateTexture');
	}

	_getHeaderButtons() {
		let btns = super._getHeaderButtons();
		btns[0].label = "Save & Close";
		return btns;
	}

	getSettingsData() {
		const isDnD = game.system.id === 'dnd5e';
		let data = {
			'modify-templates': game.settings.get('mess', 'modify-templates'),
			'change-placeables': game.settings.get('mess', 'change-placeables'),
			'templateTexture': game.settings.get('mess', 'templateTexture'),
			'templateAutoTargeting': game.settings.get('mess', 'templateAutoTargeting'),
			'templateDrawBordersOnlyOnHighlight': game.settings.get('mess', 'templateDrawBordersOnlyOnHighlight')
		};
		if (isDnD) {
			data['templateTexture'] = game.settings.get('mess', 'templateTexture');
			data['modify-rolling'] = game.settings.get('mess', 'modify-rolling');
			data['max-critical'] = game.settings.get('mess', 'max-critical');

			data['actor-item-sort'] = game.settings.get('mess', 'actor-item-sort');
			// data['better-draggable'] = game.settings.get('mess', 'better-draggable');
			data['prepared-spell-tracker'] = game.settings.get('mess', 'prepared-spell-tracker');
			data['add-scrolling'] = game.settings.get('mess', 'add-scrolling');
		}
		return data;
	}

	getData() {
		let data = super.getData();
		data.dmgTypes = CONFIG.DND5E.damageTypes;
		data.templateTypes = CONFIG.MeasuredTemplate.types;
		data.isDnD = game.system.id === 'dnd5e';
		data.settings = this.getSettingsData();
		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);
	}

	_updateObject(ev, formData) {
		const data = expandObject(formData);
		for (let [key, value] of Object.entries(data)) {
			game.settings.set('mess', key, value);
		}
		new Dialog({
			content: `<p>${game.i18n.localize("MESS.reloadReminder.text")}</p>`,
			buttons: {
				yes: {
					icon: '<i class="fas fa-check"></i>',
					label: game.i18n.localize("MESS.reloadReminder.yes"),
					callback: () => location.reload()
				},
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: game.i18n.localize("MESS.reloadReminder.no")
				}
			}
		}).render(true);
		// game.settings.set('mess', 'templateTexture', mergeObject({}, formData))
	}
}