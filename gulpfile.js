var gulp = require("gulp");
var babel = require("gulp-babel");

exports.default = function() {
  return gulp.src("src/**/*.mjs", {
      base: "src"
    })
    .pipe(babel())
    .pipe(gulp.dest("."));
};
