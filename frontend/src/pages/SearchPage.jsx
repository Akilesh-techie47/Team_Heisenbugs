import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { CATEGORIES, LOCATIONS } from '../data/mockData';
import { Search as SmartSearchEngine } from '../components/search/Search';
import { ItemCard } from '../components/common/ItemCard';
import { StatusBadge } from '../components/common/Badge';
import { ItemDetailModal } from '../components/verification/ItemDetailModal';
import { ClaimModal } from '../components/verification/ClaimModal';
import {
  Search as SearchIcon,
  Filter,
  Grid,
  List,
  MapPin,
  Calendar,
  X,
  SlidersHorizontal,
  Package,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SearchPage = () => {
  const { items } = useData();
  const navigate = useNavigate();

  // Mode: 'matcher' (Find my item with 3 choices) vs 'directory' (Directory browsing)
  const [activeTab, setActiveTab] = useState('matcher'); // 'matcher' | 'catalog'

  // Catalog Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'lost' | 'found' | 'recovered'
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals for directory browsing
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimingItem, setClaimingItem] = useState(null);

  // Filtered Items logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        item.color?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query) ||
        item.id?.toLowerCase().includes(query);

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'recovered' ? item.status === 'recovered' : item.type === selectedStatus);

      const matchesCategory =
        selectedCategory === 'All Categories' || item.category === selectedCategory;

      const matchesLocation =
        selectedLocation === 'All Locations' || item.location === selectedLocation;

      return matchesQuery && matchesStatus && matchesCategory && matchesLocation;
    });
  }, [items, searchQuery, selectedStatus, selectedCategory, selectedLocation]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedCategory('All Categories');
    setSelectedLocation('All Locations');
  };

  return (
    <div className="w-full">
      {/* Top Tab Bar: Switch between Smart Recovery Matcher and Full Campus Directory */}
      <div className="bg-white border-b-[2.5px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('matcher')}
              className={`px-4 py-2 text-xs font-black rounded-full border-2 border-black transition-all flex items-center gap-2 ${
                activeTab === 'matcher'
                  ? 'bg-brand-purple text-white shadow-[3px_3px_0px_#000] -translate-y-0.5'
                  : 'bg-white text-black hover:bg-brand-lilac/30 shadow-[1px_1px_0px_#000]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-brand-yellow" />
              <span>FIND MY ITEM (SMART MATCHER)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 text-xs font-black rounded-full border-2 border-black transition-all flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'bg-black text-white shadow-[3px_3px_0px_#000] -translate-y-0.5'
                  : 'bg-white text-black hover:bg-neutral-100 shadow-[1px_1px_0px_#000]'
              }`}
            >
              <Package className="w-4 h-4 text-brand-blue" />
              <span>PUBLIC DIRECTORY ({items.length})</span>
            </button>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 text-xs font-mono font-bold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full border border-black/30">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
            {activeTab === 'matcher'
              ? 'Multi-Signal Correlation Engine'
              : 'Direct Campus Intake Catalog'}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'matcher' ? (
        <SmartSearchEngine />
      ) : (
        /* Full Public Directory View */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full border-2 border-black bg-brand-lilac/50 text-[11px] font-black tracking-wider uppercase mb-2 shadow-[2px_2px_0px_#000]">
                Campus Master Catalog
              </span>
              <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-black">
                Browse Directory
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl font-medium">
                Explore registered lost belongings and securely turned-in property across all active campus custody stations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/report')}
              className="btn-tactile-primary text-xs self-start sm:self-auto"
            >
              + File New Item Report
            </button>
          </div>

          {/* Control Bar: Search Input & View Toggles */}
          <div className="bg-white border-[2.5px] border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Main Search Input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                  <SearchIcon className="w-4 h-4 text-black" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search keywords, brand, color, campus location, or tracking ID..."
                  className="input-tactile pl-10 pr-10 text-xs w-full bg-neutral-50/60 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* View Mode Toggle & Count */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded-lg border border-black/20 tabular-nums">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                </span>
                <div className="p-1 bg-neutral-100 border-2 border-black rounded-xl flex items-center gap-1 shadow-[2px_2px_0px_#000]">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-brand-yellow text-black border border-black shadow-[1px_1px_0px_#000]'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'table'
                        ? 'bg-brand-yellow text-black border border-black shadow-[1px_1px_0px_#000]'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Pills / Dropdowns */}
            <div className="pt-3 border-t-2 border-black/10 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('all')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-colors ${
                    selectedStatus === 'all'
                      ? 'bg-black text-white'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  All Items
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('lost')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-colors ${
                    selectedStatus === 'lost'
                      ? 'bg-brand-pink text-white border border-black'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Lost Only
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('found')}
                  className={`px-3 py-1 text-xs font-black rounded-lg transition-colors ${
                    selectedStatus === 'found'
                      ? 'bg-brand-purple text-white border border-black'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Found Only
                </button>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl border-2 border-black bg-white text-black shadow-[2px_2px_0px_#000] focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl border-2 border-black bg-white text-black shadow-[2px_2px_0px_#000] focus:outline-none cursor-pointer"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              {(searchQuery || selectedStatus !== 'all' || selectedCategory !== 'All Categories' || selectedLocation !== 'All Locations') && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-red-600 hover:text-black font-black ml-auto flex items-center gap-1 px-3 py-1 rounded-lg border-2 border-red-500 bg-red-50 shadow-[2px_2px_0px_#000]"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Results View */}
          {filteredItems.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onSelect={(it) => setSelectedItem(it)}
                    onClaim={(it) => setClaimingItem(it)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border-[2.5px] border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_#000]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-lilac/40 border-b-2 border-black text-black font-black uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4">Tracking ID</th>
                        <th className="py-3.5 px-4">Type</th>
                        <th className="py-3.5 px-4">Item Title</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Location</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black/10">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-brand-yellow/10 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-black">
                            {item.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge type={item.type} text={item.type === 'lost' ? 'Lost' : 'Found'} />
                          </td>
                          <td className="py-3.5 px-4 font-bold text-black">
                            {item.title}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-neutral-600">{item.category}</td>
                          <td className="py-3.5 px-4 text-neutral-600 truncate max-w-xs">{item.location}</td>
                          <td className="py-3.5 px-4 font-mono text-neutral-500 whitespace-nowrap">
                            {item.date}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="px-3 py-1 rounded-lg bg-white border-2 border-black hover:bg-brand-yellow text-xs font-black text-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white border-[2.5px] border-black rounded-3xl p-12 text-center space-y-4 shadow-[4px_4px_0px_#000]">
              <div className="w-14 h-14 rounded-2xl bg-brand-yellow border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto text-black">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-black text-black">NO MATCHING ITEMS FOUND</h3>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed font-medium">
                No items match your active search terms. Try adjusting your filters or launch our intelligent multi-signal matcher.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn-tactile-secondary text-xs"
                >
                  Clear All Filters
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('matcher')}
                  className="btn-tactile-primary text-xs"
                >
                  <Sparkles className="w-4 h-4 mr-1 text-brand-yellow" />
                  Launch Smart Matcher
                </button>
              </div>
            </div>
          )}

          {/* Directory Modals */}
          <ItemDetailModal
            item={selectedItem}
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            onClaim={(it) => {
              setSelectedItem(null);
              setClaimingItem(it);
            }}
          />

          <ClaimModal
            item={claimingItem}
            isOpen={!!claimingItem}
            onClose={() => setClaimingItem(null)}
            onSuccess={() => {
              setClaimingItem(null);
              navigate('/claims');
            }}
          />
        </div>
      )}
    </div>
  );
};
