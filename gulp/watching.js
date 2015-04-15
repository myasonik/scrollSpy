var $ = require('./common.js');
var config = require('./config.js');

var browserSync = require('browser-sync');

$.gulp.task('watching', function() {
    browserSync({
        server: {
            baseDir: config.dest,
            middleware: function(req, res, next) {
                if (config.extensionlessRoutes) {
                    if (req.url.indexOf('.') < 1) {
                        req.url += '.html';
                    }
                }

                return next();
            }
        },
        notify: false,
        open: false
    });

    $.gulp.watch(config.src + 'jade/**/*.jade', ['templates', browserSync.reload]);
    $.gulp.watch(config.src + 'scss/**/*.scss', ['sass']);
    $.gulp.watch(config.src + 'imgs/**/*.{png,jpg,jpeg,gif,svg}', ['imgs']);
    $.gulp.watch(config.src + 'js/**/*.js', ['lint-js']);
    $.gulp.watch(config.watchDest, function(e) {
        $.gulp.src(e.path)
            .pipe(browserSync.reload({ stream:true }));
    });

});