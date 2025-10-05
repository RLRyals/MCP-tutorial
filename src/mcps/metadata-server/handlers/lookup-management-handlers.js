// src/mcps/plot-server/handlers/lookup-management-handlers.js
// Handlers for CRUD operations on lookup tables

export class LookupManagementHandlers {
    constructor(db) {
        this.db = db;

        // Map option types to their database table configuration
        this.lookupTableMap = {
            'genres': {
                table: 'genres',
                nameCol: 'genre_name',
                descCol: 'genre_description'
            },
            'plot_thread_types': {
                table: 'plot_thread_types',
                nameCol: 'type_name',
                descCol: 'type_description'
            },
            'plot_thread_statuses': {
                table: 'plot_thread_statuses',
                nameCol: 'status_name',
                descCol: 'status_description'
            },
            'relationship_types': {
                table: 'relationship_types',
                nameCol: 'type_name',
                descCol: 'type_description'
            },
            'story_concerns': {
                table: 'story_concerns',
                nameCol: 'concern_name',
                descCol: 'concern_description'
            },
            'story_outcomes': {
                table: 'story_outcomes',
                nameCol: 'outcome_name',
                descCol: 'outcome_description'
            },
            'story_judgments': {
                table: 'story_judgments',
                nameCol: 'judgment_name',
                descCol: 'judgment_description'
            }
        };
    }

    /**
     * Create a new lookup option
     */
    async handleCreateLookupOption(args) {
        try {
            const { option_type, name, description, is_active = true } = args;

            const lookupInfo = this.lookupTableMap[option_type];
            if (!lookupInfo) {
                throw new Error(`Unknown option type: ${option_type}`);
            }

            // Check if the option already exists
            const checkQuery = `
                SELECT id FROM ${lookupInfo.table}
                WHERE LOWER(${lookupInfo.nameCol}) = LOWER($1)
            `;
            const existing = await this.db.query(checkQuery, [name]);

            if (existing.rows.length > 0) {
                throw new Error(`A ${option_type.replace('_', ' ')} named "${name}" already exists`);
            }

            // Insert the new option
            const insertQuery = `
                INSERT INTO ${lookupInfo.table} (${lookupInfo.nameCol}, ${lookupInfo.descCol}, is_active)
                VALUES ($1, $2, $3)
                RETURNING id, ${lookupInfo.nameCol}, ${lookupInfo.descCol}, is_active
            `;

            const result = await this.db.query(insertQuery, [name, description, is_active]);
            const newOption = result.rows[0];

            return {
                content: [
                    {
                        type: 'text',
                        text: `✓ Created new ${option_type.replace('_', ' ')}\n\n` +
                              `**ID**: ${newOption.id}\n` +
                              `**Name**: ${newOption[lookupInfo.nameCol]}\n` +
                              `**Description**: ${newOption[lookupInfo.descCol]}\n` +
                              `**Active**: ${newOption.is_active ? 'Yes' : 'No'}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to create lookup option: ${error.message}`);
        }
    }

    /**
     * Update an existing lookup option
     */
    async handleUpdateLookupOption(args) {
        try {
            const { option_type, option_id, name, description, is_active } = args;

            const lookupInfo = this.lookupTableMap[option_type];
            if (!lookupInfo) {
                throw new Error(`Unknown option type: ${option_type}`);
            }

            // Build dynamic update query based on provided fields
            const updates = [];
            const values = [];
            let paramCount = 1;

            if (name !== undefined) {
                // Check if new name conflicts with existing
                const checkQuery = `
                    SELECT id FROM ${lookupInfo.table}
                    WHERE LOWER(${lookupInfo.nameCol}) = LOWER($1) AND id != $2
                `;
                const existing = await this.db.query(checkQuery, [name, option_id]);

                if (existing.rows.length > 0) {
                    throw new Error(`A ${option_type.replace('_', ' ')} named "${name}" already exists`);
                }

                updates.push(`${lookupInfo.nameCol} = $${paramCount}`);
                values.push(name);
                paramCount++;
            }

            if (description !== undefined) {
                updates.push(`${lookupInfo.descCol} = $${paramCount}`);
                values.push(description);
                paramCount++;
            }

            if (is_active !== undefined) {
                updates.push(`is_active = $${paramCount}`);
                values.push(is_active);
                paramCount++;
            }

            if (updates.length === 0) {
                throw new Error('No fields provided to update');
            }

            values.push(option_id);

            const updateQuery = `
                UPDATE ${lookupInfo.table}
                SET ${updates.join(', ')}
                WHERE id = $${paramCount}
                RETURNING id, ${lookupInfo.nameCol}, ${lookupInfo.descCol}, is_active
            `;

            const result = await this.db.query(updateQuery, values);

            if (result.rows.length === 0) {
                throw new Error(`${option_type.replace('_', ' ')} with ID ${option_id} not found`);
            }

            const updated = result.rows[0];

            return {
                content: [
                    {
                        type: 'text',
                        text: `✓ Updated ${option_type.replace('_', ' ')}\n\n` +
                              `**ID**: ${updated.id}\n` +
                              `**Name**: ${updated[lookupInfo.nameCol]}\n` +
                              `**Description**: ${updated[lookupInfo.descCol]}\n` +
                              `**Active**: ${updated.is_active ? 'Yes' : 'No'}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to update lookup option: ${error.message}`);
        }
    }

    /**
     * Delete (soft or hard) a lookup option
     */
    async handleDeleteLookupOption(args) {
        try {
            const { option_type, option_id, permanent = false } = args;

            const lookupInfo = this.lookupTableMap[option_type];
            if (!lookupInfo) {
                throw new Error(`Unknown option type: ${option_type}`);
            }

            if (permanent) {
                // Hard delete - check for dependencies first
                const deleteQuery = `
                    DELETE FROM ${lookupInfo.table}
                    WHERE id = $1
                    RETURNING ${lookupInfo.nameCol}
                `;

                const result = await this.db.query(deleteQuery, [option_id]);

                if (result.rows.length === 0) {
                    throw new Error(`${option_type.replace('_', ' ')} with ID ${option_id} not found`);
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: `✓ Permanently deleted ${option_type.replace('_', ' ')} "${result.rows[0][lookupInfo.nameCol]}"\n\n` +
                                  `⚠️  This is a permanent deletion. Any references to this option may cause issues.`
                        }
                    ]
                };
            } else {
                // Soft delete - just mark as inactive
                const updateQuery = `
                    UPDATE ${lookupInfo.table}
                    SET is_active = false
                    WHERE id = $1
                    RETURNING ${lookupInfo.nameCol}
                `;

                const result = await this.db.query(updateQuery, [option_id]);

                if (result.rows.length === 0) {
                    throw new Error(`${option_type.replace('_', ' ')} with ID ${option_id} not found`);
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: `✓ Deactivated ${option_type.replace('_', ' ')} "${result.rows[0][lookupInfo.nameCol]}"\n\n` +
                                  `This option is now hidden from available options but still exists in the database.`
                        }
                    ]
                };
            }
        } catch (error) {
            // Check if error is due to foreign key constraint
            if (error.message.includes('violates foreign key constraint')) {
                throw new Error(`Cannot delete this ${option_type.replace('_', ' ')} because it is in use. Use soft delete (permanent=false) instead.`);
            }
            throw new Error(`Failed to delete lookup option: ${error.message}`);
        }
    }

    /**
     * Assign genres to a book
     */
    async handleAssignBookGenres(args) {
        try {
            const { book_id, genre_ids } = args;

            // Validate that all genre IDs exist
            if (genre_ids.length > 0) {
                const checkQuery = `
                    SELECT id FROM genres WHERE id = ANY($1) AND is_active = true
                `;
                const validGenres = await this.db.query(checkQuery, [genre_ids]);

                if (validGenres.rows.length !== genre_ids.length) {
                    throw new Error(`One or more genre IDs are invalid or inactive`);
                }
            }

            // Begin transaction
            await this.db.query('BEGIN');

            try {
                // Remove existing genre assignments
                await this.db.query('DELETE FROM book_genres WHERE book_id = $1', [book_id]);

                // Insert new assignments
                if (genre_ids.length > 0) {
                    const insertValues = genre_ids.map((genre_id, idx) =>
                        `($1, $${idx + 2})`
                    ).join(', ');

                    const insertQuery = `
                        INSERT INTO book_genres (book_id, genre_id)
                        VALUES ${insertValues}
                    `;

                    await this.db.query(insertQuery, [book_id, ...genre_ids]);
                }

                // Get the updated genre list with names
                const resultQuery = `
                    SELECT g.id, g.genre_name
                    FROM book_genres bg
                    JOIN genres g ON bg.genre_id = g.id
                    WHERE bg.book_id = $1
                    ORDER BY g.genre_name
                `;
                const result = await this.db.query(resultQuery, [book_id]);

                await this.db.query('COMMIT');

                const genreList = result.rows.length > 0
                    ? result.rows.map(r => `- ${r.genre_name} (ID: ${r.id})`).join('\n')
                    : 'No genres assigned';

                return {
                    content: [
                        {
                            type: 'text',
                            text: `✓ Updated genres for book ID ${book_id}\n\n` +
                                  `**Assigned Genres**:\n${genreList}`
                        }
                    ]
                };
            } catch (error) {
                await this.db.query('ROLLBACK');
                throw error;
            }
        } catch (error) {
            throw new Error(`Failed to assign book genres: ${error.message}`);
        }
    }

    /**
     * Assign genres to a series
     */
    async handleAssignSeriesGenres(args) {
        try {
            const { series_id, genre_ids } = args;

            // Validate that all genre IDs exist
            if (genre_ids.length > 0) {
                const checkQuery = `
                    SELECT id FROM genres WHERE id = ANY($1) AND is_active = true
                `;
                const validGenres = await this.db.query(checkQuery, [genre_ids]);

                if (validGenres.rows.length !== genre_ids.length) {
                    throw new Error(`One or more genre IDs are invalid or inactive`);
                }
            }

            // Begin transaction
            await this.db.query('BEGIN');

            try {
                // Remove existing genre assignments
                await this.db.query('DELETE FROM series_genres WHERE series_id = $1', [series_id]);

                // Insert new assignments
                if (genre_ids.length > 0) {
                    const insertValues = genre_ids.map((genre_id, idx) =>
                        `($1, $${idx + 2})`
                    ).join(', ');

                    const insertQuery = `
                        INSERT INTO series_genres (series_id, genre_id)
                        VALUES ${insertValues}
                    `;

                    await this.db.query(insertQuery, [series_id, ...genre_ids]);
                }

                // Get the updated genre list with names
                const resultQuery = `
                    SELECT g.id, g.genre_name
                    FROM series_genres sg
                    JOIN genres g ON sg.genre_id = g.id
                    WHERE sg.series_id = $1
                    ORDER BY g.genre_name
                `;
                const result = await this.db.query(resultQuery, [series_id]);

                await this.db.query('COMMIT');

                const genreList = result.rows.length > 0
                    ? result.rows.map(r => `- ${r.genre_name} (ID: ${r.id})`).join('\n')
                    : 'No genres assigned';

                return {
                    content: [
                        {
                            type: 'text',
                            text: `✓ Updated genres for series ID ${series_id}\n\n` +
                                  `**Assigned Genres**:\n${genreList}`
                        }
                    ]
                };
            } catch (error) {
                await this.db.query('ROLLBACK');
                throw error;
            }
        } catch (error) {
            throw new Error(`Failed to assign series genres: ${error.message}`);
        }
    }
}
