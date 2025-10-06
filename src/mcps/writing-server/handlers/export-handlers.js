// Export handlers for AI writing team to automatically prepare manuscripts
export class ExportHandlers {
    constructor(db) {
        this.db = db;
    }

    // Tool definitions for AI writing team exports
    getExportTools() {
        return [
            {
                name: 'export_manuscript',
                description: 'Export complete manuscript in various formats - AI team prepares automatically',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { 
                            type: 'integer',
                            description: 'Book to export' 
                        },
                        export_format: {
                            type: 'string',
                            enum: ['txt', 'md', 'rtf', 'standard_manuscript'],
                            default: 'txt',
                            description: 'Export format for manuscript'
                        },
                        include_metadata: {
                            type: 'boolean',
                            default: true,
                            description: 'Include chapter summaries and metadata'
                        },
                        chapters_to_include: {
                            type: 'array',
                            items: { type: 'integer' },
                            description: 'Specific chapters to include (optional - includes all if not provided)'
                        },
                        export_purpose: {
                            type: 'string',
                            enum: ['submission', 'beta_review', 'backup', 'publication'],
                            default: 'backup',
                            description: 'Purpose of export for formatting decisions'
                        }
                    },
                    required: ['book_id']
                }
            },
            {
                name: 'word_count_tracking',
                description: 'Track and analyze word counts across manuscript - AI team monitors automatically',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { 
                            type: 'integer',
                            description: 'Book to analyze' 
                        },
                        tracking_level: {
                            type: 'string',
                            enum: ['book', 'chapter', 'scene', 'detailed'],
                            default: 'chapter',
                            description: 'Level of word count detail to track'
                        },
                        include_history: {
                            type: 'boolean',
                            default: false,
                            description: 'Include word count change history'
                        },
                        calculate_targets: {
                            type: 'boolean',
                            default: true,
                            description: 'Calculate progress against targets'
                        }
                    },
                    required: ['book_id']
                }
            }
        ];
    }

    // AI team exports manuscripts automatically
    async handleExportManuscript(args) {
        const { book_id, export_format = 'txt', include_metadata = true, 
                chapters_to_include, export_purpose = 'backup' } = args;

        try {
            // Get book information
            const book_data = await this.db.query(`
                SELECT
                    b.title, b.subtitle, b.actual_word_count, b.target_word_count,
                    b.description, b.status,
                    s.title as series_title,
                    a.name as author_name,
                    bwg.genre_names
                FROM books b
                LEFT JOIN series s ON b.series_id = s.id
                LEFT JOIN authors a ON s.author_id = a.id
                LEFT JOIN books_with_genres bwg ON b.id = bwg.id
                WHERE b.id = $1
            `, [book_id]);

            if (book_data.rows.length === 0) {
                throw new Error('Book not found');
            }

            const book = book_data.rows[0];

            // Get chapters for export
            let chapter_filter = '';
            let query_params = [book_id];
            
            if (chapters_to_include && chapters_to_include.length > 0) {
                chapter_filter = `AND c.id = ANY($2)`;
                query_params.push(chapters_to_include);
            }

            const chapters_data = await this.db.query(`
                SELECT 
                    c.id as chapter_id, c.chapter_number, c.title, c.subtitle, c.word_count,
                    c.summary, c.primary_location, c.pov_character_id,
                    ch.name as pov_character_name,
                    c.status, c.author_notes
                FROM chapters c
                LEFT JOIN characters ch ON c.pov_character_id = ch.id
                WHERE c.book_id = $1 ${chapter_filter}
                ORDER BY c.chapter_number
            `, query_params);

            // Generate export content based on format
            let export_content = '';
            let filename = `${this.sanitizeFilename(book.title)}.${export_format}`;

            switch (export_format) {
                case 'txt':
                    export_content = await this.generateTextExport(book, chapters_data.rows, include_metadata);
                    break;
                case 'md':
                    export_content = await this.generateMarkdownExport(book, chapters_data.rows, include_metadata);
                    break;
                case 'rtf':
                    export_content = await this.generateRTFExport(book, chapters_data.rows, include_metadata);
                    break;
                case 'standard_manuscript':
                    export_content = await this.generateStandardManuscriptExport(book, chapters_data.rows, export_purpose);
                    break;
            }

            // Calculate export statistics
            const export_stats = {
                total_chapters: chapters_data.rows.length,
                total_words: chapters_data.rows.reduce((sum, ch) => sum + (ch.word_count || 0), 0),
                export_length: export_content.length,
                chapters_included: chapters_data.rows.map(ch => ({ 
                    number: ch.chapter_number, 
                    title: ch.title,
                    word_count: ch.word_count 
                }))
            };

            // Log export activity
            const export_record = await this.db.query(`
                INSERT INTO manuscript_exports (
                    book_id, export_format, export_type, chapters_included,
                    total_word_count, filename, export_notes, intended_use
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, export_date
            `, [
                book_id, 
                export_format,
                chapters_to_include ? 'partial' : 'full_manuscript',
                chapters_to_include || chapters_data.rows.map(ch => ch.id),
                export_stats.total_words,
                filename,
                `AI team export for ${export_purpose}`,
                export_purpose
            ]);

            return {
                success: true,
                export_id: export_record.rows[0].id,
                filename,
                export_format,
                export_content, // The actual manuscript content
                statistics: export_stats,
                book_title: book.title,
                author_name: book.author_name,
                export_timestamp: export_record.rows[0].export_date,
                message: 'Manuscript exported by AI writing team'
            };

        } catch (error) {
            console.error('Error exporting manuscript:', error);
            throw new Error(`Failed to export manuscript: ${error.message}`);
        }
    }

    // AI team tracks word counts automatically
    async handleWordCountTracking(args) {
        const { book_id, tracking_level = 'chapter', include_history = false, 
                calculate_targets = true } = args;

        try {
            let tracking_data = {
                book_id,
                tracking_level,
                analysis_timestamp: new Date().toISOString(),
                word_count_summary: {},
                details: {}
            };

            // Get book-level word count data
            const book_summary = await this.db.query(`
                SELECT 
                    b.title, b.actual_word_count, b.target_word_count,
                    b.status, COUNT(c.id) as chapter_count,
                    SUM(c.word_count) as chapter_total_words,
                    AVG(c.word_count) as avg_chapter_length,
                    MIN(c.word_count) as shortest_chapter,
                    MAX(c.word_count) as longest_chapter
                FROM books b
                LEFT JOIN chapters c ON b.id = c.book_id
                WHERE b.id = $1
                GROUP BY b.id, b.title, b.actual_word_count, b.target_word_count, b.status
            `, [book_id]);

            tracking_data.word_count_summary = book_summary.rows[0];

            // Calculate progress against targets if requested
            if (calculate_targets && book_summary.rows[0].target_word_count) {
                const current_words = book_summary.rows[0].chapter_total_words || book_summary.rows[0].actual_word_count || 0;
                const target_words = book_summary.rows[0].target_word_count;
                
                tracking_data.target_progress = {
                    current_words,
                    target_words,
                    completion_percentage: Math.round((current_words / target_words) * 100),
                    words_remaining: Math.max(0, target_words - current_words),
                    status: current_words >= target_words ? 'target_met' : 'in_progress'
                };
            }

            // Get detailed tracking based on level
            switch (tracking_level) {
                case 'book':
                    // Book-level summary already included above
                    break;

                case 'chapter':
                    const chapter_details = await this.db.query(`
                        SELECT 
                            c.chapter_number, c.title, c.word_count, c.target_word_count,
                            c.status, COUNT(s.id) as scene_count,
                            SUM(s.word_count) as scene_total_words
                        FROM chapters c
                        LEFT JOIN chapter_scenes s ON c.id = s.chapter_id
                        WHERE c.book_id = $1
                        GROUP BY c.id, c.chapter_number, c.title, c.word_count, 
                                c.target_word_count, c.status
                        ORDER BY c.chapter_number
                    `, [book_id]);

                    tracking_data.details.chapters = chapter_details.rows.map(chapter => ({
                        ...chapter,
                        target_variance: chapter.target_word_count ? 
                            chapter.word_count - chapter.target_word_count : null,
                        completion_status: chapter.word_count && chapter.target_word_count ?
                            (chapter.word_count >= chapter.target_word_count ? 'target_met' : 'under_target') :
                            'no_target_set'
                    }));
                    break;

                case 'scene':
                    const scene_details = await this.db.query(`
                        SELECT 
                            c.chapter_number, c.title as chapter_title,
                            s.scene_number, s.scene_title, s.word_count,
                            s.writing_status as status, s.scene_purpose
                        FROM chapters c
                        JOIN chapter_scenes s ON c.id = s.chapter_id
                        WHERE c.book_id = $1
                        ORDER BY c.chapter_number, s.scene_number
                    `, [book_id]);

                    // Group scenes by chapter
                    const scenes_by_chapter = {};
                    scene_details.rows.forEach(scene => {
                        if (!scenes_by_chapter[scene.chapter_number]) {
                            scenes_by_chapter[scene.chapter_number] = {
                                chapter_title: scene.chapter_title,
                                scenes: []
                            };
                        }
                        scenes_by_chapter[scene.chapter_number].scenes.push({
                            scene_number: scene.scene_number,
                            scene_title: scene.scene_title,
                            word_count: scene.word_count,
                            status: scene.status,
                            scene_purpose: scene.scene_purpose
                        });
                    });

                    tracking_data.details.scenes_by_chapter = scenes_by_chapter;
                    break;

                case 'detailed':
                    // Include both chapter and scene level data plus additional analytics
                    const detailed_data = await this.db.query(`
                        SELECT 
                            c.chapter_number, c.title, c.word_count as chapter_words,
                            c.target_word_count, c.status as chapter_status,
                            s.scene_number, s.scene_title, s.word_count as scene_words,
                            s.writing_status as scene_status, s.scene_purpose,
                            ch.name as pov_character
                        FROM chapters c
                        LEFT JOIN chapter_scenes s ON c.id = s.chapter_id
                        LEFT JOIN characters ch ON c.pov_character_id = ch.id
                        WHERE c.book_id = $1
                        ORDER BY c.chapter_number, s.scene_number
                    `, [book_id]);

                    tracking_data.details.detailed_breakdown = detailed_data.rows;
                    break;
            }

            // Include word count history if requested
            if (include_history) {
                const history_data = await this.db.query(`
                    SELECT 
                        ws.session_date,
                        SUM(ws.words_written) as daily_words_written,
                        SUM(ws.words_edited) as daily_words_edited,
                        SUM(ws.net_words) as daily_net_change,
                        COUNT(ws.id) as sessions_count
                    FROM writing_sessions ws
                    WHERE ws.book_id = $1
                    GROUP BY ws.session_date
                    ORDER BY ws.session_date DESC
                    LIMIT 30
                `, [book_id]);

                tracking_data.word_count_history = history_data.rows;
            }

            return tracking_data;

        } catch (error) {
            console.error('Error tracking word counts:', error);
            throw new Error(`Failed to track word counts: ${error.message}`);
        }
    }

    // Helper methods for different export formats
    async generateTextExport(book, chapters, include_metadata) {
        let content = '';
        
        // Add header with book information
        content += `${book.title}\n`;
        if (book.subtitle) content += `${book.subtitle}\n`;
        if (book.author_name) content += `by ${book.author_name}\n`;
        content += '\n' + '='.repeat(50) + '\n\n';

        // Add metadata if requested
        if (include_metadata) {
            content += `Series: ${book.series_title || 'Standalone'}\n`;
            content += `Word Count: ${book.actual_word_count || 'TBD'}\n`;
            content += `Status: ${book.status}\n`;
            if (book.description) {
                content += `\nDescription:\n${book.description}\n`;
            }
            content += '\n' + '='.repeat(50) + '\n\n';
        }

        // Add chapters
        chapters.forEach(chapter => {
            content += `Chapter ${chapter.chapter_number}`;
            if (chapter.title) content += `: ${chapter.title}`;
            content += '\n\n';

            if (include_metadata && (chapter.summary || chapter.pov_character_name || chapter.primary_location)) {
                content += '[Chapter Info]\n';
                if (chapter.pov_character_name) content += `POV: ${chapter.pov_character_name}\n`;
                if (chapter.primary_location) content += `Location: ${chapter.primary_location}\n`;
                if (chapter.word_count) content += `Word Count: ${chapter.word_count}\n`;
                if (chapter.summary) content += `Summary: ${chapter.summary}\n`;
                content += '\n';
            }

            content += '[Chapter content would be inserted here from actual chapter text]\n\n';
            content += '* * *\n\n'; // Scene break
        });

        return content;
    }

    async generateMarkdownExport(book, chapters, include_metadata) {
        let content = '';
        
        // Add YAML front matter for metadata
        if (include_metadata) {
            content += '---\n';
            content += `title: "${book.title}"\n`;
            if (book.subtitle) content += `subtitle: "${book.subtitle}"\n`;
            if (book.author_name) content += `author: "${book.author_name}"\n`;
            if (book.series_title) content += `series: "${book.series_title}"\n`;
            content += `word_count: ${book.actual_word_count || 0}\n`;
            content += `export_date: "${new Date().toISOString()}"\n`;
            content += '---\n\n';
        }

        // Add book title as main heading
        content += `# ${book.title}\n\n`;
        if (book.subtitle) content += `## ${book.subtitle}\n\n`;
        if (book.author_name) content += `*by ${book.author_name}*\n\n`;

        // Add chapters as sections
        chapters.forEach(chapter => {
            content += `## Chapter ${chapter.chapter_number}`;
            if (chapter.title) content += `: ${chapter.title}`;
            content += '\n\n';

            if (include_metadata) {
                content += '> **Chapter Information**\n';
                if (chapter.pov_character_name) content += `> - POV: ${chapter.pov_character_name}\n`;
                if (chapter.primary_location) content += `> - Location: ${chapter.primary_location}\n`;
                if (chapter.word_count) content += `> - Word Count: ${chapter.word_count}\n`;
                if (chapter.summary) content += `> - Summary: ${chapter.summary}\n`;
                content += '\n';
            }

            content += '*[Chapter content would be inserted here from actual chapter text]*\n\n';
            content += '---\n\n'; // Horizontal rule between chapters
        });

        return content;
    }

    async generateRTFExport(book, chapters, include_metadata) {
        // Basic RTF format - would be expanded for full RTF support
        let content = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24\n';
        
        content += `{\\b\\fs36 ${book.title}\\par}\n`;
        if (book.subtitle) content += `{\\fs28 ${book.subtitle}\\par}\n`;
        if (book.author_name) content += `{\\i by ${book.author_name}\\par}\n`;
        content += '\\par\n';

        chapters.forEach(chapter => {
            content += `{\\b\\fs28 Chapter ${chapter.chapter_number}`;
            if (chapter.title) content += `: ${chapter.title}`;
            content += '\\par}\n\\par\n';

            if (include_metadata && chapter.summary) {
                content += `{\\i ${chapter.summary}\\par}\n\\par\n`;
            }

            content += '[Chapter content would be inserted here from actual chapter text]\\par\n\\par\n';
            content += '\\page\n'; // Page break between chapters
        });

        content += '}';
        return content;
    }

    async generateStandardManuscriptExport(book, chapters, export_purpose) {
        // Standard manuscript format for submissions
        let content = '';
        
        // Header with author info and word count
        content += `${book.author_name || 'Author Name'}\n`;
        content += `${book.title}\n`;
        content += `Approximately ${Math.round((book.actual_word_count || 0) / 250)} pages\n\n`;
        content += '='.repeat(60) + '\n\n';

        // Title page information
        content += `${book.title.toUpperCase()}\n\n`;
        if (book.subtitle) content += `${book.subtitle}\n\n`;
        content += `by\n\n${book.author_name || 'Author Name'}\n\n\n`;

        if (export_purpose === 'submission') {
            content += `Word Count: ${book.actual_word_count || 'TBD'}\n`;
            content += `Category: ${book.genre_names ? book.genre_names.join(', ') : 'Fiction'}\n\n`;
        }

        content += '\n' + '='.repeat(60) + '\n\n';

        // Chapters in standard manuscript format
        chapters.forEach((chapter, index) => {
            if (index > 0) content += '\n\n\n'; // Page break equivalent
            
            content += `${book.author_name || 'Author Name'} / ${book.title.toUpperCase()} / ${chapter.chapter_number}\n\n`;
            content += `Chapter ${chapter.chapter_number}`;
            if (chapter.title && export_purpose !== 'submission') {
                content += `: ${chapter.title}`;
            }
            content += '\n\n';

            content += '[Chapter content would be inserted here from actual chapter text]\n\n';
        });

        return content;
    }

    // Utility method to sanitize filenames
    sanitizeFilename(filename) {
        return filename
            .replace(/[^a-z0-9]/gi, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_|_$/g, '')
            .toLowerCase();
    }
}