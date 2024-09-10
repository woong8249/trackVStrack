const airbnbBase = require('eslint-config-airbnb-base');

module.exports = {
  extends: airbnbBase.extends.filter((x) => !x.endsWith('imports.js')),
};
