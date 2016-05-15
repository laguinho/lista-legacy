////////////////////////////////////////////////////////////////////////////////////////////////////
// backdrop
UI.backdrop = (function() {
	return {
		show: function($screen) {
			var zindex = $screen.css("z-index") - 1;
			$ui["backdrop"].css("z-index", zindex).addClass("in");
		},
		hide: function() {
			$ui["backdrop"].removeClass("in").css("z-index", "").off("hide");
		}
	};
})();

$(function() {
	$ui["backdrop"] = $(".js-ui-backdrop");
	$ui["backdrop"].on("click", function() {
		$ui["backdrop"].trigger("hide");
	});
});
