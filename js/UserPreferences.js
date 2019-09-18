const remote = require('electron').remote;
const path = require('path');
const fs = require('fs');

let userDataPath = remote.app.getPath('userData');
let filePath = path.join(userDataPath, 'preferences.json');
let preferences = JSON.parse(fs.readFileSync(filePath));

function getUserPreferences() {
    return preferences;
}

module.exports = {
    getUserPreferences
};