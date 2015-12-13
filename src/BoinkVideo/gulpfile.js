"use strict";

var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    sass = require("gulp-sass"),
    typescript = require("gulp-typescript");

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