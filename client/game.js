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
var remove_old_fake_arrows = true;

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
		for (pid of (Object.keys(players)))
			players_old[pid] = players[pid]
		for (pid of (Object.keys(obj.players)))
			if (pid !== selfId)
				players[pid] = obj.players[pid]
	}
	if (obj.fireack !== undefined) {
		if (remove_old_fake_arrows) {
			console.log(`arrow ${obj.fireack} acked, removing fake arrow`)
			delete fakearrows[obj.fireack]
		}
	}
	if (obj.arrows !== undefined) {
		console.log(obj)
		arrows = obj.arrows
	}
	if (obj.selfid !== undefined) {
		selfId = obj.selfid;
		players[selfId] = {}
		players[selfId].pos = [100,100]
		players[selfId].angle = 0;
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
	}

}

function update_movement(dt) {
	if (!selfId) return;
	moveplayer(selfId, players, dt, inputs)
	socket.send(msgpack.encode({selfdata: players[selfId]}))
}

var last_frame = Date.now();
function frame(t) {	
	render(t);
	arrows_tick(arrows,     (t - last_frame)/1000,false)
	arrows_tick(fakearrows, (t - last_frame)/1000,false);
	update_movement((t - last_frame)/1000);
	last_frame = t;
	requestAnimationFrame(frame);
}

socket.addEventListener('open', (event) => {
	// game.js
	socket.onmessage = (msg) => setTimeout(() => {
		//console.log(msg)
		handlemsg(msgpack.decode(new Uint8Array(msg.data)))
	},300);

	
	socket.onclose = () => alert("Disconnected")

	// TODO consolidate the updates.
	
	requestAnimationFrame(frame)
	setInterval(() => socket.send(msgpack.encode({ping: Date.now()})))
});

socket.addEventListener('error', (e) => {alert(`Disconnected`); console.error(e);})
