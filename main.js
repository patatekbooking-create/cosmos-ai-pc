// Cosmos AI pour Windows : la fenêtre de l'application, reliée au serveur Cosmos AI (mises à jour automatiques côté serveur)
const { app, BrowserWindow, shell, Menu, dialog, net } = require('electron');
const VERSION = require('./package.json').version;
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
  // Agent de navigateur sans la mention « Electron » : Google refuse sinon la connexion YouTube dans une application
  win.webContents.setUserAgent(win.webContents.getUserAgent().replace(/\s*(Electron|cosmos-ai)\/\S+/gi, ''));
  win.loadURL(URL_APP);
  // F5 / Ctrl+R : recharger (dernière version de l'application) · Ctrl+Maj+R : recharger sans cache
  win.webContents.on('before-input-event', (e, i) => {
    if (i.type !== 'keyDown') return;
    if (i.key === 'F5' || ((i.control || i.meta) && i.key.toLowerCase() === 'r')) { e.preventDefault(); i.shift ? win.webContents.reloadIgnoringCache() : win.webContents.reload(); }
  });
  // Liens externes (Instagram, TikTok, pages d'aide…) : ouverts dans le navigateur ; connexions aux plateformes : dans l'application
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => {
    try { const h = new URL(url).hostname; if (!HOSTS.includes(h) && !/(tiktok|instagram|facebook|google|youtube|apple)\.com$/.test(h)) { e.preventDefault(); shell.openExternal(url); } } catch {}
  });
  win.webContents.on('did-fail-load', () => win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent('<body style="background:#070616;color:#efedff;font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><h2>Pas de connexion internet</h2><p>Cosmos AI a besoin d\'internet. Vérifie ta connexion puis</p><a href="' + URL_APP + '" style="color:#c6b6ff">réessaie</a></div></body>')));
}
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
// Nouvelle version de la fenêtre Windows ? On prévient une fois au démarrage (l'application elle-même se met à jour toute seule)
async function checkUpdate() {
  try {
    const r = await net.fetch('https://raw.githubusercontent.com/patatekbooking-create/cosmos-ai-pc/main/package.json', { cache: 'no-store' });
    const latest = (await r.json()).version, n = v => v.split('.').map(Number), a = n(latest), b = n(VERSION);
    const newer = a[0] > b[0] || (a[0] === b[0] && (a[1] > b[1] || (a[1] === b[1] && a[2] > b[2])));
    if (!newer || !win) return;
    const { response } = await dialog.showMessageBox(win, { type: 'info', buttons: ['Télécharger', 'Plus tard'], defaultId: 0, cancelId: 1, title: 'Mise à jour de Cosmos AI',
      message: `Une nouvelle version de Cosmos AI pour Windows est disponible (${latest}).`, detail: 'Télécharge-la, ferme cette fenêtre puis ouvre le nouveau fichier Cosmos-AI.exe.' });
    if (response === 0) shell.openExternal(URL_APP + '/telecharger');
  } catch {}
}
app.whenReady().then(() => { create(); setTimeout(checkUpdate, 5000); });
app.on('window-all-closed', () => app.quit());
