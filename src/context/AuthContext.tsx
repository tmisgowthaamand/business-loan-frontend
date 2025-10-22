import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

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
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          const userData = JSON.parse(storedUser);
          if (userData && userData.id) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            throw new Error('Invalid user data');
          }
        } catch (parseError) {
          console.error('❌ Error parsing stored user data:', parseError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // No stored user data
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      console.log('🔐 Attempting fast login with:', credentials.email);
      
      // Extended demo users for instant login - all use password 'admin123'
      const demoUsers = [
        { id: 1, name: 'Admin User', email: 'admin@gmail.com', role: 'ADMIN' as const, password: 'admin123' },
        { id: 2, name: 'Pankil', email: 'govindamarketing9998@gmail.com', role: 'ADMIN' as const, password: 'admin123' },
        { id: 3, name: 'Venkat', email: 'govindamanager9998@gmail.com', role: 'EMPLOYEE' as const, password: 'admin123' },
        { id: 4, name: 'Dinesh', email: 'dinesh@gmail.com', role: 'EMPLOYEE' as const, password: 'admin123' },
        { id: 5, name: 'Perivi', email: 'gowthaamankrishna1998@gmail.com', role: 'ADMIN' as const, password: 'admin123' },
        { id: 6, name: 'Venkat Staff', email: 'gowthaamaneswar1998@gmail.com', role: 'EMPLOYEE' as const, password: 'admin123' },
        { id: 7, name: 'Harish', email: 'newacttmis@gmail.com', role: 'ADMIN' as const, password: 'admin123' },
        { id: 8, name: 'Nunciya', email: 'tmsnunciya59@gmail.com', role: 'ADMIN' as const, password: 'admin123' },
        { id: 9, name: 'Admin User', email: 'admin@businessloan.com', role: 'ADMIN' as const, password: 'admin123' },
        // Quick test credentials
        { id: 10, name: 'Test Admin', email: 'admin', role: 'ADMIN' as const, password: 'admin' },
        { id: 11, name: 'Test Employee', email: 'employee', role: 'EMPLOYEE' as const, password: 'employee' },
        { id: 12, name: 'Demo Admin', email: 'demo', role: 'ADMIN' as const, password: 'demo' }
      ];

      // Check demo users first for instant login
      const demoUser = demoUsers.find(u => u.email === credentials.email && u.password === credentials.password);
      
      if (demoUser) {
        console.log('✅ Fast demo login successful:', demoUser.name);
        
        const userData = {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role
        };
        
        // Set demo token and user data instantly
        localStorage.setItem('token', 'demo-token-' + demoUser.id);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success(`Fast login successful! Welcome ${userData.name} (${userData.role})`);
        return;
      }
      
      // If not a demo user, show error instead of backend call for faster UX
      console.log('❌ Credentials not found in demo users');
      throw new Error('Invalid credentials. Use demo credentials for instant access.');
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Show helpful error message with demo credentials
      if (error.message.includes('Invalid credentials')) {
        toast.error('Invalid credentials. Try: admin@gmail.com / admin123');
      } else {
        toast.error(error.message || 'Login failed');
      }
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
      const response = await api.post('/api/auth/force-fresh-login', credentials);
      const data = response.data;
      
      if (data.access_token) {
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
