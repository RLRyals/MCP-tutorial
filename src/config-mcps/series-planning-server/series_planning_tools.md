Series Planning Server Tools
The series planning server should include all the tools needed to establish the overall series framework, core worldbuilding elements, main characters, and long-term plot arcs. Here's a comprehensive list of what should be included:
const { create_series, get_series, update_series, list_series } = require('../../series-server');
const { create_character, add_character_detail, get_character, list_characters, get_character_details } = require('../../character-server');
const { define_world_system, get_world_system, create_plot_thread, get_plot_threads, update_plot_thread } = require('../../plot-server');
const { create_location, get_locations, create_organization, get_organizations, create_world_element, get_world_elements } = require('../../world-server');
const { create_relationship_arc, get_relationship_arc } = require('../../relationship-server');
const { get_available_options, add_metadata, get_metadata } = require('../../metadata-server');

1. Series Foundation Tools

series-server:create_series - Create the series itself
series-server:get_series - Retrieve series details
series-server:update_series - Update series metadata
series-server:list_series - View all series (helpful for referencing existing series)

2. Core Character Foundation Tools

character-server:create_character - Create main recurring characters
character-server:add_character_detail - Add essential character traits
character-server:get_character - Retrieve character information
character-server:list_characters - View all characters in series

3. World Building Foundation Tools

world-server:create_location - Create primary series locations
world-server:create_organization - Create major organizations (Mage Guild, Church, Police Dept)
world-server:get_locations - Retrieve location details
world-server:get_organizations - Retrieve organization details

4. Core Supernatural System Tools

plot-server:define_world_system - Define magical/supernatural systems
plot-server:get_world_system - Retrieve system details
world-server:create_world_element - Create specific manifestations of systems

5. Series-Wide Plot Tools

plot-server:create_plot_thread - Create major series-spanning plot arcs
plot-server:get_plot_threads - Retrieve plot thread details
plot-server:update_plot_thread - Update plot thread progression

6. Core Relationship Tools

relationship-server:create_relationship_arc - Establish core relationship frameworks
relationship-server:get_relationship_arc - Retrieve relationship details

7. Metadata Tools

metadata-server:get_available_options - Get valid values for genre, status, etc.