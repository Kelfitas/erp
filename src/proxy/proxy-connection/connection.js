const net = require('net');
const fs = require('fs');
const tls = require('tls');
const EventEmitter = require('events');
const parse = require('parse-headers');
const parser = require('http-string-parser');
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
    // this.initialMethod = null;
    this.dataIndex = 0;
    this.requestURL = null;
    this.initialMethod = null;
    this.method = null;
    this.target = null;
    this.proto = null;
    this.statusCode = null;
    this.statusText = null;
    this.rawHeaders = '';
    this.headers = null;
    this.body = '';
    this.host = null;
    this.port = null;
    this.isSSL = false;
    this.tlsOptions = {
      rejectUnauthorized: false,
    };

    this.loadAttributes = {
      // socket: undefined,
      id: val => val,
      data: val => val,
      requestBuffer: val => Buffer.from(val.data),
      responseBuffer: val => Buffer.from(val.data),
      // eve: () => new EventEmitter();

      /** TCP/HTTP properties */
      // this.initialMethod = null;
      dataIndex: val => val,
      initialMethod: val => val,
      method: val => val,
      target: val => val,
      proto: val => val,
      statusCode: val => val,
      statusText: val => val,
      rawHeaders: val => val,
      headers: val => val,
      body: val => val,
      host: val => val,
      port: val => val,
      isSSL: val => val,
      requestURL: val => {
        const proto = this.isSSL ? 'https' : 'http';
        const base = `${proto}://${this.host}`;
        log(`(${base}, ${this.target})`);
        return new URL(this.target, base);
      },
      // tlsOptions: val => val,
    };
  }


  dump() {
    const obj = {};
    const keys = Object.keys(this.loadAttributes);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      obj[key] = this[key];
    }
    return JSON.stringify(obj);
  }

  load(saved) {
    try {
      const keys = Object.keys(this.loadAttributes);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (typeof saved[key] !== undefined) {
          this[key] = this.loadAttributes[key].call(this, saved[key]);
        }
      }
    } catch (err) {
      log('err: %o', err);
    }
  }

  toSerializableObject() {
    return ({
      connection: this,
      req: this.requestBuffer && parser.parseRequest(this.requestBuffer.toString()),
      res: this.responseBuffer && parser.parseResponse(this.responseBuffer.toString()),
    });
  }

  json() {
    return JSON.stringify(this.toSerializableObject());
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

    log('index: ', this.dataIndex);

    try {
      const [headersRaw, body] = data.toString().split('\r\n\r\n');
      const headers = headersRaw.split('\r\n');
      const statusLine = headers[0];
      let method, target, proto, statusCode, statusText;
      const status = statusLine.split(' ');

      if (type === Data.TYPE_REQ) {
        method = status[0];
        target = status[1];
        proto = status[2];
        this.requestStatus = status;
        // this.data.push(new Data(data, Data.TYPE_REQ));
        if (this.dataIndex > 0) {
          this.requestBuffer = Buffer.concat([this.requestBuffer, data]);
        }
      } else if (type === Data.TYPE_RES) {
        proto = status[0];
        statusCode = status[1];
        statusText = status.slice(2).join(' ');
        this.responseStatus = status;
        // this.data.push(new Data(data, Data.TYPE_RES));
        this.responseBuffer = Buffer.concat([this.responseBuffer, data]);
      }

      const setMeta = () => {
        this.initialMethod = this.initialMethod || method;
        this.method = method;
        this.target = target;
        this.proto = proto;
        this.rawHeaders = headers.slice(1).join('\r\n');
        this.headers = parse(headers.slice(1).join('\r\n'));
        this.body = body;
      };

      if (this.dataIndex === 0) {
        setMeta();
        this.parseTarget(target);
        this.connect();
      } else {
        if (this.initialMethod === 'CONNECT') {
          if (this.dataIndex === 1) {
            setMeta();
          } else if (this.dataIndex === 2) {
            this.statusCode = statusCode;
            this.statusText = statusText;
          }
        } else {
          if (this.dataIndex === 1) {
            this.statusCode = statusCode;
            this.statusText = statusText;
          }
        }
      }

      console.log(`${this.method} ${this.target} ${this.proto} ${this.statusCode} ${this.statusText}`)
    } catch(error) {
      log('parse error: ', error);
    } finally {
      this.dataIndex++;
    }
  }

  parseTarget = (target) => {
    if (this.method === 'CONNECT') {
      this.isSSL = true;
      const [host, port] = target.split(':');
      this.host = host;
      this.port = parseInt(port, 10) || 80;

      return;
    }

    this.requestURL = new URL(target);
    log(this.requestURL);
    this.target = this.requestURL.pathname;
    this.host = this.requestURL.hostname;
    this.port = parseInt(this.requestURL.port, 10) || 80;
  }

  connect = () => {
    if (this.isSSL) {
      this.originSocket = new tls.TLSSocket(this.socket, tlsServerOptions);
      this.targetSocket = tls.connect(this.port, this.host, this.tlsOptions, this.onConnectTLS);
      this.targetSocket.on('error', this.onTargetSocketError);
    } else {
      this.originSocket = this.socket;
      this.targetSocket = new net.Socket();
      this.targetSocket.on('error', this.onTargetSocketError);
      this.targetSocket.connect(this.port, this.host, this.onConnect);
    }

    this.targetSocket.on('data', (data) => {
      log('---PROXY- Receiving message from server\n', data.toString());
      this.parseResponse(data);
      this.originSocket.write(data);
    });

  }

  onTargetSocketError = (err) => {
    console.warn('socket err: ', err);
    this.socket.write(`HTTP/1.1 502 Bad Gateway\r\n${err}\r\n`);
  }

  onConnectTLS = () => {
    console.log('client connected',
              this.targetSocket.authorized ? 'authorized' : 'unauthorized');
    process.stdin.pipe(this.targetSocket);
    process.stdin.resume();

    this.originSocket.on('data', (data) => {
      log('---PROXY- Receiving message from client\n', data.toString());
      this.parseRequest(data);
      this.targetSocket.write(data);
    });

    log('sending back 200 ok');
    this.socket.write('HTTP/1.1 200 OK\r\n\r\n');
    // this.onConnect();

    this.emit('save');
  }

  onConnect = () => {
    const d = [
      `${this.method} ${this.requestURL.pathname} ${this.proto}`,
      `${this.rawHeaders}`,
      ``,
      `${this.body}`,
    ].join('\r\n');
    log(`Sending:\r\n${d}`);
    this.requestBuffer = Buffer.concat([this.requestBuffer, Buffer.from(d)]);
    this.targetSocket.write(d);
    // log('sending back 200 ok');
    // this.socket.write('HTTP/1.1 200 OK\r\n\r\n');

    this.emit('save');
  }
}

module.exports = Connection;
