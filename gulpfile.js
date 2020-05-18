const { src, dest, watch, series, parallel } = require('gulp')

const del = require('del')
const fileinclude = require('gulp-file-include')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const atImport = require('postcss-import')

const sourcemaps = require('gulp-sourcemaps')
const plumber = require('gulp-plumber')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const webpack = require('webpack-stream')

const imagemin = require('gulp-imagemin')
const svgSprite = require('gulp-svg-sprite')
const browserSync = require('browser-sync').create()

const paths = {
    src: 'src',
    dist: 'dist',
    assets: 'src/assets',
    images: 'src/assets/images',
    sprites: 'src/assets/sprites',
    fonts: 'src/assets/fonts',
    static: 'src/assets/static',
}

const files = {
    htmlPath: `${paths.src}/index.html`,
    cssPath: `${paths.src}/css/**/*.css`,
    jsPath: `${paths.src}/js/**/*.js`,
    imagePath: `${paths.images}/**/*.+(png|jpg|jpeg|gif|svg|ico)`,
    svgSpritePath: `${paths.sprites}/**/*.svg`,
}

function cleanTask() {
    return del([paths.dist])
}

function htmlTask() {
    return src(files.htmlPath)
        .pipe(
            fileinclude({
                prefix: '@@',
                basepath: '@file',
            })
        )
        .pipe(dest(paths.dist))
        .pipe(browserSync.stream())
}

function cssTask() {
    const config = (file) => ({
        plugins: [atImport({ root: file.dirname }), autoprefixer(), cssnano()],
    })
    return src([files.cssPath, '!src/css/modules/*.css'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(postcss(config))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.dist))
        .pipe(browserSync.stream())
}

function jsTask() {
    return src([files.jsPath, '!src/js/modules/*.js'])
        .pipe(plumber())
        .pipe(
            webpack({
                mode: 'production',
            })
        )
        .pipe(sourcemaps.init())
        .pipe(
            babel({
                presets: ['@babel/env'],
            })
        )
        .pipe(concat('script.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.dist))
        .pipe(browserSync.stream())
}

function imagesTask() {
    return src(files.imagePath)
        .pipe(plumber())
        .pipe(imagemin())
        .pipe(dest(paths.dist + '/images'))
        .pipe(browserSync.stream())
}

function svgSpriteTask() {
    return src(files.svgSpritePath)
        .pipe(
            svgSprite({
                mode: {
                    stack: {
                        sprite: '../../dist/sprite.svg',
                    },
                },
            })
        )
        .pipe(dest(paths.src))
}

function fontsCopyTask() {
    return src(paths.fonts + '/**/*').pipe(dest(paths.dist + '/fonts'))
}

function staticCopyTask() {
    return src(paths.static + '/**/*').pipe(dest(paths.dist))
}

function server() {
    return browserSync.init({
        server: {
            baseDir: 'dist/',
        },
        port: 3000,
    })
}

function watchTask() {
    const watchFiles = Object.values(files)
    const watchImages = [files.imagePath]
    const watchFonts = paths.fonts + '/**/*'

    watch(watchFiles, series(parallel(htmlTask, cssTask, jsTask))).on(
        'change',
        browserSync.reload
    )
    watch(watchImages, series(imagesTask)).on('change', browserSync.reload)
    watch(watchFonts, series(fontsCopyTask)).on('change', browserSync.reload)
}

exports.default = series(
    cleanTask,
    parallel(htmlTask, cssTask, jsTask, imagesTask, svgSpriteTask),
    parallel(fontsCopyTask, staticCopyTask),
    parallel(server, watchTask)
)
