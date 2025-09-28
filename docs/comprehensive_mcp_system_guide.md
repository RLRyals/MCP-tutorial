# Comprehensive MCP System Guide: Tools, Dramatica Integration & Universal Language
## Complete Technical Documentation for AI Writing Teams

---

# SYSTEM ARCHITECTURE OVERVIEW

## Core Components Integration:
- **Universal Genre Language** - Field names that work across all genres
- **Dramatica Framework** - Four throughlines for complete story structure
- **Plot Thread System** - Flexible story arc management across throughlines
- **Trope Implementation** - Genre patterns with scene-level execution
- **World System Tracking** - Rule-based supernatural/technological progression
- **Scene Management** - Granular building blocks with intensity tracking

---

# DRAMATICA THROUGHLINES INTEGRATION

## The Four Throughlines:

### Main Character (MC) Throughline
**Focus**: Protagonist's internal journey and personal problem-solving approach
**MCP Tools**:
- `track_character_throughlines` with `throughline_type: "main_character"`
- Character knowledge tracking for MC's learning/growth
- Scene emotional arcs for MC's internal development
- System progression for MC's ability/power growth

**Universal Language Fields**:
- `character_problem` - MC's core internal conflict
- `character_solution` - How MC attempts to resolve their problem  
- `character_arc` - MC's transformation journey

### Influence Character (IC) Throughline  
**Focus**: Character who challenges the MC's approach and worldview
**MCP Tools**:
- `track_character_throughlines` with `throughline_type: "influence_character"`
- Character relationship arcs between MC and IC
- Information reveals driven by IC's challenges to MC
- Scene dynamics showing IC's impact on MC

**Universal Language Fields**:
- `character_problem` - IC's contrasting approach to problems
- `character_solution` - How IC demonstrates alternative methods
- `character_arc` - How IC grows through influence relationship

### Relationship (RS) Throughline
**Focus**: The dynamic between MC and IC, their growing/changing relationship
**MCP Tools**:
- `create_relationship_arc` specifically for MC-IC relationship
- `track_relationship_dynamics` for tension/growth progression
- Scene emotional tracking for relationship moments
- Plot threads focused on relationship development

**Universal Language Fields**:
- `relationship_type` - Nature of MC-IC connection
- `current_dynamic` - Current state of their relationship
- `development_factors` - What drives their relationship changes

### Objective Story (OS) Throughline
**Focus**: External plot, what everyone is trying to achieve collectively
**MCP Tools**:
- `create_plot_thread` for main story objectives
- `information_reveals` for plot advancement
- Timeline events for external story progression
- World system tracking for external challenges

**Universal Language Fields**:
- `story_concern` - What the overall story is about
- `story_outcome` - Success/failure of external goal
- `story_judgment` - Whether outcome feels satisfying

---

# PLOT THREAD SYSTEM INTEGRATION

## Plot Threads Across Throughlines:

### MC Plot Threads
**Examples**: 
- Character's skill development arc
- Internal healing/trauma recovery
- Personal goal achievement
- Power/ability mastery

**MCP Implementation**:
```sql
CREATE plot_thread: 
thread_type = "character_development"
related_characters = [MC_id]
throughline_focus = "main_character"
```

### IC Plot Threads  
**Examples**:
- Mentor's teaching arc
- Antagonist's corruption journey
- Love interest's parallel growth
- Challenger's philosophy demonstration

### RS Plot Threads
**Examples**:
- Romance development
- Friendship building/testing
- Family reconciliation
- Mentor-student relationship evolution

### OS Plot Threads
**Examples**:
- Save the world mission
- Solve the mystery case  
- Political revolution
- Scientific discovery quest

## Cross-Throughline Plot Thread Relationships:
```sql
-- Plot threads can link across throughlines
CREATE plot_thread_relationship:
source_thread_id = MC_trauma_healing
target_thread_id = RS_trust_building  
relationship_type = "drives"
-- MC's healing enables relationship trust
```

---

# TROPE SYSTEM INTEGRATION

## Tropes Spanning Multiple Throughlines:

### Romance Tropes
**Enemies to Lovers**:
- **OS**: External conflict forcing cooperation
- **RS**: Relationship progression from hostility to love  
- **MC**: Learning to trust/be vulnerable
- **IC**: Challenging MC's defensive walls

**MCP Implementation**:
```sql
-- Trope definition spans multiple throughlines
CREATE trope: "Enemies to Lovers"
trope_category = "romance_trope"

-- Scene types across throughlines  
Scene Type 1 (OS): "Forced Cooperation" - external mission requires teamwork
Scene Type 2 (RS): "Vulnerable Moment" - defenses come down temporarily  
Scene Type 3 (MC): "Trust Decision" - MC chooses to believe in IC
Scene Type 4 (RS): "Emotional Confession" - feelings acknowledged
Scene Type 5 (OS): "United Front" - working together against external threat
```

### Mystery Tropes
**Red Herring Suspect**:
- **OS**: Investigation follows false lead
- **MC**: Detective's deduction process misled
- **IC**: Real killer manipulates investigation
- **RS**: Trust between detective and partner tested

### Fantasy Tropes  
**Chosen One**:
- **OS**: Prophecy must be fulfilled to save world
- **MC**: Accepting destiny vs. wanting normal life
- **IC**: Mentor guides/challenges chosen one's growth
- **RS**: Relationship strained by special destiny burden

## Trope Scene Implementation:
```sql
-- Each trope scene connects to specific throughline focus
CREATE trope_scene:
instance_id = enemies_to_lovers_book2
scene_id = chapter15_scene3  
throughline_focus = "relationship" -- This scene advances RS
scene_elements = ["vulnerable_confession", "physical_proximity", "emotional_breakthrough"]
effectiveness_rating = 9
```

---

# WORLD SYSTEM PROGRESSION INTEGRATION

## Systems Across Throughlines:

### MC-Focused Systems
**Power/Ability Progression**:
- Magic mastery, skill development, psychological healing
- Tracks MC's growing capabilities through series
- Connected to character throughline development

### OS-Focused Systems  
**World Rule Systems**:
- Magic systems, technology rules, political structures
- External systems that all characters must work within
- Connected to objective story challenges and limitations

### RS-Focused Systems
**Relationship Enhancement Systems**:
- Mate bonds, psychic connections, shared power
- Systems that specifically enhance character relationships
- Connected to relationship throughline development

**MCP Implementation Example**:
```sql
-- Vampire bonding system affects multiple throughlines
CREATE world_system: "Vampire Blood Bonds"
system_type = "supernatural"
throughline_impact = ["main_character", "relationship"] 

-- MC progression in bonding system
TRACK system_progression:
character_id = MC
system_id = vampire_bonds
current_power_level = 7 -- affects MC's abilities (MC throughline)
progression_method = "deeper_emotional_trust" -- affects relationship (RS throughline)
```

---

# SCENE MANAGEMENT WITH THROUGHLINE FOCUS

## Scene Creation with Throughline Awareness:

### Throughline-Focused Scenes:
```sql
CREATE scene:
scene_purpose = "advance_relationship_trust" -- RS throughline focus
intensity_level = 8
emotional_impact = "vulnerability_breakthrough"  
throughline_advancement = "relationship" -- primary throughline served
secondary_throughlines = ["main_character"] -- also advances MC growth
```

### Multi-Throughline Scenes:
High-impact scenes often advance multiple throughlines simultaneously:
- **Climax scenes** - All four throughlines converge
- **Major revelation scenes** - OS info reveal affects MC/IC/RS dynamics
- **Relationship milestones** - RS advancement affects MC/IC growth

---

# INFORMATION REVEAL SYSTEM WITH THROUGHLINES

## Information Types by Throughline:

### MC Information Reveals
**Character learns about themselves**:
- Hidden heritage, suppressed memories, true nature
- Internal realizations about fears, desires, capabilities

### IC Information Reveals  
**About the influence character**:
- IC's backstory, motivations, hidden connections
- Why IC challenges MC in specific ways

### RS Information Reveals
**About the relationship**:
- Shared history, destined connections, relationship rules
- What the relationship means for both characters

### OS Information Reveals
**About the external plot**:
- Mystery clues, world-building rules, external threats
- Information that advances the main plot

**MCP Implementation**:
```sql
CREATE information_reveal:
reveal_type = "character_heritage" 
information_content = "MC discovers they're half-fae royalty"
throughline_impact = ["main_character", "objective_story"]
-- Affects MC's identity AND external political situation
```

---

# UNIVERSAL LANGUAGE FIELD USAGE

## Core Universal Fields and Throughline Applications:

### intensity_level (1-10)
- **MC scenes**: Internal emotional intensity, breakthrough moments
- **IC scenes**: Challenge/influence strength, confrontation power  
- **RS scenes**: Relationship tension, intimacy, emotional stakes
- **OS scenes**: External action, plot advancement, world stakes

### agency_dynamic  
- **MC**: Character's sense of control/power in situation
- **IC**: How IC influences or challenges MC's agency
- **RS**: Power balance and dynamics between characters
- **OS**: Who has authority/control in external situation

### scene_elements
- **MC**: ["internal_monologue", "self_realization", "fear_confrontation"]
- **IC**: ["challenging_question", "alternative_perspective", "moral_dilemma"]  
- **RS**: ["vulnerable_sharing", "trust_building", "emotional_intimacy"]
- **OS**: ["plot_advancement", "external_threat", "world_building"]

### specialized_elements
- **Romance**: ["telepathic_bonding", "mate_mark", "supernatural_heat"]
- **Mystery**: ["forensic_evidence", "witness_testimony", "logical_deduction"]
- **Fantasy**: ["elemental_magic", "divine_intervention", "ancient_prophecy"] 
- **Sci-Fi**: ["neural_interface", "quantum_mechanics", "AI_consciousness"]

---

# CROSS-SYSTEM INTEGRATION EXAMPLES

## Romance Series with Dramatica Integration:

### Book Structure:
```sql
-- OS: Defeat vampire council threatening supernatural peace
CREATE plot_thread: "Vampire Council War"  
throughline_focus = "objective_story"

-- MC: Aria learns to trust and be vulnerable  
CREATE plot_thread: "Aria's Trust Journey"
throughline_focus = "main_character"

-- IC: Matthias challenges Aria's independence
CREATE plot_thread: "Matthias as Challenger" 
throughline_focus = "influence_character"

-- RS: Vampire-human mate bond development
CREATE plot_thread: "Blood Bond Romance"
throughline_focus = "relationship"
```

### Scene Integration:
```sql
-- Multi-throughline scene
CREATE scene: Chapter 15, Scene 3
scene_purpose = "blood_bond_completion"
throughline_advancement = "relationship" -- primary  
secondary_throughlines = ["main_character", "objective_story"]
-- RS: Bond completes, MC: Accepts vulnerability, OS: Gains power to fight council

-- Trope implementation  
IMPLEMENT trope_scene: "Claiming Ceremony"
throughline_focus = "relationship"
scene_elements = ["blood_exchange", "telepathic_bonding", "power_sharing"]

-- Character progression
TRACK system_progression: Aria in Vampire Bond System
current_power_level = 9 -- near maximum bond strength
throughline_impact = ["relationship", "main_character"]
```

## Mystery Series with Dramatica Integration:

### Book Structure:
```sql  
-- OS: Solve serial killer case
CREATE plot_thread: "Serial Killer Investigation"
throughline_focus = "objective_story"

-- MC: Detective confronts past trauma affecting judgment
CREATE plot_thread: "Detective's Past Trauma" 
throughline_focus = "main_character"

-- IC: Killer psychologically challenges detective's methods
CREATE plot_thread: "Killer as Psychological Opponent"
throughline_focus = "influence_character"  

-- RS: Detective and partner trust/methodology conflict
CREATE plot_thread: "Partnership Under Strain"
throughline_focus = "relationship"
```

---

# AI WRITING TEAM TOOL COORDINATION

## How Teams Use Integrated Systems:

### SHOWRUNNER (RUBY)
**Manages throughline balance**:
- Ensures all four throughlines advance properly
- Coordinates plot threads across throughlines  
- Validates Dramatica structural integrity

**Key Tools**:
- `get_plot_threads` filtered by throughline_focus
- `analyze_story_dynamics` for Dramatica compliance  
- `track_character_throughlines` for all four throughlines

### GENRE SPECIALIST (EVELYN/DARRYL/SAGE/MIRA)
**Implements genre patterns within throughlines**:
- Creates tropes spanning multiple throughlines
- Ensures genre conventions serve story structure
- Translates genre language to universal fields

**Key Tools**:  
- `create_trope` with throughline awareness
- `implement_trope_scene` with throughline_focus
- Genre-specific system progression tracking

### CHARACTER PSYCHOLOGIST (VIKTOR)  
**Manages character development across throughlines**:
- Tracks MC and IC development separately and together
- Ensures character growth serves Dramatica structure
- Validates character consistency within throughlines

**Key Tools**:
- `track_character_throughlines` for MC/IC arcs
- `create_relationship_arc` for RS development
- Character knowledge progression supporting throughlines

### FIRST DRAFTER (BAILEY)
**Creates scenes with throughline awareness**:
- Builds scenes that advance appropriate throughlines  
- Ensures scene intensity supports story structure
- Coordinates multiple throughline advancement in key scenes

**Key Tools**:
- `create_scene` with throughline_advancement field
- Scene pacing analysis across throughline types
- Multi-throughline scene coordination

---

# QUALITY ASSURANCE INTEGRATION

## Validation Across Systems:

### Dramatica Structure Validation:
- All four throughlines properly established and developed
- MC/IC problems create meaningful conflict
- RS development serves overall story structure  
- OS provides sufficient external pressure/stakes

### Plot Thread Continuity:
- Threads within each throughline maintain internal logic
- Cross-throughline relationships make narrative sense
- Thread resolution serves Dramatica completion requirements

### Genre Compliance:
- Universal language properly maps to genre expectations
- Trope implementation serves story structure, not just genre conventions
- Scene elements enhance both genre satisfaction and Dramatica throughlines

### Character Development Consistency:
- Character growth aligns with assigned throughlines
- Knowledge progression supports character arc logic
- Relationship development serves RS throughline advancement

This integrated system ensures that authors can write in their natural genre language while the AI writing team manages complex story structure, character development, and narrative consistency automatically through the Universal Genre Language MCP framework.