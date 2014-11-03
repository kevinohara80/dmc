var logger   = require('../lib/logger');
var user     = require('../lib/user');
var sfClient = require('../lib/sf-client');
var cliUtil  = require('../lib/cli-util');
var async    = require('async');

var run = module.exports.run = function(org, opts, cb) {

  var orgCred = user.getCredential(org);

  async.series([
    function(cb) {
      logger.log('revoking access token');
      sfClient.revokeToken({ oauth: orgCred, token: orgCred.access_token }, cb);
    },
    function(cb) {
      logger.log('revoking refresh token');
      sfClient.revokeToken({ oauth: orgCred, token: orgCred.refresh_token }, cb);
    },
    function(cb) {
      logger.log('removing local credentials');
      user.deleteCredential(org);
      cb();
    }
  ], function(err, results) {
    if(err) {
      cb(err.message);
    } else {
      cb(null);
    }
  });
}

var cli = module.exports.cli = function(program) {
  program.command('logout <org>')
    .description('logout of a Salesforce organization')
    .action(function(org, opts) {
      cliUtil.checkForOrg(org);
      run(org, opts, cliUtil.callback);
    });
};
