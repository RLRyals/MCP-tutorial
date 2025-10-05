# Chapters vs Chapter_scenes: Understanding Content Storage & the Database Design

## Quick Summary for Authors

**Why don't chapters have a content field?**

Because chapters are *containers*, not content. The actual prose lives in **chapter_scenes**, which are the building blocks of your manuscript.

**Think of it like this:**
- **Chapter** = The chapter heading and metadata (like a folder)
- **Chapter_scenes** = The actual scenes with prose (like documents in that folder)

This design gives you:
✅ Better organization for long chapters
✅ Easier editing and revision tracking
✅ Granular pacing and intensity control
✅ Flexible scene reordering
✅ Detailed analytics on your writing

---

## Table Comparison

| Feature | **chapters** | **chapter_scenes** |
|---------|-------------|-------------------|
| **Purpose** | Chapter-level organization & metadata | The actual scenes with prose |
| **Contains** | Summary, notes, targets | scene_content, scene_outline, scene_revisions |
| **Level** | High-level structure | Granular writing units |
| **Relationship** | 1 chapter → many scenes | Many scenes → 1 chapter |
| **Word Count** | Aggregate from all scenes | Individual scene word count |
| **Editable Prose** | ❌ No content field | ✅ Yes - scene_content field |

---

## The Database Structure

```
books
  ├── chapters (Container/Metadata)
  │     ├── id, title, chapter_number
  │     ├── summary (BRIEF overview)
  │     ├── word_count (TOTAL of all scenes)
  │     ├── target_word_count (GOAL for chapter)
  │     ├── status (planned/outlined/drafted/revised/final)
  │     ├── pov_character_id (PRIMARY POV for chapter)
  │     ├── primary_location (MAIN setting)
  │     ├── author_notes (PLANNING notes)
  │     └── writing_notes (PROCESS notes)
  │
  └── chapter_scenes (Content/Prose)
        ├── id, chapter_id, scene_number
        ├── scene_content ✅ THE ACTUAL PROSE
        ├── scene_outline ✅ BEAT SHEET & PLANNING
        ├── scene_revisions ✅ VERSION HISTORY
        ├── summary (what happens in THIS scene)
        ├── word_count (THIS scene only)
        ├── target_word_count (goal for THIS scene)
        ├── pov_character_id (POV for THIS scene)
        ├── location (where THIS scene happens)
        ├── intensity_level (pacing for THIS scene)
        ├── scene_elements (tags: action, romance, etc.)
        └── notes (reminders for THIS scene)
```

---

## Field-by-Field Comparison

### Content Fields - Where the Writing Lives

| Field | **chapters** | **chapter_scenes** |
|-------|-------------|-------------------|
| **content** | ❌ NO FIELD | ✅ **scene_content** - The actual manuscript prose |
| **outline** | ❌ NO FIELD | ✅ **scene_outline** - Beat sheet for this scene |
| **revisions** | ❌ NO FIELD | ✅ **scene_revisions** - Array of previous versions |
| **summary** | ✅ Brief chapter overview | ✅ What happens in this specific scene |
| **notes** | ✅ Planning & process notes | ✅ Scene-specific reminders |
| **author_notes** | ✅ Chapter planning | ❌ Not applicable |
| **writing_notes** | ✅ Chapter process notes | ❌ Not applicable |

**Key Point:** All editable prose is in `chapter_scenes.scene_content`, not in chapters.

### Identification & Structure

| Field | **chapters** | **chapter_scenes** |
|-------|-------------|-------------------|
| **id** | Unique chapter ID | Unique scene ID |
| **book_id** | ✅ Which book | ❌ Not needed (via chapter) |
| **chapter_id** | ❌ Not applicable | ✅ Which chapter (FK) |
| **chapter_number** | ✅ Position in book (1, 2, 3...) | ❌ Not applicable |
| **scene_number** | ❌ Not applicable | ✅ Position in chapter (1, 2, 3...) |
| **title** | ✅ Chapter title | Optional scene title |

### Word Count & Progress Tracking

| Field | **chapters** | **chapter_scenes** |
|-------|-------------|-------------------|
| **word_count** | ✅ TOTAL (sum of all scenes) | ✅ THIS scene only |
| **target_word_count** | ✅ Goal for entire chapter | ✅ Goal for this scene |
| **status** | ✅ planned/drafted/revised/final | ✅ Same for this scene |
| **writing_status** | ❌ Use 'status' instead | ✅ Scene writing progress |
| **page_count** | ✅ Published page count | ❌ Not applicable |
| **draft_number** | ✅ Which draft of chapter | ❌ Not applicable |

### Narrative & POV

| Field | **chapters** | **chapter_scenes** |
|-------|-------------|-------------------|
| **pov_character_id** | ✅ PRIMARY POV for chapter | ✅ POV for THIS scene |
| **scene_participants** | ❌ Not applicable | ✅ Character IDs in scene |
| **narrative_style** | ✅ first_person/third_limited | ❌ Inherited from chapter |
| **tense** | ✅ present/past/mixed | ❌ Inherited from chapter |

### Location & Setting

| Field | **chapters** | **chapter_scenes** |
|-------|-------------|-------------------|
| **primary_location** | ✅ MAIN setting for chapter | ❌ Not applicable |
| **secondary_locations** | ✅ Array of other locations | ❌ Not applicable |
| **location** | ❌ Not applicable | ✅ Where THIS scene happens |

### Timing

| Field | **chapters** | **chapter_scenes** |
|-------|-------------|-------------------|
| **story_time_start** | ✅ When chapter begins | ❌ Not applicable |
| **story_time_end** | ✅ When chapter ends | ❌ Not applicable |
| **story_duration** | ✅ Total chapter time span | ✅ How long THIS scene lasts |
| **time_of_day** | ❌ Not applicable | ✅ When THIS scene occurs |

### Scene-Specific Features

| Field | **chapters** | **chapter_scenes** |
|-------|-------------|-------------------|
| **intensity_level** | ❌ Not applicable | ✅ Pacing intensity (1-10) |
| **scene_elements** | ❌ Not applicable | ✅ Tags/categories for scene |
| **scene_purpose** | ❌ Not applicable | ✅ action/dialogue/description |
| **scene_type** | ❌ Not applicable | ✅ dramatic/comedic/action |

### Chapter-Level Planning

| Field | **chapters** | **chapter_scenes** |
|-------|-------------|-------------------|
| **chapter_purpose** | ✅ Array: setup, climax, etc. | ❌ Not applicable |
| **dramatic_function** | ✅ Story arc position | ❌ Not applicable |
| **part_number** | ✅ For books with parts | ❌ Not applicable |
| **section_name** | ✅ "Part I: The Beginning" | ❌ Not applicable |
| **revision_notes** | ✅ What needs changing | ❌ Not applicable |

---

## How Content Flows: A Visual Guide

### Writing a Chapter

```
┌─────────────────────────────────────────────────┐
│  Chapter 5: "The Investigation"                 │
│  (chapters table)                               │
│                                                 │
│  title: "The Investigation"                    │
│  summary: "Detective Sarah discovers the       │
│            pattern in the murders"             │
│  target_word_count: 4500                       │
│  word_count: 4234 ← CALCULATED from scenes     │
│  status: "drafted"                             │
│  pov_character_id: 23 (Sarah)                  │
│  primary_location: "Police Station"            │
│  author_notes: "Build tension, reveal clues"   │
│  ❌ NO PROSE STORED HERE                       │
└─────────────────────────────────────────────────┘
                    │
                    │ chapter_id = 5
                    │
      ┌─────────────┼─────────────┬─────────────┐
      │             │             │             │
      ▼             ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Scene 1  │  │ Scene 2  │  │ Scene 3  │  │ Scene 4  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
(chapter_scenes table)

┌─────────────────────────────────────────────────┐
│  Scene 1: "Evidence Review"                    │
│  (chapter_scenes.id = 101)                     │
│                                                 │
│  chapter_id: 5                                 │
│  scene_number: 1                               │
│  scene_title: "Evidence Review"                │
│                                                 │
│  ✅ scene_content:                             │
│     "Sarah spread the crime scene photos       │
│      across her desk. Three victims, three     │
│      different cities, but the pattern was     │
│      unmistakable. Each wound precise,         │
│      surgical. The killer had training..."     │
│                                                 │
│  ✅ scene_outline:                             │
│     "1. Sarah reviews photos                   │
│      2. Notices surgical precision             │
│      3. Realizes killer has medical training   │
│      4. Calls hospital records"                │
│                                                 │
│  word_count: 1247                              │
│  target_word_count: 1200                       │
│  intensity_level: 6                            │
│  location: "Sarah's office"                    │
│  time_of_day: "Late evening"                   │
│  scene_elements: ["investigation",             │
│                   "clue_discovery"]            │
│  writing_status: "final"                       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Scene 2: "The Hospital Visit"                 │
│  (chapter_scenes.id = 102)                     │
│                                                 │
│  chapter_id: 5                                 │
│  scene_number: 2                               │
│                                                 │
│  ✅ scene_content:                             │
│     "The hospital administrator's office       │
│      was sterile and cold. 'I need records     │
│      of all surgical staff who've left in      │
│      the past year,' Sarah said, sliding       │
│      her badge across the desk..."            │
│                                                 │
│  word_count: 1523                              │
│  intensity_level: 7                            │
│  scene_participants: [23, 67] (Sarah, Admin)  │
│  writing_status: "drafted"                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Scene 3: "The Breakthrough"                   │
│  (chapter_scenes.id = 103)                     │
│                                                 │
│  ✅ scene_content:                             │
│     "The name jumped off the page.             │
│      Dr. Marcus Webb. Dismissed three          │
│      months ago for unauthorized procedures.   │
│      Sarah's hands trembled as she             │
│      reached for her phone..."                 │
│                                                 │
│  word_count: 892                               │
│  intensity_level: 9                            │
│  writing_status: "revised"                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Scene 4: "Setting the Trap"                   │
│  (chapter_scenes.id = 104)                     │
│                                                 │
│  ✅ scene_outline:                             │
│     "1. Sarah briefs her team                  │
│      2. Sets up surveillance                   │
│      3. Waits for Marcus to make a move"       │
│                                                 │
│  ✅ scene_content: "" ← NOT WRITTEN YET        │
│  word_count: 0                                 │
│  target_word_count: 1500                       │
│  writing_status: "outlined"                    │
└─────────────────────────────────────────────────┘

CHAPTER WORD COUNT: 1247 + 1523 + 892 + 0 = 3662
(Auto-calculated from scenes)
```

---

## Why This Design? Benefits for Authors

### 1. Granular Organization

**Without scenes (just chapter.content):**
```
❌ Chapter 5 content:
"Sarah spread the photos... [4500 words of text]...
she reached for her phone."

Problem: One giant blob of text
- Hard to edit specific parts
- Can't track pacing
- Can't reorder sections
- No version control per section
```

**With scenes:**
```
✅ Chapter 5:
   Scene 1: Evidence Review (1247 words) ✓ final
   Scene 2: Hospital Visit (1523 words) ✓ drafted
   Scene 3: Breakthrough (892 words) ✓ revised
   Scene 4: Setting Trap (0 words) 📝 outlined

Benefits:
- Edit individual scenes
- Track progress per scene
- Reorder scenes easily
- Version control each scene separately
- Analyze pacing scene-by-scene
```

### 2. Flexible Editing & Revision

**Scene-based revision workflow:**
```javascript
// Update just one scene
update_scene:
  scene_id: 102
  scene_content: "[revised prose]"
  scene_revisions: ["[previous version 1]", "[previous version 2]"]

// Now you have:
// - Current version in scene_content
// - Previous versions in scene_revisions array
// - Other scenes untouched
```

**Chapter-level tracking still works:**
```javascript
// Get chapter overview
get_chapter:
  chapter_id: 5
  include_scenes: true

// Returns:
// Chapter 5: "The Investigation"
//   - 3 of 4 scenes written
//   - 3662 / 4500 words (81% complete)
//   - Status: drafted
//   - Scenes: [list with progress]
```

### 3. Pacing & Intensity Analysis

**Chapter_scenes enable pacing analysis:**
```javascript
analyze_scene_flow:
  chapter_id: 5
  analysis_type: "intensity_flow"

// Returns intensity arc:
Scene 1: 6/10 - Building tension
Scene 2: 7/10 - Rising action
Scene 3: 9/10 - Climax moment
Scene 4: [not written]

Observation: Good escalation pattern
Suggestion: Scene 4 should drop to 5-6/10 for breathing room
```

**Can't do this with chapter.content field:**
```
❌ Chapter-level only:
   intensity_level: ???
   (What number represents a chapter with varying intensity?)
```

### 4. Better Progress Tracking

**Scene-level progress:**
```
Chapter 5: "The Investigation"
├── ✅ Scene 1: Final (1247 words)
├── 📝 Scene 2: Drafted (1523 words) ← Needs revision
├── ✅ Scene 3: Revised (892 words)
└── 📋 Scene 4: Outlined (0 words) ← Write this next

Progress: 3/4 scenes written (75%)
Word count: 3662/4500 (81%)
```

**Chapter-level only:**
```
❌ Chapter 5: Drafted (3662 words)

(Can't tell which parts are done, which need work)
```

### 5. Reordering Flexibility

**Easy scene reordering:**
```javascript
reorder_scenes:
  chapter_id: 5
  scene_order: [
    { scene_id: 101, new_scene_number: 1 },
    { scene_id: 103, new_scene_number: 2 },  // ← Moved up!
    { scene_id: 102, new_scene_number: 3 },  // ← Moved down
    { scene_id: 104, new_scene_number: 4 }
  ]

// Scenes reordered instantly
// Content stays intact
```

**With chapter.content:**
```
❌ Would need to:
   1. Parse the text manually
   2. Cut and paste sections
   3. Hope you didn't break formatting
   4. No automatic tracking of changes
```

### 6. Cross-Chapter Analysis

**Find all scenes by element:**
```javascript
// Find all investigation scenes across entire book
list_scenes:
  book_id: 2
  scene_elements: ["investigation", "clue_discovery"]

// Returns all investigation scenes from all chapters
// With their context, intensity, word counts
```

**Can't do this with chapter content:**
```
❌ Would need to search raw text
   No structured data
   No automatic categorization
```

---

## Common Tools & Workflows

### Book Server Tools for Chapters & Scenes

#### Chapter Tools

**create_chapter** - Create chapter container
```javascript
create_chapter:
  book_id: 2
  chapter_number: 5
  title: "The Investigation"
  summary: "Sarah discovers the pattern in murders"
  target_word_count: 4500
  status: "planned"
  pov_character_id: 23
  primary_location: "Police Station"
  author_notes: "Build tension, reveal clues slowly"

// Creates chapter metadata container
// NO PROSE yet - that goes in scenes
```

**update_chapter** - Update chapter metadata
```javascript
update_chapter:
  chapter_id: 5
  status: "drafted"
  word_count: 3662  // Usually auto-calculated from scenes
  summary: "Sarah discovers surgical precision in murders"

// Updates chapter-level info
// Doesn't touch scene content
```

**get_chapter** - Get chapter with all info
```javascript
get_chapter:
  chapter_id: 5
  include_scenes: true
  include_characters: true

// Returns:
// - Chapter metadata
// - List of all scenes with progress
// - Character presence information
// - Aggregate statistics
```

**list_chapters** - See all chapters in book
```javascript
list_chapters:
  book_id: 2
  include_stats: true

// Returns chapter list with:
// - Progress (X of Y scenes written)
// - Word counts
// - Status for each
```

---

#### Scene Tools (Where the Writing Happens)

**create_scene** - Create a scene with prose
```javascript
create_scene:
  chapter_id: 5
  scene_number: 1
  scene_title: "Evidence Review"
  scene_outline: "1. Sarah reviews photos
                  2. Notices surgical precision
                  3. Realizes medical training
                  4. Calls hospital"
  scene_content: "Sarah spread the crime scene photos
                  across her desk. Three victims..."
  target_word_count: 1200
  intensity_level: 6
  scene_elements: ["investigation", "clue_discovery"]
  location: "Sarah's office"
  time_of_day: "Late evening"
  writing_status: "drafted"

// Creates scene with:
// ✅ scene_content - the actual prose
// ✅ scene_outline - the beat sheet
// ✅ All metadata for this scene
```

**update_scene** - Edit scene prose or metadata
```javascript
update_scene:
  scene_id: 101
  scene_content: "[revised prose with better pacing]"
  scene_revisions: ["[original version]"]  // Save old version
  word_count: 1347  // Updated
  writing_status: "revised"
  intensity_level: 7  // Increased tension

// Updates:
// ✅ The prose (scene_content)
// ✅ Saves old version (scene_revisions)
// ✅ Updates metadata
```

**get_scene** - Retrieve scene with all details
```javascript
get_scene:
  scene_id: 101
  include_characters: true

// Returns:
// - scene_content (the prose)
// - scene_outline (beat sheet)
// - scene_revisions (version history)
// - All metadata
// - Character participants
```

**list_scenes** - See all scenes in chapter
```javascript
list_scenes:
  chapter_id: 5
  include_stats: true

// Returns:
// - All scenes in order
// - Word counts
// - Writing status
// - Intensity levels
// - Progress summary
```

**analyze_scene_flow** - Analyze pacing
```javascript
analyze_scene_flow:
  chapter_id: 5
  analysis_type: "intensity_flow"
  include_suggestions: true

// Analyzes:
// - Intensity progression
// - Pacing patterns
// - Balance of scene types
// - Suggests improvements
```

**reorder_scenes** - Reorganize chapter structure
```javascript
reorder_scenes:
  chapter_id: 5
  scene_order: [
    { scene_id: 101, new_scene_number: 1 },
    { scene_id: 103, new_scene_number: 2 },
    { scene_id: 102, new_scene_number: 3 }
  ]

// Reorders scenes without touching content
```

---

## Workflow Examples

### Example 1: Plan-First Author

**Step 1: Create chapter structure**
```javascript
create_chapter:
  book_id: 2
  chapter_number: 5
  title: "The Investigation"
  target_word_count: 4500
  summary: "Sarah discovers the pattern"
  author_notes: "Build tension, 4 major scenes"

// Chapter container created (id: 5)
```

**Step 2: Outline all scenes**
```javascript
create_scene:
  chapter_id: 5
  scene_number: 1
  scene_title: "Evidence Review"
  scene_outline: "1. Sarah reviews photos..."
  writing_status: "outlined"

create_scene:
  chapter_id: 5
  scene_number: 2
  scene_title: "Hospital Visit"
  scene_outline: "1. Sarah interviews admin..."
  writing_status: "outlined"

// Scenes 1-4 outlined, no prose yet
```

**Step 3: Write scenes one by one**
```javascript
update_scene:
  scene_id: 101
  scene_content: "Sarah spread the crime scene photos..."
  word_count: 1247
  writing_status: "drafted"

update_scene:
  scene_id: 102
  scene_content: "The hospital administrator's office..."
  word_count: 1523
  writing_status: "drafted"

// Scenes filled in with prose
// Chapter word_count auto-updates
```

**Step 4: Review chapter progress**
```javascript
get_chapter:
  chapter_id: 5
  include_scenes: true

// Shows:
// - 3 of 4 scenes written
// - 3662 / 4500 words (81%)
// - Ready to finish Scene 4
```

---

### Example 2: Discovery Writer

**Step 1: Create minimal chapter**
```javascript
create_chapter:
  book_id: 2
  chapter_number: 5
  title: "Investigation"
  status: "drafting"

// Minimal setup, dive into writing
```

**Step 2: Write scenes as you go**
```javascript
create_scene:
  chapter_id: 5
  scene_number: 1
  scene_content: "Sarah spread the photos across her desk..."
  scene_elements: ["investigation"]
  intensity_level: 6
  writing_status: "drafted"

// Write first scene, figure out rest later
```

**Step 3: Add scenes as inspiration strikes**
```javascript
create_scene:
  chapter_id: 5
  scene_number: 2
  scene_content: "The hospital visit revealed more than..."
  intensity_level: 7

create_scene:
  chapter_id: 5
  scene_number: 3
  scene_content: "Marcus Webb. The name made Sarah's heart race..."
  intensity_level: 9

// Scenes created organically
```

**Step 4: Analyze and refine**
```javascript
analyze_scene_flow:
  chapter_id: 5
  analysis_type: "intensity_flow"

// Discovers: Good intensity progression (6→7→9)
// Suggestion: Add a lower-intensity scene 4 for pacing

create_scene:
  chapter_id: 5
  scene_number: 4
  scene_content: "Sarah briefed her team calmly..."
  intensity_level: 5  // Breathing room after climax
```

---

### Example 3: Revision Workflow

**Step 1: Review chapter**
```javascript
get_chapter:
  chapter_id: 5
  include_scenes: true

// See which scenes need work:
// Scene 1: final ✓
// Scene 2: drafted (needs revision)
// Scene 3: revised ✓
// Scene 4: outlined (needs writing)
```

**Step 2: Revise specific scene**
```javascript
get_scene:
  scene_id: 102

// Read current scene_content
// Note what needs changing

update_scene:
  scene_id: 102
  scene_content: "[improved prose with better dialogue]"
  scene_revisions: ["[original draft]"]  // Save old version
  word_count: 1685  // Updated after revision
  writing_status: "revised"
  notes: "Improved dialogue, added admin character depth"

// Only Scene 2 changed
// Other scenes untouched
```

**Step 3: Complete missing content**
```javascript
update_scene:
  scene_id: 104
  scene_content: "Sarah briefed her team with military precision..."
  word_count: 1456
  writing_status: "drafted"

// Now all 4 scenes written
```

**Step 4: Final chapter review**
```javascript
analyze_scene_flow:
  chapter_id: 5
  analysis_type: "scene_balance"

// Check overall flow
// Verify pacing
// Update chapter status

update_chapter:
  chapter_id: 5
  status: "final"
  word_count: 4590  // Auto-calculated from scenes
```

---

### Example 4: Restructuring a Chapter

**Problem:** Scene order doesn't flow well

**Step 1: Analyze current structure**
```javascript
list_scenes:
  chapter_id: 5

// Current order:
// Scene 1: Evidence Review (intensity 6)
// Scene 2: Hospital Visit (intensity 7)
// Scene 3: Breakthrough (intensity 9)
// Scene 4: Team Brief (intensity 5)

// Problem: Intensity drops at end (anticlimactic)
```

**Step 2: Reorder scenes**
```javascript
reorder_scenes:
  chapter_id: 5
  scene_order: [
    { scene_id: 101, new_scene_number: 1 },  // Evidence (6)
    { scene_id: 104, new_scene_number: 2 },  // Team Brief (5) ← Moved up
    { scene_id: 102, new_scene_number: 3 },  // Hospital (7)
    { scene_id: 103, new_scene_number: 4 }   // Breakthrough (9) ← End on high note
  ]

// New flow: 6 → 5 → 7 → 9
// Better pacing: builds to climax
```

**Step 3: Adjust transitions**
```javascript
// Update Scene 2 (now Team Brief) to transition better
update_scene:
  scene_id: 104
  scene_content: "[revised to reference Scene 1's discoveries]"

// Update Scene 3 (now Hospital) to reference Team Brief
update_scene:
  scene_id: 102
  scene_content: "[revised opening: 'Armed with her team's backing...']"

// Content updated to match new order
// Chapter now flows: Evidence → Support → Investigation → Breakthrough
```

---

## Summary: Why Chapters Don't Need Content Fields

### The Design Philosophy

**Chapters are containers, scenes are content.**

```
Chapter = Folder
  - Metadata about the whole chapter
  - Summary, goals, structure
  - Aggregate statistics

Chapter_scenes = Documents
  - scene_content: The actual prose
  - scene_outline: The beat sheet
  - scene_revisions: Version history
  - Individual scene metadata
```

### What You Get

✅ **Granular control** - Edit individual scenes without touching others
✅ **Version tracking** - Save revision history per scene
✅ **Flexible organization** - Reorder scenes easily
✅ **Progress tracking** - Know which scenes are done
✅ **Pacing analysis** - Analyze intensity scene by scene
✅ **Better workflow** - Write, revise, reorder independently

### What Authors Should Know

1. **Chapters are for organization** - Title, summary, targets, status
2. **Scenes are for writing** - scene_content holds your prose
3. **Word counts cascade up** - Scene counts → Chapter totals → Book totals
4. **Tools handle the details** - Use create_scene, update_scene, get_scene
5. **Think in scenes** - Most editing/writing happens at scene level
6. **Think in chapters** - Planning and structure happen at chapter level

### The Mental Model

**Don't think:**
> "I'll write Chapter 5 as one big text block"

**Instead think:**
> "Chapter 5 will have 4 scenes. Let me write Scene 1 first..."

This matches how novels are actually structured: as sequences of scenes, grouped into chapters, combined into books.

The database design reflects this natural structure, giving you tools that match how authors actually work.

---

## Quick Reference: Where Things Live

| What You Want | Where It Lives | Field Name |
|---------------|---------------|------------|
| **The actual prose** | chapter_scenes | scene_content |
| **Scene beat sheet** | chapter_scenes | scene_outline |
| **Revision history** | chapter_scenes | scene_revisions |
| **Chapter title** | chapters | title |
| **Chapter summary** | chapters | summary |
| **Chapter word count** | chapters | word_count (sum of scenes) |
| **Scene word count** | chapter_scenes | word_count |
| **Planning notes** | chapters | author_notes |
| **Scene-specific notes** | chapter_scenes | notes |
| **Chapter status** | chapters | status |
| **Scene status** | chapter_scenes | writing_status |
| **Intensity/pacing** | chapter_scenes | intensity_level |
| **POV character** | Both | pov_character_id |
| **Location** | chapters (primary) | primary_location |
| **Location** | chapter_scenes (specific) | location |

---

## Tools Summary

### Chapter-Level Tools
- `create_chapter` - Create chapter container
- `update_chapter` - Update metadata
- `get_chapter` - View chapter with scenes
- `list_chapters` - See all chapters in book
- `delete_chapter` - Remove chapter & all scenes

### Scene-Level Tools (The Writing Tools)
- `create_scene` - Write a new scene
- `update_scene` - Edit prose or metadata
- `get_scene` - Read scene content
- `list_scenes` - See all scenes in chapter
- `delete_scene` - Remove a scene
- `reorder_scenes` - Change scene order
- `analyze_scene_flow` - Analyze pacing & structure

### Where to Write
- ✅ `create_scene` + `update_scene` for prose
- ✅ `scene_content` field for your manuscript
- ✅ `scene_outline` field for beat sheets
- ✅ `scene_revisions` array for version history

**All writing happens in chapter_scenes, not chapters.**
