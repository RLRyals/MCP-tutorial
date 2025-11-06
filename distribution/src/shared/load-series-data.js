// src/shared/load-series-data.js - Utility to load series data and generate ID cheat sheet
console.error('=== Series Data Load Script Starting ===');
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseManager } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get data load file from command line argument
const dataLoadFile = process.argv[2];

// Helper function to create a safe filename from series title
function createSafeFilename(seriesTitle) {
    // Convert series title to snake_case for filename
    return seriesTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')  // Replace non-alphanumeric with underscore
        .replace(/^_+|_+$/g, '');      // Remove leading/trailing underscores
}

// Helper function to generate cheat sheet from query results
async function generateCheatSheet(client, seriesTitle, dataLoadPath) {
    console.error('Generating ID cheat sheet...');

    const cheatSheetLines = [];
    cheatSheetLines.push(`# ${seriesTitle.toUpperCase()} - ID CHEAT SHEET`);
    cheatSheetLines.push('');
    cheatSheetLines.push('**IMPORTANT:** Add this file to your LLM Project Files for easy reference during writing sessions.');
    cheatSheetLines.push('');
    cheatSheetLines.push('---');
    cheatSheetLines.push('');

    // Get series info
    const seriesResult = await client.query(
        'SELECT id, title, description FROM series WHERE title = $1',
        [seriesTitle]
    );

    if (seriesResult.rows.length > 0) {
        const series = seriesResult.rows[0];
        cheatSheetLines.push(`## Series Information`);
        cheatSheetLines.push(`- **Series ID:** ${series.id}`);
        cheatSheetLines.push(`- **Title:** ${series.title}`);
        cheatSheetLines.push('');
    } else {
        throw new Error(`Series "${seriesTitle}" not found in database. Data load may have failed.`);
    }

    // Get books
    const booksResult = await client.query(
        `SELECT id, title, book_number FROM books
         WHERE series_id = (SELECT id FROM series WHERE title = $1)
         ORDER BY book_number`,
        [seriesTitle]
    );

    if (booksResult.rows.length > 0) {
        cheatSheetLines.push(`## Books`);
        booksResult.rows.forEach(book => {
            cheatSheetLines.push(`- **Book ${book.book_number}:** ${book.title} (ID: ${book.id})`);
        });
        cheatSheetLines.push('');
    }

    // Get characters by type
    const charactersResult = await client.query(
        `SELECT id, name, character_type, role FROM characters
         WHERE series_id = (SELECT id FROM series WHERE title = $1)
         ORDER BY character_type, name`,
        [seriesTitle]
    );

    if (charactersResult.rows.length > 0) {
        cheatSheetLines.push(`## Characters`);

        const mainChars = charactersResult.rows.filter(c => c.character_type === 'main');
        if (mainChars.length > 0) {
            cheatSheetLines.push('### Main Characters');
            mainChars.forEach(char => {
                cheatSheetLines.push(`- **${char.name}** (ID: ${char.id}) - ${char.role || 'No role specified'}`);
            });
            cheatSheetLines.push('');
        }

        const antagonists = charactersResult.rows.filter(c => c.character_type === 'antagonist');
        if (antagonists.length > 0) {
            cheatSheetLines.push('### Antagonists');
            antagonists.forEach(char => {
                cheatSheetLines.push(`- **${char.name}** (ID: ${char.id}) - ${char.role || 'Antagonist'}`);
            });
            cheatSheetLines.push('');
        }

        const supporting = charactersResult.rows.filter(c => c.character_type === 'supporting');
        if (supporting.length > 0) {
            cheatSheetLines.push('### Supporting Characters');
            supporting.forEach(char => {
                cheatSheetLines.push(`- **${char.name}** (ID: ${char.id}) - ${char.role || 'Supporting'}`);
            });
            cheatSheetLines.push('');
        }
    }

    // Get locations
    const locationsResult = await client.query(
        `SELECT id, name, location_type FROM locations
         WHERE series_id = (SELECT id FROM series WHERE title = $1)
         ORDER BY name`,
        [seriesTitle]
    );

    if (locationsResult.rows.length > 0) {
        cheatSheetLines.push(`## Locations`);
        locationsResult.rows.forEach(loc => {
            cheatSheetLines.push(`- **${loc.name}** (ID: ${loc.id}) - ${loc.location_type || 'Location'}`);
        });
        cheatSheetLines.push('');
    }

    // Get organizations
    const orgsResult = await client.query(
        `SELECT id, name, org_type FROM organizations
         WHERE series_id = (SELECT id FROM series WHERE title = $1)
         ORDER BY name`,
        [seriesTitle]
    );

    if (orgsResult.rows.length > 0) {
        cheatSheetLines.push(`## Organizations`);
        orgsResult.rows.forEach(org => {
            cheatSheetLines.push(`- **${org.name}** (ID: ${org.id}) - ${org.org_type || 'Organization'}`);
        });
        cheatSheetLines.push('');
    }

    // Get world systems
    const systemsResult = await client.query(
        `SELECT id, system_name, system_type FROM world_systems
         WHERE series_id = (SELECT id FROM series WHERE title = $1)
         ORDER BY system_name`,
        [seriesTitle]
    );

    if (systemsResult.rows.length > 0) {
        cheatSheetLines.push(`## World Systems`);
        cheatSheetLines.push('*Frameworks & Rulesets (Use define_world_system in Plot Server)*');
        systemsResult.rows.forEach(sys => {
            cheatSheetLines.push(`- **${sys.system_name}** (ID: ${sys.id}) - ${sys.system_type || 'System'}`);
        });
        cheatSheetLines.push('');
    }

    // Get world elements
    const elementsResult = await client.query(
        `SELECT we.id, we.name, we.element_type, we.rarity, we.system_id, ws.system_name
         FROM world_elements we
         LEFT JOIN world_systems ws ON we.system_id = ws.id
         WHERE we.series_id = (SELECT id FROM series WHERE title = $1)
         ORDER BY we.system_id NULLS LAST, we.element_type, we.name`,
        [seriesTitle]
    );

    if (elementsResult.rows.length > 0) {
        cheatSheetLines.push(`## World Elements`);
        cheatSheetLines.push('*Specific Instances (Use create_world_element in World Server)*');

        // Group by system
        let currentSystemId = null;
        elementsResult.rows.forEach(elem => {
            if (elem.system_id !== currentSystemId) {
                currentSystemId = elem.system_id;
                if (elem.system_id) {
                    cheatSheetLines.push(`### Elements in "${elem.system_name}" (System ID: ${elem.system_id})`);
                } else {
                    cheatSheetLines.push(`### Standalone Elements`);
                }
            }
            const rarityTag = elem.rarity ? ` [${elem.rarity}]` : '';
            cheatSheetLines.push(`- **${elem.name}** (ID: ${elem.id}) - ${elem.element_type}${rarityTag}`);
        });
        cheatSheetLines.push('');
    }

    // Get plot threads
    const plotResult = await client.query(
        `SELECT id, title, thread_type, scope FROM plot_threads
         WHERE series_id = (SELECT id FROM series WHERE title = $1)
         ORDER BY importance_level DESC, title`,
        [seriesTitle]
    );

    if (plotResult.rows.length > 0) {
        cheatSheetLines.push(`## Plot Threads`);
        plotResult.rows.forEach(plot => {
            cheatSheetLines.push(`- **${plot.title}** (ID: ${plot.id}) - ${plot.thread_type || 'Unknown'} (${plot.scope || 'Unknown scope'})`);
        });
        cheatSheetLines.push('');
    }

    cheatSheetLines.push('---');
    cheatSheetLines.push('');
    cheatSheetLines.push('**Generated:** ' + new Date().toISOString());
    cheatSheetLines.push('**From Data Load:** ' + path.basename(dataLoadPath));

    return cheatSheetLines.join('\n');
}

// Export the loadSeriesData function for use in test scripts
export async function loadSeriesData(dataLoadPath) {
    console.error('Creating database manager...');
    const db = new DatabaseManager();

    try {
        console.error(`Loading series data from: ${path.basename(dataLoadPath)}`);
        console.error('Database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

        console.error('Reading data load file...');
        // Read the SQL file
        const dataLoadSQL = fs.readFileSync(dataLoadPath, 'utf8');
        console.error('Data load file loaded successfully');

        // Extract the series title from the SQL
        const titleMatch = dataLoadSQL.match(/INSERT INTO series[^)]+\([^)]*title[^)]*\)\s*VALUES[^)]+\([^']*'([^']+)'/i);
        if (!titleMatch) {
            throw new Error('Could not extract series title from SQL file. Please ensure your data load script has an INSERT INTO series statement with a title.');
        }
        const seriesTitle = titleMatch[1];
        console.error(`Detected series: ${seriesTitle}`);

        // Execute the data load within a transaction
        await db.transaction(async (client) => {
            await client.query(dataLoadSQL);
            console.error('Data load completed successfully!');

            // Generate the cheat sheet
            try {
                const cheatSheetContent = await generateCheatSheet(client, seriesTitle, dataLoadPath);

                // Create cheat sheet filename from series title (not from input filename)
                const safeSeriesName = createSafeFilename(seriesTitle);
                const cheatSheetPath = path.resolve(
                    path.dirname(dataLoadPath),
                    `${safeSeriesName}_ID_CHEAT_SHEET.md`
                );

                fs.writeFileSync(cheatSheetPath, cheatSheetContent, 'utf8');
                console.error(`\n${'='.repeat(70)}`);
                console.error(`✓ SUCCESS! ID Cheat Sheet created:`);
                console.error(`  ${cheatSheetPath}`);
                console.error(`${'='.repeat(70)}`);
                console.error(`\n⚠️  IMPORTANT: Add this cheat sheet to your LLM Project Files!`);
                console.error(`   This allows your AI to reference all series IDs during writing.\n`);
            } catch (cheatSheetError) {
                console.error('Warning: Could not generate cheat sheet:', cheatSheetError.message);
                throw cheatSheetError;
            }
        });

        return true;
    } catch (error) {
        console.error('\n❌ Error loading series data:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('\nDatabase connection failed. Please check:');
            console.error('1. Is PostgreSQL running?');
            console.error('2. Is DATABASE_URL correct in your .env file?');
        }
        throw error;
    } finally {
        await db.close();
    }
}

// Run data load if called directly (not imported)
if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    try {
        console.error('Working directory:', process.cwd());
        console.error('Arguments:', process.argv);
        console.error('DATABASE_URL exists:', !!process.env.DATABASE_URL);

        if (!dataLoadFile) {
            console.error('\n❌ Error: Please provide a data load file name');
            console.error('\nUsage: node src/shared/load-series-data.js <sql_filename>');
            console.error('\nExamples:');
            console.error('  node src/shared/load-series-data.js my_fantasy_series_data_load.sql');
            console.error('  node src/shared/load-series-data.js load_arcane_protocol.sql');
            console.error('  node src/shared/load-series-data.js series_setup.sql');
            console.error('\nNote: The cheat sheet filename will be generated from the series title in the SQL,');
            console.error('      not from the input filename.\n');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error in initial setup:', error);
        process.exit(1);
    }

    const dataLoadPathFromCLI = path.resolve(__dirname, '../../migrations', dataLoadFile);
    console.error('Full data load path:', dataLoadPathFromCLI);

    // Check if the file exists
    if (!fs.existsSync(dataLoadPathFromCLI)) {
        console.error(`\n❌ Error: Data load file not found: ${dataLoadPathFromCLI}`);
        console.error('\nPlease ensure:');
        console.error('1. The file is in the migrations/ folder');
        console.error('2. The filename is spelled correctly\n');
        process.exit(1);
    }

    console.error('Found data load file, attempting to run...');

    // Check for DATABASE_URL
    if (!process.env.DATABASE_URL) {
        console.error('\n❌ Error: DATABASE_URL environment variable is not set');
        console.error('Please ensure your .env file is set up correctly\n');
        process.exit(1);
    }

    loadSeriesData(dataLoadPathFromCLI)
        .then(() => {
            console.error('\n✅ Series data load completed successfully!\n');
            process.exit(0);
        })
        .catch(err => {
            console.error('\n❌ Series data load failed');
            console.error('--------------------');
            console.error(err);
            console.error('--------------------\n');
            process.exit(1);
        });
}
