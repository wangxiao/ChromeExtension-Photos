/*global $, define, Backbone*/
(function (window, undefined) {
    define([
        'collections/PhotosCollection'
    ], function (
        PhotosCollection
    ) {
        var document = window.document;
        var chrome = window.chrome;
        var imgNum = 0;
        var isFirst = true;
        var PhotoItemView = Backbone.View.extend({
            className : 'w-photo-item',
            tagName : 'li',
            render : function () {
                var $img = $('<img id="sanppea-img-'+this.model.get('id')+'" class="snappea-img">').attr({
                    src : this.model.get('thumbnail_path')
                });
                imgNum ++ ;
                
                //增加loading背景图，可能会增加性能问题
                this.$el.addClass('loading');
                
                this.$el.append($img);

                $img.one('load', function () {
                    var withLtHeight = $img[0].width > $img[0].height;

                    if (withLtHeight) {
                        var w = $img[0].width * (72 / $img[0].height);
                        $img.css({
                            height : 72,
                            width : w,
                            left : -(w-72)/2,
                            top : 0
                        });
                    } else {
                        var h = $img[0].height * (72 / $img[0].width);
                        $img.css({
                            height : h,
                            width : 72,
                            left : 0,
                            top : -(h-72)/2
                        });
                    };

                });
                
                return this;
            },

            clickItem : function () {
                _gaq.push(['_trackEvent', '图片页面', '点击图片']);

                chrome.extension.sendMessage({
                    action : 'preview',
                    data : {
                        id : this.model.id
                    }
                });
            },

            // mousedown : function (evt){

            //     var url = this.model.get('path');

            //     var orientation = this.model.get('orientation');
            //     var w = this.model.get('thumbnail_width')*2;
            //     var h = this.model.get('thumbnail_height')*2;
            //     chrome.extension.sendMessage({
            //         action : 'mousedown',
            //         data:{
            //             id : evt.target.id,
            //             orientation : orientation,
            //             width :w,
            //             height:h,
            //             url : url
            //         }
            //     });
            // },

            events : {
                //'mousedown' : 'mousedown',
                'click' : 'clickItem'
            }
        });

        var PhotoListView = Backbone.View.extend({
            initialize : function () {
                this.$el = $('#photo-list');
                this.delegateEvents();
                this.collection = new PhotosCollection();
            },
            renderThread : function () {
                var me = this ;
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
                if(isFirst && this.$('#photo-ctn').children().length === 0){
                    $('#no-photo').show();
                    isFirst = false;
                };
            },

            renderPhotos : function () {
                var me = this;
                $('.w-ui-loading').show();
                this.collection.trigger('update');

                this.collection.on('refresh', function (collection) {
                    this.renderThread();
                    var text = window.localStorage.getItem('wdj-phone-name');
                    var phoneName = this.$('.phone-name').attr('title',text);
                    if(text.length>24){
                        text = text.substr(0,20)+'...';
                    };
                    phoneName.text(text);
                    $('.w-ui-loading').hide();
                }, this);

                this.collection.on('addNewPhotos', this.renderThread, this);
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

                    var text = window.localStorage.getItem('wdj-phone-name');
                    var phoneName = this.$('.phone-name').attr('title',text);
                    if(text.length>24){
                        text = text.substr(0,20)+'...';
                    };
                    phoneName.text(text);
                    this.renderPhotos();

                    this.$el.on('scroll', function () {
                        var ele = this.$el[0];
                        if (ele.scrollTop + ele.offsetHeight + 30 >= ele.scrollHeight) {
                            this.renderThread();
                            this.addNewPhotos();
                        }
                    }.bind(this));

                    deferred.resolve(this);
                }.bind(this));

                return deferred.promise();
            },
            clickButtonRefresh : function () {
                this.$('#photo-ctn').empty();
                this.renderPhotos();
            },
            clickButtonLogout : function () {
                _gaq.push(['_trackEvent', '图片页面', '点击退出']);                
                chrome.extension.sendMessage({
                    action : 'logout',
                }, function () {

                    //直接刷新页面会变白，所以改为关闭。
                    //window.location.reload();
                    window.close();

                });
            },
            showDeviceList : function() {
                _gaq.push(['_trackEvent', '图片页面', '切换多设备']);   
                
                var i18n = chrome.i18n.getMessage;             
                chrome.tabs.create({
                    url : i18n('DEVICE_LIST_URL')
                })
            },
            events: {
                'click .button-logout' : 'clickButtonLogout',
                'click .button-refresh' : 'clickButtonRefresh',
                'click .show-device-list' : 'showDeviceList'
            }
        });

        return PhotoListView;
    });
}(this));