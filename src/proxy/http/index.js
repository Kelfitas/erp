const manager = require('proxy/proxy-connection/manager');
const parser = require('http-string-parser');
const express = require('express');
const cors = require('cors');

const app = express();
const expressWs = require('express-ws')(app);

app.use(cors());

app.get('/api/getHistory', function (req, res) {
  const connectionsDict = manager.getAll();
  const connections = Object.keys(connectionsDict).map(k => connectionsDict[k]);

  res.send(JSON.stringify(connections.map(c => ({
    connection: c,
    req: c.requestBuffer && parser.parseRequest(c.requestBuffer.toString()),
    res: c.responseBuffer && parser.parseResponse(c.responseBuffer.toString()),
  }))));
  res.end();
});

app.get('/api/getHistory/:id', function (req, res) {
  const c = manager.get(req.params.id);
  res.send(JSON.stringify(({
    connection: c,
    req: c.requestBuffer && parser.parseRequest(c.requestBuffer.toString()),
    res: c.responseBuffer && parser.parseResponse(c.responseBuffer.toString()),
  })));
  res.end();
});

const handleStateChange = ws => (event, connection, reqBuffer, resBuffer) => {
  ws.send(JSON.stringify({
    event,
    connection,
    req: reqBuffer && parser.parseRequest(reqBuffer.toString()),
    res: resBuffer && parser.parseResponse(resBuffer.toString()),
  }));
};

app.ws('/api/ws', function(ws, req) {
  const handler = handleStateChange(ws);
  manager.on('state-change', handler);

  ws.on('close', () => {
    console.log('AAAAA close AAAA');
    manager.off('state-change', handler);
  })
  // ws.on('message', function(msg) {
  //   ws.send(msg);
  // });
});

module.exports = app;
