module.exports = function(program) {
  program.command('deploy <org> [metadata...]')
    .action(function(org, globs) {
      console.log('org: ' + org);
      console.log('meta: ' + globs);
    });
}
