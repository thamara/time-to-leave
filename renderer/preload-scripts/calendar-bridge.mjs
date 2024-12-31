/*eslint-disable no-global-assign*/
'use strict';

import { contextBridge } from 'electron';
import { calendarApi } from './calendar-api.mjs';

contextBridge.exposeInMainWorld(
    'mainApi', calendarApi
);
