var input_table = {
	"a" : "left",
	"d" : "right",
	"w" : "up",
	"s" : "down",
	"q" : "fleft",
	"e" : "fright",
};

// move to trackkeys.js
document.addEventListener('keypress', (event) => {
        var name = event.key;
	if (name === " ")
		socket.send(msgpack.encode({fire: players[selfId].pos}))
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
