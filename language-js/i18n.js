const { default: template } = require('@babel/template');
const { default: traverse } = require('@babel/traverse');
const { default: generate } = require('@babel/generator');
const { stringConcatenation } = require('./utils/string-concatenation');
const t = require('@babel/types');
const hasChinese = /[\u4e00-\u9fa5]/;
/**
 * todo 字符串相加合并为模板字符串
 * todo text解析模板都在js里面处理，在js里去合并?统一babel parse入口
 * todo 处理str 是html字符串的情况
 */
function prevent$tRecursive(fn) {
  return (path) => {
    if (path.parent && t.isCallExpression(path.parent) && t.isIdentifier(path.parent.callee, { name: '$t' })) {
      return;
    }
    fn(path);
  };
}
function translateSimpleLiteral(path) {
  const buildRequire = template(`$t(%%argumentContent%%)`);
  path.replaceWith(
    buildRequire({
      argumentContent: path.node,
    })
  );
}
const stringLiteralI18n = prevent$tRecursive((path) => {
  const { node } = path;
  if (!hasChinese.test(node.value)) {
    return;
  }
  translateSimpleLiteral(path);
});
const templateLiteralI18n = prevent$tRecursive((path) => {
  const { node } = path;

  //若模板字符串中的表达式存在，则提取出来，转为符合i18n格式的字符串
  if (node.expressions.length) {
    const includedExp = [];
    const stringContent = [...node.quasis, ...node.expressions]
      .sort((a, b) => a.start - b.start)
      .map((node) => {
        if (t.isTemplateElement(node)) {
          // raw是带转义符的字符串
          return node.value.raw;
        }
        includedExp.push(node);
        return `{param${includedExp.length - 1}}`;
      })
      .join('');

    if (!hasChinese.test(stringContent)) {
      return;
    }

    path.replaceWith(t.TemplateLiteral([t.templateElement({ raw: stringContent })], []));

    const properties = [];
    includedExp.forEach((exp, index) => {
      properties.push(t.objectProperty(t.identifier(`param${index}`), exp));
    });
    const buildRequire = template(`$t(%%argumentContent%%,%%params%%)`);
    path.replaceWith(
      buildRequire({
        argumentContent: path.node,
        params: t.objectExpression(properties),
      })
    );
    return;
  } else {
    const quasisContent = node.quasis.map((node) => node.value.raw).join(''); // raw是带转义符的字符串
    if (!hasChinese.test(quasisContent)) {
      return;
    }
  }

  translateSimpleLiteral(path);
});
const directiveLiteralI18n = prevent$tRecursive((path) => {
  if (!hasChinese.test(path.node.value)) {
    return;
  }
  path.parent.type = 'ExpressionStatement';

  const { extra, value } = path.node;
  const stringLiteral = t.stringLiteral(value);
  stringLiteral.extra = extra; // Need extra property to determine type of quotation mark

  path.replaceWith(stringLiteral);
  translateSimpleLiteral(path);
  path.parent.type = 'Directive';
});

const jsxTextI18n = (path) => {
  if (!hasChinese.test(path.node.value)) {
    return;
  }
  const { value } = path.node;
  const templateLiteral = t.TemplateLiteral([t.templateElement({ raw: value.replace(/`/g, '\\`') })], []);
  path.replaceWith(t.jsxExpressionContainer(templateLiteral));
};

const jsxAttributeI18n = (path) => {
  const attrValueNode = path.node.value;
  if (hasChinese.test(attrValueNode.value) && t.isStringLiteral(attrValueNode)) {
    path.get('value').replaceWith(t.jsxExpressionContainer(attrValueNode));
    return;
  }
};

const handleTsTypeParameter = (path) => {
  path.node.name = path.node.name.name;
};

module.exports = function serialize(ast, noScope = false) {
  traverse(ast, {
    StringLiteral: stringLiteralI18n,
    DirectiveLiteral: directiveLiteralI18n,
    TemplateLiteral: templateLiteralI18n,
    JSXText: jsxTextI18n,
    JSXAttribute: jsxAttributeI18n,
    BinaryExpression: stringConcatenation,
    // Handle bad case
    TSTypeParameter: handleTsTypeParameter,
    noScope,
  });
  return generate(ast, {
    decoratorsBeforeExport: true, // todo better: needed by prettier, NOT SURE if needed by loader itself. So NEED to make sure in real projects...
    jsescOption: {
      minimal: true,
    },
  }).code;
};
