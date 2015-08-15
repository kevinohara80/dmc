var user      = require('../lib/user');
var _         = require('lodash');
var logger    = require('../lib/logger');
var cliUtil   = require('../lib/cli-util');
var sfClient  = require('../lib/sf-client');
var index     = require('../lib/index');
var metaMap   = require('../lib/metadata-map');
var async     = require('async');
var Promise   = require('bluebird');
var minimatch = require('minimatch');
var paths     = require('../lib/paths');
var fs        = require('../lib/fs');
var glob      = require('glob');
var AdmZip    = require('adm-zip');
var rimraf    = require('rimraf');

var matchOpts = { matchBase: true };

function getFilePaths(typeGroups, oauth, client) {
  return new Promise(function(resolve, reject) {

    var iterator = function(types, cb) {
      client.meta.listMetadata({
        queries: _.map(types, function(t) {
          return {
            type: t.name
          };
        })
      }).then(function(res) {
        if(!res || !res.length) {
          return cb(null, null);
        }

        // create a regex to test for incompatible fileNames
        // returned from salesforce. See comments below...
        var re = new RegExp('^(' + _.pluck(types, 'name').join('|') + ')\\/');

        var filePaths = _(res)
          .flattenDeep()
          .map(function(md) {
            // sometimes salesforce responds with a weird
            // filename like Workflow/My_Object.object when
            // all other workflows fall into a directory like
            // workflows/. This checks for those edge cases and
            // adjusts the folder
            if(re.test(md.fileName)) {
              var folder = _.find(types, { name: md.type}).folder;
              return 'src/' + md.fileName.replace(re, folder + '/');
            }
            return 'src/' + md.fileName;
          })
          .value();

        cb(null, filePaths);
      }).catch(function(err) {
        cb(err);
      });
    };

    async.mapLimit(typeGroups, 5, iterator, function(err, res) {
      if(err) return reject(err);
      var files = _(res)
        .compact()
        .flattenDeep()
        .uniq()
        .value();
      resolve(files);
    });
  });
}

function filterOnGlobs(paths, globs) {
  return _(paths)
    .filter(function(p) {
      var match = false;

      _.each(globs, function(g) {
        if(minimatch(p, g, matchOpts)) {
          match = true;
          return false;
        }
      });

      return match;
    })
    .value();
}

function clearSrcDir() {
  return new Promise(function(resolve, reject) {
    rimraf('src/*', function(err) {
      if(err) return reject(err);
      return resolve();
    });
  });
}

function unzipToTmp(zipBase64) {
  return new Promise(function(resolve, reject) {

    logger.log('unzipping to tmp dir: ' + paths.dir.tmp);

    var zip = new AdmZip(new Buffer(zipBase64, 'base64'));

    logger.log('extracting zip');

    zip.extractAllToAsync(paths.dir.tmp, true , function(err, res) {
      if(err) return reject(err);
      resolve();
    });

  });
}

function copyFiles() {
  return new Promise(function(resolve, reject) {

    glob('**/*', { cwd: paths.dir.tmp + '/unpackaged' }, function(err, files) {
      if(err) return reject(err);

      Promise.map(files, function(file) {
        if(file === 'package.xml') return Promise.resolve();
        logger.list('copying file: ' + file);
        return fs.copyAsync(
          paths.dir.tmp + '/unpackaged/' + file,
          process.cwd() + '/src/' + file,
          { clobber: true }
        );
      }, { /* concurrency: 5 */ }).then(function(){
        resolve();
      }).catch(function(err) {
        _.each(err, function(e) {
          logger.error(e.message);
        });
        reject(new Error('file copy errors'));
      });

    });
  });
}

function removeTmpDir() {
  return new Promise(function(resolve, reject) {
    fs.existsAsync(paths.dir.tmp).then(function(exists) {
      if(exists) {
        logger.log('removing tmp directory');
        return fs.removeAsync(paths.dir.tmp);
      }
    });
  });
}

var run = module.exports.run = function(opts, cb) {

  var client;

  var map = metaMap.createMap({
    oauth: opts.oauth,
    org: opts.org
  });

  return Promise.resolve()

  .then(function() {
    return sfClient.getClient(opts.oauth);
  })

  .then(function(sfdcClient){
    client = sfdcClient;
    return map.autoLoad();
  })

  .then(function() {
    var typeMatches = map.index.getTypesFromGlobs(opts.globs);
    // log out the matched directories
    logger.log('matching types');
    _.each(typeMatches, function(tm) {
      logger.list('matched type: ' + tm.name);
    });
    // group the metadata into groups of 3 since that's the limit
    // in a single listMetadata call
    var grouped = _.chunk(typeMatches, 3);
    return getFilePaths(grouped, opts.oauth, client);
  })

  .then(function(fpaths){
    if(!fpaths || fpaths.length < 1) {
      throw new Error('no files found for retrieve');
    }
    return filterOnGlobs(fpaths, opts.globs);
  })

  .then(function(filteredPaths) {
    if(!filteredPaths || filteredPaths.length < 1) {
      throw new Error('no files found for retrieve');
    }
    map.addFiles(filteredPaths);

    var apiVersion = client.apiVersion.replace('v', '');

    var promise = client.meta.retrieveAndPoll({
      apiVersion: apiVersion,
      unpackaged: {
        version: apiVersion,
        types: map.createTypesArray()
      }
    });

    promise.poller.on('poll', function(res) {
      logger.log('retrieve status: ' + res.status);
    });

    return promise;
  })

  .then(function(res){
    return unzipToTmp(res.zipFile);
  })

  .then(function(){
    if(opts.replace) {
      logger.log('clearing src dir');
      return clearSrcDir();
    }
  })

  .then(function(){
    logger.log('merging files to src');
    return copyFiles();
  })

  .then(function() {
    logger.log('cleaning up temporary files');
    return removeTmpDir();
  })

  .catch(function(err) {
    cb(err);
  });

};

module.exports.cli = function(program) {
  program.command('retrieve [globs...]')
    .description('retrieve metadata from target org')
    .option('-o, --org <org>', 'the Salesforce organization to use')
    .option('-r, --replace', 'replace all local metadata with the retrieved metadata')
    .action(function(globs, opts) {
      opts.globs = globs;
      opts._loadOrg = true;
      return cliUtil.executeRun(run)(opts);
    });
};
