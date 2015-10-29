var Promise  = require('bluebird');
var logger   = require('../lib/logger');
var user     = require('../lib/user');
var sfClient = require('../lib/sf-client');
var cliUtil  = require('../lib/cli-util');
var config   = require('../lib/config');
var index    = require('../lib/index');
var async    = require('async');
var resolve  = require('../lib/resolve');

var run = module.exports.run = function(opts, cb) {

  return resolve(cb, function(){

    function revokeToken(tokenType) {
      logger.log('revoking ' + tokenType + ' token');

      return sfClient.getClient(opts.oauth)
        .then(function(client) {
          return client.revokeToken({
            token: opts.oauth[tokenType + '_token']
          });
        })
        .then(function(){
          logger.log(tokenType + ' token revoked');
        })
        .catch(function(err) {
          logger.log(tokenType + ' token not revoked: invalid');
        });
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

    function deleteIndex() {
      var idx = index.init(opts.org, opts.oauth);
      logger.log('cleaning up index cache');
      return idx.destroy();
    }

    return Promise.resolve()

    .then(function() {
      return Promise.all([
        revokeToken('access'),
        revokeToken('refresh')
      ]);
    })

    .then(function(){
      return config.loadAll();
    })

    .then(function(){
      return Promise.all([
        unsetDefaultOrg('local'),
        unsetDefaultOrg('global')
      ]);
    })

    .then(function() {
      return deleteIndex();
    })

    .then(function(){
      return deleteCredential();
    });

  });

};

var cli = module.exports.cli = function(program) {
  program.command('logout [org]')
    .description('logout of a Salesforce organization')
    .action(function(org, opts) {
      opts.org = org;
      opts._loadOrg = true;
      return cliUtil.executeRun(run)(opts);
    });
};
