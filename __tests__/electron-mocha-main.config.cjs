const data = require('./mocha-base.config.cjs');

data.spec = ['__tests__/__main__/*.mjs'];

// For some reason parallel makes electron import fail
data.parallel = false;

module.exports = data;
