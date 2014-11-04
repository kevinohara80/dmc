var user     = require('../lib/user');
var index    = require('../lib/index');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');
var _        = require('lodash');
var async    = require('async');

function runIndex(idx, type, oauth, cb) {
  if(!type.queryable) {
    return process.nextTick(cb);
  }

  var q = 'SELECT Id';

  var nameField = _.find(type.fields, { nameField: true });
  if(nameField) {
    q += ', ' + nameField.name;
  }

  q += ' FROM ' + type.name;

  sfClient.tooling.query({ q: q, oauth: oauth }, function(err, resp) {
    if(err) {
      logger.error('indexing failed: ' + type.name);
      logger.error(err.message);
      return cb(err);
    }
    _.each(resp.records, function(r) {
      if(r.attributes) delete r.attributes;
    });
    idx.setAllForType(type.name, resp.records);
    return cb();
  });
}

function getObjects(oauth, cb) {
  logger.log('fetching available metadata types');
  sfClient.tooling.getObjects({ oauth: oauth }, function(err, objs) {
    if(err) return cb(err);
    _.each(objs.sobjects, function(o) {
      _.each(o.urls, function(u) {
        //logger.log(u);
      });
    });
    return cb(null, _.pluck(objs.sobjects, 'name'));
  });
  //return cb(null, ['ApexClass', 'ApexPage', 'ApexComponent', 'ApexTrigger', 'CustomObject']);
}

function getDescribe(desc, o, oauth, cb) {
  //logger.log('describing: ' + o);

  sfClient.tooling.getDescribe({ oauth: oauth, type: o }, function(err, d) {
    if(err) return cb(err);
    desc[o] = d
    return cb();
  });
}

var run = module.exports.run = function(org, opts, cb) {

  var idx;
  var oauth = user.getCredential(org);
  var objs = [];
  var desc = {};

  async.series([
    function(cb2) {
      index.getIndex(org, function(err, i) {
        if(err) return cb2(err);
        idx = i;
        cb2();
      });
    },
    function(cb2) {
      getObjects(oauth, function(err, resp) {
        if(err) return cb2(err);
        objs = resp;
        cb2();
      });
    },
    function(cb2) {
      async.each(objs, function(o, cb3) {
        getDescribe(desc, o, oauth, cb3);
      }, cb2);
    },
    function(cb2) {
      async.each(objs, function(o, cb3) {
        runIndex(idx, desc[o], oauth, cb3);
      }, cb2);
    }
  ], function(err) {
    if(err) return cb(err);
    logger.log('index complete');
    logger.log('saving index manifest');
    idx.save(cb);
  });
};

module.exports.cli = function(program) {
  program.command('index <org>')
    .description('indexes metadata for a target <org>')
    .action(function(org, opts) {
      cliUtil.checkForOrg(org);
      run(org, opts, cliUtil.callback);
    });
};
