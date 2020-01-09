/*
 * Given a JS Date, return the string in the format YYYY-MM-DD.
 */
function getDateStr(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().substr(0, 10);
}

module.exports = {
    getDateStr
};
