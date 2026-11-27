// Tiny static server for local testing only (not part of the entry):
// serves app/ at http://localhost:8080. Usage: node serve.ts [--port N]
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "app");
const port = Number(process.argv.find((a) => a.startsWith("--port="))?.split("=")[1] ?? 8080);
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  const file = resolve(join(root, normalize(pathname)));
  if (!file.startsWith(root + sep) && file !== root) { res.writeHead(403).end(); return; }
  try {
    const size = statSync(file).size;
    res.writeHead(200, {
      "content-type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream",
      "content-length": size,
    });
    createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end("not found"); }
});
server.listen(port, () => console.log(`Serving app/ at http://localhost:${port}`));
