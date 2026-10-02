# CLAUDE.md

# Project Overview
This project is a website that the user can use to create shopping lists. The user should be able to create multiple named lists (selection, deletion, addition). The lists are saved locally so the user can reaccess the list.

# directory
- keep this section updated

# architecture

## Front End
### lists
- each list has a color, randomized but configurable by clicking a circle next to the list name
- autocomplete as the user is typing in the item name
- if the item name is auto completed, autocomplete the category and units of measurement too
- The list will be split in two sections, items that have been bought and items that are not bought
- The user can click items as they buy them to mark them as "bought" this will send those items to the "bought" section. clicking items that are already bought will do the opposite
### menu
- can alternate between dark or light theme for the app
- allow user to favorite a list, this will make them appear at the top
- allow user to sort the menu of lists by recently opened or alphabetical
- allow user to add a category to each list, both the lists themselves and the items within
- On load, show the last list that was opened. If the list has all items as "bought" then open the menu list that shows all lists
- The menu should also show if their are no lists, the last list was deleted, or the last list is empty
- a delete all button to allow the user to start from fresh. This should also prompt them to decide if they want to clear the wordbank


## Back End
- no server
- store in users website local storage
- will need to track lists and their items
- local storage key reference: @.claude/references/localStorageKey.md
- items should have a name, quantity, units of measurement, category, and a checkbox
- a case insensitive wordbank of items that the user could use for autocomplete, that is added to as the user adds items to the list not already in the wordbank(template: @.claude/references/wordBankTemplate.md)
- wordbank item category and units match the most recently used
- wordbank should be seeded with 100 common grocery items
- list colors have a predefined palatte

# Coding Conventions
- javascript, html, css only
- host the website on vercel

# Other Notes
- Keep backend and frontend logic separate