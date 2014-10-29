var user = require('./user');

var log = function(text) {
  return console.log(formatLog(text));
}

var error = function(text) {
  return console.error(formatError(text));
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

var formatError = function() {
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
module.exports.formatLog   = formatLog;
module.exports.formatError = formatError;
