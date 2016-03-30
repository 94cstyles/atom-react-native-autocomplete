'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var packageName = 'atom-react-native-autocomplete';

var autocomplete = {
    config: {
        prefix: {
            title: 'Prefix parsing rules',
            description: 'AutoComplete feature the string parsing rules',
            type: 'string',
            "default": 'React',
            order: 10
        }
    },
    activate: function activate(state) {
        //监听配置变化
        atom.config.observe(packageName + '.prefix', _provider2.default.setPrefix);

        //安装依赖插件
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