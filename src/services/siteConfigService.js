// Simplified site configuration service
// Prefer env override, fallback to /api for local development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// API request helper with error handling
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
      const message = `HTTP ${response.status}: ${response.statusText} at ${endpoint}`;
      throw new Error(message);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    throw error;
  }
};

// Main site configuration service
class SiteConfigService {
  // Get all site configurations
  async getAllConfigs() {
    try {
      const response = await apiRequest('/siteconfig');
      // Accept both wrapped and direct formats
      if (response && response.success && response.data) {
        return response.data;
      }
      if (response && !response.success) {
        throw new Error(response.message || 'Invalid response format');
      }
      return response; // direct config map fallback
    } catch (error) {
      throw error;
    }
  }

  // Get specific configuration by key
  async getConfig(key) {
    try {
      const response = await apiRequest(`/siteconfig/${key}`);
      // Accept both wrapped and direct formats
      if (response && response.success && response.data) {
        return response.data;
      }
      if (response && response.success === false) {
        throw new Error(response.message || `Invalid response for key: ${key}`);
      }
      return response; // direct section fallback
    } catch (error) {
      throw error;
    }
  }

  // Normalize homepage to prevent undefined access in UI components
  ensureHomepageDefaults(section) {
    const homepage = section && typeof section === 'object' ? { ...section } : {};

    // Hot Deals Section defaults
    homepage.hotDealsSection = homepage.hotDealsSection || {};
    homepage.hotDealsSection.enabled = homepage.hotDealsSection.enabled !== false; // default true
    homepage.hotDealsSection.title = homepage.hotDealsSection.title || '';
    homepage.hotDealsSection.subtitle = homepage.hotDealsSection.subtitle || '';
    homepage.hotDealsSection.productIds = Array.isArray(homepage.hotDealsSection.productIds)
      ? homepage.hotDealsSection.productIds
      : [];

    // Testimonials Section defaults
    homepage.testimonialSection = homepage.testimonialSection || {};
    homepage.testimonialSection.enabled = homepage.testimonialSection.enabled !== false; // default true
    homepage.testimonialSection.layout = homepage.testimonialSection.layout || 'model1';
    homepage.testimonialSection.title = homepage.testimonialSection.title || 'Customer Testimonials';
    homepage.testimonialSection.subtitle = homepage.testimonialSection.subtitle || 'See what our satisfied customers have to say about our electronic accessories.';
    homepage.testimonialSection.navigationLabels = homepage.testimonialSection.navigationLabels || {};
    homepage.testimonialSection.navigationLabels.previous = homepage.testimonialSection.navigationLabels.previous || 'Previous';
    homepage.testimonialSection.navigationLabels.next = homepage.testimonialSection.navigationLabels.next || 'Next';
    homepage.testimonialSection.testimonials = Array.isArray(homepage.testimonialSection.testimonials)
      ? homepage.testimonialSection.testimonials.map(t => ({
          name: t?.name || "Anonymous",
          role: t?.role || "Customer",
          text: t?.text || "",
          rating: Number(t?.rating) || 5,
          heading: t?.heading || "",
          productImage: t?.productImage || "",
          productName: t?.productName || "",
          productPrice: t?.productPrice || "",
          productLink: t?.productLink || ""
        }))
      : [
          {
            name: "Priya Sharma",
            role: "Customer from Mumbai",
            text: "The California almonds are absolutely fresh and crunchy. I gift these every Diwali — everyone loves them! Highly recommend.",
            rating: 5,
            heading: "Best Premium Almonds I've Ever Had!",
            productName: "California Premium Almonds",
            productPrice: "₹599",
            productImage: "/images/almond-1.png",
            productLink: "/products"
          },
          {
            name: "Rahul Verma",
            role: "Customer from Delhi",
            text: "These cashews are so perfectly roasted. The pepper flavour is addictive! Great packaging and delivered super fast.",
            rating: 5,
            heading: "Perfectly Roasted, Great Flavour!",
            productName: "Whole Cashews W240",
            productPrice: "₹749",
            productImage: "/images/cashew-1.png",
            productLink: "/products"
          },
          {
            name: "Sunita Patel",
            role: "Customer from Ahmedabad",
            text: "Best pistachios I have ordered online. Authentic taste, great freshness, and a generous quantity for the price.",
            rating: 5,
            heading: "Authentic & Fresh Every Time",
            productName: "Iranian Pistachios Premium",
            productPrice: "₹899",
            productImage: "/images/pistachio-1.png",
            productLink: "/products"
          },
          {
            name: "Meera Nair",
            role: "Customer from Kochi",
            text: "The Medjool dates taste just like the ones from the market, but way more convenient. Superb quality and sealed freshness.",
            rating: 5,
            heading: "Sweet, Fresh & Convenient!",
            productName: "Medjool Dates Premium",
            productPrice: "₹699",
            productImage: "/images/dates-1.png",
            productLink: "/products"
          },
          {
            name: "Arjun Mehta",
            role: "Customer from Bangalore",
            text: "The Premium Mixed Dry Fruits pack is a daily staple at home now. Great value for money and consistently great quality.",
            rating: 5,
            heading: "My Daily Healthy Snack!",
            productName: "Premium Mixed Dry Fruits",
            productPrice: "₹799",
            productImage: "/images/granola-bowl.png",
            productLink: "/products"
          }
        ];

    // Featured Collections defaults
    homepage.featuredCollections = homepage.featuredCollections || {};
    homepage.featuredCollections.title = homepage.featuredCollections.title || 'Featured Collections';
    homepage.featuredCollections.enabled = homepage.featuredCollections.enabled !== false; // default true
    const list = Array.isArray(homepage.featuredCollections.collections)
      ? homepage.featuredCollections.collections
      : [];
    // Guarantee at least two items for proper display (mobile carousel + desktop grid)
    if (list.length === 0) {
      homepage.featuredCollections.collections = [
        {
          id: 'default-1',
          title: 'Electronics',
          subtitle: 'Latest Tech',
          description: 'Discover the latest in technology and gadgets',
          image: '/images/IMAGE_11.png',
          buttonText: 'Shop Now',
          buttonLink: '/collections/electronics',
          gradient: 'from-blue-500 to-purple-600',
        },
        {
          id: 'default-2',
          title: 'Fashion',
          subtitle: 'Trendy Styles',
          description: 'Stay fashionable with our latest collection',
          image: '/images/IMAGE_11.png',
          buttonText: 'Explore',
          buttonLink: '/collections/fashion',
          gradient: 'from-pink-500 to-red-600',
        },
      ];
    } else {
      homepage.featuredCollections.collections = list.map((c) => ({
        id: c?.id ?? Math.random().toString(36).slice(2),
        title: c?.title ?? '',
        subtitle: c?.subtitle ?? '',
        description: c?.description ?? '',
        image: c?.image ?? '/images/IMAGE_11.png',
        buttonText: c?.buttonText ?? 'Shop Now',
        buttonLink: c?.buttonLink ?? '#',
        gradient: c?.gradient ?? 'from-gray-500 to-gray-700',
      }));
    }
    return homepage;
  }

  // Specific config getters
  getBranding = () => this.getConfig('branding');
  getNavigation = () => this.getConfig('navigation');
  getHomepage = async () => {
    const raw = await this.getConfig('homepage');
    return this.ensureHomepageDefaults(raw);
  };
  getFooter = () => this.getConfig('footer');
  getAnnouncementBar = () => this.getConfig('announcementbar');
  getHero = () => this.getConfig('hero');
  getSEO = () => this.getConfig('seo');
  getCompany = () => this.getConfig('company');
}

// Create and export a singleton instance
const siteConfigService = new SiteConfigService();
// no-op b/c hooks may call these; they can be implemented later without breaking callers
siteConfigService.refreshConfig = async () => {};
siteConfigService.refreshAll = async () => {};
siteConfigService.clearCache = () => {};

// Fetch multiple config keys in a single request to avoid many parallel calls
siteConfigService.getMultipleConfigs = async (keys = []) => {
  try {
    if (!Array.isArray(keys) || keys.length === 0) {
      const all = await siteConfigService.getAllConfigs();
      return all || {};
    }

    const allConfigs = await apiRequest('/siteconfig');
    const configMap = (allConfigs && allConfigs.data) ? allConfigs.data : allConfigs || {};
    const result = {};
    keys.forEach((k) => {
      const key = String(k).toLowerCase();
      result[key] = configMap[key];
    });
    return result;
  } catch (error) {
    const result = {};
    await Promise.all(keys.map(async (k) => {
      try {
        const r = await siteConfigService.getConfig(k);
        result[String(k).toLowerCase()] = r;
      } catch (e) {
        result[String(k).toLowerCase()] = null;
      }
    }));
    return result;
  }
};

siteConfigService.healthCheck = async () => ({ status: 'unknown' });
export default siteConfigService;
