const Store = require('electron-store');
const {
    subtractTime,
    sumTime
} = require('./time-math.js');
const { getDateStr } = require('./date-aux.js');
const { getUserPreferences, showDay } = require('./user-preferences.js');

// Global values for calendar
const store = new Store();
const waivedWorkdays = new Store({ name: 'waived-workdays' });

function getFirstInputInDb() {
    var inputs = [];
    for (let value of store) {
        inputs.push(value[0]);
    }
    inputs.sort(function(a, b) {
        var [aYear, aMonth, aDay] = a.split('-');
        var [bYear, bMonth, bDay] = b.split('-');
        return new Date(aYear, aMonth, aDay) - new Date(bYear, bMonth, bDay);
    });
    return inputs.length ? inputs[0] : '';
}

function _formatDateForWaivedWorkdayDb(year, month, day) {
    // WaivedWorkday are formated with two digits for the month/day (01 instead of 1)
    // and has the month described by 1-12 (jan - dec)
    function twoDigitNumber(num) {
        return num < 10 ? `0${num}` : `${num}`;
    }
    return `${year}-${twoDigitNumber(month + 1)}-${twoDigitNumber(day)}`;
}

function _getHoursPerDay() {
    const savedPreferences = getUserPreferences();
    return savedPreferences['hours-per-day'];
}

function _getBalanceForDay(date, hoursPerDay) {
    const totalForDay = store.get(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-day-total`);
    const waivedDay = waivedWorkdays.get(_formatDateForWaivedWorkdayDb(date.getFullYear(), date.getMonth(), date.getDate()));
    // add worked/waived count
    var dayBalance = '00:00';
    if (waivedDay !== undefined) {
        dayBalance = waivedDay['hours'];
    } else if (totalForDay !== undefined) {
        dayBalance = totalForDay;
    }
    // From the worked/waived count, subtract the expected work time for the day
    dayBalance = subtractTime(hoursPerDay, dayBalance);

    return dayBalance;
}

async function computeAllTimeBalanceUntil(day) {
    const preferences = getUserPreferences();
    const firstInput = getFirstInputInDb();
    if (firstInput === '') {
        return '00:00';
    }
    var [firstYear, firstMonth, firstDay] = firstInput.split('-');
    var date = new Date(firstYear, firstMonth, firstDay);

    var allTimeTotal = '00:00';
    const hoursPerDay = _getHoursPerDay();
    while (getDateStr(date) !== getDateStr(day) && day > date) {
        if (showDay(date.getFullYear(), date.getMonth(), date.getDate(), preferences)) {
            const dayBalance = _getBalanceForDay(date, hoursPerDay);
            allTimeTotal = sumTime(dayBalance, allTimeTotal);
        }
        date.setDate(date.getDate() + 1);
    }
    return allTimeTotal;
}

async function computeAllTimeBalanceUntilAsync(day) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(computeAllTimeBalanceUntil(day));
        }, 1);
    });
}

module.exports = {
    computeAllTimeBalanceUntilAsync,
    computeAllTimeBalanceUntil,
    getFirstInputInDb
};