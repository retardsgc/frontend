const STORAGE_KEY = 'guestWishlist';

// Read wishlist product IDs from localStorage
const readWishlist = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Write wishlist to localStorage
const writeWishlist = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

class WishlistService {
  constructor() {
    this._ids = new Set();
    this._ready = false;
    try {
      window.addEventListener('wishlist:changed', () => {
        this.refreshIds();
      });
    } catch {}
  }

  refreshIds() {
    const items = readWishlist();
    this._ids = new Set(items.map((p) => String(p._id || p.id)));
    this._ready = true;
    return this._ids;
  }

  async getWishlistIds() {
    if (!this._ready) {
      this.refreshIds();
    }
    return this._ids;
  }

  isInWishlistSync(productId) {
    return this._ids.has(String(productId));
  }

  // Get wishlist - returns full product objects stored locally
  async getWishlist() {
    const items = readWishlist();
    return {
      success: true,
      data: items,
      count: items.length,
    };
  }

  // Add product to wishlist
  async addToWishlist(productId) {
    const pid = String(productId);
    const items = readWishlist();

    // Already in wishlist
    if (items.some((p) => String(p._id || p.id) === pid)) {
      return this.getWishlist();
    }

    // Fetch product data from API
    try {
      const res = await fetch(`/api/products/${productId}`);
      const json = await res.json();
      const product = json.data || json;
      items.push(product);
    } catch {
      // If fetch fails, store minimal data
      items.push({ _id: pid, id: pid, name: 'Product', price: 0, images: [] });
    }

    writeWishlist(items);
    this._ids.add(pid);
    try { window.dispatchEvent(new Event('wishlist:changed')); } catch {}
    return { success: true, data: items, count: items.length };
  }

  // Remove product from wishlist
  async removeFromWishlist(productId) {
    const pid = String(productId);
    const items = readWishlist().filter((p) => String(p._id || p.id) !== pid);
    writeWishlist(items);
    this._ids.delete(pid);
    try { window.dispatchEvent(new Event('wishlist:changed')); } catch {}
    return { success: true, data: items, count: items.length };
  }

  // Clear wishlist
  async clearWishlist() {
    writeWishlist([]);
    this._ids.clear();
    try { window.dispatchEvent(new Event('wishlist:changed')); } catch {}
    return { success: true, data: [], count: 0 };
  }

  // Check if product is in wishlist
  isInWishlist(productId, wishlist) {
    const pid = String(productId);
    return wishlist.some(item => String(item._id) === pid);
  }
}

export default new WishlistService();

