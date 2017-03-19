////////////////////////////////////////////////////////////////////////////////////////////////////
// template engine /////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

let $templates = { };

$(function() {
	// Pega os templates do HTML,
	// guarda em $templates
	// e remove eles do código-fonte
	$("template").each(function() {
		let $this = $(this);
		let name = $this.attr("id");
		let html = $this.html();

		$templates[name] = $(html);
		$this.remove();
	});
});

function __render(template, data) {
	// Se template não existir, aborta
	if (!$templates[template]) {
		return false;
	}

	var $render = $templates[template].clone();

	$render.data(data);

	$.fn.fillBlanks = function() {
		var $blank = $(this);
		var fill = $blank.data("fill");

		var rules = fill.split(",");
		for (var i = 0; i < rules.length; i++) {
			var pair = rules[i].split(":");
			var dest = (pair[1]? pair[0].trim() : "html");
			var source = (pair[1]? pair[1].trim() : pair[0]);
			var value = data[source];

			// TODO
			// source = source.split("/");
			// if (source.length > 1) {
			// 	// value = data[source[0]];
			// 	// console.log(source, source, value);
			// 	// if (typeof value !== "undefined") {
			// 		for (var j = 0; j <= source.length; j++) {
			// 			console.log(value, source, data[source[0]]);
			// 			if (value && value[source] && source[j] && value[source[j]]) {
			// 				value = (value[source[j]])? value[source[j]] : null;
			// 			} else {
			// 				value = null;
			// 			}
			// 		}
			// 	// }
			// }

			if (typeof value !== "undefined" && value !== null) {
				if (dest === "class") {
					$blank.addClass(value);
				} else if (dest === "html") {
					$blank.html(value);
				} else if (dest === "value") {
					$blank.val(value);
				} else {
					$blank.attr(dest, value);
				}
			} else {
				var if_null = $blank.data("fill-null");
				if (if_null === "hide") {
					$blank.hide();
				} else if(if_null === "remove") {
					$blank.remove();
				}
			}
		}

		$blank
			.removeClass("fill")
			.removeAttr("data-fill")
			.removeAttr("data-fill-null");
	};

	if ($render.hasClass("fill")) {
		$render.fillBlanks();
	}

	$(".fill", $render).each(function() {
		$(this).fillBlanks();
	});

	return $render;
}
