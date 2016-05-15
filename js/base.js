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
