import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { MatchCard } from './MatchCard';
import { ItemDetails } from './ItemDetails';
import { ClaimModal } from '../verification/ClaimModal';
import { Sparkles, ArrowRight, ShieldCheck, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Matches = () => {
  const { matches, items } = useData();
  const navigate = useNavigate();

  const [inspectingMatch, setInspectingMatch] = useState(null);
  const [claimingItem, setClaimingItem] = useState(null);

  // Map data into format consumable by MatchCard and ItemDetails
  const formattedMatches = matches.map((m) => {
    const foundItem = items.find((i) => i.id === m.foundItemId) || items[1];
    const lostItem = items.find((i) => i.id === m.lostItemId) || items[0];

    return {
      id: m.id,
      item: foundItem,
      lostItem,
      mode: 'both',
      matchResult: {
        mode: 'both',
        finalScore: m.confidenceScore || 92,
        imageScore: 88,
        informationScore: 94,
        categoryScore: 100,
        locationScore: 92,
        dateScore: 90,
        reasons: m.matchedOn || [
          'Similar overall visual appearance',
          'Exact matching category',
          'Same campus building location',
          'Close reporting timeframe',
        ],
      },
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black/15">
        <div>
          <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">
            Automated Intake Correlations
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-normal text-black uppercase tracking-tight mt-0.5">
            Detected Campus Matches
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5 font-medium">
            Pairs identified by multi-signal visual and descriptive heuristic scoring.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/search')}
          className="btn-tactile btn-tactile-purple text-xs px-4 py-2 shadow-[2px_2px_0px_#000] self-start sm:self-auto"
        >
          Start New Search
        </button>
      </div>

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
        onNotMyItem={() => setInspectingMatch(null)}
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
