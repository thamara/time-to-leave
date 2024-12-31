/* eslint-disable no-undef */
'use strict';

import assert from 'assert';
import path from 'path';
import sinon from 'sinon';
import { rootDir } from '../../js/app-config.mjs';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { BrowserWindow } = require('electron');
const windowAux = require('../../js/window-aux.cjs');

describe('window-aux.cjs Testing', function()
{
    const mockHtmlPath = path.join('file://', rootDir, '/__mocks__/mock.html');

    // const devToolsShortcut = new KeyboardEvent('keyup', {keyCode: 73, ctrlKey: true, shiftKey: true});
    // const badDevToolsShortcut = new KeyboardEvent('keyup', {keyCode: 74, ctrlKey: true, shiftKey: true});
    const browserWindowOptions = {
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true
        }
    };
    const timeoutValue = 1500;

    // Testcase no longer being used since the move to electron without remote
    // but we should make use of it for a mocha testcase to still be sure the preferences window
    // and workday waiver have the shortcut working

    // describe('bindDevToolsShortcut(window)', function()
    // {

    //     test('No bind: should not open anything', async() =>
    //     {
    //         const testWindow = new BrowserWindow(browserWindowOptions);
    //         testWindow.loadURL(mockHtmlPath);
    //         assert.strictEqual(testWindow.webContents.isDevToolsOpened(), false);

    //         testWindow.webContents.on('dom-ready', () =>
    //         {
    //             window.dispatchEvent(devToolsShortcut);
    //         });
    //         testWindow.on('did-fail-load', (event, code, desc, url, isMainFrame) =>
    //         {
    //             console.log('did-fail-load: ', event,  code, desc, url, isMainFrame);
    //         });

    //         await new Promise(r => setTimeout(r, timeoutValue));
    //         assert.strictEqual(testWindow.webContents.isDevToolsOpened(), false);
    //     });

    //     test('Bind: should open devTools', async() =>
    //     {
    //         const testWindow = new BrowserWindow(browserWindowOptions);
    //         testWindow.loadURL(mockHtmlPath);
    //         assert.notStrictEqual(testWindow.webContents.isDevToolsOpened(), undefined);

    //         testWindow.webContents.on('dom-ready', () =>
    //         {
    //             bindDevToolsShortcut(window);
    //             window.dispatchEvent(devToolsShortcut);
    //         });
    //         testWindow.webContents.on('did-fail-load', (event, code, desc, url, isMainFrame) =>
    //         {
    //             console.log('did-fail-load: ', event,  code, desc, url, isMainFrame);
    //         });

    //         await new Promise(r => setTimeout(r, timeoutValue));
    //         assert.notStrictEqual(testWindow.webContents.isDevToolsOpened(), undefined);
    //     });

    //     test('Bind: bad shortcut, should not open devTools', async() =>
    //     {
    //         const testWindow = new BrowserWindow(browserWindowOptions);
    //         testWindow.loadURL(mockHtmlPath);
    //         assert.notStrictEqual(testWindow.webContents.isDevToolsOpened(), undefined);

    //         testWindow.webContents.on('dom-ready', () =>
    //         {
    //             bindDevToolsShortcut(window);
    //             window.dispatchEvent(badDevToolsShortcut);
    //         });
    //         testWindow.webContents.on('did-fail-load', (event, code, desc, url, isMainFrame) =>
    //         {
    //             console.log('did-fail-load: ', event,  code, desc, url, isMainFrame);
    //         });

    //         await new Promise(r => setTimeout(r, timeoutValue));
    //         assert.notStrictEqual(testWindow.webContents.isDevToolsOpened(), undefined);
    //     });
    // });

    describe('showDialogSync(options)', function()
    {
        it('Does not crash', async() =>
        {
            const testWindow = new BrowserWindow(browserWindowOptions);
            testWindow.loadURL(mockHtmlPath);

            let spy;
            testWindow.webContents.on('dom-ready', () =>
            {
                spy = sinon.spy(windowAux, 'showDialogSync');

                const options = {
                    title: 'Time to Leave',
                };
                windowAux.showDialogSync(options).then(() =>
                {
                    return;
                });
            });
            testWindow.webContents.on('did-fail-load', (event, code, desc, url, isMainFrame) =>
            {
                console.log('did-fail-load: ', event,  code, desc, url, isMainFrame);
            });

            await new Promise(r => setTimeout(r, timeoutValue));
            assert.notStrictEqual(testWindow, undefined);
            assert.strictEqual(spy.called, true);

            spy.restore();
        });
    });

    describe('showAlert(message)', function()
    {
        it('Does not crash', async() =>
        {
            const testWindow = new BrowserWindow(browserWindowOptions);
            testWindow.loadURL(mockHtmlPath);

            let spy;
            testWindow.webContents.on('dom-ready', () =>
            {
                spy = sinon.stub(windowAux, 'showAlert');
                windowAux.showAlert('Test showAlert');
            });
            testWindow.webContents.on('did-fail-load', (event, code, desc, url, isMainFrame) =>
            {
                console.log('did-fail-load: ', event,  code, desc, url, isMainFrame);
            });

            await new Promise(r => setTimeout(r, timeoutValue));
            assert.notStrictEqual(testWindow, undefined);
            assert.strictEqual(spy.called, true);

            spy.restore();
        });
    });
});