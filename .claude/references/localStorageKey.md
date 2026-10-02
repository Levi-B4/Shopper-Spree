```
{
  lists: [{
    id, name, color, category, favorite: false,
    createdAt, lastOpenedAt,
    items: [{ id, name, quantity, units, category, checked: false }]
  }],
  settings: { theme: "light" | "dark", sortBy: "recent" | "alpha", lastOpenListId }
}
```