/**
 * Production-safe logging utility for frontend
 * Prevents sensitive data from being logged in production
 */
export class SecureLogger {
  private static isProduction = import.meta.env.PROD;
  private static isDevelopment = import.meta.env.DEV;

  /**
   * Safe console.log replacement
   */
  static log(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(message, data);
    }
  }

  /**
   * Safe console.error replacement
   */
  static error(message: string, error?: any) {
    if (this.isProduction) {
      // In production, log only sanitized error messages
      console.error(this.sanitizeMessage(message));
    } else {
      console.error(message, error);
    }
  }

  /**
   * Safe console.warn replacement
   */
  static warn(message: string, data?: any) {
    if (this.isDevelopment) {
      console.warn(message, data);
    }
  }

  /**
   * Safe console.debug replacement
   */
  static debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(message, data);
    }
  }

  /**
   * Safe API logging - removes sensitive data
   */
  static apiLog(method: string, url: string, status?: number, data?: any) {
    if (this.isDevelopment) {
      console.log(`API: ${method} ${url} - ${status || 'pending'}`, data);
    } else if (this.isProduction) {
      // Log only basic API info in production
      console.log(`API: ${method} ${this.sanitizeUrl(url)} - ${status || 'pending'}`);
    }
  }

  /**
   * Safe authentication logging
   */
  static authLog(message: string, email?: string) {
    if (this.isDevelopment) {
      console.log(`AUTH: ${message}`, { email });
    } else if (this.isProduction) {
      const sanitizedEmail = email ? email.substring(0, 3) + '***' : 'unknown';
      console.log(`AUTH: ${message} for user: ${sanitizedEmail}`);
    }
  }

  /**
   * Performance logging (allowed in production)
   */
  static performance(message: string, timing?: number) {
    console.log(`PERF: ${message}${timing ? ` (${timing}ms)` : ''}`);
  }

  /**
   * Sanitize error messages for production
   */
  private static sanitizeMessage(message: string): string {
    // Remove potential sensitive data patterns
    return message
      .replace(/password[=:]\s*[^\s&]+/gi, 'password=***')
      .replace(/token[=:]\s*[^\s&]+/gi, 'token=***')
      .replace(/key[=:]\s*[^\s&]+/gi, 'key=***')
      .replace(/email[=:]\s*[^\s&]+/gi, 'email=***')
      .replace(/\b\d{10,}\b/g, '***') // Remove long numbers (potential IDs)
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '***@***.***'); // Remove emails
  }

  /**
   * Sanitize URLs for production logging
   */
  private static sanitizeUrl(url: string): string {
    // Remove query parameters that might contain sensitive data
    return url.split('?')[0];
  }

  /**
   * Create a production-safe console replacement
   */
  static createSafeConsole() {
    if (this.isProduction) {
      return {
        log: () => {}, // Disable all console.log in production
        error: (message: string, error?: any) => console.error(this.sanitizeMessage(message)),
        warn: () => {}, // Disable warnings in production
        debug: () => {}, // Disable debug in production
        info: () => {}, // Disable info in production
      };
    }
    return console; // Return normal console in development
  }
}
