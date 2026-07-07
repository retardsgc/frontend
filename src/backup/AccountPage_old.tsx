import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'account-details', label: 'Account Details' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'logout', label: 'Logout' }
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'My Account';
      case 'orders': return 'My Orders';
      case 'addresses': return 'My Account Address';
      case 'wishlist': return 'My Account Wishlist';
      case 'account-details': return 'My Account Details';
      default: return 'My Account';
    }
  };

  const renderDashboard = () => (
    <div className="text-left">
      <h2 className="text-2xl font-semibold mb-4">Hello Themesflat</h2>
      <p className="text-gray-600 leading-relaxed">
        From your account dashboard you can view your{' '}
        <button 
          onClick={() => setActiveTab('orders')}
          className="text-red-500 hover:text-red-600 underline"
        >
          recent orders
        </button>
        , manage your{' '}
        <button 
          onClick={() => setActiveTab('addresses')}
          className="text-red-500 hover:text-red-600 underline"
        >
          shipping and billing addresses
        </button>
        , and{' '}
        <button 
          onClick={() => setActiveTab('account-details')}
          className="text-red-500 hover:text-red-600 underline"
        >
          edit your password and account details
        </button>
        .
      </p>
    </div>
  );

  const renderOrders = () => (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-0 font-medium text-gray-700">Order</th>
              <th className="text-left py-4 px-4 font-medium text-gray-700">Date</th>
              <th className="text-left py-4 px-4 font-medium text-gray-700">Status</th>
              <th className="text-left py-4 px-4 font-medium text-gray-700">Total</th>
              <th className="text-left py-4 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-4 px-0">#123</td>
              <td className="py-4 px-4">August 1, 2024</td>
              <td className="py-4 px-4">On hold</td>
              <td className="py-4 px-4">$200.00 for 1 Items</td>
              <td className="py-4 px-4">
                <button className="bg-black text-white px-4 py-2 font-medium hover:bg-gray-800 transition-colors">
                  View
                </button>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-4 px-0">#345</td>
              <td className="py-4 px-4">August 2, 2024</td>
              <td className="py-4 px-4">On hold</td>
              <td className="py-4 px-4">$300.00 for 1 Items</td>
              <td className="py-4 px-4">
                <button className="bg-black text-white px-4 py-2 font-medium hover:bg-gray-800 transition-colors">
                  View
                </button>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-4 px-0">#567</td>
              <td className="py-4 px-4">August 3, 2024</td>
              <td className="py-4 px-4">On hold</td>
              <td className="py-4 px-4">$400.00 for 1 Items</td>
              <td className="py-4 px-4">
                <button className="bg-black text-white px-4 py-2 font-medium hover:bg-gray-800 transition-colors">
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div>
      <button className="bg-black text-white px-6 py-3 font-medium mb-8 hover:bg-gray-800 transition-colors">
        Add a new address
      </button>
      <div className="bg-white border border-gray-200 p-6 max-w-md">
        <h3 className="font-semibold mb-4">Default</h3>
        <div className="text-gray-700 mb-4 leading-relaxed">
          <p>1234 Fashion Street, Suite 567,</p>
          <p>New York, NY 10001</p>
          <p className="mt-2">Email: info@fashionshop.com</p>
          <p>Phone: (212) 555-1234</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-black text-white px-4 py-2 font-medium hover:bg-gray-800 transition-colors">
            Edit
          </button>
          <button className="border border-black text-black px-4 py-2 font-medium hover:bg-gray-50 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const renderWishlist = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Product 1 */}
        <div className="group">
          <div className="relative mb-4 bg-gray-100 aspect-square overflow-hidden">
            <img 
                                    src="/images/IMAGE_1.png" 
              alt="Ribbed Tank Top"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-semibold mb-2">Ribbed Tank Top</h3>
          <p className="font-medium mb-3">$16.95</p>
          <div className="flex gap-2">
            <button className="w-5 h-5 rounded-full bg-orange-400 border-2 border-orange-400"></button>
            <button className="w-5 h-5 rounded-full bg-black border-2 border-gray-300"></button>
          </div>
        </div>

        {/* Product 2 */}
        <div className="group">
          <div className="relative mb-4 bg-gray-100 aspect-square overflow-hidden">
            <img 
                                    src="/images/IMAGE_2.png" 
              alt="Ribbed Modal T-shirt"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-4 right-4 bg-white px-2 py-1 text-sm font-medium">
              You are good to go!
            </div>
          </div>
          <h3 className="font-semibold mb-2">Ribbed Modal T-shirt</h3>
          <p className="font-medium mb-3">$18.95</p>
          <div className="flex gap-2">
            <button className="w-5 h-5 rounded-full bg-green-400 border-2 border-green-400"></button>
            <button className="w-5 h-5 rounded-full bg-pink-300 border-2 border-gray-300"></button>
            <button className="w-5 h-5 rounded-full bg-green-200 border-2 border-gray-300"></button>
          </div>
        </div>

        {/* Product 3 */}
        <div className="group">
          <div className="relative mb-4 bg-gray-100 aspect-square overflow-hidden">
            <img 
                                    src="/images/IMAGE_3.png" 
              alt="Oversized Printed T-shirt"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-semibold mb-2">Oversized Printed T-shirt</h3>
          <p className="font-medium mb-3">$10.00</p>
        </div>
      </div>
    </div>
  );

  const renderAccountDetails = () => (
    <div>
      <form className="max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              defaultValue="John"
              className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              defaultValue="Doe"
              className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            defaultValue="Themesflat"
            className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            defaultValue="info@fashionshop.com"
            className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <h3 className="text-lg font-semibold mb-4">Password Change</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password (leave blank to leave unchanged)
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password (leave blank to leave unchanged)
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'orders': return renderOrders();
      case 'addresses': return renderAddresses();
      case 'wishlist': return renderWishlist();
      case 'account-details': return renderAccountDetails();
      case 'logout': return <div>Logging out...</div>;
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Gradient Header Section */}
      <div className="w-full bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-black">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-4">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-6 py-3 font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
