var Promise  = require('bluebird');
var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');
var resolve  = require('../lib/resolve');

var run = module.exports.run = function(opts, cb) {

  return resolve(cb, function(){

    return Promise.resolve()

    .then(function() {
      return sfClient.getClient(opts.oauth);
    })

    .then(function(client) {
      return client.getResources();
    })

    .then(function(res) {
      logger.log('listing resources:');
      for(var key in res) {
        logger.list(key + ': ' + res[key]);
      }
      return res;
    });

  });

};

module.exports.cli = function(program) {
  program.command('resources')
    .description('list all of the available api resources')
    .option('-o, --org <org>', 'The Salesforce organization to use')
    .action(function(opts) {
      opts._loadOrg = true;
      return cliUtil.executeRun(run)(opts);
    });
};
