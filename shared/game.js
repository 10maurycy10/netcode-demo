// time is in seconds
function arrow_spawn(player,id,lag_comp,arrows) {
//	console.log(player,id,lag_comp,arrows)
	var ppos = player.pos;
	var pa = player.angle;
	arrows[id] = {
		// arrow time is unix millis
		time: Date.now(),
		pos: [ppos[0] + Math.sin(pa) * 10, ppos[1] + Math.cos(pa) * 10],
		vol: [Math.sin(pa) * 300, Math.cos(pa) * 300]
	}
	arrow_tick(arrows, id, lag_comp);
}

function arrow_tick(arrows,id,dt) {
	var av = arrows[id].vol;
	var ap = arrows[id].pos;
	arrows[id].pos = [ap[0] + av[0] * dt, ap[1] + av[1]*dt]
}

function moveplayer(id,players,dt,input) {
	if (input.up) {
		players[id].pos[1] -= 100*dt
	}
	if (input.down) {
		players[id].pos[1] += 100*dt
	}
	if (input.left) {
		players[id].pos[0] -= 100*dt
	}
	if (input.right) {
		players[id].pos[0] += 100*dt
	}
	if (input.fleft) {
		players[id].angle += 5*dt
	}
	if (input.fright) {
		players[id].angle -= 5*dt
	}

}

function arrows_tick(arrows,dt,trusttime) {
//	console.log(arrows,dt)
	var time = Date.now();
	for (aid of Object.keys(arrows)) {
		arrow_tick(arrows,aid,dt)
		if ((arrows[aid].time + 1000) < time && trusttime)
			delete arrows[aid]
	}
}

try {
	module.exports = {
		arrow_spawn: arrow_spawn,
		arrow_tick : arrows_tick
	}
} catch {
	// no nodejs I gess
}
