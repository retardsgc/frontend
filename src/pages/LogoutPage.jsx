import React, { useState } from 'react';
import authService from '../services/authService';
import LogoutConfirmation from '../components/LogoutConfirmation.tsx';

const LogoutPage = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const isLoggedIn = authService.isAuthenticated();

  const handleLogoutClick = () => {
    setShowConfirmation(true);
  };

  const handleLogoutConfirm = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Logout</h1>
        <p className="text-gray-600 mb-6">
          {isLoggedIn ? 'Click the button below to securely log out of your account.' : 'You are not currently logged in.'}
        </p>
        {isLoggedIn ? (
          <button
            onClick={handleLogoutClick}
            className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800"
          >
            Log out
          </button>
        ) : (
          <button
            onClick={() => window.dispatchEvent(new Event('auth:openLogin'))}
            className="inline-block bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800"
          >
            Open Login
          </button>
        )}

        {/* Logout Confirmation Modal */}
        <LogoutConfirmation
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleLogoutConfirm}
        />
      </div>
    </div>
  );
};

export default LogoutPage;


