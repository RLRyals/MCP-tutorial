// src/config-mcps/reporting-server/handlers/reporting-handlers.js
// Reporting Handler - Generate comprehensive reports using existing MCP tools

import { SeriesHandlers } from '../../../mcps/series-server/handlers/series-handlers.js';
import { BookHandlers } from '../../../mcps/book-server/handlers/book-handlers.js';
import { CharacterHandlers } from '../../../mcps/character-server/handlers/character-handlers.js';
import { LocationHandlers } from '../../../mcps/world-server/handlers/location-handlers.js';
import { OrganizationHandlers } from '../../../mcps/world-server/handlers/organization-handlers.js';
import { PlotThreadHandlers } from '../../../mcps/plot-server/handlers/plot-thread-handlers.js';
import { WorldElementHandlers } from '../../../mcps/world-server/handlers/world-element-handlers.js';
import { TimelineEventHandlers } from '../../../mcps/timeline-server/handlers/timeline-event-handlers.js';
import { RelationshipHandlers } from '../../../mcps/relationship-server/handlers/relationship-handlers.js';
import { reportingToolsSchema } from '../schemas/reporting-tools-schema.js';

export class ReportingHandlers {
    constructor(db) {
        this.db = db;

        // Initialize all handler instances
        this.seriesHandlers = new SeriesHandlers(db);
        this.bookHandlers = new BookHandlers(db);
        this.characterHandlers = new CharacterHandlers(db);
        this.locationHandlers = new LocationHandlers(db);
        this.organizationHandlers = new OrganizationHandlers(db);
        this.plotThreadHandlers = new PlotThreadHandlers(db);
        this.worldElementHandlers = new WorldElementHandlers(db);
        this.timelineEventHandlers = new TimelineEventHandlers(db);
        this.relationshipHandlers = new RelationshipHandlers(db);
    }

    getReportingTools() {
        return reportingToolsSchema;
    }

    async handleGenerateReport(args) {
        try {
            const { series_id, book_id, series_name, book_name, include_sections } = args;

            let targetSeriesId = null;
            let targetBookId = null;
            let reportType = null;

            // Resolve input to series_id or book_id
            if (series_id) {
                targetSeriesId = series_id;
                reportType = 'series';
            } else if (book_id) {
                targetBookId = book_id;
                reportType = 'book';
            } else if (series_name) {
                // Find series by name
                const seriesQuery = `
                    SELECT id FROM series
                    WHERE LOWER(title) LIKE LOWER($1)
                `;
                const result = await this.db.query(seriesQuery, [`%${series_name}%`]);

                if (result.rows.length === 0) {
                    return {
                        content: [{
                            type: 'text',
                            text: `No series found matching name: "${series_name}"`
                        }]
                    };
                }

                if (result.rows.length > 1) {
                    const seriesList = result.rows.map((s, idx) => `${idx + 1}. Series ID: ${s.id}`).join('\n');
                    return {
                        content: [{
                            type: 'text',
                            text: `Multiple series found matching "${series_name}":\n\n${seriesList}\n\nPlease specify series_id instead.`
                        }]
                    };
                }

                targetSeriesId = result.rows[0].id;
                reportType = 'series';
            } else if (book_name) {
                // Find book by name
                const bookQuery = `
                    SELECT id, series_id FROM books
                    WHERE LOWER(title) LIKE LOWER($1)
                `;
                const result = await this.db.query(bookQuery, [`%${book_name}%`]);

                if (result.rows.length === 0) {
                    return {
                        content: [{
                            type: 'text',
                            text: `No book found matching name: "${book_name}"`
                        }]
                    };
                }

                if (result.rows.length > 1) {
                    const bookList = result.rows.map((b, idx) => `${idx + 1}. Book ID: ${b.id}`).join('\n');
                    return {
                        content: [{
                            type: 'text',
                            text: `Multiple books found matching "${book_name}":\n\n${bookList}\n\nPlease specify book_id instead.`
                        }]
                    };
                }

                targetBookId = result.rows[0].id;
                targetSeriesId = result.rows[0].series_id;
                reportType = 'book';
            }

            // Determine which sections to include
            const allSections = [
                'series_info',
                'books',
                'characters',
                'locations',
                'organizations',
                'plot_threads',
                'world_elements',
                'timeline_events',
                'relationship_arcs'
            ];

            const sectionsToInclude = include_sections || allSections;

            // Generate report
            let report = '';
            report += '═'.repeat(80) + '\n';
            report += reportType === 'series' ? 'SERIES REPORT\n' : 'BOOK REPORT\n';
            report += '═'.repeat(80) + '\n\n';

            // Series Info
            if (sectionsToInclude.includes('series_info') && targetSeriesId) {
                report += await this.generateSeriesSection(targetSeriesId);
            }

            // Books (only for series reports)
            if (sectionsToInclude.includes('books') && reportType === 'series') {
                report += await this.generateBooksSection(targetSeriesId);
            }

            // Characters
            if (sectionsToInclude.includes('characters')) {
                report += await this.generateCharactersSection(targetSeriesId, targetBookId);
            }

            // Locations
            if (sectionsToInclude.includes('locations')) {
                report += await this.generateLocationsSection(targetSeriesId, targetBookId);
            }

            // Organizations
            if (sectionsToInclude.includes('organizations')) {
                report += await this.generateOrganizationsSection(targetSeriesId, targetBookId);
            }

            // Plot Threads
            if (sectionsToInclude.includes('plot_threads')) {
                report += await this.generatePlotThreadsSection(targetSeriesId, targetBookId);
            }

            // World Elements
            if (sectionsToInclude.includes('world_elements')) {
                report += await this.generateWorldElementsSection(targetSeriesId, targetBookId);
            }

            // Timeline Events
            if (sectionsToInclude.includes('timeline_events')) {
                report += await this.generateTimelineEventsSection(targetSeriesId, targetBookId);
            }

            // Relationship Arcs
            if (sectionsToInclude.includes('relationship_arcs')) {
                report += await this.generateRelationshipArcsSection(targetSeriesId, targetBookId);
            }

            report += '═'.repeat(80) + '\n';
            report += 'END OF REPORT\n';
            report += '═'.repeat(80) + '\n';

            return {
                content: [{
                    type: 'text',
                    text: report
                }]
            };
        } catch (error) {
            console.error('[REPORTING-HANDLERS] Error generating report:', error);
            throw new Error(`Failed to generate report: ${error.message}`);
        }
    }

    // =============================================
    // SECTION GENERATORS
    // =============================================

    async generateSeriesSection(seriesId) {
        const query = `
            SELECT s.*, swg.genre_names, a.name as author_name
            FROM series s
            LEFT JOIN series_with_genres swg ON s.id = swg.id
            LEFT JOIN authors a ON s.author_id = a.id
            WHERE s.id = $1
        `;
        const result = await this.db.query(query, [seriesId]);

        if (result.rows.length === 0) {
            return `[Series not found]\n\n`;
        }

        const series = result.rows[0];

        let section = '─'.repeat(80) + '\n';
        section += 'SERIES INFORMATION\n';
        section += '─'.repeat(80) + '\n';
        section += `Series ID: ${series.id}\n`;
        section += `Title: ${series.title}\n`;
        section += `Author: ${series.author_name || 'Unknown'}\n`;
        section += `Genres: ${series.genre_names?.join(', ') || 'None'}\n`;
        section += `Status: ${series.status || 'Unknown'}\n`;
        section += `Start Year: ${series.start_year || 'Unknown'}\n`;
        section += `Description: ${series.description || 'No description'}\n\n`;

        return section;
    }

    async generateBooksSection(seriesId) {
        const query = `
            SELECT b.*, bwg.genre_names,
                   (SELECT COUNT(*) FROM chapters WHERE book_id = b.id) as chapter_count
            FROM books b
            LEFT JOIN books_with_genres bwg ON b.id = bwg.id
            WHERE b.series_id = $1
            ORDER BY b.book_number
        `;
        const result = await this.db.query(query, [seriesId]);

        let section = '─'.repeat(80) + '\n';
        section += `BOOKS (${result.rows.length})\n`;
        section += '─'.repeat(80) + '\n';

        if (result.rows.length === 0) {
            section += 'No books found.\n\n';
            return section;
        }

        result.rows.forEach((book, idx) => {
            section += `${idx + 1}. [ID: ${book.id}] ${book.title} (Book #${book.book_number})\n`;
            section += `   Status: ${book.status}\n`;
            section += `   Chapters: ${book.chapter_count}\n`;
            section += `   Word Count: ${book.actual_word_count || 0} / ${book.target_word_count || 'N/A'}\n`;
            if (book.genre_names && book.genre_names.length > 0) {
                section += `   Genres: ${book.genre_names.join(', ')}\n`;
            }
            section += '\n';
        });

        return section;
    }

    async generateCharactersSection(seriesId, bookId) {
        const conditions = [];
        const params = [];

        if (bookId) {
            conditions.push('(c.series_id = $1 OR c.book_id = $2)');
            params.push(seriesId, bookId);
        } else {
            conditions.push('c.series_id = $1');
            params.push(seriesId);
        }

        const query = `
            SELECT c.id, c.name, c.role, c.description, c.book_id, b.title as book_title
            FROM characters c
            LEFT JOIN books b ON c.book_id = b.id
            WHERE ${conditions.join(' AND ')}
            ORDER BY c.role, c.name
        `;
        const result = await this.db.query(query, params);

        let section = '─'.repeat(80) + '\n';
        section += `CHARACTERS (${result.rows.length})\n`;
        section += '─'.repeat(80) + '\n';

        if (result.rows.length === 0) {
            section += 'No characters found.\n\n';
            return section;
        }

        result.rows.forEach((char, idx) => {
            section += `${idx + 1}. [ID: ${char.id}] ${char.name}`;
            if (char.role) {
                section += ` (${char.role})`;
            }
            section += '\n';
            if (char.book_title) {
                section += `   Scope: Book - ${char.book_title}\n`;
            } else {
                section += `   Scope: Series-wide\n`;
            }
            if (char.description) {
                section += `   Description: ${char.description}\n`;
            }
            section += '\n';
        });

        return section;
    }

    async generateLocationsSection(seriesId, bookId) {
        const conditions = [];
        const params = [];

        if (bookId) {
            conditions.push('(l.series_id = $1 OR l.book_id = $2)');
            params.push(seriesId, bookId);
        } else {
            conditions.push('l.series_id = $1');
            params.push(seriesId);
        }

        const query = `
            SELECT l.id, l.name, l.location_type, l.description, l.book_id, b.title as book_title
            FROM locations l
            LEFT JOIN books b ON l.book_id = b.id
            WHERE ${conditions.join(' AND ')}
            ORDER BY l.location_type, l.name
        `;
        const result = await this.db.query(query, params);

        let section = '─'.repeat(80) + '\n';
        section += `LOCATIONS (${result.rows.length})\n`;
        section += '─'.repeat(80) + '\n';

        if (result.rows.length === 0) {
            section += 'No locations found.\n\n';
            return section;
        }

        result.rows.forEach((loc, idx) => {
            section += `${idx + 1}. [ID: ${loc.id}] ${loc.name}`;
            if (loc.location_type) {
                section += ` (${loc.location_type})`;
            }
            section += '\n';
            if (loc.book_title) {
                section += `   Scope: Book - ${loc.book_title}\n`;
            } else {
                section += `   Scope: Series-wide\n`;
            }
            if (loc.description) {
                section += `   Description: ${loc.description}\n`;
            }
            section += '\n';
        });

        return section;
    }

    async generateOrganizationsSection(seriesId, bookId) {
        const conditions = [];
        const params = [];

        if (bookId) {
            conditions.push('(o.series_id = $1 OR o.book_id = $2)');
            params.push(seriesId, bookId);
        } else {
            conditions.push('o.series_id = $1');
            params.push(seriesId);
        }

        const query = `
            SELECT o.id, o.name, o.org_type, o.description, o.book_id, b.title as book_title
            FROM organizations o
            LEFT JOIN books b ON o.book_id = b.id
            WHERE ${conditions.join(' AND ')}
            ORDER BY o.org_type, o.name
        `;
        const result = await this.db.query(query, params);

        let section = '─'.repeat(80) + '\n';
        section += `ORGANIZATIONS (${result.rows.length})\n`;
        section += '─'.repeat(80) + '\n';

        if (result.rows.length === 0) {
            section += 'No organizations found.\n\n';
            return section;
        }

        result.rows.forEach((org, idx) => {
            section += `${idx + 1}. [ID: ${org.id}] ${org.name}`;
            if (org.org_type) {
                section += ` (${org.org_type})`;
            }
            section += '\n';
            if (org.book_title) {
                section += `   Scope: Book - ${org.book_title}\n`;
            } else {
                section += `   Scope: Series-wide\n`;
            }
            if (org.description) {
                section += `   Description: ${org.description}\n`;
            }
            section += '\n';
        });

        return section;
    }

    async generatePlotThreadsSection(seriesId, bookId) {
        const conditions = [];
        const params = [];

        if (bookId) {
            conditions.push('(pt.series_id = $1 OR pt.book_id = $2)');
            params.push(seriesId, bookId);
        } else {
            conditions.push('pt.series_id = $1');
            params.push(seriesId);
        }

        const query = `
            SELECT pt.id, pt.title, pt.plot_type, pt.status, pt.description,
                   pt.book_id, b.title as book_title, ptt.type_name
            FROM plot_threads pt
            LEFT JOIN books b ON pt.book_id = b.id
            LEFT JOIN plot_thread_types ptt ON pt.plot_type = ptt.id
            WHERE ${conditions.join(' AND ')}
            ORDER BY pt.plot_type, pt.title
        `;
        const result = await this.db.query(query, params);

        let section = '─'.repeat(80) + '\n';
        section += `PLOT THREADS (${result.rows.length})\n`;
        section += '─'.repeat(80) + '\n';

        if (result.rows.length === 0) {
            section += 'No plot threads found.\n\n';
            return section;
        }

        result.rows.forEach((thread, idx) => {
            section += `${idx + 1}. [ID: ${thread.id}] ${thread.title}`;
            if (thread.type_name) {
                section += ` (${thread.type_name})`;
            }
            section += '\n';
            section += `   Status: ${thread.status || 'Unknown'}\n`;
            if (thread.book_title) {
                section += `   Scope: Book - ${thread.book_title}\n`;
            } else {
                section += `   Scope: Series-wide\n`;
            }
            if (thread.description) {
                section += `   Description: ${thread.description}\n`;
            }
            section += '\n';
        });

        return section;
    }

    async generateWorldElementsSection(seriesId, bookId) {
        const conditions = [];
        const params = [];

        if (bookId) {
            conditions.push('(we.series_id = $1 OR we.book_id = $2)');
            params.push(seriesId, bookId);
        } else {
            conditions.push('we.series_id = $1');
            params.push(seriesId);
        }

        const query = `
            SELECT we.id, we.name, we.element_type, we.description, we.book_id, b.title as book_title
            FROM world_elements we
            LEFT JOIN books b ON we.book_id = b.id
            WHERE ${conditions.join(' AND ')}
            ORDER BY we.element_type, we.name
        `;
        const result = await this.db.query(query, params);

        let section = '─'.repeat(80) + '\n';
        section += `WORLD ELEMENTS (${result.rows.length})\n`;
        section += '─'.repeat(80) + '\n';

        if (result.rows.length === 0) {
            section += 'No world elements found.\n\n';
            return section;
        }

        result.rows.forEach((elem, idx) => {
            section += `${idx + 1}. [ID: ${elem.id}] ${elem.name}`;
            if (elem.element_type) {
                section += ` (${elem.element_type})`;
            }
            section += '\n';
            if (elem.book_title) {
                section += `   Scope: Book - ${elem.book_title}\n`;
            } else {
                section += `   Scope: Series-wide\n`;
            }
            if (elem.description) {
                section += `   Description: ${elem.description}\n`;
            }
            section += '\n';
        });

        return section;
    }

    async generateTimelineEventsSection(seriesId, bookId) {
        const conditions = [];
        const params = [];

        if (bookId) {
            conditions.push('(te.series_id = $1 OR te.book_id = $2)');
            params.push(seriesId, bookId);
        } else {
            conditions.push('te.series_id = $1');
            params.push(seriesId);
        }

        const query = `
            SELECT te.id, te.event_name, te.event_date, te.description,
                   te.book_id, b.title as book_title
            FROM timeline_events te
            LEFT JOIN books b ON te.book_id = b.id
            WHERE ${conditions.join(' AND ')}
            ORDER BY te.event_date, te.event_name
        `;
        const result = await this.db.query(query, params);

        let section = '─'.repeat(80) + '\n';
        section += `TIMELINE EVENTS (${result.rows.length})\n`;
        section += '─'.repeat(80) + '\n';

        if (result.rows.length === 0) {
            section += 'No timeline events found.\n\n';
            return section;
        }

        result.rows.forEach((event, idx) => {
            section += `${idx + 1}. [ID: ${event.id}] ${event.event_name}`;
            if (event.event_date) {
                section += ` (${event.event_date})`;
            }
            section += '\n';
            if (event.book_title) {
                section += `   Scope: Book - ${event.book_title}\n`;
            } else {
                section += `   Scope: Series-wide\n`;
            }
            if (event.description) {
                section += `   Description: ${event.description}\n`;
            }
            section += '\n';
        });

        return section;
    }

    async generateRelationshipArcsSection(seriesId, bookId) {
        const conditions = [];
        const params = [];

        if (bookId) {
            conditions.push('(ra.series_id = $1 OR ra.book_id = $2)');
            params.push(seriesId, bookId);
        } else {
            conditions.push('ra.series_id = $1');
            params.push(seriesId);
        }

        const query = `
            SELECT ra.id, ra.arc_name, ra.status, ra.description,
                   c1.name as character1_name, c2.name as character2_name,
                   rt.type_name, ra.book_id, b.title as book_title
            FROM relationship_arcs ra
            LEFT JOIN characters c1 ON ra.character1_id = c1.id
            LEFT JOIN characters c2 ON ra.character2_id = c2.id
            LEFT JOIN relationship_types rt ON ra.relationship_type = rt.id
            LEFT JOIN books b ON ra.book_id = b.id
            WHERE ${conditions.join(' AND ')}
            ORDER BY ra.arc_name
        `;
        const result = await this.db.query(query, params);

        let section = '─'.repeat(80) + '\n';
        section += `RELATIONSHIP ARCS (${result.rows.length})\n`;
        section += '─'.repeat(80) + '\n';

        if (result.rows.length === 0) {
            section += 'No relationship arcs found.\n\n';
            return section;
        }

        result.rows.forEach((arc, idx) => {
            section += `${idx + 1}. [ID: ${arc.id}] ${arc.arc_name || 'Unnamed Arc'}\n`;
            section += `   Characters: ${arc.character1_name} & ${arc.character2_name}\n`;
            if (arc.type_name) {
                section += `   Type: ${arc.type_name}\n`;
            }
            section += `   Status: ${arc.status || 'Unknown'}\n`;
            if (arc.book_title) {
                section += `   Scope: Book - ${arc.book_title}\n`;
            } else {
                section += `   Scope: Series-wide\n`;
            }
            if (arc.description) {
                section += `   Description: ${arc.description}\n`;
            }
            section += '\n';
        });

        return section;
    }
}
