import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginTest() {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing login...');
      await login({ email, password });
      console.log('🧪 Login completed, auth state:', isAuthenticated);
      
      // Manual navigation test
      setTimeout(() => {
        console.log('🧪 Attempting manual navigation...');
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('🧪 Login test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectNavigation = () => {
    console.log('🧪 Testing direct navigation...');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Login Test Page</h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="test-email" className="block text-sm font-medium mb-1">Email:</label>
            <input
              id="test-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label htmlFor="test-password" className="block text-sm font-medium mb-1">Password:</label>
            <input
              id="test-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <button
            onClick={handleTestLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing Login...' : 'Test Login'}
          </button>
          
          <button
            onClick={handleDirectNavigation}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Test Direct Navigation
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Current State:</h3>
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User:</strong> {user ? `${user.name} (${user.role})` : 'None'}</p>
        </div>
      </div>
    </div>
  );
}

export default LoginTest;
