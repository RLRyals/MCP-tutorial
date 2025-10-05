# chapter_scenes vs trope_scenes: Understanding the Relationship

## Quick Summary

**`chapter_scenes`** (Book Server) = The actual prose you write
**`trope_scenes`** (Plot Server) = Tracking how narrative tropes are implemented

They work together but serve different purposes.

---

## Table Comparison

| Feature | **chapter_scenes** | **trope_scenes** |
|---------|-------------------|------------------|
| **Server** | Book Server | Plot Server |
| **Purpose** | The actual scene in manuscript | Tracking trope implementation |
| **Primary Use** | Writing the book | Planning story patterns |
| **Content Type** | Prose, beats, outline | Trope execution tracking |
| **Exists Independently?** | Yes | Yes |
| **Can Link Together?** | Via `trope_scenes.scene_id → chapter_scenes.id` | Via `scene_id` FK (optional) |

---

## Field-by-Field Comparison

### Content Fields

| Field | **chapter_scenes** | **trope_scenes** |
|-------|-------------------|------------------|
| **scene_content** | ✅ The actual manuscript prose | ❌ Not applicable |
| **scene_outline** | ✅ Beat sheet for writing | ❌ Not applicable |
| **scene_revisions** | ✅ Version history array | ❌ Not applicable |
| **scene_summary** | ✅ Brief summary of what happens | ✅ How trope is implemented |
| **notes** | ✅ Author reminders | ❌ Not applicable |
| **implementation_notes** | ❌ Not applicable | ✅ Trope-specific notes |

### Scene Elements

| Field | **chapter_scenes** | **trope_scenes** |
|-------|-------------------|------------------|
| **scene_elements** | ✅ What's ACTUALLY in the scene | ✅ What SHOULD be for trope |
| **Purpose** | Reality of written content | Planning/tracking expectations |
| **Can Differ?** | Yes - author may vary from plan | Yes - tracks variations |

**Example:**
```javascript
// Planned (trope_scenes)
scene_elements: ["blood_play", "power_exchange", "telepathic_bonding"]

// Actually written (chapter_scenes)
scene_elements: ["power_exchange", "telepathic_bonding"]
// Author decided blood_play was too intense

// Tracked in variation_notes:
variation_notes: "Removed blood_play to keep heat level appropriate"
```

### Identification & Location

| Field | **chapter_scenes** | **trope_scenes** |
|-------|-------------------|------------------|
| **id** | Scene's unique ID | Trope scene implementation ID |
| **chapter_id** | ✅ Which chapter | ✅ Planned chapter |
| **scene_number** | ✅ Position in chapter | ✅ Planned position |
| **scene_id** | ❌ Not applicable | ✅ Links to chapter_scenes.id |
| **instance_id** | ❌ Not applicable | ✅ Which trope instance |
| **scene_type_id** | ❌ Not applicable | ✅ Which trope scene type |

### Scene Details

| Field | **chapter_scenes** | **trope_scenes** |
|-------|-------------------|------------------|
| **pov_character_id** | ✅ Whose POV | ❌ Not applicable |
| **scene_participants** | ✅ Who's in scene | ❌ Not applicable |
| **location** | ✅ Where it happens | ❌ Not applicable |
| **time_of_day** | ✅ When it happens | ❌ Not applicable |
| **duration** | ✅ How long it lasts | ❌ Not applicable |
| **scene_type** | ✅ dramatic/comedic/etc | ❌ Not applicable |

### Quality Tracking

| Field | **chapter_scenes** | **trope_scenes** |
|-------|-------------------|------------------|
| **intensity_level** | ✅ Pacing intensity (1-10) | ❌ Not applicable |
| **writing_status** | ✅ planned/drafted/revised/final | ❌ Not applicable |
| **word_count** | ✅ Actual word count | ❌ Not applicable |
| **effectiveness_rating** | ❌ Not applicable | ✅ How well trope executed (1-10) |
| **variation_notes** | ❌ Not applicable | ✅ How this differs from typical |

---

## Relationship Structure

```
┌─────────────────────────────────────┐
│      chapter_scenes (Book Server)   │
│                                     │
│  id: 456                            │
│  chapter_id: 15                     │
│  scene_number: 3                    │
│  scene_title: "The Claiming"       │
│  scene_content: "Marcus's eyes..." │  ← THE ACTUAL PROSE
│  scene_elements: [                  │
│    "power_exchange",                │
│    "telepathic_bonding"             │
│  ]                                  │
│  intensity_level: 9                 │
│  writing_status: "final"            │
└─────────────────────────────────────┘
                    ▲
                    │
                    │ scene_id = 456 (Optional FK)
                    │
┌─────────────────────────────────────┐
│     trope_scenes (Plot Server)      │
│                                     │
│  id: 123                            │
│  instance_id: 5   ──┐               │
│  scene_type_id: 12  │               │
│  scene_id: 456 ─────┘               │  ← LINKS TO chapter_scenes
│  scene_summary: "First blood bond" │  ← TROPE TRACKING
│  scene_elements: [                  │
│    "power_exchange",                │
│    "telepathic_bonding",            │
│    "blood_play"  ← PLANNED BUT     │
│  ]                  NOT EXECUTED    │
│  effectiveness_rating: 9            │
│  variation_notes: "Removed         │
│    blood_play for heat level"      │
│  implementation_notes: "Use        │
│    dragon lore for mechanics"      │
└─────────────────────────────────────┘
                    │
                    │ instance_id
                    ▼
        ┌───────────────────────┐
        │   trope_instances     │
        │   "Fated Mates" in    │
        │   Book 2              │
        └───────────────────────┘
```

---

## Workflow Scenarios

### Scenario 1: Outline-First Author (Plan → Write)

```javascript
// STEP 1: Plot Server - Plan the trope
implement_trope_scene:
  instance_id: 5              // "Fated Mates" trope
  scene_type_id: 12           // "First Blood Bond"
  chapter_id: 15              // Will be in Chapter 15
  scene_number: 3
  scene_summary: "Marcus claims Elena through blood bond"
  scene_elements: [
    "power_exchange",
    "telepathic_bonding",
    "blood_play",
    "vulnerability_moment"
  ]
  implementation_notes: "Use dragon mythology for bond mechanics"
  effectiveness_rating: null  // Not written yet
  // scene_id: NULL (not written)

// STEP 2: Book Server - Write the scene
create_scene:
  chapter_id: 15
  scene_number: 3
  scene_title: "The Claiming"
  scene_outline: "1. Marcus transforms, 2. Elena accepts bond..."
  scene_elements: [
    "power_exchange",
    "telepathic_bonding"
    // Author decided to skip blood_play
  ]
  scene_content: "Marcus's eyes flared gold as ancient power..."
  intensity_level: 9
  writing_status: "drafted"
  // Returns: scene_id = 456

// STEP 3: Link them (future enhancement)
update_trope_scene:
  trope_scene_id: 123
  scene_id: 456                // Now linked!
  variation_notes: "Removed blood_play for pacing"
  effectiveness_rating: 9      // Rate after writing
```

---

### Scenario 2: Discovery Writer (Write → Track)

```javascript
// STEP 1: Book Server - Write scene organically
create_scene:
  chapter_id: 8
  scene_number: 2
  summary: "Detective analyzes DNA evidence"
  scene_elements: [
    "forensic_analysis",
    "evidence_collection",
    "deductive_reasoning"
  ]
  scene_content: "The UV light revealed traces of..."
  intensity_level: 7
  // Returns: scene_id = 789

// STEP 2: Plot Server - Later realize this implements a trope
implement_trope_scene:
  instance_id: 8              // "Red Herring" trope
  scene_type_id: 4            // "False Evidence Discovery"
  scene_id: 789               // Link to existing scene
  chapter_id: 8
  scene_number: 2
  scene_summary: "DNA points to wrong suspect - red herring"
  scene_elements: [
    "forensic_analysis",      // Matches actual scene
    "red_herring",            // Add trope context
    "false_lead_placement"
  ]
  effectiveness_rating: 8
  variation_notes: "DNA evidence more compelling than typical"
```

---

### Scenario 3: Multiple Tropes in One Scene

One `chapter_scene` can implement multiple `trope_scenes`:

```javascript
// The actual scene
chapter_scenes (id: 456):
  scene_content: "Marcus transformed, scales rippling..."
  scene_elements: [
    "dragon_transformation",
    "telepathic_bonding",
    "power_exchange"
  ]

// Implements trope #1
trope_scenes (id: 101):
  scene_id: 456
  instance_id: 5  // "Fated Mates" trope
  scene_type_id: 12  // "First Bond"
  scene_elements: ["telepathic_bonding", "power_exchange"]
  effectiveness_rating: 9

// ALSO implements trope #2
trope_scenes (id: 102):
  scene_id: 456
  instance_id: 7  // "Power Reveal" trope
  scene_type_id: 8   // "Transformation Scene"
  scene_elements: ["dragon_transformation", "power_display"]
  effectiveness_rating: 10
```

---

### Scenario 4: Unwritten Planned Scenes

Track what needs to be written:

```javascript
// Query: What trope scenes haven't been written yet?
get_trope_scenes:
  instance_id: 5
  unwritten_only: true

// Returns:
trope_scenes (id: 125):
  scene_id: NULL              // ← Not written yet!
  scene_type_id: 15           // "Conflict Scene"
  chapter_id: 18              // Planned for Ch 18
  scene_summary: "Elena challenges the bond"
  scene_elements: ["resistance", "power_struggle"]

// Author uses this as writing to-do list
```

---

## Query Patterns

### Book Server Queries (Writing Focus)

**Get scene with all details:**
```javascript
get_scene:
  scene_id: 456
  include_characters: true
// Returns: prose, outline, participants, intensity, elements
```

**Analyze chapter pacing:**
```javascript
analyze_scene_flow:
  chapter_id: 15
  analysis_type: "intensity_flow"
// Shows: 3/10, 5/10, 9/10, 7/10 - good arc!
```

**Find scenes by elements:**
```javascript
list_scenes:
  chapter_id: 12
  scene_elements: ["forensic_analysis"]
// Returns: All investigation scenes in chapter
```

---

### Plot Server Queries (Pattern Focus)

**Get all trope implementations:**
```javascript
get_trope_scenes:
  instance_id: 5
// Returns: All scenes implementing this trope
// Shows: ✅ written or 📝 planned status
```

**Find scenes by trope elements:**
```javascript
get_trope_scenes:
  series_id: 1
  kinks_filter: ["power_exchange", "blood_play"]
// Returns: All scenes across series using these elements
```

**Track writing progress:**
```javascript
get_trope_scenes:
  instance_id: 5
  written_only: true
// Returns: Only completed scenes (scene_id NOT NULL)
```

**Get to-do list:**
```javascript
get_trope_scenes:
  series_id: 1
  unwritten_only: true
// Returns: Planned scenes not yet written
```

---

### Cross-Server Analysis

**Full scene context:**
```javascript
// 1. Get trope tracking
get_trope_scenes:
  instance_id: 5

// 2. For each scene_id returned, get actual content
get_scene:
  scene_id: 456

// Now you have:
// - What the scene implements (trope perspective)
// - What's actually written (prose perspective)
// - How they compare (variation tracking)
```

---

## Why This Separation?

### 1. **Separation of Concerns**

**Book Server** focuses on **craft**:
- How to write engaging prose
- Scene pacing and flow
- Character voice and POV
- Word count targets

**Plot Server** focuses on **architecture**:
- Story structure and patterns
- Trope execution
- Narrative effectiveness
- Pattern analysis

### 2. **Flexible Workflows**

Different authors work differently:
- **Outliners**: Plan tropes first → write scenes → link
- **Discovery writers**: Write scenes → identify tropes → track
- **Hybrid**: Mix of both approaches
- **Planners**: Track tropes without writing yet

### 3. **Different Analysis Needs**

**Writing Analysis** (chapter_scenes):
```
- Is pacing working? (intensity_level)
- Are scenes balanced? (word_count distribution)
- Too many POV switches? (pov_character_id)
```

**Story Analysis** (trope_scenes):
```
- Are we executing tropes effectively? (effectiveness_rating)
- Which element combinations work best? (scene_elements + rating)
- Are we subverting expectations? (variation_notes)
```

### 4. **Reusability**

- One scene can implement multiple tropes
- One trope can be tracked before scene exists
- Scenes can exist without trope tracking
- Trope planning doesn't require immediate writing

---

## Best Practices

### 1. Use `scene_elements` Consistently

**In chapter_scenes** - Reality:
```javascript
scene_elements: ["power_exchange", "telepathic_bonding"]
// What you ACTUALLY wrote
```

**In trope_scenes** - Expectation + Tracking:
```javascript
scene_elements: ["power_exchange", "telepathic_bonding", "blood_play"]
variation_notes: "Removed blood_play - too intense for Book 1"
// What you PLANNED vs what you DID
```

### 2. Link When Appropriate

Link `trope_scenes.scene_id` to `chapter_scenes.id` when:
- Scene is written and implements the trope
- You want to track effectiveness
- You're doing cross-server analysis

Don't link when:
- Still planning (scene not written)
- Scene exists but doesn't implement trope
- Doing high-level trope planning only

### 3. Use Filters Effectively

**Find unwritten work:**
```javascript
get_trope_scenes:
  instance_id: 5
  unwritten_only: true
```

**Analyze what's working:**
```javascript
get_trope_scenes:
  series_id: 1
  written_only: true
  kinks_filter: ["forensic_analysis"]
// See effectiveness_rating for all written investigation scenes
```

### 4. Track Variations

When actual differs from planned:
```javascript
trope_scenes:
  scene_elements: ["A", "B", "C"]        // Planned
  variation_notes: "Changed C to D because..."

chapter_scenes:
  scene_elements: ["A", "B", "D"]        // Actual
```

---

## Future Enhancements

Potential additions to strengthen the relationship:

### 1. Update Tool
```javascript
update_trope_scene:
  trope_scene_id: 123
  scene_id: 456              // Link to written scene
  effectiveness_rating: 9     // Rate after writing
  variation_notes: "..."      // Document changes
```

### 2. Sync Tool
```javascript
sync_scene_elements:
  scene_id: 456
  trope_scene_id: 123
  // Copies scene_elements from chapter_scenes to trope_scenes
  // Or suggests differences for variation_notes
```

### 3. Enhanced Queries
```javascript
get_trope_scenes:
  scene_id: 456              // Get all tropes for this scene
  effectiveness_min: 8        // Only highly effective scenes
  has_variations: true        // Only scenes with variation_notes
```

---

## Summary

**`chapter_scenes`** and **`trope_scenes`** are complementary systems:

- **chapter_scenes** = The manuscript reality (what you wrote)
- **trope_scenes** = The narrative plan (how tropes are executed)

They can work independently or together via `scene_id` foreign key.

Use both to:
✅ Plan story structure (Plot Server)
✅ Write engaging prose (Book Server)
✅ Track variations and effectiveness
✅ Analyze patterns across series
✅ Maintain consistency with world systems

This separation gives you flexibility while maintaining powerful cross-server analysis capabilities.
