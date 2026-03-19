const fs = require("fs/promises");
const http = require("http");
const path = require("path");

const ROOT = __dirname;
const EDITABLE_ROOT = path.join(ROOT, "editable");
const CONTENT_ROOT = path.join(EDITABLE_ROOT, "content");
const HOME_UPLOADS_ROOT = path.join(EDITABLE_ROOT, "assets", "uploads");
const PROJECT_UPLOADS_ROOT = path.join(HOME_UPLOADS_ROOT, "projects");
const PORT = Number(process.env.PORT || 4173);
const GITHUB_PREVIEW_PREFIX = "/github-pages-preview";
const MAX_BODY_SIZE = 50 * 1024 * 1024;

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

const PUBLIC_PREFIXES = [
  "/assets/",
  "/behindtheshadow/",
  "/booking/",
  "/data/",
  "/docs/",
  "/editable/",
  "/legal/",
  "/mirror/",
  "/mobile/",
];

const PUBLIC_FILES = new Set([
  "/",
  "/.nojekyll",
  "/index.html",
]);

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  if (body && res.req.method !== "HEAD") {
    res.end(body);
    return;
  }

  res.end();
}

function sendJson(res, status, payload) {
  const body = Buffer.from(`${JSON.stringify(payload)}\n`);
  send(
    res,
    status,
    {
      "Cache-Control": "no-store",
      "Content-Length": body.byteLength,
      "Content-Type": "application/json; charset=utf-8",
    },
    body,
  );
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

function isPublicPath(pathname) {
  if (PUBLIC_FILES.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function safeStaticFilePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  let relativePath = decoded.replace(/^\/+/, "");

  if (!relativePath || relativePath.endsWith("/")) {
    relativePath = path.join(relativePath, "index.html");
  }

  const fullPath = path.normalize(path.join(ROOT, relativePath));
  if (!fullPath.startsWith(ROOT) || !isPublicPath(decoded)) {
    return null;
  }

  return fullPath;
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) {
      throw new Error("Payload too large");
    }
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(body || "{}");
}

function isSafeFileName(fileName) {
  return (
    typeof fileName === "string" &&
    fileName === path.basename(fileName) &&
    !fileName.includes("..") &&
    fileName.length > 0
  );
}

async function writeBase64File(directory, fileName, base64) {
  if (!isSafeFileName(fileName)) {
    throw new Error(`Invalid file name: ${fileName}`);
  }

  const filePath = path.join(directory, fileName);
  const data = Buffer.from(base64, "base64");
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(filePath, data);
}

async function saveEditableContent(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload");
  }

  const { siteData, projectsData, homeImages = [], projectImages = [] } = payload;

  if (!siteData || !projectsData) {
    throw new Error("Missing JSON content");
  }

  await fs.mkdir(CONTENT_ROOT, { recursive: true });
  await fs.writeFile(
    path.join(CONTENT_ROOT, "site.json"),
    `${JSON.stringify(siteData, null, 2)}\n`,
  );
  await fs.writeFile(
    path.join(CONTENT_ROOT, "projects.json"),
    `${JSON.stringify(projectsData, null, 2)}\n`,
  );

  for (const image of homeImages) {
    if (!image?.fileName || !image?.base64) {
      continue;
    }
    await writeBase64File(HOME_UPLOADS_ROOT, image.fileName, image.base64);
  }

  for (const image of projectImages) {
    if (!image?.fileName || !image?.base64) {
      continue;
    }
    await writeBase64File(PROJECT_UPLOADS_ROOT, image.fileName, image.base64);
  }
}

const server = http.createServer(async (req, res) => {
  const currentUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = normalizeRequestPath(currentUrl.pathname);

  if (pathname === "/api/admin/status") {
    if (req.method !== "GET" && req.method !== "HEAD") {
      send(res, 405, { "Content-Type": "text/plain; charset=utf-8" }, "Method not allowed");
      return;
    }

    sendJson(res, 200, {
      canSaveToDisk: true,
      projectRoot: ROOT,
    });
    return;
  }

  if (pathname === "/api/admin/save") {
    if (req.method !== "POST") {
      send(res, 405, { "Content-Type": "text/plain; charset=utf-8" }, "Method not allowed");
      return;
    }

    try {
      const payload = await readJsonBody(req);
      await saveEditableContent(payload);
      sendJson(res, 200, {
        ok: true,
        savedAt: new Date().toISOString(),
      });
    } catch (error) {
      const status = error.message === "Payload too large" ? 413 : 400;
      sendJson(res, status, {
        ok: false,
        error: error.message || "Unable to save editable content",
      });
    }
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, { "Content-Type": "text/plain; charset=utf-8" }, "Method not allowed");
    return;
  }

  const filePath = safeStaticFilePath(pathname);
  if (!filePath) {
    send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
    return;
  }

  await serveFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Static preview available at http://localhost:${PORT}`);
  console.log(`Admin available at http://localhost:${PORT}/editable/admin/`);
  console.log(
    `GitHub Pages-style preview available at http://localhost:${PORT}${GITHUB_PREVIEW_PREFIX}/`,
  );
});
