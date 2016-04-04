////////////////////////////////////////////////////////////////////////////////////////////////////
// template engine /////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
let $templates = { };

$(function() {
	$("template").each(function() {
		let $this = $(this);
		let name = $this.attr("id");
		let html = $this.html();

		$templates[name] = $(html);
		$this.remove();
	});
});

function __render(template, data) {
	if (!$templates[template]) { return false; }
	let $render = $templates[template].clone();

	$render.data(data);

	$.fn.fillBlanks = function() {
		let $blank = $(this);
		let fill = $blank.data("fill");
		let object = $blank.data("fill-object");
		let field = $blank.data("fill-field"); // deprecated
		let attr = $blank.data("fill-attr"); // deprecated
		let content;

		// nova sintaxe
		if (fill) {
			let rules = fill.split(",");
			for (var i = 0; i < rules.length; i++) {
				let pair = rules[i].split(":");
				let dest = (pair[1]? pair[0].trim() : "html");
				let source = (pair[1]? pair[1].trim() : pair[0]);
				let value;

				source = source.split("/");
				if (source.length > 1) {
					// TODO aceitar mais de um nível
					// let final_source = "data";
					// for (let level in source) {
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
					let if_null = $blank.data("fill-null");
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
				let if_null = $blank.data("fill-null");
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
