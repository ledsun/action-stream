var gulp = require("gulp");
var babel = require("gulp-babel");

exports.babel = function() {
  return gulp.src("src/**/*.js", {
      base: "src"
    })
    .pipe(babel())
    .pipe(gulp.dest("."));
};

exports.copy = function() {
  return gulp.src("src/lib/defaultOption.json", {
      base: "src"
    })
    .pipe(gulp.dest("."));
}

exports.default = gulp.series(exports.babel, exports.copy);
