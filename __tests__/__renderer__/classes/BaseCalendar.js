import ElectronStore from 'electron-store';
import { BaseCalendar } from '../../../js/classes/BaseCalendar.js';
import { generateKey } from '../../../js/date-db-formatter.js';
import { getUserPreferences, resetPreferences, savePreferences } from '../../../js/user-preferences.js';
const timeBalance = require('../../../js/time-balance');

jest.mock('../../../js/time-math', () =>
{
    const originalModule = jest.requireActual('../../../js/time-math');
    return {
        __esModule: true,
        ...originalModule,
        isNegative: jest.fn()
    };
});
const timeMath = require('../../../js/time-math');
window.$ = require('jquery');

describe('BaseCalendar.js', () =>
{
    class ExtendedClass extends BaseCalendar
    {
        constructor(preferences, languageData)
        {
            super(preferences, languageData);
        }
    }

    /**
     * @type {{[key: string]: jest.Mock}}
     */
    const mocks = {};

    beforeEach(() =>
    {
        const flexibleStore = new ElectronStore({name: 'flexible-store'});
        flexibleStore.clear();
        const waivedWorkdays = new ElectronStore({name: 'waived-workdays'});
        waivedWorkdays.clear();
        ExtendedClass.prototype._initCalendar = () => {};
        ExtendedClass.prototype._getTargetDayForAllTimeBalance = () => {};
    });

    describe('constructor', () =>
    {
        test('Should not build with default values', () =>
        {
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            delete ExtendedClass.prototype._initCalendar;
            delete ExtendedClass.prototype._getTargetDayForAllTimeBalance;
            expect(() => new ExtendedClass(preferences, languageData)).toThrow('Please implement this.');
        });

        test('Should not run _getTargetDayForAllTimeBalance with default values', () =>
        {
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            delete ExtendedClass.prototype._getTargetDayForAllTimeBalance;
            expect(() => new ExtendedClass(preferences, languageData)._getTargetDayForAllTimeBalance()).toThrow('Please implement this.');
        });

        test('Should build with default values', (done) =>
        {
            ExtendedClass.prototype._initCalendar = () => { done(); };
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            expect(calendar._calendarDate).toBeInstanceOf(Date);
            expect(calendar._languageData).toEqual(languageData);
            expect(calendar._internalStore).toEqual({});
            expect(calendar._internalWaiverStore).toEqual({});
            expect(calendar._preferences).toEqual(preferences);
        });

        test('Should build with default internal store values', (done) =>
        {
            ExtendedClass.prototype._initCalendar = () => { done(); };
            const flexibleStore = new ElectronStore({name: 'flexible-store'});
            flexibleStore.set('flexible', 'store');

            const waivedWorkdays = new ElectronStore({name: 'waived-workdays'});
            waivedWorkdays.set('2022-01-01', {
                reason: 'dismiss',
                hours: '10:00'
            });

            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            expect(calendar._calendarDate).toBeInstanceOf(Date);
            expect(calendar._languageData).toEqual(languageData);
            expect(calendar._internalStore).toEqual({
                flexible: 'store'
            });
            expect(calendar._internalWaiverStore).toEqual({
                '2022-01-01': {
                    reason: 'dismiss',
                    hours: '10:00'
                }
            });
            expect(calendar._preferences).toEqual(preferences);
        });
    });

    describe('_updateAllTimeBalance', () =>
    {
        test('Should not update value because of no implementation', (done) =>
        {
            delete ExtendedClass.prototype._getTargetDayForAllTimeBalance;
            mocks.compute = jest.spyOn(timeBalance, 'computeAllTimeBalanceUntilAsync').mockImplementation(() => Promise.resolve());
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            expect(() => calendar._updateAllTimeBalance()).toThrow('Please implement this.');
            expect(mocks.compute).toHaveBeenCalledTimes(0);
            done();
        });

        test('Should not update value because of rejection', (done) =>
        {
            mocks.compute = jest.spyOn(timeBalance, 'computeAllTimeBalanceUntilAsync').mockImplementation(() => Promise.reject());
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            calendar._updateAllTimeBalance();
            setTimeout(() =>
            {
                expect(mocks.compute).toHaveBeenCalledTimes(1);
                done();
            }, 500);
        });

        test('Should not update value because no overall-balance element', (done) =>
        {
            window.$ = () => false;
            mocks.compute = jest.spyOn(timeBalance, 'computeAllTimeBalanceUntilAsync').mockResolvedValue('2022-02-31');
            mocks.isNegative = jest.spyOn(timeMath, 'isNegative').mockImplementation(() => true);
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            calendar._updateAllTimeBalance();
            setTimeout(() =>
            {
                expect(mocks.isNegative).toHaveBeenCalledTimes(0);
                expect(mocks.compute).toHaveBeenCalledTimes(1);
                window.$ = require('jquery');
                done();
            }, 500);
        });

        test('Should update value with negative class', (done) =>
        {
            $('body').append('<span id="overall-balance" value="12:12">12:12</span>');
            $('#overall-balance').val('12:12');
            mocks.compute = jest.spyOn(timeBalance, 'computeAllTimeBalanceUntilAsync').mockResolvedValue('2022-02-31');
            mocks.isNegative = jest.spyOn(timeMath, 'isNegative').mockImplementation(() => true);
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            calendar._updateAllTimeBalance();
            setTimeout(() =>
            {
                expect(mocks.compute).toHaveBeenCalledTimes(1);
                expect($('#overall-balance').val()).toBe('2022-02-31');
                expect($('#overall-balance').hasClass('text-danger')).toBe(true);
                done();
            }, 500);
        });

        test('Should update value with positive class', (done) =>
        {
            $('body').append('<span class="text-success text-danger" id="overall-balance" value="12:12">12:12</span>');
            $('#overall-balance').val('12:12');
            mocks.compute = jest.spyOn(timeBalance, 'computeAllTimeBalanceUntilAsync').mockResolvedValue('2022-02-31');
            mocks.isNegative = jest.spyOn(timeMath, 'isNegative').mockImplementation(() => false);
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            calendar._updateAllTimeBalance();
            setTimeout(() =>
            {
                expect(mocks.compute).toHaveBeenCalledTimes(1);
                expect($('#overall-balance').val()).toBe('2022-02-31');
                expect($('#overall-balance').hasClass('text-success')).toBe(true);
                done();
            }, 500);
        });

    });

    describe('_addTodayEntries', () =>
    {
        test('Should throw error', () =>
        {
            expect(() => new ExtendedClass({}, {})._addTodayEntries()).toThrow('Please implement this.');
        });
    });

    describe('refreshOnDayChange', () =>
    {
        test('Should throw error', () =>
        {
            expect(() => new ExtendedClass({}, {}).refreshOnDayChange()).toThrow('Please implement this.');
        });
    });

    describe('_getEnablePrefillBreakTime', () =>
    {
        test('Should return preferences value', () =>
        {
            const preferences = getUserPreferences();
            expect(new ExtendedClass(preferences, {})._getEnablePrefillBreakTime()).toEqual(preferences['enable-prefill-break-time']);
        });
    });

    describe('_getBreakTimeInterval', () =>
    {
        test('Should return preferences value', () =>
        {
            const preferences = getUserPreferences();
            expect(new ExtendedClass(preferences, {})._getBreakTimeInterval()).toEqual(preferences['break-time-interval']);
        });
    });

    describe('_validateTimes()', () =>
    {
        test('Shold return empty array', () =>
        {
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            const validatedTimes = calendar._validateTimes([]);
            expect(validatedTimes).toEqual([]);
        });

        test('Should not remove invalid endings', () =>
        {
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            const validatedTimes = calendar._validateTimes(['10:00', '25:83']);
            expect(validatedTimes).toEqual(['10:00', '--:--']);
        });

        test('Should remove invalid endings', () =>
        {
            const preferences = {view: 'day'};
            const languageData = {hello: 'hola'};
            const calendar = new ExtendedClass(preferences, languageData);
            const validatedTimes = calendar._validateTimes(['10:00', '25:83'], true);
            expect(validatedTimes).toEqual(['10:00']);
        });
    });

    describe('_switchView()', () =>
    {
        const tests = [
            {view: 'day', result: 'month'},
            {view: 'month', result: 'day'}
        ];
        for (const t of tests)
        {
            test(`Should change calendar view: ${t.view}`, () =>
            {
                savePreferences({...getUserPreferences(), view: t.view});
                const languageData = {hello: 'hola'};
                const calendar = new ExtendedClass(getUserPreferences(), languageData);
                calendar._switchView();
                const updatedPreferences = getUserPreferences();
                expect(updatedPreferences.view).toEqual(t.result);
            });
        }
    });

    describe('punchDate()', () =>
    {
        const today = new Date();
        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        const nextDay = new Date();
        nextDay.setDate(today.getDate() + 1);
        const languageData = {hello: 'hola'};
        const tests = [
            {   it: 'Should fail on checking year',
                date: nextYear,
                setup: () =>
                {
                    mocks._areAllInputsFilled = jest.spyOn(ExtendedClass.prototype, '_areAllInputsFilled');
                },
                getCalendar: () => new ExtendedClass(getUserPreferences(), languageData),
                expect: () =>
                {
                    expect(mocks._areAllInputsFilled).toHaveBeenCalledTimes(0);
                }
            },
            {   it: 'Should fail on checking  month',
                date: nextMonth,
                setup: () =>
                {
                    mocks._areAllInputsFilled = jest.spyOn(ExtendedClass.prototype, '_areAllInputsFilled');
                },
                getCalendar: () => new ExtendedClass(getUserPreferences(), languageData),
                expect: () =>
                {
                    expect(mocks._areAllInputsFilled).toHaveBeenCalledTimes(0);
                }
            },
            {   it: 'Should fail on checking day',
                date: nextMonth,
                setup: () =>
                {
                    mocks._areAllInputsFilled = jest.spyOn(ExtendedClass.prototype, '_areAllInputsFilled');
                },
                getCalendar: () => new ExtendedClass(getUserPreferences(), languageData),
                expect: () =>
                {
                    expect(mocks._areAllInputsFilled).toHaveBeenCalledTimes(0);
                }
            },
            {   it: 'Should fail on checking day',
                setup: () =>
                {
                    mocks._areAllInputsFilled = jest.spyOn(ExtendedClass.prototype, '_areAllInputsFilled');
                    mocks._updateTimeDayCallback = jest.spyOn(ExtendedClass.prototype, '_updateTimeDayCallback');
                    mocks._addTodayEntries = jest.spyOn(ExtendedClass.prototype, '_addTodayEntries').mockImplementation(() => {});
                    const dateKey = generateKey(today.getFullYear(), today.getMonth(), today.getDate());
                    $('#' + dateKey + ' input[type="time"]').val('08:00');
                },
                date: new Date(),
                getCalendar: () =>
                {
                    const calendar = new ExtendedClass(getUserPreferences(), languageData);
                    return calendar;
                },
                expect: () =>
                {
                    expect(mocks._areAllInputsFilled).toHaveBeenCalledTimes(1);
                    expect(mocks._addTodayEntries).toHaveBeenCalledTimes(1);
                    expect(mocks._updateTimeDayCallback).toHaveBeenCalledTimes(0);
                }
            }
        ];
        for (const t of tests)
        {
            test(t.it, () =>
            {
                t.setup();
                const calendar = t.getCalendar();
                calendar._calendarDate = t.date;
                calendar.punchDate();
                t.expect();
            });
        }
    });

    afterEach(() =>
    {
        ExtendedClass.prototype._initCalendar = () =>
        {
            throw Error('Please implement this.');
        };

        ExtendedClass.prototype._getTargetDayForAllTimeBalance = () =>
        {
            throw Error('Please implement this.');
        };

        for (const mock of Object.values(mocks))
        {
            mock.mockRestore();
        }
        $('#overall-balance').remove();
        resetPreferences();
    });

    afterAll(() =>
    {
        const flexibleStore = new ElectronStore({name: 'flexible-store'});
        flexibleStore.clear();
        const waivedWorkdays = new ElectronStore({name: 'waived-workdays'});
        waivedWorkdays.clear();
    });
});