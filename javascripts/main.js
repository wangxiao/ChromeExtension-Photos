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
            action : 'isLogin',
            data : {'authCode' : window.localStorage.getItem('wdj-server-authCode')}            
        }, function (resp) {
            $('.w-ui-loading').hide();
            if (resp) {
                renderList.call(this);
            } else {
                var loginView = new LoginView();

                loginView.renderAsync().done(function (loginView) {

                    $('body').append(loginView.$el);
                    window.localStorage.setItem('wdj-server-authCode','');
                    
                    //支持国际化，后期可以重构为前端模板
                    var g = chrome.i18n.getMessage;
                    $('.i18n-title').text(g("login_title"));
                    $('.i18n-passBg').focus().attr("placeholder",g("login_passBg"));
                    $('.i18n-login').text(g("login_login")).on('click',function(){
                        _gaq.push(['_trackEvent', '登陆页', '登陆']);
                    });

                    $('.i18n-htg').text(g("login_howToGet"));
                    $('.i18n-des').text(g("login_des"));

                    //如何获取验证码链接
                    $('.i18n-htg').on('click',function(){
                        chrome.tabs.create({url : g("login_htg_url")});
                        _gaq.push(['_trackEvent', '登陆页', '点击如何获取验证码']);
                    });

                    //点图片，打开google play地址
                    $('.i18n-gplay').on('click',function(){
                        chrome.tabs.create({url : g("login_gplay")});
                    });

                    $('.error-more').on('click',function(){
                        chrome.tabs.create({url : "http://snappea.zendesk.com/entries/23341488--Official-How-do-I-sign-in-to-SnapPea-for-Web"});
                    });

                    $('i18n-gplay').on('click',function(){
                        _gaq.push(['_trackEvent', '登陆页', '前往Google play']);
                    });
                });

                loginView.once('login', function () {
                    renderList.call(this);
                });
            }
        });
    });

}(this));