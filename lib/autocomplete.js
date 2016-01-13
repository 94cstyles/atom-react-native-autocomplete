'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var autocomplete = {
    activate: function activate(state) {
        require('atom-package-deps').install('atom-react-native-autocomplete');
    },
    deactivate: function deactivate() {},
    serialize: function serialize() {},
    getProvider: function getProvider() {
        return _provider2.default;
    }
};

exports.default = autocomplete;
module.exports = exports['default'];