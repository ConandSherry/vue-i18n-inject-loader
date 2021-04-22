const { default: template } = require('@babel/template');
const { default: traverse } = require('@babel/traverse');
const { default: generate } = require('@babel/generator');
const t = require('@babel/types');
const hasChinese = /[\u4e00-\u9fa5]/;
/**
 * todo 字符串相加合并为模板字符串
 * todo text解析模板都在js里面处理，在js里去合并?统一babel parse入口
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
  let includedExp = [];
  //若模板字符串中的表达式存在，则提取出来，转为符合i18n格式的字符串
  if (node.expressions.length) {
    const stringContent = []
      .concat(node.quasis)
      .concat(node.expressions)
      .sort((a, b) => a.start - b.start)
      .map((node) => {
        if (t.isTemplateElement(node)) {
          // raw是带转义符的字符串 cooked是转义过的字符串
          return node.value.cooked;
        }
        includedExp.push(node);
        return `{param${includedExp.length - 1}}`;
      })
      .reduce((str, value) => str + value);
    path.replaceWith(t.StringLiteral(stringContent));

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
  }
  translateSimpleLiteral(path);
});
const directiveLiteralI18n = prevent$tRecursive((path) => {
  path.parent.type = 'ExpressionStatement';
  path.replaceWith(t.stringLiteral(path.node.value));
  translateSimpleLiteral(path);
  path.parent.type = 'Directive';
});

module.exports = function serialize(ast) {
  traverse(ast, {
    StringLiteral: stringLiteralI18n,
    DirectiveLiteral: directiveLiteralI18n,
    TemplateLiteral: templateLiteralI18n,
  });
  return generate(ast, {
    jsescOption: {
      minimal: true,
    },
  }).code;
};
