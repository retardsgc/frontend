import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import wishlistService from '../services/wishlistService';
import cartService from '../services/cartService';
import { Product, Color } from '../types';

// Utilities
const getPid = (p: Partial<Product> | null | undefined): string => String((p && ((p as any)._id || (p as any).id)) || '');
const resolveImageSrc = (raw?: string): string => {
  const src = (raw || '').trim();
  if (!src) return '/images/placeholder.svg';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/api/images/') || src.startsWith('/images/')) return src;
  return `/images/${src.replace(/^\/?/, '')}`;
};

const getActivePrice = (product: Product, idx: number): number => {
  const vp = (product as any).variantPrices as number[] | undefined;
  if (Array.isArray(vp) && vp[idx] != null) return vp[idx];
  return product?.price ?? 0;
};

const getActiveOriginalPrice = (product: Product, idx: number): number | undefined => {
  const vop = (product as any).variantOriginalPrices as number[] | undefined;
  if (Array.isArray(vop) && vop[idx] != null) return vop[idx];
  return product?.originalPrice;
};

interface WishlistCardProps {
  product: Product;
  selectedIndex: number;
  onSelectColor: (productId: string, colorIndex: number) => void;
  onAddToCart: (productId: string) => void;
  onRemove: (productId: string) => void;
  inCart: boolean;
}

const WishlistCard: React.FC<WishlistCardProps> = ({
  product,
  selectedIndex,
  onSelectColor,
  onAddToCart,
  onRemove,
  inCart,
}) => {
  const pid = getPid(product);
  const colors: Color[] = product?.colors || [];
  const safeIndex = Math.max(0, Math.min(selectedIndex ?? 0, Math.max(0, colors.length - 1)));
  const activeImage = (product?.images && product.images[safeIndex]) || product?.images?.[0];
  const activePrice = getActivePrice(product, safeIndex);
  const activeOriginal = getActiveOriginalPrice(product, safeIndex);

  return (
    <div className="group rounded-lg lg:rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <Link to={`/product/${pid}`} className="block bg-gray-50">
        <div className="w-full aspect-[4/5] overflow-hidden">
          <img
            src={resolveImageSrc(activeImage)}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 lg:p-4">
        <Link to={`/product/${pid}`} className="block">
          <h3 className="text-sm sm:text-base lg:text-lg text-gray-900 hover:underline line-clamp-2">{product.name}</h3>
        </Link>
        <div className="mt-1.5 lg:mt-2 flex items-center gap-2 text-sm lg:text-base">
          <span className="text-gray-900 font-semibold">₹{activePrice}</span>
          {activeOriginal && activeOriginal > activePrice && (
            <span className="text-gray-500 line-through text-xs lg:text-sm">₹{activeOriginal}</span>
          )}
        </div>

        {/* Swatches */}
        {colors?.length > 0 && (
          <div className="mt-2 lg:mt-3 flex items-center gap-1.5 lg:gap-2">
            {colors.map((c, idx) => (
              <button
                key={`${pid}-${c.name}-${idx}`}
                type="button"
                aria-label={`Select ${c.name} color`}
                aria-pressed={safeIndex === idx}
                onClick={() => onSelectColor(pid, idx)}
                className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full border-2 transition-transform duration-150 hover:scale-110 ${
                  safeIndex === idx ? 'border-black shadow-sm' : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 lg:mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onAddToCart(pid)}
            disabled={inCart}
            className={`flex-1 py-1.5 lg:py-2 px-3 lg:px-4 rounded-md text-xs lg:text-sm font-medium transition-colors ${
              inCart ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {inCart ? 'In Cart' : 'Add to Cart'}
          </button>
          <button
            type="button"
            onClick={() => onRemove(pid)}
            className="px-2 lg:px-3 py-1.5 lg:py-2 rounded-md text-xs lg:text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label="Remove from wishlist"
            title="Remove"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const [selectedById, setSelectedById] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const ids = await cartService.getCartIds();
        if (!mounted) return;
        setCartIds(new Set(Array.from(ids as Set<string>)));
      } catch {
        // ignore
      }
    };
    refresh();
    const onCart = () => refresh();
    window.addEventListener('cart:changed', onCart);
    return () => {
      mounted = false;
      window.removeEventListener('cart:changed', onCart);
    };
  }, []);

  const initSelectedMap = useCallback((items: Product[]) => {
    const map: Record<string, number> = {};
    for (const p of items) {
      const idx = (p.colors || []).findIndex((c) => c && (c as any).selected);
      map[getPid(p)] = idx >= 0 ? idx : 0;
    }
    return map;
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      if ((response as any).success) {
        const items = ((response as any).data || []) as Product[];
        setWishlist(items);
        setSelectedById(() => ({ ...initSelectedMap(items) }));
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectColor = (productId: string, colorIndex: number) => {
    setSelectedById((prev) => ({ ...prev, [String(productId)]: colorIndex }));
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const response = await wishlistService.removeFromWishlist(productId);
      if ((response as any).success) {
        const items = ((response as any).data || []) as Product[];
        setWishlist(items);
        setSelectedById((prev) => {
          const next = { ...prev };
          delete next[String(productId)];
          return next;
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to remove item');
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      if (cartIds.has(String(productId))) return;
      await cartService.addToCart(productId, 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to add to cart');
    }
  };

  const isInCart = (productId: string) => cartIds.has(String(productId));

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-3 lg:mt-4 text-sm lg:text-base text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6 lg:py-10" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-900">My Favorites</h1>
          <p className="text-gray-500 text-sm lg:text-base mt-0.5 lg:mt-1">Items you've saved for later</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="text-center py-12 lg:py-20">
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">Your favorites is empty</h3>
            <p className="text-gray-500 text-sm lg:text-base mb-4 lg:mb-6">Start adding products to your favorites.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-4 lg:px-5 py-2 lg:py-2.5 rounded-md text-sm lg:text-base text-white bg-black hover:bg-gray-800"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 xl:gap-8">
            {wishlist.map((product) => (
              <WishlistCard
                key={getPid(product)}
                product={product}
                selectedIndex={selectedById[getPid(product)] ?? 0}
                onSelectColor={handleSelectColor}
                onAddToCart={handleAddToCart}
                onRemove={handleRemoveFromWishlist}
                inCart={isInCart(getPid(product))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
