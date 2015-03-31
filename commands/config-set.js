var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var _        = require('lodash');

var run = module.exports.run = function(opts, cb) {

  logger.log('global: ' + opts.global);
  logger.log('noval');

  cb(null, 'works great');
};


module.exports.cli = function(program) {
  program.command('config')
    .description('show a dmc global or local configuration')
    .option('-g, --global', 'Show the global config. If not specified, the project config will be shown')
    .action(function(opts) {
      run(opts, cliUtil.callback);
    });
};
