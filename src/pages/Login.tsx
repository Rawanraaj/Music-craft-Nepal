import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      navigate(user.isAdmin ? '/admin' : '/');
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const result = login(formData.email, formData.password);
      if (result.success) {
        navigate(result.isAdmin ? '/admin' : '/');
      } else {
        setError(result.error || 'Login failed.');
      }
    } else {
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      const result = register(formData.name, formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Registration failed.');
      }
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
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-colors ${
                mode === 'login' ? 'bg-white text-mcn-charcoal shadow-sm' : 'text-mcn-gray-500'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
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
              className="w-full h-12 flex items-center justify-center gap-2 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-xs text-mcn-gray-400 text-center mt-4">
              Admin access: admin@musiccraftnepal.com
            </p>
          )}
        </div>

        <p className="text-center text-xs text-mcn-gray-400 mt-6">
          By continuing, you agree to Music Craft Nepal's Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
