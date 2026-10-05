// Menu view: all lists, sorting, favorites, new list, delete all.

import * as backend from "../backend/lists.js";
import { toggleEmojiPicker, setEmojiButton } from "./emojiPicker.js";
import { $, h, svgIcon, ICONS, fillDatalist, confirmDialog } from "./dom.js";

let onOpenList = () => {};
let categoryFilter = null; // null = all
let newEmoji = ""; // emoji chosen for the new list

export function initMenu(handlers) {
  onOpenList = handlers.onOpenList;

  const emojiBtn = $("new-list-emoji-btn");
  emojiBtn.addEventListener("click", () => toggleEmojiPicker(emojiBtn, newEmoji, setNewEmoji));
  setNewEmoji("");

  $("new-list-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("new-list-name").value.trim();
    if (!name) return;
    const list = backend.createList(name, $("new-list-category").value, newEmoji);
    e.target.reset();
    setNewEmoji("");
    onOpenList(list.id);
  });

  $("sort-select").addEventListener("change", (e) => {
    backend.setSortBy(e.target.value);
    renderMenu();
  });

  $("delete-all-btn").addEventListener("click", () => {
    $("clear-wordbank").checked = false;
    confirmDialog($("delete-all-dialog"), () => {
      backend.deleteAll({ clearWordbank: $("clear-wordbank").checked });
      handlers.onAfterDeleteAll();
    });
  });
}

function setNewEmoji(emoji) {
  newEmoji = emoji;
  setEmojiButton($("new-list-emoji-btn"), emoji);
}

export function renderMenu() {
  const { sortBy } = backend.getSettings();
  $("sort-select").value = sortBy;
  const categories = backend.listCategories();
  fillDatalist($("list-category-options"), categories);
  if (categoryFilter && !categories.includes(categoryFilter)) categoryFilter = null;
  renderCategoryFilter(categories);

  const all = backend.sortedLists(sortBy);
  const lists = categoryFilter ? all.filter((l) => l.category === categoryFilter) : all;
  $("lists").replaceChildren(...lists.map(listCard));
  $("lists-empty").hidden = all.length > 0;
  $("delete-all-btn").disabled = all.length === 0;
}

function renderCategoryFilter(categories) {
  const box = $("category-filter");
  box.hidden = categories.length === 0;
  const chip = (label, value) =>
    h(
      "button",
      {
        class: "filter-chip",
        type: "button",
        "aria-pressed": String(categoryFilter === value),
        onclick: () => {
          categoryFilter = value;
          renderMenu();
        },
      },
      label
    );
  box.replaceChildren(chip("All", null), ...categories.map((c) => chip(c, c)));
}

function listCard(list) {
  const total = list.items.length;
  const bought = list.items.filter((i) => i.checked).length;
  const summary =
    total === 0 ? "Empty" : bought === total ? `All ${total} bought` : `${total - bought} to buy · ${bought} bought`;

  const fav = h(
    "button",
    {
      class: `icon-btn star${list.favorite ? " on" : ""}`,
      type: "button",
      "aria-label": list.favorite ? `Unfavorite ${list.name}` : `Favorite ${list.name}`,
      "aria-pressed": String(list.favorite),
      onclick: (e) => {
        e.stopPropagation();
        backend.toggleFavorite(list.id);
        renderMenu();
      },
    },
    svgIcon(ICONS.star)
  );

  const del = h(
    "button",
    {
      class: "icon-btn subtle",
      type: "button",
      "aria-label": `Delete ${list.name}`,
      onclick: (e) => {
        e.stopPropagation();
        $("confirm-title").textContent = `Delete “${list.name}”?`;
        $("confirm-message").textContent = "This list and all of its items will be removed.";
        confirmDialog($("confirm-dialog"), () => {
          backend.deleteList(list.id);
          renderMenu();
        });
      },
    },
    svgIcon(ICONS.trash)
  );

  const progress = total ? Math.round((bought / total) * 100) : 0;

  return h(
    "li",
    { class: "list-card card" },
    h(
      "button",
      { class: "list-open", type: "button", onclick: () => onOpenList(list.id) },
      h("span", { class: "color-dot", style: { background: list.color }, "aria-hidden": "true" }),
      h(
        "span",
        { class: "list-info" },
        h("span", { class: "list-title" }, list.emoji ? `${list.emoji} ${list.name}` : list.name),
        h(
          "span",
          { class: "list-sub" },
          list.category ? h("span", { class: "chip" }, list.category) : null,
          h("span", {}, summary)
        ),
        total
          ? h("span", { class: "progress", "aria-hidden": "true" },
              h("span", { style: { width: `${progress}%`, background: list.color } }))
          : null
      )
    ),
    fav,
    del
  );
}
