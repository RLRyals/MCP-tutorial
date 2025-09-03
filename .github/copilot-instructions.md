# AI Agent Instructions for MCP-tutorial

This guide helps AI coding agents understand key patterns and conventions in the MCP-tutorial project, a Node.js-based system for managing book series data.

## Project Architecture

### Core Principles
- Series-centric design: All components reference `series_id` as their foundation
- Modular MCP servers: Each domain (character, world, plot) runs as a separate service
- Container-based development: Docker + PostgreSQL for consistent environments

### Key Components
- Database Schema: Core tables in `/docs/core-series-schema.md`
- MCP Servers: Port allocations 3001-3005 (see `Dockerfile`)
- Shared Utilities: Common code in `src/shared/`
- Database Migration System: Track changes in `migrations` table

## Development Workflows

### Database Setup
```bash
# Recommended approach using PowerShell
./scripts/start-database.ps1 

# Quick start if Docker is running
./quick-start.ps1
```

### Database Migrations
- Run via `src/shared/run-migration.js`
- Migrations auto-tracked in `migrations` table
- Always wrap in transactions (see example in `run-migration.js`)

### Container Management
- Services defined in `docker-compose.yml`
- Network: `mcp-network` for inter-service communication
- Health checks configured for both database and servers

## Project Conventions

### Environment Configuration
- Copy `template.env` to `.env`
- Required variables:
  - `POSTGRES_DB`: Database name
  - `POSTGRES_USER`: Database user
  - `POSTGRES_PASSWORD`: Database password
  - `DATABASE_URL`: Connection string
  - `NODE_ENV`: Environment name

### Database Design Patterns
- Foreign keys always include `ON DELETE` behavior
- Update timestamps managed via triggers
- Flexible metadata tables for extensibility
- Indices on common lookup patterns

### Code Organization
- Server code in `src/` by domain
- Migrations in `migrations/`
- Documentation in `docs/`
- Scripts in `scripts/`

## Feature Implementation Guide

When implementing new features:

1. Database Changes
   - Add migrations under `migrations/`
   - Follow series-centric design pattern
   - Include up/down migration scripts

2. Server Components
   - Place domain logic in appropriate MCP server
   - Use port range 3001-3005
   - Implement health checks
   - Share common code via `src/shared/`

3. Documentation
   - Update relevant `.md` files in `docs/`
   - Document database changes in schema files
   - Include example usage

## Branch Structure
- `main`: Core foundation and database setup
- Feature branches follow tutorial progression:
  1. `Step_1_MCP_series`: Series management
  2. `Step_2_MCP_world`: World building
  3. `Step_3_MCP_character`: Character tracking
  4. `Step_4_MCP_plot`: Plot management
  5. `Step_5_MCP_research`: Research tools
  6. `Step_6_MCP_writing`: Writing production
  7. `Step_7_MCP_persona_voice`: AI integration

## Common Patterns to Maintain

### Error Handling
- Database operations wrapped in transactions
- Health checks for service dependencies
- Graceful failure with detailed errors

### Data Organization 
- Everything ties back to `series_id`
- Use metadata tables for flexible properties
- Maintain referential integrity

### Docker Integration
- Service dependencies in `docker-compose.yml`
- Health checks for all services
- Volume mounts for development

Remember to always consider the series-centric architecture when making changes or additions to any part of the system.
