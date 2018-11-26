const express = require('express');
const next = require('next');
const routes = require('./routes');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
	const server = express();
	server.use(handler);

	server.get('*', (req, res) => {
		return handle(req, res);
	});

	server.listen(3000, (error) => {
		if (error) throw error;
		console.log('> app ready on http://localhost:3000/');
	});
}).catch((error) => {
	console.error(error.stack);
	process.exit(1);
});