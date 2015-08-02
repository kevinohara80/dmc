var _        = require('lodash');
var user     = require('../lib/user');
var index    = require('../lib/index');
var logger   = require('../lib/logger');
var paths    = require('../lib/paths');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');
var fs       = require('../lib/fs');

var run = module.exports.run = function(opts, cb) {
  logger.log('indexing org: ' + opts.org);

  var idx = index.init(opts.org, opts.oauth);

  logger.log('fetching index data');
  idx.fetch().then(function() {
    logger.log('saving index');
    return idx.save();
  }).then(function() {
    cb();
  }).catch(function(err) {
    cb(err);
  });
};

module.exports.cli = function(program) {
  program.command('index [org]')
    .description('indexes metadata for a target org')
    .option('-a, --all', 'index all current orgs')
    .action(function(org, opts) {
      opts.org = org;
      opts._loadOrg = true;
      return cliUtil.executeRun(run)(opts);
    });
};
