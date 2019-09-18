const electron = require('electron');
const path = require('path');
const fs = require('fs');

const defaultPreferences = {
    'hours-per-day': '08:00',
    'notification': 'enabled',
    'working-days-monday': true,
    'working-days-tuesday': true,
    'working-days-wednesday': true,
    'working-days-thursday': true,
    'working-days-friday': true,
    'working-days-saturday': false,
    'working-days-sunday': false,
};

/*
 * Returns the preference file path, considering the userData path
 */
function getPreferencesFilePath() {
    let userDataPath = (electron.app || electron.remote.app).getPath('userData');
    return path.join(userDataPath, 'preferences.json');
}

/*
 * Saves preference to file.
 */
function savePreferences(preferencesOptions) {
    fs.writeFileSync(getPreferencesFilePath(), JSON.stringify(preferencesOptions));
}

/*
 * Loads preference from file.
 */
function readPreferences() {
    return JSON.parse(fs.readFileSync(getPreferencesFilePath()));
}

/*
 * Returns the user preferences.
 */
function getUserPreferences() {
    // Initialize preferences file if it doesn't exists
    if (!fs.existsSync(getPreferencesFilePath())) {
        savePreferences(defaultPreferences);
    }
    return readPreferences();
}

module.exports = {
    getUserPreferences,
    savePreferences
};