var logger     = require('../lib/logger');
var sfclient   = require('../lib/sf-client');
var authServer = require('../lib/auth-server');
var sfClient   = require('../lib/sf-client');
var spawn      = require('child_process').spawn;
var user       = require('../lib/user');

var authUri = sfClient.getAuthUri({ responseType: 'token' });

var run = module.exports.run = function(org, opts) {

  logger.log('login starts...');

  authServer.on('credentials', function(creds) {
    logger.log('received credentials');
    authServer.close();
    logger.log('shutting down server');
    logger.log('saving credentials for ' + org);
    user.saveCredential(org, creds);
    logger.done();
  });

  authServer.listen(3835, function(){
    logger.log('auth server started');
    logger.log('redirect to the following uri');
    logger.log(authUri);
    // probably only works on Mac right now
    spawn('open', [authUri]);
  });
};

var cli = module.exports.cli = function(program) {
  program.command('login <org>')
    .description('login to a Salesforce organization')
    .option('-u <user>', 'your salesforce username')
    .option('-p <pass>', 'your salesforce password')
    .action(function(org, opts) {
      run(org, opts);
    });
};
