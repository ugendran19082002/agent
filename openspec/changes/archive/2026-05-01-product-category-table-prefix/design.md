## Context

The product taxonomy uses two tables (`categories`, `subcategories`) that share their namespace with `support_categories`, `business_categories`, and other category-like tables. The schema already uses consistent prefixes for those other systems but the product taxonomy was created earlier without one. Three Sequelize models reference these table names by string literal: `Category.js`, `Subcategory.js`, and `Product.js`. Associations in `model/index.js` and FK `references` blocks also embed the bare names.

## Goals / Non-Goals

**Goals:**
- Rename `categories` → `product_categories` and `subcategories` → `product_subcategories` in MySQL
- Update all `tableName`, `references.model`, and association `through` strings in the Sequelize layer
- Provide a migration script that is safe to run against an existing live database

**Non-Goals:**
- Renaming `business_categories`, `support_categories`, or any other category-like table
- Changing column names, data types, or application logic beyond what is required by the rename
- API response shape changes — the JSON field names exposed by controllers are unchanged

## Decisions

**1. Use MySQL `RENAME TABLE` instead of CREATE + INSERT + DROP**
- Rationale: `RENAME TABLE` is atomic and preserves all row data, indexes, and auto-increment state. CREATE + copy introduces downtime risk and potential data inconsistency.
- Alternative considered: `ALTER TABLE … RENAME TO` — equivalent in MySQL 8, `RENAME TABLE` preferred for clarity and explicit multi-table rename in one statement.

**2. Drop and recreate FK constraints as part of migration**
- Rationale: MySQL does not automatically update FK references when a referenced table is renamed. The migration must `ALTER TABLE subcategories … DROP FOREIGN KEY` before renaming `categories`, then add the FK back pointing to `product_categories`. Same for `products` → `product_subcategories`.
- Order: rename FKs on child tables first, rename parent tables second.

**3. Update `tableName` and `references.model` strings in Sequelize models only — no Sequelize migration file**
- Rationale: The project uses a manual SQL migration pattern (scripts in `backend/src/scripts/`). A new SQL script `renameProductCategoryTables.js` follows that convention. A Sequelize migration file would require introducing `sequelize-cli` and its migration table, which is out of scope.

**4. FK column names stay unchanged (`category_id`, `subcategory_id`)**
- Rationale: The request is to rename *tables*, not columns. Changing column names is a separate concern and not requested.

## Risks / Trade-offs

- **Live FK constraint violation during migration** → Mitigation: wrap the migration in a transaction; drop FK constraints before renaming, recreate after.
- **Other raw SQL in controllers/services that embeds `"categories"` or `"subcategories"` as string literals** → Mitigation: grep the entire `backend/src/` tree for these literals as part of the task checklist before closing the change.
- **Rollback complexity** → Mitigation: the migration script should include a clearly commented ROLLBACK block that reverses the renames in the opposite order.

## Migration Plan

1. Run grep check to find all literal `"categories"` / `"subcategories"` references in `backend/src/`
2. Apply code changes: update `Category.js`, `Subcategory.js`, `Product.js`, `model/index.js`
3. Create `backend/src/scripts/renameProductCategoryTables.js` — SQL migration that:
   a. Drops FK on `product_subcategories.category_id` (referencing `categories`)
   b. Renames `categories` → `product_categories`
   c. Recreates FK on `product_subcategories.category_id` → `product_categories.id`
   d. Drops FK on `products.subcategory_id` (referencing `subcategories`)
   e. Renames `subcategories` → `product_subcategories`
   f. Recreates FK on `products.subcategory_id` → `product_subcategories.id`
4. Test locally against a dev database snapshot
5. Run migration on production; verify with a `SHOW TABLES` and a spot-check query

**Rollback:** Reverse the renames and FK recreations in the opposite order using the ROLLBACK block in the migration script.
