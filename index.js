const path = require('path');
const loaderUtils = require('loader-utils');
const injectI18n = require('./inject-i18n');

module.exports = function (source) {
  const options = loaderUtils.getOptions(this);
  const { excludeReList = [] } = options;

  if (excludeReList.map((reStr) => new RegExp(reStr)).some((re) => re.test(this.resourcePath))) {
    return source;
  }

  const extname = path.extname(this.resourcePath).slice(1);
  return injectI18n.call(this, { content: source, extname });
};
