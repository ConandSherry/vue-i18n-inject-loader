let i18nKeys;

const initI18nKeys = () => (i18nKeys = []);
const addI18nKeys = (key) => i18nKeys && i18nKeys.push(key);
const getI18nKeys = () => i18nKeys.slice();

module.exports = {
  initI18nKeys,
  addI18nKeys,
  getI18nKeys,
};
