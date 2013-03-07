/*global $, define*/
(function (window, undefined) {
    require.config({
        baseUrl : '../javascripts/'
    });

    require(['LoginHelper', 'BackendSocket'], function (LoginHelper, BackendSocket) {
        var document = window.document;
        var chrome = window.chrome;
        var alert = window.alert;
        var WebSocket = window.WebSocket;

        var num = 0;
        var tpl = "<div class=\"snapPea-pop\"><div class=\"icon saving\"></div><p class=\"saving\">Saving photo to your phone...</p></div>";

        var clickHandler = function (data) {

            function savePhoto(){
                num++;
                chrome.tabs.executeScript(null,
                    {
                        code:"$('.snapPea-pop').remove();$('body').append($('"+tpl+"').addClass('snapPeaid"+num+"'));$('.snapPeaid"+num+"').slideDown();"
                    }
                );

                $.ajax({
                    url : LoginHelper.getServerURL() + '/api/v1/directive/photos/download',
                    xhrFields: {
                        withCredentials : true
                    },
                    data : {
                        url : data.srcUrl
                    },
                    success : function () {
                        chrome.tabs.executeScript(null,
                            {
                                code:"$('.snapPeaid"+num+" p').removeClass('saving').addClass('savedone').text('Photo saved.');$('.snapPeaid"+num+" .icon').removeClass('saving').addClass('savedone');setTimeout(function(){$('.snapPea-pop').remove();},1000);"
                            }
                        );
                    },
                    error : function () {
                        chrome.tabs.executeScript(null,
                            {
                                code:"$('.snapPeaid"+num+" p').removeClass('saving').addClass('savefailed').text('Photo save failed.');$('.snapPeaid"+num+" .icon').removeClass('saving').addClass('savefailed');setTimeout(function(){$('.snapPea-pop').remove();},1000);"
                            }
                        );
                    }
                });
            };

            //如果未登录，则弹窗
            if(!LoginHelper.getAuthCode()){
                var top = window.screen.availHeight/2-300;
                var left = window.screen.availWidth/2-200;
                chrome.windows.create({
                    url:'../pages/popup.html',
                    width: 255,
                    height: 340,
                    top:top,
                    left:left,
                    focused:true,
                    type:"panel"
                },function(){
                    chrome.windows.onRemoved.addListener(function(){
                        setTimeout(savePhoto,100);
                    });
                });
            }else{
                savePhoto();
            };

        };

        chrome.contextMenus.create({
            type : 'normal',
            id : 'temp',
            title : 'Save to phone',
            contexts : ['image'],
            onclick : clickHandler
        });

        var isLogin = false;
        var photos = [];

        //websocket通知图片改变
        var handler = function (msg) {
            
        chrome.extension.sendMessage({
            action : 'reload'
        });

            // if (msg.type === 'photos.add') {
            //     _.each(msg.data, function (item) {
            //         $.ajax({
            //             url : LoginHelper.getServerURL() + '/api/v1/resource/photos/' + item,
            //             xhrFields: {
            //                 withCredentials : true
            //             },
            //             success : function (resp) {
            //                 photos.unshift(resp);
            //             }
            //         });
            //     });
            // } else if (msg.type === 'photos.remove') {
            //     _.each(msg.data, function (item) {

            //         var target = _.find(photos, function (photo) {
            //             return photo.id === item;
            //         });

            //         if (target !== undefined) {
            //             var index = photos.indexOf(target);
            //             photos.splice(index, 1);
            //         }
            //     });
            // }
        };

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
                    BackendSocket.init().on('message',handler);
                    callback(true);
                }).fail(function () {
                    isLogin = false;
                    callback(false);
                });
                break;
            case 'logout':
                photos = [];
                LoginHelper.logout();
                isLogin = false;
                callback();
                break;
            case 'isLogin':
                LoginHelper.loginAsync(data.authCode).done(function () {
                    isLogin = true;
                    callback(true);
                }).fail(function () {
                    isLogin = false;
                    callback(false);
                });               
                break;
            case 'fetchPhotoList':
                
                if (photos.length > 0) {
                    callback(photos);
                } else {
                    $.ajax({
                        url : LoginHelper.getServerURL() + '/api/v1/resource/photos/',
                        xhrFields: {
                            withCredentials : true
                        },
                        data:{
                            offset:0,
                            length:900
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
                    url : 'http://next.wandoujia.com/?ac=' + LoginHelper.getAuthCode() + '#/photos?preview=' + data.id
                });
                break;
            }

            return true;
        });

        LoginHelper.loginAsync().done(function () {
            isLogin = true;
            BackendSocket.init().on('message', function (data) {
                handler(data);
            });
        }).fail(function () {
            isLogin = false;
        });
    });
}(this));
