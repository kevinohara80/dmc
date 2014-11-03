var fs       = require('fs-extra');
var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');
var glob     = require('glob');
var async    = require('async');
var _        = require('lodash');

function getFiles(data, cb) {
  var iterator = function(g, cb2) {
    glob(g, {}, cb2);
  };
  async.concat(data.globs, iterator, function(err, files) {
    if(err) return cb(err);
    if(!files.length) return cb(new Error('no files found'));
    data.files = _.uniq(files);
    cb(err, data);
  });
}

function createContainer(data, cb) {
  logger.log('creating metadata container')
  var name = (new Date()).getTime();
  sfClient.tooling.createContainer({ name: name, oauth: data.org }, function(err, container) {
    if(err) return cb(err);
    logger.log('metadata container created: ' + container.id);
    data.containerId = container.id;
    cb(null, data);
  });
}

function deleteContainer(data, cb) {
  logger.log('deleting metadata container: ' + data.containerId);

  var opts = {
    type: 'MetadataContainer',
    id: data.containerId,
    oauth: data.org
  };

  sfClient.tooling.delete(opts, function(err, resp) {
    if(err) return cb(err);
    cb(null, data);
  });
}

function deployContainer(data, cb) {

  var asyncContainerId;

  var opts = {
    id: data.containerId,
    isCheckOnly: false,
    oauth: data.org
  }

  function logStatus(status) {
    logger.log('=> deploy status: ' + status);
  }

  function poll() {

    var pollOpts = {
      id: asyncContainerId,
      oauth: opts.oauth
    };

    sfClient.tooling.getContainerDeployStatus(pollOpts, function(err, resp) {

      if(err) return cb(err, resp);

      logStatus(resp.State);

      if(resp.State === 'Completed') {
        logger.log('deployment successful');
        return cb(null, data);
      } else if(resp.State === 'Failed') {
        logger.error('CompilerErrors');
        console.log(resp.CompilerErrors);
        cb(new Error('Compiler Errors'))
      } else if(resp.State === 'Errored') {
        logger.error('Compile error:');
        logger.error(res.ErrorMsg);
        cb(new Error(res.ErrorMsg));
      } else {
        setTimeout(function() {
          poll();
        }, 1000);
      }
    });
  }

  sfClient.tooling.deployContainer(opts, function(err, asyncContainer) {
    logger.log('Deploying...');
    asyncContainerId = asyncContainer.id;
    poll();
  });
}

function createMetadata(data, cb) {
  var body = fs.readFileSync(process.cwd() + '/' + data.files[0], 'utf8');

  var artifact = sfClient.tooling.createDeployArtifact('ApexClassMember', {
    body: fs.readFileSync(data.files[0], 'utf8'),
    contentEntityId: '01pd0000002hG4oAAE'
  });

  logger.log('using container -> ' + data.containerId);
  logger.log('uploading -> ' + data.files[0]);

  var opts = {
    id: data.containerId,
    artifact: artifact,
    oauth: data.org
  };

  sfClient.tooling.addContainerArtifact(opts, function(err, resp) {
    if(err) {
      logger.error('problem creating container artifact')
      return cb(err);
    }
    return cb(null, data);
  });
}

var run = module.exports.run = function(org, globs, opts, cb) {

  var data = {
    globs: globs,
    org: user.getCredential(org)
  }

  async.waterfall([
    function(cb2) {
      getFiles(data, cb2)
    },
    createContainer,
    createMetadata,
    deployContainer,
    deleteContainer
  ], function(err, result) {
    if(err) {
      return deleteContainer(data, function(err2) {
        if(err2) {
          logger.error('unable to delete metadata container');
          logger.error(err2.message);
        }
        cb(err);
      });
    }
    cb(null, result);
  });
}

module.exports.cli = function(program) {
  program.command('deploy <org> [meta...]')
    .description('deploy metadata to target <org>')
    .action(function(org, globs, opts) {
      cliUtil.checkForOrg(org);
      run(org, globs, opts, cliUtil.callback);
    });
};
