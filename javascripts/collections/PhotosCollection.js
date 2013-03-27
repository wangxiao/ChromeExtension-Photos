/*global $, define, Backbone*/
(function (window, undefined) {
    define([], function () {
        var chrome = window.chrome;

        var PhotoModel = Backbone.Model.extend();

        var PhotosCollection = Backbone.Collection.extend({
            initialize : function () {
                var me = this;
                this.on('update', function () {
                    chrome.extension.sendMessage({
                        action : 'fetchPhotoList'
                    }, function (resp) {
                        this.set(resp);
                        this.trigger('refresh', this);
     
                    }.bind(this));

                }, this);

                chrome.extension.onMessage.addListener(function (request, sender, callback) {
                    var action = request.action;
                    var data = request.data;
                    if (action == 'addNewPhotos') {
                        me.set(data);
                        me.trigger('addNewPhotos');
                    };
                });
            }
        });

        return PhotosCollection;
    });
}(this));