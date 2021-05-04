const { wrapWithTemplateLiteral } = require('./utils/wrap-with-template-literal');
const { isVForOf, vForOfPreprocess, vForOfPostprocess } = require('./utils/v-for-of');
const vueExpression = require('../language-js/vue-expression');

const throughPipes = (val, pipes) => pipes.reduce((v, pipe) => pipe(v), val);
const addArrayWrapper = (v) => `[${v}]`;
const removeArrayWrapper = (v) => v.slice(1, -1);
const DEFAULT_PIPES = [addArrayWrapper, vueExpression, removeArrayWrapper];

function textI18n(node) {
  const { interpolationText, value } = node;
  const newInterpolationText = throughPipes(interpolationText, DEFAULT_PIPES);
  node.value = value.replace(value.trim(), `{{${newInterpolationText}}}`);
}

function attrI18n(node) {
  const templateLiteral = wrapWithTemplateLiteral([node.value]);
  node.value = throughPipes(templateLiteral, DEFAULT_PIPES);
  node.name = `:${node.name}`;
}

function dirI18n(node) {
  const { value } = node;

  let pipes = DEFAULT_PIPES;

  if (node.fullName === 'v-for' && isVForOf(value)) {
    pipes = [vForOfPreprocess, vueExpression, vForOfPostprocess];
  }

  node.value = throughPipes(value, pipes);
}

function travserNode(node) {
  const handler = {
    text: hasChinese(textI18n),
    element: (node) => {
      node.attrs.forEach((attr) => {
        travserNode(attr);
      });
      node.children.forEach((node) => {
        travserNode(node);
      });
    },
    attribute: hasChinese(attrI18n),
    directive: hasChinese(dirI18n),
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
    // todo better using vueExpression() instead of regular expression
    const hasChinese = /[\u4e00-\u9fa5]/;
    if (hasChinese.test(nodeValue) && /\$t/.test(nodeValue) && !/parent\.\$t/.test(nodeValue)) {
      node.value = nodeValue.replace(/\$t/, 'parent.$t');
    }
  });
}

module.exports = function init(node) {
  travserNode(node);
  travserFunctionalNode(node);
};
function hasChinese(fn) {
  return function (node) {
    if (!/[\u4e00-\u9fa5]/.test(node.value)) {
      return;
    }
    fn(node);
  };
}
