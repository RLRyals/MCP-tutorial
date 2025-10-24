// src/config-mcps/series-planning-server/index.js
// Phase-based MCP Server: Series Planning Phase
// Aggregates ONLY the tools needed during series planning - NO code duplication, ONE database connection

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';

// Import ONLY handler classes - NOT full servers
// This prevents creating multiple database connections
import { PlotThreadHandlers } from '../../mcps/plot-server/handlers/plot-thread-handlers.js';
import { GenreExtensions } from '../../mcps/plot-server/handlers/genre-extensions.js';
import { LocationHandlers } from '../../mcps/world-server/handlers/location-handlers.js';
import { OrganizationHandlers } from '../../mcps/world-server/handlers/organization-handlers.js';
import { WorldElementHandlers } from '../../mcps/world-server/handlers/world-element-handlers.js';
import { RelationshipHandlers } from '../../mcps/relationship-server/handlers/relationship-handlers.js';

class SeriesPlanningMCPServer extends BaseMCPServer {
    constructor() {
        super('series-planning-phase', '1.0.0');

        // Initialize handler instances with our shared DB connection
        this.initializeHandlers();

        // Build aggregated tool list from handlers
        this.tools = this.buildTools();

        console.error(`[SERIES-PLANNING-SERVER] Initialized with ${this.tools.length} tools using 1 DB connection`);
    }

    initializeHandlers() {
        // Create handler instances passing our shared database
        // These handlers are lightweight and don't create their own DB connections
        this.plotThreadHandlers = new PlotThreadHandlers(this.db);
        this.genreExtensions = new GenreExtensions(this.db);
        this.locationHandlers = new LocationHandlers(this.db);
        this.organizationHandlers = new OrganizationHandlers(this.db);
        this.worldElementHandlers = new WorldElementHandlers(this.db);
        this.relationshipHandlers = new RelationshipHandlers(this.db);

        console.error('[SERIES-PLANNING-SERVER] Handlers initialized with shared DB');
    }

    buildTools() {
        const tools = [];

        // Plot thread tools: create_plot_thread, get_plot_threads, update_plot_thread
        const plotThreadTools = this.plotThreadHandlers.getPlotThreadTools();

        const createPlotThread = plotThreadTools.find(t => t.name === 'create_plot_thread');
        if (createPlotThread) {
            tools.push({
                ...createPlotThread,
                name: 'plot_create_plot_thread',
                description: `[PLOT] ${createPlotThread.description}`
            });
        }

        const getPlotThreads = plotThreadTools.find(t => t.name === 'get_plot_threads');
        if (getPlotThreads) {
            tools.push({
                ...getPlotThreads,
                name: 'plot_get_plot_threads',
                description: `[PLOT] ${getPlotThreads.description}`
            });
        }

        const updatePlotThread = plotThreadTools.find(t => t.name === 'update_plot_thread');
        if (updatePlotThread) {
            tools.push({
                ...updatePlotThread,
                name: 'plot_update_plot_thread',
                description: `[PLOT] ${updatePlotThread.description}`
            });
        }

        // Genre extension tools: define_world_system
        const genreExtensionTools = this.genreExtensions.getUniversalGenreTools();
        const defineWorldSystem = genreExtensionTools.find(t => t.name === 'define_world_system');
        if (defineWorldSystem) {
            tools.push({
                ...defineWorldSystem,
                name: 'plot_define_world_system',
                description: `[PLOT] ${defineWorldSystem.description}`
            });
        }

        // Location tools: create_location, get_locations
        const locationTools = this.locationHandlers.getLocationTools();

        const createLocation = locationTools.find(t => t.name === 'create_location');
        if (createLocation) {
            tools.push({
                ...createLocation,
                name: 'world_create_location',
                description: `[WORLD] ${createLocation.description}`
            });
        }

        const getLocations = locationTools.find(t => t.name === 'get_locations');
        if (getLocations) {
            tools.push({
                ...getLocations,
                name: 'world_get_locations',
                description: `[WORLD] ${getLocations.description}`
            });
        }

        // Organization tools: create_organization, get_organizations
        const organizationTools = this.organizationHandlers.getOrganizationTools();

        const createOrganization = organizationTools.find(t => t.name === 'create_organization');
        if (createOrganization) {
            tools.push({
                ...createOrganization,
                name: 'world_create_organization',
                description: `[WORLD] ${createOrganization.description}`
            });
        }

        const getOrganizations = organizationTools.find(t => t.name === 'get_organizations');
        if (getOrganizations) {
            tools.push({
                ...getOrganizations,
                name: 'world_get_organizations',
                description: `[WORLD] ${getOrganizations.description}`
            });
        }

        // World element tools: create_world_element
        const worldElementTools = this.worldElementHandlers.getWorldElementTools();

        const createWorldElement = worldElementTools.find(t => t.name === 'create_world_element');
        if (createWorldElement) {
            tools.push({
                ...createWorldElement,
                name: 'world_create_world_element',
                description: `[WORLD] ${createWorldElement.description}`
            });
        }

        // Relationship tools: create_relationship_arc, get_relationship_arc
        const relationshipTools = this.relationshipHandlers.getRelationshipTools();

        const createRelationshipArc = relationshipTools.find(t => t.name === 'create_relationship_arc');
        if (createRelationshipArc) {
            tools.push({
                ...createRelationshipArc,
                name: 'relationship_create_relationship_arc',
                description: `[RELATIONSHIP] ${createRelationshipArc.description}`
            });
        }

        const getRelationshipArc = relationshipTools.find(t => t.name === 'get_relationship_arc');
        if (getRelationshipArc) {
            tools.push({
                ...getRelationshipArc,
                name: 'relationship_get_relationship_arc',
                description: `[RELATIONSHIP] ${getRelationshipArc.description}`
            });
        }

        // Series tools (inline until series-server is refactored)
        tools.push({
            name: 'series_list_series',
            description: '[SERIES] List all book series in the database',
            inputSchema: {
                type: 'object',
                properties: {},
                required: []
            }
        });

        tools.push({
            name: 'series_create_series',
            description: '[SERIES] Create a new book series',
            inputSchema: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'Series title' },
                    author_id: { type: 'integer', description: 'ID of the series author' },
                    description: { type: 'string', description: 'Series description' },
                    genre_ids: { type: 'array', items: { type: 'integer' }, description: 'Array of genre IDs for this series' },
                    start_year: { type: 'integer', description: 'Year the series began' },
                    status: { type: 'string', enum: ['ongoing', 'completed', 'hiatus'], description: 'Series status' }
                },
                required: ['title', 'author_id']
            }
        });

        tools.push({
            name: 'series_get_series',
            description: '[SERIES] Get detailed information about a specific series',
            inputSchema: {
                type: 'object',
                properties: {
                    series_id: { type: 'integer', description: 'The ID of the series' }
                },
                required: ['series_id']
            }
        });

        tools.push({
            name: 'series_update_series',
            description: '[SERIES] Update an existing series',
            inputSchema: {
                type: 'object',
                properties: {
                    series_id: { type: 'integer', description: 'The ID of the series to update' },
                    title: { type: 'string', description: 'Series title' },
                    description: { type: 'string', description: 'Series description' },
                    genre_ids: { type: 'array', items: { type: 'integer' }, description: 'Array of genre IDs for this series (replaces all existing genres)' },
                    start_year: { type: 'integer', description: 'Year the series began' },
                    status: { type: 'string', enum: ['ongoing', 'completed', 'hiatus'], description: 'Series status' }
                },
                required: ['series_id']
            }
        });

        // Character tools (inline until character-server is refactored)
        tools.push({
            name: 'character_create_character',
            description: '[CHARACTER] Create a new character in a series',
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
                        description: 'Character type'
                    }
                },
                required: ['series_id', 'name', 'character_type']
            }
        });

        tools.push({
            name: 'character_get_character',
            description: '[CHARACTER] Get detailed information about a specific character',
            inputSchema: {
                type: 'object',
                properties: {
                    character_id: { type: 'integer', description: 'Character ID' }
                },
                required: ['character_id']
            }
        });

        tools.push({
            name: 'character_list_characters',
            description: '[CHARACTER] List all characters in a series',
            inputSchema: {
                type: 'object',
                properties: {
                    series_id: { type: 'integer', description: 'Series ID' }
                },
                required: ['series_id']
            }
        });

        tools.push({
            name: 'character_add_character_detail',
            description: '[CHARACTER] Add a specific detail to a character',
            inputSchema: {
                type: 'object',
                properties: {
                    character_id: { type: 'integer', description: 'Character ID' },
                    detail_type: {
                        type: 'string',
                        enum: ['physical', 'personality', 'backstory', 'skill', 'goal', 'fear'],
                        description: 'Type of detail'
                    },
                    detail_content: { type: 'string', description: 'The detail content' }
                },
                required: ['character_id', 'detail_type', 'detail_content']
            }
        });

        // Metadata tools (inline)
        tools.push({
            name: 'metadata_get_available_options',
            description: '[METADATA] Get valid values for genre, status, and other lookup types',
            inputSchema: {
                type: 'object',
                properties: {
                    option_type: {
                        type: 'string',
                        description: 'Type of options to retrieve (e.g., "genres", "plot_thread_types", "relationship_types")'
                    }
                },
                required: ['option_type']
            }
        });

        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            // Plot handlers
            'plot_create_plot_thread': () => this.plotThreadHandlers.handleCreatePlotThread.bind(this.plotThreadHandlers),
            'plot_get_plot_threads': () => this.plotThreadHandlers.handleGetPlotThreads.bind(this.plotThreadHandlers),
            'plot_update_plot_thread': () => this.plotThreadHandlers.handleUpdatePlotThread.bind(this.plotThreadHandlers),
            'plot_define_world_system': () => this.genreExtensions.handleDefineWorldSystem.bind(this.genreExtensions),

            // World handlers
            'world_create_location': () => this.locationHandlers.handleCreateLocation.bind(this.locationHandlers),
            'world_get_locations': () => this.locationHandlers.handleGetLocations.bind(this.locationHandlers),
            'world_create_organization': () => this.organizationHandlers.handleCreateOrganization.bind(this.organizationHandlers),
            'world_get_organizations': () => this.organizationHandlers.handleGetOrganizations.bind(this.organizationHandlers),
            'world_create_world_element': () => this.worldElementHandlers.handleCreateWorldElement.bind(this.worldElementHandlers),

            // Relationship handlers
            'relationship_create_relationship_arc': () => this.relationshipHandlers.handleCreateRelationshipArc.bind(this.relationshipHandlers),
            'relationship_get_relationship_arc': () => this.relationshipHandlers.handleGetRelationshipArc.bind(this.relationshipHandlers),

            // Series handlers
            'series_list_series': () => this.handleListSeries.bind(this),
            'series_create_series': () => this.handleCreateSeries.bind(this),
            'series_get_series': () => this.handleGetSeries.bind(this),
            'series_update_series': () => this.handleUpdateSeries.bind(this),

            // Character handlers
            'character_create_character': () => this.handleCreateCharacter.bind(this),
            'character_get_character': () => this.handleGetCharacter.bind(this),
            'character_list_characters': () => this.handleListCharacters.bind(this),
            'character_add_character_detail': () => this.handleAddCharacterDetail.bind(this),

            // Metadata handlers
            'metadata_get_available_options': () => this.handleGetAvailableOptions.bind(this)
        };

        const handlerFactory = handlerMap[toolName];
        return handlerFactory ? handlerFactory() : null;
    }

    // Inline handlers for series tools (until series-server is refactored)
    async handleListSeries() {
        const query = 'SELECT * FROM series_with_genres ORDER BY title';
        const result = await this.db.query(query);

        return {
            content: [{
                type: 'text',
                text: `Found ${result.rows.length} series:\n\n` +
                      result.rows.map(s => `ID: ${s.id}\nTitle: ${s.title}\nStatus: ${s.status}\n`).join('\n---\n')
            }]
        };
    }

    async handleCreateSeries(args) {
        const { title, author_id, description, genre_ids, start_year, status = 'ongoing' } = args;
        const query = `
            INSERT INTO series (title, author_id, description, start_year, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await this.db.query(query, [title, author_id, description, start_year, status]);
        const series = result.rows[0];

        // Handle genre associations if provided
        if (genre_ids && genre_ids.length > 0) {
            for (const genreId of genre_ids) {
                await this.db.query(
                    'INSERT INTO series_genres (series_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [series.id, genreId]
                );
            }
        }

        return {
            content: [{
                type: 'text',
                text: `Created series successfully!\n\nID: ${series.id}\nTitle: ${series.title}\nAuthor ID: ${series.author_id}`
            }]
        };
    }

    async handleGetSeries(args) {
        const { series_id } = args;
        const query = 'SELECT * FROM series_with_genres WHERE id = $1';
        const result = await this.db.query(query, [series_id]);

        if (result.rows.length === 0) {
            return {
                content: [{
                    type: 'text',
                    text: `No series found with ID: ${series_id}`
                }]
            };
        }

        const series = result.rows[0];
        return {
            content: [{
                type: 'text',
                text: `Series Details:\n\nID: ${series.id}\nTitle: ${series.title}\nDescription: ${series.description || 'None'}\nStatus: ${series.status}\nGenres: ${series.genre_names ? series.genre_names.join(', ') : 'None'}`
            }]
        };
    }

    async handleUpdateSeries(args) {
        const { series_id, ...updates } = args;
        const updateFields = [];
        const params = [series_id];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined && key !== 'genre_ids') {
                paramCount++;
                updateFields.push(`${key} = $${paramCount}`);
                params.push(value);
            }
        }

        if (updateFields.length > 0) {
            const query = `UPDATE series SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`;
            await this.db.query(query, params);
        }

        return {
            content: [{
                type: 'text',
                text: `Updated series ID ${series_id} successfully!`
            }]
        };
    }

    // Inline handlers for character tools (until character-server is refactored)
    async handleCreateCharacter(args) {
        const { series_id, name, full_name, aliases, character_type } = args;
        const query = `
            INSERT INTO characters (series_id, name, full_name, aliases, character_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await this.db.query(query, [series_id, name, full_name, aliases, character_type]);
        const character = result.rows[0];

        return {
            content: [{
                type: 'text',
                text: `Created character successfully!\n\nID: ${character.id}\nName: ${character.name}\nType: ${character.character_type}`
            }]
        };
    }

    async handleGetCharacter(args) {
        const { character_id } = args;
        const query = 'SELECT * FROM characters WHERE id = $1';
        const result = await this.db.query(query, [character_id]);

        if (result.rows.length === 0) {
            return {
                content: [{
                    type: 'text',
                    text: `No character found with ID: ${character_id}`
                }]
            };
        }

        const character = result.rows[0];
        return {
            content: [{
                type: 'text',
                text: `Character Details:\n\nID: ${character.id}\nName: ${character.name}\nFull Name: ${character.full_name || 'N/A'}\nType: ${character.character_type}`
            }]
        };
    }

    async handleListCharacters(args) {
        const { series_id } = args;
        const query = 'SELECT * FROM characters WHERE series_id = $1 ORDER BY name';
        const result = await this.db.query(query, [series_id]);

        return {
            content: [{
                type: 'text',
                text: `Found ${result.rows.length} characters:\n\n` +
                      result.rows.map(c => `ID: ${c.id}\nName: ${c.name}\nType: ${c.character_type}\n`).join('\n---\n')
            }]
        };
    }

    async handleAddCharacterDetail(args) {
        const { character_id, detail_type, detail_content } = args;
        const query = `
            INSERT INTO character_details (character_id, detail_type, detail_content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await this.db.query(query, [character_id, detail_type, detail_content]);

        return {
            content: [{
                type: 'text',
                text: `Added ${detail_type} detail to character ID ${character_id}`
            }]
        };
    }

    // Inline handler for metadata tools
    async handleGetAvailableOptions(args) {
        const { option_type } = args;

        // Map option types to table names
        const tableMap = {
            'genres': 'genres',
            'plot_thread_types': 'plot_thread_types',
            'relationship_types': 'relationship_types'
        };

        const tableName = tableMap[option_type];
        if (!tableName) {
            return {
                content: [{
                    type: 'text',
                    text: `Unknown option type: ${option_type}. Valid types: ${Object.keys(tableMap).join(', ')}`
                }]
            };
        }

        const query = `SELECT * FROM ${tableName} WHERE is_active = true ORDER BY id`;
        const result = await this.db.query(query);

        return {
            content: [{
                type: 'text',
                text: `Available ${option_type}:\n\n` +
                      result.rows.map((row, idx) => `${idx + 1}. ${row.genre_name || row.type_name || row.name} (ID: ${row.id})`).join('\n')
            }]
        };
    }
}

export { SeriesPlanningMCPServer };

// CLI runner when called directly
import { fileURLToPath } from 'url';

const normalizePath = (path) => {
    if (!path) return '';
    let normalizedPath = path.replace(/\\/g, '/');
    if (!normalizedPath.startsWith('file:')) {
        if (process.platform === 'win32') {
            normalizedPath = `file:///${normalizedPath}`;
        } else {
            normalizedPath = `file://${normalizedPath}`;
        }
    }
    normalizedPath = normalizedPath.replace(/^file:\/+/, 'file:///');
    return normalizedPath;
};

const normalizedScriptPath = normalizePath(process.argv[1]);
const normalizedCurrentModuleUrl = import.meta.url.replace(/\/{3,}/g, '///')
    .replace(/^file:\/([^\/])/, 'file:///$1');

const isDirectExecution = normalizedCurrentModuleUrl === normalizedScriptPath ||
    decodeURIComponent(normalizedCurrentModuleUrl) === normalizedScriptPath;

if (process.env.MCP_STDIO_MODE) {
    console.error('[SERIES-PLANNING-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new SeriesPlanningMCPServer();
        await server.run();
    } catch (error) {
        console.error('[SERIES-PLANNING-SERVER] Failed to start MCP server:', error.message);
        console.error('[SERIES-PLANNING-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[SERIES-PLANNING-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(SeriesPlanningMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[SERIES-PLANNING-SERVER] CLI runner failed:', error.message);
        throw error;
    }
} else {
    console.error('[SERIES-PLANNING-SERVER] Module imported - not starting server');
}
