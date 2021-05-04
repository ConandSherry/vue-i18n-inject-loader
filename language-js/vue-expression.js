const { vueExpressionParse } = require('../parse');

const serialize = require('./i18n');
module.exports = function (jsStr) {
  const ast = vueExpressionParse(jsStr);
  return serialize(ast, true);
};
