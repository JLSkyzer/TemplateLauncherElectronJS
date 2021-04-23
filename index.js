const { app, BrowserWindow, ipcMain, ipcRenderer, } = require('electron')
const { Client, Authenticator} = require('minecraft-launcher-core')
const path = require('path')
const launcher = new Client()
let appdata = app.getPath("appData")

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    title: "Erina World | Launcher",
    icon: path.join(__dirname, "/assets/img/logo.png"),
    autoHideMenuBar: true,
    minWidth: 1000,
    minHeight: 700,
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    }
  })
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
  win.webContents["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;
  win.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
  win.loadFile(path.join(__dirname, "index.html"))
  
  win.webContents.openDevTools()
  ipcMain.on("login", (event, data) => {
    Authenticator.getAuth(data.u, data.p).then(() => {
      event.sender.send("done")
      win.loadFile(path.join(__dirname, "./app.html"))
      let opts = {
          clientPackage: "https://www.dropbox.com/s/gip94ekzir47lmo/Modpack.zip?dl=1",
          authorization: Authenticator.getAuth(data.u, data.p),
          root: appdata + "/.erinaWorld",
          version: {
              number: "1.12.2",
              type: "release"
          },
          forge: path.join(appdata + "/.erinaWorld/forge.jar"),
          memory: {
              max: "2000",
              min: "1000"
          }
      }

      ipcMain.on('settings', (event, data) => {
        opts.memory.min = data.min
        opts.memory.max = data.max
      })
      
      ipcMain.on("launch", () => {
        console.log(root);
        launcher.launch(opts);
      
        launcher.on('debug', (e) => console.log(e));
        launcher.on('data', (e) => console.log(e));
        launcher.on('debug', (e) => {
          event.sender.send("debug", e)
        })
        launcher.on('data', (e) => {
          event.sender.send("data", e)
        })
      })

    }).catch((err) => {
      event.sender.send("err", { er: err })
    })
  })
}



app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {

    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
