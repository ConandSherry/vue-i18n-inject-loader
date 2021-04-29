const { htmlParse } = require('../parse');
const preprocess = require('./preprocess');
const serialize = require('./serialize');
const i18n = require('./i18n');
module.exports = function (htmlStr, isFunctional = false) {
  /**
   * wrap with template tag
   * otherwise may error in some case
   * <div><div></div></div>
   */
  const tplWrapper = isFunctional ? ['<template functional>', '</template>'] : ['<template>', '</template>'];
  htmlStr = tplWrapper.join(htmlStr);
  let { firstChild: astNode } = htmlParse(htmlStr, null, {
    filepath: 'htmlStr.html',
  });
  astNode = preprocess(astNode);
  i18n(astNode);
  return serialize(astNode).slice(tplWrapper[0].length, -tplWrapper[1].length);
};
