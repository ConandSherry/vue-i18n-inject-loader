const injectI18n = require('../inject-i18n');
const { initI18nKeys, getI18nKeys } = require('../utils/i18n-keys');

describe('Support collecting Chinese strings', () => {
  const sourceStr = `
<template>
  <div>
    <div>{{ flag ? \`中文1\${text}\` : '' }}</div>
    <span attr="中文2">中文3</span>
  </div>
</template>
`;
  const strsCollected = ['中文1{param0}', '中文2', '中文3'];

  test('Support collecting Chinese strings without $t', () => {
    initI18nKeys();
    injectI18n({ content: sourceStr.trim(), extname: 'vue' });
    expect(getI18nKeys()).toEqual(strsCollected);
  });
});
