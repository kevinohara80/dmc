var Promise    = require('bluebird');
var logger     = require('../lib/logger');
var user       = require('../lib/user');
var sfClient   = require('../lib/sf-client');
var cliUtil    = require('../lib/cli-util');
var config     = require('../lib/config');
var async      = require('async');

var run = module.exports.run = function(opts, cb) {

  function revokeToken(tokenType) {
    logger.log('revoking ' + tokenType + ' token');
    return sfClient.revokeToken({
      oauth: opts.oauth,
      token: opts.oauth[tokenType + '_token']
    }).then(function(){
      logger.log(tokenType + ' token revoked');
    }).catch(function(err) {
      logger.log(tokenType + ' token not revoked: invalid');
    })
  }

  function deleteCredential() {
    logger.log('removing credentials');
    return user.deleteCredential(opts.org);
  }

  function unsetDefaultOrg(cfgType) {
    var cfg = config[cfgType]();
    if(cfg.exists() && cfg.get('defaultOrg') === opts.org) {
      logger.log('unsetting ' + cfgType + ' defaultOrg config');
      cfg.set('defaultOrg', null);
      return cfg.save();
    }
  }

  return Promise.resolve().then(function() {
    return Promise.all([
      revokeToken('access'),
      revokeToken('refresh')
    ]);
  }).then(function(){
    return config.loadAll();
  }).then(function(){
    return Promise.all([
      unsetDefaultOrg('local'),
      unsetDefaultOrg('global')
    ]);
  }).then(function(){
    return deleteCredential();
  }).then(cb).catch(cb);

};

var cli = module.exports.cli = function(program) {
  program.command('logout [org]')
    .description('logout of a Salesforce organization')
    .option('-o, --org <org>', 'The Salesforce organization to use')
    .action(function(org, opts) {
      opts.org = org || opts.org;
      return cliUtil.executeRun(run)(opts);
    });
};
