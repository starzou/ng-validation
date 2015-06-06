/**
 * @class gulpfile
 * @description gulp 配置文件
 * @time 2015-06-06 16:31
 * @author StarZou
 **/

var gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

/**
 * angular-components.min.js
 */
gulp.task('default', function () {
    gulp.src('angular-validation.js')
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('./'));
});