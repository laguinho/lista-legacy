"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

////////////////////////////////////////////////////////////////////////////////////////////////////
// lista de tarefas ////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Todas as informações ficam guardadas dentro do objeto "Lista",
// em um dos seus 4 nós
var Lista = [];
Lista.Edicao = {};
Lista.Placar = [];
Lista.Tarefas = [];
Lista.Usuario = {};

// "app" guarda os métodos específicos do funcionamento da Lista,
// "$app" guarda as referências jQuery ao DOM usadas nesses métodos
var app = [];
var $app = [];

var cache = [];
cache["tarefas"] = [];

////////////////////////////////////////////////////////////////////////////////////////////////////

var cue = [];
var worker = [];
var timing = [];

// Se o logging estiver ligado, relata cada passo no console
// Obs: nem todos os métodos estão com logs criados ou detalhados!
var logging = false;
var log = function log(message, type) {
	if (logging) {
		// Insere a hora no log
		var timestamp = moment().format("LTS");
		message = "[" + timestamp + "] " + message;

		if (!type) {
			console.log(message);
		} else {
			console[type](message);
		}
	}
};

var analytics = function analytics(category, action, label) {
	if (typeof ga !== "undefined") {
		ga("send", "event", category, action, label);
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// daqui pra baixo não é pra ter nada!!

var tarefa_active;

////////////////////////////////////////////////////////////////////////////////////////////////////
// utilities ///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// rand
var rand = function rand(min, max) {
	return Math.random() * (max - min) + min;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// template engine /////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

var $templates = {};

$(function () {
	// Pega os templates do HTML,
	// guarda em $templates
	// e remove eles do código-fonte
	$("template").each(function () {
		var $this = $(this);
		var name = $this.attr("id");
		var html = $this.html();

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

	$.fn.fillBlanks = function () {
		var $blank = $(this);
		var fill = $blank.data("fill");

		var rules = fill.split(",");
		for (var i = 0; i < rules.length; i++) {
			var pair = rules[i].split(":");
			var dest = pair[1] ? pair[0].trim() : "html";
			var source = pair[1] ? pair[1].trim() : pair[0];
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
				} else if (if_null === "remove") {
					$blank.remove();
				}
			}
		}

		$blank.removeClass("fill").removeAttr("data-fill").removeAttr("data-fill-null");
	};

	if ($render.hasClass("fill")) {
		$render.fillBlanks();
	}

	$(".fill", $render).each(function () {
		$(this).fillBlanks();
	});

	return $render;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// router //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var router = [];

////////////////////////////////////////////////////////////////////////////////////////////////////
// navigation mode
router["path"] = location.pathname.split("/");

if (router["path"][1] === "tarefas") {
	router["navigation-mode"] = "path";
} else {
	router["navigation-mode"] = "hash";
	router["path"] = location.hash.split("/");
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// go
router["go"] = function (path, object, title) {
	if (router["navigation-mode"] === "path") {
		history.pushState(object, title, path);
	} else {
		history.pushState(object, title, "#" + path);
		// location.hash = path;
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// build link
router["build-link"] = function (path) {
	var link;
	if (router["navigation-mode"] === "path") {
		link = path;
	} else {
		link = "#" + path;
	}

	return link;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// view manager
router["current-view"] = ["home"];
router["view-manager"] = function () {
	return {
		add: function add(view) {
			router["current-view"].push(view);
			// console.log(router["current-view"]);
		},
		remove: function remove(view) {
			router["current-view"] = $.grep(router["current-view"], function (value) {
				return value !== view;
			});
			// console.log(router["current-view"]);
		},
		replace: function replace(view) {
			router["current-view"] = [];
			router["view-manager"].add(view);
		}
	};
}();

////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener("popstate", function (event) {
	// console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));

	var state = event.state;

	if (state && state["view"] === "tarefa") {
		if (router["current-view"].indexOf("bottomsheet") > -1) {
			UI.bottomsheet.close();
		}
		if (router["current-view"].indexOf("new-post") > -1) {
			app.Post.close();
		}
		app.Tarefa.open(state["id"]);
	} else if (state && state["view"] === "new-post") {
		// app.Post.open(state["type"], state["id"]);
	} else if (state && state["view"] === "bottomsheet") {
		if (router["current-view"].indexOf("new-post") > -1) {
			app.Post.close();
		}
	}

	//	if (state["view"] === "home") {
	else {
			if (router["current-view"].indexOf("bottomsheet") > -1) {
				UI.bottomsheet.close();
			}
			if (router["current-view"].indexOf("new-post") > -1) {
				app.Post.close();
			}
			app.Tarefa.close();
		}
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// states:
// * tarefa
// * home
// * new-post
// * bottomsheet

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui //////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var UI = {};
UI.data = [];

var $ui = [];
$ui["window"] = $(window);
$ui["body"] = $(document.body);

// Pega o título da página ("Lista de Tarefas")
// e guarda pra quando for necessário recuperar
$ui["page-title"] = $("head title");
UI.data["page-title"] = $ui["page-title"].text();

// $ui["window"]
// $ui["title"]
// $ui["body"]
// $ui["appbar"]
// $ui["loadbar"]
// $ui["sidenav"]
// $ui["bottomsheet"]
// $ui["toast"]
// $ui["backdrop"]
// $ui["footer"]
// $ui["page-title"]

// Dados definidos:
// UI.data["column-width"]

// Dados consultáveis:
// UI.data["window"]["width"]
// UI.data["window"]["height"]
// UI.data["scroll-position"]["top"]
// UI.data["scroll-position"]["bottom"]
// UI.data["columns"]
// UI.data["interaction-type"]
// UI.data["theme-color"]["original"]
// UI.data["title"]
// UI.data["scrollbar-size"]


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Função para forçar reflow
$.fn.reflow = function () {
	var offset = $ui["body"].offset().left;
	return $(this);
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui / utilities //////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Título e cor do tema
UI.data["theme-color"] = [];

$(function () {
	$ui["title"] = $("head title");
	UI.data["title"] = $ui["title"].html();

	$ui["theme-color"] = $("meta[name='theme-color']");
	UI.data["theme-color"]["original"] = $ui["theme-color"].attr("content");
});

// Tipo de interação (touch ou pointer)
UI.data["interaction-type"] = "ontouchstart" in window || navigator.msMaxTouchPoints ? "touch" : "pointer";

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Propriedades da janela e do layout
UI.data["column-width"] = 316; // Largura da coluna, incluindo margem
UI.data["window"] = [];

function setLayoutProperties() {
	// Dimensões (largura e altura) da janela
	UI.data["window"]["width"] = $ui["window"].width();
	UI.data["window"]["height"] = $ui["window"].height();

	// Calcula número de colunas
	UI.data["columns"] = Math.floor(UI.data["window"]["width"] / UI.data["column-width"]);

	// Adiciona classe no <body> de acordo com a quantidade de colunas
	var layout_class = void 0;
	if (UI.data["columns"] === 1) {
		layout_class = "ui-single-column";
	} else if (UI.data["columns"] === 2) {
		layout_class = "ui-dual-column";
	} else {
		layout_class = "ui-multi-column";
	}

	$ui["body"].removeClass("ui-single-column ui-dual-column ui-multi-column").addClass(layout_class);
}

function getScrollbarSize() {
	// Descobre o tamanho da barra de rolagem
	var $outerContainer = $("<div />").css({
		"overflow": "scroll",
		"display": "none"
	}).appendTo($ui["body"]);
	var $innerContainer = $("<div />").appendTo($outerContainer);

	UI.data["scrollbar-size"] = $outerContainer.width() - $innerContainer.width();
	$outerContainer.remove();
}

// As propriedades da janela e do layout são calculadas
// quando a página é carregada e quando a janela é redimensionada.
// O tamanho da barra de rolagem é calculado somente quando a página é carregada
$(function () {
	setLayoutProperties();getScrollbarSize();
});
$ui["window"].on("resize", setLayoutProperties);

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Propriedades (posição no topo e no fim da janela) do scroll
UI.data["scroll-position"] = [];

function setScrollPosition() {
	UI.data["scroll-position"]["top"] = $ui["window"].scrollTop();
	UI.data["scroll-position"]["bottom"] = UI.data["scroll-position"]["top"] + UI.data["window"]["height"];
}

// As propriedades do scroll são calculadas quando a página é carregada
// e quando a janela é redimensionada ou "scrollada"
$(function () {
	setScrollPosition();
});
$ui["window"].on("scroll resize", setScrollPosition);

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui / body ///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// UI.body.lock()
// UI.body.unlock()

UI.body = function () {
	$(function () {
		// ui["body"] é definido no document.js
		$ui["body"].addClass("ui-" + UI.data["interaction-type"]);
		scrollStatus();
	});

	$ui["window"].on("scroll", scrollStatus);

	function scrollStatus() {
		var y = $(window).scrollTop();

		if (y > 1) {
			$ui["body"].removeClass("scroll-top");
		} else {
			$ui["body"].addClass("scroll-top");
		}

		if (y > 56) {
			$ui["body"].addClass("livesite-blur").removeClass("livesite-focus");
		} else {
			$ui["body"].addClass("livesite-focus").removeClass("livesite-blur");
		}
	}

	return {
		////////////////////////////////////////////////////////////////////////////////////////////
		// UI.body.lock()
		lock: function lock() {
			$ui["body"].addClass("no-scroll").css("margin-right", UI.data["scrollbar-size"]);
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// UI.body.unlock()
		unlock: function unlock() {
			$ui["body"].removeClass("no-scroll").css("margin-right", 0);
		}
	};
}();

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui / loadbar ////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// UI.loadbar.show()
// UI.loadbar.hide()

UI.loadbar = function () {
	$(function () {
		$ui["loadbar"] = $(".ui-loadbar");
	});

	return {
		show: function show() {
			$ui["loadbar"].addClass("in");
		},
		hide: function hide() {
			timing["hide-loadbar"] = setTimeout(function () {
				$ui["loadbar"].removeClass("fade-in").one("transitionend", function () {
					$ui["loadbar"].removeClass("in");
				});
			}, 800);
		}
	};
}();

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui / backdrop ///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// UI.backdrop.show()
// UI.backdrop.hide()

UI.backdrop = function () {
	$ui["backdrop"] = [];

	$(function () {
		// $ui["backdrop"] = $(".js-ui-backdrop");
		// $ui["backdrop"].on("click", function() {
		// 	$ui["backdrop"].trigger("hide");
		// });
	});

	return {
		show: function show($screen, events) {
			var screen = $screen["selector"];
			var zindex = $screen.css("z-index") - 1;

			$ui["backdrop"][screen] = __render("backdrop");

			$.each(events, function (event, handler) {
				$ui["backdrop"][screen].on(event, handler);
			});

			$ui["backdrop"][screen].css("z-index", zindex).on("click", function () {
				$(this).trigger("hide");
			}).appendTo($ui["body"]).addClass("in");
		},
		hide: function hide($screen) {
			var screen = $screen["selector"];
			$ui["backdrop"][screen].removeClass("in").off("hide").remove();
		}
	};
}();

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui sidenav //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

UI.sidenav = function () {
	$(function () {
		$ui["sidenav"] = $(".js-ui-sidenav");

		$(".js-sidenav-trigger").on("click", function (event) {
			event.preventDefault();
			UI.sidenav.open();
		});
	});

	return {
		open: function open() {
			UI.body.lock();
			UI.backdrop.show($ui["sidenav"], { "hide": UI.sidenav.close });
			$ui["sidenav"].addClass("in");
		},
		close: function close() {
			$ui["sidenav"].removeClass("in");
			UI.backdrop.hide($ui["sidenav"]);
			UI.body.unlock();
		}
	};
}();

////////////////////////////////////////////////////////////////////////////////////////////////////
// bottomsheet
UI.bottomsheet = function () {
	return {
		open: function open($content, addClass) {
			UI.backdrop.show($ui["bottomsheet"], { "hide": UI.bottomsheet.close });
			$ui["bottomsheet"].html($content).addClass((addClass ? addClass + " " : "") + "in").reflow().addClass("slide");

			UI.data["theme-color"]["buffer"] = $ui["theme-color"].attr("content");
			$ui["theme-color"].attr("content", "#000");

			router["view-manager"].add("bottomsheet");
			history.pushState({ "view": "bottomsheet" }, null, null);
		},
		close: function close() {
			$ui["bottomsheet"].removeClass("slide").one("transitionend", function () {
				$ui["bottomsheet"].removeClass("in").empty().attr("class", "ui-bottomsheet js-ui-bottomsheet");
			});

			$ui["theme-color"].attr("content", UI.data["theme-color"]["buffer"]);

			UI.backdrop.hide($ui["bottomsheet"]);

			router["view-manager"].remove("bottomsheet");
		}
	};
}();

$(function () {
	$ui["bottomsheet"] = $(".js-ui-bottomsheet");
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui toast ////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

UI.toast = function () {
	$ui["toast"] = [];

	$(function () {
		$ui["toast"] = $(".js-ui-toast");
		$ui["toast"]["message"] = $(".toast-message", $ui["toast"]);
		$ui["toast"]["label"] = $(".toast-label", $ui["toast"]);
	});

	return {
		// TODO nova sintaxe, usar template e __render
		show: function show(config) {
			log("UI.toast.show");
			// Opções:
			// • "message" [string]
			// • "label" [string]
			// • "action" [function]
			// • "persistent" [boolean]
			// • "timeout" [integer] default: 6000
			// • "start-only" [boolean]

			if ((typeof config === "undefined" ? "undefined" : _typeof(config)) === "object") {
				$ui["toast"].removeClass("start-only");

				// Texto do toast
				$ui["toast"]["message"].html(config["message"] || "");

				// Texto da ação
				// (Só mostra de texto e ação estiverem definidos)
				if (config["label"] && config["action"]) {
					$ui["toast"]["label"].html(config["label"]).off("click").on("click", config["action"]).show();
				} else {
					$ui["toast"]["label"].hide();
				}

				$ui["toast"].addClass("in").reflow().addClass("slide");
				$ui["body"].addClass("toast-active");

				// TODO: .fab-bottom transform: translateY

				// Ao clicar no toast, fecha ele
				$ui["toast"].on("click", UI.toast.dismiss);
				clearTimeout(timing["toast"]);

				// Se não for persistente,
				// fecha depois de um tempo determinado
				if (!config["persistent"]) {
					timing["toast"] = setTimeout(UI.toast.dismiss, config["timeout"] ? config["timeout"] : 6000);
				}

				// Se for pra ser exibido só na tela inicial
				if (config["start-only"]) {
					$ui["toast"].addClass("start-only");
				}
			} else {
				UI.toast.show({
					"message": config
				});
			}
		},

		dismiss: function dismiss() {
			log("UI.toast.dismiss");
			$ui["toast"].removeClass("slide").one("transitionend", function () {
				$ui["body"].removeClass("toast-active");
				$ui["toast"].removeClass("in start-only");

				$ui["toast"]["message"].empty();
				$ui["toast"]["label"].empty();
			});
			clearTimeout(timing["toast"]);
		},

		// TODO DEPRECATED
		open: function open(message, action, callback, persistent) {
			// open: function(message, addClass) {
			$ui["toast"].message.html(message);
			$ui["toast"].label.html(action ? action : "");
			$ui["toast"].addClass("in").reflow().addClass("slide");
			$ui["body"].addClass("toast-active");

			// TODO: .fab-bottom transform: translateY

			$ui["toast"].on("click", UI.toast.dismiss);
			$ui["toast"].label.on("click", callback);

			clearTimeout(timing["toast"]);

			if (!persistent) {
				$ui["toast"].removeClass("start-only");
				timing["toast-open"] = setTimeout(UI.toast.dismiss, 6500);
			} else {
				$ui["toast"].addClass("start-only");
			}
		}
	};
}();

// var toast = UI.toast;
// toast.close = UI.toast.dismiss;

// var snackbar = toast;

////////////////////////////////////////////////////////////////////////////////////////////////////
// api /////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// TODO legacy (deve ficar só dentro da função abaixo)
var api_key = "063c72b2afc5333f3b27b366bdac9eb81d64bc6a12cd7b3f4b6ade77a092b63a";

var ListaAPI = function ListaAPI(endpoint, data) {
	log("API Request: " + endpoint, "info");
	var api_url = "https://api.laguinho.org/lista/" + edicao;
	var api_key = "063c72b2afc5333f3b27b366bdac9eb81d64bc6a12cd7b3f4b6ade77a092b63a";

	var request = $.getJSON(api_url + endpoint + "?key=" + api_key + "&callback=?", data);
	return request;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// app placar //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

app.Placar = function () {
	$(function () {
		$ui["placar"] = $(".js-app-placar ul");
	});

	return {
		start: function start() {
			// TODO
		},

		update: function update() {
			// Limpa o placar
			$ui["placar"].empty();

			// Confere qual a turma com maior pontuação
			// e soma a pontuação de cada turma para obter o total de pontos
			var maior_pontuacao = 0;
			var total_de_pontos = 0;

			Lista.Placar.forEach(function (turma) {
				var pontuacao_da_turma = turma["pontos"];

				if (pontuacao_da_turma > maior_pontuacao) {
					maior_pontuacao = pontuacao_da_turma;
				}

				total_de_pontos += pontuacao_da_turma;
			});

			// Com os dados básicos calculados,
			// adiciona as turmas no placar
			Lista.Placar.forEach(function (turma) {
				// Calcula % da turma
				// em relação à turma de maior pontuação
				var percentual_da_turma = total_de_pontos > 0 ? turma["pontos"] / maior_pontuacao : 0;

				// Formata os dados para o placar
				turma["turma-formatada"] = turma["turma"].toUpperCase();
				turma["tamanho-da-barra"] = "height: " + (percentual_da_turma * 100).toFixed(3) + "%;";
				turma["pontuacao-formatada"] = turma["pontos"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

				var $turma = __render("placar-turma", turma);
				$ui["placar"].append($turma);
			});

			if (total_de_pontos === 0) {
				$ui["placar"].addClass("placar-zerado");
			} else {
				$ui["placar"].removeClass("placar-zerado");
			}
		}
	};
}();

////////////////////////////////////////////////////////////////////////////////////////////////////
// app evolução ////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// app.Evolucao.start()
// app.Evolucao.update()

// TODO
// - mostrar contador nas últimas 48 horas
// - o que acontece depois do encerramento?
//   barra fica da cor da turma e aparece mensagem em cima "EC1 campeã"

app.Evolucao = function () {
	var duracao_total = void 0;

	$(function () {
		$ui["evolucao"] = $(".app-evolucao");
	});

	return {
		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Evolucao.start()
		start: function start() {
			log("app.Evolucao.start", "info");

			// Pega data de início e data de encerramento
			var dia_inicial = Lista.Edicao["inicio"] = moment(Lista.Edicao["inicio"]);
			var dia_final = Lista.Edicao["fim"] = moment(Lista.Edicao["fim"]);

			// Calcula o tempo total (em minutos)
			duracao_total = dia_final.diff(dia_inicial, "minutes");

			// Insere os dias na barra, indo de dia em dia até chegar ao encerramento
			for (var dia = dia_inicial.clone(); dia.isBefore(dia_final); dia.add(1, "days")) {
				// Define início e final do dia
				// Se final for após a data de encerramento, usa ela como final
				var inicio_do_dia = dia;
				var final_do_dia = dia.clone().endOf("day");
				if (final_do_dia.isAfter(dia_final)) {
					final_do_dia = dia_final;
				}

				// Calcula a duração do dia em minutos
				var duracao_do_dia = final_do_dia.diff(inicio_do_dia, "minutes");

				// Define a duração percentual do dia em relação ao total
				var percentual_do_dia = duracao_do_dia / duracao_total;

				// Calcula a largura do dia (de acordo com duração percentual)
				// e insere dia na barra de evolução
				var largura_do_dia = (percentual_do_dia * 100).toFixed(3);
				var $dia = __render("evolucao-dia", {
					dia: dia.format("ddd")
				}).css("width", largura_do_dia + "%");

				$(".day-labels", $ui["evolucao"]).append($dia);
			}

			// Com os dias inseridos na barra de evolução,
			// desenha a barra de tempo transcorrido
			setTimeout(app.Evolucao.update, 1000);

			// Atualiza a linha de evolução a cada X minutos
			timing["evolucao"] = setInterval(app.Evolucao.update, 60 * 1000);
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Evolucao.update()
		update: function update() {
			log("app.Evolucao.update", "info");

			// Pega as datas e calcula o tempo (em minutos) e percentual transcorridos
			var agora = moment();
			var dia_inicial = moment(Lista.Edicao["inicio"]);
			var dia_final = moment(Lista.Edicao["fim"]);

			var tempo_transcorrido = agora.diff(dia_inicial, "minutes");
			var percentual_transcorrido = tempo_transcorrido < duracao_total ? tempo_transcorrido / duracao_total : 1;

			// Define a largura da barra de evolução completa igual à largura da tela
			// Depois, mostra apenas o percentual transcorrido
			$(".elapsed-time .bar", $ui["evolucao"]).css("width", UI.data["window"]["width"]);

			var largura_da_barra = (percentual_transcorrido * 100).toFixed(3);
			$(".elapsed-time", $ui["evolucao"]).css("width", largura_da_barra + "%");
		}
	};
}();

////////////////////////////////////////////////////////////////////////////////////////////////////
// lista ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// app.Lista.load()
// app.Lista.layout()
// app.Lista.sort()

app.Lista = function () {
	$(function () {
		$app["lista"] = $(".app-lista");

		$app["lista"].isotope({
			"itemSelector": ".card-tarefa",
			"transitionDuration": ".8s",
			"getSortData": {
				"date": function date(element) {
					return $(element).data("last-modified");
				},
				"tarefa": function tarefa(element) {
					return parseInt($(element).data("tarefa"), 10);
				}
			},
			"sortAscending": {
				"date": false,
				"tarefa": true
			},
			"sortBy": ["date", "tarefa"],
			"masonry": {
				"gutter": UI.data["columns"] === 1 ? 8 : 16
			}
		});

		$app["lista"].on("click", ".card-tarefa:not(.fantasma)", function (event) {
			if (event.which === 1) {
				event.preventDefault();

				var $card = $(this);
				var numero = $card.data("tarefa");
				app.Tarefa.open(numero, $card, true);
			}
		});
	});

	return {
		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.start()
		start: function start() {
			log("app.Lista.start", "info");

			// faz as alterações de acordo com o status
			// insere as mensagens
			app.Lista.tarefas();
			app.Lista.status();
			app.Lista.messages();

			// tira a tela de loading
			UI.loadbar.hide();
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.status()
		status: function status() {
			// se prazo de postagem estiver encerrado, insere classe no <body>
			if (moment().isAfter(Lista.Edicao["fim"])) {
				$ui["body"].addClass("postagens-encerradas");
			}

			// se a edição estiver encerrada, insere classe no <body>
			// e para de atualizar automaticamente
			if (Lista.Edicao["encerrada"] === true) {
				$ui["body"].addClass("edicao-encerrada");
				clearInterval(timing["atividade"]);
			}
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.messages()
		messages: function messages() {
			// se tiver título especificado, insere ele
			if (Lista.Edicao["mensagem"]["titulo"]) {
				var page_title = Lista.Edicao["mensagem"]["titulo"];
				$ui["title"].html(page_title);
			}

			// de tiver mensagem de rodapé especificada, insere ela
			if (Lista.Edicao["mensagem"]["rodape"]) {
				var closing_message = Lista.Edicao["mensagem"]["rodape"];
				$(".js-mensagem-final").html(closing_message);
			}
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.tarefas()
		tarefas: function tarefas() {
			// mostra o loading e limpa a lista para começar do zero
			// UI.loading.show();
			$app["lista"].empty();

			// insere as tarefas
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = Lista.Tarefas[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var tarefa = _step.value;

					// Insere no cache
					cache["tarefas"][tarefa["numero"]] = tarefa;

					// Cria o link para a tarefa
					tarefa["url"] = router["build-link"]("/tarefas/" + tarefa["numero"]);

					// Se tiver imagem, ajusta as dimensoes
					if (tarefa["imagem"]) {
						tarefa["imagem/url"] = tarefa["imagem"]["url"];
						tarefa["imagem/aspecto"] = "padding-top: " + (tarefa["imagem"]["aspecto"] * 100).toFixed(2) + "%";
					}

					var $tarefa = __render("card-tarefa", tarefa).data({
						"tarefa": tarefa["numero"],
						"last-modified": tarefa["ultima-postagem"] ? moment(tarefa["ultima-postagem"]).format("X") : 0
					});

					////////////////////////////////////////////////////////////////////////////////////
					// posts
					var $grid = $(".tarefa-conteudo .grid", $tarefa);

					if (tarefa["quantidade-de-posts"] && tarefa["posts"]) {
						// var total_media = tarefa["posts"].reduce((total, post) => total + post["midia"].length, 0);
						// var max_media_to_show = (UI.data["columns"] < 2? 9 : 8);
						var max_media_to_show = 8;
						var shown_media_count = 0;

						var post_types_with_image_preview = ["imagem", "youtube", "vimeo", "vine", "gif"];
						var post_types_with_text_preview = ["texto"];

						for (var i = 0; i < max_media_to_show; i++) {
							if (tarefa["posts"][i]) {
								var post = tarefa["posts"][i];

								if (post["midia"] || post["tipo"] == "texto") {
									shown_media_count++;

									var tile_type;
									var media = {};

									// imagem
									if (post_types_with_image_preview.indexOf(post["tipo"]) > -1) {
										tile_type = "tile-image";

										media["count"] = shown_media_count;

										if (post["tipo"] == "youtube" || post["tipo"] == "vimeo" || post["tipo"] == "vine" || post["tipo"] == "gif") {
											media["preview"] = "background-image: url('" + post["midia"][0]["thumbnail"] + "');";
											media["modifier"] = "video";
										} else if (post["midia"] && post["midia"][0]) {
											media["preview"] = "background-image: url('" + post["midia"][0]["caminho"] + post["midia"][0]["arquivos"][0] + "');";
										}
									} else

										// texto
										if (post_types_with_text_preview.indexOf(post["tipo"]) > -1) {
											tile_type = "tile-text";
											media = {
												"preview": post["legenda"].substring(0, 120),
												"count": shown_media_count
											};
										}

									if (shown_media_count === max_media_to_show && tarefa["quantidade-de-posts"] - shown_media_count > 0) {
										media["modifier"] = "more";
										media["more"] = "+&thinsp;" + (tarefa["quantidade-de-posts"] - shown_media_count + 1);
									}

									var $tile = __render(tile_type, media).appendTo($grid);
								}
							}
						}
					} else {
						// se não tiver nenhum post, remove o grid
						$(".tarefa-conteudo", $tarefa).remove();
					}

					// Se for preview
					if (tarefa["preview"]) {
						$tarefa.addClass("fantasma");
						$("a", $tarefa).removeAttr("href");
						$(".tarefa-corpo", $tarefa).remove();
					}

					$app["lista"].append($tarefa).isotope("appended", $tarefa);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			app.Lista.layout();
			app.Lista.sort(Lista.Edicao["encerrada"] ? "tarefa" : "date");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.load()
		// load: function() {
		// 	// mostra a tela de loading e limpa o stream
		// 	$stream.loading.addClass("fade-in in");
		//
		// 	// carrega os dados da API
		// 	$.getJSON("https://api.laguinho.org/lista/" + edicao + "/tudo?key=" + api_key + "&callback=?").done(function(data) {
		// 		// "DIRETOR"
		// 		// TODO O load deve ficar separado do Stream (ver issue #7)
		// 		Lista.Regulamento = data["edicao"];
		// 		Lista.Tarefas = data["tarefas"];
		//
		// 		// Se a Edição estiver encerrada...
		//
		//
		// 		// FIM DO "DIRETOR"
		//
		// 		// Limpa o stream para começar do zero
		// 		$stream.empty();
		//
		// 		// Monta placar
		// 		app.Placar.update(data["placar"]);
		//
		// 		// Insere os cards de tarefas
		// 		$.each(data["tarefas"], function(index, tarefa) {
		// 			tarefas[tarefa["numero"]] = tarefa;
		// 			tarefa["url"] = "/tarefas/" + tarefa["numero"];
		// 			tarefa["url"] = router["build-link"]("/tarefas/" + tarefa["numero"]);
		//
		// 			if (tarefa["imagem"]) {
		// 				tarefa["imagem-url"] = tarefa["imagem"]["url"];
		// 				tarefa["imagem-aspecto"] = "padding-top: " + (tarefa["imagem"]["aspecto"] * 100).toFixed(2) + "%";
		// 			}
		//
		// 			var $card = __render("card-tarefa", tarefa).data({
		// 					"tarefa": tarefa["numero"],
		// 					"last-modified": (tarefa["ultima-postagem"]? moment(tarefa["ultima-postagem"]).format("X") : 0)
		// 				});
		//
		// 			if (tarefa["preview"]) {
		// 				$card.addClass("fantasma");
		// 				$("a", $card).removeAttr("href");
		// 				$(".body", $card).remove();
		// 			}
		//
		// 			if (!tarefa["imagem"]) {
		// 				$(".media", $card).remove();
		// 			}
		//
		// 			// posts
		// 			var $grid = $(".grid", $card);
		//
		// 			if (tarefa["quantidade-de-posts"] > 0 && tarefa["posts"]) {
		// 				// var total_media = tarefa["posts"].reduce((total, post) => total + post["midia"].length, 0);
		// 				var max_media_to_show = (UI.data["columns"] < 2? 9 : 8);
		// 				var shown_media_count = 0;
		//
		// 				var post_types_with_image_preview = ["imagem", "youtube", "vimeo", "vine", "gif"];
		// 				var post_types_with_text_preview = ["texto"];
		//
		// 				for (var i = 0; i < tarefa["quantidade-de-posts"]; i++) {
		// 					var post = tarefa["posts"][i];
		//
		// 					if ((post["midia"] || post["tipo"] == "texto") && (shown_media_count < max_media_to_show)) {
		// 						shown_media_count++;
		//
		// 						var tile_type;
		// 						var media = { };
		//
		// 						// imagem
		// 						if (post_types_with_image_preview.indexOf(post["tipo"]) > -1) {
		// 							tile_type = "tile-image";
		//
		// 							media["count"] = shown_media_count;
		//
		// 							if (post["tipo"] == "youtube" || post["tipo"] == "vimeo" || post["tipo"] == "vine" || post["tipo"] == "gif") {
		// 								media["preview"] = "background-image: url('" + post["midia"][0]["thumbnail"] + "');";
		// 								media["modifier"] = "video";
		// 							} else if (post["midia"] && post["midia"][0]) {
		// 								media["preview"] = "background-image: url('" + post["midia"][0]["caminho"] +
		// 									post["midia"][0]["arquivos"][0] + "');";
		// 							}
		// 						} else
		//
		// 						// texto
		// 						if (post_types_with_text_preview.indexOf(post["tipo"]) > -1) {
		// 							tile_type = "tile-text";
		// 							media = {
		// 								"preview": post["legenda"].substring(0, 120),
		// 								"count": shown_media_count
		// 							};
		// 						}
		//
		// 						if ((shown_media_count === max_media_to_show) && ((tarefa["quantidade-de-posts"] - shown_media_count) > 0)) {
		// 							media["modifier"] = "more";
		// 							media["more"] = "+&thinsp;" + (tarefa["quantidade-de-posts"] - shown_media_count + 1);
		// 						}
		//
		// 						var $tile = __render(tile_type, media).appendTo($grid);
		// 					}
		// 				}
		//
		// 			} else {
		// 				// se não tiver nenhum post, remove o grid
		// 				$grid.remove();
		// 			}
		//
		// 			// atualiza o isotope
		// 			$stream.append($card).isotope("appended", $card);
		// 		});
		//
		// 		// Se a Edição estiver encerrada, ordena por número da tarefa.
		// 		// Se não, ordena por ordem de atualização
		// 		app.Lista.layout();
		// 		app.Lista.sort((Lista.Edicao["encerrada"]? "tarefa": "date"));
		//
		// 		// se tiver tarefa especificada no load da página, carrega ela
		// 		if (router["path"][2]) {
		// 			app.Tarefa.open(router["path"][2]);
		// 		}
		//
		// 		// esconde a tela de loading
		// 		setTimeout(function() {
		// 			$stream.loading
		// 				.removeClass("fade-in")
		// 				.one("transitionend", function() { $stream.loading.removeClass("in");
		// 			});
		// 		}, 1200);
		//
		// 		// guarda a data da última atualização e zera o contador de novidades
		// 		last_updated = moment(data["edicao"]["ultima-atualizacao"]);
		// 		updated["tarefas"] = 0;
		// 		updated["posts"] = 0;
		// 	});
		// },

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.layout()
		layout: function layout() {
			$app["lista"].isotope("reloadItems");
			$app["lista"].isotope("layout");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.sort()
		sort: function sort(criteria) {
			$app["lista"].isotope({
				"sortBy": criteria
			});
		}
	};
}();

// jQuery
var $stream;

$(function () {
	$stream = $(".js-app-lista");
	// $stream.loading = $("main .loading");

	$stream.isotope({
		"itemSelector": ".card-tarefa",
		"transitionDuration": ".8s",
		"getSortData": {
			"date": ".last-modified",
			"tarefa": function tarefa(element) {
				return parseInt($(element).data("tarefa"), 10);
			}
		},
		"sortAscending": {
			"date": false,
			"tarefa": true
		},
		"sortBy": ["date", "tarefa"],
		"masonry": {
			"gutter": UI.data["columns"] === 1 ? 8 : 16
		}
	});

	// $stream.on("click", ".card-tarefa:not(.fantasma)", function(event) {
	// 	if (event.which === 1) {
	// 		event.preventDefault();
	//
	// 		var numero = $(this).data("tarefa");
	// 		app.Tarefa.open(numero, true);
	// 	}
	// });

	// app.Lista.load();

	// ordenação
	$ui["sidenav"].on("click", ".js-lista-sort a", function (event) {
		event.preventDefault();

		var criteria = $(this).data("sort-by");
		var title = $(this).find("span").text();
		$(".js-lista-sort a", $ui["sidenav"]).removeClass("active");
		$(this).addClass("active");

		app.Lista.sort(criteria);
		UI.sidenav.close();
		analytics("Lista", "Ordenação", title);
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// tarefa //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// app.Tarefa.open()
// app.Tarefa.render()
// app.Tarefa.close()

app.Tarefa = function () {
	$(function () {
		$app["tarefa"] = $(".app-tarefa");

		// Botões de fechar a Tarefa e voltar à Lista
		$app["tarefa"].on("click", ".js-tarefa-close", function (event) {
			event.preventDefault();
			app.Tarefa.close(true);
		})

		// Botão de novo post
		.on("click", ".js-new-post-trigger", function () {
			UI.bottomsheet.open($(".new-post-sheet", $app["tarefa"]).clone().show());
		})

		// Desabilita clique no card da Tarefa
		.on("click", ".card-tarefa a", function (event) {
			if (event.which === 1) {
				event.preventDefault();
			}
		});
	});

	var placar_da_tarefa = [];

	function renderPosts(posts, $posts) {
		placar_da_tarefa["total"] = 0;
		for (var turma in Lista.Edicao["turmas"]) {
			placar_da_tarefa[Lista.Edicao["turmas"][turma]] = 0;
		}

		$.each(posts, function (index, post) {
			post["turma-background"] = post["turma"] + "-light-background";
			post["data-de-postagem-formatada"] = moment(post["data-de-postagem"]).calendar();
			post["turma-formatada"] = post["turma"].toUpperCase();

			// legenda
			if (post["legenda"] && post["legenda"].substring(0, 3) !== "<p>") {
				post["legenda"] = "<p>" + post["legenda"].replace(/(?:\r\n\r\n|\r\r|\n\n)/g, "</p><p>") + "</p>";
			}

			// avaliação
			if (post["avaliacao"]) {
				post["avaliacao/mensagem"] = post["avaliacao"]["mensagem"];

				if (post["avaliacao"]["status"] === 200) {
					post["status-class"] = post["turma"];
					post["status-icon"] = "<i class=\"material-icons\">&#xE87D;</i>"; // coração
					post["avaliacao/status"] = post["avaliacao"]["pontos"] + " ponto" + (post["avaliacao"]["pontos"] > 1 ? "s" : "");
					post["avaliacao/class"] = "turma-text";
				} else {
					post["status-class"] = "rejected";
					post["status-icon"] = "<i class=\"material-icons\">&#xE888;</i>";
					post["avaliacao/status"] = "Reprovado";
				}

				// soma pontos no placar
				placar_da_tarefa["total"] += post["avaliacao"]["pontos"];
				placar_da_tarefa[post["turma"]] += post["avaliacao"]["pontos"];
			} else {
				post["status-icon"] = "<i class=\"material-icons\">&#xE8B5;</i>"; // relógio
				post["avaliacao/status"] = "Aguardando avaliação";
			}

			// renderiza o post
			var $content_card = __render("content-card", post);
			var $media = $(".content-media > ul", $content_card);

			// adiciona mídias
			if (post["midia"]) {
				$.each(post["midia"], function (index, media) {
					// imagem
					if (post["tipo"] == "imagem") {
						media["default"] = media["caminho"] + media["arquivos"][1];
						media["padding-aspecto"] = "padding-top: " + (media["aspecto"] * 100).toFixed(2) + "%";
						media["link-original"] = media["caminho"] + media["arquivos"][2];
						var $image = __render("media-photo", media);
						$media.append($image);
					} else

						// embed
						if (post["tipo"] == "youtube" || post["tipo"] == "vimeo" || post["tipo"] == "vine") {
							if (post["tipo"] == "youtube") {
								media["embed"] = "https://www.youtube.com/embed/" + media["youtube-id"] + "?rel=0&amp;showinfo=0";
							} else if (post["tipo"] == "vimeo") {
								media["embed"] = "https://player.vimeo.com/video/" + media["vimeo-id"] + "?title=0&byline=0&portrait=0";
							} else if (post["tipo"] == "vine") {
								media["embed"] = "https://vine.co/v/" + media["vine-id"] + "/embed/simple";
							}

							media["padding-aspecto"] = "padding-top: " + (media["aspecto"] * 100).toFixed(2) + "%";
							var $embed = __render("media-video", media);
							$media.append($embed);
						}
				});
			}

			// tira legenda se não tiver
			if (!post["legenda"]) {
				$content_card.addClass("no-caption");
			}

			if (!post["midia"]) {
				$content_card.addClass("no-media");
			}

			// tira mensagem de avaliação se não tiver
			if (!post["avaliacao"] || !post["mensagem"]) {
				$(".result .message", $content_card).remove();
			}

			// adiciona o post à tarefa
			// $posts.append($content_card).isotope("appended", $content_card);
			$posts.append($content_card);
		});
	}

	return {
		data: {},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Tarefa.open() ///////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////
		open: function open(numero, $card, pushState) {
			// console.log($card[0].getBoundingClientRect());

			var tarefa = cache["tarefas"][numero];
			tarefa_active = numero;

			// if (UI.data["columns"] >= 3) {
			// 	// UI.backdrop.show($app["tarefa"], { "hide": app.Tarefa.close });
			// 	// $ui["backdrop"][$app["tarefa"]].on("hide", app.Tarefa.close);
			// }

			$app["tarefa"].addClass("in");
			app.Tarefa.render(tarefa);

			$app["tarefa"].reflow().addClass("slide-x").one("transitionend", function () {
				// var view_theme_color = $(".appbar", $app["tarefa"]).css("background-color");
				// $("head meta[name='theme-color']").attr("content", "#546e7a");
			});

			UI.body.lock();
			$ui["body"].addClass("tarefa-active");

			// router
			router["view-manager"].replace("tarefa");
			if (pushState) {
				router.go("/tarefas/" + tarefa["numero"], {
					"view": "tarefa",
					"id": tarefa["numero"]
				}, tarefa["titulo"]);
			}

			// analytics
			analytics("Tarefa", "Acesso", numero);
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Tarefa.render() /////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////
		render: function render(tarefa) {
			var $tarefa = __render("view-tarefa", tarefa);

			////////////////////////////////////////////////////////////////////////////////////////
			// card da tarefa
			if (tarefa["imagem"]) {
				tarefa["imagem"]["aspecto"] = "padding-top: " + (tarefa["imagem"]["aspecto"] * 100).toFixed(2) + "%";
			}

			var $tarefa_card = __render("card-tarefa", tarefa);

			if (!tarefa["imagem"]) {
				$(".media", $tarefa_card).remove();
			}
			$(".grid", $tarefa_card).remove();
			$("a", $tarefa_card).removeAttr("href");

			$(".tarefa-meta .tarefa-texto", $tarefa).append($tarefa_card);

			////////////////////////////////////////////////////////////////////////////////////////
			// content
			var $posts = $(".tarefa-content > ul", $tarefa);

			if (tarefa["posts"].length) {
				renderPosts(tarefa["posts"], $posts);

				$posts.isotope({
					"itemSelector": ".content-card",
					"transitionDuration": 0,
					"masonry": {
						"isFitWidth": true,
						"gutter": UI.data["columns"] === 1 ? 8 : 24
					}
					// }).on("layoutComplete", function(event, posts) {
					// 	var previous_position;
					//
					// 	for (var post in posts) {
					// 		var $this = $(posts[post].element);
					// 		var offset = posts[post].position;
					// 		var side = (offset["x"] === 0? "left" : "right");
					//
					// 		$this.addClass("timeline-" + side);
					//
					// 		if (offset["y"] - previous_position < 10) {
					// 			$this.addClass("extra-offset");
					// 		}
					//
					// 		previous_position = offset["y"];
					// 	}
				});

				setTimeout(function () {
					$posts.isotope("layout");
				}, 1);
			} else {
				$("<li />").addClass("empty").text("Nenhum post").appendTo($posts);
			}

			////////////////////////////////////////////////////////////////////////////////////////
			// layout
			$app["tarefa"].html($tarefa);

			if (tarefa["posts"].length) {
				$posts.isotope("layout");
			}

			// placar da tarefa
			// var $placar_da_tarefa = $(".painel .placar ul", $tarefa);
			//
			// $.each(Lista.Edicao["turmas"], function(index, turma) {
			// 	var pontuacao_da_turma = [ ];
			//
			// 	// calcula % da turma em relação ao total de pontos
			// 	var percentual_da_turma = (placar_da_tarefa["total"] > 0? placar_da_tarefa[turma] / placar_da_tarefa["total"] : 0);
			// 	pontuacao_da_turma["turma"] = turma;
			// 	pontuacao_da_turma["altura-da-barra"] = "height: " + (percentual_da_turma * 100).toFixed(3) + "%";
			// 	pontuacao_da_turma["turma-formatada"] = turma.toUpperCase();
			// 	pontuacao_da_turma["pontos"] = (placar_da_tarefa[turma] > 0? placar_da_tarefa[turma] : 0);
			// 	pontuacao_da_turma["pontuacao-formatada"] = pontuacao_da_turma["pontos"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
			//
			// 	var $turma = __render("placar-turma", pontuacao_da_turma);
			// 	$placar_da_tarefa.append($turma);
			// });

			$(".tarefa-wrapper", $app["tarefa"]).on("scroll", app.Tarefa.observer);
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Tarefa.close() //////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////
		close: function close(pushState) {
			tarefa_active = null;
			$("head meta[name='theme-color']").attr("content", UI.data["theme-color"]["original"]);

			UI.body.unlock();
			$ui["body"].removeClass("tarefa-active");
			$app["tarefa"].removeClass("slide-x").one("transitionend", function () {
				$app["tarefa"].removeClass("in").empty();
			});

			if (UI.data["columns"] >= 3) {}
			// UI.backdrop.hide($app["tarefa"]);


			// router
			router["view-manager"].replace("home");
			if (pushState) {
				router.go("/tarefas", { "view": "home" }, "Lista de Tarefas");
			}
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Tarefa.observer() ///////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////
		observer: function observer() {
			app.Tarefa.data["height"] = $(".tarefa-outer-container", $app["tarefa"]).outerHeight();
			app.Tarefa.data["scrollYpos"] = $(".tarefa-wrapper", $app["tarefa"]).scrollTop();

			console.log(app.Tarefa.data);
		}
	};
}();

////////////////////////////////////////////////////////////////////////////////////////////////////
// new post ////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// * app.Post.authorize()
// * app.Post.deauthorize()
// * app.Post.getThumbnail()
// * app.Post.open()
// * app.Post.close()

// tipos de post: photo, video, text

app.Post = function () {
	$(function () {
		$app["post"] = $(".app-post");
		$ui["bottomsheet"].on("click", ".new-post-sheet a", function (event) {
			event.preventDefault();

			var type = $(this).data("post-type");
			UI.bottomsheet.close();
			setTimeout(function () {
				app.Post.open(type, tarefa_active);
			}, 600);
		});

		$app["post"].on("submit", "form", function (event) {
			event.preventDefault();
		}).on("click", ".submit-button", function (event) {
			event.preventDefault();

			if (moment().isAfter(Lista.Edicao["fim"])) {
				UI.toast.open("Postagens encerradas!");
			}

			if ($(this).hasClass("disabled")) {
				// TODO melhorar mensagem
				UI.toast.open("Espere o fim do upload&hellip;");
				return;
			}

			var data = $("form", $app["post"]).serialize();
			// Exemplo de dados:
			// action=post
			// edicao=xciii
			// tarefa=2
			// user=744
			// turma=ec1
			// token=0ebe22be731dbd942ecb3e097a5ac2ae9d3185249f313eaec3a855ef2957594d
			// type=imagem
			// image-order[]=2-744-1488097013-578
			// caption=

			$(".submit-button", $app["post"]).addClass("disabled").html("Enviando&hellip;");

			$.post("/tarefas/" + tarefa_active + "/postar", data).done(function (response) {
				analytics("Conteúdo", "Tentativa");

				if (response["meta"]["status"] === 200) {
					app.Post.close();
					app.Tarefa.render(response["data"]);
					UI.toast.open(response["meta"]["message"]);
					navigator.vibrate(800);

					Lista.Tarefas[response["data"]["numero"]] = response["data"];
					analytics("Conteúdo", "Postagem");
				} else {
					UI.toast.open(response["meta"]["message"] ? response["meta"]["message"] : "Ocorreu um erro. Tente novamente");
					analytics("Conteúdo", "Erro");
				}
			}).fail(function () {
				UI.toast.open("Ocorreu um erro. Tente novamente", null, null, false);
				analytics("Conteúdo", "Erro");
			});
		}).on("click", ".back-button", function (event) {
			event.preventDefault();
			app.Post.close();
		});
	});

	return {

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Post.authorize()
		authorize: function authorize() {
			// habilita o botão enviar
			$(".submit-button", $app["post"]).removeClass("disabled");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Post.deauthorize()
		deauthorize: function deauthorize() {
			// desabilita o botão "enviar"
			$(".submit-button", $app["post"]).addClass("disabled");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Post.getThumbnail()
		getThumbnail: function getThumbnail(url) {
			// testa se urls são dos provider aceitos e responde com informações sobre o vídeo,
			// incluindo a url da miniatura
			// providers aceitos: youtube, vimeo, vine
			var media_info = {};

			function showThumbnail(media_info) {
				var $thumbnail = $("<img />").attr("src", media_info["thumbnail"]);
				$(".js-media-provider", $app["post"]).val(media_info["provider"]);
				$(".js-media-id", $app["post"]).val(media_info["id"]);
				$(".js-media-thumbnail", $app["post"]).val(media_info["thumbnail"]);
				$(".js-media-preview", $app["post"]).html($thumbnail).fadeIn();
			}

			// youtube
			if (url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)) {
				// https://www.youtube.com/watch?v=4ct4eNMrJlg
				var youtube_url = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
				media_info["provider"] = "youtube";
				media_info["id"] = youtube_url[1];
				//	media_info["thumbnail"] = "https://i1.ytimg.com/vi/" + youtube_url[1] + "/maxresdefault.jpg";
				media_info["thumbnail"] = "https://i1.ytimg.com/vi/" + youtube_url[1] + "/0.jpg";

				app.Post.authorize();
				showThumbnail(media_info);
			} else

				// vimeo
				if (url.match(/vimeo\.com/)) {
					// https://vimeo.com/64279649
					var vimeo_url = url.match(/\/\/(www\.)?vimeo.com\/(\d+)($|\/)/);
					media_info["provider"] = "vimeo";
					media_info["id"] = vimeo_url[2];

					$.getJSON("https://vimeo.com/api/v2/video/" + vimeo_url[2] + ".json?callback=?").done(function (response) {
						media_info["thumbnail"] = response[0]["thumbnail_large"];

						app.Post.authorize();
						showThumbnail(media_info);
					});
				}
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Post.open()
		open: function open(type, numero) {
			var data = {
				"edicao": Lista.Edicao["titulo"],
				"numero": numero || tarefa_active,
				"user": Lista.Usuario["id"],
				"turma": Lista.Usuario["turma"],
				"token": Lista.Usuario["token"]
			};
			var $new_post_view = __render("new-post-" + type, data);

			// efeito de abertura
			// _view.open($app["post"], $newPostView);
			$app["post"].html($new_post_view).addClass("in").reflow().addClass("slide-y").one("transitionend", function () {
				var view_theme_color = $(".appbar", $app["post"]).css("background-color");
				$("head meta[name='theme-color']").attr("content", view_theme_color);
			});

			app.Post.deauthorize();

			// ações para fazer quando abrir a tela de envio
			// de acordo com o tipo de postagem
			if (type === "photo") {
				$app["post"].dropzone();
				$(".file-placeholder", $app["post"]).trigger("click");
				//	$("form", $new_post_view).dropzone();
			} else if (type === "video" || type === "vine") {
				$(".js-media-url-input", $app["post"]).focus().on("keyup", function () {
					//	if ($.inArray(event.keyCode, [16, 17, 18])) { return; }
					app.Post.getThumbnail($(this).val());
				});
			} else if (type === "text") {
				$(".js-caption-input", $app["post"]).focus().on("keyup", function () {
					if ($(this).val().length > 0) {
						app.Post.authorize();
					} else {
						app.Post.deauthorize();
					}
				});
			}

			UI.backdrop.show($app["post"]);

			// view manager
			router["view-manager"].replace("new-post");
			history.replaceState({ "view": "new-post", "type": type, "id": data["numero"] }, null, null);
		},

		// send: function() {
		//
		// },

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Post.close()
		close: function close() {
			//	tarefa_active = null;
			$("head meta[name='theme-color']").attr("content", UI.data["theme-color"]["original"]);

			$app["post"].removeClass("slide-y").one("transitionend", function () {
				$app["post"].removeClass("in").empty();
				UI.backdrop.hide($app["post"]);
			});

			router["view-manager"].replace("tarefa");
		}
	};
}();

////////////////////////////////////////////////////////////////////////////////////////////////////
// image upload ////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var file_stack = {};

function upload(files) {
	var exif_orientation_to_degrees = {
		0: 0,
		1: 0,
		2: 0,
		3: 180,
		4: 0,
		5: 0,
		6: 90,
		7: 0,
		8: 270
	};

	FileAPI.filterFiles(files, function (file, info) {
		if (/^image/.test(file.type)) {
			file_stack[file["name"]] = info;
			return true;
			//	return info.width >= 320 && info.height >= 240;
		}
		return false;
	}, function (files, rejected) {
		if (files.length) {
			$(".submit", $app["post"]).addClass("disabled");

			// preview
			FileAPI.each(files, function (file) {
				var exif_orientation = file_stack[file["name"]]["exif"]["Orientation"];
				file_stack[file["name"]]["ref"] = tarefa_active + "-" + Lista.Usuario["id"] + "-" + moment().format("X") + "-" + rand(0, 999).toFixed(0);

				if (file["type"] == "image/gif") {
					var reader = new FileReader();
					reader.onload = function (event) {
						var img = $("<img />").attr("src", event.target.result);
						var $tracker = $("<input type=\"hidden\" name=\"image-order[]\" />").val(file_stack[file["name"]]["ref"]);

						var $status = $("<div />").addClass("progress");
						$("<div />").addClass("status").html("<strong>Enviando&hellip;</strong>").appendTo($status);
						$("<div />").addClass("bar").appendTo($status);

						var $preview = $("<li />").attr("id", "file-" + file_stack[file["name"]]["ref"]).append($tracker).append($status).append(img);
						$("#dropzone #board").append($preview);
					};
					reader.readAsDataURL(file);
				} else {
					FileAPI.Image(file).rotate(exif_orientation_to_degrees[exif_orientation]).resize(600, 300, "preview").get(function (err, img) {
						//	$tracker = $("<input type=\"hidden\" name=\"image-order[]\" />")
						//		.val(tarefa_active + "-" + Lista.Usuario["id"] + "-" + file["name"]);
						var $tracker = $("<input type=\"hidden\" name=\"image-order[]\" />").val(file_stack[file["name"]]["ref"]);

						var $status = $("<div />").addClass("progress");
						$("<div />").addClass("status").html("<strong>Enviando&hellip;</strong>").appendTo($status);
						$("<div />").addClass("bar").appendTo($status);

						var $preview = $("<li />").attr("id", "file-" + file_stack[file["name"]]["ref"]).append($tracker).append($status).append(img);
						$("#dropzone #board").append($preview);
					});
				}
			});

			// upload
			FileAPI.upload({
				url: "/tarefas/" + tarefa_active + "/postar",
				data: {
					"action": "upload",
					"edicao": Lista.Edicao["titulo"],
					"tarefa": tarefa_active,
					"turma": Lista.Usuario["turma"],
					"user": Lista.Usuario["id"]
				},
				prepare: function prepare(file, options) {
					options.data.ref = file_stack[file["name"]]["ref"];
					file.ref = file_stack[file["name"]]["ref"];
				},

				imageAutoOrientation: files[0]["type"] !== "image/gif" ? true : null,
				imageTransform: files[0]["type"] !== "image/gif" ? {
					maxWidth: 1920,
					maxHeight: 1920
				} : null,

				files: files,
				fileprogress: function fileprogress(event, file, xhr) {
					var percent = (event["loaded"] / event["total"] * 100).toFixed(0),
					    status = percent < 100 ? "<strong>Enviando&hellip;</strong> " + percent + "%" : "<strong>Processando&hellip;</strong>";

					$("#file-" + file["ref"] + " .status", "#dropzone").html(status);
				},
				progress: function progress(event) {
					//	var percent = ((event["loaded"] / event["total"]) * 100).toFixed(0) + "%"
					//	console.log(percent);
				},
				filecomplete: function filecomplete(file, xhr, options) {
					//	console.log(file, xhr, options);
					$("#file-" + options["ref"] + " .status", "#dropzone").html("<i class=\"material-icons\">check</i>");
				},
				complete: function complete(err, xhr) {
					app.Post.authorize();
					// $(".submit-button", $app["post"]).removeClass("disabled");
				}
			});
		}
	});
}

$.fn.dropzone = function () {
	// dropzone
	var $dropzone = $("#dropzone", this);
	FileAPI.event.dnd($dropzone[0], function (over) {
		if (over) {
			$dropzone.addClass("active");
		} else {
			$dropzone.removeClass("active");
		}
	}, function (files) {
		upload(files);
	});

	// manual select
	var $file_input = document.getElementById("form-file");
	FileAPI.event.on($file_input, "change", function (event) {
		var files = FileAPI.getFiles(event);
		upload(files);
	});

	// reorder
	var $board = $("#board", this);
	$board.on("slip:beforewait", function (event) {
		if (UI.data["interaction-type"] === "pointer") {
			event.preventDefault();
		}
	}).on("slip:afterswipe", function (event) {
		event.target.remove();
	}).on("slip:reorder", function (event) {
		event = event.originalEvent;
		event.target.parentNode.insertBefore(event.target, event.detail.insertBefore);
		return false;
	});

	new Slip($board[0]);
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// login ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// app.Login.open()
// app.Login.close()
// app.Login.submit() [?]
// app.Login.logout()

app.Login = function () {
	Lista.Usuario = {
		"id": null,
		"name": null,
		"email": null,
		"token": null,
		"turma": null,
		"signed-in": false
	};

	// Se tiver dados guardados no localStorage, usa eles pra logar
	if (localStorage && localStorage.getItem("Lista.Usuario")) {
		Lista.Usuario = JSON.parse(localStorage.getItem("Lista.Usuario"));

		$(function () {
			if (Lista.Usuario["id"] !== null) {
				$ui["body"].addClass("signed-in user-" + Lista.Usuario["turma"]);

				// Mostra toast somente após 3 segundos
				// depois do load da Lista
				cue["load-edicao"].done(function () {
					setTimeout(function () {
						UI.toast.show("Olá " + Lista.Usuario["name"] + "!");
					}, 3000);
				});
			}
		});
	}

	$(function () {
		$ui["login"] = $(".app-login");
		$ui["login"]["button"] = $(".js-login-button", $ui["login"]);

		// Botões de login e logout
		$(".js-login-trigger", $ui["sidenav"]).on("click", function (event) {
			event.preventDefault();
			UI.sidenav.close();
			app.Login.show();
		});

		$(".js-logout-trigger", $ui["sidenav"]).on("click", function (event) {
			event.preventDefault();
			UI.sidenav.close();
			app.Login.logout();
		});

		// Ação de login
		$ui["login"].on("click", ".back-button", function (event) {
			event.preventDefault();
			app.Login.hide();
		}).on("submit", "form", function (event) {
			event.preventDefault();

			$(".js-login-button", $ui["form"]).trigger("click");
			var login_data = $("form", $ui["login"]).serialize();
			app.Login.submit(login_data);
		});
	});

	return {
		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Login.show()
		show: function show() {
			// Abre a tela de login e coloca o foco no campo e-mail
			$ui["login"].addClass("in").reflow().addClass("slide").one("transitionend", function () {
				UI.body.lock();
				UI.backdrop.show($ui["login"]);
				$("input[name='email']", $ui["login"]).focus();
			});
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Login.hide()
		hide: function hide() {
			$ui["login"].removeClass("slide").one("transitionend", function () {
				$ui["login"].removeClass("in");
				UI.backdrop.hide($ui["login"]);
				UI.body.unlock();
			});
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Login.submit()
		submit: function submit(data) {
			// Desativa o botão e coloca mensagem de espera
			$ui["login"]["button"].prop("disabled", true).text("Aguarde…");

			// Envia pedido para a API
			ListaAPI("/identificacao", data).done(function (response) {
				if (response["meta"]["status"] === 200) {
					Lista.Usuario = response["user"];
					Lista.Usuario["signed-in"] = true;
					localStorage.setItem("Lista.Usuario", JSON.stringify(Lista.Usuario));

					$ui["body"].addClass("signed-in user-" + Lista.Usuario["turma"]);
					app.Login.hide();
					setTimeout(function () {
						UI.toast.show("Olá " + Lista.Usuario["name"] + "!");
					}, 500);

					analytics("Login", "Acesso");
				} else {
					// Se tentativa for recusada,
					// coloca animação no campo de login por 1 segundo
					$(".form-group", $ui["login"]).addClass("animated shake");

					setTimeout(function () {
						$(".form-group", $ui["login"]).removeClass("animated shake");
					}, 1000);

					analytics("Login", "Erro");
				}
			}).fail(function () {
				UI.toast.show("Ocorreu um erro. Tente novamente");
				analytics("Login", "Erro");
			}).always(function () {
				$ui["login"]["button"].prop("disabled", false).text("Login");
				analytics("Login", "Tentativa");
			});
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Login.logout()
		logout: function logout() {
			// Tira as classes indicadoras de login do body
			$ui["body"].removeClass("signed-in user-" + Lista.Usuario["turma"]);

			// Limpa Lista.Usuario tanto na página quanto no localStorage
			Lista.Usuario = {
				"id": null,
				"name": null,
				"email": null,
				"token": null,
				"turma": null,
				"signed-in": false
			};

			localStorage.setItem("Lista.Usuario", JSON.stringify(Lista.Usuario));

			// Depois de 0,5 segundo,
			// mostra toast confirmando logout
			setTimeout(function () {
				UI.toast.show("Sessão encerrada!");
			}, 500);

			analytics("Login", "Logout");
		}
	};
}();

////////////////////////////////////////////////////////////////////////////////////////////////////
// workers /////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// start
worker.Start = function () {
	timing["delay-start"] = setTimeout(function () {
		log("worker.Start", "info");

		cue["load-edicao"] = $.Deferred();
		cue["first-load"] = true;

		cue["load-edicao"].done(function () {
			// Se tiver número de tarefa especificado na URL, abre ela
			if (router["path"] && router["path"][2]) {
				// Antes, testa se o valor é um número
				// e dentro do número de tarefas dessa Edição
				var numero = router["path"][2];
				if (!isNaN(numero) && numero >= 1 && numero <= Lista.Edicao["numero-de-tarefas"]) {
					app.Tarefa.open(numero, false, false);
				}
			}

			// Se for o primeiro load
			if (cue["first-load"]) {
				// Inicia a barra de evolução
				timing["delay-evolucao"] = setTimeout(app.Evolucao.start, 100);

				// Inicia a checagem de atividade
				worker.Update();

				// Desativa nos loads seguintes
				cue["first-load"] = false;
			}

			// app.Placar.start();
		});

		timing["delay-load"] = setTimeout(function () {
			worker.Load();
		}, 300);

		analytics("Lista", "Acesso");
	}, 0);
}();

// load
worker.Load = function () {
	log("worker.Load", "info");

	ListaAPI("/tudo").done(function (response) {
		Lista.Edicao = response["edicao"];
		Lista.Placar = response["placar"];
		Lista.Tarefas = response["tarefas"];

		timing["delay-lista"] = setTimeout(function () {
			// Dispara a função de montagem da Lista
			app.Lista.start();
			app.Placar.update();

			// Resolve a promise load-edicao
			cue["load-edicao"].resolve();
			log("cue[\"load-edicao\"] triggered");
		}, 1);

		// timing["delay-placar"] = setTimeout(app.Placar.start, 400);
	});
};

// update
worker.Update = function () {
	var updates = {
		"tarefas": 0,
		"posts": 0,
		"total": 0,
		"last-updated": null
	};

	timing["atividade"] = setInterval(function () {
		log("worker.Update", "info");

		ListaAPI("/atividade").done(function (response) {
			// console.info(updates);
			// Confere data de cada atividade e vê se é posterior à última atualização.
			// Se for, adiciona à contagem de nova atividade
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = response[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var atividade = _step2.value;

					// console.log(moment(atividade["ts"]).isAfter(updates["last-updated"]));
					if (moment(atividade["ts"]).isAfter(updates["last-updated"]) && atividade["autor"] != Lista.Usuario["id"]) {
						updates["total"]++;

						if (atividade["acao"] === "nova-tarefa") {
							updates["tarefas"]++;
						} else if (atividade["acao"] === "novo-post") {
							updates["posts"]++;
						}
					}
				}

				// Se houver nova atividade
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			if (updates["total"] > 0) {
				// Monta o texto do toast
				var texto = {
					"tarefas": updates["tarefas"] + " " + (updates["tarefas"] > 1 ? "novas tarefas" : "nova tarefa"),
					"posts": updates["posts"] + " " + (updates["posts"] > 1 ? "novos posts" : "novo post"),
					"final": ""
				};

				if (updates["tarefas"] > 0) {
					texto["final"] += texto["tarefas"];
				}
				if (updates["tarefas"] > 0 && updates["posts"] > 0) {
					texto["final"] += " e ";
				}
				if (updates["posts"] > 0) {
					texto["final"] += texto["posts"];
				}

				// Mostra o toast
				UI.toast.show({
					"message": texto["final"],
					"label": "Atualizar",
					"action": function action() {
						worker.Load();
						updates["tarefas"] = 0;
						updates["posts"] = 0;
						updates["total"] = 0;
						$ui["page-title"].html(UI.data["page-title"]);
						analytics("Lista", "Atualização");
					},
					"persistent": true,
					"start-only": true
				});

				// Mostra número de novas atividades no título
				$ui["title"].html("(" + updates["total"] + ") " + UI.data["page-title"]);
			}

			updates["last-updated"] = response[0] ? moment(response[0]["ts"]) : moment();

			// console.log(response, updates);
		});
	}, 30000);
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// fonts ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Cria uma promise que será resolvida
// quando as fontes forem carregadas
cue["load-fonts"] = $.Deferred();

WebFont.load({
	timeout: 15000,
	google: {
		families: ["Material Icons",
		// "Roboto:400,400italic,500:latin",
		// "Roboto+Mono:700:latin",
		"Lato:400:latin"]
	},
	custom: {
		families: ["FontAwesome"],
		urls: ["https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"]
	},
	active: function active() {
		cue["load-fonts"].resolve();

		$(function () {
			app.Lista.layout();
		});
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// momentjs ////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

moment.locale("pt-br", {
	"months": "janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro".split("_"),
	"monthsShort": "jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez".split("_"),
	"weekdays": "domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado".split("_"),
	"weekdaysShort": "dom_seg_ter_qua_qui_sex_sáb".split("_"),
	"weekdaysMin": "dom_2ª_3ª_4ª_5ª_6ª_sáb".split("_"),
	"longDateFormat": {
		"LT": "HH:mm",
		"LTS": "HH:mm:ss",
		"L": "DD/MM/YYYY",
		"LL": "D [de] MMMM [de] YYYY",
		"LLL": "D [de] MMMM [de] YYYY [às] HH:mm",
		"LLLL": "dddd, D [de] MMMM [de] YYYY [às] HH:mm"
	},
	"calendar": {
		"sameDay": "[hoje] LT",
		"nextDay": "[amanhã] LT",
		"nextWeek": "dddd LT",
		"lastDay": "[ontem] LT",
		"lastWeek": "dddd LT",
		"sameElse": "L"
	},
	"relativeTime": {
		"future": "daqui %s",
		"past": "%s atrás",
		"s": "poucos segundos",
		"m": "um minuto",
		"mm": "%d minutos",
		"h": "uma hora",
		"hh": "%d horas",
		"d": "um dia",
		"dd": "%d dias",
		"M": "um mês",
		"MM": "%d meses",
		"y": "um ano",
		"yy": "%d anos"
	},
	"ordinalParse": /\d{1,2}º/,
	"ordinal": "%dº"
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiLCJ1dGlsaXRpZXMuanMiLCJ0ZW1wbGF0ZS1lbmdpbmUuanMiLCJyb3V0ZXIuanMiLCJkb2N1bWVudC5qcyIsImJvZHkuanMiLCJsb2FkYmFyLmpzIiwiYmFja2Ryb3AuanMiLCJzaWRlbmF2LmpzIiwiYm90dG9tc2hlZXQuanMiLCJ0b2FzdC5qcyIsImFwaS5qcyIsInBsYWNhci5qcyIsImV2b2x1Y2FvLmpzIiwibGlzdGEuanMiLCJ0YXJlZmEuanMiLCJwb3N0LmpzIiwidXBsb2FkLmpzIiwibG9naW4uanMiLCJ3b3JrZXJzLmpzIiwiZm9udHMuanMiLCJtb21lbnQtbG9jYWxlLmpzIl0sIm5hbWVzIjpbIkxpc3RhIiwiRWRpY2FvIiwiUGxhY2FyIiwiVGFyZWZhcyIsIlVzdWFyaW8iLCJhcHAiLCIkYXBwIiwiY2FjaGUiLCJjdWUiLCJ3b3JrZXIiLCJ0aW1pbmciLCJsb2dnaW5nIiwibG9nIiwibWVzc2FnZSIsInR5cGUiLCJ0aW1lc3RhbXAiLCJtb21lbnQiLCJmb3JtYXQiLCJjb25zb2xlIiwiYW5hbHl0aWNzIiwiY2F0ZWdvcnkiLCJhY3Rpb24iLCJsYWJlbCIsImdhIiwidGFyZWZhX2FjdGl2ZSIsInJhbmQiLCJtaW4iLCJtYXgiLCJNYXRoIiwicmFuZG9tIiwiJHRlbXBsYXRlcyIsIiQiLCJlYWNoIiwiJHRoaXMiLCJuYW1lIiwiYXR0ciIsImh0bWwiLCJyZW1vdmUiLCJfX3JlbmRlciIsInRlbXBsYXRlIiwiZGF0YSIsIiRyZW5kZXIiLCJjbG9uZSIsImZuIiwiZmlsbEJsYW5rcyIsIiRibGFuayIsImZpbGwiLCJydWxlcyIsInNwbGl0IiwiaSIsImxlbmd0aCIsInBhaXIiLCJkZXN0IiwidHJpbSIsInNvdXJjZSIsInZhbHVlIiwiYWRkQ2xhc3MiLCJ2YWwiLCJpZl9udWxsIiwiaGlkZSIsInJlbW92ZUNsYXNzIiwicmVtb3ZlQXR0ciIsImhhc0NsYXNzIiwicm91dGVyIiwibG9jYXRpb24iLCJwYXRobmFtZSIsImhhc2giLCJwYXRoIiwib2JqZWN0IiwidGl0bGUiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwibGluayIsImFkZCIsInZpZXciLCJwdXNoIiwiZ3JlcCIsInJlcGxhY2UiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJzdGF0ZSIsImluZGV4T2YiLCJVSSIsImJvdHRvbXNoZWV0IiwiY2xvc2UiLCJQb3N0IiwiVGFyZWZhIiwib3BlbiIsIiR1aSIsImRvY3VtZW50IiwiYm9keSIsInRleHQiLCJyZWZsb3ciLCJvZmZzZXQiLCJsZWZ0IiwibmF2aWdhdG9yIiwibXNNYXhUb3VjaFBvaW50cyIsInNldExheW91dFByb3BlcnRpZXMiLCJ3aWR0aCIsImhlaWdodCIsImZsb29yIiwibGF5b3V0X2NsYXNzIiwiZ2V0U2Nyb2xsYmFyU2l6ZSIsIiRvdXRlckNvbnRhaW5lciIsImNzcyIsImFwcGVuZFRvIiwiJGlubmVyQ29udGFpbmVyIiwib24iLCJzZXRTY3JvbGxQb3NpdGlvbiIsInNjcm9sbFRvcCIsInNjcm9sbFN0YXR1cyIsInkiLCJsb2NrIiwidW5sb2NrIiwibG9hZGJhciIsInNob3ciLCJzZXRUaW1lb3V0Iiwib25lIiwiYmFja2Ryb3AiLCIkc2NyZWVuIiwiZXZlbnRzIiwic2NyZWVuIiwiemluZGV4IiwiaGFuZGxlciIsInRyaWdnZXIiLCJvZmYiLCJzaWRlbmF2IiwicHJldmVudERlZmF1bHQiLCIkY29udGVudCIsImVtcHR5IiwidG9hc3QiLCJjb25maWciLCJkaXNtaXNzIiwiY2xlYXJUaW1lb3V0IiwiY2FsbGJhY2siLCJwZXJzaXN0ZW50IiwiYXBpX2tleSIsIkxpc3RhQVBJIiwiZW5kcG9pbnQiLCJhcGlfdXJsIiwiZWRpY2FvIiwicmVxdWVzdCIsImdldEpTT04iLCJzdGFydCIsInVwZGF0ZSIsIm1haW9yX3BvbnR1YWNhbyIsInRvdGFsX2RlX3BvbnRvcyIsImZvckVhY2giLCJ0dXJtYSIsInBvbnR1YWNhb19kYV90dXJtYSIsInBlcmNlbnR1YWxfZGFfdHVybWEiLCJ0b1VwcGVyQ2FzZSIsInRvRml4ZWQiLCJ0b1N0cmluZyIsIiR0dXJtYSIsImFwcGVuZCIsIkV2b2x1Y2FvIiwiZHVyYWNhb190b3RhbCIsImRpYV9pbmljaWFsIiwiZGlhX2ZpbmFsIiwiZGlmZiIsImRpYSIsImlzQmVmb3JlIiwiaW5pY2lvX2RvX2RpYSIsImZpbmFsX2RvX2RpYSIsImVuZE9mIiwiaXNBZnRlciIsImR1cmFjYW9fZG9fZGlhIiwicGVyY2VudHVhbF9kb19kaWEiLCJsYXJndXJhX2RvX2RpYSIsIiRkaWEiLCJzZXRJbnRlcnZhbCIsImFnb3JhIiwidGVtcG9fdHJhbnNjb3JyaWRvIiwicGVyY2VudHVhbF90cmFuc2NvcnJpZG8iLCJsYXJndXJhX2RhX2JhcnJhIiwiaXNvdG9wZSIsImVsZW1lbnQiLCJwYXJzZUludCIsIndoaWNoIiwiJGNhcmQiLCJudW1lcm8iLCJ0YXJlZmFzIiwic3RhdHVzIiwibWVzc2FnZXMiLCJjbGVhckludGVydmFsIiwicGFnZV90aXRsZSIsImNsb3NpbmdfbWVzc2FnZSIsInRhcmVmYSIsIiR0YXJlZmEiLCIkZ3JpZCIsIm1heF9tZWRpYV90b19zaG93Iiwic2hvd25fbWVkaWFfY291bnQiLCJwb3N0X3R5cGVzX3dpdGhfaW1hZ2VfcHJldmlldyIsInBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXciLCJwb3N0IiwidGlsZV90eXBlIiwibWVkaWEiLCJzdWJzdHJpbmciLCIkdGlsZSIsImxheW91dCIsInNvcnQiLCJjcml0ZXJpYSIsIiRzdHJlYW0iLCJmaW5kIiwicGxhY2FyX2RhX3RhcmVmYSIsInJlbmRlclBvc3RzIiwicG9zdHMiLCIkcG9zdHMiLCJpbmRleCIsImNhbGVuZGFyIiwiJGNvbnRlbnRfY2FyZCIsIiRtZWRpYSIsIiRpbWFnZSIsIiRlbWJlZCIsInJlbmRlciIsImdvIiwiJHRhcmVmYV9jYXJkIiwib2JzZXJ2ZXIiLCJvdXRlckhlaWdodCIsInNlcmlhbGl6ZSIsImRvbmUiLCJyZXNwb25zZSIsInZpYnJhdGUiLCJmYWlsIiwiYXV0aG9yaXplIiwiZGVhdXRob3JpemUiLCJnZXRUaHVtYm5haWwiLCJ1cmwiLCJtZWRpYV9pbmZvIiwic2hvd1RodW1ibmFpbCIsIiR0aHVtYm5haWwiLCJmYWRlSW4iLCJtYXRjaCIsInlvdXR1YmVfdXJsIiwidmltZW9fdXJsIiwiJG5ld19wb3N0X3ZpZXciLCJ2aWV3X3RoZW1lX2NvbG9yIiwiZHJvcHpvbmUiLCJmb2N1cyIsInJlcGxhY2VTdGF0ZSIsImZpbGVfc3RhY2siLCJ1cGxvYWQiLCJmaWxlcyIsImV4aWZfb3JpZW50YXRpb25fdG9fZGVncmVlcyIsIkZpbGVBUEkiLCJmaWx0ZXJGaWxlcyIsImZpbGUiLCJpbmZvIiwidGVzdCIsInJlamVjdGVkIiwiZXhpZl9vcmllbnRhdGlvbiIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJpbWciLCJ0YXJnZXQiLCJyZXN1bHQiLCIkdHJhY2tlciIsIiRzdGF0dXMiLCIkcHJldmlldyIsInJlYWRBc0RhdGFVUkwiLCJJbWFnZSIsInJvdGF0ZSIsInJlc2l6ZSIsImdldCIsImVyciIsInByZXBhcmUiLCJvcHRpb25zIiwicmVmIiwiaW1hZ2VBdXRvT3JpZW50YXRpb24iLCJpbWFnZVRyYW5zZm9ybSIsIm1heFdpZHRoIiwibWF4SGVpZ2h0IiwiZmlsZXByb2dyZXNzIiwieGhyIiwicGVyY2VudCIsInByb2dyZXNzIiwiZmlsZWNvbXBsZXRlIiwiY29tcGxldGUiLCIkZHJvcHpvbmUiLCJkbmQiLCJvdmVyIiwiJGZpbGVfaW5wdXQiLCJnZXRFbGVtZW50QnlJZCIsImdldEZpbGVzIiwiJGJvYXJkIiwib3JpZ2luYWxFdmVudCIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJkZXRhaWwiLCJTbGlwIiwiTG9naW4iLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiSlNPTiIsInBhcnNlIiwibG9nb3V0IiwibG9naW5fZGF0YSIsInN1Ym1pdCIsInByb3AiLCJzZXRJdGVtIiwic3RyaW5naWZ5IiwiYWx3YXlzIiwiU3RhcnQiLCJEZWZlcnJlZCIsImlzTmFOIiwiVXBkYXRlIiwiTG9hZCIsInJlc29sdmUiLCJ1cGRhdGVzIiwiYXRpdmlkYWRlIiwidGV4dG8iLCJXZWJGb250IiwibG9hZCIsInRpbWVvdXQiLCJnb29nbGUiLCJmYW1pbGllcyIsImN1c3RvbSIsInVybHMiLCJhY3RpdmUiLCJsb2NhbGUiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUFBLFFBQUEsRUFBQTtBQUNBQSxNQUFBQyxNQUFBLEdBQUEsRUFBQTtBQUNBRCxNQUFBRSxNQUFBLEdBQUEsRUFBQTtBQUNBRixNQUFBRyxPQUFBLEdBQUEsRUFBQTtBQUNBSCxNQUFBSSxPQUFBLEdBQUEsRUFBQTs7QUFFQTtBQUNBO0FBQ0EsSUFBQUMsTUFBQSxFQUFBO0FBQ0EsSUFBQUMsT0FBQSxFQUFBOztBQUVBLElBQUFDLFFBQUEsRUFBQTtBQUNBQSxNQUFBLFNBQUEsSUFBQSxFQUFBOztBQUVBOztBQUVBLElBQUFDLE1BQUEsRUFBQTtBQUNBLElBQUFDLFNBQUEsRUFBQTtBQUNBLElBQUFDLFNBQUEsRUFBQTs7QUFFQTtBQUNBO0FBQ0EsSUFBQUMsVUFBQSxLQUFBO0FBQ0EsSUFBQUMsTUFBQSxTQUFBQSxHQUFBLENBQUFDLE9BQUEsRUFBQUMsSUFBQSxFQUFBO0FBQ0EsS0FBQUgsT0FBQSxFQUFBO0FBQ0E7QUFDQSxNQUFBSSxZQUFBQyxTQUFBQyxNQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0FKLFlBQUEsTUFBQUUsU0FBQSxHQUFBLElBQUEsR0FBQUYsT0FBQTs7QUFFQSxNQUFBLENBQUFDLElBQUEsRUFBQTtBQUNBSSxXQUFBTixHQUFBLENBQUFDLE9BQUE7QUFDQSxHQUZBLE1BRUE7QUFDQUssV0FBQUosSUFBQSxFQUFBRCxPQUFBO0FBQ0E7QUFDQTtBQUNBLENBWkE7O0FBY0EsSUFBQU0sWUFBQSxTQUFBQSxTQUFBLENBQUFDLFFBQUEsRUFBQUMsTUFBQSxFQUFBQyxLQUFBLEVBQUE7QUFDQSxLQUFBLE9BQUFDLEVBQUEsS0FBQSxXQUFBLEVBQUE7QUFDQUEsS0FBQSxNQUFBLEVBQUEsT0FBQSxFQUFBSCxRQUFBLEVBQUFDLE1BQUEsRUFBQUMsS0FBQTtBQUNBO0FBQ0EsQ0FKQTs7QUFNQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsSUFBQUUsYUFBQTs7QUN2REE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBQUMsT0FBQSxTQUFBQSxJQUFBLENBQUFDLEdBQUEsRUFBQUMsR0FBQSxFQUFBO0FBQ0EsUUFBQUMsS0FBQUMsTUFBQSxNQUFBRixNQUFBRCxHQUFBLElBQUFBLEdBQUE7QUFDQSxDQUZBOztBQ0xBO0FBQ0E7QUFDQTs7QUFFQSxJQUFBSSxhQUFBLEVBQUE7O0FBRUFDLEVBQUEsWUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBQSxHQUFBLFVBQUEsRUFBQUMsSUFBQSxDQUFBLFlBQUE7QUFDQSxNQUFBQyxRQUFBRixFQUFBLElBQUEsQ0FBQTtBQUNBLE1BQUFHLE9BQUFELE1BQUFFLElBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxNQUFBQyxPQUFBSCxNQUFBRyxJQUFBLEVBQUE7O0FBRUFOLGFBQUFJLElBQUEsSUFBQUgsRUFBQUssSUFBQSxDQUFBO0FBQ0FILFFBQUFJLE1BQUE7QUFDQSxFQVBBO0FBUUEsQ0FaQTs7QUFjQSxTQUFBQyxRQUFBLENBQUFDLFFBQUEsRUFBQUMsSUFBQSxFQUFBO0FBQ0E7QUFDQSxLQUFBLENBQUFWLFdBQUFTLFFBQUEsQ0FBQSxFQUFBO0FBQ0EsU0FBQSxLQUFBO0FBQ0E7O0FBRUEsS0FBQUUsVUFBQVgsV0FBQVMsUUFBQSxFQUFBRyxLQUFBLEVBQUE7O0FBRUFELFNBQUFELElBQUEsQ0FBQUEsSUFBQTs7QUFFQVQsR0FBQVksRUFBQSxDQUFBQyxVQUFBLEdBQUEsWUFBQTtBQUNBLE1BQUFDLFNBQUFkLEVBQUEsSUFBQSxDQUFBO0FBQ0EsTUFBQWUsT0FBQUQsT0FBQUwsSUFBQSxDQUFBLE1BQUEsQ0FBQTs7QUFFQSxNQUFBTyxRQUFBRCxLQUFBRSxLQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsT0FBQSxJQUFBQyxJQUFBLENBQUEsRUFBQUEsSUFBQUYsTUFBQUcsTUFBQSxFQUFBRCxHQUFBLEVBQUE7QUFDQSxPQUFBRSxPQUFBSixNQUFBRSxDQUFBLEVBQUFELEtBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxPQUFBSSxPQUFBRCxLQUFBLENBQUEsSUFBQUEsS0FBQSxDQUFBLEVBQUFFLElBQUEsRUFBQSxHQUFBLE1BQUE7QUFDQSxPQUFBQyxTQUFBSCxLQUFBLENBQUEsSUFBQUEsS0FBQSxDQUFBLEVBQUFFLElBQUEsRUFBQSxHQUFBRixLQUFBLENBQUEsQ0FBQTtBQUNBLE9BQUFJLFFBQUFmLEtBQUFjLE1BQUEsQ0FBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFBLE9BQUFDLEtBQUEsS0FBQSxXQUFBLElBQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQUgsU0FBQSxPQUFBLEVBQUE7QUFDQVAsWUFBQVcsUUFBQSxDQUFBRCxLQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUFILFNBQUEsTUFBQSxFQUFBO0FBQ0FQLFlBQUFULElBQUEsQ0FBQW1CLEtBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQUgsU0FBQSxPQUFBLEVBQUE7QUFDQVAsWUFBQVksR0FBQSxDQUFBRixLQUFBO0FBQ0EsS0FGQSxNQUVBO0FBQ0FWLFlBQUFWLElBQUEsQ0FBQWlCLElBQUEsRUFBQUcsS0FBQTtBQUNBO0FBQ0EsSUFWQSxNQVVBO0FBQ0EsUUFBQUcsVUFBQWIsT0FBQUwsSUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFFBQUFrQixZQUFBLE1BQUEsRUFBQTtBQUNBYixZQUFBYyxJQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUFELFlBQUEsUUFBQSxFQUFBO0FBQ0FiLFlBQUFSLE1BQUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUFRLFNBQ0FlLFdBREEsQ0FDQSxNQURBLEVBRUFDLFVBRkEsQ0FFQSxXQUZBLEVBR0FBLFVBSEEsQ0FHQSxnQkFIQTtBQUlBLEVBcERBOztBQXNEQSxLQUFBcEIsUUFBQXFCLFFBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQTtBQUNBckIsVUFBQUcsVUFBQTtBQUNBOztBQUVBYixHQUFBLE9BQUEsRUFBQVUsT0FBQSxFQUFBVCxJQUFBLENBQUEsWUFBQTtBQUNBRCxJQUFBLElBQUEsRUFBQWEsVUFBQTtBQUNBLEVBRkE7O0FBSUEsUUFBQUgsT0FBQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQSxJQUFBc0IsU0FBQSxFQUFBOztBQUVBO0FBQ0E7QUFDQUEsT0FBQSxNQUFBLElBQUFDLFNBQUFDLFFBQUEsQ0FBQWpCLEtBQUEsQ0FBQSxHQUFBLENBQUE7O0FBRUEsSUFBQWUsT0FBQSxNQUFBLEVBQUEsQ0FBQSxNQUFBLFNBQUEsRUFBQTtBQUNBQSxRQUFBLGlCQUFBLElBQUEsTUFBQTtBQUNBLENBRkEsTUFFQTtBQUNBQSxRQUFBLGlCQUFBLElBQUEsTUFBQTtBQUNBQSxRQUFBLE1BQUEsSUFBQUMsU0FBQUUsSUFBQSxDQUFBbEIsS0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQWUsT0FBQSxJQUFBLElBQUEsVUFBQUksSUFBQSxFQUFBQyxNQUFBLEVBQUFDLEtBQUEsRUFBQTtBQUNBLEtBQUFOLE9BQUEsaUJBQUEsTUFBQSxNQUFBLEVBQUE7QUFDQU8sVUFBQUMsU0FBQSxDQUFBSCxNQUFBLEVBQUFDLEtBQUEsRUFBQUYsSUFBQTtBQUNBLEVBRkEsTUFFQTtBQUNBRyxVQUFBQyxTQUFBLENBQUFILE1BQUEsRUFBQUMsS0FBQSxFQUFBLE1BQUFGLElBQUE7QUFDQTtBQUNBO0FBQ0EsQ0FQQTs7QUFTQTtBQUNBO0FBQ0FKLE9BQUEsWUFBQSxJQUFBLFVBQUFJLElBQUEsRUFBQTtBQUNBLEtBQUFLLElBQUE7QUFDQSxLQUFBVCxPQUFBLGlCQUFBLE1BQUEsTUFBQSxFQUFBO0FBQ0FTLFNBQUFMLElBQUE7QUFDQSxFQUZBLE1BRUE7QUFDQUssU0FBQSxNQUFBTCxJQUFBO0FBQ0E7O0FBRUEsUUFBQUssSUFBQTtBQUNBLENBVEE7O0FBV0E7QUFDQTtBQUNBVCxPQUFBLGNBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBQSxPQUFBLGNBQUEsSUFBQSxZQUFBO0FBQ0EsUUFBQTtBQUNBVSxPQUFBLGFBQUFDLElBQUEsRUFBQTtBQUNBWCxVQUFBLGNBQUEsRUFBQVksSUFBQSxDQUFBRCxJQUFBO0FBQ0E7QUFDQSxHQUpBO0FBS0FyQyxVQUFBLGdCQUFBcUMsSUFBQSxFQUFBO0FBQ0FYLFVBQUEsY0FBQSxJQUFBaEMsRUFBQTZDLElBQUEsQ0FBQWIsT0FBQSxjQUFBLENBQUEsRUFBQSxVQUFBUixLQUFBLEVBQUE7QUFDQSxXQUFBQSxVQUFBbUIsSUFBQTtBQUNBLElBRkEsQ0FBQTtBQUdBO0FBQ0EsR0FWQTtBQVdBRyxXQUFBLGlCQUFBSCxJQUFBLEVBQUE7QUFDQVgsVUFBQSxjQUFBLElBQUEsRUFBQTtBQUNBQSxVQUFBLGNBQUEsRUFBQVUsR0FBQSxDQUFBQyxJQUFBO0FBQ0E7QUFkQSxFQUFBO0FBZ0JBLENBakJBLEVBQUE7O0FBbUJBOztBQUVBSSxPQUFBQyxnQkFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBQyxLQUFBLEVBQUE7QUFDQTs7QUFFQSxLQUFBQyxRQUFBRCxNQUFBQyxLQUFBOztBQUVBLEtBQUFBLFNBQUFBLE1BQUEsTUFBQSxNQUFBLFFBQUEsRUFBQTtBQUNBLE1BQUFsQixPQUFBLGNBQUEsRUFBQW1CLE9BQUEsQ0FBQSxhQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFBQUMsTUFBQUMsV0FBQSxDQUFBQyxLQUFBO0FBQUE7QUFDQSxNQUFBdEIsT0FBQSxjQUFBLEVBQUFtQixPQUFBLENBQUEsVUFBQSxJQUFBLENBQUEsQ0FBQSxFQUFBO0FBQUE3RSxPQUFBaUYsSUFBQSxDQUFBRCxLQUFBO0FBQUE7QUFDQWhGLE1BQUFrRixNQUFBLENBQUFDLElBQUEsQ0FBQVAsTUFBQSxJQUFBLENBQUE7QUFDQSxFQUpBLE1BTUEsSUFBQUEsU0FBQUEsTUFBQSxNQUFBLE1BQUEsVUFBQSxFQUFBO0FBQ0E7QUFDQSxFQUZBLE1BSUEsSUFBQUEsU0FBQUEsTUFBQSxNQUFBLE1BQUEsYUFBQSxFQUFBO0FBQ0EsTUFBQWxCLE9BQUEsY0FBQSxFQUFBbUIsT0FBQSxDQUFBLFVBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUFBN0UsT0FBQWlGLElBQUEsQ0FBQUQsS0FBQTtBQUFBO0FBQ0E7O0FBRUE7QUFKQSxNQUtBO0FBQ0EsT0FBQXRCLE9BQUEsY0FBQSxFQUFBbUIsT0FBQSxDQUFBLGFBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUFBQyxPQUFBQyxXQUFBLENBQUFDLEtBQUE7QUFBQTtBQUNBLE9BQUF0QixPQUFBLGNBQUEsRUFBQW1CLE9BQUEsQ0FBQSxVQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFBQTdFLFFBQUFpRixJQUFBLENBQUFELEtBQUE7QUFBQTtBQUNBaEYsT0FBQWtGLE1BQUEsQ0FBQUYsS0FBQTtBQUNBO0FBRUEsQ0ExQkE7O0FBNEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0EsSUFBQUYsS0FBQSxFQUFBO0FBQ0FBLEdBQUEzQyxJQUFBLEdBQUEsRUFBQTs7QUFFQSxJQUFBaUQsTUFBQSxFQUFBO0FBQ0FBLElBQUEsUUFBQSxJQUFBMUQsRUFBQStDLE1BQUEsQ0FBQTtBQUNBVyxJQUFBLE1BQUEsSUFBQTFELEVBQUEyRCxTQUFBQyxJQUFBLENBQUE7O0FBRUE7QUFDQTtBQUNBRixJQUFBLFlBQUEsSUFBQTFELEVBQUEsWUFBQSxDQUFBO0FBQ0FvRCxHQUFBM0MsSUFBQSxDQUFBLFlBQUEsSUFBQWlELElBQUEsWUFBQSxFQUFBRyxJQUFBLEVBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E3RCxFQUFBWSxFQUFBLENBQUFrRCxNQUFBLEdBQUEsWUFBQTtBQUNBLEtBQUFDLFNBQUFMLElBQUEsTUFBQSxFQUFBSyxNQUFBLEdBQUFDLElBQUE7QUFDQSxRQUFBaEUsRUFBQSxJQUFBLENBQUE7QUFDQSxDQUhBOztBSDlDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQW9ELEdBQUEzQyxJQUFBLENBQUEsYUFBQSxJQUFBLEVBQUE7O0FBRUFULEVBQUEsWUFBQTtBQUNBMEQsS0FBQSxPQUFBLElBQUExRCxFQUFBLFlBQUEsQ0FBQTtBQUNBb0QsSUFBQTNDLElBQUEsQ0FBQSxPQUFBLElBQUFpRCxJQUFBLE9BQUEsRUFBQXJELElBQUEsRUFBQTs7QUFFQXFELEtBQUEsYUFBQSxJQUFBMUQsRUFBQSwwQkFBQSxDQUFBO0FBQ0FvRCxJQUFBM0MsSUFBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLElBQUFpRCxJQUFBLGFBQUEsRUFBQXRELElBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQSxDQU5BOztBQVFBO0FBQ0FnRCxHQUFBM0MsSUFBQSxDQUFBLGtCQUFBLElBQUEsa0JBQUFzQyxNQUFBLElBQUFrQixVQUFBQyxnQkFBQSxHQUFBLE9BQUEsR0FBQSxTQUFBOztBQUdBO0FBQ0E7O0FBRUE7QUFDQWQsR0FBQTNDLElBQUEsQ0FBQSxjQUFBLElBQUEsR0FBQSxDLENBQUE7QUFDQTJDLEdBQUEzQyxJQUFBLENBQUEsUUFBQSxJQUFBLEVBQUE7O0FBRUEsU0FBQTBELG1CQUFBLEdBQUE7QUFDQTtBQUNBZixJQUFBM0MsSUFBQSxDQUFBLFFBQUEsRUFBQSxPQUFBLElBQUFpRCxJQUFBLFFBQUEsRUFBQVUsS0FBQSxFQUFBO0FBQ0FoQixJQUFBM0MsSUFBQSxDQUFBLFFBQUEsRUFBQSxRQUFBLElBQUFpRCxJQUFBLFFBQUEsRUFBQVcsTUFBQSxFQUFBOztBQUVBO0FBQ0FqQixJQUFBM0MsSUFBQSxDQUFBLFNBQUEsSUFBQVosS0FBQXlFLEtBQUEsQ0FBQWxCLEdBQUEzQyxJQUFBLENBQUEsUUFBQSxFQUFBLE9BQUEsSUFBQTJDLEdBQUEzQyxJQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7O0FBRUE7QUFDQSxLQUFBOEQscUJBQUE7QUFDQSxLQUFBbkIsR0FBQTNDLElBQUEsQ0FBQSxTQUFBLE1BQUEsQ0FBQSxFQUFBO0FBQ0E4RCxpQkFBQSxrQkFBQTtBQUNBLEVBRkEsTUFFQSxJQUFBbkIsR0FBQTNDLElBQUEsQ0FBQSxTQUFBLE1BQUEsQ0FBQSxFQUFBO0FBQ0E4RCxpQkFBQSxnQkFBQTtBQUNBLEVBRkEsTUFFQTtBQUNBQSxpQkFBQSxpQkFBQTtBQUNBOztBQUVBYixLQUFBLE1BQUEsRUFBQTdCLFdBQUEsQ0FBQSxpREFBQSxFQUFBSixRQUFBLENBQUE4QyxZQUFBO0FBQ0E7O0FBRUEsU0FBQUMsZ0JBQUEsR0FBQTtBQUNBO0FBQ0EsS0FBQUMsa0JBQUF6RSxFQUFBLFNBQUEsRUFBQTBFLEdBQUEsQ0FBQTtBQUNBLGNBQUEsUUFEQTtBQUVBLGFBQUE7QUFGQSxFQUFBLEVBR0FDLFFBSEEsQ0FHQWpCLElBQUEsTUFBQSxDQUhBLENBQUE7QUFJQSxLQUFBa0Isa0JBQUE1RSxFQUFBLFNBQUEsRUFBQTJFLFFBQUEsQ0FBQUYsZUFBQSxDQUFBOztBQUVBckIsSUFBQTNDLElBQUEsQ0FBQSxnQkFBQSxJQUFBZ0UsZ0JBQUFMLEtBQUEsS0FBQVEsZ0JBQUFSLEtBQUEsRUFBQTtBQUNBSyxpQkFBQW5FLE1BQUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQU4sRUFBQSxZQUFBO0FBQUFtRSx1QkFBQUs7QUFBQSxDQUFBO0FBQ0FkLElBQUEsUUFBQSxFQUFBbUIsRUFBQSxDQUFBLFFBQUEsRUFBQVYsbUJBQUE7O0FBR0E7QUFDQTs7QUFFQTtBQUNBZixHQUFBM0MsSUFBQSxDQUFBLGlCQUFBLElBQUEsRUFBQTs7QUFFQSxTQUFBcUUsaUJBQUEsR0FBQTtBQUNBMUIsSUFBQTNDLElBQUEsQ0FBQSxpQkFBQSxFQUFBLEtBQUEsSUFBQWlELElBQUEsUUFBQSxFQUFBcUIsU0FBQSxFQUFBO0FBQ0EzQixJQUFBM0MsSUFBQSxDQUFBLGlCQUFBLEVBQUEsUUFBQSxJQUFBMkMsR0FBQTNDLElBQUEsQ0FBQSxpQkFBQSxFQUFBLEtBQUEsSUFBQTJDLEdBQUEzQyxJQUFBLENBQUEsUUFBQSxFQUFBLFFBQUEsQ0FBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQVQsRUFBQSxZQUFBO0FBQUE4RTtBQUFBLENBQUE7QUFDQXBCLElBQUEsUUFBQSxFQUFBbUIsRUFBQSxDQUFBLGVBQUEsRUFBQUMsaUJBQUE7O0FJaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUExQixHQUFBUSxJQUFBLEdBQUEsWUFBQTtBQUNBNUQsR0FBQSxZQUFBO0FBQ0E7QUFDQTBELE1BQUEsTUFBQSxFQUFBakMsUUFBQSxDQUFBLFFBQUEyQixHQUFBM0MsSUFBQSxDQUFBLGtCQUFBLENBQUE7QUFDQXVFO0FBQ0EsRUFKQTs7QUFNQXRCLEtBQUEsUUFBQSxFQUFBbUIsRUFBQSxDQUFBLFFBQUEsRUFBQUcsWUFBQTs7QUFFQSxVQUFBQSxZQUFBLEdBQUE7QUFDQSxNQUFBQyxJQUFBakYsRUFBQStDLE1BQUEsRUFBQWdDLFNBQUEsRUFBQTs7QUFFQSxNQUFBRSxJQUFBLENBQUEsRUFBQTtBQUNBdkIsT0FBQSxNQUFBLEVBQUE3QixXQUFBLENBQUEsWUFBQTtBQUNBLEdBRkEsTUFFQTtBQUNBNkIsT0FBQSxNQUFBLEVBQUFqQyxRQUFBLENBQUEsWUFBQTtBQUNBOztBQUVBLE1BQUF3RCxJQUFBLEVBQUEsRUFBQTtBQUNBdkIsT0FBQSxNQUFBLEVBQUFqQyxRQUFBLENBQUEsZUFBQSxFQUFBSSxXQUFBLENBQUEsZ0JBQUE7QUFDQSxHQUZBLE1BRUE7QUFDQTZCLE9BQUEsTUFBQSxFQUFBakMsUUFBQSxDQUFBLGdCQUFBLEVBQUFJLFdBQUEsQ0FBQSxlQUFBO0FBQ0E7QUFDQTs7QUFFQSxRQUFBO0FBQ0E7QUFDQTtBQUNBcUQsUUFBQSxnQkFBQTtBQUNBeEIsT0FBQSxNQUFBLEVBQUFqQyxRQUFBLENBQUEsV0FBQSxFQUFBaUQsR0FBQSxDQUFBLGNBQUEsRUFBQXRCLEdBQUEzQyxJQUFBLENBQUEsZ0JBQUEsQ0FBQTtBQUNBLEdBTEE7O0FBT0E7QUFDQTtBQUNBMEUsVUFBQSxrQkFBQTtBQUNBekIsT0FBQSxNQUFBLEVBQUE3QixXQUFBLENBQUEsV0FBQSxFQUFBNkMsR0FBQSxDQUFBLGNBQUEsRUFBQSxDQUFBO0FBQ0E7QUFYQSxFQUFBO0FBYUEsQ0F0Q0EsRUFBQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBdEIsR0FBQWdDLE9BQUEsR0FBQSxZQUFBO0FBQ0FwRixHQUFBLFlBQUE7QUFDQTBELE1BQUEsU0FBQSxJQUFBMUQsRUFBQSxhQUFBLENBQUE7QUFDQSxFQUZBOztBQUlBLFFBQUE7QUFDQXFGLFFBQUEsZ0JBQUE7QUFDQTNCLE9BQUEsU0FBQSxFQUFBakMsUUFBQSxDQUFBLElBQUE7QUFDQSxHQUhBO0FBSUFHLFFBQUEsZ0JBQUE7QUFDQWpELFVBQUEsY0FBQSxJQUFBMkcsV0FBQSxZQUFBO0FBQ0E1QixRQUFBLFNBQUEsRUFDQTdCLFdBREEsQ0FDQSxTQURBLEVBRUEwRCxHQUZBLENBRUEsZUFGQSxFQUVBLFlBQUE7QUFDQTdCLFNBQUEsU0FBQSxFQUFBN0IsV0FBQSxDQUFBLElBQUE7QUFDQSxLQUpBO0FBS0EsSUFOQSxFQU1BLEdBTkEsQ0FBQTtBQU9BO0FBWkEsRUFBQTtBQWNBLENBbkJBLEVBQUE7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQXVCLEdBQUFvQyxRQUFBLEdBQUEsWUFBQTtBQUNBOUIsS0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQTFELEdBQUEsWUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFMQTs7QUFPQSxRQUFBO0FBQ0FxRixRQUFBLGNBQUFJLE9BQUEsRUFBQUMsTUFBQSxFQUFBO0FBQ0EsT0FBQUMsU0FBQUYsUUFBQSxVQUFBLENBQUE7QUFDQSxPQUFBRyxTQUFBSCxRQUFBZixHQUFBLENBQUEsU0FBQSxJQUFBLENBQUE7O0FBRUFoQixPQUFBLFVBQUEsRUFBQWlDLE1BQUEsSUFBQXBGLFNBQUEsVUFBQSxDQUFBOztBQUVBUCxLQUFBQyxJQUFBLENBQUF5RixNQUFBLEVBQUEsVUFBQXpDLEtBQUEsRUFBQTRDLE9BQUEsRUFBQTtBQUNBbkMsUUFBQSxVQUFBLEVBQUFpQyxNQUFBLEVBQUFkLEVBQUEsQ0FBQTVCLEtBQUEsRUFBQTRDLE9BQUE7QUFDQSxJQUZBOztBQUlBbkMsT0FBQSxVQUFBLEVBQUFpQyxNQUFBLEVBQUFqQixHQUFBLENBQUEsU0FBQSxFQUFBa0IsTUFBQSxFQUNBZixFQURBLENBQ0EsT0FEQSxFQUNBLFlBQUE7QUFBQTdFLE1BQUEsSUFBQSxFQUFBOEYsT0FBQSxDQUFBLE1BQUE7QUFBQSxJQURBLEVBRUFuQixRQUZBLENBRUFqQixJQUFBLE1BQUEsQ0FGQSxFQUdBakMsUUFIQSxDQUdBLElBSEE7QUFJQSxHQWZBO0FBZ0JBRyxRQUFBLGNBQUE2RCxPQUFBLEVBQUE7QUFDQSxPQUFBRSxTQUFBRixRQUFBLFVBQUEsQ0FBQTtBQUNBL0IsT0FBQSxVQUFBLEVBQUFpQyxNQUFBLEVBQUE5RCxXQUFBLENBQUEsSUFBQSxFQUFBa0UsR0FBQSxDQUFBLE1BQUEsRUFBQXpGLE1BQUE7QUFDQTtBQW5CQSxFQUFBO0FBcUJBLENBL0JBLEVBQUE7O0FDTkE7QUFDQTtBQUNBOztBQUVBOEMsR0FBQTRDLE9BQUEsR0FBQSxZQUFBO0FBQ0FoRyxHQUFBLFlBQUE7QUFDQTBELE1BQUEsU0FBQSxJQUFBMUQsRUFBQSxnQkFBQSxDQUFBOztBQUVBQSxJQUFBLHFCQUFBLEVBQUE2RSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUE1QixLQUFBLEVBQUE7QUFDQUEsU0FBQWdELGNBQUE7QUFDQTdDLE1BQUE0QyxPQUFBLENBQUF2QyxJQUFBO0FBQ0EsR0FIQTtBQUlBLEVBUEE7O0FBU0EsUUFBQTtBQUNBQSxRQUFBLGdCQUFBO0FBQ0FMLE1BQUFRLElBQUEsQ0FBQXNCLElBQUE7QUFDQTlCLE1BQUFvQyxRQUFBLENBQUFILElBQUEsQ0FBQTNCLElBQUEsU0FBQSxDQUFBLEVBQUEsRUFBQSxRQUFBTixHQUFBNEMsT0FBQSxDQUFBMUMsS0FBQSxFQUFBO0FBQ0FJLE9BQUEsU0FBQSxFQUFBakMsUUFBQSxDQUFBLElBQUE7QUFDQSxHQUxBO0FBTUE2QixTQUFBLGlCQUFBO0FBQ0FJLE9BQUEsU0FBQSxFQUFBN0IsV0FBQSxDQUFBLElBQUE7QUFDQXVCLE1BQUFvQyxRQUFBLENBQUE1RCxJQUFBLENBQUE4QixJQUFBLFNBQUEsQ0FBQTtBQUNBTixNQUFBUSxJQUFBLENBQUF1QixNQUFBO0FBQ0E7QUFWQSxFQUFBO0FBWUEsQ0F0QkEsRUFBQTs7QUNKQTtBQUNBO0FBQ0EvQixHQUFBQyxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUE7QUFDQUksUUFBQSxjQUFBeUMsUUFBQSxFQUFBekUsUUFBQSxFQUFBO0FBQ0EyQixNQUFBb0MsUUFBQSxDQUFBSCxJQUFBLENBQUEzQixJQUFBLGFBQUEsQ0FBQSxFQUFBLEVBQUEsUUFBQU4sR0FBQUMsV0FBQSxDQUFBQyxLQUFBLEVBQUE7QUFDQUksT0FBQSxhQUFBLEVBQUFyRCxJQUFBLENBQUE2RixRQUFBLEVBQUF6RSxRQUFBLENBQUEsQ0FBQUEsV0FBQUEsV0FBQSxHQUFBLEdBQUEsRUFBQSxJQUFBLElBQUEsRUFBQXFDLE1BQUEsR0FBQXJDLFFBQUEsQ0FBQSxPQUFBOztBQUVBMkIsTUFBQTNDLElBQUEsQ0FBQSxhQUFBLEVBQUEsUUFBQSxJQUFBaUQsSUFBQSxhQUFBLEVBQUF0RCxJQUFBLENBQUEsU0FBQSxDQUFBO0FBQ0FzRCxPQUFBLGFBQUEsRUFBQXRELElBQUEsQ0FBQSxTQUFBLEVBQUEsTUFBQTs7QUFFQTRCLFVBQUEsY0FBQSxFQUFBVSxHQUFBLENBQUEsYUFBQTtBQUNBSCxXQUFBQyxTQUFBLENBQUEsRUFBQSxRQUFBLGFBQUEsRUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsR0FWQTtBQVdBYyxTQUFBLGlCQUFBO0FBQ0FJLE9BQUEsYUFBQSxFQUFBN0IsV0FBQSxDQUFBLE9BQUEsRUFBQTBELEdBQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBN0IsUUFBQSxhQUFBLEVBQUE3QixXQUFBLENBQUEsSUFBQSxFQUFBc0UsS0FBQSxHQUFBL0YsSUFBQSxDQUFBLE9BQUEsRUFBQSxrQ0FBQTtBQUNBLElBRkE7O0FBSUFzRCxPQUFBLGFBQUEsRUFBQXRELElBQUEsQ0FBQSxTQUFBLEVBQUFnRCxHQUFBM0MsSUFBQSxDQUFBLGFBQUEsRUFBQSxRQUFBLENBQUE7O0FBRUEyQyxNQUFBb0MsUUFBQSxDQUFBNUQsSUFBQSxDQUFBOEIsSUFBQSxhQUFBLENBQUE7O0FBRUExQixVQUFBLGNBQUEsRUFBQTFCLE1BQUEsQ0FBQSxhQUFBO0FBQ0E7QUFyQkEsRUFBQTtBQXVCQSxDQXhCQSxFQUFBOztBQTBCQU4sRUFBQSxZQUFBO0FBQ0EwRCxLQUFBLGFBQUEsSUFBQTFELEVBQUEsb0JBQUEsQ0FBQTtBQUNBLENBRkE7O0FDNUJBO0FBQ0E7QUFDQTs7QUFFQW9ELEdBQUFnRCxLQUFBLEdBQUEsWUFBQTtBQUNBMUMsS0FBQSxPQUFBLElBQUEsRUFBQTs7QUFFQTFELEdBQUEsWUFBQTtBQUNBMEQsTUFBQSxPQUFBLElBQUExRCxFQUFBLGNBQUEsQ0FBQTtBQUNBMEQsTUFBQSxPQUFBLEVBQUEsU0FBQSxJQUFBMUQsRUFBQSxnQkFBQSxFQUFBMEQsSUFBQSxPQUFBLENBQUEsQ0FBQTtBQUNBQSxNQUFBLE9BQUEsRUFBQSxPQUFBLElBQUExRCxFQUFBLGNBQUEsRUFBQTBELElBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxFQUpBOztBQU1BLFFBQUE7QUFDQTtBQUNBMkIsUUFBQSxjQUFBZ0IsTUFBQSxFQUFBO0FBQ0F4SCxPQUFBLGVBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFBLFFBQUF3SCxNQUFBLHlDQUFBQSxNQUFBLE9BQUEsUUFBQSxFQUFBO0FBQ0EzQyxRQUFBLE9BQUEsRUFBQTdCLFdBQUEsQ0FBQSxZQUFBOztBQUVBO0FBQ0E2QixRQUFBLE9BQUEsRUFBQSxTQUFBLEVBQUFyRCxJQUFBLENBQUFnRyxPQUFBLFNBQUEsS0FBQSxFQUFBOztBQUVBO0FBQ0E7QUFDQSxRQUFBQSxPQUFBLE9BQUEsS0FBQUEsT0FBQSxRQUFBLENBQUEsRUFBQTtBQUNBM0MsU0FBQSxPQUFBLEVBQUEsT0FBQSxFQUNBckQsSUFEQSxDQUNBZ0csT0FBQSxPQUFBLENBREEsRUFFQU4sR0FGQSxDQUVBLE9BRkEsRUFHQWxCLEVBSEEsQ0FHQSxPQUhBLEVBR0F3QixPQUFBLFFBQUEsQ0FIQSxFQUlBaEIsSUFKQTtBQUtBLEtBTkEsTUFNQTtBQUNBM0IsU0FBQSxPQUFBLEVBQUEsT0FBQSxFQUNBOUIsSUFEQTtBQUVBOztBQUVBOEIsUUFBQSxPQUFBLEVBQUFqQyxRQUFBLENBQUEsSUFBQSxFQUFBcUMsTUFBQSxHQUFBckMsUUFBQSxDQUFBLE9BQUE7QUFDQWlDLFFBQUEsTUFBQSxFQUFBakMsUUFBQSxDQUFBLGNBQUE7O0FBRUE7O0FBRUE7QUFDQWlDLFFBQUEsT0FBQSxFQUFBbUIsRUFBQSxDQUFBLE9BQUEsRUFBQXpCLEdBQUFnRCxLQUFBLENBQUFFLE9BQUE7QUFDQUMsaUJBQUE1SCxPQUFBLE9BQUEsQ0FBQTs7QUFFQTtBQUNBO0FBQ0EsUUFBQSxDQUFBMEgsT0FBQSxZQUFBLENBQUEsRUFBQTtBQUNBMUgsWUFBQSxPQUFBLElBQUEyRyxXQUFBbEMsR0FBQWdELEtBQUEsQ0FBQUUsT0FBQSxFQUFBRCxPQUFBLFNBQUEsSUFBQUEsT0FBQSxTQUFBLENBQUEsR0FBQSxJQUFBLENBQUE7QUFDQTs7QUFFQTtBQUNBLFFBQUFBLE9BQUEsWUFBQSxDQUFBLEVBQUE7QUFDQTNDLFNBQUEsT0FBQSxFQUFBakMsUUFBQSxDQUFBLFlBQUE7QUFDQTtBQUNBLElBdENBLE1Bc0NBO0FBQ0EyQixPQUFBZ0QsS0FBQSxDQUFBZixJQUFBLENBQUE7QUFDQSxnQkFBQWdCO0FBREEsS0FBQTtBQUdBO0FBQ0EsR0F2REE7O0FBeURBQyxXQUFBLG1CQUFBO0FBQ0F6SCxPQUFBLGtCQUFBO0FBQ0E2RSxPQUFBLE9BQUEsRUFBQTdCLFdBQUEsQ0FBQSxPQUFBLEVBQUEwRCxHQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQTdCLFFBQUEsTUFBQSxFQUFBN0IsV0FBQSxDQUFBLGNBQUE7QUFDQTZCLFFBQUEsT0FBQSxFQUFBN0IsV0FBQSxDQUFBLGVBQUE7O0FBRUE2QixRQUFBLE9BQUEsRUFBQSxTQUFBLEVBQUF5QyxLQUFBO0FBQ0F6QyxRQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUF5QyxLQUFBO0FBQ0EsSUFOQTtBQU9BSSxnQkFBQTVILE9BQUEsT0FBQSxDQUFBO0FBQ0EsR0FuRUE7O0FBcUVBO0FBQ0E4RSxRQUFBLGNBQUEzRSxPQUFBLEVBQUFRLE1BQUEsRUFBQWtILFFBQUEsRUFBQUMsVUFBQSxFQUFBO0FBQ0E7QUFDQS9DLE9BQUEsT0FBQSxFQUFBNUUsT0FBQSxDQUFBdUIsSUFBQSxDQUFBdkIsT0FBQTtBQUNBNEUsT0FBQSxPQUFBLEVBQUFuRSxLQUFBLENBQUFjLElBQUEsQ0FBQWYsU0FBQUEsTUFBQSxHQUFBLEVBQUE7QUFDQW9FLE9BQUEsT0FBQSxFQUFBakMsUUFBQSxDQUFBLElBQUEsRUFBQXFDLE1BQUEsR0FBQXJDLFFBQUEsQ0FBQSxPQUFBO0FBQ0FpQyxPQUFBLE1BQUEsRUFBQWpDLFFBQUEsQ0FBQSxjQUFBOztBQUVBOztBQUVBaUMsT0FBQSxPQUFBLEVBQUFtQixFQUFBLENBQUEsT0FBQSxFQUFBekIsR0FBQWdELEtBQUEsQ0FBQUUsT0FBQTtBQUNBNUMsT0FBQSxPQUFBLEVBQUFuRSxLQUFBLENBQUFzRixFQUFBLENBQUEsT0FBQSxFQUFBMkIsUUFBQTs7QUFFQUQsZ0JBQUE1SCxPQUFBLE9BQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUE4SCxVQUFBLEVBQUE7QUFDQS9DLFFBQUEsT0FBQSxFQUFBN0IsV0FBQSxDQUFBLFlBQUE7QUFDQWxELFdBQUEsWUFBQSxJQUFBMkcsV0FBQWxDLEdBQUFnRCxLQUFBLENBQUFFLE9BQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxJQUhBLE1BR0E7QUFDQTVDLFFBQUEsT0FBQSxFQUFBakMsUUFBQSxDQUFBLFlBQUE7QUFDQTtBQUNBO0FBMUZBLEVBQUE7QUE0RkEsQ0FyR0EsRUFBQTs7QUF1R0E7QUFDQTs7QUFFQTs7QUM5R0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBQWlGLFVBQUEsa0VBQUE7O0FBRUEsSUFBQUMsV0FBQSxTQUFBQSxRQUFBLENBQUFDLFFBQUEsRUFBQW5HLElBQUEsRUFBQTtBQUNBNUIsS0FBQSxrQkFBQStILFFBQUEsRUFBQSxNQUFBO0FBQ0EsS0FBQUMsVUFBQSxvQ0FBQUMsTUFBQTtBQUNBLEtBQUFKLFVBQUEsa0VBQUE7O0FBRUEsS0FBQUssVUFBQS9HLEVBQUFnSCxPQUFBLENBQUFILFVBQUFELFFBQUEsR0FBQSxPQUFBLEdBQUFGLE9BQUEsR0FBQSxhQUFBLEVBQUFqRyxJQUFBLENBQUE7QUFDQSxRQUFBc0csT0FBQTtBQUNBLENBUEE7O0FDUEE7QUFDQTtBQUNBOztBQUVBekksSUFBQUgsTUFBQSxHQUFBLFlBQUE7QUFDQTZCLEdBQUEsWUFBQTtBQUNBMEQsTUFBQSxRQUFBLElBQUExRCxFQUFBLG1CQUFBLENBQUE7QUFDQSxFQUZBOztBQUlBLFFBQUE7QUFDQWlILFNBQUEsaUJBQUE7QUFDQTtBQUNBLEdBSEE7O0FBS0FDLFVBQUEsa0JBQUE7QUFDQTtBQUNBeEQsT0FBQSxRQUFBLEVBQUF5QyxLQUFBOztBQUVBO0FBQ0E7QUFDQSxPQUFBZ0Isa0JBQUEsQ0FBQTtBQUNBLE9BQUFDLGtCQUFBLENBQUE7O0FBRUFuSixTQUFBRSxNQUFBLENBQUFrSixPQUFBLENBQUEsVUFBQUMsS0FBQSxFQUFBO0FBQ0EsUUFBQUMscUJBQUFELE1BQUEsUUFBQSxDQUFBOztBQUVBLFFBQUFDLHFCQUFBSixlQUFBLEVBQUE7QUFDQUEsdUJBQUFJLGtCQUFBO0FBQ0E7O0FBRUFILHVCQUFBRyxrQkFBQTtBQUNBLElBUkE7O0FBVUE7QUFDQTtBQUNBdEosU0FBQUUsTUFBQSxDQUFBa0osT0FBQSxDQUFBLFVBQUFDLEtBQUEsRUFBQTtBQUNBO0FBQ0E7QUFDQSxRQUFBRSxzQkFBQUosa0JBQUEsQ0FBQSxHQUFBRSxNQUFBLFFBQUEsSUFBQUgsZUFBQSxHQUFBLENBQUE7O0FBRUE7QUFDQUcsVUFBQSxpQkFBQSxJQUFBQSxNQUFBLE9BQUEsRUFBQUcsV0FBQSxFQUFBO0FBQ0FILFVBQUEsa0JBQUEsSUFBQSxhQUFBLENBQUFFLHNCQUFBLEdBQUEsRUFBQUUsT0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLElBQUE7QUFDQUosVUFBQSxxQkFBQSxJQUFBQSxNQUFBLFFBQUEsRUFBQUssUUFBQSxHQUFBN0UsT0FBQSxDQUFBLHVCQUFBLEVBQUEsR0FBQSxDQUFBOztBQUVBLFFBQUE4RSxTQUFBckgsU0FBQSxjQUFBLEVBQUErRyxLQUFBLENBQUE7QUFDQTVELFFBQUEsUUFBQSxFQUFBbUUsTUFBQSxDQUFBRCxNQUFBO0FBQ0EsSUFaQTs7QUFjQSxPQUFBUixvQkFBQSxDQUFBLEVBQUE7QUFDQTFELFFBQUEsUUFBQSxFQUFBakMsUUFBQSxDQUFBLGVBQUE7QUFDQSxJQUZBLE1BRUE7QUFDQWlDLFFBQUEsUUFBQSxFQUFBN0IsV0FBQSxDQUFBLGVBQUE7QUFDQTtBQUNBO0FBN0NBLEVBQUE7QUErQ0EsQ0FwREEsRUFBQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBdkQsSUFBQXdKLFFBQUEsR0FBQSxZQUFBO0FBQ0EsS0FBQUMsc0JBQUE7O0FBRUEvSCxHQUFBLFlBQUE7QUFDQTBELE1BQUEsVUFBQSxJQUFBMUQsRUFBQSxlQUFBLENBQUE7QUFDQSxFQUZBOztBQUlBLFFBQUE7QUFDQTtBQUNBO0FBQ0FpSCxTQUFBLGlCQUFBO0FBQ0FwSSxPQUFBLG9CQUFBLEVBQUEsTUFBQTs7QUFFQTtBQUNBLE9BQUFtSixjQUFBL0osTUFBQUMsTUFBQSxDQUFBLFFBQUEsSUFBQWUsT0FBQWhCLE1BQUFDLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtBQUNBLE9BQUErSixZQUFBaEssTUFBQUMsTUFBQSxDQUFBLEtBQUEsSUFBQWUsT0FBQWhCLE1BQUFDLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTs7QUFFQTtBQUNBNkosbUJBQUFFLFVBQUFDLElBQUEsQ0FBQUYsV0FBQSxFQUFBLFNBQUEsQ0FBQTs7QUFFQTtBQUNBLFFBQUEsSUFBQUcsTUFBQUgsWUFBQXJILEtBQUEsRUFBQSxFQUFBd0gsSUFBQUMsUUFBQSxDQUFBSCxTQUFBLENBQUEsRUFBQUUsSUFBQXpGLEdBQUEsQ0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0EsUUFBQTJGLGdCQUFBRixHQUFBO0FBQ0EsUUFBQUcsZUFBQUgsSUFBQXhILEtBQUEsR0FBQTRILEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBRCxhQUFBRSxPQUFBLENBQUFQLFNBQUEsQ0FBQSxFQUFBO0FBQ0FLLG9CQUFBTCxTQUFBO0FBQ0E7O0FBRUE7QUFDQSxRQUFBUSxpQkFBQUgsYUFBQUosSUFBQSxDQUFBRyxhQUFBLEVBQUEsU0FBQSxDQUFBOztBQUVBO0FBQ0EsUUFBQUssb0JBQUFELGlCQUFBVixhQUFBOztBQUVBO0FBQ0E7QUFDQSxRQUFBWSxpQkFBQSxDQUFBRCxvQkFBQSxHQUFBLEVBQUFoQixPQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQWtCLE9BQUFySSxTQUFBLGNBQUEsRUFBQTtBQUNBNEgsVUFBQUEsSUFBQWpKLE1BQUEsQ0FBQSxLQUFBO0FBREEsS0FBQSxFQUVBd0YsR0FGQSxDQUVBLE9BRkEsRUFFQWlFLGlCQUFBLEdBRkEsQ0FBQTs7QUFJQTNJLE1BQUEsYUFBQSxFQUFBMEQsSUFBQSxVQUFBLENBQUEsRUFBQW1FLE1BQUEsQ0FBQWUsSUFBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQXRELGNBQUFoSCxJQUFBd0osUUFBQSxDQUFBWixNQUFBLEVBQUEsSUFBQTs7QUFFQTtBQUNBdkksVUFBQSxVQUFBLElBQUFrSyxZQUFBdkssSUFBQXdKLFFBQUEsQ0FBQVosTUFBQSxFQUFBLEtBQUEsSUFBQSxDQUFBO0FBQ0EsR0E3Q0E7O0FBK0NBO0FBQ0E7QUFDQUEsVUFBQSxrQkFBQTtBQUNBckksT0FBQSxxQkFBQSxFQUFBLE1BQUE7O0FBRUE7QUFDQSxPQUFBaUssUUFBQTdKLFFBQUE7QUFDQSxPQUFBK0ksY0FBQS9JLE9BQUFoQixNQUFBQyxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSxPQUFBK0osWUFBQWhKLE9BQUFoQixNQUFBQyxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7O0FBRUEsT0FBQTZLLHFCQUFBRCxNQUFBWixJQUFBLENBQUFGLFdBQUEsRUFBQSxTQUFBLENBQUE7QUFDQSxPQUFBZ0IsMEJBQUFELHFCQUFBaEIsYUFBQSxHQUFBZ0IscUJBQUFoQixhQUFBLEdBQUEsQ0FBQTs7QUFFQTtBQUNBO0FBQ0EvSCxLQUFBLG9CQUFBLEVBQUEwRCxJQUFBLFVBQUEsQ0FBQSxFQUFBZ0IsR0FBQSxDQUFBLE9BQUEsRUFBQXRCLEdBQUEzQyxJQUFBLENBQUEsUUFBQSxFQUFBLE9BQUEsQ0FBQTs7QUFFQSxPQUFBd0ksbUJBQUEsQ0FBQUQsMEJBQUEsR0FBQSxFQUFBdEIsT0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBMUgsS0FBQSxlQUFBLEVBQUEwRCxJQUFBLFVBQUEsQ0FBQSxFQUFBZ0IsR0FBQSxDQUFBLE9BQUEsRUFBQXVFLG1CQUFBLEdBQUE7QUFDQTtBQWxFQSxFQUFBO0FBb0VBLENBM0VBLEVBQUE7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBM0ssSUFBQUwsS0FBQSxHQUFBLFlBQUE7QUFDQStCLEdBQUEsWUFBQTtBQUNBekIsT0FBQSxPQUFBLElBQUF5QixFQUFBLFlBQUEsQ0FBQTs7QUFFQXpCLE9BQUEsT0FBQSxFQUFBMkssT0FBQSxDQUFBO0FBQ0EsbUJBQUEsY0FEQTtBQUVBLHlCQUFBLEtBRkE7QUFHQSxrQkFBQTtBQUNBLFlBQUEsY0FBQUMsT0FBQSxFQUFBO0FBQ0EsWUFBQW5KLEVBQUFtSixPQUFBLEVBQUExSSxJQUFBLENBQUEsZUFBQSxDQUFBO0FBQ0EsS0FIQTtBQUlBLGNBQUEsZ0JBQUEwSSxPQUFBLEVBQUE7QUFDQSxZQUFBQyxTQUFBcEosRUFBQW1KLE9BQUEsRUFBQTFJLElBQUEsQ0FBQSxRQUFBLENBQUEsRUFBQSxFQUFBLENBQUE7QUFDQTtBQU5BLElBSEE7QUFXQSxvQkFBQTtBQUNBLFlBQUEsS0FEQTtBQUVBLGNBQUE7QUFGQSxJQVhBO0FBZUEsYUFBQSxDQUFBLE1BQUEsRUFBQSxRQUFBLENBZkE7QUFnQkEsY0FBQTtBQUNBLGNBQUEyQyxHQUFBM0MsSUFBQSxDQUFBLFNBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBO0FBREE7QUFoQkEsR0FBQTs7QUFxQkFsQyxPQUFBLE9BQUEsRUFBQXNHLEVBQUEsQ0FBQSxPQUFBLEVBQUEsNkJBQUEsRUFBQSxVQUFBNUIsS0FBQSxFQUFBO0FBQ0EsT0FBQUEsTUFBQW9HLEtBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQXBHLFVBQUFnRCxjQUFBOztBQUVBLFFBQUFxRCxRQUFBdEosRUFBQSxJQUFBLENBQUE7QUFDQSxRQUFBdUosU0FBQUQsTUFBQTdJLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQW5DLFFBQUFrRixNQUFBLENBQUFDLElBQUEsQ0FBQThGLE1BQUEsRUFBQUQsS0FBQSxFQUFBLElBQUE7QUFDQTtBQUNBLEdBUkE7QUFTQSxFQWpDQTs7QUFtQ0EsUUFBQTtBQUNBO0FBQ0E7QUFDQXJDLFNBQUEsaUJBQUE7QUFDQXBJLE9BQUEsaUJBQUEsRUFBQSxNQUFBOztBQUVBO0FBQ0E7QUFDQVAsT0FBQUwsS0FBQSxDQUFBdUwsT0FBQTtBQUNBbEwsT0FBQUwsS0FBQSxDQUFBd0wsTUFBQTtBQUNBbkwsT0FBQUwsS0FBQSxDQUFBeUwsUUFBQTs7QUFFQTtBQUNBdEcsTUFBQWdDLE9BQUEsQ0FBQXhELElBQUE7QUFDQSxHQWRBOztBQWdCQTtBQUNBO0FBQ0E2SCxVQUFBLGtCQUFBO0FBQ0E7QUFDQSxPQUFBeEssU0FBQXVKLE9BQUEsQ0FBQXZLLE1BQUFDLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0F3RixRQUFBLE1BQUEsRUFBQWpDLFFBQUEsQ0FBQSxzQkFBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxPQUFBeEQsTUFBQUMsTUFBQSxDQUFBLFdBQUEsTUFBQSxJQUFBLEVBQUE7QUFDQXdGLFFBQUEsTUFBQSxFQUFBakMsUUFBQSxDQUFBLGtCQUFBO0FBQ0FrSSxrQkFBQWhMLE9BQUEsV0FBQSxDQUFBO0FBQ0E7QUFDQSxHQTlCQTs7QUFnQ0E7QUFDQTtBQUNBK0ssWUFBQSxvQkFBQTtBQUNBO0FBQ0EsT0FBQXpMLE1BQUFDLE1BQUEsQ0FBQSxVQUFBLEVBQUEsUUFBQSxDQUFBLEVBQUE7QUFDQSxRQUFBMEwsYUFBQTNMLE1BQUFDLE1BQUEsQ0FBQSxVQUFBLEVBQUEsUUFBQSxDQUFBO0FBQ0F3RixRQUFBLE9BQUEsRUFBQXJELElBQUEsQ0FBQXVKLFVBQUE7QUFDQTs7QUFFQTtBQUNBLE9BQUEzTCxNQUFBQyxNQUFBLENBQUEsVUFBQSxFQUFBLFFBQUEsQ0FBQSxFQUFBO0FBQ0EsUUFBQTJMLGtCQUFBNUwsTUFBQUMsTUFBQSxDQUFBLFVBQUEsRUFBQSxRQUFBLENBQUE7QUFDQThCLE1BQUEsb0JBQUEsRUFBQUssSUFBQSxDQUFBd0osZUFBQTtBQUNBO0FBQ0EsR0E5Q0E7O0FBZ0RBO0FBQ0E7QUFDQUwsV0FBQSxtQkFBQTtBQUNBO0FBQ0E7QUFDQWpMLFFBQUEsT0FBQSxFQUFBNEgsS0FBQTs7QUFFQTtBQUxBO0FBQUE7QUFBQTs7QUFBQTtBQU1BLHlCQUFBbEksTUFBQUcsT0FBQSw4SEFBQTtBQUFBLFNBQUEwTCxNQUFBOztBQUNBO0FBQ0F0TCxXQUFBLFNBQUEsRUFBQXNMLE9BQUEsUUFBQSxDQUFBLElBQUFBLE1BQUE7O0FBRUE7QUFDQUEsWUFBQSxLQUFBLElBQUE5SCxPQUFBLFlBQUEsRUFBQSxjQUFBOEgsT0FBQSxRQUFBLENBQUEsQ0FBQTs7QUFFQTtBQUNBLFNBQUFBLE9BQUEsUUFBQSxDQUFBLEVBQUE7QUFDQUEsYUFBQSxZQUFBLElBQUFBLE9BQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQTtBQUNBQSxhQUFBLGdCQUFBLElBQUEsa0JBQUEsQ0FBQUEsT0FBQSxRQUFBLEVBQUEsU0FBQSxJQUFBLEdBQUEsRUFBQXBDLE9BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBO0FBQ0E7O0FBRUEsU0FBQXFDLFVBQUF4SixTQUFBLGFBQUEsRUFBQXVKLE1BQUEsRUFBQXJKLElBQUEsQ0FBQTtBQUNBLGdCQUFBcUosT0FBQSxRQUFBLENBREE7QUFFQSx1QkFBQUEsT0FBQSxpQkFBQSxJQUFBN0ssT0FBQTZLLE9BQUEsaUJBQUEsQ0FBQSxFQUFBNUssTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBO0FBRkEsTUFBQSxDQUFBOztBQUtBO0FBQ0E7QUFDQSxTQUFBOEssUUFBQWhLLEVBQUEsd0JBQUEsRUFBQStKLE9BQUEsQ0FBQTs7QUFFQSxTQUFBRCxPQUFBLHFCQUFBLEtBQUFBLE9BQUEsT0FBQSxDQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0EsVUFBQUcsb0JBQUEsQ0FBQTtBQUNBLFVBQUFDLG9CQUFBLENBQUE7O0FBRUEsVUFBQUMsZ0NBQUEsQ0FBQSxRQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQUMsK0JBQUEsQ0FBQSxPQUFBLENBQUE7O0FBRUEsV0FBQSxJQUFBbEosSUFBQSxDQUFBLEVBQUFBLElBQUErSSxpQkFBQSxFQUFBL0ksR0FBQSxFQUFBO0FBQ0EsV0FBQTRJLE9BQUEsT0FBQSxFQUFBNUksQ0FBQSxDQUFBLEVBQUE7QUFDQSxZQUFBbUosT0FBQVAsT0FBQSxPQUFBLEVBQUE1SSxDQUFBLENBQUE7O0FBRUEsWUFBQW1KLEtBQUEsT0FBQSxLQUFBQSxLQUFBLE1BQUEsS0FBQSxPQUFBLEVBQUE7QUFDQUg7O0FBRUEsYUFBQUksU0FBQTtBQUNBLGFBQUFDLFFBQUEsRUFBQTs7QUFFQTtBQUNBLGFBQUFKLDhCQUFBaEgsT0FBQSxDQUFBa0gsS0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBQyxzQkFBQSxZQUFBOztBQUVBQyxnQkFBQSxPQUFBLElBQUFMLGlCQUFBOztBQUVBLGNBQUFHLEtBQUEsTUFBQSxLQUFBLFNBQUEsSUFBQUEsS0FBQSxNQUFBLEtBQUEsT0FBQSxJQUFBQSxLQUFBLE1BQUEsS0FBQSxNQUFBLElBQUFBLEtBQUEsTUFBQSxLQUFBLEtBQUEsRUFBQTtBQUNBRSxpQkFBQSxTQUFBLElBQUEsNEJBQUFGLEtBQUEsT0FBQSxFQUFBLENBQUEsRUFBQSxXQUFBLENBQUEsR0FBQSxLQUFBO0FBQ0FFLGlCQUFBLFVBQUEsSUFBQSxPQUFBO0FBQ0EsV0FIQSxNQUdBLElBQUFGLEtBQUEsT0FBQSxLQUFBQSxLQUFBLE9BQUEsRUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBRSxpQkFBQSxTQUFBLElBQUEsNEJBQUFGLEtBQUEsT0FBQSxFQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FDQUEsS0FBQSxPQUFBLEVBQUEsQ0FBQSxFQUFBLFVBQUEsRUFBQSxDQUFBLENBREEsR0FDQSxLQURBO0FBRUE7QUFDQSxVQVpBOztBQWNBO0FBQ0EsY0FBQUQsNkJBQUFqSCxPQUFBLENBQUFrSCxLQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0FDLHVCQUFBLFdBQUE7QUFDQUMsbUJBQUE7QUFDQSx1QkFBQUYsS0FBQSxTQUFBLEVBQUFHLFNBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQURBO0FBRUEscUJBQUFOO0FBRkEsWUFBQTtBQUlBOztBQUVBLGFBQUFBLHNCQUFBRCxpQkFBQSxJQUFBSCxPQUFBLHFCQUFBLElBQUFJLGlCQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0FLLGdCQUFBLFVBQUEsSUFBQSxNQUFBO0FBQ0FBLGdCQUFBLE1BQUEsSUFBQSxlQUFBVCxPQUFBLHFCQUFBLElBQUFJLGlCQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7O0FBRUEsYUFBQU8sUUFBQWxLLFNBQUErSixTQUFBLEVBQUFDLEtBQUEsRUFBQTVGLFFBQUEsQ0FBQXFGLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLE1BckRBLE1BcURBO0FBQ0E7QUFDQWhLLFFBQUEsa0JBQUEsRUFBQStKLE9BQUEsRUFBQXpKLE1BQUE7QUFDQTs7QUFFQTtBQUNBLFNBQUF3SixPQUFBLFNBQUEsQ0FBQSxFQUFBO0FBQ0FDLGNBQUF0SSxRQUFBLENBQUEsVUFBQTtBQUNBekIsUUFBQSxHQUFBLEVBQUErSixPQUFBLEVBQUFqSSxVQUFBLENBQUEsTUFBQTtBQUNBOUIsUUFBQSxlQUFBLEVBQUErSixPQUFBLEVBQUF6SixNQUFBO0FBQ0E7O0FBRUEvQixVQUFBLE9BQUEsRUFBQXNKLE1BQUEsQ0FBQWtDLE9BQUEsRUFBQWIsT0FBQSxDQUFBLFVBQUEsRUFBQWEsT0FBQTtBQUNBO0FBOUZBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBZ0dBekwsT0FBQUwsS0FBQSxDQUFBeU0sTUFBQTtBQUNBcE0sT0FBQUwsS0FBQSxDQUFBME0sSUFBQSxDQUFBMU0sTUFBQUMsTUFBQSxDQUFBLFdBQUEsSUFBQSxRQUFBLEdBQUEsTUFBQTtBQUNBLEdBcEpBOztBQXNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0F3TSxVQUFBLGtCQUFBO0FBQ0FuTSxRQUFBLE9BQUEsRUFBQTJLLE9BQUEsQ0FBQSxhQUFBO0FBQ0EzSyxRQUFBLE9BQUEsRUFBQTJLLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsR0FwU0E7O0FBc1NBO0FBQ0E7QUFDQXlCLFFBQUEsY0FBQUMsUUFBQSxFQUFBO0FBQ0FyTSxRQUFBLE9BQUEsRUFBQTJLLE9BQUEsQ0FBQTtBQUNBLGNBQUEwQjtBQURBLElBQUE7QUFHQTtBQTVTQSxFQUFBO0FBOFNBLENBbFZBLEVBQUE7O0FBb1ZBO0FBQ0EsSUFBQUMsT0FBQTs7QUFFQTdLLEVBQUEsWUFBQTtBQUNBNkssV0FBQTdLLEVBQUEsZUFBQSxDQUFBO0FBQ0E7O0FBRUE2SyxTQUFBM0IsT0FBQSxDQUFBO0FBQ0Esa0JBQUEsY0FEQTtBQUVBLHdCQUFBLEtBRkE7QUFHQSxpQkFBQTtBQUNBLFdBQUEsZ0JBREE7QUFFQSxhQUFBLGdCQUFBQyxPQUFBLEVBQUE7QUFDQSxXQUFBQyxTQUFBcEosRUFBQW1KLE9BQUEsRUFBQTFJLElBQUEsQ0FBQSxRQUFBLENBQUEsRUFBQSxFQUFBLENBQUE7QUFDQTtBQUpBLEdBSEE7QUFTQSxtQkFBQTtBQUNBLFdBQUEsS0FEQTtBQUVBLGFBQUE7QUFGQSxHQVRBO0FBYUEsWUFBQSxDQUFBLE1BQUEsRUFBQSxRQUFBLENBYkE7QUFjQSxhQUFBO0FBQ0EsYUFBQTJDLEdBQUEzQyxJQUFBLENBQUEsU0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEdBQUE7QUFEQTtBQWRBLEVBQUE7O0FBbUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQWlELEtBQUEsU0FBQSxFQUFBbUIsRUFBQSxDQUFBLE9BQUEsRUFBQSxrQkFBQSxFQUFBLFVBQUE1QixLQUFBLEVBQUE7QUFDQUEsUUFBQWdELGNBQUE7O0FBRUEsTUFBQTJFLFdBQUE1SyxFQUFBLElBQUEsRUFBQVMsSUFBQSxDQUFBLFNBQUEsQ0FBQTtBQUNBLE1BQUE2QixRQUFBdEMsRUFBQSxJQUFBLEVBQUE4SyxJQUFBLENBQUEsTUFBQSxFQUFBakgsSUFBQSxFQUFBO0FBQ0E3RCxJQUFBLGtCQUFBLEVBQUEwRCxJQUFBLFNBQUEsQ0FBQSxFQUFBN0IsV0FBQSxDQUFBLFFBQUE7QUFDQTdCLElBQUEsSUFBQSxFQUFBeUIsUUFBQSxDQUFBLFFBQUE7O0FBRUFuRCxNQUFBTCxLQUFBLENBQUEwTSxJQUFBLENBQUFDLFFBQUE7QUFDQXhILEtBQUE0QyxPQUFBLENBQUExQyxLQUFBO0FBQ0FsRSxZQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUFrRCxLQUFBO0FBQ0EsRUFYQTtBQVlBLENBL0NBOztBQzlWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUFoRSxJQUFBa0YsTUFBQSxHQUFBLFlBQUE7QUFDQXhELEdBQUEsWUFBQTtBQUNBekIsT0FBQSxRQUFBLElBQUF5QixFQUFBLGFBQUEsQ0FBQTs7QUFFQTtBQUNBekIsT0FBQSxRQUFBLEVBQUFzRyxFQUFBLENBQUEsT0FBQSxFQUFBLGtCQUFBLEVBQUEsVUFBQTVCLEtBQUEsRUFBQTtBQUNBQSxTQUFBZ0QsY0FBQTtBQUNBM0gsT0FBQWtGLE1BQUEsQ0FBQUYsS0FBQSxDQUFBLElBQUE7QUFDQSxHQUhBOztBQUtBO0FBTEEsR0FNQXVCLEVBTkEsQ0FNQSxPQU5BLEVBTUEsc0JBTkEsRUFNQSxZQUFBO0FBQ0F6QixNQUFBQyxXQUFBLENBQUFJLElBQUEsQ0FBQXpELEVBQUEsaUJBQUEsRUFBQXpCLEtBQUEsUUFBQSxDQUFBLEVBQUFvQyxLQUFBLEdBQUEwRSxJQUFBLEVBQUE7QUFDQSxHQVJBOztBQVVBO0FBVkEsR0FXQVIsRUFYQSxDQVdBLE9BWEEsRUFXQSxnQkFYQSxFQVdBLFVBQUE1QixLQUFBLEVBQUE7QUFDQSxPQUFBQSxNQUFBb0csS0FBQSxLQUFBLENBQUEsRUFBQTtBQUNBcEcsVUFBQWdELGNBQUE7QUFDQTtBQUNBLEdBZkE7QUFnQkEsRUFwQkE7O0FBc0JBLEtBQUE4RSxtQkFBQSxFQUFBOztBQUVBLFVBQUFDLFdBQUEsQ0FBQUMsS0FBQSxFQUFBQyxNQUFBLEVBQUE7QUFDQUgsbUJBQUEsT0FBQSxJQUFBLENBQUE7QUFDQSxPQUFBLElBQUF6RCxLQUFBLElBQUFySixNQUFBQyxNQUFBLENBQUEsUUFBQSxDQUFBLEVBQUE7QUFDQTZNLG9CQUFBOU0sTUFBQUMsTUFBQSxDQUFBLFFBQUEsRUFBQW9KLEtBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQTs7QUFFQXRILElBQUFDLElBQUEsQ0FBQWdMLEtBQUEsRUFBQSxVQUFBRSxLQUFBLEVBQUFkLElBQUEsRUFBQTtBQUNBQSxRQUFBLGtCQUFBLElBQUFBLEtBQUEsT0FBQSxJQUFBLG1CQUFBO0FBQ0FBLFFBQUEsNEJBQUEsSUFBQXBMLE9BQUFvTCxLQUFBLGtCQUFBLENBQUEsRUFBQWUsUUFBQSxFQUFBO0FBQ0FmLFFBQUEsaUJBQUEsSUFBQUEsS0FBQSxPQUFBLEVBQUE1QyxXQUFBLEVBQUE7O0FBRUE7QUFDQSxPQUFBNEMsS0FBQSxTQUFBLEtBQUFBLEtBQUEsU0FBQSxFQUFBRyxTQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxLQUFBLEVBQUE7QUFDQUgsU0FBQSxTQUFBLElBQUEsUUFBQUEsS0FBQSxTQUFBLEVBQUF2SCxPQUFBLENBQUEseUJBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxNQUFBO0FBQ0E7O0FBRUE7QUFDQSxPQUFBdUgsS0FBQSxXQUFBLENBQUEsRUFBQTtBQUNBQSxTQUFBLG9CQUFBLElBQUFBLEtBQUEsV0FBQSxFQUFBLFVBQUEsQ0FBQTs7QUFFQSxRQUFBQSxLQUFBLFdBQUEsRUFBQSxRQUFBLE1BQUEsR0FBQSxFQUFBO0FBQ0FBLFVBQUEsY0FBQSxJQUFBQSxLQUFBLE9BQUEsQ0FBQTtBQUNBQSxVQUFBLGFBQUEsSUFBQSwwQ0FBQSxDQUZBLENBRUE7QUFDQUEsVUFBQSxrQkFBQSxJQUFBQSxLQUFBLFdBQUEsRUFBQSxRQUFBLElBQUEsUUFBQSxJQUFBQSxLQUFBLFdBQUEsRUFBQSxRQUFBLElBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxFQUFBLENBQUE7QUFDQUEsVUFBQSxpQkFBQSxJQUFBLFlBQUE7QUFDQSxLQUxBLE1BS0E7QUFDQUEsVUFBQSxjQUFBLElBQUEsVUFBQTtBQUNBQSxVQUFBLGFBQUEsSUFBQSwwQ0FBQTtBQUNBQSxVQUFBLGtCQUFBLElBQUEsV0FBQTtBQUNBOztBQUVBO0FBQ0FVLHFCQUFBLE9BQUEsS0FBQVYsS0FBQSxXQUFBLEVBQUEsUUFBQSxDQUFBO0FBQ0FVLHFCQUFBVixLQUFBLE9BQUEsQ0FBQSxLQUFBQSxLQUFBLFdBQUEsRUFBQSxRQUFBLENBQUE7QUFDQSxJQWpCQSxNQWlCQTtBQUNBQSxTQUFBLGFBQUEsSUFBQSwwQ0FBQSxDQURBLENBQ0E7QUFDQUEsU0FBQSxrQkFBQSxJQUFBLHNCQUFBO0FBQ0E7O0FBRUE7QUFDQSxPQUFBZ0IsZ0JBQUE5SyxTQUFBLGNBQUEsRUFBQThKLElBQUEsQ0FBQTtBQUNBLE9BQUFpQixTQUFBdEwsRUFBQSxxQkFBQSxFQUFBcUwsYUFBQSxDQUFBOztBQUVBO0FBQ0EsT0FBQWhCLEtBQUEsT0FBQSxDQUFBLEVBQUE7QUFDQXJLLE1BQUFDLElBQUEsQ0FBQW9LLEtBQUEsT0FBQSxDQUFBLEVBQUEsVUFBQWMsS0FBQSxFQUFBWixLQUFBLEVBQUE7QUFDQTtBQUNBLFNBQUFGLEtBQUEsTUFBQSxLQUFBLFFBQUEsRUFBQTtBQUNBRSxZQUFBLFNBQUEsSUFBQUEsTUFBQSxTQUFBLElBQUFBLE1BQUEsVUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBQSxZQUFBLGlCQUFBLElBQUEsa0JBQUEsQ0FBQUEsTUFBQSxTQUFBLElBQUEsR0FBQSxFQUFBN0MsT0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUE7QUFDQTZDLFlBQUEsZUFBQSxJQUFBQSxNQUFBLFNBQUEsSUFBQUEsTUFBQSxVQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQWdCLFNBQUFoTCxTQUFBLGFBQUEsRUFBQWdLLEtBQUEsQ0FBQTtBQUNBZSxhQUFBekQsTUFBQSxDQUFBMEQsTUFBQTtBQUNBLE1BTkE7O0FBUUE7QUFDQSxVQUFBbEIsS0FBQSxNQUFBLEtBQUEsU0FBQSxJQUFBQSxLQUFBLE1BQUEsS0FBQSxPQUFBLElBQUFBLEtBQUEsTUFBQSxLQUFBLE1BQUEsRUFBQTtBQUNBLFdBQUFBLEtBQUEsTUFBQSxLQUFBLFNBQUEsRUFBQTtBQUNBRSxjQUFBLE9BQUEsSUFBQSxtQ0FBQUEsTUFBQSxZQUFBLENBQUEsR0FBQSx1QkFBQTtBQUNBLFFBRkEsTUFJQSxJQUFBRixLQUFBLE1BQUEsS0FBQSxPQUFBLEVBQUE7QUFDQUUsY0FBQSxPQUFBLElBQUEsb0NBQUFBLE1BQUEsVUFBQSxDQUFBLEdBQUEsOEJBQUE7QUFDQSxRQUZBLE1BSUEsSUFBQUYsS0FBQSxNQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0FFLGNBQUEsT0FBQSxJQUFBLHVCQUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLGVBQUE7QUFDQTs7QUFFQUEsYUFBQSxpQkFBQSxJQUFBLGtCQUFBLENBQUFBLE1BQUEsU0FBQSxJQUFBLEdBQUEsRUFBQTdDLE9BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBO0FBQ0EsV0FBQThELFNBQUFqTCxTQUFBLGFBQUEsRUFBQWdLLEtBQUEsQ0FBQTtBQUNBZSxjQUFBekQsTUFBQSxDQUFBMkQsTUFBQTtBQUNBO0FBQ0EsS0E1QkE7QUE2QkE7O0FBRUE7QUFDQSxPQUFBLENBQUFuQixLQUFBLFNBQUEsQ0FBQSxFQUFBO0FBQ0FnQixrQkFBQTVKLFFBQUEsQ0FBQSxZQUFBO0FBQ0E7O0FBRUEsT0FBQSxDQUFBNEksS0FBQSxPQUFBLENBQUEsRUFBQTtBQUNBZ0Isa0JBQUE1SixRQUFBLENBQUEsVUFBQTtBQUNBOztBQUVBO0FBQ0EsT0FBQSxDQUFBNEksS0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBQSxLQUFBLFVBQUEsQ0FBQSxFQUFBO0FBQ0FySyxNQUFBLGtCQUFBLEVBQUFxTCxhQUFBLEVBQUEvSyxNQUFBO0FBQ0E7O0FBR0E7QUFDQTtBQUNBNEssVUFBQXJELE1BQUEsQ0FBQXdELGFBQUE7QUFDQSxHQXhGQTtBQXlGQTs7QUFFQSxRQUFBO0FBQ0E1SyxRQUFBLEVBREE7O0FBR0E7QUFDQTtBQUNBO0FBQ0FnRCxRQUFBLGNBQUE4RixNQUFBLEVBQUFELEtBQUEsRUFBQTlHLFNBQUEsRUFBQTtBQUNBOztBQUVBLE9BQUFzSCxTQUFBdEwsTUFBQSxTQUFBLEVBQUErSyxNQUFBLENBQUE7QUFDQTlKLG1CQUFBOEosTUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQWhMLFFBQUEsUUFBQSxFQUFBa0QsUUFBQSxDQUFBLElBQUE7QUFDQW5ELE9BQUFrRixNQUFBLENBQUFpSSxNQUFBLENBQUEzQixNQUFBOztBQUVBdkwsUUFBQSxRQUFBLEVBQUF1RixNQUFBLEdBQUFyQyxRQUFBLENBQUEsU0FBQSxFQUFBOEQsR0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0E7QUFDQTtBQUNBLElBSEE7O0FBS0FuQyxNQUFBUSxJQUFBLENBQUFzQixJQUFBO0FBQ0F4QixPQUFBLE1BQUEsRUFBQWpDLFFBQUEsQ0FBQSxlQUFBOztBQUVBO0FBQ0FPLFVBQUEsY0FBQSxFQUFBYyxPQUFBLENBQUEsUUFBQTtBQUNBLE9BQUFOLFNBQUEsRUFBQTtBQUNBUixXQUFBMEosRUFBQSxDQUFBLGNBQUE1QixPQUFBLFFBQUEsQ0FBQSxFQUFBO0FBQ0EsYUFBQSxRQURBO0FBRUEsV0FBQUEsT0FBQSxRQUFBO0FBRkEsS0FBQSxFQUdBQSxPQUFBLFFBQUEsQ0FIQTtBQUlBOztBQUVBO0FBQ0ExSyxhQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUFtSyxNQUFBO0FBQ0EsR0F2Q0E7O0FBeUNBO0FBQ0E7QUFDQTtBQUNBa0MsVUFBQSxnQkFBQTNCLE1BQUEsRUFBQTtBQUNBLE9BQUFDLFVBQUF4SixTQUFBLGFBQUEsRUFBQXVKLE1BQUEsQ0FBQTs7QUFFQTtBQUNBO0FBQ0EsT0FBQUEsT0FBQSxRQUFBLENBQUEsRUFBQTtBQUNBQSxXQUFBLFFBQUEsRUFBQSxTQUFBLElBQUEsa0JBQUEsQ0FBQUEsT0FBQSxRQUFBLEVBQUEsU0FBQSxJQUFBLEdBQUEsRUFBQXBDLE9BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBO0FBQ0E7O0FBRUEsT0FBQWlFLGVBQUFwTCxTQUFBLGFBQUEsRUFBQXVKLE1BQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUFBLE9BQUEsUUFBQSxDQUFBLEVBQUE7QUFDQTlKLE1BQUEsUUFBQSxFQUFBMkwsWUFBQSxFQUFBckwsTUFBQTtBQUNBO0FBQ0FOLEtBQUEsT0FBQSxFQUFBMkwsWUFBQSxFQUFBckwsTUFBQTtBQUNBTixLQUFBLEdBQUEsRUFBQTJMLFlBQUEsRUFBQTdKLFVBQUEsQ0FBQSxNQUFBOztBQUVBOUIsS0FBQSw0QkFBQSxFQUFBK0osT0FBQSxFQUFBbEMsTUFBQSxDQUFBOEQsWUFBQTs7QUFFQTtBQUNBO0FBQ0EsT0FBQVQsU0FBQWxMLEVBQUEsc0JBQUEsRUFBQStKLE9BQUEsQ0FBQTs7QUFFQSxPQUFBRCxPQUFBLE9BQUEsRUFBQTNJLE1BQUEsRUFBQTtBQUNBNkosZ0JBQUFsQixPQUFBLE9BQUEsQ0FBQSxFQUFBb0IsTUFBQTs7QUFFQUEsV0FBQWhDLE9BQUEsQ0FBQTtBQUNBLHFCQUFBLGVBREE7QUFFQSwyQkFBQSxDQUZBO0FBR0EsZ0JBQUE7QUFDQSxvQkFBQSxJQURBO0FBRUEsZ0JBQUE5RixHQUFBM0MsSUFBQSxDQUFBLFNBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBO0FBRkE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXRCQSxLQUFBOztBQXlCQTZFLGVBQUEsWUFBQTtBQUNBNEYsWUFBQWhDLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsS0FGQSxFQUVBLENBRkE7QUFJQSxJQWhDQSxNQWdDQTtBQUNBbEosTUFBQSxRQUFBLEVBQUF5QixRQUFBLENBQUEsT0FBQSxFQUFBb0MsSUFBQSxDQUFBLGFBQUEsRUFBQWMsUUFBQSxDQUFBdUcsTUFBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTNNLFFBQUEsUUFBQSxFQUFBOEIsSUFBQSxDQUFBMEosT0FBQTs7QUFFQSxPQUFBRCxPQUFBLE9BQUEsRUFBQTNJLE1BQUEsRUFBQTtBQUNBK0osV0FBQWhDLE9BQUEsQ0FBQSxRQUFBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQWxKLEtBQUEsaUJBQUEsRUFBQXpCLEtBQUEsUUFBQSxDQUFBLEVBQUFzRyxFQUFBLENBQUEsUUFBQSxFQUFBdkcsSUFBQWtGLE1BQUEsQ0FBQW9JLFFBQUE7QUFDQSxHQWxJQTs7QUFxSUE7QUFDQTtBQUNBO0FBQ0F0SSxTQUFBLGVBQUFkLFNBQUEsRUFBQTtBQUNBL0MsbUJBQUEsSUFBQTtBQUNBTyxLQUFBLCtCQUFBLEVBQUFJLElBQUEsQ0FBQSxTQUFBLEVBQUFnRCxHQUFBM0MsSUFBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLENBQUE7O0FBRUEyQyxNQUFBUSxJQUFBLENBQUF1QixNQUFBO0FBQ0F6QixPQUFBLE1BQUEsRUFBQTdCLFdBQUEsQ0FBQSxlQUFBO0FBQ0F0RCxRQUFBLFFBQUEsRUFBQXNELFdBQUEsQ0FBQSxTQUFBLEVBQUEwRCxHQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQWhILFNBQUEsUUFBQSxFQUFBc0QsV0FBQSxDQUFBLElBQUEsRUFBQXNFLEtBQUE7QUFDQSxJQUZBOztBQUlBLE9BQUEvQyxHQUFBM0MsSUFBQSxDQUFBLFNBQUEsS0FBQSxDQUFBLEVBQUEsQ0FFQTtBQURBOzs7QUFHQTtBQUNBdUIsVUFBQSxjQUFBLEVBQUFjLE9BQUEsQ0FBQSxNQUFBO0FBQ0EsT0FBQU4sU0FBQSxFQUFBO0FBQUFSLFdBQUEwSixFQUFBLENBQUEsVUFBQSxFQUFBLEVBQUEsUUFBQSxNQUFBLEVBQUEsRUFBQSxrQkFBQTtBQUFBO0FBQ0EsR0F6SkE7O0FBNEpBO0FBQ0E7QUFDQTtBQUNBRSxZQUFBLG9CQUFBO0FBQ0F0TixPQUFBa0YsTUFBQSxDQUFBL0MsSUFBQSxDQUFBLFFBQUEsSUFBQVQsRUFBQSx5QkFBQSxFQUFBekIsS0FBQSxRQUFBLENBQUEsRUFBQXNOLFdBQUEsRUFBQTtBQUNBdk4sT0FBQWtGLE1BQUEsQ0FBQS9DLElBQUEsQ0FBQSxZQUFBLElBQUFULEVBQUEsaUJBQUEsRUFBQXpCLEtBQUEsUUFBQSxDQUFBLEVBQUF3RyxTQUFBLEVBQUE7O0FBRUE1RixXQUFBTixHQUFBLENBQUFQLElBQUFrRixNQUFBLENBQUEvQyxJQUFBO0FBQ0E7QUFwS0EsRUFBQTtBQXNLQSxDQWhTQSxFQUFBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUFuQyxJQUFBaUYsSUFBQSxHQUFBLFlBQUE7QUFDQXZELEdBQUEsWUFBQTtBQUNBekIsT0FBQSxNQUFBLElBQUF5QixFQUFBLFdBQUEsQ0FBQTtBQUNBMEQsTUFBQSxhQUFBLEVBQUFtQixFQUFBLENBQUEsT0FBQSxFQUFBLG1CQUFBLEVBQUEsVUFBQTVCLEtBQUEsRUFBQTtBQUNBQSxTQUFBZ0QsY0FBQTs7QUFFQSxPQUFBbEgsT0FBQWlCLEVBQUEsSUFBQSxFQUFBUyxJQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EyQyxNQUFBQyxXQUFBLENBQUFDLEtBQUE7QUFDQWdDLGNBQUEsWUFBQTtBQUNBaEgsUUFBQWlGLElBQUEsQ0FBQUUsSUFBQSxDQUFBMUUsSUFBQSxFQUFBVSxhQUFBO0FBQ0EsSUFGQSxFQUVBLEdBRkE7QUFHQSxHQVJBOztBQVVBbEIsT0FBQSxNQUFBLEVBQUFzRyxFQUFBLENBQUEsUUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBNUIsS0FBQSxFQUFBO0FBQ0FBLFNBQUFnRCxjQUFBO0FBQ0EsR0FGQSxFQUVBcEIsRUFGQSxDQUVBLE9BRkEsRUFFQSxnQkFGQSxFQUVBLFVBQUE1QixLQUFBLEVBQUE7QUFDQUEsU0FBQWdELGNBQUE7O0FBRUEsT0FBQWhILFNBQUF1SixPQUFBLENBQUF2SyxNQUFBQyxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBa0YsT0FBQWdELEtBQUEsQ0FBQTNDLElBQUEsQ0FBQSx1QkFBQTtBQUNBOztBQUVBLE9BQUF6RCxFQUFBLElBQUEsRUFBQStCLFFBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTtBQUNBO0FBQ0FxQixPQUFBZ0QsS0FBQSxDQUFBM0MsSUFBQSxDQUFBLGdDQUFBO0FBQ0E7QUFDQTs7QUFFQSxPQUFBaEQsT0FBQVQsRUFBQSxNQUFBLEVBQUF6QixLQUFBLE1BQUEsQ0FBQSxFQUFBdU4sU0FBQSxFQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE5TCxLQUFBLGdCQUFBLEVBQUF6QixLQUFBLE1BQUEsQ0FBQSxFQUFBa0QsUUFBQSxDQUFBLFVBQUEsRUFBQXBCLElBQUEsQ0FBQSxrQkFBQTs7QUFFQUwsS0FBQXFLLElBQUEsQ0FBQSxjQUFBNUssYUFBQSxHQUFBLFNBQUEsRUFBQWdCLElBQUEsRUFBQXNMLElBQUEsQ0FBQSxVQUFBQyxRQUFBLEVBQUE7QUFDQTVNLGNBQUEsVUFBQSxFQUFBLFdBQUE7O0FBRUEsUUFBQTRNLFNBQUEsTUFBQSxFQUFBLFFBQUEsTUFBQSxHQUFBLEVBQUE7QUFDQTFOLFNBQUFpRixJQUFBLENBQUFELEtBQUE7QUFDQWhGLFNBQUFrRixNQUFBLENBQUFpSSxNQUFBLENBQUFPLFNBQUEsTUFBQSxDQUFBO0FBQ0E1SSxRQUFBZ0QsS0FBQSxDQUFBM0MsSUFBQSxDQUFBdUksU0FBQSxNQUFBLEVBQUEsU0FBQSxDQUFBO0FBQ0EvSCxlQUFBZ0ksT0FBQSxDQUFBLEdBQUE7O0FBRUFoTyxXQUFBRyxPQUFBLENBQUE0TixTQUFBLE1BQUEsRUFBQSxRQUFBLENBQUEsSUFBQUEsU0FBQSxNQUFBLENBQUE7QUFDQTVNLGVBQUEsVUFBQSxFQUFBLFVBQUE7QUFDQSxLQVJBLE1BUUE7QUFDQWdFLFFBQUFnRCxLQUFBLENBQUEzQyxJQUFBLENBQUF1SSxTQUFBLE1BQUEsRUFBQSxTQUFBLElBQUFBLFNBQUEsTUFBQSxFQUFBLFNBQUEsQ0FBQSxHQUFBLGtDQUFBO0FBQ0E1TSxlQUFBLFVBQUEsRUFBQSxNQUFBO0FBQ0E7QUFDQSxJQWZBLEVBZUE4TSxJQWZBLENBZUEsWUFBQTtBQUNBOUksT0FBQWdELEtBQUEsQ0FBQTNDLElBQUEsQ0FBQSxrQ0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQTtBQUNBckUsY0FBQSxVQUFBLEVBQUEsTUFBQTtBQUNBLElBbEJBO0FBb0JBLEdBakRBLEVBaURBeUYsRUFqREEsQ0FpREEsT0FqREEsRUFpREEsY0FqREEsRUFpREEsVUFBQTVCLEtBQUEsRUFBQTtBQUNBQSxTQUFBZ0QsY0FBQTtBQUNBM0gsT0FBQWlGLElBQUEsQ0FBQUQsS0FBQTtBQUNBLEdBcERBO0FBcURBLEVBakVBOztBQW1FQSxRQUFBOztBQUVBO0FBQ0E7QUFDQTZJLGFBQUEscUJBQUE7QUFDQTtBQUNBbk0sS0FBQSxnQkFBQSxFQUFBekIsS0FBQSxNQUFBLENBQUEsRUFBQXNELFdBQUEsQ0FBQSxVQUFBO0FBQ0EsR0FQQTs7QUFTQTtBQUNBO0FBQ0F1SyxlQUFBLHVCQUFBO0FBQ0E7QUFDQXBNLEtBQUEsZ0JBQUEsRUFBQXpCLEtBQUEsTUFBQSxDQUFBLEVBQUFrRCxRQUFBLENBQUEsVUFBQTtBQUNBLEdBZEE7O0FBZ0JBO0FBQ0E7QUFDQTRLLGdCQUFBLHNCQUFBQyxHQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFBQyxhQUFBLEVBQUE7O0FBRUEsWUFBQUMsYUFBQSxDQUFBRCxVQUFBLEVBQUE7QUFDQSxRQUFBRSxhQUFBek0sRUFBQSxTQUFBLEVBQUFJLElBQUEsQ0FBQSxLQUFBLEVBQUFtTSxXQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0F2TSxNQUFBLG9CQUFBLEVBQUF6QixLQUFBLE1BQUEsQ0FBQSxFQUFBbUQsR0FBQSxDQUFBNkssV0FBQSxVQUFBLENBQUE7QUFDQXZNLE1BQUEsY0FBQSxFQUFBekIsS0FBQSxNQUFBLENBQUEsRUFBQW1ELEdBQUEsQ0FBQTZLLFdBQUEsSUFBQSxDQUFBO0FBQ0F2TSxNQUFBLHFCQUFBLEVBQUF6QixLQUFBLE1BQUEsQ0FBQSxFQUFBbUQsR0FBQSxDQUFBNkssV0FBQSxXQUFBLENBQUE7QUFDQXZNLE1BQUEsbUJBQUEsRUFBQXpCLEtBQUEsTUFBQSxDQUFBLEVBQUE4QixJQUFBLENBQUFvTSxVQUFBLEVBQUFDLE1BQUE7QUFDQTs7QUFFQTtBQUNBLE9BQUFKLElBQUFLLEtBQUEsQ0FBQSxpRkFBQSxDQUFBLEVBQUE7QUFDQTtBQUNBLFFBQUFDLGNBQUFOLElBQUFLLEtBQUEsQ0FBQSxpRkFBQSxDQUFBO0FBQ0FKLGVBQUEsVUFBQSxJQUFBLFNBQUE7QUFDQUEsZUFBQSxJQUFBLElBQUFLLFlBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQUwsZUFBQSxXQUFBLElBQUEsNkJBQUFLLFlBQUEsQ0FBQSxDQUFBLEdBQUEsUUFBQTs7QUFFQXRPLFFBQUFpRixJQUFBLENBQUE0SSxTQUFBO0FBQ0FLLGtCQUFBRCxVQUFBO0FBQ0EsSUFWQTs7QUFZQTtBQUNBLFFBQUFELElBQUFLLEtBQUEsQ0FBQSxZQUFBLENBQUEsRUFBQTtBQUNBO0FBQ0EsU0FBQUUsWUFBQVAsSUFBQUssS0FBQSxDQUFBLG9DQUFBLENBQUE7QUFDQUosZ0JBQUEsVUFBQSxJQUFBLE9BQUE7QUFDQUEsZ0JBQUEsSUFBQSxJQUFBTSxVQUFBLENBQUEsQ0FBQTs7QUFFQTdNLE9BQUFnSCxPQUFBLENBQUEsb0NBQUE2RixVQUFBLENBQUEsQ0FBQSxHQUFBLGtCQUFBLEVBQ0FkLElBREEsQ0FDQSxVQUFBQyxRQUFBLEVBQUE7QUFDQU8saUJBQUEsV0FBQSxJQUFBUCxTQUFBLENBQUEsRUFBQSxpQkFBQSxDQUFBOztBQUVBMU4sVUFBQWlGLElBQUEsQ0FBQTRJLFNBQUE7QUFDQUssb0JBQUFELFVBQUE7QUFDQSxNQU5BO0FBT0E7QUFDQSxHQTVEQTs7QUE4REE7QUFDQTtBQUNBOUksUUFBQSxjQUFBMUUsSUFBQSxFQUFBd0ssTUFBQSxFQUFBO0FBQ0EsT0FBQTlJLE9BQUE7QUFDQSxjQUFBeEMsTUFBQUMsTUFBQSxDQUFBLFFBQUEsQ0FEQTtBQUVBLGNBQUFxTCxVQUFBOUosYUFGQTtBQUdBLFlBQUF4QixNQUFBSSxPQUFBLENBQUEsSUFBQSxDQUhBO0FBSUEsYUFBQUosTUFBQUksT0FBQSxDQUFBLE9BQUEsQ0FKQTtBQUtBLGFBQUFKLE1BQUFJLE9BQUEsQ0FBQSxPQUFBO0FBTEEsSUFBQTtBQU9BLE9BQUF5TyxpQkFBQXZNLFNBQUEsY0FBQXhCLElBQUEsRUFBQTBCLElBQUEsQ0FBQTs7QUFFQTtBQUNBO0FBQ0FsQyxRQUFBLE1BQUEsRUFBQThCLElBQUEsQ0FBQXlNLGNBQUEsRUFBQXJMLFFBQUEsQ0FBQSxJQUFBLEVBQUFxQyxNQUFBLEdBQUFyQyxRQUFBLENBQUEsU0FBQSxFQUFBOEQsR0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0EsUUFBQXdILG1CQUFBL00sRUFBQSxTQUFBLEVBQUF6QixLQUFBLE1BQUEsQ0FBQSxFQUFBbUcsR0FBQSxDQUFBLGtCQUFBLENBQUE7QUFDQTFFLE1BQUEsK0JBQUEsRUFBQUksSUFBQSxDQUFBLFNBQUEsRUFBQTJNLGdCQUFBO0FBQ0EsSUFIQTs7QUFLQXpPLE9BQUFpRixJQUFBLENBQUE2SSxXQUFBOztBQUVBO0FBQ0E7QUFDQSxPQUFBck4sU0FBQSxPQUFBLEVBQUE7QUFDQVIsU0FBQSxNQUFBLEVBQUF5TyxRQUFBO0FBQ0FoTixNQUFBLG1CQUFBLEVBQUF6QixLQUFBLE1BQUEsQ0FBQSxFQUFBdUgsT0FBQSxDQUFBLE9BQUE7QUFDQTtBQUNBLElBSkEsTUFNQSxJQUFBL0csU0FBQSxPQUFBLElBQUFBLFNBQUEsTUFBQSxFQUFBO0FBQ0FpQixNQUFBLHFCQUFBLEVBQUF6QixLQUFBLE1BQUEsQ0FBQSxFQUFBME8sS0FBQSxHQUFBcEksRUFBQSxDQUFBLE9BQUEsRUFBQSxZQUFBO0FBQ0E7QUFDQXZHLFNBQUFpRixJQUFBLENBQUE4SSxZQUFBLENBQUFyTSxFQUFBLElBQUEsRUFBQTBCLEdBQUEsRUFBQTtBQUNBLEtBSEE7QUFJQSxJQUxBLE1BT0EsSUFBQTNDLFNBQUEsTUFBQSxFQUFBO0FBQ0FpQixNQUFBLG1CQUFBLEVBQUF6QixLQUFBLE1BQUEsQ0FBQSxFQUFBME8sS0FBQSxHQUFBcEksRUFBQSxDQUFBLE9BQUEsRUFBQSxZQUFBO0FBQ0EsU0FBQTdFLEVBQUEsSUFBQSxFQUFBMEIsR0FBQSxHQUFBUCxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0E3QyxVQUFBaUYsSUFBQSxDQUFBNEksU0FBQTtBQUNBLE1BRkEsTUFFQTtBQUNBN04sVUFBQWlGLElBQUEsQ0FBQTZJLFdBQUE7QUFDQTtBQUNBLEtBTkE7QUFPQTs7QUFFQWhKLE1BQUFvQyxRQUFBLENBQUFILElBQUEsQ0FBQTlHLEtBQUEsTUFBQSxDQUFBOztBQUVBO0FBQ0F5RCxVQUFBLGNBQUEsRUFBQWMsT0FBQSxDQUFBLFVBQUE7QUFDQVAsV0FBQTJLLFlBQUEsQ0FBQSxFQUFBLFFBQUEsVUFBQSxFQUFBLFFBQUFuTyxJQUFBLEVBQUEsTUFBQTBCLEtBQUEsUUFBQSxDQUFBLEVBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQTtBQUNBLEdBakhBOztBQW1IQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBNkMsU0FBQSxpQkFBQTtBQUNBO0FBQ0F0RCxLQUFBLCtCQUFBLEVBQUFJLElBQUEsQ0FBQSxTQUFBLEVBQUFnRCxHQUFBM0MsSUFBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLENBQUE7O0FBRUFsQyxRQUFBLE1BQUEsRUFBQXNELFdBQUEsQ0FBQSxTQUFBLEVBQUEwRCxHQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQWhILFNBQUEsTUFBQSxFQUFBc0QsV0FBQSxDQUFBLElBQUEsRUFBQXNFLEtBQUE7QUFDQS9DLE9BQUFvQyxRQUFBLENBQUE1RCxJQUFBLENBQUFyRCxLQUFBLE1BQUEsQ0FBQTtBQUNBLElBSEE7O0FBS0F5RCxVQUFBLGNBQUEsRUFBQWMsT0FBQSxDQUFBLFFBQUE7QUFDQTtBQW5JQSxFQUFBO0FBcUlBLENBek1BLEVBQUE7O0FDWEE7QUFDQTtBQUNBO0FBQ0EsSUFBQXFLLGFBQUEsRUFBQTs7QUFFQSxTQUFBQyxNQUFBLENBQUFDLEtBQUEsRUFBQTtBQUNBLEtBQUFDLDhCQUFBO0FBQ0EsS0FBQSxDQURBO0FBRUEsS0FBQSxDQUZBO0FBR0EsS0FBQSxDQUhBO0FBSUEsS0FBQSxHQUpBO0FBS0EsS0FBQSxDQUxBO0FBTUEsS0FBQSxDQU5BO0FBT0EsS0FBQSxFQVBBO0FBUUEsS0FBQSxDQVJBO0FBU0EsS0FBQTtBQVRBLEVBQUE7O0FBWUFDLFNBQUFDLFdBQUEsQ0FBQUgsS0FBQSxFQUFBLFVBQUFJLElBQUEsRUFBQUMsSUFBQSxFQUFBO0FBQ0EsTUFBQSxTQUFBQyxJQUFBLENBQUFGLEtBQUExTyxJQUFBLENBQUEsRUFBQTtBQUNBb08sY0FBQU0sS0FBQSxNQUFBLENBQUEsSUFBQUMsSUFBQTtBQUNBLFVBQUEsSUFBQTtBQUNBO0FBQ0E7QUFDQSxTQUFBLEtBQUE7QUFDQSxFQVBBLEVBT0EsVUFBQUwsS0FBQSxFQUFBTyxRQUFBLEVBQUE7QUFDQSxNQUFBUCxNQUFBbE0sTUFBQSxFQUFBO0FBQ0FuQixLQUFBLFNBQUEsRUFBQXpCLEtBQUEsTUFBQSxDQUFBLEVBQUFrRCxRQUFBLENBQUEsVUFBQTs7QUFFQTtBQUNBOEwsV0FBQXROLElBQUEsQ0FBQW9OLEtBQUEsRUFBQSxVQUFBSSxJQUFBLEVBQUE7QUFDQSxRQUFBSSxtQkFBQVYsV0FBQU0sS0FBQSxNQUFBLENBQUEsRUFBQSxNQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0FOLGVBQUFNLEtBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxJQUFBaE8sZ0JBQUEsR0FBQSxHQUFBeEIsTUFBQUksT0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEdBQUEsR0FDQVksU0FBQUMsTUFBQSxDQUFBLEdBQUEsQ0FEQSxHQUNBLEdBREEsR0FDQVEsS0FBQSxDQUFBLEVBQUEsR0FBQSxFQUFBZ0ksT0FBQSxDQUFBLENBQUEsQ0FEQTs7QUFHQSxRQUFBK0YsS0FBQSxNQUFBLEtBQUEsV0FBQSxFQUFBO0FBQ0EsU0FBQUssU0FBQSxJQUFBQyxVQUFBLEVBQUE7QUFDQUQsWUFBQUUsTUFBQSxHQUFBLFVBQUEvSyxLQUFBLEVBQUE7QUFDQSxVQUFBZ0wsTUFBQWpPLEVBQUEsU0FBQSxFQUFBSSxJQUFBLENBQUEsS0FBQSxFQUFBNkMsTUFBQWlMLE1BQUEsQ0FBQUMsTUFBQSxDQUFBO0FBQ0EsVUFBQUMsV0FBQXBPLEVBQUEsa0RBQUEsRUFBQTBCLEdBQUEsQ0FBQXlMLFdBQUFNLEtBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLENBQUE7O0FBRUEsVUFBQVksVUFBQXJPLEVBQUEsU0FBQSxFQUFBeUIsUUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBekIsUUFBQSxTQUFBLEVBQUF5QixRQUFBLENBQUEsUUFBQSxFQUFBcEIsSUFBQSxDQUFBLG1DQUFBLEVBQUFzRSxRQUFBLENBQUEwSixPQUFBO0FBQ0FyTyxRQUFBLFNBQUEsRUFBQXlCLFFBQUEsQ0FBQSxLQUFBLEVBQUFrRCxRQUFBLENBQUEwSixPQUFBOztBQUVBLFVBQUFDLFdBQUF0TyxFQUFBLFFBQUEsRUFBQUksSUFBQSxDQUFBLElBQUEsRUFBQSxVQUNBK00sV0FBQU0sS0FBQSxNQUFBLENBQUEsRUFBQSxLQUFBLENBREEsRUFDQTVGLE1BREEsQ0FDQXVHLFFBREEsRUFDQXZHLE1BREEsQ0FDQXdHLE9BREEsRUFDQXhHLE1BREEsQ0FDQW9HLEdBREEsQ0FBQTtBQUVBak8sUUFBQSxrQkFBQSxFQUFBNkgsTUFBQSxDQUFBeUcsUUFBQTtBQUNBLE1BWEE7QUFZQVIsWUFBQVMsYUFBQSxDQUFBZCxJQUFBO0FBQ0EsS0FmQSxNQWVBO0FBQ0FGLGFBQ0FpQixLQURBLENBQ0FmLElBREEsRUFFQWdCLE1BRkEsQ0FFQW5CLDRCQUFBTyxnQkFBQSxDQUZBLEVBR0FhLE1BSEEsQ0FHQSxHQUhBLEVBR0EsR0FIQSxFQUdBLFNBSEEsRUFJQUMsR0FKQSxDQUlBLFVBQUFDLEdBQUEsRUFBQVgsR0FBQSxFQUFBO0FBQ0E7QUFDQTtBQUNBLFVBQUFHLFdBQUFwTyxFQUFBLGtEQUFBLEVBQUEwQixHQUFBLENBQUF5TCxXQUFBTSxLQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUFZLFVBQUFyTyxFQUFBLFNBQUEsRUFBQXlCLFFBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQXpCLFFBQUEsU0FBQSxFQUFBeUIsUUFBQSxDQUFBLFFBQUEsRUFBQXBCLElBQUEsQ0FBQSxtQ0FBQSxFQUFBc0UsUUFBQSxDQUFBMEosT0FBQTtBQUNBck8sUUFBQSxTQUFBLEVBQUF5QixRQUFBLENBQUEsS0FBQSxFQUFBa0QsUUFBQSxDQUFBMEosT0FBQTs7QUFFQSxVQUFBQyxXQUFBdE8sRUFBQSxRQUFBLEVBQUFJLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFDQStNLFdBQUFNLEtBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxDQURBLEVBQ0E1RixNQURBLENBQ0F1RyxRQURBLEVBQ0F2RyxNQURBLENBQ0F3RyxPQURBLEVBQ0F4RyxNQURBLENBQ0FvRyxHQURBLENBQUE7QUFFQWpPLFFBQUEsa0JBQUEsRUFBQTZILE1BQUEsQ0FBQXlHLFFBQUE7QUFDQSxNQWhCQTtBQWlCQTtBQUNBLElBdkNBOztBQXlDQTtBQUNBZixXQUFBSCxNQUFBLENBQUE7QUFDQWQsU0FBQSxjQUFBN00sYUFBQSxHQUFBLFNBREE7QUFFQWdCLFVBQUE7QUFDQSxlQUFBLFFBREE7QUFFQSxlQUFBeEMsTUFBQUMsTUFBQSxDQUFBLFFBQUEsQ0FGQTtBQUdBLGVBQUF1QixhQUhBO0FBSUEsY0FBQXhCLE1BQUFJLE9BQUEsQ0FBQSxPQUFBLENBSkE7QUFLQSxhQUFBSixNQUFBSSxPQUFBLENBQUEsSUFBQTtBQUxBLEtBRkE7QUFTQXdRLGFBQUEsaUJBQUFwQixJQUFBLEVBQUFxQixPQUFBLEVBQUE7QUFDQUEsYUFBQXJPLElBQUEsQ0FBQXNPLEdBQUEsR0FBQTVCLFdBQUFNLEtBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBO0FBQ0FBLFVBQUFzQixHQUFBLEdBQUE1QixXQUFBTSxLQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQTtBQUNBLEtBWkE7O0FBY0F1QiwwQkFBQTNCLE1BQUEsQ0FBQSxFQUFBLE1BQUEsTUFBQSxXQUFBLEdBQUEsSUFBQSxHQUFBLElBZEE7QUFlQTRCLG9CQUFBNUIsTUFBQSxDQUFBLEVBQUEsTUFBQSxNQUFBLFdBQUEsR0FBQTtBQUNBNkIsZUFBQSxJQURBO0FBRUFDLGdCQUFBO0FBRkEsS0FBQSxHQUdBLElBbEJBOztBQW9CQTlCLFdBQUFBLEtBcEJBO0FBcUJBK0Isa0JBQUEsc0JBQUFuTSxLQUFBLEVBQUF3SyxJQUFBLEVBQUE0QixHQUFBLEVBQUE7QUFDQSxTQUFBQyxVQUFBLENBQUFyTSxNQUFBLFFBQUEsSUFBQUEsTUFBQSxPQUFBLENBQUEsR0FBQSxHQUFBLEVBQUF5RSxPQUFBLENBQUEsQ0FBQSxDQUFBO0FBQUEsU0FDQStCLFNBQUE2RixVQUFBLEdBQUEsR0FBQSx1Q0FDQUEsT0FEQSxHQUNBLEdBREEsR0FDQSxzQ0FGQTs7QUFJQXRQLE9BQUEsV0FBQXlOLEtBQUEsS0FBQSxDQUFBLEdBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQXBOLElBQUEsQ0FBQW9KLE1BQUE7QUFDQSxLQTNCQTtBQTRCQThGLGNBQUEsa0JBQUF0TSxLQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0EsS0EvQkE7QUFnQ0F1TSxrQkFBQSxzQkFBQS9CLElBQUEsRUFBQTRCLEdBQUEsRUFBQVAsT0FBQSxFQUFBO0FBQ0E7QUFDQTlPLE9BQUEsV0FBQThPLFFBQUEsS0FBQSxDQUFBLEdBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQXpPLElBQUEsQ0FBQSx1Q0FBQTtBQUNBLEtBbkNBO0FBb0NBb1AsY0FBQSxrQkFBQWIsR0FBQSxFQUFBUyxHQUFBLEVBQUE7QUFDQS9RLFNBQUFpRixJQUFBLENBQUE0SSxTQUFBO0FBQ0E7QUFDQTtBQXZDQSxJQUFBO0FBeUNBO0FBQ0EsRUFoR0E7QUFpR0E7O0FBRUFuTSxFQUFBWSxFQUFBLENBQUFvTSxRQUFBLEdBQUEsWUFBQTtBQUNBO0FBQ0EsS0FBQTBDLFlBQUExUCxFQUFBLFdBQUEsRUFBQSxJQUFBLENBQUE7QUFDQXVOLFNBQUF0SyxLQUFBLENBQUEwTSxHQUFBLENBQUFELFVBQUEsQ0FBQSxDQUFBLEVBQUEsVUFBQUUsSUFBQSxFQUFBO0FBQ0EsTUFBQUEsSUFBQSxFQUFBO0FBQ0FGLGFBQUFqTyxRQUFBLENBQUEsUUFBQTtBQUNBLEdBRkEsTUFFQTtBQUNBaU8sYUFBQTdOLFdBQUEsQ0FBQSxRQUFBO0FBQ0E7QUFDQSxFQU5BLEVBTUEsVUFBQXdMLEtBQUEsRUFBQTtBQUNBRCxTQUFBQyxLQUFBO0FBQ0EsRUFSQTs7QUFVQTtBQUNBLEtBQUF3QyxjQUFBbE0sU0FBQW1NLGNBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQXZDLFNBQUF0SyxLQUFBLENBQUE0QixFQUFBLENBQUFnTCxXQUFBLEVBQUEsUUFBQSxFQUFBLFVBQUE1TSxLQUFBLEVBQUE7QUFDQSxNQUFBb0ssUUFBQUUsUUFBQXdDLFFBQUEsQ0FBQTlNLEtBQUEsQ0FBQTtBQUNBbUssU0FBQUMsS0FBQTtBQUNBLEVBSEE7O0FBS0E7QUFDQSxLQUFBMkMsU0FBQWhRLEVBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQTtBQUNBZ1EsUUFBQW5MLEVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUE1QixLQUFBLEVBQUE7QUFDQSxNQUFBRyxHQUFBM0MsSUFBQSxDQUFBLGtCQUFBLE1BQUEsU0FBQSxFQUFBO0FBQ0F3QyxTQUFBZ0QsY0FBQTtBQUNBO0FBQ0EsRUFKQSxFQUlBcEIsRUFKQSxDQUlBLGlCQUpBLEVBSUEsVUFBQTVCLEtBQUEsRUFBQTtBQUNBQSxRQUFBaUwsTUFBQSxDQUFBNU4sTUFBQTtBQUNBLEVBTkEsRUFNQXVFLEVBTkEsQ0FNQSxjQU5BLEVBTUEsVUFBQTVCLEtBQUEsRUFBQTtBQUNBQSxVQUFBQSxNQUFBZ04sYUFBQTtBQUNBaE4sUUFBQWlMLE1BQUEsQ0FBQWdDLFVBQUEsQ0FBQUMsWUFBQSxDQUFBbE4sTUFBQWlMLE1BQUEsRUFBQWpMLE1BQUFtTixNQUFBLENBQUFELFlBQUE7QUFDQSxTQUFBLEtBQUE7QUFDQSxFQVZBOztBQVlBLEtBQUFFLElBQUEsQ0FBQUwsT0FBQSxDQUFBLENBQUE7QUFDQSxDQW5DQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUExUixJQUFBZ1MsS0FBQSxHQUFBLFlBQUE7QUFDQXJTLE9BQUFJLE9BQUEsR0FBQTtBQUNBLFFBQUEsSUFEQTtBQUVBLFVBQUEsSUFGQTtBQUdBLFdBQUEsSUFIQTtBQUlBLFdBQUEsSUFKQTtBQUtBLFdBQUEsSUFMQTtBQU1BLGVBQUE7QUFOQSxFQUFBOztBQVNBO0FBQ0EsS0FBQWtTLGdCQUFBQSxhQUFBQyxPQUFBLENBQUEsZUFBQSxDQUFBLEVBQUE7QUFDQXZTLFFBQUFJLE9BQUEsR0FBQW9TLEtBQUFDLEtBQUEsQ0FBQUgsYUFBQUMsT0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBOztBQUVBeFEsSUFBQSxZQUFBO0FBQ0EsT0FBQS9CLE1BQUFJLE9BQUEsQ0FBQSxJQUFBLE1BQUEsSUFBQSxFQUFBO0FBQ0FxRixRQUFBLE1BQUEsRUFBQWpDLFFBQUEsQ0FBQSxvQkFBQXhELE1BQUFJLE9BQUEsQ0FBQSxPQUFBLENBQUE7O0FBRUE7QUFDQTtBQUNBSSxRQUFBLGFBQUEsRUFBQXNOLElBQUEsQ0FBQSxZQUFBO0FBQ0F6RyxnQkFBQSxZQUFBO0FBQ0FsQyxTQUFBZ0QsS0FBQSxDQUFBZixJQUFBLENBQUEsU0FBQXBILE1BQUFJLE9BQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxHQUFBO0FBQ0EsTUFGQSxFQUVBLElBRkE7QUFHQSxLQUpBO0FBS0E7QUFDQSxHQVpBO0FBYUE7O0FBRUEyQixHQUFBLFlBQUE7QUFDQTBELE1BQUEsT0FBQSxJQUFBMUQsRUFBQSxZQUFBLENBQUE7QUFDQTBELE1BQUEsT0FBQSxFQUFBLFFBQUEsSUFBQTFELEVBQUEsa0JBQUEsRUFBQTBELElBQUEsT0FBQSxDQUFBLENBQUE7O0FBRUE7QUFDQTFELElBQUEsbUJBQUEsRUFBQTBELElBQUEsU0FBQSxDQUFBLEVBQUFtQixFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUE1QixLQUFBLEVBQUE7QUFDQUEsU0FBQWdELGNBQUE7QUFDQTdDLE1BQUE0QyxPQUFBLENBQUExQyxLQUFBO0FBQ0FoRixPQUFBZ1MsS0FBQSxDQUFBakwsSUFBQTtBQUNBLEdBSkE7O0FBTUFyRixJQUFBLG9CQUFBLEVBQUEwRCxJQUFBLFNBQUEsQ0FBQSxFQUFBbUIsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBNUIsS0FBQSxFQUFBO0FBQ0FBLFNBQUFnRCxjQUFBO0FBQ0E3QyxNQUFBNEMsT0FBQSxDQUFBMUMsS0FBQTtBQUNBaEYsT0FBQWdTLEtBQUEsQ0FBQUssTUFBQTtBQUNBLEdBSkE7O0FBTUE7QUFDQWpOLE1BQUEsT0FBQSxFQUFBbUIsRUFBQSxDQUFBLE9BQUEsRUFBQSxjQUFBLEVBQUEsVUFBQTVCLEtBQUEsRUFBQTtBQUNBQSxTQUFBZ0QsY0FBQTtBQUNBM0gsT0FBQWdTLEtBQUEsQ0FBQTFPLElBQUE7QUFDQSxHQUhBLEVBR0FpRCxFQUhBLENBR0EsUUFIQSxFQUdBLE1BSEEsRUFHQSxVQUFBNUIsS0FBQSxFQUFBO0FBQ0FBLFNBQUFnRCxjQUFBOztBQUVBakcsS0FBQSxrQkFBQSxFQUFBMEQsSUFBQSxNQUFBLENBQUEsRUFBQW9DLE9BQUEsQ0FBQSxPQUFBO0FBQ0EsT0FBQThLLGFBQUE1USxFQUFBLE1BQUEsRUFBQTBELElBQUEsT0FBQSxDQUFBLEVBQUFvSSxTQUFBLEVBQUE7QUFDQXhOLE9BQUFnUyxLQUFBLENBQUFPLE1BQUEsQ0FBQUQsVUFBQTtBQUNBLEdBVEE7QUFVQSxFQTVCQTs7QUE4QkEsUUFBQTtBQUNBO0FBQ0E7QUFDQXZMLFFBQUEsZ0JBQUE7QUFDQTtBQUNBM0IsT0FBQSxPQUFBLEVBQUFqQyxRQUFBLENBQUEsSUFBQSxFQUFBcUMsTUFBQSxHQUFBckMsUUFBQSxDQUFBLE9BQUEsRUFBQThELEdBQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBbkMsT0FBQVEsSUFBQSxDQUFBc0IsSUFBQTtBQUNBOUIsT0FBQW9DLFFBQUEsQ0FBQUgsSUFBQSxDQUFBM0IsSUFBQSxPQUFBLENBQUE7QUFDQTFELE1BQUEscUJBQUEsRUFBQTBELElBQUEsT0FBQSxDQUFBLEVBQUF1SixLQUFBO0FBQ0EsSUFKQTtBQUtBLEdBVkE7O0FBWUE7QUFDQTtBQUNBckwsUUFBQSxnQkFBQTtBQUNBOEIsT0FBQSxPQUFBLEVBQUE3QixXQUFBLENBQUEsT0FBQSxFQUFBMEQsR0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0E3QixRQUFBLE9BQUEsRUFBQTdCLFdBQUEsQ0FBQSxJQUFBO0FBQ0F1QixPQUFBb0MsUUFBQSxDQUFBNUQsSUFBQSxDQUFBOEIsSUFBQSxPQUFBLENBQUE7QUFDQU4sT0FBQVEsSUFBQSxDQUFBdUIsTUFBQTtBQUNBLElBSkE7QUFLQSxHQXBCQTs7QUFzQkE7QUFDQTtBQUNBMEwsVUFBQSxnQkFBQXBRLElBQUEsRUFBQTtBQUNBO0FBQ0FpRCxPQUFBLE9BQUEsRUFBQSxRQUFBLEVBQ0FvTixJQURBLENBQ0EsVUFEQSxFQUNBLElBREEsRUFFQWpOLElBRkEsQ0FFQSxVQUZBOztBQUlBO0FBQ0E4QyxZQUFBLGdCQUFBLEVBQUFsRyxJQUFBLEVBQUFzTCxJQUFBLENBQUEsVUFBQUMsUUFBQSxFQUFBO0FBQ0EsUUFBQUEsU0FBQSxNQUFBLEVBQUEsUUFBQSxNQUFBLEdBQUEsRUFBQTtBQUNBL04sV0FBQUksT0FBQSxHQUFBMk4sU0FBQSxNQUFBLENBQUE7QUFDQS9OLFdBQUFJLE9BQUEsQ0FBQSxXQUFBLElBQUEsSUFBQTtBQUNBa1Msa0JBQUFRLE9BQUEsQ0FBQSxlQUFBLEVBQUFOLEtBQUFPLFNBQUEsQ0FBQS9TLE1BQUFJLE9BQUEsQ0FBQTs7QUFFQXFGLFNBQUEsTUFBQSxFQUFBakMsUUFBQSxDQUFBLG9CQUFBeEQsTUFBQUksT0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBQyxTQUFBZ1MsS0FBQSxDQUFBMU8sSUFBQTtBQUNBMEQsZ0JBQUEsWUFBQTtBQUNBbEMsU0FBQWdELEtBQUEsQ0FBQWYsSUFBQSxDQUFBLFNBQUFwSCxNQUFBSSxPQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsR0FBQTtBQUNBLE1BRkEsRUFFQSxHQUZBOztBQUlBZSxlQUFBLE9BQUEsRUFBQSxRQUFBO0FBQ0EsS0FaQSxNQVlBO0FBQ0E7QUFDQTtBQUNBWSxPQUFBLGFBQUEsRUFBQTBELElBQUEsT0FBQSxDQUFBLEVBQUFqQyxRQUFBLENBQUEsZ0JBQUE7O0FBRUE2RCxnQkFBQSxZQUFBO0FBQ0F0RixRQUFBLGFBQUEsRUFBQTBELElBQUEsT0FBQSxDQUFBLEVBQUE3QixXQUFBLENBQUEsZ0JBQUE7QUFDQSxNQUZBLEVBRUEsSUFGQTs7QUFJQXpDLGVBQUEsT0FBQSxFQUFBLE1BQUE7QUFDQTtBQUNBLElBeEJBLEVBd0JBOE0sSUF4QkEsQ0F3QkEsWUFBQTtBQUNBOUksT0FBQWdELEtBQUEsQ0FBQWYsSUFBQSxDQUFBLGtDQUFBO0FBQ0FqRyxjQUFBLE9BQUEsRUFBQSxNQUFBO0FBQ0EsSUEzQkEsRUEyQkE2UixNQTNCQSxDQTJCQSxZQUFBO0FBQ0F2TixRQUFBLE9BQUEsRUFBQSxRQUFBLEVBQ0FvTixJQURBLENBQ0EsVUFEQSxFQUNBLEtBREEsRUFFQWpOLElBRkEsQ0FFQSxPQUZBO0FBR0F6RSxjQUFBLE9BQUEsRUFBQSxXQUFBO0FBQ0EsSUFoQ0E7QUFpQ0EsR0FoRUE7O0FBa0VBO0FBQ0E7QUFDQXVSLFVBQUEsa0JBQUE7QUFDQTtBQUNBak4sT0FBQSxNQUFBLEVBQUE3QixXQUFBLENBQUEsb0JBQUE1RCxNQUFBSSxPQUFBLENBQUEsT0FBQSxDQUFBOztBQUVBO0FBQ0FKLFNBQUFJLE9BQUEsR0FBQTtBQUNBLFVBQUEsSUFEQTtBQUVBLFlBQUEsSUFGQTtBQUdBLGFBQUEsSUFIQTtBQUlBLGFBQUEsSUFKQTtBQUtBLGFBQUEsSUFMQTtBQU1BLGlCQUFBO0FBTkEsSUFBQTs7QUFTQWtTLGdCQUFBUSxPQUFBLENBQUEsZUFBQSxFQUFBTixLQUFBTyxTQUFBLENBQUEvUyxNQUFBSSxPQUFBLENBQUE7O0FBRUE7QUFDQTtBQUNBaUgsY0FBQSxZQUFBO0FBQ0FsQyxPQUFBZ0QsS0FBQSxDQUFBZixJQUFBLENBQUEsbUJBQUE7QUFDQSxJQUZBLEVBRUEsR0FGQTs7QUFJQWpHLGFBQUEsT0FBQSxFQUFBLFFBQUE7QUFDQTtBQTNGQSxFQUFBO0FBNkZBLENBeEpBLEVBQUE7O0FDUkE7QUFDQTtBQUNBOztBQUVBO0FBQ0FWLE9BQUF3UyxLQUFBLEdBQUEsWUFBQTtBQUNBdlMsUUFBQSxhQUFBLElBQUEyRyxXQUFBLFlBQUE7QUFDQXpHLE1BQUEsY0FBQSxFQUFBLE1BQUE7O0FBRUFKLE1BQUEsYUFBQSxJQUFBdUIsRUFBQW1SLFFBQUEsRUFBQTtBQUNBMVMsTUFBQSxZQUFBLElBQUEsSUFBQTs7QUFFQUEsTUFBQSxhQUFBLEVBQUFzTixJQUFBLENBQUEsWUFBQTtBQUNBO0FBQ0EsT0FBQS9KLE9BQUEsTUFBQSxLQUFBQSxPQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBO0FBQ0E7QUFDQSxRQUFBdUgsU0FBQXZILE9BQUEsTUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQW9QLE1BQUE3SCxNQUFBLENBQUEsSUFBQUEsVUFBQSxDQUFBLElBQUFBLFVBQUF0TCxNQUFBQyxNQUFBLENBQUEsbUJBQUEsQ0FBQSxFQUFBO0FBQ0FJLFNBQUFrRixNQUFBLENBQUFDLElBQUEsQ0FBQThGLE1BQUEsRUFBQSxLQUFBLEVBQUEsS0FBQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxPQUFBOUssSUFBQSxZQUFBLENBQUEsRUFBQTtBQUNBO0FBQ0FFLFdBQUEsZ0JBQUEsSUFBQTJHLFdBQUFoSCxJQUFBd0osUUFBQSxDQUFBYixLQUFBLEVBQUEsR0FBQSxDQUFBOztBQUVBO0FBQ0F2SSxXQUFBMlMsTUFBQTs7QUFFQTtBQUNBNVMsUUFBQSxZQUFBLElBQUEsS0FBQTtBQUNBOztBQUVBO0FBQ0EsR0F4QkE7O0FBMEJBRSxTQUFBLFlBQUEsSUFBQTJHLFdBQUEsWUFBQTtBQUNBNUcsVUFBQTRTLElBQUE7QUFDQSxHQUZBLEVBRUEsR0FGQSxDQUFBOztBQUlBbFMsWUFBQSxPQUFBLEVBQUEsUUFBQTtBQUNBLEVBckNBLEVBcUNBLENBckNBLENBQUE7QUFzQ0EsQ0F2Q0EsRUFBQTs7QUEwQ0E7QUFDQVYsT0FBQTRTLElBQUEsR0FBQSxZQUFBO0FBQ0F6UyxLQUFBLGFBQUEsRUFBQSxNQUFBOztBQUVBOEgsVUFBQSxPQUFBLEVBQUFvRixJQUFBLENBQUEsVUFBQUMsUUFBQSxFQUFBO0FBQ0EvTixRQUFBQyxNQUFBLEdBQUE4TixTQUFBLFFBQUEsQ0FBQTtBQUNBL04sUUFBQUUsTUFBQSxHQUFBNk4sU0FBQSxRQUFBLENBQUE7QUFDQS9OLFFBQUFHLE9BQUEsR0FBQTROLFNBQUEsU0FBQSxDQUFBOztBQUVBck4sU0FBQSxhQUFBLElBQUEyRyxXQUFBLFlBQUE7QUFDQTtBQUNBaEgsT0FBQUwsS0FBQSxDQUFBZ0osS0FBQTtBQUNBM0ksT0FBQUgsTUFBQSxDQUFBK0ksTUFBQTs7QUFFQTtBQUNBekksT0FBQSxhQUFBLEVBQUE4UyxPQUFBO0FBQ0ExUyxPQUFBLGdDQUFBO0FBQ0EsR0FSQSxFQVFBLENBUkEsQ0FBQTs7QUFVQTtBQUNBLEVBaEJBO0FBaUJBLENBcEJBOztBQXVCQTtBQUNBSCxPQUFBMlMsTUFBQSxHQUFBLFlBQUE7QUFDQSxLQUFBRyxVQUFBO0FBQ0EsYUFBQSxDQURBO0FBRUEsV0FBQSxDQUZBO0FBR0EsV0FBQSxDQUhBO0FBSUEsa0JBQUE7QUFKQSxFQUFBOztBQU9BN1MsUUFBQSxXQUFBLElBQUFrSyxZQUFBLFlBQUE7QUFDQWhLLE1BQUEsZUFBQSxFQUFBLE1BQUE7O0FBRUE4SCxXQUFBLFlBQUEsRUFBQW9GLElBQUEsQ0FBQSxVQUFBQyxRQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUFBO0FBQUE7O0FBQUE7QUFJQSwwQkFBQUEsUUFBQSxtSUFBQTtBQUFBLFNBQUF5RixTQUFBOztBQUNBO0FBQ0EsU0FBQXhTLE9BQUF3UyxVQUFBLElBQUEsQ0FBQSxFQUFBakosT0FBQSxDQUFBZ0osUUFBQSxjQUFBLENBQUEsS0FBQUMsVUFBQSxPQUFBLEtBQUF4VCxNQUFBSSxPQUFBLENBQUEsSUFBQSxDQUFBLEVBQUE7QUFDQW1ULGNBQUEsT0FBQTs7QUFFQSxVQUFBQyxVQUFBLE1BQUEsTUFBQSxhQUFBLEVBQUE7QUFDQUQsZUFBQSxTQUFBO0FBQ0EsT0FGQSxNQUVBLElBQUFDLFVBQUEsTUFBQSxNQUFBLFdBQUEsRUFBQTtBQUNBRCxlQUFBLE9BQUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFqQkE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFrQkEsT0FBQUEsUUFBQSxPQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0E7QUFDQSxRQUFBRSxRQUFBO0FBQ0EsZ0JBQUFGLFFBQUEsU0FBQSxJQUFBLEdBQUEsSUFBQUEsUUFBQSxTQUFBLElBQUEsQ0FBQSxHQUFBLGVBQUEsR0FBQSxhQUFBLENBREE7QUFFQSxjQUFBQSxRQUFBLE9BQUEsSUFBQSxHQUFBLElBQUFBLFFBQUEsT0FBQSxJQUFBLENBQUEsR0FBQSxhQUFBLEdBQUEsV0FBQSxDQUZBO0FBR0EsY0FBQTtBQUhBLEtBQUE7O0FBTUEsUUFBQUEsUUFBQSxTQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0FFLFdBQUEsT0FBQSxLQUFBQSxNQUFBLFNBQUEsQ0FBQTtBQUNBO0FBQ0EsUUFBQUYsUUFBQSxTQUFBLElBQUEsQ0FBQSxJQUFBQSxRQUFBLE9BQUEsSUFBQSxDQUFBLEVBQUE7QUFDQUUsV0FBQSxPQUFBLEtBQUEsS0FBQTtBQUNBO0FBQ0EsUUFBQUYsUUFBQSxPQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0FFLFdBQUEsT0FBQSxLQUFBQSxNQUFBLE9BQUEsQ0FBQTtBQUNBOztBQUVBO0FBQ0F0TyxPQUFBZ0QsS0FBQSxDQUFBZixJQUFBLENBQUE7QUFDQSxnQkFBQXFNLE1BQUEsT0FBQSxDQURBO0FBRUEsY0FBQSxXQUZBO0FBR0EsZUFBQSxrQkFBQTtBQUNBaFQsYUFBQTRTLElBQUE7QUFDQUUsY0FBQSxTQUFBLElBQUEsQ0FBQTtBQUNBQSxjQUFBLE9BQUEsSUFBQSxDQUFBO0FBQ0FBLGNBQUEsT0FBQSxJQUFBLENBQUE7QUFDQTlOLFVBQUEsWUFBQSxFQUFBckQsSUFBQSxDQUFBK0MsR0FBQTNDLElBQUEsQ0FBQSxZQUFBLENBQUE7QUFDQXJCLGdCQUFBLE9BQUEsRUFBQSxhQUFBO0FBQ0EsTUFWQTtBQVdBLG1CQUFBLElBWEE7QUFZQSxtQkFBQTtBQVpBLEtBQUE7O0FBZUE7QUFDQXNFLFFBQUEsT0FBQSxFQUFBckQsSUFBQSxDQUFBLE1BQUFtUixRQUFBLE9BQUEsQ0FBQSxHQUFBLElBQUEsR0FBQXBPLEdBQUEzQyxJQUFBLENBQUEsWUFBQSxDQUFBO0FBQ0E7O0FBRUErUSxXQUFBLGNBQUEsSUFBQXhGLFNBQUEsQ0FBQSxJQUFBL00sT0FBQStNLFNBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLEdBQUEvTSxRQUFBOztBQUVBO0FBQ0EsR0EzREE7QUE0REEsRUEvREEsRUErREEsS0EvREEsQ0FBQTtBQWdFQSxDQXhFQTs7QUN4RUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQVIsSUFBQSxZQUFBLElBQUF1QixFQUFBbVIsUUFBQSxFQUFBOztBQUVBUSxRQUFBQyxJQUFBLENBQUE7QUFDQUMsVUFBQSxLQURBO0FBRUFDLFNBQUE7QUFDQUMsWUFBQSxDQUNBLGdCQURBO0FBRUE7QUFDQTtBQUNBLGtCQUpBO0FBREEsRUFGQTtBQVVBQyxTQUFBO0FBQ0FELFlBQUEsQ0FDQSxhQURBLENBREE7QUFJQUUsUUFBQSxDQUNBLG9GQURBO0FBSkEsRUFWQTtBQWtCQUMsU0FBQSxrQkFBQTtBQUNBelQsTUFBQSxZQUFBLEVBQUE4UyxPQUFBOztBQUVBdlIsSUFBQSxZQUFBO0FBQ0ExQixPQUFBTCxLQUFBLENBQUF5TSxNQUFBO0FBQ0EsR0FGQTtBQUdBO0FBeEJBLENBQUE7O0FDUkE7QUFDQTtBQUNBOztBQUVBekwsT0FBQWtULE1BQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLDJGQUFBbFIsS0FBQSxDQUFBLEdBQUEsQ0FEQTtBQUVBLGdCQUFBLGtEQUFBQSxLQUFBLENBQUEsR0FBQSxDQUZBO0FBR0EsYUFBQSxpRkFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FIQTtBQUlBLGtCQUFBLDhCQUFBQSxLQUFBLENBQUEsR0FBQSxDQUpBO0FBS0EsZ0JBQUEseUJBQUFBLEtBQUEsQ0FBQSxHQUFBLENBTEE7QUFNQSxtQkFBQTtBQUNBLFFBQUEsT0FEQTtBQUVBLFNBQUEsVUFGQTtBQUdBLE9BQUEsWUFIQTtBQUlBLFFBQUEsdUJBSkE7QUFLQSxTQUFBLGtDQUxBO0FBTUEsVUFBQTtBQU5BLEVBTkE7QUFjQSxhQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEsYUFBQSxhQUZBO0FBR0EsY0FBQSxTQUhBO0FBSUEsYUFBQSxZQUpBO0FBS0EsY0FBQSxTQUxBO0FBTUEsY0FBQTtBQU5BLEVBZEE7QUFzQkEsaUJBQUE7QUFDQSxZQUFBLFVBREE7QUFFQSxVQUFBLFVBRkE7QUFHQSxPQUFBLGlCQUhBO0FBSUEsT0FBQSxXQUpBO0FBS0EsUUFBQSxZQUxBO0FBTUEsT0FBQSxVQU5BO0FBT0EsUUFBQSxVQVBBO0FBUUEsT0FBQSxRQVJBO0FBU0EsUUFBQSxTQVRBO0FBVUEsT0FBQSxRQVZBO0FBV0EsUUFBQSxVQVhBO0FBWUEsT0FBQSxRQVpBO0FBYUEsUUFBQTtBQWJBLEVBdEJBO0FBcUNBLGlCQUFBLFVBckNBO0FBc0NBLFlBQUE7QUF0Q0EsQ0FBQSIsImZpbGUiOiJsaXN0YS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGxpc3RhIGRlIHRhcmVmYXMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gVG9kYXMgYXMgaW5mb3JtYcOnw7VlcyBmaWNhbSBndWFyZGFkYXMgZGVudHJvIGRvIG9iamV0byBcIkxpc3RhXCIsXG4vLyBlbSB1bSBkb3Mgc2V1cyA0IG7Ds3NcbmxldCBMaXN0YSA9IFsgXTtcbkxpc3RhLkVkaWNhbyA9IHsgfTtcbkxpc3RhLlBsYWNhciA9IFsgXTtcbkxpc3RhLlRhcmVmYXMgPSBbIF07XG5MaXN0YS5Vc3VhcmlvID0geyB9O1xuXG4vLyBcImFwcFwiIGd1YXJkYSBvcyBtw6l0b2RvcyBlc3BlY8OtZmljb3MgZG8gZnVuY2lvbmFtZW50byBkYSBMaXN0YSxcbi8vIFwiJGFwcFwiIGd1YXJkYSBhcyByZWZlcsOqbmNpYXMgalF1ZXJ5IGFvIERPTSB1c2FkYXMgbmVzc2VzIG3DqXRvZG9zXG5sZXQgYXBwID0gWyBdO1xubGV0ICRhcHAgPSBbIF07XG5cbmxldCBjYWNoZSA9IFsgXTtcbmNhY2hlW1widGFyZWZhc1wiXSA9IFsgXTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5sZXQgY3VlID0gWyBdO1xubGV0IHdvcmtlciA9IFsgXTtcbmxldCB0aW1pbmcgPSBbIF07XG5cbi8vIFNlIG8gbG9nZ2luZyBlc3RpdmVyIGxpZ2FkbywgcmVsYXRhIGNhZGEgcGFzc28gbm8gY29uc29sZVxuLy8gT2JzOiBuZW0gdG9kb3Mgb3MgbcOpdG9kb3MgZXN0w6NvIGNvbSBsb2dzIGNyaWFkb3Mgb3UgZGV0YWxoYWRvcyFcbmxldCBsb2dnaW5nID0gZmFsc2U7XG5sZXQgbG9nID0gZnVuY3Rpb24obWVzc2FnZSwgdHlwZSkge1xuXHRpZiAobG9nZ2luZykge1xuXHRcdC8vIEluc2VyZSBhIGhvcmEgbm8gbG9nXG5cdFx0bGV0IHRpbWVzdGFtcCA9IG1vbWVudCgpLmZvcm1hdChcIkxUU1wiKTtcblx0XHRtZXNzYWdlID0gXCJbXCIgKyB0aW1lc3RhbXAgKyBcIl0gXCIgKyBtZXNzYWdlO1xuXG5cdFx0aWYgKCF0eXBlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZVt0eXBlXShtZXNzYWdlKTtcblx0XHR9XG5cdH1cbn1cblxubGV0IGFuYWx5dGljcyA9IGZ1bmN0aW9uKGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsKSB7XG5cdGlmICh0eXBlb2YgZ2EgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRnYShcInNlbmRcIiwgXCJldmVudFwiLCBjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCk7XG5cdH1cbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gZGFxdWkgcHJhIGJhaXhvIG7Do28gw6kgcHJhIHRlciBuYWRhISFcblxudmFyIHRhcmVmYV9hY3RpdmU7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvIHV0aWxpdGllcyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFTDrXR1bG8gZSBjb3IgZG8gdGVtYVxuVUkuZGF0YVtcInRoZW1lLWNvbG9yXCJdID0gWyBdO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQkdWlbXCJ0aXRsZVwiXSA9ICQoXCJoZWFkIHRpdGxlXCIpO1xuXHRVSS5kYXRhW1widGl0bGVcIl0gPSAkdWlbXCJ0aXRsZVwiXS5odG1sKCk7XG5cblx0JHVpW1widGhlbWUtY29sb3JcIl0gPSAkKFwibWV0YVtuYW1lPSd0aGVtZS1jb2xvciddXCIpO1xuXHRVSS5kYXRhW1widGhlbWUtY29sb3JcIl1bXCJvcmlnaW5hbFwiXSA9ICR1aVtcInRoZW1lLWNvbG9yXCJdLmF0dHIoXCJjb250ZW50XCIpO1xufSk7XG5cbi8vIFRpcG8gZGUgaW50ZXJhw6fDo28gKHRvdWNoIG91IHBvaW50ZXIpXG5VSS5kYXRhW1wiaW50ZXJhY3Rpb24tdHlwZVwiXSA9IChcIm9udG91Y2hzdGFydFwiIGluIHdpbmRvdyB8fCBuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyk/IFwidG91Y2hcIiA6IFwicG9pbnRlclwiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gUHJvcHJpZWRhZGVzIGRhIGphbmVsYSBlIGRvIGxheW91dFxuVUkuZGF0YVtcImNvbHVtbi13aWR0aFwiXSA9IDMxNjsgLy8gTGFyZ3VyYSBkYSBjb2x1bmEsIGluY2x1aW5kbyBtYXJnZW1cblVJLmRhdGFbXCJ3aW5kb3dcIl0gPSBbIF07XG5cbmZ1bmN0aW9uIHNldExheW91dFByb3BlcnRpZXMoKSB7XG5cdC8vIERpbWVuc8O1ZXMgKGxhcmd1cmEgZSBhbHR1cmEpIGRhIGphbmVsYVxuXHRVSS5kYXRhW1wid2luZG93XCJdW1wid2lkdGhcIl0gPSAkdWlbXCJ3aW5kb3dcIl0ud2lkdGgoKTtcblx0VUkuZGF0YVtcIndpbmRvd1wiXVtcImhlaWdodFwiXSA9ICR1aVtcIndpbmRvd1wiXS5oZWlnaHQoKTtcblxuXHQvLyBDYWxjdWxhIG7Dum1lcm8gZGUgY29sdW5hc1xuXHRVSS5kYXRhW1wiY29sdW1uc1wiXSA9IE1hdGguZmxvb3IoVUkuZGF0YVtcIndpbmRvd1wiXVtcIndpZHRoXCJdIC8gVUkuZGF0YVtcImNvbHVtbi13aWR0aFwiXSk7XG5cblx0Ly8gQWRpY2lvbmEgY2xhc3NlIG5vIDxib2R5PiBkZSBhY29yZG8gY29tIGEgcXVhbnRpZGFkZSBkZSBjb2x1bmFzXG5cdGxldCBsYXlvdXRfY2xhc3M7XG5cdGlmIChVSS5kYXRhW1wiY29sdW1uc1wiXSA9PT0gMSkge1xuXHRcdGxheW91dF9jbGFzcyA9IFwidWktc2luZ2xlLWNvbHVtblwiO1xuXHR9IGVsc2UgaWYgKFVJLmRhdGFbXCJjb2x1bW5zXCJdID09PSAyKSB7XG5cdFx0bGF5b3V0X2NsYXNzID0gXCJ1aS1kdWFsLWNvbHVtblwiO1xuXHR9IGVsc2Uge1xuXHRcdGxheW91dF9jbGFzcyA9IFwidWktbXVsdGktY29sdW1uXCI7XG5cdH1cblxuXHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwidWktc2luZ2xlLWNvbHVtbiB1aS1kdWFsLWNvbHVtbiB1aS1tdWx0aS1jb2x1bW5cIikuYWRkQ2xhc3MobGF5b3V0X2NsYXNzKTtcbn1cblxuZnVuY3Rpb24gZ2V0U2Nyb2xsYmFyU2l6ZSgpIHtcblx0Ly8gRGVzY29icmUgbyB0YW1hbmhvIGRhIGJhcnJhIGRlIHJvbGFnZW1cblx0bGV0ICRvdXRlckNvbnRhaW5lciA9ICQoXCI8ZGl2IC8+XCIpLmNzcyh7XG5cdFx0XCJvdmVyZmxvd1wiOiBcInNjcm9sbFwiLFxuXHRcdFwiZGlzcGxheVwiOiBcIm5vbmVcIlxuXHR9KS5hcHBlbmRUbygkdWlbXCJib2R5XCJdKTtcblx0bGV0ICRpbm5lckNvbnRhaW5lciA9ICQoXCI8ZGl2IC8+XCIpLmFwcGVuZFRvKCRvdXRlckNvbnRhaW5lcik7XG5cblx0VUkuZGF0YVtcInNjcm9sbGJhci1zaXplXCJdID0gJG91dGVyQ29udGFpbmVyLndpZHRoKCkgLSAkaW5uZXJDb250YWluZXIud2lkdGgoKTtcblx0JG91dGVyQ29udGFpbmVyLnJlbW92ZSgpO1xufVxuXG4vLyBBcyBwcm9wcmllZGFkZXMgZGEgamFuZWxhIGUgZG8gbGF5b3V0IHPDo28gY2FsY3VsYWRhc1xuLy8gcXVhbmRvIGEgcMOhZ2luYSDDqSBjYXJyZWdhZGEgZSBxdWFuZG8gYSBqYW5lbGEgw6kgcmVkaW1lbnNpb25hZGEuXG4vLyBPIHRhbWFuaG8gZGEgYmFycmEgZGUgcm9sYWdlbSDDqSBjYWxjdWxhZG8gc29tZW50ZSBxdWFuZG8gYSBww6FnaW5hIMOpIGNhcnJlZ2FkYVxuJChmdW5jdGlvbigpIHsgc2V0TGF5b3V0UHJvcGVydGllcygpOyBnZXRTY3JvbGxiYXJTaXplKCk7IH0pO1xuJHVpW1wid2luZG93XCJdLm9uKFwicmVzaXplXCIsIHNldExheW91dFByb3BlcnRpZXMpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gUHJvcHJpZWRhZGVzIChwb3Npw6fDo28gbm8gdG9wbyBlIG5vIGZpbSBkYSBqYW5lbGEpIGRvIHNjcm9sbFxuVUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXSA9IFsgXTtcblxuZnVuY3Rpb24gc2V0U2Nyb2xsUG9zaXRpb24oKSB7XG5cdFVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl1bXCJ0b3BcIl0gPSAkdWlbXCJ3aW5kb3dcIl0uc2Nyb2xsVG9wKCk7XG5cdFVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl1bXCJib3R0b21cIl0gPSBVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1widG9wXCJdICsgVUkuZGF0YVtcIndpbmRvd1wiXVtcImhlaWdodFwiXTtcbn1cblxuLy8gQXMgcHJvcHJpZWRhZGVzIGRvIHNjcm9sbCBzw6NvIGNhbGN1bGFkYXMgcXVhbmRvIGEgcMOhZ2luYSDDqSBjYXJyZWdhZGFcbi8vIGUgcXVhbmRvIGEgamFuZWxhIMOpIHJlZGltZW5zaW9uYWRhIG91IFwic2Nyb2xsYWRhXCJcbiQoZnVuY3Rpb24oKSB7IHNldFNjcm9sbFBvc2l0aW9uKCk7IH0pO1xuJHVpW1wid2luZG93XCJdLm9uKFwic2Nyb2xsIHJlc2l6ZVwiLCBzZXRTY3JvbGxQb3NpdGlvbik7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB0ZW1wbGF0ZSBlbmdpbmUgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmxldCAkdGVtcGxhdGVzID0geyB9O1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQvLyBQZWdhIG9zIHRlbXBsYXRlcyBkbyBIVE1MLFxuXHQvLyBndWFyZGEgZW0gJHRlbXBsYXRlc1xuXHQvLyBlIHJlbW92ZSBlbGVzIGRvIGPDs2RpZ28tZm9udGVcblx0JChcInRlbXBsYXRlXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0bGV0ICR0aGlzID0gJCh0aGlzKTtcblx0XHRsZXQgbmFtZSA9ICR0aGlzLmF0dHIoXCJpZFwiKTtcblx0XHRsZXQgaHRtbCA9ICR0aGlzLmh0bWwoKTtcblxuXHRcdCR0ZW1wbGF0ZXNbbmFtZV0gPSAkKGh0bWwpO1xuXHRcdCR0aGlzLnJlbW92ZSgpO1xuXHR9KTtcbn0pO1xuXG5mdW5jdGlvbiBfX3JlbmRlcih0ZW1wbGF0ZSwgZGF0YSkge1xuXHQvLyBTZSB0ZW1wbGF0ZSBuw6NvIGV4aXN0aXIsIGFib3J0YVxuXHRpZiAoISR0ZW1wbGF0ZXNbdGVtcGxhdGVdKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyICRyZW5kZXIgPSAkdGVtcGxhdGVzW3RlbXBsYXRlXS5jbG9uZSgpO1xuXG5cdCRyZW5kZXIuZGF0YShkYXRhKTtcblxuXHQkLmZuLmZpbGxCbGFua3MgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgJGJsYW5rID0gJCh0aGlzKTtcblx0XHR2YXIgZmlsbCA9ICRibGFuay5kYXRhKFwiZmlsbFwiKTtcblxuXHRcdHZhciBydWxlcyA9IGZpbGwuc3BsaXQoXCIsXCIpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBwYWlyID0gcnVsZXNbaV0uc3BsaXQoXCI6XCIpO1xuXHRcdFx0dmFyIGRlc3QgPSAocGFpclsxXT8gcGFpclswXS50cmltKCkgOiBcImh0bWxcIik7XG5cdFx0XHR2YXIgc291cmNlID0gKHBhaXJbMV0/IHBhaXJbMV0udHJpbSgpIDogcGFpclswXSk7XG5cdFx0XHR2YXIgdmFsdWUgPSBkYXRhW3NvdXJjZV07XG5cblx0XHRcdC8vIFRPRE9cblx0XHRcdC8vIHNvdXJjZSA9IHNvdXJjZS5zcGxpdChcIi9cIik7XG5cdFx0XHQvLyBpZiAoc291cmNlLmxlbmd0aCA+IDEpIHtcblx0XHRcdC8vIFx0Ly8gdmFsdWUgPSBkYXRhW3NvdXJjZVswXV07XG5cdFx0XHQvLyBcdC8vIGNvbnNvbGUubG9nKHNvdXJjZSwgc291cmNlLCB2YWx1ZSk7XG5cdFx0XHQvLyBcdC8vIGlmICh0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdC8vIFx0XHRmb3IgKHZhciBqID0gMDsgaiA8PSBzb3VyY2UubGVuZ3RoOyBqKyspIHtcblx0XHRcdC8vIFx0XHRcdGNvbnNvbGUubG9nKHZhbHVlLCBzb3VyY2UsIGRhdGFbc291cmNlWzBdXSk7XG5cdFx0XHQvLyBcdFx0XHRpZiAodmFsdWUgJiYgdmFsdWVbc291cmNlXSAmJiBzb3VyY2Vbal0gJiYgdmFsdWVbc291cmNlW2pdXSkge1xuXHRcdFx0Ly8gXHRcdFx0XHR2YWx1ZSA9ICh2YWx1ZVtzb3VyY2Vbal1dKT8gdmFsdWVbc291cmNlW2pdXSA6IG51bGw7XG5cdFx0XHQvLyBcdFx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gXHRcdFx0XHR2YWx1ZSA9IG51bGw7XG5cdFx0XHQvLyBcdFx0XHR9XG5cdFx0XHQvLyBcdFx0fVxuXHRcdFx0Ly8gXHQvLyB9XG5cdFx0XHQvLyB9XG5cblx0XHRcdGlmICh0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIgJiYgdmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0aWYgKGRlc3QgPT09IFwiY2xhc3NcIikge1xuXHRcdFx0XHRcdCRibGFuay5hZGRDbGFzcyh2YWx1ZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZGVzdCA9PT0gXCJodG1sXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsuaHRtbCh2YWx1ZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZGVzdCA9PT0gXCJ2YWx1ZVwiKSB7XG5cdFx0XHRcdFx0JGJsYW5rLnZhbCh2YWx1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JGJsYW5rLmF0dHIoZGVzdCwgdmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgaWZfbnVsbCA9ICRibGFuay5kYXRhKFwiZmlsbC1udWxsXCIpO1xuXHRcdFx0XHRpZiAoaWZfbnVsbCA9PT0gXCJoaWRlXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsuaGlkZSgpO1xuXHRcdFx0XHR9IGVsc2UgaWYoaWZfbnVsbCA9PT0gXCJyZW1vdmVcIikge1xuXHRcdFx0XHRcdCRibGFuay5yZW1vdmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdCRibGFua1xuXHRcdFx0LnJlbW92ZUNsYXNzKFwiZmlsbFwiKVxuXHRcdFx0LnJlbW92ZUF0dHIoXCJkYXRhLWZpbGxcIilcblx0XHRcdC5yZW1vdmVBdHRyKFwiZGF0YS1maWxsLW51bGxcIik7XG5cdH07XG5cblx0aWYgKCRyZW5kZXIuaGFzQ2xhc3MoXCJmaWxsXCIpKSB7XG5cdFx0JHJlbmRlci5maWxsQmxhbmtzKCk7XG5cdH1cblxuXHQkKFwiLmZpbGxcIiwgJHJlbmRlcikuZWFjaChmdW5jdGlvbigpIHtcblx0XHQkKHRoaXMpLmZpbGxCbGFua3MoKTtcblx0fSk7XG5cblx0cmV0dXJuICRyZW5kZXI7XG59XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyByb3V0ZXIgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG52YXIgcm91dGVyID0gWyBdO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBuYXZpZ2F0aW9uIG1vZGVcbnJvdXRlcltcInBhdGhcIl0gPSBsb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIik7XG5cbmlmIChyb3V0ZXJbXCJwYXRoXCJdWzFdID09PSBcInRhcmVmYXNcIikge1xuXHRyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPSBcInBhdGhcIjtcbn0gZWxzZSB7XG5cdHJvdXRlcltcIm5hdmlnYXRpb24tbW9kZVwiXSA9IFwiaGFzaFwiO1xuXHRyb3V0ZXJbXCJwYXRoXCJdID0gbG9jYXRpb24uaGFzaC5zcGxpdChcIi9cIik7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGdvXG5yb3V0ZXJbXCJnb1wiXSA9IGZ1bmN0aW9uKHBhdGgsIG9iamVjdCwgdGl0bGUpIHtcblx0aWYgKHJvdXRlcltcIm5hdmlnYXRpb24tbW9kZVwiXSA9PT0gXCJwYXRoXCIpIHtcblx0XHRoaXN0b3J5LnB1c2hTdGF0ZShvYmplY3QsIHRpdGxlLCBwYXRoKTtcblx0fSBlbHNlIHtcblx0XHRoaXN0b3J5LnB1c2hTdGF0ZShvYmplY3QsIHRpdGxlLCBcIiNcIiArIHBhdGgpO1xuXHRcdC8vIGxvY2F0aW9uLmhhc2ggPSBwYXRoO1xuXHR9XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBidWlsZCBsaW5rXG5yb3V0ZXJbXCJidWlsZC1saW5rXCJdID0gZnVuY3Rpb24ocGF0aCkge1xuXHR2YXIgbGluaztcblx0aWYgKHJvdXRlcltcIm5hdmlnYXRpb24tbW9kZVwiXSA9PT0gXCJwYXRoXCIpIHtcblx0XHRsaW5rID0gcGF0aDtcblx0fSBlbHNlIHtcblx0XHRsaW5rID0gXCIjXCIgKyBwYXRoO1xuXHR9XG5cblx0cmV0dXJuIGxpbms7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB2aWV3IG1hbmFnZXJcbnJvdXRlcltcImN1cnJlbnQtdmlld1wiXSA9IFtcImhvbWVcIl07XG5yb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0gPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0YWRkOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0ucHVzaCh2aWV3KTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSk7XG5cdFx0fSxcblx0XHRyZW1vdmU6IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHRcdHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSA9ICQuZ3JlcChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0sIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZSAhPT0gdmlldztcblx0XHRcdH0pO1xuXHRcdFx0Ly8gY29uc29sZS5sb2cocm91dGVyW1wiY3VycmVudC12aWV3XCJdKTtcblx0XHR9LFxuXHRcdHJlcGxhY2U6IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHRcdHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSA9IFsgXTtcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5hZGQodmlldyk7XG5cdFx0fVxuXHR9O1xufSkoKTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdC8vIGNvbnNvbGUubG9nKFwibG9jYXRpb246IFwiICsgZG9jdW1lbnQubG9jYXRpb24gKyBcIiwgc3RhdGU6IFwiICsgSlNPTi5zdHJpbmdpZnkoZXZlbnQuc3RhdGUpKTtcblxuXHR2YXIgc3RhdGUgPSBldmVudC5zdGF0ZTtcblxuXHRpZiAoc3RhdGUgJiYgc3RhdGVbXCJ2aWV3XCJdID09PSBcInRhcmVmYVwiKSB7XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwiYm90dG9tc2hlZXRcIikgPiAtMSkgeyBVSS5ib3R0b21zaGVldC5jbG9zZSgpOyB9XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwibmV3LXBvc3RcIikgPiAtMSkgeyBhcHAuUG9zdC5jbG9zZSgpOyB9XG5cdFx0YXBwLlRhcmVmYS5vcGVuKHN0YXRlW1wiaWRcIl0pO1xuXHR9XG5cblx0ZWxzZSBpZiAoc3RhdGUgJiYgc3RhdGVbXCJ2aWV3XCJdID09PSBcIm5ldy1wb3N0XCIpIHtcblx0XHQvLyBhcHAuUG9zdC5vcGVuKHN0YXRlW1widHlwZVwiXSwgc3RhdGVbXCJpZFwiXSk7XG5cdH1cblxuXHRlbHNlIGlmIChzdGF0ZSAmJiBzdGF0ZVtcInZpZXdcIl0gPT09IFwiYm90dG9tc2hlZXRcIikge1xuXHRcdGlmIChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0uaW5kZXhPZihcIm5ldy1wb3N0XCIpID4gLTEpIHsgYXBwLlBvc3QuY2xvc2UoKTsgfVxuXHR9XG5cbi8vXHRpZiAoc3RhdGVbXCJ2aWV3XCJdID09PSBcImhvbWVcIikge1xuXHRlbHNlIHtcblx0XHRpZiAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLmluZGV4T2YoXCJib3R0b21zaGVldFwiKSA+IC0xKSB7IFVJLmJvdHRvbXNoZWV0LmNsb3NlKCk7IH1cblx0XHRpZiAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLmluZGV4T2YoXCJuZXctcG9zdFwiKSA+IC0xKSB7IGFwcC5Qb3N0LmNsb3NlKCk7IH1cblx0XHRhcHAuVGFyZWZhLmNsb3NlKCk7XG5cdH1cblxufSk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHN0YXRlczpcbi8vICogdGFyZWZhXG4vLyAqIGhvbWVcbi8vICogbmV3LXBvc3Rcbi8vICogYm90dG9tc2hlZXRcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmxldCBVSSA9IHsgfVxuVUkuZGF0YSA9IFsgXTtcblxubGV0ICR1aSA9IFsgXTtcbiR1aVtcIndpbmRvd1wiXSA9ICQod2luZG93KTtcbiR1aVtcImJvZHlcIl0gPSAkKGRvY3VtZW50LmJvZHkpO1xuXG4vLyBQZWdhIG8gdMOtdHVsbyBkYSBww6FnaW5hIChcIkxpc3RhIGRlIFRhcmVmYXNcIilcbi8vIGUgZ3VhcmRhIHByYSBxdWFuZG8gZm9yIG5lY2Vzc8OhcmlvIHJlY3VwZXJhclxuJHVpW1wicGFnZS10aXRsZVwiXSA9ICQoXCJoZWFkIHRpdGxlXCIpO1xuVUkuZGF0YVtcInBhZ2UtdGl0bGVcIl0gPSAkdWlbXCJwYWdlLXRpdGxlXCJdLnRleHQoKTtcblxuLy8gJHVpW1wid2luZG93XCJdXG4vLyAkdWlbXCJ0aXRsZVwiXVxuLy8gJHVpW1wiYm9keVwiXVxuLy8gJHVpW1wiYXBwYmFyXCJdXG4vLyAkdWlbXCJsb2FkYmFyXCJdXG4vLyAkdWlbXCJzaWRlbmF2XCJdXG4vLyAkdWlbXCJib3R0b21zaGVldFwiXVxuLy8gJHVpW1widG9hc3RcIl1cbi8vICR1aVtcImJhY2tkcm9wXCJdXG4vLyAkdWlbXCJmb290ZXJcIl1cbi8vICR1aVtcInBhZ2UtdGl0bGVcIl1cblxuLy8gRGFkb3MgZGVmaW5pZG9zOlxuLy8gVUkuZGF0YVtcImNvbHVtbi13aWR0aFwiXVxuXG4vLyBEYWRvcyBjb25zdWx0w6F2ZWlzOlxuLy8gVUkuZGF0YVtcIndpbmRvd1wiXVtcIndpZHRoXCJdXG4vLyBVSS5kYXRhW1wid2luZG93XCJdW1wiaGVpZ2h0XCJdXG4vLyBVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1widG9wXCJdXG4vLyBVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1wiYm90dG9tXCJdXG4vLyBVSS5kYXRhW1wiY29sdW1uc1wiXVxuLy8gVUkuZGF0YVtcImludGVyYWN0aW9uLXR5cGVcIl1cbi8vIFVJLmRhdGFbXCJ0aGVtZS1jb2xvclwiXVtcIm9yaWdpbmFsXCJdXG4vLyBVSS5kYXRhW1widGl0bGVcIl1cbi8vIFVJLmRhdGFbXCJzY3JvbGxiYXItc2l6ZVwiXVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gRnVuw6fDo28gcGFyYSBmb3LDp2FyIHJlZmxvd1xuJC5mbi5yZWZsb3cgPSBmdW5jdGlvbigpIHtcblx0bGV0IG9mZnNldCA9ICR1aVtcImJvZHlcIl0ub2Zmc2V0KCkubGVmdDtcblx0cmV0dXJuICQodGhpcyk7XG59O1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgLyBib2R5IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gVUkuYm9keS5sb2NrKClcbi8vIFVJLmJvZHkudW5sb2NrKClcblxuVUkuYm9keSA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQvLyB1aVtcImJvZHlcIl0gw6kgZGVmaW5pZG8gbm8gZG9jdW1lbnQuanNcblx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwidWktXCIgKyBVSS5kYXRhW1wiaW50ZXJhY3Rpb24tdHlwZVwiXSk7XG5cdFx0c2Nyb2xsU3RhdHVzKCk7XG5cdH0pO1xuXG5cdCR1aVtcIndpbmRvd1wiXS5vbihcInNjcm9sbFwiLCBzY3JvbGxTdGF0dXMpO1xuXG5cdGZ1bmN0aW9uIHNjcm9sbFN0YXR1cygpIHtcblx0XHR2YXIgeSA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblxuXHRcdGlmICh5ID4gMSkge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInNjcm9sbC10b3BcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJzY3JvbGwtdG9wXCIpO1xuXHRcdH1cblxuXHRcdGlmICh5ID4gNTYpIHtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJsaXZlc2l0ZS1ibHVyXCIpLnJlbW92ZUNsYXNzKFwibGl2ZXNpdGUtZm9jdXNcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJsaXZlc2l0ZS1mb2N1c1wiKS5yZW1vdmVDbGFzcyhcImxpdmVzaXRlLWJsdXJcIik7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIFVJLmJvZHkubG9jaygpXG5cdFx0bG9jazogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwibm8tc2Nyb2xsXCIpLmNzcyhcIm1hcmdpbi1yaWdodFwiLCBVSS5kYXRhW1wic2Nyb2xsYmFyLXNpemVcIl0pO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIFVJLmJvZHkudW5sb2NrKClcblx0XHR1bmxvY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcIm5vLXNjcm9sbFwiKS5jc3MoXCJtYXJnaW4tcmlnaHRcIiwgMCk7XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8gbG9hZGJhciAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFVJLmxvYWRiYXIuc2hvdygpXG4vLyBVSS5sb2FkYmFyLmhpZGUoKVxuXG5VSS5sb2FkYmFyID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcImxvYWRiYXJcIl0gPSAkKFwiLnVpLWxvYWRiYXJcIik7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJsb2FkYmFyXCJdLmFkZENsYXNzKFwiaW5cIik7XG5cdFx0fSxcblx0XHRoaWRlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRpbWluZ1tcImhpZGUtbG9hZGJhclwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR1aVtcImxvYWRiYXJcIl1cblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoXCJmYWRlLWluXCIpXG5cdFx0XHRcdFx0Lm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQkdWlbXCJsb2FkYmFyXCJdLnJlbW92ZUNsYXNzKFwiaW5cIik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9LCA4MDApO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvIGJhY2tkcm9wIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBVSS5iYWNrZHJvcC5zaG93KClcbi8vIFVJLmJhY2tkcm9wLmhpZGUoKVxuXG5VSS5iYWNrZHJvcCA9IChmdW5jdGlvbigpIHtcblx0JHVpW1wiYmFja2Ryb3BcIl0gPSBbIF07XG5cblx0JChmdW5jdGlvbigpIHtcblx0XHQvLyAkdWlbXCJiYWNrZHJvcFwiXSA9ICQoXCIuanMtdWktYmFja2Ryb3BcIik7XG5cdFx0Ly8gJHVpW1wiYmFja2Ryb3BcIl0ub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcblx0XHQvLyBcdCR1aVtcImJhY2tkcm9wXCJdLnRyaWdnZXIoXCJoaWRlXCIpO1xuXHRcdC8vIH0pO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdHNob3c6IGZ1bmN0aW9uKCRzY3JlZW4sIGV2ZW50cykge1xuXHRcdFx0dmFyIHNjcmVlbiA9ICRzY3JlZW5bXCJzZWxlY3RvclwiXTtcblx0XHRcdHZhciB6aW5kZXggPSAkc2NyZWVuLmNzcyhcInotaW5kZXhcIikgLSAxO1xuXG5cdFx0XHQkdWlbXCJiYWNrZHJvcFwiXVtzY3JlZW5dID0gX19yZW5kZXIoXCJiYWNrZHJvcFwiKTtcblxuXHRcdFx0JC5lYWNoKGV2ZW50cywgZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcblx0XHRcdFx0JHVpW1wiYmFja2Ryb3BcIl1bc2NyZWVuXS5vbihldmVudCwgaGFuZGxlcilcblx0XHRcdH0pO1xuXG5cdFx0XHQkdWlbXCJiYWNrZHJvcFwiXVtzY3JlZW5dLmNzcyhcInotaW5kZXhcIiwgemluZGV4KVxuXHRcdFx0XHQub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgJCh0aGlzKS50cmlnZ2VyKFwiaGlkZVwiKTsgfSlcblx0XHRcdFx0LmFwcGVuZFRvKCR1aVtcImJvZHlcIl0pXG5cdFx0XHRcdC5hZGRDbGFzcyhcImluXCIpO1xuXHRcdH0sXG5cdFx0aGlkZTogZnVuY3Rpb24oJHNjcmVlbikge1xuXHRcdFx0dmFyIHNjcmVlbiA9ICRzY3JlZW5bXCJzZWxlY3RvclwiXTtcblx0XHRcdCR1aVtcImJhY2tkcm9wXCJdW3NjcmVlbl0ucmVtb3ZlQ2xhc3MoXCJpblwiKS5vZmYoXCJoaWRlXCIpLnJlbW92ZSgpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSBzaWRlbmF2IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblVJLnNpZGVuYXYgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wic2lkZW5hdlwiXSA9ICQoXCIuanMtdWktc2lkZW5hdlwiKTtcblxuXHRcdCQoXCIuanMtc2lkZW5hdi10cmlnZ2VyXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRVSS5zaWRlbmF2Lm9wZW4oKTtcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHRvcGVuOiBmdW5jdGlvbigpIHtcblx0XHRcdFVJLmJvZHkubG9jaygpO1xuXHRcdFx0VUkuYmFja2Ryb3Auc2hvdygkdWlbXCJzaWRlbmF2XCJdLCB7IFwiaGlkZVwiOiBVSS5zaWRlbmF2LmNsb3NlIH0pO1xuXHRcdFx0JHVpW1wic2lkZW5hdlwiXS5hZGRDbGFzcyhcImluXCIpO1xuXHRcdH0sXG5cdFx0Y2xvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wic2lkZW5hdlwiXS5yZW1vdmVDbGFzcyhcImluXCIpO1xuXHRcdFx0VUkuYmFja2Ryb3AuaGlkZSgkdWlbXCJzaWRlbmF2XCJdKTtcblx0XHRcdFVJLmJvZHkudW5sb2NrKCk7XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGJvdHRvbXNoZWV0XG5VSS5ib3R0b21zaGVldCA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblx0XHRvcGVuOiBmdW5jdGlvbigkY29udGVudCwgYWRkQ2xhc3MpIHtcblx0XHRcdFVJLmJhY2tkcm9wLnNob3coJHVpW1wiYm90dG9tc2hlZXRcIl0sIHsgXCJoaWRlXCI6IFVJLmJvdHRvbXNoZWV0LmNsb3NlIH0pO1xuXHRcdFx0JHVpW1wiYm90dG9tc2hlZXRcIl0uaHRtbCgkY29udGVudCkuYWRkQ2xhc3MoKGFkZENsYXNzPyBhZGRDbGFzcyArIFwiIFwiIDogXCJcIikgKyBcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIik7XG5cblx0XHRcdFVJLmRhdGFbXCJ0aGVtZS1jb2xvclwiXVtcImJ1ZmZlclwiXSA9ICR1aVtcInRoZW1lLWNvbG9yXCJdLmF0dHIoXCJjb250ZW50XCIpO1xuXHRcdFx0JHVpW1widGhlbWUtY29sb3JcIl0uYXR0cihcImNvbnRlbnRcIiwgXCIjMDAwXCIpO1xuXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0uYWRkKFwiYm90dG9tc2hlZXRcIik7XG5cdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZSh7IFwidmlld1wiOiBcImJvdHRvbXNoZWV0XCIgfSwgbnVsbCwgbnVsbCk7XG5cdFx0fSxcblx0XHRjbG9zZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJib3R0b21zaGVldFwiXS5yZW1vdmVDbGFzcyhcInNsaWRlXCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR1aVtcImJvdHRvbXNoZWV0XCJdLnJlbW92ZUNsYXNzKFwiaW5cIikuZW1wdHkoKS5hdHRyKFwiY2xhc3NcIiwgXCJ1aS1ib3R0b21zaGVldCBqcy11aS1ib3R0b21zaGVldFwiKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkdWlbXCJ0aGVtZS1jb2xvclwiXS5hdHRyKFwiY29udGVudFwiLCBVSS5kYXRhW1widGhlbWUtY29sb3JcIl1bXCJidWZmZXJcIl0pO1xuXG5cdFx0XHRVSS5iYWNrZHJvcC5oaWRlKCR1aVtcImJvdHRvbXNoZWV0XCJdKTtcblxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLnJlbW92ZShcImJvdHRvbXNoZWV0XCIpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCR1aVtcImJvdHRvbXNoZWV0XCJdID0gJChcIi5qcy11aS1ib3R0b21zaGVldFwiKTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgdG9hc3QgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5VSS50b2FzdCA9IChmdW5jdGlvbigpIHtcblx0JHVpW1widG9hc3RcIl0gPSBbIF07XG5cblx0JChmdW5jdGlvbigpIHtcblx0XHQkdWlbXCJ0b2FzdFwiXSA9ICQoXCIuanMtdWktdG9hc3RcIik7XG5cdFx0JHVpW1widG9hc3RcIl1bXCJtZXNzYWdlXCJdID0gJChcIi50b2FzdC1tZXNzYWdlXCIsICR1aVtcInRvYXN0XCJdKTtcblx0XHQkdWlbXCJ0b2FzdFwiXVtcImxhYmVsXCJdID0gJChcIi50b2FzdC1sYWJlbFwiLCAkdWlbXCJ0b2FzdFwiXSk7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0Ly8gVE9ETyBub3ZhIHNpbnRheGUsIHVzYXIgdGVtcGxhdGUgZSBfX3JlbmRlclxuXHRcdHNob3c6IGZ1bmN0aW9uKGNvbmZpZykge1xuXHRcdFx0bG9nKFwiVUkudG9hc3Quc2hvd1wiKTtcblx0XHRcdC8vIE9ww6fDtWVzOlxuXHRcdFx0Ly8g4oCiIFwibWVzc2FnZVwiIFtzdHJpbmddXG5cdFx0XHQvLyDigKIgXCJsYWJlbFwiIFtzdHJpbmddXG5cdFx0XHQvLyDigKIgXCJhY3Rpb25cIiBbZnVuY3Rpb25dXG5cdFx0XHQvLyDigKIgXCJwZXJzaXN0ZW50XCIgW2Jvb2xlYW5dXG5cdFx0XHQvLyDigKIgXCJ0aW1lb3V0XCIgW2ludGVnZXJdIGRlZmF1bHQ6IDYwMDBcblx0XHRcdC8vIOKAoiBcInN0YXJ0LW9ubHlcIiBbYm9vbGVhbl1cblxuXHRcdFx0aWYgKHR5cGVvZiBjb25maWcgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0JHVpW1widG9hc3RcIl0ucmVtb3ZlQ2xhc3MoXCJzdGFydC1vbmx5XCIpO1xuXG5cdFx0XHRcdC8vIFRleHRvIGRvIHRvYXN0XG5cdFx0XHRcdCR1aVtcInRvYXN0XCJdW1wibWVzc2FnZVwiXS5odG1sKGNvbmZpZ1tcIm1lc3NhZ2VcIl0gfHwgXCJcIik7XG5cblx0XHRcdFx0Ly8gVGV4dG8gZGEgYcOnw6NvXG5cdFx0XHRcdC8vIChTw7MgbW9zdHJhIGRlIHRleHRvIGUgYcOnw6NvIGVzdGl2ZXJlbSBkZWZpbmlkb3MpXG5cdFx0XHRcdGlmIChjb25maWdbXCJsYWJlbFwiXSAmJiBjb25maWdbXCJhY3Rpb25cIl0pIHtcblx0XHRcdFx0XHQkdWlbXCJ0b2FzdFwiXVtcImxhYmVsXCJdXG5cdFx0XHRcdFx0XHQuaHRtbChjb25maWdbXCJsYWJlbFwiXSlcblx0XHRcdFx0XHRcdC5vZmYoXCJjbGlja1wiKVxuXHRcdFx0XHRcdFx0Lm9uKFwiY2xpY2tcIiwgY29uZmlnW1wiYWN0aW9uXCJdKVxuXHRcdFx0XHRcdFx0LnNob3coKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkdWlbXCJ0b2FzdFwiXVtcImxhYmVsXCJdXG5cdFx0XHRcdFx0XHQuaGlkZSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0JHVpW1widG9hc3RcIl0uYWRkQ2xhc3MoXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlXCIpO1xuXHRcdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwidG9hc3QtYWN0aXZlXCIpO1xuXG5cdFx0XHRcdC8vIFRPRE86IC5mYWItYm90dG9tIHRyYW5zZm9ybTogdHJhbnNsYXRlWVxuXG5cdFx0XHRcdC8vIEFvIGNsaWNhciBubyB0b2FzdCwgZmVjaGEgZWxlXG5cdFx0XHRcdCR1aVtcInRvYXN0XCJdLm9uKFwiY2xpY2tcIiwgVUkudG9hc3QuZGlzbWlzcyk7XG5cdFx0XHRcdGNsZWFyVGltZW91dCh0aW1pbmdbXCJ0b2FzdFwiXSk7XG5cblx0XHRcdFx0Ly8gU2UgbsOjbyBmb3IgcGVyc2lzdGVudGUsXG5cdFx0XHRcdC8vIGZlY2hhIGRlcG9pcyBkZSB1bSB0ZW1wbyBkZXRlcm1pbmFkb1xuXHRcdFx0XHRpZiAoIWNvbmZpZ1tcInBlcnNpc3RlbnRcIl0pIHtcblx0XHRcdFx0XHR0aW1pbmdbXCJ0b2FzdFwiXSA9IHNldFRpbWVvdXQoVUkudG9hc3QuZGlzbWlzcywgKGNvbmZpZ1tcInRpbWVvdXRcIl0/IGNvbmZpZ1tcInRpbWVvdXRcIl0gOiA2MDAwKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBTZSBmb3IgcHJhIHNlciBleGliaWRvIHPDsyBuYSB0ZWxhIGluaWNpYWxcblx0XHRcdFx0aWYgKGNvbmZpZ1tcInN0YXJ0LW9ubHlcIl0pIHtcblx0XHRcdFx0XHQkdWlbXCJ0b2FzdFwiXS5hZGRDbGFzcyhcInN0YXJ0LW9ubHlcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFVJLnRvYXN0LnNob3coe1xuXHRcdFx0XHRcdFwibWVzc2FnZVwiOiBjb25maWdcblx0XHRcdFx0fSlcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZGlzbWlzczogZnVuY3Rpb24oKSB7XG5cdFx0XHRsb2coXCJVSS50b2FzdC5kaXNtaXNzXCIpO1xuXHRcdFx0JHVpW1widG9hc3RcIl0ucmVtb3ZlQ2xhc3MoXCJzbGlkZVwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwidG9hc3QtYWN0aXZlXCIpO1xuXHRcdFx0XHQkdWlbXCJ0b2FzdFwiXS5yZW1vdmVDbGFzcyhcImluIHN0YXJ0LW9ubHlcIik7XG5cblx0XHRcdFx0JHVpW1widG9hc3RcIl1bXCJtZXNzYWdlXCJdLmVtcHR5KCk7XG5cdFx0XHRcdCR1aVtcInRvYXN0XCJdW1wibGFiZWxcIl0uZW1wdHkoKTtcblx0XHRcdH0pO1xuXHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWluZ1tcInRvYXN0XCJdKTtcblx0XHR9LFxuXG5cdFx0Ly8gVE9ETyBERVBSRUNBVEVEXG5cdFx0b3BlbjogZnVuY3Rpb24obWVzc2FnZSwgYWN0aW9uLCBjYWxsYmFjaywgcGVyc2lzdGVudCkge1xuXHRcdC8vIG9wZW46IGZ1bmN0aW9uKG1lc3NhZ2UsIGFkZENsYXNzKSB7XG5cdFx0XHQkdWlbXCJ0b2FzdFwiXS5tZXNzYWdlLmh0bWwobWVzc2FnZSk7XG5cdFx0XHQkdWlbXCJ0b2FzdFwiXS5sYWJlbC5odG1sKChhY3Rpb24/IGFjdGlvbiA6IFwiXCIpKTtcblx0XHRcdCR1aVtcInRvYXN0XCJdLmFkZENsYXNzKFwiaW5cIikucmVmbG93KCkuYWRkQ2xhc3MoXCJzbGlkZVwiKTtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJ0b2FzdC1hY3RpdmVcIik7XG5cblx0XHRcdC8vIFRPRE86IC5mYWItYm90dG9tIHRyYW5zZm9ybTogdHJhbnNsYXRlWVxuXG5cdFx0XHQkdWlbXCJ0b2FzdFwiXS5vbihcImNsaWNrXCIsIFVJLnRvYXN0LmRpc21pc3MpO1xuXHRcdFx0JHVpW1widG9hc3RcIl0ubGFiZWwub24oXCJjbGlja1wiLCBjYWxsYmFjayk7XG5cblx0XHRcdGNsZWFyVGltZW91dCh0aW1pbmdbXCJ0b2FzdFwiXSk7XG5cblx0XHRcdGlmICghcGVyc2lzdGVudCkge1xuXHRcdFx0XHQkdWlbXCJ0b2FzdFwiXS5yZW1vdmVDbGFzcyhcInN0YXJ0LW9ubHlcIik7XG5cdFx0XHRcdHRpbWluZ1tcInRvYXN0LW9wZW5cIl0gPSBzZXRUaW1lb3V0KFVJLnRvYXN0LmRpc21pc3MsIDY1MDApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JHVpW1widG9hc3RcIl0uYWRkQ2xhc3MoXCJzdGFydC1vbmx5XCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn0pKCk7XG5cbi8vIHZhciB0b2FzdCA9IFVJLnRvYXN0O1xuLy8gdG9hc3QuY2xvc2UgPSBVSS50b2FzdC5kaXNtaXNzO1xuXG4vLyB2YXIgc25hY2tiYXIgPSB0b2FzdDtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwaSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gVE9ETyBsZWdhY3kgKGRldmUgZmljYXIgc8OzIGRlbnRybyBkYSBmdW7Dp8OjbyBhYmFpeG8pXG5sZXQgYXBpX2tleSA9IFwiMDYzYzcyYjJhZmM1MzMzZjNiMjdiMzY2YmRhYzllYjgxZDY0YmM2YTEyY2Q3YjNmNGI2YWRlNzdhMDkyYjYzYVwiO1xuXG5jb25zdCBMaXN0YUFQSSA9IChlbmRwb2ludCwgZGF0YSkgPT4ge1xuXHRsb2coXCJBUEkgUmVxdWVzdDogXCIgKyBlbmRwb2ludCwgXCJpbmZvXCIpO1xuXHRsZXQgYXBpX3VybCA9IFwiaHR0cHM6Ly9hcGkubGFndWluaG8ub3JnL2xpc3RhL1wiICsgZWRpY2FvO1xuXHRsZXQgYXBpX2tleSA9IFwiMDYzYzcyYjJhZmM1MzMzZjNiMjdiMzY2YmRhYzllYjgxZDY0YmM2YTEyY2Q3YjNmNGI2YWRlNzdhMDkyYjYzYVwiO1xuXG5cdGxldCByZXF1ZXN0ID0gJC5nZXRKU09OKGFwaV91cmwgKyBlbmRwb2ludCArIFwiP2tleT1cIiArIGFwaV9rZXkgKyBcIiZjYWxsYmFjaz0/XCIsIGRhdGEpO1xuXHRyZXR1cm4gcmVxdWVzdDtcbn07XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhcHAgcGxhY2FyIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmFwcC5QbGFjYXIgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wicGxhY2FyXCJdID0gJChcIi5qcy1hcHAtcGxhY2FyIHVsXCIpO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIFRPRE9cblx0XHR9LFxuXG5cdFx0dXBkYXRlOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIExpbXBhIG8gcGxhY2FyXG5cdFx0XHQkdWlbXCJwbGFjYXJcIl0uZW1wdHkoKTtcblxuXHRcdFx0Ly8gQ29uZmVyZSBxdWFsIGEgdHVybWEgY29tIG1haW9yIHBvbnR1YcOnw6NvXG5cdFx0XHQvLyBlIHNvbWEgYSBwb250dWHDp8OjbyBkZSBjYWRhIHR1cm1hIHBhcmEgb2J0ZXIgbyB0b3RhbCBkZSBwb250b3Ncblx0XHRcdGxldCBtYWlvcl9wb250dWFjYW8gPSAwO1xuXHRcdFx0bGV0IHRvdGFsX2RlX3BvbnRvcyA9IDA7XG5cblx0XHRcdExpc3RhLlBsYWNhci5mb3JFYWNoKGZ1bmN0aW9uKHR1cm1hKSB7XG5cdFx0XHRcdGxldCBwb250dWFjYW9fZGFfdHVybWEgPSB0dXJtYVtcInBvbnRvc1wiXTtcblxuXHRcdFx0XHRpZiAocG9udHVhY2FvX2RhX3R1cm1hID4gbWFpb3JfcG9udHVhY2FvKSB7XG5cdFx0XHRcdFx0bWFpb3JfcG9udHVhY2FvID0gcG9udHVhY2FvX2RhX3R1cm1hO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dG90YWxfZGVfcG9udG9zICs9IHBvbnR1YWNhb19kYV90dXJtYTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBDb20gb3MgZGFkb3MgYsOhc2ljb3MgY2FsY3VsYWRvcyxcblx0XHRcdC8vIGFkaWNpb25hIGFzIHR1cm1hcyBubyBwbGFjYXJcblx0XHRcdExpc3RhLlBsYWNhci5mb3JFYWNoKGZ1bmN0aW9uKHR1cm1hKSB7XG5cdFx0XHRcdC8vIENhbGN1bGEgJSBkYSB0dXJtYVxuXHRcdFx0XHQvLyBlbSByZWxhw6fDo28gw6AgdHVybWEgZGUgbWFpb3IgcG9udHVhw6fDo29cblx0XHRcdFx0bGV0IHBlcmNlbnR1YWxfZGFfdHVybWEgPSAodG90YWxfZGVfcG9udG9zID4gMD8gdHVybWFbXCJwb250b3NcIl0gLyBtYWlvcl9wb250dWFjYW8gOiAwKTtcblxuXHRcdFx0XHQvLyBGb3JtYXRhIG9zIGRhZG9zIHBhcmEgbyBwbGFjYXJcblx0XHRcdFx0dHVybWFbXCJ0dXJtYS1mb3JtYXRhZGFcIl0gPSB0dXJtYVtcInR1cm1hXCJdLnRvVXBwZXJDYXNlKCk7XG5cdFx0XHRcdHR1cm1hW1widGFtYW5oby1kYS1iYXJyYVwiXSA9IFwiaGVpZ2h0OiBcIiArIChwZXJjZW50dWFsX2RhX3R1cm1hICogMTAwKS50b0ZpeGVkKDMpICsgXCIlO1wiO1xuXHRcdFx0XHR0dXJtYVtcInBvbnR1YWNhby1mb3JtYXRhZGFcIl0gPSB0dXJtYVtcInBvbnRvc1wiXS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLlwiKTtcblxuXHRcdFx0XHRsZXQgJHR1cm1hID0gX19yZW5kZXIoXCJwbGFjYXItdHVybWFcIiwgdHVybWEpO1xuXHRcdFx0XHQkdWlbXCJwbGFjYXJcIl0uYXBwZW5kKCR0dXJtYSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKHRvdGFsX2RlX3BvbnRvcyA9PT0gMCkge1xuXHRcdFx0XHQkdWlbXCJwbGFjYXJcIl0uYWRkQ2xhc3MoXCJwbGFjYXItemVyYWRvXCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JHVpW1wicGxhY2FyXCJdLnJlbW92ZUNsYXNzKFwicGxhY2FyLXplcmFkb1wiKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhcHAgZXZvbHXDp8OjbyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5Fdm9sdWNhby5zdGFydCgpXG4vLyBhcHAuRXZvbHVjYW8udXBkYXRlKClcblxuLy8gVE9ET1xuLy8gLSBtb3N0cmFyIGNvbnRhZG9yIG5hcyDDumx0aW1hcyA0OCBob3Jhc1xuLy8gLSBvIHF1ZSBhY29udGVjZSBkZXBvaXMgZG8gZW5jZXJyYW1lbnRvP1xuLy8gICBiYXJyYSBmaWNhIGRhIGNvciBkYSB0dXJtYSBlIGFwYXJlY2UgbWVuc2FnZW0gZW0gY2ltYSBcIkVDMSBjYW1wZcOjXCJcblxuYXBwLkV2b2x1Y2FvID0gKGZ1bmN0aW9uKCkge1xuXHRsZXQgZHVyYWNhb190b3RhbDtcblxuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcImV2b2x1Y2FvXCJdID0gJChcIi5hcHAtZXZvbHVjYW9cIik7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuRXZvbHVjYW8uc3RhcnQoKVxuXHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdGxvZyhcImFwcC5Fdm9sdWNhby5zdGFydFwiLCBcImluZm9cIik7XG5cblx0XHRcdC8vIFBlZ2EgZGF0YSBkZSBpbsOtY2lvIGUgZGF0YSBkZSBlbmNlcnJhbWVudG9cblx0XHRcdGxldCBkaWFfaW5pY2lhbCA9IExpc3RhLkVkaWNhb1tcImluaWNpb1wiXSA9IG1vbWVudChMaXN0YS5FZGljYW9bXCJpbmljaW9cIl0pO1xuXHRcdFx0bGV0IGRpYV9maW5hbCA9IExpc3RhLkVkaWNhb1tcImZpbVwiXSA9IG1vbWVudChMaXN0YS5FZGljYW9bXCJmaW1cIl0pO1xuXG5cdFx0XHQvLyBDYWxjdWxhIG8gdGVtcG8gdG90YWwgKGVtIG1pbnV0b3MpXG5cdFx0XHRkdXJhY2FvX3RvdGFsID0gZGlhX2ZpbmFsLmRpZmYoZGlhX2luaWNpYWwsIFwibWludXRlc1wiKTtcblxuXHRcdFx0Ly8gSW5zZXJlIG9zIGRpYXMgbmEgYmFycmEsIGluZG8gZGUgZGlhIGVtIGRpYSBhdMOpIGNoZWdhciBhbyBlbmNlcnJhbWVudG9cblx0XHRcdGZvciAobGV0IGRpYSA9IGRpYV9pbmljaWFsLmNsb25lKCk7IGRpYS5pc0JlZm9yZShkaWFfZmluYWwpOyBkaWEuYWRkKDEsIFwiZGF5c1wiKSkge1xuXHRcdFx0XHQvLyBEZWZpbmUgaW7DrWNpbyBlIGZpbmFsIGRvIGRpYVxuXHRcdFx0XHQvLyBTZSBmaW5hbCBmb3IgYXDDs3MgYSBkYXRhIGRlIGVuY2VycmFtZW50bywgdXNhIGVsYSBjb21vIGZpbmFsXG5cdFx0XHRcdGxldCBpbmljaW9fZG9fZGlhID0gZGlhO1xuXHRcdFx0XHRsZXQgZmluYWxfZG9fZGlhID0gZGlhLmNsb25lKCkuZW5kT2YoXCJkYXlcIik7XG5cdFx0XHRcdGlmIChmaW5hbF9kb19kaWEuaXNBZnRlcihkaWFfZmluYWwpKSB7XG5cdFx0XHRcdFx0ZmluYWxfZG9fZGlhID0gZGlhX2ZpbmFsO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ2FsY3VsYSBhIGR1cmHDp8OjbyBkbyBkaWEgZW0gbWludXRvc1xuXHRcdFx0XHRsZXQgZHVyYWNhb19kb19kaWEgPSBmaW5hbF9kb19kaWEuZGlmZihpbmljaW9fZG9fZGlhLCBcIm1pbnV0ZXNcIik7XG5cblx0XHRcdFx0Ly8gRGVmaW5lIGEgZHVyYcOnw6NvIHBlcmNlbnR1YWwgZG8gZGlhIGVtIHJlbGHDp8OjbyBhbyB0b3RhbFxuXHRcdFx0XHRsZXQgcGVyY2VudHVhbF9kb19kaWEgPSBkdXJhY2FvX2RvX2RpYSAvIGR1cmFjYW9fdG90YWw7XG5cblx0XHRcdFx0Ly8gQ2FsY3VsYSBhIGxhcmd1cmEgZG8gZGlhIChkZSBhY29yZG8gY29tIGR1cmHDp8OjbyBwZXJjZW50dWFsKVxuXHRcdFx0XHQvLyBlIGluc2VyZSBkaWEgbmEgYmFycmEgZGUgZXZvbHXDp8Ojb1xuXHRcdFx0XHRsZXQgbGFyZ3VyYV9kb19kaWEgPSAocGVyY2VudHVhbF9kb19kaWEgKiAxMDApLnRvRml4ZWQoMyk7XG5cdFx0XHRcdGxldCAkZGlhID0gX19yZW5kZXIoXCJldm9sdWNhby1kaWFcIiwge1xuXHRcdFx0XHRcdGRpYTogZGlhLmZvcm1hdChcImRkZFwiKVxuXHRcdFx0XHR9KS5jc3MoXCJ3aWR0aFwiLCBsYXJndXJhX2RvX2RpYSArIFwiJVwiKTtcblxuXHRcdFx0XHQkKFwiLmRheS1sYWJlbHNcIiwgJHVpW1wiZXZvbHVjYW9cIl0pLmFwcGVuZCgkZGlhKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ29tIG9zIGRpYXMgaW5zZXJpZG9zIG5hIGJhcnJhIGRlIGV2b2x1w6fDo28sXG5cdFx0XHQvLyBkZXNlbmhhIGEgYmFycmEgZGUgdGVtcG8gdHJhbnNjb3JyaWRvXG5cdFx0XHRzZXRUaW1lb3V0KGFwcC5Fdm9sdWNhby51cGRhdGUsIDEwMDApO1xuXG5cdFx0XHQvLyBBdHVhbGl6YSBhIGxpbmhhIGRlIGV2b2x1w6fDo28gYSBjYWRhIFggbWludXRvc1xuXHRcdFx0dGltaW5nW1wiZXZvbHVjYW9cIl0gPSBzZXRJbnRlcnZhbChhcHAuRXZvbHVjYW8udXBkYXRlLCA2MCAqIDEwMDApO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Fdm9sdWNhby51cGRhdGUoKVxuXHRcdHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRsb2coXCJhcHAuRXZvbHVjYW8udXBkYXRlXCIsIFwiaW5mb1wiKTtcblxuXHRcdFx0Ly8gUGVnYSBhcyBkYXRhcyBlIGNhbGN1bGEgbyB0ZW1wbyAoZW0gbWludXRvcykgZSBwZXJjZW50dWFsIHRyYW5zY29ycmlkb3Ncblx0XHRcdGxldCBhZ29yYSA9IG1vbWVudCgpO1xuXHRcdFx0bGV0IGRpYV9pbmljaWFsID0gbW9tZW50KExpc3RhLkVkaWNhb1tcImluaWNpb1wiXSk7XG5cdFx0XHRsZXQgZGlhX2ZpbmFsID0gbW9tZW50KExpc3RhLkVkaWNhb1tcImZpbVwiXSk7XG5cblx0XHRcdGxldCB0ZW1wb190cmFuc2NvcnJpZG8gPSBhZ29yYS5kaWZmKGRpYV9pbmljaWFsLCBcIm1pbnV0ZXNcIik7XG5cdFx0XHRsZXQgcGVyY2VudHVhbF90cmFuc2NvcnJpZG8gPSAodGVtcG9fdHJhbnNjb3JyaWRvIDwgZHVyYWNhb190b3RhbCA/IHRlbXBvX3RyYW5zY29ycmlkbyAvIGR1cmFjYW9fdG90YWwgOiAxKTtcblxuXHRcdFx0Ly8gRGVmaW5lIGEgbGFyZ3VyYSBkYSBiYXJyYSBkZSBldm9sdcOnw6NvIGNvbXBsZXRhIGlndWFsIMOgIGxhcmd1cmEgZGEgdGVsYVxuXHRcdFx0Ly8gRGVwb2lzLCBtb3N0cmEgYXBlbmFzIG8gcGVyY2VudHVhbCB0cmFuc2NvcnJpZG9cblx0XHRcdCQoXCIuZWxhcHNlZC10aW1lIC5iYXJcIiwgJHVpW1wiZXZvbHVjYW9cIl0pLmNzcyhcIndpZHRoXCIsIFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJ3aWR0aFwiXSk7XG5cblx0XHRcdGxldCBsYXJndXJhX2RhX2JhcnJhID0gKHBlcmNlbnR1YWxfdHJhbnNjb3JyaWRvICogMTAwKS50b0ZpeGVkKDMpO1xuXHRcdFx0JChcIi5lbGFwc2VkLXRpbWVcIiwgJHVpW1wiZXZvbHVjYW9cIl0pLmNzcyhcIndpZHRoXCIsIGxhcmd1cmFfZGFfYmFycmEgKyBcIiVcIik7XG5cdFx0fVxuXHR9XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbGlzdGEgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBwLkxpc3RhLmxvYWQoKVxuLy8gYXBwLkxpc3RhLmxheW91dCgpXG4vLyBhcHAuTGlzdGEuc29ydCgpXG5cbmFwcC5MaXN0YSA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQkYXBwW1wibGlzdGFcIl0gPSAkKFwiLmFwcC1saXN0YVwiKTtcblxuXHRcdCRhcHBbXCJsaXN0YVwiXS5pc290b3BlKHtcblx0XHRcdFwiaXRlbVNlbGVjdG9yXCI6IFwiLmNhcmQtdGFyZWZhXCIsXG5cdFx0XHRcInRyYW5zaXRpb25EdXJhdGlvblwiOiBcIi44c1wiLFxuXHRcdFx0XCJnZXRTb3J0RGF0YVwiOiB7XG5cdFx0XHRcdFwiZGF0ZVwiOiBmdW5jdGlvbihlbGVtZW50KSB7XG5cdFx0XHRcdFx0cmV0dXJuICQoZWxlbWVudCkuZGF0YShcImxhc3QtbW9kaWZpZWRcIik7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdFwidGFyZWZhXCI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VJbnQoJChlbGVtZW50KS5kYXRhKFwidGFyZWZhXCIpLCAxMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRcInNvcnRBc2NlbmRpbmdcIjoge1xuXHRcdFx0XHRcImRhdGVcIjogZmFsc2UsXG5cdFx0XHRcdFwidGFyZWZhXCI6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRcInNvcnRCeVwiOiBbXCJkYXRlXCIsIFwidGFyZWZhXCJdLFxuXHRcdFx0XCJtYXNvbnJ5XCI6IHtcblx0XHRcdFx0XCJndXR0ZXJcIjogKFVJLmRhdGFbXCJjb2x1bW5zXCJdID09PSAxPyA4IDogMTYpXG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQkYXBwW1wibGlzdGFcIl0ub24oXCJjbGlja1wiLCBcIi5jYXJkLXRhcmVmYTpub3QoLmZhbnRhc21hKVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0aWYgKGV2ZW50LndoaWNoID09PSAxKSB7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdFx0bGV0ICRjYXJkID0gJCh0aGlzKTtcblx0XHRcdFx0bGV0IG51bWVybyA9ICRjYXJkLmRhdGEoXCJ0YXJlZmFcIik7XG5cdFx0XHRcdGFwcC5UYXJlZmEub3BlbihudW1lcm8sICRjYXJkLCB0cnVlKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5MaXN0YS5zdGFydCgpXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9nKFwiYXBwLkxpc3RhLnN0YXJ0XCIsIFwiaW5mb1wiKTtcblxuXHRcdFx0Ly8gZmF6IGFzIGFsdGVyYcOnw7VlcyBkZSBhY29yZG8gY29tIG8gc3RhdHVzXG5cdFx0XHQvLyBpbnNlcmUgYXMgbWVuc2FnZW5zXG5cdFx0XHRhcHAuTGlzdGEudGFyZWZhcygpO1xuXHRcdFx0YXBwLkxpc3RhLnN0YXR1cygpO1xuXHRcdFx0YXBwLkxpc3RhLm1lc3NhZ2VzKCk7XG5cblx0XHRcdC8vIHRpcmEgYSB0ZWxhIGRlIGxvYWRpbmdcblx0XHRcdFVJLmxvYWRiYXIuaGlkZSgpO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5MaXN0YS5zdGF0dXMoKVxuXHRcdHN0YXR1czogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBzZSBwcmF6byBkZSBwb3N0YWdlbSBlc3RpdmVyIGVuY2VycmFkbywgaW5zZXJlIGNsYXNzZSBubyA8Ym9keT5cblx0XHRcdGlmIChtb21lbnQoKS5pc0FmdGVyKExpc3RhLkVkaWNhb1tcImZpbVwiXSkpIHtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInBvc3RhZ2Vucy1lbmNlcnJhZGFzXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBzZSBhIGVkacOnw6NvIGVzdGl2ZXIgZW5jZXJyYWRhLCBpbnNlcmUgY2xhc3NlIG5vIDxib2R5PlxuXHRcdFx0Ly8gZSBwYXJhIGRlIGF0dWFsaXphciBhdXRvbWF0aWNhbWVudGVcblx0XHRcdGlmIChMaXN0YS5FZGljYW9bXCJlbmNlcnJhZGFcIl0gPT09IHRydWUpIHtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcImVkaWNhby1lbmNlcnJhZGFcIik7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwodGltaW5nW1wiYXRpdmlkYWRlXCJdKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEubWVzc2FnZXMoKVxuXHRcdG1lc3NhZ2VzOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIHNlIHRpdmVyIHTDrXR1bG8gZXNwZWNpZmljYWRvLCBpbnNlcmUgZWxlXG5cdFx0XHRpZiAoTGlzdGEuRWRpY2FvW1wibWVuc2FnZW1cIl1bXCJ0aXR1bG9cIl0pIHtcblx0XHRcdFx0bGV0IHBhZ2VfdGl0bGUgPSBMaXN0YS5FZGljYW9bXCJtZW5zYWdlbVwiXVtcInRpdHVsb1wiXTtcblx0XHRcdFx0JHVpW1widGl0bGVcIl0uaHRtbChwYWdlX3RpdGxlKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gZGUgdGl2ZXIgbWVuc2FnZW0gZGUgcm9kYXDDqSBlc3BlY2lmaWNhZGEsIGluc2VyZSBlbGFcblx0XHRcdGlmIChMaXN0YS5FZGljYW9bXCJtZW5zYWdlbVwiXVtcInJvZGFwZVwiXSkge1xuXHRcdFx0XHRsZXQgY2xvc2luZ19tZXNzYWdlID0gTGlzdGEuRWRpY2FvW1wibWVuc2FnZW1cIl1bXCJyb2RhcGVcIl07XG5cdFx0XHRcdCQoXCIuanMtbWVuc2FnZW0tZmluYWxcIikuaHRtbChjbG9zaW5nX21lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5MaXN0YS50YXJlZmFzKClcblx0XHR0YXJlZmFzOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIG1vc3RyYSBvIGxvYWRpbmcgZSBsaW1wYSBhIGxpc3RhIHBhcmEgY29tZcOnYXIgZG8gemVyb1xuXHRcdFx0Ly8gVUkubG9hZGluZy5zaG93KCk7XG5cdFx0XHQkYXBwW1wibGlzdGFcIl0uZW1wdHkoKTtcblxuXHRcdFx0Ly8gaW5zZXJlIGFzIHRhcmVmYXNcblx0XHRcdGZvciAobGV0IHRhcmVmYSBvZiBMaXN0YS5UYXJlZmFzKSB7XG5cdFx0XHRcdC8vIEluc2VyZSBubyBjYWNoZVxuXHRcdFx0XHRjYWNoZVtcInRhcmVmYXNcIl1bdGFyZWZhW1wibnVtZXJvXCJdXSA9IHRhcmVmYTtcblxuXHRcdFx0XHQvLyBDcmlhIG8gbGluayBwYXJhIGEgdGFyZWZhXG5cdFx0XHRcdHRhcmVmYVtcInVybFwiXSA9IHJvdXRlcltcImJ1aWxkLWxpbmtcIl0oXCIvdGFyZWZhcy9cIiArIHRhcmVmYVtcIm51bWVyb1wiXSk7XG5cblx0XHRcdFx0Ly8gU2UgdGl2ZXIgaW1hZ2VtLCBhanVzdGEgYXMgZGltZW5zb2VzXG5cdFx0XHRcdGlmICh0YXJlZmFbXCJpbWFnZW1cIl0pIHtcblx0XHRcdFx0XHR0YXJlZmFbXCJpbWFnZW0vdXJsXCJdID0gdGFyZWZhW1wiaW1hZ2VtXCJdW1widXJsXCJdO1xuXHRcdFx0XHRcdHRhcmVmYVtcImltYWdlbS9hc3BlY3RvXCJdID0gXCJwYWRkaW5nLXRvcDogXCIgKyAodGFyZWZhW1wiaW1hZ2VtXCJdW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0ICR0YXJlZmEgPSBfX3JlbmRlcihcImNhcmQtdGFyZWZhXCIsIHRhcmVmYSkuZGF0YSh7XG5cdFx0XHRcdFx0XCJ0YXJlZmFcIjogdGFyZWZhW1wibnVtZXJvXCJdLFxuXHRcdFx0XHRcdFwibGFzdC1tb2RpZmllZFwiOiAodGFyZWZhW1widWx0aW1hLXBvc3RhZ2VtXCJdPyBtb21lbnQodGFyZWZhW1widWx0aW1hLXBvc3RhZ2VtXCJdKS5mb3JtYXQoXCJYXCIpIDogMClcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0XHRcdC8vIHBvc3RzXG5cdFx0XHRcdGxldCAkZ3JpZCA9ICQoXCIudGFyZWZhLWNvbnRldWRvIC5ncmlkXCIsICR0YXJlZmEpO1xuXG5cdFx0XHRcdGlmICh0YXJlZmFbXCJxdWFudGlkYWRlLWRlLXBvc3RzXCJdICYmIHRhcmVmYVtcInBvc3RzXCJdKSB7XG5cdFx0XHRcdFx0Ly8gdmFyIHRvdGFsX21lZGlhID0gdGFyZWZhW1wicG9zdHNcIl0ucmVkdWNlKCh0b3RhbCwgcG9zdCkgPT4gdG90YWwgKyBwb3N0W1wibWlkaWFcIl0ubGVuZ3RoLCAwKTtcblx0XHRcdFx0XHQvLyB2YXIgbWF4X21lZGlhX3RvX3Nob3cgPSAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPCAyPyA5IDogOCk7XG5cdFx0XHRcdFx0dmFyIG1heF9tZWRpYV90b19zaG93ID0gODtcblx0XHRcdFx0XHR2YXIgc2hvd25fbWVkaWFfY291bnQgPSAwO1xuXG5cdFx0XHRcdFx0dmFyIHBvc3RfdHlwZXNfd2l0aF9pbWFnZV9wcmV2aWV3ID0gW1wiaW1hZ2VtXCIsIFwieW91dHViZVwiLCBcInZpbWVvXCIsIFwidmluZVwiLCBcImdpZlwiXTtcblx0XHRcdFx0XHR2YXIgcG9zdF90eXBlc193aXRoX3RleHRfcHJldmlldyA9IFtcInRleHRvXCJdO1xuXG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBtYXhfbWVkaWFfdG9fc2hvdzsgaSsrKSB7XG5cdFx0XHRcdFx0XHRpZiAodGFyZWZhW1wicG9zdHNcIl1baV0pIHtcblx0XHRcdFx0XHRcdFx0bGV0IHBvc3QgPSB0YXJlZmFbXCJwb3N0c1wiXVtpXTtcblxuXHRcdFx0XHRcdFx0XHRpZiAocG9zdFtcIm1pZGlhXCJdIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidGV4dG9cIikge1xuXHRcdFx0XHRcdFx0XHRcdHNob3duX21lZGlhX2NvdW50Kys7XG5cblx0XHRcdFx0XHRcdFx0XHR2YXIgdGlsZV90eXBlO1xuXHRcdFx0XHRcdFx0XHRcdHZhciBtZWRpYSA9IHsgfTtcblxuXHRcdFx0XHRcdFx0XHRcdC8vIGltYWdlbVxuXHRcdFx0XHRcdFx0XHRcdGlmIChwb3N0X3R5cGVzX3dpdGhfaW1hZ2VfcHJldmlldy5pbmRleE9mKHBvc3RbXCJ0aXBvXCJdKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aWxlX3R5cGUgPSBcInRpbGUtaW1hZ2VcIjtcblxuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJjb3VudFwiXSA9IHNob3duX21lZGlhX2NvdW50O1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ5b3V0dWJlXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ2aW1lb1wiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidmluZVwiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwiZ2lmXCIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJwcmV2aWV3XCJdID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJ1wiICsgcG9zdFtcIm1pZGlhXCJdWzBdW1widGh1bWJuYWlsXCJdICsgXCInKTtcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJtb2RpZmllclwiXSA9IFwidmlkZW9cIjtcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocG9zdFtcIm1pZGlhXCJdICYmIHBvc3RbXCJtaWRpYVwiXVswXSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcInByZXZpZXdcIl0gPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybCgnXCIgKyBwb3N0W1wibWlkaWFcIl1bMF1bXCJjYW1pbmhvXCJdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwb3N0W1wibWlkaWFcIl1bMF1bXCJhcnF1aXZvc1wiXVswXSArIFwiJyk7XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlXG5cblx0XHRcdFx0XHRcdFx0XHQvLyB0ZXh0b1xuXHRcdFx0XHRcdFx0XHRcdGlmIChwb3N0X3R5cGVzX3dpdGhfdGV4dF9wcmV2aWV3LmluZGV4T2YocG9zdFtcInRpcG9cIl0pID4gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRpbGVfdHlwZSA9IFwidGlsZS10ZXh0XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCJwcmV2aWV3XCI6IHBvc3RbXCJsZWdlbmRhXCJdLnN1YnN0cmluZygwLCAxMjApLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcImNvdW50XCI6IHNob3duX21lZGlhX2NvdW50XG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdGlmICgoc2hvd25fbWVkaWFfY291bnQgPT09IG1heF9tZWRpYV90b19zaG93KSAmJiAoKHRhcmVmYVtcInF1YW50aWRhZGUtZGUtcG9zdHNcIl0gLSBzaG93bl9tZWRpYV9jb3VudCkgPiAwKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJtb2RpZmllclwiXSA9IFwibW9yZVwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJtb3JlXCJdID0gXCIrJnRoaW5zcDtcIiArICh0YXJlZmFbXCJxdWFudGlkYWRlLWRlLXBvc3RzXCJdIC0gc2hvd25fbWVkaWFfY291bnQgKyAxKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHR2YXIgJHRpbGUgPSBfX3JlbmRlcih0aWxlX3R5cGUsIG1lZGlhKS5hcHBlbmRUbygkZ3JpZCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBzZSBuw6NvIHRpdmVyIG5lbmh1bSBwb3N0LCByZW1vdmUgbyBncmlkXG5cdFx0XHRcdFx0JChcIi50YXJlZmEtY29udGV1ZG9cIiwgJHRhcmVmYSkucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBTZSBmb3IgcHJldmlld1xuXHRcdFx0XHRpZiAodGFyZWZhW1wicHJldmlld1wiXSkge1xuXHRcdFx0XHRcdCR0YXJlZmEuYWRkQ2xhc3MoXCJmYW50YXNtYVwiKTtcblx0XHRcdFx0XHQkKFwiYVwiLCAkdGFyZWZhKS5yZW1vdmVBdHRyKFwiaHJlZlwiKTtcblx0XHRcdFx0XHQkKFwiLnRhcmVmYS1jb3Jwb1wiLCAkdGFyZWZhKS5yZW1vdmUoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCRhcHBbXCJsaXN0YVwiXS5hcHBlbmQoJHRhcmVmYSkuaXNvdG9wZShcImFwcGVuZGVkXCIsICR0YXJlZmEpO1xuXHRcdFx0fVxuXG5cdFx0XHRhcHAuTGlzdGEubGF5b3V0KCk7XG5cdFx0XHRhcHAuTGlzdGEuc29ydCgoTGlzdGEuRWRpY2FvW1wiZW5jZXJyYWRhXCJdPyBcInRhcmVmYVwiOiBcImRhdGVcIikpO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5MaXN0YS5sb2FkKClcblx0XHQvLyBsb2FkOiBmdW5jdGlvbigpIHtcblx0XHQvLyBcdC8vIG1vc3RyYSBhIHRlbGEgZGUgbG9hZGluZyBlIGxpbXBhIG8gc3RyZWFtXG5cdFx0Ly8gXHQkc3RyZWFtLmxvYWRpbmcuYWRkQ2xhc3MoXCJmYWRlLWluIGluXCIpO1xuXHRcdC8vXG5cdFx0Ly8gXHQvLyBjYXJyZWdhIG9zIGRhZG9zIGRhIEFQSVxuXHRcdC8vIFx0JC5nZXRKU09OKFwiaHR0cHM6Ly9hcGkubGFndWluaG8ub3JnL2xpc3RhL1wiICsgZWRpY2FvICsgXCIvdHVkbz9rZXk9XCIgKyBhcGlfa2V5ICsgXCImY2FsbGJhY2s9P1wiKS5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHQvLyBcdFx0Ly8gXCJESVJFVE9SXCJcblx0XHQvLyBcdFx0Ly8gVE9ETyBPIGxvYWQgZGV2ZSBmaWNhciBzZXBhcmFkbyBkbyBTdHJlYW0gKHZlciBpc3N1ZSAjNylcblx0XHQvLyBcdFx0TGlzdGEuUmVndWxhbWVudG8gPSBkYXRhW1wiZWRpY2FvXCJdO1xuXHRcdC8vIFx0XHRMaXN0YS5UYXJlZmFzID0gZGF0YVtcInRhcmVmYXNcIl07XG5cdFx0Ly9cblx0XHQvLyBcdFx0Ly8gU2UgYSBFZGnDp8OjbyBlc3RpdmVyIGVuY2VycmFkYS4uLlxuXHRcdC8vXG5cdFx0Ly9cblx0XHQvLyBcdFx0Ly8gRklNIERPIFwiRElSRVRPUlwiXG5cdFx0Ly9cblx0XHQvLyBcdFx0Ly8gTGltcGEgbyBzdHJlYW0gcGFyYSBjb21lw6dhciBkbyB6ZXJvXG5cdFx0Ly8gXHRcdCRzdHJlYW0uZW1wdHkoKTtcblx0XHQvL1xuXHRcdC8vIFx0XHQvLyBNb250YSBwbGFjYXJcblx0XHQvLyBcdFx0YXBwLlBsYWNhci51cGRhdGUoZGF0YVtcInBsYWNhclwiXSk7XG5cdFx0Ly9cblx0XHQvLyBcdFx0Ly8gSW5zZXJlIG9zIGNhcmRzIGRlIHRhcmVmYXNcblx0XHQvLyBcdFx0JC5lYWNoKGRhdGFbXCJ0YXJlZmFzXCJdLCBmdW5jdGlvbihpbmRleCwgdGFyZWZhKSB7XG5cdFx0Ly8gXHRcdFx0dGFyZWZhc1t0YXJlZmFbXCJudW1lcm9cIl1dID0gdGFyZWZhO1xuXHRcdC8vIFx0XHRcdHRhcmVmYVtcInVybFwiXSA9IFwiL3RhcmVmYXMvXCIgKyB0YXJlZmFbXCJudW1lcm9cIl07XG5cdFx0Ly8gXHRcdFx0dGFyZWZhW1widXJsXCJdID0gcm91dGVyW1wiYnVpbGQtbGlua1wiXShcIi90YXJlZmFzL1wiICsgdGFyZWZhW1wibnVtZXJvXCJdKTtcblx0XHQvL1xuXHRcdC8vIFx0XHRcdGlmICh0YXJlZmFbXCJpbWFnZW1cIl0pIHtcblx0XHQvLyBcdFx0XHRcdHRhcmVmYVtcImltYWdlbS11cmxcIl0gPSB0YXJlZmFbXCJpbWFnZW1cIl1bXCJ1cmxcIl07XG5cdFx0Ly8gXHRcdFx0XHR0YXJlZmFbXCJpbWFnZW0tYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKHRhcmVmYVtcImltYWdlbVwiXVtcImFzcGVjdG9cIl0gKiAxMDApLnRvRml4ZWQoMikgKyBcIiVcIjtcblx0XHQvLyBcdFx0XHR9XG5cdFx0Ly9cblx0XHQvLyBcdFx0XHR2YXIgJGNhcmQgPSBfX3JlbmRlcihcImNhcmQtdGFyZWZhXCIsIHRhcmVmYSkuZGF0YSh7XG5cdFx0Ly8gXHRcdFx0XHRcdFwidGFyZWZhXCI6IHRhcmVmYVtcIm51bWVyb1wiXSxcblx0XHQvLyBcdFx0XHRcdFx0XCJsYXN0LW1vZGlmaWVkXCI6ICh0YXJlZmFbXCJ1bHRpbWEtcG9zdGFnZW1cIl0/IG1vbWVudCh0YXJlZmFbXCJ1bHRpbWEtcG9zdGFnZW1cIl0pLmZvcm1hdChcIlhcIikgOiAwKVxuXHRcdC8vIFx0XHRcdFx0fSk7XG5cdFx0Ly9cblx0XHQvLyBcdFx0XHRpZiAodGFyZWZhW1wicHJldmlld1wiXSkge1xuXHRcdC8vIFx0XHRcdFx0JGNhcmQuYWRkQ2xhc3MoXCJmYW50YXNtYVwiKTtcblx0XHQvLyBcdFx0XHRcdCQoXCJhXCIsICRjYXJkKS5yZW1vdmVBdHRyKFwiaHJlZlwiKTtcblx0XHQvLyBcdFx0XHRcdCQoXCIuYm9keVwiLCAkY2FyZCkucmVtb3ZlKCk7XG5cdFx0Ly8gXHRcdFx0fVxuXHRcdC8vXG5cdFx0Ly8gXHRcdFx0aWYgKCF0YXJlZmFbXCJpbWFnZW1cIl0pIHtcblx0XHQvLyBcdFx0XHRcdCQoXCIubWVkaWFcIiwgJGNhcmQpLnJlbW92ZSgpO1xuXHRcdC8vIFx0XHRcdH1cblx0XHQvL1xuXHRcdC8vIFx0XHRcdC8vIHBvc3RzXG5cdFx0Ly8gXHRcdFx0dmFyICRncmlkID0gJChcIi5ncmlkXCIsICRjYXJkKTtcblx0XHQvL1xuXHRcdC8vIFx0XHRcdGlmICh0YXJlZmFbXCJxdWFudGlkYWRlLWRlLXBvc3RzXCJdID4gMCAmJiB0YXJlZmFbXCJwb3N0c1wiXSkge1xuXHRcdC8vIFx0XHRcdFx0Ly8gdmFyIHRvdGFsX21lZGlhID0gdGFyZWZhW1wicG9zdHNcIl0ucmVkdWNlKCh0b3RhbCwgcG9zdCkgPT4gdG90YWwgKyBwb3N0W1wibWlkaWFcIl0ubGVuZ3RoLCAwKTtcblx0XHQvLyBcdFx0XHRcdHZhciBtYXhfbWVkaWFfdG9fc2hvdyA9IChVSS5kYXRhW1wiY29sdW1uc1wiXSA8IDI/IDkgOiA4KTtcblx0XHQvLyBcdFx0XHRcdHZhciBzaG93bl9tZWRpYV9jb3VudCA9IDA7XG5cdFx0Ly9cblx0XHQvLyBcdFx0XHRcdHZhciBwb3N0X3R5cGVzX3dpdGhfaW1hZ2VfcHJldmlldyA9IFtcImltYWdlbVwiLCBcInlvdXR1YmVcIiwgXCJ2aW1lb1wiLCBcInZpbmVcIiwgXCJnaWZcIl07XG5cdFx0Ly8gXHRcdFx0XHR2YXIgcG9zdF90eXBlc193aXRoX3RleHRfcHJldmlldyA9IFtcInRleHRvXCJdO1xuXHRcdC8vXG5cdFx0Ly8gXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRhcmVmYVtcInF1YW50aWRhZGUtZGUtcG9zdHNcIl07IGkrKykge1xuXHRcdC8vIFx0XHRcdFx0XHR2YXIgcG9zdCA9IHRhcmVmYVtcInBvc3RzXCJdW2ldO1xuXHRcdC8vXG5cdFx0Ly8gXHRcdFx0XHRcdGlmICgocG9zdFtcIm1pZGlhXCJdIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidGV4dG9cIikgJiYgKHNob3duX21lZGlhX2NvdW50IDwgbWF4X21lZGlhX3RvX3Nob3cpKSB7XG5cdFx0Ly8gXHRcdFx0XHRcdFx0c2hvd25fbWVkaWFfY291bnQrKztcblx0XHQvL1xuXHRcdC8vIFx0XHRcdFx0XHRcdHZhciB0aWxlX3R5cGU7XG5cdFx0Ly8gXHRcdFx0XHRcdFx0dmFyIG1lZGlhID0geyB9O1xuXHRcdC8vXG5cdFx0Ly8gXHRcdFx0XHRcdFx0Ly8gaW1hZ2VtXG5cdFx0Ly8gXHRcdFx0XHRcdFx0aWYgKHBvc3RfdHlwZXNfd2l0aF9pbWFnZV9wcmV2aWV3LmluZGV4T2YocG9zdFtcInRpcG9cIl0pID4gLTEpIHtcblx0XHQvLyBcdFx0XHRcdFx0XHRcdHRpbGVfdHlwZSA9IFwidGlsZS1pbWFnZVwiO1xuXHRcdC8vXG5cdFx0Ly8gXHRcdFx0XHRcdFx0XHRtZWRpYVtcImNvdW50XCJdID0gc2hvd25fbWVkaWFfY291bnQ7XG5cdFx0Ly9cblx0XHQvLyBcdFx0XHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInlvdXR1YmVcIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbWVvXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ2aW5lXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJnaWZcIikge1xuXHRcdC8vIFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcInByZXZpZXdcIl0gPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybCgnXCIgKyBwb3N0W1wibWlkaWFcIl1bMF1bXCJ0aHVtYm5haWxcIl0gKyBcIicpO1wiO1xuXHRcdC8vIFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vZGlmaWVyXCJdID0gXCJ2aWRlb1wiO1xuXHRcdC8vIFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChwb3N0W1wibWlkaWFcIl0gJiYgcG9zdFtcIm1pZGlhXCJdWzBdKSB7XG5cdFx0Ly8gXHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wicHJldmlld1wiXSA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCdcIiArIHBvc3RbXCJtaWRpYVwiXVswXVtcImNhbWluaG9cIl0gK1xuXHRcdC8vIFx0XHRcdFx0XHRcdFx0XHRcdHBvc3RbXCJtaWRpYVwiXVswXVtcImFycXVpdm9zXCJdWzBdICsgXCInKTtcIjtcblx0XHQvLyBcdFx0XHRcdFx0XHRcdH1cblx0XHQvLyBcdFx0XHRcdFx0XHR9IGVsc2Vcblx0XHQvL1xuXHRcdC8vIFx0XHRcdFx0XHRcdC8vIHRleHRvXG5cdFx0Ly8gXHRcdFx0XHRcdFx0aWYgKHBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXcuaW5kZXhPZihwb3N0W1widGlwb1wiXSkgPiAtMSkge1xuXHRcdC8vIFx0XHRcdFx0XHRcdFx0dGlsZV90eXBlID0gXCJ0aWxlLXRleHRcIjtcblx0XHQvLyBcdFx0XHRcdFx0XHRcdG1lZGlhID0ge1xuXHRcdC8vIFx0XHRcdFx0XHRcdFx0XHRcInByZXZpZXdcIjogcG9zdFtcImxlZ2VuZGFcIl0uc3Vic3RyaW5nKDAsIDEyMCksXG5cdFx0Ly8gXHRcdFx0XHRcdFx0XHRcdFwiY291bnRcIjogc2hvd25fbWVkaWFfY291bnRcblx0XHQvLyBcdFx0XHRcdFx0XHRcdH07XG5cdFx0Ly8gXHRcdFx0XHRcdFx0fVxuXHRcdC8vXG5cdFx0Ly8gXHRcdFx0XHRcdFx0aWYgKChzaG93bl9tZWRpYV9jb3VudCA9PT0gbWF4X21lZGlhX3RvX3Nob3cpICYmICgodGFyZWZhW1wicXVhbnRpZGFkZS1kZS1wb3N0c1wiXSAtIHNob3duX21lZGlhX2NvdW50KSA+IDApKSB7XG5cdFx0Ly8gXHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vZGlmaWVyXCJdID0gXCJtb3JlXCI7XG5cdFx0Ly8gXHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vcmVcIl0gPSBcIismdGhpbnNwO1wiICsgKHRhcmVmYVtcInF1YW50aWRhZGUtZGUtcG9zdHNcIl0gLSBzaG93bl9tZWRpYV9jb3VudCArIDEpO1xuXHRcdC8vIFx0XHRcdFx0XHRcdH1cblx0XHQvL1xuXHRcdC8vIFx0XHRcdFx0XHRcdHZhciAkdGlsZSA9IF9fcmVuZGVyKHRpbGVfdHlwZSwgbWVkaWEpLmFwcGVuZFRvKCRncmlkKTtcblx0XHQvLyBcdFx0XHRcdFx0fVxuXHRcdC8vIFx0XHRcdFx0fVxuXHRcdC8vXG5cdFx0Ly8gXHRcdFx0fSBlbHNlIHtcblx0XHQvLyBcdFx0XHRcdC8vIHNlIG7Do28gdGl2ZXIgbmVuaHVtIHBvc3QsIHJlbW92ZSBvIGdyaWRcblx0XHQvLyBcdFx0XHRcdCRncmlkLnJlbW92ZSgpO1xuXHRcdC8vIFx0XHRcdH1cblx0XHQvL1xuXHRcdC8vIFx0XHRcdC8vIGF0dWFsaXphIG8gaXNvdG9wZVxuXHRcdC8vIFx0XHRcdCRzdHJlYW0uYXBwZW5kKCRjYXJkKS5pc290b3BlKFwiYXBwZW5kZWRcIiwgJGNhcmQpO1xuXHRcdC8vIFx0XHR9KTtcblx0XHQvL1xuXHRcdC8vIFx0XHQvLyBTZSBhIEVkacOnw6NvIGVzdGl2ZXIgZW5jZXJyYWRhLCBvcmRlbmEgcG9yIG7Dum1lcm8gZGEgdGFyZWZhLlxuXHRcdC8vIFx0XHQvLyBTZSBuw6NvLCBvcmRlbmEgcG9yIG9yZGVtIGRlIGF0dWFsaXphw6fDo29cblx0XHQvLyBcdFx0YXBwLkxpc3RhLmxheW91dCgpO1xuXHRcdC8vIFx0XHRhcHAuTGlzdGEuc29ydCgoTGlzdGEuRWRpY2FvW1wiZW5jZXJyYWRhXCJdPyBcInRhcmVmYVwiOiBcImRhdGVcIikpO1xuXHRcdC8vXG5cdFx0Ly8gXHRcdC8vIHNlIHRpdmVyIHRhcmVmYSBlc3BlY2lmaWNhZGEgbm8gbG9hZCBkYSBww6FnaW5hLCBjYXJyZWdhIGVsYVxuXHRcdC8vIFx0XHRpZiAocm91dGVyW1wicGF0aFwiXVsyXSkge1xuXHRcdC8vIFx0XHRcdGFwcC5UYXJlZmEub3Blbihyb3V0ZXJbXCJwYXRoXCJdWzJdKTtcblx0XHQvLyBcdFx0fVxuXHRcdC8vXG5cdFx0Ly8gXHRcdC8vIGVzY29uZGUgYSB0ZWxhIGRlIGxvYWRpbmdcblx0XHQvLyBcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHQvLyBcdFx0XHQkc3RyZWFtLmxvYWRpbmdcblx0XHQvLyBcdFx0XHRcdC5yZW1vdmVDbGFzcyhcImZhZGUtaW5cIilcblx0XHQvLyBcdFx0XHRcdC5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkgeyAkc3RyZWFtLmxvYWRpbmcucmVtb3ZlQ2xhc3MoXCJpblwiKTtcblx0XHQvLyBcdFx0XHR9KTtcblx0XHQvLyBcdFx0fSwgMTIwMCk7XG5cdFx0Ly9cblx0XHQvLyBcdFx0Ly8gZ3VhcmRhIGEgZGF0YSBkYSDDumx0aW1hIGF0dWFsaXphw6fDo28gZSB6ZXJhIG8gY29udGFkb3IgZGUgbm92aWRhZGVzXG5cdFx0Ly8gXHRcdGxhc3RfdXBkYXRlZCA9IG1vbWVudChkYXRhW1wiZWRpY2FvXCJdW1widWx0aW1hLWF0dWFsaXphY2FvXCJdKTtcblx0XHQvLyBcdFx0dXBkYXRlZFtcInRhcmVmYXNcIl0gPSAwO1xuXHRcdC8vIFx0XHR1cGRhdGVkW1wicG9zdHNcIl0gPSAwO1xuXHRcdC8vIFx0fSk7XG5cdFx0Ly8gfSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxpc3RhLmxheW91dCgpXG5cdFx0bGF5b3V0OiBmdW5jdGlvbigpIHtcblx0XHRcdCRhcHBbXCJsaXN0YVwiXS5pc290b3BlKFwicmVsb2FkSXRlbXNcIik7XG5cdFx0XHQkYXBwW1wibGlzdGFcIl0uaXNvdG9wZShcImxheW91dFwiKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEuc29ydCgpXG5cdFx0c29ydDogZnVuY3Rpb24oY3JpdGVyaWEpIHtcblx0XHRcdCRhcHBbXCJsaXN0YVwiXS5pc290b3BlKHtcblx0XHRcdFx0XCJzb3J0QnlcIjogY3JpdGVyaWFcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn0pKCk7XG5cbi8vIGpRdWVyeVxudmFyICRzdHJlYW07XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCRzdHJlYW0gPSAkKFwiLmpzLWFwcC1saXN0YVwiKTtcblx0Ly8gJHN0cmVhbS5sb2FkaW5nID0gJChcIm1haW4gLmxvYWRpbmdcIik7XG5cblx0JHN0cmVhbS5pc290b3BlKHtcblx0XHRcIml0ZW1TZWxlY3RvclwiOiBcIi5jYXJkLXRhcmVmYVwiLFxuXHRcdFwidHJhbnNpdGlvbkR1cmF0aW9uXCI6IFwiLjhzXCIsXG5cdFx0XCJnZXRTb3J0RGF0YVwiOiB7XG5cdFx0XHRcImRhdGVcIjogXCIubGFzdC1tb2RpZmllZFwiLFxuXHRcdFx0XCJ0YXJlZmFcIjogZnVuY3Rpb24oZWxlbWVudCkge1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VJbnQoJChlbGVtZW50KS5kYXRhKFwidGFyZWZhXCIpLCAxMCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRcInNvcnRBc2NlbmRpbmdcIjoge1xuXHRcdFx0XCJkYXRlXCI6IGZhbHNlLFxuXHRcdFx0XCJ0YXJlZmFcIjogdHJ1ZVxuXHRcdH0sXG5cdFx0XCJzb3J0QnlcIjogW1wiZGF0ZVwiLCBcInRhcmVmYVwiXSxcblx0XHRcIm1hc29ucnlcIjoge1xuXHRcdFx0XCJndXR0ZXJcIjogKFVJLmRhdGFbXCJjb2x1bW5zXCJdID09PSAxPyA4IDogMTYpXG5cdFx0fVxuXHR9KTtcblxuXHQvLyAkc3RyZWFtLm9uKFwiY2xpY2tcIiwgXCIuY2FyZC10YXJlZmE6bm90KC5mYW50YXNtYSlcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0Ly8gXHRpZiAoZXZlbnQud2hpY2ggPT09IDEpIHtcblx0Ly8gXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdC8vXG5cdC8vIFx0XHR2YXIgbnVtZXJvID0gJCh0aGlzKS5kYXRhKFwidGFyZWZhXCIpO1xuXHQvLyBcdFx0YXBwLlRhcmVmYS5vcGVuKG51bWVybywgdHJ1ZSk7XG5cdC8vIFx0fVxuXHQvLyB9KTtcblxuXHQvLyBhcHAuTGlzdGEubG9hZCgpO1xuXG5cdC8vIG9yZGVuYcOnw6NvXG5cdCR1aVtcInNpZGVuYXZcIl0ub24oXCJjbGlja1wiLCBcIi5qcy1saXN0YS1zb3J0IGFcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bGV0IGNyaXRlcmlhID0gJCh0aGlzKS5kYXRhKFwic29ydC1ieVwiKTtcblx0XHRsZXQgdGl0bGUgPSAkKHRoaXMpLmZpbmQoXCJzcGFuXCIpLnRleHQoKTtcblx0XHQkKFwiLmpzLWxpc3RhLXNvcnQgYVwiLCAkdWlbXCJzaWRlbmF2XCJdKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcblx0XHQkKHRoaXMpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuXG5cdFx0YXBwLkxpc3RhLnNvcnQoY3JpdGVyaWEpO1xuXHRcdFVJLnNpZGVuYXYuY2xvc2UoKTtcblx0XHRhbmFseXRpY3MoXCJMaXN0YVwiLCBcIk9yZGVuYcOnw6NvXCIsIHRpdGxlKTtcblx0fSk7XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHRhcmVmYSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5UYXJlZmEub3BlbigpXG4vLyBhcHAuVGFyZWZhLnJlbmRlcigpXG4vLyBhcHAuVGFyZWZhLmNsb3NlKClcblxuYXBwLlRhcmVmYSA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQkYXBwW1widGFyZWZhXCJdID0gJChcIi5hcHAtdGFyZWZhXCIpO1xuXG5cdFx0Ly8gQm90w7VlcyBkZSBmZWNoYXIgYSBUYXJlZmEgZSB2b2x0YXIgw6AgTGlzdGFcblx0XHQkYXBwW1widGFyZWZhXCJdLm9uKFwiY2xpY2tcIiwgXCIuanMtdGFyZWZhLWNsb3NlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0YXBwLlRhcmVmYS5jbG9zZSh0cnVlKTtcblx0XHR9KVxuXG5cdFx0Ly8gQm90w6NvIGRlIG5vdm8gcG9zdFxuXHRcdC5vbihcImNsaWNrXCIsIFwiLmpzLW5ldy1wb3N0LXRyaWdnZXJcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRVSS5ib3R0b21zaGVldC5vcGVuKCQoXCIubmV3LXBvc3Qtc2hlZXRcIiwgJGFwcFtcInRhcmVmYVwiXSkuY2xvbmUoKS5zaG93KCkpO1xuXHRcdH0pXG5cblx0XHQvLyBEZXNhYmlsaXRhIGNsaXF1ZSBubyBjYXJkIGRhIFRhcmVmYVxuXHRcdC5vbihcImNsaWNrXCIsIFwiLmNhcmQtdGFyZWZhIGFcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmIChldmVudC53aGljaCA9PT0gMSkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcblxuXHRsZXQgcGxhY2FyX2RhX3RhcmVmYSA9IFsgXTtcblxuXHRmdW5jdGlvbiByZW5kZXJQb3N0cyhwb3N0cywgJHBvc3RzKSB7XG5cdFx0cGxhY2FyX2RhX3RhcmVmYVtcInRvdGFsXCJdID0gMDtcblx0XHRmb3IgKHZhciB0dXJtYSBpbiBMaXN0YS5FZGljYW9bXCJ0dXJtYXNcIl0pIHtcblx0XHRcdHBsYWNhcl9kYV90YXJlZmFbTGlzdGEuRWRpY2FvW1widHVybWFzXCJdW3R1cm1hXV0gPSAwO1xuXHRcdH1cblxuXHRcdCQuZWFjaChwb3N0cywgZnVuY3Rpb24oaW5kZXgsIHBvc3QpIHtcblx0XHRcdHBvc3RbXCJ0dXJtYS1iYWNrZ3JvdW5kXCJdID0gcG9zdFtcInR1cm1hXCJdICsgXCItbGlnaHQtYmFja2dyb3VuZFwiO1xuXHRcdFx0cG9zdFtcImRhdGEtZGUtcG9zdGFnZW0tZm9ybWF0YWRhXCJdID0gbW9tZW50KHBvc3RbXCJkYXRhLWRlLXBvc3RhZ2VtXCJdKS5jYWxlbmRhcigpO1xuXHRcdFx0cG9zdFtcInR1cm1hLWZvcm1hdGFkYVwiXSA9IHBvc3RbXCJ0dXJtYVwiXS50b1VwcGVyQ2FzZSgpO1xuXG5cdFx0XHQvLyBsZWdlbmRhXG5cdFx0XHRpZiAocG9zdFtcImxlZ2VuZGFcIl0gJiYgcG9zdFtcImxlZ2VuZGFcIl0uc3Vic3RyaW5nKDAsMykgIT09IFwiPHA+XCIpIHtcblx0XHRcdFx0cG9zdFtcImxlZ2VuZGFcIl0gPSBcIjxwPlwiICsgcG9zdFtcImxlZ2VuZGFcIl0ucmVwbGFjZSgvKD86XFxyXFxuXFxyXFxufFxcclxccnxcXG5cXG4pL2csIFwiPC9wPjxwPlwiKSArIFwiPC9wPlwiO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBhdmFsaWHDp8Ojb1xuXHRcdFx0aWYgKHBvc3RbXCJhdmFsaWFjYW9cIl0pIHtcblx0XHRcdFx0cG9zdFtcImF2YWxpYWNhby9tZW5zYWdlbVwiXSA9IHBvc3RbXCJhdmFsaWFjYW9cIl1bXCJtZW5zYWdlbVwiXTtcblxuXHRcdFx0XHRpZiAocG9zdFtcImF2YWxpYWNhb1wiXVtcInN0YXR1c1wiXSA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0cG9zdFtcInN0YXR1cy1jbGFzc1wiXSA9IHBvc3RbXCJ0dXJtYVwiXTtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzLWljb25cIl0gPSBcIjxpIGNsYXNzPVxcXCJtYXRlcmlhbC1pY29uc1xcXCI+JiN4RTg3RDs8L2k+XCI7IC8vIGNvcmHDp8Ojb1xuXHRcdFx0XHRcdHBvc3RbXCJhdmFsaWFjYW8vc3RhdHVzXCJdID0gcG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXSArIFwiIHBvbnRvXCIgKyAocG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXSA+IDE/IFwic1wiOiBcIlwiKTtcblx0XHRcdFx0XHRwb3N0W1wiYXZhbGlhY2FvL2NsYXNzXCJdID0gXCJ0dXJtYS10ZXh0XCI7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cG9zdFtcInN0YXR1cy1jbGFzc1wiXSA9IFwicmVqZWN0ZWRcIjtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzLWljb25cIl0gPSBcIjxpIGNsYXNzPVxcXCJtYXRlcmlhbC1pY29uc1xcXCI+JiN4RTg4ODs8L2k+XCI7XG5cdFx0XHRcdFx0cG9zdFtcImF2YWxpYWNhby9zdGF0dXNcIl0gPSBcIlJlcHJvdmFkb1wiO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gc29tYSBwb250b3Mgbm8gcGxhY2FyXG5cdFx0XHRcdHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSArPSBwb3N0W1wiYXZhbGlhY2FvXCJdW1wicG9udG9zXCJdO1xuXHRcdFx0XHRwbGFjYXJfZGFfdGFyZWZhW3Bvc3RbXCJ0dXJtYVwiXV0gKz0gcG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBvc3RbXCJzdGF0dXMtaWNvblwiXSA9IFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj4mI3hFOEI1OzwvaT5cIjsgLy8gcmVsw7NnaW9cblx0XHRcdFx0cG9zdFtcImF2YWxpYWNhby9zdGF0dXNcIl0gPSBcIkFndWFyZGFuZG8gYXZhbGlhw6fDo29cIjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcmVuZGVyaXphIG8gcG9zdFxuXHRcdFx0bGV0ICRjb250ZW50X2NhcmQgPSBfX3JlbmRlcihcImNvbnRlbnQtY2FyZFwiLCBwb3N0KTtcblx0XHRcdGxldCAkbWVkaWEgPSAkKFwiLmNvbnRlbnQtbWVkaWEgPiB1bFwiLCAkY29udGVudF9jYXJkKTtcblxuXHRcdFx0Ly8gYWRpY2lvbmEgbcOtZGlhc1xuXHRcdFx0aWYgKHBvc3RbXCJtaWRpYVwiXSkge1xuXHRcdFx0XHQkLmVhY2gocG9zdFtcIm1pZGlhXCJdLCBmdW5jdGlvbihpbmRleCwgbWVkaWEpIHtcblx0XHRcdFx0XHQvLyBpbWFnZW1cblx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJpbWFnZW1cIikge1xuXHRcdFx0XHRcdFx0bWVkaWFbXCJkZWZhdWx0XCJdID0gbWVkaWFbXCJjYW1pbmhvXCJdICsgbWVkaWFbXCJhcnF1aXZvc1wiXVsxXTtcblx0XHRcdFx0XHRcdG1lZGlhW1wicGFkZGluZy1hc3BlY3RvXCJdID0gXCJwYWRkaW5nLXRvcDogXCIgKyAobWVkaWFbXCJhc3BlY3RvXCJdICogMTAwKS50b0ZpeGVkKDIpICsgXCIlXCI7XG5cdFx0XHRcdFx0XHRtZWRpYVtcImxpbmstb3JpZ2luYWxcIl0gPSBtZWRpYVtcImNhbWluaG9cIl0gKyBtZWRpYVtcImFycXVpdm9zXCJdWzJdO1xuXHRcdFx0XHRcdFx0dmFyICRpbWFnZSA9IF9fcmVuZGVyKFwibWVkaWEtcGhvdG9cIiwgbWVkaWEpO1xuXHRcdFx0XHRcdFx0JG1lZGlhLmFwcGVuZCgkaW1hZ2UpO1xuXHRcdFx0XHRcdH0gZWxzZVxuXG5cdFx0XHRcdFx0Ly8gZW1iZWRcblx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ5b3V0dWJlXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ2aW1lb1wiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidmluZVwiKSB7XG5cdFx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ5b3V0dWJlXCIpIHtcblx0XHRcdFx0XHRcdFx0bWVkaWFbXCJlbWJlZFwiXSA9IFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvXCIgKyBtZWRpYVtcInlvdXR1YmUtaWRcIl0gKyBcIj9yZWw9MCZhbXA7c2hvd2luZm89MFwiO1xuXHRcdFx0XHRcdFx0fSBlbHNlXG5cblx0XHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInZpbWVvXCIpIHtcblx0XHRcdFx0XHRcdFx0bWVkaWFbXCJlbWJlZFwiXSA9IFwiaHR0cHM6Ly9wbGF5ZXIudmltZW8uY29tL3ZpZGVvL1wiICsgbWVkaWFbXCJ2aW1lby1pZFwiXSArIFwiP3RpdGxlPTAmYnlsaW5lPTAmcG9ydHJhaXQ9MFwiO1xuXHRcdFx0XHRcdFx0fSBlbHNlXG5cblx0XHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInZpbmVcIikge1xuXHRcdFx0XHRcdFx0XHRtZWRpYVtcImVtYmVkXCJdID0gXCJodHRwczovL3ZpbmUuY28vdi9cIiArIG1lZGlhW1widmluZS1pZFwiXSArIFwiL2VtYmVkL3NpbXBsZVwiO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRtZWRpYVtcInBhZGRpbmctYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKG1lZGlhW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0XHRcdFx0dmFyICRlbWJlZCA9IF9fcmVuZGVyKFwibWVkaWEtdmlkZW9cIiwgbWVkaWEpO1xuXHRcdFx0XHRcdFx0JG1lZGlhLmFwcGVuZCgkZW1iZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHRpcmEgbGVnZW5kYSBzZSBuw6NvIHRpdmVyXG5cdFx0XHRpZiAoIXBvc3RbXCJsZWdlbmRhXCJdKSB7XG5cdFx0XHRcdCRjb250ZW50X2NhcmQuYWRkQ2xhc3MoXCJuby1jYXB0aW9uXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIXBvc3RbXCJtaWRpYVwiXSkge1xuXHRcdFx0XHQkY29udGVudF9jYXJkLmFkZENsYXNzKFwibm8tbWVkaWFcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHRpcmEgbWVuc2FnZW0gZGUgYXZhbGlhw6fDo28gc2UgbsOjbyB0aXZlclxuXHRcdFx0aWYgKCFwb3N0W1wiYXZhbGlhY2FvXCJdIHx8ICFwb3N0W1wibWVuc2FnZW1cIl0pIHtcblx0XHRcdFx0JChcIi5yZXN1bHQgLm1lc3NhZ2VcIiwgJGNvbnRlbnRfY2FyZCkucmVtb3ZlKCk7XG5cdFx0XHR9XG5cblxuXHRcdFx0Ly8gYWRpY2lvbmEgbyBwb3N0IMOgIHRhcmVmYVxuXHRcdFx0Ly8gJHBvc3RzLmFwcGVuZCgkY29udGVudF9jYXJkKS5pc290b3BlKFwiYXBwZW5kZWRcIiwgJGNvbnRlbnRfY2FyZCk7XG5cdFx0XHQkcG9zdHMuYXBwZW5kKCRjb250ZW50X2NhcmQpO1xuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRkYXRhOiB7IH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5UYXJlZmEub3BlbigpIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHRvcGVuOiBmdW5jdGlvbihudW1lcm8sICRjYXJkLCBwdXNoU3RhdGUpIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCRjYXJkWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcblxuXHRcdFx0bGV0IHRhcmVmYSA9IGNhY2hlW1widGFyZWZhc1wiXVtudW1lcm9dO1xuXHRcdFx0dGFyZWZhX2FjdGl2ZSA9IG51bWVybztcblxuXHRcdFx0Ly8gaWYgKFVJLmRhdGFbXCJjb2x1bW5zXCJdID49IDMpIHtcblx0XHRcdC8vIFx0Ly8gVUkuYmFja2Ryb3Auc2hvdygkYXBwW1widGFyZWZhXCJdLCB7IFwiaGlkZVwiOiBhcHAuVGFyZWZhLmNsb3NlIH0pO1xuXHRcdFx0Ly8gXHQvLyAkdWlbXCJiYWNrZHJvcFwiXVskYXBwW1widGFyZWZhXCJdXS5vbihcImhpZGVcIiwgYXBwLlRhcmVmYS5jbG9zZSk7XG5cdFx0XHQvLyB9XG5cblx0XHRcdCRhcHBbXCJ0YXJlZmFcIl0uYWRkQ2xhc3MoXCJpblwiKTtcblx0XHRcdGFwcC5UYXJlZmEucmVuZGVyKHRhcmVmYSk7XG5cblx0XHRcdCRhcHBbXCJ0YXJlZmFcIl0ucmVmbG93KCkuYWRkQ2xhc3MoXCJzbGlkZS14XCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdC8vIHZhciB2aWV3X3RoZW1lX2NvbG9yID0gJChcIi5hcHBiYXJcIiwgJGFwcFtcInRhcmVmYVwiXSkuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiKTtcblx0XHRcdFx0Ly8gJChcImhlYWQgbWV0YVtuYW1lPSd0aGVtZS1jb2xvciddXCIpLmF0dHIoXCJjb250ZW50XCIsIFwiIzU0NmU3YVwiKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRVSS5ib2R5LmxvY2soKTtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJ0YXJlZmEtYWN0aXZlXCIpO1xuXG5cdFx0XHQvLyByb3V0ZXJcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZXBsYWNlKFwidGFyZWZhXCIpO1xuXHRcdFx0aWYgKHB1c2hTdGF0ZSkge1xuXHRcdFx0XHRyb3V0ZXIuZ28oXCIvdGFyZWZhcy9cIiArIHRhcmVmYVtcIm51bWVyb1wiXSwge1xuXHRcdFx0XHRcdFwidmlld1wiOiBcInRhcmVmYVwiLFxuXHRcdFx0XHRcdFwiaWRcIjogdGFyZWZhW1wibnVtZXJvXCJdXG5cdFx0XHRcdH0sIHRhcmVmYVtcInRpdHVsb1wiXSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGFuYWx5dGljc1xuXHRcdFx0YW5hbHl0aWNzKFwiVGFyZWZhXCIsIFwiQWNlc3NvXCIsIG51bWVybyk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlRhcmVmYS5yZW5kZXIoKSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdHJlbmRlcjogZnVuY3Rpb24odGFyZWZhKSB7XG5cdFx0XHR2YXIgJHRhcmVmYSA9IF9fcmVuZGVyKFwidmlldy10YXJlZmFcIiwgdGFyZWZhKTtcblxuXHRcdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdFx0Ly8gY2FyZCBkYSB0YXJlZmFcblx0XHRcdGlmICh0YXJlZmFbXCJpbWFnZW1cIl0pIHtcblx0XHRcdFx0dGFyZWZhW1wiaW1hZ2VtXCJdW1wiYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKHRhcmVmYVtcImltYWdlbVwiXVtcImFzcGVjdG9cIl0gKiAxMDApLnRvRml4ZWQoMikgKyBcIiVcIjtcblx0XHRcdH1cblxuXHRcdFx0dmFyICR0YXJlZmFfY2FyZCA9IF9fcmVuZGVyKFwiY2FyZC10YXJlZmFcIiwgdGFyZWZhKTtcblxuXHRcdFx0aWYgKCF0YXJlZmFbXCJpbWFnZW1cIl0pIHtcblx0XHRcdFx0JChcIi5tZWRpYVwiLCAkdGFyZWZhX2NhcmQpLnJlbW92ZSgpO1xuXHRcdFx0fVxuXHRcdFx0JChcIi5ncmlkXCIsICR0YXJlZmFfY2FyZCkucmVtb3ZlKCk7XG5cdFx0XHQkKFwiYVwiLCAkdGFyZWZhX2NhcmQpLnJlbW92ZUF0dHIoXCJocmVmXCIpO1xuXG5cdFx0XHQkKFwiLnRhcmVmYS1tZXRhIC50YXJlZmEtdGV4dG9cIiwgJHRhcmVmYSkuYXBwZW5kKCR0YXJlZmFfY2FyZCk7XG5cblx0XHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHRcdC8vIGNvbnRlbnRcblx0XHRcdGxldCAkcG9zdHMgPSAkKFwiLnRhcmVmYS1jb250ZW50ID4gdWxcIiwgJHRhcmVmYSk7XG5cblx0XHRcdGlmICh0YXJlZmFbXCJwb3N0c1wiXS5sZW5ndGgpIHtcblx0XHRcdFx0cmVuZGVyUG9zdHModGFyZWZhW1wicG9zdHNcIl0sICRwb3N0cyk7XG5cblx0XHRcdFx0JHBvc3RzLmlzb3RvcGUoe1xuXHRcdFx0XHRcdFwiaXRlbVNlbGVjdG9yXCI6IFwiLmNvbnRlbnQtY2FyZFwiLFxuXHRcdFx0XHRcdFwidHJhbnNpdGlvbkR1cmF0aW9uXCI6IDAsXG5cdFx0XHRcdFx0XCJtYXNvbnJ5XCI6IHtcblx0XHRcdFx0XHRcdFwiaXNGaXRXaWR0aFwiOiB0cnVlLFxuXHRcdFx0XHRcdFx0XCJndXR0ZXJcIjogKFVJLmRhdGFbXCJjb2x1bW5zXCJdID09PSAxPyA4IDogMjQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQvLyB9KS5vbihcImxheW91dENvbXBsZXRlXCIsIGZ1bmN0aW9uKGV2ZW50LCBwb3N0cykge1xuXHRcdFx0XHQvLyBcdHZhciBwcmV2aW91c19wb3NpdGlvbjtcblx0XHRcdFx0Ly9cblx0XHRcdFx0Ly8gXHRmb3IgKHZhciBwb3N0IGluIHBvc3RzKSB7XG5cdFx0XHRcdC8vIFx0XHR2YXIgJHRoaXMgPSAkKHBvc3RzW3Bvc3RdLmVsZW1lbnQpO1xuXHRcdFx0XHQvLyBcdFx0dmFyIG9mZnNldCA9IHBvc3RzW3Bvc3RdLnBvc2l0aW9uO1xuXHRcdFx0XHQvLyBcdFx0dmFyIHNpZGUgPSAob2Zmc2V0W1wieFwiXSA9PT0gMD8gXCJsZWZ0XCIgOiBcInJpZ2h0XCIpO1xuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdFx0JHRoaXMuYWRkQ2xhc3MoXCJ0aW1lbGluZS1cIiArIHNpZGUpO1xuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdFx0aWYgKG9mZnNldFtcInlcIl0gLSBwcmV2aW91c19wb3NpdGlvbiA8IDEwKSB7XG5cdFx0XHRcdC8vIFx0XHRcdCR0aGlzLmFkZENsYXNzKFwiZXh0cmEtb2Zmc2V0XCIpO1xuXHRcdFx0XHQvLyBcdFx0fVxuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdFx0cHJldmlvdXNfcG9zaXRpb24gPSBvZmZzZXRbXCJ5XCJdO1xuXHRcdFx0XHQvLyBcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQkcG9zdHMuaXNvdG9wZShcImxheW91dFwiKTtcblx0XHRcdFx0fSwgMSk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoXCI8bGkgLz5cIikuYWRkQ2xhc3MoXCJlbXB0eVwiKS50ZXh0KFwiTmVuaHVtIHBvc3RcIikuYXBwZW5kVG8oJHBvc3RzKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdFx0Ly8gbGF5b3V0XG5cdFx0XHQkYXBwW1widGFyZWZhXCJdLmh0bWwoJHRhcmVmYSk7XG5cblx0XHRcdGlmICh0YXJlZmFbXCJwb3N0c1wiXS5sZW5ndGgpIHtcblx0XHRcdFx0JHBvc3RzLmlzb3RvcGUoXCJsYXlvdXRcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHBsYWNhciBkYSB0YXJlZmFcblx0XHRcdC8vIHZhciAkcGxhY2FyX2RhX3RhcmVmYSA9ICQoXCIucGFpbmVsIC5wbGFjYXIgdWxcIiwgJHRhcmVmYSk7XG5cdFx0XHQvL1xuXHRcdFx0Ly8gJC5lYWNoKExpc3RhLkVkaWNhb1tcInR1cm1hc1wiXSwgZnVuY3Rpb24oaW5kZXgsIHR1cm1hKSB7XG5cdFx0XHQvLyBcdHZhciBwb250dWFjYW9fZGFfdHVybWEgPSBbIF07XG5cdFx0XHQvL1xuXHRcdFx0Ly8gXHQvLyBjYWxjdWxhICUgZGEgdHVybWEgZW0gcmVsYcOnw6NvIGFvIHRvdGFsIGRlIHBvbnRvc1xuXHRcdFx0Ly8gXHR2YXIgcGVyY2VudHVhbF9kYV90dXJtYSA9IChwbGFjYXJfZGFfdGFyZWZhW1widG90YWxcIl0gPiAwPyBwbGFjYXJfZGFfdGFyZWZhW3R1cm1hXSAvIHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSA6IDApO1xuXHRcdFx0Ly8gXHRwb250dWFjYW9fZGFfdHVybWFbXCJ0dXJtYVwiXSA9IHR1cm1hO1xuXHRcdFx0Ly8gXHRwb250dWFjYW9fZGFfdHVybWFbXCJhbHR1cmEtZGEtYmFycmFcIl0gPSBcImhlaWdodDogXCIgKyAocGVyY2VudHVhbF9kYV90dXJtYSAqIDEwMCkudG9GaXhlZCgzKSArIFwiJVwiO1xuXHRcdFx0Ly8gXHRwb250dWFjYW9fZGFfdHVybWFbXCJ0dXJtYS1mb3JtYXRhZGFcIl0gPSB0dXJtYS50b1VwcGVyQ2FzZSgpO1xuXHRcdFx0Ly8gXHRwb250dWFjYW9fZGFfdHVybWFbXCJwb250b3NcIl0gPSAocGxhY2FyX2RhX3RhcmVmYVt0dXJtYV0gPiAwPyBwbGFjYXJfZGFfdGFyZWZhW3R1cm1hXSA6IDApO1xuXHRcdFx0Ly8gXHRwb250dWFjYW9fZGFfdHVybWFbXCJwb250dWFjYW8tZm9ybWF0YWRhXCJdID0gcG9udHVhY2FvX2RhX3R1cm1hW1wicG9udG9zXCJdLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIuXCIpO1xuXHRcdFx0Ly9cblx0XHRcdC8vIFx0dmFyICR0dXJtYSA9IF9fcmVuZGVyKFwicGxhY2FyLXR1cm1hXCIsIHBvbnR1YWNhb19kYV90dXJtYSk7XG5cdFx0XHQvLyBcdCRwbGFjYXJfZGFfdGFyZWZhLmFwcGVuZCgkdHVybWEpO1xuXHRcdFx0Ly8gfSk7XG5cblx0XHRcdCQoXCIudGFyZWZhLXdyYXBwZXJcIiwgJGFwcFtcInRhcmVmYVwiXSkub24oXCJzY3JvbGxcIiwgYXBwLlRhcmVmYS5vYnNlcnZlcik7XG5cdFx0fSxcblxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuVGFyZWZhLmNsb3NlKCkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Y2xvc2U6IGZ1bmN0aW9uKHB1c2hTdGF0ZSkge1xuXHRcdFx0dGFyZWZhX2FjdGl2ZSA9IG51bGw7XG5cdFx0XHQkKFwiaGVhZCBtZXRhW25hbWU9J3RoZW1lLWNvbG9yJ11cIikuYXR0cihcImNvbnRlbnRcIiwgVUkuZGF0YVtcInRoZW1lLWNvbG9yXCJdW1wib3JpZ2luYWxcIl0pO1xuXG5cdFx0XHRVSS5ib2R5LnVubG9jaygpO1xuXHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInRhcmVmYS1hY3RpdmVcIik7XG5cdFx0XHQkYXBwW1widGFyZWZhXCJdLnJlbW92ZUNsYXNzKFwic2xpZGUteFwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkYXBwW1widGFyZWZhXCJdLnJlbW92ZUNsYXNzKFwiaW5cIikuZW1wdHkoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPj0gMykge1xuXHRcdFx0XHQvLyBVSS5iYWNrZHJvcC5oaWRlKCRhcHBbXCJ0YXJlZmFcIl0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyByb3V0ZXJcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZXBsYWNlKFwiaG9tZVwiKTtcblx0XHRcdGlmIChwdXNoU3RhdGUpIHsgcm91dGVyLmdvKFwiL3RhcmVmYXNcIiwgeyBcInZpZXdcIjogXCJob21lXCIgfSwgXCJMaXN0YSBkZSBUYXJlZmFzXCIpOyB9XG5cdFx0fSxcblxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuVGFyZWZhLm9ic2VydmVyKCkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0b2JzZXJ2ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0YXBwLlRhcmVmYS5kYXRhW1wiaGVpZ2h0XCJdID0gJChcIi50YXJlZmEtb3V0ZXItY29udGFpbmVyXCIsICRhcHBbXCJ0YXJlZmFcIl0pLm91dGVySGVpZ2h0KCk7XG5cdFx0XHRhcHAuVGFyZWZhLmRhdGFbXCJzY3JvbGxZcG9zXCJdID0gJChcIi50YXJlZmEtd3JhcHBlclwiLCAkYXBwW1widGFyZWZhXCJdKS5zY3JvbGxUb3AoKTtcblxuXHRcdFx0Y29uc29sZS5sb2coYXBwLlRhcmVmYS5kYXRhKTtcblx0XHR9XG5cdH07XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbmV3IHBvc3QgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gKiBhcHAuUG9zdC5hdXRob3JpemUoKVxuLy8gKiBhcHAuUG9zdC5kZWF1dGhvcml6ZSgpXG4vLyAqIGFwcC5Qb3N0LmdldFRodW1ibmFpbCgpXG4vLyAqIGFwcC5Qb3N0Lm9wZW4oKVxuLy8gKiBhcHAuUG9zdC5jbG9zZSgpXG5cbi8vIHRpcG9zIGRlIHBvc3Q6IHBob3RvLCB2aWRlbywgdGV4dFxuXG5hcHAuUG9zdCA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQkYXBwW1wicG9zdFwiXSA9ICQoXCIuYXBwLXBvc3RcIik7XG5cdFx0JHVpW1wiYm90dG9tc2hlZXRcIl0ub24oXCJjbGlja1wiLCBcIi5uZXctcG9zdC1zaGVldCBhXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHR2YXIgdHlwZSA9ICQodGhpcykuZGF0YShcInBvc3QtdHlwZVwiKTtcblx0XHRcdFVJLmJvdHRvbXNoZWV0LmNsb3NlKCk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhcHAuUG9zdC5vcGVuKHR5cGUsIHRhcmVmYV9hY3RpdmUpO1xuXHRcdFx0fSwgNjAwKTtcblx0XHR9KTtcblxuXHRcdCRhcHBbXCJwb3N0XCJdLm9uKFwic3VibWl0XCIsIFwiZm9ybVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9KS5vbihcImNsaWNrXCIsIFwiLnN1Ym1pdC1idXR0b25cIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGlmIChtb21lbnQoKS5pc0FmdGVyKExpc3RhLkVkaWNhb1tcImZpbVwiXSkpIHtcblx0XHRcdFx0VUkudG9hc3Qub3BlbihcIlBvc3RhZ2VucyBlbmNlcnJhZGFzIVwiKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCQodGhpcykuaGFzQ2xhc3MoXCJkaXNhYmxlZFwiKSkge1xuXHRcdFx0XHQvLyBUT0RPIG1lbGhvcmFyIG1lbnNhZ2VtXG5cdFx0XHRcdFVJLnRvYXN0Lm9wZW4oXCJFc3BlcmUgbyBmaW0gZG8gdXBsb2FkJmhlbGxpcDtcIik7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGRhdGEgPSAkKFwiZm9ybVwiLCAkYXBwW1wicG9zdFwiXSkuc2VyaWFsaXplKCk7XG5cdFx0XHQvLyBFeGVtcGxvIGRlIGRhZG9zOlxuXHRcdFx0Ly8gYWN0aW9uPXBvc3Rcblx0XHRcdC8vIGVkaWNhbz14Y2lpaVxuXHRcdFx0Ly8gdGFyZWZhPTJcblx0XHRcdC8vIHVzZXI9NzQ0XG5cdFx0XHQvLyB0dXJtYT1lYzFcblx0XHRcdC8vIHRva2VuPTBlYmUyMmJlNzMxZGJkOTQyZWNiM2UwOTdhNWFjMmFlOWQzMTg1MjQ5ZjMxM2VhZWMzYTg1NWVmMjk1NzU5NGRcblx0XHRcdC8vIHR5cGU9aW1hZ2VtXG5cdFx0XHQvLyBpbWFnZS1vcmRlcltdPTItNzQ0LTE0ODgwOTcwMTMtNTc4XG5cdFx0XHQvLyBjYXB0aW9uPVxuXG5cdFx0XHQkKFwiLnN1Ym1pdC1idXR0b25cIiwgJGFwcFtcInBvc3RcIl0pLmFkZENsYXNzKFwiZGlzYWJsZWRcIikuaHRtbChcIkVudmlhbmRvJmhlbGxpcDtcIik7XG5cblx0XHRcdCQucG9zdChcIi90YXJlZmFzL1wiICsgdGFyZWZhX2FjdGl2ZSArIFwiL3Bvc3RhclwiLCBkYXRhKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGFuYWx5dGljcyhcIkNvbnRlw7pkb1wiLCBcIlRlbnRhdGl2YVwiKTtcblxuXHRcdFx0XHRpZiAocmVzcG9uc2VbXCJtZXRhXCJdW1wic3RhdHVzXCJdID09PSAyMDApIHtcblx0XHRcdFx0XHRhcHAuUG9zdC5jbG9zZSgpO1xuXHRcdFx0XHRcdGFwcC5UYXJlZmEucmVuZGVyKHJlc3BvbnNlW1wiZGF0YVwiXSk7XG5cdFx0XHRcdFx0VUkudG9hc3Qub3BlbihyZXNwb25zZVtcIm1ldGFcIl1bXCJtZXNzYWdlXCJdKTtcblx0XHRcdFx0XHRuYXZpZ2F0b3IudmlicmF0ZSg4MDApO1xuXG5cdFx0XHRcdFx0TGlzdGEuVGFyZWZhc1tyZXNwb25zZVtcImRhdGFcIl1bXCJudW1lcm9cIl1dID0gcmVzcG9uc2VbXCJkYXRhXCJdO1xuXHRcdFx0XHRcdGFuYWx5dGljcyhcIkNvbnRlw7pkb1wiLCBcIlBvc3RhZ2VtXCIpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFVJLnRvYXN0Lm9wZW4oKHJlc3BvbnNlW1wibWV0YVwiXVtcIm1lc3NhZ2VcIl0/IHJlc3BvbnNlW1wibWV0YVwiXVtcIm1lc3NhZ2VcIl0gOiBcIk9jb3JyZXUgdW0gZXJyby4gVGVudGUgbm92YW1lbnRlXCIpKTtcblx0XHRcdFx0XHRhbmFseXRpY3MoXCJDb250ZcO6ZG9cIiwgXCJFcnJvXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS5mYWlsKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRVSS50b2FzdC5vcGVuKFwiT2NvcnJldSB1bSBlcnJvLiBUZW50ZSBub3ZhbWVudGVcIiwgbnVsbCwgbnVsbCwgZmFsc2UpO1xuXHRcdFx0XHRhbmFseXRpY3MoXCJDb250ZcO6ZG9cIiwgXCJFcnJvXCIpO1xuXHRcdFx0fSk7XG5cblx0XHR9KS5vbihcImNsaWNrXCIsIFwiLmJhY2stYnV0dG9uXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0YXBwLlBvc3QuY2xvc2UoKTtcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlBvc3QuYXV0aG9yaXplKClcblx0XHRhdXRob3JpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gaGFiaWxpdGEgbyBib3TDo28gZW52aWFyXG5cdFx0XHQkKFwiLnN1Ym1pdC1idXR0b25cIiwgJGFwcFtcInBvc3RcIl0pLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlBvc3QuZGVhdXRob3JpemUoKVxuXHRcdGRlYXV0aG9yaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIGRlc2FiaWxpdGEgbyBib3TDo28gXCJlbnZpYXJcIlxuXHRcdFx0JChcIi5zdWJtaXQtYnV0dG9uXCIsICRhcHBbXCJwb3N0XCJdKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Qb3N0LmdldFRodW1ibmFpbCgpXG5cdFx0Z2V0VGh1bWJuYWlsOiBmdW5jdGlvbih1cmwpIHtcblx0XHRcdC8vIHRlc3RhIHNlIHVybHMgc8OjbyBkb3MgcHJvdmlkZXIgYWNlaXRvcyBlIHJlc3BvbmRlIGNvbSBpbmZvcm1hw6fDtWVzIHNvYnJlIG8gdsOtZGVvLFxuXHRcdFx0Ly8gaW5jbHVpbmRvIGEgdXJsIGRhIG1pbmlhdHVyYVxuXHRcdFx0Ly8gcHJvdmlkZXJzIGFjZWl0b3M6IHlvdXR1YmUsIHZpbWVvLCB2aW5lXG5cdFx0XHR2YXIgbWVkaWFfaW5mbyA9IHsgfTtcblxuXHRcdFx0ZnVuY3Rpb24gc2hvd1RodW1ibmFpbChtZWRpYV9pbmZvKSB7XG5cdFx0XHRcdHZhciAkdGh1bWJuYWlsID0gJChcIjxpbWcgLz5cIikuYXR0cihcInNyY1wiLCBtZWRpYV9pbmZvW1widGh1bWJuYWlsXCJdKTtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS1wcm92aWRlclwiLCAkYXBwW1wicG9zdFwiXSkudmFsKG1lZGlhX2luZm9bXCJwcm92aWRlclwiXSk7XG5cdFx0XHRcdCQoXCIuanMtbWVkaWEtaWRcIiwgJGFwcFtcInBvc3RcIl0pLnZhbChtZWRpYV9pbmZvW1wiaWRcIl0pO1xuXHRcdFx0XHQkKFwiLmpzLW1lZGlhLXRodW1ibmFpbFwiLCAkYXBwW1wicG9zdFwiXSkudmFsKG1lZGlhX2luZm9bXCJ0aHVtYm5haWxcIl0pO1xuXHRcdFx0XHQkKFwiLmpzLW1lZGlhLXByZXZpZXdcIiwgJGFwcFtcInBvc3RcIl0pLmh0bWwoJHRodW1ibmFpbCkuZmFkZUluKCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHlvdXR1YmVcblx0XHRcdGlmICh1cmwubWF0Y2goLyg/Omh0dHBzPzpcXC97Mn0pPyg/Ond7M31cXC4pP3lvdXR1KD86YmUpP1xcLig/OmNvbXxiZSkoPzpcXC93YXRjaFxcP3Y9fFxcLykoW15cXHMmXSspLykpIHtcblx0XHRcdFx0Ly8gaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj00Y3Q0ZU5NckpsZ1xuXHRcdFx0XHR2YXIgeW91dHViZV91cmwgPSB1cmwubWF0Y2goLyg/Omh0dHBzPzpcXC97Mn0pPyg/Ond7M31cXC4pP3lvdXR1KD86YmUpP1xcLig/OmNvbXxiZSkoPzpcXC93YXRjaFxcP3Y9fFxcLykoW15cXHMmXSspLyk7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJwcm92aWRlclwiXSA9IFwieW91dHViZVwiO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1wiaWRcIl0gPSB5b3V0dWJlX3VybFsxXTtcblx0XHRcdC8vXHRtZWRpYV9pbmZvW1widGh1bWJuYWlsXCJdID0gXCJodHRwczovL2kxLnl0aW1nLmNvbS92aS9cIiArIHlvdXR1YmVfdXJsWzFdICsgXCIvbWF4cmVzZGVmYXVsdC5qcGdcIjtcblx0XHRcdFx0bWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSA9IFwiaHR0cHM6Ly9pMS55dGltZy5jb20vdmkvXCIgKyB5b3V0dWJlX3VybFsxXSArIFwiLzAuanBnXCI7XG5cblx0XHRcdFx0YXBwLlBvc3QuYXV0aG9yaXplKCk7XG5cdFx0XHRcdHNob3dUaHVtYm5haWwobWVkaWFfaW5mbyk7XG5cdFx0XHR9IGVsc2VcblxuXHRcdFx0Ly8gdmltZW9cblx0XHRcdGlmICh1cmwubWF0Y2goL3ZpbWVvXFwuY29tLykpIHtcblx0XHRcdFx0Ly8gaHR0cHM6Ly92aW1lby5jb20vNjQyNzk2NDlcblx0XHRcdFx0dmFyIHZpbWVvX3VybCA9IHVybC5tYXRjaCgvXFwvXFwvKHd3d1xcLik/dmltZW8uY29tXFwvKFxcZCspKCR8XFwvKS8pO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1wicHJvdmlkZXJcIl0gPSBcInZpbWVvXCI7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJpZFwiXSA9IHZpbWVvX3VybFsyXTtcblxuXHRcdFx0XHQkLmdldEpTT04oXCJodHRwczovL3ZpbWVvLmNvbS9hcGkvdjIvdmlkZW8vXCIgKyB2aW1lb191cmxbMl0gKyBcIi5qc29uP2NhbGxiYWNrPT9cIilcblx0XHRcdFx0XHQuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdFx0bWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSA9IHJlc3BvbnNlWzBdW1widGh1bWJuYWlsX2xhcmdlXCJdO1xuXG5cdFx0XHRcdFx0XHRhcHAuUG9zdC5hdXRob3JpemUoKTtcblx0XHRcdFx0XHRcdHNob3dUaHVtYm5haWwobWVkaWFfaW5mbyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlBvc3Qub3BlbigpXG5cdFx0b3BlbjogZnVuY3Rpb24odHlwZSwgbnVtZXJvKSB7XG5cdFx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdFx0XCJlZGljYW9cIjogTGlzdGEuRWRpY2FvW1widGl0dWxvXCJdLFxuXHRcdFx0XHRcIm51bWVyb1wiOiAobnVtZXJvIHx8IHRhcmVmYV9hY3RpdmUpLFxuXHRcdFx0XHRcInVzZXJcIjogTGlzdGEuVXN1YXJpb1tcImlkXCJdLFxuXHRcdFx0XHRcInR1cm1hXCI6IExpc3RhLlVzdWFyaW9bXCJ0dXJtYVwiXSxcblx0XHRcdFx0XCJ0b2tlblwiOiBMaXN0YS5Vc3VhcmlvW1widG9rZW5cIl1cblx0XHRcdH07XG5cdFx0XHR2YXIgJG5ld19wb3N0X3ZpZXcgPSBfX3JlbmRlcihcIm5ldy1wb3N0LVwiICsgdHlwZSwgZGF0YSk7XG5cblx0XHRcdC8vIGVmZWl0byBkZSBhYmVydHVyYVxuXHRcdFx0Ly8gX3ZpZXcub3BlbigkYXBwW1wicG9zdFwiXSwgJG5ld1Bvc3RWaWV3KTtcblx0XHRcdCRhcHBbXCJwb3N0XCJdLmh0bWwoJG5ld19wb3N0X3ZpZXcpLmFkZENsYXNzKFwiaW5cIikucmVmbG93KCkuYWRkQ2xhc3MoXCJzbGlkZS15XCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciB2aWV3X3RoZW1lX2NvbG9yID0gJChcIi5hcHBiYXJcIiwgJGFwcFtcInBvc3RcIl0pLmNzcyhcImJhY2tncm91bmQtY29sb3JcIik7XG5cdFx0XHRcdCQoXCJoZWFkIG1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKS5hdHRyKFwiY29udGVudFwiLCB2aWV3X3RoZW1lX2NvbG9yKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRhcHAuUG9zdC5kZWF1dGhvcml6ZSgpO1xuXG5cdFx0XHQvLyBhw6fDtWVzIHBhcmEgZmF6ZXIgcXVhbmRvIGFicmlyIGEgdGVsYSBkZSBlbnZpb1xuXHRcdFx0Ly8gZGUgYWNvcmRvIGNvbSBvIHRpcG8gZGUgcG9zdGFnZW1cblx0XHRcdGlmICh0eXBlID09PSBcInBob3RvXCIpIHtcblx0XHRcdFx0JGFwcFtcInBvc3RcIl0uZHJvcHpvbmUoKTtcblx0XHRcdFx0JChcIi5maWxlLXBsYWNlaG9sZGVyXCIsICRhcHBbXCJwb3N0XCJdKS50cmlnZ2VyKFwiY2xpY2tcIik7XG5cdFx0XHQvL1x0JChcImZvcm1cIiwgJG5ld19wb3N0X3ZpZXcpLmRyb3B6b25lKCk7XG5cdFx0XHR9IGVsc2VcblxuXHRcdFx0aWYgKHR5cGUgPT09IFwidmlkZW9cIiB8fCB0eXBlID09PSBcInZpbmVcIikge1xuXHRcdFx0XHQkKFwiLmpzLW1lZGlhLXVybC1pbnB1dFwiLCAkYXBwW1wicG9zdFwiXSkuZm9jdXMoKS5vbihcImtleXVwXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQvL1x0aWYgKCQuaW5BcnJheShldmVudC5rZXlDb2RlLCBbMTYsIDE3LCAxOF0pKSB7IHJldHVybjsgfVxuXHRcdFx0XHRcdGFwcC5Qb3N0LmdldFRodW1ibmFpbCgkKHRoaXMpLnZhbCgpKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2VcblxuXHRcdFx0aWYgKHR5cGUgPT09IFwidGV4dFwiKSB7XG5cdFx0XHRcdCQoXCIuanMtY2FwdGlvbi1pbnB1dFwiLCAkYXBwW1wicG9zdFwiXSkuZm9jdXMoKS5vbihcImtleXVwXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICgkKHRoaXMpLnZhbCgpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdGFwcC5Qb3N0LmF1dGhvcml6ZSgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRhcHAuUG9zdC5kZWF1dGhvcml6ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdFVJLmJhY2tkcm9wLnNob3coJGFwcFtcInBvc3RcIl0pO1xuXG5cdFx0XHQvLyB2aWV3IG1hbmFnZXJcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZXBsYWNlKFwibmV3LXBvc3RcIik7XG5cdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IFwidmlld1wiOiBcIm5ldy1wb3N0XCIsIFwidHlwZVwiOiB0eXBlLCBcImlkXCI6IGRhdGFbXCJudW1lcm9cIl0gfSwgbnVsbCwgbnVsbCk7XG5cdFx0fSxcblxuXHRcdC8vIHNlbmQ6IGZ1bmN0aW9uKCkge1xuXHRcdC8vXG5cdFx0Ly8gfSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlBvc3QuY2xvc2UoKVxuXHRcdGNsb3NlOiBmdW5jdGlvbigpIHtcblx0XHQvL1x0dGFyZWZhX2FjdGl2ZSA9IG51bGw7XG5cdFx0XHQkKFwiaGVhZCBtZXRhW25hbWU9J3RoZW1lLWNvbG9yJ11cIikuYXR0cihcImNvbnRlbnRcIiwgVUkuZGF0YVtcInRoZW1lLWNvbG9yXCJdW1wib3JpZ2luYWxcIl0pO1xuXG5cdFx0XHQkYXBwW1wicG9zdFwiXS5yZW1vdmVDbGFzcyhcInNsaWRlLXlcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGFwcFtcInBvc3RcIl0ucmVtb3ZlQ2xhc3MoXCJpblwiKS5lbXB0eSgpO1xuXHRcdFx0XHRVSS5iYWNrZHJvcC5oaWRlKCRhcHBbXCJwb3N0XCJdKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0ucmVwbGFjZShcInRhcmVmYVwiKTtcblx0XHR9XG5cdH07XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gaW1hZ2UgdXBsb2FkIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xudmFyIGZpbGVfc3RhY2sgPSB7IH07XG5cbmZ1bmN0aW9uIHVwbG9hZChmaWxlcykge1xuXHRsZXQgZXhpZl9vcmllbnRhdGlvbl90b19kZWdyZWVzID0ge1xuXHRcdDA6IDAsXG5cdFx0MTogMCxcblx0XHQyOiAwLFxuXHRcdDM6IDE4MCxcblx0XHQ0OiAwLFxuXHRcdDU6IDAsXG5cdFx0NjogOTAsXG5cdFx0NzogMCxcblx0XHQ4OiAyNzBcblx0fTtcblxuXHRGaWxlQVBJLmZpbHRlckZpbGVzKGZpbGVzLCBmdW5jdGlvbihmaWxlLCBpbmZvKSB7XG5cdFx0aWYgKC9eaW1hZ2UvLnRlc3QoZmlsZS50eXBlKSkge1xuXHRcdFx0ZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV0gPSBpbmZvO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0Ly9cdHJldHVybiBpbmZvLndpZHRoID49IDMyMCAmJiBpbmZvLmhlaWdodCA+PSAyNDA7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSwgZnVuY3Rpb24oZmlsZXMsIHJlamVjdGVkKSB7XG5cdFx0aWYgKGZpbGVzLmxlbmd0aCkge1xuXHRcdFx0JChcIi5zdWJtaXRcIiwgJGFwcFtcInBvc3RcIl0pLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG5cblx0XHRcdC8vIHByZXZpZXdcblx0XHRcdEZpbGVBUEkuZWFjaChmaWxlcywgZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0XHR2YXIgZXhpZl9vcmllbnRhdGlvbiA9IGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wiZXhpZlwiXVtcIk9yaWVudGF0aW9uXCJdO1xuXHRcdFx0XHRmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXSA9IHRhcmVmYV9hY3RpdmUgKyBcIi1cIiArIExpc3RhLlVzdWFyaW9bXCJpZFwiXSArIFwiLVwiICtcblx0XHRcdFx0XHRtb21lbnQoKS5mb3JtYXQoXCJYXCIpICsgXCItXCIgKyByYW5kKDAsIDk5OSkudG9GaXhlZCgwKTtcblxuXHRcdFx0XHRpZiAoZmlsZVtcInR5cGVcIl0gPT0gXCJpbWFnZS9naWZcIikge1xuXHRcdFx0XHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdFx0XHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0dmFyIGltZyA9ICQoXCI8aW1nIC8+XCIpLmF0dHIoXCJzcmNcIiwgZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG5cdFx0XHRcdFx0XHR2YXIgJHRyYWNrZXIgPSAkKFwiPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiaW1hZ2Utb3JkZXJbXVxcXCIgLz5cIikudmFsKGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdKTtcblxuXHRcdFx0XHRcdFx0dmFyICRzdGF0dXMgPSAkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcInByb2dyZXNzXCIpO1xuXHRcdFx0XHRcdFx0JChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJzdGF0dXNcIikuaHRtbChcIjxzdHJvbmc+RW52aWFuZG8maGVsbGlwOzwvc3Ryb25nPlwiKS5hcHBlbmRUbygkc3RhdHVzKTtcblx0XHRcdFx0XHRcdCQoXCI8ZGl2IC8+XCIpLmFkZENsYXNzKFwiYmFyXCIpLmFwcGVuZFRvKCRzdGF0dXMpO1xuXG5cdFx0XHRcdFx0XHR2YXIgJHByZXZpZXcgPSAkKFwiPGxpIC8+XCIpLmF0dHIoXCJpZFwiLCBcImZpbGUtXCIgK1xuXHRcdFx0XHRcdFx0XHRcdGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdKS5hcHBlbmQoJHRyYWNrZXIpLmFwcGVuZCgkc3RhdHVzKS5hcHBlbmQoaW1nKTtcblx0XHRcdFx0XHRcdCQoXCIjZHJvcHpvbmUgI2JvYXJkXCIpLmFwcGVuZCgkcHJldmlldyk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRGaWxlQVBJXG5cdFx0XHRcdFx0XHQuSW1hZ2UoZmlsZSlcblx0XHRcdFx0XHRcdC5yb3RhdGUoZXhpZl9vcmllbnRhdGlvbl90b19kZWdyZWVzW2V4aWZfb3JpZW50YXRpb25dKVxuXHRcdFx0XHRcdFx0LnJlc2l6ZSg2MDAsIDMwMCwgXCJwcmV2aWV3XCIpXG5cdFx0XHRcdFx0XHQuZ2V0KGZ1bmN0aW9uKGVyciwgaW1nKSB7XG5cdFx0XHRcdFx0XHQvL1x0JHRyYWNrZXIgPSAkKFwiPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiaW1hZ2Utb3JkZXJbXVxcXCIgLz5cIilcblx0XHRcdFx0XHRcdC8vXHRcdC52YWwodGFyZWZhX2FjdGl2ZSArIFwiLVwiICsgTGlzdGEuVXN1YXJpb1tcImlkXCJdICsgXCItXCIgKyBmaWxlW1wibmFtZVwiXSk7XG5cdFx0XHRcdFx0XHRcdHZhciAkdHJhY2tlciA9ICQoXCI8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJpbWFnZS1vcmRlcltdXFxcIiAvPlwiKS52YWwoZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0pO1xuXG5cdFx0XHRcdFx0XHRcdHZhciAkc3RhdHVzID0gJChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJwcm9ncmVzc1wiKTtcblx0XHRcdFx0XHRcdFx0JChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJzdGF0dXNcIikuaHRtbChcIjxzdHJvbmc+RW52aWFuZG8maGVsbGlwOzwvc3Ryb25nPlwiKS5hcHBlbmRUbygkc3RhdHVzKTtcblx0XHRcdFx0XHRcdFx0JChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJiYXJcIikuYXBwZW5kVG8oJHN0YXR1cyk7XG5cblx0XHRcdFx0XHRcdFx0dmFyICRwcmV2aWV3ID0gJChcIjxsaSAvPlwiKS5hdHRyKFwiaWRcIiwgXCJmaWxlLVwiICtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdKS5hcHBlbmQoJHRyYWNrZXIpLmFwcGVuZCgkc3RhdHVzKS5hcHBlbmQoaW1nKTtcblx0XHRcdFx0XHRcdFx0JChcIiNkcm9wem9uZSAjYm9hcmRcIikuYXBwZW5kKCRwcmV2aWV3KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gdXBsb2FkXG5cdFx0XHRGaWxlQVBJLnVwbG9hZCh7XG5cdFx0XHRcdHVybDogXCIvdGFyZWZhcy9cIiArIHRhcmVmYV9hY3RpdmUgKyBcIi9wb3N0YXJcIixcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFwiYWN0aW9uXCI6IFwidXBsb2FkXCIsXG5cdFx0XHRcdFx0XCJlZGljYW9cIjogTGlzdGEuRWRpY2FvW1widGl0dWxvXCJdLFxuXHRcdFx0XHRcdFwidGFyZWZhXCI6IHRhcmVmYV9hY3RpdmUsXG5cdFx0XHRcdFx0XCJ0dXJtYVwiOiBMaXN0YS5Vc3VhcmlvW1widHVybWFcIl0sXG5cdFx0XHRcdFx0XCJ1c2VyXCI6IExpc3RhLlVzdWFyaW9bXCJpZFwiXVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmVwYXJlOiBmdW5jdGlvbihmaWxlLCBvcHRpb25zKSB7XG5cdFx0XHRcdFx0b3B0aW9ucy5kYXRhLnJlZiA9IGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdO1xuXHRcdFx0XHRcdGZpbGUucmVmID0gZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl07XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0aW1hZ2VBdXRvT3JpZW50YXRpb246IChmaWxlc1swXVtcInR5cGVcIl0gIT09IFwiaW1hZ2UvZ2lmXCI/IHRydWUgOiBudWxsKSxcblx0XHRcdFx0aW1hZ2VUcmFuc2Zvcm06IChmaWxlc1swXVtcInR5cGVcIl0gIT09IFwiaW1hZ2UvZ2lmXCI/IHtcblx0XHRcdFx0XHRtYXhXaWR0aDogMTkyMCxcblx0XHRcdFx0XHRtYXhIZWlnaHQ6IDE5MjBcblx0XHRcdFx0fSA6IG51bGwpLFxuXG5cdFx0XHRcdGZpbGVzOiBmaWxlcyxcblx0XHRcdFx0ZmlsZXByb2dyZXNzOiBmdW5jdGlvbihldmVudCwgZmlsZSwgeGhyKSB7XG5cdFx0XHRcdFx0dmFyIHBlcmNlbnQgPSAoKGV2ZW50W1wibG9hZGVkXCJdIC8gZXZlbnRbXCJ0b3RhbFwiXSkgKiAxMDApLnRvRml4ZWQoMCksXG5cdFx0XHRcdFx0XHRzdGF0dXMgPSAocGVyY2VudCA8IDEwMD8gXCI8c3Ryb25nPkVudmlhbmRvJmhlbGxpcDs8L3N0cm9uZz4gXCIgK1xuXHRcdFx0XHRcdFx0XHRcdHBlcmNlbnQgKyBcIiVcIiA6IFwiPHN0cm9uZz5Qcm9jZXNzYW5kbyZoZWxsaXA7PC9zdHJvbmc+XCIpO1xuXG5cdFx0XHRcdFx0JChcIiNmaWxlLVwiICsgZmlsZVtcInJlZlwiXSArIFwiIC5zdGF0dXNcIiwgXCIjZHJvcHpvbmVcIikuaHRtbChzdGF0dXMpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcm9ncmVzczogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0Ly9cdHZhciBwZXJjZW50ID0gKChldmVudFtcImxvYWRlZFwiXSAvIGV2ZW50W1widG90YWxcIl0pICogMTAwKS50b0ZpeGVkKDApICsgXCIlXCJcblx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKHBlcmNlbnQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRmaWxlY29tcGxldGU6IGZ1bmN0aW9uKGZpbGUsIHhociwgb3B0aW9ucykge1xuXHRcdFx0XHQvL1x0Y29uc29sZS5sb2coZmlsZSwgeGhyLCBvcHRpb25zKTtcblx0XHRcdFx0XHQkKFwiI2ZpbGUtXCIgKyBvcHRpb25zW1wicmVmXCJdICsgXCIgLnN0YXR1c1wiLCBcIiNkcm9wem9uZVwiKS5odG1sKFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj5jaGVjazwvaT5cIik7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbihlcnIsIHhocikge1xuXHRcdFx0XHRcdGFwcC5Qb3N0LmF1dGhvcml6ZSgpO1xuXHRcdFx0XHRcdC8vICQoXCIuc3VibWl0LWJ1dHRvblwiLCAkYXBwW1wicG9zdFwiXSkucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuJC5mbi5kcm9wem9uZSA9IGZ1bmN0aW9uKCkge1xuXHQvLyBkcm9wem9uZVxuXHR2YXIgJGRyb3B6b25lID0gJChcIiNkcm9wem9uZVwiLCB0aGlzKTtcblx0RmlsZUFQSS5ldmVudC5kbmQoJGRyb3B6b25lWzBdLCBmdW5jdGlvbihvdmVyKSB7XG5cdFx0aWYgKG92ZXIpIHtcblx0XHRcdCRkcm9wem9uZS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JGRyb3B6b25lLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuXHRcdH1cblx0fSwgZnVuY3Rpb24oZmlsZXMpIHtcblx0XHR1cGxvYWQoZmlsZXMpO1xuXHR9KTtcblxuXHQvLyBtYW51YWwgc2VsZWN0XG5cdHZhciAkZmlsZV9pbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZm9ybS1maWxlXCIpO1xuXHRGaWxlQVBJLmV2ZW50Lm9uKCRmaWxlX2lucHV0LCBcImNoYW5nZVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciBmaWxlcyA9IEZpbGVBUEkuZ2V0RmlsZXMoZXZlbnQpO1xuXHRcdHVwbG9hZChmaWxlcyk7XG5cdH0pO1xuXG5cdC8vIHJlb3JkZXJcblx0dmFyICRib2FyZCA9ICQoXCIjYm9hcmRcIiwgdGhpcyk7XG5cdCRib2FyZC5vbihcInNsaXA6YmVmb3Jld2FpdFwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmIChVSS5kYXRhW1wiaW50ZXJhY3Rpb24tdHlwZVwiXSA9PT0gXCJwb2ludGVyXCIpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHR9KS5vbihcInNsaXA6YWZ0ZXJzd2lwZVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnRhcmdldC5yZW1vdmUoKTtcblx0fSkub24oXCJzbGlwOnJlb3JkZXJcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XG5cdFx0ZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGV2ZW50LnRhcmdldCwgZXZlbnQuZGV0YWlsLmluc2VydEJlZm9yZSk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcblxuXHRuZXcgU2xpcCgkYm9hcmRbMF0pO1xufTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGxvZ2luIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5Mb2dpbi5vcGVuKClcbi8vIGFwcC5Mb2dpbi5jbG9zZSgpXG4vLyBhcHAuTG9naW4uc3VibWl0KCkgWz9dXG4vLyBhcHAuTG9naW4ubG9nb3V0KClcblxuYXBwLkxvZ2luID0gKGZ1bmN0aW9uKCkge1xuXHRMaXN0YS5Vc3VhcmlvID0ge1xuXHRcdFwiaWRcIjogbnVsbCxcblx0XHRcIm5hbWVcIjogbnVsbCxcblx0XHRcImVtYWlsXCI6IG51bGwsXG5cdFx0XCJ0b2tlblwiOiBudWxsLFxuXHRcdFwidHVybWFcIjogbnVsbCxcblx0XHRcInNpZ25lZC1pblwiOiBmYWxzZVxuXHR9O1xuXG5cdC8vIFNlIHRpdmVyIGRhZG9zIGd1YXJkYWRvcyBubyBsb2NhbFN0b3JhZ2UsIHVzYSBlbGVzIHByYSBsb2dhclxuXHRpZiAobG9jYWxTdG9yYWdlICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiTGlzdGEuVXN1YXJpb1wiKSkge1xuXHRcdExpc3RhLlVzdWFyaW8gPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiTGlzdGEuVXN1YXJpb1wiKSk7XG5cblx0XHQkKGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKExpc3RhLlVzdWFyaW9bXCJpZFwiXSAhPT0gbnVsbCkge1xuXHRcdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwic2lnbmVkLWluIHVzZXItXCIgKyBMaXN0YS5Vc3VhcmlvW1widHVybWFcIl0pO1xuXG5cdFx0XHRcdC8vIE1vc3RyYSB0b2FzdCBzb21lbnRlIGFww7NzIDMgc2VndW5kb3Ncblx0XHRcdFx0Ly8gZGVwb2lzIGRvIGxvYWQgZGEgTGlzdGFcblx0XHRcdFx0Y3VlW1wibG9hZC1lZGljYW9cIl0uZG9uZShmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0VUkudG9hc3Quc2hvdyhcIk9sw6EgXCIgKyBMaXN0YS5Vc3VhcmlvW1wibmFtZVwiXSArIFwiIVwiKTtcblx0XHRcdFx0XHR9LCAzMDAwKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcImxvZ2luXCJdID0gJChcIi5hcHAtbG9naW5cIik7XG5cdFx0JHVpW1wibG9naW5cIl1bXCJidXR0b25cIl0gPSAkKFwiLmpzLWxvZ2luLWJ1dHRvblwiLCAkdWlbXCJsb2dpblwiXSk7XG5cblx0XHQvLyBCb3TDtWVzIGRlIGxvZ2luIGUgbG9nb3V0XG5cdFx0JChcIi5qcy1sb2dpbi10cmlnZ2VyXCIsICR1aVtcInNpZGVuYXZcIl0pLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRVSS5zaWRlbmF2LmNsb3NlKCk7XG5cdFx0XHRhcHAuTG9naW4uc2hvdygpO1xuXHRcdH0pO1xuXG5cdFx0JChcIi5qcy1sb2dvdXQtdHJpZ2dlclwiLCAkdWlbXCJzaWRlbmF2XCJdKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0VUkuc2lkZW5hdi5jbG9zZSgpO1xuXHRcdFx0YXBwLkxvZ2luLmxvZ291dCgpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQcOnw6NvIGRlIGxvZ2luXG5cdFx0JHVpW1wibG9naW5cIl0ub24oXCJjbGlja1wiLCBcIi5iYWNrLWJ1dHRvblwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGFwcC5Mb2dpbi5oaWRlKCk7XG5cdFx0fSkub24oXCJzdWJtaXRcIiwgXCJmb3JtXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHQkKFwiLmpzLWxvZ2luLWJ1dHRvblwiLCAkdWlbXCJmb3JtXCJdKS50cmlnZ2VyKFwiY2xpY2tcIik7XG5cdFx0XHRsZXQgbG9naW5fZGF0YSA9ICQoXCJmb3JtXCIsICR1aVtcImxvZ2luXCJdKS5zZXJpYWxpemUoKTtcblx0XHRcdGFwcC5Mb2dpbi5zdWJtaXQobG9naW5fZGF0YSk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTG9naW4uc2hvdygpXG5cdFx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBBYnJlIGEgdGVsYSBkZSBsb2dpbiBlIGNvbG9jYSBvIGZvY28gbm8gY2FtcG8gZS1tYWlsXG5cdFx0XHQkdWlbXCJsb2dpblwiXS5hZGRDbGFzcyhcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0VUkuYm9keS5sb2NrKCk7XG5cdFx0XHRcdFVJLmJhY2tkcm9wLnNob3coJHVpW1wibG9naW5cIl0pO1xuXHRcdFx0XHQkKFwiaW5wdXRbbmFtZT0nZW1haWwnXVwiLCAkdWlbXCJsb2dpblwiXSkuZm9jdXMoKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Mb2dpbi5oaWRlKClcblx0XHRoaWRlOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcImxvZ2luXCJdLnJlbW92ZUNsYXNzKFwic2xpZGVcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JHVpW1wibG9naW5cIl0ucmVtb3ZlQ2xhc3MoXCJpblwiKTtcblx0XHRcdFx0VUkuYmFja2Ryb3AuaGlkZSgkdWlbXCJsb2dpblwiXSk7XG5cdFx0XHRcdFVJLmJvZHkudW5sb2NrKCk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTG9naW4uc3VibWl0KClcblx0XHRzdWJtaXQ6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdC8vIERlc2F0aXZhIG8gYm90w6NvIGUgY29sb2NhIG1lbnNhZ2VtIGRlIGVzcGVyYVxuXHRcdFx0JHVpW1wibG9naW5cIl1bXCJidXR0b25cIl1cblx0XHRcdFx0LnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKVxuXHRcdFx0XHQudGV4dChcIkFndWFyZGXigKZcIik7XG5cblx0XHRcdC8vIEVudmlhIHBlZGlkbyBwYXJhIGEgQVBJXG5cdFx0XHRMaXN0YUFQSShcIi9pZGVudGlmaWNhY2FvXCIsIGRhdGEpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKHJlc3BvbnNlW1wibWV0YVwiXVtcInN0YXR1c1wiXSA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0TGlzdGEuVXN1YXJpbyA9IHJlc3BvbnNlW1widXNlclwiXTtcblx0XHRcdFx0XHRMaXN0YS5Vc3VhcmlvW1wic2lnbmVkLWluXCJdID0gdHJ1ZTtcblx0XHRcdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIkxpc3RhLlVzdWFyaW9cIiwgSlNPTi5zdHJpbmdpZnkoTGlzdGEuVXN1YXJpbykpO1xuXG5cdFx0XHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInNpZ25lZC1pbiB1c2VyLVwiICsgTGlzdGEuVXN1YXJpb1tcInR1cm1hXCJdKTtcblx0XHRcdFx0XHRhcHAuTG9naW4uaGlkZSgpO1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRVSS50b2FzdC5zaG93KFwiT2zDoSBcIiArIExpc3RhLlVzdWFyaW9bXCJuYW1lXCJdICsgXCIhXCIpO1xuXHRcdFx0XHRcdH0sIDUwMCk7XG5cblx0XHRcdFx0XHRhbmFseXRpY3MoXCJMb2dpblwiLCBcIkFjZXNzb1wiKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBTZSB0ZW50YXRpdmEgZm9yIHJlY3VzYWRhLFxuXHRcdFx0XHRcdC8vIGNvbG9jYSBhbmltYcOnw6NvIG5vIGNhbXBvIGRlIGxvZ2luIHBvciAxIHNlZ3VuZG9cblx0XHRcdFx0XHQkKFwiLmZvcm0tZ3JvdXBcIiwgJHVpW1wibG9naW5cIl0pLmFkZENsYXNzKFwiYW5pbWF0ZWQgc2hha2VcIik7XG5cblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0JChcIi5mb3JtLWdyb3VwXCIsICR1aVtcImxvZ2luXCJdKS5yZW1vdmVDbGFzcyhcImFuaW1hdGVkIHNoYWtlXCIpO1xuXHRcdFx0XHRcdH0sIDEwMDApO1xuXG5cdFx0XHRcdFx0YW5hbHl0aWNzKFwiTG9naW5cIiwgXCJFcnJvXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS5mYWlsKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRVSS50b2FzdC5zaG93KFwiT2NvcnJldSB1bSBlcnJvLiBUZW50ZSBub3ZhbWVudGVcIik7XG5cdFx0XHRcdGFuYWx5dGljcyhcIkxvZ2luXCIsIFwiRXJyb1wiKTtcblx0XHRcdH0pLmFsd2F5cyhmdW5jdGlvbigpIHtcblx0XHRcdFx0JHVpW1wibG9naW5cIl1bXCJidXR0b25cIl1cblx0XHRcdFx0XHQucHJvcChcImRpc2FibGVkXCIsIGZhbHNlKVxuXHRcdFx0XHRcdC50ZXh0KFwiTG9naW5cIik7XG5cdFx0XHRcdGFuYWx5dGljcyhcIkxvZ2luXCIsIFwiVGVudGF0aXZhXCIpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxvZ2luLmxvZ291dCgpXG5cdFx0bG9nb3V0OiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIFRpcmEgYXMgY2xhc3NlcyBpbmRpY2Fkb3JhcyBkZSBsb2dpbiBkbyBib2R5XG5cdFx0XHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwic2lnbmVkLWluIHVzZXItXCIgKyBMaXN0YS5Vc3VhcmlvW1widHVybWFcIl0pO1xuXG5cdFx0XHQvLyBMaW1wYSBMaXN0YS5Vc3VhcmlvIHRhbnRvIG5hIHDDoWdpbmEgcXVhbnRvIG5vIGxvY2FsU3RvcmFnZVxuXHRcdFx0TGlzdGEuVXN1YXJpbyA9IHtcblx0XHRcdFx0XCJpZFwiOiBudWxsLFxuXHRcdFx0XHRcIm5hbWVcIjogbnVsbCxcblx0XHRcdFx0XCJlbWFpbFwiOiBudWxsLFxuXHRcdFx0XHRcInRva2VuXCI6IG51bGwsXG5cdFx0XHRcdFwidHVybWFcIjogbnVsbCxcblx0XHRcdFx0XCJzaWduZWQtaW5cIjogZmFsc2Vcblx0XHRcdH07XG5cblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiTGlzdGEuVXN1YXJpb1wiLCBKU09OLnN0cmluZ2lmeShMaXN0YS5Vc3VhcmlvKSk7XG5cblx0XHRcdC8vIERlcG9pcyBkZSAwLDUgc2VndW5kbyxcblx0XHRcdC8vIG1vc3RyYSB0b2FzdCBjb25maXJtYW5kbyBsb2dvdXRcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFVJLnRvYXN0LnNob3coXCJTZXNzw6NvIGVuY2VycmFkYSFcIik7XG5cdFx0XHR9LCA1MDApO1xuXG5cdFx0XHRhbmFseXRpY3MoXCJMb2dpblwiLCBcIkxvZ291dFwiKTtcblx0XHR9XG5cdH07XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gd29ya2VycyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBzdGFydFxud29ya2VyLlN0YXJ0ID0gKGZ1bmN0aW9uKCkge1xuXHR0aW1pbmdbXCJkZWxheS1zdGFydFwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0bG9nKFwid29ya2VyLlN0YXJ0XCIsIFwiaW5mb1wiKTtcblxuXHRcdGN1ZVtcImxvYWQtZWRpY2FvXCJdID0gJC5EZWZlcnJlZCgpO1xuXHRcdGN1ZVtcImZpcnN0LWxvYWRcIl0gPSB0cnVlO1xuXG5cdFx0Y3VlW1wibG9hZC1lZGljYW9cIl0uZG9uZShmdW5jdGlvbigpIHtcblx0XHRcdC8vIFNlIHRpdmVyIG7Dum1lcm8gZGUgdGFyZWZhIGVzcGVjaWZpY2FkbyBuYSBVUkwsIGFicmUgZWxhXG5cdFx0XHRpZiAocm91dGVyW1wicGF0aFwiXSAmJiByb3V0ZXJbXCJwYXRoXCJdWzJdKSB7XG5cdFx0XHRcdC8vIEFudGVzLCB0ZXN0YSBzZSBvIHZhbG9yIMOpIHVtIG7Dum1lcm9cblx0XHRcdFx0Ly8gZSBkZW50cm8gZG8gbsO6bWVybyBkZSB0YXJlZmFzIGRlc3NhIEVkacOnw6NvXG5cdFx0XHRcdGxldCBudW1lcm8gPSByb3V0ZXJbXCJwYXRoXCJdWzJdO1xuXHRcdFx0XHRpZiAoIWlzTmFOKG51bWVybykgJiYgbnVtZXJvID49IDEgJiYgbnVtZXJvIDw9IExpc3RhLkVkaWNhb1tcIm51bWVyby1kZS10YXJlZmFzXCJdKSB7XG5cdFx0XHRcdFx0YXBwLlRhcmVmYS5vcGVuKG51bWVybywgZmFsc2UsIGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBTZSBmb3IgbyBwcmltZWlybyBsb2FkXG5cdFx0XHRpZiAoY3VlW1wiZmlyc3QtbG9hZFwiXSkge1xuXHRcdFx0XHQvLyBJbmljaWEgYSBiYXJyYSBkZSBldm9sdcOnw6NvXG5cdFx0XHRcdHRpbWluZ1tcImRlbGF5LWV2b2x1Y2FvXCJdID0gc2V0VGltZW91dChhcHAuRXZvbHVjYW8uc3RhcnQsIDEwMCk7XG5cblx0XHRcdFx0Ly8gSW5pY2lhIGEgY2hlY2FnZW0gZGUgYXRpdmlkYWRlXG5cdFx0XHRcdHdvcmtlci5VcGRhdGUoKTtcblxuXHRcdFx0XHQvLyBEZXNhdGl2YSBub3MgbG9hZHMgc2VndWludGVzXG5cdFx0XHRcdGN1ZVtcImZpcnN0LWxvYWRcIl0gPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gYXBwLlBsYWNhci5zdGFydCgpO1xuXHRcdH0pO1xuXG5cdFx0dGltaW5nW1wiZGVsYXktbG9hZFwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHR3b3JrZXIuTG9hZCgpO1xuXHRcdH0sIDMwMCk7XG5cblx0XHRhbmFseXRpY3MoXCJMaXN0YVwiLCBcIkFjZXNzb1wiKTtcblx0fSwgMCk7XG59KSgpO1xuXG5cbi8vIGxvYWRcbndvcmtlci5Mb2FkID0gKGZ1bmN0aW9uKCkge1xuXHRsb2coXCJ3b3JrZXIuTG9hZFwiLCBcImluZm9cIik7XG5cblx0TGlzdGFBUEkoXCIvdHVkb1wiKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0TGlzdGEuRWRpY2FvID0gcmVzcG9uc2VbXCJlZGljYW9cIl07XG5cdFx0TGlzdGEuUGxhY2FyID0gcmVzcG9uc2VbXCJwbGFjYXJcIl07XG5cdFx0TGlzdGEuVGFyZWZhcyA9IHJlc3BvbnNlW1widGFyZWZhc1wiXTtcblxuXHRcdHRpbWluZ1tcImRlbGF5LWxpc3RhXCJdID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdC8vIERpc3BhcmEgYSBmdW7Dp8OjbyBkZSBtb250YWdlbSBkYSBMaXN0YVxuXHRcdFx0YXBwLkxpc3RhLnN0YXJ0KCk7XG5cdFx0XHRhcHAuUGxhY2FyLnVwZGF0ZSgpO1xuXG5cdFx0XHQvLyBSZXNvbHZlIGEgcHJvbWlzZSBsb2FkLWVkaWNhb1xuXHRcdFx0Y3VlW1wibG9hZC1lZGljYW9cIl0ucmVzb2x2ZSgpO1xuXHRcdFx0bG9nKFwiY3VlW1xcXCJsb2FkLWVkaWNhb1xcXCJdIHRyaWdnZXJlZFwiKTtcblx0XHR9LCAxKTtcblxuXHRcdC8vIHRpbWluZ1tcImRlbGF5LXBsYWNhclwiXSA9IHNldFRpbWVvdXQoYXBwLlBsYWNhci5zdGFydCwgNDAwKTtcblx0fSk7XG59KTtcblxuXG4vLyB1cGRhdGVcbndvcmtlci5VcGRhdGUgPSAoZnVuY3Rpb24oKSB7XG5cdGxldCB1cGRhdGVzID0ge1xuXHRcdFwidGFyZWZhc1wiOiAwLFxuXHRcdFwicG9zdHNcIjogMCxcblx0XHRcInRvdGFsXCI6IDAsXG5cdFx0XCJsYXN0LXVwZGF0ZWRcIjogbnVsbFxuXHR9O1xuXG5cdHRpbWluZ1tcImF0aXZpZGFkZVwiXSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdGxvZyhcIndvcmtlci5VcGRhdGVcIiwgXCJpbmZvXCIpO1xuXG5cdFx0TGlzdGFBUEkoXCIvYXRpdmlkYWRlXCIpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdC8vIGNvbnNvbGUuaW5mbyh1cGRhdGVzKTtcblx0XHRcdC8vIENvbmZlcmUgZGF0YSBkZSBjYWRhIGF0aXZpZGFkZSBlIHbDqiBzZSDDqSBwb3N0ZXJpb3Igw6Agw7psdGltYSBhdHVhbGl6YcOnw6NvLlxuXHRcdFx0Ly8gU2UgZm9yLCBhZGljaW9uYSDDoCBjb250YWdlbSBkZSBub3ZhIGF0aXZpZGFkZVxuXHRcdFx0Zm9yIChsZXQgYXRpdmlkYWRlIG9mIHJlc3BvbnNlKSB7XG5cdFx0XHRcdC8vIGNvbnNvbGUubG9nKG1vbWVudChhdGl2aWRhZGVbXCJ0c1wiXSkuaXNBZnRlcih1cGRhdGVzW1wibGFzdC11cGRhdGVkXCJdKSk7XG5cdFx0XHRcdGlmIChtb21lbnQoYXRpdmlkYWRlW1widHNcIl0pLmlzQWZ0ZXIodXBkYXRlc1tcImxhc3QtdXBkYXRlZFwiXSkgJiYgYXRpdmlkYWRlW1wiYXV0b3JcIl0gIT0gTGlzdGEuVXN1YXJpb1tcImlkXCJdKSB7XG5cdFx0XHRcdFx0dXBkYXRlc1tcInRvdGFsXCJdKys7XG5cblx0XHRcdFx0XHRpZiAoYXRpdmlkYWRlW1wiYWNhb1wiXSA9PT0gXCJub3ZhLXRhcmVmYVwiKSB7XG5cdFx0XHRcdFx0XHR1cGRhdGVzW1widGFyZWZhc1wiXSsrO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoYXRpdmlkYWRlW1wiYWNhb1wiXSA9PT0gXCJub3ZvLXBvc3RcIikge1xuXHRcdFx0XHRcdFx0dXBkYXRlc1tcInBvc3RzXCJdKys7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNlIGhvdXZlciBub3ZhIGF0aXZpZGFkZVxuXHRcdFx0aWYgKHVwZGF0ZXNbXCJ0b3RhbFwiXSA+IDApIHtcblx0XHRcdFx0Ly8gTW9udGEgbyB0ZXh0byBkbyB0b2FzdFxuXHRcdFx0XHRsZXQgdGV4dG8gPSB7XG5cdFx0XHRcdFx0XCJ0YXJlZmFzXCI6IHVwZGF0ZXNbXCJ0YXJlZmFzXCJdICsgXCIgXCIgKyAodXBkYXRlc1tcInRhcmVmYXNcIl0gPiAxPyBcIm5vdmFzIHRhcmVmYXNcIiA6IFwibm92YSB0YXJlZmFcIiksXG5cdFx0XHRcdFx0XCJwb3N0c1wiOiB1cGRhdGVzW1wicG9zdHNcIl0gKyBcIiBcIiArICh1cGRhdGVzW1wicG9zdHNcIl0gPiAxPyBcIm5vdm9zIHBvc3RzXCIgOiBcIm5vdm8gcG9zdFwiKSxcblx0XHRcdFx0XHRcImZpbmFsXCI6IFwiXCJcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAodXBkYXRlc1tcInRhcmVmYXNcIl0gPiAwKSB7XG5cdFx0XHRcdFx0dGV4dG9bXCJmaW5hbFwiXSArPSB0ZXh0b1tcInRhcmVmYXNcIl07XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCh1cGRhdGVzW1widGFyZWZhc1wiXSA+IDApICYmICh1cGRhdGVzW1wicG9zdHNcIl0gPiAwKSkge1xuXHRcdFx0XHRcdHRleHRvW1wiZmluYWxcIl0gKz0gXCIgZSBcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodXBkYXRlc1tcInBvc3RzXCJdID4gMCkge1xuXHRcdFx0XHRcdHRleHRvW1wiZmluYWxcIl0gKz0gdGV4dG9bXCJwb3N0c1wiXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIE1vc3RyYSBvIHRvYXN0XG5cdFx0XHRcdFVJLnRvYXN0LnNob3coe1xuXHRcdFx0XHRcdFwibWVzc2FnZVwiOiB0ZXh0b1tcImZpbmFsXCJdLFxuXHRcdFx0XHRcdFwibGFiZWxcIjogXCJBdHVhbGl6YXJcIixcblx0XHRcdFx0XHRcImFjdGlvblwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHdvcmtlci5Mb2FkKCk7XG5cdFx0XHRcdFx0XHR1cGRhdGVzW1widGFyZWZhc1wiXSA9IDA7XG5cdFx0XHRcdFx0XHR1cGRhdGVzW1wicG9zdHNcIl0gPSAwO1xuXHRcdFx0XHRcdFx0dXBkYXRlc1tcInRvdGFsXCJdID0gMDtcblx0XHRcdFx0XHRcdCR1aVtcInBhZ2UtdGl0bGVcIl0uaHRtbChVSS5kYXRhW1wicGFnZS10aXRsZVwiXSk7XG5cdFx0XHRcdFx0XHRhbmFseXRpY3MoXCJMaXN0YVwiLCBcIkF0dWFsaXphw6fDo29cIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInBlcnNpc3RlbnRcIjogdHJ1ZSxcblx0XHRcdFx0XHRcInN0YXJ0LW9ubHlcIjogdHJ1ZVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyBNb3N0cmEgbsO6bWVybyBkZSBub3ZhcyBhdGl2aWRhZGVzIG5vIHTDrXR1bG9cblx0XHRcdFx0JHVpW1widGl0bGVcIl0uaHRtbChcIihcIiArIHVwZGF0ZXNbXCJ0b3RhbFwiXSArIFwiKSBcIiArIFVJLmRhdGFbXCJwYWdlLXRpdGxlXCJdKTtcblx0XHRcdH1cblxuXHRcdFx0dXBkYXRlc1tcImxhc3QtdXBkYXRlZFwiXSA9IChyZXNwb25zZVswXT8gbW9tZW50KHJlc3BvbnNlWzBdW1widHNcIl0pIDogbW9tZW50KCkpO1xuXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhyZXNwb25zZSwgdXBkYXRlcyk7XG5cdFx0fSk7XG5cdH0sIDMwMDAwKTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZm9udHMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBDcmlhIHVtYSBwcm9taXNlIHF1ZSBzZXLDoSByZXNvbHZpZGFcbi8vIHF1YW5kbyBhcyBmb250ZXMgZm9yZW0gY2FycmVnYWRhc1xuY3VlW1wibG9hZC1mb250c1wiXSA9ICQuRGVmZXJyZWQoKTtcblxuV2ViRm9udC5sb2FkKHtcblx0dGltZW91dDogMTUwMDAsXG5cdGdvb2dsZToge1xuXHRcdGZhbWlsaWVzOiBbXG5cdFx0XHRcIk1hdGVyaWFsIEljb25zXCIsXG5cdFx0XHQvLyBcIlJvYm90bzo0MDAsNDAwaXRhbGljLDUwMDpsYXRpblwiLFxuXHRcdFx0Ly8gXCJSb2JvdG8rTW9ubzo3MDA6bGF0aW5cIixcblx0XHRcdFwiTGF0bzo0MDA6bGF0aW5cIlxuXHRcdF1cblx0fSxcblx0Y3VzdG9tOiB7XG5cdFx0ZmFtaWxpZXM6IFtcblx0XHRcdFwiRm9udEF3ZXNvbWVcIlxuXHRcdF0sXG5cdFx0dXJsczogW1xuXHRcdFx0XCJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9mb250LWF3ZXNvbWUvNC43LjAvY3NzL2ZvbnQtYXdlc29tZS5taW4uY3NzXCJcblx0XHRdXG5cdH0sXG5cdGFjdGl2ZTogZnVuY3Rpb24oKSB7XG5cdFx0Y3VlW1wibG9hZC1mb250c1wiXS5yZXNvbHZlKCk7XG5cblx0XHQkKGZ1bmN0aW9uKCkge1xuXHRcdFx0YXBwLkxpc3RhLmxheW91dCgpO1xuXHRcdH0pO1xuXHR9XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIG1vbWVudGpzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxubW9tZW50LmxvY2FsZShcInB0LWJyXCIsIHtcblx0XHRcIm1vbnRoc1wiOiBcImphbmVpcm9fZmV2ZXJlaXJvX21hcsOnb19hYnJpbF9tYWlvX2p1bmhvX2p1bGhvX2Fnb3N0b19zZXRlbWJyb19vdXR1YnJvX25vdmVtYnJvX2RlemVtYnJvXCIuc3BsaXQoXCJfXCIpLFxuXHRcdFwibW9udGhzU2hvcnRcIjogXCJqYW5fZmV2X21hcl9hYnJfbWFpX2p1bl9qdWxfYWdvX3NldF9vdXRfbm92X2RlelwiLnNwbGl0KFwiX1wiKSxcblx0XHRcIndlZWtkYXlzXCI6IFwiZG9taW5nb19zZWd1bmRhLWZlaXJhX3RlcsOnYS1mZWlyYV9xdWFydGEtZmVpcmFfcXVpbnRhLWZlaXJhX3NleHRhLWZlaXJhX3PDoWJhZG9cIi5zcGxpdChcIl9cIiksXG5cdFx0XCJ3ZWVrZGF5c1Nob3J0XCI6IFwiZG9tX3NlZ190ZXJfcXVhX3F1aV9zZXhfc8OhYlwiLnNwbGl0KFwiX1wiKSxcblx0XHRcIndlZWtkYXlzTWluXCI6IFwiZG9tXzLCql8zwqpfNMKqXzXCql82wqpfc8OhYlwiLnNwbGl0KFwiX1wiKSxcblx0XHRcImxvbmdEYXRlRm9ybWF0XCI6IHtcblx0XHRcdFwiTFRcIjogXCJISDptbVwiLFxuXHRcdFx0XCJMVFNcIjogXCJISDptbTpzc1wiLFxuXHRcdFx0XCJMXCI6IFwiREQvTU0vWVlZWVwiLFxuXHRcdFx0XCJMTFwiOiBcIkQgW2RlXSBNTU1NIFtkZV0gWVlZWVwiLFxuXHRcdFx0XCJMTExcIjogXCJEIFtkZV0gTU1NTSBbZGVdIFlZWVkgW8Ogc10gSEg6bW1cIixcblx0XHRcdFwiTExMTFwiOiBcImRkZGQsIEQgW2RlXSBNTU1NIFtkZV0gWVlZWSBbw6BzXSBISDptbVwiXG5cdFx0fSxcblx0XHRcImNhbGVuZGFyXCI6IHtcblx0XHRcdFwic2FtZURheVwiOiBcIltob2plXSBMVFwiLFxuXHRcdFx0XCJuZXh0RGF5XCI6IFwiW2FtYW5ow6NdIExUXCIsXG5cdFx0XHRcIm5leHRXZWVrXCI6IFwiZGRkZCBMVFwiLFxuXHRcdFx0XCJsYXN0RGF5XCI6IFwiW29udGVtXSBMVFwiLFxuXHRcdFx0XCJsYXN0V2Vla1wiOiBcImRkZGQgTFRcIixcblx0XHRcdFwic2FtZUVsc2VcIjogXCJMXCJcblx0XHR9LFxuXHRcdFwicmVsYXRpdmVUaW1lXCI6IHtcblx0XHRcdFwiZnV0dXJlXCI6IFwiZGFxdWkgJXNcIixcblx0XHRcdFwicGFzdFwiOiBcIiVzIGF0csOhc1wiLFxuXHRcdFx0XCJzXCI6IFwicG91Y29zIHNlZ3VuZG9zXCIsXG5cdFx0XHRcIm1cIjogXCJ1bSBtaW51dG9cIixcblx0XHRcdFwibW1cIjogXCIlZCBtaW51dG9zXCIsXG5cdFx0XHRcImhcIjogXCJ1bWEgaG9yYVwiLFxuXHRcdFx0XCJoaFwiOiBcIiVkIGhvcmFzXCIsXG5cdFx0XHRcImRcIjogXCJ1bSBkaWFcIixcblx0XHRcdFwiZGRcIjogXCIlZCBkaWFzXCIsXG5cdFx0XHRcIk1cIjogXCJ1bSBtw6pzXCIsXG5cdFx0XHRcIk1NXCI6IFwiJWQgbWVzZXNcIixcblx0XHRcdFwieVwiOiBcInVtIGFub1wiLFxuXHRcdFx0XCJ5eVwiOiBcIiVkIGFub3NcIlxuXHRcdH0sXG5cdFx0XCJvcmRpbmFsUGFyc2VcIjogL1xcZHsxLDJ9wrovLFxuXHRcdFwib3JkaW5hbFwiOiBcIiVkwrpcIlxuXHR9KTtcbiJdfQ==
