// src/mcps/plot-server/handlers/plot-thread-handlers.js
// Core plot thread CRUD operations

import { plotThreadToolsSchema } from '../schemas/plot-tools-schema.js';
import { PlotValidators } from '../utils/plot-validators.js';

export class PlotThreadHandlers {
    constructor(db) {
        this.db = db;
    }
    
    getPlotThreadTools() {
        return plotThreadToolsSchema;
    }
    
    async handleCreatePlotThread(args) {
        try {
            // Validate input
            const validation = PlotValidators.validatePlotThread(args);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Check if series exists
            const seriesCheck = await this.db.query(
                'SELECT id, title FROM series WHERE id = $1',
                [args.series_id]
            );
            
            if (seriesCheck.rows.length === 0) {
                throw new Error(`Series with ID ${args.series_id} not found`);
            }
            
            // Verify parent thread exists if specified
            if (args.parent_thread_id) {
                const parentCheck = await this.db.query(
                    'SELECT thread_id FROM plot_threads WHERE thread_id = $1 AND series_id = $2',
                    [args.parent_thread_id, args.series_id]
                );
                
                if (parentCheck.rows.length === 0) {
                    throw new Error(`Parent thread with ID ${args.parent_thread_id} not found in series ${args.series_id}`);
                }
            }
            
            // Verify characters exist if specified
            if (args.related_characters && args.related_characters.length > 0) {
                const characterCheck = await this.db.query(
                    'SELECT character_id FROM characters WHERE character_id = ANY($1) AND series_id = $2',
                    [args.related_characters, args.series_id]
                );
                
                if (characterCheck.rows.length !== args.related_characters.length) {
                    throw new Error('One or more related characters not found in the series');
                }
            }
            
            // Get thread type ID from lookup table
            const threadTypeResult = await this.db.query(
                'SELECT type_id FROM plot_thread_types WHERE type_name = $1 AND is_active = true',
                [args.thread_type]
            );
            
            if (threadTypeResult.rows.length === 0) {
                throw new Error(`Invalid thread_type: ${args.thread_type}. Use get_available_options with option_type='plot_thread_types' to see valid values.`);
            }
            
            const threadTypeId = threadTypeResult.rows[0].type_id;
            
            // Insert the plot thread (using lookup table IDs)
            const insertQuery = `
                INSERT INTO plot_threads (
                    series_id, title, description, thread_type_id,
                    importance_level, complexity_level, start_book, end_book,
                    parent_thread_id, related_characters
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING thread_id, title, description, importance_level, 
                         complexity_level, created_at
            `;
            
            const result = await this.db.query(insertQuery, [
                args.series_id,
                args.title,
                args.description,
                threadTypeId,
                args.importance_level || 5,
                args.complexity_level || 5,
                args.start_book || null,
                args.end_book || null,
                args.parent_thread_id || null,
                args.related_characters || []
            ]);
            
            const newThread = result.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Successfully created plot thread!\n\n` +
                              `**Thread ID:** ${newThread.thread_id}\n` +
                              `**Title:** ${newThread.title}\n` +
                              `**Type:** ${args.thread_type}\n` +
                              `**Status:** active (default)\n` +
                              `**Importance:** ${newThread.importance_level}/10\n` +
                              `**Complexity:** ${newThread.complexity_level}/10\n` +
                              `**Description:** ${newThread.description}\n` +
                              `**Created:** ${new Date(newThread.created_at).toLocaleString()}`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to create plot thread: ${error.message}`);
        }
    }
    
    async handleUpdatePlotThread(args) {
        try {
            // Validate input
            const validation = PlotValidators.validateThreadUpdate(args);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Check if thread exists
            const threadCheck = await this.db.query(
                'SELECT thread_id, title, current_status FROM plot_threads WHERE thread_id = $1',
                [args.thread_id]
            );
            
            if (threadCheck.rows.length === 0) {
                throw new Error(`Plot thread with ID ${args.thread_id} not found`);
            }
            
            // Build dynamic update query
            const updates = [];
            const values = [];
            let paramCount = 1;
            
            if (args.title !== undefined) {
                updates.push(`title = $${paramCount}`);
                values.push(args.title);
                paramCount++;
            }
            
            if (args.description !== undefined) {
                updates.push(`description = $${paramCount}`);
                values.push(args.description);
                paramCount++;
            }
            
            if (args.current_status !== undefined) {
                updates.push(`current_status = $${paramCount}`);
                values.push(args.current_status);
                paramCount++;
            }
            
            if (args.end_book !== undefined) {
                updates.push(`end_book = $${paramCount}`);
                values.push(args.end_book);
                paramCount++;
            }
            
            if (args.resolution_notes !== undefined) {
                updates.push(`resolution_notes = $${paramCount}`);
                values.push(args.resolution_notes);
                paramCount++;
            }
            
            if (args.resolution_book !== undefined) {
                updates.push(`resolution_book = $${paramCount}`);
                values.push(args.resolution_book);
                paramCount++;
            }
            
            if (updates.length === 0) {
                throw new Error('No updates provided');
            }
            
            // Always update the timestamp
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            
            // Add thread_id for WHERE clause
            values.push(args.thread_id);
            
            const updateQuery = `
                UPDATE plot_threads 
                SET ${updates.join(', ')}
                WHERE thread_id = $${paramCount}
                RETURNING thread_id, title, description, thread_type, current_status, 
                         importance_level, complexity_level, resolution_notes, updated_at
            `;
            
            const result = await this.db.query(updateQuery, values);
            const updatedThread = result.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Successfully updated plot thread!\n\n` +
                              `**Thread ID:** ${updatedThread.thread_id}\n` +
                              `**Title:** ${updatedThread.title}\n` +
                              `**Type:** ${updatedThread.thread_type}\n` +
                              `**Status:** ${updatedThread.current_status}\n` +
                              `**Importance:** ${updatedThread.importance_level}/10\n` +
                              `**Complexity:** ${updatedThread.complexity_level}/10\n` +
                              `**Description:** ${updatedThread.description}\n` +
                              `${updatedThread.resolution_notes ? `**Resolution:** ${updatedThread.resolution_notes}\n` : ''}` +
                              `**Last Updated:** ${new Date(updatedThread.updated_at).toLocaleString()}`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to update plot thread: ${error.message}`);
        }
    }
    
    async handleGetPlotThreads(args) {
        try {
            if (!args.series_id || typeof args.series_id !== 'number' || args.series_id < 1) {
                throw new Error('series_id must be a positive number');
            }
            
            // Check if series exists
            const seriesCheck = await this.db.query(
                'SELECT id, title FROM series WHERE id = $1',
                [args.series_id]
            );
            
            if (seriesCheck.rows.length === 0) {
                throw new Error(`Series with ID ${args.series_id} not found`);
            }
            
            // Build dynamic query with filters
            let query = `
                SELECT 
                    pt.thread_id, pt.title, pt.description, pt.thread_type,
                    pt.importance_level, pt.complexity_level, pt.current_status,
                    pt.start_book, pt.end_book, pt.parent_thread_id,
                    pt.related_characters, pt.resolution_notes, pt.resolution_book,
                    pt.created_at, pt.updated_at,
                    parent.title as parent_title
                FROM plot_threads pt
                LEFT JOIN plot_threads parent ON pt.parent_thread_id = parent.thread_id
                WHERE pt.series_id = $1
            `;
            
            const queryParams = [args.series_id];
            let paramCount = 2;
            
            if (args.thread_type) {
                query += ` AND pt.thread_type = $${paramCount}`;
                queryParams.push(args.thread_type);
                paramCount++;
            }
            
            if (args.current_status) {
                query += ` AND pt.current_status = $${paramCount}`;
                queryParams.push(args.current_status);
                paramCount++;
            }
            
            if (args.importance_min) {
                query += ` AND pt.importance_level >= $${paramCount}`;
                queryParams.push(args.importance_min);
                paramCount++;
            }
            
            if (args.book_number) {
                query += ` AND (pt.start_book <= $${paramCount} OR pt.start_book IS NULL) 
                          AND (pt.end_book >= $${paramCount} OR pt.end_book IS NULL)`;
                queryParams.push(args.book_number);
                paramCount++;
            }
            
            query += ' ORDER BY pt.importance_level DESC, pt.thread_type, pt.title';
            
            const result = await this.db.query(query, queryParams);
            const threads = result.rows;
            
            if (threads.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No plot threads found for series "${seriesCheck.rows[0].title}" with the specified filters.`
                        }
                    ]
                };
            }
            
            // Format the results
            let output = `# Plot Threads for "${seriesCheck.rows[0].title}"\n\n`;
            output += `Found ${threads.length} plot thread(s):\n\n`;
            
            // Group by thread type for better organization
            const groupedThreads = {};
            threads.forEach(thread => {
                if (!groupedThreads[thread.thread_type]) {
                    groupedThreads[thread.thread_type] = [];
                }
                groupedThreads[thread.thread_type].push(thread);
            });
            
            for (const [type, typeThreads] of Object.entries(groupedThreads)) {
                output += `## ${type.replace('_', ' ').toUpperCase()}\n\n`;
                
                typeThreads.forEach(thread => {
                    output += `### ${thread.title} (ID: ${thread.thread_id})\n`;
                    output += `- **Status:** ${thread.current_status}\n`;
                    output += `- **Importance:** ${thread.importance_level}/10\n`;
                    output += `- **Complexity:** ${thread.complexity_level}/10\n`;
                    if (thread.start_book) {
                        output += `- **Books:** ${thread.start_book}${thread.end_book ? ` to ${thread.end_book}` : '+'}\n`;
                    }
                    if (thread.parent_title) {
                        output += `- **Parent Thread:** ${thread.parent_title}\n`;
                    }
                    if (thread.related_characters && thread.related_characters.length > 0) {
                        output += `- **Related Characters:** ${thread.related_characters.length} character(s)\n`;
                    }
                    output += `- **Description:** ${thread.description}\n`;
                    if (thread.resolution_notes) {
                        output += `- **Resolution:** ${thread.resolution_notes}${thread.resolution_book ? ` (Book ${thread.resolution_book})` : ''}\n`;
                    }
                    output += '\n';
                });
            }
            
            return {
                content: [
                    {
                        type: 'text',
                        text: output
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to get plot threads: ${error.message}`);
        }
    }
    
    async handleLinkPlotThreads(args) {
        try {
            // Validate input
            const validation = PlotValidators.validateThreadRelationship(args);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Check if both threads exist
            const threadsCheck = await this.db.query(
                'SELECT thread_id, title FROM plot_threads WHERE thread_id = ANY($1)',
                [[args.thread_a_id, args.thread_b_id]]
            );
            
            if (threadsCheck.rows.length !== 2) {
                throw new Error('One or both plot threads not found');
            }
            
            // Check for existing relationship
            const existingCheck = await this.db.query(
                'SELECT relationship_id FROM plot_thread_relationships WHERE thread_a_id = $1 AND thread_b_id = $2',
                [args.thread_a_id, args.thread_b_id]
            );
            
            if (existingCheck.rows.length > 0) {
                throw new Error('Relationship between these threads already exists');
            }
            
            // Insert the relationship
            const insertQuery = `
                INSERT INTO plot_thread_relationships (
                    thread_a_id, thread_b_id, relationship_type, relationship_description,
                    strength, established_book
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING relationship_id
            `;
            
            await this.db.query(insertQuery, [
                args.thread_a_id,
                args.thread_b_id,
                args.relationship_type,
                args.relationship_description || null,
                args.strength || 5,
                args.established_book || null
            ]);
            
            const threadNames = threadsCheck.rows.map(t => t.title);
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Successfully linked plot threads!\n\n` +
                              `**Relationship:** "${threadNames[0]}" ${args.relationship_type.replace('_', ' ')} "${threadNames[1]}"\n` +
                              `**Strength:** ${args.strength || 5}/10\n` +
                              `${args.relationship_description ? `**Description:** ${args.relationship_description}\n` : ''}` +
                              `${args.established_book ? `**Established in Book:** ${args.established_book}` : ''}`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to link plot threads: ${error.message}`);
        }
    }
    
    async handleResolvePlotThread(args) {
        try {
            if (!args.thread_id || typeof args.thread_id !== 'number' || args.thread_id < 1) {
                throw new Error('thread_id must be a positive number');
            }
            
            if (!args.resolution_book || typeof args.resolution_book !== 'number' || args.resolution_book < 1) {
                throw new Error('resolution_book must be a positive number');
            }
            
            if (!args.resolution_notes || typeof args.resolution_notes !== 'string' || args.resolution_notes.trim().length === 0) {
                throw new Error('resolution_notes must be a non-empty string');
            }
            
            // Check if thread exists
            const threadCheck = await this.db.query(
                'SELECT thread_id, title, current_status FROM plot_threads WHERE thread_id = $1',
                [args.thread_id]
            );
            
            if (threadCheck.rows.length === 0) {
                throw new Error(`Plot thread with ID ${args.thread_id} not found`);
            }
            
            const thread = threadCheck.rows[0];
            
            if (thread.current_status === 'resolved') {
                throw new Error(`Plot thread "${thread.title}" is already resolved`);
            }
            
            // Update the thread to resolved status
            const updateQuery = `
                UPDATE plot_threads 
                SET current_status = 'resolved',
                    resolution_notes = $1,
                    resolution_book = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE thread_id = $3
                RETURNING title
            `;
            
            const result = await this.db.query(updateQuery, [
                args.resolution_notes,
                args.resolution_book,
                args.thread_id
            ]);
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Successfully resolved plot thread!\n\n` +
                              `**Thread:** "${result.rows[0].title}"\n` +
                              `**Resolved in Book:** ${args.resolution_book}\n` +
                              `**Resolution:** ${args.resolution_notes}`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to resolve plot thread: ${error.message}`);
        }
    }
}
