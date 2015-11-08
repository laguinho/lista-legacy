<!DOCTYPE html>
<html class="wf-inactive">
<head>

<meta charset="utf-8">
<title>EC2 CAMPEÃ</title>

<meta name="viewport" content="user-scalable = no, width = device-width, initial-scale = 1, minimal-ui">
<meta name="mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#455a64">

<link rel="stylesheet" href="/assets/irvin.min.css">
<link rel="shortcut icon" href="//assets.laguinho.org/logo/32px.png">
<link rel="manifest" href="/manifest.json">

</head>

<body>

<!-- home view -->
<header id="appbar" class="home-appbar appbar">
	<div class="container home-container">
		<h1 class="title">Lista de Tarefas</h1>
		<a class="sidenav-trigger" href="#"><i class="material-icons">&#xE5D2;</i></a>
	</div>
</header>

<nav id="sidenav">
	<header>
		<img class="logo" src="//assets.laguinho.org/laguinho.svg">
	</header>
	<section class="sort-navigation">
		<h1>Ordenar por</h1>
		<ul class="level-1 js-stream-sort">
			<li><a href="#" class="active" data-sort-by="date"><i class="material-icons">&#xE5CA;</i>Última postagem</a></li>
			<li><a href="#" data-sort-by="tarefa"><i class="material-icons">&#xE5CA;</i>Número da tarefa</a></li>
		</ul>
	</section>
	<section class="secondary-navigation">
		<ul class="level-1">
			<li><a href="https://twitter.com/listadetarefas" target="_blank">Twitter<i class="material-icons">&#xE879;</i></a></li>
			<li><a href="#" class="login-button js-login-trigger">Login</a></li>
			<li><a href="#" class="logout-button js-logout-trigger">Logout</a></li>
		</ul>
	</section>
</nav>

<main>
	<div class="container home-container">
		<div class="scoreboard scoreboard-stream">
			<ul>
				<template id="scoreboard-team">
					<li class="fill" data-fill-attr="class" data-fill-field="turma">
						<div class="bar turma-background fill" data-fill-attr="style" data-fill-field="barra">
							<div class="turma-text">
								<strong class="fill" data-fill-field="turma-formatada"></strong>
								<span class="points fill" data-fill-field="pontos"></span>
							</div>
						</div>
					</li>
				</template>
			</ul>
		</div>
		<ul id="stream"></ul>
		<div class="end"></div>
	</div>
	<div class="loading in fade fade-in"></div>
</main>

<!-- other views -->
<article id="tarefa" class="app-view"></article>

<aside id="new-post" class="app-view"></aside>

<aside id="login" class="app-view">
	<header class="appbar">
		<div class="container modal-container">
			<a class="back" href="/"><i class="material-icons">&#xE5C4;</i></a>
			<h1>Login</h1>
		</div>
	</header>
	<div class="container modal-container">
		<form method="post" action="/tarefas/login">
			<div class="form-group">
				<input type="email" name="email" placeholder="E-mail">
				<input type="password" name="password" placeholder="Senha">
			</div>
			<button class="btn btn-primary">Login</button>
		</form>
	</div>
</aside>

<!-- templates -->
<template id="card-tarefa">
	<li class="card tarefa">
		<a href="#" class="fill" data-fill-attr="href" data-fill-field="url">
			<div class="header">
				<div class="numero">Tarefa <span class="fill" data-fill-field="numero"></span></div>
				<div class="titulo fill" data-fill-field="titulo"></div>
				<time class="last-modified fill" data-fill-field="ultima-postagem"></time>
			</div>
			<div class="media media-wrapper fill" data-fill-field="imagem-aspecto" data-fill-attr="style">
				<img class="fill" data-fill-field="imagem-url" data-fill-attr="src">
			</div>
			<div class="body">
				<p class="descricao fill" data-fill-field="descricao"></p>
				<p class="pontuacao fill" data-fill-field="pontuacao"></p>
			</div>
			<ul class="grid"></ul>
		</a>
	</li>
</template>

<template id="tile-image">
	<li class="fill" data-fill-field="modifier" data-fill-attr="class">
		<div class="media-placeholder">
			<div class="tile tile-image fill" data-fill-field="preview" data-fill-attr="style"></div>
			<div class="tile tile-more fill" data-fill-field="more"></div>
			<div class="tile tile-play">
				<i class="material-icons">&#xE037;</i>
			</div>
		</div>
	</li>
</template>

<template id="tile-text">
	<li class="fill" data-fill-field="modifier" data-fill-attr="class">
		<div class="media-placeholder">
			<div class="tile tile-text fill" data-fill-field="preview"></div>
			<div class="tile tile-more fill" data-fill-field="more"></div>
		</div>
	</li>
</template>

<template id="view-tarefa">
	<header class="appbar">
		<div class="container view-container">
			<a class="back" href="/tarefas"><i class="material-icons">&#xE5C4;</i></a>
			<h1 class="numero fill" data-fill-field="titulo"></h1>
		</div>
	</header>
	<div class="body">
		<div class="container view-container">
			<div class="meta"></div>
			<div class="scoreboard scoreboard-tarefa">
				<ul></ul>
			</div>
			<div class="posts">
				<ul></ul>
				<div class="end"></div>
			</div>
		</div>
	</div>
	<button class="fab fab-bottom user-background new-post js-new-post-trigger" title="Novo post"><i class="material-icons">&#xE145;</i></button>
	<aside class="new-post-sheet" style="display: none;">
		<h1>Postar</h1>
		<ul>
			<li><a href="#" data-post-type="photo"><i class="material-icons">insert_photo</i>Foto</a></li>
			<li><a href="#" data-post-type="video"><i class="material-icons">movie</i>Vídeo</a></li>
			<li><a href="#" data-post-type="vine"><i class="fa fa-vine"></i>Vine</a></li>
			<li><a href="#" data-post-type="text"><i class="material-icons">text_format</i>Texto</a></li>
			<!--<li class="divider"><a href="#" data-post-type="camera"><i class="material-icons">photo_camera</i>Câmera</a></li>-->
		</ul>
	</aside>
</template>

<template id="view-tarefa-post-card">
	<li class="card card-l post">
		<div class="header fill" data-fill-field="turma" data-fill-attr="class">
			<div class="autor fill" data-fill-field="autor"></div>
			<div class="data fill" data-fill-field="data-de-postagem-formatada"></div>
			<div class="turma turma-background fill" data-fill-field="turma-formatada"></div>
		</div>
		<div class="body">
			<ul class="media"></ul>
			<div class="caption fill" data-fill-field="legenda"></div>
			<div class="result">
				<div class="status-indicator fill" data-fill-field="status-class" data-fill-attr="class">
					<span class="status-icon turma-text fill" data-fill-field="status-icon"></span>
					<span class="status-text turma-text fill" data-fill-field="status"></span>
				</div>
				<div class="message fill" data-fill-field="mensagem"></div>
			</div>
		</div>
	</li>
</template>

<template id="media-photo">
	<li>
		<div class="media-wrapper fill" data-fill-field="padding-aspecto" data-fill-attr="style">
			<a href="#" target="_blank" class="fill" data-fill-field="link-original" data-fill-attr="href">
				<img class="fill" data-fill-field="default" data-fill-attr="src">
			</a>
		</div>
	</li>
</template>

<template id="media-video">
	<li>
		<div class="media-wrapper fill" data-fill-field="padding-aspecto" data-fill-attr="style">
			<iframe class="fill" data-fill-field="embed" data-fill-attr="src" frameborder="0" allowfullscreen></iframe>
		</div>
	</li>
</template>

<!-- new post templates -->
<template id="new-post-photo">
	<header class="appbar user-background">
		<div class="container modal-container">
			<a class="back" href="/"><i class="material-icons">&#xE5C4;</i></a>
			<a class="submit disabled" href="/">Enviar</a>
			<h1>Postar foto</h1>
		</div>
	</header>
	<div class="body">
		<div class="container modal-container">
			<form method="post" action="/-/lista/novo" enctype="multipart/form-data">
				<input type="hidden" name="action" value="post">
				<input type="hidden" name="edition" value="xc">
				<input type="hidden" name="tarefa" value="" class="fill" data-fill-field="numero" data-fill-attr="value">
				<input type="hidden" name="user" value="" class="fill" data-fill-field="user" data-fill-attr="value">
				<input type="hidden" name="turma" value="" class="fill" data-fill-field="turma" data-fill-attr="value">
				<input type="hidden" name="token" value="" class="fill" data-fill-field="token" data-fill-attr="value">

				<input type="hidden" name="type" value="imagem">
				<input type="file" name="file[]" multiple accept="image/*" id="form-file" style="display: none;">

				<div id="dropzone">
					<ul id="board"></ul>
					<label class="file-placeholder" for="form-file"><i class="material-icons">photo_library</i>Selecionar imagens&hellip;</label>
				</div>
				<p style="margin-bottom: 16px;">Segure e arraste as imagens para reordená-las</p>

				<textarea class="text-field user-border-focus" name="caption" placeholder="Legenda (diga quem aparece nas fotos, quem ajudou a fazer a tarefa, etc.)"></textarea>
			</form>
		</div>
	</div>
</template>

<template id="new-post-video">
	<header class="appbar user-background">
		<div class="container modal-container">
			<a class="back" href="/"><i class="material-icons">&#xE5C4;</i></a>
			<a class="submit disabled" href="/">Enviar</a>
			<h1>Postar vídeo</h1>
		</div>
	</header>
	<div class="body">
		<div class="container modal-container">
			<form method="post" action="/-/lista/novo">
				<input type="hidden" name="action" value="post">
				<input type="hidden" name="edition" value="xc">
				<input type="hidden" name="tarefa" value="" class="fill" data-fill-field="numero" data-fill-attr="value">
				<input type="hidden" name="user" value="" class="fill" data-fill-field="user" data-fill-attr="value">
				<input type="hidden" name="turma" value="" class="fill" data-fill-field="turma" data-fill-attr="value">
				<input type="hidden" name="token" value="" class="fill" data-fill-field="token" data-fill-attr="value">
				<input type="hidden" name="type" value="media">

				<div class="form-field">
					<label for="form-media-url">Faça upload no vídeo no YouTube ou no Vimeo e cole o link abaixo</label>
					<label for="form-media-url" class="media-preview js-media-preview"></label>
					<input id="form-media-url" class="text-field user-border-focus js-media-url-input" type="text" name="url" value="" placeholder="https://" autocomplete="off">
					<input class="js-media-provider" type="hidden" name="media-provider">
					<input class="js-media-id" type="hidden" name="media-id">
					<input class="js-media-thumbnail" type="hidden" name="media-thumbnail">
				</div>
				<div class="form-field">
					<label for="form-caption">Legenda</labe>
					<textarea id="form-caption" class="text-field user-border-focus js-caption-input" name="caption" placeholder="Fale sobre quem participou e como foi a realização da tarefa, para que a gente possa conhecer vocês melhor. Diga quem filmou, quem editou etc."></textarea>
				</div>
			</form>
		</div>
	</div>
</template>

<template id="new-post-vine">
	<header class="appbar user-background">
		<div class="container modal-container">
			<a class="back" href="/"><i class="material-icons">&#xE5C4;</i></a>
			<a class="submit disabled" href="/">Enviar</a>
			<h1>Postar Vine</h1>
		</div>
	</header>
	<div class="body">
		<div class="container modal-container">
			<form method="post" action="/-/lista/novo">
				<input type="hidden" name="action" value="post">
				<input type="hidden" name="edition" value="xc">
				<input type="hidden" name="tarefa" value="" class="fill" data-fill-field="numero" data-fill-attr="value">
				<input type="hidden" name="user" value="" class="fill" data-fill-field="user" data-fill-attr="value">
				<input type="hidden" name="turma" value="" class="fill" data-fill-field="turma" data-fill-attr="value">
				<input type="hidden" name="token" value="" class="fill" data-fill-field="token" data-fill-attr="value">
				<input type="hidden" name="type" value="media">

				<div class="form-field">
					<label for="form-media-url">Cole o link abaixo</label>
					<label for="form-media-url" class="media-preview js-media-preview"></label>
					<input id="form-media-url" class="text-field user-border-focus js-media-url-input" type="text" name="url" placeholder="https://vine.co/v/" autocomplete="off">
					<input class="js-media-provider" type="hidden" name="media-provider">
					<input class="js-media-id" type="hidden" name="media-id">
					<input class="js-media-thumbnail" type="hidden" name="media-thumbnail">
				</div>
				<div class="form-field">
					<label for="form-caption">Legenda</labe>
					<textarea id="form-caption" class="text-field user-border-focus js-caption-input" name="caption" placeholder="Fale sobre quem participou e como foi a realização da tarefa, para que a gente possa conhecer vocês melhor. Diga quem atuou, quem filmou etc."></textarea>
				</div>
			</form>
		</div>
	</div>
</template>

<template id="new-post-text">
	<header class="appbar user-background">
		<div class="container modal-container">
			<a class="back" href="/"><i class="material-icons">&#xE5C4;</i></a>
			<a class="submit disabled" href="/">Enviar</a>
			<h1>Postar texto</h1>
		</div>
	</header>
	<div class="body">
		<div class="container modal-container">
			<form method="post" action="/-/lista/novo">
				<input type="hidden" name="action" value="post">
				<input type="hidden" name="edition" value="xc">
				<input type="hidden" name="tarefa" value="" class="fill" data-fill-field="numero" data-fill-attr="value">
				<input type="hidden" name="user" value="" class="fill" data-fill-field="user" data-fill-attr="value">
				<input type="hidden" name="turma" value="" class="fill" data-fill-field="turma" data-fill-attr="value">
				<input type="hidden" name="token" value="" class="fill" data-fill-field="token" data-fill-attr="value">

				<input type="hidden" name="type" value="texto">
				<textarea class="text-field user-border-focus js-text-input" name="caption" placeholder="Digite o texto aqui"></textarea>
			</form>
		</div>
	</div>
</template>

<!-- elements -->
<?php /* <div id="loading"><span></span></div> */ ?>
<div id="backdrop"></div>
<div id="bottom-sheet"></div>
<div id="toast">
	<span class="message"></span>
	<span class="action"></span>
</div>

<script>var autoload = <?= (is_numeric($_GET["tarefa"])? $_GET["tarefa"] : "false") ?>;</script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js" integrity="sha384-8gBf6Y4YYq7Jx97PIqmTwLPin4hxIzQw5aDmUg/DDhul9fFpbbLcLh3nTIIDJKhx" crossorigin="anonymous"></script>
<script src="https://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js" integrity="sha384-lN5TfD3NZM4jZQNnPZvggNwf0cQifyDyp09pFyiOrHXWNLOj43xGf2SnHO5K006r" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/2.2.2/isotope.pkgd.min.js" integrity="sha384-YeUZ6bm5HaV9hAVzDbZNHOf/1Dez0BMOoh2YzcFprAJAw6UEXThti5aeLOBJ922Z" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js" integrity="sha384-v7eExOYhwaHa3+GhP+lHytJsMcidazNdjiaggRhdbvVTVTCjweLpa23t37ZKxaCf" crossorigin="anonymous"></script>
<script src="https://platform.vine.co/static/scripts/embed.js"></script>
<script src="//assets.laguinho.org/libs/file-api/2.0.11/dist/FileAPI.min.js"></script>
<script src="//assets.laguinho.org/libs/file-api/2.0.11/plugins/FileAPI.exif.js"></script>
<script src="//assets.laguinho.org/libs/slip/1.2.0/slip.js"></script>
<script src="/assets/irvin.min.js"></script>

</body>
</html>