var user      = require('../lib/user');
var _         = require('lodash');
var logger    = require('../lib/logger');
var cliUtil   = require('../lib/cli-util');
var sfClient  = require('../lib/sf-client');
var metadata  = require('../lib/metadata');
var async     = require('async');
var Promise   = require('bluebird');
var minimatch = require('minimatch');

function getFilePaths(globs, oauth) {
  return new Promise(function(resolve, reject) {


    async.mapLimit(typeGroups, 5, iterator, function(err, res) {
      if(err) return reject(err);
    });
  });
}

var run = module.exports.run = function(opts, cb) {

  var typeMatches = metadata.getTypesFromGlobs(opts.globs);

  // log out the matched directories
  _.each(typeMatches, function(tm) {
    logger.list(tm.folder);
  });

  // group the metadata into groups of 3 since that's the limit
  // in a single listMetadata call
  var grouped = _.reduce(typeMatches, function(result, tm) {
    if(!result.length || result[result.length-1].length === 3) {
      result.push([tm.name]);
    } else {
      result[result.length-1].push(tm.name);
    }
    return result;
  }, []);

  console.log(grouped);
  process.exit(1);

  sfClient.meta.listMetadata({
    oauth: opts.oauth,
    queries: _.map(typeMatches, function(t) {
      return {
        type: t.name
      };
    })
  }).then(function(res) {
    console.log(res);
    cb();
  }).catch(function(err) {
    console.error(err.root);
    cb(err);
  });

};

module.exports.cli = function(program) {
  program.command('retrieve [globs...]')
    .description('retrieve metadata from target org')
    .option('-o, --org <org>', 'the Salesforce organization to use')
    .option('--meta', 'force retrieve with metadata api')
    .action(function(globs, opts) {
      opts.globs = globs;
      return cliUtil.executeRun(run)(opts);
    });
};
