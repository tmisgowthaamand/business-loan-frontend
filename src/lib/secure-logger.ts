/**
 * Secure Logger Service - Prevents sensitive data exposure in console logs
 */

class SecureLoggerService {
  private readonly isProduction = import.meta.env.PROD;
  private readonly isDevelopment = import.meta.env.DEV;

  // Sensitive data patterns to filter out
  private readonly sensitivePatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /key/i,
    /auth/i,
    /credential/i,
    /bearer/i,
    /jwt/i,
    /session/i,
  ];

  // Email and phone patterns
  private readonly piiPatterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
    /\b\d{10,15}\b/g, // Phone numbers
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card patterns
  ];

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      let sanitized = data;
      
      // Check for sensitive patterns
      for (const pattern of this.sensitivePatterns) {
        if (pattern.test(data)) {
          return '[REDACTED_SENSITIVE]';
        }
      }

      // Redact PII patterns
      for (const pattern of this.piiPatterns) {
        sanitized = sanitized.replace(pattern, '[REDACTED_PII]');
      }

      return sanitized;
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = Array.isArray(data) ? [] : {};
      
      for (const [key, value] of Object.entries(data)) {
        // Check if key contains sensitive information
        const isSensitiveKey = this.sensitivePatterns.some(pattern => pattern.test(key));
        
        if (isSensitiveKey) {
          sanitized[key] = '[REDACTED_SENSITIVE]';
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      
      return sanitized;
    }

    return data;
  }

  /**
   * Secure console.log replacement
   */
  log(message: string, data?: any): void {
    if (this.isProduction) {
      // In production, don't log anything to console
      return;
    }

    if (this.isDevelopment && data) {
      const sanitizedData = this.sanitizeData(data);
      console.log(`🔒 ${message}`, sanitizedData);
    } else {
      console.log(`🔒 ${message}`);
    }
  }

  /**
   * Secure console.error replacement
   */
  error(message: string, error?: any): void {
    if (this.isProduction) {
      // In production, only log essential error info
      console.error(`❌ ${message}`);
      return;
    }

    if (this.isDevelopment && error) {
      const sanitizedError = this.sanitizeData(error);
      console.error(`❌ ${message}`, sanitizedError);
    } else {
      console.error(`❌ ${message}`);
    }
  }

  /**
   * Secure console.warn replacement
   */
  warn(message: string, data?: any): void {
    if (this.isProduction) {
      return;
    }

    if (this.isDevelopment && data) {
      const sanitizedData = this.sanitizeData(data);
      console.warn(`⚠️ ${message}`, sanitizedData);
    } else {
      console.warn(`⚠️ ${message}`);
    }
  }

  /**
   * Debug logging (only in development)
   */
  debug(message: string, data?: any): void {
    if (!this.isDevelopment) {
      return;
    }

    if (data) {
      const sanitizedData = this.sanitizeData(data);
      console.debug(`🐛 ${message}`, sanitizedData);
    } else {
      console.debug(`🐛 ${message}`);
    }
  }

  /**
   * Network request logging (sanitized)
   */
  logRequest(method: string, url: string, data?: any): void {
    if (this.isProduction) {
      return;
    }

    const sanitizedData = data ? this.sanitizeData(data) : undefined;
    console.log(`🌐 ${method.toUpperCase()} ${url}`, sanitizedData);
  }

  /**
   * Authentication logging (highly sanitized)
   */
  logAuth(action: string, user?: any): void {
    if (this.isProduction) {
      return;
    }

    if (user) {
      // Only log non-sensitive user info
      const safeUserInfo = {
        id: user.id,
        role: user.role,
        // Don't log email, name, or other PII
      };
      console.log(`🔐 Auth: ${action}`, safeUserInfo);
    } else {
      console.log(`🔐 Auth: ${action}`);
    }
  }
}

export const secureLogger = new SecureLoggerService();
export default secureLogger;
