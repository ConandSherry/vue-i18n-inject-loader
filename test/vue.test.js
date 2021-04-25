const vueI18n = require('../language-vue');

describe('Support detection of Chinese', () => {
  const stringWithEnglishTemplateLiterals = `
<script>export default {
  async created() {
    this.qrImgSrc = await this.$qHttp.getImgSrc(this.curAction === "auth" ? \`/person/face/h5/qr\` : "/face/sign/weapp/qr");
    this.interval = setInterval(async () => {
      await this.$qHttp.get(this.curAction === "auth" ? \`/person/detail\` : "/face/sign/info");
    }, 2000);
  }

};</script>
`;

  test('do NOT translate template literals without Chinese', () => {
    expect(vueI18n(stringWithEnglishTemplateLiterals.trim())).toBe(stringWithEnglishTemplateLiterals.trim());
  });
});
