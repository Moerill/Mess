export function changeTemplates() {

  // #MonkeyPatchingFTW
  // better than stealing the code, replacing one line and then release it under a/the wrong license..
  // Disadvantage: could need more fixing on updates. At least i didn#t make it line based like Kakaroto.. :P
  
	let newFun = MeasuredTemplate.prototype.refresh.toString();

	if (game.settings.get('mess', 'modify-templates')) {
		newFun = newFun.replace(/this\.template\.beginTextureFill\(\{[\s\S]*\}\)\;/, `
			{
				let mat = PIXI.Matrix.IDENTITY;
				// rectangle
				if (this.shape.width && this.shape.height)
					mat.scale(this.shape.width / this.texture.width, this.shape.height / this.texture.height);
				else if (this.shape.radius) {
					mat.scale(this.shape.radius * 2 / this.texture.height, this.shape.radius * 2 / this.texture.width)
					// Circle center is texture start...
					mat.translate(-this.shape.radius, -this.shape.radius);
				} else if (this.data.t === "ray") {
					const d = canvas.dimensions,
								height = this.data.width * d.size / d.distance,
								width = this.data.distance * d.size / d.distance;
					mat.scale(width / this.texture.width, height / this.texture.height);
					mat.translate(0, -height * 0.5);

					mat.rotate(toRadians(this.data.direction));
				} else {// cone
					const d = canvas.dimensions;
			
					// Extract and prepare data
					let {direction, distance, angle} = this.data;
					distance *= (d.size / d.distance);
					direction = toRadians(direction);
					const width = this.data.distance * d.size / d.distance;

					const angles = [(angle/-2), (angle/2)];
					distance = distance / Math.cos(toRadians(angle/2));
			
					// Get the cone shape as a polygon
					const rays = angles.map(a => Ray.fromAngle(0, 0, direction + toRadians(a), distance+1));
					const height = Math.sqrt((rays[0].B.x - rays[1].B.x) * (rays[0].B.x - rays[1].B.x)
													+ (rays[0].B.y - rays[1].B.y) * (rays[0].B.y - rays[1].B.y));
					mat.scale(width / this.texture.width, height / this.texture.height);
					mat.translate(0, -height/2)
					mat.rotate(toRadians(this.data.direction));
				}
				this.template.beginTextureFill({
					texture: this.texture,
					matrix: mat,
					alpha: 0.8
				});
		}`);

		Hooks.on('renderMeasuredTemplateConfig', (app, html, data) => {
			html[0].querySelector('.file-picker').dataset.type = 'imagevideo'
		});
	}
	
	if (game.settings.get('mess', 'templateAutoTargeting')) {
		newFun = newFun.replace(/this\.\_borderThickness/, "this.texture && !this._hover ? 0 : this._borderThickness");
		newFun = newFun.replace(/return\sthis\;/, `
			const grid = canvas.grid;
			// only show grid highlights on hover
			if (this.texture) {
				const hl = grid.getHighlightLayer(\`Template.\$\{this.id\}\`);
				if (hl)
					hl.renderable = this._hover;
			}
			return this;`);
	}

	MeasuredTemplate.prototype.refresh = Function(`"use strict"; return ( function ${newFun} )`)();

	
	if (game.settings.get('mess', 'templateAutoTargeting')) {
		MeasuredTemplate.prototype.getTargets = getTargets;
		MeasuredTemplate.prototype.isTokenInside = isTokenInside;

		const oldFun = MeasuredTemplate.prototype._onDragLeftMove;
		MeasuredTemplate.prototype._onDragLeftMove = function(ev) {
			const ret = oldFun.bind(this)(ev);

			for (let c of ev.data.clones)
				this.getTargets(c);

			return ret;
		}
	}
}

export async function dndTemplateSettings() {
  if (game.system.id !== 'dnd5e') return;

	const importedJS = (await import(/* webpackIgnore: true */ '/systems/dnd5e/module/pixi/ability-template.js'))
	const AbilityTemplate = importedJS.default || importedJS.AbilityTemplate;

	// Auto texture creation from item
	if (game.settings.get('mess', 'modify-templates')) {
		Hooks.on('renderItemSheet', itemHook);
		
		
		const _originalFromItem = AbilityTemplate.fromItem;
		AbilityTemplate.fromItem = function(item) {
			const template = _originalFromItem.bind(this)(item);
			
			// generate a texture based on the items dmg type, ...
			// Add settings to define custom templates for stuff.
			let path = item.getFlag('mess', 'templateTexture');
			if (!path && item.hasDamage) {
				const settings = game.settings.get('mess', 'templateTexture') || {};
				path = settings[item.data.data.damage.parts[0][1]] || {};
				path = path[template.data.t];
			}
			if (path)
				loadTexture(path).then(tex => {
					template.texture = tex;
					template.data.texture = path;
					template.refresh();
				})
			template.item = item;
			return template;
		}
	}


	if (game.settings.get('mess', 'templateAutoTargeting')) {
		//  rather ugly, maybe find a better way at some point :shrug:
		const origPrevListeners = AbilityTemplate.prototype.activatePreviewListeners.toString();
		const newFun = origPrevListeners.replace(/this\.refresh\(\)\;/, 
					// get targets
						`this.refresh();
						this.getTargets(this);
					`);

		AbilityTemplate.prototype.getTargets = getTargets;
		AbilityTemplate.prototype.isTokenInside = isTokenInside;

		AbilityTemplate.prototype.activatePreviewListeners = Function(`"use strict"; return ( function ${newFun} )`)();
	}
}


function isTokenInside(token) {
	const grid = canvas.scene.data.grid,
				templatePos = {x: this.data.x, y: this.data.y};
	// Check for center of  each square the token uses.
	// e.g. for large tokens all 4 squares
	const startX = token.width >= 1 ? 0.5 : token.width / 2;
	const startY = token.height >= 1 ? 0.5 : token.height / 2;
	for (let x = startX; x < token.width; x++) {
		for (let y = startY; y < token.height; y++) {
			const currGrid = {
				x: token.x + x * grid - templatePos.x,
				y: token.y + y * grid - templatePos.y
			};
			const contains = this.shape.contains(currGrid.x, currGrid.y);
			if (contains) return true;
		}
	}
	return false;
}

function getTargets(template) {
	const tokens = canvas.scene.getEmbeddedCollection('Token');
	let targets = [];
	
	for (const token of tokens)
		if (template.isTokenInside(token)) { targets.push(token._id); }
	game.user.updateTokenTargets(targets);
}

async function itemHook(app, html) {
	const div = document.createElement('div');
	div.classList.add('form-group');
	div.appendChild(document.createElement('label')).innerText = game.i18n.localize('MESS.itemSheet.templateTexture');
	const formField = div.appendChild(document.createElement('div'));
	formField.classList.add('form-fields');
	const inp = formField.appendChild(document.createElement('input'));
	inp.dataset.dtype = 'String';
	inp.type = 'text';
	inp.name = 'flags.mess.templateTexture';
	inp.value = app.object.getFlag('mess', 'templateTexture') || "";

	formField.insertAdjacentHTML('beforeend', `
		<button type="button" class="file-picker" data-type="imagevideo" data-target="flags.mess.templateTexture" title="Browse Files" tabindex="-1">
			<i class="fas fa-file-import fa-fw"></i>
		</button>
	`);
	const button = formField.querySelector('button');
	button.style.flex = '0';
  app._activateFilePicker(button);
	const target = html[0].querySelector('[name="data.target.units"]');
  if (target)
		target.closest('.form-group').after(div);
}