var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');
var resolve  = require('../lib/resolve');

var run = module.exports.run = function(opts, cb) {

  return resolve(cb, function(){

    return sfClient.getClient(opts.oauth)

    .then(function(client) {
      return client.getUrl({ oauth: opts.oauth, url: opts.url });
    })

    .then(function(res) {
      logger.log('resp:');
      return res;
    });

  });

};

module.exports.cli = function(program) {
  program.command('get <url>')
    .description('get a REST API url')
    .option('-o, --org <org>', 'The Salesforce organization to use')
    .action(function(url, opts) {
      opts.url = url;
      return cliUtil.executeRun(run)(opts);
    });
};
