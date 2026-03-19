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

  const imageCards = orderedHomeImages
    .map((image, index) => {
      const classes = index === 0 ? "image-card featured" : "image-card";
      const caption = image.caption ? `<div class="image-meta"><strong>${image.caption}</strong>${image.note ? `<span>${image.note}</span>` : ""}</div>` : "";
      return `
        <figure class="${classes}" data-reveal data-delay="${Math.min(index + 1, 3)}">
          <img src="${new URL(image.src, siteJsonUrl).href}" alt="${image.alt}" />
          ${caption}
        </figure>
      `;
    })
    .join("");

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
          <section class="hero-visuals">
            ${imageCards}
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
