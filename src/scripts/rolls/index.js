import rollConrolls from './controls.js';
import applyDmg from './apply-dmg.js';
import modifyRolling from './modify-rolling.js';

export function rolling() {
	// Don't do this stuff if the settings are disabled.
	if (!game.settings.get('mess', 'modify-rolling'))
		return;
	rollConrolls();
	applyDmg();
	modifyRolling()
}