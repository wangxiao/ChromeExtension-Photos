/*global $*/
(function (window, undefined) {
    var localStorage = window.localStorage;
    var document = window.document;
    var chrome = window.chrome;
    var alert = window.alert;

    var clickHandler = function () {
        var imgInfo = arguments[0];

        $.ajax({
            url : localStorage.getItem('wdj-server-url') + '/api/v1/directive/photos/download',
            data : {
                url : imgInfo.srcUrl
            },
            success : function () {
                alert('保存成功');
            },
            error : function () {
                alert('保存失败');
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

    var getBase64ImageAsync = function ($img) {
        var deferred = $.Deferred();

        $img.on('load', function () {
            var canvas = document.createElement("canvas");
            canvas.width = $img[0].width;
            canvas.height = $img[0].height;

            var ctx = canvas.getContext("2d");
            ctx.drawImage($img[0], 0, 0);

            var dataURL = canvas.toDataURL("image/png");
            // dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
            // console.log(dataURL);
        });

        return deferred.promise();
    };

    chrome.extension.onMessage.addListener(function (request, sender, callback) {
        var action = request.action;
        var data = request.data;

        var response;
        if (action === 'getTemplate') {
            response = $('#' + data.id).html();
            callback(response);
        } else if (action === 'getServerURL') {
            response = localStorage.getItem('wdj-server-url');
            callback(response);
        } else if (action === 'getBase64Image') {
            console.log(data.url);
            response = getBase64ImageAsync($('<img src="' + data.url + '">')).done(function (resp) {

            });
        }
    });
}(this));