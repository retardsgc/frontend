const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_KEY = 'guestCart';

// Read cart items from localStorage
const readCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Write cart items to localStorage
const writeCart = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

// Build the cart response object matching the old API shape
const buildCartResponse = (items) => {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);
  const shipping = subtotal > 50 ? 0 : (totalItems > 0 ? 10 : 0);
  const total = subtotal + shipping;
  return {
    success: true,
    data: {
      items: items.map((it, idx) => ({
        _id: it.productId + '_' + idx,
        product: {
          _id: it.productId,
          name: it.name,
          price: it.price,
          images: it.images || [],
        },
        quantity: it.quantity,
        itemTotal: it.price * it.quantity,
        selectedColor: it.selectedColor || '',
        selectedSize: it.selectedSize || '',
      })),
      totalItems,
      subtotal,
      shipping,
      total,
    },
  };
};

class CartService {
  constructor() {
    this._ids = new Set();
    this._ready = false;
    try {
      window.addEventListener('cart:changed', () => {
        this.refreshIds();
      });
    } catch {}
  }

  refreshIds() {
    const items = readCart();
    this._ids = new Set(items.map((it) => String(it.productId)));
    this._ready = true;
    return this._ids;
  }

  async getCartIds() {
    if (!this._ready) {
      this.refreshIds();
    }
    return this._ids;
  }

  isInCartSync(productId) {
    return this._ids.has(String(productId));
  }

  async getCart() {
    return buildCartResponse(readCart());
  }

  async addToCart(productId, quantity = 1, selectedColor = '', selectedSize = '', productData = null) {
    const items = readCart();
    const pid = String(productId);

    // Check if item already in cart (same product + color + size)
    const existing = items.find(
      (it) => String(it.productId) === pid && it.selectedColor === selectedColor && it.selectedSize === selectedSize
    );

    // --- Cart total limit: ₹2,000 ---
    // Calculate what the price would be for this item
    let itemPrice = productData?.price || 0;
    if (!itemPrice && existing) {
      itemPrice = existing.price || 0;
    }
    if (!itemPrice) {
      try {
        const res = await fetch(`${API_BASE}/products/${productId}`);
        const json = await res.json();
        itemPrice = (json.data || json)?.price || 0;
      } catch {}
    }

    const currentTotal = buildCartResponse(items).data.total;
    const addedCost = itemPrice * quantity;
    // Allow updating existing item quantity only if it was already in cart
    if (!existing && currentTotal + addedCost > 2000) {
      const remaining = Math.max(0, 2000 - currentTotal);
      try {
        window.dispatchEvent(new CustomEvent('cart:limit-exceeded', {
          detail: { message: `Cart limit is \u20b92,000. You can add items worth up to \u20b9${remaining.toFixed(0)} more.` }
        }));
      } catch {}
      return null;
    }

    if (existing) {
      existing.quantity += quantity;
    } else {
      // We need product info - if productData provided use it, otherwise fetch from API
      let name = productData?.name || '';
      let price = itemPrice;
      let images = productData?.images || [];

      if (!name) {
        try {
          const res = await fetch(`${API_BASE}/products/${productId}`);
          const json = await res.json();
          const p = json.data || json;
          name = p.name || 'Product';
          price = p.price || 0;
          images = p.images || [];
        } catch {
          name = 'Product';
        }
      }

      items.push({ productId: pid, name, price, images, quantity, selectedColor, selectedSize });
    }

    writeCart(items);
    this._ids.add(pid);
    try { window.dispatchEvent(new Event('cart:changed')); } catch {}
    return buildCartResponse(items);
  }

  async updateCartItem(itemId, quantity, selectedColor = '', selectedSize = '') {
    const items = readCart();
    // itemId format: productId_index
    const [pid] = itemId.split('_');
    const idx = items.findIndex((it) => String(it.productId) === pid);

    // Check ₹2,000 limit before updating quantity
    if (idx !== -1) {
      const itemPrice = items[idx].price || 0;
      const otherItemsTotal = items.reduce((sum, it, i) => i !== idx ? sum + it.price * it.quantity : sum, 0);
      const shipping = otherItemsTotal + itemPrice * quantity > 50 ? 0 : (items.length > 0 ? 10 : 0);
      const newTotal = otherItemsTotal + itemPrice * quantity + shipping;
      if (newTotal > 2000) {
        const maxQty = Math.floor((2000 - otherItemsTotal) / itemPrice);
        const remaining = Math.max(0, 2000 - otherItemsTotal - itemPrice * items[idx].quantity);
        try {
          window.dispatchEvent(new CustomEvent('cart:limit-exceeded', {
            detail: { message: `Cart limit is \u20b92,000. You can add items worth up to \u20b9${remaining.toFixed(0)} more.` }
          }));
        } catch {}
        // Cap quantity at the maximum allowed instead of blocking entirely
        const cappedQty = Math.max(1, maxQty);
        items[idx].quantity = cappedQty;
        if (selectedColor) items[idx].selectedColor = selectedColor;
        if (selectedSize) items[idx].selectedSize = selectedSize;
        writeCart(items);
        try { window.dispatchEvent(new Event('cart:changed')); } catch {}
        return buildCartResponse(items);
      }
      items[idx].quantity = quantity;
      if (selectedColor) items[idx].selectedColor = selectedColor;
      if (selectedSize) items[idx].selectedSize = selectedSize;
    }
    writeCart(items);
    try { window.dispatchEvent(new Event('cart:changed')); } catch {}
    return buildCartResponse(items);
  }

  async removeFromCart(itemId) {
    const items = readCart();
    const [pid] = itemId.split('_');
    const newItems = items.filter((it) => String(it.productId) !== pid);
    writeCart(newItems);
    this._ids.delete(pid);
    try { window.dispatchEvent(new Event('cart:changed')); } catch {}
    return buildCartResponse(newItems);
  }

  async clearCart() {
    writeCart([]);
    this._ids.clear();
    try { window.dispatchEvent(new Event('cart:changed')); } catch {}
    return buildCartResponse([]);
  }

  async getCartCount() {
    const items = readCart();
    return items.reduce((sum, it) => sum + it.quantity, 0);
  }

  // Get raw items for checkout submission
  getRawItems() {
    return readCart();
  }
}

export default new CartService();
