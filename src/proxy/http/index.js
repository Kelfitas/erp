const manager = require('proxy/proxy-connection/manager');
const parser = require('http-string-parser');
const express = require('express');
const cors = require('cors');
const net = require('net');
const tls = require('tls');

const app = express();
const expressWs = require('express-ws')(app);

app.use(cors());
app.use(express.json());

app.get('/api/getHistory', async (req, res) => {
  const connectionsDict = await manager.getAll();
  const connections = Object.keys(connectionsDict).map(k => connectionsDict[k]);

  res.send(JSON.stringify(connections.map(c => c.toSerializableObject())));
  res.end();
});

app.get('/api/getHistory/:id', async (req, res) => {
  const c = await manager.get(req.params.id);
  res.send(c.json());
  res.end();
});

app.post('/api/getHistoryList', async (req, res) => {
  const ids = req.body.data || [];
  const connectionsDict = await manager.getAll();
  const connections = Object.keys(connectionsDict)
    .map(k => connectionsDict[k])
    .filter(con => ids.indexOf(con.id) !== -1);

  res.send(JSON.stringify(connections.map(c => c.toSerializableObject())));
  res.end();
});

app.post('/api/repeat/:id', async (req, res) => {
  const MAX_WAIT = 1000 * 30;
  const c = await manager.get(req.params.id);
  console.log(c.host);
  console.log(c.port);
  console.log('%s', req.body.data.replace(/\r/g, '\\r').replace(/\n/g, '\\n\n'));
  let targetSocket;
  let pConnect;
  if (c.isSSL) {
    pConnect = new Promise((resolve) => {
      targetSocket = tls.connect(c.port, c.host, c.tlsOptions, () => {
        console.log('on connect tls');
        console.log('client connected',
                  targetSocket.authorized ? 'authorized' : 'unauthorized');
        process.stdin.pipe(targetSocket);
        process.stdin.resume();
        resolve();
      });
    });
  } else {
    targetSocket = new net.Socket();
    pConnect = new Promise((resolve) => {
      targetSocket.connect(c.port, c.host, () => {
        console.log('on connect');
        resolve();
      });
    });
  }

  try {
    await pConnect;
    targetSocket.write(req.body.data);

    const rawResponse = await new Promise((resolve, reject) => {
      let d = '';
      let i = 0;
      let to;
      const appendData = (data) => {
        console.log('=====================================================');
        console.log('NEW DATA: ', data.toString());
        console.log('=====================================================');
        d += data.toString();
        if (i === 0) {
          let [headers, body] = d.split('\r\n\r\n');
          let [_len, _body] = body.split('\r\n', 2);
          const len = parseInt(_len, 16);
          body = _body;
          const response = parser.parseResponse(headers);
          const contentLength = parseInt(response.headers['Content-Length'], 10);
          // console.log('response', response);
          // console.log('d.length: ', d.length);
          // console.log('body: ', body);
          // console.log('body.length: ', body.length);
          // console.log('len: ', len);
          if (len <= body.length) {
            // console.log('RESOLVE!!!');
            clearTimeout(to);
            resolve([headers, body].join('\r\n\r\n'));
          }
        }
      };
      targetSocket.on('data', appendData);
      targetSocket.on('error', reject);
      // targetSocket.on('close', () => console.log('close') || resolve(d));
      to = setTimeout(() => {
        reject('timedout');
      }, MAX_WAIT);
    });
    // console.log('=====================================================');
    // console.log('res.send: ', rawResponse);
    // console.log('=====================================================');
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
