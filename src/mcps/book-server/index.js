// src/mcps/book-server/index.js
// FIXED VERSION - Modular Book MCP Server with proper method binding
// Designed for AI Writing Teams to manage complete story structure

// Protect stdout from any pollution in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';
import { BookHandlers } from './handlers/book-handlers.js';
import { ChapterHandlers } from './handlers/chapter-handlers.js';
import { SceneHandlers } from './handlers/scene-handlers.js';

class BookMCPServer extends BaseMCPServer {
    constructor() {
        console.error('[BOOK-SERVER] Constructor starting...');
        try {
            super('book-manager', '1.0.0');
            console.error('[BOOK-SERVER] Base constructor completed');
        } catch (error) {
            console.error('[BOOK-SERVER] Constructor failed:', error.message);
            throw error;
        }
        
        // Initialize handler modules with database connection
        this.bookHandlers = new BookHandlers(this.db);
        this.chapterHandlers = new ChapterHandlers(this.db);
        this.sceneHandlers = new SceneHandlers(this.db);
        
        // FIXED: Properly bind handler methods to maintain context
        this.bindHandlerMethods();
        
        // Initialize tools after handlers are bound
        this.tools = this.getTools();
        
        // Defensive check to ensure tools are properly initialized
        if (!this.tools || !Array.isArray(this.tools) || this.tools.length === 0) {
            console.error('[BOOK-SERVER] WARNING: Tools not properly initialized!');
            this.tools = this.getTools();
        }
        
        if (process.env.MCP_STDIO_MODE !== 'true') {
            console.error(`[BOOK-SERVER] Initialized with ${this.tools.length} tools`);
        }
        
        // Test database connection on startup
        this.testDatabaseConnection();
    }

    // FIXED: Proper method binding to maintain context
    bindHandlerMethods() {
        // Bind book handler methods
        this.handleListBooks = this.bookHandlers.handleListBooks.bind(this.bookHandlers);
        this.handleGetBook = this.bookHandlers.handleGetBook.bind(this.bookHandlers);
        this.handleCreateBook = this.bookHandlers.handleCreateBook.bind(this.bookHandlers);
        this.handleUpdateBook = this.bookHandlers.handleUpdateBook.bind(this.bookHandlers);
        this.handleDeleteBook = this.bookHandlers.handleDeleteBook.bind(this.bookHandlers);
        
        // Bind chapter handler methods
        this.handleCreateChapter = this.chapterHandlers.handleCreateChapter.bind(this.chapterHandlers);
        this.handleUpdateChapter = this.chapterHandlers.handleUpdateChapter.bind(this.chapterHandlers);
        this.handleGetChapter = this.chapterHandlers.handleGetChapter.bind(this.chapterHandlers);
        this.handleListChapters = this.chapterHandlers.handleListChapters.bind(this.chapterHandlers);
        this.handleDeleteChapter = this.chapterHandlers.handleDeleteChapter.bind(this.chapterHandlers);
        //this.handleReorderChapters = this.chapterHandlers.handleReorderChapters.bind(this.chapterHandlers);
        
        // Bind scene handler methods (when scene handlers are implemented)
        // this.handleCreateScene = this.sceneHandlers.handleCreateScene.bind(this.sceneHandlers);
        // ... etc
    }

    async testDatabaseConnection() {
        try {
            if (this.db) {
                const healthPromise = this.db.healthCheck();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Database health check timed out')), 5000)
                );
                
                const health = await Promise.race([healthPromise, timeoutPromise]);
                if (health.healthy) {
                    console.error('[BOOK-SERVER] Database connection verified');
                } else {
                    console.error('[BOOK-SERVER] Database health check failed:', health.error);
                }
            }
        } catch (error) {
            console.error('[BOOK-SERVER] Database connection test failed:', error.message);
        }
    }

    // =============================================
    // COMPLETE TOOL REGISTRATION
    // =============================================
    getTools() {
        return [
            // Book Management Tools
            ...this.bookHandlers.getBookTools(),
            
            // Chapter Management Tools  
            ...this.chapterHandlers.getChapterTools(),
            
            // Scene Management Tools (when implemented)
            // ...this.sceneHandlers.getSceneTools()
        ];
    }

    // =============================================
    // COMPLETE TOOL HANDLER MAPPING
    // =============================================
    getToolHandler(toolName) {
        const handlers = {
            // Book Management Handlers
            'list_books': this.handleListBooks,
            'get_book': this.handleGetBook,
            'create_book': this.handleCreateBook,
            'update_book': this.handleUpdateBook,
            'delete_book': this.handleDeleteBook,
            
            // Chapter Management Handlers
            'create_chapter': this.handleCreateChapter,
            'update_chapter': this.handleUpdateChapter,
            'get_chapter': this.handleGetChapter,
            'list_chapters': this.handleListChapters,
            'delete_chapter': this.handleDeleteChapter,
            //'reorder_chapters': this.handleReorderChapters,
            
            // Scene Management Handlers (when implemented)
            // 'create_scene': this.handleCreateScene,
            // 'update_scene': this.handleUpdateScene,
            // 'get_scene': this.handleGetScene,
            // 'list_scenes': this.handleListScenes,
            // 'delete_scene': this.handleDeleteScene,
            // 'reorder_scenes': this.handleReorderScenes,
            // 'analyze_scene_flow': this.handleAnalyzeSceneFlow,
            
            // Cross-component Analysis Tools
            'get_book_structure': this.handleGetBookStructure,
            'analyze_book_progress': this.handleAnalyzeBookProgress,
            'validate_book_consistency': this.handleValidateBookConsistency
        };
        return handlers[toolName];
    }

    // =============================================
    // CROSS-COMPONENT ANALYSIS METHODS
    // These methods use multiple handlers together
    // =============================================
    
    async handleGetBookStructure(args) {
        try {
            const { book_id } = args;
            
            // Get book details
            const book = await this.bookHandlers.getBookById(book_id);
            if (!book) {
                return {
                    content: [{
                        type: 'text',
                        text: `No book found with ID: ${book_id}`
                    }]
                };
            }
            
            // Get all chapters for this book
            const chapters = await this.chapterHandlers.getChaptersByBookId(book_id);
            
            // Build structure analysis
            const structure = chapters.map(chapter => {
                return {
                    chapter_number: chapter.chapter_number,
                    title: chapter.title,
                    word_count: chapter.word_count || 0,
                    status: chapter.status
                };
            });
            
            const totalWordCount = structure.reduce((sum, ch) => sum + ch.word_count, 0);
            
            return {
                content: [{
                    type: 'text',
                    text: `Book Structure: ${book.title}\n\n` +
                          `Total Chapters: ${chapters.length}\n` +
                          `Total Word Count: ${totalWordCount}\n` +
                          `Target Word Count: ${book.target_word_count || 'Not specified'}\n` +
                          `Progress: ${book.target_word_count ? Math.round((totalWordCount / book.target_word_count) * 100) : 0}%\n\n` +
                          `Chapter Breakdown:\n` +
                          structure.map(ch => 
                              `Chapter ${ch.chapter_number}: ${ch.title || 'Untitled'}\n` +
                              `  Words: ${ch.word_count} | Status: ${ch.status}`
                          ).join('\n')
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get book structure: ${error.message}`);
        }
    }

    async handleAnalyzeBookProgress(args) {
        try {
            const { book_id } = args;
            
            // Get book and its chapters
            const book = await this.bookHandlers.getBookById(book_id);
            const chapters = await this.chapterHandlers.getChaptersByBookId(book_id);
            
            if (!book) {
                throw new Error(`Book with ID ${book_id} not found`);
            }
            
            // Analyze progress by status
            const statusCounts = chapters.reduce((counts, ch) => {
                counts[ch.status] = (counts[ch.status] || 0) + 1;
                return counts;
            }, {});
            
            // Calculate completion percentages
            const totalChapters = chapters.length;
            const completedChapters = (statusCounts.final || 0) + (statusCounts.published || 0);
            const draftedChapters = statusCounts.drafted || 0;
            const inProgressChapters = statusCounts.in_progress || 0;
            
            return {
                content: [{
                    type: 'text',
                    text: `Progress Analysis: ${book.title}\n\n` +
                          `Overall Progress:\n` +
                          `- Total Chapters: ${totalChapters}\n` +
                          `- Completed: ${completedChapters} (${Math.round((completedChapters/totalChapters)*100)}%)\n` +
                          `- Drafted: ${draftedChapters} (${Math.round((draftedChapters/totalChapters)*100)}%)\n` +
                          `- In Progress: ${inProgressChapters} (${Math.round((inProgressChapters/totalChapters)*100)}%)\n` +
                          `- Planned: ${statusCounts.planned || 0} (${Math.round(((statusCounts.planned || 0)/totalChapters)*100)}%)\n\n` +
                          `Status Breakdown:\n` +
                          Object.entries(statusCounts).map(([status, count]) => 
                              `- ${status}: ${count} chapters`
                          ).join('\n')
                }]
            };
        } catch (error) {
            throw new Error(`Failed to analyze book progress: ${error.message}`);
        }
    }

    async handleValidateBookConsistency(args) {
        try {
            const { book_id } = args;
            
            const book = await this.bookHandlers.getBookById(book_id);
            const chapters = await this.chapterHandlers.getChaptersByBookId(book_id);
            
            if (!book) {
                throw new Error(`Book with ID ${book_id} not found`);
            }
            
            const issues = [];
            const warnings = [];
            
            // Check chapter numbering consistency
            const sortedChapters = chapters.sort((a, b) => a.chapter_number - b.chapter_number);
            for (let i = 0; i < sortedChapters.length; i++) {
                const expectedNumber = i + 1;
                if (sortedChapters[i].chapter_number !== expectedNumber) {
                    issues.push(`Chapter numbering gap: Expected chapter ${expectedNumber}, found chapter ${sortedChapters[i].chapter_number}`);
                }
            }
            
            // Check for chapters without titles
            const untitledChapters = chapters.filter(ch => !ch.title || ch.title.trim() === '');
            if (untitledChapters.length > 0) {
                warnings.push(`${untitledChapters.length} chapters without titles: ${untitledChapters.map(ch => ch.chapter_number).join(', ')}`);
            }
            
            // Check word count consistency
            const chaptersWithZeroWords = chapters.filter(ch => 
                (ch.status === 'drafted' || ch.status === 'final') && (!ch.word_count || ch.word_count === 0)
            );
            if (chaptersWithZeroWords.length > 0) {
                warnings.push(`Completed chapters with zero word count: ${chaptersWithZeroWords.map(ch => ch.chapter_number).join(', ')}`);
            }
            
            let resultText = `Consistency Check: ${book.title}\n\n`;
            
            if (issues.length === 0 && warnings.length === 0) {
                resultText += `✅ No consistency issues found!\n`;
            } else {
                if (issues.length > 0) {
                    resultText += `🚨 CRITICAL ISSUES:\n${issues.map(issue => `- ${issue}`).join('\n')}\n\n`;
                }
                if (warnings.length > 0) {
                    resultText += `⚠️ WARNINGS:\n${warnings.map(warning => `- ${warning}`).join('\n')}\n`;
                }
            }
            
            return {
                content: [{
                    type: 'text',
                    text: resultText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to validate book consistency: ${error.message}`);
        }
    }
}

export { BookMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Only log debug info if not in stdio mode
if (process.env.MCP_STDIO_MODE !== 'true') {
    console.error('[BOOK-SERVER] Module loaded');
}

// Convert paths to handle Windows path differences
const currentModuleUrl = import.meta.url;
const scriptPath = process.argv[1];
const normalizedScriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
const isDirectExecution = currentModuleUrl === normalizedScriptPath;

if (!process.env.MCP_STDIO_MODE && isDirectExecution) {
    console.error('[BOOK-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(BookMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[BOOK-SERVER] CLI runner failed:', error.message);
        process.exit(1);
    }
} else if (isDirectExecution) {
    // When running directly as MCP server (via Claude Desktop)
    console.error('[BOOK-SERVER] Running in MCP stdio mode - starting server...');
    
    // When in MCP stdio mode, ensure clean stdout for JSON messages
    if (process.env.MCP_STDIO_MODE === 'true') {
        console.error('[BOOK-SERVER] Setting up stdio mode handlers');
        // Redirect all console.log to stderr
        console.log = function(...args) {
            console.error('[BOOK-SERVER]', ...args);
        };
    }
    
    try {
        console.error('[BOOK-SERVER] Creating server instance...');
        const server = new BookMCPServer();
        console.error('[BOOK-SERVER] Server instance created, starting run()...');
        await server.run();
        console.error('[BOOK-SERVER] Server run() completed successfully');
    } catch (error) {
        console.error('[BOOK-SERVER] Failed to start MCP server:', error.message);
        console.error('[BOOK-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else {
    if (process.env.MCP_STDIO_MODE !== 'true') {
        console.error('[BOOK-SERVER] Module imported - not starting server');
    }
}