/**
 * CENTRALIZED DATA SERVICE
 * =======================
 * 
 * This is the SINGLE SOURCE for all product and site configuration data.
 * When transitioning to backend/MongoDB, only this file needs to be modified.
 * 
 * IMPORTANT: All components should import and use this service instead of 
 * directly importing JSON files.
 * 
 * Usage:
 * - getProducts() - Returns all products
 * - getProductById(id) - Returns single product by ID
 * - getProductsByCategory(categoryId) - Returns products by category
 * - getFeaturedProducts() - Returns featured products
 * - getDealsProducts() - Returns products on sale
 * - getBestSellerProducts() - Returns bestseller products
 * - getSiteConfig() - Returns site configuration
 * - getCategories() - Returns product categories
 * 
 * Backend Migration Notes:
 * 1. Replace JSON imports with API calls
 * 2. Add error handling and retry logic
 * 3. Add caching mechanism
 * 4. Add authentication headers if needed
 * 5. Convert to async/await pattern for API calls
 */

// Backend API configuration
// Uses environment variable for production (Vercel), defaults to /api for local development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '');

import type { Product, Category, ProductsData, SiteConfig } from '../types';

// Helper to normalize image URLs coming from DB/data
const normalizeImageUrl = (img?: string): string | undefined => {
  if (!img) return img;
  // If already absolute (http/https), leave as-is
  if (/^https?:\/\//i.test(img)) return img;
  // Product images are served from backend root as /images/*, not /api/images/*
  if (img.startsWith('/images/')) return `${API_ROOT_URL}${img}`;
  // For any other relative path, serve via backend images as best-effort
  return `${API_ROOT_URL}/images/${img.replace(/^\/?/, '')}`;
};

const normalizeProduct = (p: Product): Product => ({
  ...p,
  images: Array.isArray(p.images) ? p.images.map((i) => normalizeImageUrl(i) as string) : [],
});

const normalizeProducts = (arr: Product[] = []): Product[] => arr.map(normalizeProduct);

// API helper function for making HTTP requests
const apiRequest = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * PRODUCTS DATA SERVICE
 * ====================
 * All product-related data fetching goes through these functions
 */

/**
 * Get all products
 * Backend: API call to GET /api/products
 */
export const getProducts = async (params: Record<string, any> = {}): Promise<Product[]> => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    const response = await apiRequest(endpoint);
  return normalizeProducts(response.data || []);
  } catch (error) {
    return [];
  }
};

/**
 * Get single product by ID
 * Backend: API call to GET /api/products/:id
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await apiRequest(`/products/${id}`);
  return response.data ? normalizeProduct(response.data) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Get products by category
 * Backend: API call to GET /api/products?category=:categoryId
 */
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const endpoint = categoryId ? `/products?category=${categoryId}` : '/products';
    const response = await apiRequest(endpoint);
  return normalizeProducts(response.data || []);
  } catch (error) {
    return [];
  }
};

/**
 * Get hot deal products
 * Backend: API call to GET /api/products/hotdeals
 */
export const getHotDealProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiRequest('/products/hotdeals');
  return normalizeProducts(response.data || []);
  } catch (error) {
    return [];
  }
};

/**
 * Get products on sale (deals) - products with discount
 * Backend: API call to GET /api/products?onSale=true
 */
export const getDealsProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiRequest('/products?onSale=true');
  return normalizeProducts(response.data || []);
  } catch (error) {
    return [];
  }
};

/**
 * Get bestseller products
 * Backend: API call to GET /api/products?bestseller=true
 */
export const getBestSellerProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiRequest('/products?bestseller=true');
  return normalizeProducts(response.data || []);
  } catch (error) {
    return [];
  }
};

// Backward-compatible alias for different naming in JS service
export const getBestsellerProducts = getBestSellerProducts;

/**
 * Get product categories
 * Backend: API call to GET /api/categories
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiRequest('/categories');
    return response.data || [];
  } catch (error) {
    return [];
  }
};

/**
 * Search products by query
 * Backend: API call to GET /api/products?search=:query
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const endpoint = query ? `/products?search=${encodeURIComponent(query)}` : '/products';
    const response = await apiRequest(endpoint);
  return normalizeProducts(response.data || []);
  } catch (error) {
    return [];
  }
};

/**
 * SITE CONFIGURATION SERVICE
 * ==========================
 * All site configuration data fetching goes through these functions
 */

/**
 * Get complete site configuration
 * Backend: API call to GET /api/siteconfig
 * Also fetches productPages separately and merges it
 */
export const getSiteConfig = async (): Promise<SiteConfig> => {
  try {
    // Add cache-busting to ensure fresh data
    const timestamp = Date.now();
    
    // Fetch main config and productPages in parallel
    const [mainResponse, productPagesResponse] = await Promise.all([
      apiRequest(`/siteconfig?_t=${timestamp}`),
      apiRequest(`/siteconfig/productPages?_t=${timestamp}`).catch(() => ({ data: null }))
    ]);
    
    const mainConfig = mainResponse.data || {};
    const productPagesConfig = productPagesResponse.data;
    
    // Merge productPages into main config if not already present
    if (productPagesConfig && !mainConfig.productPages) {
      mainConfig.productPages = productPagesConfig;
    }
    
    console.log('dataService.getSiteConfig - merged config productPages:', mainConfig.productPages);
    return mainConfig as SiteConfig;
  } catch (error) {
    console.error('dataService.getSiteConfig - ERROR:', error);
    return {} as SiteConfig;
  }
};

/**
 * Get navigation configuration
 * Backend: API call to GET /api/siteconfig/navigation
 */
export const getNavigationConfig = async () => {
  try {
    const response = await apiRequest('/siteconfig/navigation');
    return response.data || {};
  } catch (error) {
    return {};
  }
};

/**
 * Get homepage configuration
 * Backend: API call to GET /api/siteconfig/homepage
 */
export const getHomepageConfig = async () => {
  try {
    const response = await apiRequest('/siteconfig/homepage');
    return response.data || {};
  } catch (error) {
    return {};
  }
};

/**
 * Get branding configuration
 * Backend: API call to GET /api/siteconfig/branding
 */
export const getBrandingConfig = async () => {
  try {
    const response = await apiRequest('/siteconfig/branding');
    return response.data || {};
  } catch (error) {
    return {};
  }
};

/**
 * Get footer configuration
 * Backend: API call to GET /api/siteconfig/footer
 */
export const getFooterConfig = async () => {
  try {
    const response = await apiRequest('/siteconfig/footer');
    return response.data || {};
  } catch (error) {
    return {};
  }
};

/**
 * UTILITY FUNCTIONS
 * ================
 * Helper functions for data manipulation
 */

/**
 * Get related products (exclude current product)
 * First tries to get products from the same category, then fills with other categories to ensure minimum 4 products
 */
export const getRelatedProducts = async (currentProductId: string, categoryId: string | null = null, limit: number = 8): Promise<Product[]> => {
  const MIN_PRODUCTS = 4; // Always ensure at least 4 products
  const targetCount = Math.max(limit, MIN_PRODUCTS);
  
  try {
    // Step 1: Get ALL products first
    const allProducts = await getProducts();
    
    if (!allProducts || allProducts.length === 0) {
      return [];
    }
    
    // Step 2: Filter out current product
    const availableProducts = allProducts.filter(p => {
      const pid = (p._id || p.id || '').toString();
      return pid !== currentProductId;
    });
    
    // Step 3: Separate same category and other category products
    const sameCategoryProducts: Product[] = [];
    const otherCategoryProducts: Product[] = [];
    
    for (const product of availableProducts) {
      const productCatId = (product.categoryId || (product as any).category || '').toString();
      const currentCatId = (categoryId || '').toString();
      
      if (categoryId && productCatId === currentCatId) {
        sameCategoryProducts.push(product);
      } else {
        otherCategoryProducts.push(product);
      }
    }
    
    // Step 4: Combine - prioritize same category, then fill with others
    let relatedProducts: Product[] = [...sameCategoryProducts];
    
    // Add from other categories to reach minimum
    for (const product of otherCategoryProducts) {
      if (relatedProducts.length >= targetCount) break;
      relatedProducts.push(product);
    }
    
    // Step 5: Shuffle for variety
    for (let i = relatedProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [relatedProducts[i], relatedProducts[j]] = [relatedProducts[j], relatedProducts[i]];
    }
    
    // Step 6: Return at least MIN_PRODUCTS (or all available if less)
    return relatedProducts.slice(0, targetCount);
    
  } catch (error) {
    // Fallback: try to get all products
    try {
      const allProducts = await getProducts();
      const filtered = allProducts.filter(p => {
        const pid = (p._id || p.id || '').toString();
        return pid !== currentProductId;
      });
      return filtered.slice(0, MIN_PRODUCTS);
    } catch {
      return [];
    }
  }
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Filter products by price range
 */
export const filterProductsByPriceRange = (products: Product[], minPrice: number, maxPrice: number): Product[] => {
  return products.filter(product => {
    const price = product.price;
    return price >= minPrice && price <= maxPrice;
  });
};

/**
 * Sort products by various criteria
 */
export const sortProducts = (products: Product[], sortBy: string): Product[] => {
  const sortedProducts = [...products];
  
  switch (sortBy) {
    case 'price-low-high':
      return sortedProducts.sort((a, b) => a.price - b.price);
    case 'price-high-low':
      return sortedProducts.sort((a, b) => b.price - a.price);
    case 'name-a-z':
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-z-a':
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    case 'newest':
      return sortedProducts.sort((a, b) => {
        const ad = Date.parse((a as any).createdAt || '');
        const bd = Date.parse((b as any).createdAt || '');
        return (isNaN(bd) ? 0 : bd) - (isNaN(ad) ? 0 : ad);
      });
    case 'popular':
      return sortedProducts.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    case 'rating':
      return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    default:
      return sortedProducts;
  }
};
