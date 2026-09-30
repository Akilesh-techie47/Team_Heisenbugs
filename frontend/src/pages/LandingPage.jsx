import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FileText,
  Search,
  ShieldCheck,
  PackageCheck,
  ArrowRight,
  Sparkles,
  Smartphone,
  Wallet,
  Key,
  Briefcase,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { ASSET_IMAGES } from '../data/mockData';

export const LandingPage = () => {
  return (
    <div className="bg-white min-h-screen text-black overflow-hidden font-body">
      {/* 1. HERO SECTION */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Heading, Subtitle, CTAs, and Stats */}
          <div className="lg:col-span-6 space-y-6">
            {/* Tag badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs font-bold text-black bg-brand-yellow px-3.5 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#000]"
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              The Campus & Community Recovery Network
            </motion.div>

            {/* Oversized Dutch Morgan Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.88] uppercase text-black"
            >
              DON'T LET
              <br />
              <span className="text-white bg-brand-purple px-2 py-0.5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] inline-block my-1.5 -rotate-1">
                LOST THINGS
              </span>
              <br />
              STAY LOST.
            </motion.h1>

            {/* Clear supporting text */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-neutral-700 max-w-lg leading-relaxed font-medium"
            >
              A trusted platform to report, discover, verify and recover lost items. Powered by verified campus custody desks and secure single-use handover OTP workflows.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
            >
              <Link
                to="/register"
                className="btn-tactile btn-tactile-purple text-base px-7 py-3.5 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] flex items-center justify-center gap-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="btn-tactile btn-tactile-white text-base px-6 py-3.5 shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2"
              >
                How It Works
              </a>
            </motion.div>

            {/* Credibility Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="pt-6 border-t-2 border-black/15 grid grid-cols-3 gap-3 text-left"
            >
              <div className="bg-brand-lilac/30 border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000]">
                <div className="font-display text-2xl sm:text-3xl text-black tabular-nums">98.4%</div>
                <div className="text-[11px] font-bold text-neutral-700 uppercase tracking-tight">Verified Returns</div>
              </div>
              <div className="bg-brand-yellow/30 border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000]">
                <div className="font-display text-2xl sm:text-3xl text-black tabular-nums">&lt; 18h</div>
                <div className="text-[11px] font-bold text-neutral-700 uppercase tracking-tight">Avg. Match Time</div>
              </div>
              <div className="bg-brand-blue/40 border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000]">
                <div className="font-display text-2xl sm:text-3xl text-black tabular-nums">1,200+</div>
                <div className="text-[11px] font-bold text-neutral-700 uppercase tracking-tight">Belongings Safe</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual Feature Grid */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-brand-lilac/25 border-[3px] border-black rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#000]"
            >
              <div className="flex items-center justify-between pb-4 border-b-2 border-black/15">
                <div>
                  <span className="text-[11px] font-bold text-brand-purple uppercase tracking-wider block">
                    Campus Recovered Essentials
                  </span>
                  <h3 className="font-display text-xl font-normal text-black mt-0.5 uppercase tracking-tight">
                    Safe Custody & Smart Detection
                  </h3>
                </div>
                <span className="text-xs font-bold text-black bg-brand-yellow border-2 border-black px-2.5 py-1 rounded-full shadow-[1.5px_1.5px_0px_#000]">
                  4 Core Classes
                </span>
              </div>

              {/* 4 Cards Grid: Backpack, Phone, Wallet, Keys */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                {/* 1. Backpack */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="border-2 border-black rounded-2xl p-3.5 bg-white shadow-[3px_3px_0px_#000] transition-all group"
                >
                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-brand-lilac/30 mb-3 border-2 border-black">
                    <img
                      src={ASSET_IMAGES.backpack}
                      alt="Travel Backpack"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase">
                    <Briefcase className="w-3.5 h-3.5 text-brand-purple stroke-[2.5]" />
                    Backpack & Bags
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1">
                    Laptops, textbooks & gear
                  </p>
                </motion.div>

                {/* 2. Phone / Gadgets */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="border-2 border-black rounded-2xl p-3.5 bg-white shadow-[3px_3px_0px_#000] transition-all group"
                >
                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-brand-blue/30 mb-3 border-2 border-black">
                    <img
                      src={ASSET_IMAGES.earbuds}
                      alt="Smartphone and Earbuds"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase">
                    <Smartphone className="w-3.5 h-3.5 text-brand-purple stroke-[2.5]" />
                    Phone & Audio
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1">
                    Smartphones, cases & buds
                  </p>
                </motion.div>

                {/* 3. Wallet */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="border-2 border-black rounded-2xl p-3.5 bg-white shadow-[3px_3px_0px_#000] transition-all group"
                >
                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-brand-yellow/30 mb-3 border-2 border-black">
                    <img
                      src={ASSET_IMAGES.wallet}
                      alt="Leather Wallet"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase">
                    <Wallet className="w-3.5 h-3.5 text-brand-purple stroke-[2.5]" />
                    Wallet & IDs
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1">
                    Student badges & cards
                  </p>
                </motion.div>

                {/* 4. Keys */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="border-2 border-black rounded-2xl p-3.5 bg-white shadow-[3px_3px_0px_#000] transition-all group"
                >
                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-brand-green/20 mb-3 border-2 border-black">
                    <img
                      src={ASSET_IMAGES.keys}
                      alt="Keys and Fob"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-black uppercase">
                    <Key className="w-3.5 h-3.5 text-brand-purple stroke-[2.5]" />
                    Keys & Fobs
                  </div>
                  <p className="text-[11px] text-neutral-600 mt-0.5 line-clamp-1">
                    Dorm fobs & car keys
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. THE 4-STEP RECOVERY ENGINE (Scroll reveal animation) */}
      <section id="how-it-works" className="py-20 bg-brand-lilac/15 border-t-[3px] border-b-[3px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-xs font-bold text-black bg-brand-yellow px-3 py-1 rounded-full border border-black shadow-[1.5px_1.5px_0px_#000] uppercase tracking-wider">
              The 4-Step Recovery Engine
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-normal text-black uppercase tracking-tight mt-3">
              From loss to return, with complete transparency.
            </h2>
            <p className="text-sm text-neutral-700 mt-3 font-medium">
              LostFound+ provides a structured custody pipeline that eliminates ambiguity, protects private credentials, and ensures only legitimate owners receive belongings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1: Report */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white border-[2.5px] border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-yellow text-black border-2 border-black flex items-center justify-center font-display text-xl mb-4 shadow-[2px_2px_0px_#000]">
                  01
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-brand-purple stroke-[2.5]" />
                  <h3 className="font-display text-lg font-normal text-black uppercase">Report</h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-body">
                  Submit a structured report for a lost or found item with location, timestamp, category, and private verification signals.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/15 text-[11px] font-bold text-neutral-500 uppercase">
                Generates tracking ID & audit log.
              </div>
            </motion.div>

            {/* Step 2: Find */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.12 }}
              whileHover={{ y: -4 }}
              className="bg-white border-[2.5px] border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-blue text-black border-2 border-black flex items-center justify-center font-display text-xl mb-4 shadow-[2px_2px_0px_#000]">
                  02
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-brand-purple stroke-[2.5]" />
                  <h3 className="font-display text-lg font-normal text-black uppercase">Find</h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-body">
                  Browse the public directory or let our smart matching system suggest high-confidence matches based on location, specs, and timeline.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/15 text-[11px] font-bold text-neutral-500 uppercase">
                Side-by-side comparison & scoring.
              </div>
            </motion.div>

            {/* Step 3: Verify */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.24 }}
              whileHover={{ y: -4 }}
              className="bg-white border-[2.5px] border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-pink text-white border-2 border-black flex items-center justify-center font-display text-xl mb-4 shadow-[2px_2px_0px_#000]">
                  03
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-brand-purple stroke-[2.5]" />
                  <h3 className="font-display text-lg font-normal text-black uppercase">Verify</h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-body">
                  Submit proof of ownership through private security challenges, serial numbers, or identifying marks reviewed by campus custody staff.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/15 text-[11px] font-bold text-neutral-500 uppercase">
                Protects confidential info from public.
              </div>
            </motion.div>

            {/* Step 4: Recover */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.36 }}
              whileHover={{ y: -4 }}
              className="bg-white border-[2.5px] border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-green text-black border-2 border-black flex items-center justify-center font-display text-xl mb-4 shadow-[2px_2px_0px_#000]">
                  04
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <PackageCheck className="w-4 h-4 text-brand-purple stroke-[2.5]" />
                  <h3 className="font-display text-lg font-normal text-black uppercase">Recover</h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-body">
                  Meet safely at designated campus desks (Library circulation desk, Security Office) or verify handoff with single-use OTP codes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/15 text-[11px] font-bold text-neutral-500 uppercase">
                Digital handover receipt & archived log.
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. CTA CALLOUT SECTION */}
      <section className="py-20 bg-brand-purple text-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="text-xs font-bold text-black bg-brand-yellow px-3.5 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider inline-block">
              Fast · Secure · Verified
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-normal text-white uppercase tracking-tight">
              Ready to bring your belongings home?
            </h2>
            <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto font-medium">
              Join students, faculty, and campus staff who rely on LostFound+ every single day.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              to="/report"
              className="btn-tactile btn-tactile-yellow text-sm px-8 py-3.5 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] w-full sm:w-auto uppercase tracking-wide"
            >
              Report an Item Now
            </Link>
            <Link
              to="/search"
              className="btn-tactile btn-tactile-white text-sm px-8 py-3.5 shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] w-full sm:w-auto uppercase tracking-wide"
            >
              Search Campus Directory
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
