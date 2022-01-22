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

function lerp(a,b,p) {
	return a*(1-p) + b*p
}

// server tick rate is 24 tps
function render(time) {
	//console.log(time)
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
	
	for (pid of Object.keys(players)) {
		let ang = players[pid].angle;
		var ap_pos = Object.create(players[pid].pos);
		if (players_old[pid] && pid !== selfId) {
			var ipos = (time - last_update_time)/(1000/24);
			var ipos = Math.min(1,ipos);
			ap_pos[0] = lerp(players_old[pid].pos[0], ap_pos[0],ipos)	
			ap_pos[1] = lerp(players_old[pid].pos[1], ap_pos[1],ipos)	
			//console.log(time,last_update_time,ipos)
		}
		drawCircle(ctx, ap_pos[0] + Math.sin(ang) * 10, ap_pos[1] + Math.cos(ang) * 10, 4, "#EEEEEE")
		if (pid === selfId)
			drawCircle(ctx, ap_pos[0],ap_pos[1], 10, colors.red)
		else
			drawCircle(ctx, ap_pos[0],ap_pos[1], 10, colors.blue)
	}
	console.log(arrows)
	if (arrows)
	for (aid of Object.keys(arrows)) {
		let ap_pos = [...arrows[aid].pos];
		if (arrows_old[aid]) {
			var itime = (time - last_arrow_update_time);
			itime = Math.min(1,itime/(1000/24))
			ap_pos[0] = lerp(arrows_old[aid].pos[0],ap_pos[0],itime)
			ap_pos[1] = lerp(arrows_old[aid].pos[1],ap_pos[1],itime)
		}
		drawCircle(ctx, ap_pos[0], ap_pos[1], 2, "#EEEEEE")
	}
	else
		console.log("wtf")
	for (aid of Object.keys(fakearrows)) {
		drawCircle(ctx, fakearrows[aid].pos[0], fakearrows[aid].pos[1], 2, "#00EE00")
	}
}

