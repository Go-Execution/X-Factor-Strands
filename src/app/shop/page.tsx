"use client";

import * as React from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Product, ProductCard } from '@/components/products/ProductData';
import { ProductGridSkeleton } from '@/components/products/ProductCardSkeleton';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Layers, 
  LayoutGrid, 
  Sparkles, 
  Check, 
  X, 
  ArrowRight,
  Activity, 
  ShieldCheck, 
  Zap, 
  Moon, 
  Battery, 
  Brain,
  SlidersHorizontal,
  RotateCcw,
  ArrowDownAZ,
  DollarSign
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { smartSearchProducts } from '@/lib/search';
import { cn } from '@/lib/utils';

interface CategoryInfo {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const CATEGORY_DEFINITIONS: CategoryInfo[] = [
  {
    id: 'metabolic-lipid',
    name: 'Metabolic & Lipid Research',
    shortName: 'Metabolic & Lipid',
    icon: Activity,
    description: 'Targeted research compounds investigated for metabolic pathways, insulin sensitivity, and lipid regulation.',
  },
  {
    id: 'tissue-repair',
    name: 'Tissue Regeneration & Repair',
    shortName: 'Tissue Repair',
    icon: ShieldCheck,
    description: 'Compounds studied for extracellular matrix restoration, accelerated tissue repair, and cellular regeneration.',
  },
  {
    id: 'musculoskeletal',
    name: 'Musculoskeletal & Cellular Dynamics',
    shortName: 'Musculoskeletal',
    icon: Zap,
    description: 'Laboratory peptides explored for amino acid transport, muscular peptide signalling, and cellular resilience.',
  },
  {
    id: 'sleep',
    name: 'Sleep',
    shortName: 'Sleep & Circadian',
    icon: Moon,
    description: 'Compounds investigated for their regulatory role in circadian rhythm stability and sleep architecture.',
  },
  {
    id: 'energy',
    name: 'Energy',
    shortName: 'Energy & Mitochondrial',
    icon: Battery,
    description: 'Research compounds exploring cellular ATP production, mitochondrial dynamics, and metabolic vitality.',
  },
  {
    id: 'focus-cognitive',
    name: 'Focus & Cognitive',
    shortName: 'Focus & Cognitive',
    icon: Brain,
    description: 'Peptide sequences evaluated for neuroprotective signaling, memory consolidation, and cognitive pathways.',
  },
];

type SortOption = 'alpha-asc' | 'alpha-desc' | 'price-asc' | 'price-desc' | 'category';
type ViewMode = 'categorized' | 'alphabetical' | 'grid';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filter & Navigation states
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 200]);
  const [sortOption, setSortOption] = React.useState<SortOption>('alpha-asc');
  const [viewMode, setViewMode] = React.useState<ViewMode>('categorized');
  const [selectedLetter, setSelectedLetter] = React.useState<string | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(24);

  // Sync category from URL query parameters (e.g., /shop?category=Sleep)
  React.useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
    const viewParam = searchParams.get('view');
    if (viewParam === 'alphabetical' || viewParam === 'grid' || viewParam === 'categorized') {
      setViewMode(viewParam as ViewMode);
    }
    const sortParam = searchParams.get('sort');
    if (sortParam && ['alpha-asc', 'alpha-desc', 'price-asc', 'price-desc', 'category'].includes(sortParam)) {
      setSortOption(sortParam as SortOption);
    }
  }, [searchParams]);

  React.useEffect(() => {
    async function loadProducts() {
      const { getProducts } = await import('@/lib/api');
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  // Compute all available categories from loaded products
  const allCategories = React.useMemo(() => {
    const definedNames = CATEGORY_DEFINITIONS.map(c => c.name.toLowerCase());
    const existingCats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    const combined = [...CATEGORY_DEFINITIONS];

    existingCats.forEach(cat => {
      if (!definedNames.includes(cat.toLowerCase())) {
        combined.push({
          id: cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: cat,
          shortName: cat,
          icon: Layers,
          description: `Research compounds in the ${cat} category.`,
        });
      }
    });
    return combined;
  }, [products]);

  // Live count per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Available starting letters for the A-Z directory
  const availableLetters = React.useMemo(() => {
    const letters = new Set<string>();
    products.forEach(p => {
      const firstChar = p.name.trim().charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) {
        letters.add(firstChar);
      } else if (/[0-9]/.test(firstChar)) {
        letters.add('#');
      }
    });
    return Array.from(letters).sort((a, b) => {
      if (a === '#') return -1;
      if (b === '#') return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  // Filtered and Sorted products
  const filteredProducts = React.useMemo(() => {
    let list = products;

    // Search query
    if (searchQuery.trim()) {
      list = smartSearchProducts(products, searchQuery);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(p => 
        p.category.toLowerCase() === selectedCategory.toLowerCase() ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Price filter
    list = list.filter(p => {
      const minPrice = p.variants?.[0]?.price ?? 0;
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // Letter filter
    if (selectedLetter !== null) {
      list = list.filter(p => {
        const first = p.name.trim().charAt(0).toUpperCase();
        if (selectedLetter === '#') {
          return /[0-9]/.test(first);
        }
        return first === selectedLetter;
      });
    }

    // Sort order
    const sorted = [...list];
    switch (sortOption) {
      case 'alpha-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'alpha-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        sorted.sort((a, b) => (a.variants?.[0]?.price ?? 0) - (b.variants?.[0]?.price ?? 0));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.variants?.[0]?.price ?? 0) - (a.variants?.[0]?.price ?? 0));
        break;
      case 'category':
        sorted.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        break;
    }

    return sorted;
  }, [products, searchQuery, selectedCategory, priceRange, selectedLetter, sortOption]);

  // Grouped products by Category
  const productsByCategory = React.useMemo(() => {
    const groups: { category: CategoryInfo; products: Product[] }[] = [];
    allCategories.forEach(cat => {
      const catProducts = filteredProducts.filter(p => 
        p.category.toLowerCase() === cat.name.toLowerCase() ||
        p.category.toLowerCase().includes(cat.name.toLowerCase())
      );
      if (catProducts.length > 0) {
        // Always sort alphabetically within category for clean presentation
        const sortedCatProducts = [...catProducts].sort((a, b) => {
          if (sortOption === 'alpha-desc') return b.name.localeCompare(a.name);
          if (sortOption === 'price-asc') return (a.variants?.[0]?.price ?? 0) - (b.variants?.[0]?.price ?? 0);
          if (sortOption === 'price-desc') return (b.variants?.[0]?.price ?? 0) - (a.variants?.[0]?.price ?? 0);
          return a.name.localeCompare(b.name);
        });
        groups.push({ category: cat, products: sortedCatProducts });
      }
    });
    return groups;
  }, [allCategories, filteredProducts, sortOption]);

  // Grouped products by Letter (for A-Z view)
  const productsByLetter = React.useMemo(() => {
    const letterMap: Record<string, Product[]> = {};
    filteredProducts.forEach(p => {
      const first = p.name.trim().charAt(0).toUpperCase();
      const key = /[0-9]/.test(first) ? '#' : first;
      if (!letterMap[key]) letterMap[key] = [];
      letterMap[key].push(p);
    });

    const keys = Object.keys(letterMap).sort((a, b) => {
      if (a === '#') return -1;
      if (b === '#') return 1;
      return a.localeCompare(b);
    });

    return keys.map(k => ({
      letter: k,
      products: letterMap[k].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [filteredProducts]);

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    searchQuery.trim() !== '' || 
    selectedLetter !== null || 
    priceRange[0] !== 0 || 
    priceRange[1] !== 200;

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedLetter(null);
    setPriceRange([0, 200]);
    router.replace('/shop');
  };

  const handleCategorySelect = (catName: string) => {
    if (selectedCategory === catName) {
      setSelectedCategory('all');
    } else {
      setSelectedCategory(catName);
    }
  };

  // Reusable Sidebar filter component
  const renderFilterSidebar = () => (
    <div className="space-y-8">
      {/* Category List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            Research Categories
          </h3>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs text-accent hover:underline"
            >
              Show All
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left",
              selectedCategory === 'all'
                ? "bg-accent/15 text-accent font-semibold border border-accent/30 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <span>All Compounds</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-background/60 border border-border">
              {products.length}
            </span>
          </button>

          {allCategories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const count = categoryCounts[cat.name] || 0;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.name)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left group",
                  isSelected
                    ? "bg-accent/15 text-accent font-semibold border border-accent/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isSelected ? "text-accent" : "text-muted-foreground group-hover:text-accent")} />
                  <span className="truncate">{cat.shortName}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-background/60 border border-border shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            Price Range
          </h3>
          <span className="text-xs font-semibold text-accent font-mono bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
            ${priceRange[0]} – ${priceRange[1]}
          </span>
        </div>
        <div className="pt-2 px-1">
          <Slider 
            min={0} 
            max={200} 
            step={5} 
            value={priceRange} 
            onValueChange={(val) => setPriceRange(val as [number, number])} 
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground mt-2 font-mono">
          <span>$0</span>
          <span>$100</span>
          <span>$200+</span>
        </div>
      </div>

      {/* Reset Filter Button */}
      {hasActiveFilters && (
        <Button
          onClick={resetFilters}
          variant="outline"
          size="sm"
          className="w-full border-accent/40 text-accent hover:bg-accent hover:text-background flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Filters
        </Button>
      )}

      {/* Compliance Notice */}
      <div className="bg-card/70 border border-border rounded-xl p-4 shadow-sm">
        <h4 className="font-display font-medium text-xs text-accent uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Research Compliance
        </h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          All listed compounds are strictly for laboratory and scientific research purposes only. Not intended for human or veterinary administration.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-accent/20">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-28 pb-20">
        {/* Hero Header Block */}
        <div className="bg-gradient-to-b from-card/80 to-background border-b border-border py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-4 border border-accent/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified High-Purity Compounds</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight text-white">
              Research Peptides Catalogue
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Explore our full laboratory catalogue arranged by research specialty or alphabetically for effortless navigation.
            </p>

            {/* In-Hero Search Bar */}
            <div className="mt-8 max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
              <input 
                type="text" 
                placeholder="Search compound, acronym, or target (e.g. BPC-157, GLP-1, Sermorelin)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card/90 backdrop-blur-md border border-border/80 rounded-xl pl-12 pr-10 py-3.5 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Category Navigation Bar (Horizontal Scroll / Pill bar) */}
        <div className="border-b border-border bg-card/40 sticky top-20 z-30 backdrop-blur-md">
          <div className="container mx-auto px-4 lg:px-8 py-3.5">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all shrink-0 flex items-center gap-2 border",
                  selectedCategory === 'all'
                    ? "bg-accent text-background font-bold border-accent shadow-md shadow-accent/20"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-accent/40"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Peptides</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  selectedCategory === 'all' ? "bg-background/25 text-background" : "bg-muted text-muted-foreground"
                )}>
                  {products.length}
                </span>
              </button>

              {allCategories.map(cat => {
                const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                const count = categoryCounts[cat.name] || 0;
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={cn(
                      "px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all shrink-0 flex items-center gap-2 border",
                      isSelected
                        ? "bg-accent text-background font-bold border-accent shadow-md shadow-accent/20"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-accent/40"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.shortName}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full",
                      isSelected ? "bg-background/25 text-background font-bold" : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Layout with Sidebar */}
        <div className="container mx-auto px-4 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter & Toolbar Row */}
          <div className="lg:hidden flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 border-border">
                    <Filter className="w-4 h-4 text-accent" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                      <span className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto w-full sm:w-[380px] bg-background border-border">
                  <SheetHeader className="mb-6 text-left">
                    <SheetTitle className="text-2xl font-display">Refine Compounds</SheetTitle>
                  </SheetHeader>
                  {renderFilterSidebar()}
                </SheetContent>
              </Sheet>

              {/* View Switcher Mobile */}
              <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('categorized')}
                  className={cn(
                    "p-1.5 rounded text-xs transition-colors flex items-center gap-1",
                    viewMode === 'categorized' ? "bg-accent text-background font-bold" : "text-muted-foreground"
                  )}
                  title="Grouped by Category"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('alphabetical')}
                  className={cn(
                    "p-1.5 rounded text-xs transition-colors flex items-center gap-1",
                    viewMode === 'alphabetical' ? "bg-accent text-background font-bold" : "text-muted-foreground"
                  )}
                  title="A-Z Directory"
                >
                  <ArrowDownAZ className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-1.5 rounded text-xs transition-colors flex items-center gap-1",
                    viewMode === 'grid' ? "bg-accent text-background font-bold" : "text-muted-foreground"
                  )}
                  title="Standard Grid"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sort Dropdown Mobile */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-card border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent"
              >
                <option value="alpha-asc">A → Z</option>
                <option value="alpha-desc">Z → A</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="category">Category</option>
              </select>
            </div>

            {/* Mobile A-Z Letter Bar */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedLetter(null)}
                className={cn(
                  "px-2 py-1 rounded text-[11px] font-medium shrink-0",
                  selectedLetter === null
                    ? "bg-accent text-background font-bold"
                    : "bg-card text-muted-foreground border border-border"
                )}
              >
                All
              </button>
              {availableLetters.map(letter => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                  className={cn(
                    "w-6 h-6 rounded text-[11px] font-semibold shrink-0 flex items-center justify-center",
                    selectedLetter === letter
                      ? "bg-accent text-background font-bold"
                      : "bg-card text-muted-foreground border border-border"
                  )}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-36">
              {renderFilterSidebar()}
            </div>
          </aside>

          {/* Main Products Area */}
          <div className="flex-1 min-w-0">
            {/* Desktop Toolbar: Count, A-Z letter bar, View Switcher & Sort */}
            <div className="hidden lg:flex flex-col gap-4 mb-8 pb-4 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-semibold text-foreground">
                    {selectedCategory === 'all' ? 'All Research Compounds' : selectedCategory}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Showing <span className="text-foreground font-semibold">{filteredProducts.length}</span> of {products.length} compounds
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-card border border-border rounded-xl p-1 gap-1">
                    <button
                      onClick={() => setViewMode('categorized')}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        viewMode === 'categorized'
                          ? "bg-accent text-background font-bold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Categorized</span>
                    </button>

                    <button
                      onClick={() => setViewMode('alphabetical')}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        viewMode === 'alphabetical'
                          ? "bg-accent text-background font-bold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <ArrowDownAZ className="w-3.5 h-3.5" />
                      <span>A – Z Index</span>
                    </button>

                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        viewMode === 'grid'
                          ? "bg-accent text-background font-bold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Grid</span>
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5">
                    <ArrowDownAZ className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs text-muted-foreground">Sort:</span>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="bg-transparent border-none text-foreground text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="alpha-asc" className="bg-background text-foreground">Alphabetical (A → Z)</option>
                      <option value="alpha-desc" className="bg-background text-foreground">Alphabetical (Z → A)</option>
                      <option value="price-asc" className="bg-background text-foreground">Price: Low to High</option>
                      <option value="price-desc" className="bg-background text-foreground">Price: High to Low</option>
                      <option value="category" className="bg-background text-foreground">Group by Category</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* A-Z Letter Quick Filter Bar */}
              <div className="flex items-center gap-1.5 pt-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  Alphabetical:
                </span>
                <button
                  onClick={() => setSelectedLetter(null)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0",
                    selectedLetter === null
                      ? "bg-accent text-background font-bold"
                      : "bg-card text-muted-foreground hover:text-foreground border border-border hover:border-accent/40"
                  )}
                >
                  All
                </button>
                {availableLetters.map(letter => {
                  const isSelected = selectedLetter === letter;
                  return (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(isSelected ? null : letter)}
                      className={cn(
                        "w-7 h-7 rounded-md text-xs font-semibold transition-all shrink-0 flex items-center justify-center",
                        isSelected
                          ? "bg-accent text-background font-bold shadow-md shadow-accent/20"
                          : "bg-card text-muted-foreground hover:text-foreground hover:border-accent/40 border border-border"
                      )}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Filters Summary Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-card/60 border border-border/80">
                <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
                
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/30">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory('all')} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedLetter !== null && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/30">
                    Letter: {selectedLetter}
                    <button onClick={() => setSelectedLetter(null)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery.trim() !== '' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/30">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {(priceRange[0] !== 0 || priceRange[1] !== 200) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/30">
                    Price: ${priceRange[0]}–${priceRange[1]}
                    <button onClick={() => setPriceRange([0, 200])} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-accent font-medium underline ml-auto"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading ? (
              <ProductGridSkeleton count={9} />
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center bg-card/40 rounded-2xl border border-dashed border-border p-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-xl font-display font-semibold mb-2">No research compounds found</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  We couldn't find any products matching your specific filters or search term. Try resetting your filters to view the full catalogue.
                </p>
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent hover:text-background"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : viewMode === 'categorized' && selectedCategory === 'all' && !searchQuery.trim() && selectedLetter === null ? (
              /* CATEGORIZED VIEW: Grouped by distinct category sections with headers */
              <div className="space-y-14">
                {productsByCategory.map(({ category, products: catProducts }) => {
                  const Icon = category.icon;
                  return (
                    <section key={category.id} id={`cat-${category.id}`} className="space-y-6 scroll-mt-36">
                      {/* Category Header Card */}
                      <div className="bg-card/70 border border-border rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-start md:items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shrink-0">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="text-xl md:text-2xl font-display font-bold text-foreground">
                                {category.name}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/25">
                                {catProducts.length} {catProducts.length === 1 ? 'Compound' : 'Compounds'}
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                              {category.description}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedCategory(category.name)}
                          className="text-xs font-medium text-accent hover:underline flex items-center gap-1 shrink-0 self-start md:self-auto"
                        >
                          Focus Category <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Products Grid for this category (Sorted Alphabetically A-Z) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {catProducts.map(product => (
                          <Link key={product.id} href={`/products/${product.id}`} className="block h-full">
                            <ProductCard product={product} />
                          </Link>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : viewMode === 'alphabetical' ? (
              /* ALPHABETICAL A-Z DIRECTORY VIEW: Grouped by starting letter */
              <div className="space-y-12">
                {productsByLetter.map(({ letter, products: letterProducts }) => (
                  <section key={letter} id={`letter-${letter}`} className="space-y-6 scroll-mt-36">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent font-display font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
                        {letter}
                      </div>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground font-medium px-2 py-1 rounded bg-card border border-border">
                        {letterProducts.length} {letterProducts.length === 1 ? 'Compound' : 'Compounds'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {letterProducts.map(product => (
                        <Link key={product.id} href={`/products/${product.id}`} className="block h-full">
                          <ProductCard product={product} />
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* STANDARD UNIFIED GRID VIEW */
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.slice(0, visibleCount).map(product => (
                    <Link key={product.id} href={`/products/${product.id}`} className="block h-full">
                      <ProductCard product={product} />
                    </Link>
                  ))}
                </div>

                {filteredProducts.length > visibleCount && (
                  <div className="flex justify-center pt-6">
                    <Button 
                      onClick={() => setVisibleCount(prev => prev + 12)}
                      variant="outline"
                      size="lg"
                      className="px-8 border-border hover:bg-white/5 hover:text-accent"
                    >
                      Load More Compounds ({filteredProducts.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Quick Jump / Return to Top */}
            <div className="mt-16 pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>Showing high-purity laboratory research peptides only.</span>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-accent hover:underline font-medium"
              >
                ↑ Back to Top of Catalogue
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-grow pt-28 pb-20 container mx-auto px-4 lg:px-8">
          <ProductGridSkeleton count={9} />
        </main>
        <Footer />
      </div>
    }>
      <ShopContent />
    </React.Suspense>
  );
}
