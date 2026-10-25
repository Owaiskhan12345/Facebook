import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2, User, Mail, AtSign, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{
    general?: string;
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Auto-focus name field on mount
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    setTimeout(() => {
      const res = register(name, username, email, password);
      setIsSubmitting(false);

      if (res.success) {
        setRegistrationSuccess(true);
        // Auto clear form as specified
        setName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Redirect to login after 1.5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrors({ general: res.error || 'Registration failed' });
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-between font-sans text-gray-900 selection:bg-[#1877F2] selection:text-white">
      {/* Top Header / Logo */}
      <div className="pt-8 pb-4 text-center">
        <Link to="/login" className="inline-block">
          <h1 className="text-[#1877F2] text-5xl md:text-[60px] font-extrabold tracking-tight leading-none select-none">
            facebook
          </h1>
        </Link>
      </div>

      {/* Main Registration Card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-gray-200/90 w-full max-w-[480px]">
          
          <div className="border-b border-gray-200 pb-3 mb-5 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Create a new account</h2>
            <p className="text-gray-500 text-sm mt-1">It's quick and easy.</p>
          </div>

          {/* Success Banner */}
          {registrationSuccess && (
            <div className="mb-5 p-4 bg-green-50 border border-green-300 rounded-md flex items-center gap-3 text-green-800 text-sm animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Account created successfully!</p>
                <p className="text-xs text-green-700 mt-0.5">Redirecting to login page...</p>
              </div>
            </div>
          )}

          {/* General Error Banner */}
          {errors.general && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-300 rounded-md flex items-start gap-2.5 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Registration Error</p>
                <p>{errors.general}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  ref={nameInputRef}
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-[15px] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1877F2]/40 focus:border-[#1877F2] transition bg-gray-50/50 focus:bg-white ${
                    errors.name ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.name && <p className="text-red-600 text-xs mt-1 font-medium">{errors.name}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <AtSign className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="unique_username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors({ ...errors, username: undefined });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-[15px] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1877F2]/40 focus:border-[#1877F2] transition bg-gray-50/50 focus:bg-white ${
                    errors.username ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.username && <p className="text-red-600 text-xs mt-1 font-medium">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  autoComplete="off"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-[15px] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1877F2]/40 focus:border-[#1877F2] transition bg-gray-50/50 focus:bg-white ${
                    errors.email ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-600 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Password (min 6 chars) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`w-full pl-10 pr-11 py-2.5 text-[15px] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1877F2]/40 focus:border-[#1877F2] transition bg-gray-50/50 focus:bg-white ${
                    errors.password ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-xs mt-1 font-medium">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="off"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  className={`w-full pl-10 pr-11 py-2.5 text-[15px] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1877F2]/40 focus:border-[#1877F2] transition bg-gray-50/50 focus:bg-white ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms disclaimer */}
            <p className="text-[11px] text-gray-500 leading-normal pt-1">
              By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy. You may receive SMS Notifications from us and can opt out any time.
            </p>

            {/* Green Sign Up Button */}
            <div className="pt-2 text-center">
              <button
                type="submit"
                disabled={isSubmitting || registrationSuccess}
                className="w-full sm:w-[220px] bg-[#42b72a] hover:bg-[#36a420] active:bg-[#2f911c] text-white font-bold text-lg py-2.5 px-6 rounded-md transition duration-150 shadow-md cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          {/* Bottom Link to Login */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <Link
              to="/login"
              className="text-[#1877F2] font-semibold text-sm hover:underline"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-500 border-t border-gray-200 bg-white">
        Meta © 2026 • Facebook Clone Application
      </footer>
    </div>
  );
};
