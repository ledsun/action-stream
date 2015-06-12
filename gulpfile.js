var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task("babel", function() {
  return gulp.src("src/**/*.js", {
      base: "src"
    })
    .pipe(babel())
    .pipe(gulp.dest("."));
});

gulp.task("copy", function() {
  return gulp.src("src/lib/defaultOption.json", {
      base: "src"
    })
    .pipe(gulp.dest("."));
});

gulp.task("default", ["babel", "copy"])
