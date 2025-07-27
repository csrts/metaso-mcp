import { MetasoHttpClient } from '../utils/http-client';
import {
  ReaderRequest,
  ReaderResponse,
  validateReaderArgs,
  isUrlSafe,
} from '../types/requests';

/**
 * Metaso Reader Tool Implementation
 */
export class MetasoReaderTool {
  constructor(private httpClient: MetasoHttpClient) {}

  /**
   * Execute reader request
   */
  async read(args: unknown): Promise<ReaderResponse> {
    try {
      // Validate and parse arguments
      const request = validateReaderArgs(args);
      
      // Additional validation
      this.validateRequest(request);

      // Build API request payload
      const payload = this.buildReaderPayload(request);
      
      // Set appropriate Accept header based on format
      const headers = this.getRequestHeaders(request.format);

      // Call Metaso reader API
      const response = await this.httpClient.post<string | ReaderResponse>(
        '/api/v1/reader',
        payload,
        { headers }
      );

      // Format and return response
      return this.formatResponse(response, request);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Validate reader request
   */
  private validateRequest(request: ReaderRequest): void {
    // Validate URL safety
    if (!isUrlSafe(request.url)) {
      throw new Error('Invalid or unsafe URL. Only public HTTP/HTTPS URLs are allowed.');
    }

    // Additional URL validation
    try {
      const url = new URL(request.url);
      
      // Check URL length
      if (url.href.length > 2048) {
        throw new Error('URL is too long. Maximum length is 2048 characters.');
      }
      
      // Basic domain validation
      if (!url.hostname.includes('.')) {
        throw new Error('Invalid domain name.');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('URL')) {
        throw error;
      }
      throw new Error('Invalid URL format.');
    }
  }

  /**
   * Build reader API payload
   */
  private buildReaderPayload(request: ReaderRequest): Record<string, unknown> {
    return {
      url: request.url,
    };
  }

  /**
   * Get request headers based on format
   */
  private getRequestHeaders(format: 'markdown' | 'json'): Record<string, string> {
    return {
      'Accept': format === 'markdown' ? 'text/plain' : 'application/json',
    };
  }

  /**
   * Format API response
   */
  private formatResponse(
    response: string | ReaderResponse, 
    request: ReaderRequest
  ): ReaderResponse {
    // Handle markdown format response (plain text)
    if (typeof response === 'string') {
      return {
        content: response,
        url: request.url,
      };
    }

    // Handle JSON format response
    const formattedResponse: ReaderResponse = {
      ...response,
      url: request.url,
    };

    // Validate content length
    if (formattedResponse.content && formattedResponse.content.length > 1000000) {
      formattedResponse.content = formattedResponse.content.substring(0, 1000000) + '\n\n[Content truncated due to length...]';
    }

    return formattedResponse;
  }

  /**
   * Handle errors and return error response
   */
  private handleError(error: unknown): ReaderResponse {
    let errorMessage = 'An unexpected error occurred while reading the webpage.';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      error: errorMessage,
    };
  }

  /**
   * Get tool schema for MCP registration
   */
  static getToolSchema() {
    return {
      name: 'metaso_reader',
      description: 'Read and extract content from web pages using Metaso API. Returns the full text content of the specified webpage in markdown or JSON format.',
      inputSchema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            format: 'uri',
            description: 'URL of the webpage to read',
            pattern: '^https?://',
          },
          format: {
            type: 'string',
            enum: ['markdown', 'json'],
            default: 'markdown',
            description: 'Format of the returned content',
          },
        },
        required: ['url'],
      },
    };
  }
} 