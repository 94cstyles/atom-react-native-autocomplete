"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _units = require("../helper/units.js");

var _units2 = _interopRequireDefault(_units);

var _components = require("../../completions/components.json");

var _components2 = _interopRequireDefault(_components);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var trailingWhitespace = /\s$/;
var attributeInput = /^([a-zA-Z][-a-zA-Z]*)$/;
var attributePattern = /\s+([a-zA-Z][-a-zA-Z]*)\s*=\s*$/;
var tagInput = /^<([a-zA-Z][-a-zA-Z]*|$)/;
var tagNotInput = />([a-zA-Z][-a-zA-Z]*|$)/;
var tagPattern = /<(([a-zA-Z][-a-zA-Z]*)|TabBarIOS.Item)(?:\s|$)/; //TabBarIOS.Item是特殊的标签

var COMPONENT = {
    getTagNameCompletions: function getTagNameCompletions() {
        var _completions = [];
        _components2.default.tags.completions.forEach(function (obj) {
            _completions.push(_units2.default.clone(obj));
        });
        return _completions;
    },
    getAttributeNameCompletions: function getAttributeNameCompletions(editor, bufferPosition) {
        var _completions = [],
            tag = this.getPreviousTag(editor, bufferPosition);

        if (_components2.default.attributes[tag]) {
            _components2.default.attributes[tag].forEach(function (obj) {
                _completions.push(_units2.default.clone(obj));
            });
        }

        return _completions;
    },
    getAttributeValueCompletions: function getAttributeValueCompletions(line) {
        var _completions = [],
            attribute = this.getPreviousAttribute(line);

        if (_components2.default.values[attribute]) {
            _components2.default.values[attribute].forEach(function (text) {
                _completions.push({
                    "text": text,
                    "type": "value"
                });
            });
        }
        return _completions;
    },
    getPreviousTag: function getPreviousTag(editor, bufferPosition) {
        var ref;
        var row = bufferPosition.row;

        while (row >= 0) {
            ref = tagPattern.exec(editor.lineTextForBufferRow(row));
            if (ref) {
                return ref[1];
            }
            row--;
        }
        return null;
    },
    getPreviousAttribute: function getPreviousAttribute(line) {
        var ref, ref1;
        var quoteIndex = line.length - 1;

        while (line[quoteIndex] && !((ref = line[quoteIndex]) === '"' || ref === "'")) {
            quoteIndex--;
        }
        line = line.substring(0, quoteIndex);
        return (ref1 = attributePattern.exec(line)) != null ? ref1[1] : null;
    },
    isAttributeValue: function isAttributeValue(scopes) {
        return this.hasTagScope(scopes) && this.hasAttributeValueScope(scopes) && !this.hasAttributeContentScope(scopes);
    },
    isAttribute: function isAttribute(prefix, scopes) {
        if (!trailingWhitespace.test(prefix) && !attributeInput.test(prefix)) {
            return false;
        }
        return (this.hasTagScope(scopes) || this.hasAttributeScope(scopes)) && !this.hasAttributeContentScope(scopes);
    },
    isTag: function isTag(scopes, line) {
        var segment = line.split(' ').pop();

        return tagInput.test(segment) && !tagNotInput.test(segment) && !this.hasScopeDescriptor(scopes, ['string.quoted.double.jsx', 'string.quoted.single.jsx', 'string.quoted.double.js', 'string.quoted.single.js']) && !this.hasAttributeContentScope(scopes);
    },
    hasTagScope: function hasTagScope(scopes) {
        return this.hasScopeDescriptor(scopes, ['meta.scope.tag.block', 'meta.tag.block.begin.jsx', 'meta.tag.block.end.jsx', 'entity.name.tag.jsx', 'tag.open.js', 'punctuation.definition.tag.begin.js', 'punctuation.definition.tag.end.js']) && !this.hasScopeDescriptor(scopes, ['invalid.illegal.tag.end.jsx', 'tag.closed.js']);
    },
    hasAttributeScope: function hasAttributeScope(scopes) {
        return this.hasScopeDescriptor(scopes, ['entity.other.attribute-name.jsx', 'punctuation.separator.key-value.attribute.jsx']);
    },
    hasAttributeValueScope: function hasAttributeValueScope(scopes) {
        return this.hasScopeDescriptor(scopes, ['string.quoted.double.jsx', 'string.quoted.single.jsx', 'string.quoted.double.js', 'string.quoted.single.js']) && this.hasScopeDescriptor(scopes, ['meta.scope.inner', 'punctuation.definition.string.begin.jsx', 'punctuation.definition.string.end.jsx', 'punctuation.definition.string.begin.js', 'punctuation.definition.string.end.js']);
    },
    hasAttributeContentScope: function hasAttributeContentScope(scopes) {
        return this.hasScopeDescriptor(scopes, ['punctuation.section.embedded.begin.jsx', 'punctuation.section.embedded.end.jsx', 'punctuation.definition.brace.curly.begin.js', 'punctuation.definition.brace.curly.end.js', 'meta.brace.curly.js', 'meta.embedded.expression.jsx', /meta.embedded.expression.(\S*).jsx/]);
    },
    hasScopeDescriptor: function hasScopeDescriptor(fromScopes, toScopes) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = toScopes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var scope = _step.value;

                if (typeof scope === 'string') {
                    if (fromScopes.indexOf(scope) !== -1) {
                        return true;
                    }
                } else {
                    var pass = false;
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = fromScopes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var text = _step2.value;

                            if (scope.test(text)) {
                                pass = true;
                            }
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    if (pass) return true;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return false;
    }
};

exports.default = COMPONENT;
module.exports = exports['default'];