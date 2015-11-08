////////////////////////////////////////////////////////////////////////////////////////////////////
// auto update /////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// comentando pois a lista já acabou
// const update_interval = setInterval(checkUpdates, 30000);
const page_title = $("head title").html();
let last_updated;
let updated = { "tarefas": 0, "posts": 0 };

function checkUpdates() {
	let update_count = 0;

	$.getJSON("//api.laguinho.org/lista/xc/atividade?callback=?").done(function(data) {
		$.each(data, function(index, value) {
			if(moment(value["ts"]).isAfter(last_updated) && value["autor"] != user["id"]) {
				update_count++;
				if(value["acao"] == "novo-post") {
					updated["posts"]++;
				} else if(value["acao"] == "nova-tarefa") {
					updated["tarefas"]++;
				}
			}
		});

		// se tiver atualização, mostra toast
		if(update_count) {
			let message;
			let total_updates = updated["tarefas"] + updated["posts"];

			// FIXME
/*			if(updated["tarefas"] > 0 && updated["posts"] > 0) {
				message = updated["tarefas"] +
					(updated["tarefas"] > 1? " novas tarefas" : " nova tarefa") +
					" e " + updated["posts"] +
					(updated["posts"] > 1? " novos posts" : " novo post");
			} else if(updated["tarefas"] > 0) {
				message = updated["tarefas"] +
				(updated["tarefas"] > 1? " novas tarefas" : " nova tarefa");
			} else if(updated["posts"] > 0) {
				message = updated["posts"] +
					(updated["posts"] > 1? " novos posts" : " novo post");
			}
*/
		//	$("head title").html("(" + total_updates + ") " + page_title);

		//	toast.open("6 novos posts", "Atualizar", Stream.load, true);
			toast.open(
				// message,
				"Novo conteúdo",
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

		last_updated = moment(data[0]["ts"]);
	});
}
