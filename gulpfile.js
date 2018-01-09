const gulp = require('gulp');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');

require('babel-polyfill');

// Lint Task
gulp.task('lint', () => {
  gulp.src(['src/*.js', 'test/*.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

// Assemble script
gulp.task('scripts', () => {
  gulp.src('src/superagent-jsonp.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['lint', 'scripts']);
