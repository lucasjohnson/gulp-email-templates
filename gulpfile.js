var gulp = require("gulp");
var inky = require("inky");

gulp.task("parse", function() {
  return gulp
    .src("src/templates/**/*.html")
    .pipe(inky())
    .pipe(gulp.dest("dist"));
});
