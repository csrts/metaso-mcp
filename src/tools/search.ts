import { MetasoHttpClient } from '../utils/http-client';
import {
  SearchRequest,
  SearchResponse,
  validateSearchArgs,
  isUrlSafe,
  validateQueryLength,
} from '../types/requests';

/**
 * Metaso Search Tool Implementation
 */
export class MetasoSearchTool {
  constructor(private httpClient: MetasoHttpClient) {}

  /**
   * Execute search request
   */
  async search(args: unknown): Promise<SearchResponse> {
    try {
      // Validate and parse arguments
      const request = validateSearchArgs(args);
      
      // Additional validation
      this.validateRequest(request);

      // Build API request payload
      const payload = this.buildSearchPayload(request);

      // Call Metaso search API
      const response = await this.httpClient.post<SearchResponse>(
        '/api/v1/search',
        payload
      );

      // Format and return response
      return this.formatResponse(response, request);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Validate search request
   */
  private validateRequest(request: SearchRequest): void {
    // Validate query length
    if (!validateQueryLength(request.query)) {
      throw new Error('Query is too long. Maximum length is 1000 characters.');
    }

    // Validate pagination parameters
    if (request.page && request.page > 100) {
      throw new Error('Page number cannot exceed 100.');
    }

    if (request.size && request.size > 50) {
      throw new Error('Size cannot exceed 50 results per request.');
    }
  }

  /**
   * Build search API payload
   */
  private buildSearchPayload(request: SearchRequest): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      q: request.query,
      scope: request.scope,
      includeSummary: request.include_summary,
      includeRowContent: request.include_row_content,
    };

    // Add pagination (mutually exclusive)
    if (request.page) {
      payload['page'] = request.page;
    } else if (request.size) {
      payload['size'] = request.size;
    }

    return payload;
  }

  /**
   * Format API response
   */
  private formatResponse(response: SearchResponse, request: SearchRequest): SearchResponse {
    // Validate URLs in search results for security
    if (response.results) {
      response.results = response.results.filter(result => !result.url || isUrlSafe(result.url));
    }

    // Add metadata
    const formattedResponse: SearchResponse = {
      ...response,
      // Add query info for context
      ...(request.scope !== 'webpage' && { scope: request.scope }),
    };

    return formattedResponse;
  }

  /**
   * Handle errors and return error response
   */
  private handleError(error: unknown): SearchResponse {
    let errorMessage = 'An unexpected error occurred during search.';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      error: errorMessage,
      results: [],
    };
  }

  /**
   * Get tool schema for MCP registration
   */
  static getToolSchema() {
    return {
      name: 'metaso_search',
      description: 'Search the internet using Metaso AI search engine. Supports multiple search scopes including webpages, documents, academic papers, images, videos, and podcasts.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query content',
            minLength: 1,
            maxLength: 1000,
          },
          scope: {
            type: 'string',
            enum: ['webpage', 'document', 'scholar', 'image', 'video', 'podcast'],
            default: 'webpage',
            description: 'Search scope/domain',
          },
          page: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            description: 'Page number for pagination (mutually exclusive with size)',
          },
          size: {
            type: 'number',
            minimum: 1,
            maximum: 50,
            description: 'Number of results to return (mutually exclusive with page)',
          },
          include_summary: {
            type: 'boolean',
            default: true,
            description: 'Whether to include AI-generated summary',
          },
          include_row_content: {
            type: 'boolean',
            default: false,
            description: 'Whether to include raw webpage content',
          },
        },
        required: ['query'],
        not: {
          allOf: [
            { required: ['page'] },
            { required: ['size'] }
          ]
        }
      },
    };
  }
} 