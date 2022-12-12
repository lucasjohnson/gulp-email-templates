const autoprefixer = require("autoprefixer"),
  browserSync = require("browser-sync").create(),
  gulp = require("gulp"),
  inky = require("inky"),
  inlineCss = require("gulp-inline-css"),
  litmus = require("gulp-litmus"),
  partialsRender = require("gulp-nunjucks-render"),
  sass = require("gulp-sass")(require("sass")),
  postcss = require("gulp-postcss"),
  prettify = require("gulp-html-prettify"),
  removeEmptyLines = require("gulp-remove-empty-lines"),
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

gulp.task("partials", function() {
  return gulp
    .src("src/emails/**/*.njk")
    .pipe(
      partialsRender({
        path: ["src/partials"]
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
    .pipe(gulp.dest("dist"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

gulp.task("litmus", function() {
  return gulp.src("dist/**/*.html").pipe(
    litmus({
      username: "litmus_username",
      password: "litmus_password",
      url: "https://yourcompany.litmus.com",
      // https://yourcompany.litmus.com/clients.xml
      applications: [
        "applemail6",
        "gmailnew",
        "ffgmailnew",
        "chromegmailnew",
        "iphone4s"
      ]
    })
  );
});

gulp.task("watch", function() {
  gulp.watch("./src/scss/**/*.scss", gulp.series("scss", "emails"));
  gulp.watch("./src/inky-templates/**/*.html", gulp.series("emails"));
  gulp.watch("./src/**/*.njk", gulp.series("partials"));
});

gulp.task("build", gulp.series("scss", "partials", "emails"));
gulp.task("default", gulp.parallel("build", "watch", "browserSync"));
