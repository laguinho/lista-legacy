////////////////////////////////////////////////////////////////////////////////////////////////////
// workers /////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// • worker.Start()
// • worker.Load()
// • worker.Update()

// worker.Start()
// É rodado uma única vez, quando a página é carregada.
// Dispara os outros dois workers, Load() e Update().
worker.Start = (function() {
	timing["delay-start"] = setTimeout(function() {
		log("worker.Start", "info");

		cue["load-edicao"] = $.Deferred();

		let started = false;
		cue["load-edicao"].done(function() {
			// Se for o primeiro load
			if (!started) {
				// Se tiver número de tarefa especificado na URL, abre ela
				if (router["path"] && router["path"][2]) {
					// Antes, testa se o valor é um número
					// e dentro do número de tarefas dessa Edição
					let numero = router["path"][2];
					if (!isNaN(numero) && numero >= 1 && numero <= Lista.Edicao["quantidade-de-tarefas"]) {
						app.Tarefa.open(numero, false, false);
					}
				}

				// Inicia a barra de evolução
				timing["delay-evolucao"] = setTimeout(app.Evolucao.start, 100);

				// Inicia a checagem de atividade, exceto se Edição estiver encerrada
				if (!Lista.Edicao["encerrada"]) {
					worker.Update();
				}

				// Desativa nos loads seguintes
				started = true;
			}

			// app.Placar.start();
		});

		timing["delay-load"] = setTimeout(function() {
			worker.Load();
		}, 10);

		analytics("Lista", "Acesso");
	}, 0);
})();


// worker.Load()
worker.Load = (function() {
	log("worker.Load", "info");

	ListaAPI("/tudo").done(function(response) {
		Lista.Edicao = response["edicao"];
		Lista.Placar = response["placar"];
		Lista.Tarefas = response["tarefas"];

		timing["delay-lista"] = setTimeout(function() {
			// Dispara a função de montagem da Lista
			app.Lista.start();
			app.Placar.update();

			// Resolve a promise load-edicao
			cue["load-edicao"].resolve();
			log("cue[\"load-edicao\"] triggered");
		}, 1);

		// Para de atualizar se Edição foi encerrada
		if (Lista.Edicao["encerrada"]) {
			clearInterval(timing["atividade"]);
		}

		// timing["delay-placar"] = setTimeout(app.Placar.start, 400);
	});
});


// worker.Update()
worker.Update = (function() {
	let update_interval_in_seconds = 30;

	let updates = {
		"tarefas": 0,
		"posts": 0,
		"total": 0,
		"last-updated": null
	};

	timing["atividade"] = setInterval(function() {
		log("worker.Update", "info");

		ListaAPI("/atividade").done(function(response) {
			// console.info(updates);
			// Confere data de cada atividade e vê se é posterior à última atualização.
			// Se for, adiciona à contagem de nova atividade
			for (let atividade of response) {
				// console.log(moment(atividade["ts"]).isAfter(updates["last-updated"]));
				if (moment(atividade["ts"]).isAfter(updates["last-updated"]) && atividade["autor"] != Lista.Usuario["id"]) {
					updates["total"]++;

					if (atividade["acao"] === "nova-tarefa") {
						updates["tarefas"]++;
					} else if (atividade["acao"] === "novo-post") {
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

				// Mostra o toast
				UI.toast.show({
					"message": texto["final"],
					"label": "Atualizar",
					"action": function() {
						worker.Load();
						updates["tarefas"] = 0;
						updates["posts"] = 0;
						updates["total"] = 0;
						$ui["page-title"].html(UI.data["page-title"]);
						analytics("Lista", "Atualização");
					},
					"persistent": true,
					"start-only": true
				});

				// Mostra número de novas atividades no título
				$ui["title"].html("(" + updates["total"] + ") " + UI.data["page-title"]);
			}

			updates["last-updated"] = (response[0]? moment(response[0]["ts"]) : moment());

			// console.log(response, updates);
		});
	}, update_interval_in_seconds * 1000);
});
