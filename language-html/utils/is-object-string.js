const { vueExpressionParse } = require('../../parse');

function isObjectString(str) {
  try {
    const { type } = vueExpressionParse(str);
    return type === 'ObjectExpression';
  } catch (error) {
    // when str is v-for...of expression
    return false;
  }
}

module.exports = {
  isObjectString,
};
