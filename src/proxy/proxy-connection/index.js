const Connection = require('./connection');
const manager = require('./manager');

const handleConnection = (socket) => {
  const connection = new Connection(socket);
  connection.init();
  manager.add(connection);
};

module.exports = {
  handleConnection,
};
