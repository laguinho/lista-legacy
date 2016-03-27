////////////////////////////////////////////////////////////////////////////////////////////////////
// lista ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// * Stream.load()
// * Stream.layout()
// * Stream.sort()

const Stream = (function() {
	return {
		load: function() {
			// mostra a tela de loading e limpa o stream
			$stream.loading.addClass("fade-in in");

			// carrega os dados da API
			$.getJSON("//api.laguinho.org/lista/" + edicao + "/tudo?callback=?").done(function(data) {
				$stream.empty();

				// monta placar
				Scoreboard(data["placar"]);

				// insere os cards de tarefas
				$.each(data["tarefas"], function(index, tarefa) {
					tarefas[tarefa["numero"]] = tarefa;
					tarefa["url"] = "/tarefas/" + tarefa["numero"];

					if (tarefa["imagem"]) {
						tarefa["imagem-url"] = tarefa["imagem"]["url"];
						tarefa["imagem-aspecto"] = "padding-top: " + (tarefa["imagem"]["aspecto"] * 100).toFixed(2) + "%";
					}

					let $card = __render("card-tarefa", tarefa).data({
							"tarefa": tarefa["numero"],
						//	"modified": tarefa["ultima-postagem"]
							"last-modified": (tarefa["ultima-postagem"]? moment(tarefa["ultima-postagem"]).format("X") : 0)
						});

					if (!tarefa["imagem"]) {
						$(".media", $card).remove();
					}

					// posts
					let $grid = $(".grid", $card);

					if (tarefa["posts"].length) {
						const total_posts = tarefa["posts"].length;
						// const total_media = tarefa["posts"].reduce((total, post) => total + post["midia"].length, 0);
						const max_media_to_show = (ui["columns"] < 2? 9 : 8);
						let shown_media_count = 0;

						const post_types_with_image_preview = ["imagem", "youtube", "vimeo", "vine", "gif"];
						const post_types_with_text_preview = ["texto"];

						for (var i = 0; i < total_posts; i++) {
							let post = tarefa["posts"][i];

							if ((post["midia"] || post["tipo"] == "texto") && (shown_media_count < max_media_to_show)) {
								shown_media_count++;

								let tile_type;
								let media = { };

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

								let $tile = __render(tile_type, media).appendTo($grid);
							}
						}

					} else {
						// se não tiver nenhum post, remove o grid
						$grid.remove();
					}

					// atualiza o isotope
					$stream.append($card).isotope("appended", $card);
				});

				Stream.layout();
				Stream.sort("date");

				// se tiver tarefa especificada no load da página, carrega ela
				if (!!autoload) {
					tarefa.open(autoload);
					autoload = null;
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
			$stream.isotope("layout");
		},
		sort: function(criteria) {
			$stream.isotope({
				"sortBy": criteria
			});
		}
	};
})();

const stream = Stream;

// jQuery
let $stream;

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

	$stream.on("click", ".card.tarefa", function(event) {
		if (event.which === 1) {
			event.preventDefault();

			var numero = $(this).data("tarefa");
			tarefa.open(numero, true);
		}
	});

	stream.load();

	// ordenação
	$sidenav.on("click", ".js-stream-sort a", function(event) {
		event.preventDefault();

		let criteria = $(this).data("sort-by");
		$(".js-stream-sort a", $sidenav).removeClass("active");
		$(this).addClass("active");

		Stream.sort(criteria);
		sidenav.close();
	});
});
