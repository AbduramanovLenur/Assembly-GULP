import gulp from 'gulp';
import rm from 'gulp-rm';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import concat from 'gulp-concat';
import browserSync from 'browser-sync';
import sassGlob from 'gulp-sass-glob';
import autoprefixer from 'gulp-autoprefixer';
import gcmq from 'gulp-group-css-media-queries';
import cleanCSS from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import svgo from 'gulp-svgo';
import svgSprite from 'gulp-svg-sprite';
import gulpif from 'gulp-if';
import imagemin from 'gulp-imagemin';
import webpack from 'webpack-stream';

const env = process.env.NODE_ENV;

const dist = 'dist/';

gulp.task('clean', () => {
    return gulp.src('dist/**/*', { read: false }).pipe(rm())
});

gulp.task('copy:html', () => {
    return gulp.src('src/*.html').pipe(gulp.dest(dist)).pipe(browserSync.reload({ stream: true }));
});

const styles = [
    'node_modules/normalize.css/normalize.css',
    'src/scss/style.scss',
];

gulp.task('styles', () => {
    return gulp.src(styles)
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
        .pipe(gulp.dest(`${dist}/css`))
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('scripts', () => {
    return gulp.src('src/js/main.js')
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
        .pipe(gulp.dest(dist))
        .on("end", browserSync.reload);
});

gulp.task('scripts-build', () => {
    return gulp.src('src/js/main.js')
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
        .pipe(gulp.dest(dist));
});

gulp.task('icons', () => {
    return gulp.src('src/assets/icons/*.svg')
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
        .pipe(gulp.dest(`${dist}/assets/icons`))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('copy-assets', () => {
    return gulp.src(['src/assets/**/*.*', '!src/assets/icons/*.svg'])
        .pipe(gulp.dest(`${dist}/assets`))
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('img-compress', () => {
    return gulp.src('src/assets/img/**/*.*')
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
        .pipe(gulp.dest(`${dist}/assets/img`))
});

gulp.task('server', () => {
    browserSync.init({
        server: {
            baseDir: `./${dist}`
        }
    });
});

gulp.task('watch', () => {
    gulp.watch('./src/scss/**/*.scss', gulp.series('styles'));
    gulp.watch('./src/*.html', gulp.series('copy:html'));
    gulp.watch('./src/js/**/*.js', gulp.series('scripts'));
    gulp.watch('./src/assets/icons/*.svg', gulp.series('icons'));
    gulp.watch('./src/assets/**/*.*', gulp.series('copy-assets'));
});

gulp.task('default', gulp.series('clean', gulp.parallel('copy:html', 'styles', 'scripts', 'icons', 'copy-assets', 'watch', 'server')));
gulp.task('build', gulp.series('clean', gulp.parallel('copy:html', 'styles', 'scripts', 'icons', 'copy-assets', 'img-compress', 'scripts-build')));