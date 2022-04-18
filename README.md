# Проект "Сборка GULP":

Сборка компилирует синтаксис кода ejs в обычный код HTML и перебрасывает файлы HTML из папки src в папку dist. Компилирует синтаксис кода SCSS/SASS в CSS и перебрасывает из папки src в папку dist. Установлен автопрефиксер для CSS кода. Был установлен webpack для использования и написания кода на стандарте EcmaScript6+, а также использования импортов и экспортов. Установлен полифил babel js для перевода из нового стандарта в старый. Был установлен npm-плагин для создания svg-sprite. Перебрасрасывает из директории src в директорию dist папку assets, где хранятся папки images, favicon, fonts и icons. Установлен плагин для сжатия и оптимизации картинок всех форматов(gif, jpeg, png, svg) в production версии. Сборка сжимает файлы css и js в production версии. В development версии включается также sourcemaps для SCSS и JavaScript файлов. Сборка запускает локальный хостинг.

<br>

* npm run gulp - запуск development версии
* npm run build - запуск productin версии

# Project "Assembly Gulp":

The build compiles the syntax of the ejs code into regular HTML code and redirects the HTML files from the src folder to the dist folder. Compiles SCSS/SASS code syntax to CSS and redirects from src folder to dist folder. Installed autoprefixer for CSS code. Webpack has been installed to use and write code in the EcmaScript6+ standard, as well as use imports and exports. Installed the babel js polyfill to translate from the new standard to the old one. An npm plugin has been installed to generate svg-sprite. Redirects the assets folder from the src directory to the dist directory, where the images, favicon, fonts and icons folders are stored. Installed a plugin for compressing and optimizing images of all formats (gif, jpeg, png, svg) in the production version. The assembly compresses the css and js files in the production version. The development version also includes sourcemaps for SCSS and JavaScript files. The assembly starts local hosting.

<br>

* npm run gulp - run the development version
* npm run build - run productin version
