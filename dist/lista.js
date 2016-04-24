var edicao = "xcii";

var Lista = [ ];
Lista.Regulamento = [ ];
Lista.Tarefas = [ ];

var app = [ ];
var UI = [ ], $ui = [ ];

// laguinho.org/tarefas
var tarefas = { };
$(function() {

});


////////////////////////////////////////////////////////////////////////////////////////////////////
// elements & helpers //////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var $window, $body;
var timeout = [];
var $theme_color, theme_color = { };
var tarefa_active;

$(function() {
	$window = $(window);
	$body = $(document.body);
	$theme_color = $("meta[name='theme-color']");
	theme_color["original"] = $theme_color.attr("content");
});

$.fn.reflow = function() {
//	$body.offset().left;
	var offset = $body.offset().left;
	return $(this);
};

function rand(min, max) { return Math.random() * (max - min) + min; }


////////////////////////////////////////////////////////////////////////////////////////////////////
// ui //////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// o objeto "ui" guarda informações sobre a interface, como dimensões e tipo de interação
var ui  = { };

// confere se a interação é por toque ou mouse
ui["interaction-type"] = ("ontouchstart" in window || navigator.msMaxTouchPoints)? "touch" : "pointer";

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

api_key = "063c72b2afc5333f3b27b366bdac9eb81d64bc6a12cd7b3f4b6ade77a092b63a";

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
		var object = $blank.data("fill-object");
		var field = $blank.data("fill-field"); // deprecated
		var attr = $blank.data("fill-attr"); // deprecated
		var content;

		// nova sintaxe
		if (fill) {
			var rules = fill.split(",");
			for (var i = 0; i < rules.length; i++) {
				var pair = rules[i].split(":");
				var dest = (pair[1]? pair[0].trim() : "html");
				var source = (pair[1]? pair[1].trim() : pair[0]);
				var value;

				source = source.split("/");
				if (source.length > 1) {
					// TODO aceitar mais de um nível
					// var final_source = "data";
					// for (var level in source) {
					// 	final_source += "[source[" + level + "]]";
					// }
					// console.log(source);
					// console.log(final_source, data[final_source]);
					// console.log(data[source[0]][source[1]]);
					value = data[source[0]][source[1]];
				} else {
					value = data[source];
				}

				if (value) {
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

				// console.log("[" + dest + ": " + source + "]", data, data[source]);
			}
		}

		// deprecated
		else {
			if (!object) {
				content = data[field];
			} else if (object && data[object]) {
				content = data[object][field];
			}

			if (content) {
				if (attr === "class") {
					$blank.addClass(content);
				} else if (attr) {
					$blank.attr(attr, content);
				} else {
					$blank.html(content);
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
			.removeAttr("data-fill-object")
			.removeAttr("data-fill-field")
			.removeAttr("data-fill-attr")
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
// placar //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

app.Placar = function(turmas) {
	// soma a pontuação de cada turma para obter o total de pontos
	var total_de_pontos = turmas.reduce(function(total, turma) { total + turma["pontos"], 0});

	// limpa o placar
	$placar.empty();

	// adiciona cada turma no placar
	$.each(turmas, function(index, turma) {
		// calcula % da turma em relação ao total de pontos
		var percentual_da_turma = (total_de_pontos > 0? turma["pontos"] / total_de_pontos : 0);

		// formata os dados
		turma["altura-da-barra"] = "height: " + (percentual_da_turma * 100).toFixed(3) + "%";
		turma["turma-formatada"] = turma["turma"].toUpperCase();
		turma["pontos"] = turma["pontos"];
		turma["pontuacao-formatada"] = turma["pontos"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

		// renderiza e coloca na página
		var $turma = __render("placar-turma", turma);
		$placar.append($turma);
	});

	if (total_de_pontos === 0) {
		$placar.parent().addClass("zeroed");
	} else {
		$placar.parent().removeClass("zeroed");
	}
};

// jQuery
var $placar;

$(function() {
	$placar = $(".js-placar ul");
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// fonts ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

WebFont.load({
	timeout: 10000,
	google: { families: ["Material Icons", "Roboto:400,400italic,500:latin", "Montserrat::latin"] },
	custom: { families: ["FontAwesome"], urls: ["https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.3.0/css/font-awesome.min.css"] },
	active: function() {
		$(function() { app.Lista.layout(); });
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// momentjs ////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

moment.locale('pt-br', {
		months : 'janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro'.split('_'),
		monthsShort : 'jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez'.split('_'),
		weekdays : 'domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado'.split('_'),
		weekdaysShort : 'dom_seg_ter_qua_qui_sex_sáb'.split('_'),
		weekdaysMin : 'dom_2ª_3ª_4ª_5ª_6ª_sáb'.split('_'),
		longDateFormat : {
			LT : 'HH:mm',
			LTS : 'HH:mm:ss',
			L : 'DD/MM/YYYY',
			LL : 'D [de] MMMM [de] YYYY',
			LLL : 'D [de] MMMM [de] YYYY [às] HH:mm',
			LLLL : 'dddd, D [de] MMMM [de] YYYY [às] HH:mm'
		},
		calendar : {
			sameDay: '[hoje às] LT',
			nextDay: '[amanhã às] LT',
			nextWeek: 'dddd [às] LT',
			lastDay: '[ontem às] LT',
			lastWeek: 'dddd [às] LT',
			sameElse: 'L'
		},
		relativeTime : {
			future : 'daqui %s',
			past : '%s atrás',
			s : 'poucos segundos',
			m : 'um minuto',
			mm : '%d minutos',
			h : 'uma hora',
			hh : '%d horas',
			d : 'um dia',
			dd : '%d dias',
			M : 'um mês',
			MM : '%d meses',
			y : 'um ano',
			yy : '%d anos'
		},
		ordinalParse: /\d{1,2}º/,
		ordinal : '%dº'
	});

////////////////////////////////////////////////////////////////////////////////////////////////////
// router //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

var router = { };

// navigation mode
router["path"] = location.pathname.split("/");

if (router["path"][0] === "tarefas") {
	router["navigation-mode"] = "path";
} else {
	router["navigation-mode"] = "hash";
	router["path"] = location.hash.split("/");
	router["path"].splice(0, 1);
}

// go
router["go"] = function(path, object, title) {
	if (router["navigation-mode"] === "path" && pushState) {
		history.pushState(object, title, path);
	} else {
		history.pushState(object, title, "#" + path);
		location.hash = path;
	}
};

// build link
router["build-link"] = function(path) {
	if (router["navigation-mode"] === "path") {
		link = path;
	} else {
		link = "#" + path;
	}

	return link;
};

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

/*

states:
* tarefa
* home
* new-post
* bottomsheet

*/

////////////////////////////////////////////////////////////////////////////////////////////////////
// sidenav /////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

var sidenav = (function() {
	return {
		open: function() {
			backdrop.show();
			$sidenav.addClass("in");
			$body.addClass("no-scroll");

			$backdrop.on("hide", sidenav.close);
		},
		close: function() {
			$body.removeClass("no-scroll");
			$sidenav.removeClass("in");
			backdrop.hide();
		}
	};
})();

// jQuery
var $sidenav;

$(function() {
	$sidenav = $("#sidenav");
	$(".sidenav-trigger").on("click", function(event) {
		event.preventDefault();
		sidenav.open();
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// bottomsheet /////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

var bottomsheet = (function() {
	return {
		open: function($content, addClass) {
			backdrop.show();
			$bottomsheet.html($content).addClass((addClass? addClass + " " : "") + "in").reflow().addClass("slide");

			theme_color["buffer"] = $theme_color.attr("content");
			$theme_color.attr("content", "#000");

			$backdrop.on("hide", bottomsheet.close);

			router["view-manager"].add("bottomsheet");
			history.pushState({ "view": "bottomsheet" }, null, null);
		},
		close: function() {
			$bottomsheet.removeClass("slide").one("transitionend", function() {
				$bottomsheet.removeClass("in").empty().removeClass();
			});

			$theme_color.attr("content", theme_color["buffer"]);

			backdrop.hide();

			router["view-manager"].remove("bottomsheet");
		}
	};
})();

// jQuery
var $bottomsheet;

$(function() {
	$bottomsheet = $("#bottom-sheet");
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// toast ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

UI.toast = (function() {
	return {
		// TODO nova sintaxe, usar template e __render
		// show: function(config) {
		// 	if (typeof config === "object") {
		//
		// 	} else {
		//
		// 	}
		// },
		//
		// dismiss: function() {
		//
		// },

		// TODO DEPRECATED
		open: function(message, action, callback, persistent) {
		// open: function(message, addClass) {
			$toast.message.html(message);
			$toast.action.html((action? action : ""));
			$toast.addClass("in").reflow().addClass("slide");
			$body.addClass("toast-active");

			// TODO: .fab-bottom transform: translateY

			$toast.on("click", toast.close);
			$toast.action.on("click", callback);

			clearTimeout(timeout["toast"]);
			if (!persistent) {
				$toast.removeClass("stream-only");
				timeout["toast"] = setTimeout(toast.close, 6500);
			} else {
				$toast.addClass("stream-only");
			}
		},

		close: function() {
			$body.removeClass("toast-active");
			$toast.removeClass("slide").one("transitionend", function() {
				$toast.removeClass("in").removeClass();
				$toast.message.empty();
			});
			clearTimeout(timeout["toast"]);
		}
	};
})();

var toast = UI.toast;

// var snackbar = toast;

// jQuery
var $toast;

$(function() {
	$toast = $("#toast");
	$toast.message = $(".message", $toast);
	$toast.action = $(".action", $toast);
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// backdrop ////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

var backdrop = (function() {
	return {
		show: function() {
			$backdrop.addClass("in");
		},
		hide: function() {
			$backdrop.removeClass("in").off("hide");
		}
	};
})();

// jQuery
var $backdrop;

$(function() {
	$backdrop = $("#backdrop");
	$backdrop.on("click", function() {
		$backdrop.trigger("hide");
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// lista ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// app.Lista.load()
// app.Lista.layout()
// app.Lista.sort()

app.Lista = (function() {
	return {
		load: function() {
			// mostra a tela de loading e limpa o stream
			$stream.loading.addClass("fade-in in");

			// carrega os dados da API
			$.getJSON("https://api.laguinho.org/lista/" + edicao + "/tudo?key=" + api_key + "&callback=?").done(function(data) {
				// "DIRETOR"
				// TODO O load deve ficar separado do Stream (ver issue #7)
				Lista.Regulamento = data["meta"];
				Lista.Tarefas = data["tarefas"];

				// Se tiver título especificado, insere ele
				if (data["meta"]["titulo"]) {
					page_title = data["meta"]["titulo"];
					$("head title").html(page_title);
				}

				// Se tiver mensagem especificada, insere ela
				if (data["meta"]["mensagem"]) {
					$(".js-message").html(data["meta"]["mensagem"]);
				}

				// Se prazo de postagem estiver encerrado, insere classe no <body>
				if (moment().isAfter(Lista.Regulamento["fim"])) {
					$body.addClass("postagens-encerradas");
				}

				// Se a Edição estiver encerrada...
				if (Lista.Regulamento["encerrada"] === true) {
					// ...insere classe no <body>
					$body.addClass("edicao-encerrada");

					// ...para de atualizar automaticamente
					clearInterval(update_interval);
				}

				// FIM DO "DIRETOR"

				// Limpa o stream para começar do zero
				$stream.empty();

				// Monta placar
				app.Placar(data["placar"]);

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
				if (router["path"][1]) {
					app.Tarefa.open(router["path"][1]);
				}

				// esconde a tela de loading
				setTimeout(function() {
					$stream.loading
						.removeClass("fade-in")
						.one("transitionend", function() { $stream.loading.removeClass("in");
					});
				}, 1200);

				// guarda a data da última atualização e zera o contador de novidades
				last_updated = moment(data["meta"]["ultima-atualizacao"]);
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

// var stream = app.Lista;
// var Stream = stream;

// jQuery
var $stream;

$(function() {
	$stream = $("#stream");
	$stream.loading = $("main .loading");
	$stream.isotope({
		"itemSelector": ".card",
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

	$stream.on("click", ".card.tarefa:not(.fantasma)", function(event) {
		if (event.which === 1) {
			event.preventDefault();

			var numero = $(this).data("tarefa");
			app.Tarefa.open(numero, true);
		}
	});

	app.Lista.load();

	// ordenação
	$sidenav.on("click", ".js-stream-sort a", function(event) {
		event.preventDefault();

		var criteria = $(this).data("sort-by");
		$(".js-stream-sort a", $sidenav).removeClass("active");
		$(this).addClass("active");

		app.Lista.sort(criteria);
		sidenav.close();
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
				if (post["avaliacao"]["status"] == 200) {
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
			var $media = $(".media", $post_card);

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
				$(".caption", $post_card).remove();
			}

			// tira mensagem de avaliação se não tiver
			if (!post["avaliacao"] || !post["mensagem"]) {
				$(".result .message", $post_card).remove();
			}


			// adiciona o post à tarefa
			$posts.append($post_card).isotope("appended", $post_card);
		});
	}

	return {
		open: function(numero, pushState) {
			var DATA = tarefas[numero];
			tarefa_active = numero;

			$tarefa.addClass("in");
			app.Tarefa.render(DATA);

			$tarefa.reflow().addClass("slide").one("transitionend", function() {
			//	var view_theme_color = $(".appbar", $tarefa).css("background-color");
				$("head meta[name='theme-color']").attr("content", "#546e7a");
			});

			$body.addClass("no-scroll tarefa-active");

			// router
			router["view-manager"].replace("tarefa");
			if (pushState) { router.go("/tarefas/" + DATA["numero"], { "view": "tarefa", "id": DATA["numero"] }, DATA["titulo"]); }
		},
		render: function(DATA) {
			var $tarefa_view = __render("view-tarefa", DATA);

			// card da tarefa
			var $meta = $(".painel .meta", $tarefa_view);

			if (DATA["imagem"]) {
				tarefa["imagem-url"] = DATA["imagem"]["url"];
				tarefa["imagem-aspecto"] = "padding-top: " + (DATA["imagem"]["aspecto"] * 100).toFixed(2) + "%";
			}

			var $meta_card = __render("card-tarefa", DATA);

			if (!DATA["imagem"]) {
				$(".media", $meta_card).remove();
			}
			$(".grid", $meta_card).remove();

			$meta.append($meta_card);

			// posts
			var $posts = $tarefa_view.find(".posts ul");

			if (DATA["posts"].length) {
				$posts.isotope({
					"itemSelector": ".card",
					"transitionDuration": 0,
					"masonry": {
						"gutter": (ui["columns"] === 1? 8 : 16),
					//	"columnWidth": (ui["columns"] < 1? 300 : 450)
					}
				});

				renderPosts(DATA["posts"], $posts);
			} else {
				$("<li />").addClass("empty").text("Nenhum post").appendTo($posts);
			}

			$tarefa.html($tarefa_view);

			if (DATA["posts"].length) {
				$posts.isotope("layout");
			}

			// placar da tarefa
			var $placar_da_tarefa = $(".painel .placar ul", $tarefa_view);

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
		close: function(pushState) {
			tarefa_active = null;
			$("head meta[name='theme-color']").attr("content", theme_color["original"]);

			$body.removeClass("no-scroll tarefa-active");
			$tarefa.removeClass("slide").one("transitionend", function() {
				$tarefa.removeClass("in").empty();
			});

			// router
			router["view-manager"].replace("home");
			if (pushState) { router.go("/tarefas", { "view": "home" }, "Lista de Tarefas"); }
		}
	};
})();

// var tarefa = app.Tarefa;
// var Tarefa = tarefa;

// jQuery
var $tarefa;

$(function() {
	$tarefa = $("#tarefa");
	$tarefa.on("click", ".back", function(event) {
		event.preventDefault();
		app.Tarefa.close(true);
	}).on("click", ".js-new-post-trigger", function() {
		bottomsheet.open($(".new-post-sheet", $tarefa).clone().show());
	}).on("click", ".card.tarefa a", function(event) {
		if (event.which === 1) {
			event.preventDefault();
		}
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// new post ////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// * NewPost.authorize()
// * NewPost.deauthorize()
// * NewPost.getThumbnail()
// * NewPost.open()
// * NewPost.close()

// tipos de post: photo, video, vine, text

var NewPost = (function() {
	return {
		authorize: function() {
			// habilita o botão enviar
			$(".submit", $post).removeClass("disabled");
		},
		deauthorize: function() {
			// desabilita o botão "enviar"
			$(".submit", $post).addClass("disabled");
		},
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
		open: function(type, numero) {
			var data = {
				"edicao": Lista.Regulamento["edicao"],
				"numero": (numero || tarefa_active),
				"user": user["id"],
				"turma": user["turma"],
				"token": user["token"]
			};
			var $new_post_view = __render("new-post-" + type, data);

			// efeito de abertura
			// _view.open($post, $newPostView);
			$post.html($new_post_view).addClass("in").reflow().addClass("slide").one("transitionend", function() {
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
				$(".js-text-input", $post).focus().on("keyup", function() {
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
/*		send: function() {

},*/
		close: function() {
		//	tarefa_active = null;
			$("head meta[name='theme-color']").attr("content", theme_color["original"]);

			$post.removeClass("slide").one("transitionend", function() {
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
	$bottomsheet.on("click", ".new-post-sheet a", function(event) {
		event.preventDefault();

		var type = $(this).data("post-type");
		bottomsheet.close();
		setTimeout(function() {
			NewPost.open(type, tarefa_active);
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
			if (response["response"]["status"] === 200) {
				NewPost.close();
				tarefa.render(response["data"]);
				toast.open(response["response"]["message"]);
				navigator.vibrate(800);

				tarefas[response["data"]["numero"]] = response["data"];
			} else {
				toast.open((response["response"]["message"]? response["response"]["message"] : "Ocorreu um erro. Tente novamente"));
			}
		}).fail(function() {
			toast.open("Ocorreu um erro. Tente novamente");
		});

	}).on("click", ".back", function(event) {
		event.preventDefault();
		NewPost.close();
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// login ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var $login;

var login = (function() {
	return {
		show: function() {
		//	backdrop.show();
			$login.addClass("in").reflow().addClass("slide");
			$body.addClass("no-scroll");
			setTimeout(function() { $("input[name='email']", $login).focus(); }, 300);
		},
		hide: function() {
			$body.removeClass("no-scroll");
			$login.removeClass("slide").one("transitionend", function() {
				$login.removeClass("in");
			});
		//	backdrop.hide();
		}
	};
})();

$(function() {
	$login = $("#login");
	$(".js-login-trigger", $sidenav).on("click", function(event) {
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

				$body.addClass("signed-in user-" + user["turma"]);
				login.hide();
				setTimeout(function() {
					toast.open("Olá " + user["name"] + "!");
				}, 500);
			} else {
				$(".form-group", $login).addClass("animated shake");
				setTimeout(function() { $(".form-group", $login).removeClass("animated shake"); }, 1000);
			}
		});
	});

	$(".js-logout-trigger", $sidenav).on("click", function(event) {
		event.preventDefault();
		$body.removeClass("signed-in user-" + user["turma"]);

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
			toast.open("Sessão encerrada!");
		}, 500);
	});
});


/*
	----------------------------------------------------------------------------------------------------
	user -----------------------------------------------------------------------------------------------

*/

var user = {
	"id": null,
	"name": null,
	"email": null,
	"token": null,
	"turma": null,
	"signed-in": false
};

if(localStorage && localStorage.getItem("user")) {
	user = JSON.parse(localStorage.getItem("user"));
	$(function() {
		if(user["id"] !== null) {
			$body.addClass("signed-in user-" + user["turma"]);
			setTimeout(function() {
				toast.open("Olá " + user["name"] + "!");
			}, 4000);
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
						edition: Lista.Regulamento["edicao"],
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
						edition: Lista.Regulamento["edicao"],
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
// auto update /////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var update_interval = setInterval(checkUpdates, 30000);
var page_title = $("head title").html();
var last_updated;
var updated = { "tarefas": 0, "posts": 0 };

function checkUpdates() {
	var update_count = 0;

	$.getJSON("https://api.laguinho.org/lista/" + edicao + "/atividade?key=" + api_key + "&callback=?").done(function(data) {
		$.each(data, function(index, value) {
			if (moment(value["ts"]).isAfter(last_updated) && value["autor"] != user["id"]) {
				update_count++;
				if (value["acao"] == "novo-post") {
					updated["posts"]++;
				} else if (value["acao"] == "nova-tarefa") {
					updated["tarefas"]++;
				}
			}
		});

		// Se tiver atualização, mostra toast
		if (update_count) {
			var message;
			var total_updates = updated["tarefas"] + updated["posts"];

			// FIXME
			if (updated["tarefas"] > 0 && updated["posts"] > 0) {
				message = updated["tarefas"] +
					(updated["tarefas"] > 1? " novas tarefas" : " nova tarefa") +
					" e " + updated["posts"] +
					(updated["posts"] > 1? " novos posts" : " novo post");
			} else if (updated["tarefas"] > 0) {
				message = updated["tarefas"] +
				(updated["tarefas"] > 1? " novas tarefas" : " nova tarefa");
			} else if (updated["posts"] > 0) {
				message = updated["posts"] +
					(updated["posts"] > 1? " novos posts" : " novo post");
			}

			$("head title").html("(" + total_updates + ") " + page_title);

			// toast.open("6 novos posts", "Atualizar", Stream.load, true);
			UI.toast.open(
				message,
				// "Novo conteúdo",
				"Atualizar",
				function() {
					Stream.load();
					updated = { "tarefas": 0, "posts": 0 };
					$("head title").html(page_title);
				},
				true,
				"stream-only"
			);
		}

		last_updated = (data[0]? moment(data[0]["ts"]) : moment());
	});
}
