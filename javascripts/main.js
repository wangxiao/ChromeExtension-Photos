/*global Backbone, $, document*/
(function (window, undefined) {
    require.config({
        baseUrl : '../javascripts/'
    });

    require([
        'LoginHelper',
        'views/LoginView',
        'views/PhotoListView'
    ], function (
        LoginHelper,
        LoginView,
        PhotoListView
    ) {
        var chrome = window.chrome;
        if($(window).height()==340){
            window.localStorage.setItem('wdj-windows-isPanel', 'true');
        }

        var renderList = function () {
            var photoListView = new PhotoListView();
            photoListView.renderAsync().done(function (photoListView) {
                $('body').append(photoListView.$el);
                setTimeout(function() {
                    $('body').height(349);
                });
            });
        };
        $('.w-ui-loading').show();


        chrome.extension.sendMessage({
            action : 'isLogin'
        }, function (resp) {
            $('.w-ui-loading').hide();
            var g = chrome.i18n.getMessage;
            $('.connecting-phone').text(g('CONNECT_PHONT_TEXT'));

            if (resp) {
                var deviceIp = window.localStorage.getItem('wdj-device-ip');

                if (deviceIp) {
                    renderList.call(this);
                } else {
                    chrome.extension.sendMessage({
                        action : 'createTab',
                        data : g('DEVICE_LIST_URL')
                    });
                }
                
            } else {
                var loginView = new LoginView();

                loginView.renderAsync().done(function (loginView) {
                    $('body').height(209);
                    $('body').append(loginView.$el);
                    window.localStorage.setItem('wdj-server-authCode','');
                    
                    //支持国际化，后期可以重构为前端模板
                    
                    $('.sign-in-text').text(g('LOGIN_TEXT'));

                    $('.sign-in-button').click(function() {
                        chrome.extension.sendMessage({
                            action : 'createTab',
                            data : g('SIGN_IN_URL')
                        });

                        _gaq.push(['_trackEvent', '登录页', '登录']);
                    });

                });

            }
        });
        
    });

}(this));