var config   = require('../lib/config');
var cliUtil  = require('../lib/cli-util');
var prompt   = require('../lib/prompt');
var logger   = require('../lib/logger');

var run = module.exports.run = function(opts, cb) {
  logger.log('Initializing local dmc project config');
  logger.log('writing ' + process.cwd() + '/dmc_config.json');
  config.local().init().then(function(){
    cb();
  }).catch(function(err) {
    cb(err);
  });
}

module.exports.cli = function(program) {

  program.command('init')
    .description('initialize a project for dmc')
    .action(function(opts) {
      logger.log('This action will initialize a new dmc_config.json and');
      logger.log('remove any existing dmc_config.json in this project.');
      prompt.confirm('Continue?', false, function(ok) {
        if(ok) {
          run(opts, cliUtil.callback);
        } else {
          logger.log('init cancelled. Exiting.');
          process.exit(0);
        }
      });
    });

};
