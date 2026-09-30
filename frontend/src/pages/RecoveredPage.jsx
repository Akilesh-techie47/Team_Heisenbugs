import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';
import {
  CheckCircle2,
  Clock,
  Heart,
  Search,
  Sparkles,
  ShieldCheck,
  PackageCheck,
  User,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecoveredPage = () => {
  const { recoveredStories } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = recoveredStories.filter(
    (story) =>
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.testimonial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-block px-3.5 py-1 rounded-full border-2 border-black bg-brand-green text-[11px] font-black tracking-wider uppercase shadow-[2px_2px_0px_#000]">
          Community Hall of Fame
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-black">
          Belongings Brought Home
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
          Celebrating honest campus finders, dedicated custody staff, and grateful students reunited with their essential items.
        </p>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Belongings Returned"
          value="1,248"
          subtext="Verified custody transfers"
          icon={PackageCheck}
        />
        <StatCard
          label="Community Return Rate"
          value="98.4%"
          subtext="Highest in campus history"
          icon={CheckCircle2}
        />
        <StatCard
          label="Fastest Reconnection"
          value="45 mins"
          subtext="Library commons drop-off"
          icon={Clock}
        />
        <StatCard
          label="Campus Gratitude Notes"
          value="430+"
          subtext="Student appreciation"
          icon={Heart}
        />
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
          <Search className="w-4 h-4 text-black" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search recovered stories, finders, or items..."
          className="input-tactile pl-10 pr-4 text-xs w-full bg-white"
        />
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            className="bg-white border-[2.5px] border-black rounded-3xl p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between hover:-translate-y-1 transition-transform"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b-2 border-black/10 mb-3">
                <span className="text-[11px] font-black text-black bg-brand-green px-2.5 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_#000]">
                  {story.badge || 'Verified Handover'}
                </span>
                <span className="text-[11px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-black/20">
                  {story.timeToRecover}
                </span>
              </div>

              <h3 className="text-lg font-display font-black text-black">
                {story.title}
              </h3>
              <div className="text-[11px] text-brand-purple font-black uppercase tracking-wider mt-0.5">
                {story.category}
              </div>

              <blockquote className="mt-3 text-xs text-neutral-700 leading-relaxed italic bg-brand-lilac/25 p-3.5 rounded-2xl border-2 border-black">
                "{story.testimonial}"
              </blockquote>
            </div>

            <div className="pt-4 mt-4 border-t-2 border-black/10 text-xs space-y-1.5">
              <div className="flex justify-between text-black font-bold">
                <span className="text-neutral-500">Owner:</span>
                <span>{story.owner}</span>
              </div>
              <div className="flex justify-between text-neutral-600 font-medium">
                <span className="text-neutral-500">Finder / Desk:</span>
                <span>{story.finder}</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
                <span>Date:</span>
                <span>{story.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Card */}
      <div className="bg-brand-yellow/30 border-[2.5px] border-black rounded-3xl p-8 sm:p-10 text-center space-y-4 max-w-2xl mx-auto shadow-[4px_4px_0px_#000]">
        <h3 className="text-2xl sm:text-3xl font-display font-black text-black">
          DID YOU LOSE OR FIND SOMETHING TODAY?
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto font-medium">
          Every item returned starts with a single honest report. File your details in 60 seconds.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/report"
            className="btn-tactile-primary text-xs"
          >
            Report an Item Now
          </Link>
          <Link
            to="/search"
            className="btn-tactile-secondary text-xs"
          >
            Search Directory
          </Link>
        </div>
      </div>
    </div>
  );
};
