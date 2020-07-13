/* eslint-disable no-undef */
const Store = require('electron-store');
const {
    computeAllTimeBalancelUntilDayAsync,
    computeAllTimeBalancelUntilDay,
    getFirstInputInDb
} = require('../../js/time-balance');

// Global values for calendar
const store = new Store();
const waivedWorkdays = new Store({ name: 'waived-workdays' });

describe('Time Balance', () => {
    test('getFirstInputInDb: no input', () => {
        const store = new Store();
        store.clear();
        expect(getFirstInputInDb()).toBe('');
    });

    test('getFirstInputInDb: input 1', () => {
        const entryEx = {
            '2020-3-1-day-begin': '08:00'
        };
        store.set(entryEx);
        expect(getFirstInputInDb()).toBe('2020-3-1-day-begin');
    });

    test('getFirstInputInDb: input 2', () => {
        const entryEx = {
            '2020-3-1-day-begin': '08:00',
            '2020-3-3-day-begin': '08:00'
        };
        store.set(entryEx);
        expect(getFirstInputInDb()).toBe('2020-3-1-day-begin');
    });

    test('getFirstInputInDb: input 3', () => {
        const entryEx = {
            '2020-3-1-day-begin': '08:00',
            '2020-3-3-day-begin': '08:00',
            '2020-2-1-day-begin': '08:00'
        };
        store.set(entryEx);
        expect(getFirstInputInDb()).toBe('2020-2-1-day-begin');
    });

    test('getFirstInputInDb: input 4', () => {
        store.clear();
        waivedWorkdays.clear();
        const entryEx = {
            '2020-6-6-day-begin': '10:00',
            '2020-6-6-day-end': '14:00',
            '2020-6-6-day-total': '03:00',
            '2020-6-6-lunch-begin': '12:00',
            '2020-6-6-lunch-end': '13:00',
            '2020-6-6-lunch-total': '01:00',
            '2020-6-7-day-begin': '10:00',
            '2020-6-7-day-end': '14:00',
            '2020-6-7-day-total': '03:00',
            '2020-6-7-lunch-begin': '12:00',
            '2020-6-7-lunch-end': '13:00',
            '2020-6-7-lunch-total': '01:00',
            '2020-6-8-day-begin': '10:00',
            '2020-6-8-day-end': '19:00',
            '2020-6-8-day-total': '08:00',
            '2020-6-8-lunch-begin': '13:00',
            '2020-6-8-lunch-end': '14:00',
            '2020-6-8-lunch-total': '01:00',
            '2020-6-9-day-begin': '10:00',
            '2020-6-9-day-end': '22:00',
            '2020-6-9-day-total': '11:00',
            '2020-6-9-lunch-begin': '12:00',
            '2020-6-9-lunch-end': '13:00',
            '2020-6-9-lunch-total': '01:00',
            '2020-6-10-day-begin': '08:00',
            '2020-6-10-day-end': '19:00',
            '2020-6-10-day-total': '10:00',
            '2020-6-10-lunch-begin': '12:00',
            '2020-6-10-lunch-end': '13:00',
            '2020-6-10-lunch-total': '01:00',
        };
        store.set(entryEx);
        expect(getFirstInputInDb()).toBe('2020-6-6-day-begin');
    });

    test('computeAllTimeBalancelUntilDay: no input', () => {
        store.clear();
        waivedWorkdays.clear();
        expect(computeAllTimeBalancelUntilDay(new Date())).resolves.toBe('00:00');
    });

    test('computeAllTimeBalancelUntilDay: only regular days', () => {
        store.clear();
        waivedWorkdays.clear();
        const entryEx = {
            '2020-6-1-day-total': '08:00'
        };
        store.set(entryEx);
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 2))).resolves.toBe('00:00');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 3))).resolves.toBe('-08:00');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 4))).resolves.toBe('-16:00');
    });

    test('computeAllTimeBalancelUntilDay: only regular days (with overtime)', () => {
        store.clear();
        waivedWorkdays.clear();
        const entryEx = {
            '2020-6-1-day-total': '09:30'
        };
        store.set(entryEx);
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 2))).resolves.toBe('01:30');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 3))).resolves.toBe('-06:30');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 4))).resolves.toBe('-14:30');
    });

    test('computeAllTimeBalancelUntilDay: only regular days (with undertime)', () => {
        store.clear();
        waivedWorkdays.clear();
        const entryEx = {
            '2020-6-1-day-total': '06:15'
        };
        store.set(entryEx);
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 2))).resolves.toBe('-01:45');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 3))).resolves.toBe('-09:45');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 4))).resolves.toBe('-17:45');
    });

    test('computeAllTimeBalancelUntilDay: only regular days (with mixed time)', () => {
        store.clear();
        waivedWorkdays.clear();
        const entryEx = {
            '2020-6-1-day-total': '06:15',
            '2020-6-2-day-total': '09:15',
            '2020-6-3-day-total': '06:15',
        };
        store.set(entryEx);
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 2))).resolves.toBe('-01:45');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 3))).resolves.toBe('-00:30');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 4))).resolves.toBe('-02:15');
    });

    test('computeAllTimeBalancelUntilDay: missing entries', () => {
        store.clear();
        waivedWorkdays.clear();
        const entryEx = {
            '2020-6-1-day-total': '08:00',
            '2020-6-3-day-total': '08:00',
        };
        store.set(entryEx);
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 2))).resolves.toBe('00:00');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 3))).resolves.toBe('-08:00');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 4))).resolves.toBe('-08:00');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 5))).resolves.toBe('-08:00');
    });

    test('computeAllTimeBalancelUntilDay: with waived days', () => {
        store.clear();
        waivedWorkdays.clear();
        const entryEx = {
            '2020-6-1-day-total': '08:00',
            '2020-6-3-day-total': '08:00',
        };
        store.set(entryEx);
        const waivedEntries = {
            '2020-07-02': { reason: 'Waiver', hours: '08:00' },
        };
        waivedWorkdays.set(waivedEntries);
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 2))).resolves.toBe('00:00');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 3))).resolves.toBe('00:00');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 4))).resolves.toBe('00:00');
    });

    test('computeAllTimeBalancelUntilDay: with waived days 2', () => {
        store.clear();
        waivedWorkdays.clear();
        const entryEx = {
            '2020-6-8-day-total': '08:00',
        };
        store.set(entryEx);
        const waivedEntries = {
            '2020-07-09': { reason: 'Waiver', hours: '08:00' },
            '2020-07-10': { reason: 'Waiver', hours: '08:00' },
        };
        waivedWorkdays.set(waivedEntries);
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 8))).resolves.toBe('00:00');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 9))).resolves.toBe('00:00');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 10))).resolves.toBe('00:00');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 11))).resolves.toBe('00:00');
    });

    test('computeAllTimeBalancelUntilDay: with waived days (not full)', () => {
        store.clear();
        waivedWorkdays.clear();
        const entryEx = {
            '2020-6-1-day-total': '08:00',
            '2020-6-3-day-total': '08:00',
        };
        store.set(entryEx);
        const waivedEntries = {
            '2020-07-02': { reason: 'Waiver', hours: '02:00' },
        };
        waivedWorkdays.set(waivedEntries);
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 2))).resolves.toBe('00:00');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 3))).resolves.toBe('-06:00');
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 6, 4))).resolves.toBe('-06:00');
    });

    test('computeAllTimeBalancelUntilDay: target date in the past of entries', () => {
        store.clear();
        waivedWorkdays.clear();
        const entryEx = {
            '2020-6-1-day-total': '08:00',
            '2020-6-3-day-total': '08:00',
        };
        store.set(entryEx);
        const waivedEntries = {
            '2020-07-02': { reason: 'Waiver', hours: '02:00' },
        };
        waivedWorkdays.set(waivedEntries);
        expect(computeAllTimeBalancelUntilDay(new Date(2020, 5, 1))).resolves.toBe('00:00');
    });

    test('computeAllTimeBalancelUntilDayAsync: should do seamless call', async() => {
        await computeAllTimeBalancelUntilDayAsync(new Date(2020, 5, 1));
    });
});