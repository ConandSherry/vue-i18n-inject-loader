const { vueExpressionParse } = require('../parse');
const addArrayWrapper = (v) => `[${v}]`;//support babel-traverse traverse root node
const removeArrayWrapper = (v) => v.slice(1, -1);
const i18n = require('./i18n');
const serialize = (v) => i18n(v, true);
const pipes = [addArrayWrapper, vueExpressionParse, serialize, removeArrayWrapper];
module.exports = function (jsStr) {
  return pipes.reduce((v, pipe) => pipe(v), jsStr);
};
