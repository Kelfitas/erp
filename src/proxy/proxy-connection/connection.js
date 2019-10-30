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
  static TYPE_REQ = 'req';
  static TYPE_RES = 'res';

  constructor(data, type) {
    this.data = data;
    this.type = type;
  }
}

class Connection {
  constructor(socket) {
    this.socket = socket;
    this.id = uuid();
    this.data = [];
    this.requestBuffer = Buffer.from('');
    this.responseBuffer = Buffer.from('');
    this.eve = new EventEmitter();

    /** TCP/HTTP properties */
    this.method = null;
    this.target = null;
    this.proto = null;
    this.statusCode = null;
    this.statusText = null;
    this.headers = null;
    this.host = null;
    this.port = null;
    this.tlsOptions = {
      rejectUnauthorized: false,
    };
  }

  on = (...props) => this.eve.on(...props);
  emit = (...props) => this.eve.emit(...props);

  init = () => {
    this.emit('init');
    this.socket.on('data', this.onMessage);
    // this.socket.on('close', () => log('close'));
    // this.socket.on('close', () => log('request: \n', this.requestBuffer.toString()));
    // this.socket.on('close', () => log('response: \n', this.responseBuffer.toString()));
    this.socket.on('close', () => {
      this.emit('close', this.requestBuffer, this.responseBuffer);
    });
  }

  onMessage = (data) => {
    log("---PROXY- got message:", "\n" + data.toString());
    this.parseRequest(data);
  }

  parseRequest = data => this.parseData(data, Data.TYPE_REQ);
  parseResponse = data => this.parseData(data, Data.TYPE_RES);

  parseData = (data, type) => {
    if (typeof type === 'undefined') {
      type = Data.TYPE_REQ;
    }

    try {
      const [headersRaw, body] = data.toString().split('\r\n\r\n');
      const headers = headersRaw.split('\r\n');
      const statusLine = headers[0];
      let method, target, proto, statusCode, statusText;
      const status = statusLine.split(' ', 3);

      if (type === Data.TYPE_REQ) {
        method = status[0];
        target = status[1];
        proto = status[2];
        this.requestStatus = status;
        // this.data.push(new Data(data, Data.TYPE_REQ));
        if (method !== 'CONNECT') {
          this.requestBuffer = Buffer.concat([this.requestBuffer, data]);
        }
      } else if (type === Data.TYPE_RES) {
        proto = status[0];
        statusCode = status[1];
        statusText = status[2];
        this.responseStatus = status;
        // this.data.push(new Data(data, Data.TYPE_RES));
        this.responseBuffer = Buffer.concat([this.responseBuffer, data]);
      }

      switch (method) {
        case 'CONNECT':
          this.parseTarget(target);
          this.connect();
        default:
          this.method = method;
          this.target = target;
          this.proto = proto;
          this.statusCode = statusCode;
          this.statusText = statusText;
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
