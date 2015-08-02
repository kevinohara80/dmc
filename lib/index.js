var fs        = require('./fs');
var user      = require('./user');
var _         = require('lodash');
var paths     = require('./paths');
var minimatch = require('minimatch');
var sfClient  = require('./sf-client');

var memberTypes = [
  'ApexClass',
  'ApexTrigger',
  'ApexPage',
  'ApexComponent'
];

function Index(org, oauth) {
  if(!org) throw new Error('must initialze an index with an org');
  this._org = org;
  this._oauth = oauth;
  this._index = null;
  this._filePath = paths.dir.index + '/' + this._org + '.json';
}

Index.prototype.getFilePath = function() {
  return this._filePath;
};

Index.prototype.exists = function() {
  return fs.existsAsync(this._filePath);
};

Index.prototype.isLoaded = function() {
  return this._index !== null;
};

Index.prototype.getIndex = function() {
  return this._index;
};

Index.prototype.setIndex = function(idx) {
  this._index = idx;
};

Index.prototype.getOrg = function() {
  return this._org;
};

Index.prototype.setOrg = function(org) {
  this._org = org;
};

Index.prototype.loadFromFile = function(cb) {
  var self = this;
  return fs.readJsonAsync(this._filePath).then(function(idx) {
    self._index = idx;
    return self.getIndex();
  });
};

Index.prototype.fetch = function(oauth) {
  if(oauth) this._oauth = oauth;
  var self = this;

  if(!this._oauth) return Promise.reject(new Error('oauth not supplied'));

  return sfClient.meta.describeMetadata({ oauth: this._oauth}).then(function(md) {
    md.metadataObjects = _.map(md.metadataObjects, function(m) {

      var isMemberType = (_.indexOf(memberTypes, m.xmlName) !== -1);

      return {
        name:        m.xmlName,
        folder:      m.directoryName,
        hasMetaXML:  m.metaFile,
        subFolders:  m.inFolder,
        extension:   m.suffix,
        memberType:  isMemberType,
        deployTypes: (isMemberType) ? ['metadata', 'tooling'] : ['metadata'],
        childNames:  m.childXmlNames
      };
    });

    self._index = md;
    return md;
  });
};

Index.prototype.save = function(cb) {
  fs.outputJsonAsync(this._filePath, this._index);
};

/* utility methods */

Index.prototype._throwIfNotLoaded = function() {
  if(!this.isLoaded) throw new Error('index error: not loaded');
};

/* filter methods */

Index.prototype.getTypeFromName = function(name) {
  if(!name) throw new Error('name not supplied');
  this._throwIfNotLoaded();

  return _.find(this._index.metadataObjects, function(t) {
    return (t.name.toLowerCase() === name.toLowerCase());
  });
};

Index.prototype.getTypeFromExtension = function(ext) {
  if(!ext) throw new Error('ext not supplied');
  this._throwIfNotLoaded();

  ext = ext.toLowerCase().replace('.', '');
  return _.find(this._index.metadataObjects, { extension: ext });
};

Index.prototype.getTypeFromPath = function(path) {
  if(!path) throw new Error('path not supplied');
  this._throwIfNotLoaded();

  var parts = path.split('/');
  if(parts.length < 2) throw new Error('invalid path: ' + path);
  return _.find(this._index.metadataObjects, { folder: parts[1] });
};

Index.prototype.getTypeFromFolder = function(folder) {
  if(!folder) throw new Error('folder not supplied');
  this._throwIfNotLoaded();

  return _.find(types, { folder: folder.toLowerCase() });
};

Index.prototype.getTypeFromGlobs = function(globs) {
  if(!globs) throw new Error('globs not supplied');
  this._throwIfNotLoaded();

  // convert to array if single glob
  if(!_.isArray(globs)) {
    globs = [globs];
  }

  var newGlobs = _(globs)
    .map(function(g){
      var split = g.split('/');
      while(split.length > 2) split.pop();
      return split.join('/');
    })
    .uniq()
    .value();

  return _.filter(types, function(t) {
    var match = false;

    _.each(newGlobs, function(g) {
      if(minimatch('src/' + t.folder, g, matchOpts)) {
        match = true;
        return false;
      }
    });

    return match;
  });
};

/* export init function */

function init(org, oauth) {
  return new Index(org, oauth);
}

module.exports.init = init;
