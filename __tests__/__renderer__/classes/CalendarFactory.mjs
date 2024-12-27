'use strict';

import '../jquery.mjs';

import assert from 'assert';
import { stub } from 'sinon';
import { CalendarFactory } from '../../../renderer/classes/CalendarFactory.js';
import { BaseCalendar } from '../../../renderer/classes/BaseCalendar.js';
import { DayCalendar } from '../../../renderer/classes/DayCalendar.js';
import { MonthCalendar } from '../../../renderer/classes/MonthCalendar.js';

import { calendarApi } from '../../../renderer/preload-scripts/calendar-api.mjs';

// Mocked APIs from the preload script of the calendar window
window.mainApi = calendarApi;

window.mainApi.resizeMainWindow = stub();

Object.setPrototypeOf(DayCalendar, stub());
Object.setPrototypeOf(MonthCalendar, stub());
stub(BaseCalendar.prototype, 'reload');

describe('CalendarFactory', () =>
{
    it('Should fail wrong view', () =>
    {
        const promise = CalendarFactory.getInstance({
            view: 'not_supported'
        }, {});
        assert.strictEqual(promise instanceof Promise, true);
        promise.then(() => {}).catch((reason) =>
        {
            assert.strictEqual(reason, 'Could not instantiate not_supported');
        });
    });

    describe('DayCalendar', () =>
    {
        it('Should fail wrong view', async() =>
        {
            let calls = 0;
            const testCalendar = {
                constructor: {
                    name: 'DayCalendar',
                },
                updateLanguageData: () => { calls++; },
                updatePreferences: () => { calls++; },
                redraw: () => { calls++; },
            };
            const calendar = await CalendarFactory.getInstance({
                view: 'day',
            }, {}, testCalendar);
            assert.strictEqual(calendar, testCalendar);
            assert.strictEqual(calls, 3);
        });

        it('Should return new calendar with resizing if passing in an instance that is not a DayCalendar', async() =>
        {
            window.mainApi.resizeMainWindow.resetHistory();
            let calls = 0;
            const testCalendar = {
                constructor: {
                    name: 'NOT DayCalendar',
                },
                updateLanguageData: () => { calls++; },
                updatePreferences: () => { calls++; },
                redraw: () => { calls++; },
            };
            const calendar = await CalendarFactory.getInstance({
                view: 'day',
            }, {}, testCalendar);
            assert.strictEqual(calendar instanceof DayCalendar, true);
            assert.strictEqual(calls, 0);
            assert.strictEqual(window.mainApi.resizeMainWindow.calledOnce, true);
        });

        it('Should return new calendar without resizing if passing in an undefined instance', async() =>
        {
            window.mainApi.resizeMainWindow.resetHistory();
            const calendar = await CalendarFactory.getInstance({
                view: 'day',
            }, {}, undefined);
            assert.strictEqual(calendar instanceof DayCalendar, true);
            assert.strictEqual(window.mainApi.resizeMainWindow.notCalled, true);
        });
    });

    describe('MonthCalendar', () =>
    {
        it('Should fail wrong view', async() =>
        {
            let calls = 0;
            const testCalendar = {
                constructor: {
                    name: 'MonthCalendar',
                },
                updateLanguageData: () => { calls++; },
                updatePreferences: () => { calls++; },
                redraw: () => { calls++; },
            };
            const calendar = await CalendarFactory.getInstance({
                view: 'month',
            }, {}, testCalendar);
            assert.strictEqual(calendar, testCalendar);
            assert.strictEqual(calls, 3);
        });

        it('Should return new calendar without resizing if passing in an undefined instance', async() =>
        {
            window.mainApi.resizeMainWindow.resetHistory();
            const calendar = await CalendarFactory.getInstance({
                view: 'month',
            }, {}, undefined);
            assert.strictEqual(calendar instanceof MonthCalendar, true);
            assert.strictEqual(window.mainApi.resizeMainWindow.notCalled, true);
        });

        it('Should return new calendar with resizing if passing in an instance that is not a MonthCalendar', async() =>
        {
            window.mainApi.resizeMainWindow.resetHistory();
            let calls = 0;
            const testCalendar = {
                constructor: {
                    name: 'NOT MonthCalendar',
                },
                updateLanguageData: () => { calls++; },
                updatePreferences: () => { calls++; },
                redraw: () => { calls++; },
            };
            const calendar = await CalendarFactory.getInstance({
                view: 'month',
            }, {}, testCalendar);
            assert.strictEqual(calendar instanceof MonthCalendar, true);
            assert.strictEqual(calls, 0);
            assert.strictEqual(window.mainApi.resizeMainWindow.calledOnce, true);
        });
    });
});
