////////////////////////////////////////////////////////////////////////////////////////////////////
// sidenav /////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

const sidenav = (function() {
	return {
		open: function() {
			backdrop.show();
			$sidenav.addClass("in");
			$body.addClass("no-scroll");

			$backdrop.on("hide", sidenav.close);
		},
		close: function() {
			$body.removeClass("no-scroll");
			$sidenav.removeClass("in");
			backdrop.hide();
		}
	};
})();

// jQuery
let $sidenav;

$(function() {
	$sidenav = $("#sidenav");
	$(".sidenav-trigger").on("click", function(event) {
		event.preventDefault();
		sidenav.open();
	});
});
