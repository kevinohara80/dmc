var fs        = require('fs-extra');
var Promise   = require('bluebird');
var cliUtil   = require('../lib/cli-util');
var sfClient  = require('../lib/sf-client');
var logger    = require('../lib/logger');
var matching  = require('../lib/matching');
var dmcignore = require('../lib/dmcignore');
var _         = require('lodash');
var Spinner   = require('cli-spinner').Spinner;
var green     = logger.green;

var matchOpts = { matchBase: true };

function loadTestClasses(client, opts) {

  return new Promise(function(resolve, reject) {
    var nsArg = (opts.ns) ? 
      '\'' + opts.ns + '\'' : 'null';

    var query = [
      'SELECT Id, Name, SymbolTable',
      'FROM ApexClass',
      (opts.all) ? '' : 'WHERE NamespacePrefix = ' + nsArg,
      'ORDER BY Name'
    ].join(' ');

    client.tooling.query({ q: query }, function(err, res) {
      if(err) return reject(err);
      logger.log('processing ' + res.records.length + ' records');
      var tests = _(res.records)
        .map(function(r) {
          var rec = { 
            Name: r.Name, 
            Id: r.Id,
            isTest: false,
            filePath: 'src/classes/' + r.Name + '.cls',
            testMethods: []
          };

          var td = r.SymbolTable.tableDeclaration;
          var methods = r.SymbolTable.methods;

          if(_.includes(td.modifiers, 'testMethod')) {
            rec.isTest = true;
          }

          rec.testMethods = _(methods)
            .filter(function(m) {
              return _.includes(m.modifiers, 'testMethod');
            })
            .map(function(m) {
              return m.name;
            })
            .value();

          return rec;
        })
        .filter(function(r) {
          return r.isTest;
        })
        .filter(function(r) {
          // this where we will match on globs
          return true;
        })
        .value();
      return resolve(tests);
    });
  });
}

function runTests(client, tests, opts) {

  return new Promise(function(resolve, reject) {

    var testIds = _.pluck(tests, 'Id');

    var spin = new Spinner('running tests... %s');
    spin.setSpinnerString(19);

    function poll(jobId, cb) {
      //logger.info('polling...');
      client.tooling.getAsyncTestStatus({ id: jobId }, function(err, res) {
        if(err) return cb(err);

        var allComplete = _.every(res.records, function(r) {
          return r.Status === 'Completed';
        });

        if(allComplete) {
          var queueItemIds = _.map(res.records, function(r) {
            return r.Id;
          });
          return cb(null, queueItemIds);
        }

        setTimeout(function() {
          return poll(jobId, cb);
        }, 2000);
        
      });
    }

    function getResults(queueIds, cb) {
      client.tooling.getAsyncTestResults({ ids: queueIds }, cb);
    }

    client.tooling.runTestsAsyncPost({ ids: testIds.join(',') }, function(err, res) {
      if(err) return reject(err);
      spin.start();
      var jobId = res;

      poll(jobId, function(err, queueIds) {
        spin.setSpinnerTitle('fetching results... %s');
        return getResults(queueIds, function(err, results) {
          spin.stop(true);
          if(err) return reject(err);
          resolve(results);
        });
      });
    });

  });
}

var run = module.exports.run = function(opts, cb) {
  
  var client, ignores;

  // default to all classes
  if(!opts.globs || !opts.globs.length) {
    opts.globs = [ 'src/classes/*' ];
  }

  Promise.resolve()
  
  .then(function() {
    return dmcignore.load().then(function(lines) {
      ignores = lines;
    });
  })

  .then(function(){
    return sfClient.getClient(opts.oauth);
  })
  
  .then(function(c){
    client = c;
    return loadTestClasses(client, opts);
  })
  
  .then(function(tests) {
    return matching.filterOnGlobs(tests, opts.globs, ignores);
  })

  .then(function(matchedTests) {

    _.each(matchedTests, function(t) {
      logger.list(t.filePath);
    })

    if(!matchedTests.length) {
      logger.info('no tests found that match');
      return;
    }
    
    return runTests(client, matchedTests, opts)
      .then(function(tests) {
        var hasFailures = false;
        var currentClass = null;
        _.each(tests.records, function(t) {
          if(!currentClass || currentClass != t.ApexClass.Name) {
            currentClass = t.ApexClass.Name;
            logger.log('===> ' + t.ApexClass.Name + ' test results <===');
          }
          if(t.Outcome === 'Fail') {
            hasFailures = true;
            logger.error('[fail] ' + t.ApexClass.Name + ':' + t.MethodName + ' => ' + t.Message + ' => ' +t.StackTrace);
          } else {
            logger.info(green('[pass] ') + t.ApexClass.Name + ':' + t.MethodName);
          }
        });

        return hasFailures
      });
  })

  .then(function(hasFailures){
    if(hasFailures) {
      return cb(new Error('Failed -> test failures'));
    }
    cb();
  })
  
  .catch(function(err) {
    logger.error(err.message);
    cb(err);
  });

};

module.exports.cli = function(program) {
  program.command('test [globs...]')
    .description('run test classes')
    .option('-o, --org <org>', 'the Salesforce organization to use')
    .option('-a, --all', 'run all test classes including namespaced metadata')
    .option('-n, --ns <ns>', 'run tests in a specific namespace')
    .option('--coverage', 'show code coverage for tests run')
    .action(function(globs, opts) {
      opts.globs = globs;
      opts._loadOrg = true;
      return cliUtil.executeRun(run)(opts);
    });
};
