import React, { useState } from 'react';
import { X, Shield, CheckCircle, HelpCircle, AlertCircle, FileText, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const ClaimModal = ({ item, isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { createClaim } = useData();

  // Multi-signal supporting evidence form state
  const [evidence, setEvidence] = useState({
    lastSeenLocation: '',
    lostTime: '',
    contentsDescription: '',
    distinctiveMarks: '',
    accessoryDetails: '',
    categorySpecificSignal: '',
    claimantPhone: currentUser?.phone || '',
    handoverPreference: 'Main Campus Library - Circulation Desk',
    additionalNotes: '',
    confidentialAnswer: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const getCategorySpecificLabel = () => {
    const cat = item.category?.toLowerCase() || '';
    if (cat.includes('electronic') || cat.includes('gadget')) {
      return {
        label: 'Serial Number / IMEI / Model Number / Purchase Proof',
        placeholder: 'e.g. Serial ending in 4920, IMEI, or store receipt date/number...',
        help: 'Provide serial number or receipt reference to confirm hardware ownership.',
      };
    }
    if (cat.includes('bag') || cat.includes('backpack')) {
      return {
        label: 'Internal Compartment Contents & Personal Belongings',
        placeholder: 'List specific items inside pockets (notebooks, chargers, pens, keychains)...',
        help: 'List unique items stored inside that are not visible from the exterior.',
      };
    }
    if (cat.includes('wallet') || cat.includes('card') || cat.includes('id') || cat.includes('document')) {
      return {
        label: 'Issuing Institution & Identifying Card Details',
        placeholder: 'Types of cards inside (student ID, transit pass, bank card ending digits)...',
        help: 'Specific cards or credentials stored inside.',
      };
    }
    if (cat.includes('key')) {
      return {
        label: 'Keychain Fobs, Key Count & Identifying Tags',
        placeholder: 'Exact number of keys, fob color/brand, gym tag barcode digits...',
        help: 'Describe specific attachments or unique cuts.',
      };
    }
    return {
      label: 'Specific Serial / Identifying Mark / Receipt Reference',
      placeholder: 'Any distinguishing code, label, or purchase proof...',
      help: 'Information unique to your ownership of this item.',
    };
  };

  const catSignalConfig = getCategorySpecificLabel();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!evidence.distinctiveMarks.trim() && !evidence.contentsDescription.trim() && !evidence.confidentialAnswer.trim()) {
      setError('Please provide at least one supporting evidence signal (distinctive marks, contents, or verification answer).');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await createClaim({
        itemId: item.id,
        itemTitle: item.title,
        itemCategory: item.category,
        claimantId: currentUser?.id || 'USR-ANON',
        claimantName: currentUser?.name || 'Student Member',
        claimantEmail: currentUser?.email || 'student@campus.edu',
        claimantPhone: evidence.claimantPhone,
        finderName: item.contactName || 'Campus Community Member',
        finderEmail: item.contactEmail || 'desk@campus.edu',
        dropOffLocation: item.dropOffLocation || evidence.handoverPreference,
        evidence: {
          lastSeenLocation: evidence.lastSeenLocation,
          lostTime: evidence.lostTime,
          contentsDescription: evidence.contentsDescription,
          distinctiveMarks: evidence.distinctiveMarks,
          accessoryDetails: evidence.accessoryDetails,
          serialOrReceipt: evidence.categorySpecificSignal,
          confidentialAnswer: evidence.confidentialAnswer,
          additionalNotes: evidence.additionalNotes,
        },
        proofSubmitted: [
          evidence.distinctiveMarks && `Marks: ${evidence.distinctiveMarks}`,
          evidence.contentsDescription && `Contents: ${evidence.contentsDescription}`,
          evidence.categorySpecificSignal && `Category Signal: ${evidence.categorySpecificSignal}`,
          evidence.confidentialAnswer && `Answer: ${evidence.confidentialAnswer}`,
          evidence.lastSeenLocation && `Lost Location: ${evidence.lastSeenLocation}`,
        ].filter(Boolean).join(' | '),
      });

      onSuccess();
    } catch (err) {
      setError('Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[8px_8px_0px_#000] border-[3px] border-black overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-brand-lilac/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-yellow border-2 border-black text-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000]">
              <Shield className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display text-lg font-normal text-black uppercase tracking-tight">Submit Recovery Request</h3>
              <p className="text-[11px] font-mono text-neutral-600 font-bold">Reference: {item.id} · Multi-Signal Evidence Intake</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-brand-pink hover:text-white shadow-[2px_2px_0px_#000] transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-100 border-2 border-black text-xs font-bold text-red-700 flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{error}</span>
            </div>
          )}

          {/* Principle Disclaimer Notice */}
          <div className="p-3.5 bg-brand-yellow/30 border-2 border-black rounded-2xl text-xs text-black space-y-1 shadow-[2px_2px_0px_#000]">
            <div className="font-bold flex items-center gap-1.5 text-black">
              <Info className="w-4 h-4 shrink-0 stroke-[2.5]" />
              Human-Controlled Administrator Review
            </div>
            <p className="text-[11px] text-neutral-700 leading-relaxed font-body">
              Claim evidence is supporting information for <strong>Administrator review</strong>. The platform will never automatically transfer ownership based on similarity scores alone. The Administrator makes the final decision.
            </p>
          </div>

          {/* Item summary banner */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_#000]">
            <div>
              <div className="font-display text-sm text-black uppercase">{item.title}</div>
              <div className="text-[11px] text-neutral-600 font-medium">Found at: {item.location}</div>
            </div>
            <span className="text-[11px] font-bold text-brand-purple bg-brand-lilac/40 border border-black px-2 py-0.5 rounded-full">
              {item.category}
            </span>
          </div>

          {/* Signal 1: Last Seen Location & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Where did you last use / possess it?
              </label>
              <input
                type="text"
                value={evidence.lastSeenLocation}
                onChange={(e) => setEvidence({ ...evidence, lastSeenLocation: e.target.value })}
                placeholder="e.g. Library 2nd floor desk near windows"
                className="input-tactile text-xs py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Approximate date & time lost
              </label>
              <input
                type="text"
                value={evidence.lostTime}
                onChange={(e) => setEvidence({ ...evidence, lostTime: e.target.value })}
                placeholder="e.g. Sept 27 around 2:30 PM"
                className="input-tactile text-xs py-2"
              />
            </div>
          </div>

          {/* Signal 2: Distinctive Marks / Scratches / Physical details */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Distinctive Marks, Scratches or Unique Features <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={evidence.distinctiveMarks}
              onChange={(e) => setEvidence({ ...evidence, distinctiveMarks: e.target.value })}
              placeholder="e.g. Small yellow reflective tab on strap, slight scuff on lower corner..."
              className="input-tactile text-xs py-2"
            />
            <p className="mt-1 text-[11px] text-neutral-500 font-medium">
              Physical characteristics known only to genuine owner.
            </p>
          </div>

          {/* Signal 3: Category-Specific Evidence */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              {catSignalConfig.label}
            </label>
            <input
              type="text"
              value={evidence.categorySpecificSignal}
              onChange={(e) => setEvidence({ ...evidence, categorySpecificSignal: e.target.value })}
              placeholder={catSignalConfig.placeholder}
              className="input-tactile text-xs py-2"
            />
            <p className="mt-1 text-[11px] text-neutral-500 font-medium">{catSignalConfig.help}</p>
          </div>

          {/* Signal 4: Contents / Internal details */}
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Internal Contents or Attached Accessories
            </label>
            <textarea
              rows={2}
              value={evidence.contentsDescription}
              onChange={(e) => setEvidence({ ...evidence, contentsDescription: e.target.value })}
              placeholder="Describe internal contents, attached charms, fobs, cables, or papers inside..."
              className="input-tactile text-xs py-2 leading-relaxed"
            />
          </div>

          {/* Signal 5: Confidential Answer to Security Question (if item has one) */}
          {item.securityQuestion && (
            <div className="bg-brand-lilac/25 border-2 border-black rounded-xl p-3.5 space-y-2 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-purple">
                <HelpCircle className="w-4 h-4 stroke-[2.5]" />
                Finder's Verification Challenge
              </div>
              <p className="text-xs text-black italic font-medium">
                "{item.securityQuestion}"
              </p>
              <input
                type="text"
                placeholder="Enter confidential answer for the administrator to compare..."
                value={evidence.confidentialAnswer}
                onChange={(e) => setEvidence({ ...evidence, confidentialAnswer: e.target.value })}
                className="input-tactile text-xs py-2 bg-white"
              />
            </div>
          )}

          {/* Contact phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Claimant Contact Phone
              </label>
              <input
                type="tel"
                value={evidence.claimantPhone}
                onChange={(e) => setEvidence({ ...evidence, claimantPhone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="input-tactile text-xs py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Preferred Handover Desk
              </label>
              <select
                value={evidence.handoverPreference}
                onChange={(e) => setEvidence({ ...evidence, handoverPreference: e.target.value })}
                className="input-tactile text-xs py-2"
              >
                <option value="Main Campus Library - Circulation Desk">Main Campus Library - Circulation Desk</option>
                <option value="Campus Security Lost & Found Office (Bldg 4)">Campus Security Lost & Found Office (Bldg 4)</option>
                <option value="Student Union Building - Info Desk">Student Union Building - Info Desk</option>
                <option value="North Recreation Complex Desk">North Recreation Complex Desk</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-black/15 flex items-center justify-between">
            <span className="text-[11px] text-black font-bold uppercase tracking-wider bg-brand-yellow px-2 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_#000]">
              Initial Status: PENDING
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-tactile btn-tactile-white text-xs px-4 py-2 shadow-[2px_2px_0px_#000]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-tactile btn-tactile-purple text-xs px-5 py-2 shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting Evidence...' : 'Submit Claim for Review'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
