# Book & Writing Servers Guide
## Story Structure + Writing Production

---

## Part 1: Book Server - Story Structure

### Purpose
The Book Server manages the physical structure of your books: books → chapters → scenes. This is your **most frequently used server** during active writing.

---

## Book Management

### `create_book`
**When to use:** Starting a new book in the series

**Parameters:**
- `series_id` (required)
- `book_number` (required) - position in series
- `title` (required)
- `description` (optional)
- `target_word_count` (optional)
- `actual_word_count` (optional) - defaults to 0
- `status` (optional) - "planned", "in_progress", "draft", "editing", "final", "published"
- `genre_tags` (optional) - array specific to this book

**Returns:** book_id (ADD TO ID CHEAT SHEET)

---

### `list_books` / `get_book` / `update_book`
Standard operations for managing books in series.

**Important:** `update_book` for changing status or word counts.

---

## Chapter Management

### `create_chapter`
**When to use:** Setting up chapters for writing

**Parameters:**
- `book_id` (required)
- `chapter_number` (required)
- `title` (optional) - chapter title
- `subtitle` (optional)
- `summary` (optional) - brief chapter summary
- `target_word_count` (optional)
- `status` (optional) - "planned", "outlined", "drafted", "revised", "final"
- `pov_character_id` (optional) - whose POV
- `story_time_start` (optional) - "Day 1, 3pm"
- `story_duration` (optional) - "2 hours"
- `primary_location` (optional)
- `author_notes` (optional) - planning notes

**Returns:** chapter_id (ADD TO ID CHEAT SHEET)

**Example - Planning Chapter:**
```
create_chapter:
  book_id: 2
  chapter_number: 5
  title: "The Discovery"
  summary: "Morgan finds the silver dust evidence linking suspect to crime scene"
  target_word_count: 3500
  status: "planned"
  pov_character_id: 1
  story_time_start: "Day 3, morning"
  primary_location: "Duke's study"
  author_notes: "Need to foreshadow the betrayal, show Morgan's deductive process"
```

---

### `update_chapter`
**When to use:** After writing/editing chapter

**Parameters:**
- `chapter_id` (required)
- `status` (optional) - update as you progress
- `word_count` (optional) - actual count
- `writing_notes` (optional) - process notes
- Any other fields from create_chapter

**Example - After Writing:**
```
update_chapter:
  chapter_id: 42
  status: "drafted"
  word_count: 3742
  writing_notes: "Stronger than expected, may need to tone down suspicion reveal"
```

---

### `list_chapters` / `get_chapter`
Query chapters in a book. Use `get_chapter` before writing to review plan.

---

## Scene Management

### `create_scene`
**When to use:** Breaking chapters into detailed structure

**Parameters:**
- `chapter_id` (required)
- `scene_number` (required) - position in chapter
- `scene_title` (optional)
- `summary` (optional) - what happens
- `location` (optional)
- `time_of_day` (optional)
- `duration` (optional) - "5 minutes"
- `pov_character_id` (optional)
- `scene_participants` (optional) - array of character IDs
- `scene_purpose` (optional) - "action", "dialogue", "description", "transition", "exposition", "conflict", "resolution"
- `scene_type` (optional) - "dramatic", "comedic", "action", "romance", "mystery", "horror", "slice_of_life"
- `intensity_level` (optional) - 1-10 for pacing
- `target_word_count` (optional)
- `writing_status` (optional) - "planned", "outlined", "drafted", "revised", "final"

**Example - Planning Dramatic Scene:**
```
create_scene:
  chapter_id: 42
  scene_number: 3
  scene_title: "The Confrontation"
  summary: "Morgan confronts suspect with silver dust evidence, suspect breaks down"
  location: "Police interrogation room"
  time_of_day: "late afternoon"
  duration: "20 minutes"
  pov_character_id: 1
  scene_participants: [1, 8]
  scene_purpose: "conflict"
  scene_type: "dramatic"
  intensity_level: 9
  target_word_count: 1200
  writing_status: "planned"
```

---

### `update_scene` / `get_scene` / `list_scenes`
Manage scenes within chapters. Update word_count and writing_status as you write.

---

### `reorder_scenes`
**When to use:** Restructuring chapter scene order

**Parameters:**
- `chapter_id` (required)
- `scene_order` (required) - array of {scene_id, new_scene_number}

---

## Typical Book Server Workflow

### Planning Phase
```
1. create_book → capture book_id
2. create_chapter for each planned chapter
3. (Optional) create_scene for detailed planning
4. Update ID Cheat Sheet with all IDs
```

### Writing Phase
```
1. get_chapter to review plan
2. Write scenes (or update existing scenes)
3. update_scene with word counts as you go
4. update_chapter when chapter complete
5. Book word count auto-aggregates
```

### Revision Phase
```
1. list_chapters with status filter
2. update_chapter status to "revised" or "final"
3. update_book actual_word_count if needed
```

---

## Part 2: Writing Server - Production & Quality

### Purpose
Tracks writing sessions, validates structure, exports manuscripts. Monitors productivity WITHOUT pressure.

**Philosophy:** Flexible guidelines, not rigid enforcement.

---

## Session Tracking

### `log_writing_session`
**When to use:** After each writing session

**Parameters:**
- `book_id` (required)
- `session_date` (required) - YYYY-MM-DD
- `words_written` (required)
- `chapter_ids` (optional) - array of chapters worked on
- `start_time` (optional) - HH:MM
- `end_time` (optional) - HH:MM
- `words_edited` (optional) - existing words revised
- `session_notes` (optional)
- `mood_rating` (optional) - 1-10

**Auto-updates:** Book word count increases automatically

**Example:**
```
log_writing_session:
  book_id: 2
  session_date: "2025-01-15"
  words_written: 1842
  chapter_ids: [42, 43]
  start_time: "09:00"
  end_time: "11:30"
  mood_rating: 8
  session_notes: "Great flow today, mystery revelation scene worked perfectly"
```

---

### `get_writing_progress`
**When to use:** Checking productivity metrics

**Parameters:**
- `book_id` (required)
- `time_period` (optional) - "week", "month", "quarter", "all_time"
- `include_analytics` (optional) - boolean

**Returns:**
- Total sessions
- Words written/edited
- Average words per session
- Average mood
- Daily patterns (if analytics=true)

---

### `set_writing_goals` / `get_productivity_analytics`
Set targets for tracking, analyze patterns. Supportive metrics, not pressure.

---

## Validation Tools (Flexible)

### `validate_chapter_structure`
**When to use:** Checking chapter consistency

**Parameters:**
- `book_id` (required)
- `chapter_ids` (optional) - specific chapters
- `validation_level` (optional) - "basic", "detailed", "comprehensive"

**Checks:**
- Missing titles (warning, not error)
- Word count variance (info, not requirement)
- POV tracking (info)
- Scene structure (guidance)

**Returns issues with severity:** "info", "warning", "error"

**Philosophy:** Flags for review, doesn't enforce rigid rules.

---

### `validate_beat_placement`
**When to use:** Analyzing story pacing

**Parameters:**
- `book_id` (required)
- `beat_analysis_type` (optional) - "pacing", "character_arcs", "plot_threads", "emotional_beats"
- `flexible_guidelines` (optional) - boolean (default: true)

**Analysis Types:**
- **pacing**: Chapter length distribution
- **character_arcs**: POV distribution
- **plot_threads**: Plot point frequency
- **emotional_beats**: Emotional progression

**Philosophy:** Organic structure analysis, not forced templates.

---

### `check_structure_violations`
**When to use:** Finding consistency issues

**Parameters:**
- `book_id` (required)
- `violation_types` (optional) - array of check types
- `severity_threshold` (optional) - minimum severity to report

**Violation Types:**
- "character_continuity" - gaps, inconsistencies
- "timeline_consistency" - chronological logic
- "pov_consistency" - POV switches
- "location_consistency" - setting references
- "plot_holes" - plot logic issues

**Returns:** Violations found with suggestions for fixes.

---

## Export Tools

### `export_manuscript`
**When to use:** Preparing manuscript

**Parameters:**
- `book_id` (required)
- `export_format` (optional) - "txt", "md", "rtf", "standard_manuscript"
- `include_metadata` (optional) - boolean
- `chapters_to_include` (optional) - array of chapter IDs
- `export_purpose` (optional) - "submission", "beta_review", "backup", "publication"

**Export Formats:**
- **txt**: Plain text with chapter breaks
- **md**: Markdown with YAML front matter
- **rtf**: Rich Text Format
- **standard_manuscript**: Industry submission format

**Returns:** Complete manuscript content + statistics

---

### `word_count_tracking`
**When to use:** Analyzing word counts

**Parameters:**
- `book_id` (required)
- `tracking_level` (optional) - "book", "chapter", "scene", "detailed"
- `include_history` (optional) - boolean
- `calculate_targets` (optional) - boolean

**Returns:** Word counts at selected level, progress against targets

---

## Integration Examples

### Complete Writing Day Workflow

**Morning - Plan:**
```
1. get_chapter (chapter_id: 42) - review plan
2. get_characters_in_chapter (chapter_id: 42) - see who appears
3. check_character_knowledge (character_id: 1) - verify what Morgan knows
4. get_plot_threads (series_id: 1) - check active threads
5. get_locations (location_id: 15) - confirm setting details
```

**During Writing:**
```
1. Write scene 3 of chapter 42
2. update_scene (scene_id: 128, word_count: 1200, writing_status: "drafted")
3. Character learns something new:
   - add_character_knowledge_with_chapter (character_id: 1, knowledge_item: "suspect's alibi is false")
4. Information revealed:
   - create_information_reveal (reveal_type: "evidence", information_content: "alibi breakdown")
5. Location used:
   - track_location_usage (location_id: 15, chapter_id: 42)
```

**After Writing:**
```
1. update_chapter (chapter_id: 42, status: "drafted", word_count: 3742)
2. log_writing_session (book_id: 2, words_written: 1842)
3. track_character_presence (character_id: 1, chapter_id: 42, presence details)
4. update_plot_thread (thread_id: 5) - mark progress
5. Book word count auto-updates from session
```

---

### Integration: Book → Character → Plot

**Character appears in scene:**
```
Book Server: scene has scene_participants: [1, 8]
    ↓
Character Server: track_character_presence for each
    ↓
Character Server: check_character_knowledge before dialogue
    ↓
Plot Server: create_information_reveal if info disclosed
    ↓
Character Server: add_character_knowledge for affected characters
```

---

### Integration: Writing → Validation → Export

**Production pipeline:**
```
Book Server: chapters structured, word counts tracked
    ↓
Writing Server: sessions logged, progress monitored
    ↓
Character Server: presence and knowledge tracked
    ↓
Writing Server: validate_chapter_structure (consistency check)
    ↓
Writing Server: check_structure_violations (find issues)
    ↓
Fix issues found
    ↓
Writing Server: export_manuscript (final preparation)
```

---

## Common Patterns

### Pantser (Discovery Writer)
```
1. create_chapter with minimal planning (just chapter number, maybe title)
2. Write scenes organically
3. create_scene AS you write to track structure
4. track_character_presence AFTER chapter complete
5. add_character_knowledge as things are revealed
6. Update chapter summary after writing
7. validate_chapter_structure to catch issues
```

### Plotter (Outline Writer)
```
1. create_chapter with full planning (summary, notes, target word count)
2. create_scene for each planned scene
3. check_character_knowledge BEFORE writing
4. Write to plan
5. update_scene with actual word counts
6. track_character_presence matches plan
7. validate_chapter_structure confirms plan execution
```

### Hybrid
```
1. create_chapter with moderate planning (summary, rough structure)
2. create_scene for major beats only
3. check_character_knowledge before key scenes
4. Write with flexibility
5. Add scenes as needed during writing
6. Track presence and knowledge as you go
7. validate_chapter_structure for both plan and execution
```

---

## Word Count Flow

**Understanding auto-aggregation:**
```
Scene word_count (update_scene)
    ↓ aggregates to
Chapter word_count (auto-calculated from scenes OR set directly)
    ↓ aggregates to
Book actual_word_count (auto-calculated from chapters)
    ↑ ALSO increased by
Writing session words_written (log_writing_session)
```

**Best Practice:** Update scene/chapter word counts as you write. Session logging adds to book total.

---

## Validation Philosophy

### What Validation IS:
- Consistency checking
- Pattern identification
- Issue flagging
- Helpful suggestions
- Flexible guidelines

### What Validation IS NOT:
- Rigid rule enforcement
- Genre template requirements
- Judgmental criticism
- Mandatory structure
- Creative limitation

**Goal:** Help you maintain consistency with YOUR story's internal logic, not impose external standards.

---

## Export Best Practices

### Before Export:
1. `word_count_tracking` - verify totals
2. `validate_chapter_structure` - check consistency
3. `check_structure_violations` - find issues
4. Fix critical issues
5. `update_book` status to "final"

### Export for Different Purposes:
- **Submission:** standard_manuscript format, no metadata
- **Beta readers:** md or txt with metadata, include chapter summaries
- **Backup:** txt with full metadata
- **Publication:** rtf or standard_manuscript, clean format

---

## Troubleshooting

### "Word counts don't match"
1. `word_count_tracking` with tracking_level: "detailed"
2. Check scene vs chapter vs book totals
3. Verify session logs not double-counted
4. Update chapter word_count directly if needed

### "Chapter structure validation fails"
1. Review specific issues returned
2. Remember: "info" = suggestion, not error
3. Fix "error" severity issues
4. Consider "warning" severity issues
5. Ignore "info" if intentional

### "Export missing chapters"
1. Verify chapters_to_include parameter
2. Check chapter status (may be filtering)
3. Ensure all chapters have content
4. Review chapter_id list in ID Cheat Sheet

---

## Remember

**Book Server** = Structure foundation (most used during writing)  
**Writing Server** = Production tracking + Quality checking (supportive, not restrictive)

Together they provide:
- Organized story structure
- Progress monitoring
- Quality validation
- Manuscript preparation

All designed to support your creative process, not constrain it.