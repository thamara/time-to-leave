const data = require('./mocha-base.config.cjs');

data.spec = ['__tests__/__main__/{time-math,validate-json}.js'];

module.exports = data;
