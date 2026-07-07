import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (response: any) => void;
  onSwitchToLogin?: () => void;
}

type RegistrationStep = 'email' | 'otp' | 'details';

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSuccess, onSwitchToLogin }) => {
  const [step, setStep] = useState<RegistrationStep>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        if (step === 'email' && emailInputRef.current) {
          emailInputRef.current.focus();
        } else if (step === 'otp' && otpInputRefs.current[0]) {
          otpInputRefs.current[0]?.focus();
        } else if (step === 'details' && nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, step]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('email');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setOtp(['', '', '', '', '', '']);
      setError('');
      setSuccessMessage('');
      setShowPassword(false);
      setResendTimer(0);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedValue.forEach((char, i) => {
        if (i + index < 6 && /^\d$/.test(char)) {
          newOtp[i + index] = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedValue.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    } else if (/^\d$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
    setError('');
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const validateEmail = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateDetails = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.sendOTP(formData.email.trim());
      if (response.success) {
        setSuccessMessage('Verification code sent to your email');
        setStep('otp');
        setResendTimer(60); // 60 second cooldown
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.verifyOTP(formData.email.trim(), otpValue);
      if (response.success) {
        setSuccessMessage('Email verified successfully');
        setStep('details');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await authService.resendOTP(formData.email.trim());
      if (response.success) {
        setSuccessMessage('New verification code sent');
        setOtp(['', '', '', '', '', '']);
        setResendTimer(60);
        otpInputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Registration
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDetails()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        passwordConfirm: formData.confirmPassword
      };
      const response = await authService.signup(payload);
      if (response.success) {
        onSuccess && onSuccess(response);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const goBackToEmail = () => {
    setStep('email');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccessMessage('');
  };

  if (!isOpen) return null;

  const getStepTitle = () => {
    switch (step) {
      case 'email': return 'Create Account';
      case 'otp': return 'Verify Email';
      case 'details': return 'Complete Registration';
      default: return 'Register';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'email': return 'Enter your email to get started';
      case 'otp': return `Enter the 6-digit code sent to ${formData.email}`;
      case 'details': return 'Fill in your details to complete signup';
      default: return '';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-[100] px-[1%] sm:px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-[98%] sm:w-full max-w-[560px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 16px 40px rgba(0,0,0,0.18)'
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            {step !== 'email' && (
              <button
                onClick={step === 'otp' ? goBackToEmail : () => setStep('otp')}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 
              id="register-modal-title"
              className="text-xl font-semibold text-gray-900"
              style={{ fontSize: '20px', fontWeight: 600, color: '#111' }}
            >
              {getStepTitle()}
            </h2>
          </div>
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

        {/* Step Indicator */}
        <div className="px-4 sm:px-6 pb-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">{getStepSubtitle()}</p>
          <div className="flex items-center gap-2">
            {['email', 'otp', 'details'].map((s, i) => (
              <React.Fragment key={s}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === s 
                      ? 'bg-black text-white' 
                      : ['email', 'otp', 'details'].indexOf(step) > i 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {['email', 'otp', 'details'].indexOf(step) > i ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-1 rounded ${['email', 'otp', 'details'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {error && (
            <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs sm:text-sm">
              {error}
            </div>
          )}
          
          {successMessage && !error && (
            <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-xs sm:text-sm">
              {successMessage}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address *
                </label>
                <input
                  ref={emailInputRef}
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
                  placeholder="Enter your email address"
                />
              </div>

              <div className="flex flex-col space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '8px'
                  }}
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-sm text-gray-700 hover:text-gray-900 hover:underline transition-colors"
                    style={{ fontSize: '13px' }}
                  >
                    Already have an account? Log in here →
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  Enter verification code
                </label>
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 hover:border-gray-400 transition-colors"
                      style={{ borderRadius: '8px' }}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || loading}
                  className={`text-sm transition-colors ${
                    resendTimer > 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:text-gray-900 hover:underline'
                  }`}
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive the code? Resend"}
                </button>
              </div>

              <div className="flex flex-col space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full h-11 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '8px'
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Complete Registration */}
          {step === 'details' && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              {/* Email Display (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="w-full h-11 px-3.5 py-2.5 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {formData.email}
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  ref={nameInputRef}
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 py-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 hover:border-gray-400 transition-colors"
                  style={{
                    fontSize: '14px',
                    borderColor: '#e5e7eb',
                    borderRadius: '6px'
                  }}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-11 px-3.5 py-2.5 pr-10 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 hover:border-gray-400 transition-colors"
                    style={{
                      fontSize: '14px',
                      borderColor: '#e5e7eb',
                      borderRadius: '6px'
                    }}
                    placeholder="Create a password (min. 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      {showPassword ? (
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      ) : (
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 py-2.5 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 hover:border-gray-400 transition-colors"
                  style={{
                    fontSize: '14px',
                    borderColor: '#e5e7eb',
                    borderRadius: '6px'
                  }}
                  placeholder="Confirm your password"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '8px'
                  }}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-sm text-gray-700 hover:text-gray-900 hover:underline transition-colors"
                    style={{ fontSize: '13px' }}
                  >
                    Already have an account? Log in here →
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
