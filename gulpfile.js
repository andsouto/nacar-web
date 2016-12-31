'use strict';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const notify = require("gulp-notify");
const argv = require('yargs').argv;
const gulpif = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const jade = require('gulp-jade');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const minifyCSS = require('gulp-minify-css');
const browserSync = require('browser-sync').create();
const del = require('del');

const JADE_PATH = 'src/jade/*.jade';
const LESS_PATH = 'src/less/**/*.less';
const LESS_ENTRY = 'src/less/nacar.less';
const IMG_PATH = 'src/img/**/*';

gulp.task('jade', function () {
	return gulp.src(JADE_PATH)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(jade({pretty: !argv.production}))
		.pipe(gulp.dest('./public'))
		.pipe(browserSync.stream({once: true}));
});

gulp.task('less', function () {
	return gulp.src(LESS_ENTRY)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(gulpif(!argv.production, sourcemaps.init()))
		.pipe(less())
		.pipe(autoprefixer({
			browsers: ['> 1%'],
			cascade: false
		})).pipe(gulpif(argv.production, minifyCSS()))
		.pipe(gulpif(!argv.production, sourcemaps.write()))
		.pipe(gulp.dest('./public'))
		.pipe(browserSync.stream());
});

gulp.task('img', function () {
	return gulp.src(IMG_PATH)
		.pipe(gulp.dest('./public/img'))
		.pipe(browserSync.stream());
});

gulp.task('clean', function () {
	return del("public");
});

gulp.task('build', ['jade', 'less', 'img']);

gulp.task('watch', ['build'], function () {
	gulp.watch('src/jade/**/*.jade', ['jade']);
	gulp.watch(LESS_PATH, ['less']);
	gulp.watch(IMG_PATH, ['img']);
});

gulp.task('serve', ['watch'], function() {
	browserSync.init({
		server: {baseDir: "./public"},
	});
});

gulp.task('default', ['build']);
