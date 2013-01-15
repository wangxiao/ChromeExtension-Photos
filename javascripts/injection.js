/*global $, Backbone*/
(function (window, undefined) {
    var document = window.document;
    var chrome = window.chrome;
    var domMap = {};

    setInterval(function () {
        var selector;
        for (selector in domMap) {
            if (domMap.hasOwnProperty(selector) && $(selector).length > 0) {
                var i;
                var callback;
                for (i = 0; i < domMap[selector].length; i++) {
                    callback = domMap[selector][i];
                    callback($(selector));
                }
                delete domMap[selector];
            }
        }
    }, 300);

    var helper = {
        waitForElement : function (selector, callback) {
            if ($(selector).length > 0) {
                callback($(selector));
            } else {
                if (!domMap[selector]) {
                    domMap[selector] = [];
                }
                domMap[selector].push(callback);
            }
        },
        exists : function (selector) {
            return $(selector).length > 0;
        }
    };
    var server;

    if (Backbone && Backbone.sync) {
        var methodMap = {
            'create' : 'GET',
            'update' : 'GET',
            'delete' : 'GET',
            'read' : 'GET'
        };

        Backbone.sync = function (method, model, options) {
            $.ajax({
                url : server + model.url,
                data : model.data || {},
                type : methodMap[method],
                success : options.success,
                error : options.error
            });
        };
    }

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

    var PhotoItemView = Backbone.View.extend({
        className : 'w-photo-item',
        tagName : 'li',
        render : function () {
            this.$el.append($('<img>').attr({
                src : this.model.get('thumbnail_path'),
            })).data('src', this.model.get('path'));
            return this;
        }
    });

    var PhotoListView = Backbone.View.extend({
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
        },
        clickItem : function () {
            this.$el.remove();

            chrome.extension.sendMessage({
                action : 'getTemplate',
                data : {
                    id : 'photo-item'
                }
            }, function (resp) {
                $('[aria-label="Opened text area for composing a reply"]').last().append($(resp).append($('img').attr({
                    src : 'https://lh3.googleusercontent.com/-HKKz-Ipz3UE/AAAAAAAAAAI/AAAAAAAAACw/Y6rOVZJ6at8/s75/photo.jpg'
                })));
            }.bind(this));
        },
        events : {
            'click li' : 'clickItem'
        }
    });

    var $addor = $('<div>').addClass('wG J-Z-I J-J5-Ji')
                            .append($('<div>').addClass('J-J5-Ji J-Z-I-Kv-H').append($('<div>').addClass('J-J5-Ji J-Z-I-J6-H').html('添加')));
    var $photoList;

    $addor[0].addEventListener('click', function (evt) {
        var photoListView = new PhotoListView();
        photoListView.renderAsync().done(function (photoListView) {
            $('body').append(photoListView.$el);
        });
    }, true);

    var initAddor = function () {
        setInterval(function () {
            if (helper.exists('.aZ .wL.wN') && $('.aZ .wL.wN').find($addor).length === 0) {
                $('.aZ .wL.wN').prepend($addor);
            }
        }, 300);
    };

    var loginHelper = setInterval(function () {
        chrome.extension.sendMessage({
            action : 'getServerURL',
            data : {
                id : 'login'
            }
        }, function (resp) {
            if (resp) {
                server = resp;
                initAddor();
                clearInterval(loginHelper);
            }
        });
    }, 1000);


    // var renderPhotos = function (list) {
    //     var i;
    //     for (i = 0; i < list.length; i++) {
    //         $photos.find('#photo-ctn').append($('<li><img src="' + server + list[i].thumbnail_path + '" alt="" /></li>'));
    //     }
    // };
}(this));