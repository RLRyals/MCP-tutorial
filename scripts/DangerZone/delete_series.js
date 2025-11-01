/**
 * Script to safely delete a series and all related data
 * This script works whether or not migration 018 cascade constraints have been applied
 *
 * Usage: node scripts/delete_series.js <series_id>
 * Example: node scripts/delete_series.js 8
 */

import { Client } from 'pg';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration from environment variables
const DB_CONFIG = {
    user: process.env.POSTGRES_USER,
    host: 'localhost',
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
};

// Get series ID from command line argument
const seriesId = parseInt(process.argv[2]);

if (!seriesId || isNaN(seriesId)) {
    console.error('❌ Error: Please provide a valid series ID');
    console.error('Usage: node scripts/delete_series.js <series_id>');
    console.error('Example: node scripts/delete_series.js 8');
    process.exit(1);
}

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getSeriesInfo(client, seriesId) {
    const result = await client.query(`
        SELECT
            s.id,
            s.title,
            (SELECT COUNT(*) FROM books WHERE series_id = s.id) as book_count,
            (SELECT COUNT(*) FROM characters WHERE series_id = s.id) as character_count
        FROM series s
        WHERE s.id = $1
    `, [seriesId]);

    return result.rows[0];
}

async function deleteSeries(client, seriesId, seriesTitle) {
    console.log('\n========================================');
    console.log('PROCEEDING WITH DELETION');
    console.log('========================================\n');

    try {
        await client.query('BEGIN');

        // STEP 1: Delete data that might not cascade properly
        console.log('Deleting dependent data explicitly...');

        await client.query(`DELETE FROM trope_instances WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)`, [seriesId]);
        console.log('  ✓ Deleted trope instances');

        await client.query(`DELETE FROM character_throughlines WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)`, [seriesId]);
        console.log('  ✓ Deleted character throughlines');

        await client.query(`DELETE FROM story_appreciations WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)`, [seriesId]);
        console.log('  ✓ Deleted story appreciations');

        await client.query(`DELETE FROM problem_solutions WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)`, [seriesId]);
        console.log('  ✓ Deleted problem solutions');

        await client.query(`DELETE FROM relationship_arcs WHERE plot_thread_id IN (SELECT id FROM plot_threads WHERE series_id = $1)`, [seriesId]);
        console.log('  ✓ Deleted relationship arcs');

        // STEP 2: Handle SET NULL references
        await client.query(`
            UPDATE characters
            SET first_appearance_book_id = NULL, last_appearance_book_id = NULL
            WHERE series_id = $1
        `, [seriesId]);
        console.log('  ✓ Cleared book references from characters');

        await client.query(`
            UPDATE character_details
            SET source_book_id = NULL
            WHERE character_id IN (SELECT id FROM characters WHERE series_id = $1)
        `, [seriesId]);
        console.log('  ✓ Cleared source_book_id from character_details');

        await client.query(`
            UPDATE character_knowledge
            SET learned_book_id = NULL
            WHERE character_id IN (SELECT id FROM characters WHERE series_id = $1)
        `, [seriesId]);
        console.log('  ✓ Cleared learned_book_id from character_knowledge');

        // STEP 3: Delete plot_threads dependencies
        await client.query(`
            DELETE FROM information_flow
            WHERE reveal_id IN (
                SELECT id FROM information_reveals
                WHERE plot_thread_id IN (SELECT id FROM plot_threads WHERE series_id = $1)
            )
        `, [seriesId]);
        console.log('  ✓ Deleted information flow records');

        await client.query(`
            DELETE FROM reveal_evidence
            WHERE reveal_id IN (
                SELECT id FROM information_reveals
                WHERE plot_thread_id IN (SELECT id FROM plot_threads WHERE series_id = $1)
            )
        `, [seriesId]);
        console.log('  ✓ Deleted reveal evidence');

        await client.query(`
            DELETE FROM information_reveals
            WHERE plot_thread_id IN (SELECT id FROM plot_threads WHERE series_id = $1)
        `, [seriesId]);
        console.log('  ✓ Deleted information reveals');

        // STEP 4: Delete world systems (NO CASCADE!)
        await client.query(`
            DELETE FROM character_system_progression
            WHERE character_id IN (SELECT id FROM characters WHERE series_id = $1)
        `, [seriesId]);
        console.log('  ✓ Deleted character system progression');

        await client.query(`
            DELETE FROM system_abilities
            WHERE system_id IN (SELECT id FROM world_systems WHERE series_id = $1)
        `, [seriesId]);
        console.log('  ✓ Deleted system abilities');

        await client.query(`DELETE FROM world_systems WHERE series_id = $1`, [seriesId]);
        console.log('  ✓ Deleted world_systems');

        await client.query(`DELETE FROM tropes WHERE series_id = $1`, [seriesId]);
        console.log('  ✓ Deleted tropes');

        // STEP 5: Delete chapter and scene data
        await client.query(`
            DELETE FROM trope_scenes
            WHERE chapter_id IN (
                SELECT id FROM chapters WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)
            )
        `, [seriesId]);
        console.log('  ✓ Deleted trope scenes');

        await client.query(`
            DELETE FROM event_chapter_mappings
            WHERE chapter_id IN (
                SELECT id FROM chapters WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)
            )
        `, [seriesId]);
        console.log('  ✓ Deleted event chapter mappings');

        await client.query(`
            DELETE FROM character_chapter_presence
            WHERE chapter_id IN (
                SELECT id FROM chapters WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)
            )
        `, [seriesId]);
        console.log('  ✓ Deleted character chapter presence');

        await client.query(`
            DELETE FROM chapter_plot_points
            WHERE chapter_id IN (
                SELECT id FROM chapters WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)
            )
        `, [seriesId]);
        console.log('  ✓ Deleted chapter plot points');

        await client.query(`
            DELETE FROM chapter_scenes
            WHERE chapter_id IN (
                SELECT id FROM chapters WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)
            )
        `, [seriesId]);
        console.log('  ✓ Deleted chapter scenes');

        await client.query(`
            DELETE FROM session_chapters
            WHERE chapter_id IN (
                SELECT id FROM chapters WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)
            )
        `, [seriesId]);
        console.log('  ✓ Deleted session chapters');

        // STEP 6: Delete writing and validation data
        await client.query(`DELETE FROM manuscript_exports WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)`, [seriesId]);
        console.log('  ✓ Deleted manuscript exports');

        await client.query(`DELETE FROM writing_goals WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)`, [seriesId]);
        console.log('  ✓ Deleted writing goals');

        await client.query(`DELETE FROM writing_sessions WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)`, [seriesId]);
        console.log('  ✓ Deleted writing sessions');

        await client.query(`DELETE FROM word_count_snapshots WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)`, [seriesId]);
        console.log('  ✓ Deleted word count snapshots');

        await client.query(`DELETE FROM validation_results WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)`, [seriesId]);
        console.log('  ✓ Deleted validation results');

        await client.query(`DELETE FROM validation_rules WHERE series_id = $1`, [seriesId]);
        console.log('  ✓ Deleted validation rules');

        await client.query(`DELETE FROM story_analysis WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)`, [seriesId]);
        console.log('  ✓ Deleted story analysis');

        // STEP 7: Delete world element usage
        await client.query(`
            DELETE FROM world_element_usage
            WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)
               OR chapter_id IN (
                   SELECT id FROM chapters WHERE book_id IN (SELECT id FROM books WHERE series_id = $1)
               )
        `, [seriesId]);
        console.log('  ✓ Deleted world element usage');

        // STEP 8: Delete the series (CASCADE handles the rest)
        console.log('\nDeleting main series data via CASCADE...');
        await client.query(`DELETE FROM series WHERE id = $1`, [seriesId]);

        await client.query('COMMIT');

        console.log('\n========================================');
        console.log(`✓ SUCCESS: Series "${seriesTitle}" (ID: ${seriesId}) has been completely deleted`);
        console.log('========================================\n');

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

async function main() {
    const client = new Client(DB_CONFIG);

    try {
        await client.connect();
        console.log('Connected to database');

        // Get series information
        const seriesInfo = await getSeriesInfo(client, seriesId);

        if (!seriesInfo) {
            console.error(`\n❌ Error: Series with ID ${seriesId} does not exist\n`);
            process.exit(1);
        }

        // Display series information
        console.log('\n========================================');
        console.log('SERIES DELETION CONFIRMATION');
        console.log('========================================');
        console.log(`Series ID: ${seriesInfo.id}`);
        console.log(`Series Title: "${seriesInfo.title}"`);
        console.log(`Books in series: ${seriesInfo.book_count}`);
        console.log(`Characters in series: ${seriesInfo.character_count}`);
        console.log('========================================');
        console.log('\n⚠️  WARNING: This will PERMANENTLY delete ALL data for this series!');
        console.log('⚠️  This includes: books, chapters, scenes, characters, plot threads,');
        console.log('⚠️  world elements, timelines, and all related data (48+ tables)\n');

        // Ask for confirmation
        rl.question(`Do you want to delete Series ID ${seriesInfo.id} - "${seriesInfo.title}"? (Type YES (ALL CAPS) to confirm): `, async (answer) => {
            if (answer.trim() === 'YES') {
                try {
                    await deleteSeries(client, seriesId, seriesInfo.title);
                } catch (error) {
                    console.error('\n❌ Error during deletion:', error.message);
                    process.exit(1);
                } finally {
                    await client.end();
                    rl.close();
                }
            } else {
                console.log(`\n❌ Deletion cancelled. You entered: "${answer}"`);
                console.log('❌ No changes were made.\n');
                await client.end();
                rl.close();
                process.exit(0);
            }
        });

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        await client.end();
        rl.close();
        process.exit(1);
    }
}

main();
