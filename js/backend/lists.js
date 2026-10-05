// List + item operations. Owns the in-memory app state and persists every
// mutation through storage.js. No DOM access.

import { loadState, saveState, clearState } from "./storage.js";
import { randomColor, isPaletteColor } from "./palette.js";
import { rememberWord, resetWordbank } from "./wordbank.js";

let state = loadState();

const now = () => Date.now();
const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function commit() {
  saveState(state);
}

// Re-read from storage (used when another tab changes the data).
export function reload() {
  state = loadState();
}

// ---------- settings ----------

export function getSettings() {
  return { ...state.settings };
}

export function setTheme(theme) {
  state.settings.theme = theme === "dark" ? "dark" : "light";
  commit();
}

export function setSortBy(sortBy) {
  state.settings.sortBy = sortBy === "alpha" ? "alpha" : "recent";
  commit();
}

// ---------- lists ----------

export function getList(id) {
  return state.lists.find((l) => l.id === id) || null;
}

export function getLists() {
  return state.lists;
}

// Favorites first, then by the chosen sort.
export function sortedLists(sortBy = state.settings.sortBy) {
  const compare =
    sortBy === "alpha"
      ? (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      : (a, b) => (b.lastOpenedAt || b.createdAt) - (a.lastOpenedAt || a.createdAt);
  return [...state.lists].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return compare(a, b);
  });
}

export function listCategories() {
  const set = new Set(state.lists.map((l) => l.category).filter(Boolean));
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function createList(name, category = "") {
  const list = {
    id: uid(),
    name: String(name || "").trim() || "Untitled list",
    color: randomColor(state.lists.map((l) => l.color)),
    category: String(category || "").trim(),
    favorite: false,
    createdAt: now(),
    lastOpenedAt: null,
    items: [],
  };
  state.lists.push(list);
  commit();
  return list;
}

export function updateList(id, changes) {
  const list = getList(id);
  if (!list) return null;
  if ("name" in changes) list.name = String(changes.name).trim() || list.name;
  if ("category" in changes) list.category = String(changes.category || "").trim();
  if ("color" in changes && isPaletteColor(changes.color)) list.color = changes.color;
  commit();
  return list;
}

export function toggleFavorite(id) {
  const list = getList(id);
  if (!list) return null;
  list.favorite = !list.favorite;
  commit();
  return list;
}

export function openList(id) {
  const list = getList(id);
  if (!list) return null;
  list.lastOpenedAt = now();
  state.settings.lastOpenListId = id;
  commit();
  return list;
}

export function deleteList(id) {
  state.lists = state.lists.filter((l) => l.id !== id);
  // lastOpenListId is intentionally kept so startup can report "last list was deleted".
  commit();
}

export function deleteAll({ clearWordbank = false } = {}) {
  const settings = { ...state.settings, lastOpenListId: null };
  clearState();
  state = { lists: [], settings };
  commit();
  if (clearWordbank) resetWordbank();
}

// ---------- items ----------

// Adding a name already on the list merges into that item: quantities add up
// and it moves back to "To buy".
export function addItem(listId, { name, quantity, units, category }) {
  const list = getList(listId);
  const trimmed = String(name || "").trim();
  if (!list || !trimmed) return null;
  const existing = list.items.find((i) => i.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    existing.quantity = existing.checked ? normalizeQty(quantity) : existing.quantity + normalizeQty(quantity);
    if (String(units || "").trim()) existing.units = String(units).trim();
    if (String(category || "").trim()) existing.category = String(category).trim();
    existing.checked = false;
    commit();
    rememberWord(existing);
    return existing;
  }
  const item = {
    id: uid(),
    name: trimmed,
    quantity: normalizeQty(quantity),
    units: String(units || "").trim(),
    category: String(category || "").trim(),
    checked: false,
  };
  list.items.push(item);
  commit();
  rememberWord(item);
  return item;
}

export function updateItem(listId, itemId, changes) {
  const item = getList(listId)?.items.find((i) => i.id === itemId);
  if (!item) return null;
  if ("name" in changes) item.name = String(changes.name).trim() || item.name;
  if ("quantity" in changes) item.quantity = normalizeQty(changes.quantity);
  if ("units" in changes) item.units = String(changes.units || "").trim();
  if ("category" in changes) item.category = String(changes.category || "").trim();
  commit();
  rememberWord(item);
  return item;
}

export function toggleItem(listId, itemId) {
  const item = getList(listId)?.items.find((i) => i.id === itemId);
  if (!item) return null;
  item.checked = !item.checked;
  commit();
  return item;
}

export function deleteItem(listId, itemId) {
  const list = getList(listId);
  if (!list) return;
  list.items = list.items.filter((i) => i.id !== itemId);
  commit();
}

function normalizeQty(q) {
  const n = Number(q);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

// ---------- startup ----------

// Decides what to show on load.
// Returns { view: "list", listId } or { view: "menu", reason }
// reason: "no-lists" | "deleted" | "empty" | "all-bought" | null
export function startupView() {
  const { lastOpenListId } = state.settings;
  if (!state.lists.length) {
    return { view: "menu", reason: lastOpenListId ? "deleted" : "no-lists" };
  }
  if (!lastOpenListId) return { view: "menu", reason: null };
  const list = getList(lastOpenListId);
  if (!list) return { view: "menu", reason: "deleted" };
  if (!list.items.length) return { view: "menu", reason: "empty", listId: list.id };
  if (list.items.every((i) => i.checked)) {
    return { view: "menu", reason: "all-bought", listId: list.id };
  }
  return { view: "list", listId: list.id };
}
