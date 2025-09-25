# ⚠️ DANGER ZONE ⚠️

This directory contains scripts that can potentially cause **irreversible data loss** or other significant changes to your development environment. These scripts are primarily intended for tutorial administrators or for resetting the tutorial environment to its initial state.

## Scripts in this Directory

- **drop-all-tables.ps1**: Completely drops all tables in the PostgreSQL database, removing all data and schema definitions.
- **reset-and-rebuild-database.ps1**: Resets the database and applies all migrations in sequence to rebuild the schema.
- **list-database-tables.ps1**: Lists all tables currently in the database (helpful for verification).

## Warning

⚠️ **Do not run these scripts unless you fully understand their consequences.**

These scripts are designed for specific purposes:
- Resetting the tutorial environment to its initial state
- Troubleshooting database issues
- Testing the tutorial from scratch

If you are a student following the tutorial, you generally should **not** need to use these scripts. Running them will erase your progress and require you to start over.

## Usage

If you do need to run these scripts, make sure to:
1. Back up any important data
2. Understand exactly what the script will do
3. Run the script from the correct directory (MCP-tutorial root)

Example (from MCP-tutorial directory):
```powershell
.\scripts\DangerZone\drop-all-tables.ps1
```

After running the drop-all-tables script, you can rebuild the database schema by running:
```powershell
.\scripts\reset-and-rebuild-database.ps1
```