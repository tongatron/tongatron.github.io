"use strict";

(() => {
  const STORAGE_KEY = "magazzino_sereno_web_v1";

  let state = normalizeState(loadState() || createDemoState());
  let searchResults = [];
  let orderDraft = [];
  let toastInstance = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    const toastEl = document.getElementById("app-toast");
    toastInstance = toastEl ? bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2500 }) : null;

    bindNavigation();
    bindCoreActions();
    bindForms();
    bindDelegatedActions();
    setDefaultDates();
    hydrateSelects();
    buildOrderDraft();
    runSearch();
    renderAll();
  }

  function bindNavigation() {
    document.querySelectorAll(".menu-link").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.section;
        if (!target) {
          return;
        }
        document.querySelectorAll(".menu-link").forEach((btn) => btn.classList.remove("active"));
        document.querySelectorAll(".app-section").forEach((section) => section.classList.remove("active"));

        button.classList.add("active");
        const sectionEl = document.getElementById(`section-${target}`);
        if (sectionEl) {
          sectionEl.classList.add("active");
        }
      });
    });
  }

  function bindCoreActions() {
    const resetDataButton = document.getElementById("reset-data-btn");
    const exportJsonButton = document.getElementById("export-json-btn");
    const productsFilter = document.getElementById("products-table-filter");
    const loadSupplierSelect = document.getElementById("load-supplier");
    const loadProductSelect = document.getElementById("load-product");
    const searchRunButton = document.getElementById("search-run-btn");
    const searchExportButton = document.getElementById("search-export-btn");
    const buildOrderButton = document.getElementById("build-order-btn");
    const saveOrderButton = document.getElementById("save-order-btn");
    const printLabelsButton = document.getElementById("print-labels-btn");
    const clearLabelsButton = document.getElementById("clear-labels-btn");

    if (resetDataButton) {
      resetDataButton.addEventListener("click", () => {
        if (!window.confirm("Ripristinare i dati demo e cancellare i dati correnti?")) {
          return;
        }
        state = normalizeState(createDemoState());
        saveState(state);
        resetSupplierForm();
        resetProductForm();
        setDefaultDates();
        hydrateSelects();
        buildOrderDraft();
        runSearch();
        renderAll();
        notify("Dati demo ripristinati.");
      });
    }

    if (exportJsonButton) {
      exportJsonButton.addEventListener("click", () => {
        const fileName = `magazzino_backup_${todayIso()}.json`;
        downloadText(fileName, JSON.stringify(state, null, 2), "application/json;charset=utf-8");
        notify("Backup JSON generato.");
      });
    }

    if (productsFilter) {
      productsFilter.addEventListener("input", () => {
        renderProducts(productsFilter.value.trim());
      });
    }

    if (loadSupplierSelect) {
      loadSupplierSelect.addEventListener("change", () => {
        hydrateLoadProducts();
      });
    }

    if (loadProductSelect) {
      loadProductSelect.addEventListener("change", () => {
        const product = getProduct(loadProductSelect.value);
        const costInput = document.getElementById("load-cost");
        if (costInput && product) {
          costInput.value = product.cost.toFixed(2);
        }
      });
    }

    if (searchRunButton) {
      searchRunButton.addEventListener("click", () => {
        runSearch();
      });
    }

    if (searchExportButton) {
      searchExportButton.addEventListener("click", () => {
        if (!searchResults.length) {
          notify("Nessun risultato da esportare.");
          return;
        }
        exportCsvFromRows(searchResults.map(searchRowToExport), `ricerca_magazzino_${todayIso()}.csv`);
      });
    }

    if (buildOrderButton) {
      buildOrderButton.addEventListener("click", () => {
        buildOrderDraft(true);
        renderOrderDraft();
      });
    }

    if (saveOrderButton) {
      saveOrderButton.addEventListener("click", saveOrder);
    }

    if (printLabelsButton) {
      printLabelsButton.addEventListener("click", printLabels);
    }

    if (clearLabelsButton) {
      clearLabelsButton.addEventListener("click", () => {
        if (!state.labels.length) {
          return;
        }
        if (!window.confirm("Svuotare la coda etichette?")) {
          return;
        }
        state.labels = [];
        pushActivity("Etichette", "Coda etichette svuotata.");
        persistAndRender();
      });
    }

    document.querySelectorAll("[data-export]").forEach((button) => {
      button.addEventListener("click", () => {
        exportDataset(button.dataset.export);
      });
    });

    document.addEventListener("input", (event) => {
      if (!event.target.classList.contains("order-qty-input")) {
        return;
      }
      const code = event.target.dataset.code;
      const line = orderDraft.find((item) => item.productCode === code);
      if (!line) {
        return;
      }
      line.qtyOrder = Math.max(0, toInt(event.target.value, 0));
      const row = event.target.closest("tr");
      const totalCell = row ? row.querySelector("[data-line-total]") : null;
      if (totalCell) {
        totalCell.textContent = formatCurrency(line.qtyOrder * line.cost);
      }
      updateOrderTotal();
    });

    const orderSupplierSelect = document.getElementById("order-supplier");
    if (orderSupplierSelect) {
      orderSupplierSelect.addEventListener("change", () => {
        buildOrderDraft(true);
        renderOrderDraft();
      });
    }
  }

  function bindForms() {
    const supplierForm = document.getElementById("supplier-form");
    const productForm = document.getElementById("product-form");
    const loadForm = document.getElementById("load-form");
    const unloadForm = document.getElementById("unload-form");
    const labelForm = document.getElementById("label-form");
    const supplierReset = document.getElementById("supplier-reset");
    const productReset = document.getElementById("product-reset");

    if (supplierForm) {
      supplierForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const code = valueOf("supplier-code").toUpperCase().trim();
        const name = valueOf("supplier-name").trim();
        const country = valueOf("supplier-country").trim().toUpperCase();

        if (code.length !== 3) {
          notify("Il codice fornitore deve avere 3 caratteri.");
          return;
        }
        if (!name) {
          notify("Inserire la denominazione del fornitore.");
          return;
        }

        const existing = getSupplier(code);
        if (existing) {
          existing.name = name;
          existing.country = country || existing.country;
          pushActivity("Fornitori", `Aggiornato fornitore ${code}.`);
        } else {
          state.suppliers.push({ code, name, country: country || "IT" });
          pushActivity("Fornitori", `Inserito fornitore ${code}.`);
        }

        resetSupplierForm();
        persistAndRender();
      });
    }

    if (supplierReset) {
      supplierReset.addEventListener("click", resetSupplierForm);
    }

    if (productForm) {
      productForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const code = valueOf("product-code").toUpperCase().trim();
        const articleCode = valueOf("product-article").toUpperCase().trim();
        const supplierCode = valueOf("product-supplier").toUpperCase().trim();
        const category = valueOf("product-category").toUpperCase().trim();
        const description = valueOf("product-description").trim();
        const channel = valueOf("product-channel").toUpperCase().trim();
        const cost = toNumber(valueOf("product-cost"), 0);
        const price = toNumber(valueOf("product-price"), 0);
        const vat = toNumber(valueOf("product-vat"), 22);
        const barcode = valueOf("product-barcode").trim();
        const vedesCode = valueOf("product-vedes").trim();
        const minStock = Math.max(0, toInt(valueOf("product-min-stock"), 0));

        if (!code || !articleCode || !supplierCode || !category || !description) {
          notify("Compilare i campi obbligatori articolo.");
          return;
        }

        if (!getSupplier(supplierCode)) {
          notify("Il fornitore selezionato non esiste.");
          return;
        }

        const existing = getProduct(code);
        if (existing) {
          existing.articleCode = articleCode;
          existing.supplierCode = supplierCode;
          existing.category = category;
          existing.description = description;
          existing.channel = channel;
          existing.cost = round2(cost);
          existing.price = round2(price);
          existing.vat = round2(vat);
          existing.barcode = barcode;
          existing.vedesCode = vedesCode;
          existing.minStock = minStock;
          pushActivity("Articoli", `Aggiornato articolo ${code}.`);
        } else {
          state.products.push({
            code,
            articleCode,
            supplierCode,
            category,
            description,
            channel,
            cost: round2(cost),
            price: round2(price),
            vat: round2(vat),
            barcode,
            vedesCode,
            minStock,
            stockDynamic: 0,
            stockAccounting: 0,
            progressLoads: 0,
            progressUnloads: 0,
            lastLoadDate: "",
            lastSaleDate: "",
            orderQty: 0
          });
          pushActivity("Articoli", `Inserito articolo ${code}.`);
        }

        resetProductForm();
        persistAndRender();
      });
    }

    if (productReset) {
      productReset.addEventListener("click", resetProductForm);
    }

    if (loadForm) {
      loadForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const supplierCode = valueOf("load-supplier").toUpperCase().trim();
        const productCode = valueOf("load-product").toUpperCase().trim();
        const date = valueOf("load-date");
        const type = valueOf("load-type");
        const quantity = Math.max(0, toInt(valueOf("load-quantity"), 0));
        const cost = Math.max(0, toNumber(valueOf("load-cost"), 0));
        const discount = clamp(toNumber(valueOf("load-discount"), 0), 0, 99);
        const channel = valueOf("load-channel").toUpperCase().trim();

        const product = getProduct(productCode);
        if (!product || !supplierCode || !date || !quantity) {
          notify("Dati carico non validi.");
          return;
        }

        const netCost = round2(cost * ((100 - discount) / 100));
        const total = round2(netCost * quantity);
        const loadRecord = {
          id: uid("car"),
          date,
          type,
          supplierCode,
          productCode,
          quantity,
          unitCost: round2(cost),
          discount: round2(discount),
          netCost,
          total,
          channel
        };

        state.loads.unshift(loadRecord);
        applyLoad(loadRecord, product);
        pushActivity("Carichi", `Carico ${productCode} (${quantity} pz).`);

        const loadQuantityInput = document.getElementById("load-quantity");
        const loadDiscountInput = document.getElementById("load-discount");
        if (loadQuantityInput) {
          loadQuantityInput.value = "1";
        }
        if (loadDiscountInput) {
          loadDiscountInput.value = "0";
        }

        persistAndRender();
      });
    }

    if (unloadForm) {
      unloadForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const productCode = valueOf("unload-product").toUpperCase().trim();
        const date = valueOf("unload-date");
        const quantity = Math.max(0, toInt(valueOf("unload-quantity"), 0));
        const product = getProduct(productCode);

        if (!product || !date || !quantity) {
          notify("Dati scarico non validi.");
          return;
        }

        if (quantity > product.stockDynamic) {
          const ok = window.confirm("Quantita superiore alla giacenza disponibile. Confermare comunque?");
          if (!ok) {
            return;
          }
        }

        product.stockDynamic = round2(product.stockDynamic - quantity);
        product.stockAccounting = round2(product.stockAccounting - quantity);
        product.progressUnloads = round2(product.progressUnloads + quantity);
        product.lastSaleDate = date;

        const unloadRecord = {
          id: uid("sca"),
          date,
          productCode,
          supplierCode: product.supplierCode,
          quantity,
          stockAfter: product.stockDynamic
        };

        state.unloads.unshift(unloadRecord);
        pushActivity("Scarichi", `Scarico ${productCode} (${quantity} pz).`);

        const unloadQuantityInput = document.getElementById("unload-quantity");
        if (unloadQuantityInput) {
          unloadQuantityInput.value = "1";
        }

        persistAndRender();
      });
    }

    if (labelForm) {
      labelForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const productCode = valueOf("label-product").toUpperCase().trim();
        const quantity = Math.max(1, toInt(valueOf("label-quantity"), 1));
        const product = getProduct(productCode);
        if (!product) {
          notify("Selezionare un articolo valido.");
          return;
        }

        const existing = state.labels.find((entry) => entry.productCode === productCode);
        if (existing) {
          existing.quantity += quantity;
        } else {
          state.labels.push({ id: uid("lbl"), productCode, quantity });
        }

        pushActivity("Etichette", `Aggiunte ${quantity} etichette per ${productCode}.`);
        persistAndRender();
      });
    }
  }

  function bindDelegatedActions() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) {
        return;
      }

      const action = button.dataset.action;
      const code = (button.dataset.code || "").toUpperCase();
      if (!action || !code) {
        return;
      }

      if (action === "edit-supplier") {
        const supplier = getSupplier(code);
        if (!supplier) {
          return;
        }
        setValue("supplier-code", supplier.code);
        setValue("supplier-name", supplier.name);
        setValue("supplier-country", supplier.country);
        const supplierCodeInput = document.getElementById("supplier-code");
        if (supplierCodeInput) {
          supplierCodeInput.focus();
        }
      }

      if (action === "delete-supplier") {
        if (state.products.some((product) => product.supplierCode === code)) {
          notify("Impossibile eliminare il fornitore: esistono articoli collegati.");
          return;
        }
        if (!window.confirm(`Eliminare fornitore ${code}?`)) {
          return;
        }
        state.suppliers = state.suppliers.filter((supplier) => supplier.code !== code);
        pushActivity("Fornitori", `Eliminato fornitore ${code}.`);
        persistAndRender();
      }

      if (action === "edit-product") {
        const product = getProduct(code);
        if (!product) {
          return;
        }
        setValue("product-code", product.code);
        setValue("product-article", product.articleCode);
        setValue("product-supplier", product.supplierCode);
        setValue("product-category", product.category);
        setValue("product-description", product.description);
        setValue("product-channel", product.channel);
        setValue("product-cost", String(product.cost));
        setValue("product-price", String(product.price));
        setValue("product-vat", String(product.vat));
        setValue("product-barcode", product.barcode);
        setValue("product-vedes", product.vedesCode);
        setValue("product-min-stock", String(product.minStock));
        const productCodeInput = document.getElementById("product-code");
        if (productCodeInput) {
          productCodeInput.focus();
        }
      }

      if (action === "delete-product") {
        const linkedMovement =
          state.loads.some((row) => row.productCode === code) ||
          state.unloads.some((row) => row.productCode === code) ||
          state.orders.some((order) => order.lines.some((line) => line.productCode === code));

        if (linkedMovement) {
          notify("Impossibile eliminare: articolo presente in movimenti o ordini.");
          return;
        }
        if (!window.confirm(`Eliminare articolo ${code}?`)) {
          return;
        }
        state.products = state.products.filter((product) => product.code !== code);
        state.labels = state.labels.filter((label) => label.productCode !== code);
        pushActivity("Articoli", `Eliminato articolo ${code}.`);
        persistAndRender();
      }

      if (action === "remove-label") {
        state.labels = state.labels.filter((label) => label.productCode !== code);
        pushActivity("Etichette", `Rimossa coda etichetta ${code}.`);
        persistAndRender();
      }
    });
  }

  function applyLoad(loadRecord, product) {
    product.stockDynamic = round2(product.stockDynamic + loadRecord.quantity);
    product.stockAccounting = round2(product.stockAccounting + loadRecord.quantity);
    product.progressLoads = round2(product.progressLoads + loadRecord.quantity);
    product.lastLoadDate = loadRecord.date;
    product.cost = round2(loadRecord.netCost);
    if (loadRecord.channel) {
      product.channel = loadRecord.channel;
    }
    if (loadRecord.type === "03") {
      product.orderQty = Math.max(0, round2(product.orderQty - loadRecord.quantity));
    }
  }

  function buildOrderDraft(forceRebuild = false) {
    const supplierCode = valueOf("order-supplier").toUpperCase().trim();
    if (!supplierCode) {
      orderDraft = [];
      return;
    }

    if (!forceRebuild && orderDraft.length && orderDraft.every((line) => line.supplierCode === supplierCode)) {
      return;
    }

    const products = state.products
      .filter((product) => product.supplierCode === supplierCode)
      .sort((a, b) => a.code.localeCompare(b.code));

    orderDraft = products.map((product) => {
      const suggested = Math.max(0, product.minStock - product.stockDynamic);
      return {
        supplierCode,
        productCode: product.code,
        description: product.description,
        stock: product.stockDynamic,
        minStock: product.minStock,
        suggested,
        cost: product.cost,
        qtyOrder: suggested
      };
    });
  }

  function saveOrder() {
    const supplierCode = valueOf("order-supplier").toUpperCase().trim();
    if (!supplierCode) {
      notify("Selezionare una ditta per formare l'ordine.");
      return;
    }

    const lines = orderDraft
      .filter((line) => line.qtyOrder > 0)
      .map((line) => ({
        productCode: line.productCode,
        description: line.description,
        quantity: line.qtyOrder,
        unitCost: round2(line.cost),
        total: round2(line.qtyOrder * line.cost)
      }));

    if (!lines.length) {
      notify("Nessuna riga ordine valorizzata.");
      return;
    }

    const total = round2(lines.reduce((sum, line) => sum + line.total, 0));
    const order = {
      id: uid("ord"),
      date: todayIso(),
      supplierCode,
      lines,
      total
    };

    state.orders.unshift(order);
    lines.forEach((line) => {
      const product = getProduct(line.productCode);
      if (product) {
        product.orderQty = round2(product.orderQty + line.quantity);
      }
    });

    pushActivity("Ordini", `Confermato ordine ${supplierCode} (${lines.length} righe).`);
    buildOrderDraft(true);
    persistAndRender();
  }

  function runSearch() {
    const keyword = valueOf("search-keyword").toLowerCase().trim();
    const supplierCode = valueOf("search-supplier").toUpperCase().trim();
    const category = valueOf("search-category").toUpperCase().trim();
    const understockOnly = checkedOf("search-understock");

    searchResults = state.products
      .filter((product) => {
        if (keyword) {
          const haystack = [
            product.code,
            product.articleCode,
            product.description,
            product.barcode,
            product.vedesCode
          ].join(" ").toLowerCase();
          if (!haystack.includes(keyword)) {
            return false;
          }
        }

        if (supplierCode && product.supplierCode !== supplierCode) {
          return false;
        }

        if (category && !product.category.includes(category)) {
          return false;
        }

        if (understockOnly && !(product.minStock > 0 && product.stockDynamic <= product.minStock)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.code.localeCompare(b.code));

    renderSearchResults();
  }

  function renderAll() {
    hydrateSelects();
    renderSuppliers();
    renderProducts(valueOf("products-table-filter").trim());
    renderLoads();
    renderUnloads();
    renderOrderDraft();
    renderOrdersHistory();
    renderLabels();
    renderDashboard();
    renderActivity();
    renderSearchResults();
  }

  function renderSuppliers() {
    const body = document.getElementById("suppliers-table-body");
    const count = document.getElementById("suppliers-count");
    if (!body) {
      return;
    }
    const rows = state.suppliers.slice().sort((a, b) => a.code.localeCompare(b.code));
    body.innerHTML = rows
      .map((supplier) => {
        return `
          <tr>
            <td><code>${escapeHtml(supplier.code)}</code></td>
            <td>${escapeHtml(supplier.name)}</td>
            <td>${escapeHtml(supplier.country || "-")}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-light" data-action="edit-supplier" data-code="${escapeHtml(supplier.code)}">Modifica</button>
              <button class="btn btn-sm btn-outline-danger" data-action="delete-supplier" data-code="${escapeHtml(supplier.code)}">Elimina</button>
            </td>
          </tr>
        `;
      })
      .join("");

    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="4" class="text-center text-secondary">Nessun fornitore registrato.</td></tr>`;
    }

    if (count) {
      count.textContent = `${rows.length} records`;
    }
  }

  function renderProducts(filterText = "") {
    const body = document.getElementById("products-table-body");
    if (!body) {
      return;
    }

    const normalizedFilter = filterText.toLowerCase().trim();
    const products = state.products
      .slice()
      .sort((a, b) => a.code.localeCompare(b.code))
      .filter((product) => {
        if (!normalizedFilter) {
          return true;
        }
        const haystack = [
          product.code,
          product.articleCode,
          product.description,
          product.supplierCode,
          product.category
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedFilter);
      });

    body.innerHTML = products
      .map((product) => {
        const supplier = getSupplier(product.supplierCode);
        const low = product.minStock > 0 && product.stockDynamic <= product.minStock;
        return `
          <tr>
            <td><code>${escapeHtml(product.code)}</code></td>
            <td>${escapeHtml(product.description)}</td>
            <td>${escapeHtml(supplier ? supplier.name : product.supplierCode)}</td>
            <td>${escapeHtml(product.category)}</td>
            <td>${formatNumber(product.cost)}</td>
            <td>${formatNumber(product.price)}</td>
            <td><span class="badge ${low ? "text-bg-danger" : "text-bg-secondary"}">${formatNumber(product.stockDynamic)}</span></td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-light" data-action="edit-product" data-code="${escapeHtml(product.code)}">Modifica</button>
              <button class="btn btn-sm btn-outline-danger" data-action="delete-product" data-code="${escapeHtml(product.code)}">Elimina</button>
            </td>
          </tr>
        `;
      })
      .join("");

    if (!products.length) {
      body.innerHTML = `<tr><td colspan="8" class="text-center text-secondary">Nessun articolo trovato.</td></tr>`;
    }
  }

  function renderLoads() {
    const body = document.getElementById("loads-table-body");
    if (!body) {
      return;
    }
    const rows = state.loads.slice().sort((a, b) => b.date.localeCompare(a.date));
    body.innerHTML = rows
      .map((load) => {
        const product = getProduct(load.productCode);
        return `
          <tr>
            <td>${formatDate(load.date)}</td>
            <td>${escapeHtml(load.type)}</td>
            <td><code>${escapeHtml(load.productCode)}</code> ${escapeHtml(product ? product.description : "")}</td>
            <td>${formatNumber(load.quantity)}</td>
            <td>${formatCurrency(load.netCost)}</td>
            <td>${formatCurrency(load.total)}</td>
          </tr>
        `;
      })
      .join("");

    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="6" class="text-center text-secondary">Nessun carico registrato.</td></tr>`;
    }
  }

  function renderUnloads() {
    const body = document.getElementById("unloads-table-body");
    if (!body) {
      return;
    }
    const rows = state.unloads.slice().sort((a, b) => b.date.localeCompare(a.date));
    body.innerHTML = rows
      .map((unload) => {
        const product = getProduct(unload.productCode);
        return `
          <tr>
            <td>${formatDate(unload.date)}</td>
            <td><code>${escapeHtml(unload.productCode)}</code> ${escapeHtml(product ? product.description : "")}</td>
            <td>${formatNumber(unload.quantity)}</td>
            <td>${formatNumber(unload.stockAfter)}</td>
          </tr>
        `;
      })
      .join("");

    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="4" class="text-center text-secondary">Nessuno scarico registrato.</td></tr>`;
    }
  }

  function renderSearchResults() {
    const body = document.getElementById("search-results-body");
    const count = document.getElementById("search-results-count");
    if (!body) {
      return;
    }

    body.innerHTML = searchResults
      .map((product) => {
        const supplier = getSupplier(product.supplierCode);
        return `
          <tr>
            <td><code>${escapeHtml(product.code)}</code></td>
            <td>${escapeHtml(product.description)}</td>
            <td>${escapeHtml(supplier ? supplier.name : product.supplierCode)}</td>
            <td>${escapeHtml(product.category)}</td>
            <td>${formatNumber(product.stockDynamic)}</td>
            <td>${formatNumber(product.minStock)}</td>
            <td>${formatDate(product.lastLoadDate)}</td>
            <td>${formatDate(product.lastSaleDate)}</td>
          </tr>
        `;
      })
      .join("");

    if (!searchResults.length) {
      body.innerHTML = `<tr><td colspan="8" class="text-center text-secondary">Nessun risultato.</td></tr>`;
    }

    if (count) {
      count.textContent = `${searchResults.length} risultati`;
    }
  }

  function renderOrderDraft() {
    const body = document.getElementById("order-lines-body");
    if (!body) {
      return;
    }

    if (!orderDraft.length) {
      body.innerHTML = `<tr><td colspan="6" class="text-center text-secondary">Seleziona una ditta e premi "Forma Ordine".</td></tr>`;
      updateOrderTotal();
      return;
    }

    body.innerHTML = orderDraft
      .map((line) => {
        return `
          <tr>
            <td><code>${escapeHtml(line.productCode)}</code> ${escapeHtml(line.description)}</td>
            <td>${formatNumber(line.stock)}</td>
            <td>${formatNumber(line.minStock)}</td>
            <td>${formatNumber(line.suggested)}</td>
            <td style="max-width: 110px;">
              <input class="form-control form-control-sm order-qty-input" type="number" min="0" step="1" data-code="${escapeHtml(line.productCode)}" value="${formatNumber(line.qtyOrder)}">
            </td>
            <td data-line-total>${formatCurrency(line.qtyOrder * line.cost)}</td>
          </tr>
        `;
      })
      .join("");

    updateOrderTotal();
  }

  function renderOrdersHistory() {
    const body = document.getElementById("orders-history-body");
    if (!body) {
      return;
    }

    const rows = state.orders.slice().sort((a, b) => b.date.localeCompare(a.date));
    body.innerHTML = rows
      .map((order) => {
        const supplier = getSupplier(order.supplierCode);
        return `
          <tr>
            <td>${formatDate(order.date)}</td>
            <td>${escapeHtml(supplier ? supplier.name : order.supplierCode)}</td>
            <td>${order.lines.length}</td>
            <td>${formatCurrency(order.total)}</td>
          </tr>
        `;
      })
      .join("");

    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="4" class="text-center text-secondary">Nessun ordine registrato.</td></tr>`;
    }
  }

  function renderLabels() {
    const body = document.getElementById("labels-table-body");
    if (!body) {
      return;
    }

    body.innerHTML = state.labels
      .map((label) => {
        const product = getProduct(label.productCode);
        if (!product) {
          return "";
        }
        return `
          <tr>
            <td><code>${escapeHtml(product.code)}</code> ${escapeHtml(product.description)}</td>
            <td>${escapeHtml(product.barcode || "-")}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${formatNumber(label.quantity)}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-danger" data-action="remove-label" data-code="${escapeHtml(product.code)}">Rimuovi</button>
            </td>
          </tr>
        `;
      })
      .join("");

    if (!state.labels.length) {
      body.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">Nessuna etichetta in coda.</td></tr>`;
    }
  }

  function renderDashboard() {
    const metricProducts = document.getElementById("metric-products");
    const metricStock = document.getElementById("metric-stock");
    const metricValue = document.getElementById("metric-value");
    const metricOrders = document.getElementById("metric-orders");
    const lowStockBody = document.getElementById("dashboard-low-stock");
    const lowStockCount = document.getElementById("low-stock-count");
    const topSuppliersContainer = document.getElementById("dashboard-top-suppliers");

    const productCount = state.products.length;
    const stockTotal = round2(state.products.reduce((sum, product) => sum + product.stockDynamic, 0));
    const stockValue = round2(state.products.reduce((sum, product) => sum + product.stockDynamic * product.cost, 0));
    const openOrdersQty = round2(state.products.reduce((sum, product) => sum + product.orderQty, 0));

    if (metricProducts) {
      metricProducts.textContent = String(productCount);
    }
    if (metricStock) {
      metricStock.textContent = formatNumber(stockTotal);
    }
    if (metricValue) {
      metricValue.textContent = formatCurrency(stockValue);
    }
    if (metricOrders) {
      metricOrders.textContent = formatNumber(openOrdersQty);
    }

    const lowStockProducts = state.products
      .filter((product) => product.minStock > 0 && product.stockDynamic <= product.minStock)
      .sort((a, b) => a.stockDynamic - b.stockDynamic)
      .slice(0, 8);

    if (lowStockBody) {
      lowStockBody.innerHTML = lowStockProducts
        .map((product) => {
          const supplier = getSupplier(product.supplierCode);
          return `
            <tr>
              <td><code>${escapeHtml(product.code)}</code></td>
              <td>${escapeHtml(product.description)}</td>
              <td>${escapeHtml(supplier ? supplier.name : product.supplierCode)}</td>
              <td>${formatNumber(product.stockDynamic)}</td>
              <td>${formatNumber(product.minStock)}</td>
            </tr>
          `;
        })
        .join("");
      if (!lowStockProducts.length) {
        lowStockBody.innerHTML = `<tr><td colspan="5" class="text-center text-secondary">Nessun articolo sottoscorta.</td></tr>`;
      }
    }

    if (lowStockCount) {
      lowStockCount.textContent = `${lowStockProducts.length} articoli`;
    }

    if (topSuppliersContainer) {
      const totalsBySupplier = {};
      state.products.forEach((product) => {
        const key = product.supplierCode;
        if (!totalsBySupplier[key]) {
          totalsBySupplier[key] = 0;
        }
        totalsBySupplier[key] += product.stockDynamic * product.cost;
      });

      const sorted = Object.entries(totalsBySupplier)
        .map(([supplierCode, value]) => ({
          supplierCode,
          supplierName: getSupplier(supplierCode)?.name || supplierCode,
          value: round2(value)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const maxValue = sorted[0]?.value || 1;
      topSuppliersContainer.innerHTML = sorted
        .map((entry) => {
          const width = Math.max(6, Math.round((entry.value / maxValue) * 100));
          return `
            <article class="stack-item">
              <div class="stack-head">
                <strong>${escapeHtml(entry.supplierName)}</strong>
                <span>${formatCurrency(entry.value)}</span>
              </div>
              <div class="stack-bar"><div class="stack-fill" style="width:${width}%"></div></div>
            </article>
          `;
        })
        .join("");

      if (!sorted.length) {
        topSuppliersContainer.innerHTML = `<p class="text-secondary mb-0">Nessun dato disponibile.</p>`;
      }
    }
  }

  function renderActivity() {
    const feed = document.getElementById("activity-feed");
    if (!feed) {
      return;
    }
    const rows = state.activity.slice(0, 14);
    feed.innerHTML = rows
      .map((entry) => {
        return `
          <div class="activity-row">
            <time>${escapeHtml(formatTime(entry.time))}</time>
            <span>${escapeHtml(entry.message)}</span>
          </div>
        `;
      })
      .join("");
    if (!rows.length) {
      feed.innerHTML = `<div class="activity-row"><span>Nessuna attivita registrata.</span></div>`;
    }
  }

  function hydrateSelects() {
    const supplierOptions = state.suppliers
      .slice()
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((supplier) => ({
        value: supplier.code,
        label: `${supplier.code} - ${supplier.name}`
      }));

    const productOptions = state.products
      .slice()
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((product) => ({
        value: product.code,
        label: `${product.code} - ${product.description}`
      }));

    setSelectOptions("product-supplier", supplierOptions, { placeholder: "Seleziona fornitore" });
    setSelectOptions("load-supplier", supplierOptions, { placeholder: "Seleziona fornitore" });
    setSelectOptions("search-supplier", supplierOptions, { placeholder: "Tutte le ditte", allowEmpty: true });
    setSelectOptions("order-supplier", supplierOptions, { placeholder: "Seleziona ditta", allowEmpty: true });

    setSelectOptions("unload-product", productOptions, { placeholder: "Seleziona articolo" });
    setSelectOptions("label-product", productOptions, { placeholder: "Seleziona articolo" });

    hydrateLoadProducts();
  }

  function hydrateLoadProducts() {
    const supplierCode = valueOf("load-supplier").toUpperCase().trim();
    const options = state.products
      .filter((product) => !supplierCode || product.supplierCode === supplierCode)
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((product) => ({
        value: product.code,
        label: `${product.code} - ${product.description}`
      }));

    setSelectOptions("load-product", options, { placeholder: "Seleziona articolo" });
    const loadProduct = document.getElementById("load-product");
    const loadCost = document.getElementById("load-cost");
    if (loadProduct && loadCost) {
      const product = getProduct(loadProduct.value);
      if (product) {
        loadCost.value = product.cost.toFixed(2);
      }
    }
  }

  function setSelectOptions(selectId, options, config = {}) {
    const select = document.getElementById(selectId);
    if (!select) {
      return;
    }
    const previous = select.value;
    const placeholder = config.placeholder || "";
    const allowEmpty = Boolean(config.allowEmpty || !options.length);

    const htmlOptions = [];
    if (allowEmpty) {
      htmlOptions.push(`<option value="">${escapeHtml(placeholder || "Seleziona")}</option>`);
    } else if (placeholder) {
      htmlOptions.push(`<option value="" disabled>${escapeHtml(placeholder)}</option>`);
    }
    options.forEach((item) => {
      htmlOptions.push(`<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`);
    });

    select.innerHTML = htmlOptions.join("");

    const allValues = options.map((item) => item.value);
    if (allValues.includes(previous)) {
      select.value = previous;
    } else if (allowEmpty) {
      select.value = "";
    } else if (options[0]) {
      select.value = options[0].value;
    }
  }

  function setDefaultDates() {
    const today = todayIso();
    if (!valueOf("load-date")) {
      setValue("load-date", today);
    }
    if (!valueOf("unload-date")) {
      setValue("unload-date", today);
    }
  }

  function updateOrderTotal() {
    const totalElement = document.getElementById("order-total");
    if (!totalElement) {
      return;
    }
    const total = round2(orderDraft.reduce((sum, line) => sum + line.qtyOrder * line.cost, 0));
    totalElement.textContent = formatCurrency(total);
  }

  function printLabels() {
    if (!state.labels.length) {
      notify("Coda etichette vuota.");
      return;
    }

    const blocks = [];
    state.labels.forEach((entry) => {
      const product = getProduct(entry.productCode);
      if (!product) {
        return;
      }
      const barcodeValue = sanitizeBarcodeValue(product.barcode || product.code);
      for (let i = 0; i < entry.quantity; i += 1) {
        blocks.push(`
          <article class="label">
            <strong>${escapeHtml(product.description)}</strong>
            <span>Codice: ${escapeHtml(product.code)}</span>
            <div class="barcode-wrap">
              <svg class="barcode-svg" data-barcode="${escapeHtml(barcodeValue)}"></svg>
              <span class="barcode-text">${escapeHtml(barcodeValue)}</span>
            </div>
            <span class="price">${escapeHtml(formatCurrency(product.price))}</span>
          </article>
        `);
      }
    });

    const popup = window.open("", "_blank");
    if (!popup) {
      notify("Impossibile aprire la finestra di stampa.");
      return;
    }

    popup.document.write(`
      <html lang="it">
      <head>
        <meta charset="utf-8">
        <title>Stampa Etichette</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .label { border: 1px solid #222; border-radius: 8px; padding: 8px; font-size: 12px; display: grid; gap: 4px; min-height: 116px; }
          .barcode-wrap { margin-top: 2px; display: grid; gap: 2px; justify-items: start; }
          .barcode-svg { width: 168px; height: 38px; overflow: visible; }
          .barcode-fallback { font-family: monospace; font-size: 10px; letter-spacing: 0.08em; border: 1px dashed #444; padding: 4px 6px; }
          .barcode-text { font-family: monospace; font-size: 10px; letter-spacing: 0.09em; }
          .price { font-size: 16px; font-weight: 700; margin-top: 2px; }
        </style>
      </head>
      <body>
        <h1>Etichette Magazzino Sereno</h1>
        <div class="grid">${blocks.join("")}</div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
        <script>
          (function () {
            var nodes = document.querySelectorAll(".barcode-svg");
            nodes.forEach(function (node) {
              var value = node.getAttribute("data-barcode") || "";
              try {
                if (window.JsBarcode && value) {
                  window.JsBarcode(node, value, {
                    format: "CODE128",
                    width: 1.25,
                    height: 34,
                    displayValue: false,
                    margin: 0
                  });
                } else {
                  node.outerHTML = '<div class="barcode-fallback">' + value + "</div>";
                }
              } catch (error) {
                node.outerHTML = '<div class="barcode-fallback">' + value + "</div>";
              }
            });
            window.setTimeout(function () {
              window.focus();
              window.print();
            }, 250);
          })();
        </script>
      </body>
      </html>
    `);
    popup.document.close();
  }

  function sanitizeBarcodeValue(value) {
    const input = String(value || "").trim();
    const safe = input.replace(/[^\x20-\x7E]/g, "");
    return safe || "000000";
  }

  function exportDataset(type) {
    if (!type) {
      return;
    }
    if (type === "suppliers") {
      exportCsvFromRows(
        state.suppliers.map((supplier) => ({
          codice: supplier.code,
          nome: supplier.name,
          stato: supplier.country
        })),
        `fornitori_${todayIso()}.csv`
      );
      return;
    }

    if (type === "products") {
      exportCsvFromRows(
        state.products.map((product) => ({
          codice: product.code,
          articolo: product.articleCode,
          descrizione: product.description,
          ditta: product.supplierCode,
          categoria: product.category,
          costo: product.cost,
          prezzo: product.price,
          iva: product.vat,
          giacenza: product.stockDynamic,
          giacenza_contabile: product.stockAccounting,
          prog_carichi: product.progressLoads,
          prog_scarichi: product.progressUnloads,
          quantita_in_ordine: product.orderQty,
          barcode: product.barcode,
          cod_vedes: product.vedesCode
        })),
        `articoli_${todayIso()}.csv`
      );
      return;
    }

    if (type === "loads") {
      exportCsvFromRows(
        state.loads.map((load) => ({
          data: load.date,
          tipo: load.type,
          ditta: load.supplierCode,
          articolo: load.productCode,
          quantita: load.quantity,
          costo_unitario: load.unitCost,
          sconto: load.discount,
          costo_netto: load.netCost,
          totale: load.total,
          canale: load.channel
        })),
        `carichi_${todayIso()}.csv`
      );
      return;
    }

    if (type === "unloads") {
      exportCsvFromRows(
        state.unloads.map((unload) => ({
          data: unload.date,
          ditta: unload.supplierCode,
          articolo: unload.productCode,
          quantita: unload.quantity,
          giacenza_post: unload.stockAfter
        })),
        `scarichi_${todayIso()}.csv`
      );
      return;
    }

    if (type === "orders") {
      const rows = state.orders.flatMap((order) =>
        order.lines.map((line) => ({
          data: order.date,
          ditta: order.supplierCode,
          articolo: line.productCode,
          descrizione: line.description,
          quantita: line.quantity,
          costo: line.unitCost,
          totale_riga: line.total,
          totale_ordine: order.total
        }))
      );
      exportCsvFromRows(rows, `ordini_${todayIso()}.csv`);
      return;
    }

    if (type === "lowstock") {
      const rows = state.products
        .filter((product) => product.minStock > 0 && product.stockDynamic <= product.minStock)
        .map((product) => ({
          codice: product.code,
          descrizione: product.description,
          ditta: product.supplierCode,
          categoria: product.category,
          giacenza: product.stockDynamic,
          scorta_minima: product.minStock,
          da_riordinare: Math.max(0, product.minStock - product.stockDynamic)
        }));
      exportCsvFromRows(rows, `sottoscorta_${todayIso()}.csv`);
    }
  }

  function exportCsvFromRows(rows, fileName) {
    if (!rows || !rows.length) {
      notify("Nessun dato da esportare.");
      return;
    }
    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(";")];
    rows.forEach((row) => {
      const values = headers.map((header) => toCsvCell(row[header]));
      csvLines.push(values.join(";"));
    });
    downloadText(fileName, csvLines.join("\n"), "text/csv;charset=utf-8");
    notify(`Esportazione completata: ${fileName}`);
  }

  function searchRowToExport(product) {
    return {
      codice: product.code,
      articolo: product.articleCode,
      descrizione: product.description,
      ditta: product.supplierCode,
      categoria: product.category,
      giacenza: product.stockDynamic,
      scorta_minima: product.minStock,
      ultimo_carico: product.lastLoadDate,
      ultima_vendita: product.lastSaleDate
    };
  }

  function persistAndRender() {
    saveState(state);
    hydrateSelects();
    runSearch();
    buildOrderDraft();
    renderAll();
  }

  function resetSupplierForm() {
    setValue("supplier-code", "");
    setValue("supplier-name", "");
    setValue("supplier-country", "IT");
  }

  function resetProductForm() {
    setValue("product-code", "");
    setValue("product-article", "");
    setValue("product-category", "");
    setValue("product-description", "");
    setValue("product-channel", "02");
    setValue("product-cost", "");
    setValue("product-price", "");
    setValue("product-vat", "22");
    setValue("product-barcode", "");
    setValue("product-vedes", "");
    setValue("product-min-stock", "0");
  }

  function notify(message) {
    const body = document.getElementById("app-toast-body");
    if (body) {
      body.textContent = message;
    }
    if (toastInstance) {
      toastInstance.show();
    }
  }

  function pushActivity(area, detail) {
    const message = `[${area}] ${detail}`;
    state.activity.unshift({
      id: uid("att"),
      time: new Date().toISOString(),
      message
    });
    state.activity = state.activity.slice(0, 120);
  }

  function getSupplier(code) {
    return state.suppliers.find((supplier) => supplier.code === code);
  }

  function getProduct(code) {
    return state.products.find((product) => product.code === code);
  }

  function valueOf(id) {
    const el = document.getElementById(id);
    return el ? String(el.value || "") : "";
  }

  function checkedOf(id) {
    const el = document.getElementById(id);
    return Boolean(el && el.checked);
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    el.value = value;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (error) {
      console.error("Errore lettura localStorage", error);
      return null;
    }
  }

  function saveState(nextState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch (error) {
      console.error("Errore salvataggio localStorage", error);
    }
  }

  function normalizeState(input) {
    const safe = input || {};
    const normalized = {
      suppliers: Array.isArray(safe.suppliers) ? safe.suppliers : [],
      products: Array.isArray(safe.products) ? safe.products : [],
      loads: Array.isArray(safe.loads) ? safe.loads : [],
      unloads: Array.isArray(safe.unloads) ? safe.unloads : [],
      orders: Array.isArray(safe.orders) ? safe.orders : [],
      labels: Array.isArray(safe.labels) ? safe.labels : [],
      activity: Array.isArray(safe.activity) ? safe.activity : []
    };

    normalized.suppliers = normalized.suppliers.map((supplier) => ({
      code: String(supplier.code || "").toUpperCase(),
      name: String(supplier.name || ""),
      country: String(supplier.country || "IT")
    }));

    normalized.products = normalized.products.map((product) => ({
      code: String(product.code || "").toUpperCase(),
      articleCode: String(product.articleCode || "").toUpperCase(),
      supplierCode: String(product.supplierCode || "").toUpperCase(),
      category: String(product.category || "").toUpperCase(),
      description: String(product.description || ""),
      channel: String(product.channel || ""),
      cost: round2(toNumber(product.cost, 0)),
      price: round2(toNumber(product.price, 0)),
      vat: round2(toNumber(product.vat, 22)),
      barcode: String(product.barcode || ""),
      vedesCode: String(product.vedesCode || ""),
      minStock: Math.max(0, toInt(product.minStock, 0)),
      stockDynamic: round2(toNumber(product.stockDynamic, 0)),
      stockAccounting: round2(toNumber(product.stockAccounting, 0)),
      progressLoads: round2(toNumber(product.progressLoads, 0)),
      progressUnloads: round2(toNumber(product.progressUnloads, 0)),
      lastLoadDate: String(product.lastLoadDate || ""),
      lastSaleDate: String(product.lastSaleDate || ""),
      orderQty: round2(toNumber(product.orderQty, 0))
    }));

    normalized.loads = normalized.loads.map((load) => ({
      id: String(load.id || uid("car")),
      date: String(load.date || todayIso()),
      type: String(load.type || "02"),
      supplierCode: String(load.supplierCode || ""),
      productCode: String(load.productCode || ""),
      quantity: round2(toNumber(load.quantity, 0)),
      unitCost: round2(toNumber(load.unitCost, 0)),
      discount: round2(toNumber(load.discount, 0)),
      netCost: round2(toNumber(load.netCost, 0)),
      total: round2(toNumber(load.total, 0)),
      channel: String(load.channel || "")
    }));

    normalized.unloads = normalized.unloads.map((unload) => ({
      id: String(unload.id || uid("sca")),
      date: String(unload.date || todayIso()),
      productCode: String(unload.productCode || ""),
      supplierCode: String(unload.supplierCode || ""),
      quantity: round2(toNumber(unload.quantity, 0)),
      stockAfter: round2(toNumber(unload.stockAfter, 0))
    }));

    normalized.orders = normalized.orders.map((order) => ({
      id: String(order.id || uid("ord")),
      date: String(order.date || todayIso()),
      supplierCode: String(order.supplierCode || ""),
      lines: Array.isArray(order.lines) ? order.lines : [],
      total: round2(toNumber(order.total, 0))
    }));

    normalized.labels = normalized.labels.map((label) => ({
      id: String(label.id || uid("lbl")),
      productCode: String(label.productCode || ""),
      quantity: Math.max(1, toInt(label.quantity, 1))
    }));

    normalized.activity = normalized.activity
      .map((entry) => ({
        id: String(entry.id || uid("att")),
        time: String(entry.time || new Date().toISOString()),
        message: String(entry.message || "")
      }))
      .filter((entry) => entry.message);

    return normalized;
  }

  function createDemoState() {
    const demo = {
      suppliers: [
        { code: "MAT", name: "Mattel Italia", country: "IT" },
        { code: "HAS", name: "Hasbro Italy", country: "IT" },
        { code: "LEG", name: "LEGO Group", country: "DK" },
        { code: "TRU", name: "Trudi S.p.A.", country: "IT" },
        { code: "VED", name: "Vedes Italia", country: "IT" }
      ],
      products: [
        {
          code: "1001",
          articleCode: "MAT-TRK1",
          supplierCode: "MAT",
          category: "AUTO",
          description: "Camion Cantiere",
          channel: "02",
          cost: 12.40,
          price: 24.90,
          vat: 22,
          barcode: "8000001001",
          vedesCode: "501001",
          minStock: 8,
          stockDynamic: 15,
          stockAccounting: 15,
          progressLoads: 44,
          progressUnloads: 29,
          lastLoadDate: shiftDate(-10),
          lastSaleDate: shiftDate(-1),
          orderQty: 0
        },
        {
          code: "1002",
          articleCode: "HAS-NRF1",
          supplierCode: "HAS",
          category: "GIOC",
          description: "Nerf Alpha Strike",
          channel: "02",
          cost: 18.90,
          price: 34.90,
          vat: 22,
          barcode: "8000001002",
          vedesCode: "501002",
          minStock: 6,
          stockDynamic: 4,
          stockAccounting: 4,
          progressLoads: 30,
          progressUnloads: 26,
          lastLoadDate: shiftDate(-8),
          lastSaleDate: shiftDate(-2),
          orderQty: 4
        },
        {
          code: "1003",
          articleCode: "LEG-CRT1",
          supplierCode: "LEG",
          category: "COST",
          description: "Lego City Gru",
          channel: "02",
          cost: 38.00,
          price: 69.00,
          vat: 22,
          barcode: "8000001003",
          vedesCode: "501003",
          minStock: 4,
          stockDynamic: 7,
          stockAccounting: 7,
          progressLoads: 20,
          progressUnloads: 13,
          lastLoadDate: shiftDate(-14),
          lastSaleDate: shiftDate(-3),
          orderQty: 0
        },
        {
          code: "1004",
          articleCode: "TRU-ORS1",
          supplierCode: "TRU",
          category: "PELU",
          description: "Orsetto Trudi 30cm",
          channel: "03",
          cost: 16.20,
          price: 32.00,
          vat: 22,
          barcode: "8000001004",
          vedesCode: "501004",
          minStock: 10,
          stockDynamic: 8,
          stockAccounting: 8,
          progressLoads: 35,
          progressUnloads: 27,
          lastLoadDate: shiftDate(-16),
          lastSaleDate: shiftDate(-1),
          orderQty: 3
        },
        {
          code: "1005",
          articleCode: "VED-UNO1",
          supplierCode: "VED",
          category: "CARD",
          description: "UNO Mazzo Carte",
          channel: "02",
          cost: 4.10,
          price: 9.90,
          vat: 22,
          barcode: "8000001005",
          vedesCode: "501005",
          minStock: 20,
          stockDynamic: 26,
          stockAccounting: 26,
          progressLoads: 110,
          progressUnloads: 84,
          lastLoadDate: shiftDate(-5),
          lastSaleDate: shiftDate(0),
          orderQty: 0
        },
        {
          code: "1006",
          articleCode: "LEG-MIN1",
          supplierCode: "LEG",
          category: "COST",
          description: "Lego Minifigure Mystery",
          channel: "02",
          cost: 2.80,
          price: 5.99,
          vat: 22,
          barcode: "8000001006",
          vedesCode: "501006",
          minStock: 30,
          stockDynamic: 19,
          stockAccounting: 19,
          progressLoads: 160,
          progressUnloads: 141,
          lastLoadDate: shiftDate(-12),
          lastSaleDate: shiftDate(0),
          orderQty: 15
        }
      ],
      loads: [
        {
          id: uid("car"),
          date: shiftDate(-14),
          type: "02",
          supplierCode: "LEG",
          productCode: "1003",
          quantity: 10,
          unitCost: 38,
          discount: 0,
          netCost: 38,
          total: 380,
          channel: "02"
        },
        {
          id: uid("car"),
          date: shiftDate(-8),
          type: "02",
          supplierCode: "HAS",
          productCode: "1002",
          quantity: 14,
          unitCost: 18.9,
          discount: 0,
          netCost: 18.9,
          total: 264.6,
          channel: "02"
        },
        {
          id: uid("car"),
          date: shiftDate(-5),
          type: "02",
          supplierCode: "VED",
          productCode: "1005",
          quantity: 40,
          unitCost: 4.1,
          discount: 2,
          netCost: 4.02,
          total: 160.8,
          channel: "02"
        }
      ],
      unloads: [
        {
          id: uid("sca"),
          date: shiftDate(-2),
          productCode: "1002",
          supplierCode: "HAS",
          quantity: 3,
          stockAfter: 4
        },
        {
          id: uid("sca"),
          date: shiftDate(-1),
          productCode: "1001",
          supplierCode: "MAT",
          quantity: 2,
          stockAfter: 15
        },
        {
          id: uid("sca"),
          date: shiftDate(0),
          productCode: "1005",
          supplierCode: "VED",
          quantity: 4,
          stockAfter: 26
        }
      ],
      orders: [
        {
          id: uid("ord"),
          date: shiftDate(-3),
          supplierCode: "LEG",
          lines: [
            { productCode: "1006", description: "Lego Minifigure Mystery", quantity: 15, unitCost: 2.8, total: 42 }
          ],
          total: 42
        }
      ],
      labels: [
        { id: uid("lbl"), productCode: "1001", quantity: 4 },
        { id: uid("lbl"), productCode: "1005", quantity: 6 }
      ],
      activity: [
        { id: uid("att"), time: new Date().toISOString(), message: "[Sistema] Demo inizializzata con dati storici." }
      ]
    };
    return demo;
  }

  function uid(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function toNumber(value, fallback = 0) {
    const clean = String(value).replace(",", ".");
    const parsed = Number(clean);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function toInt(value, fallback = 0) {
    const parsed = parseInt(String(value), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function round2(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(toNumber(value, 0));
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 }).format(toNumber(value, 0));
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat("it-IT").format(date);
  }

  function formatTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "--:--";
    }
    return new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function shiftDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function toCsvCell(value) {
    const normalized = String(value ?? "");
    return `"${normalized.replace(/"/g, "\"\"")}"`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function downloadText(fileName, text, mimeType) {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }
})();
