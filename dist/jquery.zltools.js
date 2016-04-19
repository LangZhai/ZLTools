/**
 * ZLTools
 * Date: 2016-04-19
 * © 2016 LangZhai(智能小菜菜)
 * This is licensed under the GNU LGPL, version 3 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl.html
 * Project home: https://github.com/LangZhai/ZLTemplate
 */

var params = eval({});

(function ($) {
    var $window = $(window);

    /*请求参数处理*/
    $.each(location.search.substr(1).split('&'), function (i, item) {
        var param = item.split('=');
        params[decodeURIComponent(param[0])] = decodeURIComponent(param[1]);
    });

    /*IE8兼容Function.prototype.bind*/
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {
                },
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }

    /*字符串替换所有*/
    String.prototype.replaceAll = function (reallyDo, replaceWith, ignoreCase) {
        if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
            return this.replace(new RegExp(reallyDo, (ignoreCase ? 'gi' : 'g')), replaceWith);
        } else {
            return this.replace(reallyDo, replaceWith);
        }
    };

    /*小数四舍五入*/
    Number.prototype.round2 = function (fractionDigits) {
        return Math.round(this * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);
    };

    /*序列化表单*/
    $.fn.serializeObject = function () {
        var serializeObj = {};
        $.each($(this).serializeArray(), function (i, item) {
            if (serializeObj[item.name] !== undefined) {
                if (!$.isArray(serializeObj[item.name])) {
                    serializeObj[item.name] = [serializeObj[item.name]];
                }
                serializeObj[item.name].push(item.value);
            } else
                serializeObj[item.name] = item.value;
        });
        return serializeObj;
    };

    /*placeholder兼容*/
    $.fn.placeholder = function (pColor) {
        $(this).each(function () {
            var $this = $(this),
                placeholder = $this.attr('placeholder'),
                color = $this.data('color') || $this.css('color'),
                _placeholder = function () {
                    $this.css('color', pColor).val(placeholder).data('length', false);
                };
            if (placeholder === undefined) {
                return;
            }
            if (placeholder === '') {
                placeholder = '请输入内容';
            }
            if (pColor === undefined) {
                pColor = '#999999';
            }
            if (!$this.data('length')) {
                if ($this.data('length') === undefined && $this.val().length) {
                    $this.data('length', true);
                } else {
                    _placeholder();
                }
            }
            $this.off('.placeholder').on({
                'focus.placeholder': function () {
                    if (!$this.data('length')) {
                        $this.css('color', color).val('');
                    }
                }, 'blur.placeholder': function () {
                    if ($this.val().length) {
                        if ($.trim($this.val()) === placeholder) {
                            _placeholder();
                        } else {
                            $this.css('color', color).data('length', true);
                        }
                    } else {
                        _placeholder();
                    }
                }
            }).data('color', color).removeAttr('placeholder').triggerHandler('blur.placeholder');
        });
    };

    /*锚点绑定*/
    $.fn.anchor = function (options) {
        var $this = $(this),
            id = $this.data('id') || new Date().getTime(),
            css = {
                position: $this.css('position'),
                display: $this.css('display'),
                top: $this.css('top')
            },
            offset;
        $this.data('id', id);
        options = options || {};
        options.anchor = options.anchor || $this;
        options.anchor = options.anchor instanceof $ ? options.anchor : $(options.anchor);
        offset = options.anchor.offset();
        $window.off('.anchor' + id).on('scroll.anchor' + id + ' resize.anchor' + id, function () {
            if ($window.height() - $this.outerHeight() > 0 && $window.scrollTop() > offset.top + (options.isBottom ? options.anchor.height() : 0)) {
                if (!$this.data('anchor')) {
                    $this.css($.extend({}, css, {
                        position: 'fixed',
                        display: 'block',
                        top: 0
                    })).data('anchor', true);
                }
            } else if ($this.data('anchor')) {
                $this.css(css).data('anchor', false);
                offset = options.anchor.offset();
            }
        }).triggerHandler('scroll.anchor' + id);
        return $this;
    };

    /*多行文字截断*/
    $.fn.boxCut = function (maxHeight) {
        $(this).each(function () {
            var $this = $(this),
                id = $this.data('id') || new Date().getTime(),
                text;
            $this.data('text', $this.text()).data('id', id);
            $window.off('.anchor' + id).on('resize.anchor' + id, function () {
                text = $this.data('text');
                $this.text(text);
                if ($this.height() > maxHeight) {
                    do {
                        text = $this.text();
                        $this.text(text.substring(0, text.length - 1));
                    }
                    while ($this.height() > maxHeight);
                    text = text.substring(0, text.length - 2);
                    $this.text(text + '…');
                }
            }).triggerHandler('resize.anchor' + id);
        });
    };
}($));