"use strict";

const Koa = require("koa");
const fs = require("fs");
const path = require("path");
const extname = path.extname;
const views = require("koa-views");
const router = require("koa-router")();
const app = new Koa();

app.use(views(path.join(__dirname, "/views"), { extension: "ejs" }));

router.get("/", index).get("/image/:name", image);

app.use(router.routes());

async function index(ctx) {
  let images = [];
  fs.readdirSync(path.join(__dirname, "/images")).forEach(file => {
    images.push(file);
  });
  await ctx.render("index", { images: images});
}

async function image(ctx) {
  const fpath = path.join(__dirname, "/images/" + ctx.params.name);
  const fstat = await stat(fpath);

  if (fstat.isFile()) {
    ctx.type = extname(fpath);
    ctx.set('cache-control', 'public, max-age=' + 365 * 24 * 60 * 60)
    ctx.body = fs.createReadStream(fpath);
  }
}

function stat(file) {
  return new Promise(function(resolve, reject) {
    fs.stat(file, function(err, stat) {
      if (err) {
        reject(err);
      } else {
        resolve(stat);
      }
    });
  });
}

app.listen(3000);
