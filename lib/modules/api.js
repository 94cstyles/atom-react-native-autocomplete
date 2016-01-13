"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _units = require("../helper/units.js");

var _units2 = _interopRequireDefault(_units);

var _apis = require("../../completions/apis.json");

var _apis2 = _interopRequireDefault(_apis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propertyPrefixPattern = /(?:^|\[|\(|,|=|:|\s)\s*(React.(?:[a-zA-Z]+\.?){0,2})$/;

var API = {
    getCompletions: function getCompletions(line) {
        var ref, ref1;
        var _completions = [],
            match = (ref = propertyPrefixPattern.exec(line)) !== null ? ref[1] : null;

        if (!match) {
            return _completions;
        }
        var segments = match.split('.'),
            propertyCompletions = (ref1 = _apis2.default[segments[segments.length - 2]]) != null ? ref1 : [];

        for (var i = 0, len = propertyCompletions.length; i < len; i++) {
            _completions.push(_units2.default.clone(propertyCompletions[i]));
        }

        return _completions;
    }
};

exports.default = API;
module.exports = exports['default'];