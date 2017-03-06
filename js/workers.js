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

			// Se tiver número de tarefa especificado na URL, abre ela
			if (router["path"] && router["path"][2]) {
				// Antes, testa se o valor é um número
				// e dentro do número de tarefas dessa Edição
				let numero = router["path"][2];
				if (!isNaN(numero) && numero >= 1 && numero <= Lista.Edicao["numero-de-tarefas"]) {
					app.Tarefa.open(numero, false, false);
				}
			}
		});
	}, 0);
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

			timeout["delay-lista"] = setTimeout(function() {
				app.Lista.start();
				cue["load-edicao"].resolve();
			}, 1);
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
			// Confere data de cada atividade e vê se é posterior à última atualização.
			// Se for, adiciona à contagem de nova atividade
			for (let atividade of response) {
				if (moment(atividade["ts"]).isAfter(updates["last-updated"]) && atividade["autor"] != Lista.Usuario["id"]) {
					updates["total"]++;
					if (value["acao"] === "novo-tarefa") {
						updates["tarefas"]++;
					} else if (value["acao"] === "novo-post") {
						updates["posts"]++;
					}
				}
			}

			// Se houver nova atividade
			if (updates["total"] > 0) {
				// Monta o texto do toast
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

				// Mostra número de novas atividades no título
				$ui["title"].html("(" + updates["total"] + ") " + UI.data["page-title"]);
			}

			updates["last-updated"] = (response[0]? moment(response[0]["ts"]) : moment());
		});
	}, 30 * 1000);
});
