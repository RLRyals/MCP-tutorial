// src/mcps/character-server/handlers/character-timeline-handlers.js
// Character Timeline & Presence Management Handler - Track character appearances and progression
// Designed for AI Writing Teams to maintain character continuity across chapters

import { characterTimelineToolsSchema } from '../schemas/character-tools-schema.js';

export class CharacterTimelineHandlers {
    constructor(db) {
        this.db = db;
    }

    // =============================================
    // CHARACTER TIMELINE TOOL DEFINITIONS
    // =============================================
    getCharacterTimelineTools() {
        return characterTimelineToolsSchema;
    }

    // =============================================
    // CHARACTER TIMELINE MANAGEMENT HANDLERS
    // =============================================

    async handleTrackCharacterPresence(args) {
        try {
            const { character_id, chapter_id, scene_id, presence_type, importance_level,
                    physical_state, emotional_state, enters_at_scene, exits_at_scene,
                    learns_this_chapter, reveals_this_chapter, character_growth } = args;

            const result = await this.db.query(
                `INSERT INTO character_chapter_presence
                 (character_id, chapter_id, scene_id, presence_type, importance_level, physical_state,
                  emotional_state, enters_at_scene, exits_at_scene, learns_this_chapter,
                  reveals_this_chapter, character_growth)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 ON CONFLICT (character_id, chapter_id)
                 DO UPDATE SET
                   scene_id = EXCLUDED.scene_id,
                   presence_type = EXCLUDED.presence_type,
                   importance_level = EXCLUDED.importance_level,
                   physical_state = EXCLUDED.physical_state,
                   emotional_state = EXCLUDED.emotional_state,
                   enters_at_scene = EXCLUDED.enters_at_scene,
                   exits_at_scene = EXCLUDED.exits_at_scene,
                   learns_this_chapter = EXCLUDED.learns_this_chapter,
                   reveals_this_chapter = EXCLUDED.reveals_this_chapter,
                   character_growth = EXCLUDED.character_growth,
                   updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [character_id, chapter_id, scene_id || null, presence_type, importance_level || null,
                 physical_state || null, emotional_state || null, enters_at_scene || null,
                 exits_at_scene || null, learns_this_chapter || [], reveals_this_chapter || [],
                 character_growth || null]
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: `Character presence tracked successfully!\n\n` +
                              `Character ID: ${character_id}\n` +
                              `Chapter ID: ${chapter_id}\n` +
                              `Presence: ${presence_type}\n` +
                              `Physical State: ${physical_state || 'Not specified'}\n` +
                              `Emotional State: ${emotional_state || 'Not specified'}\n` +
                              `Growth: ${character_growth || 'Not specified'}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to track character presence: ${error.message}`);
        }
    }

    async handleGetCharacterTimeline(args) {
        try {
            const { character_id, book_id, include_scenes, include_knowledge, include_relationships } = args;

            let query = `
                SELECT
                    c.chapter_number,
                    c.title as chapter_title,
                    c.story_time_start,
                    c.story_time_end,
                    b.title as book_title,
                    ccp.presence_type,
                    ccp.physical_state,
                    ccp.emotional_state,
                    ccp.character_growth,
                    ccp.learns_this_chapter,
                    ccp.reveals_this_chapter
                FROM character_chapter_presence ccp
                JOIN chapters c ON ccp.chapter_id = c.id
                JOIN books b ON c.book_id = b.id
                WHERE ccp.character_id = $1
            `;

            const params = [character_id];
            let paramCount = 1;

            if (book_id) {
                paramCount++;
                query += ` AND c.book_id = $${paramCount}`;
                params.push(book_id);
            }

            query += ` ORDER BY b.book_number, c.chapter_number`;

            const result = await this.db.query(query, params);

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No timeline found for character ID: ${character_id}`
                        }
                    ]
                };
            }

            let timelineText = `Character Timeline:\n\n`;
            result.rows.forEach(row => {
                timelineText += `${row.book_title} - Chapter ${row.chapter_number}: ${row.chapter_title}\n`;
                timelineText += `  Presence: ${row.presence_type}\n`;
                if (row.physical_state) timelineText += `  Physical: ${row.physical_state}\n`;
                if (row.emotional_state) timelineText += `  Emotional: ${row.emotional_state}\n`;
                if (row.character_growth) timelineText += `  Growth: ${row.character_growth}\n`;
                if (row.learns_this_chapter && row.learns_this_chapter.length > 0) {
                    timelineText += `  Learns: ${row.learns_this_chapter.join(', ')}\n`;
                }
                if (row.reveals_this_chapter && row.reveals_this_chapter.length > 0) {
                    timelineText += `  Reveals: ${row.reveals_this_chapter.join(', ')}\n`;
                }
                timelineText += `\n`;
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: timelineText
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get character timeline: ${error.message}`);
        }
    }

    async handleCheckCharacterContinuity(args) {
        try {
            const { character_id, from_chapter_id, to_chapter_id, check_type } = args;

            // Get character state in both chapters
            const fromResult = await this.db.query(
                `SELECT ccp.*, c.chapter_number as from_chapter, c.title as from_title
                 FROM character_chapter_presence ccp
                 JOIN chapters c ON ccp.chapter_id = c.id
                 WHERE ccp.character_id = $1 AND ccp.chapter_id = $2`,
                [character_id, from_chapter_id]
            );

            const toResult = await this.db.query(
                `SELECT ccp.*, c.chapter_number as to_chapter, c.title as to_title
                 FROM character_chapter_presence ccp
                 JOIN chapters c ON ccp.chapter_id = c.id
                 WHERE ccp.character_id = $1 AND ccp.chapter_id = $2`,
                [character_id, to_chapter_id]
            );

            if (fromResult.rows.length === 0 || toResult.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Character presence not found in one or both chapters. Cannot check continuity.`
                        }
                    ]
                };
            }

            const fromState = fromResult.rows[0];
            const toState = toResult.rows[0];

            let continuityIssues = [];
            let continuityChecks = [];

            // Check physical state continuity
            if (check_type === 'physical_state' || check_type === 'all') {
                if (fromState.physical_state && toState.physical_state) {
                    if (fromState.physical_state.includes('injured') && !toState.physical_state.includes('injured') && !toState.physical_state.includes('healed')) {
                        continuityIssues.push(`Physical state: Character was injured in chapter ${fromState.from_chapter} but shows no sign of injury in chapter ${toState.to_chapter}`);
                    } else {
                        continuityChecks.push(`Physical state: Consistent from "${fromState.physical_state}" to "${toState.physical_state}"`);
                    }
                }
            }

            // Check emotional state progression
            if (check_type === 'emotional_state' || check_type === 'all') {
                if (fromState.emotional_state && toState.emotional_state) {
                    continuityChecks.push(`Emotional state: "${fromState.emotional_state}" to "${toState.emotional_state}"`);
                }
            }

            // Check knowledge continuity
            if (check_type === 'knowledge' || check_type === 'all') {
                if (fromState.learns_this_chapter && fromState.learns_this_chapter.length > 0) {
                    continuityChecks.push(`Knowledge gained in chapter ${fromState.from_chapter}: ${fromState.learns_this_chapter.join(', ')}`);
                }
            }

            let reportText = `Continuity Check Results:\n\n`;
            reportText += `From: Chapter ${fromState.from_chapter} - ${fromState.from_title}\n`;
            reportText += `To: Chapter ${toState.to_chapter} - ${toState.to_title}\n\n`;

            if (continuityIssues.length > 0) {
                reportText += `⚠️ ISSUES FOUND:\n`;
                continuityIssues.forEach(issue => reportText += `- ${issue}\n`);
                reportText += `\n`;
            }

            if (continuityChecks.length > 0) {
                reportText += `✅ CONTINUITY CHECKS:\n`;
                continuityChecks.forEach(check => reportText += `- ${check}\n`);
            }

            if (continuityIssues.length === 0 && continuityChecks.length === 0) {
                reportText += `No specific continuity data found for comparison.`;
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: reportText
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to check character continuity: ${error.message}`);
        }
    }

    async handleGetCharactersInChapter(args) {
        try {
            const { chapter_id, scene_number, presence_type, importance_level } = args;

            let query = `
                SELECT
                    c.name,
                    c.id as character_id,
                    ccp.presence_type,
                    ccp.importance_level,
                    ccp.physical_state,
                    ccp.emotional_state,
                    ccp.enters_at_scene,
                    ccp.exits_at_scene,
                    ccp.character_function,
                    ccp.scene_id
                FROM character_chapter_presence ccp
                JOIN characters c ON ccp.character_id = c.id
                WHERE ccp.chapter_id = $1
            `;

            const params = [chapter_id];
            let paramCount = 1;

            if (scene_number) {
                paramCount++;
                query += ` AND (ccp.scene_id IS NULL OR ccp.scene_id IN (
                    SELECT scene_id FROM chapter_scenes
                    WHERE chapter_id = $1 AND scene_number = $${paramCount}
                ))`;
                params.push(scene_number);
            }

            if (presence_type) {
                paramCount++;
                query += ` AND ccp.presence_type = $${paramCount}`;
                params.push(presence_type);
            }

            if (importance_level) {
                paramCount++;
                query += ` AND ccp.importance_level = $${paramCount}`;
                params.push(importance_level);
            }

            query += ` ORDER BY ccp.importance_level, c.name`;

            const result = await this.db.query(query, params);

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No characters found in chapter ${chapter_id}`
                        }
                    ]
                };
            }

            let charactersText = `Characters in Chapter:\n\n`;
            result.rows.forEach(char => {
                charactersText += `${char.name} (ID: ${char.character_id})\n`;
                charactersText += `  Presence: ${char.presence_type}\n`;
                charactersText += `  Importance: ${char.importance_level || 'Not specified'}\n`;
                if (char.physical_state) charactersText += `  Physical: ${char.physical_state}\n`;
                if (char.emotional_state) charactersText += `  Emotional: ${char.emotional_state}\n`;
                if (char.enters_at_scene) charactersText += `  Enters: Scene ${char.enters_at_scene}\n`;
                if (char.exits_at_scene) charactersText += `  Exits: Scene ${char.exits_at_scene}\n`;
                charactersText += `\n`;
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: charactersText
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get characters in chapter: ${error.message}`);
        }
    }
}
