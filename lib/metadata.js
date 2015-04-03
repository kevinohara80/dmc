var _ = require('lodash');

var getTypeFromName = function(name) {
  if(!name) return;
  return _.find(types, { name: name });
};

var getTypeFromExtension = function(ext) {
  if(!ext) return;
  ext = ext.toLowerCase().replace('.', '');
  return _.find(types, { extension: ext });
};

var getTypeFromFolder = function(folder) {
  if(!folder) return;
  folder = folder.toLowerCase();
  return _.find(types, { folder: folder });
};

var getMemberTypes = function() {
  return _.filter(types, { memberType: true });
};

var getMemberTypeNames = function() {
  return _.pluck(getMemberTypes(), 'name');
};

var types = [
  {
    name: 'ApexClass',
    folder: 'classes',
    extension: 'cls',
    memberType: true
  },
  {
    name: 'ApexTrigger',
    folder: 'triggers',
    extension: 'trigger',
    memberType: true
  },
  {
    name: 'ApexPage',
    folder: 'pages',
    extension: 'page',
    memberType: true
  },
  {
    name: 'ApexComponent',
    folder: 'components',
    extension: 'component',
    memberType: true
  },
  {
    name: 'StaticResource',
    folder: 'staticresources',
    extension: 'resource',
    memberType: false
  }
];

module.exports.getTypeFromName      = getTypeFromName;
module.exports.getTypeFromExtension = getTypeFromExtension;
module.exports.getTypeFromFolder    = getTypeFromFolder;
module.exports.getMemberTypes       = getMemberTypes;
module.exports.getMemberTypeNames   = getMemberTypeNames;

module.exports.types = types;
