require('./legend-disc')();
require('./viz');

require('fitvids/jquery.fitvids');

var jQuery = $ = require('jquery');

$(document).ready(function() {
	// fit vids
	$('body').fitVids();

	// fit video and map container
	(function() {
		var $video = $('#video,#map');
		$(window).resize(function() {
			var offset = $video.offset().left;
			var siteWidth = $('body').width();
			$video.width(siteWidth-offset-40);
		});
		$(window).resize();
	})();

	// fixed content nav

	(function() {

		var $nav = $('#content-nav');
		var offset = $nav.offset().top;
		
		var clone = false;

		$(window).resize(function() {
			offset = $nav.offset().top;
			if(clone) {
				clone.css({
					width: $nav.width(),
					left: $nav.offset().left
				});
			}
		});

		$(window).scroll(function() {
			var scrollTop = $(window).scrollTop();

			if(scrollTop >= offset) {
				if(!clone && !clone.length) {
					clone = $nav.clone();
					clone.css({
						width: $nav.width(),
						left: $nav.offset().left
					});
					clone.addClass('fixed').insertAfter($nav);
				}
			} else {
				if(clone && clone.length) {
					clone.remove();
					clone = false;
				}
			}
		});

	})();
});