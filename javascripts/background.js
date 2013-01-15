/*global $*/
(function (window, undefined) {
    var localStorage = window.localStorage;
    var chrome = window.chrome;

    var clickHandler = function () {
        var imgInfo = arguments[0];

        $.ajax({
            url : localStorage.getItem('wdj-server-url') + '/api/v1/directive/photos/download',
            data : {
                url : imgInfo.srcUrl
            }
        });
    };

    chrome.contextMenus.create({
        type : 'normal',
        id : 'temp',
        title : '保存到手机',
        contexts : ['image'],
        onclick : clickHandler
    });

    chrome.extension.onMessage.addListener(function (request, sender, callback) {
        var action = request.action;
        var data = request.data;

        if (action === 'getTemplate') {
            var response = $('#' + data.id).html();
            callback(response);
        }
    });
}(this));