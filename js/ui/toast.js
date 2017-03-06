////////////////////////////////////////////////////////////////////////////////////////////////////
// ui toast ////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

UI.toast = (function() {
	$ui["toast"] = [ ];

	$(function() {
		$ui["toast"] = $(".js-ui-toast");
		$ui["toast"]["message"] = $(".toast-message", $ui["toast"]);
		$ui["toast"]["action"] = $(".toast-action", $ui["toast"]);
	});

	return {
		// TODO nova sintaxe, usar template e __render
		show: function(config) {
			if (typeof config === "object") {
				$ui["toast"]["message"].html(config["message"]);
				$ui["toast"]["action"].html((config["action"]? config["action"] : ""));
				$ui["toast"].addClass("in").reflow().addClass("slide");
				$ui["body"].addClass("toast-active");

				// TODO: .fab-bottom transform: translateY

				$ui["toast"].on("click", UI.toast.dismiss);
				$ui["toast"]["action"].on("click", config["callback"]);

				clearTimeout(timeout["toast"]);

				if (!config["persistent"]) {
					$ui["toast"].removeClass("stream-only");
					timeout["toast"] = setTimeout(UI.toast.dismiss, (config["timeout"]? config["timeout"] : 6000));
				} else {
					$ui["toast"].addClass("stream-only");
				}
			} else {
				UI.toast.show({
					"message": config
				})
			}
		},

		dismiss: function() {
			$ui["toast"].removeClass("slide").one("transitionend", function() {
				$ui["body"].removeClass("toast-active");
				$ui["toast"].removeClass("in stream-only");

				$ui["toast"]["message"].empty();
				$ui["toast"]["action"].empty();
			});
			clearTimeout(timeout["toast"]);
		},

		// TODO DEPRECATED
		open: function(message, action, callback, persistent) {
		// open: function(message, addClass) {
			$ui["toast"].message.html(message);
			$ui["toast"].action.html((action? action : ""));
			$ui["toast"].addClass("in").reflow().addClass("slide");
			$ui["body"].addClass("toast-active");

			// TODO: .fab-bottom transform: translateY

			$ui["toast"].on("click", UI.toast.dismiss);
			$ui["toast"].action.on("click", callback);

			clearTimeout(timeout["toast"]);

			if (!persistent) {
				$ui["toast"].removeClass("stream-only");
				timeout["toast"] = setTimeout(UI.toast.dismiss, 6500);
			} else {
				$ui["toast"].addClass("stream-only");
			}
		}
	};
})();

// var toast = UI.toast;
// toast.close = UI.toast.dismiss;

// var snackbar = toast;
