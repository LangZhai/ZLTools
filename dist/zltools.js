/**
 * ZLTools
 * Date: 2017-06-02
 * © 2016-2017 LangZhai(智能小菜菜)
 * This is licensed under the GNU LGPL, version 3 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl.html
 * Project home: https://github.com/LangZhai/ZLTools
 */

var params = {};

/*请求参数处理*/
location.search.substr(1).split('&').forEach(function (item) {
    var param = item.split('=');
    params[decodeURIComponent(param[0])] = decodeURIComponent(param[1]);
});

/*对象拷贝*/
Object.extend = function () {
    var args,
        deep;
    if (typeof arguments[0] === 'boolean') {
        args = [].slice.call(arguments, 1);
        deep = arguments[0];
    } else {
        args = [].slice.call(arguments);
    }
    args.forEach(function (obj) {
        if (obj instanceof Object) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    args[0][key] = deep ? Object.extend(deep, {}, obj[key]) : obj[key];
                }
            }
        } else {
            args[0] = obj;
        }
    });
    return args[0];
};

/*多级对象属性获取*/
Object.getVal = function (obj, key) {
    key.split('.').some(function (item) {
        return (obj = obj[item]) === undefined;
    });
    return obj;
};

/*多级对象属性赋值*/
Object.setVal = function (obj, key, val) {
    key = key.split('.');
    key.forEach(function (item, i) {
        if (i === key.length - 1) {
            obj[item] = typeof val === 'function' ? val(obj[item]) : val;
            return;
        }
        if (obj[item] === undefined) {
            obj[item] = {};
        }
        obj = obj[item];
    });
};

/*字符实体编码*/
Object.encodeEntity = function (obj) {
    if (obj instanceof Object) {
        obj = Object.extend(obj instanceof Array ? [] : {}, obj);
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = Object.encodeEntity(obj[key]);
            }
        }
    } else if (typeof obj === 'string') {
        obj = obj.replaceAll(/&(?!(\S(?!&))+;)/, '&amp;').replaceAll('>', '&gt;').replaceAll('<', '&lt;').replaceAll('"', '&quot;').replaceAll('\'', '&#39;');
    }
    return obj;
};

/*字符实体解码*/
Object.decodeEntity = function (obj) {
    if (obj instanceof Object) {
        obj = Object.extend(obj instanceof Array ? [] : {}, obj);
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = Object.decodeEntity(obj[key]);
            }
        }
    } else if (typeof obj === 'string') {
        obj = obj.replaceAll('&amp;', '&').replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&quot;', '"').replaceAll('&#39;', '\'');
    }
    return obj;
};

/*小数四舍五入*/
Math.round2 = function (num, fractionDigits) {
    return Math.round(num * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);
};

/*字符串替换所有*/
String.prototype.replaceAll = function (reallyDo, replaceWith, ignoreCase) {
    if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
        return this.replace(new RegExp(reallyDo, (ignoreCase ? 'gi' : 'g')), replaceWith);
    } else {
        return this.replace(reallyDo, replaceWith);
    }
};

(function () {
    var ZLTools = function (selector) {
        return new ZLTools.prototype.init(selector);
    };

    ZLTools.prototype.init = function (selector) {
        if (typeof selector === 'string') {
            var nodes = document.querySelectorAll(selector);
            Object.extend(this, nodes);
            this.length = nodes.length;
            return this;
        } else if (selector.nodeType) {
            this[0] = selector;
            this.length = 1;
            return this;
        }
        return selector;
    };

    /*表单序列化*/
    ZLTools.prototype.serializeObject = function () {
        var serializeObj = {},
            setVal = function (key, val) {
                if (serializeObj[key] !== undefined) {
                    if (!serializeObj[key] instanceof Array) {
                        serializeObj[key] = [serializeObj[key]];
                    }
                    serializeObj[key].push(val);
                } else {
                    serializeObj[key] = val;
                }
            };
        Array.prototype.forEach.call(this[0].elements, function (item) {
            if (item.name) {
                switch (item.type) {
                    case 'select-one': case 'select-multiple':
                        Array.prototype.forEach.call(item.options, function (option) {
                            if (option.selected) {
                                setVal(item.name, option.hasAttribute('value') ? option.value : option.text);
                            }
                        });
                        break;
                    case undefined: case 'file': case 'submit': case 'reset': case 'button':
                        break;
                    case 'radio': case 'checkbox':
                        if (!item.checked) {
                            break;
                        }
                    default:
                        setVal(item.name, item.value);
                }
            }
        });
        return serializeObj;
    };

    /*锚点绑定*/
    ZLTools.prototype.anchor = function (options) {
        var self = this[0],
            id = self.dataset.id || new Date().getTime(),
            css = {
                position: getComputedStyle(self).getPropertyValue('position'),
                display: getComputedStyle(self).getPropertyValue('display'),
                top: getComputedStyle(self).getPropertyValue('top')
            },
            _offset = function (elem) {
                var rect = elem.getBoundingClientRect();
                return {
                    top: rect.top + pageYOffset,
                    height: rect.height
                };
            },
            offset;
        self.dataset.id = id;
        options = options || {};
        options.anchor = (options.anchor ? options.anchor instanceof ZLTools ? options.anchor : ZLTools(options.anchor) : this)[0];
        offset = _offset(options.anchor);
        if (!window['anchor' + id]) {
            window['anchor' + id] = (function () {
                if (window.innerHeight - offset.height > 0 && pageYOffset > offset.top + (options.isBottom ? offset.height : 0)) {
                    if (!self.dataset.anchor) {
                        self.style.position = 'fixed';
                        self.style.display = 'block';
                        self.style.top = 0;
                        self.dataset.anchor = true;
                    }
                } else if (self.dataset.anchor) {
                    self.style.position = css.position;
                    self.style.display = css.display;
                    self.style.top = css.top;
                    self.dataset.anchor = false;
                    offset = _offset(options.anchor);
                }
                return arguments.callee;
            }());
            window.addEventListener('scroll', window['anchor' + id]);
            window.addEventListener('resize', window['anchor' + id]);
        }
        return this;
    };

    /*多行文字截断*/
    ZLTools.prototype.boxCut = function (maxHeight) {
        Array.prototype.forEach.call(this, function () {
            var self = this,
                id = self.dataset.id || new Date().getTime();
            self.dataset.text = self.textContent;
            self.dataset.id = id;
            if (!window['boxCut' + id]) {
                window['boxCut' + id] = (function () {
                    self.textContent = self.dataset.text;
                    if (self.getBoundingClientRect().height > maxHeight) {
                        do {
                            self.textContent = self.textContent.substring(0, self.textContent.length - 1);
                        } while (self.getBoundingClientRect().height > maxHeight);
                        self.textContent = self.textContent.substring(0, self.textContent.length - 2) + '…';
                    }
                    return arguments.callee;
                }());
                window.addEventListener('scroll', window['boxCut' + id]);
            }
        });
        return this;
    };

    ZLTools.prototype.init.prototype = ZLTools.prototype;
    window.ZLTools = ZLTools;
}());