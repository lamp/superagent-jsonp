var gulp = require('gulp');
var babel = require('gulp-babel');
require("babel-polyfill");

gulp.task('default', function () {
    return gulp.src('src/superagent-jsonp.js')
        .pipe(babel())
        .pipe(gulp.dest('dist'));
});
