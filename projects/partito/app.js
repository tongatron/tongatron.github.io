const docs = [
  {
    file: "00-metodo.md",
    number: "00",
    title: "Metodo",
    description: "Regole di lavoro, fonti e perimetro etico."
  },
  {
    file: "01-prompt-adattato.md",
    number: "01",
    title: "Prompt adattato",
    description: "Versione riformulata del prompt e sotto-prompt operativi."
  },
  {
    file: "02-storia-mondiale-sintesi.md",
    number: "02",
    title: "Storia mondiale",
    description: "Schema per la sintesi storica sociale e politica mondiale."
  },
  {
    file: "03-italia-1850-2026.md",
    number: "03",
    title: "Italia 1850-2026",
    description: "Periodizzazione e domande guida sulla storia politica italiana."
  },
  {
    file: "04-partiti-e-movimenti.md",
    number: "04",
    title: "Partiti e movimenti",
    description: "Nascita, basi sociali, temi e crisi dei partiti."
  },
  {
    file: "05-italia-oggi.md",
    number: "05",
    title: "Italia oggi",
    description: "Analisi sociale, economica, politica e internazionale."
  },
  {
    file: "06-ipotesi-formazione-politica.md",
    number: "06",
    title: "Ipotesi politica",
    description: "Temi, collocazione, nome e simbolo della proposta."
  },
  {
    file: "07-programma-realistico.md",
    number: "07",
    title: "Programma realistico",
    description: "Promesse, vincoli e prime misure sostenibili."
  },
  {
    file: "08-fonti.md",
    number: "08",
    title: "Fonti",
    description: "Registro di bibliografia, sitografia e fonti da tracciare."
  },
  {
    file: "09-roadmap.md",
    number: "09",
    title: "Roadmap",
    description: "Fasi operative per far avanzare analisi, programma e identita."
  },
  {
    file: "10-matrice-pubblici.md",
    number: "10",
    title: "Matrice pubblici",
    description: "Pubblici potenziali, bisogni, linguaggi e spazio politico scoperto."
  },
  {
    file: "11-confronto-partiti.md",
    number: "11",
    title: "Confronto partiti",
    description: "Stress test dell'offerta esistente, scoring proposte e attacchi prevedibili."
  },
  {
    file: "12-manifesto-breve.md",
    number: "12",
    title: "Manifesto breve",
    description: "Promessa politica essenziale, dieci punti e primi impegni misurabili."
  }
];

const listNode = document.querySelector("#doc-list");
const titleNode = document.querySelector("#doc-title");
const kickerNode = document.querySelector("#doc-kicker");
const contentNode = document.querySelector("#doc-content");
const docListPanelNode = document.querySelector(".doc-list-panel");
const tocToggleNode = document.querySelector("#toc-toggle");
const readerPanelNode = document.querySelector(".reader-panel");
const mobileQuery = window.matchMedia("(max-width: 920px)");

let isTocOpen = false;

marked.setOptions({
  gfm: true,
  breaks: false
});

function createList() {
  docs.forEach((doc) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "doc-link";
    button.dataset.file = doc.file;
    button.innerHTML = `
      <span class="doc-link__index">${doc.number}</span>
      <span>
        <span class="doc-link__title">${doc.title}</span>
        <span class="doc-link__desc">${doc.description}</span>
      </span>
    `;
    button.addEventListener("click", () => {
      location.hash = doc.file;
      if (mobileQuery.matches) {
        setTocOpen(false);
        readerPanelNode.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    listNode.appendChild(button);
  });
}

function getCurrentDoc() {
  const slug = decodeURIComponent(location.hash.replace(/^#/, ""));
  return docs.find((doc) => doc.file === slug) || docs[0];
}

function setActiveLink(file) {
  document.querySelectorAll(".doc-link").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.file === file);
  });

  const activeNode = document.querySelector(`.doc-link[data-file="${CSS.escape(file)}"]`);
  if (activeNode) {
    activeNode.scrollIntoView({ block: "nearest" });
  }
}

function setTocOpen(nextState) {
  isTocOpen = nextState;
  docListPanelNode.classList.toggle("is-open", isTocOpen);
  tocToggleNode.setAttribute("aria-expanded", String(isTocOpen));
  tocToggleNode.textContent = isTocOpen ? "Chiudi indice" : "Apri indice";
}

function syncTocLayout(event) {
  if (event.matches) {
    setTocOpen(false);
    return;
  }

  setTocOpen(true);
}

async function loadDoc() {
  const doc = getCurrentDoc();
  setActiveLink(doc.file);
  kickerNode.textContent = `Documento ${doc.number}`;
  titleNode.textContent = doc.title;
  document.title = `${doc.title} | Partito`;
  contentNode.innerHTML = `<p class="empty-state">Caricamento di <code>${doc.file}</code> in corso.</p>`;

  try {
    const response = await fetch(`docs/${doc.file}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const markdown = await response.text();
    contentNode.innerHTML = marked.parse(markdown);
  } catch (error) {
    contentNode.innerHTML = `
      <p class="empty-state">
        Non sono riuscito a caricare <code>${doc.file}</code>.
        Controlla che il file esista nella cartella <code>docs/</code>.
      </p>
    `;
    console.error(error);
  }
}

createList();
syncTocLayout(mobileQuery);
tocToggleNode.addEventListener("click", () => {
  setTocOpen(!isTocOpen);
});
mobileQuery.addEventListener("change", syncTocLayout);
window.addEventListener("hashchange", loadDoc);
loadDoc();
