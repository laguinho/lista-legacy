////////////////////////////////////////////////////////////////////////////////////////////////////
// template engine /////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var $templates = { };

$(function() {
	$("template").each(function() {
		var $this = $(this);
		var name = $this.attr("id");
		var html = $this.html();

		$templates[name] = $(html);
		$this.remove();
	});
});

function __render(template, data) {
	if (!$templates[template]) { return false; }
	var $render = $templates[template].clone();

	$render.data(data);

	$.fn.fillBlanks = function() {
		var $blank = $(this);
		var fill = $blank.data("fill");
		var object = $blank.data("fill-object");
		var field = $blank.data("fill-field"); // deprecated
		var attr = $blank.data("fill-attr"); // deprecated
		var content;

		// nova sintaxe
		if (fill) {
			var rules = fill.split(",");
			for (var i = 0; i < rules.length; i++) {
				var pair = rules[i].split(":");
				var dest = (pair[1]? pair[0].trim() : "html");
				var source = (pair[1]? pair[1].trim() : pair[0]);
				var value;

				source = source.split("/");
				if (source.length > 1) {
					// TODO aceitar mais de um nível
					// var final_source = "data";
					// for (var level in source) {
					// 	final_source += "[source[" + level + "]]";
					// }
					// console.log(source);
					// console.log(final_source, data[final_source]);
					// console.log(data[source[0]][source[1]]);
					value = data[source[0]][source[1]];
				} else {
					value = data[source];
				}

				if (value) {
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

				// console.log("[" + dest + ": " + source + "]", data, data[source]);
			}
		}

		// deprecated
		else {
			if (!object) {
				content = data[field];
			} else if (object && data[object]) {
				content = data[object][field];
			}

			if (content) {
				if (attr === "class") {
					$blank.addClass(content);
				} else if (attr) {
					$blank.attr(attr, content);
				} else {
					$blank.html(content);
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
			.removeAttr("data-fill-object")
			.removeAttr("data-fill-field")
			.removeAttr("data-fill-attr")
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
