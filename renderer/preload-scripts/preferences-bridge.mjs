/*eslint-disable no-global-assign*/
'use strict';

import { contextBridge } from 'electron';
import { preferencesApi } from './preferences-api.mjs';

contextBridge.exposeInMainWorld(
    'mainApi', preferencesApi
);
