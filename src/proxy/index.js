const log = require('lib/debug')('proxy');
const parentLog = (...args) => process.send(args.join(" "));

const net = require('net');
const http = require('./http');
const { handleConnection } = require('./proxy-connection');
const { MSG_EXIT } = require('constants/messages');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const PROXY_PORT = process.env.PROXY_PORT || 8080;
const HTTP_PORT = process.env.HTTP_PORT || 8081;

parentLog('Ping!');

process.on('message', (message) => {
  log('message from parent:', message);
  switch (message) {
  case MSG_EXIT:
    process.exit(0);
    break;

  default:
    break;
  }
});

net.createServer(handleConnection).listen(PROXY_PORT);
http.listen(HTTP_PORT);
