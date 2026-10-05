// 100 common grocery items used to seed the wordbank.

const produce = (name, units = "each") => ({ name, units, category: "Produce" });
const item = (category) => (name, units) => ({ name, units, category });

const dairy = item("Dairy & Eggs");
const meat = item("Meat & Seafood");
const bakery = item("Bakery");
const pantry = item("Pantry");
const frozen = item("Frozen");
const drinks = item("Beverages");
const snacks = item("Snacks");
const household = item("Household");
const personal = item("Personal Care");

export const SEED_ITEMS = [
  // Produce (25)
  produce("Apples", "lb"),
  produce("Bananas", "bunch"),
  produce("Oranges", "lb"),
  produce("Lemons"),
  produce("Limes"),
  produce("Strawberries", "pkg"),
  produce("Blueberries", "pkg"),
  produce("Grapes", "lb"),
  produce("Avocados"),
  produce("Tomatoes", "lb"),
  produce("Potatoes", "lb"),
  produce("Sweet Potatoes", "lb"),
  produce("Onions", "lb"),
  produce("Garlic", "head"),
  produce("Carrots", "lb"),
  produce("Celery", "bunch"),
  produce("Broccoli", "head"),
  produce("Lettuce", "head"),
  produce("Spinach", "bag"),
  produce("Cucumbers"),
  produce("Bell Peppers"),
  produce("Mushrooms", "pkg"),
  produce("Zucchini"),
  produce("Green Onions", "bunch"),
  produce("Cilantro", "bunch"),

  // Dairy & Eggs (12)
  dairy("Milk", "gal"),
  dairy("Eggs", "dozen"),
  dairy("Butter", "lb"),
  dairy("Cheddar Cheese", "oz"),
  dairy("Mozzarella Cheese", "oz"),
  dairy("Parmesan Cheese", "oz"),
  dairy("Cream Cheese", "oz"),
  dairy("Yogurt", "oz"),
  dairy("Greek Yogurt", "oz"),
  dairy("Sour Cream", "oz"),
  dairy("Heavy Cream", "pt"),
  dairy("Half and Half", "qt"),

  // Meat & Seafood (10)
  meat("Chicken Breast", "lb"),
  meat("Chicken Thighs", "lb"),
  meat("Ground Beef", "lb"),
  meat("Ground Turkey", "lb"),
  meat("Bacon", "pkg"),
  meat("Pork Chops", "lb"),
  meat("Steak", "lb"),
  meat("Salmon", "lb"),
  meat("Shrimp", "lb"),
  meat("Deli Turkey", "lb"),

  // Bakery (6)
  bakery("Bread", "loaf"),
  bakery("Bagels", "pkg"),
  bakery("Tortillas", "pkg"),
  bakery("Hamburger Buns", "pkg"),
  bakery("Hot Dog Buns", "pkg"),
  bakery("English Muffins", "pkg"),

  // Pantry (22)
  pantry("Rice", "lb"),
  pantry("Pasta", "lb"),
  pantry("Spaghetti Sauce", "jar"),
  pantry("Flour", "lb"),
  pantry("Sugar", "lb"),
  pantry("Brown Sugar", "lb"),
  pantry("Salt", "oz"),
  pantry("Black Pepper", "oz"),
  pantry("Olive Oil", "bottle"),
  pantry("Vegetable Oil", "bottle"),
  pantry("Peanut Butter", "jar"),
  pantry("Jelly", "jar"),
  pantry("Honey", "jar"),
  pantry("Cereal", "box"),
  pantry("Oatmeal", "box"),
  pantry("Canned Tomatoes", "can"),
  pantry("Black Beans", "can"),
  pantry("Chicken Broth", "carton"),
  pantry("Ketchup", "bottle"),
  pantry("Mustard", "bottle"),
  pantry("Mayonnaise", "jar"),
  pantry("Baking Soda", "box"),

  // Frozen (6)
  frozen("Frozen Pizza", "each"),
  frozen("Frozen Vegetables", "bag"),
  frozen("Frozen Berries", "bag"),
  frozen("Ice Cream", "pt"),
  frozen("Frozen Waffles", "box"),
  frozen("French Fries", "bag"),

  // Beverages (6)
  drinks("Coffee", "lb"),
  drinks("Tea", "box"),
  drinks("Orange Juice", "carton"),
  drinks("Sparkling Water", "pack"),
  drinks("Soda", "pack"),
  drinks("Bottled Water", "pack"),

  // Snacks (5)
  snacks("Chips", "bag"),
  snacks("Crackers", "box"),
  snacks("Popcorn", "box"),
  snacks("Granola Bars", "box"),
  snacks("Almonds", "oz"),

  // Household (5)
  household("Paper Towels", "pack"),
  household("Toilet Paper", "pack"),
  household("Dish Soap", "bottle"),
  household("Laundry Detergent", "bottle"),
  household("Trash Bags", "box"),

  // Personal Care (3)
  personal("Toothpaste", "each"),
  personal("Shampoo", "bottle"),
  personal("Hand Soap", "bottle"),
];
