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

var matchOpts = { matchBase: true };

function getFilePaths(typeGroups, oauth) {
  return new Promise(function(resolve, reject) {

    var iterator = function(types, cb) {
      sfClient.meta.listMetadata({
        oauth: oauth,
        queries: _.map(types, function(t) {
          return {
            type: t.name
          };
        })
      }).then(function(res) {
        if(!res || !res.length) {
          return cb(null, null);
        }

        var filePaths = _(res)
          .flattenDeep()
          .map(function(md) {
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

    logger.log('merging files to src');

    glob('**/*', { cwd: paths.dir.tmp + '/unpackaged' }, function(err, files) {
      if(err) return reject(err);

      Promise.map(files, function(file) {
        if(file === 'package.xml') return Promise.resolve();
        logger.list('mapping file: ' + file);
        return fs.copyAsync(
          paths.dir.tmp + '/unpackaged/' + file,
          process.cwd() + '/src/' + file,
          { clobber: true }
        );
      }, { concurrency: 5 }).then(function(){
        resolve();
      }).catch(function(err) {
        reject(err);
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

  var map = metaMap.createMap({
    oauth: opts.oauth,
    org: opts.org
  });

  map.autoLoad().then(function() {
    var typeMatches = map.index.getTypesFromGlobs(opts.globs);

    // log out the matched directories
    _.each(typeMatches, function(tm) {
      logger.list(tm.folder);
    });

    // group the metadata into groups of 3 since that's the limit
    // in a single listMetadata call
    var grouped = _.chunk(typeMatches, 3);

    return getFilePaths(grouped, opts.oauth);
  }).then(function(fpaths){
    return filterOnGlobs(fpaths, opts.globs);
  }).then(function(filteredPaths) {
    map.addFiles(filteredPaths);

    var apiVersion = sfClient.apiVersion.replace('v', '');

    var promise = sfClient.meta.retrieveAndPoll({
      oauth: opts.oauth,
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

  }).then(function(res){
    return unzipToTmp(res.zipFile);
  }).then(function(){
    return copyFiles();
  }).then(function() {
    logger.log('cleaning up temporary files');
    return removeTmpDir();
  }).catch(function(err) {
    cb(err);
  });

};

module.exports.cli = function(program) {
  program.command('retrieve [globs...]')
    .description('retrieve metadata from target org')
    .option('-o, --org <org>', 'the Salesforce organization to use')
    .option('-l, --local-only', 'only retrieve metadata that exists locally')
    .option('-r, --replace', 'replace all local metadata with the retrieved metadata')
    .option('--meta', 'force retrieve with metadata api')
    .action(function(globs, opts) {
      opts.globs = globs;
      opts._loadOrg = true;
      return cliUtil.executeRun(run)(opts);
    });
};
