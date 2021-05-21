const jsi18n = require('../language-js');

describe('Support jsx', () => {
  test('translate static strings', () => {
    expect(jsi18n('const js = <span>中文</span>;')).toBe('const js = <span>{$t(`中文`)}</span>;');
  });
  test('translate backtick strings with escape', () => {
    expect(jsi18n('const js = <span>中`文</span>;')).toBe('const js = <span>{$t(`中\\`文`)}</span>;');
  });

  test('translate attributes', () => {
    expect(jsi18n('const js = <span attr="中文"></span>;')).toBe('const js = <span attr={$t("中文")}></span>;');
  });
});

describe('Support TypeScript', () => {
  const tsGenericStr = `class GenericNumber<NumType> {}`;
  test('support generics of ts', () => {
    expect(jsi18n(tsGenericStr.trim())).toBe(tsGenericStr.trim());
  });
});

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
  test('no translate with enum', () => {
    expect(
      jsi18n(`export enum Language {
  language = "中文",
}`)
    ).toBe(`export enum Language {
  language = "中文",
}`);
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

describe('Template string', () => {
  test('should not convert non-concatenated strings', () => {
    expect(jsi18n('const result = "test";')).toBe('const result = "test";');
  });

  test('should not convert non-string binary expressions with + operator', () => {
    expect(jsi18n('const result = 1 + 2;')).toBe('const result = 1 + 2;');
  });

  test('should not convert without Chinese', () => {
    expect(jsi18n('const result = "Hello " + " World!";')).toBe('const result = "Hello " + " World!";');
  });

  test('convert string with multi variables concatenation', () => {
    expect(jsi18n('const result = "中文: " + str1 + str2;')).toBe(`const result = $t(\`中文: {param0}{param1}\`, {
  param0: str1,
  param1: str2
});`);
  });

  test('should convert parenthized string concatenations', () => {
    expect(jsi18n('"中文 " + (x + " 中文");')).toBe(`$t(\`中文 {param0} 中文\`, {
  param0: x
});`);
  });

  test('should convert parenthized non-string concatenations', () => {
    expect(jsi18n('(x + y) + " 中文 " + (a + b);')).toBe(`$t(\`{param0} 中文 {param1}\`, {
  param0: x + y,
  param1: a + b
});`);
  });
});

describe('About keys of object property', () => {
  test('do NOT translate keys of object property', () => {
    const str = `const dict = {
  '中文': {}
};`;
    expect(jsi18n(str)).toBe(str);
  });
});
