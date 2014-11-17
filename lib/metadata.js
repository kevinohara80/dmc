var _      = require('lodash');
var path   = require('path');
var logger = require('./logger');

var extensions = {
  'cls':       'ApexClass',
  'page':      'ApexPage',
  'trigger':   'ApexTrigger',
  'component': 'ApexComponent'
};

var memberTypes = [
  'ApexClass',
  'ApexTrigger',
  'ApexPage',
  'ApexComponent'
];

// map class
var Map = function() {
  this.meta = {
    'ApexClass': [],
    'ApexPage': [],
    'ApexTrigger': [],
    'ApexComponent': []
  };
};

Map.prototype.addFiles = function(files) {
  var self = this;
  if(!files) return;
  if(!_.isArray(files)) files = [files];

  _.each(files, function(f) {
    var ext = path.extname(f);
    if(ext) {
      var type = extensions[ext.replace('.', '')];
      if(type) {
        var md = {};
        var name = path.basename(f, ext);
        var existing = _.find(self.meta[type], { name: name });

        if(existing) {
          md = existing;
        } else {
          self.meta[type].push(md);
        }

        md.name = name;
        md.path = f;
        md.ext = ext.replace('.', '');
        md.type = type;
        if(!md.id) md.id = '';
      }
    }
  });
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
    return {
      type: 'ApexClass',
      object: {
        name: name,
        body: 'public class ' + name + ' {\n\n}'
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
  } else if('type' === 'ApexComponent') {
    return {
      type: 'ApexComponent',
      object: {
        name: name,
        masterlabel: name,
        body: '<apex:component >\n\n</apex:component>'
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

module.exports.memberTypes = memberTypes;
