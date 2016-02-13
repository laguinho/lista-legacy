(function() {
	"use strict";
	var gulp = require("gulp");

	// tools
	var util = require("gulp-util");
	var plumber = require("gulp-plumber");
	var rename = require("gulp-rename");
	var sourcemaps = require("gulp-sourcemaps");
	var rev = require("gulp-rev");
	var concat = require("gulp-concat");
	var fs = require("fs");
	var sftp = require("gulp-sftp");

	// config
	var CONFIG = { };

	CONFIG.server = { };
	CONFIG.server.host = "ftp.laguinho.org";
	CONFIG.server.remotePath = "/";

	CONFIG.path = { };
	CONFIG.path.repo = "./";
	CONFIG.path.dist = "./dist";
	CONFIG.path.staging = "./public";
	CONFIG.path.assets = "/home/laguinho/assets.laguinho.org/lista/xc/";
	CONFIG.path.production = "/home/laguinho/laguinho.org/";

	////////////////////////////////////////////////////////////////////////////////////////////////
	// tasks ///////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////
	gulp.task("default", ["stage"]);
	gulp.task("watch", ["watch-css", "watch-js", "watch-html"]);
	gulp.task("stage", ["stage-css", "stage-js"], stageHTML);
	gulp.task("deploy", ["deploy-css", "deploy-js"], deployHTML);
	gulp.task("deploy-assets", ["deploy-css", "deploy-js"]);

	// css
	CONFIG.css = { };
	CONFIG.css.source = ["./scss/reserva.scss"];
	CONFIG.css.watch = ["./scss/**.scss", "./scss/**.sass"];

	var sass = require("gulp-scss");
	var groupMediaQueries = require("gulp-group-css-media-queries");
	var cssnano = require("gulp-cssnano");

	function stageCSS() {
		gulp.src(CONFIG.css.source)
			.pipe(plumber())
			.pipe(sourcemaps.init())

			.pipe(sass())
			.pipe(groupMediaQueries())
			// .pipe(sass())

			// source file
			.pipe(gulp.dest(CONFIG.path.dist, { mode: "0644" }))

			// minified file
			.pipe(cssnano({ autoprefixer: { add: true, browsers: ["> 1%"] }, zindex: true }))
			.pipe(rename({ suffix: ".min" }))
			.pipe(gulp.dest(CONFIG.path.dist, { mode: "0644" }))

			// minified file with sourcemap
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(CONFIG.path.staging + "/assets", { mode: "0644" }));

		util.log(util.colors.bgCyan.bold("CSS") + util.colors.cyan(" compiled"));
	}

	function deployCSS() {
		CONFIG.server.remotePath = CONFIG.path.assets;
		gulp.src(CONFIG.css.source)
			.pipe(plumber())

			.pipe(sass())
			.pipe(groupMediaQueries())

			// minified file
			.pipe(cssnano({ autoprefixer: { add: true, browsers: ["> 1%"] }, zindex: true }))
			.pipe(rename({ suffix: ".min" }))
			.pipe(gulp.dest(CONFIG.path.dist, { mode: "0644" }))
			.pipe(rev())
			.pipe(sftp({ host: CONFIG.server.host, remotePath: CONFIG.server.remotePath, auth: "laguinho" }))

			// rev manifest
			.pipe(rev.manifest({ merge: true }))
			.pipe(gulp.dest(CONFIG.path.repo, { mode: "0644" }));

		util.log(util.colors.bgCyan.bold("CSS") + util.colors.cyan(" deployed"));
	}

	gulp.task("stage-css", stageCSS);
	gulp.task("watch-css", function() { gulp.watch(CONFIG.css.watch, stageCSS); });
	gulp.task("deploy-css", deployCSS);

	// js
	CONFIG.js = { };
	CONFIG.js.source = ["./js/**.js"];
	CONFIG.js.watch = CONFIG.js.source;
	CONFIG.server.remotePath = CONFIG.path.assets;

	var babel = require("gulp-babel");
	var uglify = require("gulp-uglify");

	function stageJS() {
		gulp.src(CONFIG.js.source)
			.pipe(plumber())
			.pipe(sourcemaps.init())

			.pipe(concat("reserva.js"))
			.pipe(babel())

			// source file
			.pipe(gulp.dest(CONFIG.path.dist, { mode: "0644" }))

			// minified file
			.pipe(uglify())
			.pipe(rename({ suffix: ".min" }))
			.pipe(gulp.dest(CONFIG.path.dist, { mode: "0644" }))

			// minified file with sourcemap
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(CONFIG.path.staging + "/assets", { mode: "0644" }));

		util.log(util.colors.bgBlue.bold("JS") + util.colors.blue(" compiled"));
	}

	function deployJS() {
		CONFIG.server.remotePath = CONFIG.path.assets;
		gulp.src(CONFIG.js.source)
			.pipe(plumber())

			.pipe(concat("reserva.js"))
			.pipe(babel())

			// minified file
			.pipe(uglify())
			.pipe(rename({ suffix: ".min" }))
			.pipe(gulp.dest(CONFIG.path.dist, { mode: "0644" }))
			.pipe(rev())
			.pipe(sftp({ host: CONFIG.server.host, remotePath: CONFIG.server.remotePath, auth: "laguinho" }))

			// rev manifest
			.pipe(rev.manifest({ merge: true }))
			.pipe(gulp.dest(CONFIG.path.repo, { mode: "0644" }));

		util.log(util.colors.bgBlue.bold("JS") + util.colors.blue(" compiled"));
	}

	gulp.task("stage-js", stageJS);
	gulp.task("watch-js", function() { gulp.watch(CONFIG.js.watch, stageJS); });
	gulp.task("deploy-js", deployJS);

	// html
	CONFIG.html = { };
	CONFIG.html.source = ["./index.hbs"];
	CONFIG.html.watch = CONFIG.html.source;
	CONFIG.server.remotePath = CONFIG.path.production;

	var handlebars = require("gulp-compile-handlebars");

	function stageHTML() {
		var manifest = {
			"reserva.min.css": "reserva.min.css",
			"reserva.min.js": "reserva.min.js"
		};
		var handlebarOptions = {
			helpers: {
						assetPath: function(path, context) {
								return ["/assets", context.data.root[path]].join("/");
						}
				}
		};

		gulp.src(CONFIG.html.source)
			.pipe(plumber())

			.pipe(handlebars(manifest, handlebarOptions))

			.pipe(rename("app.php"))
			.pipe(gulp.dest(CONFIG.path.repo, { mode: "0644" }))
			.pipe(gulp.dest(CONFIG.path.staging, { mode: "0644" }));

			util.log(util.colors.bgWhite.bold("HTML") + util.colors.white.underline(" compiled"));
	}

	function deployHTML() {
		var manifest = JSON.parse(fs.readFileSync("./rev-manifest.json", "utf8"));
		var handlebarOptions = {
			helpers: {
				assetPath: function (path, context) {
					return ["//assets.laguinho.org/lista/xc", context.data.root[path]].join("/");
				}
			}
		};

		CONFIG.server.remotePath = CONFIG.path.production;
		gulp.src(CONFIG.html.source)
			.pipe(plumber())

			.pipe(handlebars(manifest, handlebarOptions))

			.pipe(rename("app.php"))
			.pipe(sftp({ host: CONFIG.server.host, remotePath: CONFIG.server.remotePath, auth: "laguinho" }));

		util.log(util.colors.bgWhite.bold("HTML") + util.colors.white.underline(" deployed"));
	}

	gulp.task("stage-html", stageHTML);
	gulp.task("watch-html", function() { gulp.watch(CONFIG.html.watch, stageHTML); });
	gulp.task("deploy-html", deployHTML);

}());
