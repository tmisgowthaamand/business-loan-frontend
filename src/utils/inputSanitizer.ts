/**
 * Input sanitization utilities for XSS prevention
 */

export class InputSanitizer {
  /**
   * Sanitize string input to prevent XSS attacks
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim();
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(html: string): string {
    if (typeof html !== 'string') return '';
    
    // Remove dangerous HTML elements and attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '');
  }

  /**
   * Validate and sanitize email input
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return '';
    
    const sanitized = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  /**
   * Validate and sanitize phone number
   */
  static sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') return '';
    
    // Remove all non-digits
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Validate length (10 digits for Indian mobile numbers)
    return digitsOnly.length === 10 ? digitsOnly : '';
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: string | number, min?: number, max?: number): number | null {
    let num: number;
    
    if (typeof input === 'string') {
      // Remove non-numeric characters except decimal point
      const cleaned = input.replace(/[^\d.-]/g, '');
      num = parseFloat(cleaned);
    } else {
      num = input;
    }
    
    if (isNaN(num)) return null;
    
    // Apply min/max constraints
    if (min !== undefined && num < min) return null;
    if (max !== undefined && num > max) return null;
    
    return num;
  }

  /**
   * Sanitize URL input
   */
  static sanitizeUrl(url: string): string {
    if (typeof url !== 'string') return '';
    
    try {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return '';
      }
      
      return urlObj.toString();
    } catch {
      return '';
    }
  }

  /**
   * Sanitize file name
   */
  static sanitizeFileName(fileName: string): string {
    if (typeof fileName !== 'string') return '';
    
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/\.+/g, '.') // Replace multiple dots with single dot
      .replace(/^\./, '') // Remove leading dot
      .substring(0, 255); // Limit length
  }

  /**
   * Validate file type against allowed extensions
   */
  static validateFileType(fileName: string, allowedTypes: string[]): boolean {
    if (!fileName || !allowedTypes.length) return false;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }

  /**
   * Sanitize search query
   */
  static sanitizeSearchQuery(query: string): string {
    if (typeof query !== 'string') return '';
    
    return query
      .replace(/[<>'"]/g, '') // Remove dangerous characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Limit length
  }

  /**
   * Escape HTML entities
   */
  static escapeHtml(text: string): string {
    if (typeof text !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Validate and sanitize form data
   */
  static sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'number') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeString(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}
