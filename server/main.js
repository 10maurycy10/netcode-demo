const msgpack = require('msgpack-lite')
const uuid = require('uuid')
const WebSocket = require('ws');
const express = require('express');
const config = require('./config.js');

var players = Object.create(null)

var connections = Object.create(null)

// server owned objects
var arrows = Object.create(null)

function killarrows() {
	var time = Date.now();
	for (aid of Object.keys(arrows)) {
		if ((arrows[aid].time + 3000) < time) {
			delete arrows[aid]
		}
	}
}

function update() {
	for (aid of Object.keys(arrows)) {
		arrows[aid].pos[0] += arrows[aid].vol[0]
		arrows[aid].pos[1] += arrows[aid].vol[1]
	}
}

function validatedata(obj) {
	if (typeof(obj) !== 'object') {
		console.log("bad0")
		return false
	}
	if (typeof(obj.pos) !== 'object') {
		return false
	}
	if (typeof(obj.pos[0]) !== 'number') {
		return false
	}
	if (typeof(obj.pos[1]) !== 'number') {
		return false;
	}
	if (typeof(obj.angle) !== 'number') {
		return false;
	}
	// TODO more checks
	return true
}

function broadcastdata() {
	//console.log(connections)
	for (pid of Object.keys(connections)) {
		//console.log(pid)
		connections[pid].send(msgpack.encode({players: players, arrows: arrows}));
	}
}

function handlemsg(data,id,ip) {
	try {
		var obj = msgpack.decode(data)
		if (obj.selfdata) {
			if (validatedata(obj.selfdata))
				players[id] = obj.selfdata;
		}
		if (obj.fire) {
			//let p_pos = players[id].pos
			let p_pos = obj.fire
			let p_a = players[id].angle
			let aid = uuid.v4();
			arrows[aid] = {
				pos: [p_pos[0] + Math.sin(p_a)*20,p_pos[1]+Math.cos(p_a)*20],
				vol: [Math.sin(p_a)*10,Math.cos(p_a)*10],
				time: Date.now()
			};
			if (obj.id !== undefined)
				connections[id].send(msgpack.encode({fireack: obj.id}))
		}
		//console.log(players)
	} catch (e) {
		// TODO log orgin ip!
		console.log(`bad packet! ${e} from ${ip}`)
		return;
	}
} 

function setupServer() {
	// listen for websockets connections.
	const wss = new WebSocket.Server({
		noServer: true
	});
	
	wss.on('connection', (socket,req) => {
		var id = uuid.v4()
		console.log(`join ${id} ${req.socket.remoteAddress}`)
		connections[id] = socket;
		socket.on('message', (msg) => handlemsg(msg,id,req.socket.remoteAddress));
		socket.on('close', () => {
			console.log(`${id} left, ${req.socket.remoteAddress}`)
			delete players[id]
			delete connections[id]
			for (pid of Object.keys(connections)) {
				connections[pid].send(msgpack.encode({leave: [id]}))
			}
		})
		socket.send(msgpack.encode({selfid: id}))
	});

	// express black magic
	const app = express();
	app.use('/assets', express.static('assets'))
	app.use('/', express.static('client'))
	const server = app.listen(config.c_port);
	server.on('upgrade', (request, socket, head) => {
		wss.handleUpgrade(request, socket, head, socket => {
			wss.emit('connection', socket, request);
		});
	});
}

setupServer()

setInterval(killarrows,1000/10)

setInterval(() => {
	update();
	broadcastdata();
},1000/24)
