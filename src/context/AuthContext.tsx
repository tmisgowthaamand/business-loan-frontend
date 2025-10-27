import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import toast from 'react-hot-toast';
import api from '../config/api';

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
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData && userData.id) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      console.log('🔐 Attempting login for:', credentials.email);
      
      const response = await api.post('/auth/login', credentials);
      const data = response.data;
      
      if (data.access_token && data.user) {
        console.log('✅ Login successful:', data.user.name, 'Role:', data.user.role);
        
        // Store token and user data
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        toast.success(`Welcome ${data.user.name}!`);
        return;
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ [VERCEL] Login error:', error);
      }
      
      // Enhanced error handling for Vercel deployment
      if (error.response?.status === 403) {
        toast.error('🔒 Invalid credentials. Try: gowthaamankrishna1998@gmail.com / 12345678');
      } else if (error.response?.status === 500) {
        toast.error('🚀 Server error on Vercel. Retrying with backup auth...');
        
        // Auto-retry with force fresh login for Vercel
        try {
          await forceFreshLogin(credentials);
          return;
        } catch (retryError) {
          toast.error('❌ All authentication methods failed. Please contact support.');
        }
      } else if (error.message.includes('Network Error') || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        console.error('🌐 Network Error Details:', {
          message: error.message,
          code: error.code,
          config: error.config
        });
        
        // Check if backend is running
        const backendUrl = error.config?.baseURL || 'http://localhost:5002';
        toast.error(`🌐 Cannot connect to backend server at ${backendUrl}. Please ensure the backend is running.`);
        
        // Provide helpful instructions
        setTimeout(() => {
          toast.error('💡 Run: npm run start:dev in the backend folder', { duration: 5000 });
        }, 2000);
      } else {
        toast.error(`❌ ${error.response?.data?.message || error.message || 'Login failed'}`);
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const forceFreshLogin = async (credentials: { email: string; password: string }) => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Force fresh login for:', credentials.email);
      }
      
      // Clear all cached data first
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      
      // Call the force fresh login endpoint
      const response = await api.post('/api/auth/force-fresh-login', credentials);
      const data = response.data;
      
      if (data.access_token) {
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('✅ Force fresh login successful:', data.user);
        }
        toast.success(`Fresh login successful! Welcome ${data.user.name} (${data.user.role})`);
      } else {
        throw new Error(data.message || 'Fresh login failed');
      }
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Force fresh login error:', error);
      }
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
