var units = {
    clone: function(obj) {
        var newObj = {};
        for (let key in obj) {
            newObj[key] = obj[key];
        }
        newObj.rightLabelHTML = 'react-native';
        return newObj;
    }
};

export default units;
