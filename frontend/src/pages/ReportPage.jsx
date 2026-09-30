import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CATEGORIES, LOCATIONS, ASSET_IMAGES } from '../data/mockData';
import { ai } from '../services/api';
import {
  FilePlus,
  Upload,
  MapPin,
  Calendar,
  Clock,
  Shield,
  HelpCircle,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const ReportPage = () => {
  const { currentUser } = useAuth();
  const { createItem } = useData();
  const navigate = useNavigate();

  const [reportType, setReportType] = useState('lost'); // 'lost' | 'found'
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics & Gadgets',
    brand: '',
    color: '',
    description: '',
    distinguishingFeatures: '',
    date: new Date().toISOString().slice(0, 10),
    time: '14:00',
    location: LOCATIONS[1],
    building: 'Science & Engineering Hall',
    securityQuestion: '',
    securityAnswer: '',
    privateVerificationInfo: '',
    dropOffLocation: 'Main Campus Library - Circulation Desk',
    rewardOffered: '',
    contactName: currentUser?.name || 'Alex Rivera',
    contactEmail: currentUser?.email || 'alex.rivera@campus.edu',
    contactPhone: currentUser?.phone || '+1 (555) 234-8901',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdItemResult, setCreatedItemResult] = useState(null);

  // AI image-analysis state (LostFound+ Gemini engine via backend)
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Fill only empty fields — never overwrite user-entered values
  const autofillFromAnalysis = (analysis) => {
    setFormData((prev) => {
      const next = { ...prev };
      const isEmpty = (v) => !v || !String(v).trim();
      const clean = (v) => (v && v !== 'Unknown' ? v : '');
      if (isEmpty(next.title) && clean(analysis.object)) {
        next.title = analysis.object.charAt(0).toUpperCase() + analysis.object.slice(1);
      }
      if (clean(analysis.category) && CATEGORIES.includes(analysis.category)) {
        // Only apply category if user hasn't changed it from the default
        if (next.category === 'Electronics & Gadgets') next.category = analysis.category;
      }
      if (isEmpty(next.brand) && clean(analysis.brand)) next.brand = analysis.brand;
      if (isEmpty(next.color) && clean(analysis.color)) next.color = analysis.color;
      if (isEmpty(next.description) && clean(analysis.description)) next.description = analysis.description;
      if (isEmpty(next.distinguishingFeatures) && Array.isArray(analysis.distinctiveFeatures) && analysis.distinctiveFeatures.length > 0) {
        next.distinguishingFeatures = analysis.distinctiveFeatures.join('; ');
      }
      return next;
    });
  };

  const runAiAnalysis = async (dataUrl, mimeType) => {
    setAiLoading(true);
    setAiError('');
    setAiAnalysis(null);
    try {
      const result = await ai.analyzeImage(dataUrl, mimeType || 'image/jpeg');
      if (result?.success && result?.analysis) {
        setAiAnalysis(result.analysis);
        autofillFromAnalysis(result.analysis);
      } else {
        setAiError(result?.message || 'AI image analysis failed.');
      }
    } catch (err) {
      setAiError(err.response?.data?.message || err.message || 'AI image analysis failed.');
    } finally {
      setAiLoading(false);
    }
  };

  // Image upload: FileReader -> Base64 data URL -> preview + AI analysis
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setImagePreview(dataUrl);
      setFormData((prev) => ({ ...prev, image: dataUrl }));
      runAiAnalysis(dataUrl, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSampleImage = (imgKey) => {
    const imgUrl = ASSET_IMAGES[imgKey];
    setImagePreview(imgUrl);
    setFormData({ ...formData, image: imgUrl });
    setAiAnalysis(null);
    setAiError('');
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.description.trim()) errs.description = 'Please describe the item';
    if (!formData.color.trim()) errs.color = 'Primary color is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.date) errs.date = 'Date is required';
    if (!formData.location) errs.location = 'Location is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateStep1() || !validateStep2()) return;

    try {
      setIsSubmitting(true);
      const res = await createItem({
        ...formData,
        type: reportType,
      });
      setCreatedItemResult(res);
    } catch (err) {
      setSubmitError('Error creating report: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title & Introduction */}
      <div className="mb-8 text-center sm:text-left">
        <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">
          Official Campus Intake Protocol
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-black mt-1 uppercase">
          Report an Item
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl font-medium">
          Provide accurate details to assist our verification team and automated smart matching engine.
        </p>
      </div>

      {/* Segmented Mode Selector: Lost vs Found */}
      <div className="p-2 bg-white border-[2.5px] border-black rounded-2xl grid grid-cols-2 gap-2 shadow-[4px_4px_0px_#000] mb-8">
        <button
          type="button"
          onClick={() => setReportType('lost')}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-2 transition-all ${
            reportType === 'lost'
              ? 'bg-black text-white border-black shadow-[2px_2px_0px_#000]'
              : 'border-transparent text-neutral-700 hover:bg-brand-lilac/30'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4B4B] border border-black" />
          I Lost an Item
        </button>

        <button
          type="button"
          onClick={() => setReportType('found')}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-2 transition-all ${
            reportType === 'found'
              ? 'bg-brand-purple text-white border-black shadow-[2px_2px_0px_#000]'
              : 'border-transparent text-neutral-700 hover:bg-brand-lilac/30'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow border border-black" />
          I Found an Item
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white border-[2.5px] border-black rounded-3xl shadow-[6px_6px_0px_#000] overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-8 space-y-8">
            {submitError && (
              <div className="p-4 rounded-xl bg-red-100 border-2 border-black text-xs font-bold text-red-700 flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span>{submitError}</span>
              </div>
            )}

            {/* SECTION 1: Item Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b-2 border-black/15">
                <div className="w-7 h-7 rounded-lg bg-brand-yellow border-2 border-black text-black flex items-center justify-center font-display text-sm font-bold shadow-[1.5px_1.5px_0px_#000]">
                  1
                </div>
                <h3 className="font-display text-lg font-normal text-black uppercase tracking-tight">
                  Item Identification & Specifications
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-black uppercase">
                      Item Title / Name <span className="text-red-600">*</span>
                    </label>
                    {errors.title && (
                      <span className="text-[11px] font-bold text-red-600">{errors.title}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Navy Blue HydroFlask, ThinkPad X1 Carbon, Leather Bellroy Wallet"
                    className="input-tactile"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-tactile"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand / Model */}
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Brand / Manufacturer / Model
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Apple, Sony, Herschel, Nike"
                    className="input-tactile"
                  />
                </div>

                {/* Color */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-black uppercase">
                      Color(s) <span className="text-red-600">*</span>
                    </label>
                    {errors.color && (
                      <span className="text-[11px] font-bold text-red-600">{errors.color}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. Matte Black with red accents"
                    className="input-tactile"
                  />
                </div>

                {/* Reward (for lost items) */}
                {reportType === 'lost' ? (
                  <div>
                    <label className="block text-xs font-bold text-black mb-1 uppercase">
                      Optional Finder Reward
                    </label>
                    <input
                      type="text"
                      value={formData.rewardOffered}
                      onChange={(e) => setFormData({ ...formData, rewardOffered: e.target.value })}
                      placeholder="e.g. $20 Cash / Free Coffee"
                      className="input-tactile"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-black mb-1 uppercase">
                      Turned-In Custody Location
                    </label>
                    <select
                      value={formData.dropOffLocation}
                      onChange={(e) => setFormData({ ...formData, dropOffLocation: e.target.value })}
                      className="input-tactile"
                    >
                      <option value="Main Campus Library - Circulation Desk">Main Campus Library - Circulation Desk</option>
                      <option value="Campus Security Lost & Found Office (Bldg 4)">Campus Security Lost & Found Office</option>
                      <option value="Student Union Building - Info Desk">Student Union Info Desk</option>
                      <option value="Held by Finder (Awaiting Owner Claim)">Held by Finder (Awaiting Claim)</option>
                    </select>
                  </div>
                )}

                {/* Description */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-black uppercase">
                      Detailed Description <span className="text-red-600">*</span>
                    </label>
                    {errors.description && (
                      <span className="text-[11px] font-bold text-red-600">
                        {errors.description}
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe where it was kept, visible wear or stickers, surrounding accessories..."
                    className="input-tactile leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Incident Location & Timing */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b-2 border-black/15">
                <div className="w-7 h-7 rounded-lg bg-brand-yellow border-2 border-black text-black flex items-center justify-center font-display text-sm font-bold shadow-[1.5px_1.5px_0px_#000]">
                  2
                </div>
                <h3 className="font-display text-lg font-normal text-black uppercase tracking-tight">
                  Location & Timestamp
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Campus Location / Landmark <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-tactile"
                  >
                    {LOCATIONS.filter((l) => l !== 'All Locations').map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Date {reportType === 'lost' ? 'Lost' : 'Found'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-tactile"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Approximate Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-tactile"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Photos & Verification Proof */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b-2 border-black/15">
                <div className="w-7 h-7 rounded-lg bg-brand-yellow border-2 border-black text-black flex items-center justify-center font-display text-sm font-bold shadow-[1.5px_1.5px_0px_#000]">
                  3
                </div>
                <h3 className="font-display text-lg font-normal text-black uppercase tracking-tight">
                  Photo & Ownership Verification Question
                </h3>
              </div>

              {/* Photo Upload area */}
              <div>
                <label className="block text-xs font-bold text-black mb-1 uppercase">
                  Upload Photo (Optional, or select demo asset)
                </label>
                <div className="border-2 border-dashed border-black rounded-2xl p-5 text-center transition-colors bg-brand-lilac/15">
                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-32 h-32 rounded-xl overflow-hidden bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, image: null });
                          setAiAnalysis(null);
                          setAiError('');
                        }}
                        className="text-xs text-red-600 hover:underline font-bold"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-neutral-600 mx-auto stroke-[2.5]" />
                      <div className="text-xs text-black font-semibold">
                        <label className="font-bold text-brand-purple hover:underline cursor-pointer">
                          Click to upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>{' '}
                        or choose a sample asset below
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
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
                  )}
                </div>
              </div>

              {/* AI Analysis status / results (Gemini via backend) */}
              {(aiLoading || aiError || aiAnalysis) && (
                <div className="p-4 bg-white rounded-2xl border-2 border-black space-y-2 shadow-[3px_3px_0px_#000]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase">
                    <Sparkles className="w-4 h-4 text-brand-purple stroke-[2.5]" />
                    AI Image Analysis
                  </div>
                  {aiLoading && (
                    <p className="text-[11px] text-neutral-700 font-medium">
                      Analyzing image with LostFound+ AI… empty fields will be filled automatically.
                    </p>
                  )}
                  {aiError && (
                    <p className="text-[11px] font-bold text-red-600">
                      AI analysis unavailable: {aiError}
                    </p>
                  )}
                  {aiAnalysis && !aiLoading && (
                    <div className="text-[11px] text-neutral-800 space-y-1 font-medium">
                      <p><span className="font-bold">Object:</span> {aiAnalysis.object || 'Unknown'}</p>
                      <p><span className="font-bold">Category:</span> {aiAnalysis.category || 'Unknown'}</p>
                      <p><span className="font-bold">Color:</span> {aiAnalysis.color || 'Unknown'}</p>
                      {aiAnalysis.brand && aiAnalysis.brand !== 'Unknown' && (
                        <p><span className="font-bold">Brand:</span> {aiAnalysis.brand}</p>
                      )}
                      {aiAnalysis.description && (
                        <p><span className="font-bold">Description:</span> {aiAnalysis.description}</p>
                      )}
                      {Array.isArray(aiAnalysis.distinctiveFeatures) && aiAnalysis.distinctiveFeatures.length > 0 && (
                        <p><span className="font-bold">Distinctive features:</span> {aiAnalysis.distinctiveFeatures.join('; ')}</p>
                      )}
                      <p className="text-neutral-500">Empty report fields were auto-filled. Your entries were never overwritten.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Security Verification Question */}
              <div className="p-4 bg-brand-lilac/25 rounded-2xl border-2 border-black space-y-3 shadow-[3px_3px_0px_#000]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase">
                  <Shield className="w-4 h-4 text-brand-purple stroke-[2.5]" />
                  Confidential Verification Question
                </div>
                <p className="text-[11px] text-neutral-700 leading-relaxed font-body">
                  Only the genuine claimant will know this answer. Used by verification officers to prevent fraudulent claims.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      Verification Question
                    </label>
                    <input
                      type="text"
                      value={formData.securityQuestion}
                      onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
                      placeholder="e.g. What color is the inner notebook cover?"
                      className="input-tactile bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">
                      Expected Answer (Hidden from public)
                    </label>
                    <input
                      type="text"
                      value={formData.securityAnswer}
                      onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
                      placeholder="e.g. Navy blue with physics formulas"
                      className="input-tactile bg-white"
                    />
                  </div>
                </div>

                {reportType === 'found' && (
                  <div className="pt-2 border-t border-black/15">
                    <label className="block text-xs font-bold text-black mb-1">
                      Private Verification Information (Confidential to Finder & Administrator)
                    </label>
                    <input
                      type="text"
                      value={formData.privateVerificationInfo}
                      onChange={(e) => setFormData({ ...formData, privateVerificationInfo: e.target.value })}
                      placeholder="e.g. Serial digits, internal monogram, specific scratch or hidden accessory..."
                      className="input-tactile bg-white"
                    />
                    <p className="mt-1 text-[11px] text-neutral-600">
                      This private proof is never shown in public search listings. Only Administrators see this when verifying claims.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b-2 border-black/15">
                <div className="w-7 h-7 rounded-lg bg-brand-yellow border-2 border-black text-black flex items-center justify-center font-display text-sm font-bold shadow-[1.5px_1.5px_0px_#000]">
                  4
                </div>
                <h3 className="font-display text-lg font-normal text-black uppercase tracking-tight">
                  Reporter Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="input-tactile"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="input-tactile"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1 uppercase">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="input-tactile"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="px-6 sm:px-8 py-5 bg-neutral-50 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-neutral-600 font-medium text-center sm:text-left">
              Submissions are recorded in the campus chain of custody log.
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="btn-tactile btn-tactile-white text-xs px-4 py-2.5 shadow-[2px_2px_0px_#000] w-1/2 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-tactile btn-tactile-purple text-xs px-6 py-2.5 shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000] w-1/2 sm:w-auto disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Submit Report'}
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {createdItemResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border-[3px] border-black rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-[8px_8px_0px_#000] text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-green border-2 border-black text-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000]">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="font-display text-2xl font-normal text-black uppercase tracking-tight">
                Report Submitted!
              </h3>
              <p className="text-xs text-neutral-600 mt-1 font-medium">
                Your report has been entered into the active LostFound+ directory.
              </p>
            </div>

            <div className="p-3 bg-brand-yellow/30 border-2 border-black rounded-xl font-mono text-sm font-bold text-black shadow-[2px_2px_0px_#000]">
              Tracking ID: {createdItemResult.id}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate('/matches')}
                className="btn-tactile btn-tactile-purple text-xs w-full py-3 shadow-[3px_3px_0px_#000]"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                Check Instant Smart Matches
              </button>
              <button
                type="button"
                onClick={() => navigate('/search')}
                className="btn-tactile btn-tactile-white text-xs w-full py-3 shadow-[2px_2px_0px_#000]"
              >
                Browse Public Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
