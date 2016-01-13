'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var units = {
    clone: function clone(obj) {
        var newObj = {};
        for (var key in obj) {
            newObj[key] = obj[key];
        }
        newObj.rightLabelHTML = 'react-native';
        return newObj;
    }
};

exports.default = units;
module.exports = exports['default'];