"use strict";
const gulp = require("gulp");

const util = require("gulp-util");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const rev = require("gulp-rev");
const concat = require("gulp-concat");
const fs = require("fs-extra");
const ftp = require("vinyl-ftp");
const livereload = require("gulp-livereload");
const clone = require("gulp-clone");

const edicao = "xciv";

let CONFIG = { };


// server //////////////////////////////////////////////////////////////////////////////////////////
CONFIG.server = { };
CONFIG.server.host = "ftp.laguinho.org";

const credentials = JSON.parse(fs.readFileSync(".ftppass"));

let connection = ftp.create({
	host: CONFIG.server.host,
	user: credentials["username"],
	password: credentials["password"],
	parallel: 10,
	log: util.log
});


// paths ///////////////////////////////////////////////////////////////////////////////////////////
CONFIG.paths = { };

CONFIG.paths.development = { };
CONFIG.paths.development.repo = "./";
CONFIG.paths.development.dist = "./dist";
CONFIG.paths.development.staging = "./";

CONFIG.paths.production = { };
CONFIG.paths.production.assets = "/assets.laguinho.org/lista/" + edicao + "/";
CONFIG.paths.production.app = "/assets/lista/";

// urls
CONFIG.urls = { };
CONFIG.urls.assets = "https://assets.laguinho.org/lista/" + edicao + "/";

// colors
// html: magenta
// css: blue
// js: yellow
// pwa: gray


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
gulp.task("default", ["stage"]);
gulp.task("watch", ["watch-css", "watch-js", "watch-html", "watch-pwa"]);
gulp.task("stage", ["stage-css", "stage-js", "stage-html", "stage-pwa"]);
gulp.task("deploy-assets", ["deploy-css", "deploy-js", "deploy-pwa"]);
gulp.task("deploy", ["deploy-assets"], deployHTML);


////////////////////////////////////////////////////////////////////////////////////////////////////
// html ////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
const pug = require("gulp-pug");

CONFIG.html = { };
CONFIG.html.source = ["./pug/app.pug"];
CONFIG.html.watch = ["**/**.*"];

function stageHTML() {
	let assets = JSON.parse(fs.readFileSync("./pug/base/assets.json"));

	gulp.src(CONFIG.html.source)
		.pipe(plumber())

		.pipe(pug({
			"pretty": " ",
			"locals": {
				"env": "development",
				"edicao": edicao,
				"assets": assets
			}
		}))

		.pipe(rename({ basename: "lista" }))
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }))
		.pipe(gulp.dest(CONFIG.paths.development.staging, { mode: "0644" }));

	util.log(util.colors.magenta("HTML !!"));
}

function deployHTML() {
	// Pega o nome final (com hash) dos arquivos CSS e JS no rev-manifest
	// e coloca eles na lista de assets.
	let manifest = JSON.parse(fs.readFileSync("./rev-manifest.json", "utf8"));
	let assets = JSON.parse(fs.readFileSync("./pug/base/assets.json"));
	assets["assets"]["lista"]["production"]["href"] = CONFIG.urls.assets + manifest["lista.min.css"];
	assets["scripts"]["lista"]["production"]["src"] = CONFIG.urls.assets + manifest["lista.min.js"];

	// Extrai o hash do nome do arquivo JS para usar como nome de versão no Sentry
	let release = manifest["lista.min.js"].replace("lista-", "").replace(".min.js", "");

	// Determina qual o ambiente para o deploy (development ou production).
	// Por segurança, só vai ter production se for passado o parâmetro "--prod".
	// Em todos os outros casos é development.
	let env = (process.argv.includes("--prod")? "production" : "development");

	// Começa o procedimento de deploy!
	gulp.src(CONFIG.html.source)
		.pipe(plumber())

		// Processa o Pug para gerar o HTML final, minificado
		.pipe(pug({
			"pretty": false,
			"locals": {
				"env": "production",
				"edicao": edicao,
				"assets": assets,
				"release": release
			}
		}))

		// Renomeia o HTML conforme o ambiente e muda a extensão para PHP
		.pipe(rename({
			basename: (env === "production"? "app" : "app-preview"),
			extname: ".php"
		}))

		// Finalmente, envia o arquivo para o servidor
		.pipe(connection.dest(CONFIG.paths.production.app))

	util.log(util.colors.magenta("HTML !!"));
}

gulp.task("stage-html", stageHTML);
gulp.task("watch-html", function() { gulp.watch(CONFIG.html.watch, { cwd: "./pug/" }, stageHTML); });
gulp.task("deploy-html", deployHTML);


////////////////////////////////////////////////////////////////////////////////////////////////////
// css /////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
const sass = require("gulp-sass");
const groupMediaQueries = require("gulp-group-css-media-queries");
const cssnano = require("gulp-cssnano");

CONFIG.css = { };
CONFIG.css.source = ["./scss/app.scss"];
CONFIG.css.watch = ["**/**.scss", "**/**.sass"];

function buildCSS() {
	let css = gulp.src(CONFIG.css.source)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(rename({ basename: "lista" }))
		.pipe(sass({ outputStyle: "expanded" }));

	return css;
}

function buildProductionCSS(css) {
	let production = css.pipe(clone())
		.pipe(groupMediaQueries())
		.pipe(cssnano({ autoprefixer: { add: true, browsers: ["> 1%"] }, zindex: true }))
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }));

	return production;
}

function stageCSS() {
	let css = buildCSS();

	let reference = css.pipe(clone())
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }));

	let development = css.pipe(clone())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(CONFIG.paths.development.staging + "/assets", { mode: "0644" }));

	let production = buildProductionCSS(css);

	util.log(util.colors.blue("CSS !!"));
	return development.pipe(livereload( { quiet: true }));
}

function deployCSS() {
	let css = buildCSS();

	let production = buildProductionCSS(css)
		.pipe(rev())
		.pipe(connection.dest(CONFIG.paths.production.assets))
		.pipe(rev.manifest({ merge: true }))
		.pipe(gulp.dest(CONFIG.paths.development.repo, { mode: "0644" }));

	util.log(util.colors.blue("CSS !!"));
}

gulp.task("stage-css", stageCSS);
gulp.task("watch-css", function() { livereload.listen(); gulp.watch(CONFIG.css.watch, { cwd: "./scss/" }, stageCSS); });
gulp.task("deploy-css", deployCSS);


////////////////////////////////////////////////////////////////////////////////////////////////////
// js //////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const sentry = require("gulp-sentry-release")({
	API_URL: "https://sentry.io/api/0/projects/laguinho/lista/",
	API_KEY: "d3bddc4f334b4d66a8151ed592fa90a4093c6b402cfa40cbb66351820b12a39a"
});

CONFIG.js = { };
CONFIG.js.source = JSON.parse(fs.readFileSync("./js/modules.json"));
CONFIG.js.watch = ["**/**.js"];

// Junta todos os arquivos JS num só
function bundleJS() {
	let js = gulp.src(CONFIG.js.source)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(concat("lista.js"))

	return js;
}

function compileJS(js) {
	let compiled = js.pipe(clone())
		.pipe(babel({ presets: ["es2015"] }));

	return compiled;
}

function buildJS(js) {
	let production = js.pipe(clone())
		.pipe(uglify())
		.pipe(rename({ suffix: ".min" }));

	return production;
}

function stageJS() {
	let js = bundleJS();
	let compiled = compileJS(js);

	// Arquivo de referência
	// Só concatenado, sem nenhum processamento
	let reference = js.pipe(clone())
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }));

	// Arquivo de desenvolvimento
	// Processado pelo Babel e com sourcemap
	let development = compiled.pipe(clone())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(CONFIG.paths.development.staging + "/assets", { mode: "0644" }));

	// Arquivo de produção
	// Processado pelo Babel e minificado
	let production = buildJS(compiled)
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }));

	util.log(util.colors.yellow("JS !!"));
}

function deployJS() {
	let js = bundleJS();
	let compiled = compileJS(js);
	let production = buildJS(compiled);

	// Envia para o servidor
	production.pipe(clone())
		.pipe(rev())
		.pipe(connection.dest(CONFIG.paths.production.assets))
		.pipe(rev.manifest({ merge: true }))
		.pipe(gulp.dest(CONFIG.paths.development.repo, { mode: "0644" }));

	// Envia para o Sentry
	let manifest = JSON.parse(fs.readFileSync("./rev-manifest.json", "utf8"));
	let release = manifest["lista.min.js"].replace("lista-", "").replace(".min.js", "");

	production.pipe(clone())
		.pipe(sourcemaps.write())
		.pipe(sentry.release(release));

	gulp.src(CONFIG.js.source)
		.pipe(sentry.release(release));

	util.log(util.colors.yellow("JS !!"));
}

gulp.task("stage-js", stageJS);
gulp.task("watch-js", function() { gulp.watch(CONFIG.js.watch, { cwd: "./js/" }, stageJS); });
gulp.task("deploy-js", deployJS);


////////////////////////////////////////////////////////////////////////////////////////////////////
// manifest & service worker ///////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
CONFIG.pwa = { };
CONFIG.pwa.source = ["./manifest.json", "./service-worker.js"];
CONFIG.pwa.watch = CONFIG.pwa.source;

function stagePWA() {
	// gulp.src(CONFIG.pwa.source)
	// 	.pipe(gulp.dest(CONFIG.paths.development.staging, { mode: "0644" }));

	util.log(util.colors.gray("PWA !!"));
}

function deployPWA() {
	// gulp.src(CONFIG.pwa.source)
	// 	.pipe(gulp.dest(CONFIG.paths.development.staging, { mode: "0644" }));

	util.log(util.colors.gray("PWA !!"));
}

gulp.task("stage-pwa", stagePWA);
gulp.task("watch-pwa", function() { gulp.watch(CONFIG.pwa.watch, stagePWA); });
gulp.task("deploy-pwa", deployPWA);
