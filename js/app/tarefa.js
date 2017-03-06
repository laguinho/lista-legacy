////////////////////////////////////////////////////////////////////////////////////////////////////
// tarefa //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// app.Tarefa.open()
// app.Tarefa.render()
// app.Tarefa.close()

app.Tarefa = (function() {
	$(function() {
		$app["tarefa"] = $(".app-tarefa");
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

	let placar_da_tarefa = [ ];

	function renderPosts(posts, $posts) {
		placar_da_tarefa["total"] = 0;
		for (var turma in Lista.Edicao["turmas"]) {
			placar_da_tarefa[Lista.Edicao["turmas"][turma]] = 0;
		}

		$.each(posts, function(index, post) {
			post["turma-background"] = post["turma"] + "-light-background";
			post["data-de-postagem-formatada"] = moment(post["data-de-postagem"]).calendar();
			post["turma-formatada"] = post["turma"].toUpperCase();

			// legenda
			if (post["legenda"] && post["legenda"].substring(0,3) !== "<p>") {
				post["legenda"] = "<p>" + post["legenda"].replace(/(?:\r\n\r\n|\r\r|\n\n)/g, "</p><p>") + "</p>";
			}

			// avaliação
			if (post["avaliacao"]) {
				post["avaliacao/mensagem"] = post["avaliacao"]["mensagem"];

				if (post["avaliacao"]["status"] === 200) {
					post["status-class"] = post["turma"];
					post["status-icon"] = "<i class=\"material-icons\">&#xE87D;</i>"; // coração
					post["avaliacao/status"] = post["avaliacao"]["pontos"] + " ponto" + (post["avaliacao"]["pontos"] > 1? "s": "");
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
		open: function(numero, $card, pushState) {
			// console.log($card[0].getBoundingClientRect());

			let tarefa = cache["tarefas"][numero];
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
						"gutter": (UI.data["columns"] === 1? 8 : 24)
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

				setTimeout(function() {
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

			$.each(Lista.Edicao["turmas"], function(index, turma) {
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
			$("head meta[name='theme-color']").attr("content", UI.data["theme-color"]["original"]);

			UI.body.unlock();
			$ui["body"].removeClass("tarefa-active");
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
