import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Toast from './components/Toast'
import AnnouncementBar from './components/AnnouncementBar.tsx'
import Navbar from './components/Navbar.tsx'
import HeroCarousel from './components/HeroCarousel.tsx'
import ServiceFeaturesSection from './components/ServiceFeaturesSection.tsx'
import HotDealsSection from './components/HotDealsSection.tsx'
import TwoBoxSection from './components/TwoBoxSection.tsx'
import TestimonialSection from './components/TestimonialSection.tsx'
import Footer from './components/Footer.tsx'
import ContactUs from './components/ContactUs.tsx'
import AboutUs from './components/AboutUs.tsx'
import FAQPage from './components/FAQPage.tsx'
import ProductListingPage from './components/ProductListingPage.tsx'
import ProductDetailPage from './components/ProductDetailPage.tsx'
import WishlistPage from './pages/WishlistPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import UPIPaymentPage from './pages/UPIPaymentPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import OrderTracking from './components/OrderTracking'
import PoliciesPage from './pages/PoliciesPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'
import { useFavicon } from './hooks/useFavicon'

// Scroll to top component - scrolls to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
};

// Home page component
const HomePage: React.FC = () => (
  <>
    <HeroCarousel />
    <ServiceFeaturesSection />
    <HotDealsSection />
    <TwoBoxSection />
    <TestimonialSection />
  </>
);

const App: React.FC = () => {
  const [announcementHeight, setAnnouncementHeight] = useState<number>(0);
  const [cartLimitToast, setCartLimitToast] = useState<{ message: string; isVisible: boolean }>({ message: '', isVisible: false });

  // Load favicon from site config
  useFavicon();

  // Listen for cart limit exceeded events from cartService
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail?.message || 'Cart limit of ₹2,000 reached.';
      setCartLimitToast({ message: msg, isVisible: true });
    };
    window.addEventListener('cart:limit-exceeded', handler);
    return () => window.removeEventListener('cart:limit-exceeded', handler);
  }, []);

  // Adjust layout padding based on AnnouncementBar height
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<number>;
      const h = typeof custom.detail === 'number' ? custom.detail : 0;
      setAnnouncementHeight(h);
    };
    window.addEventListener('announcementbar:height', handler as EventListener);
    return () => window.removeEventListener('announcementbar:height', handler as EventListener);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <AnnouncementBar />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/shop" element={<ProductListingPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/upi-payment" element={<UPIPaymentPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
          <Route path="/policies" element={<PoliciesPage />} />
          {/* Policy pages */}
          <Route path="/refund-policy" element={<PoliciesPage />} />
          <Route path="/terms-conditions" element={<PoliciesPage />} />
          <Route path="/privacy-policy" element={<PoliciesPage />} />
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
      <Toast
        message={cartLimitToast.message}
        type="error"
        isVisible={cartLimitToast.isVisible}
        onClose={() => setCartLimitToast(prev => ({ ...prev, isVisible: false }))}
      />
    </Router>
  )
}

export default App
