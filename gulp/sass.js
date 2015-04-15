var $ = require('./common.js');
var config = require('./config.js');

var sass = require('gulp-ruby-sass');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');

$.gulp.task('sass', function() {
    var postpros = [ require('autoprefixer-core')({'browsers': '> 0%'}) ];
    
    if (config.prod) {
        postpros.push(
            require('css-mqpacker'),
            require('csswring')({ preserveHacks: true, removeAllComments: true })
        );
    }

    sass(config.src + 'scss/main.scss', {
        sourcemap: !config.prod,
        style: 'expanded',
        precision: 4,
        loadPath: ['./node_modules', './git_submodules']
    })
        .on('error', $.notify.onError('<%= error.message %>'))
        .pipe(postcss(postpros))
        .pipe($.should(config.prod, $.rename({ suffix: '.min' })))
        .pipe($.should(!config.prod,sourcemaps.write()))
        .pipe($.gulp.dest(config.dest));
});