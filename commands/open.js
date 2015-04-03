var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');
var identity = require('./identity');
var spawn    = require('child_process').spawn;

var run = module.exports.run = function(org, opts, cb) {

  var oauth = user.getCredential(org);

  sfClient.getIdentity({ oauth: oauth }, function(err, res) {
    if(err) return cb(err);

    logger.log('logging in: ' + res.username);

    oauth = user.getCredential(org);

    var url = oauth.instance_url +
      '/secur/frontdoor.jsp?sid=' +
      oauth.access_token;

    logger.log('opening: ' + org);

    var open = spawn('open', [url]);

    open.on('exit', function(code, sig) {
      logger.log('open command complete');
      cb();
    });

  });

};

module.exports.cli = function(program) {
  program.command('open <org>')
    .description('open the target <org> in a browser window')
    .action(function(org, opts) {
      cliUtil.checkForOrg(org);
      run(org, opts, cliUtil.callback);
    });
};
