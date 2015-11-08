////////////////////////////////////////////////////////////////////////////////////////////////////
// bottomsheet /////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

const bottomsheet = (function() {
	return {
		open: function($content, addClass) {
			backdrop.show();
			$bottomsheet.html($content).addClass((addClass? addClass + " " : "") + "in").reflow().addClass("slide");

			theme_color["buffer"] = $theme_color.attr("content");
			$theme_color.attr("content", "#000");

			$backdrop.on("hide", bottomsheet.close);

			view_manager.add("bottomsheet");
			history.pushState({ "view": "bottomsheet" }, null, null);
		},
		close: function() {
			$bottomsheet.removeClass("slide").one("transitionend", function() {
				$bottomsheet.removeClass("in").empty().removeClass();
			});

			$theme_color.attr("content", theme_color["buffer"]);

			backdrop.hide();

			view_manager.remove("bottomsheet");
		}
	};
})();

// jQuery
let $bottomsheet;

$(function() {
	$bottomsheet = $("#bottom-sheet");
});
