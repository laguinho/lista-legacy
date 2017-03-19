////////////////////////////////////////////////////////////////////////////////////////////////////
// app placar //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

app.Placar = (function() {
	$(function() {
		$ui["placar"] = $(".js-app-placar ul");
	});

	return {
		start: function() {
			// TODO
		},

		update: function() {
			// Limpa o placar
			$ui["placar"].empty();

			// Confere qual a turma com maior pontuação
			// e soma a pontuação de cada turma para obter o total de pontos
			let maior_pontuacao = 0;
			let total_de_pontos = 0;

			Lista.Placar.forEach(function(turma) {
				let pontuacao_da_turma = turma["pontos"];

				if (pontuacao_da_turma > maior_pontuacao) {
					maior_pontuacao = pontuacao_da_turma;
				}

				total_de_pontos += pontuacao_da_turma;
			});

			// Com os dados básicos calculados,
			// adiciona as turmas no placar
			Lista.Placar.forEach(function(turma) {
				// Calcula % da turma
				// em relação à turma de maior pontuação
				let percentual_da_turma = (total_de_pontos > 0? turma["pontos"] / maior_pontuacao : 0);

				// Formata os dados para o placar
				turma["turma-formatada"] = turma["turma"].toUpperCase();
				turma["tamanho-da-barra"] = "height: " + (percentual_da_turma * 100).toFixed(3) + "%;";
				turma["pontuacao-formatada"] = turma["pontos"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

				let $turma = __render("placar-turma", turma);
				$ui["placar"].append($turma);
			});

			if (total_de_pontos === 0) {
				$ui["placar"].addClass("placar-zerado");
			} else {
				$ui["placar"].removeClass("placar-zerado");
			}
		}
	}
})();
