////////////////////////////////////////////////////////////////////////////////////////////////////
// placar //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function placar(turmas) {
	// soma a pontuação de cada turma para obter o total de pontos
	const total_de_pontos = turmas.reduce((total, turma) => total + turma["pontos"], 0);

	// limpa o placar
	$placar.empty();

	// adiciona cada turma no placar
	$.each(turmas, function(index, turma) {
		// calcula % da turma em relação ao total de pontos
		const percentual_da_turma = (total_de_pontos > 0? turma["pontos"] / total_de_pontos : 0);
		turma["altura-da-barra"] = "height: " + (percentual_da_turma * 100).toFixed(3) + "%";
		turma["turma-formatada"] = turma["turma"].toUpperCase();
		turma["pontos"] = turma["pontos"];
		turma["pontuacao-formatada"] = turma["pontos"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

		let $turma = __render("scoreboard-team", turma);
		$placar.append($turma);
	});

	if (total_de_pontos === 0) {
		$placar.parent().addClass("zeroed");
	} else {
		$placar.parent().removeClass("zeroed");
	}
}

const Scoreboard = placar;

// jQuery
let $placar;

$(function() {
	$placar = $(".scoreboard ul");
});
