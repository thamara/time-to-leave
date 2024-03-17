/* eslint-disable no-undef */
'use strict';

import assert from 'assert';
import { BrowserWindow } from 'electron';
import { stub } from 'sinon';

import { getDateStr } from '../../js/date-aux.mjs';
import {
    getDialogCoordinates,
    getWaiverWindow,
    openWaiverManagerWindow,
    resetWindowsElements,
} from '../../js/windows.mjs';

describe('Windows tests', () =>
{
    let showSpy;
    let loadSpy;
    before(() =>
    {
        // Avoid window being shown
        // TODO: might not always be working?
        BrowserWindow.prototype.show = stub();
        showSpy = BrowserWindow.prototype.show;
        BrowserWindow.prototype.loadURL = stub();
        loadSpy = BrowserWindow.prototype.loadURL;
    });

    it('Elements should be null on starting', () =>
    {
        assert.strictEqual(getWaiverWindow(), null);
        assert.strictEqual(global.tray, null);
        assert.strictEqual(global.contextMenu, null);
        assert.strictEqual(global.prefWindow, null);
    });

    it('Should create waiver window', (done) =>
    {
        const mainWindow = new BrowserWindow({
            show: false
        });
        openWaiverManagerWindow(mainWindow);
        assert.notStrictEqual(getWaiverWindow(), null);
        assert.strictEqual(getWaiverWindow() instanceof BrowserWindow, true);

        // Values can vary about 10px from 600, 500
        const size = getWaiverWindow().getSize();
        assert.strictEqual(Math.abs(size[0] - 600) < 10, true);
        assert.strictEqual(Math.abs(size[1] - 500) < 10, true);

        assert.strictEqual(showSpy.calledOnce, true);
        assert.strictEqual(loadSpy.calledOnce, true);

        done();
    });

    it('Should show waiver window it has been created', (done) =>
    {
        const mainWindow = new BrowserWindow({
            show: false
        });
        openWaiverManagerWindow(mainWindow);
        openWaiverManagerWindow(mainWindow);
        assert.notStrictEqual(getWaiverWindow(), null);
        // It should only load once the URL because it already exists
        assert.strictEqual(showSpy.calledTwice, true);
        assert.strictEqual(loadSpy.calledOnce, true);
        done();
    });

    it('Should set global waiverDay when event is sent', (done) =>
    {
        const mainWindow = new BrowserWindow({
            show: false
        });
        openWaiverManagerWindow(mainWindow, true);
        assert.notStrictEqual(getWaiverWindow(), null);
        assert.strictEqual(global.waiverDay, getDateStr(new Date()));
        done();
    });

    it('Should reset waiverWindow on close', () =>
    {
        const mainWindow = new BrowserWindow({
            show: false
        });
        openWaiverManagerWindow(mainWindow, true);
        getWaiverWindow().emit('close');
        assert.strictEqual(getWaiverWindow(), null);
    });

    it('Should get dialog coordinates', () =>
    {
        const coordinates = getDialogCoordinates(500, 250, {
            getBounds: () => ({
                x: 200,
                y: 300,
                width: 400,
                height: 600
            })
        });
        assert.deepStrictEqual(coordinates, {
            x: 150,
            y: 475
        });
    });

    afterEach(() =>
    {
        showSpy.resetHistory();
        loadSpy.resetHistory();
        resetWindowsElements();
    });
});