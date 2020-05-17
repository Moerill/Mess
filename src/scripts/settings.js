export class MessSettings extends FormApplication {
	static init() {
		const isDnD = game.system.id === 'dnd5e';
		
		game.settings.register('mess', 'actor-item-sort', {
			name: "Activate item sort button.",
			hint: "Adds a button to actor sheets for sorting all items of that category alphabetically.",
			scope: "user",
			config: isDnD,
			default: isDnD,
			type: Boolean
		})
	
		game.settings.register('mess', 'better-draggable', {
			name: "Activate better drag'n'drop workflow.",
			scope: "user",
			config: false,// Change if implemented
			default: isDnD,
			type: Boolean
		})
	
		game.settings.register('mess', 'prepared-spell-tracker', {
			name: "Activate prepared spell tracker",
			hint: "Adds a tracker to the spellbook tab, providing a way to track the allowed maximum of prepared spells.",
			scope: "user",
			config: isDnD,
			default: isDnD,
			type: Boolean
		})
	
		game.settings.register('mess', 'add-scrolling', {
			name: "Activating numerical field scrolling.",
			hint: "Lets you in-/decrease numerical fields in the Actor sheet using the mouse wheel when focused.",
			scope: "user",
			config: isDnD,
			default: isDnD,
			type: Boolean
		});
	
		game.settings.register('mess', 'modify-rolling', {
			name: "Alternative Rolling.",
			hint: "Changes the way rolling is displayed and executed for DnD5e. Reload for all connected clients is required for this to take effect if changed!",
			scope: "world",
			config: isDnD,
			default: isDnD,
			type: Boolean
		});
	
		game.settings.register('mess', 'modify-templates', {
			name: "Activate modified templates.",
			hint: "Makes templates texture fill scaling instead of tiling and does allow the usage of videos as texture. Reload for all connected clients is required for this to take effect if changed!",
			scope: "world",
			config: true,
			default: true,
			type: Boolean
		});
		
		game.settings.register('mess', 'change-placeables', {
			name: "Activate placeables changes.",
			hint: "Changes some behaviours of placeables, like preview snapping to grid. Reload for all connected clients is required for this to take effect if changed!",
			scope: "world",
			config: true,
			default: true,
			type: Boolean
		});	
		if (isDnD)
			game.settings.registerMenu('mess', 'templateTexture', {
				name: "Mess template texture configurator for DnD abilities.",
				label: "Configure template textures",
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
	}

	static get defaultOptions() {
		return {
			...super.defaultOptions,
			template: "modules/mess/templates/settings.html",
			height: 800,
			width: 400
		}
	}

	constructor(object = {}, options) {
		super(object, options);
		this.object = game.settings.get('mess', 'templateTexture');
	}

	getData() {
		let data = super.getData();
		data.dmgTypes = CONFIG.DND5E.damageTypes;
		data.templateTypes = CONFIG.templateTypes;
		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);
	}

	_updateObject(ev, formData) {
		game.settings.set('mess', 'templateTexture', mergeObject({}, formData))
	}

}