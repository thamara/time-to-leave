'use strict';

import { app, BrowserWindow, ipcMain, Menu, nativeTheme, Tray } from 'electron';
import path from 'path';

import {
    getContextMenuTemplate,
    getDockMenuTemplate,
    getEditMenuTemplate,
    getHelpMenuTemplate,
    getMainMenuTemplate,
    getViewMenuTemplate
} from './menus.mjs';
import { createLeaveNotification } from './notification.mjs';
import { checkForUpdates, shouldCheckForUpdates } from './update-manager.mjs';
import { getDefaultWidthHeight, getUserPreferences, switchCalendarView } from './user-preferences.mjs';
import { getCurrentTranslation } from '../src/configs/i18next.config.mjs';

// Allow require()
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { appConfig, rootDir } = require('./app-config.cjs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let leaveByInterval = null;
function getMainWindow()
{
    return mainWindow;
}

function createMenu()
{
    const menu = Menu.buildFromTemplate([
        {
            label: getCurrentTranslation('$Menu.menu'),
            submenu: getMainMenuTemplate(mainWindow)
        },
        {
            label: getCurrentTranslation('$Menu.edit'),
            submenu: getEditMenuTemplate(mainWindow)
        },
        {
            label: getCurrentTranslation('$Menu.view'),
            submenu: getViewMenuTemplate()
        },
        {
            label: getCurrentTranslation('$Menu.help'),
            submenu: getHelpMenuTemplate()
        }
    ]);

    if (appConfig.macOS)
    {
        Menu.setApplicationMenu(menu);
        // Use the macOS dock if we've got it
        const dockMenuTemplate = getDockMenuTemplate(mainWindow);
        app.dock.setMenu(Menu.buildFromTemplate(dockMenuTemplate));
        mainWindow.maximize();
    }
    else
    {
        mainWindow.setMenu(menu);
    }
}

function createWindow()
{
    // Create the browser window.
    const widthHeight = getDefaultWidthHeight();
    mainWindow = new BrowserWindow({
        width: widthHeight.width,
        height: widthHeight.height,
        minWidth: 450,
        minHeight: 450,
        useContentSize: false,
        zoomToPageWidth: true, //MacOS only
        icon: appConfig.iconpath,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(rootDir, '/renderer/preload-scripts/calendar-bridge.mjs'),
            contextIsolation: true
        }
    });

    createMenu();

    // Prevents flickering from maximize
    mainWindow.show();

    // and load the main html of the app as the default window
    mainWindow.loadFile(path.join(rootDir, 'src/calendar.html'));

    ipcMain.on('TOGGLE_TRAY_PUNCH_TIME', (_event, arg) =>
    {
        const contextMenuTemplate = getContextMenuTemplate(mainWindow);
        contextMenuTemplate[0].enabled = arg;
        global.contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
        global.tray.setContextMenu(global.contextMenu);
    });

    ipcMain.on('RESIZE_MAIN_WINDOW', () =>
    {
        const widthHeight = getDefaultWidthHeight();
        mainWindow.setSize(widthHeight.width, widthHeight.height);
    });

    ipcMain.on('SWITCH_VIEW', () =>
    {
        const preferences = switchCalendarView();
        mainWindow.webContents.send('PREFERENCES_SAVED', preferences);
    });

    ipcMain.on('RECEIVE_LEAVE_BY', (event, element) =>
    {
        const notification = createLeaveNotification(element);
        if (notification) notification.show();
    });

    leaveByInterval = setInterval(() =>
    {
        mainWindow.webContents.send('GET_LEAVE_BY');
    }, 60 * 1000);

    global.tray = new Tray(appConfig.trayIcon);
    global.tray.on('click', () =>
    {
        mainWindow.show();
    });

    global.tray.setToolTip('Time to Leave');

    global.tray.on('right-click', () =>
    {
        global.tray.popUpContextMenu(global.contextMenu);
    });

    mainWindow.on('minimize', (event) =>
    {
        const savedPreferences = getUserPreferences();
        if (savedPreferences['minimize-to-tray'])
        {
            event.preventDefault();
            mainWindow.hide();
        }
        else
        {
            mainWindow.minimize();
        }
    });

    // Emitted when the window is closed.
    mainWindow.on('close', (event) =>
    {
        const savedPreferences = getUserPreferences();
        if (!app.isQuitting && savedPreferences['close-to-tray'])
        {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    // Listen for system theme changes in real-time
    nativeTheme.on('updated', () =>
    {
        const savedPreferences = getUserPreferences();
        const theme = savedPreferences['theme'];
        if (theme === 'system-default')
        {
            mainWindow.webContents.send('RELOAD_THEME', theme);
        }
    });
}

function triggerStartupDialogs()
{
    if (shouldCheckForUpdates())
    {
        checkForUpdates(/*showUpToDateDialog=*/false);
    }
}

function resetMainWindow()
{
    ipcMain.removeAllListeners();
    if (mainWindow && !mainWindow.isDestroyed())
    {
        mainWindow.close();
        mainWindow.removeAllListeners();
        mainWindow = null;
    }
    if (global.tray)
    {
        global.tray.removeAllListeners();
    }
    clearInterval(leaveByInterval);
    leaveByInterval = null;
    global.tray = null;
}

export {
    createMenu,
    createWindow,
    leaveByInterval as getLeaveByInterval,
    getMainWindow,
    resetMainWindow,
    triggerStartupDialogs,
};
