import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 8080);
const root = process.cwd();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function safePath(pathname) {
  const cleaned = pathname === "/" ? "/index.html" : pathname;
  const resolved = normalize(cleaned).replace(/^(\.\.(\/|\\|$))+/, "");
  return join(root, resolved);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const filepath = safePath(url.pathname);
    const data = await readFile(filepath);
    const ext = extname(filepath).toLowerCase();
    res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream");
    res.writeHead(200);
    res.end(data);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  }
});

server.listen(port, () => {
  console.log(`Snake dev server: http://localhost:${port}`);
});
