import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Product } from '../types';
import { getHotDealProducts, calculateDiscountPercentage } from '../services/dataService';
import siteConfigService from '../services/siteConfigService';

// Icon Props interface
interface IconProps {
  className?: string;
}

// Icons
const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ArrowRightIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// Close Icon
const CloseIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Active Deal Badge Component Props
interface ActiveDealBadgeProps {
  product: Product;
  onClose: (dealId: string) => void;
  dealId: string;
  // Optional variant-aware active price to compute discount accurately
  activePrice?: number;
}

const ActiveDealBadge: React.FC<ActiveDealBadgeProps> = ({ product, onClose, dealId, activePrice }) => {
  // Use centralized discount calculation; prefer active variant price when provided
  const effectivePrice = typeof activePrice === 'number' ? activePrice : product.price;
  const discountPercent = calculateDiscountPercentage(product.originalPrice || 0, effectivePrice);
  
  return (
    <div className="absolute top-2 left-2 z-20 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
      <span style={{ fontFamily: "'Albert Sans', sans-serif" }}>{discountPercent}% OFF</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(dealId);
        }}
        className="ml-1 hover:bg-gray-600 rounded-full p-0.5 transition-colors"
        aria-label="Close deal badge"
      >
        <CloseIcon className="w-3 h-3" />
      </button>
    </div>
  );
};

// Deal Card Component Props
interface DealCardProps {
  deal: Product;
  onColorSelect: (dealId: string, colorIndex: number) => void;
  onCloseDeal: (dealId: string) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onColorSelect, onCloseDeal }) => {
  const navigate = useNavigate();
  // Unified product id getter to support both `_id` and `id`
  const getPid = (p: Product) => String((p as any)._id || (p as any).id || '');
  // Determine currently selected color index; default to 0
  const selectedColorIndex = Math.max(0, (deal.colors?.findIndex(c => c.selected) ?? 0));
  // Optional variant-aware pricing (backend may provide an array); fall back to base price
  const variantPrices = (deal as any).variantPrices as number[] | undefined;
  const activePrice = Array.isArray(variantPrices) && variantPrices[selectedColorIndex] != null
    ? variantPrices[selectedColorIndex]
    : deal.price;
  const variantOriginalPrices = (deal as any).variantOriginalPrices as number[] | undefined;
  const activeOriginalPrice = Array.isArray(variantOriginalPrices) && variantOriginalPrices[selectedColorIndex] != null
    ? variantOriginalPrices[selectedColorIndex]
    : deal.originalPrice;
  // Check if this product has color variants
  const hasColors = deal.colors && deal.colors.length > 0;
  // Normalize and sanitize image URL from product data
  const resolveImageSrc = (raw?: string): string => {
    const src = (raw || '').trim();
    if (!src) return '/images/placeholder.svg';
    // If absolute URL, return as-is
    if (/^https?:\/\//i.test(src)) return src;
    // If already points to API images or proper root images path, keep
    if (src.startsWith('/api/images/')) return src;
    // Ensure it starts with /images/
    if (src.startsWith('/images/')) return src;
    // Handle values like 'images/...' or filename only
    return `/images/${src.replace(/^\/?/, '')}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'block';
    target.style.backgroundColor = '#f3f4f6';
    target.alt = 'Image not found';
  };

  const handleImageLoad = (_e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    // Image loaded successfully
  };

  // Compute active image: try image per color index; fallback to first image
  const activeImage = (deal.images && deal.images[selectedColorIndex]) ? deal.images[selectedColorIndex] : (deal.images?.[0]);

  // Card-level navigation handler (click/keyboard)
  const goToProduct = () => navigate(`/product/${getPid(deal)}`);
  const onKeyActivate: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToProduct();
    }
  };

  return (
    <div
      className="relative transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg rounded-lg overflow-hidden flex-shrink-0 mr-8"
      style={{ 
      width: 'clamp(220px, 20vw, 300px)',
      height: hasColors ? 'clamp(400px, 35vw, 480px)' : 'clamp(360px, 32vw, 440px)',
      backgroundColor: '#fafafa' 
    }}
      role="button"
      tabIndex={0}
      aria-label={`${deal.name} details`}
      onClick={goToProduct}
      onKeyDown={onKeyActivate}
    >
      {/* Active Deal Badge */}
      {((activeOriginalPrice ?? deal.originalPrice) && (activeOriginalPrice ?? deal.originalPrice)! > activePrice) && (
        <ActiveDealBadge 
          product={deal}
          onClose={onCloseDeal}
          dealId={getPid(deal)}
          activePrice={activePrice}
        />
      )}
      
      {/* Product Image */}
      <div className="w-full flex items-center justify-center bg-gray-50 overflow-hidden relative" style={{ 
        height: 'clamp(240px, 21vw, 288px)'
      }}>
        <img
          src={resolveImageSrc(activeImage)}
          alt={deal.name}
          className="w-full h-full max-w-full max-h-full object-cover"
          style={{
            fontFamily: "'Albert Sans', sans-serif",
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
            minHeight: '100%',
            maxHeight: '100%',
            minWidth: '100%',
            maxWidth: '100%',
            objectFit: 'cover'
          }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
      
      {/* Content Section */}
      <div className="w-full text-center px-3" style={{ paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Product Name */}
        <h3 
          className="text-black leading-tight flex items-center justify-center" 
          style={{ 
            fontSize: '16px', 
            fontFamily: "'Albert Sans', sans-serif", 
            fontWeight: 'normal',
            height: 'clamp(40px, 8vw, 50px)',
            minHeight: 'clamp(40px, 8vw, 50px)',
            maxHeight: 'clamp(40px, 8vw, 50px)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          {deal.name}
        </h3>
        
        {/* Price */}
        <div>
          <span className="text-black" style={{ fontSize: '16px', fontFamily: "'Albert Sans', sans-serif", fontWeight: '600' }}>
            ₹{activePrice}
          </span>
          {activeOriginalPrice && (
            <span className="text-gray-600 line-through ml-2" style={{ fontSize: '16px', fontFamily: "'Albert Sans', sans-serif", fontWeight: '600' }}>
              ₹{activeOriginalPrice}
            </span>
          )}
        </div>
        
        {/* Color Swatches - Only show if colors exist */}
        {deal.colors && deal.colors.length > 0 && (
          <div className="flex justify-center gap-2" style={{ minHeight: '24px' }}>
            {deal.colors.slice(0, 2).map((color, index) => (
              <button
                type="button"
                 key={`${getPid(deal)}-${color.name}-${index}`}
                 onClick={(e) => { e.stopPropagation(); onColorSelect(getPid(deal), index); }}
                 onKeyDown={(e) => {
                   // Prevent card activation when navigating with keyboard on swatches
                   if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
                 }}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  color.selected 
                    ? 'border-black shadow-md scale-110' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.value }}
                aria-label={`Select ${color.name} color`}
                aria-pressed={!!color.selected}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Deals Carousel Component Props
interface DealsCarouselProps {
  deals: Product[];
  currentIndex: number;
  onColorSelect: (dealId: string, colorIndex: number) => void;
  onCloseDeal: (dealId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  isTransitioning: boolean;
}

const DealsCarousel: React.FC<DealsCarouselProps> = ({ 
  deals, 
  currentIndex, 
  onColorSelect, 
  onCloseDeal, 
  onPrevious, 
  onNext, 
  isTransitioning 
}) => {
  const getVisibleCards = (): number => {
    if (typeof window !== 'undefined') {
      const vw = window.innerWidth;
      if (vw >= 1280) return 4;
      if (vw >= 1024) return 3;
      if (vw >= 694) return 2;
      return 1;
    }
    return 4;
  };

  const visibleCards = getVisibleCards();
  const cardWidth = Math.max(220, Math.min((typeof window !== 'undefined' ? window.innerWidth : 1200) * 0.20, 300));
  const GAP = 32;
  const containerWidth = (cardWidth * visibleCards) + (GAP * (visibleCards - 1));

  // Create infinite array
  const infiniteDeals = [...deals, ...deals, ...deals, ...deals, ...deals];

  return (
    <div className="relative flex justify-center items-start w-full px-4 sm:px-8 md:px-12 lg:px-16">
      {/* Left Arrow */}
      <button
        onClick={onPrevious}
        disabled={isTransitioning}
        className="absolute left-2 sm:left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-black text-black hover:text-white transition-all duration-300 rounded-full shadow-lg w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center group disabled:opacity-50"
        aria-label="Previous deals"
      >
        <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      
      {/* Carousel Container */}
      <div className="overflow-hidden mx-auto" style={{ width: `${containerWidth}px` }}>
        <div 
          className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{
            transform: `translateX(-${currentIndex * (cardWidth + GAP)}px)`,
            fontFamily: "'Albert Sans', sans-serif"
          }}
        >
          {infiniteDeals.map((deal, index) => (
            <DealCard
              key={`infinite-${(deal as any)._id || (deal as any).id}-${index}`}
              deal={deal}
              onColorSelect={onColorSelect}
              onCloseDeal={onCloseDeal}
            />
          ))}
        </div>
      </div>
      
      {/* Right Arrow */}
      <button
        onClick={onNext}
        disabled={isTransitioning}
        className="absolute right-2 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-black text-black hover:text-white transition-all duration-300 rounded-full shadow-lg w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center group disabled:opacity-50"
        aria-label="Next deals"
      >
        <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

const HotDealsSection: React.FC = () => {
  const [homepage, setHomepage] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // CENTRALIZED DATA LOADING - Load all data from single service
    const loadData = async () => {
      try {
        const [homepageConfig, hotDealProducts] = await Promise.all([
          siteConfigService.getHomepage(),
          getHotDealProducts()
        ]);
        setHomepage(homepageConfig);

        // Check if hot deals section is disabled
        if (homepageConfig?.hotDealsSection?.enabled === false) {
          setProducts([]);
          setIsLoading(false);
          return;
        }

        // Only show products marked as hotDeal
        let deals = Array.isArray(hotDealProducts) ? hotDealProducts : [];

        setProducts(deals);
        setIsLoading(false);
      } catch (_error) {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNext = (): void => {
    if (isTransitioning || !products.length) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
    
    setTimeout(() => {
      setIsTransitioning(false);
      // Reset to beginning of actual deals when reaching end of first set
      if (currentIndex >= products.length) {
        setCurrentIndex(0);
      }
    }, 500);
  };

  const handlePrevious = (): void => {
    if (isTransitioning || !products.length) return;
    
    setIsTransitioning(true);
    
    if (currentIndex === 0) {
      // Jump to end of first set of deals
      setCurrentIndex(products.length - 1);
    } else {
      setCurrentIndex(prev => prev - 1);
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const handleColorSelect = (dealId: string, colorIndex: number): void => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        (String((product as any)._id || (product as any).id) === String(dealId))
          ? {
              ...product,
              colors: product.colors?.map((color, index) => ({
                ...color,
                selected: index === colorIndex
              }))
            }
          : product
      )
    );
  };

  const handleCloseDeal = (dealId: string): void => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        (String((product as any)._id || (product as any).id) === String(dealId))
          ? { ...product, onSale: false, dealText: "" }
          : product
      )
    );
  };

  // Auto-scroll every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, isTransitioning, products.length]);

  if (isLoading) return <div className="py-6 sm:py-10 md:py-12 lg:py-16 text-center">Loading...</div>;
  if (!homepage) return <div className="py-6 sm:py-10 md:py-12 lg:py-16 text-center">Loading...</div>;

  // Check if section is disabled
  if (homepage?.hotDealsSection?.enabled === false) {
    return null;
  }

  if (!products.length) return null; // Don't show section if no deals

  const hotDealsSection = homepage?.hotDealsSection || { title: 'Hot Deals', subtitle: '', viewAllText: 'View All', viewAllLink: '/products' };

  return (
    <section className="py-2 sm:py-10 md:py-12 lg:py-16 bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-10 lg:mb-12 text-center">
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-black mb-2 sm:mb-6"
            style={{ fontFamily: "'Albert Sans', sans-serif" }}
          >
            {hotDealsSection.title}
          </h2>
          {/* Divider below section title */}
          <div className="w-3/4 sm:w-4/5 lg:w-5/6 h-[2px] bg-gray-300 rounded-full mx-auto transition-colors" />
        </div>

        {/* Deals Carousel */}
        <DealsCarousel
          deals={products}
          currentIndex={currentIndex}
          onColorSelect={handleColorSelect}
          onCloseDeal={handleCloseDeal}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isTransitioning={isTransitioning}
        />

        {/* View All Button */}
        <div className="text-center mt-6">
          <a
            href={hotDealsSection.viewAllLink || '/products'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-all duration-300"
            style={{ fontFamily: "'Albert Sans', sans-serif" }}
          >
            {hotDealsSection.viewAllText || 'View All'}
            <ArrowRightIcon className="ml-1.5 w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HotDealsSection;
