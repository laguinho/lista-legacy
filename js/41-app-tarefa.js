////////////////////////////////////////////////////////////////////////////////////////////////////
// tarefa //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

const tarefa = (function() {
	function renderPosts(DATA, $posts) {
		$.each(DATA, function(index, post) {
			post["data-de-postagem-formatada"] = moment(post["data-de-postagem"]).calendar();
			post["turma-formatada"] = post["turma"].toUpperCase();

			// avaliação
			if(post["avaliacao"]) {
				if(post["avaliacao"]["status"] == 200) {
					post["status-class"] = post["turma"];
					post["status-icon"] = "<i class=\"material-icons\">&#xE87D;</i>"; // coração
					post["status"] = post["avaliacao"]["pontos"] + " ponto" + (post["avaliacao"]["pontos"] > 1? "s": "");
				} else {
					post["status-class"] = "rejected";
					post["status-icon"] = "<i class=\"material-icons\">&#xE888;</i>";
					post["status"] = "Reprovado";
				}
				post["mensagem"] = post["avaliacao"]["mensagem"];
			} else {
				post["status-icon"] = "<i class=\"material-icons\">&#xE8B5;</i>"; // relógio
				post["status"] = "Aguardando avaliação";
			}

			// legenda
			if(post["legenda"] && post["legenda"].substring(0,3) != "<p>") {
				post["legenda"] = "<p>" + post["legenda"].replace(/(?:\r\n\r\n|\r\r|\n\n)/g, "</p><p>") + "</p>";
			}

			// renderiza o post
			let $post_card = __render("view-tarefa-post-card", post);
			let $media = $(".media", $post_card);

			// adiciona mídias
			if(post["midia"].length) {
				$.each(post["midia"], function(index, media) {
					// imagem
					if(post["tipo"] == "imagem") {
						media["default"] = media["caminho"] + media["arquivos"][1];
						media["padding-aspecto"] = "padding-top: " + (media["aspecto"] * 100).toFixed(2) + "%";
						media["link-original"] = media["caminho"] + media["arquivos"][2];
						let $image = __render("media-photo", media);
						$media.append($image);
					} else

					// embed
					if(post["tipo"] == "youtube" || post["tipo"] == "vimeo" || post["tipo"] == "vine") {
						if(post["tipo"] == "youtube") {
							media["embed"] = "https://www.youtube.com/embed/" + media["youtube-id"] + "?rel=0&amp;showinfo=0";
						} else

						if(post["tipo"] == "vimeo") {
							media["embed"] = "https://player.vimeo.com/video/" + media["vimeo-id"] + "?title=0&byline=0&portrait=0";
						} else

						if(post["tipo"] == "vine") {
							media["embed"] = "https://vine.co/v/" + media["vine-id"] + "/embed/simple";
						}

						media["padding-aspecto"] = "padding-top: " + (media["aspecto"] * 100).toFixed(2) + "%";
						let $embed = __render("media-video", media);
						$media.append($embed);
					}
				});
			}

			// tira legenda se não tiver
			if(!post["legenda"]) {
				$(".caption", $post_card).remove();
			}

			// tira mensagem de avaliação se não tiver
			if(!post["avaliacao"] || !post["mensagem"]) {
				$(".result .message", $post_card).remove();
			}


			// adiciona o post à tarefa
			$posts.append($post_card).isotope("appended", $post_card);
		});
	}

	return {
		open: function(numero, pushState) {
			let DATA = tarefas[numero];
			tarefa_active = numero;

			$tarefa.addClass("in");
			tarefa.render(DATA);

			$tarefa.reflow().addClass("slide").one("transitionend", function() {
			//	var view_theme_color = $(".appbar", $tarefa).css("background-color");
				$("head meta[name='theme-color']").attr("content", "#546e7a");
			});

			$body.addClass("no-scroll tarefa-active");

			// view manager
			view_manager.replace("tarefa");
			if(pushState) {
				history.pushState({ "view": "tarefa", "id": DATA["numero"] }, DATA["titulo"], "/tarefas/" + DATA["numero"]);
			}
		},
		render: function(DATA) {
			let $tarefa_view = __render("view-tarefa", DATA);

			// meta
			let $meta = $tarefa_view.find(".meta");

			if(DATA["imagem"]) {
				tarefa["imagem-url"] = DATA["imagem"]["url"];
				tarefa["imagem-aspecto"] = "padding-top: " + (DATA["imagem"]["aspecto"] * 100).toFixed(2) + "%";
			}

			let $meta_card = __render("card-tarefa", DATA);

			if(!DATA["imagem"]) {
				$(".media", $meta_card).remove();
			}
			$(".grid", $meta_card).remove();

			$meta.append($meta_card);

			// posts
			let $posts = $tarefa_view.find(".posts ul");

			if(DATA["posts"].length) {
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

			if(DATA["posts"].length) {
				$posts.isotope("layout");
			}
		},
		close: function(pushState) {
			tarefa_active = null;
			$("head meta[name='theme-color']").attr("content", theme_color["original"]);

			$body.removeClass("no-scroll tarefa-active");
			$tarefa.removeClass("slide").one("transitionend", function() {
				$tarefa.removeClass("in").empty();
			});

			view_manager.replace("home");
			if(pushState) { history.pushState({ "view": "home" }, "Lista de Tarefas", "/tarefas"); }
		}
	};
})();

const Tarefa = tarefa;

// jQuery
let $tarefa;

$(function() {
	$tarefa = $("#tarefa");
	$tarefa.on("click", ".back", function(event) {
		event.preventDefault();
		tarefa.close(true);
	}).on("click", ".js-new-post-trigger", function() {
		bottomsheet.open($(".new-post-sheet", $tarefa).clone().show());
	}).on("click", ".card.tarefa a", function(event) {
		if(event.which === 1) {
			event.preventDefault();
		}
	});
});
