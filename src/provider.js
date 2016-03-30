"use strict";
import API from "./modules/api.js";
import COMPONENT from "./modules/component.js";

const provider = {
    selector: '.source.js, .source.jsx',
    filterSuggestions: true,
    getSuggestions: function(request) {
        var prefix = request.prefix,
            bufferPosition = request.bufferPosition,
            editor = request.editor,
            scopes = request.scopeDescriptor.getScopesArray(),
            line = editor.getTextInRange([
                [bufferPosition.row, 0], bufferPosition
            ]);

        return new Promise(function(resolve) {
            var suggestion = null;

            if (COMPONENT.isAttributeValue(scopes)) {
                suggestion = COMPONENT.getAttributeValueCompletions(line);
            } else if (COMPONENT.isTag(scopes, line)) {
                suggestion = COMPONENT.getTagNameCompletions();
            } else if (COMPONENT.isAttribute(prefix, scopes)) {
                suggestion = COMPONENT.getAttributeNameCompletions(editor, bufferPosition);
            } else {
                suggestion = API.getCompletions(line);
            }
            resolve(suggestion);
        });
    },
    onDidInsertSuggestion: function(request) {
        if (request.suggestion.rightLabelHTML === 'react-native' && request.suggestion.type === 'attribute') {
            setTimeout(function() {
                atom.commands.dispatch(atom.views.getView(request.editor), 'autocomplete-plus:activate', {
                    activatedManually: false
                });
            }, 1);
        }
    },
    setPrefix: function(prefix) {
        API.setMatchRule(prefix);
    }
};

export default provider;
