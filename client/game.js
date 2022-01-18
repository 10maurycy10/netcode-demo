var socket = new WebSocket('wss://' + location.host);

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

var inputs = {left: false, right: false, up: false, down: false}

// render.js
var colors = {
	gray: "#666666",
	darkgray: "#333333",
	blue: "#2222EE",
	red: "#EE2222"
}

function handlemsg(obj) {
	if (obj.players) {
		for (pid of Object.keys(obj.players)) {
			// dont move the owned player
			if (pid !== selfId || obj.overrideself)
				players[pid] = obj.players[pid]
		}
	}
	if (obj.selfid !== undefined) {
		selfId = obj.selfid
		players[selfId] = {}
		players[selfId].pos = [100,100]
	}
	if (obj.leave !== undefined) {
		for (pid of Object.values(obj.leave)) {
			console.log(`removing ${pid}`)
			delete players[pid]
		}
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
	
	// send update to server
	socket.send(msgpack.encode({selfdata: players[selfId]}))
}

socket.addEventListener('open', (event) => {
	// game.js
	socket.onmessage = (msg) => {
		//console.log(msg)
		handlemsg(msgpack.decode(new Uint8Array(msg.data)))
	};

	
	socket.onclose = () => alert("Disconnected")

	// TODO consolidate the updates.
	setInterval(render, 1000/60)

	setInterval(update_movement, 1000/60)
});

socket.addEventListener('error', (e) => {alert(`Disconnected`); console.error(e);})
