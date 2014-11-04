var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');

var run = module.exports.run = function(org, meta, opts, cb) {
  cb(new Error('not implemented'));
};

module.exports.cli = function(program) {
  program.command('retrieve <org> [meta...]')
    .description('retrieve specified [meta] from target <org>')
    .action(function(org, meta, opts) {
      cliUtil.checkForOrg(org);
      run(org, meta, opts, cliUtil.callback);
    });
};
