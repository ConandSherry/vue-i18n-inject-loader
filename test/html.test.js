const htmli18n = require("../language-html");
test("parse simple html", () => {
  expect(htmli18n(`<div><div></div></div>`)).toBe(`<div><div></div></div>`);
});
test("translate static content", () => {
  expect(htmli18n(`<div>中文</div>`)).toBe(`<div>{{$t(\`中文\`)}}</div>`);
});
test("translate static content with line break", () => {
  expect(
    htmli18n(`<div>
      中文
      中文
    </div>`)
  ).toBe(`<div>
      {{$t(\`中文 中文\`)}}
    </div>`);
});
test("translate static content with escape", () => {
  expect(htmli18n(`<div>\`中文\`</div>`)).toBe(
    `<div>{{$t(\`\\\`中文\\\`\`)}}</div>`
  );
});
test("translate static attr", () => {
  expect(htmli18n(`<div pre-attr="中文"></div>`)).toBe(
    `<div :pre-attr="$t(\`中文\`)"></div>`
  );
});
test("translate attr with escape", () => {
  expect(htmli18n(`<div attr="\`中文\`"></div>`)).toBe(
    `<div :attr="$t(\`\\\`中文\\\`\`)"></div>`
  );
});
test("translate attr with namespace", () => {
  expect(
    htmli18n(`<svg aria-hidden="true"><use xlink:href="中文"></use></svg>`)
  ).toBe(
    `<svg aria-hidden="true"><use :xlink:href="$t(\`中文\`)"></use></svg>`
  );
});
test("translate directive with object", () => {
  expect(
    htmli18n(
      `<div v-drag="{ locations: '中文', hammertime: hammertime }"></div>`
    )
  ).toBe(`<div v-drag="{
  locations: $t('中文'),
  hammertime: hammertime
}"></div>`);
});
test("translate directive with filter", () => {
  expect(
    htmli18n(
      `<div :attr="'中文' | filterOne('str', arg,a+b) | filterTwo | filterThree(arg,arg)"></div>`
    )
  ).toBe(
    `<div :attr="$options.filters.filterThree($options.filters.filterTwo($options.filters.filterOne($t('中文'), 'str', arg, a + b)), arg, arg)"></div>`
  );
});
test("translate interpolation only", () => {
  expect(htmli18n(`<div>{{"中文"}}</div>`)).toBe(`<div>{{$t("中文")}}</div>`);
});
test("translate interpolation and static content", () => {
  expect(htmli18n(`<div>中文{{"中文"}}</div>`)).toBe(
    `<div>{{$t("中文{param0}", {
  param0: $t("中文")
})}}</div>`
  );
});
test("translate interpolation with escape", () => {
  expect(htmli18n(`<div>中文""{{arg}}</div>`))
    .toBe(`<div>{{$t("中文\\"\\"{param0}", {
  param0: arg
})}}</div>`);
});

test("don't translate interpolation with recursive $t", () => {
  expect(htmli18n(`<div>{{$t(\`中文\`)}}</div>`)).toBe(
    `<div>{{$t(\`中文\`)}}</div>`
  );
});
