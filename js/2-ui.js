////////////////////////////////////////////////////////////////////////////////////////////////////
// ui //////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var UI = { }, $ui = [ ];
UI["data"] = [ ];

////////////////////////////////////////////////////////////////////////////////////////////////////
// body
UI.body = (function() {
	return {
		lock: function() {
			$ui["body"].addClass("no-scroll");
		},
		unlock: function() {
			$ui["body"].removeClass("no-scroll");
		}
	};
})();

$(function() {
	$ui["body"] = $(document.body);
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// backdrop
UI.backdrop = (function() {
	return {
		show: function() {
			$ui["backdrop"].addClass("in");
		},
		hide: function() {
			$ui["backdrop"].removeClass("in").off("hide");
		}
	};
})();

$(function() {
	$ui["backdrop"] = $(".js-ui-backdrop");
	$ui["backdrop"].on("click", function() {
		$ui["backdrop"].trigger("hide");
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// sidenav
UI.sidenav = (function() {
	return {
		open: function() {
			UI.body.lock();
			UI.backdrop.show();
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

////////////////////////////////////////////////////////////////////////////////////////////////////
// reflow
$.fn.reflow = function() {
	var offset = $ui["body"].offset().left;
	return $(this);
};

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// confere se a interação é por toque ou mouse
UI.data["interaction-type"] = ("ontouchstart" in window || navigator.msMaxTouchPoints)? "touch" : "pointer";
$(function() {
	$ui["body"].addClass("ui-" + UI.data["interaction-type"]);
});

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// legacy

var $window, $body;

$(function() {
	$ui["window"] = $(window);

	$window = $ui["window"];
	$body = $ui["body"];
	$theme_color = $("meta[name='theme-color']");
	theme_color["original"] = $theme_color.attr("content");
});
