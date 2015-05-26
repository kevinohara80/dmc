var fs    = require('fs-extra');
var user  = require('./user');
var _     = require('lodash');
var paths = require('./paths');

var indexDir = paths.dir.home + '/index';

var cache = {};

function Index(org) {
  this._org = org;
  this._index = {};
  this._filePath = indexDir + '/' + this._org + '.json';
}

Index.prototype.getFilePath = function() {
  return this._filePath;
};

Index.prototype.findMetaById = function(type, id) {
  if(!this._index || !this._index[type]) return;
  return _.find(this._index[type], { Id: id });
};

Index.prototype.findMetaByName = function(type, nm) {
  if(!this._index || !this._index[type]) return;
  return _.find(this._index[type], { Name: nm });
};

Index.prototype.setAllForType = function(type, meta) {
  if(!this._index) this._index = {};
  this._index[type] = meta;
};

Index.prototype.load = function(cb) {
  var self = this;
  fs.readJson(this._filePath, function(err, idx) {
    if(err) return cb(err);
    self._index = idx;
    cb(null, self);
  });
};

Index.prototype.save = function(cb) {
  fs.outputJson(this._filePath, this._index, cb);
};

/* index management */

function getIndex(org, cb) {
  fs.exists(indexDir + '/' + org + '.json', function(exists) {
    if(!exists) return cb(null, new Index(org));
    var idx = new Index(org);
    return idx.load(cb);
  });
}

module.exports.getIndex = getIndex;
