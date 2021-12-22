const { src, dest, task, series, watch, parallel, tree } = require('gulp');
const rm = require('gulp-rm');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const svgo = require('gulp-svgo');
const svgSprite = require('gulp-svg-sprite');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const webpack = require('webpack-stream');

const env = process.env.NODE_ENV;

const dist = 'dist/';

task('clean', () => {
    return src('dist/**/*', { read: false }).pipe(rm())
});

task('copy:html', () => {
    return src('src/*.html').pipe(dest(dist)).pipe(reload({ stream: true }));
});

const styles = [
    'node_modules/normalize.css/normalize.css',
    'src/scss/style.scss',
];

task('styles', () => {
    return src(styles)
        .pipe(gulpif(env === 'dev', sourcemaps.init()))
        .pipe(concat('style.min.scss'))
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(env == 'dev', autoprefixer({
            cascade: false
        })))
        .pipe(gulpif(env === 'prod', gcmq()))
        .pipe(gulpif(env === 'prod', cleanCSS()))
        .pipe(gulpif(env === 'dev', sourcemaps.write()))
        .pipe(dest(`${dist}/css`))
        .pipe(reload({ stream: true }))
});

task('scripts', () => {
    return src('src/js/main.js')
        .pipe(webpack({
            mode: 'development',
            output: {
                filename: 'script.js'
            },
            watch: false,
            devtool: "source-map",
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/preset-env', {
                                    debug: true,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(dest(dist))
        .on("end", browserSync.reload);
});

task('scripts-build', () => {
    return src('src/js/main.js')
        .pipe(webpack({
            mode: 'production',
            output: {
                filename: 'script.js'
            },
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/preset-env', {
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(dest(dist));
});

task('icons', () => {
    return src('src/assets/icons/*.svg')
        .pipe(svgo({
            plugins: [{
                removeAttrs: {
                    attrs: '(fill|stroke|style|width|height|data.*)'
                }
            }]
        }))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: '../sprite.svg'
                }
            }
        }))
        .pipe(dest(`${dist}/assets/icons`))
        .pipe(reload({ stream: true }));
});

task('copy-assets', () => {
    return src(['src/assets/**/*.*', '!src/assets/icons/*.svg'])
        .pipe(dest(`${dist}/assets`))
        .pipe(reload({ stream: true }))
});

task('img-compress', () => {
    return src('src/assets/img/**/*.*')
        .pipe(gulpif(env === 'prod', imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ])))
        .pipe(dest(`${dist}/assets/img`))
});

task('server', () => {
    browserSync.init({
        server: {
            baseDir: `./${dist}`
        }
    });
});

task('watch', () => {
    watch('./src/scss/**/*.scss', series('styles'));
    watch('./src/*.html', series('copy:html'));
    watch('./src/js/**/*.js', series('scripts'));
    watch('./src/assets/icons/*.svg', series('icons'));
    watch('./src/assets/**/*.*', series('copy-assets'));
});

task('default', series('clean', parallel('copy:html', 'styles', 'scripts', 'icons', 'copy-assets', 'watch', 'server')));
task('build', series('clean', parallel('copy:html', 'styles', 'scripts', 'icons', 'copy-assets', 'img-compress', 'scripts-build')));