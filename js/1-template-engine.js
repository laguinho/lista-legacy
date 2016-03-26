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
		let field = $blank.data("fill-field");
		let attr = $blank.data("fill-attr");
		let content;

		// nova sintaxe
		if (fill) {
			let rules = fill.split(",");
			for (let rule of rules) {
				let pair = rule.split(":");
				let dest = (pair[1]? pair[0].trim() : "html");
				let source = (pair[1]? pair[1].trim() : pair[0]);

				if (dest === "class") {
					$blank.addClass(data[source]);
				} else if (dest === "html") {
					$blank.html(data[source]);
				} else if (dest === "value") {
					$blank.val(data[source]);
				} else {
					$blank.attr(dest, data[source]);
				}

				// console.log("[" + dest + ": " + source + "]", data, data[source]);
			}
		} else {
			// deprecated
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
