const prettierJS = require('prettier/parser-babel');

function isObjectString(str) {
    const { type } = prettierJS.parsers['__vue_expression'].parse(str);
    return type === 'ObjectExpression';
}

module.exports = {
    isObjectString,
};
