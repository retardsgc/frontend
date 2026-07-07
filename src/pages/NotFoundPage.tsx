import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);
  const [autoRedirect, setAutoRedirect] = useState(true);

  // Auto redirect countdown
  useEffect(() => {
    if (!autoRedirect) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/');
    }
  }, [countdown, autoRedirect, navigate]);

  const popularLinks = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Shop All Products', path: '/shop', icon: '🛍️' },
    { name: 'Contact Us', path: '/contact', icon: '📧' },
    { name: 'About Us', path: '/about', icon: '👋' },
    { name: 'FAQ', path: '/faq', icon: '❓' },
  ];

  return (
    <div className="min-h-[80vh] bg-white flex items-center justify-center px-4" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Number */}
        <div className="relative mb-8">
          <h1 
            className="text-[180px] md:text-[220px] font-bold leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 50%, #1a1a1a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-200 flex items-center justify-center animate-pulse"
              style={{ marginTop: '-10px' }}
            >
              <svg className="w-16 h-16 md:w-20 md:h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          The page you're looking for seems to have wandered off. Don't worry, let's get you back on track!
        </p>

        {/* Quick Links */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-4">Try one of these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {popularLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span>{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Auto Redirect Notice */}
        <div className="bg-gray-50 rounded-xl p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3">
            {autoRedirect ? (
              <>
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                  {countdown}
                </div>
                <span className="text-sm text-gray-600">
                  Redirecting to home in {countdown} seconds...
                </span>
                <button
                  onClick={() => setAutoRedirect(false)}
                  className="text-sm text-gray-500 hover:text-black underline"
                >
                  Cancel
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-600">
                Auto redirect cancelled. Take your time!
              </span>
            )}
          </div>
        </div>

        {/* Go Home Button */}
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Back Home
          </Link>
        </div>

        {/* Fun Illustration */}
        <div className="mt-12 flex justify-center">
          <svg className="w-64 h-40 text-gray-200" viewBox="0 0 400 200" fill="none">
            {/* Shopping cart with question mark */}
            <rect x="100" y="80" width="200" height="100" rx="10" fill="currentColor" />
            <circle cx="140" cy="195" r="15" fill="currentColor" />
            <circle cx="260" cy="195" r="15" fill="currentColor" />
            <path d="M80 60 L100 80 L300 80 L320 60" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <text x="200" y="145" textAnchor="middle" fill="#9ca3af" fontSize="48" fontWeight="bold">?</text>
          </svg>
        </div>

        {/* Report Issue Link */}
        <p className="mt-8 text-sm text-gray-400">
          Think this is a mistake?{' '}
          <Link to="/contact" className="text-gray-600 hover:text-black underline">
            Let us know
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
