"use strict";

var gulp = require('gulp');

var uglify      = require('gulp-uglify');
var concat      = require('gulp-concat');
var jqc         = require('gulp-jquery-closure');
var jsdoc       = require("gulp-jsdoc");
var del         = require('del');

var paths = {
    scripts: ['scripts/js/header.js', 'scripts/js/private/**/*.js', 'scripts/js/primo.js']
};

gulp.task('clean', function(cb) {
    del(['dist', 'build'], cb);
});


var infos = {plugins: [ "plugins/markdown" ]}
var docstrap = {
    path: 'ink-docstrap',
    systemName      : 'jQuery.PRIMO',
    footer          : "KULeuven/LIBIS",
    copyright       : "(c) 2014 MIT License",
    navType         : "vertical",
    theme           : "Spacelab",
    linenums        : true,
    collapseSymbols : true,
    inverseNav      : false
}


gulp.task('scripts', ['clean', 'build'], function(){
    return gulp.src('./dist/jquery.PRIMO.js')
        .pipe(concat('jquery.PRIMO.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'))
});

gulp.task('docs', function(){
    return gulp.src(['./build/jquery.PRIMO.js'])
        .pipe(jsdoc.parser(infos, 'jQuery.PRIMO'))
        .pipe(jsdoc.generator('./docs', docstrap))
});


gulp.task('build', function(){
    return gulp.src(paths.scripts)
        .pipe(concat('jquery.PRIMO.js'))
        .pipe(jqc())
        .pipe(gulp.dest('./dist'))
})


gulp.task('watch', function(){
   gulp.watch(paths.scripts, ['scripts'])
});

gulp.task('default', ['watch', 'scripts']);
