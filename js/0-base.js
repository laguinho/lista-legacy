var edicao = "xcii";

var Lista = [ ];
Lista.Regulamento = [ ];
Lista.Tarefas = [ ];

var app = [ ];

// laguinho.org/tarefas
var tarefas = { };
$(function() {

});


////////////////////////////////////////////////////////////////////////////////////////////////////
// elements & helpers //////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var timeout = [ ];
var $theme_color, theme_color = { };
var tarefa_active;

function rand(min, max) { return Math.random() * (max - min) + min; }


////////////////////////////////////////////////////////////////////////////////////////////////////
// ui //////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// o objeto "ui" guarda informações sobre a interface, como dimensões e tipo de interação
var ui  = { };

function setLayoutProperties() {
	// largura da coluna, incluindo margem
	var column_width = 316;

	// guarda dimensão da janela
	ui["window"] = { };
	ui["window"]["width"] = $window.width();
	ui["window"]["height"] = $window.height();

	// calcula número de colunas
	ui["columns"] = Math.floor(ui["window"]["width"] / column_width);

	// adiciona classe no <body> de acordo com a quantidade de colunas
	var layout_class;
	if(ui["columns"] === 1) layout_class = "single-column";
	else if(ui["columns"] === 2) layout_class = "dual-column";
	else layout_class = "multi-column";
	$body.removeClass("single-column dual-column multi-column").addClass(layout_class);
}

$(document).on("ready", setLayoutProperties);
$(window).on("resize", setLayoutProperties);

// scroll
ui["scroll-position"] = { };

function setScrollPosition() {
	ui["scroll-position"]["top"] = $window.scrollTop();
	ui["scroll-position"]["bottom"] = ui["scroll-position"]["top"] + ui["window"]["height"];
}

$(document).on("ready", setScrollPosition);
$(window).on("scroll", setScrollPosition);

/*

variações da interface:

1 coluna: tela única, 1 coluna na tarefa
2 colunas: tela única, 2 colunas na tarefa
3 colunas: tela dividida, 1 coluna larga na tarefa
4 colunas: tela dividida, 2 colunas largas na tarefa




*/


// loading
/*
var loading = (function() {
	return {
		show: function() {
			backdrop.show();
			$loading.addClass("in");
		},
		hide: function() {
			$loading.removeClass("in");
			backdrop.hide();
		}
	}
})();
$(function() {
	$loading = $("#loading");
});
*/

var api_key;
