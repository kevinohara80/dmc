var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');

var run = module.exports.run = function(org, url, opts) {
  var orgCreds = user.getCredential(org);
  //console.log(orgCreds);
  sfClient.getUrl({ oauth: orgCreds, url: url }, function(err, res) {
    if(err) {
      logger.error(err.message);
      logger.done(false);
      process.exit(1);
    } else {
      logger.log('resp:');
      console.log(res);
      logger.done();
    }
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
