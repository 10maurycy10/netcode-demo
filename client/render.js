// render.hs
var colors = {
	gray: "#666666",
	darkgray: "#333333",
	blue: "#2222EE"
}

// render.js
function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
	let circle = new Path2D();
	circle.arc(x, y, radius, 0, 2 * Math.PI, false)
	if (fill) {
		ctx.fillStyle = fill
		ctx.fill(circle)
	}
	if (stroke) {
		ctx.lineWidth = strokeWidth
		ctx.strokeStyle = stroke
		ctx.stroke(circle)
	}
}

// render.js
function render() {
	 
	if (!selfId) return;
	var ctx = c.getContext("2d");

	c.width  = window.innerWidth;
	c.height = window.innerHeight;

	var w = ctx.canvas.clientWidth;
	var h = ctx.canvas.clientHeight;

	//console.log(w,h)

	ctx.beginPath();

	ctx.fillStyle = colors.darkgray;
	ctx.fillRect(0,0,w,h)
	
	for (pid of Object.keys(players))
		if (pid === selfId)
			drawCircle(ctx, players[pid].pos[0],players[pid].pos[1], 10, colors.red)
		else
			drawCircle(ctx, players[pid].pos[0],players[pid].pos[1], 10, colors.blue)
}
