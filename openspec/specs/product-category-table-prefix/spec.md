## ADDED Requirements

### Requirement: product_categories table name
The backend data layer SHALL use the table name `product_categories` for the product category entity. No component MAY reference the bare table name `categories` to address the product taxonomy.

#### Scenario: Sequelize model maps to renamed table
- **WHEN** the `Category` Sequelize model is initialised
- **THEN** its `tableName` option SHALL equal `"product_categories"`

#### Scenario: Subcategory FK points to renamed table
- **WHEN** the `Subcategory` model declares its `category_id` foreign key
- **THEN** the `references.model` value SHALL equal `"product_categories"`

### Requirement: product_subcategories table name
The backend data layer SHALL use the table name `product_subcategories` for the product subcategory entity. No component MAY reference the bare table name `subcategories` to address the product taxonomy.

#### Scenario: Sequelize model maps to renamed table
- **WHEN** the `Subcategory` Sequelize model is initialised
- **THEN** its `tableName` option SHALL equal `"product_subcategories"`

#### Scenario: Product FK points to renamed table
- **WHEN** the `Product` model declares its `subcategory_id` foreign key
- **THEN** the `references.model` value SHALL equal `"product_subcategories"`

### Requirement: Association declarations use renamed table names
All Sequelize association declarations in `model/index.js` that reference `Category` or `Subcategory` SHALL be consistent with the renamed table names and SHALL NOT use the old bare names as string arguments.

#### Scenario: Category-Subcategory association is intact after rename
- **WHEN** the application starts and Sequelize syncs associations
- **THEN** `Category.hasMany(Subcategory)` and `Subcategory.belongsTo(Category)` SHALL resolve without error and queries joining the two models SHALL return correct rows from `product_categories` and `product_subcategories`

#### Scenario: Product-Subcategory association is intact after rename
- **WHEN** a product query includes `Subcategory` in its `include` list
- **THEN** Sequelize SHALL join against `product_subcategories` and the query SHALL succeed

### Requirement: Database migration renames tables without data loss
A migration script SHALL rename `categories` → `product_categories` and `subcategories` → `product_subcategories` in the MySQL database. The migration SHALL preserve all existing rows, indexes, and auto-increment values.

#### Scenario: Migration executes on a populated database
- **WHEN** the migration script is run against a database that contains rows in `categories` and `subcategories`
- **THEN** the same rows SHALL exist in `product_categories` and `product_subcategories` after completion
- **THEN** the old table names SHALL no longer exist

#### Scenario: Foreign key constraints are valid after migration
- **WHEN** the migration script completes
- **THEN** `product_subcategories.category_id` SHALL have an active FK constraint referencing `product_categories.id`
- **THEN** `products.subcategory_id` SHALL have an active FK constraint referencing `product_subcategories.id`

#### Scenario: Rollback restores original table names
- **WHEN** the rollback block of the migration script is executed
- **THEN** the tables SHALL be renamed back to `categories` and `subcategories`
- **THEN** all FK constraints SHALL be restored to their pre-migration targets
