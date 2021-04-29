const { vueExpressionParse } = require('../../parse');

function isObjectString(str) {
  const { type } = vueExpressionParse(str);
  return type === 'ObjectExpression';
}

module.exports = {
  isObjectString,
};
