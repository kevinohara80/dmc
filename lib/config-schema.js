var _ = require('lodash');

var types = {
  string: 1,
  integer: 2,
  boolean: 3,
  number: 4,
  array: 5,
  enum: 6
};

var truthies = [
  'true', 't', '1', 1
];

var falsies = [
  'false', 'f', '0', 0
];

var schema = [
  {
    name: 'default_org',
    type: types.string,
    nullable: true,
    defaultValue: null
  },
  {
    name: 'api_version',
    type: types.integer,
    nullable: true,
    defaultValue: 32
  },
  {
    name: 'colorize',
    type: types.boolean,
    nullable: false,
    defaultValue: true
  },
  {
    name: 'log_level',
    type: types.enum,
    nullable: true,
    enumValues: ['none', 'debug', 'info'],
    defaultValue: 'info'
  }
];

function getDefaultConfig() {
  return _.reduce(schema, function(result, val, key) {
    if(!_.isUndefined(val.defaultValue)) {
      result[val.name] = val.defaultValue;
    }
    return result;
  }, {});
}

function getPropSchema(prop) {
  if(!prop) return;
  return _.find(schema, function(item) {
    return (item.name.toLowerCase() === prop.toLowerCase().trim());
  });
}

function isValidProperty(prop) {
  if(!prop) return;
  var val = getPropSchema(prop);
  return (val) ? true : false;
}

function normalizeInput(prop, value) {
  if(!prop) return;
  var propSchema = getPropSchema(prop);

  if(_.isUndefined(value)) value = null;

  var normalized = {
    name: propSchema.name,
    valid: true,
  };

  if(_.isNull(value)) {
    normalized.value = value;
    if(!propSchema.nullable) {
      normalized.valid = false;
      normalized.reason = 'not nullable';
    }
  } else {

    switch(propSchema.type) {

      // handle string types
      case types.string:
        normalized.value = (_.isString(value)) ? value : value.toString();
        break;

      // handle integer types
      case types.integer:
        normalized.value = (_.isNumber(value)) ? Math.floor(value) :
          (_.isString(value)) ? parseInt(value, 10) :
          (value === true) ? 1 : 0;
        break;

      // handle floats
      case types.number:
        normalized.value = (_.isNumber(value)) ? value :
          (_.isString(value)) ? parseFloat(value) :
          (value === true) ? 1 : 0;
        break;

      // handle boolean values
      case types.boolean:
        if(_.isBoolean(value)) {
          normalized.value = value;
          break;
        }

        if(_.isString(value)) {
          var input = value.toLowerCase().trim();
          if(_.indexOf(truthies, input) != -1) {
            normalized.value = true;
            break;
          } else if(_.indexOf(falsies, input) != -1) {
            normalized.value = false;
            break;
          }
        }

        if(_.isNumber(value) && value == 1) {
          normalized.value = true;
          break;
        }

        if(_.isNumber(value) && value == 0) {
          normalized.value = false;
          break;
        }

        normalized.value = value;
        normalized.reason = 'invalid boolean';
        break;

      case types.enum:
        var val = (_.isString(value)) ? value : value.toString();

        val = val.toLowerCase().trim();

        normalized.value = val;

        if(_.indexOf(propSchema.enumValues, val) === -1) {
          normalized.valid = false;
          normailized.reason = 'must be one of [' +
            propTypes.enumValues.join(', ') +
            ']';
        }

        break;

      // default behavior
      default:
        normalized.value = value;
        normalized.valid = false;
        normalized.reason = 'unrecognized type';

    }

  }

  return normalized;
}

function getDefaultValue(prop) {
  if(!prop) return;
  var propSchema = getPropSchema(prop);

  if(!propSchema) return;

  return propSchema.defaultValue;
}

module.exports.getDefaultConfig = getDefaultConfig;
module.exports.isValidProperty  = isValidProperty;
module.exports.getPropSchema    = getPropSchema;
module.exports.normalizeInput   = normalizeInput;
module.exports.getDefaultValue  = getDefaultValue;
