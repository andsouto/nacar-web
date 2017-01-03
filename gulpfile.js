'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');
const plumber = require('gulp-plumber');
const notify = require("gulp-notify");
const gutil = require('gulp-util');
const file = require('gulp-file');
const filter = require('gulp-filter');
const argv = require('yargs').default('production', false).argv;
const gulpif = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const jade = require('gulp-jade');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const minifyCSS = require('gulp-minify-css');
const browserSync = require('browser-sync').create();
const path = require('path');
const swPrecache = require('sw-precache');
const del = require('del');
const gzip = require('gulp-gzip');

const SRC_DIR = 'src';
const DEST_PATH = 'public';

const JADE_PATH = path.join(SRC_DIR, 'jade/*.jade')
const LESS_PATH = path.join(SRC_DIR, 'less/**/*.less');
const LESS_ENTRY = path.join(SRC_DIR, 'less/nacar.less');
const IMG_PATH = path.join(SRC_DIR, 'img/**/*');
const JS_PATH = path.join(SRC_DIR, '**/*.js');

gulp.task('jade', function () {
	return gulp.src(JADE_PATH)
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(jade({pretty: !argv.production}))
		.pipe(gulp.dest(DEST_PATH))
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
		.pipe(gulp.dest(DEST_PATH))
		.pipe(browserSync.stream())
		.pipe(gulpif(argv.production, gzip()))
		.pipe(gulpif(argv.production, gulp.dest(DEST_PATH)));
});

gulp.task('img', function () {
	return gulp.src(IMG_PATH)
		.pipe(gulp.dest(path.join(DEST_PATH, 'img')))
		.pipe(browserSync.stream())
		.pipe(filter(['**/*.svg']))
		.pipe(gulpif(argv.production, gzip()))
		.pipe(gulpif(argv.production, gulp.dest(path.join(DEST_PATH, 'img'))));
});

gulp.task('js', function () {
	return gulp.src(JS_PATH)
		.pipe(gulpif(argv.production, uglify()))
		.pipe(gulp.dest(DEST_PATH))
		.pipe(browserSync.stream())
		.pipe(gulpif(argv.production, gzip()))
		.pipe(gulpif(argv.production, gulp.dest(DEST_PATH)));
});

gulp.task('build-files', ['jade', 'less', 'img', 'js']);

gulp.task('clean', function () {
	return del(path.join(DEST_PATH, '**/*'));
});

gulp.task('generate-service-worker:clean', function() {
	return del(path.join(DEST_PATH, 'service-worker.js'));
});

gulp.task('generate-service-worker', ['generate-service-worker:clean'], function() {
	return swPrecache.generate({
		cacheId: 'nacar',
		staticFileGlobs: [path.join(DEST_PATH, '**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}')],
		stripPrefix: DEST_PATH,
		//dontCacheBustUrlsMatching: /./,
		handleFetch: argv.production,
		logger: gutil.log,
	}).then((serviceWorkerString) => {
		return file('service-worker.js', serviceWorkerString, {src: true})
			.pipe(gulpif(argv.production, uglify()))
			.pipe(gulp.dest(DEST_PATH))
			.pipe(gulpif(argv.production, gzip()))
			.pipe(gulpif(argv.production, gulp.dest(DEST_PATH)));
	});
});

gulp.task('build', function(callback) {
	runSequence('build-files', 'generate-service-worker', callback);
});

gulp.task('watch', ['build'], function () {
	gulp.watch(JADE_PATH, ['jade', 'generate-service-worker']);
	gulp.watch(LESS_PATH, ['less', 'generate-service-worker']);
	gulp.watch(IMG_PATH, ['img', 'generate-service-worker']);
	gulp.watch(JS_PATH, ['js', 'generate-service-worker']);
});

gulp.task('serve', ['watch'], function() {
	browserSync.init({
		server: {baseDir: "./public"},
	});
});

gulp.task('default', function(callback) {
	runSequence('clean', 'build', callback);
});
