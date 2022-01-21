var address = "wss://" + location.host

if (location.protocol === "http:")
	address = "ws://" + location.host

var socket = new WebSocket(address);

socket.binaryType = 'arraybuffer'

// ref.js
var c = document.getElementById("gamemap");

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


var selfId = null;
var players = Object.create(null);
// the playerdata last update, used for interpolation
var players_old = Object.create(null);
var last_update_time = performance.now();

var arrows = Object.create(null);
var fakearrows = Object.create(null);
var inputs = {left: false, right: false, up: false, down: false, fleft: false, fright: false}
var player_props = ["pos","angle"]
var gameping = 0;

// render.js
var colors = {
	gray: "#666666",
	darkgray: "#333333",
	blue: "#2222EE",
	red: "#EE2222"
}

function snap(proto, data) {
	var o = {}
	for (key of player_props) {
		o[key] = data[key] ?? proto[key] 
	}
	return o;
}

function handlemsg(obj) {
	if (obj.players) {
		last_update_time = performance.now()
		// backup old player data;
		for (pid of Object.keys(players))
			players_old[pid] = players[pid];
		// update positions
		for (pid of Object.keys(obj.players)) {
			// dont move the owned player
			if (pid !== selfId || obj.overrideself) {
				players[pid] = snap(players[pid],obj.players[pid]);
			}
		}
	}
	if (obj.fireack !== undefined) {
		console.log(`arrow ${obj.fireack} acked, removing fake arrow`)
		delete fakearrows[obj.fireack]
	}
	if (obj.arrows !== undefined)
		arrows = obj.arrows;
	if (obj.selfid !== undefined) {
		selfId = obj.selfid
		players[selfId] = {}
		players[selfId].pos = [100,100]
		players[selfId].angle = 0
	}
	if (obj.leave !== undefined) {
		for (pid of Object.values(obj.leave)) {
			console.log(`removing ${pid}`)
			delete players[pid]
		}
	}
	if (obj.pong !== undefined) {
		var mesured_ping = Date.now() - obj.pong;
		gameping = gameping*0.9 + mesured_ping * 0.1
		//console.log(`pong: ${obj.pong}; time ${Date.now()} ; ping: ${mesured_ping}; ping 2s rolling ${gameping};`,obj)
	}

}

function update_movement() {
	if (!selfId) return;
	if (inputs["left"]) {
		players[selfId].pos[0] -= 2;
	}
	if (inputs["right"]) {
		players[selfId].pos[0] += 2;
	}
	if (inputs["down"]) {
		players[selfId].pos[1] += 2;
	}
	if (inputs["up"]) {
		players[selfId].pos[1] -= 2;
	}
	if (inputs["fleft"]) {
		players[selfId].angle += 0.1
	}
	if (inputs["fright"]) {
		players[selfId].angle -= 0.1
	}
	
	// send update to server
	socket.send(msgpack.encode({selfdata: players[selfId]}))
}

function dorender(t) {	
	render(t);
	requestAnimationFrame(dorender);
}

socket.addEventListener('open', (event) => {
	// game.js
	socket.onmessage = (msg) => {
		//console.log(msg)
		handlemsg(msgpack.decode(new Uint8Array(msg.data)))
	};

	
	socket.onclose = () => alert("Disconnected")

	// TODO consolidate the updates.
	
	requestAnimationFrame(dorender)

	setInterval(update_movement, 1000/60)
	setInterval(() => socket.send(msgpack.encode({ping: Date.now()},200)))
	setInterval(() =>arrows_tick(fakearrows,1/24), 1000/24);
});

socket.addEventListener('error', (e) => {alert(`Disconnected`); console.error(e);})
