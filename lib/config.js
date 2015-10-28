var fs           = require('./fs');
var fso          = require('fs');
var Promise      = require('bluebird');
var _            = require('lodash');
var paths        = require('./paths');
var configSchema = require('./config-schema');
var configColors = require('./config-colors');

var globalConfig = new Config({
  isGlobal: true,
  filePath: paths.file.globalConfig
});

var localConfig = new Config({
  isGlobal: false,
  filePath: process.cwd() + '/dmc_config.json'
});

// Config object definition

function Config(opts) {
  this._isGlobal = opts.isGlobal || false;
  this._filePath = opts.filePath ||  paths.file.globalConfig;
  this._cfgData  = {};
  this._isDirty  = false;
  this._exists   = false;
  this._isLoaded = false;
}

Config.prototype.exists = function() {
  return this._exists;
};

Config.prototype.isGlobal = function() {
  return this._isGlobal;
};

Config.prototype.isDirty = function() {
  return this._isDirty;
};

Config.prototype.isLoaded = function() {
  return this._isLoaded;
};

Config.prototype.getData = function() {
  return this._cfgData;
};

Config.prototype.load = function() {
  var self = this;

  // if we're already loaded and not dirty,
  // simply resolve the promise right away
  if(this.isLoaded() && !this.isDirty()) {
    return Promise.resolve(this);
  }

  return fs.existsAsync(self._filePath)
    .then(function(exists) {

      if(!exists) {
        self._exists = false;
        self._isLoaded = false;
        return self;
      }

      self._exists = true;

      var defaultConfig = (self.isGlobal()) ?
        configSchema.getDefaultConfig() :
        {};

      return fs.readJsonAsync(self._filePath)
        .then(function(cfgData) {
          self._cfgData = _.reduce(cfgData, function(result, val, key) {
            result[key] = val;
            return result;
          }, defaultConfig);
          self._isLoaded = true;
          self._isDirty = false;
          return self;
        });

    });

};

Config.prototype.clean = function() {
  var self = this;

  if(this.isLoaded()) {
    self._cfgData = _.reduce(self._cfgData, function(result, val, key) {

      if(configSchema.isValidProperty(key)) {
        var normalized = configSchema.normalizeInput(key, val);
        if(normalized.valid) {
          result[normalized.name] = normalized.value;
        }
      }

      return result;
    }, {});
  }

  return this;
};

Config.prototype.init = function() {
  var self = this;
  this._cfgData = configSchema.getDefaultConfig();

  return fs.existsAsync(this._filePath).then(function(exists) {
    if(exists) {
      return self.del();
    }
  }).then(function(){
    self._cfgData = configSchema.getDefaultConfig();
    return self.save();
  });
};

Config.prototype.get = function(key) {
  return this._cfgData[key];
};

Config.prototype.set = function(key, val) {
  var self = this;

  var keyVal;

  if(arguments.length === 2) {
    keyVal = {};
    keyVal[key] = val;
  } else {
    keyVal = key;
  }

  _.map(keyVal, function(v, k) {
    if(!configSchema.isValidProperty(k)) {
      throw new Error('invalid property: ' + k);
    }

    var input = configSchema.normalizeInput(k, v);

    if(!input.valid) {
      throw new Error('unable to set property \'' + k + '\': ' + input.reason);
    } else if(!_.isNull(input.value)) {
      // set the property
      self._isDirty = true;
      self._cfgData[input.name] = input.value;
    } else if(self._cfgData[input.name]) {
      // delete properties that are set to null
      self._isDirty = true;
      delete self._cfgData[input.name];
    }
  });
};

Config.prototype.unset = function(keys) {
  var self = this;

  if(!_.isArray(key)) key = [key];

  _.each(keys, function(k) {
    if(!_.isUndefined(self._cfgData[key])) {
      delete self._cfgData[key];
      self._isDirty = true;
    }
  });

  return this;
};

Config.prototype.save = function(vals) {
  var self = this;

  if(vals) this.set(vals);

  return fs.outputJsonAsync(self._filePath, self._cfgData).then(function(){
    self._isDirty = false;
    return self;
  });

};

Config.prototype.del = function()  {
  var self = this;
  return fs.existsAsync(this._filePath).then(function(exists) {
    if(exists) {
      return fs.unlinkAsync(self._filePath);
    } else {
      return new Error('Delete failed: Config file does not exist.');
    }
  });
};

module.exports.loadAll = function() {
  return Promise.all([
    globalConfig.load(),
    localConfig.load()
  ]);
};

module.exports.saveAll = function() {
  var promises = [];

  if(globalConfig.exists() && globalConfig.isDirty()) {
    promises.push(globalConfig.save());
  }
  if(localConfig.exists() && localConfig.isDirty()) {
    promises.push(localConfig.save());
  }

  return Promise.all(promises);
};

module.exports.get = function(key) {
  if(localConfig.isLoaded() &&
      !_.isUndefined(localConfig.get(key)) &&
      !_.isNull(localConfig.get(key))) {
    return localConfig.get(key);
  } else {
    return globalConfig.get(key);
  }
};

module.exports.global = function() {
  return globalConfig;
};

module.exports.local = function() {
  return localConfig;
};

module.exports.configColors = _.partial(configColors, module.exports);
