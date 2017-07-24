var gulp = require('gulp'),
    less = require('gulp-less'),
    stylus = require('gulp-stylus'), //препроцессор stylus
    sourcemaps = require('gulp-sourcemaps'), //sourcemaps
    prefixer = require('gulp-autoprefixer'), //расставление автопрефиксов
    cssmin = require('gulp-cssmin'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    uncss = require('gulp-uncss'),
    useref = require('gulp-useref'),
    connect = require('gulp-connect'),
    watch = require('gulp-watch'); //расширение возможностей watch

var path = {
    build: { //Куда складывать готовые после сборки файлы
        html: 'dist/',
        js: 'dist/assets/js/',
        css: 'dist/assets/css/',
        img: 'dist/assets/img/',
        fonts: 'dist/assets/fonts/',
        htaccess: 'dist/',
        contentImg: 'dist/assets/img/',
        sprites: 'dist/assets/css/images/',
        spritesCss: 'dist/assets/css/partial/'
    },
    src: { //Пути откуда брать исходники
        html: 'app/*.html', //Синтаксис app/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'app/js/*.js',
        less: 'app/less/**/*.less',
        css: 'app/css/**/*.css',
        cssVendor: 'app/css/vendor/*.*', //Если мы хотим файлы библиотек отдельно хранить то раскоментить строчку
        img: 'app/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'app/fonts/**/*.*',
        contentImg: 'app/img/**/*.*',
        sprites: 'app/css/sprites/*.png',
        htaccess: 'app/.htaccess'
    },
    watch: { //За изменением каких файлов мы хотим наблюдать
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        css: 'app/css/**/*.*',
        img: 'app/css/img/**/*.*',
        contentImg: 'app/img/**/*.*',
        fonts: 'app/fonts/**/*.*',
        htaccess: 'app/.htaccess',
        sprites: 'app/css/sprites/*.png'
    },
    clean: './dist', //директории которые могут очищаться
    outputDir: './dist' //исходная корневая директория для запуска минисервера
};

// Локальный сервер для разработки
gulp.task('connect', function(){
    connect.server({ //настриваем конфиги сервера
        root: [path.outputDir], //корневая директория запуска сервера
        port: 9999, //какой порт будем использовать
        livereload: true //инициализируем работу LiveReload
    });
});

// конвертируем LESS в CSS
gulp.task('css:build', function() {  
  gulp.src(path.src.less)
  	//Конвертируем LESS в CSS
    .pipe(less())
	
	//Очистка CSS от повторений и поиск неиспользуемых стилей
    /*.pipe(uncss({
        //html: [path.src.html]
        html: ['app/index.html']
    }))*/

    //Добавим вендорные префиксы
    .pipe(prefixer({
        browsers: ['last 3 version', "> 1%", "ie 8", "ie 7"]
    }))

    .pipe(sourcemaps.init()) //инициализируем soucemap
    .pipe(sourcemaps.write()) //пропишем sourcemap

    //минифицируем css
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))

    .pipe(gulp.dest(path.build.css)) //выгрузим файлы
    .pipe(connect.reload()) //перезагрузим сервер
});

// Объединение и минификация JS
gulp.task("scripts", function() {
  return gulp.src(path.src.js)
    .pipe(rename("app.js"))
    .pipe(uglify())
    .pipe(gulp.dest(path.build.js));
});

//Оптимизация изображений
gulp.task('imgmin', () =>
	gulp.src(path.src.img)
		.pipe(imagemin())
		.pipe(gulp.dest(path.build.img))
);

// таск для билдинга html
gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(gulp.dest(path.build.html)) //выгрузим их в папку build
        .pipe(connect.reload()) //И перезагрузим наш сервер для обновлений
});

// билдим все
gulp.task('build', [
    'html:build',
    'css:build',
    'imgmin'
]);

//Слежение за файлмаи
gulp.task('watch', function() {
    gulp.watch(path.src.less,['css:build']);
    gulp.watch(path.src.html, ['html:build']);
    gulp.watch(path.watch.img, ['imgmin']);
});

// действия по умолчанию
gulp.task('default', ['build', 'watch', 'connect']);