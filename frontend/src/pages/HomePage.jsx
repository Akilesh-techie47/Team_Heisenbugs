import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';
import { ItemCard } from '../components/common/ItemCard';
import { ItemDetailModal } from '../components/verification/ItemDetailModal';
import { ClaimModal } from '../components/verification/ClaimModal';
import {
  FilePlus,
  Search,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Package,
} from 'lucide-react';

export const HomePage = () => {
  const { currentUser, role } = useAuth();
  const { items, matches, claims } = useData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('recent'); // 'recent' | 'my_reports'
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimingItem, setClaimingItem] = useState(null);

  // Derived metrics
  const myReports = items.filter(
    (item) => item.contactEmail === currentUser?.email || item.contactName === currentUser?.name
  );
  const myActiveClaims = claims.filter(
    (c) => c.claimantEmail === currentUser?.email && c.status !== 'Completed'
  );
  const relevantMatches = matches.length;

  const displayedItems = activeTab === 'my_reports' ? myReports : items.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Quick Actions */}
      <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_#000] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">
              {currentUser?.roleLabel || 'Campus Recovery Dashboard'}
            </span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs text-neutral-600 font-semibold">{currentUser?.department}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-black uppercase">
            Welcome back, {currentUser?.name || 'Member'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium">
            Track your missing property, inspect potential matches, or coordinate handovers.
          </p>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Link
            to="/report"
            className="btn-tactile btn-tactile-purple text-xs px-5 py-2.5 shadow-[3px_3px_0px_#000] flex-1 sm:flex-none"
          >
            <FilePlus className="w-4 h-4 stroke-[2.5]" />
            Report Lost or Found
          </Link>
          <Link
            to="/search"
            className="btn-tactile btn-tactile-white text-xs px-5 py-2.5 shadow-[3px_3px_0px_#000] flex-1 sm:flex-none"
          >
            <Search className="w-4 h-4 text-black stroke-[2.5]" />
            Search Directory
          </Link>
        </div>
      </div>

      {/* 2. Urgent Match or Attention Banner */}
      {relevantMatches > 0 && (
        <div className="bg-brand-yellow border-[2.5px] border-black rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-black text-brand-yellow flex items-center justify-center shrink-0 mt-0.5 border border-black shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display text-lg sm:text-xl font-normal text-black uppercase tracking-tight">
                Smart Match Suggestions Available ({relevantMatches})
              </h3>
              <p className="text-xs text-neutral-800 mt-0.5 font-medium leading-relaxed">
                Our matching engine identified high-probability matches for reported backpacks and electronics in the Library Commons.
              </p>
            </div>
          </div>
          <Link
            to="/matches"
            className="btn-tactile btn-tactile-black text-xs px-5 py-2.5 shadow-[2px_2px_0px_#000] whitespace-nowrap self-end sm:self-center"
          >
            Review Matches
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      )}

      {/* 3. Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My Active Reports"
          value={myReports.length}
          subtext="Lost & Found submissions"
          icon={Package}
        />
        <StatCard
          label="Match Candidates"
          value={matches.length}
          subtext="High confidence scores"
          icon={Sparkles}
          trend="+2 today"
        />
        <StatCard
          label="Claims in Progress"
          value={myActiveClaims.length}
          subtext="Under staff review"
          icon={ShieldCheck}
        />
        <StatCard
          label="Campus Recovery Rate"
          value="98.4%"
          subtext="Verified custody return"
          icon={CheckCircle2}
        />
      </div>

      {/* 4. Tab Navigation & Content Feed */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black/15 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all border-2 border-black ${
                activeTab === 'recent'
                  ? 'bg-black text-white shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-neutral-700 hover:bg-brand-lilac/30'
              }`}
            >
              Recent Campus Activity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('my_reports')}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all border-2 border-black ${
                activeTab === 'my_reports'
                  ? 'bg-black text-white shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-neutral-700 hover:bg-brand-lilac/30'
              }`}
            >
              My Reported Items ({myReports.length})
            </button>
          </div>

          <Link
            to="/search"
            className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1 self-start sm:self-center"
          >
            Explore all items in directory
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Items Grid */}
        {displayedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onSelect={(it) => setSelectedItem(it)}
                onClaim={(it) => setClaimingItem(it)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border-[2.5px] border-black rounded-3xl p-12 text-center space-y-3 shadow-[4px_4px_0px_#000]">
            <div className="w-14 h-14 rounded-2xl bg-brand-lilac/30 border-2 border-black flex items-center justify-center mx-auto text-black shadow-[2px_2px_0px_#000]">
              <Package className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h3 className="font-display text-xl font-normal text-black uppercase">No reports found</h3>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto font-medium">
              You haven't filed any reports under this account yet. Click below to register your missing belongings.
            </p>
            <div className="pt-2">
              <Link
                to="/report"
                className="btn-tactile btn-tactile-purple text-xs px-5 py-2.5 shadow-[2px_2px_0px_#000]"
              >
                <FilePlus className="w-4 h-4 stroke-[2.5]" />
                File First Report
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
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
  );
};
