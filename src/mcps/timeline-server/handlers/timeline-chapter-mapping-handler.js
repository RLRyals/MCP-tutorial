/**
 * Timeline Event-Chapter Mapping Handler for Timeline Server MCP
 * 
 * Manages the relationship between chronological timeline events and their
 * presentation in narrative chapters. Supports non-linear storytelling,
 * multiple POVs, flashbacks, and other advanced narrative techniques.
 */

export class EventChapterMappingHandlers {
    /**
     * @param {Object} db - Database connection instance
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Get all event-chapter mapping tools
     * @returns {Array} Array of tool definitions
     */
    getEventChapterMappingTools() {
        return [
            {
                name: 'map_event_to_chapter',
                description: 'Connect a timeline event to its presentation in a chapter',
                inputSchema: {
                    type: 'object',
                    required: ['event_id', 'chapter_id'],
                    properties: {
                        event_id: { type: 'integer', description: 'Timeline event ID' },
                        chapter_id: { type: 'integer', description: 'Chapter where event appears' },
                        scene_number: { type: 'integer', description: 'Specific scene within chapter (optional)' },
                        presentation_type: { 
                            type: 'string', 
                            enum: ['direct_scene', 'flashback', 'memory', 'reference', 'foreshadowing', 'dream', 'retelling'],
                            description: 'How the event is presented in the narrative'
                        },
                        pov_character_id: { type: 'integer', description: 'Character whose POV shows this event' },
                        event_aspect: { type: 'string', description: 'Which part or perspective of the event is shown' },
                        completeness: { 
                            type: 'string', 
                            enum: ['full', 'partial', 'glimpse'],
                            description: 'How completely the event is shown',
                            default: 'full'
                        },
                        narrative_function: { type: 'string', description: 'Purpose of showing this event here' }
                    }
                }
            },
            {
                name: 'get_event_mappings',
                description: 'Get chapters where a timeline event appears',
                inputSchema: {
                    type: 'object',
                    required: ['event_id'],
                    properties: {
                        event_id: { type: 'integer', description: 'Timeline event ID' }
                    }
                }
            },
            {
                name: 'get_chapter_events',
                description: 'Get timeline events that appear in a chapter',
                inputSchema: {
                    type: 'object',
                    required: ['chapter_id'],
                    properties: {
                        chapter_id: { type: 'integer', description: 'Chapter ID' },
                        presentation_type: { 
                            type: 'string', 
                            description: 'Filter by presentation type (optional)'
                        },
                        pov_character_id: { 
                            type: 'integer', 
                            description: 'Filter by POV character (optional)'
                        }
                    }
                }
            },
            {
                name: 'update_event_mapping',
                description: 'Update an existing event-chapter mapping',
                inputSchema: {
                    type: 'object',
                    required: ['mapping_id'],
                    properties: {
                        mapping_id: { type: 'integer', description: 'ID of the mapping to update' },
                        scene_number: { type: 'integer', description: 'Specific scene within chapter' },
                        presentation_type: { 
                            type: 'string', 
                            enum: ['direct_scene', 'flashback', 'memory', 'reference', 'foreshadowing', 'dream', 'retelling'],
                            description: 'How the event is presented'
                        },
                        pov_character_id: { type: 'integer', description: 'Character POV for this presentation' },
                        event_aspect: { type: 'string', description: 'Which part of the event is shown' },
                        completeness: { 
                            type: 'string', 
                            enum: ['full', 'partial', 'glimpse'],
                            description: 'How completely the event is shown'
                        },
                        narrative_function: { type: 'string', description: 'Purpose of showing this event here' }
                    }
                }
            },
            {
                name: 'delete_event_mapping',
                description: 'Remove a mapping between an event and a chapter',
                inputSchema: {
                    type: 'object',
                    required: ['mapping_id'],
                    properties: {
                        mapping_id: { type: 'integer', description: 'ID of the mapping to delete' }
                    }
                }
            },
            {
                name: 'analyze_narrative_structure',
                description: 'Analyze the relationship between chronological events and narrative presentation',
                inputSchema: {
                    type: 'object',
                    required: ['book_id'],
                    properties: {
                        book_id: { type: 'integer', description: 'Book to analyze' },
                        analysis_type: { 
                            type: 'string', 
                            enum: ['linearity', 'pov_distribution', 'event_coverage', 'all'],
                            description: 'Type of analysis to perform',
                            default: 'all'
                        }
                    }
                }
            }
        ];
    }

    /**
     * Create a mapping between a timeline event and a chapter
     * @param {Object} args - Function arguments
     * @returns {Object} Created mapping information
     */
    async handleMapEventToChapter(args) {
        const { 
            event_id, 
            chapter_id, 
            scene_number, 
            presentation_type, 
            pov_character_id,
            event_aspect,
            completeness = 'full',
            narrative_function
        } = args;
        
        try {
            // Verify that event and chapter exist
            const validationResult = await this.db.query(
                `SELECT 
                    e.event_name, b.title as book_title, c.chapter_number, c.title as chapter_title,
                    e.event_date, e.book_id as event_book_id, c.book_id as chapter_book_id
                 FROM 
                    timeline_events e,
                    chapters c,
                    books b
                 WHERE 
                    e.id = $1 AND 
                    c.chapter_id = $2 AND
                    c.book_id = b.id`,
                [event_id, chapter_id]
            );
            
            if (validationResult.rows.length === 0) {
                throw new Error('Event ID or Chapter ID not found');
            }
            
            const eventInfo = validationResult.rows[0];
            
            // Optional: Check if event and chapter are from the same book/series
            // Commented out to allow cross-book references (e.g., for prequel events mentioned in later books)
            /*
            if (eventInfo.event_book_id !== eventInfo.chapter_book_id) {
                throw new Error('Event and chapter must belong to the same book');
            }
            */
            
            // Verify character exists if POV character is provided
            if (pov_character_id) {
                const characterResult = await this.db.query(
                    'SELECT name FROM characters WHERE character_id = $1',
                    [pov_character_id]
                );
                
                if (characterResult.rows.length === 0) {
                    throw new Error(`Character with ID ${pov_character_id} not found`);
                }
            }
            
            // Create the mapping
            const mappingResult = await this.db.query(
                `INSERT INTO event_chapter_mappings
                 (event_id, chapter_id, scene_number, presentation_type, 
                  pov_character_id, event_aspect, completeness, narrative_function)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING mapping_id`,
                [
                    event_id, 
                    chapter_id, 
                    scene_number, 
                    presentation_type, 
                    pov_character_id,
                    event_aspect,
                    completeness,
                    narrative_function
                ]
            );
            
            const mapping_id = mappingResult.rows[0].mapping_id;
            
            // Get character name for response if POV character is provided
            let povCharacterName = null;
            if (pov_character_id) {
                const characterResult = await this.db.query(
                    'SELECT name FROM characters WHERE character_id = $1',
                    [pov_character_id]
                );
                povCharacterName = characterResult.rows[0].name;
            }
            
            // Format the response
            return {
                mapping_id,
                event: {
                    event_id,
                    name: eventInfo.event_name,
                    date: eventInfo.event_date
                },
                chapter: {
                    chapter_id,
                    number: eventInfo.chapter_number,
                    title: eventInfo.chapter_title,
                    book: eventInfo.book_title
                },
                presentation: {
                    type: presentation_type,
                    pov_character: povCharacterName,
                    scene_number,
                    completeness,
                    aspect: event_aspect
                },
                narrative_function,
                message: `Event "${eventInfo.event_name}" mapped to Chapter ${eventInfo.chapter_number}${eventInfo.chapter_title ? ` (${eventInfo.chapter_title})` : ''} as ${presentation_type}${povCharacterName ? ` from ${povCharacterName}'s POV` : ''}`
            };
        } 
        catch (error) {
            throw new Error(`Failed to map event to chapter: ${error.message}`);
        }
    }

    /**
     * Get all chapters where a timeline event appears
     * @param {Object} args - Function arguments
     * @returns {Object} All chapter appearances of the event
     */
    async handleGetEventMappings(args) {
        const { event_id } = args;
        
        try {
            // Get the event details
            const eventResult = await this.db.query(
                'SELECT event_name, event_date FROM timeline_events WHERE id = $1',
                [event_id]
            );
            
            if (eventResult.rows.length === 0) {
                throw new Error(`Event with ID ${event_id} not found`);
            }
            
            const event = eventResult.rows[0];
            
            // Get all mappings for this event
            const mappingsResult = await this.db.query(
                `SELECT 
                    m.mapping_id, m.chapter_id, m.scene_number, 
                    m.presentation_type, m.pov_character_id, m.event_aspect,
                    m.completeness, m.narrative_function,
                    c.chapter_number, c.title as chapter_title,
                    b.title as book_title, b.id as book_id,
                    ch.name as character_name
                 FROM 
                    event_chapter_mappings m
                    JOIN chapters c ON m.chapter_id = c.chapter_id
                    JOIN books b ON c.book_id = b.id
                    LEFT JOIN characters ch ON m.pov_character_id = ch.character_id
                 WHERE 
                    m.event_id = $1
                 ORDER BY 
                    b.book_number, c.chapter_number`,
                [event_id]
            );
            
            // Format the response
            return {
                event_id,
                event_name: event.event_name,
                event_date: event.event_date,
                appearance_count: mappingsResult.rows.length,
                appearances: mappingsResult.rows.map(row => ({
                    mapping_id: row.mapping_id,
                    book: {
                        book_id: row.book_id,
                        title: row.book_title
                    },
                    chapter: {
                        chapter_id: row.chapter_id,
                        number: row.chapter_number,
                        title: row.chapter_title
                    },
                    scene_number: row.scene_number,
                    presentation_type: row.presentation_type,
                    pov_character: row.character_name,
                    event_aspect: row.event_aspect,
                    completeness: row.completeness,
                    narrative_function: row.narrative_function
                }))
            };
        } 
        catch (error) {
            throw new Error(`Failed to get event mappings: ${error.message}`);
        }
    }

    /**
     * Get all timeline events that appear in a chapter
     * @param {Object} args - Function arguments
     * @returns {Object} All events appearing in the chapter
     */
    async handleGetChapterEvents(args) {
        const { chapter_id, presentation_type, pov_character_id } = args;
        
        try {
            // Verify chapter exists
            const chapterResult = await this.db.query(
                `SELECT c.chapter_number, c.title as chapter_title, b.title as book_title, b.id as book_id
                 FROM chapters c
                 JOIN books b ON c.book_id = b.id
                 WHERE c.chapter_id = $1`,
                [chapter_id]
            );
            
            if (chapterResult.rows.length === 0) {
                throw new Error(`Chapter with ID ${chapter_id} not found`);
            }
            
            const chapter = chapterResult.rows[0];
            
            // Build query conditions
            let conditions = ['m.chapter_id = $1'];
            let params = [chapter_id];
            let paramCounter = 2;
            
            if (presentation_type) {
                conditions.push(`m.presentation_type = $${paramCounter}`);
                params.push(presentation_type);
                paramCounter++;
            }
            
            if (pov_character_id) {
                conditions.push(`m.pov_character_id = $${paramCounter}`);
                params.push(pov_character_id);
                paramCounter++;
            }
            
            const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
            
            // Get all events in this chapter
            const eventsResult = await this.db.query(
                `SELECT 
                    m.mapping_id, m.event_id, m.scene_number, 
                    m.presentation_type, m.pov_character_id, m.event_aspect,
                    m.completeness, m.narrative_function,
                    e.event_name, e.event_date, e.event_description,
                    ch.name as character_name
                 FROM 
                    event_chapter_mappings m
                    JOIN timeline_events e ON m.event_id = e.id
                    LEFT JOIN characters ch ON m.pov_character_id = ch.character_id
                 ${whereClause}
                 ORDER BY 
                    COALESCE(m.scene_number, 999)`,
                params
            );
            
            // Format the response
            return {
                chapter_id,
                chapter_number: chapter.chapter_number,
                chapter_title: chapter.chapter_title,
                book: {
                    book_id: chapter.book_id,
                    title: chapter.book_title
                },
                event_count: eventsResult.rows.length,
                events: eventsResult.rows.map(row => ({
                    mapping_id: row.mapping_id,
                    event: {
                        event_id: row.event_id,
                        name: row.event_name,
                        date: row.event_date,
                        description: row.event_description
                    },
                    scene_number: row.scene_number,
                    presentation_type: row.presentation_type,
                    pov_character: row.character_name,
                    event_aspect: row.event_aspect,
                    completeness: row.completeness,
                    narrative_function: row.narrative_function
                }))
            };
        } 
        catch (error) {
            throw new Error(`Failed to get chapter events: ${error.message}`);
        }
    }

    /**
     * Update an existing event-chapter mapping
     * @param {Object} args - Function arguments
     * @returns {Object} Updated mapping information
     */
    async handleUpdateEventMapping(args) {
        const { 
            mapping_id, 
            scene_number, 
            presentation_type, 
            pov_character_id,
            event_aspect,
            completeness,
            narrative_function
        } = args;
        
        try {
            // Verify mapping exists
            const mappingResult = await this.db.query(
                `SELECT 
                    m.event_id, m.chapter_id,
                    e.event_name,
                    c.chapter_number, c.title as chapter_title,
                    b.title as book_title
                 FROM 
                    event_chapter_mappings m
                    JOIN timeline_events e ON m.event_id = e.id
                    JOIN chapters c ON m.chapter_id = c.chapter_id
                    JOIN books b ON c.book_id = b.id
                 WHERE 
                    m.mapping_id = $1`,
                [mapping_id]
            );
            
            if (mappingResult.rows.length === 0) {
                throw new Error(`Mapping with ID ${mapping_id} not found`);
            }
            
            const mapping = mappingResult.rows[0];
            
            // Verify character exists if POV character is provided
            let povCharacterName = null;
            if (pov_character_id) {
                const characterResult = await this.db.query(
                    'SELECT name FROM characters WHERE character_id = $1',
                    [pov_character_id]
                );
                
                if (characterResult.rows.length === 0) {
                    throw new Error(`Character with ID ${pov_character_id} not found`);
                }
                
                povCharacterName = characterResult.rows[0].name;
            }
            
            // Build update query dynamically based on provided fields
            let updates = [];
            let params = [mapping_id]; // First parameter is always mapping_id
            let paramCounter = 2;
            
            if (scene_number !== undefined) {
                updates.push(`scene_number = $${paramCounter}`);
                params.push(scene_number);
                paramCounter++;
            }
            
            if (presentation_type !== undefined) {
                updates.push(`presentation_type = $${paramCounter}`);
                params.push(presentation_type);
                paramCounter++;
            }
            
            if (pov_character_id !== undefined) {
                updates.push(`pov_character_id = $${paramCounter}`);
                params.push(pov_character_id);
                paramCounter++;
            }
            
            if (event_aspect !== undefined) {
                updates.push(`event_aspect = $${paramCounter}`);
                params.push(event_aspect);
                paramCounter++;
            }
            
            if (completeness !== undefined) {
                updates.push(`completeness = $${paramCounter}`);
                params.push(completeness);
                paramCounter++;
            }
            
            if (narrative_function !== undefined) {
                updates.push(`narrative_function = $${paramCounter}`);
                params.push(narrative_function);
                paramCounter++;
            }
            
            // Add updated_at timestamp
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            
            // If no updates provided, return current mapping
            if (updates.length === 0) {
                return {
                    mapping_id,
                    message: 'No updates provided. Mapping unchanged.',
                    event: {
                        event_id: mapping.event_id,
                        name: mapping.event_name
                    },
                    chapter: {
                        chapter_id: mapping.chapter_id,
                        number: mapping.chapter_number,
                        title: mapping.chapter_title,
                        book: mapping.book_title
                    }
                };
            }
            
            // Update the mapping
            await this.db.query(
                `UPDATE event_chapter_mappings
                 SET ${updates.join(', ')}
                 WHERE mapping_id = $1`,
                params
            );
            
            // Get updated mapping info
            const updatedResult = await this.db.query(
                `SELECT 
                    m.*, 
                    e.event_name,
                    c.chapter_number, c.title as chapter_title,
                    b.title as book_title,
                    ch.name as character_name
                 FROM 
                    event_chapter_mappings m
                    JOIN timeline_events e ON m.event_id = e.id
                    JOIN chapters c ON m.chapter_id = c.chapter_id
                    JOIN books b ON c.book_id = b.id
                    LEFT JOIN characters ch ON m.pov_character_id = ch.character_id
                 WHERE 
                    m.mapping_id = $1`,
                [mapping_id]
            );
            
            const updated = updatedResult.rows[0];
            
            // Format the response
            return {
                mapping_id,
                event: {
                    event_id: mapping.event_id,
                    name: mapping.event_name
                },
                chapter: {
                    chapter_id: mapping.chapter_id,
                    number: mapping.chapter_number,
                    title: mapping.chapter_title,
                    book: mapping.book_title
                },
                presentation: {
                    type: updated.presentation_type,
                    pov_character: updated.character_name,
                    scene_number: updated.scene_number,
                    completeness: updated.completeness,
                    aspect: updated.event_aspect
                },
                narrative_function: updated.narrative_function,
                message: `Updated mapping between "${mapping.event_name}" and Chapter ${mapping.chapter_number}`
            };
        } 
        catch (error) {
            throw new Error(`Failed to update event mapping: ${error.message}`);
        }
    }

    /**
     * Delete an event-chapter mapping
     * @param {Object} args - Function arguments
     * @returns {Object} Result of the deletion
     */
    async handleDeleteEventMapping(args) {
        const { mapping_id } = args;
        
        try {
            // Get mapping info before deletion
            const mappingResult = await this.db.query(
                `SELECT 
                    m.event_id, m.chapter_id,
                    e.event_name,
                    c.chapter_number, c.title as chapter_title,
                    b.title as book_title
                 FROM 
                    event_chapter_mappings m
                    JOIN timeline_events e ON m.event_id = e.id
                    JOIN chapters c ON m.chapter_id = c.chapter_id
                    JOIN books b ON c.book_id = b.id
                 WHERE 
                    m.mapping_id = $1`,
                [mapping_id]
            );
            
            if (mappingResult.rows.length === 0) {
                throw new Error(`Mapping with ID ${mapping_id} not found`);
            }
            
            const mapping = mappingResult.rows[0];
            
            // Delete the mapping
            await this.db.query(
                'DELETE FROM event_chapter_mappings WHERE mapping_id = $1',
                [mapping_id]
            );
            
            // Format the response
            return {
                success: true,
                message: `Removed mapping between event "${mapping.event_name}" and Chapter ${mapping.chapter_number}${mapping.chapter_title ? ` (${mapping.chapter_title})` : ''} in ${mapping.book_title}`,
                event_id: mapping.event_id,
                chapter_id: mapping.chapter_id
            };
        } 
        catch (error) {
            throw new Error(`Failed to delete event mapping: ${error.message}`);
        }
    }

    /**
     * Analyze the relationship between chronological events and narrative presentation
     * @param {Object} args - Function arguments
     * @returns {Object} Analysis results
     */
    async handleAnalyzeNarrativeStructure(args) {
        const { book_id, analysis_type = 'all' } = args;
        
        try {
            // Verify book exists
            const bookResult = await this.db.query(
                'SELECT title, book_number FROM books WHERE book_id = $1',
                [book_id]
            );
            
            if (bookResult.rows.length === 0) {
                throw new Error(`Book with ID ${book_id} not found`);
            }
            
            const book = bookResult.rows[0];
            
            // Get all chapters for this book
            const chaptersResult = await this.db.query(
                'SELECT chapter_id, chapter_number, title FROM chapters WHERE book_id = $1 ORDER BY chapter_number',
                [book_id]
            );
            
            // Get all timeline events that appear in this book's chapters
            //might need to fix the first field to be e.id as event_id
            const eventsQuery = `
                SELECT 
                    e.id, e.event_name, e.event_date, e.book_id as event_book_id,
                    m.mapping_id, m.chapter_id, m.presentation_type, m.pov_character_id,
                    c.chapter_number,
                    ch.name as character_name
                FROM 
                    event_chapter_mappings m
                    JOIN timeline_events e ON m.event_id = e.id
                    JOIN chapters c ON m.chapter_id = c.chapter_id
                    LEFT JOIN characters ch ON m.pov_character_id = ch.character_id
                WHERE 
                    c.book_id = $1
                ORDER BY 
                    e.event_date, c.chapter_number`;
            
            const eventsResult = await this.db.query(eventsQuery, [book_id]);
            
            // Initialize response object
            const response = {
                book_id,
                book_title: book.title,
                book_number: book.book_number,
                chapter_count: chaptersResult.rows.length,
                mapped_events_count: new Set(eventsResult.rows.map(row => row.event_id)).size,
                total_mappings: eventsResult.rows.length,
                analysis_type,
                analysis_date: new Date().toISOString()
            };
            
            // Linearity Analysis - how chronological vs. non-linear is the narrative
            if (analysis_type === 'linearity' || analysis_type === 'all') {
                // Group events by chapter
                const chapterEvents = chaptersResult.rows.map(chapter => {
                    const events = eventsResult.rows.filter(row => row.chapter_id === chapter.chapter_id);
                    return {
                        chapter_number: chapter.chapter_number,
                        events: events.map(e => ({
                            event_id: e.event_id,
                            event_name: e.event_name,
                            event_date: e.event_date,
                            presentation_type: e.presentation_type
                        }))
                    };
                });
                
                // Calculate non-linearity score
                let nonLinearityScore = 0;
                let flashbackCount = 0;
                let flashforwardCount = 0;
                let presentCount = 0;
                
                // Count non-linear presentations
                eventsResult.rows.forEach(row => {
                    if (row.presentation_type === 'flashback' || row.presentation_type === 'memory') {
                        flashbackCount++;
                    } else if (row.presentation_type === 'foreshadowing' || row.presentation_type === 'dream') {
                        flashforwardCount++;
                    } else if (row.presentation_type === 'direct_scene') {
                        presentCount++;
                    }
                });
                
                // Analyze chronological order disruptions
                let lastEventDate = null;
                let chronologyBreaks = 0;
                
                chapterEvents.forEach(chapter => {
                    if (chapter.events.length > 0) {
                        // Sort events in this chapter by their actual chronological date
                        const chronologicalEvents = [...chapter.events].sort((a, b) => 
                            new Date(a.event_date) - new Date(b.event_date)
                        );
                        
                        // Check if the first event in this chapter comes after the last event from previous chapters
                        if (lastEventDate && new Date(chronologicalEvents[0].event_date) < lastEventDate) {
                            chronologyBreaks++;
                        }
                        
                        // Update last event date
                        lastEventDate = new Date(chronologicalEvents[chronologicalEvents.length - 1].event_date);
                    }
                });
                
                // Calculate overall non-linearity score (0-100)
                const totalPresentations = flashbackCount + flashforwardCount + presentCount;
                const nonLinearPercentage = totalPresentations > 0 
                    ? Math.round(((flashbackCount + flashforwardCount) / totalPresentations) * 100) 
                    : 0;
                
                nonLinearityScore = Math.min(100, nonLinearPercentage + (chronologyBreaks * 5));
                
                response.linearity_analysis = {
                    non_linearity_score: nonLinearityScore,
                    narrative_style: categorizeNarrativeStyle(nonLinearityScore),
                    chronology_breaks: chronologyBreaks,
                    time_jumps: {
                        flashbacks: flashbackCount,
                        flashforwards: flashforwardCount,
                        present_scenes: presentCount
                    },
                    chapter_flow: chapterEvents.map(chapter => ({
                        chapter: chapter.chapter_number,
                        event_count: chapter.events.length,
                        time_direction: categorizeTimeDirection(chapter.events)
                    }))
                };
                
                // Helper function to categorize narrative style
                function categorizeNarrativeStyle(score) {
                    if (score < 10) return 'Strictly Linear';
                    if (score < 30) return 'Mostly Linear';
                    if (score < 50) return 'Balanced';
                    if (score < 70) return 'Moderately Non-linear';
                    return 'Highly Non-linear';
                }
                
                // Helper function to categorize time direction
                function categorizeTimeDirection(events) {
                    const flashbacks = events.filter(e => 
                        e.presentation_type === 'flashback' || e.presentation_type === 'memory'
                    ).length;
                    
                    const flashforwards = events.filter(e => 
                        e.presentation_type === 'foreshadowing' || e.presentation_type === 'dream'
                    ).length;
                    
                    const present = events.filter(e => e.presentation_type === 'direct_scene').length;
                    
                    if (flashbacks > present && flashbacks > flashforwards) return 'Primarily Past';
                    if (flashforwards > present && flashforwards > flashbacks) return 'Primarily Future';
                    if (present > 0 && flashbacks === 0 && flashforwards === 0) return 'Present Only';
                    return 'Mixed Timeline';
                }
            }
            
            // POV Distribution Analysis
            if (analysis_type === 'pov_distribution' || analysis_type === 'all') {
                // Group events by POV character
                const povCounts = {};
                const povChapters = {};
                
                eventsResult.rows.forEach(row => {
                    if (row.pov_character_id) {
                        // Count POV instances
                        povCounts[row.pov_character_id] = (povCounts[row.pov_character_id] || 0) + 1;
                        
                        // Track chapters where this POV appears
                        if (!povChapters[row.pov_character_id]) {
                            povChapters[row.pov_character_id] = new Set();
                        }
                        povChapters[row.pov_character_id].add(row.chapter_number);
                    }
                });
                
                // Get names for POV characters
                const povCharacters = [];
                for (const charId in povCounts) {
                    const characterResult = await this.db.query(
                        'SELECT name, character_type FROM characters WHERE character_id = $1',
                        [charId]
                    );
                    
                    if (characterResult.rows.length > 0) {
                        povCharacters.push({
                            character_id: parseInt(charId),
                            name: characterResult.rows[0].name,
                            character_type: characterResult.rows[0].character_type,
                            pov_count: povCounts[charId],
                            chapter_coverage: Array.from(povChapters[charId]).sort((a, b) => a - b),
                            percentage: Math.round((povCounts[charId] / eventsResult.rows.length) * 100)
                        });
                    }
                }
                
                // Sort POV characters by frequency
                povCharacters.sort((a, b) => b.pov_count - a.pov_count);
                
                // Calculate POV concentration
                const povConcentration = povCharacters.length > 0 
                    ? Math.round((povCharacters[0].pov_count / eventsResult.rows.length) * 100) 
                    : 0;
                
                response.pov_distribution = {
                    pov_character_count: povCharacters.length,
                    primary_pov: povCharacters.length > 0 ? povCharacters[0].name : 'None',
                    pov_concentration: povConcentration,
                    narrative_perspective: categorizePerspective(povCharacters, povConcentration),
                    pov_characters: povCharacters
                };
                
                // Helper function to categorize narrative perspective
                function categorizePerspective(characters, concentration) {
                    if (characters.length === 0) return 'Objective/No POV';
                    if (characters.length === 1) return 'Single POV';
                    if (concentration > 70) return 'Dominant POV with Occasional Others';
                    if (characters.length === 2) return 'Dual POV';
                    if (characters.length <= 4) return 'Multiple POV (Limited)';
                    return 'Multiple POV (Ensemble)';
                }
            }
            
            // Event Coverage Analysis
            if (analysis_type === 'event_coverage' || analysis_type === 'all') {
                // Find events that appear multiple times
                const eventFrequency = {};
                const eventPresentations = {};
                
                eventsResult.rows.forEach(row => {
                    // Count event appearances
                    eventFrequency[row.event_id] = (eventFrequency[row.event_id] || 0) + 1;
                    
                    // Track presentation types for each event
                    if (!eventPresentations[row.event_id]) {
                        eventPresentations[row.event_id] = {
                            event_name: row.event_name,
                            event_date: row.event_date,
                            event_book_id: row.event_book_id,
                            presentations: {}
                        };
                    }
                    
                    const presentationType = row.presentation_type || 'unknown';
                    eventPresentations[row.event_id].presentations[presentationType] = 
                        (eventPresentations[row.event_id].presentations[presentationType] || 0) + 1;
                });
                
                // Get recurring events (shown more than once)
                const recurringEvents = [];
                for (const eventId in eventFrequency) {
                    if (eventFrequency[eventId] > 1) {
                        recurringEvents.push({
                            event_id: parseInt(eventId),
                            event_name: eventPresentations[eventId].event_name,
                            appearance_count: eventFrequency[eventId],
                            presentation_types: Object.entries(eventPresentations[eventId].presentations)
                                .map(([type, count]) => ({ type, count }))
                        });
                    }
                }
                
                // Sort recurring events by frequency
                recurringEvents.sort((a, b) => b.appearance_count - a.appearance_count);
                
                // Find events from other books (referenced events)
                const externalEvents = [];
                for (const eventId in eventPresentations) {
                    const eventInfo = eventPresentations[eventId];
                    if (eventInfo.event_book_id !== book_id) {
                        externalEvents.push({
                            event_id: parseInt(eventId),
                            event_name: eventInfo.event_name,
                            from_book_id: eventInfo.event_book_id,
                            appearance_count: eventFrequency[eventId],
                            presentation_types: Object.entries(eventInfo.presentations)
                                .map(([type, count]) => ({ type, count }))
                        });
                    }
                }
                
                // Find most significant events (most frequently shown)
                const significantEvents = Object.entries(eventFrequency)
                    .map(([eventId, count]) => ({
                        event_id: parseInt(eventId),
                        event_name: eventPresentations[eventId].event_name,
                        appearance_count: count
                    }))
                    .sort((a, b) => b.appearance_count - a.appearance_count)
                    .slice(0, 5);
                
                response.event_coverage = {
                    unique_events_count: Object.keys(eventFrequency).length,
                    recurring_events_count: recurringEvents.length,
                    external_events_count: externalEvents.length,
                    most_significant_events: significantEvents,
                    recurring_events: recurringEvents,
                    external_references: externalEvents
                };
            }
            
            return response;
        } 
        catch (error) {
            throw new Error(`Failed to analyze narrative structure: ${error.message}`);
        }
    }
}
            