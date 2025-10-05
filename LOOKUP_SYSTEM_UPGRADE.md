# Lookup Table System Upgrade

## Overview

This upgrade normalizes the genre system and adds full CRUD capabilities for all lookup tables, replacing the previous text-based approach with a properly normalized relational database design.

**📍 Server Location:** All lookup management tools (CRUD operations) are now in the **metadata-server** for cross-server utility access. The plot-server retains read-only `get_available_options` for convenience.

## Problem Statement

**Before:**
- Books stored genres as `genre_tags TEXT[]` (array of strings)
- Series stored genre as `genre VARCHAR(100)` (single string)
- No data validation - typos and inconsistencies possible
- No admin interface to manage lookup values
- Poor query performance for genre-based filtering

**After:**
- Normalized many-to-many relationships via junction tables
- Genre IDs used instead of text strings
- Full CRUD operations for all lookup tables
- Data integrity enforced at database level
- Efficient indexed queries

## Changes Made

### 1. Database Schema Changes

#### New Junction Tables
```sql
-- Migration: 015_normalize_genre_relationships.sql

CREATE TABLE book_genres (
    book_id INTEGER REFERENCES books(id),
    genre_id INTEGER REFERENCES genres(id),
    PRIMARY KEY (book_id, genre_id)
);

CREATE TABLE series_genres (
    series_id INTEGER REFERENCES series(id),
    genre_id INTEGER REFERENCES genres(id),
    PRIMARY KEY (series_id, genre_id)
);
```

#### Data Migration
- Automatically converts existing `genre_tags` arrays to `book_genres` records
- Automatically converts existing `genre` strings to `series_genres` records
- Case-insensitive matching with trimming
- Logs warnings for unmatched genres

#### Helper Views
```sql
-- Backwards compatibility - get books with genre arrays
CREATE VIEW books_with_genres AS
SELECT b.*,
    array_agg(g.genre_name) as genre_names,
    array_agg(g.id) as genre_ids
FROM books b
LEFT JOIN book_genres bg ON b.id = bg.book_id
LEFT JOIN genres g ON bg.genre_id = g.id
GROUP BY b.id;
```

### 2. New MCP Tools

**Server:** `metadata-server` (all CRUD operations)

#### Admin Tools (CRUD Operations)

**`create_lookup_option`** - Create new lookup values
```json
{
  "option_type": "genres",
  "name": "urban_fantasy",
  "description": "Fantasy stories set in modern urban environments",
  "is_active": true
}
```

**`update_lookup_option`** - Update existing lookup values
```json
{
  "option_type": "genres",
  "option_id": 5,
  "description": "Updated description",
  "is_active": false
}
```

**`delete_lookup_option`** - Soft/hard delete lookup values
```json
{
  "option_type": "genres",
  "option_id": 5,
  "permanent": false  // false = soft delete (set is_active=false)
}
```

#### Genre Assignment Tools

**`assign_book_genres`** - Assign genres to books
```json
{
  "book_id": 1,
  "genre_ids": [1, 3, 7]  // IDs from genres table
}
```

**`assign_series_genres`** - Assign genres to series
```json
{
  "series_id": 1,
  "genre_ids": [1, 7]
}
```

### 3. Code Structure

**Primary Location: metadata-server** (cross-server utilities)

#### Handler Module
[lookup-management-handlers.js](src/mcps/metadata-server/handlers/lookup-management-handlers.js)
- `LookupManagementHandlers` class with full CRUD operations
- Validates genre IDs before assignment
- Uses transactions for data integrity
- Provides clear error messages

#### Tool Schemas
[lookup-tools-schema.js](src/mcps/metadata-server/schemas/lookup-tools-schema.js)
- 6 tool schemas: get, create, update, delete, assign_book_genres, assign_series_genres
- All tools properly documented with descriptions

#### Server Integration
[metadata-server/index.js](src/mcps/metadata-server/index.js)
- Imported `LookupManagementHandlers`
- Bound all handler methods
- Registered 6 lookup tools alongside metadata tools

#### Plot Server (Read-Only Access)
[plot-server/index.js](src/mcps/plot-server/index.js)
- Retains `get_available_options` for convenience
- CRUD operations removed - now in metadata-server

### 4. Lookup Tables Affected

The following lookup tables now support CRUD operations:
- `genres` - Story genres
- `plot_thread_types` - Types of plot threads
- `plot_thread_statuses` - Plot thread statuses
- `relationship_types` - Relationship types between threads
- `story_concerns` - Story concerns (optional, via story-analysis-server)
- `story_outcomes` - Story outcome types (optional, via story-analysis-server)
- `story_judgments` - Story judgment types (optional, via story-analysis-server)

## Usage Examples

### Adding a New Genre

```javascript
// 1. Create the genre (via metadata-server)
await metadata_server.create_lookup_option({
  option_type: "genres",
  name: "paranormal_romance",
  description: "Romance stories with supernatural elements"
});

// 2. Assign to a book (via metadata-server, assuming genre_id = 11)
await metadata_server.assign_book_genres({
  book_id: 5,
  genre_ids: [1, 7, 11]  // romance, mystery, paranormal_romance
});
```

### Managing Lookup Values

```javascript
// Deactivate a genre (soft delete) - via metadata-server
await metadata_server.delete_lookup_option({
  option_type: "genres",
  option_id: 11,
  permanent: false  // Just hide it, don't delete
});

// Update a description - via metadata-server
await metadata_server.update_lookup_option({
  option_type: "plot_thread_types",
  option_id: 3,
  description: "Updated description for better clarity"
});

// Read-only access from plot-server
await plot_server.get_available_options({
  option_type: "genres",
  active_only: true
});
```

### Querying Books by Genre

```sql
-- Find all books in the fantasy genre
SELECT b.*
FROM books b
JOIN book_genres bg ON b.id = bg.book_id
JOIN genres g ON bg.genre_id = g.id
WHERE g.genre_name = 'fantasy';

-- Or use the helper view
SELECT * FROM books_with_genres
WHERE 'fantasy' = ANY(genre_names);
```

## Migration Instructions

### Step 1: Run the Migration
```bash
# Apply the migration to your database
psql -d your_database -f migrations/015_normalize_genre_relationships.sql
```

### Step 2: Verify Data Migration
```sql
-- Check that genres were migrated correctly
SELECT b.id, b.title, array_agg(g.genre_name) as genres
FROM books b
JOIN book_genres bg ON b.id = bg.book_id
JOIN genres g ON bg.genre_id = g.id
GROUP BY b.id, b.title;

-- Check for any books without genres
SELECT id, title FROM books
WHERE id NOT IN (SELECT DISTINCT book_id FROM book_genres);
```

### Step 3: Update Your MCP Servers
```bash
# Restart the metadata-server to load new lookup tools
# Restart the plot-server to update tool schemas
# The new tools will be automatically available in metadata-server
```

## Benefits

1. **Data Integrity**
   - Foreign key constraints prevent invalid genre assignments
   - No more typos or inconsistent genre names
   - Referential integrity maintained automatically

2. **Performance**
   - Indexed lookups instead of array scans
   - Efficient joins for genre-based queries
   - Better query optimization by database

3. **Flexibility**
   - Add new genres without code changes
   - Deactivate/reactivate genres as needed
   - Update descriptions without migrations

4. **Maintainability**
   - Centralized genre management
   - Soft delete preserves historical data
   - Clear audit trail with timestamps

## Backwards Compatibility

The migration preserves all existing genre data:
- Helper views provide array-based access if needed
- Data is automatically migrated from old columns
- Old columns are safely removed after migration

## Future Enhancements

Potential improvements:
1. Add genre hierarchies (sub-genres)
2. Genre-specific metadata tables
3. Bulk genre operations
4. Genre recommendation system
5. Genre popularity tracking

## Troubleshooting

### Issue: Migration fails with "genre not found"
**Solution:** Check the migration warnings - some genre names in your data may not match the lookup table. Either add missing genres to the lookup table first, or update the book/series data.

### Issue: Cannot delete a genre
**Solution:** Use soft delete (`permanent: false`) instead of hard delete. Hard delete fails if the genre is referenced by any books.

### Issue: Tools not showing up
**Solution:** Restart your metadata-server. The lookup tools are now in metadata-server, not plot-server.

### Issue: Where do I manage lookup tables?
**Solution:** Use the **metadata-server** for all CRUD operations. The plot-server only has read-only `get_available_options`.

## Files Changed

1. **New Files:**
   - [migrations/015_normalize_genre_relationships.sql](migrations/015_normalize_genre_relationships.sql)
   - [src/mcps/metadata-server/handlers/lookup-management-handlers.js](src/mcps/metadata-server/handlers/lookup-management-handlers.js)
   - [src/mcps/metadata-server/schemas/lookup-tools-schema.js](src/mcps/metadata-server/schemas/lookup-tools-schema.js)
   - This document: `LOOKUP_SYSTEM_UPGRADE.md`

2. **Modified Files:**
   - [src/mcps/metadata-server/index.js](src/mcps/metadata-server/index.js) - Added lookup tools
   - [src/mcps/plot-server/schemas/plot-tools-schema.js](src/mcps/plot-server/schemas/plot-tools-schema.js) - Removed CRUD, kept read-only
   - [src/mcps/plot-server/index.js](src/mcps/plot-server/index.js) - Removed lookup management

3. **Deleted Files:**
   - [src/mcps/plot-server/handlers/lookup-management-handlers.js](src/mcps/plot-server/handlers/lookup-management-handlers.js) - Moved to metadata-server

4. **Database Changes:**
   - Removed: `books.genre_tags`, `series.genre`
   - Added: `book_genres`, `series_genres` tables
   - Added: `books_with_genres`, `series_with_genres` views

## Summary

Your lookup table system is now:
- ✅ Properly normalized with junction tables
- ✅ Fully manageable via CRUD operations in **metadata-server**
- ✅ Validated at the database level
- ✅ Performant with proper indexing
- ✅ Backwards compatible with helper views
- ✅ Extensible for future enhancements
- ✅ Centralized in metadata-server for cross-server utility access

**Key Locations:**
- **Management (CRUD):** metadata-server → 6 tools (create, update, delete, assign genres)
- **Read-Only Access:** plot-server → 1 tool (get_available_options)

All lookup management can now be done through the metadata-server MCP interface without requiring database migrations or code changes!
