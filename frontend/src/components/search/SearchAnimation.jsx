import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Camera, CheckCircle2, ShieldCheck, Search } from 'lucide-react';
import { ASSET_IMAGES } from '../../data/mockData';

export const SearchAnimation = ({ mode, userImage, userDetails, onComplete }) => {
  // Steps sequences depending on mode
  const imageSteps = [
    'Searching recovered reports database',
    'Extracting visual contours & aspect ratio',
    'Comparing visual features with catalog',
    'Checking recovered physical items',
    'Ranking highest visual similarity matches',
  ];

  const detailsSteps = [
    'Reading item description & keywords',
    'Comparing category & item taxonomies',
    'Checking campus locations & proximity',
    'Checking incident dates & temporal coincidence',
    'Ranking possible matches & confidence scores',
  ];

  const bothSteps = [
    'Analyzing uploaded reference image',
    'Reading item description & distinctive tags',
    'Searching candidates in recovered inventory',
    'Comparing visual similarity & color profiles',
    'Cross-referencing category, location & timestamp',
    'Calculating final multi-signal match score',
  ];

  const currentSteps = mode === 'image' ? imageSteps : mode === 'details' ? detailsSteps : bothSteps;

  const [stepIndex, setStepIndex] = useState(0);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [searchedCount, setSearchedCount] = useState(112);

  // Pool of candidate images to cycle through
  const candidateImages = [
    { title: 'Black Backpack #24', img: ASSET_IMAGES.backpack, loc: 'Main Library 2nd Floor' },
    { title: 'Sony Earbuds Case', img: ASSET_IMAGES.earbuds, loc: 'Student Union' },
    { title: 'Leather Bifold Wallet', img: ASSET_IMAGES.wallet, loc: 'Engineering Rm 304' },
    { title: 'Silver Yale Keys Fob', img: ASSET_IMAGES.keys, loc: 'Central Courtyard' },
    { title: 'Matte Gray Daypack', img: ASSET_IMAGES.backpack, loc: 'Circulation Desk' },
  ];

  // Cycling candidate images for visual searches
  useEffect(() => {
    if (mode === 'details') return;

    const interval = setInterval(() => {
      setCandidateIndex((prev) => (prev + 1) % candidateImages.length);
      setSearchedCount((prev) => Math.min(428, prev + Math.floor(Math.random() * 38) + 15));
    }, 180);

    return () => clearInterval(interval);
  }, [mode]);

  // Stepping through text progress
  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < currentSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 700);

    // End after ~4 seconds
    const finishTimeout = setTimeout(() => {
      onComplete();
    }, 3900);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimeout);
    };
  }, [currentSteps.length, onComplete]);

  return (
    <div className="bg-brand-purple text-white border-[3px] border-black rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_#000] max-w-5xl mx-auto my-4 transition-all">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-black/30 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow text-black border-2 border-black flex items-center justify-center font-bold shadow-[2px_2px_0px_#000]">
            {mode === 'image' ? (
              <Camera className="w-6 h-6 animate-pulse" />
            ) : mode === 'details' ? (
              <FileText className="w-6 h-6 animate-pulse" />
            ) : (
              <Sparkles className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-yellow">
              {mode === 'image'
                ? 'Image Analysis Flow'
                : mode === 'details'
                ? 'Information Analysis Flow'
                : 'Dual Multi-Signal Analysis'}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-white uppercase tracking-tight">
              {mode === 'image'
                ? 'Comparing Visual Features'
                : mode === 'details'
                ? 'Analyzing Your Description'
                : 'Fusing Visual & Descriptive Evidence'}
            </h2>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-black bg-brand-yellow px-3.5 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#000]">
            {mode === 'details' ? 'Scanning 428 item records' : `Searching ${searchedCount} recovered reports`}
          </span>
        </div>
      </div>

      {/* Main Analysis Body */}
      <div className="py-8">
        {mode === 'details' ? (
          /* DETAILS-ONLY CINEMATIC ANIMATION */
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white text-black border-[2.5px] border-black rounded-2xl p-6 space-y-3 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider">
                  Submitted Parameters
                </span>
                <span className="text-xs font-bold text-brand-purple bg-brand-lilac/40 px-2 py-0.5 rounded-md border border-brand-purple/20">
                  Image not provided
                </span>
              </div>
              <h4 className="font-display text-xl font-normal text-black uppercase">
                {userDetails?.title || 'Black Backpack'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-neutral-600 pt-3 border-t border-black/10">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">Category:</span>
                  <strong className="font-bold text-black">{userDetails?.category || 'Bags'}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">Color:</span>
                  <strong className="font-bold text-black">{userDetails?.color || 'Black'}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">Location:</span>
                  <strong className="font-bold text-black truncate block">{userDetails?.location || 'Library'}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-bold">Date:</span>
                  <strong className="font-bold text-black">{userDetails?.date || 'Sept 28'}</strong>
                </div>
              </div>
            </div>

            {/* Stepper Pipeline */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-yellow">
                Information Processing Pipeline
              </div>
              <div className="space-y-2.5">
                {currentSteps.map((step, idx) => {
                  const isDone = idx < stepIndex;
                  const isCurrent = idx === stepIndex;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                        isCurrent
                          ? 'bg-brand-yellow text-black border-black font-bold translate-x-1 shadow-[3px_3px_0px_#000]'
                          : isDone
                          ? 'bg-white text-black border-black font-medium'
                          : 'bg-brand-purple-dark/60 text-white/50 border-white/20'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shrink-0 text-xs font-bold ${
                          isDone
                            ? 'bg-brand-green text-black'
                            : isCurrent
                            ? 'bg-black text-white'
                            : 'bg-neutral-300 text-neutral-600'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className="flex-1 text-xs">{step}</span>
                      {isCurrent && (
                        <span className="font-mono text-[10px] bg-black text-brand-yellow px-2 py-0.5 rounded font-bold animate-pulse">
                          PROCESSING
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* IMAGE / BOTH: Split View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* LEFT: User Item */}
            <div className="bg-white text-black border-[2.5px] border-black rounded-2xl p-6 text-center space-y-4 shadow-[5px_5px_0px_#000]">
              <div className="flex items-center justify-between pb-2 border-b border-black/10">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Your Reference Image
                </span>
                <span className="text-xs font-bold text-brand-purple bg-brand-lilac/40 px-2 py-0.5 rounded-full border border-black">
                  Query Seed
                </span>
              </div>

              <div className="relative aspect-square max-w-[260px] mx-auto rounded-2xl overflow-hidden bg-neutral-100 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center">
                <img
                  src={userImage || ASSET_IMAGES.backpack}
                  alt="Your Item"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-yellow/20 to-transparent pointer-events-none animate-pulse" />
              </div>

              {mode === 'both' && userDetails && (
                <div className="pt-2 text-left bg-brand-lilac/30 p-3 rounded-xl border border-black/20 text-[11px] space-y-1">
                  <div className="font-bold text-black truncate">{userDetails.title || 'Black Backpack'}</div>
                  <div className="text-neutral-700">Category: {userDetails.category || 'Bags'} · {userDetails.color || 'Black'}</div>
                  <div className="text-neutral-500 truncate">Location: {userDetails.location || 'Central Library'}</div>
                </div>
              )}
            </div>

            {/* RIGHT: Rapid Candidate Cycling */}
            <div className="bg-white text-black border-[2.5px] border-black rounded-2xl p-6 text-center space-y-4 shadow-[5px_5px_0px_#000]">
              <div className="flex items-center justify-between pb-2 border-b border-black/10">
                <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-brand-purple animate-spin" />
                  Live Candidate Intake Scanning
                </span>
                <span className="text-xs font-mono font-bold text-brand-purple bg-brand-lilac/50 px-2 py-0.5 rounded border border-black">
                  Index #{candidateIndex + 1}
                </span>
              </div>

              <div className="relative aspect-square max-w-[260px] mx-auto rounded-2xl overflow-hidden bg-neutral-100 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center">
                <img
                  src={candidateImages[candidateIndex].img}
                  alt="Candidate Scan"
                  className="w-full h-full object-cover transition-opacity duration-150"
                />
                <div className="absolute bottom-2 inset-x-2 bg-black/85 text-white p-2.5 rounded-xl text-left border border-white/20">
                  <div className="font-bold text-xs truncate text-brand-yellow">{candidateImages[candidateIndex].title}</div>
                  <div className="text-[10px] text-neutral-300 truncate">{candidateImages[candidateIndex].loc}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-black font-bold text-[11px]">
                    {currentSteps[stepIndex]}
                  </span>
                  <span className="text-black font-mono font-bold text-[11px]">
                    {Math.round(((stepIndex + 1) / currentSteps.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-3 rounded-full overflow-hidden border-2 border-black">
                  <div
                    className="bg-brand-yellow h-full transition-all duration-500 border-r-2 border-black"
                    style={{ width: `${((stepIndex + 1) / currentSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer message */}
      <div className="pt-4 border-t-2 border-black/30 flex flex-col sm:flex-row items-center justify-between text-xs text-white/80 gap-2">
        <span>Simulating multi-signal neural ranking across campus lost & found intake points</span>
        <span className="font-mono text-brand-yellow font-bold uppercase tracking-wider">
          Phase: Heuristic Match Scoring
        </span>
      </div>
    </div>
  );
};
