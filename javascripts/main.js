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

        var renderList = function () {
            var photoListView = new PhotoListView();
            photoListView.renderAsync().done(function (photoListView) {
                $('body').append(photoListView.$el);
            });
        };

        chrome.extension.sendMessage({
            action : 'isLogin'
        }, function (resp) {
            if (resp) {
                renderList.call(this);
            } else {
                var loginView = new LoginView();

                loginView.renderAsync().done(function (loginView) {
                    $('body').append(loginView.$el);
                });

                loginView.once('login', function () {
                    renderList.call(this);
                });
            }
        });
    });

    var _gaq = window._gaq || [];
    _gaq.push(['_setAccount', 'UA-XXXXXXXX-X']);
    _gaq.push(['_trackPageview']);
    (function () {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
    }());
}(this));