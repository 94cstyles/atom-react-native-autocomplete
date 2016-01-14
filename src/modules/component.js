"use strict";
import units from "../helper/units.js";
import completions from "../../completions/components.json";

const trailingWhitespace = /\s$/;
const attributeInput = /^([a-zA-Z][-a-zA-Z]*)$/;
const attributePattern = /\s+([a-zA-Z][-a-zA-Z]*)\s*=\s*$/;
const tagInput = /^<([a-zA-Z][-a-zA-Z]*|$)/;
const tagNotInput = />([a-zA-Z][-a-zA-Z]*|$)/;
const tagPattern = /<(([a-zA-Z][-a-zA-Z]*)|TabBarIOS.Item)(?:\s|$)/; //TabBarIOS.Item是特殊的标签

var COMPONENT = {
    getTagNameCompletions: function() {
        let _completions = [];
        completions.tags.completions.forEach((obj) => {
            _completions.push(units.clone(obj));
        });
        return _completions;
    },
    getAttributeNameCompletions: function(editor, bufferPosition) {
        let _completions = [],
            tag = this.getPreviousTag(editor, bufferPosition);

        if (completions.attributes[tag]) {
            completions.attributes[tag].forEach((obj) => {
                _completions.push(units.clone(obj));
            });
        }

        return _completions;
    },
    getAttributeValueCompletions: function(line) {
        let _completions = [],
            attribute = this.getPreviousAttribute(line);

        if (completions.values[attribute]) {
            completions.values[attribute].forEach((text) => {
                _completions.push({
                    "text": text,
                    "type": "value"
                })
            });
        }
        return _completions;
    },
    getPreviousTag: function(editor, bufferPosition) {
        var ref;
        let row = bufferPosition.row;

        while (row >= 0) {
            ref = tagPattern.exec(editor.lineTextForBufferRow(row));
            if (ref) {
                return ref[1]
            }
            row--;
        }
        return null;
    },
    getPreviousAttribute: function(line) {
        var ref, ref1;
        let quoteIndex = line.length - 1;

        while (line[quoteIndex] && !((ref = line[quoteIndex]) === '"' || ref === "'")) {
            quoteIndex--;
        }
        line = line.substring(0, quoteIndex);
        return (ref1 = attributePattern.exec(line)) != null ? ref1[1] : null;
    },
    isAttributeValue: function(scopes) {
        return this.hasTagScope(scopes) && this.hasAttributeValueScope(scopes) && !this.hasAttributeContentScope(scopes);
    },
    isAttribute: function(prefix, scopes) {
        if (!trailingWhitespace.test(prefix) && !attributeInput.test(prefix)) {
            return false;
        }
        return (this.hasTagScope(scopes) || this.hasAttributeScope(scopes)) && !this.hasAttributeContentScope(scopes);
    },
    isTag: function(scopes, line) {
        let segment = line.split(' ').pop();

        return tagInput.test(segment) && !tagNotInput.test(segment) && !this.hasScopeDescriptor(scopes, [
            'string.quoted.double.jsx',
            'string.quoted.single.jsx',
            'string.quoted.double.js',
            'string.quoted.single.js'
        ]) && !this.hasAttributeContentScope(scopes);
    },
    hasTagScope: function(scopes) {
        return this.hasScopeDescriptor(scopes, [
            'meta.scope.tag.block',
            'meta.tag.block.begin.jsx',
            'meta.tag.block.end.jsx',
            'entity.name.tag.jsx',
            'tag.open.js',
            'punctuation.definition.tag.begin.js',
            'punctuation.definition.tag.end.js'
        ]) && !this.hasScopeDescriptor(scopes, [
            'invalid.illegal.tag.end.jsx',
            'tag.closed.js'
        ]);
    },
    hasAttributeScope: function(scopes) {
        return this.hasScopeDescriptor(scopes, [
            'entity.other.attribute-name.jsx',
            'punctuation.separator.key-value.attribute.jsx'
        ]);
    },
    hasAttributeValueScope: function(scopes) {
        return this.hasScopeDescriptor(scopes, [
            'string.quoted.double.jsx',
            'string.quoted.single.jsx',
            'string.quoted.double.js',
            'string.quoted.single.js'
        ]) && this.hasScopeDescriptor(scopes, [
            'meta.scope.inner',
            'punctuation.definition.string.begin.jsx',
            'punctuation.definition.string.end.jsx',
            'punctuation.definition.string.begin.js',
            'punctuation.definition.string.end.js'
        ]);
    },
    hasAttributeContentScope: function(scopes) {
        return this.hasScopeDescriptor(scopes, [
            'punctuation.section.embedded.begin.jsx',
            'punctuation.section.embedded.end.jsx',
            'punctuation.definition.brace.curly.begin.js',
            'punctuation.definition.brace.curly.end.js',
            'meta.brace.curly.js',
            'meta.embedded.expression.jsx',
            /meta.embedded.expression.(\S*).jsx/
        ]);
    },
    hasScopeDescriptor: function(fromScopes, toScopes) {
        for (let scope of toScopes) {
            if (typeof(scope) === 'string') {
                if (fromScopes.indexOf(scope) !== -1) {
                    return true;
                }
            } else {
                let pass = false
                for (let text of fromScopes) {
                    if (scope.test(text)) {
                        pass = true;
                    }
                }
                if (pass) return true;
            }
        }
        return false;
    }
};

export default COMPONENT;
