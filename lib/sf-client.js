var nforce   = require('nforce');
var user     = require('./user');
var logger   = require('./logger');
var Promise  = require('bluebird');
var config   = require('./config');
var tooling  = require('nforce-tooling')(nforce);
var metadata = require('nforce-metadata')(nforce);

function onRefresh(newOauth, oldOauth, cb) {
  logger.log('sfdc token refresh');
  if(oldOauth.nick) {
    user.saveCredential(oldOauth.nick, newOauth).then(function(){
      cb();
    }).catch(function(err) {
      cb(err);
    });
  } else {
    cb();
  }
}

var conn = nforce.createConnection({
  clientId: '3MVG9rFJvQRVOvk5nd6A4swCycqQ0Hogb20LB7z3ndy1lwwrBb99R3GSl09cTKHNcJhIEAY5ttEAczOfCxPJ5',
  redirectUri: 'http://localhost:3835/oauth/_callback',
  apiVersion: 'v32.0',
  environment: 'production',
  mode: 'multi',
  plugins: ['tooling', 'meta'],
  metaOpts: {
    interval: 2000
  },
  autoRefresh: true,
  onRefresh: onRefresh
});

function getClient(opts) {

  opts = opts || {};

  return config.loadAll().then(function() {

    var apiVersion = config.get('apiVersion');

    return nforce.createConnection({
      clientId: '3MVG9rFJvQRVOvk5nd6A4swCycqQ0Hogb20LB7z3ndy1lwwrBb99R3GSl09cTKHNcJhIEAY5ttEAczOfCxPJ5',
      redirectUri: 'http://localhost:3835/oauth/_callback',
      apiVersion: config.get('api_version') || 'v32.0',
      environment: opts.environment || 'production',
      loginUri: opts.loginUri || undefined,
      mode: 'multi',
      plugins: ['tooling', 'meta'],
      metaOpts: {
        interval: 2000
      },
      autoRefresh: true,
      onRefresh: onRefresh
    });

  });
}

module.exports = conn;
module.exports.getClient = getClient;
