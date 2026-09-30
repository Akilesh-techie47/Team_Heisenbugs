import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { CATEGORIES, LOCATIONS, ASSET_IMAGES } from '../../data/mockData';
import { SearchMethodSelector } from './SearchMethodSelector';
import { SearchAnimation } from './SearchAnimation';
import { MatchCard } from './MatchCard';
import { ItemDetails } from './ItemDetails';
import { ClaimModal } from '../verification/ClaimModal';
import { getItemImageUrl } from '../../utils/itemImage';
import {
  Upload,
  Camera,
  FileText,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  HelpCircle,
  Package,
} from 'lucide-react';

export const Search = () => {
  const { items } = useData();
  const navigate = useNavigate();

  // Primary state machine:
  // step: 'select_method' | 'input_form' | 'cinematic_analysis' | 'results'
  const [step, setStep] = useState('select_method');
  const [selectedMethod, setSelectedMethod] = useState('both'); // 'image' | 'details' | 'both'

  // Image input state
  const [userImage, setUserImage] = useState(ASSET_IMAGES.backpack);
  const [imagePreview, setImagePreview] = useState(ASSET_IMAGES.backpack);

  // Details form state
  const [formData, setFormData] = useState({
    title: 'Black Backpack',
    category: 'Bags & Backpacks',
    color: 'Black',
    brand: 'The North Face',
    location: 'Main Campus Library - 2nd Floor Study Commons',
    date: '2026-09-28',
    time: '14:30',
    description: 'Black commuter backpack with blue bottle and college notebook inside.',
    distinguishingFeatures: 'Small reflective tab and sticker on the side pocket.',
  });

  // Generated candidate matches after analysis
  const [candidateMatches, setCandidateMatches] = useState([]);
  const [inspectingMatch, setInspectingMatch] = useState(null);
  const [claimingItem, setClaimingItem] = useState(null);

  // Handle method card selection
  const handleSelectMethod = (methodId) => {
    setSelectedMethod(methodId);
    setStep('input_form');
  };

  // Image Upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserImage(url);
      setImagePreview(url);
    }
  };

  const handleSelectSampleImage = (imgKey) => {
    const imgUrl = ASSET_IMAGES[imgKey];
    setUserImage(imgUrl);
    setImagePreview(imgUrl);
  };

  // Submit search query -> Launch Cinematic Analysis
  const handleStartSearch = (e) => {
    if (e) e.preventDefault();
    setStep('cinematic_analysis');
  };

  // Callback when Cinematic Analysis finishes -> Lock and produce candidates
  const handleAnalysisComplete = () => {
    const foundCandidates = items.filter((it) => it.type === 'found' || it.status === 'potential_match');
    let primaryMatchItem = items.find((i) => i.id === 'LF-2026-009') || foundCandidates[0] || items[1];

    let matchResult;
    if (selectedMethod === 'image') {
      matchResult = {
        mode: 'image',
        imageScore: 91,
        finalScore: 91,
        reasons: [
          'Similar overall visual appearance',
          'Matching geometric shape & silhouette',
          'Consistent dark color pattern & texture',
          'Similar visible exterior pockets',
        ],
      };
    } else if (selectedMethod === 'details') {
      matchResult = {
        mode: 'details',
        informationScore: 94,
        categoryScore: 100,
        locationScore: 91,
        dateScore: 87,
        colorScore: 90,
        finalScore: 94,
        reasons: [
          'Same category: Bags & Backpacks (100%)',
          'Same primary color: Black (90%)',
          'Nearby location: Main Campus Library 2nd Floor (91%)',
          'Similar description: Contains course notes & flask',
          'Close reporting timeframe (within 90 minutes)',
        ],
      };
    } else {
      matchResult = {
        mode: 'both',
        imageScore: 88,
        informationScore: 94,
        categoryScore: 100,
        locationScore: 92,
        dateScore: 90,
        finalScore: 92,
        reasons: [
          'Similar visual appearance and silhouette (88%)',
          'High keyword correlation in description (94%)',
          'Exact category match: Bags & Backpacks',
          'Matched campus custody location: Library commons',
          'Close incident timestamp correlation',
        ],
      };
    }

    const primaryCandidate = {
      id: `CANDIDATE-01`,
      item: primaryMatchItem,
      matchResult,
      mode: selectedMethod,
    };

    const secondaryCandidateItem = items.find((i) => i.id === 'LF-2026-010') || items[3];
    const secondaryCandidate = {
      id: `CANDIDATE-02`,
      item: secondaryCandidateItem,
      matchResult: {
        ...matchResult,
        finalScore: Math.max(68, matchResult.finalScore - 14),
        imageScore: matchResult.imageScore ? matchResult.imageScore - 12 : undefined,
        informationScore: matchResult.informationScore ? matchResult.informationScore - 15 : undefined,
      },
      mode: selectedMethod,
    };

    setCandidateMatches([primaryCandidate, secondaryCandidate]);
    setStep('results');
  };

  const handleResetSearch = () => {
    setStep('select_method');
    setCandidateMatches([]);
    setInspectingMatch(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">
              Multi-Signal Recovery Engine
            </span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs font-semibold text-neutral-600">Find it. Verify it. Bring it home.</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-black uppercase">
            Find My Item
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl leading-relaxed font-medium">
            Search across campus recovered items using your photo, a written description, or combine both for higher confidence.
          </p>
        </div>

        {step !== 'select_method' && (
          <button
            type="button"
            onClick={handleResetSearch}
            className="btn-tactile btn-tactile-white text-xs px-4 py-2 shadow-[2px_2px_0px_#000] self-start sm:self-auto flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            Change Search Method
          </button>
        )}
      </div>

      {/* 2. Step: Search Method Selection Screen */}
      {step === 'select_method' && (
        <SearchMethodSelector
          selectedMethod={selectedMethod}
          onSelectMethod={handleSelectMethod}
        />
      )}

      {/* 3. Step: Input Forms based on Selected Method */}
      {step === 'input_form' && (
        <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_#000] space-y-8">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black/15">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-black bg-brand-yellow px-3 py-1 rounded-full border border-black shadow-[1.5px_1.5px_0px_#000]">
                Search Configuration
              </span>
              <span className="text-xs font-bold text-black font-body">
                {selectedMethod === 'image'
                  ? 'Method 1: Visual Image Comparison'
                  : selectedMethod === 'details'
                  ? 'Method 2: Description & Specifications (100% Photo-Free)'
                  : 'Method 3: Multi-Signal Visual + Details'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setStep('select_method')}
              className="text-xs font-bold text-brand-purple hover:underline"
            >
              Switch Method
            </button>
          </div>

          <form onSubmit={handleStartSearch} className="space-y-8">
            {/* Visual Input Section (Shown for 'image' and 'both') */}
            {(selectedMethod === 'image' || selectedMethod === 'both') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                    <Camera className="w-4 h-4 text-brand-purple stroke-[2.5]" />
                    Upload Your Item Image
                  </label>
                  <span className="text-[11px] font-mono text-neutral-500 font-semibold">
                    JPG, PNG, WEBP
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Upload Box */}
                  <div className="border-2 border-dashed border-black rounded-2xl p-6 text-center transition-colors bg-brand-lilac/20 hover:bg-brand-lilac/30">
                    <Upload className="w-8 h-8 text-neutral-600 mx-auto mb-2 stroke-[2.5]" />
                    <div className="text-xs text-black font-bold">
                      Drag & drop or{' '}
                      <label className="text-brand-purple hover:underline cursor-pointer">
                        choose image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-1">
                      Clear photos showing color, shape, and brands work best.
                    </p>

                    <div className="pt-4 mt-4 border-t border-black/15">
                      <span className="text-[11px] font-bold text-neutral-700 block mb-2 uppercase tracking-wide">
                        Or select sample item to test:
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {['backpack', 'earbuds', 'wallet', 'keys'].map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleSelectSampleImage(key)}
                            className="btn-tactile btn-tactile-white text-[11px] px-3 py-1 shadow-[2px_2px_0px_#000] capitalize"
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Large Preview */}
                  <div className="bg-neutral-50 border-2 border-black rounded-2xl p-5 text-center space-y-2 shadow-[3px_3px_0px_#000]">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                      Active Image Preview
                    </span>
                    <div className="aspect-4/3 max-w-[260px] mx-auto rounded-xl overflow-hidden bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Your uploaded item"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] text-brand-green bg-black font-bold px-3 py-1 rounded-full inline-flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Image loaded & ready for comparison
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Details Input Section (Shown for 'details' and 'both') */}
            {(selectedMethod === 'details' || selectedMethod === 'both') && (
              <div className="space-y-4 pt-4 border-t-2 border-black/15">
                <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-purple stroke-[2.5]" />
                  Item Description & Location Evidence
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-black mb-1">
                      Item Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Black Backpack"
                      className="input-tactile"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-tactile"
                    >
                      {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="e.g. Black"
                      className="input-tactile"
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      Brand / Manufacturer
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. The North Face"
                      className="input-tactile"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      Location Lost
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input-tactile"
                    >
                      {LOCATIONS.filter((l) => l !== 'All Locations').map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      Date Lost
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input-tactile"
                    />
                  </div>

                  {/* Approximate Time */}
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      Approximate Time
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="input-tactile"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-black mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Black backpack with blue bottle and college notebook inside..."
                      className="input-tactile leading-relaxed"
                    />
                  </div>

                  {/* Distinctive Features */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-black mb-1">
                      Distinctive Features
                    </label>
                    <input
                      type="text"
                      value={formData.distinguishingFeatures}
                      onChange={(e) =>
                        setFormData({ ...formData, distinguishingFeatures: e.target.value })
                      }
                      placeholder="e.g. Small sticker on side pocket, yellow keychain tab"
                      className="input-tactile"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-6 border-t-2 border-black/15 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-neutral-600 font-medium">
                Search triggers multi-signal candidate ranking without publishing public posts.
              </span>

              <button
                type="submit"
                className="btn-tactile btn-tactile-purple text-sm px-8 py-3.5 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] w-full sm:w-auto"
              >
                <span>
                  {selectedMethod === 'image'
                    ? 'Find Matching Items →'
                    : selectedMethod === 'details'
                    ? 'Search Using Details →'
                    : 'Analyze & Find Matches →'}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Step: Cinematic Analysis Component */}
      {step === 'cinematic_analysis' && (
        <SearchAnimation
          mode={selectedMethod}
          userImage={userImage}
          userDetails={formData}
          onComplete={handleAnalysisComplete}
        />
      )}

      {/* 5. Step: Candidate Results */}
      {step === 'results' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Results Header Banner */}
          <div className="bg-white border-[2.5px] border-black rounded-2xl p-6 sm:p-8 shadow-[5px_5px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green border border-black text-black text-xs font-bold mb-2 shadow-[1.5px_1.5px_0px_#000]">
                <CheckCircle2 className="w-4 h-4" />
                Potential Match Found
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-black tracking-tight uppercase">
                Candidate Results Ranked by Confidence
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
                We detected {candidateMatches.length} strong candidates in the campus custody catalog.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetSearch}
                className="btn-tactile btn-tactile-white text-xs px-4 py-2 shadow-[2px_2px_0px_#000]"
              >
                New Search
              </button>
            </div>
          </div>

          {/* Primary Locked Match Callout */}
          {candidateMatches[0] && (
            <div className="bg-brand-lilac/20 border-[3px] border-black rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#000] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b-2 border-black/15">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-brand-purple border border-black" />
                  <span className="text-xs font-bold uppercase tracking-wider text-black">
                    Strongest Candidate Match
                  </span>
                </div>

                <div className="font-display text-base font-normal text-black bg-brand-yellow px-3.5 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000]">
                  {candidateMatches[0].matchResult.finalScore}% Overall Match
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Your Reference */}
                <div className="md:col-span-5 bg-white rounded-2xl p-5 border-2 border-black text-center space-y-3 shadow-[3px_3px_0px_#000]">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    {selectedMethod === 'details' ? 'Your Search Query' : 'Your Image'}
                  </span>

                  {selectedMethod === 'details' ? (
                    <div className="p-4 bg-brand-lilac/20 rounded-xl border border-black text-left text-xs space-y-1">
                      <div className="font-bold text-black">{formData.title}</div>
                      <div className="text-neutral-700">Category: {formData.category} · {formData.color}</div>
                      <div className="text-neutral-500 italic">"{formData.description}"</div>
                      <div className="pt-2 text-[11px] text-brand-purple font-bold">Image: Not provided</div>
                    </div>
                  ) : (
                    <div className="aspect-4/3 max-w-[260px] mx-auto rounded-xl overflow-hidden bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                      <img src={userImage} alt="Your Item" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Center Connector */}
                <div className="md:col-span-2 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-brand-yellow text-black border-2 border-black flex items-center justify-center font-bold text-sm shadow-[2px_2px_0px_#000]">
                    ↔
                  </div>
                  <span className="text-[11px] font-bold text-black mt-2 uppercase tracking-wide">
                    {selectedMethod === 'image'
                      ? 'Visual Match'
                      : selectedMethod === 'details'
                      ? 'Information Match'
                      : 'Dual Match'}
                  </span>
                </div>

                {/* Right: Possible Match in Custody */}
                <div className="md:col-span-5 bg-brand-blue/30 rounded-2xl p-5 border-2 border-black text-center space-y-3 shadow-[3px_3px_0px_#000]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-black">
                      Possible Match
                    </span>
                    <span className="text-[11px] font-mono font-bold text-black bg-white px-2 py-0.5 rounded-full border border-black">
                      {candidateMatches[0].item.id}
                    </span>
                  </div>

                  <div className="aspect-4/3 max-w-[260px] mx-auto rounded-xl overflow-hidden bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                    {(() => {
                      const candidateImageUrl = getItemImageUrl(candidateMatches[0].item);
                      return candidateImageUrl ? (
                        <img
                          src={candidateImageUrl}
                          alt={candidateMatches[0].item.title || 'Lost item'}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(event) => {
                            console.error('Failed to load Cloudinary image:', candidateImageUrl);
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs font-bold text-neutral-500">No Photo Available</span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="text-left text-xs">
                    <div className="font-display text-base font-normal text-black truncate uppercase">
                      {candidateMatches[0].item.title}
                    </div>
                    <div className="text-neutral-700 truncate font-medium">
                      Near: {candidateMatches[0].item.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasons preview */}
              <div className="bg-white p-4 rounded-2xl border-2 border-black space-y-2 shadow-[2px_2px_0px_#000]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-black">
                  Why this candidate was selected
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {candidateMatches[0].matchResult.reasons?.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-black font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-purple shrink-0 stroke-[2.5]" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setInspectingMatch(candidateMatches[0])}
                  className="btn-tactile btn-tactile-white text-xs px-5 py-2.5 shadow-[2px_2px_0px_#000] w-full sm:w-auto"
                >
                  View Full Match Breakdown
                </button>

                <button
                  type="button"
                  onClick={() => setClaimingItem(candidateMatches[0].item)}
                  className="btn-tactile btn-tactile-purple text-xs px-6 py-2.5 shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000] w-full sm:w-auto"
                >
                  Claim This Item →
                </button>
              </div>
            </div>
          )}

          {/* Grid of Other Candidates */}
          {candidateMatches.length > 1 && (
            <div className="space-y-4 pt-4">
              <h3 className="font-display text-xl font-normal text-black uppercase tracking-tight">
                Alternative Candidates in Catalog
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidateMatches.map((cand) => (
                  <MatchCard
                    key={cand.id}
                    matchData={cand}
                    onViewDetails={(m) => setInspectingMatch(m)}
                    onClaim={(it) => setClaimingItem(it)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inspect Item Details Modal */}
      <ItemDetails
        matchData={inspectingMatch}
        userImage={userImage}
        userDetails={formData}
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

      {/* Claim Modal */}
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
