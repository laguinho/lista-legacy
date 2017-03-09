////////////////////////////////////////////////////////////////////////////////////////////////////
// fonts ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Cria uma promise que será resolvida
// quando as fontes forem carregadas
cue["load-fonts"] = $.Deferred();

WebFont.load({
	timeout: 15000,
	google: {
		families: [
			"Material Icons",
			// "Roboto:400,400italic,500:latin",
			// "Roboto+Mono:700:latin",
			"Lato:400:latin"
		]
	},
	custom: {
		families: [
			"FontAwesome"
		],
		urls: [
			"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
		]
	},
	active: function() {
		cue["load-fonts"].resolve();

		$(function() {
			app.Lista.layout();
		});
	}
});
