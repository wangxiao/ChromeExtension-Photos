/*global Backbone, $, define*/
(function (window, undefined) {
    define([], function () {

        var localStorage = window.localStorage;

        var CONST = {
            PORT : '10208',
            PROTOCPL : 'http://'
        };

  var getIp = function(num){
    num = String(num);

    //类型
    var type = num.substr(0,1);

    //验证信息
    //var check = num.substr(1,2);

    //ip地址码
    var ipNum = num.substr(3);

    //真实ip
    var ip = '';

    switch(type){
      case '1':
        //1 ：预留出来做扩展用
      break;
      case '2':
        //2 ：由本地生成的验证码，IP地址是C类地址
        if(ipNum.length<5){return;}
        ipNum = ipNum.substr(0,5);
        console.log(ipNum);
        ip = '192.168.'+ Math.floor(ipNum/256) +  '.' + (ipNum%256);

      break;
      case '3':
        //3 ：由本地生成的验证码，IP地址是B类地址
        if(ipNum.length<8){return;}
        ipNum = ipNum.substr(0,8);
        ip = '172.' + Math.floor(ipNum/Math.pow(256,2)) + '.' + Math.floor((ipNum%Math.pow(256,2))/256) + '.' + ipNum%256;

      break;
      case '4':
        //4 ：由本地生成的验证码，IP地址是全地址
        if(ipNum.length<10){return;}
        ipNum = ipNum.substr(0,10);
        ip = '' + Math.floor(ipNum/Math.pow(256,3)) + '.' + Math.floor((ipNum%Math.pow(256,3))/Math.pow(256,2)) + '.' + Math.floor((ipNum%Math.pow(256,2))/256)+ '.' + (ipNum%256);

      break;
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        //5~9 ：由服务器生成的验证码，需要去服务器端取IP
        
      break;
      case '0':
      break;
    };
    return ip;
  };

        var loginAsync = function (authCode) {
            var deferred = $.Deferred();
            var server = CONST.PROTOCPL + getIp(authCode) + ':' + CONST.PORT;

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
                return getIp(localStorage.getItem('wdj-server-authCode')) + ':' + CONST.PORT;
            },
            getServerURL :  function () {
                return CONST.PROTOCPL + getIp(localStorage.getItem('wdj-server-authCode')) + ':' + CONST.PORT;
            },
            getAuthCode : function () {
                return localStorage.getItem('wdj-server-authCode');
            }
        };
    });
}(this));
