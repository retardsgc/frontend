import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useNavigation, useBranding } from '../hooks/useSiteConfig';
import wishlistService from '../services/wishlistService';
import cartService from '../services/cartService';
import SearchSidebar from './SearchSidebar';

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [announcementBarHeight, setAnnouncementBarHeight] = useState(0);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Use real-time site configuration
  const { data: navigation, loading: navLoading, error: navError } = useNavigation();
  const { data: branding, loading: brandLoading, error: brandError } = useBranding();

  // Listen for announcement bar height changes
  useEffect(() => {
    const updateHeight = () => {
      const announcementBar = document.querySelector('[class*="animate-scroll"]')?.closest('div[class*="w-full"]');
      if (announcementBar) {
        setAnnouncementBarHeight((announcementBar as HTMLElement).offsetHeight || 48);
      } else {
        setAnnouncementBarHeight(0);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    // Small delay to catch dynamic announcement bar rendering
    const timer = setTimeout(updateHeight, 100);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      clearTimeout(timer);
    };
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // No accordion behavior on mobile sidenav, so no state needed here

  // Load wishlist and cart counts
  useEffect(() => {
    const loadWishlistCount = async () => {
      try {
        const response = await wishlistService.getWishlist();
        const count =
          (typeof response?.count === 'number' && response.count) ??
          (Array.isArray(response?.data) ? response.data.length : (Array.isArray(response) ? response.length : 0));
        setWishlistCount(count || 0);
      } catch (error) {
        // Silently handle wishlist count error
      }
    };

    const loadCartCount = async () => {
      try {
        const count = await cartService.getCartCount();
        setCartCount(count);
      } catch (error) {
        // Silently handle cart count error
      }
    };

    loadWishlistCount();
    loadCartCount();

    // Listen for wishlist/cart changes to refresh counts
    const handleWishlistChanged = () => loadWishlistCount();
    const handleCartChanged = () => loadCartCount();
    window.addEventListener('wishlist:changed', handleWishlistChanged);
    window.addEventListener('cart:changed', handleCartChanged);
    return () => {
      window.removeEventListener('wishlist:changed', handleWishlistChanged);
      window.removeEventListener('cart:changed', handleCartChanged);
    };
  }, []);

  // Accessibility: Close on Escape, trap focus inside when open, and lock body scroll
  useEffect(() => {
    if (isSidebarOpen) {
      // Save focus and lock scroll
      previousFocusRef.current = (document.activeElement as HTMLElement) ?? null;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus the close button or first focusable element
      const focusableSelectors = [
        'button', 'a[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'
      ].join(',');
      const sidebar = sidebarRef.current;
      setTimeout(() => {
        (closeButtonRef.current || sidebar?.querySelector(focusableSelectors) as HTMLElement)?.focus();
      }, 0);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsSidebarOpen(false);
          return;
        }
        if (e.key === 'Tab' && sidebar) {
          const focusables = Array.from(sidebar.querySelectorAll<HTMLElement>(focusableSelectors))
            .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.offsetParent !== null);
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          const current = document.activeElement as HTMLElement | null;
          if (e.shiftKey) {
            if (current === first || !sidebar.contains(current)) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (current === last || !sidebar.contains(current)) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    } else {
      // Restore focus to toggle button
      previousFocusRef.current?.focus?.();
    }
  }, [isSidebarOpen]);

  // Show loading state if data is not ready
  if (navLoading || brandLoading) {
    return (
      <nav className="w-full h-[60px] md:h-[74px] bg-white flex items-center justify-center px-2 sm:px-3 md:px-6 relative z-50">
        <div className="text-gray-500">Loading...</div>
      </nav>
    );
  }

  // Show error state if there's an error
  if (navError || brandError) {
    return (
      <nav className="w-full h-[60px] md:h-[74px] bg-white flex items-center justify-center px-2 sm:px-3 md:px-6 relative z-50">
        <div className="text-red-500">Error loading navigation</div>
      </nav>
    );
  }

  // Use fallback data if config is not available
  const rawNavData = navigation || {
    mainMenu: [
      { name: "Home", link: "/" },
      { name: "Products", link: "/products" },
      { name: "About", link: "/about" },
      { name: "Contact", link: "/contact" }
    ]
  };
  // Ensure Products link always exists in the nav
  const hasProductsLink = rawNavData.mainMenu.some(
    (item: any) => item.link === '/products' || item.link === '/shop' || item.name?.toLowerCase() === 'products' || item.name?.toLowerCase() === 'shop'
  );
  const navData = hasProductsLink ? rawNavData : {
    ...rawNavData,
    mainMenu: [...rawNavData.mainMenu, { name: 'Products', link: '/products' }]
  };

  const brandData = branding || {};
  const logoUrl = brandData?.logo?.url || '/images/placeholder.svg';
  const logoAlt = brandData?.logo?.alt || 'Logo';

  return (
    <>
  <nav className="w-full h-[60px] md:h-[74px] bg-white flex items-center justify-between px-2 sm:px-3 md:px-6 z-50" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        {/* Mobile Menu Button - Only visible on small screens */}
        <button 
          className="lg:hidden p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
          onClick={toggleSidebar}
          ref={toggleButtonRef}
          aria-label="Open menu"
          aria-expanded={isSidebarOpen}
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-gray-700 sm:w-5 sm:h-5"
          >
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Logo - Centered on mobile, left on desktop */}
        <div className="flex items-center lg:justify-start justify-center flex-1 lg:flex-none">
          <Link to="/">
            <img
              src={logoUrl}
              alt={logoAlt}
              className="h-4 sm:h-5 md:h-6 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
          {navData.mainMenu.map((item, index) => (
            <Link 
              key={index}
              to={item.link} 
              className="text-black hover:text-gray-700 font-medium transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
      
        {/* Right Icons */}
        <div className="flex items-center gap-x-1 sm:gap-x-2 md:gap-x-3">
          {/* Search Icon */}
          <button 
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200" 
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-700 hover:text-gray-900 sm:w-5 sm:h-5"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          {/* Account Icon / Logout - Hidden on mobile */}
          {/* Auth removed - no account icon needed */}

          {/* Removed Compare icon button as it had no purpose */}

          {/* Heart Icon - Hidden on mobile */}
          <Link 
            to="/wishlist"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 relative hidden lg:block" 
            aria-label="Wishlist"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-700 hover:text-gray-900"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {/* Wishlist count badge */}
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Bag Icon */}
          <Link 
            to="/cart"
            className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 relative" 
            aria-label="Shopping Cart"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-700 hover:text-gray-900 sm:w-[18px] sm:h-[18px]"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {/* Cart count badge */}
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-xs rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center font-bold text-[9px] sm:text-[10px]">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay - starts below announcement bar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-x-0 bottom-0 bg-black bg-opacity-50 z-[90] lg:hidden"
          style={{ top: `${announcementBarHeight}px` }}
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile Sidebar - positioned below announcement bar */}
      <div 
        ref={sidebarRef} 
        role="dialog" 
        aria-modal="true" 
        aria-label="Mobile menu" 
        className={`fixed left-0 w-80 bg-white z-[100] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`} 
        style={{ 
          fontFamily: "'Albert Sans', sans-serif",
          top: `${announcementBarHeight}px`,
          height: `calc(100vh - ${announcementBarHeight}px)`,
          maxHeight: `calc(100vh - ${announcementBarHeight}px)`
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <img
            src={logoUrl}
            alt={logoAlt}
            className="h-5 w-auto"
          />
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close menu"
            ref={closeButtonRef}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-700"
            >
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Sidebar Content - scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Menu */}
          <div className="px-4 py-2">
            {/* Dynamic Navigation Links from siteConfig */}
            {navData.mainMenu.map((item, index) => (
              <div className="mb-2" key={index}>
                <Link 
                  to={item.link}
                  className="w-full flex items-center justify-between py-2 text-left font-medium text-gray-900 hover:text-black transition-colors"
                  onClick={() => { setIsSidebarOpen(false); window.scrollTo(0, 0); }}
                >
                  <span className="text-black">{item.name}</span>
                </Link>
              </div>
            ))}

            {/* Quick Actions */}
            <div className="flex gap-2 mb-3 mt-3">
              <Link 
                to="/wishlist"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => { setIsSidebarOpen(false); window.scrollTo(0, 0); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span className="text-sm font-medium">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => { setIsSidebarOpen(false); setIsSearchOpen(true); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <span className="text-sm font-medium">Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 px-4 py-2">
          {/* Language and Currency removed as requested */}
        </div>
      </div>

      {/* Search Sidebar */}
      <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
