'use strict';

import provider from "./provider";

const autocomplete = {
    activate: function(state) {},
    deactivate: function() {},
    serialize: function() {},
    getProvider: function() {
        return provider;
    }
};

export default autocomplete;
