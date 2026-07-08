import React, { useState, useEffect, useRef } from 'react';
import authService from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (response: any) => void;
  onSwitchToRegister?: () => void;
}

type ModalView = 'login' | 'forgotPassword' | 'forgotPasswordSuccess';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess, onSwitchToRegister }) => {
  const [view, setView] = useState<ModalView>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const forgotInputRef = useRef<HTMLInputElement>(null);

  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      setTimeout(() => {
        if (view === 'forgotPassword' && forgotInputRef.current) {
          forgotInputRef.current.focus();
        } else if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, view]);

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      setView('login');
      setError('');
      setForgotEmail('');
    }
  }, [isOpen]);

  // Check for remembered email
  useEffect(() => {
    if (isOpen) {
      const rememberedEmail = authService.getRememberedEmail();
      if (rememberedEmail) {
        setFormData(prev => ({ ...prev, email: rememberedEmail }));
        setRememberMe(true);
      }
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData, rememberMe);
      if (response.success) {
        onSuccess && onSuccess(response);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.forgotPassword(forgotEmail);
      if (response.success) {
        setView('forgotPasswordSuccess');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Forgot Password Success View
  if (view === 'forgotPasswordSuccess') {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-[100] px-[1%] sm:px-4"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
      >
        <div 
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-[98%] sm:w-full max-w-[560px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.18)' }}
        >
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 pb-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-2">
                We've sent a password reset link to:
              </p>
              <p className="font-semibold text-gray-900 mb-4">{forgotEmail}</p>
              <p className="text-sm text-gray-500 mb-6">
                Click the link in the email to reset your password. The link will expire in 10 minutes.
              </p>
              <button
                onClick={() => setView('login')}
                className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                ← Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password Form View
  if (view === 'forgotPassword') {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-[100] px-[1%] sm:px-4"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
      >
        <div 
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-[98%] sm:w-full max-w-[560px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.18)' }}
        >
          <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Reset your password</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <p className="text-sm text-gray-600 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  ref={forgotInputRef}
                  id="forgot-email"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => { setForgotEmail(e.target.value); setError(''); }}
                  className="w-full h-11 px-3.5 py-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  placeholder="Enter your email"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-6 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
                
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(''); }}
                  className="text-sm text-gray-600 hover:text-gray-900 hover:underline text-center sm:text-right"
                >
                  ← Back to login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Login Form View (default)
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-[100] px-[1%] sm:px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-[98%] sm:w-full max-w-[560px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 16px 40px rgba(0,0,0,0.18)'
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4">
          <h2 
            id="login-modal-title"
            className="text-xl font-semibold text-gray-900"
            style={{ fontSize: '20px', fontWeight: 600, color: '#111' }}
          >
            Log in
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close modal"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                ref={firstInputRef}
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full h-11 px-3.5 py-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 hover:border-gray-400 transition-colors"
                style={{
                  fontSize: '14px',
                  borderColor: '#e5e7eb',
                  borderRadius: '6px'
                }}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full h-11 px-3.5 py-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 hover:border-gray-400 transition-colors"
                style={{
                  fontSize: '14px',
                  borderColor: '#e5e7eb',
                  borderRadius: '6px'
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Forgot Password Link */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => { setView('forgotPassword'); setError(''); setForgotEmail(formData.email); }}
                className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                style={{ fontSize: '13px' }}
              >
                Forgot your password?
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="h-11 px-6 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '8px'
                }}
              >
                {loading ? 'Signing in...' : 'Log in'}
              </button>
              
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-sm text-gray-700 hover:text-gray-900 hover:underline transition-colors text-center sm:text-right"
                style={{ fontSize: '13px' }}
              >
                New customer? Create your account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
