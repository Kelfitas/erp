const manager = require('proxy/proxy-connection/manager');
const parser = require('http-string-parser');
const express = require('express');
const cors = require('cors');
const net = require('net');

const app = express();
const expressWs = require('express-ws')(app);

app.use(cors());
app.use(express.json());

app.get('/api/getHistory', (req, res) => {
  const connectionsDict = manager.getAll();
  const connections = Object.keys(connectionsDict).map(k => connectionsDict[k]);

  res.send(JSON.stringify(connections.map(c => ({
    connection: c,
    req: c.requestBuffer && parser.parseRequest(c.requestBuffer.toString()),
    res: c.responseBuffer && parser.parseResponse(c.responseBuffer.toString()),
  }))));
  res.end();
});

app.get('/api/getHistory/:id', (req, res) => {
  const c = manager.get(req.params.id);
  res.send(JSON.stringify(({
    connection: c,
    req: c.requestBuffer && parser.parseRequest(c.requestBuffer.toString()),
    res: c.responseBuffer && parser.parseResponse(c.responseBuffer.toString()),
  })));
  res.end();
});

app.post('/api/getHistoryList', (req, res) => {
  const ids = req.body.data || [];
  const connectionsDict = manager.getAll();
  const connections = Object.keys(connectionsDict)
    .map(k => connectionsDict[k])
    .filter(con => ids.indexOf(con.id) !== -1);

  res.send(JSON.stringify(connections.map(c => ({
    connection: c,
    req: c.requestBuffer && parser.parseRequest(c.requestBuffer.toString()),
    res: c.responseBuffer && parser.parseResponse(c.responseBuffer.toString()),
  }))));
  res.end();
});

app.post('/api/repeat/:id', async (req, res) => {
  const MAX_WAIT = 1000 * 30;
  const c = manager.get(req.params.id);
  console.log(c.host);
  console.log(c.port);
  console.log(req.body.data);
  if (c.port === 443) {
    c.targetSocket = tls.connect(c.port, c.host, c.tlsOptions, c.onConnectTLS);
  } else {
    c.targetSocket = new net.Socket();
    c.targetSocket.connect(c.port, c.host, c.onConnect);
  }

  try {
    c.targetSocket.write(req.body.data);

    const rawResponse = await new Promise((resolve, reject) => {
      c.targetSocket.on('data', resolve);
      c.targetSocket.on('error', reject);
      setTimeout(() => {
        reject('timedout');
      }, MAX_WAIT);
    });
    res.send(rawResponse);
  } catch(err) {
    res.status(500);
    res.send(err);
  }

  res.end();
})

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
