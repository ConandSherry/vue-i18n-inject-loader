function looseJsonParse(looseJsonStr, definitionStatements = "") {
  try {
    return Function(
      `"use strict";${definitionStatements}return (` + looseJsonStr + `)`
    )();
  } catch (error) {
    const matches = error.message.match(/^(.+) is not defined$/);
    return (
      matches &&
      looseJsonParse(
        looseJsonStr,
        `${definitionStatements}const ${matches[1]} = 'foo-val';`
      )
    );
  }
}

function isObjectString(str) {
  const obj = looseJsonParse(str);
  return (
    !!obj && Object.prototype.toString.call(obj) === Object.prototype.toString.call({})
  );
}

module.exports = {
  looseJsonParse,
  isObjectString,
};

/* Test Cases */
// const cases = [
//   // Object strings
//   `{ locations: '中文', hammertime: hammertime }`,
//   `{ locations: '中文', hammertime: hammertime, foo: bar }`,
//   `[a,b]`,
//   // NOT Object strings
//   `null`,
//   `var a = b`,
// ];
// cases.forEach((str) => {
//   console.log(
//     `[test] Is \`${str}\` an object ?`,
//     // looseJsonParse(str),
//     isObjectString(str)
//   );
// });
