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
	ga("send", "event", category, action, label);
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
				$ui["toast"].removeClass("stream-only");
				timing["toast"] = setTimeout(UI.toast.dismiss, 6500);
			} else {
				$ui["toast"].addClass("stream-only");
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
	$ui["sidenav"].on("click", ".js-stream-sort a", function (event) {
		event.preventDefault();

		var criteria = $(this).data("sort-by");
		$(".js-stream-sort a", $ui["sidenav"]).removeClass("active");
		$(this).addClass("active");

		app.Lista.sort(criteria);
		UI.sidenav.close();
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
			analytics("Tarefa", "Visualização", numero);
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
				if (response["meta"]["status"] === 200) {
					app.Post.close();
					app.Tarefa.render(response["data"]);
					UI.toast.open(response["meta"]["message"]);
					navigator.vibrate(800);

					Lista.Tarefas[response["data"]["numero"]] = response["data"];
				} else {
					UI.toast.open(response["meta"]["message"] ? response["meta"]["message"] : "Ocorreu um erro. Tente novamente");
				}
			}).fail(function () {
				UI.toast.open("Ocorreu um erro. Tente novamente", null, null, false);
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
			ListaAPI("/auth", data).done(function (response) {
				analytics("Login", "Tentativa");

				if (response["meta"]["status"] === 200) {
					Lista.Usuario = response["user"];
					Lista.Usuario["signed-in"] = true;
					localStorage.setItem("Lista.Usuario", JSON.stringify(Lista.Usuario));

					$ui["body"].addClass("signed-in user-" + Lista.Usuario["turma"]);
					app.Login.hide();
					setTimeout(function () {
						UI.toast.show("Olá " + Lista.Usuario["name"] + "!");
					}, 500);

					analytics("Login", "Sucesso");
				} else {
					$(".form-group", $ui["login"]).addClass("animated shake");
					setTimeout(function () {
						$(".form-group", $ui["login"]).removeClass("animated shake");
					}, 1000);

					analytics("Login", "Falha");
				}
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

					if (atividade["acao"] === "novo-tarefa") {
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
		families: ["Material Icons", "Roboto:400,400italic,500:latin", "Roboto+Mono:700:latin", "Lato:400:latin"]
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiLCJ1dGlsaXRpZXMuanMiLCJ0ZW1wbGF0ZS1lbmdpbmUuanMiLCJyb3V0ZXIuanMiLCJkb2N1bWVudC5qcyIsImJvZHkuanMiLCJsb2FkYmFyLmpzIiwiYmFja2Ryb3AuanMiLCJzaWRlbmF2LmpzIiwiYm90dG9tc2hlZXQuanMiLCJ0b2FzdC5qcyIsImFwaS5qcyIsInBsYWNhci5qcyIsImV2b2x1Y2FvLmpzIiwibGlzdGEuanMiLCJ0YXJlZmEuanMiLCJwb3N0LmpzIiwidXBsb2FkLmpzIiwibG9naW4uanMiLCJ3b3JrZXJzLmpzIiwiZm9udHMuanMiLCJtb21lbnQtbG9jYWxlLmpzIl0sIm5hbWVzIjpbIkxpc3RhIiwiRWRpY2FvIiwiUGxhY2FyIiwiVGFyZWZhcyIsIlVzdWFyaW8iLCJhcHAiLCIkYXBwIiwiY2FjaGUiLCJjdWUiLCJ3b3JrZXIiLCJ0aW1pbmciLCJsb2dnaW5nIiwibG9nIiwibWVzc2FnZSIsInR5cGUiLCJ0aW1lc3RhbXAiLCJtb21lbnQiLCJmb3JtYXQiLCJjb25zb2xlIiwiYW5hbHl0aWNzIiwiY2F0ZWdvcnkiLCJhY3Rpb24iLCJsYWJlbCIsImdhIiwidGFyZWZhX2FjdGl2ZSIsInJhbmQiLCJtaW4iLCJtYXgiLCJNYXRoIiwicmFuZG9tIiwiJHRlbXBsYXRlcyIsIiQiLCJlYWNoIiwiJHRoaXMiLCJuYW1lIiwiYXR0ciIsImh0bWwiLCJyZW1vdmUiLCJfX3JlbmRlciIsInRlbXBsYXRlIiwiZGF0YSIsIiRyZW5kZXIiLCJjbG9uZSIsImZuIiwiZmlsbEJsYW5rcyIsIiRibGFuayIsImZpbGwiLCJydWxlcyIsInNwbGl0IiwiaSIsImxlbmd0aCIsInBhaXIiLCJkZXN0IiwidHJpbSIsInNvdXJjZSIsInZhbHVlIiwiYWRkQ2xhc3MiLCJ2YWwiLCJpZl9udWxsIiwiaGlkZSIsInJlbW92ZUNsYXNzIiwicmVtb3ZlQXR0ciIsImhhc0NsYXNzIiwicm91dGVyIiwibG9jYXRpb24iLCJwYXRobmFtZSIsImhhc2giLCJwYXRoIiwib2JqZWN0IiwidGl0bGUiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwibGluayIsImFkZCIsInZpZXciLCJwdXNoIiwiZ3JlcCIsInJlcGxhY2UiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJzdGF0ZSIsImluZGV4T2YiLCJVSSIsImJvdHRvbXNoZWV0IiwiY2xvc2UiLCJQb3N0IiwiVGFyZWZhIiwib3BlbiIsIiR1aSIsImRvY3VtZW50IiwiYm9keSIsInRleHQiLCJyZWZsb3ciLCJvZmZzZXQiLCJsZWZ0IiwibmF2aWdhdG9yIiwibXNNYXhUb3VjaFBvaW50cyIsInNldExheW91dFByb3BlcnRpZXMiLCJ3aWR0aCIsImhlaWdodCIsImZsb29yIiwibGF5b3V0X2NsYXNzIiwiZ2V0U2Nyb2xsYmFyU2l6ZSIsIiRvdXRlckNvbnRhaW5lciIsImNzcyIsImFwcGVuZFRvIiwiJGlubmVyQ29udGFpbmVyIiwib24iLCJzZXRTY3JvbGxQb3NpdGlvbiIsInNjcm9sbFRvcCIsInNjcm9sbFN0YXR1cyIsInkiLCJsb2NrIiwidW5sb2NrIiwibG9hZGJhciIsInNob3ciLCJzZXRUaW1lb3V0Iiwib25lIiwiYmFja2Ryb3AiLCIkc2NyZWVuIiwiZXZlbnRzIiwic2NyZWVuIiwiemluZGV4IiwiaGFuZGxlciIsInRyaWdnZXIiLCJvZmYiLCJzaWRlbmF2IiwicHJldmVudERlZmF1bHQiLCIkY29udGVudCIsImVtcHR5IiwidG9hc3QiLCJjb25maWciLCJkaXNtaXNzIiwiY2xlYXJUaW1lb3V0IiwiY2FsbGJhY2siLCJwZXJzaXN0ZW50IiwiYXBpX2tleSIsIkxpc3RhQVBJIiwiZW5kcG9pbnQiLCJhcGlfdXJsIiwiZWRpY2FvIiwicmVxdWVzdCIsImdldEpTT04iLCJ1cGRhdGUiLCJ0dXJtYXMiLCJtYWlvcl9wb250dWFjYW8iLCJ0b3RhbF9kZV9wb250b3MiLCJ0dXJtYSIsInBvbnR1YWNhb19kYV90dXJtYSIsImluZGV4IiwicGVyY2VudHVhbF9kYV90dXJtYSIsInRvRml4ZWQiLCJ0b1VwcGVyQ2FzZSIsInRvU3RyaW5nIiwiJHR1cm1hIiwiYXBwZW5kIiwicGFyZW50IiwiRXZvbHVjYW8iLCJkdXJhY2FvX3RvdGFsIiwic3RhcnQiLCJkaWFfaW5pY2lhbCIsImRpYV9maW5hbCIsImRpZmYiLCJkaWEiLCJpc0JlZm9yZSIsImluaWNpb19kb19kaWEiLCJmaW5hbF9kb19kaWEiLCJlbmRPZiIsImlzQWZ0ZXIiLCJkdXJhY2FvX2RvX2RpYSIsInBlcmNlbnR1YWxfZG9fZGlhIiwibGFyZ3VyYV9kb19kaWEiLCIkZGlhIiwic2V0SW50ZXJ2YWwiLCJhZ29yYSIsInRlbXBvX3RyYW5zY29ycmlkbyIsInBlcmNlbnR1YWxfdHJhbnNjb3JyaWRvIiwibGFyZ3VyYV9kYV9iYXJyYSIsImlzb3RvcGUiLCJlbGVtZW50IiwicGFyc2VJbnQiLCJ3aGljaCIsIiRjYXJkIiwibnVtZXJvIiwidGFyZWZhcyIsInN0YXR1cyIsIm1lc3NhZ2VzIiwiY2xlYXJJbnRlcnZhbCIsInBhZ2VfdGl0bGUiLCJjbG9zaW5nX21lc3NhZ2UiLCJ0YXJlZmEiLCIkdGFyZWZhIiwiJGdyaWQiLCJ0b3RhbF9wb3N0cyIsIm1heF9tZWRpYV90b19zaG93Iiwic2hvd25fbWVkaWFfY291bnQiLCJwb3N0X3R5cGVzX3dpdGhfaW1hZ2VfcHJldmlldyIsInBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXciLCJwb3N0IiwidGlsZV90eXBlIiwibWVkaWEiLCJzdWJzdHJpbmciLCIkdGlsZSIsImxheW91dCIsInNvcnQiLCJsb2FkIiwiJHN0cmVhbSIsImxvYWRpbmciLCJkb25lIiwiUmVndWxhbWVudG8iLCJsYXN0X3VwZGF0ZWQiLCJ1cGRhdGVkIiwiY3JpdGVyaWEiLCJwbGFjYXJfZGFfdGFyZWZhIiwicmVuZGVyUG9zdHMiLCJwb3N0cyIsIiRwb3N0cyIsImNhbGVuZGFyIiwiJGNvbnRlbnRfY2FyZCIsIiRtZWRpYSIsIiRpbWFnZSIsIiRlbWJlZCIsInJlbmRlciIsImdvIiwiJHRhcmVmYV9jYXJkIiwiJHBsYWNhcl9kYV90YXJlZmEiLCJzZXJpYWxpemUiLCJyZXNwb25zZSIsInZpYnJhdGUiLCJmYWlsIiwiYXV0aG9yaXplIiwiZGVhdXRob3JpemUiLCJnZXRUaHVtYm5haWwiLCJ1cmwiLCJtZWRpYV9pbmZvIiwic2hvd1RodW1ibmFpbCIsIiR0aHVtYm5haWwiLCJmYWRlSW4iLCJtYXRjaCIsInlvdXR1YmVfdXJsIiwidmltZW9fdXJsIiwiJG5ld19wb3N0X3ZpZXciLCJ2aWV3X3RoZW1lX2NvbG9yIiwiZHJvcHpvbmUiLCJmb2N1cyIsInJlcGxhY2VTdGF0ZSIsImZpbGVfc3RhY2siLCJ1cGxvYWQiLCJmaWxlcyIsImV4aWZfb3JpZW50YXRpb25fdG9fZGVncmVlcyIsIkZpbGVBUEkiLCJmaWx0ZXJGaWxlcyIsImZpbGUiLCJpbmZvIiwidGVzdCIsInJlamVjdGVkIiwiZXhpZl9vcmllbnRhdGlvbiIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJpbWciLCJ0YXJnZXQiLCJyZXN1bHQiLCIkdHJhY2tlciIsIiRzdGF0dXMiLCIkcHJldmlldyIsInJlYWRBc0RhdGFVUkwiLCJJbWFnZSIsInJvdGF0ZSIsInJlc2l6ZSIsImdldCIsImVyciIsInByZXBhcmUiLCJvcHRpb25zIiwicmVmIiwiaW1hZ2VBdXRvT3JpZW50YXRpb24iLCJpbWFnZVRyYW5zZm9ybSIsIm1heFdpZHRoIiwibWF4SGVpZ2h0IiwiZmlsZXByb2dyZXNzIiwieGhyIiwicGVyY2VudCIsInByb2dyZXNzIiwiZmlsZWNvbXBsZXRlIiwiY29tcGxldGUiLCIkZHJvcHpvbmUiLCJkbmQiLCJvdmVyIiwiJGZpbGVfaW5wdXQiLCJnZXRFbGVtZW50QnlJZCIsImdldEZpbGVzIiwiJGJvYXJkIiwib3JpZ2luYWxFdmVudCIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJkZXRhaWwiLCJTbGlwIiwiTG9naW4iLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiSlNPTiIsInBhcnNlIiwibG9nb3V0IiwibG9naW5fZGF0YSIsInN1Ym1pdCIsInNldEl0ZW0iLCJzdHJpbmdpZnkiLCJTdGFydCIsIkRlZmVycmVkIiwiaXNOYU4iLCJVcGRhdGUiLCJMb2FkIiwicmVzb2x2ZSIsInVwZGF0ZXMiLCJhdGl2aWRhZGUiLCJ0ZXh0byIsIldlYkZvbnQiLCJ0aW1lb3V0IiwiZ29vZ2xlIiwiZmFtaWxpZXMiLCJjdXN0b20iLCJ1cmxzIiwiYWN0aXZlIiwibG9jYWxlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUFBLFFBQUEsRUFBQTtBQUNBQSxNQUFBQyxNQUFBLEdBQUEsRUFBQTtBQUNBRCxNQUFBRSxNQUFBLEdBQUEsRUFBQTtBQUNBRixNQUFBRyxPQUFBLEdBQUEsRUFBQTtBQUNBSCxNQUFBSSxPQUFBLEdBQUEsRUFBQTs7QUFFQTtBQUNBO0FBQ0EsSUFBQUMsTUFBQSxFQUFBO0FBQ0EsSUFBQUMsT0FBQSxFQUFBOztBQUVBLElBQUFDLFFBQUEsRUFBQTtBQUNBQSxNQUFBLFNBQUEsSUFBQSxFQUFBOztBQUVBOztBQUVBLElBQUFDLE1BQUEsRUFBQTtBQUNBLElBQUFDLFNBQUEsRUFBQTtBQUNBLElBQUFDLFNBQUEsRUFBQTs7QUFFQTtBQUNBO0FBQ0EsSUFBQUMsVUFBQSxLQUFBO0FBQ0EsSUFBQUMsTUFBQSxVQUFBQyxPQUFBLEVBQUFDLElBQUEsRUFBQTtBQUNBLEtBQUFILE9BQUEsRUFBQTtBQUNBO0FBQ0EsTUFBQUksWUFBQUMsU0FBQUMsTUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBSixZQUFBLE1BQUFFLFNBQUEsR0FBQSxJQUFBLEdBQUFGLE9BQUE7O0FBRUEsTUFBQSxDQUFBQyxJQUFBLEVBQUE7QUFDQUksV0FBQU4sR0FBQSxDQUFBQyxPQUFBO0FBQ0EsR0FGQSxNQUVBO0FBQ0FLLFdBQUFKLElBQUEsRUFBQUQsT0FBQTtBQUNBO0FBQ0E7QUFDQSxDQVpBOztBQWNBLElBQUFNLFlBQUEsVUFBQUMsUUFBQSxFQUFBQyxNQUFBLEVBQUFDLEtBQUEsRUFBQTtBQUNBQyxJQUFBLE1BQUEsRUFB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QUE7O0FDUkE7QUFDQTtBQUNBOztBQUVBNUwsT0FBQW9ULE1BQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLDJGQUFBcFIsS0FBQSxDQUFBLEdBQUEsQ0FEQTtBQUVBLGdCQUFBLGtEQUFBQSxLQUFBLENBQUEsR0FBQSxDQUZBO0FBR0EsYUFBQSxpRkFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FIQTtBQUlBLGtCQUFBLDhCQUFBQSxLQUFBLENBQUEsR0FBQSxDQUpBO0FBS0EsZ0JBQUEseUJBQUFBLEtBQUEsQ0FBQSxHQUFBLENBTEE7QUFNQSxtQkFBQTtBQUNBLFFBQUEsT0FEQTtBQUVBLFNBQUEsVUFGQTtBQUdBLE9BQUEsWUFIQTtBQUlBLFFBQUEsdUJBSkE7QUFLQSxTQUFBLGtDQUxBO0FBTUEsVUFBQTtBQU5BLEVBTkE7QUFjQSxhQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEsYUFBQSxhQUZBO0FBR0EsY0FBQSxTQUhBO0FBSUEsYUFBQSxZQUpBO0FBS0EsY0FBQSxTQUxBO0FBTUEsY0FBQTtBQU5BLEVBZEE7QUFzQkEsaUJBQUE7QUFDQSxZQUFBLFVBREE7QUFFQSxVQUFBLFVBRkE7QUFHQSxPQUFBLGlCQUhBO0FBSUEsT0FBQSxXQUpBO0FBS0EsUUFBQSxZQUxBO0FBTUEsT0FBQSxVQU5BO0FBT0EsUUFBQSxVQVBBO0FBUUEsT0FBQSxRQVJBO0FBU0EsUUFBQSxTQVRBO0FBVUEsT0FBQSxRQVZBO0FBV0EsUUFBQSxVQVhBO0FBWUEsT0FBQSxRQVpBO0FBYUEsUUFBQTtBQWJBLEVBdEJBO0FBcUNBLGlCQUFBLFVBckNBO0FBc0NBLFlBQUE7QUF0Q0EsQ0FBQSIsImZpbGUiOiJsaXN0YS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGxpc3RhIGRlIHRhcmVmYXMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gVG9kYXMgYXMgaW5mb3JtYcOnw7VlcyBmaWNhbSBndWFyZGFkYXMgZGVudHJvIGRvIG9iamV0byBcIkxpc3RhXCIsXG4vLyBlbSB1bSBkb3Mgc2V1cyA0IG7Ds3NcbmxldCBMaXN0YSA9IFsgXTtcbkxpc3RhLkVkaWNhbyA9IHsgfTtcbkxpc3RhLlBsYWNhciA9IFsgXTtcbkxpc3RhLlRhcmVmYXMgPSBbIF07XG5MaXN0YS5Vc3VhcmlvID0geyB9O1xuXG4vLyBcImFwcFwiIGd1YXJkYSBvcyBtw6l0b2RvcyBlc3BlY8OtZmljb3MgZG8gZnVuY2lvbmFtZW50byBkYSBMaXN0YSxcbi8vIFwiJGFwcFwiIGd1YXJkYSBhcyByZWZlcsOqbmNpYXMgalF1ZXJ5IGFvIERPTSB1c2FkYXMgbmVzc2VzIG3DqXRvZG9zXG5sZXQgYXBwID0gWyBdO1xubGV0ICRhcHAgPSBbIF07XG5cbmxldCBjYWNoZSA9IFsgXTtcbmNhY2hlW1widGFyZWZhc1wiXSA9IFsgXTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5sZXQgY3VlID0gWyBdO1xubGV0IHdvcmtlciA9IFsgXTtcbmxldCB0aW1pbmcgPSBbIF07XG5cbi8vIFNlIG8gbG9nZ2luZyBlc3RpdmVyIGxpZ2FkbywgcmVsYXRhIGNhZGEgcGFzc28gbm8gY29uc29sZVxuLy8gT2JzOiBuZW0gdG9kb3Mgb3MgbcOpdG9kb3MgZXN0w6NvIGNvbSBsb2dzIGNyaWFkb3Mgb3UgZGV0YWxoYWRvcyFcbmxldCBsb2dnaW5nID0gZmFsc2U7XG5sZXQgbG9nID0gZnVuY3Rpb24obWVzc2FnZSwgdHlwZSkge1xuXHRpZiAobG9nZ2luZykge1xuXHRcdC8vIEluc2VyZSBhIGhvcmEgbm8gbG9nXG5cdFx0bGV0IHRpbWVzdGFtcCA9IG1vbWVudCgpLmZvcm1hdChcIkxUU1wiKTtcblx0XHRtZXNzYWdlID0gXCJbXCIgKyB0aW1lc3RhbXAgKyBcIl0gXCIgKyBtZXNzYWdlO1xuXG5cdFx0aWYgKCF0eXBlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhtZXNzYWdlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZVt0eXBlXShtZXNzYWdlKTtcblx0XHR9XG5cdH1cbn1cblxubGV0IGFuYWx5dGljcyA9IGZ1bmN0aW9uKGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsKSB7XG5cdGdhKFwic2VuZFwiLCBcImV2ZW50XCIsIGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsKTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gZGFxdWkgcHJhIGJhaXhvIG7Do28gw6kgcHJhIHRlciBuYWRhISFcblxudmFyIHRhcmVmYV9hY3RpdmU7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvIHV0aWxpdGllcyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFTDrXR1bG8gZSBjb3IgZG8gdGVtYVxuVUkuZGF0YVtcInRoZW1lLWNvbG9yXCJdID0gWyBdO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQkdWlbXCJ0aXRsZVwiXSA9ICQoXCJoZWFkIHRpdGxlXCIpO1xuXHRVSS5kYXRhW1widGl0bGVcIl0gPSAkdWlbXCJ0aXRsZVwiXS5odG1sKCk7XG5cblx0JHVpW1widGhlbWUtY29sb3JcIl0gPSAkKFwibWV0YVtuYW1lPSd0aGVtZS1jb2xvciddXCIpO1xuXHRVSS5kYXRhW1widGhlbWUtY29sb3JcIl1bXCJvcmlnaW5hbFwiXSA9ICR1aVtcInRoZW1lLWNvbG9yXCJdLmF0dHIoXCJjb250ZW50XCIpO1xufSk7XG5cbi8vIFRpcG8gZGUgaW50ZXJhw6fDo28gKHRvdWNoIG91IHBvaW50ZXIpXG5VSS5kYXRhW1wiaW50ZXJhY3Rpb24tdHlwZVwiXSA9IChcIm9udG91Y2hzdGFydFwiIGluIHdpbmRvdyB8fCBuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyk/IFwidG91Y2hcIiA6IFwicG9pbnRlclwiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gUHJvcHJpZWRhZGVzIGRhIGphbmVsYSBlIGRvIGxheW91dFxuVUkuZGF0YVtcImNvbHVtbi13aWR0aFwiXSA9IDMxNjsgLy8gTGFyZ3VyYSBkYSBjb2x1bmEsIGluY2x1aW5kbyBtYXJnZW1cblVJLmRhdGFbXCJ3aW5kb3dcIl0gPSBbIF07XG5cbmZ1bmN0aW9uIHNldExheW91dFByb3BlcnRpZXMoKSB7XG5cdC8vIERpbWVuc8O1ZXMgKGxhcmd1cmEgZSBhbHR1cmEpIGRhIGphbmVsYVxuXHRVSS5kYXRhW1wid2luZG93XCJdW1wid2lkdGhcIl0gPSAkdWlbXCJ3aW5kb3dcIl0ud2lkdGgoKTtcblx0VUkuZGF0YVtcIndpbmRvd1wiXVtcImhlaWdodFwiXSA9ICR1aVtcIndpbmRvd1wiXS5oZWlnaHQoKTtcblxuXHQvLyBDYWxjdWxhIG7Dum1lcm8gZGUgY29sdW5hc1xuXHRVSS5kYXRhW1wiY29sdW1uc1wiXSA9IE1hdGguZmxvb3IoVUkuZGF0YVtcIndpbmRvd1wiXVtcIndpZHRoXCJdIC8gVUkuZGF0YVtcImNvbHVtbi13aWR0aFwiXSk7XG5cblx0Ly8gQWRpY2lvbmEgY2xhc3NlIG5vIDxib2R5PiBkZSBhY29yZG8gY29tIGEgcXVhbnRpZGFkZSBkZSBjb2x1bmFzXG5cdGxldCBsYXlvdXRfY2xhc3M7XG5cdGlmIChVSS5kYXRhW1wiY29sdW1uc1wiXSA9PT0gMSkge1xuXHRcdGxheW91dF9jbGFzcyA9IFwidWktc2luZ2xlLWNvbHVtblwiO1xuXHR9IGVsc2UgaWYgKFVJLmRhdGFbXCJjb2x1bW5zXCJdID09PSAyKSB7XG5cdFx0bGF5b3V0X2NsYXNzID0gXCJ1aS1kdWFsLWNvbHVtblwiO1xuXHR9IGVsc2Uge1xuXHRcdGxheW91dF9jbGFzcyA9IFwidWktbXVsdGktY29sdW1uXCI7XG5cdH1cblxuXHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwidWktc2luZ2xlLWNvbHVtbiB1aS1kdWFsLWNvbHVtbiB1aS1tdWx0aS1jb2x1bW5cIikuYWRkQ2xhc3MobGF5b3V0X2NsYXNzKTtcbn1cblxuZnVuY3Rpb24gZ2V0U2Nyb2xsYmFyU2l6ZSgpIHtcblx0Ly8gRGVzY29icmUgbyB0YW1hbmhvIGRhIGJhcnJhIGRlIHJvbGFnZW1cblx0bGV0ICRvdXRlckNvbnRhaW5lciA9ICQoXCI8ZGl2IC8+XCIpLmNzcyh7XG5cdFx0XCJvdmVyZmxvd1wiOiBcInNjcm9sbFwiLFxuXHRcdFwiZGlzcGxheVwiOiBcIm5vbmVcIlxuXHR9KS5hcHBlbmRUbygkdWlbXCJib2R5XCJdKTtcblx0bGV0ICRpbm5lckNvbnRhaW5lciA9ICQoXCI8ZGl2IC8+XCIpLmFwcGVuZFRvKCRvdXRlckNvbnRhaW5lcik7XG5cblx0VUkuZGF0YVtcInNjcm9sbGJhci1zaXplXCJdID0gJG91dGVyQ29udGFpbmVyLndpZHRoKCkgLSAkaW5uZXJDb250YWluZXIud2lkdGgoKTtcblx0JG91dGVyQ29udGFpbmVyLnJlbW92ZSgpO1xufVxuXG4vLyBBcyBwcm9wcmllZGFkZXMgZGEgamFuZWxhIGUgZG8gbGF5b3V0IHPDo28gY2FsY3VsYWRhc1xuLy8gcXVhbmRvIGEgcMOhZ2luYSDDqSBjYXJyZWdhZGEgZSBxdWFuZG8gYSBqYW5lbGEgw6kgcmVkaW1lbnNpb25hZGEuXG4vLyBPIHRhbWFuaG8gZGEgYmFycmEgZGUgcm9sYWdlbSDDqSBjYWxjdWxhZG8gc29tZW50ZSBxdWFuZG8gYSBww6FnaW5hIMOpIGNhcnJlZ2FkYVxuJChmdW5jdGlvbigpIHsgc2V0TGF5b3V0UHJvcGVydGllcygpOyBnZXRTY3JvbGxiYXJTaXplKCk7IH0pO1xuJHVpW1wid2luZG93XCJdLm9uKFwicmVzaXplXCIsIHNldExheW91dFByb3BlcnRpZXMpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gUHJvcHJpZWRhZGVzIChwb3Npw6fDo28gbm8gdG9wbyBlIG5vIGZpbSBkYSBqYW5lbGEpIGRvIHNjcm9sbFxuVUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXSA9IFsgXTtcblxuZnVuY3Rpb24gc2V0U2Nyb2xsUG9zaXRpb24oKSB7XG5cdFVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl1bXCJ0b3BcIl0gPSAkdWlbXCJ3aW5kb3dcIl0uc2Nyb2xsVG9wKCk7XG5cdFVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl1bXCJib3R0b21cIl0gPSBVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1widG9wXCJdICsgVUkuZGF0YVtcIndpbmRvd1wiXVtcImhlaWdodFwiXTtcbn1cblxuLy8gQXMgcHJvcHJpZWRhZGVzIGRvIHNjcm9sbCBzw6NvIGNhbGN1bGFkYXMgcXVhbmRvIGEgcMOhZ2luYSDDqSBjYXJyZWdhZGFcbi8vIGUgcXVhbmRvIGEgamFuZWxhIMOpIHJlZGltZW5zaW9uYWRhIG91IFwic2Nyb2xsYWRhXCJcbiQoZnVuY3Rpb24oKSB7IHNldFNjcm9sbFBvc2l0aW9uKCk7IH0pO1xuJHVpW1wid2luZG93XCJdLm9uKFwic2Nyb2xsIHJlc2l6ZVwiLCBzZXRTY3JvbGxQb3NpdGlvbik7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB0ZW1wbGF0ZSBlbmdpbmUgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmxldCAkdGVtcGxhdGVzID0geyB9O1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQvLyBQZWdhIG9zIHRlbXBsYXRlcyBkbyBIVE1MLFxuXHQvLyBndWFyZGEgZW0gJHRlbXBsYXRlc1xuXHQvLyBlIHJlbW92ZSBlbGVzIGRvIGPDs2RpZ28tZm9udGVcblx0JChcInRlbXBsYXRlXCIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0bGV0ICR0aGlzID0gJCh0aGlzKTtcblx0XHRsZXQgbmFtZSA9ICR0aGlzLmF0dHIoXCJpZFwiKTtcblx0XHRsZXQgaHRtbCA9ICR0aGlzLmh0bWwoKTtcblxuXHRcdCR0ZW1wbGF0ZXNbbmFtZV0gPSAkKGh0bWwpO1xuXHRcdCR0aGlzLnJlbW92ZSgpO1xuXHR9KTtcbn0pO1xuXG5mdW5jdGlvbiBfX3JlbmRlcih0ZW1wbGF0ZSwgZGF0YSkge1xuXHQvLyBTZSB0ZW1wbGF0ZSBuw6NvIGV4aXN0aXIsIGFib3J0YVxuXHRpZiAoISR0ZW1wbGF0ZXNbdGVtcGxhdGVdKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyICRyZW5kZXIgPSAkdGVtcGxhdGVzW3RlbXBsYXRlXS5jbG9uZSgpO1xuXG5cdCRyZW5kZXIuZGF0YShkYXRhKTtcblxuXHQkLmZuLmZpbGxCbGFua3MgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgJGJsYW5rID0gJCh0aGlzKTtcblx0XHR2YXIgZmlsbCA9ICRibGFuay5kYXRhKFwiZmlsbFwiKTtcblxuXHRcdHZhciBydWxlcyA9IGZpbGwuc3BsaXQoXCIsXCIpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBwYWlyID0gcnVsZXNbaV0uc3BsaXQoXCI6XCIpO1xuXHRcdFx0dmFyIGRlc3QgPSAocGFpclsxXT8gcGFpclswXS50cmltKCkgOiBcImh0bWxcIik7XG5cdFx0XHR2YXIgc291cmNlID0gKHBhaXJbMV0/IHBhaXJbMV0udHJpbSgpIDogcGFpclswXSk7XG5cdFx0XHR2YXIgdmFsdWUgPSBkYXRhW3NvdXJjZV07XG5cblx0XHRcdC8vIFRPRE9cblx0XHRcdC8vIHNvdXJjZSA9IHNvdXJjZS5zcGxpdChcIi9cIik7XG5cdFx0XHQvLyBpZiAoc291cmNlLmxlbmd0aCA+IDEpIHtcblx0XHRcdC8vIFx0Ly8gdmFsdWUgPSBkYXRhW3NvdXJjZVswXV07XG5cdFx0XHQvLyBcdC8vIGNvbnNvbGUubG9nKHNvdXJjZSwgc291cmNlLCB2YWx1ZSk7XG5cdFx0XHQvLyBcdC8vIGlmICh0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdC8vIFx0XHRmb3IgKHZhciBqID0gMDsgaiA8PSBzb3VyY2UubGVuZ3RoOyBqKyspIHtcblx0XHRcdC8vIFx0XHRcdGNvbnNvbGUubG9nKHZhbHVlLCBzb3VyY2UsIGRhdGFbc291cmNlWzBdXSk7XG5cdFx0XHQvLyBcdFx0XHRpZiAodmFsdWUgJiYgdmFsdWVbc291cmNlXSAmJiBzb3VyY2Vbal0gJiYgdmFsdWVbc291cmNlW2pdXSkge1xuXHRcdFx0Ly8gXHRcdFx0XHR2YWx1ZSA9ICh2YWx1ZVtzb3VyY2Vbal1dKT8gdmFsdWVbc291cmNlW2pdXSA6IG51bGw7XG5cdFx0XHQvLyBcdFx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gXHRcdFx0XHR2YWx1ZSA9IG51bGw7XG5cdFx0XHQvLyBcdFx0XHR9XG5cdFx0XHQvLyBcdFx0fVxuXHRcdFx0Ly8gXHQvLyB9XG5cdFx0XHQvLyB9XG5cblx0XHRcdGlmICh0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIgJiYgdmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0aWYgKGRlc3QgPT09IFwiY2xhc3NcIikge1xuXHRcdFx0XHRcdCRibGFuay5hZGRDbGFzcyh2YWx1ZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZGVzdCA9PT0gXCJodG1sXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsuaHRtbCh2YWx1ZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZGVzdCA9PT0gXCJ2YWx1ZVwiKSB7XG5cdFx0XHRcdFx0JGJsYW5rLnZhbCh2YWx1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JGJsYW5rLmF0dHIoZGVzdCwgdmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgaWZfbnVsbCA9ICRibGFuay5kYXRhKFwiZmlsbC1udWxsXCIpO1xuXHRcdFx0XHRpZiAoaWZfbnVsbCA9PT0gXCJoaWRlXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsuaGlkZSgpO1xuXHRcdFx0XHR9IGVsc2UgaWYoaWZfbnVsbCA9PT0gXCJyZW1vdmVcIikge1xuXHRcdFx0XHRcdCRibGFuay5yZW1vdmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdCRibGFua1xuXHRcdFx0LnJlbW92ZUNsYXNzKFwiZmlsbFwiKVxuXHRcdFx0LnJlbW92ZUF0dHIoXCJkYXRhLWZpbGxcIilcblx0XHRcdC5yZW1vdmVBdHRyKFwiZGF0YS1maWxsLW51bGxcIik7XG5cdH07XG5cblx0aWYgKCRyZW5kZXIuaGFzQ2xhc3MoXCJmaWxsXCIpKSB7XG5cdFx0JHJlbmRlci5maWxsQmxhbmtzKCk7XG5cdH1cblxuXHQkKFwiLmZpbGxcIiwgJHJlbmRlcikuZWFjaChmdW5jdGlvbigpIHtcblx0XHQkKHRoaXMpLmZpbGxCbGFua3MoKTtcblx0fSk7XG5cblx0cmV0dXJuICRyZW5kZXI7XG59XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyByb3V0ZXIgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG52YXIgcm91dGVyID0gWyBdO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBuYXZpZ2F0aW9uIG1vZGVcbnJvdXRlcltcInBhdGhcIl0gPSBsb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIik7XG5cbmlmIChyb3V0ZXJbXCJwYXRoXCJdWzFdID09PSBcInRhcmVmYXNcIikge1xuXHRyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPSBcInBhdGhcIjtcbn0gZWxzZSB7XG5cdHJvdXRlcltcIm5hdmlnYXRpb24tbW9kZVwiXSA9IFwiaGFzaFwiO1xuXHRyb3V0ZXJbXCJwYXRoXCJdID0gbG9jYXRpb24uaGFzaC5zcGxpdChcIi9cIik7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGdvXG5yb3V0ZXJbXCJnb1wiXSA9IGZ1bmN0aW9uKHBhdGgsIG9iamVjdCwgdGl0bGUpIHtcblx0aWYgKHJvdXRlcltcIm5hdmlnYXRpb24tbW9kZVwiXSA9PT0gXCJwYXRoXCIpIHtcblx0XHRoaXN0b3J5LnB1c2hTdGF0ZShvYmplY3QsIHRpdGxlLCBwYXRoKTtcblx0fSBlbHNlIHtcblx0XHRoaXN0b3J5LnB1c2hTdGF0ZShvYmplY3QsIHRpdGxlLCBcIiNcIiArIHBhdGgpO1xuXHRcdC8vIGxvY2F0aW9uLmhhc2ggPSBwYXRoO1xuXHR9XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBidWlsZCBsaW5rXG5yb3V0ZXJbXCJidWlsZC1saW5rXCJdID0gZnVuY3Rpb24ocGF0aCkge1xuXHR2YXIgbGluaztcblx0aWYgKHJvdXRlcltcIm5hdmlnYXRpb24tbW9kZVwiXSA9PT0gXCJwYXRoXCIpIHtcblx0XHRsaW5rID0gcGF0aDtcblx0fSBlbHNlIHtcblx0XHRsaW5rID0gXCIjXCIgKyBwYXRoO1xuXHR9XG5cblx0cmV0dXJuIGxpbms7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB2aWV3IG1hbmFnZXJcbnJvdXRlcltcImN1cnJlbnQtdmlld1wiXSA9IFtcImhvbWVcIl07XG5yb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0gPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0YWRkOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0ucHVzaCh2aWV3KTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSk7XG5cdFx0fSxcblx0XHRyZW1vdmU6IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHRcdHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSA9ICQuZ3JlcChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0sIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZSAhPT0gdmlldztcblx0XHRcdH0pO1xuXHRcdFx0Ly8gY29uc29sZS5sb2cocm91dGVyW1wiY3VycmVudC12aWV3XCJdKTtcblx0XHR9LFxuXHRcdHJlcGxhY2U6IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHRcdHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSA9IFsgXTtcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5hZGQodmlldyk7XG5cdFx0fVxuXHR9O1xufSkoKTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdC8vIGNvbnNvbGUubG9nKFwibG9jYXRpb246IFwiICsgZG9jdW1lbnQubG9jYXRpb24gKyBcIiwgc3RhdGU6IFwiICsgSlNPTi5zdHJpbmdpZnkoZXZlbnQuc3RhdGUpKTtcblxuXHR2YXIgc3RhdGUgPSBldmVudC5zdGF0ZTtcblxuXHRpZiAoc3RhdGUgJiYgc3RhdGVbXCJ2aWV3XCJdID09PSBcInRhcmVmYVwiKSB7XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwiYm90dG9tc2hlZXRcIikgPiAtMSkgeyBVSS5ib3R0b21zaGVldC5jbG9zZSgpOyB9XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwibmV3LXBvc3RcIikgPiAtMSkgeyBhcHAuUG9zdC5jbG9zZSgpOyB9XG5cdFx0YXBwLlRhcmVmYS5vcGVuKHN0YXRlW1wiaWRcIl0pO1xuXHR9XG5cblx0ZWxzZSBpZiAoc3RhdGUgJiYgc3RhdGVbXCJ2aWV3XCJdID09PSBcIm5ldy1wb3N0XCIpIHtcblx0XHQvLyBhcHAuUG9zdC5vcGVuKHN0YXRlW1widHlwZVwiXSwgc3RhdGVbXCJpZFwiXSk7XG5cdH1cblxuXHRlbHNlIGlmIChzdGF0ZSAmJiBzdGF0ZVtcInZpZXdcIl0gPT09IFwiYm90dG9tc2hlZXRcIikge1xuXHRcdGlmIChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0uaW5kZXhPZihcIm5ldy1wb3N0XCIpID4gLTEpIHsgYXBwLlBvc3QuY2xvc2UoKTsgfVxuXHR9XG5cbi8vXHRpZiAoc3RhdGVbXCJ2aWV3XCJdID09PSBcImhvbWVcIikge1xuXHRlbHNlIHtcblx0XHRpZiAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLmluZGV4T2YoXCJib3R0b21zaGVldFwiKSA+IC0xKSB7IFVJLmJvdHRvbXNoZWV0LmNsb3NlKCk7IH1cblx0XHRpZiAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLmluZGV4T2YoXCJuZXctcG9zdFwiKSA+IC0xKSB7IGFwcC5Qb3N0LmNsb3NlKCk7IH1cblx0XHRhcHAuVGFyZWZhLmNsb3NlKCk7XG5cdH1cblxufSk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHN0YXRlczpcbi8vICogdGFyZWZhXG4vLyAqIGhvbWVcbi8vICogbmV3LXBvc3Rcbi8vICogYm90dG9tc2hlZXRcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmxldCBVSSA9IHsgfVxuVUkuZGF0YSA9IFsgXTtcblxubGV0ICR1aSA9IFsgXTtcbiR1aVtcIndpbmRvd1wiXSA9ICQod2luZG93KTtcbiR1aVtcImJvZHlcIl0gPSAkKGRvY3VtZW50LmJvZHkpO1xuXG4vLyBQZWdhIG8gdMOtdHVsbyBkYSBww6FnaW5hIChcIkxpc3RhIGRlIFRhcmVmYXNcIilcbi8vIGUgZ3VhcmRhIHByYSBxdWFuZG8gZm9yIG5lY2Vzc8OhcmlvIHJlY3VwZXJhclxuJHVpW1wicGFnZS10aXRsZVwiXSA9ICQoXCJoZWFkIHRpdGxlXCIpO1xuVUkuZGF0YVtcInBhZ2UtdGl0bGVcIl0gPSAkdWlbXCJwYWdlLXRpdGxlXCJdLnRleHQoKTtcblxuLy8gJHVpW1wid2luZG93XCJdXG4vLyAkdWlbXCJ0aXRsZVwiXVxuLy8gJHVpW1wiYm9keVwiXVxuLy8gJHVpW1wiYXBwYmFyXCJdXG4vLyAkdWlbXCJsb2FkYmFyXCJdXG4vLyAkdWlbXCJzaWRlbmF2XCJdXG4vLyAkdWlbXCJib3R0b21zaGVldFwiXVxuLy8gJHVpW1widG9hc3RcIl1cbi8vICR1aVtcImJhY2tkcm9wXCJdXG4vLyAkdWlbXCJmb290ZXJcIl1cbi8vICR1aVtcInBhZ2UtdGl0bGVcIl1cblxuLy8gRGFkb3MgZGVmaW5pZG9zOlxuLy8gVUkuZGF0YVtcImNvbHVtbi13aWR0aFwiXVxuXG4vLyBEYWRvcyBjb25zdWx0w6F2ZWlzOlxuLy8gVUkuZGF0YVtcIndpbmRvd1wiXVtcIndpZHRoXCJdXG4vLyBVSS5kYXRhW1wid2luZG93XCJdW1wiaGVpZ2h0XCJdXG4vLyBVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1widG9wXCJdXG4vLyBVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1wiYm90dG9tXCJdXG4vLyBVSS5kYXRhW1wiY29sdW1uc1wiXVxuLy8gVUkuZGF0YVtcImludGVyYWN0aW9uLXR5cGVcIl1cbi8vIFVJLmRhdGFbXCJ0aGVtZS1jb2xvclwiXVtcIm9yaWdpbmFsXCJdXG4vLyBVSS5kYXRhW1widGl0bGVcIl1cbi8vIFVJLmRhdGFbXCJzY3JvbGxiYXItc2l6ZVwiXVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gRnVuw6fDo28gcGFyYSBmb3LDp2FyIHJlZmxvd1xuJC5mbi5yZWZsb3cgPSBmdW5jdGlvbigpIHtcblx0bGV0IG9mZnNldCA9ICR1aVtcImJvZHlcIl0ub2Zmc2V0KCkubGVmdDtcblx0cmV0dXJuICQodGhpcyk7XG59O1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgLyBib2R5IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gVUkuYm9keS5sb2NrKClcbi8vIFVJLmJvZHkudW5sb2NrKClcblxuVUkuYm9keSA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQvLyB1aVtcImJvZHlcIl0gw6kgZGVmaW5pZG8gbm8gZG9jdW1lbnQuanNcblx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwidWktXCIgKyBVSS5kYXRhW1wiaW50ZXJhY3Rpb24tdHlwZVwiXSk7XG5cdFx0c2Nyb2xsU3RhdHVzKCk7XG5cdH0pO1xuXG5cdCR1aVtcIndpbmRvd1wiXS5vbihcInNjcm9sbFwiLCBzY3JvbGxTdGF0dXMpO1xuXG5cdGZ1bmN0aW9uIHNjcm9sbFN0YXR1cygpIHtcblx0XHR2YXIgeSA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblxuXHRcdGlmICh5ID4gMSkge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInNjcm9sbC10b3BcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJzY3JvbGwtdG9wXCIpO1xuXHRcdH1cblxuXHRcdGlmICh5ID4gNTYpIHtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJsaXZlc2l0ZS1ibHVyXCIpLnJlbW92ZUNsYXNzKFwibGl2ZXNpdGUtZm9jdXNcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJsaXZlc2l0ZS1mb2N1c1wiKS5yZW1vdmVDbGFzcyhcImxpdmVzaXRlLWJsdXJcIik7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIFVJLmJvZHkubG9jaygpXG5cdFx0bG9jazogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwibm8tc2Nyb2xsXCIpLmNzcyhcIm1hcmdpbi1yaWdodFwiLCBVSS5kYXRhW1wic2Nyb2xsYmFyLXNpemVcIl0pO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIFVJLmJvZHkudW5sb2NrKClcblx0XHR1bmxvY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcIm5vLXNjcm9sbFwiKS5jc3MoXCJtYXJnaW4tcmlnaHRcIiwgMCk7XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8gbG9hZGJhciAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFVJLmxvYWRiYXIuc2hvdygpXG4vLyBVSS5sb2FkYmFyLmhpZGUoKVxuXG5VSS5sb2FkYmFyID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcImxvYWRiYXJcIl0gPSAkKFwiLnVpLWxvYWRiYXJcIik7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJsb2FkYmFyXCJdLmFkZENsYXNzKFwiaW5cIik7XG5cdFx0fSxcblx0XHRoaWRlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRpbWluZ1tcImhpZGUtbG9hZGJhclwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR1aVtcImxvYWRiYXJcIl1cblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoXCJmYWRlLWluXCIpXG5cdFx0XHRcdFx0Lm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQkdWlbXCJsb2FkYmFyXCJdLnJlbW92ZUNsYXNzKFwiaW5cIik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9LCA4MDApO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvIGJhY2tkcm9wIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBVSS5iYWNrZHJvcC5zaG93KClcbi8vIFVJLmJhY2tkcm9wLmhpZGUoKVxuXG5VSS5iYWNrZHJvcCA9IChmdW5jdGlvbigpIHtcblx0JHVpW1wiYmFja2Ryb3BcIl0gPSBbIF07XG5cblx0JChmdW5jdGlvbigpIHtcblx0XHQvLyAkdWlbXCJiYWNrZHJvcFwiXSA9ICQoXCIuanMtdWktYmFja2Ryb3BcIik7XG5cdFx0Ly8gJHVpW1wiYmFja2Ryb3BcIl0ub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcblx0XHQvLyBcdCR1aVtcImJhY2tkcm9wXCJdLnRyaWdnZXIoXCJoaWRlXCIpO1xuXHRcdC8vIH0pO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdHNob3c6IGZ1bmN0aW9uKCRzY3JlZW4sIGV2ZW50cykge1xuXHRcdFx0dmFyIHNjcmVlbiA9ICRzY3JlZW5bXCJzZWxlY3RvclwiXTtcblx0XHRcdHZhciB6aW5kZXggPSAkc2NyZWVuLmNzcyhcInotaW5kZXhcIikgLSAxO1xuXG5cdFx0XHQkdWlbXCJiYWNrZHJvcFwiXVtzY3JlZW5dID0gX19yZW5kZXIoXCJiYWNrZHJvcFwiKTtcblxuXHRcdFx0JC5lYWNoKGV2ZW50cywgZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcblx0XHRcdFx0JHVpW1wiYmFja2Ryb3BcIl1bc2NyZWVuXS5vbihldmVudCwgaGFuZGxlcilcblx0XHRcdH0pO1xuXG5cdFx0XHQkdWlbXCJiYWNrZHJvcFwiXVtzY3JlZW5dLmNzcyhcInotaW5kZXhcIiwgemluZGV4KVxuXHRcdFx0XHQub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgJCh0aGlzKS50cmlnZ2VyKFwiaGlkZVwiKTsgfSlcblx0XHRcdFx0LmFwcGVuZFRvKCR1aVtcImJvZHlcIl0pXG5cdFx0XHRcdC5hZGRDbGFzcyhcImluXCIpO1xuXHRcdH0sXG5cdFx0aGlkZTogZnVuY3Rpb24oJHNjcmVlbikge1xuXHRcdFx0dmFyIHNjcmVlbiA9ICRzY3JlZW5bXCJzZWxlY3RvclwiXTtcblx0XHRcdCR1aVtcImJhY2tkcm9wXCJdW3NjcmVlbl0ucmVtb3ZlQ2xhc3MoXCJpblwiKS5vZmYoXCJoaWRlXCIpLnJlbW92ZSgpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSBzaWRlbmF2IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblVJLnNpZGVuYXYgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wic2lkZW5hdlwiXSA9ICQoXCIuanMtdWktc2lkZW5hdlwiKTtcblxuXHRcdCQoXCIuanMtc2lkZW5hdi10cmlnZ2VyXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRVSS5zaWRlbmF2Lm9wZW4oKTtcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHRvcGVuOiBmdW5jdGlvbigpIHtcblx0XHRcdFVJLmJvZHkubG9jaygpO1xuXHRcdFx0VUkuYmFja2Ryb3Auc2hvdygkdWlbXCJzaWRlbmF2XCJdLCB7IFwiaGlkZVwiOiBVSS5zaWRlbmF2LmNsb3NlIH0pO1xuXHRcdFx0JHVpW1wic2lkZW5hdlwiXS5hZGRDbGFzcyhcImluXCIpO1xuXHRcdH0sXG5cdFx0Y2xvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wic2lkZW5hdlwiXS5yZW1vdmVDbGFzcyhcImluXCIpO1xuXHRcdFx0VUkuYmFja2Ryb3AuaGlkZSgkdWlbXCJzaWRlbmF2XCJdKTtcblx0XHRcdFVJLmJvZHkudW5sb2NrKCk7XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGJvdHRvbXNoZWV0XG5VSS5ib3R0b21zaGVldCA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblx0XHRvcGVuOiBmdW5jdGlvbigkY29udGVudCwgYWRkQ2xhc3MpIHtcblx0XHRcdFVJLmJhY2tkcm9wLnNob3coJHVpW1wiYm90dG9tc2hlZXRcIl0sIHsgXCJoaWRlXCI6IFVJLmJvdHRvbXNoZWV0LmNsb3NlIH0pO1xuXHRcdFx0JHVpW1wiYm90dG9tc2hlZXRcIl0uaHRtbCgkY29udGVudCkuYWRkQ2xhc3MoKGFkZENsYXNzPyBhZGRDbGFzcyArIFwiIFwiIDogXCJcIikgKyBcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIik7XG5cblx0XHRcdFVJLmRhdGFbXCJ0aGVtZS1jb2xvclwiXVtcImJ1ZmZlclwiXSA9ICR1aVtcInRoZW1lLWNvbG9yXCJdLmF0dHIoXCJjb250ZW50XCIpO1xuXHRcdFx0JHVpW1widGhlbWUtY29sb3JcIl0uYXR0cihcImNvbnRlbnRcIiwgXCIjMDAwXCIpO1xuXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0uYWRkKFwiYm90dG9tc2hlZXRcIik7XG5cdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZSh7IFwidmlld1wiOiBcImJvdHRvbXNoZWV0XCIgfSwgbnVsbCwgbnVsbCk7XG5cdFx0fSxcblx0XHRjbG9zZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJib3R0b21zaGVldFwiXS5yZW1vdmVDbGFzcyhcInNsaWRlXCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR1aVtcImJvdHRvbXNoZWV0XCJdLnJlbW92ZUNsYXNzKFwiaW5cIikuZW1wdHkoKS5hdHRyKFwiY2xhc3NcIiwgXCJ1aS1ib3R0b21zaGVldCBqcy11aS1ib3R0b21zaGVldFwiKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkdWlbXCJ0aGVtZS1jb2xvclwiXS5hdHRyKFwiY29udGVudFwiLCBVSS5kYXRhW1widGhlbWUtY29sb3JcIl1bXCJidWZmZXJcIl0pO1xuXG5cdFx0XHRVSS5iYWNrZHJvcC5oaWRlKCR1aVtcImJvdHRvbXNoZWV0XCJdKTtcblxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLnJlbW92ZShcImJvdHRvbXNoZWV0XCIpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCR1aVtcImJvdHRvbXNoZWV0XCJdID0gJChcIi5qcy11aS1ib3R0b21zaGVldFwiKTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgdG9hc3QgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5VSS50b2FzdCA9IChmdW5jdGlvbigpIHtcblx0JHVpW1widG9hc3RcIl0gPSBbIF07XG5cblx0JChmdW5jdGlvbigpIHtcblx0XHQkdWlbXCJ0b2FzdFwiXSA9ICQoXCIuanMtdWktdG9hc3RcIik7XG5cdFx0JHVpW1widG9hc3RcIl1bXCJtZXNzYWdlXCJdID0gJChcIi50b2FzdC1tZXNzYWdlXCIsICR1aVtcInRvYXN0XCJdKTtcblx0XHQkdWlbXCJ0b2FzdFwiXVtcImxhYmVsXCJdID0gJChcIi50b2FzdC1sYWJlbFwiLCAkdWlbXCJ0b2FzdFwiXSk7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0Ly8gVE9ETyBub3ZhIHNpbnRheGUsIHVzYXIgdGVtcGxhdGUgZSBfX3JlbmRlclxuXHRcdHNob3c6IGZ1bmN0aW9uKGNvbmZpZykge1xuXHRcdFx0Ly8gT3DDp8O1ZXM6XG5cdFx0XHQvLyDigKIgXCJtZXNzYWdlXCIgW3N0cmluZ11cblx0XHRcdC8vIOKAoiBcImxhYmVsXCIgW3N0cmluZ11cblx0XHRcdC8vIOKAoiBcImFjdGlvblwiIFtmdW5jdGlvbl1cblx0XHRcdC8vIOKAoiBcInBlcnNpc3RlbnRcIiBbYm9vbGVhbl1cblx0XHRcdC8vIOKAoiBcInRpbWVvdXRcIiBbaW50ZWdlcl0gZGVmYXVsdDogNjAwMFxuXHRcdFx0Ly8g4oCiIFwic3RhcnQtb25seVwiIFtib29sZWFuXVxuXG5cdFx0XHRpZiAodHlwZW9mIGNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHQkdWlbXCJ0b2FzdFwiXS5yZW1vdmVDbGFzcyhcInN0YXJ0LW9ubHlcIik7XG5cblx0XHRcdFx0Ly8gVGV4dG8gZG8gdG9hc3Rcblx0XHRcdFx0JHVpW1widG9hc3RcIl1bXCJtZXNzYWdlXCJdLmh0bWwoY29uZmlnW1wibWVzc2FnZVwiXSB8fCBcIlwiKTtcblxuXHRcdFx0XHQvLyBUZXh0byBkYSBhw6fDo29cblx0XHRcdFx0Ly8gKFPDsyBtb3N0cmEgZGUgdGV4dG8gZSBhw6fDo28gZXN0aXZlcmVtIGRlZmluaWRvcylcblx0XHRcdFx0aWYgKGNvbmZpZ1tcImxhYmVsXCJdICYmIGNvbmZpZ1tcImFjdGlvblwiXSkge1xuXHRcdFx0XHRcdCR1aVtcInRvYXN0XCJdW1wibGFiZWxcIl1cblx0XHRcdFx0XHRcdC5odG1sKGNvbmZpZ1tcImxhYmVsXCJdKVxuXHRcdFx0XHRcdFx0Lm9mZihcImNsaWNrXCIpXG5cdFx0XHRcdFx0XHQub24oXCJjbGlja1wiLCBjb25maWdbXCJhY3Rpb25cIl0pXG5cdFx0XHRcdFx0XHQuc2hvdygpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCR1aVtcInRvYXN0XCJdW1wibGFiZWxcIl1cblx0XHRcdFx0XHRcdC5oaWRlKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkdWlbXCJ0b2FzdFwiXS5hZGRDbGFzcyhcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIik7XG5cdFx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJ0b2FzdC1hY3RpdmVcIik7XG5cblx0XHRcdFx0Ly8gVE9ETzogLmZhYi1ib3R0b20gdHJhbnNmb3JtOiB0cmFuc2xhdGVZXG5cblx0XHRcdFx0Ly8gQW8gY2xpY2FyIG5vIHRvYXN0LCBmZWNoYSBlbGVcblx0XHRcdFx0JHVpW1widG9hc3RcIl0ub24oXCJjbGlja1wiLCBVSS50b2FzdC5kaXNtaXNzKTtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWluZ1tcInRvYXN0XCJdKTtcblxuXHRcdFx0XHQvLyBTZSBuw6NvIGZvciBwZXJzaXN0ZW50ZSxcblx0XHRcdFx0Ly8gZmVjaGEgZGVwb2lzIGRlIHVtIHRlbXBvIGRldGVybWluYWRvXG5cdFx0XHRcdGlmICghY29uZmlnW1wicGVyc2lzdGVudFwiXSkge1xuXHRcdFx0XHRcdHRpbWluZ1tcInRvYXN0XCJdID0gc2V0VGltZW91dChVSS50b2FzdC5kaXNtaXNzLCAoY29uZmlnW1widGltZW91dFwiXT8gY29uZmlnW1widGltZW91dFwiXSA6IDYwMDApKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFNlIGZvciBwcmEgc2VyIGV4aWJpZG8gc8OzIG5hIHRlbGEgaW5pY2lhbFxuXHRcdFx0XHRpZiAoY29uZmlnW1wic3RhcnQtb25seVwiXSkge1xuXHRcdFx0XHRcdCR1aVtcInRvYXN0XCJdLmFkZENsYXNzKFwic3RhcnQtb25seVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0VUkudG9hc3Quc2hvdyh7XG5cdFx0XHRcdFx0XCJtZXNzYWdlXCI6IGNvbmZpZ1xuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRkaXNtaXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcInRvYXN0XCJdLnJlbW92ZUNsYXNzKFwic2xpZGVcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInRvYXN0LWFjdGl2ZVwiKTtcblx0XHRcdFx0JHVpW1widG9hc3RcIl0ucmVtb3ZlQ2xhc3MoXCJpbiBzdGFydC1vbmx5XCIpO1xuXG5cdFx0XHRcdCR1aVtcInRvYXN0XCJdW1wibWVzc2FnZVwiXS5lbXB0eSgpO1xuXHRcdFx0XHQkdWlbXCJ0b2FzdFwiXVtcImxhYmVsXCJdLmVtcHR5KCk7XG5cdFx0XHR9KTtcblx0XHRcdGNsZWFyVGltZW91dCh0aW1pbmdbXCJ0b2FzdFwiXSk7XG5cdFx0fSxcblxuXHRcdC8vIFRPRE8gREVQUkVDQVRFRFxuXHRcdG9wZW46IGZ1bmN0aW9uKG1lc3NhZ2UsIGFjdGlvbiwgY2FsbGJhY2ssIHBlcnNpc3RlbnQpIHtcblx0XHQvLyBvcGVuOiBmdW5jdGlvbihtZXNzYWdlLCBhZGRDbGFzcykge1xuXHRcdFx0JHVpW1widG9hc3RcIl0ubWVzc2FnZS5odG1sKG1lc3NhZ2UpO1xuXHRcdFx0JHVpW1widG9hc3RcIl0ubGFiZWwuaHRtbCgoYWN0aW9uPyBhY3Rpb24gOiBcIlwiKSk7XG5cdFx0XHQkdWlbXCJ0b2FzdFwiXS5hZGRDbGFzcyhcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIik7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwidG9hc3QtYWN0aXZlXCIpO1xuXG5cdFx0XHQvLyBUT0RPOiAuZmFiLWJvdHRvbSB0cmFuc2Zvcm06IHRyYW5zbGF0ZVlcblxuXHRcdFx0JHVpW1widG9hc3RcIl0ub24oXCJjbGlja1wiLCBVSS50b2FzdC5kaXNtaXNzKTtcblx0XHRcdCR1aVtcInRvYXN0XCJdLmxhYmVsLm9uKFwiY2xpY2tcIiwgY2FsbGJhY2spO1xuXG5cdFx0XHRjbGVhclRpbWVvdXQodGltaW5nW1widG9hc3RcIl0pO1xuXG5cdFx0XHRpZiAoIXBlcnNpc3RlbnQpIHtcblx0XHRcdFx0JHVpW1widG9hc3RcIl0ucmVtb3ZlQ2xhc3MoXCJzdHJlYW0tb25seVwiKTtcblx0XHRcdFx0dGltaW5nW1widG9hc3RcIl0gPSBzZXRUaW1lb3V0KFVJLnRvYXN0LmRpc21pc3MsIDY1MDApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JHVpW1widG9hc3RcIl0uYWRkQ2xhc3MoXCJzdHJlYW0tb25seVwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59KSgpO1xuXG4vLyB2YXIgdG9hc3QgPSBVSS50b2FzdDtcbi8vIHRvYXN0LmNsb3NlID0gVUkudG9hc3QuZGlzbWlzcztcblxuLy8gdmFyIHNuYWNrYmFyID0gdG9hc3Q7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhcGkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFRPRE8gbGVnYWN5IChkZXZlIGZpY2FyIHPDsyBkZW50cm8gZGEgZnVuw6fDo28gYWJhaXhvKVxubGV0IGFwaV9rZXkgPSBcIjA2M2M3MmIyYWZjNTMzM2YzYjI3YjM2NmJkYWM5ZWI4MWQ2NGJjNmExMmNkN2IzZjRiNmFkZTc3YTA5MmI2M2FcIjtcblxuY29uc3QgTGlzdGFBUEkgPSAoZW5kcG9pbnQsIGRhdGEpID0+IHtcblx0bG9nKFwiQVBJIFJlcXVlc3Q6IFwiICsgZW5kcG9pbnQsIFwiaW5mb1wiKTtcblx0bGV0IGFwaV91cmwgPSBcImh0dHBzOi8vYXBpLmxhZ3VpbmhvLm9yZy9saXN0YS9cIiArIGVkaWNhbztcblx0bGV0IGFwaV9rZXkgPSBcIjA2M2M3MmIyYWZjNTMzM2YzYjI3YjM2NmJkYWM5ZWI4MWQ2NGJjNmExMmNkN2IzZjRiNmFkZTc3YTA5MmI2M2FcIjtcblxuXHRsZXQgcmVxdWVzdCA9ICQuZ2V0SlNPTihhcGlfdXJsICsgZW5kcG9pbnQgKyBcIj9rZXk9XCIgKyBhcGlfa2V5ICsgXCImY2FsbGJhY2s9P1wiLCBkYXRhKTtcblx0cmV0dXJuIHJlcXVlc3Q7XG59O1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcGxhY2FyIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5hcHAuUGxhY2FyID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcInBsYWNhclwiXSA9ICQoXCIuanMtYXBwLXBsYWNhciA+IHVsXCIpO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdHVwZGF0ZTogZnVuY3Rpb24odHVybWFzKSB7XG5cdFx0XHQvLyBjb25mZXJlIHF1YWwgYSB0dXJtYSBjb20gbWFpb3IgcG9udHVhw6fDo29cblx0XHRcdC8vIGUgc29tYSBhIHBvbnR1YcOnw6NvIGRlIGNhZGEgdHVybWEgcGFyYSBvYnRlciBvIHRvdGFsIGRlIHBvbnRvc1xuXHRcdFx0dmFyIG1haW9yX3BvbnR1YWNhbyA9IDA7XG5cdFx0XHR2YXIgdG90YWxfZGVfcG9udG9zID0gMDtcblxuXHRcdFx0Zm9yICh2YXIgdHVybWEgaW4gdHVybWFzKSB7XG5cdFx0XHRcdHZhciBwb250dWFjYW9fZGFfdHVybWEgPSB0dXJtYXNbdHVybWFdW1wicG9udG9zXCJdO1xuXG5cdFx0XHRcdGlmIChwb250dWFjYW9fZGFfdHVybWEgPiBtYWlvcl9wb250dWFjYW8pIHtcblx0XHRcdFx0XHRtYWlvcl9wb250dWFjYW8gPSBwb250dWFjYW9fZGFfdHVybWE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0b3RhbF9kZV9wb250b3MgKz0gcG9udHVhY2FvX2RhX3R1cm1hO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBsaW1wYSBvIHBsYWNhclxuXHRcdFx0JHVpW1wicGxhY2FyXCJdLmVtcHR5KCk7XG5cblx0XHRcdC8vIGFkaWNpb25hIGNhZGEgdHVybWEgbm8gcGxhY2FyXG5cdFx0XHQkLmVhY2godHVybWFzLCBmdW5jdGlvbihpbmRleCwgdHVybWEpIHtcblx0XHRcdFx0Ly8gY2FsY3VsYSAlIGRhIHR1cm1hIGVtIHJlbGHDp8OjbyBhbyB0b3RhbCBkZSBwb250b3Ncblx0XHRcdFx0dmFyIHBlcmNlbnR1YWxfZGFfdHVybWEgPSAodG90YWxfZGVfcG9udG9zID4gMD8gdHVybWFbXCJwb250b3NcIl0gLyBtYWlvcl9wb250dWFjYW8gOiAwKTtcblxuXHRcdFx0XHQvLyBmb3JtYXRhIG9zIGRhZG9zXG5cdFx0XHRcdHR1cm1hW1wibGFyZ3VyYS1kYS1iYXJyYVwiXSA9IFwid2lkdGg6IFwiICsgKHBlcmNlbnR1YWxfZGFfdHVybWEgKiAxMDApLnRvRml4ZWQoMykgKyBcIiU7XCI7XG5cdFx0XHRcdHR1cm1hW1widHVybWEtZm9ybWF0YWRhXCJdID0gdHVybWFbXCJ0dXJtYVwiXS50b1VwcGVyQ2FzZSgpO1xuXHRcdFx0XHR0dXJtYVtcInBvbnRvc1wiXSA9IHR1cm1hW1wicG9udG9zXCJdO1xuXHRcdFx0XHR0dXJtYVtcInBvbnR1YWNhby1mb3JtYXRhZGFcIl0gPSB0dXJtYVtcInBvbnRvc1wiXS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLlwiKTtcblxuXHRcdFx0XHQvLyByZW5kZXJpemEgZSBjb2xvY2EgbmEgcMOhZ2luYVxuXHRcdFx0XHR2YXIgJHR1cm1hID0gX19yZW5kZXIoXCJwbGFjYXItdHVybWFcIiwgdHVybWEpO1xuXHRcdFx0XHQkdWlbXCJwbGFjYXJcIl0uYXBwZW5kKCR0dXJtYSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKHRvdGFsX2RlX3BvbnRvcyA9PT0gMCkge1xuXHRcdFx0XHQkdWlbXCJwbGFjYXJcIl0ucGFyZW50KCkuYWRkQ2xhc3MoXCJ6ZXJvZWRcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkdWlbXCJwbGFjYXJcIl0ucGFyZW50KCkucmVtb3ZlQ2xhc3MoXCJ6ZXJvZWRcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBwIGV2b2x1w6fDo28gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhcHAuRXZvbHVjYW8uc3RhcnQoKVxuLy8gYXBwLkV2b2x1Y2FvLnVwZGF0ZSgpXG5cbi8vIFRPRE9cbi8vIC0gbW9zdHJhciBjb250YWRvciBuYXMgw7psdGltYXMgNDggaG9yYXNcbi8vIC0gbyBxdWUgYWNvbnRlY2UgZGVwb2lzIGRvIGVuY2VycmFtZW50bz9cbi8vICAgYmFycmEgZmljYSBkYSBjb3IgZGEgdHVybWEgZSBhcGFyZWNlIG1lbnNhZ2VtIGVtIGNpbWEgXCJFQzEgY2FtcGXDo1wiXG5cbmFwcC5Fdm9sdWNhbyA9IChmdW5jdGlvbigpIHtcblx0bGV0IGR1cmFjYW9fdG90YWw7XG5cblx0JChmdW5jdGlvbigpIHtcblx0XHQkdWlbXCJldm9sdWNhb1wiXSA9ICQoXCIuYXBwLWV2b2x1Y2FvXCIpO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkV2b2x1Y2FvLnN0YXJ0KClcblx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRsb2coXCJhcHAuRXZvbHVjYW8uc3RhcnRcIiwgXCJpbmZvXCIpO1xuXG5cdFx0XHQvLyBQZWdhIGRhdGEgZGUgaW7DrWNpbyBlIGRhdGEgZGUgZW5jZXJyYW1lbnRvXG5cdFx0XHRsZXQgZGlhX2luaWNpYWwgPSBMaXN0YS5FZGljYW9bXCJpbmljaW9cIl0gPSBtb21lbnQoTGlzdGEuRWRpY2FvW1wiaW5pY2lvXCJdKTtcblx0XHRcdGxldCBkaWFfZmluYWwgPSBMaXN0YS5FZGljYW9bXCJmaW1cIl0gPSBtb21lbnQoTGlzdGEuRWRpY2FvW1wiZmltXCJdKTtcblxuXHRcdFx0Ly8gQ2FsY3VsYSBvIHRlbXBvIHRvdGFsIChlbSBtaW51dG9zKVxuXHRcdFx0ZHVyYWNhb190b3RhbCA9IGRpYV9maW5hbC5kaWZmKGRpYV9pbmljaWFsLCBcIm1pbnV0ZXNcIik7XG5cblx0XHRcdC8vIEluc2VyZSBvcyBkaWFzIG5hIGJhcnJhLCBpbmRvIGRlIGRpYSBlbSBkaWEgYXTDqSBjaGVnYXIgYW8gZW5jZXJyYW1lbnRvXG5cdFx0XHRmb3IgKGxldCBkaWEgPSBkaWFfaW5pY2lhbC5jbG9uZSgpOyBkaWEuaXNCZWZvcmUoZGlhX2ZpbmFsKTsgZGlhLmFkZCgxLCBcImRheXNcIikpIHtcblx0XHRcdFx0Ly8gRGVmaW5lIGluw61jaW8gZSBmaW5hbCBkbyBkaWFcblx0XHRcdFx0Ly8gU2UgZmluYWwgZm9yIGFww7NzIGEgZGF0YSBkZSBlbmNlcnJhbWVudG8sIHVzYSBlbGEgY29tbyBmaW5hbFxuXHRcdFx0XHRsZXQgaW5pY2lvX2RvX2RpYSA9IGRpYTtcblx0XHRcdFx0bGV0IGZpbmFsX2RvX2RpYSA9IGRpYS5jbG9uZSgpLmVuZE9mKFwiZGF5XCIpO1xuXHRcdFx0XHRpZiAoZmluYWxfZG9fZGlhLmlzQWZ0ZXIoZGlhX2ZpbmFsKSkge1xuXHRcdFx0XHRcdGZpbmFsX2RvX2RpYSA9IGRpYV9maW5hbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIENhbGN1bGEgYSBkdXJhw6fDo28gZG8gZGlhIGVtIG1pbnV0b3Ncblx0XHRcdFx0bGV0IGR1cmFjYW9fZG9fZGlhID0gZmluYWxfZG9fZGlhLmRpZmYoaW5pY2lvX2RvX2RpYSwgXCJtaW51dGVzXCIpO1xuXG5cdFx0XHRcdC8vIERlZmluZSBhIGR1cmHDp8OjbyBwZXJjZW50dWFsIGRvIGRpYSBlbSByZWxhw6fDo28gYW8gdG90YWxcblx0XHRcdFx0bGV0IHBlcmNlbnR1YWxfZG9fZGlhID0gZHVyYWNhb19kb19kaWEgLyBkdXJhY2FvX3RvdGFsO1xuXG5cdFx0XHRcdC8vIENhbGN1bGEgYSBsYXJndXJhIGRvIGRpYSAoZGUgYWNvcmRvIGNvbSBkdXJhw6fDo28gcGVyY2VudHVhbClcblx0XHRcdFx0Ly8gZSBpbnNlcmUgZGlhIG5hIGJhcnJhIGRlIGV2b2x1w6fDo29cblx0XHRcdFx0bGV0IGxhcmd1cmFfZG9fZGlhID0gKHBlcmNlbnR1YWxfZG9fZGlhICogMTAwKS50b0ZpeGVkKDMpO1xuXHRcdFx0XHRsZXQgJGRpYSA9IF9fcmVuZGVyKFwiZXZvbHVjYW8tZGlhXCIsIHtcblx0XHRcdFx0XHRkaWE6IGRpYS5mb3JtYXQoXCJkZGRcIilcblx0XHRcdFx0fSkuY3NzKFwid2lkdGhcIiwgbGFyZ3VyYV9kb19kaWEgKyBcIiVcIik7XG5cblx0XHRcdFx0JChcIi5kYXktbGFiZWxzXCIsICR1aVtcImV2b2x1Y2FvXCJdKS5hcHBlbmQoJGRpYSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENvbSBvcyBkaWFzIGluc2VyaWRvcyBuYSBiYXJyYSBkZSBldm9sdcOnw6NvLFxuXHRcdFx0Ly8gZGVzZW5oYSBhIGJhcnJhIGRlIHRlbXBvIHRyYW5zY29ycmlkb1xuXHRcdFx0c2V0VGltZW91dChhcHAuRXZvbHVjYW8udXBkYXRlLCAxMDAwKTtcblxuXHRcdFx0Ly8gQXR1YWxpemEgYSBsaW5oYSBkZSBldm9sdcOnw6NvIGEgY2FkYSBYIG1pbnV0b3Ncblx0XHRcdHRpbWluZ1tcImV2b2x1Y2FvXCJdID0gc2V0SW50ZXJ2YWwoYXBwLkV2b2x1Y2FvLnVwZGF0ZSwgNjAgKiAxMDAwKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuRXZvbHVjYW8udXBkYXRlKClcblx0XHR1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9nKFwiYXBwLkV2b2x1Y2FvLnVwZGF0ZVwiLCBcImluZm9cIik7XG5cblx0XHRcdC8vIFBlZ2EgYXMgZGF0YXMgZSBjYWxjdWxhIG8gdGVtcG8gKGVtIG1pbnV0b3MpIGUgcGVyY2VudHVhbCB0cmFuc2NvcnJpZG9zXG5cdFx0XHRsZXQgYWdvcmEgPSBtb21lbnQoKTtcblx0XHRcdGxldCBkaWFfaW5pY2lhbCA9IG1vbWVudChMaXN0YS5FZGljYW9bXCJpbmljaW9cIl0pO1xuXHRcdFx0bGV0IGRpYV9maW5hbCA9IG1vbWVudChMaXN0YS5FZGljYW9bXCJmaW1cIl0pO1xuXG5cdFx0XHRsZXQgdGVtcG9fdHJhbnNjb3JyaWRvID0gYWdvcmEuZGlmZihkaWFfaW5pY2lhbCwgXCJtaW51dGVzXCIpO1xuXHRcdFx0bGV0IHBlcmNlbnR1YWxfdHJhbnNjb3JyaWRvID0gKHRlbXBvX3RyYW5zY29ycmlkbyA8IGR1cmFjYW9fdG90YWwgPyB0ZW1wb190cmFuc2NvcnJpZG8gLyBkdXJhY2FvX3RvdGFsIDogMSk7XG5cblx0XHRcdC8vIERlZmluZSBhIGxhcmd1cmEgZGEgYmFycmEgZGUgZXZvbHXDp8OjbyBjb21wbGV0YSBpZ3VhbCDDoCBsYXJndXJhIGRhIHRlbGFcblx0XHRcdC8vIERlcG9pcywgbW9zdHJhIGFwZW5hcyBvIHBlcmNlbnR1YWwgdHJhbnNjb3JyaWRvXG5cdFx0XHQkKFwiLmVsYXBzZWQtdGltZSAuYmFyXCIsICR1aVtcImV2b2x1Y2FvXCJdKS5jc3MoXCJ3aWR0aFwiLCBVSS5kYXRhW1wid2luZG93XCJdW1wid2lkdGhcIl0pO1xuXG5cdFx0XHRsZXQgbGFyZ3VyYV9kYV9iYXJyYSA9IChwZXJjZW50dWFsX3RyYW5zY29ycmlkbyAqIDEwMCkudG9GaXhlZCgzKTtcblx0XHRcdCQoXCIuZWxhcHNlZC10aW1lXCIsICR1aVtcImV2b2x1Y2FvXCJdKS5jc3MoXCJ3aWR0aFwiLCBsYXJndXJhX2RhX2JhcnJhICsgXCIlXCIpO1xuXHRcdH1cblx0fVxufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGxpc3RhIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5MaXN0YS5sb2FkKClcbi8vIGFwcC5MaXN0YS5sYXlvdXQoKVxuLy8gYXBwLkxpc3RhLnNvcnQoKVxuXG5hcHAuTGlzdGEgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JGFwcFtcImxpc3RhXCJdID0gJChcIi5hcHAtbGlzdGFcIik7XG5cblx0XHQkYXBwW1wibGlzdGFcIl0uaXNvdG9wZSh7XG5cdFx0XHRcIml0ZW1TZWxlY3RvclwiOiBcIi5jYXJkLXRhcmVmYVwiLFxuXHRcdFx0XCJ0cmFuc2l0aW9uRHVyYXRpb25cIjogXCIuOHNcIixcblx0XHRcdFwiZ2V0U29ydERhdGFcIjoge1xuXHRcdFx0XHRcImRhdGVcIjogZnVuY3Rpb24oZWxlbWVudCkge1xuXHRcdFx0XHRcdHJldHVybiAkKGVsZW1lbnQpLmRhdGEoXCJsYXN0LW1vZGlmaWVkXCIpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRcInRhcmVmYVwiOiBmdW5jdGlvbihlbGVtZW50KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlSW50KCQoZWxlbWVudCkuZGF0YShcInRhcmVmYVwiKSwgMTApO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0XCJzb3J0QXNjZW5kaW5nXCI6IHtcblx0XHRcdFx0XCJkYXRlXCI6IGZhbHNlLFxuXHRcdFx0XHRcInRhcmVmYVwiOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0XCJzb3J0QnlcIjogW1wiZGF0ZVwiLCBcInRhcmVmYVwiXSxcblx0XHRcdFwibWFzb25yeVwiOiB7XG5cdFx0XHRcdFwiZ3V0dGVyXCI6IChVSS5kYXRhW1wiY29sdW1uc1wiXSA9PT0gMT8gOCA6IDE2KVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0JGFwcFtcImxpc3RhXCJdLm9uKFwiY2xpY2tcIiwgXCIuY2FyZC10YXJlZmE6bm90KC5mYW50YXNtYSlcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmIChldmVudC53aGljaCA9PT0gMSkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRcdGxldCAkY2FyZCA9ICQodGhpcyk7XG5cdFx0XHRcdGxldCBudW1lcm8gPSAkY2FyZC5kYXRhKFwidGFyZWZhXCIpO1xuXHRcdFx0XHRhcHAuVGFyZWZhLm9wZW4obnVtZXJvLCAkY2FyZCwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEuc3RhcnQoKVxuXHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdGxvZyhcImFwcC5MaXN0YS5zdGFydFwiLCBcImluZm9cIik7XG5cblx0XHRcdC8vIGZheiBhcyBhbHRlcmHDp8O1ZXMgZGUgYWNvcmRvIGNvbSBvIHN0YXR1c1xuXHRcdFx0Ly8gaW5zZXJlIGFzIG1lbnNhZ2Vuc1xuXHRcdFx0YXBwLkxpc3RhLnRhcmVmYXMoKTtcblx0XHRcdGFwcC5MaXN0YS5zdGF0dXMoKTtcblx0XHRcdGFwcC5MaXN0YS5tZXNzYWdlcygpO1xuXG5cdFx0XHQvLyB0aXJhIGEgdGVsYSBkZSBsb2FkaW5nXG5cdFx0XHRVSS5sb2FkYmFyLmhpZGUoKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEuc3RhdHVzKClcblx0XHRzdGF0dXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gc2UgcHJhem8gZGUgcG9zdGFnZW0gZXN0aXZlciBlbmNlcnJhZG8sIGluc2VyZSBjbGFzc2Ugbm8gPGJvZHk+XG5cdFx0XHRpZiAobW9tZW50KCkuaXNBZnRlcihMaXN0YS5FZGljYW9bXCJmaW1cIl0pKSB7XG5cdFx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJwb3N0YWdlbnMtZW5jZXJyYWRhc1wiKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gc2UgYSBlZGnDp8OjbyBlc3RpdmVyIGVuY2VycmFkYSwgaW5zZXJlIGNsYXNzZSBubyA8Ym9keT5cblx0XHRcdC8vIGUgcGFyYSBkZSBhdHVhbGl6YXIgYXV0b21hdGljYW1lbnRlXG5cdFx0XHRpZiAoTGlzdGEuRWRpY2FvW1wiZW5jZXJyYWRhXCJdID09PSB0cnVlKSB7XG5cdFx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJlZGljYW8tZW5jZXJyYWRhXCIpO1xuXHRcdFx0XHRjbGVhckludGVydmFsKHRpbWluZ1tcImF0aXZpZGFkZVwiXSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxpc3RhLm1lc3NhZ2VzKClcblx0XHRtZXNzYWdlczogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBzZSB0aXZlciB0w610dWxvIGVzcGVjaWZpY2FkbywgaW5zZXJlIGVsZVxuXHRcdFx0aWYgKExpc3RhLkVkaWNhb1tcIm1lbnNhZ2VtXCJdW1widGl0dWxvXCJdKSB7XG5cdFx0XHRcdGxldCBwYWdlX3RpdGxlID0gTGlzdGEuRWRpY2FvW1wibWVuc2FnZW1cIl1bXCJ0aXR1bG9cIl07XG5cdFx0XHRcdCR1aVtcInRpdGxlXCJdLmh0bWwocGFnZV90aXRsZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGRlIHRpdmVyIG1lbnNhZ2VtIGRlIHJvZGFww6kgZXNwZWNpZmljYWRhLCBpbnNlcmUgZWxhXG5cdFx0XHRpZiAoTGlzdGEuRWRpY2FvW1wibWVuc2FnZW1cIl1bXCJyb2RhcGVcIl0pIHtcblx0XHRcdFx0bGV0IGNsb3NpbmdfbWVzc2FnZSA9IExpc3RhLkVkaWNhb1tcIm1lbnNhZ2VtXCJdW1wicm9kYXBlXCJdO1xuXHRcdFx0XHQkKFwiLmpzLW1lbnNhZ2VtLWZpbmFsXCIpLmh0bWwoY2xvc2luZ19tZXNzYWdlKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEudGFyZWZhcygpXG5cdFx0dGFyZWZhczogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBtb3N0cmEgbyBsb2FkaW5nIGUgbGltcGEgYSBsaXN0YSBwYXJhIGNvbWXDp2FyIGRvIHplcm9cblx0XHRcdC8vIFVJLmxvYWRpbmcuc2hvdygpO1xuXHRcdFx0JGFwcFtcImxpc3RhXCJdLmVtcHR5KCk7XG5cblx0XHRcdC8vIGluc2VyZSBhcyB0YXJlZmFzXG5cdFx0XHRmb3IgKGxldCB0YXJlZmEgb2YgTGlzdGEuVGFyZWZhcykge1xuXHRcdFx0XHQvLyBJbnNlcmUgbm8gY2FjaGVcblx0XHRcdFx0Y2FjaGVbXCJ0YXJlZmFzXCJdW3RhcmVmYVtcIm51bWVyb1wiXV0gPSB0YXJlZmE7XG5cblx0XHRcdFx0Ly8gQ3JpYSBvIGxpbmsgcGFyYSBhIHRhcmVmYVxuXHRcdFx0XHR0YXJlZmFbXCJ1cmxcIl0gPSByb3V0ZXJbXCJidWlsZC1saW5rXCJdKFwiL3RhcmVmYXMvXCIgKyB0YXJlZmFbXCJudW1lcm9cIl0pO1xuXG5cdFx0XHRcdC8vIFNlIHRpdmVyIGltYWdlbSwgYWp1c3RhIGFzIGRpbWVuc29lc1xuXHRcdFx0XHRpZiAodGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdFx0dGFyZWZhW1wiaW1hZ2VtL3VybFwiXSA9IHRhcmVmYVtcImltYWdlbVwiXVtcInVybFwiXTtcblx0XHRcdFx0XHR0YXJlZmFbXCJpbWFnZW0vYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKHRhcmVmYVtcImltYWdlbVwiXVtcImFzcGVjdG9cIl0gKiAxMDApLnRvRml4ZWQoMikgKyBcIiVcIjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCAkdGFyZWZhID0gX19yZW5kZXIoXCJjYXJkLXRhcmVmYVwiLCB0YXJlZmEpLmRhdGEoe1xuXHRcdFx0XHRcdFwidGFyZWZhXCI6IHRhcmVmYVtcIm51bWVyb1wiXSxcblx0XHRcdFx0XHRcImxhc3QtbW9kaWZpZWRcIjogKHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXT8gbW9tZW50KHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXSkuZm9ybWF0KFwiWFwiKSA6IDApXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIHBvc3RzXG5cdFx0XHRcdGxldCAkZ3JpZCA9ICQoXCIudGFyZWZhLWNvbnRldWRvIC5ncmlkXCIsICR0YXJlZmEpO1xuXG5cdFx0XHRcdGlmICh0YXJlZmFbXCJwb3N0c1wiXSAmJiB0YXJlZmFbXCJwb3N0c1wiXS5sZW5ndGgpIHtcblx0XHRcdFx0XHR2YXIgdG90YWxfcG9zdHMgPSB0YXJlZmFbXCJwb3N0c1wiXS5sZW5ndGg7XG5cdFx0XHRcdFx0Ly8gdmFyIHRvdGFsX21lZGlhID0gdGFyZWZhW1wicG9zdHNcIl0ucmVkdWNlKCh0b3RhbCwgcG9zdCkgPT4gdG90YWwgKyBwb3N0W1wibWlkaWFcIl0ubGVuZ3RoLCAwKTtcblx0XHRcdFx0XHQvLyB2YXIgbWF4X21lZGlhX3RvX3Nob3cgPSAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPCAyPyA5IDogOCk7XG5cdFx0XHRcdFx0dmFyIG1heF9tZWRpYV90b19zaG93ID0gODtcblx0XHRcdFx0XHR2YXIgc2hvd25fbWVkaWFfY291bnQgPSAwO1xuXG5cdFx0XHRcdFx0dmFyIHBvc3RfdHlwZXNfd2l0aF9pbWFnZV9wcmV2aWV3ID0gW1wiaW1hZ2VtXCIsIFwieW91dHViZVwiLCBcInZpbWVvXCIsIFwidmluZVwiLCBcImdpZlwiXTtcblx0XHRcdFx0XHR2YXIgcG9zdF90eXBlc193aXRoX3RleHRfcHJldmlldyA9IFtcInRleHRvXCJdO1xuXG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbF9wb3N0czsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgcG9zdCA9IHRhcmVmYVtcInBvc3RzXCJdW2ldO1xuXG5cdFx0XHRcdFx0XHRpZiAoKHBvc3RbXCJtaWRpYVwiXSB8fCBwb3N0W1widGlwb1wiXSA9PSBcInRleHRvXCIpICYmIChzaG93bl9tZWRpYV9jb3VudCA8IG1heF9tZWRpYV90b19zaG93KSkge1xuXHRcdFx0XHRcdFx0XHRzaG93bl9tZWRpYV9jb3VudCsrO1xuXG5cdFx0XHRcdFx0XHRcdHZhciB0aWxlX3R5cGU7XG5cdFx0XHRcdFx0XHRcdHZhciBtZWRpYSA9IHsgfTtcblxuXHRcdFx0XHRcdFx0XHQvLyBpbWFnZW1cblx0XHRcdFx0XHRcdFx0aWYgKHBvc3RfdHlwZXNfd2l0aF9pbWFnZV9wcmV2aWV3LmluZGV4T2YocG9zdFtcInRpcG9cIl0pID4gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHR0aWxlX3R5cGUgPSBcInRpbGUtaW1hZ2VcIjtcblxuXHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wiY291bnRcIl0gPSBzaG93bl9tZWRpYV9jb3VudDtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInlvdXR1YmVcIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbWVvXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ2aW5lXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJnaWZcIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJwcmV2aWV3XCJdID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJ1wiICsgcG9zdFtcIm1pZGlhXCJdWzBdW1widGh1bWJuYWlsXCJdICsgXCInKTtcIjtcblx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wibW9kaWZpZXJcIl0gPSBcInZpZGVvXCI7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChwb3N0W1wibWlkaWFcIl0gJiYgcG9zdFtcIm1pZGlhXCJdWzBdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcInByZXZpZXdcIl0gPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybCgnXCIgKyBwb3N0W1wibWlkaWFcIl1bMF1bXCJjYW1pbmhvXCJdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cG9zdFtcIm1pZGlhXCJdWzBdW1wiYXJxdWl2b3NcIl1bMF0gKyBcIicpO1wiO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBlbHNlXG5cblx0XHRcdFx0XHRcdFx0Ly8gdGV4dG9cblx0XHRcdFx0XHRcdFx0aWYgKHBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXcuaW5kZXhPZihwb3N0W1widGlwb1wiXSkgPiAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdHRpbGVfdHlwZSA9IFwidGlsZS10ZXh0XCI7XG5cdFx0XHRcdFx0XHRcdFx0bWVkaWEgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcInByZXZpZXdcIjogcG9zdFtcImxlZ2VuZGFcIl0uc3Vic3RyaW5nKDAsIDEyMCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcImNvdW50XCI6IHNob3duX21lZGlhX2NvdW50XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmICgoc2hvd25fbWVkaWFfY291bnQgPT09IG1heF9tZWRpYV90b19zaG93KSAmJiAoKHRvdGFsX3Bvc3RzIC0gc2hvd25fbWVkaWFfY291bnQpID4gMCkpIHtcblx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vZGlmaWVyXCJdID0gXCJtb3JlXCI7XG5cdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJtb3JlXCJdID0gXCIrJnRoaW5zcDtcIiArICh0b3RhbF9wb3N0cyAtIHNob3duX21lZGlhX2NvdW50ICsgMSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR2YXIgJHRpbGUgPSBfX3JlbmRlcih0aWxlX3R5cGUsIG1lZGlhKS5hcHBlbmRUbygkZ3JpZCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gc2UgbsOjbyB0aXZlciBuZW5odW0gcG9zdCwgcmVtb3ZlIG8gZ3JpZFxuXHRcdFx0XHRcdCQoXCIudGFyZWZhLWNvbnRldWRvXCIsICR0YXJlZmEpLnJlbW92ZSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gU2UgZm9yIHByZXZpZXdcblx0XHRcdFx0aWYgKHRhcmVmYVtcInByZXZpZXdcIl0pIHtcblx0XHRcdFx0XHQkdGFyZWZhLmFkZENsYXNzKFwiZmFudGFzbWFcIik7XG5cdFx0XHRcdFx0JChcImFcIiwgJHRhcmVmYSkucmVtb3ZlQXR0cihcImhyZWZcIik7XG5cdFx0XHRcdFx0JChcIi50YXJlZmEtY29ycG9cIiwgJHRhcmVmYSkucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkYXBwW1wibGlzdGFcIl0uYXBwZW5kKCR0YXJlZmEpLmlzb3RvcGUoXCJhcHBlbmRlZFwiLCAkdGFyZWZhKTtcblx0XHRcdH1cblxuXHRcdFx0YXBwLkxpc3RhLmxheW91dCgpO1xuXHRcdFx0YXBwLkxpc3RhLnNvcnQoKExpc3RhLkVkaWNhb1tcImVuY2VycmFkYVwiXT8gXCJ0YXJlZmFcIjogXCJkYXRlXCIpKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEubG9hZCgpXG5cdFx0bG9hZDogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBtb3N0cmEgYSB0ZWxhIGRlIGxvYWRpbmcgZSBsaW1wYSBvIHN0cmVhbVxuXHRcdFx0JHN0cmVhbS5sb2FkaW5nLmFkZENsYXNzKFwiZmFkZS1pbiBpblwiKTtcblxuXHRcdFx0Ly8gY2FycmVnYSBvcyBkYWRvcyBkYSBBUElcblx0XHRcdCQuZ2V0SlNPTihcImh0dHBzOi8vYXBpLmxhZ3VpbmhvLm9yZy9saXN0YS9cIiArIGVkaWNhbyArIFwiL3R1ZG8/a2V5PVwiICsgYXBpX2tleSArIFwiJmNhbGxiYWNrPT9cIikuZG9uZShmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdC8vIFwiRElSRVRPUlwiXG5cdFx0XHRcdC8vIFRPRE8gTyBsb2FkIGRldmUgZmljYXIgc2VwYXJhZG8gZG8gU3RyZWFtICh2ZXIgaXNzdWUgIzcpXG5cdFx0XHRcdExpc3RhLlJlZ3VsYW1lbnRvID0gZGF0YVtcImVkaWNhb1wiXTtcblx0XHRcdFx0TGlzdGEuVGFyZWZhcyA9IGRhdGFbXCJ0YXJlZmFzXCJdO1xuXG5cdFx0XHRcdC8vIFNlIGEgRWRpw6fDo28gZXN0aXZlciBlbmNlcnJhZGEuLi5cblxuXG5cdFx0XHRcdC8vIEZJTSBETyBcIkRJUkVUT1JcIlxuXG5cdFx0XHRcdC8vIExpbXBhIG8gc3RyZWFtIHBhcmEgY29tZcOnYXIgZG8gemVyb1xuXHRcdFx0XHQkc3RyZWFtLmVtcHR5KCk7XG5cblx0XHRcdFx0Ly8gTW9udGEgcGxhY2FyXG5cdFx0XHRcdGFwcC5QbGFjYXIudXBkYXRlKGRhdGFbXCJwbGFjYXJcIl0pO1xuXG5cdFx0XHRcdC8vIEluc2VyZSBvcyBjYXJkcyBkZSB0YXJlZmFzXG5cdFx0XHRcdCQuZWFjaChkYXRhW1widGFyZWZhc1wiXSwgZnVuY3Rpb24oaW5kZXgsIHRhcmVmYSkge1xuXHRcdFx0XHRcdHRhcmVmYXNbdGFyZWZhW1wibnVtZXJvXCJdXSA9IHRhcmVmYTtcblx0XHRcdFx0XHR0YXJlZmFbXCJ1cmxcIl0gPSBcIi90YXJlZmFzL1wiICsgdGFyZWZhW1wibnVtZXJvXCJdO1xuXHRcdFx0XHRcdHRhcmVmYVtcInVybFwiXSA9IHJvdXRlcltcImJ1aWxkLWxpbmtcIl0oXCIvdGFyZWZhcy9cIiArIHRhcmVmYVtcIm51bWVyb1wiXSk7XG5cblx0XHRcdFx0XHRpZiAodGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdFx0XHR0YXJlZmFbXCJpbWFnZW0tdXJsXCJdID0gdGFyZWZhW1wiaW1hZ2VtXCJdW1widXJsXCJdO1xuXHRcdFx0XHRcdFx0dGFyZWZhW1wiaW1hZ2VtLWFzcGVjdG9cIl0gPSBcInBhZGRpbmctdG9wOiBcIiArICh0YXJlZmFbXCJpbWFnZW1cIl1bXCJhc3BlY3RvXCJdICogMTAwKS50b0ZpeGVkKDIpICsgXCIlXCI7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dmFyICRjYXJkID0gX19yZW5kZXIoXCJjYXJkLXRhcmVmYVwiLCB0YXJlZmEpLmRhdGEoe1xuXHRcdFx0XHRcdFx0XHRcInRhcmVmYVwiOiB0YXJlZmFbXCJudW1lcm9cIl0sXG5cdFx0XHRcdFx0XHRcdFwibGFzdC1tb2RpZmllZFwiOiAodGFyZWZhW1widWx0aW1hLXBvc3RhZ2VtXCJdPyBtb21lbnQodGFyZWZhW1widWx0aW1hLXBvc3RhZ2VtXCJdKS5mb3JtYXQoXCJYXCIpIDogMClcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0aWYgKHRhcmVmYVtcInByZXZpZXdcIl0pIHtcblx0XHRcdFx0XHRcdCRjYXJkLmFkZENsYXNzKFwiZmFudGFzbWFcIik7XG5cdFx0XHRcdFx0XHQkKFwiYVwiLCAkY2FyZCkucmVtb3ZlQXR0cihcImhyZWZcIik7XG5cdFx0XHRcdFx0XHQkKFwiLmJvZHlcIiwgJGNhcmQpLnJlbW92ZSgpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghdGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdFx0XHQkKFwiLm1lZGlhXCIsICRjYXJkKS5yZW1vdmUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBwb3N0c1xuXHRcdFx0XHRcdHZhciAkZ3JpZCA9ICQoXCIuZ3JpZFwiLCAkY2FyZCk7XG5cblx0XHRcdFx0XHRpZiAodGFyZWZhW1wicG9zdHNcIl0gJiYgdGFyZWZhW1wicG9zdHNcIl0ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHR2YXIgdG90YWxfcG9zdHMgPSB0YXJlZmFbXCJwb3N0c1wiXS5sZW5ndGg7XG5cdFx0XHRcdFx0XHQvLyB2YXIgdG90YWxfbWVkaWEgPSB0YXJlZmFbXCJwb3N0c1wiXS5yZWR1Y2UoKHRvdGFsLCBwb3N0KSA9PiB0b3RhbCArIHBvc3RbXCJtaWRpYVwiXS5sZW5ndGgsIDApO1xuXHRcdFx0XHRcdFx0dmFyIG1heF9tZWRpYV90b19zaG93ID0gKFVJLmRhdGFbXCJjb2x1bW5zXCJdIDwgMj8gOSA6IDgpO1xuXHRcdFx0XHRcdFx0dmFyIHNob3duX21lZGlhX2NvdW50ID0gMDtcblxuXHRcdFx0XHRcdFx0dmFyIHBvc3RfdHlwZXNfd2l0aF9pbWFnZV9wcmV2aWV3ID0gW1wiaW1hZ2VtXCIsIFwieW91dHViZVwiLCBcInZpbWVvXCIsIFwidmluZVwiLCBcImdpZlwiXTtcblx0XHRcdFx0XHRcdHZhciBwb3N0X3R5cGVzX3dpdGhfdGV4dF9wcmV2aWV3ID0gW1widGV4dG9cIl07XG5cblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxfcG9zdHM7IGkrKykge1xuXHRcdFx0XHRcdFx0XHR2YXIgcG9zdCA9IHRhcmVmYVtcInBvc3RzXCJdW2ldO1xuXG5cdFx0XHRcdFx0XHRcdGlmICgocG9zdFtcIm1pZGlhXCJdIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidGV4dG9cIikgJiYgKHNob3duX21lZGlhX2NvdW50IDwgbWF4X21lZGlhX3RvX3Nob3cpKSB7XG5cdFx0XHRcdFx0XHRcdFx0c2hvd25fbWVkaWFfY291bnQrKztcblxuXHRcdFx0XHRcdFx0XHRcdHZhciB0aWxlX3R5cGU7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIG1lZGlhID0geyB9O1xuXG5cdFx0XHRcdFx0XHRcdFx0Ly8gaW1hZ2VtXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHBvc3RfdHlwZXNfd2l0aF9pbWFnZV9wcmV2aWV3LmluZGV4T2YocG9zdFtcInRpcG9cIl0pID4gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRpbGVfdHlwZSA9IFwidGlsZS1pbWFnZVwiO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcImNvdW50XCJdID0gc2hvd25fbWVkaWFfY291bnQ7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInlvdXR1YmVcIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbWVvXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ2aW5lXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJnaWZcIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcInByZXZpZXdcIl0gPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybCgnXCIgKyBwb3N0W1wibWlkaWFcIl1bMF1bXCJ0aHVtYm5haWxcIl0gKyBcIicpO1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vZGlmaWVyXCJdID0gXCJ2aWRlb1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChwb3N0W1wibWlkaWFcIl0gJiYgcG9zdFtcIm1pZGlhXCJdWzBdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wicHJldmlld1wiXSA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCdcIiArIHBvc3RbXCJtaWRpYVwiXVswXVtcImNhbWluaG9cIl0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBvc3RbXCJtaWRpYVwiXVswXVtcImFycXVpdm9zXCJdWzBdICsgXCInKTtcIjtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9IGVsc2VcblxuXHRcdFx0XHRcdFx0XHRcdC8vIHRleHRvXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXcuaW5kZXhPZihwb3N0W1widGlwb1wiXSkgPiAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGlsZV90eXBlID0gXCJ0aWxlLXRleHRcIjtcblx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcInByZXZpZXdcIjogcG9zdFtcImxlZ2VuZGFcIl0uc3Vic3RyaW5nKDAsIDEyMCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFwiY291bnRcIjogc2hvd25fbWVkaWFfY291bnRcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKChzaG93bl9tZWRpYV9jb3VudCA9PT0gbWF4X21lZGlhX3RvX3Nob3cpICYmICgodG90YWxfcG9zdHMgLSBzaG93bl9tZWRpYV9jb3VudCkgPiAwKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJtb2RpZmllclwiXSA9IFwibW9yZVwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJtb3JlXCJdID0gXCIrJnRoaW5zcDtcIiArICh0b3RhbF9wb3N0cyAtIHNob3duX21lZGlhX2NvdW50ICsgMSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0dmFyICR0aWxlID0gX19yZW5kZXIodGlsZV90eXBlLCBtZWRpYSkuYXBwZW5kVG8oJGdyaWQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gc2UgbsOjbyB0aXZlciBuZW5odW0gcG9zdCwgcmVtb3ZlIG8gZ3JpZFxuXHRcdFx0XHRcdFx0JGdyaWQucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gYXR1YWxpemEgbyBpc290b3BlXG5cdFx0XHRcdFx0JHN0cmVhbS5hcHBlbmQoJGNhcmQpLmlzb3RvcGUoXCJhcHBlbmRlZFwiLCAkY2FyZCk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIFNlIGEgRWRpw6fDo28gZXN0aXZlciBlbmNlcnJhZGEsIG9yZGVuYSBwb3IgbsO6bWVybyBkYSB0YXJlZmEuXG5cdFx0XHRcdC8vIFNlIG7Do28sIG9yZGVuYSBwb3Igb3JkZW0gZGUgYXR1YWxpemHDp8Ojb1xuXHRcdFx0XHRhcHAuTGlzdGEubGF5b3V0KCk7XG5cdFx0XHRcdGFwcC5MaXN0YS5zb3J0KChMaXN0YS5FZGljYW9bXCJlbmNlcnJhZGFcIl0/IFwidGFyZWZhXCI6IFwiZGF0ZVwiKSk7XG5cblx0XHRcdFx0Ly8gc2UgdGl2ZXIgdGFyZWZhIGVzcGVjaWZpY2FkYSBubyBsb2FkIGRhIHDDoWdpbmEsIGNhcnJlZ2EgZWxhXG5cdFx0XHRcdGlmIChyb3V0ZXJbXCJwYXRoXCJdWzJdKSB7XG5cdFx0XHRcdFx0YXBwLlRhcmVmYS5vcGVuKHJvdXRlcltcInBhdGhcIl1bMl0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gZXNjb25kZSBhIHRlbGEgZGUgbG9hZGluZ1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdCRzdHJlYW0ubG9hZGluZ1xuXHRcdFx0XHRcdFx0LnJlbW92ZUNsYXNzKFwiZmFkZS1pblwiKVxuXHRcdFx0XHRcdFx0Lm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7ICRzdHJlYW0ubG9hZGluZy5yZW1vdmVDbGFzcyhcImluXCIpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9LCAxMjAwKTtcblxuXHRcdFx0XHQvLyBndWFyZGEgYSBkYXRhIGRhIMO6bHRpbWEgYXR1YWxpemHDp8OjbyBlIHplcmEgbyBjb250YWRvciBkZSBub3ZpZGFkZXNcblx0XHRcdFx0bGFzdF91cGRhdGVkID0gbW9tZW50KGRhdGFbXCJlZGljYW9cIl1bXCJ1bHRpbWEtYXR1YWxpemFjYW9cIl0pO1xuXHRcdFx0XHR1cGRhdGVkW1widGFyZWZhc1wiXSA9IDA7XG5cdFx0XHRcdHVwZGF0ZWRbXCJwb3N0c1wiXSA9IDA7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEubGF5b3V0KClcblx0XHRsYXlvdXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JGFwcFtcImxpc3RhXCJdLmlzb3RvcGUoXCJyZWxvYWRJdGVtc1wiKTtcblx0XHRcdCRhcHBbXCJsaXN0YVwiXS5pc290b3BlKFwibGF5b3V0XCIpO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5MaXN0YS5zb3J0KClcblx0XHRzb3J0OiBmdW5jdGlvbihjcml0ZXJpYSkge1xuXHRcdFx0JGFwcFtcImxpc3RhXCJdLmlzb3RvcGUoe1xuXHRcdFx0XHRcInNvcnRCeVwiOiBjcml0ZXJpYVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufSkoKTtcblxuLy8galF1ZXJ5XG52YXIgJHN0cmVhbTtcblxuJChmdW5jdGlvbigpIHtcblx0JHN0cmVhbSA9ICQoXCIuanMtYXBwLWxpc3RhXCIpO1xuXHQvLyAkc3RyZWFtLmxvYWRpbmcgPSAkKFwibWFpbiAubG9hZGluZ1wiKTtcblxuXHQkc3RyZWFtLmlzb3RvcGUoe1xuXHRcdFwiaXRlbVNlbGVjdG9yXCI6IFwiLmNhcmQtdGFyZWZhXCIsXG5cdFx0XCJ0cmFuc2l0aW9uRHVyYXRpb25cIjogXCIuOHNcIixcblx0XHRcImdldFNvcnREYXRhXCI6IHtcblx0XHRcdFwiZGF0ZVwiOiBcIi5sYXN0LW1vZGlmaWVkXCIsXG5cdFx0XHRcInRhcmVmYVwiOiBmdW5jdGlvbihlbGVtZW50KSB7XG5cdFx0XHRcdHJldHVybiBwYXJzZUludCgkKGVsZW1lbnQpLmRhdGEoXCJ0YXJlZmFcIiksIDEwKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdFwic29ydEFzY2VuZGluZ1wiOiB7XG5cdFx0XHRcImRhdGVcIjogZmFsc2UsXG5cdFx0XHRcInRhcmVmYVwiOiB0cnVlXG5cdFx0fSxcblx0XHRcInNvcnRCeVwiOiBbXCJkYXRlXCIsIFwidGFyZWZhXCJdLFxuXHRcdFwibWFzb25yeVwiOiB7XG5cdFx0XHRcImd1dHRlclwiOiAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPT09IDE/IDggOiAxNilcblx0XHR9XG5cdH0pO1xuXG5cdC8vICRzdHJlYW0ub24oXCJjbGlja1wiLCBcIi5jYXJkLXRhcmVmYTpub3QoLmZhbnRhc21hKVwiLCBmdW5jdGlvbihldmVudCkge1xuXHQvLyBcdGlmIChldmVudC53aGljaCA9PT0gMSkge1xuXHQvLyBcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0Ly9cblx0Ly8gXHRcdHZhciBudW1lcm8gPSAkKHRoaXMpLmRhdGEoXCJ0YXJlZmFcIik7XG5cdC8vIFx0XHRhcHAuVGFyZWZhLm9wZW4obnVtZXJvLCB0cnVlKTtcblx0Ly8gXHR9XG5cdC8vIH0pO1xuXG5cdC8vIGFwcC5MaXN0YS5sb2FkKCk7XG5cblx0Ly8gb3JkZW5hw6fDo29cblx0JHVpW1wic2lkZW5hdlwiXS5vbihcImNsaWNrXCIsIFwiLmpzLXN0cmVhbS1zb3J0IGFcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0dmFyIGNyaXRlcmlhID0gJCh0aGlzKS5kYXRhKFwic29ydC1ieVwiKTtcblx0XHQkKFwiLmpzLXN0cmVhbS1zb3J0IGFcIiwgJHVpW1wic2lkZW5hdlwiXSkucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG5cdFx0JCh0aGlzKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcblxuXHRcdGFwcC5MaXN0YS5zb3J0KGNyaXRlcmlhKTtcblx0XHRVSS5zaWRlbmF2LmNsb3NlKCk7XG5cdH0pO1xufSk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB0YXJlZmEgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhcHAuVGFyZWZhLm9wZW4oKVxuLy8gYXBwLlRhcmVmYS5yZW5kZXIoKVxuLy8gYXBwLlRhcmVmYS5jbG9zZSgpXG5cbmFwcC5UYXJlZmEgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JGFwcFtcInRhcmVmYVwiXSA9ICQoXCIuYXBwLXRhcmVmYVwiKTtcblx0XHQkYXBwW1widGFyZWZhXCJdLm9uKFwiY2xpY2tcIiwgXCIuanMtdGFyZWZhLWNsb3NlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0YXBwLlRhcmVmYS5jbG9zZSh0cnVlKTtcblx0XHR9KS5vbihcImNsaWNrXCIsIFwiLmpzLW5ldy1wb3N0LXRyaWdnZXJcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRVSS5ib3R0b21zaGVldC5vcGVuKCQoXCIubmV3LXBvc3Qtc2hlZXRcIiwgJGFwcFtcInRhcmVmYVwiXSkuY2xvbmUoKS5zaG93KCkpO1xuXHRcdH0pLm9uKFwiY2xpY2tcIiwgXCIuY2FyZC10YXJlZmEgYVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0aWYgKGV2ZW50LndoaWNoID09PSAxKSB7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGxldCBwbGFjYXJfZGFfdGFyZWZhID0gWyBdO1xuXG5cdGZ1bmN0aW9uIHJlbmRlclBvc3RzKHBvc3RzLCAkcG9zdHMpIHtcblx0XHRwbGFjYXJfZGFfdGFyZWZhW1widG90YWxcIl0gPSAwO1xuXHRcdGZvciAodmFyIHR1cm1hIGluIExpc3RhLkVkaWNhb1tcInR1cm1hc1wiXSkge1xuXHRcdFx0cGxhY2FyX2RhX3RhcmVmYVtMaXN0YS5FZGljYW9bXCJ0dXJtYXNcIl1bdHVybWFdXSA9IDA7XG5cdFx0fVxuXG5cdFx0JC5lYWNoKHBvc3RzLCBmdW5jdGlvbihpbmRleCwgcG9zdCkge1xuXHRcdFx0cG9zdFtcInR1cm1hLWJhY2tncm91bmRcIl0gPSBwb3N0W1widHVybWFcIl0gKyBcIi1saWdodC1iYWNrZ3JvdW5kXCI7XG5cdFx0XHRwb3N0W1wiZGF0YS1kZS1wb3N0YWdlbS1mb3JtYXRhZGFcIl0gPSBtb21lbnQocG9zdFtcImRhdGEtZGUtcG9zdGFnZW1cIl0pLmNhbGVuZGFyKCk7XG5cdFx0XHRwb3N0W1widHVybWEtZm9ybWF0YWRhXCJdID0gcG9zdFtcInR1cm1hXCJdLnRvVXBwZXJDYXNlKCk7XG5cblx0XHRcdC8vIGxlZ2VuZGFcblx0XHRcdGlmIChwb3N0W1wibGVnZW5kYVwiXSAmJiBwb3N0W1wibGVnZW5kYVwiXS5zdWJzdHJpbmcoMCwzKSAhPT0gXCI8cD5cIikge1xuXHRcdFx0XHRwb3N0W1wibGVnZW5kYVwiXSA9IFwiPHA+XCIgKyBwb3N0W1wibGVnZW5kYVwiXS5yZXBsYWNlKC8oPzpcXHJcXG5cXHJcXG58XFxyXFxyfFxcblxcbikvZywgXCI8L3A+PHA+XCIpICsgXCI8L3A+XCI7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGF2YWxpYcOnw6NvXG5cdFx0XHRpZiAocG9zdFtcImF2YWxpYWNhb1wiXSkge1xuXHRcdFx0XHRwb3N0W1wiYXZhbGlhY2FvL21lbnNhZ2VtXCJdID0gcG9zdFtcImF2YWxpYWNhb1wiXVtcIm1lbnNhZ2VtXCJdO1xuXG5cdFx0XHRcdGlmIChwb3N0W1wiYXZhbGlhY2FvXCJdW1wic3RhdHVzXCJdID09PSAyMDApIHtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzLWNsYXNzXCJdID0gcG9zdFtcInR1cm1hXCJdO1xuXHRcdFx0XHRcdHBvc3RbXCJzdGF0dXMtaWNvblwiXSA9IFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj4mI3hFODdEOzwvaT5cIjsgLy8gY29yYcOnw6NvXG5cdFx0XHRcdFx0cG9zdFtcImF2YWxpYWNhby9zdGF0dXNcIl0gPSBwb3N0W1wiYXZhbGlhY2FvXCJdW1wicG9udG9zXCJdICsgXCIgcG9udG9cIiArIChwb3N0W1wiYXZhbGlhY2FvXCJdW1wicG9udG9zXCJdID4gMT8gXCJzXCI6IFwiXCIpO1xuXHRcdFx0XHRcdHBvc3RbXCJhdmFsaWFjYW8vY2xhc3NcIl0gPSBcInR1cm1hLXRleHRcIjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzLWNsYXNzXCJdID0gXCJyZWplY3RlZFwiO1xuXHRcdFx0XHRcdHBvc3RbXCJzdGF0dXMtaWNvblwiXSA9IFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj4mI3hFODg4OzwvaT5cIjtcblx0XHRcdFx0XHRwb3N0W1wiYXZhbGlhY2FvL3N0YXR1c1wiXSA9IFwiUmVwcm92YWRvXCI7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBzb21hIHBvbnRvcyBubyBwbGFjYXJcblx0XHRcdFx0cGxhY2FyX2RhX3RhcmVmYVtcInRvdGFsXCJdICs9IHBvc3RbXCJhdmFsaWFjYW9cIl1bXCJwb250b3NcIl07XG5cdFx0XHRcdHBsYWNhcl9kYV90YXJlZmFbcG9zdFtcInR1cm1hXCJdXSArPSBwb3N0W1wiYXZhbGlhY2FvXCJdW1wicG9udG9zXCJdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cG9zdFtcInN0YXR1cy1pY29uXCJdID0gXCI8aSBjbGFzcz1cXFwibWF0ZXJpYWwtaWNvbnNcXFwiPiYjeEU4QjU7PC9pPlwiOyAvLyByZWzDs2dpb1xuXHRcdFx0XHRwb3N0W1wiYXZhbGlhY2FvL3N0YXR1c1wiXSA9IFwiQWd1YXJkYW5kbyBhdmFsaWHDp8Ojb1wiO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyByZW5kZXJpemEgbyBwb3N0XG5cdFx0XHRsZXQgJGNvbnRlbnRfY2FyZCA9IF9fcmVuZGVyKFwiY29udGVudC1jYXJkXCIsIHBvc3QpO1xuXHRcdFx0bGV0ICRtZWRpYSA9ICQoXCIuY29udGVudC1tZWRpYSA+IHVsXCIsICRjb250ZW50X2NhcmQpO1xuXG5cdFx0XHQvLyBhZGljaW9uYSBtw61kaWFzXG5cdFx0XHRpZiAocG9zdFtcIm1pZGlhXCJdKSB7XG5cdFx0XHRcdCQuZWFjaChwb3N0W1wibWlkaWFcIl0sIGZ1bmN0aW9uKGluZGV4LCBtZWRpYSkge1xuXHRcdFx0XHRcdC8vIGltYWdlbVxuXHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcImltYWdlbVwiKSB7XG5cdFx0XHRcdFx0XHRtZWRpYVtcImRlZmF1bHRcIl0gPSBtZWRpYVtcImNhbWluaG9cIl0gKyBtZWRpYVtcImFycXVpdm9zXCJdWzFdO1xuXHRcdFx0XHRcdFx0bWVkaWFbXCJwYWRkaW5nLWFzcGVjdG9cIl0gPSBcInBhZGRpbmctdG9wOiBcIiArIChtZWRpYVtcImFzcGVjdG9cIl0gKiAxMDApLnRvRml4ZWQoMikgKyBcIiVcIjtcblx0XHRcdFx0XHRcdG1lZGlhW1wibGluay1vcmlnaW5hbFwiXSA9IG1lZGlhW1wiY2FtaW5ob1wiXSArIG1lZGlhW1wiYXJxdWl2b3NcIl1bMl07XG5cdFx0XHRcdFx0XHR2YXIgJGltYWdlID0gX19yZW5kZXIoXCJtZWRpYS1waG90b1wiLCBtZWRpYSk7XG5cdFx0XHRcdFx0XHQkbWVkaWEuYXBwZW5kKCRpbWFnZSk7XG5cdFx0XHRcdFx0fSBlbHNlXG5cblx0XHRcdFx0XHQvLyBlbWJlZFxuXHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInlvdXR1YmVcIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbWVvXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ2aW5lXCIpIHtcblx0XHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInlvdXR1YmVcIikge1xuXHRcdFx0XHRcdFx0XHRtZWRpYVtcImVtYmVkXCJdID0gXCJodHRwczovL3d3dy55b3V0dWJlLmNvbS9lbWJlZC9cIiArIG1lZGlhW1wieW91dHViZS1pZFwiXSArIFwiP3JlbD0wJmFtcDtzaG93aW5mbz0wXCI7XG5cdFx0XHRcdFx0XHR9IGVsc2VcblxuXHRcdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwidmltZW9cIikge1xuXHRcdFx0XHRcdFx0XHRtZWRpYVtcImVtYmVkXCJdID0gXCJodHRwczovL3BsYXllci52aW1lby5jb20vdmlkZW8vXCIgKyBtZWRpYVtcInZpbWVvLWlkXCJdICsgXCI/dGl0bGU9MCZieWxpbmU9MCZwb3J0cmFpdD0wXCI7XG5cdFx0XHRcdFx0XHR9IGVsc2VcblxuXHRcdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwidmluZVwiKSB7XG5cdFx0XHRcdFx0XHRcdG1lZGlhW1wiZW1iZWRcIl0gPSBcImh0dHBzOi8vdmluZS5jby92L1wiICsgbWVkaWFbXCJ2aW5lLWlkXCJdICsgXCIvZW1iZWQvc2ltcGxlXCI7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdG1lZGlhW1wicGFkZGluZy1hc3BlY3RvXCJdID0gXCJwYWRkaW5nLXRvcDogXCIgKyAobWVkaWFbXCJhc3BlY3RvXCJdICogMTAwKS50b0ZpeGVkKDIpICsgXCIlXCI7XG5cdFx0XHRcdFx0XHR2YXIgJGVtYmVkID0gX19yZW5kZXIoXCJtZWRpYS12aWRlb1wiLCBtZWRpYSk7XG5cdFx0XHRcdFx0XHQkbWVkaWEuYXBwZW5kKCRlbWJlZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gdGlyYSBsZWdlbmRhIHNlIG7Do28gdGl2ZXJcblx0XHRcdGlmICghcG9zdFtcImxlZ2VuZGFcIl0pIHtcblx0XHRcdFx0JGNvbnRlbnRfY2FyZC5hZGRDbGFzcyhcIm5vLWNhcHRpb25cIik7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghcG9zdFtcIm1pZGlhXCJdKSB7XG5cdFx0XHRcdCRjb250ZW50X2NhcmQuYWRkQ2xhc3MoXCJuby1tZWRpYVwiKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gdGlyYSBtZW5zYWdlbSBkZSBhdmFsaWHDp8OjbyBzZSBuw6NvIHRpdmVyXG5cdFx0XHRpZiAoIXBvc3RbXCJhdmFsaWFjYW9cIl0gfHwgIXBvc3RbXCJtZW5zYWdlbVwiXSkge1xuXHRcdFx0XHQkKFwiLnJlc3VsdCAubWVzc2FnZVwiLCAkY29udGVudF9jYXJkKS5yZW1vdmUoKTtcblx0XHRcdH1cblxuXG5cdFx0XHQvLyBhZGljaW9uYSBvIHBvc3Qgw6AgdGFyZWZhXG5cdFx0XHQvLyAkcG9zdHMuYXBwZW5kKCRjb250ZW50X2NhcmQpLmlzb3RvcGUoXCJhcHBlbmRlZFwiLCAkY29udGVudF9jYXJkKTtcblx0XHRcdCRwb3N0cy5hcHBlbmQoJGNvbnRlbnRfY2FyZCk7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuVGFyZWZhLm9wZW4oKVxuXHRcdG9wZW46IGZ1bmN0aW9uKG51bWVybywgJGNhcmQsIHB1c2hTdGF0ZSkge1xuXHRcdFx0Ly8gY29uc29sZS5sb2coJGNhcmRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuXG5cdFx0XHRsZXQgdGFyZWZhID0gY2FjaGVbXCJ0YXJlZmFzXCJdW251bWVyb107XG5cdFx0XHR0YXJlZmFfYWN0aXZlID0gbnVtZXJvO1xuXG5cdFx0XHQvLyBpZiAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPj0gMykge1xuXHRcdFx0Ly8gXHQvLyBVSS5iYWNrZHJvcC5zaG93KCRhcHBbXCJ0YXJlZmFcIl0sIHsgXCJoaWRlXCI6IGFwcC5UYXJlZmEuY2xvc2UgfSk7XG5cdFx0XHQvLyBcdC8vICR1aVtcImJhY2tkcm9wXCJdWyRhcHBbXCJ0YXJlZmFcIl1dLm9uKFwiaGlkZVwiLCBhcHAuVGFyZWZhLmNsb3NlKTtcblx0XHRcdC8vIH1cblxuXHRcdFx0JGFwcFtcInRhcmVmYVwiXS5hZGRDbGFzcyhcImluXCIpO1xuXHRcdFx0YXBwLlRhcmVmYS5yZW5kZXIodGFyZWZhKTtcblxuXHRcdFx0JGFwcFtcInRhcmVmYVwiXS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlLXhcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Ly8gdmFyIHZpZXdfdGhlbWVfY29sb3IgPSAkKFwiLmFwcGJhclwiLCAkYXBwW1widGFyZWZhXCJdKS5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIpO1xuXHRcdFx0XHQvLyAkKFwiaGVhZCBtZXRhW25hbWU9J3RoZW1lLWNvbG9yJ11cIikuYXR0cihcImNvbnRlbnRcIiwgXCIjNTQ2ZTdhXCIpO1xuXHRcdFx0fSk7XG5cblx0XHRcdFVJLmJvZHkubG9jaygpO1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInRhcmVmYS1hY3RpdmVcIik7XG5cblx0XHRcdC8vIHJvdXRlclxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLnJlcGxhY2UoXCJ0YXJlZmFcIik7XG5cdFx0XHRpZiAocHVzaFN0YXRlKSB7XG5cdFx0XHRcdHJvdXRlci5nbyhcIi90YXJlZmFzL1wiICsgdGFyZWZhW1wibnVtZXJvXCJdLCB7XG5cdFx0XHRcdFx0XCJ2aWV3XCI6IFwidGFyZWZhXCIsXG5cdFx0XHRcdFx0XCJpZFwiOiB0YXJlZmFbXCJudW1lcm9cIl1cblx0XHRcdFx0fSwgdGFyZWZhW1widGl0dWxvXCJdKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gYW5hbHl0aWNzXG5cdFx0XHRhbmFseXRpY3MoXCJUYXJlZmFcIiwgXCJWaXN1YWxpemHDp8Ojb1wiLCBudW1lcm8pO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5UYXJlZmEucmVuZGVyKCkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHRyZW5kZXI6IGZ1bmN0aW9uKHRhcmVmYSkge1xuXHRcdFx0dmFyICR0YXJlZmEgPSBfX3JlbmRlcihcInZpZXctdGFyZWZhXCIsIHRhcmVmYSk7XG5cblx0XHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHRcdC8vIGNhcmQgZGEgdGFyZWZhXG5cdFx0XHRpZiAodGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdHRhcmVmYVtcImltYWdlbVwiXVtcImFzcGVjdG9cIl0gPSBcInBhZGRpbmctdG9wOiBcIiArICh0YXJlZmFbXCJpbWFnZW1cIl1bXCJhc3BlY3RvXCJdICogMTAwKS50b0ZpeGVkKDIpICsgXCIlXCI7XG5cdFx0XHR9XG5cblx0XHRcdHZhciAkdGFyZWZhX2NhcmQgPSBfX3JlbmRlcihcImNhcmQtdGFyZWZhXCIsIHRhcmVmYSk7XG5cblx0XHRcdGlmICghdGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdCQoXCIubWVkaWFcIiwgJHRhcmVmYV9jYXJkKS5yZW1vdmUoKTtcblx0XHRcdH1cblx0XHRcdCQoXCIuZ3JpZFwiLCAkdGFyZWZhX2NhcmQpLnJlbW92ZSgpO1xuXHRcdFx0JChcImFcIiwgJHRhcmVmYV9jYXJkKS5yZW1vdmVBdHRyKFwiaHJlZlwiKTtcblxuXHRcdFx0JChcIi50YXJlZmEtbWV0YSAudGFyZWZhLXRleHRvXCIsICR0YXJlZmEpLmFwcGVuZCgkdGFyZWZhX2NhcmQpO1xuXG5cdFx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0XHQvLyBjb250ZW50XG5cdFx0XHRsZXQgJHBvc3RzID0gJChcIi50YXJlZmEtY29udGVudCA+IHVsXCIsICR0YXJlZmEpO1xuXG5cdFx0XHRpZiAodGFyZWZhW1wicG9zdHNcIl0ubGVuZ3RoKSB7XG5cdFx0XHRcdHJlbmRlclBvc3RzKHRhcmVmYVtcInBvc3RzXCJdLCAkcG9zdHMpO1xuXG5cdFx0XHRcdCRwb3N0cy5pc290b3BlKHtcblx0XHRcdFx0XHRcIml0ZW1TZWxlY3RvclwiOiBcIi5jb250ZW50LWNhcmRcIixcblx0XHRcdFx0XHRcInRyYW5zaXRpb25EdXJhdGlvblwiOiAwLFxuXHRcdFx0XHRcdFwibWFzb25yeVwiOiB7XG5cdFx0XHRcdFx0XHRcImlzRml0V2lkdGhcIjogdHJ1ZSxcblx0XHRcdFx0XHRcdFwiZ3V0dGVyXCI6IChVSS5kYXRhW1wiY29sdW1uc1wiXSA9PT0gMT8gOCA6IDI0KVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0Ly8gfSkub24oXCJsYXlvdXRDb21wbGV0ZVwiLCBmdW5jdGlvbihldmVudCwgcG9zdHMpIHtcblx0XHRcdFx0Ly8gXHR2YXIgcHJldmlvdXNfcG9zaXRpb247XG5cdFx0XHRcdC8vXG5cdFx0XHRcdC8vIFx0Zm9yICh2YXIgcG9zdCBpbiBwb3N0cykge1xuXHRcdFx0XHQvLyBcdFx0dmFyICR0aGlzID0gJChwb3N0c1twb3N0XS5lbGVtZW50KTtcblx0XHRcdFx0Ly8gXHRcdHZhciBvZmZzZXQgPSBwb3N0c1twb3N0XS5wb3NpdGlvbjtcblx0XHRcdFx0Ly8gXHRcdHZhciBzaWRlID0gKG9mZnNldFtcInhcIl0gPT09IDA/IFwibGVmdFwiIDogXCJyaWdodFwiKTtcblx0XHRcdFx0Ly9cblx0XHRcdFx0Ly8gXHRcdCR0aGlzLmFkZENsYXNzKFwidGltZWxpbmUtXCIgKyBzaWRlKTtcblx0XHRcdFx0Ly9cblx0XHRcdFx0Ly8gXHRcdGlmIChvZmZzZXRbXCJ5XCJdIC0gcHJldmlvdXNfcG9zaXRpb24gPCAxMCkge1xuXHRcdFx0XHQvLyBcdFx0XHQkdGhpcy5hZGRDbGFzcyhcImV4dHJhLW9mZnNldFwiKTtcblx0XHRcdFx0Ly8gXHRcdH1cblx0XHRcdFx0Ly9cblx0XHRcdFx0Ly8gXHRcdHByZXZpb3VzX3Bvc2l0aW9uID0gb2Zmc2V0W1wieVwiXTtcblx0XHRcdFx0Ly8gXHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0JHBvc3RzLmlzb3RvcGUoXCJsYXlvdXRcIik7XG5cdFx0XHRcdH0sIDEpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKFwiPGxpIC8+XCIpLmFkZENsYXNzKFwiZW1wdHlcIikudGV4dChcIk5lbmh1bSBwb3N0XCIpLmFwcGVuZFRvKCRwb3N0cyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHRcdC8vIGxheW91dFxuXHRcdFx0JGFwcFtcInRhcmVmYVwiXS5odG1sKCR0YXJlZmEpO1xuXG5cdFx0XHRpZiAodGFyZWZhW1wicG9zdHNcIl0ubGVuZ3RoKSB7XG5cdFx0XHRcdCRwb3N0cy5pc290b3BlKFwibGF5b3V0XCIpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBwbGFjYXIgZGEgdGFyZWZhXG5cdFx0XHR2YXIgJHBsYWNhcl9kYV90YXJlZmEgPSAkKFwiLnBhaW5lbCAucGxhY2FyIHVsXCIsICR0YXJlZmEpO1xuXG5cdFx0XHQkLmVhY2goTGlzdGEuRWRpY2FvW1widHVybWFzXCJdLCBmdW5jdGlvbihpbmRleCwgdHVybWEpIHtcblx0XHRcdFx0dmFyIHBvbnR1YWNhb19kYV90dXJtYSA9IFsgXTtcblxuXHRcdFx0XHQvLyBjYWxjdWxhICUgZGEgdHVybWEgZW0gcmVsYcOnw6NvIGFvIHRvdGFsIGRlIHBvbnRvc1xuXHRcdFx0XHR2YXIgcGVyY2VudHVhbF9kYV90dXJtYSA9IChwbGFjYXJfZGFfdGFyZWZhW1widG90YWxcIl0gPiAwPyBwbGFjYXJfZGFfdGFyZWZhW3R1cm1hXSAvIHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSA6IDApO1xuXHRcdFx0XHRwb250dWFjYW9fZGFfdHVybWFbXCJ0dXJtYVwiXSA9IHR1cm1hO1xuXHRcdFx0XHRwb250dWFjYW9fZGFfdHVybWFbXCJhbHR1cmEtZGEtYmFycmFcIl0gPSBcImhlaWdodDogXCIgKyAocGVyY2VudHVhbF9kYV90dXJtYSAqIDEwMCkudG9GaXhlZCgzKSArIFwiJVwiO1xuXHRcdFx0XHRwb250dWFjYW9fZGFfdHVybWFbXCJ0dXJtYS1mb3JtYXRhZGFcIl0gPSB0dXJtYS50b1VwcGVyQ2FzZSgpO1xuXHRcdFx0XHRwb250dWFjYW9fZGFfdHVybWFbXCJwb250b3NcIl0gPSAocGxhY2FyX2RhX3RhcmVmYVt0dXJtYV0gPiAwPyBwbGFjYXJfZGFfdGFyZWZhW3R1cm1hXSA6IDApO1xuXHRcdFx0XHRwb250dWFjYW9fZGFfdHVybWFbXCJwb250dWFjYW8tZm9ybWF0YWRhXCJdID0gcG9udHVhY2FvX2RhX3R1cm1hW1wicG9udG9zXCJdLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIuXCIpO1xuXG5cdFx0XHRcdHZhciAkdHVybWEgPSBfX3JlbmRlcihcInBsYWNhci10dXJtYVwiLCBwb250dWFjYW9fZGFfdHVybWEpO1xuXHRcdFx0XHQkcGxhY2FyX2RhX3RhcmVmYS5hcHBlbmQoJHR1cm1hKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5UYXJlZmEuY2xvc2UoKVxuXHRcdGNsb3NlOiBmdW5jdGlvbihwdXNoU3RhdGUpIHtcblx0XHRcdHRhcmVmYV9hY3RpdmUgPSBudWxsO1xuXHRcdFx0JChcImhlYWQgbWV0YVtuYW1lPSd0aGVtZS1jb2xvciddXCIpLmF0dHIoXCJjb250ZW50XCIsIFVJLmRhdGFbXCJ0aGVtZS1jb2xvclwiXVtcIm9yaWdpbmFsXCJdKTtcblxuXHRcdFx0VUkuYm9keS51bmxvY2soKTtcblx0XHRcdCR1aVtcImJvZHlcIl0ucmVtb3ZlQ2xhc3MoXCJ0YXJlZmEtYWN0aXZlXCIpO1xuXHRcdFx0JGFwcFtcInRhcmVmYVwiXS5yZW1vdmVDbGFzcyhcInNsaWRlLXhcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGFwcFtcInRhcmVmYVwiXS5yZW1vdmVDbGFzcyhcImluXCIpLmVtcHR5KCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKFVJLmRhdGFbXCJjb2x1bW5zXCJdID49IDMpIHtcblx0XHRcdFx0Ly8gVUkuYmFja2Ryb3AuaGlkZSgkYXBwW1widGFyZWZhXCJdKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcm91dGVyXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0ucmVwbGFjZShcImhvbWVcIik7XG5cdFx0XHRpZiAocHVzaFN0YXRlKSB7IHJvdXRlci5nbyhcIi90YXJlZmFzXCIsIHsgXCJ2aWV3XCI6IFwiaG9tZVwiIH0sIFwiTGlzdGEgZGUgVGFyZWZhc1wiKTsgfVxuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBuZXcgcG9zdCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAqIGFwcC5Qb3N0LmF1dGhvcml6ZSgpXG4vLyAqIGFwcC5Qb3N0LmRlYXV0aG9yaXplKClcbi8vICogYXBwLlBvc3QuZ2V0VGh1bWJuYWlsKClcbi8vICogYXBwLlBvc3Qub3BlbigpXG4vLyAqIGFwcC5Qb3N0LmNsb3NlKClcblxuLy8gdGlwb3MgZGUgcG9zdDogcGhvdG8sIHZpZGVvLCB0ZXh0XG5cbmFwcC5Qb3N0ID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCRhcHBbXCJwb3N0XCJdID0gJChcIi5hcHAtcG9zdFwiKTtcblx0XHQkdWlbXCJib3R0b21zaGVldFwiXS5vbihcImNsaWNrXCIsIFwiLm5ldy1wb3N0LXNoZWV0IGFcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdHZhciB0eXBlID0gJCh0aGlzKS5kYXRhKFwicG9zdC10eXBlXCIpO1xuXHRcdFx0VUkuYm90dG9tc2hlZXQuY2xvc2UoKTtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGFwcC5Qb3N0Lm9wZW4odHlwZSwgdGFyZWZhX2FjdGl2ZSk7XG5cdFx0XHR9LCA2MDApO1xuXHRcdH0pO1xuXG5cdFx0JGFwcFtcInBvc3RcIl0ub24oXCJzdWJtaXRcIiwgXCJmb3JtXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH0pLm9uKFwiY2xpY2tcIiwgXCIuc3VibWl0LWJ1dHRvblwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0aWYgKG1vbWVudCgpLmlzQWZ0ZXIoTGlzdGEuRWRpY2FvW1wiZmltXCJdKSkge1xuXHRcdFx0XHRVSS50b2FzdC5vcGVuKFwiUG9zdGFnZW5zIGVuY2VycmFkYXMhXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoJCh0aGlzKS5oYXNDbGFzcyhcImRpc2FibGVkXCIpKSB7XG5cdFx0XHRcdC8vIFRPRE8gbWVsaG9yYXIgbWVuc2FnZW1cblx0XHRcdFx0VUkudG9hc3Qub3BlbihcIkVzcGVyZSBvIGZpbSBkbyB1cGxvYWQmaGVsbGlwO1wiKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgZGF0YSA9ICQoXCJmb3JtXCIsICRhcHBbXCJwb3N0XCJdKS5zZXJpYWxpemUoKTtcblx0XHRcdC8vIEV4ZW1wbG8gZGUgZGFkb3M6XG5cdFx0XHQvLyBhY3Rpb249cG9zdFxuXHRcdFx0Ly8gZWRpY2FvPXhjaWlpXG5cdFx0XHQvLyB0YXJlZmE9MlxuXHRcdFx0Ly8gdXNlcj03NDRcblx0XHRcdC8vIHR1cm1hPWVjMVxuXHRcdFx0Ly8gdG9rZW49MGViZTIyYmU3MzFkYmQ5NDJlY2IzZTA5N2E1YWMyYWU5ZDMxODUyNDlmMzEzZWFlYzNhODU1ZWYyOTU3NTk0ZFxuXHRcdFx0Ly8gdHlwZT1pbWFnZW1cblx0XHRcdC8vIGltYWdlLW9yZGVyW109Mi03NDQtMTQ4ODA5NzAxMy01Nzhcblx0XHRcdC8vIGNhcHRpb249XG5cblx0XHRcdCQoXCIuc3VibWl0LWJ1dHRvblwiLCAkYXBwW1wicG9zdFwiXSkuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKS5odG1sKFwiRW52aWFuZG8maGVsbGlwO1wiKTtcblxuXHRcdFx0JC5wb3N0KFwiL3RhcmVmYXMvXCIgKyB0YXJlZmFfYWN0aXZlICsgXCIvcG9zdGFyXCIsIGRhdGEpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKHJlc3BvbnNlW1wibWV0YVwiXVtcInN0YXR1c1wiXSA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0YXBwLlBvc3QuY2xvc2UoKTtcblx0XHRcdFx0XHRhcHAuVGFyZWZhLnJlbmRlcihyZXNwb25zZVtcImRhdGFcIl0pO1xuXHRcdFx0XHRcdFVJLnRvYXN0Lm9wZW4ocmVzcG9uc2VbXCJtZXRhXCJdW1wibWVzc2FnZVwiXSk7XG5cdFx0XHRcdFx0bmF2aWdhdG9yLnZpYnJhdGUoODAwKTtcblxuXHRcdFx0XHRcdExpc3RhLlRhcmVmYXNbcmVzcG9uc2VbXCJkYXRhXCJdW1wibnVtZXJvXCJdXSA9IHJlc3BvbnNlW1wiZGF0YVwiXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRVSS50b2FzdC5vcGVuKChyZXNwb25zZVtcIm1ldGFcIl1bXCJtZXNzYWdlXCJdPyByZXNwb25zZVtcIm1ldGFcIl1bXCJtZXNzYWdlXCJdIDogXCJPY29ycmV1IHVtIGVycm8uIFRlbnRlIG5vdmFtZW50ZVwiKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pLmZhaWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFVJLnRvYXN0Lm9wZW4oXCJPY29ycmV1IHVtIGVycm8uIFRlbnRlIG5vdmFtZW50ZVwiLCBudWxsLCBudWxsLCBmYWxzZSk7XG5cdFx0XHR9KTtcblxuXHRcdH0pLm9uKFwiY2xpY2tcIiwgXCIuYmFjay1idXR0b25cIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRhcHAuUG9zdC5jbG9zZSgpO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuUG9zdC5hdXRob3JpemUoKVxuXHRcdGF1dGhvcml6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBoYWJpbGl0YSBvIGJvdMOjbyBlbnZpYXJcblx0XHRcdCQoXCIuc3VibWl0LWJ1dHRvblwiLCAkYXBwW1wicG9zdFwiXSkucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuUG9zdC5kZWF1dGhvcml6ZSgpXG5cdFx0ZGVhdXRob3JpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gZGVzYWJpbGl0YSBvIGJvdMOjbyBcImVudmlhclwiXG5cdFx0XHQkKFwiLnN1Ym1pdC1idXR0b25cIiwgJGFwcFtcInBvc3RcIl0pLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlBvc3QuZ2V0VGh1bWJuYWlsKClcblx0XHRnZXRUaHVtYm5haWw6IGZ1bmN0aW9uKHVybCkge1xuXHRcdFx0Ly8gdGVzdGEgc2UgdXJscyBzw6NvIGRvcyBwcm92aWRlciBhY2VpdG9zIGUgcmVzcG9uZGUgY29tIGluZm9ybWHDp8O1ZXMgc29icmUgbyB2w61kZW8sXG5cdFx0XHQvLyBpbmNsdWluZG8gYSB1cmwgZGEgbWluaWF0dXJhXG5cdFx0XHQvLyBwcm92aWRlcnMgYWNlaXRvczogeW91dHViZSwgdmltZW8sIHZpbmVcblx0XHRcdHZhciBtZWRpYV9pbmZvID0geyB9O1xuXG5cdFx0XHRmdW5jdGlvbiBzaG93VGh1bWJuYWlsKG1lZGlhX2luZm8pIHtcblx0XHRcdFx0dmFyICR0aHVtYm5haWwgPSAkKFwiPGltZyAvPlwiKS5hdHRyKFwic3JjXCIsIG1lZGlhX2luZm9bXCJ0aHVtYm5haWxcIl0pO1xuXHRcdFx0XHQkKFwiLmpzLW1lZGlhLXByb3ZpZGVyXCIsICRhcHBbXCJwb3N0XCJdKS52YWwobWVkaWFfaW5mb1tcInByb3ZpZGVyXCJdKTtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS1pZFwiLCAkYXBwW1wicG9zdFwiXSkudmFsKG1lZGlhX2luZm9bXCJpZFwiXSk7XG5cdFx0XHRcdCQoXCIuanMtbWVkaWEtdGh1bWJuYWlsXCIsICRhcHBbXCJwb3N0XCJdKS52YWwobWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSk7XG5cdFx0XHRcdCQoXCIuanMtbWVkaWEtcHJldmlld1wiLCAkYXBwW1wicG9zdFwiXSkuaHRtbCgkdGh1bWJuYWlsKS5mYWRlSW4oKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8geW91dHViZVxuXHRcdFx0aWYgKHVybC5tYXRjaCgvKD86aHR0cHM/OlxcL3syfSk/KD86d3szfVxcLik/eW91dHUoPzpiZSk/XFwuKD86Y29tfGJlKSg/OlxcL3dhdGNoXFw/dj18XFwvKShbXlxccyZdKykvKSkge1xuXHRcdFx0XHQvLyBodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PTRjdDRlTk1ySmxnXG5cdFx0XHRcdHZhciB5b3V0dWJlX3VybCA9IHVybC5tYXRjaCgvKD86aHR0cHM/OlxcL3syfSk/KD86d3szfVxcLik/eW91dHUoPzpiZSk/XFwuKD86Y29tfGJlKSg/OlxcL3dhdGNoXFw/dj18XFwvKShbXlxccyZdKykvKTtcblx0XHRcdFx0bWVkaWFfaW5mb1tcInByb3ZpZGVyXCJdID0gXCJ5b3V0dWJlXCI7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJpZFwiXSA9IHlvdXR1YmVfdXJsWzFdO1xuXHRcdFx0Ly9cdG1lZGlhX2luZm9bXCJ0aHVtYm5haWxcIl0gPSBcImh0dHBzOi8vaTEueXRpbWcuY29tL3ZpL1wiICsgeW91dHViZV91cmxbMV0gKyBcIi9tYXhyZXNkZWZhdWx0LmpwZ1wiO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1widGh1bWJuYWlsXCJdID0gXCJodHRwczovL2kxLnl0aW1nLmNvbS92aS9cIiArIHlvdXR1YmVfdXJsWzFdICsgXCIvMC5qcGdcIjtcblxuXHRcdFx0XHRhcHAuUG9zdC5hdXRob3JpemUoKTtcblx0XHRcdFx0c2hvd1RodW1ibmFpbChtZWRpYV9pbmZvKTtcblx0XHRcdH0gZWxzZVxuXG5cdFx0XHQvLyB2aW1lb1xuXHRcdFx0aWYgKHVybC5tYXRjaCgvdmltZW9cXC5jb20vKSkge1xuXHRcdFx0XHQvLyBodHRwczovL3ZpbWVvLmNvbS82NDI3OTY0OVxuXHRcdFx0XHR2YXIgdmltZW9fdXJsID0gdXJsLm1hdGNoKC9cXC9cXC8od3d3XFwuKT92aW1lby5jb21cXC8oXFxkKykoJHxcXC8pLyk7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJwcm92aWRlclwiXSA9IFwidmltZW9cIjtcblx0XHRcdFx0bWVkaWFfaW5mb1tcImlkXCJdID0gdmltZW9fdXJsWzJdO1xuXG5cdFx0XHRcdCQuZ2V0SlNPTihcImh0dHBzOi8vdmltZW8uY29tL2FwaS92Mi92aWRlby9cIiArIHZpbWVvX3VybFsyXSArIFwiLmpzb24/Y2FsbGJhY2s9P1wiKVxuXHRcdFx0XHRcdC5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0XHRtZWRpYV9pbmZvW1widGh1bWJuYWlsXCJdID0gcmVzcG9uc2VbMF1bXCJ0aHVtYm5haWxfbGFyZ2VcIl07XG5cblx0XHRcdFx0XHRcdGFwcC5Qb3N0LmF1dGhvcml6ZSgpO1xuXHRcdFx0XHRcdFx0c2hvd1RodW1ibmFpbChtZWRpYV9pbmZvKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuUG9zdC5vcGVuKClcblx0XHRvcGVuOiBmdW5jdGlvbih0eXBlLCBudW1lcm8pIHtcblx0XHRcdHZhciBkYXRhID0ge1xuXHRcdFx0XHRcImVkaWNhb1wiOiBMaXN0YS5FZGljYW9bXCJ0aXR1bG9cIl0sXG5cdFx0XHRcdFwibnVtZXJvXCI6IChudW1lcm8gfHwgdGFyZWZhX2FjdGl2ZSksXG5cdFx0XHRcdFwidXNlclwiOiBMaXN0YS5Vc3VhcmlvW1wiaWRcIl0sXG5cdFx0XHRcdFwidHVybWFcIjogTGlzdGEuVXN1YXJpb1tcInR1cm1hXCJdLFxuXHRcdFx0XHRcInRva2VuXCI6IExpc3RhLlVzdWFyaW9bXCJ0b2tlblwiXVxuXHRcdFx0fTtcblx0XHRcdHZhciAkbmV3X3Bvc3RfdmlldyA9IF9fcmVuZGVyKFwibmV3LXBvc3QtXCIgKyB0eXBlLCBkYXRhKTtcblxuXHRcdFx0Ly8gZWZlaXRvIGRlIGFiZXJ0dXJhXG5cdFx0XHQvLyBfdmlldy5vcGVuKCRhcHBbXCJwb3N0XCJdLCAkbmV3UG9zdFZpZXcpO1xuXHRcdFx0JGFwcFtcInBvc3RcIl0uaHRtbCgkbmV3X3Bvc3RfdmlldykuYWRkQ2xhc3MoXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlLXlcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHZpZXdfdGhlbWVfY29sb3IgPSAkKFwiLmFwcGJhclwiLCAkYXBwW1wicG9zdFwiXSkuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiKTtcblx0XHRcdFx0JChcImhlYWQgbWV0YVtuYW1lPSd0aGVtZS1jb2xvciddXCIpLmF0dHIoXCJjb250ZW50XCIsIHZpZXdfdGhlbWVfY29sb3IpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGFwcC5Qb3N0LmRlYXV0aG9yaXplKCk7XG5cblx0XHRcdC8vIGHDp8O1ZXMgcGFyYSBmYXplciBxdWFuZG8gYWJyaXIgYSB0ZWxhIGRlIGVudmlvXG5cdFx0XHQvLyBkZSBhY29yZG8gY29tIG8gdGlwbyBkZSBwb3N0YWdlbVxuXHRcdFx0aWYgKHR5cGUgPT09IFwicGhvdG9cIikge1xuXHRcdFx0XHQkYXBwW1wicG9zdFwiXS5kcm9wem9uZSgpO1xuXHRcdFx0XHQkKFwiLmZpbGUtcGxhY2Vob2xkZXJcIiwgJGFwcFtcInBvc3RcIl0pLnRyaWdnZXIoXCJjbGlja1wiKTtcblx0XHRcdC8vXHQkKFwiZm9ybVwiLCAkbmV3X3Bvc3RfdmlldykuZHJvcHpvbmUoKTtcblx0XHRcdH0gZWxzZVxuXG5cdFx0XHRpZiAodHlwZSA9PT0gXCJ2aWRlb1wiIHx8IHR5cGUgPT09IFwidmluZVwiKSB7XG5cdFx0XHRcdCQoXCIuanMtbWVkaWEtdXJsLWlucHV0XCIsICRhcHBbXCJwb3N0XCJdKS5mb2N1cygpLm9uKFwia2V5dXBcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdC8vXHRpZiAoJC5pbkFycmF5KGV2ZW50LmtleUNvZGUsIFsxNiwgMTcsIDE4XSkpIHsgcmV0dXJuOyB9XG5cdFx0XHRcdFx0YXBwLlBvc3QuZ2V0VGh1bWJuYWlsKCQodGhpcykudmFsKCkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZVxuXG5cdFx0XHRpZiAodHlwZSA9PT0gXCJ0ZXh0XCIpIHtcblx0XHRcdFx0JChcIi5qcy1jYXB0aW9uLWlucHV0XCIsICRhcHBbXCJwb3N0XCJdKS5mb2N1cygpLm9uKFwia2V5dXBcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKCQodGhpcykudmFsKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0YXBwLlBvc3QuYXV0aG9yaXplKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGFwcC5Qb3N0LmRlYXV0aG9yaXplKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0VUkuYmFja2Ryb3Auc2hvdygkYXBwW1wicG9zdFwiXSk7XG5cblx0XHRcdC8vIHZpZXcgbWFuYWdlclxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLnJlcGxhY2UoXCJuZXctcG9zdFwiKTtcblx0XHRcdGhpc3RvcnkucmVwbGFjZVN0YXRlKHsgXCJ2aWV3XCI6IFwibmV3LXBvc3RcIiwgXCJ0eXBlXCI6IHR5cGUsIFwiaWRcIjogZGF0YVtcIm51bWVyb1wiXSB9LCBudWxsLCBudWxsKTtcblx0XHR9LFxuXG5cdFx0Ly8gc2VuZDogZnVuY3Rpb24oKSB7XG5cdFx0Ly9cblx0XHQvLyB9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuUG9zdC5jbG9zZSgpXG5cdFx0Y2xvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdC8vXHR0YXJlZmFfYWN0aXZlID0gbnVsbDtcblx0XHRcdCQoXCJoZWFkIG1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKS5hdHRyKFwiY29udGVudFwiLCBVSS5kYXRhW1widGhlbWUtY29sb3JcIl1bXCJvcmlnaW5hbFwiXSk7XG5cblx0XHRcdCRhcHBbXCJwb3N0XCJdLnJlbW92ZUNsYXNzKFwic2xpZGUteVwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkYXBwW1wicG9zdFwiXS5yZW1vdmVDbGFzcyhcImluXCIpLmVtcHR5KCk7XG5cdFx0XHRcdFVJLmJhY2tkcm9wLmhpZGUoJGFwcFtcInBvc3RcIl0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZXBsYWNlKFwidGFyZWZhXCIpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBpbWFnZSB1cGxvYWQgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG52YXIgZmlsZV9zdGFjayA9IHsgfTtcblxuZnVuY3Rpb24gdXBsb2FkKGZpbGVzKSB7XG5cdGxldCBleGlmX29yaWVudGF0aW9uX3RvX2RlZ3JlZXMgPSB7XG5cdFx0MDogMCxcblx0XHQxOiAwLFxuXHRcdDI6IDAsXG5cdFx0MzogMTgwLFxuXHRcdDQ6IDAsXG5cdFx0NTogMCxcblx0XHQ2OiA5MCxcblx0XHQ3OiAwLFxuXHRcdDg6IDI3MFxuXHR9O1xuXG5cdEZpbGVBUEkuZmlsdGVyRmlsZXMoZmlsZXMsIGZ1bmN0aW9uKGZpbGUsIGluZm8pIHtcblx0XHRpZiAoL15pbWFnZS8udGVzdChmaWxlLnR5cGUpKSB7XG5cdFx0XHRmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXSA9IGluZm87XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHQvL1x0cmV0dXJuIGluZm8ud2lkdGggPj0gMzIwICYmIGluZm8uaGVpZ2h0ID49IDI0MDtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LCBmdW5jdGlvbihmaWxlcywgcmVqZWN0ZWQpIHtcblx0XHRpZiAoZmlsZXMubGVuZ3RoKSB7XG5cdFx0XHQkKFwiLnN1Ym1pdFwiLCAkYXBwW1wicG9zdFwiXSkuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcblxuXHRcdFx0Ly8gcHJldmlld1xuXHRcdFx0RmlsZUFQSS5lYWNoKGZpbGVzLCBmdW5jdGlvbihmaWxlKSB7XG5cdFx0XHRcdHZhciBleGlmX29yaWVudGF0aW9uID0gZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJleGlmXCJdW1wiT3JpZW50YXRpb25cIl07XG5cdFx0XHRcdGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdID0gdGFyZWZhX2FjdGl2ZSArIFwiLVwiICsgTGlzdGEuVXN1YXJpb1tcImlkXCJdICsgXCItXCIgK1xuXHRcdFx0XHRcdG1vbWVudCgpLmZvcm1hdChcIlhcIikgKyBcIi1cIiArIHJhbmQoMCwgOTk5KS50b0ZpeGVkKDApO1xuXG5cdFx0XHRcdGlmIChmaWxlW1widHlwZVwiXSA9PSBcImltYWdlL2dpZlwiKSB7XG5cdFx0XHRcdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0XHR2YXIgaW1nID0gJChcIjxpbWcgLz5cIikuYXR0cihcInNyY1wiLCBldmVudC50YXJnZXQucmVzdWx0KTtcblx0XHRcdFx0XHRcdHZhciAkdHJhY2tlciA9ICQoXCI8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJpbWFnZS1vcmRlcltdXFxcIiAvPlwiKS52YWwoZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0pO1xuXG5cdFx0XHRcdFx0XHR2YXIgJHN0YXR1cyA9ICQoXCI8ZGl2IC8+XCIpLmFkZENsYXNzKFwicHJvZ3Jlc3NcIik7XG5cdFx0XHRcdFx0XHQkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcInN0YXR1c1wiKS5odG1sKFwiPHN0cm9uZz5FbnZpYW5kbyZoZWxsaXA7PC9zdHJvbmc+XCIpLmFwcGVuZFRvKCRzdGF0dXMpO1xuXHRcdFx0XHRcdFx0JChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJiYXJcIikuYXBwZW5kVG8oJHN0YXR1cyk7XG5cblx0XHRcdFx0XHRcdHZhciAkcHJldmlldyA9ICQoXCI8bGkgLz5cIikuYXR0cihcImlkXCIsIFwiZmlsZS1cIiArXG5cdFx0XHRcdFx0XHRcdFx0ZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0pLmFwcGVuZCgkdHJhY2tlcikuYXBwZW5kKCRzdGF0dXMpLmFwcGVuZChpbWcpO1xuXHRcdFx0XHRcdFx0JChcIiNkcm9wem9uZSAjYm9hcmRcIikuYXBwZW5kKCRwcmV2aWV3KTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdEZpbGVBUElcblx0XHRcdFx0XHRcdC5JbWFnZShmaWxlKVxuXHRcdFx0XHRcdFx0LnJvdGF0ZShleGlmX29yaWVudGF0aW9uX3RvX2RlZ3JlZXNbZXhpZl9vcmllbnRhdGlvbl0pXG5cdFx0XHRcdFx0XHQucmVzaXplKDYwMCwgMzAwLCBcInByZXZpZXdcIilcblx0XHRcdFx0XHRcdC5nZXQoZnVuY3Rpb24oZXJyLCBpbWcpIHtcblx0XHRcdFx0XHRcdC8vXHQkdHJhY2tlciA9ICQoXCI8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJpbWFnZS1vcmRlcltdXFxcIiAvPlwiKVxuXHRcdFx0XHRcdFx0Ly9cdFx0LnZhbCh0YXJlZmFfYWN0aXZlICsgXCItXCIgKyBMaXN0YS5Vc3VhcmlvW1wiaWRcIl0gKyBcIi1cIiArIGZpbGVbXCJuYW1lXCJdKTtcblx0XHRcdFx0XHRcdFx0dmFyICR0cmFja2VyID0gJChcIjxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImltYWdlLW9yZGVyW11cXFwiIC8+XCIpLnZhbChmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXSk7XG5cblx0XHRcdFx0XHRcdFx0dmFyICRzdGF0dXMgPSAkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcInByb2dyZXNzXCIpO1xuXHRcdFx0XHRcdFx0XHQkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcInN0YXR1c1wiKS5odG1sKFwiPHN0cm9uZz5FbnZpYW5kbyZoZWxsaXA7PC9zdHJvbmc+XCIpLmFwcGVuZFRvKCRzdGF0dXMpO1xuXHRcdFx0XHRcdFx0XHQkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcImJhclwiKS5hcHBlbmRUbygkc3RhdHVzKTtcblxuXHRcdFx0XHRcdFx0XHR2YXIgJHByZXZpZXcgPSAkKFwiPGxpIC8+XCIpLmF0dHIoXCJpZFwiLCBcImZpbGUtXCIgK1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0pLmFwcGVuZCgkdHJhY2tlcikuYXBwZW5kKCRzdGF0dXMpLmFwcGVuZChpbWcpO1xuXHRcdFx0XHRcdFx0XHQkKFwiI2Ryb3B6b25lICNib2FyZFwiKS5hcHBlbmQoJHByZXZpZXcpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyB1cGxvYWRcblx0XHRcdEZpbGVBUEkudXBsb2FkKHtcblx0XHRcdFx0dXJsOiBcIi90YXJlZmFzL1wiICsgdGFyZWZhX2FjdGl2ZSArIFwiL3Bvc3RhclwiLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XCJhY3Rpb25cIjogXCJ1cGxvYWRcIixcblx0XHRcdFx0XHRcImVkaWNhb1wiOiBMaXN0YS5FZGljYW9bXCJ0aXR1bG9cIl0sXG5cdFx0XHRcdFx0XCJ0YXJlZmFcIjogdGFyZWZhX2FjdGl2ZSxcblx0XHRcdFx0XHRcInR1cm1hXCI6IExpc3RhLlVzdWFyaW9bXCJ0dXJtYVwiXSxcblx0XHRcdFx0XHRcInVzZXJcIjogTGlzdGEuVXN1YXJpb1tcImlkXCJdXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByZXBhcmU6IGZ1bmN0aW9uKGZpbGUsIG9wdGlvbnMpIHtcblx0XHRcdFx0XHRvcHRpb25zLmRhdGEucmVmID0gZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl07XG5cdFx0XHRcdFx0ZmlsZS5yZWYgPSBmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXTtcblx0XHRcdFx0fSxcblxuXHRcdFx0XHRpbWFnZUF1dG9PcmllbnRhdGlvbjogKGZpbGVzWzBdW1widHlwZVwiXSAhPT0gXCJpbWFnZS9naWZcIj8gdHJ1ZSA6IG51bGwpLFxuXHRcdFx0XHRpbWFnZVRyYW5zZm9ybTogKGZpbGVzWzBdW1widHlwZVwiXSAhPT0gXCJpbWFnZS9naWZcIj8ge1xuXHRcdFx0XHRcdG1heFdpZHRoOiAxOTIwLFxuXHRcdFx0XHRcdG1heEhlaWdodDogMTkyMFxuXHRcdFx0XHR9IDogbnVsbCksXG5cblx0XHRcdFx0ZmlsZXM6IGZpbGVzLFxuXHRcdFx0XHRmaWxlcHJvZ3Jlc3M6IGZ1bmN0aW9uKGV2ZW50LCBmaWxlLCB4aHIpIHtcblx0XHRcdFx0XHR2YXIgcGVyY2VudCA9ICgoZXZlbnRbXCJsb2FkZWRcIl0gLyBldmVudFtcInRvdGFsXCJdKSAqIDEwMCkudG9GaXhlZCgwKSxcblx0XHRcdFx0XHRcdHN0YXR1cyA9IChwZXJjZW50IDwgMTAwPyBcIjxzdHJvbmc+RW52aWFuZG8maGVsbGlwOzwvc3Ryb25nPiBcIiArXG5cdFx0XHRcdFx0XHRcdFx0cGVyY2VudCArIFwiJVwiIDogXCI8c3Ryb25nPlByb2Nlc3NhbmRvJmhlbGxpcDs8L3N0cm9uZz5cIik7XG5cblx0XHRcdFx0XHQkKFwiI2ZpbGUtXCIgKyBmaWxlW1wicmVmXCJdICsgXCIgLnN0YXR1c1wiLCBcIiNkcm9wem9uZVwiKS5odG1sKHN0YXR1cyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByb2dyZXNzOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHQvL1x0dmFyIHBlcmNlbnQgPSAoKGV2ZW50W1wibG9hZGVkXCJdIC8gZXZlbnRbXCJ0b3RhbFwiXSkgKiAxMDApLnRvRml4ZWQoMCkgKyBcIiVcIlxuXHRcdFx0XHQvL1x0Y29uc29sZS5sb2cocGVyY2VudCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZpbGVjb21wbGV0ZTogZnVuY3Rpb24oZmlsZSwgeGhyLCBvcHRpb25zKSB7XG5cdFx0XHRcdC8vXHRjb25zb2xlLmxvZyhmaWxlLCB4aHIsIG9wdGlvbnMpO1xuXHRcdFx0XHRcdCQoXCIjZmlsZS1cIiArIG9wdGlvbnNbXCJyZWZcIl0gKyBcIiAuc3RhdHVzXCIsIFwiI2Ryb3B6b25lXCIpLmh0bWwoXCI8aSBjbGFzcz1cXFwibWF0ZXJpYWwtaWNvbnNcXFwiPmNoZWNrPC9pPlwiKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Y29tcGxldGU6IGZ1bmN0aW9uKGVyciwgeGhyKSB7XG5cdFx0XHRcdFx0YXBwLlBvc3QuYXV0aG9yaXplKCk7XG5cdFx0XHRcdFx0Ly8gJChcIi5zdWJtaXQtYnV0dG9uXCIsICRhcHBbXCJwb3N0XCJdKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xufVxuXG4kLmZuLmRyb3B6b25lID0gZnVuY3Rpb24oKSB7XG5cdC8vIGRyb3B6b25lXG5cdHZhciAkZHJvcHpvbmUgPSAkKFwiI2Ryb3B6b25lXCIsIHRoaXMpO1xuXHRGaWxlQVBJLmV2ZW50LmRuZCgkZHJvcHpvbmVbMF0sIGZ1bmN0aW9uKG92ZXIpIHtcblx0XHRpZiAob3Zlcikge1xuXHRcdFx0JGRyb3B6b25lLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkZHJvcHpvbmUucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG5cdFx0fVxuXHR9LCBmdW5jdGlvbihmaWxlcykge1xuXHRcdHVwbG9hZChmaWxlcyk7XG5cdH0pO1xuXG5cdC8vIG1hbnVhbCBzZWxlY3Rcblx0dmFyICRmaWxlX2lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtLWZpbGVcIik7XG5cdEZpbGVBUEkuZXZlbnQub24oJGZpbGVfaW5wdXQsIFwiY2hhbmdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIGZpbGVzID0gRmlsZUFQSS5nZXRGaWxlcyhldmVudCk7XG5cdFx0dXBsb2FkKGZpbGVzKTtcblx0fSk7XG5cblx0Ly8gcmVvcmRlclxuXHR2YXIgJGJvYXJkID0gJChcIiNib2FyZFwiLCB0aGlzKTtcblx0JGJvYXJkLm9uKFwic2xpcDpiZWZvcmV3YWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYgKFVJLmRhdGFbXCJpbnRlcmFjdGlvbi10eXBlXCJdID09PSBcInBvaW50ZXJcIikge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cdH0pLm9uKFwic2xpcDphZnRlcnN3aXBlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQudGFyZ2V0LnJlbW92ZSgpO1xuXHR9KS5vbihcInNsaXA6cmVvcmRlclwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50ID0gZXZlbnQub3JpZ2luYWxFdmVudDtcblx0XHRldmVudC50YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZXZlbnQudGFyZ2V0LCBldmVudC5kZXRhaWwuaW5zZXJ0QmVmb3JlKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdG5ldyBTbGlwKCRib2FyZFswXSk7XG59O1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbG9naW4gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBwLkxvZ2luLm9wZW4oKVxuLy8gYXBwLkxvZ2luLmNsb3NlKClcbi8vIGFwcC5Mb2dpbi5zdWJtaXQoKSBbP11cbi8vIGFwcC5Mb2dpbi5sb2dvdXQoKVxuXG5hcHAuTG9naW4gPSAoZnVuY3Rpb24oKSB7XG5cdExpc3RhLlVzdWFyaW8gPSB7XG5cdFx0XCJpZFwiOiBudWxsLFxuXHRcdFwibmFtZVwiOiBudWxsLFxuXHRcdFwiZW1haWxcIjogbnVsbCxcblx0XHRcInRva2VuXCI6IG51bGwsXG5cdFx0XCJ0dXJtYVwiOiBudWxsLFxuXHRcdFwic2lnbmVkLWluXCI6IGZhbHNlXG5cdH07XG5cblx0Ly8gU2UgdGl2ZXIgZGFkb3MgZ3VhcmRhZG9zIG5vIGxvY2FsU3RvcmFnZSwgdXNhIGVsZXMgcHJhIGxvZ2FyXG5cdGlmIChsb2NhbFN0b3JhZ2UgJiYgbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJMaXN0YS5Vc3VhcmlvXCIpKSB7XG5cdFx0TGlzdGEuVXN1YXJpbyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJMaXN0YS5Vc3VhcmlvXCIpKTtcblxuXHRcdCQoZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoTGlzdGEuVXN1YXJpb1tcImlkXCJdICE9PSBudWxsKSB7XG5cdFx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJzaWduZWQtaW4gdXNlci1cIiArIExpc3RhLlVzdWFyaW9bXCJ0dXJtYVwiXSk7XG5cblx0XHRcdFx0Ly8gTW9zdHJhIHRvYXN0IHNvbWVudGUgYXDDs3MgMyBzZWd1bmRvc1xuXHRcdFx0XHQvLyBkZXBvaXMgZG8gbG9hZCBkYSBMaXN0YVxuXHRcdFx0XHRjdWVbXCJsb2FkLWVkaWNhb1wiXS5kb25lKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRVSS50b2FzdC5zaG93KFwiT2zDoSBcIiArIExpc3RhLlVzdWFyaW9bXCJuYW1lXCJdICsgXCIhXCIpO1xuXHRcdFx0XHRcdH0sIDMwMDApO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wibG9naW5cIl0gPSAkKFwiLmFwcC1sb2dpblwiKTtcblxuXHRcdC8vIEJvdMO1ZXMgZGUgbG9naW4gZSBsb2dvdXRcblx0XHQkKFwiLmpzLWxvZ2luLXRyaWdnZXJcIiwgJHVpW1wic2lkZW5hdlwiXSkub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFVJLnNpZGVuYXYuY2xvc2UoKTtcblx0XHRcdGFwcC5Mb2dpbi5zaG93KCk7XG5cdFx0fSk7XG5cblx0XHQkKFwiLmpzLWxvZ291dC10cmlnZ2VyXCIsICR1aVtcInNpZGVuYXZcIl0pLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRVSS5zaWRlbmF2LmNsb3NlKCk7XG5cdFx0XHRhcHAuTG9naW4ubG9nb3V0KCk7XG5cdFx0fSk7XG5cblx0XHQvLyBBw6fDo28gZGUgbG9naW5cblx0XHQkdWlbXCJsb2dpblwiXS5vbihcImNsaWNrXCIsIFwiLmJhY2stYnV0dG9uXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0YXBwLkxvZ2luLmhpZGUoKTtcblx0XHR9KS5vbihcInN1Ym1pdFwiLCBcImZvcm1cIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGxldCBsb2dpbl9kYXRhID0gJChcImZvcm1cIiwgJHVpW1wibG9naW5cIl0pLnNlcmlhbGl6ZSgpO1xuXHRcdFx0YXBwLkxvZ2luLnN1Ym1pdChsb2dpbl9kYXRhKTtcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Mb2dpbi5zaG93KClcblx0XHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIEFicmUgYSB0ZWxhIGRlIGxvZ2luIGUgY29sb2NhIG8gZm9jbyBubyBjYW1wbyBlLW1haWxcblx0XHRcdCR1aVtcImxvZ2luXCJdLmFkZENsYXNzKFwiaW5cIikucmVmbG93KCkuYWRkQ2xhc3MoXCJzbGlkZVwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRVSS5ib2R5LmxvY2soKTtcblx0XHRcdFx0VUkuYmFja2Ryb3Auc2hvdygkdWlbXCJsb2dpblwiXSk7XG5cdFx0XHRcdCQoXCJpbnB1dFtuYW1lPSdlbWFpbCddXCIsICR1aVtcImxvZ2luXCJdKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxvZ2luLmhpZGUoKVxuXHRcdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wibG9naW5cIl0ucmVtb3ZlQ2xhc3MoXCJzbGlkZVwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkdWlbXCJsb2dpblwiXS5yZW1vdmVDbGFzcyhcImluXCIpO1xuXHRcdFx0XHRVSS5iYWNrZHJvcC5oaWRlKCR1aVtcImxvZ2luXCJdKTtcblx0XHRcdFx0VUkuYm9keS51bmxvY2soKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Mb2dpbi5zdWJtaXQoKVxuXHRcdHN1Ym1pdDogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0TGlzdGFBUEkoXCIvYXV0aFwiLCBkYXRhKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGFuYWx5dGljcyhcIkxvZ2luXCIsIFwiVGVudGF0aXZhXCIpO1xuXG5cdFx0XHRcdGlmIChyZXNwb25zZVtcIm1ldGFcIl1bXCJzdGF0dXNcIl0gPT09IDIwMCkge1xuXHRcdFx0XHRcdExpc3RhLlVzdWFyaW8gPSByZXNwb25zZVtcInVzZXJcIl07XG5cdFx0XHRcdFx0TGlzdGEuVXN1YXJpb1tcInNpZ25lZC1pblwiXSA9IHRydWU7XG5cdFx0XHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJMaXN0YS5Vc3VhcmlvXCIsIEpTT04uc3RyaW5naWZ5KExpc3RhLlVzdWFyaW8pKTtcblxuXHRcdFx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJzaWduZWQtaW4gdXNlci1cIiArIExpc3RhLlVzdWFyaW9bXCJ0dXJtYVwiXSk7XG5cdFx0XHRcdFx0YXBwLkxvZ2luLmhpZGUoKTtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0VUkudG9hc3Quc2hvdyhcIk9sw6EgXCIgKyBMaXN0YS5Vc3VhcmlvW1wibmFtZVwiXSArIFwiIVwiKTtcblx0XHRcdFx0XHR9LCA1MDApO1xuXG5cdFx0XHRcdFx0YW5hbHl0aWNzKFwiTG9naW5cIiwgXCJTdWNlc3NvXCIpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoXCIuZm9ybS1ncm91cFwiLCAkdWlbXCJsb2dpblwiXSkuYWRkQ2xhc3MoXCJhbmltYXRlZCBzaGFrZVwiKTtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyAkKFwiLmZvcm0tZ3JvdXBcIiwgJHVpW1wibG9naW5cIl0pLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgc2hha2VcIik7IH0sIDEwMDApO1xuXG5cdFx0XHRcdFx0YW5hbHl0aWNzKFwiTG9naW5cIiwgXCJGYWxoYVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxvZ2luLmxvZ291dCgpXG5cdFx0bG9nb3V0OiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIFRpcmEgYXMgY2xhc3NlcyBpbmRpY2Fkb3JhcyBkZSBsb2dpbiBkbyBib2R5XG5cdFx0XHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwic2lnbmVkLWluIHVzZXItXCIgKyBMaXN0YS5Vc3VhcmlvW1widHVybWFcIl0pO1xuXG5cdFx0XHQvLyBMaW1wYSBMaXN0YS5Vc3VhcmlvIHRhbnRvIG5hIHDDoWdpbmEgcXVhbnRvIG5vIGxvY2FsU3RvcmFnZVxuXHRcdFx0TGlzdGEuVXN1YXJpbyA9IHtcblx0XHRcdFx0XCJpZFwiOiBudWxsLFxuXHRcdFx0XHRcIm5hbWVcIjogbnVsbCxcblx0XHRcdFx0XCJlbWFpbFwiOiBudWxsLFxuXHRcdFx0XHRcInRva2VuXCI6IG51bGwsXG5cdFx0XHRcdFwidHVybWFcIjogbnVsbCxcblx0XHRcdFx0XCJzaWduZWQtaW5cIjogZmFsc2Vcblx0XHRcdH07XG5cblx0XHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiTGlzdGEuVXN1YXJpb1wiLCBKU09OLnN0cmluZ2lmeShMaXN0YS5Vc3VhcmlvKSk7XG5cblx0XHRcdC8vIERlcG9pcyBkZSAwLDUgc2VndW5kbyxcblx0XHRcdC8vIG1vc3RyYSB0b2FzdCBjb25maXJtYW5kbyBsb2dvdXRcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFVJLnRvYXN0LnNob3coXCJTZXNzw6NvIGVuY2VycmFkYSFcIik7XG5cdFx0XHR9LCA1MDApO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB3b3JrZXJzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIHN0YXJ0XG53b3JrZXIuU3RhcnQgPSAoZnVuY3Rpb24oKSB7XG5cdHRpbWluZ1tcImRlbGF5LXN0YXJ0XCJdID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRsb2coXCJ3b3JrZXIuU3RhcnRcIiwgXCJpbmZvXCIpO1xuXG5cdFx0Y3VlW1wibG9hZC1lZGljYW9cIl0gPSAkLkRlZmVycmVkKCk7XG5cdFx0Y3VlW1wiZmlyc3QtbG9hZFwiXSA9IHRydWU7XG5cblx0XHRjdWVbXCJsb2FkLWVkaWNhb1wiXS5kb25lKGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gU2UgdGl2ZXIgbsO6bWVybyBkZSB0YXJlZmEgZXNwZWNpZmljYWRvIG5hIFVSTCwgYWJyZSBlbGFcblx0XHRcdGlmIChyb3V0ZXJbXCJwYXRoXCJdICYmIHJvdXRlcltcInBhdGhcIl1bMl0pIHtcblx0XHRcdFx0Ly8gQW50ZXMsIHRlc3RhIHNlIG8gdmFsb3Igw6kgdW0gbsO6bWVyb1xuXHRcdFx0XHQvLyBlIGRlbnRybyBkbyBuw7ptZXJvIGRlIHRhcmVmYXMgZGVzc2EgRWRpw6fDo29cblx0XHRcdFx0bGV0IG51bWVybyA9IHJvdXRlcltcInBhdGhcIl1bMl07XG5cdFx0XHRcdGlmICghaXNOYU4obnVtZXJvKSAmJiBudW1lcm8gPj0gMSAmJiBudW1lcm8gPD0gTGlzdGEuRWRpY2FvW1wibnVtZXJvLWRlLXRhcmVmYXNcIl0pIHtcblx0XHRcdFx0XHRhcHAuVGFyZWZhLm9wZW4obnVtZXJvLCBmYWxzZSwgZmFsc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNlIGZvciBvIHByaW1laXJvIGxvYWRcblx0XHRcdGlmIChjdWVbXCJmaXJzdC1sb2FkXCJdKSB7XG5cdFx0XHRcdC8vIEluaWNpYSBhIGJhcnJhIGRlIGV2b2x1w6fDo29cblx0XHRcdFx0dGltaW5nW1wiZGVsYXktZXZvbHVjYW9cIl0gPSBzZXRUaW1lb3V0KGFwcC5Fdm9sdWNhby5zdGFydCwgMTAwKTtcblxuXHRcdFx0XHQvLyBJbmljaWEgYSBjaGVjYWdlbSBkZSBhdGl2aWRhZGVcblx0XHRcdFx0d29ya2VyLlVwZGF0ZSgpO1xuXG5cdFx0XHRcdC8vIERlc2F0aXZhIG5vcyBsb2FkcyBzZWd1aW50ZXNcblx0XHRcdFx0Y3VlW1wiZmlyc3QtbG9hZFwiXSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGltaW5nW1wiZGVsYXktbG9hZFwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHR3b3JrZXIuTG9hZCgpO1xuXHRcdH0sIDMwMCk7XG5cdH0sIDApO1xufSkoKTtcblxuXG4vLyBsb2FkXG53b3JrZXIuTG9hZCA9IChmdW5jdGlvbigpIHtcblx0bG9nKFwid29ya2VyLkxvYWRcIiwgXCJpbmZvXCIpO1xuXG5cdExpc3RhQVBJKFwiL3R1ZG9cIikuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdExpc3RhLkVkaWNhbyA9IHJlc3BvbnNlW1wiZWRpY2FvXCJdO1xuXHRcdExpc3RhLlBsYWNhciA9IHJlc3BvbnNlW1wicGxhY2FyXCJdO1xuXHRcdExpc3RhLlRhcmVmYXMgPSByZXNwb25zZVtcInRhcmVmYXNcIl07XG5cblx0XHR0aW1pbmdbXCJkZWxheS1saXN0YVwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBEaXNwYXJhIGEgZnVuw6fDo28gZGUgbW9udGFnZW0gZGEgTGlzdGFcblx0XHRcdGFwcC5MaXN0YS5zdGFydCgpO1xuXG5cdFx0XHQvLyBSZXNvbHZlIGEgcHJvbWlzZSBsb2FkLWVkaWNhb1xuXHRcdFx0Y3VlW1wibG9hZC1lZGljYW9cIl0ucmVzb2x2ZSgpO1xuXHRcdFx0bG9nKFwiY3VlW1xcXCJsb2FkLWVkaWNhb1xcXCJdIHRyaWdnZXJlZFwiKTtcblx0XHR9LCAxKTtcblxuXHRcdC8vIHRpbWluZ1tcImRlbGF5LXBsYWNhclwiXSA9IHNldFRpbWVvdXQoYXBwLlBsYWNhci5zdGFydCwgNDAwKTtcblx0fSk7XG59KTtcblxuXG4vLyB1cGRhdGVcbndvcmtlci5VcGRhdGUgPSAoZnVuY3Rpb24oKSB7XG5cdGxldCB1cGRhdGVzID0ge1xuXHRcdFwidGFyZWZhc1wiOiAwLFxuXHRcdFwicG9zdHNcIjogMCxcblx0XHRcInRvdGFsXCI6IDAsXG5cdFx0XCJsYXN0LXVwZGF0ZWRcIjogbnVsbFxuXHR9O1xuXG5cdHRpbWluZ1tcImF0aXZpZGFkZVwiXSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdGxvZyhcIndvcmtlci5VcGRhdGVcIiwgXCJpbmZvXCIpO1xuXG5cdFx0TGlzdGFBUEkoXCIvYXRpdmlkYWRlXCIpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdC8vIGNvbnNvbGUuaW5mbyh1cGRhdGVzKTtcblx0XHRcdC8vIENvbmZlcmUgZGF0YSBkZSBjYWRhIGF0aXZpZGFkZSBlIHbDqiBzZSDDqSBwb3N0ZXJpb3Igw6Agw7psdGltYSBhdHVhbGl6YcOnw6NvLlxuXHRcdFx0Ly8gU2UgZm9yLCBhZGljaW9uYSDDoCBjb250YWdlbSBkZSBub3ZhIGF0aXZpZGFkZVxuXHRcdFx0Zm9yIChsZXQgYXRpdmlkYWRlIG9mIHJlc3BvbnNlKSB7XG5cdFx0XHRcdC8vIGNvbnNvbGUubG9nKG1vbWVudChhdGl2aWRhZGVbXCJ0c1wiXSkuaXNBZnRlcih1cGRhdGVzW1wibGFzdC11cGRhdGVkXCJdKSk7XG5cdFx0XHRcdGlmIChtb21lbnQoYXRpdmlkYWRlW1widHNcIl0pLmlzQWZ0ZXIodXBkYXRlc1tcImxhc3QtdXBkYXRlZFwiXSkgJiYgYXRpdmlkYWRlW1wiYXV0b3JcIl0gIT0gTGlzdGEuVXN1YXJpb1tcImlkXCJdKSB7XG5cdFx0XHRcdFx0dXBkYXRlc1tcInRvdGFsXCJdKys7XG5cblx0XHRcdFx0XHRpZiAoYXRpdmlkYWRlW1wiYWNhb1wiXSA9PT0gXCJub3ZvLXRhcmVmYVwiKSB7XG5cdFx0XHRcdFx0XHR1cGRhdGVzW1widGFyZWZhc1wiXSsrO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoYXRpdmlkYWRlW1wiYWNhb1wiXSA9PT0gXCJub3ZvLXBvc3RcIikge1xuXHRcdFx0XHRcdFx0dXBkYXRlc1tcInBvc3RzXCJdKys7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNlIGhvdXZlciBub3ZhIGF0aXZpZGFkZVxuXHRcdFx0aWYgKHVwZGF0ZXNbXCJ0b3RhbFwiXSA+IDApIHtcblx0XHRcdFx0Ly8gTW9udGEgbyB0ZXh0byBkbyB0b2FzdFxuXHRcdFx0XHRsZXQgdGV4dG8gPSB7XG5cdFx0XHRcdFx0XCJ0YXJlZmFzXCI6IHVwZGF0ZXNbXCJ0YXJlZmFzXCJdICsgXCIgXCIgKyAodXBkYXRlc1tcInRhcmVmYXNcIl0gPiAxPyBcIm5vdmFzIHRhcmVmYXNcIiA6IFwibm92YSB0YXJlZmFcIiksXG5cdFx0XHRcdFx0XCJwb3N0c1wiOiB1cGRhdGVzW1wicG9zdHNcIl0gKyBcIiBcIiArICh1cGRhdGVzW1wicG9zdHNcIl0gPiAxPyBcIm5vdm9zIHBvc3RzXCIgOiBcIm5vdm8gcG9zdFwiKSxcblx0XHRcdFx0XHRcImZpbmFsXCI6IFwiXCJcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAodXBkYXRlc1tcInRhcmVmYXNcIl0gPiAwKSB7XG5cdFx0XHRcdFx0dGV4dG9bXCJmaW5hbFwiXSArPSB0ZXh0b1tcInRhcmVmYXNcIl07XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCh1cGRhdGVzW1widGFyZWZhc1wiXSA+IDApICYmICh1cGRhdGVzW1wicG9zdHNcIl0gPiAwKSkge1xuXHRcdFx0XHRcdHRleHRvW1wiZmluYWxcIl0gKz0gXCIgZSBcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodXBkYXRlc1tcInBvc3RzXCJdID4gMCkge1xuXHRcdFx0XHRcdHRleHRvW1wiZmluYWxcIl0gKz0gdGV4dG9bXCJwb3N0c1wiXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIE1vc3RyYSBvIHRvYXN0XG5cdFx0XHRcdFVJLnRvYXN0LnNob3coe1xuXHRcdFx0XHRcdFwibWVzc2FnZVwiOiB0ZXh0b1tcImZpbmFsXCJdLFxuXHRcdFx0XHRcdFwibGFiZWxcIjogXCJBdHVhbGl6YXJcIixcblx0XHRcdFx0XHRcImFjdGlvblwiOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHdvcmtlci5Mb2FkKCk7XG5cdFx0XHRcdFx0XHR1cGRhdGVzW1widGFyZWZhc1wiXSA9IDA7XG5cdFx0XHRcdFx0XHR1cGRhdGVzW1wicG9zdHNcIl0gPSAwO1xuXHRcdFx0XHRcdFx0dXBkYXRlc1tcInRvdGFsXCJdID0gMDtcblx0XHRcdFx0XHRcdCR1aVtcInBhZ2UtdGl0bGVcIl0uaHRtbChVSS5kYXRhW1wicGFnZS10aXRsZVwiXSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcInBlcnNpc3RlbnRcIjogdHJ1ZSxcblx0XHRcdFx0XHRcInN0YXJ0LW9ubHlcIjogdHJ1ZVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyBNb3N0cmEgbsO6bWVybyBkZSBub3ZhcyBhdGl2aWRhZGVzIG5vIHTDrXR1bG9cblx0XHRcdFx0JHVpW1widGl0bGVcIl0uaHRtbChcIihcIiArIHVwZGF0ZXNbXCJ0b3RhbFwiXSArIFwiKSBcIiArIFVJLmRhdGFbXCJwYWdlLXRpdGxlXCJdKTtcblx0XHRcdH1cblxuXHRcdFx0dXBkYXRlc1tcImxhc3QtdXBkYXRlZFwiXSA9IChyZXNwb25zZVswXT8gbW9tZW50KHJlc3BvbnNlWzBdW1widHNcIl0pIDogbW9tZW50KCkpO1xuXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhyZXNwb25zZSwgdXBkYXRlcyk7XG5cdFx0fSk7XG5cdH0sIDMwMDAwKTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZm9udHMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBDcmlhIHVtYSBwcm9taXNlIHF1ZSBzZXLDoSByZXNvbHZpZGFcbi8vIHF1YW5kbyBhcyBmb250ZXMgZm9yZW0gY2FycmVnYWRhc1xuY3VlW1wibG9hZC1mb250c1wiXSA9ICQuRGVmZXJyZWQoKTtcblxuV2ViRm9udC5sb2FkKHtcblx0dGltZW91dDogMTUwMDAsXG5cdGdvb2dsZToge1xuXHRcdGZhbWlsaWVzOiBbXG5cdFx0XHRcIk1hdGVyaWFsIEljb25zXCIsXG5cdFx0XHRcIlJvYm90bzo0MDAsNDAwaXRhbGljLDUwMDpsYXRpblwiLFxuXHRcdFx0XCJSb2JvdG8rTW9ubzo3MDA6bGF0aW5cIixcblx0XHRcdFwiTGF0bzo0MDA6bGF0aW5cIlxuXHRcdF1cblx0fSxcblx0Y3VzdG9tOiB7XG5cdFx0ZmFtaWxpZXM6IFtcblx0XHRcdFwiRm9udEF3ZXNvbWVcIlxuXHRcdF0sXG5cdFx0dXJsczogW1xuXHRcdFx0XCJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9mb250LWF3ZXNvbWUvNC43LjAvY3NzL2ZvbnQtYXdlc29tZS5taW4uY3NzXCJcblx0XHRdXG5cdH0sXG5cdGFjdGl2ZTogZnVuY3Rpb24oKSB7XG5cdFx0Y3VlW1wibG9hZC1mb250c1wiXS5yZXNvbHZlKCk7XG5cblx0XHQkKGZ1bmN0aW9uKCkge1xuXHRcdFx0YXBwLkxpc3RhLmxheW91dCgpO1xuXHRcdH0pO1xuXHR9XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIG1vbWVudGpzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxubW9tZW50LmxvY2FsZShcInB0LWJyXCIsIHtcblx0XHRcIm1vbnRoc1wiOiBcImphbmVpcm9fZmV2ZXJlaXJvX21hcsOnb19hYnJpbF9tYWlvX2p1bmhvX2p1bGhvX2Fnb3N0b19zZXRlbWJyb19vdXR1YnJvX25vdmVtYnJvX2RlemVtYnJvXCIuc3BsaXQoXCJfXCIpLFxuXHRcdFwibW9udGhzU2hvcnRcIjogXCJqYW5fZmV2X21hcl9hYnJfbWFpX2p1bl9qdWxfYWdvX3NldF9vdXRfbm92X2RlelwiLnNwbGl0KFwiX1wiKSxcblx0XHRcIndlZWtkYXlzXCI6IFwiZG9taW5nb19zZWd1bmRhLWZlaXJhX3RlcsOnYS1mZWlyYV9xdWFydGEtZmVpcmFfcXVpbnRhLWZlaXJhX3NleHRhLWZlaXJhX3PDoWJhZG9cIi5zcGxpdChcIl9cIiksXG5cdFx0XCJ3ZWVrZGF5c1Nob3J0XCI6IFwiZG9tX3NlZ190ZXJfcXVhX3F1aV9zZXhfc8OhYlwiLnNwbGl0KFwiX1wiKSxcblx0XHRcIndlZWtkYXlzTWluXCI6IFwiZG9tXzLCql8zwqpfNMKqXzXCql82wqpfc8OhYlwiLnNwbGl0KFwiX1wiKSxcblx0XHRcImxvbmdEYXRlRm9ybWF0XCI6IHtcblx0XHRcdFwiTFRcIjogXCJISDptbVwiLFxuXHRcdFx0XCJMVFNcIjogXCJISDptbTpzc1wiLFxuXHRcdFx0XCJMXCI6IFwiREQvTU0vWVlZWVwiLFxuXHRcdFx0XCJMTFwiOiBcIkQgW2RlXSBNTU1NIFtkZV0gWVlZWVwiLFxuXHRcdFx0XCJMTExcIjogXCJEIFtkZV0gTU1NTSBbZGVdIFlZWVkgW8Ogc10gSEg6bW1cIixcblx0XHRcdFwiTExMTFwiOiBcImRkZGQsIEQgW2RlXSBNTU1NIFtkZV0gWVlZWSBbw6BzXSBISDptbVwiXG5cdFx0fSxcblx0XHRcImNhbGVuZGFyXCI6IHtcblx0XHRcdFwic2FtZURheVwiOiBcIltob2plXSBMVFwiLFxuXHRcdFx0XCJuZXh0RGF5XCI6IFwiW2FtYW5ow6NdIExUXCIsXG5cdFx0XHRcIm5leHRXZWVrXCI6IFwiZGRkZCBMVFwiLFxuXHRcdFx0XCJsYXN0RGF5XCI6IFwiW29udGVtXSBMVFwiLFxuXHRcdFx0XCJsYXN0V2Vla1wiOiBcImRkZGQgTFRcIixcblx0XHRcdFwic2FtZUVsc2VcIjogXCJMXCJcblx0XHR9LFxuXHRcdFwicmVsYXRpdmVUaW1lXCI6IHtcblx0XHRcdFwiZnV0dXJlXCI6IFwiZGFxdWkgJXNcIixcblx0XHRcdFwicGFzdFwiOiBcIiVzIGF0csOhc1wiLFxuXHRcdFx0XCJzXCI6IFwicG91Y29zIHNlZ3VuZG9zXCIsXG5cdFx0XHRcIm1cIjogXCJ1bSBtaW51dG9cIixcblx0XHRcdFwibW1cIjogXCIlZCBtaW51dG9zXCIsXG5cdFx0XHRcImhcIjogXCJ1bWEgaG9yYVwiLFxuXHRcdFx0XCJoaFwiOiBcIiVkIGhvcmFzXCIsXG5cdFx0XHRcImRcIjogXCJ1bSBkaWFcIixcblx0XHRcdFwiZGRcIjogXCIlZCBkaWFzXCIsXG5cdFx0XHRcIk1cIjogXCJ1bSBtw6pzXCIsXG5cdFx0XHRcIk1NXCI6IFwiJWQgbWVzZXNcIixcblx0XHRcdFwieVwiOiBcInVtIGFub1wiLFxuXHRcdFx0XCJ5eVwiOiBcIiVkIGFub3NcIlxuXHRcdH0sXG5cdFx0XCJvcmRpbmFsUGFyc2VcIjogL1xcZHsxLDJ9wrovLFxuXHRcdFwib3JkaW5hbFwiOiBcIiVkwrpcIlxuXHR9KTtcbiJdfQ==
