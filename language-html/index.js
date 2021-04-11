const prettierHtml = require("prettier/parser-html");
const preprocess = require("./preprocess");
const serialize = require("./serialize");
const i18n = require("./i18n");
module.exports = function (htmlStr) {
  /**
   * wrap with template tag
   * otherwise may error in some case
   * <div><div></div></div>
   */
  htmlStr = `<template>${htmlStr}</template>`;
  let { firstChild: astNode } = prettierHtml.parsers.vue.parse(htmlStr, null, {
    filepath: "htmlStr.html",
  });
  astNode = preprocess(astNode);
  i18n(astNode);
  return serialize(astNode).slice(10, -11);
};
