////////////////////////////////////////////////////////////////////////////////////////////////////
// lista de tarefas ////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

let Lista = [ ];
Lista.Edicao = [ ];
Lista.Placar = [ ];
Lista.Tarefas = [ ];

let app = [ ];
var $app = [ ]; // TODO existe??

////////////////////////////////////////////////////////////////////////////////////////////////////

let cue = [ ];
let worker = [ ];
let timeout = [ ];

let logging = true;
let log = function(message, type) {
	if (logging) {
		if (!type) {
			console.log(message);
		} else {
			console[type](message);
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// daqui pra baixo não é pra ter nada!!

var ui = [ ];

Lista.Regulamento = [ ]; // TODO deprecated
// var edicao = "xciii";



// laguinho.org/tarefas
var tarefas = { };


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

var $templates = { };

$(function() {
	$("template").each(function() {
		var $this = $(this);
		var name = $this.attr("id");
		var html = $this.html();

		$templates[name] = $(html);
		$this.remove();
	});
});

function __render(template, data) {
	if (!$templates[template]) { return false; }
	var $render = $templates[template].clone();

	$render.data(data);

	$.fn.fillBlanks = function() {
		var $blank = $(this);
		var fill = $blank.data("fill");

		var rules = fill.split(",");
		for (var i = 0; i < rules.length; i++) {
			var pair = rules[i].split(":");
			var dest = (pair[1]? pair[0].trim() : "html");
			var source = (pair[1]? pair[1].trim() : pair[0]);
			var value = data[source];

			source = source.split("/");
			if (source.length > 1 && typeof value !== "undefined") {
				value = data[source[0]];

				for (var j = 1; j < source.length; j++) {
					value = (value[source[j]])? value[source[j]] : null;
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
				} else if(if_null === "remove") {
					$blank.remove();
				}
			}
		}

		$blank
			.removeClass("fill")
			.removeAttr("data-fill")
			.removeAttr("data-fill-null");
	};

	if ($render.hasClass("fill")) {
		$render.fillBlanks();
	}

	$(".fill", $render).each(function() {
		$(this).fillBlanks();
	});

	return $render;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// router //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var router = [ ];

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
router["go"] = function(path, object, title) {
	if (router["navigation-mode"] === "path") {
		history.pushState(object, title, path);
	} else {
		history.pushState(object, title, "#" + path);
		// location.hash = path;
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// build link
router["build-link"] = function(path) {
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
router["view-manager"] = (function() {
	return {
		add: function(view) {
			router["current-view"].push(view);
			// console.log(router["current-view"]);
		},
		remove: function(view) {
			router["current-view"] = $.grep(router["current-view"], function(value) {
				return value !== view;
			});
			// console.log(router["current-view"]);
		},
		replace: function(view) {
			router["current-view"] = [ ];
			router["view-manager"].add(view);
		}
	};
})();

////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener("popstate", function(event) {
	// console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));

	var state = event.state;

	if (state && state["view"] === "tarefa") {
		if (router["current-view"].indexOf("bottomsheet") > -1) { bottomsheet.close(); }
		if (router["current-view"].indexOf("new-post") > -1) { post.close(); }
		app.Tarefa.open(state["id"]);
	}

	else if (state && state["view"] === "new-post") {
		post.open(state["type"], state["id"]);
	}

	else if (state && state["view"] === "bottomsheet") {
		if (router["current-view"].indexOf("new-post") > -1) { post.close(); }
	}

//	if (state["view"] === "home") {
	else {
		if (router["current-view"].indexOf("bottomsheet") > -1) { bottomsheet.close(); }
		if (router["current-view"].indexOf("new-post") > -1) { post.close(); }
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
let UI = { }
let $ui = [ ];

UI.data = [ ];

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

$(function() {
	$ui["title"] = $("head title");
	UI.data["title"] = $ui["title"].html();

	$ui["theme-color"] = $("meta[name='theme-color']");
	UI.data["original-theme-color"] = $ui["theme-color"].attr("content");
});

// tipo de interação (touch ou pointer)
UI.data["interaction-type"] = ("ontouchstart" in window || navigator.msMaxTouchPoints)? "touch" : "pointer";


////////////////////////////////////////////////////////////////////////////////////////////////////
// reflow
$.fn.reflow = function() {
	var offset = $ui["body"].offset().left;
	return $(this);
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui / body ///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

UI.body = (function() {
	$(function() {
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
		lock: function() {
			$ui["body"].addClass("no-scroll");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// UI.body.unlock()
		unlock: function() {
			$ui["body"].removeClass("no-scroll");
		}
	};
})();

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui / loadbar ////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

UI.loadbar = (function() {
	$(function() {
		$ui["loadbar"] = $(".ui-loadbar");
	});

	return {
		show: function() {
			$ui["loadbar"].addClass("in");
		},
		hide: function() {
			timeout["hide-loadbar"] = setTimeout(function() {
				$ui["loadbar"]
					.removeClass("fade-in")
					.one("transitionend", function() {
						$ui["loadbar"].removeClass("in");
					});
			}, 800);
		}
	};
})();

////////////////////////////////////////////////////////////////////////////////////////////////////
// backdrop

$ui["backdrop"] = [ ];

UI.backdrop = (function() {
	return {
		show: function($screen, events) {
			var screen = $screen["selector"];
			var zindex = $screen.css("z-index") - 1;

			$ui["backdrop"][screen] = __render("backdrop");

			$.each(events, function(event, handler) {
				$ui["backdrop"][screen].on(event, handler)
			});

			$ui["backdrop"][screen].css("z-index", zindex)
				.on("click", function() { $(this).trigger("hide"); })
				.appendTo($ui["body"])
				.addClass("in");
		},
		hide: function($screen) {
			var screen = $screen["selector"];
			$ui["backdrop"][screen].removeClass("in").off("hide").remove();
		}
	};
})();

$(function() {
	// $ui["backdrop"] = $(".js-ui-backdrop");
	// $ui["backdrop"].on("click", function() {
	// 	$ui["backdrop"].trigger("hide");
	// });
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui sidenav //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

UI.sidenav = (function() {
	$(function() {
		$ui["sidenav"] = $(".js-ui-sidenav");

		$(".js-sidenav-trigger").on("click", function(event) {
			event.preventDefault();
			UI.sidenav.open();
		});
	});

	return {
		open: function() {
			UI.body.lock();
			UI.backdrop.show($ui["sidenav"], { "hide": UI.sidenav.close });
			$ui["sidenav"].addClass("in");
		},
		close: function() {
			$ui["sidenav"].removeClass("in");
			UI.backdrop.hide($ui["sidenav"]);
			UI.body.unlock();
		}
	};
})();

////////////////////////////////////////////////////////////////////////////////////////////////////
// bottomsheet
UI.bottomsheet = (function() {
	return {
		open: function($content, addClass) {
			UI.backdrop.show($ui["bottomsheet"], { "hide": UI.bottomsheet.close });
			$ui["bottomsheet"].html($content).addClass((addClass? addClass + " " : "") + "in").reflow().addClass("slide");

			theme_color["buffer"] = $theme_color.attr("content");
			$theme_color.attr("content", "#000");

			router["view-manager"].add("bottomsheet");
			history.pushState({ "view": "bottomsheet" }, null, null);
		},
		close: function() {
			$ui["bottomsheet"].removeClass("slide").one("transitionend", function() {
				$ui["bottomsheet"].removeClass("in").empty().attr("class", "ui-bottomsheet js-ui-bottomsheet");
			});

			$theme_color.attr("content", theme_color["buffer"]);

			UI.backdrop.hide($ui["bottomsheet"]);

			router["view-manager"].remove("bottomsheet");
		}
	};
})();

$(function() {
	$ui["bottomsheet"] = $(".js-ui-bottomsheet");
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// toast ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

UI.toast = (function() {
	return {
		// TODO nova sintaxe, usar template e __render
		show: function(config) {
			if (typeof config === "object") {
				$ui.toast["message"].html(config["message"]);
				$ui.toast["action"].html((config["action"]? config["action"] : ""));
				$ui.toast.addClass("in").reflow().addClass("slide");
				$ui["body"].addClass("toast-active");

				// TODO: .fab-bottom transform: translateY

				$ui.toast.on("click", UI.toast.dismiss);
				$ui.toast["action"].on("click", config["callback"]);

				clearTimeout(timeout["toast"]);

				if (!config["persistent"]) {
					$ui.toast.removeClass("stream-only");
					timeout["toast"] = setTimeout(UI.toast.dismiss, (config["timeout"]? config["timeout"] : 6000));
				} else {
					$ui.toast.addClass("stream-only");
				}
			} else {
				UI.toast.show({
					"message": config
				})
			}
		},

		dismiss: function() {
			$ui.toast.removeClass("slide").one("transitionend", function() {
				$ui["body"].removeClass("toast-active");
				$ui.toast.removeClass("in stream-only");

				$ui.toast["message"].empty();
				$ui.toast["action"].empty();
			});
			clearTimeout(timeout["toast"]);
		},

		// TODO DEPRECATED
		open: function(message, action, callback, persistent) {
		// open: function(message, addClass) {
			$ui.toast.message.html(message);
			$ui.toast.action.html((action? action : ""));
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
})();

var toast = UI.toast;
toast.close = UI.toast.dismiss;

// var snackbar = toast;

// jQuery
$ui.toast = [ ];

$(function() {
	$ui.toast = $(".js-ui-toast");
	$ui.toast["message"] = $(".toast-message", $ui.toast);
	$ui.toast["action"] = $(".toast-action", $ui.toast);
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// ui / utilities //////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// layout properties
UI.data["window"] = [ ];
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

$(function() { setLayoutProperties(); });
$ui["window"].on("resize", setLayoutProperties);


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// scroll
UI.data["scroll-position"] = [ ];

function setScrollPosition() {
	UI.data["scroll-position"]["top"] = $ui["window"].scrollTop();
	UI.data["scroll-position"]["bottom"] = UI.data["scroll-position"]["top"] + UI.data["window"]["height"];
}

$(function() { setScrollPosition(); });
$ui["window"].on("scroll resize", setScrollPosition);


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
// api /////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// TODO legacy
let api_key = "063c72b2afc5333f3b27b366bdac9eb81d64bc6a12cd7b3f4b6ade77a092b63a";

const ListaAPI = function(endpoint) {
	log("API Request: " + endpoint, "info");
	let api_url = "https://api.laguinho.org/lista/" + edicao;
	let api_key = "063c72b2afc5333f3b27b366bdac9eb81d64bc6a12cd7b3f4b6ade77a092b63a";

	let request = $.getJSON(api_url + endpoint + "?key=" + api_key + "&callback=?");
	return request;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// placar //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

app.Placar = (function() {
	$(function() {
		$ui["placar"] = $(".js-app-placar > ul");
	});

	return {
		update: function(turmas) {
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
			$.each(turmas, function(index, turma) {
				// calcula % da turma em relação ao total de pontos
				var percentual_da_turma = (total_de_pontos > 0? turma["pontos"] / maior_pontuacao : 0);

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
	}
})();

////////////////////////////////////////////////////////////////////////////////////////////////////
// app evolução ////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// app.Evolucao.start()
// app.Evolucao.update()

// TODO
// - mostrar contador nas últimas 48 horas
// - o que acontece depois do encerramento?
//   - barra fica da cor da turma e aparece mensagem em cima "EC1 campeã"

app.Evolucao = (function() {
	$(function() {
		$ui["evolucao"] = $(".app-evolucao");
	});

	return {
		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Evolucao.start()
		start: function() {
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
		update: function() {
			log("app.Evolucao.update", "info");

			// pega as datas e calcula o tempo (em minutos) e percentual transcorridos
			let agora = moment();
			let dia_inicial = Lista.Edicao["inicio"];
			let dia_final = Lista.Edicao["fim"];
			let duracao_total = Lista.Edicao["duracao-em-minutos"];

			let tempo_transcorrido = agora.diff(dia_inicial, "minutes");
			let percentual_transcorrido = (tempo_transcorrido < duracao_total ? tempo_transcorrido / duracao_total : 1);

			// define a largura da barra de evolução completa igual à largura da tela
			// depois, mostra apenas o percentual transcorrido
			$(".elapsed-time .bar", $ui["evolucao"]).css("width", UI.data["window"]["width"]);

			let largura_da_barra = (percentual_transcorrido * 100).toFixed(3);
			$(".elapsed-time", $ui["evolucao"]).css("width", largura_da_barra + "%");
		}
	}
})();

////////////////////////////////////////////////////////////////////////////////////////////////////
// lista ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// app.Lista.load()
// app.Lista.layout()
// app.Lista.sort()

app.Lista = (function() {
	return {
		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Lista.start()
		start: function() {
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
		load: function() {
			// mostra a tela de loading e limpa o stream
			$stream.loading.addClass("fade-in in");

			// carrega os dados da API
			$.getJSON("https://api.laguinho.org/lista/" + edicao + "/tudo?key=" + api_key + "&callback=?").done(function(data) {
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
				$.each(data["tarefas"], function(index, tarefa) {
					tarefas[tarefa["numero"]] = tarefa;
					tarefa["url"] = "/tarefas/" + tarefa["numero"];
					tarefa["url"] = router["build-link"]("/tarefas/" + tarefa["numero"]);

					if (tarefa["imagem"]) {
						tarefa["imagem-url"] = tarefa["imagem"]["url"];
						tarefa["imagem-aspecto"] = "padding-top: " + (tarefa["imagem"]["aspecto"] * 100).toFixed(2) + "%";
					}

					var $card = __render("card-tarefa", tarefa).data({
							"tarefa": tarefa["numero"],
							"last-modified": (tarefa["ultima-postagem"]? moment(tarefa["ultima-postagem"]).format("X") : 0)
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
						var max_media_to_show = (ui["columns"] < 2? 9 : 8);
						var shown_media_count = 0;

						var post_types_with_image_preview = ["imagem", "youtube", "vimeo", "vine", "gif"];
						var post_types_with_text_preview = ["texto"];

						for (var i = 0; i < total_posts; i++) {
							var post = tarefa["posts"][i];

							if ((post["midia"] || post["tipo"] == "texto") && (shown_media_count < max_media_to_show)) {
								shown_media_count++;

								var tile_type;
								var media = { };

								// imagem
								if (post_types_with_image_preview.indexOf(post["tipo"]) > -1) {
									tile_type = "tile-image";

									media["count"] = shown_media_count;

									if (post["tipo"] == "youtube" || post["tipo"] == "vimeo" || post["tipo"] == "vine" || post["tipo"] == "gif") {
										media["preview"] = "background-image: url('" + post["midia"][0]["thumbnail"] + "');";
										media["modifier"] = "video";
									} else if (post["midia"] && post["midia"][0]) {
										media["preview"] = "background-image: url('" + post["midia"][0]["caminho"] +
											post["midia"][0]["arquivos"][0] + "');";
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

								if ((shown_media_count === max_media_to_show) && ((total_posts - shown_media_count) > 0)) {
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
				app.Lista.sort((Lista.Regulamento["encerrada"]? "tarefa": "date"));

				// se tiver tarefa especificada no load da página, carrega ela
				if (router["path"][2]) {
					app.Tarefa.open(router["path"][2]);
				}

				// esconde a tela de loading
				setTimeout(function() {
					$stream.loading
						.removeClass("fade-in")
						.one("transitionend", function() { $stream.loading.removeClass("in");
					});
				}, 1200);

				// guarda a data da última atualização e zera o contador de novidades
				last_updated = moment(data["edicao"]["ultima-atualizacao"]);
				updated["tarefas"] = 0; updated["posts"] = 0;
			});
		},

		layout: function() {
			$stream.isotope("reloadItems");
			$stream.isotope("layout");
		},

		sort: function(criteria) {
			$stream.isotope({
				"sortBy": criteria
			});
		}
	};
})();

// jQuery
var $stream;

$(function() {
	$stream = $(".js-app-lista");
	// $stream.loading = $("main .loading");

	$stream.isotope({
		"itemSelector": ".card-tarefa",
		"transitionDuration": ".8s",
		"getSortData": {
			"date": ".last-modified",
			"tarefa": function(element) {
				return parseInt($(element).data("tarefa"), 10);
			}
		},
		"sortAscending": {
			"date": false,
			"tarefa": true
		},
		"sortBy": ["date", "tarefa"],
		"masonry": {
			"gutter": (ui["columns"] === 1? 8 : 16)
		}
	});

	$stream.on("click", ".card-tarefa:not(.fantasma)", function(event) {
		if (event.which === 1) {
			event.preventDefault();

			var numero = $(this).data("tarefa");
			app.Tarefa.open(numero, true);
		}
	});

	// app.Lista.load();

	// ordenação
	$ui["sidenav"].on("click", ".js-stream-sort a", function(event) {
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

app.Tarefa = (function() {
	var placar_da_tarefa = [ ];

	function renderPosts(posts, $posts) {
		placar_da_tarefa["total"] = 0;
		for (var turma in Lista.Regulamento["turmas"]) {
			placar_da_tarefa[Lista.Regulamento["turmas"][turma]] = 0;
		}

		$.each(posts, function(index, post) {
			post["data-de-postagem-formatada"] = moment(post["data-de-postagem"]).calendar();
			post["turma-formatada"] = post["turma"].toUpperCase();

			// avaliação
			if (post["avaliacao"]) {
				if (post["avaliacao"]["status"] === 200) {
					post["status-class"] = post["turma"];
					post["status-icon"] = "<i class=\"material-icons\">&#xE87D;</i>"; // coração
					post["status"] = post["avaliacao"]["pontos"] + " ponto" + (post["avaliacao"]["pontos"] > 1? "s": "");
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
			if (post["legenda"] && post["legenda"].substring(0,3) != "<p>") {
				post["legenda"] = "<p>" + post["legenda"].replace(/(?:\r\n\r\n|\r\r|\n\n)/g, "</p><p>") + "</p>";
			}

			// renderiza o post
			var $post_card = __render("view-tarefa-post-card", post);
			var $media = $(".post-media > ul", $post_card);

			// adiciona mídias
			if (post["midia"]) {
				$.each(post["midia"], function(index, media) {
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
						} else

						if (post["tipo"] == "vimeo") {
							media["embed"] = "https://player.vimeo.com/video/" + media["vimeo-id"] + "?title=0&byline=0&portrait=0";
						} else

						if (post["tipo"] == "vine") {
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
		open: function(numero, pushState) {
			var tarefa = tarefas[numero];
			tarefa_active = numero;

			if (UI.data["columns"] >= 3) {
				// UI.backdrop.show($app["tarefa"], { "hide": app.Tarefa.close });
				// $ui["backdrop"][$app["tarefa"]].on("hide", app.Tarefa.close);
			}

			$app["tarefa"].addClass("in");
			app.Tarefa.render(tarefa);

			$app["tarefa"].reflow().addClass("slide-x").one("transitionend", function() {
			//	var view_theme_color = $(".appbar", $app["tarefa"]).css("background-color");
				$("head meta[name='theme-color']").attr("content", "#546e7a");
			});

			$ui["body"].addClass("no-scroll tarefa-active");

			// router
			router["view-manager"].replace("tarefa");
			if (pushState) { router.go("/tarefas/" + tarefa["numero"], { "view": "tarefa", "id": tarefa["numero"] }, tarefa["titulo"]); }
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Tarefa.render() /////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////
		render: function(tarefa) {
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
						"gutter": (ui["columns"] === 1? 8 : 24),
					//	"columnWidth": (ui["columns"] < 1? 300 : 450)
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

			$.each(Lista.Regulamento["turmas"], function(index, turma) {
				var pontuacao_da_turma = [ ];

				// calcula % da turma em relação ao total de pontos
				var percentual_da_turma = (placar_da_tarefa["total"] > 0? placar_da_tarefa[turma] / placar_da_tarefa["total"] : 0);
				pontuacao_da_turma["turma"] = turma;
				pontuacao_da_turma["altura-da-barra"] = "height: " + (percentual_da_turma * 100).toFixed(3) + "%";
				pontuacao_da_turma["turma-formatada"] = turma.toUpperCase();
				pontuacao_da_turma["pontos"] = (placar_da_tarefa[turma] > 0? placar_da_tarefa[turma] : 0);
				pontuacao_da_turma["pontuacao-formatada"] = pontuacao_da_turma["pontos"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

				var $turma = __render("placar-turma", pontuacao_da_turma);
				$placar_da_tarefa.append($turma);
			});
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Tarefa.close()
		close: function(pushState) {
			tarefa_active = null;
			$("head meta[name='theme-color']").attr("content", theme_color["original"]);

			$ui["body"].removeClass("no-scroll tarefa-active");
			$app["tarefa"].removeClass("slide-x").one("transitionend", function() {
				$app["tarefa"].removeClass("in").empty();
			});

			if (UI.data["columns"] >= 3) {
				// UI.backdrop.hide($app["tarefa"]);
			}

			// router
			router["view-manager"].replace("home");
			if (pushState) { router.go("/tarefas", { "view": "home" }, "Lista de Tarefas"); }
		}
	};
})();

$(function() {
	$app["tarefa"] = $(".js-app-tarefa");
	$app["tarefa"].on("click", ".js-tarefa-close", function(event) {
		event.preventDefault();
		app.Tarefa.close(true);
	}).on("click", ".js-new-post-trigger", function() {
		UI.bottomsheet.open($(".new-post-sheet", $app["tarefa"]).clone().show());
	}).on("click", ".card-tarefa a", function(event) {
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

app.Post = (function() {
	return {

		////////////////////////////////////////////////////////////////////////////////////////////
		// NewPost.authorize()
		authorize: function() {
			// habilita o botão enviar
			$(".submit", $post).removeClass("disabled");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// NewPost.deauthorize()
		deauthorize: function() {
			// desabilita o botão "enviar"
			$(".submit", $post).addClass("disabled");
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// NewPost.getThumbnail()
		getThumbnail: function(url) {
			// testa se urls são dos provider aceitos e responde com informações sobre o vídeo,
			// incluindo a url da miniatura
			// providers aceitos: youtube, vimeo, vine
			var media_info = { };

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

				$.getJSON("https://vimeo.com/api/v2/video/" + vimeo_url[2] + ".json?callback=?")
					.done(function(response) {
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

				$.getJSON("//assets.laguinho.org/helpers/vine-thumbnail?id=" + vine_url[2] + "&callback=?")
					.done(function(response) {
						media_info["thumbnail"] = response["thumbnail"];

						NewPost.authorize();
						showThumbnail(media_info);
					});
			}

		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// NewPost.open()
		open: function(type, numero) {
			var data = {
				"edicao": Lista.Regulamento["titulo"],
				"numero": (numero || tarefa_active),
				"user": user["id"],
				"turma": user["turma"],
				"token": user["token"]
			};
			var $new_post_view = __render("new-post-" + type, data);

			// efeito de abertura
			// _view.open($post, $newPostView);
			$post.html($new_post_view).addClass("in").reflow().addClass("slide-y").one("transitionend", function() {
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
			} else

			if (type === "video" || type === "vine") {
				$(".js-media-url-input", $post).focus().on("keyup", function() {
				//	if ($.inArray(event.keyCode, [16, 17, 18])) { return; }
					NewPost.getThumbnail($(this).val());
				});
			} else

			if (type === "text") {
				$(".js-caption-input", $post).focus().on("keyup", function() {
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
		close: function() {
		//	tarefa_active = null;
			$("head meta[name='theme-color']").attr("content", theme_color["original"]);

			$post.removeClass("slide-y").one("transitionend", function() {
				$post.removeClass("in").empty();
			});

			router["view-manager"].replace("tarefa");
		}
	};
})();

var post = NewPost;

// jQuery
var $post;

$(function() {
	$post = $("#new-post");
	$ui["bottomsheet"].on("click", ".new-post-sheet a", function(event) {
		event.preventDefault();

		var type = $(this).data("post-type");
		UI.bottomsheet.close();
		setTimeout(function() {
			app.Post.open(type, tarefa_active);
		}, 600);
	});

	$post.on("submit", "form", function(event) {
		event.preventDefault();
	}).on("click", ".submit", function(event) {
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

		$.post("/-/lista/novo", data).done(function(response) {
			if (response["meta"]["status"] === 200) {
				NewPost.close();
				app.Tarefa.render(response["data"]);
				UI.toast.open(response["meta"]["message"]);
				navigator.vibrate(800);

				tarefas[response["data"]["numero"]] = response["data"];
			} else {
				UI.toast.open((response["meta"]["message"]? response["meta"]["message"] : "Ocorreu um erro. Tente novamente"));
			}
		}).fail(function() {
			toast.open("Ocorreu um erro. Tente novamente");
		});

	}).on("click", ".back", function(event) {
		event.preventDefault();
		NewPost.close();
	});
});

var NewPost = app.Post;

////////////////////////////////////////////////////////////////////////////////////////////////////
// login ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var $login;

var login = (function() {
	return {
		show: function() {
		//	backdrop.show();
			$login.addClass("in").reflow().addClass("slide");
			$ui["body"].addClass("no-scroll");
			setTimeout(function() { $("input[name='email']", $login).focus(); }, 300);
		},
		hide: function() {
			$ui["body"].removeClass("no-scroll");
			$login.removeClass("slide").one("transitionend", function() {
				$login.removeClass("in");
			});
		//	backdrop.hide();
		}
	};
})();

$(function() {
	$login = $("#login");
	$(".js-login-trigger", $ui["sidenav"]).on("click", function(event) {
		event.preventDefault();
		sidenav.close();
		login.show();
	});
	$login.on("click", ".back", function(event) {
		event.preventDefault();
		login.hide();
	}).on("submit", "form", function(event) {
		event.preventDefault();

		$.getJSON("https://api.laguinho.org/lista/" + edicao + "/auth?key=" + api_key + "&callback=?", $("form", $login).serialize()).done(function(response) {
			if(response["meta"]["status"] === 200) {
				user = response["user"];
				user["signed-in"] = true;
				localStorage.setItem("user", JSON.stringify(user));

				$ui["body"].addClass("signed-in user-" + user["turma"]);
				login.hide();
				setTimeout(function() {
					UI.toast.show("Olá " + user["name"] + "!");
				}, 500);
			} else {
				$(".form-group", $login).addClass("animated shake");
				setTimeout(function() { $(".form-group", $login).removeClass("animated shake"); }, 1000);
			}
		});
	});

	$(".js-logout-trigger", $ui["sidenav"]).on("click", function(event) {
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
		setTimeout(function() {
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

	$(function() {
		if (user["id"] !== null) {
			$ui["body"].addClass("signed-in user-" + user["turma"]);
			setTimeout(function() {
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
	FileAPI.filterFiles(files, function(file, info) {
		if(/^image/.test(file.type)) {
			file_stack[file["name"]] = info;
			return true;
		//	return info.width >= 320 && info.height >= 240;
		}
		return false;
	}, function(files, rejected) {
		if(files.length) {
			$(".submit", $post).addClass("disabled");

			// preview
			FileAPI.each(files, function(file) {
				var exif_orientation = file_stack[file["name"]]["exif"]["Orientation"];
				file_stack[file["name"]]["ref"] = tarefa_active + "-" + user["id"] + "-" +
					moment().format("X") + "-" + rand(0, 999).toFixed(0);

				if(file["type"] == "image/gif") {
					var reader = new FileReader();
					reader.onload = function(event) {
						var img = $("<img />").attr("src", event.target.result);
						var $tracker = $("<input type=\"hidden\" name=\"image-order[]\" />").val(file_stack[file["name"]]["ref"]);

						var $status = $("<div />").addClass("progress");
						$("<div />").addClass("status").html("<strong>Enviando&hellip;</strong>").appendTo($status);
						$("<div />").addClass("bar").appendTo($status);

						var $preview = $("<li />").attr("id", "file-" +
								file_stack[file["name"]]["ref"]).append($tracker).append($status).append(img);
						$("#dropzone #board").append($preview);
					};
					reader.readAsDataURL(file);
				} else {
					FileAPI
						.Image(file)
						.rotate(exif_orientation_to_degrees[exif_orientation])
						.resize(600, 300, "preview")
						.get(function(err, img) {
						//	$tracker = $("<input type=\"hidden\" name=\"image-order[]\" />")
						//		.val(tarefa_active + "-" + user["id"] + "-" + file["name"]);
							var $tracker = $("<input type=\"hidden\" name=\"image-order[]\" />").val(file_stack[file["name"]]["ref"]);

							var $status = $("<div />").addClass("progress");
							$("<div />").addClass("status").html("<strong>Enviando&hellip;</strong>").appendTo($status);
							$("<div />").addClass("bar").appendTo($status);

							var $preview = $("<li />").attr("id", "file-" +
									file_stack[file["name"]]["ref"]).append($tracker).append($status).append(img);
							$("#dropzone #board").append($preview);
						});
				}
			});

			// upload
			if(files[0]["type"] == "image/gif") {
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
					prepare: function(file, options) {
						options.data.ref = file_stack[file["name"]]["ref"];
						file.ref = file_stack[file["name"]]["ref"];
					},

					files: files,
					fileprogress: function(event, file, xhr) {
						var percent = ((event["loaded"] / event["total"]) * 100).toFixed(0),
							status = (percent < 100? "<strong>Enviando&hellip;</strong> " +
									percent + "%" : "<strong>Processando&hellip;</strong>");

						$("#file-" + file["ref"] + " .status", "#dropzone").html(status);
					},
					progress: function(event) {
					//	var percent = ((event["loaded"] / event["total"]) * 100).toFixed(0) + "%"
					//	console.log(percent);
					},
					filecomplete: function(file, xhr, options) {
					//	console.log(file, xhr, options);
						$("#file-" + options["ref"] + " .status", "#dropzone").html("<i class=\"material-icons\">check</i>");
					},
					complete: function(err, xhr) {
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
					prepare: function(file, options) {
						options.data.ref = file_stack[file["name"]]["ref"];
						file.ref = file_stack[file["name"]]["ref"];
					},

					imageAutoOrientation: true,
					imageTransform: {
						maxWidth: 1920,
						maxHeight: 1920
					},

					files: files,
					fileprogress: function(event, file, xhr) {
						var percent = ((event["loaded"] / event["total"]) * 100).toFixed(0),
							status = (percent < 100? "<strong>Enviando&hellip;</strong> " +
									percent + "%" : "<strong>Processando&hellip;</strong>");

						$("#file-" + file["ref"] + " .status", "#dropzone").html(status);
					},
					progress: function(event) {
					//	var percent = ((event["loaded"] / event["total"]) * 100).toFixed(0) + "%"
					//	console.log(percent);
					},
					filecomplete: function(file, xhr, options) {
					//	console.log(file, xhr, options);
						$("#file-" + options["ref"] + " .status", "#dropzone").html("<i class=\"material-icons\">check</i>");
					},
					complete: function(err, xhr) {
						$(".submit", $post).removeClass("disabled");
					}
				});
			}
		}
	});
}

$.fn.dropzone = function() {
	// dropzone
	var $dropzone = $("#dropzone", this);
	FileAPI.event.dnd($dropzone[0], function(over) {
		if(over) {
			$dropzone.addClass("active");
		} else {
			$dropzone.removeClass("active");
		}
	}, function(files) {
		upload(files);
	});

	// manual select
	var $file_input = document.getElementById("form-file");
	FileAPI.event.on($file_input, "change", function(event) {
		var files = FileAPI.getFiles(event);
		upload(files);
	});

	// reorder
	var $board = $("#board", this);
	$board.on("slip:beforewait", function(event) {
		if(ui["interaction-type"] === "pointer") {
			event.preventDefault();
		}
	}).on("slip:afterswipe", function(event) {
		event.target.remove();
	}).on("slip:reorder", function(event) {
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
worker.Start = (function() {
	timeout["delay-start"] = setTimeout(function() {
		log("worker.Start", "info");

		cue["load-edicao"] = $.Deferred();
		worker.Load();

		cue["load-edicao"].done(function() {
			timeout["delay-evolucao"] = setTimeout(app.Evolucao.start, 200);
		});

	}, 300);
})();


// load
worker.Load = (function() {
	timeout["delay-load"] = setTimeout(function() {
		log("worker.Load", "info");

		ListaAPI("/tudo").done(function(response) {
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
});


// update
worker.Update = (function() {
	let updates = {
		"tarefas": 0,
		"posts": 0,
		"total": 0,
		"last-updated": null
	};

	timeout["atividade"] = setInterval(function() {
		log("worker.Update", "info");

		ListaAPI("/atividade").done(function(response) {
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
					"tarefas": updates["tarefas"] + " " + (updates["tarefas"] > 1? "novas tarefas" : "nova tarefa"),
					"posts": updates["posts"] + " " + (updates["posts"] > 1? "novos posts" : "novo post"),
					"final": ""
				};

				if (updates["tarefas"] > 0) {
					texto["final"] += texto["tarefas"];
				}
				if ((updates["tarefas"] > 0) && (updates["posts"] > 0)) {
					texto["final"] += " e ";
				}
				if (updates["posts"] > 0) {
					texto["final"] += texto["posts"];
				}

				UI.toast.show({
					"persistent": true,
					"message": texto["final"],
					"label": "Atualizar",
					"action": function() {
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

			updates["last-updated"] = (response[0]? moment(response[0]["ts"]) : moment());
		});
	}, 30 * 1000);
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// fonts ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

WebFont.load({
	timeout: 10000,
	google: {
		families: [
			"Material Icons",
			"Roboto:400,400italic,500:latin",
			"Roboto+Mono:700:latin",
			"Lato:400:latin"
		]
	},
	// custom: {
	// 	families: [
	// 		"FontAwesome"
	// 	], urls: [
	// 		"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css"
	// 	]
	// },
	active: function() {
		$(function() {
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
