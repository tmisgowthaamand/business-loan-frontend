import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  forceFreshLogin: (credentials: { email: string; password: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Token is handled by api interceptors
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Try to get user data from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Fallback to demo user if no stored user data
        const mockUser = {
          id: 1,
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'ADMIN' as const
        };
        
        setUser(mockUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      console.log('🔐 Attempting login with:', credentials.email);
      
      // Demo users for instant login
      const demoUsers = [
        { id: 1, name: 'Admin User', email: 'admin@gmail.com', role: 'ADMIN' as const, password: 'admin123' },
        { id: 2, name: 'Pankil', email: 'govindamarketing9998@gmail.com', role: 'ADMIN' as const, password: 'admin123' },
        { id: 3, name: 'Venkat', email: 'govindamanager9998@gmail.com', role: 'EMPLOYEE' as const, password: 'admin123' },
        { id: 4, name: 'Dinesh', email: 'dinesh@gmail.com', role: 'EMPLOYEE' as const, password: 'admin123' }
      ];

      // Check demo users first for instant login
      const demoUser = demoUsers.find(u => u.email === credentials.email && u.password === credentials.password);
      
      if (demoUser) {
        console.log('✅ Demo user login successful:', demoUser.name);
        
        const userData = {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role
        };
        
        // Set demo token and user data
        localStorage.setItem('token', 'demo-token-' + demoUser.id);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success(`Login successful! Welcome ${userData.name}`);
        return;
      }
      
      // Fallback to backend auth if not a demo user
      console.log('🔐 Making request to: /api/auth/login');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (response.ok && data.access_token) {
        console.log('✅ Backend login successful, setting user data...');
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        toast.success(`Login successful! Welcome ${data.user.name}`);
      } else {
        console.error('❌ Login failed - no access token or bad response');
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const forceFreshLogin = async (credentials: { email: string; password: string }) => {
    try {
      console.log('🔄 Force fresh login for:', credentials.email);
      
      // Clear all cached data first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      
      // Call the force fresh login endpoint
      const response = await fetch('/api/auth/force-fresh-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (response.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        console.log('✅ Force fresh login successful:', data.user);
        toast.success(`Fresh login successful! Welcome ${data.user.name} (${data.user.role})`);
      } else {
        throw new Error(data.message || 'Fresh login failed');
      }
    } catch (error: any) {
      console.error('❌ Force fresh login error:', error);
      toast.error(error.message || 'Fresh login failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading, forceFreshLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
