const msgpack = require('msgpack-lite')
const uuid = require('uuid')
const WebSocket = require('ws');
const express = require('express');

var players = Object.create(null)

var connections = Object.create(null)

function broadcastdata() {
	//console.log(connections)
	for (pid of Object.keys(connections)) {
		//console.log(pid)
		connections[pid].send(msgpack.encode({players: players}))
	}
}

function handlemsg(data,id) {
	try {
		var obj = msgpack.decode(data)
		if (obj.selfdata) {
			players[id] = obj.selfdata;
		}
		//console.log(players)
	} catch (e) {
		// TODO log orgin ip!
		console.log(`bad packet! ${e}`)
		return;
	}
} 

function setupServer() {
	// listen for websockets connections.
	const wss = new WebSocket.Server({
		noServer: true
	});
	
	wss.on('connection', socket => {
		var id = uuid.v4()
		connections[id] = socket;
		socket.on('message', (msg) => handlemsg(msg,id));
		socket.on('close', () => {
			console.log("someone left")
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
	const server = app.listen(5000);
	server.on('upgrade', (request, socket, head) => {
		wss.handleUpgrade(request, socket, head, socket => {
			wss.emit('connection', socket, request);
		});
	});
}

setupServer()

setInterval(broadcastdata,1000/24)
