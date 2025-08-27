const fs = require("fs");
const path = require("path");

const dist = path.resolve(__dirname, "..", "dist");
const src = path.join(dist, "index.html");
const dst = path.join(dist, "404.html");

if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(src, dst);
console.log("SPA fallback criado: dist/404.html");
