var snappea_changeLoading = function(){
	$('.snappea-img').attr('src','http://web.snappea.com/images/loading.gif').removeClass('snappea-img').addClass('snappea-img2');
};

setInterval(snappea_changeLoading,500);