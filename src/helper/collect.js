"use strict";

import path from "path";
import fs from "fs";
import cheerio from "cheerio";
import request from "request";

const docsURL = 'http://facebook.github.io/react-native/docs/getting-started.html';
const separateTags = ['ActivityIndicatorIOS', 'DatePickerIOS', 'Image', 'ListView', 'MapView', 'Navigator', 'NavigatorIOS', 'ProgressBarAndroid', 'ProgressViewIOS', 'SegmentedControlIOS', 'SliderIOS', 'TextInput', 'ToolbarAndroid', 'WebView'];

/**
 * 从官网抓取apis和components文档
 * 最后输出至: ProjectDir/completions/[apis.json,components.json]
 */
var collect = {
    API: {
        "React": [{
            "text": "Platform",
            "type": "property",
            "rightLabelHTML": "react-native"
        }],
        "Platform": [{
            "text": "OS",
            "type": "property"
        }, {
            "text": "Version",
            "type": "property"
        }]
    },
    COMPONENT: {
        "tags": {
            "queue": [],
            "completions": []
        },
        "attributes": {},
        "values": {},
        "extend": {}
    },
    CLASS: {

    },
    cache: {
        API: {},
        COMPONENT: {},
        CLASS: {}
    },
    indent: 2,
    alphabetical(arr) {
        function _alphabetical(a, b) {
            var A = a.toLowerCase();
            var B = b.toLowerCase();
            if (A < B) {
                return -1;
            } else if (A > B) {
                return 1;
            } else {
                return 0;
            }
        };
        arr.sort(function(a, b) {
            if (typeof(a) === 'string') {
                return _alphabetical(a, b);
            } else {
                return _alphabetical(a.snippet || a.text, b.snippet || b.text);
            }
        });
        return arr;
    },
    extend(arrOne, arrTwo) {
        let arr = [].concat(arrOne, arrTwo),
            keyMap = {};

        for (let i = arr.length - 1; i >= 0; i--) {
            if (keyMap[arr[i].snippet]) {
                arr.splice(i, 1);
            } else {
                keyMap[arr[i].snippet] = true;
            }
        }

        return arr;
    },
    clone: function(obj) {
        var newObj = null;
        if (typeof(obj.length) === 'number') {
            newObj = [];
            for (let val of obj) {
                newObj.push(val);
            }
        } else {
            newObj = {};
            for (let key in obj) {
                if (!key.match(/(name|value)/)) {
                    newObj[key] = obj[key];
                }
            }
            newObj.rightLabelHTML = 'react-native';
        }
        return newObj;
    },
    createDir: function(dir) {
        let dirNames = dir.split(path.spe),
            dirPath = '';

        for (let i = 0; i < dirNames.length; i++) {
            dirPath = path.resolve(dirPath, dirNames[i]);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath); //创建目录
            }
        }
    },
    getOutputPath: function(type) {
        let filePath = path.resolve(__dirname, '../../completions/' + type + '.json');
        this.createDir(path.parse(filePath).dir);
        return filePath;
    },
    setExtendAttribute: function() {
        if (this.COMPONENT.extend) {
            for (let key in this.COMPONENT.extend) {
                for (let extendKey of this.COMPONENT.extend[key]) {
                    if (this.COMPONENT.attributes[extendKey]) {
                        this.COMPONENT.attributes[key] = this.alphabetical(this.extend(this.COMPONENT.attributes[key], this.COMPONENT.attributes[extendKey]));
                        this.COMPONENT.extend[key].splice(this.COMPONENT.extend[key].indexOf(extendKey), 1);
                    }
                }
                if (this.COMPONENT.extend[key].length === 0) {
                    delete this.COMPONENT.extend[key];
                }
            }
        }
    },
    getAPIS: function(content) {
        this.API.React.push(this.clone(content.attribute));
        this.API[content.attribute.name] = this.alphabetical(this.clone(content.completions))

        //排序
        this.alphabetical(this.API.React);
        return this.API;
    },
    getCOMPONENTS: function(content) {
        this.COMPONENT.tags.queue.push(content.attribute.name);
        this.COMPONENT.tags.completions.push(this.clone(content.attribute));
        this.COMPONENT.attributes[content.attribute.name] = [];
        this.COMPONENT.extend[content.attribute.name] = content.extend;

        content.completions.forEach((obj) => {
            if (typeof(obj.value) !== 'undefined') {
                if (this.COMPONENT.values[obj.name] && obj.value.length <= this.COMPONENT.values[obj.name].length) {
                    //解决value重复 取值最多的项
                    return false;
                }
                this.COMPONENT.values[obj.name] = this.alphabetical(obj.value);
            }
            this.COMPONENT.attributes[content.attribute.name].push(this.clone(obj));
        });
        this.setExtendAttribute();

        //排序
        this.alphabetical(this.COMPONENT.tags.queue);
        this.alphabetical(this.COMPONENT.tags.completions);
        return this.COMPONENT;
    },
    outputFile: function(type, content) {
        if (!content) return;
        content = typeof(content.length) === 'number' ? content : [content];

        for (let i = 0; i < content.length; i++) {
            let filePath = this.getOutputPath(type);
            content[i] = this['get' + type.toUpperCase()](content[i]);
            fs.writeFile(filePath, JSON.stringify(content[i], null, this.indent), (err) => {
                console.log('更新文件: ' + type + '.json');
            });
        }
    },
    parseMethod: function(node, url, key) {
        var name = node.find('> .propTitle').html().match(/<span class="propType">static <\/span>([\s\S]*)<span class="propType">/);

        if (name) {
            name = name[1].trim();
        } else {
            name = node.find('> .propTitle').html().match(/<a class="anchor" name="([\s\S]*)"><\/a>([\s\S]*)<span class="propType">/);
            if (name) {
                name = name[2].trim();
            } else {
                console.log('读取method失败:\n' + url + '\n' + node.find('> .propTitle').html());
                return null;
            }
        }
        let param = node.find('.propTitle > .propType'),
            snippet = '(';

        param = param.eq(param.length - 1).html().trim().replace('(', '').replace(')', '').split(',');
        if (param && param[0].trim() !== '') {
            param.forEach((text, index) => {
                snippet += (index !== 0 ? ', ' : '') + '${' + (index + 1) + ':' + text.split(':')[0].replace(/\n/g, '').trim() + '}';
            });
        }

        return {
            "name": name,
            "snippet": name + snippet + ')',
            "type": "method",
            "description": this.getDescription(node),
            "descriptionMoreURL": this.getDescriptionMoreURL(url, name)
        }
    },
    parsePropertie: function(node, url, key) {
        var name = node.find('> .propTitle').html().match(/<a class="anchor" name="([\s\S]*)"><\/a>([\s\S]*)<span class="propType">/);
        if (name) {
            name = name[2].trim();
            return {
                "name": name,
                "text": key === 'Animated' && !!name.match(/^(Value|ValueXY)$/) ? name + '()' : name,
                "type": key === 'Animated' && !!name.match(/^(Value|ValueXY)$/) ? "class" : "property",
                "description": this.getDescription(node),
                "descriptionMoreURL": this.getDescriptionMoreURL(url, name)
            }
        } else {
            console.log('读取propertie失败:\n' + url + '\n' + node.find('> .propTitle').html());
            return null;
        }
    },
    parseProp: function(node, url, key) {
        if (node.parent().attr('class') !== 'props') return null;
        var extendKey = node.find('> .propTitle').html().match(/<a href="([\s\S]*).html#props">([\s\S]*)<\/a>/);
        if (extendKey === null) {
            var name = node.find('> .propTitle').html().match(/<a class="anchor" name="([\s\S]*)"><\/a>([\s\S]*)<span class="propType">([\s\S]*)<\/span>/);
            name = name ? name : node.find('> .propTitle').html().match(/<a class="anchor" name="([\s\S]*)"><\/a>([\s\S]*)<a class="hash-link"/);
            var type = name.length === 4 ? name[3] : '',
                mobile = '';

            if (name[2].match(/<span class="platform">([\s\S]*)<\/span>([\s\S]*)/)) {
                name = name[2].match(/<span class="platform">([\s\S]*)<\/span>([\s\S]*)/);
                mobile = name[1] + ':';
                name = name[2].trim();
            } else {
                name = name[2].trim();
            }
            let obj = {
                "name": name,
                "displayText": name,
                "snippet": name + '=' + (/^enum|string/.test(type) && !this.enumException(name) ? '"$1"' : '{$1}'),
                "type": "attribute",
                "description": this.getDescription(node),
                "descriptionMoreURL": this.getDescriptionMoreURL(url, name),
                "leftLabelHTML": mobile + (type.match(/(function|bool|style|string|number)/) ? type : 'object')
            };
            if (type.indexOf('enum') !== -1) {
                obj.leftLabelHTML = mobile + 'enum';
                obj.value = type.match(/enum\(([\s\S]*)\)/)[1].replace(/&apos;/g, '').replace(/&quot;/g, '').replace(/\s/g, '').split(',');
            } else if (type.match(/View#style/)) {
                obj.leftLabelHTML = mobile + 'style';
            } else if (type.match(/^(\{|\[)/)) {
                obj.leftLabelHTML = mobile + 'object';
            }
            return obj;
        } else {
            return extendKey[2].split(' ')[0];
        }
    },
    getDescriptionMoreURL: function(url, name) {
        return url.replace(/#([\s\S]*)/g, '') + '#' + name.toLowerCase();
    },
    getDescription: function(node) {
        let description = node.find('> .propTitle').eq(0).next().find('> p').eq(0).html();
        description = description ? description.replace(/<\/?[^>]*>/g, '').replace(/\n/g, '').replace(/\r/g, '') : ' ';
        description = description && description.length > 80 ? description.substring(0, 80) : description;
        return description;
    },
    getCompletionObj: function(type, name) {
        let completion = {
            "attribute": {
                "name": name
            },
            "completions": []
        };
        if (type === 'apis') {
            completion.attribute.text = name;
            completion.attribute.type = 'class';
        } else {
            completion.attribute.displayText = name;
            completion.attribute.snippet = name + (separateTags.indexOf(name) !== -1 ? '$1/>' : '$1>\n</' + name + '>');
            completion.attribute.type = 'tag';
            completion.extend = [];
        }
        return completion;
    },
    getClass: function(type, name, url, $) {
        let completion = this.getCompletionObj(type, name),
            titles = $('.inner-content > div > span > h3, .inner-content > div > h3');

        for (let i = 0; i < titles.length; i++) {
            let title = titles.eq(i).html().match(/<a class="anchor" name="([\s\S]*)"><\/a>/);
            if (title && ((title = title[1]).match(/(methods|properties|props)/))) {
                let props = titles.eq(i).next().find(' > .prop');
                for (let j = 0; j < props.length; j++) {
                    let obj = null;
                    if (title === 'methods') {
                        obj = this.parseMethod(props.eq(j), url, name);
                    } else if (title === 'properties') {
                        obj = this.parsePropertie(props.eq(j), url, name);
                    } else if (title === 'props') {
                        obj = this.parseProp(props.eq(j), url, name);
                    }
                    if (typeof(obj) === 'string') {
                        completion.extend.push(obj)
                        if (obj === 'ScrollView') {
                            completion.extend.push('View');
                        }
                    } else if (obj) {
                        completion.completions.push(obj);
                    }
                }
            }
        }
        return completion;
    },
    getSubClass: function(type, name, url, $) {
        if (type === 'apis') {
            let classNodes = $('.inner-content h2'),
                completionList = [];
            for (let i = 0; i < classNodes.length; i++) {
                let className = classNodes.eq(i).html().match(/<a class="anchor" name="([\s\S]*)"><\/a>class([\s\S]*)<a class="hash-link"/);
                if (className) {
                    let completion = this.getCompletionObj(type, className[2].trim()),
                        props = classNodes.eq(i).next().find('.prop');
                    for (let j = 0; j < props.length; j++) {
                        let obj = this.parseMethod(props.eq(j), url);
                        if (obj) {
                            obj.className = completion.attribute.name;
                            completion.completions.push(obj);
                        }
                    }
                    completionList.push(completion);
                }
            }
            return completionList;
        }
        return null;
    },
    reloadPage: function(type, name, url) {
        request(url, (error, response, body) => {
            if (error) return console.log(error + '\n' + url + '\n');
            let $ = cheerio.load(body);
            this.outputFile(type, this.getClass(type, name, url, $));
            // this.outputFile(type, this.getSubClass(type, name, url, $));
        });
    },
    find: function() {
        request(docsURL, (error, response, body) => {
            if (error) return console.log(error + '\n' + '起始错误。');
            let $ = cheerio.load(body),
                menuNode = $('.nav-docs .nav-docs-section');

            for (let i = 0; i < menuNode.length; i++) {
                let title = menuNode.eq(i).find('h3').html().trim();
                if (title.match(/apis|components/gi)) {
                    let subMenuNode = menuNode.eq(i).find('ul a');
                    for (let j = 0; j < subMenuNode.length; j++) {
                        this.reloadPage(title, subMenuNode.eq(j).html(), 'http://facebook.github.io/react-native/' + subMenuNode.eq(j).attr('href'));
                    }
                }
            }
        });
    },
    enumException: function(name) {
        return /minuteInterval/.test(name);
    }
};
collect.find();
// export default collect;
