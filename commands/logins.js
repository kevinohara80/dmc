var logger = require('../lib/logger');

var cli = module.exports.cli = function(program) {
  program.command('logins')
    .description('list your salesforce logins')
    .action(function(org, opts) {
      logger.log('loginsstarts...');
    });
};
