// CENTRALIZED DATA SERVICE - Backend API Integration
// This service handles all data operations for the e-commerce platform
// Updated to use backend API endpoints instead of static JSON files

const API_BASE_URL = '/api';

// Generic API request function with error handling
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// =============================================================================
// PRODUCT DATA FUNCTIONS
// =============================================================================

/**
 * Get all products with optional filtering and pagination
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise<Array>} Array of products (maintaining backward compatibility)
 */
export const getProducts = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    const response = await apiRequest(endpoint);
    
    // Return just the products array for backward compatibility
    return response.data || [];
  } catch (error) {
    throw error; // Don't fallback to static data, let the error propagate
  }
};

/**
 * Get a single product by ID
 * @param {number|string} productId - Product ID
 * @returns {Promise<Object|null>} Product data or null if not found
 */
export const getProductById = async (productId) => {
  try {
    const response = await apiRequest(`/products/${productId}`);
    return response.data || null;
  } catch (error) {
    return null;
  }
};

/**
 * Get related products for a given product
 * First tries to get products from the same category, then fills with other categories to ensure minimum 4 products
 * @param {string} productId - Product ID
 * @param {string|null} categoryId - Category ID for better related products (optional)
 * @param {number} limit - Number of related products to fetch
 * @returns {Promise<Array>} Array of related products
 */
export const getRelatedProducts = async (productId, categoryId = null, limit = 8) => {
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
      return pid !== productId;
    });
    
    // Step 3: Separate same category and other category products
    const sameCategoryProducts = [];
    const otherCategoryProducts = [];
    
    for (const product of availableProducts) {
      const productCatId = (product.categoryId || '').toString();
      const currentCatId = (categoryId || '').toString();
      
      if (categoryId && productCatId === currentCatId) {
        sameCategoryProducts.push(product);
      } else {
        otherCategoryProducts.push(product);
      }
    }
    
    // Step 4: Combine - prioritize same category, then fill with others
    let relatedProducts = [...sameCategoryProducts];
    
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
        return pid !== productId;
      });
      return filtered.slice(0, MIN_PRODUCTS);
    } catch {
      return [];
    }
  }
};

/**
 * Get featured products
 * @param {number} limit - Number of featured products to fetch
 * @returns {Promise<Array>} Array of featured products
 */
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const response = await apiRequest(`/products/featured?limit=${limit}`);
    return response.data || [];
  } catch (error) {
    throw error; // Don't fallback to static data, let the error propagate
  }
};

/**
 * Get products on sale
 * @param {number} limit - Number of sale products to fetch
 * @returns {Promise<Array>} Array of products on sale
 */
export const getOnSaleProducts = async (limit = 8) => {
  try {
    // Get all products and filter for those on sale
    const response = await apiRequest(`/products`);
    const allProducts = response.data || response || [];
    const productsWithDeals = allProducts.filter(product => 
      product.originalPrice && product.originalPrice > product.price
    );
    return productsWithDeals.slice(0, limit);
  } catch (error) {
    throw error; // Don't fallback to static data, let the error propagate
  }
};

/**
 * Get products by category (for backward compatibility)
 * @param {string} categoryId - Category ID
 * @returns {Promise<Array>} Array of products in the category
 */
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await apiRequest(`/products/category/${categoryId}`);
    return response.data || response || [];
  } catch (error) {
    throw error; // Don't fallback to static data, let the error propagate
  }
};

/**
 * Get bestseller products (for backward compatibility)
 * @param {number} limit - Number of bestseller products to return
 * @returns {Promise<Array>} Array of bestseller products
 */
export const getBestsellerProducts = async (limit = 8) => {
  try {
    const response = await apiRequest(`/products/bestsellers?limit=${limit}`);
    return response.data || response || [];
  } catch (error) {
    throw error; // Don't fallback to static data, let the error propagate
  }
};

// Backward-compatible alias (camel-cased with capital S)
export const getBestSellerProducts = getBestsellerProducts;

/**
 * Get hot deal products
 * @param {number} limit - Number of hot deal products to return
 * @returns {Promise<Array>} Array of hot deal products
 */
export const getHotDealProducts = async (limit = 8) => {
  try {
    const response = await apiRequest(`/products/hotdeals?limit=${limit}`);
    return response.data || response || [];
  } catch (error) {
    throw error; // Don't fallback to static data, let the error propagate
  }
};

// =============================================================================
// CATEGORY DATA FUNCTIONS
// =============================================================================

/**
 * Get all product categories
 * @returns {Promise<Array>} Array of categories
 */
export const getCategories = async () => {
  try {
    const response = await apiRequest('/categories');
    return response.data || [];
  } catch (error) {
    throw error; // Don't fallback to static data, let the error propagate
  }
};

/**
 * Get a single category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object|null>} Category data or null if not found
 */
export const getCategoryById = async (categoryId) => {
  try {
    const response = await apiRequest(`/categories/${categoryId}`);
    return response.data || null;
  } catch (error) {
    return null;
  }
};

// =============================================================================
// SITE CONFIGURATION FUNCTIONS
// =============================================================================

/**
 * Get site configuration
 * Also fetches productPages separately and merges it
 * @param {string} businessType - Optional business type filter
 * @returns {Promise<Object>} Site configuration object
 */
export const getSiteConfig = async (businessType = null) => {
  try {
    const timestamp = Date.now();
    const endpoint = businessType 
      ? `/siteconfig?businessType=${businessType}&_t=${timestamp}` 
      : `/siteconfig?_t=${timestamp}`;
    
    // Fetch main config and productPages in parallel
    const [mainResponse, productPagesResponse] = await Promise.all([
      apiRequest(endpoint),
      apiRequest(`/siteconfig/productPages?_t=${timestamp}`).catch(() => ({ data: null }))
    ]);
    
    // Get the main config data directly
    const mainConfig = mainResponse.data || {};
    const productPagesConfig = productPagesResponse.data;
    
    // Merge productPages into main config if not already present
    if (productPagesConfig && !mainConfig.productPages) {
      mainConfig.productPages = productPagesConfig;
    }
    
    return mainConfig;
  } catch (error) {
    console.error('getSiteConfig error:', error);
    throw error;
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} currentPrice - Current sale price
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, currentPrice) => {
  if (!originalPrice || originalPrice <= currentPrice) {
    return 0;
  }
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Format price for display
 * @param {number} price - Price to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = '₹') => {
  return `${currency}${price.toFixed(2)}`;
};

/**
 * Check if product is on sale
 * @param {Object} product - Product object
 * @returns {boolean} True if product is on sale
 */
export const isProductOnSale = (product) => {
  return product.originalPrice && product.originalPrice > product.price;
};

/**
 * Get product primary image
 * @param {Object} product - Product object
 * @returns {string} Primary image URL or fallback
 */
export const getProductPrimaryImage = (product) => {
  if (product.images && product.images.length > 0) {
    // Handle both object format (from API) and string format (legacy)
    const firstImage = product.images[0];
    if (typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url;
    }
    return firstImage;
  }
  return '/placeholder-image.jpg'; // Fallback image
};

// =============================================================================
// SEARCH FUNCTIONS
// =============================================================================

/**
 * Search products by query
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Array of matching products
 */
export const searchProducts = async (query, filters = {}) => {
  try {
    const params = { search: query, ...filters };
    const response = await getProducts(params);
    return response || [];
  } catch (error) {
    return [];
  }
};

// =============================================================================
// FILTERING AND SORTING FUNCTIONS
// =============================================================================

/**
 * Filter products by price range
 * @param {Array} products - Array of products to filter
 * @param {Array} priceRange - [minPrice, maxPrice]
 * @returns {Array} Filtered products
 */
export const filterProductsByPriceRange = (products, priceRange) => {
  if (!products || !Array.isArray(products)) return [];
  const [minPrice, maxPrice] = priceRange;
  
  return products.filter(product => {
    const price = product.price || 0;
    return price >= minPrice && price <= maxPrice;
  });
};

/**
 * Sort products by various criteria
 * @param {Array} products - Array of products to sort
 * @param {string} sortBy - Sort criteria ('default', 'price-low', 'price-high', 'name', 'newest')
 * @returns {Array} Sorted products
 */
export const sortProducts = (products, sortBy) => {
  if (!products || !Array.isArray(products)) return [];
  
  const sortedProducts = [...products];
  
  switch (sortBy) {
    case 'price-low':
      return sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-high':
      return sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'name':
      return sortedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'newest':
      return sortedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    case 'default':
    default:
      return sortedProducts;
  }
};

/**
 * Get deals products (alias for getOnSaleProducts for backward compatibility)
 * @param {number} limit - Number of deals products to fetch
 * @returns {Promise<Array>} Array of products on deals
 */
export const getDealsProducts = async (limit = 8) => {
  return getOnSaleProducts(limit);
};

// =============================================================================
// EXPORT ALL FUNCTIONS
// =============================================================================

export default {
  // Product functions
  getProducts,
  getProductById,
  getRelatedProducts,
  getFeaturedProducts,
  getOnSaleProducts,
  getProductsByCategory,
  getBestsellerProducts,
  getBestSellerProducts,
  getHotDealProducts,
  getDealsProducts,
  
  // Category functions
  getCategories,
  getCategoryById,
  
  // Configuration functions
  getSiteConfig,
  
  // Utility functions
  calculateDiscountPercentage,
  formatPrice,
  isProductOnSale,
  getProductPrimaryImage,
  
  // Search functions
  searchProducts,
  
  // Filtering and sorting functions
  filterProductsByPriceRange,
  sortProducts,
  
  // API configuration
  API_BASE_URL
};
