var fs       = require('fs-extra');
var user     = require('../lib/user');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');
var index    = require('../lib/index');
var metaMap  = require('../lib/metadata-map');
var getFiles = require('../lib/get-files');
var Promise  = require('bluebird');
var path     = require('path');
var async    = require('async');
var _        = require('lodash');
var archiver = require('archiver');
var logger   = require('../lib/logger');
var hl       = logger.highlight;

function createStubFiles(map, client) {
  var keys = map.index.getMemberTypeNames();

  function iterator(obj, cb) {
    obj.oauth = map.oauth;
    logger.create(obj.type + '::' + hl(obj.object.name));
    client.tooling.insert(obj, function(err, res) {
      if(err) return cb(err);
      map.setMetaId(obj.type, obj.object.name, res.id);
      cb(null, res.id);
    });
  }

  return new Promise(function(resolve, reject) {

    var stubs = [];

    _.each(keys, function(k) {
      _(map.meta[k])
        .filter(function(o) {
          return (!o.id || o.id === null || o.id === '');
        })
        .each(function(o) {
          stubs.push(metaMap.getStub(k, o.name, o.object));
        })
        .value();
    });

    if(!stubs || !stubs.length) return resolve([]);

    async.mapLimit(stubs, 5, iterator, function(err, results) {
      if(err) {
        logger.error(err.message);
        return reject(new Error('unable to create stub files'));
      } else {
        return resolve(results);
      }
    });

  });
}

function createStaticResources(map, oauth, client) {

  function iterator(obj, cb) {
    fs.readFile(obj.path, { encoding: 'base64' }, function(err, body) {
      if(err) return cb(err);

      var opts = {
        id: obj.id,
        oauth: oauth,
        type: 'StaticResource',
        object: {
          name: obj.name,
          contenttype: 'application/zip', // hard-coding this for now
          body: body
        }
      };

      var method = (obj.id) ? 'update' : 'insert';

      logger.log('executing StaticResource ' + method);

      client.tooling[method](opts, function(err, res) {
        if(err) return cb(err);
        logger[(method === 'insert') ? 'create' : 'update']('StaticResource::' + obj.name);
        cb(null, res);
      });

    });
  }

  return new Promise(function(resolve, reject) {
    async.mapLimit(map.meta.StaticResource, 5, iterator, function(err, srs) {
      if(err) {
        logger.error('StaticResource deploy error');
        return reject(err);
      }
      resolve(srs);
    });
  });
}


function createContainer(oauth, client) {
  logger.log('creating container');
  var name = 'dmc:' + (new Date()).getTime();

  return new Promise(function(resolve, reject) {

    client.tooling.createContainer({ name: name, oauth: oauth }, function(err, container) {
      if(err) return reject(err);
      logger.create('metadata container: ' + hl(container.id));
      resolve(container.id);
    });

  });
}

function createDeployArtifacts(map, containerId, oauth, client) {

  var iterator = function(m, cb2) {
    if(map.index.getMemberTypeNames().indexOf(m.type) === -1) {
      return cb2(null);
    }

    fs.readFile(m.path, { encoding: 'utf8' }, function(err, data) {
      if(err) return cb2(err);

      var artifact = client.tooling.createDeployArtifact(m.type + 'Member', {
        body: data,
        contentEntityId: m.id
      });

      if(!artifact) {
        return cb2(new Error('couldn\'t create artifact: ' + m.name));
      }

      var opts = {
        id: containerId,
        artifact: artifact,
        oauth: oauth
      };

      client.tooling.addContainerArtifact(opts, function(err, resp) {
        if(err) {
          logger.error('problem creating container artifact');
          return cb2(err);
        }
        logger.create('container member: ' + m.type + '::' + m.name);
        return cb2(null, resp);
      });

    });
  };

  //console.log(files);

  return new Promise(function(resolve, reject) {

    var files = _(map.meta)
      .values()
      .flatten()
      .remove(function(m) {
        return (m.id && m.id !== '');
      })
      .value();

    async.mapLimit(files, 5, iterator, function(err, res) {
      if(err) reject(err);
      else resolve(res);
    });

  });

}

function deployContainer(containerId, oauth, client) {

  return new Promise(function(resolve, reject) {

    var asyncContainerId;

    var opts = {
      id:          containerId,
      isCheckOnly: false,
      oauth:       oauth
    };

    function logStatus(status) {
      logger.list('deploy status: ' + status);
    }

    function poll() {

      var pollOpts = {
        id: asyncContainerId,
        oauth: opts.oauth
      };

      client.tooling.getContainerDeployStatus(pollOpts, function(err, resp) {

        if(err) return reject(err);

        logStatus(resp.State);

        if(resp.State === 'Completed') {
          logger.log('deployment successful');
          return resolve(resp);
        } else if(resp.State === 'Failed') {
          logger.error('CompilerErrors');
          console.log(resp);
          _.each(resp.CompilerErrors, function(e) {
            logger.error('=> ' + e.extent[0] + ': ' + e.name[0]);
            logger.error('   Line ' + e.line[0] + ' - ' + e.problem[0]);
          });
          return reject(new Error('Compiler Errors'));
        } else if(resp.State === 'Errored') {
          logger.error('Compile error:');
          logger.error(res.ErrorMsg);
          return reject(new Error(res.ErrorMsg));
        } else {
          setTimeout(function() {
            poll();
          }, 1000);
        }
      });
    }

    client.tooling.deployContainer(opts, function(err, asyncContainer) {
      if(err) return cb(err);
      logger.log('Deploying...');
      asyncContainerId = asyncContainer.id;
      poll();
    });

  });

}

function deleteContainer(containerId, oauth, client) {
  var opts = {
    type: 'MetadataContainer',
    id: containerId,
    oauth: oauth
  };

  return new Promise(function(resolve, reject) {
    client.tooling.delete(opts, function(err, res) {
      if(err) return reject(err);
      logger.destroy('metadata container: ' + hl(containerId));
      resolve(containerId);
    });
  });
}

function runToolingDeploy(map, oauth, client) {
  var containerId;

  return Promise.resolve()

    .then(function() {
      logger.log('loading related metadata ids');
      return map.fetchIds().then(function(results) {
        logger.log('loaded ' + hl(results.length) + ' ids');
      });
    })

    // create stub files if necessary
    .then(function() {
      logger.log('creating stub files');
      return createStubFiles(map, client).then(function(stubs) {
        logger.log('created ' + hl(stubs.length) + ' stub files');
      });
    })

    // create static resources
    .then(function() {
      logger.log('creating static resources');
      return createStaticResources(map, oauth, client).then(function(srs) {
        logger.log('deployed ' + hl(srs.length) + ' static resources');
      });
    })

    .then(function(){
      return createContainer(oauth, client);
    })

    .then(function(id) {
      containerId = id;
      return createDeployArtifacts(map, containerId, oauth, client);
    })

    .then(function(){
      return deployContainer(containerId, oauth, client);
    })

    .finally(function() {
      if(containerId) {
        return deleteContainer(containerId, oauth, client);
      }
    });

}

function logDetails(res) {
  if(!res.details) return;

  var cType;
  var method;

  if(res.details.componentSuccesses) {

    logger.success('component successes [' + res.details.componentSuccesses.length + '] ====>');

    _(res.details.componentSuccesses)
      .map(function(e) {
        e.cType = _.isString(e.componentType) ?
          (e.componentType + ': ') :
          '';

        e.method =
          (e.created) ? 'create'  :
          (e.changed) ? 'update'  :
          (e.deleted) ? 'destroy' :
          'noChange';

        return e;
      })
      .sortBy(function(e) {
        return e.cType + e.fullName;
      })
      .each(function(e) {
        logger[e.method](e.cType + e.fullName);
      })
      .value();
  }

  if(res.details.componentFailures) {
    logger.error('component failures [' + res.details.componentFailures.length + '] ====>');

    _(res.details.componentFailures)
      .map(function(e) {
        e.cType = _.isString(e.componentType) ?
          (e.componentType + ': ') :
          '';

        return e;
      })
      .sortBy(function(e) {
        return e.cType + e.fullName;
      })
      .each(function(e) {
        logger.listError(
          '[' + e.cType + e.fullName + '] ' +
          e.problemType + ' at ' +
          'l:' + (e.lineNumber || '0') + '/' +
          'c:' + (e.columnNumber || '0') + ' '  +
          '=> ' +
          e.problem
        );
      })
      .value();
  }

  if(res.details.runTestResult) {
    if(res.details.runTestResult.numFailures) {
      logger.error('test results ====>');
    } else {
      logger.success('test results ====>');
    }
    logger.list('tests run: ' + res.details.runTestResult.numTestsRun);
    logger.list('failures: ' + res.details.runTestResult.numFailures);
    logger.list('total time: ' + res.details.runTestResult.totalTime);

    _.each(res.details.runTestResult.failures, function (f) {
      logger.error(f);
    });
  }
}

function runMetadataDeploy(map, oauth, client) {
  logger.log('running metadata deploy');

  return new Promise(function(resolve, reject) {
    var archive = archiver('zip');

    var promise = client.meta.deployAndPoll({
      zipFile: archive,
      oauth: oauth,
      includeDetails: true,
      deployOptions: {
        rollbackOnError: true
      }
    });

    // write the package.xml to the zip
    archive.append(
      new Buffer(map.createPackageXML(client.apiVersion)
    ), { name: 'src/package.xml' });

    promise.poller.on('poll', function(res) {
      logger.log('deploy status: ' + hl(res.status));
    });

    promise.then(function(results){
      logDetails(results);
      resolve();
    }).catch(function(err) {
      console.error(err);
      if(err.details) {
        logDetails(err);
      } else {
        logger.error(err.message);
      }
      reject(new Error('metatadata api deployment failed'));
    });

    // iterator for adding files
    // checks for existence and adds
    function iterator(p, cb) {
      fs.existsAsync(p).then(function(exists) {
        if(exists) {
          logger.list(p);
          // add the file to the zip
          archive.file(p);
        } else {
          logger.error('missing file: ' + p);
        }
        return cb(null, {
          file: p,
          exists: exists
        });
      });
    }

    logger.log('adding metadata');

    // map over files to add and add if they exist
    async.mapLimit(map.getFilePathsForDeploy(), 5, iterator, function(err, res) {
      if(err) {
        reject(err);
      } else {
        var hasErrors = false;

        _.each(res, function(r) {
          if(!r.exists) {
            logger.error('missing file: ' + r.file);
            hasErrors = true;
            return;
          }
        });

        if(hasErrors) {
          return reject(new Error('cannot deploy - missing files'));
        }

        logger.log('starting deploy');
        archive.finalize();
      }
    });

  });
}

var run = module.exports.run = function(opts, cb) {

  var containerId;
  var client;
  var oauth = opts.oauth;
  var globs = opts.globs;

  var map = metaMap.createMap({
    oauth: opts.oauth,
    org:   opts.org
  });

  return Promise.resolve()

  .then(function(){
    return sfClient.getClient(opts.oauth);
  })

  // load the index for the org
  .then(function(sfdcClient) {
    client = sfdcClient;
    return map.autoLoad();
  })

  // search src/ for file matches
  .then(function() {
    logger.log('searching for local metadata');
    return getFiles({ globs: globs }).then(function(files) {

      if(!files.length) throw new Error('no files for deployment found');

      logger.log('deploying ' + hl(files.length) + ' metadata files');
      map.addFiles(files);
    });
  })

  .then(function() {

    if(!map.requiresMetadataDeploy() && !opts.meta) {
      return runToolingDeploy(map, oauth, client);
    } else {
      return runMetadataDeploy(map, oauth, client);
    }
  })

  .catch(function(err) {
    cb(err);
  });

};

module.exports.cli = function(program) {
  program.command('deploy [globs...]')
    .description('deploy metadata to target org')
    .option('-o, --org <org>', 'the Salesforce organization to use')
    .option('--meta', 'force deploy with metadata api')
    .action(function(globs, opts) {
      opts.globs = globs;
      opts._loadOrg = true;
      return cliUtil.executeRun(run)(opts);
    });
};
