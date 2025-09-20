/**
 * Timeline Event Handlers for Timeline Server MCP
 * 
 * Manages the creation, retrieval, and updating of timeline events
 * which represent the chronological history of events in a story world.
 */

export class TimelineEventHandlers {
    /**
     * @param {Object} db - Database connection instance
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Get all timeline event related tools
     * @returns {Array} Array of tool definitions
     */
    getTimelineEventTools() {
        return [
            {
                name: 'list_timeline_events',
                description: 'List timeline events, optionally filtered by series',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'Filter by series ID (optional)' },
                        book_id: { type: 'integer', description: 'Filter by book ID (optional)' },
                        time_period: { type: 'string', description: 'Filter by time period (e.g., "Year 1", "Before War", etc.)' }
                    },
                    required: []
                }
            },
            {
                name: 'get_timeline_event',
                description: 'Get detailed information about a specific timeline event',
                inputSchema: {
                    type: 'object',
                    properties: {
                        event_id: { type: 'integer', description: 'The ID of the timeline event' }
                    },
                    required: ['event_id']
                }
            },
            {
                name: 'create_timeline_event',
                description: 'Create a new timeline event for a series',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'ID of the series' },
                        event_name: { type: 'string', description: 'Name of the event' },
                        event_description: { type: 'string', description: 'Description of the event' },
                        event_date: { type: 'string', description: 'Date of the event (in-universe date)' },
                        book_id: { type: 'integer', description: 'Associated book ID (optional)' },
                        sort_order: { type: 'integer', description: 'Order in timeline (optional)' },
                        time_period: { type: 'string', description: 'Time period grouping (optional)' },
                        participants: { 
                            type: 'array', 
                            items: { type: 'integer' },
                            description: 'Character IDs of participants in this event (optional)'
                        },
                        significance: { 
                            type: 'string', 
                            enum: ['major', 'minor', 'background'],
                            description: 'Importance of this event to the overall story'
                        },
                        is_public_knowledge: { 
                            type: 'boolean',
                            description: 'Whether this event is widely known in the story world'
                        }
                    },
                    required: ['series_id', 'event_name', 'event_date']
                }
            },
            {
                name: 'update_timeline_event',
                description: 'Update an existing timeline event',
                inputSchema: {
                    type: 'object',
                    properties: {
                        event_id: { type: 'integer', description: 'The ID of the event to update' },
                        event_name: { type: 'string', description: 'Name of the event' },
                        event_description: { type: 'string', description: 'Description of the event' },
                        event_date: { type: 'string', description: 'Date of the event (in-universe date)' },
                        book_id: { type: 'integer', description: 'Associated book ID' },
                        sort_order: { type: 'integer', description: 'Order in timeline' },
                        time_period: { type: 'string', description: 'Time period grouping' },
                        participants: { 
                            type: 'array', 
                            items: { type: 'integer' },
                            description: 'Character IDs of participants in this event'
                        },
                        significance: { 
                            type: 'string', 
                            enum: ['major', 'minor', 'background'],
                            description: 'Importance of this event to the overall story'
                        },
                        is_public_knowledge: { 
                            type: 'boolean',
                            description: 'Whether this event is widely known in the story world'
                        }
                    },
                    required: ['event_id']
                }
            },
            {
                name: 'delete_timeline_event',
                description: 'Delete a timeline event',
                inputSchema: {
                    type: 'object',
                    properties: {
                        event_id: { type: 'integer', description: 'The ID of the event to delete' },
                        confirm_deletion: { type: 'boolean', description: 'Confirmation flag for deletion' }
                    },
                    required: ['event_id', 'confirm_deletion']
                }
            },
            {
                name: 'get_character_timeline',
                description: 'Get all timeline events involving a specific character',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: { type: 'integer', description: 'Character ID to find events for' },
                        include_nonparticipant_events: { 
                            type: 'boolean', 
                            description: 'Whether to include major events the character didn\'t participate in',
                            default: false
                        }
                    },
                    required: ['character_id']
                }
            },
            {
                name: 'find_timeline_inconsistencies',
                description: 'Analyze the timeline for potential continuity problems',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID to analyze' },
                        check_character_logistics: { 
                            type: 'boolean', 
                            description: 'Check for character travel/location inconsistencies',
                            default: true
                        }
                    },
                    required: ['series_id']
                }
            }
        ];
    }

    /**
     * List timeline events, optionally filtered by series
     * @param {Object} args - Function arguments
     * @returns {Object} List of timeline events
     */
    async handleListTimelineEvents(args) {
        try {
            const { series_id, book_id, time_period } = args;
            
            // Build query conditions
            let conditions = [];
            let params = [];
            let paramCounter = 1;
            
            if (series_id) {
                conditions.push(`t.series_id = $${paramCounter}`);
                params.push(series_id);
                paramCounter++;
            }
            
            if (book_id) {
                conditions.push(`t.book_id = $${paramCounter}`);
                params.push(book_id);
                paramCounter++;
            }
            
            if (time_period) {
                conditions.push(`t.time_period = $${paramCounter}`);
                params.push(time_period);
                paramCounter++;
            }
            
            const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
            
            // Query timeline events with related information
            const query = `
                SELECT 
                    t.id as event_id, 
                    t.event_name, 
                    t.event_description, 
                    t.event_date, 
                    t.sort_order,
                    t.time_period,
                    t.significance,
                    t.is_public_knowledge,
                    t.created_at,
                    t.updated_at,
                    s.id as series_id,
                    s.title AS series_title,
                    b.id as book_id,
                    b.title AS book_title,
                    array_agg(DISTINCT c.character_id) FILTER (WHERE c.character_id IS NOT NULL) AS participant_ids,
                    array_agg(DISTINCT c.name) FILTER (WHERE c.character_id IS NOT NULL) AS participant_names
                FROM 
                    timeline_events t
                    JOIN series s ON t.series_id = s.id
                    LEFT JOIN books b ON t.book_id = b.id
                    LEFT JOIN event_participants ep ON t.id = ep.event_id
                    LEFT JOIN characters c ON ep.character_id = c.character_id
                ${whereClause}
                GROUP BY 
                    t.id, s.id, b.id
                ORDER BY 
                    t.sort_order,
                    t.event_date
            `;
            
            const result = await this.db.query(query, params);
            
            // Format the response
            const formattedEvents = result.rows.map(event => ({
                event_id: event.event_id,
                event_name: event.event_name,
                event_date: event.event_date,
                description: event.event_description,
                series: {
                    series_id: event.series_id,
                    title: event.series_title
                },
                book: event.book_id ? {
                    book_id: event.book_id,
                    title: event.book_title
                } : null,
                time_period: event.time_period,
                significance: event.significance,
                is_public_knowledge: event.is_public_knowledge,
                sort_order: event.sort_order,
                participants: event.participant_ids && event.participant_ids.length > 0 ?
                    event.participant_ids.map((id, index) => ({
                        character_id: id,
                        name: event.participant_names[index]
                    })) : [],
                created_at: event.created_at,
                updated_at: event.updated_at
            }));
            
            return {
                event_count: formattedEvents.length,
                events: formattedEvents
            };
        } 
        catch (error) {
            throw new Error(`Failed to list timeline events: ${error.message}`);
        }
    }

    /**
     * Get detailed information about a specific timeline event
     * @param {Object} args - Function arguments
     * @returns {Object} Detailed timeline event information
     */
    async handleGetTimelineEvent(args) {
        try {
            const { event_id } = args;
            
            // Query the event with related information
            const query = `
                SELECT 
                    t.id as event_id, 
                    t.event_name, 
                    t.event_description, 
                    t.event_date, 
                    t.sort_order,
                    t.time_period,
                    t.significance,
                    t.is_public_knowledge,
                    t.created_at,
                    t.updated_at,
                    s.id as series_id,
                    s.title AS series_title,
                    b.id as book_id,
                    b.title AS book_title,
                    array_agg(DISTINCT c.character_id) FILTER (WHERE c.character_id IS NOT NULL) AS participant_ids,
                    array_agg(DISTINCT c.name) FILTER (WHERE c.character_id IS NOT NULL) AS participant_names
                FROM 
                    timeline_events t
                    JOIN series s ON t.series_id = s.id
                    LEFT JOIN books b ON t.book_id = b.id
                    LEFT JOIN event_participants ep ON t.id = ep.event_id
                    LEFT JOIN characters c ON ep.character_id = c.character_id
                WHERE 
                    t.id = $1
                GROUP BY 
                    t.id, s.id, b.id
            `;
            
            const result = await this.db.query(query, [event_id]);
            
            if (result.rows.length === 0) {
                throw new Error(`Timeline event with ID ${event_id} not found`);
            }
            
            const event = result.rows[0];
            
            // Get chapter references for this event (if implemented)
            let chapterReferences = [];
            try {
                const referencesQuery = `
                    SELECT 
                        m.mapping_id,
                        m.chapter_id,
                        m.presentation_type,
                        c.chapter_number,
                        c.title AS chapter_title,
                        b.id as book_id,
                        b.title AS book_title,
                        ch.character_id AS pov_character_id,
                        ch.name AS pov_character_name
                    FROM 
                        event_chapter_mappings m
                        JOIN chapters c ON m.chapter_id = c.chapter_id
                        JOIN books b ON c.book_id = b.id
                        LEFT JOIN characters ch ON m.pov_character_id = ch.character_id
                    WHERE 
                        m.event_id = $1
                    ORDER BY
                        b.book_number,
                        c.chapter_number
                `;
                
                const referencesResult = await this.db.query(referencesQuery, [event_id]);
                
                chapterReferences = referencesResult.rows.map(ref => ({
                    mapping_id: ref.mapping_id,
                    chapter: {
                        chapter_id: ref.chapter_id,
                        number: ref.chapter_number,
                        title: ref.chapter_title
                    },
                    book: {
                        book_id: ref.book_id,
                        title: ref.book_title
                    },
                    presentation_type: ref.presentation_type,
                    pov_character: ref.pov_character_id ? {
                        character_id: ref.pov_character_id,
                        name: ref.pov_character_name
                    } : null
                }));
            }
            catch (error) {
                // Event-chapter mappings might not be implemented yet
                console.log(`Note: Event-chapter mappings not fetched: ${error.message}`);
            }
            
            // Format the response
            return {
                event_id: event.event_id,
                event_name: event.event_name,
                event_date: event.event_date,
                description: event.event_description,
                series: {
                    series_id: event.series_id,
                    title: event.series_title
                },
                book: event.book_id ? {
                    book_id: event.book_id,
                    title: event.book_title
                } : null,
                time_period: event.time_period,
                significance: event.significance,
                is_public_knowledge: event.is_public_knowledge,
                sort_order: event.sort_order,
                participants: event.participant_ids && event.participant_ids.length > 0 ?
                    event.participant_ids.map((id, index) => ({
                        character_id: id,
                        name: event.participant_names[index]
                    })) : [],
                chapter_references: chapterReferences,
                created_at: event.created_at,
                updated_at: event.updated_at
            };
        } 
        catch (error) {
            throw new Error(`Failed to get timeline event: ${error.message}`);
        }
    }

    /**
     * Create a new timeline event for a series
     * @param {Object} args - Function arguments
     * @returns {Object} Created timeline event
     */
    async handleCreateTimelineEvent(args) {
        try {
            const { 
                series_id, 
                event_name, 
                event_description, 
                event_date, 
                book_id, 
                sort_order,
                time_period,
                participants = [],
                significance = 'minor',
                is_public_knowledge = true
            } = args;
            
            // Start a transaction
            await this.db.query('BEGIN');
            
            // Insert the timeline event
            const insertQuery = `
                INSERT INTO timeline_events (
                    series_id, 
                    event_name, 
                    event_description, 
                    event_date, 
                    book_id, 
                    sort_order,
                    time_period,
                    significance,
                    is_public_knowledge
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                RETURNING *
            `;
            
            const eventResult = await this.db.query(
                insertQuery, 
                [
                    series_id, 
                    event_name, 
                    event_description, 
                    event_date, 
                    book_id, 
                    sort_order,
                    time_period,
                    significance,
                    is_public_knowledge
                ]
            );
            
            const event = eventResult.rows[0];
            
            // Add participants if provided
            if (participants && participants.length > 0) {
                for (const characterId of participants) {
                    await this.db.query(
                        `INSERT INTO event_participants (event_id, character_id) VALUES ($1, $2)`,
                        [event.event_id, characterId]
                    );
                }
            }
            
            // Get additional information for the response
            const infoQuery = `
                SELECT 
                    s.title AS series_title,
                    b.title AS book_title
                FROM 
                    series s
                    LEFT JOIN books b ON b.id = $2
                WHERE 
                    s.id = $1
            `;
            
            const infoResult = await this.db.query(infoQuery, [series_id, book_id]);
            const info = infoResult.rows[0] || {};
            
            // Get participant names if any
            let participantInfo = [];
            if (participants && participants.length > 0) {
                const participantQuery = `
                    SELECT character_id, name FROM characters WHERE character_id = ANY($1)
                `;
                
                const participantResult = await this.db.query(participantQuery, [participants]);
                participantInfo = participantResult.rows.map(row => ({
                    character_id: row.character_id,
                    name: row.name
                }));
            }
            
            // Commit the transaction
            await this.db.query('COMMIT');
            
            // Format the response
            return {
                event_id: event.event_id,
                event_name: event.event_name,
                event_date: event.event_date,
                description: event.event_description,
                series: {
                    series_id: event.series_id,
                    title: info.series_title
                },
                book: event.book_id ? {
                    book_id: event.book_id,
                    title: info.book_title
                } : null,
                time_period: event.time_period,
                significance: event.significance,
                is_public_knowledge: event.is_public_knowledge,
                sort_order: event.sort_order,
                participants: participantInfo,
                created_at: event.created_at,
                message: `Successfully created timeline event "${event_name}"`
            };
        } 
        catch (error) {
            // Rollback the transaction in case of error
            await this.db.query('ROLLBACK');
            
            if (error.code === '23503') {
                if (error.message.includes('series_id')) {
                    throw new Error(`Series with ID ${args.series_id} not found`);
                }
                if (error.message.includes('book_id')) {
                    throw new Error(`Book with ID ${args.book_id} not found`);
                }
                if (error.message.includes('character_id')) {
                    throw new Error(`One or more character IDs in participants list not found`);
                }
            }
            
            throw new Error(`Failed to create timeline event: ${error.message}`);
        }
    }

    /**
     * Update an existing timeline event
     * @param {Object} args - Function arguments
     * @returns {Object} Updated timeline event
     */
    async handleUpdateTimelineEvent(args) {
        try {
            const { 
                event_id,
                event_name, 
                event_description, 
                event_date, 
                book_id, 
                sort_order,
                time_period,
                participants,
                significance,
                is_public_knowledge
            } = args;
            
            // Check if event exists
            const checkQuery = `
                SELECT id as event_id, series_id FROM timeline_events WHERE id = $1
            `;
            
            const checkResult = await this.db.query(checkQuery, [event_id]);
            
            if (checkResult.rows.length === 0) {
                throw new Error(`Timeline event with ID ${event_id} not found`);
            }
            
            const seriesId = checkResult.rows[0].series_id;
            
            // Start a transaction
            await this.db.query('BEGIN');
            
            // Build dynamic update query
            const updates = [];
            const values = [];
            let paramCounter = 1;
            
            if (event_name !== undefined) {
                updates.push(`event_name = $${paramCounter++}`);
                values.push(event_name);
            }
            
            if (event_description !== undefined) {
                updates.push(`event_description = $${paramCounter++}`);
                values.push(event_description);
            }
            
            if (event_date !== undefined) {
                updates.push(`event_date = $${paramCounter++}`);
                values.push(event_date);
            }
            
            if (book_id !== undefined) {
                updates.push(`book_id = $${paramCounter++}`);
                values.push(book_id);
            }
            
            if (sort_order !== undefined) {
                updates.push(`sort_order = $${paramCounter++}`);
                values.push(sort_order);
            }
            
            if (time_period !== undefined) {
                updates.push(`time_period = $${paramCounter++}`);
                values.push(time_period);
            }
            
            if (significance !== undefined) {
                updates.push(`significance = $${paramCounter++}`);
                values.push(significance);
            }
            
            if (is_public_knowledge !== undefined) {
                updates.push(`is_public_knowledge = $${paramCounter++}`);
                values.push(is_public_knowledge);
            }
            
            // Add updated_at timestamp
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            
            // Return early if no updates
            if (updates.length === 0) {
                return {
                    message: "No updates provided for timeline event"
                };
            }
            
            // Add event_id as the last parameter
            values.push(event_id);
            
            // Execute the update
            const updateQuery = `
                UPDATE timeline_events 
                SET ${updates.join(', ')} 
                WHERE id = $${paramCounter} 
                RETURNING *
            `;
            
            const updateResult = await this.db.query(updateQuery, values);
            const updatedEvent = updateResult.rows[0];
            
            // Update participants if provided
            if (participants !== undefined) {
                // Remove existing participants
                await this.db.query(
                    `DELETE FROM event_participants WHERE event_id = $1`,
                    [event_id]
                );
                
                // Add new participants
                if (participants && participants.length > 0) {
                    for (const characterId of participants) {
                        await this.db.query(
                            `INSERT INTO event_participants (event_id, character_id) VALUES ($1, $2)`,
                            [event_id, characterId]
                        );
                    }
                }
            }
            
            // Get additional information for the response
            const infoQuery = `
                SELECT 
                    s.title AS series_title,
                    b.title AS book_title
                FROM 
                    series s
                    LEFT JOIN books b ON b.id = $2
                WHERE 
                    s.id = $1
            `;
            
            const infoResult = await this.db.query(infoQuery, [seriesId, updatedEvent.book_id]);
            const info = infoResult.rows[0] || {};
            
            // Get participant names if participants were updated
            let participantInfo = [];
            if (participants !== undefined) {
                if (participants && participants.length > 0) {
                    const participantQuery = `
                        SELECT character_id, name FROM characters WHERE character_id = ANY($1)
                    `;
                    
                    const participantResult = await this.db.query(participantQuery, [participants]);
                    participantInfo = participantResult.rows.map(row => ({
                        character_id: row.character_id,
                        name: row.name
                    }));
                }
            } else {
                // Get existing participants
                const participantQuery = `
                    SELECT c.character_id, c.name 
                    FROM event_participants ep
                    JOIN characters c ON ep.character_id = c.character_id
                    WHERE ep.event_id = $1
                `;
                
                const participantResult = await this.db.query(participantQuery, [event_id]);
                participantInfo = participantResult.rows.map(row => ({
                    character_id: row.character_id,
                    name: row.name
                }));
            }
            
            // Commit the transaction
            await this.db.query('COMMIT');
            
            // Format the response
            return {
                event_id: updatedEvent.event_id,
                event_name: updatedEvent.event_name,
                event_date: updatedEvent.event_date,
                description: updatedEvent.event_description,
                series: {
                    series_id: updatedEvent.series_id,
                    title: info.series_title
                },
                book: updatedEvent.book_id ? {
                    book_id: updatedEvent.book_id,
                    title: info.book_title
                } : null,
                time_period: updatedEvent.time_period,
                significance: updatedEvent.significance,
                is_public_knowledge: updatedEvent.is_public_knowledge,
                sort_order: updatedEvent.sort_order,
                participants: participantInfo,
                updated_at: updatedEvent.updated_at,
                message: `Successfully updated timeline event "${updatedEvent.event_name}"`
            };
        } 
        catch (error) {
            // Rollback the transaction in case of error
            await this.db.query('ROLLBACK');
            
            if (error.code === '23503') {
                if (error.message.includes('book_id')) {
                    throw new Error(`Book with ID ${args.book_id} not found`);
                }
                if (error.message.includes('character_id')) {
                    throw new Error(`One or more character IDs in participants list not found`);
                }
            }
            
            throw new Error(`Failed to update timeline event: ${error.message}`);
        }
    }

    /**
     * Delete a timeline event
     * @param {Object} args - Function arguments
     * @returns {Object} Result of the deletion
     */
    async handleDeleteTimelineEvent(args) {
        try {
            const { event_id, confirm_deletion } = args;
            
            if (!confirm_deletion) {
                throw new Error('Deletion not confirmed. Set confirm_deletion to true to proceed.');
            }
            
            // Get event info before deletion for the response
            const infoQuery = `
                SELECT 
                    t.event_name,
                    s.title AS series_title
                FROM 
                    timeline_events t
                    JOIN series s ON t.series_id = s.id
                WHERE 
                    t.id = $1
            `;
            
            const infoResult = await this.db.query(infoQuery, [event_id]);
            
            if (infoResult.rows.length === 0) {
                throw new Error(`Timeline event with ID ${event_id} not found`);
            }
            
            const eventInfo = infoResult.rows[0];
            
            // Start a transaction
            await this.db.query('BEGIN');
            
            // Delete event participants
            await this.db.query(
                `DELETE FROM event_participants WHERE event_id = $1`,
                [event_id]
            );
            
            // Delete event-chapter mappings if they exist
            try {
                await this.db.query(
                    `DELETE FROM event_chapter_mappings WHERE event_id = $1`,
                    [event_id]
                );
            } catch (e) {
                // Table might not exist yet, ignore
            }
            
            // Delete the timeline event
            const deleteQuery = `
                DELETE FROM timeline_events WHERE id = $1
            `;
            
            const deleteResult = await this.db.query(deleteQuery, [event_id]);
            
            if (deleteResult.rowCount === 0) {
                throw new Error(`Timeline event with ID ${event_id} not found or already deleted`);
            }
            
            // Commit the transaction
            await this.db.query('COMMIT');
            
            // Format the response
            return {
                success: true,
                message: `Successfully deleted timeline event "${eventInfo.event_name}" from series "${eventInfo.series_title}"`,
                event_id
            };
        } 
        catch (error) {
            // Rollback the transaction in case of error
            await this.db.query('ROLLBACK');
            throw new Error(`Failed to delete timeline event: ${error.message}`);
        }
    }

    /**
     * Get all timeline events involving a specific character
     * @param {Object} args - Function arguments
     * @returns {Object} Timeline events for the character
     */
    async handleGetCharacterTimeline(args) {
        try {
            const { character_id, include_nonparticipant_events = false } = args;
            
            // Check if character exists
            const characterQuery = `
                SELECT name FROM characters WHERE character_id = $1
            `;
            
            const characterResult = await this.db.query(characterQuery, [character_id]);
            
            if (characterResult.rows.length === 0) {
                throw new Error(`Character with ID ${character_id} not found`);
            }
            
            const characterName = characterResult.rows[0].name;
            
            // Build query to get events
            let query = '';
            
            if (include_nonparticipant_events) {
                // Include both events where character participates and major events
                query = `
                    SELECT 
                        t.id as event_id, 
                        t.event_name, 
                        t.event_description, 
                        t.event_date, 
                        t.sort_order,
                        t.time_period,
                        t.significance,
                        t.is_public_knowledge,
                        t.created_at,
                        s.id as series_id,
                        s.title AS series_title,
                        b.id as book_id,
                        b.title AS book_title,
                        EXISTS (
                            SELECT 1 FROM event_participants ep 
                            WHERE ep.event_id = t.id AND ep.character_id = $1
                        ) AS is_participant
                    FROM 
                        timeline_events t
                        JOIN series s ON t.series_id = s.id
                        LEFT JOIN books b ON t.book_id = b.id
                    WHERE 
                        (EXISTS (
                            SELECT 1 FROM event_participants ep 
                            WHERE ep.event_id = t.id AND ep.character_id = $1
                        ) OR (t.significance = 'major' AND t.is_public_knowledge = true))
                    ORDER BY 
                        t.event_date
                `;
            } else {
                // Only include events where the character participates
                query = `
                    SELECT 
                        t.id as event_id, 
                        t.event_name, 
                        t.event_description, 
                        t.event_date, 
                        t.sort_order,
                        t.time_period,
                        t.significance,
                        t.is_public_knowledge,
                        t.created_at,
                        s.id as series_id,
                        s.title AS series_title,
                        b.id as book_id,
                        b.title AS book_title,
                        TRUE AS is_participant
                    FROM 
                        timeline_events t
                        JOIN series s ON t.series_id = s.id
                        LEFT JOIN books b ON t.book_id = b.id
                        JOIN event_participants ep ON t.id = ep.event_id
                    WHERE 
                        ep.character_id = $1
                    ORDER BY 
                        t.event_date
                `;
            }
            
            const result = await this.db.query(query, [character_id]);
            
            // Format the response
            const formattedEvents = result.rows.map(event => ({
                event_id: event.event_id,
                event_name: event.event_name,
                event_date: event.event_date,
                description: event.event_description,
                series: {
                    series_id: event.series_id,
                    title: event.series_title
                },
                book: event.book_id ? {
                    book_id: event.book_id,
                    title: event.book_title
                } : null,
                time_period: event.time_period,
                significance: event.significance,
                is_public_knowledge: event.is_public_knowledge,
                sort_order: event.sort_order,
                is_participant: event.is_participant
            }));
            
            return {
                character_id,
                character_name: characterName,
                event_count: formattedEvents.length,
                direct_participation_count: formattedEvents.filter(e => e.is_participant).length,
                events: formattedEvents
            };
        } 
        catch (error) {
            throw new Error(`Failed to get character timeline: ${error.message}`);
        }
    }

    /**
     * Analyze the timeline for potential continuity problems
     * @param {Object} args - Function arguments
     * @returns {Object} Analysis results
     */
    async handleFindTimelineInconsistencies(args) {
        try {
            const { series_id, check_character_logistics = true } = args;
            
            // Check if series exists
            const seriesQuery = `
                SELECT title FROM series WHERE series_id = $1
            `;
            
            const seriesResult = await this.db.query(seriesQuery, [series_id]);
            
            if (seriesResult.rows.length === 0) {
                throw new Error(`Series with ID ${series_id} not found`);
            }
            
            const seriesTitle = seriesResult.rows[0].title;
            
            // Initialize the response object
            const response = {
                series_id,
                series_title: seriesTitle,
                analysis_date: new Date().toISOString(),
                issues: []
            };
            
            // Check for overlapping events with the same characters
            const overlapQuery = `
                WITH character_events AS (
                    SELECT 
                        t.id as event_id,
                        t.event_name,
                        t.event_date,
                        ep.character_id,
                        c.name AS character_name
                    FROM 
                        timeline_events t
                        JOIN event_participants ep ON t.id = ep.event_id
                        JOIN characters c ON ep.character_id = c.character_id
                    WHERE 
                        t.series_id = $1
                ),
                character_pairs AS (
                    SELECT 
                        a.character_id,
                        a.character_name,
                        a.event_id AS event_a_id,
                        a.event_name AS event_a_name,
                        a.event_date AS event_a_date,
                        b.event_id AS event_b_id,
                        b.event_name AS event_b_name,
                        b.event_date AS event_b_date
                    FROM 
                        character_events a
                        JOIN character_events b ON a.character_id = b.character_id AND a.event_id < b.event_id
                    WHERE 
                        a.event_date = b.event_date
                )
                SELECT * FROM character_pairs
            `;
            
            const overlapResult = await this.db.query(overlapQuery, [series_id]);
            
            // Add overlap issues to the response
            if (overlapResult.rows.length > 0) {
                for (const overlap of overlapResult.rows) {
                    response.issues.push({
                        issue_type: 'character_double_booking',
                        severity: 'warning',
                        description: `Character "${overlap.character_name}" appears in two events on the same date: "${overlap.event_a_name}" and "${overlap.event_b_name}"`,
                        details: {
                            character_id: overlap.character_id,
                            character_name: overlap.character_name,
                            event1: {
                                event_id: overlap.event_a_id,
                                name: overlap.event_a_name,
                                date: overlap.event_a_date
                            },
                            event2: {
                                event_id: overlap.event_b_id,
                                name: overlap.event_b_name,
                                date: overlap.event_b_date
                            }
                        }
                    });
                }
            }
            
            // Check for character logistics issues if requested
            if (check_character_logistics) {
                try {
                    // This is a more complex check that would involve looking at locations,
                    // travel times, and potentially chapter mappings if implemented
                    // Here's a simplified version that checks for rapid location changes
                    
                    const logisticsQuery = `
                        WITH event_locations AS (
                            SELECT 
                                t.id as event_id,
                                t.event_name,
                                t.event_date,
                                t.book_id,
                                ep.character_id,
                                c.name AS character_name,
                                b.title AS book_title,
                                COALESCE(t.event_description, '') AS event_description
                            FROM 
                                timeline_events t
                                JOIN event_participants ep ON t.id = ep.event_id
                                JOIN characters c ON ep.character_id = c.character_id
                                LEFT JOIN books b ON t.book_id = b.id
                            WHERE 
                                t.series_id = $1
                        ),
                        location_pairs AS (
                            SELECT 
                                a.character_id,
                                a.character_name,
                                a.event_id AS event_a_id,
                                a.event_name AS event_a_name,
                                a.event_date AS event_a_date,
                                a.event_description AS event_a_description,
                                b.event_id AS event_b_id,
                                b.event_name AS event_b_name,
                                b.event_date AS event_b_date,
                                b.event_description AS event_b_description
                            FROM 
                                event_locations a
                                JOIN event_locations b ON a.character_id = b.character_id 
                                                       AND a.event_id < b.event_id
                                                       AND a.event_date = b.event_date
                                                       AND position(lower(a.event_description) in lower(b.event_description)) = 0
                            WHERE
                                a.event_description ~ '[Ll]ocation|[Pp]lace|[Cc]ity|[Tt]own|[Cc]ountry|[Vv]illage' AND
                                b.event_description ~ '[Ll]ocation|[Pp]lace|[Cc]ity|[Tt]own|[Cc]ountry|[Vv]illage'
                        )
                        SELECT * FROM location_pairs
                    `;
                    
                    const logisticsResult = await this.db.query(logisticsQuery, [series_id]);
                    
                    // Add logistics issues to the response
                    if (logisticsResult.rows.length > 0) {
                        for (const logistics of logisticsResult.rows) {
                            response.issues.push({
                                issue_type: 'possible_travel_inconsistency',
                                severity: 'info',
                                description: `Character "${logistics.character_name}" might be in different locations on the same date: "${logistics.event_a_name}" and "${logistics.event_b_name}"`,
                                details: {
                                    character_id: logistics.character_id,
                                    character_name: logistics.character_name,
                                    event1: {
                                        event_id: logistics.event_a_id,
                                        name: logistics.event_a_name,
                                        date: logistics.event_a_date,
                                        description: logistics.event_a_description
                                    },
                                    event2: {
                                        event_id: logistics.event_b_id,
                                        name: logistics.event_b_name,
                                        date: logistics.event_b_date,
                                        description: logistics.event_b_description
                                    }
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.log(`Character logistics check error: ${error.message}`);
                    // Continue with other checks if this one fails
                }
            }
            
            // Check for chronology issues in event-chapter mappings
            try {
                const chronologyQuery = `
                    WITH event_chapters AS (
                        SELECT 
                            t.id as event_id,
                            t.event_name,
                            t.event_date,
                            m.chapter_id,
                            c.chapter_number,
                            b.book_number
                        FROM 
                            timeline_events t
                            JOIN event_chapter_mappings m ON t.id = m.event_id
                            JOIN chapters c ON m.chapter_id = c.chapter_id
                            JOIN books b ON c.book_id = b.id
                        WHERE 
                            t.series_id = $1 AND
                            m.presentation_type = 'direct_scene'
                        ORDER BY
                            t.event_date
                    ),
                    chronology_pairs AS (
                        SELECT 
                            a.event_id AS event_a_id,
                            a.event_name AS event_a_name,
                            a.event_date AS event_a_date,
                            a.chapter_id AS chapter_a_id,
                            a.chapter_number AS chapter_a_number,
                            a.book_number AS book_a_number,
                            b.event_id AS event_b_id,
                            b.event_name AS event_b_name,
                            b.event_date AS event_b_date,
                            b.chapter_id AS chapter_b_id,
                            b.chapter_number AS chapter_b_number,
                            b.book_number AS book_b_number
                        FROM 
                            event_chapters a
                            JOIN event_chapters b ON a.event_date < b.event_date AND
                                                    ((a.book_number > b.book_number) OR 
                                                     (a.book_number = b.book_number AND a.chapter_number > b.chapter_number))
                    )
                    SELECT * FROM chronology_pairs
                `;
                
                const chronologyResult = await this.db.query(chronologyQuery, [series_id]);
                
                // Add chronology issues to the response
                if (chronologyResult.rows.length > 0) {
                    for (const chronology of chronologyResult.rows) {
                        response.issues.push({
                            issue_type: 'chronology_narrative_mismatch',
                            severity: 'warning',
                            description: `Chronology issue: Event "${chronology.event_a_name}" occurs before "${chronology.event_b_name}" in timeline, but appears later in the narrative`,
                            details: {
                                earlier_event: {
                                    event_id: chronology.event_a_id,
                                    name: chronology.event_a_name,
                                    date: chronology.event_a_date,
                                    chapter: `Book ${chronology.book_a_number}, Chapter ${chronology.chapter_a_number}`
                                },
                                later_event: {
                                    event_id: chronology.event_b_id,
                                    name: chronology.event_b_name,
                                    date: chronology.event_b_date,
                                    chapter: `Book ${chronology.book_b_number}, Chapter ${chronology.chapter_b_number}`
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                // Event-chapter mappings might not be implemented yet
                console.log(`Chronology check error: ${error.message}`);
            }
            
            // Set overall status
            response.issue_count = response.issues.length;
            response.has_critical_issues = response.issues.some(issue => issue.severity === 'critical');
            response.has_warnings = response.issues.some(issue => issue.severity === 'warning');
            
            return response;
        } 
        catch (error) {
            throw new Error(`Failed to analyze timeline: ${error.message}`);
        }
    }
}