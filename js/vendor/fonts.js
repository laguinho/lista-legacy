////////////////////////////////////////////////////////////////////////////////////////////////////
// fonts ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

WebFont.load({
	timeout: 10000,
	google: {
		families: [
			"Material Icons",
			"Roboto:400,400italic,500:latin",
			"Roboto+Mono:700:latin",
			"Lato:400:latin"
		]
	},
	// custom: {
	// 	families: [
	// 		"FontAwesome"
	// 	], urls: [
	// 		"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css"
	// 	]
	// },
	active: function() {
		$(function() {
			app.Lista.layout();
		});
	}
});