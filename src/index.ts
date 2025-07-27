#!/usr/bin/env node

/**
 * Metaso MCP Server
 * Main entry point for the MCP server
 */

import { createMetasoMcpServer } from './server';

/**
 * Main function to start the MCP server
 */
async function main(): Promise<void> {
  try {
    // Create server instance
    const server = createMetasoMcpServer();
    
    // Setup graceful shutdown handlers
    const cleanup = async (): Promise<void> => {
      console.error('Shutting down Metaso MCP Server...');
      try {
        await server.stop();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle process signals for graceful shutdown
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('SIGQUIT', cleanup);

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      cleanup().catch(() => {
        process.exit(1);
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      cleanup().catch(() => {
        process.exit(1);
      });
    });

    // Start the MCP server
    await server.start();
    
    // Keep the process running
    // The server will handle stdio communication
    
  } catch (error) {
    console.error('Failed to start Metaso MCP Server:', error);
    
    // Print configuration help on common errors
    if (error instanceof Error) {
      if (error.message.includes('METASO_API_KEY')) {
        console.error('\nConfiguration Help:');
        console.error('Please ensure the METASO_API_KEY environment variable is set.');
        console.error('Example: export METASO_API_KEY="mk-YOUR_API_KEY_HERE"');
      } else if (error.message.includes('Configuration validation failed')) {
        console.error('\nConfiguration Help:');
        console.error('Please check your environment variables:');
        console.error('- METASO_API_KEY (required): Your Metaso API key');
        console.error('- METASO_BASE_URL (optional): API base URL (default: https://metaso.cn)');
        console.error('- METASO_TIMEOUT (optional): Request timeout in milliseconds (default: 30000)');
        console.error('- METASO_DEBUG (optional): Enable debug logging (default: false)');
      }
    }
    
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };
export default main; 