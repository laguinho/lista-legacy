////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

UI.data = [ ];

////////////////////////////////////////////////////////////////////////////////////////////////////

// confere se a interação é por toque ou mouse
UI.data["interaction-type"] = ("ontouchstart" in window || navigator.msMaxTouchPoints)? "touch" : "pointer";
$(function() {
	$ui["body"].addClass("ui-" + UI.data["interaction-type"]);
});

////////////////////////////////////////////////////////////////////////////////////////////////////

// calcula dimensões da janela e do layout
function setLayoutProperties() {
	// largura da coluna, incluindo margem
	UI.data["column-width"] = 316;

	// guarda dimensão da janela
	UI.data["window"] = [ ];
	UI.data["window"]["width"] = $ui["window"].width();
	UI.data["window"]["height"] = $ui["window"].height();

	// calcula número de colunas
	UI.data["columns"] = Math.floor(UI.data["window"]["width"] / UI.data["column-width"]);

	// adiciona classe no <body> de acordo com a quantidade de colunas
	var layout_class;
	if (UI.data["columns"] === 1) {
		layout_class = "ui-single-column";
	} else if (UI.data["columns"] === 2) {
		layout_class = "ui-dual-column";
	} else {
		layout_class = "ui-multi-column";
	}

	$ui["body"].removeClass("ui-single-column ui-dual-column ui-multi-column").addClass(layout_class);
}

$(document).on("ready", setLayoutProperties);
$ui["window"].on("resize", setLayoutProperties);

////////////////////////////////////////////////////////////////////////////////////////////////////

// scroll
UI.data["scroll-position"] = [ ];

function setScrollPosition() {
	UI.data["scroll-position"]["top"] = $ui["window"].scrollTop();
	UI.data["scroll-position"]["bottom"] = UI.data["scroll-position"]["top"] + UI.data["window"]["height"];
}

$(document).on("ready", setScrollPosition);
$ui["window"].on("scroll", setScrollPosition);

////////////////////////////////////////////////////////////////////////////////////////////////////
