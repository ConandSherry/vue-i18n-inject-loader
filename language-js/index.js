const prettierJS = require("prettier/parser-babel");
const serialize = require("./i18n");
module.exports = function (jsStr) {
  const ast = prettierJS.parsers["babel-ts"].parse(jsStr);
  return serialize(ast);
};
