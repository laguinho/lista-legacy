////////////////////////////////////////////////////////////////////////////////////////////////////
// lista de tarefas ////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Todas as informações ficam guardadas dentro do objeto "Lista",
// em um dos seus 4 nós
let Lista = [ ];
Lista.Edicao = { };
Lista.Placar = [ ];
Lista.Tarefas = [ ];
Lista.Usuario = { };

// "app" guarda os métodos específicos do funcionamento da Lista,
// "$app" guarda as referências jQuery ao DOM usadas nesses métodos
let app = [ ];
let $app = [ ];

let cache = [ ];
cache["tarefas"] = [ ];

////////////////////////////////////////////////////////////////////////////////////////////////////

let cue = [ ];
let worker = [ ];
let timing = [ ];

// Se o logging estiver ligado, relata cada passo no console
// Obs: nem todos os métodos estão com logs criados ou detalhados!
let logging = false;
let log = function(message, type) {
	if (logging) {
		// Insere a hora no log
		let timestamp = moment().format("LTS");
		message = "[" + timestamp + "] " + message;

		if (!type) {
			console.log(message);
		} else {
			console[type](message);
		}
	}
}

let analytics = function(category, action, label) {
	if (typeof ga !== "undefined") {
		ga("send", "event", category, action, label);
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// daqui pra baixo não é pra ter nada!!

var tarefa_active;
