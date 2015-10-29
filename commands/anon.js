var user     = require('../lib/user');
var logger   = require('../lib/logger');
var fs       = require('../lib/fs');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');

function loadFile(filePath) {
  return fs.existsAsync(filePath)
    .then(function(exists) {
      if(!exists) {
        return throw new Error('file does not exist: ' + filePath);
      }
      return fs.readFileAsync(filePath, { encoding: 'utf8' });
    }).then(function(file) {
      if(!file) {
        throw new Error('file contents empty');
      }
      return file;
    });
}

var run = module.exports.run = function(opts, cb) {

  if(!opts.code && !opts.file) {
    return cb(new Error('You must provide apex code or a file to execute'));
  }

  if(opts.code && opts.file) {
    return cb(new Error('You cannot provide code and a file at the same time'));
  }

  return Promise.resolve()

  .then(function() {
    if()
  })

  cb();
};

module.exports.cli = function(program) {
  program.command('anon [code]')
    .description('execute anonymous apex [code]')
    .option('-o, --org <org>', 'the Salesforce organization to use')
    .option('-f, --file <file>', 'specify a file that contains apex code')
    .action(function(code, opts) {
      opts.code = code;
      opts._loadOrg = true;
      return cliUtil.executeRun(run)(opts);
    });
};
