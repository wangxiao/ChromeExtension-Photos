(function() {
    var authData = {};
    var localStorage = window.localStorage;
    
    function checkSignIn() {
        return !!localStorage.getItem('signInFlag');
    }

    function getDevice() {
        return JSON.parse(localStorage.getItem('currentDevice'));
    }

    var sendMessage = function() {
        authData = {
            signInFlag: checkSignIn(),
            currentDevice: getDevice()
        };
        
        chrome.runtime.sendMessage({data : authData}, function(response) {
        });
    };

    var timer = setInterval(function() {
        var currentDevice = getDevice();
        if (!checkSignIn() || authData.currentDevice !== currentDevice) {
            sendMessage();
        }
    }, 1000);
    
    sendMessage();
})();

    
