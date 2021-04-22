const vueTranslate = require('./language-vue');
const jsTranslate = require('./language-js');
module.exports = function (source) {
  if (
    // todo 添加配置项 排除特定目录
    this.resourcePath.includes('node_modules') &&
    !this.resourcePath.includes('@conandmobile')
  ) {
    return source;
  }

  const filePath = `./${path.relative(process.env.rootPath, this.resourcePath)}`.replace(/\\/g, '/');
  const extname = path.extname(filePath).slice(1);

  const supportTypes = {
    vue: vueTranslate,
    js: jsTranslate,
    ts: jsTranslate,
  };
  if (!supportTypes[extname]) {
    return source;
  }

  return supportTypes[extname](source);
};
