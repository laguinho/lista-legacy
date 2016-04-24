var gulp = require("gulp");

var util = require("gulp-util");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var sourcemaps = require("gulp-sourcemaps");
var rev = require("gulp-rev");
var concat = require("gulp-concat");
var fs = require("fs");
var sftp = require("gulp-sftp");

var edicao = JSON.parse(fs.readFileSync("./edicoes.json", "utf8"))["edicao-atual"];



////////////////////////////////////////////////////////////////////////////////////////////////////
// config //////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

var CONFIG = { };

// paths
CONFIG.paths = { };

CONFIG.paths.development = { };
CONFIG.paths.development.repo = "./";
CONFIG.paths.development.dist = "./dist/";
CONFIG.paths.development.staging = "./public/";
CONFIG.paths.development.assets = CONFIG.paths.development.staging + "/-/assets/";

CONFIG.paths.production = { };
CONFIG.paths.production.assets = "/home/laguinho/assets.laguinho.org/lista/" + edicao + "/";
CONFIG.paths.production.app = "/home/laguinho/" + edicao + ".laguinho.org/";

// server
CONFIG.server = { };
CONFIG.server.host = "ftp.laguinho.org";
CONFIG.server.remotePath = "/";

// urls
CONFIG.urls = { };
CONFIG.urls.assets = "https://assets.laguinho.org/lista/" + edicao + "/";



////////////////////////////////////////////////////////////////////////////////////////////////////
// default tasks ///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

gulp.task("default", ["stage"]);
gulp.task("watch", ["watch-css", "watch-js", "watch-html"]);
gulp.task("stage", ["stage-css", "stage-js"], stageHTML);
gulp.task("deploy", ["deploy-css", "deploy-js"], deployHTML);
gulp.task("deploy-assets", ["deploy-css", "deploy-js"]);



////////////////////////////////////////////////////////////////////////////////////////////////////
// css /////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

var sass = require("gulp-sass");
var groupMediaQueries = require("gulp-group-css-media-queries");
var cssnano = require("gulp-cssnano");

CONFIG.css = { };
CONFIG.css.source = ["./scss/app.sass"];
CONFIG.css.watch = ["./scss/**/**.sass", "./scss/**/**.scss"];

function stageCSS() {
	gulp.src(CONFIG.css.source)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(rename({ basename: "lista" }))

		.pipe(sass())
		.pipe(groupMediaQueries())

		// [DIST] source file
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }))

		// [DIST] minified file
		.pipe(cssnano({ autoprefixer: { add: true, browsers: ["> 1%"] }, zindex: true }))
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }))

		// [STAGING] minified file with sourcemap
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(CONFIG.paths.development.assets, { mode: "0644" }));

	util.log(util.colors.bgCyan.bold("CSS") + util.colors.cyan(" compiled"));
}

function deployCSS() {
	CONFIG.server.remotePath = CONFIG.paths.production.assets;

	gulp.src(CONFIG.css.source)
		.pipe(plumber())
		.pipe(rename({ basename: "lista" }))

		.pipe(sass())
		.pipe(groupMediaQueries())

		// [DIST] minified file
		.pipe(cssnano({ autoprefixer: { add: true, browsers: ["> 1%"] }, zindex: true }))
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }))

		.pipe(rev())
		.pipe(sftp({ host: CONFIG.server.host, remotePath: CONFIG.server.remotePath, auth: "laguinho" }))

		// rev manifest
		.pipe(rev.manifest({ merge: true }))
		.pipe(gulp.dest(CONFIG.paths.development.repo, { mode: "0644" }));

	util.log(util.colors.bgCyan.bold("CSS") + util.colors.cyan(" deployed"));
}

gulp.task("stage-css", stageCSS);
gulp.task("watch-css", function() { gulp.watch(CONFIG.css.watch, stageCSS); });
gulp.task("deploy-css", deployCSS);



////////////////////////////////////////////////////////////////////////////////////////////////////
// js //////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

var uglify = require("gulp-uglify");

CONFIG.js = { };
CONFIG.js.source = ["./js/**/**.js"];
CONFIG.js.watch = CONFIG.js.source;

function stageJS() {
	gulp.src(CONFIG.js.source)
		.pipe(plumber())
		.pipe(sourcemaps.init())

		.pipe(concat("lista.js"))

		// source file
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }))

		// minified file
		.pipe(uglify())
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }))

		// minified file with sourcemap
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(CONFIG.paths.development.assets, { mode: "0644" }));

	util.log(util.colors.bgBlue.bold("JS") + util.colors.blue(" compiled"));
}

function deployJS() {
	CONFIG.server.remotePath = CONFIG.paths.production.assets;

	gulp.src(CONFIG.js.source)
		.pipe(plumber())

		.pipe(concat("lista.js"))

		// minified file
		.pipe(uglify())
		.pipe(rename({ suffix: ".min" }))
		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }))

		.pipe(rev())
		.pipe(sftp({ host: CONFIG.server.host, remotePath: CONFIG.server.remotePath, auth: "laguinho" }))

		// rev manifest
		.pipe(rev.manifest({ merge: true }))
		.pipe(gulp.dest(CONFIG.paths.development.repo, { mode: "0644" }));

	util.log(util.colors.bgBlue.bold("JS") + util.colors.blue(" compiled"));
}

gulp.task("stage-js", stageJS);
gulp.task("watch-js", function() { gulp.watch(CONFIG.js.watch, stageJS); });
gulp.task("deploy-js", deployJS);



////////////////////////////////////////////////////////////////////////////////////////////////////
// html ////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

var jade = require("gulp-jade");

CONFIG.html = { };
CONFIG.html.source = ["./jade/app.jade"];
CONFIG.html.watch = ["./jade/**/**.jade"];

function stageHTML() {
	var assets = JSON.parse(fs.readFileSync("./assets.json"));

	gulp.src(CONFIG.html.source)
		.pipe(plumber())
		.pipe(rename({ basename: "lista" }))

		.pipe(jade({
			"pretty": " ",
			"locals": {
				"env": "development",
				"assets": assets
			}
		}))

		.pipe(gulp.dest(CONFIG.paths.development.dist, { mode: "0644" }))
		.pipe(gulp.dest(CONFIG.paths.development.staging, { mode: "0644" }));

		util.log(util.colors.bgWhite.bold("HTML") + util.colors.white.underline(" compiled"));
}

function deployHTML() {
	CONFIG.server.remotePath = CONFIG.paths.production.app;

	var manifest = JSON.parse(fs.readFileSync("./rev-manifest.json", "utf8"));
	var assets = JSON.parse(fs.readFileSync("./assets.json"));
	assets["lista-js"]["production"] = CONFIG.urls.assets + manifest["lista.min.js"];
	assets["lista-css"]["production"] = CONFIG.urls.assets + manifest["lista.min.css"];

	gulp.src(CONFIG.html.source)
		.pipe(plumber())
		.pipe(rename({ basename: "lista" }))

		.pipe(jade({
			"pretty": false,
			"locals": {
				"env": "production",
				"assets": assets
			}
		}))

		.pipe(sftp({ host: CONFIG.server.host, remotePath: CONFIG.server.remotePath, auth: "laguinho" }));

	util.log(util.colors.bgWhite.bold("HTML") + util.colors.white.underline(" deployed"));
}

gulp.task("stage-html", stageHTML);
gulp.task("watch-html", function() { gulp.watch(CONFIG.html.watch, stageHTML); });
gulp.task("deploy-html", deployHTML);
