const { default: generate } = require('@babel/generator');
const { convertFilter } = require('./convert-filter');
const t = require('@babel/types');
const prettierJS = require('prettier/parser-babel');
module.exports = {
  wrapWithTemplateLiteral(quasis = [], expressions = []) {
    quasis = quasis.map((value) =>
      // raw是带转义符的字符串 cooked是转义过的字符串
      t.templateElement({ raw: value.replace(/`/g, '\\`') }, false)
    );
    expressions = expressions.map((value) => {
      const ast = prettierJS.parsers['babel-ts'].parse(convertFilter(value));
      if (ast.program.body[0]) {
        return ast.program.body[0].expression;
      }
      // convert directiveLiteral to stringLiteral
      return t.stringLiteral(ast.program.directives[0].value.value);
    });
    return generate(t.templateLiteral(quasis, expressions), {
      jsescOption: {
        minimal: true,
      },
    }).code;
  },
};
