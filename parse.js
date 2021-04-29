const babel = require('prettier/parser-babel');
const html = require('prettier/parser-html');

module.exports = {
  jsParse: babel.parsers['babel-ts'].parse,
  vueExpressionParse: babel.parsers['__vue_expression'].parse,
  htmlParse: html.parsers.vue.parse,
};
