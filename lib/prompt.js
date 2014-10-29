var readline = require('readline');
var logger   = require('./logger');
var rl;

var truthies = ['y', '1', 'yes'];

function open() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', function() {
    rl.write('\n');
  });
}

function close() {
  rl.close();
}

module.exports.prompt = function(text, cb) {
  open();
  rl.question(text, function(answer) {
    cb(answer);
    close();
  });
}

module.exports.confirm = function(text, def, cb) {
  open();
  var defaultText = '(Y/n) ';
  if(!def) defaultText = '(y/N) ';
  rl.question(text + ' ' + defaultText, function(answer) {
    var confirmed = def;
    if(answer) {
      answer = answer.toLowerCase();
      if(truthies.indexOf(answer) !== -1) {
        confirmed = true;
      } else {
        confirmed = false;
      }
    }
    cb(confirmed);
    close();
  });
}
