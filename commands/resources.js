var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');

var run = module.exports.run = function(org, opts) {
  var orgCreds = user.getCredential(org);
  //console.log(orgCreds);
  sfClient.getResources({ oauth: orgCreds }, function(err, res) {
    if(err) {
      logger.error(err.message);
      logger.done(false);
      process.exit(1);
    } else {
      logger.log('listing resources:');
      for(var key in res) {
        logger.list(key + ' ' + res[key]);
      }
      logger.done();
    }
  });
};

module.exports.cli = function(program) {
  program.command('resources <org>')
    .description('list all of the available api resources')
    .action(function(org, opts) {
      cliUtil.checkForOrg(org);
      run(org, opts);
    });
};
