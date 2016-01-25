var logger     = require('../lib/logger');
var Promise    = require('bluebird');
var sfclient   = require('../lib/sf-client');
var authServer = require('../lib/auth-server');
var index      = require('../commands/index');
var sfClient   = require('../lib/sf-client');
var cliUtil    = require('../lib/cli-util');
var open       = require('open');
var user       = require('../lib/user');
var resolve    = require('../lib/resolve');

function createClientOpts(opts) {
  var clientOpts = {};
  if(opts.test) {
    clientOpts.environment = 'sandbox';
  } else if(opts.uri) {
    clientOpts.loginUri = opts.uri;
  }
  return clientOpts;
}

function cliLogin(opts, cb) {

  var clientOpts = createClientOpts(opts);

  var client, oauth;

  return sfClient.getClient(clientOpts)

  .then(function(newClient) {

    client = newClient;

    return client.authenticateSOAP({
      username: opts.user,
      password: opts.pass,
      securityToken: opts.token
    });
  })

  .then(function(newOauth) {
    oauth = newOauth;
    logger.log('received credentials');
    logger.log('saving credentials for ' + opts.org);
    return user.saveCredential(opts.org, oauth);
  })

  .then(function() {
    return new Promise(function(resolve, reject) {
      return index.run({ org: opts.org, oauth: oauth }, function(err, res) {
        if(err) {
          logger.error('unable to save index');
          return reject(err);
        }
        resolve();
      });
    });
  })

  .catch(function(err) {
    logger.error('authentication failed: ' + err.message);
  });
  
}

function webLogin(opts, cb) {

  var clientOpts = createClientOpts(opts);

  return sfClient.getClient(clientOpts)

  .then(function(client) {

    return new Promise(function(resolve, reject) {

      var authUri = client.getAuthUri({ responseType: 'token' });

      authServer.on('credentials', function(creds) {
        logger.log('received credentials');
        logger.log('shutting down server');

        authServer.close();

        creds.nick        = opts.org;
        creds.org         = opts.org;
        creds.environment = clientOpts.environment;
        creds.loginUri    = opts.uri;

        logger.log('saving credentials for ' + opts.org);

        user.saveCredential(opts.org, creds)

        .then(function(){
          return index.run({ org: opts.org, oauth: creds}, function(err, res) {
            if(err) {
              logger.error('unable to save index');
              reject(err);
            } else {
              resolve();
            }
          });
        });
      });

      authServer.listen(3835, function(err){
        if(err) {
          return reject(err);
        }
        logger.log('auth server started');
        logger.log('redirect to the following uri');
        logger.log(authUri);
        open(authUri);
      });

    });

  });
}

var run = module.exports.run = function(opts, cb) {
  logger.log('login starting...');
  if(opts.user) {
    return cliLogin(opts, cb);
  } else {
    return webLogin(opts, cb);
  }
};

var cli = module.exports.cli = function(program) {
  program.command('login <org>')
    .description('login to a Salesforce organization')
    .option('-u, --user <user>', 'specify a username for user/pass auth')
    .option('-p, --pass <pass>', 'specify a password for user/pass auth')
    .option('-t, --token <token>', 'specify a security token for user/pass auth')
    .option('--test', 'login to a test environment')
    .option('--uri <uri>', 'specify a login uri')
    .action(function(org, opts) {
      if(!org) cliUtil.fail('no org name specified');
      opts.org = org;
      run(opts);
    });
};
