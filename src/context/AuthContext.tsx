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
      console.log('🔐 Attempting login with:', credentials.email);
      
      // Call backend API to authenticate against staff management system
      const response = await api.post('/api/auth/login', credentials);
      const data = response.data;
      
      if (data.access_token && data.user) {
        console.log('✅ Login successful:', data.user.name);
        
        // Store token and user data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        toast.success(`Login successful! Welcome ${data.user.name} (${data.user.role})`);
        return;
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Show helpful error message
      if (error.response?.status === 403) {
        toast.error('Invalid credentials. Please check your email and password.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.message.includes('Network Error')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Login failed');
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
