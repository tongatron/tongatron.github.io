const appNode = document.getElementById("app");
const body = document.body;

function resolveProjectUrl(path) {
  const root = new URL(body.dataset.projectRoot, window.location.href);
  return new URL(path || "", root).href;
}

function resolveContentUrl(fileName) {
  const root = new URL(`${body.dataset.contentRoot.replace(/\/?$/, "/")}`, window.location.href);
  return new URL(fileName, root).href;
}

function renderError(message) {
  appNode.innerHTML = `<section class="error-state"><strong>Unable to load editable content.</strong><p>${message}</p></section>`;
}

function createNav(site) {
  const links = [
    { label: site.labels.works, href: site.links.works },
    { label: site.labels.booking, href: site.links.booking },
    { label: site.labels.legal, href: site.links.legal },
    { label: site.labels.archive, href: site.links.archive },
  ];

  return `
    <header class="masthead" data-reveal>
      <a class="brand" href="${resolveProjectUrl(site.links.home)}">${site.title}</a>
      <nav class="nav" aria-label="Primary">
        ${links
          .map(
            (link) =>
              `<a class="nav-link" href="${resolveProjectUrl(link.href)}">${link.label}</a>`,
          )
          .join("")}
      </nav>
    </header>
  `;
}

function createFooter(site) {
  return `
    <footer class="footer" data-reveal data-delay="3">
      <p class="footnote">${site.footerText}</p>
      <div class="footer-links">
        <a href="${resolveProjectUrl(site.links.booking)}">${site.labels.booking}</a>
        <a href="${resolveProjectUrl(site.links.legal)}">${site.labels.legal}</a>
        <a href="${resolveProjectUrl(site.links.archive)}">${site.labels.archive}</a>
      </div>
    </footer>
  `;
}

function formatHomeProjectLine(image) {
  return [image.project, image.year].filter(Boolean).join(" ");
}

function setupHomeSlider() {
  const slider = document.querySelector("[data-home-slider]");
  if (!slider) {
    return;
  }

  const slides = [...slider.querySelectorAll("[data-home-slide]")];
  const dots = [...slider.querySelectorAll("[data-home-dot]")];
  const previousButton = slider.querySelector("[data-home-prev]");
  const nextButton = slider.querySelector("[data-home-next]");

  if (!slides.length) {
    return;
  }

  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  let autoplayId = null;
  if (activeIndex < 0) {
    activeIndex = 0;
  }

  function updateActiveSlide(nextIndex) {
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
      dot.setAttribute("aria-pressed", index === activeIndex ? "true" : "false");
    });
  }

  function stopAutoplay() {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (slides.length < 2) {
      return;
    }
    autoplayId = window.setInterval(() => {
      updateActiveSlide(activeIndex + 1);
    }, 4800);
  }

  previousButton?.addEventListener("click", () => {
    updateActiveSlide(activeIndex - 1);
    startAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    updateActiveSlide(activeIndex + 1);
    startAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      updateActiveSlide(Number.parseInt(dot.dataset.homeDot, 10) || 0);
      startAutoplay();
    });
  });

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", (event) => {
    if (!slider.contains(event.relatedTarget)) {
      startAutoplay();
    }
  });

  updateActiveSlide(activeIndex);
  startAutoplay();
}

function renderHome(siteData, projectData, siteJsonUrl) {
  const site = siteData.site;
  const projectCount = projectData.rows.length;
  const recentYear = projectData.rows.reduce((latest, row) => {
    const year = Number.parseInt(row.year, 10);
    return Number.isNaN(year) ? latest : Math.max(latest, year);
  }, 0);

  const orderedHomeImages = [...siteData.homeImages].sort((left, right) => {
    const leftOrder = Number.parseInt(left.order ?? 0, 10);
    const rightOrder = Number.parseInt(right.order ?? 0, 10);
    return leftOrder - rightOrder;
  });

  const visibleHomeImages = orderedHomeImages.filter((image) => image.src);

  const slides = visibleHomeImages
    .map((image, index) => {
      const projectLine = formatHomeProjectLine(image);
      return `
        <article class="home-slide${index === 0 ? " is-active" : ""}" data-home-slide="${index}" aria-hidden="${index === 0 ? "false" : "true"}">
          <figure class="home-slide-media">
            <img src="${new URL(image.src, siteJsonUrl).href}" alt="${image.alt}" />
          </figure>
          <div class="home-slide-copy">
            ${image.client ? `<strong class="home-slide-client">${image.client}</strong>` : ""}
            ${projectLine ? `<p class="home-slide-project">${projectLine}</p>` : ""}
            ${image.result ? `<p class="home-slide-result">${image.result}</p>` : ""}
          </div>
        </article>
      `;
    })
    .join("");

  const sliderControls =
    visibleHomeImages.length > 1
      ? `
        <div class="home-slider-controls">
          <div class="slider-nav">
            <button type="button" class="slider-button" data-home-prev aria-label="Previous image">Prev</button>
            <button type="button" class="slider-button" data-home-next aria-label="Next image">Next</button>
          </div>
          <div class="slider-dots" aria-label="Home visuals navigation">
            ${visibleHomeImages
              .map(
                (_, index) =>
                  `<button type="button" class="slider-dot${index === 0 ? " is-active" : ""}" data-home-dot="${index}" aria-label="Go to image ${index + 1}" aria-pressed="${index === 0 ? "true" : "false"}"></button>`,
              )
              .join("")}
          </div>
        </div>
      `
      : "";

  appNode.innerHTML = `
    <div class="site">
      ${createNav(site)}
      <section class="page-grid">
        <section class="hero">
          <article class="hero-copy" data-reveal data-delay="1">
            <div>
              <p class="eyebrow">${site.homeEyebrow}</p>
              <h1 class="hero-title">${site.homeHeadline}</h1>
            </div>
            <div class="page-grid">
              <p class="body-copy">${site.homeIntro}</p>
              <p class="meta-copy muted">${site.homeSecondaryText}</p>
              <div class="chip-row">
                <a class="chip-link" href="${resolveProjectUrl(site.links.works)}">${site.labels.works}</a>
                <a class="chip-link" href="${resolveProjectUrl(site.links.booking)}">${site.labels.booking}</a>
                <a class="chip-link" href="${resolveProjectUrl(site.links.archive)}">${site.labels.archive}</a>
              </div>
            </div>
          </article>
          <section class="hero-visuals" data-reveal data-delay="2">
            <div class="home-slider" data-home-slider>
              <div class="home-slider-stage">
                ${slides}
              </div>
              ${sliderControls}
            </div>
          </section>
        </section>

        <section class="split-panels">
          <article class="glass-panel" data-reveal data-delay="1">
            <p class="eyebrow">${site.projectsEyebrow}</p>
            <h2 class="section-title">${site.projectsTitle}</h2>
            <p class="body-copy">${site.projectsIntro}</p>
          </article>
          <section class="stats-grid">
            <article class="stat-card" data-reveal data-delay="2">
              <strong>${site.labels.projectCount}</strong>
              <span>${projectCount}</span>
            </article>
            <article class="stat-card" data-reveal data-delay="3">
              <strong>${site.labels.latestYear}</strong>
              <span>${recentYear}</span>
            </article>
          </section>
        </section>
      </section>
      ${createFooter(site)}
    </div>
  `;

  setupHomeSlider();
}

function renderWorks(siteData, projectData) {
  const site = siteData.site;
  const rows = projectData.rows
    .map((row) => {
      const projectCell = row.link
        ? `<a class="project-link" href="${row.link}" target="_blank" rel="noreferrer">${row.project}</a>`
        : row.project;
      const imageCell = row.image
        ? `<img class="project-thumb" src="${new URL(row.image, resolveContentUrl("projects.json")).href}" alt="${row.imageAlt || row.project}" />`
        : `<div class="project-thumb project-thumb-empty" aria-hidden="true"></div>`;

      return `
        <tr>
          <td data-label="${projectData.columns.image || "Image"}">${imageCell}</td>
          <td data-label="${projectData.columns.client}">${row.client}</td>
          <td data-label="${projectData.columns.project}">${projectCell}</td>
          <td data-label="${projectData.columns.result}">${row.result}</td>
          <td data-label="${projectData.columns.year}">${row.year}</td>
        </tr>
      `;
    })
    .join("");

  appNode.innerHTML = `
    <div class="site">
      ${createNav(site)}
      <section class="page-grid">
        <section class="works-header">
          <article class="glass-panel" data-reveal data-delay="1">
            <p class="eyebrow">${site.worksEyebrow}</p>
            <h1 class="works-title">${site.worksHeadline}</h1>
            <p class="body-copy">${site.worksIntro}</p>
          </article>
        </section>

        <section class="table-panel" data-reveal data-delay="2">
          <p class="eyebrow">${site.projectsEyebrow}</p>
          <h2 class="section-title">${site.projectsTitle}</h2>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>${projectData.columns.image || "Image"}</th>
                  <th>${projectData.columns.client}</th>
                  <th>${projectData.columns.project}</th>
                  <th>${projectData.columns.result}</th>
                  <th>${projectData.columns.year}</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>
      </section>
      ${createFooter(site)}
    </div>
  `;
}

async function main() {
  try {
    const siteUrl = resolveContentUrl("site.json");
    const projectsUrl = resolveContentUrl("projects.json");
    const [siteResponse, projectsResponse] = await Promise.all([
      fetch(siteUrl),
      fetch(projectsUrl),
    ]);

    if (!siteResponse.ok || !projectsResponse.ok) {
      throw new Error("JSON content files are missing or unreadable.");
    }

    const [siteData, projectData] = await Promise.all([
      siteResponse.json(),
      projectsResponse.json(),
    ]);

    if (body.dataset.page === "works") {
      renderWorks(siteData, projectData);
    } else {
      renderHome(siteData, projectData, siteUrl);
    }

    body.classList.add("is-ready");
  } catch (error) {
    renderError(error instanceof Error ? error.message : "Unknown error");
  }
}

main();
