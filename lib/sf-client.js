var nforce   = require('nforce');
var user     = require('./user');
var logger   = require('./logger.js');
var tooling  = require('nforce-tooling')(nforce);
var metadata = require('nforce-metadata')(nforce);

function onRefresh(newOauth, oldOauth, cb) {
  logger.log('sfdc token refresh');
  if(oldOauth.nick) {
    user.saveCredential(oldOauth.nick, newOauth);
  }
  cb();
}

var conn = nforce.createConnection({
  clientId: '3MVG9rFJvQRVOvk5nd6A4swCycqQ0Hogb20LB7z3ndy1lwwrBb99R3GSl09cTKHNcJhIEAY5ttEAczOfCxPJ5',
  redirectUri: 'http://localhost:3835/oauth/_callback',
  apiVersion: 'v30.0',
  environment: 'production',
  mode: 'multi',
  plugins: ['tooling', 'meta'],
  metaOpts: {
    interval: 2000
  },
  autoRefresh: true,
  onRefresh: onRefresh
});

module.exports = conn;
