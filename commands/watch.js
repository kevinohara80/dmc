var Promise  = require('bluebird');
var glob     = Promise.promisify(require('glob'));
var cliUtil  = require('../lib/cli-util');
var _        = require('lodash');
var logger   = require('../lib/logger');
var watch    = require('node-watch');
var hl       = logger.highlight;

var deploy   = require('./deploy');

var globOpts = {
  matchBase: true,
  nodir: false,
  noglobstar: false,
  nomount: true
};

var run = module.exports.run = function(opts) {

  if(!opts.globs || !opts.globs.length) {
    opts.globs = [ 'src/**/*' ];
  }

  Promise.reduce(opts.globs, function(allFiles, file) {
    return glob(file, globOpts).then(function(files) {
      return allFiles.concat(files);
    });
  }, [])

  .then(function(allFiles) {
    logger.log('now watching ' + hl(allFiles.length) + ' files');
    watch(_.uniq(allFiles), function(f) {
      logger.log('file changed: ' + f);
      deploy.run({
        org: opts.org,
        oauth: opts.oauth,
        globs: [f],
        meta: opts.meta
      }, function(err, res) {
        if(err) {
          logger.error('deploy failed: re-watching files');
        } else {
          logger.success('deploy complete: re-watching files');
        }
      });
    });
  });

};

module.exports.cli = function(program) {
  program.command('watch [globs...]')
    .description('watch files and deploy metadata to target org')
    .option('-o, --org <org>', 'the Salesforce organization to use')
    .option('--meta', 'force deploy with metadata api')
    .action(function(globs, opts) {
      opts.globs = globs;
      opts._loadOrg = true;
      return cliUtil.executeRun(run)(opts);
    });
};
