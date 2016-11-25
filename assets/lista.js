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
	$(function () {
		$app["lista"] = $(".app-lista");
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2UuanMiLCJ1dGlsaXRpZXMuanMiLCJ0ZW1wbGF0ZS1lbmdpbmUuanMiLCJyb3V0ZXIuanMiLCJkb2N1bWVudC5qcyIsImJvZHkuanMiLCJsb2FkYmFyLmpzIiwiYmFja2Ryb3AuanMiLCJzaWRlbmF2LmpzIiwiYm90dG9tc2hlZXQuanMiLCJ0b2FzdC5qcyIsImFwaS5qcyIsInBsYWNhci5qcyIsImV2b2x1Y2FvLmpzIiwibGlzdGEuanMiLCJ0YXJlZmEuanMiLCJuZXctcG9zdC5qcyIsImhlbHBlci11c2VyLmpzIiwiaGVscGVyLWltYWdlLXVwbG9hZC5qcyIsIndvcmtlcnMuanMiLCJmb250cy5qcyIsIm1vbWVudC1sb2NhbGUuanMiXSwibmFtZXMiOlsiTGlzdGEiLCJFZGljYW8iLCJQbGFjYXIiLCJUYXJlZmFzIiwiYXBwIiwiJGFwcCIsImN1ZSIsIndvcmtlciIsInRpbWVvdXQiLCJsb2dnaW5nIiwibG9nIiwibWVzc2FnZSIsInR5cGUiLCJjb25zb2xlIiwidWkiLCJSZWd1bGFtZW50byIsInRhcmVmYXMiLCJ0YXJlZmFfYWN0aXZlIiwicmFuZCIsIm1pbiIsIm1heCIsIk1hdGgiLCJyYW5kb20iLCIkdGVtcGxhdGVzIiwiJCIsImVhY2giLCIkdGhpcyIsIm5hbWUiLCJhdHRyIiwiaHRtbCIsInJlbW92ZSIsIl9fcmVuZGVyIiwidGVtcGxhdGUiLCJkYXRhIiwiJHJlbmRlciIsImNsb25lIiwiZm4iLCJmaWxsQmxhbmtzIiwiJGJsYW5rIiwiZmlsbCIsInJ1bGVzIiwic3BsaXQiLCJpIiwibGVuZ3RoIiwicGFpciIsImRlc3QiLCJ0cmltIiwic291cmNlIiwidmFsdWUiLCJqIiwiYWRkQ2xhc3MiLCJ2YWwiLCJpZl9udWxsIiwiaGlkZSIsInJlbW92ZUNsYXNzIiwicmVtb3ZlQXR0ciIsImhhc0NsYXNzIiwicm91dGVyIiwibG9jYXRpb24iLCJwYXRobmFtZSIsImhhc2giLCJwYXRoIiwib2JqZWN0IiwidGl0bGUiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwibGluayIsImFkZCIsInZpZXciLCJwdXNoIiwiZ3JlcCIsInJlcGxhY2UiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJzdGF0ZSIsImluZGV4T2YiLCJib3R0b21zaGVldCIsImNsb3NlIiwicG9zdCIsIlRhcmVmYSIsIm9wZW4iLCJVSSIsIiR1aSIsIm5hdmlnYXRvciIsIm1zTWF4VG91Y2hQb2ludHMiLCJyZWZsb3ciLCJvZmZzZXQiLCJsZWZ0IiwiYm9keSIsImRvY3VtZW50Iiwic2Nyb2xsU3RhdHVzIiwib24iLCJ5Iiwic2Nyb2xsVG9wIiwibG9jayIsInVubG9jayIsImxvYWRiYXIiLCJzaG93Iiwic2V0VGltZW91dCIsIm9uZSIsImJhY2tkcm9wIiwiJHNjcmVlbiIsImV2ZW50cyIsInNjcmVlbiIsInppbmRleCIsImNzcyIsImhhbmRsZXIiLCJ0cmlnZ2VyIiwiYXBwZW5kVG8iLCJvZmYiLCJzaWRlbmF2IiwicHJldmVudERlZmF1bHQiLCIkY29udGVudCIsInRoZW1lX2NvbG9yIiwiJHRoZW1lX2NvbG9yIiwiZW1wdHkiLCJ0b2FzdCIsImNvbmZpZyIsImRpc21pc3MiLCJjbGVhclRpbWVvdXQiLCJhY3Rpb24iLCJjYWxsYmFjayIsInBlcnNpc3RlbnQiLCJzZXRMYXlvdXRQcm9wZXJ0aWVzIiwid2lkdGgiLCJoZWlnaHQiLCJmbG9vciIsImxheW91dF9jbGFzcyIsInNldFNjcm9sbFBvc2l0aW9uIiwiYXBpX2tleSIsIkxpc3RhQVBJIiwiZW5kcG9pbnQiLCJhcGlfdXJsIiwiZWRpY2FvIiwicmVxdWVzdCIsImdldEpTT04iLCJ1cGRhdGUiLCJ0dXJtYXMiLCJtYWlvcl9wb250dWFjYW8iLCJ0b3RhbF9kZV9wb250b3MiLCJ0dXJtYSIsInBvbnR1YWNhb19kYV90dXJtYSIsImluZGV4IiwicGVyY2VudHVhbF9kYV90dXJtYSIsInRvRml4ZWQiLCJ0b1VwcGVyQ2FzZSIsInRvU3RyaW5nIiwiJHR1cm1hIiwiYXBwZW5kIiwicGFyZW50IiwiRXZvbHVjYW8iLCJzdGFydCIsImRpYV9pbmljaWFsIiwibW9tZW50IiwiZGlhX2ZpbmFsIiwiZHVyYWNhb190b3RhbCIsImRpZmYiLCJkaWEiLCJpc0JlZm9yZSIsImluaWNpb19kb19kaWEiLCJmaW5hbF9kb19kaWEiLCJlbmRPZiIsImlzQWZ0ZXIiLCJkdXJhY2FvX2RvX2RpYSIsInBlcmNlbnR1YWxfZG9fZGlhIiwibGFyZ3VyYV9kb19kaWEiLCIkZGlhIiwiZm9ybWF0Iiwic2V0SW50ZXJ2YWwiLCJhZ29yYSIsInRlbXBvX3RyYW5zY29ycmlkbyIsInBlcmNlbnR1YWxfdHJhbnNjb3JyaWRvIiwibGFyZ3VyYV9kYV9iYXJyYSIsInN0YXR1cyIsIm1lc3NhZ2VzIiwiY2xlYXJJbnRlcnZhbCIsInVwZGF0ZV9pbnRlcnZhbCIsInBhZ2VfdGl0bGUiLCJjbG9zaW5nX21lc3NhZ2UiLCJsb2FkIiwiJHN0cmVhbSIsImxvYWRpbmciLCJkb25lIiwidGFyZWZhIiwiJGNhcmQiLCIkZ3JpZCIsInRvdGFsX3Bvc3RzIiwibWF4X21lZGlhX3RvX3Nob3ciLCJzaG93bl9tZWRpYV9jb3VudCIsInBvc3RfdHlwZXNfd2l0aF9pbWFnZV9wcmV2aWV3IiwicG9zdF90eXBlc193aXRoX3RleHRfcHJldmlldyIsInRpbGVfdHlwZSIsIm1lZGlhIiwic3Vic3RyaW5nIiwiJHRpbGUiLCJpc290b3BlIiwibGF5b3V0Iiwic29ydCIsImxhc3RfdXBkYXRlZCIsInVwZGF0ZWQiLCJjcml0ZXJpYSIsImVsZW1lbnQiLCJwYXJzZUludCIsIndoaWNoIiwibnVtZXJvIiwicGxhY2FyX2RhX3RhcmVmYSIsInJlbmRlclBvc3RzIiwicG9zdHMiLCIkcG9zdHMiLCJjYWxlbmRhciIsIiRwb3N0X2NhcmQiLCIkbWVkaWEiLCIkaW1hZ2UiLCIkZW1iZWQiLCJyZW5kZXIiLCJnbyIsIiR0YXJlZmEiLCIkdGFyZWZhX2NhcmQiLCJ0ZXh0IiwiJHBsYWNhcl9kYV90YXJlZmEiLCJQb3N0IiwiYXV0aG9yaXplIiwiJHBvc3QiLCJkZWF1dGhvcml6ZSIsImdldFRodW1ibmFpbCIsInVybCIsIm1lZGlhX2luZm8iLCJzaG93VGh1bWJuYWlsIiwiJHRodW1ibmFpbCIsImZhZGVJbiIsIm1hdGNoIiwieW91dHViZV91cmwiLCJOZXdQb3N0IiwidmltZW9fdXJsIiwicmVzcG9uc2UiLCJ2aW5lX3VybCIsInVzZXIiLCIkbmV3X3Bvc3RfdmlldyIsInZpZXdfdGhlbWVfY29sb3IiLCJkcm9wem9uZSIsImZvY3VzIiwicmVwbGFjZVN0YXRlIiwic2VyaWFsaXplIiwidmlicmF0ZSIsImZhaWwiLCIkbG9naW4iLCJsb2dpbiIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0SXRlbSIsInBhcnNlIiwiZXhpZl9vcmllbnRhdGlvbl90b19kZWdyZWVzIiwiZmlsZV9zdGFjayIsInVwbG9hZCIsImZpbGVzIiwiRmlsZUFQSSIsImZpbHRlckZpbGVzIiwiZmlsZSIsImluZm8iLCJ0ZXN0IiwicmVqZWN0ZWQiLCJleGlmX29yaWVudGF0aW9uIiwicmVhZGVyIiwiRmlsZVJlYWRlciIsIm9ubG9hZCIsImltZyIsInRhcmdldCIsInJlc3VsdCIsIiR0cmFja2VyIiwiJHN0YXR1cyIsIiRwcmV2aWV3IiwicmVhZEFzRGF0YVVSTCIsIkltYWdlIiwicm90YXRlIiwicmVzaXplIiwiZ2V0IiwiZXJyIiwiZWRpdGlvbiIsInByZXBhcmUiLCJvcHRpb25zIiwicmVmIiwiZmlsZXByb2dyZXNzIiwieGhyIiwicGVyY2VudCIsInByb2dyZXNzIiwiZmlsZWNvbXBsZXRlIiwiY29tcGxldGUiLCJpbWFnZUF1dG9PcmllbnRhdGlvbiIsImltYWdlVHJhbnNmb3JtIiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCIkZHJvcHpvbmUiLCJkbmQiLCJvdmVyIiwiJGZpbGVfaW5wdXQiLCJnZXRFbGVtZW50QnlJZCIsImdldEZpbGVzIiwiJGJvYXJkIiwib3JpZ2luYWxFdmVudCIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJkZXRhaWwiLCJTbGlwIiwiU3RhcnQiLCJEZWZlcnJlZCIsIkxvYWQiLCJyZXNvbHZlIiwiVXBkYXRlIiwidXBkYXRlcyIsImF0aXZpZGFkZSIsInRleHRvIiwiV2ViRm9udCIsImdvb2dsZSIsImZhbWlsaWVzIiwiYWN0aXZlIiwibG9jYWxlIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7O0FBRUEsSUFBQUEsUUFBQSxFQUFBO0FBQ0FBLE1BQUFDLE1BQUEsR0FBQSxFQUFBO0FBQ0FELE1BQUFFLE1BQUEsR0FBQSxFQUFBO0FBQ0FGLE1BQUFHLE9BQUEsR0FBQSxFQUFBOztBQUVBLElBQUFDLE1BQUEsRUFBQTtBQUNBLElBQUFDLE9BQUEsRUFBQSxDLENBQUE7O0FBRUE7O0FBRUEsSUFBQUMsTUFBQSxFQUFBO0FBQ0EsSUFBQUMsU0FBQSxFQUFBO0FBQ0EsSUFBQUMsVUFBQSxFQUFBOztBQUVBLElBQUFDLFVBQUEsSUFBQTtBQUNBLElBQUFDLE1BQUEsVUFBQUMsT0FBQSxFQUFBQyxJQUFBLEVBQUE7QUFDQSxLQUFBSCxPQUFBLEVBQUE7QUFDQSxNQUFBLENBQUFHLElBQUEsRUFBQTtBQUNBQyxXQUFBSCxHQUFBLENBQUFDLE9BQUE7QUFDQSxHQUZBLE1BRUE7QUFDQUUsV0FBQUQsSUFBQSxFQUFBRCxPQUFBO0FBQ0E7QUFDQTtBQUNBLENBUkE7O0FBVUE7QUFDQTtBQUNBOztBQUVBOztBQUVBLElBQUFHLEtBQUEsRUFBQTs7QUFFQWQsTUFBQWUsV0FBQSxHQUFBLEVBQUEsQyxDQUFBO0FBQ0E7OztBQUlBO0FBQ0EsSUFBQUMsVUFBQSxFQUFBOztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBQUMsYUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTs7Ozs7Ozs7Ozs7Ozs7QUFlQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FDN0ZBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFNBQUFDLElBQUEsQ0FBQUMsR0FBQSxFQUFBQyxHQUFBLEVBQUE7QUFDQSxRQUFBQyxLQUFBQyxNQUFBLE1BQUFGLE1BQUFELEdBQUEsSUFBQUEsR0FBQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTs7QUFFQSxJQUFBSSxhQUFBLEVBQUE7O0FBRUFDLEVBQUEsWUFBQTtBQUNBQSxHQUFBLFVBQUEsRUFBQUMsSUFBQSxDQUFBLFlBQUE7QUFDQSxNQUFBQyxRQUFBRixFQUFBLElBQUEsQ0FBQTtBQUNBLE1BQUFHLE9BQUFELE1BQUFFLElBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxNQUFBQyxPQUFBSCxNQUFBRyxJQUFBLEVBQUE7O0FBRUFOLGFBQUFJLElBQUEsSUFBQUgsRUFBQUssSUFBQSxDQUFBO0FBQ0FILFFBQUFJLE1BQUE7QUFDQSxFQVBBO0FBUUEsQ0FUQTs7QUFXQSxTQUFBQyxRQUFBLENBQUFDLFFBQUEsRUFBQUMsSUFBQSxFQUFBO0FBQ0EsS0FBQSxDQUFBVixXQUFBUyxRQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsS0FBQTtBQUFBO0FBQ0EsS0FBQUUsVUFBQVgsV0FBQVMsUUFBQSxFQUFBRyxLQUFBLEVBQUE7O0FBRUFELFNBQUFELElBQUEsQ0FBQUEsSUFBQTs7QUFFQVQsR0FBQVksRUFBQSxDQUFBQyxVQUFBLEdBQUEsWUFBQTtBQUNBLE1BQUFDLFNBQUFkLEVBQUEsSUFBQSxDQUFBO0FBQ0EsTUFBQWUsT0FBQUQsT0FBQUwsSUFBQSxDQUFBLE1BQUEsQ0FBQTs7QUFFQSxNQUFBTyxRQUFBRCxLQUFBRSxLQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsT0FBQSxJQUFBQyxJQUFBLENBQUEsRUFBQUEsSUFBQUYsTUFBQUcsTUFBQSxFQUFBRCxHQUFBLEVBQUE7QUFDQSxPQUFBRSxPQUFBSixNQUFBRSxDQUFBLEVBQUFELEtBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxPQUFBSSxPQUFBRCxLQUFBLENBQUEsSUFBQUEsS0FBQSxDQUFBLEVBQUFFLElBQUEsRUFBQSxHQUFBLE1BQUE7QUFDQSxPQUFBQyxTQUFBSCxLQUFBLENBQUEsSUFBQUEsS0FBQSxDQUFBLEVBQUFFLElBQUEsRUFBQSxHQUFBRixLQUFBLENBQUEsQ0FBQTtBQUNBLE9BQUFJLFFBQUFmLEtBQUFjLE1BQUEsQ0FBQTs7QUFFQUEsWUFBQUEsT0FBQU4sS0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLE9BQUFNLE9BQUFKLE1BQUEsR0FBQSxDQUFBLElBQUEsT0FBQUssS0FBQSxLQUFBLFdBQUEsRUFBQTtBQUNBQSxZQUFBZixLQUFBYyxPQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLFNBQUEsSUFBQUUsSUFBQSxDQUFBLEVBQUFBLElBQUFGLE9BQUFKLE1BQUEsRUFBQU0sR0FBQSxFQUFBO0FBQ0FELGFBQUFBLE1BQUFELE9BQUFFLENBQUEsQ0FBQSxDQUFBLEdBQUFELE1BQUFELE9BQUFFLENBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQTtBQUNBO0FBQ0E7O0FBRUEsT0FBQSxPQUFBRCxLQUFBLEtBQUEsV0FBQSxJQUFBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFFBQUFILFNBQUEsT0FBQSxFQUFBO0FBQ0FQLFlBQUFZLFFBQUEsQ0FBQUYsS0FBQTtBQUNBLEtBRkEsTUFFQSxJQUFBSCxTQUFBLE1BQUEsRUFBQTtBQUNBUCxZQUFBVCxJQUFBLENBQUFtQixLQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUFILFNBQUEsT0FBQSxFQUFBO0FBQ0FQLFlBQUFhLEdBQUEsQ0FBQUgsS0FBQTtBQUNBLEtBRkEsTUFFQTtBQUNBVixZQUFBVixJQUFBLENBQUFpQixJQUFBLEVBQUFHLEtBQUE7QUFDQTtBQUNBLElBVkEsTUFVQTtBQUNBLFFBQUFJLFVBQUFkLE9BQUFMLElBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxRQUFBbUIsWUFBQSxNQUFBLEVBQUE7QUFDQWQsWUFBQWUsSUFBQTtBQUNBLEtBRkEsTUFFQSxJQUFBRCxZQUFBLFFBQUEsRUFBQTtBQUNBZCxZQUFBUixNQUFBO0FBQ0E7QUFDQTtBQUNBOztBQUVBUSxTQUNBZ0IsV0FEQSxDQUNBLE1BREEsRUFFQUMsVUFGQSxDQUVBLFdBRkEsRUFHQUEsVUFIQSxDQUdBLGdCQUhBO0FBSUEsRUE1Q0E7O0FBOENBLEtBQUFyQixRQUFBc0IsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBO0FBQ0F0QixVQUFBRyxVQUFBO0FBQ0E7O0FBRUFiLEdBQUEsT0FBQSxFQUFBVSxPQUFBLEVBQUFULElBQUEsQ0FBQSxZQUFBO0FBQ0FELElBQUEsSUFBQSxFQUFBYSxVQUFBO0FBQ0EsRUFGQTs7QUFJQSxRQUFBSCxPQUFBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBLElBQUF1QixTQUFBLEVBQUE7O0FBRUE7QUFDQTtBQUNBQSxPQUFBLE1BQUEsSUFBQUMsU0FBQUMsUUFBQSxDQUFBbEIsS0FBQSxDQUFBLEdBQUEsQ0FBQTs7QUFFQSxJQUFBZ0IsT0FBQSxNQUFBLEVBQUEsQ0FBQSxNQUFBLFNBQUEsRUFBQTtBQUNBQSxRQUFBLGlCQUFBLElBQUEsTUFBQTtBQUNBLENBRkEsTUFFQTtBQUNBQSxRQUFBLGlCQUFBLElBQUEsTUFBQTtBQUNBQSxRQUFBLE1BQUEsSUFBQUMsU0FBQUUsSUFBQSxDQUFBbkIsS0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQWdCLE9BQUEsSUFBQSxJQUFBLFVBQUFJLElBQUEsRUFBQUMsTUFBQSxFQUFBQyxLQUFBLEVBQUE7QUFDQSxLQUFBTixPQUFBLGlCQUFBLE1BQUEsTUFBQSxFQUFBO0FBQ0FPLFVBQUFDLFNBQUEsQ0FBQUgsTUFBQSxFQUFBQyxLQUFBLEVBQUFGLElBQUE7QUFDQSxFQUZBLE1BRUE7QUFDQUcsVUFBQUMsU0FBQSxDQUFBSCxNQUFBLEVBQUFDLEtBQUEsRUFBQSxNQUFBRixJQUFBO0FBQ0E7QUFDQTtBQUNBLENBUEE7O0FBU0E7QUFDQTtBQUNBSixPQUFBLFlBQUEsSUFBQSxVQUFBSSxJQUFBLEVBQUE7QUFDQSxLQUFBSyxJQUFBO0FBQ0EsS0FBQVQsT0FBQSxpQkFBQSxNQUFBLE1BQUEsRUFBQTtBQUNBUyxTQUFBTCxJQUFBO0FBQ0EsRUFGQSxNQUVBO0FBQ0FLLFNBQUEsTUFBQUwsSUFBQTtBQUNBOztBQUVBLFFBQUFLLElBQUE7QUFDQSxDQVRBOztBQVdBO0FBQ0E7QUFDQVQsT0FBQSxjQUFBLElBQUEsQ0FBQSxNQUFBLENBQUE7QUFDQUEsT0FBQSxjQUFBLElBQUEsWUFBQTtBQUNBLFFBQUE7QUFDQVUsT0FBQSxVQUFBQyxJQUFBLEVBQUE7QUFDQVgsVUFBQSxjQUFBLEVBQUFZLElBQUEsQ0FBQUQsSUFBQTtBQUNBO0FBQ0EsR0FKQTtBQUtBdEMsVUFBQSxVQUFBc0MsSUFBQSxFQUFBO0FBQ0FYLFVBQUEsY0FBQSxJQUFBakMsRUFBQThDLElBQUEsQ0FBQWIsT0FBQSxjQUFBLENBQUEsRUFBQSxVQUFBVCxLQUFBLEVBQUE7QUFDQSxXQUFBQSxVQUFBb0IsSUFBQTtBQUNBLElBRkEsQ0FBQTtBQUdBO0FBQ0EsR0FWQTtBQVdBRyxXQUFBLFVBQUFILElBQUEsRUFBQTtBQUNBWCxVQUFBLGNBQUEsSUFBQSxFQUFBO0FBQ0FBLFVBQUEsY0FBQSxFQUFBVSxHQUFBLENBQUFDLElBQUE7QUFDQTtBQWRBLEVBQUE7QUFnQkEsQ0FqQkEsRUFBQTs7QUFtQkE7O0FBRUFJLE9BQUFDLGdCQUFBLENBQUEsVUFBQSxFQUFBLFVBQUFDLEtBQUEsRUFBQTtBQUNBOztBQUVBLEtBQUFDLFFBQUFELE1BQUFDLEtBQUE7O0FBRUEsS0FBQUEsU0FBQUEsTUFBQSxNQUFBLE1BQUEsUUFBQSxFQUFBO0FBQ0EsTUFBQWxCLE9BQUEsY0FBQSxFQUFBbUIsT0FBQSxDQUFBLGFBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUFBQyxlQUFBQyxLQUFBO0FBQUE7QUFDQSxNQUFBckIsT0FBQSxjQUFBLEVBQUFtQixPQUFBLENBQUEsVUFBQSxJQUFBLENBQUEsQ0FBQSxFQUFBO0FBQUFHLFFBQUFELEtBQUE7QUFBQTtBQUNBMUUsTUFBQTRFLE1BQUEsQ0FBQUMsSUFBQSxDQUFBTixNQUFBLElBQUEsQ0FBQTtBQUNBLEVBSkEsTUFNQSxJQUFBQSxTQUFBQSxNQUFBLE1BQUEsTUFBQSxVQUFBLEVBQUE7QUFDQUksT0FBQUUsSUFBQSxDQUFBTixNQUFBLE1BQUEsQ0FBQSxFQUFBQSxNQUFBLElBQUEsQ0FBQTtBQUNBLEVBRkEsTUFJQSxJQUFBQSxTQUFBQSxNQUFBLE1BQUEsTUFBQSxhQUFBLEVBQUE7QUFDQSxNQUFBbEIsT0FBQSxjQUFBLEVBQUFtQixPQUFBLENBQUEsVUFBQSxJQUFBLENBQUEsQ0FBQSxFQUFBO0FBQUFHLFFBQUFELEtBQUE7QUFBQTtBQUNBOztBQUVBO0FBSkEsTUFLQTtBQUNBLE9BQUFyQixPQUFBLGNBQUEsRUFBQW1CLE9BQUEsQ0FBQSxhQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFBQUMsZ0JBQUFDLEtBQUE7QUFBQTtBQUNBLE9BQUFyQixPQUFBLGNBQUEsRUFBQW1CLE9BQUEsQ0FBQSxVQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFBQUcsU0FBQUQsS0FBQTtBQUFBO0FBQ0ExRSxPQUFBNEUsTUFBQSxDQUFBRixLQUFBO0FBQ0E7QUFFQSxDQTFCQTs7QUE0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQSxJQUFBSSxLQUFBLEVBQUE7QUFDQSxJQUFBQyxNQUFBLEVBQUE7O0FBRUFELEdBQUFqRCxJQUFBLEdBQUEsRUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBa0QsSUFBQSxRQUFBLElBQUEzRCxFQUFBZ0QsTUFBQSxDQUFBOztBQUVBaEQsRUFBQSxZQUFBO0FBQ0EyRCxLQUFBLE9BQUEsSUFBQTNELEVBQUEsWUFBQSxDQUFBO0FBQ0EwRCxJQUFBakQsSUFBQSxDQUFBLE9BQUEsSUFBQWtELElBQUEsT0FBQSxFQUFBdEQsSUFBQSxFQUFBOztBQUVBc0QsS0FBQSxhQUFBLElBQUEzRCxFQUFBLDBCQUFBLENBQUE7QUFDQTBELElBQUFqRCxJQUFBLENBQUEsc0JBQUEsSUFBQWtELElBQUEsYUFBQSxFQUFBdkQsSUFBQSxDQUFBLFNBQUEsQ0FBQTtBQUNBLENBTkE7O0FBUUE7QUFDQXNELEdBQUFqRCxJQUFBLENBQUEsa0JBQUEsSUFBQSxrQkFBQXVDLE1BQUEsSUFBQVksVUFBQUMsZ0JBQUEsR0FBQSxPQUFBLEdBQUEsU0FBQTs7QUFHQTtBQUNBO0FBQ0E3RCxFQUFBWSxFQUFBLENBQUFrRCxNQUFBLEdBQUEsWUFBQTtBQUNBLEtBQUFDLFNBQUFKLElBQUEsTUFBQSxFQUFBSSxNQUFBLEdBQUFDLElBQUE7QUFDQSxRQUFBaEUsRUFBQSxJQUFBLENBQUE7QUFDQSxDQUhBOztBQ3REQTtBQUNBO0FBQ0E7O0FBRUEwRCxHQUFBTyxJQUFBLEdBQUEsWUFBQTtBQUNBakUsR0FBQSxZQUFBO0FBQ0EyRCxNQUFBLE1BQUEsSUFBQTNELEVBQUFrRSxTQUFBRCxJQUFBLENBQUE7QUFDQU4sTUFBQSxNQUFBLEVBQUFqQyxRQUFBLENBQUEsUUFBQWdDLEdBQUFqRCxJQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBMEQ7QUFDQSxFQUpBOztBQU1BbkUsR0FBQWdELE1BQUEsRUFBQW9CLEVBQUEsQ0FBQSxRQUFBLEVBQUFELFlBQUE7O0FBRUEsVUFBQUEsWUFBQSxHQUFBO0FBQ0EsTUFBQUUsSUFBQXJFLEVBQUFnRCxNQUFBLEVBQUFzQixTQUFBLEVBQUE7O0FBRUEsTUFBQUQsSUFBQSxDQUFBLEVBQUE7QUFDQVYsT0FBQSxNQUFBLEVBQUE3QixXQUFBLENBQUEsWUFBQTtBQUNBLEdBRkEsTUFFQTtBQUNBNkIsT0FBQSxNQUFBLEVBQUFqQyxRQUFBLENBQUEsWUFBQTtBQUNBOztBQUVBLE1BQUEyQyxJQUFBLEVBQUEsRUFBQTtBQUNBVixPQUFBLE1BQUEsRUFBQWpDLFFBQUEsQ0FBQSxlQUFBLEVBQUFJLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLEdBRkEsTUFFQTtBQUNBNkIsT0FBQSxNQUFBLEVBQUFqQyxRQUFBLENBQUEsZ0JBQUEsRUFBQUksV0FBQSxDQUFBLGVBQUE7QUFDQTtBQUNBOztBQUVBLFFBQUE7QUFDQTtBQUNBO0FBQ0F5QyxRQUFBLFlBQUE7QUFDQVosT0FBQSxNQUFBLEVBQUFqQyxRQUFBLENBQUEsV0FBQTtBQUNBLEdBTEE7O0FBT0E7QUFDQTtBQUNBOEMsVUFBQSxZQUFBO0FBQ0FiLE9BQUEsTUFBQSxFQUFBN0IsV0FBQSxDQUFBLFdBQUE7QUFDQTtBQVhBLEVBQUE7QUFhQSxDQXRDQSxFQUFBOztBQ0pBO0FBQ0E7QUFDQTs7QUFFQTRCLEdBQUFlLE9BQUEsR0FBQSxZQUFBO0FBQ0F6RSxHQUFBLFlBQUE7QUFDQTJELE1BQUEsU0FBQSxJQUFBM0QsRUFBQSxhQUFBLENBQUE7QUFDQSxFQUZBOztBQUlBLFFBQUE7QUFDQTBFLFFBQUEsWUFBQTtBQUNBZixPQUFBLFNBQUEsRUFBQWpDLFFBQUEsQ0FBQSxJQUFBO0FBQ0EsR0FIQTtBQUlBRyxRQUFBLFlBQUE7QUFDQTdDLFdBQUEsY0FBQSxJQUFBMkYsV0FBQSxZQUFBO0FBQ0FoQixRQUFBLFNBQUEsRUFDQTdCLFdBREEsQ0FDQSxTQURBLEVBRUE4QyxHQUZBLENBRUEsZUFGQSxFQUVBLFlBQUE7QUFDQWpCLFNBQUEsU0FBQSxFQUFBN0IsV0FBQSxDQUFBLElBQUE7QUFDQSxLQUpBO0FBS0EsSUFOQSxFQU1BLEdBTkEsQ0FBQTtBQU9BO0FBWkEsRUFBQTtBQWNBLENBbkJBLEVBQUE7O0FDSkE7QUFDQTs7QUFFQTZCLElBQUEsVUFBQSxJQUFBLEVBQUE7O0FBRUFELEdBQUFtQixRQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUE7QUFDQUgsUUFBQSxVQUFBSSxPQUFBLEVBQUFDLE1BQUEsRUFBQTtBQUNBLE9BQUFDLFNBQUFGLFFBQUEsVUFBQSxDQUFBO0FBQ0EsT0FBQUcsU0FBQUgsUUFBQUksR0FBQSxDQUFBLFNBQUEsSUFBQSxDQUFBOztBQUVBdkIsT0FBQSxVQUFBLEVBQUFxQixNQUFBLElBQUF6RSxTQUFBLFVBQUEsQ0FBQTs7QUFFQVAsS0FBQUMsSUFBQSxDQUFBOEUsTUFBQSxFQUFBLFVBQUE3QixLQUFBLEVBQUFpQyxPQUFBLEVBQUE7QUFDQXhCLFFBQUEsVUFBQSxFQUFBcUIsTUFBQSxFQUFBWixFQUFBLENBQUFsQixLQUFBLEVBQUFpQyxPQUFBO0FBQ0EsSUFGQTs7QUFJQXhCLE9BQUEsVUFBQSxFQUFBcUIsTUFBQSxFQUFBRSxHQUFBLENBQUEsU0FBQSxFQUFBRCxNQUFBLEVBQ0FiLEVBREEsQ0FDQSxPQURBLEVBQ0EsWUFBQTtBQUFBcEUsTUFBQSxJQUFBLEVBQUFvRixPQUFBLENBQUEsTUFBQTtBQUFBLElBREEsRUFFQUMsUUFGQSxDQUVBMUIsSUFBQSxNQUFBLENBRkEsRUFHQWpDLFFBSEEsQ0FHQSxJQUhBO0FBSUEsR0FmQTtBQWdCQUcsUUFBQSxVQUFBaUQsT0FBQSxFQUFBO0FBQ0EsT0FBQUUsU0FBQUYsUUFBQSxVQUFBLENBQUE7QUFDQW5CLE9BQUEsVUFBQSxFQUFBcUIsTUFBQSxFQUFBbEQsV0FBQSxDQUFBLElBQUEsRUFBQXdELEdBQUEsQ0FBQSxNQUFBLEVBQUFoRixNQUFBO0FBQ0E7QUFuQkEsRUFBQTtBQXFCQSxDQXRCQSxFQUFBOztBQXdCQU4sRUFBQSxZQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUxBOztBQzdCQTtBQUNBO0FBQ0E7O0FBRUEwRCxHQUFBNkIsT0FBQSxHQUFBLFlBQUE7QUFDQXZGLEdBQUEsWUFBQTtBQUNBMkQsTUFBQSxTQUFBLElBQUEzRCxFQUFBLGdCQUFBLENBQUE7O0FBRUFBLElBQUEscUJBQUEsRUFBQW9FLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQWxCLEtBQUEsRUFBQTtBQUNBQSxTQUFBc0MsY0FBQTtBQUNBOUIsTUFBQTZCLE9BQUEsQ0FBQTlCLElBQUE7QUFDQSxHQUhBO0FBSUEsRUFQQTs7QUFTQSxRQUFBO0FBQ0FBLFFBQUEsWUFBQTtBQUNBQyxNQUFBTyxJQUFBLENBQUFNLElBQUE7QUFDQWIsTUFBQW1CLFFBQUEsQ0FBQUgsSUFBQSxDQUFBZixJQUFBLFNBQUEsQ0FBQSxFQUFBLEVBQUEsUUFBQUQsR0FBQTZCLE9BQUEsQ0FBQWpDLEtBQUEsRUFBQTtBQUNBSyxPQUFBLFNBQUEsRUFBQWpDLFFBQUEsQ0FBQSxJQUFBO0FBQ0EsR0FMQTtBQU1BNEIsU0FBQSxZQUFBO0FBQ0FLLE9BQUEsU0FBQSxFQUFBN0IsV0FBQSxDQUFBLElBQUE7QUFDQTRCLE1BQUFtQixRQUFBLENBQUFoRCxJQUFBLENBQUE4QixJQUFBLFNBQUEsQ0FBQTtBQUNBRCxNQUFBTyxJQUFBLENBQUFPLE1BQUE7QUFDQTtBQVZBLEVBQUE7QUFZQSxDQXRCQSxFQUFBOztBQ0pBO0FBQ0E7QUFDQWQsR0FBQUwsV0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBO0FBQ0FJLFFBQUEsVUFBQWdDLFFBQUEsRUFBQS9ELFFBQUEsRUFBQTtBQUNBZ0MsTUFBQW1CLFFBQUEsQ0FBQUgsSUFBQSxDQUFBZixJQUFBLGFBQUEsQ0FBQSxFQUFBLEVBQUEsUUFBQUQsR0FBQUwsV0FBQSxDQUFBQyxLQUFBLEVBQUE7QUFDQUssT0FBQSxhQUFBLEVBQUF0RCxJQUFBLENBQUFvRixRQUFBLEVBQUEvRCxRQUFBLENBQUEsQ0FBQUEsV0FBQUEsV0FBQSxHQUFBLEdBQUEsRUFBQSxJQUFBLElBQUEsRUFBQW9DLE1BQUEsR0FBQXBDLFFBQUEsQ0FBQSxPQUFBOztBQUVBZ0UsZUFBQSxRQUFBLElBQUFDLGFBQUF2RixJQUFBLENBQUEsU0FBQSxDQUFBO0FBQ0F1RixnQkFBQXZGLElBQUEsQ0FBQSxTQUFBLEVBQUEsTUFBQTs7QUFFQTZCLFVBQUEsY0FBQSxFQUFBVSxHQUFBLENBQUEsYUFBQTtBQUNBSCxXQUFBQyxTQUFBLENBQUEsRUFBQSxRQUFBLGFBQUEsRUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBO0FBQ0EsR0FWQTtBQVdBYSxTQUFBLFlBQUE7QUFDQUssT0FBQSxhQUFBLEVBQUE3QixXQUFBLENBQUEsT0FBQSxFQUFBOEMsR0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0FqQixRQUFBLGFBQUEsRUFBQTdCLFdBQUEsQ0FBQSxJQUFBLEVBQUE4RCxLQUFBLEdBQUF4RixJQUFBLENBQUEsT0FBQSxFQUFBLGtDQUFBO0FBQ0EsSUFGQTs7QUFJQXVGLGdCQUFBdkYsSUFBQSxDQUFBLFNBQUEsRUFBQXNGLFlBQUEsUUFBQSxDQUFBOztBQUVBaEMsTUFBQW1CLFFBQUEsQ0FBQWhELElBQUEsQ0FBQThCLElBQUEsYUFBQSxDQUFBOztBQUVBMUIsVUFBQSxjQUFBLEVBQUEzQixNQUFBLENBQUEsYUFBQTtBQUNBO0FBckJBLEVBQUE7QUF1QkEsQ0F4QkEsRUFBQTs7QUEwQkFOLEVBQUEsWUFBQTtBQUNBMkQsS0FBQSxhQUFBLElBQUEzRCxFQUFBLG9CQUFBLENBQUE7QUFDQSxDQUZBOztBQzVCQTtBQUNBO0FBQ0E7O0FBRUEwRCxHQUFBbUMsS0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBO0FBQ0E7QUFDQW5CLFFBQUEsVUFBQW9CLE1BQUEsRUFBQTtBQUNBLE9BQUEsT0FBQUEsTUFBQSxLQUFBLFFBQUEsRUFBQTtBQUNBbkMsUUFBQWtDLEtBQUEsQ0FBQSxTQUFBLEVBQUF4RixJQUFBLENBQUF5RixPQUFBLFNBQUEsQ0FBQTtBQUNBbkMsUUFBQWtDLEtBQUEsQ0FBQSxRQUFBLEVBQUF4RixJQUFBLENBQUF5RixPQUFBLFFBQUEsSUFBQUEsT0FBQSxRQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0FuQyxRQUFBa0MsS0FBQSxDQUFBbkUsUUFBQSxDQUFBLElBQUEsRUFBQW9DLE1BQUEsR0FBQXBDLFFBQUEsQ0FBQSxPQUFBO0FBQ0FpQyxRQUFBLE1BQUEsRUFBQWpDLFFBQUEsQ0FBQSxjQUFBOztBQUVBOztBQUVBaUMsUUFBQWtDLEtBQUEsQ0FBQXpCLEVBQUEsQ0FBQSxPQUFBLEVBQUFWLEdBQUFtQyxLQUFBLENBQUFFLE9BQUE7QUFDQXBDLFFBQUFrQyxLQUFBLENBQUEsUUFBQSxFQUFBekIsRUFBQSxDQUFBLE9BQUEsRUFBQTBCLE9BQUEsVUFBQSxDQUFBOztBQUVBRSxpQkFBQWhILFFBQUEsT0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQThHLE9BQUEsWUFBQSxDQUFBLEVBQUE7QUFDQW5DLFNBQUFrQyxLQUFBLENBQUEvRCxXQUFBLENBQUEsYUFBQTtBQUNBOUMsYUFBQSxPQUFBLElBQUEyRixXQUFBakIsR0FBQW1DLEtBQUEsQ0FBQUUsT0FBQSxFQUFBRCxPQUFBLFNBQUEsSUFBQUEsT0FBQSxTQUFBLENBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxLQUhBLE1BR0E7QUFDQW5DLFNBQUFrQyxLQUFBLENBQUFuRSxRQUFBLENBQUEsYUFBQTtBQUNBO0FBQ0EsSUFuQkEsTUFtQkE7QUFDQWdDLE9BQUFtQyxLQUFBLENBQUFuQixJQUFBLENBQUE7QUFDQSxnQkFBQW9CO0FBREEsS0FBQTtBQUdBO0FBQ0EsR0EzQkE7O0FBNkJBQyxXQUFBLFlBQUE7QUFDQXBDLE9BQUFrQyxLQUFBLENBQUEvRCxXQUFBLENBQUEsT0FBQSxFQUFBOEMsR0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0FqQixRQUFBLE1BQUEsRUFBQTdCLFdBQUEsQ0FBQSxjQUFBO0FBQ0E2QixRQUFBa0MsS0FBQSxDQUFBL0QsV0FBQSxDQUFBLGdCQUFBOztBQUVBNkIsUUFBQWtDLEtBQUEsQ0FBQSxTQUFBLEVBQUFELEtBQUE7QUFDQWpDLFFBQUFrQyxLQUFBLENBQUEsUUFBQSxFQUFBRCxLQUFBO0FBQ0EsSUFOQTtBQU9BSSxnQkFBQWhILFFBQUEsT0FBQSxDQUFBO0FBQ0EsR0F0Q0E7O0FBd0NBO0FBQ0F5RSxRQUFBLFVBQUF0RSxPQUFBLEVBQUE4RyxNQUFBLEVBQUFDLFFBQUEsRUFBQUMsVUFBQSxFQUFBO0FBQ0E7QUFDQXhDLE9BQUFrQyxLQUFBLENBQUExRyxPQUFBLENBQUFrQixJQUFBLENBQUFsQixPQUFBO0FBQ0F3RSxPQUFBa0MsS0FBQSxDQUFBSSxNQUFBLENBQUE1RixJQUFBLENBQUE0RixTQUFBQSxNQUFBLEdBQUEsRUFBQTtBQUNBdEMsT0FBQWtDLEtBQUEsQ0FBQW5FLFFBQUEsQ0FBQSxJQUFBLEVBQUFvQyxNQUFBLEdBQUFwQyxRQUFBLENBQUEsT0FBQTtBQUNBaUMsT0FBQSxNQUFBLEVBQUFqQyxRQUFBLENBQUEsY0FBQTs7QUFFQTs7QUFFQWlDLE9BQUFrQyxLQUFBLENBQUF6QixFQUFBLENBQUEsT0FBQSxFQUFBeUIsTUFBQXZDLEtBQUE7QUFDQUssT0FBQWtDLEtBQUEsQ0FBQUksTUFBQSxDQUFBN0IsRUFBQSxDQUFBLE9BQUEsRUFBQThCLFFBQUE7O0FBRUFGLGdCQUFBaEgsUUFBQSxPQUFBLENBQUE7QUFDQSxPQUFBLENBQUFtSCxVQUFBLEVBQUE7QUFDQXhDLFFBQUFrQyxLQUFBLENBQUEvRCxXQUFBLENBQUEsYUFBQTtBQUNBOUMsWUFBQSxPQUFBLElBQUEyRixXQUFBa0IsTUFBQXZDLEtBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxJQUhBLE1BR0E7QUFDQUssUUFBQWtDLEtBQUEsQ0FBQW5FLFFBQUEsQ0FBQSxhQUFBO0FBQ0E7QUFDQTtBQTVEQSxFQUFBO0FBOERBLENBL0RBLEVBQUE7O0FBaUVBLElBQUFtRSxRQUFBbkMsR0FBQW1DLEtBQUE7QUFDQUEsTUFBQXZDLEtBQUEsR0FBQUksR0FBQW1DLEtBQUEsQ0FBQUUsT0FBQTs7QUFFQTs7QUFFQTtBQUNBcEMsSUFBQWtDLEtBQUEsR0FBQSxFQUFBOztBQUVBN0YsRUFBQSxZQUFBO0FBQ0EyRCxLQUFBa0MsS0FBQSxHQUFBN0YsRUFBQSxjQUFBLENBQUE7QUFDQTJELEtBQUFrQyxLQUFBLENBQUEsU0FBQSxJQUFBN0YsRUFBQSxnQkFBQSxFQUFBMkQsSUFBQWtDLEtBQUEsQ0FBQTtBQUNBbEMsS0FBQWtDLEtBQUEsQ0FBQSxRQUFBLElBQUE3RixFQUFBLGVBQUEsRUFBQTJELElBQUFrQyxLQUFBLENBQUE7QUFDQSxDQUpBOztBVDdFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQW5DLEdBQUFqRCxJQUFBLENBQUEsUUFBQSxJQUFBLEVBQUE7QUFDQWlELEdBQUFqRCxJQUFBLENBQUEsY0FBQSxJQUFBLEdBQUEsQyxDQUFBOztBQUVBLFNBQUEyRixtQkFBQSxHQUFBO0FBQ0E7QUFDQTFDLElBQUFqRCxJQUFBLENBQUEsUUFBQSxFQUFBLE9BQUEsSUFBQWtELElBQUEsUUFBQSxFQUFBMEMsS0FBQSxFQUFBO0FBQ0EzQyxJQUFBakQsSUFBQSxDQUFBLFFBQUEsRUFBQSxRQUFBLElBQUFrRCxJQUFBLFFBQUEsRUFBQTJDLE1BQUEsRUFBQTs7QUFFQTtBQUNBNUMsSUFBQWpELElBQUEsQ0FBQSxTQUFBLElBQUFaLEtBQUEwRyxLQUFBLENBQUE3QyxHQUFBakQsSUFBQSxDQUFBLFFBQUEsRUFBQSxPQUFBLElBQUFpRCxHQUFBakQsSUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBOztBQUVBO0FBQ0EsS0FBQStGLFlBQUE7QUFDQSxLQUFBOUMsR0FBQWpELElBQUEsQ0FBQSxTQUFBLE1BQUEsQ0FBQSxFQUFBO0FBQ0ErRixpQkFBQSxrQkFBQTtBQUNBLEVBRkEsTUFFQSxJQUFBOUMsR0FBQWpELElBQUEsQ0FBQSxTQUFBLE1BQUEsQ0FBQSxFQUFBO0FBQ0ErRixpQkFBQSxnQkFBQTtBQUNBLEVBRkEsTUFFQTtBQUNBQSxpQkFBQSxpQkFBQTtBQUNBOztBQUVBN0MsS0FBQSxNQUFBLEVBQUE3QixXQUFBLENBQUEsaURBQUEsRUFBQUosUUFBQSxDQUFBOEUsWUFBQTtBQUNBOztBQUVBeEcsRUFBQSxZQUFBO0FBQUFvRztBQUFBLENBQUE7QUFDQXpDLElBQUEsUUFBQSxFQUFBUyxFQUFBLENBQUEsUUFBQSxFQUFBZ0MsbUJBQUE7O0FBR0E7QUFDQTs7QUFFQTtBQUNBMUMsR0FBQWpELElBQUEsQ0FBQSxpQkFBQSxJQUFBLEVBQUE7O0FBRUEsU0FBQWdHLGlCQUFBLEdBQUE7QUFDQS9DLElBQUFqRCxJQUFBLENBQUEsaUJBQUEsRUFBQSxLQUFBLElBQUFrRCxJQUFBLFFBQUEsRUFBQVcsU0FBQSxFQUFBO0FBQ0FaLElBQUFqRCxJQUFBLENBQUEsaUJBQUEsRUFBQSxRQUFBLElBQUFpRCxHQUFBakQsSUFBQSxDQUFBLGlCQUFBLEVBQUEsS0FBQSxJQUFBaUQsR0FBQWpELElBQUEsQ0FBQSxRQUFBLEVBQUEsUUFBQSxDQUFBO0FBQ0E7O0FBRUFULEVBQUEsWUFBQTtBQUFBeUc7QUFBQSxDQUFBO0FBQ0E5QyxJQUFBLFFBQUEsRUFBQVMsRUFBQSxDQUFBLGVBQUEsRUFBQXFDLGlCQUFBOztBQUdBO0FBQ0E7O0FVakRBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLElBQUFDLFVBQUEsa0VBQUE7O0FBRUEsTUFBQUMsV0FBQSxVQUFBQyxRQUFBLEVBQUE7QUFDQTFILEtBQUEsa0JBQUEwSCxRQUFBLEVBQUEsTUFBQTtBQUNBLEtBQUFDLFVBQUEsb0NBQUFDLE1BQUE7QUFDQSxLQUFBSixVQUFBLGtFQUFBOztBQUVBLEtBQUFLLFVBQUEvRyxFQUFBZ0gsT0FBQSxDQUFBSCxVQUFBRCxRQUFBLEdBQUEsT0FBQSxHQUFBRixPQUFBLEdBQUEsYUFBQSxDQUFBO0FBQ0EsUUFBQUssT0FBQTtBQUNBLENBUEE7O0FDUEE7QUFDQTtBQUNBOztBQUVBbkksSUFBQUYsTUFBQSxHQUFBLFlBQUE7QUFDQXNCLEdBQUEsWUFBQTtBQUNBMkQsTUFBQSxRQUFBLElBQUEzRCxFQUFBLHFCQUFBLENBQUE7QUFDQSxFQUZBOztBQUlBLFFBQUE7QUFDQWlILFVBQUEsVUFBQUMsTUFBQSxFQUFBO0FBQ0E7QUFDQTtBQUNBLE9BQUFDLGtCQUFBLENBQUE7QUFDQSxPQUFBQyxrQkFBQSxDQUFBOztBQUVBLFFBQUEsSUFBQUMsS0FBQSxJQUFBSCxNQUFBLEVBQUE7QUFDQSxRQUFBSSxxQkFBQUosT0FBQUcsS0FBQSxFQUFBLFFBQUEsQ0FBQTs7QUFFQSxRQUFBQyxxQkFBQUgsZUFBQSxFQUFBO0FBQ0FBLHVCQUFBRyxrQkFBQTtBQUNBOztBQUVBRix1QkFBQUUsa0JBQUE7QUFDQTs7QUFFQTtBQUNBM0QsT0FBQSxRQUFBLEVBQUFpQyxLQUFBOztBQUVBO0FBQ0E1RixLQUFBQyxJQUFBLENBQUFpSCxNQUFBLEVBQUEsVUFBQUssS0FBQSxFQUFBRixLQUFBLEVBQUE7QUFDQTtBQUNBLFFBQUFHLHNCQUFBSixrQkFBQSxDQUFBLEdBQUFDLE1BQUEsUUFBQSxJQUFBRixlQUFBLEdBQUEsQ0FBQTs7QUFFQTtBQUNBRSxVQUFBLGtCQUFBLElBQUEsWUFBQSxDQUFBRyxzQkFBQSxHQUFBLEVBQUFDLE9BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxJQUFBO0FBQ0FKLFVBQUEsaUJBQUEsSUFBQUEsTUFBQSxPQUFBLEVBQUFLLFdBQUEsRUFBQTtBQUNBTCxVQUFBLFFBQUEsSUFBQUEsTUFBQSxRQUFBLENBQUE7QUFDQUEsVUFBQSxxQkFBQSxJQUFBQSxNQUFBLFFBQUEsRUFBQU0sUUFBQSxHQUFBNUUsT0FBQSxDQUFBLHVCQUFBLEVBQUEsR0FBQSxDQUFBOztBQUVBO0FBQ0EsUUFBQTZFLFNBQUFySCxTQUFBLGNBQUEsRUFBQThHLEtBQUEsQ0FBQTtBQUNBMUQsUUFBQSxRQUFBLEVBQUFrRSxNQUFBLENBQUFELE1BQUE7QUFDQSxJQWJBOztBQWVBLE9BQUFSLG9CQUFBLENBQUEsRUFBQTtBQUNBekQsUUFBQSxRQUFBLEVBQUFtRSxNQUFBLEdBQUFwRyxRQUFBLENBQUEsUUFBQTtBQUNBLElBRkEsTUFFQTtBQUNBaUMsUUFBQSxRQUFBLEVBQUFtRSxNQUFBLEdBQUFoRyxXQUFBLENBQUEsUUFBQTtBQUNBO0FBQ0E7QUF6Q0EsRUFBQTtBQTJDQSxDQWhEQSxFQUFBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUFsRCxJQUFBbUosUUFBQSxHQUFBLFlBQUE7QUFDQS9ILEdBQUEsWUFBQTtBQUNBMkQsTUFBQSxVQUFBLElBQUEzRCxFQUFBLGVBQUEsQ0FBQTtBQUNBLEVBRkE7O0FBSUEsUUFBQTtBQUNBO0FBQ0E7QUFDQWdJLFNBQUEsWUFBQTtBQUNBOUksT0FBQSxvQkFBQSxFQUFBLE1BQUE7O0FBRUE7QUFDQSxPQUFBK0ksY0FBQXpKLE1BQUFDLE1BQUEsQ0FBQSxRQUFBLElBQUF5SixPQUFBMUosTUFBQUMsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsT0FBQTBKLFlBQUEzSixNQUFBQyxNQUFBLENBQUEsS0FBQSxJQUFBeUosT0FBQTFKLE1BQUFDLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsT0FBQTJKLGdCQUFBNUosTUFBQUMsTUFBQSxDQUFBLG9CQUFBLElBQUEwSixVQUFBRSxJQUFBLENBQUFKLFdBQUEsRUFBQSxTQUFBLENBQUE7O0FBRUE7QUFDQSxRQUFBLElBQUFLLE1BQUFMLFlBQUF0SCxLQUFBLEVBQUEsRUFBQTJILElBQUFDLFFBQUEsQ0FBQUosU0FBQSxDQUFBLEVBQUFHLElBQUEzRixHQUFBLENBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxFQUFBO0FBQ0E7QUFDQTtBQUNBLFFBQUE2RixnQkFBQUYsR0FBQTtBQUNBLFFBQUFHLGVBQUFILElBQUEzSCxLQUFBLEdBQUErSCxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQUQsYUFBQUUsT0FBQSxDQUFBUixTQUFBLENBQUEsRUFBQTtBQUNBTSxvQkFBQU4sU0FBQTtBQUNBOztBQUVBO0FBQ0EsUUFBQVMsaUJBQUFILGFBQUFKLElBQUEsQ0FBQUcsYUFBQSxFQUFBLFNBQUEsQ0FBQTs7QUFFQTtBQUNBLFFBQUFLLG9CQUFBRCxpQkFBQVIsYUFBQTs7QUFFQTtBQUNBO0FBQ0EsUUFBQVUsaUJBQUEsQ0FBQUQsb0JBQUEsR0FBQSxFQUFBcEIsT0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUFzQixPQUFBeEksU0FBQSxjQUFBLEVBQUE7QUFDQStILFVBQUFBLElBQUFVLE1BQUEsQ0FBQSxLQUFBO0FBREEsS0FBQSxFQUVBOUQsR0FGQSxDQUVBLE9BRkEsRUFFQTRELGlCQUFBLEdBRkEsQ0FBQTs7QUFJQTlJLE1BQUEsYUFBQSxFQUFBMkQsSUFBQSxVQUFBLENBQUEsRUFBQWtFLE1BQUEsQ0FBQWtCLElBQUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0FwRSxjQUFBL0YsSUFBQW1KLFFBQUEsQ0FBQWQsTUFBQSxFQUFBLElBQUE7O0FBRUE7QUFDQWpJLFdBQUEsVUFBQSxJQUFBaUssWUFBQXJLLElBQUFtSixRQUFBLENBQUFkLE1BQUEsRUFBQSxLQUFBLElBQUEsQ0FBQTtBQUNBLEdBaERBOztBQWtEQTtBQUNBO0FBQ0FBLFVBQUEsWUFBQTtBQUNBL0gsT0FBQSxxQkFBQSxFQUFBLE1BQUE7O0FBRUE7QUFDQSxPQUFBZ0ssUUFBQWhCLFFBQUE7QUFDQSxPQUFBRCxjQUFBekosTUFBQUMsTUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLE9BQUEwSixZQUFBM0osTUFBQUMsTUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLE9BQUEySixnQkFBQTVKLE1BQUFDLE1BQUEsQ0FBQSxvQkFBQSxDQUFBOztBQUVBLE9BQUEwSyxxQkFBQUQsTUFBQWIsSUFBQSxDQUFBSixXQUFBLEVBQUEsU0FBQSxDQUFBO0FBQ0EsT0FBQW1CLDBCQUFBRCxxQkFBQWYsYUFBQSxHQUFBZSxxQkFBQWYsYUFBQSxHQUFBLENBQUE7O0FBRUE7QUFDQTtBQUNBcEksS0FBQSxvQkFBQSxFQUFBMkQsSUFBQSxVQUFBLENBQUEsRUFBQXVCLEdBQUEsQ0FBQSxPQUFBLEVBQUF4QixHQUFBakQsSUFBQSxDQUFBLFFBQUEsRUFBQSxPQUFBLENBQUE7O0FBRUEsT0FBQTRJLG1CQUFBLENBQUFELDBCQUFBLEdBQUEsRUFBQTNCLE9BQUEsQ0FBQSxDQUFBLENBQUE7QUFDQXpILEtBQUEsZUFBQSxFQUFBMkQsSUFBQSxVQUFBLENBQUEsRUFBQXVCLEdBQUEsQ0FBQSxPQUFBLEVBQUFtRSxtQkFBQSxHQUFBO0FBQ0E7QUF0RUEsRUFBQTtBQXdFQSxDQTdFQSxFQUFBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQXpLLElBQUFKLEtBQUEsR0FBQSxZQUFBO0FBQ0F3QixHQUFBLFlBQUE7QUFDQW5CLE9BQUEsT0FBQSxJQUFBbUIsRUFBQSxZQUFBLENBQUE7QUFDQSxFQUZBOztBQUlBLFFBQUE7QUFDQTtBQUNBO0FBQ0FnSSxTQUFBLFlBQUE7QUFDQTlJLE9BQUEsaUJBQUEsRUFBQSxNQUFBOztBQUVBO0FBQ0E7QUFDQU4sT0FBQUosS0FBQSxDQUFBOEssTUFBQTtBQUNBMUssT0FBQUosS0FBQSxDQUFBK0ssUUFBQTs7QUFJQTtBQUNBN0YsTUFBQWUsT0FBQSxDQUFBNUMsSUFBQTtBQUNBLEdBZkE7O0FBaUJBO0FBQ0E7QUFDQXlILFVBQUEsWUFBQTtBQUNBO0FBQ0EsT0FBQXBCLFNBQUFTLE9BQUEsQ0FBQW5LLE1BQUFDLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0FrRixRQUFBLE1BQUEsRUFBQWpDLFFBQUEsQ0FBQSxzQkFBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxPQUFBbEQsTUFBQWUsV0FBQSxDQUFBLFdBQUEsTUFBQSxJQUFBLEVBQUE7QUFDQW9FLFFBQUEsTUFBQSxFQUFBakMsUUFBQSxDQUFBLGtCQUFBO0FBQ0E4SCxrQkFBQUMsZUFBQTtBQUNBO0FBQ0EsR0EvQkE7O0FBaUNBO0FBQ0E7QUFDQUYsWUFBQSxZQUFBO0FBQ0E7QUFDQSxPQUFBL0ssTUFBQUMsTUFBQSxDQUFBLFVBQUEsRUFBQSxRQUFBLENBQUEsRUFBQTtBQUNBLFFBQUFpTCxhQUFBbEwsTUFBQUMsTUFBQSxDQUFBLFVBQUEsRUFBQSxRQUFBLENBQUE7QUFDQWtGLFFBQUEsT0FBQSxFQUFBdEQsSUFBQSxDQUFBcUosVUFBQTtBQUNBOztBQUVBO0FBQ0EsT0FBQWxMLE1BQUFDLE1BQUEsQ0FBQSxVQUFBLEVBQUEsUUFBQSxDQUFBLEVBQUE7QUFDQSxRQUFBa0wsa0JBQUFuTCxNQUFBQyxNQUFBLENBQUEsVUFBQSxFQUFBLFFBQUEsQ0FBQTtBQUNBdUIsTUFBQSxvQkFBQSxFQUFBSyxJQUFBLENBQUFzSixlQUFBO0FBQ0E7QUFDQSxHQS9DQTs7QUFpREE7QUFDQTtBQUNBQyxRQUFBLFlBQUE7QUFDQTtBQUNBQyxXQUFBQyxPQUFBLENBQUFwSSxRQUFBLENBQUEsWUFBQTs7QUFFQTtBQUNBMUIsS0FBQWdILE9BQUEsQ0FBQSxvQ0FBQUYsTUFBQSxHQUFBLFlBQUEsR0FBQUosT0FBQSxHQUFBLGFBQUEsRUFBQXFELElBQUEsQ0FBQSxVQUFBdEosSUFBQSxFQUFBO0FBQ0E7QUFDQTtBQUNBakMsVUFBQWUsV0FBQSxHQUFBa0IsS0FBQSxRQUFBLENBQUE7QUFDQWpDLFVBQUFHLE9BQUEsR0FBQThCLEtBQUEsU0FBQSxDQUFBOztBQUVBOzs7QUFHQTs7QUFFQTtBQUNBb0osWUFBQWpFLEtBQUE7O0FBRUE7QUFDQWhILFFBQUFGLE1BQUEsQ0FBQXVJLE1BQUEsQ0FBQXhHLEtBQUEsUUFBQSxDQUFBOztBQUVBO0FBQ0FULE1BQUFDLElBQUEsQ0FBQVEsS0FBQSxTQUFBLENBQUEsRUFBQSxVQUFBOEcsS0FBQSxFQUFBeUMsTUFBQSxFQUFBO0FBQ0F4SyxhQUFBd0ssT0FBQSxRQUFBLENBQUEsSUFBQUEsTUFBQTtBQUNBQSxZQUFBLEtBQUEsSUFBQSxjQUFBQSxPQUFBLFFBQUEsQ0FBQTtBQUNBQSxZQUFBLEtBQUEsSUFBQS9ILE9BQUEsWUFBQSxFQUFBLGNBQUErSCxPQUFBLFFBQUEsQ0FBQSxDQUFBOztBQUVBLFNBQUFBLE9BQUEsUUFBQSxDQUFBLEVBQUE7QUFDQUEsYUFBQSxZQUFBLElBQUFBLE9BQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQTtBQUNBQSxhQUFBLGdCQUFBLElBQUEsa0JBQUEsQ0FBQUEsT0FBQSxRQUFBLEVBQUEsU0FBQSxJQUFBLEdBQUEsRUFBQXZDLE9BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBO0FBQ0E7O0FBRUEsU0FBQXdDLFFBQUExSixTQUFBLGFBQUEsRUFBQXlKLE1BQUEsRUFBQXZKLElBQUEsQ0FBQTtBQUNBLGdCQUFBdUosT0FBQSxRQUFBLENBREE7QUFFQSx1QkFBQUEsT0FBQSxpQkFBQSxJQUFBOUIsT0FBQThCLE9BQUEsaUJBQUEsQ0FBQSxFQUFBaEIsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBO0FBRkEsTUFBQSxDQUFBOztBQUtBLFNBQUFnQixPQUFBLFNBQUEsQ0FBQSxFQUFBO0FBQ0FDLFlBQUF2SSxRQUFBLENBQUEsVUFBQTtBQUNBMUIsUUFBQSxHQUFBLEVBQUFpSyxLQUFBLEVBQUFsSSxVQUFBLENBQUEsTUFBQTtBQUNBL0IsUUFBQSxPQUFBLEVBQUFpSyxLQUFBLEVBQUEzSixNQUFBO0FBQ0E7O0FBRUEsU0FBQSxDQUFBMEosT0FBQSxRQUFBLENBQUEsRUFBQTtBQUNBaEssUUFBQSxRQUFBLEVBQUFpSyxLQUFBLEVBQUEzSixNQUFBO0FBQ0E7O0FBRUE7QUFDQSxTQUFBNEosUUFBQWxLLEVBQUEsT0FBQSxFQUFBaUssS0FBQSxDQUFBOztBQUVBLFNBQUFELE9BQUEsT0FBQSxLQUFBQSxPQUFBLE9BQUEsRUFBQTdJLE1BQUEsRUFBQTtBQUNBLFVBQUFnSixjQUFBSCxPQUFBLE9BQUEsRUFBQTdJLE1BQUE7QUFDQTtBQUNBLFVBQUFpSixvQkFBQTlLLEdBQUEsU0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFVBQUErSyxvQkFBQSxDQUFBOztBQUVBLFVBQUFDLGdDQUFBLENBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUFDLCtCQUFBLENBQUEsT0FBQSxDQUFBOztBQUVBLFdBQUEsSUFBQXJKLElBQUEsQ0FBQSxFQUFBQSxJQUFBaUosV0FBQSxFQUFBakosR0FBQSxFQUFBO0FBQ0EsV0FBQXFDLE9BQUF5RyxPQUFBLE9BQUEsRUFBQTlJLENBQUEsQ0FBQTs7QUFFQSxXQUFBLENBQUFxQyxLQUFBLE9BQUEsS0FBQUEsS0FBQSxNQUFBLEtBQUEsT0FBQSxLQUFBOEcsb0JBQUFELGlCQUFBLEVBQUE7QUFDQUM7O0FBRUEsWUFBQUcsU0FBQTtBQUNBLFlBQUFDLFFBQUEsRUFBQTs7QUFFQTtBQUNBLFlBQUFILDhCQUFBbEgsT0FBQSxDQUFBRyxLQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0FpSCxxQkFBQSxZQUFBOztBQUVBQyxlQUFBLE9BQUEsSUFBQUosaUJBQUE7O0FBRUEsYUFBQTlHLEtBQUEsTUFBQSxLQUFBLFNBQUEsSUFBQUEsS0FBQSxNQUFBLEtBQUEsT0FBQSxJQUFBQSxLQUFBLE1BQUEsS0FBQSxNQUFBLElBQUFBLEtBQUEsTUFBQSxLQUFBLEtBQUEsRUFBQTtBQUNBa0gsZ0JBQUEsU0FBQSxJQUFBLDRCQUFBbEgsS0FBQSxPQUFBLEVBQUEsQ0FBQSxFQUFBLFdBQUEsQ0FBQSxHQUFBLEtBQUE7QUFDQWtILGdCQUFBLFVBQUEsSUFBQSxPQUFBO0FBQ0EsVUFIQSxNQUdBLElBQUFsSCxLQUFBLE9BQUEsS0FBQUEsS0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQWtILGdCQUFBLFNBQUEsSUFBQSw0QkFBQWxILEtBQUEsT0FBQSxFQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FDQUEsS0FBQSxPQUFBLEVBQUEsQ0FBQSxFQUFBLFVBQUEsRUFBQSxDQUFBLENBREEsR0FDQSxLQURBO0FBRUE7QUFDQSxTQVpBOztBQWNBO0FBQ0EsYUFBQWdILDZCQUFBbkgsT0FBQSxDQUFBRyxLQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0FpSCxzQkFBQSxXQUFBO0FBQ0FDLGtCQUFBO0FBQ0Esc0JBQUFsSCxLQUFBLFNBQUEsRUFBQW1ILFNBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQURBO0FBRUEsb0JBQUFMO0FBRkEsV0FBQTtBQUlBOztBQUVBLFlBQUFBLHNCQUFBRCxpQkFBQSxJQUFBRCxjQUFBRSxpQkFBQSxHQUFBLENBQUEsRUFBQTtBQUNBSSxlQUFBLFVBQUEsSUFBQSxNQUFBO0FBQ0FBLGVBQUEsTUFBQSxJQUFBLGVBQUFOLGNBQUFFLGlCQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7O0FBRUEsWUFBQU0sUUFBQXBLLFNBQUFpSyxTQUFBLEVBQUFDLEtBQUEsRUFBQXBGLFFBQUEsQ0FBQTZFLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFFQSxNQW5EQSxNQW1EQTtBQUNBO0FBQ0FBLFlBQUE1SixNQUFBO0FBQ0E7O0FBRUE7QUFDQXVKLGFBQUFoQyxNQUFBLENBQUFvQyxLQUFBLEVBQUFXLE9BQUEsQ0FBQSxVQUFBLEVBQUFYLEtBQUE7QUFDQSxLQXRGQTs7QUF3RkE7QUFDQTtBQUNBckwsUUFBQUosS0FBQSxDQUFBcU0sTUFBQTtBQUNBak0sUUFBQUosS0FBQSxDQUFBc00sSUFBQSxDQUFBdE0sTUFBQWUsV0FBQSxDQUFBLFdBQUEsSUFBQSxRQUFBLEdBQUEsTUFBQTs7QUFFQTtBQUNBLFFBQUEwQyxPQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBckQsU0FBQTRFLE1BQUEsQ0FBQUMsSUFBQSxDQUFBeEIsT0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0E7O0FBRUE7QUFDQTBDLGVBQUEsWUFBQTtBQUNBa0YsYUFBQUMsT0FBQSxDQUNBaEksV0FEQSxDQUNBLFNBREEsRUFFQThDLEdBRkEsQ0FFQSxlQUZBLEVBRUEsWUFBQTtBQUFBaUYsY0FBQUMsT0FBQSxDQUFBaEksV0FBQSxDQUFBLElBQUE7QUFDQSxNQUhBO0FBSUEsS0FMQSxFQUtBLElBTEE7O0FBT0E7QUFDQWlKLG1CQUFBN0MsT0FBQXpILEtBQUEsUUFBQSxFQUFBLG9CQUFBLENBQUEsQ0FBQTtBQUNBdUssWUFBQSxTQUFBLElBQUEsQ0FBQSxDQUFBQSxRQUFBLE9BQUEsSUFBQSxDQUFBO0FBQ0EsSUEvSEE7QUFnSUEsR0F4TEE7O0FBMExBSCxVQUFBLFlBQUE7QUFDQWhCLFdBQUFlLE9BQUEsQ0FBQSxhQUFBO0FBQ0FmLFdBQUFlLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsR0E3TEE7O0FBK0xBRSxRQUFBLFVBQUFHLFFBQUEsRUFBQTtBQUNBcEIsV0FBQWUsT0FBQSxDQUFBO0FBQ0EsY0FBQUs7QUFEQSxJQUFBO0FBR0E7QUFuTUEsRUFBQTtBQXFNQSxDQTFNQSxFQUFBOztBQTRNQTtBQUNBLElBQUFwQixPQUFBOztBQUVBN0osRUFBQSxZQUFBO0FBQ0E2SixXQUFBN0osRUFBQSxlQUFBLENBQUE7QUFDQTs7QUFFQTZKLFNBQUFlLE9BQUEsQ0FBQTtBQUNBLGtCQUFBLGNBREE7QUFFQSx3QkFBQSxLQUZBO0FBR0EsaUJBQUE7QUFDQSxXQUFBLGdCQURBO0FBRUEsYUFBQSxVQUFBTSxPQUFBLEVBQUE7QUFDQSxXQUFBQyxTQUFBbkwsRUFBQWtMLE9BQUEsRUFBQXpLLElBQUEsQ0FBQSxRQUFBLENBQUEsRUFBQSxFQUFBLENBQUE7QUFDQTtBQUpBLEdBSEE7QUFTQSxtQkFBQTtBQUNBLFdBQUEsS0FEQTtBQUVBLGFBQUE7QUFGQSxHQVRBO0FBYUEsWUFBQSxDQUFBLE1BQUEsRUFBQSxRQUFBLENBYkE7QUFjQSxhQUFBO0FBQ0EsYUFBQW5CLEdBQUEsU0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEdBQUE7QUFEQTtBQWRBLEVBQUE7O0FBbUJBdUssU0FBQXpGLEVBQUEsQ0FBQSxPQUFBLEVBQUEsNkJBQUEsRUFBQSxVQUFBbEIsS0FBQSxFQUFBO0FBQ0EsTUFBQUEsTUFBQWtJLEtBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQWxJLFNBQUFzQyxjQUFBOztBQUVBLE9BQUE2RixTQUFBckwsRUFBQSxJQUFBLEVBQUFTLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQTdCLE9BQUE0RSxNQUFBLENBQUFDLElBQUEsQ0FBQTRILE1BQUEsRUFBQSxJQUFBO0FBQ0E7QUFDQSxFQVBBOztBQVNBOztBQUVBO0FBQ0ExSCxLQUFBLFNBQUEsRUFBQVMsRUFBQSxDQUFBLE9BQUEsRUFBQSxtQkFBQSxFQUFBLFVBQUFsQixLQUFBLEVBQUE7QUFDQUEsUUFBQXNDLGNBQUE7O0FBRUEsTUFBQXlGLFdBQUFqTCxFQUFBLElBQUEsRUFBQVMsSUFBQSxDQUFBLFNBQUEsQ0FBQTtBQUNBVCxJQUFBLG1CQUFBLEVBQUEyRCxJQUFBLFNBQUEsQ0FBQSxFQUFBN0IsV0FBQSxDQUFBLFFBQUE7QUFDQTlCLElBQUEsSUFBQSxFQUFBMEIsUUFBQSxDQUFBLFFBQUE7O0FBRUE5QyxNQUFBSixLQUFBLENBQUFzTSxJQUFBLENBQUFHLFFBQUE7QUFDQXZILEtBQUE2QixPQUFBLENBQUFqQyxLQUFBO0FBQ0EsRUFUQTtBQVVBLENBN0NBOztBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUExRSxJQUFBNEUsTUFBQSxHQUFBLFlBQUE7QUFDQSxLQUFBOEgsbUJBQUEsRUFBQTs7QUFFQSxVQUFBQyxXQUFBLENBQUFDLEtBQUEsRUFBQUMsTUFBQSxFQUFBO0FBQ0FILG1CQUFBLE9BQUEsSUFBQSxDQUFBO0FBQ0EsT0FBQSxJQUFBakUsS0FBQSxJQUFBN0ksTUFBQWUsV0FBQSxDQUFBLFFBQUEsQ0FBQSxFQUFBO0FBQ0ErTCxvQkFBQTlNLE1BQUFlLFdBQUEsQ0FBQSxRQUFBLEVBQUE4SCxLQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0E7O0FBRUFySCxJQUFBQyxJQUFBLENBQUF1TCxLQUFBLEVBQUEsVUFBQWpFLEtBQUEsRUFBQWhFLElBQUEsRUFBQTtBQUNBQSxRQUFBLDRCQUFBLElBQUEyRSxPQUFBM0UsS0FBQSxrQkFBQSxDQUFBLEVBQUFtSSxRQUFBLEVBQUE7QUFDQW5JLFFBQUEsaUJBQUEsSUFBQUEsS0FBQSxPQUFBLEVBQUFtRSxXQUFBLEVBQUE7O0FBRUE7QUFDQSxPQUFBbkUsS0FBQSxXQUFBLENBQUEsRUFBQTtBQUNBLFFBQUFBLEtBQUEsV0FBQSxFQUFBLFFBQUEsTUFBQSxHQUFBLEVBQUE7QUFDQUEsVUFBQSxjQUFBLElBQUFBLEtBQUEsT0FBQSxDQUFBO0FBQ0FBLFVBQUEsYUFBQSxJQUFBLDBDQUFBLENBRkEsQ0FFQTtBQUNBQSxVQUFBLFFBQUEsSUFBQUEsS0FBQSxXQUFBLEVBQUEsUUFBQSxJQUFBLFFBQUEsSUFBQUEsS0FBQSxXQUFBLEVBQUEsUUFBQSxJQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsS0FKQSxNQUlBO0FBQ0FBLFVBQUEsY0FBQSxJQUFBLFVBQUE7QUFDQUEsVUFBQSxhQUFBLElBQUEsMENBQUE7QUFDQUEsVUFBQSxRQUFBLElBQUEsV0FBQTtBQUNBO0FBQ0FBLFNBQUEsVUFBQSxJQUFBQSxLQUFBLFdBQUEsRUFBQSxVQUFBLENBQUE7O0FBRUE7QUFDQStILHFCQUFBLE9BQUEsS0FBQS9ILEtBQUEsV0FBQSxFQUFBLFFBQUEsQ0FBQTtBQUNBK0gscUJBQUEvSCxLQUFBLE9BQUEsQ0FBQSxLQUFBQSxLQUFBLFdBQUEsRUFBQSxRQUFBLENBQUE7QUFDQSxJQWZBLE1BZUE7QUFDQUEsU0FBQSxhQUFBLElBQUEsMENBQUEsQ0FEQSxDQUNBO0FBQ0FBLFNBQUEsUUFBQSxJQUFBLHNCQUFBO0FBQ0E7O0FBRUE7QUFDQSxPQUFBQSxLQUFBLFNBQUEsS0FBQUEsS0FBQSxTQUFBLEVBQUFtSCxTQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxLQUFBLEVBQUE7QUFDQW5ILFNBQUEsU0FBQSxJQUFBLFFBQUFBLEtBQUEsU0FBQSxFQUFBUixPQUFBLENBQUEseUJBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxNQUFBO0FBQ0E7O0FBRUE7QUFDQSxPQUFBNEksYUFBQXBMLFNBQUEsdUJBQUEsRUFBQWdELElBQUEsQ0FBQTtBQUNBLE9BQUFxSSxTQUFBNUwsRUFBQSxrQkFBQSxFQUFBMkwsVUFBQSxDQUFBOztBQUVBO0FBQ0EsT0FBQXBJLEtBQUEsT0FBQSxDQUFBLEVBQUE7QUFDQXZELE1BQUFDLElBQUEsQ0FBQXNELEtBQUEsT0FBQSxDQUFBLEVBQUEsVUFBQWdFLEtBQUEsRUFBQWtELEtBQUEsRUFBQTtBQUNBO0FBQ0EsU0FBQWxILEtBQUEsTUFBQSxLQUFBLFFBQUEsRUFBQTtBQUNBa0gsWUFBQSxTQUFBLElBQUFBLE1BQUEsU0FBQSxJQUFBQSxNQUFBLFVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQUEsWUFBQSxpQkFBQSxJQUFBLGtCQUFBLENBQUFBLE1BQUEsU0FBQSxJQUFBLEdBQUEsRUFBQWhELE9BQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBO0FBQ0FnRCxZQUFBLGVBQUEsSUFBQUEsTUFBQSxTQUFBLElBQUFBLE1BQUEsVUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUFvQixTQUFBdEwsU0FBQSxhQUFBLEVBQUFrSyxLQUFBLENBQUE7QUFDQW1CLGFBQUEvRCxNQUFBLENBQUFnRSxNQUFBO0FBQ0EsTUFOQTs7QUFRQTtBQUNBLFVBQUF0SSxLQUFBLE1BQUEsS0FBQSxTQUFBLElBQUFBLEtBQUEsTUFBQSxLQUFBLE9BQUEsSUFBQUEsS0FBQSxNQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQUEsS0FBQSxNQUFBLEtBQUEsU0FBQSxFQUFBO0FBQ0FrSCxjQUFBLE9BQUEsSUFBQSxtQ0FBQUEsTUFBQSxZQUFBLENBQUEsR0FBQSx1QkFBQTtBQUNBLFFBRkEsTUFJQSxJQUFBbEgsS0FBQSxNQUFBLEtBQUEsT0FBQSxFQUFBO0FBQ0FrSCxjQUFBLE9BQUEsSUFBQSxvQ0FBQUEsTUFBQSxVQUFBLENBQUEsR0FBQSw4QkFBQTtBQUNBLFFBRkEsTUFJQSxJQUFBbEgsS0FBQSxNQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0FrSCxjQUFBLE9BQUEsSUFBQSx1QkFBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxlQUFBO0FBQ0E7O0FBRUFBLGFBQUEsaUJBQUEsSUFBQSxrQkFBQSxDQUFBQSxNQUFBLFNBQUEsSUFBQSxHQUFBLEVBQUFoRCxPQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQTtBQUNBLFdBQUFxRSxTQUFBdkwsU0FBQSxhQUFBLEVBQUFrSyxLQUFBLENBQUE7QUFDQW1CLGNBQUEvRCxNQUFBLENBQUFpRSxNQUFBO0FBQ0E7QUFDQSxLQTVCQTtBQTZCQTs7QUFFQTtBQUNBLE9BQUEsQ0FBQXZJLEtBQUEsU0FBQSxDQUFBLEVBQUE7QUFDQW9JLGVBQUFqSyxRQUFBLENBQUEsWUFBQTtBQUNBOztBQUVBLE9BQUEsQ0FBQTZCLEtBQUEsT0FBQSxDQUFBLEVBQUE7QUFDQW9JLGVBQUFqSyxRQUFBLENBQUEsVUFBQTtBQUNBOztBQUVBO0FBQ0EsT0FBQSxDQUFBNkIsS0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBQSxLQUFBLFVBQUEsQ0FBQSxFQUFBO0FBQ0F2RCxNQUFBLGtCQUFBLEVBQUEyTCxVQUFBLEVBQUFyTCxNQUFBO0FBQ0E7O0FBR0E7QUFDQTtBQUNBbUwsVUFBQTVELE1BQUEsQ0FBQThELFVBQUE7QUFDQSxHQXJGQTtBQXNGQTs7QUFFQSxRQUFBOztBQUVBO0FBQ0E7QUFDQWxJLFFBQUEsVUFBQTRILE1BQUEsRUFBQTVJLFNBQUEsRUFBQTtBQUNBLE9BQUF1SCxTQUFBeEssUUFBQTZMLE1BQUEsQ0FBQTtBQUNBNUwsbUJBQUE0TCxNQUFBOztBQUVBLE9BQUEzSCxHQUFBakQsSUFBQSxDQUFBLFNBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE1QixRQUFBLFFBQUEsRUFBQTZDLFFBQUEsQ0FBQSxJQUFBO0FBQ0E5QyxPQUFBNEUsTUFBQSxDQUFBdUksTUFBQSxDQUFBL0IsTUFBQTs7QUFFQW5MLFFBQUEsUUFBQSxFQUFBaUYsTUFBQSxHQUFBcEMsUUFBQSxDQUFBLFNBQUEsRUFBQWtELEdBQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBO0FBQ0E1RSxNQUFBLCtCQUFBLEVBQUFJLElBQUEsQ0FBQSxTQUFBLEVBQUEsU0FBQTtBQUNBLElBSEE7O0FBS0F1RCxPQUFBLE1BQUEsRUFBQWpDLFFBQUEsQ0FBQSx5QkFBQTs7QUFFQTtBQUNBTyxVQUFBLGNBQUEsRUFBQWMsT0FBQSxDQUFBLFFBQUE7QUFDQSxPQUFBTixTQUFBLEVBQUE7QUFBQVIsV0FBQStKLEVBQUEsQ0FBQSxjQUFBaEMsT0FBQSxRQUFBLENBQUEsRUFBQSxFQUFBLFFBQUEsUUFBQSxFQUFBLE1BQUFBLE9BQUEsUUFBQSxDQUFBLEVBQUEsRUFBQUEsT0FBQSxRQUFBLENBQUE7QUFBQTtBQUNBLEdBMUJBOztBQTRCQTtBQUNBO0FBQ0E7QUFDQStCLFVBQUEsVUFBQS9CLE1BQUEsRUFBQTtBQUNBLE9BQUFpQyxVQUFBMUwsU0FBQSxhQUFBLEVBQUF5SixNQUFBLENBQUE7O0FBRUE7QUFDQTtBQUNBLE9BQUFBLE9BQUEsUUFBQSxDQUFBLEVBQUE7QUFDQUEsV0FBQSxRQUFBLEVBQUEsU0FBQSxJQUFBLGtCQUFBLENBQUFBLE9BQUEsUUFBQSxFQUFBLFNBQUEsSUFBQSxHQUFBLEVBQUF2QyxPQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQTtBQUNBOztBQUVBLE9BQUF5RSxlQUFBM0wsU0FBQSxhQUFBLEVBQUF5SixNQUFBLENBQUE7O0FBRUEsT0FBQSxDQUFBQSxPQUFBLFFBQUEsQ0FBQSxFQUFBO0FBQ0FoSyxNQUFBLFFBQUEsRUFBQWtNLFlBQUEsRUFBQTVMLE1BQUE7QUFDQTtBQUNBTixLQUFBLE9BQUEsRUFBQWtNLFlBQUEsRUFBQTVMLE1BQUE7QUFDQU4sS0FBQSxHQUFBLEVBQUFrTSxZQUFBLEVBQUFuSyxVQUFBLENBQUEsTUFBQTs7QUFFQS9CLEtBQUEsMkJBQUEsRUFBQWlNLE9BQUEsRUFBQXBFLE1BQUEsQ0FBQXFFLFlBQUE7O0FBRUE7QUFDQTtBQUNBLE9BQUFULFNBQUF6TCxFQUFBLG9CQUFBLEVBQUFpTSxPQUFBLENBQUE7O0FBRUEsT0FBQWpDLE9BQUEsT0FBQSxFQUFBN0ksTUFBQSxFQUFBO0FBQ0FvSyxnQkFBQXZCLE9BQUEsT0FBQSxDQUFBLEVBQUF5QixNQUFBOztBQUVBQSxXQUFBYixPQUFBLENBQUE7QUFDQSxxQkFBQSxZQURBO0FBRUEsMkJBQUEsQ0FGQTtBQUdBLGdCQUFBO0FBQ0Esb0JBQUEsSUFEQTtBQUVBLGdCQUFBdEwsR0FBQSxTQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQTtBQUZBO0FBSEEsS0FBQTtBQTBCQSxJQTdCQSxNQTZCQTtBQUNBVSxNQUFBLFFBQUEsRUFBQTBCLFFBQUEsQ0FBQSxPQUFBLEVBQUF5SyxJQUFBLENBQUEsYUFBQSxFQUFBOUcsUUFBQSxDQUFBb0csTUFBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTVNLFFBQUEsUUFBQSxFQUFBd0IsSUFBQSxDQUFBNEwsT0FBQTs7QUFFQSxPQUFBakMsT0FBQSxPQUFBLEVBQUE3SSxNQUFBLEVBQUE7QUFDQXNLLFdBQUFiLE9BQUEsQ0FBQSxRQUFBO0FBQ0E7O0FBRUE7QUFDQSxPQUFBd0Isb0JBQUFwTSxFQUFBLG9CQUFBLEVBQUFpTSxPQUFBLENBQUE7O0FBRUFqTSxLQUFBQyxJQUFBLENBQUF6QixNQUFBZSxXQUFBLENBQUEsUUFBQSxDQUFBLEVBQUEsVUFBQWdJLEtBQUEsRUFBQUYsS0FBQSxFQUFBO0FBQ0EsUUFBQUMscUJBQUEsRUFBQTs7QUFFQTtBQUNBLFFBQUFFLHNCQUFBOEQsaUJBQUEsT0FBQSxJQUFBLENBQUEsR0FBQUEsaUJBQUFqRSxLQUFBLElBQUFpRSxpQkFBQSxPQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0FoRSx1QkFBQSxPQUFBLElBQUFELEtBQUE7QUFDQUMsdUJBQUEsaUJBQUEsSUFBQSxhQUFBLENBQUFFLHNCQUFBLEdBQUEsRUFBQUMsT0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUE7QUFDQUgsdUJBQUEsaUJBQUEsSUFBQUQsTUFBQUssV0FBQSxFQUFBO0FBQ0FKLHVCQUFBLFFBQUEsSUFBQWdFLGlCQUFBakUsS0FBQSxJQUFBLENBQUEsR0FBQWlFLGlCQUFBakUsS0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBQyx1QkFBQSxxQkFBQSxJQUFBQSxtQkFBQSxRQUFBLEVBQUFLLFFBQUEsR0FBQTVFLE9BQUEsQ0FBQSx1QkFBQSxFQUFBLEdBQUEsQ0FBQTs7QUFFQSxRQUFBNkUsU0FBQXJILFNBQUEsY0FBQSxFQUFBK0csa0JBQUEsQ0FBQTtBQUNBOEUsc0JBQUF2RSxNQUFBLENBQUFELE1BQUE7QUFDQSxJQWJBO0FBY0EsR0FoSEE7O0FBa0hBO0FBQ0E7QUFDQXRFLFNBQUEsVUFBQWIsU0FBQSxFQUFBO0FBQ0FoRCxtQkFBQSxJQUFBO0FBQ0FPLEtBQUEsK0JBQUEsRUFBQUksSUFBQSxDQUFBLFNBQUEsRUFBQXNGLFlBQUEsVUFBQSxDQUFBOztBQUVBL0IsT0FBQSxNQUFBLEVBQUE3QixXQUFBLENBQUEseUJBQUE7QUFDQWpELFFBQUEsUUFBQSxFQUFBaUQsV0FBQSxDQUFBLFNBQUEsRUFBQThDLEdBQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBL0YsU0FBQSxRQUFBLEVBQUFpRCxXQUFBLENBQUEsSUFBQSxFQUFBOEQsS0FBQTtBQUNBLElBRkE7O0FBSUEsT0FBQWxDLEdBQUFqRCxJQUFBLENBQUEsU0FBQSxLQUFBLENBQUEsRUFBQSxDQUVBO0FBREE7OztBQUdBO0FBQ0F3QixVQUFBLGNBQUEsRUFBQWMsT0FBQSxDQUFBLE1BQUE7QUFDQSxPQUFBTixTQUFBLEVBQUE7QUFBQVIsV0FBQStKLEVBQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQSxRQUFBLE1BQUEsRUFBQSxFQUFBLGtCQUFBO0FBQUE7QUFDQTtBQXBJQSxFQUFBO0FBc0lBLENBdk9BLEVBQUE7O0FBeU9BaE0sRUFBQSxZQUFBO0FBQ0FuQixNQUFBLFFBQUEsSUFBQW1CLEVBQUEsZ0JBQUEsQ0FBQTtBQUNBbkIsTUFBQSxRQUFBLEVBQUF1RixFQUFBLENBQUEsT0FBQSxFQUFBLGtCQUFBLEVBQUEsVUFBQWxCLEtBQUEsRUFBQTtBQUNBQSxRQUFBc0MsY0FBQTtBQUNBNUcsTUFBQTRFLE1BQUEsQ0FBQUYsS0FBQSxDQUFBLElBQUE7QUFDQSxFQUhBLEVBR0FjLEVBSEEsQ0FHQSxPQUhBLEVBR0Esc0JBSEEsRUFHQSxZQUFBO0FBQ0FWLEtBQUFMLFdBQUEsQ0FBQUksSUFBQSxDQUFBekQsRUFBQSxpQkFBQSxFQUFBbkIsS0FBQSxRQUFBLENBQUEsRUFBQThCLEtBQUEsR0FBQStELElBQUEsRUFBQTtBQUNBLEVBTEEsRUFLQU4sRUFMQSxDQUtBLE9BTEEsRUFLQSxnQkFMQSxFQUtBLFVBQUFsQixLQUFBLEVBQUE7QUFDQSxNQUFBQSxNQUFBa0ksS0FBQSxLQUFBLENBQUEsRUFBQTtBQUNBbEksU0FBQXNDLGNBQUE7QUFDQTtBQUNBLEVBVEE7QUFVQSxDQVpBOztBQ2hQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBNUcsSUFBQXlOLElBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQTs7QUFFQTtBQUNBO0FBQ0FDLGFBQUEsWUFBQTtBQUNBO0FBQ0F0TSxLQUFBLFNBQUEsRUFBQXVNLEtBQUEsRUFBQXpLLFdBQUEsQ0FBQSxVQUFBO0FBQ0EsR0FQQTs7QUFTQTtBQUNBO0FBQ0EwSyxlQUFBLFlBQUE7QUFDQTtBQUNBeE0sS0FBQSxTQUFBLEVBQUF1TSxLQUFBLEVBQUE3SyxRQUFBLENBQUEsVUFBQTtBQUNBLEdBZEE7O0FBZ0JBO0FBQ0E7QUFDQStLLGdCQUFBLFVBQUFDLEdBQUEsRUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQUFDLGFBQUEsRUFBQTs7QUFFQSxZQUFBQyxhQUFBLENBQUFELFVBQUEsRUFBQTtBQUNBLFFBQUFFLGFBQUE3TSxFQUFBLFNBQUEsRUFBQUksSUFBQSxDQUFBLEtBQUEsRUFBQXVNLFdBQUEsV0FBQSxDQUFBLENBQUE7QUFDQTNNLE1BQUEsb0JBQUEsRUFBQXVNLEtBQUEsRUFBQTVLLEdBQUEsQ0FBQWdMLFdBQUEsVUFBQSxDQUFBO0FBQ0EzTSxNQUFBLGNBQUEsRUFBQXVNLEtBQUEsRUFBQTVLLEdBQUEsQ0FBQWdMLFdBQUEsSUFBQSxDQUFBO0FBQ0EzTSxNQUFBLHFCQUFBLEVBQUF1TSxLQUFBLEVBQUE1SyxHQUFBLENBQUFnTCxXQUFBLFdBQUEsQ0FBQTtBQUNBM00sTUFBQSxtQkFBQSxFQUFBdU0sS0FBQSxFQUFBbE0sSUFBQSxDQUFBd00sVUFBQSxFQUFBQyxNQUFBO0FBQ0E7O0FBRUE7QUFDQSxPQUFBSixJQUFBSyxLQUFBLENBQUEsaUZBQUEsQ0FBQSxFQUFBO0FBQ0E7QUFDQSxRQUFBQyxjQUFBTixJQUFBSyxLQUFBLENBQUEsaUZBQUEsQ0FBQTtBQUNBSixlQUFBLFVBQUEsSUFBQSxTQUFBO0FBQ0FBLGVBQUEsSUFBQSxJQUFBSyxZQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0FMLGVBQUEsV0FBQSxJQUFBLDZCQUFBSyxZQUFBLENBQUEsQ0FBQSxHQUFBLFFBQUE7O0FBRUFDLFlBQUFYLFNBQUE7QUFDQU0sa0JBQUFELFVBQUE7QUFDQSxJQVZBOztBQVlBO0FBQ0EsUUFBQUQsSUFBQUssS0FBQSxDQUFBLFlBQUEsQ0FBQSxFQUFBO0FBQ0E7QUFDQSxTQUFBRyxZQUFBUixJQUFBSyxLQUFBLENBQUEsb0NBQUEsQ0FBQTtBQUNBSixnQkFBQSxVQUFBLElBQUEsT0FBQTtBQUNBQSxnQkFBQSxJQUFBLElBQUFPLFVBQUEsQ0FBQSxDQUFBOztBQUVBbE4sT0FBQWdILE9BQUEsQ0FBQSxvQ0FBQWtHLFVBQUEsQ0FBQSxDQUFBLEdBQUEsa0JBQUEsRUFDQW5ELElBREEsQ0FDQSxVQUFBb0QsUUFBQSxFQUFBO0FBQ0FSLGlCQUFBLFdBQUEsSUFBQVEsU0FBQSxDQUFBLEVBQUEsaUJBQUEsQ0FBQTs7QUFFQUYsY0FBQVgsU0FBQTtBQUNBTSxvQkFBQUQsVUFBQTtBQUNBLE1BTkE7QUFPQSxLQWJBOztBQWVBO0FBQ0EsU0FBQUQsSUFBQUssS0FBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBO0FBQ0E7QUFDQSxVQUFBSyxXQUFBVixJQUFBSyxLQUFBLENBQUEsMENBQUEsQ0FBQTtBQUNBSixpQkFBQSxVQUFBLElBQUEsTUFBQTtBQUNBQSxpQkFBQSxJQUFBLElBQUFTLFNBQUEsQ0FBQSxDQUFBOztBQUVBcE4sUUFBQWdILE9BQUEsQ0FBQSxxREFBQW9HLFNBQUEsQ0FBQSxDQUFBLEdBQUEsYUFBQSxFQUNBckQsSUFEQSxDQUNBLFVBQUFvRCxRQUFBLEVBQUE7QUFDQVIsa0JBQUEsV0FBQSxJQUFBUSxTQUFBLFdBQUEsQ0FBQTs7QUFFQUYsZUFBQVgsU0FBQTtBQUNBTSxxQkFBQUQsVUFBQTtBQUNBLE9BTkE7QUFPQTtBQUVBLEdBN0VBOztBQStFQTtBQUNBO0FBQ0FsSixRQUFBLFVBQUFyRSxJQUFBLEVBQUFpTSxNQUFBLEVBQUE7QUFDQSxPQUFBNUssT0FBQTtBQUNBLGNBQUFqQyxNQUFBZSxXQUFBLENBQUEsUUFBQSxDQURBO0FBRUEsY0FBQThMLFVBQUE1TCxhQUZBO0FBR0EsWUFBQTROLEtBQUEsSUFBQSxDQUhBO0FBSUEsYUFBQUEsS0FBQSxPQUFBLENBSkE7QUFLQSxhQUFBQSxLQUFBLE9BQUE7QUFMQSxJQUFBO0FBT0EsT0FBQUMsaUJBQUEvTSxTQUFBLGNBQUFuQixJQUFBLEVBQUFxQixJQUFBLENBQUE7O0FBRUE7QUFDQTtBQUNBOEwsU0FBQWxNLElBQUEsQ0FBQWlOLGNBQUEsRUFBQTVMLFFBQUEsQ0FBQSxJQUFBLEVBQUFvQyxNQUFBLEdBQUFwQyxRQUFBLENBQUEsU0FBQSxFQUFBa0QsR0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0EsUUFBQTJJLG1CQUFBdk4sRUFBQSxTQUFBLEVBQUF1TSxLQUFBLEVBQUFySCxHQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBbEYsTUFBQSwrQkFBQSxFQUFBSSxJQUFBLENBQUEsU0FBQSxFQUFBbU4sZ0JBQUE7QUFDQSxJQUhBOztBQUtBTixXQUFBVCxXQUFBOztBQUVBO0FBQ0E7QUFDQSxPQUFBcE4sU0FBQSxPQUFBLEVBQUE7QUFDQW1OLFVBQUFpQixRQUFBO0FBQ0F4TixNQUFBLG1CQUFBLEVBQUF1TSxLQUFBLEVBQUFuSCxPQUFBLENBQUEsT0FBQTtBQUNBO0FBQ0EsSUFKQSxNQU1BLElBQUFoRyxTQUFBLE9BQUEsSUFBQUEsU0FBQSxNQUFBLEVBQUE7QUFDQVksTUFBQSxxQkFBQSxFQUFBdU0sS0FBQSxFQUFBa0IsS0FBQSxHQUFBckosRUFBQSxDQUFBLE9BQUEsRUFBQSxZQUFBO0FBQ0E7QUFDQTZJLGFBQUFSLFlBQUEsQ0FBQXpNLEVBQUEsSUFBQSxFQUFBMkIsR0FBQSxFQUFBO0FBQ0EsS0FIQTtBQUlBLElBTEEsTUFPQSxJQUFBdkMsU0FBQSxNQUFBLEVBQUE7QUFDQVksTUFBQSxtQkFBQSxFQUFBdU0sS0FBQSxFQUFBa0IsS0FBQSxHQUFBckosRUFBQSxDQUFBLE9BQUEsRUFBQSxZQUFBO0FBQ0EsU0FBQXBFLEVBQUEsSUFBQSxFQUFBMkIsR0FBQSxHQUFBUixNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0E4TCxjQUFBWCxTQUFBO0FBQ0EsTUFGQSxNQUVBO0FBQ0FXLGNBQUFULFdBQUE7QUFDQTtBQUNBLEtBTkE7QUFPQTs7QUFFQTtBQUNBdkssVUFBQSxjQUFBLEVBQUFjLE9BQUEsQ0FBQSxVQUFBO0FBQ0FQLFdBQUFrTCxZQUFBLENBQUEsRUFBQSxRQUFBLFVBQUEsRUFBQSxRQUFBdE8sSUFBQSxFQUFBLE1BQUFxQixLQUFBLFFBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxFQUFBLElBQUE7QUFDQSxHQWhJQTs7QUFrSUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTZDLFNBQUEsWUFBQTtBQUNBO0FBQ0F0RCxLQUFBLCtCQUFBLEVBQUFJLElBQUEsQ0FBQSxTQUFBLEVBQUFzRixZQUFBLFVBQUEsQ0FBQTs7QUFFQTZHLFNBQUF6SyxXQUFBLENBQUEsU0FBQSxFQUFBOEMsR0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0EySCxVQUFBekssV0FBQSxDQUFBLElBQUEsRUFBQThELEtBQUE7QUFDQSxJQUZBOztBQUlBM0QsVUFBQSxjQUFBLEVBQUFjLE9BQUEsQ0FBQSxRQUFBO0FBQ0E7QUFqSkEsRUFBQTtBQW1KQSxDQXBKQSxFQUFBOztBQXNKQSxJQUFBUSxPQUFBMEosT0FBQTs7QUFFQTtBQUNBLElBQUFWLEtBQUE7O0FBRUF2TSxFQUFBLFlBQUE7QUFDQXVNLFNBQUF2TSxFQUFBLFdBQUEsQ0FBQTtBQUNBMkQsS0FBQSxhQUFBLEVBQUFTLEVBQUEsQ0FBQSxPQUFBLEVBQUEsbUJBQUEsRUFBQSxVQUFBbEIsS0FBQSxFQUFBO0FBQ0FBLFFBQUFzQyxjQUFBOztBQUVBLE1BQUFwRyxPQUFBWSxFQUFBLElBQUEsRUFBQVMsSUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBaUQsS0FBQUwsV0FBQSxDQUFBQyxLQUFBO0FBQ0FxQixhQUFBLFlBQUE7QUFDQS9GLE9BQUF5TixJQUFBLENBQUE1SSxJQUFBLENBQUFyRSxJQUFBLEVBQUFLLGFBQUE7QUFDQSxHQUZBLEVBRUEsR0FGQTtBQUdBLEVBUkE7O0FBVUE4TSxPQUFBbkksRUFBQSxDQUFBLFFBQUEsRUFBQSxNQUFBLEVBQUEsVUFBQWxCLEtBQUEsRUFBQTtBQUNBQSxRQUFBc0MsY0FBQTtBQUNBLEVBRkEsRUFFQXBCLEVBRkEsQ0FFQSxPQUZBLEVBRUEsU0FGQSxFQUVBLFVBQUFsQixLQUFBLEVBQUE7QUFDQUEsUUFBQXNDLGNBQUE7O0FBRUEsTUFBQTBDLFNBQUFTLE9BQUEsQ0FBQW5LLE1BQUFlLFdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0FzRyxTQUFBcEMsSUFBQSxDQUFBLHVCQUFBO0FBQ0E7O0FBRUEsTUFBQXpELEVBQUEsSUFBQSxFQUFBZ0MsUUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBO0FBQ0E7QUFDQTZELFNBQUFwQyxJQUFBLENBQUEsZ0NBQUE7QUFDQTtBQUNBOztBQUVBLE1BQUFoRCxPQUFBVCxFQUFBLE1BQUEsRUFBQXVNLEtBQUEsRUFBQW9CLFNBQUEsRUFBQTs7QUFFQTNOLElBQUEsU0FBQSxFQUFBdU0sS0FBQSxFQUFBN0ssUUFBQSxDQUFBLFVBQUEsRUFBQXJCLElBQUEsQ0FBQSxrQkFBQTs7QUFFQUwsSUFBQXVELElBQUEsQ0FBQSxlQUFBLEVBQUE5QyxJQUFBLEVBQUFzSixJQUFBLENBQUEsVUFBQW9ELFFBQUEsRUFBQTtBQUNBLE9BQUFBLFNBQUEsTUFBQSxFQUFBLFFBQUEsTUFBQSxHQUFBLEVBQUE7QUFDQUYsWUFBQTNKLEtBQUE7QUFDQTFFLFFBQUE0RSxNQUFBLENBQUF1SSxNQUFBLENBQUFvQixTQUFBLE1BQUEsQ0FBQTtBQUNBekosT0FBQW1DLEtBQUEsQ0FBQXBDLElBQUEsQ0FBQTBKLFNBQUEsTUFBQSxFQUFBLFNBQUEsQ0FBQTtBQUNBdkosY0FBQWdLLE9BQUEsQ0FBQSxHQUFBOztBQUVBcE8sWUFBQTJOLFNBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQSxJQUFBQSxTQUFBLE1BQUEsQ0FBQTtBQUNBLElBUEEsTUFPQTtBQUNBekosT0FBQW1DLEtBQUEsQ0FBQXBDLElBQUEsQ0FBQTBKLFNBQUEsTUFBQSxFQUFBLFNBQUEsSUFBQUEsU0FBQSxNQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsa0NBQUE7QUFDQTtBQUNBLEdBWEEsRUFXQVUsSUFYQSxDQVdBLFlBQUE7QUFDQWhJLFNBQUFwQyxJQUFBLENBQUEsa0NBQUE7QUFDQSxHQWJBO0FBZUEsRUFsQ0EsRUFrQ0FXLEVBbENBLENBa0NBLE9BbENBLEVBa0NBLE9BbENBLEVBa0NBLFVBQUFsQixLQUFBLEVBQUE7QUFDQUEsUUFBQXNDLGNBQUE7QUFDQXlILFVBQUEzSixLQUFBO0FBQ0EsRUFyQ0E7QUFzQ0EsQ0FsREE7O0FBb0RBLElBQUEySixVQUFBck8sSUFBQXlOLElBQUE7O0FDMU5BO0FBQ0E7QUFDQTtBQUNBLElBQUF5QixNQUFBOztBQUVBLElBQUFDLFFBQUEsWUFBQTtBQUNBLFFBQUE7QUFDQXJKLFFBQUEsWUFBQTtBQUNBO0FBQ0FvSixVQUFBcE0sUUFBQSxDQUFBLElBQUEsRUFBQW9DLE1BQUEsR0FBQXBDLFFBQUEsQ0FBQSxPQUFBO0FBQ0FpQyxPQUFBLE1BQUEsRUFBQWpDLFFBQUEsQ0FBQSxXQUFBO0FBQ0FpRCxjQUFBLFlBQUE7QUFBQTNFLE1BQUEscUJBQUEsRUFBQThOLE1BQUEsRUFBQUwsS0FBQTtBQUFBLElBQUEsRUFBQSxHQUFBO0FBQ0EsR0FOQTtBQU9BNUwsUUFBQSxZQUFBO0FBQ0E4QixPQUFBLE1BQUEsRUFBQTdCLFdBQUEsQ0FBQSxXQUFBO0FBQ0FnTSxVQUFBaE0sV0FBQSxDQUFBLE9BQUEsRUFBQThDLEdBQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBa0osV0FBQWhNLFdBQUEsQ0FBQSxJQUFBO0FBQ0EsSUFGQTtBQUdBO0FBQ0E7QUFiQSxFQUFBO0FBZUEsQ0FoQkEsRUFBQTs7QUFrQkE5QixFQUFBLFlBQUE7QUFDQThOLFVBQUE5TixFQUFBLFFBQUEsQ0FBQTtBQUNBQSxHQUFBLG1CQUFBLEVBQUEyRCxJQUFBLFNBQUEsQ0FBQSxFQUFBUyxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUFsQixLQUFBLEVBQUE7QUFDQUEsUUFBQXNDLGNBQUE7QUFDQUQsVUFBQWpDLEtBQUE7QUFDQXlLLFFBQUFySixJQUFBO0FBQ0EsRUFKQTtBQUtBb0osUUFBQTFKLEVBQUEsQ0FBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLFVBQUFsQixLQUFBLEVBQUE7QUFDQUEsUUFBQXNDLGNBQUE7QUFDQXVJLFFBQUFsTSxJQUFBO0FBQ0EsRUFIQSxFQUdBdUMsRUFIQSxDQUdBLFFBSEEsRUFHQSxNQUhBLEVBR0EsVUFBQWxCLEtBQUEsRUFBQTtBQUNBQSxRQUFBc0MsY0FBQTs7QUFFQXhGLElBQUFnSCxPQUFBLENBQUEsb0NBQUFGLE1BQUEsR0FBQSxZQUFBLEdBQUFKLE9BQUEsR0FBQSxhQUFBLEVBQUExRyxFQUFBLE1BQUEsRUFBQThOLE1BQUEsRUFBQUgsU0FBQSxFQUFBLEVBQUE1RCxJQUFBLENBQUEsVUFBQW9ELFFBQUEsRUFBQTtBQUNBLE9BQUFBLFNBQUEsTUFBQSxFQUFBLFFBQUEsTUFBQSxHQUFBLEVBQUE7QUFDQUUsV0FBQUYsU0FBQSxNQUFBLENBQUE7QUFDQUUsU0FBQSxXQUFBLElBQUEsSUFBQTtBQUNBVyxpQkFBQUMsT0FBQSxDQUFBLE1BQUEsRUFBQUMsS0FBQUMsU0FBQSxDQUFBZCxJQUFBLENBQUE7O0FBRUExSixRQUFBLE1BQUEsRUFBQWpDLFFBQUEsQ0FBQSxvQkFBQTJMLEtBQUEsT0FBQSxDQUFBO0FBQ0FVLFVBQUFsTSxJQUFBO0FBQ0E4QyxlQUFBLFlBQUE7QUFDQWpCLFFBQUFtQyxLQUFBLENBQUFuQixJQUFBLENBQUEsU0FBQTJJLEtBQUEsTUFBQSxDQUFBLEdBQUEsR0FBQTtBQUNBLEtBRkEsRUFFQSxHQUZBO0FBR0EsSUFWQSxNQVVBO0FBQ0FyTixNQUFBLGFBQUEsRUFBQThOLE1BQUEsRUFBQXBNLFFBQUEsQ0FBQSxnQkFBQTtBQUNBaUQsZUFBQSxZQUFBO0FBQUEzRSxPQUFBLGFBQUEsRUFBQThOLE1BQUEsRUFBQWhNLFdBQUEsQ0FBQSxnQkFBQTtBQUFBLEtBQUEsRUFBQSxJQUFBO0FBQ0E7QUFDQSxHQWZBO0FBZ0JBLEVBdEJBOztBQXdCQTlCLEdBQUEsb0JBQUEsRUFBQTJELElBQUEsU0FBQSxDQUFBLEVBQUFTLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQWxCLEtBQUEsRUFBQTtBQUNBQSxRQUFBc0MsY0FBQTtBQUNBN0IsTUFBQSxNQUFBLEVBQUE3QixXQUFBLENBQUEsb0JBQUF1TCxLQUFBLE9BQUEsQ0FBQTs7QUFFQUEsU0FBQTtBQUNBLFNBQUEsSUFEQTtBQUVBLFdBQUEsSUFGQTtBQUdBLFlBQUEsSUFIQTtBQUlBLFlBQUEsSUFKQTtBQUtBLFlBQUEsSUFMQTtBQU1BLGdCQUFBO0FBTkEsR0FBQTtBQVFBVyxlQUFBQyxPQUFBLENBQUEsTUFBQSxFQUFBQyxLQUFBQyxTQUFBLENBQUFkLElBQUEsQ0FBQTs7QUFFQTlILFVBQUFqQyxLQUFBO0FBQ0FxQixhQUFBLFlBQUE7QUFDQWpCLE1BQUFtQyxLQUFBLENBQUFuQixJQUFBLENBQUEsbUJBQUE7QUFDQSxHQUZBLEVBRUEsR0FGQTtBQUdBLEVBbEJBO0FBbUJBLENBbERBOztBQW9EQTtBQUNBOztBQUVBLElBQUEySSxPQUFBO0FBQ0EsT0FBQSxJQURBO0FBRUEsU0FBQSxJQUZBO0FBR0EsVUFBQSxJQUhBO0FBSUEsVUFBQSxJQUpBO0FBS0EsVUFBQSxJQUxBO0FBTUEsY0FBQTtBQU5BLENBQUE7O0FBU0EsSUFBQVcsZ0JBQUFBLGFBQUFJLE9BQUEsQ0FBQSxNQUFBLENBQUEsRUFBQTtBQUNBZixRQUFBYSxLQUFBRyxLQUFBLENBQUFMLGFBQUFJLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTs7QUFFQXBPLEdBQUEsWUFBQTtBQUNBLE1BQUFxTixLQUFBLElBQUEsTUFBQSxJQUFBLEVBQUE7QUFDQTFKLE9BQUEsTUFBQSxFQUFBakMsUUFBQSxDQUFBLG9CQUFBMkwsS0FBQSxPQUFBLENBQUE7QUFDQTFJLGNBQUEsWUFBQTtBQUNBakIsT0FBQW1DLEtBQUEsQ0FBQW5CLElBQUEsQ0FBQSxTQUFBMkksS0FBQSxNQUFBLENBQUEsR0FBQSxHQUFBO0FBQ0EsSUFGQSxFQUVBLElBRkE7QUFHQTtBQUNBLEVBUEE7QUFRQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0EsSUFBQWlCLDhCQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLEVBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxJQUFBQyxhQUFBLEVBQUE7O0FBRUEsU0FBQUMsTUFBQSxDQUFBQyxLQUFBLEVBQUE7QUFDQUMsU0FBQUMsV0FBQSxDQUFBRixLQUFBLEVBQUEsVUFBQUcsSUFBQSxFQUFBQyxJQUFBLEVBQUE7QUFDQSxNQUFBLFNBQUFDLElBQUEsQ0FBQUYsS0FBQXhQLElBQUEsQ0FBQSxFQUFBO0FBQ0FtUCxjQUFBSyxLQUFBLE1BQUEsQ0FBQSxJQUFBQyxJQUFBO0FBQ0EsVUFBQSxJQUFBO0FBQ0E7QUFDQTtBQUNBLFNBQUEsS0FBQTtBQUNBLEVBUEEsRUFPQSxVQUFBSixLQUFBLEVBQUFNLFFBQUEsRUFBQTtBQUNBLE1BQUFOLE1BQUF0TixNQUFBLEVBQUE7QUFDQW5CLEtBQUEsU0FBQSxFQUFBdU0sS0FBQSxFQUFBN0ssUUFBQSxDQUFBLFVBQUE7O0FBRUE7QUFDQWdOLFdBQUF6TyxJQUFBLENBQUF3TyxLQUFBLEVBQUEsVUFBQUcsSUFBQSxFQUFBO0FBQ0EsUUFBQUksbUJBQUFULFdBQUFLLEtBQUEsTUFBQSxDQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsQ0FBQTtBQUNBTCxlQUFBSyxLQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsSUFBQW5QLGdCQUFBLEdBQUEsR0FBQTROLEtBQUEsSUFBQSxDQUFBLEdBQUEsR0FBQSxHQUNBbkYsU0FBQWMsTUFBQSxDQUFBLEdBQUEsQ0FEQSxHQUNBLEdBREEsR0FDQXRKLEtBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQStILE9BQUEsQ0FBQSxDQUFBLENBREE7O0FBR0EsUUFBQW1ILEtBQUEsTUFBQSxLQUFBLFdBQUEsRUFBQTtBQUNBLFNBQUFLLFNBQUEsSUFBQUMsVUFBQSxFQUFBO0FBQ0FELFlBQUFFLE1BQUEsR0FBQSxVQUFBak0sS0FBQSxFQUFBO0FBQ0EsVUFBQWtNLE1BQUFwUCxFQUFBLFNBQUEsRUFBQUksSUFBQSxDQUFBLEtBQUEsRUFBQThDLE1BQUFtTSxNQUFBLENBQUFDLE1BQUEsQ0FBQTtBQUNBLFVBQUFDLFdBQUF2UCxFQUFBLGtEQUFBLEVBQUEyQixHQUFBLENBQUE0TSxXQUFBSyxLQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUFZLFVBQUF4UCxFQUFBLFNBQUEsRUFBQTBCLFFBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQTFCLFFBQUEsU0FBQSxFQUFBMEIsUUFBQSxDQUFBLFFBQUEsRUFBQXJCLElBQUEsQ0FBQSxtQ0FBQSxFQUFBZ0YsUUFBQSxDQUFBbUssT0FBQTtBQUNBeFAsUUFBQSxTQUFBLEVBQUEwQixRQUFBLENBQUEsS0FBQSxFQUFBMkQsUUFBQSxDQUFBbUssT0FBQTs7QUFFQSxVQUFBQyxXQUFBelAsRUFBQSxRQUFBLEVBQUFJLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFDQW1PLFdBQUFLLEtBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxDQURBLEVBQ0EvRyxNQURBLENBQ0EwSCxRQURBLEVBQ0ExSCxNQURBLENBQ0EySCxPQURBLEVBQ0EzSCxNQURBLENBQ0F1SCxHQURBLENBQUE7QUFFQXBQLFFBQUEsa0JBQUEsRUFBQTZILE1BQUEsQ0FBQTRILFFBQUE7QUFDQSxNQVhBO0FBWUFSLFlBQUFTLGFBQUEsQ0FBQWQsSUFBQTtBQUNBLEtBZkEsTUFlQTtBQUNBRixhQUNBaUIsS0FEQSxDQUNBZixJQURBLEVBRUFnQixNQUZBLENBRUF0Qiw0QkFBQVUsZ0JBQUEsQ0FGQSxFQUdBYSxNQUhBLENBR0EsR0FIQSxFQUdBLEdBSEEsRUFHQSxTQUhBLEVBSUFDLEdBSkEsQ0FJQSxVQUFBQyxHQUFBLEVBQUFYLEdBQUEsRUFBQTtBQUNBO0FBQ0E7QUFDQSxVQUFBRyxXQUFBdlAsRUFBQSxrREFBQSxFQUFBMkIsR0FBQSxDQUFBNE0sV0FBQUssS0FBQSxNQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQTs7QUFFQSxVQUFBWSxVQUFBeFAsRUFBQSxTQUFBLEVBQUEwQixRQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0ExQixRQUFBLFNBQUEsRUFBQTBCLFFBQUEsQ0FBQSxRQUFBLEVBQUFyQixJQUFBLENBQUEsbUNBQUEsRUFBQWdGLFFBQUEsQ0FBQW1LLE9BQUE7QUFDQXhQLFFBQUEsU0FBQSxFQUFBMEIsUUFBQSxDQUFBLEtBQUEsRUFBQTJELFFBQUEsQ0FBQW1LLE9BQUE7O0FBRUEsVUFBQUMsV0FBQXpQLEVBQUEsUUFBQSxFQUFBSSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQ0FtTyxXQUFBSyxLQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsQ0FEQSxFQUNBL0csTUFEQSxDQUNBMEgsUUFEQSxFQUNBMUgsTUFEQSxDQUNBMkgsT0FEQSxFQUNBM0gsTUFEQSxDQUNBdUgsR0FEQSxDQUFBO0FBRUFwUCxRQUFBLGtCQUFBLEVBQUE2SCxNQUFBLENBQUE0SCxRQUFBO0FBQ0EsTUFoQkE7QUFpQkE7QUFDQSxJQXZDQTs7QUF5Q0E7QUFDQSxPQUFBaEIsTUFBQSxDQUFBLEVBQUEsTUFBQSxLQUFBLFdBQUEsRUFBQTtBQUNBcFAsWUFBQUgsR0FBQSxDQUFBLEtBQUE7QUFDQXdQLFlBQUFGLE1BQUEsQ0FBQTtBQUNBOUIsVUFBQSxlQURBO0FBRUFqTSxXQUFBO0FBQ0F3RixjQUFBLFFBREE7QUFFQStKLGVBQUF4UixNQUFBZSxXQUFBLENBQUEsUUFBQSxDQUZBO0FBR0F5SyxjQUFBdkssYUFIQTtBQUlBNEgsYUFBQWdHLEtBQUEsT0FBQSxDQUpBO0FBS0FBLFlBQUFBLEtBQUEsSUFBQTtBQUxBLE1BRkE7QUFTQTRDLGNBQUEsVUFBQXJCLElBQUEsRUFBQXNCLE9BQUEsRUFBQTtBQUNBQSxjQUFBelAsSUFBQSxDQUFBMFAsR0FBQSxHQUFBNUIsV0FBQUssS0FBQSxNQUFBLENBQUEsRUFBQSxLQUFBLENBQUE7QUFDQUEsV0FBQXVCLEdBQUEsR0FBQTVCLFdBQUFLLEtBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBO0FBQ0EsTUFaQTs7QUFjQUgsWUFBQUEsS0FkQTtBQWVBMkIsbUJBQUEsVUFBQWxOLEtBQUEsRUFBQTBMLElBQUEsRUFBQXlCLEdBQUEsRUFBQTtBQUNBLFVBQUFDLFVBQUEsQ0FBQXBOLE1BQUEsUUFBQSxJQUFBQSxNQUFBLE9BQUEsQ0FBQSxHQUFBLEdBQUEsRUFBQXVFLE9BQUEsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUNBNkIsU0FBQWdILFVBQUEsR0FBQSxHQUFBLHVDQUNBQSxPQURBLEdBQ0EsR0FEQSxHQUNBLHNDQUZBOztBQUlBdFEsUUFBQSxXQUFBNE8sS0FBQSxLQUFBLENBQUEsR0FBQSxVQUFBLEVBQUEsV0FBQSxFQUFBdk8sSUFBQSxDQUFBaUosTUFBQTtBQUNBLE1BckJBO0FBc0JBaUgsZUFBQSxVQUFBck4sS0FBQSxFQUFBO0FBQ0E7QUFDQTtBQUNBLE1BekJBO0FBMEJBc04sbUJBQUEsVUFBQTVCLElBQUEsRUFBQXlCLEdBQUEsRUFBQUgsT0FBQSxFQUFBO0FBQ0E7QUFDQWxRLFFBQUEsV0FBQWtRLFFBQUEsS0FBQSxDQUFBLEdBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTdQLElBQUEsQ0FBQSx1Q0FBQTtBQUNBLE1BN0JBO0FBOEJBb1EsZUFBQSxVQUFBVixHQUFBLEVBQUFNLEdBQUEsRUFBQTtBQUNBclEsUUFBQSxTQUFBLEVBQUF1TSxLQUFBLEVBQUF6SyxXQUFBLENBQUEsVUFBQTtBQUNBO0FBaENBLEtBQUE7QUFrQ0EsSUFwQ0EsTUFvQ0E7QUFDQTRNLFlBQUFGLE1BQUEsQ0FBQTtBQUNBOUIsVUFBQSxlQURBO0FBRUFqTSxXQUFBO0FBQ0F3RixjQUFBLFFBREE7QUFFQStKLGVBQUF4UixNQUFBZSxXQUFBLENBQUEsUUFBQSxDQUZBO0FBR0F5SyxjQUFBdkssYUFIQTtBQUlBNEgsYUFBQWdHLEtBQUEsT0FBQSxDQUpBO0FBS0FBLFlBQUFBLEtBQUEsSUFBQTtBQUxBLE1BRkE7QUFTQTRDLGNBQUEsVUFBQXJCLElBQUEsRUFBQXNCLE9BQUEsRUFBQTtBQUNBQSxjQUFBelAsSUFBQSxDQUFBMFAsR0FBQSxHQUFBNUIsV0FBQUssS0FBQSxNQUFBLENBQUEsRUFBQSxLQUFBLENBQUE7QUFDQUEsV0FBQXVCLEdBQUEsR0FBQTVCLFdBQUFLLEtBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBO0FBQ0EsTUFaQTs7QUFjQThCLDJCQUFBLElBZEE7QUFlQUMscUJBQUE7QUFDQUMsZ0JBQUEsSUFEQTtBQUVBQyxpQkFBQTtBQUZBLE1BZkE7O0FBb0JBcEMsWUFBQUEsS0FwQkE7QUFxQkEyQixtQkFBQSxVQUFBbE4sS0FBQSxFQUFBMEwsSUFBQSxFQUFBeUIsR0FBQSxFQUFBO0FBQ0EsVUFBQUMsVUFBQSxDQUFBcE4sTUFBQSxRQUFBLElBQUFBLE1BQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxFQUFBdUUsT0FBQSxDQUFBLENBQUEsQ0FBQTtBQUFBLFVBQ0E2QixTQUFBZ0gsVUFBQSxHQUFBLEdBQUEsdUNBQ0FBLE9BREEsR0FDQSxHQURBLEdBQ0Esc0NBRkE7O0FBSUF0USxRQUFBLFdBQUE0TyxLQUFBLEtBQUEsQ0FBQSxHQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUF2TyxJQUFBLENBQUFpSixNQUFBO0FBQ0EsTUEzQkE7QUE0QkFpSCxlQUFBLFVBQUFyTixLQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0EsTUEvQkE7QUFnQ0FzTixtQkFBQSxVQUFBNUIsSUFBQSxFQUFBeUIsR0FBQSxFQUFBSCxPQUFBLEVBQUE7QUFDQTtBQUNBbFEsUUFBQSxXQUFBa1EsUUFBQSxLQUFBLENBQUEsR0FBQSxVQUFBLEVBQUEsV0FBQSxFQUFBN1AsSUFBQSxDQUFBLHVDQUFBO0FBQ0EsTUFuQ0E7QUFvQ0FvUSxlQUFBLFVBQUFWLEdBQUEsRUFBQU0sR0FBQSxFQUFBO0FBQ0FyUSxRQUFBLFNBQUEsRUFBQXVNLEtBQUEsRUFBQXpLLFdBQUEsQ0FBQSxVQUFBO0FBQ0E7QUF0Q0EsS0FBQTtBQXdDQTtBQUNBO0FBQ0EsRUFySUE7QUFzSUE7O0FBRUE5QixFQUFBWSxFQUFBLENBQUE0TSxRQUFBLEdBQUEsWUFBQTtBQUNBO0FBQ0EsS0FBQXNELFlBQUE5USxFQUFBLFdBQUEsRUFBQSxJQUFBLENBQUE7QUFDQTBPLFNBQUF4TCxLQUFBLENBQUE2TixHQUFBLENBQUFELFVBQUEsQ0FBQSxDQUFBLEVBQUEsVUFBQUUsSUFBQSxFQUFBO0FBQ0EsTUFBQUEsSUFBQSxFQUFBO0FBQ0FGLGFBQUFwUCxRQUFBLENBQUEsUUFBQTtBQUNBLEdBRkEsTUFFQTtBQUNBb1AsYUFBQWhQLFdBQUEsQ0FBQSxRQUFBO0FBQ0E7QUFDQSxFQU5BLEVBTUEsVUFBQTJNLEtBQUEsRUFBQTtBQUNBRCxTQUFBQyxLQUFBO0FBQ0EsRUFSQTs7QUFVQTtBQUNBLEtBQUF3QyxjQUFBL00sU0FBQWdOLGNBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQXhDLFNBQUF4TCxLQUFBLENBQUFrQixFQUFBLENBQUE2TSxXQUFBLEVBQUEsUUFBQSxFQUFBLFVBQUEvTixLQUFBLEVBQUE7QUFDQSxNQUFBdUwsUUFBQUMsUUFBQXlDLFFBQUEsQ0FBQWpPLEtBQUEsQ0FBQTtBQUNBc0wsU0FBQUMsS0FBQTtBQUNBLEVBSEE7O0FBS0E7QUFDQSxLQUFBMkMsU0FBQXBSLEVBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQTtBQUNBb1IsUUFBQWhOLEVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUFsQixLQUFBLEVBQUE7QUFDQSxNQUFBNUQsR0FBQSxrQkFBQSxNQUFBLFNBQUEsRUFBQTtBQUNBNEQsU0FBQXNDLGNBQUE7QUFDQTtBQUNBLEVBSkEsRUFJQXBCLEVBSkEsQ0FJQSxpQkFKQSxFQUlBLFVBQUFsQixLQUFBLEVBQUE7QUFDQUEsUUFBQW1NLE1BQUEsQ0FBQS9PLE1BQUE7QUFDQSxFQU5BLEVBTUE4RCxFQU5BLENBTUEsY0FOQSxFQU1BLFVBQUFsQixLQUFBLEVBQUE7QUFDQUEsVUFBQUEsTUFBQW1PLGFBQUE7QUFDQW5PLFFBQUFtTSxNQUFBLENBQUFpQyxVQUFBLENBQUFDLFlBQUEsQ0FBQXJPLE1BQUFtTSxNQUFBLEVBQUFuTSxNQUFBc08sTUFBQSxDQUFBRCxZQUFBO0FBQ0EsU0FBQSxLQUFBO0FBQ0EsRUFWQTs7QUFZQSxLQUFBRSxJQUFBLENBQUFMLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsQ0FuQ0E7O0FDL0lBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBclMsT0FBQTJTLEtBQUEsR0FBQSxZQUFBO0FBQ0ExUyxTQUFBLGFBQUEsSUFBQTJGLFdBQUEsWUFBQTtBQUNBekYsTUFBQSxjQUFBLEVBQUEsTUFBQTs7QUFFQUosTUFBQSxhQUFBLElBQUFrQixFQUFBMlIsUUFBQSxFQUFBO0FBQ0E1UyxTQUFBNlMsSUFBQTs7QUFFQTlTLE1BQUEsYUFBQSxFQUFBaUwsSUFBQSxDQUFBLFlBQUE7QUFDQS9LLFdBQUEsZ0JBQUEsSUFBQTJGLFdBQUEvRixJQUFBbUosUUFBQSxDQUFBQyxLQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0EsR0FGQTtBQUlBLEVBVkEsRUFVQSxHQVZBLENBQUE7QUFXQSxDQVpBLEVBQUE7O0FBZUE7QUFDQWpKLE9BQUE2UyxJQUFBLEdBQUEsWUFBQTtBQUNBNVMsU0FBQSxZQUFBLElBQUEyRixXQUFBLFlBQUE7QUFDQXpGLE1BQUEsYUFBQSxFQUFBLE1BQUE7O0FBRUF5SCxXQUFBLE9BQUEsRUFBQW9ELElBQUEsQ0FBQSxVQUFBb0QsUUFBQSxFQUFBO0FBQ0FqTyxPQUFBLGdDQUFBO0FBQ0FWLFNBQUFDLE1BQUEsR0FBQTBPLFNBQUEsUUFBQSxDQUFBO0FBQ0EzTyxTQUFBRSxNQUFBLEdBQUF5TyxTQUFBLFFBQUEsQ0FBQTtBQUNBM08sU0FBQUcsT0FBQSxHQUFBd08sU0FBQSxTQUFBLENBQUE7QUFDQXJPLE9BQUEsYUFBQSxFQUFBK1MsT0FBQTs7QUFFQTdTLFdBQUEsYUFBQSxJQUFBMkYsV0FBQS9GLElBQUFKLEtBQUEsQ0FBQXdKLEtBQUEsRUFBQSxDQUFBLENBQUE7QUFDQTs7QUFFQTtBQUNBO0FBRUEsR0FiQTs7QUFlQWpKLFNBQUErUyxNQUFBO0FBQ0EsRUFuQkEsRUFtQkEsR0FuQkEsQ0FBQTtBQW9CQSxDQXJCQTs7QUF3QkE7QUFDQS9TLE9BQUErUyxNQUFBLEdBQUEsWUFBQTtBQUNBLEtBQUFDLFVBQUE7QUFDQSxhQUFBLENBREE7QUFFQSxXQUFBLENBRkE7QUFHQSxXQUFBLENBSEE7QUFJQSxrQkFBQTtBQUpBLEVBQUE7O0FBT0EvUyxTQUFBLFdBQUEsSUFBQWlLLFlBQUEsWUFBQTtBQUNBL0osTUFBQSxlQUFBLEVBQUEsTUFBQTs7QUFFQXlILFdBQUEsWUFBQSxFQUFBb0QsSUFBQSxDQUFBLFVBQUFvRCxRQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0EsUUFBQSxJQUFBNkUsU0FBQSxJQUFBN0UsUUFBQSxFQUFBO0FBQ0EsUUFBQWpGLE9BQUE4SixVQUFBLElBQUEsQ0FBQSxFQUFBckosT0FBQSxDQUFBb0osUUFBQSxjQUFBLENBQUEsS0FBQUMsVUFBQSxPQUFBLEtBQUEzRSxLQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0EwRSxhQUFBLE9BQUE7QUFDQSxTQUFBdlEsTUFBQSxNQUFBLE1BQUEsYUFBQSxFQUFBO0FBQ0F1USxjQUFBLFNBQUE7QUFDQSxNQUZBLE1BRUEsSUFBQXZRLE1BQUEsTUFBQSxNQUFBLFdBQUEsRUFBQTtBQUNBdVEsY0FBQSxPQUFBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsT0FBQUEsUUFBQSxPQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0E7QUFDQSxRQUFBRSxRQUFBO0FBQ0EsZ0JBQUFGLFFBQUEsU0FBQSxJQUFBLEdBQUEsSUFBQUEsUUFBQSxTQUFBLElBQUEsQ0FBQSxHQUFBLGVBQUEsR0FBQSxhQUFBLENBREE7QUFFQSxjQUFBQSxRQUFBLE9BQUEsSUFBQSxHQUFBLElBQUFBLFFBQUEsT0FBQSxJQUFBLENBQUEsR0FBQSxhQUFBLEdBQUEsV0FBQSxDQUZBO0FBR0EsY0FBQTtBQUhBLEtBQUE7O0FBTUEsUUFBQUEsUUFBQSxTQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0FFLFdBQUEsT0FBQSxLQUFBQSxNQUFBLFNBQUEsQ0FBQTtBQUNBO0FBQ0EsUUFBQUYsUUFBQSxTQUFBLElBQUEsQ0FBQSxJQUFBQSxRQUFBLE9BQUEsSUFBQSxDQUFBLEVBQUE7QUFDQUUsV0FBQSxPQUFBLEtBQUEsS0FBQTtBQUNBO0FBQ0EsUUFBQUYsUUFBQSxPQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0FFLFdBQUEsT0FBQSxLQUFBQSxNQUFBLE9BQUEsQ0FBQTtBQUNBOztBQUVBdk8sT0FBQW1DLEtBQUEsQ0FBQW5CLElBQUEsQ0FBQTtBQUNBLG1CQUFBLElBREE7QUFFQSxnQkFBQXVOLE1BQUEsT0FBQSxDQUZBO0FBR0EsY0FBQSxXQUhBO0FBSUEsZUFBQSxZQUFBO0FBQ0FsVCxhQUFBNlMsSUFBQTtBQUNBRyxjQUFBLFNBQUEsSUFBQSxDQUFBO0FBQ0FBLGNBQUEsT0FBQSxJQUFBLENBQUE7QUFDQUEsY0FBQSxPQUFBLElBQUEsQ0FBQTtBQUNBcE8sVUFBQSxZQUFBLEVBQUF0RCxJQUFBLENBQUFxRCxHQUFBakQsSUFBQSxDQUFBLFlBQUEsQ0FBQTtBQUNBO0FBVkEsS0FBQTs7QUFhQTtBQUNBa0QsUUFBQSxPQUFBLEVBQUF0RCxJQUFBLENBQUEsTUFBQTBSLFFBQUEsT0FBQSxDQUFBLEdBQUEsSUFBQSxHQUFBck8sR0FBQWpELElBQUEsQ0FBQSxZQUFBLENBQUE7QUFDQTs7QUFFQXNSLFdBQUEsY0FBQSxJQUFBNUUsU0FBQSxDQUFBLElBQUFqRixPQUFBaUYsU0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLENBQUEsR0FBQWpGLFFBQUE7QUFDQSxHQW5EQTtBQW9EQSxFQXZEQSxFQXVEQSxLQUFBLElBdkRBLENBQUE7QUF3REEsQ0FoRUE7O0FDOUNBO0FBQ0E7QUFDQTs7QUFFQWdLLFFBQUF0SSxJQUFBLENBQUE7QUFDQTVLLFVBQUEsS0FEQTtBQUVBbVQsU0FBQTtBQUNBQyxZQUFBLENBQ0EsZ0JBREEsRUFFQSxnQ0FGQSxFQUdBLHVCQUhBLEVBSUEsZ0JBSkE7QUFEQSxFQUZBO0FBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUMsU0FBQSxZQUFBO0FBQ0FyUyxJQUFBLFlBQUE7QUFDQXBCLE9BQUFKLEtBQUEsQ0FBQXFNLE1BQUE7QUFDQSxHQUZBO0FBR0E7QUFyQkEsQ0FBQTs7QUNKQTtBQUNBO0FBQ0E7O0FBRUEzQyxPQUFBb0ssTUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsMkZBQUFyUixLQUFBLENBQUEsR0FBQSxDQURBO0FBRUEsZ0JBQUEsa0RBQUFBLEtBQUEsQ0FBQSxHQUFBLENBRkE7QUFHQSxhQUFBLGlGQUFBQSxLQUFBLENBQUEsR0FBQSxDQUhBO0FBSUEsa0JBQUEsOEJBQUFBLEtBQUEsQ0FBQSxHQUFBLENBSkE7QUFLQSxnQkFBQSx5QkFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FMQTtBQU1BLG1CQUFBO0FBQ0EsUUFBQSxPQURBO0FBRUEsU0FBQSxVQUZBO0FBR0EsT0FBQSxZQUhBO0FBSUEsUUFBQSx1QkFKQTtBQUtBLFNBQUEsa0NBTEE7QUFNQSxVQUFBO0FBTkEsRUFOQTtBQWNBLGFBQUE7QUFDQSxhQUFBLFdBREE7QUFFQSxhQUFBLGFBRkE7QUFHQSxjQUFBLFNBSEE7QUFJQSxhQUFBLFlBSkE7QUFLQSxjQUFBLFNBTEE7QUFNQSxjQUFBO0FBTkEsRUFkQTtBQXNCQSxpQkFBQTtBQUNBLFlBQUEsVUFEQTtBQUVBLFVBQUEsVUFGQTtBQUdBLE9BQUEsaUJBSEE7QUFJQSxPQUFBLFdBSkE7QUFLQSxRQUFBLFlBTEE7QUFNQSxPQUFBLFVBTkE7QUFPQSxRQUFBLFVBUEE7QUFRQSxPQUFBLFFBUkE7QUFTQSxRQUFBLFNBVEE7QUFVQSxPQUFBLFFBVkE7QUFXQSxRQUFBLFVBWEE7QUFZQSxPQUFBLFFBWkE7QUFhQSxRQUFBO0FBYkEsRUF0QkE7QUFxQ0EsaUJBQUEsVUFyQ0E7QUFzQ0EsWUFBQTtBQXRDQSxDQUFBIiwiZmlsZSI6Imxpc3RhLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbGlzdGEgZGUgdGFyZWZhcyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5sZXQgTGlzdGEgPSBbIF07XG5MaXN0YS5FZGljYW8gPSBbIF07XG5MaXN0YS5QbGFjYXIgPSBbIF07XG5MaXN0YS5UYXJlZmFzID0gWyBdO1xuXG5sZXQgYXBwID0gWyBdO1xudmFyICRhcHAgPSBbIF07IC8vIFRPRE8gZXhpc3RlPz9cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5sZXQgY3VlID0gWyBdO1xubGV0IHdvcmtlciA9IFsgXTtcbmxldCB0aW1lb3V0ID0gWyBdO1xuXG5sZXQgbG9nZ2luZyA9IHRydWU7XG5sZXQgbG9nID0gZnVuY3Rpb24obWVzc2FnZSwgdHlwZSkge1xuXHRpZiAobG9nZ2luZykge1xuXHRcdGlmICghdHlwZSkge1xuXHRcdFx0Y29uc29sZS5sb2cobWVzc2FnZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGVbdHlwZV0obWVzc2FnZSk7XG5cdFx0fVxuXHR9XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gZGFxdWkgcHJhIGJhaXhvIG7Do28gw6kgcHJhIHRlciBuYWRhISFcblxudmFyIHVpID0gWyBdO1xuXG5MaXN0YS5SZWd1bGFtZW50byA9IFsgXTsgLy8gVE9ETyBkZXByZWNhdGVkXG4vLyB2YXIgZWRpY2FvID0gXCJ4Y2lpaVwiO1xuXG5cblxuLy8gbGFndWluaG8ub3JnL3RhcmVmYXNcbnZhciB0YXJlZmFzID0geyB9O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGVsZW1lbnRzICYgaGVscGVycyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHZhciAkdGhlbWVfY29sb3IsIHRoZW1lX2NvbG9yID0geyB9O1xudmFyIHRhcmVmYV9hY3RpdmU7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIG8gb2JqZXRvIFwidWlcIiBndWFyZGEgaW5mb3JtYcOnw7VlcyBzb2JyZSBhIGludGVyZmFjZSwgY29tbyBkaW1lbnPDtWVzIGUgdGlwbyBkZSBpbnRlcmHDp8Ojb1xuLy8gdmFyIHVpICA9IHsgfTtcblxuXG4vKlxuXG52YXJpYcOnw7VlcyBkYSBpbnRlcmZhY2U6XG5cbjEgY29sdW5hOiB0ZWxhIMO6bmljYSwgMSBjb2x1bmEgbmEgdGFyZWZhXG4yIGNvbHVuYXM6IHRlbGEgw7puaWNhLCAyIGNvbHVuYXMgbmEgdGFyZWZhXG4zIGNvbHVuYXM6IHRlbGEgZGl2aWRpZGEsIDEgY29sdW5hIGxhcmdhIG5hIHRhcmVmYVxuNCBjb2x1bmFzOiB0ZWxhIGRpdmlkaWRhLCAyIGNvbHVuYXMgbGFyZ2FzIG5hIHRhcmVmYVxuXG5cblxuXG4qL1xuXG5cbi8vIGxvYWRpbmdcbi8qXG52YXIgbG9hZGluZyA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblx0XHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRcdGJhY2tkcm9wLnNob3coKTtcblx0XHRcdCRsb2FkaW5nLmFkZENsYXNzKFwiaW5cIik7XG5cdFx0fSxcblx0XHRoaWRlOiBmdW5jdGlvbigpIHtcblx0XHRcdCRsb2FkaW5nLnJlbW92ZUNsYXNzKFwiaW5cIik7XG5cdFx0XHRiYWNrZHJvcC5oaWRlKCk7XG5cdFx0fVxuXHR9XG59KSgpO1xuJChmdW5jdGlvbigpIHtcblx0JGxvYWRpbmcgPSAkKFwiI2xvYWRpbmdcIik7XG59KTtcbiovXG5cbi8vIHZhciBhcGlfa2V5O1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgLyB1dGlsaXRpZXMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBsYXlvdXQgcHJvcGVydGllc1xuVUkuZGF0YVtcIndpbmRvd1wiXSA9IFsgXTtcblVJLmRhdGFbXCJjb2x1bW4td2lkdGhcIl0gPSAzMTY7IC8vIGxhcmd1cmEgZGEgY29sdW5hLCBpbmNsdWluZG8gbWFyZ2VtXG5cbmZ1bmN0aW9uIHNldExheW91dFByb3BlcnRpZXMoKSB7XG5cdC8vIGRpbWVuc8O1ZXMgZGEgamFuZWxhXG5cdFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJ3aWR0aFwiXSA9ICR1aVtcIndpbmRvd1wiXS53aWR0aCgpO1xuXHRVSS5kYXRhW1wid2luZG93XCJdW1wiaGVpZ2h0XCJdID0gJHVpW1wid2luZG93XCJdLmhlaWdodCgpO1xuXG5cdC8vIGNhbGN1bGEgbsO6bWVybyBkZSBjb2x1bmFzXG5cdFVJLmRhdGFbXCJjb2x1bW5zXCJdID0gTWF0aC5mbG9vcihVSS5kYXRhW1wid2luZG93XCJdW1wid2lkdGhcIl0gLyBVSS5kYXRhW1wiY29sdW1uLXdpZHRoXCJdKTtcblxuXHQvLyBhZGljaW9uYSBjbGFzc2Ugbm8gPGJvZHk+IGRlIGFjb3JkbyBjb20gYSBxdWFudGlkYWRlIGRlIGNvbHVuYXNcblx0bGV0IGxheW91dF9jbGFzcztcblx0aWYgKFVJLmRhdGFbXCJjb2x1bW5zXCJdID09PSAxKSB7XG5cdFx0bGF5b3V0X2NsYXNzID0gXCJ1aS1zaW5nbGUtY29sdW1uXCI7XG5cdH0gZWxzZSBpZiAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPT09IDIpIHtcblx0XHRsYXlvdXRfY2xhc3MgPSBcInVpLWR1YWwtY29sdW1uXCI7XG5cdH0gZWxzZSB7XG5cdFx0bGF5b3V0X2NsYXNzID0gXCJ1aS1tdWx0aS1jb2x1bW5cIjtcblx0fVxuXG5cdCR1aVtcImJvZHlcIl0ucmVtb3ZlQ2xhc3MoXCJ1aS1zaW5nbGUtY29sdW1uIHVpLWR1YWwtY29sdW1uIHVpLW11bHRpLWNvbHVtblwiKS5hZGRDbGFzcyhsYXlvdXRfY2xhc3MpO1xufVxuXG4kKGZ1bmN0aW9uKCkgeyBzZXRMYXlvdXRQcm9wZXJ0aWVzKCk7IH0pO1xuJHVpW1wid2luZG93XCJdLm9uKFwicmVzaXplXCIsIHNldExheW91dFByb3BlcnRpZXMpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gc2Nyb2xsXG5VSS5kYXRhW1wic2Nyb2xsLXBvc2l0aW9uXCJdID0gWyBdO1xuXG5mdW5jdGlvbiBzZXRTY3JvbGxQb3NpdGlvbigpIHtcblx0VUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXVtcInRvcFwiXSA9ICR1aVtcIndpbmRvd1wiXS5zY3JvbGxUb3AoKTtcblx0VUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXVtcImJvdHRvbVwiXSA9IFVJLmRhdGFbXCJzY3JvbGwtcG9zaXRpb25cIl1bXCJ0b3BcIl0gKyBVSS5kYXRhW1wid2luZG93XCJdW1wiaGVpZ2h0XCJdO1xufVxuXG4kKGZ1bmN0aW9uKCkgeyBzZXRTY3JvbGxQb3NpdGlvbigpOyB9KTtcbiR1aVtcIndpbmRvd1wiXS5vbihcInNjcm9sbCByZXNpemVcIiwgc2V0U2Nyb2xsUG9zaXRpb24pO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHRlbXBsYXRlIGVuZ2luZSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyICR0ZW1wbGF0ZXMgPSB7IH07XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCQoXCJ0ZW1wbGF0ZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkdGhpcyA9ICQodGhpcyk7XG5cdFx0dmFyIG5hbWUgPSAkdGhpcy5hdHRyKFwiaWRcIik7XG5cdFx0dmFyIGh0bWwgPSAkdGhpcy5odG1sKCk7XG5cblx0XHQkdGVtcGxhdGVzW25hbWVdID0gJChodG1sKTtcblx0XHQkdGhpcy5yZW1vdmUoKTtcblx0fSk7XG59KTtcblxuZnVuY3Rpb24gX19yZW5kZXIodGVtcGxhdGUsIGRhdGEpIHtcblx0aWYgKCEkdGVtcGxhdGVzW3RlbXBsYXRlXSkgeyByZXR1cm4gZmFsc2U7IH1cblx0dmFyICRyZW5kZXIgPSAkdGVtcGxhdGVzW3RlbXBsYXRlXS5jbG9uZSgpO1xuXG5cdCRyZW5kZXIuZGF0YShkYXRhKTtcblxuXHQkLmZuLmZpbGxCbGFua3MgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgJGJsYW5rID0gJCh0aGlzKTtcblx0XHR2YXIgZmlsbCA9ICRibGFuay5kYXRhKFwiZmlsbFwiKTtcblxuXHRcdHZhciBydWxlcyA9IGZpbGwuc3BsaXQoXCIsXCIpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBwYWlyID0gcnVsZXNbaV0uc3BsaXQoXCI6XCIpO1xuXHRcdFx0dmFyIGRlc3QgPSAocGFpclsxXT8gcGFpclswXS50cmltKCkgOiBcImh0bWxcIik7XG5cdFx0XHR2YXIgc291cmNlID0gKHBhaXJbMV0/IHBhaXJbMV0udHJpbSgpIDogcGFpclswXSk7XG5cdFx0XHR2YXIgdmFsdWUgPSBkYXRhW3NvdXJjZV07XG5cblx0XHRcdHNvdXJjZSA9IHNvdXJjZS5zcGxpdChcIi9cIik7XG5cdFx0XHRpZiAoc291cmNlLmxlbmd0aCA+IDEgJiYgdHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdHZhbHVlID0gZGF0YVtzb3VyY2VbMF1dO1xuXG5cdFx0XHRcdGZvciAodmFyIGogPSAxOyBqIDwgc291cmNlLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSAodmFsdWVbc291cmNlW2pdXSk/IHZhbHVlW3NvdXJjZVtqXV0gOiBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIgJiYgdmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0aWYgKGRlc3QgPT09IFwiY2xhc3NcIikge1xuXHRcdFx0XHRcdCRibGFuay5hZGRDbGFzcyh2YWx1ZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZGVzdCA9PT0gXCJodG1sXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsuaHRtbCh2YWx1ZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoZGVzdCA9PT0gXCJ2YWx1ZVwiKSB7XG5cdFx0XHRcdFx0JGJsYW5rLnZhbCh2YWx1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JGJsYW5rLmF0dHIoZGVzdCwgdmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgaWZfbnVsbCA9ICRibGFuay5kYXRhKFwiZmlsbC1udWxsXCIpO1xuXHRcdFx0XHRpZiAoaWZfbnVsbCA9PT0gXCJoaWRlXCIpIHtcblx0XHRcdFx0XHQkYmxhbmsuaGlkZSgpO1xuXHRcdFx0XHR9IGVsc2UgaWYoaWZfbnVsbCA9PT0gXCJyZW1vdmVcIikge1xuXHRcdFx0XHRcdCRibGFuay5yZW1vdmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdCRibGFua1xuXHRcdFx0LnJlbW92ZUNsYXNzKFwiZmlsbFwiKVxuXHRcdFx0LnJlbW92ZUF0dHIoXCJkYXRhLWZpbGxcIilcblx0XHRcdC5yZW1vdmVBdHRyKFwiZGF0YS1maWxsLW51bGxcIik7XG5cdH07XG5cblx0aWYgKCRyZW5kZXIuaGFzQ2xhc3MoXCJmaWxsXCIpKSB7XG5cdFx0JHJlbmRlci5maWxsQmxhbmtzKCk7XG5cdH1cblxuXHQkKFwiLmZpbGxcIiwgJHJlbmRlcikuZWFjaChmdW5jdGlvbigpIHtcblx0XHQkKHRoaXMpLmZpbGxCbGFua3MoKTtcblx0fSk7XG5cblx0cmV0dXJuICRyZW5kZXI7XG59XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyByb3V0ZXIgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG52YXIgcm91dGVyID0gWyBdO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBuYXZpZ2F0aW9uIG1vZGVcbnJvdXRlcltcInBhdGhcIl0gPSBsb2NhdGlvbi5wYXRobmFtZS5zcGxpdChcIi9cIik7XG5cbmlmIChyb3V0ZXJbXCJwYXRoXCJdWzFdID09PSBcInRhcmVmYXNcIikge1xuXHRyb3V0ZXJbXCJuYXZpZ2F0aW9uLW1vZGVcIl0gPSBcInBhdGhcIjtcbn0gZWxzZSB7XG5cdHJvdXRlcltcIm5hdmlnYXRpb24tbW9kZVwiXSA9IFwiaGFzaFwiO1xuXHRyb3V0ZXJbXCJwYXRoXCJdID0gbG9jYXRpb24uaGFzaC5zcGxpdChcIi9cIik7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGdvXG5yb3V0ZXJbXCJnb1wiXSA9IGZ1bmN0aW9uKHBhdGgsIG9iamVjdCwgdGl0bGUpIHtcblx0aWYgKHJvdXRlcltcIm5hdmlnYXRpb24tbW9kZVwiXSA9PT0gXCJwYXRoXCIpIHtcblx0XHRoaXN0b3J5LnB1c2hTdGF0ZShvYmplY3QsIHRpdGxlLCBwYXRoKTtcblx0fSBlbHNlIHtcblx0XHRoaXN0b3J5LnB1c2hTdGF0ZShvYmplY3QsIHRpdGxlLCBcIiNcIiArIHBhdGgpO1xuXHRcdC8vIGxvY2F0aW9uLmhhc2ggPSBwYXRoO1xuXHR9XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBidWlsZCBsaW5rXG5yb3V0ZXJbXCJidWlsZC1saW5rXCJdID0gZnVuY3Rpb24ocGF0aCkge1xuXHR2YXIgbGluaztcblx0aWYgKHJvdXRlcltcIm5hdmlnYXRpb24tbW9kZVwiXSA9PT0gXCJwYXRoXCIpIHtcblx0XHRsaW5rID0gcGF0aDtcblx0fSBlbHNlIHtcblx0XHRsaW5rID0gXCIjXCIgKyBwYXRoO1xuXHR9XG5cblx0cmV0dXJuIGxpbms7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB2aWV3IG1hbmFnZXJcbnJvdXRlcltcImN1cnJlbnQtdmlld1wiXSA9IFtcImhvbWVcIl07XG5yb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0gPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0YWRkOiBmdW5jdGlvbih2aWV3KSB7XG5cdFx0XHRyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0ucHVzaCh2aWV3KTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSk7XG5cdFx0fSxcblx0XHRyZW1vdmU6IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHRcdHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSA9ICQuZ3JlcChyb3V0ZXJbXCJjdXJyZW50LXZpZXdcIl0sIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZSAhPT0gdmlldztcblx0XHRcdH0pO1xuXHRcdFx0Ly8gY29uc29sZS5sb2cocm91dGVyW1wiY3VycmVudC12aWV3XCJdKTtcblx0XHR9LFxuXHRcdHJlcGxhY2U6IGZ1bmN0aW9uKHZpZXcpIHtcblx0XHRcdHJvdXRlcltcImN1cnJlbnQtdmlld1wiXSA9IFsgXTtcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5hZGQodmlldyk7XG5cdFx0fVxuXHR9O1xufSkoKTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdC8vIGNvbnNvbGUubG9nKFwibG9jYXRpb246IFwiICsgZG9jdW1lbnQubG9jYXRpb24gKyBcIiwgc3RhdGU6IFwiICsgSlNPTi5zdHJpbmdpZnkoZXZlbnQuc3RhdGUpKTtcblxuXHR2YXIgc3RhdGUgPSBldmVudC5zdGF0ZTtcblxuXHRpZiAoc3RhdGUgJiYgc3RhdGVbXCJ2aWV3XCJdID09PSBcInRhcmVmYVwiKSB7XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwiYm90dG9tc2hlZXRcIikgPiAtMSkgeyBib3R0b21zaGVldC5jbG9zZSgpOyB9XG5cdFx0aWYgKHJvdXRlcltcImN1cnJlbnQtdmlld1wiXS5pbmRleE9mKFwibmV3LXBvc3RcIikgPiAtMSkgeyBwb3N0LmNsb3NlKCk7IH1cblx0XHRhcHAuVGFyZWZhLm9wZW4oc3RhdGVbXCJpZFwiXSk7XG5cdH1cblxuXHRlbHNlIGlmIChzdGF0ZSAmJiBzdGF0ZVtcInZpZXdcIl0gPT09IFwibmV3LXBvc3RcIikge1xuXHRcdHBvc3Qub3BlbihzdGF0ZVtcInR5cGVcIl0sIHN0YXRlW1wiaWRcIl0pO1xuXHR9XG5cblx0ZWxzZSBpZiAoc3RhdGUgJiYgc3RhdGVbXCJ2aWV3XCJdID09PSBcImJvdHRvbXNoZWV0XCIpIHtcblx0XHRpZiAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLmluZGV4T2YoXCJuZXctcG9zdFwiKSA+IC0xKSB7IHBvc3QuY2xvc2UoKTsgfVxuXHR9XG5cbi8vXHRpZiAoc3RhdGVbXCJ2aWV3XCJdID09PSBcImhvbWVcIikge1xuXHRlbHNlIHtcblx0XHRpZiAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLmluZGV4T2YoXCJib3R0b21zaGVldFwiKSA+IC0xKSB7IGJvdHRvbXNoZWV0LmNsb3NlKCk7IH1cblx0XHRpZiAocm91dGVyW1wiY3VycmVudC12aWV3XCJdLmluZGV4T2YoXCJuZXctcG9zdFwiKSA+IC0xKSB7IHBvc3QuY2xvc2UoKTsgfVxuXHRcdGFwcC5UYXJlZmEuY2xvc2UoKTtcblx0fVxuXG59KTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gc3RhdGVzOlxuLy8gKiB0YXJlZmFcbi8vICogaG9tZVxuLy8gKiBuZXctcG9zdFxuLy8gKiBib3R0b21zaGVldFxuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gdWkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xubGV0IFVJID0geyB9XG5sZXQgJHVpID0gWyBdO1xuXG5VSS5kYXRhID0gWyBdO1xuXG4vLyBVSS5ib2R5LmxvY2soKVxuLy8gVUkuYm9keS51bmxvY2soKVxuLy8gVUkubG9hZGJhci5zaG93KClcbi8vIFVJLmxvYWRiYXIuaGlkZSgpXG4vLyBVSS5iYWNrZHJvcC5zaG93KClcbi8vIFVJLmJhY2tkcm9wLmhpZGUoKVxuXG4vLyAkdWlbXCJ3aW5kb3dcIl1cbi8vICR1aVtcInRpdGxlXCJdXG4vLyAkdWlbXCJib2R5XCJdXG4vLyAkdWlbXCJhcHBiYXJcIl1cbi8vICR1aVtcImxvYWRiYXJcIl1cbi8vICR1aVtcInNpZGVuYXZcIl1cbi8vICR1aVtcImJvdHRvbXNoZWV0XCJdXG4vLyAkdWlbXCJ0b2FzdFwiXVxuLy8gJHVpW1wiYmFja2Ryb3BcIl1cbi8vICR1aVtcImZvb3RlclwiXVxuXG4vLyBVSS5kYXRhW1wid2luZG93XCJdW1wid2lkdGhcIl1cbi8vIFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJoZWlnaHRcIl1cbi8vIFVJLmRhdGFbXCJjb2x1bW4td2lkdGhcIl1cbi8vIFVJLmRhdGFbXCJjb2x1bW5zXCJdXG4vLyBVSS5kYXRhW1wiaW50ZXJhY3Rpb24tdHlwZVwiXVxuLy8gVUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXVtcInRvcFwiXVxuLy8gVUkuZGF0YVtcInNjcm9sbC1wb3NpdGlvblwiXVtcImJvdHRvbVwiXVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8gd2luZG93IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiR1aVtcIndpbmRvd1wiXSA9ICQod2luZG93KTtcblxuJChmdW5jdGlvbigpIHtcblx0JHVpW1widGl0bGVcIl0gPSAkKFwiaGVhZCB0aXRsZVwiKTtcblx0VUkuZGF0YVtcInRpdGxlXCJdID0gJHVpW1widGl0bGVcIl0uaHRtbCgpO1xuXG5cdCR1aVtcInRoZW1lLWNvbG9yXCJdID0gJChcIm1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKTtcblx0VUkuZGF0YVtcIm9yaWdpbmFsLXRoZW1lLWNvbG9yXCJdID0gJHVpW1widGhlbWUtY29sb3JcIl0uYXR0cihcImNvbnRlbnRcIik7XG59KTtcblxuLy8gdGlwbyBkZSBpbnRlcmHDp8OjbyAodG91Y2ggb3UgcG9pbnRlcilcblVJLmRhdGFbXCJpbnRlcmFjdGlvbi10eXBlXCJdID0gKFwib250b3VjaHN0YXJ0XCIgaW4gd2luZG93IHx8IG5hdmlnYXRvci5tc01heFRvdWNoUG9pbnRzKT8gXCJ0b3VjaFwiIDogXCJwb2ludGVyXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gcmVmbG93XG4kLmZuLnJlZmxvdyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgb2Zmc2V0ID0gJHVpW1wiYm9keVwiXS5vZmZzZXQoKS5sZWZ0O1xuXHRyZXR1cm4gJCh0aGlzKTtcbn07XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSAvIGJvZHkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblVJLmJvZHkgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wiYm9keVwiXSA9ICQoZG9jdW1lbnQuYm9keSk7XG5cdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInVpLVwiICsgVUkuZGF0YVtcImludGVyYWN0aW9uLXR5cGVcIl0pO1xuXHRcdHNjcm9sbFN0YXR1cygpO1xuXHR9KTtcblxuXHQkKHdpbmRvdykub24oXCJzY3JvbGxcIiwgc2Nyb2xsU3RhdHVzKTtcblxuXHRmdW5jdGlvbiBzY3JvbGxTdGF0dXMoKSB7XG5cdFx0dmFyIHkgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cblx0XHRpZiAoeSA+IDEpIHtcblx0XHRcdCR1aVtcImJvZHlcIl0ucmVtb3ZlQ2xhc3MoXCJzY3JvbGwtdG9wXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwic2Nyb2xsLXRvcFwiKTtcblx0XHR9XG5cblx0XHRpZiAoeSA+IDU2KSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwibGl2ZXNpdGUtYmx1clwiKS5yZW1vdmVDbGFzcyhcImxpdmVzaXRlLWZvY3VzXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwibGl2ZXNpdGUtZm9jdXNcIikucmVtb3ZlQ2xhc3MoXCJsaXZlc2l0ZS1ibHVyXCIpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBVSS5ib2R5LmxvY2soKVxuXHRcdGxvY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcIm5vLXNjcm9sbFwiKTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBVSS5ib2R5LnVubG9jaygpXG5cdFx0dW5sb2NrOiBmdW5jdGlvbigpIHtcblx0XHRcdCR1aVtcImJvZHlcIl0ucmVtb3ZlQ2xhc3MoXCJuby1zY3JvbGxcIik7XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHVpIC8gbG9hZGJhciAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuVUkubG9hZGJhciA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQkdWlbXCJsb2FkYmFyXCJdID0gJChcIi51aS1sb2FkYmFyXCIpO1xuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wibG9hZGJhclwiXS5hZGRDbGFzcyhcImluXCIpO1xuXHRcdH0sXG5cdFx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aW1lb3V0W1wiaGlkZS1sb2FkYmFyXCJdID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0JHVpW1wibG9hZGJhclwiXVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcyhcImZhZGUtaW5cIilcblx0XHRcdFx0XHQub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdCR1aVtcImxvYWRiYXJcIl0ucmVtb3ZlQ2xhc3MoXCJpblwiKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0sIDgwMCk7XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGJhY2tkcm9wXG5cbiR1aVtcImJhY2tkcm9wXCJdID0gWyBdO1xuXG5VSS5iYWNrZHJvcCA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblx0XHRzaG93OiBmdW5jdGlvbigkc2NyZWVuLCBldmVudHMpIHtcblx0XHRcdHZhciBzY3JlZW4gPSAkc2NyZWVuW1wic2VsZWN0b3JcIl07XG5cdFx0XHR2YXIgemluZGV4ID0gJHNjcmVlbi5jc3MoXCJ6LWluZGV4XCIpIC0gMTtcblxuXHRcdFx0JHVpW1wiYmFja2Ryb3BcIl1bc2NyZWVuXSA9IF9fcmVuZGVyKFwiYmFja2Ryb3BcIik7XG5cblx0XHRcdCQuZWFjaChldmVudHMsIGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyKSB7XG5cdFx0XHRcdCR1aVtcImJhY2tkcm9wXCJdW3NjcmVlbl0ub24oZXZlbnQsIGhhbmRsZXIpXG5cdFx0XHR9KTtcblxuXHRcdFx0JHVpW1wiYmFja2Ryb3BcIl1bc2NyZWVuXS5jc3MoXCJ6LWluZGV4XCIsIHppbmRleClcblx0XHRcdFx0Lm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7ICQodGhpcykudHJpZ2dlcihcImhpZGVcIik7IH0pXG5cdFx0XHRcdC5hcHBlbmRUbygkdWlbXCJib2R5XCJdKVxuXHRcdFx0XHQuYWRkQ2xhc3MoXCJpblwiKTtcblx0XHR9LFxuXHRcdGhpZGU6IGZ1bmN0aW9uKCRzY3JlZW4pIHtcblx0XHRcdHZhciBzY3JlZW4gPSAkc2NyZWVuW1wic2VsZWN0b3JcIl07XG5cdFx0XHQkdWlbXCJiYWNrZHJvcFwiXVtzY3JlZW5dLnJlbW92ZUNsYXNzKFwiaW5cIikub2ZmKFwiaGlkZVwiKS5yZW1vdmUoKTtcblx0XHR9XG5cdH07XG59KSgpO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQvLyAkdWlbXCJiYWNrZHJvcFwiXSA9ICQoXCIuanMtdWktYmFja2Ryb3BcIik7XG5cdC8vICR1aVtcImJhY2tkcm9wXCJdLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG5cdC8vIFx0JHVpW1wiYmFja2Ryb3BcIl0udHJpZ2dlcihcImhpZGVcIik7XG5cdC8vIH0pO1xufSk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB1aSBzaWRlbmF2IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblVJLnNpZGVuYXYgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wic2lkZW5hdlwiXSA9ICQoXCIuanMtdWktc2lkZW5hdlwiKTtcblxuXHRcdCQoXCIuanMtc2lkZW5hdi10cmlnZ2VyXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRVSS5zaWRlbmF2Lm9wZW4oKTtcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHRvcGVuOiBmdW5jdGlvbigpIHtcblx0XHRcdFVJLmJvZHkubG9jaygpO1xuXHRcdFx0VUkuYmFja2Ryb3Auc2hvdygkdWlbXCJzaWRlbmF2XCJdLCB7IFwiaGlkZVwiOiBVSS5zaWRlbmF2LmNsb3NlIH0pO1xuXHRcdFx0JHVpW1wic2lkZW5hdlwiXS5hZGRDbGFzcyhcImluXCIpO1xuXHRcdH0sXG5cdFx0Y2xvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wic2lkZW5hdlwiXS5yZW1vdmVDbGFzcyhcImluXCIpO1xuXHRcdFx0VUkuYmFja2Ryb3AuaGlkZSgkdWlbXCJzaWRlbmF2XCJdKTtcblx0XHRcdFVJLmJvZHkudW5sb2NrKCk7XG5cdFx0fVxuXHR9O1xufSkoKTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGJvdHRvbXNoZWV0XG5VSS5ib3R0b21zaGVldCA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblx0XHRvcGVuOiBmdW5jdGlvbigkY29udGVudCwgYWRkQ2xhc3MpIHtcblx0XHRcdFVJLmJhY2tkcm9wLnNob3coJHVpW1wiYm90dG9tc2hlZXRcIl0sIHsgXCJoaWRlXCI6IFVJLmJvdHRvbXNoZWV0LmNsb3NlIH0pO1xuXHRcdFx0JHVpW1wiYm90dG9tc2hlZXRcIl0uaHRtbCgkY29udGVudCkuYWRkQ2xhc3MoKGFkZENsYXNzPyBhZGRDbGFzcyArIFwiIFwiIDogXCJcIikgKyBcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIik7XG5cblx0XHRcdHRoZW1lX2NvbG9yW1wiYnVmZmVyXCJdID0gJHRoZW1lX2NvbG9yLmF0dHIoXCJjb250ZW50XCIpO1xuXHRcdFx0JHRoZW1lX2NvbG9yLmF0dHIoXCJjb250ZW50XCIsIFwiIzAwMFwiKTtcblxuXHRcdFx0cm91dGVyW1widmlldy1tYW5hZ2VyXCJdLmFkZChcImJvdHRvbXNoZWV0XCIpO1xuXHRcdFx0aGlzdG9yeS5wdXNoU3RhdGUoeyBcInZpZXdcIjogXCJib3R0b21zaGVldFwiIH0sIG51bGwsIG51bGwpO1xuXHRcdH0sXG5cdFx0Y2xvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpW1wiYm90dG9tc2hlZXRcIl0ucmVtb3ZlQ2xhc3MoXCJzbGlkZVwiKS5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkdWlbXCJib3R0b21zaGVldFwiXS5yZW1vdmVDbGFzcyhcImluXCIpLmVtcHR5KCkuYXR0cihcImNsYXNzXCIsIFwidWktYm90dG9tc2hlZXQganMtdWktYm90dG9tc2hlZXRcIik7XG5cdFx0XHR9KTtcblxuXHRcdFx0JHRoZW1lX2NvbG9yLmF0dHIoXCJjb250ZW50XCIsIHRoZW1lX2NvbG9yW1wiYnVmZmVyXCJdKTtcblxuXHRcdFx0VUkuYmFja2Ryb3AuaGlkZSgkdWlbXCJib3R0b21zaGVldFwiXSk7XG5cblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZW1vdmUoXCJib3R0b21zaGVldFwiKTtcblx0XHR9XG5cdH07XG59KSgpO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQkdWlbXCJib3R0b21zaGVldFwiXSA9ICQoXCIuanMtdWktYm90dG9tc2hlZXRcIik7XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHRvYXN0IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuVUkudG9hc3QgPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0Ly8gVE9ETyBub3ZhIHNpbnRheGUsIHVzYXIgdGVtcGxhdGUgZSBfX3JlbmRlclxuXHRcdHNob3c6IGZ1bmN0aW9uKGNvbmZpZykge1xuXHRcdFx0aWYgKHR5cGVvZiBjb25maWcgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0JHVpLnRvYXN0W1wibWVzc2FnZVwiXS5odG1sKGNvbmZpZ1tcIm1lc3NhZ2VcIl0pO1xuXHRcdFx0XHQkdWkudG9hc3RbXCJhY3Rpb25cIl0uaHRtbCgoY29uZmlnW1wiYWN0aW9uXCJdPyBjb25maWdbXCJhY3Rpb25cIl0gOiBcIlwiKSk7XG5cdFx0XHRcdCR1aS50b2FzdC5hZGRDbGFzcyhcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIik7XG5cdFx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJ0b2FzdC1hY3RpdmVcIik7XG5cblx0XHRcdFx0Ly8gVE9ETzogLmZhYi1ib3R0b20gdHJhbnNmb3JtOiB0cmFuc2xhdGVZXG5cblx0XHRcdFx0JHVpLnRvYXN0Lm9uKFwiY2xpY2tcIiwgVUkudG9hc3QuZGlzbWlzcyk7XG5cdFx0XHRcdCR1aS50b2FzdFtcImFjdGlvblwiXS5vbihcImNsaWNrXCIsIGNvbmZpZ1tcImNhbGxiYWNrXCJdKTtcblxuXHRcdFx0XHRjbGVhclRpbWVvdXQodGltZW91dFtcInRvYXN0XCJdKTtcblxuXHRcdFx0XHRpZiAoIWNvbmZpZ1tcInBlcnNpc3RlbnRcIl0pIHtcblx0XHRcdFx0XHQkdWkudG9hc3QucmVtb3ZlQ2xhc3MoXCJzdHJlYW0tb25seVwiKTtcblx0XHRcdFx0XHR0aW1lb3V0W1widG9hc3RcIl0gPSBzZXRUaW1lb3V0KFVJLnRvYXN0LmRpc21pc3MsIChjb25maWdbXCJ0aW1lb3V0XCJdPyBjb25maWdbXCJ0aW1lb3V0XCJdIDogNjAwMCkpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCR1aS50b2FzdC5hZGRDbGFzcyhcInN0cmVhbS1vbmx5XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRVSS50b2FzdC5zaG93KHtcblx0XHRcdFx0XHRcIm1lc3NhZ2VcIjogY29uZmlnXG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGRpc21pc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHVpLnRvYXN0LnJlbW92ZUNsYXNzKFwic2xpZGVcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcInRvYXN0LWFjdGl2ZVwiKTtcblx0XHRcdFx0JHVpLnRvYXN0LnJlbW92ZUNsYXNzKFwiaW4gc3RyZWFtLW9ubHlcIik7XG5cblx0XHRcdFx0JHVpLnRvYXN0W1wibWVzc2FnZVwiXS5lbXB0eSgpO1xuXHRcdFx0XHQkdWkudG9hc3RbXCJhY3Rpb25cIl0uZW1wdHkoKTtcblx0XHRcdH0pO1xuXHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXRbXCJ0b2FzdFwiXSk7XG5cdFx0fSxcblxuXHRcdC8vIFRPRE8gREVQUkVDQVRFRFxuXHRcdG9wZW46IGZ1bmN0aW9uKG1lc3NhZ2UsIGFjdGlvbiwgY2FsbGJhY2ssIHBlcnNpc3RlbnQpIHtcblx0XHQvLyBvcGVuOiBmdW5jdGlvbihtZXNzYWdlLCBhZGRDbGFzcykge1xuXHRcdFx0JHVpLnRvYXN0Lm1lc3NhZ2UuaHRtbChtZXNzYWdlKTtcblx0XHRcdCR1aS50b2FzdC5hY3Rpb24uaHRtbCgoYWN0aW9uPyBhY3Rpb24gOiBcIlwiKSk7XG5cdFx0XHQkdWkudG9hc3QuYWRkQ2xhc3MoXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlXCIpO1xuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInRvYXN0LWFjdGl2ZVwiKTtcblxuXHRcdFx0Ly8gVE9ETzogLmZhYi1ib3R0b20gdHJhbnNmb3JtOiB0cmFuc2xhdGVZXG5cblx0XHRcdCR1aS50b2FzdC5vbihcImNsaWNrXCIsIHRvYXN0LmNsb3NlKTtcblx0XHRcdCR1aS50b2FzdC5hY3Rpb24ub24oXCJjbGlja1wiLCBjYWxsYmFjayk7XG5cblx0XHRcdGNsZWFyVGltZW91dCh0aW1lb3V0W1widG9hc3RcIl0pO1xuXHRcdFx0aWYgKCFwZXJzaXN0ZW50KSB7XG5cdFx0XHRcdCR1aS50b2FzdC5yZW1vdmVDbGFzcyhcInN0cmVhbS1vbmx5XCIpO1xuXHRcdFx0XHR0aW1lb3V0W1widG9hc3RcIl0gPSBzZXRUaW1lb3V0KHRvYXN0LmNsb3NlLCA2NTAwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCR1aS50b2FzdC5hZGRDbGFzcyhcInN0cmVhbS1vbmx5XCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn0pKCk7XG5cbnZhciB0b2FzdCA9IFVJLnRvYXN0O1xudG9hc3QuY2xvc2UgPSBVSS50b2FzdC5kaXNtaXNzO1xuXG4vLyB2YXIgc25hY2tiYXIgPSB0b2FzdDtcblxuLy8galF1ZXJ5XG4kdWkudG9hc3QgPSBbIF07XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCR1aS50b2FzdCA9ICQoXCIuanMtdWktdG9hc3RcIik7XG5cdCR1aS50b2FzdFtcIm1lc3NhZ2VcIl0gPSAkKFwiLnRvYXN0LW1lc3NhZ2VcIiwgJHVpLnRvYXN0KTtcblx0JHVpLnRvYXN0W1wiYWN0aW9uXCJdID0gJChcIi50b2FzdC1hY3Rpb25cIiwgJHVpLnRvYXN0KTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBpIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBUT0RPIGxlZ2FjeVxubGV0IGFwaV9rZXkgPSBcIjA2M2M3MmIyYWZjNTMzM2YzYjI3YjM2NmJkYWM5ZWI4MWQ2NGJjNmExMmNkN2IzZjRiNmFkZTc3YTA5MmI2M2FcIjtcblxuY29uc3QgTGlzdGFBUEkgPSBmdW5jdGlvbihlbmRwb2ludCkge1xuXHRsb2coXCJBUEkgUmVxdWVzdDogXCIgKyBlbmRwb2ludCwgXCJpbmZvXCIpO1xuXHRsZXQgYXBpX3VybCA9IFwiaHR0cHM6Ly9hcGkubGFndWluaG8ub3JnL2xpc3RhL1wiICsgZWRpY2FvO1xuXHRsZXQgYXBpX2tleSA9IFwiMDYzYzcyYjJhZmM1MzMzZjNiMjdiMzY2YmRhYzllYjgxZDY0YmM2YTEyY2Q3YjNmNGI2YWRlNzdhMDkyYjYzYVwiO1xuXG5cdGxldCByZXF1ZXN0ID0gJC5nZXRKU09OKGFwaV91cmwgKyBlbmRwb2ludCArIFwiP2tleT1cIiArIGFwaV9rZXkgKyBcIiZjYWxsYmFjaz0/XCIpO1xuXHRyZXR1cm4gcmVxdWVzdDtcbn07XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBwbGFjYXIgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmFwcC5QbGFjYXIgPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wicGxhY2FyXCJdID0gJChcIi5qcy1hcHAtcGxhY2FyID4gdWxcIik7XG5cdH0pO1xuXG5cdHJldHVybiB7XG5cdFx0dXBkYXRlOiBmdW5jdGlvbih0dXJtYXMpIHtcblx0XHRcdC8vIGNvbmZlcmUgcXVhbCBhIHR1cm1hIGNvbSBtYWlvciBwb250dWHDp8Ojb1xuXHRcdFx0Ly8gZSBzb21hIGEgcG9udHVhw6fDo28gZGUgY2FkYSB0dXJtYSBwYXJhIG9idGVyIG8gdG90YWwgZGUgcG9udG9zXG5cdFx0XHR2YXIgbWFpb3JfcG9udHVhY2FvID0gMDtcblx0XHRcdHZhciB0b3RhbF9kZV9wb250b3MgPSAwO1xuXG5cdFx0XHRmb3IgKHZhciB0dXJtYSBpbiB0dXJtYXMpIHtcblx0XHRcdFx0dmFyIHBvbnR1YWNhb19kYV90dXJtYSA9IHR1cm1hc1t0dXJtYV1bXCJwb250b3NcIl07XG5cblx0XHRcdFx0aWYgKHBvbnR1YWNhb19kYV90dXJtYSA+IG1haW9yX3BvbnR1YWNhbykge1xuXHRcdFx0XHRcdG1haW9yX3BvbnR1YWNhbyA9IHBvbnR1YWNhb19kYV90dXJtYTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRvdGFsX2RlX3BvbnRvcyArPSBwb250dWFjYW9fZGFfdHVybWE7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGxpbXBhIG8gcGxhY2FyXG5cdFx0XHQkdWlbXCJwbGFjYXJcIl0uZW1wdHkoKTtcblxuXHRcdFx0Ly8gYWRpY2lvbmEgY2FkYSB0dXJtYSBubyBwbGFjYXJcblx0XHRcdCQuZWFjaCh0dXJtYXMsIGZ1bmN0aW9uKGluZGV4LCB0dXJtYSkge1xuXHRcdFx0XHQvLyBjYWxjdWxhICUgZGEgdHVybWEgZW0gcmVsYcOnw6NvIGFvIHRvdGFsIGRlIHBvbnRvc1xuXHRcdFx0XHR2YXIgcGVyY2VudHVhbF9kYV90dXJtYSA9ICh0b3RhbF9kZV9wb250b3MgPiAwPyB0dXJtYVtcInBvbnRvc1wiXSAvIG1haW9yX3BvbnR1YWNhbyA6IDApO1xuXG5cdFx0XHRcdC8vIGZvcm1hdGEgb3MgZGFkb3Ncblx0XHRcdFx0dHVybWFbXCJsYXJndXJhLWRhLWJhcnJhXCJdID0gXCJ3aWR0aDogXCIgKyAocGVyY2VudHVhbF9kYV90dXJtYSAqIDEwMCkudG9GaXhlZCgzKSArIFwiJTtcIjtcblx0XHRcdFx0dHVybWFbXCJ0dXJtYS1mb3JtYXRhZGFcIl0gPSB0dXJtYVtcInR1cm1hXCJdLnRvVXBwZXJDYXNlKCk7XG5cdFx0XHRcdHR1cm1hW1wicG9udG9zXCJdID0gdHVybWFbXCJwb250b3NcIl07XG5cdFx0XHRcdHR1cm1hW1wicG9udHVhY2FvLWZvcm1hdGFkYVwiXSA9IHR1cm1hW1wicG9udG9zXCJdLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIuXCIpO1xuXG5cdFx0XHRcdC8vIHJlbmRlcml6YSBlIGNvbG9jYSBuYSBww6FnaW5hXG5cdFx0XHRcdHZhciAkdHVybWEgPSBfX3JlbmRlcihcInBsYWNhci10dXJtYVwiLCB0dXJtYSk7XG5cdFx0XHRcdCR1aVtcInBsYWNhclwiXS5hcHBlbmQoJHR1cm1hKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAodG90YWxfZGVfcG9udG9zID09PSAwKSB7XG5cdFx0XHRcdCR1aVtcInBsYWNhclwiXS5wYXJlbnQoKS5hZGRDbGFzcyhcInplcm9lZFwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCR1aVtcInBsYWNhclwiXS5wYXJlbnQoKS5yZW1vdmVDbGFzcyhcInplcm9lZFwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0pKCk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBhcHAgZXZvbHXDp8OjbyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5Fdm9sdWNhby5zdGFydCgpXG4vLyBhcHAuRXZvbHVjYW8udXBkYXRlKClcblxuLy8gVE9ET1xuLy8gLSBtb3N0cmFyIGNvbnRhZG9yIG5hcyDDumx0aW1hcyA0OCBob3Jhc1xuLy8gLSBvIHF1ZSBhY29udGVjZSBkZXBvaXMgZG8gZW5jZXJyYW1lbnRvP1xuLy8gICAtIGJhcnJhIGZpY2EgZGEgY29yIGRhIHR1cm1hIGUgYXBhcmVjZSBtZW5zYWdlbSBlbSBjaW1hIFwiRUMxIGNhbXBlw6NcIlxuXG5hcHAuRXZvbHVjYW8gPSAoZnVuY3Rpb24oKSB7XG5cdCQoZnVuY3Rpb24oKSB7XG5cdFx0JHVpW1wiZXZvbHVjYW9cIl0gPSAkKFwiLmFwcC1ldm9sdWNhb1wiKTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5Fdm9sdWNhby5zdGFydCgpXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9nKFwiYXBwLkV2b2x1Y2FvLnN0YXJ0XCIsIFwiaW5mb1wiKTtcblxuXHRcdFx0Ly8gcGVnYSBkYXRhIGRlIGluw61jaW8gZSBkYXRhIGRlIGVuY2VycmFtZW50b1xuXHRcdFx0bGV0IGRpYV9pbmljaWFsID0gTGlzdGEuRWRpY2FvW1wiaW5pY2lvXCJdID0gbW9tZW50KExpc3RhLkVkaWNhb1tcImluaWNpb1wiXSk7XG5cdFx0XHRsZXQgZGlhX2ZpbmFsID0gTGlzdGEuRWRpY2FvW1wiZmltXCJdID0gbW9tZW50KExpc3RhLkVkaWNhb1tcImZpbVwiXSk7XG5cblx0XHRcdC8vIGxldCBkaWFfaW5pY2lhbCA9IExpc3RhLkVkaWNhb1tcImluaWNpb1wiXTtcblx0XHRcdC8vIGxldCBkaWFfZmluYWwgPSBMaXN0YS5FZGljYW9bXCJmaW1cIl07XG5cblx0XHRcdC8vIGNhbGN1bGEgbyB0ZW1wbyB0b3RhbCAoZW0gbWludXRvcylcblx0XHRcdGxldCBkdXJhY2FvX3RvdGFsID0gTGlzdGEuRWRpY2FvW1wiZHVyYWNhby1lbS1taW51dG9zXCJdID0gZGlhX2ZpbmFsLmRpZmYoZGlhX2luaWNpYWwsIFwibWludXRlc1wiKTtcblxuXHRcdFx0Ly8gaW5zZXJlIG9zIGRpYXMgbmEgYmFycmEsIGluZG8gZGUgZGlhIGVtIGRpYSBhdMOpIGNoZWdhciBhbyBlbmNlcnJhbWVudG9cblx0XHRcdGZvciAobGV0IGRpYSA9IGRpYV9pbmljaWFsLmNsb25lKCk7IGRpYS5pc0JlZm9yZShkaWFfZmluYWwpOyBkaWEuYWRkKDEsIFwiZGF5c1wiKSkge1xuXHRcdFx0XHQvLyBkZWZpbmUgaW7DrWNpbyBlIGZpbmFsIGRvIGRpYS5cblx0XHRcdFx0Ly8gc2UgZmluYWwgZm9yIGFww7NzIGEgZGF0YSBkZSBlbmNlcnJhbWVudG8sIHVzYSBlbGEgY29tbyBmaW5hbFxuXHRcdFx0XHRsZXQgaW5pY2lvX2RvX2RpYSA9IGRpYTtcblx0XHRcdFx0bGV0IGZpbmFsX2RvX2RpYSA9IGRpYS5jbG9uZSgpLmVuZE9mKFwiZGF5XCIpO1xuXHRcdFx0XHRpZiAoZmluYWxfZG9fZGlhLmlzQWZ0ZXIoZGlhX2ZpbmFsKSkge1xuXHRcdFx0XHRcdGZpbmFsX2RvX2RpYSA9IGRpYV9maW5hbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGNhbGN1bGEgYSBkdXJhw6fDo28gZG8gZGlhIGVtIG1pbnV0b3Ncblx0XHRcdFx0bGV0IGR1cmFjYW9fZG9fZGlhID0gZmluYWxfZG9fZGlhLmRpZmYoaW5pY2lvX2RvX2RpYSwgXCJtaW51dGVzXCIpO1xuXG5cdFx0XHRcdC8vIGRlZmluZSBhIGR1cmHDp8OjbyBwZXJjZW50dWFsIGRvIGRpYSBlbSByZWxhw6fDo28gYW8gdG90YWxcblx0XHRcdFx0bGV0IHBlcmNlbnR1YWxfZG9fZGlhID0gZHVyYWNhb19kb19kaWEgLyBkdXJhY2FvX3RvdGFsO1xuXG5cdFx0XHRcdC8vIGNhbGN1bGEgYSBsYXJndXJhIGRvIGRpYSAoZGUgYWNvcmRvIGNvbSBkdXJhw6fDo28gcGVyY2VudHVhbClcblx0XHRcdFx0Ly8gZSBpbnNlcmUgZGlhIG5hIGJhcnJhIGRlIGV2b2x1w6fDo29cblx0XHRcdFx0bGV0IGxhcmd1cmFfZG9fZGlhID0gKHBlcmNlbnR1YWxfZG9fZGlhICogMTAwKS50b0ZpeGVkKDMpO1xuXHRcdFx0XHRsZXQgJGRpYSA9IF9fcmVuZGVyKFwiZXZvbHVjYW8tZGlhXCIsIHtcblx0XHRcdFx0XHRkaWE6IGRpYS5mb3JtYXQoXCJkZGRcIilcblx0XHRcdFx0fSkuY3NzKFwid2lkdGhcIiwgbGFyZ3VyYV9kb19kaWEgKyBcIiVcIik7XG5cblx0XHRcdFx0JChcIi5kYXktbGFiZWxzXCIsICR1aVtcImV2b2x1Y2FvXCJdKS5hcHBlbmQoJGRpYSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNvbSBvcyBkaWFzIGluc2VyaWRvcyBuYSBiYXJyYSBkZSBldm9sdcOnw6NvLFxuXHRcdFx0Ly8gZGVzZW5oYSBhIGJhcnJhIGRlIHRlbXBvIHRyYW5zY29ycmlkb1xuXHRcdFx0c2V0VGltZW91dChhcHAuRXZvbHVjYW8udXBkYXRlLCAxMDAwKTtcblxuXHRcdFx0Ly8gYXR1YWxpemEgYSBsaW5oYSBkZSBldm9sdcOnw6NvIGEgY2FkYSBYIG1pbnV0b3Ncblx0XHRcdHRpbWVvdXRbXCJldm9sdWNhb1wiXSA9IHNldEludGVydmFsKGFwcC5Fdm9sdWNhby51cGRhdGUsIDYwICogMTAwMCk7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkV2b2x1Y2FvLnVwZGF0ZSgpXG5cdFx0dXBkYXRlOiBmdW5jdGlvbigpIHtcblx0XHRcdGxvZyhcImFwcC5Fdm9sdWNhby51cGRhdGVcIiwgXCJpbmZvXCIpO1xuXG5cdFx0XHQvLyBwZWdhIGFzIGRhdGFzIGUgY2FsY3VsYSBvIHRlbXBvIChlbSBtaW51dG9zKSBlIHBlcmNlbnR1YWwgdHJhbnNjb3JyaWRvc1xuXHRcdFx0bGV0IGFnb3JhID0gbW9tZW50KCk7XG5cdFx0XHRsZXQgZGlhX2luaWNpYWwgPSBMaXN0YS5FZGljYW9bXCJpbmljaW9cIl07XG5cdFx0XHRsZXQgZGlhX2ZpbmFsID0gTGlzdGEuRWRpY2FvW1wiZmltXCJdO1xuXHRcdFx0bGV0IGR1cmFjYW9fdG90YWwgPSBMaXN0YS5FZGljYW9bXCJkdXJhY2FvLWVtLW1pbnV0b3NcIl07XG5cblx0XHRcdGxldCB0ZW1wb190cmFuc2NvcnJpZG8gPSBhZ29yYS5kaWZmKGRpYV9pbmljaWFsLCBcIm1pbnV0ZXNcIik7XG5cdFx0XHRsZXQgcGVyY2VudHVhbF90cmFuc2NvcnJpZG8gPSAodGVtcG9fdHJhbnNjb3JyaWRvIDwgZHVyYWNhb190b3RhbCA/IHRlbXBvX3RyYW5zY29ycmlkbyAvIGR1cmFjYW9fdG90YWwgOiAxKTtcblxuXHRcdFx0Ly8gZGVmaW5lIGEgbGFyZ3VyYSBkYSBiYXJyYSBkZSBldm9sdcOnw6NvIGNvbXBsZXRhIGlndWFsIMOgIGxhcmd1cmEgZGEgdGVsYVxuXHRcdFx0Ly8gZGVwb2lzLCBtb3N0cmEgYXBlbmFzIG8gcGVyY2VudHVhbCB0cmFuc2NvcnJpZG9cblx0XHRcdCQoXCIuZWxhcHNlZC10aW1lIC5iYXJcIiwgJHVpW1wiZXZvbHVjYW9cIl0pLmNzcyhcIndpZHRoXCIsIFVJLmRhdGFbXCJ3aW5kb3dcIl1bXCJ3aWR0aFwiXSk7XG5cblx0XHRcdGxldCBsYXJndXJhX2RhX2JhcnJhID0gKHBlcmNlbnR1YWxfdHJhbnNjb3JyaWRvICogMTAwKS50b0ZpeGVkKDMpO1xuXHRcdFx0JChcIi5lbGFwc2VkLXRpbWVcIiwgJHVpW1wiZXZvbHVjYW9cIl0pLmNzcyhcIndpZHRoXCIsIGxhcmd1cmFfZGFfYmFycmEgKyBcIiVcIik7XG5cdFx0fVxuXHR9XG59KSgpO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbGlzdGEgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gYXBwLkxpc3RhLmxvYWQoKVxuLy8gYXBwLkxpc3RhLmxheW91dCgpXG4vLyBhcHAuTGlzdGEuc29ydCgpXG5cbmFwcC5MaXN0YSA9IChmdW5jdGlvbigpIHtcblx0JChmdW5jdGlvbigpIHtcblx0XHQkYXBwW1wibGlzdGFcIl0gPSAkKFwiLmFwcC1saXN0YVwiKTtcblx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5MaXN0YS5zdGFydCgpXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9nKFwiYXBwLkxpc3RhLnN0YXJ0XCIsIFwiaW5mb1wiKTtcblxuXHRcdFx0Ly8gZmF6IGFzIGFsdGVyYcOnw7VlcyBkZSBhY29yZG8gY29tIG8gc3RhdHVzXG5cdFx0XHQvLyBpbnNlcmUgYXMgbWVuc2FnZW5zXG5cdFx0XHRhcHAuTGlzdGEuc3RhdHVzKCk7XG5cdFx0XHRhcHAuTGlzdGEubWVzc2FnZXMoKTtcblxuXG5cblx0XHRcdC8vIHRpcmEgYSB0ZWxhIGRlIGxvYWRpbmdcblx0XHRcdFVJLmxvYWRiYXIuaGlkZSgpO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5MaXN0YS5zdGF0dXMoKVxuXHRcdHN0YXR1czogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBzZSBwcmF6byBkZSBwb3N0YWdlbSBlc3RpdmVyIGVuY2VycmFkbywgaW5zZXJlIGNsYXNzZSBubyA8Ym9keT5cblx0XHRcdGlmIChtb21lbnQoKS5pc0FmdGVyKExpc3RhLkVkaWNhb1tcImZpbVwiXSkpIHtcblx0XHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcInBvc3RhZ2Vucy1lbmNlcnJhZGFzXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBzZSBhIGVkacOnw6NvIGVzdGl2ZXIgZW5jZXJyYWRhLCBpbnNlcmUgY2xhc3NlIG5vIDxib2R5PlxuXHRcdFx0Ly8gZSBwYXJhIGRlIGF0dWFsaXphciBhdXRvbWF0aWNhbWVudGVcblx0XHRcdGlmIChMaXN0YS5SZWd1bGFtZW50b1tcImVuY2VycmFkYVwiXSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwiZWRpY2FvLWVuY2VycmFkYVwiKTtcblx0XHRcdFx0Y2xlYXJJbnRlcnZhbCh1cGRhdGVfaW50ZXJ2YWwpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5MaXN0YS5tZXNzYWdlcygpXG5cdFx0bWVzc2FnZXM6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gc2UgdGl2ZXIgdMOtdHVsbyBlc3BlY2lmaWNhZG8sIGluc2VyZSBlbGVcblx0XHRcdGlmIChMaXN0YS5FZGljYW9bXCJtZW5zYWdlbVwiXVtcInRpdHVsb1wiXSkge1xuXHRcdFx0XHRsZXQgcGFnZV90aXRsZSA9IExpc3RhLkVkaWNhb1tcIm1lbnNhZ2VtXCJdW1widGl0dWxvXCJdO1xuXHRcdFx0XHQkdWlbXCJ0aXRsZVwiXS5odG1sKHBhZ2VfdGl0bGUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBkZSB0aXZlciBtZW5zYWdlbSBkZSByb2RhcMOpIGVzcGVjaWZpY2FkYSwgaW5zZXJlIGVsYVxuXHRcdFx0aWYgKExpc3RhLkVkaWNhb1tcIm1lbnNhZ2VtXCJdW1wicm9kYXBlXCJdKSB7XG5cdFx0XHRcdGxldCBjbG9zaW5nX21lc3NhZ2UgPSBMaXN0YS5FZGljYW9bXCJtZW5zYWdlbVwiXVtcInJvZGFwZVwiXTtcblx0XHRcdFx0JChcIi5qcy1tZW5zYWdlbS1maW5hbFwiKS5odG1sKGNsb3NpbmdfbWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gYXBwLkxpc3RhLmxvYWQoKVxuXHRcdGxvYWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gbW9zdHJhIGEgdGVsYSBkZSBsb2FkaW5nIGUgbGltcGEgbyBzdHJlYW1cblx0XHRcdCRzdHJlYW0ubG9hZGluZy5hZGRDbGFzcyhcImZhZGUtaW4gaW5cIik7XG5cblx0XHRcdC8vIGNhcnJlZ2Egb3MgZGFkb3MgZGEgQVBJXG5cdFx0XHQkLmdldEpTT04oXCJodHRwczovL2FwaS5sYWd1aW5oby5vcmcvbGlzdGEvXCIgKyBlZGljYW8gKyBcIi90dWRvP2tleT1cIiArIGFwaV9rZXkgKyBcIiZjYWxsYmFjaz0/XCIpLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHQvLyBcIkRJUkVUT1JcIlxuXHRcdFx0XHQvLyBUT0RPIE8gbG9hZCBkZXZlIGZpY2FyIHNlcGFyYWRvIGRvIFN0cmVhbSAodmVyIGlzc3VlICM3KVxuXHRcdFx0XHRMaXN0YS5SZWd1bGFtZW50byA9IGRhdGFbXCJlZGljYW9cIl07XG5cdFx0XHRcdExpc3RhLlRhcmVmYXMgPSBkYXRhW1widGFyZWZhc1wiXTtcblxuXHRcdFx0XHQvLyBTZSBhIEVkacOnw6NvIGVzdGl2ZXIgZW5jZXJyYWRhLi4uXG5cblxuXHRcdFx0XHQvLyBGSU0gRE8gXCJESVJFVE9SXCJcblxuXHRcdFx0XHQvLyBMaW1wYSBvIHN0cmVhbSBwYXJhIGNvbWXDp2FyIGRvIHplcm9cblx0XHRcdFx0JHN0cmVhbS5lbXB0eSgpO1xuXG5cdFx0XHRcdC8vIE1vbnRhIHBsYWNhclxuXHRcdFx0XHRhcHAuUGxhY2FyLnVwZGF0ZShkYXRhW1wicGxhY2FyXCJdKTtcblxuXHRcdFx0XHQvLyBJbnNlcmUgb3MgY2FyZHMgZGUgdGFyZWZhc1xuXHRcdFx0XHQkLmVhY2goZGF0YVtcInRhcmVmYXNcIl0sIGZ1bmN0aW9uKGluZGV4LCB0YXJlZmEpIHtcblx0XHRcdFx0XHR0YXJlZmFzW3RhcmVmYVtcIm51bWVyb1wiXV0gPSB0YXJlZmE7XG5cdFx0XHRcdFx0dGFyZWZhW1widXJsXCJdID0gXCIvdGFyZWZhcy9cIiArIHRhcmVmYVtcIm51bWVyb1wiXTtcblx0XHRcdFx0XHR0YXJlZmFbXCJ1cmxcIl0gPSByb3V0ZXJbXCJidWlsZC1saW5rXCJdKFwiL3RhcmVmYXMvXCIgKyB0YXJlZmFbXCJudW1lcm9cIl0pO1xuXG5cdFx0XHRcdFx0aWYgKHRhcmVmYVtcImltYWdlbVwiXSkge1xuXHRcdFx0XHRcdFx0dGFyZWZhW1wiaW1hZ2VtLXVybFwiXSA9IHRhcmVmYVtcImltYWdlbVwiXVtcInVybFwiXTtcblx0XHRcdFx0XHRcdHRhcmVmYVtcImltYWdlbS1hc3BlY3RvXCJdID0gXCJwYWRkaW5nLXRvcDogXCIgKyAodGFyZWZhW1wiaW1hZ2VtXCJdW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHZhciAkY2FyZCA9IF9fcmVuZGVyKFwiY2FyZC10YXJlZmFcIiwgdGFyZWZhKS5kYXRhKHtcblx0XHRcdFx0XHRcdFx0XCJ0YXJlZmFcIjogdGFyZWZhW1wibnVtZXJvXCJdLFxuXHRcdFx0XHRcdFx0XHRcImxhc3QtbW9kaWZpZWRcIjogKHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXT8gbW9tZW50KHRhcmVmYVtcInVsdGltYS1wb3N0YWdlbVwiXSkuZm9ybWF0KFwiWFwiKSA6IDApXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGlmICh0YXJlZmFbXCJwcmV2aWV3XCJdKSB7XG5cdFx0XHRcdFx0XHQkY2FyZC5hZGRDbGFzcyhcImZhbnRhc21hXCIpO1xuXHRcdFx0XHRcdFx0JChcImFcIiwgJGNhcmQpLnJlbW92ZUF0dHIoXCJocmVmXCIpO1xuXHRcdFx0XHRcdFx0JChcIi5ib2R5XCIsICRjYXJkKS5yZW1vdmUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIXRhcmVmYVtcImltYWdlbVwiXSkge1xuXHRcdFx0XHRcdFx0JChcIi5tZWRpYVwiLCAkY2FyZCkucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcG9zdHNcblx0XHRcdFx0XHR2YXIgJGdyaWQgPSAkKFwiLmdyaWRcIiwgJGNhcmQpO1xuXG5cdFx0XHRcdFx0aWYgKHRhcmVmYVtcInBvc3RzXCJdICYmIHRhcmVmYVtcInBvc3RzXCJdLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0dmFyIHRvdGFsX3Bvc3RzID0gdGFyZWZhW1wicG9zdHNcIl0ubGVuZ3RoO1xuXHRcdFx0XHRcdFx0Ly8gdmFyIHRvdGFsX21lZGlhID0gdGFyZWZhW1wicG9zdHNcIl0ucmVkdWNlKCh0b3RhbCwgcG9zdCkgPT4gdG90YWwgKyBwb3N0W1wibWlkaWFcIl0ubGVuZ3RoLCAwKTtcblx0XHRcdFx0XHRcdHZhciBtYXhfbWVkaWFfdG9fc2hvdyA9ICh1aVtcImNvbHVtbnNcIl0gPCAyPyA5IDogOCk7XG5cdFx0XHRcdFx0XHR2YXIgc2hvd25fbWVkaWFfY291bnQgPSAwO1xuXG5cdFx0XHRcdFx0XHR2YXIgcG9zdF90eXBlc193aXRoX2ltYWdlX3ByZXZpZXcgPSBbXCJpbWFnZW1cIiwgXCJ5b3V0dWJlXCIsIFwidmltZW9cIiwgXCJ2aW5lXCIsIFwiZ2lmXCJdO1xuXHRcdFx0XHRcdFx0dmFyIHBvc3RfdHlwZXNfd2l0aF90ZXh0X3ByZXZpZXcgPSBbXCJ0ZXh0b1wiXTtcblxuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbF9wb3N0czsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBwb3N0ID0gdGFyZWZhW1wicG9zdHNcIl1baV07XG5cblx0XHRcdFx0XHRcdFx0aWYgKChwb3N0W1wibWlkaWFcIl0gfHwgcG9zdFtcInRpcG9cIl0gPT0gXCJ0ZXh0b1wiKSAmJiAoc2hvd25fbWVkaWFfY291bnQgPCBtYXhfbWVkaWFfdG9fc2hvdykpIHtcblx0XHRcdFx0XHRcdFx0XHRzaG93bl9tZWRpYV9jb3VudCsrO1xuXG5cdFx0XHRcdFx0XHRcdFx0dmFyIHRpbGVfdHlwZTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgbWVkaWEgPSB7IH07XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBpbWFnZW1cblx0XHRcdFx0XHRcdFx0XHRpZiAocG9zdF90eXBlc193aXRoX2ltYWdlX3ByZXZpZXcuaW5kZXhPZihwb3N0W1widGlwb1wiXSkgPiAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGlsZV90eXBlID0gXCJ0aWxlLWltYWdlXCI7XG5cblx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wiY291bnRcIl0gPSBzaG93bl9tZWRpYV9jb3VudDtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwieW91dHViZVwiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidmltZW9cIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbmVcIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcImdpZlwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wicHJldmlld1wiXSA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCdcIiArIHBvc3RbXCJtaWRpYVwiXVswXVtcInRodW1ibmFpbFwiXSArIFwiJyk7XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1lZGlhW1wibW9kaWZpZXJcIl0gPSBcInZpZGVvXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHBvc3RbXCJtaWRpYVwiXSAmJiBwb3N0W1wibWlkaWFcIl1bMF0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWVkaWFbXCJwcmV2aWV3XCJdID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJ1wiICsgcG9zdFtcIm1pZGlhXCJdWzBdW1wiY2FtaW5ob1wiXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cG9zdFtcIm1pZGlhXCJdWzBdW1wiYXJxdWl2b3NcIl1bMF0gKyBcIicpO1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZVxuXG5cdFx0XHRcdFx0XHRcdFx0Ly8gdGV4dG9cblx0XHRcdFx0XHRcdFx0XHRpZiAocG9zdF90eXBlc193aXRoX3RleHRfcHJldmlldy5pbmRleE9mKHBvc3RbXCJ0aXBvXCJdKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aWxlX3R5cGUgPSBcInRpbGUtdGV4dFwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0bWVkaWEgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFwicHJldmlld1wiOiBwb3N0W1wibGVnZW5kYVwiXS5zdWJzdHJpbmcoMCwgMTIwKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCJjb3VudFwiOiBzaG93bl9tZWRpYV9jb3VudFxuXHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoKHNob3duX21lZGlhX2NvdW50ID09PSBtYXhfbWVkaWFfdG9fc2hvdykgJiYgKCh0b3RhbF9wb3N0cyAtIHNob3duX21lZGlhX2NvdW50KSA+IDApKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vZGlmaWVyXCJdID0gXCJtb3JlXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZWRpYVtcIm1vcmVcIl0gPSBcIismdGhpbnNwO1wiICsgKHRvdGFsX3Bvc3RzIC0gc2hvd25fbWVkaWFfY291bnQgKyAxKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHR2YXIgJHRpbGUgPSBfX3JlbmRlcih0aWxlX3R5cGUsIG1lZGlhKS5hcHBlbmRUbygkZ3JpZCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBzZSBuw6NvIHRpdmVyIG5lbmh1bSBwb3N0LCByZW1vdmUgbyBncmlkXG5cdFx0XHRcdFx0XHQkZ3JpZC5yZW1vdmUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBhdHVhbGl6YSBvIGlzb3RvcGVcblx0XHRcdFx0XHQkc3RyZWFtLmFwcGVuZCgkY2FyZCkuaXNvdG9wZShcImFwcGVuZGVkXCIsICRjYXJkKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gU2UgYSBFZGnDp8OjbyBlc3RpdmVyIGVuY2VycmFkYSwgb3JkZW5hIHBvciBuw7ptZXJvIGRhIHRhcmVmYS5cblx0XHRcdFx0Ly8gU2UgbsOjbywgb3JkZW5hIHBvciBvcmRlbSBkZSBhdHVhbGl6YcOnw6NvXG5cdFx0XHRcdGFwcC5MaXN0YS5sYXlvdXQoKTtcblx0XHRcdFx0YXBwLkxpc3RhLnNvcnQoKExpc3RhLlJlZ3VsYW1lbnRvW1wiZW5jZXJyYWRhXCJdPyBcInRhcmVmYVwiOiBcImRhdGVcIikpO1xuXG5cdFx0XHRcdC8vIHNlIHRpdmVyIHRhcmVmYSBlc3BlY2lmaWNhZGEgbm8gbG9hZCBkYSBww6FnaW5hLCBjYXJyZWdhIGVsYVxuXHRcdFx0XHRpZiAocm91dGVyW1wicGF0aFwiXVsyXSkge1xuXHRcdFx0XHRcdGFwcC5UYXJlZmEub3Blbihyb3V0ZXJbXCJwYXRoXCJdWzJdKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGVzY29uZGUgYSB0ZWxhIGRlIGxvYWRpbmdcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQkc3RyZWFtLmxvYWRpbmdcblx0XHRcdFx0XHRcdC5yZW1vdmVDbGFzcyhcImZhZGUtaW5cIilcblx0XHRcdFx0XHRcdC5vbmUoXCJ0cmFuc2l0aW9uZW5kXCIsIGZ1bmN0aW9uKCkgeyAkc3RyZWFtLmxvYWRpbmcucmVtb3ZlQ2xhc3MoXCJpblwiKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSwgMTIwMCk7XG5cblx0XHRcdFx0Ly8gZ3VhcmRhIGEgZGF0YSBkYSDDumx0aW1hIGF0dWFsaXphw6fDo28gZSB6ZXJhIG8gY29udGFkb3IgZGUgbm92aWRhZGVzXG5cdFx0XHRcdGxhc3RfdXBkYXRlZCA9IG1vbWVudChkYXRhW1wiZWRpY2FvXCJdW1widWx0aW1hLWF0dWFsaXphY2FvXCJdKTtcblx0XHRcdFx0dXBkYXRlZFtcInRhcmVmYXNcIl0gPSAwOyB1cGRhdGVkW1wicG9zdHNcIl0gPSAwO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdGxheW91dDogZnVuY3Rpb24oKSB7XG5cdFx0XHQkc3RyZWFtLmlzb3RvcGUoXCJyZWxvYWRJdGVtc1wiKTtcblx0XHRcdCRzdHJlYW0uaXNvdG9wZShcImxheW91dFwiKTtcblx0XHR9LFxuXG5cdFx0c29ydDogZnVuY3Rpb24oY3JpdGVyaWEpIHtcblx0XHRcdCRzdHJlYW0uaXNvdG9wZSh7XG5cdFx0XHRcdFwic29ydEJ5XCI6IGNyaXRlcmlhXG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59KSgpO1xuXG4vLyBqUXVlcnlcbnZhciAkc3RyZWFtO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQkc3RyZWFtID0gJChcIi5qcy1hcHAtbGlzdGFcIik7XG5cdC8vICRzdHJlYW0ubG9hZGluZyA9ICQoXCJtYWluIC5sb2FkaW5nXCIpO1xuXG5cdCRzdHJlYW0uaXNvdG9wZSh7XG5cdFx0XCJpdGVtU2VsZWN0b3JcIjogXCIuY2FyZC10YXJlZmFcIixcblx0XHRcInRyYW5zaXRpb25EdXJhdGlvblwiOiBcIi44c1wiLFxuXHRcdFwiZ2V0U29ydERhdGFcIjoge1xuXHRcdFx0XCJkYXRlXCI6IFwiLmxhc3QtbW9kaWZpZWRcIixcblx0XHRcdFwidGFyZWZhXCI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcblx0XHRcdFx0cmV0dXJuIHBhcnNlSW50KCQoZWxlbWVudCkuZGF0YShcInRhcmVmYVwiKSwgMTApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0XCJzb3J0QXNjZW5kaW5nXCI6IHtcblx0XHRcdFwiZGF0ZVwiOiBmYWxzZSxcblx0XHRcdFwidGFyZWZhXCI6IHRydWVcblx0XHR9LFxuXHRcdFwic29ydEJ5XCI6IFtcImRhdGVcIiwgXCJ0YXJlZmFcIl0sXG5cdFx0XCJtYXNvbnJ5XCI6IHtcblx0XHRcdFwiZ3V0dGVyXCI6ICh1aVtcImNvbHVtbnNcIl0gPT09IDE/IDggOiAxNilcblx0XHR9XG5cdH0pO1xuXG5cdCRzdHJlYW0ub24oXCJjbGlja1wiLCBcIi5jYXJkLXRhcmVmYTpub3QoLmZhbnRhc21hKVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmIChldmVudC53aGljaCA9PT0gMSkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0dmFyIG51bWVybyA9ICQodGhpcykuZGF0YShcInRhcmVmYVwiKTtcblx0XHRcdGFwcC5UYXJlZmEub3BlbihudW1lcm8sIHRydWUpO1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gYXBwLkxpc3RhLmxvYWQoKTtcblxuXHQvLyBvcmRlbmHDp8Ojb1xuXHQkdWlbXCJzaWRlbmF2XCJdLm9uKFwiY2xpY2tcIiwgXCIuanMtc3RyZWFtLXNvcnQgYVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgY3JpdGVyaWEgPSAkKHRoaXMpLmRhdGEoXCJzb3J0LWJ5XCIpO1xuXHRcdCQoXCIuanMtc3RyZWFtLXNvcnQgYVwiLCAkdWlbXCJzaWRlbmF2XCJdKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcblx0XHQkKHRoaXMpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuXG5cdFx0YXBwLkxpc3RhLnNvcnQoY3JpdGVyaWEpO1xuXHRcdFVJLnNpZGVuYXYuY2xvc2UoKTtcblx0fSk7XG59KTtcbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHRhcmVmYSAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGFwcC5UYXJlZmEub3BlbigpXG4vLyBhcHAuVGFyZWZhLnJlbmRlcigpXG4vLyBhcHAuVGFyZWZhLmNsb3NlKClcblxuYXBwLlRhcmVmYSA9IChmdW5jdGlvbigpIHtcblx0dmFyIHBsYWNhcl9kYV90YXJlZmEgPSBbIF07XG5cblx0ZnVuY3Rpb24gcmVuZGVyUG9zdHMocG9zdHMsICRwb3N0cykge1xuXHRcdHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSA9IDA7XG5cdFx0Zm9yICh2YXIgdHVybWEgaW4gTGlzdGEuUmVndWxhbWVudG9bXCJ0dXJtYXNcIl0pIHtcblx0XHRcdHBsYWNhcl9kYV90YXJlZmFbTGlzdGEuUmVndWxhbWVudG9bXCJ0dXJtYXNcIl1bdHVybWFdXSA9IDA7XG5cdFx0fVxuXG5cdFx0JC5lYWNoKHBvc3RzLCBmdW5jdGlvbihpbmRleCwgcG9zdCkge1xuXHRcdFx0cG9zdFtcImRhdGEtZGUtcG9zdGFnZW0tZm9ybWF0YWRhXCJdID0gbW9tZW50KHBvc3RbXCJkYXRhLWRlLXBvc3RhZ2VtXCJdKS5jYWxlbmRhcigpO1xuXHRcdFx0cG9zdFtcInR1cm1hLWZvcm1hdGFkYVwiXSA9IHBvc3RbXCJ0dXJtYVwiXS50b1VwcGVyQ2FzZSgpO1xuXG5cdFx0XHQvLyBhdmFsaWHDp8Ojb1xuXHRcdFx0aWYgKHBvc3RbXCJhdmFsaWFjYW9cIl0pIHtcblx0XHRcdFx0aWYgKHBvc3RbXCJhdmFsaWFjYW9cIl1bXCJzdGF0dXNcIl0gPT09IDIwMCkge1xuXHRcdFx0XHRcdHBvc3RbXCJzdGF0dXMtY2xhc3NcIl0gPSBwb3N0W1widHVybWFcIl07XG5cdFx0XHRcdFx0cG9zdFtcInN0YXR1cy1pY29uXCJdID0gXCI8aSBjbGFzcz1cXFwibWF0ZXJpYWwtaWNvbnNcXFwiPiYjeEU4N0Q7PC9pPlwiOyAvLyBjb3Jhw6fDo29cblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzXCJdID0gcG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXSArIFwiIHBvbnRvXCIgKyAocG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXSA+IDE/IFwic1wiOiBcIlwiKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzLWNsYXNzXCJdID0gXCJyZWplY3RlZFwiO1xuXHRcdFx0XHRcdHBvc3RbXCJzdGF0dXMtaWNvblwiXSA9IFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj4mI3hFODg4OzwvaT5cIjtcblx0XHRcdFx0XHRwb3N0W1wic3RhdHVzXCJdID0gXCJSZXByb3ZhZG9cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRwb3N0W1wibWVuc2FnZW1cIl0gPSBwb3N0W1wiYXZhbGlhY2FvXCJdW1wibWVuc2FnZW1cIl07XG5cblx0XHRcdFx0Ly8gc29tYSBwb250b3Mgbm8gcGxhY2FyXG5cdFx0XHRcdHBsYWNhcl9kYV90YXJlZmFbXCJ0b3RhbFwiXSArPSBwb3N0W1wiYXZhbGlhY2FvXCJdW1wicG9udG9zXCJdO1xuXHRcdFx0XHRwbGFjYXJfZGFfdGFyZWZhW3Bvc3RbXCJ0dXJtYVwiXV0gKz0gcG9zdFtcImF2YWxpYWNhb1wiXVtcInBvbnRvc1wiXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBvc3RbXCJzdGF0dXMtaWNvblwiXSA9IFwiPGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj4mI3hFOEI1OzwvaT5cIjsgLy8gcmVsw7NnaW9cblx0XHRcdFx0cG9zdFtcInN0YXR1c1wiXSA9IFwiQWd1YXJkYW5kbyBhdmFsaWHDp8Ojb1wiO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBsZWdlbmRhXG5cdFx0XHRpZiAocG9zdFtcImxlZ2VuZGFcIl0gJiYgcG9zdFtcImxlZ2VuZGFcIl0uc3Vic3RyaW5nKDAsMykgIT0gXCI8cD5cIikge1xuXHRcdFx0XHRwb3N0W1wibGVnZW5kYVwiXSA9IFwiPHA+XCIgKyBwb3N0W1wibGVnZW5kYVwiXS5yZXBsYWNlKC8oPzpcXHJcXG5cXHJcXG58XFxyXFxyfFxcblxcbikvZywgXCI8L3A+PHA+XCIpICsgXCI8L3A+XCI7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHJlbmRlcml6YSBvIHBvc3Rcblx0XHRcdHZhciAkcG9zdF9jYXJkID0gX19yZW5kZXIoXCJ2aWV3LXRhcmVmYS1wb3N0LWNhcmRcIiwgcG9zdCk7XG5cdFx0XHR2YXIgJG1lZGlhID0gJChcIi5wb3N0LW1lZGlhID4gdWxcIiwgJHBvc3RfY2FyZCk7XG5cblx0XHRcdC8vIGFkaWNpb25hIG3DrWRpYXNcblx0XHRcdGlmIChwb3N0W1wibWlkaWFcIl0pIHtcblx0XHRcdFx0JC5lYWNoKHBvc3RbXCJtaWRpYVwiXSwgZnVuY3Rpb24oaW5kZXgsIG1lZGlhKSB7XG5cdFx0XHRcdFx0Ly8gaW1hZ2VtXG5cdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwiaW1hZ2VtXCIpIHtcblx0XHRcdFx0XHRcdG1lZGlhW1wiZGVmYXVsdFwiXSA9IG1lZGlhW1wiY2FtaW5ob1wiXSArIG1lZGlhW1wiYXJxdWl2b3NcIl1bMV07XG5cdFx0XHRcdFx0XHRtZWRpYVtcInBhZGRpbmctYXNwZWN0b1wiXSA9IFwicGFkZGluZy10b3A6IFwiICsgKG1lZGlhW1wiYXNwZWN0b1wiXSAqIDEwMCkudG9GaXhlZCgyKSArIFwiJVwiO1xuXHRcdFx0XHRcdFx0bWVkaWFbXCJsaW5rLW9yaWdpbmFsXCJdID0gbWVkaWFbXCJjYW1pbmhvXCJdICsgbWVkaWFbXCJhcnF1aXZvc1wiXVsyXTtcblx0XHRcdFx0XHRcdHZhciAkaW1hZ2UgPSBfX3JlbmRlcihcIm1lZGlhLXBob3RvXCIsIG1lZGlhKTtcblx0XHRcdFx0XHRcdCRtZWRpYS5hcHBlbmQoJGltYWdlKTtcblx0XHRcdFx0XHR9IGVsc2VcblxuXHRcdFx0XHRcdC8vIGVtYmVkXG5cdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwieW91dHViZVwiIHx8IHBvc3RbXCJ0aXBvXCJdID09IFwidmltZW9cIiB8fCBwb3N0W1widGlwb1wiXSA9PSBcInZpbmVcIikge1xuXHRcdFx0XHRcdFx0aWYgKHBvc3RbXCJ0aXBvXCJdID09IFwieW91dHViZVwiKSB7XG5cdFx0XHRcdFx0XHRcdG1lZGlhW1wiZW1iZWRcIl0gPSBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL1wiICsgbWVkaWFbXCJ5b3V0dWJlLWlkXCJdICsgXCI/cmVsPTAmYW1wO3Nob3dpbmZvPTBcIjtcblx0XHRcdFx0XHRcdH0gZWxzZVxuXG5cdFx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ2aW1lb1wiKSB7XG5cdFx0XHRcdFx0XHRcdG1lZGlhW1wiZW1iZWRcIl0gPSBcImh0dHBzOi8vcGxheWVyLnZpbWVvLmNvbS92aWRlby9cIiArIG1lZGlhW1widmltZW8taWRcIl0gKyBcIj90aXRsZT0wJmJ5bGluZT0wJnBvcnRyYWl0PTBcIjtcblx0XHRcdFx0XHRcdH0gZWxzZVxuXG5cdFx0XHRcdFx0XHRpZiAocG9zdFtcInRpcG9cIl0gPT0gXCJ2aW5lXCIpIHtcblx0XHRcdFx0XHRcdFx0bWVkaWFbXCJlbWJlZFwiXSA9IFwiaHR0cHM6Ly92aW5lLmNvL3YvXCIgKyBtZWRpYVtcInZpbmUtaWRcIl0gKyBcIi9lbWJlZC9zaW1wbGVcIjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bWVkaWFbXCJwYWRkaW5nLWFzcGVjdG9cIl0gPSBcInBhZGRpbmctdG9wOiBcIiArIChtZWRpYVtcImFzcGVjdG9cIl0gKiAxMDApLnRvRml4ZWQoMikgKyBcIiVcIjtcblx0XHRcdFx0XHRcdHZhciAkZW1iZWQgPSBfX3JlbmRlcihcIm1lZGlhLXZpZGVvXCIsIG1lZGlhKTtcblx0XHRcdFx0XHRcdCRtZWRpYS5hcHBlbmQoJGVtYmVkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB0aXJhIGxlZ2VuZGEgc2UgbsOjbyB0aXZlclxuXHRcdFx0aWYgKCFwb3N0W1wibGVnZW5kYVwiXSkge1xuXHRcdFx0XHQkcG9zdF9jYXJkLmFkZENsYXNzKFwibm8tY2FwdGlvblwiKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFwb3N0W1wibWVkaWFcIl0pIHtcblx0XHRcdFx0JHBvc3RfY2FyZC5hZGRDbGFzcyhcIm5vLW1lZGlhXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB0aXJhIG1lbnNhZ2VtIGRlIGF2YWxpYcOnw6NvIHNlIG7Do28gdGl2ZXJcblx0XHRcdGlmICghcG9zdFtcImF2YWxpYWNhb1wiXSB8fCAhcG9zdFtcIm1lbnNhZ2VtXCJdKSB7XG5cdFx0XHRcdCQoXCIucmVzdWx0IC5tZXNzYWdlXCIsICRwb3N0X2NhcmQpLnJlbW92ZSgpO1xuXHRcdFx0fVxuXG5cblx0XHRcdC8vIGFkaWNpb25hIG8gcG9zdCDDoCB0YXJlZmFcblx0XHRcdC8vICRwb3N0cy5hcHBlbmQoJHBvc3RfY2FyZCkuaXNvdG9wZShcImFwcGVuZGVkXCIsICRwb3N0X2NhcmQpO1xuXHRcdFx0JHBvc3RzLmFwcGVuZCgkcG9zdF9jYXJkKTtcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiB7XG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5UYXJlZmEub3BlbigpXG5cdFx0b3BlbjogZnVuY3Rpb24obnVtZXJvLCBwdXNoU3RhdGUpIHtcblx0XHRcdHZhciB0YXJlZmEgPSB0YXJlZmFzW251bWVyb107XG5cdFx0XHR0YXJlZmFfYWN0aXZlID0gbnVtZXJvO1xuXG5cdFx0XHRpZiAoVUkuZGF0YVtcImNvbHVtbnNcIl0gPj0gMykge1xuXHRcdFx0XHQvLyBVSS5iYWNrZHJvcC5zaG93KCRhcHBbXCJ0YXJlZmFcIl0sIHsgXCJoaWRlXCI6IGFwcC5UYXJlZmEuY2xvc2UgfSk7XG5cdFx0XHRcdC8vICR1aVtcImJhY2tkcm9wXCJdWyRhcHBbXCJ0YXJlZmFcIl1dLm9uKFwiaGlkZVwiLCBhcHAuVGFyZWZhLmNsb3NlKTtcblx0XHRcdH1cblxuXHRcdFx0JGFwcFtcInRhcmVmYVwiXS5hZGRDbGFzcyhcImluXCIpO1xuXHRcdFx0YXBwLlRhcmVmYS5yZW5kZXIodGFyZWZhKTtcblxuXHRcdFx0JGFwcFtcInRhcmVmYVwiXS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlLXhcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdC8vXHR2YXIgdmlld190aGVtZV9jb2xvciA9ICQoXCIuYXBwYmFyXCIsICRhcHBbXCJ0YXJlZmFcIl0pLmNzcyhcImJhY2tncm91bmQtY29sb3JcIik7XG5cdFx0XHRcdCQoXCJoZWFkIG1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKS5hdHRyKFwiY29udGVudFwiLCBcIiM1NDZlN2FcIik7XG5cdFx0XHR9KTtcblxuXHRcdFx0JHVpW1wiYm9keVwiXS5hZGRDbGFzcyhcIm5vLXNjcm9sbCB0YXJlZmEtYWN0aXZlXCIpO1xuXG5cdFx0XHQvLyByb3V0ZXJcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZXBsYWNlKFwidGFyZWZhXCIpO1xuXHRcdFx0aWYgKHB1c2hTdGF0ZSkgeyByb3V0ZXIuZ28oXCIvdGFyZWZhcy9cIiArIHRhcmVmYVtcIm51bWVyb1wiXSwgeyBcInZpZXdcIjogXCJ0YXJlZmFcIiwgXCJpZFwiOiB0YXJlZmFbXCJudW1lcm9cIl0gfSwgdGFyZWZhW1widGl0dWxvXCJdKTsgfVxuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIGFwcC5UYXJlZmEucmVuZGVyKCkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHRyZW5kZXI6IGZ1bmN0aW9uKHRhcmVmYSkge1xuXHRcdFx0dmFyICR0YXJlZmEgPSBfX3JlbmRlcihcInZpZXctdGFyZWZhXCIsIHRhcmVmYSk7XG5cblx0XHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHRcdC8vIGNhcmQgZGEgdGFyZWZhXG5cdFx0XHRpZiAodGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdHRhcmVmYVtcImltYWdlbVwiXVtcImFzcGVjdG9cIl0gPSBcInBhZGRpbmctdG9wOiBcIiArICh0YXJlZmFbXCJpbWFnZW1cIl1bXCJhc3BlY3RvXCJdICogMTAwKS50b0ZpeGVkKDIpICsgXCIlXCI7XG5cdFx0XHR9XG5cblx0XHRcdHZhciAkdGFyZWZhX2NhcmQgPSBfX3JlbmRlcihcImNhcmQtdGFyZWZhXCIsIHRhcmVmYSk7XG5cblx0XHRcdGlmICghdGFyZWZhW1wiaW1hZ2VtXCJdKSB7XG5cdFx0XHRcdCQoXCIubWVkaWFcIiwgJHRhcmVmYV9jYXJkKS5yZW1vdmUoKTtcblx0XHRcdH1cblx0XHRcdCQoXCIuZ3JpZFwiLCAkdGFyZWZhX2NhcmQpLnJlbW92ZSgpO1xuXHRcdFx0JChcImFcIiwgJHRhcmVmYV9jYXJkKS5yZW1vdmVBdHRyKFwiaHJlZlwiKTtcblxuXHRcdFx0JChcIi50YXJlZmEtbWV0YSAudGFyZWZhLWNhcmRcIiwgJHRhcmVmYSkuYXBwZW5kKCR0YXJlZmFfY2FyZCk7XG5cblx0XHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHRcdC8vIHBvc3RzXG5cdFx0XHR2YXIgJHBvc3RzID0gJChcIi50YXJlZmEtcG9zdHMgPiB1bFwiLCAkdGFyZWZhKTtcblxuXHRcdFx0aWYgKHRhcmVmYVtcInBvc3RzXCJdLmxlbmd0aCkge1xuXHRcdFx0XHRyZW5kZXJQb3N0cyh0YXJlZmFbXCJwb3N0c1wiXSwgJHBvc3RzKTtcblxuXHRcdFx0XHQkcG9zdHMuaXNvdG9wZSh7XG5cdFx0XHRcdFx0XCJpdGVtU2VsZWN0b3JcIjogXCIucG9zdC1jYXJkXCIsXG5cdFx0XHRcdFx0XCJ0cmFuc2l0aW9uRHVyYXRpb25cIjogMCxcblx0XHRcdFx0XHRcIm1hc29ucnlcIjoge1xuXHRcdFx0XHRcdFx0XCJpc0ZpdFdpZHRoXCI6IHRydWUsXG5cdFx0XHRcdFx0XHRcImd1dHRlclwiOiAodWlbXCJjb2x1bW5zXCJdID09PSAxPyA4IDogMjQpLFxuXHRcdFx0XHRcdC8vXHRcImNvbHVtbldpZHRoXCI6ICh1aVtcImNvbHVtbnNcIl0gPCAxPyAzMDAgOiA0NTApXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQvLyB9KS5vbihcImxheW91dENvbXBsZXRlXCIsIGZ1bmN0aW9uKGV2ZW50LCBwb3N0cykge1xuXHRcdFx0XHQvLyBcdHZhciBwcmV2aW91c19wb3NpdGlvbjtcblx0XHRcdFx0Ly9cblx0XHRcdFx0Ly8gXHRmb3IgKHZhciBwb3N0IGluIHBvc3RzKSB7XG5cdFx0XHRcdC8vIFx0XHR2YXIgJHRoaXMgPSAkKHBvc3RzW3Bvc3RdLmVsZW1lbnQpO1xuXHRcdFx0XHQvLyBcdFx0dmFyIG9mZnNldCA9IHBvc3RzW3Bvc3RdLnBvc2l0aW9uO1xuXHRcdFx0XHQvLyBcdFx0dmFyIHNpZGUgPSAob2Zmc2V0W1wieFwiXSA9PT0gMD8gXCJsZWZ0XCIgOiBcInJpZ2h0XCIpO1xuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdFx0JHRoaXMuYWRkQ2xhc3MoXCJ0aW1lbGluZS1cIiArIHNpZGUpO1xuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdFx0aWYgKG9mZnNldFtcInlcIl0gLSBwcmV2aW91c19wb3NpdGlvbiA8IDEwKSB7XG5cdFx0XHRcdC8vIFx0XHRcdCR0aGlzLmFkZENsYXNzKFwiZXh0cmEtb2Zmc2V0XCIpO1xuXHRcdFx0XHQvLyBcdFx0fVxuXHRcdFx0XHQvL1xuXHRcdFx0XHQvLyBcdFx0cHJldmlvdXNfcG9zaXRpb24gPSBvZmZzZXRbXCJ5XCJdO1xuXHRcdFx0XHQvLyBcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoXCI8bGkgLz5cIikuYWRkQ2xhc3MoXCJlbXB0eVwiKS50ZXh0KFwiTmVuaHVtIHBvc3RcIikuYXBwZW5kVG8oJHBvc3RzKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdFx0Ly8gbGF5b3V0XG5cdFx0XHQkYXBwW1widGFyZWZhXCJdLmh0bWwoJHRhcmVmYSk7XG5cblx0XHRcdGlmICh0YXJlZmFbXCJwb3N0c1wiXS5sZW5ndGgpIHtcblx0XHRcdFx0JHBvc3RzLmlzb3RvcGUoXCJsYXlvdXRcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHBsYWNhciBkYSB0YXJlZmFcblx0XHRcdHZhciAkcGxhY2FyX2RhX3RhcmVmYSA9ICQoXCIucGFpbmVsIC5wbGFjYXIgdWxcIiwgJHRhcmVmYSk7XG5cblx0XHRcdCQuZWFjaChMaXN0YS5SZWd1bGFtZW50b1tcInR1cm1hc1wiXSwgZnVuY3Rpb24oaW5kZXgsIHR1cm1hKSB7XG5cdFx0XHRcdHZhciBwb250dWFjYW9fZGFfdHVybWEgPSBbIF07XG5cblx0XHRcdFx0Ly8gY2FsY3VsYSAlIGRhIHR1cm1hIGVtIHJlbGHDp8OjbyBhbyB0b3RhbCBkZSBwb250b3Ncblx0XHRcdFx0dmFyIHBlcmNlbnR1YWxfZGFfdHVybWEgPSAocGxhY2FyX2RhX3RhcmVmYVtcInRvdGFsXCJdID4gMD8gcGxhY2FyX2RhX3RhcmVmYVt0dXJtYV0gLyBwbGFjYXJfZGFfdGFyZWZhW1widG90YWxcIl0gOiAwKTtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1widHVybWFcIl0gPSB0dXJtYTtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1wiYWx0dXJhLWRhLWJhcnJhXCJdID0gXCJoZWlnaHQ6IFwiICsgKHBlcmNlbnR1YWxfZGFfdHVybWEgKiAxMDApLnRvRml4ZWQoMykgKyBcIiVcIjtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1widHVybWEtZm9ybWF0YWRhXCJdID0gdHVybWEudG9VcHBlckNhc2UoKTtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1wicG9udG9zXCJdID0gKHBsYWNhcl9kYV90YXJlZmFbdHVybWFdID4gMD8gcGxhY2FyX2RhX3RhcmVmYVt0dXJtYV0gOiAwKTtcblx0XHRcdFx0cG9udHVhY2FvX2RhX3R1cm1hW1wicG9udHVhY2FvLWZvcm1hdGFkYVwiXSA9IHBvbnR1YWNhb19kYV90dXJtYVtcInBvbnRvc1wiXS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLlwiKTtcblxuXHRcdFx0XHR2YXIgJHR1cm1hID0gX19yZW5kZXIoXCJwbGFjYXItdHVybWFcIiwgcG9udHVhY2FvX2RhX3R1cm1hKTtcblx0XHRcdFx0JHBsYWNhcl9kYV90YXJlZmEuYXBwZW5kKCR0dXJtYSk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyBhcHAuVGFyZWZhLmNsb3NlKClcblx0XHRjbG9zZTogZnVuY3Rpb24ocHVzaFN0YXRlKSB7XG5cdFx0XHR0YXJlZmFfYWN0aXZlID0gbnVsbDtcblx0XHRcdCQoXCJoZWFkIG1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKS5hdHRyKFwiY29udGVudFwiLCB0aGVtZV9jb2xvcltcIm9yaWdpbmFsXCJdKTtcblxuXHRcdFx0JHVpW1wiYm9keVwiXS5yZW1vdmVDbGFzcyhcIm5vLXNjcm9sbCB0YXJlZmEtYWN0aXZlXCIpO1xuXHRcdFx0JGFwcFtcInRhcmVmYVwiXS5yZW1vdmVDbGFzcyhcInNsaWRlLXhcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGFwcFtcInRhcmVmYVwiXS5yZW1vdmVDbGFzcyhcImluXCIpLmVtcHR5KCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKFVJLmRhdGFbXCJjb2x1bW5zXCJdID49IDMpIHtcblx0XHRcdFx0Ly8gVUkuYmFja2Ryb3AuaGlkZSgkYXBwW1widGFyZWZhXCJdKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcm91dGVyXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0ucmVwbGFjZShcImhvbWVcIik7XG5cdFx0XHRpZiAocHVzaFN0YXRlKSB7IHJvdXRlci5nbyhcIi90YXJlZmFzXCIsIHsgXCJ2aWV3XCI6IFwiaG9tZVwiIH0sIFwiTGlzdGEgZGUgVGFyZWZhc1wiKTsgfVxuXHRcdH1cblx0fTtcbn0pKCk7XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCRhcHBbXCJ0YXJlZmFcIl0gPSAkKFwiLmpzLWFwcC10YXJlZmFcIik7XG5cdCRhcHBbXCJ0YXJlZmFcIl0ub24oXCJjbGlja1wiLCBcIi5qcy10YXJlZmEtY2xvc2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGFwcC5UYXJlZmEuY2xvc2UodHJ1ZSk7XG5cdH0pLm9uKFwiY2xpY2tcIiwgXCIuanMtbmV3LXBvc3QtdHJpZ2dlclwiLCBmdW5jdGlvbigpIHtcblx0XHRVSS5ib3R0b21zaGVldC5vcGVuKCQoXCIubmV3LXBvc3Qtc2hlZXRcIiwgJGFwcFtcInRhcmVmYVwiXSkuY2xvbmUoKS5zaG93KCkpO1xuXHR9KS5vbihcImNsaWNrXCIsIFwiLmNhcmQtdGFyZWZhIGFcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZiAoZXZlbnQud2hpY2ggPT09IDEpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXHR9KTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbmV3IHBvc3QgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gKiBhcHAuUG9zdC5hdXRob3JpemUoKVxuLy8gKiBhcHAuUG9zdC5kZWF1dGhvcml6ZSgpXG4vLyAqIGFwcC5Qb3N0LmdldFRodW1ibmFpbCgpXG4vLyAqIGFwcC5Qb3N0Lm9wZW4oKVxuLy8gKiBhcHAuUG9zdC5jbG9zZSgpXG5cbi8vIHRpcG9zIGRlIHBvc3Q6IHBob3RvLCB2aWRlbywgdmluZSwgdGV4dFxuXG5hcHAuUG9zdCA9IChmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gTmV3UG9zdC5hdXRob3JpemUoKVxuXHRcdGF1dGhvcml6ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBoYWJpbGl0YSBvIGJvdMOjbyBlbnZpYXJcblx0XHRcdCQoXCIuc3VibWl0XCIsICRwb3N0KS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIE5ld1Bvc3QuZGVhdXRob3JpemUoKVxuXHRcdGRlYXV0aG9yaXplOiBmdW5jdGlvbigpIHtcblx0XHRcdC8vIGRlc2FiaWxpdGEgbyBib3TDo28gXCJlbnZpYXJcIlxuXHRcdFx0JChcIi5zdWJtaXRcIiwgJHBvc3QpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG5cdFx0fSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gTmV3UG9zdC5nZXRUaHVtYm5haWwoKVxuXHRcdGdldFRodW1ibmFpbDogZnVuY3Rpb24odXJsKSB7XG5cdFx0XHQvLyB0ZXN0YSBzZSB1cmxzIHPDo28gZG9zIHByb3ZpZGVyIGFjZWl0b3MgZSByZXNwb25kZSBjb20gaW5mb3JtYcOnw7VlcyBzb2JyZSBvIHbDrWRlbyxcblx0XHRcdC8vIGluY2x1aW5kbyBhIHVybCBkYSBtaW5pYXR1cmFcblx0XHRcdC8vIHByb3ZpZGVycyBhY2VpdG9zOiB5b3V0dWJlLCB2aW1lbywgdmluZVxuXHRcdFx0dmFyIG1lZGlhX2luZm8gPSB7IH07XG5cblx0XHRcdGZ1bmN0aW9uIHNob3dUaHVtYm5haWwobWVkaWFfaW5mbykge1xuXHRcdFx0XHR2YXIgJHRodW1ibmFpbCA9ICQoXCI8aW1nIC8+XCIpLmF0dHIoXCJzcmNcIiwgbWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSk7XG5cdFx0XHRcdCQoXCIuanMtbWVkaWEtcHJvdmlkZXJcIiwgJHBvc3QpLnZhbChtZWRpYV9pbmZvW1wicHJvdmlkZXJcIl0pO1xuXHRcdFx0XHQkKFwiLmpzLW1lZGlhLWlkXCIsICRwb3N0KS52YWwobWVkaWFfaW5mb1tcImlkXCJdKTtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS10aHVtYm5haWxcIiwgJHBvc3QpLnZhbChtZWRpYV9pbmZvW1widGh1bWJuYWlsXCJdKTtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS1wcmV2aWV3XCIsICRwb3N0KS5odG1sKCR0aHVtYm5haWwpLmZhZGVJbigpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB5b3V0dWJlXG5cdFx0XHRpZiAodXJsLm1hdGNoKC8oPzpodHRwcz86XFwvezJ9KT8oPzp3ezN9XFwuKT95b3V0dSg/OmJlKT9cXC4oPzpjb218YmUpKD86XFwvd2F0Y2hcXD92PXxcXC8pKFteXFxzJl0rKS8pKSB7XG5cdFx0XHRcdC8vIGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9NGN0NGVOTXJKbGdcblx0XHRcdFx0dmFyIHlvdXR1YmVfdXJsID0gdXJsLm1hdGNoKC8oPzpodHRwcz86XFwvezJ9KT8oPzp3ezN9XFwuKT95b3V0dSg/OmJlKT9cXC4oPzpjb218YmUpKD86XFwvd2F0Y2hcXD92PXxcXC8pKFteXFxzJl0rKS8pO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1wicHJvdmlkZXJcIl0gPSBcInlvdXR1YmVcIjtcblx0XHRcdFx0bWVkaWFfaW5mb1tcImlkXCJdID0geW91dHViZV91cmxbMV07XG5cdFx0XHQvL1x0bWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSA9IFwiaHR0cHM6Ly9pMS55dGltZy5jb20vdmkvXCIgKyB5b3V0dWJlX3VybFsxXSArIFwiL21heHJlc2RlZmF1bHQuanBnXCI7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJ0aHVtYm5haWxcIl0gPSBcImh0dHBzOi8vaTEueXRpbWcuY29tL3ZpL1wiICsgeW91dHViZV91cmxbMV0gKyBcIi8wLmpwZ1wiO1xuXG5cdFx0XHRcdE5ld1Bvc3QuYXV0aG9yaXplKCk7XG5cdFx0XHRcdHNob3dUaHVtYm5haWwobWVkaWFfaW5mbyk7XG5cdFx0XHR9IGVsc2VcblxuXHRcdFx0Ly8gdmltZW9cblx0XHRcdGlmICh1cmwubWF0Y2goL3ZpbWVvXFwuY29tLykpIHtcblx0XHRcdFx0Ly8gaHR0cHM6Ly92aW1lby5jb20vNjQyNzk2NDlcblx0XHRcdFx0dmFyIHZpbWVvX3VybCA9IHVybC5tYXRjaCgvXFwvXFwvKHd3d1xcLik/dmltZW8uY29tXFwvKFxcZCspKCR8XFwvKS8pO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1wicHJvdmlkZXJcIl0gPSBcInZpbWVvXCI7XG5cdFx0XHRcdG1lZGlhX2luZm9bXCJpZFwiXSA9IHZpbWVvX3VybFsyXTtcblxuXHRcdFx0XHQkLmdldEpTT04oXCJodHRwczovL3ZpbWVvLmNvbS9hcGkvdjIvdmlkZW8vXCIgKyB2aW1lb191cmxbMl0gKyBcIi5qc29uP2NhbGxiYWNrPT9cIilcblx0XHRcdFx0XHQuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdFx0bWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSA9IHJlc3BvbnNlWzBdW1widGh1bWJuYWlsX2xhcmdlXCJdO1xuXG5cdFx0XHRcdFx0XHROZXdQb3N0LmF1dGhvcml6ZSgpO1xuXHRcdFx0XHRcdFx0c2hvd1RodW1ibmFpbChtZWRpYV9pbmZvKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZVxuXG5cdFx0XHQvLyB2aW5lXG5cdFx0XHRpZiAodXJsLm1hdGNoKC92aW5lXFwuY28vKSkge1xuXHRcdFx0XHQvLyBodHRwczovL3ZpbmUuY28vdi9lOUlWOU9QbHJuSlxuXHRcdFx0XHR2YXIgdmluZV91cmwgPSB1cmwubWF0Y2goL1xcL1xcLyh3d3dcXC4pP3ZpbmVcXC5jb1xcL3ZcXC8oW15cXHMmXSspKCR8XFwvKS8pO1xuXHRcdFx0XHRtZWRpYV9pbmZvW1wicHJvdmlkZXJcIl0gPSBcInZpbmVcIjtcblx0XHRcdFx0bWVkaWFfaW5mb1tcImlkXCJdID0gdmluZV91cmxbMl07XG5cblx0XHRcdFx0JC5nZXRKU09OKFwiLy9hc3NldHMubGFndWluaG8ub3JnL2hlbHBlcnMvdmluZS10aHVtYm5haWw/aWQ9XCIgKyB2aW5lX3VybFsyXSArIFwiJmNhbGxiYWNrPT9cIilcblx0XHRcdFx0XHQuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdFx0bWVkaWFfaW5mb1tcInRodW1ibmFpbFwiXSA9IHJlc3BvbnNlW1widGh1bWJuYWlsXCJdO1xuXG5cdFx0XHRcdFx0XHROZXdQb3N0LmF1dGhvcml6ZSgpO1xuXHRcdFx0XHRcdFx0c2hvd1RodW1ibmFpbChtZWRpYV9pbmZvKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIE5ld1Bvc3Qub3BlbigpXG5cdFx0b3BlbjogZnVuY3Rpb24odHlwZSwgbnVtZXJvKSB7XG5cdFx0XHR2YXIgZGF0YSA9IHtcblx0XHRcdFx0XCJlZGljYW9cIjogTGlzdGEuUmVndWxhbWVudG9bXCJ0aXR1bG9cIl0sXG5cdFx0XHRcdFwibnVtZXJvXCI6IChudW1lcm8gfHwgdGFyZWZhX2FjdGl2ZSksXG5cdFx0XHRcdFwidXNlclwiOiB1c2VyW1wiaWRcIl0sXG5cdFx0XHRcdFwidHVybWFcIjogdXNlcltcInR1cm1hXCJdLFxuXHRcdFx0XHRcInRva2VuXCI6IHVzZXJbXCJ0b2tlblwiXVxuXHRcdFx0fTtcblx0XHRcdHZhciAkbmV3X3Bvc3RfdmlldyA9IF9fcmVuZGVyKFwibmV3LXBvc3QtXCIgKyB0eXBlLCBkYXRhKTtcblxuXHRcdFx0Ly8gZWZlaXRvIGRlIGFiZXJ0dXJhXG5cdFx0XHQvLyBfdmlldy5vcGVuKCRwb3N0LCAkbmV3UG9zdFZpZXcpO1xuXHRcdFx0JHBvc3QuaHRtbCgkbmV3X3Bvc3RfdmlldykuYWRkQ2xhc3MoXCJpblwiKS5yZWZsb3coKS5hZGRDbGFzcyhcInNsaWRlLXlcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHZpZXdfdGhlbWVfY29sb3IgPSAkKFwiLmFwcGJhclwiLCAkcG9zdCkuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiKTtcblx0XHRcdFx0JChcImhlYWQgbWV0YVtuYW1lPSd0aGVtZS1jb2xvciddXCIpLmF0dHIoXCJjb250ZW50XCIsIHZpZXdfdGhlbWVfY29sb3IpO1xuXHRcdFx0fSk7XG5cblx0XHRcdE5ld1Bvc3QuZGVhdXRob3JpemUoKTtcblxuXHRcdFx0Ly8gYcOnw7VlcyBwYXJhIGZhemVyIHF1YW5kbyBhYnJpciBhIHRlbGEgZGUgZW52aW9cblx0XHRcdC8vIGRlIGFjb3JkbyBjb20gbyB0aXBvIGRlIHBvc3RhZ2VtXG5cdFx0XHRpZiAodHlwZSA9PT0gXCJwaG90b1wiKSB7XG5cdFx0XHRcdCRwb3N0LmRyb3B6b25lKCk7XG5cdFx0XHRcdCQoXCIuZmlsZS1wbGFjZWhvbGRlclwiLCAkcG9zdCkudHJpZ2dlcihcImNsaWNrXCIpO1xuXHRcdFx0Ly9cdCQoXCJmb3JtXCIsICRuZXdfcG9zdF92aWV3KS5kcm9wem9uZSgpO1xuXHRcdFx0fSBlbHNlXG5cblx0XHRcdGlmICh0eXBlID09PSBcInZpZGVvXCIgfHwgdHlwZSA9PT0gXCJ2aW5lXCIpIHtcblx0XHRcdFx0JChcIi5qcy1tZWRpYS11cmwtaW5wdXRcIiwgJHBvc3QpLmZvY3VzKCkub24oXCJrZXl1cFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Ly9cdGlmICgkLmluQXJyYXkoZXZlbnQua2V5Q29kZSwgWzE2LCAxNywgMThdKSkgeyByZXR1cm47IH1cblx0XHRcdFx0XHROZXdQb3N0LmdldFRodW1ibmFpbCgkKHRoaXMpLnZhbCgpKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2VcblxuXHRcdFx0aWYgKHR5cGUgPT09IFwidGV4dFwiKSB7XG5cdFx0XHRcdCQoXCIuanMtY2FwdGlvbi1pbnB1dFwiLCAkcG9zdCkuZm9jdXMoKS5vbihcImtleXVwXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICgkKHRoaXMpLnZhbCgpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdE5ld1Bvc3QuYXV0aG9yaXplKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdE5ld1Bvc3QuZGVhdXRob3JpemUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB2aWV3IG1hbmFnZXJcblx0XHRcdHJvdXRlcltcInZpZXctbWFuYWdlclwiXS5yZXBsYWNlKFwibmV3LXBvc3RcIik7XG5cdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IFwidmlld1wiOiBcIm5ldy1wb3N0XCIsIFwidHlwZVwiOiB0eXBlLCBcImlkXCI6IGRhdGFbXCJudW1lcm9cIl0gfSwgbnVsbCwgbnVsbCk7XG5cdFx0fSxcblxuXHRcdC8vIHNlbmQ6IGZ1bmN0aW9uKCkge1xuXHRcdC8vXG5cdFx0Ly8gfSxcblxuXHRcdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gTmV3UG9zdC5jbG9zZSgpXG5cdFx0Y2xvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdC8vXHR0YXJlZmFfYWN0aXZlID0gbnVsbDtcblx0XHRcdCQoXCJoZWFkIG1ldGFbbmFtZT0ndGhlbWUtY29sb3InXVwiKS5hdHRyKFwiY29udGVudFwiLCB0aGVtZV9jb2xvcltcIm9yaWdpbmFsXCJdKTtcblxuXHRcdFx0JHBvc3QucmVtb3ZlQ2xhc3MoXCJzbGlkZS15XCIpLm9uZShcInRyYW5zaXRpb25lbmRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRwb3N0LnJlbW92ZUNsYXNzKFwiaW5cIikuZW1wdHkoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyb3V0ZXJbXCJ2aWV3LW1hbmFnZXJcIl0ucmVwbGFjZShcInRhcmVmYVwiKTtcblx0XHR9XG5cdH07XG59KSgpO1xuXG52YXIgcG9zdCA9IE5ld1Bvc3Q7XG5cbi8vIGpRdWVyeVxudmFyICRwb3N0O1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQkcG9zdCA9ICQoXCIjbmV3LXBvc3RcIik7XG5cdCR1aVtcImJvdHRvbXNoZWV0XCJdLm9uKFwiY2xpY2tcIiwgXCIubmV3LXBvc3Qtc2hlZXQgYVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHR2YXIgdHlwZSA9ICQodGhpcykuZGF0YShcInBvc3QtdHlwZVwiKTtcblx0XHRVSS5ib3R0b21zaGVldC5jbG9zZSgpO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRhcHAuUG9zdC5vcGVuKHR5cGUsIHRhcmVmYV9hY3RpdmUpO1xuXHRcdH0sIDYwMCk7XG5cdH0pO1xuXG5cdCRwb3N0Lm9uKFwic3VibWl0XCIsIFwiZm9ybVwiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH0pLm9uKFwiY2xpY2tcIiwgXCIuc3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmIChtb21lbnQoKS5pc0FmdGVyKExpc3RhLlJlZ3VsYW1lbnRvW1wiZmltXCJdKSkge1xuXHRcdFx0dG9hc3Qub3BlbihcIlBvc3RhZ2VucyBlbmNlcnJhZGFzIVwiKTtcblx0XHR9XG5cblx0XHRpZiAoJCh0aGlzKS5oYXNDbGFzcyhcImRpc2FibGVkXCIpKSB7XG5cdFx0XHQvLyBUT0RPIG1lbGhvcmFyIG1lbnNhZ2VtXG5cdFx0XHR0b2FzdC5vcGVuKFwiRXNwZXJlIG8gZmltIGRvIHVwbG9hZCZoZWxsaXA7XCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBkYXRhID0gJChcImZvcm1cIiwgJHBvc3QpLnNlcmlhbGl6ZSgpO1xuXG5cdFx0JChcIi5zdWJtaXRcIiwgJHBvc3QpLmFkZENsYXNzKFwiZGlzYWJsZWRcIikuaHRtbChcIkVudmlhbmRvJmhlbGxpcDtcIik7XG5cblx0XHQkLnBvc3QoXCIvLS9saXN0YS9ub3ZvXCIsIGRhdGEpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdGlmIChyZXNwb25zZVtcIm1ldGFcIl1bXCJzdGF0dXNcIl0gPT09IDIwMCkge1xuXHRcdFx0XHROZXdQb3N0LmNsb3NlKCk7XG5cdFx0XHRcdGFwcC5UYXJlZmEucmVuZGVyKHJlc3BvbnNlW1wiZGF0YVwiXSk7XG5cdFx0XHRcdFVJLnRvYXN0Lm9wZW4ocmVzcG9uc2VbXCJtZXRhXCJdW1wibWVzc2FnZVwiXSk7XG5cdFx0XHRcdG5hdmlnYXRvci52aWJyYXRlKDgwMCk7XG5cblx0XHRcdFx0dGFyZWZhc1tyZXNwb25zZVtcImRhdGFcIl1bXCJudW1lcm9cIl1dID0gcmVzcG9uc2VbXCJkYXRhXCJdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0VUkudG9hc3Qub3BlbigocmVzcG9uc2VbXCJtZXRhXCJdW1wibWVzc2FnZVwiXT8gcmVzcG9uc2VbXCJtZXRhXCJdW1wibWVzc2FnZVwiXSA6IFwiT2NvcnJldSB1bSBlcnJvLiBUZW50ZSBub3ZhbWVudGVcIikpO1xuXHRcdFx0fVxuXHRcdH0pLmZhaWwoZnVuY3Rpb24oKSB7XG5cdFx0XHR0b2FzdC5vcGVuKFwiT2NvcnJldSB1bSBlcnJvLiBUZW50ZSBub3ZhbWVudGVcIik7XG5cdFx0fSk7XG5cblx0fSkub24oXCJjbGlja1wiLCBcIi5iYWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHROZXdQb3N0LmNsb3NlKCk7XG5cdH0pO1xufSk7XG5cbnZhciBOZXdQb3N0ID0gYXBwLlBvc3Q7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBsb2dpbiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG52YXIgJGxvZ2luO1xuXG52YXIgbG9naW4gPSAoZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0Ly9cdGJhY2tkcm9wLnNob3coKTtcblx0XHRcdCRsb2dpbi5hZGRDbGFzcyhcImluXCIpLnJlZmxvdygpLmFkZENsYXNzKFwic2xpZGVcIik7XG5cdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwibm8tc2Nyb2xsXCIpO1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHsgJChcImlucHV0W25hbWU9J2VtYWlsJ11cIiwgJGxvZ2luKS5mb2N1cygpOyB9LCAzMDApO1xuXHRcdH0sXG5cdFx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0XHQkdWlbXCJib2R5XCJdLnJlbW92ZUNsYXNzKFwibm8tc2Nyb2xsXCIpO1xuXHRcdFx0JGxvZ2luLnJlbW92ZUNsYXNzKFwic2xpZGVcIikub25lKFwidHJhbnNpdGlvbmVuZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0JGxvZ2luLnJlbW92ZUNsYXNzKFwiaW5cIik7XG5cdFx0XHR9KTtcblx0XHQvL1x0YmFja2Ryb3AuaGlkZSgpO1xuXHRcdH1cblx0fTtcbn0pKCk7XG5cbiQoZnVuY3Rpb24oKSB7XG5cdCRsb2dpbiA9ICQoXCIjbG9naW5cIik7XG5cdCQoXCIuanMtbG9naW4tdHJpZ2dlclwiLCAkdWlbXCJzaWRlbmF2XCJdKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRzaWRlbmF2LmNsb3NlKCk7XG5cdFx0bG9naW4uc2hvdygpO1xuXHR9KTtcblx0JGxvZ2luLm9uKFwiY2xpY2tcIiwgXCIuYmFja1wiLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0bG9naW4uaGlkZSgpO1xuXHR9KS5vbihcInN1Ym1pdFwiLCBcImZvcm1cIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0JC5nZXRKU09OKFwiaHR0cHM6Ly9hcGkubGFndWluaG8ub3JnL2xpc3RhL1wiICsgZWRpY2FvICsgXCIvYXV0aD9rZXk9XCIgKyBhcGlfa2V5ICsgXCImY2FsbGJhY2s9P1wiLCAkKFwiZm9ybVwiLCAkbG9naW4pLnNlcmlhbGl6ZSgpKS5kb25lKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRpZihyZXNwb25zZVtcIm1ldGFcIl1bXCJzdGF0dXNcIl0gPT09IDIwMCkge1xuXHRcdFx0XHR1c2VyID0gcmVzcG9uc2VbXCJ1c2VyXCJdO1xuXHRcdFx0XHR1c2VyW1wic2lnbmVkLWluXCJdID0gdHJ1ZTtcblx0XHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyXCIsIEpTT04uc3RyaW5naWZ5KHVzZXIpKTtcblxuXHRcdFx0XHQkdWlbXCJib2R5XCJdLmFkZENsYXNzKFwic2lnbmVkLWluIHVzZXItXCIgKyB1c2VyW1widHVybWFcIl0pO1xuXHRcdFx0XHRsb2dpbi5oaWRlKCk7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0VUkudG9hc3Quc2hvdyhcIk9sw6EgXCIgKyB1c2VyW1wibmFtZVwiXSArIFwiIVwiKTtcblx0XHRcdFx0fSwgNTAwKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdCQoXCIuZm9ybS1ncm91cFwiLCAkbG9naW4pLmFkZENsYXNzKFwiYW5pbWF0ZWQgc2hha2VcIik7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7ICQoXCIuZm9ybS1ncm91cFwiLCAkbG9naW4pLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWQgc2hha2VcIik7IH0sIDEwMDApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcblxuXHQkKFwiLmpzLWxvZ291dC10cmlnZ2VyXCIsICR1aVtcInNpZGVuYXZcIl0pLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdCR1aVtcImJvZHlcIl0ucmVtb3ZlQ2xhc3MoXCJzaWduZWQtaW4gdXNlci1cIiArIHVzZXJbXCJ0dXJtYVwiXSk7XG5cblx0XHR1c2VyID0ge1xuXHRcdFx0XCJpZFwiOiBudWxsLFxuXHRcdFx0XCJuYW1lXCI6IG51bGwsXG5cdFx0XHRcImVtYWlsXCI6IG51bGwsXG5cdFx0XHRcInRva2VuXCI6IG51bGwsXG5cdFx0XHRcInR1cm1hXCI6IG51bGwsXG5cdFx0XHRcInNpZ25lZC1pblwiOiBmYWxzZVxuXHRcdH07XG5cdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyXCIsIEpTT04uc3RyaW5naWZ5KHVzZXIpKTtcblxuXHRcdHNpZGVuYXYuY2xvc2UoKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0VUkudG9hc3Quc2hvdyhcIlNlc3PDo28gZW5jZXJyYWRhIVwiKTtcblx0XHR9LCA1MDApO1xuXHR9KTtcbn0pO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbnZhciB1c2VyID0ge1xuXHRcImlkXCI6IG51bGwsXG5cdFwibmFtZVwiOiBudWxsLFxuXHRcImVtYWlsXCI6IG51bGwsXG5cdFwidG9rZW5cIjogbnVsbCxcblx0XCJ0dXJtYVwiOiBudWxsLFxuXHRcInNpZ25lZC1pblwiOiBmYWxzZVxufTtcblxuaWYgKGxvY2FsU3RvcmFnZSAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJcIikpIHtcblx0dXNlciA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VyXCIpKTtcblxuXHQkKGZ1bmN0aW9uKCkge1xuXHRcdGlmICh1c2VyW1wiaWRcIl0gIT09IG51bGwpIHtcblx0XHRcdCR1aVtcImJvZHlcIl0uYWRkQ2xhc3MoXCJzaWduZWQtaW4gdXNlci1cIiArIHVzZXJbXCJ0dXJtYVwiXSk7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRVSS50b2FzdC5zaG93KFwiT2zDoSBcIiArIHVzZXJbXCJuYW1lXCJdICsgXCIhXCIpO1xuXHRcdFx0fSwgMzAwMCk7XG5cdFx0fVxuXHR9KTtcbn1cbiIsIi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIGltYWdlIHVwbG9hZCAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbnZhciBleGlmX29yaWVudGF0aW9uX3RvX2RlZ3JlZXMgPSB7IDA6IDAsIDE6IDAsIDI6IDAsIDM6IDE4MCwgNDogMCwgNTogMCwgNjogOTAsIDc6IDAsIDg6IDI3MCB9O1xudmFyIGZpbGVfc3RhY2sgPSB7fTtcblxuZnVuY3Rpb24gdXBsb2FkKGZpbGVzKSB7XG5cdEZpbGVBUEkuZmlsdGVyRmlsZXMoZmlsZXMsIGZ1bmN0aW9uKGZpbGUsIGluZm8pIHtcblx0XHRpZigvXmltYWdlLy50ZXN0KGZpbGUudHlwZSkpIHtcblx0XHRcdGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dID0gaW5mbztcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdC8vXHRyZXR1cm4gaW5mby53aWR0aCA+PSAzMjAgJiYgaW5mby5oZWlnaHQgPj0gMjQwO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sIGZ1bmN0aW9uKGZpbGVzLCByZWplY3RlZCkge1xuXHRcdGlmKGZpbGVzLmxlbmd0aCkge1xuXHRcdFx0JChcIi5zdWJtaXRcIiwgJHBvc3QpLmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XG5cblx0XHRcdC8vIHByZXZpZXdcblx0XHRcdEZpbGVBUEkuZWFjaChmaWxlcywgZnVuY3Rpb24oZmlsZSkge1xuXHRcdFx0XHR2YXIgZXhpZl9vcmllbnRhdGlvbiA9IGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wiZXhpZlwiXVtcIk9yaWVudGF0aW9uXCJdO1xuXHRcdFx0XHRmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXSA9IHRhcmVmYV9hY3RpdmUgKyBcIi1cIiArIHVzZXJbXCJpZFwiXSArIFwiLVwiICtcblx0XHRcdFx0XHRtb21lbnQoKS5mb3JtYXQoXCJYXCIpICsgXCItXCIgKyByYW5kKDAsIDk5OSkudG9GaXhlZCgwKTtcblxuXHRcdFx0XHRpZihmaWxlW1widHlwZVwiXSA9PSBcImltYWdlL2dpZlwiKSB7XG5cdFx0XHRcdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0XHRcdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0XHR2YXIgaW1nID0gJChcIjxpbWcgLz5cIikuYXR0cihcInNyY1wiLCBldmVudC50YXJnZXQucmVzdWx0KTtcblx0XHRcdFx0XHRcdHZhciAkdHJhY2tlciA9ICQoXCI8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJpbWFnZS1vcmRlcltdXFxcIiAvPlwiKS52YWwoZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0pO1xuXG5cdFx0XHRcdFx0XHR2YXIgJHN0YXR1cyA9ICQoXCI8ZGl2IC8+XCIpLmFkZENsYXNzKFwicHJvZ3Jlc3NcIik7XG5cdFx0XHRcdFx0XHQkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcInN0YXR1c1wiKS5odG1sKFwiPHN0cm9uZz5FbnZpYW5kbyZoZWxsaXA7PC9zdHJvbmc+XCIpLmFwcGVuZFRvKCRzdGF0dXMpO1xuXHRcdFx0XHRcdFx0JChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoXCJiYXJcIikuYXBwZW5kVG8oJHN0YXR1cyk7XG5cblx0XHRcdFx0XHRcdHZhciAkcHJldmlldyA9ICQoXCI8bGkgLz5cIikuYXR0cihcImlkXCIsIFwiZmlsZS1cIiArXG5cdFx0XHRcdFx0XHRcdFx0ZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0pLmFwcGVuZCgkdHJhY2tlcikuYXBwZW5kKCRzdGF0dXMpLmFwcGVuZChpbWcpO1xuXHRcdFx0XHRcdFx0JChcIiNkcm9wem9uZSAjYm9hcmRcIikuYXBwZW5kKCRwcmV2aWV3KTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdEZpbGVBUElcblx0XHRcdFx0XHRcdC5JbWFnZShmaWxlKVxuXHRcdFx0XHRcdFx0LnJvdGF0ZShleGlmX29yaWVudGF0aW9uX3RvX2RlZ3JlZXNbZXhpZl9vcmllbnRhdGlvbl0pXG5cdFx0XHRcdFx0XHQucmVzaXplKDYwMCwgMzAwLCBcInByZXZpZXdcIilcblx0XHRcdFx0XHRcdC5nZXQoZnVuY3Rpb24oZXJyLCBpbWcpIHtcblx0XHRcdFx0XHRcdC8vXHQkdHJhY2tlciA9ICQoXCI8aW5wdXQgdHlwZT1cXFwiaGlkZGVuXFxcIiBuYW1lPVxcXCJpbWFnZS1vcmRlcltdXFxcIiAvPlwiKVxuXHRcdFx0XHRcdFx0Ly9cdFx0LnZhbCh0YXJlZmFfYWN0aXZlICsgXCItXCIgKyB1c2VyW1wiaWRcIl0gKyBcIi1cIiArIGZpbGVbXCJuYW1lXCJdKTtcblx0XHRcdFx0XHRcdFx0dmFyICR0cmFja2VyID0gJChcIjxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIG5hbWU9XFxcImltYWdlLW9yZGVyW11cXFwiIC8+XCIpLnZhbChmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXSk7XG5cblx0XHRcdFx0XHRcdFx0dmFyICRzdGF0dXMgPSAkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcInByb2dyZXNzXCIpO1xuXHRcdFx0XHRcdFx0XHQkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcInN0YXR1c1wiKS5odG1sKFwiPHN0cm9uZz5FbnZpYW5kbyZoZWxsaXA7PC9zdHJvbmc+XCIpLmFwcGVuZFRvKCRzdGF0dXMpO1xuXHRcdFx0XHRcdFx0XHQkKFwiPGRpdiAvPlwiKS5hZGRDbGFzcyhcImJhclwiKS5hcHBlbmRUbygkc3RhdHVzKTtcblxuXHRcdFx0XHRcdFx0XHR2YXIgJHByZXZpZXcgPSAkKFwiPGxpIC8+XCIpLmF0dHIoXCJpZFwiLCBcImZpbGUtXCIgK1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl0pLmFwcGVuZCgkdHJhY2tlcikuYXBwZW5kKCRzdGF0dXMpLmFwcGVuZChpbWcpO1xuXHRcdFx0XHRcdFx0XHQkKFwiI2Ryb3B6b25lICNib2FyZFwiKS5hcHBlbmQoJHByZXZpZXcpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyB1cGxvYWRcblx0XHRcdGlmKGZpbGVzWzBdW1widHlwZVwiXSA9PSBcImltYWdlL2dpZlwiKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiZ2lmXCIpO1xuXHRcdFx0XHRGaWxlQVBJLnVwbG9hZCh7XG5cdFx0XHRcdFx0dXJsOiBcIi8tL2xpc3RhL25vdm9cIixcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb246IFwidXBsb2FkXCIsXG5cdFx0XHRcdFx0XHRlZGl0aW9uOiBMaXN0YS5SZWd1bGFtZW50b1tcInRpdHVsb1wiXSxcblx0XHRcdFx0XHRcdHRhcmVmYTogdGFyZWZhX2FjdGl2ZSxcblx0XHRcdFx0XHRcdHR1cm1hOiB1c2VyW1widHVybWFcIl0sXG5cdFx0XHRcdFx0XHR1c2VyOiB1c2VyW1wiaWRcIl1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByZXBhcmU6IGZ1bmN0aW9uKGZpbGUsIG9wdGlvbnMpIHtcblx0XHRcdFx0XHRcdG9wdGlvbnMuZGF0YS5yZWYgPSBmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXTtcblx0XHRcdFx0XHRcdGZpbGUucmVmID0gZmlsZV9zdGFja1tmaWxlW1wibmFtZVwiXV1bXCJyZWZcIl07XG5cdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdGZpbGVzOiBmaWxlcyxcblx0XHRcdFx0XHRmaWxlcHJvZ3Jlc3M6IGZ1bmN0aW9uKGV2ZW50LCBmaWxlLCB4aHIpIHtcblx0XHRcdFx0XHRcdHZhciBwZXJjZW50ID0gKChldmVudFtcImxvYWRlZFwiXSAvIGV2ZW50W1widG90YWxcIl0pICogMTAwKS50b0ZpeGVkKDApLFxuXHRcdFx0XHRcdFx0XHRzdGF0dXMgPSAocGVyY2VudCA8IDEwMD8gXCI8c3Ryb25nPkVudmlhbmRvJmhlbGxpcDs8L3N0cm9uZz4gXCIgK1xuXHRcdFx0XHRcdFx0XHRcdFx0cGVyY2VudCArIFwiJVwiIDogXCI8c3Ryb25nPlByb2Nlc3NhbmRvJmhlbGxpcDs8L3N0cm9uZz5cIik7XG5cblx0XHRcdFx0XHRcdCQoXCIjZmlsZS1cIiArIGZpbGVbXCJyZWZcIl0gKyBcIiAuc3RhdHVzXCIsIFwiI2Ryb3B6b25lXCIpLmh0bWwoc3RhdHVzKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByb2dyZXNzOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdC8vXHR2YXIgcGVyY2VudCA9ICgoZXZlbnRbXCJsb2FkZWRcIl0gLyBldmVudFtcInRvdGFsXCJdKSAqIDEwMCkudG9GaXhlZCgwKSArIFwiJVwiXG5cdFx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKHBlcmNlbnQpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZmlsZWNvbXBsZXRlOiBmdW5jdGlvbihmaWxlLCB4aHIsIG9wdGlvbnMpIHtcblx0XHRcdFx0XHQvL1x0Y29uc29sZS5sb2coZmlsZSwgeGhyLCBvcHRpb25zKTtcblx0XHRcdFx0XHRcdCQoXCIjZmlsZS1cIiArIG9wdGlvbnNbXCJyZWZcIl0gKyBcIiAuc3RhdHVzXCIsIFwiI2Ryb3B6b25lXCIpLmh0bWwoXCI8aSBjbGFzcz1cXFwibWF0ZXJpYWwtaWNvbnNcXFwiPmNoZWNrPC9pPlwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbihlcnIsIHhocikge1xuXHRcdFx0XHRcdFx0JChcIi5zdWJtaXRcIiwgJHBvc3QpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdEZpbGVBUEkudXBsb2FkKHtcblx0XHRcdFx0XHR1cmw6IFwiLy0vbGlzdGEvbm92b1wiLFxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdGFjdGlvbjogXCJ1cGxvYWRcIixcblx0XHRcdFx0XHRcdGVkaXRpb246IExpc3RhLlJlZ3VsYW1lbnRvW1widGl0dWxvXCJdLFxuXHRcdFx0XHRcdFx0dGFyZWZhOiB0YXJlZmFfYWN0aXZlLFxuXHRcdFx0XHRcdFx0dHVybWE6IHVzZXJbXCJ0dXJtYVwiXSxcblx0XHRcdFx0XHRcdHVzZXI6IHVzZXJbXCJpZFwiXVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cHJlcGFyZTogZnVuY3Rpb24oZmlsZSwgb3B0aW9ucykge1xuXHRcdFx0XHRcdFx0b3B0aW9ucy5kYXRhLnJlZiA9IGZpbGVfc3RhY2tbZmlsZVtcIm5hbWVcIl1dW1wicmVmXCJdO1xuXHRcdFx0XHRcdFx0ZmlsZS5yZWYgPSBmaWxlX3N0YWNrW2ZpbGVbXCJuYW1lXCJdXVtcInJlZlwiXTtcblx0XHRcdFx0XHR9LFxuXG5cdFx0XHRcdFx0aW1hZ2VBdXRvT3JpZW50YXRpb246IHRydWUsXG5cdFx0XHRcdFx0aW1hZ2VUcmFuc2Zvcm06IHtcblx0XHRcdFx0XHRcdG1heFdpZHRoOiAxOTIwLFxuXHRcdFx0XHRcdFx0bWF4SGVpZ2h0OiAxOTIwXG5cdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdGZpbGVzOiBmaWxlcyxcblx0XHRcdFx0XHRmaWxlcHJvZ3Jlc3M6IGZ1bmN0aW9uKGV2ZW50LCBmaWxlLCB4aHIpIHtcblx0XHRcdFx0XHRcdHZhciBwZXJjZW50ID0gKChldmVudFtcImxvYWRlZFwiXSAvIGV2ZW50W1widG90YWxcIl0pICogMTAwKS50b0ZpeGVkKDApLFxuXHRcdFx0XHRcdFx0XHRzdGF0dXMgPSAocGVyY2VudCA8IDEwMD8gXCI8c3Ryb25nPkVudmlhbmRvJmhlbGxpcDs8L3N0cm9uZz4gXCIgK1xuXHRcdFx0XHRcdFx0XHRcdFx0cGVyY2VudCArIFwiJVwiIDogXCI8c3Ryb25nPlByb2Nlc3NhbmRvJmhlbGxpcDs8L3N0cm9uZz5cIik7XG5cblx0XHRcdFx0XHRcdCQoXCIjZmlsZS1cIiArIGZpbGVbXCJyZWZcIl0gKyBcIiAuc3RhdHVzXCIsIFwiI2Ryb3B6b25lXCIpLmh0bWwoc3RhdHVzKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByb2dyZXNzOiBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdC8vXHR2YXIgcGVyY2VudCA9ICgoZXZlbnRbXCJsb2FkZWRcIl0gLyBldmVudFtcInRvdGFsXCJdKSAqIDEwMCkudG9GaXhlZCgwKSArIFwiJVwiXG5cdFx0XHRcdFx0Ly9cdGNvbnNvbGUubG9nKHBlcmNlbnQpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZmlsZWNvbXBsZXRlOiBmdW5jdGlvbihmaWxlLCB4aHIsIG9wdGlvbnMpIHtcblx0XHRcdFx0XHQvL1x0Y29uc29sZS5sb2coZmlsZSwgeGhyLCBvcHRpb25zKTtcblx0XHRcdFx0XHRcdCQoXCIjZmlsZS1cIiArIG9wdGlvbnNbXCJyZWZcIl0gKyBcIiAuc3RhdHVzXCIsIFwiI2Ryb3B6b25lXCIpLmh0bWwoXCI8aSBjbGFzcz1cXFwibWF0ZXJpYWwtaWNvbnNcXFwiPmNoZWNrPC9pPlwiKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGNvbXBsZXRlOiBmdW5jdGlvbihlcnIsIHhocikge1xuXHRcdFx0XHRcdFx0JChcIi5zdWJtaXRcIiwgJHBvc3QpLnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuXG4kLmZuLmRyb3B6b25lID0gZnVuY3Rpb24oKSB7XG5cdC8vIGRyb3B6b25lXG5cdHZhciAkZHJvcHpvbmUgPSAkKFwiI2Ryb3B6b25lXCIsIHRoaXMpO1xuXHRGaWxlQVBJLmV2ZW50LmRuZCgkZHJvcHpvbmVbMF0sIGZ1bmN0aW9uKG92ZXIpIHtcblx0XHRpZihvdmVyKSB7XG5cdFx0XHQkZHJvcHpvbmUuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRkcm9wem9uZS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcblx0XHR9XG5cdH0sIGZ1bmN0aW9uKGZpbGVzKSB7XG5cdFx0dXBsb2FkKGZpbGVzKTtcblx0fSk7XG5cblx0Ly8gbWFudWFsIHNlbGVjdFxuXHR2YXIgJGZpbGVfaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZvcm0tZmlsZVwiKTtcblx0RmlsZUFQSS5ldmVudC5vbigkZmlsZV9pbnB1dCwgXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgZmlsZXMgPSBGaWxlQVBJLmdldEZpbGVzKGV2ZW50KTtcblx0XHR1cGxvYWQoZmlsZXMpO1xuXHR9KTtcblxuXHQvLyByZW9yZGVyXG5cdHZhciAkYm9hcmQgPSAkKFwiI2JvYXJkXCIsIHRoaXMpO1xuXHQkYm9hcmQub24oXCJzbGlwOmJlZm9yZXdhaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZih1aVtcImludGVyYWN0aW9uLXR5cGVcIl0gPT09IFwicG9pbnRlclwiKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblx0fSkub24oXCJzbGlwOmFmdGVyc3dpcGVcIiwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRldmVudC50YXJnZXQucmVtb3ZlKCk7XG5cdH0pLm9uKFwic2xpcDpyZW9yZGVyXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0ZXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuXHRcdGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShldmVudC50YXJnZXQsIGV2ZW50LmRldGFpbC5pbnNlcnRCZWZvcmUpO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG5cblx0bmV3IFNsaXAoJGJvYXJkWzBdKTtcbn07XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyB3b3JrZXJzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8vIHN0YXJ0XG53b3JrZXIuU3RhcnQgPSAoZnVuY3Rpb24oKSB7XG5cdHRpbWVvdXRbXCJkZWxheS1zdGFydFwiXSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0bG9nKFwid29ya2VyLlN0YXJ0XCIsIFwiaW5mb1wiKTtcblxuXHRcdGN1ZVtcImxvYWQtZWRpY2FvXCJdID0gJC5EZWZlcnJlZCgpO1xuXHRcdHdvcmtlci5Mb2FkKCk7XG5cblx0XHRjdWVbXCJsb2FkLWVkaWNhb1wiXS5kb25lKGZ1bmN0aW9uKCkge1xuXHRcdFx0dGltZW91dFtcImRlbGF5LWV2b2x1Y2FvXCJdID0gc2V0VGltZW91dChhcHAuRXZvbHVjYW8uc3RhcnQsIDIwMCk7XG5cdFx0fSk7XG5cblx0fSwgMzAwKTtcbn0pKCk7XG5cblxuLy8gbG9hZFxud29ya2VyLkxvYWQgPSAoZnVuY3Rpb24oKSB7XG5cdHRpbWVvdXRbXCJkZWxheS1sb2FkXCJdID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRsb2coXCJ3b3JrZXIuTG9hZFwiLCBcImluZm9cIik7XG5cblx0XHRMaXN0YUFQSShcIi90dWRvXCIpLmRvbmUoZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdGxvZyhcImN1ZVtcXFwibG9hZC1lZGljYW9cXFwiXSB0cmlnZ2VyZWRcIik7XG5cdFx0XHRMaXN0YS5FZGljYW8gPSByZXNwb25zZVtcImVkaWNhb1wiXTtcblx0XHRcdExpc3RhLlBsYWNhciA9IHJlc3BvbnNlW1wicGxhY2FyXCJdO1xuXHRcdFx0TGlzdGEuVGFyZWZhcyA9IHJlc3BvbnNlW1widGFyZWZhc1wiXTtcblx0XHRcdGN1ZVtcImxvYWQtZWRpY2FvXCJdLnJlc29sdmUoKTtcblxuXHRcdFx0dGltZW91dFtcImRlbGF5LWxpc3RhXCJdID0gc2V0VGltZW91dChhcHAuTGlzdGEuc3RhcnQsIDEpO1xuXHRcdFx0Ly8gdGltZW91dFtcImRlbGF5LXBsYWNhclwiXSA9IHNldFRpbWVvdXQoYXBwLlBsYWNhci5zdGFydCwgNDAwKTtcblxuXHRcdFx0Ly8gdmFyIGRhdGEgPSByZXNwb25zZVtcImRhdGFcIl07XG5cdFx0XHQvLyBMaXN0YS5JZGVudGlmaWNhY2FvID0gZGF0YTtcblxuXHRcdH0pO1xuXG5cdFx0d29ya2VyLlVwZGF0ZSgpO1xuXHR9LCAzMDApO1xufSk7XG5cblxuLy8gdXBkYXRlXG53b3JrZXIuVXBkYXRlID0gKGZ1bmN0aW9uKCkge1xuXHRsZXQgdXBkYXRlcyA9IHtcblx0XHRcInRhcmVmYXNcIjogMCxcblx0XHRcInBvc3RzXCI6IDAsXG5cdFx0XCJ0b3RhbFwiOiAwLFxuXHRcdFwibGFzdC11cGRhdGVkXCI6IG51bGxcblx0fTtcblxuXHR0aW1lb3V0W1wiYXRpdmlkYWRlXCJdID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0bG9nKFwid29ya2VyLlVwZGF0ZVwiLCBcImluZm9cIik7XG5cblx0XHRMaXN0YUFQSShcIi9hdGl2aWRhZGVcIikuZG9uZShmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0Ly8gY29uZmVyZSBkYXRhIGRlIGNhZGEgYXRpdmlkYWRlIGUgdsOqIHNlIMOpIHBvc3RlcmlvciDDoCDDumx0aW1hIGF0dWFsaXphw6fDo28uXG5cdFx0XHQvLyBzZSBmb3IsIGFkaWNpb25hIMOgIGNvbnRhZ2VtIGRlIG5vdmEgYXRpdmlkYWRlXG5cdFx0XHRmb3IgKGxldCBhdGl2aWRhZGUgb2YgcmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKG1vbWVudChhdGl2aWRhZGVbXCJ0c1wiXSkuaXNBZnRlcih1cGRhdGVzW1wibGFzdC11cGRhdGVkXCJdKSAmJiBhdGl2aWRhZGVbXCJhdXRvclwiXSAhPSB1c2VyW1wiaWRcIl0pIHtcblx0XHRcdFx0XHR1cGRhdGVzW1widG90YWxcIl0rKztcblx0XHRcdFx0XHRpZiAodmFsdWVbXCJhY2FvXCJdID09PSBcIm5vdm8tdGFyZWZhXCIpIHtcblx0XHRcdFx0XHRcdHVwZGF0ZXNbXCJ0YXJlZmFzXCJdKys7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICh2YWx1ZVtcImFjYW9cIl0gPT09IFwibm92by1wb3N0XCIpIHtcblx0XHRcdFx0XHRcdHVwZGF0ZXNbXCJwb3N0c1wiXSsrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBzZSBob3V2ZXIgbm92YSBhdGl2aWRhZGVcblx0XHRcdGlmICh1cGRhdGVzW1widG90YWxcIl0gPiAwKSB7XG5cdFx0XHRcdC8vIG1vbnRhIG8gdGV4dG8gZG8gdG9hc3Rcblx0XHRcdFx0bGV0IHRleHRvID0ge1xuXHRcdFx0XHRcdFwidGFyZWZhc1wiOiB1cGRhdGVzW1widGFyZWZhc1wiXSArIFwiIFwiICsgKHVwZGF0ZXNbXCJ0YXJlZmFzXCJdID4gMT8gXCJub3ZhcyB0YXJlZmFzXCIgOiBcIm5vdmEgdGFyZWZhXCIpLFxuXHRcdFx0XHRcdFwicG9zdHNcIjogdXBkYXRlc1tcInBvc3RzXCJdICsgXCIgXCIgKyAodXBkYXRlc1tcInBvc3RzXCJdID4gMT8gXCJub3ZvcyBwb3N0c1wiIDogXCJub3ZvIHBvc3RcIiksXG5cdFx0XHRcdFx0XCJmaW5hbFwiOiBcIlwiXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0aWYgKHVwZGF0ZXNbXCJ0YXJlZmFzXCJdID4gMCkge1xuXHRcdFx0XHRcdHRleHRvW1wiZmluYWxcIl0gKz0gdGV4dG9bXCJ0YXJlZmFzXCJdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICgodXBkYXRlc1tcInRhcmVmYXNcIl0gPiAwKSAmJiAodXBkYXRlc1tcInBvc3RzXCJdID4gMCkpIHtcblx0XHRcdFx0XHR0ZXh0b1tcImZpbmFsXCJdICs9IFwiIGUgXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHVwZGF0ZXNbXCJwb3N0c1wiXSA+IDApIHtcblx0XHRcdFx0XHR0ZXh0b1tcImZpbmFsXCJdICs9IHRleHRvW1wicG9zdHNcIl07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRVSS50b2FzdC5zaG93KHtcblx0XHRcdFx0XHRcInBlcnNpc3RlbnRcIjogdHJ1ZSxcblx0XHRcdFx0XHRcIm1lc3NhZ2VcIjogdGV4dG9bXCJmaW5hbFwiXSxcblx0XHRcdFx0XHRcImxhYmVsXCI6IFwiQXR1YWxpemFyXCIsXG5cdFx0XHRcdFx0XCJhY3Rpb25cIjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR3b3JrZXIuTG9hZCgpO1xuXHRcdFx0XHRcdFx0dXBkYXRlc1tcInRhcmVmYXNcIl0gPSAwO1xuXHRcdFx0XHRcdFx0dXBkYXRlc1tcInBvc3RzXCJdID0gMDtcblx0XHRcdFx0XHRcdHVwZGF0ZXNbXCJ0b3RhbFwiXSA9IDA7XG5cdFx0XHRcdFx0XHQkdWlbXCJwYWdlLXRpdGxlXCJdLmh0bWwoVUkuZGF0YVtcInBhZ2UtdGl0bGVcIl0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gbW9zdHJhIG7Dum1lcm8gZGUgbm92YXMgYXRpdmlkYWRlcyBubyB0w610dWxvXG5cdFx0XHRcdCR1aVtcInRpdGxlXCJdLmh0bWwoXCIoXCIgKyB1cGRhdGVzW1widG90YWxcIl0gKyBcIikgXCIgKyBVSS5kYXRhW1wicGFnZS10aXRsZVwiXSk7XG5cdFx0XHR9XG5cblx0XHRcdHVwZGF0ZXNbXCJsYXN0LXVwZGF0ZWRcIl0gPSAocmVzcG9uc2VbMF0/IG1vbWVudChyZXNwb25zZVswXVtcInRzXCJdKSA6IG1vbWVudCgpKTtcblx0XHR9KTtcblx0fSwgMzAgKiAxMDAwKTtcbn0pO1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZm9udHMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5XZWJGb250LmxvYWQoe1xuXHR0aW1lb3V0OiAxMDAwMCxcblx0Z29vZ2xlOiB7XG5cdFx0ZmFtaWxpZXM6IFtcblx0XHRcdFwiTWF0ZXJpYWwgSWNvbnNcIixcblx0XHRcdFwiUm9ib3RvOjQwMCw0MDBpdGFsaWMsNTAwOmxhdGluXCIsXG5cdFx0XHRcIlJvYm90bytNb25vOjcwMDpsYXRpblwiLFxuXHRcdFx0XCJMYXRvOjQwMDpsYXRpblwiXG5cdFx0XVxuXHR9LFxuXHQvLyBjdXN0b206IHtcblx0Ly8gXHRmYW1pbGllczogW1xuXHQvLyBcdFx0XCJGb250QXdlc29tZVwiXG5cdC8vIFx0XSwgdXJsczogW1xuXHQvLyBcdFx0XCJodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy9mb250LWF3ZXNvbWUvNC42LjMvY3NzL2ZvbnQtYXdlc29tZS5taW4uY3NzXCJcblx0Ly8gXHRdXG5cdC8vIH0sXG5cdGFjdGl2ZTogZnVuY3Rpb24oKSB7XG5cdFx0JChmdW5jdGlvbigpIHtcblx0XHRcdGFwcC5MaXN0YS5sYXlvdXQoKTtcblx0XHR9KTtcblx0fVxufSk7XG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBtb21lbnRqcyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbm1vbWVudC5sb2NhbGUoXCJwdC1iclwiLCB7XG5cdFx0XCJtb250aHNcIjogXCJqYW5laXJvX2ZldmVyZWlyb19tYXLDp29fYWJyaWxfbWFpb19qdW5ob19qdWxob19hZ29zdG9fc2V0ZW1icm9fb3V0dWJyb19ub3ZlbWJyb19kZXplbWJyb1wiLnNwbGl0KFwiX1wiKSxcblx0XHRcIm1vbnRoc1Nob3J0XCI6IFwiamFuX2Zldl9tYXJfYWJyX21haV9qdW5fanVsX2Fnb19zZXRfb3V0X25vdl9kZXpcIi5zcGxpdChcIl9cIiksXG5cdFx0XCJ3ZWVrZGF5c1wiOiBcImRvbWluZ29fc2VndW5kYS1mZWlyYV90ZXLDp2EtZmVpcmFfcXVhcnRhLWZlaXJhX3F1aW50YS1mZWlyYV9zZXh0YS1mZWlyYV9zw6FiYWRvXCIuc3BsaXQoXCJfXCIpLFxuXHRcdFwid2Vla2RheXNTaG9ydFwiOiBcImRvbV9zZWdfdGVyX3F1YV9xdWlfc2V4X3PDoWJcIi5zcGxpdChcIl9cIiksXG5cdFx0XCJ3ZWVrZGF5c01pblwiOiBcImRvbV8ywqpfM8KqXzTCql81wqpfNsKqX3PDoWJcIi5zcGxpdChcIl9cIiksXG5cdFx0XCJsb25nRGF0ZUZvcm1hdFwiOiB7XG5cdFx0XHRcIkxUXCI6IFwiSEg6bW1cIixcblx0XHRcdFwiTFRTXCI6IFwiSEg6bW06c3NcIixcblx0XHRcdFwiTFwiOiBcIkREL01NL1lZWVlcIixcblx0XHRcdFwiTExcIjogXCJEIFtkZV0gTU1NTSBbZGVdIFlZWVlcIixcblx0XHRcdFwiTExMXCI6IFwiRCBbZGVdIE1NTU0gW2RlXSBZWVlZIFvDoHNdIEhIOm1tXCIsXG5cdFx0XHRcIkxMTExcIjogXCJkZGRkLCBEIFtkZV0gTU1NTSBbZGVdIFlZWVkgW8Ogc10gSEg6bW1cIlxuXHRcdH0sXG5cdFx0XCJjYWxlbmRhclwiOiB7XG5cdFx0XHRcInNhbWVEYXlcIjogXCJbaG9qZV0gTFRcIixcblx0XHRcdFwibmV4dERheVwiOiBcIlthbWFuaMOjXSBMVFwiLFxuXHRcdFx0XCJuZXh0V2Vla1wiOiBcImRkZGQgTFRcIixcblx0XHRcdFwibGFzdERheVwiOiBcIltvbnRlbV0gTFRcIixcblx0XHRcdFwibGFzdFdlZWtcIjogXCJkZGRkIExUXCIsXG5cdFx0XHRcInNhbWVFbHNlXCI6IFwiTFwiXG5cdFx0fSxcblx0XHRcInJlbGF0aXZlVGltZVwiOiB7XG5cdFx0XHRcImZ1dHVyZVwiOiBcImRhcXVpICVzXCIsXG5cdFx0XHRcInBhc3RcIjogXCIlcyBhdHLDoXNcIixcblx0XHRcdFwic1wiOiBcInBvdWNvcyBzZWd1bmRvc1wiLFxuXHRcdFx0XCJtXCI6IFwidW0gbWludXRvXCIsXG5cdFx0XHRcIm1tXCI6IFwiJWQgbWludXRvc1wiLFxuXHRcdFx0XCJoXCI6IFwidW1hIGhvcmFcIixcblx0XHRcdFwiaGhcIjogXCIlZCBob3Jhc1wiLFxuXHRcdFx0XCJkXCI6IFwidW0gZGlhXCIsXG5cdFx0XHRcImRkXCI6IFwiJWQgZGlhc1wiLFxuXHRcdFx0XCJNXCI6IFwidW0gbcOqc1wiLFxuXHRcdFx0XCJNTVwiOiBcIiVkIG1lc2VzXCIsXG5cdFx0XHRcInlcIjogXCJ1bSBhbm9cIixcblx0XHRcdFwieXlcIjogXCIlZCBhbm9zXCJcblx0XHR9LFxuXHRcdFwib3JkaW5hbFBhcnNlXCI6IC9cXGR7MSwyfcK6Lyxcblx0XHRcIm9yZGluYWxcIjogXCIlZMK6XCJcblx0fSk7XG4iXX0=
