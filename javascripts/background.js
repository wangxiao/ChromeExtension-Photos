/*global $, define*/
(function (window, undefined) {
    require.config({
        baseUrl : '../javascripts/'
    });

    require(['LoginHelper'], function (LoginHelper) {
        var localStorage = window.localStorage;
        var document = window.document;
        var chrome = window.chrome;
        var alert = window.alert;

        // var clickHandler = function () {
        //     var imgInfo = arguments[0];

        //     $.ajax({
        //         url : localStorage.getItem('wdj-server-url') + '/api/v1/directive/photos/download',
        //         data : {
        //             url : imgInfo.srcUrl
        //         },
        //         success : function () {
        //             alert('保存成功');
        //         },
        //         error : function () {
        //             alert('保存失败');
        //         }
        //     });
        // };

        // chrome.contextMenus.create({
        //     type : 'normal',
        //     id : 'temp',
        //     title : '保存到手机',
        //     contexts : ['image'],
        //     onclick : clickHandler
        // });

        var isLogin = false;
        var photos;

        chrome.extension.onMessage.addListener(function (request, sender, callback) {
            var action = request.action;
            var data = request.data;

            var response;
            switch (action) {
            case 'getTemplate':
                response = $('#' + data.id).html();
                callback(response);
                break;
            case 'getServerURL':
                response = LoginHelper.getServerURL();
                callback(response);
                break;
            case 'login':
                LoginHelper.loginAsync(data.authCode).done(function () {
                    isLogin = true;
                    callback(true);
                }).fail(function () {
                    isLogin = false;
                    callback(false);
                });
                break;
            case 'logout':
                LoginHelper.logout();
                isLogin = false;
                callback();
                break;
            case 'isLogin':
                callback(isLogin);
                break;
            case 'fetchPhotoList':
                if (photos) {
                    callback(photos);
                } else {
                    $.ajax({
                        url : LoginHelper.getServerURL() + '/api/v1/resource/photos/',
                        xhrFields: {
                            withCredentials : true
                        },
                        success : function (resp) {
                            photos = resp;
                            callback(resp);
                        },
                        error : function (resp) {
                            callback(resp);
                        }
                    });
                }
                break;
            case 'preview':
                chrome.tabs.create({
                    url : 'http://192.168.100.24:3000/?ac=' + LoginHelper.getAuthCode() + '#/photos?preview=' + data.id
                });
                break;
            }

            return true;
        });

        LoginHelper.loginAsync().done(function () {
            isLogin = true;
        }).fail(function () {
            isLogin = false;
        });
    });
}(this));