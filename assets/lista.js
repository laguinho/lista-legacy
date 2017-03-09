////////////////////////////////////////////////////////////////////////////////////////////////////
// lista de tarefas ////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Todas as informações ficam guardadas dentro do objeto "Lista",
// em um dos seus 4 nós
let Lista = [];
Lista.Edicao = {};
Lista.Placar = [];
Lista.Tarefas = [];
Lista.Usuario = {};

// "app" guarda os métodos específicos do funcionamento da Lista,
// "$app" guarda as referências jQuery ao DOM usadas nesses métodos
let app = [];
let $app = [];

let cache = [];
cache["tarefas"] = [];

////////////////////////////////////////////////////////////////////////////////////////////////////

let cue = [];
let worker = [];
let timing = [];

// Se o logging estiver ligado, relata cada passo no console
// Obs: nem todos os métodos estão com logs criados ou detalhados!
let logging = false;
let log = function (message, type) {
	if (logging) {
		// Insere a hora no log
		let timestamp = moment().format("LTS");
		message = "[" + timestamp + "] " + message;

		if (!type) {
			console.log(message);
		} else {
			console[type](message);
		}
	}
};

let analytics = function (category, action, label) {
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
const rand = (min, max) => {
	return Math.random() * (max - min) + min;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// template engine /////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

let $templates = {};

$(function () {
	// Pega os templates do HTML,
	// guarda em $templates
	// e remove eles do código-fonte
	$("template").each(function () {
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
		add: function (view) {
			router["current-view"].push(view);
			// console.log(router["current-view"]);
		},
		remove: function (view) {
			router["current-view"] = $.grep(router["current-view"], function (value) {
				return value !== view;
			});
			// console.log(router["current-view"]);
		},
		replace: function (view) {
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
let UI = {};
UI.data = [];

let $ui = [];
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
	let offset = $ui["body"].offset().left;
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
	let layout_class;
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
	let $outerContainer = $("<div />").css({
		"overflow": "scroll",
		"display": "none"
	}).appendTo($ui["body"]);
	let $innerContainer = $("<div />").appendTo($outerContainer);

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
		lock: function () {
			$ui["body"].addClass("no-scroll").css("margin-right", UI.data["scrollbar-size"]);
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// UI.body.unlock()
		unlock: function () {
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
		show: function () {
			$ui["loadbar"].addClass("in");
		},
		hide: function () {
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
		show: function ($screen, events) {
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
		hide: function ($screen) {
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
		open: function () {
			UI.body.lock();
			UI.backdrop.show($ui["sidenav"], { "hide": UI.sidenav.close });
			$ui["sidenav"].addClass("in");
		},
		close: function () {
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
		open: function ($content, addClass) {
			UI.backdrop.show($ui["bottomsheet"], { "hide": UI.bottomsheet.close });
			$ui["bottomsheet"].html($content).addClass((addClass ? addClass + " " : "") + "in").reflow().addClass("slide");

			UI.data["theme-color"]["buffer"] = $ui["theme-color"].attr("content");
			$ui["theme-color"].attr("content", "#000");

			router["view-manager"].add("bottomsheet");
			history.pushState({ "view": "bottomsheet" }, null, null);
		},
		close: function () {
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
		show: function (config) {
			log("UI.toast.show");
			// Opções:
			// • "message" [string]
			// • "label" [string]
			// • "action" [function]
			// • "persistent" [boolean]
			// • "timeout" [integer] default: 6000
			// • "start-only" [boolean]

			if (typeof config === "object") {
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

		dismiss: function () {
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
		open: function (message, action, callback, persistent) {
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
let api_key = "063c72b2afc5333f3b27b366bdac9eb81d64bc6a12cd7b3f4b6ade77a092b63a";

const ListaAPI = (endpoint, data) => {
	log("API Request: " + endpoint, "info");
	let api_url = "https://api.laguinho.org/lista/" + edicao;
	let api_key = "063c72b2afc5333f3b27b366bdac9eb81d64bc6a12cd7b3f4b6ade77a092b63a";

	let request = $.getJSON(api_url + endpoint + "?key=" + api_key + "&callback=?", data);
	return request;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// placar //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

app.Placar = function () {
	$(function () {
		$ui["placar"] = $(".js-app-placar > ul");
	});

	return {
		update: function (turmas) {
			// confere qual a turma com maior pontuação
			// e soma a pontuação de cada turma para obter o total de pontos
			var maior_pontuacao = 0;
			var total_de_pontos = 0;

			for (var turma in turmas) {
				var pontuacao_da_turma = turmas[turma]["pontos"];

				if (pontuacao_da_turma > maior_pontuacao) {
					maior_pontuacao = pontuacao_da_turma;
				}

				total_de_pontos += pontuacao_da_turma;
			}

			// limpa o placar
			$ui["placar"].empty();

			// adiciona cada turma no placar
			$.each(turmas, function (index, turma) {
				// calcula % da turma em relação ao total de pontos
				var percentual_da_turma = total_de_pontos > 0 ? turma["pontos"] / maior_pontuacao : 0;

				// formata os dados
				turma["largura-da-barra"] = "width: " + (percentual_da_turma * 100).toFixed(3) + "%;";
				turma["turma-formatada"] = turma["turma"].toUpperCase();
				turma["pontos"] = turma["pontos"];
				turma["pontuacao-formatada"] = turma["pontos"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

				// renderiza e coloca na página
				var $turma = __render("placar-turma", turma);
				$ui["placar"].append($turma);
			});

			if (total_de_pontos === 0) {
				$ui["placar"].parent().addClass("zeroed");
			} else {
				$ui["placar"].parent().removeClass("zeroed");
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
	let duracao_total;

	$(function () {
		$ui["evolucao"] = $(".app-evolucao");
	});

	return {
		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Evolucao.start()
		start: function () {
			log("app.Evolucao.start", "info");

			// Pega data de início e data de encerramento
			let dia_inicial = Lista.Edicao["inicio"] = moment(Lista.Edicao["inicio"]);
			let dia_final = Lista.Edicao["fim"] = moment(Lista.Edicao["fim"]);

			// Calcula o tempo total (em minutos)
			duracao_total = dia_final.diff(dia_inicial, "minutes");

			// Insere os dias na barra, indo de dia em dia até chegar ao encerramento
			for (let dia = dia_inicial.clone(); dia.isBefore(dia_final); dia.add(1, "days")) {
				// Define início e final do dia
				// Se final for após a data de encerramento, usa ela como final
				let inicio_do_dia = dia;
				let final_do_dia = dia.clone().endOf("day");
				if (final_do_dia.isAfter(dia_final)) {
					final_do_dia = dia_final;
				}

				// Calcula a duração do dia em minutos
				let duracao_do_dia = final_do_dia.diff(inicio_do_dia, "minutes");

				// Define a duração percentual do dia em relação ao total
				let percentual_do_dia = duracao_do_dia / duracao_total;

				// Calcula a largura do dia (de acordo com duração percentual)
				// e insere dia na barra de evolução
				let largura_do_dia = (percentual_do_dia * 100).toFixed(3);
				let $dia = __render("evolucao-dia", {
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
		update: function () {
			log("app.Evolucao.update", "info");

			// Pega as datas e calcula o tempo (em minutos) e percentual transcorridos
			let agora = moment();
			let dia_inicial = moment(Lista.Edicao["inicio"]);
			let dia_final = moment(Lista.Edicao["fim"]);

			let tempo_transcorrido = agora.diff(dia_inicial, "minutes");
			let percentual_transcorrido = tempo_transcorrido < duracao_total ? tempo_transcorrido / duracao_total : 1;

			// Define a largura da barra de evolução completa igual à largura da tela
			// Depois, mostra apenas o percentual transcorrido
			$(".elapsed-time .bar", $ui["evolucao"]).css("width", UI.data["window"]["width"]);

			let largura_da_barra = (percentual_transcorrido * 100).toFixed(3);
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
				"date": function (element) {
					return $(element).data("last-modified");
				},
				"tarefa": function (element) {
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

				let $card = $(this);
				let numero = $card.data("tarefa");
				app.Tarefa.open(numero, $card, true);
			}
		});
	});

	return {
		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.start()
		start: function () {
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
		status: function () {
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
		messages: function () {
			// se tiver título especificado, insere ele
			if (Lista.Edicao["mensagem"]["titulo"]) {
				let page_title = Lista.Edicao["mensagem"]["titulo"];
				$ui["title"].html(page_title);
			}

			// de tiver mensagem de rodapé especificada, insere ela
			if (Lista.Edicao["mensagem"]["rodape"]) {
				let closing_message = Lista.Edicao["mensagem"]["rodape"];
				$(".js-mensagem-final").html(closing_message);
			}
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.tarefas()
		tarefas: function () {
			// mostra o loading e limpa a lista para começar do zero
			// UI.loading.show();
			$app["lista"].empty();

			// insere as tarefas
			for (let tarefa of Lista.Tarefas) {
				// Insere no cache
				cache["tarefas"][tarefa["numero"]] = tarefa;

				// Cria o link para a tarefa
				tarefa["url"] = router["build-link"]("/tarefas/" + tarefa["numero"]);

				// Se tiver imagem, ajusta as dimensoes
				if (tarefa["imagem"]) {
					tarefa["imagem/url"] = tarefa["imagem"]["url"];
					tarefa["imagem/aspecto"] = "padding-top: " + (tarefa["imagem"]["aspecto"] * 100).toFixed(2) + "%";
				}

				let $tarefa = __render("card-tarefa", tarefa).data({
					"tarefa": tarefa["numero"],
					"last-modified": tarefa["ultima-postagem"] ? moment(tarefa["ultima-postagem"]).format("X") : 0
				});

				// posts
				let $grid = $(".tarefa-conteudo .grid", $tarefa);

				if (tarefa["posts"] && tarefa["posts"].length) {
					var total_posts = tarefa["posts"].length;
					// var total_media = tarefa["posts"].reduce((total, post) => total + post["midia"].length, 0);
					// var max_media_to_show = (UI.data["columns"] < 2? 9 : 8);
					var max_media_to_show = 8;
					var shown_media_count = 0;

					var post_types_with_image_preview = ["imagem", "youtube", "vimeo", "vine", "gif"];
					var post_types_with_text_preview = ["texto"];

					for (var i = 0; i < total_posts; i++) {
						var post = tarefa["posts"][i];

						if ((post["midia"] || post["tipo"] == "texto") && shown_media_count < max_media_to_show) {
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

							if (shown_media_count === max_media_to_show && total_posts - shown_media_count > 0) {
								media["modifier"] = "more";
								media["more"] = "+&thinsp;" + (total_posts - shown_media_count + 1);
							}

							var $tile = __render(tile_type, media).appendTo($grid);
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

			app.Lista.layout();
			app.Lista.sort(Lista.Edicao["encerrada"] ? "tarefa" : "date");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.load()
		load: function () {
			// mostra a tela de loading e limpa o stream
			$stream.loading.addClass("fade-in in");

			// carrega os dados da API
			$.getJSON("https://api.laguinho.org/lista/" + edicao + "/tudo?key=" + api_key + "&callback=?").done(function (data) {
				// "DIRETOR"
				// TODO O load deve ficar separado do Stream (ver issue #7)
				Lista.Regulamento = data["edicao"];
				Lista.Tarefas = data["tarefas"];

				// Se a Edição estiver encerrada...


				// FIM DO "DIRETOR"

				// Limpa o stream para começar do zero
				$stream.empty();

				// Monta placar
				app.Placar.update(data["placar"]);

				// Insere os cards de tarefas
				$.each(data["tarefas"], function (index, tarefa) {
					tarefas[tarefa["numero"]] = tarefa;
					tarefa["url"] = "/tarefas/" + tarefa["numero"];
					tarefa["url"] = router["build-link"]("/tarefas/" + tarefa["numero"]);

					if (tarefa["imagem"]) {
						tarefa["imagem-url"] = tarefa["imagem"]["url"];
						tarefa["imagem-aspecto"] = "padding-top: " + (tarefa["imagem"]["aspecto"] * 100).toFixed(2) + "%";
					}

					var $card = __render("card-tarefa", tarefa).data({
						"tarefa": tarefa["numero"],
						"last-modified": tarefa["ultima-postagem"] ? moment(tarefa["ultima-postagem"]).format("X") : 0
					});

					if (tarefa["preview"]) {
						$card.addClass("fantasma");
						$("a", $card).removeAttr("href");
						$(".body", $card).remove();
					}

					if (!tarefa["imagem"]) {
						$(".media", $card).remove();
					}

					// posts
					var $grid = $(".grid", $card);

					if (tarefa["posts"] && tarefa["posts"].length) {
						var total_posts = tarefa["posts"].length;
						// var total_media = tarefa["posts"].reduce((total, post) => total + post["midia"].length, 0);
						var max_media_to_show = UI.data["columns"] < 2 ? 9 : 8;
						var shown_media_count = 0;

						var post_types_with_image_preview = ["imagem", "youtube", "vimeo", "vine", "gif"];
						var post_types_with_text_preview = ["texto"];

						for (var i = 0; i < total_posts; i++) {
							var post = tarefa["posts"][i];

							if ((post["midia"] || post["tipo"] == "texto") && shown_media_count < max_media_to_show) {
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

								if (shown_media_count === max_media_to_show && total_posts - shown_media_count > 0) {
									media["modifier"] = "more";
									media["more"] = "+&thinsp;" + (total_posts - shown_media_count + 1);
								}

								var $tile = __render(tile_type, media).appendTo($grid);
							}
						}
					} else {
						// se não tiver nenhum post, remove o grid
						$grid.remove();
					}

					// atualiza o isotope
					$stream.append($card).isotope("appended", $card);
				});

				// Se a Edição estiver encerrada, ordena por número da tarefa.
				// Se não, ordena por ordem de atualização
				app.Lista.layout();
				app.Lista.sort(Lista.Edicao["encerrada"] ? "tarefa" : "date");

				// se tiver tarefa especificada no load da página, carrega ela
				if (router["path"][2]) {
					app.Tarefa.open(router["path"][2]);
				}

				// esconde a tela de loading
				setTimeout(function () {
					$stream.loading.removeClass("fade-in").one("transitionend", function () {
						$stream.loading.removeClass("in");
					});
				}, 1200);

				// guarda a data da última atualização e zera o contador de novidades
				last_updated = moment(data["edicao"]["ultima-atualizacao"]);
				updated["tarefas"] = 0;
				updated["posts"] = 0;
			});
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.layout()
		layout: function () {
			$app["lista"].isotope("reloadItems");
			$app["lista"].isotope("layout");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.sort()
		sort: function (criteria) {
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
			"tarefa": function (element) {
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

		let criteria = $(this).data("sort-by");
		let title = $(this).find("span").text();
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
		$app["tarefa"].on("click", ".js-tarefa-close", function (event) {
			event.preventDefault();
			app.Tarefa.close(true);
		}).on("click", ".js-new-post-trigger", function () {
			UI.bottomsheet.open($(".new-post-sheet", $app["tarefa"]).clone().show());
		}).on("click", ".card-tarefa a", function (event) {
			if (event.which === 1) {
				event.preventDefault();
			}
		});
	});

	let placar_da_tarefa = [];

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
			let $content_card = __render("content-card", post);
			let $media = $(".content-media > ul", $content_card);

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

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Tarefa.open()
		open: function (numero, $card, pushState) {
			// console.log($card[0].getBoundingClientRect());

			let tarefa = cache["tarefas"][numero];
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
		render: function (tarefa) {
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
			let $posts = $(".tarefa-content > ul", $tarefa);

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
			var $placar_da_tarefa = $(".painel .placar ul", $tarefa);

			$.each(Lista.Edicao["turmas"], function (index, turma) {
				var pontuacao_da_turma = [];

				// calcula % da turma em relação ao total de pontos
				var percentual_da_turma = placar_da_tarefa["total"] > 0 ? placar_da_tarefa[turma] / placar_da_tarefa["total"] : 0;
				pontuacao_da_turma["turma"] = turma;
				pontuacao_da_turma["altura-da-barra"] = "height: " + (percentual_da_turma * 100).toFixed(3) + "%";
				pontuacao_da_turma["turma-formatada"] = turma.toUpperCase();
				pontuacao_da_turma["pontos"] = placar_da_tarefa[turma] > 0 ? placar_da_tarefa[turma] : 0;
				pontuacao_da_turma["pontuacao-formatada"] = pontuacao_da_turma["pontos"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

				var $turma = __render("placar-turma", pontuacao_da_turma);
				$placar_da_tarefa.append($turma);
			});
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Tarefa.close()
		close: function (pushState) {
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

			let data = $("form", $app["post"]).serialize();
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
		authorize: function () {
			// habilita o botão enviar
			$(".submit-button", $app["post"]).removeClass("disabled");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Post.deauthorize()
		deauthorize: function () {
			// desabilita o botão "enviar"
			$(".submit-button", $app["post"]).addClass("disabled");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Post.getThumbnail()
		getThumbnail: function (url) {
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
		open: function (type, numero) {
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
		close: function () {
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
	let exif_orientation_to_degrees = {
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
				prepare: function (file, options) {
					options.data.ref = file_stack[file["name"]]["ref"];
					file.ref = file_stack[file["name"]]["ref"];
				},

				imageAutoOrientation: files[0]["type"] !== "image/gif" ? true : null,
				imageTransform: files[0]["type"] !== "image/gif" ? {
					maxWidth: 1920,
					maxHeight: 1920
				} : null,

				files: files,
				fileprogress: function (event, file, xhr) {
					var percent = (event["loaded"] / event["total"] * 100).toFixed(0),
					    status = percent < 100 ? "<strong>Enviando&hellip;</strong> " + percent + "%" : "<strong>Processando&hellip;</strong>";

					$("#file-" + file["ref"] + " .status", "#dropzone").html(status);
				},
				progress: function (event) {
					//	var percent = ((event["loaded"] / event["total"]) * 100).toFixed(0) + "%"
					//	console.log(percent);
				},
				filecomplete: function (file, xhr, options) {
					//	console.log(file, xhr, options);
					$("#file-" + options["ref"] + " .status", "#dropzone").html("<i class=\"material-icons\">check</i>");
				},
				complete: function (err, xhr) {
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
			let login_data = $("form", $ui["login"]).serialize();
			app.Login.submit(login_data);
		});
	});

	return {
		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Login.show()
		show: function () {
			// Abre a tela de login e coloca o foco no campo e-mail
			$ui["login"].addClass("in").reflow().addClass("slide").one("transitionend", function () {
				UI.body.lock();
				UI.backdrop.show($ui["login"]);
				$("input[name='email']", $ui["login"]).focus();
			});
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Login.hide()
		hide: function () {
			$ui["login"].removeClass("slide").one("transitionend", function () {
				$ui["login"].removeClass("in");
				UI.backdrop.hide($ui["login"]);
				UI.body.unlock();
			});
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Login.submit()
		submit: function (data) {
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
		logout: function () {
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
				let numero = router["path"][2];
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

			// Resolve a promise load-edicao
			cue["load-edicao"].resolve();
			log("cue[\"load-edicao\"] triggered");
		}, 1);

		// timing["delay-placar"] = setTimeout(app.Placar.start, 400);
	});
};

// update
worker.Update = function () {
	let updates = {
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
			for (let atividade of response) {
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
			if (updates["total"] > 0) {
				// Monta o texto do toast
				let texto = {
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
					"action": function () {
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
	active: function () {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiLCJ1dGlsaXRpZXMuanMiLCJ0ZW1wbGF0ZS1lbmdpbmUuanMiLCJyb3V0ZXIuanMiLCJkb2N1bWVudC5qcyIsImJvZHkuanMiLCJsb2FkYmFyLmpzIiwiYmFja2Ryb3AuanMiLCJzaWRlbmF2LmpzIiwiYm90dG9tc2hlZXQuanMiLCJ0b2FzdC5qcyIsImFwaS5qcyIsInBsYWNhci5qcyIsImV2b2x1Y2FvLmpzIiwibGlzdGEuanMiLCJ0YXJlZmEuanMiLCJwb3N0LmpzIiwidXBsb2FkLmpzIiwibG9naW4uanMiLCJ3b3JrZXJzLmpzIiwiZm9udHMuanMiLCJtb21lbnQtbG9jYWxlLmpzIl0sIm5hbWVzIjpbIkxpc3RhIiwiRWRpY2FvIiwiUGxhY2FyIiwiVGFyZWZhcyIsIlVzdWFyaW8iLCJhcHAiLCIkYXBwIiwiY2FjaGUiLCJjdWUiLCJ3b3JrZXIiLCJ0aW1pbmciLCJsb2dnaW5nIiwibG9nIiwibWVzc2FnZSIsInR5cGUiLCJ0aW1lc3RhbXAiLCJtb21lbnQiLCJmb3JtYXQiLCJjb25zb2xlIiwiYW5hbHl0aWNzIiwiY2F0ZWdvcnkiLCJhY3Rpb24iLCJsYWJlbCIsImdhIiwidGFyZWZhX2FjdGl2ZSIsInJhbmQiLCJtaW4iLCJtYXgiLCJNYXRoIiwicmFuZG9tIiwiJHRlbXBsYXRlcyIsIiQiLCJlYWNoIiwiJHRoaXMiLCJuYW1lIiwiYXR0ciIsImh0bWwiLCJyZW1vdmUiLCJfX3JlbmRlciIsInRlbXBsYXRlIiwiZGF0YSIsIiRyZW5kZXIiLCJjbG9uZSIsImZuIiwiZmlsbEJsYW5rcyIsIiRibGFuayIsImZpbGwiLCJydWxlcyIsInNwbGl0IiwiaSIsImxlbmd0aCIsInBhaXIiLCJkZXN0IiwidHJpbSIsInNvdXJjZSIsInZhbHVlIiwiYWRkQ2xhc3MiLCJ2YWwiLCJpZl9udWxsIiwiaGlkZSIsInJlbW92ZUNsYXNzIiwicmVtb3ZlQXR0ciIsImhhc0NsYXNzIiwicm91dGVyIiwibG9jYXRpb24iLCJwYXRobmFtZSIsImhhc2giLCJwYXRoIiwib2JqZWN0IiwidGl0bGUiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwibGluayIsImFkZCIsInZpZXciLCJwdXNoIiwiZ3JlcCIsInJlcGxhY2UiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJzdGF0ZSIsImluZGV4T2YiLCJVSSIsImJvdHRvbXNoZWV0IiwiY2xvc2UiLCJQb3N0IiwiVGFyZWZhIiwib3BlbiIsIiR1aSIsImRvY3VtZW50IiwiYm9keSIsInRleHQiLCJyZWZsb3ciLCJvZmZzZXQiLCJsZWZ0IiwibmF2aWdhdG9yIiwibXNNYXhUb3VjaFBvaW50cyIsInNldExheW91dFByb3BlcnRpZXMiLCJ3aWR0aCIsImhlaWdodCIsImZsb29yIiwibGF5b3V0X2NsYXNzIiwiZ2V0U2Nyb2xsYmFyU2l6ZSIsIiRvdXRlckNvbnRhaW5lciIsImNzcyIsImFwcGVuZFRvIiwiJGlubmVyQ29udGFpbmVyIiwib24iLCJzZXRTY3JvbGxQb3NpdGlvbiIsInNjcm9sbFRvcCIsInNjcm9sbFN0YXR1cyIsInkiLCJsb2NrIiwidW5sb2NrIiwibG9hZGJhciIsInNob3ciLCJzZXRUaW1lb3V0Iiwib25lIiwiYmFja2Ryb3AiLCIkc2NyZWVuIiwiZXZlbnRzIiwic2NyZWVuIiwiemluZGV4IiwiaGFuZGxlciIsInRyaWdnZXIiLCJvZmYiLCJzaWRlbmF2IiwicHJldmVudERlZmF1bHQiLCIkY29udGVudCIsImVtcHR5IiwidG9hc3QiLCJjb25maWciLCJkaXNtaXNzIiwiY2xlYXJUaW1lb3V0IiwiY2FsbGJhY2siLCJwZXJzaXN0ZW50IiwiYXBpX2tleSIsIkxpc3RhQVBJIiwiZW5kcG9pbnQiLCJhcGlfdXJsIiwiZWRpY2FvIiwicmVxdWVzdCIsImdldEpTT04iLCJ1cGRhdGUiLCJ0dXJtYXMiLCJtYWlvcl9wb250dWFjYW8iLCJ0b3RhbF9kZV9wb250b3MiLCJ0dXJtYSIsInBvbnR1YWNhb19kYV90dXJtYSIsImluZGV4IiwicGVyY2VudHVhbF9kYV90dXJtYSIsInRvRml4ZWQiLCJ0b1VwcGVyQ2FzZSIsInRvU3RyaW5nIiwiJHR1cm1hIiwiYXBwZW5kIiwicGFyZW50IiwiRXZvbHVjYW8iLCJkdXJhY2FvX3RvdGFsIiwic3RhcnQiLCJkaWFfaW5pY2lhbCIsImRpYV9maW5hbCIsImRpZmYiLCJkaWEiLCJpc0JlZm9yZSIsImluaWNpb19kb19kaWEiLCJmaW5hbF9kb19kaWEiLCJlbmRPZiIsImlzQWZ0ZXIiLCJkdXJhY2FvX2RvX2RpYSIsInBlcmNlbnR1YWxfZG9fZGlhIiwibGFyZ3VyYV9kb19kaWEiLCIkZGlhIiwic2V0SW50ZXJ2YWwiLCJhZ29yYSIsInRlbXBvX3RyYW5zY29ycmlkbyIsInBlcmNlbnR1YWxfdHJhbnNjb3JyaWRvIiwibGFyZ3VyYV9kYV9iYXJyYSIsImlzb3RvcGUiLCJlbGVtZW50IiwicGFyc2VJbnQiLCJ3aGljaCIsIiRjYXJkIiwibnVtZXJvIiwidGFyZWZhcyIsInN0YXR1cyIsIm1lc3NhZ2VzIiwiY2xlYXJJbnRlcnZhbCIsInBhZ2VfdGl0bGUiLCJjbG9zaW5nX21lc3NhZ2UiLCJ0YXJlZmEiLCIkdGFyZWZhIiwiJGdyaWQiLCJ0b3RhbF9wb3N0cyIsIm1heF9tZWRpYV90b19zaG93Iiwic2hvd25fbWVkaWFfY291bnQiLCJwb3N0X3R5cGVzX3dpdGhfaW1hZ2VfcHJldmlldyIsInBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXciLCJwb3N0IiwidGlsZV90eXBlIiwibWVkaWEiLCJzdWJzdHJpbmciLCIkdGlsZSIsImxheW91dCIsInNvcnQiLCJsb2FkIiwiJHN0cmVhbSIsImxvYWRpbmciLCJkb25lIiwiUmVndWxhbWVudG8iLCJsYXN0X3VwZGF0ZWQiLCJ1cGRhdGVkIiwiY3JpdGVyaWEiLCJmaW5kIiwicGxhY2FyX2RhX3RhcmVmYSIsInJlbmRlclBvc3RzIiwicG9zdHMiLCIkcG9zdHMiLCJjYWxlbmRhciIsIiRjb250ZW50X2NhcmQiLCIkbWVkaWEiLCIkaW1hZ2UiLCIkZW1iZWQiLCJyZW5kZXIiLCJnbyIsIiR0YXJlZmFfY2FyZCIsIiRwbGFjYXJfZGFfdGFyZWZhIiwic2VyaWFsaXplIiwicmVzcG9uc2UiLCJ2aWJyYXRlIiwiZmFpbCIsImF1dGhvcml6ZSIsImRlYXV0aG9yaXplIiwiZ2V0VGh1bWJuYWlsIiwidXJsIiwibWVkaWFfaW5mbyIsInNob3dUaHVtYm5haWwiLCIkdGh1bWJuYWlsIiwiZmFkZUluIiwibWF0Y2giLCJ5b3V0dWJlX3VybCIsInZpbWVvX3VybCIsIiRuZXdfcG9zdF92aWV3Iiwidmlld190aGVtZV9jb2xvciIsImRyb3B6b25lIiwiZm9jdXMiLCJyZXBsYWNlU3RhdGUiLCJmaWxlX3N0YWNrIiwidXBsb2FkIiwiZmlsZXMiLCJleGlmX29yaWVudGF0aW9uX3RvX2RlZ3JlZXMiLCJGaWxlQVBJIiwiZmlsdGVyRmlsZXMiLCJmaWxlIiwiaW5mbyIsInRlc3QiLCJyZWplY3RlZCIsImV4aWZfb3JpZW50YXRpb24iLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwiaW1nIiwidGFyZ2V0IiwicmVzdWx0IiwiJHRyYWNrZXIiLCIkc3RhdHVzIiwiJHByZXZpZXciLCJyZWFkQXNEYXRhVVJMIiwiSW1hZ2UiLCJyb3RhdGUiLCJyZXNpemUiLCJnZXQiLCJlcnIiLCJwcmVwYXJlIiwib3B0aW9ucyIsInJlZiIsImltYWdlQXV0b09yaWVudGF0aW9uIiwiaW1hZ2VUcmFuc2Zvcm0iLCJtYXhXaWR0aCIsIm1heEhlaWdodCIsImZpbGVwcm9ncmVzcyIsInhociIsInBlcmNlbnQiLCJwcm9ncmVzcyIsImZpbGVjb21wbGV0ZSIsImNvbXBsZXRlIiwiJGRyb3B6b25lIiwiZG5kIiwib3ZlciIsIiRmaWxlX2lucHV0IiwiZ2V0RWxlbWVudEJ5SWQiLCJnZXRGaWxlcyIsIiRib2FyZCIsIm9yaWdpbmFsRXZlbnQiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwiZGV0YWlsIiwiU2xpcCIsIkxvZ2luIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsIkpTT04iLCJwYXJzZSIsImxvZ291dCIsImxvZ2luX2RhdGEiLCJzdWJtaXQiLCJwcm9wIiwic2V0SXRlbSIsInN0cmluZ2lmeSIsImFsd2F5cyIsIlN0YXJ0IiwiRGVmZXJyZWQiLCJpc05hTiIsIlVwZGF0ZSIsIkxvYWQiLCJyZXNvbHZlIiwidXBkYXRlcyIsImF0aXZpZGFkZSIsInRleHRvIiwiV2ViRm9udCIsInRpbWVvdXQiLCJnb29nbGUiLCJmYW1pbGllcyIsImN1c3RvbSIsInVybHMiLCJhY3RpdmUiLCJsb2NhbGUiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBQUEsUUFBQSxFQUFBO0FBQ0FBLE1BQUFDLE1BQUEsR0FBQSxFQUFBO0FBQ0FELE1BQUFFLE1BQUEsR0FBQSxFQUFBO0FBQ0FGLE1BQUFHLE9BQUEsR0FBQSxFQUFBO0FBQ0FILE1BQUFJLE9BQUEsR0FBQSxFQUFBOztBQUVBO0FBQ0E7QUFDQSxJQUFBQyxNQUFBLEVBQUE7QUFDQSxJQUFBQyxPQUFBLEVBQUE7O0FBRUEsSUFBQUMsUUFBQSxFQUFBO0FBQ0FBLE1BQUEsU0FBQSxJQUFBLEVBQUE7O0FBRUE7O0FBRUEsSUFBQUMsTUFBQSxFQUFBO0FBQ0EsSUFBQUMsU0FBQSxFQUFBO0FBQ0EsSUFBQUMsU0FBQSxFQUFBOztBQUVBO0FBQ0E7QUFDQSxJQUFBQyxVQUFBLEtBQUE7QUFDQSxJQUFBQyxNQUFBLFVBQUFDLE9BQUEsRUFBQUMsSUFBQSxFQUFBO0FBQ0EsS0FBQUgsT0FBQSxFQUFBO0FBQ0E7QUFDQSxNQUFBSSxZQUFBQyxTQUFBQyxNQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0FKLFlBQUEsTUFBQUUsU0FBQSxHQUFBLElBQUEsR0FBQUYsT0FBQTs7QUFFQSxNQUFBLENBQUFDLElBQUEsRUFBQTtBQUNBSSxXQUFBTixHQUFBLENBQUFDLE9BQUE7QUFDQSxHQUZBLE1BRUE7QUFDQUssV0FBQUosSUFBQSxFQUFBRCxPQUFBO0FBQ0E7QUFDQTtBQUNBLENBWkE7O0FBY0EsSUFBQU0sWUFBQSxVQUFBQyxRQUFBLEVBQUFDLE1BQUEsRUFBQUMsS0FBQSxF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QSxFQUFBO0FBQ0EsV0FBQSwyRkFBQXZSLEtBQUEsQ0FBQSxHQUFBLENBREE7QUFFQSxnQkFBQSxrREFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FGQTtBQUdBLGFBQUEsaUZBQUFBLEtBQUEsQ0FBQSxHQUFBLENBSEE7QUFJQSxrQkFBQSw4QkFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FKQTtBQUtBLGdCQUFBLHlCQUFBQSxLQUFBLENBQUEsR0FBQSxDQUxBO0FBTUEsbUJBQUE7QUFDQSxRQUFBLE9BREE7QUFFQSxTQUFBLFVBRkE7QUFHQSxPQUFBLFlBSEE7QUFJQSxRQUFBLHVCQUpBO0FBS0EsU0FBQSxrQ0FMQTtBQU1BLFVBQUE7QUFOQSxFQU5BO0FBY0EsYUFBQTtBQUNBLGFBQUEsV0FEQTtBQUVBLGFBQUEsYUFGQTtBQUdBLGNBQUEsU0FIQTtBQUlBLGFBQUEsWUFKQTtBQUtBLGNBQUEsU0FMQTtBQU1BLGNBQUE7QUFOQSxFQWRBO0FBc0JBLGlCQUFBO0FBQ0EsWUFBQSxVQURBO0FBRUEsVUFBQSxVQUZBO0FBR0EsT0FBQSxpQkFIQTtBQUlBLE9BQUEsV0FKQTtBQUtBLFFBQUEsWUFMQTtBQU1BLE9BQUEsVUFOQTtBQU9BLFFBQUEsVUFQQTtBQVFBLE9BQUEsUUFSQTtBQVNBLFFBQUEsU0FUQTtBQVVBLE9BQUEsUUFWQTtBQVdBLFFBQUEsVUFYQTtBQVlBLE9BQUEsUUFaQTtBQWFBLFFBQUE7QUFiQSxFQXRCQTtBQXFDQSxpQkFBQSxVQXJDQTtBQXNDQSxZQUFBO0FBdENBLENBQUEiLCJmaWxlIjoibGlzdGEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBsaXN0YSBkZSB0YXJlZmFzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFRvZGFzIGFzIGluZm9ybWHDp8O1ZXMgZmljYW0gZ3VhcmRhZGFzIGRlbnRybyBkbyBvYmpldG8gXCJMaXN0YVwiLFxuLy8gZW0gdW0gZG9zIHNldXMgNCBuw7NzXG5sZXQgTGlzdGEgPSBbIF07XG5MaXN0YS5FZGljYW8gPSB7IH07XG5MaXN0YS5QbGFjYXIgPSBbIF07XG5MaXN0YS5UYXJlZmFzID0gWyBdO1xuTGlzdGEuVXN1YXJpbyA9IHsgfTtcblxuLy8gXCJhcHBcIiBndWFyZGEgb3MgbcOpdG9kb3MgZXNwZWPDrWZpY29zIGRvIGZ1bmNpb25hbWVudG8gZGEgTGlzdGEsXG4vLyBcIiRhcHBcIiBndWFyZGEgYXMgcmVmZXLDqm5jaWFzIGpRdWVyeSBhbyBET00gdXNhZGFzIG5lc3NlcyBtw6l0b2Rvc1xubGV0IGFwcCA9IFsgXTtcbmxldCAkYXBwID0gWyBdO1xuXG5sZXQgY2FjaGUgPSBbIF07XG5jYWNoZVtcInRhcmVmYXNcIl0gPSBbIF07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxubGV0IGN1ZSA9IFsgXTtcbmxldCB3b3JrZXIgPSBbIF07XG5sZXQgdGltaW5nID0gWyBdO1xuXG4vLyBTZSBvIGxvZ2dpbmcgZXN0aXZlciBsaWdhZG8sIHJlbGF0YSBjYWRhIHBhc3NvIG5vIGNvbnNvbGVcbi8vIE9iczogbmVtIHRvZG9zIG9zIG3DqXRvZG9zIGVzdMOjbyBjb20gbG9ncyBjcmlhZG9zIG91IGRldGFsaGFkb3MhXG5sZXQgbG9nZ2luZyA9IGZhbHNlO1xubGV0IGxvZyA9IGZ1bmN0aW9uKG1lc3NhZ2UsIHR5cGUpIHtcblx0aWYgKGxvZ2dpbmcpIHtcblx0XHQvLyBJbnNlcmUgYSBob3JhIG5vIGxvZ1xuXHRcdGxldCB0aW1lc3RhbXAgPSBtb21lbnQoKS5mb3JtYXQoXCJMVFNcIik7XG5cdFx0bWVzc2FnZSA9IFwiW1wiICsgdGltZXN0YW1wICsgXCJdIFwiICsgbWVzc2FnZTtcblxuXHRcdGlmICghdHlwZSkge1xuXHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGVbdHlwZV0obWVzc2FnZSk7XG5cdFx0fVxuXHR9XG59XG5cbmxldCBhbmFseXRpY3MgPSBmdW5jdGlvbihjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCkge1xuXHRpZiAodHlwZW9mIGdhICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0Z2EoXCJzZW5kXCIsIFwiZXZlbnRcIiwgY2F0ZWdvcnksIGFjdGlvbiwgbGFiZWwpO1xuXHR9XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIGRhcXVpIHByYSBiYWl4byBuw6NvIMOpIHByYSB0ZXIgbmFkYSEhXG5cbnZhciB0YXJlZmFfYWN0aXZlO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgLyB1dGlsaXRpZXMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBUw610dWxvIGUgY29yIGRvIHRlbWFcblVJLmRhdGFbXCJ0aGVtZS1jb2xvclwiXSA9IFsgXTtcblxuJChmdW5jdGlvbigpIHtcblx0JHVpW1widGl0bGVcIl0gPSAkKFwiaGVhZCB0aXRsZVwiKTtcblx0VUkuZGF0YVtcInRpdGxlXCJdID0gJHVpW1widGl0bGVcIl0uaHRtbCgpO1xuXG5cdCR1aVtcInRoZW1lLWNvbG9yXCJdID0gJChcIm1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKTtcblx0VUkuZGF0YVtcInRoZW1lLWNvbG9yXCJdW1wib3JpZ2luYWxcIl0gPSAkdWlbXCJ0aGVtZS1jb2xvclwiXS5hdHRyKFwiY29udGVudFwiKTtcbn0pO1xuXG4vLyBUaXBvIGRlIGludGVyYcOnw6NvICh0b3VjaCBvdSBwb2ludGVyKVxuVUkuZGF0YVtcImludGVyYWN0aW9uLXR5cGVcIl0gPSAoXCJvbnRvdWNoc3RhcnRcIiBpbiB3aW5kb3cgfHwgbmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMpPyBcInRvdWNoXCIgOiBcInBvaW50ZXJcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFByb3ByaWVkYWRlcyBkYSBqYW5lbGEgZSBkbyBsYXlvdXRcblVJLmRhdGFbXCJjb2x1bW4td2lkdGhcIl0gPSAzMTY7IC8vIExhcmd1cmEgZGEgY29sdW5hLCBpbmNsdWluZG8gbWFyZ2VtXG5VSS5kYXRhW1wid2luZG93XCJdID0gWyBdO1xuXG5mdW5jdGlvbiBzZXRMYXlvdXRQcm9wZXJ0aWVzKCkge1xuXHQvLyBEaW1lbnPDtWVzIChsYXJndXJhIGUgYWx0dXJhKSBkYSBqYW5lbGFcblx0VUkuZGF0YVtcIndpbmRvd1wiXVtcIndpZHRoXCJdID0gJHVpW1wid2luZG93XCJdLndpZHRoKCk7XG5cdFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJoZWlnaHRcIl0gPSAkdWlbXCJ3aW5kb3dcIl0uaGVpZ2h0KCk7XG5cblx0Ly8gQ2FsY3VsYSBuw7ptZXJvIGRlIGNvbHVuYXNcblx0VUkuZGF0YVtcImNvbHVtbnNcIl0gPSBNYXRoLmZsb29yKFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJ3aWR0aFwiXSAvIFVJLmRhdGFbXCJjb2x1bW4td2lkdGhcIl0pO1xuXG5cdC8vIEFkaWNpb25hIGNsYXNzZSBubyA8Ym9keT4gZGUgYWNvcmRvIGNvbSBhIHF1YW50aWRhZGUgZGUgY29sdW5hc1xuXHRsZXQgbGF5b3V0X2NsYXNzO1xuXHRpZiAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPT09IDEpIHtcblx0XHRsYXlvdXRfY2xhc3MgPSBcInVpLXNpbmdsZS1jb2x1bW5cIjtcblx0fSBlbHNlIGlmIChVSS5kYXRhW1wiY29sdW1uc1wiXSA9PT0gMikge1xuXHRcdGxheW91dF9jbGFzcyA9IFwidWktZHVhbC1jb2x1bW5cIjtcblx0fSBlbHNlIHtcblx0XHRsYXlvdXRfY2xhc3MgPSBcInVpLW11bHRpLWNvbHVtblwiO1xuXHR9XG5cblx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInVpLXNpbmdsZS1jb2x1bW4gdWktZHVhbC1jb2x1bW4gdWktbXVsdGktY29sdW1uXCIpLmFkZENsYXNzKGxheW91dF9jbGFzcyk7XG59XG5cbmZ1bmN0aW9uIGdldFNjcm9sbGJhclNpemUoKSB7XG5cdC8vIERlc2NvYnJlIG8gdGFtYW5obyBkYSBiYXJyYSBkZSByb2xhZ2VtXG5cdGxldCAkb3V0ZXJDb250YWluZXIgPSAkKFwiPGRpdiAvPlwiKS5jc3Moe1xuXHRcdFwib3ZlcmZsb3dcIjogXCJzY3JvbGxcIixcblx0XHRcImRpc3BsYXlcIjogXCJub25lXCJcblx0fSkuYXBwZW5kVG8oJHVpW1wiYm9keVwiXSk7XG5cdGxldCAkaW5uZXJDb250YWluZXIgPSAkKFwiPGRpdiAvPlwiKS5hcHBlbmRUbygkb3V0ZXJDb250YWluZXIpO1xuXG5cdFVJLmRhdGFbXCJzY3JvbGxiYXItc2l6ZVwiXSA9ICRvdXRlckNvbnRhaW5lci53aWR0aCgpIC0gJGlubmVyQ29udGFpbmVyLndpZHRoKCk7XG5cdCRvdXRlckNvbnRhaW5lci5yZW1vdmUoKTtcbn1cblxuLy8gQXMgcHJvcHJpZWRhZGVzIGRhIGphbmVsYSBlIGRvIGxheW91dCBzw6NvIGNhbGN1bGFkYXNcbi8vIHF1YW5kbyBhIHDDoWdpbmEgw6kgY2FycmVnYWRhIGUgcXVhbmRvIGEgamFuZWxhIMOpIHJlZGltZW5zaW9uYWRhLlxuLy8gTyB0YW1hbmhvIGRhIGJhcnJhIGRlIHJvbGFnZW0gw6kgY2FsY3VsYWRvIHNvbWVudGUgcXVhbmRvIGEgcMOhZ2luYSDDqSBjYXJyZWdhZGFcbiQoZnVuY3Rpb24oKSB7IHNldExheW91dFByb3BlcnRpZXMoKTsgZ2V0U2Nyb2xsYmFyU2l6ZSgpOyB9KTtcbiR1aVtcIndpbmRvd1wiXS5vbihcInJlc2l6ZVwiLCBzZXRMYXlvdXRQcm9wZXJ0aWVzKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFByb3ByaWVkYWRlcyAocG9zacOnw6NvIG5vIHRvcG8gZSBubyBmaW0gZGEgamFuZWxhKSBkbyBzY3JvbGxcblVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl0gPSBbIF07XG5cbmZ1bmN0aW9uIHNldFNjcm9sbFBvc2l0aW9uKCkge1xuXHRVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1widG9wXCJdID0gJHVpW1wid2luZG93XCJdLnNjcm9sbFRvcCgpO1xuXHRVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1wiYm90dG9tXCJdID0gVUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXVtcInRvcFwiXSArIFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJoZWlnaHRcIl07XG59XG5cbi8vIEFzIHByb3ByaWVkYWRlcyBkbyBzY3JvbGwgc8OjbyBjYWxjdWxhZGFzIHF1YW5kbyBhIHDDoWdpbmEgw6kgY2FycmVnYWRhXG4vLyBlIHF1YW5kbyBhIGphbmVsYSDDqSByZWRpbWVuc2lvbmFkYSBvdSBcInNjcm9sbGFkYVwiXG4kKGZ1bmN0aW9uKCkgeyBzZXRTY3JvbGxQb3NpdGlvbigpOyB9KTtcbiR1aVtcIndpbmRvd1wiXS5vbihcInNjcm9sbCByZXNpemVcIiwgc2V0U2Nyb2xsUG9zaXRpb24pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdGVtcGxhdGUgZW5naW5lIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5sZXQgJHRlbXBsYXRlcyA9IHsgfTtcblxuJChmdW5jdGlvbigpIHtcblx0Ly8gUGVnYSBvcyB0ZW1wbGF0ZXMgZG8gSFRNTCxcblx0Ly8gZ3VhcmRhIGVtICR0ZW1wbGF0ZXNcblx0Ly8gZSByZW1vdmUgZWxlcyBkbyBjw7NkaWdvLWZvbnRlXG5cdCQoXCJ0ZW1wbGF0ZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdGxldCAkdGhpcyA9ICQodGhpcyk7XG5cdFx0bGV0IG5hbWUgPSAkdGhpcy5hdHRyKFwiaWRcIik7XG5cdFx0bGV0IGh0bWwgPSAkdGhpcy5odG1sKCk7XG5cblx0XHQkdGVtcGxhdGVzW25hbWVdID0gJChodG1sKTtcblx0XHQkdGhpcy5yZW1vdmUoKTtcblx0fSk7XG59KTtcblxuZnVuY3Rpb24gX19yZW5kZXIodGVtcGxhdGUsIGRhdGEpIHtcblx0Ly8gU2UgdGVtcGxhdGUgbsOjbyBleGlzdGlyLCBhYm9ydGFcblx0aWYgKCEkdGVtcGxhdGVzW3RlbXBsYXRlXSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciAkcmVuZGVyID0gJHRlbXBsYXRlc1t0ZW1wbGF0ZV0uY2xvbmUoKTtcblxuXHQkcmVuZGVyLmRhdGEoZGF0YSk7XG5cblx0JC5mbi5maWxsQmxhbmtzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRibGFuayA9ICQodGhpcyk7XG5cdFx0dmFyIGZpbGwgPSAkYmxhbmsuZGF0YShcImZpbGxcIik7XG5cblx0XHR2YXIgcnVsZXMgPSBmaWxsLnNwbGl0KFwiLFwiKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcGFpciA9IHJ1bGVzW2ldLnNwbGl0KFwiOlwiKTtcblx0XHRcdHZhciBkZXN0ID0gKHBhaXJbMV0/IHBhaXJbMF0udHJpbSgpIDogXCJodG1sXCIpO1xuXHRcdFx0dmFyIHNvdXJjZSA9IChwYWlyWzFdPyBwYWlyWzFdLnRyaW0oKSA6IHBhaXJbMF0pO1xuXHRcdFx0dmFyIHZhbHVlID0gZGF0YVtzb3VyY2VdO1xuXG5cdFx0XHQvLyBUT0RPXG5cdFx0XHQvLyBzb3VyY2UgPSBzb3VyY2Uuc3BsaXQoXCIvXCIpO1xuXHRcdFx0Ly8gaWYgKHNvdXJjZS5sZW5ndGggPiAxKSB7XG5cdFx0XHQvLyBcdC8vIHZhbHVlID0gZGF0YVtzb3VyY2VbMF1dO1xuXHRcdFx0Ly8gXHQvLyBjb25zb2xlLmxvZyhzb3VyY2UsIHNvdXJjZSwgdmFsdWUpO1xuXHRcdFx0Ly8gXHQvLyBpZiAodHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHQvLyBcdFx0Zm9yICh2YXIgaiA9IDA7IGogPD0gc291cmNlLmxlbmd0aDsgaisrKSB7XG5cdFx0XHQvLyBcdFx0XHRjb25zb2xlLmxvZyh2YWx1ZSwgc291cmNlLCBkYXRhW3NvdXJjZVswXV0pO1xuXHRcdFx0Ly8gXHRcdFx0aWYgKHZhbHVlICYmIHZhbHVlW3NvdXJjZV0gJiYgc291cmNlW2pdICYmIHZhbHVlW3NvdXJjZVtqXV0pIHtcblx0XHRcdC8vIFx0XHRcdFx0dmFsdWUgPSAodmFsdWVbc291cmNlW2pdXSk/IHZhbHVlW3NvdXJjZVtqXV0gOiBudWxsO1xuXHRcdFx0Ly8gXHRcdFx0fSBlbHNlIHtcblx0XHRcdC8vIFx0XHRcdFx0dmFsdWUgPSBudWxsO1xuXHRcdFx0Ly8gXHRcdFx0fVxuXHRcdFx0Ly8gXHRcdH1cblx0XHRcdC8vIFx0Ly8gfVxuXHRcdFx0Ly8gfVxuXG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRcdGlmIChkZXN0ID09PSBcImNsYXNzXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsuYWRkQ2xhc3ModmFsdWUpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGRlc3QgPT09IFwiaHRtbFwiKSB7XG5cdFx0XHRcdFx0JGJsYW5rLmh0bWwodmFsdWUpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGRlc3QgPT09IFwidmFsdWVcIikge1xuXHRcdFx0XHRcdCRibGFuay52YWwodmFsdWUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCRibGFuay5hdHRyKGRlc3QsIHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGlmX251bGwgPSAkYmxhbmsuZGF0YShcImZpbGwtbnVsbFwiKTtcblx0XHRcdFx0aWYgKGlmX251bGwgPT09IFwiaGlkZVwiKSB7XG5cdFx0XHRcdFx0JGJsYW5rLmhpZGUoKTtcblx0XHRcdFx0fSBlbHNlIGlmKGlmX251bGwgPT09IFwicmVtb3ZlXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQkYmxhbmtcblx0XHRcdC5yZW1vdmVDbGFzcyhcImZpbGxcIilcblx0XHRcdC5yZW1vdmVBdHRyKFwiZGF0YS1maWxsXCIpXG5cdFx0XHQucmVtb3ZlQXR0cihcImRhdGEtZmlsbC1udWxsXCIpO1xuXHR9O1xuXG5cdGlmICgkcmVuZGVyLmhhc0NsYXNzKFwiZmlsbFwiKSkge1xuXHRcdCRyZW5kZXIuZmlsbEJsYW5rcygpO1xuXHR9XG5cblx0JChcIi5maWxsXCIsICRyZW5kZXIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0JCh0aGlzKS5maWxsQmxhbmtzKCk7XG5cdH0pO1xuXG5cdHJldHVybiAkcmVuZGVyO1xufVxuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcm91dGVyIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xudmFyIHJvdXRlciA9IFsgXTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbmF2aWdhdGlvbiBtb2RlXG5yb3V0ZXJbXCJwYXRoXCJdID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoXCIvXCIpO1xuXG5pZiAocm91dGVyW1wicGF0aFwiXVsxXSA9PT0gXCJ0YXJlZmFzXCIpIHtcblx0cm91dGVyW1wibmF2aWdhdGlvbi1tb2RlXCJdID0gXCJwYXRoXCI7XG59IGVsc2Uge1xuXHRyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPSBcImhhc2hcIjtcblx0cm91dGVyW1wicGF0aFwiXSA9IGxvY2F0aW9uLmhhc2guc3BsaXQoXCIvXCIpO1xufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBnb1xucm91dGVyW1wiZ29cIl0gPSBmdW5jdGlvbihwYXRoLCBvYmplY3QsIHRpdGxlKSB7XG5cdGlmIChyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPT09IFwicGF0aFwiKSB7XG5cdFx0aGlzdG9yeS5wdXNoU3RhdGUob2JqZWN0LCB0aXRsZSwgcGF0aCk7XG5cdH0gZWxzZSB7XG5cdFx0aGlzdG9yeS5wdXNoU3RhdGUob2JqZWN0LCB0aXRsZSwgXCIjXCIgKyBwYXRoKTtcblx0XHQvLyBsb2NhdGlvbi5oYXNoID0gcGF0aDtcblx0fVxufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYnVpbGQgbGlua1xucm91dGVyW1wiYnVpbGQtbGlua1wiXSA9IGZ1bmN0aW9uKHBhdGgpIHtcblx0dmFyIGxpbms7XG5cdGlmIChyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPT09IFwicGF0aFwiKSB7XG5cdFx0bGluayA9IHBhdGg7XG5cdH0gZWxzZSB7XG5cdFx0bGluayA9IFwiI1wiICsgcGF0aDtcblx0fVxuXG5cdHJldHVybiBsaW5rO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdmlldyBtYW5hZ2VyXG5yb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0gPSBbXCJob21lXCJdO1xucm91dGVyW1widmlldy1tYW5hZ2VyXCJdID0gKGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdGFkZDogZnVuY3Rpb24odmlldykge1xuXHRcdFx0cm91dGVyW1wiY3VycmVudC12aWV3XCJdLnB1c2godmlldyk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0pO1xuXHRcdH0sXG5cdFx0cmVtb3ZlOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0gPSAkLmdyZXAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLCBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgIT09IHZpZXc7XG5cdFx0XHR9KTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSk7XG5cdFx0fSxcblx0XHRyZXBsYWNlOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0gPSBbIF07XG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0uYWRkKHZpZXcpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBmdW5jdGlvbihldmVudCkge1xuXHQvLyBjb25zb2xlLmxvZyhcImxvY2F0aW9uOiBcIiArIGRvY3VtZW50LmxvY2F0aW9uICsgXCIsIHN0YXRlOiBcIiArIEpTT04uc3RyaW5naWZ5KGV2ZW50LnN0YXRlKSk7XG5cblx0dmFyIHN0YXRlID0gZXZlbnQuc3RhdGU7XG5cblx0aWYgKHN0YXRlICYmIHN0YXRlW1widmlld1wiXSA9PT0gXCJ0YXJlZmFcIikge1xuXHRcdGlmIChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0uaW5kZXhPZihcImJvdHRvbXNoZWV0XCIpID4gLTEpIHsgVUkuYm90dG9tc2hlZXQuY2xvc2UoKTsgfVxuXHRcdGlmIChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0uaW5kZXhPZihcIm5ldy1wb3N0XCIpID4gLTEpIHsgYXBwLlBvc3QuY2xvc2UoKTsgfVxuXHRcdGFwcC5UYXJlZmEub3BlbihzdGF0ZVtcImlkXCJdKTtcblx0fVxuXG5cdGVsc2UgaWYgKHN0YXRlICYmIHN0YXRlW1widmlld1wiXSA9PT0gXCJuZXctcG9zdFwiKSB7XG5cdFx0Ly8gYXBwLlBvc3Qub3BlbihzdGF0ZVtcInR5cGVcIl0sIHN0YXRlW1wiaWRcIl0pO1xuXHR9XG5cblx0ZWxzZSBpZiAoc3RhdGUgJiYgc3RhdGVbXCJ2aWV3XCJdID09PSBcImJvdHRvbXNoZWV0XCIpIHtcblx0XHRpZiAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLmluZGV4T2YoXCJuZXctcG9zdFwiKSA+IC0xKSB7IGFwcC5Qb3N0LmNsb3NlKCk7IH1cblx0fVxuXG4vL1x0aWYgKHN0YXRlW1widmlld1wiXSA9PT0gXCJob21lXCIpIHtcblx0ZWxzZSB7XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwiYm90dG9tc2hlZXRcIikgPiAtMSkgeyBVSS5ib3R0b21zaGVldC5jbG9zZSgpOyB9XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwibmV3LXBvc3RcIikgPiAtMSkgeyBhcHAuUG9zdC5jbG9zZSgpOyB9XG5cdFx0YXBwLlRhcmVmYS5jbG9zZSgpO1xuXHR9XG5cbn0pO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBzdGF0ZXM6XG4vLyAqIHRhcmVmYVxuLy8gKiBob21lXG4vLyAqIG5ldy1wb3N0XG4vLyAqIGJvdHRvbXNoZWV0XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5sZXQgVUkgPSB7IH1cblVJLmRhdGEgPSBbIF07XG5cbmxldCAkdWkgPSBbIF07XG4kdWlbXCJ3aW5kb3dcIl0gPSAkKHdpbmRvdyk7XG4kdWlbXCJib2R5XCJdID0gJChkb2N1bWVudC5ib2R5KTtcblxuLy8gUGVnYSBvIHTDrXR1bG8gZGEgcMOhZ2luYSAoXCJMaXN0YSBkZSBUYXJlZmFzXCIpXG4vLyBlIGd1YXJkYSBwcmEgcXVhbmRvIGZvciBuZWNlc3PDoXJpbyByZWN1cGVyYXJcbiR1aVtcInBhZ2UtdGl0bGVcIl0gPSAkKFwiaGVhZCB0aXRsZVwiKTtcblVJLmRhdGFbXCJwYWdlLXRpdGxlXCJdID0gJHVpW1wicGFnZS10aXRsZVwiXS50ZXh0KCk7XG5cbi8vICR1aVtcIndpbmRvd1wiXVxuLy8gJHVpW1widGl0bGVcIl1cbi8vICR1aVtcImJvZHlcIl1cbi8vICR1aVtcImFwcGJhclwiXVxuLy8gJHVpW1wibG9hZGJhclwiXVxuLy8gJHVpW1wic2lkZW5hdlwiXVxuLy8gJHVpW1wiYm90dG9tc2hlZXRcIl1cbi8vICR1aVtcInRvYXN0XCJdXG4vLyAkdWlbXCJiYWNrZHJvcFwiXVxuLy8gJHVpW1wiZm9vdGVyXCJdXG4vLyAkdWlbXCJwYWdlLXRpdGxlXCJdXG5cbi8vIERhZG9zIGRlZmluaWRvczpcbi8vIFVJLmRhdGFbXCJjb2x1bW4td2lkdGhcIl1cblxuLy8gRGFkb3MgY29uc3VsdMOhdmVpczpcbi8vIFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJ3aWR0aFwiXVxuLy8gVUkuZGF0YVtcIndpbmRvd1wiXVtcImhlaWdodFwiXVxuLy8gVUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXVtcInRvcFwiXVxuLy8gVUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXVtcImJvdHRvbVwiXVxuLy8gVUkuZGF0YVtcImNvbHVtbnNcIl1cbi8vIFVJLmRhdGFbXCJpbnRlcmFjdGlvbi10eXBlXCJdXG4vLyBVSS5kYXRhW1widGhlbWUtY29sb3JcIl1bXCJvcmlnaW5hbFwiXVxuLy8gVUkuZGF0YVtcInRpdGxlXCJdXG4vLyBVSS5kYXRhW1wic2Nyb2xsYmFyLXNpemVcIl1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIEZ1bsOnw6NvIHBhcmEgZm9yw6dhciByZWZsb3dcbiQuZm4ucmVmbG93ID0gZnVuY3Rpb24oKSB7XG5cdGxldCBvZmZzZXQgPSAkdWlbXCJib2R5XCJdLm9mZnNldCgpLmxlZnQ7XG5cdHJldHVybiAkKHRoaXMpO1xufTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8gYm9keSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFVJLmJvZHkubG9jaygpXG4vLyBVSS5ib2R5LnVubG9jaygpXG5cblVJLmJvZHkgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0Ly8gdWlbXCJib2R5XCJdIMOpIGRlZmluaWRvIG5vIGRvY3VtZW50LmpzXG5cdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInVpLVwiICsgVUkuZGF0YVtcImludGVyYWN0aW9uLXR5cGVcIl0pO1xuXHRcdHNjcm9sbFN0YXR1cygpO1xuXHR9KTtcblxuXHQkdWlbXCJ3aW5kb3dcIl0ub24oXCJzY3JvbGxcIiwgc2Nyb2xsU3RhdHVzKTtcblxuXHRmdW5jdGlvbiBzY3JvbGxTdGF0dXMoKSB7XG5cdFx0dmFyIHkgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cblx0XHRpZiAoeSA+IDEpIHtcblx0XHRcdCR1aVtcImJvZHlcIl0ucmVtb3ZlQ2xhc3MoXCJzY3JvbGwtdG9wXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwic2Nyb2xsLXRvcFwiKTtcblx0XHR9XG5cblx0XHRpZiAoeSA+IDU2KSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwibGl2ZXNpdGUtYmx1clwiKS5yZW1vdmVDbGFzcyhcImxpdmVzaXRlLWZvY3VzXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwibGl2ZXNpdGUtZm9jdXNcIikucmVtb3ZlQ2xhc3MoXCJsaXZlc2l0ZS1ibHVyXCIpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBVSS5ib2R5LmxvY2soKVxuXHRcdGxvY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcIm5vLXNjcm9sbFwiKS5jc3MoXCJtYXJnaW4tcmlnaHRcIiwgVUkuZGF0YVtcInNjcm9sbGJhci1zaXplXCJdKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBVSS5ib2R5LnVubG9jaygpXG5cdFx0dW5sb2NrOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcImJvZHlcIl0ucmVtb3ZlQ2xhc3MoXCJuby1zY3JvbGxcIikuY3NzKFwibWFyZ2luLXJpZ2h0XCIsIDApO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvIGxvYWRiYXIgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBVSS5sb2FkYmFyLnNob3coKVxuLy8gVUkubG9hZGJhci5oaWRlKClcblxuVUkubG9hZGJhciA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQkdWlbXCJsb2FkYmFyXCJdID0gJChcIi51aS1sb2FkYmFyXCIpO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wibG9hZGJhclwiXS5hZGRDbGFzcyhcImluXCIpO1xuXHRcdH0sXG5cdFx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aW1pbmdbXCJoaWRlLWxvYWRiYXJcIl0gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkdWlbXCJsb2FkYmFyXCJdXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKFwiZmFkZS1pblwiKVxuXHRcdFx0XHRcdC5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0JHVpW1wibG9hZGJhclwiXS5yZW1vdmVDbGFzcyhcImluXCIpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSwgODAwKTtcblx0XHR9XG5cdH07XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgLyBiYWNrZHJvcCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gVUkuYmFja2Ryb3Auc2hvdygpXG4vLyBVSS5iYWNrZHJvcC5oaWRlKClcblxuVUkuYmFja2Ryb3AgPSAoZnVuY3Rpb24oKSB7XG5cdCR1aVtcImJhY2tkcm9wXCJdID0gWyBdO1xuXG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0Ly8gJHVpW1wiYmFja2Ryb3BcIl0gPSAkKFwiLmpzLXVpLWJhY2tkcm9wXCIpO1xuXHRcdC8vICR1aVtcImJhY2tkcm9wXCJdLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG5cdFx0Ly8gXHQkdWlbXCJiYWNrZHJvcFwiXS50cmlnZ2VyKFwiaGlkZVwiKTtcblx0XHQvLyB9KTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHRzaG93OiBmdW5jdGlvbigkc2NyZWVuLCBldmVudHMpIHtcblx0XHRcdHZhciBzY3JlZW4gPSAkc2NyZWVuW1wic2VsZWN0b3JcIl07XG5cdFx0XHR2YXIgemluZGV4ID0gJHNjcmVlbi5jc3MoXCJ6LWluZGV4XCIpIC0gMTtcblxuXHRcdFx0JHVpW1wiYmFja2Ryb3BcIl1bc2NyZWVuXSA9IF9fcmVuZGVyKFwiYmFja2Ryb3BcIik7XG5cblx0XHRcdCQuZWFjaChldmVudHMsIGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG5cdFx0XHRcdCR1aVtcImJhY2tkcm9wXCJdW3NjcmVlbl0ub24oZXZlbnQsIGhhbmRsZXIpXG5cdFx0XHR9KTtcblxuXHRcdFx0JHVpW1wiYmFja2Ryb3BcIl1bc2NyZWVuXS5jc3MoXCJ6LWluZGV4XCIsIHppbmRleClcblx0XHRcdFx0Lm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7ICQodGhpcykudHJpZ2dlcihcImhpZGVcIik7IH0pXG5cdFx0XHRcdC5hcHBlbmRUbygkdWlbXCJib2R5XCJdKVxuXHRcdFx0XHQuYWRkQ2xhc3MoXCJpblwiKTtcblx0XHR9LFxuXHRcdGhpZGU6IGZ1bmN0aW9uKCRzY3JlZW4pIHtcblx0XHRcdHZhciBzY3JlZW4gPSAkc2NyZWVuW1wic2VsZWN0b3JcIl07XG5cdFx0XHQkdWlbXCJiYWNrZHJvcFwiXVtzY3JlZW5dLnJlbW92ZUNsYXNzKFwiaW5cIikub2ZmKFwiaGlkZVwiKS5yZW1vdmUoKTtcblx0XHR9XG5cdH07XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgc2lkZW5hdiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5VSS5zaWRlbmF2ID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcInNpZGVuYXZcIl0gPSAkKFwiLmpzLXVpLXNpZGVuYXZcIik7XG5cblx0XHQkKFwiLmpzLXNpZGVuYXYtdHJpZ2dlclwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0VUkuc2lkZW5hdi5vcGVuKCk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0b3BlbjogZnVuY3Rpb24oKSB7XG5cdFx0XHRVSS5ib2R5LmxvY2soKTtcblx0XHRcdFVJLmJhY2tkcm9wLnNob3coJHVpW1wic2lkZW5hdlwiXSwgeyBcImhpZGVcIjogVUkuc2lkZW5hdi5jbG9zZSB9KTtcblx0XHRcdCR1aVtcInNpZGVuYXZcIl0uYWRkQ2xhc3MoXCJpblwiKTtcblx0XHR9LFxuXHRcdGNsb3NlOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcInNpZGVuYXZcIl0ucmVtb3ZlQ2xhc3MoXCJpblwiKTtcblx0XHRcdFVJLmJhY2tkcm9wLmhpZGUoJHVpW1wic2lkZW5hdlwiXSk7XG5cdFx0XHRVSS5ib2R5LnVubG9jaygpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBib3R0b21zaGVldFxuVUkuYm90dG9tc2hlZXQgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0b3BlbjogZnVuY3Rpb24oJGNvbnRlbnQsIGFkZENsYXNzKSB7XG5cdFx0XHRVSS5iYWNrZHJvcC5zaG93KCR1aVtcImJvdHRvbXNoZWV0XCJdLCB7IFwiaGlkZVwiOiBVSS5ib3R0b21zaGVldC5jbG9zZSB9KTtcblx0XHRcdCR1aVtcImJvdHRvbXNoZWV0XCJdLmh0bWwoJGNvbnRlbnQpLmFkZENsYXNzKChhZGRDbGFzcz8gYWRkQ2xhc3MgKyBcIiBcIiA6IFwiXCIpICsgXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlXCIpO1xuXG5cdFx0XHRVSS5kYXRhW1widGhlbWUtY29sb3JcIl1bXCJidWZmZXJcIl0gPSAkdWlbXCJ0aGVtZS1jb2xvclwiXS5hdHRyKFwiY29udGVudFwiKTtcblx0XHRcdCR1aVtcInRoZW1lLWNvbG9yXCJdLmF0dHIoXCJjb250ZW50XCIsIFwiIzAwMFwiKTtcblxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLmFkZChcImJvdHRvbXNoZWV0XCIpO1xuXHRcdFx0aGlzdG9yeS5wdXNoU3RhdGUoeyBcInZpZXdcIjogXCJib3R0b21zaGVldFwiIH0sIG51bGwsIG51bGwpO1xuXHRcdH0sXG5cdFx0Y2xvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wiYm90dG9tc2hlZXRcIl0ucmVtb3ZlQ2xhc3MoXCJzbGlkZVwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkdWlbXCJib3R0b21zaGVldFwiXS5yZW1vdmVDbGFzcyhcImluXCIpLmVtcHR5KCkuYXR0cihcImNsYXNzXCIsIFwidWktYm90dG9tc2hlZXQganMtdWktYm90dG9tc2hlZXRcIik7XG5cdFx0XHR9KTtcblxuXHRcdFx0JHVpW1widGhlbWUtY29sb3JcIl0uYXR0cihcImNvbnRlbnRcIiwgVUkuZGF0YVtcInRoZW1lLWNvbG9yXCJdW1wiYnVmZmVyXCJdKTtcblxuXHRcdFx0VUkuYmFja2Ryb3AuaGlkZSgkdWlbXCJib3R0b21zaGVldFwiXSk7XG5cblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZW1vdmUoXCJib3R0b21zaGVldFwiKTtcblx0XHR9XG5cdH07XG59KSgpO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQkdWlbXCJib3R0b21zaGVldFwiXSA9ICQoXCIuanMtdWktYm90dG9tc2hlZXRcIik7XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIHRvYXN0IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuVUkudG9hc3QgPSAoZnVuY3Rpb24oKSB7XG5cdCR1aVtcInRvYXN0XCJdID0gWyBdO1xuXG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1widG9hc3RcIl0gPSAkKFwiLmpzLXVpLXRvYXN0XCIpO1xuXHRcdCR1aVtcInRvYXN0XCJdW1wibWVzc2FnZVwiXSA9ICQoXCIudG9hc3QtbWVzc2FnZVwiLCAkdWlbXCJ0b2FzdFwiXSk7XG5cdFx0JHVpW1widG9hc3RcIl1bXCJsYWJlbFwiXSA9ICQoXCIudG9hc3QtbGFiZWxcIiwgJHVpW1widG9hc3RcIl0pO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdC8vIFRPRE8gbm92YSBzaW50YXhlLCB1c2FyIHRlbXBsYXRlIGUgX19yZW5kZXJcblx0XHRzaG93OiBmdW5jdGlvbihjb25maWcpIHtcblx0XHRcdGxvZyhcIlVJLnRvYXN0LnNob3dcIik7XG5cdFx0XHQvLyBPcMOnw7Vlczpcblx0XHRcdC8vIOKAoiBcIm1lc3NhZ2VcIiBbc3RyaW5nXVxuXHRcdFx0Ly8g4oCiIFwibGFiZWxcIiBbc3RyaW5nXVxuXHRcdFx0Ly8g4oCiIFwiYWN0aW9uXCIgW2Z1bmN0aW9uXVxuXHRcdFx0Ly8g4oCiIFwicGVyc2lzdGVudFwiIFtib29sZWFuXVxuXHRcdFx0Ly8g4oCiIFwidGltZW91dFwiIFtpbnRlZ2VyXSBkZWZhdWx0OiA2MDAwXG5cdFx0XHQvLyDigKIgXCJzdGFydC1vbmx5XCIgW2Jvb2xlYW5dXG5cblx0XHRcdGlmICh0eXBlb2YgY29uZmlnID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdCR1aVtcInRvYXN0XCJdLnJlbW92ZUNsYXNzKFwic3RhcnQtb25seVwiKTtcblxuXHRcdFx0XHQvLyBUZXh0byBkbyB0b2FzdFxuXHRcdFx0XHQkdWlbXCJ0b2FzdFwiXVtcIm1lc3NhZ2VcIl0uaHRtbChjb25maWdbXCJtZXNzYWdlXCJdIHx8IFwiXCIpO1xuXG5cdFx0XHRcdC8vIFRleHRvIGRhIGHDp8Ojb1xuXHRcdFx0XHQvLyAoU8OzIG1vc3RyYSBkZSB0ZXh0byBlIGHDp8OjbyBlc3RpdmVyZW0gZGVmaW5pZG9zKVxuXHRcdFx0XHRpZiAoY29uZmlnW1wibGFiZWxcIl0gJiYgY29uZmlnW1wiYWN0aW9uXCJdKSB7XG5cdFx0XHRcdFx0JHVpW1widG9hc3RcIl1bXCJsYWJlbFwiXVxuXHRcdFx0XHRcdFx0Lmh0bWwoY29uZmlnW1wibGFiZWxcIl0pXG5cdFx0XHRcdFx0XHQub2ZmKFwiY2xpY2tcIilcblx0XHRcdFx0XHRcdC5vbihcImNsaWNrXCIsIGNvbmZpZ1tcImFjdGlvblwiXSlcblx0XHRcdFx0XHRcdC5zaG93KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JHVpW1widG9hc3RcIl1bXCJsYWJlbFwiXVxuXHRcdFx0XHRcdFx0LmhpZGUoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCR1aVtcInRvYXN0XCJdLmFkZENsYXNzKFwiaW5cIikucmVmbG93KCkuYWRkQ2xhc3MoXCJzbGlkZVwiKTtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInRvYXN0LWFjdGl2ZVwiKTtcblxuXHRcdFx0XHQvLyBUT0RPOiAuZmFiLWJvdHRvbSB0cmFuc2Zvcm06IHRyYW5zbGF0ZVlcblxuXHRcdFx0XHQvLyBBbyBjbGljYXIgbm8gdG9hc3QsIGZlY2hhIGVsZVxuXHRcdFx0XHQkdWlbXCJ0b2FzdFwiXS5vbihcImNsaWNrXCIsIFVJLnRvYXN0LmRpc21pc3MpO1xuXHRcdFx0XHRjbGVhclRpbWVvdXQodGltaW5nW1widG9hc3RcIl0pO1xuXG5cdFx0XHRcdC8vIFNlIG7Do28gZm9yIHBlcnNpc3RlbnRlLFxuXHRcdFx0XHQvLyBmZWNoYSBkZXBvaXMgZGUgdW0gdGVtcG8gZGV0ZXJtaW5hZG9cblx0XHRcdFx0aWYgKCFjb25maWdbXCJwZXJzaXN0ZW50XCJdKSB7XG5cdFx0XHRcdFx0dGltaW5nW1widG9hc3RcIl0gPSBzZXRUaW1lb3V0KFVJLnRvYXN0LmRpc21pc3MsIChjb25maWdbXCJ0aW1lb3V0XCJdPyBjb25maWdbXCJ0aW1lb3V0XCJdIDogNjAwMCkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gU2UgZm9yIHByYSBzZXIgZXhpYmlkbyBzw7MgbmEgdGVsYSBpbmljaWFsXG5cdFx0XHRcdGlmIChjb25maWdbXCJzdGFydC1vbmx5XCJdKSB7XG5cdFx0XHRcdFx0JHVpW1widG9hc3RcIl0uYWRkQ2xhc3MoXCJzdGFydC1vbmx5XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRVSS50b2FzdC5zaG93KHtcblx0XHRcdFx0XHRcIm1lc3NhZ2VcIjogY29uZmlnXG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGRpc21pc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9nKFwiVUkudG9hc3QuZGlzbWlzc1wiKTtcblx0XHRcdCR1aVtcInRvYXN0XCJdLnJlbW92ZUNsYXNzKFwic2xpZGVcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInRvYXN0LWFjdGl2ZVwiKTtcblx0XHRcdFx0JHVpW1widG9hc3RcIl0ucmVtb3ZlQ2xhc3MoXCJpbiBzdGFydC1vbmx5XCIpO1xuXG5cdFx0XHRcdCR1aVtcInRvYXN0XCJdW1wibWVzc2FnZVwiXS5lbXB0eSgpO1xuXHRcdFx0XHQkdWlbXCJ0b2FzdFwiXVtcImxhYmVsXCJdLmVtcHR5KCk7XG5cdFx0XHR9KTtcblx0XHRcdGNsZWFyVGltZW91dCh0aW1pbmdbXCJ0b2FzdFwiXSk7XG5cdFx0fSxcblxuXHRcdC8vIFRPRE8gREVQUkVDQVRFRFxuXHRcdG9wZW46IGZ1bmN0aW9uKG1lc3NhZ2UsIGFjdGlvbiwgY2FsbGJhY2ssIHBlcnNpc3RlbnQpIHtcblx0XHQvLyBvcGVuOiBmdW5jdGlvbihtZXNzYWdlLCBhZGRDbGFzcykge1xuXHRcdFx0JHVpW1widG9hc3RcIl0ubWVzc2FnZS5odG1sKG1lc3NhZ2UpO1xuXHRcdFx0JHVpW1widG9hc3RcIl0ubGFiZWwuaHRtbCgoYWN0aW9uPyBhY3Rpb24gOiBcIlwiKSk7XG5cdFx0XHQkdWlbXCJ0b2FzdFwiXS5hZGRDbGFzcyhcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIik7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwidG9hc3QtYWN0aXZlXCIpO1xuXG5cdFx0XHQvLyBUT0RPOiAuZmFiLWJvdHRvbSB0cmFuc2Zvcm06IHRyYW5zbGF0ZVlcblxuXHRcdFx0JHVpW1widG9hc3RcIl0ub24oXCJjbGlja1wiLCBVSS50b2FzdC5kaXNtaXNzKTtcblx0XHRcdCR1aVtcInRvYXN0XCJdLmxhYmVsLm9uKFwiY2xpY2tcIiwgY2FsbGJhY2spO1xuXG5cdFx0XHRjbGVhclRpbWVvdXQodGltaW5nW1widG9hc3RcIl0pO1xuXG5cdFx0XHRpZiAoIXBlcnNpc3RlbnQpIHtcblx0XHRcdFx0JHVpW1widG9hc3RcIl0ucmVtb3ZlQ2xhc3MoXCJzdGFydC1vbmx5XCIpO1xuXHRcdFx0XHR0aW1pbmdbXCJ0b2FzdC1vcGVuXCJdID0gc2V0VGltZW91dChVSS50b2FzdC5kaXNtaXNzLCA2NTAwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCR1aVtcInRvYXN0XCJdLmFkZENsYXNzKFwic3RhcnQtb25seVwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59KSgpO1xuXG4vLyB2YXIgdG9hc3QgPSBVSS50b2FzdDtcbi8vIHRvYXN0LmNsb3NlID0gVUkudG9hc3QuZGlzbWlzcztcblxuLy8gdmFyIHNuYWNrYmFyID0gdG9hc3Q7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhcGkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFRPRE8gbGVnYWN5IChkZXZlIGZpY2FyIHPDsyBkZW50cm8gZGEgZnVuw6fDo28gYWJhaXhvKVxubGV0IGFwaV9rZXkgPSBcIjA2M2M3MmIyYWZjNTMzM2YzYjI3YjM2NmJkYWM5ZWI4MWQ2NGJjNmExMmNkN2IzZjRiNmFkZTc3YTA5MmI2M2FcIjtcblxuY29uc3QgTGlzdGFBUEkgPSAoZW5kcG9pbnQsIGRhdGEpID0+IHtcblx0bG9nKFwiQVBJIFJlcXVlc3Q6IFwiICsgZW5kcG9pbnQsIFwiaW5mb1wiKTtcblx0bGV0IGFwaV91cmwgPSBcImh0dHBzOi8vYXBpLmxhZ3VpbmhvLm9yZy9saXN0YS9cIiArIGVkaWNhbztcblx0bGV0IGFwaV9rZXkgPSBcIjA2M2M3MmIyYWZjNTMzM2YzYjI3YjM2NmJkYWM5ZWI4MWQ2NGJjNmExMmNkN2IzZjRiNmFkZTc3YTA5MmI2M2FcIjtcblxuXHRsZXQgcmVxdWVzdCA9ICQuZ2V0SlNPTihhcGlfdXJsICsgZW5kcG9pbnQgKyBcIj9rZXk9XCIgKyBhcGlfa2V5ICsgXCImY2FsbGJhY2s9P1wiLCBkYXRhKTtcblx0cmV0dXJuIHJlcXVlc3Q7XG59O1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcGxhY2FyIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5hcHAuUGxhY2FyID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcInBsYWNhclwiXSA9ICQoXCIuanMtYXBwLXBsYWNhciA+IHVsXCIpO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdHVwZGF0ZTogZnVuY3Rpb24odHVybWFzKSB7XG5cdFx0XHQvLyBjb25mZXJlIHF1YWwgYSB0dXJtYSBjb20gbWFpb3IgcG9udHVhw6fDo29cblx0XHRcdC8vIGUgc29tYSBhIHBvbnR1YcOnw6NvIGRlIGNhZGEgdHVybWEgcGFyYSBvYnRlciBvIHRvdGFsIGRlIHBvbnRvc1xuXHRcdFx0dmFyIG1haW9yX3BvbnR1YWNhbyA9IDA7XG5cdFx0XHR2YXIgdG90YWxfZGVfcG9udG9zID0gMDtcblxuXHRcdFx0Zm9yICh2YXIgdHVybWEgaW4gdHVybWFzKSB7XG5cdFx0XHRcdHZhciBwb250dWFjYW9fZGFfdHVybWEgPSB0dXJtYXNbdHVybWFdW1wicG9udG9zXCJdO1xuXG5cdFx0XHRcdGlmIChwb250dWFjYW9fZGFfdHVybWEgPiBtYWlvcl9wb250dWFjYW8pIHtcblx0XHRcdFx0XHRtYWlvcl9wb250dWFjYW8gPSBwb250dWFjYW9fZGFfdHVybWE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0b3RhbF9kZV9wb250b3MgKz0gcG9udHVhY2FvX2RhX3R1cm1hO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBsaW1wYSBvIHBsYWNhclxuXHRcdFx0JHVpW1wicGxhY2FyXCJdLmVtcHR5KCk7XG5cblx0XHRcdC8vIGFkaWNpb25hIGNhZGEgdHVybWEgbm8gcGxhY2FyXG5cdFx0XHQkLmVhY2godHVybWFzLCBmdW5jdGlvbihpbmRleCwgdHVybWEpIHtcblx0XHRcdFx0Ly8gY2FsY3VsYSAlIGRhIHR1cm1hIGVtIHJlbGHDp8OjbyBhbyB0b3RhbCBkZSBwb250b3Ncblx0XHRcdFx0dmFyIHBlcmNlbnR1YWxfZGFfdHVybWEgPSAodG90YWxfZGVfcG9udG9zID4gMD8gdHVybWFbXCJwb250b3NcIl0gLyBtYWlvcl9wb250dWFjYW8gOiAwKTtcblxuXHRcdFx0XHQvLyBmb3JtYXRhIG9zIGRhZG9zXG5cdFx0XHRcdHR1cm1hW1wibGFyZ3VyYS1kYS1iYXJyYVwiXSA9IFwid2lkdGg6IFwiICsgKHBlcmNlbnR1YWxfZGFfdHVybWEgKiAxMDApLnRvRml4ZWQoMykgKyBcIiU7XCI7XG5cdFx0XHRcdHR1cm1hW1widHVybWEtZm9ybWF0YWRhXCJdID0gdHVybWFbXCJ0dXJtYVwiXS50b1VwcGVyQ2FzZSgpO1xuXHRcdFx0XHR0dXJtYVtcInBvbnRvc1wiXSA9IHR1cm1hW1wicG9udG9zXCJdO1xuXHRcdFx0XHR0dXJtYVtcInBvbnR1YWNhby1mb3JtYXRhZGFcIl0gPSB0dXJtYVtcInBvbnRvc1wiXS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLlwiKTtcblxuXHRcdFx0XHQvLyByZW5kZXJpemEgZSBjb2xvY2EgbmEgcMOhZ2luYVxuXHRcdFx0XHR2YXIgJHR1cm1hID0gX19yZW5kZXIoXCJwbGFjYXItdHVybWFcIiwgdHVybWEpO1xuXHRcdFx0XHQkdWlbXCJwbGFjYXJcIl0uYXBwZW5kKCR0dXJtYSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKHRvdGFsX2RlX3BvbnRvcyA9PT0gMCkge1xuXHRcdFx0XHQkdWlbXCJwbGFjYXJcIl0ucGFyZW50KCkuYWRkQ2xhc3MoXCJ6ZXJvZWRcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkdWlbXCJwbGFjYXJcIl0ucGFyZW50KCkucmVtb3ZlQ2xhc3MoXCJ6ZXJvZWRcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBwIGV2b2x1w6fDo28gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhcHAuRXZvbHVjYW8uc3RhcnQoKVxuLy8gYXBwLkV2b2x1Y2FvLnVwZGF0ZSgpXG5cbi8vIFRPRE9cbi8vIC0gbW9zdHJhciBjb250YWRvciBuYXMgw7psdGltYXMgNDggaG9yYXNcbi8vIC0gbyBxdWUgYWNvbnRlY2UgZGVwb2lzIGRvIGVuY2VycmFtZW50bz9cbi8vICAgYmFycmEgZmljYSBkYSBjb3IgZGEgdHVybWEgZSBhcGFyZWNlIG1lbnNhZ2VtIGVtIGNpbWEgXCJFQzEgY2FtcGXDo1wiXG5cbmFwcC5Fdm9sdWNhbyA9IChmdW5jdGlvbigpIHtcblx0bGV0IGR1cmFjYW9fdG90YWw7XG5cblx0JChmdW5jdGlvbigpIHtcblx0XHQkdWlbXCJldm9sdWNhb1wiXSA9ICQoXCIuYXBwLWV2b2x1Y2FvXCIpO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkV2b2x1Y2FvLnN0YXJ0KClcblx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRsb2coXCJhcHAuRXZvbHVjYW8uc3RhcnRcIiwgXCJpbmZvXCIpO1xuXG5cdFx0XHQvLyBQZWdhIGRhdGEgZGUgaW7DrWNpbyBlIGRhdGEgZGUgZW5jZXJyYW1lbnRvXG5cdFx0XHRsZXQgZGlhX2luaWNpYWwgPSBMaXN0YS5FZGljYW9bXCJpbmljaW9cIl0gPSBtb21lbnQoTGlzdGEuRWRpY2FvW1wiaW5pY2lvXCJdKTtcblx0XHRcdGxldCBkaWFfZmluYWwgPSBMaXN0YS5FZGljYW9bXCJmaW1cIl0gPSBtb21lbnQoTGlzdGEuRWRpY2FvW1wiZmltXCJdKTtcblxuXHRcdFx0Ly8gQ2FsY3VsYSBvIHRlbXBvIHRvdGFsIChlbSBtaW51dG9zKVxuXHRcdFx0ZHVyYWNhb190b3RhbCA9IGRpYV9maW5hbC5kaWZmKGRpYV9pbmljaWFsLCBcIm1pbnV0ZXNcIik7XG5cblx0XHRcdC8vIEluc2VyZSBvcyBkaWFzIG5hIGJhcnJhLCBpbmRvIGRlIGRpYSBlbSBkaWEgYXTDqSBjaGVnYXIgYW8gZW5jZXJyYW1lbnRvXG5cdFx0XHRmb3IgKGxldCBkaWEgPSBkaWFfaW5pY2lhbC5jbG9uZSgpOyBkaWEuaXNCZWZvcmUoZGlhX2ZpbmFsKTsgZGlhLmFkZCgxLCBcImRheXNcIikpIHtcblx0XHRcdFx0Ly8gRGVmaW5lIGluw61jaW8gZSBmaW5hbCBkbyBkaWFcblx0XHRcdFx0Ly8gU2UgZmluYWwgZm9yIGFww7NzIGEgZGF0YSBkZSBlbmNlcnJhbWVudG8sIHVzYSBlbGEgY29tbyBmaW5hbFxuXHRcdFx0XHRsZXQgaW5pY2lvX2RvX2RpYSA9IGRpYTtcblx0XHRcdFx0bGV0IGZpbmFsX2RvX2RpYSA9IGRpYS5jbG9uZSgpLmVuZE9mKFwiZGF5XCIpO1xuXHRcdFx0XHRpZiAoZmluYWxfZG9fZGlhLmlzQWZ0ZXIoZGlhX2ZpbmFsKSkge1xuXHRcdFx0XHRcdGZpbmFsX2RvX2RpYSA9IGRpYV9maW5hbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIENhbGN1bGEgYSBkdXJhw6fDo28gZG8gZGlhIGVtIG1pbnV0b3Ncblx0XHRcdFx0bGV0IGR1cmFjYW9fZG9fZGlhID0gZmluYWxfZG9fZGlhLmRpZmYoaW5pY2lvX2RvX2RpYSwgXCJtaW51dGVzXCIpO1xuXG5cdFx0XHRcdC8vIERlZmluZSBhIGR1cmHDp8OjbyBwZXJjZW50dWFsIGRvIGRpYSBlbSByZWxhw6fDo28gYW8gdG90YWxcblx0XHRcdFx0bGV0IHBlcmNlbnR1YWxfZG9fZGlhID0gZHVyYWNhb19kb19kaWEgLyBkdXJhY2FvX3RvdGFsO1xuXG5cdFx0XHRcdC8vIENhbGN1bGEgYSBsYXJndXJhIGRvIGRpYSAoZGUgYWNvcmRvIGNvbSBkdXJhw6fDo28gcGVyY2VudHVhbClcblx0XHRcdFx0Ly8gZSBpbnNlcmUgZGlhIG5hIGJhcnJhIGRlIGV2b2x1w6fDo29cblx0XHRcdFx0bGV0IGxhcmd1cmFfZG9fZGlhID0gKHBlcmNlbnR1YWxfZG9fZGlhICogMTAwKS50b0ZpeGVkKDMpO1xuXHRcdFx0XHRsZXQgJGRpYSA9IF9fcmVuZGVyKFwiZXZvbHVjYW8tZGlhXCIsIHtcblx0XHRcdFx0XHRkaWE6IGRpYS5mb3JtYXQoXCJkZGRcIilcblx0XHRcdFx0fSkuY3NzKFwid2lkdGhcIiwgbGFyZ3VyYV9kb19kaWEgKyBcIiVcIik7XG5cblx0XHRcdFx0JChcIi5kYXktbGFiZWxzXCIsICR1aVtcImV2b2x1Y2FvXCJdKS5hcHBlbmQoJGRpYSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENvbSBvcyBkaWFzIGluc2VyaWRvcyBuYSBiYXJyYSBkZSBldm9sdcOnw6NvLFxuXHRcdFx0Ly8gZGVzZW5oYSBhIGJhcnJhIGRlIHRlbXBvIHRyYW5zY29ycmlkb1xuXHRcdFx0c2V0VGltZW91dChhcHAuRXZvbHVjYW8udXBkYXRlLCAxMDAwKTtcblxuXHRcdFx0Ly8gQXR1YWxpemEgYSBsaW5oYSBkZSBldm9sdcOnw6NvIGEgY2FkYSBYIG1pbnV0b3Ncblx0XHRcdHRpbWluZ1tcImV2b2x1Y2FvXCJdID0gc2V0SW50ZXJ2YWwoYXBwLkV2b2x1Y2FvLnVwZGF0ZSwgNjAgKiAxMDAwKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuRXZvbHVjYW8udXBkYXRlKClcblx0XHR1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9nKFwiYXBwLkV2b2x1Y2FvLnVwZGF0ZVwiLCBcImluZm9cIik7XG5cblx0XHRcdC8vIFBlZ2EgYXMgZGF0YXMgZSBjYWxjdWxhIG8gdGVtcG8gKGVtIG1pbnV0b3MpIGUgcGVyY2VudHVhbCB0cmFuc2NvcnJpZG9zXG5cdFx0XHRsZXQgYWdvcmEgPSBtb21lbnQoKTtcblx0XHRcdGxldCBkaWFfaW5pY2lhbCA9IG1vbWVudChMaXN0YS5FZGljYW9bXCJpbmljaW9cIl0pO1xuXHRcdFx0bGV0IGRpYV9maW5hbCA9IG1vbWVudChMaXN0YS5FZGljYW9bXCJmaW1cIl0pO1xuXG5cdFx0XHRsZXQgdGVtcG9fdHJhbnNjb3JyaWRvID0gYWdvcmEuZGlmZihkaWFfaW5pY2lhbCwgXCJtaW51dGVzXCIpO1xuXHRcdFx0bGV0IHBlcmNlbnR1YWxfdHJhbnNjb3JyaWRvID0gKHRlbXBvX3RyYW5zY29ycmlkbyA8IGR1cmFjYW9fdG90YWwgPyB0ZW1wb190cmFuc2NvcnJpZG8gLyBkdXJhY2FvX3RvdGFsIDogMSk7XG5cblx0XHRcdC8vIERlZmluZSBhIGxhcmd1cmEgZGEgYmFycmEgZGUgZXZvbHXDp8OjbyBjb21wbGV0YSBpZ3VhbCDDoCBsYXJndXJhIGRhIHRlbGFcblx0XHRcdC8vIERlcG9pcywgbW9zdHJhIGFwZW5hcyBvIHBlcmNlbnR1YWwgdHJhbnNjb3JyaWRvXG5cdFx0XHQkKFwiLmVsYXBzZWQtdGltZSAuYmFyXCIsICR1aVtcImV2b2x1Y2FvXCJdKS5jc3MoXCJ3aWR0aFwiLCBVSS5kYXRhW1wid2luZG93XCJdW1wid2lkdGhcIl0pO1xuXG5cdFx0XHRsZXQgbGFyZ3VyYV9kYV9iYXJyYSA9IChwZXJjZW50dWFsX3RyYW5zY29ycmlkbyAqIDEwMCkudG9GaXhlZCgzKTtcblx0XHRcdCQoXCIuZWxhcHNlZC10aW1lXCIsICR1aVtcImV2b2x1Y2FvXCJdKS5jc3MoXCJ3aWR0aFwiLCBsYXJndXJhX2RhX2JhcnJhICsgXCIlXCIpO1xuXHRcdH1cblx0fVxufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGxpc3RhIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5MaXN0YS5sb2FkKClcbi8vIGFwcC5MaXN0YS5sYXlvdXQoKVxuLy8gYXBwLkxpc3RhLnNvcnQoKVxuXG5hcHAuTGlzdGEgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JGFwcFtcImxpc3RhXCJdID0gJChcIi5hcHAtbGlzdGFcIik7XG5cblx0XHQkYXBwW1wibGlzdGFcIl0uaXNvdG9wZSh7XG5cdFx0XHRcIml0ZW1TZWxlY3RvclwiOiBcIi5jYXJkLXRhcmVmYVwiLFxuXHRcdFx0XCJ0cmFuc2l0aW9uRHVyYXRpb25cIjogXCIuOHNcIixcblx0XHRcdFwiZ2V0U29ydERhdGFcIjoge1xuXHRcdFx0XHRcImRhdGVcIjogZnVuY3Rpb24oZWxlbWVudCkge1xuXHRcdFx0XHRcdHJldHVybiAkKGVsZW1lbnQpLmRhdGEoXCJsYXN0LW1vZGlmaWVkXCIpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRcInRhcmVmYVwiOiBmdW5jdGlvbihlbGVtZW50KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlSW50KCQoZWxlbWVudCkuZGF0YShcInRhcmVmYVwiKSwgMTApO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0XCJzb3J0QXNjZW5kaW5nXCI6IHtcblx0XHRcdFx0XCJkYXRlXCI6IGZhbHNlLFxuXHRcdFx0XHRcInRhcmVmYVwiOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0XCJzb3J0QnlcIjogW1wiZGF0ZVwiLCBcInRhcmVmYVwiXSxcblx0XHRcdFwibWFzb25yeVwiOiB7XG5cdFx0XHRcdFwiZ3V0dGVyXCI6IChVSS5kYXRhW1wiY29sdW1uc1wiXSA9PT0gMT8gOCA6IDE2KVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0JGFwcFtcImxpc3RhXCJdLm9uKFwiY2xpY2tcIiwgXCIuY2FyZC10YXJlZmE6bm90KC5mYW50YXNtYSlcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmIChldmVudC53aGljaCA9PT0gMSkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRcdGxldCAkY2FyZCA9ICQodGhpcyk7XG5cdFx0XHRcdGxldCBudW1lcm8gPSAkY2FyZC5kYXRhKFwidGFyZWZhXCIpO1xuXHRcdFx0XHRhcHAuVGFyZWZhLm9wZW4obnVtZXJvLCAkY2FyZCwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEuc3RhcnQoKVxuXHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdGxvZyhcImFwcC5MaXN0YS5zdGFydFwiLCBcImluZm9cIik7XG5cblx0XHRcdC8vIGZheiBhcyBhbHRlcmHDp8O1ZXMgZGUgYWNvcmRvIGNvbSBvIHN0YXR1c1xuXHRcdFx0Ly8gaW5zZXJlIGFzIG1lbnNhZ2Vuc1xuXHRcdFx0YXBwLkxpc3RhLnRhcmVmYXMoKTtcblx0XHRcdGFwcC5MaXN0YS5zdGF0dXMoKTtcblx0XHRcdGFwcC5MaXN0YS5tZXNzYWdlcygpO1xuXG5cdFx0XHQvLyB0aXJhIGEgdGVsYSBkZSBsb2FkaW5nXG5cdFx0XHRVSS5sb2FkYmFyLmhpZGUoKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEuc3RhdHVzKClcblx0XHRzdGF0dXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gc2UgcHJhem8gZGUgcG9zdGFnZW0gZXN0aXZlciBlbmNlcnJhZG8sIGluc2VyZSBjbGFzc2Ugbm8gPGJvZHk+XG5cdFx0XHRpZiAobW9tZW50KCkuaXNBZnRlcihMaXN0YS5FZGljYW9bXCJmaW1cIl0pKSB7XG5cdFx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJwb3N0YWdlbnMtZW5jZXJyYWRhc1wiKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gc2UgYSBlZGnDp8OjbyBlc3RpdmVyIGVuY2VycmFkYSwgaW5zZXJlIGNsYXNzZSBubyA8Ym9keT5cblx0XHRcdC8vIGUgcGFyYSBkZSBhdHVhbGl6YXIgYXV0b21hdGljYW1lbnRlXG5cdFx0XHRpZiAoTGlzdGEuRWRpY2FvW1wiZW5jZXJyYWRhXCJdID09PSB0cnVlKSB7XG5cdFx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJlZGljYW8tZW5jZXJyYWRhXCIpO1xuXHRcdFx0XHRjbGVhckludGVydmFsKHRpbWluZ1tcImF0aXZpZGFkZVwiXSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxpc3RhLm1lc3NhZ2VzKClcblx0XHRtZXNzYWdlczogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBzZSB0aXZlciB0w610dWxvIGVzcGVjaWZpY2FkbywgaW5zZXJlIGVsZVxuXHRcdFx0aWYgKExpc3RhLkVkaWNhb1tcIm1lbnNhZ2VtXCJdW1widGl0dWxvXCJdKSB7XG5cdFx0XHRcdGxldCBwYWdlX3RpdGxlID0gTGlzdGEuRWRpY2FvW1wibWVuc2FnZW1cIl1bXCJ0aXR1bG9cIl07XG5cdFx0XHRcdCR1aVtcInRpdGxlXCJdLmh0bWwocGFnZV90aXRsZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGRlIHRpdmVyIG1lbnNhZ2VtIGRlIHJvZGFww6kgZXNwZWNpZmljYWRhLCBpbnNlcmUgZWxhXG5cdFx0XHRpZiAoTGlzdGEuRWRpY2FvW1wibWVuc2FnZW1cIl1bXCJyb2RhcGVcIl0pIHtcblx0XHRcdFx0bGV0IGNsb3NpbmdfbWVzc2FnZSA9IExpc3RhLkVkaWNhb1tcIm1lbnNhZ2VtXCJdW1wicm9kYXBlXCJdO1xuXHRcdFx0XHQkKFwiLmpzLW1lbnNhZ2VtLWZpbmFsXCIpLmh0bWwoY2xvc2luZ19tZXNzYWdlKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEudGFyZWZhcygpXG5cdFx0dGFyZWZhczogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBtb3N0cmEgbyBsb2FkaW5nIGUgbGltcGEgYSBsaXN0YSBwYXJhIGNvbWXDp2FyIGRvIHplcm9cblx0XHRcdC8vIFVJLmxvYWRpbmcuc2hvdygpO1xuXHRcdFx0JGFwcFtcImxpc3RhXCJdLmVtcHR5KCk7XG5cblx0XHRcdC8vIGluc2VyZSBhcyB0YXJlZmFzXG5cdFx0XHRmb3IgKGxldCB0YXJlZmEgb2YgTGlzdGEuVGFyZWZhcykge1xuXHRcdFx0XHQvLyBJbnNlcmUgbm8gY2FjaGVcblx0XHRcdFx0Y2FjaGVbXCJ0YXJlZmFzXCJdW3RhcmVmYVtcIm51bWVyb1wiXV0gPSB0YXJlZmE7XG5cblx0XHRcdFx0Ly8gQ3JpYSBvIGxpbmsgcGFyYSBhIHRhcmVmYVxuXHRcdFx0XHR0YXJlZmFbXCJ1cmxcIl0gPSByb3V0ZXJbXCJidWlsZC1saW5rXCJdKFwiL3RhcmVmYXMvXCIgKyB0YXJlZmFbXCJudW1lcm9cIl0pO1xuXG5cdFx0XHRcdC8vIFNlIHRpdmVyIGltYWdlbSwgYWp1c3RhIGFzIGRpbWVuc29lc1xuXHRcdFx0XHRpZiAodGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdFx0dGFyZWZhW1wiaW1hZ2VtL3VybFwiXSA9IHRhcmVmYVtcImltYWdlbVwiXVtcInVybFwiXTtcblx0XHRcdFx0XHR0YXJlZmFbXCJpbWFnZW0vYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKHRhcmVmYVtcImltYWdlbVwiXVtcImFzcGVjdG9cIl0gKiAxMDApLnRvRml4ZWQoMikgKyBcIiVcIjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCAkdGFyZWZhID0gX19yZW5kZXIoXCJjYXJkLXRhcmVmYVwiLCB0YXJlZmEpLmRhdGEoe1xuXHRcdFx0XHRcdFwidGFyZWZhXCI6IHRhcmVmYVtcIm51bWVyb1wiXSxcblx0XHRcdFx0XHRcImxhc3QtbW9kaWZpZWRcIjogKHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXT8gbW9tZW50KHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXSkuZm9ybWF0KFwiWFwiKSA6IDApXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIHBvc3RzXG5cdFx0XHRcdGxldCAkZ3JpZCA9ICQoXCIudGFyZWZhLWNvbnRldWRvIC5ncmlkXCIsICR0YXJlZmEpO1xuXG5cdFx0XHRcdGlmICh0YXJlZmFbXCJwb3N0c1wiXSAmJiB0YXJlZmFbXCJwb3N0c1wiXS5sZW5ndGgpIHtcblx0XHRcdFx0XHR2YXIgdG90YWxfcG9zdHMgPSB0YXJlZmFbXCJwb3N0c1wiXS5sZW5ndGg7XG5cdFx0XHRcdFx0Ly8gdmFyIHRvdGFsX21lZGlhID0gdGFyZWZhW1wicG9zdHNcIl0ucmVkdWNlKCh0b3RhbCwgcG9zdCkgPT4gdG90YWwgKyBwb3N0W1wibWlkaWFcIl0ubGVuZ3RoLCAwKTtcblx0XHRcdFx0XHQvLyB2YXIgbWF4X21lZGlhX3RvX3Nob3cgPSAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPCAyPyA5IDogOCk7XG5cdFx0XHRcdFx0dmFyIG1heF9tZWRpYV90b19zaG93ID0gODtcblx0XHRcdFx0XHR2YXIgc2hvd25fbWVkaWFfY291bnQgPSAwO1xuXG5cdFx0XHRcdFx0dmFyIHBvc3RfdHlwZXNfd2l0aF9pbWFnZV9wcmV2aWV3ID0gW1wiaW1hZ2VtXCIsIFwieW91dHViZVwiLCBcInZpbWVvXCIsIFwidmluZVwiLCBcImdpZlwiXTtcblx0XHRcdFx0XHR2YXIgcG9zdF90eXBlc193aXRoX3RleHRfcHJldmlldyA9IFtcInRleHRvXCJdO1xuXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbF9wb3N0czsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgcG9zdCA9IHRhcmVmYVtcInBvc3RzXCJdW2ldO1xuXG5cdFx0XHRcdFx0XHRpZiAoKHBvc3RbXCJtaWRpYVwiXSB8fCBwb3N0W1widGlwb1wiXSA9PSBcInRleHRvXCIpICYmIChzaG93bl9tZWRpYV9jb3VudCA8IG1heF9tZWRpYV90b19zaG93KSkge1xuXHRcdFx0XHRcdFx0XHRzaG93bl9tZWRpYV9jb3VudCsrO1xuXG5cdFx0XHRcdFx0XHRcdHZhciB0aWxlX3R5cGU7XG5cdFx0XHRcdFx0XHRcdHZhciBtZWRpYSA9IHsgfTtcblxuXHRcdFx0XHRcdFx0XHQvLyBpbWFnZW1cblx0XHRcdFx0XHRcdFx0aWYgKHBvc3RfdHlwZXNfd2l0aF9pbWFnZV9wcmV2aWV3LmluZGV4T2YocG9zdFtcInRpcG9cIl0pID4gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHR0aWxlX3R5cGUgPSBcInRpbGUtaW1hZ2VcIjtcblxuXHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wiY291bnRcIl0gPSBzaG93bl9tZWRpYV9jb3VudDtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInlvdXR1YmVcIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbWVvXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ2aW5lXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJnaWZcIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJwcmV2aWV3XCJdID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJ1wiICsgcG9zdFtcIm1pZGlhXCJdWzBdW1widGh1bWJuYWlsXCJdICsgXCInKTtcIjtcblx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wibW9kaWZpZXJcIl0gPSBcInZpZGVvXCI7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChwb3N0W1wibWlkaWFcIl0gJiYgcG9zdFtcIm1pZGlhXCJdWzBdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcInByZXZpZXdcIl0gPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybCgnXCIgKyBwb3N0W1wibWlkaWFcIl1bMF1bXCJjYW1pbmhvXCJdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cG9zdFtcIm1pZGlhXCJdWzBdW1wiYXJxdWl2b3NcIl1bMF0gKyBcIicpO1wiO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBlbHNlXG5cblx0XHRcdFx0XHRcdFx0Ly8gdGV4dG9cblx0XHRcdFx0XHRcdFx0aWYgKHBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXcuaW5kZXhPZihwb3N0W1widGlwb1wiXSkgPiAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdHRpbGVfdHlwZSA9IFwidGlsZS10ZXh0XCI7XG5cdFx0XHRcdFx0XHRcdFx0bWVkaWEgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcInByZXZpZXdcIjogcG9zdFtcImxlZ2VuZGFcIl0uc3Vic3RyaW5nKDAsIDEyMCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcImNvdW50XCI6IHNob3duX21lZGlhX2NvdW50XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICgoc2hvd25fbWVkaWFfY291bnQgPT09IG1heF9tZWRpYV90b19zaG93KSAmJiAoKHRvdGFsX3Bvc3RzIC0gc2hvd25fbWVkaWFfY291bnQpID4gMCkpIHtcblx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vZGlmaWVyXCJdID0gXCJtb3JlXCI7XG5cdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJtb3JlXCJdID0gXCIrJnRoaW5zcDtcIiArICh0b3RhbF9wb3N0cyAtIHNob3duX21lZGlhX2NvdW50ICsgMSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR2YXIgJHRpbGUgPSBfX3JlbmRlcih0aWxlX3R5cGUsIG1lZGlhKS5hcHBlbmRUbygkZ3JpZCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gc2UgbsOjbyB0aXZlciBuZW5odW0gcG9zdCwgcmVtb3ZlIG8gZ3JpZFxuXHRcdFx0XHRcdCQoXCIudGFyZWZhLWNvbnRldWRvXCIsICR0YXJlZmEpLnJlbW92ZSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gU2UgZm9yIHByZXZpZXdcblx0XHRcdFx0aWYgKHRhcmVmYVtcInByZXZpZXdcIl0pIHtcblx0XHRcdFx0XHQkdGFyZWZhLmFkZENsYXNzKFwiZmFudGFzbWFcIik7XG5cdFx0XHRcdFx0JChcImFcIiwgJHRhcmVmYSkucmVtb3ZlQXR0cihcImhyZWZcIik7XG5cdFx0XHRcdFx0JChcIi50YXJlZmEtY29ycG9cIiwgJHRhcmVmYSkucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkYXBwW1wibGlzdGFcIl0uYXBwZW5kKCR0YXJlZmEpLmlzb3RvcGUoXCJhcHBlbmRlZFwiLCAkdGFyZWZhKTtcblx0XHRcdH1cblxuXHRcdFx0YXBwLkxpc3RhLmxheW91dCgpO1xuXHRcdFx0YXBwLkxpc3RhLnNvcnQoKExpc3RhLkVkaWNhb1tcImVuY2VycmFkYVwiXT8gXCJ0YXJlZmFcIjogXCJkYXRlXCIpKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEubG9hZCgpXG5cdFx0bG9hZDogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBtb3N0cmEgYSB0ZWxhIGRlIGxvYWRpbmcgZSBsaW1wYSBvIHN0cmVhbVxuXHRcdFx0JHN0cmVhbS5sb2FkaW5nLmFkZENsYXNzKFwiZmFkZS1pbiBpblwiKTtcblxuXHRcdFx0Ly8gY2FycmVnYSBvcyBkYWRvcyBkYSBBUElcblx0XHRcdCQuZ2V0SlNPTihcImh0dHBzOi8vYXBpLmxhZ3VpbmhvLm9yZy9saXN0YS9cIiArIGVkaWNhbyArIFwiL3R1ZG8/a2V5PVwiICsgYXBpX2tleSArIFwiJmNhbGxiYWNrPT9cIikuZG9uZShmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdC8vIFwiRElSRVRPUlwiXG5cdFx0XHRcdC8vIFRPRE8gTyBsb2FkIGRldmUgZmljYXIgc2VwYXJhZG8gZG8gU3RyZWFtICh2ZXIgaXNzdWUgIzcpXG5cdFx0XHRcdExpc3RhLlJlZ3VsYW1lbnRvID0gZGF0YVtcImVkaWNhb1wiXTtcblx0XHRcdFx0TGlzdGEuVGFyZWZhcyA9IGRhdGFbXCJ0YXJlZmFzXCJdO1xuXG5cdFx0XHRcdC8vIFNlIGEgRWRpw6fDo28gZXN0aXZlciBlbmNlcnJhZGEuLi5cblxuXG5cdFx0XHRcdC8vIEZJTSBETyBcIkRJUkVUT1JcIlxuXG5cdFx0XHRcdC8vIExpbXBhIG8gc3RyZWFtIHBhcmEgY29tZcOnYXIgZG8gemVyb1xuXHRcdFx0XHQkc3RyZWFtLmVtcHR5KCk7XG5cblx0XHRcdFx0Ly8gTW9udGEgcGxhY2FyXG5cdFx0XHRcdGFwcC5QbGFjYXIudXBkYXRlKGRhdGFbXCJwbGFjYXJcIl0pO1xuXG5cdFx0XHRcdC8vIEluc2VyZSBvcyBjYXJkcyBkZSB0YXJlZmFzXG5cdFx0XHRcdCQuZWFjaChkYXRhW1widGFyZWZhc1wiXSwgZnVuY3Rpb24oaW5kZXgsIHRhcmVmYSkge1xuXHRcdFx0XHRcdHRhcmVmYXNbdGFyZWZhW1wibnVtZXJvXCJdXSA9IHRhcmVmYTtcblx0XHRcdFx0XHR0YXJlZmFbXCJ1cmxcIl0gPSBcIi90YXJlZmFzL1wiICsgdGFyZWZhW1wibnVtZXJvXCJdO1xuXHRcdFx0XHRcdHRhcmVmYVtcInVybFwiXSA9IHJvdXRlcltcImJ1aWxkLWxpbmtcIl0oXCIvdGFyZWZhcy9cIiArIHRhcmVmYVtcIm51bWVyb1wiXSk7XG5cblx0XHRcdFx0XHRpZiAodGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdFx0XHR0YXJlZmFbXCJpbWFnZW0tdXJsXCJdID0gdGFyZWZhW1wiaW1hZ2VtXCJdW1widXJsXCJdO1xuXHRcdFx0XHRcdFx0dGFyZWZhW1wiaW1hZ2VtLWFzcGVjdG9cIl0gPSBcInBhZGRpbmctdG9wOiBcIiArICh0YXJlZmFbXCJpbWFnZW1cIl1bXCJhc3BlY3RvXCJdICogMTAwKS50b0ZpeGVkKDIpICsgXCIlXCI7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dmFyICRjYXJkID0gX19yZW5kZXIoXCJjYXJkLXRhcmVmYVwiLCB0YXJlZmEpLmRhdGEoe1xuXHRcdFx0XHRcdFx0XHRcInRhcmVmYVwiOiB0YXJlZmFbXCJudW1lcm9cIl0sXG5cdFx0XHRcdFx0XHRcdFwibGFzdC1tb2RpZmllZFwiOiAodGFyZWZhW1widWx0aW1hLXBvc3RhZ2VtXCJdPyBtb21lbnQodGFyZWZhW1widWx0aW1hLXBvc3RhZ2VtXCJdKS5mb3JtYXQoXCJYXCIpIDogMClcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0aWYgKHRhcmVmYVtcInByZXZpZXdcIl0pIHtcblx0XHRcdFx0XHRcdCRjYXJkLmFkZENsYXNzKFwiZmFudGFzbWFcIik7XG5cdFx0XHRcdFx0XHQkKFwiYVwiLCAkY2FyZCkucmVtb3ZlQXR0cihcImhyZWZcIik7XG5cdFx0XHRcdFx0XHQkKFwiLmJvZHlcIiwgJGNhcmQpLnJlbW92ZSgpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghdGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdFx0XHQkKFwiLm1lZGlhXCIsICRjYXJkKS5yZW1vdmUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBwb3N0c1xuXHRcdFx0XHRcdHZhciAkZ3JpZCA9ICQoXCIuZ3JpZFwiLCAkY2FyZCk7XG5cblx0XHRcdFx0XHRpZiAodGFyZWZhW1wicG9zdHNcIl0gJiYgdGFyZWZhW1wicG9zdHNcIl0ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHR2YXIgdG90YWxfcG9zdHMgPSB0YXJlZmFbXCJwb3N0c1wiXS5sZW5ndGg7XG5cdFx0XHRcdFx0XHQvLyB2YXIgdG90YWxfbWVkaWEgPSB0YXJlZmFbXCJwb3N0c1wiXS5yZWR1Y2UoKHRvdGFsLCBwb3N0KSA9PiB0b3RhbCArIHBvc3RbXCJtaWRpYVwiXS5sZW5ndGgsIDApO1xuXHRcdFx0XHRcdFx0dmFyIG1heF9tZWRpYV90b19zaG93ID0gKFVJLmRhdGFbXCJjb2x1bW5zXCJdIDwgMj8gOSA6IDgpO1xuXHRcdFx0XHRcdFx0dmFyIHNob3duX21lZGlhX2NvdW50ID0gMDtcblxuXHRcdFx0XHRcdFx0dmFyIHBvc3RfdHlwZXNfd2l0aF9pbWFnZV9wcmV2aWV3ID0gW1wiaW1hZ2VtXCIsIFwieW91dHViZVwiLCBcInZpbWVvXCIsIFwidmluZVwiLCBcImdpZlwiXTtcblx0XHRcdFx0XHRcdHZhciBwb3N0X3R5cGVzX3dpdGhfdGV4dF9wcmV2aWV3ID0gW1widGV4dG9cIl07XG5cblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxfcG9zdHM7IGkrKykge1xuXHRcdFx0XHRcdFx0XHR2YXIgcG9zdCA9IHRhcmVmYVtcInBvc3RzXCJdW2ldO1xuXG5cdFx0XHRcdFx0XHRcdGlmICgocG9zdFtcIm1pZGlhXCJdIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidGV4dG9cIikgJiYgKHNob3duX21lZGlhX2NvdW50IDwgbWF4X21lZGlhX3RvX3Nob3cpKSB7XG5cdFx0XHRcdFx0XHRcdFx0c2hvd25fbWVkaWFfY291bnQrKztcblxuXHRcdFx0XHRcdFx0XHRcdHZhciB0aWxlX3R5cGU7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIG1lZGlhID0geyB9O1xuXG5cdFx0XHRcdFx0XHRcdFx0Ly8gaW1hZ2VtXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHBvc3RfdHlwZXNfd2l0aF9pbWFnZV9wcmV2aWV3LmluZGV4T2YocG9zdFtcInRpcG9cIl0pID4gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRpbGVfdHlwZSA9IFwidGlsZS1pbWFnZVwiO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcImNvdW50XCJdID0gc2hvd25fbWVkaWFfY291bnQ7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInlvdXR1YmVcIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbWVvXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ2aW5lXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJnaWZcIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcInByZXZpZXdcIl0gPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybCgnXCIgKyBwb3N0W1wibWlkaWFcIl1bMF1bXCJ0aHVtYm5haWxcIl0gKyBcIicpO1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vZGlmaWVyXCJdID0gXCJ2aWRlb1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChwb3N0W1wibWlkaWFcIl0gJiYgcG9zdFtcIm1pZGlhXCJdWzBdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wicHJldmlld1wiXSA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCdcIiArIHBvc3RbXCJtaWRpYVwiXVswXVtcImNhbWluaG9cIl0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBvc3RbXCJtaWRpYVwiXVswXVtcImFycXVpdm9zXCJdWzBdICsgXCInKTtcIjtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9IGVsc2VcblxuXHRcdFx0XHRcdFx0XHRcdC8vIHRleHRvXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXcuaW5kZXhPZihwb3N0W1widGlwb1wiXSkgPiAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGlsZV90eXBlID0gXCJ0aWxlLXRleHRcIjtcblx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcInByZXZpZXdcIjogcG9zdFtcImxlZ2VuZGFcIl0uc3Vic3RyaW5nKDAsIDEyMCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFwiY291bnRcIjogc2hvd25fbWVkaWFfY291bnRcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKChzaG93bl9tZWRpYV9jb3VudCA9PT0gbWF4X21lZGlhX3RvX3Nob3cpICYmICgodG90YWxfcG9zdHMgLSBzaG93bl9tZWRpYV9jb3VudCkgPiAwKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJtb2RpZmllclwiXSA9IFwibW9yZVwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJtb3JlXCJdID0gXCIrJnRoaW5zcDtcIiArICh0b3RhbF9wb3N0cyAtIHNob3duX21lZGlhX2NvdW50ICsgMSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0dmFyICR0aWxlID0gX19yZW5kZXIodGlsZV90eXBlLCBtZWRpYSkuYXBwZW5kVG8oJGdyaWQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gc2UgbsOjbyB0aXZlciBuZW5odW0gcG9zdCwgcmVtb3ZlIG8gZ3JpZFxuXHRcdFx0XHRcdFx0JGdyaWQucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gYXR1YWxpemEgbyBpc290b3BlXG5cdFx0XHRcdFx0JHN0cmVhbS5hcHBlbmQoJGNhcmQpLmlzb3RvcGUoXCJhcHBlbmRlZFwiLCAkY2FyZCk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIFNlIGEgRWRpw6fDo28gZXN0aXZlciBlbmNlcnJhZGEsIG9yZGVuYSBwb3IgbsO6bWVybyBkYSB0YXJlZmEuXG5cdFx0XHRcdC8vIFNlIG7Do28sIG9yZGVuYSBwb3Igb3JkZW0gZGUgYXR1YWxpemHDp8Ojb1xuXHRcdFx0XHRhcHAuTGlzdGEubGF5b3V0KCk7XG5cdFx0XHRcdGFwcC5MaXN0YS5zb3J0KChMaXN0YS5FZGljYW9bXCJlbmNlcnJhZGFcIl0/IFwidGFyZWZhXCI6IFwiZGF0ZVwiKSk7XG5cblx0XHRcdFx0Ly8gc2UgdGl2ZXIgdGFyZWZhIGVzcGVjaWZpY2FkYSBubyBsb2FkIGRhIHDDoWdpbmEsIGNhcnJlZ2EgZWxhXG5cdFx0XHRcdGlmIChyb3V0ZXJbXCJwYXRoXCJdWzJdKSB7XG5cdFx0XHRcdFx0YXBwLlRhcmVmYS5vcGVuKHJvdXRlcltcInBhdGhcIl1bMl0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gZXNjb25kZSBhIHRlbGEgZGUgbG9hZGluZ1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdCRzdHJlYW0ubG9hZGluZ1xuXHRcdFx0XHRcdFx0LnJlbW92ZUNsYXNzKFwiZmFkZS1pblwiKVxuXHRcdFx0XHRcdFx0Lm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7ICRzdHJlYW0ubG9hZGluZy5yZW1vdmVDbGFzcyhcImluXCIpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9LCAxMjAwKTtcblxuXHRcdFx0XHQvLyBndWFyZGEgYSBkYXRhIGRhIMO6bHRpbWEgYXR1YWxpemHDp8OjbyBlIHplcmEgbyBjb250YWRvciBkZSBub3ZpZGFkZXNcblx0XHRcdFx0bGFzdF91cGRhdGVkID0gbW9tZW50KGRhdGFbXCJlZGljYW9cIl1bXCJ1bHRpbWEtYXR1YWxpemFjYW9cIl0pO1xuXHRcdFx0XHR1cGRhdGVkW1widGFyZWZhc1wiXSA9IDA7XG5cdFx0XHRcdHVwZGF0ZWRbXCJwb3N0c1wiXSA9IDA7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEubGF5b3V0KClcblx0XHRsYXlvdXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JGFwcFtcImxpc3RhXCJdLmlzb3RvcGUoXCJyZWxvYWRJdGVtc1wiKTtcblx0XHRcdCRhcHBbXCJsaXN0YVwiXS5pc290b3BlKFwibGF5b3V0XCIpO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5MaXN0YS5zb3J0KClcblx0XHRzb3J0OiBmdW5jdGlvbihjcml0ZXJpYSkge1xuXHRcdFx0JGFwcFtcImxpc3RhXCJdLmlzb3RvcGUoe1xuXHRcdFx0XHRcInNvcnRCeVwiOiBjcml0ZXJpYVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufSkoKTtcblxuLy8galF1ZXJ5XG52YXIgJHN0cmVhbTtcblxuJChmdW5jdGlvbigpIHtcblx0JHN0cmVhbSA9ICQoXCIuanMtYXBwLWxpc3RhXCIpO1xuXHQvLyAkc3RyZWFtLmxvYWRpbmcgPSAkKFwibWFpbiAubG9hZGluZ1wiKTtcblxuXHQkc3RyZWFtLmlzb3RvcGUoe1xuXHRcdFwiaXRlbVNlbGVjdG9yXCI6IFwiLmNhcmQtdGFyZWZhXCIsXG5cdFx0XCJ0cmFuc2l0aW9uRHVyYXRpb25cIjogXCIuOHNcIixcblx0XHRcImdldFNvcnREYXRhXCI6IHtcblx0XHRcdFwiZGF0ZVwiOiBcIi5sYXN0LW1vZGlmaWVkXCIsXG5cdFx0XHRcInRhcmVmYVwiOiBmdW5jdGlvbihlbGVtZW50KSB7XG5cdFx0XHRcdHJldHVybiBwYXJzZUludCgkKGVsZW1lbnQpLmRhdGEoXCJ0YXJlZmFcIiksIDEwKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdFwic29ydEFzY2VuZGluZ1wiOiB7XG5cdFx0XHRcImRhdGVcIjogZmFsc2UsXG5cdFx0XHRcInRhcmVmYVwiOiB0cnVlXG5cdFx0fSxcblx0XHRcInNvcnRCeVwiOiBbXCJkYXRlXCIsIFwidGFyZWZhXCJdLFxuXHRcdFwibWFzb25yeVwiOiB7XG5cdFx0XHRcImd1dHRlclwiOiAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPT09IDE/IDggOiAxNilcblx0XHR9XG5cdH0pO1xuXG5cdC8vICRzdHJlYW0ub24oXCJjbGlja1wiLCBcIi5jYXJkLXRhcmVmYTpub3QoLmZhbnRhc21hKVwiLCBmdW5jdGlvbihldmVudCkge1xuXHQvLyBcdGlmIChldmVudC53aGljaCA9PT0gMSkge1xuXHQvLyBcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0Ly9cblx0Ly8gXHRcdHZhciBudW1lcm8gPSAkKHRoaXMpLmRhdGEoXCJ0YXJlZmFcIik7XG5cdC8vIFx0XHRhcHAuVGFyZWZhLm9wZW4obnVtZXJvLCB0cnVlKTtcblx0Ly8gXHR9XG5cdC8vIH0pO1xuXG5cdC8vIGFwcC5MaXN0YS5sb2FkKCk7XG5cblx0Ly8gb3JkZW5hw6fDo29cblx0JHVpW1wic2lkZW5hdlwiXS5vbihcImNsaWNrXCIsIFwiLmpzLWxpc3RhLXNvcnQgYVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRsZXQgY3JpdGVyaWEgPSAkKHRoaXMpLmRhdGEoXCJzb3J0LWJ5XCIpO1xuXHRcdGxldCB0aXRsZSA9ICQodGhpcykuZmluZChcInNwYW5cIikudGV4dCgpO1xuXHRcdCQoXCIuanMtbGlzdGEtc29ydCBhXCIsICR1aVtcInNpZGVuYXZcIl0pLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuXHRcdCQodGhpcykuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG5cblx0XHRhcHAuTGlzdGEuc29ydChjcml0ZXJpYSk7XG5cdFx0VUkuc2lkZW5hdi5jbG9zZSgpO1xuXHRcdGFuYWx5dGljcyhcIkxpc3RhXCIsIFwiT3JkZW5hw6fDo29cIiwgdGl0bGUpO1xuXHR9KTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdGFyZWZhIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBwLlRhcmVmYS5vcGVuKClcbi8vIGFwcC5UYXJlZmEucmVuZGVyKClcbi8vIGFwcC5UYXJlZmEuY2xvc2UoKVxuXG5hcHAuVGFyZWZhID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCRhcHBbXCJ0YXJlZmFcIl0gPSAkKFwiLmFwcC10YXJlZmFcIik7XG5cdFx0JGFwcFtcInRhcmVmYVwiXS5vbihcImNsaWNrXCIsIFwiLmpzLXRhcmVmYS1jbG9zZVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGFwcC5UYXJlZmEuY2xvc2UodHJ1ZSk7XG5cdFx0fSkub24oXCJjbGlja1wiLCBcIi5qcy1uZXctcG9zdC10cmlnZ2VyXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0VUkuYm90dG9tc2hlZXQub3BlbigkKFwiLm5ldy1wb3N0LXNoZWV0XCIsICRhcHBbXCJ0YXJlZmFcIl0pLmNsb25lKCkuc2hvdygpKTtcblx0XHR9KS5vbihcImNsaWNrXCIsIFwiLmNhcmQtdGFyZWZhIGFcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmIChldmVudC53aGljaCA9PT0gMSkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcblxuXHRsZXQgcGxhY2FyX2RhX3RhcmVmYSA9IFsgXTtcblxuXHRmdW5jdGlvbiByZW5kZXJQb3N0cyhwb3N0cywgJHBvc3RzKSB7XG5cdFx0cGxhY2FyX2RhX3RhcmVmYVtcInRvdGFsXCJdID0gMDtcblx0XHRmb3IgKHZhciB0dXJtYSBpbiBMaXN0YS5FZGljYW9bXCJ0dXJtYXNcIl0pIHtcblx0XHRcdHBsYWNhcl9kYV90YXJlZmFbTGlzdGEuRWRpY2FvW1widHVybWFzXCJdW3R1cm1hXV0gPSAwO1xuXHRcdH1cblxuXHRcdCQuZWFjaChwb3N0cywgZnVuY3Rpb24oaW5kZXgsIHBvc3QpIHtcblx0XHRcdHBvc3RbXCJ0dXJtYS1iYWNrZ3JvdW5kXCJdID0gcG9zdFtcInR1cm1hXCJdICsgXCItbGlnaHQtYmFja2dyb3VuZFwiO1xuXHRcdFx0cG9zdFtcImRhdGEtZGUtcG9zdGFnZW0tZm9ybWF0YWRhXCJdID0gbW9tZW50KHBvc3RbXCJkYXRhLWRlLXBvc3RhZ2VtXCJdKS5jYWxlbmRhcigpO1xuXHRcdFx0cG9zdFtcInR1cm1hLWZvcm1hdGFkYVwiXSA9IHBvc3RbXCJ0dXJtYVwiXS50b1VwcGVyQ2FzZSgpO1xuXG5cdFx0XHQvLyBsZWdlbmRhXG5cdFx0XHRpZiAocG9zdFtcImxlZ2VuZGFcIl0gJiYgcG9zdFtcImxlZ2VuZGFcIl0uc3Vic3RyaW5nKDAsMykgIT09IFwiPHA+XCIpIHtcblx0XHRcdFx0cG9zdFtcImxlZ2VuZGFcIl0gPSBcIjxwPlwiICsgcG9zdFtcImxlZ2VuZGFcIl0ucmVwbGFjZSgvKD86XFxyXFxuXFxyXFxufFxcclxccnxcXG5cXG4pL2csIFwiPC9wPjxwPlwiKSArIFwiPC9wPlwiO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBhdmFsaWHDp8Ojb1xuXHRcdFx0aWYgKHBvc3RbXCJhdmFsaWFjYW9cIl0pIHtcblx0XHRcdFx0cG9zdFtcImF2YWxpYWNhby9tZW5zYWdlbVwiXSA9IHBvc3RbXCJhdmFsaWFjYW9cIl1bXCJtZW5zYWdlbVwiXTtcblxuXHRcdFx0XHRpZiAocG9zdFtcImF2YWxpYWNhb1wiXVtcInN0YXR1c1wiXSA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0cG9zdFtcInN0YXR1cy1jbGFzc1wiXSA9IHBvc3RbXCJ0dXJtYVwiXTtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzLWljb25cIl0gPSBcIjxpIGNsYXNzPVxcXCJtYXRlcmlhbC1pY29uc1xcXCI+JiN4RTg3RDs8L2k+XCI7IC8vIGNvcmHDp8Ojb1xuXHRcdFx0XHRcdHBvc3RbXCJhdmFsaWFjYW8vc3RhdHVzXCJdID0gcG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXSArIFwiIHBvbnRvXCIgKyAocG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXSA+IDE/IFwic1wiOiBcIlwiKTtcblx0XHRcdFx0XHRwb3N0W1wiYXZhbGlhY2FvL2NsYXNzXCJdID0gXCJ0dXJtYS10ZXh0XCI7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cG9zdFtcInN0YXR1cy1jbGFzc1wiXSA9IFwicmVqZWN0ZWRcIjtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzLWljb25cIl0gPSBcIjxpIGNsYXNzPVxcXCJtYXRlcmlhbC1pY29uc1xcXCI+JiN4RTg4ODs8L2k+XCI7XG5cdFx0XHRcdFx0cG9zdFtcImF2YWxpYWNhby9zdGF0dXNcIl0gPSBcIlJlcHJvdmFkb1wiO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gc29tYSBwb250b3Mgbm8gcGxhY2FyXG5cdFx0XHRcdHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSArPSBwb3N0W1wiYXZhbGlhY2FvXCJdW1wicG9udG9zXCJdO1xuXHRcdFx0XHRwbGFjYXJfZGFfdGFyZWZhW3Bvc3RbXCJ0dXJtYVwiXV0gKz0gcG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBvc3RbXCJzdGF0dXMtaWNvblwiXSA9IFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj4mI3hFOEI1OzwvaT5cIjsgLy8gcmVsw7NnaW9cblx0XHRcdFx0cG9zdFtcImF2YWxpYWNhby9zdGF0dXNcIl0gPSBcIkFndWFyZGFuZG8gYXZhbGlhw6fDo29cIjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcmVuZGVyaXphIG8gcG9zdFxuXHRcdFx0bGV0ICRjb250ZW50X2NhcmQgPSBfX3JlbmRlcihcImNvbnRlbnQtY2FyZFwiLCBwb3N0KTtcblx0XHRcdGxldCAkbWVkaWEgPSAkKFwiLmNvbnRlbnQtbWVkaWEgPiB1bFwiLCAkY29udGVudF9jYXJkKTtcblxuXHRcdFx0Ly8gYWRpY2lvbmEgbcOtZGlhc1xuXHRcdFx0aWYgKHBvc3RbXCJtaWRpYVwiXSkge1xuXHRcdFx0XHQkLmVhY2gocG9zdFtcIm1pZGlhXCJdLCBmdW5jdGlvbihpbmRleCwgbWVkaWEpIHtcblx0XHRcdFx0XHQvLyBpbWFnZW1cblx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJpbWFnZW1cIikge1xuXHRcdFx0XHRcdFx0bWVkaWFbXCJkZWZhdWx0XCJdID0gbWVkaWFbXCJjYW1pbmhvXCJdICsgbWVkaWFbXCJhcnF1aXZvc1wiXVsxXTtcblx0XHRcdFx0XHRcdG1lZGlhW1wicGFkZGluZy1hc3BlY3RvXCJdID0gXCJwYWRkaW5nLXRvcDogXCIgKyAobWVkaWFbXCJhc3BlY3RvXCJdICogMTAwKS50b0ZpeGVkKDIpICsgXCIlXCI7XG5cdFx0XHRcdFx0XHRtZWRpYVtcImxpbmstb3JpZ2luYWxcIl0gPSBtZWRpYVtcImNhbWluaG9cIl0gKyBtZWRpYVtcImFycXVpdm9zXCJdWzJdO1xuXHRcdFx0XHRcdFx0dmFyICRpbWFnZSA9IF9fcmVuZGVyKFwibWVkaWEtcGhvdG9cIiwgbWVkaWEpO1xuXHRcdFx0XHRcdFx0JG1lZGlhLmFwcGVuZCgkaW1hZ2UpO1xuXHRcdFx0XHRcdH0gZWxzZVxuXG5cdFx0XHRcdFx0Ly8gZW1iZWRcblx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ5b3V0dWJlXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ2aW1lb1wiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidmluZVwiKSB7XG5cdFx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ5b3V0dWJlXCIpIHtcblx0XHRcdFx0XHRcdFx0bWVkaWFbXCJlbWJlZFwiXSA9IFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvXCIgKyBtZWRpYVtcInlvdXR1YmUtaWRcIl0gKyBcIj9yZWw9MCZhbXA7c2hvd2luZm89MFwiO1xuXHRcdFx0XHRcdFx0fSBlbHNlXG5cblx0XHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInZpbWVvXCIpIHtcblx0XHRcdFx0XHRcdFx0bWVkaWFbXCJlbWJlZFwiXSA9IFwiaHR0cHM6Ly9wbGF5ZXIudmltZW8uY29tL3ZpZGVvL1wiICsgbWVkaWFbXCJ2aW1lby1pZFwiXSArIFwiP3RpdGxlPTAmYnlsaW5lPTAmcG9ydHJhaXQ9MFwiO1xuXHRcdFx0XHRcdFx0fSBlbHNlXG5cblx0XHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInZpbmVcIikge1xuXHRcdFx0XHRcdFx0XHRtZWRpYVtcImVtYmVkXCJdID0gXCJodHRwczovL3ZpbmUuY28vdi9cIiArIG1lZGlhW1widmluZS1pZFwiXSArIFwiL2VtYmVkL3NpbXBsZVwiO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRtZWRpYVtcInBhZGRpbmctYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKG1lZGlhW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0XHRcdFx0dmFyICRlbWJlZCA9IF9fcmVuZGVyKFwibWVkaWEtdmlkZW9cIiwgbWVkaWEpO1xuXHRcdFx0XHRcdFx0JG1lZGlhLmFwcGVuZCgkZW1iZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHRpcmEgbGVnZW5kYSBzZSBuw6NvIHRpdmVyXG5cdFx0XHRpZiAoIXBvc3RbXCJsZWdlbmRhXCJdKSB7XG5cdFx0XHRcdCRjb250ZW50X2NhcmQuYWRkQ2xhc3MoXCJuby1jYXB0aW9uXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIXBvc3RbXCJtaWRpYVwiXSkge1xuXHRcdFx0XHQkY29udGVudF9jYXJkLmFkZENsYXNzKFwibm8tbWVkaWFcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHRpcmEgbWVuc2FnZW0gZGUgYXZhbGlhw6fDo28gc2UgbsOjbyB0aXZlclxuXHRcdFx0aWYgKCFwb3N0W1wiYXZhbGlhY2FvXCJdIHx8ICFwb3N0W1wibWVuc2FnZW1cIl0pIHtcblx0XHRcdFx0JChcIi5yZXN1bHQgLm1lc3NhZ2VcIiwgJGNvbnRlbnRfY2FyZCkucmVtb3ZlKCk7XG5cdFx0XHR9XG5cblxuXHRcdFx0Ly8gYWRpY2lvbmEgbyBwb3N0IMOgIHRhcmVmYVxuXHRcdFx0Ly8gJHBvc3RzLmFwcGVuZCgkY29udGVudF9jYXJkKS5pc290b3BlKFwiYXBwZW5kZWRcIiwgJGNvbnRlbnRfY2FyZCk7XG5cdFx0XHQkcG9zdHMuYXBwZW5kKCRjb250ZW50X2NhcmQpO1xuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIHtcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlRhcmVmYS5vcGVuKClcblx0XHRvcGVuOiBmdW5jdGlvbihudW1lcm8sICRjYXJkLCBwdXNoU3RhdGUpIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCRjYXJkWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcblxuXHRcdFx0bGV0IHRhcmVmYSA9IGNhY2hlW1widGFyZWZhc1wiXVtudW1lcm9dO1xuXHRcdFx0dGFyZWZhX2FjdGl2ZSA9IG51bWVybztcblxuXHRcdFx0Ly8gaWYgKFVJLmRhdGFbXCJjb2x1bW5zXCJdID49IDMpIHtcblx0XHRcdC8vIFx0Ly8gVUkuYmFja2Ryb3Auc2hvdygkYXBwW1widGFyZWZhXCJdLCB7IFwiaGlkZVwiOiBhcHAuVGFyZWZhLmNsb3NlIH0pO1xuXHRcdFx0Ly8gXHQvLyAkdWlbXCJiYWNrZHJvcFwiXVskYXBwW1widGFyZWZhXCJdXS5vbihcImhpZGVcIiwgYXBwLlRhcmVmYS5jbG9zZSk7XG5cdFx0XHQvLyB9XG5cblx0XHRcdCRhcHBbXCJ0YXJlZmFcIl0uYWRkQ2xhc3MoXCJpblwiKTtcblx0XHRcdGFwcC5UYXJlZmEucmVuZGVyKHRhcmVmYSk7XG5cblx0XHRcdCRhcHBbXCJ0YXJlZmFcIl0ucmVmbG93KCkuYWRkQ2xhc3MoXCJzbGlkZS14XCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdC8vIHZhciB2aWV3X3RoZW1lX2NvbG9yID0gJChcIi5hcHBiYXJcIiwgJGFwcFtcInRhcmVmYVwiXSkuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiKTtcblx0XHRcdFx0Ly8gJChcImhlYWQgbWV0YVtuYW1lPSd0aGVtZS1jb2xvciddXCIpLmF0dHIoXCJjb250ZW50XCIsIFwiIzU0NmU3YVwiKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRVSS5ib2R5LmxvY2soKTtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJ0YXJlZmEtYWN0aXZlXCIpO1xuXG5cdFx0XHQvLyByb3V0ZXJcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZXBsYWNlKFwidGFyZWZhXCIpO1xuXHRcdFx0aWYgKHB1c2hTdGF0ZSkge1xuXHRcdFx0XHRyb3V0ZXIuZ28oXCIvdGFyZWZhcy9cIiArIHRhcmVmYVtcIm51bWVyb1wiXSwge1xuXHRcdFx0XHRcdFwidmlld1wiOiBcInRhcmVmYVwiLFxuXHRcdFx0XHRcdFwiaWRcIjogdGFyZWZhW1wibnVtZXJvXCJdXG5cdFx0XHRcdH0sIHRhcmVmYVtcInRpdHVsb1wiXSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGFuYWx5dGljc1xuXHRcdFx0YW5hbHl0aWNzKFwiVGFyZWZhXCIsIFwiQWNlc3NvXCIsIG51bWVybyk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlRhcmVmYS5yZW5kZXIoKSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdHJlbmRlcjogZnVuY3Rpb24odGFyZWZhKSB7XG5cdFx0XHR2YXIgJHRhcmVmYSA9IF9fcmVuZGVyKFwidmlldy10YXJlZmFcIiwgdGFyZWZhKTtcblxuXHRcdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdFx0Ly8gY2FyZCBkYSB0YXJlZmFcblx0XHRcdGlmICh0YXJlZmFbXCJpbWFnZW1cIl0pIHtcblx0XHRcdFx0dGFyZWZhW1wiaW1hZ2VtXCJdW1wiYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKHRhcmVmYVtcImltYWdlbVwiXVtcImFzcGVjdG9cIl0gKiAxMDApLnRvRml4ZWQoMikgKyBcIiVcIjtcblx0XHRcdH1cblxuXHRcdFx0dmFyICR0YXJlZmFfY2FyZCA9IF9fcmVuZGVyKFwiY2FyZC10YXJlZmFcIiwgdGFyZWZhKTtcblxuXHRcdFx0aWYgKCF0YXJlZmFbXCJpbWFnZW1cIl0pIHtcblx0XHRcdFx0JChcIi5tZWRpYVwiLCAkdGFyZWZhX2NhcmQpLnJlbW92ZSgpO1xuXHRcdFx0fVxuXHRcdFx0JChcIi5ncmlkXCIsICR0YXJlZmFfY2FyZCkucmVtb3ZlKCk7XG5cdFx0XHQkKFwiYVwiLCAkdGFyZWZhX2NhcmQpLnJlbW92ZUF0dHIoXCJocmVmXCIpO1xuXG5cdFx0XHQkKFwiLnRhcmVmYS1tZXRhIC50YXJlZmEtdGV4dG9cIiwgJHRhcmVmYSkuYXBwZW5kKCR0YXJlZmFfY2FyZCk7XG5cblx0XHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHRcdC8vIGNvbnRlbnRcblx0XHRcdGxldCAkcG9zdHMgPSAkKFwiLnRhcmVmYS1jb250ZW50ID4gdWxcIiwgJHRhcmVmYSk7XG5cblx0XHRcdGlmICh0YXJlZmFbXCJwb3N0c1wiXS5sZW5ndGgpIHtcblx0XHRcdFx0cmVuZGVyUG9zdHModGFyZWZhW1wicG9zdHNcIl0sICRwb3N0cyk7XG5cblx0XHRcdFx0JHBvc3RzLmlzb3RvcGUoe1xuXHRcdFx0XHRcdFwiaXRlbVNlbGVjdG9yXCI6IFwiLmNvbnRlbnQtY2FyZFwiLFxuXHRcdFx0XHRcdFwidHJhbnNpdGlvbkR1cmF0aW9uXCI6IDAsXG5cdFx0XHRcdFx0XCJtYXNvbnJ5XCI6IHtcblx0XHRcdFx0XHRcdFwiaXNGaXRXaWR0aFwiOiB0cnVlLFxuXHRcdFx0XHRcdFx0XCJndXR0ZXJcIjogKFVJLmRhdGFbXCJjb2x1bW5zXCJdID09PSAxPyA4IDogMjQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQvLyB9KS5vbihcImxheW91dENvbXBsZXRlXCIsIGZ1bmN0aW9uKGV2ZW50LCBwb3N0cykge1xuXHRcdFx0XHQvLyBcdHZhciBwcmV2aW91c19wb3NpdGlvbjtcblx0XHRcdFx0Ly9cblx0XHRcdFx0Ly8gXHRmb3IgKHZhciBwb3N0IGluIHBvc3RzKSB7XG5cdFx0XHRcdC8vIFx0XHR2YXIgJHRoaXMgPSAkKHBvc3RzW3Bvc3RdLmVsZW1lbnQpO1xuXHRcdFx0XHQvLyBcdFx0dmFyIG9mZnNldCA9IHBvc3RzW3Bvc3RdLnBvc2l0aW9uO1xuXHRcdFx0XHQvLyBcdFx0dmFyIHNpZGUgPSAob2Zmc2V0W1wieFwiXSA9PT0gMD8gXCJsZWZ0XCIgOiBcInJpZ2h0XCIpO1xuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdFx0JHRoaXMuYWRkQ2xhc3MoXCJ0aW1lbGluZS1cIiArIHNpZGUpO1xuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdFx0aWYgKG9mZnNldFtcInlcIl0gLSBwcmV2aW91c19wb3NpdGlvbiA8IDEwKSB7XG5cdFx0XHRcdC8vIFx0XHRcdCR0aGlzLmFkZENsYXNzKFwiZXh0cmEtb2Zmc2V0XCIpO1xuXHRcdFx0XHQvLyBcdFx0fVxuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdFx0cHJldmlvdXNfcG9zaXRpb24gPSBvZmZzZXRbXCJ5XCJdO1xuXHRcdFx0XHQvLyBcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQkcG9zdHMuaXNvdG9wZShcImxheW91dFwiKTtcblx0XHRcdFx0fSwgMSk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoXCI8bGkgLz5cIikuYWRkQ2xhc3MoXCJlbXB0eVwiKS50ZXh0KFwiTmVuaHVtIHBvc3RcIikuYXBwZW5kVG8oJHBvc3RzKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdFx0Ly8gbGF5b3V0XG5cdFx0XHQkYXBwW1widGFyZWZhXCJdLmh0bWwoJHRhcmVmYSk7XG5cblx0XHRcdGlmICh0YXJlZmFbXCJwb3N0c1wiXS5sZW5ndGgpIHtcblx0XHRcdFx0JHBvc3RzLmlzb3RvcGUoXCJsYXlvdXRcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHBsYWNhciBkYSB0YXJlZmFcblx0XHRcdHZhciAkcGxhY2FyX2RhX3RhcmVmYSA9ICQoXCIucGFpbmVsIC5wbGFjYXIgdWxcIiwgJHRhcmVmYSk7XG5cblx0XHRcdCQuZWFjaChMaXN0YS5FZGljYW9bXCJ0dXJtYXNcIl0sIGZ1bmN0aW9uKGluZGV4LCB0dXJtYSkge1xuXHRcdFx0XHR2YXIgcG9udHVhY2FvX2RhX3R1cm1hID0gWyBdO1xuXG5cdFx0XHRcdC8vIGNhbGN1bGEgJSBkYSB0dXJtYSBlbSByZWxhw6fDo28gYW8gdG90YWwgZGUgcG9udG9zXG5cdFx0XHRcdHZhciBwZXJjZW50dWFsX2RhX3R1cm1hID0gKHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSA+IDA/IHBsYWNhcl9kYV90YXJlZmFbdHVybWFdIC8gcGxhY2FyX2RhX3RhcmVmYVtcInRvdGFsXCJdIDogMCk7XG5cdFx0XHRcdHBvbnR1YWNhb19kYV90dXJtYVtcInR1cm1hXCJdID0gdHVybWE7XG5cdFx0XHRcdHBvbnR1YWNhb19kYV90dXJtYVtcImFsdHVyYS1kYS1iYXJyYVwiXSA9IFwiaGVpZ2h0OiBcIiArIChwZXJjZW50dWFsX2RhX3R1cm1hICogMTAwKS50b0ZpeGVkKDMpICsgXCIlXCI7XG5cdFx0XHRcdHBvbnR1YWNhb19kYV90dXJtYVtcInR1cm1hLWZvcm1hdGFkYVwiXSA9IHR1cm1hLnRvVXBwZXJDYXNlKCk7XG5cdFx0XHRcdHBvbnR1YWNhb19kYV90dXJtYVtcInBvbnRvc1wiXSA9IChwbGFjYXJfZGFfdGFyZWZhW3R1cm1hXSA+IDA/IHBsYWNhcl9kYV90YXJlZmFbdHVybWFdIDogMCk7XG5cdFx0XHRcdHBvbnR1YWNhb19kYV90dXJtYVtcInBvbnR1YWNhby1mb3JtYXRhZGFcIl0gPSBwb250dWFjYW9fZGFfdHVybWFbXCJwb250b3NcIl0udG9TdHJpbmcoKS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIi5cIik7XG5cblx0XHRcdFx0dmFyICR0dXJtYSA9IF9fcmVuZGVyKFwicGxhY2FyLXR1cm1hXCIsIHBvbnR1YWNhb19kYV90dXJtYSk7XG5cdFx0XHRcdCRwbGFjYXJfZGFfdGFyZWZhLmFwcGVuZCgkdHVybWEpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlRhcmVmYS5jbG9zZSgpXG5cdFx0Y2xvc2U6IGZ1bmN0aW9uKHB1c2hTdGF0ZSkge1xuXHRcdFx0dGFyZWZhX2FjdGl2ZSA9IG51bGw7XG5cdFx0XHQkKFwiaGVhZCBtZXRhW25hbWU9J3RoZW1lLWNvbG9yJ11cIikuYXR0cihcImNvbnRlbnRcIiwgVUkuZGF0YVtcInRoZW1lLWNvbG9yXCJdW1wib3JpZ2luYWxcIl0pO1xuXG5cdFx0XHRVSS5ib2R5LnVubG9jaygpO1xuXHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInRhcmVmYS1hY3RpdmVcIik7XG5cdFx0XHQkYXBwW1widGFyZWZhXCJdLnJlbW92ZUNsYXNzKFwic2xpZGUteFwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkYXBwW1widGFyZWZhXCJdLnJlbW92ZUNsYXNzKFwiaW5cIikuZW1wdHkoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPj0gMykge1xuXHRcdFx0XHQvLyBVSS5iYWNrZHJvcC5oaWRlKCRhcHBbXCJ0YXJlZmFcIl0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyByb3V0ZXJcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZXBsYWNlKFwiaG9tZVwiKTtcblx0XHRcdGlmIChwdXNoU3RhdGUpIHsgcm91dGVyLmdvKFwiL3RhcmVmYXNcIiwgeyBcInZpZXdcIjogXCJob21lXCIgfSwgXCJMaXN0YSBkZSBUYXJlZmFzXCIpOyB9XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIG5ldyBwb3N0IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICogYXBwLlBvc3QuYXV0aG9yaXplKClcbi8vICogYXBwLlBvc3QuZGVhdXRob3JpemUoKVxuLy8gKiBhcHAuUG9zdC5nZXRUaHVtYm5haWwoKVxuLy8gKiBhcHAuUG9zdC5vcGVuKClcbi8vICogYXBwLlBvc3QuY2xvc2UoKVxuXG4vLyB0aXBvcyBkZSBwb3N0OiBwaG90bywgdmlkZW8sIHRleHRcblxuYXBwLlBvc3QgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JGFwcFtcInBvc3RcIl0gPSAkKFwiLmFwcC1wb3N0XCIpO1xuXHRcdCR1aVtcImJvdHRvbXNoZWV0XCJdLm9uKFwiY2xpY2tcIiwgXCIubmV3LXBvc3Qtc2hlZXQgYVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0dmFyIHR5cGUgPSAkKHRoaXMpLmRhdGEoXCJwb3N0LXR5cGVcIik7XG5cdFx0XHRVSS5ib3R0b21zaGVldC5jbG9zZSgpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0YXBwLlBvc3Qub3Blbih0eXBlLCB0YXJlZmFfYWN0aXZlKTtcblx0XHRcdH0sIDYwMCk7XG5cdFx0fSk7XG5cblx0XHQkYXBwW1wicG9zdFwiXS5vbihcInN1Ym1pdFwiLCBcImZvcm1cIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fSkub24oXCJjbGlja1wiLCBcIi5zdWJtaXQtYnV0dG9uXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRpZiAobW9tZW50KCkuaXNBZnRlcihMaXN0YS5FZGljYW9bXCJmaW1cIl0pKSB7XG5cdFx0XHRcdFVJLnRvYXN0Lm9wZW4oXCJQb3N0YWdlbnMgZW5jZXJyYWRhcyFcIik7XG5cdFx0XHR9XG5cblx0XHRcdGlmICgkKHRoaXMpLmhhc0NsYXNzKFwiZGlzYWJsZWRcIikpIHtcblx0XHRcdFx0Ly8gVE9ETyBtZWxob3JhciBtZW5zYWdlbVxuXHRcdFx0XHRVSS50b2FzdC5vcGVuKFwiRXNwZXJlIG8gZmltIGRvIHVwbG9hZCZoZWxsaXA7XCIpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGxldCBkYXRhID0gJChcImZvcm1cIiwgJGFwcFtcInBvc3RcIl0pLnNlcmlhbGl6ZSgpO1xuXHRcdFx0Ly8gRXhlbXBsbyBkZSBkYWRvczpcblx0XHRcdC8vIGFjdGlvbj1wb3N0XG5cdFx0XHQvLyBlZGljYW89eGNpaWlcblx0XHRcdC8vIHRhcmVmYT0yXG5cdFx0XHQvLyB1c2VyPTc0NFxuXHRcdFx0Ly8gdHVybWE9ZWMxXG5cdFx0XHQvLyB0b2tlbj0wZWJlMjJiZTczMWRiZDk0MmVjYjNlMDk3YTVhYzJhZTlkMzE4NTI0OWYzMTNlYWVjM2E4NTVlZjI5NTc1OTRkXG5cdFx0XHQvLyB0eXBlPWltYWdlbVxuXHRcdFx0Ly8gaW1hZ2Utb3JkZXJbXT0yLTc0NC0xNDg4MDk3MDEzLTU3OFxuXHRcdFx0Ly8gY2FwdGlvbj1cblxuXHRcdFx0JChcIi5zdWJtaXQtYnV0dG9uXCIsICRhcHBbXCJwb3N0XCJdKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpLmh0bWwoXCJFbnZpYW5kbyZoZWxsaXA7XCIpO1xuXG5cdFx0XHQkLnBvc3QoXCIvdGFyZWZhcy9cIiArIHRhcmVmYV9hY3RpdmUgKyBcIi9wb3N0YXJcIiwgZGF0YSkuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRhbmFseXRpY3MoXCJDb250ZcO6ZG9cIiwgXCJUZW50YXRpdmFcIik7XG5cblx0XHRcdFx0aWYgKHJlc3BvbnNlW1wibWV0YVwiXVtcInN0YXR1c1wiXSA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0YXBwLlBvc3QuY2xvc2UoKTtcblx0XHRcdFx0XHRhcHAuVGFyZWZhLnJlbmRlcihyZXNwb25zZVtcImRhdGFcIl0pO1xuXHRcdFx0XHRcdFVJLnRvYXN0Lm9wZW4ocmVzcG9uc2VbXCJtZXRhXCJdW1wibWVzc2FnZVwiXSk7XG5cdFx0XHRcdFx0bmF2aWdhdG9yLnZpYnJhdGUoODAwKTtcblxuXHRcdFx0XHRcdExpc3RhLlRhcmVmYXNbcmVzcG9uc2VbXCJkYXRhXCJdW1wibnVtZXJvXCJdXSA9IHJlc3BvbnNlW1wiZGF0YVwiXTtcblx0XHRcdFx0XHRhbmFseXRpY3MoXCJDb250ZcO6ZG9cIiwgXCJQb3N0YWdlbVwiKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRVSS50b2FzdC5vcGVuKChyZXNwb25zZVtcIm1ldGFcIl1bXCJtZXNzYWdlXCJdPyByZXNwb25zZVtcIm1ldGFcIl1bXCJtZXNzYWdlXCJdIDogXCJPY29ycmV1IHVtIGVycm8uIFRlbnRlIG5vdmFtZW50ZVwiKSk7XG5cdFx0XHRcdFx0YW5hbHl0aWNzKFwiQ29udGXDumRvXCIsIFwiRXJyb1wiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkuZmFpbChmdW5jdGlvbigpIHtcblx0XHRcdFx0VUkudG9hc3Qub3BlbihcIk9jb3JyZXUgdW0gZXJyby4gVGVudGUgbm92YW1lbnRlXCIsIG51bGwsIG51bGwsIGZhbHNlKTtcblx0XHRcdFx0YW5hbHl0aWNzKFwiQ29udGXDumRvXCIsIFwiRXJyb1wiKTtcblx0XHRcdH0pO1xuXG5cdFx0fSkub24oXCJjbGlja1wiLCBcIi5iYWNrLWJ1dHRvblwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGFwcC5Qb3N0LmNsb3NlKCk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Qb3N0LmF1dGhvcml6ZSgpXG5cdFx0YXV0aG9yaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIGhhYmlsaXRhIG8gYm90w6NvIGVudmlhclxuXHRcdFx0JChcIi5zdWJtaXQtYnV0dG9uXCIsICRhcHBbXCJwb3N0XCJdKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Qb3N0LmRlYXV0aG9yaXplKClcblx0XHRkZWF1dGhvcml6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBkZXNhYmlsaXRhIG8gYm90w6NvIFwiZW52aWFyXCJcblx0XHRcdCQoXCIuc3VibWl0LWJ1dHRvblwiLCAkYXBwW1wicG9zdFwiXSkuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuUG9zdC5nZXRUaHVtYm5haWwoKVxuXHRcdGdldFRodW1ibmFpbDogZnVuY3Rpb24odXJsKSB7XG5cdFx0XHQvLyB0ZXN0YSBzZSB1cmxzIHPDo28gZG9zIHByb3ZpZGVyIGFjZWl0b3MgZSByZXNwb25kZSBjb20gaW5mb3JtYcOnw7VlcyBzb2JyZSBvIHbDrWRlbyxcblx0XHRcdC8vIGluY2x1aW5kbyBhIHVybCBkYSBtaW5pYXR1cmFcblx0XHRcdC8vIHByb3ZpZGVycyBhY2VpdG9zOiB5b3V0dWJlLCB2aW1lbywgdmluZVxuXHRcdFx0dmFyIG1lZGlhX2luZm8gPSB7IH07XG5cblx0XHRcdGZ1bmN0aW9uIHNob3dUaHVtYm5haWwobWVkaWFfaW5mbykge1xuXHRcdFx0XHR2YXIgJHRodW1ibmFpbCA9ICQoXCI8aW1nIC8+XCIpLmF0dHIoXCJzcmNcIiwgbWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSk7XG5cdFx0XHRcdCQoXCIuanMtbWVkaWEtcHJvdmlkZXJcIiwgJGFwcFtcInBvc3RcIl0pLnZhbChtZWRpYV9pbmZvW1wicHJvdmlkZXJcIl0pO1xuXHRcdFx0XHQkKFwiLmpzLW1lZGlhLWlkXCIsICRhcHBbXCJwb3N0XCJdKS52YWwobWVkaWFfaW5mb1tcImlkXCJdKTtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS10aHVtYm5haWxcIiwgJGFwcFtcInBvc3RcIl0pLnZhbChtZWRpYV9pbmZvW1widGh1bWJuYWlsXCJdKTtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS1wcmV2aWV3XCIsICRhcHBbXCJwb3N0XCJdKS5odG1sKCR0aHVtYm5haWwpLmZhZGVJbigpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB5b3V0dWJlXG5cdFx0XHRpZiAodXJsLm1hdGNoKC8oPzpodHRwcz86XFwvezJ9KT8oPzp3ezN9XFwuKT95b3V0dSg/OmJlKT9cXC4oPzpjb218YmUpKD86XFwvd2F0Y2hcXD92PXxcXC8pKFteXFxzJl0rKS8pKSB7XG5cdFx0XHRcdC8vIGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9NGN0NGVOTXJKbGdcblx0XHRcdFx0dmFyIHlvdXR1YmVfdXJsID0gdXJsLm1hdGNoKC8oPzpodHRwcz86XFwvezJ9KT8oPzp3ezN9XFwuKT95b3V0dSg/OmJlKT9cXC4oPzpjb218YmUpKD86XFwvd2F0Y2hcXD92PXxcXC8pKFteXFxzJl0rKS8pO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1wicHJvdmlkZXJcIl0gPSBcInlvdXR1YmVcIjtcblx0XHRcdFx0bWVkaWFfaW5mb1tcImlkXCJdID0geW91dHViZV91cmxbMV07XG5cdFx0XHQvL1x0bWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSA9IFwiaHR0cHM6Ly9pMS55dGltZy5jb20vdmkvXCIgKyB5b3V0dWJlX3VybFsxXSArIFwiL21heHJlc2RlZmF1bHQuanBnXCI7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJ0aHVtYm5haWxcIl0gPSBcImh0dHBzOi8vaTEueXRpbWcuY29tL3ZpL1wiICsgeW91dHViZV91cmxbMV0gKyBcIi8wLmpwZ1wiO1xuXG5cdFx0XHRcdGFwcC5Qb3N0LmF1dGhvcml6ZSgpO1xuXHRcdFx0XHRzaG93VGh1bWJuYWlsKG1lZGlhX2luZm8pO1xuXHRcdFx0fSBlbHNlXG5cblx0XHRcdC8vIHZpbWVvXG5cdFx0XHRpZiAodXJsLm1hdGNoKC92aW1lb1xcLmNvbS8pKSB7XG5cdFx0XHRcdC8vIGh0dHBzOi8vdmltZW8uY29tLzY0Mjc5NjQ5XG5cdFx0XHRcdHZhciB2aW1lb191cmwgPSB1cmwubWF0Y2goL1xcL1xcLyh3d3dcXC4pP3ZpbWVvLmNvbVxcLyhcXGQrKSgkfFxcLykvKTtcblx0XHRcdFx0bWVkaWFfaW5mb1tcInByb3ZpZGVyXCJdID0gXCJ2aW1lb1wiO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1wiaWRcIl0gPSB2aW1lb191cmxbMl07XG5cblx0XHRcdFx0JC5nZXRKU09OKFwiaHR0cHM6Ly92aW1lby5jb20vYXBpL3YyL3ZpZGVvL1wiICsgdmltZW9fdXJsWzJdICsgXCIuanNvbj9jYWxsYmFjaz0/XCIpXG5cdFx0XHRcdFx0LmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRcdG1lZGlhX2luZm9bXCJ0aHVtYm5haWxcIl0gPSByZXNwb25zZVswXVtcInRodW1ibmFpbF9sYXJnZVwiXTtcblxuXHRcdFx0XHRcdFx0YXBwLlBvc3QuYXV0aG9yaXplKCk7XG5cdFx0XHRcdFx0XHRzaG93VGh1bWJuYWlsKG1lZGlhX2luZm8pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Qb3N0Lm9wZW4oKVxuXHRcdG9wZW46IGZ1bmN0aW9uKHR5cGUsIG51bWVybykge1xuXHRcdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRcdFwiZWRpY2FvXCI6IExpc3RhLkVkaWNhb1tcInRpdHVsb1wiXSxcblx0XHRcdFx0XCJudW1lcm9cIjogKG51bWVybyB8fCB0YXJlZmFfYWN0aXZlKSxcblx0XHRcdFx0XCJ1c2VyXCI6IExpc3RhLlVzdWFyaW9bXCJpZFwiXSxcblx0XHRcdFx0XCJ0dXJtYVwiOiBMaXN0YS5Vc3VhcmlvW1widHVybWFcIl0sXG5cdFx0XHRcdFwidG9rZW5cIjogTGlzdGEuVXN1YXJpb1tcInRva2VuXCJdXG5cdFx0XHR9O1xuXHRcdFx0dmFyICRuZXdfcG9zdF92aWV3ID0gX19yZW5kZXIoXCJuZXctcG9zdC1cIiArIHR5cGUsIGRhdGEpO1xuXG5cdFx0XHQvLyBlZmVpdG8gZGUgYWJlcnR1cmFcblx0XHRcdC8vIF92aWV3Lm9wZW4oJGFwcFtcInBvc3RcIl0sICRuZXdQb3N0Vmlldyk7XG5cdFx0XHQkYXBwW1wicG9zdFwiXS5odG1sKCRuZXdfcG9zdF92aWV3KS5hZGRDbGFzcyhcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGUteVwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgdmlld190aGVtZV9jb2xvciA9ICQoXCIuYXBwYmFyXCIsICRhcHBbXCJwb3N0XCJdKS5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIpO1xuXHRcdFx0XHQkKFwiaGVhZCBtZXRhW25hbWU9J3RoZW1lLWNvbG9yJ11cIikuYXR0cihcImNvbnRlbnRcIiwgdmlld190aGVtZV9jb2xvcik7XG5cdFx0XHR9KTtcblxuXHRcdFx0YXBwLlBvc3QuZGVhdXRob3JpemUoKTtcblxuXHRcdFx0Ly8gYcOnw7VlcyBwYXJhIGZhemVyIHF1YW5kbyBhYnJpciBhIHRlbGEgZGUgZW52aW9cblx0XHRcdC8vIGRlIGFjb3JkbyBjb20gbyB0aXBvIGRlIHBvc3RhZ2VtXG5cdFx0XHRpZiAodHlwZSA9PT0gXCJwaG90b1wiKSB7XG5cdFx0XHRcdCRhcHBbXCJwb3N0XCJdLmRyb3B6b25lKCk7XG5cdFx0XHRcdCQoXCIuZmlsZS1wbGFjZWhvbGRlclwiLCAkYXBwW1wicG9zdFwiXSkudHJpZ2dlcihcImNsaWNrXCIpO1xuXHRcdFx0Ly9cdCQoXCJmb3JtXCIsICRuZXdfcG9zdF92aWV3KS5kcm9wem9uZSgpO1xuXHRcdFx0fSBlbHNlXG5cblx0XHRcdGlmICh0eXBlID09PSBcInZpZGVvXCIgfHwgdHlwZSA9PT0gXCJ2aW5lXCIpIHtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS11cmwtaW5wdXRcIiwgJGFwcFtcInBvc3RcIl0pLmZvY3VzKCkub24oXCJrZXl1cFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Ly9cdGlmICgkLmluQXJyYXkoZXZlbnQua2V5Q29kZSwgWzE2LCAxNywgMThdKSkgeyByZXR1cm47IH1cblx0XHRcdFx0XHRhcHAuUG9zdC5nZXRUaHVtYm5haWwoJCh0aGlzKS52YWwoKSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlXG5cblx0XHRcdGlmICh0eXBlID09PSBcInRleHRcIikge1xuXHRcdFx0XHQkKFwiLmpzLWNhcHRpb24taW5wdXRcIiwgJGFwcFtcInBvc3RcIl0pLmZvY3VzKCkub24oXCJrZXl1cFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZiAoJCh0aGlzKS52YWwoKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRhcHAuUG9zdC5hdXRob3JpemUoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YXBwLlBvc3QuZGVhdXRob3JpemUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRVSS5iYWNrZHJvcC5zaG93KCRhcHBbXCJwb3N0XCJdKTtcblxuXHRcdFx0Ly8gdmlldyBtYW5hZ2VyXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0ucmVwbGFjZShcIm5ldy1wb3N0XCIpO1xuXHRcdFx0aGlzdG9yeS5yZXBsYWNlU3RhdGUoeyBcInZpZXdcIjogXCJuZXctcG9zdFwiLCBcInR5cGVcIjogdHlwZSwgXCJpZFwiOiBkYXRhW1wibnVtZXJvXCJdIH0sIG51bGwsIG51bGwpO1xuXHRcdH0sXG5cblx0XHQvLyBzZW5kOiBmdW5jdGlvbigpIHtcblx0XHQvL1xuXHRcdC8vIH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Qb3N0LmNsb3NlKClcblx0XHRjbG9zZTogZnVuY3Rpb24oKSB7XG5cdFx0Ly9cdHRhcmVmYV9hY3RpdmUgPSBudWxsO1xuXHRcdFx0JChcImhlYWQgbWV0YVtuYW1lPSd0aGVtZS1jb2xvciddXCIpLmF0dHIoXCJjb250ZW50XCIsIFVJLmRhdGFbXCJ0aGVtZS1jb2xvclwiXVtcIm9yaWdpbmFsXCJdKTtcblxuXHRcdFx0JGFwcFtcInBvc3RcIl0ucmVtb3ZlQ2xhc3MoXCJzbGlkZS15XCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRhcHBbXCJwb3N0XCJdLnJlbW92ZUNsYXNzKFwiaW5cIikuZW1wdHkoKTtcblx0XHRcdFx0VUkuYmFja2Ryb3AuaGlkZSgkYXBwW1wicG9zdFwiXSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLnJlcGxhY2UoXCJ0YXJlZmFcIik7XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGltYWdlIHVwbG9hZCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbnZhciBmaWxlX3N0YWNrID0geyB9O1xuXG5mdW5jdGlvbiB1cGxvYWQoZmlsZXMpIHtcblx0bGV0IGV4aWZfb3JpZW50YXRpb25fdG9fZGVncmVlcyA9IHtcblx0XHQwOiAwLFxuXHRcdDE6IDAsXG5cdFx0MjogMCxcblx0XHQzOiAxODAsXG5cdFx0NDogMCxcblx0XHQ1OiAwLFxuXHRcdDY6IDkwLFxuXHRcdDc6IDAsXG5cdFx0ODogMjcwXG5cdH07XG5cblx0RmlsZUFQSS5maWx0ZXJGaWxlcyhmaWxlcywgZnVuY3Rpb24oZmlsZSwgaW5mbykge1xuXHRcdGlmICgvXmltYWdlLy50ZXN0KGZpbGUudHlwZSkpIHtcblx0XHRcdGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dID0gaW5mbztcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdC8vXHRyZXR1cm4gaW5mby53aWR0aCA+PSAzMjAgJiYgaW5mby5oZWlnaHQgPj0gMjQwO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sIGZ1bmN0aW9uKGZpbGVzLCByZWplY3RlZCkge1xuXHRcdGlmIChmaWxlcy5sZW5ndGgpIHtcblx0XHRcdCQoXCIuc3VibWl0XCIsICRhcHBbXCJwb3N0XCJdKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xuXG5cdFx0XHQvLyBwcmV2aWV3XG5cdFx0XHRGaWxlQVBJLmVhY2goZmlsZXMsIGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0dmFyIGV4aWZfb3JpZW50YXRpb24gPSBmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcImV4aWZcIl1bXCJPcmllbnRhdGlvblwiXTtcblx0XHRcdFx0ZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0gPSB0YXJlZmFfYWN0aXZlICsgXCItXCIgKyBMaXN0YS5Vc3VhcmlvW1wiaWRcIl0gKyBcIi1cIiArXG5cdFx0XHRcdFx0bW9tZW50KCkuZm9ybWF0KFwiWFwiKSArIFwiLVwiICsgcmFuZCgwLCA5OTkpLnRvRml4ZWQoMCk7XG5cblx0XHRcdFx0aWYgKGZpbGVbXCJ0eXBlXCJdID09IFwiaW1hZ2UvZ2lmXCIpIHtcblx0XHRcdFx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRcdFx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0XHRcdHZhciBpbWcgPSAkKFwiPGltZyAvPlwiKS5hdHRyKFwic3JjXCIsIGV2ZW50LnRhcmdldC5yZXN1bHQpO1xuXHRcdFx0XHRcdFx0dmFyICR0cmFja2VyID0gJChcIjxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImltYWdlLW9yZGVyW11cXFwiIC8+XCIpLnZhbChmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXSk7XG5cblx0XHRcdFx0XHRcdHZhciAkc3RhdHVzID0gJChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJwcm9ncmVzc1wiKTtcblx0XHRcdFx0XHRcdCQoXCI8ZGl2IC8+XCIpLmFkZENsYXNzKFwic3RhdHVzXCIpLmh0bWwoXCI8c3Ryb25nPkVudmlhbmRvJmhlbGxpcDs8L3N0cm9uZz5cIikuYXBwZW5kVG8oJHN0YXR1cyk7XG5cdFx0XHRcdFx0XHQkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcImJhclwiKS5hcHBlbmRUbygkc3RhdHVzKTtcblxuXHRcdFx0XHRcdFx0dmFyICRwcmV2aWV3ID0gJChcIjxsaSAvPlwiKS5hdHRyKFwiaWRcIiwgXCJmaWxlLVwiICtcblx0XHRcdFx0XHRcdFx0XHRmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXSkuYXBwZW5kKCR0cmFja2VyKS5hcHBlbmQoJHN0YXR1cykuYXBwZW5kKGltZyk7XG5cdFx0XHRcdFx0XHQkKFwiI2Ryb3B6b25lICNib2FyZFwiKS5hcHBlbmQoJHByZXZpZXcpO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0RmlsZUFQSVxuXHRcdFx0XHRcdFx0LkltYWdlKGZpbGUpXG5cdFx0XHRcdFx0XHQucm90YXRlKGV4aWZfb3JpZW50YXRpb25fdG9fZGVncmVlc1tleGlmX29yaWVudGF0aW9uXSlcblx0XHRcdFx0XHRcdC5yZXNpemUoNjAwLCAzMDAsIFwicHJldmlld1wiKVxuXHRcdFx0XHRcdFx0LmdldChmdW5jdGlvbihlcnIsIGltZykge1xuXHRcdFx0XHRcdFx0Ly9cdCR0cmFja2VyID0gJChcIjxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImltYWdlLW9yZGVyW11cXFwiIC8+XCIpXG5cdFx0XHRcdFx0XHQvL1x0XHQudmFsKHRhcmVmYV9hY3RpdmUgKyBcIi1cIiArIExpc3RhLlVzdWFyaW9bXCJpZFwiXSArIFwiLVwiICsgZmlsZVtcIm5hbWVcIl0pO1xuXHRcdFx0XHRcdFx0XHR2YXIgJHRyYWNrZXIgPSAkKFwiPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiaW1hZ2Utb3JkZXJbXVxcXCIgLz5cIikudmFsKGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdKTtcblxuXHRcdFx0XHRcdFx0XHR2YXIgJHN0YXR1cyA9ICQoXCI8ZGl2IC8+XCIpLmFkZENsYXNzKFwicHJvZ3Jlc3NcIik7XG5cdFx0XHRcdFx0XHRcdCQoXCI8ZGl2IC8+XCIpLmFkZENsYXNzKFwic3RhdHVzXCIpLmh0bWwoXCI8c3Ryb25nPkVudmlhbmRvJmhlbGxpcDs8L3N0cm9uZz5cIikuYXBwZW5kVG8oJHN0YXR1cyk7XG5cdFx0XHRcdFx0XHRcdCQoXCI8ZGl2IC8+XCIpLmFkZENsYXNzKFwiYmFyXCIpLmFwcGVuZFRvKCRzdGF0dXMpO1xuXG5cdFx0XHRcdFx0XHRcdHZhciAkcHJldmlldyA9ICQoXCI8bGkgLz5cIikuYXR0cihcImlkXCIsIFwiZmlsZS1cIiArXG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXSkuYXBwZW5kKCR0cmFja2VyKS5hcHBlbmQoJHN0YXR1cykuYXBwZW5kKGltZyk7XG5cdFx0XHRcdFx0XHRcdCQoXCIjZHJvcHpvbmUgI2JvYXJkXCIpLmFwcGVuZCgkcHJldmlldyk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIHVwbG9hZFxuXHRcdFx0RmlsZUFQSS51cGxvYWQoe1xuXHRcdFx0XHR1cmw6IFwiL3RhcmVmYXMvXCIgKyB0YXJlZmFfYWN0aXZlICsgXCIvcG9zdGFyXCIsXG5cdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcImFjdGlvblwiOiBcInVwbG9hZFwiLFxuXHRcdFx0XHRcdFwiZWRpY2FvXCI6IExpc3RhLkVkaWNhb1tcInRpdHVsb1wiXSxcblx0XHRcdFx0XHRcInRhcmVmYVwiOiB0YXJlZmFfYWN0aXZlLFxuXHRcdFx0XHRcdFwidHVybWFcIjogTGlzdGEuVXN1YXJpb1tcInR1cm1hXCJdLFxuXHRcdFx0XHRcdFwidXNlclwiOiBMaXN0YS5Vc3VhcmlvW1wiaWRcIl1cblx0XHRcdFx0fSxcblx0XHRcdFx0cHJlcGFyZTogZnVuY3Rpb24oZmlsZSwgb3B0aW9ucykge1xuXHRcdFx0XHRcdG9wdGlvbnMuZGF0YS5yZWYgPSBmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXTtcblx0XHRcdFx0XHRmaWxlLnJlZiA9IGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdGltYWdlQXV0b09yaWVudGF0aW9uOiAoZmlsZXNbMF1bXCJ0eXBlXCJdICE9PSBcImltYWdlL2dpZlwiPyB0cnVlIDogbnVsbCksXG5cdFx0XHRcdGltYWdlVHJhbnNmb3JtOiAoZmlsZXNbMF1bXCJ0eXBlXCJdICE9PSBcImltYWdlL2dpZlwiPyB7XG5cdFx0XHRcdFx0bWF4V2lkdGg6IDE5MjAsXG5cdFx0XHRcdFx0bWF4SGVpZ2h0OiAxOTIwXG5cdFx0XHRcdH0gOiBudWxsKSxcblxuXHRcdFx0XHRmaWxlczogZmlsZXMsXG5cdFx0XHRcdGZpbGVwcm9ncmVzczogZnVuY3Rpb24oZXZlbnQsIGZpbGUsIHhocikge1xuXHRcdFx0XHRcdHZhciBwZXJjZW50ID0gKChldmVudFtcImxvYWRlZFwiXSAvIGV2ZW50W1widG90YWxcIl0pICogMTAwKS50b0ZpeGVkKDApLFxuXHRcdFx0XHRcdFx0c3RhdHVzID0gKHBlcmNlbnQgPCAxMDA/IFwiPHN0cm9uZz5FbnZpYW5kbyZoZWxsaXA7PC9zdHJvbmc+IFwiICtcblx0XHRcdFx0XHRcdFx0XHRwZXJjZW50ICsgXCIlXCIgOiBcIjxzdHJvbmc+UHJvY2Vzc2FuZG8maGVsbGlwOzwvc3Ryb25nPlwiKTtcblxuXHRcdFx0XHRcdCQoXCIjZmlsZS1cIiArIGZpbGVbXCJyZWZcIl0gKyBcIiAuc3RhdHVzXCIsIFwiI2Ryb3B6b25lXCIpLmh0bWwoc3RhdHVzKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0cHJvZ3Jlc3M6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdC8vXHR2YXIgcGVyY2VudCA9ICgoZXZlbnRbXCJsb2FkZWRcIl0gLyBldmVudFtcInRvdGFsXCJdKSAqIDEwMCkudG9GaXhlZCgwKSArIFwiJVwiXG5cdFx0XHRcdC8vXHRjb25zb2xlLmxvZyhwZXJjZW50KTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZmlsZWNvbXBsZXRlOiBmdW5jdGlvbihmaWxlLCB4aHIsIG9wdGlvbnMpIHtcblx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKGZpbGUsIHhociwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0JChcIiNmaWxlLVwiICsgb3B0aW9uc1tcInJlZlwiXSArIFwiIC5zdGF0dXNcIiwgXCIjZHJvcHpvbmVcIikuaHRtbChcIjxpIGNsYXNzPVxcXCJtYXRlcmlhbC1pY29uc1xcXCI+Y2hlY2s8L2k+XCIpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRjb21wbGV0ZTogZnVuY3Rpb24oZXJyLCB4aHIpIHtcblx0XHRcdFx0XHRhcHAuUG9zdC5hdXRob3JpemUoKTtcblx0XHRcdFx0XHQvLyAkKFwiLnN1Ym1pdC1idXR0b25cIiwgJGFwcFtcInBvc3RcIl0pLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG59XG5cbiQuZm4uZHJvcHpvbmUgPSBmdW5jdGlvbigpIHtcblx0Ly8gZHJvcHpvbmVcblx0dmFyICRkcm9wem9uZSA9ICQoXCIjZHJvcHpvbmVcIiwgdGhpcyk7XG5cdEZpbGVBUEkuZXZlbnQuZG5kKCRkcm9wem9uZVswXSwgZnVuY3Rpb24ob3Zlcikge1xuXHRcdGlmIChvdmVyKSB7XG5cdFx0XHQkZHJvcHpvbmUuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRkcm9wem9uZS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcblx0XHR9XG5cdH0sIGZ1bmN0aW9uKGZpbGVzKSB7XG5cdFx0dXBsb2FkKGZpbGVzKTtcblx0fSk7XG5cblx0Ly8gbWFudWFsIHNlbGVjdFxuXHR2YXIgJGZpbGVfaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZvcm0tZmlsZVwiKTtcblx0RmlsZUFQSS5ldmVudC5vbigkZmlsZV9pbnB1dCwgXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgZmlsZXMgPSBGaWxlQVBJLmdldEZpbGVzKGV2ZW50KTtcblx0XHR1cGxvYWQoZmlsZXMpO1xuXHR9KTtcblxuXHQvLyByZW9yZGVyXG5cdHZhciAkYm9hcmQgPSAkKFwiI2JvYXJkXCIsIHRoaXMpO1xuXHQkYm9hcmQub24oXCJzbGlwOmJlZm9yZXdhaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZiAoVUkuZGF0YVtcImludGVyYWN0aW9uLXR5cGVcIl0gPT09IFwicG9pbnRlclwiKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fSkub24oXCJzbGlwOmFmdGVyc3dpcGVcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC50YXJnZXQucmVtb3ZlKCk7XG5cdH0pLm9uKFwic2xpcDpyZW9yZGVyXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuXHRcdGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShldmVudC50YXJnZXQsIGV2ZW50LmRldGFpbC5pbnNlcnRCZWZvcmUpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0bmV3IFNsaXAoJGJvYXJkWzBdKTtcbn07XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBsb2dpbiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhcHAuTG9naW4ub3BlbigpXG4vLyBhcHAuTG9naW4uY2xvc2UoKVxuLy8gYXBwLkxvZ2luLnN1Ym1pdCgpIFs/XVxuLy8gYXBwLkxvZ2luLmxvZ291dCgpXG5cbmFwcC5Mb2dpbiA9IChmdW5jdGlvbigpIHtcblx0TGlzdGEuVXN1YXJpbyA9IHtcblx0XHRcImlkXCI6IG51bGwsXG5cdFx0XCJuYW1lXCI6IG51bGwsXG5cdFx0XCJlbWFpbFwiOiBudWxsLFxuXHRcdFwidG9rZW5cIjogbnVsbCxcblx0XHRcInR1cm1hXCI6IG51bGwsXG5cdFx0XCJzaWduZWQtaW5cIjogZmFsc2Vcblx0fTtcblxuXHQvLyBTZSB0aXZlciBkYWRvcyBndWFyZGFkb3Mgbm8gbG9jYWxTdG9yYWdlLCB1c2EgZWxlcyBwcmEgbG9nYXJcblx0aWYgKGxvY2FsU3RvcmFnZSAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIkxpc3RhLlVzdWFyaW9cIikpIHtcblx0XHRMaXN0YS5Vc3VhcmlvID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIkxpc3RhLlVzdWFyaW9cIikpO1xuXG5cdFx0JChmdW5jdGlvbigpIHtcblx0XHRcdGlmIChMaXN0YS5Vc3VhcmlvW1wiaWRcIl0gIT09IG51bGwpIHtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInNpZ25lZC1pbiB1c2VyLVwiICsgTGlzdGEuVXN1YXJpb1tcInR1cm1hXCJdKTtcblxuXHRcdFx0XHQvLyBNb3N0cmEgdG9hc3Qgc29tZW50ZSBhcMOzcyAzIHNlZ3VuZG9zXG5cdFx0XHRcdC8vIGRlcG9pcyBkbyBsb2FkIGRhIExpc3RhXG5cdFx0XHRcdGN1ZVtcImxvYWQtZWRpY2FvXCJdLmRvbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFVJLnRvYXN0LnNob3coXCJPbMOhIFwiICsgTGlzdGEuVXN1YXJpb1tcIm5hbWVcIl0gKyBcIiFcIik7XG5cdFx0XHRcdFx0fSwgMzAwMCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0JChmdW5jdGlvbigpIHtcblx0XHQkdWlbXCJsb2dpblwiXSA9ICQoXCIuYXBwLWxvZ2luXCIpO1xuXHRcdCR1aVtcImxvZ2luXCJdW1wiYnV0dG9uXCJdID0gJChcIi5qcy1sb2dpbi1idXR0b25cIiwgJHVpW1wibG9naW5cIl0pO1xuXG5cdFx0Ly8gQm90w7VlcyBkZSBsb2dpbiBlIGxvZ291dFxuXHRcdCQoXCIuanMtbG9naW4tdHJpZ2dlclwiLCAkdWlbXCJzaWRlbmF2XCJdKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0VUkuc2lkZW5hdi5jbG9zZSgpO1xuXHRcdFx0YXBwLkxvZ2luLnNob3coKTtcblx0XHR9KTtcblxuXHRcdCQoXCIuanMtbG9nb3V0LXRyaWdnZXJcIiwgJHVpW1wic2lkZW5hdlwiXSkub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFVJLnNpZGVuYXYuY2xvc2UoKTtcblx0XHRcdGFwcC5Mb2dpbi5sb2dvdXQoKTtcblx0XHR9KTtcblxuXHRcdC8vIEHDp8OjbyBkZSBsb2dpblxuXHRcdCR1aVtcImxvZ2luXCJdLm9uKFwiY2xpY2tcIiwgXCIuYmFjay1idXR0b25cIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRhcHAuTG9naW4uaGlkZSgpO1xuXHRcdH0pLm9uKFwic3VibWl0XCIsIFwiZm9ybVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0JChcIi5qcy1sb2dpbi1idXR0b25cIiwgJHVpW1wiZm9ybVwiXSkudHJpZ2dlcihcImNsaWNrXCIpO1xuXHRcdFx0bGV0IGxvZ2luX2RhdGEgPSAkKFwiZm9ybVwiLCAkdWlbXCJsb2dpblwiXSkuc2VyaWFsaXplKCk7XG5cdFx0XHRhcHAuTG9naW4uc3VibWl0KGxvZ2luX2RhdGEpO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxvZ2luLnNob3coKVxuXHRcdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gQWJyZSBhIHRlbGEgZGUgbG9naW4gZSBjb2xvY2EgbyBmb2NvIG5vIGNhbXBvIGUtbWFpbFxuXHRcdFx0JHVpW1wibG9naW5cIl0uYWRkQ2xhc3MoXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlXCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFVJLmJvZHkubG9jaygpO1xuXHRcdFx0XHRVSS5iYWNrZHJvcC5zaG93KCR1aVtcImxvZ2luXCJdKTtcblx0XHRcdFx0JChcImlucHV0W25hbWU9J2VtYWlsJ11cIiwgJHVpW1wibG9naW5cIl0pLmZvY3VzKCk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTG9naW4uaGlkZSgpXG5cdFx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJsb2dpblwiXS5yZW1vdmVDbGFzcyhcInNsaWRlXCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR1aVtcImxvZ2luXCJdLnJlbW92ZUNsYXNzKFwiaW5cIik7XG5cdFx0XHRcdFVJLmJhY2tkcm9wLmhpZGUoJHVpW1wibG9naW5cIl0pO1xuXHRcdFx0XHRVSS5ib2R5LnVubG9jaygpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxvZ2luLnN1Ym1pdCgpXG5cdFx0c3VibWl0OiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHQvLyBEZXNhdGl2YSBvIGJvdMOjbyBlIGNvbG9jYSBtZW5zYWdlbSBkZSBlc3BlcmFcblx0XHRcdCR1aVtcImxvZ2luXCJdW1wiYnV0dG9uXCJdXG5cdFx0XHRcdC5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSlcblx0XHRcdFx0LnRleHQoXCJBZ3VhcmRl4oCmXCIpO1xuXG5cdFx0XHQvLyBFbnZpYSBwZWRpZG8gcGFyYSBhIEFQSVxuXHRcdFx0TGlzdGFBUEkoXCIvaWRlbnRpZmljYWNhb1wiLCBkYXRhKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChyZXNwb25zZVtcIm1ldGFcIl1bXCJzdGF0dXNcIl0gPT09IDIwMCkge1xuXHRcdFx0XHRcdExpc3RhLlVzdWFyaW8gPSByZXNwb25zZVtcInVzZXJcIl07XG5cdFx0XHRcdFx0TGlzdGEuVXN1YXJpb1tcInNpZ25lZC1pblwiXSA9IHRydWU7XG5cdFx0XHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJMaXN0YS5Vc3VhcmlvXCIsIEpTT04uc3RyaW5naWZ5KExpc3RhLlVzdWFyaW8pKTtcblxuXHRcdFx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJzaWduZWQtaW4gdXNlci1cIiArIExpc3RhLlVzdWFyaW9bXCJ0dXJtYVwiXSk7XG5cdFx0XHRcdFx0YXBwLkxvZ2luLmhpZGUoKTtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0VUkudG9hc3Quc2hvdyhcIk9sw6EgXCIgKyBMaXN0YS5Vc3VhcmlvW1wibmFtZVwiXSArIFwiIVwiKTtcblx0XHRcdFx0XHR9LCA1MDApO1xuXG5cdFx0XHRcdFx0YW5hbHl0aWNzKFwiTG9naW5cIiwgXCJBY2Vzc29cIik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gU2UgdGVudGF0aXZhIGZvciByZWN1c2FkYSxcblx0XHRcdFx0XHQvLyBjb2xvY2EgYW5pbWHDp8OjbyBubyBjYW1wbyBkZSBsb2dpbiBwb3IgMSBzZWd1bmRvXG5cdFx0XHRcdFx0JChcIi5mb3JtLWdyb3VwXCIsICR1aVtcImxvZ2luXCJdKS5hZGRDbGFzcyhcImFuaW1hdGVkIHNoYWtlXCIpO1xuXG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdCQoXCIuZm9ybS1ncm91cFwiLCAkdWlbXCJsb2dpblwiXSkucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBzaGFrZVwiKTtcblx0XHRcdFx0XHR9LCAxMDAwKTtcblxuXHRcdFx0XHRcdGFuYWx5dGljcyhcIkxvZ2luXCIsIFwiRXJyb1wiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkuZmFpbChmdW5jdGlvbigpIHtcblx0XHRcdFx0VUkudG9hc3Quc2hvdyhcIk9jb3JyZXUgdW0gZXJyby4gVGVudGUgbm92YW1lbnRlXCIpO1xuXHRcdFx0XHRhbmFseXRpY3MoXCJMb2dpblwiLCBcIkVycm9cIik7XG5cdFx0XHR9KS5hbHdheXMoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR1aVtcImxvZ2luXCJdW1wiYnV0dG9uXCJdXG5cdFx0XHRcdFx0LnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSlcblx0XHRcdFx0XHQudGV4dChcIkxvZ2luXCIpO1xuXHRcdFx0XHRhbmFseXRpY3MoXCJMb2dpblwiLCBcIlRlbnRhdGl2YVwiKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Mb2dpbi5sb2dvdXQoKVxuXHRcdGxvZ291dDogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBUaXJhIGFzIGNsYXNzZXMgaW5kaWNhZG9yYXMgZGUgbG9naW4gZG8gYm9keVxuXHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInNpZ25lZC1pbiB1c2VyLVwiICsgTGlzdGEuVXN1YXJpb1tcInR1cm1hXCJdKTtcblxuXHRcdFx0Ly8gTGltcGEgTGlzdGEuVXN1YXJpbyB0YW50byBuYSBww6FnaW5hIHF1YW50byBubyBsb2NhbFN0b3JhZ2Vcblx0XHRcdExpc3RhLlVzdWFyaW8gPSB7XG5cdFx0XHRcdFwiaWRcIjogbnVsbCxcblx0XHRcdFx0XCJuYW1lXCI6IG51bGwsXG5cdFx0XHRcdFwiZW1haWxcIjogbnVsbCxcblx0XHRcdFx0XCJ0b2tlblwiOiBudWxsLFxuXHRcdFx0XHRcInR1cm1hXCI6IG51bGwsXG5cdFx0XHRcdFwic2lnbmVkLWluXCI6IGZhbHNlXG5cdFx0XHR9O1xuXG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIkxpc3RhLlVzdWFyaW9cIiwgSlNPTi5zdHJpbmdpZnkoTGlzdGEuVXN1YXJpbykpO1xuXG5cdFx0XHQvLyBEZXBvaXMgZGUgMCw1IHNlZ3VuZG8sXG5cdFx0XHQvLyBtb3N0cmEgdG9hc3QgY29uZmlybWFuZG8gbG9nb3V0XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRVSS50b2FzdC5zaG93KFwiU2Vzc8OjbyBlbmNlcnJhZGEhXCIpO1xuXHRcdFx0fSwgNTAwKTtcblxuXHRcdFx0YW5hbHl0aWNzKFwiTG9naW5cIiwgXCJMb2dvdXRcIik7XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHdvcmtlcnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gc3RhcnRcbndvcmtlci5TdGFydCA9IChmdW5jdGlvbigpIHtcblx0dGltaW5nW1wiZGVsYXktc3RhcnRcIl0gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdGxvZyhcIndvcmtlci5TdGFydFwiLCBcImluZm9cIik7XG5cblx0XHRjdWVbXCJsb2FkLWVkaWNhb1wiXSA9ICQuRGVmZXJyZWQoKTtcblx0XHRjdWVbXCJmaXJzdC1sb2FkXCJdID0gdHJ1ZTtcblxuXHRcdGN1ZVtcImxvYWQtZWRpY2FvXCJdLmRvbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBTZSB0aXZlciBuw7ptZXJvIGRlIHRhcmVmYSBlc3BlY2lmaWNhZG8gbmEgVVJMLCBhYnJlIGVsYVxuXHRcdFx0aWYgKHJvdXRlcltcInBhdGhcIl0gJiYgcm91dGVyW1wicGF0aFwiXVsyXSkge1xuXHRcdFx0XHQvLyBBbnRlcywgdGVzdGEgc2UgbyB2YWxvciDDqSB1bSBuw7ptZXJvXG5cdFx0XHRcdC8vIGUgZGVudHJvIGRvIG7Dum1lcm8gZGUgdGFyZWZhcyBkZXNzYSBFZGnDp8Ojb1xuXHRcdFx0XHRsZXQgbnVtZXJvID0gcm91dGVyW1wicGF0aFwiXVsyXTtcblx0XHRcdFx0aWYgKCFpc05hTihudW1lcm8pICYmIG51bWVybyA+PSAxICYmIG51bWVybyA8PSBMaXN0YS5FZGljYW9bXCJudW1lcm8tZGUtdGFyZWZhc1wiXSkge1xuXHRcdFx0XHRcdGFwcC5UYXJlZmEub3BlbihudW1lcm8sIGZhbHNlLCBmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gU2UgZm9yIG8gcHJpbWVpcm8gbG9hZFxuXHRcdFx0aWYgKGN1ZVtcImZpcnN0LWxvYWRcIl0pIHtcblx0XHRcdFx0Ly8gSW5pY2lhIGEgYmFycmEgZGUgZXZvbHXDp8Ojb1xuXHRcdFx0XHR0aW1pbmdbXCJkZWxheS1ldm9sdWNhb1wiXSA9IHNldFRpbWVvdXQoYXBwLkV2b2x1Y2FvLnN0YXJ0LCAxMDApO1xuXG5cdFx0XHRcdC8vIEluaWNpYSBhIGNoZWNhZ2VtIGRlIGF0aXZpZGFkZVxuXHRcdFx0XHR3b3JrZXIuVXBkYXRlKCk7XG5cblx0XHRcdFx0Ly8gRGVzYXRpdmEgbm9zIGxvYWRzIHNlZ3VpbnRlc1xuXHRcdFx0XHRjdWVbXCJmaXJzdC1sb2FkXCJdID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aW1pbmdbXCJkZWxheS1sb2FkXCJdID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdHdvcmtlci5Mb2FkKCk7XG5cdFx0fSwgMzAwKTtcblxuXHRcdGFuYWx5dGljcyhcIkxpc3RhXCIsIFwiQWNlc3NvXCIpO1xuXHR9LCAwKTtcbn0pKCk7XG5cblxuLy8gbG9hZFxud29ya2VyLkxvYWQgPSAoZnVuY3Rpb24oKSB7XG5cdGxvZyhcIndvcmtlci5Mb2FkXCIsIFwiaW5mb1wiKTtcblxuXHRMaXN0YUFQSShcIi90dWRvXCIpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRMaXN0YS5FZGljYW8gPSByZXNwb25zZVtcImVkaWNhb1wiXTtcblx0XHRMaXN0YS5QbGFjYXIgPSByZXNwb25zZVtcInBsYWNhclwiXTtcblx0XHRMaXN0YS5UYXJlZmFzID0gcmVzcG9uc2VbXCJ0YXJlZmFzXCJdO1xuXG5cdFx0dGltaW5nW1wiZGVsYXktbGlzdGFcIl0gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gRGlzcGFyYSBhIGZ1bsOnw6NvIGRlIG1vbnRhZ2VtIGRhIExpc3RhXG5cdFx0XHRhcHAuTGlzdGEuc3RhcnQoKTtcblxuXHRcdFx0Ly8gUmVzb2x2ZSBhIHByb21pc2UgbG9hZC1lZGljYW9cblx0XHRcdGN1ZVtcImxvYWQtZWRpY2FvXCJdLnJlc29sdmUoKTtcblx0XHRcdGxvZyhcImN1ZVtcXFwibG9hZC1lZGljYW9cXFwiXSB0cmlnZ2VyZWRcIik7XG5cdFx0fSwgMSk7XG5cblx0XHQvLyB0aW1pbmdbXCJkZWxheS1wbGFjYXJcIl0gPSBzZXRUaW1lb3V0KGFwcC5QbGFjYXIuc3RhcnQsIDQwMCk7XG5cdH0pO1xufSk7XG5cblxuLy8gdXBkYXRlXG53b3JrZXIuVXBkYXRlID0gKGZ1bmN0aW9uKCkge1xuXHRsZXQgdXBkYXRlcyA9IHtcblx0XHRcInRhcmVmYXNcIjogMCxcblx0XHRcInBvc3RzXCI6IDAsXG5cdFx0XCJ0b3RhbFwiOiAwLFxuXHRcdFwibGFzdC11cGRhdGVkXCI6IG51bGxcblx0fTtcblxuXHR0aW1pbmdbXCJhdGl2aWRhZGVcIl0gPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRsb2coXCJ3b3JrZXIuVXBkYXRlXCIsIFwiaW5mb1wiKTtcblxuXHRcdExpc3RhQVBJKFwiL2F0aXZpZGFkZVwiKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHQvLyBjb25zb2xlLmluZm8odXBkYXRlcyk7XG5cdFx0XHQvLyBDb25mZXJlIGRhdGEgZGUgY2FkYSBhdGl2aWRhZGUgZSB2w6ogc2Ugw6kgcG9zdGVyaW9yIMOgIMO6bHRpbWEgYXR1YWxpemHDp8Ojby5cblx0XHRcdC8vIFNlIGZvciwgYWRpY2lvbmEgw6AgY29udGFnZW0gZGUgbm92YSBhdGl2aWRhZGVcblx0XHRcdGZvciAobGV0IGF0aXZpZGFkZSBvZiByZXNwb25zZSkge1xuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhtb21lbnQoYXRpdmlkYWRlW1widHNcIl0pLmlzQWZ0ZXIodXBkYXRlc1tcImxhc3QtdXBkYXRlZFwiXSkpO1xuXHRcdFx0XHRpZiAobW9tZW50KGF0aXZpZGFkZVtcInRzXCJdKS5pc0FmdGVyKHVwZGF0ZXNbXCJsYXN0LXVwZGF0ZWRcIl0pICYmIGF0aXZpZGFkZVtcImF1dG9yXCJdICE9IExpc3RhLlVzdWFyaW9bXCJpZFwiXSkge1xuXHRcdFx0XHRcdHVwZGF0ZXNbXCJ0b3RhbFwiXSsrO1xuXG5cdFx0XHRcdFx0aWYgKGF0aXZpZGFkZVtcImFjYW9cIl0gPT09IFwibm92YS10YXJlZmFcIikge1xuXHRcdFx0XHRcdFx0dXBkYXRlc1tcInRhcmVmYXNcIl0rKztcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGF0aXZpZGFkZVtcImFjYW9cIl0gPT09IFwibm92by1wb3N0XCIpIHtcblx0XHRcdFx0XHRcdHVwZGF0ZXNbXCJwb3N0c1wiXSsrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBTZSBob3V2ZXIgbm92YSBhdGl2aWRhZGVcblx0XHRcdGlmICh1cGRhdGVzW1widG90YWxcIl0gPiAwKSB7XG5cdFx0XHRcdC8vIE1vbnRhIG8gdGV4dG8gZG8gdG9hc3Rcblx0XHRcdFx0bGV0IHRleHRvID0ge1xuXHRcdFx0XHRcdFwidGFyZWZhc1wiOiB1cGRhdGVzW1widGFyZWZhc1wiXSArIFwiIFwiICsgKHVwZGF0ZXNbXCJ0YXJlZmFzXCJdID4gMT8gXCJub3ZhcyB0YXJlZmFzXCIgOiBcIm5vdmEgdGFyZWZhXCIpLFxuXHRcdFx0XHRcdFwicG9zdHNcIjogdXBkYXRlc1tcInBvc3RzXCJdICsgXCIgXCIgKyAodXBkYXRlc1tcInBvc3RzXCJdID4gMT8gXCJub3ZvcyBwb3N0c1wiIDogXCJub3ZvIHBvc3RcIiksXG5cdFx0XHRcdFx0XCJmaW5hbFwiOiBcIlwiXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0aWYgKHVwZGF0ZXNbXCJ0YXJlZmFzXCJdID4gMCkge1xuXHRcdFx0XHRcdHRleHRvW1wiZmluYWxcIl0gKz0gdGV4dG9bXCJ0YXJlZmFzXCJdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICgodXBkYXRlc1tcInRhcmVmYXNcIl0gPiAwKSAmJiAodXBkYXRlc1tcInBvc3RzXCJdID4gMCkpIHtcblx0XHRcdFx0XHR0ZXh0b1tcImZpbmFsXCJdICs9IFwiIGUgXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHVwZGF0ZXNbXCJwb3N0c1wiXSA+IDApIHtcblx0XHRcdFx0XHR0ZXh0b1tcImZpbmFsXCJdICs9IHRleHRvW1wicG9zdHNcIl07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBNb3N0cmEgbyB0b2FzdFxuXHRcdFx0XHRVSS50b2FzdC5zaG93KHtcblx0XHRcdFx0XHRcIm1lc3NhZ2VcIjogdGV4dG9bXCJmaW5hbFwiXSxcblx0XHRcdFx0XHRcImxhYmVsXCI6IFwiQXR1YWxpemFyXCIsXG5cdFx0XHRcdFx0XCJhY3Rpb25cIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR3b3JrZXIuTG9hZCgpO1xuXHRcdFx0XHRcdFx0dXBkYXRlc1tcInRhcmVmYXNcIl0gPSAwO1xuXHRcdFx0XHRcdFx0dXBkYXRlc1tcInBvc3RzXCJdID0gMDtcblx0XHRcdFx0XHRcdHVwZGF0ZXNbXCJ0b3RhbFwiXSA9IDA7XG5cdFx0XHRcdFx0XHQkdWlbXCJwYWdlLXRpdGxlXCJdLmh0bWwoVUkuZGF0YVtcInBhZ2UtdGl0bGVcIl0pO1xuXHRcdFx0XHRcdFx0YW5hbHl0aWNzKFwiTGlzdGFcIiwgXCJBdHVhbGl6YcOnw6NvXCIpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XCJwZXJzaXN0ZW50XCI6IHRydWUsXG5cdFx0XHRcdFx0XCJzdGFydC1vbmx5XCI6IHRydWVcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gTW9zdHJhIG7Dum1lcm8gZGUgbm92YXMgYXRpdmlkYWRlcyBubyB0w610dWxvXG5cdFx0XHRcdCR1aVtcInRpdGxlXCJdLmh0bWwoXCIoXCIgKyB1cGRhdGVzW1widG90YWxcIl0gKyBcIikgXCIgKyBVSS5kYXRhW1wicGFnZS10aXRsZVwiXSk7XG5cdFx0XHR9XG5cblx0XHRcdHVwZGF0ZXNbXCJsYXN0LXVwZGF0ZWRcIl0gPSAocmVzcG9uc2VbMF0/IG1vbWVudChyZXNwb25zZVswXVtcInRzXCJdKSA6IG1vbWVudCgpKTtcblxuXHRcdFx0Ly8gY29uc29sZS5sb2cocmVzcG9uc2UsIHVwZGF0ZXMpO1xuXHRcdH0pO1xuXHR9LCAzMDAwMCk7XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGZvbnRzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gQ3JpYSB1bWEgcHJvbWlzZSBxdWUgc2Vyw6EgcmVzb2x2aWRhXG4vLyBxdWFuZG8gYXMgZm9udGVzIGZvcmVtIGNhcnJlZ2FkYXNcbmN1ZVtcImxvYWQtZm9udHNcIl0gPSAkLkRlZmVycmVkKCk7XG5cbldlYkZvbnQubG9hZCh7XG5cdHRpbWVvdXQ6IDE1MDAwLFxuXHRnb29nbGU6IHtcblx0XHRmYW1pbGllczogW1xuXHRcdFx0XCJNYXRlcmlhbCBJY29uc1wiLFxuXHRcdFx0Ly8gXCJSb2JvdG86NDAwLDQwMGl0YWxpYyw1MDA6bGF0aW5cIixcblx0XHRcdC8vIFwiUm9ib3RvK01vbm86NzAwOmxhdGluXCIsXG5cdFx0XHRcIkxhdG86NDAwOmxhdGluXCJcblx0XHRdXG5cdH0sXG5cdGN1c3RvbToge1xuXHRcdGZhbWlsaWVzOiBbXG5cdFx0XHRcIkZvbnRBd2Vzb21lXCJcblx0XHRdLFxuXHRcdHVybHM6IFtcblx0XHRcdFwiaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvZm9udC1hd2Vzb21lLzQuNy4wL2Nzcy9mb250LWF3ZXNvbWUubWluLmNzc1wiXG5cdFx0XVxuXHR9LFxuXHRhY3RpdmU6IGZ1bmN0aW9uKCkge1xuXHRcdGN1ZVtcImxvYWQtZm9udHNcIl0ucmVzb2x2ZSgpO1xuXG5cdFx0JChmdW5jdGlvbigpIHtcblx0XHRcdGFwcC5MaXN0YS5sYXlvdXQoKTtcblx0XHR9KTtcblx0fVxufSk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBtb21lbnRqcyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbm1vbWVudC5sb2NhbGUoXCJwdC1iclwiLCB7XG5cdFx0XCJtb250aHNcIjogXCJqYW5laXJvX2ZldmVyZWlyb19tYXLDp29fYWJyaWxfbWFpb19qdW5ob19qdWxob19hZ29zdG9fc2V0ZW1icm9fb3V0dWJyb19ub3ZlbWJyb19kZXplbWJyb1wiLnNwbGl0KFwiX1wiKSxcblx0XHRcIm1vbnRoc1Nob3J0XCI6IFwiamFuX2Zldl9tYXJfYWJyX21haV9qdW5fanVsX2Fnb19zZXRfb3V0X25vdl9kZXpcIi5zcGxpdChcIl9cIiksXG5cdFx0XCJ3ZWVrZGF5c1wiOiBcImRvbWluZ29fc2VndW5kYS1mZWlyYV90ZXLDp2EtZmVpcmFfcXVhcnRhLWZlaXJhX3F1aW50YS1mZWlyYV9zZXh0YS1mZWlyYV9zw6FiYWRvXCIuc3BsaXQoXCJfXCIpLFxuXHRcdFwid2Vla2RheXNTaG9ydFwiOiBcImRvbV9zZWdfdGVyX3F1YV9xdWlfc2V4X3PDoWJcIi5zcGxpdChcIl9cIiksXG5cdFx0XCJ3ZWVrZGF5c01pblwiOiBcImRvbV8ywqpfM8KqXzTCql81wqpfNsKqX3PDoWJcIi5zcGxpdChcIl9cIiksXG5cdFx0XCJsb25nRGF0ZUZvcm1hdFwiOiB7XG5cdFx0XHRcIkxUXCI6IFwiSEg6bW1cIixcblx0XHRcdFwiTFRTXCI6IFwiSEg6bW06c3NcIixcblx0XHRcdFwiTFwiOiBcIkREL01NL1lZWVlcIixcblx0XHRcdFwiTExcIjogXCJEIFtkZV0gTU1NTSBbZGVdIFlZWVlcIixcblx0XHRcdFwiTExMXCI6IFwiRCBbZGVdIE1NTU0gW2RlXSBZWVlZIFvDoHNdIEhIOm1tXCIsXG5cdFx0XHRcIkxMTExcIjogXCJkZGRkLCBEIFtkZV0gTU1NTSBbZGVdIFlZWVkgW8Ogc10gSEg6bW1cIlxuXHRcdH0sXG5cdFx0XCJjYWxlbmRhclwiOiB7XG5cdFx0XHRcInNhbWVEYXlcIjogXCJbaG9qZV0gTFRcIixcblx0XHRcdFwibmV4dERheVwiOiBcIlthbWFuaMOjXSBMVFwiLFxuXHRcdFx0XCJuZXh0V2Vla1wiOiBcImRkZGQgTFRcIixcblx0XHRcdFwibGFzdERheVwiOiBcIltvbnRlbV0gTFRcIixcblx0XHRcdFwibGFzdFdlZWtcIjogXCJkZGRkIExUXCIsXG5cdFx0XHRcInNhbWVFbHNlXCI6IFwiTFwiXG5cdFx0fSxcblx0XHRcInJlbGF0aXZlVGltZVwiOiB7XG5cdFx0XHRcImZ1dHVyZVwiOiBcImRhcXVpICVzXCIsXG5cdFx0XHRcInBhc3RcIjogXCIlcyBhdHLDoXNcIixcblx0XHRcdFwic1wiOiBcInBvdWNvcyBzZWd1bmRvc1wiLFxuXHRcdFx0XCJtXCI6IFwidW0gbWludXRvXCIsXG5cdFx0XHRcIm1tXCI6IFwiJWQgbWludXRvc1wiLFxuXHRcdFx0XCJoXCI6IFwidW1hIGhvcmFcIixcblx0XHRcdFwiaGhcIjogXCIlZCBob3Jhc1wiLFxuXHRcdFx0XCJkXCI6IFwidW0gZGlhXCIsXG5cdFx0XHRcImRkXCI6IFwiJWQgZGlhc1wiLFxuXHRcdFx0XCJNXCI6IFwidW0gbcOqc1wiLFxuXHRcdFx0XCJNTVwiOiBcIiVkIG1lc2VzXCIsXG5cdFx0XHRcInlcIjogXCJ1bSBhbm9cIixcblx0XHRcdFwieXlcIjogXCIlZCBhbm9zXCJcblx0XHR9LFxuXHRcdFwib3JkaW5hbFBhcnNlXCI6IC9cXGR7MSwyfcK6Lyxcblx0XHRcIm9yZGluYWxcIjogXCIlZMK6XCJcblx0fSk7XG4iXX0=
