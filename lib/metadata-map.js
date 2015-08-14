var _        = require('lodash');
var path     = require('path');
var logger   = require('./logger');
var async    = require('async');
var Promise  = require('bluebird');
var sfClient = require('../lib/sf-client');
var index    = require('../lib/index');

var Map = function(opts) {
  var self = this;
  this.meta = {};
  this.oauth = opts.oauth;
  this.org   = opts.org;
};

Map.prototype.autoLoad = function(oauth) {
  if(oauth) this.oauth = oauth;
  var self = this;

  this.index = index.init(this.org, this.oauth);

  return this.index.autoLoad().then(function() {
    _.each(self.index.getTypeNames(), function(t) {
      self.meta[t] = [];
    });
  });
};

Map.prototype.setOAuth = function(oauth) {
  this.oauth = oauth;
};

Map.prototype.addFiles = function(files) {
  var self = this;
  if(!files) throw new Error('files is null or undefined');
  if(!_.isArray(files)) files = [files];

  _.each(files, function(f) {
    var parsed = self.index.parseFilePath(f);

    if(!parsed.type) {
      throw new Error('Invalid file found: ' + f);
    }

    var existing = _.find(self.meta[parsed.type.name], { name: parsed.name });

    var md = {};

    if(existing) {
      md = existing;
    } else {
      self.meta[parsed.type.name].push(md);
    }

    md.fileName = parsed.fileName;
    md.name = parsed.name;
    md.path = parsed.input;
    md.type = parsed.type.name;
    md.folder = parsed.folder;
    md.subFolder = parsed.subFolder;
    md.hasMetaXML = parsed.type.hasMetaXML;

    if(md.id) md.id = '';
  });
};


Map.prototype.getTypesForQuery = function() {
  var types = [];
  _.forOwn(this.meta, function(val, key) {
    if(val && val.length) types.push(key);
  });
  return types;
};

Map.prototype.fetchIds = function() {

  var self = this;

  var client;

  function iterator(type, cb) {

    if(!self.meta[type] || !self.meta[type].length) {
      return cb();
    }

    var fileNames = _(self.meta[type])
      .pluck('name')
      .map(function(n) {
        return '\'' + n + '\'';
      })
      .value()
      .join(', ');

    var query = 'SELECT Id, Name FROM ' + type;
    query += ' WHERE Name IN (' + fileNames + ')';

    var returned = [];

    client.query({ query: query, oauth: self.oauth }, function(err, res) {
      if(err) return cb(err);
      if(res.records) {
        _.each(res.records, function(r) {
          returned.push({
            name: r.get('name'),
            id: r.getId()
          });
          self.setMetaId(type, r.get('name'), r.getId());
        });
      }
      cb(null, returned);
    });
  }

  return new Promise(function(resolve, reject) {

    if(!self.oauth) {
      return reject(new Error('oauth not set in metadata map'));
    }

    sfClient.getClient(self.oauth).then(function(sfdcclient) {
      client = sfdcclient;
      async.concat(self.getTypesForQuery(), iterator, function(err, results) {
        if(err) return reject(err);
        resolve(results);
      });
    }).catch(function(err) {
      reject(err);
    });
  });

};

Map.prototype.createPackageXML = function(version) {

  var self = this;

  if(!_.isString(version)) {
    version = (version + '.0');
  } else {
    version = version.replace('v', '');
  }

  function getTypes() {

    var types = [];

    _(self.meta).map(function(metaList, metaType) {

      if(!metaList || !metaList.length) return;

      var members = _.map(metaList, function(m) {
        return '    <members>' + m.name + '</members>';
      }).join('\n');

      types.push([
        '  <types>',
             members,
        '    <name>' + metaType + '</name>',
        '  </types>'
      ].join('\n'));

    })
    .compact()
    .value();

    return types.join('\n');
  }

  var pkg = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Package xmlns="http://soap.sforce.com/2006/04/metadata">',
    getTypes(),
    '  <version>' + version + '</version>',
    '</Package>'
  ].join('\n');

  return pkg;
};

Map.prototype.createTypesArray = function() {
  return _(this.meta).map(function(metaList, metaType) {
    return {
      name: metaType,
      members: _.pluck(metaList, 'name')
    };
  })
  .filter(function(m) {
    return m.members && m.members.length > 0;
  })
  .value();
};

Map.prototype.getFilePathsForDeploy = function() {
  var paths = [];
  var self = this;

  _.map(this.meta, function(metaList, metaType) {
    if(!metaList || !metaList.length) return;
    var type = self.index.getTypeFromName(metaType);
    _.each(metaList, function(m) {
      paths.push(m.path);
      if(type.hasMetaXML) {
        paths.push(m.path + '-meta.xml');
      }
    });
  });

  return paths;
};

Map.prototype.requiresMetadataDeploy = function() {
  var self = this;
  var required = false;

  _.forOwn(self.meta, function(value, key) {
    if(_.isArray(value) && value.length > 0) {
      var type = self.index.getTypeFromName(key);
      if(_.indexOf(type.deployTypes, 'metadata') !== -1 &&
          _.indexOf(type.deployTypes, 'tooling') === -1) {
        required = true;
        return false;
      }
    }
  });
  return required;
};

Map.prototype.requiresToolingDeploy = function() {
  var self = this;
  var requiresDeploy = false;
  _.each(meta.getMemberTypeNames(), function(n) {
    if(self.meta[n] && self.meta[n].length) {
      requiresDeploy = true;
      return false;
    }
  });
  return requiresDeploy;
};

Map.prototype.setMetaId = function(type, name, id) {
  if(this.meta[type]) {
    var md = _.find(this.meta[type], { name: name });
    if(md) {
      md.id = id;
    }
  }
};

Map.prototype.toJSON = function() {

};

module.exports.getStub = function(type, name, obj) {
  if(type === 'ApexClass') {

    var ext = '';

    if(/Exception/i.test(name)) {
      ext = ' extends Exception';
    }

    return {
      type: 'ApexClass',
      object: {
        name: name,
        body: 'public class ' + name + ext + ' {\n\n}'
      }
    };
  } else if(type === 'ApexPage') {
    return {
      type: 'ApexPage',
      object: {
        masterlabel: name,
        name: name,
        markup: '<apex:page >\n\n</apex:page>'
      }
    };
  } else if(type === 'ApexComponent') {
    return {
      type: 'ApexComponent',
      object: {
        name: name,
        masterlabel: name,
        markup: '<apex:component >\n\n</apex:component>'
      }
    };
  } else if(type === 'ApexTrigger') {
    return {
      type: 'ApexTrigger',
      object: {
        name: name,
        body: 'trigger ' + name + ' on ' + obj + ' {\n\n}'
      }
    };
  }
};

module.exports.createMap = function(opts) {
  return new Map(opts || {});
};
