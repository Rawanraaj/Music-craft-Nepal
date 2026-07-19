import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../lib/api';
import type { Product } from '../types';
import { CATEGORIES } from '../types';
import { useSEO } from '../hooks/useSEO';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryParam = searchParams.get('category') || '';
  const queryParam = searchParams.get('q') || '';
  const dealsParam = searchParams.get('deals') === 'true';
  const sortParam = searchParams.get('sort') || 'featured';

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedArtisans, setSelectedArtisans] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // SEO
  useSEO({
    title: 'Shop Premium Instruments',
    description: 'Explore high-quality, handcrafted traditional and modern musical instruments from Nepal.'
  });

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => console.error('Error fetching products:', err))
      .finally(() => setLoading(false));
  }, []);

  // Sync category param from URL to state checkbox
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }
  }, [categoryParam]);

  // Extract unique artisans from loaded products list
  const uniqueArtisans = useMemo(() => {
    const list = products.map((p) => p.artisan).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (queryParam) {
      const q = queryParam.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Category filter (checkbox multi-selection)
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Price range filters
    if (minPrice) {
      result = result.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }

    // Artisan filter
    if (selectedArtisans.length > 0) {
      result = result.filter((p) => p.artisan && selectedArtisans.includes(p.artisan));
    }

    // In Stock Only
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Deals filter
    if (dealsParam) {
      result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }

    // Sort
    switch (sortParam) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0));
        break;
    }

    return result;
  }, [products, queryParam, selectedCategories, minPrice, maxPrice, selectedArtisans, inStockOnly, dealsParam, sortParam]);

  const updateSort = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    setSearchParams(params);
    setSortOpen(false);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleArtisan = (art: string) => {
    setSelectedArtisans((prev) =>
      prev.includes(art) ? prev.filter((a) => a !== art) : [...prev, art]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedArtisans([]);
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedArtisans.length > 0 ||
    minPrice !== '' ||
    maxPrice !== '' ||
    inStockOnly;

  const heading = dealsParam
    ? 'Deals & Offers'
    : queryParam
    ? `Search: "${queryParam}"`
    : 'All Instruments';

  const FilterContent = () => (
    <div className="space-y-6 bg-white p-4 rounded-xl border border-mcn-gray-200">
      {/* Category Checkboxes */}
      <div>
        <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider mb-3">
          Categories
        </h3>
        <div className="space-y-2">
          {CATEGORIES.filter((c) => c !== 'Wholesale' && c !== 'Deals').map((cat) => {
            const isChecked = selectedCategories.includes(cat);
            return (
              <label key={cat} className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-mcn-gray-600 hover:text-mcn-charcoal">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCategory(cat)}
                  className="rounded border-mcn-gray-300 text-mcn-blue focus:ring-mcn-blue h-4 w-4"
                />
                {cat}
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range inputs */}
      <div>
        <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider mb-3">
          Price (Rs.)
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 rounded-lg border border-mcn-gray-350 px-3 py-2 text-xs focus:ring-1 focus:ring-mcn-blue outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 rounded-lg border border-mcn-gray-350 px-3 py-2 text-xs focus:ring-1 focus:ring-mcn-blue outline-none"
          />
        </div>
      </div>

      {/* Artisans Checkboxes */}
      {uniqueArtisans.length > 0 && (
        <div>
          <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider mb-3">
            Artisan / Maker
          </h3>
          <div className="space-y-2">
            {uniqueArtisans.map((art) => {
              const isChecked = selectedArtisans.includes(art);
              return (
                <label key={art} className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-mcn-gray-600 hover:text-mcn-charcoal">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleArtisan(art)}
                    className="rounded border-mcn-gray-300 text-mcn-blue focus:ring-mcn-blue h-4 w-4"
                  />
                  {art}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* In Stock toggle */}
      <div className="pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-mcn-charcoal">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded border-mcn-gray-300 text-mcn-blue focus:ring-mcn-blue h-4 w-4"
          />
          In Stock Only
        </label>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2.5 bg-mcn-gray-100 hover:bg-mcn-gray-200 text-mcn-charcoal text-xs font-bold rounded-lg border border-mcn-gray-300 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-mcn-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mcn-gray-500 font-bold">Loading instruments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-mcn-gray-200 bg-mcn-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p className="text-xs text-mcn-gray-500">
            Home / <span className="text-mcn-charcoal font-semibold">{heading}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-mcn-charcoal">{heading}</h1>
            <p className="text-sm text-mcn-gray-500 mt-1">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-2 border-mcn-gray-300 rounded-lg text-sm font-bold text-mcn-charcoal hover:bg-mcn-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-mcn-gray-300 rounded-lg text-sm font-bold text-mcn-charcoal hover:bg-mcn-gray-50 transition-colors"
              >
                Sort: {SORT_OPTIONS.find((o) => o.value === sortParam)?.label}
                <ChevronDown className="w-4 h-4" />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-mcn-gray-200 rounded-lg shadow-lg z-20 py-1">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateSort(option.value)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                          sortParam === option.value
                            ? 'text-mcn-blue bg-mcn-blue/5'
                            : 'text-mcn-gray-600 hover:bg-mcn-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28">
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-bold text-mcn-charcoal mb-2">No products match your criteria</p>
                <p className="text-sm text-mcn-gray-500 mb-6">Try relaxing your price filters or checking other categories.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-mcn-gray-200 sticky top-0 bg-white z-10">
              <span className="text-lg font-extrabold text-mcn-charcoal">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                <X className="w-6 h-6 text-mcn-charcoal" />
              </button>
            </div>
            <div className="p-4">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
