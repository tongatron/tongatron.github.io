const STORAGE_KEY = "moretti-editable-admin-draft-v1";

const publishedState = {
  siteData: null,
  projectsData: null,
};

const state = {
  siteData: null,
  projectsData: null,
  imageFiles: [],
  projectImageFiles: {},
  canSaveToDisk: false,
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

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function createProjectId(row, index) {
  const base = slugify(row.project || row.client || `project-${index + 1}`) || `project-${index + 1}`;
  return `${base}-${index + 1}`;
}

function projectImagePath(row) {
  return `../assets/uploads/projects/${row.id}.jpg`;
}

function ensureProjectRows() {
  state.projectsData.columns.image = state.projectsData.columns.image || "Image";
  state.projectsData.rows = state.projectsData.rows.map((row, index) => {
    const nextRow = { ...row };
    if (!nextRow.id) {
      nextRow.id = createProjectId(nextRow, index);
    }
    if (!("image" in nextRow)) {
      nextRow.image = "";
    }
    if (!("imageAlt" in nextRow)) {
      nextRow.imageAlt = nextRow.project || "";
    }
    return nextRow;
  });
}

function syncProjectImageState() {
  const nextEntries = {};
  state.projectsData.rows.forEach((row) => {
    const previous = state.projectImageFiles[row.id];
    const previewUrl = row.image ? new URL(row.image, window.location.href).href : "";
    nextEntries[row.id] = {
      previewUrl: previous?.file ? previous.previewUrl : previewUrl,
      file: previous?.file || null,
    };
  });
  state.projectImageFiles = nextEntries;
}

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

function adminApiUrl(pathName) {
  return new URL(`../../api/admin/${pathName}`, window.location.href).href;
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

async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return window.btoa(binary);
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

function defaultHomeImageFileName(index) {
  return `home-${String(index + 1).padStart(2, "0")}.jpg`;
}

function nextHomeImageFileName() {
  const maxIndex = state.siteData.homeImages.reduce((currentMax, image, index) => {
    const match = pathBasename(image.src).match(/^home-(\d+)\.[a-z0-9]+$/i);
    const value = match ? Number.parseInt(match[1], 10) : index + 1;
    return Math.max(currentMax, value);
  }, 0);
  return `home-${String(maxIndex + 1).padStart(2, "0")}.jpg`;
}

function homeImageFileName(image, index) {
  const fromSrc = image?.src ? pathBasename(image.src) : "";
  return fromSrc || defaultHomeImageFileName(index);
}

function pathBasename(value) {
  return String(value || "").split("/").pop();
}

function ensureHomeImages() {
  state.siteData.homeImages = state.siteData.homeImages.map((image, index) => {
    const nextImage = { ...image };
    nextImage.order = Number.parseInt(nextImage.order ?? index + 1, 10) || index + 1;
    if (!nextImage.src) {
      nextImage.src = `../assets/uploads/${defaultHomeImageFileName(index)}`;
    }
    if (!("alt" in nextImage)) {
      nextImage.alt = "";
    }
    if (!("caption" in nextImage)) {
      nextImage.caption = "";
    }
    if (!("note" in nextImage)) {
      nextImage.note = "";
    }
    return nextImage;
  });
}

function normalizeHomeImageOrder() {
  state.siteData.homeImages.forEach((image, index) => {
    image.order = index + 1;
  });
}

function renderImages() {
  dom.imageForm.innerHTML = state.siteData.homeImages
    .map((image, index) => {
      const source = imageStateFor(index);
      const previewUrl = source.previewUrl;
      const previewMarkup = previewUrl
        ? `<img src="${escapeHtml(previewUrl)}" alt="${escapeHtml(image.alt)}" />`
        : `<div class="image-preview-empty">Upload an image</div>`;
      return `
        <article class="image-card">
          <div class="image-preview">
            ${previewMarkup}
          </div>
          <div class="image-meta">
            <span>${escapeHtml(homeImageFileName(image, index))}</span>
            <div class="row-actions">
              <button type="button" class="tiny-button" data-move-home="up" data-index="${index}">Up</button>
              <button type="button" class="tiny-button" data-move-home="down" data-index="${index}">Down</button>
              <button type="button" class="tiny-button" data-download-image="${index}">Download</button>
              <button type="button" class="tiny-button" data-delete-home="${index}">Delete</button>
            </div>
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
            <label for="order-${index}">Display order</label>
            <input id="order-${index}" data-image-text="${index}" data-key="order" type="number" value="${escapeHtml(image.order ?? index + 1)}" />
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
      (row, index) => {
        const imageEntry = state.projectImageFiles[row.id];
        const imagePreview = imageEntry?.previewUrl
          ? `<img class="table-image-preview" src="${escapeHtml(imageEntry.previewUrl)}" alt="${escapeHtml(row.imageAlt || row.project)}" />`
          : `<div class="table-image-preview table-image-empty" aria-hidden="true"></div>`;

        return `
        <tr>
          <td>
            <div class="table-image-cell">
              ${imagePreview}
              <input data-project-image-upload="${row.id}" type="file" accept="image/*" />
              <input data-row="${index}" data-key="imageAlt" type="text" value="${escapeHtml(row.imageAlt || "")}" placeholder="Image alt text" />
              <button type="button" class="tiny-button" data-download-project-image="${row.id}">Download</button>
            </div>
          </td>
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
      `;
      },
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
      state.siteData.homeImages[index][key] = key === "order" ? Number.parseInt(target.value || "0", 10) || 0 : target.value;
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

  document.querySelectorAll("[data-project-image-upload]").forEach((field) => {
    field.addEventListener("change", (event) => {
      const target = event.currentTarget;
      const rowId = target.dataset.projectImageUpload;
      const row = state.projectsData.rows.find((entry) => entry.id === rowId);
      const file = target.files?.[0];
      if (!row || !file) {
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      row.image = projectImagePath(row);
      state.projectImageFiles[rowId] = {
        previewUrl,
        file,
      };
      renderProjectRows();
      attachProjectHandlers();
      persistDraft();
    });
  });

  document.querySelectorAll("[data-download-project-image]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const rowId = event.currentTarget.dataset.downloadProjectImage;
      await downloadProjectImage(rowId);
    });
  });

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = Number.parseInt(event.currentTarget.dataset.delete, 10);
      state.projectsData.rows.splice(index, 1);
      ensureProjectRows();
      syncProjectImageState();
      renderProjectRows();
      attachProjectHandlers();
      persistDraft();
    });
  });

  document.querySelectorAll("[data-duplicate]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = Number.parseInt(event.currentTarget.dataset.duplicate, 10);
      const row = clone(state.projectsData.rows[index]);
      row.id = createProjectId(row, state.projectsData.rows.length);
      row.image = "";
      state.projectsData.rows.splice(index + 1, 0, row);
      ensureProjectRows();
      syncProjectImageState();
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

  document.querySelectorAll("[data-move-home]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const fromIndex = Number.parseInt(event.currentTarget.dataset.index, 10);
      const direction = event.currentTarget.dataset.moveHome;
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= state.siteData.homeImages.length) {
        return;
      }
      [state.siteData.homeImages[fromIndex], state.siteData.homeImages[toIndex]] = [
        state.siteData.homeImages[toIndex],
        state.siteData.homeImages[fromIndex],
      ];
      [state.imageFiles[fromIndex], state.imageFiles[toIndex]] = [
        state.imageFiles[toIndex],
        state.imageFiles[fromIndex],
      ];
      normalizeHomeImageOrder();
      renderImages();
      attachImageHandlers();
      persistDraft();
    });
  });

  document.querySelectorAll("[data-delete-home]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = Number.parseInt(event.currentTarget.dataset.deleteHome, 10);
      state.siteData.homeImages.splice(index, 1);
      state.imageFiles.splice(index, 1);
      normalizeHomeImageOrder();
      renderImages();
      attachImageHandlers();
      persistDraft();
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
  if (!entry?.previewUrl) {
    return null;
  }
  if (entry.file) {
    return entry.file;
  }
  const response = await fetch(entry.previewUrl);
  return response.blob();
}

async function downloadImage(index) {
  const blob = await imageBlob(index);
  if (!blob) {
    return;
  }
  downloadBlob(blob, homeImageFileName(state.siteData.homeImages[index], index));
}

async function projectImageBlob(rowId) {
  const entry = state.projectImageFiles[rowId];
  if (!entry?.previewUrl) {
    return null;
  }
  if (entry.file) {
    return entry.file;
  }
  const response = await fetch(entry.previewUrl);
  return response.blob();
}

async function downloadProjectImage(rowId) {
  const row = state.projectsData.rows.find((entry) => entry.id === rowId);
  const blob = await projectImageBlob(rowId);
  if (!row || !blob) {
    return;
  }
  downloadBlob(blob, `${row.id}.jpg`);
}

async function serializeChangedHomeImages() {
  const results = [];
  for (let index = 0; index < state.imageFiles.length; index += 1) {
    const entry = state.imageFiles[index];
    if (!entry?.file) {
      continue;
    }
    results.push({
      fileName: homeImageFileName(state.siteData.homeImages[index], index),
      base64: await blobToBase64(entry.file),
    });
  }
  return results;
}

async function serializeChangedProjectImages() {
  const results = [];
  for (const row of state.projectsData.rows) {
    const entry = state.projectImageFiles[row.id];
    if (!entry?.file) {
      continue;
    }
    results.push({
      fileName: `${row.id}.jpg`,
      base64: await blobToBase64(entry.file),
    });
  }
  return results;
}

function refreshSavedImageState(cacheBustToken) {
  state.imageFiles = state.siteData.homeImages.map((image) => ({
    previewUrl: image.src ? `${new URL(image.src, window.location.href).href}?v=${cacheBustToken}` : "",
    file: null,
  }));

  const nextProjectFiles = {};
  state.projectsData.rows.forEach((row) => {
    nextProjectFiles[row.id] = {
      previewUrl: row.image
        ? `${new URL(row.image, window.location.href).href}?v=${cacheBustToken}`
        : "",
      file: null,
    };
  });
  state.projectImageFiles = nextProjectFiles;
}

async function saveToDisk() {
  if (!state.canSaveToDisk) {
    markStatus("Local save unavailable", "Start the local server with npm start and open the admin page on localhost.");
    return;
  }

  try {
    markStatus("Saving to disk…", "Writing JSON and any changed image files to the local project.");
    const [homeImages, projectImages] = await Promise.all([
      serializeChangedHomeImages(),
      serializeChangedProjectImages(),
    ]);

    const response = await fetch(adminApiUrl("save"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        siteData: state.siteData,
        projectsData: state.projectsData,
        homeImages,
        projectImages,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Save request failed");
    }

    publishedState.siteData = clone(state.siteData);
    publishedState.projectsData = clone(state.projectsData);
    clearDraftStorage();
    refreshSavedImageState(Date.now());
    renderAll();
    attachTextFieldHandlers();
    attachProjectHandlers();
    attachImageHandlers();
    markStatus("Saved to disk", `Local files updated at ${payload.savedAt || "just now"}. Commit and push when ready.`);
  } catch (error) {
    markStatus("Save failed", error instanceof Error ? error.message : "Unknown save error.");
  }
}

async function downloadAllImages() {
  for (let index = 0; index < state.imageFiles.length; index += 1) {
    await downloadImage(index);
  }

  for (const row of state.projectsData.rows) {
    if (state.projectImageFiles[row.id]?.previewUrl) {
      await downloadProjectImage(row.id);
    }
  }
}

function uploadPathsText() {
  return [
    "Replace these files on GitHub:",
    "projects/moretti/editable/content/site.json",
    "projects/moretti/editable/content/projects.json",
    ...state.siteData.homeImages.map(
      (image, index) =>
        `projects/moretti/editable/assets/uploads/${homeImageFileName(image, index)}`,
    ),
    ...state.projectsData.rows
      .filter((row) => state.projectImageFiles[row.id]?.previewUrl)
      .map((row) => `projects/moretti/editable/assets/uploads/projects/${row.id}.jpg`),
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
  const row = {
    id: `project-${Date.now()}`,
    client: "",
    project: "",
    result: "",
    year: "",
    link: "",
    image: "",
    imageAlt: "",
  };
  state.projectsData.rows.push(row);
  syncProjectImageState();
  renderProjectRows();
  attachProjectHandlers();
  persistDraft();
}

function addHomeImage() {
  const index = state.siteData.homeImages.length;
  state.siteData.homeImages.push({
    src: `../assets/uploads/${nextHomeImageFileName()}`,
    order: index + 1,
    alt: "",
    caption: "",
    note: "",
  });
  state.imageFiles.push({
    previewUrl: "",
    file: null,
  });
  renderImages();
  attachImageHandlers();
  persistDraft();
}

function resetToPublished() {
  state.siteData = clone(publishedState.siteData);
  state.projectsData = clone(publishedState.projectsData);
  ensureProjectRows();
  ensureHomeImages();
  normalizeHomeImageOrder();
  state.imageFiles = state.siteData.homeImages.map((image) => ({
    previewUrl: image.src ? new URL(image.src, window.location.href).href : "",
    file: null,
  }));
  syncProjectImageState();
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
      ensureProjectRows();
      ensureHomeImages();
      markStatus("Local draft restored", "The editor loaded an unpublished draft saved earlier in this browser.");
      return true;
    }
  } catch {
    clearDraftStorage();
  }

  return false;
}

function wireGlobalActions() {
  document.getElementById("save-disk").addEventListener("click", saveToDisk);
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
  document.getElementById("add-home-image").addEventListener("click", addHomeImage);
}

async function loadServerCapabilities() {
  try {
    const response = await fetch(adminApiUrl("status"), { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const payload = await response.json();
    state.canSaveToDisk = Boolean(payload.canSaveToDisk);
  } catch {
    state.canSaveToDisk = false;
  }
}

function syncSaveButton() {
  const button = document.getElementById("save-disk");
  button.disabled = !state.canSaveToDisk;
  if (!state.canSaveToDisk) {
    button.classList.add("is-disabled");
    button.title = "Available only on the local Node server";
    return;
  }

  button.classList.remove("is-disabled");
  button.title = "";
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
    await loadServerCapabilities();
    await loadPublishedContent();

    if (!restoreDraftIfPresent()) {
      state.siteData = clone(publishedState.siteData);
      state.projectsData = clone(publishedState.projectsData);
      ensureProjectRows();
      markStatus("Published content loaded", "You can start editing immediately. Save a local draft whenever you want.");
    }

    ensureHomeImages();
    normalizeHomeImageOrder();
    state.imageFiles = state.siteData.homeImages.map((image) => ({
      previewUrl: image.src ? new URL(image.src, window.location.href).href : "",
      file: null,
    }));
    syncProjectImageState();

    renderAll();
    attachTextFieldHandlers();
    attachProjectHandlers();
    attachImageHandlers();
    wireGlobalActions();
    syncSaveButton();
  } catch (error) {
    markStatus("Editor failed to load", error instanceof Error ? error.message : "Unknown error.");
  }
}

bootstrap();
