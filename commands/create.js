var fs       = require('fs-extra');
var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');

function insertMetadata(data, cb) {
  sfClient.tooling.insert(data, function(err, resp) {
    if(err) return cb(err);
    console.log(resp);
    if(data.type === 'ApexClass') {
      var file = process.cwd() + '/src/classes/' + data.object.name + '.cls';
      logger.log('writing local file: ' + file);
      fs.writeFileSync(file, data.object.body);
    }
    cb(null, resp);
  });
}

function createClass(name, oauth, cb) {
  logger.log('Creating new ApexClass');
  var data = {
    type: 'ApexClass',
    oauth: oauth,
    object: {
      name: name,
      body: 'public class ' + name + ' {\n\n}'
    }
  };
  return insertMetadata(data, cb);
}

var run = module.exports.run = function(org, type, name, opts, cb) {
  var oauth = user.getCredential(org);
  //var index = user.getIndex(org);
  logger.log('running index on org: ' + org);

  if(type === 'class') {
    return createClass(name, oauth, cb);
  }
};

module.exports.cli = function(program) {
  program.command('create <org> <type> <name>')
    .description('create metadata of <type> with <name> in target <org>')
    .action(function(org, type, name, opts) {
      cliUtil.checkForOrg(org);
      run(org, type, name, opts, cliUtil.callback);
    });
};
