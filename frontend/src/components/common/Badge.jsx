import React from 'react';

export const StatusBadge = ({ type, text }) => {
  if (type === 'lost') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-[#FF4B4B]/20 border-2 border-black px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_#000]">
        <span className="w-2 h-2 rounded-full bg-[#FF4B4B] border border-black" aria-hidden="true" />
        {text || 'Lost Item'}
      </span>
    );
  }

  if (type === 'found') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-brand-blue border-2 border-black px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_#000]">
        <span className="w-2 h-2 rounded-full bg-brand-purple border border-black" aria-hidden="true" />
        {text || 'Found Item'}
      </span>
    );
  }

  if (type === 'recovered' || type === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-brand-green border-2 border-black px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_#000]">
        <span className="w-2 h-2 rounded-full bg-black" aria-hidden="true" />
        {text || 'Recovered'}
      </span>
    );
  }

  if (type === 'potential_match' || type === 'review') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-brand-yellow border-2 border-black px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_#000]">
        <span className="w-2 h-2 rounded-full bg-brand-orange border border-black" aria-hidden="true" />
        {text || 'Under Review'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-white border-2 border-black px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_#000]">
      {text}
    </span>
  );
};
