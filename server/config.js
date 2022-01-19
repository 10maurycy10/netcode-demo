var config = {
	c_port: 5000,
}

if (process.env.PORT !== undefined)
	config.c_port = JSON.parse(process.env.PORT);

module.exports = config
