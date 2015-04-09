var logger     = require('../lib/logger');
var sfclient   = require('../lib/sf-client');
var authServer = require('../lib/auth-server');
var sfClient   = require('../lib/sf-client');
var cliUtil    = require('../lib/cli-util');
var spawn      = require('child_process').spawn;
var user       = require('../lib/user');

var authUri = sfClient.getAuthUri({ responseType: 'token' });

var run = module.exports.run = function(opts) {

  logger.log('login starts...');

  authServer.on('credentials', function(creds) {
    logger.log('received credentials');
    authServer.close();
    logger.log('shutting down server');
    logger.log('saving credentials for ' + opts.org);
    user.saveCredential(opts.org, creds);
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
  program.command('login')
    .description('login to a Salesforce organization')
    .option('-o, --org <org>', 'The Salesforce organization to use')
    .action(function(opts) {
      if(!opts.org) cliUtil.fail('no org name specified');
      run(opts);
    });
};
