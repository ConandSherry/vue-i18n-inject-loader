const { jsParse: jsParse } = require('../parse');

const serialize = require('./i18n');
module.exports = function (jsStr) {
  const ast = jsParse(jsStr);
  return serialize(ast);
};
