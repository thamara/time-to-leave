/* eslint-disable no-undef */
'use strict';

import '../../__mocks__/jquery.mjs';

import assert from 'assert';
import { stub } from 'sinon';

import {
    applyTheme,
    isValidTheme
} from '../../renderer/themes.js';

const $_backup = global.$;

describe('Theme Functions', function()
{
    before(() =>
    {
        // Stub $ and window.matchMedia for applyTheme()
        global.$ = stub().returns({'attr': stub()});
        stub(global.window, 'matchMedia').returns({matches: true});
    });

    describe('isValidTheme()', function()
    {
        it('should validate', () =>
        {
            assert.strictEqual(isValidTheme('system-default'), true);
            assert.strictEqual(isValidTheme('light'), true);
            assert.strictEqual(isValidTheme('dark'), true);
            assert.strictEqual(isValidTheme('cadent-star'), true);
        });
    });

    describe('isValidTheme()', function()
    {
        it('should not validate', () =>
        {
            assert.strictEqual(isValidTheme('foo'), false);
            assert.strictEqual(isValidTheme('bar'), false);
        });
    });

    describe('applyTheme()', function()
    {
        beforeEach(() =>
        {
            global.window.matchMedia.resetHistory();
            global.$.resetHistory();
        });

        it('should apply', () =>
        {
            assert.strictEqual(applyTheme('system-default'), true);
            assert.strictEqual(applyTheme('light'), true);
            assert.strictEqual(applyTheme('dark'), true);
            assert.strictEqual(applyTheme('cadent-star'), true);

            assert.strictEqual(global.window.matchMedia.callCount, 1);
            assert.strictEqual(global.$.callCount, 4);
        });

        it('should not apply', function()
        {
            assert.strictEqual(applyTheme('foo'), false);
            assert.strictEqual(applyTheme('bar'), false);

            assert.strictEqual(global.window.matchMedia.callCount, 0);
            assert.strictEqual(global.$.callCount, 0);
        });
    });

    after(() =>
    {
        global.$ = $_backup;
        window.matchMedia.restore();
    });
});
