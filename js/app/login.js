////////////////////////////////////////////////////////////////////////////////////////////////////
// login ///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// app.Login.open()
// app.Login.close()
// app.Login.submit() [?]
// app.Login.logout()

app.Login = (function() {
	Lista.Usuario = {
		"id": null,
		"name": null,
		"email": null,
		"token": null,
		"turma": null,
		"signed-in": false
	};

	// Se tiver dados guardados no localStorage, usa eles pra logar
	if (localStorage && localStorage.getItem("Lista.Usuario")) {
		Lista.Usuario = JSON.parse(localStorage.getItem("Lista.Usuario"));

		$(function() {
			if (Lista.Usuario["id"] !== null) {
				$ui["body"].addClass("signed-in user-" + Lista.Usuario["turma"]);
				setTimeout(function() {
					UI.toast.show("Olá " + Lista.Usuario["name"] + "!");
				}, 3000);
			}
		});
	}

	$(function() {
		$ui["login"] = $(".app-login");

		// Botões de login e logout
		$(".js-login-trigger", $ui["sidenav"]).on("click", function(event) {
			event.preventDefault();
			UI.sidenav.close();
			app.Login.show();
		});

		$(".js-logout-trigger", $ui["sidenav"]).on("click", function(event) {
			event.preventDefault();
			UI.sidenav.close();
			app.Login.logout();
		});

		// Ação de login
		$ui["login"].on("click", ".back-button", function(event) {
			event.preventDefault();
			app.Login.hide();
		}).on("submit", "form", function(event) {
			event.preventDefault();

			let login_data = $("form", $ui["login"]).serialize();
			app.Login.submit(login_data);
		});
	});

	return {
		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Login.show()
		show: function() {
			// Abre a tela de login e coloca o foco no campo e-mail
			$ui["login"].addClass("in").reflow().addClass("slide").one("transitionend", function() {
				UI.body.lock();
				UI.backdrop.show($ui["login"]);
				$("input[name='email']", $ui["login"]).focus();
			});
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Login.hide()
		hide: function() {
			$ui["login"].removeClass("slide").one("transitionend", function() {
				$ui["login"].removeClass("in");
				UI.backdrop.hide($ui["login"]);
				UI.body.unlock();
			});
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Login.submit()
		submit: function(data) {
			ListaAPI("/auth", data).done(function(response) {
				if (response["meta"]["status"] === 200) {
					Lista.Usuario = response["user"];
					Lista.Usuario["signed-in"] = true;
					localStorage.setItem("Lista.Usuario", JSON.stringify(Lista.Usuario));

					$ui["body"].addClass("signed-in user-" + Lista.Usuario["turma"]);
					app.Login.hide();
					setTimeout(function() {
						UI.toast.show("Olá " + Lista.Usuario["name"] + "!");
					}, 500);
				} else {
					$(".form-group", $ui["login"]).addClass("animated shake");
					setTimeout(function() { $(".form-group", $ui["login"]).removeClass("animated shake"); }, 1000);
				}
			});
		},

		////////////////////////////////////////////////////////////////////////////////////////////
		// app.Login.logout()
		logout: function() {
			// Tira as classes indicadoras de login do body
			$ui["body"].removeClass("signed-in user-" + Lista.Usuario["turma"]);

			// Limpa Lista.Usuario tanto na página quanto no localStorage
			Lista.Usuario = {
				"id": null,
				"name": null,
				"email": null,
				"token": null,
				"turma": null,
				"signed-in": false
			};

			localStorage.setItem("Lista.Usuario", JSON.stringify(Lista.Usuario));

			// Depois de 0,5 segundo,
			// mostra toast confirmando logout
			setTimeout(function() {
				UI.toast.show("Sessão encerrada!");
			}, 500);
		}
	};
})();
