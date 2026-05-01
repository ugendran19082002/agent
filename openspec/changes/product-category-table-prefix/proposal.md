## Why

The database has three distinct category systems (`categories`, `support_categories`, `business_categories`) with no naming convention to distinguish them. Adding a `product_` prefix to the product taxonomy tables makes the schema self-documenting and consistent with the existing `support_` and `business_` prefixes already used elsewhere.

## What Changes

- **BREAKING** Rename table `categories` → `product_categories`
- **BREAKING** Rename table `subcategories` → `product_subcategories`
- Update foreign key reference in `subcategories` / `product_subcategories`: `model: "categories"` → `model: "product_categories"`
- Update foreign key reference in `products`: `model: "subcategories"` → `model: "product_subcategories"`
- Update Sequelize model `tableName` values in `Category.js` and `Subcategory.js`
- Update all join-table column references and associations in `model/index.js` that use these table names
- Add a SQL migration script to perform the rename in the live database

## Capabilities

### New Capabilities
- `product-category-table-prefix`: Rename `categories` and `subcategories` tables to `product_categories` and `product_subcategories`, update all FK column references, Sequelize model definitions, and association declarations to match.

### Modified Capabilities

## Impact

- **Database:** Two table renames; all FK constraints that reference `categories` or `subcategories` must be recreated
- **Backend models:** `Category.js`, `Subcategory.js` (`tableName`); `Product.js` (FK reference); `model/index.js` (associations)
- **Backend controllers/services:** Any raw SQL or Sequelize query using the literal table name strings `"categories"` or `"subcategories"` must be updated
- **Migration script:** A new SQL migration must be provided to rename the tables in the live database without data loss
