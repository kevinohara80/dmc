var logger   = require('../lib/logger');
var sfclient = require('../lib/sf-client');

var run = module.exports.run = function(org, opts) {
  
}

var cli = module.exports.cli = function(program) {
  program.command('login <org>')
    .description('login to a Salesforce organization')
    .option('-u <user>', 'your salesforce username')
    .option('-p <pass>', 'your salesforce password')
    .action(function(org, opts) {
      logger.log('login starts...');
    });
};
