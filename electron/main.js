// main.js (CommonJS version)
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const isDev = !app.isPackaged;  // Built-in, no extra package needed

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  startBackend();

  setTimeout(() => {
    if (isDev) {
      mainWindow.loadURL('http://localhost:3000'); // ← your Vite/React dev port
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
      const indexPath = path.join(__dirname, '../frontend/build/index.html');
      mainWindow.loadFile(indexPath);
    }
  }, isDev ? 0 : 1800);

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (backendProcess) backendProcess.kill();
  });
}

function startBackend() {
  const backendPath = path.join(__dirname, '../backend/server.js');
  backendProcess = spawn('node', [backendPath], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: isDev ? 'development' : 'production' }
  });

  backendProcess.stdout.on('data', data => console.log(`Backend: ${data}`));
  backendProcess.stderr.on('data', data => console.error(`Backend ERROR: ${data}`));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});