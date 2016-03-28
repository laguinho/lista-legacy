////////////////////////////////////////////////////////////////////////////////////////////////////
// new post ////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// * NewPost.authorize()
// * NewPost.deauthorize()
// * NewPost.getThumbnail()
// * NewPost.open()
// * NewPost.close()

// tipos de post: photo, video, vine, text

const NewPost = (function() {
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
			let media_info = { };

			function showThumbnail(media_info) {
				let $thumbnail = $("<img />").attr("src", media_info["thumbnail"]);
				$(".js-media-provider", $post).val(media_info["provider"]);
				$(".js-media-id", $post).val(media_info["id"]);
				$(".js-media-thumbnail", $post).val(media_info["thumbnail"]);
				$(".js-media-preview", $post).html($thumbnail).fadeIn();
			}

			// youtube
			if(url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)) {
				// https://www.youtube.com/watch?v=4ct4eNMrJlg
				let youtube_url = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
				media_info["provider"] = "youtube";
				media_info["id"] = youtube_url[1];
			//	media_info["thumbnail"] = "https://i1.ytimg.com/vi/" + youtube_url[1] + "/maxresdefault.jpg";
				media_info["thumbnail"] = "https://i1.ytimg.com/vi/" + youtube_url[1] + "/0.jpg";

				NewPost.authorize();
				showThumbnail(media_info);
			} else

			// vimeo
			if(url.match(/vimeo\.com/)) {
				// https://vimeo.com/64279649
				let vimeo_url = url.match(/\/\/(www\.)?vimeo.com\/(\d+)($|\/)/);
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
			if(url.match(/vine\.co/)) {
				// https://vine.co/v/e9IV9OPlrnJ
				let vine_url = url.match(/\/\/(www\.)?vine\.co\/v\/([^\s&]+)($|\/)/);
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
			let data = {
				"numero": (numero || tarefa_active),
				"user": user["id"],
				"turma": user["turma"],
				"token": user["token"]
			};
			let $new_post_view = __render("new-post-" + type, data);

			// efeito de abertura
			// _view.open($post, $newPostView);
			$post.html($new_post_view).addClass("in").reflow().addClass("slide").one("transitionend", function() {
				var view_theme_color = $(".appbar", $post).css("background-color");
				$("head meta[name='theme-color']").attr("content", view_theme_color);
			});

			NewPost.deauthorize();

			// ações para fazer quando abrir a tela de envio
			// de acordo com o tipo de postagem
			if(type === "photo") {
				$post.dropzone();
				$(".file-placeholder", $post).trigger("click");
			//	$("form", $new_post_view).dropzone();
			} else

			if(type === "video" || type === "vine") {
				$(".js-media-url-input", $post).focus().on("keyup", function() {
				//	if($.inArray(event.keyCode, [16, 17, 18])) { return; }
					NewPost.getThumbnail($(this).val());
				});
			} else

			if(type === "text") {
				$(".js-text-input", $post).focus().on("keyup", function() {
					if($(this).val().length > 0) {
						NewPost.authorize();
					} else {
						NewPost.deauthorize();
					}
				});
			}

			// view manager
			view_manager.replace("new-post");
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

			view_manager.replace("tarefa");
		}
	};
})();

const post = NewPost;

// jQuery
let $post;

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
			if(response["response"]["status"] == 200) {
				NewPost.close();
				tarefa.render(response["data"]);
				toast.open(response["response"]["message"]);
				navigator.vibrate(800);

				tarefas[response["data"]["numero"]] = response["data"];
			} else {
				toast.open("Ocorreu um erro. Tente novamente");
			}
		}).fail(function() {
			toast.open("Ocorreu um erro. Tente novamente");
		});

	}).on("click", ".back", function(event) {
		event.preventDefault();
		NewPost.close();
	});
});
