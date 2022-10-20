let source = "./src/assets";
let destination = "./dist/assets";
module.exports = {
  config: {
    tailwindjs: "./tailwind.config.js",
    html: ["./index.html"],
    port: 1234,
  },
  paths: {
    root: "./",
    clean: destination + "/",
    src: {
      base: "./src",
      html: "./src/**/*.pug",
      css: source + "/css/",
      js: source + "/js/",
      img: source + "/img/",
    },
    dist: {
      base: "./dist",
      css: destination + "/css/",
      js: destination + "/js/",
      img: destination + "/img/",
    },
    watch : {
      html: "./src/**/*.pug",
      css: source + "/css/*.scss",
      js: source + "/js/*.js",
      img: source + "/img/*.{png,jpg,gif,ico,svg,webp}",
    }
  },
};
