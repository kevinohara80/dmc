var logger = require('../lib/logger');
var user   = require('../lib/user');

var run = module.exports.run = function(org, opts) {
  if(!user.hasCredentials(org)) {
    logger.error('org credentials not found: ' + org);
  } else {
    logger.log('deleting org credentials: ' + org);
    user.deleteCredentials(org);
    logger.log('complete!');
  }
}

var cli = module.exports.cli = function(program) {
  program.command('logout <org>')
    .description('logout of a Salesforce organization')
    .action(function(org, opts) {
      run(org, opts);
    });
};
