// Case-insensitive wordbank used for item autocomplete. No DOM access.
// Shape: { items: [{ name, units, category }] }

import { SEED_ITEMS } from "./seed.js";

export const WORDBANK_KEY = "shopperSpree.wordbank";

const norm = (s) => String(s || "").trim().toLowerCase();

function getStore() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function seeded() {
  return { items: SEED_ITEMS.map((i) => ({ ...i })) };
}

let cache = null;

export function loadWordbank() {
  if (cache) return cache;
  let parsed = null;
  try {
    const raw = getStore()?.getItem(WORDBANK_KEY);
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    // corrupt or unavailable; fall back to the seed
  }
  if (parsed && Array.isArray(parsed.items)) {
    cache = parsed;
  } else {
    cache = seeded();
    saveWordbank();
  }
  return cache;
}

// Drop the cache so the next read comes from storage (cross-tab sync).
export function reloadWordbank() {
  cache = null;
}

function saveWordbank() {
  try {
    getStore()?.setItem(WORDBANK_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

export function findWord(name) {
  const key = norm(name);
  if (!key) return null;
  return loadWordbank().items.find((i) => norm(i.name) === key) || null;
}

// Prefix matches first, then substring matches; alphabetical within each group.
export function searchWords(query, limit = 8) {
  const q = norm(query);
  if (!q) return [];
  const items = loadWordbank().items;
  const starts = [];
  const contains = [];
  for (const i of items) {
    const n = norm(i.name);
    if (n === q) continue;
    if (n.startsWith(q)) starts.push(i);
    else if (n.includes(q)) contains.push(i);
  }
  const byName = (a, b) => a.name.localeCompare(b.name);
  return [...starts.sort(byName), ...contains.sort(byName)].slice(0, limit);
}

// Add a new word, or update units/category to the most recently used values.
export function rememberWord({ name, units, category }) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return;
  const bank = loadWordbank();
  const existing = bank.items.find((i) => norm(i.name) === norm(trimmed));
  if (existing) {
    if (units) existing.units = units;
    if (category) existing.category = category;
  } else {
    bank.items.push({ name: trimmed, units: units || "", category: category || "" });
  }
  saveWordbank();
}

export function allCategories() {
  const set = new Set(loadWordbank().items.map((i) => i.category).filter(Boolean));
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function allUnits() {
  const set = new Set(loadWordbank().items.map((i) => i.units).filter(Boolean));
  return [...set].sort((a, b) => a.localeCompare(b));
}

// Resets the wordbank back to the seeded defaults.
export function resetWordbank() {
  cache = seeded();
  saveWordbank();
}
