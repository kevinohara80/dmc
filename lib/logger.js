var user = require('./user');

var log = function(text, vals) {
  return console.log(formatLog(text));
}

var error = function(text, vals) {
  return console.error(formatError(text));
}

var done = function(ok) {
  ok = (typeof ok !== 'undefined') ? ok : true;

  if(user.config('colorize')) {
    if(ok) {
      log('ok'.green)
    } else {
      error('not ok'.red);
    }
  } else {
    if(ok) {
      log('ok');
    } else {
      log('not ok');
    }
  }
}

var formatLog = function(text) {
  var l = '';
  if(user.config('colorize')) {
    l += '[dmc] '.blue;
  } else {
    l += '[dmc] '
  }
  return l += text;
}

var formatError = function(text) {
  var l = '';
  if(user.config('colorize')) {
    l += '[err] '.red;
  } else {
    l += '[err] '
  }
  return l += text;
}

module.exports.log         = log;
module.exports.error       = error;
module.exports.done        = done;
module.exports.formatLog   = formatLog;
module.exports.formatError = formatError;
