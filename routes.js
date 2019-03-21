const nextRoutes = require('next-routes');
const routes = module.exports = nextRoutes();

// routes.add({path}, {name of file in pages directory});
routes.add('/', 'index');