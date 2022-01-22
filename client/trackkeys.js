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
        //console.log(event)
	var name = event.key;
	if (name === " ") {
		var id = farrowid++;
		var player = players[selfId];
		arrow_spawn(player,id,0,fakearrows)
		socket.send(msgpack.encode({fire: players[selfId].pos, id: id, leadtime: gameping}));
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
