'use strict';

import { BrowserWindow } from 'electron';
import path from 'path';

import { appConfig, rootDir } from './app-config.mjs';
import { getDateStr } from './date-aux.mjs';
import { MockClass } from '../__mocks__/Mock.mjs';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
global.waiverWindow = null;
global.prefWindow = null;
global.tray = null;
global.contextMenu = null;

function _openWaiverManagerWindow(mainWindow, event)
{
    if (global.waiverWindow !== null)
    {
        global.waiverWindow.show();
        return;
    }

    if (event)
    {
        const today = new Date();
        global.waiverDay = getDateStr(today);
    }
    const htmlPath = path.join('file://', rootDir, '/src/workday-waiver.html');
    const dialogCoordinates = getDialogCoordinates(600, 500, mainWindow);
    global.waiverWindow = new BrowserWindow({ width: 600,
        height: 500,
        x: dialogCoordinates.x,
        y: dialogCoordinates.y,
        parent: mainWindow,
        resizable: true,
        icon: appConfig.iconpath,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(rootDir, '/renderer/preload-scripts/workday-waiver-bridge.mjs'),
            contextIsolation: true
        } });
    global.waiverWindow.setMenu(null);
    global.waiverWindow.loadURL(htmlPath);
    global.waiverWindow.show();
    global.waiverWindow.on('close', function()
    {
        global.waiverWindow = null;
        mainWindow.webContents.send('WAIVER_SAVED');
    });
    global.waiverWindow.webContents.on('before-input-event', (event, input) =>
    {
        if (input.control && input.shift && input.key.toLowerCase() === 'i')
        {
            BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
        }
    });
}

/**
 * Return the x and y coordinate for a dialog window,
 * so the dialog window is centered on the TTL window.
 * Round values, as coordinates have to be integers.
 * @param {number} dialogWidth
 * @param {number} dialogHeight
 * @param {object} mainWindow
 */
function _getDialogCoordinates(dialogWidth, dialogHeight, mainWindow)
{
    return {
        x : Math.round(mainWindow.getBounds().x + mainWindow.getBounds().width/2 - dialogWidth/2),
        y : Math.round(mainWindow.getBounds().y + mainWindow.getBounds().height/2 - dialogHeight/2),
    };
}

function resetWindowsElements()
{
    global.waiverWindow = null;
    global.prefWindow = null;
    global.tray = null;
    global.contextMenu = null;
}

function getWaiverWindow()
{
    return global.waiverWindow;
}

// Enable mocking for some methods, export the mocked versions
const mocks = {'openWaiverManagerWindow': _openWaiverManagerWindow, 'getDialogCoordinates': _getDialogCoordinates};
export const openWaiverManagerWindow = (mainWindow, event) => mocks['openWaiverManagerWindow'](mainWindow, event);
export const getDialogCoordinates = (dialogWidth, dialogHeight, mainWindow) => mocks['getDialogCoordinates'](dialogWidth, dialogHeight, mainWindow);
export const windowsMock = new MockClass(mocks);

export {
    getWaiverWindow,
    resetWindowsElements,
};
