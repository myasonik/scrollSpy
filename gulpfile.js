var gulp = require('gulp');
var requireDir = require('require-dir');
var config = require('./gulp/config.js');

requireDir('./gulp/', { recurse: true });

gulp.task('clean', require('del').bind(null, [config.dest + '**/*', '!.*']));

gulp.task('default', ['clean'], function() {
	gulp.start('sass', 'imgs', 'js', 'templates');
});

gulp.task('prod', function() {
	config.prod = true; 
	gulp.start('default');
});

gulp.task('watch', function() {
	config.watch = true;
	gulp.start('js', 'watching');
});