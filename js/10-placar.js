////////////////////////////////////////////////////////////////////////////////////////////////////
// placar //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

app.Placar = function(turmas) {
	// soma a pontuação de cada turma para obter o total de pontos
	var total_de_pontos = turmas.reduce(function(total, turma) { total + turma["pontos"], 0});

	// limpa o placar
	$placar.empty();

	// adiciona cada turma no placar
	$.each(turmas, function(index, turma) {
		// calcula % da turma em relação ao total de pontos
		var percentual_da_turma = (total_de_pontos > 0? turma["pontos"] / total_de_pontos : 0);

		// formata os dados
		turma["altura-da-barra"] = "height: " + (percentual_da_turma * 100).toFixed(3) + "%";
		turma["turma-formatada"] = turma["turma"].toUpperCase();
		turma["pontos"] = turma["pontos"];
		turma["pontuacao-formatada"] = turma["pontos"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

		// renderiza e coloca na página
		var $turma = __render("placar-turma", turma);
		$placar.append($turma);
	});

	if (total_de_pontos === 0) {
		$placar.parent().addClass("zeroed");
	} else {
		$placar.parent().removeClass("zeroed");
	}
};

// jQuery
var $placar;

$(function() {
	$placar = $(".js-placar ul");
});
