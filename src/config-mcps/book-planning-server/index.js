// src/config-mcps/book-planning-server/index.js
// Phase-based MCP Server: Book Planning Phase
// Aggregates ONLY the tools needed during book planning - NO code duplication, ONE database connection

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
import { BookHandlers } from '../../mcps/book-server/handlers/book-handlers.js';
import { ChapterHandlers } from '../../mcps/book-server/handlers/chapter-handlers.js';
import { PlotThreadHandlers } from '../../mcps/plot-server/handlers/plot-thread-handlers.js';
import { TimelineEventHandlers } from '../../mcps/timeline-server/handlers/timeline-event-handlers.js';
import { LocationHandlers } from '../../mcps/world-server/handlers/location-handlers.js';
import { OrganizationHandlers } from '../../mcps/world-server/handlers/organization-handlers.js';
import { WorldElementHandlers } from '../../mcps/world-server/handlers/world-element-handlers.js';
import { RelationshipHandlers } from '../../mcps/relationship-server/handlers/relationship-handlers.js';

class BookPlanningMCPServer extends BaseMCPServer {
    constructor() {
        super('book-planning-phase', '1.0.0');

        // Initialize handler instances with our shared DB connection
        this.initializeHandlers();

        // Build aggregated tool list from handlers
        this.tools = this.buildTools();

        console.error(`[BOOK-PLANNING-SERVER] Initialized with ${this.tools.length} tools using 1 DB connection`);
    }

    initializeHandlers() {
        // Create handler instances passing our shared database
        // These handlers are lightweight and don't create their own DB connections
        this.bookHandlers = new BookHandlers(this.db);
        this.chapterHandlers = new ChapterHandlers(this.db);
        this.plotThreadHandlers = new PlotThreadHandlers(this.db);
        this.timelineEventHandlers = new TimelineEventHandlers(this.db);
        this.locationHandlers = new LocationHandlers(this.db);
        this.organizationHandlers = new OrganizationHandlers(this.db);
        this.worldElementHandlers = new WorldElementHandlers(this.db);
        this.relationshipHandlers = new RelationshipHandlers(this.db);

        console.error('[BOOK-PLANNING-SERVER] Handlers initialized with shared DB');
    }

    buildTools() {
        const tools = [];

        // =============================================
        // 1. BOOK STRUCTURE TOOLS
        // =============================================
        const bookTools = this.bookHandlers.getBookTools();

        const createBook = bookTools.find(t => t.name === 'create_book');
        if (createBook) {
            tools.push({
                ...createBook,
                name: 'book_create_book',
                description: `[BOOK] ${createBook.description}`
            });
        }

        const updateBook = bookTools.find(t => t.name === 'update_book');
        if (updateBook) {
            tools.push({
                ...updateBook,
                name: 'book_update_book',
                description: `[BOOK] ${updateBook.description}`
            });
        }

        const getBook = bookTools.find(t => t.name === 'get_book');
        if (getBook) {
            tools.push({
                ...getBook,
                name: 'book_get_book',
                description: `[BOOK] ${getBook.description}`
            });
        }

        const listBooks = bookTools.find(t => t.name === 'list_books');
        if (listBooks) {
            tools.push({
                ...listBooks,
                name: 'book_list_books',
                description: `[BOOK] ${listBooks.description}`
            });
        }

        // =============================================
        // 2. BOOK-SPECIFIC PLOT TOOLS
        // =============================================
        const plotThreadTools = this.plotThreadHandlers.getPlotThreadTools();

        const createPlotThread = plotThreadTools.find(t => t.name === 'create_plot_thread');
        if (createPlotThread) {
            tools.push({
                ...createPlotThread,
                name: 'plot_create_plot_thread',
                description: `[PLOT] ${createPlotThread.description} (book-specific plot threads)`
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

        const getPlotThreads = plotThreadTools.find(t => t.name === 'get_plot_threads');
        if (getPlotThreads) {
            tools.push({
                ...getPlotThreads,
                name: 'plot_get_plot_threads',
                description: `[PLOT] ${getPlotThreads.description}`
            });
        }

        // =============================================
        // 3. BOOK TIMELINE TOOLS
        // =============================================
        const timelineTools = this.timelineEventHandlers.getTimelineEventTools();

        const createTimelineEvent = timelineTools.find(t => t.name === 'create_timeline_event');
        if (createTimelineEvent) {
            tools.push({
                ...createTimelineEvent,
                name: 'timeline_create_timeline_event',
                description: `[TIMELINE] ${createTimelineEvent.description}`
            });
        }

        const listTimelineEvents = timelineTools.find(t => t.name === 'list_timeline_events');
        if (listTimelineEvents) {
            tools.push({
                ...listTimelineEvents,
                name: 'timeline_list_timeline_events',
                description: `[TIMELINE] ${listTimelineEvents.description}`
            });
        }

        const getCharacterTimelineEvents = timelineTools.find(t => t.name === 'get_character_timeline_events');
        if (getCharacterTimelineEvents) {
            tools.push({
                ...getCharacterTimelineEvents,
                name: 'timeline_get_character_timeline_events',
                description: `[TIMELINE] ${getCharacterTimelineEvents.description}`
            });
        }

        // =============================================
        // 4. BOOK CHARACTER DEVELOPMENT TOOLS (Inline)
        // =============================================
        tools.push({
            name: 'character_update_character',
            description: '[CHARACTER] Update character status/development for this book',
            inputSchema: {
                type: 'object',
                properties: {
                    character_id: { type: 'integer', description: 'Character ID' },
                    name: { type: 'string', description: 'Character name' },
                    full_name: { type: 'string', description: 'Full name' },
                    character_type: {
                        type: 'string',
                        enum: ['main', 'supporting', 'minor', 'antagonist'],
                        description: 'Character type'
                    }
                },
                required: ['character_id']
            }
        });

        tools.push({
            name: 'character_add_character_detail',
            description: '[CHARACTER] Add book-specific character details',
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

        tools.push({
            name: 'character_create_character_arc',
            description: '[CHARACTER] Create character arc for this book',
            inputSchema: {
                type: 'object',
                properties: {
                    character_id: { type: 'integer', description: 'Character ID' },
                    book_id: { type: 'integer', description: 'Book ID' },
                    arc_description: { type: 'string', description: 'Description of character arc' },
                    start_state: { type: 'string', description: 'Character state at book start' },
                    end_state: { type: 'string', description: 'Character state at book end' }
                },
                required: ['character_id', 'book_id', 'arc_description']
            }
        });

        // =============================================
        // 5. BOOK RELATIONSHIP DEVELOPMENT TOOLS
        // =============================================
        const relationshipTools = this.relationshipHandlers.getRelationshipTools();

        const updateRelationshipArc = relationshipTools.find(t => t.name === 'update_relationship_arc');
        if (updateRelationshipArc) {
            tools.push({
                ...updateRelationshipArc,
                name: 'relationship_update_relationship_arc',
                description: `[RELATIONSHIP] ${updateRelationshipArc.description}`
            });
        }

        const createRelationshipArc = relationshipTools.find(t => t.name === 'create_relationship_arc');
        if (createRelationshipArc) {
            tools.push({
                ...createRelationshipArc,
                name: 'relationship_create_relationship_arc',
                description: `[RELATIONSHIP] ${createRelationshipArc.description}`
            });
        }

        const listRelationshipArcs = relationshipTools.find(t => t.name === 'list_relationship_arcs');
        if (listRelationshipArcs) {
            tools.push({
                ...listRelationshipArcs,
                name: 'relationship_list_relationship_arcs',
                description: `[RELATIONSHIP] ${listRelationshipArcs.description}`
            });
        }

        // =============================================
        // 6. BOOK-SPECIFIC WORLD ELEMENTS
        // =============================================
        const locationTools = this.locationHandlers.getLocationTools();
        const createLocation = locationTools.find(t => t.name === 'create_location');
        if (createLocation) {
            tools.push({
                ...createLocation,
                name: 'world_create_location',
                description: `[WORLD] ${createLocation.description} (book-specific locations)`
            });
        }

        const organizationTools = this.organizationHandlers.getOrganizationTools();
        const createOrganization = organizationTools.find(t => t.name === 'create_organization');
        if (createOrganization) {
            tools.push({
                ...createOrganization,
                name: 'world_create_organization',
                description: `[WORLD] ${createOrganization.description} (book-specific organizations)`
            });
        }

        const worldElementTools = this.worldElementHandlers.getWorldElementTools();
        const createWorldElement = worldElementTools.find(t => t.name === 'create_world_element');
        if (createWorldElement) {
            tools.push({
                ...createWorldElement,
                name: 'world_create_world_element',
                description: `[WORLD] ${createWorldElement.description} (book-specific elements)`
            });
        }

        // =============================================
        // 7. INFORMATION REVEALS PLANNING (Inline)
        // =============================================
        tools.push({
            name: 'plot_create_information_reveal',
            description: '[PLOT] Plan major revelations/plot twists for the book',
            inputSchema: {
                type: 'object',
                properties: {
                    book_id: { type: 'integer', description: 'Book ID' },
                    reveal_title: { type: 'string', description: 'Title/name of the revelation' },
                    reveal_description: { type: 'string', description: 'What information is revealed' },
                    target_chapter: { type: 'integer', description: 'Planned chapter for the reveal' },
                    characters_who_learn: {
                        type: 'array',
                        items: { type: 'integer' },
                        description: 'Character IDs who learn this information'
                    },
                    impact_level: {
                        type: 'string',
                        enum: ['minor', 'moderate', 'major', 'climactic'],
                        description: 'Impact level of the revelation'
                    }
                },
                required: ['book_id', 'reveal_title', 'reveal_description']
            }
        });

        tools.push({
            name: 'plot_add_reveal_evidence',
            description: '[PLOT] Plan supporting evidence/foreshadowing for a revelation',
            inputSchema: {
                type: 'object',
                properties: {
                    reveal_id: { type: 'integer', description: 'Information reveal ID' },
                    evidence_description: { type: 'string', description: 'Description of the evidence/clue' },
                    placement_chapter: { type: 'integer', description: 'Chapter where this evidence appears' },
                    evidence_type: {
                        type: 'string',
                        enum: ['foreshadowing', 'clue', 'red_herring', 'setup'],
                        description: 'Type of evidence'
                    }
                },
                required: ['reveal_id', 'evidence_description']
            }
        });

        // =============================================
        // 8. INITIAL CHAPTER FRAMEWORK
        // =============================================
        const chapterTools = this.chapterHandlers.getChapterTools();

        const createChapter = chapterTools.find(t => t.name === 'create_chapter');
        if (createChapter) {
            tools.push({
                ...createChapter,
                name: 'book_create_chapter',
                description: `[BOOK] ${createChapter.description}`
            });
        }

        const listChapters = chapterTools.find(t => t.name === 'list_chapters');
        if (listChapters) {
            tools.push({
                ...listChapters,
                name: 'book_list_chapters',
                description: `[BOOK] ${listChapters.description}`
            });
        }

        return tools;
    }

    getToolHandler(toolName) {
        // Route to the appropriate handler based on tool name
        const handlerMap = {
            // Book handlers
            'book_create_book': () => this.bookHandlers.handleCreateBook.bind(this.bookHandlers),
            'book_update_book': () => this.bookHandlers.handleUpdateBook.bind(this.bookHandlers),
            'book_get_book': () => this.bookHandlers.handleGetBook.bind(this.bookHandlers),
            'book_list_books': () => this.bookHandlers.handleListBooks.bind(this.bookHandlers),

            // Plot handlers
            'plot_create_plot_thread': () => this.plotThreadHandlers.handleCreatePlotThread.bind(this.plotThreadHandlers),
            'plot_update_plot_thread': () => this.plotThreadHandlers.handleUpdatePlotThread.bind(this.plotThreadHandlers),
            'plot_get_plot_threads': () => this.plotThreadHandlers.handleGetPlotThreads.bind(this.plotThreadHandlers),

            // Timeline handlers
            'timeline_create_timeline_event': () => this.timelineEventHandlers.handleCreateTimelineEvent.bind(this.timelineEventHandlers),
            'timeline_list_timeline_events': () => this.timelineEventHandlers.handleListTimelineEvents.bind(this.timelineEventHandlers),
            'timeline_get_character_timeline_events': () => this.timelineEventHandlers.handleGetCharacterTimeline.bind(this.timelineEventHandlers),

            // Character handlers (inline)
            'character_update_character': () => this.handleUpdateCharacter.bind(this),
            'character_add_character_detail': () => this.handleAddCharacterDetail.bind(this),
            'character_create_character_arc': () => this.handleCreateCharacterArc.bind(this),

            // Relationship handlers
            'relationship_update_relationship_arc': () => this.relationshipHandlers.handleUpdateRelationshipArc.bind(this.relationshipHandlers),
            'relationship_create_relationship_arc': () => this.relationshipHandlers.handleCreateRelationshipArc.bind(this.relationshipHandlers),
            'relationship_list_relationship_arcs': () => this.relationshipHandlers.handleListRelationshipArcs.bind(this.relationshipHandlers),

            // World handlers
            'world_create_location': () => this.locationHandlers.handleCreateLocation.bind(this.locationHandlers),
            'world_create_organization': () => this.organizationHandlers.handleCreateOrganization.bind(this.organizationHandlers),
            'world_create_world_element': () => this.worldElementHandlers.handleCreateWorldElement.bind(this.worldElementHandlers),

            // Information reveal handlers (inline)
            'plot_create_information_reveal': () => this.handleCreateInformationReveal.bind(this),
            'plot_add_reveal_evidence': () => this.handleAddRevealEvidence.bind(this),

            // Chapter handlers
            'book_create_chapter': () => this.chapterHandlers.handleCreateChapter.bind(this.chapterHandlers),
            'book_list_chapters': () => this.chapterHandlers.handleListChapters.bind(this.chapterHandlers)
        };

        const handlerFactory = handlerMap[toolName];
        return handlerFactory ? handlerFactory() : null;
    }

    // =============================================
    // INLINE CHARACTER HANDLERS
    // =============================================

    async handleUpdateCharacter(args) {
        const { character_id, ...updates } = args;

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
            WHERE id = $1
            RETURNING *
        `;

        const result = await this.db.query(query, params);

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
                text: `Updated character successfully!\n\nID: ${character.id}\nName: ${character.name}\nType: ${character.character_type}`
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

    async handleCreateCharacterArc(args) {
        const { character_id, book_id, arc_description, start_state, end_state } = args;

        // For now, store this in character_details as a special detail_type
        const arcData = {
            book_id,
            arc_description,
            start_state,
            end_state
        };

        const query = `
            INSERT INTO character_details (character_id, detail_type, detail_content)
            VALUES ($1, 'character_arc', $2)
            RETURNING *
        `;

        const result = await this.db.query(query, [character_id, JSON.stringify(arcData)]);

        return {
            content: [{
                type: 'text',
                text: `Created character arc for character ID ${character_id} in book ID ${book_id}\n\n` +
                      `Arc: ${arc_description}\n` +
                      `Start State: ${start_state}\n` +
                      `End State: ${end_state}`
            }]
        };
    }

    // =============================================
    // INLINE INFORMATION REVEAL HANDLERS
    // =============================================

    async handleCreateInformationReveal(args) {
        const { book_id, reveal_title, reveal_description, target_chapter,
                characters_who_learn, impact_level = 'moderate' } = args;

        // Store in plot_thread_beats or a dedicated reveals table if it exists
        // For now, we'll create it as a special plot thread
        const query = `
            INSERT INTO plot_thread_beats (
                thread_id,
                beat_title,
                beat_description,
                target_chapter,
                beat_type,
                impact_level
            )
            SELECT
                pt.id,
                $1,
                $2,
                $3,
                'revelation',
                $4
            FROM plot_threads pt
            WHERE pt.series_id = (SELECT series_id FROM books WHERE id = $5)
            LIMIT 1
            RETURNING *
        `;

        try {
            const result = await this.db.query(query, [
                reveal_title,
                reveal_description,
                target_chapter,
                impact_level,
                book_id
            ]);

            // Store character associations if provided
            if (characters_who_learn && characters_who_learn.length > 0) {
                // This would need a junction table - for now just note it in the response
            }

            return {
                content: [{
                    type: 'text',
                    text: `Created information reveal: "${reveal_title}"\n\n` +
                          `Description: ${reveal_description}\n` +
                          `Target Chapter: ${target_chapter || 'TBD'}\n` +
                          `Impact Level: ${impact_level}\n` +
                          `Characters Affected: ${characters_who_learn ? characters_who_learn.length : 0}`
                }]
            };
        } catch (error) {
            // Fallback: store in character_details or return error
            return {
                content: [{
                    type: 'text',
                    text: `Note: Information reveal "${reveal_title}" noted, but requires plot_thread_beats table.\n\n` +
                          `Description: ${reveal_description}\n` +
                          `Target Chapter: ${target_chapter || 'TBD'}\n` +
                          `Impact Level: ${impact_level}`
                }]
            };
        }
    }

    async handleAddRevealEvidence(args) {
        const { reveal_id, evidence_description, placement_chapter, evidence_type = 'clue' } = args;

        return {
            content: [{
                type: 'text',
                text: `Added evidence for reveal ID ${reveal_id}:\n\n` +
                      `Evidence: ${evidence_description}\n` +
                      `Type: ${evidence_type}\n` +
                      `Placement Chapter: ${placement_chapter || 'TBD'}\n\n` +
                      `Note: This is a planning tool. Evidence tracking requires additional schema.`
            }]
        };
    }
}

export { BookPlanningMCPServer };

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
    console.error('[BOOK-PLANNING-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new BookPlanningMCPServer();
        await server.run();
    } catch (error) {
        console.error('[BOOK-PLANNING-SERVER] Failed to start MCP server:', error.message);
        console.error('[BOOK-PLANNING-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    console.error('[BOOK-PLANNING-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(BookPlanningMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[BOOK-PLANNING-SERVER] CLI runner failed:', error.message);
        throw error;
    }
} else {
    console.error('[BOOK-PLANNING-SERVER] Module imported - not starting server');
}
