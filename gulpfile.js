const autoprefixer = require("autoprefixer"),
  browserSync = require("browser-sync").create(),
  gulp = require("gulp"),
  inky = require("inky"),
  inlineCss = require("gulp-inline-css"),
  nunjucksRender = require("gulp-nunjucks-render"),
  sass = require("gulp-sass")(require("sass")),
  postcss = require("gulp-postcss"),
  prettify = require("gulp-html-prettify"),
  removeEmptyLines = require("gulp-remove-empty-lines"),
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

gulp.task("nunjucks", function() {
  return gulp
    .src("src/emails/**/*.+(html|nunjucks|njk)")
    .pipe(
      nunjucksRender({
        path: ["src/layout"]
      })
    )
    .pipe(gulp.dest("./src/inky-templates"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task("emails", function() {
  return gulp
    .src("src/inky-templates/**/*.html")
    .pipe(replace(new RegExp("/sass/(.+).scss", "ig"), "/css/$1.css"))
    .pipe(inky())
    .pipe(inlineCss({ applyTableAttributes: true }))
    .pipe(prettify({ indent_char: " ", indent_size: 2 }))
    .pipe(removeEmptyLines())
    .pipe(rename({ dirname: "" }))
    .pipe(gulp.dest("dist"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task("watch", function() {
  gulp.watch("./src/scss/**/*.scss", gulp.series("scss", "emails"));
  gulp.watch("./src/inky-templates/**/*.html", gulp.series("emails"));
  gulp.watch("./src/**/*.njk", gulp.series("nunjucks"));
});

gulp.task("build", gulp.series("scss", "nunjucks", "emails"));
gulp.task("default", gulp.parallel("build", "watch", "browserSync"));
