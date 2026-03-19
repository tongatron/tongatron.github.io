const STORAGE_KEY = "moretti-editable-admin-draft-v1";

const publishedState = {
  siteData: null,
  projectsData: null,
};

const state = {
  siteData: null,
  projectsData: null,
  imageFiles: [],
};

const dom = {
  siteForm: document.getElementById("site-form"),
  linksForm: document.getElementById("links-form"),
  columnsForm: document.getElementById("columns-form"),
  imageForm: document.getElementById("image-form"),
  projectsBody: document.getElementById("projects-body"),
  draftStatus: document.getElementById("draft-status"),
  draftDetail: document.getElementById("draft-detail"),
};

const siteFields = [
  ["title", "Site title", "text"],
  ["homeEyebrow", "Home eyebrow", "text"],
  ["homeHeadline", "Home headline", "textarea"],
  ["homeIntro", "Home intro", "textarea"],
  ["homeSecondaryText", "Home secondary text", "textarea"],
  ["worksEyebrow", "Works eyebrow", "text"],
  ["worksHeadline", "Works headline", "text"],
  ["worksIntro", "Works intro", "textarea"],
  ["worksNote", "Works note", "textarea"],
  ["projectsEyebrow", "Projects eyebrow", "text"],
  ["projectsTitle", "Projects title", "text"],
  ["projectsIntro", "Projects intro", "textarea"],
  ["linksEyebrow", "Links eyebrow", "text"],
  ["footerText", "Footer text", "text"],
];

const linkFields = [
  ["links.home", "Home link"],
  ["links.works", "Works link"],
  ["links.booking", "Booking link"],
  ["links.legal", "Legal link"],
  ["links.archive", "Archive link"],
  ["labels.home", "Home label"],
  ["labels.works", "Works label"],
  ["labels.booking", "Booking label"],
  ["labels.legal", "Legal label"],
  ["labels.archive", "Archive label"],
  ["labels.projectCount", "Project count label"],
  ["labels.latestYear", "Latest year label"],
];

const imagePaths = [
  "editable/assets/uploads/home-01.jpg",
  "editable/assets/uploads/home-02.jpg",
  "editable/assets/uploads/home-03.jpg",
  "editable/assets/uploads/home-04.jpg",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getByPath(target, path) {
  return path.split(".").reduce((accumulator, segment) => accumulator?.[segment], target);
}

function setByPath(target, path, value) {
  const segments = path.split(".");
  const last = segments.pop();
  const holder = segments.reduce((accumulator, segment) => accumulator[segment], target);
  holder[last] = value;
}

function markStatus(message, detail) {
  dom.draftStatus.textContent = message;
  dom.draftDetail.textContent = detail;
}

function persistDraft() {
  const draft = {
    siteData: state.siteData,
    projectsData: state.projectsData,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  markStatus("Local draft saved", "Changes are stored in this browser until you clear them or export the files.");
}

function clearDraftStorage() {
  window.localStorage.removeItem(STORAGE_KEY);
}

function createFieldMarkup(name, label, value, type = "text", full = false) {
  const classes = full ? "field field-full" : "field";
  const fieldId = `field-${name.replaceAll(".", "-")}`;
  if (type === "textarea") {
    return `
      <div class="${classes}">
        <label for="${fieldId}">${label}</label>
        <textarea id="${fieldId}" data-field="${name}">${escapeHtml(value)}</textarea>
      </div>
    `;
  }

  return `
    <div class="${classes}">
      <label for="${fieldId}">${label}</label>
      <input id="${fieldId}" data-field="${name}" type="text" value="${escapeHtml(value)}" />
    </div>
  `;
}

function renderSiteFields() {
  dom.siteForm.innerHTML = siteFields
    .map(([path, label, type]) =>
      createFieldMarkup(
        path,
        label,
        getByPath(state.siteData.site, path),
        type,
        type === "textarea",
      ),
    )
    .join("");

  dom.linksForm.innerHTML = linkFields
    .map(([path, label]) => createFieldMarkup(path, label, getByPath(state.siteData.site, path)))
    .join("");

  dom.columnsForm.innerHTML = Object.entries(state.projectsData.columns)
    .map(([key, value]) => createFieldMarkup(`columns.${key}`, `Column: ${key}`, value))
    .join("");
}

function imageStateFor(index) {
  return state.imageFiles[index];
}

function imageDownloadName(index) {
  return `home-0${index + 1}.jpg`;
}

function renderImages() {
  dom.imageForm.innerHTML = state.siteData.homeImages
    .map((image, index) => {
      const source = imageStateFor(index);
      const previewUrl = source.previewUrl;
      return `
        <article class="image-card">
          <div class="image-preview">
            <img src="${escapeHtml(previewUrl)}" alt="${escapeHtml(image.alt)}" />
          </div>
          <div class="image-meta">
            <span>${escapeHtml(imageDownloadName(index))}</span>
            <button type="button" class="tiny-button" data-download-image="${index}">Download</button>
          </div>
          <div class="field">
            <label for="upload-${index}">Replace image</label>
            <input id="upload-${index}" data-image-upload="${index}" type="file" accept="image/*" />
          </div>
          <div class="field">
            <label for="alt-${index}">Alt text</label>
            <input id="alt-${index}" data-image-text="${index}" data-key="alt" type="text" value="${escapeHtml(image.alt)}" />
          </div>
          <div class="field">
            <label for="caption-${index}">Caption</label>
            <input id="caption-${index}" data-image-text="${index}" data-key="caption" type="text" value="${escapeHtml(image.caption || "")}" />
          </div>
          <div class="field">
            <label for="note-${index}">Note</label>
            <textarea id="note-${index}" data-image-text="${index}" data-key="note">${escapeHtml(image.note || "")}</textarea>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProjectRows() {
  dom.projectsBody.innerHTML = state.projectsData.rows
    .map(
      (row, index) => `
        <tr>
          <td><input data-row="${index}" data-key="client" type="text" value="${escapeHtml(row.client)}" /></td>
          <td><input data-row="${index}" data-key="project" type="text" value="${escapeHtml(row.project)}" /></td>
          <td><input data-row="${index}" data-key="result" type="text" value="${escapeHtml(row.result)}" /></td>
          <td><input data-row="${index}" data-key="year" type="text" value="${escapeHtml(row.year)}" /></td>
          <td><input data-row="${index}" data-key="link" type="text" value="${escapeHtml(row.link || "")}" /></td>
          <td>
            <div class="row-actions">
              <button type="button" class="tiny-button" data-move="up" data-index="${index}">Up</button>
              <button type="button" class="tiny-button" data-move="down" data-index="${index}">Down</button>
              <button type="button" class="tiny-button" data-duplicate="${index}">Duplicate</button>
              <button type="button" class="tiny-button" data-delete="${index}">Delete</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

function renderAll() {
  renderSiteFields();
  renderImages();
  renderProjectRows();
}

function attachTextFieldHandlers() {
  document.querySelectorAll("[data-field]").forEach((field) => {
    field.addEventListener("input", (event) => {
      const target = event.currentTarget;
      const name = target.dataset.field;
      if (name.startsWith("columns.")) {
        setByPath(state.projectsData, name, target.value);
      } else {
        setByPath(state.siteData.site, name, target.value);
      }
      persistDraft();
    });
  });
}

function attachImageTextHandlers() {
  document.querySelectorAll("[data-image-text]").forEach((field) => {
    field.addEventListener("input", (event) => {
      const target = event.currentTarget;
      const index = Number.parseInt(target.dataset.imageText, 10);
      const key = target.dataset.key;
      state.siteData.homeImages[index][key] = target.value;
      persistDraft();
    });
  });
}

function attachImageUploadHandlers() {
  document.querySelectorAll("[data-image-upload]").forEach((field) => {
    field.addEventListener("change", async (event) => {
      const target = event.currentTarget;
      const index = Number.parseInt(target.dataset.imageUpload, 10);
      const file = target.files?.[0];
      if (!file) {
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      imageStateFor(index).file = file;
      imageStateFor(index).previewUrl = previewUrl;
      renderImages();
      attachImageHandlers();
      persistDraft();
    });
  });
}

function swapRows(fromIndex, toIndex) {
  const rows = state.projectsData.rows;
  if (toIndex < 0 || toIndex >= rows.length) {
    return;
  }
  [rows[fromIndex], rows[toIndex]] = [rows[toIndex], rows[fromIndex]];
  renderProjectRows();
  attachProjectHandlers();
  persistDraft();
}

function attachProjectHandlers() {
  document.querySelectorAll("[data-row]").forEach((field) => {
    field.addEventListener("input", (event) => {
      const target = event.currentTarget;
      const index = Number.parseInt(target.dataset.row, 10);
      const key = target.dataset.key;
      state.projectsData.rows[index][key] = target.value;
      persistDraft();
    });
  });

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = Number.parseInt(event.currentTarget.dataset.delete, 10);
      state.projectsData.rows.splice(index, 1);
      renderProjectRows();
      attachProjectHandlers();
      persistDraft();
    });
  });

  document.querySelectorAll("[data-duplicate]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = Number.parseInt(event.currentTarget.dataset.duplicate, 10);
      const row = clone(state.projectsData.rows[index]);
      state.projectsData.rows.splice(index + 1, 0, row);
      renderProjectRows();
      attachProjectHandlers();
      persistDraft();
    });
  });

  document.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const fromIndex = Number.parseInt(event.currentTarget.dataset.index, 10);
      const direction = event.currentTarget.dataset.move;
      swapRows(fromIndex, direction === "up" ? fromIndex - 1 : fromIndex + 1);
    });
  });
}

function attachImageHandlers() {
  document.querySelectorAll("[data-download-image]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const index = Number.parseInt(event.currentTarget.dataset.downloadImage, 10);
      await downloadImage(index);
    });
  });

  attachImageTextHandlers();
  attachImageUploadHandlers();
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function jsonBlob(value) {
  return new Blob([`${JSON.stringify(value, null, 2)}\n`], {
    type: "application/json",
  });
}

async function imageBlob(index) {
  const entry = imageStateFor(index);
  if (entry.file) {
    return entry.file;
  }
  const response = await fetch(entry.previewUrl);
  return response.blob();
}

async function downloadImage(index) {
  const blob = await imageBlob(index);
  downloadBlob(blob, imageDownloadName(index));
}

async function downloadAllImages() {
  for (let index = 0; index < state.imageFiles.length; index += 1) {
    await downloadImage(index);
  }
}

function uploadPathsText() {
  return [
    "Replace these files on GitHub:",
    "projects/moretti/editable/content/site.json",
    "projects/moretti/editable/content/projects.json",
    ...imagePaths.map((item) => `projects/moretti/${item}`),
  ].join("\n");
}

async function copyUploadPaths() {
  try {
    await navigator.clipboard.writeText(uploadPathsText());
    markStatus("Upload paths copied", "Paste the list into notes or a message while publishing the files on GitHub.");
  } catch {
    markStatus("Copy failed", "Clipboard access is blocked in this browser. Copy the paths from the panel manually.");
  }
}

function addRow() {
  state.projectsData.rows.push({
    client: "",
    project: "",
    result: "",
    year: "",
    link: "",
  });
  renderProjectRows();
  attachProjectHandlers();
  persistDraft();
}

function resetToPublished() {
  state.siteData = clone(publishedState.siteData);
  state.projectsData = clone(publishedState.projectsData);
  state.imageFiles = state.siteData.homeImages.map((image) => ({
    previewUrl: new URL(image.src, window.location.href).href,
    file: null,
  }));
  renderAll();
  attachTextFieldHandlers();
  attachProjectHandlers();
  attachImageHandlers();
  clearDraftStorage();
  markStatus("Reset to published files", "The editor is now showing the current public content again.");
}

function restoreDraftIfPresent() {
  const rawDraft = window.localStorage.getItem(STORAGE_KEY);
  if (!rawDraft) {
    return false;
  }

  try {
    const draft = JSON.parse(rawDraft);
    if (draft.siteData && draft.projectsData) {
      state.siteData = draft.siteData;
      state.projectsData = draft.projectsData;
      markStatus("Local draft restored", "The editor loaded an unpublished draft saved earlier in this browser.");
      return true;
    }
  } catch {
    clearDraftStorage();
  }

  return false;
}

function wireGlobalActions() {
  document.getElementById("save-draft").addEventListener("click", persistDraft);
  document.getElementById("reset-published").addEventListener("click", resetToPublished);
  document.getElementById("clear-draft").addEventListener("click", () => {
    clearDraftStorage();
    markStatus("Local draft cleared", "Published content is still loaded in the editor.");
  });
  document.getElementById("download-site").addEventListener("click", () => {
    downloadBlob(jsonBlob(state.siteData), "site.json");
  });
  document.getElementById("download-projects").addEventListener("click", () => {
    downloadBlob(jsonBlob(state.projectsData), "projects.json");
  });
  document.getElementById("download-images").addEventListener("click", downloadAllImages);
  document.getElementById("copy-paths").addEventListener("click", copyUploadPaths);
  document.getElementById("add-row").addEventListener("click", addRow);
}

async function loadPublishedContent() {
  const [siteResponse, projectsResponse] = await Promise.all([
    fetch("../content/site.json"),
    fetch("../content/projects.json"),
  ]);

  if (!siteResponse.ok || !projectsResponse.ok) {
    throw new Error("Unable to read the editable JSON files.");
  }

  publishedState.siteData = await siteResponse.json();
  publishedState.projectsData = await projectsResponse.json();
}

async function bootstrap() {
  try {
    await loadPublishedContent();

    if (!restoreDraftIfPresent()) {
      state.siteData = clone(publishedState.siteData);
      state.projectsData = clone(publishedState.projectsData);
      markStatus("Published content loaded", "You can start editing immediately. Save a local draft whenever you want.");
    }

    state.imageFiles = state.siteData.homeImages.map((image) => ({
      previewUrl: new URL(image.src, window.location.href).href,
      file: null,
    }));

    renderAll();
    attachTextFieldHandlers();
    attachProjectHandlers();
    attachImageHandlers();
    wireGlobalActions();
  } catch (error) {
    markStatus("Editor failed to load", error instanceof Error ? error.message : "Unknown error.");
  }
}

bootstrap();
