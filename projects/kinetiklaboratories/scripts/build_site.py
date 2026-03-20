#!/usr/bin/env python3
from __future__ import annotations

import html
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup, Tag


ROOT = Path(__file__).resolve().parents[1]
ASSETS_DIR = ROOT / "assets"
CSS_DIR = ASSETS_DIR / "css"
IMAGE_DIR = ASSETS_DIR / "images"

SOURCE_HOME = "https://kinetiklaboratories.blogspot.com/"
BOOTSTRAP_CSS = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
BOOTSTRAP_JS = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
GOOGLE_FONTS = (
    "https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500;700&"
    "family=Rajdhani:wght@500;600;700&display=swap"
)


session = requests.Session()
session.headers.update(
    {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"
        )
    }
)
requests.packages.urllib3.disable_warnings()


@dataclass(frozen=True)
class PageConfig:
    slug: str
    title: str
    source_url: str
    output_name: str
    nav_label: str


PAGES: list[PageConfig] = [
    PageConfig("protean", "PROTEAN", "https://kinetiklaboratories.blogspot.com/p/protean.html", "protean.html", "PROTEAN"),
    PageConfig("dao", "DAO", "https://kinetiklaboratories.blogspot.com/p/dao.html", "dao.html", "DAO"),
    PageConfig("morphing-noise", "MORPHING NOISE", "https://kinetiklaboratories.blogspot.com/p/morphing-noise_18.html", "morphing-noise.html", "MORPHING NOISE"),
    PageConfig("ill-logic", "ILL-LOGIC", "https://kinetiklaboratories.blogspot.com/p/ill-logic.html", "ill-logic.html", "ILL-LOGIC"),
    PageConfig("xmatrix", "XMATRIX", "https://kinetiklaboratories.blogspot.com/p/xmatrix_16.html", "xmatrix.html", "XMATRIX"),
    PageConfig("gort-the-robot", "GORT THE ROBOT", "https://kinetiklaboratories.blogspot.com/p/gort_10.html", "gort-the-robot.html", "GORT THE ROBOT"),
    PageConfig("dr-jekyll-mr-hyde", "DR.JEKYLL & MR.HYDE", "https://kinetiklaboratories.blogspot.com/p/drjekyll.html", "dr-jekyll-mr-hyde.html", "DR.JEKYLL & MR.HYDE"),
    PageConfig("harsh-noise-generator", "HARSH NOISE GENERATOR", "https://kinetiklaboratories.blogspot.com/p/harsh-noise-generator.html", "harsh-noise-generator.html", "HARSH NOISE GENERATOR"),
    PageConfig("mot-box", "MOT-BOX", "https://kinetiklaboratories.blogspot.com/p/mot-box.html", "mot-box.html", "MOT-BOX"),
    PageConfig("contact", "CONTACT", "https://kinetiklaboratories.blogspot.com/p/contacts_15.html", "contact.html", "CONTACT"),
]

PAGE_BY_SOURCE = {page.source_url.rstrip("/"): page.output_name for page in PAGES}
PAGE_BY_SOURCE[SOURCE_HOME.rstrip("/")] = "index.html"
PAGE_BY_SOURCE[PAGES[0].source_url.rstrip("/")] = "index.html"


STYLESHEET = """
:root {
  --kl-ink: #56564b;
  --kl-olive: #94a197;
  --kl-olive-deep: #79877b;
  --kl-muted: #7e8a80;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0 0 40px;
  font: normal normal 16px "Inconsolata", monospace;
  color: var(--kl-ink);
  background: #ffffff;
}

a {
  text-decoration: none;
  color: var(--kl-olive);
}

a:hover {
  text-decoration: underline;
  color: var(--kl-ink);
}

.site-shell {
  width: 100%;
}

.banner-frame {
  display: block;
  background: #050505;
}

.banner-frame img {
  display: block;
  width: 100%;
  height: auto;
}

.top-nav {
  background: var(--kl-olive);
}

.top-nav .navbar-toggler {
  margin: 0.75rem 1rem;
  border-color: rgba(255, 255, 255, 0.65);
}

.top-nav .navbar-nav {
  width: 100%;
}

.top-nav .nav-link {
  padding: 0.75rem 1.15rem;
  border-right: 1px solid rgba(255, 255, 255, 0.75);
  color: #ffffff;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: uppercase;
  white-space: nowrap;
}

.top-nav .nav-link:hover,
.top-nav .nav-link:focus {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.top-nav .nav-link.active {
  background: rgba(255, 255, 255, 0.22);
}

.content-wrap {
  padding: 30px clamp(24px, 2.8vw, 42px) 0;
}

.page-heading {
  margin-bottom: 2rem;
}

.section-title {
  font-family: "Rajdhani", sans-serif;
  line-height: 0.95;
  text-transform: uppercase;
  font-size: clamp(2.1rem, 4vw, 3.4rem);
  margin-bottom: 1rem;
}

.lead-copy {
  font-size: 1.06rem;
  line-height: 1.65;
  margin-bottom: 0;
}

.hero-image {
  width: 100%;
  height: auto;
  display: block;
}

.page-secondary {
  color: var(--kl-muted);
  font-size: 0.98rem;
  line-height: 1.6;
}

.protean-layout {
  padding-top: 6px;
}

.protean-copy {
  font-size: 1.08rem;
  line-height: 1.6;
}

.protean-copy p {
  margin-bottom: 0.45rem;
  text-align: left;
}

.protean-openmark {
  display: block;
  width: min(100%, 220px);
  margin-left: auto;
}

.protean-shot-row {
  margin-top: 0.75rem;
}

.protean-shot {
  display: block;
  width: 100%;
  max-width: 640px;
}

.protean-module {
  margin-top: 3rem;
}

.protean-module-title {
  margin: 0 0 0.6rem;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.protean-diagram {
  display: block;
  width: min(100%, 640px);
  margin-left: auto;
}

.protean-media {
  margin-top: 3rem;
}

.dao-layout {
  padding-top: 1rem;
}

.dao-hero-image {
  display: block;
  width: min(100%, 400px);
}

.dao-copy {
  font-size: 1.06rem;
  line-height: 1.55;
}

.dao-copy p {
  margin-bottom: 0.55rem;
  text-align: left;
}

.dao-copy strong {
  font-weight: 700;
}

.dao-section {
  margin-top: 4rem;
}

.dao-pattern-lead {
  margin-top: 1.5rem;
}

.dao-pattern-row {
  margin-top: 1.25rem;
}

.dao-pattern-image {
  display: block;
  width: min(100%, 370px);
}

.dao-media {
  max-width: 640px;
  margin-top: 3rem;
}

.morphing-layout {
  padding-top: 1rem;
}

.morphing-hero {
  display: block;
  width: min(100%, 400px);
}

.morphing-copy {
  font-size: 1.06rem;
  line-height: 1.55;
}

.morphing-copy p {
  margin-bottom: 0.55rem;
  text-align: left;
}

.morphing-copy strong {
  font-weight: 700;
}

.morphing-media {
  max-width: 500px;
  margin-top: 4rem;
  margin-left: auto;
}

.illogic-layout {
  padding-top: 1rem;
}

.illogic-hero {
  display: block;
  width: min(100%, 400px);
}

.illogic-copy {
  font-size: 1.06rem;
  line-height: 1.55;
}

.illogic-copy p {
  margin-bottom: 0.55rem;
  text-align: left;
}

.illogic-copy strong {
  font-weight: 700;
}

.illogic-module {
  margin-top: 3.75rem;
}

.illogic-panel {
  display: block;
  width: min(100%, 340px);
}

.illogic-soundcloud {
  margin-top: 2.5rem;
  max-width: 1420px;
}

.illogic-youtube {
  margin-top: 1.75rem;
  max-width: 1140px;
}

.xmatrix-layout {
  padding-top: 1rem;
}

.xmatrix-hero {
  display: block;
  width: min(100%, 400px);
}

.xmatrix-copy {
  font-size: 1.06rem;
  line-height: 1.55;
}

.xmatrix-copy p {
  margin-bottom: 0.55rem;
  text-align: left;
}

.xmatrix-copy strong {
  font-weight: 700;
}

.xmatrix-media {
  max-width: 500px;
  margin-top: 4rem;
  margin-left: auto;
}

.gort-layout {
  padding-top: 1rem;
}

.gort-hero {
  display: block;
  width: min(100%, 400px);
}

.gort-copy {
  font-size: 1.06rem;
  line-height: 1.55;
}

.gort-copy p {
  margin-bottom: 0.55rem;
  text-align: left;
}

.gort-copy strong {
  font-weight: 700;
}

.gort-media {
  max-width: 500px;
  margin-top: 4rem;
  margin-left: auto;
}

.drjekyll-layout {
  padding-top: 1rem;
}

.drjekyll-hero {
  display: block;
  width: min(100%, 400px);
}

.drjekyll-copy {
  font-size: 1.06rem;
  line-height: 1.55;
}

.drjekyll-copy p {
  margin-bottom: 0.55rem;
  text-align: left;
}

.drjekyll-copy strong {
  font-weight: 700;
}

.drjekyll-media {
  max-width: 500px;
  margin-top: 4rem;
  margin-left: auto;
}

.hng-layout {
  padding-top: 0.5rem;
}

.hng-copy {
  font-size: 1.06rem;
  line-height: 1.55;
}

.hng-copy p {
  margin-bottom: 0.55rem;
  text-align: left;
}

.hng-openmark {
  display: block;
  width: min(100%, 220px);
  margin-left: auto;
}

.hng-device {
  display: block;
  width: min(100%, 400px);
}

.hng-section {
  margin-top: 3.5rem;
}

.hng-schematic {
  display: block;
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
}

.hng-print-image {
  display: block;
  width: min(100%, 400px);
}

.hng-video {
  max-width: 640px;
  margin-top: 2.5rem;
  margin-left: auto;
}

.motbox-layout {
  padding-top: 1rem;
}

.motbox-hero {
  display: block;
  width: min(100%, 420px);
}

.motbox-copy {
  font-size: 1.06rem;
  line-height: 1.55;
}

.motbox-copy p {
  margin-bottom: 0.55rem;
  text-align: left;
}

.motbox-copy strong {
  font-weight: 700;
}

.motbox-media {
  max-width: 500px;
  margin-top: 4rem;
  margin-left: auto;
}

.contact-layout {
  padding-top: 0.25rem;
}

.contact-copy {
  max-width: 1480px;
  font-size: 1.06rem;
  line-height: 1.55;
}

.contact-copy p {
  margin: 0 0 1.9rem;
  text-align: left;
}

.contact-copy strong {
  font-weight: 700;
}

.contact-soundcloud {
  max-width: 1480px;
  margin-top: 2.4rem;
}

.legacy-content {
  font-size: 1.06rem;
  line-height: 1.72;
}

.legacy-content h3,
.legacy-content h4 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-family: "Rajdhani", sans-serif;
  font-size: 2rem;
  line-height: 1.05;
  text-transform: uppercase;
}

.legacy-content figure,
.legacy-content .article-figure {
  margin: 1.5rem 0;
  text-align: center;
}

.legacy-content .legacy-block,
.legacy-content p,
.legacy-content li {
  text-align: justify;
}

.legacy-content .legacy-block {
  margin-bottom: 1.1rem;
}

.legacy-content img {
  max-width: 100%;
  height: auto;
}

.legacy-image {
  display: inline-block;
}

.embed-shell {
  margin: 1.75rem 0;
}

.embed-shell iframe {
  width: 100%;
  min-height: 360px;
  border: 0;
  display: block;
}

.soundcloud-shell iframe {
  min-height: 320px;
}

.site-footer {
  display: none;
}

@media (max-width: 1199.98px) {
  .top-nav .nav-link {
    border-right: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
  }
}

@media (max-width: 767.98px) {
  body {
    padding: 0 0 24px;
  }

  .content-wrap {
    padding: 24px 20px 0;
  }

  .embed-shell iframe {
    min-height: 240px;
  }

  .protean-openmark,
  .protean-diagram,
  .dao-pattern-image {
    margin-left: 0;
  }

  .protean-module {
    margin-top: 2.2rem;
  }

  .dao-section {
    margin-top: 2.5rem;
  }

  .morphing-media {
    margin-top: 2.5rem;
    margin-left: 0;
  }

  .illogic-module {
    margin-top: 2.5rem;
  }

  .xmatrix-media {
    margin-top: 2.5rem;
    margin-left: 0;
  }

  .gort-media {
    margin-top: 2.5rem;
    margin-left: 0;
  }

  .drjekyll-media {
    margin-top: 2.5rem;
    margin-left: 0;
  }

  .hng-openmark,
  .hng-video {
    margin-left: 0;
  }

  .hng-section {
    margin-top: 2.4rem;
  }

  .motbox-media {
    margin-top: 2.5rem;
    margin-left: 0;
  }

  .contact-copy p {
    margin-bottom: 1.35rem;
  }

  .contact-soundcloud {
    margin-top: 1.75rem;
  }
}
""".strip()


def fetch(url: str) -> requests.Response:
    response = session.get(url, verify=False, timeout=30)
    response.raise_for_status()
    return response


def fetch_soup(url: str) -> BeautifulSoup:
    return BeautifulSoup(fetch(url).text, "html.parser")


def safe_filename(url: str, fallback: str) -> str:
    parsed = urlparse(url)
    name = Path(parsed.path).name or fallback
    name = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip("-")
    if "." not in name:
        name = f"{name}.bin"
    return name or fallback


def download_asset(url: str, destination_dir: Path, fallback_name: str) -> str:
    destination_dir.mkdir(parents=True, exist_ok=True)
    filename = safe_filename(url, fallback_name)
    destination = destination_dir / filename
    if not destination.exists():
        response = fetch(url)
        destination.write_bytes(response.content)
    return destination.relative_to(ROOT).as_posix()


def trim_text(text: str, length: int = 240) -> str:
    compact = " ".join(text.split())
    if len(compact) <= length:
        return compact
    clipped = compact[: length - 1]
    if " " in clipped:
        clipped = clipped.rsplit(" ", 1)[0]
    return clipped + "…"


def detect_year(text: str) -> str | None:
    match = re.search(r"Production year:\s*(\d{4})", text, re.IGNORECASE)
    if match:
        return match.group(1)
    match = re.search(r"from\s+(\d{4})\s+to\s+(\d{4})", text, re.IGNORECASE)
    if match:
        return f"{match.group(1)}-{match.group(2)}"
    return None


def internal_target(href: str) -> str | None:
    normalized = href.rstrip("/")
    return PAGE_BY_SOURCE.get(normalized)


def merge_classes(tag: Tag, extra: Iterable[str]) -> None:
    current = tag.get("class", [])
    merged: list[str] = []
    for item in list(current) + list(extra):
        if item and item not in merged:
            merged.append(item)
    if merged:
        tag["class"] = merged


def normalize_iframe(iframe: Tag, soup: BeautifulSoup, slug: str) -> None:
    src = iframe.get("src", "").strip()
    wrapper = soup.new_tag("div")
    if "soundcloud.com" in src:
        wrapper["class"] = ["embed-shell", "soundcloud-shell"]
        iframe.attrs = {
            "src": src,
            "loading": "lazy",
            "title": f"{slug} audio player",
            "allow": "autoplay",
        }
    else:
        wrapper["class"] = ["embed-shell", "ratio", "ratio-16x9"]
        iframe.attrs = {
            "src": src,
            "loading": "lazy",
            "title": f"{slug} media player",
            "allowfullscreen": "allowfullscreen",
            "allow": "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
            "referrerpolicy": "strict-origin-when-cross-origin",
        }
    iframe.wrap(wrapper)


def clean_body(body: Tag, page: PageConfig) -> tuple[str, list[str]]:
    working = BeautifulSoup(str(body), "html.parser")
    root = working.find()
    downloaded_images: list[str] = []

    for tag in working.select("script, style"):
        tag.decompose()

    for figure in working.select("div.separator"):
        figure.name = "figure"
        figure.attrs = {}
        figure["class"] = ["article-figure"]

    for font_tag in working.find_all("font"):
        font_tag.unwrap()

    for span_tag in working.find_all("span"):
        if not span_tag.attrs:
            continue
        span_tag.attrs = {}

    for anchor in working.find_all("a"):
        href = anchor.get("href", "").strip()
        if href.startswith("//"):
            href = "https:" + href
        if href.startswith("mailto:%3C/tt%3E"):
            href = "mailto:kinetik.laboratories@gmail.com"
        local_target = internal_target(href)
        if local_target:
            href = local_target
        if href:
            anchor["href"] = href
        if anchor.find("img") is None:
            merge_classes(anchor, ["content-link"])
        if href.startswith("http"):
            anchor["target"] = "_blank"
            anchor["rel"] = "noreferrer"
        for attribute in ["imageanchor", "style", "data-original-height", "data-original-width"]:
            anchor.attrs.pop(attribute, None)

    for image in working.find_all("img"):
        source_url = image.get("src", "").strip()
        parent = image.parent if isinstance(image.parent, Tag) else None
        if parent and parent.name == "a":
            parent_href = parent.get("href", "").strip()
            if "blogger.googleusercontent.com" in parent_href:
                source_url = parent_href
        if source_url.startswith("//"):
            source_url = "https:" + source_url
        local_path = download_asset(source_url, IMAGE_DIR / page.slug, safe_filename(source_url, "image.png"))
        downloaded_images.append(local_path)
        image.attrs = {
            "src": local_path,
            "alt": f"{page.title} illustration",
            "loading": "lazy",
        }
        merge_classes(image, ["img-fluid", "legacy-image"])
        if parent and parent.name == "a" and "href" in parent.attrs and "blogger.googleusercontent.com" in parent["href"]:
            parent["href"] = local_path
            parent["target"] = "_blank"
            parent["rel"] = "noreferrer"

    for iframe in working.find_all("iframe"):
        normalize_iframe(iframe, working, page.slug)

    for tag in working.find_all(True):
        if tag.name in {"img", "iframe", "a"}:
            continue
        if tag.name not in {"figure"}:
            tag.attrs.pop("style", None)
        tag.attrs.pop("dir", None)
        tag.attrs.pop("border", None)
        tag.attrs.pop("width", None)
        tag.attrs.pop("height", None)
        tag.attrs.pop("data-original-height", None)
        tag.attrs.pop("data-original-width", None)
        if tag.name == "div":
            merge_classes(tag, ["legacy-block"])

    for empty in list(working.find_all(True)):
        if empty.name in {"br", "img", "iframe"}:
            continue
        if empty.get_text(" ", strip=True) == "" and not empty.find(["img", "iframe"]):
            empty.decompose()

    html_output = root.decode_contents() if root else ""
    html_output = re.sub(r"\n{3,}", "\n\n", html_output).strip()
    return html_output, downloaded_images


def nav_markup(active_slug: str | None) -> str:
    items = []
    for page in PAGES:
        active = " active" if page.slug == active_slug else ""
        href = "index.html" if page.slug == "protean" else page.output_name
        items.append(
            f'<li class="nav-item"><a class="nav-link{active}" href="{href}">{html.escape(page.nav_label)}</a></li>'
        )
    return f"""
<nav class="navbar navbar-expand-xl navbar-dark top-nav">
  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#siteNav" aria-controls="siteNav" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="siteNav">
    <ul class="navbar-nav flex-xl-wrap">
      {''.join(items)}
    </ul>
  </div>
</nav>
""".strip()


def base_template(*, title: str, description: str, active_slug: str | None, banner_path: str, favicon_path: str, content: str) -> str:
    return f"""<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(description)}">
  <link rel="icon" href="{favicon_path}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="{GOOGLE_FONTS}" rel="stylesheet">
  <link href="{BOOTSTRAP_CSS}" rel="stylesheet">
  <link href="assets/css/styles.css" rel="stylesheet">
</head>
<body>
  <div class="site-shell">
    <header class="site-header">
      <a class="banner-frame" href="index.html">
        <img src="{banner_path}" alt="Kinetik Laboratories banner">
      </a>
      {nav_markup(active_slug)}
    </header>
    <main class="content-wrap container-xxl">
      {content}
    </main>
    <footer class="site-footer"></footer>
  </div>
  <script src="{BOOTSTRAP_JS}"></script>
</body>
</html>
"""


def build_home(pages_data: list[dict], banner_path: str, favicon_path: str) -> str:
    return build_page(pages_data[0], banner_path, favicon_path)


def build_protean_page(item: dict, banner_path: str, favicon_path: str) -> str:
    content = """
<section class="protean-layout">
  <div class="row g-4 align-items-start protean-intro">
    <div class="col-lg-9">
      <div class="protean-copy">
        <p>The <b>PROTEAN</b> Motion Texture Source is a compact device that incorporates three independent sound generators for the production of a wide variety of sonic environments with a ever changing expressive vitality.</p>
        <p>All sound parameters can be modified through direct manipulation of the knobs allowing a direct, fast and intuitive performance.</p>
        <p>The sound generators have complementary timbral characteristic covering all the frequency spectrum and may also be modulated by the two low frequency oscillators implemented in the circuit, generating hypnotic sounds which evolve over time.</p>
        <p>Protean has three independent outputs, each with its own output level to allow further manipulation using external effects and may also be used in mono mode when in the needs of a reduced setup.</p>
        <p>It must be supplied with an external power supply, providing 9vDC on 2.1mm barrel jack, negative tip.</p>
        <p class="mb-0">We produced the Protean from 2015 to 2017. Since we still receive requests, from 2020 the schematics and the fabrication files are publicly available.</p>
      </div>
    </div>
    <div class="col-lg-3">
      <img class="protean-openmark" src="assets/images/protean/open.png" alt="Open source hardware">
    </div>
  </div>

  <div class="row g-4 protean-shot-row">
    <div class="col-lg-7">
      <img class="protean-shot" src="assets/images/protean/Protean.png" alt="Protean Motion Texture Source">
    </div>
  </div>

  <div class="row g-5 align-items-start protean-module">
    <div class="col-lg-5">
      <h2 class="protean-module-title">CLUSTER</h2>
      <div class="protean-copy">
        <p>It’s composed by four frequency controlled oscillators, freely tunable using the FREQUENCY knobs. It allows the creation of eternally sustained chords and clusters of microtonal intervals. This generator provides a sonorous foundation for other sounds.</p>
      </div>
    </div>
    <div class="col-lg-7">
      <img class="protean-diagram" src="assets/images/protean/Cluster.png" alt="Protean Cluster section">
    </div>
  </div>

  <div class="row g-5 align-items-start protean-module">
    <div class="col-lg-5">
      <h2 class="protean-module-title">DUAL RING</h2>
      <div class="protean-copy">
        <p>The signal from the MAIN square oscillator is processed by two ring modulation circuits with the oscillator A in parallel with the oscillator B. The two resultants are added up to generate the final output.</p>
        <p class="mb-0">This configuration allows the creation of the typical sounds found in the early experimental electronic music and in the 50’s and 60’s sci-fi movie soundtracks. Careful adjustments of the oscillator pitches result in evocative and constantly changing textures, bell-like or otherwise metallic sounds.</p>
      </div>
    </div>
    <div class="col-lg-7">
      <img class="protean-diagram" src="assets/images/protean/Dual_ring.png" alt="Protean Dual Ring section">
    </div>
  </div>

  <div class="row g-5 align-items-start protean-module">
    <div class="col-lg-5">
      <h2 class="protean-module-title">CHAOS</h2>
      <div class="protean-copy">
        <p class="mb-0">The CHAOS circuit is formed by three oscillators modulating each other and generates similar sounds to those obtainable with cross modulation technique. Its sonic character far exceeds the typical white and pink noise sources. Tuning the oscillator pitches allows timbral metamorphosis and complex variations in tone and sound granularity.</p>
      </div>
    </div>
    <div class="col-lg-7">
      <img class="protean-diagram" src="assets/images/protean/Chaos.png" alt="Protean Chaos section">
    </div>
  </div>

  <div class="row g-5 align-items-start protean-module">
    <div class="col-lg-5">
      <h2 class="protean-module-title">MODULATOR</h2>
      <div class="protean-copy">
        <p>The DUAL RING main frequency and the CHAOS oscillator pitches can be automatically modulated using the low frequency oscillators implemented in the MODULATOR sections.</p>
        <p class="mb-0">The WAVEFORM knob is used to select the LFO shape. Six waveforms are available: random ramp, triangle, sawtooth, reverse sawtooth, square and random pulse. In random ramp mode the oscillator pitches are randomly fluctuating while in random pulse the modulation is by a random amount with a random pulse width. The RATE knob sets the modulation speed, when set in counter clockwise position the modulation is disabled.</p>
      </div>
    </div>
    <div class="col-lg-7">
      <img class="protean-diagram" src="assets/images/protean/Modulator.png" alt="Protean Modulator section">
    </div>
  </div>

  <div class="row g-5 align-items-start protean-module">
    <div class="col-lg-5">
      <h2 class="protean-module-title">MIXER</h2>
      <div class="protean-copy">
        <p class="mb-0">The MIXER allows volume level adjustments of the three generators. PROTEAN has three output connections. Using the central output jack you obtain the summed output of the generators. Inserting any of the other jacks removes the relative generator voice from the summed output, sending it out separately.</p>
      </div>
    </div>
    <div class="col-lg-7">
      <img class="protean-diagram" src="assets/images/protean/Mixer.png" alt="Protean Mixer section">
    </div>
  </div>

  <div class="protean-media">
    <div class="embed-shell ratio ratio-16x9">
      <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/0EAdDD0dAvg" title="protean media player"></iframe>
    </div>
    <div class="embed-shell ratio ratio-16x9">
      <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/irRmHTh5Q7I?list=PLE_5u8yUTKkDega3mD-43ZCUMWDLBwbAd" title="protean media player"></iframe>
    </div>
  </div>
</section>
""".strip()

    return base_template(
        title=f"Kinetik Laboratories | {item['title']}",
        description=item["excerpt"],
        active_slug=item["slug"],
        banner_path=banner_path,
        favicon_path=favicon_path,
        content=content,
    )


def build_dao_page(item: dict, banner_path: str, favicon_path: str) -> str:
    content = """
<section class="dao-layout">
  <div class="row g-5 align-items-start">
    <div class="col-lg-4">
      <img class="dao-hero-image" src="assets/images/dao/DAO_LOGO.png" alt="DAO Algorithmic Chopper">
    </div>
    <div class="col-lg-8">
      <div class="dao-copy">
        <p><strong>Production year: 2017</strong></p>
        <p><strong>Dāo</strong> is a pattern controlled gater capable of turning every signal connected to the INPUT JACK into a rhythmic sequence, passing or muting it toward the OUTPUT JACK.</p>
        <p>The rhythm patterns are based on the position of two knobs, PATTERN LENGTH and CHOP NUMBER, allowing an intuitive use of the device. Users can generate up to 136 patterns by setting these knobs.</p>
        <p>The ON/BYPASS switch is used to turn the effect on and to start the pattern generation.</p>
        <p>The CLOCK RATE knob is used to set the internal sequencer tempo.</p>
        <p>The DECAY switch is used to choose the chopped audio slices length. Using SHORT setting is possible to obtain percussive sounds from every kind of continuous sound as pads, drone and noise sounds.</p>
        <p>Dāo generates a 5 Volts pulse, at the beginning of each step, on the SYNC OUTPUT jack. It can also be synchronized to external devices using the SYNC INPUT jack. When a jack is connected to the SYNC INPUT, the CLOCK RATE knob has no effect and the sync signal is replicated to the SYNC OUTPUT allowing synchronization of compatible equipment.</p>
        <p class="mb-0">Dāo must be supplied with an external power supply, providing 9vDC on 2.1mm barrel jack, negative tip.</p>
      </div>
    </div>
  </div>

  <div class="dao-section dao-copy">
    <p>Dāo rhythm patterns are generated using the Euclidean algorithm, one of the oldest algorithms known. Godfried Toussaint, a computer scientist based in Montreal’s McGill University, has pointed out a connection between the mathematical procedure and most of the musical rhythms. His research paper can be found <a href="http://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf" target="_blank" rel="noreferrer">here</a>.</p>
    <p>Dāo rhythm patterns are based on reverse Euclidean strings and have a strong musical appeal.</p>
    <p>The pattern length can be selected by using the corresponding knob, in a range from 1 to 16 steps. The CHOP NUMBER knob is used to define how many slices of the input signal are passed to the output.</p>

    <p class="dao-pattern-lead">By way of example, here are some rhythm patterns obtained by setting PATTERN LENGTH and CHOP NUMBER:</p>

    <div class="row g-4 align-items-start dao-pattern-row">
      <div class="col-lg-4">
        <img class="dao-pattern-image" src="assets/images/dao/tresillo.png" alt="Tresillo rhythm pattern">
      </div>
      <div class="col-lg-8">
        <p class="mb-0">This rhythm, called Tresillo, is one of the fundamental rhythms in Cuban music. This pattern is also the most prevalent rhythm in Sub-Saharan African music traditions.</p>
      </div>
    </div>

    <div class="row g-4 align-items-start dao-pattern-row">
      <div class="col-lg-4">
        <img class="dao-pattern-image" src="assets/images/dao/cueca.png" alt="Cueca rhythm pattern">
      </div>
      <div class="col-lg-8">
        <p class="mb-0">This rhythm pattern is widely used in Afro-Cuban and Latin American music.</p>
      </div>
    </div>

    <p class="dao-section mb-0">Using several synchronized Dāo is possible to obtain interesting polyrhythmic sequences, since every device can be set to different pattern length.</p>
  </div>

  <div class="dao-media">
    <div class="embed-shell ratio ratio-16x9">
      <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/videoseries?list=PLE_5u8yUTKkAzMxdp0euxai0Iv3hFt-Yb" title="dao media player"></iframe>
    </div>
  </div>
</section>
""".strip()

    return base_template(
        title=f"Kinetik Laboratories | {item['title']}",
        description=item["excerpt"],
        active_slug=item["slug"],
        banner_path=banner_path,
        favicon_path=favicon_path,
        content=content,
    )


def build_morphing_noise_page(item: dict, banner_path: str, favicon_path: str) -> str:
    content = """
<section class="morphing-layout">
  <div class="row g-5 align-items-start">
    <div class="col-lg-4">
      <img class="morphing-hero" src="assets/images/morphing-noise/Morphing_Noise.png" alt="Morphing Noise sound particles generator">
    </div>
    <div class="col-lg-8">
      <div class="morphing-copy">
        <p><strong>Production year: 2015</strong></p>
        <p><strong>Morphing Noise</strong> combines a noise source sound generator and a modulator circuit.</p>
        <p>The NOISE SOURCE circuit is formed by three oscillators modulating each other and generates similar sounds to those obtainable with cross-modulation technique.</p>
        <p>Its sonic character far exceeds the typical white or pink noise sources.</p>
        <p>Tuning the oscillator pitches allows timbral metamorphosis, with complex variations in tone and granularity.</p>
        <p>The oscillator pitches can be automatically modulated with the low frequency oscillator implemented in the MODULATOR circuit, generating sounds which evolve over time.</p>
        <p class="mb-0">The MORPHING NOISE <i>sound particles generator</i> is ideal to create complex noise backgrounds and a precious tool in the sound design process. It must be supplied with an external power supply, providing 9vDC on 2.1mm barrel jack, negative tip.</p>
      </div>
    </div>
  </div>

  <div class="morphing-media">
    <div class="embed-shell ratio ratio-16x9">
      <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/qghZYhQjdg0?list=PLE_5u8yUTKkA15zNvrkAivEyQK-aXLXNT" title="morphing-noise media player"></iframe>
    </div>
  </div>
</section>
""".strip()

    return base_template(
        title=f"Kinetik Laboratories | {item['title']}",
        description=item["excerpt"],
        active_slug=item["slug"],
        banner_path=banner_path,
        favicon_path=favicon_path,
        content=content,
    )


def build_ill_logic_page(item: dict, banner_path: str, favicon_path: str) -> str:
    content = """
<section class="illogic-layout">
  <div class="row g-5 align-items-start">
    <div class="col-lg-5">
      <img class="illogic-hero" src="assets/images/ill-logic/ILL-OGIC.png" alt="ILL-LOGIC sound texture generator">
    </div>
    <div class="col-lg-5">
      <div class="illogic-copy">
        <p><strong>Production year: 2014</strong></p>
        <p><strong>ILL-LOGIC</strong> is a stand alone compact system with semi-modular structure. It can be used to generate complex sound textures. Using 4mm banana plugs it offers great functional flexibility and small footprint.</p>
        <p>It has 12 knobs, 22 connection points, two switches and a red led that reflects the behavior of the noise generator.</p>
        <p>The input plugs accept any output allowing you to experience the most of its sonic potential.</p>
        <p class="mb-0">It must be supplied with an external power supply, providing 9vDC on 2.1mm barrel jack, negative tip.</p>
      </div>
    </div>
  </div>

  <div class="row g-5 align-items-start illogic-module">
    <div class="col-lg-4">
      <img class="illogic-panel" src="assets/images/ill-logic/NOISE.png" alt="ILL-LOGIC noise generator section">
    </div>
    <div class="col-lg-5">
      <div class="illogic-copy">
        <p>The noise generator circuit is formed by four oscillators modulating each other and generates similar sounds to those obtainable with cross-modulation technique.</p>
        <p>Tuning the oscillator's pitches allows complex variations in tone and granularity.</p>
        <p>The switch can be used to obtain a continous sound (HOLD) or to enable the underlying INPUT plug (GATE).</p>
        <p class="mb-0">The INPUT plug accepts signals coming from LOW FREQUENCY oscillator or signals from any other OUTPUT plug, on which it acts adding timbral contents typical of the NOISE GENERATOR circuit.</p>
      </div>
    </div>
  </div>

  <div class="row g-5 align-items-start illogic-module">
    <div class="col-lg-4">
      <img class="illogic-panel" src="assets/images/ill-logic/OSCILLATORS.png" alt="ILL-LOGIC oscillators section">
    </div>
    <div class="col-lg-5">
      <div class="illogic-copy">
        <p>ILL-LOGIC has four square wave oscillators. Oscillators pitch can be adjusted using the FREQUENCY knob.</p>
        <p>The first oscillator ranges from low frequencies to audio rate and is always active. The A-B-C oscillators have audio frequency range.</p>
        <p>When the switch is in A-B-C HOLD position the oscillators deliver a continued sound. In A-B-C GATED position, a signal must be provided on the INPUT plug to obtain the oscillator sound. Any OUTPUT plug can provide this gate signal.</p>
        <p>Using the low frequency oscillator output to gate the oscillator will provide a pulsing sound. Connecting the NOISE GENERATOR output to the oscillator input allow a slight noise coloring.</p>
        <p class="mb-0">Using the OUTPUT of an oscillator connected to the INPUT of another allows oscillator synchronization.</p>
      </div>
    </div>
  </div>

  <div class="row g-5 align-items-start illogic-module">
    <div class="col-lg-4">
      <img class="illogic-panel" src="assets/images/ill-logic/RING-MOD.png" alt="ILL-LOGIC ring modulator section">
    </div>
    <div class="col-lg-5">
      <div class="illogic-copy">
        <p class="mb-0">This section features three ring modulator stages, each with two inputs and one output. It can process signals from the oscillators and from the noise generator. The OUTPUT plug can be used to provide the gate signal for the oscillator INPUT plug when the oscillator is in gated mode.</p>
      </div>
    </div>
  </div>

  <div class="row g-5 align-items-start illogic-module">
    <div class="col-lg-4">
      <img class="illogic-panel" src="assets/images/ill-logic/MIXER.png" alt="ILL-LOGIC mixer section">
    </div>
    <div class="col-lg-5">
      <div class="illogic-copy">
        <p class="mb-0">A four channel mixer allows volume settings of the signals connected to the INPUT plugs.</p>
      </div>
    </div>
  </div>

  <div class="illogic-copy illogic-module">
    <p class="mb-0">Here some demos. Enjoy.</p>
  </div>

  <div class="illogic-soundcloud">
    <div class="embed-shell soundcloud-shell">
      <iframe allow="autoplay" loading="lazy" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/136133115&amp;color=87978a&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false" title="ill-logic audio player"></iframe>
    </div>
  </div>

  <div class="illogic-youtube">
    <div class="embed-shell ratio ratio-16x9">
      <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/WP5CcWrJ07A" title="ill-logic media player"></iframe>
    </div>
  </div>
</section>
""".strip()

    return base_template(
        title=f"Kinetik Laboratories | {item['title']}",
        description=item["excerpt"],
        active_slug=item["slug"],
        banner_path=banner_path,
        favicon_path=favicon_path,
        content=content,
    )


def build_xmatrix_page(item: dict, banner_path: str, favicon_path: str) -> str:
    content = """
<section class="xmatrix-layout">
  <div class="row g-5 align-items-start">
    <div class="col-lg-4">
      <img class="xmatrix-hero" src="assets/images/xmatrix/XMATRIX_LOGO.png" alt="Xmatrix 3x3 Matrix Mixer">
    </div>
    <div class="col-lg-8">
      <div class="xmatrix-copy">
        <p><strong>Production year: 2013</strong></p>
        <p><strong>Xmatrix</strong> is a passive matrix mixer with 3 inputs and 3 outputs. It can be used to distribute signals to different effect chains and amplification systems or to control the gain of feedback loops when used in no-input configurations.</p>
        <p>Xmatrix routes multiple input signals to multiple outputs, allowing different mixes from a common set of signals.</p>
        <p class="mb-0">It does not require power supply.</p>
      </div>
    </div>
  </div>

  <div class="xmatrix-media">
    <div class="embed-shell ratio ratio-16x9">
      <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/mfA7mSM3BR8" title="xmatrix media player"></iframe>
    </div>
  </div>
</section>
""".strip()

    return base_template(
        title=f"Kinetik Laboratories | {item['title']}",
        description=item["excerpt"],
        active_slug=item["slug"],
        banner_path=banner_path,
        favicon_path=favicon_path,
        content=content,
    )


def build_gort_page(item: dict, banner_path: str, favicon_path: str) -> str:
    content = """
<section class="gort-layout">
  <div class="row g-5 align-items-start">
    <div class="col-lg-4">
      <img class="gort-hero" src="assets/images/gort-the-robot/GORT_LOGO.png" alt="Gort the Robot step pulse generator">
    </div>
    <div class="col-lg-8">
      <div class="gort-copy">
        <p><strong>Production year: 2013</strong></p>
        <p><strong>Gort the Robot</strong> is constituted by four frequency controlled oscillators, combined through pseudo ring modulator circuits.</p>
        <p>The square wave oscillators can run freely (Stop Mode) or alternatively gated by the 16 steps internal sequencer (Activate Mode). In the latter case each step generates different oscillators combinations and therefore different sounds, varying in tone and timbre.</p>
        <p>Using the SYNC IN jack you can synchronize Gort's steps with pulses coming from external sequencers or drum machines.</p>
        <p class="mb-0">Gort must be supplied with an external power supply, providing 9vDC on 2.1mm barrel jack, negative tip.</p>
      </div>
    </div>
  </div>

  <div class="gort-media">
    <div class="embed-shell ratio ratio-16x9">
      <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/videoseries?list=PLE_5u8yUTKkCkcPx-4EeWBJRfwco6VDO8" title="gort-the-robot media player"></iframe>
    </div>
  </div>
</section>
""".strip()

    return base_template(
        title=f"Kinetik Laboratories | {item['title']}",
        description=item["excerpt"],
        active_slug=item["slug"],
        banner_path=banner_path,
        favicon_path=favicon_path,
        content=content,
    )


def build_drjekyll_page(item: dict, banner_path: str, favicon_path: str) -> str:
    content = """
<section class="drjekyll-layout">
  <div class="row g-5 align-items-start">
    <div class="col-lg-4">
      <img class="drjekyll-hero" src="assets/images/dr-jekyll-mr-hyde/DrJ-MrH_LOGO.png" alt="Dr.Jekyll and Mr.Hyde dual nature generator">
    </div>
    <div class="col-lg-8">
      <div class="drjekyll-copy">
        <p><strong>Production year: 2013</strong></p>
        <p><strong>Dr.Jekyll &amp; Mr.Hyde</strong> is a generator suffering from dissociative identity disorder.</p>
        <p>J&amp;H is formed by two distinct mixable circuit voices, the Jekyll's one is warm, firm and comforting, the other is harsh, noisy and sometimes unpredictable: the Hyde side.</p>
        <p>Each voice has three oscillators with respecting FREQUENCY control.</p>
        <p>The MIXER potentiometer controls the voices mix output level on a 1/4&quot; jack.</p>
        <p>The control panel includes a On-Off switch with corresponding led. The whole is powered by an external power supply, providing 9vDC on 2.1mm barrel jack, negative tip.</p>
      </div>
    </div>
  </div>

  <div class="drjekyll-media">
    <div class="embed-shell ratio ratio-16x9">
      <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/bga3k1PX0rQ" title="dr-jekyll-mr-hyde media player"></iframe>
    </div>
  </div>
</section>
""".strip()

    return base_template(
        title=f"Kinetik Laboratories | {item['title']}",
        description=item["excerpt"],
        active_slug=item["slug"],
        banner_path=banner_path,
        favicon_path=favicon_path,
        content=content,
    )


def build_harsh_noise_page(item: dict, banner_path: str, favicon_path: str) -> str:
    content = """
<section class="hng-layout">
  <div class="row g-4 align-items-start">
    <div class="col-lg-9">
      <div class="hng-copy">
        <p>We produced the Harsh Noise Generator from 2012 to 2014. Since we still receive requests for this little generator, here you find the documentation to build it by yourself. The design is made publicly available so that anyone can study, modify, distribute, make, and sell the hardware based on that design.</p>
      </div>
    </div>
    <div class="col-lg-3">
      <img class="hng-openmark" src="assets/images/harsh-noise-generator/open.png" alt="Open source hardware">
    </div>
  </div>

  <div class="row g-5 align-items-start hng-section">
    <div class="col-lg-4">
      <img class="hng-device" src="assets/images/harsh-noise-generator/HNG.PNG" alt="Harsh Noise Generator">
    </div>
    <div class="col-lg-8">
      <div class="hng-copy">
        <p><strong>HNG</strong> is a minimal noise generator, ideal sound source for your effect chain. It has two operating modes. In the first operation mode the frequency of two oscillators varies randomly around the value set with the knobs named FREQUENCY.</p>
        <p>Turning the unit on with the knobs rotated fully clockwise you access the second operation mode. Noise and silence are alternated with intervals that vary randomly around the value set with the DENSITY knob.</p>
        <p class="mb-0">The INTENSITY knob adjust the noise energy.</p>
      </div>
    </div>
  </div>

  <div class="hng-section">
    <img class="hng-schematic" src="assets/images/harsh-noise-generator/HNG_Schematic.gif" alt="Harsh Noise Generator schematic">
  </div>

  <div class="hng-copy hng-section">
    <p>The circuit is powered with 9V DC. The LM7805, with capacitors C1 and C2, generate a stable 5V for the rest of the circuit.</p>
    <p>The potentiometers are used as a voltage divider and connected to the pins 2 and 3 of the ATtiny chip. The potentiometer value is not critical, you can use any value available.</p>
    <p>The main IC is a ATtiny45 or ATtiny85, a high-performance, low-power Atmel 8-bit microcontroller.</p>
    <p>To program the ATtiny85 chip use an <a href="https://docs.arduino.cc/built-in-examples/arduino-isp/ArduinoISP" target="_blank" rel="noreferrer">Arduino board programmed as ISP</a>. You'll need a breadboard, some piece of wire and an Arduino board. <a href="https://highlowtech.org/?p=1695" target="_blank" rel="noreferrer">Here you can find the instructions to program the ATtiny.</a></p>
    <p class="mb-0">Output is from pin 6 and goes to your output jack through a 220 Ohm resistor and a 1uF capacitor. The output pin is also connected to a LED that blinks according to the sound you hear.</p>
  </div>

  <div class="row g-4 align-items-start hng-section">
    <div class="col-lg-4">
      <img class="hng-print-image mb-4" src="assets/images/harsh-noise-generator/HNG_Copper.gif" alt="Harsh Noise Generator copper layout">
      <img class="hng-print-image" src="assets/images/harsh-noise-generator/HNG_Silk.gif" alt="Harsh Noise Generator silk layout">
    </div>
    <div class="col-lg-8">
      <div class="hng-copy">
        <p>Here's the images to be printed if you use press and peel method.</p>
        <p>Print it at 90 dpi to obtain the right dimensions.</p>
      </div>
    </div>
  </div>

  <div class="row g-4 align-items-start hng-section">
    <div class="col-lg-7">
      <div class="hng-copy">
        <p><a href="https://drive.google.com/file/d/1yqpwl1PmZY55qOJNY_TNLl4INDX8xt6O" target="_blank" rel="noreferrer">Here you can download</a> all the documentation, the gerber files and the software needed to program the ATtiny85.</p>
        <p class="mb-0">Enjoy the build!</p>
      </div>
    </div>
    <div class="col-lg-5">
      <div class="hng-video">
        <div class="embed-shell ratio ratio-16x9">
          <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/8j6fl3iGA0w" title="harsh-noise-generator media player"></iframe>
        </div>
      </div>
    </div>
  </div>
</section>
""".strip()

    return base_template(
        title=f"Kinetik Laboratories | {item['title']}",
        description=item["excerpt"],
        active_slug=item["slug"],
        banner_path=banner_path,
        favicon_path=favicon_path,
        content=content,
    )


def build_motbox_page(item: dict, banner_path: str, favicon_path: str) -> str:
    content = """
<section class="motbox-layout">
  <div class="row g-5 align-items-start">
    <div class="col-lg-4">
      <img class="motbox-hero" src="assets/images/mot-box/Mot-Box.png" alt="Mot-Box sound generator">
    </div>
    <div class="col-lg-8">
      <div class="motbox-copy">
        <p><strong>Production year: 2009</strong></p>
        <p><strong>Mot-Box</strong> is a sound generator, with four audio oscillators, two lfos and two 1/4&quot; jack inputs, available to connect external analog gear. All in a rugged box, with cherry wood side plates. It produces sounds varying from drones to helter-skelter noises.</p>
        <p>The Mot-Box is based on an original, copyrighted design by Arthur Harrison, which is used by his permission. The original cacophonator article is on Art's Theremin Page: <a href="https://www.theremin.us/Circuit_Library/cacophonator.html" target="_blank" rel="noreferrer">theremin.us/Circuit_Library/cacophonator.html</a></p>
        <p class="mb-0">Build your own!</p>
      </div>
    </div>
  </div>

  <div class="motbox-media">
    <div class="embed-shell ratio ratio-16x9">
      <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="allowfullscreen" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/N2agf9q16y8" title="mot-box media player"></iframe>
    </div>
  </div>
</section>
""".strip()

    return base_template(
        title=f"Kinetik Laboratories | {item['title']}",
        description=item["excerpt"],
        active_slug=item["slug"],
        banner_path=banner_path,
        favicon_path=favicon_path,
        content=content,
    )


def build_contact_page(item: dict, banner_path: str, favicon_path: str) -> str:
    content = """
<section class="contact-layout">
  <div class="contact-copy">
    <p>We do not produce our device anymore, but we will be happy to get in touch with you for any info.</p>
    <p>Write us : <strong><a href="mailto:kinetik.laboratories@gmail.com">kinetik.laboratories@gmail.com</a></strong></p>
    <p class="mb-0">Follow us on <strong><a href="https://www.instagram.com/kinetiklaboratories/" target="_blank" rel="noreferrer">Instagram</a></strong></p>
  </div>

  <div class="contact-soundcloud">
    <div class="embed-shell soundcloud-shell">
      <iframe allow="autoplay" loading="lazy" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/125716379&amp;color=7a9387&amp;auto_play=false&amp;show_artwork=true" title="contact audio player"></iframe>
    </div>
  </div>
</section>
""".strip()

    return base_template(
        title=f"Kinetik Laboratories | {item['title']}",
        description=item["excerpt"],
        active_slug=item["slug"],
        banner_path=banner_path,
        favicon_path=favicon_path,
        content=content,
    )


def build_page(item: dict, banner_path: str, favicon_path: str) -> str:
    if item["slug"] == "protean":
        return build_protean_page(item, banner_path, favicon_path)
    if item["slug"] == "dao":
        return build_dao_page(item, banner_path, favicon_path)
    if item["slug"] == "morphing-noise":
        return build_morphing_noise_page(item, banner_path, favicon_path)
    if item["slug"] == "ill-logic":
        return build_ill_logic_page(item, banner_path, favicon_path)
    if item["slug"] == "xmatrix":
        return build_xmatrix_page(item, banner_path, favicon_path)
    if item["slug"] == "gort-the-robot":
        return build_gort_page(item, banner_path, favicon_path)
    if item["slug"] == "dr-jekyll-mr-hyde":
        return build_drjekyll_page(item, banner_path, favicon_path)
    if item["slug"] == "harsh-noise-generator":
        return build_harsh_noise_page(item, banner_path, favicon_path)
    if item["slug"] == "mot-box":
        return build_motbox_page(item, banner_path, favicon_path)
    if item["slug"] == "contact":
        return build_contact_page(item, banner_path, favicon_path)

    intro_column = "col-12"
    hero_media = ""
    if item["hero_image"]:
        intro_column = "col-lg-7"
        hero_media = (
            f'<div class="col-lg-5">'
            f'<img class="hero-image" src="{item["hero_image"]}" alt="{html.escape(item["title"])} cover">'
            f"</div>"
        )
    elif item["slug"] == "contact":
        intro_column = "col-lg-7"
        hero_media = """
<div class="col-lg-5">
  <div class="page-secondary">
    <p class="mb-2">kinetik.laboratories@gmail.com</p>
    <p class="mb-0">Instagram: @kinetiklaboratories</p>
  </div>
</div>
""".strip()

    content = f"""
<section class="page-heading">
  <div class="row g-4 align-items-start">
    <div class="{intro_column}">
      <h1 class="section-title">{html.escape(item["title"])}</h1>
      <p class="lead-copy">{html.escape(item["excerpt"])}</p>
    </div>
    {hero_media}
  </div>
</section>

<section class="legacy-content">
  {item["body_html"]}
</section>
""".strip()

    return base_template(
        title=f"Kinetik Laboratories | {item['title']}",
        description=item["excerpt"],
        active_slug=item["slug"],
        banner_path=banner_path,
        favicon_path=favicon_path,
        content=content,
    )


def collect_pages() -> tuple[list[dict], str, str]:
    home_soup = fetch_soup(SOURCE_HOME)
    banner = home_soup.select_one("#Header1_headerimg")
    favicon = home_soup.select_one("link[rel='icon']")

    banner_path = download_asset(
        banner["src"],
        IMAGE_DIR / "shared",
        safe_filename(banner["src"], "banner.png"),
    )
    favicon_href = favicon["href"] if favicon and favicon.get("href") else urljoin(SOURCE_HOME, "/favicon.ico")
    favicon_path = download_asset(favicon_href, IMAGE_DIR / "shared", "favicon.ico")

    pages_data: list[dict] = []
    for page in PAGES:
        soup = fetch_soup(page.source_url)
        title_node = soup.select_one(".post-title")
        body_node = soup.select_one(".post-body") or soup.select_one(".entry-content")
        if not body_node:
            raise RuntimeError(f"Content not found for {page.source_url}")

        clean_html, images = clean_body(body_node, page)
        text_content = body_node.get_text("\n", strip=True)
        excerpt = trim_text(text_content, 270)
        year = detect_year(text_content)
        media_count = len(body_node.select("iframe"))

        preferred_image = None
        for image_path in images:
            if Path(image_path).name.lower().startswith("open."):
                continue
            preferred_image = image_path
            break
        if preferred_image is None and images:
            preferred_image = images[0]

        pages_data.append(
            {
                "slug": page.slug,
                "title": title_node.get_text(" ", strip=True) if title_node else page.title,
                "nav_label": page.nav_label,
                "source_url": page.source_url,
                "output_name": page.output_name,
                "body_html": clean_html,
                "excerpt": excerpt,
                "year": year,
                "media_count": media_count,
                "hero_image": preferred_image,
            }
        )

    return pages_data, banner_path, favicon_path


def main() -> None:
    CSS_DIR.mkdir(parents=True, exist_ok=True)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    (CSS_DIR / "styles.css").write_text(STYLESHEET + "\n", encoding="utf-8")

    pages_data, banner_path, favicon_path = collect_pages()

    (ROOT / "index.html").write_text(build_home(pages_data, banner_path, favicon_path), encoding="utf-8")
    protean_duplicate = ROOT / PAGES[0].output_name
    if protean_duplicate.exists():
        protean_duplicate.unlink()
    for item in pages_data:
        if item["slug"] == PAGES[0].slug:
            continue
        (ROOT / item["output_name"]).write_text(build_page(item, banner_path, favicon_path), encoding="utf-8")

    print(f"Generated {len(pages_data)} HTML pages in {ROOT}")


if __name__ == "__main__":
    main()
