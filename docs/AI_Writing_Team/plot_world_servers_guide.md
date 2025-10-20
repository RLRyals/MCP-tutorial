# Plot, Relationship & World Servers Guide
## Universal Genre Framework + World Building

---

## Part 1: Plot Server - Information Reveals & World Systems

### Core Philosophy

The Plot Server uses **universal tools that work across ALL genres** by focusing on what stories actually do, not genre conventions.

Two universal patterns:
1. **Information Reveals** - ANY information disclosed (clues, secrets, backstory, rules)
2. **World Systems** - ANY rule-based system (magic, tech, political, supernatural)

**Note:** Relationship tracking has been moved to the dedicated Relationship Server (see Part 2).

---

## Plot Thread Tools

### `create_plot_thread`
**When to use:** Starting any storyline (main plot, subplot, character arc)

**Parameters:**
- `series_id` (required)
- `title` (required) - thread name
- `description` (required) - what this thread is about
- `thread_type` (optional) - use `get_available_options` for valid values
- `importance_level` (optional) - 1-10 scale
- `complexity_level` (optional) - 1-10 scale
- `start_book` (optional) - book number where it begins
- `end_book` (optional) - book number where it resolves
- `parent_thread_id` (optional) - for sub-threads
- `related_characters` (optional) - array of character IDs

**Example - Mystery Main Thread:**
```
create_plot_thread:
  series_id: 1
  title: "Murder at the Royal Gala"
  description: "Detective Morgan investigates the death of Duke Ashford"
  thread_type: "investigation"
  importance_level: 10
  start_book: 2
  related_characters: [1, 5, 8]
```

**Returns:** thread_id (ADD TO ID CHEAT SHEET)

---

### `update_plot_thread` / `resolve_plot_thread` / `get_plot_threads`
Standard CRUD operations for managing plot threads across the series.

**Note:** For valid `thread_type` values, use the metadata-server's `get_available_options` tool with `option_type: "plot_thread_types"`.

---

## Universal Information Reveals

### Core Concept
**ANY information disclosed = information reveal**

Works for:
- Mystery: clues, evidence, alibis
- Romance: secrets, past relationships
- Fantasy: world rules, prophecies, lore
- Thriller: conspiracies, motives
- Any genre: backstory, character history

### `create_information_reveal`
**When to use:** ANY TIME information is disclosed to characters or readers

**Parameters:**
- `plot_thread_id` (required) - which thread this relates to
- `reveal_type` (required) - "evidence", "secret", "backstory", "world_rule", "relationship", "skill"
- `information_content` (required) - what is revealed
- `reveal_method` (required) - "discovered", "confessed", "witnessed", "deduced"
- `significance_level` (required) - "minor", "major", "climactic", "world_changing"
- `affects_characters` (optional) - array of character IDs who learn this
- `revealed_in_chapter` (optional) - where it happens
- `consequences` (optional) - what happens as result
- `foreshadowing_chapters` (optional) - array of chapters where hinted

**Genre Examples:**

**Mystery - Evidence:**
```
create_information_reveal:
  plot_thread_id: 5
  reveal_type: "evidence"
  information_content: "Silver dust found at crime scene matches dust from suspect's workshop"
  reveal_method: "discovered"
  significance_level: "major"
  affects_characters: [1, 3]
  revealed_in_chapter: 12
  consequences: "Narrows suspect list to three people"
```

**Romance - Secret:**
```
create_information_reveal:
  plot_thread_id: 8
  reveal_type: "secret"
  information_content: "Marcus was previously engaged to protagonist's sister"
  reveal_method: "confessed"
  significance_level: "climactic"
  affects_characters: [2]
  revealed_in_chapter: 18
  consequences: "Relationship crisis, trust broken"
```

**Fantasy - World Rule:**
```
create_information_reveal:
  plot_thread_id: 3
  reveal_type: "world_rule"
  information_content: "Iron disrupts all fae magic permanently"
  reveal_method: "witnessed"
  significance_level: "world_changing"
  affects_characters: [1, 4, 7]
  revealed_in_chapter: 8
  consequences: "Changes battle strategy, enables defeating fae lord"
  foreshadowing_chapters: [3, 5]
```

**Integration with Character Server:**
After creating reveal, immediately add knowledge to affected characters:
```
For each character_id in affects_characters:
  add_character_knowledge_with_chapter:
    character_id: X
    knowledge_category: matches reveal_type
    knowledge_item: information_content
    learned_chapter_id: revealed_in_chapter
```

---

### `add_reveal_evidence`
**When to use:** Adding supporting evidence to a reveal

**Parameters:**
- `reveal_id` (required)
- `evidence_type` (required) - "physical", "witness", "circumstantial", "digital", "forensic"
- `evidence_description` (required)
- `discovered_by` (optional) - character ID
- `discovery_chapter` (optional)
- `significance` (optional) - "critical", "important", "supporting", "red_herring"

**Mystery Usage:**
```
add_reveal_evidence:
  reveal_id: 15
  evidence_type: "physical"
  evidence_description: "Bloodstained handkerchief with suspect's initials"
  discovered_by: 1
  discovery_chapter: 14
  significance: "critical"
```

---

## Part 2: Relationship Server - Character Relationships & Dynamics

### Core Concept
**ANY relationship development = relationship arc**

The Relationship Server has been separated from the Plot Server to provide dedicated tracking for all character relationships across all genres.

Works for:
- Romance: romantic relationships (any configuration)
- All genres: family, friendship, professional, antagonistic, mentor, political alliances

### `create_relationship_arc`
**When to use:** Tracking ANY relationship development

**Parameters:**
- `plot_thread_id` (required) - associated plot thread
- `arc_name` (required) - descriptive name
- `participants` (required) - array of objects with character_id and role_in_relationship
- `relationship_type` (required) - "romantic", "family", "friendship", "professional", "antagonistic", "mentor", "alliance"
- `current_dynamic` (optional) - current stage/state
- `development_factors` (optional) - array of what drives development
- `complexity_level` (optional) - 1-10

**Participant Roles:**
- "primary" - main participants
- "secondary" - involved but not central
- "catalyst" - triggers changes
- "observer" - witnesses/affects

**Examples:**

**Romance - Traditional:**
```
create_relationship_arc:
  plot_thread_id: 10
  arc_name: "Morgan and Alex Romance"
  participants: [
    {character_id: 1, role_in_relationship: "primary", character_name: "Morgan"},
    {character_id: 2, role_in_relationship: "primary", character_name: "Alex"}
  ]
  relationship_type: "romantic"
  current_dynamic: "enemies to lovers - currently hostile"
  complexity_level: 8
```

**Romance - Love Triangle:**
```
create_relationship_arc:
  plot_thread_id: 11
  arc_name: "Sarah-Marcus-Devon Triangle"
  participants: [
    {character_id: 3, role_in_relationship: "primary", character_name: "Sarah"},
    {character_id: 4, role_in_relationship: "primary", character_name: "Marcus"},
    {character_id: 5, role_in_relationship: "catalyst", character_name: "Devon"}
  ]
  relationship_type: "romantic"
  complexity_level: 9
```

**Political Alliance:**
```
create_relationship_arc:
  plot_thread_id: 12
  arc_name: "Northern Kingdoms Alliance"
  participants: [
    {character_id: 6, role_in_relationship: "primary", character_name: "Queen Elara"},
    {character_id: 7, role_in_relationship: "primary", character_name: "King Theron"},
    {character_id: 8, role_in_relationship: "primary", character_name: "Duke Ashford"},
    {character_id: 9, role_in_relationship: "catalyst", character_name: "Ambassador Chen"}
  ]
  relationship_type: "alliance"
  complexity_level: 7
```

---

### `track_relationship_dynamics`
**When to use:** Recording relationship changes

**Parameters:**
- `arc_id` (required)
- `dynamic_change` (required) - description of change
- `change_type` (required) - "emotional", "power", "trust", "commitment", "conflict"
- `chapter_id` (optional)
- `scene_id` (optional)
- `tension_change` (optional) - -10 to +10
- `trigger_event` (optional) - what caused change

**Romance Example:**
```
track_relationship_dynamics:
  arc_id: 10
  dynamic_change: "First kiss after saving each other's lives"
  change_type: "emotional"
  chapter_id: 15
  tension_change: +5
  trigger_event: "Near-death experience creates vulnerability"
```

**Political Example:**
```
track_relationship_dynamics:
  arc_id: 12
  dynamic_change: "Alliance weakened by trade dispute"
  change_type: "trust"
  chapter_id: 20
  tension_change: -3
  trigger_event: "King Theron breaks tariff agreement"
```

---

### `get_relationship_arc` / `list_relationship_arcs`
Query specific relationship arcs or list all arcs with optional filtering by plot thread or relationship type.

### `get_relationship_timeline`
**When to use:** Viewing complete history of relationship dynamics changes

**Parameters:**
- `arc_id` (required)

**Returns:** Complete timeline of all dynamics changes with details

---

## Part 3: Plot Server - World Systems

### Core Concept
**ANY rule-based FRAMEWORK = world system**

**CRITICAL DISTINCTION: World Systems vs World Elements**

Use **`define_world_system`** (Plot Server) for:
- **FRAMEWORKS & RULESETS** - The abstract system that governs how things work
- **CHARACTER PROGRESSION** - Systems that characters advance through
- **Universal mechanics** - Rules that apply to multiple users/instances
- Examples: "Elemental Magic System", "Psionic Network", "Divine Favor System"

Use **`create_world_element`** (World Server) for:
- **SPECIFIC INSTANCES** - Individual manifestations of power/technology
- **STORY TRACKING** - Tracking WHERE elements appear in narrative
- **Concrete objects/abilities** - Tangible things with fixed properties
- Examples: "Fire Blast Spell", "Ancient Sword", "Healing Potion", "FTL Drive"

**Relationship Between Them:**
- World Elements can optionally belong to a World System (using `system_id` parameter)
- Example: "Fire Blast Spell" (world_element) belongs to "Elemental Magic System" (world_system)
- Example: "Plasma Rifle" (world_element) belongs to "Energy Weapons System" (world_system)

Works for:
- Fantasy: magic systems (frameworks) and specific spells/items (elements)
- Sci-Fi: technology systems (frameworks) and specific devices (elements)
- All genres: political structures, social hierarchies, supernatural rules

### `define_world_system`
**When to use:** Establishing the FRAMEWORK for how a type of power/ability works

**Parameters:**
- `series_id` (required)
- `system_name` (required)
- `system_type` (required) - "magic", "psionics", "technology", "divine", "supernatural", "mutation", "alchemy"
- `power_source` (required) - what fuels it
- `access_method` (required) - how beings use it
- `limitations` (optional) - array of constraints
- `system_rules` (optional) - array of governing rules
- `power_scaling` (optional) - object describing progression

**Examples:**

**Fantasy Magic:**
```
define_world_system:
  series_id: 1
  system_name: "Elemental Binding Magic"
  system_type: "magic"
  power_source: "Binding true names of elements"
  access_method: "Spoken incantations using true names"
  limitations: [
    "Must know element's true name",
    "Iron disrupts all magic",
    "Cannot bind living beings",
    "Physical exhaustion after use"
  ]
  system_rules: [
    "Power proportional to knowledge of true names",
    "More specific names = more control",
    "Elements resist hostile binding",
    "Cannot break natural laws (only bend them)"
  ]
  power_scaling: {
    lowest_level: "Single element manipulation",
    highest_level: "Weather control, earthquake generation",
    progression_method: "Learning more true names through study/discovery"
  }
```

**Romance - Supernatural Mate Bond:**
```
define_world_system:
  series_id: 2
  system_name: "Fated Mate Bond"
  system_type: "supernatural"
  power_source: "Supernatural fate/destiny"
  access_method: "Automatic on first meeting between fated pairs"
  limitations: [
    "Can be rejected by either party",
    "Rejection causes physical weakness",
    "Rejection causes magic loss",
    "Effects permanent unless bond accepted"
  ]
  system_rules: [
    "Bond forms automatically at first meeting",
    "Creates bidirectional awareness (location sense)",
    "Intensifies attraction between bonded pair",
    "Cannot be forced or faked"
  ]
```

**Sci-Fi Technology:**
```
define_world_system:
  series_id: 3
  system_name: "Quantum Entanglement Communication"
  system_type: "technology"
  power_source: "Quantum paired particles"
  access_method: "Specialized quantum comm devices"
  limitations: [
    "Requires pre-paired particles",
    "Limited number of particle pairs",
    "Expensive to create pairs",
    "Devices are fragile"
  ]
  system_rules: [
    "Instantaneous communication across any distance",
    "Cannot be intercepted or jammed",
    "One-to-one communication only",
    "Destroying one device breaks the pair permanently"
  ]
```

---

### `track_system_progression`
**When to use:** Recording character advancement in a system

**Parameters:**
- `character_id` (required)
- `system_id` (required)
- `book_id` (required)
- `current_power_level` (required) - 1-10
- `progression_method` (required) - how they gained power
- `chapter_id` (optional)
- `cost_or_sacrifice` (optional) - what they gave up

**Example:**
```
track_system_progression:
  character_id: 1
  system_id: 5
  book_id: 2
  current_power_level: 6
  progression_method: "Discovered true name of fire through near-death experience"
  chapter_id: 18
  cost_or_sacrifice: "Permanent burn scars on hands"
```

---

## Part 4: World Server

### Purpose
Manages locations, world elements (magic/tech systems), and organizations. Tracks physical and social structures of your world.

---

## Location Tools

### `create_location`
**When to use:** Establishing any setting in your world

**Parameters:**
- `series_id` (required)
- `name` (required)
- `location_type` (required) - "city", "forest", "building", "region", "landmark", etc.
- `description` (optional)
- `parent_location_id` (optional) - for nested locations
- `climate` (optional)
- `terrain` (optional)
- `notable_features` (optional) - array
- `atmosphere` (optional) - mood/feeling

**Example - Nested Locations:**
```
1. create_location: "Aethermoor City" (location_id: 10)
2. create_location: "The Royal District" (parent_location_id: 10)
3. create_location: "Palace Throne Room" (parent_location_id: 11)
```

**Example - Full Location:**
```
create_location:
  series_id: 1
  name: "The Whispering Woods"
  location_type: "forest"
  description: "Ancient forest where trees have silver bark and whisper secrets"
  climate: "temperate, misty"
  terrain: "dense forest, rolling hills"
  notable_features: ["silver-barked trees", "whispering sounds", "ancient ruins"]
  atmosphere: "mysterious, slightly unsettling, beautiful"
```

---

### `track_location_usage`
**When to use:** Recording where scenes occur

**Parameters:**
- `location_id` (required)
- `book_id` (required)
- `chapter_id` (optional)
- `usage_notes` (optional)

**Why Track:**
- Enables consistency checking
- Prevents contradictory descriptions
- Tracks which locations are important to story

---

## World Element Tools

### `create_world_element`
**When to use:** Creating SPECIFIC INSTANCES of world components (spells, items, artifacts, abilities)

**IMPORTANT: This is for INSTANCES, not FRAMEWORKS**
- Use this for: "Fire Blast Spell", "Ancient Sword", "Healing Potion"
- NOT for: "Elemental Magic System" - use `define_world_system` instead
- Link instances to their parent system using the `system_id` parameter

**Parameters:**
- `series_id` (required)
- `name` (required) - name of the specific instance
- `element_type` (required) - "magic_system", "technology", "natural_law", "supernatural", "divine", "psionic"
- `description` (required) - what this specific instance does
- `system_id` (optional) - **NEW!** Link to parent world_system (e.g., link "Fire Blast" to "Elemental Magic" system)
- `power_source` (optional)
- `limitations` (optional) - array of constraints for THIS instance
- `rules` (optional) - array of rules for THIS instance
- `access_method` (optional) - how THIS instance is used
- `rarity` (optional) - "common", "uncommon", "rare", "legendary"
- `cultural_impact` (optional)

**Decision Guide:**

| Question | Answer → Tool |
|----------|---------------|
| "Am I defining HOW magic/tech works universally?" | YES → `define_world_system` (Plot Server) |
| "Am I defining a specific spell/item/ability?" | YES → `create_world_element` (World Server) |
| "Will characters progress through levels of this?" | YES → `define_world_system` (Plot Server) |
| "Do I need to track WHERE this appears in the story?" | YES → `create_world_element` (World Server) |

**Examples with system_id:**

**Creating a spell that belongs to a magic system:**
```
# First, define the system (if not already created)
define_world_system:
  series_id: 1
  system_name: "Elemental Magic System"
  system_type: "magic"
  ...
# Returns: system_id: 5

# Then create specific spells linked to that system
create_world_element:
  series_id: 1
  name: "Fire Blast"
  element_type: "magic_system"
  description: "Projects concentrated fire in a directed blast"
  system_id: 5  # Links to Elemental Magic System
  rarity: "common"
  power_source: "Channeled mana through fire element binding"
  limitations: ["Requires line of sight", "Drains mana quickly"]

create_world_element:
  series_id: 1
  name: "Water Shield"
  element_type: "magic_system"
  description: "Creates protective barrier of flowing water"
  system_id: 5  # Same parent system
  rarity: "uncommon"
```

**Creating technology that belongs to a tech system:**
```
# Define the system
define_world_system:
  series_id: 2
  system_name: "Quantum Drive Technology"
  system_type: "technology"
  ...
# Returns: system_id: 8

# Create specific devices
create_world_element:
  series_id: 2
  name: "Mark VII Quantum Engine"
  element_type: "technology"
  description: "Ship propulsion system using quantum entanglement"
  system_id: 8  # Links to Quantum Drive Technology
  rarity: "rare"
  limitations: ["Requires exotic matter fuel", "3-hour cooldown between jumps"]
```

**Standalone element (no parent system):**
```
create_world_element:
  series_id: 1
  name: "Ancient Prophecy Scroll"
  element_type: "supernatural"
  description: "Scroll containing predictions about the Chosen One"
  rarity: "legendary"
  # No system_id - this is a unique artifact
```

---

### `track_element_usage`
**When to use:** Recording WHERE a specific world element appears/is used in the story

**Parameters:**
- `element_id` (required) - the world_element being used
- `book_id` (required)
- `chapter_id` (optional)
- `usage_notes` (optional) - describe how it was used
- `power_level` (optional) - 1-10 for power demonstrated

**Example:**
```
track_element_usage:
  element_id: 42  # Fire Blast spell
  book_id: 2
  chapter_id: 15
  usage_notes: "Protagonist uses Fire Blast to destroy the corrupted tree"
  power_level: 7
```

### `get_world_elements`
**When to use:** Querying world elements with filtering

**Parameters:**
- `series_id` (optional) - filter by series
- `element_type` (optional) - filter by type
- `rarity` (optional) - filter by rarity
- `search_term` (optional) - search in name/description
- `system_id` (optional) - **NEW!** Get all elements belonging to a specific world_system

**Example - Get all spells in a magic system:**
```
get_world_elements:
  series_id: 1
  system_id: 5  # Get all elements linked to "Elemental Magic System"
```

### `update_world_element`
**When to use:** Modifying an existing world element

**Parameters:**
- `element_id` (required)
- `system_id` (optional) - **NEW!** Link/unlink from parent world_system
- All other fields from `create_world_element` are optional for updating

---

## Organization Tools

### `create_organization`
**When to use:** Creating guilds, governments, factions, power structures

**Parameters:**
- `series_id` (required)
- `name` (required)
- `organization_type` (required) - "guild", "government", "military", "religious", "academic", "criminal", "merchant", "secret_society"
- `description` (required)
- `purpose` (optional)
- `power_level` (optional) - 1-10 influence scale
- `headquarters_location_id` (optional)
- `leadership_structure` (optional)
- `membership_requirements` (optional) - array
- `resources` (optional) - array
- `allies` (optional) - array of organization IDs
- `enemies` (optional) - array of organization IDs
- `status` (optional) - "active", "disbanded", "weakened", "growing", "unknown"

**Example - Criminal Guild:**
```
create_organization:
  series_id: 1
  name: "The Shadow Syndicate"
  organization_type: "criminal"
  description: "Underground thieves guild controlling city's black market"
  purpose: "Control illegal trade, protect member thieves"
  power_level: 7
  headquarters_location_id: 15
  leadership_structure: "Council of five master thieves"
  membership_requirements: ["Proven theft skill", "Sponsorship by current member", "Complete initiation heist"]
  resources: ["Network of fences", "Safe houses throughout city", "Corrupt guard contacts"]
  enemies: [12, 18]
  status: "active"
```

---

### `track_organization_activity`
**When to use:** Recording organization involvement in story

**Parameters:**
- `organization_id` (required)
- `book_id` (required)
- `activity_type` (required) - "meeting", "conflict", "recruitment", "mission", "politics"
- `chapter_id` (optional)
- `activity_notes` (optional)
- `involved_characters` (optional) - array of character IDs

---

## Integration Patterns

### Plot Server → Character Server
```
create_information_reveal (affects_characters: [1, 2, 3])
    ↓
For each character in affects_characters:
    add_character_knowledge_with_chapter
```

### Relationship Server → Character Server
```
create_relationship_arc (participants: [1, 2])
    ↓
track_relationship_dynamics (chapter-specific changes)
    ↓
Character presence and knowledge updated
```

### Plot Server → World Server
```
define_world_system (magic/tech framework)
    ↓
create_world_element (specific spells/items, with system_id link)
    ↓
track_system_progression (character learns/uses the system)
    ↓
track_element_usage (specific element used in story)
```

**Example Flow - Magic System:**
```
1. define_world_system: "Elemental Magic" → system_id: 5
2. create_world_element: "Fire Blast" with system_id: 5
3. create_world_element: "Water Shield" with system_id: 5
4. track_system_progression: Character advances to level 6 in system 5
5. track_element_usage: Character uses "Fire Blast" in chapter 12
```

### World Server → Character Server
```
create_location (establish setting)
    ↓
track_location_usage (scene occurs here)
    ↓
track_character_presence (character in this chapter)
    ↓
Character can reference location knowledge
```

### World Server → Plot Server
```
create_organization
    ↓
Organization members = characters
    ↓
create_relationship_arc (organizational relationships)
```

---

## Common Workflows

### Mystery - Evidence Chain
1. **Plot Server:** `create_plot_thread` - investigation
2. **Plot Server:** `create_information_reveal` - each clue
3. **Plot Server:** `add_reveal_evidence` - supporting evidence
4. **Character Server:** `add_character_knowledge` - who discovered it
5. Track progression toward solution

### Romance - Relationship Development
1. **Plot Server:** `create_plot_thread` - romantic subplot
2. **Relationship Server:** `create_relationship_arc` - the relationship
3. **Relationship Server:** `track_relationship_dynamics` - each significant moment
4. **Plot Server:** `create_information_reveal` - secrets disclosed
5. **Relationship Server:** `get_relationship_timeline` - view progression

### Fantasy - World Building
1. **Plot Server:** `define_world_system` - magic framework (e.g., "Elemental Magic System")
2. **World Server:** `create_world_element` - specific spells (e.g., "Fire Blast", system_id links to step 1)
3. **World Server:** `create_location` - important places
4. **World Server:** `create_organization` - power structures
5. **Plot Server:** `track_system_progression` - character advancement in the magic system
6. **World Server:** `track_element_usage` - where specific spells/items were used

---

## Remember

**Three-Server Framework:**
- **Plot Server:** Plot threads, information reveals, world systems (FRAMEWORKS)
- **Relationship Server:** All relationship types and dynamics tracking
- **World Server:** Locations, world elements (INSTANCES), organizations

**Universal Framework means:**
- Same tools work for mystery clues and romance secrets
- Same tools track magic systems and political structures
- Dedicated server manages ALL relationship types (romantic, family, political, etc.)

**Focus on what's actually happening:**
- Information being revealed (Plot Server)
- Relationships developing (Relationship Server)
- Systems with rules (Plot/World Servers)

**KEY DISTINCTION - World Systems vs World Elements:**
- **`define_world_system`** (Plot Server) = The FRAMEWORK/RULESET (e.g., "Elemental Magic System")
  - Use for: Character progression, universal mechanics, abstract systems
  - Tracks: System rules, power scaling, who can use it

- **`create_world_element`** (World Server) = The SPECIFIC INSTANCE (e.g., "Fire Blast Spell")
  - Use for: Individual spells/items/abilities, story tracking, tangible objects
  - Tracks: WHERE element appears, usage frequency, rarity
  - Can link to parent system via `system_id` parameter

This separation makes each server more focused and powerful while maintaining universal genre support.