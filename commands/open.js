var user       = require('../lib/user');
var logger     = require('../lib/logger');
var cliUtil    = require('../lib/cli-util');
var sfClient   = require('../lib/sf-client');
var identity   = require('./identity');
var resolveOrg = require('../lib/resolve-org');
var spawn      = require('child_process').spawn;

var run = module.exports.run = function(opts, cb) {

  sfClient.getIdentity({ oauth: opts.oauth }, function(err, res) {
    if(err) return cb(err);

    logger.log('logging in: ' + res.username);

    var url = opts.oauth.instance_url +
      '/secur/frontdoor.jsp?sid=' +
      opts.oauth.access_token;

    logger.log('opening: ' + opts.org);

    var open = spawn('open', [url]);

    open.on('exit', function(code, sig) {
      logger.log('open command complete');
      cb();
    });

  });

};

module.exports.cli = function(program) {
  program.command('open [org]')
    .description('open the target org in a browser window')
    .option('-o, --org <org>', 'The Salesforce organization to use')
    .action(function(org, opts) {
      opts.org = org || opts.org;
      return cliUtil.executeRun(run)(opts);
    });
};
