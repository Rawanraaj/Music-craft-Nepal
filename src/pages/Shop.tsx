import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../lib/api';
import type { Product } from '../types';
import { CATEGORIES } from '../types';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

const PRICE_RANGES = [
  { label: 'Under Rs. 2,000', min: 0, max: 2000 },
  { label: 'Rs. 2,000 - Rs. 5,000', min: 2000, max: 5000 },
  { label: 'Rs. 5,000 - Rs. 10,000', min: 5000, max: 10000 },
  { label: 'Rs. 10,000 - Rs. 20,000', min: 10000, max: 20000 },
  { label: 'Over Rs. 20,000', min: 20000, max: Infinity },
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
  const priceParam = searchParams.get('price') || '';

  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => console.error('Error fetching products:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (priceParam) {
      setSelectedPriceRanges(priceParam.split(','));
    } else {
      setSelectedPriceRanges([]);
    }
  }, [priceParam]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (categoryParam) {
      result = result.filter((p) => p.category === categoryParam);
    }

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

    // Deals filter
    if (dealsParam) {
      result = result.filter((p) => p.originalPrice && p.originalPrice > p.price);
    }

    // Price filter
    if (selectedPriceRanges.length > 0) {
      result = result.filter((p) =>
        selectedPriceRanges.some((rangeIdx) => {
          const range = PRICE_RANGES[parseInt(rangeIdx)];
          return p.price >= range.min && p.price < range.max;
        })
      );
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
  }, [categoryParam, queryParam, dealsParam, sortParam, selectedPriceRanges]);

  const updateCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const updateSort = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    setSearchParams(params);
    setSortOpen(false);
  };

  const togglePriceRange = (idx: number) => {
    const idxStr = idx.toString();
    const newRanges = selectedPriceRanges.includes(idxStr)
      ? selectedPriceRanges.filter((r) => r !== idxStr)
      : [...selectedPriceRanges, idxStr];

    const params = new URLSearchParams(searchParams);
    if (newRanges.length > 0) {
      params.set('price', newRanges.join(','));
    } else {
      params.delete('price');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSelectedPriceRanges([]);
  };

  const hasActiveFilters = categoryParam || queryParam || dealsParam || selectedPriceRanges.length > 0;

  const heading = dealsParam
    ? 'Deals & Offers'
    : queryParam
    ? `Search: "${queryParam}"`
    : categoryParam || 'All Instruments';

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wide mb-3">
          Categories
        </h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateCategory('')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                !categoryParam
                  ? 'bg-mcn-blue text-white'
                  : 'text-mcn-gray-600 hover:bg-mcn-gray-100'
              }`}
            >
              All Instruments
            </button>
          </li>
          {CATEGORIES.filter((c) => c !== 'Wholesale' && c !== 'Deals').map((cat) => (
            <li key={cat}>
              <button
                onClick={() => updateCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                  categoryParam === cat
                    ? 'bg-mcn-blue text-white'
                    : 'text-mcn-gray-600 hover:bg-mcn-gray-100'
                }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wide mb-3">
          Price Range
        </h3>
        <ul className="space-y-1">
          {PRICE_RANGES.map((range, idx) => (
            <li key={idx}>
              <button
                onClick={() => togglePriceRange(idx)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-mcn-gray-600 hover:bg-mcn-gray-100 transition-colors"
              >
                <span
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedPriceRanges.includes(idx.toString())
                      ? 'bg-mcn-blue border-mcn-blue'
                      : 'border-mcn-gray-300'
                  }`}
                >
                  {selectedPriceRanges.includes(idx.toString()) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </span>
                {range.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2.5 border-2 border-mcn-gray-300 text-mcn-charcoal text-sm font-bold rounded-lg hover:bg-mcn-gray-50 transition-colors"
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
          <p className="text-mcn-gray-500 font-bold">Loading shop...</p>
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
            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-2 border-mcn-gray-300 rounded-lg text-sm font-bold text-mcn-charcoal hover:bg-mcn-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            {/* Sort dropdown */}
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
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28">
              <FilterContent />
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-bold text-mcn-charcoal mb-2">No products found</p>
                <p className="text-sm text-mcn-gray-500 mb-6">Try adjusting your filters or search.</p>
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

      {/* Mobile filter drawer */}
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
