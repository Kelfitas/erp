const net = require('net');
const port = process.env.PORT ? (process.env.PORT - 100) : 3000;

process.env.ELECTRON_START_URL = `http://localhost:${port}`;

const client = new net.Socket();

let startedElectron = false;
const tryConnection = () => client.connect({port: port}, () => {
  client.end();
  if (!startedElectron) {
    console.log('starting electron');
    startedElectron = true;
    const exec = require('child_process').exec;
    const electron = exec('yarn electron', (err, stdout, stderr) => {
      console.log({ err, stdout, stderr });
    });
    electron.stdout.on("data", function(data) {
      console.log("stdout: " + data.toString());
    });
    electron.stderr.on("data", function(data) {
      console.log("stderr: " + data.toString());
    });
  }
});

tryConnection();

client.on('error', (error) => {
    console.log('err');
    setTimeout(tryConnection, 1000);
});
