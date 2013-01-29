/*global $, define, Backbone*/
(function (window, undefined) {
    define([], function () {
        var chrome = window.chrome;

        var PhotoModel = Backbone.Model.extend();

        var PhotosCollection = Backbone.Collection.extend({
            model : PhotoModel,
            initialize : function () {
                this.on('update', function () {
                    chrome.extension.sendMessage({
                        action : 'fetchPhotoList'
                    }, function (resp) {
                        this.update(resp, {
                            parse : true
                        });

                        this.trigger('refresh', this);
                    }.bind(this));
                }, this);
            }
        });

        return PhotosCollection;
    });
}(this));