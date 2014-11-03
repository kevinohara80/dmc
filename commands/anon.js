var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');

var run = module.exports.run = function(org, globs, opts, cb) {
  logger.log('runs ok');
  cb(null);
};

module.exports.cli = function(program) {
  program.command('anon <org> <file>')
    .description('execute anonymous apex <file> in a target <org>')
    .action(function(org, file, opts) {
      cliUtil.checkForOrg(org);
      run(org, opts, cliUtil.callback);
    });
};
