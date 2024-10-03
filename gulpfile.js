const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");
const cssnano = require("cssnano");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const ts = require("gulp-typescript");
const sass = require("gulp-sass")(require("sass")); // Import Sass

const postCssPlugins = [
  require("postcss-import"),
  require("autoprefixer"),
  require("postcss-nested"),
  require("postcss-preset-env")({
    stage: 0,
  }),
  cssnano({
    preset: "default",
  }),
];

// TypeScript project configuration
const tsProject = ts.createProject("tsconfig.json");

// Compile Sass, Autoprefix, and Minify CSS using PostCSS
gulp.task("sass", function () {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss(postCssPlugins)) // Use PostCSS to process and minify
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("./public/css")) // Save minified CSS
    .pipe(browserSync.stream()); // Inject CSS changes
});

// Task to compile and minify TypeScript
gulp.task("ts", function (done) {
  const tsResult = tsProject.src().pipe(sourcemaps.init()).pipe(tsProject());

  tsResult.js
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("./public/js"))
    .pipe(browserSync.stream());

  done(); // Signal task completion
});

// Serve task
gulp.task("serve", function () {
  browserSync.init({
    server: {
      baseDir: "./",
    },
    port: 5173,
    open: false,
    notify: false,
  });

  gulp.watch("./*.html").on("change", browserSync.reload);
  // Watch Sass files for changes
  gulp.watch("./src/scss/**/*.scss", gulp.series("sass"));

  gulp.watch("./src/ts/*.ts", gulp.series("ts")); // Watch for TypeScript changes
});

// Default task
gulp.task("default", gulp.series(gulp.parallel("sass", "ts"), "serve"));

