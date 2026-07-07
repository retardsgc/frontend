import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../hooks/useSiteConfig';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [footerConfig, setFooterConfig] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  // Fetch the 'all' config which contains footer data
  const { data: siteConfig, loading: configLoading, error: configError } = useSiteConfig('all');

  // Also try to fetch data directly from API as fallback
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch('/api/siteconfig/all');

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.data) {
            setFooterConfig(data.data);
          }
        }
      } catch (error) {
        // Silent fail - use default footer data
      }
    };

    // Always try direct fetch as backup
    fetchFooterData();
  }, []);

  // Use data from either hook or direct fetch
  const activeConfig = siteConfig?.config || footerConfig || {};

  // Use default values if data is not loaded yet
  const configData = activeConfig;
  const footerData = configData.footer || {
    copyright: '© 2024 TechCart. All Rights Reserved.',
    getDirectionText: 'Get Direction',
    getDirectionLink: '#',
    newsletter: {
      title: 'Join Our Newsletter',
      description: 'Get exclusive deals and updates straight to your inbox.',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe'
    },
    socialMedia: {
      youtube: { url: '#', enabled: true },
      facebook: { url: '#', enabled: true },
      instagram: { url: '#', enabled: true },
      telegram: { url: '#', enabled: true }
    },
    sections: [
      {
        title: 'Company',
        links: [
          { name: 'About Us', link: '/about' },
          { name: 'Shop', link: '/shop' },
          { name: 'Contact Us', link: '/contact' }
        ]
      },
      {
        title: 'Support',
        links: [
          { name: 'FAQ', link: '/faq' },
          { name: 'My Account', link: '/account' },
          { name: 'Policies', link: '/policies' }
        ]
      }
    ]
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email || isSubscribing) return;
    
    setIsSubscribing(true);
    setSubscribeSuccess(false);
    setSubscribeMessage('');
    
    // Simulate API call with a small delay to feel realistic
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Show success message
    setIsSubscribing(false);
    setSubscribeSuccess(true);
    setSubscribeMessage('Thank you for subscribing! Check your inbox for exclusive deals.');
    setEmail('');
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSubscribeSuccess(false);
      setSubscribeMessage('');
    }, 5000);
  };

  // Show loading state
  if (configLoading) {
    return (
      <footer className="bg-white border-t border-gray-100 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="max-w-[1600px] mx-auto text-center">
          <p className="text-black">Loading footer data...</p>
        </div>
      </footer>
    );
  }

  // Show error state
  if (configError && !activeConfig.footer) {
    return (
      <footer className="bg-white border-t border-gray-100 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="max-w-[1600px] mx-auto text-center">
          <p className="text-black">Error loading footer data: {configError}</p>
          <p className="text-sm text-gray-500 mt-2">Using fallback data</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t border-gray-100 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-8 lg:gap-8 xl:gap-12 mb-6 sm:mb-8 md:mb-10">
          {/* First Column - Logo and Social Media */}
          <div className="flex flex-col sm:col-span-1 lg:col-span-1">
            {/* Logo */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              <img
                src={configData.branding?.logo?.url || '/images/placeholder.svg'}
                alt={configData.branding?.logo?.alt || 'Logo'}
                className="h-4 sm:h-5 md:h-6 lg:h-6 xl:h-7 w-auto"
              />
            </div>
            


            {/* Get Direction Link */}
            <a
              href={footerData.getDirectionLink || '#'}
              className="text-xs sm:text-sm md:text-base lg:text-base text-black underline hover:no-underline mb-4 sm:mb-5 md:mb-6 inline-block transition-colors hover:text-gray-700"
            >
              {footerData.getDirectionText || 'Get Directions'}
            </a>
            
            {/* Social Media Icons */}
            <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap">
              {/* YouTube */}
              {footerData.socialMedia?.youtube?.enabled !== false && (
                <a
                  href={footerData.socialMedia?.youtube?.url || '#'}
                  aria-label="YouTube"
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}

              {/* Facebook */}
              {footerData.socialMedia?.facebook?.enabled !== false && (
                <a
                  href={footerData.socialMedia?.facebook?.url || '#'}
                  aria-label="Facebook"
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}

              {/* Instagram */}
              {footerData.socialMedia?.instagram?.enabled !== false && (
                <a
                  href={footerData.socialMedia?.instagram?.url || '#'}
                  aria-label="Instagram"
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}

              {/* Telegram */}
              {footerData.socialMedia?.telegram?.enabled !== false && (
                <a
                  href={footerData.socialMedia?.telegram?.url || '#'}
                  aria-label="Telegram"
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
          
          {/* Dynamic Footer Sections */}
          {footerData.sections?.map((section, index) => (
            <div key={index} className="flex flex-col">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl font-semibold text-black mb-2 sm:mb-3 md:mb-4">
                {section.title}
              </h3>
              <div className="flex flex-col gap-1.5 sm:gap-2">
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    to={link.link}
                    className="text-xs sm:text-sm md:text-base lg:text-base text-black hover:text-gray-700 hover:underline transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Policy Links Section - Visible on all screen sizes */}
          <div className="flex flex-col sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl font-semibold text-black mb-2 sm:mb-3 md:mb-4">
              Policies
            </h3>
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <Link
                to="/policies#privacy"
                className="text-xs sm:text-sm md:text-base lg:text-base text-black hover:text-gray-700 hover:underline transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                to="/policies#terms"
                className="text-xs sm:text-sm md:text-base lg:text-base text-black hover:text-gray-700 hover:underline transition-colors duration-200"
              >
                Terms & Conditions
              </Link>
              <Link
                to="/policies#refund"
                className="text-xs sm:text-sm md:text-base lg:text-base text-black hover:text-gray-700 hover:underline transition-colors duration-200"
              >
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-3 sm:my-4 md:my-4"></div>
        
        {/* Bottom Bar */}
        <div className="flex justify-center items-center">
          {/* Copyright */}
          <p className="text-xs sm:text-sm md:text-base lg:text-base text-gray-600">
            {footerData.copyright || '© 2024 All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
