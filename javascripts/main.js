/*global Backbone, $, document*/
(function (window, undefined) {
    require.config({
        baseUrl : '../javascripts/'
    });

    if (Backbone && Backbone.sync) {
        var methodMap = {
            'create' : 'GET',
            'update' : 'GET',
            'delete' : 'GET',
            'read' : 'GET'
        };

        Backbone.sync = function (method, model, options) {
            $.ajax({
                url : window.localStorage.getItem('wdj-server-url') + model.url,
                data : model.data || {},
                type : methodMap[method],
                success : function () {
                    var phoneName = arguments[2].getResponseHeader('WD-Phone-Modal');
                    if (phoneName) {
                        window.localStorage.setItem('wdj-phone-name', phoneName);
                        console.log(phoneName);
                    }
                    options.success(arguments[0]);
                },
                error : options.error
            });
        };
    }

    require([
        'views/LoginView',
        'views/PhotoListView'
    ], function (
        LoginView,
        PhotoListView
    ) {
        var loginView = new LoginView();

        loginView.renderAsync().done(function (loginView) {
            $('body').append(loginView.$el);
        });

        loginView.on('login', function () {
            var photoListView = new PhotoListView();
            photoListView.renderAsync().done(function (photoListView) {
                $('body').append(photoListView.$el);
            });

            photoListView.on('logout', function () {
                window.location.reload();
            });
        });
    });
}(this));