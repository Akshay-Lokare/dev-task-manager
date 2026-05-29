const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } = require('electron')
const fs = require('node:fs')
const path = require('path')
const Store = require('electron-store')

const store = new Store({ name: 'dev-tasks' })

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
const appId = 'com.dev.tasktracker'

const resolveIconPath = (fileName) => {
  const packagedPath = path.join(process.resourcesPath, 'app.asar', 'build', fileName)
  if (fs.existsSync(packagedPath)) return packagedPath
  return path.join(__dirname, '..', 'build', fileName)
}

const iconPath = resolveIconPath('icon.png')
const trayIconPath = resolveIconPath('icon-256.png')
let mainWindow
let tray
let isQuitting = false

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 880,
    minHeight: 560,
    backgroundColor: '#fafafa',
    title: 'MeowLogger',
    icon: iconPath,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.webContents.on('did-fail-load', (_event, code, description, url) => {
    console.error('[electron] Failed to load page:', code, description, url)
  })

  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      win.hide()
    }
  })

  if (isDev) {
    win.loadURL(devUrl)
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow = win
  return win
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow()
    return
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }
  mainWindow.show()
  mainWindow.focus()
}

function toggleMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow()
    return
  }

  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    showMainWindow()
  }
}

function createTray() {
  if (tray) return

  const trayIcon = nativeImage.createFromPath(trayIconPath).resize({ width: 16, height: 16 })
  tray = new Tray(trayIcon)
  tray.setToolTip('MeowLogger')
  tray.on('click', toggleMainWindow)
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show MeowLogger', click: showMainWindow },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  ]))
}

ipcMain.handle('store:get', (_event, key) => store.get(key))
ipcMain.handle('store:set', (_event, key, value) => store.set(key, value))
ipcMain.handle('store:delete', (_event, key) => store.delete(key))
ipcMain.handle('store:clear', () => store.clear())

app.whenReady().then(() => {
  app.setAppUserModelId(appId)
  createWindow()
  createTray()
  app.on('activate', () => {
    showMainWindow()
  })
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
