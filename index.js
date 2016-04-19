$(function () {
    $.ajax({
        url: 'code.json',
        dataType: 'json'
    }).done(function (data) {
        $('body>article').html($('#template_article').template($.extend({
            escape: function (html) {
                return html.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
            }
        }, data)));
        eval(data.code);
        Prism.highlightAll();
    });
});