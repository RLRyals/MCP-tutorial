# World Server Modular Implementation Guide - CORRECTED

## Overview

Based on the actual implementation, this guide describes how the World Server MCP is structured with modular handler components. The World Server focuses on location management first, with stub handlers for future expansion.

## Actual Project Structure

```
src/mcps/world-server/
├── index.js                           ← Main MCP server entry point
└── handlers/
    ├── location-handlers.js           ← FULLY IMPLEMENTED location CRUD
    ├── world-element-handlers.js      ← STUB for future magic/tech systems
    ├── organization-handlers.js       ← STUB for future guilds/governments
    └── world-management-handlers.js   ← STUB for future consistency checking
```

## Architecture Pattern

### Main Server (`index.js`)
- Extends `BaseMCPServer`
- Creates separate handler instances with database injection
- Uses **proper method binding** instead of Object.assign mixing
- Coordinates cross-component analysis methods
- Handles MCP protocol and CLI runner

### Handler Pattern
- Each handler is a class that takes database connection in constructor
- Handlers expose `get[ComponentName]Tools()` methods for tool definitions
- Handlers implement `handle[ToolName](args)` methods
- Main server binds handler methods to preserve context

## Implementation Details

### 1. Main Server Structure (`index.js`)

**Key Features:**
- **Database injection pattern**: Each handler gets `this.db` in constructor
- **Method binding**: Explicitly binds handler methods to preserve `this` context
- **Defensive initialization**: Checks tool arrays and provides fallbacks
- **Cross-component methods**: Implements analysis that uses multiple handlers
- **MCP + CLI support**: Handles both stdio mode and CLI testing

**Critical Pattern - Method Binding:**
```javascript
// CORRECT: Explicit method binding
this.handleCreateLocation = this.locationHandlers.handleCreateLocation.bind(this.locationHandlers);

// WRONG: Object.assign (loses context)
// Object.assign(this, this.locationHandlers);
```

**Tool Registration:**
```javascript
getTools() {
    return [
        ...this.locationHandlers.getLocationTools(),
        ...this.worldElementHandlers.getWorldElementTools(),
        ...this.organizationHandlers.getOrganizationTools(),
        ...this.worldManagementHandlers.getWorldManagementTools()
    ];
}
```

### 2. Location Handlers (`handlers/location-handlers.js`)

**Status:** FULLY IMPLEMENTED
**Size:** ~300+ lines
**Features:**
- Complete CRUD operations for locations
- Geographic relationship tracking (parent locations)
- Usage tracking across books/chapters
- Rich location descriptions with climate, terrain, atmosphere
- Search and filtering capabilities

**Tools Implemented:**
- `create_location` - Full location creation with validation
- `update_location` - Dynamic field updates
- `get_locations` - Advanced filtering and search
- `track_location_usage` - Story appearance tracking

**Data Structure:**
```javascript
{
    name: "The Whispering Woods",
    location_type: "forest",
    description: "Ancient forest with silver-barked trees",
    parent_location_id: 15,
    climate: "temperate", 
    terrain: "forested hills",
    notable_features: ["silver trees", "whispering sounds"],
    atmosphere: "mysterious, slightly unsettling"
}
```

### 3. Stub Handlers (Future Implementation)

**World Element Handlers:** Magic systems, technology, natural laws
**Organization Handlers:** Guilds, governments, power structures  
**World Management Handlers:** Consistency checking, world guides

**Current Implementation:**
```javascript
getWorldElementTools() {
    return []; // Empty - no tools yet
}

async handleCreateWorldElement(args) {
    throw new Error('create_world_element not yet implemented - coming in next tutorial branch!');
}
```

## Database Integration

**Required Tables:**
```sql
-- Locations (IMPLEMENTED)
CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id),
    name VARCHAR(255) NOT NULL,
    location_type VARCHAR(100),
    description TEXT,
    parent_location_id INTEGER REFERENCES locations(location_id),
    climate VARCHAR(100),
    terrain VARCHAR(100),
    notable_features TEXT[],
    atmosphere TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking (IMPLEMENTED)
CREATE TABLE world_element_usage (
    usage_id SERIAL PRIMARY KEY,
    element_type VARCHAR(50), -- 'location', 'organization', 'world_element'
    element_id INTEGER,
    book_id INTEGER REFERENCES books(id),
    chapter_id INTEGER,
    usage_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Future tables for organizations, world_elements, etc.
```

## Tutorial Branch Strategy

### Current Branch (Step_4_MCP_world):
- **Locations**: Fully functional with all CRUD operations
- **Other components**: Stub implementations with clear error messages
- **Testing**: Location tools work immediately in Claude Desktop

### Future Branches:
- **World Elements**: Magic systems, technology rules
- **Organizations**: Guilds, governments, power structures
- **World Management**: Consistency checking, world validation

## Testing Strategy

### Immediate Testing (Current Branch):
```
"Create a location called 'The Crystal Caves' - an underground cave system with magical properties"
"List all locations in series 1"  
"Track usage of the Crystal Caves in Book 2, Chapter 5"
```

### Future Testing (Next Branches):
```
"Create a magic system with power limitations"
"Add the Thieves' Guild organization"
"Check world consistency across all elements"
```

## Claude Desktop Configuration

**Single entry needed:**
```json
{
  "mcpServers": {
    "world-server": {
      "command": "node", 
      "args": ["src/mcps/world-server/index.js"],
      "env": {
        "MCP_STDIO_MODE": "true"
      }
    }
  }
}
```

## Development Pattern for Tutorial

### Step 1: Foundation (Current)
- Main server with handler structure
- One fully implemented handler (locations)
- Stub handlers with clear error messages
- Database schema for implemented features

### Step 2: Incremental Addition
- Choose one stub handler to implement
- Add database tables for that component
- Test integration with existing features
- Keep other stubs intact

### Step 3: Cross-Component Features
- Implement world management tools
- Add consistency checking across all components
- Create comprehensive world analysis

## Anti-Patterns Avoided

### ❌ Wrong Approaches:
- Object.assign mixing (loses method context)
- Monolithic handler files
- All components implemented simultaneously
- Rigid world-building templates

### ✅ Correct Approaches:  
- Explicit method binding with database injection
- Modular, incremental implementation
- Stub handlers with clear upgrade path
- Flexible, author-defined world rules

## Success Metrics

### For Tutorial Students:
- Can immediately test location functionality
- Clear understanding of modular expansion
- Can implement additional handlers following the pattern
- Learn proper method binding and database injection

### For AI Writing Teams:
- Comprehensive location tracking from day one
- Clear error messages for unimplemented features
- Seamless expansion as new components are added
- Rich world data for consistency validation

### For Authors:
- Immediate value from location management
- Gradual expansion without breaking existing functionality
- AI team handles all world consistency automatically
- Focus entirely on creative world-building

## Key Takeaways

1. **Start with one fully functional component** rather than partial implementations across all components
2. **Use proper method binding** to maintain handler context
3. **Inject database connections** rather than mixing objects
4. **Provide clear error messages** for unimplemented features
5. **Design for incremental expansion** from the beginning

This architecture allows the tutorial to provide immediate value while clearly showing the expansion path for future development.