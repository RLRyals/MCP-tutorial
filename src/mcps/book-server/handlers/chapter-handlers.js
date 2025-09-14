// src/mcps/book-server/handlers/chapter-handlers.js
// Chapter Management Handler - Chapter CRUD operations within books
// Designed for AI Writing Teams to manage chapter-level story structure and character presence

export class ChapterHandlers {
    constructor(db) {
        this.db = db;
    }

    // =============================================
    // CHAPTER TOOL DEFINITIONS
    // =============================================
    getChapterTools() {
        return [
            {
                name: 'create_chapter',
                description: 'Create a new chapter within a book',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { 
                            type: 'integer', 
                            description: 'ID of the book this chapter belongs to' 
                        },
                        chapter_number: { 
                            type: 'integer', 
                            description: 'Chapter number within the book' 
                        },
                        title: { 
                            type: 'string', 
                            description: 'Chapter title' 
                        },
                        subtitle: { 
                            type: 'string', 
                            description: 'Optional chapter subtitle' 
                        },
                        summary: { 
                            type: 'string', 
                            description: 'Brief chapter summary' 
                        },
                        target_word_count: { 
                            type: 'integer', 
                            description: 'Target word count for this chapter' 
                        },
                        status: {
                            type: 'string',
                            enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                            default: 'planned',
                            description: 'Chapter writing status'
                        },
                        pov_character_id: { 
                            type: 'integer', 
                            description: 'ID of the POV character for this chapter' 
                        },
                        primary_location: { 
                            type: 'string', 
                            description: 'Main setting for this chapter' 
                        },
                        story_time_start: { 
                            type: 'string', 
                            description: 'When chapter events begin (e.g., "Day 1, 3pm")' 
                        },
                        story_time_end: { 
                            type: 'string', 
                            description: 'When chapter events end' 
                        },
                        story_duration: { 
                            type: 'string', 
                            description: 'How long chapter events take (e.g., "2 hours")' 
                        },
                        author_notes: { 
                            type: 'string', 
                            description: 'Planning notes and reminders' 
                        }
                    },
                    required: ['book_id', 'chapter_number']
                }
            },
            {
                name: 'update_chapter',
                description: 'Update an existing chapter',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chapter_id: { 
                            type: 'integer', 
                            description: 'ID of the chapter to update' 
                        },
                        title: { 
                            type: 'string', 
                            description: 'Chapter title' 
                        },
                        subtitle: { 
                            type: 'string', 
                            description: 'Chapter subtitle' 
                        },
                        summary: { 
                            type: 'string', 
                            description: 'Chapter summary' 
                        },
                        word_count: { 
                            type: 'integer', 
                            description: 'Current word count' 
                        },
                        target_word_count: { 
                            type: 'integer', 
                            description: 'Target word count' 
                        },
                        status: {
                            type: 'string',
                            enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                            description: 'Chapter writing status'
                        },
                        pov_character_id: { 
                            type: 'integer', 
                            description: 'POV character ID' 
                        },
                        primary_location: { 
                            type: 'string', 
                            description: 'Main setting for this chapter' 
                        },
                        story_time_start: { 
                            type: 'string', 
                            description: 'Chapter start time' 
                        },
                        story_time_end: { 
                            type: 'string', 
                            description: 'Chapter end time' 
                        },
                        story_duration: { 
                            type: 'string', 
                            description: 'Chapter duration' 
                        },
                        author_notes: { 
                            type: 'string', 
                            description: 'Author notes' 
                        },
                        writing_notes: { 
                            type: 'string', 
                            description: 'Writing process notes' 
                        }
                    },
                    required: ['chapter_id']
                }
            },
            {
                name: 'get_chapter',
                description: 'Get detailed information about a specific chapter',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chapter_id: { 
                            type: 'integer', 
                            description: 'ID of the chapter' 
                        },
                        include_scenes: {
                            type: 'boolean',
                            default: false,
                            description: 'Include scene information'
                        },
                        include_characters: {
                            type: 'boolean',
                            default: false,
                            description: 'Include character presence information'
                        }
                    },
                    required: ['chapter_id']
                }
            },
            {
                name: 'list_chapters',
                description: 'List all chapters in a book',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { 
                            type: 'integer', 
                            description: 'ID of the book' 
                        },
                        status: {
                            type: 'string',
                            enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                            description: 'Filter by chapter status (optional)'
                        },
                        include_stats: {
                            type: 'boolean',
                            default: false,
                            description: 'Include word count and scene statistics'
                        }
                    },
                    required: ['book_id']
                }
            },
            {
                name: 'delete_chapter',
                description: 'Delete a chapter and all its scenes',
                inputSchema: {
                    type: 'object',
                    properties: {
                        chapter_id: {
                            type: 'integer',
                            description: 'ID of the chapter to delete'
                        },
                        confirm_deletion: {
                            type: 'boolean',
                            description: 'Must be true to confirm deletion'
                        }
                    },
                    required: ['chapter_id', 'confirm_deletion']
                }
            },
            {
                name: 'reorder_chapters',
                description: 'Reorder chapters within a book by updating chapter numbers',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: {
                            type: 'integer',
                            description: 'ID of the book'
                        },
                        chapter_order: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    chapter_id: { type: 'integer' },
                                    new_chapter_number: { type: 'integer' }
                                },
                                required: ['chapter_id', 'new_chapter_number']
                            },
                            description: 'Array of chapter IDs and their new chapter numbers'
                        }
                    },
                    required: ['book_id', 'chapter_order']
                }
            }
        ];
    }

    // =============================================
    // CHAPTER MANAGEMENT HANDLERS
    // =============================================

    async handleCreateChapter(args) {
        try {
            const { book_id, chapter_number, title, subtitle, summary, target_word_count, 
                    status = 'planned', pov_character_id, primary_location, story_time_start, 
                    story_time_end, story_duration, author_notes } = args;
            
            // Check if chapter number already exists in this book
            const checkQuery = 'SELECT chapter_id FROM chapters WHERE book_id = $1 AND chapter_number = $2';
            const checkResult = await this.db.query(checkQuery, [book_id, chapter_number]);
            
            if (checkResult.rows.length > 0) {
                throw new Error(`Chapter ${chapter_number} already exists in this book`);
            }
            
            // Verify the book exists
            const bookQuery = 'SELECT id, title FROM books WHERE id = $1';
            const bookResult = await this.db.query(bookQuery, [book_id]);
            
            if (bookResult.rows.length === 0) {
                throw new Error(`Book with ID ${book_id} not found`);
            }
            
            const query = `
                INSERT INTO chapters (
                    book_id, chapter_number, title, subtitle, summary, target_word_count,
                    status, pov_character_id, primary_location, story_time_start,
                    story_time_end, story_duration, author_notes
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
            `;
            
            const result = await this.db.query(query, [
                book_id, chapter_number, title || null, subtitle || null, summary || null,
                target_word_count || null, status, pov_character_id || null, 
                primary_location || null, story_time_start || null, story_time_end || null,
                story_duration || null, author_notes || null
            ]);
            
            const chapter = result.rows[0];
            const bookTitle = bookResult.rows[0].title;
            
            let responseText = `Created chapter successfully!\n\n`;
            responseText += `ID: ${chapter.chapter_id}\n`;
            responseText += `Book: ${bookTitle}\n`;
            responseText += `Chapter: ${chapter.chapter_number}${chapter.title ? ` - ${chapter.title}` : ''}\n`;
            responseText += `Status: ${chapter.status}\n`;
            responseText += `Target Word Count: ${chapter.target_word_count || 'Not specified'}\n`;
            
            if (chapter.primary_location) {
                responseText += `Location: ${chapter.primary_location}\n`;
            }
            if (chapter.story_time_start) {
                responseText += `Timeline: ${chapter.story_time_start}${chapter.story_time_end ? ` - ${chapter.story_time_end}` : ''}\n`;
            }
            if (chapter.summary) {
                responseText += `Summary: ${chapter.summary}\n`;
            }
            
            return {
                content: [{
                    type: 'text',
                    text: responseText
                }]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                if (error.detail?.includes('pov_character_id')) {
                    throw new Error('Invalid pov_character_id: Character not found');
                } else {
                    throw new Error('Invalid book_id: Book not found');
                }
            }
            throw new Error(`Failed to create chapter: ${error.message}`);
        }
    }

    async handleUpdateChapter(args) {
        try {
            const { chapter_id, ...updates } = args;
            
            // Build dynamic update query
            const updateFields = [];
            const params = [chapter_id];
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
                UPDATE chapters 
                SET ${updateFields.join(', ')}
                WHERE chapter_id = $1
                RETURNING *
            `;
            
            const result = await this.db.query(query, params);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No chapter found with ID: ${chapter_id}`
                    }]
                };
            }
            
            const chapter = result.rows[0];
            
            // Get book title for display
            const bookQuery = 'SELECT title FROM books WHERE id = $1';
            const bookResult = await this.db.query(bookQuery, [chapter.book_id]);
            const bookTitle = bookResult.rows[0]?.title || 'Unknown';
            
            let responseText = `Updated chapter successfully!\n\n`;
            responseText += `ID: ${chapter.chapter_id}\n`;
            responseText += `Book: ${bookTitle}\n`;
            responseText += `Chapter: ${chapter.chapter_number}${chapter.title ? ` - ${chapter.title}` : ''}\n`;
            responseText += `Status: ${chapter.status}\n`;
            responseText += `Word Count: ${chapter.word_count || 0}\n`;
            responseText += `Target: ${chapter.target_word_count || 'Not specified'}\n`;
            responseText += `Updated: ${chapter.updated_at}\n`;
            
            return {
                content: [{
                    type: 'text',
                    text: responseText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to update chapter: ${error.message}`);
        }
    }

    async handleGetChapter(args) {
        try {
            const { chapter_id, include_scenes = false, include_characters = false } = args;
            
            const query = `
                SELECT c.*, b.title as book_title, b.id as book_id,
                       ch.name as pov_character_name
                FROM chapters c
                JOIN books b ON c.book_id = b.id
                LEFT JOIN characters ch ON c.pov_character_id = ch.character_id
                WHERE c.chapter_id = $1
            `;
            
            const result = await this.db.query(query, [chapter_id]);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No chapter found with ID: ${chapter_id}`
                    }]
                };
            }
            
            const chapter = result.rows[0];
            
            let chapterText = `Chapter Details:\n\n`;
            chapterText += `ID: ${chapter.chapter_id}\n`;
            chapterText += `Book: ${chapter.book_title}\n`;
            chapterText += `Chapter: ${chapter.chapter_number}${chapter.title ? ` - ${chapter.title}` : ''}\n`;
            
            if (chapter.subtitle) {
                chapterText += `Subtitle: ${chapter.subtitle}\n`;
            }
            
            chapterText += `Status: ${chapter.status}\n`;
            chapterText += `Word Count: ${chapter.word_count || 0}\n`;
            chapterText += `Target Words: ${chapter.target_word_count || 'Not specified'}\n`;
            
            if (chapter.pov_character_name) {
                chapterText += `POV Character: ${chapter.pov_character_name}\n`;
            }
            
            if (chapter.primary_location) {
                chapterText += `Primary Location: ${chapter.primary_location}\n`;
            }
            
            if (chapter.story_time_start) {
                chapterText += `Timeline: ${chapter.story_time_start}`;
                if (chapter.story_time_end) {
                    chapterText += ` - ${chapter.story_time_end}`;
                }
                if (chapter.story_duration) {
                    chapterText += ` (Duration: ${chapter.story_duration})`;
                }
                chapterText += `\n`;
            }
            
            if (chapter.summary) {
                chapterText += `Summary: ${chapter.summary}\n`;
            }
            
            if (chapter.author_notes) {
                chapterText += `Author Notes: ${chapter.author_notes}\n`;
            }
            
            if (chapter.writing_notes) {
                chapterText += `Writing Notes: ${chapter.writing_notes}\n`;
            }
            
            chapterText += `Created: ${chapter.created_at}\n`;
            chapterText += `Updated: ${chapter.updated_at}\n`;

            if (include_scenes) {
                const scenesQuery = `
                    SELECT scene_id, scene_number, scene_title, word_count, location
                    FROM chapter_scenes 
                    WHERE chapter_id = $1 
                    ORDER BY scene_number
                `;
                const scenesResult = await this.db.query(scenesQuery, [chapter_id]);
                
                if (scenesResult.rows.length > 0) {
                    chapterText += `\nScenes (${scenesResult.rows.length}):\n`;
                    scenesResult.rows.forEach(scene => {
                        chapterText += `  Scene ${scene.scene_number}${scene.scene_title ? `: ${scene.scene_title}` : ''} `;
                        chapterText += `(${scene.word_count || 0} words)`;
                        if (scene.location) chapterText += ` @ ${scene.location}`;
                        chapterText += `\n`;
                    });
                } else {
                    chapterText += `\nNo scenes created yet.\n`;
                }
            }

            if (include_characters) {
                const charactersQuery = `
                    SELECT ch.name, ccp.presence_type, ccp.importance_level, 
                           ccp.physical_state, ccp.emotional_state
                    FROM character_chapter_presence ccp
                    JOIN characters ch ON ccp.character_id = ch.character_id
                    WHERE ccp.chapter_id = $1
                    ORDER BY ccp.importance_level, ch.name
                `;
                const charactersResult = await this.db.query(charactersQuery, [chapter_id]);
                
                if (charactersResult.rows.length > 0) {
                    chapterText += `\nCharacter Presence (${charactersResult.rows.length}):\n`;
                    charactersResult.rows.forEach(char => {
                        chapterText += `  ${char.name} (${char.presence_type}`;
                        if (char.importance_level) chapterText += `, ${char.importance_level}`;
                        chapterText += `)`;
                        if (char.physical_state || char.emotional_state) {
                            const states = [char.physical_state, char.emotional_state].filter(Boolean);
                            chapterText += ` - ${states.join(', ')}`;
                        }
                        chapterText += `\n`;
                    });
                } else {
                    chapterText += `\nNo character presence tracked yet.\n`;
                }
            }
            
            return {
                content: [{
                    type: 'text',
                    text: chapterText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get chapter: ${error.message}`);
        }
    }

    async handleListChapters(args) {
        try {
            const { book_id, status, include_stats = false } = args;
            
            let query = `
                SELECT c.*, ch.name as pov_character_name
                FROM chapters c
                LEFT JOIN characters ch ON c.pov_character_id = ch.character_id
                WHERE c.book_id = $1
            `;
            
            const params = [book_id];
            let paramCount = 1;
            
            if (status) {
                paramCount++;
                query += ` AND c.status = $${paramCount}`;
                params.push(status);
            }
            
            query += ' ORDER BY c.chapter_number';
            
            const result = await this.db.query(query, params);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No chapters found for book ID: ${book_id}`
                    }]
                };
            }
            
            // Get book title
            const bookQuery = 'SELECT title FROM books WHERE id = $1';
            const bookResult = await this.db.query(bookQuery, [book_id]);
            const bookTitle = bookResult.rows[0]?.title || 'Unknown';
            
            let chaptersText = `Chapters for "${bookTitle}" (${result.rows.length} chapters):\n\n`;
            
            for (const chapter of result.rows) {
                chaptersText += `Chapter ${chapter.chapter_number}${chapter.title ? `: ${chapter.title}` : ' (Untitled)'}\n`;
                chaptersText += `  Status: ${chapter.status}\n`;
                chaptersText += `  Words: ${chapter.word_count || 0}`;
                
                if (chapter.target_word_count) {
                    const progress = Math.round(((chapter.word_count || 0) / chapter.target_word_count) * 100);
                    chaptersText += ` / ${chapter.target_word_count} (${progress}%)`;
                }
                chaptersText += `\n`;
                
                if (chapter.pov_character_name) {
                    chaptersText += `  POV: ${chapter.pov_character_name}\n`;
                }
                
                if (chapter.primary_location) {
                    chaptersText += `  Location: ${chapter.primary_location}\n`;
                }
                
                if (include_stats) {
                    // Get scene count
                    const sceneCountQuery = 'SELECT COUNT(*) as scene_count FROM chapter_scenes WHERE chapter_id = $1';
                    const sceneCountResult = await this.db.query(sceneCountQuery, [chapter.chapter_id]);
                    const sceneCount = sceneCountResult.rows[0].scene_count;
                    
                    chaptersText += `  Scenes: ${sceneCount}\n`;
                }
                
                if (chapter.summary) {
                    const shortSummary = chapter.summary.length > 100 
                        ? chapter.summary.substring(0, 100) + '...' 
                        : chapter.summary;
                    chaptersText += `  Summary: ${shortSummary}\n`;
                }
                
                chaptersText += `\n`;
            }
            
            return {
                content: [{
                    type: 'text',
                    text: chaptersText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to list chapters: ${error.message}`);
        }
    }

    async handleDeleteChapter(args) {
        try {
            const { chapter_id, confirm_deletion } = args;
            
            if (!confirm_deletion) {
                throw new Error('Must confirm deletion by setting confirm_deletion to true');
            }
            
            // Get chapter info before deletion
            const chapterQuery = `
                SELECT c.chapter_number, c.title, b.title as book_title,
                       (SELECT COUNT(*) FROM chapter_scenes WHERE chapter_id = c.chapter_id) as scene_count
                FROM chapters c 
                JOIN books b ON c.book_id = b.id
                WHERE c.chapter_id = $1
            `;
            const chapterResult = await this.db.query(chapterQuery, [chapter_id]);
            
            if (chapterResult.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No chapter found with ID: ${chapter_id}`
                    }]
                };
            }
            
            const chapterInfo = chapterResult.rows[0];
            
            // Delete the chapter (cascade will handle scenes and character presence)
            const deleteQuery = 'DELETE FROM chapters WHERE chapter_id = $1 RETURNING *';
            await this.db.query(deleteQuery, [chapter_id]);
            
            return {
                content: [{
                    type: 'text',
                    text: `Successfully deleted Chapter ${chapterInfo.chapter_number}${chapterInfo.title ? `: ${chapterInfo.title}` : ''}\n` +
                          `Book: ${chapterInfo.book_title}\n` +
                          `${chapterInfo.scene_count} scenes and all character presence data were also deleted.\n\n` +
                          `⚠️ This action cannot be undone.`
                }]
            };
        } catch (error) {
            throw new Error(`Failed to delete chapter: ${error.message}`);
        }
    }

    async handleReorderChapters(args) {
        try {
            const { book_id, chapter_order } = args;
            
            // Start a transaction for atomic reordering
            return await this.db.transaction(async (client) => {
                // Verify all chapters belong to the specified book
                const chapterIds = chapter_order.map(item => item.chapter_id);
                const verifyQuery = `
                    SELECT chapter_id FROM chapters 
                    WHERE book_id = $1 AND chapter_id = ANY($2)
                `;
                const verifyResult = await client.query(verifyQuery, [book_id, chapterIds]);
                
                if (verifyResult.rows.length !== chapter_order.length) {
                    throw new Error('One or more chapters do not belong to the specified book');
                }
                
                // Check for duplicate chapter numbers
                const newNumbers = chapter_order.map(item => item.new_chapter_number);
                const uniqueNumbers = new Set(newNumbers);
                if (uniqueNumbers.size !== newNumbers.length) {
                    throw new Error('Duplicate chapter numbers detected in reorder request');
                }
                
                // Update each chapter's number
                const updates = [];
                for (const item of chapter_order) {
                    const updateQuery = `
                        UPDATE chapters 
                        SET chapter_number = $1, updated_at = CURRENT_TIMESTAMP 
                        WHERE chapter_id = $2
                        RETURNING chapter_id, chapter_number, title
                    `;
                    const updateResult = await client.query(updateQuery, [item.new_chapter_number, item.chapter_id]);
                    updates.push(updateResult.rows[0]);
                }
                
                // Get book title for response
                const bookQuery = 'SELECT title FROM books WHERE id = $1';
                const bookResult = await client.query(bookQuery, [book_id]);
                const bookTitle = bookResult.rows[0]?.title || 'Unknown';
                
                let responseText = `Successfully reordered chapters in "${bookTitle}":\n\n`;
                updates.sort((a, b) => a.chapter_number - b.chapter_number);
                updates.forEach(chapter => {
                    responseText += `Chapter ${chapter.chapter_number}${chapter.title ? `: ${chapter.title}` : ''}\n`;
                });
                
                return {
                    content: [{
                        type: 'text',
                        text: responseText
                    }]
                };
            });
        } catch (error) {
            throw new Error(`Failed to reorder chapters: ${error.message}`);
        }
    }

    // =============================================
    // UTILITY METHODS FOR CROSS-COMPONENT USE
    // =============================================

    async getChaptersByBookId(book_id) {
        try {
            const query = `
                SELECT * FROM chapters 
                WHERE book_id = $1 
                ORDER BY chapter_number
            `;
            const result = await this.db.query(query, [book_id]);
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get chapters by book ID: ${error.message}`);
        }
    }

    async getChapterById(chapter_id) {
        try {
            const query = `
                SELECT c.*, b.title as book_title
                FROM chapters c
                JOIN books b ON c.book_id = b.id
                WHERE c.chapter_id = $1
            `;
            const result = await this.db.query(query, [chapter_id]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to get chapter by ID: ${error.message}`);
        }
    }

    async updateChapterWordCount(chapter_id, new_word_count) {
        try {
            const query = `
                UPDATE chapters 
                SET word_count = $2, updated_at = CURRENT_TIMESTAMP 
                WHERE chapter_id = $1 
                RETURNING word_count, book_id
            `;
            const result = await this.db.query(query, [chapter_id, new_word_count]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to update chapter word count: ${error.message}`);
        }
    }

    async getChapterIdByBookAndNumber(book_id, chapter_number) {
        try {
            const query = 'SELECT chapter_id FROM chapters WHERE book_id = $1 AND chapter_number = $2';
            const result = await this.db.query(query, [book_id, chapter_number]);
            return result.rows[0]?.chapter_id || null;
        } catch (error) {
            throw new Error(`Failed to get chapter ID: ${error.message}`);
        }
    }
}