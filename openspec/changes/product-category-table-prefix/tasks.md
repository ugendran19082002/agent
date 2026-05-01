## 1. Audit existing references

- [x] 1.1 Grep `backend/src/` for all literal strings `"categories"` and `"subcategories"` and list every file that contains them
- [x] 1.2 Confirm no raw SQL in controllers or services embeds these table names outside the model layer

## 2. Update Sequelize models

- [x] 2.1 In `backend/src/model/Category.js` change `tableName` from `"categories"` to `"product_categories"`
- [x] 2.2 In `backend/src/model/Subcategory.js` change `tableName` from `"subcategories"` to `"product_subcategories"`
- [x] 2.3 In `backend/src/model/Subcategory.js` change `references.model` on `category_id` from `"categories"` to `"product_categories"`
- [x] 2.4 In `backend/src/model/Product.js` change `references.model` on `subcategory_id` from `"subcategories"` to `"product_subcategories"`

## 3. Update model associations

- [x] 3.1 In `backend/src/model/index.js` verify all `Category` / `Subcategory` associations — no string literal table names are used in association declarations (Sequelize infers from `tableName`); confirm no explicit `through` string refers to the old names

## 4. Fix any remaining literal references

- [x] 4.1 Update any other file identified in step 1.1 that still references the old table name strings

## 5. Create database migration script

- [x] 5.1 Create `backend/src/scripts/renameProductCategoryTables.js`
- [x] 5.2 Script drops FK constraint on `subcategories.category_id` → `categories.id`
- [x] 5.3 Script renames `categories` → `product_categories` (MySQL `RENAME TABLE`)
- [x] 5.4 Script recreates FK `product_subcategories.category_id` → `product_categories.id`
- [x] 5.5 Script drops FK constraint on `products.subcategory_id` → `subcategories.id`
- [x] 5.6 Script renames `subcategories` → `product_subcategories` (MySQL `RENAME TABLE`)
- [x] 5.7 Script recreates FK `products.subcategory_id` → `product_subcategories.id`
- [x] 5.8 Add a ROLLBACK block that reverses all steps in reverse order

## 6. Verify

- [ ] 6.1 Run the migration script against a local dev database and confirm `SHOW TABLES` shows `product_categories` and `product_subcategories`
- [ ] 6.2 Confirm row counts match pre-migration counts for both tables
- [ ] 6.3 Start the backend server locally and confirm no Sequelize startup errors
- [ ] 6.4 Smoke-test a category list API call and confirm it returns data
