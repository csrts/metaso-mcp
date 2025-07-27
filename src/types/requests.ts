import { z } from 'zod';

/**
 * Search request schema and types
 */
export const SearchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required').describe('搜索查询内容'),
  scope: z
    .enum(['webpage', 'document', 'scholar', 'image', 'video', 'podcast'])
    .default('webpage')
    .describe('搜索范围'),
  page: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('页数（与size互斥）'),
  size: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('结果数量（与page互斥）'),
  include_summary: z
    .boolean()
    .default(true)
    .describe('是否包含AI摘要'),
  include_row_content: z
    .boolean()
    .default(false)
    .describe('是否包含原文内容'),
}).refine(
  data => !(data.page && data.size),
  {
    message: 'page和size参数不能同时使用',
    path: ['page'],
  }
);

export type SearchRequest = z.infer<typeof SearchRequestSchema>;

/**
 * Reader request schema and types
 */
export const ReaderRequestSchema = z.object({
  url: z
    .string()
    .url('Invalid URL format')
    .describe('要读取的网页URL'),
  format: z
    .enum(['markdown', 'json'])
    .default('markdown')
    .describe('返回格式'),
});

export type ReaderRequest = z.infer<typeof ReaderRequestSchema>;

/**
 * Chat request schema and types
 */
export const ChatRequestSchema = z.object({
  query: z.string().min(1, 'Query is required').describe('问答查询内容'),
  model: z
    .enum(['fast', 'fast_thinking', 'ds-r1'])
    .default('fast')
    .describe('使用的模型'),
  scope: z
    .enum(['document', 'scholar', 'video', 'podcast'])
    .optional()
    .describe('搜索范围（网页为默认，无需指定）'),
  format: z
    .enum(['chat_completions', 'simple'])
    .default('chat_completions')
    .describe('响应格式'),
  stream: z
    .boolean()
    .default(false)
    .describe('是否启用流式输出'),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/**
 * Common API response types
 */
export interface ApiError {
  error: string;
  message?: string;
  code?: string;
}

/**
 * Search API response types
 */
export interface SearchResult {
  title?: string;
  url?: string;
  snippet?: string;
  content?: string;
}

export interface SearchResponse {
  results?: SearchResult[];
  summary?: string;
  total?: number;
  page?: number;
  per_page?: number;
  error?: string;
}

/**
 * Reader API response types
 */
export interface ReaderResponse {
  content?: string;
  title?: string;
  url?: string;
  error?: string;
}

/**
 * Chat API response types
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: Array<{
    index?: number;
    message?: ChatMessage;
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: string;
}

export interface SimpleChatResponse {
  answer?: string;
  sources?: string[];
  error?: string;
}

/**
 * MCP Tool argument validation helpers
 */
export const validateSearchArgs = (args: unknown): SearchRequest => {
  return SearchRequestSchema.parse(args);
};

export const validateReaderArgs = (args: unknown): ReaderRequest => {
  return ReaderRequestSchema.parse(args);
};

export const validateChatArgs = (args: unknown): ChatRequest => {
  return ChatRequestSchema.parse(args);
};

/**
 * URL safety validation
 */
export const isUrlSafe = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    
    // Block localhost and private IP ranges
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Block localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return false;
    }
    
    // Block private IP ranges (basic check)
    if (hostname.startsWith('10.') || 
        hostname.startsWith('192.168.') || 
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
      return false;
    }
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Query length validation
 */
export const validateQueryLength = (query: string, maxLength: number = 1000): boolean => {
  return query.length <= maxLength;
}; 