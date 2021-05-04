const { default: generate } = require('@babel/generator');
const t = require('@babel/types');
const { vueExpressionParse } = require('../../parse');

module.exports = {
  wrapWithTemplateLiteral(quasis = [], expressions = []) {
    quasis = quasis.map((value) =>
      // raw是带转义符的字符串 cooked是转义过的字符串
      t.templateElement({ raw: value.replace(/`/g, '\\`') }, false)
    );
    expressions = expressions.map((value) => vueExpressionParse(value));
    return generate(t.templateLiteral(quasis, expressions), {
      jsescOption: {
        minimal: true,
      },
    }).code;
  },
};
