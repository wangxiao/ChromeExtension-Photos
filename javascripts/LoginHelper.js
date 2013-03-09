/*global Backbone, $, define*/
(function (window, undefined) {
    define([], function () {

        var localStorage = window.localStorage;

        var CONST = {
            PORT : '10208',
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

        var loginAsync = function (authCode) {
            var deferred = $.Deferred();
            var server = CONST.PROTOCPL + parseVerifiedCodeAsync(authCode) + ':' + CONST.PORT;

            $.ajax({
                url : server + '/api/v1/directive/auth',
                data : {
                    authcode :  authCode,
                    client_type : 4
                },
                //crossDomain : true,
                timeout : 1000 * 10,
                xhrFields : {
                    withCredentials : true
                },
                success : function (resp, status, xhr) {
                    localStorage.setItem('wdj-server-authCode', authCode);
                    deferred.resolve(resp);
                    if(resp){
                        resp = JSON.parse(resp);
                        localStorage.setItem('wdj-phone-name',resp.phone_model);
                    };
                },
                error : deferred.reject
            });

            return deferred.promise();
        };

        return {
            loginAsync : function (number) {
                var deferred = $.Deferred();

                var authCode = localStorage.getItem('wdj-server-authCode');

                if (authCode || number) {
                    loginAsync(number || authCode).done(deferred.resolve).fail(deferred.reject);
                } else {
                    deferred.reject();
                }

                return deferred.promise();
            },
            logout : function () {
                window.localStorage.setItem('wdj-server-authCode', '');
            },

            getServerHost : function () {
                return parseVerifiedCodeAsync(localStorage.getItem('wdj-server-authCode')) + ':' + CONST.PORT;
            },
            getServerURL :  function () {
                return CONST.PROTOCPL + parseVerifiedCodeAsync(localStorage.getItem('wdj-server-authCode')) + ':' + CONST.PORT;
            },
            getAuthCode : function () {
                return localStorage.getItem('wdj-server-authCode');
            }
        };
    });
}(this));
