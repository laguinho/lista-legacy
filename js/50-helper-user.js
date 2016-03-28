////////////////////////////////////////////////////////////////////////////////////////////////////
// login ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
let $login;

const login = (function() {
	return {
		show: function() {
		//	backdrop.show();
			$login.addClass("in").reflow().addClass("slide");
			$body.addClass("no-scroll");
			setTimeout(function() { $("input[name='email']", $login).focus(); }, 300);
		},
		hide: function() {
			$body.removeClass("no-scroll");
			$login.removeClass("slide").one("transitionend", function() {
				$login.removeClass("in");
			});
		//	backdrop.hide();
		}
	};
})();

$(function() {
	$login = $("#login");
	$(".js-login-trigger", $sidenav).on("click", function(event) {
		event.preventDefault();
		sidenav.close();
		login.show();
	});
	$login.on("click", ".back", function(event) {
		event.preventDefault();
		login.hide();
	}).on("submit", "form", function(event) {
		event.preventDefault();

		$.getJSON("//api.laguinho.org/lista/" + edicao + "/auth?key=" + api_key + "&callback=?", $("form", $login).serialize()).done(function(response) {
			if(response["meta"]["status"] === 200) {
				user = response["user"];
				user["signed-in"] = true;
				localStorage.setItem("user", JSON.stringify(user));

				$body.addClass("signed-in user-" + user["turma"]);
				login.hide();
				setTimeout(function() {
					toast.open("Olá " + user["name"] + "!");
				}, 500);
			} else {
				$(".form-group", $login).addClass("animated shake");
				setTimeout(function() { $(".form-group", $login).removeClass("animated shake"); }, 1000);
			}
		});
	});

	$(".js-logout-trigger", $sidenav).on("click", function(event) {
		event.preventDefault();
		$body.removeClass("signed-in user-" + user["turma"]);

		user = {
			"id": null,
			"name": null,
			"email": null,
			"token": null,
			"turma": null,
			"signed-in": false
		};
		localStorage.setItem("user", JSON.stringify(user));

		sidenav.close();
		setTimeout(function() {
			toast.open("Sessão encerrada!");
		}, 500);
	});
});


/*
	----------------------------------------------------------------------------------------------------
	user -----------------------------------------------------------------------------------------------

*/

let user = {
	"id": null,
	"name": null,
	"email": null,
	"token": null,
	"turma": null,
	"signed-in": false
};

if(localStorage && localStorage.getItem("user")) {
	user = JSON.parse(localStorage.getItem("user"));
	$(function() {
		if(user["id"] !== null) {
			$body.addClass("signed-in user-" + user["turma"]);
			setTimeout(function() {
				toast.open("Olá " + user["name"] + "!");
			}, 4000);
		}
	});
}
