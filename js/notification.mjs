'use strict';

import path from 'path';
import { app, Notification as ElectronNotification } from 'electron';

import { getDateStr } from './date-aux.mjs';
import { hourToMinutes, subtractTime, validateTime } from './time-math.mjs';
import { getNotificationsInterval, notificationIsEnabled, repetitionIsEnabled } from './user-preferences.mjs';
import { getCurrentTranslation } from '../src/configs/i18next.config.mjs';
import { MockClass } from '../__mocks__/Mock.mjs';

// Allow require()
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { rootDir } = require('./app-config.cjs');

let dismissToday = null;

function createNotification(msg, actions = [])
{
    const appPath = process.env.NODE_ENV === 'production'
        ? `${process.resourcesPath}/app`
        : rootDir;
    let notification;
    if (process.platform === 'win32')
    {
        notification = new ElectronNotification({ toastXml: `
            <toast launch="time-to-leave" activationType="protocol">
            <visual>
            <binding template="ToastGeneric">
            <image placement="AppLogoOverride" src="${path.join(appPath, 'assets/ttl.png')}"/>
            <text>Time to Leave</text>
            <text>${msg}</text>
            </binding>
            </visual>
            <actions>
                ${actions.map(action => `<action content="${action.text}" arguments="action=${action.action}" activationType="background" />`)}
            </actions>
            </toast>`
        });

    }
    else
    {
        notification = new ElectronNotification({
            title: 'Time to Leave',
            body: msg,
            icon: path.join(appPath, 'assets/ttl.png'),
            sound: true,
            actions
        });

    }
    notification.addListener('click', () =>
    {
        app.emit('activate');
    });
    return notification;
}

/*
 * Notify user if it's time to leave
 */
function _createLeaveNotification(timeToLeave)
{
    const now = new Date();
    const dateToday = getDateStr(now);
    const skipNotify = dismissToday === dateToday;

    if (!notificationIsEnabled() || !timeToLeave || skipNotify)
    {
        return false;
    }

    if (validateTime(timeToLeave))
    {
        /**
         * How many minutes should pass before the Time-To-Leave notification should be presented again.
         * @type {number} Minutes post the clockout time
         */
        const notificationInterval = getNotificationsInterval();
        const curTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

        // Let check if it's past the time to leave, and the minutes line up with the interval to check
        const minutesDiff = hourToMinutes(subtractTime(timeToLeave, curTime));
        const isRepeatingInterval = curTime > timeToLeave && (minutesDiff % notificationInterval === 0);
        if (curTime === timeToLeave || (isRepeatingInterval && repetitionIsEnabled()))
        {
            const dismissForTodayText = getCurrentTranslation('$Notification.dismiss-for-today');
            const dismissBtn = {type: 'button', text: dismissForTodayText, action: 'dismiss', title: 'dismiss'};
            return createNotification(getCurrentTranslation('$Notification.time-to-leave'), [dismissBtn])
                .addListener('action', (response) =>
                {
                    // Actions are only supported on macOS
                    if ( response && dismissBtn.title.toLowerCase() === response.toLowerCase())
                    {
                        dismissToday = dateToday;
                    }
                }).addListener('close', () =>
                {
                    // We'll assume that if someone closes the notification they're
                    // dismissing the notifications
                    dismissToday = dateToday;
                });
        }
    }
    return false;
}

/**
 * Test related function to force a dismiss value
 * @param {String} dismiss Dismiss value in HH:MM format
 */
function updateDismiss(dismiss)
{
    dismissToday = dismiss;
}

/**
 * Test related function to get the dismiss value
 */
function getDismiss()
{
    return dismissToday;
}

// Enable mocking for some methods, export the mocked versions
const mocks = {'createLeaveNotification': _createLeaveNotification};
export const createLeaveNotification = (timeToLeave) => mocks['createLeaveNotification'](timeToLeave);
export const notificationMock = new MockClass(mocks);

export {
    createNotification,
    getDismiss,
    updateDismiss
};
