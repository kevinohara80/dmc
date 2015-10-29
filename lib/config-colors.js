var colors = require('colors');

module.exports = function(config) {
  colors.setTheme({
    list: 'magenta',
    create: 'cyan',
    update: 'cyan',
    destroy: 'cyan',
    unchanged: 'grey',
    good: 'green',
    bad: 'red',
    log: config.get('background') === 'dark' ? 'grey' : 'blue',
    highlight: 'yellow',
    hl: 'yellow'
  });
  colors.enabled = config.get('colorize');
};
