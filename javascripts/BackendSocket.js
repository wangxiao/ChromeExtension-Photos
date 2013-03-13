// (function (window, undefined) {
//     var WebSocket = window.WebSocket;

//     define(['LoginHelper'], function (LoginHelper) {
//         var BackendSocket = _.extend({
//             init : function () {
//                 var host = 'ws://' + LoginHelper.getServerHost();
//                 var url = host + '/api/v1/service/notification';
//                 var ws = new WebSocket(url);
//                 ws.onmessage = this.onMessage.bind(this);

//                 return this;
//             },
//             onMessage : function (evt) {
//                 this.trigger('message', JSON.parse(evt.data));
//             }
//         }, Backbone.Events);

//         return BackendSocket;
//     });
// }(this));
