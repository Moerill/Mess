function onDragLeftMove(event) {
	const {clones, destination, origin, originalEvent} = event.data;

	// Pan the canvas if the drag event approaches the edge
	canvas._onDragCanvasPan(originalEvent);

	// Determine dragged distance
	const dx = destination.x - origin.x;
	const dy = destination.y - origin.y;

	let snap = false;
	if (event.data.previous) {
		// Interesting would be here how this all behaves for different monitor sizes/performances and when Atro possibly introduces more adaptive rates for mosue movement. 
		// Why? Because currently i just set the timedifferences between function calls to 1. So for 60Hz it behaves same as 30Hz although for 30Hz the distance travelled could be bigger.
		// All this because i don't want divisions in here for the moment....
		const momentumThreshold = 30;
		// smaller lambda means less "memory" => current momentum does have more impact
		// => more jumping around between snapping and not
		// but higher means more waiting/slow movement time for it to snap
		const lambda = 0.8;
		const prev = event.data.previous;
		const prevMomentum = event.data.momentum || 0;
		const prevV = event.data.v || {x: 0, y: 0};
		const v = {
			x: destination.x - prev.x,
			y: destination.y - prev.y
		}
		const momentum = {
			x: v.x - prevV.x,
			y: v.y - prevV.y
		};

		event.data.momentum = (momentum.x * momentum.x + momentum.y * momentum.y) + prevMomentum * lambda;
		snap = !event.shiftKey && event.data.momentum < momentumThreshold;
	}

	event.data.previous = destination;

	// Update the position of each clone
	for ( let c of clones || [] ) {
		let dest = {x: c._original.data.x + dx, y: c._original.data.y + dy};
		if ( snap ) {
			dest = canvas.grid.getSnappedPosition(dest.x, dest.y, this.layer.options.gridPrecision);
		}
		c.data.x = dest.x;
		c.data.y = dest.y;
		c.refresh();
	}
}

export function changePlaceables() {
	PlaceableObject.prototype._onDragLeftMove = onDragLeftMove;
	// Change got bigger than expected, so.. complete swap it is
}