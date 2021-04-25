const jsi18n = require('../language-js');

describe('Support detection of Chinese', () => {
  const stringWithEnglishTemplateLiterals = `
export function fooFn(dataurl) {
  -1 === dataurl.indexOf(',') && (dataurl = \`data:image/png;base64,\$\{dataurl\}\`);
}
`;

  test('do NOT translate template literals without Chinese', () => {
    expect(jsi18n(stringWithEnglishTemplateLiterals.trim())).toBe(stringWithEnglishTemplateLiterals.trim());
  });
});
