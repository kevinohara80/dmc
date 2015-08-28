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
  var li = '*';
  if(config.get('colorize')) li = li.magenta;
  return log(li + ' ' + text);
};

var listError = function(text, vals) {
  if(logLevel < 1) return;
  var li = '*';
  if(config.get('colorize')) li = li.red;
  return error(li + ' ' + text);
};

var create = function(text, vals) {
  if(logLevel < 1) return;
  var create = '[create] ';
  if(config.get('colorize')) create = create.cyan;
  return log(create + text);
};

var update = function(text, vals) {
  if(logLevel < 1) return;
  var update = '[update] ';
  if(config.get('colorize')) update = update.cyan;
  return log(update + text);
};

var destroy = function(text, vals) {
  if(logLevel < 1) return;
  var destroy = '[delete] ';
  if(config.get('colorize')) destroy = destroy.cyan;
  return log(destroy + text);
};

var noChange = function(text, vals) {
  if(logLevel < 1) return;
  var nochange = '[skipped] ';
  if(config.get('colorize')) nochange = nochange.grey;
  return log(nochange + text);
};

var done = function(ok) {
  if(logLevel < 1) return;
  ok = (typeof ok !== 'undefined') ? ok : true;

  if(config.get('colorize')) {
    if(ok) {
      log('[OK]'.green);
    } else {
      error('[NOT OK]'.red);
    }
  } else {
    if(ok) {
      log('[OK]');
    } else {
      log('[NOT OK]');
    }
  }
};

var formatLog = function(text) {
  var l = '';
  if(config.get('colorize')) {
    l += '[dmc] '.blue;
  } else {
    l += '[dmc] ';
  }
  return l += text;
};

var formatError = function(text) {
  var l = '';
  if(config.get('colorize')) {
    l += '[err] '.red;
  } else {
    l += '[err] ';
  }
  return l += text.red;
};

var formatSuccess = function(text) {
  var l = '';
  if(config.get('colorize')) {
    l += '[dmc] '.blue;
  } else {
    l += '[dmc] ';
  }
  return l += text.green;
};

var highlight = function(text) {
  text = '' + text;
  if(config.get('colorize')) {
    text = text.yellow;
  } else {
    text = '*' + text + '*';
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
