////////////////////////////////////////////////////////////////////////////////////////////////////
// toast ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

UI.toast = (function() {
	return {
		// TODO nova sintaxe, usar template e __render
		// show: function(config) {
		// 	if (typeof config === "object") {
		//
		// 	} else {
		//
		// 	}
		// },
		//
		// dismiss: function() {
		//
		// },

		// TODO DEPRECATED
		open: function(message, action, callback, persistent) {
		// open: function(message, addClass) {
			$toast.message.html(message);
			$toast.action.html((action? action : ""));
			$toast.addClass("in").reflow().addClass("slide");
			$body.addClass("toast-active");

			// TODO: .fab-bottom transform: translateY

			$toast.on("click", toast.close);
			$toast.action.on("click", callback);

			clearTimeout(timeout["toast"]);
			if (!persistent) {
				$toast.removeClass("stream-only");
				timeout["toast"] = setTimeout(toast.close, 6500);
			} else {
				$toast.addClass("stream-only");
			}
		},

		close: function() {
			$body.removeClass("toast-active");
			$toast.removeClass("slide").one("transitionend", function() {
				$toast.removeClass("in").removeClass();
				$toast.message.empty();
			});
			clearTimeout(timeout["toast"]);
		}
	};
})();

const toast = UI.toast;

// const snackbar = toast;

// jQuery
let $toast;

$(function() {
	$toast = $("#toast");
	$toast.message = $(".message", $toast);
	$toast.action = $(".action", $toast);
});
