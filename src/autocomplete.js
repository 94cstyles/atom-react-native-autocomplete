'use strict';

import provider from "./provider";

const autocomplete = {
    activate: function(state) {
        require('atom-package-deps').install('atom-react-native-autocomplete');
    },
    deactivate: function() {},
    serialize: function() {},
    getProvider: function() {
        return provider;
    }
};

export default autocomplete;
