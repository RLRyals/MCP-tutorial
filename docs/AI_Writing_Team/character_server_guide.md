# Character Server Deep Dive
## Complete Guide to Character Tracking

---

## Purpose

The Character Server prevents the #1 continuity killer: **characters knowing things they shouldn't know yet**.

It also tracks:
- Physical descriptions and personality traits
- Where characters appear in the story
- What they learn and when
- Character relationships and development

---

## Critical Concept: Character Knowledge

**The most important question while writing:**
> "How does this character know this information?"

If you can't answer that question, **you have a plot hole**.

The Character Server solves this by tracking:
1. **What** the character knows
2. **When** they learned it (chapter/scene)
3. **How** they learned it (witnessed, told, deduced)

---

## Character Management Tools

### `create_character`
**When to use:** Introducing any character in the series

**Parameters:**
- `series_id` (required) - from ID Cheat Sheet
- `name` (required) - primary name
- `full_name` (optional) - complete name
- `aliases` (optional) - array of nicknames/alternate names
- `character_type` (optional) - "main", "supporting", "minor", "antagonist"
- `first_appearance_book_id` (optional) - which book they debut
- `status` (optional) - "alive", "dead", "missing", "unknown" (default: "alive")

**Returns:** character_id (ADD TO ID CHEAT SHEET IMMEDIATELY)

**Example:**
```
create_character:
  series_id: 1
  name: "Morgan Blackwood"
  full_name: "Morgan Elizabeth Blackwood"
  aliases: ["Moe", "The Detective"]
  character_type: "main"
  first_appearance_book_id: 1
  status: "alive"
```

---

### `update_character`
**When to use:** Character name changes, type changes, or status changes

**Parameters:**
- `character_id` (required) - from ID Cheat Sheet
- Any fields from create_character

**Example - Character Death:**
```
update_character:
  character_id: 5
  status: "dead"
```

---

### `list_characters`
**When to use:** Verifying who exists, finding character IDs

**Parameters:**
- `series_id` (required)
- `character_type` (optional) - filter by type
- `status` (optional) - filter by status

**Returns:** All characters with IDs

---

### `get_character`
**When to use:** Getting complete character profile

**Parameters:**
- `character_id` (required)

**Returns:** Full character record with all details

---

## Character Details Tools

### `add_character_detail`
**When to use:** Recording ANY character information

**Parameters:**
- `character_id` (required)
- `category` (required) - "physical", "personality", "background", "skills", "relationships", "quirks"
- `attribute` (required) - specific trait name
- `value` (required) - the actual detail
- `confidence_level` (optional) - "established", "mentioned", "implied"
- `source_book_id` (optional) - where this was established

**Category Guide:**
- **physical**: eye_color, height, build, hair, scars, distinguishing_marks, age, clothing_style
- **personality**: temperament, fears, motivations, values, flaws, strengths, humor_style
- **background**: childhood, education, family, trauma, achievements, secrets
- **skills**: combat, magic, languages, professions, hobbies, expertise
- **relationships**: family_ties, friendships, romantic_history, enemies, mentors
- **quirks**: habits, mannerisms, speech_patterns, preferences, pet_peeves

**Examples:**
```
Physical:
  category: "physical"
  attribute: "eye_color"
  value: "green with gold flecks"

Personality:
  category: "personality"
  attribute: "temperament"
  value: "cynical exterior, deeply compassionate core"

Background:
  category: "background"
  attribute: "childhood"
  value: "grew up on farm, parents died when she was 12"

Skills:
  category: "skills"
  attribute: "combat"
  value: "expert swordsman, trained by Royal Guard"
```

**Critical Rule:** Establish details ONCE, reference forever

---

### `get_character_details`
**When to use:** Checking what's already established

**Parameters:**
- `character_id` (required)
- `category` (optional) - filter to specific category

**Returns:** All recorded details for character

**Before Writing Rule:**
Always check existing details before adding new ones to avoid contradictions.

---

## Character Knowledge Tools (MOST CRITICAL)

### `add_character_knowledge_with_chapter`
**When to use:** EVERY TIME a character learns something new

**Parameters:**
- `character_id` (required)
- `knowledge_category` (required) - "secret", "skill", "person", "location", "event", "evidence", "world_rule"
- `knowledge_item` (required) - what they know
- `learned_chapter_id` (required) - where they learned it
- `knowledge_level` (optional) - "knows", "suspects", "unaware", "forgot" (default: "knows")
- `learned_context` (optional) - how they learned it
- `learned_scene` (optional) - specific scene number

**Knowledge Categories:**
- **secret**: Hidden information ("Sarah is a vampire")
- **skill**: Abilities learned ("how to pick locks")
- **person**: Information about people ("Detective Chen is corrupt")
- **location**: Place knowledge ("secret passage in library")
- **event**: What happened ("the murder occurred at 3am")
- **evidence**: Physical clues ("silver dust at crime scene")
- **world_rule**: How world works ("iron disrupts fae magic")

**Examples:**

Mystery - Evidence Discovery:
```
add_character_knowledge_with_chapter:
  character_id: 1
  knowledge_category: "evidence"
  knowledge_item: "silver dust found at crime scene"
  learned_chapter_id: 5
  learned_context: "discovered while examining scene"
  learned_scene: 2
```

Romance - Secret Revealed:
```
add_character_knowledge_with_chapter:
  character_id: 2
  knowledge_category: "secret"
  knowledge_item: "Marcus was previously engaged"
  learned_chapter_id: 12
  learned_context: "Marcus confessed during argument"
  knowledge_level: "knows"
```

Fantasy - World Rule:
```
add_character_knowledge_with_chapter:
  character_id: 3
  knowledge_category: "world_rule"
  knowledge_item: "iron weapons can kill fae"
  learned_chapter_id: 8
  learned_context: "witnessed fae killed with iron dagger"
```

**Critical Workflow:**
1. Character experiences/learns something in scene
2. Immediately call `add_character_knowledge_with_chapter`
3. Update ID Cheat Sheet if needed
4. Now character can reference this in future scenes

---

### `check_character_knowledge`
**When to use:** BEFORE writing any scene where character references information

**Parameters:**
- `character_id` (required)
- `knowledge_category` (optional) - filter by category
- `knowledge_item` (optional) - search for specific knowledge

**Returns:** What character knows, when they learned it

**Critical Usage Pattern:**
```
BEFORE writing: "Morgan mentions the silver dust clue"

1. Call check_character_knowledge:
     character_id: 1
     knowledge_item: "silver dust"

2. Check results:
   - FOUND: learned in Chapter 5 → OK to reference
   - NOT FOUND: ERROR - character doesn't know this yet

3. If not found:
   - Remove reference OR
   - Add scene where they learn it earlier
```

**This prevents:**
- Characters knowing secrets they weren't told
- Characters referencing events they didn't witness
- Characters using information they haven't discovered
- The dreaded "wait, how did they know that?" plot hole

---

### `get_characters_who_know`
**When to use:** Finding who has specific information

**Parameters:**
- `series_id` (required)
- `knowledge_item` (required) - what to search for
- `knowledge_level` (optional) - filter by how well they know it

**Returns:** All characters who know this information

**Use Cases:**
- "Who knows the villain's identity?" - track secret spread
- "Who can teach this skill?" - find mentors
- "Who witnessed the murder?" - track investigation

---

## Character Presence Tools

### `track_character_presence`
**When to use:** After writing each chapter, record who appeared

**Parameters:**
- `character_id` (required)
- `chapter_id` (required)
- `presence_type` (required) - "present", "mentioned", "flashback", "dream", "phone_call"
- `importance_level` (optional) - "major", "minor", "cameo", "background"
- `physical_state` (optional) - "healthy", "injured", "disguised", "tired"
- `emotional_state` (optional) - "happy", "angry", "suspicious", "conflicted"
- `enters_at_scene` (optional) - scene number they arrive
- `exits_at_scene` (optional) - scene number they leave
- `learns_this_chapter` (optional) - array of what they learn
- `reveals_this_chapter` (optional) - array of what they reveal
- `character_growth` (optional) - how they change

**Example - Full Presence:**
```
track_character_presence:
  character_id: 1
  chapter_id: 12
  presence_type: "present"
  importance_level: "major"
  physical_state: "injured from previous fight"
  emotional_state: "angry and determined"
  enters_at_scene: 1
  exits_at_scene: 5
  learns_this_chapter: ["villain's identity", "location of hideout"]
  reveals_this_chapter: ["her true motivation"]
  character_growth: "accepts she can't save everyone alone"
```

**Why Track Presence:**
- Validates character continuity (no sudden disappearances)
- Tracks emotional arcs across chapters
- Records what happens to character each chapter
- Enables timeline analysis

---

### `get_characters_in_chapter`
**When to use:** Before writing chapter, see who's supposed to appear

**Parameters:**
- `chapter_id` (required)
- `presence_type` (optional) - filter by type
- `importance_level` (optional) - filter by importance
- `scene_number` (optional) - filter to specific scene

**Returns:** All characters in that chapter with their details

**Planning Usage:**
```
Before writing Chapter 15:
1. get_characters_in_chapter: chapter_id: 15
2. Review who's present, their states
3. Check their current knowledge
4. Write scenes accordingly
```

---

### `get_character_timeline`
**When to use:** Seeing character's complete story arc

**Parameters:**
- `character_id` (required)
- `book_id` (optional) - filter to specific book
- `include_knowledge` (optional) - include knowledge gained (default: true)
- `include_scenes` (optional) - include scene details (default: false)

**Returns:** Character's complete timeline across chapters

**Use Cases:**
- Verify character arc progression
- Check for long absences
- Review knowledge accumulation
- Validate emotional journey

---

### `check_character_continuity`
**When to use:** Validating consistency between chapters

**Parameters:**
- `character_id` (required)
- `from_chapter_id` (required) - starting chapter
- `to_chapter_id` (required) - ending chapter
- `check_type` (optional) - "physical_state", "emotional_state", "knowledge", "location", "all" (default: "all")

**Returns:** Continuity issues found

**Example:**
```
check_character_continuity:
  character_id: 1
  from_chapter_id: 10
  to_chapter_id: 15
  check_type: "all"

Might find:
- "Character injured in Ch 10, no mention of injury in Ch 12"
- "Character knew secret in Ch 11, acts unaware in Ch 14"
- "Character in City A in Ch 10, suddenly in City B in Ch 11 (no travel shown)"
```

---

## Integration Patterns

### With Book Server
```
Chapter structure (Book Server)
    ↓
Character presence in chapter (Character Server)
    ↓
What character learns in chapter (Character Server)
    ↓
Character can reference in later chapters
```

### With Plot Server
```
Information reveal created (Plot Server)
    ↓
Characters affected by reveal (Plot Server: affects_characters)
    ↓
Add knowledge to each character (Character Server)
    ↓
Characters can now act on information
```

### With World Server
```
World element used in chapter (World Server)
    ↓
Character present in chapter (Character Server)
    ↓
Character learns world rule (Character Server: knowledge_category: "world_rule")
    ↓
Character can use/reference rule later
```

### With Timeline Server
```
Timeline event occurs (Timeline Server)
    ↓
Event mapped to chapter (Timeline Server)
    ↓
Characters present in chapter (Character Server)
    ↓
Add knowledge of event (Character Server)
```

---

## Common Workflows

### Creating New Character
1. `create_character` → get character_id
2. Add to ID Cheat Sheet
3. `add_character_detail` for physical description
4. `add_character_detail` for personality
5. `add_character_detail` for background
6. Ready to use in scenes

### Before Writing Scene with Information
1. Identify what information will be referenced
2. For each character in scene:
   - `check_character_knowledge` for that information
3. If ANY character lacks knowledge:
   - Remove reference OR add earlier learning moment
4. Only write scene when all knowledge validated

### After Writing Chapter
1. For each character who appeared:
   - `track_character_presence` with full details
2. For each thing learned:
   - `add_character_knowledge_with_chapter`
3. Update ID Cheat Sheet if needed

### Continuity Review
1. `get_character_timeline` for each main character
2. Review for:
   - Long absences (gaps in appearances)
   - Inconsistent emotional states
   - Knowledge contradictions
3. `check_character_continuity` between problem chapters
4. Fix issues found

---

## Genre-Specific Usage

### Mystery/Thriller
**Heavy Knowledge Tracking:**
- Every clue discovered → `add_character_knowledge` with evidence category
- Before suspect references clue → `check_character_knowledge`
- Track who knows what when (critical for alibis)
- Use `get_characters_who_know` to track secret spread

### Romance
**Heavy Presence Tracking:**
- Track emotional_state every chapter
- Record reveals_this_chapter for relationship progression
- Note character_growth for arc development
- Use secrets category for hidden pasts

### Fantasy/Sci-Fi
**Heavy World Rule Knowledge:**
- Characters learn magic/tech rules → knowledge_category: "world_rule"
- Track skill acquisition
- Record training progression
- Validate power usage against knowledge

### All Genres
**Universal Requirements:**
- Track what characters know
- Validate before referencing
- Record presence
- Check continuity

---

## Critical Errors to Avoid

### ❌ Not Checking Knowledge Before Writing
**Wrong:** Write scene where Morgan references silver dust
**Right:** Check knowledge first, confirm Morgan knows about it

### ❌ Forgetting to Add Knowledge When Learned
**Wrong:** Character discovers secret, forget to record
**Right:** Immediately call `add_character_knowledge_with_chapter`

### ❌ Not Tracking Presence
**Wrong:** Character appears in Ch 5, absent Ch 6-10, suddenly in Ch 11 (no explanation)
**Right:** Track presence each chapter, note absences, explain returns

### ❌ Contradicting Physical Details
**Wrong:** Add eye_color: "brown" after previously establishing "green"
**Right:** `get_character_details` BEFORE adding new physical traits

### ❌ Character Acting on Unknown Information
**Wrong:** Character makes decision based on info they never learned
**Right:** Verify knowledge, add learning scene if needed

---

## Troubleshooting

### "Character shouldn't know this yet"
1. `check_character_knowledge` - confirm they don't know
2. Options:
   - Add earlier scene where they learn it
   - Remove reference from current scene
   - Have another character tell them

### "Character description inconsistent"
1. `get_character_details` - check established details
2. Fix: Update current description to match
3. If intentional change: note in character_growth

### "Character disappeared without explanation"
1. `get_character_timeline` - find last appearance
2. Fix: Add transition explaining absence
3. Future: Track presence consistently

### "Can't remember what character knows"
1. `get_character_details` - see all details
2. `check_character_knowledge` - see all knowledge
3. `get_character_timeline` - see progression

---

## Remember

Character knowledge tracking is the **most powerful continuity tool** you have.

When in doubt:
1. Check knowledge BEFORE writing
2. Add knowledge WHEN learned
3. Track presence AFTER chapter complete
4. Validate continuity BEFORE publishing

This prevents 90% of continuity errors in fiction.