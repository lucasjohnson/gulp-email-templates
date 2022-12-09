const browserSync = require("browser-sync").create();
const gulp = require("gulp");
const inky = require("inky");
const inlineCss = require("gulp-inline-css");
const sass = require("gulp-sass")(require("sass"));
const rename = require("gulp-rename");
const replace = require("gulp-replace");

const baseDir = "./dist";

gulp.task("scss", function() {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("./src/css"));
});

gulp.task("html", function() {
  return gulp
    .src("src/templates/**/*.html")
    .pipe(replace(new RegExp("/sass/(.+).scss", "ig"), "/css/$1.css"))
    .pipe(inky())
    .pipe(inlineCss())
    .pipe(rename({ dirname: "" }))
    .pipe(gulp.dest("dist"));
});

gulp.task("browserSync", function() {
  return browserSync.init({
    server: { baseDir: baseDir }
  });
});

gulp.task("reloadBrowserSync", function() {
  return browserSync.reload();
});

gulp.task("watch", function() {
  gulp.watch("./src/scss/**/*.scss", gulp.series("scss"));
  gulp.watch("./src/templates/**/*.html", gulp.series("html"));
});

gulp.task("default", gulp.parallel("watch", "browserSync"));
