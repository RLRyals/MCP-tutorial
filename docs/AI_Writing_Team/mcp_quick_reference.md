# MCP Quick Reference Guide
## Fast Lookup: Which Server for Which Task

---

## Quick Decision Tree

**Need to track author/series/book structure?** → Author/Series/Book Servers  
**Need to track character details/presence/knowledge?** → Character Server  
**Need to track plot threads/reveals/relationships?** → Plot Server  
**Need to track chronology vs narrative presentation?** → Timeline Server  
**Need to track locations/magic systems/organizations?** → World Server  
**Need to track writing sessions/validate/export?** → Writing Server  

---

## At-a-Glance Server Functions

### Author Server
- **Primary Use:** Create author entry ONCE at setup
- **Main Tools:** `create_author`, `get_author`, `list_authors`
- **AI Team Usage:** Minimal - only for ID verification
- **Critical Rule:** NEVER create author entries - only real author does this

### Series Server  
- **Primary Use:** Container for entire series
- **Main Tools:** `create_series`, `get_series`, `update_series`, `list_series`
- **AI Team Usage:** Verify series_id, check series status
- **Critical Rule:** Ask before creating new series

### Book Server
- **Primary Use:** Books, chapters, scenes - writing structure
- **Main Tools:** 
  - Books: `create_book`, `get_book`, `update_book`, `list_books`
  - Chapters: `create_chapter`, `get_chapter`, `update_chapter`, `list_chapters`
  - Scenes: `create_scene`, `get_scene`, `update_scene`, `list_scenes`
- **AI Team Usage:** MOST FREQUENT - structure all writing
- **Critical Rule:** Foundation of all story tracking

### Character Server
- **Primary Use:** Character details, knowledge, presence
- **Main Tools:**
  - Details: `create_character`, `add_character_detail`, `get_character_details`
  - Knowledge: `add_character_knowledge_with_chapter`, `check_character_knowledge`
  - Presence: `track_character_presence`, `get_characters_in_chapter`
- **AI Team Usage:** CRITICAL - prevents continuity errors
- **Critical Rule:** ALWAYS check knowledge before writing scenes

### Plot Server
- **Primary Use:** Universal genre framework (reveals, relationships, systems)
- **Main Tools:**
  - Threads: `create_plot_thread`, `update_plot_thread`, `get_plot_threads`
  - Reveals: `create_information_reveal`, `add_reveal_evidence`
  - Relationships: `create_relationship_arc`, `track_relationship_dynamics`
  - Systems: `define_world_system`, `track_system_progression`
- **AI Team Usage:** Track story structure across all genres
- **Critical Rule:** Universal tools work for ALL genres

### Timeline Server
- **Primary Use:** Chronology vs narrative presentation
- **Main Tools:**
  - Events: `create_timeline_event`, `list_timeline_events`
  - Mapping: `map_event_to_chapter`, `get_chapter_events`
- **AI Team Usage:** Separate "when it happened" from "when shown"
- **Critical Rule:** Same event can appear in multiple chapters differently

### World Server
- **Primary Use:** Locations, magic/tech systems, organizations
- **Main Tools:**
  - Locations: `create_location`, `get_locations`, `track_location_usage`
  - Elements: `create_world_element`, `get_world_elements`, `track_element_usage`
  - Organizations: `create_organization`, `get_organizations`, `track_organization_activity`
- **AI Team Usage:** Maintain world consistency
- **Critical Rule:** Define rules and limitations for all systems

### Writing Server
- **Primary Use:** Sessions, validation, exports
- **Main Tools:**
  - Sessions: `log_writing_session`, `get_writing_progress`
  - Goals: `set_writing_goals`, `get_productivity_analytics`
  - Validation: `validate_chapter_structure`, `check_structure_violations`
  - Export: `export_manuscript`, `word_count_tracking`
- **AI Team Usage:** Track productivity, check quality, prepare manuscripts
- **Critical Rule:** Flexible guidelines, not rigid enforcement

---

## Workflow Cheat Sheet

### Planning a Book
1. **Series Server:** Verify series exists
2. **Book Server:** `create_book` 
3. **Character Server:** `create_character` for main cast
4. **Plot Server:** `create_plot_thread` for main storylines
5. **World Server:** `create_location` for settings
6. **Timeline Server:** `create_timeline_event` for backstory

### Planning a Chapter
1. **Book Server:** `create_chapter`
2. **Character Server:** `get_characters_in_chapter` - who appears
3. **Plot Server:** `get_plot_threads` - what's active
4. **World Server:** `get_locations` - where it happens
5. **Timeline Server:** `get_chapter_events` - what chronologically occurs

### Writing a Scene
1. **Character Server:** `check_character_knowledge` - can they know this?
2. **Book Server:** `create_scene` or `update_scene`
3. **Character Server:** `track_character_presence` - who's here
4. **Plot Server:** `create_information_reveal` - what's revealed
5. **World Server:** `track_location_usage` - where used

### After Writing Session
1. **Book Server:** `update_chapter` with status/word count
2. **Writing Server:** `log_writing_session` 
3. **Character Server:** `add_character_knowledge_with_chapter` - what learned
4. **Plot Server:** `update_plot_thread` - progress made

### Before Publishing/Revision
1. **Writing Server:** `validate_chapter_structure`
2. **Character Server:** `check_character_continuity`
3. **Writing Server:** `check_structure_violations`
4. **Plot Server:** Check plot thread resolution
5. **Writing Server:** `export_manuscript`

---

## Most Common Mistakes

### ❌ Creating without checking IDs first
Always consult ID Cheat Sheet before tool calls requiring IDs

### ❌ Not checking character knowledge before writing
Call `check_character_knowledge` BEFORE scenes with information references

### ❌ Forgetting to track character presence
Call `track_character_presence` AFTER writing each chapter

### ❌ Not adding knowledge when characters learn
Call `add_character_knowledge_with_chapter` when info is revealed

### ❌ Creating authors/series without permission
Only create when author explicitly says to

### ❌ Treating validation as rigid rules
Validation provides flexible guidelines, not enforcement

### ❌ Not tracking world element usage
Track where magic/tech/locations used for consistency

### ❌ Forgetting timeline vs narrative distinction
Same event can be shown multiple times in different ways

---

## Integration Patterns

### Character Knowledge (CRITICAL)
```
Before writing → check_character_knowledge
During scene → character learns something
After scene → add_character_knowledge_with_chapter
Result: No "how did they know that?" errors
```

### Plot Thread Tracking
```
Create thread → spans books (start_book, end_book)
During writing → create_information_reveal, track_relationship_dynamics
Track progress → update_plot_thread status
Resolve → resolve_plot_thread with notes
```

### Location Consistency
```
Create location → define description, atmosphere, features
Before scene → get_locations to verify details
After scene → track_location_usage
Result: Consistent setting descriptions
```

### Writing Progress
```
During session → write chapters/scenes
After session → log_writing_session (auto-updates book word count)
Check progress → get_writing_progress
Set targets → set_writing_goals
```

---

## ID Management Rules

### Always Required
- series_id (for series-level data)
- book_id (for book-level data)
- chapter_id (for chapter-level data)
- character_id (for character operations)

### ID Hierarchy
```
series_id
  └── book_id
      └── chapter_id
          └── scene_id
```

### Before EVERY Tool Call
1. Identify what IDs are needed
2. Consult ID Cheat Sheet
3. Verify IDs exist
4. Use exact IDs from sheet
5. If missing → ask author to create first

---

## Genre-Specific Tool Usage

### Mystery/Thriller
- **Heavy Use:** Plot Server (information reveals, evidence tracking)
- **Critical:** Character knowledge (who knows what when)
- **Important:** Timeline Server (alibis, chronology)

### Romance
- **Heavy Use:** Plot Server (relationship arcs, dynamics)
- **Critical:** Character Server (emotional states, presence)
- **Important:** Timeline Server (relationship progression)

### Fantasy/Sci-Fi
- **Heavy Use:** World Server (magic systems, tech, locations)
- **Critical:** Plot Server (world system rules and progression)
- **Important:** Character Server (character powers/abilities)

### All Genres
- **Always Use:** Book Server (structure), Character Server (knowledge)
- **Always Track:** Writing Server (sessions, progress)
- **Always Validate:** Writing Server (consistency, quality)

---

## Emergency Troubleshooting

### "Character shouldn't know this yet"
→ Check: `check_character_knowledge` before writing
→ Fix: Remove reference or add earlier learning moment

### "Location described differently than before"
→ Check: `get_locations` for established description
→ Fix: Use consistent description from world server

### "Plot thread seems abandoned"
→ Check: `get_plot_threads` with status filter
→ Fix: `update_plot_thread` or `resolve_plot_thread`

### "Character appears without explanation"
→ Check: `get_character_timeline` for last appearance
→ Fix: Add transition or explanation for gap

### "Timeline doesn't make sense"
→ Check: `list_timeline_events` for chronology
→ Fix: Adjust story_time_start/end in chapters

### "Word count doesn't match"
→ Check: `word_count_tracking` at chapter level
→ Fix: Update chapter word_count, auto-flows to book

---

## Remember: You Have Help

This is a **reference guide**, not a memorization test.

When unsure:
1. Check this Quick Reference first
2. Consult detailed server-specific guides
3. Ask author for clarification
4. Always verify IDs in Cheat Sheet

The MCP system is designed to **help you track details**, not to make writing harder.

Use it as your filing system for the million details that make a series great.