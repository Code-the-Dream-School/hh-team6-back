const { server } = require('./app');
const { PORT = 8000 } = process.env;

const listener = () => console.log(`Listening on Port ${PORT}!`);
server.listen(PORT, listener);
