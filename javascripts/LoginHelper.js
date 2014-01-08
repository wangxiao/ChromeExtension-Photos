/*global Backbone, $, define*/
(function (window, undefined) {
    define([], function () {

        var localStorage = window.localStorage;

        var CONST = {
            PORT : '10208',
            PROTOCPL : 'http://'
        };

        var i18n = chrome.i18n.getMessage;
        
        function clearAccountStorage() {
            localStorage.removeItem('wdj-server-authCode', '');
            localStorage.removeItem('wdj-phone-name', '');
            localStorage.removeItem('wdj-device-ip', '');
            localStorage.removeItem('wdj-google-token', '');
        }

        return {
            login : function (number) {
                var defer = $.Deferred();
                chrome.runtime.onMessage.addListener(
                    function(request, sender, sendResponse) {
                        if (sender.tab && sender.tab.url.indexOf(i18n('SNAPPEA_HOST')) != -1) {
                            var authData = request.data;
                            if (authData.signInFlag) {
                                defer.resolve();
                                localStorage.setItem('wdj-google-token', authData.signInFlag);
                                if (authData.currentDevice && authData.currentDevice.ip) {
                                    var currentDevice = authData.currentDevice;
                                    localStorage.setItem('wdj-server-authCode', currentDevice.authcode);
                                    localStorage.setItem('wdj-phone-name', currentDevice.model);
                                    localStorage.setItem('wdj-device-ip', currentDevice.ip);
                                } else {
                                    localStorage.removeItem('wdj-phone-name', '');
                                    localStorage.removeItem('wdj-device-ip', '');
                                }
                            } else {
                                clearAccountStorage();
                                defer.reject();
                            }
                        } 
                    }
                );

                return defer.promise();
            },
            logout : function () {
                chrome.extension.sendMessage({
                    action : 'createTab',
                    data : i18n('SIGN_OUT_URL')
                });
            },

            getServerHost : function () {
                return localStorage.getItem('wdj-device-ip') + ':' + CONST.PORT;
            },
            getServerURL :  function () {
                return CONST.PROTOCPL + localStorage.getItem('wdj-device-ip') + ':' + CONST.PORT;
            },
            getAuthCode : function () {
                return localStorage.getItem('wdj-server-authCode');
            }
        };
    });
}(this));
