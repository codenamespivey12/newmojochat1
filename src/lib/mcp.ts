// MCP (Model Context Protocol) integration for sixtyoneeighty
// Integrates with Exa, Context7, and Sequential Thinking servers

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolResult {
  content: string;
  isError?: boolean;
  metadata?: Record<string, any>;
}

// Exa MCP Server Integration
export class ExaMCP {
  private static baseUrl = 'http://localhost:3001'; // Exa MCP server port
  
  static async searchWeb(query: string, options?: {
    numResults?: number;
    includeDomains?: string[];
    excludeDomains?: string[];
    startCrawlDate?: string;
    endCrawlDate?: string;
  }): Promise<MCPToolResult> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXA_API_KEY}`,
        },
        body: JSON.stringify({
          query,
          numResults: options?.numResults || 10,
          includeDomains: options?.includeDomains,
          excludeDomains: options?.excludeDomains,
          startCrawlDate: options?.startCrawlDate,
          endCrawlDate: options?.endCrawlDate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Exa search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: JSON.stringify(data.results, null, 2),
        metadata: {
          source: 'exa',
          query,
          numResults: data.results?.length || 0,
        },
      };
    } catch (error) {
      return {
        content: `Error searching with Exa: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isError: true,
        metadata: { source: 'exa', query },
      };
    }
  }

  static async getContents(urls: string[]): Promise<MCPToolResult> {
    try {
      const response = await fetch(`${this.baseUrl}/contents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXA_API_KEY}`,
        },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        throw new Error(`Exa contents failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: JSON.stringify(data.contents, null, 2),
        metadata: {
          source: 'exa',
          urls,
          numContents: data.contents?.length || 0,
        },
      };
    } catch (error) {
      return {
        content: `Error getting contents from Exa: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isError: true,
        metadata: { source: 'exa', urls },
      };
    }
  }
}

// Context7 MCP Server Integration
export class Context7MCP {
  private static baseUrl = 'http://localhost:3002'; // Context7 MCP server port
  
  static async resolveLibraryId(libraryName: string): Promise<MCPToolResult> {
    try {
      const response = await fetch(`${this.baseUrl}/resolve-library-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ libraryName }),
      });

      if (!response.ok) {
        throw new Error(`Context7 resolve failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: JSON.stringify(data, null, 2),
        metadata: {
          source: 'context7',
          libraryName,
          libraryId: data.libraryId,
        },
      };
    } catch (error) {
      return {
        content: `Error resolving library ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isError: true,
        metadata: { source: 'context7', libraryName },
      };
    }
  }

  static async getLibraryDocs(
    libraryId: string,
    options?: {
      topic?: string;
      tokens?: number;
    }
  ): Promise<MCPToolResult> {
    try {
      const response = await fetch(`${this.baseUrl}/get-library-docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context7CompatibleLibraryID: libraryId,
          topic: options?.topic,
          tokens: options?.tokens || 10000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Context7 docs failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.documentation || 'No documentation found',
        metadata: {
          source: 'context7',
          libraryId,
          topic: options?.topic,
          tokens: options?.tokens,
        },
      };
    } catch (error) {
      return {
        content: `Error getting library docs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isError: true,
        metadata: { source: 'context7', libraryId },
      };
    }
  }
}

// Sequential Thinking MCP Server Integration
export class SequentialThinkingMCP {
  private static baseUrl = 'http://localhost:3003'; // Sequential Thinking MCP server port
  
  static async think(
    thought: string,
    options?: {
      thoughtNumber?: number;
      totalThoughts?: number;
      nextThoughtNeeded?: boolean;
      isRevision?: boolean;
      revisesThought?: number;
    }
  ): Promise<MCPToolResult> {
    try {
      const response = await fetch(`${this.baseUrl}/think`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thought,
          thoughtNumber: options?.thoughtNumber || 1,
          totalThoughts: options?.totalThoughts || 5,
          nextThoughtNeeded: options?.nextThoughtNeeded ?? true,
          isRevision: options?.isRevision || false,
          revisesThought: options?.revisesThought,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sequential Thinking failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.result || data.thought || 'Thinking process completed',
        metadata: {
          source: 'sequential-thinking',
          thoughtNumber: options?.thoughtNumber,
          totalThoughts: options?.totalThoughts,
          nextThoughtNeeded: data.nextThoughtNeeded,
        },
      };
    } catch (error) {
      return {
        content: `Error in sequential thinking: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isError: true,
        metadata: { source: 'sequential-thinking' },
      };
    }
  }
}

// Main MCP Manager
export class MCPManager {
  static async callTool(toolCall: MCPToolCall): Promise<MCPToolResult> {
    const { name, arguments: args } = toolCall;

    switch (name) {
      // Exa tools
      case 'exa_search':
        return ExaMCP.searchWeb(args.query, {
          numResults: args.numResults,
          includeDomains: args.includeDomains,
          excludeDomains: args.excludeDomains,
          startCrawlDate: args.startCrawlDate,
          endCrawlDate: args.endCrawlDate,
        });
      
      case 'exa_get_contents':
        return ExaMCP.getContents(args.urls);

      // Context7 tools
      case 'context7_resolve_library':
        return Context7MCP.resolveLibraryId(args.libraryName);
      
      case 'context7_get_docs':
        return Context7MCP.getLibraryDocs(args.libraryId, {
          topic: args.topic,
          tokens: args.tokens,
        });

      // Sequential Thinking tools
      case 'sequential_thinking':
        return SequentialThinkingMCP.think(args.thought, {
          thoughtNumber: args.thoughtNumber,
          totalThoughts: args.totalThoughts,
          nextThoughtNeeded: args.nextThoughtNeeded,
          isRevision: args.isRevision,
          revisesThought: args.revisesThought,
        });

      default:
        return {
          content: `Unknown tool: ${name}`,
          isError: true,
          metadata: { toolName: name },
        };
    }
  }

  static getAvailableTools(): MCPTool[] {
    return [
      {
        name: 'exa_search',
        description: 'Search the web using Exa API for high-quality, relevant results',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            numResults: { type: 'number', description: 'Number of results (default: 10)' },
            includeDomains: { type: 'array', items: { type: 'string' }, description: 'Domains to include' },
            excludeDomains: { type: 'array', items: { type: 'string' }, description: 'Domains to exclude' },
            startCrawlDate: { type: 'string', description: 'Start date for crawl (YYYY-MM-DD)' },
            endCrawlDate: { type: 'string', description: 'End date for crawl (YYYY-MM-DD)' },
          },
          required: ['query'],
        },
      },
      {
        name: 'exa_get_contents',
        description: 'Get full content from specific URLs using Exa',
        inputSchema: {
          type: 'object',
          properties: {
            urls: { type: 'array', items: { type: 'string' }, description: 'URLs to get content from' },
          },
          required: ['urls'],
        },
      },
      {
        name: 'context7_resolve_library',
        description: 'Resolve a library name to Context7-compatible library ID',
        inputSchema: {
          type: 'object',
          properties: {
            libraryName: { type: 'string', description: 'Name of the library to resolve' },
          },
          required: ['libraryName'],
        },
      },
      {
        name: 'context7_get_docs',
        description: 'Get documentation for a library using Context7',
        inputSchema: {
          type: 'object',
          properties: {
            libraryId: { type: 'string', description: 'Context7-compatible library ID' },
            topic: { type: 'string', description: 'Specific topic to focus on' },
            tokens: { type: 'number', description: 'Maximum tokens to retrieve (default: 10000)' },
          },
          required: ['libraryId'],
        },
      },
      {
        name: 'sequential_thinking',
        description: 'Use sequential thinking for complex problem-solving',
        inputSchema: {
          type: 'object',
          properties: {
            thought: { type: 'string', description: 'Current thought or reasoning step' },
            thoughtNumber: { type: 'number', description: 'Current thought number' },
            totalThoughts: { type: 'number', description: 'Estimated total thoughts needed' },
            nextThoughtNeeded: { type: 'boolean', description: 'Whether another thought is needed' },
            isRevision: { type: 'boolean', description: 'Whether this revises previous thinking' },
            revisesThought: { type: 'number', description: 'Which thought number is being revised' },
          },
          required: ['thought'],
        },
      },
    ];
  }
}
