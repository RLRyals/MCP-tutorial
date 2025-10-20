# World Systems vs World Elements - Database Relationship Update

## Summary of Changes

This document explains the relationship between `world_systems` and `world_elements` tables and the changes made to clarify their distinct purposes.

## Decision: Keep Separate Tables

After thorough analysis, we determined that `world_systems` and `world_elements` serve **fundamentally different purposes** and should remain separate tables with an optional foreign key relationship.

---

## Table Purposes

### `world_systems` (Plot Server)
**Purpose:** Define abstract FRAMEWORKS and RULESETS for how power/abilities work

**Use Cases:**
- Magic systems that govern how magic works universally
- Technology systems that define technological capabilities
- Power progression frameworks
- Supernatural/divine rule systems

**Key Characteristics:**
- Abstract and architectural
- Tracks character progression via `character_system_progression`
- JSONB `power_scaling` for flexible progression mechanics
- Array of `system_users` (character IDs who can use this system)
- Located in Plot Server (narrative/plot concerns)

**Example:** "Elemental Magic System" - defines how elemental magic works for all users

---

### `world_elements` (World Server)
**Purpose:** Define specific INSTANCES and COMPONENTS of the world

**Use Cases:**
- Specific spells, abilities, items
- Individual artifacts or technology devices
- Concrete manifestations with fixed properties
- Things that appear in specific story locations

**Key Characteristics:**
- Concrete and tangible
- Tracks story appearances via `world_element_usage` (WHERE it appears)
- Fixed `power_level` (1-10 scale)
- Has `rarity` and `cultural_impact` fields
- Located in World Server (world-building concerns)

**Example:** "Fire Blast Spell" - a specific spell that can be cast

---

## Database Changes Made

### Migration 019: Add Optional Foreign Key Relationship

**File:** `migrations/019_add_world_element_system_relationship.sql`

**Changes:**
```sql
-- Add system_id column to world_elements table
ALTER TABLE world_elements
ADD COLUMN system_id INTEGER REFERENCES world_systems(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_world_elements_system_id ON world_elements(system_id);
```

**Purpose:**
- Allows world_elements to optionally link to their parent world_system
- Example: "Fire Blast Spell" can link to "Elemental Magic System"
- Preserves existing data (all existing elements have `system_id = NULL`)
- Optional relationship - not all elements need a parent system

---

## MCP Handler Updates

### World Element Handlers (`src/mcps/world-server/handlers/world-element-handlers.js`)

**Tools Updated:**

1. **`create_world_element`**
   - Added `system_id` parameter (optional)
   - Links element to parent world_system
   - Displays parent system name in output

2. **`update_world_element`**
   - Added `system_id` parameter (optional)
   - Can add/change/remove system relationship

3. **`get_world_elements`**
   - Added `system_id` filter parameter
   - Can query all elements belonging to a specific system
   - Displays system name in results via LEFT JOIN

**Example Usage:**
```javascript
// Create a spell linked to a magic system
create_world_element({
  series_id: 1,
  name: "Fire Blast",
  element_type: "magic_system",
  description: "Projects concentrated fire in a directed blast",
  system_id: 5,  // Links to "Elemental Magic System"
  rarity: "common"
})

// Get all spells in a magic system
get_world_elements({
  series_id: 1,
  system_id: 5  // Get all elements in "Elemental Magic System"
})
```

---

## Documentation Updates

### Updated: `docs/AI_Writing_Team/plot_world_servers_guide.md`

**Key Additions:**

1. **Clear Decision Guide Table:**
   | Question | Answer → Tool |
   |----------|---------------|
   | "Am I defining HOW magic/tech works universally?" | YES → `define_world_system` (Plot Server) |
   | "Am I defining a specific spell/item/ability?" | YES → `create_world_element` (World Server) |
   | "Will characters progress through levels of this?" | YES → `define_world_system` (Plot Server) |
   | "Do I need to track WHERE this appears in the story?" | YES → `create_world_element` (World Server) |

2. **Usage Examples with system_id:**
   - Creating spells linked to magic systems
   - Creating tech devices linked to technology systems
   - Standalone elements (no parent system)

3. **Integration Flow Examples:**
   ```
   1. define_world_system: "Elemental Magic" → system_id: 5
   2. create_world_element: "Fire Blast" with system_id: 5
   3. create_world_element: "Water Shield" with system_id: 5
   4. track_system_progression: Character advances in system 5
   5. track_element_usage: Character uses "Fire Blast" in chapter 12
   ```

4. **Updated "Remember" Section:**
   - Clear distinction between FRAMEWORKS (world_systems) and INSTANCES (world_elements)
   - When to use each tool
   - How they relate via `system_id`

---

## Load Series Data Updates

### Updated: `src/shared/load-series-data.js`

**Cheat Sheet Enhancements:**

1. **World Systems Section:**
   - Added note: "*Frameworks & Rulesets (Use define_world_system in Plot Server)*"
   - Lists all systems with IDs

2. **New World Elements Section:**
   - Added note: "*Specific Instances (Use create_world_element in World Server)*"
   - Groups elements by parent system
   - Shows standalone elements separately
   - Includes rarity tags

**Example Output:**
```markdown
## World Systems
*Frameworks & Rulesets (Use define_world_system in Plot Server)*
- **Elemental Magic System** (ID: 5) - magic

## World Elements
*Specific Instances (Use create_world_element in World Server)*
### Elements in "Elemental Magic System" (System ID: 5)
- **Fire Blast** (ID: 42) - magic_system [common]
- **Water Shield** (ID: 43) - magic_system [uncommon]
### Standalone Elements
- **Ancient Prophecy Scroll** (ID: 99) - supernatural [legendary]
```

---

## Field Comparison

### Overlapping Fields (Intentional)

These fields exist in both tables but serve different purposes:

| Field | world_systems | world_elements | Notes |
|-------|---------------|----------------|-------|
| `power_source` | System-wide source | Element-specific source | Can differ - element may specify details |
| `limitations` | System limitations | Element-specific limits | Element inherits system limits + its own |
| `rules` / `system_rules` | System-wide rules | Element-specific rules | Element follows system rules + its own |
| `access_method` | General access pattern | Specific access method | Element specifies how THIS instance is used |

### Unique to world_systems

- `power_scaling` (JSONB) - Flexible progression mechanics
- `system_users` (INTEGER[]) - Character IDs who can use system
- Tracked via `character_system_progression` table

### Unique to world_elements

- `rarity` - How common/rare this specific instance is
- `power_level` (1-10) - Fixed power level for this instance
- `cultural_impact` - How this specific element affects society
- `system_id` - **NEW!** Link to parent world_system
- Tracked via `world_element_usage` table (WHERE it appears)

---

## Benefits of This Approach

1. **Clear Separation of Concerns:**
   - Plot Server handles narrative frameworks and character progression
   - World Server handles concrete world inventory and story tracking

2. **Flexible Relationships:**
   - Elements can belong to systems (linked via `system_id`)
   - Elements can be standalone (ancient artifacts, unique items)
   - One system can have many elements

3. **No Data Loss:**
   - All existing data preserved
   - New column is optional (nullable)
   - Backward compatible

4. **Better Organization:**
   - Query all spells in a magic system
   - Track which systems characters use
   - Track where specific elements appear in story
   - Cheat sheets group elements by parent system

5. **LLM Clarity:**
   - Updated guide makes it crystal clear when to use which tool
   - Decision table removes ambiguity
   - Examples show proper usage patterns

---

## Migration Checklist

- [x] Created Migration 019
- [x] Ran migration successfully
- [x] Updated world-element-handlers.js
  - [x] Added system_id to create_world_element
  - [x] Added system_id to update_world_element
  - [x] Added system_id filter to get_world_elements
  - [x] Display parent system name in outputs
- [x] Updated plot_world_servers_guide.md
  - [x] Added CRITICAL DISTINCTION section
  - [x] Added decision guide table
  - [x] Added system_id examples
  - [x] Updated integration flows
  - [x] Updated "Remember" section
- [x] Updated load-series-data.js
  - [x] Added world_elements section to cheat sheet
  - [x] Group elements by parent system
  - [x] Show system relationships clearly

---

## For Users

**No breaking changes!**
- All existing data works exactly as before
- Existing elements have `system_id = NULL` (standalone)
- You can start using `system_id` in new elements whenever you want
- The LLM guide now clearly explains when to use each tool

**Next Steps:**
1. Review the updated [plot_world_servers_guide.md](AI_Writing_Team/plot_world_servers_guide.md)
2. When creating new elements, consider linking them to parent systems
3. Use `get_world_elements` with `system_id` filter to query by system
4. ID cheat sheets now show element/system relationships automatically

---

## Questions?

Refer to:
- [plot_world_servers_guide.md](AI_Writing_Team/plot_world_servers_guide.md) - Full usage guide
- Migration 019 - Database changes
- This document - Conceptual overview

**Key Principle:** If you're defining "how it works," use `define_world_system`. If you're defining "a specific thing," use `create_world_element`.
