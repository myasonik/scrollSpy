var $ = require('./common.js');
var config = require('./config.js');

var imagemin = require('gulp-imagemin');

$.gulp.task('imgs', function() {
	$.gulp.src(config.src + 'imgs/**/*.{png,jpg,jpeg,gif,svg}')
		.pipe($.should(config.prod, imagemin({
			progressive: true,
			interlaced: true
		})))
		.pipe($.gulp.dest(config.dest + 'imgs'));
});