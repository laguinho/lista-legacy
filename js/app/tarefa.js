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
