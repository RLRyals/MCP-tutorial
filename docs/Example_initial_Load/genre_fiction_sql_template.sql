-- ============================================================================
-- GENRE FICTION SERIES DATA LOAD TEMPLATE
-- For Non-Technical Authors Using MCP Writing System
-- ============================================================================
--
-- This template helps you load your series infrastructure into your database
-- all at once, so you can start using the MCP Writing Team immediately.
--
-- BEFORE YOU START:
-- 1. Make sure you have your author_id (ask your database admin if unsure)
-- 2. Have your series premise/outline handy
-- 3. Copy this entire script into your PostgreSQL client (pgAdmin, DBeaver, etc.)
-- 4. Follow the CUSTOMIZE sections to fill in YOUR series data
-- 5. Run the entire script
-- 6. Capture the IDs that print at the end - you'll need them for writing work
--
-- ============================================================================
-- HOW TO CUSTOMIZE THIS TEMPLATE
-- ============================================================================
--
-- Look for sections marked: -- CUSTOMIZE: [instruction]
-- Replace the example values with your own data
--
-- MOST IMPORTANT: Don't delete any of the SQL logic - just replace the values
-- Example: Change 'Your Series Title' to your actual title
--          Don't delete the quotes or parentheses around it
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- Use a DO block to capture and reuse generated IDs throughout the script
-- ============================================================================

DO $$
DECLARE
    v_series_id INTEGER;
    v_book1_id INTEGER;
    v_book2_id INTEGER;
    v_book3_id INTEGER;
    -- Add more book variables if you have more than 3 books: v_book4_id, v_book5_id, etc.
    v_char1_id INTEGER;
    v_char2_id INTEGER;
    v_char3_id INTEGER;
    v_char4_id INTEGER;
    -- Add more character variables as needed
BEGIN

-- ============================================================================
-- STEP 1: CREATE YOUR SERIES AND CAPTURE ID
-- ============================================================================
-- This creates the top-level container for your entire series

-- CUSTOMIZE: Replace these values with YOUR series information
-- author_id: Use 1 unless your database admin gave you a different number
-- title: Your series name
-- description: A paragraph describing what your series is about
-- status: Use 'planning', 'ongoing', or 'completed'
-- start_year: What year did/will you start writing this series?

INSERT INTO series (author_id, title, description, target_audience, status, start_year)
VALUES (
    1,  -- CUSTOMIZE: Your author_id if different
    'Your Series Title Here',  -- CUSTOMIZE: Your series name
    'A brief description of your series. What is it about? What makes it unique? Who is the protagonist? What''s the central conflict or mystery?',  -- CUSTOMIZE: Series description (keep the quotes and apostrophes)
    'Your target audience description',  -- CUSTOMIZE: Who reads your books? (e.g., "Women 25-45 who love paranormal romance")
    'ongoing',  -- CUSTOMIZE: 'planning', 'ongoing', or 'completed'
    2025  -- CUSTOMIZE: Year you started or will start writing
)
RETURNING id INTO v_series_id;

RAISE NOTICE 'Created series with ID: %', v_series_id;

-- ============================================================================
-- STEP 2: ADD GENRES TO YOUR SERIES
-- ============================================================================
-- Genres help organize your series and are useful for marketing

-- PRE-LOADED GENRES AVAILABLE:
-- romance, fantasy, mystery, thriller, science_fiction, historical_fiction,
-- contemporary, young_adult, literary_fiction, action_adventure
--
-- NICHE GENRES NOT PRE-LOADED (examples):
-- paranormal_romance, urban_fantasy, cozy_mystery, paranormal_mystery,
-- epic_fantasy, dark_fantasy, paranormal, psychic, supernatural, witches,
-- vampires, shapeshifters, cryptids, etc.

-- CUSTOMIZE: Create niche genres if needed (or skip if using only pre-loaded genres)
INSERT INTO genres (genre_name, genre_description, is_active)
VALUES
('paranormal_romance', 'Romance featuring paranormal or supernatural elements', TRUE),  -- CUSTOMIZE: Add your niche genre if needed
('urban_fantasy', 'Fantasy set in modern urban settings with magical elements', TRUE)
ON CONFLICT (genre_name) DO NOTHING;

-- CUSTOMIZE: Assign genres to your series (both pre-loaded and niche)
INSERT INTO series_genres (series_id, genre_id)
SELECT v_series_id, id FROM genres
WHERE genre_name IN ('fantasy', 'romance', 'paranormal_romance', 'urban_fantasy')  -- CUSTOMIZE: List all genres for your series
ON CONFLICT (series_id, genre_id) DO NOTHING;

RAISE NOTICE 'Assigned genres to series';

-- ============================================================================
-- STEP 3: CREATE YOUR BOOKS AND CAPTURE IDs
-- ============================================================================
-- Each book is its own entry in the database

-- CUSTOMIZE: For each book in your series:
-- - book_number: Position in series (1, 2, 3, etc.)
-- - title: Book title
-- - description: What happens in this book
-- - target_word_count: How many words you plan to write (typically 70,000-120,000)
-- - status: 'planned' if you haven't started, 'in_progress' if writing now

INSERT INTO books (series_id, title, book_number, status, description, target_word_count)
VALUES
(v_series_id, 'Book One Title', 1, 'planned',  -- CUSTOMIZE: Your first book title
 'Describe what happens in Book 1. What is the main plot? What does your protagonist want?',  -- CUSTOMIZE: Book description
 85000)  -- CUSTOMIZE: Target word count
RETURNING id INTO v_book1_id;

INSERT INTO books (series_id, title, book_number, status, description, target_word_count)
VALUES
(v_series_id, 'Book Two Title', 2, 'planned',  -- CUSTOMIZE: Your second book title
 'Describe what happens in Book 2.',  -- CUSTOMIZE
 85000)
RETURNING id INTO v_book2_id;

INSERT INTO books (series_id, title, book_number, status, description, target_word_count)
VALUES
(v_series_id, 'Book Three Title', 3, 'planned',  -- CUSTOMIZE: Your third book title
 'Describe what happens in Book 3.',  -- CUSTOMIZE
 85000)
RETURNING id INTO v_book3_id;

-- ADD MORE BOOKS AS NEEDED: Copy the pattern above and add v_book4_id, v_book5_id variables

RAISE NOTICE 'Created books with IDs: %, %, %', v_book1_id, v_book2_id, v_book3_id;

-- ============================================================================
-- STEP 4: CREATE MAIN CHARACTERS AND CAPTURE IDs
-- ============================================================================
-- Add every character you have information about in your premise

-- CUSTOMIZE: For each main character:
-- - name: How they're commonly called
-- - full_name: Complete legal name (if different from name)
-- - character_type: 'main', 'supporting', 'minor', or 'antagonist'
-- - first_appearance_book_id: Which book do they first appear?

INSERT INTO characters (series_id, name, full_name, character_type, status, first_appearance_book_id)
VALUES (v_series_id, 'Protagonist Name', 'Protagonist Full Legal Name', 'main', 'alive', v_book1_id)  -- CUSTOMIZE
RETURNING id INTO v_char1_id;

INSERT INTO characters (series_id, name, full_name, character_type, status, first_appearance_book_id)
VALUES (v_series_id, 'Love Interest Name', 'Love Interest Full Name', 'main', 'alive', v_book1_id)  -- CUSTOMIZE
RETURNING id INTO v_char2_id;

INSERT INTO characters (series_id, name, full_name, character_type, status, first_appearance_book_id)
VALUES (v_series_id, 'Mentor Name', 'Mentor Full Name', 'supporting', 'alive', v_book1_id)  -- CUSTOMIZE
RETURNING id INTO v_char3_id;

INSERT INTO characters (series_id, name, full_name, character_type, status, first_appearance_book_id)
VALUES (v_series_id, 'Antagonist Name', 'Antagonist Full Name', 'antagonist', 'alive', v_book1_id)  -- CUSTOMIZE
RETURNING id INTO v_char4_id;

-- ADD MORE CHARACTERS AS NEEDED: Copy the pattern above and add more variables (v_char5_id, etc.)

RAISE NOTICE 'Created characters';

-- ============================================================================
-- STEP 5: ADD CHARACTER DETAILS (USING CAPTURED CHARACTER IDs)
-- ============================================================================
-- This is where you record what you know about each character

-- CUSTOMIZE: For each character, add the details from your premise
-- category: The type of detail (physical, personality, background, skills, profession)
-- attribute: Specific detail (age, hair color, temperament, backstory, role, etc.)
-- value: The actual information

-- Protagonist details
INSERT INTO character_details (character_id, category, attribute, value, confidence_level, source_book_id)
VALUES
(v_char1_id, 'personality', 'core_trait', 'Brave, determined, and deeply principled', 'established', v_book1_id),  -- CUSTOMIZE
(v_char1_id, 'background', 'defining_event', 'A traumatic event that shapes their entire life', 'established', v_book1_id),  -- CUSTOMIZE
(v_char1_id, 'skills', 'expertise', 'Description of their skills and abilities', 'established', v_book1_id);  -- CUSTOMIZE

-- Love Interest details
INSERT INTO character_details (character_id, category, attribute, value, confidence_level, source_book_id)
VALUES
(v_char2_id, 'personality', 'core_trait', 'Describe their personality', 'established', v_book1_id),  -- CUSTOMIZE
(v_char2_id, 'background', 'relationship', 'How they connect to protagonist', 'established', v_book1_id);  -- CUSTOMIZE

-- Mentor details
INSERT INTO character_details (character_id, category, attribute, value, confidence_level, source_book_id)
VALUES
(v_char3_id, 'personality', 'role', 'Mentor figure with...', 'established', v_book1_id),  -- CUSTOMIZE
(v_char3_id, 'skills', 'expertise', 'What they teach or help with', 'established', v_book1_id);  -- CUSTOMIZE

-- Antagonist details
INSERT INTO character_details (character_id, category, attribute, value, confidence_level, source_book_id)
VALUES
(v_char4_id, 'personality', 'motivation', 'Why they oppose the protagonist', 'established', v_book1_id),  -- CUSTOMIZE
(v_char4_id, 'background', 'conflict', 'Source of conflict with hero', 'established', v_book1_id);  -- CUSTOMIZE

-- ADD MORE CHARACTER DETAILS AS NEEDED

RAISE NOTICE 'Added character details';

-- ============================================================================
-- STEP 6: CREATE LOCATIONS (USING CAPTURED SERIES_ID)
-- ============================================================================

-- CUSTOMIZE: For each important location in your story:
-- - name: Location name
-- - location_type: 'city', 'town', 'building', 'forest', 'region', etc.
-- - description: What is this place like?
-- - climate: Weather or conditions
-- - atmosphere: The mood/feeling of the place

INSERT INTO locations (series_id, name, location_type, description, climate, atmosphere)
VALUES
(v_series_id, 'Primary City Name', 'city',  -- CUSTOMIZE: Main setting city name
 'Description of your main city. How does it look? What is it known for?',  -- CUSTOMIZE
 'temperate',  -- CUSTOMIZE: 'tropical', 'arctic', 'desert', 'temperate', 'varied', etc.
 'Mood and feeling of the city'),  -- CUSTOMIZE
(v_series_id, 'Important Building or Location', 'building',  -- CUSTOMIZE: Another key location
 'What happens here? Why is it important?',  -- CUSTOMIZE
 'controlled',
 'Mood of this place');  -- CUSTOMIZE

-- ADD MORE LOCATIONS AS NEEDED

RAISE NOTICE 'Created locations';

-- ============================================================================
-- STEP 7: CREATE ORGANIZATIONS (USING CAPTURED SERIES_ID)
-- ============================================================================

-- CUSTOMIZE: For organizations in your world:
-- - name: Organization name
-- - organization_type: 'government', 'guild', 'criminal', 'military', 'religious', 'business', etc.
-- - description: What does this organization do?
-- - influence_level: 1-10, where 10 is world-controlling power

INSERT INTO organizations (series_id, name, organization_type, description, influence_level, status)
VALUES
(v_series_id, 'Main Government/Ruling Body', 'government',  -- CUSTOMIZE: Name and type
 'Description of what this organization does and why it''s important to your story',  -- CUSTOMIZE
 8, 'active'),  -- CUSTOMIZE: Power level 1-10
(v_series_id, 'Opposition/Antagonistic Organization', 'criminal',  -- CUSTOMIZE
 'What does this group do? Why are they in conflict with your protagonist?',  -- CUSTOMIZE
 6, 'active');  -- CUSTOMIZE: Power level

-- ADD MORE ORGANIZATIONS AS NEEDED

RAISE NOTICE 'Created organizations';

-- ============================================================================
-- STEP 8: CREATE WORLD SYSTEMS (USING CAPTURED SERIES_ID & CHARACTER IDs)
-- ============================================================================

-- Fantasy with magic? Sci-fi with tech? Any special rules your world follows?
-- Define those systems here

-- Example: Magic System
INSERT INTO world_systems
(series_id, system_name, system_type, power_source, access_method, limitations, system_rules, system_users)
VALUES
(v_series_id, 'Your Magic System Name', 'magic',  -- CUSTOMIZE: Name and type
 'What is the source of power? (e.g., "channeled from ancient spirits")',  -- CUSTOMIZE
 'How do people access it? (e.g., "through innate ability and training")',  -- CUSTOMIZE
 ARRAY[
     'Limit 1: (e.g., "Causes physical exhaustion")',  -- CUSTOMIZE
     'Limit 2: (e.g., "Can only be used by those with innate talent")',  -- CUSTOMIZE
     'Limit 3: (e.g., "Iron negates magical effects")'  -- CUSTOMIZE
 ],
 ARRAY[
     'Rule 1: (e.g., "Power levels increase with practice")',  -- CUSTOMIZE
     'Rule 2: (e.g., "Cannot create something from nothing")',  -- CUSTOMIZE
     'Rule 3: (e.g., "Magic can be stored in objects")'  -- CUSTOMIZE
 ],
 ARRAY[v_char1_id]);  -- CUSTOMIZE: Which characters use this system?

-- ADD MORE WORLD SYSTEMS AS NEEDED

RAISE NOTICE 'Created world systems';

-- ============================================================================
-- STEP 9: CREATE MAIN PLOT THREADS (USING CAPTURED IDs)
-- ============================================================================

-- Main Series Arc (spans multiple books - the BIG story question)
INSERT INTO plot_threads (series_id, title, description, thread_type_id, importance_level, complexity_level, start_book, end_book, current_status_id, related_characters)
SELECT
v_series_id,
'Main Series Arc Title',  -- CUSTOMIZE: The overall question that drives the entire series
'Description of what drives the series. What is the big mystery or goal that spans all books?',  -- CUSTOMIZE
pt.id, 10, 9, 1, 3, ps.id,  -- CUSTOMIZE: end_book (3 if you have 3 books, 5 if you have 5 books, etc.)
ARRAY[v_char1_id, v_char2_id]  -- CUSTOMIZE: Which characters are central to this arc?
FROM plot_thread_types pt, plot_thread_statuses ps
WHERE pt.type_name = 'series_arc' AND ps.status_name = 'planning';

-- Book 1 Main Case/Conflict
INSERT INTO plot_threads (series_id, title, description, thread_type_id, importance_level, complexity_level, start_book, end_book, current_status_id, related_characters)
SELECT
v_series_id,
'Book 1 Main Case/Conflict',  -- CUSTOMIZE: The central problem of Book 1
'What is the main mystery or conflict of Book 1? What does the protagonist need to solve or overcome?',  -- CUSTOMIZE
pt.id, 10, 8, 1, 1, ps.id,
ARRAY[v_char1_id, v_char3_id]  -- CUSTOMIZE: Characters involved in Book 1 main plot
FROM plot_thread_types pt, plot_thread_statuses ps
WHERE pt.type_name = 'main_case' AND ps.status_name = 'planning';

-- Protagonist Character Arc (how your protagonist changes across the series)
INSERT INTO plot_threads (series_id, title, description, thread_type_id, importance_level, complexity_level, start_book, end_book, current_status_id, related_characters)
SELECT
v_series_id,
'Protagonist Character Arc',  -- CUSTOMIZE: How does your character grow/change?
'Describe how your protagonist changes from Book 1 to the end of the series. What do they learn? How do they grow?',  -- CUSTOMIZE
pt.id, 10, 9, 1, 3, ps.id,  -- CUSTOMIZE: end_book
ARRAY[v_char1_id]
FROM plot_thread_types pt, plot_thread_statuses ps
WHERE pt.type_name = 'character_arc' AND ps.status_name = 'planning';

-- Romance Arc (if applicable)
INSERT INTO plot_threads (series_id, title, description, thread_type_id, importance_level, complexity_level, start_book, end_book, current_status_id, related_characters)
SELECT
v_series_id,
'Romance Arc: Protagonist and Love Interest',  -- CUSTOMIZE: Character names
'How does the romantic relationship develop across the series? When do they meet? When do they acknowledge feelings? When do they get together?',  -- CUSTOMIZE
pt.id, 9, 8, 1, 3, ps.id,  -- CUSTOMIZE: end_book
ARRAY[v_char1_id, v_char2_id]
FROM plot_thread_types pt, plot_thread_statuses ps
WHERE pt.type_name = 'romance_arc' AND ps.status_name = 'planning';

-- ADD MORE PLOT THREADS AS NEEDED (subplots, other character arcs, world-building threads)

RAISE NOTICE 'Created plot threads';

END $$;

-- ============================================================================
-- COMMIT TRANSACTION
-- ============================================================================

COMMIT;

-- ============================================================================
-- RETRIEVE ALL IDs FOR ID CHEAT SHEET
-- ============================================================================

SELECT
  'YOUR SERIES - ID CHEAT SHEET' AS section,
  'Use these IDs in all future MCP calls' AS instruction;

SELECT 'Series ID: ' || id || ' (' || title || ')' AS series_info FROM series WHERE title = 'Your Series Title Here';  -- CUSTOMIZE: Your series title
SELECT 'Author ID: 1 (Your Author Name)' AS author;  -- CUSTOMIZE: Your author name

SELECT '--- BOOKS ---' AS section;
SELECT 'Book ' || book_number || ': ' || title || ' (ID: ' || id || ')' AS book_info
FROM books
WHERE series_id = (SELECT id FROM series WHERE title = 'Your Series Title Here')  -- CUSTOMIZE: Your series title
ORDER BY book_number;

SELECT '--- MAIN CHARACTERS ---' AS section;
SELECT name || ' (ID: ' || id || ')' AS character_info
FROM characters
WHERE series_id = (SELECT id FROM series WHERE title = 'Your Series Title Here')  -- CUSTOMIZE: Your series title
  AND character_type IN ('main', 'antagonist')
ORDER BY name;

SELECT '--- SUPPORTING CHARACTERS ---' AS section;
SELECT name || ' (ID: ' || id || ')' AS character_info
FROM characters
WHERE series_id = (SELECT id FROM series WHERE title = 'Your Series Title Here')  -- CUSTOMIZE: Your series title
  AND character_type = 'supporting'
ORDER BY name;

SELECT '--- LOCATIONS ---' AS section;
SELECT name || ' (ID: ' || id || ')' AS location_info
FROM locations
WHERE series_id = (SELECT id FROM series WHERE title = 'Your Series Title Here')  -- CUSTOMIZE: Your series title
ORDER BY name;

SELECT '--- ORGANIZATIONS ---' AS section;
SELECT name || ' (ID: ' || id || ')' AS org_info
FROM organizations
WHERE series_id = (SELECT id FROM series WHERE title = 'Your Series Title Here')  -- CUSTOMIZE: Your series title
ORDER BY name;

SELECT '--- WORLD SYSTEMS ---' AS section;
SELECT system_name || ' (ID: ' || id || ')' AS system_info
FROM world_systems
WHERE series_id = (SELECT id FROM series WHERE title = 'Your Series Title Here')  -- CUSTOMIZE: Your series title
ORDER BY system_name;

SELECT '--- PLOT THREADS ---' AS section;
SELECT title || ' (ID: ' || id || ')' AS thread_info
FROM plot_threads
WHERE series_id = (SELECT id FROM series WHERE title = 'Your Series Title Here')  -- CUSTOMIZE: Your series title
ORDER BY importance_level DESC, title;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
--
-- NEXT STEPS:
-- 1. Copy the ID output above and save it in a text file or markdown file
-- 2. Use these IDs when calling MCP tools in Claude Desktop
-- 3. Start planning your first book with your AI Writing Team
--
-- ============================================================================
