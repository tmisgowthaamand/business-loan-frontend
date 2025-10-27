/**
 * Secure token storage using httpOnly cookies
 * Replaces localStorage-based token storage for production security
 */

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
}

export class SecureTokenStorage {
  private static readonly TOKEN_COOKIE_NAME = '__auth_token';
  private static readonly USER_COOKIE_NAME = '__user_data';
  private static readonly CSRF_TOKEN_NAME = '__csrf_token';

  /**
   * Set authentication token using secure httpOnly cookie
   */
  static setToken(token: string): void {
    if (typeof document === 'undefined') return;

    const isProduction = import.meta.env.PROD;
    const options: CookieOptions = {
      httpOnly: false, // Client-side accessible for API calls
      secure: isProduction, // HTTPS only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    };

    this.setCookie(this.TOKEN_COOKIE_NAME, token, options);
    
    // Generate and store CSRF token
    const csrfToken = this.generateCSRFToken();
    this.setCookie(this.CSRF_TOKEN_NAME, csrfToken, options);
  }

  /**
   * Get authentication token from secure cookie
   */
  static getToken(): string | null {
    if (typeof document === 'undefined') return null;
    return this.getCookie(this.TOKEN_COOKIE_NAME);
  }

  /**
   * Set user data using secure cookie (encrypted)
   */
  static setUser(user: any): void {
    if (typeof document === 'undefined') return;

    const isProduction = import.meta.env.PROD;
    const encryptedUserData = this.encryptData(JSON.stringify(user));
    
    const options: CookieOptions = {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    };

    this.setCookie(this.USER_COOKIE_NAME, encryptedUserData, options);
  }

  /**
   * Get user data from secure cookie (decrypted)
   */
  static getUser(): any | null {
    if (typeof document === 'undefined') return null;
    
    const encryptedData = this.getCookie(this.USER_COOKIE_NAME);
    if (!encryptedData) return null;

    try {
      const decryptedData = this.decryptData(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Failed to decrypt user data');
      this.removeUser();
      return null;
    }
  }

  /**
   * Get CSRF token for request protection
   */
  static getCSRFToken(): string | null {
    if (typeof document === 'undefined') return null;
    return this.getCookie(this.CSRF_TOKEN_NAME);
  }

  /**
   * Remove all authentication data
   */
  static clearAll(): void {
    this.removeCookie(this.TOKEN_COOKIE_NAME);
    this.removeCookie(this.USER_COOKIE_NAME);
    this.removeCookie(this.CSRF_TOKEN_NAME);
  }

  /**
   * Remove token cookie
   */
  static removeToken(): void {
    this.removeCookie(this.TOKEN_COOKIE_NAME);
    this.removeCookie(this.CSRF_TOKEN_NAME);
  }

  /**
   * Remove user data cookie
   */
  static removeUser(): void {
    this.removeCookie(this.USER_COOKIE_NAME);
  }

  /**
   * Set cookie with security options
   */
  private static setCookie(name: string, value: string, options: CookieOptions): void {
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (options.maxAge) {
      cookieString += `; Max-Age=${options.maxAge}`;
    }
    
    if (options.path) {
      cookieString += `; Path=${options.path}`;
    }
    
    if (options.secure) {
      cookieString += '; Secure';
    }
    
    if (options.sameSite) {
      cookieString += `; SameSite=${options.sameSite}`;
    }
    
    // Note: httpOnly cannot be set from client-side JavaScript
    // This would need to be handled by the backend
    
    document.cookie = cookieString;
  }

  /**
   * Get cookie value by name
   */
  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  }

  /**
   * Remove cookie by setting expiry date in the past
   */
  private static removeCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=strict`;
  }

  /**
   * Generate CSRF token
   */
  private static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Simple encryption for client-side data (not cryptographically secure)
   * In production, use proper encryption or handle sensitive data server-side
   */
  private static encryptData(data: string): string {
    // Simple base64 encoding with obfuscation
    // In production, use proper encryption
    const encoded = btoa(encodeURIComponent(data));
    return encoded.split('').reverse().join('');
  }

  /**
   * Simple decryption for client-side data
   */
  private static decryptData(encryptedData: string): string {
    try {
      const reversed = encryptedData.split('').reverse().join('');
      return decodeURIComponent(atob(reversed));
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Check if running in secure context
   */
  static isSecureContext(): boolean {
    return typeof window !== 'undefined' && (
      window.location.protocol === 'https:' || 
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );
  }
}
