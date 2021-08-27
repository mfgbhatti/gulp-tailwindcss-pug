const { src, dest, parallel, series, watch } = require("gulp");
const options = require("./config");
const bsync = require("browser-sync").create();
const postCss = require("gulp-postcss");
const purgecss = require("gulp-purgecss");
const cleanCSS = require("gulp-clean-css");
const pug = require("gulp-pug");
const htmlmin = require("gulp-htmlmin");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const del = require("del");

// Error Handling
function onError(err) {
  let errorLine = err.line ? "Line " + err.line : "",
    errorTitle = err.plugin ? "Error: [ " + err.plugin + " ]" : "Error";
  notify.logLevel(0);
  notify({
    title: errorTitle,
    message: errorLine,
  }).write(err);
  this.emit("end");
}

// BrowserSync initiated
function browserSync(done) {
  bsync.init({
    server: {
      baseDir: options.paths.dist.base,
    },
    port: options.config.port || 3000,
  });
  done();
}

// CSS with SASS, postcss and plugins
function css() {
  let plugins = [
    require("postcss-import"),
    require("tailwindcss")(options.config.tailwindjs),
    require("autoprefixer"),
  ];
  return src(`${options.paths.src.css}/**.scss`)
    .pipe(dest(options.paths.src.css))
    .pipe(postCss(plugins))
    .pipe(plumber({ errorHandler: onError }))
    .pipe(
      purgecss({
        content: ["src/**/*.{html,pug}"],
        defaultExtractor: (content) => {
          const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
          const innerMatches =
            content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
          return broadMatches.concat(innerMatches);
        },
      })
    )
    .pipe(cleanCSS())
    .pipe(concat({ path: "styles.css" }))
    .pipe(dest(options.paths.dist.css))
    .pipe(bsync.stream());
}

// HTML with Pug
function pugHtml() {
  return src(`${options.paths.src.base}/**.pug`)
    .pipe(
      pug({
        doctype: "html",
        pretty: true,
      })
    )
    .pipe(plumber({ errorHandler: onError }))
    .pipe(dest(options.paths.dist.base))
    .pipe(bsync.stream());
}

// Minify HTML
function html() {
  return src(`${options.paths.src.base}/**.html`)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(options.paths.dist.base))
    .pipe(bsync.stream());
}
// JS scripts
function js() {
  return src(`${options.paths.src.js}/*.js`)
    .pipe(uglify())
    .pipe(concat({ path: "script.js" }))
    .pipe(dest(options.paths.dist.js))
    .pipe(bsync.stream());
}

// Images
function img() {
  return src(`${options.paths.src.img}/*.{jpg,svg,png}`).pipe(
    dest(options.paths.dist.img)
  );
}

// Clean dist folder
function clean() {
  return del(options.paths.dist.base);
}

// Watch Files
function watchFiles() {
  watch(`${options.paths.src.base}/*.{html,pug}`, series(pugHtml, html));
  watch([options.config.tailwindjs, `${options.paths.src.css}/*.scss`], css);
  watch(`${options.paths.src.js}/*.js`, js);
  watch(`${options.paths.src.img}/*{jpg,svg,png}`, img);
}

// Gulp default
exports.default = series(
  clean, // Clean Dist Folder
  parallel(js, css, img, pugHtml, html), //Run All tasks in parallel
  browserSync, // Live Preview Build
  watchFiles // Watch for Live Changes
);
