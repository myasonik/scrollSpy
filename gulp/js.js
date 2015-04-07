var $ = require('./common.js');
var config = require('./config.js');

var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var source = require('vinyl-source-stream');
var to5ify = require("babelify");
var watchify = require('watchify');
var streamify = require('gulp-streamify');
var browserify = require('browserify');
var collapse = require('bundle-collapser/plugin');

$.gulp.task('lint-js', function() {
	return $.gulp.src(config.src + 'js/**/*.js')
		.pipe(jshint())
		.pipe($.notify(function (file) {
			if (file.jshint.success) return false;
			var errors = file.jshint.results.map(function (data) {
				if (data.error) return '(' + data.error.line + ') ' + data.error.reason;
			}).join('\n');
			return file.relative + ' (' + file.jshint.results.length + ' errors)\n' + errors;
		}));
});

$.gulp.task('js', ['lint-js'], function() {
	function doBrowserify(b) {
		b.bundle()
			.on('error', $.notify.onError('<%= error.message %>'))
			.pipe(source('main.js'))
			.pipe($.should(config.prod, streamify(uglify())))
			.pipe($.should(config.prod, $.rename({ suffix: '.min' })))
			.pipe($.gulp.dest(config.dest));
	}

	var b = browserify({
				plugin: [collapse],
				transform: [to5ify],
				debug: !config.prod
			});

	if (config.watch) {
		b = watchify(b);
		b.on('update', function() {
			doBrowserify(b);
		});
	}

	b.add('./' + config.src + '/js/main.js')
	doBrowserify(b);
});