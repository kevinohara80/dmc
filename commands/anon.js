var Promise  = require('bluebird');
var user     = require('../lib/user');
var logger   = require('../lib/logger');
var fs       = require('../lib/fs');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');
var resolve  = require('../lib/resolve');

function loadFile(filePath) {
  return fs.existsAsync(filePath)
    .then(function(exists) {
      if(!exists) {
        throw new Error('file does not exist: ' + filePath);
      }
      return fs.readFileAsync(filePath, { encoding: 'utf8' });
    }).then(function(file) {
      if(!file) {
        throw new Error('file contents empty');
      }
      return file;
    });
}

function validateOpts(opts) {
  if(!opts.code && !opts.file) {
    throw new Error('You must provide apex code or a file to execute');
  }

  if(opts.code && opts.file) {
    throw new Error('You cannot provide code and a file at the same time');
  }
}

var run = module.exports.run = function(opts, cb) {

  return resolve(cb, function(){
    var client;

    validateOpts(opts);

    return sfClient.getClient(opts.oauth)

    .then(function(c) {
      client = c;
    })

    .then(function() {
      if(opts.file) {
        return loadFile(opts.file);
      } else {
        return opts.code;
      }
    })

    .then(function(code) {
      logger.log('executing anonymous code');

      return client.tooling.executeAnonymous({
        oauth: opts.oauth,
        code: code
      });
    })

    .then(function(res) {

      if(res.success) {
        logger.log('execution: ' + 'success'.highlight);
      } else {
        logger.error('execution: failed');
      }

      if(res.compiled) {
        logger.log('compiled: ' + res.compiled);
      } else {
        logger.error('compiled: ' + res.compiled);
      }

      if(!res.success) {

        if(res.compileProblem) {
          logger.error('compile problem: ' + res.compileProblem);
        }
        if(res.exceptionMessage) {
          logger.error('exception: ' + res.exceptionMessage);
        }
        if(res.exceptionStackTrace) {
          logger.error('exception stack: ' + res.exceptionStackTrace);
        }
        throw new Error('execute anonymous failed');
      }
    });

  });

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
