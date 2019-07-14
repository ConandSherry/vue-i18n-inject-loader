const parse5 = require('parse5');
const he = require('he');
const { parseText } = require('../vue-utils/parseText');
const { parseFilters } = require('../vue-utils/parseFilters');
const dirRE = /^v-|^@|^:/;
const vuejsi18n = require('./vuejsi18n');

const hasChinese = /[\u4e00-\u9fa5]/;

module.exports = vuetemplatei18n;

function vuetemplatei18n(templateContent) {
    const ast = parse5.parse(templateContent, {
        sourceCodeLocationInfo: true
    });
    let nodeList = [];
    let transformedContent = '';
    analysisAst(ast, nodeList);
    nodeList
        .sort((before, after) => before.start - after.start)
        .map((node, i) => {
            let originString = templateContent.slice(node.start, node.end);
            let transformedString = '';
            if (node.type == 'text') {
                let hasToken = !!parseText(originString);
                if (hasToken) {
                    let { tokens } = parseText(originString);
                    tokens.map((token, i) => {
                        let tokenTransformed = '';
                        if (token.type == 'static') {
                            token.binding = token.binding.replace(/^\s{1,}/g, '');
                            token.start = token.end - token.binding.length;
                            token.binding = token.binding.replace(/\s{1,}$/g, '');
                            token.end = token.start + token.binding.length;
                            if (isEmpty(token.binding) || !hasChinese.test(token.binding)) {
                                tokenTransformed = token.binding;
                            } else {
                                tokenTransformed = `{{$t('${token.binding}')}}`;
                            }
                        } else {
                            tokenTransformed = originString
                                .slice(token.start, token.end)
                                .replace(token.binding, vuejsi18n(token.binding));
                        }
                        let preToken = tokens[i - 1] || {
                            end: 0
                        };
                        transformedString += `${originString.slice(preToken.end, token.start)}${tokenTransformed}`;
                        if (i == tokens.length - 1) {
                            transformedString += originString.slice(token.end);
                        }
                    });
                } else {
                    if (hasChinese.test(originString)) {
                        originString = originString.replace(/^\s{1,}/g, '');
                        node.start = node.end - originString.length;
                        originString = originString.replace(/\s{1,}$/g, '');
                        node.end = node.start + originString.length;
                        transformedString = `{{$t('${originString}')}}`;
                    } else {
                        transformedString = originString;
                    }
                }
            }
            if (node.type == 'directive') {
                let value = parseFilters(originString.slice(originString.indexOf('=') + 2, -1));
                transformedString = originString.replace(value, vuejsi18n(value));
            }
            if (node.type == 'attr') {
                let value = originString.slice(originString.indexOf('=') + 2, -1);
                if (hasChinese.test(value)) {
                    transformedString = `:${originString.replace(value, `$t('${value}')`)}`;
                } else {
                    transformedString = originString;
                }
            }
            let preNode = nodeList[i - 1] || {
                end: 0
            };
            transformedContent += `${templateContent.slice(preNode.end, node.start)}${transformedString}`;
            if (i == nodeList.length - 1) {
                transformedContent += templateContent.slice(node.end);
            }
        });
    transformedContent = transformedContent || templateContent;
    return transformedContent;
}

function isEmpty(value) {
    return !he.decode(value).trim();
}

function analysisAst(ast, nodeList) {
    ast.attrs &&
        ast.attrs.map(attr => {
            if (isEmpty(attr.value)) {
                return;
            }
            let type = dirRE.test(attr.name) ? 'directive' : 'attr';
            let attrIndex = attr.name;

            // deal template like this <use xlink: href="中文"></use>
            if (attr.prefix) {
                attrIndex = attr.prefix + ':' + attrIndex;
            }
            nodeList.push({
                start: ast.sourceCodeLocation.attrs[attrIndex].startOffset,
                end: ast.sourceCodeLocation.attrs[attrIndex].endOffset,
                type
            });
        });
    if (ast.nodeName == '#text') {
        if (isEmpty(ast.value)) {
            return;
        }
        nodeList.push({
            start: ast.sourceCodeLocation.startOffset,
            end: ast.sourceCodeLocation.endOffset,
            type: 'text'
        });
    }
    ast.childNodes &&
        ast.childNodes.map(childNode => {
            analysisAst(childNode, nodeList);
        });
    ast.content &&
        ast.content.childNodes.map(childNode => {
            analysisAst(childNode, nodeList);
        });
}
