const { default: template } = require('@babel/template');
const { default: traverse } = require('@babel/traverse');
const { default: generate } = require('@babel/generator');
const t = require('@babel/types');
const { jsParse } = require('../../parse');
function convertFilter(str) {
  const ast = jsParse(str);
  const filters = [];
  let leftNode = null;
  traverse(ast, {
    BinaryExpression(path) {
      let { node } = path;
      if (node.operator !== '|') {
        return;
      }
      leftNode = node.left;
      node = node.right;
      if (node.type === 'Identifier') {
        filters.push({
          name: node.name,
          args: [],
        });
      }
      if (node.type === 'CallExpression') {
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
    const buildRequire = template(`$options.filters.%%functionName%%(%%argumentContent%%)`);
    const ast = buildRequire({
      functionName: t.identifier(current.name),
      argumentContent: t.identifier(current.args.join(',')),
    });
    firstArguments = generate(ast).code.slice(0, -1);
  }
  return firstArguments;
}

module.exports = {
  convertFilter,
};
