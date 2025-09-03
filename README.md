# MCP-tutorial
This is a tutorial project that demonstrates how to build a Model Context Protocol (MCP) server system for managing a book series database. The tutorial is structured in steps, each building upon the previous to create a complete system.

## Prerequisites
- Node.js (Latest LTS version recommended)
- Docker Desktop
- Git
- A code editor (VS Code recommended)

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/RLRyals/MCP-tutorial.git
   cd MCP-tutorial
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp template.env .env
   ```
   Then edit `.env` with your preferred settings.

4. Start the database using Docker:
   ```bash
   docker-compose up -d
   ```

5. Run database migrations:
   ```bash
   node src/shared/run-migration.js
   ```

## Project Structure
```
mcp-tutorial/
├── docs/               # Documentation and guides
├── migrations/         # Database migration files
├── scripts/           # Utility scripts
├── src/               # Source code
│   └── shared/        # Shared utilities
├── docker-compose.yml # Docker services configuration
├── Dockerfile        # Application container definition
└── template.env      # Environment variable template
```

## Tutorial Steps

The tutorial is organized into branches, each representing a different stage of development:

1. `main` - Basic setup and project structure
2. `character-server` - Implementing the character management server
3. `world-server` - Adding world-building functionality
4. `plot-server` - Creating the plot management system
5. `writing-server` - Implementing writing progress tracking
6. `research-server` - Adding research management capabilities

Each branch builds upon the previous one, gradually introducing new concepts and functionality.

## Documentation

For detailed information about the project, please refer to the following documentation:

- [Core Series Schema](docs/core-series-schema.md)
- [Project Structure Guide](docs/mcp-tutorial-structure.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
