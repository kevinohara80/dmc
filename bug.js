var Promise = require('bluebird');
var fse     = Promise.promisifyAll(require('fs-extra'));

fse.readJsonAsync('test.json').then(function(file) {
  file.baz_bar = 32;
  return fse.outputJsonAsync('test.json', file);
}).catch(function(err) {
  console.error('error in test');
  console.error(err);
});
