////////////////////////////////////////////////////////////////////////////////////////////////////
// ui / backdrop ///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// UI.backdrop.show()
// UI.backdrop.hide()

UI.backdrop = (function() {
	$ui["backdrop"] = [ ];

	$(function() {
		// $ui["backdrop"] = $(".js-ui-backdrop");
		// $ui["backdrop"].on("click", function() {
		// 	$ui["backdrop"].trigger("hide");
		// });
	});

	return {
		show: function($screen, events) {
			var screen = $screen["selector"];
			var zindex = $screen.css("z-index") - 1;

			$ui["backdrop"][screen] = __render("backdrop");

			$.each(events, function(event, handler) {
				$ui["backdrop"][screen].on(event, handler)
			});

			$ui["backdrop"][screen].css("z-index", zindex)
				.on("click", function() { $(this).trigger("hide"); })
				.appendTo($ui["body"])
				.addClass("in");
		},
		hide: function($screen) {
			var screen = $screen["selector"];
			$ui["backdrop"][screen].removeClass("in").off("hide").remove();
		}
	};
})();
