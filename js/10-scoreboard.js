////////////////////////////////////////////////////////////////////////////////////////////////////
// scoreboard //////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function Scoreboard(TEAMS) {
  // calc total point sum
  const totalPoints = TEAMS.reduce((total, team) => total + team["pontos"], 0);

  // clean the scoreboard
  $scoreboard.empty();

  // draw teams on scoreboard
  $.each(TEAMS, function(index, team) {

    // calc % of this team's points relative to the total
    const percentage = (totalPoints > 0? team["pontos"] / totalPoints : 0);
    team["barra"] = "height: " + (percentage * 100).toFixed(3) + "%";
    team["turma-formatada"] = team["turma"].toUpperCase();

    let $team = __render("scoreboard-team", team)
      .appendTo($scoreboard);
  });

  if(totalPoints === 0) {
    $scoreboard.parent().addClass("zeroed");
  } else {
    $scoreboard.parent().removeClass("zeroed");
  }
}

// jQuery
let $scoreboard;

$(function() {
  $scoreboard = $(".scoreboard ul");
});
