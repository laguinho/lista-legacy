////////////////////////////////////////////////////////////////////////////////////////////////////
// lista de tarefas ////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

let Lista = [];
Lista.Edicao = [];
Lista.Placar = [];
Lista.Tarefas = [];

let app = [];
var $app = []; // TODO existe??

////////////////////////////////////////////////////////////////////////////////////////////////////

let cue = [];
let worker = [];
let timeout = [];

let logging = true;
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

// UI.body.lock()
// UI.body.unlock()
// UI.loadbar.show()
// UI.loadbar.hide()
// UI.backdrop.show()
// UI.backdrop.hide()

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

// UI.data["window"]["width"]
// UI.data["window"]["height"]
// UI.data["column-width"]
// UI.data["columns"]
// UI.data["interaction-type"]
// UI.data["scroll-position"]["top"]
// UI.data["scroll-position"]["bottom"]


////////////////////////////////////////////////////////////////////////////////////////////////////
// ui / window /////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
$ui["window"] = $(window);

$(function () {
	$ui["title"] = $("head title");
	UI.data["title"] = $ui["title"].html();

	$ui["theme-color"] = $("meta[name='theme-color']");
	UI.data["original-theme-color"] = $ui["theme-color"].attr("content");
});

// tipo de interação (touch ou pointer)
UI.data["interaction-type"] = "ontouchstart" in window || navigator.msMaxTouchPoints ? "touch" : "pointer";

////////////////////////////////////////////////////////////////////////////////////////////////////
// reflow
$.fn.reflow = function () {
	var offset = $ui["body"].offset().left;
	return $(this);
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui / body ///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

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
// backdrop

$ui["backdrop"] = [];

UI.backdrop = function () {
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

$(function () {
	// $ui["backdrop"] = $(".js-ui-backdrop");
	// $ui["backdrop"].on("click", function() {
	// 	$ui["backdrop"].trigger("hide");
	// });
});

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

			theme_color["buffer"] = $theme_color.attr("content");
			$theme_color.attr("content", "#000");

			router["view-manager"].add("bottomsheet");
			history.pushState({ "view": "bottomsheet" }, null, null);
		},
		close: function () {
			$ui["bottomsheet"].removeClass("slide").one("transitionend", function () {
				$ui["bottomsheet"].removeClass("in").empty().attr("class", "ui-bottomsheet js-ui-bottomsheet");
			});

			$theme_color.attr("content", theme_color["buffer"]);

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

// layout properties
UI.data["window"] = [];
UI.data["column-width"] = 316; // largura da coluna, incluindo margem

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

// scroll
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
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
// api /////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// TODO legacy
let api_key = "063c72b2afc5333f3b27b366bdac9eb81d64bc6a12cd7b3f4b6ade77a092b63a";

const ListaAPI = function (endpoint) {
	log("API Request: " + endpoint, "info");
	let api_url = "https://api.laguinho.org/lista/" + edicao;
	let api_key = "063c72b2afc5333f3b27b366bdac9eb81d64bc6a12cd7b3f4b6ade77a092b63a";

	let request = $.getJSON(api_url + endpoint + "?key=" + api_key + "&callback=?");
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
	return {
		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.start()
		start: function () {
			log("app.Lista.start", "info");

			// se tiver título especificado, insere ele
			if (Lista.Edicao["mensagem"]["titulo"]) {
				let titulo_da_pagina = Lista.Edicao["mensagem"]["titulo"];
				$ui["title"].html(titulo_da_pagina);
			}

			// de tiver mensagem especificada, insere ela
			if (Lista.Edicao["mensagem"]["rodape"]) {
				$(".js-mensagem-final").html(Lista.Edicao["mensagem"]["rodape"]);
			}

			// de prazo de postagem estiver encerrado, insere classe no <body>
			if (moment().isAfter(Lista.Edicao["fim"])) {
				$ui["body"].addClass("postagens-encerradas");
			}

			// tira a tela de loading
			UI.loadbar.hide();
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

				// Se tiver título especificado, insere ele
				if (data["edicao"]["mensagem"]["titulo"]) {
					page_title = data["edicao"]["mensagem"]["titulo"];
					$("head title").html(page_title);
				}

				// Se tiver mensagem especificada, insere ela
				if (data["edicao"]["mensagem"]["rodape"]) {
					$(".js-mensagem-final").html(data["edicao"]["mensagem"]["rodape"]);
				}

				// Se prazo de postagem estiver encerrado, insere classe no <body>
				if (moment().isAfter(Lista.Regulamento["fim"])) {
					$ui["body"].addClass("postagens-encerradas");
				}

				// Se a Edição estiver encerrada...
				if (Lista.Regulamento["encerrada"] === true) {
					// ...insere classe no <body>
					$ui["body"].addClass("edicao-encerrada");

					// ...para de atualizar automaticamente
					clearInterval(update_interval);
				}

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

		layout: function () {
			$stream.isotope("reloadItems");
			$stream.isotope("layout");
		},

		sort: function (criteria) {
			$stream.isotope({
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

	$stream.on("click", ".card-tarefa:not(.fantasma)", function (event) {
		if (event.which === 1) {
			event.preventDefault();

			var numero = $(this).data("tarefa");
			app.Tarefa.open(numero, true);
		}
	});

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
		open: function (numero, pushState) {
			var tarefa = tarefas[numero];
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
			$("head meta[name='theme-color']").attr("content", theme_color["original"]);

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

// tipos de post: photo, video, vine, text

app.Post = function () {
	return {

		////////////////////////////////////////////////////////////////////////////////////////////
		// NewPost.authorize()
		authorize: function () {
			// habilita o botão enviar
			$(".submit", $post).removeClass("disabled");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// NewPost.deauthorize()
		deauthorize: function () {
			// desabilita o botão "enviar"
			$(".submit", $post).addClass("disabled");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// NewPost.getThumbnail()
		getThumbnail: function (url) {
			// testa se urls são dos provider aceitos e responde com informações sobre o vídeo,
			// incluindo a url da miniatura
			// providers aceitos: youtube, vimeo, vine
			var media_info = {};

			function showThumbnail(media_info) {
				var $thumbnail = $("<img />").attr("src", media_info["thumbnail"]);
				$(".js-media-provider", $post).val(media_info["provider"]);
				$(".js-media-id", $post).val(media_info["id"]);
				$(".js-media-thumbnail", $post).val(media_info["thumbnail"]);
				$(".js-media-preview", $post).html($thumbnail).fadeIn();
			}

			// youtube
			if (url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)) {
				// https://www.youtube.com/watch?v=4ct4eNMrJlg
				var youtube_url = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
				media_info["provider"] = "youtube";
				media_info["id"] = youtube_url[1];
				//	media_info["thumbnail"] = "https://i1.ytimg.com/vi/" + youtube_url[1] + "/maxresdefault.jpg";
				media_info["thumbnail"] = "https://i1.ytimg.com/vi/" + youtube_url[1] + "/0.jpg";

				NewPost.authorize();
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

						NewPost.authorize();
						showThumbnail(media_info);
					});
				} else

					// vine
					if (url.match(/vine\.co/)) {
						// https://vine.co/v/e9IV9OPlrnJ
						var vine_url = url.match(/\/\/(www\.)?vine\.co\/v\/([^\s&]+)($|\/)/);
						media_info["provider"] = "vine";
						media_info["id"] = vine_url[2];

						$.getJSON("//assets.laguinho.org/helpers/vine-thumbnail?id=" + vine_url[2] + "&callback=?").done(function (response) {
							media_info["thumbnail"] = response["thumbnail"];

							NewPost.authorize();
							showThumbnail(media_info);
						});
					}
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// NewPost.open()
		open: function (type, numero) {
			var data = {
				"edicao": Lista.Regulamento["titulo"],
				"numero": numero || tarefa_active,
				"user": user["id"],
				"turma": user["turma"],
				"token": user["token"]
			};
			var $new_post_view = __render("new-post-" + type, data);

			// efeito de abertura
			// _view.open($post, $newPostView);
			$post.html($new_post_view).addClass("in").reflow().addClass("slide-y").one("transitionend", function () {
				var view_theme_color = $(".appbar", $post).css("background-color");
				$("head meta[name='theme-color']").attr("content", view_theme_color);
			});

			NewPost.deauthorize();

			// ações para fazer quando abrir a tela de envio
			// de acordo com o tipo de postagem
			if (type === "photo") {
				$post.dropzone();
				$(".file-placeholder", $post).trigger("click");
				//	$("form", $new_post_view).dropzone();
			} else if (type === "video" || type === "vine") {
				$(".js-media-url-input", $post).focus().on("keyup", function () {
					//	if ($.inArray(event.keyCode, [16, 17, 18])) { return; }
					NewPost.getThumbnail($(this).val());
				});
			} else if (type === "text") {
				$(".js-caption-input", $post).focus().on("keyup", function () {
					if ($(this).val().length > 0) {
						NewPost.authorize();
					} else {
						NewPost.deauthorize();
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
		// NewPost.close()
		close: function () {
			//	tarefa_active = null;
			$("head meta[name='theme-color']").attr("content", theme_color["original"]);

			$post.removeClass("slide-y").one("transitionend", function () {
				$post.removeClass("in").empty();
			});

			router["view-manager"].replace("tarefa");
		}
	};
}();

var post = NewPost;

// jQuery
var $post;

$(function () {
	$post = $("#new-post");
	$ui["bottomsheet"].on("click", ".new-post-sheet a", function (event) {
		event.preventDefault();

		var type = $(this).data("post-type");
		UI.bottomsheet.close();
		setTimeout(function () {
			app.Post.open(type, tarefa_active);
		}, 600);
	});

	$post.on("submit", "form", function (event) {
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

		var data = $("form", $post).serialize();

		$(".submit", $post).addClass("disabled").html("Enviando&hellip;");

		$.post("/-/lista/novo", data).done(function (response) {
			if (response["meta"]["status"] === 200) {
				NewPost.close();
				app.Tarefa.render(response["data"]);
				UI.toast.open(response["meta"]["message"]);
				navigator.vibrate(800);

				tarefas[response["data"]["numero"]] = response["data"];
			} else {
				UI.toast.open(response["meta"]["message"] ? response["meta"]["message"] : "Ocorreu um erro. Tente novamente");
			}
		}).fail(function () {
			toast.open("Ocorreu um erro. Tente novamente");
		});
	}).on("click", ".back", function (event) {
		event.preventDefault();
		NewPost.close();
	});
});

var NewPost = app.Post;

////////////////////////////////////////////////////////////////////////////////////////////////////
// login ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var $login;

var login = function () {
	return {
		show: function () {
			//	backdrop.show();
			$login.addClass("in").reflow().addClass("slide");
			$ui["body"].addClass("no-scroll");
			setTimeout(function () {
				$("input[name='email']", $login).focus();
			}, 300);
		},
		hide: function () {
			$ui["body"].removeClass("no-scroll");
			$login.removeClass("slide").one("transitionend", function () {
				$login.removeClass("in");
			});
			//	backdrop.hide();
		}
	};
}();

$(function () {
	$login = $("#login");
	$(".js-login-trigger", $ui["sidenav"]).on("click", function (event) {
		event.preventDefault();
		sidenav.close();
		login.show();
	});
	$login.on("click", ".back", function (event) {
		event.preventDefault();
		login.hide();
	}).on("submit", "form", function (event) {
		event.preventDefault();

		$.getJSON("https://api.laguinho.org/lista/" + edicao + "/auth?key=" + api_key + "&callback=?", $("form", $login).serialize()).done(function (response) {
			if (response["meta"]["status"] === 200) {
				user = response["user"];
				user["signed-in"] = true;
				localStorage.setItem("user", JSON.stringify(user));

				$ui["body"].addClass("signed-in user-" + user["turma"]);
				login.hide();
				setTimeout(function () {
					UI.toast.show("Olá " + user["name"] + "!");
				}, 500);
			} else {
				$(".form-group", $login).addClass("animated shake");
				setTimeout(function () {
					$(".form-group", $login).removeClass("animated shake");
				}, 1000);
			}
		});
	});

	$(".js-logout-trigger", $ui["sidenav"]).on("click", function (event) {
		event.preventDefault();
		$ui["body"].removeClass("signed-in user-" + user["turma"]);

		user = {
			"id": null,
			"name": null,
			"email": null,
			"token": null,
			"turma": null,
			"signed-in": false
		};
		localStorage.setItem("user", JSON.stringify(user));

		sidenav.close();
		setTimeout(function () {
			UI.toast.show("Sessão encerrada!");
		}, 500);
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

var user = {
	"id": null,
	"name": null,
	"email": null,
	"token": null,
	"turma": null,
	"signed-in": false
};

if (localStorage && localStorage.getItem("user")) {
	user = JSON.parse(localStorage.getItem("user"));

	$(function () {
		if (user["id"] !== null) {
			$ui["body"].addClass("signed-in user-" + user["turma"]);
			setTimeout(function () {
				UI.toast.show("Olá " + user["name"] + "!");
			}, 3000);
		}
	});
}

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
	timeout: 10000,
	google: {
		families: ["Material Icons", "Roboto:400,400italic,500:latin", "Roboto+Mono:700:latin", "Lato:400:latin"]
	},
	// custom: {
	// 	families: [
	// 		"FontAwesome"
	// 	], urls: [
	// 		"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css"
	// 	]
	// },
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiLCJ1dGlsaXRpZXMuanMiLCJ0ZW1wbGF0ZS1lbmdpbmUuanMiLCJyb3V0ZXIuanMiLCJkb2N1bWVudC5qcyIsImJvZHkuanMiLCJsb2FkYmFyLmpzIiwiYmFja2Ryb3AuanMiLCJzaWRlbmF2LmpzIiwiYm90dG9tc2hlZXQuanMiLCJ0b2FzdC5qcyIsImFwaS5qcyIsInBsYWNhci5qcyIsImV2b2x1Y2FvLmpzIiwibGlzdGEuanMiLCJ0YXJlZmEuanMiLCJuZXctcG9zdC5qcyIsImhlbHBlci11c2VyLmpzIiwiaGVscGVyLWltYWdlLXVwbG9hZC5qcyIsIndvcmtlcnMuanMiLCJmb250cy5qcyIsIm1vbWVudC1sb2NhbGUuanMiXSwibmFtZXMiOlsiTGlzdGEiLCJFZGljYW8iLCJQbGFjYXIiLCJUYXJlZmFzIiwiYXBwIiwiJGFwcCIsImN1ZSIsIndvcmtlciIsInRpbWVvdXQiLCJsb2dnaW5nIiwibG9nIiwibWVzc2FnZSIsInR5cGUiLCJjb25zb2xlIiwidWkiLCJSZWd1bGFtZW50byIsInRhcmVmYXMiLCJ0YXJlZmFfYWN0aXZlIiwicmFuZCIsIm1pbiIsIm1heCIsIk1hdGgiLCJyYW5kb20iLCIkdGVtcGxhdGVzIiwiJCIsImVhY2giLCIkdGhpcyIsIm5hbWUiLCJhdHRyIiwiaHRtbCIsInJlbW92ZSIsIl9fcmVuZGVyIiwidGVtcGxhdGUiLCJkYXRhIiwiJHJlbmRlciIsImNsb25lIiwiZm4iLCJmaWxsQmxhbmtzIiwiJGJsYW5rIiwiZmlsbCIsInJ1bGVzIiwic3BsaXQiLCJpIiwibGVuZ3RoIiwicGFpciIsImRlc3QiLCJ0cmltIiwic291cmNlIiwidmFsdWUiLCJqIiwiYWRkQ2xhc3MiLCJ2YWwiLCJpZl9udWxsIiwiaGlkZSIsInJlbW92ZUNsYXNzIiwicmVtb3ZlQXR0ciIsImhhc0NsYXNzIiwicm91dGVyIiwibG9jYXRpb24iLCJwYXRobmFtZSIsImhhc2giLCJwYXRoIiwib2JqZWN0IiwidGl0bGUiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwibGluayIsImFkZCIsInZpZXciLCJwdXNoIiwiZ3JlcCIsInJlcGxhY2UiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJzdGF0ZSIsImluZGV4T2YiLCJib3R0b21zaGVldCIsImNsb3NlIiwicG9zdCIsIlRhcmVmYSIsIm9wZW4iLCJVSSIsIiR1aSIsIm5hdmlnYXRvciIsIm1zTWF4VG91Y2hQb2ludHMiLCJyZWZsb3ciLCJvZmZzZXQiLCJsZWZ0IiwiYm9keSIsImRvY3VtZW50Iiwic2Nyb2xsU3RhdHVzIiwib24iLCJ5Iiwic2Nyb2xsVG9wIiwibG9jayIsInVubG9jayIsImxvYWRiYXIiLCJzaG93Iiwic2V0VGltZW91dCIsIm9uZSIsImJhY2tkcm9wIiwiJHNjcmVlbiIsImV2ZW50cyIsInNjcmVlbiIsInppbmRleCIsImNzcyIsImhhbmRsZXIiLCJ0cmlnZ2VyIiwiYXBwZW5kVG8iLCJvZmYiLCJzaWRlbmF2IiwicHJldmVudERlZmF1bHQiLCIkY29udGVudCIsInRoZW1lX2NvbG9yIiwiJHRoZW1lX2NvbG9yIiwiZW1wdHkiLCJ0b2FzdCIsImNvbmZpZyIsImRpc21pc3MiLCJjbGVhclRpbWVvdXQiLCJhY3Rpb24iLCJjYWxsYmFjayIsInBlcnNpc3RlbnQiLCJzZXRMYXlvdXRQcm9wZXJ0aWVzIiwid2lkdGgiLCJoZWlnaHQiLCJmbG9vciIsImxheW91dF9jbGFzcyIsInNldFNjcm9sbFBvc2l0aW9uIiwiYXBpX2tleSIsIkxpc3RhQVBJIiwiZW5kcG9pbnQiLCJhcGlfdXJsIiwiZWRpY2FvIiwicmVxdWVzdCIsImdldEpTT04iLCJ1cGRhdGUiLCJ0dXJtYXMiLCJtYWlvcl9wb250dWFjYW8iLCJ0b3RhbF9kZV9wb250b3MiLCJ0dXJtYSIsInBvbnR1YWNhb19kYV90dXJtYSIsImluZGV4IiwicGVyY2VudHVhbF9kYV90dXJtYSIsInRvRml4ZWQiLCJ0b1VwcGVyQ2FzZSIsInRvU3RyaW5nIiwiJHR1cm1hIiwiYXBwZW5kIiwicGFyZW50IiwiRXZvbHVjYW8iLCJzdGFydCIsImRpYV9pbmljaWFsIiwibW9tZW50IiwiZGlhX2ZpbmFsIiwiZHVyYWNhb190b3RhbCIsImRpZmYiLCJkaWEiLCJpc0JlZm9yZSIsImluaWNpb19kb19kaWEiLCJmaW5hbF9kb19kaWEiLCJlbmRPZiIsImlzQWZ0ZXIiLCJkdXJhY2FvX2RvX2RpYSIsInBlcmNlbnR1YWxfZG9fZGlhIiwibGFyZ3VyYV9kb19kaWEiLCIkZGlhIiwiZm9ybWF0Iiwic2V0SW50ZXJ2YWwiLCJhZ29yYSIsInRlbXBvX3RyYW5zY29ycmlkbyIsInBlcmNlbnR1YWxfdHJhbnNjb3JyaWRvIiwibGFyZ3VyYV9kYV9iYXJyYSIsInRpdHVsb19kYV9wYWdpbmEiLCJsb2FkIiwiJHN0cmVhbSIsImxvYWRpbmciLCJkb25lIiwicGFnZV90aXRsZSIsImNsZWFySW50ZXJ2YWwiLCJ1cGRhdGVfaW50ZXJ2YWwiLCJ0YXJlZmEiLCIkY2FyZCIsIiRncmlkIiwidG90YWxfcG9zdHMiLCJtYXhfbWVkaWFfdG9fc2hvdyIsInNob3duX21lZGlhX2NvdW50IiwicG9zdF90eXBlc193aXRoX2ltYWdlX3ByZXZpZXciLCJwb3N0X3R5cGVzX3dpdGhfdGV4dF9wcmV2aWV3IiwidGlsZV90eXBlIiwibWVkaWEiLCJzdWJzdHJpbmciLCIkdGlsZSIsImlzb3RvcGUiLCJsYXlvdXQiLCJzb3J0IiwibGFzdF91cGRhdGVkIiwidXBkYXRlZCIsImNyaXRlcmlhIiwiZWxlbWVudCIsInBhcnNlSW50Iiwid2hpY2giLCJudW1lcm8iLCJwbGFjYXJfZGFfdGFyZWZhIiwicmVuZGVyUG9zdHMiLCJwb3N0cyIsIiRwb3N0cyIsImNhbGVuZGFyIiwiJHBvc3RfY2FyZCIsIiRtZWRpYSIsIiRpbWFnZSIsIiRlbWJlZCIsInJlbmRlciIsImdvIiwiJHRhcmVmYSIsIiR0YXJlZmFfY2FyZCIsInRleHQiLCIkcGxhY2FyX2RhX3RhcmVmYSIsIlBvc3QiLCJhdXRob3JpemUiLCIkcG9zdCIsImRlYXV0aG9yaXplIiwiZ2V0VGh1bWJuYWlsIiwidXJsIiwibWVkaWFfaW5mbyIsInNob3dUaHVtYm5haWwiLCIkdGh1bWJuYWlsIiwiZmFkZUluIiwibWF0Y2giLCJ5b3V0dWJlX3VybCIsIk5ld1Bvc3QiLCJ2aW1lb191cmwiLCJyZXNwb25zZSIsInZpbmVfdXJsIiwidXNlciIsIiRuZXdfcG9zdF92aWV3Iiwidmlld190aGVtZV9jb2xvciIsImRyb3B6b25lIiwiZm9jdXMiLCJyZXBsYWNlU3RhdGUiLCJzZXJpYWxpemUiLCJ2aWJyYXRlIiwiZmFpbCIsIiRsb2dpbiIsImxvZ2luIiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsIkpTT04iLCJzdHJpbmdpZnkiLCJnZXRJdGVtIiwicGFyc2UiLCJleGlmX29yaWVudGF0aW9uX3RvX2RlZ3JlZXMiLCJmaWxlX3N0YWNrIiwidXBsb2FkIiwiZmlsZXMiLCJGaWxlQVBJIiwiZmlsdGVyRmlsZXMiLCJmaWxlIiwiaW5mbyIsInRlc3QiLCJyZWplY3RlZCIsImV4aWZfb3JpZW50YXRpb24iLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwiaW1nIiwidGFyZ2V0IiwicmVzdWx0IiwiJHRyYWNrZXIiLCIkc3RhdHVzIiwiJHByZXZpZXciLCJyZWFkQXNEYXRhVVJMIiwiSW1hZ2UiLCJyb3RhdGUiLCJyZXNpemUiLCJnZXQiLCJlcnIiLCJlZGl0aW9uIiwicHJlcGFyZSIsIm9wdGlvbnMiLCJyZWYiLCJmaWxlcHJvZ3Jlc3MiLCJ4aHIiLCJwZXJjZW50Iiwic3RhdHVzIiwicHJvZ3Jlc3MiLCJmaWxlY29tcGxldGUiLCJjb21wbGV0ZSIsImltYWdlQXV0b09yaWVudGF0aW9uIiwiaW1hZ2VUcmFuc2Zvcm0iLCJtYXhXaWR0aCIsIm1heEhlaWdodCIsIiRkcm9wem9uZSIsImRuZCIsIm92ZXIiLCIkZmlsZV9pbnB1dCIsImdldEVsZW1lbnRCeUlkIiwiZ2V0RmlsZXMiLCIkYm9hcmQiLCJvcmlnaW5hbEV2ZW50IiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImRldGFpbCIsIlNsaXAiLCJTdGFydCIsIkRlZmVycmVkIiwiTG9hZCIsInJlc29sdmUiLCJVcGRhdGUiLCJ1cGRhdGVzIiwiYXRpdmlkYWRlIiwidGV4dG8iLCJXZWJGb250IiwiZ29vZ2xlIiwiZmFtaWxpZXMiLCJhY3RpdmUiLCJsb2NhbGUiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTs7QUFFQSxJQUFBQSxRQUFBLEVBQUE7QUFDQUEsTUFBQUMsTUFBQSxHQUFBLEVBQUE7QUFDQUQsTUFBQUUsTUFBQSxHQUFBLEVBQUE7QUFDQUYsTUFBQUcsT0FBQSxHQUFBLEVBQUE7O0FBRUEsSUFBQUMsTUFBQSxFQUFBO0FBQ0EsSUFBQUMsT0FBQSxFQUFBLEMsQ0FBQTs7QUFFQTs7QUFFQSxJQUFBQyxNQUFBLEVBQUE7QUFDQSxJQUFBQyxTQUFBLEVBQUE7QUFDQSxJQUFBQyxVQUFBLEVBQUE7O0FBRUEsSUFBQUMsVUFBQSxJQUFBO0FBQ0EsSUFBQUMsTUFBQSxVQUFBQyxPQUFBLEVBQUFDLElBQUEsRUFBQTtBQUNBLEtBQUFILE9BQUEsRUFBQTtBQUNBLE1BQUEsQ0FBQUcsSUFBQSxFQUFBO0FBQ0FDLFdBQUFILEdBQUEsQ0FBQUMsT0FBQTtBQUNBLEdBRkEsTUFFQTtBQUNBRSxXQUFBRCxJQUFBLEVBQUFELE9BQUE7QUFDQTtBQUNBO0FBQ0EsQ0FSQTs7QUFVQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsSUFBQUcsS0FBQSxFQUFBOztBQUVBZCxNQUFBZSxXQUFBLEdBQUEsRUFBQSxDLENBQUE7QUFDQTs7O0FBSUE7QUFDQSxJQUFBQyxVQUFBLEVBQUE7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFBQyxhQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBOzs7Ozs7Ozs7Ozs7OztBQWVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUM3RkE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBQUMsSUFBQSxDQUFBQyxHQUFBLEVBQUFDLEdBQUEsRUFBQTtBQUNBLFFBQUFDLEtBQUFDLE1BQUEsTUFBQUYsTUFBQUQs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QUVBLGdCQUFBLGtEQUFBQSxLQUFBLENBQUEsR0FBQSxDQUZBO0FBR0EsYUFBQSxpRkFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FIQTtBQUlBLGtCQUFBLDhCQUFBQSxLQUFBLENBQUEsR0FBQSxDQUpBO0FBS0EsZ0JBQUEseUJBQUFBLEtBQUEsQ0FBQSxHQUFBLENBTEE7QUFNQSxtQkFBQTtBQUNBLFFBQUEsT0FEQTtBQUVBLFNBQUEsVUFGQTtBQUdBLE9BQUEsWUFIQTtBQUlBLFFBQUEsdUJBSkE7QUFLQSxTQUFBLGtDQUxBO0FBTUEsVUFBQTtBQU5BLEVBTkE7QUFjQSxhQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEsYUFBQSxhQUZBO0FBR0EsY0FBQSxTQUhBO0FBSUEsYUFBQSxZQUpBO0FBS0EsY0FBQSxTQUxBO0FBTUEsY0FBQTtBQU5BLEVBZEE7QUFzQkEsaUJBQUE7QUFDQSxZQUFBLFVBREE7QUFFQSxVQUFBLFVBRkE7QUFHQSxPQUFBLGlCQUhBO0FBSUEsT0FBQSxXQUpBO0FBS0EsUUFBQSxZQUxBO0FBTUEsT0FBQSxVQU5BO0FBT0EsUUFBQSxVQVBBO0FBUUEsT0FBQSxRQVJBO0FBU0EsUUFBQSxTQVRBO0FBVUEsT0FBQSxRQVZBO0FBV0EsUUFBQSxVQVhBO0FBWUEsT0FBQSxRQVpBO0FBYUEsUUFBQTtBQWJBLEVBdEJBO0FBcUNBLGlCQUFBLFVBckNBO0FBc0NBLFlBQUE7QUF0Q0EsQ0FBQSIsImZpbGUiOiJsaXN0YS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGxpc3RhIGRlIHRhcmVmYXMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxubGV0IExpc3RhID0gWyBdO1xuTGlzdGEuRWRpY2FvID0gWyBdO1xuTGlzdGEuUGxhY2FyID0gWyBdO1xuTGlzdGEuVGFyZWZhcyA9IFsgXTtcblxubGV0IGFwcCA9IFsgXTtcbnZhciAkYXBwID0gWyBdOyAvLyBUT0RPIGV4aXN0ZT8/XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxubGV0IGN1ZSA9IFsgXTtcbmxldCB3b3JrZXIgPSBbIF07XG5sZXQgdGltZW91dCA9IFsgXTtcblxubGV0IGxvZ2dpbmcgPSB0cnVlO1xubGV0IGxvZyA9IGZ1bmN0aW9uKG1lc3NhZ2UsIHR5cGUpIHtcblx0aWYgKGxvZ2dpbmcpIHtcblx0XHRpZiAoIXR5cGUpIHtcblx0XHRcdGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlW3R5cGVdKG1lc3NhZ2UpO1xuXHRcdH1cblx0fVxufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIGRhcXVpIHByYSBiYWl4byBuw6NvIMOpIHByYSB0ZXIgbmFkYSEhXG5cbnZhciB1aSA9IFsgXTtcblxuTGlzdGEuUmVndWxhbWVudG8gPSBbIF07IC8vIFRPRE8gZGVwcmVjYXRlZFxuLy8gdmFyIGVkaWNhbyA9IFwieGNpaWlcIjtcblxuXG5cbi8vIGxhZ3VpbmhvLm9yZy90YXJlZmFzXG52YXIgdGFyZWZhcyA9IHsgfTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBlbGVtZW50cyAmIGhlbHBlcnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB2YXIgJHRoZW1lX2NvbG9yLCB0aGVtZV9jb2xvciA9IHsgfTtcbnZhciB0YXJlZmFfYWN0aXZlO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBvIG9iamV0byBcInVpXCIgZ3VhcmRhIGluZm9ybWHDp8O1ZXMgc29icmUgYSBpbnRlcmZhY2UsIGNvbW8gZGltZW5zw7VlcyBlIHRpcG8gZGUgaW50ZXJhw6fDo29cbi8vIHZhciB1aSAgPSB7IH07XG5cblxuLypcblxudmFyaWHDp8O1ZXMgZGEgaW50ZXJmYWNlOlxuXG4xIGNvbHVuYTogdGVsYSDDum5pY2EsIDEgY29sdW5hIG5hIHRhcmVmYVxuMiBjb2x1bmFzOiB0ZWxhIMO6bmljYSwgMiBjb2x1bmFzIG5hIHRhcmVmYVxuMyBjb2x1bmFzOiB0ZWxhIGRpdmlkaWRhLCAxIGNvbHVuYSBsYXJnYSBuYSB0YXJlZmFcbjQgY29sdW5hczogdGVsYSBkaXZpZGlkYSwgMiBjb2x1bmFzIGxhcmdhcyBuYSB0YXJlZmFcblxuXG5cblxuKi9cblxuXG4vLyBsb2FkaW5nXG4vKlxudmFyIGxvYWRpbmcgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0XHRiYWNrZHJvcC5zaG93KCk7XG5cdFx0XHQkbG9hZGluZy5hZGRDbGFzcyhcImluXCIpO1xuXHRcdH0sXG5cdFx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQkbG9hZGluZy5yZW1vdmVDbGFzcyhcImluXCIpO1xuXHRcdFx0YmFja2Ryb3AuaGlkZSgpO1xuXHRcdH1cblx0fVxufSkoKTtcbiQoZnVuY3Rpb24oKSB7XG5cdCRsb2FkaW5nID0gJChcIiNsb2FkaW5nXCIpO1xufSk7XG4qL1xuXG4vLyB2YXIgYXBpX2tleTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8gdXRpbGl0aWVzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gbGF5b3V0IHByb3BlcnRpZXNcblVJLmRhdGFbXCJ3aW5kb3dcIl0gPSBbIF07XG5VSS5kYXRhW1wiY29sdW1uLXdpZHRoXCJdID0gMzE2OyAvLyBsYXJndXJhIGRhIGNvbHVuYSwgaW5jbHVpbmRvIG1hcmdlbVxuXG5mdW5jdGlvbiBzZXRMYXlvdXRQcm9wZXJ0aWVzKCkge1xuXHQvLyBkaW1lbnPDtWVzIGRhIGphbmVsYVxuXHRVSS5kYXRhW1wid2luZG93XCJdW1wid2lkdGhcIl0gPSAkdWlbXCJ3aW5kb3dcIl0ud2lkdGgoKTtcblx0VUkuZGF0YVtcIndpbmRvd1wiXVtcImhlaWdodFwiXSA9ICR1aVtcIndpbmRvd1wiXS5oZWlnaHQoKTtcblxuXHQvLyBjYWxjdWxhIG7Dum1lcm8gZGUgY29sdW5hc1xuXHRVSS5kYXRhW1wiY29sdW1uc1wiXSA9IE1hdGguZmxvb3IoVUkuZGF0YVtcIndpbmRvd1wiXVtcIndpZHRoXCJdIC8gVUkuZGF0YVtcImNvbHVtbi13aWR0aFwiXSk7XG5cblx0Ly8gYWRpY2lvbmEgY2xhc3NlIG5vIDxib2R5PiBkZSBhY29yZG8gY29tIGEgcXVhbnRpZGFkZSBkZSBjb2x1bmFzXG5cdGxldCBsYXlvdXRfY2xhc3M7XG5cdGlmIChVSS5kYXRhW1wiY29sdW1uc1wiXSA9PT0gMSkge1xuXHRcdGxheW91dF9jbGFzcyA9IFwidWktc2luZ2xlLWNvbHVtblwiO1xuXHR9IGVsc2UgaWYgKFVJLmRhdGFbXCJjb2x1bW5zXCJdID09PSAyKSB7XG5cdFx0bGF5b3V0X2NsYXNzID0gXCJ1aS1kdWFsLWNvbHVtblwiO1xuXHR9IGVsc2Uge1xuXHRcdGxheW91dF9jbGFzcyA9IFwidWktbXVsdGktY29sdW1uXCI7XG5cdH1cblxuXHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwidWktc2luZ2xlLWNvbHVtbiB1aS1kdWFsLWNvbHVtbiB1aS1tdWx0aS1jb2x1bW5cIikuYWRkQ2xhc3MobGF5b3V0X2NsYXNzKTtcbn1cblxuJChmdW5jdGlvbigpIHsgc2V0TGF5b3V0UHJvcGVydGllcygpOyB9KTtcbiR1aVtcIndpbmRvd1wiXS5vbihcInJlc2l6ZVwiLCBzZXRMYXlvdXRQcm9wZXJ0aWVzKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIHNjcm9sbFxuVUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXSA9IFsgXTtcblxuZnVuY3Rpb24gc2V0U2Nyb2xsUG9zaXRpb24oKSB7XG5cdFVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl1bXCJ0b3BcIl0gPSAkdWlbXCJ3aW5kb3dcIl0uc2Nyb2xsVG9wKCk7XG5cdFVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl1bXCJib3R0b21cIl0gPSBVSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdW1widG9wXCJdICsgVUkuZGF0YVtcIndpbmRvd1wiXVtcImhlaWdodFwiXTtcbn1cblxuJChmdW5jdGlvbigpIHsgc2V0U2Nyb2xsUG9zaXRpb24oKTsgfSk7XG4kdWlbXCJ3aW5kb3dcIl0ub24oXCJzY3JvbGwgcmVzaXplXCIsIHNldFNjcm9sbFBvc2l0aW9uKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB0ZW1wbGF0ZSBlbmdpbmUgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciAkdGVtcGxhdGVzID0geyB9O1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQkKFwidGVtcGxhdGVcIikuZWFjaChmdW5jdGlvbigpIHtcblx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXHRcdHZhciBuYW1lID0gJHRoaXMuYXR0cihcImlkXCIpO1xuXHRcdHZhciBodG1sID0gJHRoaXMuaHRtbCgpO1xuXG5cdFx0JHRlbXBsYXRlc1tuYW1lXSA9ICQoaHRtbCk7XG5cdFx0JHRoaXMucmVtb3ZlKCk7XG5cdH0pO1xufSk7XG5cbmZ1bmN0aW9uIF9fcmVuZGVyKHRlbXBsYXRlLCBkYXRhKSB7XG5cdGlmICghJHRlbXBsYXRlc1t0ZW1wbGF0ZV0pIHsgcmV0dXJuIGZhbHNlOyB9XG5cdHZhciAkcmVuZGVyID0gJHRlbXBsYXRlc1t0ZW1wbGF0ZV0uY2xvbmUoKTtcblxuXHQkcmVuZGVyLmRhdGEoZGF0YSk7XG5cblx0JC5mbi5maWxsQmxhbmtzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRibGFuayA9ICQodGhpcyk7XG5cdFx0dmFyIGZpbGwgPSAkYmxhbmsuZGF0YShcImZpbGxcIik7XG5cblx0XHR2YXIgcnVsZXMgPSBmaWxsLnNwbGl0KFwiLFwiKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcGFpciA9IHJ1bGVzW2ldLnNwbGl0KFwiOlwiKTtcblx0XHRcdHZhciBkZXN0ID0gKHBhaXJbMV0/IHBhaXJbMF0udHJpbSgpIDogXCJodG1sXCIpO1xuXHRcdFx0dmFyIHNvdXJjZSA9IChwYWlyWzFdPyBwYWlyWzFdLnRyaW0oKSA6IHBhaXJbMF0pO1xuXHRcdFx0dmFyIHZhbHVlID0gZGF0YVtzb3VyY2VdO1xuXG5cdFx0XHRzb3VyY2UgPSBzb3VyY2Uuc3BsaXQoXCIvXCIpO1xuXHRcdFx0aWYgKHNvdXJjZS5sZW5ndGggPiAxICYmIHR5cGVvZiB2YWx1ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHR2YWx1ZSA9IGRhdGFbc291cmNlWzBdXTtcblxuXHRcdFx0XHRmb3IgKHZhciBqID0gMTsgaiA8IHNvdXJjZS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdHZhbHVlID0gKHZhbHVlW3NvdXJjZVtqXV0pPyB2YWx1ZVtzb3VyY2Vbal1dIDogbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRcdGlmIChkZXN0ID09PSBcImNsYXNzXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsuYWRkQ2xhc3ModmFsdWUpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGRlc3QgPT09IFwiaHRtbFwiKSB7XG5cdFx0XHRcdFx0JGJsYW5rLmh0bWwodmFsdWUpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGRlc3QgPT09IFwidmFsdWVcIikge1xuXHRcdFx0XHRcdCRibGFuay52YWwodmFsdWUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCRibGFuay5hdHRyKGRlc3QsIHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGlmX251bGwgPSAkYmxhbmsuZGF0YShcImZpbGwtbnVsbFwiKTtcblx0XHRcdFx0aWYgKGlmX251bGwgPT09IFwiaGlkZVwiKSB7XG5cdFx0XHRcdFx0JGJsYW5rLmhpZGUoKTtcblx0XHRcdFx0fSBlbHNlIGlmKGlmX251bGwgPT09IFwicmVtb3ZlXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQkYmxhbmtcblx0XHRcdC5yZW1vdmVDbGFzcyhcImZpbGxcIilcblx0XHRcdC5yZW1vdmVBdHRyKFwiZGF0YS1maWxsXCIpXG5cdFx0XHQucmVtb3ZlQXR0cihcImRhdGEtZmlsbC1udWxsXCIpO1xuXHR9O1xuXG5cdGlmICgkcmVuZGVyLmhhc0NsYXNzKFwiZmlsbFwiKSkge1xuXHRcdCRyZW5kZXIuZmlsbEJsYW5rcygpO1xuXHR9XG5cblx0JChcIi5maWxsXCIsICRyZW5kZXIpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0JCh0aGlzKS5maWxsQmxhbmtzKCk7XG5cdH0pO1xuXG5cdHJldHVybiAkcmVuZGVyO1xufVxuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcm91dGVyIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xudmFyIHJvdXRlciA9IFsgXTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbmF2aWdhdGlvbiBtb2RlXG5yb3V0ZXJbXCJwYXRoXCJdID0gbG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoXCIvXCIpO1xuXG5pZiAocm91dGVyW1wicGF0aFwiXVsxXSA9PT0gXCJ0YXJlZmFzXCIpIHtcblx0cm91dGVyW1wibmF2aWdhdGlvbi1tb2RlXCJdID0gXCJwYXRoXCI7XG59IGVsc2Uge1xuXHRyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPSBcImhhc2hcIjtcblx0cm91dGVyW1wicGF0aFwiXSA9IGxvY2F0aW9uLmhhc2guc3BsaXQoXCIvXCIpO1xufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBnb1xucm91dGVyW1wiZ29cIl0gPSBmdW5jdGlvbihwYXRoLCBvYmplY3QsIHRpdGxlKSB7XG5cdGlmIChyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPT09IFwicGF0aFwiKSB7XG5cdFx0aGlzdG9yeS5wdXNoU3RhdGUob2JqZWN0LCB0aXRsZSwgcGF0aCk7XG5cdH0gZWxzZSB7XG5cdFx0aGlzdG9yeS5wdXNoU3RhdGUob2JqZWN0LCB0aXRsZSwgXCIjXCIgKyBwYXRoKTtcblx0XHQvLyBsb2NhdGlvbi5oYXNoID0gcGF0aDtcblx0fVxufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYnVpbGQgbGlua1xucm91dGVyW1wiYnVpbGQtbGlua1wiXSA9IGZ1bmN0aW9uKHBhdGgpIHtcblx0dmFyIGxpbms7XG5cdGlmIChyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPT09IFwicGF0aFwiKSB7XG5cdFx0bGluayA9IHBhdGg7XG5cdH0gZWxzZSB7XG5cdFx0bGluayA9IFwiI1wiICsgcGF0aDtcblx0fVxuXG5cdHJldHVybiBsaW5rO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdmlldyBtYW5hZ2VyXG5yb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0gPSBbXCJob21lXCJdO1xucm91dGVyW1widmlldy1tYW5hZ2VyXCJdID0gKGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdGFkZDogZnVuY3Rpb24odmlldykge1xuXHRcdFx0cm91dGVyW1wiY3VycmVudC12aWV3XCJdLnB1c2godmlldyk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0pO1xuXHRcdH0sXG5cdFx0cmVtb3ZlOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0gPSAkLmdyZXAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLCBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgIT09IHZpZXc7XG5cdFx0XHR9KTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSk7XG5cdFx0fSxcblx0XHRyZXBsYWNlOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0gPSBbIF07XG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0uYWRkKHZpZXcpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBmdW5jdGlvbihldmVudCkge1xuXHQvLyBjb25zb2xlLmxvZyhcImxvY2F0aW9uOiBcIiArIGRvY3VtZW50LmxvY2F0aW9uICsgXCIsIHN0YXRlOiBcIiArIEpTT04uc3RyaW5naWZ5KGV2ZW50LnN0YXRlKSk7XG5cblx0dmFyIHN0YXRlID0gZXZlbnQuc3RhdGU7XG5cblx0aWYgKHN0YXRlICYmIHN0YXRlW1widmlld1wiXSA9PT0gXCJ0YXJlZmFcIikge1xuXHRcdGlmIChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0uaW5kZXhPZihcImJvdHRvbXNoZWV0XCIpID4gLTEpIHsgYm90dG9tc2hlZXQuY2xvc2UoKTsgfVxuXHRcdGlmIChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0uaW5kZXhPZihcIm5ldy1wb3N0XCIpID4gLTEpIHsgcG9zdC5jbG9zZSgpOyB9XG5cdFx0YXBwLlRhcmVmYS5vcGVuKHN0YXRlW1wiaWRcIl0pO1xuXHR9XG5cblx0ZWxzZSBpZiAoc3RhdGUgJiYgc3RhdGVbXCJ2aWV3XCJdID09PSBcIm5ldy1wb3N0XCIpIHtcblx0XHRwb3N0Lm9wZW4oc3RhdGVbXCJ0eXBlXCJdLCBzdGF0ZVtcImlkXCJdKTtcblx0fVxuXG5cdGVsc2UgaWYgKHN0YXRlICYmIHN0YXRlW1widmlld1wiXSA9PT0gXCJib3R0b21zaGVldFwiKSB7XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwibmV3LXBvc3RcIikgPiAtMSkgeyBwb3N0LmNsb3NlKCk7IH1cblx0fVxuXG4vL1x0aWYgKHN0YXRlW1widmlld1wiXSA9PT0gXCJob21lXCIpIHtcblx0ZWxzZSB7XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwiYm90dG9tc2hlZXRcIikgPiAtMSkgeyBib3R0b21zaGVldC5jbG9zZSgpOyB9XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwibmV3LXBvc3RcIikgPiAtMSkgeyBwb3N0LmNsb3NlKCk7IH1cblx0XHRhcHAuVGFyZWZhLmNsb3NlKCk7XG5cdH1cblxufSk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHN0YXRlczpcbi8vICogdGFyZWZhXG4vLyAqIGhvbWVcbi8vICogbmV3LXBvc3Rcbi8vICogYm90dG9tc2hlZXRcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmxldCBVSSA9IHsgfVxubGV0ICR1aSA9IFsgXTtcblxuVUkuZGF0YSA9IFsgXTtcblxuLy8gVUkuYm9keS5sb2NrKClcbi8vIFVJLmJvZHkudW5sb2NrKClcbi8vIFVJLmxvYWRiYXIuc2hvdygpXG4vLyBVSS5sb2FkYmFyLmhpZGUoKVxuLy8gVUkuYmFja2Ryb3Auc2hvdygpXG4vLyBVSS5iYWNrZHJvcC5oaWRlKClcblxuLy8gJHVpW1wid2luZG93XCJdXG4vLyAkdWlbXCJ0aXRsZVwiXVxuLy8gJHVpW1wiYm9keVwiXVxuLy8gJHVpW1wiYXBwYmFyXCJdXG4vLyAkdWlbXCJsb2FkYmFyXCJdXG4vLyAkdWlbXCJzaWRlbmF2XCJdXG4vLyAkdWlbXCJib3R0b21zaGVldFwiXVxuLy8gJHVpW1widG9hc3RcIl1cbi8vICR1aVtcImJhY2tkcm9wXCJdXG4vLyAkdWlbXCJmb290ZXJcIl1cblxuLy8gVUkuZGF0YVtcIndpbmRvd1wiXVtcIndpZHRoXCJdXG4vLyBVSS5kYXRhW1wid2luZG93XCJdW1wiaGVpZ2h0XCJdXG4vLyBVSS5kYXRhW1wiY29sdW1uLXdpZHRoXCJdXG4vLyBVSS5kYXRhW1wiY29sdW1uc1wiXVxuLy8gVUkuZGF0YVtcImludGVyYWN0aW9uLXR5cGVcIl1cbi8vIFVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl1bXCJ0b3BcIl1cbi8vIFVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl1bXCJib3R0b21cIl1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvIHdpbmRvdyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4kdWlbXCJ3aW5kb3dcIl0gPSAkKHdpbmRvdyk7XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCR1aVtcInRpdGxlXCJdID0gJChcImhlYWQgdGl0bGVcIik7XG5cdFVJLmRhdGFbXCJ0aXRsZVwiXSA9ICR1aVtcInRpdGxlXCJdLmh0bWwoKTtcblxuXHQkdWlbXCJ0aGVtZS1jb2xvclwiXSA9ICQoXCJtZXRhW25hbWU9J3RoZW1lLWNvbG9yJ11cIik7XG5cdFVJLmRhdGFbXCJvcmlnaW5hbC10aGVtZS1jb2xvclwiXSA9ICR1aVtcInRoZW1lLWNvbG9yXCJdLmF0dHIoXCJjb250ZW50XCIpO1xufSk7XG5cbi8vIHRpcG8gZGUgaW50ZXJhw6fDo28gKHRvdWNoIG91IHBvaW50ZXIpXG5VSS5kYXRhW1wiaW50ZXJhY3Rpb24tdHlwZVwiXSA9IChcIm9udG91Y2hzdGFydFwiIGluIHdpbmRvdyB8fCBuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyk/IFwidG91Y2hcIiA6IFwicG9pbnRlclwiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHJlZmxvd1xuJC5mbi5yZWZsb3cgPSBmdW5jdGlvbigpIHtcblx0dmFyIG9mZnNldCA9ICR1aVtcImJvZHlcIl0ub2Zmc2V0KCkubGVmdDtcblx0cmV0dXJuICQodGhpcyk7XG59O1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgLyBib2R5IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5VSS5ib2R5ID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcImJvZHlcIl0gPSAkKGRvY3VtZW50LmJvZHkpO1xuXHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJ1aS1cIiArIFVJLmRhdGFbXCJpbnRlcmFjdGlvbi10eXBlXCJdKTtcblx0XHRzY3JvbGxTdGF0dXMoKTtcblx0fSk7XG5cblx0JCh3aW5kb3cpLm9uKFwic2Nyb2xsXCIsIHNjcm9sbFN0YXR1cyk7XG5cblx0ZnVuY3Rpb24gc2Nyb2xsU3RhdHVzKCkge1xuXHRcdHZhciB5ID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXG5cdFx0aWYgKHkgPiAxKSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwic2Nyb2xsLXRvcFwiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInNjcm9sbC10b3BcIik7XG5cdFx0fVxuXG5cdFx0aWYgKHkgPiA1Nikge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcImxpdmVzaXRlLWJsdXJcIikucmVtb3ZlQ2xhc3MoXCJsaXZlc2l0ZS1mb2N1c1wiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcImxpdmVzaXRlLWZvY3VzXCIpLnJlbW92ZUNsYXNzKFwibGl2ZXNpdGUtYmx1clwiKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gVUkuYm9keS5sb2NrKClcblx0XHRsb2NrOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJuby1zY3JvbGxcIik7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gVUkuYm9keS51bmxvY2soKVxuXHRcdHVubG9jazogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwibm8tc2Nyb2xsXCIpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvIGxvYWRiYXIgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblVJLmxvYWRiYXIgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wibG9hZGJhclwiXSA9ICQoXCIudWktbG9hZGJhclwiKTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcImxvYWRiYXJcIl0uYWRkQ2xhc3MoXCJpblwiKTtcblx0XHR9LFxuXHRcdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGltZW91dFtcImhpZGUtbG9hZGJhclwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR1aVtcImxvYWRiYXJcIl1cblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoXCJmYWRlLWluXCIpXG5cdFx0XHRcdFx0Lm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQkdWlbXCJsb2FkYmFyXCJdLnJlbW92ZUNsYXNzKFwiaW5cIik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9LCA4MDApO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBiYWNrZHJvcFxuXG4kdWlbXCJiYWNrZHJvcFwiXSA9IFsgXTtcblxuVUkuYmFja2Ryb3AgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0c2hvdzogZnVuY3Rpb24oJHNjcmVlbiwgZXZlbnRzKSB7XG5cdFx0XHR2YXIgc2NyZWVuID0gJHNjcmVlbltcInNlbGVjdG9yXCJdO1xuXHRcdFx0dmFyIHppbmRleCA9ICRzY3JlZW4uY3NzKFwiei1pbmRleFwiKSAtIDE7XG5cblx0XHRcdCR1aVtcImJhY2tkcm9wXCJdW3NjcmVlbl0gPSBfX3JlbmRlcihcImJhY2tkcm9wXCIpO1xuXG5cdFx0XHQkLmVhY2goZXZlbnRzLCBmdW5jdGlvbihldmVudCwgaGFuZGxlcikge1xuXHRcdFx0XHQkdWlbXCJiYWNrZHJvcFwiXVtzY3JlZW5dLm9uKGV2ZW50LCBoYW5kbGVyKVxuXHRcdFx0fSk7XG5cblx0XHRcdCR1aVtcImJhY2tkcm9wXCJdW3NjcmVlbl0uY3NzKFwiei1pbmRleFwiLCB6aW5kZXgpXG5cdFx0XHRcdC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkgeyAkKHRoaXMpLnRyaWdnZXIoXCJoaWRlXCIpOyB9KVxuXHRcdFx0XHQuYXBwZW5kVG8oJHVpW1wiYm9keVwiXSlcblx0XHRcdFx0LmFkZENsYXNzKFwiaW5cIik7XG5cdFx0fSxcblx0XHRoaWRlOiBmdW5jdGlvbigkc2NyZWVuKSB7XG5cdFx0XHR2YXIgc2NyZWVuID0gJHNjcmVlbltcInNlbGVjdG9yXCJdO1xuXHRcdFx0JHVpW1wiYmFja2Ryb3BcIl1bc2NyZWVuXS5yZW1vdmVDbGFzcyhcImluXCIpLm9mZihcImhpZGVcIikucmVtb3ZlKCk7XG5cdFx0fVxuXHR9O1xufSkoKTtcblxuJChmdW5jdGlvbigpIHtcblx0Ly8gJHVpW1wiYmFja2Ryb3BcIl0gPSAkKFwiLmpzLXVpLWJhY2tkcm9wXCIpO1xuXHQvLyAkdWlbXCJiYWNrZHJvcFwiXS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuXHQvLyBcdCR1aVtcImJhY2tkcm9wXCJdLnRyaWdnZXIoXCJoaWRlXCIpO1xuXHQvLyB9KTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgc2lkZW5hdiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5VSS5zaWRlbmF2ID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcInNpZGVuYXZcIl0gPSAkKFwiLmpzLXVpLXNpZGVuYXZcIik7XG5cblx0XHQkKFwiLmpzLXNpZGVuYXYtdHJpZ2dlclwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0VUkuc2lkZW5hdi5vcGVuKCk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0b3BlbjogZnVuY3Rpb24oKSB7XG5cdFx0XHRVSS5ib2R5LmxvY2soKTtcblx0XHRcdFVJLmJhY2tkcm9wLnNob3coJHVpW1wic2lkZW5hdlwiXSwgeyBcImhpZGVcIjogVUkuc2lkZW5hdi5jbG9zZSB9KTtcblx0XHRcdCR1aVtcInNpZGVuYXZcIl0uYWRkQ2xhc3MoXCJpblwiKTtcblx0XHR9LFxuXHRcdGNsb3NlOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcInNpZGVuYXZcIl0ucmVtb3ZlQ2xhc3MoXCJpblwiKTtcblx0XHRcdFVJLmJhY2tkcm9wLmhpZGUoJHVpW1wic2lkZW5hdlwiXSk7XG5cdFx0XHRVSS5ib2R5LnVubG9jaygpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBib3R0b21zaGVldFxuVUkuYm90dG9tc2hlZXQgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0b3BlbjogZnVuY3Rpb24oJGNvbnRlbnQsIGFkZENsYXNzKSB7XG5cdFx0XHRVSS5iYWNrZHJvcC5zaG93KCR1aVtcImJvdHRvbXNoZWV0XCJdLCB7IFwiaGlkZVwiOiBVSS5ib3R0b21zaGVldC5jbG9zZSB9KTtcblx0XHRcdCR1aVtcImJvdHRvbXNoZWV0XCJdLmh0bWwoJGNvbnRlbnQpLmFkZENsYXNzKChhZGRDbGFzcz8gYWRkQ2xhc3MgKyBcIiBcIiA6IFwiXCIpICsgXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlXCIpO1xuXG5cdFx0XHR0aGVtZV9jb2xvcltcImJ1ZmZlclwiXSA9ICR0aGVtZV9jb2xvci5hdHRyKFwiY29udGVudFwiKTtcblx0XHRcdCR0aGVtZV9jb2xvci5hdHRyKFwiY29udGVudFwiLCBcIiMwMDBcIik7XG5cblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5hZGQoXCJib3R0b21zaGVldFwiKTtcblx0XHRcdGhpc3RvcnkucHVzaFN0YXRlKHsgXCJ2aWV3XCI6IFwiYm90dG9tc2hlZXRcIiB9LCBudWxsLCBudWxsKTtcblx0XHR9LFxuXHRcdGNsb3NlOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcImJvdHRvbXNoZWV0XCJdLnJlbW92ZUNsYXNzKFwic2xpZGVcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JHVpW1wiYm90dG9tc2hlZXRcIl0ucmVtb3ZlQ2xhc3MoXCJpblwiKS5lbXB0eSgpLmF0dHIoXCJjbGFzc1wiLCBcInVpLWJvdHRvbXNoZWV0IGpzLXVpLWJvdHRvbXNoZWV0XCIpO1xuXHRcdFx0fSk7XG5cblx0XHRcdCR0aGVtZV9jb2xvci5hdHRyKFwiY29udGVudFwiLCB0aGVtZV9jb2xvcltcImJ1ZmZlclwiXSk7XG5cblx0XHRcdFVJLmJhY2tkcm9wLmhpZGUoJHVpW1wiYm90dG9tc2hlZXRcIl0pO1xuXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0ucmVtb3ZlKFwiYm90dG9tc2hlZXRcIik7XG5cdFx0fVxuXHR9O1xufSkoKTtcblxuJChmdW5jdGlvbigpIHtcblx0JHVpW1wiYm90dG9tc2hlZXRcIl0gPSAkKFwiLmpzLXVpLWJvdHRvbXNoZWV0XCIpO1xufSk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB0b2FzdCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblVJLnRvYXN0ID0gKGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdC8vIFRPRE8gbm92YSBzaW50YXhlLCB1c2FyIHRlbXBsYXRlIGUgX19yZW5kZXJcblx0XHRzaG93OiBmdW5jdGlvbihjb25maWcpIHtcblx0XHRcdGlmICh0eXBlb2YgY29uZmlnID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdCR1aS50b2FzdFtcIm1lc3NhZ2VcIl0uaHRtbChjb25maWdbXCJtZXNzYWdlXCJdKTtcblx0XHRcdFx0JHVpLnRvYXN0W1wiYWN0aW9uXCJdLmh0bWwoKGNvbmZpZ1tcImFjdGlvblwiXT8gY29uZmlnW1wiYWN0aW9uXCJdIDogXCJcIikpO1xuXHRcdFx0XHQkdWkudG9hc3QuYWRkQ2xhc3MoXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlXCIpO1xuXHRcdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwidG9hc3QtYWN0aXZlXCIpO1xuXG5cdFx0XHRcdC8vIFRPRE86IC5mYWItYm90dG9tIHRyYW5zZm9ybTogdHJhbnNsYXRlWVxuXG5cdFx0XHRcdCR1aS50b2FzdC5vbihcImNsaWNrXCIsIFVJLnRvYXN0LmRpc21pc3MpO1xuXHRcdFx0XHQkdWkudG9hc3RbXCJhY3Rpb25cIl0ub24oXCJjbGlja1wiLCBjb25maWdbXCJjYWxsYmFja1wiXSk7XG5cblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXRbXCJ0b2FzdFwiXSk7XG5cblx0XHRcdFx0aWYgKCFjb25maWdbXCJwZXJzaXN0ZW50XCJdKSB7XG5cdFx0XHRcdFx0JHVpLnRvYXN0LnJlbW92ZUNsYXNzKFwic3RyZWFtLW9ubHlcIik7XG5cdFx0XHRcdFx0dGltZW91dFtcInRvYXN0XCJdID0gc2V0VGltZW91dChVSS50b2FzdC5kaXNtaXNzLCAoY29uZmlnW1widGltZW91dFwiXT8gY29uZmlnW1widGltZW91dFwiXSA6IDYwMDApKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkdWkudG9hc3QuYWRkQ2xhc3MoXCJzdHJlYW0tb25seVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0VUkudG9hc3Quc2hvdyh7XG5cdFx0XHRcdFx0XCJtZXNzYWdlXCI6IGNvbmZpZ1xuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRkaXNtaXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aS50b2FzdC5yZW1vdmVDbGFzcyhcInNsaWRlXCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCR1aVtcImJvZHlcIl0ucmVtb3ZlQ2xhc3MoXCJ0b2FzdC1hY3RpdmVcIik7XG5cdFx0XHRcdCR1aS50b2FzdC5yZW1vdmVDbGFzcyhcImluIHN0cmVhbS1vbmx5XCIpO1xuXG5cdFx0XHRcdCR1aS50b2FzdFtcIm1lc3NhZ2VcIl0uZW1wdHkoKTtcblx0XHRcdFx0JHVpLnRvYXN0W1wiYWN0aW9uXCJdLmVtcHR5KCk7XG5cdFx0XHR9KTtcblx0XHRcdGNsZWFyVGltZW91dCh0aW1lb3V0W1widG9hc3RcIl0pO1xuXHRcdH0sXG5cblx0XHQvLyBUT0RPIERFUFJFQ0FURURcblx0XHRvcGVuOiBmdW5jdGlvbihtZXNzYWdlLCBhY3Rpb24sIGNhbGxiYWNrLCBwZXJzaXN0ZW50KSB7XG5cdFx0Ly8gb3BlbjogZnVuY3Rpb24obWVzc2FnZSwgYWRkQ2xhc3MpIHtcblx0XHRcdCR1aS50b2FzdC5tZXNzYWdlLmh0bWwobWVzc2FnZSk7XG5cdFx0XHQkdWkudG9hc3QuYWN0aW9uLmh0bWwoKGFjdGlvbj8gYWN0aW9uIDogXCJcIikpO1xuXHRcdFx0JHVpLnRvYXN0LmFkZENsYXNzKFwiaW5cIikucmVmbG93KCkuYWRkQ2xhc3MoXCJzbGlkZVwiKTtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJ0b2FzdC1hY3RpdmVcIik7XG5cblx0XHRcdC8vIFRPRE86IC5mYWItYm90dG9tIHRyYW5zZm9ybTogdHJhbnNsYXRlWVxuXG5cdFx0XHQkdWkudG9hc3Qub24oXCJjbGlja1wiLCB0b2FzdC5jbG9zZSk7XG5cdFx0XHQkdWkudG9hc3QuYWN0aW9uLm9uKFwiY2xpY2tcIiwgY2FsbGJhY2spO1xuXG5cdFx0XHRjbGVhclRpbWVvdXQodGltZW91dFtcInRvYXN0XCJdKTtcblx0XHRcdGlmICghcGVyc2lzdGVudCkge1xuXHRcdFx0XHQkdWkudG9hc3QucmVtb3ZlQ2xhc3MoXCJzdHJlYW0tb25seVwiKTtcblx0XHRcdFx0dGltZW91dFtcInRvYXN0XCJdID0gc2V0VGltZW91dCh0b2FzdC5jbG9zZSwgNjUwMCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkdWkudG9hc3QuYWRkQ2xhc3MoXCJzdHJlYW0tb25seVwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59KSgpO1xuXG52YXIgdG9hc3QgPSBVSS50b2FzdDtcbnRvYXN0LmNsb3NlID0gVUkudG9hc3QuZGlzbWlzcztcblxuLy8gdmFyIHNuYWNrYmFyID0gdG9hc3Q7XG5cbi8vIGpRdWVyeVxuJHVpLnRvYXN0ID0gWyBdO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQkdWkudG9hc3QgPSAkKFwiLmpzLXVpLXRvYXN0XCIpO1xuXHQkdWkudG9hc3RbXCJtZXNzYWdlXCJdID0gJChcIi50b2FzdC1tZXNzYWdlXCIsICR1aS50b2FzdCk7XG5cdCR1aS50b2FzdFtcImFjdGlvblwiXSA9ICQoXCIudG9hc3QtYWN0aW9uXCIsICR1aS50b2FzdCk7XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwaSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gVE9ETyBsZWdhY3lcbmxldCBhcGlfa2V5ID0gXCIwNjNjNzJiMmFmYzUzMzNmM2IyN2IzNjZiZGFjOWViODFkNjRiYzZhMTJjZDdiM2Y0YjZhZGU3N2EwOTJiNjNhXCI7XG5cbmNvbnN0IExpc3RhQVBJID0gZnVuY3Rpb24oZW5kcG9pbnQpIHtcblx0bG9nKFwiQVBJIFJlcXVlc3Q6IFwiICsgZW5kcG9pbnQsIFwiaW5mb1wiKTtcblx0bGV0IGFwaV91cmwgPSBcImh0dHBzOi8vYXBpLmxhZ3VpbmhvLm9yZy9saXN0YS9cIiArIGVkaWNhbztcblx0bGV0IGFwaV9rZXkgPSBcIjA2M2M3MmIyYWZjNTMzM2YzYjI3YjM2NmJkYWM5ZWI4MWQ2NGJjNmExMmNkN2IzZjRiNmFkZTc3YTA5MmI2M2FcIjtcblxuXHRsZXQgcmVxdWVzdCA9ICQuZ2V0SlNPTihhcGlfdXJsICsgZW5kcG9pbnQgKyBcIj9rZXk9XCIgKyBhcGlfa2V5ICsgXCImY2FsbGJhY2s9P1wiKTtcblx0cmV0dXJuIHJlcXVlc3Q7XG59O1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcGxhY2FyIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5hcHAuUGxhY2FyID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcInBsYWNhclwiXSA9ICQoXCIuanMtYXBwLXBsYWNhciA+IHVsXCIpO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdHVwZGF0ZTogZnVuY3Rpb24odHVybWFzKSB7XG5cdFx0XHQvLyBjb25mZXJlIHF1YWwgYSB0dXJtYSBjb20gbWFpb3IgcG9udHVhw6fDo29cblx0XHRcdC8vIGUgc29tYSBhIHBvbnR1YcOnw6NvIGRlIGNhZGEgdHVybWEgcGFyYSBvYnRlciBvIHRvdGFsIGRlIHBvbnRvc1xuXHRcdFx0dmFyIG1haW9yX3BvbnR1YWNhbyA9IDA7XG5cdFx0XHR2YXIgdG90YWxfZGVfcG9udG9zID0gMDtcblxuXHRcdFx0Zm9yICh2YXIgdHVybWEgaW4gdHVybWFzKSB7XG5cdFx0XHRcdHZhciBwb250dWFjYW9fZGFfdHVybWEgPSB0dXJtYXNbdHVybWFdW1wicG9udG9zXCJdO1xuXG5cdFx0XHRcdGlmIChwb250dWFjYW9fZGFfdHVybWEgPiBtYWlvcl9wb250dWFjYW8pIHtcblx0XHRcdFx0XHRtYWlvcl9wb250dWFjYW8gPSBwb250dWFjYW9fZGFfdHVybWE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0b3RhbF9kZV9wb250b3MgKz0gcG9udHVhY2FvX2RhX3R1cm1hO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBsaW1wYSBvIHBsYWNhclxuXHRcdFx0JHVpW1wicGxhY2FyXCJdLmVtcHR5KCk7XG5cblx0XHRcdC8vIGFkaWNpb25hIGNhZGEgdHVybWEgbm8gcGxhY2FyXG5cdFx0XHQkLmVhY2godHVybWFzLCBmdW5jdGlvbihpbmRleCwgdHVybWEpIHtcblx0XHRcdFx0Ly8gY2FsY3VsYSAlIGRhIHR1cm1hIGVtIHJlbGHDp8OjbyBhbyB0b3RhbCBkZSBwb250b3Ncblx0XHRcdFx0dmFyIHBlcmNlbnR1YWxfZGFfdHVybWEgPSAodG90YWxfZGVfcG9udG9zID4gMD8gdHVybWFbXCJwb250b3NcIl0gLyBtYWlvcl9wb250dWFjYW8gOiAwKTtcblxuXHRcdFx0XHQvLyBmb3JtYXRhIG9zIGRhZG9zXG5cdFx0XHRcdHR1cm1hW1wibGFyZ3VyYS1kYS1iYXJyYVwiXSA9IFwid2lkdGg6IFwiICsgKHBlcmNlbnR1YWxfZGFfdHVybWEgKiAxMDApLnRvRml4ZWQoMykgKyBcIiU7XCI7XG5cdFx0XHRcdHR1cm1hW1widHVybWEtZm9ybWF0YWRhXCJdID0gdHVybWFbXCJ0dXJtYVwiXS50b1VwcGVyQ2FzZSgpO1xuXHRcdFx0XHR0dXJtYVtcInBvbnRvc1wiXSA9IHR1cm1hW1wicG9udG9zXCJdO1xuXHRcdFx0XHR0dXJtYVtcInBvbnR1YWNhby1mb3JtYXRhZGFcIl0gPSB0dXJtYVtcInBvbnRvc1wiXS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLlwiKTtcblxuXHRcdFx0XHQvLyByZW5kZXJpemEgZSBjb2xvY2EgbmEgcMOhZ2luYVxuXHRcdFx0XHR2YXIgJHR1cm1hID0gX19yZW5kZXIoXCJwbGFjYXItdHVybWFcIiwgdHVybWEpO1xuXHRcdFx0XHQkdWlbXCJwbGFjYXJcIl0uYXBwZW5kKCR0dXJtYSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKHRvdGFsX2RlX3BvbnRvcyA9PT0gMCkge1xuXHRcdFx0XHQkdWlbXCJwbGFjYXJcIl0ucGFyZW50KCkuYWRkQ2xhc3MoXCJ6ZXJvZWRcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkdWlbXCJwbGFjYXJcIl0ucGFyZW50KCkucmVtb3ZlQ2xhc3MoXCJ6ZXJvZWRcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBwIGV2b2x1w6fDo28gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhcHAuRXZvbHVjYW8uc3RhcnQoKVxuLy8gYXBwLkV2b2x1Y2FvLnVwZGF0ZSgpXG5cbi8vIFRPRE9cbi8vIC0gbW9zdHJhciBjb250YWRvciBuYXMgw7psdGltYXMgNDggaG9yYXNcbi8vIC0gbyBxdWUgYWNvbnRlY2UgZGVwb2lzIGRvIGVuY2VycmFtZW50bz9cbi8vICAgLSBiYXJyYSBmaWNhIGRhIGNvciBkYSB0dXJtYSBlIGFwYXJlY2UgbWVuc2FnZW0gZW0gY2ltYSBcIkVDMSBjYW1wZcOjXCJcblxuYXBwLkV2b2x1Y2FvID0gKGZ1bmN0aW9uKCkge1xuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdCR1aVtcImV2b2x1Y2FvXCJdID0gJChcIi5hcHAtZXZvbHVjYW9cIik7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuRXZvbHVjYW8uc3RhcnQoKVxuXHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdGxvZyhcImFwcC5Fdm9sdWNhby5zdGFydFwiLCBcImluZm9cIik7XG5cblx0XHRcdC8vIHBlZ2EgZGF0YSBkZSBpbsOtY2lvIGUgZGF0YSBkZSBlbmNlcnJhbWVudG9cblx0XHRcdGxldCBkaWFfaW5pY2lhbCA9IExpc3RhLkVkaWNhb1tcImluaWNpb1wiXSA9IG1vbWVudChMaXN0YS5FZGljYW9bXCJpbmljaW9cIl0pO1xuXHRcdFx0bGV0IGRpYV9maW5hbCA9IExpc3RhLkVkaWNhb1tcImZpbVwiXSA9IG1vbWVudChMaXN0YS5FZGljYW9bXCJmaW1cIl0pO1xuXG5cdFx0XHQvLyBsZXQgZGlhX2luaWNpYWwgPSBMaXN0YS5FZGljYW9bXCJpbmljaW9cIl07XG5cdFx0XHQvLyBsZXQgZGlhX2ZpbmFsID0gTGlzdGEuRWRpY2FvW1wiZmltXCJdO1xuXG5cdFx0XHQvLyBjYWxjdWxhIG8gdGVtcG8gdG90YWwgKGVtIG1pbnV0b3MpXG5cdFx0XHRsZXQgZHVyYWNhb190b3RhbCA9IExpc3RhLkVkaWNhb1tcImR1cmFjYW8tZW0tbWludXRvc1wiXSA9IGRpYV9maW5hbC5kaWZmKGRpYV9pbmljaWFsLCBcIm1pbnV0ZXNcIik7XG5cblx0XHRcdC8vIGluc2VyZSBvcyBkaWFzIG5hIGJhcnJhLCBpbmRvIGRlIGRpYSBlbSBkaWEgYXTDqSBjaGVnYXIgYW8gZW5jZXJyYW1lbnRvXG5cdFx0XHRmb3IgKGxldCBkaWEgPSBkaWFfaW5pY2lhbC5jbG9uZSgpOyBkaWEuaXNCZWZvcmUoZGlhX2ZpbmFsKTsgZGlhLmFkZCgxLCBcImRheXNcIikpIHtcblx0XHRcdFx0Ly8gZGVmaW5lIGluw61jaW8gZSBmaW5hbCBkbyBkaWEuXG5cdFx0XHRcdC8vIHNlIGZpbmFsIGZvciBhcMOzcyBhIGRhdGEgZGUgZW5jZXJyYW1lbnRvLCB1c2EgZWxhIGNvbW8gZmluYWxcblx0XHRcdFx0bGV0IGluaWNpb19kb19kaWEgPSBkaWE7XG5cdFx0XHRcdGxldCBmaW5hbF9kb19kaWEgPSBkaWEuY2xvbmUoKS5lbmRPZihcImRheVwiKTtcblx0XHRcdFx0aWYgKGZpbmFsX2RvX2RpYS5pc0FmdGVyKGRpYV9maW5hbCkpIHtcblx0XHRcdFx0XHRmaW5hbF9kb19kaWEgPSBkaWFfZmluYWw7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBjYWxjdWxhIGEgZHVyYcOnw6NvIGRvIGRpYSBlbSBtaW51dG9zXG5cdFx0XHRcdGxldCBkdXJhY2FvX2RvX2RpYSA9IGZpbmFsX2RvX2RpYS5kaWZmKGluaWNpb19kb19kaWEsIFwibWludXRlc1wiKTtcblxuXHRcdFx0XHQvLyBkZWZpbmUgYSBkdXJhw6fDo28gcGVyY2VudHVhbCBkbyBkaWEgZW0gcmVsYcOnw6NvIGFvIHRvdGFsXG5cdFx0XHRcdGxldCBwZXJjZW50dWFsX2RvX2RpYSA9IGR1cmFjYW9fZG9fZGlhIC8gZHVyYWNhb190b3RhbDtcblxuXHRcdFx0XHQvLyBjYWxjdWxhIGEgbGFyZ3VyYSBkbyBkaWEgKGRlIGFjb3JkbyBjb20gZHVyYcOnw6NvIHBlcmNlbnR1YWwpXG5cdFx0XHRcdC8vIGUgaW5zZXJlIGRpYSBuYSBiYXJyYSBkZSBldm9sdcOnw6NvXG5cdFx0XHRcdGxldCBsYXJndXJhX2RvX2RpYSA9IChwZXJjZW50dWFsX2RvX2RpYSAqIDEwMCkudG9GaXhlZCgzKTtcblx0XHRcdFx0bGV0ICRkaWEgPSBfX3JlbmRlcihcImV2b2x1Y2FvLWRpYVwiLCB7XG5cdFx0XHRcdFx0ZGlhOiBkaWEuZm9ybWF0KFwiZGRkXCIpXG5cdFx0XHRcdH0pLmNzcyhcIndpZHRoXCIsIGxhcmd1cmFfZG9fZGlhICsgXCIlXCIpO1xuXG5cdFx0XHRcdCQoXCIuZGF5LWxhYmVsc1wiLCAkdWlbXCJldm9sdWNhb1wiXSkuYXBwZW5kKCRkaWEpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBjb20gb3MgZGlhcyBpbnNlcmlkb3MgbmEgYmFycmEgZGUgZXZvbHXDp8Ojbyxcblx0XHRcdC8vIGRlc2VuaGEgYSBiYXJyYSBkZSB0ZW1wbyB0cmFuc2NvcnJpZG9cblx0XHRcdHNldFRpbWVvdXQoYXBwLkV2b2x1Y2FvLnVwZGF0ZSwgMTAwMCk7XG5cblx0XHRcdC8vIGF0dWFsaXphIGEgbGluaGEgZGUgZXZvbHXDp8OjbyBhIGNhZGEgWCBtaW51dG9zXG5cdFx0XHR0aW1lb3V0W1wiZXZvbHVjYW9cIl0gPSBzZXRJbnRlcnZhbChhcHAuRXZvbHVjYW8udXBkYXRlLCA2MCAqIDEwMDApO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Fdm9sdWNhby51cGRhdGUoKVxuXHRcdHVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHRsb2coXCJhcHAuRXZvbHVjYW8udXBkYXRlXCIsIFwiaW5mb1wiKTtcblxuXHRcdFx0Ly8gcGVnYSBhcyBkYXRhcyBlIGNhbGN1bGEgbyB0ZW1wbyAoZW0gbWludXRvcykgZSBwZXJjZW50dWFsIHRyYW5zY29ycmlkb3Ncblx0XHRcdGxldCBhZ29yYSA9IG1vbWVudCgpO1xuXHRcdFx0bGV0IGRpYV9pbmljaWFsID0gTGlzdGEuRWRpY2FvW1wiaW5pY2lvXCJdO1xuXHRcdFx0bGV0IGRpYV9maW5hbCA9IExpc3RhLkVkaWNhb1tcImZpbVwiXTtcblx0XHRcdGxldCBkdXJhY2FvX3RvdGFsID0gTGlzdGEuRWRpY2FvW1wiZHVyYWNhby1lbS1taW51dG9zXCJdO1xuXG5cdFx0XHRsZXQgdGVtcG9fdHJhbnNjb3JyaWRvID0gYWdvcmEuZGlmZihkaWFfaW5pY2lhbCwgXCJtaW51dGVzXCIpO1xuXHRcdFx0bGV0IHBlcmNlbnR1YWxfdHJhbnNjb3JyaWRvID0gKHRlbXBvX3RyYW5zY29ycmlkbyA8IGR1cmFjYW9fdG90YWwgPyB0ZW1wb190cmFuc2NvcnJpZG8gLyBkdXJhY2FvX3RvdGFsIDogMSk7XG5cblx0XHRcdC8vIGRlZmluZSBhIGxhcmd1cmEgZGEgYmFycmEgZGUgZXZvbHXDp8OjbyBjb21wbGV0YSBpZ3VhbCDDoCBsYXJndXJhIGRhIHRlbGFcblx0XHRcdC8vIGRlcG9pcywgbW9zdHJhIGFwZW5hcyBvIHBlcmNlbnR1YWwgdHJhbnNjb3JyaWRvXG5cdFx0XHQkKFwiLmVsYXBzZWQtdGltZSAuYmFyXCIsICR1aVtcImV2b2x1Y2FvXCJdKS5jc3MoXCJ3aWR0aFwiLCBVSS5kYXRhW1wid2luZG93XCJdW1wid2lkdGhcIl0pO1xuXG5cdFx0XHRsZXQgbGFyZ3VyYV9kYV9iYXJyYSA9IChwZXJjZW50dWFsX3RyYW5zY29ycmlkbyAqIDEwMCkudG9GaXhlZCgzKTtcblx0XHRcdCQoXCIuZWxhcHNlZC10aW1lXCIsICR1aVtcImV2b2x1Y2FvXCJdKS5jc3MoXCJ3aWR0aFwiLCBsYXJndXJhX2RhX2JhcnJhICsgXCIlXCIpO1xuXHRcdH1cblx0fVxufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGxpc3RhIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5MaXN0YS5sb2FkKClcbi8vIGFwcC5MaXN0YS5sYXlvdXQoKVxuLy8gYXBwLkxpc3RhLnNvcnQoKVxuXG5hcHAuTGlzdGEgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuTGlzdGEuc3RhcnQoKVxuXHRcdHN0YXJ0OiBmdW5jdGlvbigpIHtcblx0XHRcdGxvZyhcImFwcC5MaXN0YS5zdGFydFwiLCBcImluZm9cIik7XG5cblx0XHRcdC8vIHNlIHRpdmVyIHTDrXR1bG8gZXNwZWNpZmljYWRvLCBpbnNlcmUgZWxlXG5cdFx0XHRpZiAoTGlzdGEuRWRpY2FvW1wibWVuc2FnZW1cIl1bXCJ0aXR1bG9cIl0pIHtcblx0XHRcdFx0bGV0IHRpdHVsb19kYV9wYWdpbmEgPSBMaXN0YS5FZGljYW9bXCJtZW5zYWdlbVwiXVtcInRpdHVsb1wiXTtcblx0XHRcdFx0JHVpW1widGl0bGVcIl0uaHRtbCh0aXR1bG9fZGFfcGFnaW5hKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gZGUgdGl2ZXIgbWVuc2FnZW0gZXNwZWNpZmljYWRhLCBpbnNlcmUgZWxhXG5cdFx0XHRpZiAoTGlzdGEuRWRpY2FvW1wibWVuc2FnZW1cIl1bXCJyb2RhcGVcIl0pIHtcblx0XHRcdFx0JChcIi5qcy1tZW5zYWdlbS1maW5hbFwiKS5odG1sKExpc3RhLkVkaWNhb1tcIm1lbnNhZ2VtXCJdW1wicm9kYXBlXCJdKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gZGUgcHJhem8gZGUgcG9zdGFnZW0gZXN0aXZlciBlbmNlcnJhZG8sIGluc2VyZSBjbGFzc2Ugbm8gPGJvZHk+XG5cdFx0XHRpZiAobW9tZW50KCkuaXNBZnRlcihMaXN0YS5FZGljYW9bXCJmaW1cIl0pKSB7XG5cdFx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJwb3N0YWdlbnMtZW5jZXJyYWRhc1wiKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gdGlyYSBhIHRlbGEgZGUgbG9hZGluZ1xuXHRcdFx0VUkubG9hZGJhci5oaWRlKCk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxpc3RhLmxvYWQoKVxuXHRcdGxvYWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gbW9zdHJhIGEgdGVsYSBkZSBsb2FkaW5nIGUgbGltcGEgbyBzdHJlYW1cblx0XHRcdCRzdHJlYW0ubG9hZGluZy5hZGRDbGFzcyhcImZhZGUtaW4gaW5cIik7XG5cblx0XHRcdC8vIGNhcnJlZ2Egb3MgZGFkb3MgZGEgQVBJXG5cdFx0XHQkLmdldEpTT04oXCJodHRwczovL2FwaS5sYWd1aW5oby5vcmcvbGlzdGEvXCIgKyBlZGljYW8gKyBcIi90dWRvP2tleT1cIiArIGFwaV9rZXkgKyBcIiZjYWxsYmFjaz0/XCIpLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHQvLyBcIkRJUkVUT1JcIlxuXHRcdFx0XHQvLyBUT0RPIE8gbG9hZCBkZXZlIGZpY2FyIHNlcGFyYWRvIGRvIFN0cmVhbSAodmVyIGlzc3VlICM3KVxuXHRcdFx0XHRMaXN0YS5SZWd1bGFtZW50byA9IGRhdGFbXCJlZGljYW9cIl07XG5cdFx0XHRcdExpc3RhLlRhcmVmYXMgPSBkYXRhW1widGFyZWZhc1wiXTtcblxuXHRcdFx0XHQvLyBTZSB0aXZlciB0w610dWxvIGVzcGVjaWZpY2FkbywgaW5zZXJlIGVsZVxuXHRcdFx0XHRpZiAoZGF0YVtcImVkaWNhb1wiXVtcIm1lbnNhZ2VtXCJdW1widGl0dWxvXCJdKSB7XG5cdFx0XHRcdFx0cGFnZV90aXRsZSA9IGRhdGFbXCJlZGljYW9cIl1bXCJtZW5zYWdlbVwiXVtcInRpdHVsb1wiXTtcblx0XHRcdFx0XHQkKFwiaGVhZCB0aXRsZVwiKS5odG1sKHBhZ2VfdGl0bGUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gU2UgdGl2ZXIgbWVuc2FnZW0gZXNwZWNpZmljYWRhLCBpbnNlcmUgZWxhXG5cdFx0XHRcdGlmIChkYXRhW1wiZWRpY2FvXCJdW1wibWVuc2FnZW1cIl1bXCJyb2RhcGVcIl0pIHtcblx0XHRcdFx0XHQkKFwiLmpzLW1lbnNhZ2VtLWZpbmFsXCIpLmh0bWwoZGF0YVtcImVkaWNhb1wiXVtcIm1lbnNhZ2VtXCJdW1wicm9kYXBlXCJdKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFNlIHByYXpvIGRlIHBvc3RhZ2VtIGVzdGl2ZXIgZW5jZXJyYWRvLCBpbnNlcmUgY2xhc3NlIG5vIDxib2R5PlxuXHRcdFx0XHRpZiAobW9tZW50KCkuaXNBZnRlcihMaXN0YS5SZWd1bGFtZW50b1tcImZpbVwiXSkpIHtcblx0XHRcdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwicG9zdGFnZW5zLWVuY2VycmFkYXNcIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBTZSBhIEVkacOnw6NvIGVzdGl2ZXIgZW5jZXJyYWRhLi4uXG5cdFx0XHRcdGlmIChMaXN0YS5SZWd1bGFtZW50b1tcImVuY2VycmFkYVwiXSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdC8vIC4uLmluc2VyZSBjbGFzc2Ugbm8gPGJvZHk+XG5cdFx0XHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcImVkaWNhby1lbmNlcnJhZGFcIik7XG5cblx0XHRcdFx0XHQvLyAuLi5wYXJhIGRlIGF0dWFsaXphciBhdXRvbWF0aWNhbWVudGVcblx0XHRcdFx0XHRjbGVhckludGVydmFsKHVwZGF0ZV9pbnRlcnZhbCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBGSU0gRE8gXCJESVJFVE9SXCJcblxuXHRcdFx0XHQvLyBMaW1wYSBvIHN0cmVhbSBwYXJhIGNvbWXDp2FyIGRvIHplcm9cblx0XHRcdFx0JHN0cmVhbS5lbXB0eSgpO1xuXG5cdFx0XHRcdC8vIE1vbnRhIHBsYWNhclxuXHRcdFx0XHRhcHAuUGxhY2FyLnVwZGF0ZShkYXRhW1wicGxhY2FyXCJdKTtcblxuXHRcdFx0XHQvLyBJbnNlcmUgb3MgY2FyZHMgZGUgdGFyZWZhc1xuXHRcdFx0XHQkLmVhY2goZGF0YVtcInRhcmVmYXNcIl0sIGZ1bmN0aW9uKGluZGV4LCB0YXJlZmEpIHtcblx0XHRcdFx0XHR0YXJlZmFzW3RhcmVmYVtcIm51bWVyb1wiXV0gPSB0YXJlZmE7XG5cdFx0XHRcdFx0dGFyZWZhW1widXJsXCJdID0gXCIvdGFyZWZhcy9cIiArIHRhcmVmYVtcIm51bWVyb1wiXTtcblx0XHRcdFx0XHR0YXJlZmFbXCJ1cmxcIl0gPSByb3V0ZXJbXCJidWlsZC1saW5rXCJdKFwiL3RhcmVmYXMvXCIgKyB0YXJlZmFbXCJudW1lcm9cIl0pO1xuXG5cdFx0XHRcdFx0aWYgKHRhcmVmYVtcImltYWdlbVwiXSkge1xuXHRcdFx0XHRcdFx0dGFyZWZhW1wiaW1hZ2VtLXVybFwiXSA9IHRhcmVmYVtcImltYWdlbVwiXVtcInVybFwiXTtcblx0XHRcdFx0XHRcdHRhcmVmYVtcImltYWdlbS1hc3BlY3RvXCJdID0gXCJwYWRkaW5nLXRvcDogXCIgKyAodGFyZWZhW1wiaW1hZ2VtXCJdW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHZhciAkY2FyZCA9IF9fcmVuZGVyKFwiY2FyZC10YXJlZmFcIiwgdGFyZWZhKS5kYXRhKHtcblx0XHRcdFx0XHRcdFx0XCJ0YXJlZmFcIjogdGFyZWZhW1wibnVtZXJvXCJdLFxuXHRcdFx0XHRcdFx0XHRcImxhc3QtbW9kaWZpZWRcIjogKHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXT8gbW9tZW50KHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXSkuZm9ybWF0KFwiWFwiKSA6IDApXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGlmICh0YXJlZmFbXCJwcmV2aWV3XCJdKSB7XG5cdFx0XHRcdFx0XHQkY2FyZC5hZGRDbGFzcyhcImZhbnRhc21hXCIpO1xuXHRcdFx0XHRcdFx0JChcImFcIiwgJGNhcmQpLnJlbW92ZUF0dHIoXCJocmVmXCIpO1xuXHRcdFx0XHRcdFx0JChcIi5ib2R5XCIsICRjYXJkKS5yZW1vdmUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIXRhcmVmYVtcImltYWdlbVwiXSkge1xuXHRcdFx0XHRcdFx0JChcIi5tZWRpYVwiLCAkY2FyZCkucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcG9zdHNcblx0XHRcdFx0XHR2YXIgJGdyaWQgPSAkKFwiLmdyaWRcIiwgJGNhcmQpO1xuXG5cdFx0XHRcdFx0aWYgKHRhcmVmYVtcInBvc3RzXCJdICYmIHRhcmVmYVtcInBvc3RzXCJdLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0dmFyIHRvdGFsX3Bvc3RzID0gdGFyZWZhW1wicG9zdHNcIl0ubGVuZ3RoO1xuXHRcdFx0XHRcdFx0Ly8gdmFyIHRvdGFsX21lZGlhID0gdGFyZWZhW1wicG9zdHNcIl0ucmVkdWNlKCh0b3RhbCwgcG9zdCkgPT4gdG90YWwgKyBwb3N0W1wibWlkaWFcIl0ubGVuZ3RoLCAwKTtcblx0XHRcdFx0XHRcdHZhciBtYXhfbWVkaWFfdG9fc2hvdyA9ICh1aVtcImNvbHVtbnNcIl0gPCAyPyA5IDogOCk7XG5cdFx0XHRcdFx0XHR2YXIgc2hvd25fbWVkaWFfY291bnQgPSAwO1xuXG5cdFx0XHRcdFx0XHR2YXIgcG9zdF90eXBlc193aXRoX2ltYWdlX3ByZXZpZXcgPSBbXCJpbWFnZW1cIiwgXCJ5b3V0dWJlXCIsIFwidmltZW9cIiwgXCJ2aW5lXCIsIFwiZ2lmXCJdO1xuXHRcdFx0XHRcdFx0dmFyIHBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXcgPSBbXCJ0ZXh0b1wiXTtcblxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbF9wb3N0czsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBwb3N0ID0gdGFyZWZhW1wicG9zdHNcIl1baV07XG5cblx0XHRcdFx0XHRcdFx0aWYgKChwb3N0W1wibWlkaWFcIl0gfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ0ZXh0b1wiKSAmJiAoc2hvd25fbWVkaWFfY291bnQgPCBtYXhfbWVkaWFfdG9fc2hvdykpIHtcblx0XHRcdFx0XHRcdFx0XHRzaG93bl9tZWRpYV9jb3VudCsrO1xuXG5cdFx0XHRcdFx0XHRcdFx0dmFyIHRpbGVfdHlwZTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgbWVkaWEgPSB7IH07XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBpbWFnZW1cblx0XHRcdFx0XHRcdFx0XHRpZiAocG9zdF90eXBlc193aXRoX2ltYWdlX3ByZXZpZXcuaW5kZXhPZihwb3N0W1widGlwb1wiXSkgPiAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGlsZV90eXBlID0gXCJ0aWxlLWltYWdlXCI7XG5cblx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wiY291bnRcIl0gPSBzaG93bl9tZWRpYV9jb3VudDtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwieW91dHViZVwiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidmltZW9cIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbmVcIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcImdpZlwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wicHJldmlld1wiXSA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCdcIiArIHBvc3RbXCJtaWRpYVwiXVswXVtcInRodW1ibmFpbFwiXSArIFwiJyk7XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wibW9kaWZpZXJcIl0gPSBcInZpZGVvXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHBvc3RbXCJtaWRpYVwiXSAmJiBwb3N0W1wibWlkaWFcIl1bMF0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJwcmV2aWV3XCJdID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJ1wiICsgcG9zdFtcIm1pZGlhXCJdWzBdW1wiY2FtaW5ob1wiXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cG9zdFtcIm1pZGlhXCJdWzBdW1wiYXJxdWl2b3NcIl1bMF0gKyBcIicpO1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZVxuXG5cdFx0XHRcdFx0XHRcdFx0Ly8gdGV4dG9cblx0XHRcdFx0XHRcdFx0XHRpZiAocG9zdF90eXBlc193aXRoX3RleHRfcHJldmlldy5pbmRleE9mKHBvc3RbXCJ0aXBvXCJdKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aWxlX3R5cGUgPSBcInRpbGUtdGV4dFwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWEgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFwicHJldmlld1wiOiBwb3N0W1wibGVnZW5kYVwiXS5zdWJzdHJpbmcoMCwgMTIwKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCJjb3VudFwiOiBzaG93bl9tZWRpYV9jb3VudFxuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoKHNob3duX21lZGlhX2NvdW50ID09PSBtYXhfbWVkaWFfdG9fc2hvdykgJiYgKCh0b3RhbF9wb3N0cyAtIHNob3duX21lZGlhX2NvdW50KSA+IDApKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vZGlmaWVyXCJdID0gXCJtb3JlXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vcmVcIl0gPSBcIismdGhpbnNwO1wiICsgKHRvdGFsX3Bvc3RzIC0gc2hvd25fbWVkaWFfY291bnQgKyAxKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHR2YXIgJHRpbGUgPSBfX3JlbmRlcih0aWxlX3R5cGUsIG1lZGlhKS5hcHBlbmRUbygkZ3JpZCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBzZSBuw6NvIHRpdmVyIG5lbmh1bSBwb3N0LCByZW1vdmUgbyBncmlkXG5cdFx0XHRcdFx0XHQkZ3JpZC5yZW1vdmUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBhdHVhbGl6YSBvIGlzb3RvcGVcblx0XHRcdFx0XHQkc3RyZWFtLmFwcGVuZCgkY2FyZCkuaXNvdG9wZShcImFwcGVuZGVkXCIsICRjYXJkKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gU2UgYSBFZGnDp8OjbyBlc3RpdmVyIGVuY2VycmFkYSwgb3JkZW5hIHBvciBuw7ptZXJvIGRhIHRhcmVmYS5cblx0XHRcdFx0Ly8gU2UgbsOjbywgb3JkZW5hIHBvciBvcmRlbSBkZSBhdHVhbGl6YcOnw6NvXG5cdFx0XHRcdGFwcC5MaXN0YS5sYXlvdXQoKTtcblx0XHRcdFx0YXBwLkxpc3RhLnNvcnQoKExpc3RhLlJlZ3VsYW1lbnRvW1wiZW5jZXJyYWRhXCJdPyBcInRhcmVmYVwiOiBcImRhdGVcIikpO1xuXG5cdFx0XHRcdC8vIHNlIHRpdmVyIHRhcmVmYSBlc3BlY2lmaWNhZGEgbm8gbG9hZCBkYSBww6FnaW5hLCBjYXJyZWdhIGVsYVxuXHRcdFx0XHRpZiAocm91dGVyW1wicGF0aFwiXVsyXSkge1xuXHRcdFx0XHRcdGFwcC5UYXJlZmEub3Blbihyb3V0ZXJbXCJwYXRoXCJdWzJdKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGVzY29uZGUgYSB0ZWxhIGRlIGxvYWRpbmdcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQkc3RyZWFtLmxvYWRpbmdcblx0XHRcdFx0XHRcdC5yZW1vdmVDbGFzcyhcImZhZGUtaW5cIilcblx0XHRcdFx0XHRcdC5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkgeyAkc3RyZWFtLmxvYWRpbmcucmVtb3ZlQ2xhc3MoXCJpblwiKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSwgMTIwMCk7XG5cblx0XHRcdFx0Ly8gZ3VhcmRhIGEgZGF0YSBkYSDDumx0aW1hIGF0dWFsaXphw6fDo28gZSB6ZXJhIG8gY29udGFkb3IgZGUgbm92aWRhZGVzXG5cdFx0XHRcdGxhc3RfdXBkYXRlZCA9IG1vbWVudChkYXRhW1wiZWRpY2FvXCJdW1widWx0aW1hLWF0dWFsaXphY2FvXCJdKTtcblx0XHRcdFx0dXBkYXRlZFtcInRhcmVmYXNcIl0gPSAwOyB1cGRhdGVkW1wicG9zdHNcIl0gPSAwO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdGxheW91dDogZnVuY3Rpb24oKSB7XG5cdFx0XHQkc3RyZWFtLmlzb3RvcGUoXCJyZWxvYWRJdGVtc1wiKTtcblx0XHRcdCRzdHJlYW0uaXNvdG9wZShcImxheW91dFwiKTtcblx0XHR9LFxuXG5cdFx0c29ydDogZnVuY3Rpb24oY3JpdGVyaWEpIHtcblx0XHRcdCRzdHJlYW0uaXNvdG9wZSh7XG5cdFx0XHRcdFwic29ydEJ5XCI6IGNyaXRlcmlhXG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59KSgpO1xuXG4vLyBqUXVlcnlcbnZhciAkc3RyZWFtO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQkc3RyZWFtID0gJChcIi5qcy1hcHAtbGlzdGFcIik7XG5cdC8vICRzdHJlYW0ubG9hZGluZyA9ICQoXCJtYWluIC5sb2FkaW5nXCIpO1xuXG5cdCRzdHJlYW0uaXNvdG9wZSh7XG5cdFx0XCJpdGVtU2VsZWN0b3JcIjogXCIuY2FyZC10YXJlZmFcIixcblx0XHRcInRyYW5zaXRpb25EdXJhdGlvblwiOiBcIi44c1wiLFxuXHRcdFwiZ2V0U29ydERhdGFcIjoge1xuXHRcdFx0XCJkYXRlXCI6IFwiLmxhc3QtbW9kaWZpZWRcIixcblx0XHRcdFwidGFyZWZhXCI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0XHRcdFx0cmV0dXJuIHBhcnNlSW50KCQoZWxlbWVudCkuZGF0YShcInRhcmVmYVwiKSwgMTApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0XCJzb3J0QXNjZW5kaW5nXCI6IHtcblx0XHRcdFwiZGF0ZVwiOiBmYWxzZSxcblx0XHRcdFwidGFyZWZhXCI6IHRydWVcblx0XHR9LFxuXHRcdFwic29ydEJ5XCI6IFtcImRhdGVcIiwgXCJ0YXJlZmFcIl0sXG5cdFx0XCJtYXNvbnJ5XCI6IHtcblx0XHRcdFwiZ3V0dGVyXCI6ICh1aVtcImNvbHVtbnNcIl0gPT09IDE/IDggOiAxNilcblx0XHR9XG5cdH0pO1xuXG5cdCRzdHJlYW0ub24oXCJjbGlja1wiLCBcIi5jYXJkLXRhcmVmYTpub3QoLmZhbnRhc21hKVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmIChldmVudC53aGljaCA9PT0gMSkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0dmFyIG51bWVybyA9ICQodGhpcykuZGF0YShcInRhcmVmYVwiKTtcblx0XHRcdGFwcC5UYXJlZmEub3BlbihudW1lcm8sIHRydWUpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gYXBwLkxpc3RhLmxvYWQoKTtcblxuXHQvLyBvcmRlbmHDp8Ojb1xuXHQkdWlbXCJzaWRlbmF2XCJdLm9uKFwiY2xpY2tcIiwgXCIuanMtc3RyZWFtLXNvcnQgYVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgY3JpdGVyaWEgPSAkKHRoaXMpLmRhdGEoXCJzb3J0LWJ5XCIpO1xuXHRcdCQoXCIuanMtc3RyZWFtLXNvcnQgYVwiLCAkdWlbXCJzaWRlbmF2XCJdKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcblx0XHQkKHRoaXMpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuXG5cdFx0YXBwLkxpc3RhLnNvcnQoY3JpdGVyaWEpO1xuXHRcdFVJLnNpZGVuYXYuY2xvc2UoKTtcblx0fSk7XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHRhcmVmYSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5UYXJlZmEub3BlbigpXG4vLyBhcHAuVGFyZWZhLnJlbmRlcigpXG4vLyBhcHAuVGFyZWZhLmNsb3NlKClcblxuYXBwLlRhcmVmYSA9IChmdW5jdGlvbigpIHtcblx0dmFyIHBsYWNhcl9kYV90YXJlZmEgPSBbIF07XG5cblx0ZnVuY3Rpb24gcmVuZGVyUG9zdHMocG9zdHMsICRwb3N0cykge1xuXHRcdHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSA9IDA7XG5cdFx0Zm9yICh2YXIgdHVybWEgaW4gTGlzdGEuUmVndWxhbWVudG9bXCJ0dXJtYXNcIl0pIHtcblx0XHRcdHBsYWNhcl9kYV90YXJlZmFbTGlzdGEuUmVndWxhbWVudG9bXCJ0dXJtYXNcIl1bdHVybWFdXSA9IDA7XG5cdFx0fVxuXG5cdFx0JC5lYWNoKHBvc3RzLCBmdW5jdGlvbihpbmRleCwgcG9zdCkge1xuXHRcdFx0cG9zdFtcImRhdGEtZGUtcG9zdGFnZW0tZm9ybWF0YWRhXCJdID0gbW9tZW50KHBvc3RbXCJkYXRhLWRlLXBvc3RhZ2VtXCJdKS5jYWxlbmRhcigpO1xuXHRcdFx0cG9zdFtcInR1cm1hLWZvcm1hdGFkYVwiXSA9IHBvc3RbXCJ0dXJtYVwiXS50b1VwcGVyQ2FzZSgpO1xuXG5cdFx0XHQvLyBhdmFsaWHDp8Ojb1xuXHRcdFx0aWYgKHBvc3RbXCJhdmFsaWFjYW9cIl0pIHtcblx0XHRcdFx0aWYgKHBvc3RbXCJhdmFsaWFjYW9cIl1bXCJzdGF0dXNcIl0gPT09IDIwMCkge1xuXHRcdFx0XHRcdHBvc3RbXCJzdGF0dXMtY2xhc3NcIl0gPSBwb3N0W1widHVybWFcIl07XG5cdFx0XHRcdFx0cG9zdFtcInN0YXR1cy1pY29uXCJdID0gXCI8aSBjbGFzcz1cXFwibWF0ZXJpYWwtaWNvbnNcXFwiPiYjeEU4N0Q7PC9pPlwiOyAvLyBjb3Jhw6fDo29cblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzXCJdID0gcG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXSArIFwiIHBvbnRvXCIgKyAocG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXSA+IDE/IFwic1wiOiBcIlwiKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzLWNsYXNzXCJdID0gXCJyZWplY3RlZFwiO1xuXHRcdFx0XHRcdHBvc3RbXCJzdGF0dXMtaWNvblwiXSA9IFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj4mI3hFODg4OzwvaT5cIjtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzXCJdID0gXCJSZXByb3ZhZG9cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRwb3N0W1wibWVuc2FnZW1cIl0gPSBwb3N0W1wiYXZhbGlhY2FvXCJdW1wibWVuc2FnZW1cIl07XG5cblx0XHRcdFx0Ly8gc29tYSBwb250b3Mgbm8gcGxhY2FyXG5cdFx0XHRcdHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSArPSBwb3N0W1wiYXZhbGlhY2FvXCJdW1wicG9udG9zXCJdO1xuXHRcdFx0XHRwbGFjYXJfZGFfdGFyZWZhW3Bvc3RbXCJ0dXJtYVwiXV0gKz0gcG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBvc3RbXCJzdGF0dXMtaWNvblwiXSA9IFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj4mI3hFOEI1OzwvaT5cIjsgLy8gcmVsw7NnaW9cblx0XHRcdFx0cG9zdFtcInN0YXR1c1wiXSA9IFwiQWd1YXJkYW5kbyBhdmFsaWHDp8Ojb1wiO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBsZWdlbmRhXG5cdFx0XHRpZiAocG9zdFtcImxlZ2VuZGFcIl0gJiYgcG9zdFtcImxlZ2VuZGFcIl0uc3Vic3RyaW5nKDAsMykgIT0gXCI8cD5cIikge1xuXHRcdFx0XHRwb3N0W1wibGVnZW5kYVwiXSA9IFwiPHA+XCIgKyBwb3N0W1wibGVnZW5kYVwiXS5yZXBsYWNlKC8oPzpcXHJcXG5cXHJcXG58XFxyXFxyfFxcblxcbikvZywgXCI8L3A+PHA+XCIpICsgXCI8L3A+XCI7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHJlbmRlcml6YSBvIHBvc3Rcblx0XHRcdHZhciAkcG9zdF9jYXJkID0gX19yZW5kZXIoXCJ2aWV3LXRhcmVmYS1wb3N0LWNhcmRcIiwgcG9zdCk7XG5cdFx0XHR2YXIgJG1lZGlhID0gJChcIi5wb3N0LW1lZGlhID4gdWxcIiwgJHBvc3RfY2FyZCk7XG5cblx0XHRcdC8vIGFkaWNpb25hIG3DrWRpYXNcblx0XHRcdGlmIChwb3N0W1wibWlkaWFcIl0pIHtcblx0XHRcdFx0JC5lYWNoKHBvc3RbXCJtaWRpYVwiXSwgZnVuY3Rpb24oaW5kZXgsIG1lZGlhKSB7XG5cdFx0XHRcdFx0Ly8gaW1hZ2VtXG5cdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwiaW1hZ2VtXCIpIHtcblx0XHRcdFx0XHRcdG1lZGlhW1wiZGVmYXVsdFwiXSA9IG1lZGlhW1wiY2FtaW5ob1wiXSArIG1lZGlhW1wiYXJxdWl2b3NcIl1bMV07XG5cdFx0XHRcdFx0XHRtZWRpYVtcInBhZGRpbmctYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKG1lZGlhW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0XHRcdFx0bWVkaWFbXCJsaW5rLW9yaWdpbmFsXCJdID0gbWVkaWFbXCJjYW1pbmhvXCJdICsgbWVkaWFbXCJhcnF1aXZvc1wiXVsyXTtcblx0XHRcdFx0XHRcdHZhciAkaW1hZ2UgPSBfX3JlbmRlcihcIm1lZGlhLXBob3RvXCIsIG1lZGlhKTtcblx0XHRcdFx0XHRcdCRtZWRpYS5hcHBlbmQoJGltYWdlKTtcblx0XHRcdFx0XHR9IGVsc2VcblxuXHRcdFx0XHRcdC8vIGVtYmVkXG5cdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwieW91dHViZVwiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidmltZW9cIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbmVcIikge1xuXHRcdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwieW91dHViZVwiKSB7XG5cdFx0XHRcdFx0XHRcdG1lZGlhW1wiZW1iZWRcIl0gPSBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL1wiICsgbWVkaWFbXCJ5b3V0dWJlLWlkXCJdICsgXCI/cmVsPTAmYW1wO3Nob3dpbmZvPTBcIjtcblx0XHRcdFx0XHRcdH0gZWxzZVxuXG5cdFx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ2aW1lb1wiKSB7XG5cdFx0XHRcdFx0XHRcdG1lZGlhW1wiZW1iZWRcIl0gPSBcImh0dHBzOi8vcGxheWVyLnZpbWVvLmNvbS92aWRlby9cIiArIG1lZGlhW1widmltZW8taWRcIl0gKyBcIj90aXRsZT0wJmJ5bGluZT0wJnBvcnRyYWl0PTBcIjtcblx0XHRcdFx0XHRcdH0gZWxzZVxuXG5cdFx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ2aW5lXCIpIHtcblx0XHRcdFx0XHRcdFx0bWVkaWFbXCJlbWJlZFwiXSA9IFwiaHR0cHM6Ly92aW5lLmNvL3YvXCIgKyBtZWRpYVtcInZpbmUtaWRcIl0gKyBcIi9lbWJlZC9zaW1wbGVcIjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bWVkaWFbXCJwYWRkaW5nLWFzcGVjdG9cIl0gPSBcInBhZGRpbmctdG9wOiBcIiArIChtZWRpYVtcImFzcGVjdG9cIl0gKiAxMDApLnRvRml4ZWQoMikgKyBcIiVcIjtcblx0XHRcdFx0XHRcdHZhciAkZW1iZWQgPSBfX3JlbmRlcihcIm1lZGlhLXZpZGVvXCIsIG1lZGlhKTtcblx0XHRcdFx0XHRcdCRtZWRpYS5hcHBlbmQoJGVtYmVkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB0aXJhIGxlZ2VuZGEgc2UgbsOjbyB0aXZlclxuXHRcdFx0aWYgKCFwb3N0W1wibGVnZW5kYVwiXSkge1xuXHRcdFx0XHQkcG9zdF9jYXJkLmFkZENsYXNzKFwibm8tY2FwdGlvblwiKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFwb3N0W1wibWVkaWFcIl0pIHtcblx0XHRcdFx0JHBvc3RfY2FyZC5hZGRDbGFzcyhcIm5vLW1lZGlhXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB0aXJhIG1lbnNhZ2VtIGRlIGF2YWxpYcOnw6NvIHNlIG7Do28gdGl2ZXJcblx0XHRcdGlmICghcG9zdFtcImF2YWxpYWNhb1wiXSB8fCAhcG9zdFtcIm1lbnNhZ2VtXCJdKSB7XG5cdFx0XHRcdCQoXCIucmVzdWx0IC5tZXNzYWdlXCIsICRwb3N0X2NhcmQpLnJlbW92ZSgpO1xuXHRcdFx0fVxuXG5cblx0XHRcdC8vIGFkaWNpb25hIG8gcG9zdCDDoCB0YXJlZmFcblx0XHRcdC8vICRwb3N0cy5hcHBlbmQoJHBvc3RfY2FyZCkuaXNvdG9wZShcImFwcGVuZGVkXCIsICRwb3N0X2NhcmQpO1xuXHRcdFx0JHBvc3RzLmFwcGVuZCgkcG9zdF9jYXJkKTtcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiB7XG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5UYXJlZmEub3BlbigpXG5cdFx0b3BlbjogZnVuY3Rpb24obnVtZXJvLCBwdXNoU3RhdGUpIHtcblx0XHRcdHZhciB0YXJlZmEgPSB0YXJlZmFzW251bWVyb107XG5cdFx0XHR0YXJlZmFfYWN0aXZlID0gbnVtZXJvO1xuXG5cdFx0XHRpZiAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPj0gMykge1xuXHRcdFx0XHQvLyBVSS5iYWNrZHJvcC5zaG93KCRhcHBbXCJ0YXJlZmFcIl0sIHsgXCJoaWRlXCI6IGFwcC5UYXJlZmEuY2xvc2UgfSk7XG5cdFx0XHRcdC8vICR1aVtcImJhY2tkcm9wXCJdWyRhcHBbXCJ0YXJlZmFcIl1dLm9uKFwiaGlkZVwiLCBhcHAuVGFyZWZhLmNsb3NlKTtcblx0XHRcdH1cblxuXHRcdFx0JGFwcFtcInRhcmVmYVwiXS5hZGRDbGFzcyhcImluXCIpO1xuXHRcdFx0YXBwLlRhcmVmYS5yZW5kZXIodGFyZWZhKTtcblxuXHRcdFx0JGFwcFtcInRhcmVmYVwiXS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlLXhcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdC8vXHR2YXIgdmlld190aGVtZV9jb2xvciA9ICQoXCIuYXBwYmFyXCIsICRhcHBbXCJ0YXJlZmFcIl0pLmNzcyhcImJhY2tncm91bmQtY29sb3JcIik7XG5cdFx0XHRcdCQoXCJoZWFkIG1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKS5hdHRyKFwiY29udGVudFwiLCBcIiM1NDZlN2FcIik7XG5cdFx0XHR9KTtcblxuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcIm5vLXNjcm9sbCB0YXJlZmEtYWN0aXZlXCIpO1xuXG5cdFx0XHQvLyByb3V0ZXJcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZXBsYWNlKFwidGFyZWZhXCIpO1xuXHRcdFx0aWYgKHB1c2hTdGF0ZSkgeyByb3V0ZXIuZ28oXCIvdGFyZWZhcy9cIiArIHRhcmVmYVtcIm51bWVyb1wiXSwgeyBcInZpZXdcIjogXCJ0YXJlZmFcIiwgXCJpZFwiOiB0YXJlZmFbXCJudW1lcm9cIl0gfSwgdGFyZWZhW1widGl0dWxvXCJdKTsgfVxuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5UYXJlZmEucmVuZGVyKCkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHRyZW5kZXI6IGZ1bmN0aW9uKHRhcmVmYSkge1xuXHRcdFx0dmFyICR0YXJlZmEgPSBfX3JlbmRlcihcInZpZXctdGFyZWZhXCIsIHRhcmVmYSk7XG5cblx0XHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHRcdC8vIGNhcmQgZGEgdGFyZWZhXG5cdFx0XHRpZiAodGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdHRhcmVmYVtcImltYWdlbVwiXVtcImFzcGVjdG9cIl0gPSBcInBhZGRpbmctdG9wOiBcIiArICh0YXJlZmFbXCJpbWFnZW1cIl1bXCJhc3BlY3RvXCJdICogMTAwKS50b0ZpeGVkKDIpICsgXCIlXCI7XG5cdFx0XHR9XG5cblx0XHRcdHZhciAkdGFyZWZhX2NhcmQgPSBfX3JlbmRlcihcImNhcmQtdGFyZWZhXCIsIHRhcmVmYSk7XG5cblx0XHRcdGlmICghdGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdCQoXCIubWVkaWFcIiwgJHRhcmVmYV9jYXJkKS5yZW1vdmUoKTtcblx0XHRcdH1cblx0XHRcdCQoXCIuZ3JpZFwiLCAkdGFyZWZhX2NhcmQpLnJlbW92ZSgpO1xuXHRcdFx0JChcImFcIiwgJHRhcmVmYV9jYXJkKS5yZW1vdmVBdHRyKFwiaHJlZlwiKTtcblxuXHRcdFx0JChcIi50YXJlZmEtbWV0YSAudGFyZWZhLWNhcmRcIiwgJHRhcmVmYSkuYXBwZW5kKCR0YXJlZmFfY2FyZCk7XG5cblx0XHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHRcdC8vIHBvc3RzXG5cdFx0XHR2YXIgJHBvc3RzID0gJChcIi50YXJlZmEtcG9zdHMgPiB1bFwiLCAkdGFyZWZhKTtcblxuXHRcdFx0aWYgKHRhcmVmYVtcInBvc3RzXCJdLmxlbmd0aCkge1xuXHRcdFx0XHRyZW5kZXJQb3N0cyh0YXJlZmFbXCJwb3N0c1wiXSwgJHBvc3RzKTtcblxuXHRcdFx0XHQkcG9zdHMuaXNvdG9wZSh7XG5cdFx0XHRcdFx0XCJpdGVtU2VsZWN0b3JcIjogXCIucG9zdC1jYXJkXCIsXG5cdFx0XHRcdFx0XCJ0cmFuc2l0aW9uRHVyYXRpb25cIjogMCxcblx0XHRcdFx0XHRcIm1hc29ucnlcIjoge1xuXHRcdFx0XHRcdFx0XCJpc0ZpdFdpZHRoXCI6IHRydWUsXG5cdFx0XHRcdFx0XHRcImd1dHRlclwiOiAodWlbXCJjb2x1bW5zXCJdID09PSAxPyA4IDogMjQpLFxuXHRcdFx0XHRcdC8vXHRcImNvbHVtbldpZHRoXCI6ICh1aVtcImNvbHVtbnNcIl0gPCAxPyAzMDAgOiA0NTApXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQvLyB9KS5vbihcImxheW91dENvbXBsZXRlXCIsIGZ1bmN0aW9uKGV2ZW50LCBwb3N0cykge1xuXHRcdFx0XHQvLyBcdHZhciBwcmV2aW91c19wb3NpdGlvbjtcblx0XHRcdFx0Ly9cblx0XHRcdFx0Ly8gXHRmb3IgKHZhciBwb3N0IGluIHBvc3RzKSB7XG5cdFx0XHRcdC8vIFx0XHR2YXIgJHRoaXMgPSAkKHBvc3RzW3Bvc3RdLmVsZW1lbnQpO1xuXHRcdFx0XHQvLyBcdFx0dmFyIG9mZnNldCA9IHBvc3RzW3Bvc3RdLnBvc2l0aW9uO1xuXHRcdFx0XHQvLyBcdFx0dmFyIHNpZGUgPSAob2Zmc2V0W1wieFwiXSA9PT0gMD8gXCJsZWZ0XCIgOiBcInJpZ2h0XCIpO1xuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdFx0JHRoaXMuYWRkQ2xhc3MoXCJ0aW1lbGluZS1cIiArIHNpZGUpO1xuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdFx0aWYgKG9mZnNldFtcInlcIl0gLSBwcmV2aW91c19wb3NpdGlvbiA8IDEwKSB7XG5cdFx0XHRcdC8vIFx0XHRcdCR0aGlzLmFkZENsYXNzKFwiZXh0cmEtb2Zmc2V0XCIpO1xuXHRcdFx0XHQvLyBcdFx0fVxuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdFx0cHJldmlvdXNfcG9zaXRpb24gPSBvZmZzZXRbXCJ5XCJdO1xuXHRcdFx0XHQvLyBcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoXCI8bGkgLz5cIikuYWRkQ2xhc3MoXCJlbXB0eVwiKS50ZXh0KFwiTmVuaHVtIHBvc3RcIikuYXBwZW5kVG8oJHBvc3RzKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdFx0Ly8gbGF5b3V0XG5cdFx0XHQkYXBwW1widGFyZWZhXCJdLmh0bWwoJHRhcmVmYSk7XG5cblx0XHRcdGlmICh0YXJlZmFbXCJwb3N0c1wiXS5sZW5ndGgpIHtcblx0XHRcdFx0JHBvc3RzLmlzb3RvcGUoXCJsYXlvdXRcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHBsYWNhciBkYSB0YXJlZmFcblx0XHRcdHZhciAkcGxhY2FyX2RhX3RhcmVmYSA9ICQoXCIucGFpbmVsIC5wbGFjYXIgdWxcIiwgJHRhcmVmYSk7XG5cblx0XHRcdCQuZWFjaChMaXN0YS5SZWd1bGFtZW50b1tcInR1cm1hc1wiXSwgZnVuY3Rpb24oaW5kZXgsIHR1cm1hKSB7XG5cdFx0XHRcdHZhciBwb250dWFjYW9fZGFfdHVybWEgPSBbIF07XG5cblx0XHRcdFx0Ly8gY2FsY3VsYSAlIGRhIHR1cm1hIGVtIHJlbGHDp8OjbyBhbyB0b3RhbCBkZSBwb250b3Ncblx0XHRcdFx0dmFyIHBlcmNlbnR1YWxfZGFfdHVybWEgPSAocGxhY2FyX2RhX3RhcmVmYVtcInRvdGFsXCJdID4gMD8gcGxhY2FyX2RhX3RhcmVmYVt0dXJtYV0gLyBwbGFjYXJfZGFfdGFyZWZhW1widG90YWxcIl0gOiAwKTtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1widHVybWFcIl0gPSB0dXJtYTtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1wiYWx0dXJhLWRhLWJhcnJhXCJdID0gXCJoZWlnaHQ6IFwiICsgKHBlcmNlbnR1YWxfZGFfdHVybWEgKiAxMDApLnRvRml4ZWQoMykgKyBcIiVcIjtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1widHVybWEtZm9ybWF0YWRhXCJdID0gdHVybWEudG9VcHBlckNhc2UoKTtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1wicG9udG9zXCJdID0gKHBsYWNhcl9kYV90YXJlZmFbdHVybWFdID4gMD8gcGxhY2FyX2RhX3RhcmVmYVt0dXJtYV0gOiAwKTtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1wicG9udHVhY2FvLWZvcm1hdGFkYVwiXSA9IHBvbnR1YWNhb19kYV90dXJtYVtcInBvbnRvc1wiXS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLlwiKTtcblxuXHRcdFx0XHR2YXIgJHR1cm1hID0gX19yZW5kZXIoXCJwbGFjYXItdHVybWFcIiwgcG9udHVhY2FvX2RhX3R1cm1hKTtcblx0XHRcdFx0JHBsYWNhcl9kYV90YXJlZmEuYXBwZW5kKCR0dXJtYSk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuVGFyZWZhLmNsb3NlKClcblx0XHRjbG9zZTogZnVuY3Rpb24ocHVzaFN0YXRlKSB7XG5cdFx0XHR0YXJlZmFfYWN0aXZlID0gbnVsbDtcblx0XHRcdCQoXCJoZWFkIG1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKS5hdHRyKFwiY29udGVudFwiLCB0aGVtZV9jb2xvcltcIm9yaWdpbmFsXCJdKTtcblxuXHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcIm5vLXNjcm9sbCB0YXJlZmEtYWN0aXZlXCIpO1xuXHRcdFx0JGFwcFtcInRhcmVmYVwiXS5yZW1vdmVDbGFzcyhcInNsaWRlLXhcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGFwcFtcInRhcmVmYVwiXS5yZW1vdmVDbGFzcyhcImluXCIpLmVtcHR5KCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKFVJLmRhdGFbXCJjb2x1bW5zXCJdID49IDMpIHtcblx0XHRcdFx0Ly8gVUkuYmFja2Ryb3AuaGlkZSgkYXBwW1widGFyZWZhXCJdKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcm91dGVyXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0ucmVwbGFjZShcImhvbWVcIik7XG5cdFx0XHRpZiAocHVzaFN0YXRlKSB7IHJvdXRlci5nbyhcIi90YXJlZmFzXCIsIHsgXCJ2aWV3XCI6IFwiaG9tZVwiIH0sIFwiTGlzdGEgZGUgVGFyZWZhc1wiKTsgfVxuXHRcdH1cblx0fTtcbn0pKCk7XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCRhcHBbXCJ0YXJlZmFcIl0gPSAkKFwiLmpzLWFwcC10YXJlZmFcIik7XG5cdCRhcHBbXCJ0YXJlZmFcIl0ub24oXCJjbGlja1wiLCBcIi5qcy10YXJlZmEtY2xvc2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGFwcC5UYXJlZmEuY2xvc2UodHJ1ZSk7XG5cdH0pLm9uKFwiY2xpY2tcIiwgXCIuanMtbmV3LXBvc3QtdHJpZ2dlclwiLCBmdW5jdGlvbigpIHtcblx0XHRVSS5ib3R0b21zaGVldC5vcGVuKCQoXCIubmV3LXBvc3Qtc2hlZXRcIiwgJGFwcFtcInRhcmVmYVwiXSkuY2xvbmUoKS5zaG93KCkpO1xuXHR9KS5vbihcImNsaWNrXCIsIFwiLmNhcmQtdGFyZWZhIGFcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZiAoZXZlbnQud2hpY2ggPT09IDEpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHR9KTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbmV3IHBvc3QgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gKiBhcHAuUG9zdC5hdXRob3JpemUoKVxuLy8gKiBhcHAuUG9zdC5kZWF1dGhvcml6ZSgpXG4vLyAqIGFwcC5Qb3N0LmdldFRodW1ibmFpbCgpXG4vLyAqIGFwcC5Qb3N0Lm9wZW4oKVxuLy8gKiBhcHAuUG9zdC5jbG9zZSgpXG5cbi8vIHRpcG9zIGRlIHBvc3Q6IHBob3RvLCB2aWRlbywgdmluZSwgdGV4dFxuXG5hcHAuUG9zdCA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gTmV3UG9zdC5hdXRob3JpemUoKVxuXHRcdGF1dGhvcml6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBoYWJpbGl0YSBvIGJvdMOjbyBlbnZpYXJcblx0XHRcdCQoXCIuc3VibWl0XCIsICRwb3N0KS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIE5ld1Bvc3QuZGVhdXRob3JpemUoKVxuXHRcdGRlYXV0aG9yaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIGRlc2FiaWxpdGEgbyBib3TDo28gXCJlbnZpYXJcIlxuXHRcdFx0JChcIi5zdWJtaXRcIiwgJHBvc3QpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gTmV3UG9zdC5nZXRUaHVtYm5haWwoKVxuXHRcdGdldFRodW1ibmFpbDogZnVuY3Rpb24odXJsKSB7XG5cdFx0XHQvLyB0ZXN0YSBzZSB1cmxzIHPDo28gZG9zIHByb3ZpZGVyIGFjZWl0b3MgZSByZXNwb25kZSBjb20gaW5mb3JtYcOnw7VlcyBzb2JyZSBvIHbDrWRlbyxcblx0XHRcdC8vIGluY2x1aW5kbyBhIHVybCBkYSBtaW5pYXR1cmFcblx0XHRcdC8vIHByb3ZpZGVycyBhY2VpdG9zOiB5b3V0dWJlLCB2aW1lbywgdmluZVxuXHRcdFx0dmFyIG1lZGlhX2luZm8gPSB7IH07XG5cblx0XHRcdGZ1bmN0aW9uIHNob3dUaHVtYm5haWwobWVkaWFfaW5mbykge1xuXHRcdFx0XHR2YXIgJHRodW1ibmFpbCA9ICQoXCI8aW1nIC8+XCIpLmF0dHIoXCJzcmNcIiwgbWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSk7XG5cdFx0XHRcdCQoXCIuanMtbWVkaWEtcHJvdmlkZXJcIiwgJHBvc3QpLnZhbChtZWRpYV9pbmZvW1wicHJvdmlkZXJcIl0pO1xuXHRcdFx0XHQkKFwiLmpzLW1lZGlhLWlkXCIsICRwb3N0KS52YWwobWVkaWFfaW5mb1tcImlkXCJdKTtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS10aHVtYm5haWxcIiwgJHBvc3QpLnZhbChtZWRpYV9pbmZvW1widGh1bWJuYWlsXCJdKTtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS1wcmV2aWV3XCIsICRwb3N0KS5odG1sKCR0aHVtYm5haWwpLmZhZGVJbigpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB5b3V0dWJlXG5cdFx0XHRpZiAodXJsLm1hdGNoKC8oPzpodHRwcz86XFwvezJ9KT8oPzp3ezN9XFwuKT95b3V0dSg/OmJlKT9cXC4oPzpjb218YmUpKD86XFwvd2F0Y2hcXD92PXxcXC8pKFteXFxzJl0rKS8pKSB7XG5cdFx0XHRcdC8vIGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9NGN0NGVOTXJKbGdcblx0XHRcdFx0dmFyIHlvdXR1YmVfdXJsID0gdXJsLm1hdGNoKC8oPzpodHRwcz86XFwvezJ9KT8oPzp3ezN9XFwuKT95b3V0dSg/OmJlKT9cXC4oPzpjb218YmUpKD86XFwvd2F0Y2hcXD92PXxcXC8pKFteXFxzJl0rKS8pO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1wicHJvdmlkZXJcIl0gPSBcInlvdXR1YmVcIjtcblx0XHRcdFx0bWVkaWFfaW5mb1tcImlkXCJdID0geW91dHViZV91cmxbMV07XG5cdFx0XHQvL1x0bWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSA9IFwiaHR0cHM6Ly9pMS55dGltZy5jb20vdmkvXCIgKyB5b3V0dWJlX3VybFsxXSArIFwiL21heHJlc2RlZmF1bHQuanBnXCI7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJ0aHVtYm5haWxcIl0gPSBcImh0dHBzOi8vaTEueXRpbWcuY29tL3ZpL1wiICsgeW91dHViZV91cmxbMV0gKyBcIi8wLmpwZ1wiO1xuXG5cdFx0XHRcdE5ld1Bvc3QuYXV0aG9yaXplKCk7XG5cdFx0XHRcdHNob3dUaHVtYm5haWwobWVkaWFfaW5mbyk7XG5cdFx0XHR9IGVsc2VcblxuXHRcdFx0Ly8gdmltZW9cblx0XHRcdGlmICh1cmwubWF0Y2goL3ZpbWVvXFwuY29tLykpIHtcblx0XHRcdFx0Ly8gaHR0cHM6Ly92aW1lby5jb20vNjQyNzk2NDlcblx0XHRcdFx0dmFyIHZpbWVvX3VybCA9IHVybC5tYXRjaCgvXFwvXFwvKHd3d1xcLik/dmltZW8uY29tXFwvKFxcZCspKCR8XFwvKS8pO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1wicHJvdmlkZXJcIl0gPSBcInZpbWVvXCI7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJpZFwiXSA9IHZpbWVvX3VybFsyXTtcblxuXHRcdFx0XHQkLmdldEpTT04oXCJodHRwczovL3ZpbWVvLmNvbS9hcGkvdjIvdmlkZW8vXCIgKyB2aW1lb191cmxbMl0gKyBcIi5qc29uP2NhbGxiYWNrPT9cIilcblx0XHRcdFx0XHQuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdFx0bWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSA9IHJlc3BvbnNlWzBdW1widGh1bWJuYWlsX2xhcmdlXCJdO1xuXG5cdFx0XHRcdFx0XHROZXdQb3N0LmF1dGhvcml6ZSgpO1xuXHRcdFx0XHRcdFx0c2hvd1RodW1ibmFpbChtZWRpYV9pbmZvKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZVxuXG5cdFx0XHQvLyB2aW5lXG5cdFx0XHRpZiAodXJsLm1hdGNoKC92aW5lXFwuY28vKSkge1xuXHRcdFx0XHQvLyBodHRwczovL3ZpbmUuY28vdi9lOUlWOU9QbHJuSlxuXHRcdFx0XHR2YXIgdmluZV91cmwgPSB1cmwubWF0Y2goL1xcL1xcLyh3d3dcXC4pP3ZpbmVcXC5jb1xcL3ZcXC8oW15cXHMmXSspKCR8XFwvKS8pO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1wicHJvdmlkZXJcIl0gPSBcInZpbmVcIjtcblx0XHRcdFx0bWVkaWFfaW5mb1tcImlkXCJdID0gdmluZV91cmxbMl07XG5cblx0XHRcdFx0JC5nZXRKU09OKFwiLy9hc3NldHMubGFndWluaG8ub3JnL2hlbHBlcnMvdmluZS10aHVtYm5haWw/aWQ9XCIgKyB2aW5lX3VybFsyXSArIFwiJmNhbGxiYWNrPT9cIilcblx0XHRcdFx0XHQuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdFx0bWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSA9IHJlc3BvbnNlW1widGh1bWJuYWlsXCJdO1xuXG5cdFx0XHRcdFx0XHROZXdQb3N0LmF1dGhvcml6ZSgpO1xuXHRcdFx0XHRcdFx0c2hvd1RodW1ibmFpbChtZWRpYV9pbmZvKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIE5ld1Bvc3Qub3BlbigpXG5cdFx0b3BlbjogZnVuY3Rpb24odHlwZSwgbnVtZXJvKSB7XG5cdFx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdFx0XCJlZGljYW9cIjogTGlzdGEuUmVndWxhbWVudG9bXCJ0aXR1bG9cIl0sXG5cdFx0XHRcdFwibnVtZXJvXCI6IChudW1lcm8gfHwgdGFyZWZhX2FjdGl2ZSksXG5cdFx0XHRcdFwidXNlclwiOiB1c2VyW1wiaWRcIl0sXG5cdFx0XHRcdFwidHVybWFcIjogdXNlcltcInR1cm1hXCJdLFxuXHRcdFx0XHRcInRva2VuXCI6IHVzZXJbXCJ0b2tlblwiXVxuXHRcdFx0fTtcblx0XHRcdHZhciAkbmV3X3Bvc3RfdmlldyA9IF9fcmVuZGVyKFwibmV3LXBvc3QtXCIgKyB0eXBlLCBkYXRhKTtcblxuXHRcdFx0Ly8gZWZlaXRvIGRlIGFiZXJ0dXJhXG5cdFx0XHQvLyBfdmlldy5vcGVuKCRwb3N0LCAkbmV3UG9zdFZpZXcpO1xuXHRcdFx0JHBvc3QuaHRtbCgkbmV3X3Bvc3RfdmlldykuYWRkQ2xhc3MoXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlLXlcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHZpZXdfdGhlbWVfY29sb3IgPSAkKFwiLmFwcGJhclwiLCAkcG9zdCkuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiKTtcblx0XHRcdFx0JChcImhlYWQgbWV0YVtuYW1lPSd0aGVtZS1jb2xvciddXCIpLmF0dHIoXCJjb250ZW50XCIsIHZpZXdfdGhlbWVfY29sb3IpO1xuXHRcdFx0fSk7XG5cblx0XHRcdE5ld1Bvc3QuZGVhdXRob3JpemUoKTtcblxuXHRcdFx0Ly8gYcOnw7VlcyBwYXJhIGZhemVyIHF1YW5kbyBhYnJpciBhIHRlbGEgZGUgZW52aW9cblx0XHRcdC8vIGRlIGFjb3JkbyBjb20gbyB0aXBvIGRlIHBvc3RhZ2VtXG5cdFx0XHRpZiAodHlwZSA9PT0gXCJwaG90b1wiKSB7XG5cdFx0XHRcdCRwb3N0LmRyb3B6b25lKCk7XG5cdFx0XHRcdCQoXCIuZmlsZS1wbGFjZWhvbGRlclwiLCAkcG9zdCkudHJpZ2dlcihcImNsaWNrXCIpO1xuXHRcdFx0Ly9cdCQoXCJmb3JtXCIsICRuZXdfcG9zdF92aWV3KS5kcm9wem9uZSgpO1xuXHRcdFx0fSBlbHNlXG5cblx0XHRcdGlmICh0eXBlID09PSBcInZpZGVvXCIgfHwgdHlwZSA9PT0gXCJ2aW5lXCIpIHtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS11cmwtaW5wdXRcIiwgJHBvc3QpLmZvY3VzKCkub24oXCJrZXl1cFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Ly9cdGlmICgkLmluQXJyYXkoZXZlbnQua2V5Q29kZSwgWzE2LCAxNywgMThdKSkgeyByZXR1cm47IH1cblx0XHRcdFx0XHROZXdQb3N0LmdldFRodW1ibmFpbCgkKHRoaXMpLnZhbCgpKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2VcblxuXHRcdFx0aWYgKHR5cGUgPT09IFwidGV4dFwiKSB7XG5cdFx0XHRcdCQoXCIuanMtY2FwdGlvbi1pbnB1dFwiLCAkcG9zdCkuZm9jdXMoKS5vbihcImtleXVwXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICgkKHRoaXMpLnZhbCgpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdE5ld1Bvc3QuYXV0aG9yaXplKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdE5ld1Bvc3QuZGVhdXRob3JpemUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB2aWV3IG1hbmFnZXJcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZXBsYWNlKFwibmV3LXBvc3RcIik7XG5cdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IFwidmlld1wiOiBcIm5ldy1wb3N0XCIsIFwidHlwZVwiOiB0eXBlLCBcImlkXCI6IGRhdGFbXCJudW1lcm9cIl0gfSwgbnVsbCwgbnVsbCk7XG5cdFx0fSxcblxuXHRcdC8vIHNlbmQ6IGZ1bmN0aW9uKCkge1xuXHRcdC8vXG5cdFx0Ly8gfSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gTmV3UG9zdC5jbG9zZSgpXG5cdFx0Y2xvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdC8vXHR0YXJlZmFfYWN0aXZlID0gbnVsbDtcblx0XHRcdCQoXCJoZWFkIG1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKS5hdHRyKFwiY29udGVudFwiLCB0aGVtZV9jb2xvcltcIm9yaWdpbmFsXCJdKTtcblxuXHRcdFx0JHBvc3QucmVtb3ZlQ2xhc3MoXCJzbGlkZS15XCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRwb3N0LnJlbW92ZUNsYXNzKFwiaW5cIikuZW1wdHkoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0ucmVwbGFjZShcInRhcmVmYVwiKTtcblx0XHR9XG5cdH07XG59KSgpO1xuXG52YXIgcG9zdCA9IE5ld1Bvc3Q7XG5cbi8vIGpRdWVyeVxudmFyICRwb3N0O1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQkcG9zdCA9ICQoXCIjbmV3LXBvc3RcIik7XG5cdCR1aVtcImJvdHRvbXNoZWV0XCJdLm9uKFwiY2xpY2tcIiwgXCIubmV3LXBvc3Qtc2hlZXQgYVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgdHlwZSA9ICQodGhpcykuZGF0YShcInBvc3QtdHlwZVwiKTtcblx0XHRVSS5ib3R0b21zaGVldC5jbG9zZSgpO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRhcHAuUG9zdC5vcGVuKHR5cGUsIHRhcmVmYV9hY3RpdmUpO1xuXHRcdH0sIDYwMCk7XG5cdH0pO1xuXG5cdCRwb3N0Lm9uKFwic3VibWl0XCIsIFwiZm9ybVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH0pLm9uKFwiY2xpY2tcIiwgXCIuc3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmIChtb21lbnQoKS5pc0FmdGVyKExpc3RhLlJlZ3VsYW1lbnRvW1wiZmltXCJdKSkge1xuXHRcdFx0dG9hc3Qub3BlbihcIlBvc3RhZ2VucyBlbmNlcnJhZGFzIVwiKTtcblx0XHR9XG5cblx0XHRpZiAoJCh0aGlzKS5oYXNDbGFzcyhcImRpc2FibGVkXCIpKSB7XG5cdFx0XHQvLyBUT0RPIG1lbGhvcmFyIG1lbnNhZ2VtXG5cdFx0XHR0b2FzdC5vcGVuKFwiRXNwZXJlIG8gZmltIGRvIHVwbG9hZCZoZWxsaXA7XCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBkYXRhID0gJChcImZvcm1cIiwgJHBvc3QpLnNlcmlhbGl6ZSgpO1xuXG5cdFx0JChcIi5zdWJtaXRcIiwgJHBvc3QpLmFkZENsYXNzKFwiZGlzYWJsZWRcIikuaHRtbChcIkVudmlhbmRvJmhlbGxpcDtcIik7XG5cblx0XHQkLnBvc3QoXCIvLS9saXN0YS9ub3ZvXCIsIGRhdGEpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdGlmIChyZXNwb25zZVtcIm1ldGFcIl1bXCJzdGF0dXNcIl0gPT09IDIwMCkge1xuXHRcdFx0XHROZXdQb3N0LmNsb3NlKCk7XG5cdFx0XHRcdGFwcC5UYXJlZmEucmVuZGVyKHJlc3BvbnNlW1wiZGF0YVwiXSk7XG5cdFx0XHRcdFVJLnRvYXN0Lm9wZW4ocmVzcG9uc2VbXCJtZXRhXCJdW1wibWVzc2FnZVwiXSk7XG5cdFx0XHRcdG5hdmlnYXRvci52aWJyYXRlKDgwMCk7XG5cblx0XHRcdFx0dGFyZWZhc1tyZXNwb25zZVtcImRhdGFcIl1bXCJudW1lcm9cIl1dID0gcmVzcG9uc2VbXCJkYXRhXCJdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0VUkudG9hc3Qub3BlbigocmVzcG9uc2VbXCJtZXRhXCJdW1wibWVzc2FnZVwiXT8gcmVzcG9uc2VbXCJtZXRhXCJdW1wibWVzc2FnZVwiXSA6IFwiT2NvcnJldSB1bSBlcnJvLiBUZW50ZSBub3ZhbWVudGVcIikpO1xuXHRcdFx0fVxuXHRcdH0pLmZhaWwoZnVuY3Rpb24oKSB7XG5cdFx0XHR0b2FzdC5vcGVuKFwiT2NvcnJldSB1bSBlcnJvLiBUZW50ZSBub3ZhbWVudGVcIik7XG5cdFx0fSk7XG5cblx0fSkub24oXCJjbGlja1wiLCBcIi5iYWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHROZXdQb3N0LmNsb3NlKCk7XG5cdH0pO1xufSk7XG5cbnZhciBOZXdQb3N0ID0gYXBwLlBvc3Q7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBsb2dpbiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG52YXIgJGxvZ2luO1xuXG52YXIgbG9naW4gPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0Ly9cdGJhY2tkcm9wLnNob3coKTtcblx0XHRcdCRsb2dpbi5hZGRDbGFzcyhcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIik7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwibm8tc2Nyb2xsXCIpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHsgJChcImlucHV0W25hbWU9J2VtYWlsJ11cIiwgJGxvZ2luKS5mb2N1cygpOyB9LCAzMDApO1xuXHRcdH0sXG5cdFx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwibm8tc2Nyb2xsXCIpO1xuXHRcdFx0JGxvZ2luLnJlbW92ZUNsYXNzKFwic2xpZGVcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGxvZ2luLnJlbW92ZUNsYXNzKFwiaW5cIik7XG5cdFx0XHR9KTtcblx0XHQvL1x0YmFja2Ryb3AuaGlkZSgpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCRsb2dpbiA9ICQoXCIjbG9naW5cIik7XG5cdCQoXCIuanMtbG9naW4tdHJpZ2dlclwiLCAkdWlbXCJzaWRlbmF2XCJdKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRzaWRlbmF2LmNsb3NlKCk7XG5cdFx0bG9naW4uc2hvdygpO1xuXHR9KTtcblx0JGxvZ2luLm9uKFwiY2xpY2tcIiwgXCIuYmFja1wiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0bG9naW4uaGlkZSgpO1xuXHR9KS5vbihcInN1Ym1pdFwiLCBcImZvcm1cIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0JC5nZXRKU09OKFwiaHR0cHM6Ly9hcGkubGFndWluaG8ub3JnL2xpc3RhL1wiICsgZWRpY2FvICsgXCIvYXV0aD9rZXk9XCIgKyBhcGlfa2V5ICsgXCImY2FsbGJhY2s9P1wiLCAkKFwiZm9ybVwiLCAkbG9naW4pLnNlcmlhbGl6ZSgpKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRpZihyZXNwb25zZVtcIm1ldGFcIl1bXCJzdGF0dXNcIl0gPT09IDIwMCkge1xuXHRcdFx0XHR1c2VyID0gcmVzcG9uc2VbXCJ1c2VyXCJdO1xuXHRcdFx0XHR1c2VyW1wic2lnbmVkLWluXCJdID0gdHJ1ZTtcblx0XHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyXCIsIEpTT04uc3RyaW5naWZ5KHVzZXIpKTtcblxuXHRcdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwic2lnbmVkLWluIHVzZXItXCIgKyB1c2VyW1widHVybWFcIl0pO1xuXHRcdFx0XHRsb2dpbi5oaWRlKCk7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0VUkudG9hc3Quc2hvdyhcIk9sw6EgXCIgKyB1c2VyW1wibmFtZVwiXSArIFwiIVwiKTtcblx0XHRcdFx0fSwgNTAwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoXCIuZm9ybS1ncm91cFwiLCAkbG9naW4pLmFkZENsYXNzKFwiYW5pbWF0ZWQgc2hha2VcIik7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7ICQoXCIuZm9ybS1ncm91cFwiLCAkbG9naW4pLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgc2hha2VcIik7IH0sIDEwMDApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcblxuXHQkKFwiLmpzLWxvZ291dC10cmlnZ2VyXCIsICR1aVtcInNpZGVuYXZcIl0pLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdCR1aVtcImJvZHlcIl0ucmVtb3ZlQ2xhc3MoXCJzaWduZWQtaW4gdXNlci1cIiArIHVzZXJbXCJ0dXJtYVwiXSk7XG5cblx0XHR1c2VyID0ge1xuXHRcdFx0XCJpZFwiOiBudWxsLFxuXHRcdFx0XCJuYW1lXCI6IG51bGwsXG5cdFx0XHRcImVtYWlsXCI6IG51bGwsXG5cdFx0XHRcInRva2VuXCI6IG51bGwsXG5cdFx0XHRcInR1cm1hXCI6IG51bGwsXG5cdFx0XHRcInNpZ25lZC1pblwiOiBmYWxzZVxuXHRcdH07XG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyXCIsIEpTT04uc3RyaW5naWZ5KHVzZXIpKTtcblxuXHRcdHNpZGVuYXYuY2xvc2UoKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0VUkudG9hc3Quc2hvdyhcIlNlc3PDo28gZW5jZXJyYWRhIVwiKTtcblx0XHR9LCA1MDApO1xuXHR9KTtcbn0pO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciB1c2VyID0ge1xuXHRcImlkXCI6IG51bGwsXG5cdFwibmFtZVwiOiBudWxsLFxuXHRcImVtYWlsXCI6IG51bGwsXG5cdFwidG9rZW5cIjogbnVsbCxcblx0XCJ0dXJtYVwiOiBudWxsLFxuXHRcInNpZ25lZC1pblwiOiBmYWxzZVxufTtcblxuaWYgKGxvY2FsU3RvcmFnZSAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJcIikpIHtcblx0dXNlciA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VyXCIpKTtcblxuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdGlmICh1c2VyW1wiaWRcIl0gIT09IG51bGwpIHtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJzaWduZWQtaW4gdXNlci1cIiArIHVzZXJbXCJ0dXJtYVwiXSk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRVSS50b2FzdC5zaG93KFwiT2zDoSBcIiArIHVzZXJbXCJuYW1lXCJdICsgXCIhXCIpO1xuXHRcdFx0fSwgMzAwMCk7XG5cdFx0fVxuXHR9KTtcbn1cbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGltYWdlIHVwbG9hZCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbnZhciBleGlmX29yaWVudGF0aW9uX3RvX2RlZ3JlZXMgPSB7IDA6IDAsIDE6IDAsIDI6IDAsIDM6IDE4MCwgNDogMCwgNTogMCwgNjogOTAsIDc6IDAsIDg6IDI3MCB9O1xudmFyIGZpbGVfc3RhY2sgPSB7fTtcblxuZnVuY3Rpb24gdXBsb2FkKGZpbGVzKSB7XG5cdEZpbGVBUEkuZmlsdGVyRmlsZXMoZmlsZXMsIGZ1bmN0aW9uKGZpbGUsIGluZm8pIHtcblx0XHRpZigvXmltYWdlLy50ZXN0KGZpbGUudHlwZSkpIHtcblx0XHRcdGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dID0gaW5mbztcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdC8vXHRyZXR1cm4gaW5mby53aWR0aCA+PSAzMjAgJiYgaW5mby5oZWlnaHQgPj0gMjQwO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sIGZ1bmN0aW9uKGZpbGVzLCByZWplY3RlZCkge1xuXHRcdGlmKGZpbGVzLmxlbmd0aCkge1xuXHRcdFx0JChcIi5zdWJtaXRcIiwgJHBvc3QpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG5cblx0XHRcdC8vIHByZXZpZXdcblx0XHRcdEZpbGVBUEkuZWFjaChmaWxlcywgZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0XHR2YXIgZXhpZl9vcmllbnRhdGlvbiA9IGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wiZXhpZlwiXVtcIk9yaWVudGF0aW9uXCJdO1xuXHRcdFx0XHRmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXSA9IHRhcmVmYV9hY3RpdmUgKyBcIi1cIiArIHVzZXJbXCJpZFwiXSArIFwiLVwiICtcblx0XHRcdFx0XHRtb21lbnQoKS5mb3JtYXQoXCJYXCIpICsgXCItXCIgKyByYW5kKDAsIDk5OSkudG9GaXhlZCgwKTtcblxuXHRcdFx0XHRpZihmaWxlW1widHlwZVwiXSA9PSBcImltYWdlL2dpZlwiKSB7XG5cdFx0XHRcdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0XHR2YXIgaW1nID0gJChcIjxpbWcgLz5cIikuYXR0cihcInNyY1wiLCBldmVudC50YXJnZXQucmVzdWx0KTtcblx0XHRcdFx0XHRcdHZhciAkdHJhY2tlciA9ICQoXCI8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJpbWFnZS1vcmRlcltdXFxcIiAvPlwiKS52YWwoZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0pO1xuXG5cdFx0XHRcdFx0XHR2YXIgJHN0YXR1cyA9ICQoXCI8ZGl2IC8+XCIpLmFkZENsYXNzKFwicHJvZ3Jlc3NcIik7XG5cdFx0XHRcdFx0XHQkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcInN0YXR1c1wiKS5odG1sKFwiPHN0cm9uZz5FbnZpYW5kbyZoZWxsaXA7PC9zdHJvbmc+XCIpLmFwcGVuZFRvKCRzdGF0dXMpO1xuXHRcdFx0XHRcdFx0JChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJiYXJcIikuYXBwZW5kVG8oJHN0YXR1cyk7XG5cblx0XHRcdFx0XHRcdHZhciAkcHJldmlldyA9ICQoXCI8bGkgLz5cIikuYXR0cihcImlkXCIsIFwiZmlsZS1cIiArXG5cdFx0XHRcdFx0XHRcdFx0ZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0pLmFwcGVuZCgkdHJhY2tlcikuYXBwZW5kKCRzdGF0dXMpLmFwcGVuZChpbWcpO1xuXHRcdFx0XHRcdFx0JChcIiNkcm9wem9uZSAjYm9hcmRcIikuYXBwZW5kKCRwcmV2aWV3KTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdEZpbGVBUElcblx0XHRcdFx0XHRcdC5JbWFnZShmaWxlKVxuXHRcdFx0XHRcdFx0LnJvdGF0ZShleGlmX29yaWVudGF0aW9uX3RvX2RlZ3JlZXNbZXhpZl9vcmllbnRhdGlvbl0pXG5cdFx0XHRcdFx0XHQucmVzaXplKDYwMCwgMzAwLCBcInByZXZpZXdcIilcblx0XHRcdFx0XHRcdC5nZXQoZnVuY3Rpb24oZXJyLCBpbWcpIHtcblx0XHRcdFx0XHRcdC8vXHQkdHJhY2tlciA9ICQoXCI8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJpbWFnZS1vcmRlcltdXFxcIiAvPlwiKVxuXHRcdFx0XHRcdFx0Ly9cdFx0LnZhbCh0YXJlZmFfYWN0aXZlICsgXCItXCIgKyB1c2VyW1wiaWRcIl0gKyBcIi1cIiArIGZpbGVbXCJuYW1lXCJdKTtcblx0XHRcdFx0XHRcdFx0dmFyICR0cmFja2VyID0gJChcIjxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImltYWdlLW9yZGVyW11cXFwiIC8+XCIpLnZhbChmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXSk7XG5cblx0XHRcdFx0XHRcdFx0dmFyICRzdGF0dXMgPSAkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcInByb2dyZXNzXCIpO1xuXHRcdFx0XHRcdFx0XHQkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcInN0YXR1c1wiKS5odG1sKFwiPHN0cm9uZz5FbnZpYW5kbyZoZWxsaXA7PC9zdHJvbmc+XCIpLmFwcGVuZFRvKCRzdGF0dXMpO1xuXHRcdFx0XHRcdFx0XHQkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcImJhclwiKS5hcHBlbmRUbygkc3RhdHVzKTtcblxuXHRcdFx0XHRcdFx0XHR2YXIgJHByZXZpZXcgPSAkKFwiPGxpIC8+XCIpLmF0dHIoXCJpZFwiLCBcImZpbGUtXCIgK1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0pLmFwcGVuZCgkdHJhY2tlcikuYXBwZW5kKCRzdGF0dXMpLmFwcGVuZChpbWcpO1xuXHRcdFx0XHRcdFx0XHQkKFwiI2Ryb3B6b25lICNib2FyZFwiKS5hcHBlbmQoJHByZXZpZXcpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyB1cGxvYWRcblx0XHRcdGlmKGZpbGVzWzBdW1widHlwZVwiXSA9PSBcImltYWdlL2dpZlwiKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiZ2lmXCIpO1xuXHRcdFx0XHRGaWxlQVBJLnVwbG9hZCh7XG5cdFx0XHRcdFx0dXJsOiBcIi8tL2xpc3RhL25vdm9cIixcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb246IFwidXBsb2FkXCIsXG5cdFx0XHRcdFx0XHRlZGl0aW9uOiBMaXN0YS5SZWd1bGFtZW50b1tcInRpdHVsb1wiXSxcblx0XHRcdFx0XHRcdHRhcmVmYTogdGFyZWZhX2FjdGl2ZSxcblx0XHRcdFx0XHRcdHR1cm1hOiB1c2VyW1widHVybWFcIl0sXG5cdFx0XHRcdFx0XHR1c2VyOiB1c2VyW1wiaWRcIl1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByZXBhcmU6IGZ1bmN0aW9uKGZpbGUsIG9wdGlvbnMpIHtcblx0XHRcdFx0XHRcdG9wdGlvbnMuZGF0YS5yZWYgPSBmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXTtcblx0XHRcdFx0XHRcdGZpbGUucmVmID0gZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl07XG5cdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdGZpbGVzOiBmaWxlcyxcblx0XHRcdFx0XHRmaWxlcHJvZ3Jlc3M6IGZ1bmN0aW9uKGV2ZW50LCBmaWxlLCB4aHIpIHtcblx0XHRcdFx0XHRcdHZhciBwZXJjZW50ID0gKChldmVudFtcImxvYWRlZFwiXSAvIGV2ZW50W1widG90YWxcIl0pICogMTAwKS50b0ZpeGVkKDApLFxuXHRcdFx0XHRcdFx0XHRzdGF0dXMgPSAocGVyY2VudCA8IDEwMD8gXCI8c3Ryb25nPkVudmlhbmRvJmhlbGxpcDs8L3N0cm9uZz4gXCIgK1xuXHRcdFx0XHRcdFx0XHRcdFx0cGVyY2VudCArIFwiJVwiIDogXCI8c3Ryb25nPlByb2Nlc3NhbmRvJmhlbGxpcDs8L3N0cm9uZz5cIik7XG5cblx0XHRcdFx0XHRcdCQoXCIjZmlsZS1cIiArIGZpbGVbXCJyZWZcIl0gKyBcIiAuc3RhdHVzXCIsIFwiI2Ryb3B6b25lXCIpLmh0bWwoc3RhdHVzKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByb2dyZXNzOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdC8vXHR2YXIgcGVyY2VudCA9ICgoZXZlbnRbXCJsb2FkZWRcIl0gLyBldmVudFtcInRvdGFsXCJdKSAqIDEwMCkudG9GaXhlZCgwKSArIFwiJVwiXG5cdFx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKHBlcmNlbnQpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZmlsZWNvbXBsZXRlOiBmdW5jdGlvbihmaWxlLCB4aHIsIG9wdGlvbnMpIHtcblx0XHRcdFx0XHQvL1x0Y29uc29sZS5sb2coZmlsZSwgeGhyLCBvcHRpb25zKTtcblx0XHRcdFx0XHRcdCQoXCIjZmlsZS1cIiArIG9wdGlvbnNbXCJyZWZcIl0gKyBcIiAuc3RhdHVzXCIsIFwiI2Ryb3B6b25lXCIpLmh0bWwoXCI8aSBjbGFzcz1cXFwibWF0ZXJpYWwtaWNvbnNcXFwiPmNoZWNrPC9pPlwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbihlcnIsIHhocikge1xuXHRcdFx0XHRcdFx0JChcIi5zdWJtaXRcIiwgJHBvc3QpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdEZpbGVBUEkudXBsb2FkKHtcblx0XHRcdFx0XHR1cmw6IFwiLy0vbGlzdGEvbm92b1wiLFxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdGFjdGlvbjogXCJ1cGxvYWRcIixcblx0XHRcdFx0XHRcdGVkaXRpb246IExpc3RhLlJlZ3VsYW1lbnRvW1widGl0dWxvXCJdLFxuXHRcdFx0XHRcdFx0dGFyZWZhOiB0YXJlZmFfYWN0aXZlLFxuXHRcdFx0XHRcdFx0dHVybWE6IHVzZXJbXCJ0dXJtYVwiXSxcblx0XHRcdFx0XHRcdHVzZXI6IHVzZXJbXCJpZFwiXVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cHJlcGFyZTogZnVuY3Rpb24oZmlsZSwgb3B0aW9ucykge1xuXHRcdFx0XHRcdFx0b3B0aW9ucy5kYXRhLnJlZiA9IGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdO1xuXHRcdFx0XHRcdFx0ZmlsZS5yZWYgPSBmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXTtcblx0XHRcdFx0XHR9LFxuXG5cdFx0XHRcdFx0aW1hZ2VBdXRvT3JpZW50YXRpb246IHRydWUsXG5cdFx0XHRcdFx0aW1hZ2VUcmFuc2Zvcm06IHtcblx0XHRcdFx0XHRcdG1heFdpZHRoOiAxOTIwLFxuXHRcdFx0XHRcdFx0bWF4SGVpZ2h0OiAxOTIwXG5cdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdGZpbGVzOiBmaWxlcyxcblx0XHRcdFx0XHRmaWxlcHJvZ3Jlc3M6IGZ1bmN0aW9uKGV2ZW50LCBmaWxlLCB4aHIpIHtcblx0XHRcdFx0XHRcdHZhciBwZXJjZW50ID0gKChldmVudFtcImxvYWRlZFwiXSAvIGV2ZW50W1widG90YWxcIl0pICogMTAwKS50b0ZpeGVkKDApLFxuXHRcdFx0XHRcdFx0XHRzdGF0dXMgPSAocGVyY2VudCA8IDEwMD8gXCI8c3Ryb25nPkVudmlhbmRvJmhlbGxpcDs8L3N0cm9uZz4gXCIgK1xuXHRcdFx0XHRcdFx0XHRcdFx0cGVyY2VudCArIFwiJVwiIDogXCI8c3Ryb25nPlByb2Nlc3NhbmRvJmhlbGxpcDs8L3N0cm9uZz5cIik7XG5cblx0XHRcdFx0XHRcdCQoXCIjZmlsZS1cIiArIGZpbGVbXCJyZWZcIl0gKyBcIiAuc3RhdHVzXCIsIFwiI2Ryb3B6b25lXCIpLmh0bWwoc3RhdHVzKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByb2dyZXNzOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdC8vXHR2YXIgcGVyY2VudCA9ICgoZXZlbnRbXCJsb2FkZWRcIl0gLyBldmVudFtcInRvdGFsXCJdKSAqIDEwMCkudG9GaXhlZCgwKSArIFwiJVwiXG5cdFx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKHBlcmNlbnQpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZmlsZWNvbXBsZXRlOiBmdW5jdGlvbihmaWxlLCB4aHIsIG9wdGlvbnMpIHtcblx0XHRcdFx0XHQvL1x0Y29uc29sZS5sb2coZmlsZSwgeGhyLCBvcHRpb25zKTtcblx0XHRcdFx0XHRcdCQoXCIjZmlsZS1cIiArIG9wdGlvbnNbXCJyZWZcIl0gKyBcIiAuc3RhdHVzXCIsIFwiI2Ryb3B6b25lXCIpLmh0bWwoXCI8aSBjbGFzcz1cXFwibWF0ZXJpYWwtaWNvbnNcXFwiPmNoZWNrPC9pPlwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbihlcnIsIHhocikge1xuXHRcdFx0XHRcdFx0JChcIi5zdWJtaXRcIiwgJHBvc3QpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuXG4kLmZuLmRyb3B6b25lID0gZnVuY3Rpb24oKSB7XG5cdC8vIGRyb3B6b25lXG5cdHZhciAkZHJvcHpvbmUgPSAkKFwiI2Ryb3B6b25lXCIsIHRoaXMpO1xuXHRGaWxlQVBJLmV2ZW50LmRuZCgkZHJvcHpvbmVbMF0sIGZ1bmN0aW9uKG92ZXIpIHtcblx0XHRpZihvdmVyKSB7XG5cdFx0XHQkZHJvcHpvbmUuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRkcm9wem9uZS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcblx0XHR9XG5cdH0sIGZ1bmN0aW9uKGZpbGVzKSB7XG5cdFx0dXBsb2FkKGZpbGVzKTtcblx0fSk7XG5cblx0Ly8gbWFudWFsIHNlbGVjdFxuXHR2YXIgJGZpbGVfaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZvcm0tZmlsZVwiKTtcblx0RmlsZUFQSS5ldmVudC5vbigkZmlsZV9pbnB1dCwgXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgZmlsZXMgPSBGaWxlQVBJLmdldEZpbGVzKGV2ZW50KTtcblx0XHR1cGxvYWQoZmlsZXMpO1xuXHR9KTtcblxuXHQvLyByZW9yZGVyXG5cdHZhciAkYm9hcmQgPSAkKFwiI2JvYXJkXCIsIHRoaXMpO1xuXHQkYm9hcmQub24oXCJzbGlwOmJlZm9yZXdhaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZih1aVtcImludGVyYWN0aW9uLXR5cGVcIl0gPT09IFwicG9pbnRlclwiKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fSkub24oXCJzbGlwOmFmdGVyc3dpcGVcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC50YXJnZXQucmVtb3ZlKCk7XG5cdH0pLm9uKFwic2xpcDpyZW9yZGVyXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuXHRcdGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShldmVudC50YXJnZXQsIGV2ZW50LmRldGFpbC5pbnNlcnRCZWZvcmUpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0bmV3IFNsaXAoJGJvYXJkWzBdKTtcbn07XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB3b3JrZXJzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIHN0YXJ0XG53b3JrZXIuU3RhcnQgPSAoZnVuY3Rpb24oKSB7XG5cdHRpbWVvdXRbXCJkZWxheS1zdGFydFwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0bG9nKFwid29ya2VyLlN0YXJ0XCIsIFwiaW5mb1wiKTtcblxuXHRcdGN1ZVtcImxvYWQtZWRpY2FvXCJdID0gJC5EZWZlcnJlZCgpO1xuXHRcdHdvcmtlci5Mb2FkKCk7XG5cblx0XHRjdWVbXCJsb2FkLWVkaWNhb1wiXS5kb25lKGZ1bmN0aW9uKCkge1xuXHRcdFx0dGltZW91dFtcImRlbGF5LWV2b2x1Y2FvXCJdID0gc2V0VGltZW91dChhcHAuRXZvbHVjYW8uc3RhcnQsIDIwMCk7XG5cdFx0fSk7XG5cblx0fSwgMzAwKTtcbn0pKCk7XG5cblxuLy8gbG9hZFxud29ya2VyLkxvYWQgPSAoZnVuY3Rpb24oKSB7XG5cdHRpbWVvdXRbXCJkZWxheS1sb2FkXCJdID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRsb2coXCJ3b3JrZXIuTG9hZFwiLCBcImluZm9cIik7XG5cblx0XHRMaXN0YUFQSShcIi90dWRvXCIpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdGxvZyhcImN1ZVtcXFwibG9hZC1lZGljYW9cXFwiXSB0cmlnZ2VyZWRcIik7XG5cdFx0XHRMaXN0YS5FZGljYW8gPSByZXNwb25zZVtcImVkaWNhb1wiXTtcblx0XHRcdExpc3RhLlBsYWNhciA9IHJlc3BvbnNlW1wicGxhY2FyXCJdO1xuXHRcdFx0TGlzdGEuVGFyZWZhcyA9IHJlc3BvbnNlW1widGFyZWZhc1wiXTtcblx0XHRcdGN1ZVtcImxvYWQtZWRpY2FvXCJdLnJlc29sdmUoKTtcblxuXHRcdFx0dGltZW91dFtcImRlbGF5LWxpc3RhXCJdID0gc2V0VGltZW91dChhcHAuTGlzdGEuc3RhcnQsIDEpO1xuXHRcdFx0Ly8gdGltZW91dFtcImRlbGF5LXBsYWNhclwiXSA9IHNldFRpbWVvdXQoYXBwLlBsYWNhci5zdGFydCwgNDAwKTtcblxuXHRcdFx0Ly8gdmFyIGRhdGEgPSByZXNwb25zZVtcImRhdGFcIl07XG5cdFx0XHQvLyBMaXN0YS5JZGVudGlmaWNhY2FvID0gZGF0YTtcblxuXHRcdH0pO1xuXG5cdFx0d29ya2VyLlVwZGF0ZSgpO1xuXHR9LCAzMDApO1xufSk7XG5cblxuLy8gdXBkYXRlXG53b3JrZXIuVXBkYXRlID0gKGZ1bmN0aW9uKCkge1xuXHRsZXQgdXBkYXRlcyA9IHtcblx0XHRcInRhcmVmYXNcIjogMCxcblx0XHRcInBvc3RzXCI6IDAsXG5cdFx0XCJ0b3RhbFwiOiAwLFxuXHRcdFwibGFzdC11cGRhdGVkXCI6IG51bGxcblx0fTtcblxuXHR0aW1lb3V0W1wiYXRpdmlkYWRlXCJdID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0bG9nKFwid29ya2VyLlVwZGF0ZVwiLCBcImluZm9cIik7XG5cblx0XHRMaXN0YUFQSShcIi9hdGl2aWRhZGVcIikuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0Ly8gY29uZmVyZSBkYXRhIGRlIGNhZGEgYXRpdmlkYWRlIGUgdsOqIHNlIMOpIHBvc3RlcmlvciDDoCDDumx0aW1hIGF0dWFsaXphw6fDo28uXG5cdFx0XHQvLyBzZSBmb3IsIGFkaWNpb25hIMOgIGNvbnRhZ2VtIGRlIG5vdmEgYXRpdmlkYWRlXG5cdFx0XHRmb3IgKGxldCBhdGl2aWRhZGUgb2YgcmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKG1vbWVudChhdGl2aWRhZGVbXCJ0c1wiXSkuaXNBZnRlcih1cGRhdGVzW1wibGFzdC11cGRhdGVkXCJdKSAmJiBhdGl2aWRhZGVbXCJhdXRvclwiXSAhPSB1c2VyW1wiaWRcIl0pIHtcblx0XHRcdFx0XHR1cGRhdGVzW1widG90YWxcIl0rKztcblx0XHRcdFx0XHRpZiAodmFsdWVbXCJhY2FvXCJdID09PSBcIm5vdm8tdGFyZWZhXCIpIHtcblx0XHRcdFx0XHRcdHVwZGF0ZXNbXCJ0YXJlZmFzXCJdKys7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICh2YWx1ZVtcImFjYW9cIl0gPT09IFwibm92by1wb3N0XCIpIHtcblx0XHRcdFx0XHRcdHVwZGF0ZXNbXCJwb3N0c1wiXSsrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBzZSBob3V2ZXIgbm92YSBhdGl2aWRhZGVcblx0XHRcdGlmICh1cGRhdGVzW1widG90YWxcIl0gPiAwKSB7XG5cdFx0XHRcdC8vIG1vbnRhIG8gdGV4dG8gZG8gdG9hc3Rcblx0XHRcdFx0bGV0IHRleHRvID0ge1xuXHRcdFx0XHRcdFwidGFyZWZhc1wiOiB1cGRhdGVzW1widGFyZWZhc1wiXSArIFwiIFwiICsgKHVwZGF0ZXNbXCJ0YXJlZmFzXCJdID4gMT8gXCJub3ZhcyB0YXJlZmFzXCIgOiBcIm5vdmEgdGFyZWZhXCIpLFxuXHRcdFx0XHRcdFwicG9zdHNcIjogdXBkYXRlc1tcInBvc3RzXCJdICsgXCIgXCIgKyAodXBkYXRlc1tcInBvc3RzXCJdID4gMT8gXCJub3ZvcyBwb3N0c1wiIDogXCJub3ZvIHBvc3RcIiksXG5cdFx0XHRcdFx0XCJmaW5hbFwiOiBcIlwiXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0aWYgKHVwZGF0ZXNbXCJ0YXJlZmFzXCJdID4gMCkge1xuXHRcdFx0XHRcdHRleHRvW1wiZmluYWxcIl0gKz0gdGV4dG9bXCJ0YXJlZmFzXCJdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICgodXBkYXRlc1tcInRhcmVmYXNcIl0gPiAwKSAmJiAodXBkYXRlc1tcInBvc3RzXCJdID4gMCkpIHtcblx0XHRcdFx0XHR0ZXh0b1tcImZpbmFsXCJdICs9IFwiIGUgXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHVwZGF0ZXNbXCJwb3N0c1wiXSA+IDApIHtcblx0XHRcdFx0XHR0ZXh0b1tcImZpbmFsXCJdICs9IHRleHRvW1wicG9zdHNcIl07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRVSS50b2FzdC5zaG93KHtcblx0XHRcdFx0XHRcInBlcnNpc3RlbnRcIjogdHJ1ZSxcblx0XHRcdFx0XHRcIm1lc3NhZ2VcIjogdGV4dG9bXCJmaW5hbFwiXSxcblx0XHRcdFx0XHRcImxhYmVsXCI6IFwiQXR1YWxpemFyXCIsXG5cdFx0XHRcdFx0XCJhY3Rpb25cIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR3b3JrZXIuTG9hZCgpO1xuXHRcdFx0XHRcdFx0dXBkYXRlc1tcInRhcmVmYXNcIl0gPSAwO1xuXHRcdFx0XHRcdFx0dXBkYXRlc1tcInBvc3RzXCJdID0gMDtcblx0XHRcdFx0XHRcdHVwZGF0ZXNbXCJ0b3RhbFwiXSA9IDA7XG5cdFx0XHRcdFx0XHQkdWlbXCJwYWdlLXRpdGxlXCJdLmh0bWwoVUkuZGF0YVtcInBhZ2UtdGl0bGVcIl0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gbW9zdHJhIG7Dum1lcm8gZGUgbm92YXMgYXRpdmlkYWRlcyBubyB0w610dWxvXG5cdFx0XHRcdCR1aVtcInRpdGxlXCJdLmh0bWwoXCIoXCIgKyB1cGRhdGVzW1widG90YWxcIl0gKyBcIikgXCIgKyBVSS5kYXRhW1wicGFnZS10aXRsZVwiXSk7XG5cdFx0XHR9XG5cblx0XHRcdHVwZGF0ZXNbXCJsYXN0LXVwZGF0ZWRcIl0gPSAocmVzcG9uc2VbMF0/IG1vbWVudChyZXNwb25zZVswXVtcInRzXCJdKSA6IG1vbWVudCgpKTtcblx0XHR9KTtcblx0fSwgMzAgKiAxMDAwKTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZm9udHMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5XZWJGb250LmxvYWQoe1xuXHR0aW1lb3V0OiAxMDAwMCxcblx0Z29vZ2xlOiB7XG5cdFx0ZmFtaWxpZXM6IFtcblx0XHRcdFwiTWF0ZXJpYWwgSWNvbnNcIixcblx0XHRcdFwiUm9ib3RvOjQwMCw0MDBpdGFsaWMsNTAwOmxhdGluXCIsXG5cdFx0XHRcIlJvYm90bytNb25vOjcwMDpsYXRpblwiLFxuXHRcdFx0XCJMYXRvOjQwMDpsYXRpblwiXG5cdFx0XVxuXHR9LFxuXHQvLyBjdXN0b206IHtcblx0Ly8gXHRmYW1pbGllczogW1xuXHQvLyBcdFx0XCJGb250QXdlc29tZVwiXG5cdC8vIFx0XSwgdXJsczogW1xuXHQvLyBcdFx0XCJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9mb250LWF3ZXNvbWUvNC42LjMvY3NzL2ZvbnQtYXdlc29tZS5taW4uY3NzXCJcblx0Ly8gXHRdXG5cdC8vIH0sXG5cdGFjdGl2ZTogZnVuY3Rpb24oKSB7XG5cdFx0JChmdW5jdGlvbigpIHtcblx0XHRcdGFwcC5MaXN0YS5sYXlvdXQoKTtcblx0XHR9KTtcblx0fVxufSk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBtb21lbnRqcyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbm1vbWVudC5sb2NhbGUoXCJwdC1iclwiLCB7XG5cdFx0XCJtb250aHNcIjogXCJqYW5laXJvX2ZldmVyZWlyb19tYXLDp29fYWJyaWxfbWFpb19qdW5ob19qdWxob19hZ29zdG9fc2V0ZW1icm9fb3V0dWJyb19ub3ZlbWJyb19kZXplbWJyb1wiLnNwbGl0KFwiX1wiKSxcblx0XHRcIm1vbnRoc1Nob3J0XCI6IFwiamFuX2Zldl9tYXJfYWJyX21haV9qdW5fanVsX2Fnb19zZXRfb3V0X25vdl9kZXpcIi5zcGxpdChcIl9cIiksXG5cdFx0XCJ3ZWVrZGF5c1wiOiBcImRvbWluZ29fc2VndW5kYS1mZWlyYV90ZXLDp2EtZmVpcmFfcXVhcnRhLWZlaXJhX3F1aW50YS1mZWlyYV9zZXh0YS1mZWlyYV9zw6FiYWRvXCIuc3BsaXQoXCJfXCIpLFxuXHRcdFwid2Vla2RheXNTaG9ydFwiOiBcImRvbV9zZWdfdGVyX3F1YV9xdWlfc2V4X3PDoWJcIi5zcGxpdChcIl9cIiksXG5cdFx0XCJ3ZWVrZGF5c01pblwiOiBcImRvbV8ywqpfM8KqXzTCql81wqpfNsKqX3PDoWJcIi5zcGxpdChcIl9cIiksXG5cdFx0XCJsb25nRGF0ZUZvcm1hdFwiOiB7XG5cdFx0XHRcIkxUXCI6IFwiSEg6bW1cIixcblx0XHRcdFwiTFRTXCI6IFwiSEg6bW06c3NcIixcblx0XHRcdFwiTFwiOiBcIkREL01NL1lZWVlcIixcblx0XHRcdFwiTExcIjogXCJEIFtkZV0gTU1NTSBbZGVdIFlZWVlcIixcblx0XHRcdFwiTExMXCI6IFwiRCBbZGVdIE1NTU0gW2RlXSBZWVlZIFvDoHNdIEhIOm1tXCIsXG5cdFx0XHRcIkxMTExcIjogXCJkZGRkLCBEIFtkZV0gTU1NTSBbZGVdIFlZWVkgW8Ogc10gSEg6bW1cIlxuXHRcdH0sXG5cdFx0XCJjYWxlbmRhclwiOiB7XG5cdFx0XHRcInNhbWVEYXlcIjogXCJbaG9qZV0gTFRcIixcblx0XHRcdFwibmV4dERheVwiOiBcIlthbWFuaMOjXSBMVFwiLFxuXHRcdFx0XCJuZXh0V2Vla1wiOiBcImRkZGQgTFRcIixcblx0XHRcdFwibGFzdERheVwiOiBcIltvbnRlbV0gTFRcIixcblx0XHRcdFwibGFzdFdlZWtcIjogXCJkZGRkIExUXCIsXG5cdFx0XHRcInNhbWVFbHNlXCI6IFwiTFwiXG5cdFx0fSxcblx0XHRcInJlbGF0aXZlVGltZVwiOiB7XG5cdFx0XHRcImZ1dHVyZVwiOiBcImRhcXVpICVzXCIsXG5cdFx0XHRcInBhc3RcIjogXCIlcyBhdHLDoXNcIixcblx0XHRcdFwic1wiOiBcInBvdWNvcyBzZWd1bmRvc1wiLFxuXHRcdFx0XCJtXCI6IFwidW0gbWludXRvXCIsXG5cdFx0XHRcIm1tXCI6IFwiJWQgbWludXRvc1wiLFxuXHRcdFx0XCJoXCI6IFwidW1hIGhvcmFcIixcblx0XHRcdFwiaGhcIjogXCIlZCBob3Jhc1wiLFxuXHRcdFx0XCJkXCI6IFwidW0gZGlhXCIsXG5cdFx0XHRcImRkXCI6IFwiJWQgZGlhc1wiLFxuXHRcdFx0XCJNXCI6IFwidW0gbcOqc1wiLFxuXHRcdFx0XCJNTVwiOiBcIiVkIG1lc2VzXCIsXG5cdFx0XHRcInlcIjogXCJ1bSBhbm9cIixcblx0XHRcdFwieXlcIjogXCIlZCBhbm9zXCJcblx0XHR9LFxuXHRcdFwib3JkaW5hbFBhcnNlXCI6IC9cXGR7MSwyfcK6Lyxcblx0XHRcIm9yZGluYWxcIjogXCIlZMK6XCJcblx0fSk7XG4iXX0=
