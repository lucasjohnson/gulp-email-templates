const autoprefixer = require("autoprefixer"),
  browserSync = require("browser-sync").create(),
  gulp = require("gulp"),
  inky = require("inky"),
  inlineCss = require("gulp-inline-css"),
  sass = require("gulp-sass")(require("sass")),
  postcss = require("gulp-postcss"),
  rename = require("gulp-rename"),
  replace = require("gulp-replace");

const baseDir = "./dist";

gulp.task("browserSync", function() {
  browserSync.init({
    browser: ["google chrome"],
    server: {
      baseDir: baseDir
    }
  });
});

const postcssOptions = [autoprefixer()];

gulp.task("scss", function() {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(
      sass({
        outputStyle: "expanded",
        precision: 3,
        errLogToConsole: true
      })
    )
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss(postcssOptions))
    .pipe(gulp.dest("./src/css"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
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

gulp.task("watch", function() {
  gulp.watch("./src/scss/**/*.scss", gulp.series("scss"));
  gulp.watch("./src/templates/**/*.html", gulp.series("html"));
});

gulp.task("default", gulp.parallel("watch", "browserSync"));
