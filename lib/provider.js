"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _api = require("./modules/api.js");

var _api2 = _interopRequireDefault(_api);

var _component = require("./modules/component.js");

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var provider = {
    selector: '.source.js, .source.jsx',
    filterSuggestions: true,
    getSuggestions: function getSuggestions(request) {
        var prefix = request.prefix,
            bufferPosition = request.bufferPosition,
            editor = request.editor,
            scopes = request.scopeDescriptor.getScopesArray(),
            line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);

        if (_component2.default.isAttributeValue(scopes)) {
            return _component2.default.getAttributeValueCompletions(line);
        } else if (_component2.default.isTag(scopes, line)) {
            return _component2.default.getTagNameCompletions();
        } else if (_component2.default.isAttribute(prefix, scopes)) {
            return _component2.default.getAttributeNameCompletions(editor, bufferPosition);
        } else {
            return _api2.default.getCompletions(line);
        }
    },
    onDidInsertSuggestion: function onDidInsertSuggestion(request) {
        if (request.suggestion.rightLabelHTML === 'react-native' && request.suggestion.type === 'attribute') {
            setTimeout(function () {
                atom.commands.dispatch(atom.views.getView(request.editor), 'autocomplete-plus:activate', {
                    activatedManually: false
                });
            }, 1);
        }
    }
};

exports.default = provider;
module.exports = exports['default'];