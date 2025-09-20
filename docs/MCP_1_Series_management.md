# MCP Series Management Tutorial

This document outlines the core Model-Context-Protocol (MCP) services needed to build a book series management system, based on our foundational database schema.

## Core MCPs Required

### 1. Author Management MCP
Basic author management service interfacing with the `authors` table:
- Author creation
- Author information management
- Author lookup services

Protocol Methods:
```
CreateAuthor(name, email)
UpdateAuthor(author_id, name, email)
GetAuthorById(author_id)
ListAuthors()
```

### 2. Series Management MCP
Core service for managing book series, working with the `series` table:
- Series creation
- Series metadata management
- Genre and audience targeting
- Author association

Protocol Methods:
```
CreateSeries(author_id, title, description, genre, target_audience)
UpdateSeries(series_id, title, description, genre, target_audience)
GetSeriesByAuthor(author_id)
GetSeriesById(series_id)
```

### 3. Book Management MCP
Handles individual books within series, interfacing with the `books` table:
- Book creation and ordering
- Status tracking
- Word count management
- Progress monitoring

Protocol Methods:
```
CreateBook(series_id, title, book_number)
UpdateBookStatus(book_id, status)
UpdateWordCount(book_id, actual_word_count)
GetBooksInSeries(series_id)
GetBookById(book_id)
```

### 4. Timeline Management MCP
Manages series timelines using the `series_timeline` table:
- Timeline creation
- Timeline event tracking
- Chronological organization

Protocol Methods:
```
CreateTimeline(series_id, name, description)
UpdateTimeline(timeline_id, name, description)
GetSeriesTimelines(series_id)
GetTimelineById(timeline_id)
```

### 5. Series Metadata MCP
Flexible metadata management using the `series_metadata` table:
- Custom metadata storage
- Metadata retrieval
- Key-value pair management

Protocol Methods:
```
SetMetadata(series_id, key, value)
GetMetadata(series_id, key)
GetAllMetadata(series_id)
DeleteMetadata(series_id, key)
```

## Implementation Strategy

Building on top of the base MCP server framework provided in the main branch, we will:

1. Create a new branch `Step_1_MCP_series` from main
2. Implement each MCP service extending the `BaseMCPServer` class
3. Add tool handlers for each protocol method
4. Utilize the shared database manager for data operations

Each MCP implementation will include:
- Tool definitions extending base server capabilities
- Service implementation extending BaseMCPServer
- Database queries using shared DatabaseManager
- Integration tests
- API documentation with examples

## Database Considerations

- All tables include `created_at` and `updated_at` timestamps
- Automatic timestamp updates via triggers
- Appropriate indexes for performance
- Referential integrity via foreign keys
- Cascade deletes where appropriate

## Next Steps

1. Create the `Step_1_MCP_series` branch from main
2. Define MCP tools for each service
3. Implement tool handlers extending BaseMCPServer
4. Add necessary database queries to DatabaseManager
5. Create integration tests
6. Add example usage documentation

Each service will utilize the base server's:
- Error handling
- Database connection management
- HTTP health checks
- Response formatting
- Common validation helpers
