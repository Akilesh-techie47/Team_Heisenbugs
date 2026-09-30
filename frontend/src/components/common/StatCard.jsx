import React from 'react';

export const StatCard = ({ label, value, subtext, icon: Icon, trend }) => {
  return (
    <div className="bg-white border-[2.5px] border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] hover:shadow-[5px_6px_0px_#000] hover:-translate-y-0.5 transition-all duration-180 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-800 tracking-wider uppercase">
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-brand-yellow border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
            <Icon className="w-4 h-4 stroke-[2.5]" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2 flex-wrap">
        <div className="font-display text-3xl sm:text-4xl font-normal text-black tabular-nums tracking-tight">
          {value}
        </div>
        {trend && (
          <span className="text-xs font-bold text-black bg-brand-green border border-black px-2 py-0.5 rounded-full shadow-[1.5px_1.5px_0px_#000]">
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <div className="mt-2 text-xs font-medium text-neutral-600">
          {subtext}
        </div>
      )}
    </div>
  );
};
