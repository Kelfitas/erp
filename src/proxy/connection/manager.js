const log = require('lib/debug')('proxy:connection:manager');

class ConnectionManager {
  constructor() {
    this.connections = {};
    // setInterval(() => {
    //   log({ connections: this.connections });
    // }, 1000);
  }

  add = (connection) => {
    log(`New connection: <${connection.id}>`);
    this.connections[connection.id] = connection;
    connection.socket.on('close', () => this.remove(connection.id));
  }

  get = id => this.connections[id];
  remove = id => { delete this.connections[id] };
  getAll = () => this.connections;
}

module.exports = new ConnectionManager();
