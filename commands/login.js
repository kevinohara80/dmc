var logger     = require('../lib/logger');
var sfclient   = require('../lib/sf-client');
var authServer = require('../lib/auth-server');
var sfClient   = require('../lib/sf-client');
var cliUtil    = require('../lib/cli-util');
var spawn      = require('child_process').spawn;
var user       = require('../lib/user');

var run = module.exports.run = function(opts) {

  var clientOpts = {};

  if(opts.test) {
    clientOpts.environment = 'sandbox';
  } else if(opts.uri) {
    clientOpts.loginUri = opts.uri;
  }

  sfClient.getClient(clientOpts).then(function(client) {

    var authUri = client.getAuthUri({ responseType: 'token' });

    logger.log('login starts...');

    authServer.on('credentials', function(creds) {
      logger.log('received credentials');
      authServer.close();
      logger.log('shutting down server');
      logger.log('saving credentials for ' + opts.org);
      creds.nick = opts.org;
      creds.org = opts.org;
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
  });

};

var cli = module.exports.cli = function(program) {
  program.command('login <org>')
    .description('login to a Salesforce organization')
    .option('-t, --test', 'login to a test environment')
    .option('-u, --uri <uri>', 'specify a login uri')
    .action(function(org, opts) {
      if(!org) cliUtil.fail('no org name specified');
      opts.org = org;
      run(opts);
    });
};
