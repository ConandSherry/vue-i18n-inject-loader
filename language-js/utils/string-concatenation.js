const t = require('@babel/types');
const hasChinese = /[\u4e00-\u9fa5]/;
function isPlusExpression(node) {
  return node.type === 'BinaryExpression' && node.operator === '+';
}
function isLiteral(node) {
  return t.isTemplateLiteral(node) || t.isStringLiteral(node);
}
function needTranslate(node) {
  if (t.isStringLiteral(node)) {
    return hasChinese.test(node.value);
  }
  return node.quasis.some(({ value: { raw } }) => {
    return hasChinese.test(raw);
  });
}
const stringConcatenation = (path) => {
  const { node } = path;
  if (!isPlusExpression(node)) {
    return;
  }
  const plusExpr = flattenPlusExpression(node);

  if (plusExpr.operands.filter(isLiteral).some(needTranslate)) {
    const literal = splitQuasisAndExpressions(plusExpr.operands);
    path.replaceWith(t.templateLiteral(...literal));
  }
};

function splitQuasisAndExpressions(operands) {
  const literalTokens = [];
  if (!isLiteral(operands[0])) {
    literalTokens.push(t.templateElement({ raw: '' }));
  }
  for (let i = 0; i < operands.length; i++) {
    const node = operands[i];
    if (isLiteral(node)) {
      if (t.isStringLiteral(node)) {
        literalTokens.push(
          t.templateElement({
            raw: escapeForTemplate(node.extra.raw),
          })
        );
      } else {
        literalTokens.push(node.quasis.shift());
        while (node.expressions.length) {
          literalTokens.push(node.expressions.shift());
          literalTokens.push(node.quasis.shift());
        }
      }
    } else {
      literalTokens.push(node);
      const nextNode = operands[i + 1];
      if (!isLiteral(nextNode || {})) {
        literalTokens.push(
          t.templateElement({
            raw: '',
          })
        );
      }
    }
  }
  const quasis = [],
    expressions = [];
  let i = 0;
  while (literalTokens.length) {
    const token = literalTokens.shift();
    token.start = i;
    i++;
    if (t.isTemplateElement(token)) {
      while (t.isTemplateElement(literalTokens[0])) {
        const nextNode = literalTokens.shift();
        token.value.raw += nextNode.value.raw;
        token.value.cooked += nextNode.value.cooked;
      }
      quasis.push(token);
    } else {
      expressions.push(token);
    }
  }
  return [quasis, expressions];
}

function flattenPlusExpression(node) {
  if (isPlusExpression(node)) {
    const left = flattenPlusExpression(node.left);
    const right = flattenPlusExpression(node.right);

    if (left.isString || right.isString) {
      return {
        operands: [left.operands, right.operands].flat(),
        isString: true,
      };
    } else {
      return {
        operands: [node],
        isString: false,
      };
    }
  } else {
    return {
      operands: [node],
      isString: isLiteral(node),
    };
  }
}
function escapeForTemplate(raw) {
  return raw
    .replace(/^['"]|['"]$/g, '')
    .replace(/`/g, '\\`')
    .replace(/\\(['"])/g, '$1');
}
module.exports = {
  stringConcatenation,
};
