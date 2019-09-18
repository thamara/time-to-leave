const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

const { savePreferences } = require('./js/UserPreferences.js');

let savedPreferences = null;
ipcMain.on('PREFERENCE_SAVE_DATA_NEEDED', (event, preferences) => {
    savedPreferences = preferences;
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
const store = new Store();
const macOS = process.platform === 'darwin';

function createWindow () {
  // Create the browser window.
    var menu = Menu.buildFromTemplate([
        {
            label: 'Menu',
            submenu: [
                {
                    label: 'Preferences',
                    accelerator: macOS ? 'Command+,' : 'Control+,',
                    click () {
                        const htmlPath = path.join('file://', __dirname, 'src/preferences.html');
                        let prefWindow = new BrowserWindow({ width: 600, 
                            height: 450, 
                            resizable: false,
                            webPreferences: {
                                nodeIntegration: true
                            } });
                        prefWindow.loadURL(htmlPath);
                        prefWindow.show();
                        //prefWindow.webContents.openDevTools()
                        prefWindow.on('close', function () {
                            prefWindow = null; 
                            savePreferences(savedPreferences);
                            win.webContents.send('PREFERENCE_SAVED', savedPreferences);
                        });
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
                                store.clear();
                                win.reload();
                            }
                        });
                    } 
                },
                {type:'separator'}, 
                {
                    label:'Exit', 
                    accelerator: macOS ? 'CommandOrControl+Q' : 'Control+Q',
                    click() { 
                        app.quit(); 
                    } 
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CommandOrControl+R',
                    click () {
                        BrowserWindow.getFocusedWindow().reload();
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: macOS ? 'Command+Alt+I' : 'Control+Shift+I',
                    click () {
                        BrowserWindow.getFocusedWindow().toggleDevTools();
                    }
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);

    win = new BrowserWindow({
        width: 1000,
        height: 800,
        icon: 'assets/timer.png',
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    win.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    //win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
        win = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.