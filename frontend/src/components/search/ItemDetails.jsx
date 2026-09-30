import React from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { ASSET_IMAGES } from '../../data/mockData';
import { getItemImageUrl } from '../../utils/itemImage';

export const ItemDetails = ({ matchData, userImage, userDetails, isOpen, onClose, onClaim, onNotMyItem }) => {
  if (!isOpen || !matchData) return null;

  const { item, matchResult, mode } = matchData;
  const score = matchResult?.finalScore || 90;
  const imageUrl = getItemImageUrl(item);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-[8px_8px_0px_#000] border-[3px] border-black overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-brand-lilac/30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-black bg-brand-yellow px-3 py-1 rounded-full border border-black shadow-[1.5px_1.5px_0px_#000]">
              Potential Match Found
            </span>
            <span className="text-xs font-mono font-bold text-neutral-700">
              ID: {item.id}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-brand-pink hover:text-white shadow-[2px_2px_0px_#000] transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          {/* 1. Comparison Header / Score Display */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/30 border-2 border-black text-black text-xs font-bold uppercase shadow-[2px_2px_0px_#000]">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              Potential Match Confirmed
            </div>

            <h2 className="font-display text-4xl sm:text-5xl font-normal text-black tracking-tight uppercase">
              {score}% MATCH CONFIDENCE
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto font-medium">
              Our multi-signal correlation engine identified high likelihood between your query and recovered custody records.
            </p>
          </div>

          {/* 2. Side-by-Side Visual Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Your Item / Description */}
            <div className="bg-brand-lilac/20 border-2 border-black rounded-2xl p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                {mode === 'details' ? 'Your Search Query' : 'Your Item Reference'}
              </span>

              {mode === 'details' ? (
                <div className="py-6 px-4 bg-white rounded-xl border-2 border-black text-left space-y-2 shadow-[2px_2px_0px_#000]">
                  <div className="font-display text-base text-black uppercase">{userDetails?.title || 'Black Backpack'}</div>
                  <p className="text-xs text-neutral-600 leading-relaxed italic">
                    "{userDetails?.description || 'Black backpack with blue bottle and college notebook inside.'}"
                  </p>
                  <div className="pt-2 text-[11px] text-neutral-600 flex justify-between border-t border-black/10 font-bold">
                    <span>Category: {userDetails?.category || 'Bags'}</span>
                    <span>Color: {userDetails?.color || 'Black'}</span>
                  </div>
                  <div className="text-[11px] text-brand-purple font-bold">
                    Image: Not provided
                  </div>
                </div>
              ) : (
                <div className="aspect-4/3 max-w-[280px] mx-auto rounded-xl overflow-hidden bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
                  <img
                    src={userImage || ASSET_IMAGES.backpack}
                    alt="Your Item"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Right: Possible Match in Custody */}
            <div className="bg-brand-blue/30 border-2 border-black rounded-2xl p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-black">
                  Possible Match in Custody
                </span>
                <span className="text-[11px] font-mono font-bold text-neutral-700 bg-white px-2 py-0.5 rounded-full border border-black">
                  {item.id}
                </span>
              </div>

              <div className="aspect-4/3 max-w-[280px] mx-auto rounded-xl overflow-hidden bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
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
              </div>

              <div className="text-left text-xs space-y-1">
                <div className="font-display text-base font-normal text-black uppercase">{item.title}</div>
                <div className="text-neutral-700 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-brand-purple stroke-[2.5]" />
                  <span>Found near: {item.location}</span>
                </div>
                <div className="text-neutral-600 font-mono text-[11px] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.date} {item.time && `· ${item.time}`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Dynamic Score Breakdown by Mode */}
          <div className="bg-neutral-50 border-2 border-black rounded-2xl p-6 space-y-4 shadow-[3px_3px_0px_#000]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">
              Signal Analysis Breakdown
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {/* Visual Match */}
              {mode !== 'details' && matchResult.imageScore && (
                <div className="bg-white p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                  <span className="text-neutral-600 text-[11px] font-bold block uppercase">Visual Similarity</span>
                  <div className="font-display text-2xl font-normal text-brand-purple mt-1">
                    {matchResult.imageScore}%
                  </div>
                </div>
              )}

              {/* Information Match */}
              {mode !== 'image' && matchResult.informationScore && (
                <div className="bg-white p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                  <span className="text-neutral-600 text-[11px] font-bold block uppercase">Info Correlation</span>
                  <div className="font-display text-2xl font-normal text-black mt-1">
                    {matchResult.informationScore}%
                  </div>
                </div>
              )}

              {matchResult.categoryScore && (
                <div className="bg-white p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                  <span className="text-neutral-600 text-[11px] font-bold block uppercase">Category Taxonomy</span>
                  <div className="font-display text-2xl font-normal text-black mt-1">
                    {matchResult.categoryScore}%
                  </div>
                </div>
              )}

              {matchResult.locationScore && (
                <div className="bg-white p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                  <span className="text-neutral-600 text-[11px] font-bold block uppercase">Location Proximity</span>
                  <div className="font-display text-2xl font-normal text-black mt-1">
                    {matchResult.locationScore}%
                  </div>
                </div>
              )}

              {matchResult.dateScore && (
                <div className="bg-white p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                  <span className="text-neutral-600 text-[11px] font-bold block uppercase">Temporal Proximity</span>
                  <div className="font-display text-2xl font-normal text-black mt-1">
                    {matchResult.dateScore}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Match Explanation Reasons */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black">
              Why this candidate was selected
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {matchResult.reasons?.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white border-2 border-black text-black font-medium shadow-[2px_2px_0px_#000]"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand-purple shrink-0 stroke-[2.5]" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Privacy Notice */}
          <div className="p-4 bg-brand-yellow/30 border-2 border-black rounded-xl text-xs text-black flex items-start gap-3 shadow-[2px_2px_0px_#000]">
            <ShieldCheck className="w-5 h-5 text-black shrink-0 mt-0.5 stroke-[2.5]" />
            <div className="leading-relaxed font-body">
              <strong className="font-bold block mb-0.5 text-black">Private Ownership Protection:</strong>
              Internal pocket contents, private serial numbers, and confidential verification answers are withheld from public view. You will verify ownership in the next claim step.
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 sm:px-8 py-5 bg-neutral-50 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onNotMyItem}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-neutral-600 hover:text-red-600 transition-colors"
          >
            Not my item
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile btn-tactile-white text-xs px-5 py-2 shadow-[2px_2px_0px_#000]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onClaim(item);
              }}
              className="btn-tactile btn-tactile-purple text-xs px-6 py-2 shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000]"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              View Item & Claim →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
