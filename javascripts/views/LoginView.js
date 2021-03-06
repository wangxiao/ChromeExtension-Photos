/*global $, define, Backbone*/
(function (window, undefined) {
    define([], function () {
        var chrome = window.chrome;

        //是否手工输入验证码
        var isHand = false;
        var LoginView = Backbone.View.extend({
            doLogin : function (authCode) {
                if (authCode) {
                    $('.w-ui-loading').show();
                    this.$el.hide();

                    chrome.extension.sendMessage({
                        action : 'login',
                        data : {
                            authCode : authCode
                        }
                    }, function (resp) {

                        //监测登陆
                        if (resp) {
                            this.$el.fadeOut(function () {
                                this.remove();
                                this.trigger('login');
                                _gaq.push(['_trackEvent', '登陆', '登陆成功']);
                                if(window.localStorage.getItem('wdj-windows-isPanel')=='true'){
                                    window.localStorage.setItem('wdj-windows-isPanel','false');
                                    window.close();
                                };
                            }.bind(this));
                        } else {
                            $('.w-ui-loading').hide();
                            this.$('.input-login').focus();
                            this.$el.show();
                            $('.i18n-error').removeClass('dn').addClass('dib');
                            _gaq.push(['_trackEvent', '登陆', '登陆失败']);
                        }
                    }.bind(this));
                } else {
                    this.$('.input-login').focus();
                }
            },
            clickButtonConnect : function () {
                isHand = true;
                this.doLogin(this.$('.input-login').val());
            },
            keyupInputLogin : function (evt) {
                if (evt.keyCode === 13) {
                    isHand = true;
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
                'click .button-connect' : 'clickButtonConnect'
            }
        });

        return LoginView;
    });
}(this));