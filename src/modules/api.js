"use strict";
import units from "../helper/units.js";
import completions from "../../completions/apis.json";

const propertyPrefixPattern = /(?:^|\[|\(|,|=|:|\s)\s*(React.(?:[a-zA-Z]+\.?){0,2})$/;

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

        for (let i = 0, len = propertyCompletions.length; i < len; i++) {
            _completions.push(units.clone(propertyCompletions[i]));
        }

        return _completions;
    }
};

export default API;
