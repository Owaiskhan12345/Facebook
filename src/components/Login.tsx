import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  // Auto redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Auto-focus email field on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(email, password);
      setIsSubmitting(false);

      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Authentication failed');
      }
    }, 200);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSuccess(true);
    setTimeout(() => {
      setForgotPasswordOpen(false);
      setResetSuccess(false);
      setResetEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-between font-sans text-gray-900 selection:bg-[#1877F2] selection:text-white">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-[980px] flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
          
          {/* Left Branding Column */}
          <div className="w-full md:w-[54%] text-center md:text-left pt-2 md:pt-0">
            <h1 className="text-[#1877F2] text-4xl sm:text-5xl md:text-[60px] font-extrabold tracking-tight leading-none mb-3 sm:mb-4 select-none">
              facebook
            </h1>
            <p className="text-lg sm:text-xl md:text-[26px] text-[#1c1e21] leading-snug font-normal max-w-[500px] mx-auto md:mx-0">
              Facebook helps you connect and share with the people in your life.
            </p>
          </div>

          {/* Right Login Card Column */}
          <div className="w-full md:w-[420px] max-w-[420px] flex flex-col items-center">
            <div className="bg-white p-5 sm:p-6 rounded-lg shadow-xl border border-gray-200/90 w-full">
              
              {/* Error Message Alert */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-md flex items-start gap-2.5 text-red-700 text-sm animate-shake">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-800">Login error</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="login-email" className="sr-only">Email address</label>
                  <input
                    ref={emailInputRef}
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`w-full px-4 py-3.5 text-[17px] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1877F2]/40 focus:border-[#1877F2] transition bg-white ${
                      error && error.includes('User not found') ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div className="relative">
                  <label htmlFor="login-password" className="sr-only">Password</label>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`w-full px-4 py-3.5 pr-11 text-[17px] border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1877F2]/40 focus:border-[#1877F2] transition bg-white ${
                      error && error.includes('Wrong password') ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-0.5 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#1877F2] focus:ring-[#1877F2] border-gray-300"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-[#1877F2] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1877F2] hover:bg-[#166fe5] active:bg-[#1465d2] text-white font-bold text-xl py-3 rounded-md transition duration-150 shadow-sm cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? 'Logging in...' : 'Log In'}
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 border-t border-gray-200" />

              {/* Create Account Button */}
              <div className="text-center">
                <Link
                  to="/register"
                  className="inline-block bg-[#42b72a] hover:bg-[#36a420] active:bg-[#2f911c] text-white font-bold text-[17px] px-5 py-3 rounded-md transition duration-150 shadow-sm cursor-pointer"
                >
                  Create new account
                </Link>
              </div>
            </div>

            <p className="mt-6 text-sm text-center text-gray-600">
              <span className="font-semibold text-gray-800 hover:underline cursor-pointer">Create a Page</span> for a celebrity, brand or business.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#1877F2]" /> Find Your Account
              </h3>
              <button
                onClick={() => setForgotPasswordOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleForgotPassword} className="p-5">
              {resetSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-800">Password Reset Link Sent</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Check your inbox at <strong>{resetEmail}</strong> for instructions.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Please enter your email address to search for your account and receive password recovery options.
                  </p>
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                  />
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(false)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 font-semibold text-gray-700 rounded-md text-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] font-semibold text-white rounded-md text-sm transition shadow-sm"
                    >
                      Search
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Facebook Classic Footer */}
      <footer className="bg-white border-t border-gray-200 pt-6 pb-8 text-[12px] text-gray-500">
        <div className="max-w-[980px] mx-auto px-4">
          <div className="flex flex-wrap gap-x-3 gap-y-1 pb-2 border-b border-gray-200">
            <span className="text-gray-700">English (US)</span>
            <span className="hover:underline cursor-pointer">Español</span>
            <span className="hover:underline cursor-pointer">Français (France)</span>
            <span className="hover:underline cursor-pointer">中文(简体)</span>
            <span className="hover:underline cursor-pointer">العربية</span>
            <span className="hover:underline cursor-pointer">Português (Brasil)</span>
            <span className="hover:underline cursor-pointer">Italiano</span>
            <span className="hover:underline cursor-pointer">한국어</span>
            <span className="hover:underline cursor-pointer">Deutsch</span>
            <span className="hover:underline cursor-pointer">हिन्दी</span>
            <span className="hover:underline cursor-pointer">日本語</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
            <span className="hover:underline cursor-pointer">Sign Up</span>
            <span className="hover:underline cursor-pointer">Log In</span>
            <span className="hover:underline cursor-pointer">Messenger</span>
            <span className="hover:underline cursor-pointer">Facebook Lite</span>
            <span className="hover:underline cursor-pointer">Video</span>
            <span className="hover:underline cursor-pointer">Places</span>
            <span className="hover:underline cursor-pointer">Games</span>
            <span className="hover:underline cursor-pointer">Marketplace</span>
            <span className="hover:underline cursor-pointer">Meta Pay</span>
            <span className="hover:underline cursor-pointer">Meta Store</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span className="hover:underline cursor-pointer">Help</span>
          </div>

          <div className="mt-4 text-gray-400">
            Meta © 2026 • Facebook Clone Application
          </div>
        </div>
      </footer>
    </div>
  );
};
