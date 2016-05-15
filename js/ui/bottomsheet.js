////////////////////////////////////////////////////////////////////////////////////////////////////
// bottomsheet
UI.bottomsheet = (function() {
	return {
		open: function($content, addClass) {
			UI.backdrop.show($ui["bottomsheet"]);
			$ui["bottomsheet"].html($content).addClass((addClass? addClass + " " : "") + "in").reflow().addClass("slide");

			theme_color["buffer"] = $theme_color.attr("content");
			$theme_color.attr("content", "#000");

			$ui["backdrop"].on("hide", UI.bottomsheet.close);

			router["view-manager"].add("bottomsheet");
			history.pushState({ "view": "bottomsheet" }, null, null);
		},
		close: function() {
			$ui["bottomsheet"].removeClass("slide").one("transitionend", function() {
				$ui["bottomsheet"].removeClass("in").empty().attr("class", "ui-bottomsheet js-ui-bottomsheet");
			});

			$theme_color.attr("content", theme_color["buffer"]);

			UI.backdrop.hide();

			router["view-manager"].remove("bottomsheet");
		}
	};
})();

$(function() {
	$ui["bottomsheet"] = $(".js-ui-bottomsheet");
});
