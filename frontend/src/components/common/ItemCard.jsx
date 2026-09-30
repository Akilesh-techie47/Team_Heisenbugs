import React from 'react';
import { MapPin, Calendar, Clock, ArrowRight, Package } from 'lucide-react';
import { StatusBadge } from './Badge';
import { getItemImageUrl } from '../../utils/itemImage';

export const ItemCard = ({ item, onSelect, onClaim }) => {
  const imageUrl = getItemImageUrl(item);
  return (
    <div className="group bg-white border-[2.5px] border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_#000] hover:shadow-[6px_8px_0px_#000] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Image Container with Fallback */}
        <div className="relative aspect-4/3 w-full bg-brand-lilac/30 overflow-hidden border-b-2 border-black">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title || 'Lost item'}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
              onError={(event) => {
                console.error('Failed to load Cloudinary image:', imageUrl);
                event.currentTarget.style.display = 'none';
                if (event.currentTarget.nextSibling) {
                  event.currentTarget.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div
            className={`w-full h-full items-center justify-center flex flex-col gap-2 text-neutral-600 p-4 bg-brand-lilac/20 ${
              imageUrl ? 'hidden' : 'flex'
            }`}
          >
            <Package className="w-8 h-8 text-neutral-500" />
            <span className="text-xs font-bold text-center">No Photo Available</span>
          </div>

          {/* Type Badge Top Left */}
          <div className="absolute top-3 left-3 z-10">
            <StatusBadge type={item.type} text={item.type === 'lost' ? 'Lost' : 'Found'} />
          </div>

          {/* Reference ID Top Right */}
          <div className="absolute top-3 right-3 z-10">
            <span className="text-[11px] font-mono font-bold text-black bg-white border border-black px-2 py-0.5 rounded-md shadow-[1.5px_1.5px_0px_#000]">
              {item.id}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Metadata line */}
          <div className="flex items-center gap-2 text-xs text-neutral-600 mb-2 flex-wrap font-semibold">
            <span className="text-black bg-brand-yellow/50 px-2 py-0.5 rounded-full border border-black text-[11px]">
              {item.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-700">
              <Calendar className="w-3 h-3 text-neutral-500" />
              {item.date}
            </span>
            {item.time && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-neutral-700">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  {item.time}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display text-lg font-normal text-black tracking-tight group-hover:text-brand-purple transition-colors line-clamp-1">
            {item.title}
          </h3>

          {/* Location */}
          <div className="mt-2 flex items-start gap-1.5 text-xs text-neutral-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-brand-purple shrink-0 mt-0.5 stroke-[2.5]" />
            <span className="line-clamp-1">{item.location}</span>
          </div>

          {/* Description */}
          <p className="mt-2 text-xs text-neutral-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Card Footer / Action row */}
      <div className="p-4 sm:px-5 sm:pb-5 pt-0 border-t border-black/10 flex items-center justify-between gap-2 mt-2">
        <button
          type="button"
          onClick={() => onSelect && onSelect(item)}
          className="text-xs font-bold text-black hover:text-brand-purple flex items-center gap-1 py-1.5 transition-colors group/btn"
        >
          <span>View Specs</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>

        {item.type === 'found' && item.status !== 'recovered' && (
          <button
            type="button"
            onClick={() => onClaim && onClaim(item)}
            className="btn-tactile btn-tactile-purple text-xs px-3.5 py-1.5 shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000]"
          >
            Claim This
          </button>
        )}

        {item.type === 'lost' && (
          <span className="text-[11px] font-bold text-brand-purple bg-brand-lilac/50 border border-black/40 px-2 py-0.5 rounded-full">
            {item.rewardOffered ? `Reward: ${item.rewardOffered}` : 'Reported by Owner'}
          </span>
        )}
      </div>
    </div>
  );
};
