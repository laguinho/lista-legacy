////////////////////////////////////////////////////////////////////////////////////////////////////
// auto update /////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
const update_interval = setInterval(checkUpdates, 30000);
let page_title = $("head title").html();
let last_updated;
let updated = { "tarefas": 0, "posts": 0 };

function checkUpdates() {
	let update_count = 0;

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
			let message;
			let total_updates = updated["tarefas"] + updated["posts"];

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
