const { vueExpressionParse } = require('../../parse');

const V_FOR_OF_STR = ' of ';
const V_FOR_OF_RE = / of /;
const V_FOR_IN_STR = ' in ';
const V_FOR_IN_RE = / in /;

const isVForOf = (vForOfValue) => {
  if (!V_FOR_OF_RE.test(vForOfValue)) {
    return false;
  }
  const [left, ...rights] = vForOfValue.split(V_FOR_OF_RE);
  return [left, rights.join(V_FOR_OF_STR)].every((seg) => {
    let ast;
    try {
      ast = vueExpressionParse(seg);
    } catch (error) {
    } finally {
      return ast;
    }
  });
};

const vForOfPreprocess = (val) => val.replace(V_FOR_OF_RE, V_FOR_IN_STR);

const vForOfPostprocess = (val) => val.replace(V_FOR_IN_RE, V_FOR_OF_STR);

module.exports = {
  isVForOf,
  vForOfPreprocess,
  vForOfPostprocess,
};
