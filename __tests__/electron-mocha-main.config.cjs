const data = require('./mocha-base.config.cjs');

data.spec = ['__tests__/__main__/{date-aux,import-export,time-math,validate-json}.js'];

module.exports = data;
