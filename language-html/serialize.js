module.exports = function serialize(node) {
  const handler = {
    interpolation: (node) => node.value,
    text: (node) => node.value,
    comment: (node) => `<!--${node.value}-->`,
    element: (node) => {
      const firstAttr = node.attrs[0];
      const attrStr = firstAttr ? serialize(firstAttr) : "";
      const tagName = node.name + attrStr;

      if (node.isSelfClosing) {
        return `<${tagName}/>`;
      }

      return `<${tagName}>${
        node.firstChild ? serialize(node.firstChild) : ""
      }</${node.name}>`;
    },
    directive: attribute,
    attribute,
  };

  let str = handler[node.type](node);
  let { next } = node;

  // deal with sibling node
  while (!node.prev && next) {
    str += serialize(next);
    ({ next } = next);
  }

  return str;
};
function attribute(node) {
  // value will be "" when attr=""
  return node.value === null ? node.name : `${node.name}="${node.value}"`;
}
