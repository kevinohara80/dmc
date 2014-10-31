var logger = require('../lib/logger');
var user   = require('../lib/user');

var run = module.exports.run = function(org, opts) {
  if(!user.hasCredential(org)) {
    logger.error('org credentials not found: ' + org);
    logger.done(false)
  } else {
    logger.log('deleting org credentials: ' + org);
    user.deleteCredential(org);
    logger.log('complete!');
    logger.done();
  }
}

var cli = module.exports.cli = function(program) {
  program.command('logout <org>')
    .description('logout of a Salesforce organization')
    .action(function(org, opts) {
      run(org, opts);
    });
};
