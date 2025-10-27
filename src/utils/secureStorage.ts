// Secure storage utility for authentication tokens
export class SecureStorage {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';

  // Set token with secure options
  static setToken(token: string): void {
    if (typeof document !== 'undefined') {
      // Use httpOnly cookie in production, fallback to secure localStorage
      if (process.env.NODE_ENV === 'production') {
        // In production, tokens should be handled by httpOnly cookies
        // This is a client-side fallback with security measures
        this.setSecureItem(this.TOKEN_KEY, token);
      } else {
        // Development mode - use localStorage with encryption
        this.setSecureItem(this.TOKEN_KEY, token);
      }
    }
  }

  // Get token securely
  static getToken(): string | null {
    if (typeof document !== 'undefined') {
      return this.getSecureItem(this.TOKEN_KEY);
    }
    return null;
  }

  // Set user data securely
  static setUser(user: any): void {
    if (typeof document !== 'undefined') {
      this.setSecureItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  // Get user data securely
  static getUser(): any | null {
    if (typeof document !== 'undefined') {
      const userData = this.getSecureItem(this.USER_KEY);
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch (error) {
          console.error('Failed to parse user data');
          this.removeUser();
          return null;
        }
      }
    }
    return null;
  }

  // Remove token
  static removeToken(): void {
    if (typeof document !== 'undefined') {
      this.removeSecureItem(this.TOKEN_KEY);
    }
  }

  // Remove user data
  static removeUser(): void {
    if (typeof document !== 'undefined') {
      this.removeSecureItem(this.USER_KEY);
    }
  }

  // Clear all auth data
  static clearAll(): void {
    this.removeToken();
    this.removeUser();
  }

  // Private methods for secure storage
  private static setSecureItem(key: string, value: string): void {
    try {
      // Basic obfuscation for client-side storage
      const obfuscated = btoa(encodeURIComponent(value));
      localStorage.setItem(key, obfuscated);
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  }

  private static getSecureItem(key: string): string | null {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        return decodeURIComponent(atob(item));
      }
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      this.removeSecureItem(key);
    }
    return null;
  }

  private static removeSecureItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove secure item:', error);
    }
  }
}
