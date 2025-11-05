// .claude/skills/mcp-writer/worldbuilding-workflow.js
// Practical example: Batch import worldbuilding data during series planning phase

import MCPHelper from './mcp-helper.js';

/**
 * Example: Complete worldbuilding setup for a new fantasy series
 *
 * This demonstrates how to efficiently add large amounts of worldbuilding
 * information during the series planning phase, all in one coordinated workflow.
 */

/**
 * Worldbuilding data structure example
 * In practice, this would come from your notes, documents, or user input
 */
const worldbuildingData = {
    series: {
        title: 'The Shadow Realms',
        genre: 'Epic Fantasy',
        planned_books: 5,
        target_audience: 'Adult',
        themes: ['power', 'redemption', 'chosen-one-subversion'],
        synopsis: 'A world where shadows have consciousness and the line between light and dark is never clear.'
    },

    kingdoms: [
        {
            name: 'Kingdom of Eldoria',
            type: 'kingdom',
            government: 'Monarchy',
            population: 2000000,
            culture: 'Warrior culture valuing honor and strength',
            description: 'Northern kingdom known for its formidable army and harsh winters',
            notable_features: ['Great Wall of Ice', 'Temple of the First King']
        },
        {
            name: 'Mage Republic of Arcanum',
            type: 'republic',
            government: 'Magocracy',
            population: 500000,
            culture: 'Academic, values knowledge and magical prowess',
            description: 'Island nation ruled by council of archmages',
            notable_features: ['The Spire', 'Library of Infinite Scrolls']
        },
        {
            name: 'Shadowlands',
            type: 'territory',
            government: 'Tribal confederation',
            population: 300000,
            culture: 'Shadow-walkers, mysterious and insular',
            description: 'Perpetually twilight region where shadows live',
            notable_features: ['The Veil', 'Shadow Gates']
        },
        {
            name: 'Trading Cities of the Coast',
            type: 'city-states',
            government: 'Merchant oligarchy',
            population: 1500000,
            culture: 'Mercantile, cosmopolitan, pragmatic',
            description: 'Five major port cities controlling sea trade',
            notable_features: ['The Grand Market', 'Lighthouse of Eternal Flame']
        },
        {
            name: 'Wildlands',
            type: 'frontier',
            government: 'None',
            population: 100000,
            culture: 'Survivalist, nature-worshipping nomads',
            description: 'Untamed forests and mountains, home to ancient magic',
            notable_features: ['The World Tree', 'Beast Sanctuaries']
        }
    ],

    magicSystem: {
        name: 'The Seven Schools of Shadow and Light',
        description: 'Magic is drawn from the balance between light and shadow',
        fundamentals: 'Practitioners can manipulate either light or shadow, but mastering both leads to madness',
        schools: [
            {
                name: 'Lumomancy',
                type: 'Light',
                description: 'Manipulation of pure light, healing, revelation',
                practitioners: 'Lightbringers',
                cost: 'Burns the user from within with prolonged use'
            },
            {
                name: 'Umbramancy',
                type: 'Shadow',
                description: 'Control of shadows, concealment, draining',
                practitioners: 'Shadowcasters',
                cost: 'Slowly consumes the caster\'s emotions'
            },
            {
                name: 'Pyromancy',
                type: 'Light',
                description: 'Fire magic, destruction and purification',
                practitioners: 'Flamewardens',
                cost: 'Emotional instability, rage'
            },
            {
                name: 'Cryomancy',
                type: 'Shadow',
                description: 'Ice and cold, preservation and stillness',
                practitioners: 'Frostbinders',
                cost: 'Emotional numbness, isolation'
            },
            {
                name: 'Restoration',
                type: 'Light',
                description: 'Healing wounds, curing disease',
                practitioners: 'Restorers',
                cost: 'Shares the patient\'s pain'
            },
            {
                name: 'Entropy',
                type: 'Shadow',
                description: 'Decay, aging, weakening',
                practitioners: 'Entropists',
                cost: 'Accelerates caster\'s aging'
            },
            {
                name: 'The Gray Path',
                type: 'Balanced',
                description: 'Forbidden art of balancing light and shadow',
                practitioners: 'Gray Walkers (very rare)',
                cost: 'Identity dissolution, madness'
            }
        ]
    },

    religions: [
        {
            name: 'The Church of Eternal Light',
            type: 'Organized religion',
            followers: 'Primarily in Eldoria and Trading Cities',
            beliefs: 'Light is good, shadow is evil, must purge darkness',
            practices: 'Daily prayer at dawn, light festivals, shadow banishment rituals',
            deity: 'Lumis, the Eternal Sun'
        },
        {
            name: 'The Shadow Covenant',
            type: 'Mystery cult',
            followers: 'Shadowlands and underground in other regions',
            beliefs: 'Shadow is rest, peace, truth. Light blinds and burns.',
            practices: 'Night gatherings, shadow meditation, revelation through darkness',
            deity: 'Nox, the Primordial Shadow'
        },
        {
            name: 'The Balance',
            type: 'Philosophy/Religion',
            followers: 'Wildlands, some mages in Arcanum',
            beliefs: 'Both light and shadow are necessary, must maintain equilibrium',
            practices: 'Meditation at dawn/dusk, seasonal balance ceremonies',
            deity: 'No single deity, worship the natural order'
        }
    ],

    majorLocations: [
        {
            name: 'The Spire',
            type: 'landmark',
            location: 'Arcanum',
            description: 'Impossibly tall tower housing the Council of Archmages',
            significance: 'Seat of magical power, repository of ancient knowledge',
            access: 'Only by magical teleportation'
        },
        {
            name: 'The Veil',
            type: 'natural-phenomenon',
            location: 'Shadowlands',
            description: 'Barrier between material world and realm of pure shadow',
            significance: 'Source of shadow magic, birthplace of shadowborn',
            access: 'Only shadow-walkers can safely approach'
        },
        {
            name: 'The World Tree',
            type: 'sacred-site',
            location: 'Wildlands',
            description: 'Ancient tree said to predate civilization',
            significance: 'Nexus of natural magic, protected by druids',
            access: 'Pilgrims welcome, but guarded'
        },
        // ... more locations
    ],

    timeline: [
        {
            era: 'Age of Genesis',
            years_ago: 5000,
            events: 'World created from primordial light and shadow',
            significance: 'Origin myth, foundation of magic system'
        },
        {
            era: 'First Kingdom',
            years_ago: 3000,
            events: 'Eldoria founded by the First King',
            significance: 'Beginning of recorded history'
        },
        {
            era: 'Shadow War',
            years_ago: 1000,
            events: 'Great war between light and shadow practitioners',
            significance: 'Led to persecution of shadow magic, founding of Shadowlands'
        },
        {
            era: 'Present Day',
            years_ago: 0,
            events: 'Uneasy peace, tensions rising',
            significance: 'Where the story begins'
        }
    ]
};

/**
 * Import all worldbuilding data for a new series
 * This is what Claude would run when you ask to set up worldbuilding
 */
async function importCompleteWorldbuilding(data) {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     Importing Worldbuilding Data                       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const helper = new MCPHelper();
    const results = {
        series: null,
        kingdoms: [],
        magic: null,
        religions: [],
        locations: [],
        timeline: [],
        errors: []
    };

    try {
        // Step 1: Create the series plan
        console.log('📖 Creating series plan...');
        try {
            results.series = await helper.callTool('series-planning-server', 'create_series_plan', {
                title: data.series.title,
                genre: data.series.genre,
                planned_books: data.series.planned_books,
                target_audience: data.series.target_audience,
                synopsis: data.series.synopsis,
                themes: data.series.themes.join(', ')
            });
            console.log(`   ✅ Created: ${results.series.title} (ID: ${results.series.series_id})\n`);
        } catch (error) {
            results.errors.push({ step: 'series', error: error.message });
            console.error(`   ❌ Failed: ${error.message}\n`);
            return results; // Can't continue without series
        }

        const seriesId = results.series.series_id;

        // Step 2: Create kingdoms/territories
        console.log('🏰 Creating kingdoms and territories...');
        for (const kingdom of data.kingdoms) {
            try {
                const created = await helper.callTool('world-planning-server', 'create_location', {
                    series_id: seriesId,
                    name: kingdom.name,
                    type: kingdom.type,
                    description: kingdom.description,
                    culture: kingdom.culture,
                    government: kingdom.government,
                    population: kingdom.population,
                    notable_features: kingdom.notable_features.join('; ')
                });
                results.kingdoms.push(created);
                console.log(`   ✅ ${kingdom.name}`);
            } catch (error) {
                results.errors.push({ step: 'kingdom', name: kingdom.name, error: error.message });
                console.error(`   ❌ ${kingdom.name}: ${error.message}`);
            }
        }
        console.log(`   Total: ${results.kingdoms.length}/${data.kingdoms.length} created\n`);

        // Step 3: Create magic system
        console.log('✨ Setting up magic system...');
        try {
            results.magic = await helper.callTool('world-planning-server', 'create_magic_system', {
                series_id: seriesId,
                name: data.magicSystem.name,
                description: data.magicSystem.description,
                fundamentals: data.magicSystem.fundamentals
            });

            // Add individual schools
            for (const school of data.magicSystem.schools) {
                try {
                    await helper.callTool('world-planning-server', 'add_magic_school', {
                        magic_system_id: results.magic.id,
                        name: school.name,
                        type: school.type,
                        description: school.description,
                        practitioners: school.practitioners,
                        cost: school.cost
                    });
                    console.log(`   ✅ ${school.name} (${school.type})`);
                } catch (error) {
                    results.errors.push({ step: 'magic-school', name: school.name, error: error.message });
                    console.error(`   ❌ ${school.name}: ${error.message}`);
                }
            }
            console.log(`   Magic System: ${results.magic.name}\n`);
        } catch (error) {
            results.errors.push({ step: 'magic-system', error: error.message });
            console.error(`   ❌ Failed: ${error.message}\n`);
        }

        // Step 4: Create religions
        console.log('⛪ Adding religions and belief systems...');
        for (const religion of data.religions) {
            try {
                const created = await helper.callTool('world-planning-server', 'create_religion', {
                    series_id: seriesId,
                    name: religion.name,
                    type: religion.type,
                    beliefs: religion.beliefs,
                    practices: religion.practices,
                    followers: religion.followers,
                    deity: religion.deity
                });
                results.religions.push(created);
                console.log(`   ✅ ${religion.name}`);
            } catch (error) {
                results.errors.push({ step: 'religion', name: religion.name, error: error.message });
                console.error(`   ❌ ${religion.name}: ${error.message}`);
            }
        }
        console.log(`   Total: ${results.religions.length}/${data.religions.length} created\n`);

        // Step 5: Add major locations
        console.log('📍 Creating major locations...');
        for (const location of data.majorLocations) {
            try {
                const created = await helper.callTool('world-planning-server', 'create_major_location', {
                    series_id: seriesId,
                    name: location.name,
                    type: location.type,
                    location_region: location.location,
                    description: location.description,
                    significance: location.significance,
                    access: location.access
                });
                results.locations.push(created);
                console.log(`   ✅ ${location.name}`);
            } catch (error) {
                results.errors.push({ step: 'location', name: location.name, error: error.message });
                console.error(`   ❌ ${location.name}: ${error.message}`);
            }
        }
        console.log(`   Total: ${results.locations.length}/${data.majorLocations.length} created\n`);

        // Step 6: Create timeline
        console.log('📅 Building historical timeline...');
        for (const event of data.timeline) {
            try {
                const created = await helper.callTool('timeline-planning-server', 'create_timeline_event', {
                    series_id: seriesId,
                    era: event.era,
                    years_ago: event.years_ago,
                    events: event.events,
                    significance: event.significance
                });
                results.timeline.push(created);
                console.log(`   ✅ ${event.era} (${event.years_ago} years ago)`);
            } catch (error) {
                results.errors.push({ step: 'timeline', era: event.era, error: error.message });
                console.error(`   ❌ ${event.era}: ${error.message}`);
            }
        }
        console.log(`   Total: ${results.timeline.length}/${data.timeline.length} created\n`);

    } finally {
        await helper.close();
    }

    // Print summary
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     Import Complete                                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('✅ Successfully Created:');
    console.log(`   Series: ${results.series?.title || 'Failed'}`);
    console.log(`   Kingdoms/Territories: ${results.kingdoms.length}`);
    console.log(`   Magic Schools: ${data.magicSystem.schools.length}`);
    console.log(`   Religions: ${results.religions.length}`);
    console.log(`   Major Locations: ${results.locations.length}`);
    console.log(`   Timeline Events: ${results.timeline.length}`);

    if (results.errors.length > 0) {
        console.log(`\n⚠️  Errors: ${results.errors.length}`);
        results.errors.forEach(err => {
            console.log(`   - ${err.step}: ${err.name || ''} - ${err.error}`);
        });
    }

    console.log('\n📝 Next Steps:');
    console.log('   1. Review the worldbuilding data in the database');
    console.log('   2. Add characters and tie them to locations/cultures');
    console.log('   3. Develop plot arcs that leverage the world setup');
    console.log('   4. Create book outlines for the planned series\n');

    return results;
}

/**
 * Example: Import from user's notes (JSON format)
 *
 * User might paste JSON from their worldbuilding notes
 */
async function importFromJSON(jsonString) {
    console.log('Importing worldbuilding from JSON...\n');

    try {
        const data = JSON.parse(jsonString);
        return await importCompleteWorldbuilding(data);
    } catch (error) {
        console.error('❌ Failed to parse JSON:', error.message);
        console.error('Please check your JSON format.\n');
        return null;
    }
}

/**
 * Example: Interactive import with validation
 *
 * This function validates data before import and asks for confirmation
 */
async function importWithValidation(data) {
    console.log('Validating worldbuilding data...\n');

    const validation = {
        valid: true,
        warnings: [],
        errors: []
    };

    // Validate series data
    if (!data.series?.title) {
        validation.errors.push('Series title is required');
        validation.valid = false;
    }

    // Warn about large datasets
    if (data.kingdoms?.length > 10) {
        validation.warnings.push(`Large kingdom count (${data.kingdoms.length}). This may take a while.`);
    }

    // Check for required fields in kingdoms
    data.kingdoms?.forEach((k, idx) => {
        if (!k.name) {
            validation.errors.push(`Kingdom ${idx + 1} missing name`);
            validation.valid = false;
        }
    });

    // Print validation results
    if (validation.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        validation.warnings.forEach(w => console.log(`   - ${w}`));
        console.log('');
    }

    if (validation.errors.length > 0) {
        console.log('❌ Validation Errors:');
        validation.errors.forEach(e => console.log(`   - ${e}`));
        console.log('\nPlease fix these errors before importing.\n');
        return null;
    }

    console.log('✅ Validation passed!\n');
    console.log('Summary:');
    console.log(`   Series: ${data.series.title}`);
    console.log(`   Kingdoms: ${data.kingdoms?.length || 0}`);
    console.log(`   Magic Schools: ${data.magicSystem?.schools?.length || 0}`);
    console.log(`   Religions: ${data.religions?.length || 0}`);
    console.log(`   Locations: ${data.majorLocations?.length || 0}`);
    console.log(`   Timeline Events: ${data.timeline?.length || 0}`);
    console.log('');

    // In a real scenario, you'd ask for user confirmation here
    // For now, proceed with import
    return await importCompleteWorldbuilding(data);
}

// Export functions
export {
    importCompleteWorldbuilding,
    importFromJSON,
    importWithValidation,
    worldbuildingData // Export sample data for testing
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}` ||
    import.meta.url.replace(/\/{3,}/g, '///') === `file:///${process.argv[1]}`.replace(/\/{3,}/g, '///')) {

    console.log('Running worldbuilding import example...\n');

    // Run the import with validation
    importWithValidation(worldbuildingData)
        .then(results => {
            if (results) {
                console.log('✅ Example completed successfully!');
            }
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Fatal error:', error.message);
            console.error(error.stack);
            process.exit(1);
        });
}
