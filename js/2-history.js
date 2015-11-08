////////////////////////////////////////////////////////////////////////////////////////////////////
// view manager & history //////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
var current_view = ["home"];
var view_manager = (function() {
	return {
		add: function(view) {
			current_view.push(view);
		//	console.log(current_view);
		},
		remove: function(view) {
			current_view = $.grep(current_view, function(value) {
  				return value != view;
  			});
		//	console.log(current_view);
		},
		replace: function(view) {
			current_view = [];
			view_manager.add(view);
		}
	};
})();

window.addEventListener("popstate", function(event) {
//	console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));

	let state = event.state;
	if(state && state["view"] == "tarefa") {
		if(current_view.indexOf("bottomsheet") > -1) { bottomsheet.close(); }
		if(current_view.indexOf("new-post") > -1) { post.close(); }
		tarefa.open(state["id"]);
	} else

	if(state && state["view"] == "new-post") {
		post.open(state["type"], state["id"]);
	} else

	if(state && state["view"] == "bottomsheet") {
		if(current_view.indexOf("new-post") > -1) { post.close(); }
	}

//	if(state["view"] == "home") {
	else {
		if(current_view.indexOf("bottomsheet") > -1) { bottomsheet.close(); }
		if(current_view.indexOf("new-post") > -1) { post.close(); }
		tarefa.close();
	}

});

/*

states:
* tarefa
* home
* new-post
* bottomsheet

*/
