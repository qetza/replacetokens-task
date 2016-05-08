var gulp = require('gulp');
var gutil = require('gulp-util');
var debug = require('gulp-debug');
var del = require('del');
var merge = require('merge-stream');
var path = require('path');
var shell = require('shelljs');

var _buildRoot = path.join(__dirname, '_build');

gulp.task('default', ['build']);

gulp.task('build', ['clean'], function () {
    var extension = gulp.src(['docs/**/*', 'images/**/*', 'LICENSE.txt', 'vss-extension.json'], { base: '.' })
        .pipe(debug({title: 'extension:'}))
        .pipe(gulp.dest(_buildRoot));
    var task = gulp.src('task/**/*', { base: '.' })
        .pipe(debug({title: 'task:'}))
        .pipe(gulp.dest(_buildRoot));
    
    return merge(extension, task);
});

gulp.task('clean', function() {
   return del([_buildRoot]);
});

gulp.task('test', ['build'], function() {
});