const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const path = require('path');
const fs = require('fs')
const Store = require('electron-store');

let preferencesOptions = {
  'hours-per-day': '08:00',
  'notification': 'enabled',
  'working-days-monday': true,
  'working-days-tuesday': true,
  'working-days-wednesday': true,
  'working-days-thursday': true,
  'working-days-friday': true,
  'working-days-saturday': false,
  'working-days-sunday': false,
};

ipcMain.on('PREFERENCE_SAVE_DATA_NEEDED', (event, preferences) => {
    preferencesOptions = preferences
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
const store = new Store();

function createWindow () {
  // Create the browser window.
  var menu = Menu.buildFromTemplate([
    {
        label: 'Menu',
        submenu: [
            {
                label: 'Preferences',
                click () {
                    const htmlPath = path.join('file://', __dirname, 'src/preferences.html')
                    let prefWindow = new BrowserWindow({ width: 600, 
                                                         height: 450, 
                                                         resizable: false,
                                                         webPreferences: {
                                                          nodeIntegration: true
                                                        } })
                    prefWindow.loadURL(htmlPath)
                    prefWindow.show()
                    //prefWindow.webContents.openDevTools()
                    prefWindow.on('close', function () {
                      prefWindow = null 
                      userDataPath = app.getPath('userData');
                      filePath = path.join(userDataPath, 'preferences.json')
                      preferencesOptions && fs.writeFileSync(filePath, JSON.stringify(preferencesOptions));
                      win.webContents.send('PREFERENCE_SAVED', preferencesOptions);
                    })
                },
            },
            {
                label:'Clear database', 
                click() { 
                    const options = {
                      type: 'question',
                      buttons: ['Cancel', 'Yes, please', 'No, thanks'],
                      defaultId: 2,
                      title: 'Clear database',
                      message: 'Are you sure you want to clear all the data?',
                    };
                  
                    dialog.showMessageBox(null, options, (response) => {
                    if (response == 1) {
                      store.clear()
                      win.reload()
                    }
                    });
                } 
            },
            {type:'separator'}, 
            {
                label:'Exit', 
                click() { 
                    app.quit() 
                } 
            }
        ]
    }
  ])
  Menu.setApplicationMenu(menu);

  win = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: 'assets/timer.png',
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.