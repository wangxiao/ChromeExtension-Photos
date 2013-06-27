/*global $, define, Backbone*/
(function (window, undefined) {
    define(['../LoginHelper'], function (LoginHelper) {
        var chrome = window.chrome;

        var PhotoModel = Backbone.Model.extend();

        var PhotosCollection = Backbone.Collection.extend({
            initialize : function () {
                var me = this;
                this.on('update', function () {
                    var isFirst = true ;
                    var photos = [];
                    var getPhotoData = function(offset, length, cursor){
                        $.ajax({
                            url : LoginHelper.getServerURL() + '/api/v1/resource/photos/',
                            xhrFields: {
                                withCredentials : true
                            },
                            data:{
                                offset:offset,
                                length:length,
                                cursor:cursor
                            },
                            success : function (resp) {
                                for(var i = 0 , l = resp.length; i < l; i++) {
                                    photos.push(resp[i]);
                                };

                                //是否是第一次加载
                                if(isFirst){
                                    me.set(resp);
                                    me.trigger('refresh', me);
                                    isFirst = false;
                                }else{
                                    chrome.extension.sendMessage({
                                        action : 'addNewPhotos',
                                        data : photos
                                    });
                                };
                                //是否数据仍未加载完
                                if( l === length){
                                    getPhotoData(0, length, resp[l - 1].id); 
                                };
                            },
                            error : function (resp) {
                            }
                        });

                    };

                    //执行加载数据
                    getPhotoData(0, 15, '');

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