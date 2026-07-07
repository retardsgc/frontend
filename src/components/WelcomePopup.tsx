import React, { useEffect, useState } from 'react';

interface WelcomePopupProps {
  username: string;
  isVisible: boolean;
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ username, isVisible, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Start animation
      setIsAnimating(true);
      
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          onClose();
        }, 300); // Wait for fade out animation
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none">
      <div 
        className={`
          bg-white rounded-lg shadow-2xl px-8 py-6 transform transition-all duration-300 pointer-events-auto
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <div className="flex items-center gap-4">
          {/* Success Icon */}
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          {/* Welcome Message */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Welcome back!
            </h3>
            <p className="text-gray-600">
              Welcome, <span className="font-medium text-gray-900">{username}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;

