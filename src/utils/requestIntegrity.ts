/**
 * Request integrity and security utilities
 */

export class RequestIntegrity {
  /**
   * Generate request signature for API calls
   */
  static async generateSignature(method: string, url: string, body?: any): Promise<string> {
    const timestamp = Date.now().toString();
    const nonce = crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
    
    let payload = `${method.toUpperCase()}|${url}|${timestamp}|${nonce}`;
    
    if (body) {
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
      payload += `|${bodyString}`;
    }
    
    // Simple hash for client-side integrity (not cryptographically secure)
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${timestamp}.${nonce}.${hashHex}`;
  }

  /**
   * Add security headers to request config
   */
  static addSecurityHeaders(config: any): any {
    const securityHeaders = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    // Add request fingerprint
    const fingerprint = this.generateFingerprint();
    securityHeaders['X-Client-Fingerprint'] = fingerprint;

    // Add timestamp for replay attack prevention
    securityHeaders['X-Request-Time'] = Date.now().toString();

    return {
      ...config,
      headers: {
        ...config.headers,
        ...securityHeaders
      }
    };
  }

  /**
   * Generate client fingerprint for request validation
   */
  static generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Client fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * Validate response integrity
   */
  static validateResponse(response: any): boolean {
    // Check for expected security headers
    const requiredHeaders = ['x-content-type-options', 'cache-control'];
    
    for (const header of requiredHeaders) {
      if (!response.headers[header]) {
        console.warn(`Missing security header: ${header}`);
      }
    }
    
    // Validate response structure
    if (response.data && typeof response.data === 'object') {
      // Check for potential XSS in response data
      const jsonString = JSON.stringify(response.data);
      if (jsonString.includes('<script') || jsonString.includes('javascript:')) {
        console.error('Potential XSS detected in response');
        return false;
      }
    }
    
    return true;
  }

  /**
   * Sanitize response data
   */
  static sanitizeResponse(data: any): any {
    if (typeof data === 'string') {
      return data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeResponse(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeResponse(value);
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * Check if request is from secure context
   */
  static isSecureContext(): boolean {
    return (
      location.protocol === 'https:' ||
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1'
    );
  }

  /**
   * Rate limiting check (client-side)
   */
  static checkRateLimit(endpoint: string): boolean {
    const key = `rate_limit_${endpoint}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 60; // 60 requests per minute
    
    const requests = JSON.parse(localStorage.getItem(key) || '[]');
    const validRequests = requests.filter((time: number) => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    localStorage.setItem(key, JSON.stringify(validRequests));
    
    return true;
  }
}
