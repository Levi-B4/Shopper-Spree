// Tiny DOM helpers shared by the frontend modules.

export const $ = (id) => document.getElementById(id);

// h("li", { class: "x", onclick: fn, dataset: {id} }, child, "text", ...)
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === "class") el.className = value;
    else if (key === "dataset") Object.assign(el.dataset, value);
    else if (key === "style") Object.assign(el.style, value);
    else if (key.startsWith("on")) el.addEventListener(key.slice(2), value);
    else if (key in el && typeof value !== "string") el[key] = value;
    else el.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

export function svgIcon(pathD) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", pathD);
  svg.append(path);
  return svg;
}

export const ICONS = {
  star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  x: "M6 6l12 12M18 6L6 18",
  check: "M5 12l5 5L20 7",
  pencil: "M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4",
  smile: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01",
};

export function fillDatalist(datalist, values) {
  datalist.replaceChildren(...values.map((v) => h("option", { value: v })));
}

export function formatQty(n) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

// Runs onConfirm when the dialog's "confirm" button submits its form. Acts on
// the synchronous submit event rather than the async "close" event.
export function confirmDialog(dialog, onConfirm) {
  const form = dialog.querySelector("form");
  const onSubmit = (e) => {
    if (e.submitter?.value === "confirm") onConfirm();
  };
  form.addEventListener("submit", onSubmit);
  dialog.addEventListener("close", () => form.removeEventListener("submit", onSubmit), { once: true });
  dialog.showModal();
}
