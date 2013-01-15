/*global $, define, Backbone*/
(function (window, undefined) {
    define(['LoginHelper'], function (LoginHelper) {
        var chrome = window.chrome;

        var LoginView = Backbone.View.extend({
            initialize : function () {
                chrome.extension.sendMessage({
                    action : 'getTemplate',
                    data : {
                        id : 'login'
                    }
                }, function (resp) {
                    this.$el = $(resp);
                    this.delegateEvents();
                }.bind(this));
            },
            clickButtonConnect : function () {
                var number = this.$('.input-login').val();

                $('.w-ui-loading').show();
                LoginHelper.loginAsync(number).done(function () {
                    this.$el.fadeOut(function () {
                        this.$el.remove();
                        this.trigger('login');
                    }.bind(this));
                }.bind(this)).always(function () {
                    $('.w-ui-loading').hide();
                }.bind(this));
            },
            renderAsync : function () {
                var deferred = $.Deferred();

                chrome.extension.sendMessage({
                    action : 'getTemplate',
                    data : {
                        id : 'login'
                    }
                }, function (resp) {
                    this.$el = $(resp).hide();
                    this.delegateEvents();

                    $('.w-ui-loading').show();
                    LoginHelper.loginAsync().done(function () {
                        this.$el.remove();
                        this.trigger('login');
                    }.bind(this)).fail(function () {
                        this.$el.show();
                    }.bind(this)).always(function () {
                        $('.w-ui-loading').hide();
                    }.bind(this));

                    deferred.resolve(this);
                }.bind(this));

                return deferred.promise();
            },
            events : {
                'click .button-connect' : 'clickButtonConnect'
            }
        });

        return LoginView;
    });
}(this));