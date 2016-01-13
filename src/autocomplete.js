'use strict';

import atomPackageDeps from 'atom-package-deps';
import provider from "./provider";

const autocomplete = {
    activate: function(state) {
        atomPackageDeps.install('language-javascript-jsx').then(() => {
            atom.notifications.addSuccess('Success', {
                detail: '\'language-javascript-jsx\' are installed success.',
                dismissable: false
            });
        });
    },
    deactivate: function() {},
    serialize: function() {},
    getProvider: function() {
        return provider;
    }
};

export default autocomplete;
