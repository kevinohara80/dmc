var fs   = require('fs-extra');
var user = require('../../lib/user');

function run(opts) {

}

module.exports = function(program) {
  program.command('init')
    .description('initialize a project for dmc')
    .action(function(opts) {
      program.confirm('This action will overwrite overwrite any existing dmcfile. Continue?', function(ok) {
        if(!ok) {
          
        }
      })
    });
};
