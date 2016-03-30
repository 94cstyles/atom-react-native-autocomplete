'use strict';

import provider from "./provider";

const packageName = 'atom-react-native-autocomplete';

const autocomplete = {
    config: {
        prefix: {
            title: 'Prefix parsing rules',
            description: 'AutoComplete feature the string parsing rules',
            type: 'string',
            "default": 'React',
            order: 10
        }
    },
    activate: function(state) {
        //监听配置变化
        atom.config.observe(packageName + '.prefix', provider.setPrefix);

        //安装依赖插件
        require('atom-package-deps').install('atom-react-native-autocomplete');
    },
    deactivate: function() {},
    serialize: function() {},
    getProvider: function() {
        return provider;
    }
};

export default autocomplete;
