// Session handlers for AI writing team to automatically track writing progress
export class SessionHandlers {
    constructor(db) {
        this.db = db;
    }

    // Tool definitions for AI writing team
    getSessionTools() {
        return [
            {
                name: 'log_writing_session',
                description: 'Log a writing session with productivity metrics - AI team tracks automatically',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { 
                            type: 'integer',
                            description: 'Book being worked on' 
                        },
                        chapter_ids: {
                            type: 'array',
                            items: { type: 'integer' },
                            description: 'Chapters worked on during session'
                        },
                        session_date: { 
                            type: 'string',
                            description: 'Date of writing session (YYYY-MM-DD)' 
                        },
                        start_time: { 
                            type: 'string',
                            description: 'Session start time (HH:MM)' 
                        },
                        end_time: { 
                            type: 'string',
                            description: 'Session end time (HH:MM)' 
                        },
                        words_written: { 
                            type: 'integer',
                            description: 'New words created during session' 
                        },
                        words_edited: { 
                            type: 'integer',
                            description: 'Existing words edited/revised',
                            default: 0 
                        },
                        session_notes: { 
                            type: 'string',
                            description: 'Optional notes about the session' 
                        },
                        mood_rating: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 10,
                            description: 'Author mood/energy level (1-10)'
                        }
                    },
                    required: ['book_id', 'session_date', 'words_written']
                }
            },
            {
                name: 'get_writing_progress',
                description: 'Get writing progress analytics - AI team monitors automatically',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { 
                            type: 'integer',
                            description: 'Book to analyze' 
                        },
                        time_period: {
                            type: 'string',
                            enum: ['week', 'month', 'quarter', 'all_time'],
                            default: 'month',
                            description: 'Time period for analysis'
                        },
                        include_analytics: {
                            type: 'boolean',
                            default: true,
                            description: 'Include detailed productivity analytics'
                        }
                    },
                    required: ['book_id']
                }
            },
            {
                name: 'set_writing_goals',
                description: 'Set writing goals for AI team to track progress against',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { 
                            type: 'integer',
                            description: 'Book for goal setting' 
                        },
                        goal_type: {
                            type: 'string',
                            enum: ['daily_words', 'weekly_words', 'monthly_words', 'chapter_completion', 'book_completion'],
                            description: 'Type of writing goal'
                        },
                        target_value: { 
                            type: 'integer',
                            description: 'Target number (words, chapters, etc.)' 
                        },
                        target_date: { 
                            type: 'string',
                            description: 'Goal completion date (YYYY-MM-DD)' 
                        },
                        description: { 
                            type: 'string',
                            description: 'Goal description or motivation' 
                        }
                    },
                    required: ['book_id', 'goal_type', 'target_value', 'target_date']
                }
            },
            {
                name: 'get_productivity_analytics',
                description: 'Get detailed productivity analytics - AI team analyzes patterns',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { 
                            type: 'integer',
                            description: 'Book to analyze' 
                        },
                        analysis_type: {
                            type: 'string',
                            enum: ['daily_patterns', 'weekly_trends', 'goal_progress', 'productivity_factors'],
                            default: 'daily_patterns',
                            description: 'Type of analysis to perform'
                        },
                        date_range: {
                            type: 'object',
                            properties: {
                                start_date: { type: 'string' },
                                end_date: { type: 'string' }
                            },
                            description: 'Optional date range for analysis'
                        }
                    },
                    required: ['book_id']
                }
            }
        ];
    }

    // AI team logs writing sessions automatically
    async handleLogWritingSession(args) {
        const { book_id, chapter_ids = [], session_date, start_time, end_time, 
                words_written, words_edited = 0, session_notes, mood_rating } = args;

        try {
            // Calculate session duration if times provided
            let duration_minutes = null;
            if (start_time && end_time) {
                const start = new Date(`2000-01-01 ${start_time}`);
                const end = new Date(`2000-01-01 ${end_time}`);
                duration_minutes = Math.round((end - start) / (1000 * 60));
            }

            // Insert writing session record
            const result = await this.db.query(`
                INSERT INTO writing_sessions (
                    book_id, session_date, start_time, end_time, duration_minutes,
                    words_written, words_edited, net_words, session_notes, mood_rating
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id, session_date, words_written, net_words
            `, [
                book_id, session_date, start_time, end_time, duration_minutes,
                words_written, words_edited, words_written - words_edited,
                session_notes, mood_rating
            ]);

            // Link chapters worked on during session
            if (chapter_ids.length > 0) {
                const session_id = result.rows[0].id;
                for (const chapter_id of chapter_ids) {
                    await this.db.query(`
                        INSERT INTO session_chapters (session_id, chapter_id)
                        VALUES ($1, $2)
                        ON CONFLICT (session_id, chapter_id) DO NOTHING
                    `, [session_id, chapter_id]);
                }
            }

            // Update book word count automatically (AI team maintenance)
            if (words_written > 0) {
                await this.db.query(`
                    UPDATE books 
                    SET actual_word_count = actual_word_count + $1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2
                `, [words_written, book_id]);
            }

            return {
                success: true,
                session_logged: result.rows[0],
                chapters_linked: chapter_ids.length,
                message: 'Writing session tracked by AI team'
            };

        } catch (error) {
            console.error('Error logging writing session:', error);
            throw new Error(`Failed to log session: ${error.message}`);
        }
    }

    // AI team gets progress reports automatically
    async handleGetWritingProgress(args) {
        const { book_id, time_period = 'month', include_analytics = true } = args;

        try {
            // Calculate date range based on time period
            let date_filter = '';
            const now = new Date();
            
            switch (time_period) {
                case 'week':
                    const week_ago = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                    date_filter = `AND session_date >= '${week_ago.toISOString().split('T')[0]}'`;
                    break;
                case 'month':
                    const month_ago = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                    date_filter = `AND session_date >= '${month_ago.toISOString().split('T')[0]}'`;
                    break;
                case 'quarter':
                    const quarter_ago = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
                    date_filter = `AND session_date >= '${quarter_ago.toISOString().split('T')[0]}'`;
                    break;
            }

            // Get session summary
            const summary = await this.db.query(`
                SELECT 
                    COUNT(*) as total_sessions,
                    SUM(words_written) as total_words_written,
                    SUM(words_edited) as total_words_edited,
                    SUM(net_words) as net_word_change,
                    AVG(words_written) as avg_words_per_session,
                    AVG(duration_minutes) as avg_session_duration,
                    AVG(mood_rating) as avg_mood
                FROM writing_sessions 
                WHERE book_id = $1 ${date_filter}
            `, [book_id]);

            // Get book current status
            const book = await this.db.query(`
                SELECT title, actual_word_count, target_word_count,
                       CASE 
                           WHEN target_word_count > 0 
                           THEN ROUND((actual_word_count::numeric / target_word_count) * 100, 2)
                           ELSE NULL 
                       END as completion_percentage
                FROM books WHERE id = $1
            `, [book_id]);

            const progress_data = {
                book_title: book.rows[0]?.title,
                time_period,
                session_summary: summary.rows[0],
                book_status: book.rows[0],
                analysis_date: new Date().toISOString()
            };

            // Add detailed analytics if requested
            if (include_analytics) {
                // Daily writing patterns
                const daily_patterns = await this.db.query(`
                    SELECT 
                        session_date,
                        SUM(words_written) as daily_words,
                        COUNT(*) as daily_sessions,
                        AVG(mood_rating) as avg_mood
                    FROM writing_sessions 
                    WHERE book_id = $1 ${date_filter}
                    GROUP BY session_date
                    ORDER BY session_date DESC
                    LIMIT 30
                `, [book_id]);

                progress_data.daily_patterns = daily_patterns.rows;
            }

            return progress_data;

        } catch (error) {
            console.error('Error getting writing progress:', error);
            throw new Error(`Failed to get progress: ${error.message}`);
        }
    }

    // AI team manages goal setting and tracking
    async handleSetWritingGoals(args) {
        // Parse and convert inputs to ensure consistent types
        const book_id = parseInt(args.book_id, 10);
        const goal_type = String(args.goal_type);
        const target_value = parseInt(args.target_value, 10);
        const target_date = String(args.target_date);
        const description = args.description ? String(args.description) : null;

        try {
            console.log('Preparing to set writing goal:', {
                book_id, goal_type, target_value, target_date, description,
                types: {
                    book_id: typeof book_id,
                    goal_type: typeof goal_type,
                    target_value: typeof target_value,
                    target_date: typeof target_date,
                    description: typeof description
                }
            });
            
            // Use separate queries with explicit parameters to avoid type inference issues
            // First, deactivate any existing goals of the same type and date
            await this.db.query(
                'UPDATE writing_goals SET active = false, updated_at = CURRENT_TIMESTAMP ' +
                'WHERE book_id = $1 AND goal_type = $2 AND target_date = $3 AND active = true',
                [book_id, goal_type, target_date]
            );
            
            // Then insert new active goal with simplified query
            const result = await this.db.query(
                'INSERT INTO writing_goals ' +
                '(book_id, goal_type, target_value, target_date, description, start_date, current_progress, active) ' +
                'VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, 0, true) ' +
                'RETURNING id, goal_type, target_value, target_date',
                [book_id, goal_type, target_value, target_date, description]
            );

            // Calculate current progress for goal type
            let current_progress = 0;
            if (goal_type.includes('words')) {
                const progress_query = await this.db.query(
                    'SELECT COALESCE(SUM(words_written), 0) as progress ' +
                    'FROM writing_sessions ' +
                    'WHERE book_id = $1 AND session_date >= CURRENT_DATE - INTERVAL \'30 days\'',
                    [book_id]
                );
                current_progress = parseInt(progress_query.rows[0].progress, 10) || 0;
            }

            // Get the inserted row ID
            const goal_id = result.rows[0].id;
            console.log('Goal created successfully with ID:', goal_id);

            // Update progress with separate query - but handle errors separately
            try {
                await this.db.query(
                    'UPDATE writing_goals SET current_progress = $1 WHERE id = $2',
                    [current_progress, goal_id]
                );
                
                // Update completion percentage in a separate query to avoid type issues
                await this.db.query(
                    'UPDATE writing_goals SET completion_percentage = ROUND((current_progress::numeric / target_value) * 100, 2) WHERE id = $1',
                    [goal_id]
                );
            } catch (progressError) {
                console.warn('Non-critical error updating progress for goal:', progressError.message);
                // Continue despite progress update error - the goal was created successfully
            }

            return {
                success: true,
                goal_set: result.rows[0],
                current_progress,
                message: 'Goal set and being tracked by AI team'
            };

        } catch (error) {
            // If we have a goal ID, the primary goal creation succeeded
            if (result && result.rows && result.rows[0] && result.rows[0].id) {
                console.warn('Goal was created but encountered a non-critical error:', error.message);
                
                // Return success with warning since the goal was actually created
                return {
                    success: true,
                    goal_set: result.rows[0],
                    current_progress,
                    message: 'Goal created successfully (with minor issues)',
                    warning: error.message
                };
            } else {
                // This is a critical error before goal creation
                console.error('Critical error setting writing goal:', error);
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    detail: error.detail,
                    stack: error.stack
                });
                throw new Error(`Failed to set goal: ${error.message}`);
            }
        }
    }

    // AI team analyzes productivity patterns automatically
    async handleGetProductivityAnalytics(args) {
        const { book_id, analysis_type = 'daily_patterns', date_range } = args;

        try {
            let analytics_data = {
                book_id,
                analysis_type,
                generated_at: new Date().toISOString()
            };

            // Date range filter
            let date_filter = '';
            if (date_range) {
                date_filter = `AND session_date BETWEEN '${date_range.start_date}' AND '${date_range.end_date}'`;
            } else {
                // Default to last 90 days
                date_filter = `AND session_date >= CURRENT_DATE - INTERVAL '90 days'`;
            }

            switch (analysis_type) {
                case 'daily_patterns':
                    const daily_data = await this.db.query(`
                        SELECT 
                            EXTRACT(DOW FROM session_date) as day_of_week,
                            AVG(words_written) as avg_words,
                            COUNT(*) as session_count,
                            AVG(duration_minutes) as avg_duration,
                            AVG(mood_rating) as avg_mood
                        FROM writing_sessions 
                        WHERE book_id = $1 ${date_filter}
                        GROUP BY EXTRACT(DOW FROM session_date)
                        ORDER BY day_of_week
                    `, [book_id]);

                    analytics_data.daily_patterns = daily_data.rows.map(row => ({
                        day_name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][row.day_of_week],
                        ...row
                    }));
                    break;

                case 'weekly_trends':
                    const weekly_data = await this.db.query(`
                        SELECT 
                            DATE_TRUNC('week', session_date) as week_start,
                            SUM(words_written) as weekly_words,
                            COUNT(*) as weekly_sessions,
                            AVG(mood_rating) as avg_mood
                        FROM writing_sessions 
                        WHERE book_id = $1 ${date_filter}
                        GROUP BY DATE_TRUNC('week', session_date)
                        ORDER BY week_start DESC
                        LIMIT 12
                    `, [book_id]);

                    analytics_data.weekly_trends = weekly_data.rows;
                    break;

                case 'goal_progress':
                    const goals_data = await this.db.query(`
                        SELECT 
                            goal_type, target_value, current_progress,
                            completion_percentage, target_date,
                            (target_date < CURRENT_DATE AND NOT completed) as overdue
                        FROM writing_goals 
                        WHERE book_id = $1 AND active = true
                        ORDER BY target_date
                    `, [book_id]);

                    analytics_data.goal_progress = goals_data.rows;
                    break;

                case 'productivity_factors':
                    // Analyze correlation between mood, time, and productivity
                    const factors_data = await this.db.query(`
                        SELECT 
                            mood_rating,
                            AVG(words_written) as avg_words_at_mood,
                            COUNT(*) as sessions_at_mood,
                            EXTRACT(HOUR FROM start_time) as session_hour,
                            AVG(words_written) as avg_words_at_hour
                        FROM writing_sessions 
                        WHERE book_id = $1 ${date_filter}
                          AND mood_rating IS NOT NULL 
                          AND start_time IS NOT NULL
                        GROUP BY CUBE(mood_rating, EXTRACT(HOUR FROM start_time))
                        ORDER BY mood_rating, session_hour
                    `, [book_id]);

                    analytics_data.productivity_factors = factors_data.rows;
                    break;
            }

            return analytics_data;

        } catch (error) {
            console.error('Error getting productivity analytics:', error);
            throw new Error(`Failed to analyze productivity: ${error.message}`);
        }
    }
}