# Shopper Spree — Build Plan (v1)

## Goal
Static, server-less shopping-list site (HTML/CSS/JS only) deployed to Vercel, persisting to localStorage, per CLAUDE.md.

## File layout
```
index.html                 app shell (menu view + list view + dialogs)
css/styles.css             theming via CSS variables (light/dark)
js/backend/storage.js      load/save app state (lists + settings) — localStorage key `shopperSpree.data`
js/backend/lists.js        pure list/item CRUD, favorite, sort, mark bought
js/backend/wordbank.js     wordbank load/save/lookup/upsert — key `shopperSpree.wordbank`
js/backend/seed.js         100 common grocery items {name, units, category}
js/backend/palette.js      predefined list color palette + random pick
js/frontend/app.js         boot, view routing, startup rule
js/frontend/menu.js        menu rendering (sort, favorite, categories, delete all, theme)
js/frontend/listView.js    list rendering (to-buy / bought sections, add item form, autocomplete)
vercel.json                static hosting config
```
Frontend modules only talk to backend via exported functions; backend never touches the DOM.

## Steps
1. Backend
   - storage: `loadState()` returns `{lists, settings}` with defaults; `saveState(state)`.
   - lists: `createList(name, category)`, `deleteList`, `renameList`, `setListColor`, `toggleFavorite`, `setListCategory`, `openList` (updates lastOpenedAt + settings.lastOpenListId), `addItem`, `updateItem`, `deleteItem`, `toggleItemChecked`, `sortedLists(sortBy)` (favorites first, then recent/alpha), `deleteAll()`.
   - wordbank: seeded on first load; `search(prefix)` case-insensitive; `find(name)`; `remember({name, units, category})` adds or updates units/category to most-recent; `clearWordbank()` (resets to seed).
   - palette: ~10 colors, `randomColor()`.
2. Frontend
   - Menu view: header w/ theme toggle, sort select, "new list" form (name + category), list cards (color dot, name, category tag, item counts, favorite star, delete), delete-all button → confirm dialog w/ "also clear wordbank" checkbox. Empty-state message when no lists.
   - List view: back button, color dot (click → palette popover), editable name & category, add-item form (name w/ autocomplete datalist-like dropdown, qty, units, category), "To buy" and "Bought" sections; clicking item toggles checked; per-item delete. Empty-state message when list has no items.
   - Autocomplete: custom dropdown under name input; selecting fills units + category.
   - Startup: open `lastOpenListId` if it exists and has at least one unbought item; otherwise menu with an explanatory note (no lists / last list deleted / last list empty / all bought).
3. Styling: responsive, mobile-first, CSS variables for theme; `data-theme` on `<html>`.
4. vercel.json + update CLAUDE.md `# directory` section.
5. Verify: syntax check with node, run backend logic tests in node, serve locally and smoke-test.

---

# Revision (v2) — after executing v1

## v1 results
- Backend: 18/18 headless-Chrome assertions pass (seed=100 unique, wordbank most-recent update, sort/favorite, all startup reasons, delete-all + wordbank reset).
- UI: 17/17 interaction assertions pass (autocomplete + fill, add, toggle bought both ways, palette, rename, sort, delete-all dialog, notices). Screenshots checked in light/dark/mobile.
- Note: local Node is v12 (no `?.`/top-level await), so verification runs in headless Chrome.

## Gaps found vs. CLAUDE.md / usability
1. **Items can't be edited** after adding — no way to fix quantity, units or category (item categories are a spec feature). → Add an edit button per item that opens an edit dialog (name/qty/units/category) that also autocompletes from the wordbank.
2. **List categories are display-only** in the menu. → Add a category filter (chips: All + each category) to the menu.
3. **Duplicate items**: adding "milk" when "Milk" is already on the list creates a second row. → Merge: add the quantity to the existing item and move it back to "To buy".
4. **Multi-tab overwrite**: each tab keeps state in memory, so the last tab to save wins. → Listen for the `storage` event; reload state and re-render.
5. **Directory section** of CLAUDE.md must be kept updated (spec rule). → Fill it in, including the note that ES modules need an http server locally (`python3 -m http.server`); opening via file:// won't work.
6. Minor: `loadWordbank` reads storage twice on first load → simplify.

## Steps
- backend/lists.js: duplicate merge in `addItem`; `reload()` export for cross-tab sync.
- backend/wordbank.js: simplify first-load save; `reloadWordbank()` for cross-tab sync.
- frontend: edit-item dialog (index.html + listView.js), category filter (menu.js), storage listener (app.js), CSS.
- Re-run backend + UI tests with new cases; update CLAUDE.md directory.

## v2 results
- All 6 revision items done.
- Backend: 21/21 assertions pass (added duplicate merge, re-add of bought item, `reload()`).
- UI: 25/25 assertions pass, 6 runs in a row (added edit dialog, duplicate merge, category filter, cross-tab sync via two frames).
- Found while testing: dialogs relied on the async `close` event, which sometimes never fired in headless Chrome, so delete-all silently did nothing. Switched to the form's synchronous `submit` event (`e.submitter.value`).
