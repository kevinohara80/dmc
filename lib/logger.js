var user   = require('./user');
var config = require('./config');
var _      = require('lodash');

// 0=silent, 1=info, 2=debug
var logLevel = 0;

var setLogLevel = function(level) {
  logLevel = level;
};

var log = function(text, vals) {
  if(logLevel < 1) return;
  return console.log(formatLog(text));
};

var debug = function(text) {
  if(logLevel < 2) return;
  return console.log(formatLog('debug: ' + text));
};

var success = function(text) {
  if(logLevel < 1) return;
  return console.log(formatSuccess(text));
};

var error = function(text) {
  if(logLevel < 1) return;
  return console.error(formatError(text));
};

var list = function(text, vals) {
  if(logLevel < 1) return;
  var li = '*'.list;
  return log(li + ' ' + text);
};

var listError = function(text, vals) {
  if(logLevel < 1) return;
  var li = '*'.bad;
  return error(li + ' ' + text);
};

var create = function(text, vals) {
  if(logLevel < 1) return;
  var create = '[create] '.create;
  return log(create + text);
};

var update = function(text, vals) {
  if(logLevel < 1) return;
  var update = '[update] '.update;
  return log(update + text);
};

var destroy = function(text, vals) {
  if(logLevel < 1) return;
  var destroy = '[delete] '.destroy;
  return log(destroy + text);
};

var noChange = function(text, vals) {
  return;
};

var done = function(ok) {
  if(logLevel < 1) return;
  ok = (typeof ok !== 'undefined') ? ok : true;

  if(ok) {
    log('[OK]'.good);
  } else {
    log('[NOT OK]'.bad);
  }
};

var formatLog = function(text) {
  var l = '[dmc] '.log;
  return l += text;
};

var formatError = function(text) {
  var l = '[err] '.bad;
  return l += text.bad;
};

var formatSuccess = function(text) {
  var l = '[dmc] '.log;
  return l += text.good;
};

var highlight = function(text) {
  if(!config.get('colorize')) {
    text = '*' + text + '*';
  } else {
    text = ('' + text).highlight;
  }
  return text;
};

var green = function(text) {
  if(config.get('colorize')) {
    text = ('' + text).good;
  }
  return text;
};

module.exports.setLogLevel   = setLogLevel;
module.exports.log           = log;
module.exports.info          = log;
module.exports.debug         = debug;
module.exports.success       = success;
module.exports.error         = error;
module.exports.list          = list;
module.exports.listError     = listError;
module.exports.done          = done;
module.exports.create        = create;
module.exports.update        = update;
module.exports.destroy       = destroy;
module.exports.noChange      = noChange;
module.exports.formatLog     = formatLog;
module.exports.formatError   = formatError;
module.exports.formatSuccess = formatSuccess;
module.exports.highlight     = highlight;
module.exports.green         = green;
