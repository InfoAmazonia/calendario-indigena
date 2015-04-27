require('./legend-disc')();
require('./viz');

require('fitvids/jquery.fitvids');

var jQuery = $ = require('jquery');

$(document).ready(function() {
	// fit vids
	$('body').fitVids();

	// fixed content nav

	(function() {

		var $nav = $('#content-nav');
		var offset = $nav.offset().top;
		
		var clone = false;

		$(document).resize(function() {
			offset = $nav.offset().top;
		});

		$(window).scroll(function() {
			var scrollTop = $(window).scrollTop();

			if(scrollTop >= offset) {
				if(!clone && !clone.length) {
					clone = $nav.clone();
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