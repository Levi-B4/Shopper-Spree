// Shared emoji picker: one popover, anchored under whichever emoji button
// opened it (list header, add-item form, or an item row).

import { EMOJIS } from "../backend/emojis.js";
import { $, h, svgIcon, ICONS } from "./dom.js";

let anchor = null;
let onPick = null;

export function initEmojiPicker() {
  const pop = $("emoji-popover");

  const pick = (emoji) => {
    const cb = onPick;
    closeEmojiPicker();
    cb?.(emoji);
  };

  pop.replaceChildren(
    ...EMOJIS.map((emoji) =>
      h(
        "button",
        {
          class: "emoji-option",
          type: "button",
          role: "menuitemradio",
          "aria-label": emoji,
          dataset: { emoji },
          onclick: () => pick(emoji),
        },
        emoji
      )
    ),
    h("button", { class: "emoji-clear", type: "button", onclick: () => pick("") }, "No emoji")
  );

  // Clicks on the anchor are handled by its own toggle.
  document.addEventListener("click", (e) => {
    if (!pop.hidden && !pop.contains(e.target) && !anchor?.contains(e.target)) closeEmojiPicker();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !pop.hidden) {
      const btn = anchor;
      closeEmojiPicker();
      btn?.focus();
    }
  });
  // Phones fire resize when the address bar hides, so follow the anchor instead of closing.
  window.addEventListener("resize", () => {
    if (!pop.hidden && anchor) placeUnder(anchor);
  });
}

// Opens the picker under btn, or closes it if btn already owns it.
// onChoose receives the chosen emoji, or "" for "No emoji".
export function toggleEmojiPicker(btn, current, onChoose) {
  const pop = $("emoji-popover");
  if (!pop.hidden && anchor === btn) return closeEmojiPicker();
  closeEmojiPicker();

  anchor = btn;
  onPick = onChoose;
  btn.setAttribute("aria-expanded", "true");
  for (const opt of pop.querySelectorAll(".emoji-option")) {
    const selected = opt.dataset.emoji === current;
    opt.classList.toggle("selected", selected);
    opt.setAttribute("aria-checked", String(selected));
  }
  pop.hidden = false;
  placeUnder(btn);
  (pop.querySelector(".selected") || pop.firstElementChild).focus();
}

// Below the button, kept inside the viewport horizontally.
function placeUnder(btn) {
  const pop = $("emoji-popover");
  const r = btn.getBoundingClientRect();
  const maxLeft = document.documentElement.clientWidth - pop.offsetWidth - 8;
  pop.style.left = `${Math.max(8, Math.min(r.left, maxLeft)) + window.scrollX}px`;
  pop.style.top = `${r.bottom + 8 + window.scrollY}px`;
}

export function closeEmojiPicker() {
  $("emoji-popover").hidden = true;
  anchor?.setAttribute("aria-expanded", "false");
  anchor = null;
  onPick = null;
}

// Shows the emoji on its button, or a faint smiley when none is set.
export function setEmojiButton(btn, emoji) {
  btn.replaceChildren(emoji || svgIcon(ICONS.smile));
  btn.classList.toggle("no-emoji", !emoji);
}
