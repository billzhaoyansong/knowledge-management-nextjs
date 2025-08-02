import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import { 
  StrapiError, 
  StrapiConnectionError, 
  StrapiAuthenticationError,
  StrapiTimeoutError,
  handleStrapiError 
} from '../types/errors';

export interface HttpClientConfig {
  baseURL: string;
  apiToken?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableLogging?: boolean;
}

export interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipRetry?: boolean;
}

export class HttpClient {
  private client: AxiosInstance;
  private readonly config: Required<HttpClientConfig>;

  constructor(config: HttpClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      apiToken: config.apiToken || '',
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      enableLogging: config.enableLogging || process.env.NODE_ENV === 'development',
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication header if not skipped and token is available
        if (!config.skipAuth && this.config.apiToken) {
          config.headers.Authorization = `Bearer ${this.config.apiToken}`;
        }

        // Remove custom properties that shouldn't be sent to axios
        delete config.skipAuth;
        delete config.skipRetry;

        if (this.config.enableLogging) {
          console.log(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        if (this.config.enableLogging) {
          console.error('HTTP Request Error:', error);
        }
        return Promise.reject(handleStrapiError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (this.config.enableLogging) {
          console.log(`HTTP Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RequestOptions;

        if (this.config.enableLogging) {
          console.error('HTTP Response Error:', error.response?.status, error.message);
        }

        // Handle retries for certain error conditions
        if (
          !originalRequest?.skipRetry &&
          originalRequest &&
          this.shouldRetry(error) &&
          !originalRequest._retryCount
        ) {
          originalRequest._retryCount = 0;
        }

        if (
          originalRequest &&
          originalRequest._retryCount !== undefined &&
          originalRequest._retryCount < this.config.retryAttempts &&
          this.shouldRetry(error)
        ) {
          originalRequest._retryCount++;
          
          const delay = this.config.retryDelay * Math.pow(2, originalRequest._retryCount - 1);
          
          if (this.config.enableLogging) {
            console.log(`Retrying request (attempt ${originalRequest._retryCount}) after ${delay}ms...`);
          }

          await this.sleep(delay);
          return this.client(originalRequest);
        }

        return Promise.reject(handleStrapiError(error));
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors, timeouts, or 5xx server errors
    return (
      !error.response || // Network error
      error.code === 'ECONNABORTED' || // Timeout
      (error.response.status >= 500 && error.response.status < 600) // Server error
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP method wrappers
  async get<T = any>(url: string, options?: RequestOptions): Promise<T> {
    try {
      const response = await this.client.get<T>(url, options);
      return response.data;
    } catch (error) {
      throw handleStrapiError(error);
    }
  }

  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, options);
      return response.data;
    } catch (error) {
      throw handleStrapiError(error);
    }
  }

  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, options);
      return response.data;
    } catch (error) {
      throw handleStrapiError(error);
    }
  }

  async patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, options);
      return response.data;
    } catch (error) {
      throw handleStrapiError(error);
    }
  }

  async delete<T = any>(url: string, options?: RequestOptions): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, options);
      return response.data;
    } catch (error) {
      throw handleStrapiError(error);
    }
  }

  // Utility methods
  updateToken(token: string): void {
    this.config.apiToken = token;
  }

  getBaseURL(): string {
    return this.config.baseURL;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/', { skipAuth: true, skipRetry: true });
      return true;
    } catch (error) {
      if (this.config.enableLogging) {
        console.error('Health check failed:', error);
      }
      return false;
    }
  }

  // Build query string from parameters
  buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else if (typeof value === 'object') {
          searchParams.set(key, JSON.stringify(value));
        } else {
          searchParams.set(key, String(value));
        }
      }
    });

    return searchParams.toString();
  }
}

// Extend AxiosRequestConfig to include custom properties
declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    skipRetry?: boolean;
    _retryCount?: number;
  }
}