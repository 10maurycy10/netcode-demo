// TODO dont hardcode ip!!!
var socket = new WebSocket('ws://192.168.1.60:5000');

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

var inputs = {left: false, right: false}

// trackkeys.js
var input_table = {
	"a" : "left",
	"d" : "right"
}

// render.js
var colors = {
	gray: "#666666",
	darkgray: "#333333",
	blue: "#2222EE"
}

function handlemsg(obj) {
	//console.log(obj)
	if (obj.players) {
		for (pid of Object.keys(obj.players)) {
			if (pid !== selfId || obj.overrideself)
				players[pid] = obj.players[pid]
			//else console.log("rejecting self update")
		}
	}
	if (obj.selfid !== undefined) {
		selfId = obj.selfid
		players[selfId] = {}
		players[selfId].pos = [100,100]
	}
	if (obj.leave !== undefined) {
		for (pid of Object.values(obj.leave)) {
			console.log(`removeing ${pid}`)
			delete players[pid]
		}
	}
}

function update_movement() {
	if (!selfId) return;
	if (inputs["left"]) {
		players[selfId].pos[0] -= 1;
	}
	if (inputs["right"]) {
		players[selfId].pos[0] += 1;
	}
	
	socket.send(msgpack.encode({selfdata: players[selfId]}))
	//console.log(pos)
}

socket.addEventListener('open', (event) => {
	// game.js
	socket.onmessage = (msg) => {
		//console.log(msg)
		handlemsg(msgpack.decode(new Uint8Array(msg.data)))
	};

	socket.onclose = () => alert("Disconnected")
	
	setInterval(render, 1000/60)

	setInterval(update_movement, 1000/60)
});

