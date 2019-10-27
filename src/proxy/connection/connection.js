const net = require('net');
const fs = require('fs');
const tls = require('tls');
const EventEmitter = require('events');
const parse = require('parse-headers');
const uuid = require('uuid/v4');
const log = require('lib/debug')('proxy:connection:connection');

const tlsServerOptions = {
  key: fs.readFileSync('ssl/server-key.pem'),
  cert: fs.readFileSync('ssl/server-cert.pem'),
  isServer: true,
};

class Data {
  static const TYPE_IN = 0;
  static const TYPE_OUT = 1;

  constructor(data, type) {
    this.data = data;
    this.type = type;
  }
}

class Connection {
  constructor(socket) {
    this.socket = socket;
    this.id = uuid();
    this.buffer = Buffer.from('');
    this.data = [];
    this.eve = new EventEmitter();

    /** TCP/HTTP properties */
    this.method = null;
    this.target = null;
    this.proto = null;
    this.headers = null;
    this.host = null;
    this.port = null;
    this.tlsOptions = {
      rejectUnauthorized: false,
    };
  }

  init = () => {
    this.socket.on('data', this.onMessage);
    this.socket.on('close', () => log('close'));
    this.socket.on('end', () => log('end'));
    this.socket.on('drain', () => log('drain'));
    this.socket.on('connect', () => log('connect'));
  }

  onMessage = (data) => {
    log("---PROXY- got message:", "\n" + data.toString());
    this.data.push(data);
    this.parseRequest(data);
  }

  parseRequest = data => this.parseData(data, 'request');
  parseResponse = data => this.parseData(data, 'response');

  parseData = (data, type) => {
    if (typeof type === 'undefined') {
      type = 'request';
    }

    try {
      const [headersRaw, body] = data.toString().split('\r\n\r\n');
      const headers = headersRaw.split('\r\n');
      const statusLine = headers[0];
      const status = statusLine.split(' ', 3);

      switch (method) {
        case 'CONNECT':
          this.parseTarget(this.target);
          this.connect();
        default:
          this.method = method;
          this.target = target;
          this.proto = proto;
          this.headers = parse(headers.slice(1).join('\r\n'));
      }
      return [method, target, proto];
    } catch(error) {
      log('parse error: ', error);
    }
  }

  parseTarget = (target) => {
    const [host, port] = target.split(':');
    this.host = host;
    this.port = parseInt(port, 10);
  }

  connect = () => {
    if (this.port === 443) {
      this.originSocket = new tls.TLSSocket(this.socket, tlsServerOptions);
      this.targetSocket = tls.connect(this.port, this.host, this.tlsOptions, this.onConnectTLS);
    } else {
      this.originSocket = this.socket;
      this.targetSocket = new net.Socket();
      this.targetSocket.connect(this.port, this.host, this.onConnect);
    }
    this.targetSocket.on('error', console.warn);

    this.originSocket.on('data', (data) => {
      log('---PROXY- Receiving message from client\n', data.toString());
      this.parseRequest(data);
      this.targetSocket.write(data);
    });

    this.targetSocket.on('data', (data) => {
      log('---PROXY- Receiving message from server\n', data.toString());
      this.parseResponse(data);
      this.originSocket.write(data);
    });

  }

  onConnectTLS = () => {
    console.log('client connected',
              this.targetSocket.authorized ? 'authorized' : 'unauthorized');
    process.stdin.pipe(this.targetSocket);
    process.stdin.resume();
    this.onConnect();
  }

  onConnect = () => {
    log('sending back 200 ok');
    this.socket.write('HTTP/1.1 200 OK\r\n\r\n');
  }
}

module.exports = Connection;
