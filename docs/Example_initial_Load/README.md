# Example Initial Load - Series Data Setup Guide

This folder contains example files and templates to help you load your complete 5-book genre fiction series premise into the MCP Writing System database.

## What's In This Folder

### Template and Reference Files

- **[genre_fiction_sql_template.sql](genre_fiction_sql_template.sql)** - Template for creating your own series data load script
- **[DATABASE_SCHEMA_FOR_SQL_GENERATION.md](DATABASE_SCHEMA_FOR_SQL_GENERATION.md)** - Complete database schema reference for LLM-assisted generation

## Two Ways to Create Your Series Data Load Script

### Option 1: Manual Fill-Out (Recommended for Small Series)

1. Open [genre_fiction_sql_template.sql](genre_fiction_sql_template.sql)
2. Search for all `-- CUSTOMIZE:` comments throughout the file
3. Replace the example values with your series information:
   - Series title, description, target audience
   - Book titles, descriptions, word counts
   - Character names, descriptions, roles
   - Locations, organizations, relationships
   - Plot threads and story arcs
4. Save with any filename you prefer (e.g., `my_series_data_load.sql`, `fantasy_series.sql`, etc.)
   - The ID cheat sheet will be named based on your series **title** in the SQL, not this filename

### Option 2: LLM-Assisted Generation (Recommended for Complex Series)

1. **Prepare your prompt** to an LLM (Claude, ChatGPT, etc.) with three components:

   **Component 1 - Instructions:**
   ```
   I need you to generate a PostgreSQL data load script for my 5-book genre fiction series.
   Use the template structure and database schema provided below to create a complete
   SQL script that loads all my series infrastructure into the database.
   ```

   **Component 2 - Your Series Premise:**
   - Series title and description
   - Target audience
   - Brief synopsis for each of the 5 books
   - Main characters and their roles
   - Key locations and organizations
   - Major plot threads across the series
   - Character relationships

   **Component 3 - Reference Materials:**
   - Copy the contents of [DATABASE_SCHEMA_FOR_SQL_GENERATION.md](DATABASE_SCHEMA_FOR_SQL_GENERATION.md)
   - Copy the structure from [genre_fiction_sql_template.sql](genre_fiction_sql_template.sql) as a guide

2. **Review the LLM output** - The LLM will generate a complete SQL script based on your premise

## Loading Your Series Data Into The Database

Once you have your `SERIES_NAME_data_load.sql` file (either manually created or LLM-generated), follow these steps carefully:

### Step 1: Review Your SQL Script

**CRITICAL: Always review generated SQL before running it!**

1. Open your `SERIES_NAME_data_load.sql` file in a text editor
2. Verify the following:
   - [ ] Author ID matches your database author ID (usually `1` for first author)
   - [ ] All series and book information is accurate
   - [ ] Character names and descriptions are correct
   - [ ] Genre names match existing genres or new ones are properly defined
   - [ ] No placeholder text like "Your Series Title" remains
   - [ ] All apostrophes in text are properly escaped with `''` (two single quotes)
   - [ ] The script begins with `BEGIN;` and ends with `COMMIT;` and `END $$;`

3. **Check for SQL syntax issues:**
   - Matching parentheses in all INSERT statements
   - Commas separating values correctly (not missing, not extra)
   - Proper quote matching (every `'` has a closing `'`)
   - Variable declarations match usage throughout the script

### Step 2: Save the File to the Migrations Folder

1. **Copy your reviewed file** to the migrations folder:
   - Source: `docs/Example_initial_Load/your_sql_file.sql`
   - Destination: `migrations/your_sql_file.sql`

   **Note:** You can name the file anything you want (e.g., `my_series_data.sql`, `load_fantasy_series.sql`). The generated cheat sheet will be named based on the **series title** in your SQL, not the filename.

2. **Verify the file location:**
   ```bash
   ls migrations/your_sql_file.sql
   ```
   You should see your file listed in the migrations directory.

### Step 3: Run the Data Load Command

Open your terminal in the project root directory and run:

```bash
node src/shared/load-series-data.js your_sql_file.sql
```

Replace `your_sql_file.sql` with whatever you named your SQL file (e.g., `my_fantasy_series_data_load.sql`, `load_series.sql`, etc.).

**Important Notes:**
- This is different from the `run-migration.js` command used for schema migrations
- The `load-series-data.js` command is specifically designed for loading series data
- It automatically generates your ID cheat sheet based on the **series title** found in your SQL's `INSERT INTO series` statement
- The cheat sheet filename will be based on the series title (e.g., if your series is "The Dark Chronicles", the cheat sheet will be `the_dark_chronicles_ID_CHEAT_SHEET.md`)

#### What to Expect:

**Successful Output:**
```
=== Series Data Load Script Starting ===
Creating database manager...
Loading series data from: your_sql_file.sql
Reading data load file...
Data load file loaded successfully
Detected series: Your Series Name
Data load completed successfully!
Generating ID cheat sheet...

======================================================================
✓ SUCCESS! ID Cheat Sheet created:
  /path/to/migrations/your_series_name_ID_CHEAT_SHEET.md
======================================================================

⚠️  IMPORTANT: Add this cheat sheet to your LLM Project Files!
   This allows your AI to reference all series IDs during writing.

✅ Series data load completed successfully!
```

The script automatically creates a markdown file in the migrations folder containing all your generated IDs organized by category. The cheat sheet filename is based on your series title (converted to lowercase with underscores), **not** your input SQL filename.

**If You See Errors:**

Common error types and solutions:

1. **Syntax Error:**
   ```
   ERROR: syntax error at or near "..."
   ```
   - Review the line number mentioned in the error
   - Check for missing commas, quotes, or parentheses
   - Fix in your source file and re-run

2. **Foreign Key Violation:**
   ```
   ERROR: insert or update on table "..." violates foreign key constraint
   ```
   - Verify your author_id exists in the authors table
   - Check that variable names match between declarations and usage
   - Ensure lookup table values exist before referencing them

3. **Duplicate Key Error:**
   ```
   ERROR: duplicate key value violates unique constraint
   ```
   - Your series or data may already exist in the database
   - Check existing data or modify the script to use `ON CONFLICT` clauses

4. **Transaction Rollback:**
   - If any error occurs, the entire script will rollback (undo all changes)
   - This is a safety feature - no partial data will be saved
   - Fix the errors and re-run the entire script

### Step 4: Add Your ID Cheat Sheet to LLM Project Files

**CRITICAL: Your ID cheat sheet is automatically generated!**

1. **Locate the generated cheat sheet:**
   - The data load script automatically creates: `migrations/your_series_name_ID_CHEAT_SHEET.md`
   - The filename is based on your series title (e.g., "Arcane Protocol" becomes `arcane_protocol_ID_CHEAT_SHEET.md`)
   - This file contains all your generated IDs organized by type:
     - Series ID - Required for all MCP Writing Team operations
     - Book IDs - Needed when planning chapters for specific books
     - Character IDs - Required for character development and relationship tracking
     - Location IDs - Used in scene planning and world building
     - Organization IDs - Referenced in plot threads and character affiliations
     - Plot Thread IDs - Track ongoing storylines

2. **Add to your LLM Project Files:**
   - **For Claude (Desktop App):** Add the cheat sheet file to your project's knowledge base
   - **For ChatGPT:** Upload the file to your project files or custom GPT
   - **For Other LLMs:** Follow your LLM's method for adding reference documents

   This allows the AI to reference your series IDs during writing sessions without you having to remember or look them up!

3. **Keep it updated:** If you add more characters, locations, or plot threads later, you can re-run queries to generate an updated cheat sheet

## Verifying Your Data Load

After successful migration, you can verify your data was loaded correctly using one of these methods:

### Method 1: Ask Your MCP Writing Team (Easiest)
Simply ask your LLM with MCP access:
```
"Can you list my series and show me the books and characters?"
```

The MCP tools will query your database and show you all the loaded data.

### Method 2: Use Adminer (Visual Interface)
1. Open Adminer in your browser (usually at `http://localhost:8080`)
2. Select the `series` table and click "Select data" to see your series
3. Select the `books` table to verify all 5 books were created
4. Select the `characters` table to see your character list
5. Browse other tables as needed

### Method 3: Use VS Code PostgreSQL Extension (For SQL Users)
If you have the PostgreSQL extension installed in VS Code:
1. Connect to your database in the PostgreSQL explorer
2. Right-click on a table and select "Run Query"
3. Use these SQL statements:

```sql
-- Check your series was created
SELECT * FROM series WHERE title = 'Your Series Name';

-- Check all 5 books
SELECT id, title, book_number, status FROM books
WHERE series_id = YOUR_SERIES_ID
ORDER BY book_number;

-- Check main characters
SELECT id, name, role FROM characters
WHERE series_id = YOUR_SERIES_ID;

-- Check plot threads
SELECT id, thread_name, scope FROM plot_threads
WHERE series_id = YOUR_SERIES_ID;
```

Replace `YOUR_SERIES_ID` with the series ID printed after migration.

## Next Steps After Data Load

Once your series infrastructure is loaded:

1. **Configure your MCP Writing Team** with your series_id
2. **Start planning Book 1** using the MCP agents
3. **Develop character arcs** for each main character
4. **Plan plot progression** across the 5-book series
5. **Begin writing chapters** with full context awareness

## Troubleshooting

### Problem: "Cannot find migration file"
**Solution:** Ensure your SQL file is in the `migrations/` folder, not in `docs/Example_initial_Load/`

### Problem: "Author ID does not exist"
**Solution:**
1. Check your authors table: `SELECT * FROM authors;`
2. If no authors exist, create one first:
   ```sql
   INSERT INTO authors (name, email) VALUES ('Your Name', 'your.email@example.com');
   ```
3. Update the `author_id` in your data load script

### Problem: "Transaction rolled back"
**Solution:** This means an error occurred and NO data was saved. Fix the error in your SQL file and run again. Your database is unchanged.

### Problem: "Running the script again after partial success"
**Solution:** The script uses a transaction (BEGIN/COMMIT), so either ALL data loads or NONE loads. If you need to re-run, check if your series already exists first to avoid duplicates.

## Additional Resources

- **MCP Writing System Documentation** - See main project README
- **Database Schema Details** - [DATABASE_SCHEMA_FOR_SQL_GENERATION.md](DATABASE_SCHEMA_FOR_SQL_GENERATION.md)
- **Series Data Loader Source** - [src/shared/load-series-data.js](../../src/shared/load-series-data.js)
- **Schema Migration Runner** - [src/shared/run-migration.js](../../src/shared/run-migration.js) (for numbered schema migrations only)

## Support

If you encounter issues not covered in this guide:
1. Review the error message carefully - SQL errors are usually specific
2. Check the template file to see the correct format
3. Verify your database schema is up to date (run all numbered migrations first)
4. Consult the DATABASE_SCHEMA document for table requirements

---

**Last Updated:** October 2025
**Tested With:** PostgreSQL 12+, Node.js 16+
