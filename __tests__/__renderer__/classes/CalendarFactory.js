import { CalendarFactory } from '../../../js/classes/CalendarFactory';
import { FlexibleDayCalendar } from '../../../js/classes/FlexibleDayCalendar';
import { FlexibleMonthCalendar } from '../../../js/classes/FlexibleMonthCalendar';

jest.mock('../../../js/classes/BaseCalendar.js', () =>
{
    class BaseCalendar
    {
        constructor() { }
    }

    return { BaseCalendar };
});

jest.mock('electron', () =>
{
    const originalModule = jest.requireActual('electron');
    return {
        __esModule: true,
        ...originalModule,
        ipcRenderer: {
            ...originalModule.ipcRenderer,
            send: jest.fn()
        }
    };
});

const {ipcRenderer} = require('electron');

describe('CalendarFactory', () =>
{
    test('Should fail wrong view', () =>
    {
        expect(() => CalendarFactory.getInstance({
            view: 'not_supported'
        })).toThrow('Could not instantiate not_supported');
    });

    describe('FlexibleDayCalendar', () =>
    {

        test('Should fail wrong view', () =>
        {
            let calls = 0;
            const testCalendar = {
                constructor: {
                    name: 'FlexibleDayCalendar',
                },
                updateLanguageData: () => { calls++; },
                updatePreferences: () => { calls++; },
                redraw: () => { calls++; },
            };
            const calendar = CalendarFactory.getInstance({
                view: 'day',
            }, {}, testCalendar);
            expect(calendar).toEqual(testCalendar);
            expect(calls).toBe(3);
        });

        test('Should return new calendar without resizing', () =>
        {
            let calls = 0;
            const testCalendar = {
                constructor: {
                    name: 'NOT FlexibleDayCalendar',
                },
                updateLanguageData: () => { calls++; },
                updatePreferences: () => { calls++; },
                redraw: () => { calls++; },
            };
            const calendar = CalendarFactory.getInstance({
                view: 'day',
            }, {}, testCalendar);
            expect(calendar).toBeInstanceOf(FlexibleDayCalendar);
            expect(calls).toBe(0);
        });

        test('Should return new calendar without resizing', () =>
        {
            let calls = 0;
            jest.spyOn(ipcRenderer, 'send').mockImplementation(() =>
            {
                calls++;
            });
            const calendar = CalendarFactory.getInstance({
                view: 'day',
            }, {}, undefined);
            expect(calendar).toBeInstanceOf(FlexibleDayCalendar);
            expect(calls).toBe(0);
        });

        test('Should return new calendar with resizing', () =>
        {
            let calls = 0;
            const testCalendar = {
                constructor: {
                    name: 'NOT FlexibleDayCalendar',
                },
                updateLanguageData: () => { calls++; },
                updatePreferences: () => { calls++; },
                redraw: () => { calls++; },
            };
            jest.spyOn(ipcRenderer, 'send').mockImplementation(() =>
            {
                calls++;
            });
            const calendar = CalendarFactory.getInstance({
                view: 'day',
            }, {}, testCalendar);
            expect(calendar).toBeInstanceOf(FlexibleDayCalendar);
            expect(calls).toBe(1);
        });

    });

    describe('FlexibleMonthCalendar', () =>
    {
        test('Should fail wrong view', () =>
        {
            let calls = 0;
            const testCalendar = {
                constructor: {
                    name: 'FlexibleMonthCalendar',
                },
                updateLanguageData: () => { calls++; },
                updatePreferences: () => { calls++; },
                redraw: () => { calls++; },
            };
            const calendar = CalendarFactory.getInstance({
                view: 'month',
            }, {}, testCalendar);
            expect(calendar).toEqual(testCalendar);
            expect(calls).toBe(3);
        });

        test('Should return new calendar without resizing', () =>
        {
            let calls = 0;
            jest.spyOn(ipcRenderer, 'send').mockImplementation(() =>
            {
                calls++;
            });
            const calendar = CalendarFactory.getInstance({
                view: 'month',
            }, {}, undefined);
            expect(calendar).toBeInstanceOf(FlexibleMonthCalendar);
            expect(calls).toBe(0);
        });

        test('Should return new calendar with resizing', () =>
        {
            let calls = 0;
            const testCalendar = {
                constructor: {
                    name: 'NOT FlexibleMonthCalendar',
                },
                updateLanguageData: () => { calls++; },
                updatePreferences: () => { calls++; },
                redraw: () => { calls++; },
            };
            jest.spyOn(ipcRenderer, 'send').mockImplementation(() =>
            {
                calls++;
            });
            const calendar = CalendarFactory.getInstance({
                view: 'month',
            }, {}, testCalendar);
            expect(calendar).toBeInstanceOf(FlexibleMonthCalendar);
            expect(calls).toBe(1);
        });
    });
});