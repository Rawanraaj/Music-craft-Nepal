import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, loading: authLoading, login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.isAdmin ? '/admin' : '/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-mcn-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mcn-gray-500 font-bold">Verifying session...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          // Special case redirect for admin email
          if (formData.email.toLowerCase().trim() === 'admin@musiccraftnepal.com') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          setError(result.error || 'Login failed.');
        }
      } else {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          if (result.error) {
            // Unconfirmed email warning message
            setSuccessMessage(result.error);
          } else {
            setSuccessMessage('Registration successful! Logging you in...');
            setTimeout(() => navigate('/'), 2000);
          }
        } else {
          setError(result.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google sign-in.');
    }
  };

  return (
    <div className="min-h-screen bg-mcn-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-mcn-blue rounded-lg flex items-center justify-center">
            <Music className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-mcn-charcoal leading-none">Music Craft</span>
            <span className="block text-sm font-semibold text-mcn-blue leading-none mt-0.5">NEPAL</span>
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-mcn-gray-200 shadow-sm p-6 md:p-8">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-mcn-gray-100 rounded-lg mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-colors ${
                mode === 'login' ? 'bg-white text-mcn-charcoal shadow-sm' : 'text-mcn-gray-500'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-colors ${
                mode === 'register' ? 'bg-white text-mcn-charcoal shadow-sm' : 'text-mcn-gray-500'
              }`}
            >
              Register
            </button>
          </div>

          <h1 className="text-2xl font-extrabold text-mcn-charcoal mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-mcn-gray-500 mb-6">
            {mode === 'login'
              ? 'Sign in to your Music Craft Nepal account'
              : 'Join the Music Craft Nepal family'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-mcn-red font-semibold">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-semibold">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-bold text-mcn-charcoal mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mcn-gray-400" />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full h-12 pl-11 pr-4 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-mcn-charcoal mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mcn-gray-400" />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full h-12 pl-11 pr-4 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-mcn-charcoal mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mcn-gray-400" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Your password"
                  className="w-full h-12 pl-11 pr-11 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mcn-gray-400 hover:text-mcn-charcoal transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-mcn-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-mcn-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 flex items-center justify-center gap-2 border-2 border-mcn-gray-300 rounded-lg hover:bg-mcn-gray-50 text-mcn-charcoal font-bold transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <p className="text-xs text-mcn-gray-400 text-center mt-4">
            Welcome to Music Craft Nepal
          </p>
        </div>

        <p className="text-center text-xs text-mcn-gray-400 mt-6">
          By continuing, you agree to Music Craft Nepal's Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
