(function() {
    var authData = {};
    var localStorage = window.localStorage;
    var sendMessage = function() {
        authData = {
            googleToken : localStorage.getItem('googleToken'),
            currentDevice : localStorage.getItem('currentDevice')
        }
        
        chrome.runtime.sendMessage({data : authData}, function(response) {
        });
    }

    var timer = setInterval(function() {
        var googleToken = localStorage.getItem('googleToken');
        var currentDevice = localStorage.getItem('currentDevice');

        if (authData.googleToken != googleToken || authData.currentDevice != currentDevice) {
            sendMessage();
        }
    }, 1000);
    
    sendMessage();
})();

    
