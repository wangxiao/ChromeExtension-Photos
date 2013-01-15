/*global $, define, Backbone*/
(function (window, undefined) {
    define([], function () {
        var PhotoModel = Backbone.Model.extend();

        var PhotosCollection = Backbone.Collection.extend({
            url : '/api/v1/resource/photos/',
            model : PhotoModel,
            initialize : function () {
                this.on('update', function () {
                    this.fetch({
                        success : function (collection) {
                            collection.trigger('refresh', collection);
                        }
                    });
                }, this);
            }
        });

        return PhotosCollection;
    });
}(this));