var Promise    = require('bluebird');
var user       = require('../lib/user');
var logger     = require('../lib/logger');
var fs         = require('../lib/fs');
var cliUtil    = require('../lib/cli-util');
var sfClient   = require('../lib/sf-client');
var resolve    = require('../lib/resolve');
var Handlebars = require('handlebars');

// not enabling this right now
// Handlebars.registerHelper('default', function(value, defaultValue) {
//   var out = value || defaultValue || '';
//   return new Handlebars.SafeString(out);
// });

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

  if(opts.arg && opts.arg._errors && opts.arg._errors.length > 0) {
    throw new Error('Invalid argument(s): ' + opts.arg._errors.join(', '));
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
      return Handlebars.compile(code);
    })

    .then(function(template) {
      logger.log('executing anonymous code');
      return client.tooling.executeAnonymous({
        oauth: opts.oauth,
        code: template(opts.arg || {})
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

var collect = function(val, memo) {
  var parsedVal = val.split('=');
  if(parsedVal.length != 2) {
    if(!memo._errors) memo._errors = [];
    memo._errors.push(val);
    return memo;
  }
  var value = parsedVal[1].split(',');
  memo[parsedVal[0]] = (value.length > 1) ? value : value[0]; 
  return memo;
};

module.exports.cli = function(program) {
  program.command('anon [code]')
    .description('execute anonymous apex [code]')
    .option('-o, --org <org>', 'the Salesforce organization to use')
    .option('-f, --file <file>', 'specify a file that contains apex code')
    .option('-a, --arg <arg>', 'specify one or more arguments to merge to the script.', collect, {})
    .action(function(code, opts) {
      opts.code = code;
      opts._loadOrg = true;
      return cliUtil.executeRun(run)(opts);
    })
    .on('--help', function() {
      console.log('  Examples:');
      console.log();
      console.log('    # inline apex code');
      console.log('    $ dmc anon "System.debug(\'hello world\');"');
      console.log();
      console.log('    # apex code in a file');
      console.log('    $ dmc anon -f myscript.apex');
      console.log();
      console.log('    # merge arguments using handlebars syntax in file');
      console.log('    $ dmc anon -f myscript.apex -a mode=test -a myarray=foo,bar,baz');
      console.log();
    });
};
