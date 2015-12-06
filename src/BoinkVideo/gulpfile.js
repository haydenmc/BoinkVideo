/// <binding Clean='clean' />
"use strict";

var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    sass = require("gulp-sass"),
    typescript = require("gulp-typescript");

var paths = {
    webroot: "./wwwroot/",
    source: {},
    dest: {}
};

paths.source.html = "Client/index.html";
paths.dest.html = paths.webroot + "index.html";

gulp.task("clean:js", function (cb) {
    rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function (cb) {
    rimraf(paths.concatCssDest, cb);
});

gulp.task("clean", ["clean:js", "clean:css"]);

gulp.task("min:js", function () {
    return gulp.src([paths.js, "!" + paths.minJs], { base: "." })
        .pipe(concat(paths.concatJsDest))
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task("min:css", function () {
    return gulp.src([paths.css, "!" + paths.minCss])
        .pipe(concat(paths.concatCssDest))
        .pipe(cssmin())
        .pipe(gulp.dest("."));
});

gulp.task("html", function () {
    return gulp.src("Client/index.html").pipe(gulp.dest("wwwroot/"));
});

gulp.task("ts", function () {
    return gulp.src(["Client/Scripts/**/*.ts"]).pipe(typescript({ sortOutput: true })).pipe(concat("application.js")).pipe(gulp.dest("wwwroot/"));
});

gulp.task("js", function () {
    return gulp.src([
        "node_modules/webcomponents.js/webcomponents.js",
        "Client/Scripts/**/*.js",
        "!Client/Scripts/Components/**/*.js"
    ]).pipe(concat("libraries.js")).pipe(gulp.dest("wwwroot/"));
});

gulp.task("css", function () {
    return gulp.src(["Client/Styles/**/*.scss"]).pipe(sass()).pipe(concat("styles.css")).pipe(gulp.dest("wwwroot/"));
});

gulp.task("fonts", function () {
    return gulp.src(["Client/Fonts/*"]).pipe(gulp.dest("wwwroot/Fonts/"));
});

gulp.task("images", function () {
    return gulp.src(["Client/Images/*"]).pipe(gulp.dest("wwwroot/Images/"));
})

gulp.task("default", ["ts", "js", "css", "fonts", "images", "html"]);