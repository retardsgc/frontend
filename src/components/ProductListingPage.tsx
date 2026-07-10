import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Product, Color, SiteConfig, Category } from '../types';
// CENTRALIZED DATA SERVICE - Single source for all product data
import { 
  getProducts, 
  getCategories, 
  getSiteConfig, 
  filterProductsByPriceRange,
  sortProducts 
} from '../services/dataService.js';
import cartService from '../services/cartService';
import wishlistService from '../services/wishlistService';
import { getImageUrl } from '../utils/imageUrl';

interface CategoryWithCount {
  name: string;
  count: number;
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

type ViewMode = 'grid' | 'list';
type SortBy = 'default' | 'price-low' | 'price-high' | 'name';

// Accessible, styled dropdown to replace native <select>
const SortDropdown: React.FC<{
  value: SortBy;
  onChange: (v: SortBy) => void;
  className?: string;
}> = ({ value, onChange, className }) => {
  const options: { value: SortBy; label: string }[] = [
    { value: 'default', label: 'Default Sorting' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
  ];

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() => options.findIndex(o => o.value === value));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    setActiveIndex(options.findIndex(o => o.value === value));
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const commitSelection = useCallback((idx: number) => {
    const opt = options[idx];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
    // return focus to button for good a11y
    buttonRef.current?.focus();
  }, [onChange]);

  const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      // focus list soon after open
      requestAnimationFrame(() => {
        listRef.current?.focus();
      });
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = (i + 1) % options.length;
        return next;
      });
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => {
        const next = (i - 1 + options.length) % options.length;
        return next;
      });
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      commitSelection(activeIndex);
      return;
    }
    if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  const selected = options.find(o => o.value === value) ?? options[0];
  const dropdownId = 'sort-dropdown-listbox';

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={dropdownId}
        onKeyDown={onButtonKeyDown}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center justify-between gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black w-full xs:w-auto min-w-[160px]"
        title="Sort products"
      >
        <span className="truncate">{selected.label}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={dropdownId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={options[activeIndex]?.value}
          onKeyDown={onListKeyDown}
          className="absolute z-20 mt-2 w-full xs:w-64 max-h-64 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none"
        >
          {options.map((opt, idx) => {
            const selected = opt.value === value;
            const active = idx === activeIndex;
            return (
              <li
                key={opt.value}
                id={opt.value}
                role="option"
                aria-selected={selected}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between ${active ? 'bg-gray-100' : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => commitSelection(idx)}
              >
                <span className={`truncate ${selected ? 'font-medium text-black' : 'text-gray-700'}`}>{opt.label}</span>
                {selected && (
                  <svg className="w-4 h-4 text-black" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 00-1.408-1.42l-7.58 7.52-3.01-2.95a1 1 0 10-1.39 1.44l3.71 3.64a1 1 0 001.4 0l8.28-8.23z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const ProductListingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]); // High default to show all products
  const [minPriceInput, setMinPriceInput] = useState<string>('0');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('9999');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 50;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, configData, categoriesData] = await Promise.all([
          getProducts({ limit: 1000 }), // Fetch all products (no pagination limit)
          getSiteConfig(),
          getCategories()
        ]);
        
        console.log('ProductListingPage - configData received:', configData);
        console.log('ProductListingPage - productPages:', configData?.productPages);
        
        setProducts(productsData);
        setSiteConfig(configData);
        
        // Calculate max price from products for filter range
        if (productsData.length > 0) {
          const maxPrice = Math.ceil(Math.max(...productsData.map(p => p.price || 0)));
          setPriceRange([0, maxPrice > 0 ? maxPrice : 100000]);
        }
        
        // Build categories with count
        const categoriesList: CategoryWithCount[] = [
          { name: 'All', count: productsData.length },
          ...categoriesData.map(category => ({
            name: category.name,
            count: productsData.filter(product => product.categoryId === category.id).length
          }))
        ];
        setCategories(categoriesList);

        // If initialCategory is not valid, reset to All
        setSelectedCategory(prev => {
          if (!categoriesList.some(c => c.name.toLowerCase() === initialCategory.toLowerCase())) return 'All';
          return initialCategory;
        });
      } catch (error) {
        // Error loading data - silently handled
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [initialCategory]);

  // Handler to change category and push param without triggering loops
  const handleSelectCategory = (name: string) => {
    setSelectedCategory(name);
    if (name === 'All') {
      // Remove param
      const next = new URLSearchParams(searchParams);
      next.delete('category');
      setSearchParams(next, { replace: true });
    } else {
      const next = new URLSearchParams(searchParams);
      next.set('category', name);
      setSearchParams(next, { replace: true });
    }
  };

  // Filter and sort products - IMPORTANT: This must be called unconditionally before any returns
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      return categoryMatch && priceMatch;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [selectedCategory, priceRange, sortBy, products]);
  
  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, sortBy]);
  
  // Pagination calculations
  // Show all filtered products on a single page
  const totalPages = 1;
  const paginatedProducts = filteredAndSortedProducts;

  if (loading) {
    return <div>Loading...</div>;
  }

  // Debug: Log the full siteConfig to understand the structure
  console.log('ProductListingPage - FULL siteConfig:', JSON.stringify(siteConfig, null, 2));
  console.log('ProductListingPage - siteConfig?.productPages:', siteConfig?.productPages);
  console.log('ProductListingPage - siteConfig?.productPages?.listing:', siteConfig?.productPages?.listing);

  // Use dynamic page content with fallback
  const pageContent = siteConfig?.productPages?.listing || {
    title: "Latest Electronics",
    description: "Discover cutting-edge technology and premium electronics at unbeatable prices"
  };
  
  console.log('ProductListingPage - FINAL pageContent:', pageContent);

  const getColorValue = (color: Color): string => {
    // If color has a hex value, use it directly
    if (color.value && color.value.startsWith('#')) {
      return color.value;
    }
    // Map common color names to hex values
    const colorHexMap: Record<string, string> = {
      'black': '#000000',
      'white': '#FFFFFF',
      'gray': '#9CA3AF',
      'grey': '#9CA3AF',
      'blue': '#3B82F6',
      'red': '#EF4444',
      'pink': '#EC4899',
      'orange': '#F97316',
      'green': '#22C55E',
      'purple': '#A855F7',
      'yellow': '#EAB308',
      'silver': '#D1D5DB',
      'gold': '#CA8A04',
      'brown': '#92400E',
      'navy': '#1E3A8A',
      'teal': '#14B8A6',
      'beige': '#D4C4A8',
      'cream': '#FFFDD0',
      'maroon': '#7F1D1D',
      'olive': '#84CC16',
      'coral': '#FB7185',
      'cyan': '#06B6D4',
      'magenta': '#D946EF',
      'lime': '#84CC16',
      'indigo': '#6366F1',
      'violet': '#8B5CF6',
      'rose': '#F43F5E',
      'slate': '#64748B',
      'zinc': '#71717A',
      'neutral': '#737373',
      'stone': '#78716C',
      'amber': '#F59E0B',
      'emerald': '#10B981',
      'sky': '#0EA5E9',
      'fuchsia': '#D946EF',
    };
    const colorName = color.name.toLowerCase();
    return colorHexMap[colorName] || color.value || '#D1D5DB';
  };

  const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode }) => {
    const [inCart, setInCart] = useState(false);
    const [inWishlist, setInWishlist] = useState(false);

    useEffect(() => {
      let mounted = true;
      const refresh = async () => {
        const [cartIds, wishIds] = await Promise.all([
          cartService.getCartIds(),
          wishlistService.getWishlistIds(),
        ]);
        if (!mounted) return;
        const pid = String(product._id || product.id);
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
    }, [product._id, product.id]);
    const handleAddToCart = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Optimistically update local state BEFORE the API call
      setInCart(true);
      try {
        await cartService.addToCart(product._id || product.id, 1);
        // cartService dispatches 'cart:changed' which will refresh the cache
      } catch (error) {
        // Revert optimistic update on failure
        setInCart(false);
      }
    };

    const handleAddToWishlist = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Optimistically update local state BEFORE the API call
      setInWishlist(true);
      try {
        await wishlistService.addToWishlist(product._id || product.id);
        // wishlistService dispatches 'wishlist:changed' which will refresh the cache
      } catch (error) {
        // Revert optimistic update on failure
        setInWishlist(false);
      }
    };

    if (viewMode === 'list') {
      return (
  <Link to={`/product/${(product._id || product.id)}`} className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group block">
          <div className="w-full sm:w-20 md:w-24 lg:w-32 h-48 sm:h-20 md:h-24 lg:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={getImageUrl(product.images[0])}
              alt={product.name}
              className="w-full h-full max-w-full max-h-full object-cover group-hover:scale-105 transition-transform duration-300"
              style={{
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                minHeight: '100%',
                maxHeight: '100%',
                minWidth: '100%',
                maxWidth: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          <div className="flex-1 flex flex-col justify-between gap-3 sm:gap-0">
            <div>
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-black mb-1 sm:mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-2">Category: {product.category}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col gap-2">
                {/* Price with discount */}
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-black">₹{product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm lg:text-base text-gray-500 line-through">₹{product.originalPrice}</span>
                  )}
                </div>

                {/* Rating and Reviews */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
                  </div>
                )}

                {/* Stock Status and Colors */}
                <div className="flex items-center gap-3">
                  {!product.inStock && (
                    <span className="text-sm text-red-600">Out of Stock</span>
                  )}
                  <div className="flex gap-1">
                    {product.colors.map((color: Color, index: number) => (
                      <button
                        key={index}
                        className={`w-4 h-4 rounded-full border shadow-sm ring-1 ring-gray-200 hover:scale-110 transition-transform ${color.name.toLowerCase() === 'white' ? 'border-gray-300' : 'border-white'}`}
                        style={{ backgroundColor: getColorValue(color) }}
                        title={color.name}
                        onClick={(e) => e.preventDefault()}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end sm:justify-start">
                <button 
                  onClick={handleAddToWishlist}
                  className={`p-2 rounded-full transition-colors ${inWishlist ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title={inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                >
                  <svg className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <button 
                  onClick={handleAddToCart}
                  disabled={inCart}
                  className={`px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-lg transition-colors text-sm sm:text-base lg:text-lg ${inCart ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                >
                  {inCart ? 'In Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </Link>
      );
    }

    // Grid view (default) - Using "You May Also Like" card style
    return (
      <Link to={`/product/${(product._id || product.id)}`} className="group block">
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
                onClick={handleAddToWishlist}
                title={inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all ${
                  inWishlist 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/90 hover:bg-white text-gray-700 hover:text-red-500'
                }`}
              >
                <svg className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <button
                onClick={handleAddToCart}
                disabled={inCart}
                title={inCart ? 'In Cart' : 'Add to Cart'}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all ${
                  inCart 
                    ? 'bg-green-500 text-white cursor-default' 
                    : 'bg-white/90 hover:bg-white text-gray-700 hover:text-black'
                }`}
              >
                {inCart ? (
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
                    className={`w-4 h-4 rounded-full border-2 shadow-sm ring-1 ring-gray-200 ${color.name.toLowerCase() === 'white' ? 'border-gray-300' : 'border-white'}`}
                    style={{ backgroundColor: getColorValue(color) }}
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
    );
  };

  // Sidebar content as JSX (not a component to avoid re-mounting on state changes)
  const sidebarContent = (
    <div className="space-y-8">
      {/* Filter Button */}
      <div className="flex items-center gap-2 pb-4 border-b">
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.553.894l-4 2A1 1 0 019 21V14.414a1 1 0 00-.293-.707L2.293 7.293A1 1 0 012 6.586V4z" />
        </svg>
        <span className="text-sm lg:text-base font-medium">Filter</span>
      </div>

      {/* Product Categories */}
      <div>
        <h3 className="text-base lg:text-lg font-semibold text-black mb-4">Product categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleSelectCategory(category.name)}
              className={`w-full flex items-center justify-between p-2 lg:p-3 text-left rounded transition-colors ${
                selectedCategory === category.name
                  ? 'bg-gray-100 text-black font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm lg:text-base">{category.name}</span>
              <span className="text-xs lg:text-sm text-gray-500">({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-base lg:text-lg font-semibold text-black mb-4">Price Range</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Min"
              value={minPriceInput}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string or numbers only
                if (value === '' || /^\d*$/.test(value)) {
                  setMinPriceInput(value);
                }
              }}
              className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-md text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-black"
            />
            <span className="text-gray-500">-</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Max"
              value={maxPriceInput}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string or numbers only
                if (value === '' || /^\d*$/.test(value)) {
                  setMaxPriceInput(value);
                }
              }}
              className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-md text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            onClick={() => {
              // Parse the input values, default to 0 for min and 100000 for max if empty
              const minVal = minPriceInput === '' ? 0 : parseInt(minPriceInput, 10);
              const maxVal = maxPriceInput === '' ? 100000 : parseInt(maxPriceInput, 10);
              setPriceRange([minVal, maxVal]);
              // Close mobile filter sidebar after applying
              setIsSidebarOpen(false);
            }}
            className="w-full py-2 lg:py-3 bg-black text-white rounded-md text-sm lg:text-base hover:bg-gray-800 transition-colors"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Hero Section */}
      <div className="text-center py-3 sm:py-4 lg:py-8 px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-black mb-1 lg:mb-2">{pageContent.title}</h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">{pageContent.description}</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-20">
        <div className="flex gap-4 lg:gap-12">
          {/* Desktop Sidebar - Hide at 1010px */}
          <div className="hidden filter-hide:block w-80 flex-shrink-0">
            {sidebarContent}
          </div>

          {/* Main Product Area */}
          <div className="flex-1 min-w-0">
            {/* Top Controls - Combined Mobile Filter and Layout Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="filter-hide:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.553.894l-4 2A1 1 0 019 21V14.414a1 1 0 00-.293-.707L2.293 7.293A1 1 0 012 6.586V4z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium">Filter</span>
                </button>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Grid View"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="List View"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h18v4H3V3zm0 7h18v4H3v-4zm0 7h18v4H3v-4z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4">
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                  {filteredAndSortedProducts.length} products found
                </span>
                <SortDropdown
                  value={sortBy}
                  onChange={(v) => setSortBy(v)}
                  className="w-full xs:w-auto"
                />
              </div>
            </div>

            {/* Product Grid/List */}
            <div className={`mb-8 ${
              viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6' 
                : 'space-y-4'
            }`}>
              {paginatedProducts.map((product) => (
                <ProductCard key={(product._id || product.id)} product={product} viewMode={viewMode} />
              ))}
            </div>

            {/* No Products Message */}
            {filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap px-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 sm:px-3 sm:py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 sm:px-3 py-2 rounded-md font-medium transition-colors text-sm sm:text-base ${
                        currentPage === page
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {totalPages > 7 && currentPage < totalPages - 3 && (
                  <>
                    <span className="px-2 text-gray-500 text-sm">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-2 sm:px-3 py-2 rounded-md font-medium transition-colors text-sm sm:text-base text-gray-700 hover:bg-gray-100"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 sm:px-3 sm:py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] filter-hide:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-full max-w-sm bg-white z-[80] transform transition-transform duration-300 ease-in-out filter-hide:hidden overflow-y-auto ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="p-4">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
