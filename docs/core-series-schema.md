# Core Series-First Database Schema

This document outlines the essential database schema for the main branch of the MCP writing system. This schema establishes the foundation for a series-first approach, where all other elements (books, characters, locations, etc.) will build upon this core structure.

## Core Tables

### authors
Authors (including pen names) who create series.
```sql
CREATE TABLE authors (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### series
The top-level container for all content.
```sql
CREATE TABLE series (
    series_id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES authors(author_id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,

    description TEXT,
    genre VARCHAR(100),
    target_audience VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### books
Individual books within a series.
```sql
CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(series_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    book_number INTEGER,
    status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, draft, editing, published
    target_word_count INTEGER,
    actual_word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id, book_number)
);
```



### series_timeline
Master timeline for the series.
```sql
CREATE TABLE series_timeline (
    timeline_id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(series_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### series_metadata
Flexible metadata storage for series-level information.
```sql
CREATE TABLE series_metadata (
    metadata_id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(series_id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id, key)
);
```

## Utility Functions

### update_timestamp
```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## Triggers

### Automatic timestamp updates
```sql
CREATE TRIGGER update_series_timestamp
    BEFORE UPDATE ON series
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_books_timestamp
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_series_timeline_timestamp
    BEFORE UPDATE ON series_timeline
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_authors_timestamp
    BEFORE UPDATE ON authors
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();


```

## Indices

```sql
-- Optimize author lookups
CREATE INDEX idx_authors_name ON authors(name);
CREATE INDEX idx_authors_email ON authors(email);

-- Optimize series lookups
CREATE INDEX idx_series_title ON series(title);
CREATE INDEX idx_series_author_id ON series(author_id);

-- Optimize book lookups within series
CREATE INDEX idx_books_series_id ON books(series_id);
CREATE INDEX idx_books_status ON books(status);



-- Optimize timeline lookups
CREATE INDEX idx_series_timeline_series_id ON series_timeline(series_id);

-- Optimize metadata lookups
CREATE INDEX idx_series_metadata_series_id_key ON series_metadata(series_id, key);
```

## Design Principles

1. **Series-Centric**: Everything stems from the series table
2. **Flexible Metadata**: Use series_metadata for extensible properties
3. **Timeline Ready**: Basic timeline structure for future expansion
4. **Team Support**: Built-in collaboration capabilities
5. **Status Tracking**: Book progress tracking
6. **Performance**: Appropriate indices for common queries

## Implementation Notes

1. All tables include created_at timestamps
2. Updated_at timestamps are automatically managed via triggers
3. Appropriate foreign key constraints with CASCADE delete
4. Unique constraints where logical (e.g., book numbers within series)
5. Indexed fields for common lookup patterns

## Migration Best Practices

1. Always backup database before migrations
2. Use transaction blocks for safe rollback
3. Add new fields as nullable or with defaults
4. Document all schema changes
5. Include both up and down migrations

## Next Steps

This core schema provides the foundation for:

1. Adding world-building elements (referencing series_id)
2. Character management (within series context)
3. Plot tracking (across books in series)
4. Research and continuity tracking
5. Writing production management

Each additional MCP will build upon this foundation, always maintaining the series as the top-level organizational unit.
