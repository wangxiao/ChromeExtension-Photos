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
                success : options.success,
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
        });
    });
}(this));