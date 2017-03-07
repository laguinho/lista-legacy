////////////////////////////////////////////////////////////////////////////////////////////////////
// ui toast ////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

UI.toast = (function() {
	$ui["toast"] = [ ];

	$(function() {
		$ui["toast"] = $(".js-ui-toast");
		$ui["toast"]["message"] = $(".toast-message", $ui["toast"]);
		$ui["toast"]["label"] = $(".toast-label", $ui["toast"]);
	});

	return {
		// TODO nova sintaxe, usar template e __render
		show: function(config) {
			// Opções:
			// • "message" [string]
			// • "label" [string]
			// • "action" [function]
			// • "persistent" [boolean]
			// • "timeout" [integer] default: 6000
			// • "start-only" [boolean]

			if (typeof config === "object") {
				$ui["toast"].removeClass("start-only");

				// Texto do toast
				$ui["toast"]["message"].html(config["message"] || "");

				// Texto da ação
				// (Só mostra de texto e ação estiverem definidos)
				if (config["label"] && config["action"]) {
					$ui["toast"]["label"]
						.html(config["label"])
						.off("click")
						.on("click", config["action"])
						.show();
				} else {
					$ui["toast"]["label"]
						.hide();
				}

				$ui["toast"].addClass("in").reflow().addClass("slide");
				$ui["body"].addClass("toast-active");

				// TODO: .fab-bottom transform: translateY

				// Ao clicar no toast, fecha ele
				$ui["toast"].on("click", UI.toast.dismiss);
				clearTimeout(timing["toast"]);

				// Se não for persistente,
				// fecha depois de um tempo determinado
				if (!config["persistent"]) {
					timing["toast"] = setTimeout(UI.toast.dismiss, (config["timeout"]? config["timeout"] : 6000));
				}

				// Se for pra ser exibido só na tela inicial
				if (config["start-only"]) {
					$ui["toast"].addClass("start-only");
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
				$ui["toast"].removeClass("in start-only");

				$ui["toast"]["message"].empty();
				$ui["toast"]["label"].empty();
			});
			clearTimeout(timing["toast"]);
		},

		// TODO DEPRECATED
		open: function(message, action, callback, persistent) {
		// open: function(message, addClass) {
			$ui["toast"].message.html(message);
			$ui["toast"].label.html((action? action : ""));
			$ui["toast"].addClass("in").reflow().addClass("slide");
			$ui["body"].addClass("toast-active");

			// TODO: .fab-bottom transform: translateY

			$ui["toast"].on("click", UI.toast.dismiss);
			$ui["toast"].label.on("click", callback);

			clearTimeout(timing["toast"]);

			if (!persistent) {
				$ui["toast"].removeClass("stream-only");
				timing["toast"] = setTimeout(UI.toast.dismiss, 6500);
			} else {
				$ui["toast"].addClass("stream-only");
			}
		}
	};
})();

// var toast = UI.toast;
// toast.close = UI.toast.dismiss;

// var snackbar = toast;
