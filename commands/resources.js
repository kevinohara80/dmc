var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');

var run = module.exports.run = function(opts, cb) {

  sfClient.getResources({ oauth: opts.oauth }).then(function(res) {
    logger.log('listing resources:');
    for(var key in res) {
      logger.list(key + ': ' + res[key]);
    }
    cb();
  }).catch(cb);
};

module.exports.cli = function(program) {
  program.command('resources')
    .description('list all of the available api resources')
    .option('-o, --org <org>', 'The Salesforce organization to use')
    .action(function(opts) {
      return cliUtil.executeRun(run)(opts);
    });
};
