const { default: template } = require("@babel/template");
const { default: traverse } = require("@babel/traverse");
const { default: generate } = require("@babel/generator");
const t = require("@babel/types");
const prettierJS = require("prettier/parser-babel");

module.exports = {
  wrapWithTemplateLiteral(quasis = [], expressions = []) {
    quasis = quasis.map((value) =>
      // raw是带转义符的字符串 cooked是转义过的字符串
      t.templateElement({ raw: value.replace(/`/g, "\\`") }, false)
    );
    expressions = expressions.map((value) => {
      const ast = prettierJS.parsers["babel-ts"].parse(convertFilter(value));
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
  convertFilter,
};

function convertFilter(str) {
  const ast = prettierJS.parsers["babel-ts"].parse(str);
  const filters = [];
  let leftNode = null;
  traverse(ast, {
    BinaryExpression(path) {
      let { node } = path;
      if (node.operator !== "|") {
        return;
      }
      leftNode = node.left;
      node = node.right;
      if (node.type === "Identifier") {
        filters.push({
          name: node.name,
          args: [],
        });
      }
      if (node.type === "CallExpression") {
        const args = node.arguments.map((node) => generate(node).code);
        filters.push({
          name: node.callee.name,
          args,
        });
      }
    },
  });

  // no filter direct return
  if (!leftNode) {
    return str;
  }
  let firstArguments = generate(leftNode).code;
  while (filters.length) {
    const current = filters.pop();
    current.args.unshift(firstArguments);
    const buildRequire = template(
      `$options.filters.%%functionName%%(%%argumentContent%%)`
    );
    const ast = buildRequire({
      functionName: t.identifier(current.name),
      argumentContent: t.identifier(current.args.join(",")),
    });
    firstArguments = generate(ast).code.slice(0, -1);
  }
  return firstArguments;
}
