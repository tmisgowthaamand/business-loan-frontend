/**
 * Input Sanitization Service - Prevents XSS and injection attacks
 */

class InputSanitizerService {
  // HTML entities to escape
  private readonly htmlEntities: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  // Dangerous patterns to remove
  private readonly dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi, // Remove event handlers like onclick, onload, etc.
  ];

  /**
   * Sanitize string input to prevent XSS
   */
  sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Remove dangerous patterns
    this.dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Escape HTML entities
    sanitized = sanitized.replace(/[&<>"'\/]/g, (char) => {
      return this.htmlEntities[char] || char;
    });

    return sanitized.trim();
  }

  /**
   * Sanitize email input
   */
  sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }

    // Basic email sanitization
    const sanitized = email
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, ''); // Only allow word chars, @, ., and -

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  /**
   * Sanitize phone number input
   */
  sanitizePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      return '';
    }

    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '').trim();
  }

  /**
   * Sanitize numeric input
   */
  sanitizeNumber(input: string | number): number {
    if (typeof input === 'number') {
      return isNaN(input) ? 0 : input;
    }

    if (typeof input === 'string') {
      const num = parseFloat(input.replace(/[^\d.-]/g, ''));
      return isNaN(num) ? 0 : num;
    }

    return 0;
  }

  /**
   * Sanitize form data object
   */
  sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    Object.keys(data).forEach(key => {
      const value = data[key];

      if (typeof value === 'string') {
        // Special handling for different field types
        if (key.toLowerCase().includes('email')) {
          sanitized[key] = this.sanitizeEmail(value);
        } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('mobile')) {
          sanitized[key] = this.sanitizePhone(value);
        } else if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('number')) {
          sanitized[key] = this.sanitizeNumber(value);
        } else {
          sanitized[key] = this.sanitizeString(value);
        }
      } else if (typeof value === 'number') {
        sanitized[key] = this.sanitizeNumber(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeString(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  /**
   * Validate and sanitize URL
   */
  sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      return '';
    }

    // Remove dangerous protocols
    const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:'];
    const lowerUrl = url.toLowerCase();
    
    for (const protocol of dangerousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        return '';
      }
    }

    // Only allow http, https, and relative URLs
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      return url.trim();
    }

    return '';
  }
}

export const inputSanitizer = new InputSanitizerService();
export default inputSanitizer;
