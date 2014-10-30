var logger = require('../lib/logger');

var cli = module.exports.cli = function(program) {
  program.command('logout <org>')
    .description('logout of a Salesforce organization')
    .action(function(org, opts) {
      logger.log('logout starts...');
    });
};
