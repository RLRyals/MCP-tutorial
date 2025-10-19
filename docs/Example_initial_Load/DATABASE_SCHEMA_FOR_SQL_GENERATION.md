# Database Schema Documentation for SQL Script Generation

This document provides the complete table schema for adding a new series to the database via SQL scripts. Use this as a reference when an LLM needs to generate INSERT statements based on a series premise document.

## Table of Contents
1. [Core Series Tables](#core-series-tables)
2. [Book Management](#book-management)
3. [Character Management](#character-management)
4. [Plot Structure](#plot-structure)
5. [World Building](#world-building)
6. [Relationship Management](#relationship-management)
7. [Lookup Tables](#lookup-tables)
8. [Complete Insert Order](#complete-insert-order)

---

## Core Series Tables

### `authors`
```sql
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    bio TEXT,
    birth_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `series`
```sql
CREATE TABLE series (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_audience VARCHAR(100),
    status VARCHAR(50) CHECK (status IN ('ongoing', 'completed', 'hiatus')) DEFAULT 'ongoing',
    start_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Note:** The `series` table no longer has a `genre` column. Genres are managed via the `series_genres` junction table.

### `series_genres` (Junction Table)
```sql
CREATE TABLE series_genres (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id, genre_id)
);
```

### `metadata`
```sql
CREATE TABLE metadata (
    id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    metadata_key VARCHAR(255) NOT NULL,
    metadata_value TEXT NOT NULL,
    metadata_type VARCHAR(50) NOT NULL DEFAULT 'string' CHECK (metadata_type IN ('string', 'number', 'date', 'url', 'json')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT metadata_context_check CHECK (
        (series_id IS NOT NULL AND book_id IS NULL) OR
        (series_id IS NULL AND book_id IS NOT NULL)
    ),
    CONSTRAINT unique_series_metadata_key UNIQUE (series_id, metadata_key) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT unique_book_metadata_key UNIQUE (book_id, metadata_key) DEFERRABLE INITIALLY DEFERRED
);
```

---

## Book Management

### `books`
```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    book_number INTEGER,
    status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, draft, editing, published
    target_word_count INTEGER,
    actual_word_count INTEGER DEFAULT 0,
    publication_year INTEGER,
    description TEXT,
    isbn VARCHAR(20),
    page_count INTEGER,
    cover_image_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id, book_number)
);
```

**Note:** The `books` table no longer has a `genre_tags` column. Book genres are managed via the `book_genres` junction table.

### `book_genres` (Junction Table)
```sql
CREATE TABLE book_genres (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, genre_id)
);
```

### `chapters`
```sql
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    part_number INTEGER,
    section_name VARCHAR(100),
    summary TEXT,
    word_count INTEGER DEFAULT 0,
    target_word_count INTEGER,
    page_count INTEGER,
    status VARCHAR(50) DEFAULT 'planned', -- planned, outlined, drafted, revised, final
    draft_number INTEGER DEFAULT 1,
    story_time_start TEXT,
    story_time_end TEXT,
    story_duration TEXT,
    pov_character_id INTEGER REFERENCES characters(id),
    narrative_style VARCHAR(50), -- first_person, third_limited, third_omniscient
    tense VARCHAR(20), -- present, past, mixed
    chapter_purpose TEXT[],
    dramatic_function VARCHAR(50), -- exposition, rising_action, climax, falling_action, resolution
    primary_location TEXT,
    secondary_locations TEXT[],
    author_notes TEXT,
    writing_notes TEXT,
    revision_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, chapter_number)
);
```

---

## Character Management

### `characters`
```sql
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(500),
    aliases TEXT[], -- Array of alternative names/nicknames
    character_type VARCHAR(50) DEFAULT 'main', -- main, supporting, minor, antagonist
    first_appearance_book_id INTEGER REFERENCES books(id),
    last_appearance_book_id INTEGER REFERENCES books(id),
    status VARCHAR(50) DEFAULT 'alive', -- alive, dead, missing, unknown
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `character_details`
```sql
CREATE TABLE character_details (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- physical, personality, background, skills, etc.
    attribute VARCHAR(100) NOT NULL, -- eye_color, height, temperament, etc.
    value TEXT NOT NULL,
    source_book_id INTEGER REFERENCES books(id),
    confidence_level VARCHAR(20) DEFAULT 'established', -- established, mentioned, implied
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(character_id, category, attribute)
);
```

### `character_arcs`
```sql
CREATE TABLE character_arcs (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    arc_name VARCHAR(255),
    starting_state TEXT,
    ending_state TEXT,
    key_events TEXT[],
    growth_areas TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(character_id, book_id)
);
```

### `character_knowledge`
```sql
CREATE TABLE character_knowledge (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    knowledge_category VARCHAR(100) NOT NULL, -- secret, skill, person, location, event
    knowledge_item VARCHAR(255) NOT NULL,
    knowledge_level VARCHAR(50) DEFAULT 'knows', -- knows, suspects, unaware, forgot
    learned_book_id INTEGER REFERENCES books(id),
    learned_context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Plot Structure

### `plot_threads`
```sql
CREATE TABLE plot_threads (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thread_type_id INTEGER REFERENCES plot_thread_types(id),
    importance_level INTEGER DEFAULT 5 CHECK (importance_level >= 1 AND importance_level <= 10),
    complexity_level INTEGER DEFAULT 5 CHECK (complexity_level >= 1 AND complexity_level <= 10),
    start_book INTEGER,
    end_book INTEGER,
    current_status_id INTEGER DEFAULT 1 REFERENCES plot_thread_statuses(id),
    parent_thread_id INTEGER REFERENCES plot_threads(id),
    related_characters INTEGER[],
    resolution_notes TEXT,
    resolution_book INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_book IS NULL OR end_book >= start_book)
);
```


---

## World Building

### `locations`
```sql
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location_type VARCHAR(100) NOT NULL, -- city, forest, building, region, landmark, etc.
    description TEXT,
    parent_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    climate VARCHAR(100),
    terrain VARCHAR(100),
    notable_features TEXT[],
    atmosphere TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `world_elements`
```sql
CREATE TABLE world_elements (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    element_type VARCHAR(100) NOT NULL, -- magic_system, technology, natural_law, supernatural, etc.
    description TEXT,
    rules_text TEXT,
    limitations TEXT,
    power_level INTEGER CHECK (power_level BETWEEN 1 AND 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `organizations`
```sql
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(100) NOT NULL, -- government, guild, criminal, religious, military, etc.
    description TEXT,
    headquarters_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    parent_organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    influence_level INTEGER CHECK (influence_level BETWEEN 1 AND 10),
    member_count INTEGER,
    status VARCHAR(50) DEFAULT 'active', -- active, disbanded, dormant, secret
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `world_systems`
```sql
CREATE TABLE world_systems (
    id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id),
    system_name VARCHAR(255) NOT NULL,
    system_type VARCHAR(100), -- magic, psionics, technology, divine, supernatural, mutation, alchemy
    power_source TEXT,
    access_method TEXT,
    limitations TEXT[],
    system_rules TEXT[],
    power_scaling JSONB,
    system_users INTEGER[], -- Character IDs who can use this system
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `system_abilities`
```sql
CREATE TABLE system_abilities (
    id SERIAL PRIMARY KEY,
    system_id INTEGER REFERENCES world_systems(id) ON DELETE CASCADE,
    ability_name VARCHAR(255) NOT NULL,
    ability_description TEXT,
    power_level INTEGER CHECK (power_level BETWEEN 1 AND 10),
    requirements TEXT,
    limitations TEXT,
    characters_with_ability INTEGER[], -- Character IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Relationship Management

### `relationship_arcs`
```sql
CREATE TABLE relationship_arcs (
    id SERIAL PRIMARY KEY,
    plot_thread_id INTEGER REFERENCES plot_threads(id),
    arc_name VARCHAR(255) NOT NULL,
    participants JSONB NOT NULL, -- Flexible array of character objects with roles
    relationship_type VARCHAR(100), -- romantic, family, friendship, professional, antagonistic
    current_dynamic TEXT,
    development_factors TEXT[],
    complexity_level INTEGER CHECK (complexity_level BETWEEN 1 AND 10),
    milestone_events JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `relationship_dynamics`
```sql
CREATE TABLE relationship_dynamics (
    id SERIAL PRIMARY KEY,
    arc_id INTEGER REFERENCES relationship_arcs(id) ON DELETE CASCADE,
    chapter_id INTEGER,
    scene_id INTEGER,
    dynamic_change TEXT,
    tension_change INTEGER CHECK (tension_change BETWEEN -10 AND 10),
    change_type VARCHAR(100), -- emotional, power, trust, commitment, conflict
    trigger_event TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `information_reveals`
```sql
CREATE TABLE information_reveals (
    id SERIAL PRIMARY KEY,
    plot_thread_id INTEGER REFERENCES plot_threads(id),
    reveal_type VARCHAR(100), -- evidence, secret, backstory, world_rule, relationship, skill
    information_content TEXT NOT NULL,
    reveal_method VARCHAR(255), -- discovered, confessed, witnessed, deduced
    significance_level VARCHAR(50), -- minor, major, climactic, world_changing
    affects_characters INTEGER[],
    revealed_in_chapter INTEGER,
    consequences TEXT,
    foreshadowing_chapters INTEGER[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Lookup Tables

These tables contain predefined values that are referenced by foreign keys in other tables.

### `genres`
```sql
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    genre_name VARCHAR(50) NOT NULL UNIQUE,
    genre_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Common genres (already seeded):**
- romance
- fantasy
- mystery
- thriller
- science_fiction
- historical_fiction
- contemporary
- young_adult
- literary_fiction
- action_adventure

### `plot_thread_types`
```sql
CREATE TABLE plot_thread_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    type_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Common types (already seeded):**
- series_arc
- mini_arc
- main_case
- subplot
- character_arc
- mystery_element
- romance_arc
- world_building

### `plot_thread_statuses`
```sql
CREATE TABLE plot_thread_statuses (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    status_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Common statuses (already seeded):**
- active
- resolved
- on_hold
- abandoned
- planning
- suspended

---

## Complete Insert Order

When generating SQL scripts to add a new series, follow this order to satisfy foreign key constraints:

### 1. Author (if new)
```sql
INSERT INTO authors (name, email, bio)
VALUES ('Author Name', 'email@example.com', 'Biography text')
RETURNING id;
```

### 2. Series
```sql
INSERT INTO series (author_id, title, description, target_audience, status, start_year)
VALUES (1, 'Series Title', 'Series description', 'Target audience', 'ongoing', 2025)
RETURNING id;
```

### 3. Series Genres (using existing genre IDs)
```sql
-- First, look up genre IDs
SELECT id FROM genres WHERE genre_name IN ('fantasy', 'romance');

-- Then insert into junction table
INSERT INTO series_genres (series_id, genre_id)
VALUES
    (1, 2),  -- fantasy
    (1, 1);  -- romance
```

### 4. Books
```sql
INSERT INTO books (series_id, title, book_number, status, description, target_word_count)
VALUES
    (1, 'Book 1 Title', 1, 'planned', 'Book 1 description', 80000),
    (1, 'Book 2 Title', 2, 'planned', 'Book 2 description', 85000),
    (1, 'Book 3 Title', 3, 'planned', 'Book 3 description', 90000)
RETURNING id;
```

### 5. Book Genres (optional - if different from series)
```sql
INSERT INTO book_genres (book_id, genre_id)
VALUES
    (1, 2),  -- Book 1: fantasy
    (1, 1);  -- Book 1: romance
```

### 6. Characters
```sql
INSERT INTO characters (series_id, name, full_name, character_type, status, first_appearance_book_id)
VALUES
    (1, 'Character Name', 'Full Character Name', 'main', 'alive', 1),
    (1, 'Another Character', 'Another Full Name', 'supporting', 'alive', 1)
RETURNING id;
```

### 7. Character Details
```sql
INSERT INTO character_details (character_id, category, attribute, value)
VALUES
    (1, 'physical', 'age', '25'),
    (1, 'physical', 'hair_color', 'dark brown'),
    (1, 'personality', 'temperament', 'analytical and cautious'),
    (2, 'physical', 'age', '28'),
    (2, 'personality', 'temperament', 'bold and impulsive');
```

### 8. Locations
```sql
INSERT INTO locations (series_id, name, location_type, description, climate, atmosphere)
VALUES
    (1, 'City Name', 'city', 'Description of the city', 'temperate', 'bustling and mysterious'),
    (1, 'Forest Name', 'forest', 'Ancient magical forest', 'humid', 'eerie and enchanted')
RETURNING id;
```

### 9. Organizations
```sql
INSERT INTO organizations (series_id, name, organization_type, description, influence_level, status)
VALUES
    (1, 'Organization Name', 'government', 'Description of organization', 8, 'active'),
    (1, 'Guild Name', 'guild', 'Description of guild', 6, 'active')
RETURNING id;
```

### 10. World Systems
```sql
INSERT INTO world_systems (series_id, system_name, system_type, power_source, access_method, limitations, system_rules)
VALUES
    (1, 'Magic System Name', 'magic', 'Ambient energy', 'Innate ability or training',
     ARRAY['Physical exhaustion', 'Requires concentration'],
     ARRAY['Cannot create matter from nothing', 'Stronger with practice'])
RETURNING id;
```

### 11. System Abilities
```sql
INSERT INTO system_abilities (system_id, ability_name, ability_description, power_level, requirements, limitations)
VALUES
    (1, 'Telekinesis', 'Move objects with mind', 5, 'Line of sight', 'Weight limit based on skill'),
    (1, 'Fire Manipulation', 'Control and create fire', 7, 'Emotional control', 'Drains energy quickly');
```

### 12. Plot Threads (look up type and status IDs first)
```sql
-- Get IDs for plot thread types and statuses
SELECT id FROM plot_thread_types WHERE type_name = 'series_arc';
SELECT id FROM plot_thread_statuses WHERE status_name = 'planning';

-- Insert plot threads
INSERT INTO plot_threads (series_id, title, description, thread_type_id, importance_level,
                          complexity_level, start_book, end_book, current_status_id)
VALUES
    (1, 'Main Series Arc', 'The overarching mystery of the series', 1, 10, 9, 1, 3, 5),
    (1, 'Character Development Arc', 'Protagonist growth', 5, 8, 7, 1, 3, 5)
RETURNING id;
```

### 13. Relationship Arcs
```sql
INSERT INTO relationship_arcs (plot_thread_id, arc_name, participants, relationship_type,
                                current_dynamic, complexity_level)
VALUES
    (2, 'Main Romance',
     '[{"character_id": 1, "role": "protagonist"}, {"character_id": 2, "role": "love_interest"}]'::jsonb,
     'romantic', 'enemies-to-lovers tension', 8);
```

### 14. Information Reveals
```sql
INSERT INTO information_reveals (plot_thread_id, reveal_type, information_content,
                                  reveal_method, significance_level, affects_characters)
VALUES
    (1, 'secret', 'The protagonist discovers a hidden lineage',
     'discovered', 'major', ARRAY[1]);
```

### 15. Metadata (optional)
```sql
INSERT INTO metadata (series_id, metadata_key, metadata_value, metadata_type)
VALUES
    (1, 'setting_time_period', 'Modern day with magical elements', 'string'),
    (1, 'planned_total_books', '3', 'number'),
    (1, 'series_tagline', 'Where magic meets mystery', 'string');
```

---

## Important Notes for SQL Generation

### Foreign Key Lookups
When generating INSERT statements, you'll often need to reference IDs from lookup tables. Use subqueries:

```sql
-- Example: Insert plot thread with type lookup
INSERT INTO plot_threads (series_id, title, thread_type_id, current_status_id)
VALUES (
    1,
    'Main Arc',
    (SELECT id FROM plot_thread_types WHERE type_name = 'series_arc'),
    (SELECT id FROM plot_thread_statuses WHERE status_name = 'planning')
);
```

### Array Fields
PostgreSQL array fields use the `ARRAY[]` syntax:

```sql
-- Text arrays
INSERT INTO characters (series_id, name, aliases)
VALUES (1, 'John Doe', ARRAY['JD', 'The Doctor', 'Johnny']);

-- Integer arrays
INSERT INTO plot_threads (series_id, title, related_characters)
VALUES (1, 'Main Arc', ARRAY[1, 2, 3]);
```

### JSONB Fields
For flexible structured data, use JSONB with proper JSON formatting:

```sql
INSERT INTO relationship_arcs (arc_name, participants)
VALUES (
    'Romance Arc',
    '[
        {"character_id": 1, "role": "protagonist", "age": 25},
        {"character_id": 2, "role": "love_interest", "age": 28}
    ]'::jsonb
);
```

### Cascading Deletes
Note that many tables use `ON DELETE CASCADE`, meaning:
- Deleting a series will delete all books, characters, locations, etc.
- Deleting a book will delete all chapters, character arcs for that book, etc.
- Deleting a character will delete all character details, arcs, and knowledge

### Unique Constraints
Be aware of unique constraints:
- `books.series_id + book_number` must be unique
- `character_details.character_id + category + attribute` must be unique
- Genre and series/book relationships must be unique in junction tables

---

## Example: Complete Series Insert Script

Here's a minimal example that creates a new series with basic data:

```sql
BEGIN;

-- 1. Insert author (or use existing)
INSERT INTO authors (name, email)
VALUES ('Jane Author', 'jane@example.com')
RETURNING id; -- Let's say this returns 1

-- 2. Insert series
INSERT INTO series (author_id, title, description, status, start_year)
VALUES (1, 'The Mystic Chronicles', 'A fantasy romance series set in a world where magic is fading', 'ongoing', 2025)
RETURNING id; -- Returns series_id = 1

-- 3. Add genres to series
INSERT INTO series_genres (series_id, genre_id)
SELECT 1, id FROM genres WHERE genre_name IN ('fantasy', 'romance');

-- 4. Insert books
INSERT INTO books (series_id, title, book_number, status, target_word_count)
VALUES
    (1, 'The Last Mage', 1, 'planning', 80000),
    (1, 'The Rising Storm', 2, 'planning', 85000),
    (1, 'The Final Reckoning', 3, 'planning', 90000)
RETURNING id; -- Returns book_ids 1, 2, 3

-- 5. Insert main characters
INSERT INTO characters (series_id, name, character_type, status, first_appearance_book_id)
VALUES
    (1, 'Aria Shadowend', 'main', 'alive', 1),
    (1, 'Kael Stormborn', 'main', 'alive', 1)
RETURNING id; -- Returns character_ids 1, 2

-- 6. Add character details
INSERT INTO character_details (character_id, category, attribute, value)
VALUES
    (1, 'physical', 'age', '24'),
    (1, 'personality', 'core_trait', 'determined and resourceful'),
    (2, 'physical', 'age', '27'),
    (2, 'personality', 'core_trait', 'mysterious and powerful');

-- 7. Insert locations
INSERT INTO locations (series_id, name, location_type, description)
VALUES
    (1, 'Shadowhaven', 'city', 'The last city where magic still thrives'),
    (1, 'The Fade Wastes', 'region', 'Barren lands where magic has completely died');

-- 8. Insert organizations
INSERT INTO organizations (series_id, name, organization_type, description, influence_level)
VALUES
    (1, 'The Mage Council', 'government', 'Ruling body of magic users', 9),
    (1, 'The Order of the Fade', 'religious', 'Cult seeking to eliminate all magic', 7);

-- 9. Insert plot threads
INSERT INTO plot_threads (series_id, title, description, thread_type_id, importance_level, start_book, end_book, current_status_id)
VALUES
    (1, 'The Fading Magic Mystery', 'Why is magic disappearing from the world?',
     (SELECT id FROM plot_thread_types WHERE type_name = 'series_arc'), 10, 1, 3,
     (SELECT id FROM plot_thread_statuses WHERE status_name = 'planning')),
    (1, 'Aria and Kael Romance', 'Enemies to lovers arc between the protagonists',
     (SELECT id FROM plot_thread_types WHERE type_name = 'romance_arc'), 8, 1, 3,
     (SELECT id FROM plot_thread_statuses WHERE status_name = 'planning'));

COMMIT;
```

---

## Tips for LLM-Generated SQL

When an LLM generates SQL from a series premise document:

1. **Start with core tables first**: Authors → Series → Books
2. **Use RETURNING id** to capture primary keys for foreign key references
3. **Look up IDs for lookup tables** using SELECT subqueries
4. **Group related inserts** (e.g., all character details together)
5. **Use transactions** (BEGIN/COMMIT) to ensure atomicity
6. **Handle arrays and JSONB** with proper PostgreSQL syntax
7. **Validate unique constraints** before inserting
8. **Consider cascading effects** when planning deletions
9. **Use meaningful variable names** if using DO blocks with variables
10. **Add comments** to explain complex insertions

---

## Schema Version
This schema documentation is current as of migration `018_update_cascade_constraints.sql`.

Last updated: 2025-10-18
