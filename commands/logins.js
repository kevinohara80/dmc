var logger  = require('../lib/logger');
var user    = require('../lib/user');
var cliUtil = require('../lib/cli-util.js');

var run = module.exports.run = function(opts, cb) {
  user.listCredentials().then(function(creds) {
    if(!creds || creds.length === 0) {
      logger.log('no logins found!');
      return cb();
    }

    logger.log('listing all logins:');

    creds.forEach(function(c) {
      logger.list(c.name + ' - ' + c.instance_url);
    });
    cb(null, creds);
  }).catch(function(err) {
    cb(err);
  });
};

var cli = module.exports.cli = function(program) {
  program.command('logins')
    .description('list your salesforce logins')
    .action(function(opts) {
      run(opts, cliUtil.callback);
    });
};
