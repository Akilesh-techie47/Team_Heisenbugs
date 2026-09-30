import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  KeyRound,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  MapPin,
  FileText,
  Printer,
} from 'lucide-react';

export const HandoverPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { claims, executeHandover } = useData();
  const { currentUser } = useAuth();

  const [claimIdInput, setClaimIdInput] = useState(location.state?.claimId || 'CLM-8812');
  const [otpInput, setOtpInput] = useState(location.state?.otp || '482910');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const readyClaims = claims.filter((c) => c.status === 'Ready for Handover' || c.status === 'APPROVED');

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!otpInput.trim()) {
      setErrorMessage('Please enter the 6-digit verification OTP');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await executeHandover(claimIdInput, otpInput.trim());
      if (res.success) {
        setVerificationResult(res);
      } else {
        setErrorMessage(res.message || 'OTP verification failed. Please re-check code.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred during handover verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <span className="inline-block px-3 py-0.5 rounded-full border-2 border-black bg-brand-green text-[11px] font-black tracking-wider uppercase mb-1 shadow-[2px_2px_0px_#000]">
          Custody & Identity Confirmation
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-black mt-1">
          Handover & Verification Center
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl font-medium">
          Perform secure physical item transfers using one-time verification tokens and custodian validation.
        </p>
      </div>

      {!verificationResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: OTP Entry Form */}
          <div className="lg:col-span-7 bg-white border-[2.5px] border-black rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_#000] space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-black/10">
              <div className="w-11 h-11 rounded-2xl bg-brand-yellow border-2 border-black text-black flex items-center justify-center font-black shadow-[2px_2px_0px_#000]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-display font-black text-black">
                  VALIDATE CUSTODY TRANSFER
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  Enter the claim reference and recipient's OTP code
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-black text-xs font-bold text-red-700 flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
                  Claim Reference ID
                </label>
                <input
                  type="text"
                  required
                  value={claimIdInput}
                  onChange={(e) => setClaimIdInput(e.target.value)}
                  placeholder="e.g. CLM-8812"
                  className="input-tactile font-mono text-xs w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-black uppercase tracking-wider">
                    6-Digit Claimant OTP Code
                  </label>
                  <span className="text-[11px] font-mono text-neutral-600 font-bold">
                    Demo Code: <code className="bg-brand-yellow/50 px-1.5 py-0.5 rounded border border-black text-black">482910</code>
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="482910"
                  className="input-tactile text-2xl font-mono font-black tracking-widest text-center py-3 bg-neutral-50 focus:bg-white w-full"
                />
              </div>

              <div className="p-4 bg-brand-lilac/30 rounded-2xl border-2 border-black text-xs text-neutral-900 space-y-1.5 shadow-[2px_2px_0px_#000]">
                <div className="font-black text-black flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-brand-purple" />
                  Official Custodian Checklist
                </div>
                <p className="text-[11px] text-neutral-700 leading-relaxed font-medium">
                  1. Check photo ID matches claimant name.
                  <br />
                  2. Confirm item serial number or secret identifier.
                  <br />
                  3. Verify OTP is redeemed once before handing item over.
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="btn-tactile-primary w-full py-3.5 text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? 'Authenticating Token...' : 'Confirm Handover & Release Item'}
              </button>
            </form>
          </div>

          {/* Right: Scheduled / Pending Pickups */}
          <div className="lg:col-span-5 bg-white border-[2.5px] border-black rounded-3xl p-6 shadow-[4px_4px_0px_#000] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
              <h3 className="text-xs font-black text-black uppercase tracking-wider">
                Pending Pickups Today
              </h3>
              <span className="text-xs font-mono font-black text-black bg-brand-yellow px-2.5 py-0.5 rounded-full border border-black">
                {readyClaims.length} Ready
              </span>
            </div>

            <div className="space-y-3">
              {readyClaims.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => {
                    setClaimIdInput(claim.id);
                    setOtpInput(claim.handoverOtp || '');
                  }}
                  className="p-4 bg-neutral-50 hover:bg-brand-yellow/30 border-2 border-black rounded-2xl cursor-pointer transition-all shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-black truncate max-w-[180px]">
                      {claim.itemTitle}
                    </span>
                    <span className="text-[10px] font-mono font-black text-brand-purple bg-white px-2 py-0.5 rounded border border-black">
                      {claim.id}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 font-medium">
                    Claimant: {claim.claimantName}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-purple" />
                    {claim.dropOffLocation || 'Campus Desk'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Verification Success Receipt Card */
        <div className="bg-white border-[2.5px] border-black rounded-3xl p-8 sm:p-10 shadow-[6px_6px_0px_#000] text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-green border-2 border-black text-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000]">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="inline-block px-3 py-0.5 rounded-full border-2 border-black bg-brand-green text-[11px] font-black tracking-wider uppercase shadow-[2px_2px_0px_#000]">
              Custody Transfer Complete
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-black mt-2">
              ITEM RECOVERED & RETURNED
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
              Official digital receipt generated for campus audit log.
            </p>
          </div>

          {/* Receipt Details Box */}
          <div className="max-w-md mx-auto bg-neutral-50 border-2 border-black rounded-2xl p-5 text-left text-xs space-y-3 font-mono shadow-[3px_3px_0px_#000]">
            <div className="flex justify-between pb-2 border-b-2 border-black/10">
              <span className="text-neutral-500 font-bold">Handover Receipt ID:</span>
              <span className="font-black text-black">REC-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 font-bold">Item Name:</span>
              <span className="font-bold text-black">{verificationResult.claim?.itemTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 font-bold">Verified Owner:</span>
              <span className="text-black font-bold">{verificationResult.claim?.claimantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 font-bold">Custody Desk:</span>
              <span className="text-black">{verificationResult.claim?.dropOffLocation || 'Campus Security Desk'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 font-bold">Redeemed OTP:</span>
              <span className="text-brand-purple font-black">{otpInput} (Validated)</span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-black/10">
              <span className="text-neutral-500 font-bold">Timestamp:</span>
              <span className="text-neutral-700">{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/recovered')}
              className="btn-tactile-primary w-full sm:w-auto text-xs"
            >
              View Recovered Stories Hall
            </button>
            <button
              type="button"
              onClick={() => {
                setVerificationResult(null);
                setOtpInput('');
              }}
              className="btn-tactile-secondary w-full sm:w-auto text-xs"
            >
              Verify Another Handover
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
