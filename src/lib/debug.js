const prefix = process.env.DEBUG_PREFIX || 'erp';
const debug = key => require('debug')(`${prefix}:${key}`)

module.exports = debug;
