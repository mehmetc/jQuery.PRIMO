"use strict";
var fs          = require('fs');
var gulp        = require('gulp');
var uglify      = require('gulp-uglify');
var concat      = require('gulp-concat');
var jqc         = require('gulp-jquery-closure');
var del         = require('del');
var bump        = require('gulp-bump');
var template    = require('gulp-template');

var paths = {
    scripts: ['scripts/client/js/header.js', 'scripts/client/js/util.js', 'scripts/client/js/private/**/*.js', 'scripts/client/js/primo.js']
};

var getPackageJson = function () {
    return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
};


gulp.task('clean', function(cb) {
    del(['dist', 'build'], cb);
});

gulp.task('bump', function(){
    gulp.src('./package.json')
        .pipe(bump({type:'patch'}))
        .pipe(gulp.dest('./'));
});

gulp.task('scripts', ['clean', 'build'], function(){
    return gulp.src('./dist/jquery.PRIMO.js')
        .pipe(concat('jquery.PRIMO.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', function(){
    var pkg = getPackageJson();
    return gulp.src(paths.scripts)
        .pipe(concat('jquery.PRIMO.js'))
        .pipe(template({version: pkg.version}))
        .pipe(jqc())
        .pipe(gulp.dest('./dist'));
});


gulp.task('watch', function(){
   gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('default', ['watch', 'scripts']);
