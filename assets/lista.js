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
let timeout = [];

// Se o logging estiver ligado, relata cada passo no Console
// Obs: nem todos os métodos estão com logs criados ou detalhados!
let logging = false;
let log = function (message, type) {
	if (logging) {
		if (!type) {
			console.log(message);
		} else {
			console[type](message);
		}
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
			timeout["hide-loadbar"] = setTimeout(function () {
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
		$ui["toast"]["action"] = $(".toast-action", $ui["toast"]);
	});

	return {
		// TODO nova sintaxe, usar template e __render
		show: function (config) {
			if (typeof config === "object") {
				$ui["toast"]["message"].html(config["message"]);
				$ui["toast"]["action"].html(config["action"] ? config["action"] : "");
				$ui["toast"].addClass("in").reflow().addClass("slide");
				$ui["body"].addClass("toast-active");

				// TODO: .fab-bottom transform: translateY

				$ui["toast"].on("click", UI.toast.dismiss);
				$ui["toast"]["action"].on("click", config["callback"]);

				clearTimeout(timeout["toast"]);

				if (!config["persistent"]) {
					$ui["toast"].removeClass("stream-only");
					timeout["toast"] = setTimeout(UI.toast.dismiss, config["timeout"] ? config["timeout"] : 6000);
				} else {
					$ui["toast"].addClass("stream-only");
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
				$ui["toast"].removeClass("in stream-only");

				$ui["toast"]["message"].empty();
				$ui["toast"]["action"].empty();
			});
			clearTimeout(timeout["toast"]);
		},

		// TODO DEPRECATED
		open: function (message, action, callback, persistent) {
			// open: function(message, addClass) {
			$ui["toast"].message.html(message);
			$ui["toast"].action.html(action ? action : "");
			$ui["toast"].addClass("in").reflow().addClass("slide");
			$ui["body"].addClass("toast-active");

			// TODO: .fab-bottom transform: translateY

			$ui["toast"].on("click", UI.toast.dismiss);
			$ui["toast"].action.on("click", callback);

			clearTimeout(timeout["toast"]);

			if (!persistent) {
				$ui["toast"].removeClass("stream-only");
				timeout["toast"] = setTimeout(UI.toast.dismiss, 6500);
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
//   - barra fica da cor da turma e aparece mensagem em cima "EC1 campeã"

app.Evolucao = function () {
	$(function () {
		$ui["evolucao"] = $(".app-evolucao");
	});

	return {
		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Evolucao.start()
		start: function () {
			log("app.Evolucao.start", "info");

			// pega data de início e data de encerramento
			let dia_inicial = Lista.Edicao["inicio"] = moment(Lista.Edicao["inicio"]);
			let dia_final = Lista.Edicao["fim"] = moment(Lista.Edicao["fim"]);

			// let dia_inicial = Lista.Edicao["inicio"];
			// let dia_final = Lista.Edicao["fim"];

			// calcula o tempo total (em minutos)
			let duracao_total = Lista.Edicao["duracao-em-minutos"] = dia_final.diff(dia_inicial, "minutes");

			// insere os dias na barra, indo de dia em dia até chegar ao encerramento
			for (let dia = dia_inicial.clone(); dia.isBefore(dia_final); dia.add(1, "days")) {
				// define início e final do dia.
				// se final for após a data de encerramento, usa ela como final
				let inicio_do_dia = dia;
				let final_do_dia = dia.clone().endOf("day");
				if (final_do_dia.isAfter(dia_final)) {
					final_do_dia = dia_final;
				}

				// calcula a duração do dia em minutos
				let duracao_do_dia = final_do_dia.diff(inicio_do_dia, "minutes");

				// define a duração percentual do dia em relação ao total
				let percentual_do_dia = duracao_do_dia / duracao_total;

				// calcula a largura do dia (de acordo com duração percentual)
				// e insere dia na barra de evolução
				let largura_do_dia = (percentual_do_dia * 100).toFixed(3);
				let $dia = __render("evolucao-dia", {
					dia: dia.format("ddd")
				}).css("width", largura_do_dia + "%");

				$(".day-labels", $ui["evolucao"]).append($dia);
			}

			// com os dias inseridos na barra de evolução,
			// desenha a barra de tempo transcorrido
			setTimeout(app.Evolucao.update, 1000);

			// atualiza a linha de evolução a cada X minutos
			timeout["evolucao"] = setInterval(app.Evolucao.update, 60 * 1000);
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Evolucao.update()
		update: function () {
			log("app.Evolucao.update", "info");

			// pega as datas e calcula o tempo (em minutos) e percentual transcorridos
			let agora = moment();
			let dia_inicial = Lista.Edicao["inicio"];
			let dia_final = Lista.Edicao["fim"];
			let duracao_total = Lista.Edicao["duracao-em-minutos"];

			let tempo_transcorrido = agora.diff(dia_inicial, "minutes");
			let percentual_transcorrido = tempo_transcorrido < duracao_total ? tempo_transcorrido / duracao_total : 1;

			// define a largura da barra de evolução completa igual à largura da tela
			// depois, mostra apenas o percentual transcorrido
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
			app.Lista.status();
			app.Lista.messages();
			app.Lista.tarefas();

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
				clearInterval(update_interval);
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
				updated["tarefas"] = 0;updated["posts"] = 0;
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

			if (UI.data["columns"] >= 3) {
				// UI.backdrop.show($app["tarefa"], { "hide": app.Tarefa.close });
				// $ui["backdrop"][$app["tarefa"]].on("hide", app.Tarefa.close);
			}

			$app["tarefa"].addClass("in");
			app.Tarefa.render(tarefa);

			$app["tarefa"].reflow().addClass("slide-x").one("transitionend", function () {
				//	var view_theme_color = $(".appbar", $app["tarefa"]).css("background-color");
				$("head meta[name='theme-color']").attr("content", "#546e7a");
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
				setTimeout(function () {
					UI.toast.show("Olá " + Lista.Usuario["name"] + "!");
				}, 3000);
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
				if (response["meta"]["status"] === 200) {
					Lista.Usuario = response["user"];
					Lista.Usuario["signed-in"] = true;
					localStorage.setItem("Lista.Usuario", JSON.stringify(Lista.Usuario));

					$ui["body"].addClass("signed-in user-" + Lista.Usuario["turma"]);
					app.Login.hide();
					setTimeout(function () {
						UI.toast.show("Olá " + Lista.Usuario["name"] + "!");
					}, 500);
				} else {
					$(".form-group", $ui["login"]).addClass("animated shake");
					setTimeout(function () {
						$(".form-group", $ui["login"]).removeClass("animated shake");
					}, 1000);
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
	timeout["delay-start"] = setTimeout(function () {
		log("worker.Start", "info");

		cue["load-edicao"] = $.Deferred();
		worker.Load();

		cue["load-edicao"].done(function () {
			timeout["delay-evolucao"] = setTimeout(app.Evolucao.start, 200);

			// Se tiver número de tarefa especificado na URL, abre ela
			if (router["path"] && router["path"][2]) {
				// Antes, testa se o valor é um número
				// e dentro do número de tarefas dessa Edição
				let numero = router["path"][2];
				if (!isNaN(numero) && numero >= 1 && numero <= Lista.Edicao["numero-de-tarefas"]) {
					app.Tarefa.open(numero, false, false);
				}
			}
		});
	}, 0);
}();

// load
worker.Load = function () {
	timeout["delay-load"] = setTimeout(function () {
		log("worker.Load", "info");

		ListaAPI("/tudo").done(function (response) {
			log("cue[\"load-edicao\"] triggered");
			Lista.Edicao = response["edicao"];
			Lista.Placar = response["placar"];
			Lista.Tarefas = response["tarefas"];

			timeout["delay-lista"] = setTimeout(function () {
				app.Lista.start();
				cue["load-edicao"].resolve();
			}, 1);
			// timeout["delay-placar"] = setTimeout(app.Placar.start, 400);

			// var data = response["data"];
			// Lista.Identificacao = data;
		});

		worker.Update();
	}, 300);
};

// update
worker.Update = function () {
	let updates = {
		"tarefas": 0,
		"posts": 0,
		"total": 0,
		"last-updated": null
	};

	timeout["atividade"] = setInterval(function () {
		log("worker.Update", "info");

		ListaAPI("/atividade").done(function (response) {
			// Confere data de cada atividade e vê se é posterior à última atualização.
			// Se for, adiciona à contagem de nova atividade
			for (let atividade of response) {
				if (moment(atividade["ts"]).isAfter(updates["last-updated"]) && atividade["autor"] != Lista.Usuario["id"]) {
					updates["total"]++;
					if (value["acao"] === "novo-tarefa") {
						updates["tarefas"]++;
					} else if (value["acao"] === "novo-post") {
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

				UI.toast.show({
					"persistent": true,
					"message": texto["final"],
					"label": "Atualizar",
					"action": function () {
						worker.Load();
						updates["tarefas"] = 0;
						updates["posts"] = 0;
						updates["total"] = 0;
						$ui["page-title"].html(UI.data["page-title"]);
					}
				});

				// Mostra número de novas atividades no título
				$ui["title"].html("(" + updates["total"] + ") " + UI.data["page-title"]);
			}

			updates["last-updated"] = response[0] ? moment(response[0]["ts"]) : moment();
		});
	}, 30 * 1000);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiLCJ1dGlsaXRpZXMuanMiLCJ0ZW1wbGF0ZS1lbmdpbmUuanMiLCJyb3V0ZXIuanMiLCJkb2N1bWVudC5qcyIsImJvZHkuanMiLCJsb2FkYmFyLmpzIiwiYmFja2Ryb3AuanMiLCJzaWRlbmF2LmpzIiwiYm90dG9tc2hlZXQuanMiLCJ0b2FzdC5qcyIsImFwaS5qcyIsInBsYWNhci5qcyIsImV2b2x1Y2FvLmpzIiwibGlzdGEuanMiLCJ0YXJlZmEuanMiLCJwb3N0LmpzIiwidXBsb2FkLmpzIiwibG9naW4uanMiLCJ3b3JrZXJzLmpzIiwiZm9udHMuanMiLCJtb21lbnQtbG9jYWxlLmpzIl0sIm5hbWVzIjpbIkxpc3RhIiwiRWRpY2FvIiwiUGxhY2FyIiwiVGFyZWZhcyIsIlVzdWFyaW8iLCJhcHAiLCIkYXBwIiwiY2FjaGUiLCJjdWUiLCJ3b3JrZXIiLCJ0aW1lb3V0IiwibG9nZ2luZyIsImxvZyIsIm1lc3NhZ2UiLCJ0eXBlIiwiY29uc29sZSIsInRhcmVmYV9hY3RpdmUiLCJyYW5kIiwibWluIiwibWF4IiwiTWF0aCIsInJhbmRvbSIsIiR0ZW1wbGF0ZXMiLCIkIiwiZWFjaCIsIiR0aGlzIiwibmFtZSIsImF0dHIiLCJodG1sIiwicmVtb3ZlIiwiX19yZW5kZXIiLCJ0ZW1wbGF0ZSIsImRhdGEiLCIkcmVuZGVyIiwiY2xvbmUiLCJmbiIsImZpbGxCbGFua3MiLCIkYmxhbmsiLCJmaWxsIiwicnVsZXMiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJwYWlyIiwiZGVzdCIsInRyaW0iLCJzb3VyY2UiLCJ2YWx1ZSIsImFkZENsYXNzIiwidmFsIiwiaWZfbnVsbCIsImhpZGUiLCJyZW1vdmVDbGFzcyIsInJlbW92ZUF0dHIiLCJoYXNDbGFzcyIsInJvdXRlciIsImxvY2F0aW9uIiwicGF0aG5hbWUiLCJoYXNoIiwicGF0aCIsIm9iamVjdCIsInRpdGxlIiwiaGlzdG9yeSIsInB1c2hTdGF0ZSIsImxpbmsiLCJhZGQiLCJ2aWV3IiwicHVzaCIsImdyZXAiLCJyZXBsYWNlIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwic3RhdGUiLCJpbmRleE9mIiwiVUkiLCJib3R0b21zaGVldCIsImNsb3NlIiwiUG9zdCIsIlRhcmVmYSIsIm9wZW4iLCIkdWkiLCJkb2N1bWVudCIsImJvZHkiLCJyZWZsb3ciLCJvZmZzZXQiLCJsZWZ0IiwibmF2aWdhdG9yIiwibXNNYXhUb3VjaFBvaW50cyIsInNldExheW91dFByb3BlcnRpZXMiLCJ3aWR0aCIsImhlaWdodCIsImZsb29yIiwibGF5b3V0X2NsYXNzIiwiZ2V0U2Nyb2xsYmFyU2l6ZSIsIiRvdXRlckNvbnRhaW5lciIsImNzcyIsImFwcGVuZFRvIiwiJGlubmVyQ29udGFpbmVyIiwib24iLCJzZXRTY3JvbGxQb3NpdGlvbiIsInNjcm9sbFRvcCIsInNjcm9sbFN0YXR1cyIsInkiLCJsb2NrIiwidW5sb2NrIiwibG9hZGJhciIsInNob3ciLCJzZXRUaW1lb3V0Iiwib25lIiwiYmFja2Ryb3AiLCIkc2NyZWVuIiwiZXZlbnRzIiwic2NyZWVuIiwiemluZGV4IiwiaGFuZGxlciIsInRyaWdnZXIiLCJvZmYiLCJzaWRlbmF2IiwicHJldmVudERlZmF1bHQiLCIkY29udGVudCIsImVtcHR5IiwidG9hc3QiLCJjb25maWciLCJkaXNtaXNzIiwiY2xlYXJUaW1lb3V0IiwiYWN0aW9uIiwiY2FsbGJhY2siLCJwZXJzaXN0ZW50IiwiYXBpX2tleSIsIkxpc3RhQVBJIiwiZW5kcG9pbnQiLCJhcGlfdXJsIiwiZWRpY2FvIiwicmVxdWVzdCIsImdldEpTT04iLCJ1cGRhdGUiLCJ0dXJtYXMiLCJtYWlvcl9wb250dWFjYW8iLCJ0b3RhbF9kZV9wb250b3MiLCJ0dXJtYSIsInBvbnR1YWNhb19kYV90dXJtYSIsImluZGV4IiwicGVyY2VudHVhbF9kYV90dXJtYSIsInRvRml4ZWQiLCJ0b1VwcGVyQ2FzZSIsInRvU3RyaW5nIiwiJHR1cm1hIiwiYXBwZW5kIiwicGFyZW50IiwiRXZvbHVjYW8iLCJzdGFydCIsImRpYV9pbmljaWFsIiwibW9tZW50IiwiZGlhX2ZpbmFsIiwiZHVyYWNhb190b3RhbCIsImRpZmYiLCJkaWEiLCJpc0JlZm9yZSIsImluaWNpb19kb19kaWEiLCJmaW5hbF9kb19kaWEiLCJlbmRPZiIsImlzQWZ0ZXIiLCJkdXJhY2FvX2RvX2RpYSIsInBlcmNlbnR1YWxfZG9fZGlhIiwibGFyZ3VyYV9kb19kaWEiLCIkZGlhIiwiZm9ybWF0Iiwic2V0SW50ZXJ2YWwiLCJhZ29yYSIsInRlbXBvX3RyYW5zY29ycmlkbyIsInBlcmNlbnR1YWxfdHJhbnNjb3JyaWRvIiwibGFyZ3VyYV9kYV9iYXJyYSIsImlzb3RvcGUiLCJlbGVtZW50IiwicGFyc2VJbnQiLCJ3aGljaCIsIiRjYXJkIiwibnVtZXJvIiwic3RhdHVzIiwibWVzc2FnZXMiLCJ0YXJlZmFzIiwiY2xlYXJJbnRlcnZhbCIsInVwZGF0ZV9pbnRlcnZhbCIsInBhZ2VfdGl0bGUiLCJjbG9zaW5nX21lc3NhZ2UiLCJ0YXJlZmEiLCIkdGFyZWZhIiwiJGdyaWQiLCJ0b3RhbF9wb3N0cyIsIm1heF9tZWRpYV90b19zaG93Iiwic2hvd25fbWVkaWFfY291bnQiLCJwb3N0X3R5cGVzX3dpdGhfaW1hZ2VfcHJldmlldyIsInBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXciLCJwb3N0IiwidGlsZV90eXBlIiwibWVkaWEiLCJzdWJzdHJpbmciLCIkdGlsZSIsImxheW91dCIsImxvYWQiLCIkc3RyZWFtIiwibG9hZGluZyIsImRvbmUiLCJSZWd1bGFtZW50byIsInNvcnQiLCJsYXN0X3VwZGF0ZWQiLCJ1cGRhdGVkIiwiY3JpdGVyaWEiLCJwbGFjYXJfZGFfdGFyZWZhIiwicmVuZGVyUG9zdHMiLCJwb3N0cyIsIiRwb3N0cyIsImNhbGVuZGFyIiwiJGNvbnRlbnRfY2FyZCIsIiRtZWRpYSIsIiRpbWFnZSIsIiRlbWJlZCIsInJlbmRlciIsImdvIiwiJHRhcmVmYV9jYXJkIiwidGV4dCIsIiRwbGFjYXJfZGFfdGFyZWZhIiwic2VyaWFsaXplIiwicmVzcG9uc2UiLCJ2aWJyYXRlIiwiZmFpbCIsImF1dGhvcml6ZSIsImRlYXV0aG9yaXplIiwiZ2V0VGh1bWJuYWlsIiwidXJsIiwibWVkaWFfaW5mbyIsInNob3dUaHVtYm5haWwiLCIkdGh1bWJuYWlsIiwiZmFkZUluIiwibWF0Y2giLCJ5b3V0dWJlX3VybCIsInZpbWVvX3VybCIsIiRuZXdfcG9zdF92aWV3Iiwidmlld190aGVtZV9jb2xvciIsImRyb3B6b25lIiwiZm9jdXMiLCJyZXBsYWNlU3RhdGUiLCJmaWxlX3N0YWNrIiwidXBsb2FkIiwiZmlsZXMiLCJleGlmX29yaWVudGF0aW9uX3RvX2RlZ3JlZXMiLCJGaWxlQVBJIiwiZmlsdGVyRmlsZXMiLCJmaWxlIiwiaW5mbyIsInRlc3QiLCJyZWplY3RlZCIsImV4aWZfb3JpZW50YXRpb24iLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwiaW1nIiwidGFyZ2V0IiwicmVzdWx0IiwiJHRyYWNrZXIiLCIkc3RhdHVzIiwiJHByZXZpZXciLCJyZWFkQXNEYXRhVVJMIiwiSW1hZ2UiLCJyb3RhdGUiLCJyZXNpemUiLCJnZXQiLCJlcnIiLCJwcmVwYXJlIiwib3B0aW9ucyIsInJlZiIsImltYWdlQXV0b09yaWVudGF0aW9uIiwiaW1hZ2VUcmFuc2Zvcm0iLCJtYXhXaWR0aCIsIm1heEhlaWdodCIsImZpbGVwcm9ncmVzcyIsInhociIsInBlcmNlbnQiLCJwcm9ncmVzcyIsImZpbGVjb21wbGV0ZSIsImNvbXBsZXRlIiwiJGRyb3B6b25lIiwiZG5kIiwib3ZlciIsIiRmaWxlX2lucHV0IiwiZ2V0RWxlbWVudEJ5SWQiLCJnZXRGaWxlcyIsIiRib2FyZCIsIm9yaWdpbmFsRXZlbnQiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwiZGV0YWlsIiwiU2xpcCIsIkxvZ2luIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsIkpTT04iLCJwYXJzZSIsImxvZ291dCIsImxvZ2luX2RhdGEiLCJzdWJtaXQiLCJzZXRJdGVtIiwic3RyaW5naWZ5IiwiU3RhcnQiLCJEZWZlcnJlZCIsIkxvYWQiLCJpc05hTiIsInJlc29sdmUiLCJVcGRhdGUiLCJ1cGRhdGVzIiwiYXRpdmlkYWRlIiwidGV4dG8iLCJXZWJGb250IiwiZ29vZ2xlIiwiZmFtaWxpZXMiLCJjdXN0b20iLCJ1cmxzIiwiYWN0aXZlIiwibG9jYWxlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUFBLFFBQUEsRUFBQTtBQUNBQSxNQUFBQyxNQUFBLEdBQUEsRUFBQTtBQUNBRCxNQUFBRSxNQUFBLEdBQUEsRUFBQTtBQUNBRixNQUFBRyxPQUFBLEdBQUEsRUFBQTtBQUNBSCxNQUFBSSxPQUFBLEdBQUEsRUFBQTs7QUFFQTtBQUNBO0FBQ0EsSUFBQUMsTUFBQSxFQUFBO0FBQ0EsSUFBQUMsT0FBQSxFQUFBOztBQUVBLElBQUFDLFFBQUEsRUFBQTtBQUNBQSxNQUFBLFNBQUEsSUFBQSxFQUFBOztBQUVBOztBQUVBLElBQUFDLE1BQUEsRUFBQTtBQUNBLElBQUFDLFNBQUEsRUFBQTtBQUNBLElBQUFDLFVBQUEsRUFBQTs7QUFFQTtBQUNBO0FBQ0EsSUFBQUMsVUFBQSxLQUFBO0FBQ0EsSUFBQUMsTUFBQSxVQUFBQyxPQUFBLEVBQUFDLElBQUEsRUFBQTtBQUNBLEtBQUFILE9BQUEsRUFBQTtBQUNBLE1BQUEsQ0FBQUcsSUFBQSxFQUFBO0FBQ0FDLFdBQUFILEdBQUEsQ0FBQUMsT0FBQTtBQUNBLEdBRkEsTUFFQTtBQUNBRSxXQUFBRCxJQUFBLEVBQUFELE9BQUE7QUFDQTtBQUNBO0FBQ0EsQ0FSQTs7QUFVQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsSUFBQUcsYUFBQTs7QUM3Q0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBQUMsT0FBQSxDQUFBQyxHQUFBLEVBQUFDLEdBQUEsS0FBQTtBQUNBLFFBQUFDLEtBQUFDLE1BQUEsTUFBQUYsTUFBQUQsR0FBQSxJQUFBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNMQTtBQUNBO0FBQ0E7O0FBRUEsSUFBQUksYUFBQSxFQUFBOztB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OztBQUVBOUMsT0FBQXNLLE1BQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLDJGQUFBdlIsS0FBQSxDQUFBLEdBQUEsQ0FEQTtBQUVBLGdCQUFBLGtEQUFBQSxLQUFBLENBQUEsR0FBQSxDQUZBO0FBR0EsYUFBQSxpRkFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FIQTtBQUlBLGtCQUFBLDhCQUFBQSxLQUFBLENBQUEsR0FBQSxDQUpBO0FBS0EsZ0JBQUEseUJBQUFBLEtBQUEsQ0FBQSxHQUFBLENBTEE7QUFNQSxtQkFBQTtBQUNBLFFBQUEsT0FEQTtBQUVBLFNBQUEsVUFGQTtBQUdBLE9BQUEsWUFIQTtBQUlBLFFBQUEsdUJBSkE7QUFLQSxTQUFBLGtDQUxBO0FBTUEsVUFBQTtBQU5BLEVBTkE7QUFjQSxhQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEsYUFBQSxhQUZBO0FBR0EsY0FBQSxTQUhBO0FBSUEsYUFBQSxZQUpBO0FBS0EsY0FBQSxTQUxBO0FBTUEsY0FBQTtBQU5BLEVBZEE7QUFzQkEsaUJBQUE7QUFDQSxZQUFBLFVBREE7QUFFQSxVQUFBLFVBRkE7QUFHQSxPQUFBLGlCQUhBO0FBSUEsT0FBQSxXQUpBO0FBS0EsUUFBQSxZQUxBO0FBTUEsT0FBQSxVQU5BO0FBT0EsUUFBQSxVQVBBO0FBUUEsT0FBQSxRQVJBO0FBU0EsUUFBQSxTQVRBO0FBVUEsT0FBQSxRQVZBO0FBV0EsUUFBQSxVQVhBO0FBWUEsT0FBQSxRQVpBO0FBYUEsUUFBQTtBQWJBLEVBdEJBO0FBcUNBLGlCQUFBLFVBckNBO0FBc0NBLFlBQUE7QUF0Q0EsQ0FBQSIsImZpbGUiOiJsaXN0YS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGxpc3RhIGRlIHRhcmVmYXMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gVG9kYXMgYXMgaW5mb3JtYcOnw7VlcyBmaWNhbSBndWFyZGFkYXMgZGVudHJvIGRvIG9iamV0byBcIkxpc3RhXCIsXG4vLyBlbSB1bSBkb3Mgc2V1cyA0IG7Ds3NcbmxldCBMaXN0YSA9IFsgXTtcbkxpc3RhLkVkaWNhbyA9IHsgfTtcbkxpc3RhLlBsYWNhciA9IFsgXTtcbkxpc3RhLlRhcmVmYXMgPSBbIF07XG5MaXN0YS5Vc3VhcmlvID0geyB9O1xuXG4vLyBcImFwcFwiIGd1YXJkYSBvcyBtw6l0b2RvcyBlc3BlY8OtZmljb3MgZG8gZnVuY2lvbmFtZW50byBkYSBMaXN0YSxcbi8vIFwiJGFwcFwiIGd1YXJkYSBhcyByZWZlcsOqbmNpYXMgalF1ZXJ5IGFvIERPTSB1c2FkYXMgbmVzc2VzIG3DqXRvZG9zXG5sZXQgYXBwID0gWyBdO1xubGV0ICRhcHAgPSBbIF07XG5cbmxldCBjYWNoZSA9IFsgXTtcbmNhY2hlW1widGFyZWZhc1wiXSA9IFsgXTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5sZXQgY3VlID0gWyBdO1xubGV0IHdvcmtlciA9IFsgXTtcbmxldCB0aW1lb3V0ID0gWyBdO1xuXG4vLyBTZSBvIGxvZ2dpbmcgZXN0aXZlciBsaWdhZG8sIHJlbGF0YSBjYWRhIHBhc3NvIG5vIENvbnNvbGVcbi8vIE9iczogbmVtIHRvZG9zIG9zIG3DqXRvZG9zIGVzdMOjbyBjb20gbG9ncyBjcmlhZG9zIG91IGRldGFsaGFkb3MhXG5sZXQgbG9nZ2luZyA9IGZhbHNlO1xubGV0IGxvZyA9IGZ1bmN0aW9uKG1lc3NhZ2UsIHR5cGUpIHtcblx0aWYgKGxvZ2dpbmcpIHtcblx0XHRpZiAoIXR5cGUpIHtcblx0XHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlW3R5cGVdKG1lc3NhZ2UpO1xuXHRcdH1cblx0fVxufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIGRhcXVpIHByYSBiYWl4byBuw6NvIMOpIHByYSB0ZXIgbmFkYSEhXG5cbnZhciB0YXJlZmFfYWN0aXZlO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgLyB1dGlsaXRpZXMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBUw610dWxvIGUgY29yIGRvIHRlbWFcblVJLmRhdGFbXCJ0aGVtZS1jb2xvclwiXSA9IFsgXTtcblxuJChmdW5jdGlvbigpIHtcblx0JHVpW1widGl0bGVcIl0gPSAkKFwiaGVhZCB0aXRsZVwiKTtcblx0VUkuZGF0YVtcInRpdGxlXCJdID0gJHVpW1widGl0bGVcIl0uaHRtbCgpO1xuXG5cdCR1aVtcInRoZW1lLWNvbG9yXCJdID0gJChcIm1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKTtcblx0VUkuZGF0YVtcInRoZW1lLWNvbG9yXCJdW1wib3JpZ2luYWxcIl0gPSAkdWlbXCJ0aGVtZS1jb2xvclwiXS5hdHRyKFwiY29udGVudFwiKTtcbn0pO1xuXG4vLyBUaXBvIGRlIGludGVyYcOnw6NvICh0b3VjaCBvdSBwb2ludGVyKVxuVUkuZGF0YVtcImludGVyYWN0aW9uLXR5cGVcIl0gPSAoXCJvbnRvdWNoc3RhcnRcIiBpbiB3aW5kb3cgfHwgbmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMpPyBcInRvdWNoXCIgOiBcInBvaW50ZXJcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFByb3ByaWVkYWRlcyBkYSBqYW5lbGEgZSBkbyBsYXlvdXRcblVJLmRhdGFbXCJjb2x1bW4td2lkdGhcIl0gPSAzMTY7IC8vIExhcmd1cmEgZGEgY29sdW5hLCBpbmNsdWluZG8gbWFyZ2VtXG5VSS5kYXRhW1wid2luZG93XCJdID0gWyBdO1xuXG5mdW5jdGlvbiBzZXRMYXlvdXRQcm9wZXJ0aWVzKCkge1xuXHQvLyBEaW1lbnPDtWVzIChsYXJndXJhIGUgYWx0dXJhKSBkYSBqYW5lbGFcblx0VUkuZGF0YVtcIndpbmRvd1wiXVtcIndpZHRoXCJdID0gJHVpW1wid2luZG93XCJdLndpZHRoKCk7XG5cdFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJoZWlnaHRcIl0gPSAkdWlbXCJ3aW5kb3dcIl0uaGVpZ2h0KCk7XG5cblx0Ly8gQ2FsY3VsYSBuw7ptZXJvIGRlIGNvbHVuYXNcblx0VUkuZGF0YVtcImNvbHVtbnNcIl0gPSBNYXRoLmZsb29yKFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJ3aWR0aFwiXSAvIFVJLmRhdGFbXCJjb2x1bW4td2lkdGhcIl0pO1xuXG5cdC8vIEFkaWNpb25hIGNsYXNzZSBubyA8Ym9keT4gZGUgYWNvcmRvIGNvbSBhIHF1YW50aWRhZGUgZGUgY29sdW5hc1xuXHRsZXQgbGF5b3V0X2NsYXNzO1xuXHRpZiAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPT09IDEpIHtcblx0XHRsYXlvdXRfY2xhc3MgPSBcInVpLXNpbmdsZS1jb2x1bW5cIjtcblx0fSBlbHNlIGlmIChVSS5kYXRhW1wiY29sdW1uc1wiXSA9PT0gMikge1xuXHRcdGxheW91dF9jbGFzcyA9IFwidWktZHVhbC1jb2x1bW5cIjtcblx0fSBlbHNlIHtcblx0XHRsYXlvdXRfY2xhc3MgPSBcInVpLW11bHRpLWNvbHVtblwiO1xuXHR9XG5cblx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInVpLXNpbmdsZS1jb2x1bW4gdWktZHVhbC1jb2x1bW4gdWktbXVsdGktY29sdW1uXCIpLmFkZENsYXNzKGxheW91dF9jbGFzcyk7XG59XG5cbmZ1bmN0aW9uIGdldFNjcm9sbGJhclNpemUoKSB7XG5cdC8vIERlc2NvYnJlIG8gdGFtYW5obyBkYSBiYXJyYSBkZSByb2xhZ2VtXG5cdGxldCAkb3V0ZXJDb250YWluZXIgPSAkKFwiPGRpdiAvPlwiKS5jc3Moe1xuXHRcdFwib3ZlcmZsb3dcIjogXCJzY3JvbGxcIixcblx0XHRcImRpc3BsYXlcIjogXCJub25lXCJcblx0fSkuYXBwZW5kVG8oJHVpW1wiYm9keVwiXSk7XG5cdGxldCAkaW5uZXJDb250YWluZXIgPSAkKFwiPGRpdiAvPlwiKS5hcHBlbmRUbygkb3V0ZXJDb250YWluZXIpO1xuXG5cdFVJLmRhdGFbXCJzY3JvbGxiYXItc2l6ZVwiXSA9ICRvdXRlckNvbnRhaW5lci53aWR0aCgpIC0gJGlubmVyQ29udGFpbmVyLndpZHRoKCk7XG5cdCRvdXRlckNvbnRhaW5lci5yZW1vdmUoKTtcbn1cblxuLy8gQXMgcHJvcHJpZWRhZGVzIGRhIGphbmVsYSBlIGRvIGxheW91dCBzw6NvIGNhbGN1bGFkYXNcbi8vIHF1YW5kbyBhIHDDoWdpbmEgw6kgY2FycmVnYWRhIGUgcXVhbmRvIGEgamFuZWxhIMOpIHJlZGltZW5zaW9uYWRhLlxuLy8gTyB0YW1hbmhvIGRhIGJhcnJhIGRlIHJvbGFnZW0gw6kgY2FsY3VsYWRvIHNvbWVudGUgcXVhbmRvIGEgcMOhZ2luYSDDqSBjYXJyZWdhZGFcbiQoZnVuY3Rpb24oKSB7IHNldExheW91dFByb3BlcnRpZXMoKTsgZ2V0U2Nyb2xsYmFyU2l6ZSgpOyB9KTtcbiR1aVtcIndpbmRvd1wiXS5vbihcInJlc2l6ZVwiLCBzZXRMYXlvdXRQcm9wZXJ0aWVzKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFByb3ByaWVkYWRlcyAocG9zacOnw6NvIG5vIHRvcG8gZSBubyBmaW0gZGEgamFuZWxhKSBkbyBzY3JvbGxcblVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl0gPSBbIF07XG5cbmZ1bmN0aW9uIHNldFNjcm9sbFBvc2l0aW9uKCkge1xuXHRVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1widG9wXCJdID0gJHVpW1wid2luZG93XCJdLnNjcm9sbFRvcCgpO1xuXHRVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1wiYm90dG9tXCJdID0gVUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXVtcInRvcFwiXSArIFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJoZWlnaHRcIl07XG59XG5cbi8vIEFzIHByb3ByaWVkYWRlcyBkbyBzY3JvbGwgc8OjbyBjYWxjdWxhZGFzIHF1YW5kbyBhIHDDoWdpbmEgw6kgY2FycmVnYWRhXG4vLyBlIHF1YW5kbyBhIGphbmVsYSDDqSByZWRpbWVuc2lvbmFkYSBvdSBcInNjcm9sbGFkYVwiXG4kKGZ1bmN0aW9uKCkgeyBzZXRTY3JvbGxQb3NpdGlvbigpOyB9KTtcbiR1aVtcIndpbmRvd1wiXS5vbihcInNjcm9sbCByZXNpemVcIiwgc2V0U2Nyb2xsUG9zaXRpb24pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdGVtcGxhdGUgZW5naW5lIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5sZXQgJHRlbXBsYXRlcyA9IHsgfTtcblxuJChmdW5jdGlvbigpIHtcblx0Ly8gUGVnYSBvcyB0ZW1wbGF0ZXMgZG8gSFRNTCxcblx0Ly8gZ3VhcmRhIGVtICR0ZW1wbGF0ZXNcblx0Ly8gZSByZW1vdmUgZWxlcyBkbyBjw7NkaWdvLWZvbnRlXG5cdCQoXCJ0ZW1wbGF0ZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdGxldCAkdGhpcyA9ICQodGhpcyk7XG5cdFx0bGV0IG5hbWUgPSAkdGhpcy5hdHRyKFwiaWRcIik7XG5cdFx0bGV0IGh0bWwgPSAkdGhpcy5odG1sKCk7XG5cblx0XHQkdGVtcGxhdGVzW25hbWVdID0gJChodG1sKTtcblx0XHQkdGhpcy5yZW1vdmUoKTtcblx0fSk7XG59KTtcblxuZnVuY3Rpb24gX19yZW5kZXIodGVtcGxhdGUsIGRhdGEpIHtcblx0Ly8gU2UgdGVtcGxhdGUgbsOjbyBleGlzdGlyLCBhYm9ydGFcblx0aWYgKCEkdGVtcGxhdGVzW3RlbXBsYXRlXSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHZhciAkcmVuZGVyID0gJHRlbXBsYXRlc1t0ZW1wbGF0ZV0uY2xvbmUoKTtcblxuXHQkcmVuZGVyLmRhdGEoZGF0YSk7XG5cblx0JC5mbi5maWxsQmxhbmtzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRibGFuayA9ICQodGhpcyk7XG5cdFx0dmFyIGZpbGwgPSAkYmxhbmsuZGF0YShcImZpbGxcIik7XG5cblx0XHR2YXIgcnVsZXMgPSBmaWxsLnNwbGl0KFwiLFwiKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcGFpciA9IHJ1bGVzW2ldLnNwbGl0KFwiOlwiKTtcblx0XHRcdHZhciBkZXN0ID0gKHBhaXJbMV0/IHBhaXJbMF0udHJpbSgpIDogXCJodG1sXCIpO1xuXHRcdFx0dmFyIHNvdXJjZSA9IChwYWlyWzFdPyBwYWlyWzFdLnRyaW0oKSA6IHBhaXJbMF0pO1xuXHRcdFx0dmFyIHZhbHVlID0gZGF0YVtzb3VyY2VdO1xuXG5cdFx0XHQvLyBUT0RPXG5cdFx0XHQvLyBzb3VyY2UgPSBzb3VyY2Uuc3BsaXQoXCIvXCIpO1xuXHRcdFx0Ly8gaWYgKHNvdXJjZS5sZW5ndGggPiAxKSB7XG5cdFx0XHQvLyBcdC8vIHZhbHVlID0gZGF0YVtzb3VyY2VbMF1dO1xuXHRcdFx0Ly8gXHQvLyBjb25zb2xlLmxvZyhzb3VyY2UsIHNvdXJjZSwgdmFsdWUpO1xuXHRcdFx0Ly8gXHQvLyBpZiAodHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHQvLyBcdFx0Zm9yICh2YXIgaiA9IDA7IGogPD0gc291cmNlLmxlbmd0aDsgaisrKSB7XG5cdFx0XHQvLyBcdFx0XHRjb25zb2xlLmxvZyh2YWx1ZSwgc291cmNlLCBkYXRhW3NvdXJjZVswXV0pO1xuXHRcdFx0Ly8gXHRcdFx0aWYgKHZhbHVlICYmIHZhbHVlW3NvdXJjZV0gJiYgc291cmNlW2pdICYmIHZhbHVlW3NvdXJjZVtqXV0pIHtcblx0XHRcdC8vIFx0XHRcdFx0dmFsdWUgPSAodmFsdWVbc291cmNlW2pdXSk/IHZhbHVlW3NvdXJjZVtqXV0gOiBudWxsO1xuXHRcdFx0Ly8gXHRcdFx0fSBlbHNlIHtcblx0XHRcdC8vIFx0XHRcdFx0dmFsdWUgPSBudWxsO1xuXHRcdFx0Ly8gXHRcdFx0fVxuXHRcdFx0Ly8gXHRcdH1cblx0XHRcdC8vIFx0Ly8gfVxuXHRcdFx0Ly8gfVxuXG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRcdGlmIChkZXN0ID09PSBcImNsYXNzXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsuYWRkQ2xhc3ModmFsdWUpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGRlc3QgPT09IFwiaHRtbFwiKSB7XG5cdFx0XHRcdFx0JGJsYW5rLmh0bWwodmFsdWUpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGRlc3QgPT09IFwidmFsdWVcIikge1xuXHRcdFx0XHRcdCRibGFuay52YWwodmFsdWUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCRibGFuay5hdHRyKGRlc3QsIHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGlmX251bGwgPSAkYmxhbmsuZGF0YShcImZpbGwtbnVsbFwiKTtcblx0XHRcdFx0aWYgKGlmX251bGwgPT09IFwiaGlkZVwiKSB7XG5cdFx0XHRcdFx0JGJsYW5rLmhpZGUoKTtcblx0XHRcdFx0fSBlbHNlIGlmKGlmX251bGwgPT09IFwicmVtb3ZlXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQkYmxhbmtcblx0XHRcdC5yZW1vdmVDbGFzcyhcImZpbGxcIilcblx0XHRcdC5yZW1vdmVBdHRyKFwiZGF0YS1maWxsXCIpXG5cdFx0XHQucmVtb3ZlQXR0cihcImRhdGEtZmlsbC1udWxsXCIpO1xuXHR9O1xuXG5cdGlmICgkcmVuZGVyLmhhc0NsYXNzKFwiZmlsbFwiKSkge1xuXHRcdCRyZW5kZXIuZmlsbEJsYW5rcygpO1xuXHR9XG5cblx0JChcIi5maWxsXCIsICRyZW5kZXIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0JCh0aGlzKS5maWxsQmxhbmtzKCk7XG5cdH0pO1xuXG5cdHJldHVybiAkcmVuZGVyO1xufVxuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcm91dGVyIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xudmFyIHJvdXRlciA9IFsgXTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbmF2aWdhdGlvbiBtb2RlXG5yb3V0ZXJbXCJwYXRoXCJdID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoXCIvXCIpO1xuXG5pZiAocm91dGVyW1wicGF0aFwiXVsxXSA9PT0gXCJ0YXJlZmFzXCIpIHtcblx0cm91dGVyW1wibmF2aWdhdGlvbi1tb2RlXCJdID0gXCJwYXRoXCI7XG59IGVsc2Uge1xuXHRyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPSBcImhhc2hcIjtcblx0cm91dGVyW1wicGF0aFwiXSA9IGxvY2F0aW9uLmhhc2guc3BsaXQoXCIvXCIpO1xufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBnb1xucm91dGVyW1wiZ29cIl0gPSBmdW5jdGlvbihwYXRoLCBvYmplY3QsIHRpdGxlKSB7XG5cdGlmIChyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPT09IFwicGF0aFwiKSB7XG5cdFx0aGlzdG9yeS5wdXNoU3RhdGUob2JqZWN0LCB0aXRsZSwgcGF0aCk7XG5cdH0gZWxzZSB7XG5cdFx0aGlzdG9yeS5wdXNoU3RhdGUob2JqZWN0LCB0aXRsZSwgXCIjXCIgKyBwYXRoKTtcblx0XHQvLyBsb2NhdGlvbi5oYXNoID0gcGF0aDtcblx0fVxufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYnVpbGQgbGlua1xucm91dGVyW1wiYnVpbGQtbGlua1wiXSA9IGZ1bmN0aW9uKHBhdGgpIHtcblx0dmFyIGxpbms7XG5cdGlmIChyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPT09IFwicGF0aFwiKSB7XG5cdFx0bGluayA9IHBhdGg7XG5cdH0gZWxzZSB7XG5cdFx0bGluayA9IFwiI1wiICsgcGF0aDtcblx0fVxuXG5cdHJldHVybiBsaW5rO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdmlldyBtYW5hZ2VyXG5yb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0gPSBbXCJob21lXCJdO1xucm91dGVyW1widmlldy1tYW5hZ2VyXCJdID0gKGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdGFkZDogZnVuY3Rpb24odmlldykge1xuXHRcdFx0cm91dGVyW1wiY3VycmVudC12aWV3XCJdLnB1c2godmlldyk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0pO1xuXHRcdH0sXG5cdFx0cmVtb3ZlOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0gPSAkLmdyZXAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLCBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgIT09IHZpZXc7XG5cdFx0XHR9KTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSk7XG5cdFx0fSxcblx0XHRyZXBsYWNlOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0gPSBbIF07XG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0uYWRkKHZpZXcpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBmdW5jdGlvbihldmVudCkge1xuXHQvLyBjb25zb2xlLmxvZyhcImxvY2F0aW9uOiBcIiArIGRvY3VtZW50LmxvY2F0aW9uICsgXCIsIHN0YXRlOiBcIiArIEpTT04uc3RyaW5naWZ5KGV2ZW50LnN0YXRlKSk7XG5cblx0dmFyIHN0YXRlID0gZXZlbnQuc3RhdGU7XG5cblx0aWYgKHN0YXRlICYmIHN0YXRlW1widmlld1wiXSA9PT0gXCJ0YXJlZmFcIikge1xuXHRcdGlmIChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0uaW5kZXhPZihcImJvdHRvbXNoZWV0XCIpID4gLTEpIHsgVUkuYm90dG9tc2hlZXQuY2xvc2UoKTsgfVxuXHRcdGlmIChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0uaW5kZXhPZihcIm5ldy1wb3N0XCIpID4gLTEpIHsgYXBwLlBvc3QuY2xvc2UoKTsgfVxuXHRcdGFwcC5UYXJlZmEub3BlbihzdGF0ZVtcImlkXCJdKTtcblx0fVxuXG5cdGVsc2UgaWYgKHN0YXRlICYmIHN0YXRlW1widmlld1wiXSA9PT0gXCJuZXctcG9zdFwiKSB7XG5cdFx0Ly8gYXBwLlBvc3Qub3BlbihzdGF0ZVtcInR5cGVcIl0sIHN0YXRlW1wiaWRcIl0pO1xuXHR9XG5cblx0ZWxzZSBpZiAoc3RhdGUgJiYgc3RhdGVbXCJ2aWV3XCJdID09PSBcImJvdHRvbXNoZWV0XCIpIHtcblx0XHRpZiAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLmluZGV4T2YoXCJuZXctcG9zdFwiKSA+IC0xKSB7IGFwcC5Qb3N0LmNsb3NlKCk7IH1cblx0fVxuXG4vL1x0aWYgKHN0YXRlW1widmlld1wiXSA9PT0gXCJob21lXCIpIHtcblx0ZWxzZSB7XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwiYm90dG9tc2hlZXRcIikgPiAtMSkgeyBVSS5ib3R0b21zaGVldC5jbG9zZSgpOyB9XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwibmV3LXBvc3RcIikgPiAtMSkgeyBhcHAuUG9zdC5jbG9zZSgpOyB9XG5cdFx0YXBwLlRhcmVmYS5jbG9zZSgpO1xuXHR9XG5cbn0pO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBzdGF0ZXM6XG4vLyAqIHRhcmVmYVxuLy8gKiBob21lXG4vLyAqIG5ldy1wb3N0XG4vLyAqIGJvdHRvbXNoZWV0XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5sZXQgVUkgPSB7IH1cblVJLmRhdGEgPSBbIF07XG5cbmxldCAkdWkgPSBbIF07XG4kdWlbXCJ3aW5kb3dcIl0gPSAkKHdpbmRvdyk7XG4kdWlbXCJib2R5XCJdID0gJChkb2N1bWVudC5ib2R5KTtcblxuXG4vLyAkdWlbXCJ3aW5kb3dcIl1cbi8vICR1aVtcInRpdGxlXCJdXG4vLyAkdWlbXCJib2R5XCJdXG4vLyAkdWlbXCJhcHBiYXJcIl1cbi8vICR1aVtcImxvYWRiYXJcIl1cbi8vICR1aVtcInNpZGVuYXZcIl1cbi8vICR1aVtcImJvdHRvbXNoZWV0XCJdXG4vLyAkdWlbXCJ0b2FzdFwiXVxuLy8gJHVpW1wiYmFja2Ryb3BcIl1cbi8vICR1aVtcImZvb3RlclwiXVxuXG4vLyBEYWRvcyBkZWZpbmlkb3M6XG4vLyBVSS5kYXRhW1wiY29sdW1uLXdpZHRoXCJdXG5cbi8vIERhZG9zIGNvbnN1bHTDoXZlaXM6XG4vLyBVSS5kYXRhW1wid2luZG93XCJdW1wid2lkdGhcIl1cbi8vIFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJoZWlnaHRcIl1cbi8vIFVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl1bXCJ0b3BcIl1cbi8vIFVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl1bXCJib3R0b21cIl1cbi8vIFVJLmRhdGFbXCJjb2x1bW5zXCJdXG4vLyBVSS5kYXRhW1wiaW50ZXJhY3Rpb24tdHlwZVwiXVxuLy8gVUkuZGF0YVtcInRoZW1lLWNvbG9yXCJdW1wib3JpZ2luYWxcIl1cbi8vIFVJLmRhdGFbXCJ0aXRsZVwiXVxuLy8gVUkuZGF0YVtcInNjcm9sbGJhci1zaXplXCJdXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBGdW7Dp8OjbyBwYXJhIGZvcsOnYXIgcmVmbG93XG4kLmZuLnJlZmxvdyA9IGZ1bmN0aW9uKCkge1xuXHRsZXQgb2Zmc2V0ID0gJHVpW1wiYm9keVwiXS5vZmZzZXQoKS5sZWZ0O1xuXHRyZXR1cm4gJCh0aGlzKTtcbn07XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvIGJvZHkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBVSS5ib2R5LmxvY2soKVxuLy8gVUkuYm9keS51bmxvY2soKVxuXG5VSS5ib2R5ID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdC8vIHVpW1wiYm9keVwiXSDDqSBkZWZpbmlkbyBubyBkb2N1bWVudC5qc1xuXHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJ1aS1cIiArIFVJLmRhdGFbXCJpbnRlcmFjdGlvbi10eXBlXCJdKTtcblx0XHRzY3JvbGxTdGF0dXMoKTtcblx0fSk7XG5cblx0JHVpW1wid2luZG93XCJdLm9uKFwic2Nyb2xsXCIsIHNjcm9sbFN0YXR1cyk7XG5cblx0ZnVuY3Rpb24gc2Nyb2xsU3RhdHVzKCkge1xuXHRcdHZhciB5ID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXG5cdFx0aWYgKHkgPiAxKSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwic2Nyb2xsLXRvcFwiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInNjcm9sbC10b3BcIik7XG5cdFx0fVxuXG5cdFx0aWYgKHkgPiA1Nikge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcImxpdmVzaXRlLWJsdXJcIikucmVtb3ZlQ2xhc3MoXCJsaXZlc2l0ZS1mb2N1c1wiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcImxpdmVzaXRlLWZvY3VzXCIpLnJlbW92ZUNsYXNzKFwibGl2ZXNpdGUtYmx1clwiKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gVUkuYm9keS5sb2NrKClcblx0XHRsb2NrOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJuby1zY3JvbGxcIikuY3NzKFwibWFyZ2luLXJpZ2h0XCIsIFVJLmRhdGFbXCJzY3JvbGxiYXItc2l6ZVwiXSk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gVUkuYm9keS51bmxvY2soKVxuXHRcdHVubG9jazogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwibm8tc2Nyb2xsXCIpLmNzcyhcIm1hcmdpbi1yaWdodFwiLCAwKTtcblx0XHR9XG5cdH07XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgLyBsb2FkYmFyIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gVUkubG9hZGJhci5zaG93KClcbi8vIFVJLmxvYWRiYXIuaGlkZSgpXG5cblVJLmxvYWRiYXIgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wibG9hZGJhclwiXSA9ICQoXCIudWktbG9hZGJhclwiKTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcImxvYWRiYXJcIl0uYWRkQ2xhc3MoXCJpblwiKTtcblx0XHR9LFxuXHRcdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGltZW91dFtcImhpZGUtbG9hZGJhclwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR1aVtcImxvYWRiYXJcIl1cblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoXCJmYWRlLWluXCIpXG5cdFx0XHRcdFx0Lm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQkdWlbXCJsb2FkYmFyXCJdLnJlbW92ZUNsYXNzKFwiaW5cIik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9LCA4MDApO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvIGJhY2tkcm9wIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBVSS5iYWNrZHJvcC5zaG93KClcbi8vIFVJLmJhY2tkcm9wLmhpZGUoKVxuXG5VSS5iYWNrZHJvcCA9IChmdW5jdGlvbigpIHtcblx0JHVpW1wiYmFja2Ryb3BcIl0gPSBbIF07XG5cblx0JChmdW5jdGlvbigpIHtcblx0XHQvLyAkdWlbXCJiYWNrZHJvcFwiXSA9ICQoXCIuanMtdWktYmFja2Ryb3BcIik7XG5cdFx0Ly8gJHVpW1wiYmFja2Ryb3BcIl0ub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcblx0XHQvLyBcdCR1aVtcImJhY2tkcm9wXCJdLnRyaWdnZXIoXCJoaWRlXCIpO1xuXHRcdC8vIH0pO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdHNob3c6IGZ1bmN0aW9uKCRzY3JlZW4sIGV2ZW50cykge1xuXHRcdFx0dmFyIHNjcmVlbiA9ICRzY3JlZW5bXCJzZWxlY3RvclwiXTtcblx0XHRcdHZhciB6aW5kZXggPSAkc2NyZWVuLmNzcyhcInotaW5kZXhcIikgLSAxO1xuXG5cdFx0XHQkdWlbXCJiYWNrZHJvcFwiXVtzY3JlZW5dID0gX19yZW5kZXIoXCJiYWNrZHJvcFwiKTtcblxuXHRcdFx0JC5lYWNoKGV2ZW50cywgZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcblx0XHRcdFx0JHVpW1wiYmFja2Ryb3BcIl1bc2NyZWVuXS5vbihldmVudCwgaGFuZGxlcilcblx0XHRcdH0pO1xuXG5cdFx0XHQkdWlbXCJiYWNrZHJvcFwiXVtzY3JlZW5dLmNzcyhcInotaW5kZXhcIiwgemluZGV4KVxuXHRcdFx0XHQub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHsgJCh0aGlzKS50cmlnZ2VyKFwiaGlkZVwiKTsgfSlcblx0XHRcdFx0LmFwcGVuZFRvKCR1aVtcImJvZHlcIl0pXG5cdFx0XHRcdC5hZGRDbGFzcyhcImluXCIpO1xuXHRcdH0sXG5cdFx0aGlkZTogZnVuY3Rpb24oJHNjcmVlbikge1xuXHRcdFx0dmFyIHNjcmVlbiA9ICRzY3JlZW5bXCJzZWxlY3RvclwiXTtcblx0XHRcdCR1aVtcImJhY2tkcm9wXCJdW3NjcmVlbl0ucmVtb3ZlQ2xhc3MoXCJpblwiKS5vZmYoXCJoaWRlXCIpLnJlbW92ZSgpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSBzaWRlbmF2IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblVJLnNpZGVuYXYgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wic2lkZW5hdlwiXSA9ICQoXCIuanMtdWktc2lkZW5hdlwiKTtcblxuXHRcdCQoXCIuanMtc2lkZW5hdi10cmlnZ2VyXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRVSS5zaWRlbmF2Lm9wZW4oKTtcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHRvcGVuOiBmdW5jdGlvbigpIHtcblx0XHRcdFVJLmJvZHkubG9jaygpO1xuXHRcdFx0VUkuYmFja2Ryb3Auc2hvdygkdWlbXCJzaWRlbmF2XCJdLCB7IFwiaGlkZVwiOiBVSS5zaWRlbmF2LmNsb3NlIH0pO1xuXHRcdFx0JHVpW1wic2lkZW5hdlwiXS5hZGRDbGFzcyhcImluXCIpO1xuXHRcdH0sXG5cdFx0Y2xvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wic2lkZW5hdlwiXS5yZW1vdmVDbGFzcyhcImluXCIpO1xuXHRcdFx0VUkuYmFja2Ryb3AuaGlkZSgkdWlbXCJzaWRlbmF2XCJdKTtcblx0XHRcdFVJLmJvZHkudW5sb2NrKCk7XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGJvdHRvbXNoZWV0XG5VSS5ib3R0b21zaGVldCA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblx0XHRvcGVuOiBmdW5jdGlvbigkY29udGVudCwgYWRkQ2xhc3MpIHtcblx0XHRcdFVJLmJhY2tkcm9wLnNob3coJHVpW1wiYm90dG9tc2hlZXRcIl0sIHsgXCJoaWRlXCI6IFVJLmJvdHRvbXNoZWV0LmNsb3NlIH0pO1xuXHRcdFx0JHVpW1wiYm90dG9tc2hlZXRcIl0uaHRtbCgkY29udGVudCkuYWRkQ2xhc3MoKGFkZENsYXNzPyBhZGRDbGFzcyArIFwiIFwiIDogXCJcIikgKyBcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIik7XG5cblx0XHRcdFVJLmRhdGFbXCJ0aGVtZS1jb2xvclwiXVtcImJ1ZmZlclwiXSA9ICR1aVtcInRoZW1lLWNvbG9yXCJdLmF0dHIoXCJjb250ZW50XCIpO1xuXHRcdFx0JHVpW1widGhlbWUtY29sb3JcIl0uYXR0cihcImNvbnRlbnRcIiwgXCIjMDAwXCIpO1xuXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0uYWRkKFwiYm90dG9tc2hlZXRcIik7XG5cdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZSh7IFwidmlld1wiOiBcImJvdHRvbXNoZWV0XCIgfSwgbnVsbCwgbnVsbCk7XG5cdFx0fSxcblx0XHRjbG9zZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJib3R0b21zaGVldFwiXS5yZW1vdmVDbGFzcyhcInNsaWRlXCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR1aVtcImJvdHRvbXNoZWV0XCJdLnJlbW92ZUNsYXNzKFwiaW5cIikuZW1wdHkoKS5hdHRyKFwiY2xhc3NcIiwgXCJ1aS1ib3R0b21zaGVldCBqcy11aS1ib3R0b21zaGVldFwiKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkdWlbXCJ0aGVtZS1jb2xvclwiXS5hdHRyKFwiY29udGVudFwiLCBVSS5kYXRhW1widGhlbWUtY29sb3JcIl1bXCJidWZmZXJcIl0pO1xuXG5cdFx0XHRVSS5iYWNrZHJvcC5oaWRlKCR1aVtcImJvdHRvbXNoZWV0XCJdKTtcblxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLnJlbW92ZShcImJvdHRvbXNoZWV0XCIpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCR1aVtcImJvdHRvbXNoZWV0XCJdID0gJChcIi5qcy11aS1ib3R0b21zaGVldFwiKTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgdG9hc3QgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5VSS50b2FzdCA9IChmdW5jdGlvbigpIHtcblx0JHVpW1widG9hc3RcIl0gPSBbIF07XG5cblx0JChmdW5jdGlvbigpIHtcblx0XHQkdWlbXCJ0b2FzdFwiXSA9ICQoXCIuanMtdWktdG9hc3RcIik7XG5cdFx0JHVpW1widG9hc3RcIl1bXCJtZXNzYWdlXCJdID0gJChcIi50b2FzdC1tZXNzYWdlXCIsICR1aVtcInRvYXN0XCJdKTtcblx0XHQkdWlbXCJ0b2FzdFwiXVtcImFjdGlvblwiXSA9ICQoXCIudG9hc3QtYWN0aW9uXCIsICR1aVtcInRvYXN0XCJdKTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHQvLyBUT0RPIG5vdmEgc2ludGF4ZSwgdXNhciB0ZW1wbGF0ZSBlIF9fcmVuZGVyXG5cdFx0c2hvdzogZnVuY3Rpb24oY29uZmlnKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNvbmZpZyA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHQkdWlbXCJ0b2FzdFwiXVtcIm1lc3NhZ2VcIl0uaHRtbChjb25maWdbXCJtZXNzYWdlXCJdKTtcblx0XHRcdFx0JHVpW1widG9hc3RcIl1bXCJhY3Rpb25cIl0uaHRtbCgoY29uZmlnW1wiYWN0aW9uXCJdPyBjb25maWdbXCJhY3Rpb25cIl0gOiBcIlwiKSk7XG5cdFx0XHRcdCR1aVtcInRvYXN0XCJdLmFkZENsYXNzKFwiaW5cIikucmVmbG93KCkuYWRkQ2xhc3MoXCJzbGlkZVwiKTtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInRvYXN0LWFjdGl2ZVwiKTtcblxuXHRcdFx0XHQvLyBUT0RPOiAuZmFiLWJvdHRvbSB0cmFuc2Zvcm06IHRyYW5zbGF0ZVlcblxuXHRcdFx0XHQkdWlbXCJ0b2FzdFwiXS5vbihcImNsaWNrXCIsIFVJLnRvYXN0LmRpc21pc3MpO1xuXHRcdFx0XHQkdWlbXCJ0b2FzdFwiXVtcImFjdGlvblwiXS5vbihcImNsaWNrXCIsIGNvbmZpZ1tcImNhbGxiYWNrXCJdKTtcblxuXHRcdFx0XHRjbGVhclRpbWVvdXQodGltZW91dFtcInRvYXN0XCJdKTtcblxuXHRcdFx0XHRpZiAoIWNvbmZpZ1tcInBlcnNpc3RlbnRcIl0pIHtcblx0XHRcdFx0XHQkdWlbXCJ0b2FzdFwiXS5yZW1vdmVDbGFzcyhcInN0cmVhbS1vbmx5XCIpO1xuXHRcdFx0XHRcdHRpbWVvdXRbXCJ0b2FzdFwiXSA9IHNldFRpbWVvdXQoVUkudG9hc3QuZGlzbWlzcywgKGNvbmZpZ1tcInRpbWVvdXRcIl0/IGNvbmZpZ1tcInRpbWVvdXRcIl0gOiA2MDAwKSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JHVpW1widG9hc3RcIl0uYWRkQ2xhc3MoXCJzdHJlYW0tb25seVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0VUkudG9hc3Quc2hvdyh7XG5cdFx0XHRcdFx0XCJtZXNzYWdlXCI6IGNvbmZpZ1xuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRkaXNtaXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcInRvYXN0XCJdLnJlbW92ZUNsYXNzKFwic2xpZGVcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInRvYXN0LWFjdGl2ZVwiKTtcblx0XHRcdFx0JHVpW1widG9hc3RcIl0ucmVtb3ZlQ2xhc3MoXCJpbiBzdHJlYW0tb25seVwiKTtcblxuXHRcdFx0XHQkdWlbXCJ0b2FzdFwiXVtcIm1lc3NhZ2VcIl0uZW1wdHkoKTtcblx0XHRcdFx0JHVpW1widG9hc3RcIl1bXCJhY3Rpb25cIl0uZW1wdHkoKTtcblx0XHRcdH0pO1xuXHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXRbXCJ0b2FzdFwiXSk7XG5cdFx0fSxcblxuXHRcdC8vIFRPRE8gREVQUkVDQVRFRFxuXHRcdG9wZW46IGZ1bmN0aW9uKG1lc3NhZ2UsIGFjdGlvbiwgY2FsbGJhY2ssIHBlcnNpc3RlbnQpIHtcblx0XHQvLyBvcGVuOiBmdW5jdGlvbihtZXNzYWdlLCBhZGRDbGFzcykge1xuXHRcdFx0JHVpW1widG9hc3RcIl0ubWVzc2FnZS5odG1sKG1lc3NhZ2UpO1xuXHRcdFx0JHVpW1widG9hc3RcIl0uYWN0aW9uLmh0bWwoKGFjdGlvbj8gYWN0aW9uIDogXCJcIikpO1xuXHRcdFx0JHVpW1widG9hc3RcIl0uYWRkQ2xhc3MoXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlXCIpO1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInRvYXN0LWFjdGl2ZVwiKTtcblxuXHRcdFx0Ly8gVE9ETzogLmZhYi1ib3R0b20gdHJhbnNmb3JtOiB0cmFuc2xhdGVZXG5cblx0XHRcdCR1aVtcInRvYXN0XCJdLm9uKFwiY2xpY2tcIiwgVUkudG9hc3QuZGlzbWlzcyk7XG5cdFx0XHQkdWlbXCJ0b2FzdFwiXS5hY3Rpb24ub24oXCJjbGlja1wiLCBjYWxsYmFjayk7XG5cblx0XHRcdGNsZWFyVGltZW91dCh0aW1lb3V0W1widG9hc3RcIl0pO1xuXG5cdFx0XHRpZiAoIXBlcnNpc3RlbnQpIHtcblx0XHRcdFx0JHVpW1widG9hc3RcIl0ucmVtb3ZlQ2xhc3MoXCJzdHJlYW0tb25seVwiKTtcblx0XHRcdFx0dGltZW91dFtcInRvYXN0XCJdID0gc2V0VGltZW91dChVSS50b2FzdC5kaXNtaXNzLCA2NTAwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCR1aVtcInRvYXN0XCJdLmFkZENsYXNzKFwic3RyZWFtLW9ubHlcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufSkoKTtcblxuLy8gdmFyIHRvYXN0ID0gVUkudG9hc3Q7XG4vLyB0b2FzdC5jbG9zZSA9IFVJLnRvYXN0LmRpc21pc3M7XG5cbi8vIHZhciBzbmFja2JhciA9IHRvYXN0O1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBpIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBUT0RPIGxlZ2FjeSAoZGV2ZSBmaWNhciBzw7MgZGVudHJvIGRhIGZ1bsOnw6NvIGFiYWl4bylcbmxldCBhcGlfa2V5ID0gXCIwNjNjNzJiMmFmYzUzMzNmM2IyN2IzNjZiZGFjOWViODFkNjRiYzZhMTJjZDdiM2Y0YjZhZGU3N2EwOTJiNjNhXCI7XG5cbmNvbnN0IExpc3RhQVBJID0gKGVuZHBvaW50LCBkYXRhKSA9PiB7XG5cdGxvZyhcIkFQSSBSZXF1ZXN0OiBcIiArIGVuZHBvaW50LCBcImluZm9cIik7XG5cdGxldCBhcGlfdXJsID0gXCJodHRwczovL2FwaS5sYWd1aW5oby5vcmcvbGlzdGEvXCIgKyBlZGljYW87XG5cdGxldCBhcGlfa2V5ID0gXCIwNjNjNzJiMmFmYzUzMzNmM2IyN2IzNjZiZGFjOWViODFkNjRiYzZhMTJjZDdiM2Y0YjZhZGU3N2EwOTJiNjNhXCI7XG5cblx0bGV0IHJlcXVlc3QgPSAkLmdldEpTT04oYXBpX3VybCArIGVuZHBvaW50ICsgXCI/a2V5PVwiICsgYXBpX2tleSArIFwiJmNhbGxiYWNrPT9cIiwgZGF0YSk7XG5cdHJldHVybiByZXF1ZXN0O1xufTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHBsYWNhciAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuYXBwLlBsYWNhciA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQkdWlbXCJwbGFjYXJcIl0gPSAkKFwiLmpzLWFwcC1wbGFjYXIgPiB1bFwiKTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHR1cGRhdGU6IGZ1bmN0aW9uKHR1cm1hcykge1xuXHRcdFx0Ly8gY29uZmVyZSBxdWFsIGEgdHVybWEgY29tIG1haW9yIHBvbnR1YcOnw6NvXG5cdFx0XHQvLyBlIHNvbWEgYSBwb250dWHDp8OjbyBkZSBjYWRhIHR1cm1hIHBhcmEgb2J0ZXIgbyB0b3RhbCBkZSBwb250b3Ncblx0XHRcdHZhciBtYWlvcl9wb250dWFjYW8gPSAwO1xuXHRcdFx0dmFyIHRvdGFsX2RlX3BvbnRvcyA9IDA7XG5cblx0XHRcdGZvciAodmFyIHR1cm1hIGluIHR1cm1hcykge1xuXHRcdFx0XHR2YXIgcG9udHVhY2FvX2RhX3R1cm1hID0gdHVybWFzW3R1cm1hXVtcInBvbnRvc1wiXTtcblxuXHRcdFx0XHRpZiAocG9udHVhY2FvX2RhX3R1cm1hID4gbWFpb3JfcG9udHVhY2FvKSB7XG5cdFx0XHRcdFx0bWFpb3JfcG9udHVhY2FvID0gcG9udHVhY2FvX2RhX3R1cm1hO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dG90YWxfZGVfcG9udG9zICs9IHBvbnR1YWNhb19kYV90dXJtYTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gbGltcGEgbyBwbGFjYXJcblx0XHRcdCR1aVtcInBsYWNhclwiXS5lbXB0eSgpO1xuXG5cdFx0XHQvLyBhZGljaW9uYSBjYWRhIHR1cm1hIG5vIHBsYWNhclxuXHRcdFx0JC5lYWNoKHR1cm1hcywgZnVuY3Rpb24oaW5kZXgsIHR1cm1hKSB7XG5cdFx0XHRcdC8vIGNhbGN1bGEgJSBkYSB0dXJtYSBlbSByZWxhw6fDo28gYW8gdG90YWwgZGUgcG9udG9zXG5cdFx0XHRcdHZhciBwZXJjZW50dWFsX2RhX3R1cm1hID0gKHRvdGFsX2RlX3BvbnRvcyA+IDA/IHR1cm1hW1wicG9udG9zXCJdIC8gbWFpb3JfcG9udHVhY2FvIDogMCk7XG5cblx0XHRcdFx0Ly8gZm9ybWF0YSBvcyBkYWRvc1xuXHRcdFx0XHR0dXJtYVtcImxhcmd1cmEtZGEtYmFycmFcIl0gPSBcIndpZHRoOiBcIiArIChwZXJjZW50dWFsX2RhX3R1cm1hICogMTAwKS50b0ZpeGVkKDMpICsgXCIlO1wiO1xuXHRcdFx0XHR0dXJtYVtcInR1cm1hLWZvcm1hdGFkYVwiXSA9IHR1cm1hW1widHVybWFcIl0udG9VcHBlckNhc2UoKTtcblx0XHRcdFx0dHVybWFbXCJwb250b3NcIl0gPSB0dXJtYVtcInBvbnRvc1wiXTtcblx0XHRcdFx0dHVybWFbXCJwb250dWFjYW8tZm9ybWF0YWRhXCJdID0gdHVybWFbXCJwb250b3NcIl0udG9TdHJpbmcoKS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIi5cIik7XG5cblx0XHRcdFx0Ly8gcmVuZGVyaXphIGUgY29sb2NhIG5hIHDDoWdpbmFcblx0XHRcdFx0dmFyICR0dXJtYSA9IF9fcmVuZGVyKFwicGxhY2FyLXR1cm1hXCIsIHR1cm1hKTtcblx0XHRcdFx0JHVpW1wicGxhY2FyXCJdLmFwcGVuZCgkdHVybWEpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmICh0b3RhbF9kZV9wb250b3MgPT09IDApIHtcblx0XHRcdFx0JHVpW1wicGxhY2FyXCJdLnBhcmVudCgpLmFkZENsYXNzKFwiemVyb2VkXCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JHVpW1wicGxhY2FyXCJdLnBhcmVudCgpLnJlbW92ZUNsYXNzKFwiemVyb2VkXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcCBldm9sdcOnw6NvIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBwLkV2b2x1Y2FvLnN0YXJ0KClcbi8vIGFwcC5Fdm9sdWNhby51cGRhdGUoKVxuXG4vLyBUT0RPXG4vLyAtIG1vc3RyYXIgY29udGFkb3IgbmFzIMO6bHRpbWFzIDQ4IGhvcmFzXG4vLyAtIG8gcXVlIGFjb250ZWNlIGRlcG9pcyBkbyBlbmNlcnJhbWVudG8/XG4vLyAgIC0gYmFycmEgZmljYSBkYSBjb3IgZGEgdHVybWEgZSBhcGFyZWNlIG1lbnNhZ2VtIGVtIGNpbWEgXCJFQzEgY2FtcGXDo1wiXG5cbmFwcC5Fdm9sdWNhbyA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQkdWlbXCJldm9sdWNhb1wiXSA9ICQoXCIuYXBwLWV2b2x1Y2FvXCIpO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkV2b2x1Y2FvLnN0YXJ0KClcblx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRsb2coXCJhcHAuRXZvbHVjYW8uc3RhcnRcIiwgXCJpbmZvXCIpO1xuXG5cdFx0XHQvLyBwZWdhIGRhdGEgZGUgaW7DrWNpbyBlIGRhdGEgZGUgZW5jZXJyYW1lbnRvXG5cdFx0XHRsZXQgZGlhX2luaWNpYWwgPSBMaXN0YS5FZGljYW9bXCJpbmljaW9cIl0gPSBtb21lbnQoTGlzdGEuRWRpY2FvW1wiaW5pY2lvXCJdKTtcblx0XHRcdGxldCBkaWFfZmluYWwgPSBMaXN0YS5FZGljYW9bXCJmaW1cIl0gPSBtb21lbnQoTGlzdGEuRWRpY2FvW1wiZmltXCJdKTtcblxuXHRcdFx0Ly8gbGV0IGRpYV9pbmljaWFsID0gTGlzdGEuRWRpY2FvW1wiaW5pY2lvXCJdO1xuXHRcdFx0Ly8gbGV0IGRpYV9maW5hbCA9IExpc3RhLkVkaWNhb1tcImZpbVwiXTtcblxuXHRcdFx0Ly8gY2FsY3VsYSBvIHRlbXBvIHRvdGFsIChlbSBtaW51dG9zKVxuXHRcdFx0bGV0IGR1cmFjYW9fdG90YWwgPSBMaXN0YS5FZGljYW9bXCJkdXJhY2FvLWVtLW1pbnV0b3NcIl0gPSBkaWFfZmluYWwuZGlmZihkaWFfaW5pY2lhbCwgXCJtaW51dGVzXCIpO1xuXG5cdFx0XHQvLyBpbnNlcmUgb3MgZGlhcyBuYSBiYXJyYSwgaW5kbyBkZSBkaWEgZW0gZGlhIGF0w6kgY2hlZ2FyIGFvIGVuY2VycmFtZW50b1xuXHRcdFx0Zm9yIChsZXQgZGlhID0gZGlhX2luaWNpYWwuY2xvbmUoKTsgZGlhLmlzQmVmb3JlKGRpYV9maW5hbCk7IGRpYS5hZGQoMSwgXCJkYXlzXCIpKSB7XG5cdFx0XHRcdC8vIGRlZmluZSBpbsOtY2lvIGUgZmluYWwgZG8gZGlhLlxuXHRcdFx0XHQvLyBzZSBmaW5hbCBmb3IgYXDDs3MgYSBkYXRhIGRlIGVuY2VycmFtZW50bywgdXNhIGVsYSBjb21vIGZpbmFsXG5cdFx0XHRcdGxldCBpbmljaW9fZG9fZGlhID0gZGlhO1xuXHRcdFx0XHRsZXQgZmluYWxfZG9fZGlhID0gZGlhLmNsb25lKCkuZW5kT2YoXCJkYXlcIik7XG5cdFx0XHRcdGlmIChmaW5hbF9kb19kaWEuaXNBZnRlcihkaWFfZmluYWwpKSB7XG5cdFx0XHRcdFx0ZmluYWxfZG9fZGlhID0gZGlhX2ZpbmFsO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gY2FsY3VsYSBhIGR1cmHDp8OjbyBkbyBkaWEgZW0gbWludXRvc1xuXHRcdFx0XHRsZXQgZHVyYWNhb19kb19kaWEgPSBmaW5hbF9kb19kaWEuZGlmZihpbmljaW9fZG9fZGlhLCBcIm1pbnV0ZXNcIik7XG5cblx0XHRcdFx0Ly8gZGVmaW5lIGEgZHVyYcOnw6NvIHBlcmNlbnR1YWwgZG8gZGlhIGVtIHJlbGHDp8OjbyBhbyB0b3RhbFxuXHRcdFx0XHRsZXQgcGVyY2VudHVhbF9kb19kaWEgPSBkdXJhY2FvX2RvX2RpYSAvIGR1cmFjYW9fdG90YWw7XG5cblx0XHRcdFx0Ly8gY2FsY3VsYSBhIGxhcmd1cmEgZG8gZGlhIChkZSBhY29yZG8gY29tIGR1cmHDp8OjbyBwZXJjZW50dWFsKVxuXHRcdFx0XHQvLyBlIGluc2VyZSBkaWEgbmEgYmFycmEgZGUgZXZvbHXDp8Ojb1xuXHRcdFx0XHRsZXQgbGFyZ3VyYV9kb19kaWEgPSAocGVyY2VudHVhbF9kb19kaWEgKiAxMDApLnRvRml4ZWQoMyk7XG5cdFx0XHRcdGxldCAkZGlhID0gX19yZW5kZXIoXCJldm9sdWNhby1kaWFcIiwge1xuXHRcdFx0XHRcdGRpYTogZGlhLmZvcm1hdChcImRkZFwiKVxuXHRcdFx0XHR9KS5jc3MoXCJ3aWR0aFwiLCBsYXJndXJhX2RvX2RpYSArIFwiJVwiKTtcblxuXHRcdFx0XHQkKFwiLmRheS1sYWJlbHNcIiwgJHVpW1wiZXZvbHVjYW9cIl0pLmFwcGVuZCgkZGlhKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gY29tIG9zIGRpYXMgaW5zZXJpZG9zIG5hIGJhcnJhIGRlIGV2b2x1w6fDo28sXG5cdFx0XHQvLyBkZXNlbmhhIGEgYmFycmEgZGUgdGVtcG8gdHJhbnNjb3JyaWRvXG5cdFx0XHRzZXRUaW1lb3V0KGFwcC5Fdm9sdWNhby51cGRhdGUsIDEwMDApO1xuXG5cdFx0XHQvLyBhdHVhbGl6YSBhIGxpbmhhIGRlIGV2b2x1w6fDo28gYSBjYWRhIFggbWludXRvc1xuXHRcdFx0dGltZW91dFtcImV2b2x1Y2FvXCJdID0gc2V0SW50ZXJ2YWwoYXBwLkV2b2x1Y2FvLnVwZGF0ZSwgNjAgKiAxMDAwKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuRXZvbHVjYW8udXBkYXRlKClcblx0XHR1cGRhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9nKFwiYXBwLkV2b2x1Y2FvLnVwZGF0ZVwiLCBcImluZm9cIik7XG5cblx0XHRcdC8vIHBlZ2EgYXMgZGF0YXMgZSBjYWxjdWxhIG8gdGVtcG8gKGVtIG1pbnV0b3MpIGUgcGVyY2VudHVhbCB0cmFuc2NvcnJpZG9zXG5cdFx0XHRsZXQgYWdvcmEgPSBtb21lbnQoKTtcblx0XHRcdGxldCBkaWFfaW5pY2lhbCA9IExpc3RhLkVkaWNhb1tcImluaWNpb1wiXTtcblx0XHRcdGxldCBkaWFfZmluYWwgPSBMaXN0YS5FZGljYW9bXCJmaW1cIl07XG5cdFx0XHRsZXQgZHVyYWNhb190b3RhbCA9IExpc3RhLkVkaWNhb1tcImR1cmFjYW8tZW0tbWludXRvc1wiXTtcblxuXHRcdFx0bGV0IHRlbXBvX3RyYW5zY29ycmlkbyA9IGFnb3JhLmRpZmYoZGlhX2luaWNpYWwsIFwibWludXRlc1wiKTtcblx0XHRcdGxldCBwZXJjZW50dWFsX3RyYW5zY29ycmlkbyA9ICh0ZW1wb190cmFuc2NvcnJpZG8gPCBkdXJhY2FvX3RvdGFsID8gdGVtcG9fdHJhbnNjb3JyaWRvIC8gZHVyYWNhb190b3RhbCA6IDEpO1xuXG5cdFx0XHQvLyBkZWZpbmUgYSBsYXJndXJhIGRhIGJhcnJhIGRlIGV2b2x1w6fDo28gY29tcGxldGEgaWd1YWwgw6AgbGFyZ3VyYSBkYSB0ZWxhXG5cdFx0XHQvLyBkZXBvaXMsIG1vc3RyYSBhcGVuYXMgbyBwZXJjZW50dWFsIHRyYW5zY29ycmlkb1xuXHRcdFx0JChcIi5lbGFwc2VkLXRpbWUgLmJhclwiLCAkdWlbXCJldm9sdWNhb1wiXSkuY3NzKFwid2lkdGhcIiwgVUkuZGF0YVtcIndpbmRvd1wiXVtcIndpZHRoXCJdKTtcblxuXHRcdFx0bGV0IGxhcmd1cmFfZGFfYmFycmEgPSAocGVyY2VudHVhbF90cmFuc2NvcnJpZG8gKiAxMDApLnRvRml4ZWQoMyk7XG5cdFx0XHQkKFwiLmVsYXBzZWQtdGltZVwiLCAkdWlbXCJldm9sdWNhb1wiXSkuY3NzKFwid2lkdGhcIiwgbGFyZ3VyYV9kYV9iYXJyYSArIFwiJVwiKTtcblx0XHR9XG5cdH1cbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBsaXN0YSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhcHAuTGlzdGEubG9hZCgpXG4vLyBhcHAuTGlzdGEubGF5b3V0KClcbi8vIGFwcC5MaXN0YS5zb3J0KClcblxuYXBwLkxpc3RhID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCRhcHBbXCJsaXN0YVwiXSA9ICQoXCIuYXBwLWxpc3RhXCIpO1xuXG5cdFx0JGFwcFtcImxpc3RhXCJdLmlzb3RvcGUoe1xuXHRcdFx0XCJpdGVtU2VsZWN0b3JcIjogXCIuY2FyZC10YXJlZmFcIixcblx0XHRcdFwidHJhbnNpdGlvbkR1cmF0aW9uXCI6IFwiLjhzXCIsXG5cdFx0XHRcImdldFNvcnREYXRhXCI6IHtcblx0XHRcdFx0XCJkYXRlXCI6IFwiLmxhc3QtbW9kaWZpZWRcIixcblx0XHRcdFx0XCJ0YXJlZmFcIjogZnVuY3Rpb24oZWxlbWVudCkge1xuXHRcdFx0XHRcdHJldHVybiBwYXJzZUludCgkKGVsZW1lbnQpLmRhdGEoXCJ0YXJlZmFcIiksIDEwKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdFwic29ydEFzY2VuZGluZ1wiOiB7XG5cdFx0XHRcdFwiZGF0ZVwiOiBmYWxzZSxcblx0XHRcdFx0XCJ0YXJlZmFcIjogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdFwic29ydEJ5XCI6IFtcImRhdGVcIiwgXCJ0YXJlZmFcIl0sXG5cdFx0XHRcIm1hc29ucnlcIjoge1xuXHRcdFx0XHRcImd1dHRlclwiOiAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPT09IDE/IDggOiAxNilcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdCRhcHBbXCJsaXN0YVwiXS5vbihcImNsaWNrXCIsIFwiLmNhcmQtdGFyZWZhOm5vdCguZmFudGFzbWEpXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRpZiAoZXZlbnQud2hpY2ggPT09IDEpIHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0XHRsZXQgJGNhcmQgPSAkKHRoaXMpO1xuXHRcdFx0XHRsZXQgbnVtZXJvID0gJGNhcmQuZGF0YShcInRhcmVmYVwiKTtcblx0XHRcdFx0YXBwLlRhcmVmYS5vcGVuKG51bWVybywgJGNhcmQsIHRydWUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxpc3RhLnN0YXJ0KClcblx0XHRzdGFydDogZnVuY3Rpb24oKSB7XG5cdFx0XHRsb2coXCJhcHAuTGlzdGEuc3RhcnRcIiwgXCJpbmZvXCIpO1xuXG5cdFx0XHQvLyBmYXogYXMgYWx0ZXJhw6fDtWVzIGRlIGFjb3JkbyBjb20gbyBzdGF0dXNcblx0XHRcdC8vIGluc2VyZSBhcyBtZW5zYWdlbnNcblx0XHRcdGFwcC5MaXN0YS5zdGF0dXMoKTtcblx0XHRcdGFwcC5MaXN0YS5tZXNzYWdlcygpO1xuXHRcdFx0YXBwLkxpc3RhLnRhcmVmYXMoKTtcblxuXG5cblx0XHRcdC8vIHRpcmEgYSB0ZWxhIGRlIGxvYWRpbmdcblx0XHRcdFVJLmxvYWRiYXIuaGlkZSgpO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5MaXN0YS5zdGF0dXMoKVxuXHRcdHN0YXR1czogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBzZSBwcmF6byBkZSBwb3N0YWdlbSBlc3RpdmVyIGVuY2VycmFkbywgaW5zZXJlIGNsYXNzZSBubyA8Ym9keT5cblx0XHRcdGlmIChtb21lbnQoKS5pc0FmdGVyKExpc3RhLkVkaWNhb1tcImZpbVwiXSkpIHtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInBvc3RhZ2Vucy1lbmNlcnJhZGFzXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBzZSBhIGVkacOnw6NvIGVzdGl2ZXIgZW5jZXJyYWRhLCBpbnNlcmUgY2xhc3NlIG5vIDxib2R5PlxuXHRcdFx0Ly8gZSBwYXJhIGRlIGF0dWFsaXphciBhdXRvbWF0aWNhbWVudGVcblx0XHRcdGlmIChMaXN0YS5FZGljYW9bXCJlbmNlcnJhZGFcIl0gPT09IHRydWUpIHtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcImVkaWNhby1lbmNlcnJhZGFcIik7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwodXBkYXRlX2ludGVydmFsKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEubWVzc2FnZXMoKVxuXHRcdG1lc3NhZ2VzOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIHNlIHRpdmVyIHTDrXR1bG8gZXNwZWNpZmljYWRvLCBpbnNlcmUgZWxlXG5cdFx0XHRpZiAoTGlzdGEuRWRpY2FvW1wibWVuc2FnZW1cIl1bXCJ0aXR1bG9cIl0pIHtcblx0XHRcdFx0bGV0IHBhZ2VfdGl0bGUgPSBMaXN0YS5FZGljYW9bXCJtZW5zYWdlbVwiXVtcInRpdHVsb1wiXTtcblx0XHRcdFx0JHVpW1widGl0bGVcIl0uaHRtbChwYWdlX3RpdGxlKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gZGUgdGl2ZXIgbWVuc2FnZW0gZGUgcm9kYXDDqSBlc3BlY2lmaWNhZGEsIGluc2VyZSBlbGFcblx0XHRcdGlmIChMaXN0YS5FZGljYW9bXCJtZW5zYWdlbVwiXVtcInJvZGFwZVwiXSkge1xuXHRcdFx0XHRsZXQgY2xvc2luZ19tZXNzYWdlID0gTGlzdGEuRWRpY2FvW1wibWVuc2FnZW1cIl1bXCJyb2RhcGVcIl07XG5cdFx0XHRcdCQoXCIuanMtbWVuc2FnZW0tZmluYWxcIikuaHRtbChjbG9zaW5nX21lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5MaXN0YS50YXJlZmFzKClcblx0XHR0YXJlZmFzOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIG1vc3RyYSBvIGxvYWRpbmcgZSBsaW1wYSBhIGxpc3RhIHBhcmEgY29tZcOnYXIgZG8gemVyb1xuXHRcdFx0Ly8gVUkubG9hZGluZy5zaG93KCk7XG5cdFx0XHQkYXBwW1wibGlzdGFcIl0uZW1wdHkoKTtcblxuXHRcdFx0Ly8gaW5zZXJlIGFzIHRhcmVmYXNcblx0XHRcdGZvciAobGV0IHRhcmVmYSBvZiBMaXN0YS5UYXJlZmFzKSB7XG5cdFx0XHRcdC8vIEluc2VyZSBubyBjYWNoZVxuXHRcdFx0XHRjYWNoZVtcInRhcmVmYXNcIl1bdGFyZWZhW1wibnVtZXJvXCJdXSA9IHRhcmVmYTtcblxuXHRcdFx0XHQvLyBDcmlhIG8gbGluayBwYXJhIGEgdGFyZWZhXG5cdFx0XHRcdHRhcmVmYVtcInVybFwiXSA9IHJvdXRlcltcImJ1aWxkLWxpbmtcIl0oXCIvdGFyZWZhcy9cIiArIHRhcmVmYVtcIm51bWVyb1wiXSk7XG5cblx0XHRcdFx0Ly8gU2UgdGl2ZXIgaW1hZ2VtLCBhanVzdGEgYXMgZGltZW5zb2VzXG5cdFx0XHRcdGlmICh0YXJlZmFbXCJpbWFnZW1cIl0pIHtcblx0XHRcdFx0XHR0YXJlZmFbXCJpbWFnZW0vdXJsXCJdID0gdGFyZWZhW1wiaW1hZ2VtXCJdW1widXJsXCJdO1xuXHRcdFx0XHRcdHRhcmVmYVtcImltYWdlbS9hc3BlY3RvXCJdID0gXCJwYWRkaW5nLXRvcDogXCIgKyAodGFyZWZhW1wiaW1hZ2VtXCJdW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0ICR0YXJlZmEgPSBfX3JlbmRlcihcImNhcmQtdGFyZWZhXCIsIHRhcmVmYSkuZGF0YSh7XG5cdFx0XHRcdFx0XCJ0YXJlZmFcIjogdGFyZWZhW1wibnVtZXJvXCJdLFxuXHRcdFx0XHRcdFwibGFzdC1tb2RpZmllZFwiOiAodGFyZWZhW1widWx0aW1hLXBvc3RhZ2VtXCJdPyBtb21lbnQodGFyZWZhW1widWx0aW1hLXBvc3RhZ2VtXCJdKS5mb3JtYXQoXCJYXCIpIDogMClcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gcG9zdHNcblx0XHRcdFx0bGV0ICRncmlkID0gJChcIi50YXJlZmEtY29udGV1ZG8gLmdyaWRcIiwgJHRhcmVmYSk7XG5cblx0XHRcdFx0aWYgKHRhcmVmYVtcInBvc3RzXCJdICYmIHRhcmVmYVtcInBvc3RzXCJdLmxlbmd0aCkge1xuXHRcdFx0XHRcdHZhciB0b3RhbF9wb3N0cyA9IHRhcmVmYVtcInBvc3RzXCJdLmxlbmd0aDtcblx0XHRcdFx0XHQvLyB2YXIgdG90YWxfbWVkaWEgPSB0YXJlZmFbXCJwb3N0c1wiXS5yZWR1Y2UoKHRvdGFsLCBwb3N0KSA9PiB0b3RhbCArIHBvc3RbXCJtaWRpYVwiXS5sZW5ndGgsIDApO1xuXHRcdFx0XHRcdC8vIHZhciBtYXhfbWVkaWFfdG9fc2hvdyA9IChVSS5kYXRhW1wiY29sdW1uc1wiXSA8IDI/IDkgOiA4KTtcblx0XHRcdFx0XHR2YXIgbWF4X21lZGlhX3RvX3Nob3cgPSA4O1xuXHRcdFx0XHRcdHZhciBzaG93bl9tZWRpYV9jb3VudCA9IDA7XG5cblx0XHRcdFx0XHR2YXIgcG9zdF90eXBlc193aXRoX2ltYWdlX3ByZXZpZXcgPSBbXCJpbWFnZW1cIiwgXCJ5b3V0dWJlXCIsIFwidmltZW9cIiwgXCJ2aW5lXCIsIFwiZ2lmXCJdO1xuXHRcdFx0XHRcdHZhciBwb3N0X3R5cGVzX3dpdGhfdGV4dF9wcmV2aWV3ID0gW1widGV4dG9cIl07XG5cblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsX3Bvc3RzOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciBwb3N0ID0gdGFyZWZhW1wicG9zdHNcIl1baV07XG5cblx0XHRcdFx0XHRcdGlmICgocG9zdFtcIm1pZGlhXCJdIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidGV4dG9cIikgJiYgKHNob3duX21lZGlhX2NvdW50IDwgbWF4X21lZGlhX3RvX3Nob3cpKSB7XG5cdFx0XHRcdFx0XHRcdHNob3duX21lZGlhX2NvdW50Kys7XG5cblx0XHRcdFx0XHRcdFx0dmFyIHRpbGVfdHlwZTtcblx0XHRcdFx0XHRcdFx0dmFyIG1lZGlhID0geyB9O1xuXG5cdFx0XHRcdFx0XHRcdC8vIGltYWdlbVxuXHRcdFx0XHRcdFx0XHRpZiAocG9zdF90eXBlc193aXRoX2ltYWdlX3ByZXZpZXcuaW5kZXhPZihwb3N0W1widGlwb1wiXSkgPiAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdHRpbGVfdHlwZSA9IFwidGlsZS1pbWFnZVwiO1xuXG5cdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJjb3VudFwiXSA9IHNob3duX21lZGlhX2NvdW50O1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwieW91dHViZVwiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidmltZW9cIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbmVcIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcImdpZlwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcInByZXZpZXdcIl0gPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybCgnXCIgKyBwb3N0W1wibWlkaWFcIl1bMF1bXCJ0aHVtYm5haWxcIl0gKyBcIicpO1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJtb2RpZmllclwiXSA9IFwidmlkZW9cIjtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHBvc3RbXCJtaWRpYVwiXSAmJiBwb3N0W1wibWlkaWFcIl1bMF0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wicHJldmlld1wiXSA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCdcIiArIHBvc3RbXCJtaWRpYVwiXVswXVtcImNhbWluaG9cIl0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRwb3N0W1wibWlkaWFcIl1bMF1bXCJhcnF1aXZvc1wiXVswXSArIFwiJyk7XCI7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2VcblxuXHRcdFx0XHRcdFx0XHQvLyB0ZXh0b1xuXHRcdFx0XHRcdFx0XHRpZiAocG9zdF90eXBlc193aXRoX3RleHRfcHJldmlldy5pbmRleE9mKHBvc3RbXCJ0aXBvXCJdKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGlsZV90eXBlID0gXCJ0aWxlLXRleHRcIjtcblx0XHRcdFx0XHRcdFx0XHRtZWRpYSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFwicHJldmlld1wiOiBwb3N0W1wibGVnZW5kYVwiXS5zdWJzdHJpbmcoMCwgMTIwKSxcblx0XHRcdFx0XHRcdFx0XHRcdFwiY291bnRcIjogc2hvd25fbWVkaWFfY291bnRcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKChzaG93bl9tZWRpYV9jb3VudCA9PT0gbWF4X21lZGlhX3RvX3Nob3cpICYmICgodG90YWxfcG9zdHMgLSBzaG93bl9tZWRpYV9jb3VudCkgPiAwKSkge1xuXHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wibW9kaWZpZXJcIl0gPSBcIm1vcmVcIjtcblx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vcmVcIl0gPSBcIismdGhpbnNwO1wiICsgKHRvdGFsX3Bvc3RzIC0gc2hvd25fbWVkaWFfY291bnQgKyAxKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHZhciAkdGlsZSA9IF9fcmVuZGVyKHRpbGVfdHlwZSwgbWVkaWEpLmFwcGVuZFRvKCRncmlkKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBzZSBuw6NvIHRpdmVyIG5lbmh1bSBwb3N0LCByZW1vdmUgbyBncmlkXG5cdFx0XHRcdFx0JChcIi50YXJlZmEtY29udGV1ZG9cIiwgJHRhcmVmYSkucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBTZSBmb3IgcHJldmlld1xuXHRcdFx0XHRpZiAodGFyZWZhW1wicHJldmlld1wiXSkge1xuXHRcdFx0XHRcdCR0YXJlZmEuYWRkQ2xhc3MoXCJmYW50YXNtYVwiKTtcblx0XHRcdFx0XHQkKFwiYVwiLCAkdGFyZWZhKS5yZW1vdmVBdHRyKFwiaHJlZlwiKTtcblx0XHRcdFx0XHQkKFwiLnRhcmVmYS1jb3Jwb1wiLCAkdGFyZWZhKS5yZW1vdmUoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCRhcHBbXCJsaXN0YVwiXS5hcHBlbmQoJHRhcmVmYSkuaXNvdG9wZShcImFwcGVuZGVkXCIsICR0YXJlZmEpO1xuXHRcdFx0fVxuXG5cdFx0XHRhcHAuTGlzdGEubGF5b3V0KCk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxpc3RhLmxvYWQoKVxuXHRcdGxvYWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gbW9zdHJhIGEgdGVsYSBkZSBsb2FkaW5nIGUgbGltcGEgbyBzdHJlYW1cblx0XHRcdCRzdHJlYW0ubG9hZGluZy5hZGRDbGFzcyhcImZhZGUtaW4gaW5cIik7XG5cblx0XHRcdC8vIGNhcnJlZ2Egb3MgZGFkb3MgZGEgQVBJXG5cdFx0XHQkLmdldEpTT04oXCJodHRwczovL2FwaS5sYWd1aW5oby5vcmcvbGlzdGEvXCIgKyBlZGljYW8gKyBcIi90dWRvP2tleT1cIiArIGFwaV9rZXkgKyBcIiZjYWxsYmFjaz0/XCIpLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHQvLyBcIkRJUkVUT1JcIlxuXHRcdFx0XHQvLyBUT0RPIE8gbG9hZCBkZXZlIGZpY2FyIHNlcGFyYWRvIGRvIFN0cmVhbSAodmVyIGlzc3VlICM3KVxuXHRcdFx0XHRMaXN0YS5SZWd1bGFtZW50byA9IGRhdGFbXCJlZGljYW9cIl07XG5cdFx0XHRcdExpc3RhLlRhcmVmYXMgPSBkYXRhW1widGFyZWZhc1wiXTtcblxuXHRcdFx0XHQvLyBTZSBhIEVkacOnw6NvIGVzdGl2ZXIgZW5jZXJyYWRhLi4uXG5cblxuXHRcdFx0XHQvLyBGSU0gRE8gXCJESVJFVE9SXCJcblxuXHRcdFx0XHQvLyBMaW1wYSBvIHN0cmVhbSBwYXJhIGNvbWXDp2FyIGRvIHplcm9cblx0XHRcdFx0JHN0cmVhbS5lbXB0eSgpO1xuXG5cdFx0XHRcdC8vIE1vbnRhIHBsYWNhclxuXHRcdFx0XHRhcHAuUGxhY2FyLnVwZGF0ZShkYXRhW1wicGxhY2FyXCJdKTtcblxuXHRcdFx0XHQvLyBJbnNlcmUgb3MgY2FyZHMgZGUgdGFyZWZhc1xuXHRcdFx0XHQkLmVhY2goZGF0YVtcInRhcmVmYXNcIl0sIGZ1bmN0aW9uKGluZGV4LCB0YXJlZmEpIHtcblx0XHRcdFx0XHR0YXJlZmFzW3RhcmVmYVtcIm51bWVyb1wiXV0gPSB0YXJlZmE7XG5cdFx0XHRcdFx0dGFyZWZhW1widXJsXCJdID0gXCIvdGFyZWZhcy9cIiArIHRhcmVmYVtcIm51bWVyb1wiXTtcblx0XHRcdFx0XHR0YXJlZmFbXCJ1cmxcIl0gPSByb3V0ZXJbXCJidWlsZC1saW5rXCJdKFwiL3RhcmVmYXMvXCIgKyB0YXJlZmFbXCJudW1lcm9cIl0pO1xuXG5cdFx0XHRcdFx0aWYgKHRhcmVmYVtcImltYWdlbVwiXSkge1xuXHRcdFx0XHRcdFx0dGFyZWZhW1wiaW1hZ2VtLXVybFwiXSA9IHRhcmVmYVtcImltYWdlbVwiXVtcInVybFwiXTtcblx0XHRcdFx0XHRcdHRhcmVmYVtcImltYWdlbS1hc3BlY3RvXCJdID0gXCJwYWRkaW5nLXRvcDogXCIgKyAodGFyZWZhW1wiaW1hZ2VtXCJdW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHZhciAkY2FyZCA9IF9fcmVuZGVyKFwiY2FyZC10YXJlZmFcIiwgdGFyZWZhKS5kYXRhKHtcblx0XHRcdFx0XHRcdFx0XCJ0YXJlZmFcIjogdGFyZWZhW1wibnVtZXJvXCJdLFxuXHRcdFx0XHRcdFx0XHRcImxhc3QtbW9kaWZpZWRcIjogKHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXT8gbW9tZW50KHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXSkuZm9ybWF0KFwiWFwiKSA6IDApXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGlmICh0YXJlZmFbXCJwcmV2aWV3XCJdKSB7XG5cdFx0XHRcdFx0XHQkY2FyZC5hZGRDbGFzcyhcImZhbnRhc21hXCIpO1xuXHRcdFx0XHRcdFx0JChcImFcIiwgJGNhcmQpLnJlbW92ZUF0dHIoXCJocmVmXCIpO1xuXHRcdFx0XHRcdFx0JChcIi5ib2R5XCIsICRjYXJkKS5yZW1vdmUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIXRhcmVmYVtcImltYWdlbVwiXSkge1xuXHRcdFx0XHRcdFx0JChcIi5tZWRpYVwiLCAkY2FyZCkucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcG9zdHNcblx0XHRcdFx0XHR2YXIgJGdyaWQgPSAkKFwiLmdyaWRcIiwgJGNhcmQpO1xuXG5cdFx0XHRcdFx0aWYgKHRhcmVmYVtcInBvc3RzXCJdICYmIHRhcmVmYVtcInBvc3RzXCJdLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0dmFyIHRvdGFsX3Bvc3RzID0gdGFyZWZhW1wicG9zdHNcIl0ubGVuZ3RoO1xuXHRcdFx0XHRcdFx0Ly8gdmFyIHRvdGFsX21lZGlhID0gdGFyZWZhW1wicG9zdHNcIl0ucmVkdWNlKCh0b3RhbCwgcG9zdCkgPT4gdG90YWwgKyBwb3N0W1wibWlkaWFcIl0ubGVuZ3RoLCAwKTtcblx0XHRcdFx0XHRcdHZhciBtYXhfbWVkaWFfdG9fc2hvdyA9IChVSS5kYXRhW1wiY29sdW1uc1wiXSA8IDI/IDkgOiA4KTtcblx0XHRcdFx0XHRcdHZhciBzaG93bl9tZWRpYV9jb3VudCA9IDA7XG5cblx0XHRcdFx0XHRcdHZhciBwb3N0X3R5cGVzX3dpdGhfaW1hZ2VfcHJldmlldyA9IFtcImltYWdlbVwiLCBcInlvdXR1YmVcIiwgXCJ2aW1lb1wiLCBcInZpbmVcIiwgXCJnaWZcIl07XG5cdFx0XHRcdFx0XHR2YXIgcG9zdF90eXBlc193aXRoX3RleHRfcHJldmlldyA9IFtcInRleHRvXCJdO1xuXG5cdFx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsX3Bvc3RzOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0dmFyIHBvc3QgPSB0YXJlZmFbXCJwb3N0c1wiXVtpXTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoKHBvc3RbXCJtaWRpYVwiXSB8fCBwb3N0W1widGlwb1wiXSA9PSBcInRleHRvXCIpICYmIChzaG93bl9tZWRpYV9jb3VudCA8IG1heF9tZWRpYV90b19zaG93KSkge1xuXHRcdFx0XHRcdFx0XHRcdHNob3duX21lZGlhX2NvdW50Kys7XG5cblx0XHRcdFx0XHRcdFx0XHR2YXIgdGlsZV90eXBlO1xuXHRcdFx0XHRcdFx0XHRcdHZhciBtZWRpYSA9IHsgfTtcblxuXHRcdFx0XHRcdFx0XHRcdC8vIGltYWdlbVxuXHRcdFx0XHRcdFx0XHRcdGlmIChwb3N0X3R5cGVzX3dpdGhfaW1hZ2VfcHJldmlldy5pbmRleE9mKHBvc3RbXCJ0aXBvXCJdKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aWxlX3R5cGUgPSBcInRpbGUtaW1hZ2VcIjtcblxuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJjb3VudFwiXSA9IHNob3duX21lZGlhX2NvdW50O1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ5b3V0dWJlXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ2aW1lb1wiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidmluZVwiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwiZ2lmXCIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJwcmV2aWV3XCJdID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJ1wiICsgcG9zdFtcIm1pZGlhXCJdWzBdW1widGh1bWJuYWlsXCJdICsgXCInKTtcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJtb2RpZmllclwiXSA9IFwidmlkZW9cIjtcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocG9zdFtcIm1pZGlhXCJdICYmIHBvc3RbXCJtaWRpYVwiXVswXSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcInByZXZpZXdcIl0gPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybCgnXCIgKyBwb3N0W1wibWlkaWFcIl1bMF1bXCJjYW1pbmhvXCJdICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRwb3N0W1wibWlkaWFcIl1bMF1bXCJhcnF1aXZvc1wiXVswXSArIFwiJyk7XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlXG5cblx0XHRcdFx0XHRcdFx0XHQvLyB0ZXh0b1xuXHRcdFx0XHRcdFx0XHRcdGlmIChwb3N0X3R5cGVzX3dpdGhfdGV4dF9wcmV2aWV3LmluZGV4T2YocG9zdFtcInRpcG9cIl0pID4gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRpbGVfdHlwZSA9IFwidGlsZS10ZXh0XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCJwcmV2aWV3XCI6IHBvc3RbXCJsZWdlbmRhXCJdLnN1YnN0cmluZygwLCAxMjApLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcImNvdW50XCI6IHNob3duX21lZGlhX2NvdW50XG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdGlmICgoc2hvd25fbWVkaWFfY291bnQgPT09IG1heF9tZWRpYV90b19zaG93KSAmJiAoKHRvdGFsX3Bvc3RzIC0gc2hvd25fbWVkaWFfY291bnQpID4gMCkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wibW9kaWZpZXJcIl0gPSBcIm1vcmVcIjtcblx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wibW9yZVwiXSA9IFwiKyZ0aGluc3A7XCIgKyAodG90YWxfcG9zdHMgLSBzaG93bl9tZWRpYV9jb3VudCArIDEpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdHZhciAkdGlsZSA9IF9fcmVuZGVyKHRpbGVfdHlwZSwgbWVkaWEpLmFwcGVuZFRvKCRncmlkKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIHNlIG7Do28gdGl2ZXIgbmVuaHVtIHBvc3QsIHJlbW92ZSBvIGdyaWRcblx0XHRcdFx0XHRcdCRncmlkLnJlbW92ZSgpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIGF0dWFsaXphIG8gaXNvdG9wZVxuXHRcdFx0XHRcdCRzdHJlYW0uYXBwZW5kKCRjYXJkKS5pc290b3BlKFwiYXBwZW5kZWRcIiwgJGNhcmQpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyBTZSBhIEVkacOnw6NvIGVzdGl2ZXIgZW5jZXJyYWRhLCBvcmRlbmEgcG9yIG7Dum1lcm8gZGEgdGFyZWZhLlxuXHRcdFx0XHQvLyBTZSBuw6NvLCBvcmRlbmEgcG9yIG9yZGVtIGRlIGF0dWFsaXphw6fDo29cblx0XHRcdFx0YXBwLkxpc3RhLmxheW91dCgpO1xuXHRcdFx0XHRhcHAuTGlzdGEuc29ydCgoTGlzdGEuRWRpY2FvW1wiZW5jZXJyYWRhXCJdPyBcInRhcmVmYVwiOiBcImRhdGVcIikpO1xuXG5cdFx0XHRcdC8vIHNlIHRpdmVyIHRhcmVmYSBlc3BlY2lmaWNhZGEgbm8gbG9hZCBkYSBww6FnaW5hLCBjYXJyZWdhIGVsYVxuXHRcdFx0XHRpZiAocm91dGVyW1wicGF0aFwiXVsyXSkge1xuXHRcdFx0XHRcdGFwcC5UYXJlZmEub3Blbihyb3V0ZXJbXCJwYXRoXCJdWzJdKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGVzY29uZGUgYSB0ZWxhIGRlIGxvYWRpbmdcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQkc3RyZWFtLmxvYWRpbmdcblx0XHRcdFx0XHRcdC5yZW1vdmVDbGFzcyhcImZhZGUtaW5cIilcblx0XHRcdFx0XHRcdC5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkgeyAkc3RyZWFtLmxvYWRpbmcucmVtb3ZlQ2xhc3MoXCJpblwiKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSwgMTIwMCk7XG5cblx0XHRcdFx0Ly8gZ3VhcmRhIGEgZGF0YSBkYSDDumx0aW1hIGF0dWFsaXphw6fDo28gZSB6ZXJhIG8gY29udGFkb3IgZGUgbm92aWRhZGVzXG5cdFx0XHRcdGxhc3RfdXBkYXRlZCA9IG1vbWVudChkYXRhW1wiZWRpY2FvXCJdW1widWx0aW1hLWF0dWFsaXphY2FvXCJdKTtcblx0XHRcdFx0dXBkYXRlZFtcInRhcmVmYXNcIl0gPSAwOyB1cGRhdGVkW1wicG9zdHNcIl0gPSAwO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxpc3RhLmxheW91dCgpXG5cdFx0bGF5b3V0OiBmdW5jdGlvbigpIHtcblx0XHRcdCRhcHBbXCJsaXN0YVwiXS5pc290b3BlKFwicmVsb2FkSXRlbXNcIik7XG5cdFx0XHQkYXBwW1wibGlzdGFcIl0uaXNvdG9wZShcImxheW91dFwiKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEuc29ydCgpXG5cdFx0c29ydDogZnVuY3Rpb24oY3JpdGVyaWEpIHtcblx0XHRcdCRhcHBbXCJsaXN0YVwiXS5pc290b3BlKHtcblx0XHRcdFx0XCJzb3J0QnlcIjogY3JpdGVyaWFcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn0pKCk7XG5cbi8vIGpRdWVyeVxudmFyICRzdHJlYW07XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCRzdHJlYW0gPSAkKFwiLmpzLWFwcC1saXN0YVwiKTtcblx0Ly8gJHN0cmVhbS5sb2FkaW5nID0gJChcIm1haW4gLmxvYWRpbmdcIik7XG5cblx0JHN0cmVhbS5pc290b3BlKHtcblx0XHRcIml0ZW1TZWxlY3RvclwiOiBcIi5jYXJkLXRhcmVmYVwiLFxuXHRcdFwidHJhbnNpdGlvbkR1cmF0aW9uXCI6IFwiLjhzXCIsXG5cdFx0XCJnZXRTb3J0RGF0YVwiOiB7XG5cdFx0XHRcImRhdGVcIjogXCIubGFzdC1tb2RpZmllZFwiLFxuXHRcdFx0XCJ0YXJlZmFcIjogZnVuY3Rpb24oZWxlbWVudCkge1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VJbnQoJChlbGVtZW50KS5kYXRhKFwidGFyZWZhXCIpLCAxMCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRcInNvcnRBc2NlbmRpbmdcIjoge1xuXHRcdFx0XCJkYXRlXCI6IGZhbHNlLFxuXHRcdFx0XCJ0YXJlZmFcIjogdHJ1ZVxuXHRcdH0sXG5cdFx0XCJzb3J0QnlcIjogW1wiZGF0ZVwiLCBcInRhcmVmYVwiXSxcblx0XHRcIm1hc29ucnlcIjoge1xuXHRcdFx0XCJndXR0ZXJcIjogKFVJLmRhdGFbXCJjb2x1bW5zXCJdID09PSAxPyA4IDogMTYpXG5cdFx0fVxuXHR9KTtcblxuXHQvLyAkc3RyZWFtLm9uKFwiY2xpY2tcIiwgXCIuY2FyZC10YXJlZmE6bm90KC5mYW50YXNtYSlcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0Ly8gXHRpZiAoZXZlbnQud2hpY2ggPT09IDEpIHtcblx0Ly8gXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdC8vXG5cdC8vIFx0XHR2YXIgbnVtZXJvID0gJCh0aGlzKS5kYXRhKFwidGFyZWZhXCIpO1xuXHQvLyBcdFx0YXBwLlRhcmVmYS5vcGVuKG51bWVybywgdHJ1ZSk7XG5cdC8vIFx0fVxuXHQvLyB9KTtcblxuXHQvLyBhcHAuTGlzdGEubG9hZCgpO1xuXG5cdC8vIG9yZGVuYcOnw6NvXG5cdCR1aVtcInNpZGVuYXZcIl0ub24oXCJjbGlja1wiLCBcIi5qcy1zdHJlYW0tc29ydCBhXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHZhciBjcml0ZXJpYSA9ICQodGhpcykuZGF0YShcInNvcnQtYnlcIik7XG5cdFx0JChcIi5qcy1zdHJlYW0tc29ydCBhXCIsICR1aVtcInNpZGVuYXZcIl0pLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuXHRcdCQodGhpcykuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG5cblx0XHRhcHAuTGlzdGEuc29ydChjcml0ZXJpYSk7XG5cdFx0VUkuc2lkZW5hdi5jbG9zZSgpO1xuXHR9KTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdGFyZWZhIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBwLlRhcmVmYS5vcGVuKClcbi8vIGFwcC5UYXJlZmEucmVuZGVyKClcbi8vIGFwcC5UYXJlZmEuY2xvc2UoKVxuXG5hcHAuVGFyZWZhID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCRhcHBbXCJ0YXJlZmFcIl0gPSAkKFwiLmFwcC10YXJlZmFcIik7XG5cdFx0JGFwcFtcInRhcmVmYVwiXS5vbihcImNsaWNrXCIsIFwiLmpzLXRhcmVmYS1jbG9zZVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGFwcC5UYXJlZmEuY2xvc2UodHJ1ZSk7XG5cdFx0fSkub24oXCJjbGlja1wiLCBcIi5qcy1uZXctcG9zdC10cmlnZ2VyXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0VUkuYm90dG9tc2hlZXQub3BlbigkKFwiLm5ldy1wb3N0LXNoZWV0XCIsICRhcHBbXCJ0YXJlZmFcIl0pLmNsb25lKCkuc2hvdygpKTtcblx0XHR9KS5vbihcImNsaWNrXCIsIFwiLmNhcmQtdGFyZWZhIGFcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmIChldmVudC53aGljaCA9PT0gMSkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcblxuXHRsZXQgcGxhY2FyX2RhX3RhcmVmYSA9IFsgXTtcblxuXHRmdW5jdGlvbiByZW5kZXJQb3N0cyhwb3N0cywgJHBvc3RzKSB7XG5cdFx0cGxhY2FyX2RhX3RhcmVmYVtcInRvdGFsXCJdID0gMDtcblx0XHRmb3IgKHZhciB0dXJtYSBpbiBMaXN0YS5FZGljYW9bXCJ0dXJtYXNcIl0pIHtcblx0XHRcdHBsYWNhcl9kYV90YXJlZmFbTGlzdGEuRWRpY2FvW1widHVybWFzXCJdW3R1cm1hXV0gPSAwO1xuXHRcdH1cblxuXHRcdCQuZWFjaChwb3N0cywgZnVuY3Rpb24oaW5kZXgsIHBvc3QpIHtcblx0XHRcdHBvc3RbXCJ0dXJtYS1iYWNrZ3JvdW5kXCJdID0gcG9zdFtcInR1cm1hXCJdICsgXCItbGlnaHQtYmFja2dyb3VuZFwiO1xuXHRcdFx0cG9zdFtcImRhdGEtZGUtcG9zdGFnZW0tZm9ybWF0YWRhXCJdID0gbW9tZW50KHBvc3RbXCJkYXRhLWRlLXBvc3RhZ2VtXCJdKS5jYWxlbmRhcigpO1xuXHRcdFx0cG9zdFtcInR1cm1hLWZvcm1hdGFkYVwiXSA9IHBvc3RbXCJ0dXJtYVwiXS50b1VwcGVyQ2FzZSgpO1xuXG5cdFx0XHQvLyBsZWdlbmRhXG5cdFx0XHRpZiAocG9zdFtcImxlZ2VuZGFcIl0gJiYgcG9zdFtcImxlZ2VuZGFcIl0uc3Vic3RyaW5nKDAsMykgIT09IFwiPHA+XCIpIHtcblx0XHRcdFx0cG9zdFtcImxlZ2VuZGFcIl0gPSBcIjxwPlwiICsgcG9zdFtcImxlZ2VuZGFcIl0ucmVwbGFjZSgvKD86XFxyXFxuXFxyXFxufFxcclxccnxcXG5cXG4pL2csIFwiPC9wPjxwPlwiKSArIFwiPC9wPlwiO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBhdmFsaWHDp8Ojb1xuXHRcdFx0aWYgKHBvc3RbXCJhdmFsaWFjYW9cIl0pIHtcblx0XHRcdFx0cG9zdFtcImF2YWxpYWNhby9tZW5zYWdlbVwiXSA9IHBvc3RbXCJhdmFsaWFjYW9cIl1bXCJtZW5zYWdlbVwiXTtcblxuXHRcdFx0XHRpZiAocG9zdFtcImF2YWxpYWNhb1wiXVtcInN0YXR1c1wiXSA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0cG9zdFtcInN0YXR1cy1jbGFzc1wiXSA9IHBvc3RbXCJ0dXJtYVwiXTtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzLWljb25cIl0gPSBcIjxpIGNsYXNzPVxcXCJtYXRlcmlhbC1pY29uc1xcXCI+JiN4RTg3RDs8L2k+XCI7IC8vIGNvcmHDp8Ojb1xuXHRcdFx0XHRcdHBvc3RbXCJhdmFsaWFjYW8vc3RhdHVzXCJdID0gcG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXSArIFwiIHBvbnRvXCIgKyAocG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXSA+IDE/IFwic1wiOiBcIlwiKTtcblx0XHRcdFx0XHRwb3N0W1wiYXZhbGlhY2FvL2NsYXNzXCJdID0gXCJ0dXJtYS10ZXh0XCI7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cG9zdFtcInN0YXR1cy1jbGFzc1wiXSA9IFwicmVqZWN0ZWRcIjtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzLWljb25cIl0gPSBcIjxpIGNsYXNzPVxcXCJtYXRlcmlhbC1pY29uc1xcXCI+JiN4RTg4ODs8L2k+XCI7XG5cdFx0XHRcdFx0cG9zdFtcImF2YWxpYWNhby9zdGF0dXNcIl0gPSBcIlJlcHJvdmFkb1wiO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gc29tYSBwb250b3Mgbm8gcGxhY2FyXG5cdFx0XHRcdHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSArPSBwb3N0W1wiYXZhbGlhY2FvXCJdW1wicG9udG9zXCJdO1xuXHRcdFx0XHRwbGFjYXJfZGFfdGFyZWZhW3Bvc3RbXCJ0dXJtYVwiXV0gKz0gcG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBvc3RbXCJzdGF0dXMtaWNvblwiXSA9IFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj4mI3hFOEI1OzwvaT5cIjsgLy8gcmVsw7NnaW9cblx0XHRcdFx0cG9zdFtcImF2YWxpYWNhby9zdGF0dXNcIl0gPSBcIkFndWFyZGFuZG8gYXZhbGlhw6fDo29cIjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcmVuZGVyaXphIG8gcG9zdFxuXHRcdFx0bGV0ICRjb250ZW50X2NhcmQgPSBfX3JlbmRlcihcImNvbnRlbnQtY2FyZFwiLCBwb3N0KTtcblx0XHRcdGxldCAkbWVkaWEgPSAkKFwiLmNvbnRlbnQtbWVkaWEgPiB1bFwiLCAkY29udGVudF9jYXJkKTtcblxuXHRcdFx0Ly8gYWRpY2lvbmEgbcOtZGlhc1xuXHRcdFx0aWYgKHBvc3RbXCJtaWRpYVwiXSkge1xuXHRcdFx0XHQkLmVhY2gocG9zdFtcIm1pZGlhXCJdLCBmdW5jdGlvbihpbmRleCwgbWVkaWEpIHtcblx0XHRcdFx0XHQvLyBpbWFnZW1cblx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJpbWFnZW1cIikge1xuXHRcdFx0XHRcdFx0bWVkaWFbXCJkZWZhdWx0XCJdID0gbWVkaWFbXCJjYW1pbmhvXCJdICsgbWVkaWFbXCJhcnF1aXZvc1wiXVsxXTtcblx0XHRcdFx0XHRcdG1lZGlhW1wicGFkZGluZy1hc3BlY3RvXCJdID0gXCJwYWRkaW5nLXRvcDogXCIgKyAobWVkaWFbXCJhc3BlY3RvXCJdICogMTAwKS50b0ZpeGVkKDIpICsgXCIlXCI7XG5cdFx0XHRcdFx0XHRtZWRpYVtcImxpbmstb3JpZ2luYWxcIl0gPSBtZWRpYVtcImNhbWluaG9cIl0gKyBtZWRpYVtcImFycXVpdm9zXCJdWzJdO1xuXHRcdFx0XHRcdFx0dmFyICRpbWFnZSA9IF9fcmVuZGVyKFwibWVkaWEtcGhvdG9cIiwgbWVkaWEpO1xuXHRcdFx0XHRcdFx0JG1lZGlhLmFwcGVuZCgkaW1hZ2UpO1xuXHRcdFx0XHRcdH0gZWxzZVxuXG5cdFx0XHRcdFx0Ly8gZW1iZWRcblx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ5b3V0dWJlXCIgfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ2aW1lb1wiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidmluZVwiKSB7XG5cdFx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ5b3V0dWJlXCIpIHtcblx0XHRcdFx0XHRcdFx0bWVkaWFbXCJlbWJlZFwiXSA9IFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvXCIgKyBtZWRpYVtcInlvdXR1YmUtaWRcIl0gKyBcIj9yZWw9MCZhbXA7c2hvd2luZm89MFwiO1xuXHRcdFx0XHRcdFx0fSBlbHNlXG5cblx0XHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInZpbWVvXCIpIHtcblx0XHRcdFx0XHRcdFx0bWVkaWFbXCJlbWJlZFwiXSA9IFwiaHR0cHM6Ly9wbGF5ZXIudmltZW8uY29tL3ZpZGVvL1wiICsgbWVkaWFbXCJ2aW1lby1pZFwiXSArIFwiP3RpdGxlPTAmYnlsaW5lPTAmcG9ydHJhaXQ9MFwiO1xuXHRcdFx0XHRcdFx0fSBlbHNlXG5cblx0XHRcdFx0XHRcdGlmIChwb3N0W1widGlwb1wiXSA9PSBcInZpbmVcIikge1xuXHRcdFx0XHRcdFx0XHRtZWRpYVtcImVtYmVkXCJdID0gXCJodHRwczovL3ZpbmUuY28vdi9cIiArIG1lZGlhW1widmluZS1pZFwiXSArIFwiL2VtYmVkL3NpbXBsZVwiO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRtZWRpYVtcInBhZGRpbmctYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKG1lZGlhW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0XHRcdFx0dmFyICRlbWJlZCA9IF9fcmVuZGVyKFwibWVkaWEtdmlkZW9cIiwgbWVkaWEpO1xuXHRcdFx0XHRcdFx0JG1lZGlhLmFwcGVuZCgkZW1iZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHRpcmEgbGVnZW5kYSBzZSBuw6NvIHRpdmVyXG5cdFx0XHRpZiAoIXBvc3RbXCJsZWdlbmRhXCJdKSB7XG5cdFx0XHRcdCRjb250ZW50X2NhcmQuYWRkQ2xhc3MoXCJuby1jYXB0aW9uXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIXBvc3RbXCJtaWRpYVwiXSkge1xuXHRcdFx0XHQkY29udGVudF9jYXJkLmFkZENsYXNzKFwibm8tbWVkaWFcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHRpcmEgbWVuc2FnZW0gZGUgYXZhbGlhw6fDo28gc2UgbsOjbyB0aXZlclxuXHRcdFx0aWYgKCFwb3N0W1wiYXZhbGlhY2FvXCJdIHx8ICFwb3N0W1wibWVuc2FnZW1cIl0pIHtcblx0XHRcdFx0JChcIi5yZXN1bHQgLm1lc3NhZ2VcIiwgJGNvbnRlbnRfY2FyZCkucmVtb3ZlKCk7XG5cdFx0XHR9XG5cblxuXHRcdFx0Ly8gYWRpY2lvbmEgbyBwb3N0IMOgIHRhcmVmYVxuXHRcdFx0Ly8gJHBvc3RzLmFwcGVuZCgkY29udGVudF9jYXJkKS5pc290b3BlKFwiYXBwZW5kZWRcIiwgJGNvbnRlbnRfY2FyZCk7XG5cdFx0XHQkcG9zdHMuYXBwZW5kKCRjb250ZW50X2NhcmQpO1xuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIHtcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlRhcmVmYS5vcGVuKClcblx0XHRvcGVuOiBmdW5jdGlvbihudW1lcm8sICRjYXJkLCBwdXNoU3RhdGUpIHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKCRjYXJkWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcblxuXHRcdFx0bGV0IHRhcmVmYSA9IGNhY2hlW1widGFyZWZhc1wiXVtudW1lcm9dO1xuXHRcdFx0dGFyZWZhX2FjdGl2ZSA9IG51bWVybztcblxuXHRcdFx0aWYgKFVJLmRhdGFbXCJjb2x1bW5zXCJdID49IDMpIHtcblx0XHRcdFx0Ly8gVUkuYmFja2Ryb3Auc2hvdygkYXBwW1widGFyZWZhXCJdLCB7IFwiaGlkZVwiOiBhcHAuVGFyZWZhLmNsb3NlIH0pO1xuXHRcdFx0XHQvLyAkdWlbXCJiYWNrZHJvcFwiXVskYXBwW1widGFyZWZhXCJdXS5vbihcImhpZGVcIiwgYXBwLlRhcmVmYS5jbG9zZSk7XG5cdFx0XHR9XG5cblx0XHRcdCRhcHBbXCJ0YXJlZmFcIl0uYWRkQ2xhc3MoXCJpblwiKTtcblx0XHRcdGFwcC5UYXJlZmEucmVuZGVyKHRhcmVmYSk7XG5cblx0XHRcdCRhcHBbXCJ0YXJlZmFcIl0ucmVmbG93KCkuYWRkQ2xhc3MoXCJzbGlkZS14XCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHQvL1x0dmFyIHZpZXdfdGhlbWVfY29sb3IgPSAkKFwiLmFwcGJhclwiLCAkYXBwW1widGFyZWZhXCJdKS5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIpO1xuXHRcdFx0XHQkKFwiaGVhZCBtZXRhW25hbWU9J3RoZW1lLWNvbG9yJ11cIikuYXR0cihcImNvbnRlbnRcIiwgXCIjNTQ2ZTdhXCIpO1xuXHRcdFx0fSk7XG5cblx0XHRcdFVJLmJvZHkubG9jaygpO1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInRhcmVmYS1hY3RpdmVcIik7XG5cblx0XHRcdC8vIHJvdXRlclxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLnJlcGxhY2UoXCJ0YXJlZmFcIik7XG5cdFx0XHRpZiAocHVzaFN0YXRlKSB7XG5cdFx0XHRcdHJvdXRlci5nbyhcIi90YXJlZmFzL1wiICsgdGFyZWZhW1wibnVtZXJvXCJdLCB7XG5cdFx0XHRcdFx0XCJ2aWV3XCI6IFwidGFyZWZhXCIsXG5cdFx0XHRcdFx0XCJpZFwiOiB0YXJlZmFbXCJudW1lcm9cIl1cblx0XHRcdFx0fSwgdGFyZWZhW1widGl0dWxvXCJdKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuVGFyZWZhLnJlbmRlcigpIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0cmVuZGVyOiBmdW5jdGlvbih0YXJlZmEpIHtcblx0XHRcdHZhciAkdGFyZWZhID0gX19yZW5kZXIoXCJ2aWV3LXRhcmVmYVwiLCB0YXJlZmEpO1xuXG5cdFx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0XHQvLyBjYXJkIGRhIHRhcmVmYVxuXHRcdFx0aWYgKHRhcmVmYVtcImltYWdlbVwiXSkge1xuXHRcdFx0XHR0YXJlZmFbXCJpbWFnZW1cIl1bXCJhc3BlY3RvXCJdID0gXCJwYWRkaW5nLXRvcDogXCIgKyAodGFyZWZhW1wiaW1hZ2VtXCJdW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgJHRhcmVmYV9jYXJkID0gX19yZW5kZXIoXCJjYXJkLXRhcmVmYVwiLCB0YXJlZmEpO1xuXG5cdFx0XHRpZiAoIXRhcmVmYVtcImltYWdlbVwiXSkge1xuXHRcdFx0XHQkKFwiLm1lZGlhXCIsICR0YXJlZmFfY2FyZCkucmVtb3ZlKCk7XG5cdFx0XHR9XG5cdFx0XHQkKFwiLmdyaWRcIiwgJHRhcmVmYV9jYXJkKS5yZW1vdmUoKTtcblx0XHRcdCQoXCJhXCIsICR0YXJlZmFfY2FyZCkucmVtb3ZlQXR0cihcImhyZWZcIik7XG5cblx0XHRcdCQoXCIudGFyZWZhLW1ldGEgLnRhcmVmYS10ZXh0b1wiLCAkdGFyZWZhKS5hcHBlbmQoJHRhcmVmYV9jYXJkKTtcblxuXHRcdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdFx0Ly8gY29udGVudFxuXHRcdFx0bGV0ICRwb3N0cyA9ICQoXCIudGFyZWZhLWNvbnRlbnQgPiB1bFwiLCAkdGFyZWZhKTtcblxuXHRcdFx0aWYgKHRhcmVmYVtcInBvc3RzXCJdLmxlbmd0aCkge1xuXHRcdFx0XHRyZW5kZXJQb3N0cyh0YXJlZmFbXCJwb3N0c1wiXSwgJHBvc3RzKTtcblxuXHRcdFx0XHQkcG9zdHMuaXNvdG9wZSh7XG5cdFx0XHRcdFx0XCJpdGVtU2VsZWN0b3JcIjogXCIuY29udGVudC1jYXJkXCIsXG5cdFx0XHRcdFx0XCJ0cmFuc2l0aW9uRHVyYXRpb25cIjogMCxcblx0XHRcdFx0XHRcIm1hc29ucnlcIjoge1xuXHRcdFx0XHRcdFx0XCJpc0ZpdFdpZHRoXCI6IHRydWUsXG5cdFx0XHRcdFx0XHRcImd1dHRlclwiOiAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPT09IDE/IDggOiAyNClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdC8vIH0pLm9uKFwibGF5b3V0Q29tcGxldGVcIiwgZnVuY3Rpb24oZXZlbnQsIHBvc3RzKSB7XG5cdFx0XHRcdC8vIFx0dmFyIHByZXZpb3VzX3Bvc2l0aW9uO1xuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdGZvciAodmFyIHBvc3QgaW4gcG9zdHMpIHtcblx0XHRcdFx0Ly8gXHRcdHZhciAkdGhpcyA9ICQocG9zdHNbcG9zdF0uZWxlbWVudCk7XG5cdFx0XHRcdC8vIFx0XHR2YXIgb2Zmc2V0ID0gcG9zdHNbcG9zdF0ucG9zaXRpb247XG5cdFx0XHRcdC8vIFx0XHR2YXIgc2lkZSA9IChvZmZzZXRbXCJ4XCJdID09PSAwPyBcImxlZnRcIiA6IFwicmlnaHRcIik7XG5cdFx0XHRcdC8vXG5cdFx0XHRcdC8vIFx0XHQkdGhpcy5hZGRDbGFzcyhcInRpbWVsaW5lLVwiICsgc2lkZSk7XG5cdFx0XHRcdC8vXG5cdFx0XHRcdC8vIFx0XHRpZiAob2Zmc2V0W1wieVwiXSAtIHByZXZpb3VzX3Bvc2l0aW9uIDwgMTApIHtcblx0XHRcdFx0Ly8gXHRcdFx0JHRoaXMuYWRkQ2xhc3MoXCJleHRyYS1vZmZzZXRcIik7XG5cdFx0XHRcdC8vIFx0XHR9XG5cdFx0XHRcdC8vXG5cdFx0XHRcdC8vIFx0XHRwcmV2aW91c19wb3NpdGlvbiA9IG9mZnNldFtcInlcIl07XG5cdFx0XHRcdC8vIFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdCRwb3N0cy5pc290b3BlKFwibGF5b3V0XCIpO1xuXHRcdFx0XHR9LCAxKTtcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JChcIjxsaSAvPlwiKS5hZGRDbGFzcyhcImVtcHR5XCIpLnRleHQoXCJOZW5odW0gcG9zdFwiKS5hcHBlbmRUbygkcG9zdHMpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0XHQvLyBsYXlvdXRcblx0XHRcdCRhcHBbXCJ0YXJlZmFcIl0uaHRtbCgkdGFyZWZhKTtcblxuXHRcdFx0aWYgKHRhcmVmYVtcInBvc3RzXCJdLmxlbmd0aCkge1xuXHRcdFx0XHQkcG9zdHMuaXNvdG9wZShcImxheW91dFwiKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcGxhY2FyIGRhIHRhcmVmYVxuXHRcdFx0dmFyICRwbGFjYXJfZGFfdGFyZWZhID0gJChcIi5wYWluZWwgLnBsYWNhciB1bFwiLCAkdGFyZWZhKTtcblxuXHRcdFx0JC5lYWNoKExpc3RhLkVkaWNhb1tcInR1cm1hc1wiXSwgZnVuY3Rpb24oaW5kZXgsIHR1cm1hKSB7XG5cdFx0XHRcdHZhciBwb250dWFjYW9fZGFfdHVybWEgPSBbIF07XG5cblx0XHRcdFx0Ly8gY2FsY3VsYSAlIGRhIHR1cm1hIGVtIHJlbGHDp8OjbyBhbyB0b3RhbCBkZSBwb250b3Ncblx0XHRcdFx0dmFyIHBlcmNlbnR1YWxfZGFfdHVybWEgPSAocGxhY2FyX2RhX3RhcmVmYVtcInRvdGFsXCJdID4gMD8gcGxhY2FyX2RhX3RhcmVmYVt0dXJtYV0gLyBwbGFjYXJfZGFfdGFyZWZhW1widG90YWxcIl0gOiAwKTtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1widHVybWFcIl0gPSB0dXJtYTtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1wiYWx0dXJhLWRhLWJhcnJhXCJdID0gXCJoZWlnaHQ6IFwiICsgKHBlcmNlbnR1YWxfZGFfdHVybWEgKiAxMDApLnRvRml4ZWQoMykgKyBcIiVcIjtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1widHVybWEtZm9ybWF0YWRhXCJdID0gdHVybWEudG9VcHBlckNhc2UoKTtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1wicG9udG9zXCJdID0gKHBsYWNhcl9kYV90YXJlZmFbdHVybWFdID4gMD8gcGxhY2FyX2RhX3RhcmVmYVt0dXJtYV0gOiAwKTtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1wicG9udHVhY2FvLWZvcm1hdGFkYVwiXSA9IHBvbnR1YWNhb19kYV90dXJtYVtcInBvbnRvc1wiXS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLlwiKTtcblxuXHRcdFx0XHR2YXIgJHR1cm1hID0gX19yZW5kZXIoXCJwbGFjYXItdHVybWFcIiwgcG9udHVhY2FvX2RhX3R1cm1hKTtcblx0XHRcdFx0JHBsYWNhcl9kYV90YXJlZmEuYXBwZW5kKCR0dXJtYSk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuVGFyZWZhLmNsb3NlKClcblx0XHRjbG9zZTogZnVuY3Rpb24ocHVzaFN0YXRlKSB7XG5cdFx0XHR0YXJlZmFfYWN0aXZlID0gbnVsbDtcblx0XHRcdCQoXCJoZWFkIG1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKS5hdHRyKFwiY29udGVudFwiLCBVSS5kYXRhW1widGhlbWUtY29sb3JcIl1bXCJvcmlnaW5hbFwiXSk7XG5cblx0XHRcdFVJLmJvZHkudW5sb2NrKCk7XG5cdFx0XHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwidGFyZWZhLWFjdGl2ZVwiKTtcblx0XHRcdCRhcHBbXCJ0YXJlZmFcIl0ucmVtb3ZlQ2xhc3MoXCJzbGlkZS14XCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRhcHBbXCJ0YXJlZmFcIl0ucmVtb3ZlQ2xhc3MoXCJpblwiKS5lbXB0eSgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChVSS5kYXRhW1wiY29sdW1uc1wiXSA+PSAzKSB7XG5cdFx0XHRcdC8vIFVJLmJhY2tkcm9wLmhpZGUoJGFwcFtcInRhcmVmYVwiXSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHJvdXRlclxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLnJlcGxhY2UoXCJob21lXCIpO1xuXHRcdFx0aWYgKHB1c2hTdGF0ZSkgeyByb3V0ZXIuZ28oXCIvdGFyZWZhc1wiLCB7IFwidmlld1wiOiBcImhvbWVcIiB9LCBcIkxpc3RhIGRlIFRhcmVmYXNcIik7IH1cblx0XHR9XG5cdH07XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbmV3IHBvc3QgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gKiBhcHAuUG9zdC5hdXRob3JpemUoKVxuLy8gKiBhcHAuUG9zdC5kZWF1dGhvcml6ZSgpXG4vLyAqIGFwcC5Qb3N0LmdldFRodW1ibmFpbCgpXG4vLyAqIGFwcC5Qb3N0Lm9wZW4oKVxuLy8gKiBhcHAuUG9zdC5jbG9zZSgpXG5cbi8vIHRpcG9zIGRlIHBvc3Q6IHBob3RvLCB2aWRlbywgdGV4dFxuXG5hcHAuUG9zdCA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQkYXBwW1wicG9zdFwiXSA9ICQoXCIuYXBwLXBvc3RcIik7XG5cdFx0JHVpW1wiYm90dG9tc2hlZXRcIl0ub24oXCJjbGlja1wiLCBcIi5uZXctcG9zdC1zaGVldCBhXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHR2YXIgdHlwZSA9ICQodGhpcykuZGF0YShcInBvc3QtdHlwZVwiKTtcblx0XHRcdFVJLmJvdHRvbXNoZWV0LmNsb3NlKCk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhcHAuUG9zdC5vcGVuKHR5cGUsIHRhcmVmYV9hY3RpdmUpO1xuXHRcdFx0fSwgNjAwKTtcblx0XHR9KTtcblxuXHRcdCRhcHBbXCJwb3N0XCJdLm9uKFwic3VibWl0XCIsIFwiZm9ybVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9KS5vbihcImNsaWNrXCIsIFwiLnN1Ym1pdC1idXR0b25cIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGlmIChtb21lbnQoKS5pc0FmdGVyKExpc3RhLkVkaWNhb1tcImZpbVwiXSkpIHtcblx0XHRcdFx0VUkudG9hc3Qub3BlbihcIlBvc3RhZ2VucyBlbmNlcnJhZGFzIVwiKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCQodGhpcykuaGFzQ2xhc3MoXCJkaXNhYmxlZFwiKSkge1xuXHRcdFx0XHQvLyBUT0RPIG1lbGhvcmFyIG1lbnNhZ2VtXG5cdFx0XHRcdFVJLnRvYXN0Lm9wZW4oXCJFc3BlcmUgbyBmaW0gZG8gdXBsb2FkJmhlbGxpcDtcIik7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGRhdGEgPSAkKFwiZm9ybVwiLCAkYXBwW1wicG9zdFwiXSkuc2VyaWFsaXplKCk7XG5cdFx0XHQvLyBFeGVtcGxvIGRlIGRhZG9zOlxuXHRcdFx0Ly8gYWN0aW9uPXBvc3Rcblx0XHRcdC8vIGVkaWNhbz14Y2lpaVxuXHRcdFx0Ly8gdGFyZWZhPTJcblx0XHRcdC8vIHVzZXI9NzQ0XG5cdFx0XHQvLyB0dXJtYT1lYzFcblx0XHRcdC8vIHRva2VuPTBlYmUyMmJlNzMxZGJkOTQyZWNiM2UwOTdhNWFjMmFlOWQzMTg1MjQ5ZjMxM2VhZWMzYTg1NWVmMjk1NzU5NGRcblx0XHRcdC8vIHR5cGU9aW1hZ2VtXG5cdFx0XHQvLyBpbWFnZS1vcmRlcltdPTItNzQ0LTE0ODgwOTcwMTMtNTc4XG5cdFx0XHQvLyBjYXB0aW9uPVxuXG5cdFx0XHQkKFwiLnN1Ym1pdC1idXR0b25cIiwgJGFwcFtcInBvc3RcIl0pLmFkZENsYXNzKFwiZGlzYWJsZWRcIikuaHRtbChcIkVudmlhbmRvJmhlbGxpcDtcIik7XG5cblx0XHRcdCQucG9zdChcIi90YXJlZmFzL1wiICsgdGFyZWZhX2FjdGl2ZSArIFwiL3Bvc3RhclwiLCBkYXRhKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChyZXNwb25zZVtcIm1ldGFcIl1bXCJzdGF0dXNcIl0gPT09IDIwMCkge1xuXHRcdFx0XHRcdGFwcC5Qb3N0LmNsb3NlKCk7XG5cdFx0XHRcdFx0YXBwLlRhcmVmYS5yZW5kZXIocmVzcG9uc2VbXCJkYXRhXCJdKTtcblx0XHRcdFx0XHRVSS50b2FzdC5vcGVuKHJlc3BvbnNlW1wibWV0YVwiXVtcIm1lc3NhZ2VcIl0pO1xuXHRcdFx0XHRcdG5hdmlnYXRvci52aWJyYXRlKDgwMCk7XG5cblx0XHRcdFx0XHRMaXN0YS5UYXJlZmFzW3Jlc3BvbnNlW1wiZGF0YVwiXVtcIm51bWVyb1wiXV0gPSByZXNwb25zZVtcImRhdGFcIl07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0VUkudG9hc3Qub3BlbigocmVzcG9uc2VbXCJtZXRhXCJdW1wibWVzc2FnZVwiXT8gcmVzcG9uc2VbXCJtZXRhXCJdW1wibWVzc2FnZVwiXSA6IFwiT2NvcnJldSB1bSBlcnJvLiBUZW50ZSBub3ZhbWVudGVcIikpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS5mYWlsKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRVSS50b2FzdC5vcGVuKFwiT2NvcnJldSB1bSBlcnJvLiBUZW50ZSBub3ZhbWVudGVcIiwgbnVsbCwgbnVsbCwgZmFsc2UpO1xuXHRcdFx0fSk7XG5cblx0XHR9KS5vbihcImNsaWNrXCIsIFwiLmJhY2stYnV0dG9uXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0YXBwLlBvc3QuY2xvc2UoKTtcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlBvc3QuYXV0aG9yaXplKClcblx0XHRhdXRob3JpemU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gaGFiaWxpdGEgbyBib3TDo28gZW52aWFyXG5cdFx0XHQkKFwiLnN1Ym1pdC1idXR0b25cIiwgJGFwcFtcInBvc3RcIl0pLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlBvc3QuZGVhdXRob3JpemUoKVxuXHRcdGRlYXV0aG9yaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIGRlc2FiaWxpdGEgbyBib3TDo28gXCJlbnZpYXJcIlxuXHRcdFx0JChcIi5zdWJtaXQtYnV0dG9uXCIsICRhcHBbXCJwb3N0XCJdKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Qb3N0LmdldFRodW1ibmFpbCgpXG5cdFx0Z2V0VGh1bWJuYWlsOiBmdW5jdGlvbih1cmwpIHtcblx0XHRcdC8vIHRlc3RhIHNlIHVybHMgc8OjbyBkb3MgcHJvdmlkZXIgYWNlaXRvcyBlIHJlc3BvbmRlIGNvbSBpbmZvcm1hw6fDtWVzIHNvYnJlIG8gdsOtZGVvLFxuXHRcdFx0Ly8gaW5jbHVpbmRvIGEgdXJsIGRhIG1pbmlhdHVyYVxuXHRcdFx0Ly8gcHJvdmlkZXJzIGFjZWl0b3M6IHlvdXR1YmUsIHZpbWVvLCB2aW5lXG5cdFx0XHR2YXIgbWVkaWFfaW5mbyA9IHsgfTtcblxuXHRcdFx0ZnVuY3Rpb24gc2hvd1RodW1ibmFpbChtZWRpYV9pbmZvKSB7XG5cdFx0XHRcdHZhciAkdGh1bWJuYWlsID0gJChcIjxpbWcgLz5cIikuYXR0cihcInNyY1wiLCBtZWRpYV9pbmZvW1widGh1bWJuYWlsXCJdKTtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS1wcm92aWRlclwiLCAkYXBwW1wicG9zdFwiXSkudmFsKG1lZGlhX2luZm9bXCJwcm92aWRlclwiXSk7XG5cdFx0XHRcdCQoXCIuanMtbWVkaWEtaWRcIiwgJGFwcFtcInBvc3RcIl0pLnZhbChtZWRpYV9pbmZvW1wiaWRcIl0pO1xuXHRcdFx0XHQkKFwiLmpzLW1lZGlhLXRodW1ibmFpbFwiLCAkYXBwW1wicG9zdFwiXSkudmFsKG1lZGlhX2luZm9bXCJ0aHVtYm5haWxcIl0pO1xuXHRcdFx0XHQkKFwiLmpzLW1lZGlhLXByZXZpZXdcIiwgJGFwcFtcInBvc3RcIl0pLmh0bWwoJHRodW1ibmFpbCkuZmFkZUluKCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHlvdXR1YmVcblx0XHRcdGlmICh1cmwubWF0Y2goLyg/Omh0dHBzPzpcXC97Mn0pPyg/Ond7M31cXC4pP3lvdXR1KD86YmUpP1xcLig/OmNvbXxiZSkoPzpcXC93YXRjaFxcP3Y9fFxcLykoW15cXHMmXSspLykpIHtcblx0XHRcdFx0Ly8gaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj00Y3Q0ZU5NckpsZ1xuXHRcdFx0XHR2YXIgeW91dHViZV91cmwgPSB1cmwubWF0Y2goLyg/Omh0dHBzPzpcXC97Mn0pPyg/Ond7M31cXC4pP3lvdXR1KD86YmUpP1xcLig/OmNvbXxiZSkoPzpcXC93YXRjaFxcP3Y9fFxcLykoW15cXHMmXSspLyk7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJwcm92aWRlclwiXSA9IFwieW91dHViZVwiO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1wiaWRcIl0gPSB5b3V0dWJlX3VybFsxXTtcblx0XHRcdC8vXHRtZWRpYV9pbmZvW1widGh1bWJuYWlsXCJdID0gXCJodHRwczovL2kxLnl0aW1nLmNvbS92aS9cIiArIHlvdXR1YmVfdXJsWzFdICsgXCIvbWF4cmVzZGVmYXVsdC5qcGdcIjtcblx0XHRcdFx0bWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSA9IFwiaHR0cHM6Ly9pMS55dGltZy5jb20vdmkvXCIgKyB5b3V0dWJlX3VybFsxXSArIFwiLzAuanBnXCI7XG5cblx0XHRcdFx0YXBwLlBvc3QuYXV0aG9yaXplKCk7XG5cdFx0XHRcdHNob3dUaHVtYm5haWwobWVkaWFfaW5mbyk7XG5cdFx0XHR9IGVsc2VcblxuXHRcdFx0Ly8gdmltZW9cblx0XHRcdGlmICh1cmwubWF0Y2goL3ZpbWVvXFwuY29tLykpIHtcblx0XHRcdFx0Ly8gaHR0cHM6Ly92aW1lby5jb20vNjQyNzk2NDlcblx0XHRcdFx0dmFyIHZpbWVvX3VybCA9IHVybC5tYXRjaCgvXFwvXFwvKHd3d1xcLik/dmltZW8uY29tXFwvKFxcZCspKCR8XFwvKS8pO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1wicHJvdmlkZXJcIl0gPSBcInZpbWVvXCI7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJpZFwiXSA9IHZpbWVvX3VybFsyXTtcblxuXHRcdFx0XHQkLmdldEpTT04oXCJodHRwczovL3ZpbWVvLmNvbS9hcGkvdjIvdmlkZW8vXCIgKyB2aW1lb191cmxbMl0gKyBcIi5qc29uP2NhbGxiYWNrPT9cIilcblx0XHRcdFx0XHQuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdFx0bWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSA9IHJlc3BvbnNlWzBdW1widGh1bWJuYWlsX2xhcmdlXCJdO1xuXG5cdFx0XHRcdFx0XHRhcHAuUG9zdC5hdXRob3JpemUoKTtcblx0XHRcdFx0XHRcdHNob3dUaHVtYm5haWwobWVkaWFfaW5mbyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlBvc3Qub3BlbigpXG5cdFx0b3BlbjogZnVuY3Rpb24odHlwZSwgbnVtZXJvKSB7XG5cdFx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdFx0XCJlZGljYW9cIjogTGlzdGEuRWRpY2FvW1widGl0dWxvXCJdLFxuXHRcdFx0XHRcIm51bWVyb1wiOiAobnVtZXJvIHx8IHRhcmVmYV9hY3RpdmUpLFxuXHRcdFx0XHRcInVzZXJcIjogTGlzdGEuVXN1YXJpb1tcImlkXCJdLFxuXHRcdFx0XHRcInR1cm1hXCI6IExpc3RhLlVzdWFyaW9bXCJ0dXJtYVwiXSxcblx0XHRcdFx0XCJ0b2tlblwiOiBMaXN0YS5Vc3VhcmlvW1widG9rZW5cIl1cblx0XHRcdH07XG5cdFx0XHR2YXIgJG5ld19wb3N0X3ZpZXcgPSBfX3JlbmRlcihcIm5ldy1wb3N0LVwiICsgdHlwZSwgZGF0YSk7XG5cblx0XHRcdC8vIGVmZWl0byBkZSBhYmVydHVyYVxuXHRcdFx0Ly8gX3ZpZXcub3BlbigkYXBwW1wicG9zdFwiXSwgJG5ld1Bvc3RWaWV3KTtcblx0XHRcdCRhcHBbXCJwb3N0XCJdLmh0bWwoJG5ld19wb3N0X3ZpZXcpLmFkZENsYXNzKFwiaW5cIikucmVmbG93KCkuYWRkQ2xhc3MoXCJzbGlkZS15XCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciB2aWV3X3RoZW1lX2NvbG9yID0gJChcIi5hcHBiYXJcIiwgJGFwcFtcInBvc3RcIl0pLmNzcyhcImJhY2tncm91bmQtY29sb3JcIik7XG5cdFx0XHRcdCQoXCJoZWFkIG1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKS5hdHRyKFwiY29udGVudFwiLCB2aWV3X3RoZW1lX2NvbG9yKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRhcHAuUG9zdC5kZWF1dGhvcml6ZSgpO1xuXG5cdFx0XHQvLyBhw6fDtWVzIHBhcmEgZmF6ZXIgcXVhbmRvIGFicmlyIGEgdGVsYSBkZSBlbnZpb1xuXHRcdFx0Ly8gZGUgYWNvcmRvIGNvbSBvIHRpcG8gZGUgcG9zdGFnZW1cblx0XHRcdGlmICh0eXBlID09PSBcInBob3RvXCIpIHtcblx0XHRcdFx0JGFwcFtcInBvc3RcIl0uZHJvcHpvbmUoKTtcblx0XHRcdFx0JChcIi5maWxlLXBsYWNlaG9sZGVyXCIsICRhcHBbXCJwb3N0XCJdKS50cmlnZ2VyKFwiY2xpY2tcIik7XG5cdFx0XHQvL1x0JChcImZvcm1cIiwgJG5ld19wb3N0X3ZpZXcpLmRyb3B6b25lKCk7XG5cdFx0XHR9IGVsc2VcblxuXHRcdFx0aWYgKHR5cGUgPT09IFwidmlkZW9cIiB8fCB0eXBlID09PSBcInZpbmVcIikge1xuXHRcdFx0XHQkKFwiLmpzLW1lZGlhLXVybC1pbnB1dFwiLCAkYXBwW1wicG9zdFwiXSkuZm9jdXMoKS5vbihcImtleXVwXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQvL1x0aWYgKCQuaW5BcnJheShldmVudC5rZXlDb2RlLCBbMTYsIDE3LCAxOF0pKSB7IHJldHVybjsgfVxuXHRcdFx0XHRcdGFwcC5Qb3N0LmdldFRodW1ibmFpbCgkKHRoaXMpLnZhbCgpKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2VcblxuXHRcdFx0aWYgKHR5cGUgPT09IFwidGV4dFwiKSB7XG5cdFx0XHRcdCQoXCIuanMtY2FwdGlvbi1pbnB1dFwiLCAkYXBwW1wicG9zdFwiXSkuZm9jdXMoKS5vbihcImtleXVwXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICgkKHRoaXMpLnZhbCgpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdGFwcC5Qb3N0LmF1dGhvcml6ZSgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRhcHAuUG9zdC5kZWF1dGhvcml6ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdFVJLmJhY2tkcm9wLnNob3coJGFwcFtcInBvc3RcIl0pO1xuXG5cdFx0XHQvLyB2aWV3IG1hbmFnZXJcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZXBsYWNlKFwibmV3LXBvc3RcIik7XG5cdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IFwidmlld1wiOiBcIm5ldy1wb3N0XCIsIFwidHlwZVwiOiB0eXBlLCBcImlkXCI6IGRhdGFbXCJudW1lcm9cIl0gfSwgbnVsbCwgbnVsbCk7XG5cdFx0fSxcblxuXHRcdC8vIHNlbmQ6IGZ1bmN0aW9uKCkge1xuXHRcdC8vXG5cdFx0Ly8gfSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlBvc3QuY2xvc2UoKVxuXHRcdGNsb3NlOiBmdW5jdGlvbigpIHtcblx0XHQvL1x0dGFyZWZhX2FjdGl2ZSA9IG51bGw7XG5cdFx0XHQkKFwiaGVhZCBtZXRhW25hbWU9J3RoZW1lLWNvbG9yJ11cIikuYXR0cihcImNvbnRlbnRcIiwgVUkuZGF0YVtcInRoZW1lLWNvbG9yXCJdW1wib3JpZ2luYWxcIl0pO1xuXG5cdFx0XHQkYXBwW1wicG9zdFwiXS5yZW1vdmVDbGFzcyhcInNsaWRlLXlcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGFwcFtcInBvc3RcIl0ucmVtb3ZlQ2xhc3MoXCJpblwiKS5lbXB0eSgpO1xuXHRcdFx0XHRVSS5iYWNrZHJvcC5oaWRlKCRhcHBbXCJwb3N0XCJdKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0ucmVwbGFjZShcInRhcmVmYVwiKTtcblx0XHR9XG5cdH07XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gaW1hZ2UgdXBsb2FkIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xudmFyIGZpbGVfc3RhY2sgPSB7IH07XG5cbmZ1bmN0aW9uIHVwbG9hZChmaWxlcykge1xuXHRsZXQgZXhpZl9vcmllbnRhdGlvbl90b19kZWdyZWVzID0ge1xuXHRcdDA6IDAsXG5cdFx0MTogMCxcblx0XHQyOiAwLFxuXHRcdDM6IDE4MCxcblx0XHQ0OiAwLFxuXHRcdDU6IDAsXG5cdFx0NjogOTAsXG5cdFx0NzogMCxcblx0XHQ4OiAyNzBcblx0fTtcblxuXHRGaWxlQVBJLmZpbHRlckZpbGVzKGZpbGVzLCBmdW5jdGlvbihmaWxlLCBpbmZvKSB7XG5cdFx0aWYgKC9eaW1hZ2UvLnRlc3QoZmlsZS50eXBlKSkge1xuXHRcdFx0ZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV0gPSBpbmZvO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0Ly9cdHJldHVybiBpbmZvLndpZHRoID49IDMyMCAmJiBpbmZvLmhlaWdodCA+PSAyNDA7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSwgZnVuY3Rpb24oZmlsZXMsIHJlamVjdGVkKSB7XG5cdFx0aWYgKGZpbGVzLmxlbmd0aCkge1xuXHRcdFx0JChcIi5zdWJtaXRcIiwgJGFwcFtcInBvc3RcIl0pLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG5cblx0XHRcdC8vIHByZXZpZXdcblx0XHRcdEZpbGVBUEkuZWFjaChmaWxlcywgZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0XHR2YXIgZXhpZl9vcmllbnRhdGlvbiA9IGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wiZXhpZlwiXVtcIk9yaWVudGF0aW9uXCJdO1xuXHRcdFx0XHRmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXSA9IHRhcmVmYV9hY3RpdmUgKyBcIi1cIiArIExpc3RhLlVzdWFyaW9bXCJpZFwiXSArIFwiLVwiICtcblx0XHRcdFx0XHRtb21lbnQoKS5mb3JtYXQoXCJYXCIpICsgXCItXCIgKyByYW5kKDAsIDk5OSkudG9GaXhlZCgwKTtcblxuXHRcdFx0XHRpZiAoZmlsZVtcInR5cGVcIl0gPT0gXCJpbWFnZS9naWZcIikge1xuXHRcdFx0XHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdFx0XHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0dmFyIGltZyA9ICQoXCI8aW1nIC8+XCIpLmF0dHIoXCJzcmNcIiwgZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG5cdFx0XHRcdFx0XHR2YXIgJHRyYWNrZXIgPSAkKFwiPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiaW1hZ2Utb3JkZXJbXVxcXCIgLz5cIikudmFsKGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdKTtcblxuXHRcdFx0XHRcdFx0dmFyICRzdGF0dXMgPSAkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcInByb2dyZXNzXCIpO1xuXHRcdFx0XHRcdFx0JChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJzdGF0dXNcIikuaHRtbChcIjxzdHJvbmc+RW52aWFuZG8maGVsbGlwOzwvc3Ryb25nPlwiKS5hcHBlbmRUbygkc3RhdHVzKTtcblx0XHRcdFx0XHRcdCQoXCI8ZGl2IC8+XCIpLmFkZENsYXNzKFwiYmFyXCIpLmFwcGVuZFRvKCRzdGF0dXMpO1xuXG5cdFx0XHRcdFx0XHR2YXIgJHByZXZpZXcgPSAkKFwiPGxpIC8+XCIpLmF0dHIoXCJpZFwiLCBcImZpbGUtXCIgK1xuXHRcdFx0XHRcdFx0XHRcdGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdKS5hcHBlbmQoJHRyYWNrZXIpLmFwcGVuZCgkc3RhdHVzKS5hcHBlbmQoaW1nKTtcblx0XHRcdFx0XHRcdCQoXCIjZHJvcHpvbmUgI2JvYXJkXCIpLmFwcGVuZCgkcHJldmlldyk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRGaWxlQVBJXG5cdFx0XHRcdFx0XHQuSW1hZ2UoZmlsZSlcblx0XHRcdFx0XHRcdC5yb3RhdGUoZXhpZl9vcmllbnRhdGlvbl90b19kZWdyZWVzW2V4aWZfb3JpZW50YXRpb25dKVxuXHRcdFx0XHRcdFx0LnJlc2l6ZSg2MDAsIDMwMCwgXCJwcmV2aWV3XCIpXG5cdFx0XHRcdFx0XHQuZ2V0KGZ1bmN0aW9uKGVyciwgaW1nKSB7XG5cdFx0XHRcdFx0XHQvL1x0JHRyYWNrZXIgPSAkKFwiPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiaW1hZ2Utb3JkZXJbXVxcXCIgLz5cIilcblx0XHRcdFx0XHRcdC8vXHRcdC52YWwodGFyZWZhX2FjdGl2ZSArIFwiLVwiICsgTGlzdGEuVXN1YXJpb1tcImlkXCJdICsgXCItXCIgKyBmaWxlW1wibmFtZVwiXSk7XG5cdFx0XHRcdFx0XHRcdHZhciAkdHJhY2tlciA9ICQoXCI8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJpbWFnZS1vcmRlcltdXFxcIiAvPlwiKS52YWwoZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0pO1xuXG5cdFx0XHRcdFx0XHRcdHZhciAkc3RhdHVzID0gJChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJwcm9ncmVzc1wiKTtcblx0XHRcdFx0XHRcdFx0JChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJzdGF0dXNcIikuaHRtbChcIjxzdHJvbmc+RW52aWFuZG8maGVsbGlwOzwvc3Ryb25nPlwiKS5hcHBlbmRUbygkc3RhdHVzKTtcblx0XHRcdFx0XHRcdFx0JChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJiYXJcIikuYXBwZW5kVG8oJHN0YXR1cyk7XG5cblx0XHRcdFx0XHRcdFx0dmFyICRwcmV2aWV3ID0gJChcIjxsaSAvPlwiKS5hdHRyKFwiaWRcIiwgXCJmaWxlLVwiICtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdKS5hcHBlbmQoJHRyYWNrZXIpLmFwcGVuZCgkc3RhdHVzKS5hcHBlbmQoaW1nKTtcblx0XHRcdFx0XHRcdFx0JChcIiNkcm9wem9uZSAjYm9hcmRcIikuYXBwZW5kKCRwcmV2aWV3KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gdXBsb2FkXG5cdFx0XHRGaWxlQVBJLnVwbG9hZCh7XG5cdFx0XHRcdHVybDogXCIvdGFyZWZhcy9cIiArIHRhcmVmYV9hY3RpdmUgKyBcIi9wb3N0YXJcIixcblx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFwiYWN0aW9uXCI6IFwidXBsb2FkXCIsXG5cdFx0XHRcdFx0XCJlZGljYW9cIjogTGlzdGEuRWRpY2FvW1widGl0dWxvXCJdLFxuXHRcdFx0XHRcdFwidGFyZWZhXCI6IHRhcmVmYV9hY3RpdmUsXG5cdFx0XHRcdFx0XCJ0dXJtYVwiOiBMaXN0YS5Vc3VhcmlvW1widHVybWFcIl0sXG5cdFx0XHRcdFx0XCJ1c2VyXCI6IExpc3RhLlVzdWFyaW9bXCJpZFwiXVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmVwYXJlOiBmdW5jdGlvbihmaWxlLCBvcHRpb25zKSB7XG5cdFx0XHRcdFx0b3B0aW9ucy5kYXRhLnJlZiA9IGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdO1xuXHRcdFx0XHRcdGZpbGUucmVmID0gZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl07XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0aW1hZ2VBdXRvT3JpZW50YXRpb246IChmaWxlc1swXVtcInR5cGVcIl0gIT09IFwiaW1hZ2UvZ2lmXCI/IHRydWUgOiBudWxsKSxcblx0XHRcdFx0aW1hZ2VUcmFuc2Zvcm06IChmaWxlc1swXVtcInR5cGVcIl0gIT09IFwiaW1hZ2UvZ2lmXCI/IHtcblx0XHRcdFx0XHRtYXhXaWR0aDogMTkyMCxcblx0XHRcdFx0XHRtYXhIZWlnaHQ6IDE5MjBcblx0XHRcdFx0fSA6IG51bGwpLFxuXG5cdFx0XHRcdGZpbGVzOiBmaWxlcyxcblx0XHRcdFx0ZmlsZXByb2dyZXNzOiBmdW5jdGlvbihldmVudCwgZmlsZSwgeGhyKSB7XG5cdFx0XHRcdFx0dmFyIHBlcmNlbnQgPSAoKGV2ZW50W1wibG9hZGVkXCJdIC8gZXZlbnRbXCJ0b3RhbFwiXSkgKiAxMDApLnRvRml4ZWQoMCksXG5cdFx0XHRcdFx0XHRzdGF0dXMgPSAocGVyY2VudCA8IDEwMD8gXCI8c3Ryb25nPkVudmlhbmRvJmhlbGxpcDs8L3N0cm9uZz4gXCIgK1xuXHRcdFx0XHRcdFx0XHRcdHBlcmNlbnQgKyBcIiVcIiA6IFwiPHN0cm9uZz5Qcm9jZXNzYW5kbyZoZWxsaXA7PC9zdHJvbmc+XCIpO1xuXG5cdFx0XHRcdFx0JChcIiNmaWxlLVwiICsgZmlsZVtcInJlZlwiXSArIFwiIC5zdGF0dXNcIiwgXCIjZHJvcHpvbmVcIikuaHRtbChzdGF0dXMpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcm9ncmVzczogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0Ly9cdHZhciBwZXJjZW50ID0gKChldmVudFtcImxvYWRlZFwiXSAvIGV2ZW50W1widG90YWxcIl0pICogMTAwKS50b0ZpeGVkKDApICsgXCIlXCJcblx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKHBlcmNlbnQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRmaWxlY29tcGxldGU6IGZ1bmN0aW9uKGZpbGUsIHhociwgb3B0aW9ucykge1xuXHRcdFx0XHQvL1x0Y29uc29sZS5sb2coZmlsZSwgeGhyLCBvcHRpb25zKTtcblx0XHRcdFx0XHQkKFwiI2ZpbGUtXCIgKyBvcHRpb25zW1wicmVmXCJdICsgXCIgLnN0YXR1c1wiLCBcIiNkcm9wem9uZVwiKS5odG1sKFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj5jaGVjazwvaT5cIik7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbihlcnIsIHhocikge1xuXHRcdFx0XHRcdGFwcC5Qb3N0LmF1dGhvcml6ZSgpO1xuXHRcdFx0XHRcdC8vICQoXCIuc3VibWl0LWJ1dHRvblwiLCAkYXBwW1wicG9zdFwiXSkucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuJC5mbi5kcm9wem9uZSA9IGZ1bmN0aW9uKCkge1xuXHQvLyBkcm9wem9uZVxuXHR2YXIgJGRyb3B6b25lID0gJChcIiNkcm9wem9uZVwiLCB0aGlzKTtcblx0RmlsZUFQSS5ldmVudC5kbmQoJGRyb3B6b25lWzBdLCBmdW5jdGlvbihvdmVyKSB7XG5cdFx0aWYgKG92ZXIpIHtcblx0XHRcdCRkcm9wem9uZS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JGRyb3B6b25lLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuXHRcdH1cblx0fSwgZnVuY3Rpb24oZmlsZXMpIHtcblx0XHR1cGxvYWQoZmlsZXMpO1xuXHR9KTtcblxuXHQvLyBtYW51YWwgc2VsZWN0XG5cdHZhciAkZmlsZV9pbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZm9ybS1maWxlXCIpO1xuXHRGaWxlQVBJLmV2ZW50Lm9uKCRmaWxlX2lucHV0LCBcImNoYW5nZVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciBmaWxlcyA9IEZpbGVBUEkuZ2V0RmlsZXMoZXZlbnQpO1xuXHRcdHVwbG9hZChmaWxlcyk7XG5cdH0pO1xuXG5cdC8vIHJlb3JkZXJcblx0dmFyICRib2FyZCA9ICQoXCIjYm9hcmRcIiwgdGhpcyk7XG5cdCRib2FyZC5vbihcInNsaXA6YmVmb3Jld2FpdFwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmIChVSS5kYXRhW1wiaW50ZXJhY3Rpb24tdHlwZVwiXSA9PT0gXCJwb2ludGVyXCIpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHR9KS5vbihcInNsaXA6YWZ0ZXJzd2lwZVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnRhcmdldC5yZW1vdmUoKTtcblx0fSkub24oXCJzbGlwOnJlb3JkZXJcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XG5cdFx0ZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGV2ZW50LnRhcmdldCwgZXZlbnQuZGV0YWlsLmluc2VydEJlZm9yZSk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcblxuXHRuZXcgU2xpcCgkYm9hcmRbMF0pO1xufTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGxvZ2luIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5Mb2dpbi5vcGVuKClcbi8vIGFwcC5Mb2dpbi5jbG9zZSgpXG4vLyBhcHAuTG9naW4uc3VibWl0KCkgWz9dXG4vLyBhcHAuTG9naW4ubG9nb3V0KClcblxuYXBwLkxvZ2luID0gKGZ1bmN0aW9uKCkge1xuXHRMaXN0YS5Vc3VhcmlvID0ge1xuXHRcdFwiaWRcIjogbnVsbCxcblx0XHRcIm5hbWVcIjogbnVsbCxcblx0XHRcImVtYWlsXCI6IG51bGwsXG5cdFx0XCJ0b2tlblwiOiBudWxsLFxuXHRcdFwidHVybWFcIjogbnVsbCxcblx0XHRcInNpZ25lZC1pblwiOiBmYWxzZVxuXHR9O1xuXG5cdC8vIFNlIHRpdmVyIGRhZG9zIGd1YXJkYWRvcyBubyBsb2NhbFN0b3JhZ2UsIHVzYSBlbGVzIHByYSBsb2dhclxuXHRpZiAobG9jYWxTdG9yYWdlICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiTGlzdGEuVXN1YXJpb1wiKSkge1xuXHRcdExpc3RhLlVzdWFyaW8gPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiTGlzdGEuVXN1YXJpb1wiKSk7XG5cblx0XHQkKGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKExpc3RhLlVzdWFyaW9bXCJpZFwiXSAhPT0gbnVsbCkge1xuXHRcdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwic2lnbmVkLWluIHVzZXItXCIgKyBMaXN0YS5Vc3VhcmlvW1widHVybWFcIl0pO1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFVJLnRvYXN0LnNob3coXCJPbMOhIFwiICsgTGlzdGEuVXN1YXJpb1tcIm5hbWVcIl0gKyBcIiFcIik7XG5cdFx0XHRcdH0sIDMwMDApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0JChmdW5jdGlvbigpIHtcblx0XHQkdWlbXCJsb2dpblwiXSA9ICQoXCIuYXBwLWxvZ2luXCIpO1xuXG5cdFx0Ly8gQm90w7VlcyBkZSBsb2dpbiBlIGxvZ291dFxuXHRcdCQoXCIuanMtbG9naW4tdHJpZ2dlclwiLCAkdWlbXCJzaWRlbmF2XCJdKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0VUkuc2lkZW5hdi5jbG9zZSgpO1xuXHRcdFx0YXBwLkxvZ2luLnNob3coKTtcblx0XHR9KTtcblxuXHRcdCQoXCIuanMtbG9nb3V0LXRyaWdnZXJcIiwgJHVpW1wic2lkZW5hdlwiXSkub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFVJLnNpZGVuYXYuY2xvc2UoKTtcblx0XHRcdGFwcC5Mb2dpbi5sb2dvdXQoKTtcblx0XHR9KTtcblxuXHRcdC8vIEHDp8OjbyBkZSBsb2dpblxuXHRcdCR1aVtcImxvZ2luXCJdLm9uKFwiY2xpY2tcIiwgXCIuYmFjay1idXR0b25cIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRhcHAuTG9naW4uaGlkZSgpO1xuXHRcdH0pLm9uKFwic3VibWl0XCIsIFwiZm9ybVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0bGV0IGxvZ2luX2RhdGEgPSAkKFwiZm9ybVwiLCAkdWlbXCJsb2dpblwiXSkuc2VyaWFsaXplKCk7XG5cdFx0XHRhcHAuTG9naW4uc3VibWl0KGxvZ2luX2RhdGEpO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxvZ2luLnNob3coKVxuXHRcdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gQWJyZSBhIHRlbGEgZGUgbG9naW4gZSBjb2xvY2EgbyBmb2NvIG5vIGNhbXBvIGUtbWFpbFxuXHRcdFx0JHVpW1wibG9naW5cIl0uYWRkQ2xhc3MoXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlXCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFVJLmJvZHkubG9jaygpO1xuXHRcdFx0XHRVSS5iYWNrZHJvcC5zaG93KCR1aVtcImxvZ2luXCJdKTtcblx0XHRcdFx0JChcImlucHV0W25hbWU9J2VtYWlsJ11cIiwgJHVpW1wibG9naW5cIl0pLmZvY3VzKCk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTG9naW4uaGlkZSgpXG5cdFx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJsb2dpblwiXS5yZW1vdmVDbGFzcyhcInNsaWRlXCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR1aVtcImxvZ2luXCJdLnJlbW92ZUNsYXNzKFwiaW5cIik7XG5cdFx0XHRcdFVJLmJhY2tkcm9wLmhpZGUoJHVpW1wibG9naW5cIl0pO1xuXHRcdFx0XHRVSS5ib2R5LnVubG9jaygpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxvZ2luLnN1Ym1pdCgpXG5cdFx0c3VibWl0OiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRMaXN0YUFQSShcIi9hdXRoXCIsIGRhdGEpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKHJlc3BvbnNlW1wibWV0YVwiXVtcInN0YXR1c1wiXSA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0TGlzdGEuVXN1YXJpbyA9IHJlc3BvbnNlW1widXNlclwiXTtcblx0XHRcdFx0XHRMaXN0YS5Vc3VhcmlvW1wic2lnbmVkLWluXCJdID0gdHJ1ZTtcblx0XHRcdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIkxpc3RhLlVzdWFyaW9cIiwgSlNPTi5zdHJpbmdpZnkoTGlzdGEuVXN1YXJpbykpO1xuXG5cdFx0XHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInNpZ25lZC1pbiB1c2VyLVwiICsgTGlzdGEuVXN1YXJpb1tcInR1cm1hXCJdKTtcblx0XHRcdFx0XHRhcHAuTG9naW4uaGlkZSgpO1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRVSS50b2FzdC5zaG93KFwiT2zDoSBcIiArIExpc3RhLlVzdWFyaW9bXCJuYW1lXCJdICsgXCIhXCIpO1xuXHRcdFx0XHRcdH0sIDUwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JChcIi5mb3JtLWdyb3VwXCIsICR1aVtcImxvZ2luXCJdKS5hZGRDbGFzcyhcImFuaW1hdGVkIHNoYWtlXCIpO1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7ICQoXCIuZm9ybS1ncm91cFwiLCAkdWlbXCJsb2dpblwiXSkucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBzaGFrZVwiKTsgfSwgMTAwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Mb2dpbi5sb2dvdXQoKVxuXHRcdGxvZ291dDogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBUaXJhIGFzIGNsYXNzZXMgaW5kaWNhZG9yYXMgZGUgbG9naW4gZG8gYm9keVxuXHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInNpZ25lZC1pbiB1c2VyLVwiICsgTGlzdGEuVXN1YXJpb1tcInR1cm1hXCJdKTtcblxuXHRcdFx0Ly8gTGltcGEgTGlzdGEuVXN1YXJpbyB0YW50byBuYSBww6FnaW5hIHF1YW50byBubyBsb2NhbFN0b3JhZ2Vcblx0XHRcdExpc3RhLlVzdWFyaW8gPSB7XG5cdFx0XHRcdFwiaWRcIjogbnVsbCxcblx0XHRcdFx0XCJuYW1lXCI6IG51bGwsXG5cdFx0XHRcdFwiZW1haWxcIjogbnVsbCxcblx0XHRcdFx0XCJ0b2tlblwiOiBudWxsLFxuXHRcdFx0XHRcInR1cm1hXCI6IG51bGwsXG5cdFx0XHRcdFwic2lnbmVkLWluXCI6IGZhbHNlXG5cdFx0XHR9O1xuXG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIkxpc3RhLlVzdWFyaW9cIiwgSlNPTi5zdHJpbmdpZnkoTGlzdGEuVXN1YXJpbykpO1xuXG5cdFx0XHQvLyBEZXBvaXMgZGUgMCw1IHNlZ3VuZG8sXG5cdFx0XHQvLyBtb3N0cmEgdG9hc3QgY29uZmlybWFuZG8gbG9nb3V0XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRVSS50b2FzdC5zaG93KFwiU2Vzc8OjbyBlbmNlcnJhZGEhXCIpO1xuXHRcdFx0fSwgNTAwKTtcblx0XHR9XG5cdH07XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gd29ya2VycyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBzdGFydFxud29ya2VyLlN0YXJ0ID0gKGZ1bmN0aW9uKCkge1xuXHR0aW1lb3V0W1wiZGVsYXktc3RhcnRcIl0gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdGxvZyhcIndvcmtlci5TdGFydFwiLCBcImluZm9cIik7XG5cblx0XHRjdWVbXCJsb2FkLWVkaWNhb1wiXSA9ICQuRGVmZXJyZWQoKTtcblx0XHR3b3JrZXIuTG9hZCgpO1xuXG5cdFx0Y3VlW1wibG9hZC1lZGljYW9cIl0uZG9uZShmdW5jdGlvbigpIHtcblx0XHRcdHRpbWVvdXRbXCJkZWxheS1ldm9sdWNhb1wiXSA9IHNldFRpbWVvdXQoYXBwLkV2b2x1Y2FvLnN0YXJ0LCAyMDApO1xuXG5cdFx0XHQvLyBTZSB0aXZlciBuw7ptZXJvIGRlIHRhcmVmYSBlc3BlY2lmaWNhZG8gbmEgVVJMLCBhYnJlIGVsYVxuXHRcdFx0aWYgKHJvdXRlcltcInBhdGhcIl0gJiYgcm91dGVyW1wicGF0aFwiXVsyXSkge1xuXHRcdFx0XHQvLyBBbnRlcywgdGVzdGEgc2UgbyB2YWxvciDDqSB1bSBuw7ptZXJvXG5cdFx0XHRcdC8vIGUgZGVudHJvIGRvIG7Dum1lcm8gZGUgdGFyZWZhcyBkZXNzYSBFZGnDp8Ojb1xuXHRcdFx0XHRsZXQgbnVtZXJvID0gcm91dGVyW1wicGF0aFwiXVsyXTtcblx0XHRcdFx0aWYgKCFpc05hTihudW1lcm8pICYmIG51bWVybyA+PSAxICYmIG51bWVybyA8PSBMaXN0YS5FZGljYW9bXCJudW1lcm8tZGUtdGFyZWZhc1wiXSkge1xuXHRcdFx0XHRcdGFwcC5UYXJlZmEub3BlbihudW1lcm8sIGZhbHNlLCBmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSwgMCk7XG59KSgpO1xuXG5cbi8vIGxvYWRcbndvcmtlci5Mb2FkID0gKGZ1bmN0aW9uKCkge1xuXHR0aW1lb3V0W1wiZGVsYXktbG9hZFwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0bG9nKFwid29ya2VyLkxvYWRcIiwgXCJpbmZvXCIpO1xuXG5cdFx0TGlzdGFBUEkoXCIvdHVkb1wiKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRsb2coXCJjdWVbXFxcImxvYWQtZWRpY2FvXFxcIl0gdHJpZ2dlcmVkXCIpO1xuXHRcdFx0TGlzdGEuRWRpY2FvID0gcmVzcG9uc2VbXCJlZGljYW9cIl07XG5cdFx0XHRMaXN0YS5QbGFjYXIgPSByZXNwb25zZVtcInBsYWNhclwiXTtcblx0XHRcdExpc3RhLlRhcmVmYXMgPSByZXNwb25zZVtcInRhcmVmYXNcIl07XG5cblx0XHRcdHRpbWVvdXRbXCJkZWxheS1saXN0YVwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGFwcC5MaXN0YS5zdGFydCgpO1xuXHRcdFx0XHRjdWVbXCJsb2FkLWVkaWNhb1wiXS5yZXNvbHZlKCk7XG5cdFx0XHR9LCAxKTtcblx0XHRcdC8vIHRpbWVvdXRbXCJkZWxheS1wbGFjYXJcIl0gPSBzZXRUaW1lb3V0KGFwcC5QbGFjYXIuc3RhcnQsIDQwMCk7XG5cblx0XHRcdC8vIHZhciBkYXRhID0gcmVzcG9uc2VbXCJkYXRhXCJdO1xuXHRcdFx0Ly8gTGlzdGEuSWRlbnRpZmljYWNhbyA9IGRhdGE7XG5cblx0XHR9KTtcblxuXHRcdHdvcmtlci5VcGRhdGUoKTtcblx0fSwgMzAwKTtcbn0pO1xuXG5cbi8vIHVwZGF0ZVxud29ya2VyLlVwZGF0ZSA9IChmdW5jdGlvbigpIHtcblx0bGV0IHVwZGF0ZXMgPSB7XG5cdFx0XCJ0YXJlZmFzXCI6IDAsXG5cdFx0XCJwb3N0c1wiOiAwLFxuXHRcdFwidG90YWxcIjogMCxcblx0XHRcImxhc3QtdXBkYXRlZFwiOiBudWxsXG5cdH07XG5cblx0dGltZW91dFtcImF0aXZpZGFkZVwiXSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdGxvZyhcIndvcmtlci5VcGRhdGVcIiwgXCJpbmZvXCIpO1xuXG5cdFx0TGlzdGFBUEkoXCIvYXRpdmlkYWRlXCIpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdC8vIENvbmZlcmUgZGF0YSBkZSBjYWRhIGF0aXZpZGFkZSBlIHbDqiBzZSDDqSBwb3N0ZXJpb3Igw6Agw7psdGltYSBhdHVhbGl6YcOnw6NvLlxuXHRcdFx0Ly8gU2UgZm9yLCBhZGljaW9uYSDDoCBjb250YWdlbSBkZSBub3ZhIGF0aXZpZGFkZVxuXHRcdFx0Zm9yIChsZXQgYXRpdmlkYWRlIG9mIHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChtb21lbnQoYXRpdmlkYWRlW1widHNcIl0pLmlzQWZ0ZXIodXBkYXRlc1tcImxhc3QtdXBkYXRlZFwiXSkgJiYgYXRpdmlkYWRlW1wiYXV0b3JcIl0gIT0gTGlzdGEuVXN1YXJpb1tcImlkXCJdKSB7XG5cdFx0XHRcdFx0dXBkYXRlc1tcInRvdGFsXCJdKys7XG5cdFx0XHRcdFx0aWYgKHZhbHVlW1wiYWNhb1wiXSA9PT0gXCJub3ZvLXRhcmVmYVwiKSB7XG5cdFx0XHRcdFx0XHR1cGRhdGVzW1widGFyZWZhc1wiXSsrO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodmFsdWVbXCJhY2FvXCJdID09PSBcIm5vdm8tcG9zdFwiKSB7XG5cdFx0XHRcdFx0XHR1cGRhdGVzW1wicG9zdHNcIl0rKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gU2UgaG91dmVyIG5vdmEgYXRpdmlkYWRlXG5cdFx0XHRpZiAodXBkYXRlc1tcInRvdGFsXCJdID4gMCkge1xuXHRcdFx0XHQvLyBNb250YSBvIHRleHRvIGRvIHRvYXN0XG5cdFx0XHRcdGxldCB0ZXh0byA9IHtcblx0XHRcdFx0XHRcInRhcmVmYXNcIjogdXBkYXRlc1tcInRhcmVmYXNcIl0gKyBcIiBcIiArICh1cGRhdGVzW1widGFyZWZhc1wiXSA+IDE/IFwibm92YXMgdGFyZWZhc1wiIDogXCJub3ZhIHRhcmVmYVwiKSxcblx0XHRcdFx0XHRcInBvc3RzXCI6IHVwZGF0ZXNbXCJwb3N0c1wiXSArIFwiIFwiICsgKHVwZGF0ZXNbXCJwb3N0c1wiXSA+IDE/IFwibm92b3MgcG9zdHNcIiA6IFwibm92byBwb3N0XCIpLFxuXHRcdFx0XHRcdFwiZmluYWxcIjogXCJcIlxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmICh1cGRhdGVzW1widGFyZWZhc1wiXSA+IDApIHtcblx0XHRcdFx0XHR0ZXh0b1tcImZpbmFsXCJdICs9IHRleHRvW1widGFyZWZhc1wiXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoKHVwZGF0ZXNbXCJ0YXJlZmFzXCJdID4gMCkgJiYgKHVwZGF0ZXNbXCJwb3N0c1wiXSA+IDApKSB7XG5cdFx0XHRcdFx0dGV4dG9bXCJmaW5hbFwiXSArPSBcIiBlIFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh1cGRhdGVzW1wicG9zdHNcIl0gPiAwKSB7XG5cdFx0XHRcdFx0dGV4dG9bXCJmaW5hbFwiXSArPSB0ZXh0b1tcInBvc3RzXCJdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0VUkudG9hc3Quc2hvdyh7XG5cdFx0XHRcdFx0XCJwZXJzaXN0ZW50XCI6IHRydWUsXG5cdFx0XHRcdFx0XCJtZXNzYWdlXCI6IHRleHRvW1wiZmluYWxcIl0sXG5cdFx0XHRcdFx0XCJsYWJlbFwiOiBcIkF0dWFsaXphclwiLFxuXHRcdFx0XHRcdFwiYWN0aW9uXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0d29ya2VyLkxvYWQoKTtcblx0XHRcdFx0XHRcdHVwZGF0ZXNbXCJ0YXJlZmFzXCJdID0gMDtcblx0XHRcdFx0XHRcdHVwZGF0ZXNbXCJwb3N0c1wiXSA9IDA7XG5cdFx0XHRcdFx0XHR1cGRhdGVzW1widG90YWxcIl0gPSAwO1xuXHRcdFx0XHRcdFx0JHVpW1wicGFnZS10aXRsZVwiXS5odG1sKFVJLmRhdGFbXCJwYWdlLXRpdGxlXCJdKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIE1vc3RyYSBuw7ptZXJvIGRlIG5vdmFzIGF0aXZpZGFkZXMgbm8gdMOtdHVsb1xuXHRcdFx0XHQkdWlbXCJ0aXRsZVwiXS5odG1sKFwiKFwiICsgdXBkYXRlc1tcInRvdGFsXCJdICsgXCIpIFwiICsgVUkuZGF0YVtcInBhZ2UtdGl0bGVcIl0pO1xuXHRcdFx0fVxuXG5cdFx0XHR1cGRhdGVzW1wibGFzdC11cGRhdGVkXCJdID0gKHJlc3BvbnNlWzBdPyBtb21lbnQocmVzcG9uc2VbMF1bXCJ0c1wiXSkgOiBtb21lbnQoKSk7XG5cdFx0fSk7XG5cdH0sIDMwICogMTAwMCk7XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGZvbnRzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gQ3JpYSB1bWEgcHJvbWlzZSBxdWUgc2Vyw6EgcmVzb2x2aWRhXG4vLyBxdWFuZG8gYXMgZm9udGVzIGZvcmVtIGNhcnJlZ2FkYXNcbmN1ZVtcImxvYWQtZm9udHNcIl0gPSAkLkRlZmVycmVkKCk7XG5cbldlYkZvbnQubG9hZCh7XG5cdHRpbWVvdXQ6IDE1MDAwLFxuXHRnb29nbGU6IHtcblx0XHRmYW1pbGllczogW1xuXHRcdFx0XCJNYXRlcmlhbCBJY29uc1wiLFxuXHRcdFx0XCJSb2JvdG86NDAwLDQwMGl0YWxpYyw1MDA6bGF0aW5cIixcblx0XHRcdFwiUm9ib3RvK01vbm86NzAwOmxhdGluXCIsXG5cdFx0XHRcIkxhdG86NDAwOmxhdGluXCJcblx0XHRdXG5cdH0sXG5cdGN1c3RvbToge1xuXHRcdGZhbWlsaWVzOiBbXG5cdFx0XHRcIkZvbnRBd2Vzb21lXCJcblx0XHRdLFxuXHRcdHVybHM6IFtcblx0XHRcdFwiaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvZm9udC1hd2Vzb21lLzQuNy4wL2Nzcy9mb250LWF3ZXNvbWUubWluLmNzc1wiXG5cdFx0XVxuXHR9LFxuXHRhY3RpdmU6IGZ1bmN0aW9uKCkge1xuXHRcdGN1ZVtcImxvYWQtZm9udHNcIl0ucmVzb2x2ZSgpO1xuXG5cdFx0JChmdW5jdGlvbigpIHtcblx0XHRcdGFwcC5MaXN0YS5sYXlvdXQoKTtcblx0XHR9KTtcblx0fVxufSk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBtb21lbnRqcyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbm1vbWVudC5sb2NhbGUoXCJwdC1iclwiLCB7XG5cdFx0XCJtb250aHNcIjogXCJqYW5laXJvX2ZldmVyZWlyb19tYXLDp29fYWJyaWxfbWFpb19qdW5ob19qdWxob19hZ29zdG9fc2V0ZW1icm9fb3V0dWJyb19ub3ZlbWJyb19kZXplbWJyb1wiLnNwbGl0KFwiX1wiKSxcblx0XHRcIm1vbnRoc1Nob3J0XCI6IFwiamFuX2Zldl9tYXJfYWJyX21haV9qdW5fanVsX2Fnb19zZXRfb3V0X25vdl9kZXpcIi5zcGxpdChcIl9cIiksXG5cdFx0XCJ3ZWVrZGF5c1wiOiBcImRvbWluZ29fc2VndW5kYS1mZWlyYV90ZXLDp2EtZmVpcmFfcXVhcnRhLWZlaXJhX3F1aW50YS1mZWlyYV9zZXh0YS1mZWlyYV9zw6FiYWRvXCIuc3BsaXQoXCJfXCIpLFxuXHRcdFwid2Vla2RheXNTaG9ydFwiOiBcImRvbV9zZWdfdGVyX3F1YV9xdWlfc2V4X3PDoWJcIi5zcGxpdChcIl9cIiksXG5cdFx0XCJ3ZWVrZGF5c01pblwiOiBcImRvbV8ywqpfM8KqXzTCql81wqpfNsKqX3PDoWJcIi5zcGxpdChcIl9cIiksXG5cdFx0XCJsb25nRGF0ZUZvcm1hdFwiOiB7XG5cdFx0XHRcIkxUXCI6IFwiSEg6bW1cIixcblx0XHRcdFwiTFRTXCI6IFwiSEg6bW06c3NcIixcblx0XHRcdFwiTFwiOiBcIkREL01NL1lZWVlcIixcblx0XHRcdFwiTExcIjogXCJEIFtkZV0gTU1NTSBbZGVdIFlZWVlcIixcblx0XHRcdFwiTExMXCI6IFwiRCBbZGVdIE1NTU0gW2RlXSBZWVlZIFvDoHNdIEhIOm1tXCIsXG5cdFx0XHRcIkxMTExcIjogXCJkZGRkLCBEIFtkZV0gTU1NTSBbZGVdIFlZWVkgW8Ogc10gSEg6bW1cIlxuXHRcdH0sXG5cdFx0XCJjYWxlbmRhclwiOiB7XG5cdFx0XHRcInNhbWVEYXlcIjogXCJbaG9qZV0gTFRcIixcblx0XHRcdFwibmV4dERheVwiOiBcIlthbWFuaMOjXSBMVFwiLFxuXHRcdFx0XCJuZXh0V2Vla1wiOiBcImRkZGQgTFRcIixcblx0XHRcdFwibGFzdERheVwiOiBcIltvbnRlbV0gTFRcIixcblx0XHRcdFwibGFzdFdlZWtcIjogXCJkZGRkIExUXCIsXG5cdFx0XHRcInNhbWVFbHNlXCI6IFwiTFwiXG5cdFx0fSxcblx0XHRcInJlbGF0aXZlVGltZVwiOiB7XG5cdFx0XHRcImZ1dHVyZVwiOiBcImRhcXVpICVzXCIsXG5cdFx0XHRcInBhc3RcIjogXCIlcyBhdHLDoXNcIixcblx0XHRcdFwic1wiOiBcInBvdWNvcyBzZWd1bmRvc1wiLFxuXHRcdFx0XCJtXCI6IFwidW0gbWludXRvXCIsXG5cdFx0XHRcIm1tXCI6IFwiJWQgbWludXRvc1wiLFxuXHRcdFx0XCJoXCI6IFwidW1hIGhvcmFcIixcblx0XHRcdFwiaGhcIjogXCIlZCBob3Jhc1wiLFxuXHRcdFx0XCJkXCI6IFwidW0gZGlhXCIsXG5cdFx0XHRcImRkXCI6IFwiJWQgZGlhc1wiLFxuXHRcdFx0XCJNXCI6IFwidW0gbcOqc1wiLFxuXHRcdFx0XCJNTVwiOiBcIiVkIG1lc2VzXCIsXG5cdFx0XHRcInlcIjogXCJ1bSBhbm9cIixcblx0XHRcdFwieXlcIjogXCIlZCBhbm9zXCJcblx0XHR9LFxuXHRcdFwib3JkaW5hbFBhcnNlXCI6IC9cXGR7MSwyfcK6Lyxcblx0XHRcIm9yZGluYWxcIjogXCIlZMK6XCJcblx0fSk7XG4iXX0=
