// src/config-mcps/reporting-server/schemas/reporting-tools-schema.js
// Reporting Tool Schema - Generate organized reports of series/book entities

export const reportingToolsSchema = [
    {
        name: 'generate_report',
        description: 'Generate a comprehensive report of all entities (characters, locations, plot threads, etc.) for a series or book. Input can be series_id, book_id, series_name, or book_name.',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'The ID of the series to generate report for'
                },
                book_id: {
                    type: 'integer',
                    description: 'The ID of the book to generate report for'
                },
                series_name: {
                    type: 'string',
                    description: 'The name of the series to generate report for (will search for matching series)'
                },
                book_name: {
                    type: 'string',
                    description: 'The name of the book to generate report for (will search for matching book)'
                },
                include_sections: {
                    type: 'array',
                    description: 'Optional: Specific sections to include. If not provided, includes all sections.',
                    items: {
                        type: 'string',
                        enum: [
                            'series_info',
                            'books',
                            'characters',
                            'locations',
                            'organizations',
                            'plot_threads',
                            'world_elements',
                            'timeline_events',
                            'relationship_arcs'
                        ]
                    }
                }
            },
            oneOf: [
                { required: ['series_id'] },
                { required: ['book_id'] },
                { required: ['series_name'] },
                { required: ['book_name'] }
            ]
        }
    }
];
