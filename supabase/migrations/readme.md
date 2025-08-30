# Supabase Migrations

## Consolidated Schema

All database schema definitions have been consolidated into a single file: `consolidated_schema.sql`.

This file contains:

- Table definitions
- Storage bucket configurations
- Row-level security policies
- Functions and triggers
- Realtime publication settings

## How to Apply

To apply this schema to your Supabase project:

1. Use the Supabase CLI:
   ```
   supabase db reset
   ```

2. Or run the SQL directly in the Supabase SQL Editor in the Dashboard.

## Original Migration Files

The original migration files have been preserved for reference:

- 20230701000000_initial_schema.sql
- 20240701000001_create_profiles_table.sql
- 20240702000001_update_listings_table.sql
- 20240703000001_update_profiles_table.sql
- 20240704000001_update_user_types.sql
- 20240708000001_add_user_type_to_profiles.sql
- 20240709000001_create_cart_tables.sql

These files are no longer needed for schema updates as everything is now in the consolidated file.
