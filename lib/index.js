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

var matchOpts = { matchBase: true };

// used to parse file paths
var fileRegex = /^(.*\/)?((src)\/([^\/]*)\/((([^\/]*)\/)?(.*)))$/i;

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

Index.prototype.getTypeNames = function() {
  return _.pluck(this._index.metadataObjects, 'name');
};

Index.prototype.autoLoad = function(oauth) {
  if(oauth) this._oauth = oauth;
  var self = this;
  return this.exists().then(function(exists) {
    if(exists) {
      return self.loadFromFile();
    } else {
      return self.fetch();
    }
  });
};

Index.prototype.loadFromFile = function() {
  var self = this;
  return this.exists().then(function(exists) {
    if(!exists) throw new Error('index file does not exist: ' + self._filePath);
    return fs.readJsonAsync(self._filePath).then(function(idx) {
      self._index = idx;
      return self.getIndex();
    });
  });
};

Index.prototype.fetch = function(oauth) {
  if(oauth) this._oauth = oauth;
  var self = this;

  if(!this._oauth) return Promise.reject(new Error('oauth not supplied'));

  return sfClient.getClient(this._oauth)
    .then(function(client) {
      return client.meta.describeMetadata();
    }).then(function(md) {
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
      return self.getIndex();
    });
};

Index.prototype.save = function() {
  return fs.outputJsonAsync(this._filePath, this._index);
};

Index.prototype.destroy = function() {
  var self = this;
  return this.exists().then(function(exists) {
    if(exists) {
      return fs.unlinkAsync(self._filePath);
    }
  }).then(function(){
    delete self._index;
  });
};

/* utility methods */

Index.prototype._throwIfNotLoaded = function() {
  if(!this.isLoaded()) throw new Error('index error: not loaded');
};

/* parsing utility */

Index.prototype.parseFilePath = function(path) {
  this._throwIfNotLoaded();
  var matches = fileRegex.exec(path);

  if(!matches) {
    throw new Error('unrecognized file path: ' + path);
  }

  var type;
  var name      = matches[5];
  var folder    = matches[4];
  var srcPath   = matches[2];
  var subFolder = matches[7];
  var fileName  = matches[5];
  var baseDir   = matches[3];
  var parentDir = matches[1];

  if(baseDir) {
    type = this.getTypeFromFolder(folder);
  }

  if(type && type.extension) {
    name = name.replace('.' + type.extension, '');
  }

  // aura component handling
  // resolves the bundles files into it's actual
  // bundle directory
  if(type && !type.subFolders && subFolder) {
    name      = subFolder;
    fileName  = name;
    subFolder = void 0;
    srcPath   = baseDir + '/' + folder + '/' + name;
  }

  return {
    input:     path,
    baseDir:   baseDir,
    parentDir: parentDir,
    srcPath:   srcPath,
    folder:    folder,
    subFolder: subFolder,
    fileName:  fileName,
    name:      name,
    type:      type
  };
};

/* filter methods */

Index.prototype.getMemberTypeNames = function() {
  return memberTypes;
};

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

  var parsed = this.parseFilePath(path);

  if(!parsed.folder) throw new Error('invalid path: ' + path);
  return _.find(this._index.metadataObjects, { folder: parsed.folder });
};

Index.prototype.getTypeFromFolder = function(folder) {
  if(!folder) throw new Error('folder not supplied');
  this._throwIfNotLoaded();

  return _.find(this._index.metadataObjects, {
    folder: folder
  });
};

Index.prototype.getTypesFromGlobs = function(globs) {
  if(!globs) throw new Error('globs not supplied');
  this._throwIfNotLoaded();

  // convert to array if single glob
  if(!_.isArray(globs)) {
    globs = [globs];
  }

  return _(this._index.metadataObjects).map(function(t) {
    return _.map(globs, function(g) {
      var components = g.split('/');
      if(minimatch('src/' + t.folder, components.slice(0, 2).join('/'), matchOpts)) {
        return {
          name: t.name,
          folder: t.subFolders ? components[2] : null
        };
      }
    });
  })
  .flatten()
  .compact()
  .value();
};

/* export init function */

function init(org, oauth) {
  return new Index(org, oauth);
}

module.exports.init = init;
