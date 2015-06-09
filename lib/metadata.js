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

var getTypeFromPath = function(path) {
  if(!path) return;
  var type;
  var parts = path.split('/');
  if(parts.length < 2) return;
  return _.find(types, { folder: parts[1] });
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
    subFolders: false,
    deployTypes: ['metadata', 'tooling']
  },
  {
    name: 'ApexTrigger',
    folder: 'triggers',
    extension: 'trigger',
    memberType: true,
    hasMetaXML: true,
    subFolders: false,
    deployTypes: ['metadata', 'tooling']
  },
  {
    name: 'ApexPage',
    folder: 'pages',
    extension: 'page',
    memberType: true,
    hasMetaXML: true,
    subFolders: false,
    deployTypes: ['metadata', 'tooling']
  },
  {
    name: 'ApexComponent',
    folder: 'components',
    extension: 'component',
    memberType: true,
    hasMetaXML: true,
    subFolders: false,
    deployTypes: ['metadata', 'tooling']
  },
  {
    name: 'CustomObject',
    folder: 'objects',
    extension: 'object',
    memberType: false,
    hasMetaXML: false,
    subFolders: false,
    deployTypes: ['metadata']
  },
  {
    name: 'CustomTab',
    folder: 'tabs',
    extension: 'tab',
    memberType: false,
    hasMetaXML: false,
    subFolders: false,
    deployTypes: ['metadata']
  },
  {
    name: 'Document',
    folder: 'documents',
    extension: null,
    memberType: false,
    hasMetaXML: true,
    subFolders: true,
    deployTypes: ['metadata']
  },
  {
    name: 'HomePageComponent',
    folder: 'homepagecomponent',
    extension: 'homepagecomponent',
    memberType: false,
    hasMetaXML: false,
    subFolders: false,
    deployTypes: ['metadata']
  },
  {
    name: 'PermissionSet',
    folder: 'permissionsets',
    extension: 'permissionset',
    memberType: false,
    hasMetaXML: false,
    subFolders: false,
    deployTypes: ['metadata']
  },
  {
    name: 'StaticResource',
    folder: 'staticresources',
    extension: 'resource',
    memberType: false,
    hasMetaXML: false,
    subFolders: false,
    deployTypes: ['metadata', 'tooling']
  }
];

module.exports.getTypeFromName      = getTypeFromName;
module.exports.getTypeFromExtension = getTypeFromExtension;
module.exports.getTypeFromPath      = getTypeFromPath;
module.exports.getTypeFromFolder    = getTypeFromFolder;
module.exports.getMemberTypes       = getMemberTypes;
module.exports.getMemberTypeNames   = getMemberTypeNames;

module.exports.types = types;
