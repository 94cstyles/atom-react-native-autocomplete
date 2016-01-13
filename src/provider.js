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

        if (COMPONENT.isAttributeValue(scopes)) {
            return COMPONENT.getAttributeValueCompletions(line);
        } else if (COMPONENT.isTag(scopes, line)) {
            return COMPONENT.getTagNameCompletions();
        } else if (COMPONENT.isAttribute(prefix, scopes)) {
            return COMPONENT.getAttributeNameCompletions(editor, bufferPosition);
        } else {
            return API.getCompletions(line);
        }
    },
    onDidInsertSuggestion: function(request) {
        if (request.suggestion.rightLabelHTML === 'react-native' && request.suggestion.type === 'attribute') {
            setTimeout(function() {
                atom.commands.dispatch(atom.views.getView(request.editor), 'autocomplete-plus:activate', {
                    activatedManually: false
                });
            }, 1);
        }
    }
};

export default provider;
