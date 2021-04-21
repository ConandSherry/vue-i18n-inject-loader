const compiler = require("vue-template-compiler");
const languageJs = require("../language-js");
const languageHtml = require("../language-html");

module.exports = function (file) {
  let parse = compiler.parseComponent(file);

  if (parse.template) {
    file =
      file.slice(0, parse.template.start) +
      languageHtml(parse.template.content, parse.template.attrs.functional) +
      file.slice(parse.template.end);
  }
  parse = compiler.parseComponent(file);
  if (parse.script) {
    file =
      file.slice(0, parse.script.start) +
      languageJs(parse.script.content) +
      file.slice(parse.script.end);
  }
  return file;
};
