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
        };

        var renderList = function () {
            var photoListView = new PhotoListView();
            photoListView.renderAsync().done(function (photoListView) {
                $('body').append(photoListView.$el);
            });
        };
        $('.w-ui-loading').show();


        chrome.extension.sendMessage({
            action : 'isLogin'
        }, function (resp) {
            $('.w-ui-loading').hide();
            var g = chrome.i18n.getMessage;

            if (resp) {
                var deviceIp = window.localStorage.getItem('wdj-device-ip');

                if (deviceIp && deviceIp != undefined) {
                    renderList.call(this);
                } else {
                    chrome.tabs.create({
                        url : g('DEVICE_LIST_URL')
                    });
                }
                
            } else {
                var loginView = new LoginView();

                loginView.renderAsync().done(function (loginView) {

                    $('body').append(loginView.$el);
                    window.localStorage.setItem('wdj-server-authCode','');
                    
                    //支持国际化，后期可以重构为前端模板
                    
                    $('.i18n-title').text(g("LOGIN_TITLE"));

                    $('.sign-in-text').text(g("LOGIN_TEXT"));

                    $('.i18n-des').text(g("LOGIN_DES"));

                    $('.sign-in-button').click(function() {
                        chrome.tabs.create({
                            url : g('SIGN_IN_URL')
                        });

                        _gaq.push(['_trackEvent', '登录页', '登录']);
                    });

                    //点图片，打开google play地址
                    $('.i18n-gplay').on('click',function(){
                        _gaq.push(['_trackEvent', '登陆页', '前往Google play']);
                        chrome.tabs.create({url : g("LOGIN_GPLAY")});
                    });

                });

            }
        });
        
    });

}(this));