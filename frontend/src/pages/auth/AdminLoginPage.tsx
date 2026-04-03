import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import axiosInstance from '../../api/axios.config';
import { useAuth } from '../../contexts/AuthContext';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both User ID and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/admin/auth/login', {
        email,
        password,
      });

      const data = response.data;

      if (data.success) {
        login(data.data.user, data.data.tokens);
        if (data.data.user.role === 'super_admin' || data.data.user.role === 'sub_admin') {
          navigate('/admin/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 flex">
      {/* Left Side - Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white">
        <h1 className="text-4xl font-bold mb-6">Hello Author</h1>
        <p className="text-lg mb-2">We happy to announce this</p>
        <p className="text-lg mb-8">
          Daily <span className="font-bold">10000+</span> professionals author are getting royalty up to 1 lakh
        </p>
        <ul className="space-y-4 text-base">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 w-2 h-2 bg-white rounded-full flex-shrink-0" />
            <span>Start explore the beautiful platform for writing solutions.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 w-2 h-2 bg-white rounded-full flex-shrink-0" />
            <span>An analytic dashboard for royalty transparent.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 w-2 h-2 bg-white rounded-full flex-shrink-0" />
            <span>Easy to use and fast forwarding.</span>
          </li>
        </ul>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Super Admin Login in!
          </h2>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <div className="flex items-center gap-3 border-b-2 border-gray-300 focus-within:border-indigo-500 pb-2 transition-colors">
                <User className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="User ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 border-b-2 border-gray-300 focus-within:border-indigo-500 pb-2 transition-colors">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center">
              <Link
                to="/admin/login"
                className="text-sm text-indigo-600 font-semibold hover:underline"
              >
                Forget Password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
