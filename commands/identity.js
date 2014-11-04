var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');

var run = module.exports.run = function(org, opts, cb) {
  var oauth = user.getCredential(org);

  sfClient.getIdentity({ oauth: oauth }, function(err, res){
    if(err) return cb(err);
    console.log(res);
    cb();
  });
};

module.exports.cli = function(program) {
  program.command('identity <org>')
    .description('show the identity for target <org>')
    .action(function(org, file, opts) {
      cliUtil.checkForOrg(org);
      run(org, opts, cliUtil.callback);
    });
};
