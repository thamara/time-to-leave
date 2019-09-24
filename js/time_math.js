/**
 * Formats hour, min into string HH:MM
 */
function hourMinToHourFormated (hours, minutes) {
    var paddingHour = hours < 10 ?  '0' : '';
    var paddingMin = minutes < 10 ?  '0' : '';
    return paddingHour + hours + 
           ':' + 
           paddingMin + minutes;
}

/**
 * Formats a given amount of minutes into string HH:MM
 */
function minutesToHourFormated (min) {
    var signStr = min < 0 ? '-' : '';
    if (min < 0) {
        min = Math.abs(min);
    }
    var hours = Math.floor(min / 60);
    var minutes = Math.floor(min - (hours * 60));
    return signStr + hourMinToHourFormated(hours, minutes);
}

/**
 * Subtracts time first from second (t2 - t1)
 * Time should be formated as HH:MM
 */
function subtractTime (t1, t2) {
    var st1 = t1.split(':');
    var st2 = t2.split(':');
    var d1 = new Date(2019, 1, 1, st1[0], st1[1], 0, 0);
    var d2 = new Date(2019, 1, 1, st2[0], st2[1], 0, 0);
    var diffMin = (d2 - d1)/1000/60;
    return minutesToHourFormated(diffMin);
}

/**
 * Multiplies t * n
 * Time should be formated as HH:MM
 */
function multiplyTime (t, n) {
    var st1 = t.split(':');
    var totalMin = Number(st1[1]) + (Number(st1[0]) * 60);
    totalMin = totalMin * n;
    return minutesToHourFormated(totalMin);
}

/**
 * Sums time first to second (t1 + t2)
 * Time should be formated as HH:MM
 */
function sumTime(t1, t2) {
    var st1 = t1.split(':');
    var st2 = t2.split(':');
    var totalMin = Number(st1[1]) + (Number(st1[0]) * 60) + Number(st2[1]) + (Number(st2[0]) * 60);
    return minutesToHourFormated(totalMin);
}

/**
 * Validates that a string is a valid time, following the format of HH:MM
 * @returns true if it's valid
 */
function validateTime(time) {
    var re = new RegExp('[0-2][0-9]:[0-5][0-9]');
    return re.test(time);
}

module.exports = {
    hourMinToHourFormated,
    multiplyTime,
    minutesToHourFormated,
    subtractTime,
    sumTime,
    validateTime
};
