// List view: header (color, name, category, favorite), add-item form with
// autocomplete, and the "To buy" / "Bought" sections.

import * as backend from "../backend/lists.js";
import { PALETTE } from "../backend/palette.js";
import { findWord, searchWords, allCategories, allUnits, loadWordbank } from "../backend/wordbank.js";
import { $, h, svgIcon, ICONS, fillDatalist, formatQty } from "./dom.js";

let currentId = null;
let acItems = [];
let acIndex = -1;
let editingId = null;

export const currentListId = () => currentId;

export function initListView() {
  initHeader();
  initAddForm();
  initAutocomplete();
  initEditDialog();
}

export function renderListView(id) {
  currentId = id;
  const list = backend.getList(id);
  if (!list) return;
  renderHeader(list);
  renderItems(list);
  refreshDatalists();
  resetAddForm();
}

// ---------------- header ----------------

function initHeader() {
  const btn = $("list-color-btn");
  const pop = $("palette-popover");

  pop.replaceChildren(
    ...PALETTE.map((color) =>
      h("button", {
        class: "color-dot swatch",
        type: "button",
        role: "menuitemradio",
        "aria-label": `Color ${color}`,
        style: { background: color },
        dataset: { color },
        onclick: () => {
          const list = backend.updateList(currentId, { color });
          closePalette();
          if (list) renderHeader(list);
        },
      })
    )
  );

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    pop.hidden ? openPalette() : closePalette();
  });
  document.addEventListener("click", (e) => {
    if (!pop.hidden && !pop.contains(e.target)) closePalette();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !pop.hidden) {
      closePalette();
      btn.focus();
    }
  });

  const nameInput = $("list-name");
  const commitName = () => {
    const list = backend.updateList(currentId, { name: nameInput.value });
    if (list) nameInput.value = list.name;
  };
  nameInput.addEventListener("change", commitName);
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") nameInput.blur();
  });

  const catInput = $("list-category");
  catInput.addEventListener("change", () => backend.updateList(currentId, { category: catInput.value }));
  catInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") catInput.blur();
  });

  $("list-fav-btn").addEventListener("click", () => {
    const list = backend.toggleFavorite(currentId);
    if (list) renderHeader(list);
  });
}

function openPalette() {
  const pop = $("palette-popover");
  pop.hidden = false;
  $("list-color-btn").setAttribute("aria-expanded", "true");
  (pop.querySelector(".selected") || pop.firstElementChild)?.focus();
}

function closePalette() {
  $("palette-popover").hidden = true;
  $("list-color-btn").setAttribute("aria-expanded", "false");
}

function renderHeader(list) {
  document.documentElement.style.setProperty("--list-color", list.color);
  $("list-color-btn").style.background = list.color;
  $("list-name").value = list.name;
  $("list-category").value = list.category || "";
  const fav = $("list-fav-btn");
  fav.classList.toggle("on", list.favorite);
  fav.setAttribute("aria-pressed", String(list.favorite));
  fav.setAttribute("aria-label", list.favorite ? "Unfavorite list" : "Favorite list");
  for (const sw of $("palette-popover").children) {
    const selected = sw.dataset.color === list.color;
    sw.classList.toggle("selected", selected);
    sw.setAttribute("aria-checked", String(selected));
  }
  document.title = `${list.name} · Shopper Spree`;
}

// ---------------- items ----------------

function renderItems(list) {
  const toBuy = list.items.filter((i) => !i.checked);
  const bought = list.items.filter((i) => i.checked);

  $("tobuy-items").replaceChildren(...groupByCategory(toBuy));
  $("bought-items").replaceChildren(...bought.map(itemRow));
  $("tobuy-count").textContent = toBuy.length ? `(${toBuy.length})` : "";
  $("bought-count").textContent = bought.length ? `(${bought.length})` : "";

  const empty = list.items.length === 0;
  $("items-empty").hidden = !empty;
  $("tobuy-done").hidden = empty || toBuy.length > 0;
  document.querySelector(".items-section.bought").hidden = bought.length === 0;
  document.querySelector(".items-section:not(.bought)").hidden = empty;
}

// Items in "To buy" are grouped under category headings so the list reads in
// store-aisle order.
function groupByCategory(items) {
  const groups = new Map();
  for (const item of items) {
    const key = item.category || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  const keys = [...groups.keys()].sort((a, b) =>
    a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b)
  );
  const nodes = [];
  for (const key of keys) {
    nodes.push(h("li", { class: "group-label", "aria-hidden": "true" }, key));
    nodes.push(...groups.get(key).map(itemRow));
  }
  return nodes;
}

function itemRow(item) {
  const qty = `${formatQty(item.quantity)}${item.units ? ` ${item.units}` : ""}`;
  return h(
    "li",
    { class: `item${item.checked ? " checked" : ""}` },
    h(
      "button",
      {
        class: "item-toggle",
        type: "button",
        role: "checkbox",
        "aria-checked": String(item.checked),
        onclick: () => {
          backend.toggleItem(currentId, item.id);
          renderItems(backend.getList(currentId));
        },
      },
      h("span", { class: "checkbox", "aria-hidden": "true" }, svgIcon(ICONS.check)),
      h("span", { class: "item-name" }, item.name),
      h("span", { class: "item-qty" }, qty),
      item.checked && item.category ? h("span", { class: "chip" }, item.category) : null
    ),
    h(
      "button",
      {
        class: "icon-btn subtle edit",
        type: "button",
        "aria-label": `Edit ${item.name}`,
        onclick: () => openEditDialog(item),
      },
      svgIcon(ICONS.pencil)
    ),
    h(
      "button",
      {
        class: "icon-btn subtle",
        type: "button",
        "aria-label": `Remove ${item.name}`,
        onclick: () => {
          backend.deleteItem(currentId, item.id);
          renderItems(backend.getList(currentId));
        },
      },
      svgIcon(ICONS.x)
    )
  );
}

// ---------------- edit dialog ----------------

function initEditDialog() {
  const dialog = $("edit-item-dialog");
  $("edit-name").addEventListener("change", () => {
    const word = findWord($("edit-name").value);
    if (word) {
      $("edit-units").value = word.units || "";
      $("edit-category").value = word.category || "";
    }
  });
  $("edit-item-form").addEventListener("submit", (e) => {
    if (e.submitter?.value === "save" && editingId) {
      backend.updateItem(currentId, editingId, {
        name: $("edit-name").value,
        quantity: $("edit-qty").value,
        units: $("edit-units").value,
        category: $("edit-category").value,
      });
      renderItems(backend.getList(currentId));
      refreshDatalists();
    }
  });
  dialog.addEventListener("close", () => {
    editingId = null;
  });
}

function openEditDialog(item) {
  editingId = item.id;
  $("edit-name").value = item.name;
  $("edit-qty").value = formatQty(item.quantity);
  $("edit-units").value = item.units || "";
  $("edit-category").value = item.category || "";
  $("edit-item-dialog").showModal();
}

// ---------------- add form ----------------

function initAddForm() {
  $("add-item-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("item-name").value.trim();
    if (!name) return;
    backend.addItem(currentId, {
      name,
      quantity: $("item-qty").value,
      units: $("item-units").value,
      category: $("item-category").value,
    });
    renderItems(backend.getList(currentId));
    refreshDatalists();
    resetAddForm();
    $("item-name").focus();
  });
}

function resetAddForm() {
  $("add-item-form").reset();
  $("item-qty").value = "1";
  closeAutocomplete();
}

function refreshDatalists() {
  fillDatalist($("units-options"), allUnits());
  fillDatalist($("item-category-options"), allCategories());
  fillDatalist($("list-category-options"), backend.listCategories());
  fillDatalist($("wordbank-options"), loadWordbank().items.map((i) => i.name));
}

// Fill units + category from the wordbank entry.
function applyWord(word) {
  $("item-name").value = word.name;
  $("item-units").value = word.units || "";
  $("item-category").value = word.category || "";
}

// ---------------- autocomplete ----------------

function initAutocomplete() {
  const input = $("item-name");
  const box = $("autocomplete");

  input.addEventListener("input", () => {
    acItems = searchWords(input.value);
    acIndex = -1;
    renderAutocomplete();
    const exact = findWord(input.value);
    if (exact) applyWordFields(exact);
  });

  input.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      acIndex = (acIndex + 1) % acItems.length;
      renderAutocomplete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      acIndex = (acIndex - 1 + acItems.length) % acItems.length;
      renderAutocomplete();
    } else if ((e.key === "Enter" || e.key === "Tab") && acIndex >= 0) {
      e.preventDefault();
      choose(acItems[acIndex]);
    } else if (e.key === "Escape") {
      closeAutocomplete();
    }
  });

  input.addEventListener("blur", () => setTimeout(closeAutocomplete, 120));
}

// Only overwrite units/category when an exact wordbank match is typed.
function applyWordFields(word) {
  $("item-units").value = word.units || "";
  $("item-category").value = word.category || "";
}

function choose(word) {
  applyWord(word);
  closeAutocomplete();
  $("item-qty").focus();
  $("item-qty").select();
}

function renderAutocomplete() {
  const box = $("autocomplete");
  const input = $("item-name");
  if (!acItems.length) return closeAutocomplete();

  box.replaceChildren(
    ...acItems.map((word, i) =>
      h(
        "li",
        {
          id: `ac-${i}`,
          role: "option",
          class: i === acIndex ? "active" : "",
          "aria-selected": String(i === acIndex),
          onmousedown: (e) => {
            e.preventDefault();
            choose(word);
          },
        },
        h("span", { class: "ac-name" }, highlight(word.name, input.value)),
        h("span", { class: "ac-meta" }, [word.category, word.units].filter(Boolean).join(" · "))
      )
    )
  );
  box.hidden = false;
  input.setAttribute("aria-expanded", "true");
  if (acIndex >= 0) input.setAttribute("aria-activedescendant", `ac-${acIndex}`);
  else input.removeAttribute("aria-activedescendant");
}

function closeAutocomplete() {
  $("autocomplete").hidden = true;
  $("item-name").setAttribute("aria-expanded", "false");
  $("item-name").removeAttribute("aria-activedescendant");
  acItems = [];
  acIndex = -1;
}

function highlight(text, query) {
  const q = query.trim().toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (!q || idx < 0) return text;
  return [text.slice(0, idx), h("mark", {}, text.slice(idx, idx + q.length)), text.slice(idx + q.length)];
}
