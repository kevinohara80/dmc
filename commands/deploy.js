var fs       = require('fs-extra');
var user     = require('../lib/user');
var index    = require('../lib/index');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');
var meta     = require('../lib/metadata');
var path     = require('path');
var glob     = require('glob');
var async    = require('async');
var _        = require('lodash');
var logger   = require('../lib/logger');
var hl       = logger.highlight;

function getFiles(map, globs, cb) {
  var iterator = function(g, cb2) {
    glob(g, {}, cb2);
  };
  async.concat(globs, iterator, function(err, files) {
    if(err) return cb(err);
    if(!files.length) return cb(new Error('no files found'));
    files = _.uniq(files);
    logger.log('deploying ' + hl(files.length) + ' metadata files');
    map.addFiles(_.uniq(files));
    cb();
  });
}

function queryForIds(map, oauth, cb) {

  logger.log('indexing org metadata');

  function iterator(type, cb2) {

    if(!map.meta[type] || !map.meta[type].length) {
      return cb2();
    }

    var fileNames = _(map.meta[type])
      .pluck('name')
      .map(function(n) {
        return '\'' + n + '\'';
      })
      .value()
      .join(', ');

    var query = 'SELECT Id, Name FROM ' + type;
    query += ' WHERE Name IN (' + fileNames + ')';

    sfClient.query({ query: query, oauth: oauth }, function(err, res) {
      if(err) return cb(err);
      if(res.records) {
        _.each(res.records, function(r) {
          map.setMetaId(type, r.get('name'), r.getId());
        });
      }
      cb2();
    });
  }

  async.each(Object.keys(map.meta), iterator, function(err) {
    if(err) return cb(err);
    cb();
  });
}

function createStubFiles(map, oauth, cb) {
  var keys = Object.keys(map.meta);

  function iterator(obj, cb2) {
    obj.oauth = oauth;
    logger.create(obj.type + '::' + hl(obj.object.name));
    sfClient.tooling.insert(obj, function(err, res) {
      if(err) return cb2(err);
      map.setMetaId(obj.type, obj.name, res.id);
      cb2();
    });
  }

  var stubs = [];

  _.each(keys, function(k) {
    _(map.meta[k])
      .where(function(o) {
        return (!o.id || o.id === null || o.id === '');
      })
      .each(function(o) {
        stubs.push(meta.getStub(k, o.name, o.object));
      });
  });

  if(!stubs || !stubs.length) return cb();

  async.each(stubs, iterator, function(err) {
    if(err) {
      logger.error('stub file creation failed');
    } else {
      return cb(null);
    }
  });

}

function createContainer(oauth, cb) {
  logger.log('creating container')
  var name = 'dmc:' + (new Date()).getTime();
  sfClient.tooling.createContainer({ name: name, oauth: oauth }, function(err, container) {
    if(err) return cb(err);
    logger.create('metadata container: ' + hl(container.id));
    cb(null, container.id);
  });
}

function createMetadata(map, containerId, oauth, cb) {

  logger.log('creating container members');

  var types = [
    'ApexClass',
    'ApexComponent',
    'ApexTrigger',
    'ApexPage'
  ];

  var iterator = function(meta, cb2) {
    if(types.indexOf(meta.type) === -1) {
      logger.log('skipping: ' + meta.name);
      return cb(null);
    }

    fs.readFile(meta.path, { encoding: 'utf8' }, function(err, data) {
      if(err) return cb2(err);

      console.log(data);

      var artifact = sfClient.tooling.createDeployArtifact(meta.type + 'Member', {
        body: data,
        contentEntityId: meta.id
      });

      if(!artifact) {
        return cb2(new Error('couldn\'t create artifact: ' + meta.name));
      }

      var opts = {
        id: containerId,
        artifact: artifact,
        oauth: oauth
      };

      sfClient.tooling.addContainerArtifact(opts, function(err, resp) {
        if(err) {
          logger.error('problem creating container artifact');
          return cb2(err);
        }
        logger.create('container member: ' + meta.type + '::' + meta.name);
        return cb2(null, resp);
      });

    });
  }

  // _.map(map.meta, function(val, key) {
  //   logger.list(key + ' ' + val.length);
  // });

  var files = _(map.meta)
    .values()
    .flatten()
    .remove(function(m) {
      return (m.id && m.id !== '')
    })
    .value();

  //console.log(files);

  async.map(files, iterator, cb);

}

function deployContainer(containerId, oauth, cb) {

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
        var cerrs = JSON.parse(resp.CompilerErrors);
        _.each(cerrs, function(e) {
          logger.error('=> ' + e.extent[0] + ': ' + e.name[0]);
          logger.error('    Line ' + e.line[0] + ' - ' + e.problem[0]);
        });
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

function deleteContainer(containerId, oauth, cb) {
  logger.log('deleting container');
  var opts = {
    type: 'MetadataContainer',
    id: containerId,
    oauth: oauth
  };
  sfClient.tooling.delete(opts, function(err, res) {
    if(err) return cb(err);
    logger.destroy('metadata container: ' + hl(containerId));
    cb(null, containerId);
  });
}

var run = module.exports.run = function(org, globs, opts, cb) {

  var containerId;
  var oauth = user.getCredential(org);

  var map = meta.createMap();

  async.series([
    function(cb2) {
      getFiles(map, globs, cb2);
    },
    function(cb2) {
      queryForIds(map, oauth, cb2);
    },
    function(cb2) {
      createStubFiles(map, oauth, cb2);
    },
    function(cb2) {
      createContainer(oauth, function(err, cid) {
        if(err) return cb2(err);
        containerId = cid;
        cb2();
      });
    },
    function(cb2) {
      createMetadata(map, containerId, oauth, cb2);
    },
    function(cb2) {
      deleteContainer(containerId, oauth, cb2);
    }
    /*function(cb2) {
      index.getIndex(org, function(err, i) {
        if(err) return cb2(err);
        idx = i;
        //console.log(i);
        cb2();
      });
    },
    function(cb2) {
      getFiles(globs, function(err, resp) {
        if(err) return cb2(err);
        files = resp;
        console.log('files');
        console.log(files);
        cb2();
      });
    },
    function(cb2) {
      _.each(files, function(f) {
        var ext = path.extname(f);
        if(ext === '.cls') {
          var mname = path.basename(f, ext);
          console.log('mname: ' + mname);
          fileMap['ApexClass'][mname] = idx.findMetaByName('ApexClass', mname);
        }
      });
      cb2();
    },
    function(cb2) {
      createContainer(data, function(err, cid) {
        if(err) return cb2(err);
        containerId = cid;
        cb2();
      });
    },
    function(cb2) {
      createMetadata(containerId, files, data.oauth, function(err, resp){
        if(err) return cb2(err);
        cb2();
      });
    }
    // createContainer,
    // createMetadata,
    // deployContainer,
    // deleteContainer*/
  ], function(err, result) {
    if(err) {
      if(!containerId) return cb(err);
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
};

module.exports.cli = function(program) {
  program.command('deploy <org> [meta...]')
    .description('deploy metadata to target <org>')
    .action(function(org, globs, opts) {
      cliUtil.checkForOrg(org);
      run(org, globs, opts, cliUtil.callback);
    });
};
