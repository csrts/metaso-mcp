import { MetasoHttpClient } from '../utils/http-client';
import {
  ChatRequest,
  ChatCompletionResponse,
  SimpleChatResponse,
  ChatMessage,
  validateChatArgs,
  validateQueryLength,
} from '../types/requests';

/**
 * Metaso Chat Tool Implementation
 */
export class MetasoChatTool {
  constructor(private httpClient: MetasoHttpClient) {}

  /**
   * Execute chat request
   */
  async chat(args: unknown): Promise<ChatCompletionResponse | SimpleChatResponse> {
    try {
      // Validate and parse arguments
      const request = validateChatArgs(args);
      
      // Additional validation
      this.validateRequest(request);

      // Build API request payload
      const payload = this.buildChatPayload(request);

      // Call Metaso chat API
      const response = await this.httpClient.post<ChatCompletionResponse | SimpleChatResponse>(
        '/api/v1/chat/completions',
        payload
      );

      // Format and return response
      return this.formatResponse(response, request);
    } catch (error) {
      return this.handleError(error, 'chat_completions');
    }
  }

  /**
   * Validate chat request
   */
  private validateRequest(request: ChatRequest): void {
    // Validate query length
    if (!validateQueryLength(request.query)) {
      throw new Error('Query is too long. Maximum length is 1000 characters.');
    }
  }

  /**
   * Build chat API payload
   */
  private buildChatPayload(request: ChatRequest): Record<string, unknown> {
    if (request.format === 'simple') {
      // Simple format payload
      const payload: Record<string, unknown> = {
        q: request.query,
        model: request.model,
        format: 'simple',
      };

      // Add scope if specified (not for webpage which is default)
      if (request.scope) {
        payload['scope'] = request.scope;
      }

      return payload;
    } else {
      // Chat completions format payload
      const payload: Record<string, unknown> = {
        model: request.model,
        stream: request.stream,
        messages: [
          {
            role: 'user',
            content: request.query,
          } as ChatMessage,
        ],
      };

      // Add scope if specified (not for webpage which is default)
      if (request.scope) {
        payload['scope'] = request.scope;
      }

      return payload;
    }
  }

  /**
   * Format API response
   */
  private formatResponse(
    response: ChatCompletionResponse | SimpleChatResponse, 
    request: ChatRequest
  ): ChatCompletionResponse | SimpleChatResponse {
    // Add metadata based on format
    if (request.format === 'simple') {
      const simpleResponse = response as SimpleChatResponse;
      return {
        ...simpleResponse,
        // Add query context if needed
      };
    } else {
      const chatResponse = response as ChatCompletionResponse;
      return {
        ...chatResponse,
        // Ensure model is set
        model: chatResponse.model || request.model,
      };
    }
  }

  /**
   * Handle errors and return error response
   */
  private handleError(
    error: unknown, 
    format: 'chat_completions' | 'simple'
  ): ChatCompletionResponse | SimpleChatResponse {
    let errorMessage = 'An unexpected error occurred during AI chat.';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    if (format === 'simple') {
      return {
        error: errorMessage,
      } as SimpleChatResponse;
    } else {
      return {
        error: errorMessage,
        choices: [],
      } as ChatCompletionResponse;
    }
  }

  /**
   * Get tool schema for MCP registration
   */
  static getToolSchema() {
    return {
      name: 'metaso_chat',
      description: 'Chat with Metaso AI assistant. Get intelligent responses based on search-enhanced AI models. Supports multiple models and output formats.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Question or prompt for the AI assistant',
            minLength: 1,
            maxLength: 1000,
          },
          model: {
            type: 'string',
            enum: ['fast', 'fast_thinking', 'ds-r1'],
            default: 'fast',
            description: 'AI model to use for the response',
          },
          scope: {
            type: 'string',
            enum: ['document', 'scholar', 'video', 'podcast'],
            description: 'Search scope for enhanced responses (webpage is default)',
          },
          format: {
            type: 'string',
            enum: ['chat_completions', 'simple'],
            default: 'chat_completions',
            description: 'Response format',
          },
          stream: {
            type: 'boolean',
            default: false,
            description: 'Enable streaming output (for compatible formats)',
          },
        },
        required: ['query'],
      },
    };
  }
} 