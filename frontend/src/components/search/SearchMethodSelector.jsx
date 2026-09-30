import React from 'react';
import { Camera, FileText, Sparkles, Check } from 'lucide-react';

export const SearchMethodSelector = ({ selectedMethod, onSelectMethod }) => {
  const methods = [
    {
      id: 'image',
      icon: Camera,
      title: 'Search with an image',
      badge: 'Visual Matching',
      badgeColor: 'bg-brand-blue text-black',
      description: 'Upload a photo of the item and compare it with recovered item images.',
      secondaryTip: 'Best if you have a photo of your item or receipt.'
    },
    {
      id: 'details',
      icon: FileText,
      title: 'Search with details',
      badge: 'No Photo Needed',
      badgeColor: 'bg-brand-yellow text-black',
      description: 'Describe the item, where you lost it, when you lost it, and other identifying details.',
      secondaryTip: 'Most common. 100% photo-free search.'
    },
    {
      id: 'both',
      icon: Sparkles,
      title: 'Use both',
      badge: 'Highest Accuracy',
      badgeColor: 'bg-brand-green text-black',
      description: 'Combine visual and descriptive evidence for a stronger match.',
      secondaryTip: 'Fuses multi-modal visual & text analysis.'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Product Rule Announcement Banner */}
      <div className="bg-brand-yellow border-[2.5px] border-black rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-[4px_4px_0px_#000]">
        <div className="w-9 h-9 rounded-xl bg-black text-brand-yellow flex items-center justify-center shrink-0 mt-0.5 shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-xs text-black leading-relaxed font-body">
          <strong className="font-display text-sm sm:text-base block mb-0.5 tracking-tight uppercase">
            You don't need a photo to search.
          </strong>
          A photo makes matching richer, but your description, campus location, date, and distinct marks are completely enough to begin recovery.
        </div>
      </div>

      <div className="text-center sm:text-left">
        <h2 className="font-display text-2xl sm:text-3xl font-normal tracking-tight text-black uppercase">
          How would you like to find your item?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
          Choose the search method that best fits what information or materials you have right now.
        </p>
      </div>

      {/* 3 Large Choices Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <div
              key={method.id}
              onClick={() => onSelectMethod(method.id)}
              className={`group relative text-left rounded-2xl p-6 transition-all duration-200 cursor-pointer border-[2.5px] border-black flex flex-col justify-between ${
                isSelected
                  ? 'bg-brand-lilac/30 shadow-[6px_6px_0px_#000] -translate-y-1'
                  : 'bg-white shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000] hover:-translate-y-0.5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] transition-colors ${
                      isSelected
                        ? 'bg-brand-purple text-white'
                        : 'bg-brand-yellow text-black group-hover:bg-brand-purple group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-black shadow-[1.5px_1.5px_0px_#000] ${method.badgeColor}`}
                  >
                    {method.badge}
                  </span>
                </div>

                <h3 className="font-display text-lg font-normal text-black group-hover:text-brand-purple transition-colors uppercase">
                  {method.title}
                </h3>

                <p className="text-xs text-neutral-600 mt-2 leading-relaxed font-body">
                  {method.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-black/15 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-500 font-medium italic">
                  {method.secondaryTip}
                </span>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-black shadow-[1.5px_1.5px_0px_#000] transition-all ${
                    isSelected
                      ? 'bg-brand-purple text-white'
                      : 'bg-neutral-100 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
