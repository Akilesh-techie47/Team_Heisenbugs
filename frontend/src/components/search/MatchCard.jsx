import React from 'react';
import { StatusBadge } from '../common/Badge';
import { MapPin, Calendar, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getItemImageUrl } from '../../utils/itemImage';

export const MatchCard = ({ matchData, onViewDetails, onClaim }) => {
  const { item, matchResult, mode } = matchData;
  const score = matchResult?.finalScore || 90;
  const imageUrl = getItemImageUrl(item);

  return (
    <div className="bg-white border-[2.5px] border-black hover:border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_#000] hover:shadow-[6px_8px_0px_#000] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Image Banner */}
        <div className="relative aspect-4/3 w-full bg-brand-lilac/30 overflow-hidden border-b-2 border-black">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title || 'Lost item'}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(event) => {
                console.error('Failed to load Cloudinary image:', imageUrl);
                event.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs font-bold text-neutral-500">No Photo Available</span>
            </div>
          )}

          <div className="absolute top-3 left-3 z-10">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              FOUND ITEM
            </span>
          </div>

          {/* Match Score Badge on Image */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-brand-yellow text-black px-2.5 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="font-display text-base font-normal tracking-tight">
              {score}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Match
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-neutral-600 font-semibold">
            <span className="bg-brand-lilac/40 text-black px-2 py-0.5 rounded-full border border-black/30 text-[11px]">
              {item.category}
            </span>
            <span>·</span>
            <span className="font-mono text-[11px] text-neutral-700">{item.color}</span>
          </div>

          <h3 className="font-display text-lg font-normal text-black line-clamp-1 tracking-tight">
            {item.title}
          </h3>

          <div className="space-y-1 text-xs text-neutral-700 font-medium">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-purple shrink-0 mt-0.5 stroke-[2.5]" />
              <span className="line-clamp-1">Found near: {item.location}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-600">
              <Calendar className="w-3.5 h-3.5" />
              <span>Found: {item.date} {item.time && `· ${item.time}`}</span>
            </div>
          </div>

          {/* Score Pills preview */}
          <div className="pt-2 border-t border-black/10 flex flex-wrap gap-2 text-[11px]">
            {mode === 'image' && (
              <span className="bg-brand-blue border border-black text-black px-2 py-0.5 rounded-full font-bold">
                Visual Match: {matchResult.imageScore}%
              </span>
            )}
            {mode === 'details' && (
              <span className="bg-brand-green/30 border border-black text-black px-2 py-0.5 rounded-full font-bold">
                Info Match: {matchResult.informationScore}%
              </span>
            )}
            {mode === 'both' && (
              <>
                <span className="bg-brand-blue border border-black text-black px-2 py-0.5 rounded-full font-bold text-[10px]">
                  Visual: {matchResult.imageScore}%
                </span>
                <span className="bg-brand-green/30 border border-black text-black px-2 py-0.5 rounded-full font-bold text-[10px]">
                  Info: {matchResult.informationScore}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-5 pt-0 border-t border-black/10 flex items-center justify-between gap-2 mt-2">
        <button
          type="button"
          onClick={() => onViewDetails(matchData)}
          className="text-xs font-bold text-black hover:text-brand-purple flex items-center gap-1 transition-colors py-1.5 group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => onClaim(item)}
          className="btn-tactile btn-tactile-purple text-xs px-3.5 py-1.5 shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000]"
        >
          Claim This Item
        </button>
      </div>
    </div>
  );
};
