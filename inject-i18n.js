const vueTranslate = require('./language-vue');
const jsTranslate = require('./language-js');
const { initI18nKeys, getI18nKeys } = require('./utils/i18n-keys');
const PluginName = require('./plugin/name');

function wrapI18nKeysGen(fn) {
  initI18nKeys();

  const result = fn();

  const i18nKeys = getI18nKeys();
  if (i18nKeys.length > 0) {
    // Notify related plugin
    const pluginFn = this[PluginName];
    pluginFn && pluginFn({ i18nKeys });
  }

  return result;
}

function injectI18n({ content: source, extname }) {
  const processFn = {
    vue: vueTranslate,
    js: jsTranslate,
    ts: jsTranslate,
  }[extname];

  if (!processFn) {
    return source;
  }

  return wrapI18nKeysGen.call(this, () => processFn(source));
}

module.exports = injectI18n;
