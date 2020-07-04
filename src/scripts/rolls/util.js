export function getTargetToken(el) {
	
	const card = el.closest('.mess-attack-card')

	const targetId = card.dataset.targetId
	const sceneId = card.dataset.sceneId;
	const scene = game.scenes.get(sceneId);
	const token = new Token(scene.getEmbeddedEntity("Token", targetId));
	return token;
}

export function hasTarget(el) {
	const card = el.closest('.mess-attack-card');
	if (!card) return false;
	if (card.dataset.targetId) return true;
	return false;
}