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
