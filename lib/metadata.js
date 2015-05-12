var _ = require('lodash');

var getTypeFromName = function(name) {
  if(!name) return;
  return _.find(types, function(t) {
    return (t.name.toLowerCase() === name.toLowerCase());
  });
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
    memberType: true,
    hasMetaXML: true,
    deployTypes: ['metadata', 'tooling']
  },
  {
    name: 'ApexTrigger',
    folder: 'triggers',
    extension: 'trigger',
    memberType: true,
    hasMetaXML: true,
    deployTypes: ['metadata', 'tooling']
  },
  {
    name: 'ApexPage',
    folder: 'pages',
    extension: 'page',
    memberType: true,
    hasMetaXML: true,
    deployTypes: ['metadata', 'tooling']
  },
  {
    name: 'ApexComponent',
    folder: 'components',
    extension: 'component',
    memberType: true,
    hasMetaXML: true,
    deployTypes: ['metadata', 'tooling']
  },
  {
    name: 'CustomObject',
    folder: 'objects',
    extension: 'object',
    memberType: false,
    hasMetaXML: false,
    deployTypes: ['metadata']
  },
  {
    name: 'CustomTab',
    folder: 'tabs',
    extension: 'tab',
    memberType: false,
    hasMetaXML: false,
    deployTypes: ['metadata']
  },
  {
    name: 'HomePageComponent',
    folder: 'homepagecomponent',
    extension: 'homepagecomponent',
    memberType: false,
    hasMetaXML: false,
    deployTypes: ['metadata']
  },
  {
    name: 'PermissionSet',
    folder: 'permissionsets',
    extension: 'permissionset',
    memberType: false,
    hasMetaXML: false,
    deployTypes: ['metadata']
  },
  {
    name: 'StaticResource',
    folder: 'staticresources',
    extension: 'resource',
    memberType: false,
    hasMetaXML: false,
    deployTypes: ['metadata', 'tooling']
  }
];

module.exports.getTypeFromName      = getTypeFromName;
module.exports.getTypeFromExtension = getTypeFromExtension;
module.exports.getTypeFromFolder    = getTypeFromFolder;
module.exports.getMemberTypes       = getMemberTypes;
module.exports.getMemberTypeNames   = getMemberTypeNames;

module.exports.types = types;
