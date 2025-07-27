import { z } from 'zod';

/**
 * Configuration schema for Metaso MCP Server
 */
const ConfigSchema = z.object({
  /** Metaso API key (required) */
  apiKey: z.string().min(1, 'METASO_API_KEY is required'),
  /** Base URL for Metaso API */
  baseUrl: z.string().url().default('https://metaso.cn'),
  /** Request timeout in milliseconds */
  timeout: z.number().positive().default(30000),
  /** Enable debug logging */
  debug: z.boolean().default(false),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Validates API key format
 * Expected format: mk-[32 character alphanumeric string]
 */
const validateApiKeyFormat = (apiKey: string): boolean => {
  const apiKeyPattern = /^mk-[A-Z0-9]{32}$/;
  return apiKeyPattern.test(apiKey);
};

/**
 * Load and validate configuration from environment variables
 */
export const loadConfig = (): Config => {
  const rawConfig = {
    apiKey: process.env['METASO_API_KEY'],
    baseUrl: process.env['METASO_BASE_URL'],
    timeout: process.env['METASO_TIMEOUT']
      ? parseInt(process.env['METASO_TIMEOUT'], 10)
      : undefined,
    debug: process.env['METASO_DEBUG'] === 'true',
  };

  try {
    const config = ConfigSchema.parse(rawConfig);

    // Validate API key format
    if (!validateApiKeyFormat(config.apiKey)) {
      throw new Error(
        'Invalid API key format. Expected format: mk-[32 alphanumeric characters]'
      );
    }

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      throw new Error(`Configuration validation failed: ${issues}`);
    }
    throw error;
  }
};

/**
 * Mask sensitive information in API key for logging
 */
export const maskApiKey = (apiKey: string): string => {
  if (apiKey.length <= 8) {
    return '*'.repeat(apiKey.length);
  }
  return `${apiKey.slice(0, 3)}${'*'.repeat(apiKey.length - 6)}${apiKey.slice(-3)}`;
};

/**
 * Get configuration with error handling
 */
export const getConfig = (): Config => {
  try {
    return loadConfig();
  } catch (error) {
    console.error('Failed to load configuration:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

// Default export for convenience
export default getConfig; 