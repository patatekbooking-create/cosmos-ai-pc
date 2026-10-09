// Cosmos AI pour Windows : la fenêtre de l'application, reliée au serveur Cosmos AI (mises à jour automatiques côté serveur)
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const URL_APP = 'https://cosmos-ai-production.up.railway.app';
const HOSTS = ['cosmos-ai-production.up.railway.app', 'app.cosmos-records.fr', 'checkout.stripe.com', 'billing.stripe.com'];

if (!app.requestSingleInstanceLock()) app.quit();
let win;
function create() {
  win = new BrowserWindow({
    width: 1360, height: 880, minWidth: 380, minHeight: 600, title: 'Cosmos AI', backgroundColor: '#070616',
    icon: path.join(__dirname, 'build', 'icon.png'), autoHideMenuBar: true, show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: true }
  });
  Menu.setApplicationMenu(null);
  win.once('ready-to-show', () => win.show());
  win.loadURL(URL_APP);
  // Liens externes (Instagram, TikTok, pages d'aide…) : ouverts dans le navigateur ; connexions aux plateformes : dans l'application
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => {
    try { const h = new URL(url).hostname; if (!HOSTS.includes(h) && !/(tiktok|instagram|facebook|google|youtube|apple)\.com$/.test(h)) { e.preventDefault(); shell.openExternal(url); } } catch {}
  });
  win.webContents.on('did-fail-load', () => win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent('<body style="background:#070616;color:#efedff;font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><h2>Pas de connexion internet</h2><p>Cosmos AI a besoin d\'internet. Vérifie ta connexion puis</p><a href="' + URL_APP + '" style="color:#c6b6ff">réessaie</a></div></body>')));
}
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
