const PluginName = require('./name');
const path = require('path');
const fs = require('fs');
const findCacheDir = require('find-cache-dir');
const getTranslationDict = async (i18nKeys, translateAsync) => {
  const langDict = {};
  console.time('Get Translation Dict');
  const result = await translateAsync(i18nKeys); // `result` is like: [ { key, cn, en } ]
  console.timeEnd('Get Translation Dict');

  result.forEach((item) => {
    Object.keys(item).forEach((lang) => {
      if (!langDict[lang]) {
        langDict[lang] = {};
      }
      langDict[lang][item.key] = item[lang];
    });
  });

  return langDict;
};

module.exports = class VueI18nInjectPlugin {
  constructor(options) {
    const { localePath, translateAsync } = options;
    this.options = { localePath, translateAsync };
  }

  apply(compiler) {
    const { localePath, translateAsync } = this.options;
    const i18nKeysInAll = [];

    compiler.hooks.compilation.tap(PluginName, (compilation) => {
      compilation.hooks.normalModuleLoader.tap(PluginName, (context, module) => {
        context[PluginName] = function (metadata) {
          const { i18nKeys } = metadata;
          i18nKeys.forEach((key) => !i18nKeysInAll.includes(key) && i18nKeysInAll.push(key)); // Avoid duplicate keys in `i18nKeysInAll`
        };
      });
    });

    compiler.hooks.make.tap(PluginName, (compilation) => {
      compilation.hooks.finishModules.tapAsync(PluginName, (modules, callback) => {
        if (!i18nKeysInAll.length) {
          callback();
          return;
        }

        getTranslationDict(i18nKeysInAll, translateAsync).then((langDict) => {
          const localeModules = modules.filter(
            ({ resource, context }) => resource && (context || '').includes(localePath)
          );
          localeModules.forEach(({ resource, buildInfo }) => {
            const fileName = path.basename(resource, '.json');
            const cacheDir = findCacheDir({ name: fileName });
            let cacheContent = {};
            if (fs.existsSync(cacheDir)) {
              cacheContent = JSON.parse(fs.readFileSync(cacheDir, 'utf-8'));
            }
            buildInfo.jsonData = Object.assign(buildInfo.jsonData, cacheContent, langDict[fileName]);
            fs.writeFileSync(cacheDir, JSON.stringify(buildInfo.jsonData), 'utf-8');
          });
          callback();
        });
      });
    });
  }
};
