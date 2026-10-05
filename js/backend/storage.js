// Persistence layer for lists + settings. No DOM access.

export const DATA_KEY = "shopperSpree.data";

function defaultState() {
  return {
    lists: [],
    settings: { theme: "light", sortBy: "recent", lastOpenListId: null },
  };
}

function getStore() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadState() {
  const fallback = defaultState();
  const store = getStore();
  if (!store) return fallback;
  try {
    const raw = store.getItem(DATA_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      lists: Array.isArray(parsed.lists) ? parsed.lists : [],
      settings: { ...fallback.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return fallback;
  }
}

export function saveState(state) {
  const store = getStore();
  if (!store) return;
  try {
    store.setItem(DATA_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked; the app keeps working in memory.
  }
}

export function clearState() {
  const store = getStore();
  if (!store) return;
  try {
    store.removeItem(DATA_KEY);
  } catch {
    // ignore
  }
}
