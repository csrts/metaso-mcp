import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
} from 'axios';
import { Config, maskApiKey } from './config';

/**
 * HTTP client for Metaso API with authentication and retry logic
 */
export class MetasoHttpClient {
  private client: AxiosInstance;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.client = this.createAxiosInstance();
  }

  /**
   * Create configured axios instance
   */
  private createAxiosInstance(): AxiosInstance {
    const client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    // Request interceptor for logging
    client.interceptors.request.use(
      config => {
        if (this.config.debug) {
          console.log('HTTP Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            headers: this.maskSensitiveHeaders(config.headers || {}),
          });
        }
        return config;
      },
      error => {
        console.error('HTTP Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    client.interceptors.response.use(
      response => {
        if (this.config.debug) {
          console.log('HTTP Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
          });
        }
        return response;
      },
      error => {
        this.logError(error);
        return Promise.reject(this.transformError(error));
      }
    );

    return client;
  }

  /**
   * Mask sensitive information in headers for logging
   */
  private maskSensitiveHeaders(headers: Record<string, unknown>): Record<string, unknown> {
    const masked = { ...headers };
    if (masked['Authorization'] && typeof masked['Authorization'] === 'string') {
      const [type, token] = masked['Authorization'].split(' ');
      if (token) {
        masked['Authorization'] = `${type} ${maskApiKey(token)}`;
      }
    }
    return masked;
  }

  /**
   * Log error with appropriate level of detail
   */
  private logError(error: AxiosError): void {
    const errorInfo = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
    };

    if (this.config.debug) {
      console.error('HTTP Error Details:', errorInfo);
      if (error.response?.data) {
        console.error('Error Response Data:', error.response.data);
      }
    } else {
      console.error('HTTP Error:', `${errorInfo.method} ${errorInfo.url} - ${errorInfo.status} ${errorInfo.statusText}`);
    }
  }

  /**
   * Transform axios error to a more user-friendly format
   */
  private transformError(error: AxiosError): Error {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const statusText = error.response.statusText;
      
      switch (status) {
        case 401:
          return new Error('Authentication failed. Please check your API key.');
        case 403:
          return new Error('Access forbidden. Your API key may not have the required permissions.');
        case 429:
          return new Error('Rate limit exceeded. Please try again later.');
        case 500:
          return new Error('Internal server error. Please try again later.');
        case 502:
        case 503:
        case 504:
          return new Error('Service temporarily unavailable. Please try again later.');
        default:
          return new Error(`HTTP ${status}: ${statusText}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      return new Error('Network error: Unable to connect to Metaso API. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      return new Error(`Request setup error: ${error.message}`);
    }
  }

  /**
   * Make a POST request with retry logic
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.requestWithRetry(async () => {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    });
  }

  /**
   * Make a GET request with retry logic
   */
  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.requestWithRetry(async () => {
      const response = await this.client.get<T>(url, config);
      return response.data;
    });
  }

  /**
   * Execute request with exponential backoff retry logic
   */
  private async requestWithRetry<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on certain error types
        if (this.shouldNotRetry(error)) {
          throw lastError;
        }

        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        
        if (this.config.debug) {
          console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        }

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Determine if an error should not be retried
   */
  private shouldNotRetry(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      // Don't retry on client errors (4xx) except for 429 (rate limit)
      if (status && status >= 400 && status < 500 && status !== 429) {
        return true;
      }
    }
    return false;
  }

  /**
   * Sleep for specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create HTTP client instance with configuration
 */
export const createHttpClient = (config: Config): MetasoHttpClient => {
  return new MetasoHttpClient(config);
};

export default MetasoHttpClient; 