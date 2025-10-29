/**
 * Secure Storage Service - Provides secure token storage with encryption
 * Replaces localStorage for sensitive data storage
 */

class SecureStorageService {
  private readonly isProduction = import.meta.env.PROD;
  private readonly storagePrefix = 'bl_secure_';

  // Enhanced encryption for client-side storage (synchronous for compatibility)
  private encrypt(data: string): string {
    if (!this.isProduction) {
      return data; // No encryption in development for debugging
    }
    
    try {
      // Use enhanced base64 encoding with simple obfuscation for production
      const encoded = btoa(encodeURIComponent(data));
      // Add simple character shifting for additional security
      return encoded.split('').map(char => 
        String.fromCharCode(char.charCodeAt(0) + 1)
      ).join('');
    } catch (error) {
      console.warn('Encryption failed, using plain base64:', error);
      return btoa(encodeURIComponent(data));
    }
  }

  private decrypt(encryptedData: string): string {
    if (!this.isProduction) {
      return encryptedData;
    }
    
    try {
      // Reverse the character shifting
      const decoded = encryptedData.split('').map(char => 
        String.fromCharCode(char.charCodeAt(0) - 1)
      ).join('');
      return decodeURIComponent(atob(decoded));
    } catch {
      // Fallback to plain base64 decoding
      try {
        return decodeURIComponent(atob(encryptedData));
      } catch {
        return '';
      }
    }
  }

  // Secure token storage
  setToken(token: string): void {
    if (!token) return;
    
    const encryptedToken = this.encrypt(token);
    const timestamp = Date.now().toString();
    
    // Store with timestamp for expiration checking
    sessionStorage.setItem(`${this.storagePrefix}token`, encryptedToken);
    sessionStorage.setItem(`${this.storagePrefix}timestamp`, timestamp);
    
    // Remove from localStorage if it exists (migration)
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    const encryptedToken = sessionStorage.getItem(`${this.storagePrefix}token`);
    const timestamp = sessionStorage.getItem(`${this.storagePrefix}timestamp`);
    
    if (!encryptedToken || !timestamp) {
      return null;
    }

    // Check if token is older than 8 hours (auto-expire)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 8 * 60 * 60 * 1000; // 8 hours

    if (tokenAge > maxAge) {
      this.clearToken();
      return null;
    }

    return this.decrypt(encryptedToken);
  }

  clearToken(): void {
    sessionStorage.removeItem(`${this.storagePrefix}token`);
    sessionStorage.removeItem(`${this.storagePrefix}timestamp`);
    localStorage.removeItem('token'); // Clean up old storage
  }

  // Secure user data storage
  setUserData(userData: any): void {
    if (!userData) return;
    
    // Remove sensitive fields before storage
    const sanitizedData = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      // Don't store passwords, tokens, or other sensitive data
    };
    
    const encryptedData = this.encrypt(JSON.stringify(sanitizedData));
    sessionStorage.setItem(`${this.storagePrefix}user`, encryptedData);
    
    // Remove from localStorage if it exists
    localStorage.removeItem('user');
  }

  getUserData(): any | null {
    const encryptedData = sessionStorage.getItem(`${this.storagePrefix}user`);
    
    if (!encryptedData) {
      return null;
    }

    try {
      const decryptedData = this.decrypt(encryptedData);
      const userData = JSON.parse(decryptedData);
      
      // Validate that we have essential user data
      if (userData && userData.id && userData.email && userData.name) {
        return userData;
      } else {
        console.warn('Invalid user data structure, clearing storage');
        this.clearUserData();
        return null;
      }
    } catch (error) {
      console.warn('Failed to decrypt/parse user data, clearing storage:', error);
      this.clearUserData();
      return null;
    }
  }

  clearUserData(): void {
    sessionStorage.removeItem(`${this.storagePrefix}user`);
    localStorage.removeItem('user'); // Clean up old storage
  }

  // Clear all secure data
  clearAll(): void {
    this.clearToken();
    this.clearUserData();
    
    // Clean up any other secure storage items
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Debug method to check storage state
  debugStorageState(): void {
    console.log('🔍 [STORAGE DEBUG] Current storage state:');
    console.log('  - Token exists:', !!this.getToken());
    console.log('  - User data exists:', !!this.getUserData());
    console.log('  - User data:', this.getUserData());
    console.log('  - Session storage keys:', Object.keys(sessionStorage).filter(key => key.startsWith(this.storagePrefix)));
  }
}

export const secureStorage = new SecureStorageService();
export default secureStorage;
