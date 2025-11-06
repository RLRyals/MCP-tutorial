// src/mcps/character-server/handlers/character-knowledge-handlers.js
// Character Knowledge Management Handler - Track what characters know to prevent plot holes
// Designed for AI Writing Teams to maintain consistency in character knowledge

import { characterKnowledgeToolsSchema } from '../schemas/character-tools-schema.js';

export class CharacterKnowledgeHandlers {
    constructor(db) {
        this.db = db;
    }

    // =============================================
    // CHARACTER KNOWLEDGE TOOL DEFINITIONS
    // =============================================
    getCharacterKnowledgeTools() {
        return characterKnowledgeToolsSchema;
    }

    // =============================================
    // CHARACTER KNOWLEDGE MANAGEMENT HANDLERS
    // =============================================

    async handleAddCharacterKnowledge(args) {
        try {
            const { character_id, knowledge_category, knowledge_item, knowledge_level = 'knows',
                    learned_book_id, learned_context } = args;

            const result = await this.db.query(
                `INSERT INTO character_knowledge (character_id, knowledge_category, knowledge_item,
                                                knowledge_level, learned_book_id, learned_context)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [character_id, knowledge_category, knowledge_item, knowledge_level,
                 learned_book_id || null, learned_context || null]
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: `Character knowledge added successfully!\n\n` +
                              `Character ID: ${character_id}\n` +
                              `Knowledge: ${knowledge_item}\n` +
                              `Category: ${knowledge_category}\n` +
                              `Level: ${knowledge_level}\n` +
                              `Context: ${learned_context || 'Not specified'}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to add character knowledge: ${error.message}`);
        }
    }

    async handleAddCharacterKnowledgeWithChapter(args) {
        try {
            const { character_id, knowledge_category, knowledge_item, knowledge_level,
                    learned_chapter_id, learned_scene, learned_context } = args;

            // First add to character_knowledge table
            const knowledgeResult = await this.db.query(
                `INSERT INTO character_knowledge (character_id, knowledge_category, knowledge_item,
                                                knowledge_level, learned_context)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [character_id, knowledge_category, knowledge_item, knowledge_level, learned_context || null]
            );

            // Also update the character's presence in the chapter to track what they learned
            await this.db.query(
                `UPDATE character_chapter_presence
                 SET learns_this_chapter = COALESCE(learns_this_chapter, '{}') || $3::text[]
                 WHERE character_id = $1 AND chapter_id = $2`,
                [character_id, learned_chapter_id, [knowledge_item]]
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: `Character knowledge added with chapter reference!\n\n` +
                              `Character ID: ${character_id}\n` +
                              `Knowledge: ${knowledge_item}\n` +
                              `Category: ${knowledge_category}\n` +
                              `Level: ${knowledge_level}\n` +
                              `Learned in Chapter: ${learned_chapter_id}\n` +
                              `Context: ${learned_context || 'Not specified'}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to add character knowledge with chapter: ${error.message}`);
        }
    }

    async handleCheckCharacterKnowledge(args) {
        try {
            const { character_id, knowledge_item, knowledge_category } = args;

            let query = `
                SELECT ck.*, c.name as character_name, b.title as learned_book_title
                FROM character_knowledge ck
                JOIN characters c ON ck.character_id = c.id
                LEFT JOIN books b ON ck.learned_book_id = b.id
                WHERE ck.character_id = $1
            `;
            const params = [character_id];
            let paramCount = 1;

            if (knowledge_item) {
                paramCount++;
                query += ` AND ck.knowledge_item ILIKE $${paramCount}`;
                params.push(`%${knowledge_item}%`);
            }

            if (knowledge_category) {
                paramCount++;
                query += ` AND ck.knowledge_category = $${paramCount}`;
                params.push(knowledge_category);
            }

            query += ` ORDER BY ck.knowledge_category, ck.knowledge_item`;

            const result = await this.db.query(query, params);

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No knowledge found for character ID: ${character_id}${knowledge_item ? ` about: ${knowledge_item}` : ''}`
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `Knowledge for ${result.rows[0].character_name}:\n\n` +
                              result.rows.map(knowledge =>
                                  `${knowledge.knowledge_category}: ${knowledge.knowledge_item}\n` +
                                  `  Level: ${knowledge.knowledge_level}\n` +
                                  `  Learned: ${knowledge.learned_book_title || 'Unknown'}\n` +
                                  `  Context: ${knowledge.learned_context || 'Not specified'}\n`
                              ).join('\n')
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to check character knowledge: ${error.message}`);
        }
    }

    async handleGetCharactersWhoKnow(args) {
        try {
            const { series_id, knowledge_item, knowledge_level } = args;

            let query = `
                SELECT ck.*, c.name as character_name, b.title as learned_book_title
                FROM character_knowledge ck
                JOIN characters c ON ck.character_id = c.id
                LEFT JOIN books b ON ck.learned_book_id = b.id
                WHERE c.series_id = $1 AND ck.knowledge_item ILIKE $2
            `;
            const params = [series_id, `%${knowledge_item}%`];

            if (knowledge_level) {
                query += ` AND ck.knowledge_level = $3`;
                params.push(knowledge_level);
            }

            query += ` ORDER BY c.name, ck.knowledge_category`;

            const result = await this.db.query(query, params);

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No characters found who know about: ${knowledge_item}`
                        }
                    ]
                };
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `Characters who know about "${knowledge_item}":\n\n` +
                              result.rows.map(knowledge =>
                                  `${knowledge.character_name}:\n` +
                                  `  Knowledge: ${knowledge.knowledge_item}\n` +
                                  `  Level: ${knowledge.knowledge_level}\n` +
                                  `  Learned: ${knowledge.learned_book_title || 'Unknown'}\n`
                              ).join('\n')
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get characters who know: ${error.message}`);
        }
    }
}
