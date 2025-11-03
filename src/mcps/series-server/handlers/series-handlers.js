// src/mcps/series-server/handlers/series-handlers.js
// Core Series Management Handler - CRUD operations for book series
// Designed for AI Writing Teams to manage series information

import { seriesToolsSchema } from '../schemas/series-tools-schema.js';

export class SeriesHandlers {
    constructor(db) {
        this.db = db;
    }

    // =============================================
    // SERIES TOOL DEFINITIONS
    // =============================================
    getSeriesTools() {
        return seriesToolsSchema;
    }

    // =============================================
    // SERIES MANAGEMENT HANDLERS
    // =============================================

    async handleListSeries(args) {
        try {
            // Use the series_with_genres view that includes genres from junction table
            const queryPromise = this.db.query(`
                SELECT * FROM series_with_genres
                ORDER BY title
            `);

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database query timed out after 10 seconds')), 10000)
            );

            const result = await Promise.race([queryPromise, timeoutPromise]);

            // Get author names
            const seriesWithAuthors = await Promise.all(result.rows.map(async (series) => {
                const authorResult = await this.db.query('SELECT name FROM authors WHERE id = $1', [series.author_id]);
                return {
                    ...series,
                    author_name: authorResult.rows[0]?.name || 'Unknown'
                };
            }));

            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${seriesWithAuthors.length} series:\n\n` +
                              seriesWithAuthors.map(series =>
                                  `ID: ${series.id}\n` +
                                  `Title: ${series.title}\n` +
                                  `Author: ${series.author_name}\n` +
                                  `Genres: ${series.genre_names?.length > 0 ? series.genre_names.join(', ') : 'None'}\n` +
                                  `Status: ${series.status || 'Unknown'}\n` +
                                  `Start Year: ${series.start_year || 'Unknown'}\n` +
                                  `Description: ${series.description || 'No description available'}\n`
                              ).join('\n---\n\n')
                    }
                ]
            };
        } catch (error) {
            console.error('[SERIES-HANDLERS] handleListSeries error:', error);
            throw new Error(`Failed to list series: ${error.message}`);
        }
    }

    async handleGetSeries(args) {
        try {
            const { series_id } = args;

            // Use the series_with_genres view
            const queryPromise = this.db.query(`
                SELECT * FROM series_with_genres
                WHERE id = $1
            `, [series_id]);

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database query timed out after 10 seconds')), 10000)
            );

            const result = await Promise.race([queryPromise, timeoutPromise]);

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No series found with ID: ${series_id}`
                        }
                    ]
                };
            }

            const series = result.rows[0];

            // Get author name
            const authorResult = await this.db.query('SELECT name FROM authors WHERE id = $1', [series.author_id]);
            const authorName = authorResult.rows[0]?.name || 'Unknown';

            return {
                content: [
                    {
                        type: 'text',
                        text: `Series Details:\n\n` +
                              `ID: ${series.id}\n` +
                              `Title: ${series.title}\n` +
                              `Author: ${authorName}\n` +
                              `Genres: ${series.genre_names?.length > 0 ? series.genre_names.join(', ') : 'None'}\n` +
                              `Status: ${series.status || 'Unknown'}\n` +
                              `Start Year: ${series.start_year || 'Unknown'}\n` +
                              `Description: ${series.description || 'No description available'}\n`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get series: ${error.message}`);
        }
    }

    async handleCreateSeries(args) {
        try {
            const { title, author_id, description, genre_ids, start_year, status } = args;

            // Create the series
            const queryPromise = this.db.query(`
                INSERT INTO series (title, author_id, description, start_year, status)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [title, author_id, description, start_year, status]);

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database query timed out after 10 seconds')), 10000)
            );

            const result = await Promise.race([queryPromise, timeoutPromise]);
            const series = result.rows[0];

            // Insert genre associations if provided
            if (genre_ids && genre_ids.length > 0) {
                for (const genre_id of genre_ids) {
                    await this.db.query(`
                        INSERT INTO series_genres (series_id, genre_id)
                        VALUES ($1, $2)
                        ON CONFLICT (series_id, genre_id) DO NOTHING
                    `, [series.id, genre_id]);
                }
            }

            // Get author name and genres for display
            const authorQuery = 'SELECT name FROM authors WHERE id = $1';
            const authorResult = await this.db.query(authorQuery, [author_id]);
            const authorName = authorResult.rows[0]?.name || 'Unknown';

            let genreNames = [];
            if (genre_ids && genre_ids.length > 0) {
                const genreResult = await this.db.query(`
                    SELECT genre_name FROM genres WHERE id = ANY($1)
                    ORDER BY genre_name
                `, [genre_ids]);
                genreNames = genreResult.rows.map(row => row.genre_name);
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `Created series successfully!\n\n` +
                              `ID: ${series.id}\n` +
                              `Title: ${series.title}\n` +
                              `Author: ${authorName}\n` +
                              `Genres: ${genreNames.length > 0 ? genreNames.join(', ') : 'None'}\n` +
                              `Status: ${series.status || 'Not specified'}\n` +
                              `Start Year: ${series.start_year || 'Not specified'}\n` +
                              `Description: ${series.description || 'No description provided'}`
                    }
                ]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Invalid author_id or genre_id: Author or Genre not found');
            }
            throw new Error(`Failed to create series: ${error.message}`);
        }
    }

    async handleUpdateSeries(args) {
        try {
            const { series_id, title, description, genre_ids, start_year, status } = args;

            // Build dynamic update query for series table
            const updates = [];
            const values = [];
            let paramCount = 1;

            if (title !== undefined) {
                updates.push(`title = $${paramCount++}`);
                values.push(title);
            }
            if (description !== undefined) {
                updates.push(`description = $${paramCount++}`);
                values.push(description);
            }
            if (start_year !== undefined) {
                updates.push(`start_year = $${paramCount++}`);
                values.push(start_year);
            }
            if (status !== undefined) {
                updates.push(`status = $${paramCount++}`);
                values.push(status);
            }

            // Update series table if there are fields to update
            if (updates.length > 0) {
                updates.push(`updated_at = CURRENT_TIMESTAMP`);
                values.push(series_id);

                const query = `
                    UPDATE series
                    SET ${updates.join(', ')}
                    WHERE id = $${paramCount}
                    RETURNING *
                `;

                const result = await this.db.query(query, values);

                if (result.rows.length === 0) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `No series found with ID: ${series_id}`
                            }
                        ]
                    };
                }
            }

            // Handle genre updates if provided
            if (genre_ids !== undefined) {
                // Delete existing genre associations
                await this.db.query('DELETE FROM series_genres WHERE series_id = $1', [series_id]);

                // Insert new genre associations
                if (genre_ids.length > 0) {
                    for (const genre_id of genre_ids) {
                        await this.db.query(`
                            INSERT INTO series_genres (series_id, genre_id)
                            VALUES ($1, $2)
                            ON CONFLICT (series_id, genre_id) DO NOTHING
                        `, [series_id, genre_id]);
                    }
                }
            }

            // Fetch updated series with genres
            const seriesResult = await this.db.query('SELECT * FROM series_with_genres WHERE id = $1', [series_id]);
            const series = seriesResult.rows[0];

            // Get author name for display
            const authorQuery = 'SELECT name FROM authors WHERE id = $1';
            const authorResult = await this.db.query(authorQuery, [series.author_id]);
            const authorName = authorResult.rows[0]?.name || 'Unknown';

            return {
                content: [
                    {
                        type: 'text',
                        text: `Updated series successfully!\n\n` +
                              `ID: ${series.id}\n` +
                              `Title: ${series.title}\n` +
                              `Author: ${authorName}\n` +
                              `Genres: ${series.genre_names?.length > 0 ? series.genre_names.join(', ') : 'None'}\n` +
                              `Status: ${series.status || 'Not specified'}\n` +
                              `Start Year: ${series.start_year || 'Not specified'}\n` +
                              `Description: ${series.description || 'No description available'}\n`
                    }
                ]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Invalid genre_id: Genre not found');
            }
            throw new Error(`Failed to update series: ${error.message}`);
        }
    }
}
