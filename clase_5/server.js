// server.js — servidor estático mínimo para esta clase, sin dependencias.
//
// Sirve los archivos de esta carpeta y, a propósito, hace que
// GET /api/messages siempre responda 404 con un JSON (así se puede
// reproducir el bug de "loading infinito" sin armar un backend real).
//
// Uso:
//   node server.js
//   abrir http://localhost:5500

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5500;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Backend roto a propósito: siempre 404.
  if (url.pathname === "/api/messages") {
    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "No se encontraron mensajes" }));
    return;
  }

  const filePath = path.join(ROOT, url.pathname === "/" ? "/index.html" : url.pathname);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 - No encontrado");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
