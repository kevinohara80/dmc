var _      = require('lodash');
var path   = require('path');
var logger = require('./logger');
var meta   = require('./metadata');

var Map = function() {
  var self = this;
  this.meta = {};

  _.each(meta.types, function(t) {
    self.meta[t.name] = [];
  });
}

Map.prototype.addFiles = function(files) {
  var self = this;
  if(!files) return;
  if(!_.isArray(files)) files = [files];

  _.each(files, function(f) {
    var ext = path.extname(f);
    if(ext) {
      //var type = extensions[ext.replace('.', '')];
      var type = meta.getTypeFromExtension(ext);
      if(type) {
        var md = {};
        var name = path.basename(f, ext);
        var existing = _.find(self.meta[type.name], { name: name });

        if(existing) {
          md = existing;
        } else {
          self.meta[type.name].push(md);
        }

        md.name = name;
        md.path = f;
        md.ext = ext.replace('.', '');
        md.type = type.name;
        if(!md.id) md.id = '';
      }
    }
  });
};

Map.prototype.getTypesForQuery = function() {
  var types = [];
  _.forOwn(this.meta, function(val, key) {
    if(val && val.length) types.push(key);
  })
  return types;
};

Map.prototype.requiresDeploy = function() {
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
    }
  } else if(type === 'ApexPage') {
    return {
      type: 'ApexPage',
      object: {
        masterlabel: name,
        name: name,
        markup: '<apex:page >\n\n</apex:page>'
      }
    }
  } else if(type === 'ApexComponent') {
    return {
      type: 'ApexComponent',
      object: {
        name: name,
        masterlabel: name,
        markup: '<apex:component >\n\n</apex:component>'
      }
    }
  } else if(type === 'ApexTrigger') {
    return {
      type: 'ApexTrigger',
      object: {
        name: name,
        body: 'trigger ' + name + ' on ' + obj + ' {\n\n}'
      }
    }
  }
};

module.exports.createMap = function(files) {
  var m = new Map();
  if(files) {
    m.addFiles(files);
  }
  return m;
};
