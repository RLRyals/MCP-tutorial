// src/mcps/world-server/handlers/world-element-handlers.js
// World Element Management Handler - STUB VERSION
// TODO: Implement after tutorial recording

export class WorldElementHandlers {
    constructor(db) {
        this.db = db;
    }

// =============================================
    // WORLD ELEMENT TOOL DEFINITIONS
    // =============================================
    getWorldElementTools() {
        return [
            {
                name: 'create_world_element',
                description: 'Create magic systems, technology, natural laws, or other supernatural elements',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { 
                            type: 'integer', 
                            description: 'ID of the series this element belongs to' 
                        },
                        name: { 
                            type: 'string', 
                            description: 'Name of the world element (e.g., "Elemental Magic", "Quantum Drive Technology")' 
                        },
                        element_type: {
                            type: 'string',
                            description: 'Type of element: magic_system, technology, natural_law, supernatural, divine, psionic, etc.'
                        },
                        description: {
                            type: 'string',
                            description: 'Detailed description of how this element works'
                        },
                        power_source: {
                            type: 'string',
                            description: 'What powers or enables this element (mana, technology, divine favor, etc.)'
                        },
                        limitations: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Constraints, costs, or limitations of this element'
                        },
                        rules: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Governing rules and principles'
                        },
                        access_method: {
                            type: 'string',
                            description: 'How characters can use or access this element'
                        },
                        rarity: {
                            type: 'string',
                            description: 'How common or rare this element is (common, uncommon, rare, legendary)'
                        },
                        cultural_impact: {
                            type: 'string',
                            description: 'How this element affects society and culture'
                        }
                    },
                    required: ['series_id', 'name', 'element_type', 'description']
                }
            },
            {
                name: 'update_world_element',
                description: 'Update an existing world element',
                inputSchema: {
                    type: 'object',
                    properties: {
                        element_id: { 
                            type: 'integer', 
                            description: 'ID of the element to update' 
                        },
                        name: { 
                            type: 'string', 
                            description: 'Name of the world element' 
                        },
                        element_type: {
                            type: 'string',
                            description: 'Type of element'
                        },
                        description: {
                            type: 'string',
                            description: 'Detailed description'
                        },
                        power_source: {
                            type: 'string',
                            description: 'Power source or enabling mechanism'
                        },
                        limitations: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Constraints and limitations'
                        },
                        rules: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Governing rules'
                        },
                        access_method: {
                            type: 'string',
                            description: 'How to use or access this element'
                        },
                        rarity: {
                            type: 'string',
                            description: 'Rarity level'
                        },
                        cultural_impact: {
                            type: 'string',
                            description: 'Impact on society'
                        }
                    },
                    required: ['element_id']
                }
            },
            {
                name: 'get_world_elements',
                description: 'Get world elements with optional filtering',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { 
                            type: 'integer', 
                            description: 'Filter by series ID' 
                        },
                        element_type: {
                            type: 'string',
                            description: 'Filter by element type'
                        },
                        rarity: {
                            type: 'string',
                            description: 'Filter by rarity level'
                        },
                        search_term: {
                            type: 'string',
                            description: 'Search in name or description'
                        }
                    },
                    required: []
                }
            },
            {
                name: 'track_element_usage',
                description: 'Track where a world element appears in the story',
                inputSchema: {
                    type: 'object',
                    properties: {
                        element_id: { 
                            type: 'integer', 
                            description: 'ID of the world element' 
                        },
                        book_id: { 
                            type: 'integer', 
                            description: 'Book where element appears' 
                        },
                        chapter_id: {
                            type: 'integer',
                            description: 'Chapter where element appears (optional)'
                        },
                        usage_notes: {
                            type: 'string',
                            description: 'Notes about how element is used'
                        },
                        power_level: {
                            type: 'integer',
                            description: 'Power level demonstrated (1-10 scale)'
                        }
                    },
                    required: ['element_id', 'book_id']
                }
            }
        ];
    }
    // =============================================
    // WORLD ELEMENT MANAGEMENT HANDLERS
    // =============================================

    async handleCreateWorldElement(args) {
        try {
            const { 
                series_id, name, element_type, description, power_source, 
                limitations, rules, access_method, rarity, cultural_impact 
            } = args;
            
            const query = `
                INSERT INTO world_elements (
                    series_id, name, element_type, description, power_source,
                    limitations, rules, access_method, rarity, cultural_impact
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                RETURNING *
            `;
            
            const result = await this.db.query(query, [
                series_id, name, element_type, description, power_source || null,
                limitations || [], rules || [], access_method || null, 
                rarity || 'common', cultural_impact || null
            ]);
            
            const element = result.rows[0];
            
            return {
                content: [{
                    type: 'text',
                    text: `Created world element successfully!\n\n` +
                          `🌟 ${element.name}\n` +
                          `ID: ${element.id}\n` +
                          `Type: ${element.element_type}\n` +
                          `${element.power_source ? `Power Source: ${element.power_source}\n` : ''}` +
                          `${element.access_method ? `Access Method: ${element.access_method}\n` : ''}` +
                          `Rarity: ${element.rarity}\n` +
                          `${element.cultural_impact ? `Cultural Impact: ${element.cultural_impact}\n` : ''}` +
                          `${element.limitations && element.limitations.length > 0 ? 
                            `\nLimitations:\n${element.limitations.map(l => `  • ${l}`).join('\n')}\n` : ''}` +
                          `${element.rules && element.rules.length > 0 ? 
                            `\nRules:\n${element.rules.map(r => `  • ${r}`).join('\n')}\n` : ''}` +
                          `\nDescription: ${element.description}`
                }]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Invalid series_id: Series not found');
            }
            throw new Error(`Failed to create world element: ${error.message}`);
        }
    }

    async handleUpdateWorldElement(args) {
        try {
            const { element_id, ...updates } = args;
            
            // Build dynamic update query
            const updateFields = [];
            const params = [element_id];
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
                UPDATE world_elements 
                SET ${updateFields.join(', ')}
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await this.db.query(query, params);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No world element found with ID: ${element_id}`
                    }]
                };
            }
            
            const element = result.rows[0];
            
            return {
                content: [{
                    type: 'text',
                    text: `Updated world element successfully!\n\n` +
                          `🌟 ${element.name}\n` +
                          `ID: ${element.id}\n` +
                          `Type: ${element.element_type}\n` +
                          `${element.power_source ? `Power Source: ${element.power_source}\n` : ''}` +
                          `Rarity: ${element.rarity}\n` +
                          `Description: ${element.description}\n` +
                          `Updated: ${element.updated_at}`
                }]
            };
        } catch (error) {
            throw new Error(`Failed to update world element: ${error.message}`);
        }
    }

    async handleGetWorldElements(args) {
        try {
            const { series_id, element_type, rarity, search_term } = args;
            
            let query = `
                SELECT we.id as element_id, we.*, 
                       (SELECT COUNT(*) FROM world_element_usage 
                        WHERE element_type = 'world_element' AND element_id = we.id) as usage_count
                FROM world_elements we
            `;
            
            const params = [];
            const conditions = [];
            let paramCount = 0;

            if (series_id) {
                paramCount++;
                conditions.push(`we.series_id = $${paramCount}`);
                params.push(series_id);
            }

            if (element_type) {
                paramCount++;
                conditions.push(`we.element_type = $${paramCount}`);
                params.push(element_type);
            }

            if (rarity) {
                paramCount++;
                conditions.push(`we.rarity = $${paramCount}`);
                params.push(rarity);
            }

            if (search_term) {
                paramCount++;
                conditions.push(`(we.name ILIKE $${paramCount} OR we.description ILIKE $${paramCount})`);
                params.push(`%${search_term}%`);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            
            query += ' ORDER BY we.element_type, we.rarity, we.name';
            
            const result = await this.db.query(query, params);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: 'No world elements found matching the criteria.'
                    }]
                };
            }
            
            let elementsText = `Found ${result.rows.length} world elements:\n\n`;
            
            for (const element of result.rows) {
                elementsText += `🌟 ${element.name}\n`;
                elementsText += `   ID: ${element.element_id}\n`;
                elementsText += `   Type: ${element.element_type}\n`;
                elementsText += `   Rarity: ${element.rarity}\n`;
                
                if (element.power_source) {
                    elementsText += `   Power Source: ${element.power_source}\n`;
                }
                
                if (element.access_method) {
                    elementsText += `   Access: ${element.access_method}\n`;
                }
                
                if (element.cultural_impact) {
                    elementsText += `   Cultural Impact: ${element.cultural_impact}\n`;
                }
                
                if (element.limitations && element.limitations.length > 0) {
                    elementsText += `   Limitations: ${element.limitations.join(', ')}\n`;
                }
                
                elementsText += `   Story Usage: ${element.usage_count} times\n`;
                elementsText += `   Description: ${element.description}\n\n`;
            }
            
            return {
                content: [{
                    type: 'text',
                    text: elementsText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get world elements: ${error.message}`);
        }
    }

    async handleTrackElementUsage(args) {
        try {
            const { element_id, book_id, chapter_id, usage_notes, power_level } = args;
            
            // Verify element exists
            const elementQuery = 'SELECT name, element_type FROM world_elements WHERE id = $1';
            const elementResult = await this.db.query(elementQuery, [element_id]);
            
            if (elementResult.rows.length === 0) {
                throw new Error(`World element with ID ${element_id} not found`);
            }
            
            const element = elementResult.rows[0];
            
            // Insert usage tracking
            let usageNotesWithPower = usage_notes || '';
            if (power_level) {
                usageNotesWithPower += ` [Power Level: ${power_level}/10]`;
            }
            
            const usageQuery = `
                INSERT INTO world_element_usage (
                    element_type, element_id, book_id, chapter_id, usage_notes
                ) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `;
            
            const usageResult = await this.db.query(usageQuery, [
                'world_element', element_id, book_id, chapter_id || null, usageNotesWithPower
            ]);
            
            // Get book and chapter info for display
            let contextInfo = '';
            const contextQuery = `
                SELECT b.title as book_title, 
                       ${chapter_id ? 'ch.title as chapter_title, ch.chapter_number' : 'NULL as chapter_title, NULL as chapter_number'}
                FROM books b 
                ${chapter_id ? 'LEFT JOIN chapters ch ON ch.chapter_id = $2 AND ch.book_id = b.book_id' : ''}
                WHERE b.book_id = $1
            `;
            
            const contextParams = chapter_id ? [book_id, chapter_id] : [book_id];
            const contextResult = await this.db.query(contextQuery, contextParams);
            
            if (contextResult.rows.length > 0) {
                const context = contextResult.rows[0];
                contextInfo = `Book: ${context.book_title}`;
                if (context.chapter_title) {
                    contextInfo += `\nChapter: ${context.chapter_number}. ${context.chapter_title}`;
                }
            }
            
            return {
                content: [{
                    type: 'text',
                    text: `Successfully tracked world element usage!\n\n` +
                          `🌟 Element: ${element.name} (${element.element_type})\n` +
                          `${contextInfo}\n` +
                          `${power_level ? `Power Level: ${power_level}/10\n` : ''}` +
                          `${usage_notes ? `Notes: ${usage_notes}\n` : ''}` +
                          `Tracked at: ${usageResult.rows[0].created_at}`
                }]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Invalid book_id or chapter_id');
            }
            throw new Error(`Failed to track element usage: ${error.message}`);
        }
    }

}