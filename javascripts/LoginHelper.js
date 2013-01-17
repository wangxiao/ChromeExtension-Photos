/*global Backbone, $, define*/
(function (window, undefined) {
    define([], function () {

        var localStorage = window.localStorage;
        var chrome = window.chrome;

        var server = localStorage.getItem('wdj-server-url');

        var CONST = {
            PORT : '8080',
            PROTOCPL : 'http://'
        };

        var parseVerifiedCodeAsync = function (input) {
            var type = parseInt(input.slice(0, 1), 10);
            var encryptedIp = parseInt(input.slice(3, input.length), 10);
            var ip;
            switch (type) {
            case 2:
                ip = '192.168.' + [
                    Math.floor(encryptedIp / 256),
                    encryptedIp % 256
                ].join('.');
                break;
            case 3:
                ip = '172.' + [
                    Math.floor(encryptedIp / Math.pow(256, 2)),
                    Math.floor((encryptedIp % Math.pow(256, 2)) / 256),
                    encryptedIp % 256
                ].join('.');
                break;
            case 4:
                ip = [
                    Math.floor(encryptedIp / Math.pow(256, 3)),
                    Math.floor((encryptedIp % Math.pow(256, 3)) / Math.pow(256, 2)),
                    Math.floor((encryptedIp % Math.pow(256, 2)) / 256),
                    encryptedIp % 256
                ].join('.');
                break;
            }

            return ip;
        };

        var loginAsync = function () {
            var deferred = $.Deferred();

            $.ajax({
                url : server + '/',
                success : function (resp) {
                    localStorage.setItem('wdj-server-url', server);
                    chrome.extension.sendMessage({
                        action : 'logined',
                        data : {
                            server : server
                        }
                    });
                    deferred.resolve(resp);
                },
                error : deferred.reject
            });

            return deferred.promise();
        };

        return {
            loginAsync : function (number) {
                var deferred = $.Deferred();

                if (server) {
                    loginAsync().done(deferred.resolve).fail(deferred.reject);
                } else {
                    if (number) {
                        server = CONST.PROTOCPL + parseVerifiedCodeAsync(number) + ':' + CONST.PORT;
                        loginAsync().done(deferred.resolve).fail(function (resp) {
                            server = undefined;
                            deferred.reject(resp);
                        });
                    } else {
                        deferred.reject();
                    }
                }

                return deferred.promise();
            },
            getServerURL : function () {
                return server;
            }
        };
    });
}(this));