// src/mcps/character-server/handlers/character-arc-handlers.js
// Character Arc Management for Books
// Tracks character development arcs within specific books

export class CharacterArcHandlers {
    constructor(db) {
        this.db = db;
    }

    async handleCreateCharacterArc(args) {
        const { character_id, book_id, arc_description, start_state, end_state } = args;

        // Use the proper character_arcs table
        const query = `
            INSERT INTO character_arcs (character_id, book_id, arc_name, starting_state, ending_state)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (character_id, book_id)
            DO UPDATE SET
                arc_name = EXCLUDED.arc_name,
                starting_state = EXCLUDED.starting_state,
                ending_state = EXCLUDED.ending_state,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;

        await this.db.query(query, [
            character_id,
            book_id,
            arc_description,
            start_state || null,
            end_state || null
        ]);

        return {
            content: [{
                type: 'text',
                text: `Created character arc for character ID ${character_id} in book ID ${book_id}\n\n` +
                      `Arc: ${arc_description}\n` +
                      `Start State: ${start_state || 'Not specified'}\n` +
                      `End State: ${end_state || 'Not specified'}`
            }]
        };
    }

    getCharacterArcTools() {
        return [
            {
                name: 'create_character_arc',
                description: 'Create character arc for this book',
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
            }
        ];
    }
}
