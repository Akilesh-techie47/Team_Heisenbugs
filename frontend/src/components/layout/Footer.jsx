import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#15161A] text-white border-t-[3px] border-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-1.5 focus:outline-none">
              <span className="font-display text-2xl tracking-tight text-white">
                LOSTFOUND
              </span>
              <span className="font-display text-2xl text-black bg-brand-yellow border-2 border-black rounded-lg px-1.5 py-0 shadow-[2px_2px_0px_#000] rotate-3">
                +
              </span>
            </Link>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-xs font-body">
              A trusted campus & enterprise management platform to report, discover, verify, and safely recover lost belongings.
            </p>
            <div className="inline-block bg-brand-purple border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Campus Recovery Network
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-brand-yellow mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-neutral-300">
              <li>
                <Link to="/home" className="hover:text-brand-yellow transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-brand-yellow transition-colors">
                  Report an Item
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-brand-yellow transition-colors">
                  Browse Directory
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-brand-yellow transition-colors">
                  Smart Matches
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & Trust */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-brand-blue mb-4">
              Verification & Trust
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-neutral-300">
              <li>
                <Link to="/claims" className="hover:text-brand-blue transition-colors">
                  Track Claims
                </Link>
              </li>
              <li>
                <Link to="/handover" className="hover:text-brand-blue transition-colors">
                  Secure Handover Desk
                </Link>
              </li>
              <li>
                <Link to="/recovered" className="hover:text-brand-blue transition-colors">
                  Recovered Archive
                </Link>
              </li>
              <li>
                <Link to="/moderator" className="hover:text-brand-blue transition-colors">
                  Staff Moderation
                </Link>
              </li>
            </ul>
          </div>

          {/* Custody Centers */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-brand-pink mb-4">
              Custody Centers
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed space-y-1">
              <span className="block font-bold text-white">Main Campus Security:</span>
              Building 04, Room 102
              <br />
              <span className="block font-bold text-white mt-2">Circulation Desk:</span>
              Library 1st Floor
              <br />
              <span className="block font-bold text-brand-yellow mt-2">Assistance Hotline:</span>
              +1 (555) 019-LOST
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} LostFound+ Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-4 sm:gap-6 font-semibold">
            <span className="text-neutral-300">Find it. Verify it. Bring it home.</span>
            <span>·</span>
            <span className="text-brand-yellow font-bold uppercase tracking-wider">
              Consumer-Grade UI Build
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
