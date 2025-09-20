// src/mcps/character-server/index.js
// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        // Keep the original console.error functionality but write to stderr instead
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';

class CharacterMCPServer extends BaseMCPServer {
    constructor() {
        console.error('[CHARACTER-SERVER] Constructor starting...');
        try {
            super('character-manager', '1.0.0');
            console.error('[CHARACTER-SERVER] Constructor completed successfully');
        } catch (error) {
            console.error('[CHARACTER-SERVER] Constructor failed:', error.message);
            console.error('[CHARACTER-SERVER] Stack:', error.stack);
            throw error;
        }
        // Initialize tools after base constructor
        this.tools = this.getTools();
        
        // Defensive check to ensure tools are properly initialized
        if (!this.tools || !Array.isArray(this.tools) || this.tools.length === 0) {
            console.error('[CHARACTER-SERVER] WARNING: Tools not properly initialized!');
            this.tools = this.getTools(); // Try again
        }
        
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[CHARACTER-SERVER] Initialized with ${this.tools.length} tools`);
        }
        
        // Test database connection on startup (don't wait for it, just start it)
        this.testDatabaseConnection();
    }

    async testDatabaseConnection() {
        try {
            if (this.db) {
                // Quick health check with timeout
                const healthPromise = this.db.healthCheck();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Database health check timed out')), 5000)
                );
                
                const health = await Promise.race([healthPromise, timeoutPromise]);
                if (health.healthy) {
                    console.error('[CHARACTER-SERVER] Database connection verified');
                } else {
                    console.error('[CHARACTER-SERVER] Database health check failed:', health.error);
                }
            }
        } catch (error) {
            console.error('[CHARACTER-SERVER] Database connection test failed:', error.message);
        }
    }

    getTools() {
        return [
            {
                name: 'track_character_presence',
                description: 'Track a character\'s presence and state in a specific chapter',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID' },
                        chapter_id: { type: 'integer', description: 'Chapter ID' },
                        presence_type: { 
                            type: 'string', 
                            enum: ['present', 'mentioned', 'flashback', 'dream', 'phone_call'],
                            description: 'How the character appears in this chapter' 
                        },
                        importance_level: { 
                            type: 'string', 
                            enum: ['major', 'minor', 'cameo', 'background'],
                            description: 'Character\'s importance in this chapter' 
                        },
                        physical_state: { type: 'string', description: 'Physical condition (injured, disguised, etc.)' },
                        emotional_state: { type: 'string', description: 'Emotional state (angry, suspicious, etc.)' },
                        enters_at_scene: { type: 'integer', description: 'Scene number when they arrive' },
                        exits_at_scene: { type: 'integer', description: 'Scene number when they leave' },
                        learns_this_chapter: { 
                            type: 'array', 
                            items: { type: 'string' },
                            description: 'New information learned in this chapter' 
                        },
                        reveals_this_chapter: { 
                            type: 'array', 
                            items: { type: 'string' },
                            description: 'Secrets revealed in this chapter' 
                        },
                        character_growth: { type: 'string', description: 'How the character changes in this chapter' }
                    },
                    required: ['character_id', 'chapter_id', 'presence_type']
                }
            },
            {
                name: 'get_character_timeline',
                description: 'Get a character\'s complete timeline across chapters showing their progression',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID' },
                        book_id: { type: 'integer', description: 'Specific book (optional - shows all books if not provided)' },
                        include_scenes: { type: 'boolean', description: 'Include scene-level details', default: false },
                        include_knowledge: { type: 'boolean', description: 'Include knowledge gained per chapter', default: true },
                        include_relationships: { type: 'boolean', description: 'Include relationship changes', default: false }
                    },
                    required: ['character_id']
                }
            },
            {
                name: 'check_character_continuity',
                description: 'Verify character consistency across chapter boundaries',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID' },
                        from_chapter_id: { type: 'integer', description: 'Starting chapter' },
                        to_chapter_id: { type: 'integer', description: 'Ending chapter' },
                        check_type: { 
                            type: 'string', 
                            enum: ['physical_state', 'emotional_state', 'knowledge', 'location', 'all'],
                            description: 'What type of continuity to check',
                            default: 'all' 
                        }
                    },
                    required: ['character_id', 'from_chapter_id', 'to_chapter_id']
                }
            },
            {
                name: 'get_characters_in_chapter',
                description: 'Get all characters present in a specific chapter with their roles and states',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chapter_id: { type: 'integer', description: 'Chapter ID' },
                        presence_type: { 
                            type: 'string', 
                            enum: ['present', 'mentioned', 'flashback', 'dream', 'phone_call'],
                            description: 'Filter by presence type (optional)' 
                        },
                        importance_level: { 
                            type: 'string', 
                            enum: ['major', 'minor', 'cameo', 'background'],
                            description: 'Filter by importance level (optional)' 
                        }
                    },
                    required: ['chapter_id']
                }
            },
            {
                name: 'get_character_interactions',
                description: 'Get character interaction patterns across chapters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_a_id: { type: 'integer', description: 'First character ID' },
                        character_b_id: { type: 'integer', description: 'Second character ID (optional - shows all interactions if not provided)' },
                        book_id: { type: 'integer', description: 'Specific book (optional)' },
                        interaction_type: { 
                            type: 'string', 
                            enum: ['interacts_with', 'conflicts_with', 'allies_with'],
                            description: 'Type of interaction to filter (optional)' 
                        }
                    },
                    required: ['character_a_id']
                }
            },
            {
                name: 'add_character_knowledge_with_chapter',
                description: 'Add character knowledge with specific chapter reference',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID' },
                        knowledge_category: { 
                            type: 'string', 
                            description: 'Type of knowledge (e.g., \'secret\', \'skill\', \'person\', \'location\', \'event\')' 
                        },
                        knowledge_item: { 
                            type: 'string', 
                            description: 'What they know (e.g., \'vampire council exists\', \'Sarah is a witch\')' 
                        },
                        knowledge_level: { 
                            type: 'string', 
                            enum: ['knows', 'suspects', 'unaware', 'forgot'],
                            description: 'How well they know this information',
                            default: 'knows' 
                        },
                        learned_chapter_id: { type: 'integer', description: 'Chapter where they learned this' },
                        learned_scene: { type: 'integer', description: 'Scene number where learned (optional)' },
                        learned_context: { 
                            type: 'string', 
                            description: 'How/when they learned this information' 
                        }
                    },
                    required: ['character_id', 'knowledge_category', 'knowledge_item', 'learned_chapter_id']
                }
            },
            {
                name: 'check_character_logistics',
                description: 'Verify if a character can realistically be in a location at a specific time',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID' },
                        from_chapter_id: { type: 'integer', description: 'Where they were previously' },
                        to_chapter_id: { type: 'integer', description: 'Where they need to be' },
                        travel_method: { type: 'string', description: 'How they travel (car, walk, teleport, etc.)' },
                        check_time_gap: { type: 'boolean', description: 'Verify sufficient time for travel', default: true }
                    },
                    required: ['character_id', 'from_chapter_id', 'to_chapter_id']
                }
            },
            {
                name: 'analyze_character_development',
                description: 'Analyze character growth patterns across chapters/books',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID' },
                        analysis_type: { 
                            type: 'string', 
                            enum: ['emotional_growth', 'knowledge_progression', 'relationship_changes', 'all'],
                            description: 'Type of development to analyze',
                            default: 'all' 
                        },
                        book_id: { type: 'integer', description: 'Specific book (optional - analyzes all books if not provided)' }
                    },
                    required: ['character_id']
                }
            },
            {
                name: 'list_characters',
                description: 'List all characters in a series with optional filtering',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' },
                        character_type: { 
                            type: 'string', 
                            enum: ['main', 'supporting', 'minor', 'antagonist'],
                            description: 'Filter by character type (optional)' 
                        },
                        status: { 
                            type: 'string', 
                            enum: ['alive', 'dead', 'missing', 'unknown'],
                            description: 'Filter by character status (optional)' 
                        }
                    },
                    required: ['series_id']
                }
            },
            {
                name: 'get_character',
                description: 'Get detailed information about a character',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID' }
                    },
                    required: ['character_id']
                }
            },
            {
                name: 'create_character',
                description: 'Create a new character in a series',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'ID of the series' },
                        name: { type: 'string', description: 'Character\'s primary name' },
                        full_name: { type: 'string', description: 'Character\'s full name (optional)' },
                        aliases: { 
                            type: 'array', 
                            items: { type: 'string' },
                            description: 'Alternative names/nicknames (optional)' 
                        },
                        character_type: { 
                            type: 'string', 
                            enum: ['main', 'supporting', 'minor', 'antagonist'],
                            description: 'Character importance level' 
                        },
                        first_appearance_book_id: { type: 'integer', description: 'Book where character first appears (optional)' },
                        status: { 
                            type: 'string', 
                            enum: ['alive', 'dead', 'missing', 'unknown'],
                            description: 'Character\'s current status' 
                        }
                    },
                    required: ['series_id', 'name']
                }
            },
            {
                name: 'update_character',
                description: 'Update character information',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID' },
                        name: { type: 'string', description: 'Character\'s primary name' },
                        full_name: { type: 'string', description: 'Character\'s full name' },
                        character_type: { 
                            type: 'string', 
                            enum: ['main', 'supporting', 'minor', 'antagonist'],
                            description: 'Character importance level' 
                        },
                        status: { 
                            type: 'string', 
                            enum: ['alive', 'dead', 'missing', 'unknown'],
                            description: 'Character\'s current status' 
                        }
                    },
                    required: ['character_id']
                }
            },
            {
                name: 'add_character_detail',
                description: 'Add or update a character detail (physical trait, personality, background, etc.)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID' },
                        category: { 
                            type: 'string', 
                            description: 'Detail category (e.g., \'physical\', \'personality\', \'background\', \'skills\')' 
                        },
                        attribute: { 
                            type: 'string', 
                            description: 'Specific attribute (e.g., \'eye_color\', \'height\', \'temperament\')' 
                        },
                        value: { type: 'string', description: 'The detail value' },
                        source_book_id: { type: 'integer', description: 'Book where this detail was established (optional)' },
                        confidence_level: { 
                            type: 'string', 
                            enum: ['established', 'mentioned', 'implied'],
                            description: 'How definitively this detail was stated' 
                        }
                    },
                    required: ['character_id', 'category', 'attribute', 'value']
                }
            },
            {
                name: 'get_character_details',
                description: 'Get all details for a character, optionally filtered by category',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID' },
                        category: { 
                            type: 'string', 
                            description: 'Filter by detail category (optional)' 
                        }
                    },
                    required: ['character_id']
                }
            },
            {
                name: 'add_character_knowledge',
                description: 'Track what a character knows (prevents plot holes)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID' },
                        knowledge_category: { 
                            type: 'string', 
                            description: 'Type of knowledge (e.g., \'secret\', \'skill\', \'person\', \'location\', \'event\')' 
                        },
                        knowledge_item: { 
                            type: 'string', 
                            description: 'What they know (e.g., \'vampire council exists\', \'Sarah is a witch\')' 
                        },
                        knowledge_level: { 
                            type: 'string', 
                            enum: ['knows', 'suspects', 'unaware', 'forgot'],
                            description: 'How well they know this information' 
                        },
                        learned_book_id: { type: 'integer', description: 'Book where they learned this (optional)' },
                        learned_context: { 
                            type: 'string', 
                            description: 'How/when they learned this information (optional)' 
                        }
                    },
                    required: ['character_id', 'knowledge_category', 'knowledge_item']
                }
            },
            {
                name: 'check_character_knowledge',
                description: 'Check what a character knows about a specific topic',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID' },
                        knowledge_item: { 
                            type: 'string', 
                            description: 'What to check (can be partial match)' 
                        },
                        knowledge_category: { 
                            type: 'string', 
                            description: 'Filter by knowledge category (optional)' 
                        }
                    },
                    required: ['character_id']
                }
            },
            {
                name: 'get_characters_who_know',
                description: 'Find all characters who know about a specific thing',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' },
                        knowledge_item: { 
                            type: 'string', 
                            description: 'What to search for (partial match supported)' 
                        },
                        knowledge_level: { 
                            type: 'string', 
                            enum: ['knows', 'suspects', 'unaware', 'forgot'],
                            description: 'Filter by knowledge level (optional)' 
                        }
                    },
                    required: ['series_id', 'knowledge_item']
                }
            }
        ];
    }

    getToolHandler(toolName) {
        const handlers = {
            'list_characters': this.handleListCharacters,
            'get_character': this.handleGetCharacter,
            'create_character': this.handleCreateCharacter,
            'update_character': this.handleUpdateCharacter,
            'add_character_detail': this.handleAddCharacterDetail,
            'get_character_details': this.handleGetCharacterDetails,
            'add_character_knowledge': this.handleAddCharacterKnowledge,
            'check_character_knowledge': this.handleCheckCharacterKnowledge,
            'get_characters_who_know': this.handleGetCharactersWhoKnow,
            'track_character_presence': this.handleTrackCharacterPresence,
            'get_character_timeline': this.handleGetCharacterTimeline,
            'check_character_continuity': this.handleCheckCharacterContinuity,
            'get_characters_in_chapter': this.handleGetCharactersInChapter,
            'get_character_interactions': this.handleGetCharacterInteractions,
            'add_character_knowledge_with_chapter': this.handleAddCharacterKnowledgeWithChapter,
            'check_character_logistics': this.handleCheckCharacterLogistics,
            'analyze_character_development': this.handleAnalyzeCharacterDevelopment
        };
        return handlers[toolName];
    }

    async handleListCharacters(args) {
        try {
            const { series_id, character_type, status } = args;

            let query = `
                SELECT c.*, s.title as series_title
                FROM characters c
                JOIN series s ON c.series_id = s.id
                WHERE c.series_id = $1
            `;
            
            const params = [series_id];
            let paramCount = 1;

            if (character_type) {
                paramCount++;
                query += ` AND c.character_type = $${paramCount}`;
                params.push(character_type);
            }

            if (status) {
                paramCount++;
                query += ` AND c.status = $${paramCount}`;
                params.push(status);
            }

            query += ` ORDER BY c.character_type, c.name`;

            const result = await this.db.query(query, params);

            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${result.rows.length} characters:\n\n` +
                              result.rows.map(char => 
                                  `ID: ${char.character_id}\n` +
                                  `Name: ${char.name}${char.full_name ? ` (${char.full_name})` : ''}\n` +
                                  `Type: ${char.character_type}\n` +
                                  `Status: ${char.status}\n` +
                                  `Aliases: ${char.aliases && char.aliases.length > 0 ? char.aliases.join(', ') : 'None'}\n`
                              ).join('\n---\n\n')
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to list characters: ${error.message}`);
        }
    }

    async handleGetCharacter(args) {
        try {
            const { character_id } = args;

            const result = await this.db.query(
                `SELECT c.*, s.title as series_title
                 FROM characters c
                 JOIN series s ON c.series_id = s.id
                 WHERE c.character_id = $1`,
                [character_id]
            );

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No character found with ID: ${character_id}`
                        }
                    ]
                };
            }

            const character = result.rows[0];

            return {
                content: [
                    {
                        type: 'text',
                        text: `Character Information:\n\n` +
                              `ID: ${character.character_id}\n` +
                              `Name: ${character.name}${character.full_name ? ` (${character.full_name})` : ''}\n` +
                              `Series: ${character.series_title}\n` +
                              `Type: ${character.character_type}\n` +
                              `Status: ${character.status}\n` +
                              `Aliases: ${character.aliases && character.aliases.length > 0 ? character.aliases.join(', ') : 'None'}\n` +
                              `Created: ${character.created_at}\n` +
                              `Updated: ${character.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get character: ${error.message}`);
        }
    }

    async handleCreateCharacter(args) {
        try {
            const { series_id, name, full_name, aliases, character_type = 'main', 
                    first_appearance_book_id, status = 'alive' } = args;

            const result = await this.db.query(
                `INSERT INTO characters (series_id, name, full_name, aliases, character_type, 
                                        first_appearance_book_id, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
                [series_id, name, full_name || null, aliases || [], 
                 character_type, first_appearance_book_id || null, status]
            );

            const character = result.rows[0];

            return {
                content: [
                    {
                        type: 'text',
                        text: `Created character successfully!\n\n` +
                              `ID: ${character.character_id}\n` +
                              `Name: ${character.name}${character.full_name ? ` (${character.full_name})` : ''}\n` +
                              `Type: ${character.character_type}\n` +
                              `Status: ${character.status}\n` +
                              `Aliases: ${character.aliases && character.aliases.length > 0 ? character.aliases.join(', ') : 'None'}`
                    }
                ]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Invalid series_id: Series not found');
            }
            throw new Error(`Failed to create character: ${error.message}`);
        }
    }

    async handleUpdateCharacter(args) {
        try {
            const { character_id, ...updates } = args;

            // Build dynamic update query
            const updateFields = [];
            const params = [character_id];
            let paramCount = 1;

            for (const [key, value] of Object.entries(updates)) {
                if (value !== undefined) {
                    paramCount++;
                    updateFields.push(`${key} = $${paramCount}`);
                    params.push(value);
                }
            }

            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }

            updateFields.push('updated_at = CURRENT_TIMESTAMP');

            const query = `
                UPDATE characters 
                SET ${updateFields.join(', ')}
                WHERE character_id = $1
                RETURNING *
            `;

            const result = await this.db.query(query, params);

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No character found with ID: ${character_id}`
                        }
                    ]
                };
            }

            const character = result.rows[0];

            return {
                content: [
                    {
                        type: 'text',
                        text: `Updated character successfully!\n\n` +
                              `ID: ${character.character_id}\n` +
                              `Name: ${character.name}${character.full_name ? ` (${character.full_name})` : ''}\n` +
                              `Type: ${character.character_type}\n` +
                              `Status: ${character.status}\n` +
                              `Updated: ${character.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to update character: ${error.message}`);
        }
    }

    async handleAddCharacterDetail(args) {
        try {
            const { character_id, category, attribute, value, source_book_id, confidence_level = 'established' } = args;

            const result = await this.db.query(
                `INSERT INTO character_details (character_id, category, attribute, value, source_book_id, confidence_level)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (character_id, category, attribute)
                 DO UPDATE SET 
                   value = EXCLUDED.value,
                   source_book_id = EXCLUDED.source_book_id,
                   confidence_level = EXCLUDED.confidence_level,
                   updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [character_id, category, attribute, value, source_book_id || null, confidence_level]
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: `Character detail added/updated successfully!\n\n` +
                              `Character ID: ${character_id}\n` +
                              `${category}/${attribute}: ${value}\n` +
                              `Confidence: ${confidence_level}\n` +
                              `Source Book ID: ${source_book_id || 'Not specified'}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to add character detail: ${error.message}`);
        }
    }

    async handleGetCharacterDetails(args) {
        try {
            const { character_id, category } = args;

            let query = `
                SELECT cd.*, c.name as character_name, b.title as source_book_title
                FROM character_details cd
                JOIN characters c ON cd.character_id = c.id
                LEFT JOIN books b ON cd.source_book_id = b.id
                WHERE cd.character_id = $1
            `;
            const params = [character_id];

            if (category) {
                query += ` AND cd.category = $2`;
                params.push(category);
            }

            query += ` ORDER BY cd.category, cd.attribute`;

            const result = await this.db.query(query, params);

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No details found for character ID: ${character_id}${category ? ` in category: ${category}` : ''}`
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `Character Details for ${result.rows[0].character_name}:\n\n` +
                              result.rows.map(detail =>
                                  `${detail.category}/${detail.attribute}: ${detail.value}\n` +
                                  `  Confidence: ${detail.confidence_level}\n` +
                                  `  Source: ${detail.source_book_title || 'Not specified'}\n`
                              ).join('\n')
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get character details: ${error.message}`);
        }
    }

    async handleAddCharacterKnowledge(args) {
        try {
            const { character_id, knowledge_category, knowledge_item, knowledge_level = 'knows', 
                    learned_book_id, learned_context } = args;

            const result = await this.db.query(
                `INSERT INTO character_knowledge (character_id, knowledge_category, knowledge_item, 
                                                knowledge_level, learned_book_id, learned_context)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [character_id, knowledge_category, knowledge_item, knowledge_level, 
                 learned_book_id || null, learned_context || null]
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: `Character knowledge added successfully!\n\n` +
                              `Character ID: ${character_id}\n` +
                              `Knowledge: ${knowledge_item}\n` +
                              `Category: ${knowledge_category}\n` +
                              `Level: ${knowledge_level}\n` +
                              `Context: ${learned_context || 'Not specified'}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to add character knowledge: ${error.message}`);
        }
    }

    async handleCheckCharacterKnowledge(args) {
        try {
            const { character_id, knowledge_item, knowledge_category } = args;

            let query = `
                SELECT ck.*, c.name as character_name, b.title as learned_book_title
                FROM character_knowledge ck
                JOIN characters c ON ck.character_id = c.id
                LEFT JOIN books b ON ck.learned_book_id = b.id
                WHERE ck.character_id = $1
            `;
            const params = [character_id];
            let paramCount = 1;

            if (knowledge_item) {
                paramCount++;
                query += ` AND ck.knowledge_item ILIKE $${paramCount}`;
                params.push(`%${knowledge_item}%`);
            }

            if (knowledge_category) {
                paramCount++;
                query += ` AND ck.knowledge_category = $${paramCount}`;
                params.push(knowledge_category);
            }

            query += ` ORDER BY ck.knowledge_category, ck.knowledge_item`;

            const result = await this.db.query(query, params);

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No knowledge found for character ID: ${character_id}${knowledge_item ? ` about: ${knowledge_item}` : ''}`
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `Knowledge for ${result.rows[0].character_name}:\n\n` +
                              result.rows.map(knowledge =>
                                  `${knowledge.knowledge_category}: ${knowledge.knowledge_item}\n` +
                                  `  Level: ${knowledge.knowledge_level}\n` +
                                  `  Learned: ${knowledge.learned_book_title || 'Unknown'}\n` +
                                  `  Context: ${knowledge.learned_context || 'Not specified'}\n`
                              ).join('\n')
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to check character knowledge: ${error.message}`);
        }
    }

    async handleGetCharactersWhoKnow(args) {
        try {
            const { series_id, knowledge_item, knowledge_level } = args;

            let query = `
                SELECT ck.*, c.name as character_name, b.title as learned_book_title
                FROM character_knowledge ck
                JOIN characters c ON ck.character_id = c.id
                LEFT JOIN books b ON ck.learned_book_id = b.id
                WHERE c.series_id = $1 AND ck.knowledge_item ILIKE $2
            `;
            const params = [series_id, `%${knowledge_item}%`];

            if (knowledge_level) {
                query += ` AND ck.knowledge_level = $3`;
                params.push(knowledge_level);
            }

            query += ` ORDER BY c.name, ck.knowledge_category`;

            const result = await this.db.query(query, params);

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No characters found who know about: ${knowledge_item}`
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `Characters who know about "${knowledge_item}":\n\n` +
                              result.rows.map(knowledge =>
                                  `${knowledge.character_name}:\n` +
                                  `  Knowledge: ${knowledge.knowledge_item}\n` +
                                  `  Level: ${knowledge.knowledge_level}\n` +
                                  `  Learned: ${knowledge.learned_book_title || 'Unknown'}\n`
                              ).join('\n')
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get characters who know: ${error.message}`);
        }
    }

    async handleTrackCharacterPresence(args) {
        try {
            const { character_id, chapter_id, presence_type, importance_level, 
                    physical_state, emotional_state, enters_at_scene, exits_at_scene,
                    learns_this_chapter, reveals_this_chapter, character_growth } = args;

            const result = await this.db.query(
                `INSERT INTO character_chapter_presence 
                 (character_id, chapter_id, presence_type, importance_level, physical_state, 
                  emotional_state, enters_at_scene, exits_at_scene, learns_this_chapter, 
                  reveals_this_chapter, character_growth)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 ON CONFLICT (character_id, chapter_id)
                 DO UPDATE SET 
                   presence_type = EXCLUDED.presence_type,
                   importance_level = EXCLUDED.importance_level,
                   physical_state = EXCLUDED.physical_state,
                   emotional_state = EXCLUDED.emotional_state,
                   enters_at_scene = EXCLUDED.enters_at_scene,
                   exits_at_scene = EXCLUDED.exits_at_scene,
                   learns_this_chapter = EXCLUDED.learns_this_chapter,
                   reveals_this_chapter = EXCLUDED.reveals_this_chapter,
                   character_growth = EXCLUDED.character_growth,
                   updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [character_id, chapter_id, presence_type, importance_level || null,
                 physical_state || null, emotional_state || null, enters_at_scene || null,
                 exits_at_scene || null, learns_this_chapter || [], reveals_this_chapter || [],
                 character_growth || null]
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: `Character presence tracked successfully!\n\n` +
                              `Character ID: ${character_id}\n` +
                              `Chapter ID: ${chapter_id}\n` +
                              `Presence: ${presence_type}\n` +
                              `Physical State: ${physical_state || 'Not specified'}\n` +
                              `Emotional State: ${emotional_state || 'Not specified'}\n` +
                              `Growth: ${character_growth || 'Not specified'}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to track character presence: ${error.message}`);
        }
    }

    async handleGetCharacterTimeline(args) {
        try {
            const { character_id, book_id, include_scenes, include_knowledge, include_relationships } = args;

            let query = `
                SELECT 
                    c.chapter_number,
                    c.title as chapter_title,
                    c.story_time_start,
                    c.story_time_end,
                    b.title as book_title,
                    ccp.presence_type,
                    ccp.physical_state,
                    ccp.emotional_state,
                    ccp.character_growth,
                    ccp.learns_this_chapter,
                    ccp.reveals_this_chapter
                FROM character_chapter_presence ccp
                JOIN chapters c ON ccp.chapter_id = c.id
                JOIN books b ON c.book_id = b.id
                WHERE ccp.character_id = $1
            `;
            
            const params = [character_id];
            let paramCount = 1;

            if (book_id) {
                paramCount++;
                query += ` AND c.book_id = $${paramCount}`;
                params.push(book_id);
            }

            query += ` ORDER BY b.book_number, c.chapter_number`;

            const result = await this.db.query(query, params);

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No timeline found for character ID: ${character_id}`
                        }
                    ]
                };
            }

            let timelineText = `Character Timeline:\n\n`;
            result.rows.forEach(row => {
                timelineText += `${row.book_title} - Chapter ${row.chapter_number}: ${row.chapter_title}\n`;
                timelineText += `  Presence: ${row.presence_type}\n`;
                if (row.physical_state) timelineText += `  Physical: ${row.physical_state}\n`;
                if (row.emotional_state) timelineText += `  Emotional: ${row.emotional_state}\n`;
                if (row.character_growth) timelineText += `  Growth: ${row.character_growth}\n`;
                if (row.learns_this_chapter && row.learns_this_chapter.length > 0) {
                    timelineText += `  Learns: ${row.learns_this_chapter.join(', ')}\n`;
                }
                if (row.reveals_this_chapter && row.reveals_this_chapter.length > 0) {
                    timelineText += `  Reveals: ${row.reveals_this_chapter.join(', ')}\n`;
                }
                timelineText += `\n`;
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: timelineText
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get character timeline: ${error.message}`);
        }
    }

    async handleCheckCharacterContinuity(args) {
        try {
            const { character_id, from_chapter_id, to_chapter_id, check_type } = args;

            // Get character state in both chapters
            const fromResult = await this.db.query(
                `SELECT ccp.*, c.chapter_number as from_chapter, c.title as from_title
                 FROM character_chapter_presence ccp
                 JOIN chapters c ON ccp.chapter_id = c.id
                 WHERE ccp.character_id = $1 AND ccp.chapter_id = $2`,
                [character_id, from_chapter_id]
            );

            const toResult = await this.db.query(
                `SELECT ccp.*, c.chapter_number as to_chapter, c.title as to_title
                 FROM character_chapter_presence ccp
                 JOIN chapters c ON ccp.chapter_id = c.id
                 WHERE ccp.character_id = $1 AND ccp.chapter_id = $2`,
                [character_id, to_chapter_id]
            );

            if (fromResult.rows.length === 0 || toResult.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Character presence not found in one or both chapters. Cannot check continuity.`
                        }
                    ]
                };
            }

            const fromState = fromResult.rows[0];
            const toState = toResult.rows[0];
            
            let continuityIssues = [];
            let continuityChecks = [];

            // Check physical state continuity
            if (check_type === 'physical_state' || check_type === 'all') {
                if (fromState.physical_state && toState.physical_state) {
                    if (fromState.physical_state.includes('injured') && !toState.physical_state.includes('injured') && !toState.physical_state.includes('healed')) {
                        continuityIssues.push(`Physical state: Character was injured in chapter ${fromState.from_chapter} but shows no sign of injury in chapter ${toState.to_chapter}`);
                    } else {
                        continuityChecks.push(`Physical state: Consistent from "${fromState.physical_state}" to "${toState.physical_state}"`);
                    }
                }
            }

            // Check emotional state progression
            if (check_type === 'emotional_state' || check_type === 'all') {
                if (fromState.emotional_state && toState.emotional_state) {
                    continuityChecks.push(`Emotional state: "${fromState.emotional_state}" to "${toState.emotional_state}"`);
                }
            }

            // Check knowledge continuity
            if (check_type === 'knowledge' || check_type === 'all') {
                if (fromState.learns_this_chapter && fromState.learns_this_chapter.length > 0) {
                    continuityChecks.push(`Knowledge gained in chapter ${fromState.from_chapter}: ${fromState.learns_this_chapter.join(', ')}`);
                }
            }

            let reportText = `Continuity Check Results:\n\n`;
            reportText += `From: Chapter ${fromState.from_chapter} - ${fromState.from_title}\n`;
            reportText += `To: Chapter ${toState.to_chapter} - ${toState.to_title}\n\n`;

            if (continuityIssues.length > 0) {
                reportText += `⚠️ ISSUES FOUND:\n`;
                continuityIssues.forEach(issue => reportText += `- ${issue}\n`);
                reportText += `\n`;
            }

            if (continuityChecks.length > 0) {
                reportText += `✅ CONTINUITY CHECKS:\n`;
                continuityChecks.forEach(check => reportText += `- ${check}\n`);
            }

            if (continuityIssues.length === 0 && continuityChecks.length === 0) {
                reportText += `No specific continuity data found for comparison.`;
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: reportText
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to check character continuity: ${error.message}`);
        }
    }

    async handleGetCharactersInChapter(args) {
        try {
            const { chapter_id, presence_type, importance_level } = args;

            let query = `
                SELECT 
                    c.name,
                    c.character_id,
                    ccp.presence_type,
                    ccp.importance_level,
                    ccp.physical_state,
                    ccp.emotional_state,
                    ccp.enters_at_scene,
                    ccp.exits_at_scene,
                    ccp.character_function
                FROM character_chapter_presence ccp
                JOIN characters c ON ccp.character_id = c.id
                WHERE ccp.chapter_id = $1
            `;
            
            const params = [chapter_id];
            let paramCount = 1;

            if (presence_type) {
                paramCount++;
                query += ` AND ccp.presence_type = $${paramCount}`;
                params.push(presence_type);
            }

            if (importance_level) {
                paramCount++;
                query += ` AND ccp.importance_level = $${paramCount}`;
                params.push(importance_level);
            }

            query += ` ORDER BY ccp.importance_level, c.name`;

            const result = await this.db.query(query, params);

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No characters found in chapter ${chapter_id}`
                        }
                    ]
                };
            }

            let charactersText = `Characters in Chapter:\n\n`;
            result.rows.forEach(char => {
                charactersText += `${char.name} (ID: ${char.character_id})\n`;
                charactersText += `  Presence: ${char.presence_type}\n`;
                charactersText += `  Importance: ${char.importance_level || 'Not specified'}\n`;
                if (char.physical_state) charactersText += `  Physical: ${char.physical_state}\n`;
                if (char.emotional_state) charactersText += `  Emotional: ${char.emotional_state}\n`;
                if (char.enters_at_scene) charactersText += `  Enters: Scene ${char.enters_at_scene}\n`;
                if (char.exits_at_scene) charactersText += `  Exits: Scene ${char.exits_at_scene}\n`;
                charactersText += `\n`;
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: charactersText
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get characters in chapter: ${error.message}`);
        }
    }

    async handleAddCharacterKnowledgeWithChapter(args) {
        try {
            const { character_id, knowledge_category, knowledge_item, knowledge_level, 
                    learned_chapter_id, learned_scene, learned_context } = args;

            // First add to character_knowledge table
            const knowledgeResult = await this.db.query(
                `INSERT INTO character_knowledge (character_id, knowledge_category, knowledge_item, 
                                                knowledge_level, learned_context)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [character_id, knowledge_category, knowledge_item, knowledge_level, learned_context || null]
            );

            // Also update the character's presence in the chapter to track what they learned
            await this.db.query(
                `UPDATE character_chapter_presence 
                 SET learns_this_chapter = COALESCE(learns_this_chapter, '{}') || $3::text[]
                 WHERE character_id = $1 AND chapter_id = $2`,
                [character_id, learned_chapter_id, [knowledge_item]]
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: `Character knowledge added with chapter reference!\n\n` +
                              `Character ID: ${character_id}\n` +
                              `Knowledge: ${knowledge_item}\n` +
                              `Category: ${knowledge_category}\n` +
                              `Level: ${knowledge_level}\n` +
                              `Learned in Chapter: ${learned_chapter_id}\n` +
                              `Context: ${learned_context || 'Not specified'}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to add character knowledge with chapter: ${error.message}`);
        }
    }

    async handleGetCharacterInteractions(args) {
        try {
            const { character_id, chapter_id, book_id } = args;
            // Implementation will be added in next update
            throw new Error('Not yet implemented');
        } catch (error) {
            throw new Error(`Failed to get character interactions: ${error.message}`);
        }
    }

    async handleCheckCharacterLogistics(args) {
        try {
            const { character_id, chapter_id } = args;
            // Implementation will be added in next update
            throw new Error('Not yet implemented');
        } catch (error) {
            throw new Error(`Failed to check character logistics: ${error.message}`);
        }
    }

    async handleAnalyzeCharacterDevelopment(args) {
        try {
            const { character_id, from_chapter_id, to_chapter_id } = args;
            // Implementation will be added in next update
            throw new Error('Not yet implemented');
        } catch (error) {
            throw new Error(`Failed to analyze character development: ${error.message}`);
        }
    }
}

export { CharacterMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Only log debug info if not in stdio mode
if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[CHARACTER-SERVER] Module loaded');
    console.error('[CHARACTER-SERVER] MCP_STDIO_MODE:', process.env.MCP_STDIO_MODE);
    console.error('[CHARACTER-SERVER] import.meta.url:', import.meta.url);
    console.error('[CHARACTER-SERVER] process.argv[1]:', process.argv[1]);
}

// Convert paths to handle Windows path differences
const currentModuleUrl = import.meta.url;
const scriptPath = process.argv[1];
const normalizedScriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
const isDirectExecution = currentModuleUrl === normalizedScriptPath;

if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[CHARACTER-SERVER] normalized script path:', normalizedScriptPath);
    console.error('[CHARACTER-SERVER] is direct execution:', isDirectExecution);
}

if (!process.env.MCP_STDIO_MODE && isDirectExecution) {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[CHARACTER-SERVER] Starting CLI runner...');
    }
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(CharacterMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[CHARACTER-SERVER] CLI runner failed:', error.message);
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error('[CHARACTER-SERVER] CLI runner stack:', error.stack);
        }
        throw error;
    }
} else if (isDirectExecution) {
    // When running directly as MCP server (via Claude Desktop)
    console.error('[CHARACTER-SERVER] Running in MCP stdio mode - starting server...');
    
    // When in MCP stdio mode, ensure clean stdout for JSON messages
    if (process.env.MCP_STDIO_MODE === 'true') {
        console.error('[CHARACTER-SERVER] Setting up stdio mode handlers');
        // Redirect all console.log to stderr
        console.log = function(...args) {
            console.error('[CHARACTER-SERVER]', ...args);
        };
    }
    
    try {
        console.error('[CHARACTER-SERVER] Creating server instance...');
        const server = new CharacterMCPServer();
        console.error('[CHARACTER-SERVER] Server instance created, starting run()...');
        await server.run();
        console.error('[CHARACTER-SERVER] Server run() completed successfully');
    } catch (error) {
        console.error('[CHARACTER-SERVER] Failed to start MCP server:', error.message);
        console.error('[CHARACTER-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[CHARACTER-SERVER] Module imported - not starting server');
        console.error('[CHARACTER-SERVER] Module export completed');
    }
}