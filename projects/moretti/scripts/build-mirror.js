const fs = require("fs/promises");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "docs");
const MIRROR_DIR = path.join(OUTPUT_DIR, "mirror");
const WIDGETS_DIR = path.join(OUTPUT_DIR, "data", "widgets");
const FONTS_DIR = path.join(OUTPUT_DIR, "assets", "fonts");
const STATIC_DIR = path.join(OUTPUT_DIR, "assets", "static");

const PROJECT_ID = "6186374";
const ORIGIN = "https://riviera-moretti.com";
const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css?family=Inter:400%7COutfit:100,400,600,500,700%7CJost:400,700,600,500&subset=latin,vietnamese,khmer,cyrillic-ext,greek-ext,greek,devanagari,latin-ext,cyrillic";

const MIRRORABLE_HOSTS = new Set([
  "st-p.rmcdn1.net",
  "c-p.rmcdn1.net",
  "i-p.rmcdn.net",
  "fonts.gstatic.com",
]);

const PAGE_DEFS = [
  {
    pageId: "69a964c5c809c08797550933",
    slug: "",
    liveUrl: `${ORIGIN}/`,
  },
  {
    pageId: "69af1b1f1234d667b52ac74d",
    slug: "mobile",
    liveUrl: `${ORIGIN}/mobile/`,
  },
  {
    pageId: "69a964c5c809c08797550934",
    slug: "behindtheshadow",
    liveUrl: `${ORIGIN}/behindtheshadow/`,
  },
  {
    pageId: "69a964c5c809c08797550935",
    slug: "booking",
    liveUrl: `${ORIGIN}/booking/`,
  },
  {
    pageId: "69a964c5c809c08797550936",
    slug: "legal",
    liveUrl: `${ORIGIN}/legal/`,
  },
];

const PAGE_ROUTE_BY_ID = new Map(
  PAGE_DEFS.map((page) => [page.pageId, page.slug ? `${page.slug}/` : "./"]),
);

const SPECIAL_LINK_ROUTES = new Map([
  ["69833a925de0eda3ae3205ce", "./"],
  ["69833a925de0eda3ae3205d1", "booking/"],
]);

const GOOGLE_FONTS = [
  { name: "Inter", variations: ["n4"] },
  { name: "Outfit", variations: ["n1", "n4", "n6", "n5", "n7"] },
  { name: "Jost", variations: ["n4", "n7", "n6", "n5"] },
];

const TEXT_FILE_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".mjs",
  ".svg",
  ".txt",
  ".xml",
]);

const DEFAULT_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
};

function routeForSlug(slug) {
  return slug ? `${slug}/` : "./";
}

function pageOutputFile(page) {
  return page.slug
    ? path.join(OUTPUT_DIR, page.slug, "index.html")
    : path.join(OUTPUT_DIR, "index.html");
}

function ensureDotSlash(value) {
  return value.startsWith(".") ? value : `./${value}`;
}

function posixPath(relativePath) {
  return relativePath.split(path.sep).join(path.posix.sep);
}

async function ensureDir(targetPath) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
}

async function writeFile(targetPath, contents) {
  await ensureDir(targetPath);
  await fs.writeFile(targetPath, contents);
}

async function fetchText(url) {
  const response = await fetch(url, { headers: DEFAULT_HEADERS });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: DEFAULT_HEADERS });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchBuffer(url) {
  const response = await fetch(url, { headers: DEFAULT_HEADERS });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function localMirrorPathFromUrl(urlString) {
  const parsed = new URL(urlString);
  return `mirror/${parsed.host}${decodeURIComponent(parsed.pathname)}`;
}

function diskPathFromMirrorUrl(urlString) {
  const parsed = new URL(urlString);
  return path.join(MIRROR_DIR, parsed.host, decodeURIComponent(parsed.pathname));
}

function isMirrorableUrl(value) {
  try {
    const parsed = new URL(value);
    return MIRRORABLE_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

function isDownloadableMirrorUrl(value) {
  if (!isMirrorableUrl(value)) {
    return false;
  }

  const parsed = new URL(value);
  const basename = path.posix.basename(parsed.pathname);
  return basename.includes(".");
}

function extractRemoteUrls(text) {
  return text.match(/https?:\/\/[^"'`<>\s)\\&]+/g) || [];
}

function collectMirrorableUrlsFromText(text, collector) {
  for (const urlString of extractRemoteUrls(text)) {
    if (isDownloadableMirrorUrl(urlString)) {
      collector.add(urlString);
    }
  }
}

function collectMirrorableUrlsFromNode(node, collector) {
  if (Array.isArray(node)) {
    for (const value of node) {
      collectMirrorableUrlsFromNode(value, collector);
    }
    return;
  }

  if (!node || typeof node !== "object") {
    if (typeof node === "string" && isDownloadableMirrorUrl(node)) {
      collector.add(node);
    }
    return;
  }

  for (const value of Object.values(node)) {
    collectMirrorableUrlsFromNode(value, collector);
  }
}

function mapRemoteSiteUrl(value) {
  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  if (
    parsed.hostname !== "riviera-moretti.com" &&
    parsed.hostname !== "www.riviera-moretti.com"
  ) {
    return null;
  }

  const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
  if (pathname === "/" || pathname === "/home") {
    return "./";
  }

  const match = PAGE_DEFS.find((page) => pathname === `/${page.slug}`);
  if (match) {
    return routeForSlug(match.slug);
  }

  return null;
}

function rewriteWidgetNode(node) {
  if (Array.isArray(node)) {
    return node.map(rewriteWidgetNode);
  }

  if (!node || typeof node !== "object") {
    return node;
  }

  const rewritten = {};
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === "string") {
      let nextValue = value;

      if (key === "clickLink" || key === "clickPage") {
        nextValue =
          PAGE_ROUTE_BY_ID.get(value) ||
          SPECIAL_LINK_ROUTES.get(value) ||
          nextValue;
      }

      const localSiteRoute = mapRemoteSiteUrl(nextValue);
      if (localSiteRoute) {
        nextValue = localSiteRoute;
      } else if (isMirrorableUrl(nextValue)) {
        nextValue = localMirrorPathFromUrl(nextValue);
      }

      rewritten[key] = nextValue;
      continue;
    }

    rewritten[key] = rewriteWidgetNode(value);
  }

  if (rewritten.type === "form") {
    if (typeof rewritten.captcha === "boolean") {
      rewritten.captcha = false;
    }

    if (rewritten.endpoint_google) {
      rewritten.endpoint_google = {
        ...rewritten.endpoint_google,
        enabled: false,
      };
    }

    if (rewritten.endpoint_email) {
      rewritten.endpoint_email = {
        ...rewritten.endpoint_email,
        enabled: false,
      };
    }

    if (rewritten["endpoint_email-storage"]) {
      rewritten["endpoint_email-storage"] = {
        ...rewritten["endpoint_email-storage"],
        enabled: false,
      };
    }

    if (rewritten.endpoint_second_email) {
      rewritten.endpoint_second_email = {
        ...rewritten.endpoint_second_email,
        enabled: false,
      };
    }

    if (rewritten.endpoint_url) {
      rewritten.endpoint_url = {
        ...rewritten.endpoint_url,
        enabled: false,
      };
    }

    if (rewritten.endpoint_mailchimp) {
      rewritten.endpoint_mailchimp = {
        ...rewritten.endpoint_mailchimp,
        enabled: false,
      };
    }
  }

  return rewritten;
}

function makeRelativePath(fromFile, toFile) {
  return ensureDotSlash(
    posixPath(path.relative(path.dirname(fromFile), toFile)),
  );
}

function rootRelativeFromOutputFile(outputFile, targetFile) {
  const relativePath = path.relative(OUTPUT_DIR, targetFile);
  return posixPath(relativePath);
}

function replaceRemoteUrls(text, replacer) {
  return text.replace(/https?:\/\/[^"'`<>\s)\\&]+/g, (match) => replacer(match));
}

function sanitizeStaticArchiveHtml(text) {
  return text
    .replace(
      /<script[^>]+src="https:\/\/www\.google\.com\/recaptcha\/api\.js[^"]*"[^>]*><\/script>/gi,
      "",
    )
    .replace(
      /<iframe[^>]+src="https:\/\/www\.google\.com\/recaptcha\/[^"]*"[^>]*><\/iframe>/gi,
      "",
    )
    .replace(/https:\/\/www\.google\.com\/recaptcha\/[^"'`<>\s)\\]+/g, "about:blank")
    .replace(/https:\/\/www\.gstatic\.com\/recaptcha\/[^"'`<>\s)\\]+/g, "about:blank");
}

function rewriteTextAsset(text, outputFile) {
  const extension = path.extname(outputFile).toLowerCase();
  const isJsModule = extension === ".js" || extension === ".mjs";
  const isHtmlPage = extension === ".html" && !outputFile.includes(`${path.sep}mirror${path.sep}`);
  const sourceText = extension === ".html" ? sanitizeStaticArchiveHtml(text) : text;

  return replaceRemoteUrls(sourceText, (urlString) => {
    if (isMirrorableUrl(urlString)) {
      const targetFile = diskPathFromMirrorUrl(urlString);
      const targetPath = isJsModule && /\.(?:js|mjs)(?:$|\?)/i.test(urlString)
        ? makeRelativePath(outputFile, targetFile)
        : isHtmlPage
          ? rootRelativeFromOutputFile(outputFile, targetFile)
          : makeRelativePath(outputFile, targetFile);

      return targetPath;
    }

    const localRoute = mapRemoteSiteUrl(urlString);
    if (localRoute) {
      return localRoute;
    }

    return urlString;
  });
}

function stripTracking(html) {
  return html
    .replace(/<noscript><iframe[\s\S]*?<\/noscript>/g, "")
    .replace(/<script async="" src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]+"><\/script>/g, "")
    .replace(
      /<script>\s*window\.dataLayer = window\.dataLayer \|\| \[\];[\s\S]*?window\.dispatchEvent\(new Event\('gtagConfigReady'\)\);\s*<\/script>/g,
      "",
    )
    .replace(
      /<script data-cookieconsent="marketing" type="text\/javascript">[\s\S]*?googletagmanager[\s\S]*?<\/script>/g,
      "",
    )
    .replaceAll("&quot;ga_id&quot;:&quot;G-QBNQ5LHC3Y&quot;", "&quot;ga_id&quot;:&quot;&quot;")
    .replaceAll("&quot;gtm_id&quot;:&quot;GTM-NKLFXBFH&quot;", "&quot;gtm_id&quot;:&quot;&quot;");
}

function baseHrefForPage(page) {
  return page.slug ? "../" : "./";
}

function googleFontsVariationAttribute() {
  return GOOGLE_FONTS.flatMap((font) =>
    font.variations.map((variation) => `${font.name}|${variation}`),
  ).join("||");
}

function buildFontLinksMarkup() {
  return [
    `<link rel="stylesheet" href="assets/fonts/google.css" class="fonts" data-provider="google" data-fonts-and-variations="${googleFontsVariationAttribute()}"/>`,
    `<link rel="stylesheet" href="assets/fonts/webtype.css"/>`,
    `<link rel="stylesheet" href="assets/fonts/typetoday.css"/>`,
  ].join("");
}

function buildStaticRuntimeShim() {
  const widgetMap = Object.fromEntries(
    PAGE_DEFS.map((page) => [page.pageId, `data/widgets/${page.pageId}.json`]),
  );

  return `<script>(function(){const widgetMap=${JSON.stringify(
    widgetMap,
  )};const resolveTarget=function(input){try{const url=new URL(typeof input==="string"?input:input.url,window.location.href);if(url.pathname.endsWith("/api/viewer/project/${PROJECT_ID}/widgets")){const pageId=url.searchParams.get("pageId");if(widgetMap[pageId]){return {kind:"file",url:new URL(widgetMap[pageId],document.baseURI).href};}}if(url.pathname.endsWith("/api/fonts/webtype/css")){return {kind:"file",url:new URL("assets/fonts/webtype.css",document.baseURI).href};}if(url.pathname.endsWith("/api/fonts/typetoday/css")){return {kind:"file",url:new URL("assets/fonts/typetoday.css",document.baseURI).href};}if(url.pathname.includes("/api/countview/")){return {kind:"noop"};}}catch{}return null;};const nativeFetch=window.fetch.bind(window);window.fetch=function(input,init){const target=resolveTarget(input);if(!target){return nativeFetch(input,init);}if(target.kind==="noop"){return Promise.resolve(new Response("",{status:204,statusText:"No Content"}));}return nativeFetch(target.url,init);};const NativeXHR=window.XMLHttpRequest;window.XMLHttpRequest=function(){const xhr=new NativeXHR();const open=xhr.open;const send=xhr.send;let noop=false;xhr.open=function(method,url,async,user,password){const target=resolveTarget(url);if(target&&target.kind==="file"){return open.call(this,method,target.url,async,user,password);}if(target&&target.kind==="noop"){noop=true;return open.call(this,"GET",new URL("assets/static/empty.txt",document.baseURI).href,async,user,password);}return open.call(this,method,url,async,user,password);};xhr.send=function(body){if(noop){return send.call(this,null);}return send.call(this,body);};return xhr;};if(typeof navigator.sendBeacon==="function"){const nativeSendBeacon=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=function(url,data){const target=resolveTarget(url);if(target&&target.kind==="noop"){return true;}return nativeSendBeacon(url,data);};}})();</script>`;
}

function buildViewerConfigScript() {
  return `<script>(function(){const propsId="__RM_PROPS__";const basePath=(function(){const pathname=new URL(document.baseURI).pathname||"/";return pathname==="/"?"/":pathname.replace(/\\/+$/,"")+"/";})();const propsNode=document.getElementById(propsId);if(propsNode&&propsNode.dataset&&propsNode.dataset.content){try{const props=JSON.parse(propsNode.dataset.content);props.isDownloadedSource=true;props.homepageRewrite=false;props.exportBasePath=basePath;props.config=props.config||{};props.config.root=basePath;propsNode.dataset.content=JSON.stringify(props);}catch{}}if(window.ServerData&&typeof window.ServerData==="object"){window.ServerData.isDownloadedSource=true;window.ServerData.homepageRewrite=false;window.ServerData.exportBasePath=basePath;window.ServerData.config=window.ServerData.config||{};window.ServerData.config.root=basePath;}window.viewerConfig=window.viewerConfig||{};viewerConfig.readymagTracker=false;viewerConfig.isProjectOwnedByRM=false;viewerConfig.userTracker=false;viewerConfig.isDomainViewer=true;viewerConfig.customDomainProfile=window.ServerData&&window.ServerData.mags?window.ServerData.mags.domainForUser:false;viewerConfig.homepageRewrite=false;viewerConfig.isDownloadedSource=true;viewerConfig.exportBasePath=basePath;window.RM=window.RM||{};window.RM.config=window.RM.config||{};window.RM.config.root=basePath;})();</script>`;
}

function rewritePageHtml(html, page) {
  let output = stripTracking(html);
  const outputFile = pageOutputFile(page);

  output = output.replace("<head>", `<head><base href="${baseHrefForPage(page)}"/>`);

  output = output
    .replace(/<link rel="preload" as="style" href="\/api\/fonts\/webtype\/css"\/>/g, buildFontLinksMarkup())
    .replace(/<link rel="preload" as="style" href="\/api\/fonts\/typetoday\/css"\/>/g, "")
    .replace(/<link rel="preload" as="style" href="https:\/\/fonts\.googleapis\.com\/css\?family=[^"]+"\/>/g, "")
    .replace(/<link rel="(?:prev|next|canonical)"[^>]*\/>/g, "")
    .replace(/<meta content="[^"]*" property="og:url"\/>/g, "")
    .replace("viewerConfig.userTracker = true;", "viewerConfig.userTracker = false;");

  output = output.replace(
    /<script>\s*window\.viewerConfig = \{\};[\s\S]*?viewerConfig\.isDownloadedSource = false;\s*<\/script>/,
    buildViewerConfigScript(),
  );

  output = output
    .replaceAll("/api/fonts/webtype/css", "assets/fonts/webtype.css")
    .replaceAll("/api/fonts/typetoday/css", "assets/fonts/typetoday.css")
    .replaceAll(GOOGLE_FONTS_URL.replace(/&/g, "&amp;"), "assets/fonts/google.css")
    .replaceAll(GOOGLE_FONTS_URL, "assets/fonts/google.css")
    .replaceAll("https://fonts.googleapis.com/css?family=Inter:400%7COutfit:100,400,600,500,700%7CJost:400,700,600,500\u0026subset=latin,vietnamese,khmer,cyrillic-ext,greek-ext,greek,devanagari,latin-ext,cyrillic", "assets/fonts/google.css")
    .replaceAll('"/mirror/', '"mirror/')
    .replaceAll("'/mirror/", "'mirror/")
    .replaceAll("(/mirror/", "(mirror/")
    .replaceAll("=/mirror/", "=mirror/")
    .replaceAll("http://localhost:4173/", "./")
    .replaceAll("https://www.riviera-moretti.com/home", "./")
    .replaceAll("https://riviera-moretti.com/home", "./")
    .replaceAll("https://www.riviera-moretti.com/behindtheshadow/", "behindtheshadow/")
    .replaceAll("https://riviera-moretti.com/behindtheshadow/", "behindtheshadow/")
    .replaceAll("https://www.riviera-moretti.com/behindtheshadow", "behindtheshadow/")
    .replaceAll("https://riviera-moretti.com/behindtheshadow", "behindtheshadow/")
    .replaceAll("https://www.riviera-moretti.com/booking/", "booking/")
    .replaceAll("https://riviera-moretti.com/booking/", "booking/")
    .replaceAll("https://www.riviera-moretti.com/booking", "booking/")
    .replaceAll("https://riviera-moretti.com/booking", "booking/")
    .replaceAll("https://www.riviera-moretti.com/legal/", "legal/")
    .replaceAll("https://riviera-moretti.com/legal/", "legal/")
    .replaceAll("https://www.riviera-moretti.com/legal", "legal/")
    .replaceAll("https://riviera-moretti.com/legal", "legal/")
    .replaceAll("https://www.riviera-moretti.com/mobile/", "mobile/")
    .replaceAll("https://riviera-moretti.com/mobile/", "mobile/")
    .replaceAll("https://www.riviera-moretti.com/mobile", "mobile/")
    .replaceAll("https://riviera-moretti.com/mobile", "mobile/")
    .replaceAll("https://www.riviera-moretti.com/", "./")
    .replaceAll("https://riviera-moretti.com/", "./");

  output = output.replace(
    /<script src="(?:https:\/\/st-p\.rmcdn1\.net\/4151880c\/dist\/viewer\.js|mirror\/st-p\.rmcdn1\.net\/4151880c\/dist\/viewer\.js)" type="module"><\/script>/,
    `${buildStaticRuntimeShim()}<script src="mirror/st-p.rmcdn1.net/4151880c/dist/viewer.js" type="module"></script>`,
  );

  return rewriteTextAsset(output, outputFile);
}

async function downloadAsset(urlString) {
  const destination = diskPathFromMirrorUrl(urlString);

  try {
    await fs.access(destination);
    return;
  } catch {
    // File not present yet.
  }

  try {
    const buffer = await fetchBuffer(urlString);
    await ensureDir(destination);
    await fs.writeFile(destination, buffer);
  } catch (error) {
    console.warn(`Skipping ${urlString}: ${error.message}`);
  }
}

async function downloadAssets(urls) {
  for (const urlString of urls) {
    await downloadAsset(urlString);
  }
}

async function collectPageAssets(browser, pageUrl, collector) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    userAgent: DEFAULT_HEADERS["user-agent"],
  });

  page.on("request", (request) => {
    const requestUrl = request.url();
    if (isMirrorableUrl(requestUrl)) {
      collector.add(requestUrl);
    }
  });

  await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 120000 });
  await page.close();
}

async function listFilesRecursively(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

async function collectAdditionalAssetsFromMirror(collector) {
  const files = await listFilesRecursively(MIRROR_DIR);
  let added = 0;

  for (const file of files) {
    const extension = path.extname(file).toLowerCase();
    if (!TEXT_FILE_EXTENSIONS.has(extension)) {
      continue;
    }

    const text = await fs.readFile(file, "utf8");
    for (const urlString of extractRemoteUrls(text)) {
      if (isDownloadableMirrorUrl(urlString) && !collector.has(urlString)) {
        collector.add(urlString);
        added += 1;
      }
    }
  }

  return added;
}

async function rewriteMirrorTextFiles() {
  const files = await listFilesRecursively(MIRROR_DIR);

  for (const file of files) {
    const extension = path.extname(file).toLowerCase();
    if (!TEXT_FILE_EXTENSIONS.has(extension)) {
      continue;
    }

    const original = await fs.readFile(file, "utf8");
    const rewritten = rewriteTextAsset(original, file);
    if (rewritten !== original) {
      await fs.writeFile(file, rewritten);
    }
  }
}

async function syncDocsToProjectRoot() {
  const entries = await fs.readdir(OUTPUT_DIR, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(OUTPUT_DIR, entry.name);
    const targetPath = path.join(ROOT, entry.name);

    await fs.rm(targetPath, { recursive: true, force: true });
    await fs.cp(sourcePath, targetPath, { recursive: true });
  }
}

async function buildFonts(assetsToMirror) {
  const [webtypeCss, typetodayCss, googleCss] = await Promise.all([
    fetchText(`${ORIGIN}/api/fonts/webtype/css`),
    fetchText(`${ORIGIN}/api/fonts/typetoday/css`),
    fetchText(GOOGLE_FONTS_URL),
  ]);

  collectMirrorableUrlsFromText(webtypeCss, assetsToMirror);
  collectMirrorableUrlsFromText(typetodayCss, assetsToMirror);
  collectMirrorableUrlsFromText(googleCss, assetsToMirror);

  return {
    webtypeCss,
    typetodayCss,
    googleCss,
  };
}

async function build() {
  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const assetsToMirror = new Set();
  const browser = await chromium.launch({ headless: true });
  const pagePayloads = [];

  try {
    for (const page of PAGE_DEFS) {
      const [html, widgets] = await Promise.all([
        fetchText(page.liveUrl),
        fetchJson(
          `${ORIGIN}/api/viewer/project/${PROJECT_ID}/widgets?pageId=${page.pageId}`,
        ),
      ]);

      collectMirrorableUrlsFromText(html, assetsToMirror);
      collectMirrorableUrlsFromNode(widgets, assetsToMirror);
      await collectPageAssets(browser, page.liveUrl, assetsToMirror);

      pagePayloads.push({
        ...page,
        html,
        widgets,
      });
    }
  } finally {
    await browser.close();
  }

  const fonts = await buildFonts(assetsToMirror);

  await downloadAssets(assetsToMirror);

  for (let iteration = 0; iteration < 4; iteration += 1) {
    const added = await collectAdditionalAssetsFromMirror(assetsToMirror);
    if (!added) {
      break;
    }

    await downloadAssets(assetsToMirror);
  }

  await rewriteMirrorTextFiles();

  await Promise.all([
    writeFile(path.join(STATIC_DIR, "empty.txt"), ""),
    writeFile(path.join(OUTPUT_DIR, ".nojekyll"), ""),
    writeFile(
      path.join(FONTS_DIR, "webtype.css"),
      rewriteTextAsset(fonts.webtypeCss, path.join(FONTS_DIR, "webtype.css")),
    ),
    writeFile(
      path.join(FONTS_DIR, "typetoday.css"),
      rewriteTextAsset(fonts.typetodayCss, path.join(FONTS_DIR, "typetoday.css")),
    ),
    writeFile(
      path.join(FONTS_DIR, "google.css"),
      rewriteTextAsset(fonts.googleCss, path.join(FONTS_DIR, "google.css")),
    ),
  ]);

  for (const page of pagePayloads) {
    const rewrittenWidgets = rewriteWidgetNode(page.widgets);
    await writeFile(
      path.join(WIDGETS_DIR, `${page.pageId}.json`),
      JSON.stringify(rewrittenWidgets),
    );

    await writeFile(
      pageOutputFile(page),
      rewritePageHtml(page.html, page),
    );
  }

  await syncDocsToProjectRoot();

  console.log(
    `Static mirror ready in ${OUTPUT_DIR}. Mirrored ${assetsToMirror.size} assets across ${PAGE_DEFS.length} pages.`,
  );
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
