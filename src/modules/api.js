"use strict";
import units from "../helper/units.js";
import completions from "../../completions/apis.json";

var propertyPrefix = 'React',
    propertyPrefixPattern = /(?:^|\[|\(|,|=|:|\s)\s*((React|navigator.geolocation).(?:[a-zA-Z]+\.?){0,2})$/;

var API = {
    getCompletions: function(line) {
        var ref, ref1;
        let _completions = [],
            match = (ref = propertyPrefixPattern.exec(line)) !== null ? ref[1] : null;

        if (!match) {
            return _completions;
        }

        let segments = match.split('.'),
            propertyCompletions = (ref1 = completions[segments[segments.length - 2]]) != null ? ref1 : [];

        if (segments[0] == propertyPrefix) {
            if (segments.length == 2) propertyCompletions = completions.React;
            for (let i = 0, len = propertyCompletions.length; i < len; i++) {
                _completions.push(units.clone(propertyCompletions[i]));
            }
        } else if (segments[0] === 'navigator') {
            return require('../../completions/navigator.json').geolocation;
        }

        return _completions;
    },
    setMatchRule: function(prefix) {
        propertyPrefix = prefix;
        propertyPrefixPattern = new RegExp('(?:^|\\[|\\(|,|=|:|\\s)\\s*((' + prefix + '|navigator.geolocation).(?:[a-zA-Z]+\\.?){0,2})$');
    }
};

export default API;
