const dirRE = /^v-|^@|^:/;
const { wrapWithTemplateLiteral } = require('./utils');

const PREPROCESS_PIPELINE = [
  isSelfClosing,
  isDirective,
  isFunctional,
  dealAttrNamespace,
  injectAttrSpace,
  extractInterpolation,
];
module.exports = function (ast) {
  for (const fn of PREPROCESS_PIPELINE) {
    ast = fn(ast);
  }
  return ast;
};
/**
 * @example <use xlink:href=""></use>
 * */
function dealAttrNamespace(ast) {
  return ast.map((node) => {
    if (node.type === 'attribute') {
      node.name = node.namespace ? `${node.namespace}:${node.name}` : node.name;
    }
    return node;
  });
}
function extractInterpolation(ast) {
  const interpolationRegex = /{{([\S\s]+?)}}/g;
  return ast.map((node) => {
    if (!node.children) {
      return node;
    }

    const newChildren = [];

    for (const child of node.children) {
      if (child.type !== 'text') {
        newChildren.push(child);
        continue;
      }

      const quasis = [],
        expressions = [];

      child.value
        .replace(/\n +/g, ' ') //deal with line break
        .trim()
        .split(interpolationRegex)
        .forEach((value, i) => {
          if (i % 2 === 0) {
            quasis.push(value);
          } else {
            expressions.push(value);
          }
        });
      if (quasis.length === 2 && quasis.every((quasis) => !quasis.trim())) {
        /**
         * prevent interpolation with recursive templateLiteral in some cases
         * */
        child.interpolationText = expressions[0];
      } else {
        child.interpolationText = wrapWithTemplateLiteral(quasis, expressions);
      }
      newChildren.push(child);
    }

    return node.clone({ children: newChildren });
  });
}

function isSelfClosing(ast) {
  return ast.map((node) =>
    Object.assign(node, {
      isSelfClosing:
        !node.children ||
        (node.type === 'element' && (node.tagDefinition.isVoid || node.startSourceSpan === node.endSourceSpan)),
    })
  );
}
function isDirective(ast) {
  return ast.map((node) => {
    if (node.type === 'attribute') {
      if (dirRE.test(node.name)) {
        node.type = 'directive';
      }
    }
    return node;
  });
}
function isFunctional(ast) {
  const rootNode = ast;
  if (rootNode.attrs && rootNode.attrs.some(({ name }) => name === 'functional')) {
    Object.assign(ast, {
      isFunctional: true,
    });
  }
  return ast;
}
function injectAttrSpace(ast) {
  return ast.map((node) => {
    if (node.type !== 'element') {
      return node;
    }
    const newAttrs = [];
    const { attrs } = node;
    for (let index = 0; index < attrs.length; index++) {
      newAttrs.push({
        name: ' ',
        value: null,
        type: 'attribute',
      });
      newAttrs.push(attrs[index]);
    }

    newAttrs.push({
      name: '',
      value: null,
      type: 'attribute',
    });
    return node.clone({
      attrs: newAttrs,
    });
  });
}
