```
{
  lists: [{
    id, name, color, emoji, category, favorite: false,
    createdAt, lastOpenedAt,
    items: [{ id, name, quantity, units, category, emoji, checked: false }]
  }],
  settings: { theme: "light" | "dark", sortBy: "recent" | "alpha", lastOpenListId }
}
```