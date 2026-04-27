const { app, BrowserWindow } = require('electron')
const path = require('path')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../img/snackmaker.ico'), // icono de la app
    title: 'SnackMaker'
  })

  // Carga tu app desde los archivos estáticos
  win.loadFile(path.join(__dirname, '../dist/index.html'))

  //win.webContents.openDevTools()  // ← añade esto temporalmente

  // Oculta la barra de menú por defecto
  win.setMenuBarVisibility(false)
})

// Cierra la app cuando se cierran todas las ventanas (comportamiento Windows/Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})