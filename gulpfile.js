"use strict";
const gulp = require("gulp");

const util = require("gulp-util");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const rev = require("gulp-rev");
const concat = require("gulp-concat");
const fs = require("fs");
const sftp = require("gulp-sftp");
const livereload = require("gulp-livereload");
const clone = require("gulp-clone");

const edicao = "xciii";
const url = "cinquenta";

let CONFIG = { };


// server //////////////////////////////////////////////////////////////////////////////////////////
CONFIG.server = { };
CONFIG.server.host = "ftp.laguinho.org";
CONFIG.server.remotePath = "/";


// paths ///////////////////////////////////////////////////////////////////////////////////////////
CONFIG.paths = { };

CONFIG.paths.development = { };
CONFIG.paths.development.repo = "./";
CONFIG.paths.development.dist = "./dist";
CONFIG.paths.development.staging = "./";

CONFIG.paths.production = { };
CONFIG.paths.production.assets = "/home/laguinho/assets.laguinho.org/lista/" + edicao + "/";
CONFIG.paths.production.app = "/home/laguinho/assets/lista/";

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
	CONFIG.server.remotePath = CONFIG.paths.production.app;

	let manifest = JSON.parse(fs.readFileSync("./rev-manifest.json", "utf8"));
	let assets = JSON.parse(fs.readFileSync("./pug/base/assets.json"));
	assets["assets"]["lista"]["production"]["href"] = CONFIG.urls.assets + manifest["lista.min.css"];
	assets["scripts"]["lista"]["production"]["src"] = CONFIG.urls.assets + manifest["lista.min.js"];

	let release = manifest["lista.min.js"].replace("lista-", "").replace(".min.js", "");

	gulp.src(CONFIG.html.source)
		.pipe(plumber())

		.pipe(pug({
			"pretty": false,
			"locals": {
				"env": "production",
				"edicao": edicao,
				"assets": assets,
				"release": release
			}
		}))

		.pipe(rename({ basename: "app", extname: ".php" }))
		.pipe(sftp({
			host: CONFIG.server.host,
			remotePath: CONFIG.paths.production.app,
			auth: "laguinho"
		}));

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
	CONFIG.server.remotePath = CONFIG.paths.production.assets;

	let css = buildCSS();

	let production = buildProductionCSS(css)
		.pipe(rev())
		.pipe(sftp({ host: CONFIG.server.host, remotePath: CONFIG.server.remotePath, auth: "laguinho" }))
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
// const uglify = require("gulp-uglify");
const closure = require("gulp-closure-compiler-service");

CONFIG.js = { };
CONFIG.js.source = JSON.parse(fs.readFileSync("./js/modules.json"));
CONFIG.js.watch = ["**/**.js"];

function buildJS() {
	let js = gulp.src(CONFIG.js.source)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(concat("lista.js"))

	return js;
}

function buildProductionJS(js) {
	let production = js.pipe(clone())
		.pipe(babel())
		// .pipe(uglify())
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }));

	return production;
}

function stageJS() {
	let js = buildJS();

	let reference = js.pipe(clone())
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }));

	let development = js.pipe(clone())
		.pipe(babel())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(CONFIG.paths.development.staging + "/assets", { mode: "0644" }));

	let production = buildProductionJS(js);

	util.log(util.colors.yellow("JS !!"));
}

function deployJS() {
	CONFIG.server.remotePath = CONFIG.paths.production.assets;

	let js = buildJS();

	let production = buildProductionJS(js)
		.pipe(closure())
		.pipe(rev())
		.pipe(sftp({ host: CONFIG.server.host, remotePath: CONFIG.server.remotePath, auth: "laguinho" }))
		.pipe(rev.manifest({ merge: true }))
		.pipe(gulp.dest(CONFIG.paths.development.repo, { mode: "0644" }));

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
