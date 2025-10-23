import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG, getFullUrl, isProduction } from '../config/api.config';

// Enhanced API client for production deployments
class ApiClient {
  private client: AxiosInstance;
  private retryCount = 0;
  private maxRetries = API_CONFIG.RETRY_ATTEMPTS;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.DEFAULT_HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add timestamp to prevent caching issues
        if (config.method === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now(),
          };
        }

        // Log requests in development
        if (!isProduction()) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }

        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor with retry logic
    this.client.interceptors.response.use(
      (response) => {
        // Reset retry count on successful response
        this.retryCount = 0;

        // Log responses in development
        if (!isProduction()) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Log errors
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });

        // Retry logic for network errors and 5xx errors
        if (
          !originalRequest._retry &&
          this.retryCount < this.maxRetries &&
          this.shouldRetry(error)
        ) {
          originalRequest._retry = true;
          this.retryCount++;

          console.log(`🔄 Retrying request (${this.retryCount}/${this.maxRetries}): ${originalRequest.url}`);

          // Wait before retrying
          await this.delay(API_CONFIG.RETRY_DELAY * this.retryCount);

          return this.client(originalRequest);
        }

        // Reset retry count after max retries
        this.retryCount = 0;

        return Promise.reject(this.enhanceError(error));
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors
    if (!error.response) {
      return true;
    }

    // Retry on 5xx server errors
    if (error.response.status >= 500) {
      return true;
    }

    // Retry on specific 4xx errors
    if (error.response.status === 408 || error.response.status === 429) {
      return true;
    }

    return false;
  }

  private enhanceError(error: AxiosError) {
    const enhancedError = {
      ...error,
      isNetworkError: !error.response,
      isServerError: error.response?.status ? error.response.status >= 500 : false,
      isClientError: error.response?.status ? error.response.status >= 400 && error.response.status < 500 : false,
      userMessage: this.getUserFriendlyMessage(error),
    };

    return enhancedError;
  }

  private getUserFriendlyMessage(error: AxiosError): string {
    if (!error.response) {
      return 'Network error. Please check your internet connection and try again.';
    }

    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in and try again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found. The requested item may have been deleted.';
      case 408:
        return 'Request timeout. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service maintenance in progress. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }

  // File upload with progress
  async uploadFile<T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<AxiosResponse<T>> {
    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/api/health/ping');
      return response.status === 200;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }

  // Get client configuration
  getConfig() {
    return {
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      maxRetries: this.maxRetries,
      isProduction: isProduction(),
    };
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export for direct use
export default apiClient;

// Export types
export type { AxiosResponse, AxiosError, AxiosRequestConfig };
