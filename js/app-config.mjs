'use strict';

// ES6 wrapper for app-config.cjs

// Allow require()
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { appConfig, getDetails, rootDir } = require('./app-config.cjs');

export {
    appConfig,
    getDetails,
    rootDir,
};
