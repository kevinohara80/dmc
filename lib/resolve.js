var Promise = require('bluebird');
var _       = require('lodash');

// add back in deferreds
var deferred = function() {
  var resolve, reject;
  var promise = new Promise(function() {
    resolve = arguments[0];
    reject = arguments[1];
  });
  return {
    resolve: resolve,
    reject: reject,
    promise: promise
  };
};

module.exports = function(callback, chain) {
  var defer;

  if(!callback || !_.isFunction(callback)) {
    defer = deferred();
  }
  var resolver = {
    resolve: function(data) {
      if(callback) callback(null, data);
      else if(defer) defer.resolve(data);
    },
    reject: function(err) {
      if(callback) callback(err);
      else if(defer) defer.reject(err);
    },
    promise: (defer) ? defer.promise : undefined
  };

  Promise.resolve()
  .then(chain)
  .then(resolver.resolve)
  .catch(resolver.reject);

  return resolver.promise;
};
