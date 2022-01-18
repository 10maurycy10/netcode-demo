// move to trackkeys.js
document.addEventListener('keypress', (event) => {
        var name = event.key;
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
