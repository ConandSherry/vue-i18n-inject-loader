const htmli18n = require('../language-html');

describe('Support simple interpolations', () => {
  test('parse simple html', () => {
    expect(htmli18n(`<div><div></div></div>`)).toBe(`<div><div></div></div>`);
  });
  test('translate static content', () => {
    expect(htmli18n(`<div>中文</div>`)).toBe(`<div>{{$t(\`中文\`)}}</div>`);
  });
  test('translate static content with line break', () => {
    expect(
      htmli18n(`<div>
      中文
      中文
    </div>`)
    ).toBe(`<div>
      {{$t(\`中文 中文\`)}}
    </div>`);
  });
  test('translate static content with escape', () => {
    expect(htmli18n(`<div>\`中文\`</div>`)).toBe(`<div>{{$t(\`\\\`中文\\\`\`)}}</div>`);
  });
});

describe('Support attributes', () => {
  test('translate static attr', () => {
    expect(htmli18n(`<div pre-attr="中文"></div>`)).toBe(`<div :pre-attr="$t(\`中文\`)"></div>`);
  });
  test('translate attr with escape', () => {
    expect(htmli18n(`<div attr="\`中文\`"></div>`)).toBe(`<div :attr="$t(\`\\\`中文\\\`\`)"></div>`);
  });
  test('translate attr with namespace', () => {
    expect(htmli18n(`<svg aria-hidden="true"><use xlink:href="中文"></use></svg>`)).toBe(
      `<svg aria-hidden="true"><use :xlink:href="$t(\`中文\`)"></use></svg>`
    );
  });
});

describe('Support directives', () => {
  test('translate directive with object', () => {
    expect(htmli18n(`<div v-drag="{ locations: '中文', hammertime: hammertime }"></div>`)).toBe(`<div v-drag="{
  locations: $t('中文'),
  hammertime: hammertime
}"></div>`);
  });
  test('translate directive with filter', () => {
    expect(htmli18n(`<div :attr="'中文' | filterOne('str', arg,a+b) | filterTwo | filterThree(arg,arg)"></div>`)).toBe(
      `<div :attr="$options.filters.filterThree($options.filters.filterTwo($options.filters.filterOne($t('中文'), 'str', arg, a + b)), arg, arg)"></div>`
    );
  });
});

describe('Support complex interpolations', () => {
  test('translate interpolation only', () => {
    expect(htmli18n(`<div>{{"中文"}}</div>`)).toBe(`<div>{{$t("中文")}}</div>`);
  });

  test('translate interpolation and static content', () => {
    expect(htmli18n(`<div>中文1{{"中文2"}}</div>`)).toBe(
      `<div>{{$t(\`中文1{param0}\`, {
  param0: $t("中文2")
})}}</div>`
    );
  });

  test('do NOT translate interpolation with recursive $t', () => {
    expect(htmli18n(`<div>{{$t(\`中文\`)}}</div>`)).toBe(`<div>{{$t(\`中文\`)}}</div>`);
  });
});

describe('Support functional component', () => {
  test('translate interpolation inside functional component', () => {
    expect(htmli18n(`中文`, true)).toBe(`{{parent.$t(\`中文\`)}}`);
  });
  test('translate interpolation inside child components of functional component', () => {
    expect(htmli18n(`<button>中文</button>`, true)).toBe(`<button>{{parent.$t(\`中文\`)}}</button>`);
  });
  test('translate static attr inside child components of functional component', () => {
    expect(htmli18n(`<button text="中文"></button>`, true)).toBe(`<button :text="parent.$t(\`中文\`)"></button>`);
  });
});

describe('Support v-for-in and v-for-of', () => {
  test('translate interpolation inside a v-for-in loop', () => {
    expect(htmli18n(`<div v-for="(item, index) in ['中文1', '中文2']"></div>`)).toBe(
      `<div v-for="(item, index) in [$t('中文1'), $t('中文2')]"></div>`
    );
  });
  test('translate interpolation inside a v-for-in loop, including ` in `', () => {
    expect(htmli18n(`<div v-for="(item, index) in ['中文1 in 中文3', '中文2']"></div>`)).toBe(
      `<div v-for="(item, index) in [$t('中文1 in 中文3'), $t('中文2')]"></div>`
    );
  });
  test('translate interpolation inside a v-for-in loop, including ` of `', () => {
    expect(htmli18n(`<div v-for="(item, index) in ['中文1 of 中文3', '中文2']"></div>`)).toBe(
      `<div v-for="(item, index) in [$t('中文1 of 中文3'), $t('中文2')]"></div>`
    );
  });
  test('translate interpolation inside a v-for-of loop', () => {
    expect(htmli18n(`<div v-for="(item, index) of ['中文1', '中文2']"></div>`)).toBe(
      `<div v-for="(item, index) of [$t('中文1'), $t('中文2')]"></div>`
    );
  });
  test('translate interpolation inside a v-for-of loop, including ` in `', () => {
    expect(htmli18n(`<div v-for="(item, index) of ['中文1 in 中文3', '中文2']"></div>`)).toBe(
      `<div v-for="(item, index) of [$t('中文1 in 中文3'), $t('中文2')]"></div>`
    );
  });
  test('translate interpolation inside a v-for-of loop, including ` of `', () => {
    expect(htmli18n(`<div v-for="(item, index) of ['中文1 of 中文3', '中文2']"></div>`)).toBe(
      `<div v-for="(item, index) of [$t('中文1 of 中文3'), $t('中文2')]"></div>`
    );
  });
});
