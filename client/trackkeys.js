var input_table = {
	"a" : "left",
	"d" : "right",
	"w" : "up",
	"s" : "down",
	"q" : "fleft",
	"e" : "fright",
};

var farrowid = 0;

// move to trackkeys.js
document.addEventListener('keypress', (event) => {
        var name = event.key;
	if (name === " ") {
		var id = farrowid++;
		var ppos = players[selfId].pos;
		var pa = players[selfId].angle;
		fakearrows[id] = {
			time: Date.now(),
			pos: [ppos[0] + Math.sin(pa) * 10,ppos[1] + Math.cos(pa) * 10],
			vol: [Math.sin(pa) * 8,Math.cos(pa)*8]
		}
		socket.send(msgpack.encode({fire: players[selfId].pos}));
	}
	if (input_table[name]) {
                inputs[input_table[name]] = true;
        }
}, false);
document.addEventListener('keyup', (event) => {
        var name = event.key;
        if (input_table[name]) {
                inputs[input_table[name]] = false;
        }
}, false);
