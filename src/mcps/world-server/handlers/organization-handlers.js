// src/mcps/world-server/handlers/organization-handlers.js
// Organization Management Handler - FULLY IMPLEMENTED
// Handles guilds, governments, groups, factions, and power structures

export class OrganizationHandlers {
    constructor(db) {
        this.db = db;
    }

    // =============================================
    // ORGANIZATION TOOL DEFINITIONS
    // =============================================
    getOrganizationTools() {
        return [
            {
                name: 'create_organization',
                description: 'Create guilds, governments, groups, factions, or other power structures',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { 
                            type: 'integer', 
                            description: 'ID of the series this organization belongs to' 
                        },
                        name: { 
                            type: 'string', 
                            description: 'Name of the organization (e.g., "The Thieves Guild", "Royal Court of Aethermoor")' 
                        },
                        organization_type: {
                            type: 'string',
                            description: 'Type: guild, government, military, religious, academic, criminal, merchant, secret_society, etc.'
                        },
                        description: {
                            type: 'string',
                            description: 'Detailed description of the organization'
                        },
                        influence_level: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 10,
                            description: 'Influence and power level (1=local group, 10=world power)'
                        },
                        headquarters_location_id: {
                            type: 'integer',
                            description: 'Location ID of main headquarters (optional)'
                        },
                        parent_organization_id: {
                            type: 'integer',
                            description: 'ID of parent organization if this is a sub-group (optional)'
                        },
                        member_count: {
                            type: 'integer',
                            description: 'Approximate number of members'
                        },
                        status: {
                            type: 'string',
                            description: 'Current status: active, disbanded, weakened, growing, unknown'
                        }
                    },
                    required: ['series_id', 'name', 'organization_type', 'description']
                }
            },
            {
                name: 'update_organization',
                description: 'Update an existing organization',
                inputSchema: {
                    type: 'object',
                    properties: {
                        organization_id: { 
                            type: 'integer', 
                            description: 'ID of the organization to update' 
                        },
                        name: { 
                            type: 'string', 
                            description: 'Organization name' 
                        },
                        organization_type: {
                            type: 'string',
                            description: 'Organization type'
                        },
                        description: {
                            type: 'string',
                            description: 'Organization description'
                        },
                        influence_level: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 10,
                            description: 'Influence level'
                        },
                        headquarters_location_id: {
                            type: 'integer',
                            description: 'Headquarters location ID'
                        },
                        parent_organization_id: {
                            type: 'integer',
                            description: 'Parent organization ID'
                        },
                        member_count: {
                            type: 'integer',
                            description: 'Number of members'
                        },
                        status: {
                            type: 'string',
                            description: 'Current status'
                        }
                    },
                    required: ['organization_id']
                }
            },
            {
                name: 'get_organizations',
                description: 'Get organizations with optional filtering',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { 
                            type: 'integer', 
                            description: 'Filter by series ID' 
                        },
                        organization_type: {
                            type: 'string',
                            description: 'Filter by organization type'
                        },
                        influence_level_min: {
                            type: 'integer',
                            description: 'Minimum influence level'
                        },
                        influence_level_max: {
                            type: 'integer',
                            description: 'Maximum influence level'
                        },
                        status: {
                            type: 'string',
                            description: 'Filter by status'
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
                name: 'track_organization_activity',
                description: 'Track where an organization appears or acts in the story',
                inputSchema: {
                    type: 'object',
                    properties: {
                        organization_id: { 
                            type: 'integer', 
                            description: 'ID of the organization' 
                        },
                        book_id: { 
                            type: 'integer', 
                            description: 'Book where organization appears' 
                        },
                        chapter_id: {
                            type: 'integer',
                            description: 'Chapter where organization appears (optional)'
                        },
                        activity_type: {
                            type: 'string',
                            description: 'Type of activity: meeting, conflict, recruitment, mission, politics, etc.'
                        },
                        activity_notes: {
                            type: 'string',
                            description: 'Notes about the organization\'s activity'
                        },
                        involved_characters: {
                            type: 'array',
                            items: { type: 'integer' },
                            description: 'Character IDs involved in this activity'
                        }
                    },
                    required: ['organization_id', 'book_id', 'activity_type']
                }
            }
        ];
    }

    // =============================================
    // STUB HANDLERS - FOR FUTURE IMPLEMENTATION
    // =============================================

// =============================================
    // ORGANIZATION MANAGEMENT HANDLERS
    // =============================================

    async handleCreateOrganization(args) {
        try {
            const {
                series_id, name, organization_type, description, influence_level,
                headquarters_location_id, parent_organization_id, member_count, status
            } = args;

            const query = `
                INSERT INTO organizations (
                    series_id, name, organization_type, description, influence_level,
                    headquarters_location_id, parent_organization_id, member_count, status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;

            const result = await this.db.query(query, [
                series_id, name, organization_type, description,
                influence_level || 5, headquarters_location_id || null,
                parent_organization_id || null, member_count || null,
                status || 'active'
            ]);

            const org = result.rows[0];

            // Get headquarters location name if exists
            let headquartersName = null;
            if (org.headquarters_location_id) {
                const locQuery = 'SELECT name FROM locations WHERE id = $1';
                const locResult = await this.db.query(locQuery, [org.headquarters_location_id]);
                headquartersName = locResult.rows[0]?.name;
            }

            return {
                content: [{
                    type: 'text',
                    text: `Created organization successfully!\n\n` +
                          `🏛️ ${org.name}\n` +
                          `ID: ${org.id}\n` +
                          `Type: ${org.organization_type}\n` +
                          `Influence Level: ${org.influence_level}/10\n` +
                          `Status: ${org.status}\n` +
                          `${headquartersName ? `Headquarters: ${headquartersName}\n` : ''}` +
                          `${org.member_count ? `Members: ${org.member_count}\n` : ''}` +
                          `Description: ${org.description}\n` +
                          `Created: ${org.created_at}`
                }]
            };
        } catch (error) {
            throw new Error(`Failed to create organization: ${error.message}`);
        }
    }

    async handleGetOrganizations(args) {
        try {
            const { series_id, organization_type, influence_level_min, influence_level_max, status, search_term } = args;

            let query = `
                SELECT o.id as organization_id, o.*, l.name as headquarters_name,
                       (SELECT COUNT(*) FROM world_element_usage
                        WHERE element_type = 'organization' AND element_id = o.id) as activity_count
                FROM organizations o
                LEFT JOIN locations l ON o.headquarters_location_id = l.id
            `;

            const params = [];
            const conditions = [];
            let paramCount = 0;

            if (series_id) {
                paramCount++;
                conditions.push(`o.series_id = $${paramCount}`);
                params.push(series_id);
            }

            if (organization_type) {
                paramCount++;
                conditions.push(`o.organization_type = $${paramCount}`);
                params.push(organization_type);
            }

            if (influence_level_min) {
                paramCount++;
                conditions.push(`o.influence_level >= $${paramCount}`);
                params.push(influence_level_min);
            }

            if (influence_level_max) {
                paramCount++;
                conditions.push(`o.influence_level <= $${paramCount}`);
                params.push(influence_level_max);
            }

            if (status) {
                paramCount++;
                conditions.push(`o.status = $${paramCount}`);
                params.push(status);
            }

            if (search_term) {
                paramCount++;
                conditions.push(`(o.name ILIKE $${paramCount} OR o.description ILIKE $${paramCount})`);
                params.push(`%${search_term}%`);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }

            query += ' ORDER BY o.influence_level DESC, o.name';

            const result = await this.db.query(query, params);

            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: 'No organizations found matching the criteria.'
                    }]
                };
            }

            let orgsText = `Found ${result.rows.length} organizations:\n\n`;

            for (const org of result.rows) {
                orgsText += `🏛️ ${org.name}\n`;
                orgsText += `   ID: ${org.organization_id}\n`;
                orgsText += `   Type: ${org.organization_type}\n`;
                orgsText += `   Influence Level: ${org.influence_level}/10\n`;
                orgsText += `   Status: ${org.status}\n`;

                if (org.headquarters_name) {
                    orgsText += `   Headquarters: ${org.headquarters_name}\n`;
                }

                if (org.member_count) {
                    orgsText += `   Members: ${org.member_count}\n`;
                }

                orgsText += `   Story Activity: ${org.activity_count} times\n`;
                orgsText += `   Description: ${org.description}\n\n`;
            }

            return {
                content: [{
                    type: 'text',
                    text: orgsText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get organizations: ${error.message}`);
        }
    }

    async handleTrackOrganizationActivity(args) {
        try {
            const { organization_id, book_id, chapter_id, activity_type, activity_notes, involved_characters } = args;
            
            // Verify organization exists
            const orgQuery = 'SELECT name, organization_type FROM organizations WHERE id = $1';
            const orgResult = await this.db.query(orgQuery, [organization_id]);
            
            if (orgResult.rows.length === 0) {
                throw new Error(`Organization with ID ${organization_id} not found`);
            }
            
            const org = orgResult.rows[0];
            
            // Build activity notes with character info
            let fullActivityNotes = `${activity_type}: ${activity_notes || ''}`;
            if (involved_characters && involved_characters.length > 0) {
                fullActivityNotes += ` [Characters: ${involved_characters.join(', ')}]`;
            }
            
            // Insert activity tracking
            const activityQuery = `
                INSERT INTO world_element_usage (
                    element_type, element_id, book_id, chapter_id, usage_notes
                ) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `;
            
            const activityResult = await this.db.query(activityQuery, [
                'organization', organization_id, book_id, chapter_id || null, fullActivityNotes
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
                    text: `Successfully tracked organization activity!\n\n` +
                          `🏛️ Organization: ${org.name} (${org.organization_type})\n` +
                          `Activity Type: ${activity_type}\n` +
                          `${contextInfo}\n` +
                          `${involved_characters && involved_characters.length > 0 ? 
                            `Involved Characters: ${involved_characters.join(', ')}\n` : ''}` +
                          `${activity_notes ? `Notes: ${activity_notes}\n` : ''}` +
                          `Tracked at: ${activityResult.rows[0].created_at}`
                }]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Invalid book_id or chapter_id');
            }
            throw new Error(`Failed to track organization activity: ${error.message}`);
        }
    }

   async handleUpdateOrganization(args) {
        try {
            const { organization_id, ...updates } = args;
            
            // Build dynamic update query
            const updateFields = [];
            const params = [organization_id];
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
                UPDATE organizations 
                SET ${updateFields.join(', ')}
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await this.db.query(query, params);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No organization found with ID: ${organization_id}`
                    }]
                };
            }
            
            const org = result.rows[0];

            return {
                content: [{
                    type: 'text',
                    text: `Updated organization successfully!\n\n` +
                          `🏛️ ${org.name}\n` +
                          `ID: ${org.id}\n` +
                          `Type: ${org.organization_type}\n` +
                          `Influence Level: ${org.influence_level}/10\n` +
                          `Status: ${org.status}\n` +
                          `${org.member_count ? `Members: ${org.member_count}\n` : ''}` +
                          `Description: ${org.description}\n` +
                          `Updated: ${org.updated_at}`
                }]
            };
        } catch (error) {
            throw new Error(`Failed to update organization: ${error.message}`);
        }
    }

}