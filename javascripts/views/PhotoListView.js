/*global $, define, Backbone*/
(function (window, undefined) {
    define(['collections/PhotosCollection'], function (PhotosCollection) {

        var document = window.document;
        var chrome = window.chrome;

        var PhotoItemView = Backbone.View.extend({
            className : 'w-photo-item',
            tagName : 'li',
            render : function () {
                this.$el.append($('<img>').attr({
                    src : this.model.get('thumbnail_path')
                }));
                return this;
            }
        });

        var PhotoList = Backbone.View.extend({
            initialize : function () {
                this.$el = $('#photo-list');
                this.delegateEvents();

                this.collection = new PhotosCollection();
            },
            renderThread : function () {
                var fragment = document.createDocumentFragment();
                var start = this.$('#photo-ctn').children().length;
                var pageSize = 15;
                var i;
                var item;
                for (i = start; i < start + pageSize; i++) {
                    item = this.collection.at(i);
                    if (item !== undefined) {
                        fragment.appendChild(new PhotoItemView({
                            model : item
                        }).render().$el[0]);
                    } else {
                        break;
                    }
                }
                this.$('#photo-ctn').append(fragment);
            },
            renderPhotos : function () {
                this.collection.trigger('update');

                this.collection.on('refresh', function (collection) {
                    this.renderThread();
                }, this);

                this.$el.on('scroll', function () {
                    var ele = this.$el[0];
                    if (ele.scrollTop + ele.offsetHeight + 30 >= ele.scrollHeight) {
                        this.renderThread();
                    }
                }.bind(this));
            },
            renderAsync : function () {
                var deferred = $.Deferred();

                chrome.extension.sendMessage({
                    action : 'getTemplate',
                    data : {
                        id : 'list-ctn'
                    }
                }, function (resp) {
                    this.$el = $(resp);
                    this.delegateEvents();

                    this.renderPhotos();

                    deferred.resolve(this);
                }.bind(this));

                return deferred.promise();
            }
        });

        return PhotoList;
    });
}(this));