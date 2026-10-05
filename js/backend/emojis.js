// Predefined emoji set for lists and items.

export const EMOJIS = [
  // food
  "🍎", "🍌", "🍇", "🍓", "🍋", "🥑", "🥕", "🥦",
  "🌽", "🥔", "🍅", "🍞", "🥐", "🧀", "🥚", "🥛",
  "🧈", "🍗", "🥩", "🥓", "🐟", "🍤", "🍝", "🍚",
  "🥫", "🍕", "🌮", "🍔", "🍪", "🍫", "🍦", "🍿",
  "☕", "🧃", "🍷", "🍺", "🍊", "🥬", "🧅", "🧄",
  "🍄", "🥜", "🍯", "🥒", "🥯", "🍳", "🥤", "🧂",
  // household + personal
  "🧻", "🧼", "🧴", "🪥", "💊", "🧹", "🐶", "🐱",
  "👶", "🌸",
  // occasions
  "🛒", "🏠", "🎉", "🎂", "🎄", "🎃", "🏕️", "💪",
  "❤️", "⭐",
];

export function isEmoji(emoji) {
  return EMOJIS.includes(emoji);
}
