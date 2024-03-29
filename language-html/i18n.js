const { wrapWithTemplateLiteral } = require('./utils/wrap-with-template-literal');
const { isVForOf, vForOfPreprocess, vForOfPostprocess } = require('./utils/v-for-of');
const vueExpression = require('../language-js/vue-expression');
const { CN_RE, ensureChinese } = require('../utils/is-cn');

function textI18n(node) {
  const { interpolationText, value } = node;
  const newInterpolationText = vueExpression(interpolationText);
  node.value = value.replace(value.trim(), `{{${newInterpolationText}}}`);
}

function attrI18n(node) {
  const templateLiteral = wrapWithTemplateLiteral([node.value]);
  node.value = vueExpression(templateLiteral);
  node.name = `:${node.name}`;
}

function dirI18n(node) {
  const { value } = node;

  let pipes = [vueExpression];

  if (node.fullName === 'v-for' && isVForOf(value)) {
    pipes = [vForOfPreprocess, vueExpression, vForOfPostprocess];
  }

  node.value = pipes.reduce((v, pipe) => pipe(v), value);
}

function travserNode(node) {
  const handler = {
    text: ensureChinese(textI18n),
    element: (node) => {
      node.attrs.forEach((attr) => {
        travserNode(attr);
      });
      node.children.forEach((node) => {
        travserNode(node);
      });
    },
    attribute: ensureChinese(attrI18n),
    directive: ensureChinese(dirI18n),
    comment: (node) => node,
  };
  handler[node.type](node);
}
function travserFunctionalNode(functionalNode) {
  if (!functionalNode.isFunctional) {
    return;
  }

  // use `map()` like `forEach()`
  functionalNode.map((node) => {
    const { value: nodeValue } = node;
    // todo better: using vueExpression() instead of regular expression
    if (CN_RE.test(nodeValue) && /\$t/.test(nodeValue) && !/parent\.\$t/.test(nodeValue)) {
      node.value = nodeValue.replace(/\$t/, 'parent.$t');
    }
  });
}

module.exports = function init(node) {
  travserNode(node);
  travserFunctionalNode(node);
};
