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
    if (this.data.length === 1) {
      this.parseData(data);
      this.connect();
    } else {
      this.eve.emit('data', data);
    }
    // this.buffer = Buffer.concat([this.buffer, data]);
  }

  parseData = (data) => {
    const lines = data.toString().split('\r\n');
    const statusLine = lines[0];
    const [method, target, proto] = statusLine.split(' ');
    this.method = method;
    this.target = target;
    this.proto = proto;
    this.headers = parse(lines.filter((item, i) => i > 0 && !!item).join('\r\n'));

    log({method});
    log({target});
    log({proto});
    log(this.headers);

    switch (method) {
      case 'CONNECT':
        this.parseTarget(this.target);
      default:
        return;
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
      this.targetSocket.write(data);
    });

    this.targetSocket.on('data', (data) => {
      log('---PROXY- Receiving message from server\n', data.toString());
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
//     this.targetSocket.write(`GET / HTTP/1.1
// Host www.google.com

// `);

    // this.eve.on('data', msg => this.targetSocket.write(msg));
  }
}

module.exports = Connection;
