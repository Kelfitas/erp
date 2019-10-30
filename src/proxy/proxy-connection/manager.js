const EventEmitter = require('events');
const log = require('lib/debug')('proxy:connection:manager');

class ConnectionManager {
  constructor() {
    this.connections = {};
    // setInterval(() => {
    //   log({ connections: this.connections });
    // }, 1000);
    this.eve = new EventEmitter();
  }

  add = (connection) => {
    log(`New connection: <${connection.id}>`);
    this.connections[connection.id] = connection;
    connection.on('init', () => {
      this.emit('state-change', 'init', connection, null, null);
    });
    connection.on('close', (reqBuffer, resBuffer) => {
      // this.remove(connection.id);
      this.emit('state-change', 'close', connection, reqBuffer, resBuffer);
    });
  }

  on = (...props) => this.eve.on(...props);
  off = (...props) => this.eve.off(...props);
  emit = (...props) => this.eve.emit(...props);
  get = id => this.connections[id];
  remove = id => { delete this.connections[id] };
  getAll = () => this.connections;
}

module.exports = new ConnectionManager();
