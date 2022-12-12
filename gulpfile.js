const autoprefixer = require("autoprefixer"),
  browserSync = require("browser-sync").create(),
  clean = require("gulp-clean"),
  gulp = require("gulp"),
  htmlmin = require("gulp-htmlmin"),
  inject = require("gulp-inject"),
  inky = require("inky"),
  inlineCss = require("gulp-inline-css"),
  litmus = require("gulp-litmus"),
  partialsRender = require("gulp-nunjucks-render"),
  sass = require("gulp-sass")(require("sass")),
  postcss = require("gulp-postcss"),
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

gulp.task("clean", function() {
  return gulp
    .src([baseDir, "./src/css", "./src/inky-templates"], { allowEmpty: true })
    .pipe(clean());
});

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
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        ignoreCustomComments: true,
        keepClosingSlash: true,
        collapseWhitespace: true,
        preserveLineBreaks: true
      })
    )
    .pipe(gulp.dest(baseDir))
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

gulp.task("index", function() {
  return gulp
    .src("./index.html")
    .pipe(
      inject(gulp.src(["dist/*.html"], { read: false }), {
        transform: function(filepath) {
          if (filepath.slice(-5) === ".html") {
            const renameFilePath = filepath.replace("/dist/", "");
            const fileName = renameFilePath.replace(".html", "");

            return (
              '<li><a href="' +
              renameFilePath +
              '">' +
              fileName[0].toUpperCase() +
              fileName.substring(1) +
              "</a></li>"
            );
          }

          return inject.transform.apply(inject.transform, arguments);
        }
      })
    )
    .pipe(gulp.dest(baseDir));
});

gulp.task("watch", function() {
  gulp.watch("./src/scss/**/*.scss", gulp.series("scss", "emails"));
  gulp.watch("./src/inky-templates/**/*.html", gulp.series("emails"));
  gulp.watch("./src/**/*.njk", gulp.series("partials"));
});

gulp.task("build", gulp.series("clean", "scss", "partials", "emails", "index"));
gulp.task("default", gulp.parallel("build", "watch", "browserSync"));
