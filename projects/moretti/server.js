const fs = require("fs/promises");
const http = require("http");
const path = require("path");

const ROOT = path.join(__dirname, "docs");
const PORT = Number(process.env.PORT || 4173);
const GITHUB_PREVIEW_PREFIX = "/github-pages-preview";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  if (body && res.req.method !== "HEAD") {
    res.end(body);
    return;
  }

  res.end();
}

async function serveFile(res, filePath) {
  try {
    const data = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";

    send(
      res,
      200,
      {
        "Cache-Control": "public, max-age=0",
        "Content-Length": data.byteLength,
        "Content-Type": contentType,
      },
      data,
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
      return;
    }

    console.error(error);
    send(
      res,
      500,
      { "Content-Type": "text/plain; charset=utf-8" },
      "Internal server error",
    );
  }
}

function normalizeRequestPath(pathname) {
  if (pathname === GITHUB_PREVIEW_PREFIX) {
    return "/";
  }

  if (pathname.startsWith(`${GITHUB_PREVIEW_PREFIX}/`)) {
    return pathname.slice(GITHUB_PREVIEW_PREFIX.length) || "/";
  }

  return pathname;
}

function safeFilePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  let relativePath = decoded.replace(/^\/+/, "");

  if (!relativePath || relativePath.endsWith("/")) {
    relativePath = path.join(relativePath, "index.html");
  }

  const fullPath = path.normalize(path.join(ROOT, relativePath));
  if (!fullPath.startsWith(ROOT)) {
    return null;
  }

  return fullPath;
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, { "Content-Type": "text/plain; charset=utf-8" }, "Method not allowed");
    return;
  }

  const currentUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = normalizeRequestPath(currentUrl.pathname);
  const filePath = safeFilePath(pathname);

  if (!filePath) {
    send(res, 400, { "Content-Type": "text/plain; charset=utf-8" }, "Bad request");
    return;
  }

  await serveFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Static preview available at http://localhost:${PORT}`);
  console.log(
    `GitHub Pages-style preview available at http://localhost:${PORT}${GITHUB_PREVIEW_PREFIX}/`,
  );
});
