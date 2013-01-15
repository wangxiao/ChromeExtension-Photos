/*global Backbone, $, define*/
(function (window, undefined) {
    define([], function () {

        var localStorage = window.localStorage;

        var server = localStorage.getItem('wdj-server-url');

        var CONST = {
            PORT : '8080',
            PROTOCPL : 'http://'
        };

        var parseVerifiedCodeAsync = function (input) {
            var type = parseInt(input.slice(0, 1), 10);
            var encryptedIp = parseInt(input.slice(3, 8), 10);
            var ip;
            if (type === 2) {
                ip = '192.168.' + Math.floor(encryptedIp / 256) + '.' + (encryptedIp % 256);
            }

            return ip;
        };

        var loginAsync = function () {
            var deferred = $.Deferred();

            $.ajax({
                url : server + '/api/v1/resource/photos/',
                success : function (resp) {
                    localStorage.setItem('wdj-server-url', server);
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
                    server = CONST.PROTOCPL + parseVerifiedCodeAsync(number) + ':' + CONST.PORT;
                    loginAsync().done(deferred.resolve).fail(deferred.reject);
                }

                return deferred.promise();
            },
            getServerURL : function () {
                return server;
            }
        };
    });
}(this));