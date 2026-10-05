// Predefined list color palette.

export const PALETTE = [
  "#e5484d", // red
  "#f76b15", // orange
  "#ffc53d", // amber
  "#46a758", // green
  "#12a594", // teal
  "#0090ff", // blue
  "#3e63dd", // indigo
  "#8e4ec6", // purple
  "#d6409f", // pink
  "#8d8d86", // slate
];

export function randomColor(exclude = []) {
  const choices = PALETTE.filter((c) => !exclude.includes(c));
  const pool = choices.length ? choices : PALETTE;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function isPaletteColor(color) {
  return PALETTE.includes(color);
}
