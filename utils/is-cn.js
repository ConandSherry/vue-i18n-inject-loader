const CN_RE = /[\u4e00-\u9fa5]/; // todo support configure it (instead of default value always)

const ensureChinese = (fn) => (node) => {
  if (!CN_RE.test(node.value)) {
    return;
  }
  fn(node);
};

module.exports = {
  CN_RE,
  ensureChinese,
};
