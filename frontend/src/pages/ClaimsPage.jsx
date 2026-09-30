import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  MapPin,
  ArrowRight,
  User,
  KeyRound,
  FileCheck,
  XCircle,
  Info,
} from 'lucide-react';

export const ClaimsPage = () => {
  const { currentUser, role } = useAuth();
  const { claims } = useData();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED'

  const filteredClaims = claims.filter((claim) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'PENDING') return claim.status === 'PENDING' || claim.status === 'Under Review';
    if (filterStatus === 'APPROVED') return claim.status === 'APPROVED' || claim.status === 'Ready for Handover';
    if (filterStatus === 'COMPLETED') return claim.status === 'COMPLETED' || claim.status === 'Completed';
    if (filterStatus === 'REJECTED') return claim.status === 'REJECTED' || claim.status === 'Rejected';
    return claim.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-0.5 rounded-full border-2 border-black bg-brand-blue text-[11px] font-black tracking-wider uppercase mb-1 shadow-[2px_2px_0px_#000]">
            Verification & Custody Pipeline
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-black mt-1">
            My Claims & Recovery Requests
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl font-medium">
            Track submitted recovery requests, monitor Administrator verification evaluation, and retrieve secure handover OTP tokens.
          </p>
        </div>

        <Link
          to="/handover"
          className="btn-tactile-secondary text-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <KeyRound className="w-4 h-4 text-brand-purple" />
          <span>Open Handover Desk</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border-2 border-black rounded-2xl overflow-x-auto shadow-[3px_3px_0px_#000]">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-1.5 text-xs font-black rounded-xl whitespace-nowrap transition-all ${
            filterStatus === 'all'
              ? 'bg-black text-white shadow-[2px_2px_0px_#000]'
              : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
          }`}
        >
          All Claims ({claims.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('PENDING')}
          className={`px-4 py-1.5 text-xs font-black rounded-xl whitespace-nowrap transition-all ${
            filterStatus === 'PENDING'
              ? 'bg-brand-yellow text-black border border-black shadow-[2px_2px_0px_#000]'
              : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
          }`}
        >
          Under Review ({claims.filter((c) => c.status === 'PENDING' || c.status === 'Under Review').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('APPROVED')}
          className={`px-4 py-1.5 text-xs font-black rounded-xl whitespace-nowrap transition-all ${
            filterStatus === 'APPROVED'
              ? 'bg-brand-purple text-white shadow-[2px_2px_0px_#000]'
              : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
          }`}
        >
          Approved ({claims.filter((c) => c.status === 'APPROVED' || c.status === 'Ready for Handover').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('COMPLETED')}
          className={`px-4 py-1.5 text-xs font-black rounded-xl whitespace-nowrap transition-all ${
            filterStatus === 'COMPLETED'
              ? 'bg-brand-green text-black border border-black shadow-[2px_2px_0px_#000]'
              : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
          }`}
        >
          Completed ({claims.filter((c) => c.status === 'COMPLETED' || c.status === 'Completed').length})
        </button>
      </div>

      {/* Claims List */}
      {filteredClaims.length > 0 ? (
        <div className="space-y-6">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white border-[2.5px] border-black rounded-3xl shadow-[4px_4px_0px_#000] overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 bg-brand-lilac/25 border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-black text-black bg-white px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
                      {claim.id}
                    </span>
                    <span className="text-neutral-400 font-bold">·</span>
                    <span className="text-xs font-bold text-neutral-600">Item: {claim.itemId}</span>
                  </div>
                  <h3 className="text-xl font-display font-black text-black">
                    {claim.itemTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000] ${
                      claim.status === 'COMPLETED' || claim.status === 'Completed'
                        ? 'bg-brand-green text-black'
                        : claim.status === 'APPROVED' || claim.status === 'Ready for Handover'
                        ? 'bg-brand-purple text-white'
                        : claim.status === 'REJECTED' || claim.status === 'Rejected'
                        ? 'bg-red-400 text-white'
                        : 'bg-brand-yellow text-black'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full border border-black ${
                        claim.status === 'COMPLETED' || claim.status === 'Completed'
                          ? 'bg-black'
                          : claim.status === 'APPROVED' || claim.status === 'Ready for Handover'
                          ? 'bg-brand-yellow'
                          : claim.status === 'REJECTED' || claim.status === 'Rejected'
                          ? 'bg-white'
                          : 'bg-black'
                      }`}
                    />
                    {claim.status === 'PENDING' ? 'Under Review' : claim.status}
                  </span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="px-6 py-4 bg-white border-b-2 border-black/10">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {claim.timeline?.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full border-2 border-black flex items-center justify-center shrink-0 text-xs font-black ${
                          step.completed
                            ? 'bg-brand-green text-black shadow-[1px_1px_0px_#000]'
                            : 'bg-neutral-100 text-neutral-400'
                        }`}
                      >
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold truncate ${
                            step.completed ? 'text-black' : 'text-neutral-400'
                          }`}
                        >
                          {step.step}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono truncate">{step.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claim Body Details */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-black mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                      <FileCheck className="w-4 h-4 text-brand-purple" />
                      Submitted Supporting Evidence
                    </h4>
                    <p className="text-xs text-neutral-800 bg-neutral-50 border-2 border-black p-4 rounded-2xl leading-relaxed font-mono shadow-[2px_2px_0px_#000]">
                      {claim.proofSubmitted}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-neutral-50 p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000]">
                      <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                        Claimant Contact
                      </span>
                      <p className="font-bold text-black text-sm mt-0.5">{claim.claimantName}</p>
                      <p className="text-neutral-600 font-medium">{claim.claimantEmail}</p>
                      <p className="text-neutral-600 font-medium">{claim.claimantPhone}</p>
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000]">
                      <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                        Authorized Custody Location
                      </span>
                      <p className="font-black text-brand-purple text-sm mt-0.5">
                        {claim.dropOffLocation || 'Campus Library - Circulation Desk'}
                      </p>
                      <p className="text-neutral-600 mt-1 text-[11px] font-medium">
                        Finder: {claim.finderName}
                      </p>
                    </div>
                  </div>

                  {claim.adminNotes && (
                    <div className="p-3.5 bg-brand-yellow/20 border-2 border-black rounded-2xl text-xs text-neutral-900 shadow-[2px_2px_0px_#000]">
                      <strong className="font-black text-black">Administrator Note:</strong> {claim.adminNotes}
                    </div>
                  )}
                </div>

                {/* Handover Token Box */}
                <div className="lg:col-span-4 bg-brand-yellow/30 border-2 border-black rounded-2xl p-5 space-y-4 text-center shadow-[3px_3px_0px_#000]">
                  <div>
                    <span className="text-[11px] font-black text-neutral-700 uppercase tracking-wider">
                      Single-Use Handover Token
                    </span>
                    <div className="mt-2 py-2.5 px-3 bg-white border-2 border-black rounded-xl font-mono text-2xl font-black tracking-widest text-black tabular-nums shadow-[2px_2px_0px_#000]">
                      {claim.status === 'APPROVED' || claim.status === 'Ready for Handover' || claim.status === 'COMPLETED'
                        ? claim.handoverOtp
                        : 'LOCKED'}
                    </div>
                    <p className="mt-1.5 text-[11px] text-neutral-600 font-medium leading-relaxed">
                      {claim.status === 'APPROVED' || claim.status === 'Ready for Handover'
                        ? 'Present this 6-digit code at the custody desk during physical pickup.'
                        : 'Token will activate once Administrator approves your supporting evidence.'}
                    </p>
                  </div>

                  {(claim.status === 'APPROVED' || claim.status === 'Ready for Handover') && (
                    <button
                      type="button"
                      onClick={() => navigate('/handover', { state: { claimId: claim.id, otp: claim.handoverOtp } })}
                      className="btn-tactile-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4" />
                      Proceed to Handover Desk
                    </button>
                  )}

                  {role === 'admin' ? (
                    (claim.status === 'PENDING' || claim.status === 'Under Review') && (
                      <Link
                        to="/admin"
                        className="btn-tactile-secondary block w-full py-2 text-xs text-center"
                      >
                        Review in Admin Console
                      </Link>
                    )
                  ) : (
                    (claim.status === 'PENDING' || claim.status === 'Under Review') && (
                      <div className="text-[11px] text-black bg-brand-yellow/50 border-2 border-black p-3 rounded-xl text-center font-bold shadow-[2px_2px_0px_#000]">
                        Under Administrator Review. You will receive an OTP notification once verified.
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-[2.5px] border-black rounded-3xl p-12 text-center space-y-4 shadow-[4px_4px_0px_#000]">
          <div className="w-14 h-14 rounded-2xl bg-brand-yellow border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto text-black">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-display font-black text-black">NO CLAIMS UNDER THIS STATUS</h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto font-medium">
            You can file a recovery request on any found item by exploring the search directory or smart matches.
          </p>
        </div>
      )}
    </div>
  );
};
