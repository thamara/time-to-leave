'use strict';

import { app, ipcMain } from 'electron';

import { changeLanguage } from '../src/configs/i18next.config.mjs';

let savedPreferences = null;

function getSavedPreferences()
{
    return savedPreferences;
}

ipcMain.on('PREFERENCE_SAVE_DATA_NEEDED', (event, preferences) =>
{
    savedPreferences = preferences;
    app.setLoginItemSettings({
        openAtLogin: preferences['start-at-login']
    });
    changeLanguage(preferences.language).catch((err) =>
    {
        if (err) return console.log('something went wrong loading', err);
    });
});

export {
    getSavedPreferences
};
