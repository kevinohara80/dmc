var logger     = require('../lib/logger');
var user       = require('../lib/user');
var sfClient   = require('../lib/sf-client');
var cliUtil    = require('../lib/cli-util');
var async      = require('async');
var resolveOrg = require('../lib/resolve-org');

var run = module.exports.run = function(opts, cb) {

  var data = {
    oauth: opts.oauth,
    token: opts.oauth.access_token
  };

  logger.log('revoking access token');
  sfClient.revokeToken(data).then(function() {
    data.token = data.oauth.refresh_token;
    logger.log('revoking refresh token');
    return sfClient.revokeToken(data);
  }).then(function(){
    logger.log('removing local credentials');
    return user.deleteCredential(opts.oauth.nick);
  }).then(function(){
    cb();
  }).catch(cb);
};

var cli = module.exports.cli = function(program) {
  program.command('logout')
    .description('logout of a Salesforce organization')
    .option('-o, --org <org>', 'Specify the Salesforce org to log out of')
    .action(function(opts) {
      resolveOrg(opts.org).then(function(oauth){
        opts.oauth = oauth;
        run(opts, cliUtil.callback);
      }).catch(cliUtil.callback);
    });
};
