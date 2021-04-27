const jsi18n = require('../language-js');

describe('Keep the type of string', () => {
  test('translate single quotes strings', () => {
    expect(jsi18n(`const str = '中文';`)).toBe(`const str = $t('中文');`);
  });
  test('translate single quotes strings with escape', () => {
    expect(jsi18n(`const str = '中\\\'\\\'文';`)).toBe(`const str = $t('中\\\'\\\'文');`);
  });

  test('translate double quotes strings', () => {
    expect(jsi18n(`const str = "中文";`)).toBe(`const str = $t("中文");`);
  });
  test('translate double quotes strings with escape', () => {
    expect(jsi18n(`const str = "中\\\"\\\"文";`)).toBe(`const str = $t("中\\\"\\\"文");`);
  });

  test('translate backtick strings', () => {
    expect(jsi18n(`const str = \`中文\`;`)).toBe(`const str = $t(\`中文\`);`);
  });
  test('translate backtick strings with escape', () => {
    expect(jsi18n(`const str = \`中\\\`\\\`文\`;`)).toBe(`const str = $t(\`中\\\`\\\`文\`);`);
  });
});

describe('Support detection of Chinese', () => {
  const useStrictString = `
function fn() {
  'use strict';
}`;
  test('do NOT translate use strict string', () => {
    expect(jsi18n(useStrictString.trim())).toBe(useStrictString.trim());
  });

  const stringWithEnglishTemplateLiterals = `
export function fooFn(dataurl) {
  -1 === dataurl.indexOf(',') && (dataurl = \`data:image/png;base64,\$\{dataurl\}\`);
}
`;
  test('do NOT translate template literals without Chinese', () => {
    expect(jsi18n(stringWithEnglishTemplateLiterals.trim())).toBe(stringWithEnglishTemplateLiterals.trim());
  });
});
