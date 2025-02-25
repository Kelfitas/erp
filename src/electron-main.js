// Modules to control application life and create native browser window
const { app, globalShortcut, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const fork = require('child_process').fork;
const log = require('./lib/debug')('main');
const { MSG_EXIT } = require('./constants/messages');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const forkProxy = () => {
  const program = path.join(__dirname, 'proxy/index.js');
  const parameters = [];
  const options = {
    // stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ],
  };

  return fork(program, parameters, options);
};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  });

  // const child = forkProxy();
  // child.on('message', message => {
  //   log('message from child:', message);
  //   child.send('Pong');
  // });

  // and load the index.html of the app.
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '..', '/build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  mainWindow.loadURL(startUrl);
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  process.once('SIGTERM', function (code) {
    log('SIGTERM received...');
    // child.send(MSG_EXIT);
    process.exit();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // child.send(MSG_EXIT);
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
