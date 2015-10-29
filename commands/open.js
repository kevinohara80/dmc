var Promise  = require('bluebird');
var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');
var identity = require('./identity');
var spawn    = require('child_process').spawn;
var resolve  = require('../lib/resolve');

var run = module.exports.run = function(opts, cb) {

  return resolve(cb, function() {

    return new Promise(function(resolve, reject) {

      Promise.resolve()

      .then(function(){
        return sfClient.getClient(opts.oauth);
      })

      .then(function(client) {
        return client.getIdentity();
      })

      .then(function(res) {
        logger.log('logging in: ' + res.username);

        var url = opts.oauth.instance_url +
          '/secur/frontdoor.jsp?sid=' +
          opts.oauth.access_token;

        logger.log('opening: ' + opts.org);

        var open = spawn('open', [url]);

        open.on('error', function(err) {
          reject(err);
        });

        open.on('exit', function(code, sig) {
          logger.log('open command complete');
          resolve();
        });
      })

      .catch(function(err) {
        logger.error('unable to open ' + opts.org);
        reject(err);
      });
    });

  });
};

module.exports.cli = function(program) {
  program.command('open [org]')
    .description('open the target org in a browser window')
    .action(function(org, opts) {
      opts.org = org;
      opts._loadOrg = true;
      return cliUtil.executeRun(run)(opts);
    });
};
