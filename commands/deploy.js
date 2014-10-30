
module.exports.cli = function(program) {
  program.command('deploy <org> [meta...]')
    .action(function(org, globs) {
      console.log('org: ' + org);
      console.log('meta: ' + globs);
    });
};
