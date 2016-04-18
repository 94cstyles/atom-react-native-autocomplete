"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _units = require("../helper/units.js");

var _units2 = _interopRequireDefault(_units);

var _apis = require("../../completions/apis.json");

var _apis2 = _interopRequireDefault(_apis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propertyPrefix = 'React',
    propertyPrefixPattern = /(?:^|\[|\(|,|=|:|\s)\s*((React|navigator.geolocation).(?:[a-zA-Z]+\.?){0,2})$/;

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

        if (segments[0] == propertyPrefix) {
            if (segments.length == 2) propertyCompletions = _apis2.default.React;
            for (var i = 0, len = propertyCompletions.length; i < len; i++) {
                _completions.push(_units2.default.clone(propertyCompletions[i]));
            }
        } else if (segments[0] === 'navigator') {
            return require('../../completions/navigator.json').geolocation;
        }

        return _completions;
    },
    setMatchRule: function setMatchRule(prefix) {
        propertyPrefix = prefix;
        propertyPrefixPattern = new RegExp('(?:^|\\[|\\(|,|=|:|\\s)\\s*((' + prefix + '|navigator.geolocation).(?:[a-zA-Z]+\\.?){0,2})$');
    }
};

exports.default = API;
module.exports = exports['default'];