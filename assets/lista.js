////////////////////////////////////////////////////////////////////////////////////////////////////
// lista de tarefas ////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

let Lista = [];
Lista.Edicao = [];
Lista.Placar = [];
Lista.Tarefas = [];

let app = [];
let $app = [];

let cache = [];
cache["tarefas"] = [];

////////////////////////////////////////////////////////////////////////////////////////////////////

let cue = [];
let worker = [];
let timeout = [];

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

var ui = [];

Lista.Regulamento = []; // TODO deprecated
// var edicao = "xciii";


// laguinho.org/tarefas
var tarefas = {};

////////////////////////////////////////////////////////////////////////////////////////////////////
// elements & helpers //////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// var $theme_color, theme_color = { };
var tarefa_active;

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui //////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// o objeto "ui" guarda informações sobre a interface, como dimensões e tipo de interação
// var ui  = { };


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

// var api_key;

////////////////////////////////////////////////////////////////////////////////////////////////////
// utilities ///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// rand
function rand(min, max) {
	return Math.random() * (max - min) + min;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// template engine /////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

var $templates = {};

$(function () {
	$("template").each(function () {
		var $this = $(this);
		var name = $this.attr("id");
		var html = $this.html();

		$templates[name] = $(html);
		$this.remove();
	});
});

function __render(template, data) {
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

			source = source.split("/");
			if (source.length > 1 && typeof value !== "undefined") {
				value = data[source[0]];

				for (var j = 1; j < source.length; j++) {
					value = value[source[j]] ? value[source[j]] : null;
				}
			}

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
			bottomsheet.close();
		}
		if (router["current-view"].indexOf("new-post") > -1) {
			post.close();
		}
		app.Tarefa.open(state["id"]);
	} else if (state && state["view"] === "new-post") {
		post.open(state["type"], state["id"]);
	} else if (state && state["view"] === "bottomsheet") {
		if (router["current-view"].indexOf("new-post") > -1) {
			post.close();
		}
	}

	//	if (state["view"] === "home") {
	else {
			if (router["current-view"].indexOf("bottomsheet") > -1) {
				bottomsheet.close();
			}
			if (router["current-view"].indexOf("new-post") > -1) {
				post.close();
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
let $ui = [];

UI.data = [];

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

// Dados consultáveis:
// UI.data["window"]["width"]
// UI.data["window"]["height"]
// UI.data["scroll-position"]["top"]
// UI.data["scroll-position"]["bottom"]
// UI.data["columns"]
// UI.data["interaction-type"]
// UI.data["theme-color"]["original"]
// UI.data["title"]

// Dados definidos:
// UI.data["column-width"]


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Função para forçar reflow
$.fn.reflow = function () {
	var offset = $ui["body"].offset().left;
	return $(this);
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui / body ///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// UI.body.lock()
// UI.body.unlock()

UI.body = function () {
	$(function () {
		$ui["body"] = $(document.body);
		$ui["body"].addClass("ui-" + UI.data["interaction-type"]);
		scrollStatus();
	});

	$(window).on("scroll", scrollStatus);

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
			$ui["body"].addClass("no-scroll");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// UI.body.unlock()
		unlock: function () {
			$ui["body"].removeClass("no-scroll");
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
// toast ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

UI.toast = function () {
	return {
		// TODO nova sintaxe, usar template e __render
		show: function (config) {
			if (typeof config === "object") {
				$ui.toast["message"].html(config["message"]);
				$ui.toast["action"].html(config["action"] ? config["action"] : "");
				$ui.toast.addClass("in").reflow().addClass("slide");
				$ui["body"].addClass("toast-active");

				// TODO: .fab-bottom transform: translateY

				$ui.toast.on("click", UI.toast.dismiss);
				$ui.toast["action"].on("click", config["callback"]);

				clearTimeout(timeout["toast"]);

				if (!config["persistent"]) {
					$ui.toast.removeClass("stream-only");
					timeout["toast"] = setTimeout(UI.toast.dismiss, config["timeout"] ? config["timeout"] : 6000);
				} else {
					$ui.toast.addClass("stream-only");
				}
			} else {
				UI.toast.show({
					"message": config
				});
			}
		},

		dismiss: function () {
			$ui.toast.removeClass("slide").one("transitionend", function () {
				$ui["body"].removeClass("toast-active");
				$ui.toast.removeClass("in stream-only");

				$ui.toast["message"].empty();
				$ui.toast["action"].empty();
			});
			clearTimeout(timeout["toast"]);
		},

		// TODO DEPRECATED
		open: function (message, action, callback, persistent) {
			// open: function(message, addClass) {
			$ui.toast.message.html(message);
			$ui.toast.action.html(action ? action : "");
			$ui.toast.addClass("in").reflow().addClass("slide");
			$ui["body"].addClass("toast-active");

			// TODO: .fab-bottom transform: translateY

			$ui.toast.on("click", toast.close);
			$ui.toast.action.on("click", callback);

			clearTimeout(timeout["toast"]);
			if (!persistent) {
				$ui.toast.removeClass("stream-only");
				timeout["toast"] = setTimeout(toast.close, 6500);
			} else {
				$ui.toast.addClass("stream-only");
			}
		}
	};
}();

var toast = UI.toast;
toast.close = UI.toast.dismiss;

// var snackbar = toast;

// jQuery
$ui.toast = [];

$(function () {
	$ui.toast = $(".js-ui-toast");
	$ui.toast["message"] = $(".toast-message", $ui.toast);
	$ui.toast["action"] = $(".toast-action", $ui.toast);
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui / utilities //////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Título e cor do tema
$ui["window"] = $(window);
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
UI.data["column-width"] = 316; // largura da coluna, incluindo margem
UI.data["window"] = [];

function setLayoutProperties() {
	// dimensões da janela
	UI.data["window"]["width"] = $ui["window"].width();
	UI.data["window"]["height"] = $ui["window"].height();

	// calcula número de colunas
	UI.data["columns"] = Math.floor(UI.data["window"]["width"] / UI.data["column-width"]);

	// adiciona classe no <body> de acordo com a quantidade de colunas
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

$(function () {
	setLayoutProperties();
});
$ui["window"].on("resize", setLayoutProperties);

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Propriedades do scroll
UI.data["scroll-position"] = [];

function setScrollPosition() {
	UI.data["scroll-position"]["top"] = $ui["window"].scrollTop();
	UI.data["scroll-position"]["bottom"] = UI.data["scroll-position"]["top"] + UI.data["window"]["height"];
}

$(function () {
	setScrollPosition();
});
$ui["window"].on("scroll resize", setScrollPosition);

////////////////////////////////////////////////////////////////////////////////////////////////////
// api /////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// TODO legacy
let api_key = "063c72b2afc5333f3b27b366bdac9eb81d64bc6a12cd7b3f4b6ade77a092b63a";

const ListaAPI = function (endpoint, data) {
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
				"gutter": ui["columns"] === 1 ? 8 : 16
			}
		});

		$app["lista"].on("click", ".card-tarefa:not(.ghost)", function (event) {
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
			if (Lista.Regulamento["encerrada"] === true) {
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
				// insere no cache
				cache["tarefas"][tarefa["numero"]] = tarefa;

				// cria o link para a tarefa
				tarefa["url"] = router["build-link"]("/tarefas/" + tarefa["numero"]);

				// se tiver imagem, ajusta as dimensoes
				if (tarefa["imagem"]) {
					tarefa["imagem-url"] = tarefa["imagem"]["url"];
					tarefa["imagem-aspecto"] = "padding-top: " + (tarefa["imagem"]["aspecto"] * 100).toFixed(2) + "%";
				}

				let $tarefa = __render("card-tarefa", tarefa).data({
					"tarefa": tarefa["numero"],
					"last-modified": tarefa["ultima-postagem"] ? moment(tarefa["ultima-postagem"]).format("X") : 0
				});

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
						var max_media_to_show = ui["columns"] < 2 ? 9 : 8;
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
				app.Lista.sort(Lista.Regulamento["encerrada"] ? "tarefa" : "date");

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
			"gutter": ui["columns"] === 1 ? 8 : 16
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
	var placar_da_tarefa = [];

	function renderPosts(posts, $posts) {
		placar_da_tarefa["total"] = 0;
		for (var turma in Lista.Regulamento["turmas"]) {
			placar_da_tarefa[Lista.Regulamento["turmas"][turma]] = 0;
		}

		$.each(posts, function (index, post) {
			post["data-de-postagem-formatada"] = moment(post["data-de-postagem"]).calendar();
			post["turma-formatada"] = post["turma"].toUpperCase();

			// avaliação
			if (post["avaliacao"]) {
				if (post["avaliacao"]["status"] === 200) {
					post["status-class"] = post["turma"];
					post["status-icon"] = "<i class=\"material-icons\">&#xE87D;</i>"; // coração
					post["status"] = post["avaliacao"]["pontos"] + " ponto" + (post["avaliacao"]["pontos"] > 1 ? "s" : "");
				} else {
					post["status-class"] = "rejected";
					post["status-icon"] = "<i class=\"material-icons\">&#xE888;</i>";
					post["status"] = "Reprovado";
				}
				post["mensagem"] = post["avaliacao"]["mensagem"];

				// soma pontos no placar
				placar_da_tarefa["total"] += post["avaliacao"]["pontos"];
				placar_da_tarefa[post["turma"]] += post["avaliacao"]["pontos"];
			} else {
				post["status-icon"] = "<i class=\"material-icons\">&#xE8B5;</i>"; // relógio
				post["status"] = "Aguardando avaliação";
			}

			// legenda
			if (post["legenda"] && post["legenda"].substring(0, 3) != "<p>") {
				post["legenda"] = "<p>" + post["legenda"].replace(/(?:\r\n\r\n|\r\r|\n\n)/g, "</p><p>") + "</p>";
			}

			// renderiza o post
			var $post_card = __render("view-tarefa-post-card", post);
			var $media = $(".post-media > ul", $post_card);

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
				$post_card.addClass("no-caption");
			}

			if (!post["media"]) {
				$post_card.addClass("no-media");
			}

			// tira mensagem de avaliação se não tiver
			if (!post["avaliacao"] || !post["mensagem"]) {
				$(".result .message", $post_card).remove();
			}

			// adiciona o post à tarefa
			// $posts.append($post_card).isotope("appended", $post_card);
			$posts.append($post_card);
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

			$ui["body"].addClass("no-scroll tarefa-active");

			// router
			router["view-manager"].replace("tarefa");
			if (pushState) {
				router.go("/tarefas/" + tarefa["numero"], { "view": "tarefa", "id": tarefa["numero"] }, tarefa["titulo"]);
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

			$(".tarefa-meta .tarefa-card", $tarefa).append($tarefa_card);

			////////////////////////////////////////////////////////////////////////////////////////
			// posts
			var $posts = $(".tarefa-posts > ul", $tarefa);

			if (tarefa["posts"].length) {
				renderPosts(tarefa["posts"], $posts);

				$posts.isotope({
					"itemSelector": ".post-card",
					"transitionDuration": 0,
					"masonry": {
						"isFitWidth": true,
						"gutter": ui["columns"] === 1 ? 8 : 24
					}
				});
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

			$.each(Lista.Regulamento["turmas"], function (index, turma) {
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

			$ui["body"].removeClass("no-scroll tarefa-active");
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

$(function () {
	$app["tarefa"] = $(".js-app-tarefa");
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
		}).on("click", ".submit", function (event) {
			event.preventDefault();

			if (moment().isAfter(Lista.Regulamento["fim"])) {
				toast.open("Postagens encerradas!");
			}

			if ($(this).hasClass("disabled")) {
				// TODO melhorar mensagem
				toast.open("Espere o fim do upload&hellip;");
				return;
			}

			var data = $("form", $app["post"]).serialize();

			$(".submit", $app["post"]).addClass("disabled").html("Enviando&hellip;");

			$.post("/-/lista/novo", data).done(function (response) {
				if (response["meta"]["status"] === 200) {
					app.Post.close();
					app.Tarefa.render(response["data"]);
					UI.toast.open(response["meta"]["message"]);
					navigator.vibrate(800);

					tarefas[response["data"]["numero"]] = response["data"];
				} else {
					UI.toast.open(response["meta"]["message"] ? response["meta"]["message"] : "Ocorreu um erro. Tente novamente");
				}
			}).fail(function () {
				UI.toast.open("Ocorreu um erro. Tente novamente");
			});
		}).on("click", ".back", function (event) {
			event.preventDefault();
			app.Post.close();
		});
	});

	return {

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Post.authorize()
		authorize: function () {
			// habilita o botão enviar
			$(".submit", $app["post"]).removeClass("disabled");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Post.deauthorize()
		deauthorize: function () {
			// desabilita o botão "enviar"
			$(".submit", $app["post"]).addClass("disabled");
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
				"edicao": Lista.Regulamento["titulo"],
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
			$("head meta[name='theme-color']").attr("content", theme_color["original"]);

			$app["post"].removeClass("slide-y").one("transitionend", function () {
				$app["post"].removeClass("in").empty();
			});

			router["view-manager"].replace("tarefa");
		}
	};
}();

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
		$ui["login"].on("click", ".back", function (event) {
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
				$("input[name='email']", $ui["login"]).focus();
			});
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Login.hide()
		hide: function () {
			$ui["login"].removeClass("slide").one("transitionend", function () {
				$ui["login"].removeClass("in");
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

			// Depois de 0,5 segundo, mostra toast confirmando logout
			setTimeout(function () {
				UI.toast.show("Sessão encerrada!");
			}, 500);
		}
	};
}();

////////////////////////////////////////////////////////////////////////////////////////////////////
// image upload ////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var exif_orientation_to_degrees = { 0: 0, 1: 0, 2: 0, 3: 180, 4: 0, 5: 0, 6: 90, 7: 0, 8: 270 };
var file_stack = {};

function upload(files) {
	FileAPI.filterFiles(files, function (file, info) {
		if (/^image/.test(file.type)) {
			file_stack[file["name"]] = info;
			return true;
			//	return info.width >= 320 && info.height >= 240;
		}
		return false;
	}, function (files, rejected) {
		if (files.length) {
			$(".submit", $post).addClass("disabled");

			// preview
			FileAPI.each(files, function (file) {
				var exif_orientation = file_stack[file["name"]]["exif"]["Orientation"];
				file_stack[file["name"]]["ref"] = tarefa_active + "-" + user["id"] + "-" + moment().format("X") + "-" + rand(0, 999).toFixed(0);

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
						//		.val(tarefa_active + "-" + user["id"] + "-" + file["name"]);
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
			if (files[0]["type"] == "image/gif") {
				console.log("gif");
				FileAPI.upload({
					url: "/-/lista/novo",
					data: {
						action: "upload",
						edition: Lista.Regulamento["titulo"],
						tarefa: tarefa_active,
						turma: user["turma"],
						user: user["id"]
					},
					prepare: function (file, options) {
						options.data.ref = file_stack[file["name"]]["ref"];
						file.ref = file_stack[file["name"]]["ref"];
					},

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
						$(".submit", $post).removeClass("disabled");
					}
				});
			} else {
				FileAPI.upload({
					url: "/-/lista/novo",
					data: {
						action: "upload",
						edition: Lista.Regulamento["titulo"],
						tarefa: tarefa_active,
						turma: user["turma"],
						user: user["id"]
					},
					prepare: function (file, options) {
						options.data.ref = file_stack[file["name"]]["ref"];
						file.ref = file_stack[file["name"]]["ref"];
					},

					imageAutoOrientation: true,
					imageTransform: {
						maxWidth: 1920,
						maxHeight: 1920
					},

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
						$(".submit", $post).removeClass("disabled");
					}
				});
			}
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
		if (ui["interaction-type"] === "pointer") {
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
		});
	}, 300);
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
			cue["load-edicao"].resolve();

			timeout["delay-lista"] = setTimeout(app.Lista.start, 1);
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
			// confere data de cada atividade e vê se é posterior à última atualização.
			// se for, adiciona à contagem de nova atividade
			for (let atividade of response) {
				if (moment(atividade["ts"]).isAfter(updates["last-updated"]) && atividade["autor"] != user["id"]) {
					updates["total"]++;
					if (value["acao"] === "novo-tarefa") {
						updates["tarefas"]++;
					} else if (value["acao"] === "novo-post") {
						updates["posts"]++;
					}
				}
			}

			// se houver nova atividade
			if (updates["total"] > 0) {
				// monta o texto do toast
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

				// mostra número de novas atividades no título
				$ui["title"].html("(" + updates["total"] + ") " + UI.data["page-title"]);
			}

			updates["last-updated"] = response[0] ? moment(response[0]["ts"]) : moment();
		});
	}, 30 * 1000);
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// fonts ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

WebFont.load({
	timeout: 15000,
	google: {
		families: ["Material Icons", "Roboto:400,400italic,500:latin", "Roboto+Mono:700:latin", "Lato:400:latin"]
	},
	custom: {
		families: ["FontAwesome"], urls: ["https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"]
	},
	active: function () {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiLCJ1dGlsaXRpZXMuanMiLCJ0ZW1wbGF0ZS1lbmdpbmUuanMiLCJyb3V0ZXIuanMiLCJkb2N1bWVudC5qcyIsImJvZHkuanMiLCJsb2FkYmFyLmpzIiwiYmFja2Ryb3AuanMiLCJzaWRlbmF2LmpzIiwiYm90dG9tc2hlZXQuanMiLCJ0b2FzdC5qcyIsImFwaS5qcyIsInBsYWNhci5qcyIsImV2b2x1Y2FvLmpzIiwibGlzdGEuanMiLCJ0YXJlZmEuanMiLCJuZXctcG9zdC5qcyIsImxvZ2luLmpzIiwiaGVscGVyLWltYWdlLXVwbG9hZC5qcyIsIndvcmtlcnMuanMiLCJmb250cy5qcyIsIm1vbWVudC1sb2NhbGUuanMiXSwibmFtZXMiOlsiTGlzdGEiLCJFZGljYW8iLCJQbGFjYXIiLCJUYXJlZmFzIiwiYXBwIiwiJGFwcCIsImNhY2hlIiwiY3VlIiwid29ya2VyIiwidGltZW91dCIsImxvZ2dpbmciLCJsb2ciLCJtZXNzYWdlIiwidHlwZSIsImNvbnNvbGUiLCJ1aSIsIlJlZ3VsYW1lbnRvIiwidGFyZWZhcyIsInRhcmVmYV9hY3RpdmUiLCJyYW5kIiwibWluIiwibWF4IiwiTWF0aCIsInJhbmRvbSIsIiR0ZW1wbGF0ZXMiLCIkIiwiZWFjaCIsIiR0aGlzIiwibmFtZSIsImF0dHIiLCJodG1sIiwicmVtb3ZlIiwiX19yZW5kZXIiLCJ0ZW1wbGF0ZSIsImRhdGEiLCIkcmVuZGVyIiwiY2xvbmUiLCJmbiIsImZpbGxCbGFua3MiLCIkYmxhbmsiLCJmaWxsIiwicnVsZXMiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJwYWlyIiwiZGVzdCIsInRyaW0iLCJzb3VyY2UiLCJ2YWx1ZSIsImoiLCJhZGRDbGFzcyIsInZhbCIsImlmX251bGwiLCJoaWRlIiwicmVtb3ZlQ2xhc3MiLCJyZW1vdmVBdHRyIiwiaGFzQ2xhc3MiLCJyb3V0ZXIiLCJsb2NhdGlvbiIsInBhdGhuYW1lIiwiaGFzaCIsInBhdGgiLCJvYmplY3QiLCJ0aXRsZSIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJsaW5rIiwiYWRkIiwidmlldyIsInB1c2giLCJncmVwIiwicmVwbGFjZSIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInN0YXRlIiwiaW5kZXhPZiIsImJvdHRvbXNoZWV0IiwiY2xvc2UiLCJwb3N0IiwiVGFyZWZhIiwib3BlbiIsIlVJIiwiJHVpIiwicmVmbG93Iiwib2Zmc2V0IiwibGVmdCIsImJvZHkiLCJkb2N1bWVudCIsInNjcm9sbFN0YXR1cyIsIm9uIiwieSIsInNjcm9sbFRvcCIsImxvY2siLCJ1bmxvY2siLCJsb2FkYmFyIiwic2hvdyIsInNldFRpbWVvdXQiLCJvbmUiLCJiYWNrZHJvcCIsIiRzY3JlZW4iLCJldmVudHMiLCJzY3JlZW4iLCJ6aW5kZXgiLCJjc3MiLCJoYW5kbGVyIiwidHJpZ2dlciIsImFwcGVuZFRvIiwib2ZmIiwic2lkZW5hdiIsInByZXZlbnREZWZhdWx0IiwiJGNvbnRlbnQiLCJlbXB0eSIsInRvYXN0IiwiY29uZmlnIiwiZGlzbWlzcyIsImNsZWFyVGltZW91dCIsImFjdGlvbiIsImNhbGxiYWNrIiwicGVyc2lzdGVudCIsIm5hdmlnYXRvciIsIm1zTWF4VG91Y2hQb2ludHMiLCJzZXRMYXlvdXRQcm9wZXJ0aWVzIiwid2lkdGgiLCJoZWlnaHQiLCJmbG9vciIsImxheW91dF9jbGFzcyIsInNldFNjcm9sbFBvc2l0aW9uIiwiYXBpX2tleSIsIkxpc3RhQVBJIiwiZW5kcG9pbnQiLCJhcGlfdXJsIiwiZWRpY2FvIiwicmVxdWVzdCIsImdldEpTT04iLCJ1cGRhdGUiLCJ0dXJtYXMiLCJtYWlvcl9wb250dWFjYW8iLCJ0b3RhbF9kZV9wb250b3MiLCJ0dXJtYSIsInBvbnR1YWNhb19kYV90dXJtYSIsImluZGV4IiwicGVyY2VudHVhbF9kYV90dXJtYSIsInRvRml4ZWQiLCJ0b1VwcGVyQ2FzZSIsInRvU3RyaW5nIiwiJHR1cm1hIiwiYXBwZW5kIiwicGFyZW50IiwiRXZvbHVjYW8iLCJzdGFydCIsImRpYV9pbmljaWFsIiwibW9tZW50IiwiZGlhX2ZpbmFsIiwiZHVyYWNhb190b3RhbCIsImRpZmYiLCJkaWEiLCJpc0JlZm9yZSIsImluaWNpb19kb19kaWEiLCJmaW5hbF9kb19kaWEiLCJlbmRPZiIsImlzQWZ0ZXIiLCJkdXJhY2FvX2RvX2RpYSIsInBlcmNlbnR1YWxfZG9fZGlhIiwibGFyZ3VyYV9kb19kaWEiLCIkZGlhIiwiZm9ybWF0Iiwic2V0SW50ZXJ2YWwiLCJhZ29yYSIsInRlbXBvX3RyYW5zY29ycmlkbyIsInBlcmNlbnR1YWxfdHJhbnNjb3JyaWRvIiwibGFyZ3VyYV9kYV9iYXJyYSIsImlzb3RvcGUiLCJlbGVtZW50IiwicGFyc2VJbnQiLCJ3aGljaCIsIiRjYXJkIiwibnVtZXJvIiwic3RhdHVzIiwibWVzc2FnZXMiLCJjbGVhckludGVydmFsIiwidXBkYXRlX2ludGVydmFsIiwicGFnZV90aXRsZSIsImNsb3NpbmdfbWVzc2FnZSIsInRhcmVmYSIsIiR0YXJlZmEiLCJsYXlvdXQiLCJsb2FkIiwiJHN0cmVhbSIsImxvYWRpbmciLCJkb25lIiwiJGdyaWQiLCJ0b3RhbF9wb3N0cyIsIm1heF9tZWRpYV90b19zaG93Iiwic2hvd25fbWVkaWFfY291bnQiLCJwb3N0X3R5cGVzX3dpdGhfaW1hZ2VfcHJldmlldyIsInBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXciLCJ0aWxlX3R5cGUiLCJtZWRpYSIsInN1YnN0cmluZyIsIiR0aWxlIiwic29ydCIsImxhc3RfdXBkYXRlZCIsInVwZGF0ZWQiLCJjcml0ZXJpYSIsInBsYWNhcl9kYV90YXJlZmEiLCJyZW5kZXJQb3N0cyIsInBvc3RzIiwiJHBvc3RzIiwiY2FsZW5kYXIiLCIkcG9zdF9jYXJkIiwiJG1lZGlhIiwiJGltYWdlIiwiJGVtYmVkIiwicmVuZGVyIiwiZ28iLCIkdGFyZWZhX2NhcmQiLCJ0ZXh0IiwiJHBsYWNhcl9kYV90YXJlZmEiLCJQb3N0Iiwic2VyaWFsaXplIiwicmVzcG9uc2UiLCJ2aWJyYXRlIiwiZmFpbCIsImF1dGhvcml6ZSIsImRlYXV0aG9yaXplIiwiZ2V0VGh1bWJuYWlsIiwidXJsIiwibWVkaWFfaW5mbyIsInNob3dUaHVtYm5haWwiLCIkdGh1bWJuYWlsIiwiZmFkZUluIiwibWF0Y2giLCJ5b3V0dWJlX3VybCIsInZpbWVvX3VybCIsIlVzdWFyaW8iLCIkbmV3X3Bvc3RfdmlldyIsInZpZXdfdGhlbWVfY29sb3IiLCJkcm9wem9uZSIsImZvY3VzIiwicmVwbGFjZVN0YXRlIiwidGhlbWVfY29sb3IiLCJMb2dpbiIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJKU09OIiwicGFyc2UiLCJsb2dvdXQiLCJsb2dpbl9kYXRhIiwic3VibWl0Iiwic2V0SXRlbSIsInN0cmluZ2lmeSIsImV4aWZfb3JpZW50YXRpb25fdG9fZGVncmVlcyIsImZpbGVfc3RhY2siLCJ1cGxvYWQiLCJmaWxlcyIsIkZpbGVBUEkiLCJmaWx0ZXJGaWxlcyIsImZpbGUiLCJpbmZvIiwidGVzdCIsInJlamVjdGVkIiwiJHBvc3QiLCJleGlmX29yaWVudGF0aW9uIiwidXNlciIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJpbWciLCJ0YXJnZXQiLCJyZXN1bHQiLCIkdHJhY2tlciIsIiRzdGF0dXMiLCIkcHJldmlldyIsInJlYWRBc0RhdGFVUkwiLCJJbWFnZSIsInJvdGF0ZSIsInJlc2l6ZSIsImdldCIsImVyciIsImVkaXRpb24iLCJwcmVwYXJlIiwib3B0aW9ucyIsInJlZiIsImZpbGVwcm9ncmVzcyIsInhociIsInBlcmNlbnQiLCJwcm9ncmVzcyIsImZpbGVjb21wbGV0ZSIsImNvbXBsZXRlIiwiaW1hZ2VBdXRvT3JpZW50YXRpb24iLCJpbWFnZVRyYW5zZm9ybSIsIm1heFdpZHRoIiwibWF4SGVpZ2h0IiwiJGRyb3B6b25lIiwiZG5kIiwib3ZlciIsIiRmaWxlX2lucHV0IiwiZ2V0RWxlbWVudEJ5SWQiLCJnZXRGaWxlcyIsIiRib2FyZCIsIm9yaWdpbmFsRXZlbnQiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwiZGV0YWlsIiwiU2xpcCIsIlN0YXJ0IiwiRGVmZXJyZWQiLCJMb2FkIiwicmVzb2x2ZSIsIlVwZGF0ZSIsInVwZGF0ZXMiLCJhdGl2aWRhZGUiLCJ0ZXh0byIsIldlYkZvbnQiLCJnb29nbGUiLCJmYW1pbGllcyIsImN1c3RvbSIsInVybHMiLCJhY3RpdmUiLCJsb2NhbGUiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTs7QUFFQSxJQUFBQSxRQUFBLEVBQUE7QUFDQUEsTUFBQUMsTUFBQSxHQUFBLEVBQUE7QUFDQUQsTUFBQUUsTUFBQSxHQUFBLEVBQUE7QUFDQUYsTUFBQUcsT0FBQSxHQUFBLEVBQUE7O0FBRUEsSUFBQUMsTUFBQSxFQUFBO0FBQ0EsSUFBQUMsT0FBQSxFQUFBOztBQUVBLElBQUFDLFFBQUEsRUFBQTtBQUNBQSxNQUFBLFNBQUEsSUFBQSxFQUFBOztBQUVBOztBQUVBLElBQUFDLE1BQUEsRUFBQTtBQUNBLElBQUFDLFNBQUEsRUFBQTtBQUNBLElBQUFDLFVBQUEsRUFBQTs7QUFFQSxJQUFBQyxVQUFBLEtBQUE7QUFDQSxJQUFBQyxNQUFBLFVBQUFDLE9BQUEsRUFBQUMsSUFBQSxFQUFBO0FBQ0EsS0FBQUgsT0FBQSxFQUFBO0FBQ0EsTUFBQSxDQUFBRyxJQUFBLEVBQUE7QUFDQUMsV0FBQUgsR0FBQSxDQUFBQyxPQUFBO0FBQ0EsR0FGQSxNQUVBO0FBQ0FFLFdBQUFELElBQUEsRUFBQUQsT0FBQTtBQUNBO0FBQ0E7QUFDQSxDQVJBOztBQVVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxJQUFBRyxLQUFBLEVBQUE7O0FBRUFmLE1BQUFnQixXQUFBLEdBQUEsRUFBQSxDLENBQUE7QUFDQTs7O0FBSUE7QUFDQSxJQUFBQyxVQUFBLEVBQUE7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFBQyxhQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBOzs7Ozs7Ozs7Ozs7OztBQWVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUNoR0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBQUMs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QUFFQSxnQkFBQSxrREFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FGQTtBQUdBLGFBQUEsaUZBQUFBLEtBQUEsQ0FBQSxHQUFBLENBSEE7QUFJQSxrQkFBQSw4QkFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FKQTtBQUtBLGdCQUFBLHlCQUFBQSxLQUFBLENBQUEsR0FBQSxDQUxBO0FBTUEsbUJBQUE7QUFDQSxRQUFBLE9BREE7QUFFQSxTQUFBLFVBRkE7QUFHQSxPQUFBLFlBSEE7QUFJQSxRQUFBLHVCQUpBO0FBS0EsU0FBQSxrQ0FMQTtBQU1BLFVBQUE7QUFOQSxFQU5BO0FBY0EsYUFBQTtBQUNBLGFBQUEsV0FEQTtBQUVBLGFBQUEsYUFGQTtBQUdBLGNBQUEsU0FIQTtBQUlBLGFBQUEsWUFKQTtBQUtBLGNBQUEsU0FMQTtBQU1BLGNBQUE7QUFOQSxFQWRBO0FBc0JBLGlCQUFBO0FBQ0EsWUFBQSxVQURBO0FBRUEsVUFBQSxVQUZBO0FBR0EsT0FBQSxpQkFIQTtBQUlBLE9BQUEsV0FKQTtBQUtBLFFBQUEsWUFMQTtBQU1BLE9BQUEsVUFOQTtBQU9BLFFBQUEsVUFQQTtBQVFBLE9BQUEsUUFSQTtBQVNBLFFBQUEsU0FUQTtBQVVBLE9BQUEsUUFWQTtBQVdBLFFBQUEsVUFYQTtBQVlBLE9BQUEsUUFaQTtBQWFBLFFBQUE7QUFiQSxFQXRCQTtBQXFDQSxpQkFBQSxVQXJDQTtBQXNDQSxZQUFBO0FBdENBLENBQUEiLCJmaWxlIjoibGlzdGEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBsaXN0YSBkZSB0YXJlZmFzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmxldCBMaXN0YSA9IFsgXTtcbkxpc3RhLkVkaWNhbyA9IFsgXTtcbkxpc3RhLlBsYWNhciA9IFsgXTtcbkxpc3RhLlRhcmVmYXMgPSBbIF07XG5cbmxldCBhcHAgPSBbIF07XG5sZXQgJGFwcCA9IFsgXTtcblxubGV0IGNhY2hlID0gWyBdO1xuY2FjaGVbXCJ0YXJlZmFzXCJdID0gWyBdO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmxldCBjdWUgPSBbIF07XG5sZXQgd29ya2VyID0gWyBdO1xubGV0IHRpbWVvdXQgPSBbIF07XG5cbmxldCBsb2dnaW5nID0gZmFsc2U7XG5sZXQgbG9nID0gZnVuY3Rpb24obWVzc2FnZSwgdHlwZSkge1xuXHRpZiAobG9nZ2luZykge1xuXHRcdGlmICghdHlwZSkge1xuXHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGVbdHlwZV0obWVzc2FnZSk7XG5cdFx0fVxuXHR9XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gZGFxdWkgcHJhIGJhaXhvIG7Do28gw6kgcHJhIHRlciBuYWRhISFcblxudmFyIHVpID0gWyBdO1xuXG5MaXN0YS5SZWd1bGFtZW50byA9IFsgXTsgLy8gVE9ETyBkZXByZWNhdGVkXG4vLyB2YXIgZWRpY2FvID0gXCJ4Y2lpaVwiO1xuXG5cblxuLy8gbGFndWluaG8ub3JnL3RhcmVmYXNcbnZhciB0YXJlZmFzID0geyB9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGVsZW1lbnRzICYgaGVscGVycyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHZhciAkdGhlbWVfY29sb3IsIHRoZW1lX2NvbG9yID0geyB9O1xudmFyIHRhcmVmYV9hY3RpdmU7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIG8gb2JqZXRvIFwidWlcIiBndWFyZGEgaW5mb3JtYcOnw7VlcyBzb2JyZSBhIGludGVyZmFjZSwgY29tbyBkaW1lbnPDtWVzIGUgdGlwbyBkZSBpbnRlcmHDp8Ojb1xuLy8gdmFyIHVpICA9IHsgfTtcblxuXG4vKlxuXG52YXJpYcOnw7VlcyBkYSBpbnRlcmZhY2U6XG5cbjEgY29sdW5hOiB0ZWxhIMO6bmljYSwgMSBjb2x1bmEgbmEgdGFyZWZhXG4yIGNvbHVuYXM6IHRlbGEgw7puaWNhLCAyIGNvbHVuYXMgbmEgdGFyZWZhXG4zIGNvbHVuYXM6IHRlbGEgZGl2aWRpZGEsIDEgY29sdW5hIGxhcmdhIG5hIHRhcmVmYVxuNCBjb2x1bmFzOiB0ZWxhIGRpdmlkaWRhLCAyIGNvbHVuYXMgbGFyZ2FzIG5hIHRhcmVmYVxuXG5cblxuXG4qL1xuXG5cbi8vIGxvYWRpbmdcbi8qXG52YXIgbG9hZGluZyA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblx0XHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRcdGJhY2tkcm9wLnNob3coKTtcblx0XHRcdCRsb2FkaW5nLmFkZENsYXNzKFwiaW5cIik7XG5cdFx0fSxcblx0XHRoaWRlOiBmdW5jdGlvbigpIHtcblx0XHRcdCRsb2FkaW5nLnJlbW92ZUNsYXNzKFwiaW5cIik7XG5cdFx0XHRiYWNrZHJvcC5oaWRlKCk7XG5cdFx0fVxuXHR9XG59KSgpO1xuJChmdW5jdGlvbigpIHtcblx0JGxvYWRpbmcgPSAkKFwiI2xvYWRpbmdcIik7XG59KTtcbiovXG5cbi8vIHZhciBhcGlfa2V5O1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgLyB1dGlsaXRpZXMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBUw610dWxvIGUgY29yIGRvIHRlbWFcbiR1aVtcIndpbmRvd1wiXSA9ICQod2luZG93KTtcblVJLmRhdGFbXCJ0aGVtZS1jb2xvclwiXSA9IFsgXTtcblxuJChmdW5jdGlvbigpIHtcblx0JHVpW1widGl0bGVcIl0gPSAkKFwiaGVhZCB0aXRsZVwiKTtcblx0VUkuZGF0YVtcInRpdGxlXCJdID0gJHVpW1widGl0bGVcIl0uaHRtbCgpO1xuXG5cdCR1aVtcInRoZW1lLWNvbG9yXCJdID0gJChcIm1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKTtcblx0VUkuZGF0YVtcInRoZW1lLWNvbG9yXCJdW1wib3JpZ2luYWxcIl0gPSAkdWlbXCJ0aGVtZS1jb2xvclwiXS5hdHRyKFwiY29udGVudFwiKTtcbn0pO1xuXG4vLyBUaXBvIGRlIGludGVyYcOnw6NvICh0b3VjaCBvdSBwb2ludGVyKVxuVUkuZGF0YVtcImludGVyYWN0aW9uLXR5cGVcIl0gPSAoXCJvbnRvdWNoc3RhcnRcIiBpbiB3aW5kb3cgfHwgbmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMpPyBcInRvdWNoXCIgOiBcInBvaW50ZXJcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFByb3ByaWVkYWRlcyBkYSBqYW5lbGEgZSBkbyBsYXlvdXRcblVJLmRhdGFbXCJjb2x1bW4td2lkdGhcIl0gPSAzMTY7IC8vIGxhcmd1cmEgZGEgY29sdW5hLCBpbmNsdWluZG8gbWFyZ2VtXG5VSS5kYXRhW1wid2luZG93XCJdID0gWyBdO1xuXG5mdW5jdGlvbiBzZXRMYXlvdXRQcm9wZXJ0aWVzKCkge1xuXHQvLyBkaW1lbnPDtWVzIGRhIGphbmVsYVxuXHRVSS5kYXRhW1wid2luZG93XCJdW1wid2lkdGhcIl0gPSAkdWlbXCJ3aW5kb3dcIl0ud2lkdGgoKTtcblx0VUkuZGF0YVtcIndpbmRvd1wiXVtcImhlaWdodFwiXSA9ICR1aVtcIndpbmRvd1wiXS5oZWlnaHQoKTtcblxuXHQvLyBjYWxjdWxhIG7Dum1lcm8gZGUgY29sdW5hc1xuXHRVSS5kYXRhW1wiY29sdW1uc1wiXSA9IE1hdGguZmxvb3IoVUkuZGF0YVtcIndpbmRvd1wiXVtcIndpZHRoXCJdIC8gVUkuZGF0YVtcImNvbHVtbi13aWR0aFwiXSk7XG5cblx0Ly8gYWRpY2lvbmEgY2xhc3NlIG5vIDxib2R5PiBkZSBhY29yZG8gY29tIGEgcXVhbnRpZGFkZSBkZSBjb2x1bmFzXG5cdGxldCBsYXlvdXRfY2xhc3M7XG5cdGlmIChVSS5kYXRhW1wiY29sdW1uc1wiXSA9PT0gMSkge1xuXHRcdGxheW91dF9jbGFzcyA9IFwidWktc2luZ2xlLWNvbHVtblwiO1xuXHR9IGVsc2UgaWYgKFVJLmRhdGFbXCJjb2x1bW5zXCJdID09PSAyKSB7XG5cdFx0bGF5b3V0X2NsYXNzID0gXCJ1aS1kdWFsLWNvbHVtblwiO1xuXHR9IGVsc2Uge1xuXHRcdGxheW91dF9jbGFzcyA9IFwidWktbXVsdGktY29sdW1uXCI7XG5cdH1cblxuXHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwidWktc2luZ2xlLWNvbHVtbiB1aS1kdWFsLWNvbHVtbiB1aS1tdWx0aS1jb2x1bW5cIikuYWRkQ2xhc3MobGF5b3V0X2NsYXNzKTtcbn1cblxuJChmdW5jdGlvbigpIHsgc2V0TGF5b3V0UHJvcGVydGllcygpOyB9KTtcbiR1aVtcIndpbmRvd1wiXS5vbihcInJlc2l6ZVwiLCBzZXRMYXlvdXRQcm9wZXJ0aWVzKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIFByb3ByaWVkYWRlcyBkbyBzY3JvbGxcblVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl0gPSBbIF07XG5cbmZ1bmN0aW9uIHNldFNjcm9sbFBvc2l0aW9uKCkge1xuXHRVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1widG9wXCJdID0gJHVpW1wid2luZG93XCJdLnNjcm9sbFRvcCgpO1xuXHRVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1wiYm90dG9tXCJdID0gVUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXVtcInRvcFwiXSArIFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJoZWlnaHRcIl07XG59XG5cbiQoZnVuY3Rpb24oKSB7IHNldFNjcm9sbFBvc2l0aW9uKCk7IH0pO1xuJHVpW1wid2luZG93XCJdLm9uKFwic2Nyb2xsIHJlc2l6ZVwiLCBzZXRTY3JvbGxQb3NpdGlvbik7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB0ZW1wbGF0ZSBlbmdpbmUgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciAkdGVtcGxhdGVzID0geyB9O1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQkKFwidGVtcGxhdGVcIikuZWFjaChmdW5jdGlvbigpIHtcblx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXHRcdHZhciBuYW1lID0gJHRoaXMuYXR0cihcImlkXCIpO1xuXHRcdHZhciBodG1sID0gJHRoaXMuaHRtbCgpO1xuXG5cdFx0JHRlbXBsYXRlc1tuYW1lXSA9ICQoaHRtbCk7XG5cdFx0JHRoaXMucmVtb3ZlKCk7XG5cdH0pO1xufSk7XG5cbmZ1bmN0aW9uIF9fcmVuZGVyKHRlbXBsYXRlLCBkYXRhKSB7XG5cdGlmICghJHRlbXBsYXRlc1t0ZW1wbGF0ZV0pIHsgcmV0dXJuIGZhbHNlOyB9XG5cdHZhciAkcmVuZGVyID0gJHRlbXBsYXRlc1t0ZW1wbGF0ZV0uY2xvbmUoKTtcblxuXHQkcmVuZGVyLmRhdGEoZGF0YSk7XG5cblx0JC5mbi5maWxsQmxhbmtzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRibGFuayA9ICQodGhpcyk7XG5cdFx0dmFyIGZpbGwgPSAkYmxhbmsuZGF0YShcImZpbGxcIik7XG5cblx0XHR2YXIgcnVsZXMgPSBmaWxsLnNwbGl0KFwiLFwiKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcGFpciA9IHJ1bGVzW2ldLnNwbGl0KFwiOlwiKTtcblx0XHRcdHZhciBkZXN0ID0gKHBhaXJbMV0/IHBhaXJbMF0udHJpbSgpIDogXCJodG1sXCIpO1xuXHRcdFx0dmFyIHNvdXJjZSA9IChwYWlyWzFdPyBwYWlyWzFdLnRyaW0oKSA6IHBhaXJbMF0pO1xuXHRcdFx0dmFyIHZhbHVlID0gZGF0YVtzb3VyY2VdO1xuXG5cdFx0XHRzb3VyY2UgPSBzb3VyY2Uuc3BsaXQoXCIvXCIpO1xuXHRcdFx0aWYgKHNvdXJjZS5sZW5ndGggPiAxICYmIHR5cGVvZiB2YWx1ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHR2YWx1ZSA9IGRhdGFbc291cmNlWzBdXTtcblxuXHRcdFx0XHRmb3IgKHZhciBqID0gMTsgaiA8IHNvdXJjZS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdHZhbHVlID0gKHZhbHVlW3NvdXJjZVtqXV0pPyB2YWx1ZVtzb3VyY2Vbal1dIDogbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRcdGlmIChkZXN0ID09PSBcImNsYXNzXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsuYWRkQ2xhc3ModmFsdWUpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGRlc3QgPT09IFwiaHRtbFwiKSB7XG5cdFx0XHRcdFx0JGJsYW5rLmh0bWwodmFsdWUpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGRlc3QgPT09IFwidmFsdWVcIikge1xuXHRcdFx0XHRcdCRibGFuay52YWwodmFsdWUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCRibGFuay5hdHRyKGRlc3QsIHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGlmX251bGwgPSAkYmxhbmsuZGF0YShcImZpbGwtbnVsbFwiKTtcblx0XHRcdFx0aWYgKGlmX251bGwgPT09IFwiaGlkZVwiKSB7XG5cdFx0XHRcdFx0JGJsYW5rLmhpZGUoKTtcblx0XHRcdFx0fSBlbHNlIGlmKGlmX251bGwgPT09IFwicmVtb3ZlXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQkYmxhbmtcblx0XHRcdC5yZW1vdmVDbGFzcyhcImZpbGxcIilcblx0XHRcdC5yZW1vdmVBdHRyKFwiZGF0YS1maWxsXCIpXG5cdFx0XHQucmVtb3ZlQXR0cihcImRhdGEtZmlsbC1udWxsXCIpO1xuXHR9O1xuXG5cdGlmICgkcmVuZGVyLmhhc0NsYXNzKFwiZmlsbFwiKSkge1xuXHRcdCRyZW5kZXIuZmlsbEJsYW5rcygpO1xuXHR9XG5cblx0JChcIi5maWxsXCIsICRyZW5kZXIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0JCh0aGlzKS5maWxsQmxhbmtzKCk7XG5cdH0pO1xuXG5cdHJldHVybiAkcmVuZGVyO1xufVxuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcm91dGVyIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xudmFyIHJvdXRlciA9IFsgXTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbmF2aWdhdGlvbiBtb2RlXG5yb3V0ZXJbXCJwYXRoXCJdID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoXCIvXCIpO1xuXG5pZiAocm91dGVyW1wicGF0aFwiXVsxXSA9PT0gXCJ0YXJlZmFzXCIpIHtcblx0cm91dGVyW1wibmF2aWdhdGlvbi1tb2RlXCJdID0gXCJwYXRoXCI7XG59IGVsc2Uge1xuXHRyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPSBcImhhc2hcIjtcblx0cm91dGVyW1wicGF0aFwiXSA9IGxvY2F0aW9uLmhhc2guc3BsaXQoXCIvXCIpO1xufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBnb1xucm91dGVyW1wiZ29cIl0gPSBmdW5jdGlvbihwYXRoLCBvYmplY3QsIHRpdGxlKSB7XG5cdGlmIChyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPT09IFwicGF0aFwiKSB7XG5cdFx0aGlzdG9yeS5wdXNoU3RhdGUob2JqZWN0LCB0aXRsZSwgcGF0aCk7XG5cdH0gZWxzZSB7XG5cdFx0aGlzdG9yeS5wdXNoU3RhdGUob2JqZWN0LCB0aXRsZSwgXCIjXCIgKyBwYXRoKTtcblx0XHQvLyBsb2NhdGlvbi5oYXNoID0gcGF0aDtcblx0fVxufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYnVpbGQgbGlua1xucm91dGVyW1wiYnVpbGQtbGlua1wiXSA9IGZ1bmN0aW9uKHBhdGgpIHtcblx0dmFyIGxpbms7XG5cdGlmIChyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPT09IFwicGF0aFwiKSB7XG5cdFx0bGluayA9IHBhdGg7XG5cdH0gZWxzZSB7XG5cdFx0bGluayA9IFwiI1wiICsgcGF0aDtcblx0fVxuXG5cdHJldHVybiBsaW5rO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdmlldyBtYW5hZ2VyXG5yb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0gPSBbXCJob21lXCJdO1xucm91dGVyW1widmlldy1tYW5hZ2VyXCJdID0gKGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdGFkZDogZnVuY3Rpb24odmlldykge1xuXHRcdFx0cm91dGVyW1wiY3VycmVudC12aWV3XCJdLnB1c2godmlldyk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0pO1xuXHRcdH0sXG5cdFx0cmVtb3ZlOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0gPSAkLmdyZXAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLCBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgIT09IHZpZXc7XG5cdFx0XHR9KTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSk7XG5cdFx0fSxcblx0XHRyZXBsYWNlOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0gPSBbIF07XG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0uYWRkKHZpZXcpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBmdW5jdGlvbihldmVudCkge1xuXHQvLyBjb25zb2xlLmxvZyhcImxvY2F0aW9uOiBcIiArIGRvY3VtZW50LmxvY2F0aW9uICsgXCIsIHN0YXRlOiBcIiArIEpTT04uc3RyaW5naWZ5KGV2ZW50LnN0YXRlKSk7XG5cblx0dmFyIHN0YXRlID0gZXZlbnQuc3RhdGU7XG5cblx0aWYgKHN0YXRlICYmIHN0YXRlW1widmlld1wiXSA9PT0gXCJ0YXJlZmFcIikge1xuXHRcdGlmIChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0uaW5kZXhPZihcImJvdHRvbXNoZWV0XCIpID4gLTEpIHsgYm90dG9tc2hlZXQuY2xvc2UoKTsgfVxuXHRcdGlmIChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0uaW5kZXhPZihcIm5ldy1wb3N0XCIpID4gLTEpIHsgcG9zdC5jbG9zZSgpOyB9XG5cdFx0YXBwLlRhcmVmYS5vcGVuKHN0YXRlW1wiaWRcIl0pO1xuXHR9XG5cblx0ZWxzZSBpZiAoc3RhdGUgJiYgc3RhdGVbXCJ2aWV3XCJdID09PSBcIm5ldy1wb3N0XCIpIHtcblx0XHRwb3N0Lm9wZW4oc3RhdGVbXCJ0eXBlXCJdLCBzdGF0ZVtcImlkXCJdKTtcblx0fVxuXG5cdGVsc2UgaWYgKHN0YXRlICYmIHN0YXRlW1widmlld1wiXSA9PT0gXCJib3R0b21zaGVldFwiKSB7XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwibmV3LXBvc3RcIikgPiAtMSkgeyBwb3N0LmNsb3NlKCk7IH1cblx0fVxuXG4vL1x0aWYgKHN0YXRlW1widmlld1wiXSA9PT0gXCJob21lXCIpIHtcblx0ZWxzZSB7XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwiYm90dG9tc2hlZXRcIikgPiAtMSkgeyBib3R0b21zaGVldC5jbG9zZSgpOyB9XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwibmV3LXBvc3RcIikgPiAtMSkgeyBwb3N0LmNsb3NlKCk7IH1cblx0XHRhcHAuVGFyZWZhLmNsb3NlKCk7XG5cdH1cblxufSk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHN0YXRlczpcbi8vICogdGFyZWZhXG4vLyAqIGhvbWVcbi8vICogbmV3LXBvc3Rcbi8vICogYm90dG9tc2hlZXRcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmxldCBVSSA9IHsgfVxubGV0ICR1aSA9IFsgXTtcblxuVUkuZGF0YSA9IFsgXTtcblxuLy8gJHVpW1wid2luZG93XCJdXG4vLyAkdWlbXCJ0aXRsZVwiXVxuLy8gJHVpW1wiYm9keVwiXVxuLy8gJHVpW1wiYXBwYmFyXCJdXG4vLyAkdWlbXCJsb2FkYmFyXCJdXG4vLyAkdWlbXCJzaWRlbmF2XCJdXG4vLyAkdWlbXCJib3R0b21zaGVldFwiXVxuLy8gJHVpW1widG9hc3RcIl1cbi8vICR1aVtcImJhY2tkcm9wXCJdXG4vLyAkdWlbXCJmb290ZXJcIl1cblxuLy8gRGFkb3MgY29uc3VsdMOhdmVpczpcbi8vIFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJ3aWR0aFwiXVxuLy8gVUkuZGF0YVtcIndpbmRvd1wiXVtcImhlaWdodFwiXVxuLy8gVUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXVtcInRvcFwiXVxuLy8gVUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXVtcImJvdHRvbVwiXVxuLy8gVUkuZGF0YVtcImNvbHVtbnNcIl1cbi8vIFVJLmRhdGFbXCJpbnRlcmFjdGlvbi10eXBlXCJdXG4vLyBVSS5kYXRhW1widGhlbWUtY29sb3JcIl1bXCJvcmlnaW5hbFwiXVxuLy8gVUkuZGF0YVtcInRpdGxlXCJdXG5cbi8vIERhZG9zIGRlZmluaWRvczpcbi8vIFVJLmRhdGFbXCJjb2x1bW4td2lkdGhcIl1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIEZ1bsOnw6NvIHBhcmEgZm9yw6dhciByZWZsb3dcbiQuZm4ucmVmbG93ID0gZnVuY3Rpb24oKSB7XG5cdHZhciBvZmZzZXQgPSAkdWlbXCJib2R5XCJdLm9mZnNldCgpLmxlZnQ7XG5cdHJldHVybiAkKHRoaXMpO1xufTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8gYm9keSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFVJLmJvZHkubG9jaygpXG4vLyBVSS5ib2R5LnVubG9jaygpXG5cblVJLmJvZHkgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wiYm9keVwiXSA9ICQoZG9jdW1lbnQuYm9keSk7XG5cdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInVpLVwiICsgVUkuZGF0YVtcImludGVyYWN0aW9uLXR5cGVcIl0pO1xuXHRcdHNjcm9sbFN0YXR1cygpO1xuXHR9KTtcblxuXHQkKHdpbmRvdykub24oXCJzY3JvbGxcIiwgc2Nyb2xsU3RhdHVzKTtcblxuXHRmdW5jdGlvbiBzY3JvbGxTdGF0dXMoKSB7XG5cdFx0dmFyIHkgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cblx0XHRpZiAoeSA+IDEpIHtcblx0XHRcdCR1aVtcImJvZHlcIl0ucmVtb3ZlQ2xhc3MoXCJzY3JvbGwtdG9wXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwic2Nyb2xsLXRvcFwiKTtcblx0XHR9XG5cblx0XHRpZiAoeSA+IDU2KSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwibGl2ZXNpdGUtYmx1clwiKS5yZW1vdmVDbGFzcyhcImxpdmVzaXRlLWZvY3VzXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwibGl2ZXNpdGUtZm9jdXNcIikucmVtb3ZlQ2xhc3MoXCJsaXZlc2l0ZS1ibHVyXCIpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBVSS5ib2R5LmxvY2soKVxuXHRcdGxvY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcIm5vLXNjcm9sbFwiKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBVSS5ib2R5LnVubG9jaygpXG5cdFx0dW5sb2NrOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcImJvZHlcIl0ucmVtb3ZlQ2xhc3MoXCJuby1zY3JvbGxcIik7XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8gbG9hZGJhciAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFVJLmxvYWRiYXIuc2hvdygpXG4vLyBVSS5sb2FkYmFyLmhpZGUoKVxuXG5VSS5sb2FkYmFyID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcImxvYWRiYXJcIl0gPSAkKFwiLnVpLWxvYWRiYXJcIik7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJsb2FkYmFyXCJdLmFkZENsYXNzKFwiaW5cIik7XG5cdFx0fSxcblx0XHRoaWRlOiBmdW5jdGlvbigpIHtcblx0XHRcdHRpbWVvdXRbXCJoaWRlLWxvYWRiYXJcIl0gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkdWlbXCJsb2FkYmFyXCJdXG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKFwiZmFkZS1pblwiKVxuXHRcdFx0XHRcdC5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0JHVpW1wibG9hZGJhclwiXS5yZW1vdmVDbGFzcyhcImluXCIpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSwgODAwKTtcblx0XHR9XG5cdH07XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgLyBiYWNrZHJvcCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gVUkuYmFja2Ryb3Auc2hvdygpXG4vLyBVSS5iYWNrZHJvcC5oaWRlKClcblxuVUkuYmFja2Ryb3AgPSAoZnVuY3Rpb24oKSB7XG5cdCR1aVtcImJhY2tkcm9wXCJdID0gWyBdO1xuXG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0Ly8gJHVpW1wiYmFja2Ryb3BcIl0gPSAkKFwiLmpzLXVpLWJhY2tkcm9wXCIpO1xuXHRcdC8vICR1aVtcImJhY2tkcm9wXCJdLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG5cdFx0Ly8gXHQkdWlbXCJiYWNrZHJvcFwiXS50cmlnZ2VyKFwiaGlkZVwiKTtcblx0XHQvLyB9KTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHRzaG93OiBmdW5jdGlvbigkc2NyZWVuLCBldmVudHMpIHtcblx0XHRcdHZhciBzY3JlZW4gPSAkc2NyZWVuW1wic2VsZWN0b3JcIl07XG5cdFx0XHR2YXIgemluZGV4ID0gJHNjcmVlbi5jc3MoXCJ6LWluZGV4XCIpIC0gMTtcblxuXHRcdFx0JHVpW1wiYmFja2Ryb3BcIl1bc2NyZWVuXSA9IF9fcmVuZGVyKFwiYmFja2Ryb3BcIik7XG5cblx0XHRcdCQuZWFjaChldmVudHMsIGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG5cdFx0XHRcdCR1aVtcImJhY2tkcm9wXCJdW3NjcmVlbl0ub24oZXZlbnQsIGhhbmRsZXIpXG5cdFx0XHR9KTtcblxuXHRcdFx0JHVpW1wiYmFja2Ryb3BcIl1bc2NyZWVuXS5jc3MoXCJ6LWluZGV4XCIsIHppbmRleClcblx0XHRcdFx0Lm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7ICQodGhpcykudHJpZ2dlcihcImhpZGVcIik7IH0pXG5cdFx0XHRcdC5hcHBlbmRUbygkdWlbXCJib2R5XCJdKVxuXHRcdFx0XHQuYWRkQ2xhc3MoXCJpblwiKTtcblx0XHR9LFxuXHRcdGhpZGU6IGZ1bmN0aW9uKCRzY3JlZW4pIHtcblx0XHRcdHZhciBzY3JlZW4gPSAkc2NyZWVuW1wic2VsZWN0b3JcIl07XG5cdFx0XHQkdWlbXCJiYWNrZHJvcFwiXVtzY3JlZW5dLnJlbW92ZUNsYXNzKFwiaW5cIikub2ZmKFwiaGlkZVwiKS5yZW1vdmUoKTtcblx0XHR9XG5cdH07XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgc2lkZW5hdiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5VSS5zaWRlbmF2ID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcInNpZGVuYXZcIl0gPSAkKFwiLmpzLXVpLXNpZGVuYXZcIik7XG5cblx0XHQkKFwiLmpzLXNpZGVuYXYtdHJpZ2dlclwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0VUkuc2lkZW5hdi5vcGVuKCk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0b3BlbjogZnVuY3Rpb24oKSB7XG5cdFx0XHRVSS5ib2R5LmxvY2soKTtcblx0XHRcdFVJLmJhY2tkcm9wLnNob3coJHVpW1wic2lkZW5hdlwiXSwgeyBcImhpZGVcIjogVUkuc2lkZW5hdi5jbG9zZSB9KTtcblx0XHRcdCR1aVtcInNpZGVuYXZcIl0uYWRkQ2xhc3MoXCJpblwiKTtcblx0XHR9LFxuXHRcdGNsb3NlOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcInNpZGVuYXZcIl0ucmVtb3ZlQ2xhc3MoXCJpblwiKTtcblx0XHRcdFVJLmJhY2tkcm9wLmhpZGUoJHVpW1wic2lkZW5hdlwiXSk7XG5cdFx0XHRVSS5ib2R5LnVubG9jaygpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBib3R0b21zaGVldFxuVUkuYm90dG9tc2hlZXQgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0b3BlbjogZnVuY3Rpb24oJGNvbnRlbnQsIGFkZENsYXNzKSB7XG5cdFx0XHRVSS5iYWNrZHJvcC5zaG93KCR1aVtcImJvdHRvbXNoZWV0XCJdLCB7IFwiaGlkZVwiOiBVSS5ib3R0b21zaGVldC5jbG9zZSB9KTtcblx0XHRcdCR1aVtcImJvdHRvbXNoZWV0XCJdLmh0bWwoJGNvbnRlbnQpLmFkZENsYXNzKChhZGRDbGFzcz8gYWRkQ2xhc3MgKyBcIiBcIiA6IFwiXCIpICsgXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlXCIpO1xuXG5cdFx0XHRVSS5kYXRhW1widGhlbWUtY29sb3JcIl1bXCJidWZmZXJcIl0gPSAkdWlbXCJ0aGVtZS1jb2xvclwiXS5hdHRyKFwiY29udGVudFwiKTtcblx0XHRcdCR1aVtcInRoZW1lLWNvbG9yXCJdLmF0dHIoXCJjb250ZW50XCIsIFwiIzAwMFwiKTtcblxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLmFkZChcImJvdHRvbXNoZWV0XCIpO1xuXHRcdFx0aGlzdG9yeS5wdXNoU3RhdGUoeyBcInZpZXdcIjogXCJib3R0b21zaGVldFwiIH0sIG51bGwsIG51bGwpO1xuXHRcdH0sXG5cdFx0Y2xvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wiYm90dG9tc2hlZXRcIl0ucmVtb3ZlQ2xhc3MoXCJzbGlkZVwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkdWlbXCJib3R0b21zaGVldFwiXS5yZW1vdmVDbGFzcyhcImluXCIpLmVtcHR5KCkuYXR0cihcImNsYXNzXCIsIFwidWktYm90dG9tc2hlZXQganMtdWktYm90dG9tc2hlZXRcIik7XG5cdFx0XHR9KTtcblxuXHRcdFx0JHVpW1widGhlbWUtY29sb3JcIl0uYXR0cihcImNvbnRlbnRcIiwgVUkuZGF0YVtcInRoZW1lLWNvbG9yXCJdW1wiYnVmZmVyXCJdKTtcblxuXHRcdFx0VUkuYmFja2Ryb3AuaGlkZSgkdWlbXCJib3R0b21zaGVldFwiXSk7XG5cblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZW1vdmUoXCJib3R0b21zaGVldFwiKTtcblx0XHR9XG5cdH07XG59KSgpO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQkdWlbXCJib3R0b21zaGVldFwiXSA9ICQoXCIuanMtdWktYm90dG9tc2hlZXRcIik7XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHRvYXN0IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuVUkudG9hc3QgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0Ly8gVE9ETyBub3ZhIHNpbnRheGUsIHVzYXIgdGVtcGxhdGUgZSBfX3JlbmRlclxuXHRcdHNob3c6IGZ1bmN0aW9uKGNvbmZpZykge1xuXHRcdFx0aWYgKHR5cGVvZiBjb25maWcgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0JHVpLnRvYXN0W1wibWVzc2FnZVwiXS5odG1sKGNvbmZpZ1tcIm1lc3NhZ2VcIl0pO1xuXHRcdFx0XHQkdWkudG9hc3RbXCJhY3Rpb25cIl0uaHRtbCgoY29uZmlnW1wiYWN0aW9uXCJdPyBjb25maWdbXCJhY3Rpb25cIl0gOiBcIlwiKSk7XG5cdFx0XHRcdCR1aS50b2FzdC5hZGRDbGFzcyhcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIik7XG5cdFx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJ0b2FzdC1hY3RpdmVcIik7XG5cblx0XHRcdFx0Ly8gVE9ETzogLmZhYi1ib3R0b20gdHJhbnNmb3JtOiB0cmFuc2xhdGVZXG5cblx0XHRcdFx0JHVpLnRvYXN0Lm9uKFwiY2xpY2tcIiwgVUkudG9hc3QuZGlzbWlzcyk7XG5cdFx0XHRcdCR1aS50b2FzdFtcImFjdGlvblwiXS5vbihcImNsaWNrXCIsIGNvbmZpZ1tcImNhbGxiYWNrXCJdKTtcblxuXHRcdFx0XHRjbGVhclRpbWVvdXQodGltZW91dFtcInRvYXN0XCJdKTtcblxuXHRcdFx0XHRpZiAoIWNvbmZpZ1tcInBlcnNpc3RlbnRcIl0pIHtcblx0XHRcdFx0XHQkdWkudG9hc3QucmVtb3ZlQ2xhc3MoXCJzdHJlYW0tb25seVwiKTtcblx0XHRcdFx0XHR0aW1lb3V0W1widG9hc3RcIl0gPSBzZXRUaW1lb3V0KFVJLnRvYXN0LmRpc21pc3MsIChjb25maWdbXCJ0aW1lb3V0XCJdPyBjb25maWdbXCJ0aW1lb3V0XCJdIDogNjAwMCkpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCR1aS50b2FzdC5hZGRDbGFzcyhcInN0cmVhbS1vbmx5XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRVSS50b2FzdC5zaG93KHtcblx0XHRcdFx0XHRcIm1lc3NhZ2VcIjogY29uZmlnXG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGRpc21pc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpLnRvYXN0LnJlbW92ZUNsYXNzKFwic2xpZGVcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInRvYXN0LWFjdGl2ZVwiKTtcblx0XHRcdFx0JHVpLnRvYXN0LnJlbW92ZUNsYXNzKFwiaW4gc3RyZWFtLW9ubHlcIik7XG5cblx0XHRcdFx0JHVpLnRvYXN0W1wibWVzc2FnZVwiXS5lbXB0eSgpO1xuXHRcdFx0XHQkdWkudG9hc3RbXCJhY3Rpb25cIl0uZW1wdHkoKTtcblx0XHRcdH0pO1xuXHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXRbXCJ0b2FzdFwiXSk7XG5cdFx0fSxcblxuXHRcdC8vIFRPRE8gREVQUkVDQVRFRFxuXHRcdG9wZW46IGZ1bmN0aW9uKG1lc3NhZ2UsIGFjdGlvbiwgY2FsbGJhY2ssIHBlcnNpc3RlbnQpIHtcblx0XHQvLyBvcGVuOiBmdW5jdGlvbihtZXNzYWdlLCBhZGRDbGFzcykge1xuXHRcdFx0JHVpLnRvYXN0Lm1lc3NhZ2UuaHRtbChtZXNzYWdlKTtcblx0XHRcdCR1aS50b2FzdC5hY3Rpb24uaHRtbCgoYWN0aW9uPyBhY3Rpb24gOiBcIlwiKSk7XG5cdFx0XHQkdWkudG9hc3QuYWRkQ2xhc3MoXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlXCIpO1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInRvYXN0LWFjdGl2ZVwiKTtcblxuXHRcdFx0Ly8gVE9ETzogLmZhYi1ib3R0b20gdHJhbnNmb3JtOiB0cmFuc2xhdGVZXG5cblx0XHRcdCR1aS50b2FzdC5vbihcImNsaWNrXCIsIHRvYXN0LmNsb3NlKTtcblx0XHRcdCR1aS50b2FzdC5hY3Rpb24ub24oXCJjbGlja1wiLCBjYWxsYmFjayk7XG5cblx0XHRcdGNsZWFyVGltZW91dCh0aW1lb3V0W1widG9hc3RcIl0pO1xuXHRcdFx0aWYgKCFwZXJzaXN0ZW50KSB7XG5cdFx0XHRcdCR1aS50b2FzdC5yZW1vdmVDbGFzcyhcInN0cmVhbS1vbmx5XCIpO1xuXHRcdFx0XHR0aW1lb3V0W1widG9hc3RcIl0gPSBzZXRUaW1lb3V0KHRvYXN0LmNsb3NlLCA2NTAwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCR1aS50b2FzdC5hZGRDbGFzcyhcInN0cmVhbS1vbmx5XCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn0pKCk7XG5cbnZhciB0b2FzdCA9IFVJLnRvYXN0O1xudG9hc3QuY2xvc2UgPSBVSS50b2FzdC5kaXNtaXNzO1xuXG4vLyB2YXIgc25hY2tiYXIgPSB0b2FzdDtcblxuLy8galF1ZXJ5XG4kdWkudG9hc3QgPSBbIF07XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCR1aS50b2FzdCA9ICQoXCIuanMtdWktdG9hc3RcIik7XG5cdCR1aS50b2FzdFtcIm1lc3NhZ2VcIl0gPSAkKFwiLnRvYXN0LW1lc3NhZ2VcIiwgJHVpLnRvYXN0KTtcblx0JHVpLnRvYXN0W1wiYWN0aW9uXCJdID0gJChcIi50b2FzdC1hY3Rpb25cIiwgJHVpLnRvYXN0KTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBpIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBUT0RPIGxlZ2FjeVxubGV0IGFwaV9rZXkgPSBcIjA2M2M3MmIyYWZjNTMzM2YzYjI3YjM2NmJkYWM5ZWI4MWQ2NGJjNmExMmNkN2IzZjRiNmFkZTc3YTA5MmI2M2FcIjtcblxuY29uc3QgTGlzdGFBUEkgPSBmdW5jdGlvbihlbmRwb2ludCwgZGF0YSkge1xuXHRsb2coXCJBUEkgUmVxdWVzdDogXCIgKyBlbmRwb2ludCwgXCJpbmZvXCIpO1xuXHRsZXQgYXBpX3VybCA9IFwiaHR0cHM6Ly9hcGkubGFndWluaG8ub3JnL2xpc3RhL1wiICsgZWRpY2FvO1xuXHRsZXQgYXBpX2tleSA9IFwiMDYzYzcyYjJhZmM1MzMzZjNiMjdiMzY2YmRhYzllYjgxZDY0YmM2YTEyY2Q3YjNmNGI2YWRlNzdhMDkyYjYzYVwiO1xuXG5cdGxldCByZXF1ZXN0ID0gJC5nZXRKU09OKGFwaV91cmwgKyBlbmRwb2ludCArIFwiP2tleT1cIiArIGFwaV9rZXkgKyBcIiZjYWxsYmFjaz0/XCIsIGRhdGEpO1xuXHRyZXR1cm4gcmVxdWVzdDtcbn07XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBwbGFjYXIgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmFwcC5QbGFjYXIgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wicGxhY2FyXCJdID0gJChcIi5qcy1hcHAtcGxhY2FyID4gdWxcIik7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0dXBkYXRlOiBmdW5jdGlvbih0dXJtYXMpIHtcblx0XHRcdC8vIGNvbmZlcmUgcXVhbCBhIHR1cm1hIGNvbSBtYWlvciBwb250dWHDp8Ojb1xuXHRcdFx0Ly8gZSBzb21hIGEgcG9udHVhw6fDo28gZGUgY2FkYSB0dXJtYSBwYXJhIG9idGVyIG8gdG90YWwgZGUgcG9udG9zXG5cdFx0XHR2YXIgbWFpb3JfcG9udHVhY2FvID0gMDtcblx0XHRcdHZhciB0b3RhbF9kZV9wb250b3MgPSAwO1xuXG5cdFx0XHRmb3IgKHZhciB0dXJtYSBpbiB0dXJtYXMpIHtcblx0XHRcdFx0dmFyIHBvbnR1YWNhb19kYV90dXJtYSA9IHR1cm1hc1t0dXJtYV1bXCJwb250b3NcIl07XG5cblx0XHRcdFx0aWYgKHBvbnR1YWNhb19kYV90dXJtYSA+IG1haW9yX3BvbnR1YWNhbykge1xuXHRcdFx0XHRcdG1haW9yX3BvbnR1YWNhbyA9IHBvbnR1YWNhb19kYV90dXJtYTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRvdGFsX2RlX3BvbnRvcyArPSBwb250dWFjYW9fZGFfdHVybWE7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGxpbXBhIG8gcGxhY2FyXG5cdFx0XHQkdWlbXCJwbGFjYXJcIl0uZW1wdHkoKTtcblxuXHRcdFx0Ly8gYWRpY2lvbmEgY2FkYSB0dXJtYSBubyBwbGFjYXJcblx0XHRcdCQuZWFjaCh0dXJtYXMsIGZ1bmN0aW9uKGluZGV4LCB0dXJtYSkge1xuXHRcdFx0XHQvLyBjYWxjdWxhICUgZGEgdHVybWEgZW0gcmVsYcOnw6NvIGFvIHRvdGFsIGRlIHBvbnRvc1xuXHRcdFx0XHR2YXIgcGVyY2VudHVhbF9kYV90dXJtYSA9ICh0b3RhbF9kZV9wb250b3MgPiAwPyB0dXJtYVtcInBvbnRvc1wiXSAvIG1haW9yX3BvbnR1YWNhbyA6IDApO1xuXG5cdFx0XHRcdC8vIGZvcm1hdGEgb3MgZGFkb3Ncblx0XHRcdFx0dHVybWFbXCJsYXJndXJhLWRhLWJhcnJhXCJdID0gXCJ3aWR0aDogXCIgKyAocGVyY2VudHVhbF9kYV90dXJtYSAqIDEwMCkudG9GaXhlZCgzKSArIFwiJTtcIjtcblx0XHRcdFx0dHVybWFbXCJ0dXJtYS1mb3JtYXRhZGFcIl0gPSB0dXJtYVtcInR1cm1hXCJdLnRvVXBwZXJDYXNlKCk7XG5cdFx0XHRcdHR1cm1hW1wicG9udG9zXCJdID0gdHVybWFbXCJwb250b3NcIl07XG5cdFx0XHRcdHR1cm1hW1wicG9udHVhY2FvLWZvcm1hdGFkYVwiXSA9IHR1cm1hW1wicG9udG9zXCJdLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIuXCIpO1xuXG5cdFx0XHRcdC8vIHJlbmRlcml6YSBlIGNvbG9jYSBuYSBww6FnaW5hXG5cdFx0XHRcdHZhciAkdHVybWEgPSBfX3JlbmRlcihcInBsYWNhci10dXJtYVwiLCB0dXJtYSk7XG5cdFx0XHRcdCR1aVtcInBsYWNhclwiXS5hcHBlbmQoJHR1cm1hKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAodG90YWxfZGVfcG9udG9zID09PSAwKSB7XG5cdFx0XHRcdCR1aVtcInBsYWNhclwiXS5wYXJlbnQoKS5hZGRDbGFzcyhcInplcm9lZFwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCR1aVtcInBsYWNhclwiXS5wYXJlbnQoKS5yZW1vdmVDbGFzcyhcInplcm9lZFwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhcHAgZXZvbHXDp8OjbyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5Fdm9sdWNhby5zdGFydCgpXG4vLyBhcHAuRXZvbHVjYW8udXBkYXRlKClcblxuLy8gVE9ET1xuLy8gLSBtb3N0cmFyIGNvbnRhZG9yIG5hcyDDumx0aW1hcyA0OCBob3Jhc1xuLy8gLSBvIHF1ZSBhY29udGVjZSBkZXBvaXMgZG8gZW5jZXJyYW1lbnRvP1xuLy8gICAtIGJhcnJhIGZpY2EgZGEgY29yIGRhIHR1cm1hIGUgYXBhcmVjZSBtZW5zYWdlbSBlbSBjaW1hIFwiRUMxIGNhbXBlw6NcIlxuXG5hcHAuRXZvbHVjYW8gPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wiZXZvbHVjYW9cIl0gPSAkKFwiLmFwcC1ldm9sdWNhb1wiKTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Fdm9sdWNhby5zdGFydCgpXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9nKFwiYXBwLkV2b2x1Y2FvLnN0YXJ0XCIsIFwiaW5mb1wiKTtcblxuXHRcdFx0Ly8gcGVnYSBkYXRhIGRlIGluw61jaW8gZSBkYXRhIGRlIGVuY2VycmFtZW50b1xuXHRcdFx0bGV0IGRpYV9pbmljaWFsID0gTGlzdGEuRWRpY2FvW1wiaW5pY2lvXCJdID0gbW9tZW50KExpc3RhLkVkaWNhb1tcImluaWNpb1wiXSk7XG5cdFx0XHRsZXQgZGlhX2ZpbmFsID0gTGlzdGEuRWRpY2FvW1wiZmltXCJdID0gbW9tZW50KExpc3RhLkVkaWNhb1tcImZpbVwiXSk7XG5cblx0XHRcdC8vIGxldCBkaWFfaW5pY2lhbCA9IExpc3RhLkVkaWNhb1tcImluaWNpb1wiXTtcblx0XHRcdC8vIGxldCBkaWFfZmluYWwgPSBMaXN0YS5FZGljYW9bXCJmaW1cIl07XG5cblx0XHRcdC8vIGNhbGN1bGEgbyB0ZW1wbyB0b3RhbCAoZW0gbWludXRvcylcblx0XHRcdGxldCBkdXJhY2FvX3RvdGFsID0gTGlzdGEuRWRpY2FvW1wiZHVyYWNhby1lbS1taW51dG9zXCJdID0gZGlhX2ZpbmFsLmRpZmYoZGlhX2luaWNpYWwsIFwibWludXRlc1wiKTtcblxuXHRcdFx0Ly8gaW5zZXJlIG9zIGRpYXMgbmEgYmFycmEsIGluZG8gZGUgZGlhIGVtIGRpYSBhdMOpIGNoZWdhciBhbyBlbmNlcnJhbWVudG9cblx0XHRcdGZvciAobGV0IGRpYSA9IGRpYV9pbmljaWFsLmNsb25lKCk7IGRpYS5pc0JlZm9yZShkaWFfZmluYWwpOyBkaWEuYWRkKDEsIFwiZGF5c1wiKSkge1xuXHRcdFx0XHQvLyBkZWZpbmUgaW7DrWNpbyBlIGZpbmFsIGRvIGRpYS5cblx0XHRcdFx0Ly8gc2UgZmluYWwgZm9yIGFww7NzIGEgZGF0YSBkZSBlbmNlcnJhbWVudG8sIHVzYSBlbGEgY29tbyBmaW5hbFxuXHRcdFx0XHRsZXQgaW5pY2lvX2RvX2RpYSA9IGRpYTtcblx0XHRcdFx0bGV0IGZpbmFsX2RvX2RpYSA9IGRpYS5jbG9uZSgpLmVuZE9mKFwiZGF5XCIpO1xuXHRcdFx0XHRpZiAoZmluYWxfZG9fZGlhLmlzQWZ0ZXIoZGlhX2ZpbmFsKSkge1xuXHRcdFx0XHRcdGZpbmFsX2RvX2RpYSA9IGRpYV9maW5hbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGNhbGN1bGEgYSBkdXJhw6fDo28gZG8gZGlhIGVtIG1pbnV0b3Ncblx0XHRcdFx0bGV0IGR1cmFjYW9fZG9fZGlhID0gZmluYWxfZG9fZGlhLmRpZmYoaW5pY2lvX2RvX2RpYSwgXCJtaW51dGVzXCIpO1xuXG5cdFx0XHRcdC8vIGRlZmluZSBhIGR1cmHDp8OjbyBwZXJjZW50dWFsIGRvIGRpYSBlbSByZWxhw6fDo28gYW8gdG90YWxcblx0XHRcdFx0bGV0IHBlcmNlbnR1YWxfZG9fZGlhID0gZHVyYWNhb19kb19kaWEgLyBkdXJhY2FvX3RvdGFsO1xuXG5cdFx0XHRcdC8vIGNhbGN1bGEgYSBsYXJndXJhIGRvIGRpYSAoZGUgYWNvcmRvIGNvbSBkdXJhw6fDo28gcGVyY2VudHVhbClcblx0XHRcdFx0Ly8gZSBpbnNlcmUgZGlhIG5hIGJhcnJhIGRlIGV2b2x1w6fDo29cblx0XHRcdFx0bGV0IGxhcmd1cmFfZG9fZGlhID0gKHBlcmNlbnR1YWxfZG9fZGlhICogMTAwKS50b0ZpeGVkKDMpO1xuXHRcdFx0XHRsZXQgJGRpYSA9IF9fcmVuZGVyKFwiZXZvbHVjYW8tZGlhXCIsIHtcblx0XHRcdFx0XHRkaWE6IGRpYS5mb3JtYXQoXCJkZGRcIilcblx0XHRcdFx0fSkuY3NzKFwid2lkdGhcIiwgbGFyZ3VyYV9kb19kaWEgKyBcIiVcIik7XG5cblx0XHRcdFx0JChcIi5kYXktbGFiZWxzXCIsICR1aVtcImV2b2x1Y2FvXCJdKS5hcHBlbmQoJGRpYSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNvbSBvcyBkaWFzIGluc2VyaWRvcyBuYSBiYXJyYSBkZSBldm9sdcOnw6NvLFxuXHRcdFx0Ly8gZGVzZW5oYSBhIGJhcnJhIGRlIHRlbXBvIHRyYW5zY29ycmlkb1xuXHRcdFx0c2V0VGltZW91dChhcHAuRXZvbHVjYW8udXBkYXRlLCAxMDAwKTtcblxuXHRcdFx0Ly8gYXR1YWxpemEgYSBsaW5oYSBkZSBldm9sdcOnw6NvIGEgY2FkYSBYIG1pbnV0b3Ncblx0XHRcdHRpbWVvdXRbXCJldm9sdWNhb1wiXSA9IHNldEludGVydmFsKGFwcC5Fdm9sdWNhby51cGRhdGUsIDYwICogMTAwMCk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkV2b2x1Y2FvLnVwZGF0ZSgpXG5cdFx0dXBkYXRlOiBmdW5jdGlvbigpIHtcblx0XHRcdGxvZyhcImFwcC5Fdm9sdWNhby51cGRhdGVcIiwgXCJpbmZvXCIpO1xuXG5cdFx0XHQvLyBwZWdhIGFzIGRhdGFzIGUgY2FsY3VsYSBvIHRlbXBvIChlbSBtaW51dG9zKSBlIHBlcmNlbnR1YWwgdHJhbnNjb3JyaWRvc1xuXHRcdFx0bGV0IGFnb3JhID0gbW9tZW50KCk7XG5cdFx0XHRsZXQgZGlhX2luaWNpYWwgPSBMaXN0YS5FZGljYW9bXCJpbmljaW9cIl07XG5cdFx0XHRsZXQgZGlhX2ZpbmFsID0gTGlzdGEuRWRpY2FvW1wiZmltXCJdO1xuXHRcdFx0bGV0IGR1cmFjYW9fdG90YWwgPSBMaXN0YS5FZGljYW9bXCJkdXJhY2FvLWVtLW1pbnV0b3NcIl07XG5cblx0XHRcdGxldCB0ZW1wb190cmFuc2NvcnJpZG8gPSBhZ29yYS5kaWZmKGRpYV9pbmljaWFsLCBcIm1pbnV0ZXNcIik7XG5cdFx0XHRsZXQgcGVyY2VudHVhbF90cmFuc2NvcnJpZG8gPSAodGVtcG9fdHJhbnNjb3JyaWRvIDwgZHVyYWNhb190b3RhbCA/IHRlbXBvX3RyYW5zY29ycmlkbyAvIGR1cmFjYW9fdG90YWwgOiAxKTtcblxuXHRcdFx0Ly8gZGVmaW5lIGEgbGFyZ3VyYSBkYSBiYXJyYSBkZSBldm9sdcOnw6NvIGNvbXBsZXRhIGlndWFsIMOgIGxhcmd1cmEgZGEgdGVsYVxuXHRcdFx0Ly8gZGVwb2lzLCBtb3N0cmEgYXBlbmFzIG8gcGVyY2VudHVhbCB0cmFuc2NvcnJpZG9cblx0XHRcdCQoXCIuZWxhcHNlZC10aW1lIC5iYXJcIiwgJHVpW1wiZXZvbHVjYW9cIl0pLmNzcyhcIndpZHRoXCIsIFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJ3aWR0aFwiXSk7XG5cblx0XHRcdGxldCBsYXJndXJhX2RhX2JhcnJhID0gKHBlcmNlbnR1YWxfdHJhbnNjb3JyaWRvICogMTAwKS50b0ZpeGVkKDMpO1xuXHRcdFx0JChcIi5lbGFwc2VkLXRpbWVcIiwgJHVpW1wiZXZvbHVjYW9cIl0pLmNzcyhcIndpZHRoXCIsIGxhcmd1cmFfZGFfYmFycmEgKyBcIiVcIik7XG5cdFx0fVxuXHR9XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbGlzdGEgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBwLkxpc3RhLmxvYWQoKVxuLy8gYXBwLkxpc3RhLmxheW91dCgpXG4vLyBhcHAuTGlzdGEuc29ydCgpXG5cbmFwcC5MaXN0YSA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQkYXBwW1wibGlzdGFcIl0gPSAkKFwiLmFwcC1saXN0YVwiKTtcblxuXHRcdCRhcHBbXCJsaXN0YVwiXS5pc290b3BlKHtcblx0XHRcdFwiaXRlbVNlbGVjdG9yXCI6IFwiLmNhcmQtdGFyZWZhXCIsXG5cdFx0XHRcInRyYW5zaXRpb25EdXJhdGlvblwiOiBcIi44c1wiLFxuXHRcdFx0XCJnZXRTb3J0RGF0YVwiOiB7XG5cdFx0XHRcdFwiZGF0ZVwiOiBcIi5sYXN0LW1vZGlmaWVkXCIsXG5cdFx0XHRcdFwidGFyZWZhXCI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VJbnQoJChlbGVtZW50KS5kYXRhKFwidGFyZWZhXCIpLCAxMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRcInNvcnRBc2NlbmRpbmdcIjoge1xuXHRcdFx0XHRcImRhdGVcIjogZmFsc2UsXG5cdFx0XHRcdFwidGFyZWZhXCI6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRcInNvcnRCeVwiOiBbXCJkYXRlXCIsIFwidGFyZWZhXCJdLFxuXHRcdFx0XCJtYXNvbnJ5XCI6IHtcblx0XHRcdFx0XCJndXR0ZXJcIjogKHVpW1wiY29sdW1uc1wiXSA9PT0gMT8gOCA6IDE2KVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0JGFwcFtcImxpc3RhXCJdLm9uKFwiY2xpY2tcIiwgXCIuY2FyZC10YXJlZmE6bm90KC5naG9zdClcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGlmIChldmVudC53aGljaCA9PT0gMSkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRcdGxldCAkY2FyZCA9ICQodGhpcyk7XG5cdFx0XHRcdGxldCBudW1lcm8gPSAkY2FyZC5kYXRhKFwidGFyZWZhXCIpO1xuXHRcdFx0XHRhcHAuVGFyZWZhLm9wZW4obnVtZXJvLCAkY2FyZCwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEuc3RhcnQoKVxuXHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdGxvZyhcImFwcC5MaXN0YS5zdGFydFwiLCBcImluZm9cIik7XG5cblx0XHRcdC8vIGZheiBhcyBhbHRlcmHDp8O1ZXMgZGUgYWNvcmRvIGNvbSBvIHN0YXR1c1xuXHRcdFx0Ly8gaW5zZXJlIGFzIG1lbnNhZ2Vuc1xuXHRcdFx0YXBwLkxpc3RhLnN0YXR1cygpO1xuXHRcdFx0YXBwLkxpc3RhLm1lc3NhZ2VzKCk7XG5cdFx0XHRhcHAuTGlzdGEudGFyZWZhcygpO1xuXG5cblxuXHRcdFx0Ly8gdGlyYSBhIHRlbGEgZGUgbG9hZGluZ1xuXHRcdFx0VUkubG9hZGJhci5oaWRlKCk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxpc3RhLnN0YXR1cygpXG5cdFx0c3RhdHVzOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIHNlIHByYXpvIGRlIHBvc3RhZ2VtIGVzdGl2ZXIgZW5jZXJyYWRvLCBpbnNlcmUgY2xhc3NlIG5vIDxib2R5PlxuXHRcdFx0aWYgKG1vbWVudCgpLmlzQWZ0ZXIoTGlzdGEuRWRpY2FvW1wiZmltXCJdKSkge1xuXHRcdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwicG9zdGFnZW5zLWVuY2VycmFkYXNcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHNlIGEgZWRpw6fDo28gZXN0aXZlciBlbmNlcnJhZGEsIGluc2VyZSBjbGFzc2Ugbm8gPGJvZHk+XG5cdFx0XHQvLyBlIHBhcmEgZGUgYXR1YWxpemFyIGF1dG9tYXRpY2FtZW50ZVxuXHRcdFx0aWYgKExpc3RhLlJlZ3VsYW1lbnRvW1wiZW5jZXJyYWRhXCJdID09PSB0cnVlKSB7XG5cdFx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJlZGljYW8tZW5jZXJyYWRhXCIpO1xuXHRcdFx0XHRjbGVhckludGVydmFsKHVwZGF0ZV9pbnRlcnZhbCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxpc3RhLm1lc3NhZ2VzKClcblx0XHRtZXNzYWdlczogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBzZSB0aXZlciB0w610dWxvIGVzcGVjaWZpY2FkbywgaW5zZXJlIGVsZVxuXHRcdFx0aWYgKExpc3RhLkVkaWNhb1tcIm1lbnNhZ2VtXCJdW1widGl0dWxvXCJdKSB7XG5cdFx0XHRcdGxldCBwYWdlX3RpdGxlID0gTGlzdGEuRWRpY2FvW1wibWVuc2FnZW1cIl1bXCJ0aXR1bG9cIl07XG5cdFx0XHRcdCR1aVtcInRpdGxlXCJdLmh0bWwocGFnZV90aXRsZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGRlIHRpdmVyIG1lbnNhZ2VtIGRlIHJvZGFww6kgZXNwZWNpZmljYWRhLCBpbnNlcmUgZWxhXG5cdFx0XHRpZiAoTGlzdGEuRWRpY2FvW1wibWVuc2FnZW1cIl1bXCJyb2RhcGVcIl0pIHtcblx0XHRcdFx0bGV0IGNsb3NpbmdfbWVzc2FnZSA9IExpc3RhLkVkaWNhb1tcIm1lbnNhZ2VtXCJdW1wicm9kYXBlXCJdO1xuXHRcdFx0XHQkKFwiLmpzLW1lbnNhZ2VtLWZpbmFsXCIpLmh0bWwoY2xvc2luZ19tZXNzYWdlKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEudGFyZWZhcygpXG5cdFx0dGFyZWZhczogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBtb3N0cmEgbyBsb2FkaW5nIGUgbGltcGEgYSBsaXN0YSBwYXJhIGNvbWXDp2FyIGRvIHplcm9cblx0XHRcdC8vIFVJLmxvYWRpbmcuc2hvdygpO1xuXHRcdFx0JGFwcFtcImxpc3RhXCJdLmVtcHR5KCk7XG5cblx0XHRcdC8vIGluc2VyZSBhcyB0YXJlZmFzXG5cdFx0XHRmb3IgKGxldCB0YXJlZmEgb2YgTGlzdGEuVGFyZWZhcykge1xuXHRcdFx0XHQvLyBpbnNlcmUgbm8gY2FjaGVcblx0XHRcdFx0Y2FjaGVbXCJ0YXJlZmFzXCJdW3RhcmVmYVtcIm51bWVyb1wiXV0gPSB0YXJlZmE7XG5cblx0XHRcdFx0Ly8gY3JpYSBvIGxpbmsgcGFyYSBhIHRhcmVmYVxuXHRcdFx0XHR0YXJlZmFbXCJ1cmxcIl0gPSByb3V0ZXJbXCJidWlsZC1saW5rXCJdKFwiL3RhcmVmYXMvXCIgKyB0YXJlZmFbXCJudW1lcm9cIl0pO1xuXG5cdFx0XHRcdC8vIHNlIHRpdmVyIGltYWdlbSwgYWp1c3RhIGFzIGRpbWVuc29lc1xuXHRcdFx0XHRpZiAodGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdFx0dGFyZWZhW1wiaW1hZ2VtLXVybFwiXSA9IHRhcmVmYVtcImltYWdlbVwiXVtcInVybFwiXTtcblx0XHRcdFx0XHR0YXJlZmFbXCJpbWFnZW0tYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKHRhcmVmYVtcImltYWdlbVwiXVtcImFzcGVjdG9cIl0gKiAxMDApLnRvRml4ZWQoMikgKyBcIiVcIjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCAkdGFyZWZhID0gX19yZW5kZXIoXCJjYXJkLXRhcmVmYVwiLCB0YXJlZmEpLmRhdGEoe1xuXHRcdFx0XHRcdFwidGFyZWZhXCI6IHRhcmVmYVtcIm51bWVyb1wiXSxcblx0XHRcdFx0XHRcImxhc3QtbW9kaWZpZWRcIjogKHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXT8gbW9tZW50KHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXSkuZm9ybWF0KFwiWFwiKSA6IDApXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdCRhcHBbXCJsaXN0YVwiXS5hcHBlbmQoJHRhcmVmYSkuaXNvdG9wZShcImFwcGVuZGVkXCIsICR0YXJlZmEpO1xuXHRcdFx0fVxuXG5cdFx0XHRhcHAuTGlzdGEubGF5b3V0KCk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxpc3RhLmxvYWQoKVxuXHRcdGxvYWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gbW9zdHJhIGEgdGVsYSBkZSBsb2FkaW5nIGUgbGltcGEgbyBzdHJlYW1cblx0XHRcdCRzdHJlYW0ubG9hZGluZy5hZGRDbGFzcyhcImZhZGUtaW4gaW5cIik7XG5cblx0XHRcdC8vIGNhcnJlZ2Egb3MgZGFkb3MgZGEgQVBJXG5cdFx0XHQkLmdldEpTT04oXCJodHRwczovL2FwaS5sYWd1aW5oby5vcmcvbGlzdGEvXCIgKyBlZGljYW8gKyBcIi90dWRvP2tleT1cIiArIGFwaV9rZXkgKyBcIiZjYWxsYmFjaz0/XCIpLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHQvLyBcIkRJUkVUT1JcIlxuXHRcdFx0XHQvLyBUT0RPIE8gbG9hZCBkZXZlIGZpY2FyIHNlcGFyYWRvIGRvIFN0cmVhbSAodmVyIGlzc3VlICM3KVxuXHRcdFx0XHRMaXN0YS5SZWd1bGFtZW50byA9IGRhdGFbXCJlZGljYW9cIl07XG5cdFx0XHRcdExpc3RhLlRhcmVmYXMgPSBkYXRhW1widGFyZWZhc1wiXTtcblxuXHRcdFx0XHQvLyBTZSBhIEVkacOnw6NvIGVzdGl2ZXIgZW5jZXJyYWRhLi4uXG5cblxuXHRcdFx0XHQvLyBGSU0gRE8gXCJESVJFVE9SXCJcblxuXHRcdFx0XHQvLyBMaW1wYSBvIHN0cmVhbSBwYXJhIGNvbWXDp2FyIGRvIHplcm9cblx0XHRcdFx0JHN0cmVhbS5lbXB0eSgpO1xuXG5cdFx0XHRcdC8vIE1vbnRhIHBsYWNhclxuXHRcdFx0XHRhcHAuUGxhY2FyLnVwZGF0ZShkYXRhW1wicGxhY2FyXCJdKTtcblxuXHRcdFx0XHQvLyBJbnNlcmUgb3MgY2FyZHMgZGUgdGFyZWZhc1xuXHRcdFx0XHQkLmVhY2goZGF0YVtcInRhcmVmYXNcIl0sIGZ1bmN0aW9uKGluZGV4LCB0YXJlZmEpIHtcblx0XHRcdFx0XHR0YXJlZmFzW3RhcmVmYVtcIm51bWVyb1wiXV0gPSB0YXJlZmE7XG5cdFx0XHRcdFx0dGFyZWZhW1widXJsXCJdID0gXCIvdGFyZWZhcy9cIiArIHRhcmVmYVtcIm51bWVyb1wiXTtcblx0XHRcdFx0XHR0YXJlZmFbXCJ1cmxcIl0gPSByb3V0ZXJbXCJidWlsZC1saW5rXCJdKFwiL3RhcmVmYXMvXCIgKyB0YXJlZmFbXCJudW1lcm9cIl0pO1xuXG5cdFx0XHRcdFx0aWYgKHRhcmVmYVtcImltYWdlbVwiXSkge1xuXHRcdFx0XHRcdFx0dGFyZWZhW1wiaW1hZ2VtLXVybFwiXSA9IHRhcmVmYVtcImltYWdlbVwiXVtcInVybFwiXTtcblx0XHRcdFx0XHRcdHRhcmVmYVtcImltYWdlbS1hc3BlY3RvXCJdID0gXCJwYWRkaW5nLXRvcDogXCIgKyAodGFyZWZhW1wiaW1hZ2VtXCJdW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHZhciAkY2FyZCA9IF9fcmVuZGVyKFwiY2FyZC10YXJlZmFcIiwgdGFyZWZhKS5kYXRhKHtcblx0XHRcdFx0XHRcdFx0XCJ0YXJlZmFcIjogdGFyZWZhW1wibnVtZXJvXCJdLFxuXHRcdFx0XHRcdFx0XHRcImxhc3QtbW9kaWZpZWRcIjogKHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXT8gbW9tZW50KHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXSkuZm9ybWF0KFwiWFwiKSA6IDApXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGlmICh0YXJlZmFbXCJwcmV2aWV3XCJdKSB7XG5cdFx0XHRcdFx0XHQkY2FyZC5hZGRDbGFzcyhcImZhbnRhc21hXCIpO1xuXHRcdFx0XHRcdFx0JChcImFcIiwgJGNhcmQpLnJlbW92ZUF0dHIoXCJocmVmXCIpO1xuXHRcdFx0XHRcdFx0JChcIi5ib2R5XCIsICRjYXJkKS5yZW1vdmUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIXRhcmVmYVtcImltYWdlbVwiXSkge1xuXHRcdFx0XHRcdFx0JChcIi5tZWRpYVwiLCAkY2FyZCkucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcG9zdHNcblx0XHRcdFx0XHR2YXIgJGdyaWQgPSAkKFwiLmdyaWRcIiwgJGNhcmQpO1xuXG5cdFx0XHRcdFx0aWYgKHRhcmVmYVtcInBvc3RzXCJdICYmIHRhcmVmYVtcInBvc3RzXCJdLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0dmFyIHRvdGFsX3Bvc3RzID0gdGFyZWZhW1wicG9zdHNcIl0ubGVuZ3RoO1xuXHRcdFx0XHRcdFx0Ly8gdmFyIHRvdGFsX21lZGlhID0gdGFyZWZhW1wicG9zdHNcIl0ucmVkdWNlKCh0b3RhbCwgcG9zdCkgPT4gdG90YWwgKyBwb3N0W1wibWlkaWFcIl0ubGVuZ3RoLCAwKTtcblx0XHRcdFx0XHRcdHZhciBtYXhfbWVkaWFfdG9fc2hvdyA9ICh1aVtcImNvbHVtbnNcIl0gPCAyPyA5IDogOCk7XG5cdFx0XHRcdFx0XHR2YXIgc2hvd25fbWVkaWFfY291bnQgPSAwO1xuXG5cdFx0XHRcdFx0XHR2YXIgcG9zdF90eXBlc193aXRoX2ltYWdlX3ByZXZpZXcgPSBbXCJpbWFnZW1cIiwgXCJ5b3V0dWJlXCIsIFwidmltZW9cIiwgXCJ2aW5lXCIsIFwiZ2lmXCJdO1xuXHRcdFx0XHRcdFx0dmFyIHBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXcgPSBbXCJ0ZXh0b1wiXTtcblxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbF9wb3N0czsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBwb3N0ID0gdGFyZWZhW1wicG9zdHNcIl1baV07XG5cblx0XHRcdFx0XHRcdFx0aWYgKChwb3N0W1wibWlkaWFcIl0gfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ0ZXh0b1wiKSAmJiAoc2hvd25fbWVkaWFfY291bnQgPCBtYXhfbWVkaWFfdG9fc2hvdykpIHtcblx0XHRcdFx0XHRcdFx0XHRzaG93bl9tZWRpYV9jb3VudCsrO1xuXG5cdFx0XHRcdFx0XHRcdFx0dmFyIHRpbGVfdHlwZTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgbWVkaWEgPSB7IH07XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBpbWFnZW1cblx0XHRcdFx0XHRcdFx0XHRpZiAocG9zdF90eXBlc193aXRoX2ltYWdlX3ByZXZpZXcuaW5kZXhPZihwb3N0W1widGlwb1wiXSkgPiAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGlsZV90eXBlID0gXCJ0aWxlLWltYWdlXCI7XG5cblx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wiY291bnRcIl0gPSBzaG93bl9tZWRpYV9jb3VudDtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwieW91dHViZVwiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidmltZW9cIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbmVcIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcImdpZlwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wicHJldmlld1wiXSA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCdcIiArIHBvc3RbXCJtaWRpYVwiXVswXVtcInRodW1ibmFpbFwiXSArIFwiJyk7XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wibW9kaWZpZXJcIl0gPSBcInZpZGVvXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHBvc3RbXCJtaWRpYVwiXSAmJiBwb3N0W1wibWlkaWFcIl1bMF0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJwcmV2aWV3XCJdID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJ1wiICsgcG9zdFtcIm1pZGlhXCJdWzBdW1wiY2FtaW5ob1wiXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cG9zdFtcIm1pZGlhXCJdWzBdW1wiYXJxdWl2b3NcIl1bMF0gKyBcIicpO1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZVxuXG5cdFx0XHRcdFx0XHRcdFx0Ly8gdGV4dG9cblx0XHRcdFx0XHRcdFx0XHRpZiAocG9zdF90eXBlc193aXRoX3RleHRfcHJldmlldy5pbmRleE9mKHBvc3RbXCJ0aXBvXCJdKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aWxlX3R5cGUgPSBcInRpbGUtdGV4dFwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWEgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFwicHJldmlld1wiOiBwb3N0W1wibGVnZW5kYVwiXS5zdWJzdHJpbmcoMCwgMTIwKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCJjb3VudFwiOiBzaG93bl9tZWRpYV9jb3VudFxuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoKHNob3duX21lZGlhX2NvdW50ID09PSBtYXhfbWVkaWFfdG9fc2hvdykgJiYgKCh0b3RhbF9wb3N0cyAtIHNob3duX21lZGlhX2NvdW50KSA+IDApKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vZGlmaWVyXCJdID0gXCJtb3JlXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vcmVcIl0gPSBcIismdGhpbnNwO1wiICsgKHRvdGFsX3Bvc3RzIC0gc2hvd25fbWVkaWFfY291bnQgKyAxKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHR2YXIgJHRpbGUgPSBfX3JlbmRlcih0aWxlX3R5cGUsIG1lZGlhKS5hcHBlbmRUbygkZ3JpZCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBzZSBuw6NvIHRpdmVyIG5lbmh1bSBwb3N0LCByZW1vdmUgbyBncmlkXG5cdFx0XHRcdFx0XHQkZ3JpZC5yZW1vdmUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBhdHVhbGl6YSBvIGlzb3RvcGVcblx0XHRcdFx0XHQkc3RyZWFtLmFwcGVuZCgkY2FyZCkuaXNvdG9wZShcImFwcGVuZGVkXCIsICRjYXJkKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gU2UgYSBFZGnDp8OjbyBlc3RpdmVyIGVuY2VycmFkYSwgb3JkZW5hIHBvciBuw7ptZXJvIGRhIHRhcmVmYS5cblx0XHRcdFx0Ly8gU2UgbsOjbywgb3JkZW5hIHBvciBvcmRlbSBkZSBhdHVhbGl6YcOnw6NvXG5cdFx0XHRcdGFwcC5MaXN0YS5sYXlvdXQoKTtcblx0XHRcdFx0YXBwLkxpc3RhLnNvcnQoKExpc3RhLlJlZ3VsYW1lbnRvW1wiZW5jZXJyYWRhXCJdPyBcInRhcmVmYVwiOiBcImRhdGVcIikpO1xuXG5cdFx0XHRcdC8vIHNlIHRpdmVyIHRhcmVmYSBlc3BlY2lmaWNhZGEgbm8gbG9hZCBkYSBww6FnaW5hLCBjYXJyZWdhIGVsYVxuXHRcdFx0XHRpZiAocm91dGVyW1wicGF0aFwiXVsyXSkge1xuXHRcdFx0XHRcdGFwcC5UYXJlZmEub3Blbihyb3V0ZXJbXCJwYXRoXCJdWzJdKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGVzY29uZGUgYSB0ZWxhIGRlIGxvYWRpbmdcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQkc3RyZWFtLmxvYWRpbmdcblx0XHRcdFx0XHRcdC5yZW1vdmVDbGFzcyhcImZhZGUtaW5cIilcblx0XHRcdFx0XHRcdC5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkgeyAkc3RyZWFtLmxvYWRpbmcucmVtb3ZlQ2xhc3MoXCJpblwiKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSwgMTIwMCk7XG5cblx0XHRcdFx0Ly8gZ3VhcmRhIGEgZGF0YSBkYSDDumx0aW1hIGF0dWFsaXphw6fDo28gZSB6ZXJhIG8gY29udGFkb3IgZGUgbm92aWRhZGVzXG5cdFx0XHRcdGxhc3RfdXBkYXRlZCA9IG1vbWVudChkYXRhW1wiZWRpY2FvXCJdW1widWx0aW1hLWF0dWFsaXphY2FvXCJdKTtcblx0XHRcdFx0dXBkYXRlZFtcInRhcmVmYXNcIl0gPSAwOyB1cGRhdGVkW1wicG9zdHNcIl0gPSAwO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxpc3RhLmxheW91dCgpXG5cdFx0bGF5b3V0OiBmdW5jdGlvbigpIHtcblx0XHRcdCRhcHBbXCJsaXN0YVwiXS5pc290b3BlKFwicmVsb2FkSXRlbXNcIik7XG5cdFx0XHQkYXBwW1wibGlzdGFcIl0uaXNvdG9wZShcImxheW91dFwiKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEuc29ydCgpXG5cdFx0c29ydDogZnVuY3Rpb24oY3JpdGVyaWEpIHtcblx0XHRcdCRhcHBbXCJsaXN0YVwiXS5pc290b3BlKHtcblx0XHRcdFx0XCJzb3J0QnlcIjogY3JpdGVyaWFcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn0pKCk7XG5cbi8vIGpRdWVyeVxudmFyICRzdHJlYW07XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCRzdHJlYW0gPSAkKFwiLmpzLWFwcC1saXN0YVwiKTtcblx0Ly8gJHN0cmVhbS5sb2FkaW5nID0gJChcIm1haW4gLmxvYWRpbmdcIik7XG5cblx0JHN0cmVhbS5pc290b3BlKHtcblx0XHRcIml0ZW1TZWxlY3RvclwiOiBcIi5jYXJkLXRhcmVmYVwiLFxuXHRcdFwidHJhbnNpdGlvbkR1cmF0aW9uXCI6IFwiLjhzXCIsXG5cdFx0XCJnZXRTb3J0RGF0YVwiOiB7XG5cdFx0XHRcImRhdGVcIjogXCIubGFzdC1tb2RpZmllZFwiLFxuXHRcdFx0XCJ0YXJlZmFcIjogZnVuY3Rpb24oZWxlbWVudCkge1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VJbnQoJChlbGVtZW50KS5kYXRhKFwidGFyZWZhXCIpLCAxMCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRcInNvcnRBc2NlbmRpbmdcIjoge1xuXHRcdFx0XCJkYXRlXCI6IGZhbHNlLFxuXHRcdFx0XCJ0YXJlZmFcIjogdHJ1ZVxuXHRcdH0sXG5cdFx0XCJzb3J0QnlcIjogW1wiZGF0ZVwiLCBcInRhcmVmYVwiXSxcblx0XHRcIm1hc29ucnlcIjoge1xuXHRcdFx0XCJndXR0ZXJcIjogKHVpW1wiY29sdW1uc1wiXSA9PT0gMT8gOCA6IDE2KVxuXHRcdH1cblx0fSk7XG5cblx0Ly8gJHN0cmVhbS5vbihcImNsaWNrXCIsIFwiLmNhcmQtdGFyZWZhOm5vdCguZmFudGFzbWEpXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdC8vIFx0aWYgKGV2ZW50LndoaWNoID09PSAxKSB7XG5cdC8vIFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHQvL1xuXHQvLyBcdFx0dmFyIG51bWVybyA9ICQodGhpcykuZGF0YShcInRhcmVmYVwiKTtcblx0Ly8gXHRcdGFwcC5UYXJlZmEub3BlbihudW1lcm8sIHRydWUpO1xuXHQvLyBcdH1cblx0Ly8gfSk7XG5cblx0Ly8gYXBwLkxpc3RhLmxvYWQoKTtcblxuXHQvLyBvcmRlbmHDp8Ojb1xuXHQkdWlbXCJzaWRlbmF2XCJdLm9uKFwiY2xpY2tcIiwgXCIuanMtc3RyZWFtLXNvcnQgYVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgY3JpdGVyaWEgPSAkKHRoaXMpLmRhdGEoXCJzb3J0LWJ5XCIpO1xuXHRcdCQoXCIuanMtc3RyZWFtLXNvcnQgYVwiLCAkdWlbXCJzaWRlbmF2XCJdKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcblx0XHQkKHRoaXMpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuXG5cdFx0YXBwLkxpc3RhLnNvcnQoY3JpdGVyaWEpO1xuXHRcdFVJLnNpZGVuYXYuY2xvc2UoKTtcblx0fSk7XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHRhcmVmYSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5UYXJlZmEub3BlbigpXG4vLyBhcHAuVGFyZWZhLnJlbmRlcigpXG4vLyBhcHAuVGFyZWZhLmNsb3NlKClcblxuYXBwLlRhcmVmYSA9IChmdW5jdGlvbigpIHtcblx0dmFyIHBsYWNhcl9kYV90YXJlZmEgPSBbIF07XG5cblx0ZnVuY3Rpb24gcmVuZGVyUG9zdHMocG9zdHMsICRwb3N0cykge1xuXHRcdHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSA9IDA7XG5cdFx0Zm9yICh2YXIgdHVybWEgaW4gTGlzdGEuUmVndWxhbWVudG9bXCJ0dXJtYXNcIl0pIHtcblx0XHRcdHBsYWNhcl9kYV90YXJlZmFbTGlzdGEuUmVndWxhbWVudG9bXCJ0dXJtYXNcIl1bdHVybWFdXSA9IDA7XG5cdFx0fVxuXG5cdFx0JC5lYWNoKHBvc3RzLCBmdW5jdGlvbihpbmRleCwgcG9zdCkge1xuXHRcdFx0cG9zdFtcImRhdGEtZGUtcG9zdGFnZW0tZm9ybWF0YWRhXCJdID0gbW9tZW50KHBvc3RbXCJkYXRhLWRlLXBvc3RhZ2VtXCJdKS5jYWxlbmRhcigpO1xuXHRcdFx0cG9zdFtcInR1cm1hLWZvcm1hdGFkYVwiXSA9IHBvc3RbXCJ0dXJtYVwiXS50b1VwcGVyQ2FzZSgpO1xuXG5cdFx0XHQvLyBhdmFsaWHDp8Ojb1xuXHRcdFx0aWYgKHBvc3RbXCJhdmFsaWFjYW9cIl0pIHtcblx0XHRcdFx0aWYgKHBvc3RbXCJhdmFsaWFjYW9cIl1bXCJzdGF0dXNcIl0gPT09IDIwMCkge1xuXHRcdFx0XHRcdHBvc3RbXCJzdGF0dXMtY2xhc3NcIl0gPSBwb3N0W1widHVybWFcIl07XG5cdFx0XHRcdFx0cG9zdFtcInN0YXR1cy1pY29uXCJdID0gXCI8aSBjbGFzcz1cXFwibWF0ZXJpYWwtaWNvbnNcXFwiPiYjeEU4N0Q7PC9pPlwiOyAvLyBjb3Jhw6fDo29cblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzXCJdID0gcG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXSArIFwiIHBvbnRvXCIgKyAocG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXSA+IDE/IFwic1wiOiBcIlwiKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzLWNsYXNzXCJdID0gXCJyZWplY3RlZFwiO1xuXHRcdFx0XHRcdHBvc3RbXCJzdGF0dXMtaWNvblwiXSA9IFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj4mI3hFODg4OzwvaT5cIjtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzXCJdID0gXCJSZXByb3ZhZG9cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRwb3N0W1wibWVuc2FnZW1cIl0gPSBwb3N0W1wiYXZhbGlhY2FvXCJdW1wibWVuc2FnZW1cIl07XG5cblx0XHRcdFx0Ly8gc29tYSBwb250b3Mgbm8gcGxhY2FyXG5cdFx0XHRcdHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSArPSBwb3N0W1wiYXZhbGlhY2FvXCJdW1wicG9udG9zXCJdO1xuXHRcdFx0XHRwbGFjYXJfZGFfdGFyZWZhW3Bvc3RbXCJ0dXJtYVwiXV0gKz0gcG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBvc3RbXCJzdGF0dXMtaWNvblwiXSA9IFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj4mI3hFOEI1OzwvaT5cIjsgLy8gcmVsw7NnaW9cblx0XHRcdFx0cG9zdFtcInN0YXR1c1wiXSA9IFwiQWd1YXJkYW5kbyBhdmFsaWHDp8Ojb1wiO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBsZWdlbmRhXG5cdFx0XHRpZiAocG9zdFtcImxlZ2VuZGFcIl0gJiYgcG9zdFtcImxlZ2VuZGFcIl0uc3Vic3RyaW5nKDAsMykgIT0gXCI8cD5cIikge1xuXHRcdFx0XHRwb3N0W1wibGVnZW5kYVwiXSA9IFwiPHA+XCIgKyBwb3N0W1wibGVnZW5kYVwiXS5yZXBsYWNlKC8oPzpcXHJcXG5cXHJcXG58XFxyXFxyfFxcblxcbikvZywgXCI8L3A+PHA+XCIpICsgXCI8L3A+XCI7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHJlbmRlcml6YSBvIHBvc3Rcblx0XHRcdHZhciAkcG9zdF9jYXJkID0gX19yZW5kZXIoXCJ2aWV3LXRhcmVmYS1wb3N0LWNhcmRcIiwgcG9zdCk7XG5cdFx0XHR2YXIgJG1lZGlhID0gJChcIi5wb3N0LW1lZGlhID4gdWxcIiwgJHBvc3RfY2FyZCk7XG5cblx0XHRcdC8vIGFkaWNpb25hIG3DrWRpYXNcblx0XHRcdGlmIChwb3N0W1wibWlkaWFcIl0pIHtcblx0XHRcdFx0JC5lYWNoKHBvc3RbXCJtaWRpYVwiXSwgZnVuY3Rpb24oaW5kZXgsIG1lZGlhKSB7XG5cdFx0XHRcdFx0Ly8gaW1hZ2VtXG5cdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwiaW1hZ2VtXCIpIHtcblx0XHRcdFx0XHRcdG1lZGlhW1wiZGVmYXVsdFwiXSA9IG1lZGlhW1wiY2FtaW5ob1wiXSArIG1lZGlhW1wiYXJxdWl2b3NcIl1bMV07XG5cdFx0XHRcdFx0XHRtZWRpYVtcInBhZGRpbmctYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKG1lZGlhW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0XHRcdFx0bWVkaWFbXCJsaW5rLW9yaWdpbmFsXCJdID0gbWVkaWFbXCJjYW1pbmhvXCJdICsgbWVkaWFbXCJhcnF1aXZvc1wiXVsyXTtcblx0XHRcdFx0XHRcdHZhciAkaW1hZ2UgPSBfX3JlbmRlcihcIm1lZGlhLXBob3RvXCIsIG1lZGlhKTtcblx0XHRcdFx0XHRcdCRtZWRpYS5hcHBlbmQoJGltYWdlKTtcblx0XHRcdFx0XHR9IGVsc2VcblxuXHRcdFx0XHRcdC8vIGVtYmVkXG5cdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwieW91dHViZVwiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidmltZW9cIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbmVcIikge1xuXHRcdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwieW91dHViZVwiKSB7XG5cdFx0XHRcdFx0XHRcdG1lZGlhW1wiZW1iZWRcIl0gPSBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL1wiICsgbWVkaWFbXCJ5b3V0dWJlLWlkXCJdICsgXCI/cmVsPTAmYW1wO3Nob3dpbmZvPTBcIjtcblx0XHRcdFx0XHRcdH0gZWxzZVxuXG5cdFx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ2aW1lb1wiKSB7XG5cdFx0XHRcdFx0XHRcdG1lZGlhW1wiZW1iZWRcIl0gPSBcImh0dHBzOi8vcGxheWVyLnZpbWVvLmNvbS92aWRlby9cIiArIG1lZGlhW1widmltZW8taWRcIl0gKyBcIj90aXRsZT0wJmJ5bGluZT0wJnBvcnRyYWl0PTBcIjtcblx0XHRcdFx0XHRcdH0gZWxzZVxuXG5cdFx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ2aW5lXCIpIHtcblx0XHRcdFx0XHRcdFx0bWVkaWFbXCJlbWJlZFwiXSA9IFwiaHR0cHM6Ly92aW5lLmNvL3YvXCIgKyBtZWRpYVtcInZpbmUtaWRcIl0gKyBcIi9lbWJlZC9zaW1wbGVcIjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bWVkaWFbXCJwYWRkaW5nLWFzcGVjdG9cIl0gPSBcInBhZGRpbmctdG9wOiBcIiArIChtZWRpYVtcImFzcGVjdG9cIl0gKiAxMDApLnRvRml4ZWQoMikgKyBcIiVcIjtcblx0XHRcdFx0XHRcdHZhciAkZW1iZWQgPSBfX3JlbmRlcihcIm1lZGlhLXZpZGVvXCIsIG1lZGlhKTtcblx0XHRcdFx0XHRcdCRtZWRpYS5hcHBlbmQoJGVtYmVkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB0aXJhIGxlZ2VuZGEgc2UgbsOjbyB0aXZlclxuXHRcdFx0aWYgKCFwb3N0W1wibGVnZW5kYVwiXSkge1xuXHRcdFx0XHQkcG9zdF9jYXJkLmFkZENsYXNzKFwibm8tY2FwdGlvblwiKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFwb3N0W1wibWVkaWFcIl0pIHtcblx0XHRcdFx0JHBvc3RfY2FyZC5hZGRDbGFzcyhcIm5vLW1lZGlhXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB0aXJhIG1lbnNhZ2VtIGRlIGF2YWxpYcOnw6NvIHNlIG7Do28gdGl2ZXJcblx0XHRcdGlmICghcG9zdFtcImF2YWxpYWNhb1wiXSB8fCAhcG9zdFtcIm1lbnNhZ2VtXCJdKSB7XG5cdFx0XHRcdCQoXCIucmVzdWx0IC5tZXNzYWdlXCIsICRwb3N0X2NhcmQpLnJlbW92ZSgpO1xuXHRcdFx0fVxuXG5cblx0XHRcdC8vIGFkaWNpb25hIG8gcG9zdCDDoCB0YXJlZmFcblx0XHRcdC8vICRwb3N0cy5hcHBlbmQoJHBvc3RfY2FyZCkuaXNvdG9wZShcImFwcGVuZGVkXCIsICRwb3N0X2NhcmQpO1xuXHRcdFx0JHBvc3RzLmFwcGVuZCgkcG9zdF9jYXJkKTtcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiB7XG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5UYXJlZmEub3BlbigpXG5cdFx0b3BlbjogZnVuY3Rpb24obnVtZXJvLCAkY2FyZCwgcHVzaFN0YXRlKSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZygkY2FyZFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XG5cblx0XHRcdGxldCB0YXJlZmEgPSBjYWNoZVtcInRhcmVmYXNcIl1bbnVtZXJvXTtcblx0XHRcdHRhcmVmYV9hY3RpdmUgPSBudW1lcm87XG5cblx0XHRcdGlmIChVSS5kYXRhW1wiY29sdW1uc1wiXSA+PSAzKSB7XG5cdFx0XHRcdC8vIFVJLmJhY2tkcm9wLnNob3coJGFwcFtcInRhcmVmYVwiXSwgeyBcImhpZGVcIjogYXBwLlRhcmVmYS5jbG9zZSB9KTtcblx0XHRcdFx0Ly8gJHVpW1wiYmFja2Ryb3BcIl1bJGFwcFtcInRhcmVmYVwiXV0ub24oXCJoaWRlXCIsIGFwcC5UYXJlZmEuY2xvc2UpO1xuXHRcdFx0fVxuXG5cdFx0XHQkYXBwW1widGFyZWZhXCJdLmFkZENsYXNzKFwiaW5cIik7XG5cdFx0XHRhcHAuVGFyZWZhLnJlbmRlcih0YXJlZmEpO1xuXG5cdFx0XHQkYXBwW1widGFyZWZhXCJdLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGUteFwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly9cdHZhciB2aWV3X3RoZW1lX2NvbG9yID0gJChcIi5hcHBiYXJcIiwgJGFwcFtcInRhcmVmYVwiXSkuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiKTtcblx0XHRcdFx0JChcImhlYWQgbWV0YVtuYW1lPSd0aGVtZS1jb2xvciddXCIpLmF0dHIoXCJjb250ZW50XCIsIFwiIzU0NmU3YVwiKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwibm8tc2Nyb2xsIHRhcmVmYS1hY3RpdmVcIik7XG5cblx0XHRcdC8vIHJvdXRlclxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLnJlcGxhY2UoXCJ0YXJlZmFcIik7XG5cdFx0XHRpZiAocHVzaFN0YXRlKSB7IHJvdXRlci5nbyhcIi90YXJlZmFzL1wiICsgdGFyZWZhW1wibnVtZXJvXCJdLCB7IFwidmlld1wiOiBcInRhcmVmYVwiLCBcImlkXCI6IHRhcmVmYVtcIm51bWVyb1wiXSB9LCB0YXJlZmFbXCJ0aXR1bG9cIl0pOyB9XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlRhcmVmYS5yZW5kZXIoKSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdHJlbmRlcjogZnVuY3Rpb24odGFyZWZhKSB7XG5cdFx0XHR2YXIgJHRhcmVmYSA9IF9fcmVuZGVyKFwidmlldy10YXJlZmFcIiwgdGFyZWZhKTtcblxuXHRcdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdFx0Ly8gY2FyZCBkYSB0YXJlZmFcblx0XHRcdGlmICh0YXJlZmFbXCJpbWFnZW1cIl0pIHtcblx0XHRcdFx0dGFyZWZhW1wiaW1hZ2VtXCJdW1wiYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKHRhcmVmYVtcImltYWdlbVwiXVtcImFzcGVjdG9cIl0gKiAxMDApLnRvRml4ZWQoMikgKyBcIiVcIjtcblx0XHRcdH1cblxuXHRcdFx0dmFyICR0YXJlZmFfY2FyZCA9IF9fcmVuZGVyKFwiY2FyZC10YXJlZmFcIiwgdGFyZWZhKTtcblxuXHRcdFx0aWYgKCF0YXJlZmFbXCJpbWFnZW1cIl0pIHtcblx0XHRcdFx0JChcIi5tZWRpYVwiLCAkdGFyZWZhX2NhcmQpLnJlbW92ZSgpO1xuXHRcdFx0fVxuXHRcdFx0JChcIi5ncmlkXCIsICR0YXJlZmFfY2FyZCkucmVtb3ZlKCk7XG5cdFx0XHQkKFwiYVwiLCAkdGFyZWZhX2NhcmQpLnJlbW92ZUF0dHIoXCJocmVmXCIpO1xuXG5cdFx0XHQkKFwiLnRhcmVmYS1tZXRhIC50YXJlZmEtY2FyZFwiLCAkdGFyZWZhKS5hcHBlbmQoJHRhcmVmYV9jYXJkKTtcblxuXHRcdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdFx0Ly8gcG9zdHNcblx0XHRcdHZhciAkcG9zdHMgPSAkKFwiLnRhcmVmYS1wb3N0cyA+IHVsXCIsICR0YXJlZmEpO1xuXG5cdFx0XHRpZiAodGFyZWZhW1wicG9zdHNcIl0ubGVuZ3RoKSB7XG5cdFx0XHRcdHJlbmRlclBvc3RzKHRhcmVmYVtcInBvc3RzXCJdLCAkcG9zdHMpO1xuXG5cdFx0XHRcdCRwb3N0cy5pc290b3BlKHtcblx0XHRcdFx0XHRcIml0ZW1TZWxlY3RvclwiOiBcIi5wb3N0LWNhcmRcIixcblx0XHRcdFx0XHRcInRyYW5zaXRpb25EdXJhdGlvblwiOiAwLFxuXHRcdFx0XHRcdFwibWFzb25yeVwiOiB7XG5cdFx0XHRcdFx0XHRcImlzRml0V2lkdGhcIjogdHJ1ZSxcblx0XHRcdFx0XHRcdFwiZ3V0dGVyXCI6ICh1aVtcImNvbHVtbnNcIl0gPT09IDE/IDggOiAyNCksXG5cdFx0XHRcdFx0Ly9cdFwiY29sdW1uV2lkdGhcIjogKHVpW1wiY29sdW1uc1wiXSA8IDE/IDMwMCA6IDQ1MClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdC8vIH0pLm9uKFwibGF5b3V0Q29tcGxldGVcIiwgZnVuY3Rpb24oZXZlbnQsIHBvc3RzKSB7XG5cdFx0XHRcdC8vIFx0dmFyIHByZXZpb3VzX3Bvc2l0aW9uO1xuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdGZvciAodmFyIHBvc3QgaW4gcG9zdHMpIHtcblx0XHRcdFx0Ly8gXHRcdHZhciAkdGhpcyA9ICQocG9zdHNbcG9zdF0uZWxlbWVudCk7XG5cdFx0XHRcdC8vIFx0XHR2YXIgb2Zmc2V0ID0gcG9zdHNbcG9zdF0ucG9zaXRpb247XG5cdFx0XHRcdC8vIFx0XHR2YXIgc2lkZSA9IChvZmZzZXRbXCJ4XCJdID09PSAwPyBcImxlZnRcIiA6IFwicmlnaHRcIik7XG5cdFx0XHRcdC8vXG5cdFx0XHRcdC8vIFx0XHQkdGhpcy5hZGRDbGFzcyhcInRpbWVsaW5lLVwiICsgc2lkZSk7XG5cdFx0XHRcdC8vXG5cdFx0XHRcdC8vIFx0XHRpZiAob2Zmc2V0W1wieVwiXSAtIHByZXZpb3VzX3Bvc2l0aW9uIDwgMTApIHtcblx0XHRcdFx0Ly8gXHRcdFx0JHRoaXMuYWRkQ2xhc3MoXCJleHRyYS1vZmZzZXRcIik7XG5cdFx0XHRcdC8vIFx0XHR9XG5cdFx0XHRcdC8vXG5cdFx0XHRcdC8vIFx0XHRwcmV2aW91c19wb3NpdGlvbiA9IG9mZnNldFtcInlcIl07XG5cdFx0XHRcdC8vIFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JChcIjxsaSAvPlwiKS5hZGRDbGFzcyhcImVtcHR5XCIpLnRleHQoXCJOZW5odW0gcG9zdFwiKS5hcHBlbmRUbygkcG9zdHMpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0XHQvLyBsYXlvdXRcblx0XHRcdCRhcHBbXCJ0YXJlZmFcIl0uaHRtbCgkdGFyZWZhKTtcblxuXHRcdFx0aWYgKHRhcmVmYVtcInBvc3RzXCJdLmxlbmd0aCkge1xuXHRcdFx0XHQkcG9zdHMuaXNvdG9wZShcImxheW91dFwiKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcGxhY2FyIGRhIHRhcmVmYVxuXHRcdFx0dmFyICRwbGFjYXJfZGFfdGFyZWZhID0gJChcIi5wYWluZWwgLnBsYWNhciB1bFwiLCAkdGFyZWZhKTtcblxuXHRcdFx0JC5lYWNoKExpc3RhLlJlZ3VsYW1lbnRvW1widHVybWFzXCJdLCBmdW5jdGlvbihpbmRleCwgdHVybWEpIHtcblx0XHRcdFx0dmFyIHBvbnR1YWNhb19kYV90dXJtYSA9IFsgXTtcblxuXHRcdFx0XHQvLyBjYWxjdWxhICUgZGEgdHVybWEgZW0gcmVsYcOnw6NvIGFvIHRvdGFsIGRlIHBvbnRvc1xuXHRcdFx0XHR2YXIgcGVyY2VudHVhbF9kYV90dXJtYSA9IChwbGFjYXJfZGFfdGFyZWZhW1widG90YWxcIl0gPiAwPyBwbGFjYXJfZGFfdGFyZWZhW3R1cm1hXSAvIHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSA6IDApO1xuXHRcdFx0XHRwb250dWFjYW9fZGFfdHVybWFbXCJ0dXJtYVwiXSA9IHR1cm1hO1xuXHRcdFx0XHRwb250dWFjYW9fZGFfdHVybWFbXCJhbHR1cmEtZGEtYmFycmFcIl0gPSBcImhlaWdodDogXCIgKyAocGVyY2VudHVhbF9kYV90dXJtYSAqIDEwMCkudG9GaXhlZCgzKSArIFwiJVwiO1xuXHRcdFx0XHRwb250dWFjYW9fZGFfdHVybWFbXCJ0dXJtYS1mb3JtYXRhZGFcIl0gPSB0dXJtYS50b1VwcGVyQ2FzZSgpO1xuXHRcdFx0XHRwb250dWFjYW9fZGFfdHVybWFbXCJwb250b3NcIl0gPSAocGxhY2FyX2RhX3RhcmVmYVt0dXJtYV0gPiAwPyBwbGFjYXJfZGFfdGFyZWZhW3R1cm1hXSA6IDApO1xuXHRcdFx0XHRwb250dWFjYW9fZGFfdHVybWFbXCJwb250dWFjYW8tZm9ybWF0YWRhXCJdID0gcG9udHVhY2FvX2RhX3R1cm1hW1wicG9udG9zXCJdLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIuXCIpO1xuXG5cdFx0XHRcdHZhciAkdHVybWEgPSBfX3JlbmRlcihcInBsYWNhci10dXJtYVwiLCBwb250dWFjYW9fZGFfdHVybWEpO1xuXHRcdFx0XHQkcGxhY2FyX2RhX3RhcmVmYS5hcHBlbmQoJHR1cm1hKTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5UYXJlZmEuY2xvc2UoKVxuXHRcdGNsb3NlOiBmdW5jdGlvbihwdXNoU3RhdGUpIHtcblx0XHRcdHRhcmVmYV9hY3RpdmUgPSBudWxsO1xuXHRcdFx0JChcImhlYWQgbWV0YVtuYW1lPSd0aGVtZS1jb2xvciddXCIpLmF0dHIoXCJjb250ZW50XCIsIFVJLmRhdGFbXCJ0aGVtZS1jb2xvclwiXVtcIm9yaWdpbmFsXCJdKTtcblxuXHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcIm5vLXNjcm9sbCB0YXJlZmEtYWN0aXZlXCIpO1xuXHRcdFx0JGFwcFtcInRhcmVmYVwiXS5yZW1vdmVDbGFzcyhcInNsaWRlLXhcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGFwcFtcInRhcmVmYVwiXS5yZW1vdmVDbGFzcyhcImluXCIpLmVtcHR5KCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKFVJLmRhdGFbXCJjb2x1bW5zXCJdID49IDMpIHtcblx0XHRcdFx0Ly8gVUkuYmFja2Ryb3AuaGlkZSgkYXBwW1widGFyZWZhXCJdKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcm91dGVyXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0ucmVwbGFjZShcImhvbWVcIik7XG5cdFx0XHRpZiAocHVzaFN0YXRlKSB7IHJvdXRlci5nbyhcIi90YXJlZmFzXCIsIHsgXCJ2aWV3XCI6IFwiaG9tZVwiIH0sIFwiTGlzdGEgZGUgVGFyZWZhc1wiKTsgfVxuXHRcdH1cblx0fTtcbn0pKCk7XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCRhcHBbXCJ0YXJlZmFcIl0gPSAkKFwiLmpzLWFwcC10YXJlZmFcIik7XG5cdCRhcHBbXCJ0YXJlZmFcIl0ub24oXCJjbGlja1wiLCBcIi5qcy10YXJlZmEtY2xvc2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGFwcC5UYXJlZmEuY2xvc2UodHJ1ZSk7XG5cdH0pLm9uKFwiY2xpY2tcIiwgXCIuanMtbmV3LXBvc3QtdHJpZ2dlclwiLCBmdW5jdGlvbigpIHtcblx0XHRVSS5ib3R0b21zaGVldC5vcGVuKCQoXCIubmV3LXBvc3Qtc2hlZXRcIiwgJGFwcFtcInRhcmVmYVwiXSkuY2xvbmUoKS5zaG93KCkpO1xuXHR9KS5vbihcImNsaWNrXCIsIFwiLmNhcmQtdGFyZWZhIGFcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZiAoZXZlbnQud2hpY2ggPT09IDEpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHR9KTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbmV3IHBvc3QgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gKiBhcHAuUG9zdC5hdXRob3JpemUoKVxuLy8gKiBhcHAuUG9zdC5kZWF1dGhvcml6ZSgpXG4vLyAqIGFwcC5Qb3N0LmdldFRodW1ibmFpbCgpXG4vLyAqIGFwcC5Qb3N0Lm9wZW4oKVxuLy8gKiBhcHAuUG9zdC5jbG9zZSgpXG5cbi8vIHRpcG9zIGRlIHBvc3Q6IHBob3RvLCB2aWRlbywgdGV4dFxuXG5hcHAuUG9zdCA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQkYXBwW1wicG9zdFwiXSA9ICQoXCIuYXBwLXBvc3RcIik7XG5cdFx0JHVpW1wiYm90dG9tc2hlZXRcIl0ub24oXCJjbGlja1wiLCBcIi5uZXctcG9zdC1zaGVldCBhXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHR2YXIgdHlwZSA9ICQodGhpcykuZGF0YShcInBvc3QtdHlwZVwiKTtcblx0XHRcdFVJLmJvdHRvbXNoZWV0LmNsb3NlKCk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRhcHAuUG9zdC5vcGVuKHR5cGUsIHRhcmVmYV9hY3RpdmUpO1xuXHRcdFx0fSwgNjAwKTtcblx0XHR9KTtcblxuXHRcdCRhcHBbXCJwb3N0XCJdLm9uKFwic3VibWl0XCIsIFwiZm9ybVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9KS5vbihcImNsaWNrXCIsIFwiLnN1Ym1pdFwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0aWYgKG1vbWVudCgpLmlzQWZ0ZXIoTGlzdGEuUmVndWxhbWVudG9bXCJmaW1cIl0pKSB7XG5cdFx0XHRcdHRvYXN0Lm9wZW4oXCJQb3N0YWdlbnMgZW5jZXJyYWRhcyFcIik7XG5cdFx0XHR9XG5cblx0XHRcdGlmICgkKHRoaXMpLmhhc0NsYXNzKFwiZGlzYWJsZWRcIikpIHtcblx0XHRcdFx0Ly8gVE9ETyBtZWxob3JhciBtZW5zYWdlbVxuXHRcdFx0XHR0b2FzdC5vcGVuKFwiRXNwZXJlIG8gZmltIGRvIHVwbG9hZCZoZWxsaXA7XCIpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHZhciBkYXRhID0gJChcImZvcm1cIiwgJGFwcFtcInBvc3RcIl0pLnNlcmlhbGl6ZSgpO1xuXG5cdFx0XHQkKFwiLnN1Ym1pdFwiLCAkYXBwW1wicG9zdFwiXSkuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKS5odG1sKFwiRW52aWFuZG8maGVsbGlwO1wiKTtcblxuXHRcdFx0JC5wb3N0KFwiLy0vbGlzdGEvbm92b1wiLCBkYXRhKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChyZXNwb25zZVtcIm1ldGFcIl1bXCJzdGF0dXNcIl0gPT09IDIwMCkge1xuXHRcdFx0XHRcdGFwcC5Qb3N0LmNsb3NlKCk7XG5cdFx0XHRcdFx0YXBwLlRhcmVmYS5yZW5kZXIocmVzcG9uc2VbXCJkYXRhXCJdKTtcblx0XHRcdFx0XHRVSS50b2FzdC5vcGVuKHJlc3BvbnNlW1wibWV0YVwiXVtcIm1lc3NhZ2VcIl0pO1xuXHRcdFx0XHRcdG5hdmlnYXRvci52aWJyYXRlKDgwMCk7XG5cblx0XHRcdFx0XHR0YXJlZmFzW3Jlc3BvbnNlW1wiZGF0YVwiXVtcIm51bWVyb1wiXV0gPSByZXNwb25zZVtcImRhdGFcIl07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0VUkudG9hc3Qub3BlbigocmVzcG9uc2VbXCJtZXRhXCJdW1wibWVzc2FnZVwiXT8gcmVzcG9uc2VbXCJtZXRhXCJdW1wibWVzc2FnZVwiXSA6IFwiT2NvcnJldSB1bSBlcnJvLiBUZW50ZSBub3ZhbWVudGVcIikpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KS5mYWlsKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRVSS50b2FzdC5vcGVuKFwiT2NvcnJldSB1bSBlcnJvLiBUZW50ZSBub3ZhbWVudGVcIik7XG5cdFx0XHR9KTtcblxuXHRcdH0pLm9uKFwiY2xpY2tcIiwgXCIuYmFja1wiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGFwcC5Qb3N0LmNsb3NlKCk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Qb3N0LmF1dGhvcml6ZSgpXG5cdFx0YXV0aG9yaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIGhhYmlsaXRhIG8gYm90w6NvIGVudmlhclxuXHRcdFx0JChcIi5zdWJtaXRcIiwgJGFwcFtcInBvc3RcIl0pLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlBvc3QuZGVhdXRob3JpemUoKVxuXHRcdGRlYXV0aG9yaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIGRlc2FiaWxpdGEgbyBib3TDo28gXCJlbnZpYXJcIlxuXHRcdFx0JChcIi5zdWJtaXRcIiwgJGFwcFtcInBvc3RcIl0pLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlBvc3QuZ2V0VGh1bWJuYWlsKClcblx0XHRnZXRUaHVtYm5haWw6IGZ1bmN0aW9uKHVybCkge1xuXHRcdFx0Ly8gdGVzdGEgc2UgdXJscyBzw6NvIGRvcyBwcm92aWRlciBhY2VpdG9zIGUgcmVzcG9uZGUgY29tIGluZm9ybWHDp8O1ZXMgc29icmUgbyB2w61kZW8sXG5cdFx0XHQvLyBpbmNsdWluZG8gYSB1cmwgZGEgbWluaWF0dXJhXG5cdFx0XHQvLyBwcm92aWRlcnMgYWNlaXRvczogeW91dHViZSwgdmltZW8sIHZpbmVcblx0XHRcdHZhciBtZWRpYV9pbmZvID0geyB9O1xuXG5cdFx0XHRmdW5jdGlvbiBzaG93VGh1bWJuYWlsKG1lZGlhX2luZm8pIHtcblx0XHRcdFx0dmFyICR0aHVtYm5haWwgPSAkKFwiPGltZyAvPlwiKS5hdHRyKFwic3JjXCIsIG1lZGlhX2luZm9bXCJ0aHVtYm5haWxcIl0pO1xuXHRcdFx0XHQkKFwiLmpzLW1lZGlhLXByb3ZpZGVyXCIsICRhcHBbXCJwb3N0XCJdKS52YWwobWVkaWFfaW5mb1tcInByb3ZpZGVyXCJdKTtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS1pZFwiLCAkYXBwW1wicG9zdFwiXSkudmFsKG1lZGlhX2luZm9bXCJpZFwiXSk7XG5cdFx0XHRcdCQoXCIuanMtbWVkaWEtdGh1bWJuYWlsXCIsICRhcHBbXCJwb3N0XCJdKS52YWwobWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSk7XG5cdFx0XHRcdCQoXCIuanMtbWVkaWEtcHJldmlld1wiLCAkYXBwW1wicG9zdFwiXSkuaHRtbCgkdGh1bWJuYWlsKS5mYWRlSW4oKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8geW91dHViZVxuXHRcdFx0aWYgKHVybC5tYXRjaCgvKD86aHR0cHM/OlxcL3syfSk/KD86d3szfVxcLik/eW91dHUoPzpiZSk/XFwuKD86Y29tfGJlKSg/OlxcL3dhdGNoXFw/dj18XFwvKShbXlxccyZdKykvKSkge1xuXHRcdFx0XHQvLyBodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PTRjdDRlTk1ySmxnXG5cdFx0XHRcdHZhciB5b3V0dWJlX3VybCA9IHVybC5tYXRjaCgvKD86aHR0cHM/OlxcL3syfSk/KD86d3szfVxcLik/eW91dHUoPzpiZSk/XFwuKD86Y29tfGJlKSg/OlxcL3dhdGNoXFw/dj18XFwvKShbXlxccyZdKykvKTtcblx0XHRcdFx0bWVkaWFfaW5mb1tcInByb3ZpZGVyXCJdID0gXCJ5b3V0dWJlXCI7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJpZFwiXSA9IHlvdXR1YmVfdXJsWzFdO1xuXHRcdFx0Ly9cdG1lZGlhX2luZm9bXCJ0aHVtYm5haWxcIl0gPSBcImh0dHBzOi8vaTEueXRpbWcuY29tL3ZpL1wiICsgeW91dHViZV91cmxbMV0gKyBcIi9tYXhyZXNkZWZhdWx0LmpwZ1wiO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1widGh1bWJuYWlsXCJdID0gXCJodHRwczovL2kxLnl0aW1nLmNvbS92aS9cIiArIHlvdXR1YmVfdXJsWzFdICsgXCIvMC5qcGdcIjtcblxuXHRcdFx0XHRhcHAuUG9zdC5hdXRob3JpemUoKTtcblx0XHRcdFx0c2hvd1RodW1ibmFpbChtZWRpYV9pbmZvKTtcblx0XHRcdH0gZWxzZVxuXG5cdFx0XHQvLyB2aW1lb1xuXHRcdFx0aWYgKHVybC5tYXRjaCgvdmltZW9cXC5jb20vKSkge1xuXHRcdFx0XHQvLyBodHRwczovL3ZpbWVvLmNvbS82NDI3OTY0OVxuXHRcdFx0XHR2YXIgdmltZW9fdXJsID0gdXJsLm1hdGNoKC9cXC9cXC8od3d3XFwuKT92aW1lby5jb21cXC8oXFxkKykoJHxcXC8pLyk7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJwcm92aWRlclwiXSA9IFwidmltZW9cIjtcblx0XHRcdFx0bWVkaWFfaW5mb1tcImlkXCJdID0gdmltZW9fdXJsWzJdO1xuXG5cdFx0XHRcdCQuZ2V0SlNPTihcImh0dHBzOi8vdmltZW8uY29tL2FwaS92Mi92aWRlby9cIiArIHZpbWVvX3VybFsyXSArIFwiLmpzb24/Y2FsbGJhY2s9P1wiKVxuXHRcdFx0XHRcdC5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0XHRtZWRpYV9pbmZvW1widGh1bWJuYWlsXCJdID0gcmVzcG9uc2VbMF1bXCJ0aHVtYm5haWxfbGFyZ2VcIl07XG5cblx0XHRcdFx0XHRcdGFwcC5Qb3N0LmF1dGhvcml6ZSgpO1xuXHRcdFx0XHRcdFx0c2hvd1RodW1ibmFpbChtZWRpYV9pbmZvKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuUG9zdC5vcGVuKClcblx0XHRvcGVuOiBmdW5jdGlvbih0eXBlLCBudW1lcm8pIHtcblx0XHRcdHZhciBkYXRhID0ge1xuXHRcdFx0XHRcImVkaWNhb1wiOiBMaXN0YS5SZWd1bGFtZW50b1tcInRpdHVsb1wiXSxcblx0XHRcdFx0XCJudW1lcm9cIjogKG51bWVybyB8fCB0YXJlZmFfYWN0aXZlKSxcblx0XHRcdFx0XCJ1c2VyXCI6IExpc3RhLlVzdWFyaW9bXCJpZFwiXSxcblx0XHRcdFx0XCJ0dXJtYVwiOiBMaXN0YS5Vc3VhcmlvW1widHVybWFcIl0sXG5cdFx0XHRcdFwidG9rZW5cIjogTGlzdGEuVXN1YXJpb1tcInRva2VuXCJdXG5cdFx0XHR9O1xuXHRcdFx0dmFyICRuZXdfcG9zdF92aWV3ID0gX19yZW5kZXIoXCJuZXctcG9zdC1cIiArIHR5cGUsIGRhdGEpO1xuXG5cdFx0XHQvLyBlZmVpdG8gZGUgYWJlcnR1cmFcblx0XHRcdC8vIF92aWV3Lm9wZW4oJGFwcFtcInBvc3RcIl0sICRuZXdQb3N0Vmlldyk7XG5cdFx0XHQkYXBwW1wicG9zdFwiXS5odG1sKCRuZXdfcG9zdF92aWV3KS5hZGRDbGFzcyhcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGUteVwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgdmlld190aGVtZV9jb2xvciA9ICQoXCIuYXBwYmFyXCIsICRhcHBbXCJwb3N0XCJdKS5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIpO1xuXHRcdFx0XHQkKFwiaGVhZCBtZXRhW25hbWU9J3RoZW1lLWNvbG9yJ11cIikuYXR0cihcImNvbnRlbnRcIiwgdmlld190aGVtZV9jb2xvcik7XG5cdFx0XHR9KTtcblxuXHRcdFx0YXBwLlBvc3QuZGVhdXRob3JpemUoKTtcblxuXHRcdFx0Ly8gYcOnw7VlcyBwYXJhIGZhemVyIHF1YW5kbyBhYnJpciBhIHRlbGEgZGUgZW52aW9cblx0XHRcdC8vIGRlIGFjb3JkbyBjb20gbyB0aXBvIGRlIHBvc3RhZ2VtXG5cdFx0XHRpZiAodHlwZSA9PT0gXCJwaG90b1wiKSB7XG5cdFx0XHRcdCRhcHBbXCJwb3N0XCJdLmRyb3B6b25lKCk7XG5cdFx0XHRcdCQoXCIuZmlsZS1wbGFjZWhvbGRlclwiLCAkYXBwW1wicG9zdFwiXSkudHJpZ2dlcihcImNsaWNrXCIpO1xuXHRcdFx0Ly9cdCQoXCJmb3JtXCIsICRuZXdfcG9zdF92aWV3KS5kcm9wem9uZSgpO1xuXHRcdFx0fSBlbHNlXG5cblx0XHRcdGlmICh0eXBlID09PSBcInZpZGVvXCIgfHwgdHlwZSA9PT0gXCJ2aW5lXCIpIHtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS11cmwtaW5wdXRcIiwgJGFwcFtcInBvc3RcIl0pLmZvY3VzKCkub24oXCJrZXl1cFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Ly9cdGlmICgkLmluQXJyYXkoZXZlbnQua2V5Q29kZSwgWzE2LCAxNywgMThdKSkgeyByZXR1cm47IH1cblx0XHRcdFx0XHRhcHAuUG9zdC5nZXRUaHVtYm5haWwoJCh0aGlzKS52YWwoKSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlXG5cblx0XHRcdGlmICh0eXBlID09PSBcInRleHRcIikge1xuXHRcdFx0XHQkKFwiLmpzLWNhcHRpb24taW5wdXRcIiwgJGFwcFtcInBvc3RcIl0pLmZvY3VzKCkub24oXCJrZXl1cFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZiAoJCh0aGlzKS52YWwoKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRhcHAuUG9zdC5hdXRob3JpemUoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YXBwLlBvc3QuZGVhdXRob3JpemUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB2aWV3IG1hbmFnZXJcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZXBsYWNlKFwibmV3LXBvc3RcIik7XG5cdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IFwidmlld1wiOiBcIm5ldy1wb3N0XCIsIFwidHlwZVwiOiB0eXBlLCBcImlkXCI6IGRhdGFbXCJudW1lcm9cIl0gfSwgbnVsbCwgbnVsbCk7XG5cdFx0fSxcblxuXHRcdC8vIHNlbmQ6IGZ1bmN0aW9uKCkge1xuXHRcdC8vXG5cdFx0Ly8gfSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLlBvc3QuY2xvc2UoKVxuXHRcdGNsb3NlOiBmdW5jdGlvbigpIHtcblx0XHQvL1x0dGFyZWZhX2FjdGl2ZSA9IG51bGw7XG5cdFx0XHQkKFwiaGVhZCBtZXRhW25hbWU9J3RoZW1lLWNvbG9yJ11cIikuYXR0cihcImNvbnRlbnRcIiwgdGhlbWVfY29sb3JbXCJvcmlnaW5hbFwiXSk7XG5cblx0XHRcdCRhcHBbXCJwb3N0XCJdLnJlbW92ZUNsYXNzKFwic2xpZGUteVwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkYXBwW1wicG9zdFwiXS5yZW1vdmVDbGFzcyhcImluXCIpLmVtcHR5KCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLnJlcGxhY2UoXCJ0YXJlZmFcIik7XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGxvZ2luIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5Mb2dpbi5vcGVuKClcbi8vIGFwcC5Mb2dpbi5jbG9zZSgpXG4vLyBhcHAuTG9naW4uc3VibWl0KCkgWz9dXG4vLyBhcHAuTG9naW4ubG9nb3V0KClcblxuYXBwLkxvZ2luID0gKGZ1bmN0aW9uKCkge1xuXHRMaXN0YS5Vc3VhcmlvID0ge1xuXHRcdFwiaWRcIjogbnVsbCxcblx0XHRcIm5hbWVcIjogbnVsbCxcblx0XHRcImVtYWlsXCI6IG51bGwsXG5cdFx0XCJ0b2tlblwiOiBudWxsLFxuXHRcdFwidHVybWFcIjogbnVsbCxcblx0XHRcInNpZ25lZC1pblwiOiBmYWxzZVxuXHR9O1xuXG5cdC8vIFNlIHRpdmVyIGRhZG9zIGd1YXJkYWRvcyBubyBsb2NhbFN0b3JhZ2UsIHVzYSBlbGVzIHByYSBsb2dhclxuXHRpZiAobG9jYWxTdG9yYWdlICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiTGlzdGEuVXN1YXJpb1wiKSkge1xuXHRcdExpc3RhLlVzdWFyaW8gPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiTGlzdGEuVXN1YXJpb1wiKSk7XG5cblx0XHQkKGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKExpc3RhLlVzdWFyaW9bXCJpZFwiXSAhPT0gbnVsbCkge1xuXHRcdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwic2lnbmVkLWluIHVzZXItXCIgKyBMaXN0YS5Vc3VhcmlvW1widHVybWFcIl0pO1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFVJLnRvYXN0LnNob3coXCJPbMOhIFwiICsgTGlzdGEuVXN1YXJpb1tcIm5hbWVcIl0gKyBcIiFcIik7XG5cdFx0XHRcdH0sIDMwMDApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0JChmdW5jdGlvbigpIHtcblx0XHQkdWlbXCJsb2dpblwiXSA9ICQoXCIuYXBwLWxvZ2luXCIpO1xuXG5cdFx0Ly8gQm90w7VlcyBkZSBsb2dpbiBlIGxvZ291dFxuXHRcdCQoXCIuanMtbG9naW4tdHJpZ2dlclwiLCAkdWlbXCJzaWRlbmF2XCJdKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0VUkuc2lkZW5hdi5jbG9zZSgpO1xuXHRcdFx0YXBwLkxvZ2luLnNob3coKTtcblx0XHR9KTtcblxuXHRcdCQoXCIuanMtbG9nb3V0LXRyaWdnZXJcIiwgJHVpW1wic2lkZW5hdlwiXSkub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFVJLnNpZGVuYXYuY2xvc2UoKTtcblx0XHRcdGFwcC5Mb2dpbi5sb2dvdXQoKTtcblx0XHR9KTtcblxuXHRcdC8vIEHDp8OjbyBkZSBsb2dpblxuXHRcdCR1aVtcImxvZ2luXCJdLm9uKFwiY2xpY2tcIiwgXCIuYmFja1wiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGFwcC5Mb2dpbi5oaWRlKCk7XG5cdFx0fSkub24oXCJzdWJtaXRcIiwgXCJmb3JtXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRsZXQgbG9naW5fZGF0YSA9ICQoXCJmb3JtXCIsICR1aVtcImxvZ2luXCJdKS5zZXJpYWxpemUoKTtcblx0XHRcdGFwcC5Mb2dpbi5zdWJtaXQobG9naW5fZGF0YSk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTG9naW4uc2hvdygpXG5cdFx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBBYnJlIGEgdGVsYSBkZSBsb2dpbiBlIGNvbG9jYSBvIGZvY28gbm8gY2FtcG8gZS1tYWlsXG5cdFx0XHQkdWlbXCJsb2dpblwiXS5hZGRDbGFzcyhcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0VUkuYm9keS5sb2NrKCk7XG5cdFx0XHRcdCQoXCJpbnB1dFtuYW1lPSdlbWFpbCddXCIsICR1aVtcImxvZ2luXCJdKS5mb2N1cygpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxvZ2luLmhpZGUoKVxuXHRcdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wibG9naW5cIl0ucmVtb3ZlQ2xhc3MoXCJzbGlkZVwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkdWlbXCJsb2dpblwiXS5yZW1vdmVDbGFzcyhcImluXCIpO1xuXHRcdFx0XHRVSS5ib2R5LnVubG9jaygpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxvZ2luLnN1Ym1pdCgpXG5cdFx0c3VibWl0OiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRMaXN0YUFQSShcIi9hdXRoXCIsIGRhdGEpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKHJlc3BvbnNlW1wibWV0YVwiXVtcInN0YXR1c1wiXSA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0TGlzdGEuVXN1YXJpbyA9IHJlc3BvbnNlW1widXNlclwiXTtcblx0XHRcdFx0XHRMaXN0YS5Vc3VhcmlvW1wic2lnbmVkLWluXCJdID0gdHJ1ZTtcblx0XHRcdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIkxpc3RhLlVzdWFyaW9cIiwgSlNPTi5zdHJpbmdpZnkoTGlzdGEuVXN1YXJpbykpO1xuXG5cdFx0XHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInNpZ25lZC1pbiB1c2VyLVwiICsgTGlzdGEuVXN1YXJpb1tcInR1cm1hXCJdKTtcblx0XHRcdFx0XHRhcHAuTG9naW4uaGlkZSgpO1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRVSS50b2FzdC5zaG93KFwiT2zDoSBcIiArIExpc3RhLlVzdWFyaW9bXCJuYW1lXCJdICsgXCIhXCIpO1xuXHRcdFx0XHRcdH0sIDUwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JChcIi5mb3JtLWdyb3VwXCIsICR1aVtcImxvZ2luXCJdKS5hZGRDbGFzcyhcImFuaW1hdGVkIHNoYWtlXCIpO1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7ICQoXCIuZm9ybS1ncm91cFwiLCAkdWlbXCJsb2dpblwiXSkucmVtb3ZlQ2xhc3MoXCJhbmltYXRlZCBzaGFrZVwiKTsgfSwgMTAwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Mb2dpbi5sb2dvdXQoKVxuXHRcdGxvZ291dDogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBUaXJhIGFzIGNsYXNzZXMgaW5kaWNhZG9yYXMgZGUgbG9naW4gZG8gYm9keVxuXHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInNpZ25lZC1pbiB1c2VyLVwiICsgTGlzdGEuVXN1YXJpb1tcInR1cm1hXCJdKTtcblxuXHRcdFx0Ly8gTGltcGEgTGlzdGEuVXN1YXJpbyB0YW50byBuYSBww6FnaW5hIHF1YW50byBubyBsb2NhbFN0b3JhZ2Vcblx0XHRcdExpc3RhLlVzdWFyaW8gPSB7XG5cdFx0XHRcdFwiaWRcIjogbnVsbCxcblx0XHRcdFx0XCJuYW1lXCI6IG51bGwsXG5cdFx0XHRcdFwiZW1haWxcIjogbnVsbCxcblx0XHRcdFx0XCJ0b2tlblwiOiBudWxsLFxuXHRcdFx0XHRcInR1cm1hXCI6IG51bGwsXG5cdFx0XHRcdFwic2lnbmVkLWluXCI6IGZhbHNlXG5cdFx0XHR9O1xuXG5cdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIkxpc3RhLlVzdWFyaW9cIiwgSlNPTi5zdHJpbmdpZnkoTGlzdGEuVXN1YXJpbykpO1xuXG5cdFx0XHQvLyBEZXBvaXMgZGUgMCw1IHNlZ3VuZG8sIG1vc3RyYSB0b2FzdCBjb25maXJtYW5kbyBsb2dvdXRcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFVJLnRvYXN0LnNob3coXCJTZXNzw6NvIGVuY2VycmFkYSFcIik7XG5cdFx0XHR9LCA1MDApO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBpbWFnZSB1cGxvYWQgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG52YXIgZXhpZl9vcmllbnRhdGlvbl90b19kZWdyZWVzID0geyAwOiAwLCAxOiAwLCAyOiAwLCAzOiAxODAsIDQ6IDAsIDU6IDAsIDY6IDkwLCA3OiAwLCA4OiAyNzAgfTtcbnZhciBmaWxlX3N0YWNrID0ge307XG5cbmZ1bmN0aW9uIHVwbG9hZChmaWxlcykge1xuXHRGaWxlQVBJLmZpbHRlckZpbGVzKGZpbGVzLCBmdW5jdGlvbihmaWxlLCBpbmZvKSB7XG5cdFx0aWYoL15pbWFnZS8udGVzdChmaWxlLnR5cGUpKSB7XG5cdFx0XHRmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXSA9IGluZm87XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHQvL1x0cmV0dXJuIGluZm8ud2lkdGggPj0gMzIwICYmIGluZm8uaGVpZ2h0ID49IDI0MDtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LCBmdW5jdGlvbihmaWxlcywgcmVqZWN0ZWQpIHtcblx0XHRpZihmaWxlcy5sZW5ndGgpIHtcblx0XHRcdCQoXCIuc3VibWl0XCIsICRwb3N0KS5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xuXG5cdFx0XHQvLyBwcmV2aWV3XG5cdFx0XHRGaWxlQVBJLmVhY2goZmlsZXMsIGZ1bmN0aW9uKGZpbGUpIHtcblx0XHRcdFx0dmFyIGV4aWZfb3JpZW50YXRpb24gPSBmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcImV4aWZcIl1bXCJPcmllbnRhdGlvblwiXTtcblx0XHRcdFx0ZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0gPSB0YXJlZmFfYWN0aXZlICsgXCItXCIgKyB1c2VyW1wiaWRcIl0gKyBcIi1cIiArXG5cdFx0XHRcdFx0bW9tZW50KCkuZm9ybWF0KFwiWFwiKSArIFwiLVwiICsgcmFuZCgwLCA5OTkpLnRvRml4ZWQoMCk7XG5cblx0XHRcdFx0aWYoZmlsZVtcInR5cGVcIl0gPT0gXCJpbWFnZS9naWZcIikge1xuXHRcdFx0XHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdFx0XHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0dmFyIGltZyA9ICQoXCI8aW1nIC8+XCIpLmF0dHIoXCJzcmNcIiwgZXZlbnQudGFyZ2V0LnJlc3VsdCk7XG5cdFx0XHRcdFx0XHR2YXIgJHRyYWNrZXIgPSAkKFwiPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiaW1hZ2Utb3JkZXJbXVxcXCIgLz5cIikudmFsKGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdKTtcblxuXHRcdFx0XHRcdFx0dmFyICRzdGF0dXMgPSAkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcInByb2dyZXNzXCIpO1xuXHRcdFx0XHRcdFx0JChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJzdGF0dXNcIikuaHRtbChcIjxzdHJvbmc+RW52aWFuZG8maGVsbGlwOzwvc3Ryb25nPlwiKS5hcHBlbmRUbygkc3RhdHVzKTtcblx0XHRcdFx0XHRcdCQoXCI8ZGl2IC8+XCIpLmFkZENsYXNzKFwiYmFyXCIpLmFwcGVuZFRvKCRzdGF0dXMpO1xuXG5cdFx0XHRcdFx0XHR2YXIgJHByZXZpZXcgPSAkKFwiPGxpIC8+XCIpLmF0dHIoXCJpZFwiLCBcImZpbGUtXCIgK1xuXHRcdFx0XHRcdFx0XHRcdGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdKS5hcHBlbmQoJHRyYWNrZXIpLmFwcGVuZCgkc3RhdHVzKS5hcHBlbmQoaW1nKTtcblx0XHRcdFx0XHRcdCQoXCIjZHJvcHpvbmUgI2JvYXJkXCIpLmFwcGVuZCgkcHJldmlldyk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRGaWxlQVBJXG5cdFx0XHRcdFx0XHQuSW1hZ2UoZmlsZSlcblx0XHRcdFx0XHRcdC5yb3RhdGUoZXhpZl9vcmllbnRhdGlvbl90b19kZWdyZWVzW2V4aWZfb3JpZW50YXRpb25dKVxuXHRcdFx0XHRcdFx0LnJlc2l6ZSg2MDAsIDMwMCwgXCJwcmV2aWV3XCIpXG5cdFx0XHRcdFx0XHQuZ2V0KGZ1bmN0aW9uKGVyciwgaW1nKSB7XG5cdFx0XHRcdFx0XHQvL1x0JHRyYWNrZXIgPSAkKFwiPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgbmFtZT1cXFwiaW1hZ2Utb3JkZXJbXVxcXCIgLz5cIilcblx0XHRcdFx0XHRcdC8vXHRcdC52YWwodGFyZWZhX2FjdGl2ZSArIFwiLVwiICsgdXNlcltcImlkXCJdICsgXCItXCIgKyBmaWxlW1wibmFtZVwiXSk7XG5cdFx0XHRcdFx0XHRcdHZhciAkdHJhY2tlciA9ICQoXCI8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJpbWFnZS1vcmRlcltdXFxcIiAvPlwiKS52YWwoZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0pO1xuXG5cdFx0XHRcdFx0XHRcdHZhciAkc3RhdHVzID0gJChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJwcm9ncmVzc1wiKTtcblx0XHRcdFx0XHRcdFx0JChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJzdGF0dXNcIikuaHRtbChcIjxzdHJvbmc+RW52aWFuZG8maGVsbGlwOzwvc3Ryb25nPlwiKS5hcHBlbmRUbygkc3RhdHVzKTtcblx0XHRcdFx0XHRcdFx0JChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJiYXJcIikuYXBwZW5kVG8oJHN0YXR1cyk7XG5cblx0XHRcdFx0XHRcdFx0dmFyICRwcmV2aWV3ID0gJChcIjxsaSAvPlwiKS5hdHRyKFwiaWRcIiwgXCJmaWxlLVwiICtcblx0XHRcdFx0XHRcdFx0XHRcdGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdKS5hcHBlbmQoJHRyYWNrZXIpLmFwcGVuZCgkc3RhdHVzKS5hcHBlbmQoaW1nKTtcblx0XHRcdFx0XHRcdFx0JChcIiNkcm9wem9uZSAjYm9hcmRcIikuYXBwZW5kKCRwcmV2aWV3KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gdXBsb2FkXG5cdFx0XHRpZihmaWxlc1swXVtcInR5cGVcIl0gPT0gXCJpbWFnZS9naWZcIikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcImdpZlwiKTtcblx0XHRcdFx0RmlsZUFQSS51cGxvYWQoe1xuXHRcdFx0XHRcdHVybDogXCIvLS9saXN0YS9ub3ZvXCIsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0YWN0aW9uOiBcInVwbG9hZFwiLFxuXHRcdFx0XHRcdFx0ZWRpdGlvbjogTGlzdGEuUmVndWxhbWVudG9bXCJ0aXR1bG9cIl0sXG5cdFx0XHRcdFx0XHR0YXJlZmE6IHRhcmVmYV9hY3RpdmUsXG5cdFx0XHRcdFx0XHR0dXJtYTogdXNlcltcInR1cm1hXCJdLFxuXHRcdFx0XHRcdFx0dXNlcjogdXNlcltcImlkXCJdXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRwcmVwYXJlOiBmdW5jdGlvbihmaWxlLCBvcHRpb25zKSB7XG5cdFx0XHRcdFx0XHRvcHRpb25zLmRhdGEucmVmID0gZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl07XG5cdFx0XHRcdFx0XHRmaWxlLnJlZiA9IGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdO1xuXHRcdFx0XHRcdH0sXG5cblx0XHRcdFx0XHRmaWxlczogZmlsZXMsXG5cdFx0XHRcdFx0ZmlsZXByb2dyZXNzOiBmdW5jdGlvbihldmVudCwgZmlsZSwgeGhyKSB7XG5cdFx0XHRcdFx0XHR2YXIgcGVyY2VudCA9ICgoZXZlbnRbXCJsb2FkZWRcIl0gLyBldmVudFtcInRvdGFsXCJdKSAqIDEwMCkudG9GaXhlZCgwKSxcblx0XHRcdFx0XHRcdFx0c3RhdHVzID0gKHBlcmNlbnQgPCAxMDA/IFwiPHN0cm9uZz5FbnZpYW5kbyZoZWxsaXA7PC9zdHJvbmc+IFwiICtcblx0XHRcdFx0XHRcdFx0XHRcdHBlcmNlbnQgKyBcIiVcIiA6IFwiPHN0cm9uZz5Qcm9jZXNzYW5kbyZoZWxsaXA7PC9zdHJvbmc+XCIpO1xuXG5cdFx0XHRcdFx0XHQkKFwiI2ZpbGUtXCIgKyBmaWxlW1wicmVmXCJdICsgXCIgLnN0YXR1c1wiLCBcIiNkcm9wem9uZVwiKS5odG1sKHN0YXR1cyk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRwcm9ncmVzczogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0XHQvL1x0dmFyIHBlcmNlbnQgPSAoKGV2ZW50W1wibG9hZGVkXCJdIC8gZXZlbnRbXCJ0b3RhbFwiXSkgKiAxMDApLnRvRml4ZWQoMCkgKyBcIiVcIlxuXHRcdFx0XHRcdC8vXHRjb25zb2xlLmxvZyhwZXJjZW50KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGZpbGVjb21wbGV0ZTogZnVuY3Rpb24oZmlsZSwgeGhyLCBvcHRpb25zKSB7XG5cdFx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKGZpbGUsIHhociwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0XHQkKFwiI2ZpbGUtXCIgKyBvcHRpb25zW1wicmVmXCJdICsgXCIgLnN0YXR1c1wiLCBcIiNkcm9wem9uZVwiKS5odG1sKFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj5jaGVjazwvaT5cIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRjb21wbGV0ZTogZnVuY3Rpb24oZXJyLCB4aHIpIHtcblx0XHRcdFx0XHRcdCQoXCIuc3VibWl0XCIsICRwb3N0KS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRGaWxlQVBJLnVwbG9hZCh7XG5cdFx0XHRcdFx0dXJsOiBcIi8tL2xpc3RhL25vdm9cIixcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb246IFwidXBsb2FkXCIsXG5cdFx0XHRcdFx0XHRlZGl0aW9uOiBMaXN0YS5SZWd1bGFtZW50b1tcInRpdHVsb1wiXSxcblx0XHRcdFx0XHRcdHRhcmVmYTogdGFyZWZhX2FjdGl2ZSxcblx0XHRcdFx0XHRcdHR1cm1hOiB1c2VyW1widHVybWFcIl0sXG5cdFx0XHRcdFx0XHR1c2VyOiB1c2VyW1wiaWRcIl1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByZXBhcmU6IGZ1bmN0aW9uKGZpbGUsIG9wdGlvbnMpIHtcblx0XHRcdFx0XHRcdG9wdGlvbnMuZGF0YS5yZWYgPSBmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXTtcblx0XHRcdFx0XHRcdGZpbGUucmVmID0gZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl07XG5cdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdGltYWdlQXV0b09yaWVudGF0aW9uOiB0cnVlLFxuXHRcdFx0XHRcdGltYWdlVHJhbnNmb3JtOiB7XG5cdFx0XHRcdFx0XHRtYXhXaWR0aDogMTkyMCxcblx0XHRcdFx0XHRcdG1heEhlaWdodDogMTkyMFxuXHRcdFx0XHRcdH0sXG5cblx0XHRcdFx0XHRmaWxlczogZmlsZXMsXG5cdFx0XHRcdFx0ZmlsZXByb2dyZXNzOiBmdW5jdGlvbihldmVudCwgZmlsZSwgeGhyKSB7XG5cdFx0XHRcdFx0XHR2YXIgcGVyY2VudCA9ICgoZXZlbnRbXCJsb2FkZWRcIl0gLyBldmVudFtcInRvdGFsXCJdKSAqIDEwMCkudG9GaXhlZCgwKSxcblx0XHRcdFx0XHRcdFx0c3RhdHVzID0gKHBlcmNlbnQgPCAxMDA/IFwiPHN0cm9uZz5FbnZpYW5kbyZoZWxsaXA7PC9zdHJvbmc+IFwiICtcblx0XHRcdFx0XHRcdFx0XHRcdHBlcmNlbnQgKyBcIiVcIiA6IFwiPHN0cm9uZz5Qcm9jZXNzYW5kbyZoZWxsaXA7PC9zdHJvbmc+XCIpO1xuXG5cdFx0XHRcdFx0XHQkKFwiI2ZpbGUtXCIgKyBmaWxlW1wicmVmXCJdICsgXCIgLnN0YXR1c1wiLCBcIiNkcm9wem9uZVwiKS5odG1sKHN0YXR1cyk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRwcm9ncmVzczogZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0XHQvL1x0dmFyIHBlcmNlbnQgPSAoKGV2ZW50W1wibG9hZGVkXCJdIC8gZXZlbnRbXCJ0b3RhbFwiXSkgKiAxMDApLnRvRml4ZWQoMCkgKyBcIiVcIlxuXHRcdFx0XHRcdC8vXHRjb25zb2xlLmxvZyhwZXJjZW50KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGZpbGVjb21wbGV0ZTogZnVuY3Rpb24oZmlsZSwgeGhyLCBvcHRpb25zKSB7XG5cdFx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKGZpbGUsIHhociwgb3B0aW9ucyk7XG5cdFx0XHRcdFx0XHQkKFwiI2ZpbGUtXCIgKyBvcHRpb25zW1wicmVmXCJdICsgXCIgLnN0YXR1c1wiLCBcIiNkcm9wem9uZVwiKS5odG1sKFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj5jaGVjazwvaT5cIik7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRjb21wbGV0ZTogZnVuY3Rpb24oZXJyLCB4aHIpIHtcblx0XHRcdFx0XHRcdCQoXCIuc3VibWl0XCIsICRwb3N0KS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn1cblxuJC5mbi5kcm9wem9uZSA9IGZ1bmN0aW9uKCkge1xuXHQvLyBkcm9wem9uZVxuXHR2YXIgJGRyb3B6b25lID0gJChcIiNkcm9wem9uZVwiLCB0aGlzKTtcblx0RmlsZUFQSS5ldmVudC5kbmQoJGRyb3B6b25lWzBdLCBmdW5jdGlvbihvdmVyKSB7XG5cdFx0aWYob3Zlcikge1xuXHRcdFx0JGRyb3B6b25lLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkZHJvcHpvbmUucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG5cdFx0fVxuXHR9LCBmdW5jdGlvbihmaWxlcykge1xuXHRcdHVwbG9hZChmaWxlcyk7XG5cdH0pO1xuXG5cdC8vIG1hbnVhbCBzZWxlY3Rcblx0dmFyICRmaWxlX2lucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtLWZpbGVcIik7XG5cdEZpbGVBUEkuZXZlbnQub24oJGZpbGVfaW5wdXQsIFwiY2hhbmdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIGZpbGVzID0gRmlsZUFQSS5nZXRGaWxlcyhldmVudCk7XG5cdFx0dXBsb2FkKGZpbGVzKTtcblx0fSk7XG5cblx0Ly8gcmVvcmRlclxuXHR2YXIgJGJvYXJkID0gJChcIiNib2FyZFwiLCB0aGlzKTtcblx0JGJvYXJkLm9uKFwic2xpcDpiZWZvcmV3YWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYodWlbXCJpbnRlcmFjdGlvbi10eXBlXCJdID09PSBcInBvaW50ZXJcIikge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cdH0pLm9uKFwic2xpcDphZnRlcnN3aXBlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQudGFyZ2V0LnJlbW92ZSgpO1xuXHR9KS5vbihcInNsaXA6cmVvcmRlclwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50ID0gZXZlbnQub3JpZ2luYWxFdmVudDtcblx0XHRldmVudC50YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZXZlbnQudGFyZ2V0LCBldmVudC5kZXRhaWwuaW5zZXJ0QmVmb3JlKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xuXG5cdG5ldyBTbGlwKCRib2FyZFswXSk7XG59O1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gd29ya2VycyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBzdGFydFxud29ya2VyLlN0YXJ0ID0gKGZ1bmN0aW9uKCkge1xuXHR0aW1lb3V0W1wiZGVsYXktc3RhcnRcIl0gPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdGxvZyhcIndvcmtlci5TdGFydFwiLCBcImluZm9cIik7XG5cblx0XHRjdWVbXCJsb2FkLWVkaWNhb1wiXSA9ICQuRGVmZXJyZWQoKTtcblx0XHR3b3JrZXIuTG9hZCgpO1xuXG5cdFx0Y3VlW1wibG9hZC1lZGljYW9cIl0uZG9uZShmdW5jdGlvbigpIHtcblx0XHRcdHRpbWVvdXRbXCJkZWxheS1ldm9sdWNhb1wiXSA9IHNldFRpbWVvdXQoYXBwLkV2b2x1Y2FvLnN0YXJ0LCAyMDApO1xuXHRcdH0pO1xuXG5cdH0sIDMwMCk7XG59KSgpO1xuXG5cbi8vIGxvYWRcbndvcmtlci5Mb2FkID0gKGZ1bmN0aW9uKCkge1xuXHR0aW1lb3V0W1wiZGVsYXktbG9hZFwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0bG9nKFwid29ya2VyLkxvYWRcIiwgXCJpbmZvXCIpO1xuXG5cdFx0TGlzdGFBUEkoXCIvdHVkb1wiKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRsb2coXCJjdWVbXFxcImxvYWQtZWRpY2FvXFxcIl0gdHJpZ2dlcmVkXCIpO1xuXHRcdFx0TGlzdGEuRWRpY2FvID0gcmVzcG9uc2VbXCJlZGljYW9cIl07XG5cdFx0XHRMaXN0YS5QbGFjYXIgPSByZXNwb25zZVtcInBsYWNhclwiXTtcblx0XHRcdExpc3RhLlRhcmVmYXMgPSByZXNwb25zZVtcInRhcmVmYXNcIl07XG5cdFx0XHRjdWVbXCJsb2FkLWVkaWNhb1wiXS5yZXNvbHZlKCk7XG5cblx0XHRcdHRpbWVvdXRbXCJkZWxheS1saXN0YVwiXSA9IHNldFRpbWVvdXQoYXBwLkxpc3RhLnN0YXJ0LCAxKTtcblx0XHRcdC8vIHRpbWVvdXRbXCJkZWxheS1wbGFjYXJcIl0gPSBzZXRUaW1lb3V0KGFwcC5QbGFjYXIuc3RhcnQsIDQwMCk7XG5cblx0XHRcdC8vIHZhciBkYXRhID0gcmVzcG9uc2VbXCJkYXRhXCJdO1xuXHRcdFx0Ly8gTGlzdGEuSWRlbnRpZmljYWNhbyA9IGRhdGE7XG5cblx0XHR9KTtcblxuXHRcdHdvcmtlci5VcGRhdGUoKTtcblx0fSwgMzAwKTtcbn0pO1xuXG5cbi8vIHVwZGF0ZVxud29ya2VyLlVwZGF0ZSA9IChmdW5jdGlvbigpIHtcblx0bGV0IHVwZGF0ZXMgPSB7XG5cdFx0XCJ0YXJlZmFzXCI6IDAsXG5cdFx0XCJwb3N0c1wiOiAwLFxuXHRcdFwidG90YWxcIjogMCxcblx0XHRcImxhc3QtdXBkYXRlZFwiOiBudWxsXG5cdH07XG5cblx0dGltZW91dFtcImF0aXZpZGFkZVwiXSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdGxvZyhcIndvcmtlci5VcGRhdGVcIiwgXCJpbmZvXCIpO1xuXG5cdFx0TGlzdGFBUEkoXCIvYXRpdmlkYWRlXCIpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdC8vIGNvbmZlcmUgZGF0YSBkZSBjYWRhIGF0aXZpZGFkZSBlIHbDqiBzZSDDqSBwb3N0ZXJpb3Igw6Agw7psdGltYSBhdHVhbGl6YcOnw6NvLlxuXHRcdFx0Ly8gc2UgZm9yLCBhZGljaW9uYSDDoCBjb250YWdlbSBkZSBub3ZhIGF0aXZpZGFkZVxuXHRcdFx0Zm9yIChsZXQgYXRpdmlkYWRlIG9mIHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChtb21lbnQoYXRpdmlkYWRlW1widHNcIl0pLmlzQWZ0ZXIodXBkYXRlc1tcImxhc3QtdXBkYXRlZFwiXSkgJiYgYXRpdmlkYWRlW1wiYXV0b3JcIl0gIT0gdXNlcltcImlkXCJdKSB7XG5cdFx0XHRcdFx0dXBkYXRlc1tcInRvdGFsXCJdKys7XG5cdFx0XHRcdFx0aWYgKHZhbHVlW1wiYWNhb1wiXSA9PT0gXCJub3ZvLXRhcmVmYVwiKSB7XG5cdFx0XHRcdFx0XHR1cGRhdGVzW1widGFyZWZhc1wiXSsrO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodmFsdWVbXCJhY2FvXCJdID09PSBcIm5vdm8tcG9zdFwiKSB7XG5cdFx0XHRcdFx0XHR1cGRhdGVzW1wicG9zdHNcIl0rKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gc2UgaG91dmVyIG5vdmEgYXRpdmlkYWRlXG5cdFx0XHRpZiAodXBkYXRlc1tcInRvdGFsXCJdID4gMCkge1xuXHRcdFx0XHQvLyBtb250YSBvIHRleHRvIGRvIHRvYXN0XG5cdFx0XHRcdGxldCB0ZXh0byA9IHtcblx0XHRcdFx0XHRcInRhcmVmYXNcIjogdXBkYXRlc1tcInRhcmVmYXNcIl0gKyBcIiBcIiArICh1cGRhdGVzW1widGFyZWZhc1wiXSA+IDE/IFwibm92YXMgdGFyZWZhc1wiIDogXCJub3ZhIHRhcmVmYVwiKSxcblx0XHRcdFx0XHRcInBvc3RzXCI6IHVwZGF0ZXNbXCJwb3N0c1wiXSArIFwiIFwiICsgKHVwZGF0ZXNbXCJwb3N0c1wiXSA+IDE/IFwibm92b3MgcG9zdHNcIiA6IFwibm92byBwb3N0XCIpLFxuXHRcdFx0XHRcdFwiZmluYWxcIjogXCJcIlxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmICh1cGRhdGVzW1widGFyZWZhc1wiXSA+IDApIHtcblx0XHRcdFx0XHR0ZXh0b1tcImZpbmFsXCJdICs9IHRleHRvW1widGFyZWZhc1wiXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoKHVwZGF0ZXNbXCJ0YXJlZmFzXCJdID4gMCkgJiYgKHVwZGF0ZXNbXCJwb3N0c1wiXSA+IDApKSB7XG5cdFx0XHRcdFx0dGV4dG9bXCJmaW5hbFwiXSArPSBcIiBlIFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh1cGRhdGVzW1wicG9zdHNcIl0gPiAwKSB7XG5cdFx0XHRcdFx0dGV4dG9bXCJmaW5hbFwiXSArPSB0ZXh0b1tcInBvc3RzXCJdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0VUkudG9hc3Quc2hvdyh7XG5cdFx0XHRcdFx0XCJwZXJzaXN0ZW50XCI6IHRydWUsXG5cdFx0XHRcdFx0XCJtZXNzYWdlXCI6IHRleHRvW1wiZmluYWxcIl0sXG5cdFx0XHRcdFx0XCJsYWJlbFwiOiBcIkF0dWFsaXphclwiLFxuXHRcdFx0XHRcdFwiYWN0aW9uXCI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0d29ya2VyLkxvYWQoKTtcblx0XHRcdFx0XHRcdHVwZGF0ZXNbXCJ0YXJlZmFzXCJdID0gMDtcblx0XHRcdFx0XHRcdHVwZGF0ZXNbXCJwb3N0c1wiXSA9IDA7XG5cdFx0XHRcdFx0XHR1cGRhdGVzW1widG90YWxcIl0gPSAwO1xuXHRcdFx0XHRcdFx0JHVpW1wicGFnZS10aXRsZVwiXS5odG1sKFVJLmRhdGFbXCJwYWdlLXRpdGxlXCJdKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIG1vc3RyYSBuw7ptZXJvIGRlIG5vdmFzIGF0aXZpZGFkZXMgbm8gdMOtdHVsb1xuXHRcdFx0XHQkdWlbXCJ0aXRsZVwiXS5odG1sKFwiKFwiICsgdXBkYXRlc1tcInRvdGFsXCJdICsgXCIpIFwiICsgVUkuZGF0YVtcInBhZ2UtdGl0bGVcIl0pO1xuXHRcdFx0fVxuXG5cdFx0XHR1cGRhdGVzW1wibGFzdC11cGRhdGVkXCJdID0gKHJlc3BvbnNlWzBdPyBtb21lbnQocmVzcG9uc2VbMF1bXCJ0c1wiXSkgOiBtb21lbnQoKSk7XG5cdFx0fSk7XG5cdH0sIDMwICogMTAwMCk7XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGZvbnRzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuV2ViRm9udC5sb2FkKHtcblx0dGltZW91dDogMTUwMDAsXG5cdGdvb2dsZToge1xuXHRcdGZhbWlsaWVzOiBbXG5cdFx0XHRcIk1hdGVyaWFsIEljb25zXCIsXG5cdFx0XHRcIlJvYm90bzo0MDAsNDAwaXRhbGljLDUwMDpsYXRpblwiLFxuXHRcdFx0XCJSb2JvdG8rTW9ubzo3MDA6bGF0aW5cIixcblx0XHRcdFwiTGF0bzo0MDA6bGF0aW5cIlxuXHRcdF1cblx0fSxcblx0Y3VzdG9tOiB7XG5cdFx0ZmFtaWxpZXM6IFtcblx0XHRcdFwiRm9udEF3ZXNvbWVcIlxuXHRcdF0sIHVybHM6IFtcblx0XHRcdFwiaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvZm9udC1hd2Vzb21lLzQuNy4wL2Nzcy9mb250LWF3ZXNvbWUubWluLmNzc1wiXG5cdFx0XVxuXHR9LFxuXHRhY3RpdmU6IGZ1bmN0aW9uKCkge1xuXHRcdCQoZnVuY3Rpb24oKSB7XG5cdFx0XHRhcHAuTGlzdGEubGF5b3V0KCk7XG5cdFx0fSk7XG5cdH1cbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbW9tZW50anMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5tb21lbnQubG9jYWxlKFwicHQtYnJcIiwge1xuXHRcdFwibW9udGhzXCI6IFwiamFuZWlyb19mZXZlcmVpcm9fbWFyw6dvX2FicmlsX21haW9fanVuaG9fanVsaG9fYWdvc3RvX3NldGVtYnJvX291dHVicm9fbm92ZW1icm9fZGV6ZW1icm9cIi5zcGxpdChcIl9cIiksXG5cdFx0XCJtb250aHNTaG9ydFwiOiBcImphbl9mZXZfbWFyX2Ficl9tYWlfanVuX2p1bF9hZ29fc2V0X291dF9ub3ZfZGV6XCIuc3BsaXQoXCJfXCIpLFxuXHRcdFwid2Vla2RheXNcIjogXCJkb21pbmdvX3NlZ3VuZGEtZmVpcmFfdGVyw6dhLWZlaXJhX3F1YXJ0YS1mZWlyYV9xdWludGEtZmVpcmFfc2V4dGEtZmVpcmFfc8OhYmFkb1wiLnNwbGl0KFwiX1wiKSxcblx0XHRcIndlZWtkYXlzU2hvcnRcIjogXCJkb21fc2VnX3Rlcl9xdWFfcXVpX3NleF9zw6FiXCIuc3BsaXQoXCJfXCIpLFxuXHRcdFwid2Vla2RheXNNaW5cIjogXCJkb21fMsKqXzPCql80wqpfNcKqXzbCql9zw6FiXCIuc3BsaXQoXCJfXCIpLFxuXHRcdFwibG9uZ0RhdGVGb3JtYXRcIjoge1xuXHRcdFx0XCJMVFwiOiBcIkhIOm1tXCIsXG5cdFx0XHRcIkxUU1wiOiBcIkhIOm1tOnNzXCIsXG5cdFx0XHRcIkxcIjogXCJERC9NTS9ZWVlZXCIsXG5cdFx0XHRcIkxMXCI6IFwiRCBbZGVdIE1NTU0gW2RlXSBZWVlZXCIsXG5cdFx0XHRcIkxMTFwiOiBcIkQgW2RlXSBNTU1NIFtkZV0gWVlZWSBbw6BzXSBISDptbVwiLFxuXHRcdFx0XCJMTExMXCI6IFwiZGRkZCwgRCBbZGVdIE1NTU0gW2RlXSBZWVlZIFvDoHNdIEhIOm1tXCJcblx0XHR9LFxuXHRcdFwiY2FsZW5kYXJcIjoge1xuXHRcdFx0XCJzYW1lRGF5XCI6IFwiW2hvamVdIExUXCIsXG5cdFx0XHRcIm5leHREYXlcIjogXCJbYW1hbmjDo10gTFRcIixcblx0XHRcdFwibmV4dFdlZWtcIjogXCJkZGRkIExUXCIsXG5cdFx0XHRcImxhc3REYXlcIjogXCJbb250ZW1dIExUXCIsXG5cdFx0XHRcImxhc3RXZWVrXCI6IFwiZGRkZCBMVFwiLFxuXHRcdFx0XCJzYW1lRWxzZVwiOiBcIkxcIlxuXHRcdH0sXG5cdFx0XCJyZWxhdGl2ZVRpbWVcIjoge1xuXHRcdFx0XCJmdXR1cmVcIjogXCJkYXF1aSAlc1wiLFxuXHRcdFx0XCJwYXN0XCI6IFwiJXMgYXRyw6FzXCIsXG5cdFx0XHRcInNcIjogXCJwb3Vjb3Mgc2VndW5kb3NcIixcblx0XHRcdFwibVwiOiBcInVtIG1pbnV0b1wiLFxuXHRcdFx0XCJtbVwiOiBcIiVkIG1pbnV0b3NcIixcblx0XHRcdFwiaFwiOiBcInVtYSBob3JhXCIsXG5cdFx0XHRcImhoXCI6IFwiJWQgaG9yYXNcIixcblx0XHRcdFwiZFwiOiBcInVtIGRpYVwiLFxuXHRcdFx0XCJkZFwiOiBcIiVkIGRpYXNcIixcblx0XHRcdFwiTVwiOiBcInVtIG3DqnNcIixcblx0XHRcdFwiTU1cIjogXCIlZCBtZXNlc1wiLFxuXHRcdFx0XCJ5XCI6IFwidW0gYW5vXCIsXG5cdFx0XHRcInl5XCI6IFwiJWQgYW5vc1wiXG5cdFx0fSxcblx0XHRcIm9yZGluYWxQYXJzZVwiOiAvXFxkezEsMn3Cui8sXG5cdFx0XCJvcmRpbmFsXCI6IFwiJWTCulwiXG5cdH0pO1xuIl19
