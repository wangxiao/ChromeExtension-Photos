/*global $, define, Backbone*/
(function (window, undefined) {
    define([], function () {
        var chrome = window.chrome;
        var LoginView = Backbone.View.extend({
            doLogin : function (authCode) {
                if (authCode) {
                    $('.w-ui-loading').show();
                    chrome.extension.sendMessage({
                        action : 'login',
                        data : {
                            authCode : authCode
                        }
                    }, function (resp) {
                        if (resp) {
                            this.$el.fadeOut(function () {
                                this.remove();
                                this.trigger('login');
                            }.bind(this));
                        } else {
                            $('.w-ui-loading').hide();
                            this.$('.input-login').focus();
                        }
                    }.bind(this));
                } else {
                    this.$('.input-login').focus();
                }
            },
            clickButtonConnect : function () {
                this.doLogin(this.$('.input-login').val());
            },
            keyupInputLogin : function (evt) {
                if (evt.keyCode === 13) {
                    this.doLogin(this.$('.input-login').val());
                }
            },
            renderAsync : function () {
                var deferred = $.Deferred();

                chrome.extension.sendMessage({
                    action : 'getTemplate',
                    data : {
                        id : 'login'
                    }
                }, function (resp) {
                    this.$el = $(resp);
                    this.delegateEvents();

                    deferred.resolve(this);
                }.bind(this));

                return deferred.promise();
            },
            events : {
                'keyup .input-login' : 'keyupInputLogin',
                'click .button-connect' : 'clickButtonConnect'
            }
        });

        return LoginView;
    });
}(this));