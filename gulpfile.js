var gulp = require('gulp');
var babel = require('gulp-babel');
require("babel-polyfill");

gulp.task('scripts', function () {
	return gulp.src('src/superagent-jsonp.js')
		.pipe(babel())
		.pipe(gulp.dest('dist'));
});

gulp.task('default', ['scripts']);
