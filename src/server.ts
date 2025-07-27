import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { getConfig, createHttpClient } from './utils';
import { MetasoSearchTool, MetasoReaderTool, MetasoChatTool } from './tools';

/**
 * Metaso MCP Server Implementation
 */
export class MetasoMcpServer {
  private server: Server;
  private searchTool: MetasoSearchTool;
  private readerTool: MetasoReaderTool;
  private chatTool: MetasoChatTool;

  constructor() {
    // Load configuration
    const config = getConfig();
    
    // Create HTTP client
    const httpClient = createHttpClient(config);

    // Initialize tools
    this.searchTool = new MetasoSearchTool(httpClient);
    this.readerTool = new MetasoReaderTool(httpClient);
    this.chatTool = new MetasoChatTool(httpClient);

    // Create MCP server
    this.server = new Server(
      {
        name: 'metaso-mcp-server',
        version: '1.0.0',
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Setup MCP server handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'metaso_search':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await this.searchTool.search(args), null, 2),
                },
              ],
            };

          case 'metaso_reader':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await this.readerTool.read(args), null, 2),
                },
              ],
            };

          case 'metaso_chat':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await this.chatTool.chat(args), null, 2),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: errorMessage }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Get list of available tools with their schemas
   */
  private getAvailableTools(): Tool[] {
    return [
      MetasoSearchTool.getToolSchema() as Tool,
      MetasoReaderTool.getToolSchema() as Tool,
      MetasoChatTool.getToolSchema() as Tool,
    ];
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    
    try {
      await this.server.connect(transport);
      
      // Log server start (to stderr to avoid interfering with stdio protocol)
      console.error('Metaso MCP Server started successfully');
      console.error('Available tools:', this.getAvailableTools().map(tool => tool.name).join(', '));
    } catch (error) {
      console.error('Failed to start Metaso MCP Server:', error);
      throw error;
    }
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    try {
      await this.server.close();
      console.error('Metaso MCP Server stopped');
    } catch (error) {
      console.error('Error stopping Metaso MCP Server:', error);
      throw error;
    }
  }
}

/**
 * Create and configure MCP server instance
 */
export const createMetasoMcpServer = (): MetasoMcpServer => {
  return new MetasoMcpServer();
};

export default MetasoMcpServer; 