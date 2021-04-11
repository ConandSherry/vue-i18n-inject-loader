const { convertFilter, wrapWithTemplateLiteral } = require("./utils");
var languageJs = require("../language-js");

const hasChinese = /[\u4e00-\u9fa5]/;
function textI18n(node) {
  if (!hasChinese.test(node.value)) {
    return;
  }
  node.value = node.value.replace(
    node.value.trim(),
    `{{${languageJs(node.interpolationText).slice(0, -1)}}}`
  );
}
function attrI18n(node) {
  if (!hasChinese.test(node.value)) {
    return;
  }
  node.value = languageJs(wrapWithTemplateLiteral([node.value])).slice(0, -1);
  node.name = `:${node.name}`;
}
function dirI18n(node) {
  if (!hasChinese.test(node.value)) {
    return;
  }
  //todo 处理v-for in of 的语法
  const { value } = node;
  try {
    if (
      value.slice(0, 1) === "{" &&
      value.slice(-1) === "}" &&
      JSON.stringify(value) //todo 这个有问题
    ) {
      node.value = languageJs(convertFilter(`(${value})`))
        .slice(0, -1)
        .slice(1, -1);
    } else {
      throw "notObject";
    }
  } catch (error) {
    // console.log(error);
    node.value = languageJs(convertFilter(value)).slice(0, -1);
  }
}

function travserNode(node) {
  const handler = {
    text: textI18n,
    element: (node) => {
      node.attrs.forEach((attr) => {
        travserNode(attr);
      });
      node.children.forEach((node) => {
        travserNode(node);
      });
    },
    attribute: attrI18n,
    directive: dirI18n,
    comment: (node) => node,
  };
  handler[node.type](node);
}
function travserFunctionalNode(node) {
  const handler = {
    element: (node) => {
      node.attrs.forEach((attr) => {
        travserFunctionalNode(attr);
      });
      node.children.forEach((node) => {
        travserFunctionalNode(node);
      });
    },
    text: (node) => {
      if (!hasChinese.test(node.value)) {
        return;
      }
      // TODO using languageJs() instead of regular expression
      if (/parent\.\$t/.test(node.value)) {
        return;
      }
      node.value = node.value.replace(/\$t/, "parent.$t");
    },
  };
  const noop = () => {};
  (handler[node.type] || noop)(node);
}

module.exports = function init(node) {
  travserNode(node);
  node.isFunctional && travserFunctionalNode(node);
};
