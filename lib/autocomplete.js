'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _provider = require("./provider");

var _provider2 = _interopRequireDefault(_provider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var autocomplete = {
    activate: function activate(state) {},
    deactivate: function deactivate() {},
    serialize: function serialize() {},
    getProvider: function getProvider() {
        return _provider2.default;
    }
};

exports.default = autocomplete;
module.exports = exports['default'];