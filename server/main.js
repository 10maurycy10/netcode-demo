const msgpack = require('msgpack-lite')
const uuid = require('uuid')
const WebSocket = require('ws');
const express = require('express');
const config = require('./config.js');
const game = require('../shared/game.js')

var players = Object.create(null)

var connections = Object.create(null)

// server owned objects
var arrows = Object.create(null)

function update() {
	game.arrow_tick(arrows,1/24,true)
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
			let leadtime = obj.leadtime / 1000;
			game.arrow_spawn(players[id],uuid.v4(),leadtime,arrows)
			if (obj.id !== undefined)
				connections[id].send(msgpack.encode({fireack: obj.id}))
		}
		if (obj.ping) {
			connections[id].send(msgpack.encode({pong: obj.ping}))
		}
		//console.log(players)
	} catch (e) {
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
	app.use('/shared', express.static('shared'))
	app.use('/', express.static('client'))
	const server = app.listen(config.c_port);
	server.on('upgrade', (request, socket, head) => {
		wss.handleUpgrade(request, socket, head, socket => {
			wss.emit('connection', socket, request);
		});
	});
}

setupServer()


setInterval(() => {
	update();
	broadcastdata();
},1000/24)
