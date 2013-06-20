/*global Backbone, $, define*/
(function (window, undefined) {
    define([], function () {

        var localStorage = window.localStorage;

        var CONST = {
            PORT : '10208',
            PROTOCPL : 'http://'
        };

        function clearAccountStorage() {
            localStorage.setItem('wdj-server-authCode', '');
            localStorage.setItem('wdj-phone-name', '');
            localStorage.setItem('wdj-device-ip', '');
            localStorage.setItem('wdj-google-token', '');
        }

        return {
            login : function (number) {
                var defer = $.Deferred();

                var i18n = chrome.i18n.getMessage;

                chrome.runtime.onMessage.addListener(
                    function(request, sender, sendResponse) {
                        if (sender.tab && sender.tab.url.indexOf(i18n('SNAPPEA_HOST')) != -1) {
                            var authData = request.data;
                            if (authData.googleToken) {
                                defer.resolve();

                                localStorage.setItem('wdj-google-token', authData.googleToken.length ? authData.googleToken : '');
                                if (authData.currentDevice) {
                                    var currentDevice = JSON.parse(authData.currentDevice);
                                    
                                    localStorage.setItem('wdj-server-authCode', currentDevice.authcode);
                                    localStorage.setItem('wdj-phone-name', currentDevice.model);
                                    localStorage.setItem('wdj-device-ip', currentDevice.ip);
                                } else {
                                    localStorage.setItem('wdj-phone-name', '');
                                    localStorage.setItem('wdj-device-ip', '');
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
                clearAccountStorage();
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
