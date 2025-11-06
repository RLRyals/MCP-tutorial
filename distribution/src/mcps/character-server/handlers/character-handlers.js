// src/mcps/character-server/handlers/character-handlers.js
// Core Character Management Handler - CRUD operations for characters within series
// Designed for AI Writing Teams to manage character information

import { characterToolsSchema } from '../schemas/character-tools-schema.js';

export class CharacterHandlers {
    constructor(db) {
        this.db = db;
    }

    // =============================================
    // CHARACTER TOOL DEFINITIONS
    // =============================================
    getCharacterTools() {
        return characterToolsSchema;
    }

    // =============================================
    // CHARACTER MANAGEMENT HANDLERS
    // =============================================

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
                                  `ID: ${char.id}\n` +
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
                 WHERE c.id = $1`,
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
                              `ID: ${character.id}\n` +
                              `Name: ${character.name}${character.full_name ? ` (${character.full_name})` : ''}\n` +
                              `Series: ${character.series_title}\n` +
                              `Type: ${character.character_type}\n` +
                              `Status: ${character.status}\n` +
                              `Aliases: ${character.aliases && character.aliases.length > 0 ? character.aliases.join(', ') : 'None'}\n` 
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
                              `ID: ${character.id}\n` +
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
                WHERE id = $1
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
                              `ID: ${character.id}\n` +
                              `Name: ${character.name}${character.full_name ? ` (${character.full_name})` : ''}\n` +
                              `Type: ${character.character_type}\n` +
                              `Status: ${character.status}\n` 
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to update character: ${error.message}`);
        }
    }

    // =============================================
    // UTILITY METHODS FOR CROSS-COMPONENT USE
    // =============================================

    async getCharacterById(character_id) {
        try {
            const query = `
                SELECT c.*, s.title as series_title
                FROM characters c
                JOIN series s ON c.series_id = s.id
                WHERE c.id = $1
            `;
            const result = await this.db.query(query, [character_id]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to get character by ID: ${error.message}`);
        }
    }
}
