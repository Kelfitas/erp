const EventEmitter = require('events');
const net = require('net');
const log = require('lib/debug')('proxy:connection:manager');
const storage = require('lib/storage');
const Connection = require('./connection');

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
    connection.on('save', () => {
      log(`save - ${connection.id}`);
      storage.set(connection.id, connection);
    });
  }

  on = (...props) => this.eve.on(...props);
  off = (...props) => this.eve.off(...props);
  emit = (...props) => this.eve.emit(...props);
  get = async (id) => {
    if (!this.connections[id]) {
      try {
        const val = await storage.get(id);
        this.connections[id] = new Connection();
        this.connections[id].load(val);
      } catch(err) {
        log('err: %o', err);
      }
    }

    return this.connections[id];
  };
  remove = id => { delete this.connections[id] };
  getAll = async () => this.connections;
}

module.exports = new ConnectionManager();
