# Timeline & Integration Guide
## Chronology Management + Cross-Server Patterns

---

## Part 1: Timeline Server

### Core Concept

**Timeline Server separates TWO different timelines:**

1. **Chronological Time** - when events actually happened in story world
2. **Narrative Time** - when events are shown to reader in chapters

**Why this matters:** Same event can appear multiple times in different ways (flashback, memory, direct scene, reference).

---

## Timeline Event Tools

### `create_timeline_event`
**When to use:** Recording significant events in story chronology

**Parameters:**
- `series_id` (required)
- `event_name` (required)
- `event_date` (required) - in-universe date
- `event_description` (optional)
- `book_id` (optional) - associated book
- `significance` (optional) - "major", "minor", "background"
- `is_public_knowledge` (optional) - widely known or secret?
- `participants` (optional) - array of character IDs
- `time_period` (optional) - grouping label
- `sort_order` (optional) - for ordering within same date

**Example - Backstory Event:**
```
create_timeline_event:
  series_id: 1
  event_name: "Duke Ashford's Murder"
  event_date: "1847-03-15"
  event_description: "Duke killed in his study, silver dust found at scene"
  significance: "major"
  is_public_knowledge: true
  participants: [5, 8, 12]
  time_period: "The Royal Gala Week"
```

**Returns:** event_id (ADD TO ID CHEAT SHEET)

---

### `list_timeline_events` / `get_character_timeline_events`
Query chronological events. Get events for specific character or time period.

---

## Event-to-Chapter Mapping

### Core Concept

**One chronological event can be presented multiple times:**
- Chapter 5: Direct scene (murder happens)
- Chapter 12: Flashback (victim's perspective)  
- Chapter 18: Memory (detective recalls detail)
- Chapter 24: Reference (mentioned in conversation)

Each presentation = one mapping.

### `map_event_to_chapter`
**When to use:** Recording HOW an event appears in narrative

**Parameters:**
- `event_id` (required) - chronological event
- `chapter_id` (required) - where shown
- `presentation_type` (required) - "direct_scene", "flashback", "memory", "reference", "foreshadowing", "dream", "retelling"
- `scene_number` (optional) - specific scene
- `pov_character_id` (optional) - whose perspective
- `completeness` (optional) - "full", "partial", "glimpse"
- `event_aspect` (optional) - which part shown
- `narrative_function` (optional) - why show it here

**Examples:**

**Direct Scene (when it happens):**
```
map_event_to_chapter:
  event_id: 15
  chapter_id: 5
  presentation_type: "direct_scene"
  pov_character_id: 1
  completeness: "partial"
  event_aspect: "Discovery of body, initial investigation"
  narrative_function: "Inciting incident"
```

**Flashback (shown later):**
```
map_event_to_chapter:
  event_id: 15
  chapter_id: 12
  presentation_type: "flashback"
  pov_character_id: 5
  completeness: "full"
  event_aspect: "Victim's final moments, reveals killer's identity"
  narrative_function: "Critical revelation"
```

**Memory (recalled):**
```
map_event_to_chapter:
  event_id: 15
  chapter_id: 18
  presentation_type: "memory"
  pov_character_id: 1
  completeness: "glimpse"
  event_aspect: "Detective remembers overlooked detail"
  narrative_function: "Breakthrough moment"
```

---

### `get_event_mappings` / `get_chapter_events`
Query where events appear. See all presentations of one event, or all events in one chapter.

---

### `analyze_narrative_structure`
**When to use:** Analyzing chronology vs narrative presentation

**Parameters:**
- `book_id` (required)
- `analysis_type` (optional) - "linearity", "pov_distribution", "event_coverage", "all"

**Returns:** Analysis of how narrative structure uses chronological events.

---

## Timeline Workflow Patterns

### For Linear Narratives
```
1. create_timeline_event for each major event
2. map_event_to_chapter as direct_scene
3. Events appear in chronological order
4. Simple one-to-one mapping
```

### For Non-Linear Narratives
```
1. create_timeline_event for actual chronology
2. map_event_to_chapter multiple times:
   - Foreshadowing in early chapter
   - Direct scene in middle
   - Flashback reveal in later chapter
   - Reference in final chapter
3. Track BOTH when it happened AND when shown
```

### For Mystery/Thriller
```
1. create_timeline_event for crime/conspiracy events
2. Track is_public_knowledge (what's known vs secret)
3. map_event_to_chapter as clues revealed
4. Different characters learn at different times
5. Integrate with character knowledge tracking
```

---

## Part 2: Complete Cross-Server Integration

### Integration Pattern: Character Knowledge Flow

**Scenario:** Character learns secret in Chapter 12

```
Timeline Server:
  create_timeline_event: "Secret revealed to Morgan"
  map_event_to_chapter: direct_scene in Chapter 12

Character Server:
  add_character_knowledge_with_chapter: 
    learned_chapter_id: 12
    knowledge_item: "Villain's true identity"

Plot Server:
  create_information_reveal:
    revealed_in_chapter: 12
    affects_characters: [1]
    
Book Server:
  track what happened in Chapter 12

Result: Complete tracking of WHO learned WHAT WHEN and HOW
```

---

### Integration Pattern: Location Consistency

**Scenario:** Scene occurs at important location

```
World Server:
  create_location: "Duke's Study"
  define description, atmosphere, features
  
Book Server:
  create_scene:
    location: "Duke's Study"
    location stored as text
    
World Server:
  track_location_usage:
    location_id: X
    chapter_id: Y
    
Before Next Scene:
  World Server: get_locations to verify description
  Use same description for consistency
  
Result: All scenes at location use consistent description
```

---

### Integration Pattern: Plot Thread Progression

**Scenario:** Mystery investigation progresses

```
Plot Server:
  create_plot_thread: "Murder Investigation"
  
Book Server:
  create_chapter: "Evidence Discovery"
  
Plot Server:
  create_information_reveal: "Silver dust evidence"
  affects_characters: [detective]
  
Character Server:
  add_character_knowledge: detective learns evidence
  track_character_presence: detective in chapter
  
Timeline Server:
  create_timeline_event: "Evidence discovered"
  map_event_to_chapter: direct presentation
  
Writing Server:
  log_writing_session: chapter completed
  
Plot Server:
  update_plot_thread: mark progress
  
Result: Complete tracking of investigation progression
```

---

### Integration Pattern: Relationship Development

**Scenario:** Romantic relationship milestone

```
Plot Server:
  create_relationship_arc: romantic relationship
  
Book Server:
  create_chapter: "The First Kiss"
  
Plot Server:
  track_relationship_dynamics:
    change_type: "emotional"
    tension_change: +5
    trigger_event: "near-death vulnerability"
    
Character Server:
  track_character_presence for both characters:
    emotional_state: "vulnerable but connected"
    reveals_this_chapter: ["true feelings"]
    
Timeline Server:
  create_timeline_event: "First kiss"
  map_event_to_chapter: direct_scene
  
Result: Complete tracking of relationship milestone
```

---

### Integration Pattern: World System Usage

**Scenario:** Character uses magic for first time

```
Plot Server:
  define_world_system: "Elemental Magic"
  rules and limitations established
  
Character Server:
  add_character_detail:
    category: "skills"
    attribute: "magic"
    value: "beginner elemental binding"
    
Book Server:
  create_scene: "First spell casting"
  
World Server:
  track_element_usage:
    element_id: magic_system_id
    chapter_id: X
    power_level: 2
    
Plot Server:
  track_system_progression:
    character_id: Y
    current_power_level: 2
    progression_method: "emergency breakthrough"
    
Character Server:
  add_character_knowledge:
    knowledge_category: "world_rule"
    knowledge_item: "can bind fire element"
    
Result: Complete tracking of magic use and learning
```

---

## Complete Chapter Writing Workflow

### Before Writing Chapter

```
1. Book Server:
   - get_chapter: review plan
   
2. Character Server:
   - get_characters_in_chapter: see who appears
   - check_character_knowledge for each: verify what they know
   
3. Plot Server:
   - get_plot_threads: check active threads
   
4. World Server:
   - get_locations: verify setting details
   - get_world_elements: confirm rules
   
5. Timeline Server:
   - get_chapter_events: see what chronologically happens
   - Check narrative presentation type needed
```

### During Writing

```
1. Book Server:
   - Write scenes
   - update_scene with word counts
   
2. Character Server:
   - When character learns: add_character_knowledge_with_chapter
   - Track who's present: track_character_presence
   
3. Plot Server:
   - When info revealed: create_information_reveal
   - When relationship changes: track_relationship_dynamics
   - When magic used: track_system_progression
   
4. World Server:
   - When location used: track_location_usage
   - When magic/tech used: track_element_usage
   
5. Timeline Server:
   - If presenting chronological event: map_event_to_chapter
```

### After Writing Chapter

```
1. Book Server:
   - update_chapter: status, word count, notes
   
2. Character Server:
   - Finalize track_character_presence for all characters
   - Verify all knowledge additions complete
   
3. Plot Server:
   - update_plot_thread if progress made
   
4. Writing Server:
   - log_writing_session: record productivity
   
5. Validation:
   - check_character_continuity if needed
   - validate_chapter_structure for quality check
```

---

## Critical Integration Rules

### Rule 1: ID Flow
```
series_id (top level)
  ↓ required for all series-level data
book_id (from series)
  ↓ required for book-level data
chapter_id (from book)
  ↓ required for chapter-level data
scene_id (from chapter)
  ↓ required for scene-level data
```

Always reference parent IDs when creating children.

### Rule 2: Character Knowledge = Priority
```
BEFORE writing scene with information:
  → check_character_knowledge
AFTER character learns something:
  → add_character_knowledge_with_chapter
```

This prevents 90% of continuity errors.

### Rule 3: Usage Tracking Enables Validation
```
Track where used:
  → World Server: track_location_usage, track_element_usage
  → Character Server: track_character_presence
  → Timeline Server: map_event_to_chapter
  
Result:
  → Writing Server can validate consistency
  → AI team can catch contradictions
```

### Rule 4: Word Counts Auto-Aggregate
```
Scene word_count
  ↓ flows to
Chapter word_count
  ↓ flows to
Book actual_word_count
  ↑ also increased by
Writing session words_written
```

Don't manually track at all levels - let it flow.

### Rule 5: Timeline ≠ Narrative
```
Chronological events (Timeline Server)
  ≠
Chapter presentation (Book Server + Timeline mapping)

Same event can appear in multiple chapters differently.
Always track BOTH.
```

---

## Troubleshooting Integration Issues

### "Character knows something they shouldn't"
```
Problem: Character references info they never learned

Fix Flow:
1. Character Server: check_character_knowledge
2. If not found: check Timeline Server
3. Was event mapped to earlier chapter?
4. If yes: add_character_knowledge for that chapter
5. If no: Remove reference OR add learning moment
```

### "Location described inconsistently"
```
Problem: Same location has different descriptions

Fix Flow:
1. World Server: get_locations for established description
2. World Server: list all track_location_usage
3. Review each chapter's description
4. Update inconsistent ones to match established version
5. Future: Always check get_locations first
```

### "Plot thread seems abandoned"
```
Problem: Thread mentioned early, never resolved

Fix Flow:
1. Plot Server: get_plot_threads with status filter
2. Find the thread, check start_book and end_book
3. Update status to "on_hold" if intentional
4. OR resolve_plot_thread if it was resolved but not marked
5. OR add resolution to planned chapters
```

### "Timeline doesn't make sense"
```
Problem: Events in wrong order or impossible timing

Fix Flow:
1. Timeline Server: list_timeline_events for chronology
2. Timeline Server: check map_event_to_chapter for each
3. Verify chronological order makes sense
4. Check travel time between locations
5. Update event_date if needed
6. Update chapter story_time_start/end if needed
```

---

## Integration Best Practices

### 1. Start with Structure (Book Server)
Build your framework first: series → books → chapters → scenes

### 2. Add World Details (World Server)
Define locations, systems, organizations before writing

### 3. Track Knowledge Religiously (Character Server)
NEVER skip character knowledge tracking

### 4. Use Universal Tools (Plot Server)
Information reveals, relationships, systems work for ALL genres

### 5. Separate Chronology from Narrative (Timeline Server)
Track when it happened AND when you show it

### 6. Monitor Without Pressure (Writing Server)
Sessions for progress, validation for quality, export for completion

---

## Remember

The MCP system is designed as an **integrated ecosystem**.

Each server has a specific job, but they work together to give you:
- Complete story structure tracking
- Zero-gap continuity management
- Flexible quality validation
- Professional manuscript preparation

Use the servers together, not in isolation, for maximum benefit.