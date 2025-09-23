// src/mcps/world-server/handlers/location-handlers.js
// Location Management Handler - CRUD operations for world locations
// Designed for AI Writing Teams to manage fictional world geography

export class LocationHandlers {
    constructor(db) {
        this.db = db;
    }

    // =============================================
    // LOCATION TOOL DEFINITIONS
    // =============================================
    getLocationTools() {
        return [
            {
                name: 'create_location',
                description: 'Create a new location in the fictional world',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { 
                            type: 'integer', 
                            description: 'ID of the series this location belongs to' 
                        },
                        name: { 
                            type: 'string', 
                            description: 'Name of the location' 
                        },
                        location_type: {
                            type: 'string',
                            description: 'Type of location (city, forest, building, region, etc.)'
                        },
                        description: {
                            type: 'string',
                            description: 'Detailed description of the location'
                        },
                        parent_location_id: {
                            type: 'integer',
                            description: 'ID of parent location (e.g., city within a region)'
                        },
                        climate: {
                            type: 'string',
                            description: 'Climate or weather patterns'
                        },
                        terrain: {
                            type: 'string',
                            description: 'Terrain type and geographic features'
                        },
                        notable_features: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Notable landmarks or features'
                        },
                        atmosphere: {
                            type: 'string',
                            description: 'Mood or atmosphere of the location'
                        }
                    },
                    required: ['series_id', 'name', 'location_type']
                }
            },
            {
                name: 'update_location',
                description: 'Update an existing location',
                inputSchema: {
                    type: 'object',
                    properties: {
                        location_id: { 
                            type: 'integer', 
                            description: 'ID of the location to update' 
                        },
                        name: { 
                            type: 'string', 
                            description: 'Name of the location' 
                        },
                        location_type: {
                            type: 'string',
                            description: 'Type of location'
                        },
                        description: {
                            type: 'string',
                            description: 'Detailed description of the location'
                        },
                        parent_location_id: {
                            type: 'integer',
                            description: 'ID of parent location'
                        },
                        climate: {
                            type: 'string',
                            description: 'Climate or weather patterns'
                        },
                        terrain: {
                            type: 'string',
                            description: 'Terrain type and geographic features'
                        },
                        notable_features: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Notable landmarks or features'
                        },
                        atmosphere: {
                            type: 'string',
                            description: 'Mood or atmosphere of the location'
                        }
                    },
                    required: ['location_id']
                }
            },
            {
                name: 'get_locations',
                description: 'Get locations with optional filtering',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { 
                            type: 'integer', 
                            description: 'Filter by series ID' 
                        },
                        location_type: {
                            type: 'string',
                            description: 'Filter by location type'
                        },
                        parent_location_id: {
                            type: 'integer',
                            description: 'Filter by parent location'
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
                name: 'track_location_usage',
                description: 'Track where a location appears in the story',
                inputSchema: {
                    type: 'object',
                    properties: {
                        location_id: { 
                            type: 'integer', 
                            description: 'ID of the location' 
                        },
                        book_id: { 
                            type: 'integer', 
                            description: 'Book where location appears' 
                        },
                        chapter_id: {
                            type: 'integer',
                            description: 'Chapter where location appears (optional)'
                        },
                        usage_notes: {
                            type: 'string',
                            description: 'Notes about how location is used'
                        }
                    },
                    required: ['location_id', 'book_id']
                }
            }
        ];
    }

    // =============================================
    // LOCATION MANAGEMENT HANDLERS
    // =============================================

    async handleCreateLocation(args) {
        try {
            const { series_id, name, location_type, description, parent_location_id, 
                    climate, terrain, notable_features, atmosphere } = args;
            
            const query = `
                INSERT INTO locations (
                    series_id, name, location_type, description, parent_location_id,
                    climate, terrain, notable_features, atmosphere
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                RETURNING *
            `;
            
            const result = await this.db.query(query, [
                series_id, name, location_type, description || null, parent_location_id || null,
                climate || null, terrain || null, notable_features || [], atmosphere || null
            ]);
            
            const location = result.rows[0];
            
            // Get parent location name if exists
            let parentName = null;
            if (location.parent_location_id) {
                const parentQuery = 'SELECT name FROM locations WHERE id = $1';
                const parentResult = await this.db.query(parentQuery, [location.parent_location_id]);
                parentName = parentResult.rows[0]?.name;
            }
            
            return {
                content: [{
                    type: 'text',
                    text: `Created location successfully!\n\n` +
                          `ID: ${location.id}\n` +
                          `Name: ${location.name}\n` +
                          `Type: ${location.location_type}\n` +
                          `${parentName ? `Located in: ${parentName}\n` : ''}` +
                          `${location.climate ? `Climate: ${location.climate}\n` : ''}` +
                          `${location.terrain ? `Terrain: ${location.terrain}\n` : ''}` +
                          `${location.atmosphere ? `Atmosphere: ${location.atmosphere}\n` : ''}` +
                          `${location.notable_features && location.notable_features.length > 0 ? 
                            `Notable Features: ${location.notable_features.join(', ')}\n` : ''}` +
                          `Description: ${location.description || 'No description provided'}`
                }]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                if (error.constraint?.includes('parent_location')) {
                    throw new Error('Invalid parent_location_id: Parent location not found');
                } else {
                    throw new Error('Invalid series_id: Series not found');
                }
            }
            throw new Error(`Failed to create location: ${error.message}`);
        }
    }

    async handleUpdateLocation(args) {
        try {
            const { location_id, ...updates } = args;
            
            // Build dynamic update query
            const updateFields = [];
            const params = [location_id];
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
                UPDATE locations 
                SET ${updateFields.join(', ')}
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await this.db.query(query, params);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No location found with ID: ${location_id}`
                    }]
                };
            }
            
            const location = result.rows[0];
            
            return {
                content: [{
                    type: 'text',
                    text: `Updated location successfully!\n\n` +
                          `ID: ${location.id}\n` +
                          `Name: ${location.name}\n` +
                          `Type: ${location.location_type}\n` +
                          `${location.climate ? `Climate: ${location.climate}\n` : ''}` +
                          `${location.terrain ? `Terrain: ${location.terrain}\n` : ''}` +
                          `${location.atmosphere ? `Atmosphere: ${location.atmosphere}\n` : ''}` +
                          `Description: ${location.description || 'No description'}\n` +
                          `Updated: ${location.updated_at}`
                }]
            };
        } catch (error) {
            throw new Error(`Failed to update location: ${error.message}`);
        }
    }

    async handleGetLocations(args) {
        try {
            const { series_id, location_type, parent_location_id, search_term } = args;
            
            let query = `
                SELECT l.id as location_id, l.*, pl.name as parent_location_name,
                       (SELECT COUNT(*) FROM world_element_usage 
                        WHERE element_type = 'location' AND element_id = l.id) as usage_count
                FROM locations l 
                LEFT JOIN locations pl ON l.parent_location_id = pl.id
            `;
            
            const params = [];
            const conditions = [];
            let paramCount = 0;

            if (series_id) {
                paramCount++;
                conditions.push(`l.series_id = $${paramCount}`);
                params.push(series_id);
            }

            if (location_type) {
                paramCount++;
                conditions.push(`l.location_type = $${paramCount}`);
                params.push(location_type);
            }

            if (parent_location_id) {
                paramCount++;
                conditions.push(`l.parent_location_id = $${paramCount}`);
                params.push(parent_location_id);
            }

            if (search_term) {
                paramCount++;
                conditions.push(`(l.name ILIKE $${paramCount} OR l.description ILIKE $${paramCount})`);
                params.push(`%${search_term}%`);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            
            query += ' ORDER BY l.name';
            
            const result = await this.db.query(query, params);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: 'No locations found matching the criteria.'
                    }]
                };
            }
            
            let locationsText = `Found ${result.rows.length} locations:\n\n`;
            
            for (const location of result.rows) {
                locationsText += `🏛️ ${location.name}\n`;
                locationsText += `   ID: ${location.location_id}\n`;
                locationsText += `   Type: ${location.location_type}\n`;
                
                if (location.parent_location_name) {
                    locationsText += `   Located in: ${location.parent_location_name}\n`;
                }
                
                if (location.climate) {
                    locationsText += `   Climate: ${location.climate}\n`;
                }
                
                if (location.terrain) {
                    locationsText += `   Terrain: ${location.terrain}\n`;
                }
                
                if (location.atmosphere) {
                    locationsText += `   Atmosphere: ${location.atmosphere}\n`;
                }
                
                if (location.notable_features && location.notable_features.length > 0) {
                    locationsText += `   Features: ${location.notable_features.join(', ')}\n`;
                }
                
                locationsText += `   Story Usage: ${location.usage_count} times\n`;
                locationsText += `   Description: ${location.description || 'No description'}\n`;
                locationsText += '\n';
            }
            
            return {
                content: [{
                    type: 'text',
                    text: locationsText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get locations: ${error.message}`);
        }
    }

    async handleTrackLocationUsage(args) {
        try {
            const { location_id, book_id, chapter_id, usage_notes } = args;
            
            // Verify location exists
            const locationQuery = 'SELECT name, location_type FROM locations WHERE id = $1';
            const locationResult = await this.db.query(locationQuery, [location_id]);
            
            if (locationResult.rows.length === 0) {
                throw new Error(`Location with ID ${location_id} not found`);
            }
            
            const location = locationResult.rows[0];
            
            // Insert usage tracking
            const usageQuery = `
                INSERT INTO world_element_usage (
                    element_type, element_id, book_id, chapter_id, usage_notes
                ) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `;
            
            const usageResult = await this.db.query(usageQuery, [
                'location', location_id, book_id, chapter_id || null, usage_notes || null
            ]);
            
            // Get book and chapter info for display
            let contextInfo = '';
            const contextQuery = `
                SELECT b.title as book_title, 
                       ${chapter_id ? 'ch.title as chapter_title, ch.chapter_number' : 'NULL as chapter_title, NULL as chapter_number'}
                FROM books b 
                ${chapter_id ? 'LEFT JOIN chapters ch ON ch.chapter_id = $2 AND ch.book_id = b.id' : ''}
                WHERE b.id = $1
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
                    text: `Successfully tracked location usage!\n\n` +
                          `Location: ${location.name} (${location.location_type})\n` +
                          `${contextInfo}\n` +
                          `${usage_notes ? `Notes: ${usage_notes}\n` : ''}` +
                          `Tracked at: ${usageResult.rows[0].created_at}`
                }]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Invalid book_id or chapter_id');
            }
            throw new Error(`Failed to track location usage: ${error.message}`);
        }
    }
}