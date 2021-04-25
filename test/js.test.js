const jsi18n = require('../language-js');

describe('Support detection of Chinese', () => {
  test('do NOT translate template literals without Chinese', () => {
    expect(
      jsi18n(
        `
export function fooFn(dataurl) {
  -1 === dataurl.indexOf(',') && (dataurl = \`data:image/png;base64,\$\{dataurl\}\`);
}
        `.trim()
      )
    ).toBe(
      `
export function fooFn(dataurl) {
  -1 === dataurl.indexOf(',') && (dataurl = \`data:image/png;base64,\$\{dataurl\}\`);
}
        `.trim()
    );
  });
});
