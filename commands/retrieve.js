var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');

var run = module.exports.run = function(opts, cb) {
  cb(new Error('not implemented'));
};

module.exports.cli = function(program) {
  program.command('retrieve [globs...]')
    .description('retrieve metadata from target org')
    .option('-o, --org <org>', 'the Salesforce organization to use')
    .option('--meta', 'force retrieve with metadata api')
    .action(function(globs, opts) {
      opts.globs = globs;
      return cliUtil.executeRun(run)(opts);
    });
};
