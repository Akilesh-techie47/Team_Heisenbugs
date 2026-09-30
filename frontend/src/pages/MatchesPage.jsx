import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { StatusBadge } from '../components/common/Badge';
import { ClaimModal } from '../components/verification/ClaimModal';
import { ItemDetailModal } from '../components/verification/ItemDetailModal';
import { MatchCard } from '../components/search/MatchCard';
import { ItemDetails } from '../components/search/ItemDetails';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  XCircle,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  Sliders,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MatchesPage = () => {
  const { matches, items, dismissMatch } = useData();
  const navigate = useNavigate();

  const [inspectingMatch, setInspectingMatch] = useState(null);
  const [claimingItem, setClaimingItem] = useState(null);
  const [viewStyle, setViewStyle] = useState('cards'); // 'cards' | 'sidebyside'

  // Map raw matches to backend-ready structure
  const formattedMatches = matches.map((match) => {
    const lostItem = items.find((it) => it.id === match.lostItemId) || items[0];
    const foundItem = items.find((it) => it.id === match.foundItemId) || items[1];

    return {
      id: match.id,
      item: foundItem,
      lostItem,
      mode: 'both',
      matchResult: {
        mode: 'both',
        finalScore: match.confidenceScore || 94,
        imageScore: match.confidenceScore ? Math.max(75, match.confidenceScore - 6) : 88,
        informationScore: match.confidenceScore ? Math.min(98, match.confidenceScore + 2) : 94,
        categoryScore: 100,
        locationScore: 92,
        dateScore: 90,
        reasons: match.matchedOn || [
          'Similar overall visual appearance',
          'Exact matching category',
          'Same campus building location',
          'Close reporting timeframe',
        ],
      },
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-0.5 rounded-full border-2 border-black bg-brand-yellow text-[11px] font-black tracking-wider uppercase shadow-[2px_2px_0px_#000]">
              AI Detection Engine
            </span>
            <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-black/30">
              {matches.length} Candidate Pairs
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-black">
            Smart Match Suggestions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl font-medium leading-relaxed">
            Multi-signal correlation between reported lost property and turned-in belongings based on visual appearance, location, and description.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="btn-tactile-primary text-xs flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Find Another Item
          </button>
        </div>
      </div>

      {/* Grid of Matches */}
      {formattedMatches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedMatches.map((cand) => (
            <MatchCard
              key={cand.id}
              matchData={cand}
              onViewDetails={(m) => setInspectingMatch(m)}
              onClaim={(it) => setClaimingItem(it)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border-[2.5px] border-black rounded-3xl p-12 text-center space-y-4 shadow-[4px_4px_0px_#000]">
          <div className="w-14 h-14 rounded-2xl bg-brand-yellow border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto text-black">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-display font-black text-black">NO ACTIVE MATCH SUGGESTIONS</h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed font-medium">
            As new lost reports and turned-in items arrive in the campus directory, automated match correlations will appear here in real time.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="btn-tactile-primary text-xs"
            >
              Search Catalog with Multi-Signal Matcher
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ItemDetails
        matchData={inspectingMatch}
        userImage={inspectingMatch?.lostItem?.image}
        userDetails={inspectingMatch?.lostItem}
        isOpen={!!inspectingMatch}
        onClose={() => setInspectingMatch(null)}
        onClaim={(it) => {
          setInspectingMatch(null);
          setClaimingItem(it);
        }}
        onNotMyItem={() => {
          setInspectingMatch(null);
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
