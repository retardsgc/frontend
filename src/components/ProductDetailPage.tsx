import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, Color, SizeOption } from '../types';
// CENTRALIZED DATA SERVICE - Single source for all product data
import {
  getProductById,
  getRelatedProducts,
  getSiteConfig,
  calculateDiscountPercentage
} from '../services/dataService.js';
import cartService from '../services/cartService';
import wishlistService from '../services/wishlistService';
import { getImageUrl } from '../utils/imageUrl';

interface ArrowIconProps {
  className?: string;
}

interface ZoomPosition {
  x: number;
  y: number;
}

// Arrow Icon Components for Carousel
const ArrowLeftIcon: React.FC<ArrowIconProps> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ArrowRightIcon: React.FC<ArrowIconProps> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Async-loaded data
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      if (!id) return;
      try {
        const prod = await getProductById(id);
        if (!isActive) return;
        setCurrentProduct(prod);
        if (prod) {
          // Use categoryId field for proper category matching
          const catId = prod.categoryId || null;
          const rel = await getRelatedProducts((prod._id || prod.id || '').toString(), catId, 12);
          if (!isActive) return;
          setRelatedProducts(rel);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };
    load();
    return () => { isActive = false; };
  }, [id]);

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>('black');
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState<ZoomPosition>({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize selected options after product is loaded
  useEffect(() => {
    if (currentProduct) {
      setSelectedColor(currentProduct.colors?.[0]?.name || '');
      setSelectedImage(0); // Reset to first image when product changes
      // Set first size option as default
      const firstSize = currentProduct.sizes?.[0];
      setSelectedSize(firstSize || null);
    }
  }, [currentProduct]);

  // Get images for the currently selected color (or all images if no color selected/no color images)
  const getDisplayImages = (): string[] => {
    if (!currentProduct) return [];
    
    // Check if selected color has images
    if (selectedColor && currentProduct.colors) {
      const colorObj = currentProduct.colors.find((c: Color) => c.name === selectedColor);
      const colorImages = (colorObj as any)?.images;
      if (colorImages && Array.isArray(colorImages) && colorImages.length > 0) {
        return colorImages;
      }
    }
    // Fallback to all product images
    return currentProduct.images || [];
  };

  const displayImages = getDisplayImages();

  // Reset selected image when color changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  // Get the current price based on selected size (if size has price, use it)
  const getCurrentPrice = (): { price: number; originalPrice: number } => {
    if (!currentProduct) return { price: 0, originalPrice: 0 };
    
    // If a size is selected and has a price, use that price
    if (selectedSize && selectedSize.price > 0) {
      // Calculate original price proportionally if product has discount
      const discountRatio = currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price
        ? currentProduct.originalPrice / currentProduct.price
        : 1;
      return {
        price: selectedSize.price,
        originalPrice: Math.round(selectedSize.price * discountRatio)
      };
    }
    
    return {
      price: currentProduct.price,
      originalPrice: currentProduct.originalPrice || currentProduct.price
    };
  };

  // Get the current main image based on selected color and thumbnail
  const getCurrentImage = (): string => {
    if (!currentProduct) return '';
    
    // Use displayImages which are already filtered by color
    return getImageUrl(displayImages[selectedImage] || displayImages[0] || currentProduct.images[0]);
  };

  const { price: displayPrice, originalPrice: displayOriginalPrice } = getCurrentPrice();
  const displayImage = getCurrentImage();

  // Check if device is desktop
  useEffect(() => {
    const checkScreenSize = (): void => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Carousel state - initialized after relatedProducts is defined
  const [currentIndex, setCurrentIndex] = useState<number>(0); // Will update after relatedProducts load
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Compute display products for carousel - only repeat if there are enough unique products
  const carouselProducts = React.useMemo(() => {
    if (relatedProducts.length === 0) return [];
    // If we have 4+ unique products, create infinite scroll by repeating
    if (relatedProducts.length >= 4) {
      return [...relatedProducts, ...relatedProducts, ...relatedProducts, ...relatedProducts, ...relatedProducts];
    }
    // Otherwise just show the unique products without repeating
    return relatedProducts;
  }, [relatedProducts]);

  // Check if carousel should be enabled (need enough products for scrolling to make sense)
  const isCarouselEnabled = relatedProducts.length >= 4;

  useEffect(() => {
    if (isCarouselEnabled) {
      setCurrentIndex(relatedProducts.length); // Start from middle of infinite array when items available
    } else {
      setCurrentIndex(0);
    }
  }, [relatedProducts.length, isCarouselEnabled]);

  const handleQuantityChange = (change: number): void => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleAddToCart = async () => {
    if (!currentProduct) return;
    try {
      await cartService.addToCart(currentProduct._id || currentProduct.id, quantity, selectedColor, selectedSize?.name || '');
      // cartService already dispatches 'cart:changed' or 'cart:limit-exceeded'
    } catch (error) {
      // Error handled silently
    }
  };

  const handleAddToWishlist = async () => {
    if (!currentProduct) return;
    try {
      await wishlistService.addToWishlist(currentProduct._id || currentProduct.id);
      // wishlistService already dispatches 'wishlist:changed'
    } catch (error) {
      // Error handled silently
    }
  };

  const handleBuyNow = async () => {
    if (!currentProduct) return;

    try {
      const result = await cartService.addToCart(currentProduct._id || currentProduct.id, quantity, selectedColor, selectedSize?.name || '');
      if (!result) return; // blocked by cart limit
      setInCart(true);
      navigate('/checkout');
    } catch (error) {
      // Error handled silently
    }
  };

  // Visual state: in cart / in wishlist
  const [inCart, setInCart] = React.useState(false);
  const [inWishlist, setInWishlist] = React.useState(false);
  React.useEffect(() => {
    if (!currentProduct) return;
    let mounted = true;
    const refresh = async () => {
      const [cartIds, wishIds] = await Promise.all([
        cartService.getCartIds(),
        wishlistService.getWishlistIds(),
      ]);
      if (!mounted) return;
      const pid = String(currentProduct._id || currentProduct.id);
      setInCart(cartIds.has(pid));
      setInWishlist(wishIds.has(pid));
    };
    refresh();
    const onCart = () => refresh();
    const onWish = () => refresh();
    window.addEventListener('cart:changed', onCart);
    window.addEventListener('wishlist:changed', onWish);
    return () => {
      mounted = false;
      window.removeEventListener('cart:changed', onCart);
      window.removeEventListener('wishlist:changed', onWish);
    };
  }, [currentProduct?._id, currentProduct?.id]);

  // Related products quick actions: maintain cart/wishlist membership sets for visual indicators
  const [relatedCartIds, setRelatedCartIds] = React.useState<Set<string>>(new Set());
  const [relatedWishIds, setRelatedWishIds] = React.useState<Set<string>>(new Set());
  React.useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const [c, w] = await Promise.all([
          cartService.getCartIds(),
          wishlistService.getWishlistIds(),
        ]);
        if (!mounted) return;
        setRelatedCartIds(new Set(Array.from(c)));
        setRelatedWishIds(new Set(Array.from(w)));
      } catch {}
    };
    refresh();
    const onCart = () => refresh();
    const onWish = () => refresh();
    window.addEventListener('cart:changed', onCart);
    window.addEventListener('wishlist:changed', onWish);
    return () => {
      mounted = false;
      window.removeEventListener('cart:changed', onCart);
      window.removeEventListener('wishlist:changed', onWish);
    };
  }, []);

  // Mobile collapsible state for sections (must be declared before any early returns to preserve hook order)
  const [mobileInfoOpen, setMobileInfoOpen] = useState<{pricing:boolean;color:boolean;size:boolean;details:boolean}>(
    { pricing: true, color: true, size: false, details: false }
  );

  const isInRelatedCart = (p: Product) => relatedCartIds.has(String((p as any)._id || (p as any).id));
  const isInRelatedWishlist = (p: Product) => relatedWishIds.has(String((p as any)._id || (p as any).id));

  const handleQuickAddToCart = async (p: Product, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (isInRelatedCart(p)) return;
    try {
      await cartService.addToCart((p as any)._id || (p as any).id, 1);
      // cartService dispatches 'cart:changed' or 'cart:limit-exceeded'
    } catch (error) {
      // Error handled silently
    }
  };

  const handleQuickWishlist = async (p: Product, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      await wishlistService.addToWishlist((p as any)._id || (p as any).id);
      // wishlistService dispatches 'wishlist:changed'
    } catch (error) {
      // Error handled silently
    }
  };

  // Carousel navigation handlers
  const handlePrevious = (): void => {
    if (isTransitioning || !isCarouselEnabled) return;

    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);

    setTimeout(() => {
      setIsTransitioning(false);
      // Reset position if we've scrolled too far left
      setCurrentIndex(prevIndex => {
        if (prevIndex <= 0) {
          return relatedProducts.length * 2; // Jump to equivalent position in the middle
        }
        return prevIndex;
      });
    }, 500);
  };

  const handleNext = (): void => {
    if (isTransitioning || !isCarouselEnabled) return;

    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);

    setTimeout(() => {
      setIsTransitioning(false);
      // Reset position if we've scrolled too far right
      setCurrentIndex(prevIndex => {
        if (prevIndex >= relatedProducts.length * 4) {
          return relatedProducts.length * 2; // Jump to equivalent position in the middle
        }
        return prevIndex;
      });
    }, 500);
  };

  // If still loading or product not found
  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;
  }
  if (!currentProduct) {
    return <div className="min-h-[50vh] flex items-center justify-center">Product not found.</div>;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>): void => {
    if (!imageRef.current || !isDesktop) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate percentage position
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setZoomPosition({ x: xPercent, y: yPercent });
  };

  const handleMouseEnter = (): void => {
    if (!isDesktop) return;
    setIsZoomed(true);
  };

  const handleMouseLeave = (): void => {
    if (!isDesktop) return;
    setIsZoomed(false);
  };


  const hasColors = Array.isArray(currentProduct.colors) && currentProduct.colors.length > 0;
  const hasSizes = Array.isArray(currentProduct.sizes) && currentProduct.sizes.length > 0;
  
  // Get available sizes from sizes array (now as SizeOption objects)
  const availableSizes: SizeOption[] = currentProduct.sizes || [];

  // Calculate discount percentage based on current variant price
  const discountPercentage = displayOriginalPrice > displayPrice 
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;

  return (
    <div className={`min-h-screen bg-white ${relatedProducts.length > 0 ? 'pb-20' : 'pb-12 sm:pb-6'}`} style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 lg:py-10 xl:py-12">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Right Column (moves below images on mobile) - Product Information */}
          <div className="space-y-4 sm:space-y-5 lg:space-y-6 pt-4 lg:pt-0">
            {/* Product Title */}
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-medium text-black leading-tight" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              {currentProduct.name}
            </h1>

            {/* Pricing Row - Dynamic based on selected size */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-wrap">
              <span className="text-xl lg:text-2xl xl:text-3xl font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{displayPrice}</span>
              {discountPercentage > 0 && (
                <span className="inline-flex items-center px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-xs lg:text-sm font-medium bg-gray-100 text-gray-800" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                  {discountPercentage}% OFF
                </span>
              )}
              {displayOriginalPrice > displayPrice && (
                <span className="text-sm sm:text-base lg:text-lg text-gray-600 line-through" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{displayOriginalPrice}</span>
              )}
            </div>
            {/* Color Selector - Always visible */}
            {hasColors && (
              <div className="space-y-2 lg:space-y-3 border-t pt-3 lg:pt-5">
                <h3 className="text-sm lg:text-base font-medium text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Color: <span className="font-normal capitalize">{selectedColor}</span></h3>
                <div className="flex gap-1.5 lg:gap-2">
                  {currentProduct.colors!.map((color: Color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full border-2 transition-all duration-200 ${
                        selectedColor === color.name ? 'border-black' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {color.value === '#FFFFFF' && (
                        <div className="w-full h-full rounded-full border border-gray-200"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector - Always visible */}
            {hasSizes && (
              <div className="space-y-2 lg:space-y-3 border-t pt-3 lg:pt-5">
                <h3 className="text-sm lg:text-base font-medium text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Size: <span className="font-normal">{selectedSize?.name || 'Select a size'}</span></h3>
                <div className="flex gap-1.5 lg:gap-2 flex-wrap">
                  {availableSizes.map((size: SizeOption) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size)}
                      className={`px-2.5 lg:px-3 py-1.5 lg:py-2 border text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedSize?.name === size.name
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                      style={{ fontFamily: "'Albert Sans', sans-serif" }}
                    >
                      {size.name}{size.price > 0 && ` - ₹${size.price}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions (desktop primary area) */}
            <div className="space-y-3 lg:space-y-4 hidden sm:block">
              {/* Quantity Stepper */}
              <div className="flex items-center gap-3 lg:gap-4">
                <span className="text-sm lg:text-base font-medium text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Quantity</span>
                <div className="flex items-center border border-gray-300">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-2.5 lg:px-3 py-1.5 lg:py-2 hover:bg-gray-50 transition-colors text-gray-600 text-sm"
                    style={{ fontFamily: "'Albert Sans', sans-serif" }}
                  >
                    -
                  </button>
                  <span className="px-3 lg:px-4 py-1.5 lg:py-2 border-x border-gray-300 min-w-[40px] lg:min-w-[50px] text-center text-xs lg:text-sm" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-2.5 lg:px-3 py-1.5 lg:py-2 hover:bg-gray-50 transition-colors text-gray-600 text-sm"
                    style={{ fontFamily: "'Albert Sans', sans-serif" }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 lg:space-y-4">
                <div className="flex gap-2 lg:gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={inCart}
                    className={`flex-1 py-2.5 lg:py-4 px-4 lg:px-6 rounded-lg font-semibold text-sm lg:text-lg transition-colors ${inCart ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                    style={{ fontFamily: "'Albert Sans', sans-serif" }}
                  >
                    {inCart ? 'In Cart' : `Add to Cart - ₹${(displayPrice * quantity).toFixed(2)}`}
                  </button>
                  <button
                    onClick={handleAddToWishlist}
                    className={`p-2.5 lg:p-4 rounded-lg transition-colors ${inWishlist ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    title={inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                  >
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-yellow-400 text-black py-2.5 lg:py-4 px-4 lg:px-6 rounded-lg font-semibold text-sm lg:text-lg hover:bg-yellow-500 transition-colors"
                  style={{ fontFamily: "'Albert Sans', sans-serif" }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Left Column - Image Gallery */}
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-4 mb-3 lg:mb-0 lg:order-first">
            {/* Thumbnails (horizontal scroll on mobile) - Shows only selected color's images */}
            <div className="flex lg:flex-col gap-2 lg:gap-3 order-2 lg:order-1 overflow-x-auto pb-1 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0 scrollbar-hide">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 flex-shrink-0 lg:w-24 lg:h-24 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                    selectedImage === index ? 'border-black shadow-md' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  aria-label={`Show image ${index + 1}`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-full max-w-full max-h-full object-cover"
                    style={{
                      minHeight: '100%',
                      maxHeight: '100%',
                      minWidth: '100%',
                      maxWidth: '100%',
                      objectFit: 'cover'
                    }}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            {/* Main Image - Shows color-specific image if available */}
            <div className="flex-1 order-1 lg:order-2 relative">
              <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden shadow-md relative">
                <img
                  ref={imageRef}
                  src={displayImage}
                  alt={currentProduct.name}
                  className={`w-full h-full max-w-full max-h-full object-cover ${isDesktop ? 'cursor-crosshair' : ''}`}
                  style={{
                    minHeight: '100%',
                    maxHeight: '100%',
                    minWidth: '100%',
                    maxWidth: '100%',
                    objectFit: 'cover'
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  loading="eager"
                />
                {isZoomed && isDesktop && (
                  <div
                    className="absolute border-2 border-white shadow-lg pointer-events-none"
                    style={{
                      width: '120px',
                      height: '120px',
                      left: `calc(${zoomPosition.x}% - 60px)`,
                      top: `calc(${zoomPosition.y}% - 60px)`,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(1px)',
                    }}
                  />
                )}
              </div>
              {isZoomed && isDesktop && (
                <div className="hidden lg:block absolute top-0 left-full ml-4 w-80 h-80 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-10">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${displayImage})`,
                      backgroundSize: '300% 300%',
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    3x Zoom
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

  {/* Info Cards (stack then grid) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 lg:gap-6 mt-4 sm:mt-6 lg:mt-12 mb-4 sm:mb-8 lg:mb-16">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div className="min-w-0">
              <h4 className="font-semibold text-black text-xs sm:text-sm lg:text-base" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Delivery Time</h4>
              <p className="text-xs lg:text-sm text-gray-600" style={{ fontFamily: "'Albert Sans', sans-serif" }}>12–26 days international, 3–6 USA</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <div className="min-w-0">
              <h4 className="font-semibold text-black text-xs sm:text-sm lg:text-base" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Return Policy</h4>
              <p className="text-xs lg:text-sm text-gray-600" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Return within 30 days of purchase</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="min-w-0">
              <h4 className="font-semibold text-black text-xs sm:text-sm lg:text-base" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Guarantee Safe Checkout</h4>
              <p className="text-xs lg:text-sm text-gray-600" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Secure payment processing</p>
            </div>
          </div>
        </div>

          {/* Description Section */}
          {currentProduct.description && (
            <div className="border-t border-gray-200 pt-4 lg:pt-8" id="details-section">
              <h3 className="text-base lg:text-xl font-bold text-black mb-2 lg:mb-4" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Description</h3>
              <p className="text-gray-700 text-xs sm:text-sm lg:text-base leading-relaxed">{currentProduct.description}</p>
            </div>
          )}

        {/* Related Products - Improved Desktop Grid & Mobile Carousel */}
        <div className="border-t border-gray-200 pt-4 sm:pt-6 lg:pt-8 mt-4 sm:mt-6 lg:mt-8">
          <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-8">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              You May Also Like
            </h2>
            {/* Mobile Carousel Navigation */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setCarouselIndex(prev => prev === 0 ? relatedProducts.length - 1 : prev - 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCarouselIndex(prev => prev === relatedProducts.length - 1 ? 0 : prev + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {relatedProducts.length > 0 ? (
            <>
              {/* Desktop Grid View - 4 columns */}
              <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 8).map((product) => (
                  <Link 
                    key={(product._id || product.id)}
                    to={`/product/${(product._id || product.id)}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      {/* Image Container */}
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
                        <img
                          src={getImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        {/* Overlay gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Quick Actions */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={(e) => handleQuickWishlist(product, e)}
                            title={isInRelatedWishlist(product) ? 'In Wishlist' : 'Add to Wishlist'}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all ${
                              isInRelatedWishlist(product) 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white/90 hover:bg-white text-gray-700 hover:text-red-500'
                            }`}
                          >
                            <svg className="w-5 h-5" fill={isInRelatedWishlist(product) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleQuickAddToCart(product, e)}
                            disabled={isInRelatedCart(product)}
                            title={isInRelatedCart(product) ? 'In Cart' : 'Add to Cart'}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all ${
                              isInRelatedCart(product) 
                                ? 'bg-green-500 text-white cursor-default' 
                                : 'bg-white/90 hover:bg-white text-gray-700 hover:text-black'
                            }`}
                          >
                            {isInRelatedCart(product) ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                          </button>
                        </div>
                        
                        {/* Discount Badge */}
                        {product.originalPrice && product.price < product.originalPrice && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[40px] group-hover:text-blue-600 transition-colors" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                            ₹{product.price}
                          </span>
                          {product.originalPrice && product.price < product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                        {/* Rating Stars */}
                        {product.rating > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg 
                                  key={star} 
                                  className={`w-3.5 h-3.5 ${star <= product.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">({product.reviews})</span>
                          </div>
                        )}
                        {/* Color Dots */}
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {product.colors.slice(0, 4).map((color, colorIndex) => (
                              <div
                                key={colorIndex}
                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200"
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                            {product.colors.length > 4 && (
                              <span className="text-xs text-gray-400 ml-1">+{product.colors.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mobile Carousel */}
              <div className="lg:hidden relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${carouselIndex * 50}%)` }}
                >
                  {/* Infinite loop - duplicate products */}
                  {[...relatedProducts, ...relatedProducts].map((product, idx) => (
                    <div
                      key={`${product._id || product.id}-${idx}`}
                      className="w-1/2 flex-shrink-0 px-1.5"
                    >
                      <Link 
                        to={`/product/${(product._id || product.id)}`}
                        className="group block"
                      >
                        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
                            <img
                              src={getImageUrl(product.images[0])}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                            {product.originalPrice && product.price < product.originalPrice && (
                              <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                              </div>
                            )}
                          </div>
                          <div className="p-2.5">
                            <h3 className="text-xs font-semibold text-gray-900 line-clamp-1 mb-1" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-black">₹{product.price}</span>
                              {product.originalPrice && product.price < product.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                
                {/* Carousel Dots */}
                {relatedProducts.length > 2 && (
                  <div className="flex justify-center gap-1.5 mt-4">
                    {relatedProducts.slice(0, 6).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={`transition-all duration-300 rounded-full ${
                          carouselIndex % relatedProducts.length === idx 
                            ? 'w-5 h-1.5 bg-black' 
                            : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="animate-pulse flex gap-3">
                <div className="flex-1 bg-gray-100 rounded-xl h-48"></div>
                <div className="flex-1 bg-gray-100 rounded-xl h-48"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-2.5 py-2">
          {/* Price Row */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-sm font-semibold">₹{(displayPrice * quantity).toFixed(2)}</span>
            </div>
            <button
              onClick={handleAddToWishlist}
              aria-label={inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              className={`p-2 rounded-full border ${inWishlist ? 'bg-red-100 border-red-300 text-red-600' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
            >
              <svg className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
          {/* Action Buttons Row */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddToCart}
              disabled={inCart}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-colors ${inCart ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              {inCart ? 'In Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-2 px-3 rounded-lg font-semibold text-xs bg-yellow-400 text-black hover:bg-yellow-500 transition-colors"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
