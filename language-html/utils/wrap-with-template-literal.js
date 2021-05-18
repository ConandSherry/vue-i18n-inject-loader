const { default: generate } = require('@babel/generator');
const t = require('@babel/types');
const { vueExpressionParse, jsParse } = require('../../parse');
const { convertFilter } = require('./convert-filter');

function generateCode(ast) {
  return generate(ast, { jsescOption: { minimal: true } }).code;
}

function wrapWithTemplateLiteral(quasis = [], expressions = []) {
  quasis = quasis.map((value) =>
    // raw是带转义符的字符串
    t.templateElement({ raw: value.replace(/`/g, '\\`') }, false)
  );
  expressions = expressions.map((value) => vueExpressionParse(value));
  return generateCode(t.templateLiteral(quasis, expressions));
}

function wrapInterpolationWithTemplateLiteral(quasis = [], expressions = []) {
  expressions = expressions
    .map((exp) => {
      const ast = jsParse(convertFilter(exp));
      // convert directiveLiteral to stringLiteral
      return ast.program.body[0]
        ? ast.program.body[0].expression
        : t.stringLiteral(ast.program.directives[0].value.value);
    })
    .map((newExpAST) => generateCode(newExpAST));

  return wrapWithTemplateLiteral(quasis, expressions);
}

module.exports = {
  wrapWithTemplateLiteral,
  wrapInterpolationWithTemplateLiteral,
};
