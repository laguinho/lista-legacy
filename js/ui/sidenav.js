////////////////////////////////////////////////////////////////////////////////////////////////////
// sidenav
UI.sidenav = (function() {
	return {
		open: function() {
			UI.body.lock();
			UI.backdrop.show($ui["sidenav"]);
			$ui["sidenav"].addClass("in");

			$ui["backdrop"].on("hide", UI.sidenav.close);
		},
		close: function() {
			$ui["sidenav"].removeClass("in");
			UI.backdrop.hide();
			UI.body.unlock();
		}
	};
})();

$(function() {
	$ui["sidenav"] = $(".js-ui-sidenav");

	$(".js-sidenav-trigger").on("click", function(event) {
		event.preventDefault();
		UI.sidenav.open();
	});
});
