var $ = require('./common.js');
var config = require('./config.js');

var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var to5ify = require("babelify");
var watchify = require('watchify');
var streamify = require('gulp-streamify');
var browserify = require('browserify');
var collapse = require('bundle-collapser/plugin');

$.gulp.task('lint-js', function() {
    return $.gulp.src(config.src + 'js/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe($.should(config.prod, eslint.failOnError()))
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