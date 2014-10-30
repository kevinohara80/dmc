var fs       = require('fs-extra');
var user     = require('../lib/user');
var prompt   = require('../lib/prompt');
var logger   = require('../lib/logger');

var run = module.exports.run = function(opts) {
  logger.log('running initialization');
}

module.exports.cli = function(program) {

  program.command('init')
    .description('initialize a project for dmc')
    .action(function(opts) {
      logger.log('This action will initialize a new dmcfile and');
      logger.log('remove any existing dmcfile in this project.');
      prompt.confirm('Continue?', false, function(ok) {
        if(ok) {
          run(opts);
        } else {
          logger.log('init cancelled. Exiting.');
          process.exit(0);
        }
      });
    });

};
