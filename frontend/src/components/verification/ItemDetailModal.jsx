import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, Tag, ShieldCheck, User, Phone, Mail, Building, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { getItemImageUrl } from '../../utils/itemImage';

export const ItemDetailModal = ({ item, isOpen, onClose, onClaim }) => {
  const [foundNotificationSent, setFoundNotificationSent] = useState(false);
  if (!isOpen || !item) return null;
  const imageUrl = getItemImageUrl(item);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[8px_8px_0px_#000] border-[3px] border-black overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-brand-lilac/30">
          <div className="flex items-center gap-3">
            <StatusBadge type={item.type} text={item.type === 'lost' ? 'Lost Item' : 'Found Item'} />
            <span className="text-xs font-mono font-bold text-neutral-800 bg-white border border-black px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#000]">
              {item.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-black bg-white hover:bg-brand-pink hover:text-white shadow-[2px_2px_0px_#000] transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Visual & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            <div className="aspect-4/3 sm:aspect-square w-full rounded-2xl bg-brand-lilac/30 border-2 border-black overflow-hidden flex items-center justify-center shadow-[3px_3px_0px_#000]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.title || 'Lost item'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    console.error('Failed to load Cloudinary image:', imageUrl);
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center p-4 text-xs font-bold text-neutral-500">
                  No photo provided with report
                </div>
              )}
            </div>

            <div className="sm:col-span-2 space-y-3">
              <h2 className="font-display text-2xl font-normal text-black uppercase tracking-tight">
                {item.title}
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed font-body">
                {item.description}
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                {item.brand && (
                  <span className="bg-white border-2 border-black px-2.5 py-1 rounded-full text-black font-bold shadow-[1.5px_1.5px_0px_#000]">
                    Brand: <strong>{item.brand}</strong>
                  </span>
                )}
                {item.color && (
                  <span className="bg-white border-2 border-black px-2.5 py-1 rounded-full text-black font-bold shadow-[1.5px_1.5px_0px_#000]">
                    Color: <strong>{item.color}</strong>
                  </span>
                )}
                <span className="bg-brand-yellow border-2 border-black px-2.5 py-1 rounded-full text-black font-bold shadow-[1.5px_1.5px_0px_#000]">
                  Category: <strong>{item.category}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Location & Time specs */}
          <div className="bg-neutral-50 rounded-2xl p-4 border-2 border-black shadow-[3px_3px_0px_#000] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-purple stroke-[2.5]" /> Reported Location
              </div>
              <p className="text-xs font-bold text-black">
                {item.location}
              </p>
              {item.building && (
                <p className="text-xs text-neutral-600 font-medium">
                  Zone: {item.building}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-purple stroke-[2.5]" /> Incident Timestamp
              </div>
              <p className="text-xs font-bold text-black">
                {item.date} {item.time && `at ${item.time}`}
              </p>
              <p className="text-xs text-neutral-600 font-mono font-medium">
                Status: {item.status.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Distinguishing Features */}
          {item.distinguishingFeatures && (
            <div className="border-t-2 border-black/15 pt-4">
              <h4 className="text-xs font-bold text-black mb-1.5 flex items-center gap-1.5 uppercase">
                <Tag className="w-3.5 h-3.5 text-brand-purple stroke-[2.5]" />
                Distinguishing Marks & Features
              </h4>
              <p className="text-xs text-neutral-700 bg-white border-2 border-black p-3 rounded-xl leading-relaxed shadow-[2px_2px_0px_#000]">
                {item.distinguishingFeatures}
              </p>
            </div>
          )}

          {/* Custody Info */}
          <div className="border-t-2 border-black/15 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">
                Current Custody Location
              </span>
              <p className="text-xs font-bold text-black mt-0.5">
                {item.custodyStatus || 'With reporter'}
              </p>
              {item.dropOffLocation && (
                <p className="text-xs text-brand-purple font-bold">
                  Drop-off: {item.dropOffLocation}
                </p>
              )}
            </div>

            {item.rewardOffered && (
              <div className="text-right">
                <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">
                  Owner Reward
                </span>
                <p className="text-xs font-bold text-black bg-brand-green border border-black px-2.5 py-0.5 rounded-full">
                  {item.rewardOffered}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
          {foundNotificationSent ? (
            <div className="w-full p-3 rounded-xl bg-brand-green/30 border-2 border-black text-xs text-black font-medium flex items-center justify-between shadow-[2px_2px_0px_#000]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                <span>Notification dispatched to reporter ({item.contactEmail}). Please drop item off at Campus Security desk.</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn-tactile btn-tactile-white text-xs px-3 py-1 ml-2 shrink-0 shadow-[1.5px_1.5px_0px_#000]"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="btn-tactile btn-tactile-white text-xs px-4 py-2 shadow-[2px_2px_0px_#000]"
              >
                Close
              </button>

              {item.type === 'found' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onClaim(item);
                  }}
                  className="btn-tactile btn-tactile-purple text-xs px-5 py-2 shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000]"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  Claim Ownership of This Item
                </button>
              )}

              {item.type === 'lost' && (
                <button
                  type="button"
                  onClick={() => {
                    setFoundNotificationSent(true);
                  }}
                  className="btn-tactile btn-tactile-yellow text-xs px-5 py-2 shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000]"
                >
                  I Found This Item
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
