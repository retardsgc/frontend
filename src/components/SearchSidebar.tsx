import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, Category } from '../types';
import { searchProducts, getCategories, getHotDealProducts, getBestsellerProducts, getProducts } from '../services/dataService.js';
import cartService from '../services/cartService';
import wishlistService from '../services/wishlistService';
import { getImageUrl } from '../utils/imageUrl';

// Simple fuzzy search function for local product matching
const fuzzyMatch = (text: string, query: string): number => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match gets highest score
  if (textLower === queryLower) return 100;
  
  // Starts with match gets high score
  if (textLower.startsWith(queryLower)) return 80;
  
  // Contains match gets medium score
  if (textLower.includes(queryLower)) return 60;
  
  // Fuzzy character matching for typo tolerance
  let score = 0;
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 2;
      queryIndex++;
    }
  }
  
  // Bonus if we matched all query characters
  if (queryIndex === queryLower.length) {
    score += 10;
  }
  
  return score;
};

// Placeholder image for products without images
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

// Helper to get product image with fallback
const getProductImage = (product: Product): string => {
  return getImageUrl(product.images?.[0]);
};

interface SearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const [wishIds, setWishIds] = useState<Set<string>>(new Set());
  const [announcementBarHeight, setAnnouncementBarHeight] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const resultsCacheRef = useRef<Map<string, Product[]>>(new Map());
  const allProductsRef = useRef<Product[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'newest' | 'rating' | 'popularity'>('relevance');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('recentSearches');
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.slice(0, 8) : [];
    } catch { return []; }
  });
  const synonyms: Record<string, string[]> = {
    sneakers: ['running shoes', 'trainers', 'sport shoes'],
    earphones: ['earbuds', 'headphones'],
    mobile: ['phone', 'smartphone'],
  };

  // Listen for announcement bar height changes
  useEffect(() => {
    const handleAnnouncementBarHeight = (e: CustomEvent<number>) => {
      setAnnouncementBarHeight(e.detail || 0);
    };
    
    // Try to get initial height from existing announcement bar
    const announcementBar = document.querySelector('[role="region"][aria-label="Site announcements"]');
    if (announcementBar) {
      setAnnouncementBarHeight((announcementBar as HTMLElement).offsetHeight || 48);
    }
    
    window.addEventListener('announcementbar:height', handleAnnouncementBarHeight as EventListener);
    return () => {
      window.removeEventListener('announcementbar:height', handleAnnouncementBarHeight as EventListener);
    };
  }, []);

  // Load categories and current cart/wishlist ids when opening
  useEffect(() => {
    let mounted = true;
    const loadStatic = async () => {
      setInitialLoading(true);
      setError(null);
      try {
        const [cats, cids, wids, hotDeals, best, all] = await Promise.all([
          getCategories(),
          cartService.getCartIds(),
          wishlistService.getWishlistIds(),
          getHotDealProducts(),
          getBestsellerProducts(),
          getProducts({ limit: 1000 }), // Fetch all products
        ]);
        if (!mounted) return;
        setCategories(cats || []);
        setCartIds(new Set(cids));
        setWishIds(new Set(wids));
        // Build a unique trending pool from hot deals + bestseller
        const map = new Map<string, Product>();
        [...(hotDeals || []), ...(best || [])].forEach(p => {
          const id = String(p._id || p.id);
          if (!map.has(id)) map.set(id, p);
        });
        setTrending(Array.from(map.values()).slice(0, 20));
        allProductsRef.current = all || [];
      } catch (e) {
        if (mounted) setError('Failed to load search data. Please try again.');
      } finally {
        if (mounted) setInitialLoading(false);
      }
    };
    if (isOpen) {
      loadStatic();
      // Focus input shortly after open
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // Listen to cart/wishlist change events to keep badges in sync
  useEffect(() => {
    const refreshIds = async () => {
      try {
        const [cids, wids] = await Promise.all([
          cartService.getCartIds(),
          wishlistService.getWishlistIds(),
        ]);
        setCartIds(new Set(cids));
        setWishIds(new Set(wids));
      } catch {}
    };
    window.addEventListener('cart:changed', refreshIds);
    window.addEventListener('wishlist:changed', refreshIds);
    return () => {
      window.removeEventListener('cart:changed', refreshIds);
      window.removeEventListener('wishlist:changed', refreshIds);
    };
  }, []);

  // Close on Escape and outside click
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!(e.target instanceof Node)) return;
      // If click is outside of panel, close
      if (!panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    // lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Debounced search (hybrid: local elasticlunr + backend fallback)
  useEffect(() => {
    if (!isOpen) return;
    const q = query.trim();
    if (q.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    // serve cached results immediately if present (include sortBy in cache key)
    const cacheKey = `${q.toLowerCase()}_${sortBy}`;
    const cached = resultsCacheRef.current.get(cacheKey);
    if (cached) {
      setResults(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    const t = setTimeout(async () => {
      try {
        // Clear cache for this query when sort changes to ensure fresh sorted results
        // Expand query with synonyms to improve recall
        const expanded = new Set<string>([q]);
        const qTokens = q.toLowerCase().split(/\s+/).filter(Boolean);
        for (const tok of qTokens) {
          (synonyms[tok] || []).forEach(s => expanded.add(s));
        }
        // Local fuzzy search
        let localProducts: Product[] = [];
        if (allProductsRef.current.length) {
          const searchResults: Array<{ product: Product; score: number }> = [];
          
          for (const product of allProductsRef.current) {
            const searchableText = [
              product.name || '',
              product.description || '',
              product.category || ''
            ].join(' ');
            
            // Calculate fuzzy match score for each expanded query term
            let maxScore = 0;
            for (const term of expanded) {
              const score = fuzzyMatch(searchableText, term);
              maxScore = Math.max(maxScore, score);
            }
            
            // Only include products with decent match scores (30+ ensures relevance)
            if (maxScore > 30) {
              searchResults.push({ product, score: maxScore });
            }
          }
          
          // Sort by relevance score and take top results
          localProducts = searchResults
            .sort((a, b) => b.score - a.score)
            .slice(0, 40)
            .map(r => r.product);
        }

        // Backend fallback (ensures parity with server filters)
        const remote = await searchProducts(q);
        // Merge local + remote, de-dupe, keep local order priority
        const combined: Product[] = [];
        const seen = new Set<string>();
        const push = (arr: Product[]) => {
          for (const p of arr) {
            const id = String(p._id || p.id);
            if (!seen.has(id)) {
              combined.push(p);
              seen.add(id);
            }
          }
        };
        push(localProducts);
        push(remote || []);

        if (!cancelled) {
          // Client-side sort options
          const sorted = [...combined];
          if (sortBy === 'price') sorted.sort((a, b) => a.price - b.price);
          else if (sortBy === 'newest') {
            sorted.sort((a: any, b: any) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''));
          } else if (sortBy === 'rating') {
            sorted.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
          } else if (sortBy === 'popularity') {
            sorted.sort((a: any, b: any) => (b.reviews || 0) - (a.reviews || 0));
          }
          setResults(sorted);
          resultsCacheRef.current.set(cacheKey, sorted);
        }
      } catch (e) {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, isOpen, sortBy]);

  // Persist recent searches only when results are found
  useEffect(() => {
    const q = query.trim();
    if (!q || results.length === 0) return;
    // update after small idle window post-search
    const t = setTimeout(() => {
      setRecentSearches(prev => {
        const next = [q, ...prev.filter(s => s.toLowerCase() !== q.toLowerCase())].slice(0, 8);
        try { localStorage.setItem('recentSearches', JSON.stringify(next)); } catch {}
        return next;
      });
    }, 400);
    return () => clearTimeout(t);
  }, [results, query]);

  const handleAddToCart = useCallback(async (pid: string) => {
    try {
      await cartService.addToCart(pid, 1);
      // UI will update via cart:changed listener
    } catch (e) {
      // silently handle error
    }
  }, []);

  const handleAddToWishlist = useCallback(async (pid: string) => {
    try {
      await wishlistService.addToWishlist(pid);
    } catch (e) {
      // silently handle error
    }
  }, []);

  const hasQuery = query.trim().length > 0;
  const qLower = query.trim().toLowerCase();

  // Suggestion lists (products from trending + current results) and categories
  const productSuggestions = useMemo(() => {
    if (!hasQuery) return [] as Product[];
    const pool = [...trending, ...results];
    const seen = new Set<string>();
    const matched = pool.filter(p => {
      const id = String(p._id || p.id);
      if (seen.has(id)) return false;
      const name = (p.name || '').toLowerCase();
      const ok = name.includes(qLower);
      if (ok) seen.add(id);
      return ok;
    });
    // sort startsWith first, then by name length
    matched.sort((a, b) => {
      const an = a.name.toLowerCase();
      const bn = b.name.toLowerCase();
      const aStarts = an.startsWith(qLower) ? 1 : 0;
      const bStarts = bn.startsWith(qLower) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;
      return an.length - bn.length;
    });
    return matched.slice(0, 6);
  }, [hasQuery, qLower, trending, results]);

  const categorySuggestions = useMemo(() => {
    if (!hasQuery) return [] as Category[];
    const list = categories.filter(c => (c.name || '').toLowerCase().includes(qLower));
    return list.slice(0, 6);
  }, [hasQuery, qLower, categories]);

  // Highlight helper
  const highlight = (text: string, term: string) => {
    if (!term) return text;
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + term.length);
    const after = text.slice(idx + term.length);
    return (
      <>
        {before}
        <span className="bg-yellow-100">{match}</span>
        {after}
      </>
    );
  };

  return (
    <>
      {/* Overlay - starts below announcement bar */}
      <div
        className={`fixed inset-x-0 bottom-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} z-40`}
        style={{ top: `${announcementBarHeight}px` }}
        aria-hidden="true"
      />
      {/* Panel - positioned below announcement bar */}
      <div
        ref={panelRef}
        className={`fixed right-0 w-full sm:w-[420px] md:w-[480px] lg:w-[520px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
        style={{ 
          fontFamily: "'Albert Sans', sans-serif",
          top: `${announcementBarHeight}px`,
          height: `calc(100vh - ${announcementBarHeight}px)`,
          maxHeight: `calc(100vh - ${announcementBarHeight}px)`
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        {/* Header with input */}
        <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-9 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              aria-label="Search products"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                aria-label="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md flex-shrink-0" aria-label="Close search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body - scrollable content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 overscroll-contain">
          {/* Loading state for initial data */}
          {initialLoading && !hasQuery && (
            <div className="py-10 text-center">
              <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          )}

          {/* Error state */}
          {error && !hasQuery && (
            <div className="py-10 text-center">
              <p className="text-sm text-red-500 mb-2">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-sm text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* When there's no query, show recent searches, categories, and trending */}
          {!hasQuery && !initialLoading && !error && (
            <div className="space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 mb-2">Recent searches</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.slice(0, 3).map((s, i) => (
                      <button key={i} className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs truncate max-w-[120px]" onClick={() => setQuery(s)} title={s}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Browse categories</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="px-2.5 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-xs text-gray-800 text-left truncate"
                      onClick={() => {
                        navigate(`/products?category=${encodeURIComponent(c.name)}`);
                        onClose();
                      }}
                      title={c.name}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              {trending.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 mb-2">Trending products</h3>
                  <ul className="divide-y divide-gray-100 border border-gray-100 rounded-md">
                    {trending.slice(0, 5).map((p) => {
                      const pid = String(p._id || p.id);
                      const inCart = cartIds.has(pid);
                      const inWish = wishIds.has(pid);
                      return (
                        <li key={pid} className="p-2">
                          <div className="flex items-center gap-2">
                            <Link to={`/product/${pid}`} className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0" onClick={onClose}>
                              <img src={getProductImage(p)} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link to={`/product/${pid}`} className="block text-xs text-gray-900 truncate hover:underline" onClick={onClose} title={p.name}>
                                {p.name}
                              </Link>
                              <div className="text-xs text-gray-600">₹{p.price}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleAddToWishlist(pid)}
                                className={`p-1 rounded-full ${inWish ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                aria-label="Add to wishlist"
                                title={inWish ? 'In Wishlist' : 'Add to Wishlist'}
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={inWish ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleAddToCart(pid)}
                                disabled={inCart}
                                className={`px-2 py-1 rounded-md text-xs font-medium ${inCart ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                                aria-label="Add to cart"
                              >
                                {inCart ? 'In Cart' : 'Add'}
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Tip: Type a few letters to see suggestions and results instantly.
              </div>
            </div>
          )}

          {/* Results */}
          {hasQuery && (
            <div>
              {/* Sort options (compact) */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Sort</span>
                <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
                  {(['relevance', 'price', 'newest', 'rating', 'popularity'] as const).map(key => (
                    <button key={key} onClick={() => setSortBy(key)} className={`px-2 py-1 rounded text-xs ${sortBy === key ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-200'}`}>{key}</button>
                  ))}
                </div>
              </div>
              {(productSuggestions.length > 0 || categorySuggestions.length > 0) && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Suggestions</h3>
                  <ul className="space-y-1.5">
                    {productSuggestions.map(p => (
                      <li key={`ps-${p._id || p.id}`}>
                        <button
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 text-sm text-left"
                          onClick={() => setQuery(p.name)}
                          aria-label={`Use suggestion ${p.name}`}
                        >
                          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7l-8-4-8 4v10l8 4 8-4z"/></svg>
                          <span className="truncate">{highlight(p.name, query)}</span>
                        </button>
                      </li>
                    ))}
                    {categorySuggestions.map(c => (
                      <li key={`cs-${c.id}`}>
                        <button
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 text-sm text-left"
                          onClick={() => {
                            navigate(`/products?category=${encodeURIComponent(c.name)}`);
                            onClose();
                          }}
                          aria-label={`View category ${c.name}`}
                        >
                          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                          <span className="truncate">{highlight(c.name, query)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {loading ? (
                <div className="py-10 text-center text-gray-500 text-sm">Searching…</div>
              ) : results.length === 0 ? (
                <div className="py-10 text-center text-gray-500 text-sm">
                  No products found.
                  {/* Did you mean? simple correction by closest trending name */}
                  {trending.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-600">Did you mean: </span>
                      {trending
                        .map(p => p.name)
                        .filter(name => name && name.length > 0)
                        .slice(0, 50)
                        .sort((a, b) => Math.abs(a.length - query.length) - Math.abs(b.length - query.length))
                        .slice(0, 3)
                        .map((name, i) => (
                          <button key={i} className="text-blue-600 hover:underline ml-1" onClick={() => setQuery(name)}>
                            {name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {results.map((p) => {
                    const pid = String(p._id || p.id);
                    const inCart = cartIds.has(pid);
                    const inWish = wishIds.has(pid);
                    return (
                      <li key={pid} className="py-3">
                        <div className="flex items-center gap-3">
                          <Link to={`/product/${pid}`} className="w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-gray-100" onClick={onClose}>
                            <img src={getProductImage(p)} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${pid}`} className="block text-sm font-medium text-gray-900 truncate hover:underline" onClick={onClose}>
                              {p.name}
                            </Link>
                            <div className="text-xs text-gray-600">₹{p.price}</div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleAddToWishlist(pid)}
                              className={`p-2 rounded-full ${inWish ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                              title={inWish ? 'In Wishlist' : 'Add to Wishlist'}
                              aria-label="Add to wishlist"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={inWish ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleAddToCart(pid)}
                              disabled={inCart}
                              className={`px-3 py-1.5 rounded-md text-xs font-medium ${inCart ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                              aria-label="Add to cart"
                            >
                              {inCart ? 'In Cart' : 'Add'}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchSidebar;
