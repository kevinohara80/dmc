var tmp = require('./tmp');

console.log('TEST GLOBAL CONFIG')
console.log('process.env[TEST_MODE] = true');
process.isTestMode = true;

tmp.initSync();

// check to make sure we aren't running in production or staging
// var env = process.env['NODE_ENV'] || 'development';
// if(env === 'production' || env === 'staging') {
//   throw new Error('tests cannot be run in ' + env);
// }
