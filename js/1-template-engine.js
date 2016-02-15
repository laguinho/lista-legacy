////////////////////////////////////////////////////////////////////////////////////////////////////
// template engine /////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
let $templates = { };

$(function() {
	$("template").each(function() {
		let name = $(this).attr("id");
		let html = $(this).html();

		$templates[name] = $(html);
	});
});

function __render(template, data) {
	let $render = $templates[template].clone();

	$.fn.fillBlanks = function() {
		let $blank = $(this);
		let field = $blank.data("fill-field");
		let attr = $blank.data("fill-attr");

		if (attr == "class") {
			$blank.addClass(data[field]);
		} else if (attr) {
			$blank.attr(attr, data[field]);
		} else {
			$blank.html(data[field]);
		}

		$blank
			.removeClass("fill")
			.removeAttr("data-fill-field")
			.removeAttr("data-fill-attr");
	};

	if ($render.hasClass("fill")) {
		$render.fillBlanks();
	}

	$(".fill", $render).each(function() {
		$(this).fillBlanks();
	});

	return $render;
}
