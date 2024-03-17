'use strict';

import assert from 'assert';
import { net } from 'electron';
import { stub } from 'sinon';
import Store from 'electron-store';

import { getDateStr } from '../../js/date-aux.mjs';
import { checkForUpdates, shouldCheckForUpdates } from '../../js/update-manager.mjs';

describe('Update Manager', () =>
{
    describe('shouldCheckForUpdates', () =>
    {
        it('Should return true when was never checked', () =>
        {
            const store = new Store();
            store.set('update-remind-me-after', false);
            assert.strictEqual(shouldCheckForUpdates(), true);
        });

        it('Should return true when was checked before today', () =>
        {
            const now = new Date();
            now.setDate(now.getDate() - 1);
            const store = new Store();
            store.set('update-remind-me-after', getDateStr(now));
            assert.strictEqual(shouldCheckForUpdates(), true);
        });

        it('Should return false when was checked today', () =>
        {
            const now = new Date();
            const store = new Store();
            store.set('update-remind-me-after', getDateStr(now));
            assert.strictEqual(shouldCheckForUpdates(), false);
        });
    });

    describe('checkForUpdates', () =>
    {
        it('should not execute when is offline', () =>
        {
            const netStub = stub(net, 'request').returns({
                on: () => {},
                end: () => {}
            });
            checkForUpdates();
            assert.strictEqual(netStub.notCalled, true);
            netStub.restore();
        });

        it('should not execute when is online', (done) =>
        {
            const netStub = stub(net, 'request').returns({
                on: () =>
                {
                    assert.strictEqual(netStub.calledOnce, true);
                    netStub.restore();
                    done();
                },
                end: () => {}
            });
            checkForUpdates();
        });
    });
});