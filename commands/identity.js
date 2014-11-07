var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');
var _        = require('lodash');


function flatten(obj, fields, pre) {
  _.forIn(obj, function(v, k) {
    if(pre) k = pre + '.' + k;
    if(_.isObject(v)) {
      flatten(v, fields, k);
    } else if(!fields || !fields.length || fields.indexOf(k) !== -1) {
      logger.list(k + ': ' + v);
    }
  });
}

var run = module.exports.run = function(org, opts, cb) {
  var oauth = user.getCredential(org);

  sfClient.getIdentity({ oauth: oauth }, function(err, res){
    if(err) return cb(err);
    if(opts.fields) opts.fields = opts.fields.split(',');
    flatten(res, opts.fields);
    cb();
  });
};

module.exports.cli = function(program) {
  program.command('identity <org>')
    .description('show the identity for target <org>')
    .option('-f, --fields <fields>', 'Comma-separated fields to show. Use dot notation')
    .action(function(org, opts) {
      cliUtil.checkForOrg(org);
      run(org, opts, cliUtil.callback);
    });
};
