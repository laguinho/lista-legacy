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
