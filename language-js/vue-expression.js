const { vueExpressionParse } = require('../parse');
const i18n = require('./i18n');

const addArrayWrapper = (v) => `[${v}]`; //support babel-traverse traverse root node
const removeArrayWrapper = (v) => v.slice(1, -1);
const serialize = (v) => i18n(v, true);

module.exports = function (jsStr) {
  const pipes = [addArrayWrapper, vueExpressionParse, serialize, removeArrayWrapper];
  return pipes.reduce((v, pipe) => pipe(v), jsStr);
};
