// Entry point: boots the app, handles theme and view routing.

import * as backend from "../backend/lists.js";
import { loadWordbank, reloadWordbank, WORDBANK_KEY } from "../backend/wordbank.js";
import { DATA_KEY } from "../backend/storage.js";
import { $ } from "./dom.js";
import { initMenu, renderMenu } from "./menu.js";
import { initListView, renderListView, currentListId } from "./listView.js";

const NOTICES = {
  "no-lists": "You don't have any lists yet. Create one below to get started.",
  deleted: "The last list you had open was deleted. Pick another list or create a new one.",
  empty: (name) => `Your last list, “${name}”, is empty. Open it to add items, or pick another list.`,
  "all-bought": (name) => `Everything on “${name}” has been bought. Nice work! Pick a list below.`,
};

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("theme-btn").setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
}

export function showMenu(reason = null, listId = null) {
  $("list-view").hidden = true;
  $("menu-view").hidden = false;
  $("back-btn").hidden = true;

  const notice = $("menu-notice");
  const msg = NOTICES[reason];
  if (msg) {
    const name = listId ? backend.getList(listId)?.name : "";
    notice.textContent = typeof msg === "function" ? msg(name) : msg;
    notice.hidden = false;
  } else {
    notice.hidden = true;
  }

  renderMenu();
  window.scrollTo(0, 0);
}

export function showList(id) {
  if (!backend.openList(id)) return showMenu();
  $("menu-view").hidden = true;
  $("list-view").hidden = false;
  $("back-btn").hidden = false;
  renderListView(id);
  window.scrollTo(0, 0);
}

function boot() {
  loadWordbank(); // seeds on first run
  applyTheme(backend.getSettings().theme);

  $("theme-btn").addEventListener("click", () => {
    const next = backend.getSettings().theme === "dark" ? "light" : "dark";
    backend.setTheme(next);
    applyTheme(next);
  });
  $("back-btn").addEventListener("click", () => showMenu());

  initMenu({ onOpenList: showList, onAfterDeleteAll: () => showMenu("no-lists") });
  initListView();

  // Another tab changed the data: reload so this tab doesn't overwrite it.
  window.addEventListener("storage", (e) => {
    if (e.key === WORDBANK_KEY || e.key === null) reloadWordbank();
    if (e.key !== DATA_KEY && e.key !== null) return;
    backend.reload();
    applyTheme(backend.getSettings().theme);
    const openId = $("list-view").hidden ? null : currentListId();
    if (openId && backend.getList(openId)) renderListView(openId);
    else showMenu(openId ? "deleted" : null);
  });

  const start = backend.startupView();
  if (start.view === "list") showList(start.listId);
  else showMenu(start.reason, start.listId);
}

boot();
