const { convertFilter } = require('./utils/convert-filter');
const { isObjectString } = require('./utils/is-object-string');
const { wrapWithTemplateLiteral } = require('./utils/wrap-with-template-literal');
const { isVForOf, vForOfPreprocess, vForOfPostprocess } = require('./utils/v-for-of');
const languageJs = require('../language-js');

function textI18n(node) {
  node.value = node.value.replace(node.value.trim(), `{{${languageJs(node.interpolationText).slice(0, -1)}}}`);
}
function attrI18n(node) {
  node.value = languageJs(wrapWithTemplateLiteral([node.value])).slice(0, -1);
  node.name = `:${node.name}`;
}
function dirI18n(node) {
  const { value } = node;
  try {
    if (isObjectString(value)) {
      node.value = languageJs(convertFilter(`(${value})`))
        .slice(0, -1)
        .slice(1, -1);
    } else {
      throw 'notObject';
    }
  } catch (error) {
    // console.log(error);

    const getDirI18nValOfNotObject = (val) => languageJs(convertFilter(val)).slice(0, -1);

    if (node.fullName === 'v-for') {
      const isVForOfVal = isVForOf(value);
      let newValue = isVForOfVal ? vForOfPreprocess(value) : value;
      newValue = getDirI18nValOfNotObject(newValue);
      newValue = isVForOfVal ? vForOfPostprocess(newValue) : newValue;

      node.value = newValue;
    } else {
      node.value = getDirI18nValOfNotObject(value);
    }
  }
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
    // todo better using languageJs() instead of regular expression
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
