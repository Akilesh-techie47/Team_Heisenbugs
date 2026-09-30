import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';
import {
  ShieldCheck,
  Building,
  Users,
  Activity,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  FileCheck,
  XCircle,
  Search,
  Filter,
  Trash2,
  Eye,
  KeyRound,
  Shield,
  HelpCircle,
  FileText,
  Sparkles,
  Inbox,
  UserCheck,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Hash,
  Phone,
  Mail,
  Calendar,
  Lock,
} from 'lucide-react';

export const AdminPage = () => {
  const { currentUser } = useAuth();
  const {
    items,
    claims,
    matches,
    auditLogs,
    analytics,
    users,
    approveClaim,
    rejectClaim,
    adminConfirmRecovery,
    executeHandover,
    deleteItem,
  } = useData();

  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'pending';

  const [claimFilter, setClaimFilter] = useState('all'); // 'all' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED'
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedCaseClaim, setSelectedCaseClaim] = useState(null);
  const [rejectionModalClaim, setRejectionModalClaim] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Handover OTP Terminal state
  const [handoverOtpInput, setHandoverOtpInput] = useState('');
  const [handoverClaimIdInput, setHandoverClaimIdInput] = useState('');
  const [handoverResult, setHandoverResult] = useState(null);
  const [handoverError, setHandoverError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const totalReported = items.length;
  const totalFound = items.filter((i) => i.type === 'found').length;
  const totalLost = items.filter((i) => i.type === 'lost').length;
  const pendingClaimsList = claims.filter(
    (c) => c.status === 'PENDING' || c.status === 'Under Review'
  );
  const approvedClaimsList = claims.filter(
    (c) => c.status === 'APPROVED' || c.status === 'Ready for Handover'
  );
  const completedClaimsList = claims.filter(
    (c) => c.status === 'COMPLETED' || c.status === 'Completed'
  );
  const pendingClaimsCount = pendingClaimsList.length;

  const campusZones = [
    { name: 'Main Campus Library - Circulation Desk', activeItems: 12, supervisor: 'Elena R.' },
    { name: 'Campus Security Lost & Found (Bldg 4)', activeItems: 28, supervisor: 'Sgt. Jenkins' },
    { name: 'Student Union Building - Info Desk', activeItems: 8, supervisor: 'Marcus V.' },
    { name: 'North Recreation Complex Desk', activeItems: 5, supervisor: 'Coach Dave' },
  ];

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const filteredClaims = claims.filter((c) => {
    if (claimFilter === 'all') return true;
    if (claimFilter === 'PENDING') return c.status === 'PENDING' || c.status === 'Under Review';
    if (claimFilter === 'APPROVED') return c.status === 'APPROVED' || c.status === 'Ready for Handover';
    if (claimFilter === 'COMPLETED') return c.status === 'COMPLETED' || c.status === 'Completed';
    if (claimFilter === 'REJECTED') return c.status === 'REJECTED' || c.status === 'Rejected';
    return c.status === claimFilter;
  });

  const lostReportsList = items.filter((i) => i.type === 'lost');
  const foundReportsList = items.filter((i) => i.type === 'found');

  const filteredLostItems = lostReportsList.filter((item) => {
    if (!itemSearchQuery.trim()) return true;
    const q = itemSearchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.id?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      item.contactName?.toLowerCase().includes(q)
    );
  });

  const filteredFoundItems = foundReportsList.filter((item) => {
    if (!itemSearchQuery.trim()) return true;
    const q = itemSearchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.id?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      item.dropOffLocation?.toLowerCase().includes(q) ||
      item.contactName?.toLowerCase().includes(q)
    );
  });

  const filteredUsers = (users || []).filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q)
    );
  });

  const handleApprove = async (claimId) => {
    const note = adminNoteInput || 'Supporting multi-signal evidence verified by Administrator. Handover authorized.';
    await approveClaim(claimId, note);
    setAdminNoteInput('');
    if (selectedCaseClaim && selectedCaseClaim.id === claimId) {
      setSelectedCaseClaim({ ...selectedCaseClaim, status: 'APPROVED', adminNotes: note });
    }
  };

  const handleOpenRejectModal = (claim) => {
    setRejectionModalClaim(claim);
    setRejectionReason('Supporting evidence does not match recorded item specifications or serial records.');
  };

  const handleConfirmReject = async () => {
    if (rejectionModalClaim) {
      await rejectClaim(rejectionModalClaim.id, rejectionReason);
      if (selectedCaseClaim && selectedCaseClaim.id === rejectionModalClaim.id) {
        setSelectedCaseClaim({ ...selectedCaseClaim, status: 'REJECTED', adminNotes: rejectionReason });
      }
      setRejectionModalClaim(null);
    }
  };

  const handleConfirmRecovery = async (itemId) => {
    if (confirm('Confirm final physical handover for this item? This updates status to RECOVERED.')) {
      await adminConfirmRecovery(itemId);
      if (selectedCaseClaim && selectedCaseClaim.itemId === itemId) {
        setSelectedCaseClaim({ ...selectedCaseClaim, status: 'COMPLETED' });
      }
    }
  };

  const handleVerifyHandoverOtp = async (e) => {
    e.preventDefault();
    setHandoverError('');
    setHandoverResult(null);

    const otp = handoverOtpInput.trim();
    if (!otp) {
      setHandoverError('Please enter a 6-digit handover OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await executeHandover(handoverClaimIdInput.trim() || undefined, otp);
      if (res.success) {
        setHandoverResult(res);
        setHandoverOtpInput('');
        setHandoverClaimIdInput('');
      } else {
        setHandoverError(res.message || 'OTP verification failed');
      }
    } catch (err) {
      setHandoverError(err.message || 'Failed to verify handover OTP token.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Find linked reports when inspecting a case
  const getLinkedItem = (itemId) => items.find((i) => i.id === itemId);
  const getLinkedMatch = (itemId) =>
    matches.find((m) => m.foundItemId === itemId || m.lostItemId === itemId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block px-3 py-0.5 rounded-full border-2 border-black bg-brand-yellow text-[11px] font-black tracking-wider uppercase shadow-[2px_2px_0px_#000]">
              Campus Operations & Decision Layer
            </span>
            <span className="text-xs text-neutral-400 font-bold">·</span>
            <span className="text-xs font-bold text-neutral-600">Authorized Central Authority</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-black">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl font-medium">
            Review user requests, inspect multi-signal evidence, authorize handovers, and manage campus custody governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-black text-white border-2 border-black text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#000]">
            <ShieldCheck className="w-4 h-4 text-brand-yellow" />
            <span>Admin: {currentUser?.name}</span>
          </div>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Requests"
          value={analytics?.pendingClaims ?? pendingClaimsCount}
          subtext="Requires human Admin decision"
          icon={FileCheck}
        />
        <StatCard
          label="Approved / Handover Ready"
          value={analytics?.approvedClaims ?? approvedClaimsList.length}
          subtext="Tokens activated for physical pickup"
          icon={CheckCircle2}
        />
        <StatCard
          label="Platform Reports"
          value={analytics?.totalReports ?? totalReported}
          subtext={`${totalLost} Lost · ${totalFound} Found`}
          icon={Layers}
        />
        <StatCard
          label="Campus Recovery Rate"
          value={analytics?.recoveryRate ?? '78.4%'}
          subtext="Verified physical returns"
          icon={TrendingUp}
          trend="+4.2% MoM"
        />
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b-[2.5px] border-black pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => handleTabChange('pending')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'pending'
              ? 'bg-black text-white border-2 border-black shadow-[3px_3px_0px_#000]'
              : 'bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-2 border-black shadow-[1px_1px_0px_#000]'
          }`}
        >
          <Inbox className="w-3.5 h-3.5 text-brand-yellow" />
          Pending Requests
          {pendingClaimsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-pink text-white text-[10px] flex items-center justify-center font-black border border-black">
              {pendingClaimsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('claims')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'claims'
              ? 'bg-black text-white border-2 border-black shadow-[3px_3px_0px_#000]'
              : 'bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-2 border-black shadow-[1px_1px_0px_#000]'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-brand-purple" />
          Claims ({claims.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('lost')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'lost'
              ? 'bg-black text-white border-2 border-black shadow-[3px_3px_0px_#000]'
              : 'bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-2 border-black shadow-[1px_1px_0px_#000]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          Lost Reports ({totalLost})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('found')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'found'
              ? 'bg-black text-white border-2 border-black shadow-[3px_3px_0px_#000]'
              : 'bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-2 border-black shadow-[1px_1px_0px_#000]'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-brand-purple" />
          Found Reports ({totalFound})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('recovery')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'recovery'
              ? 'bg-black text-white border-2 border-black shadow-[3px_3px_0px_#000]'
              : 'bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-2 border-black shadow-[1px_1px_0px_#000]'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-brand-green" />
          Recovery Cases ({approvedClaimsList.length + completedClaimsList.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('users')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'users'
              ? 'bg-black text-white border-2 border-black shadow-[3px_3px_0px_#000]'
              : 'bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-2 border-black shadow-[1px_1px_0px_#000]'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-neutral-500" />
          Users ({(users || []).length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('analytics')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'analytics'
              ? 'bg-black text-white border-2 border-black shadow-[3px_3px_0px_#000]'
              : 'bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-2 border-black shadow-[1px_1px_0px_#000]'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-brand-purple" />
          Analytics & Desks
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('audit')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            currentTab === 'audit'
              ? 'bg-black text-white border-2 border-black shadow-[3px_3px_0px_#000]'
              : 'bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-2 border-black shadow-[1px_1px_0px_#000]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-500" />
          Audit History ({auditLogs.length})
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PENDING REQUESTS                                        */}
      {/* ============================================================== */}
      {currentTab === 'pending' && (
        <div className="space-y-6">
          <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 shadow-[4px_4px_0px_#000]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black/10">
              <div>
                <h3 className="text-lg font-display font-black text-black flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-brand-purple" />
                  AWAITING ADMINISTRATIVE REVIEW & DECISION
                </h3>
                <p className="text-xs text-neutral-600 font-medium mt-0.5">
                  Recovery requests filed by campus members awaiting multi-signal evidence evaluation by the Administrator.
                </p>
              </div>

              <span className="text-xs font-mono font-black px-3 py-1 bg-brand-yellow text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_#000]">
                {pendingClaimsList.length} Action Items
              </span>
            </div>

            {pendingClaimsList.length > 0 ? (
              <div className="divide-y-2 divide-black/10">
                {pendingClaimsList.map((claim) => {
                  const targetItem = getLinkedItem(claim.itemId);
                  return (
                    <div
                      key={claim.id}
                      className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="font-black text-black bg-white px-2 py-0.5 rounded border border-black">
                            {claim.id}
                          </span>
                          <span className="text-neutral-400 font-bold">·</span>
                          <span className="text-neutral-600 font-bold">Item: {claim.itemId}</span>
                          <span className="text-neutral-400 font-bold">·</span>
                          <span className="text-black bg-brand-yellow px-2 py-0.5 rounded-full text-[10px] font-black border border-black shadow-[1px_1px_0px_#000]">
                            PENDING REVIEW
                          </span>
                        </div>
                        <h4 className="text-base font-display font-black text-black">{claim.itemTitle}</h4>
                        <div className="text-xs text-neutral-600 flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
                          <span>
                            <strong className="text-black">Claimant:</strong> {claim.claimantName} ({claim.claimantEmail})
                          </span>
                          <span>
                            <strong className="text-black">Finder:</strong> {claim.finderName || targetItem?.contactName || 'Campus Community'}
                          </span>
                          <span>
                            <strong className="text-black">Custody:</strong> {claim.dropOffLocation || targetItem?.dropOffLocation || 'Campus Desk'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-700 line-clamp-1 italic bg-neutral-50 px-2.5 py-1 rounded-lg border border-black/20">
                          "{claim.evidence?.distinctiveMarks || claim.proofSubmitted}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedCaseClaim(claim)}
                          className="px-3.5 py-2 text-xs font-black text-black bg-white hover:bg-neutral-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-purple" />
                          Inspect Both Sides
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(claim.id)}
                          className="px-3.5 py-2 text-xs font-black text-black bg-brand-green hover:brightness-105 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(claim)}
                          className="px-3 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-brand-green mx-auto" />
                <h4 className="text-base font-display font-black text-black">ALL PENDING REQUESTS ADDRESSED</h4>
                <p className="text-xs text-neutral-600 font-medium">
                  No ownership claims currently require administrator review.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CLAIMS (Full Cases & Decisions)                         */}
      {/* ============================================================== */}
      {currentTab === 'claims' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 p-1.5 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000]">
              {['all', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map((statusKey) => (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setClaimFilter(statusKey)}
                  className={`px-3.5 py-1.5 text-xs font-black rounded-xl whitespace-nowrap transition-all ${
                    claimFilter === statusKey
                      ? 'bg-black text-white shadow-[2px_2px_0px_#000]'
                      : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
                  }`}
                >
                  {statusKey === 'all'
                    ? `All (${claims.length})`
                    : statusKey === 'PENDING'
                    ? `Pending (${pendingClaimsCount})`
                    : statusKey === 'APPROVED'
                    ? `Approved (${approvedClaimsList.length})`
                    : statusKey === 'COMPLETED'
                    ? `Completed (${completedClaimsList.length})`
                    : `Rejected (${claims.filter((c) => c.status === 'REJECTED' || c.status === 'Rejected').length})`}
                </button>
              ))}
            </div>

            <span className="text-xs text-neutral-700 font-mono font-bold bg-neutral-100 px-3 py-1.5 rounded-xl border border-black/20">
              Showing {filteredClaims.length} total cases
            </span>
          </div>

          {filteredClaims.length > 0 ? (
            <div className="space-y-6">
              {filteredClaims.map((claim) => {
                const targetItem = getLinkedItem(claim.itemId);
                const relatedMatch = getLinkedMatch(claim.itemId);

                return (
                  <div
                    key={claim.id}
                    className="bg-white border-[2.5px] border-black rounded-3xl shadow-[4px_4px_0px_#000] overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-5 bg-brand-lilac/25 border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="font-black text-black bg-white px-2 py-0.5 rounded border border-black">
                            {claim.id}
                          </span>
                          <span className="text-neutral-400 font-bold">·</span>
                          <span className="text-neutral-600 font-bold">Item: {claim.itemId}</span>
                          <span className="text-neutral-400 font-bold">·</span>
                          <span className="text-neutral-500 font-mono">{claim.createdAt?.slice(0, 10)}</span>
                        </div>
                        <h3 className="text-lg font-display font-black text-black mt-1">{claim.itemTitle}</h3>
                      </div>

                      <div className="flex items-center gap-2.5">
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
                          {claim.status === 'PENDING' ? 'PENDING ADMIN REVIEW' : claim.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedCaseClaim(claim)}
                          className="px-3 py-1 text-xs font-black text-black bg-white border-2 border-black hover:bg-neutral-100 rounded-xl transition-all shadow-[2px_2px_0px_#000] flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-purple" />
                          Full Dossier
                        </button>
                      </div>
                    </div>

                    {/* Multi-Signal Evidence & Details Body */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Both sides overview */}
                      <div className="lg:col-span-8 space-y-4">
                        {/* Claimant Submitted Evidence */}
                        <div className="bg-neutral-50 border-2 border-black rounded-2xl p-5 space-y-3 shadow-[2px_2px_0px_#000]">
                          <h4 className="text-xs font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
                            <FileText className="w-4 h-4 text-brand-purple" />
                            Claimant Submitted Supporting Evidence:
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="bg-white p-3.5 rounded-xl border-2 border-black/20">
                              <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                                Lost Location & Approx Time
                              </span>
                              <p className="text-black font-bold mt-0.5">
                                {claim.evidence?.lastSeenLocation || 'Not specified'} · {claim.evidence?.lostTime || 'N/A'}
                              </p>
                            </div>

                            <div className="bg-white p-3.5 rounded-xl border-2 border-black/20">
                              <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                                Distinctive Marks & Scratches
                              </span>
                              <p className="text-black font-bold mt-0.5">
                                {claim.evidence?.distinctiveMarks || claim.proofSubmitted}
                              </p>
                            </div>

                            <div className="bg-white p-3.5 rounded-xl border-2 border-black/20">
                              <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                                Internal Contents / Personal Belongings
                              </span>
                              <p className="text-black font-bold mt-0.5">
                                {claim.evidence?.contentsDescription || 'No internal contents specified'}
                              </p>
                            </div>

                            <div className="bg-white p-3.5 rounded-xl border-2 border-black/20">
                              <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                                Serial / IMEI / Receipt Reference
                              </span>
                              <p className="text-black font-mono font-bold mt-0.5">
                                {claim.evidence?.serialOrReceipt || claim.evidence?.accessoryDetails || 'None provided'}
                              </p>
                            </div>
                          </div>

                          {claim.evidence?.confidentialAnswer && (
                            <div className="bg-white p-3.5 rounded-xl border-2 border-black/20 text-xs">
                              <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                                Claimant Answer to Security Challenge:
                              </span>
                              <p className="text-black font-mono font-bold mt-0.5">
                                "{claim.evidence.confidentialAnswer}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Confidential Private Verification Details on Item (Admin Inspection) */}
                        {targetItem && (
                          <div className="bg-brand-yellow/30 border-2 border-black rounded-2xl p-4 space-y-2 shadow-[2px_2px_0px_#000]">
                            <div className="flex items-center gap-1.5 text-xs font-black text-black uppercase tracking-wider">
                              <Shield className="w-4 h-4 text-brand-purple" />
                              Private Verification Details (Known Only to Finder & Administrator):
                            </div>
                            <p className="text-xs text-black font-mono font-bold leading-relaxed">
                              {targetItem.privateVerificationInfo || targetItem.securityAnswer || 'Standard desk inspection record.'}
                            </p>
                            <p className="text-[11px] text-neutral-700 font-medium">
                              Compare claimant's submitted marks against this private intake record before making an approval decision.
                            </p>
                          </div>
                        )}

                        {/* Parties & Custody Point */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-neutral-50 p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000]">
                            <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                              Claimant Contact (Party 1)
                            </span>
                            <p className="font-bold text-black text-sm mt-0.5">{claim.claimantName}</p>
                            <p className="text-neutral-600 font-medium">{claim.claimantEmail}</p>
                            <p className="text-neutral-600 font-medium">{claim.claimantPhone}</p>
                          </div>

                          <div className="bg-neutral-50 p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000]">
                            <span className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                              Finder / Custody Desk (Party 2)
                            </span>
                            <p className="font-black text-brand-purple text-sm mt-0.5">
                              {claim.dropOffLocation || targetItem?.dropOffLocation || 'Main Campus Library Desk'}
                            </p>
                            <p className="text-neutral-600 mt-0.5 font-medium">
                              Finder: {claim.finderName || targetItem?.contactName || 'Campus Community'}
                            </p>
                            <p className="text-neutral-600 font-medium">{targetItem?.contactEmail || 'desk@campus.edu'}</p>
                          </div>
                        </div>

                        {claim.adminNotes && (
                          <div className="p-3.5 bg-brand-yellow/20 border-2 border-black rounded-2xl text-xs text-neutral-900 shadow-[2px_2px_0px_#000]">
                            <strong className="font-black text-black">Administrator Note:</strong> {claim.adminNotes}
                          </div>
                        )}
                      </div>

                      {/* Right: Decision Panel */}
                      <div className="lg:col-span-4 bg-brand-yellow/25 border-2 border-black rounded-2xl p-5 space-y-4 shadow-[3px_3px_0px_#000]">
                        <div className="text-center">
                          <span className="text-[11px] font-black text-neutral-700 uppercase tracking-wider">
                            Handover Security Token
                          </span>
                          <div className="mt-1.5 py-2 px-3 bg-white border-2 border-black rounded-xl font-mono text-2xl font-black tracking-widest text-black tabular-nums shadow-[2px_2px_0px_#000]">
                            {claim.handoverOtp || '------'}
                          </div>
                          <p className="text-[10px] text-neutral-600 font-medium mt-1">
                            Activated upon administrator approval.
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t-2 border-black/10">
                          <div className="text-[11px] font-black text-black uppercase tracking-wider">
                            Admin Decision Actions:
                          </div>

                          {claim.status === 'PENDING' || claim.status === 'Under Review' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(claim.id)}
                                className="w-full py-2.5 px-3 text-xs font-black text-black bg-brand-green hover:brightness-105 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve Recovery Request
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(claim)}
                                className="w-full py-2 px-3 text-xs font-black text-white bg-red-600 hover:bg-red-700 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject Claim
                              </button>
                            </>
                          ) : claim.status === 'APPROVED' || claim.status === 'Ready for Handover' ? (
                            <div className="space-y-2">
                              <div className="p-3 bg-brand-green/30 text-black border-2 border-black rounded-xl text-xs font-bold text-center shadow-[1px_1px_0px_#000]">
                                Recovery request approved. Handover token active for pickup.
                              </div>
                              <button
                                type="button"
                                onClick={() => handleConfirmRecovery(claim.itemId)}
                                className="w-full py-2 px-3 text-xs font-black text-white bg-black hover:bg-neutral-800 border-2 border-black rounded-xl transition-all shadow-[2px_2px_0px_#000]"
                              >
                                Confirm Completed Recovery
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenRejectModal(claim)}
                                className="w-full py-1 text-xs text-red-600 font-bold hover:underline text-center block"
                              >
                                Revoke Approval / Flag Dispute
                              </button>
                            </div>
                          ) : (
                            <div className="p-3 bg-neutral-100 border border-black/20 text-neutral-700 rounded-xl text-xs font-bold text-center">
                              Decision finalized ({claim.status}).
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border-[2.5px] border-black rounded-3xl p-12 text-center space-y-4 shadow-[4px_4px_0px_#000]">
              <div className="w-14 h-14 rounded-2xl bg-brand-yellow border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto text-black">
                <FileCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-black text-black">NO CLAIMS UNDER THIS FILTER</h3>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">All submitted claims for this status have been addressed.</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LOST REPORTS                                            */}
      {/* ============================================================== */}
      {currentTab === 'lost' && (
        <div className="bg-white border-[2.5px] border-black rounded-3xl shadow-[4px_4px_0px_#000] space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black/10">
            <div>
              <h3 className="text-lg font-display font-black text-black flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                LOST ITEM REPORTS FILED BY USERS
              </h3>
              <p className="text-xs text-neutral-600 font-medium mt-0.5">
                Inspect lost belongings filed by students and faculty, distinct features, and status.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-black absolute left-3 top-2.5" />
              <input
                type="text"
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                placeholder="Search lost reports..."
                className="input-tactile pl-9 pr-3 py-2 text-xs w-full bg-neutral-50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-lilac/40 border-b-2 border-black text-black font-black uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Report ID</th>
                  <th className="py-3.5 px-4">Item Title & Category</th>
                  <th className="py-3.5 px-4">Reported Owner</th>
                  <th className="py-3.5 px-4">Location Lost</th>
                  <th className="py-3.5 px-4">Date Lost</th>
                  <th className="py-3.5 px-4">Distinguishing Details</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {filteredLostItems.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-yellow/10 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-black">{item.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-black">{item.title}</div>
                      <div className="text-[11px] text-neutral-500 font-medium">{item.category}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-black font-bold">{item.contactName || 'Student'}</div>
                      <div className="text-[11px] text-neutral-500">{item.contactEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 font-medium">{item.location}</td>
                    <td className="py-3.5 px-4 text-neutral-500 font-mono">{item.date}</td>
                    <td className="py-3.5 px-4 text-neutral-700 max-w-xs truncate font-mono">
                      {item.distinguishingFeatures || item.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full border border-black bg-neutral-100 text-black">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove lost report ${item.id} (${item.title})?`)) {
                            deleteItem(item.id);
                          }
                        }}
                        className="p-1.5 text-neutral-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-400 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                        title="Delete report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: FOUND REPORTS                                           */}
      {/* ============================================================== */}
      {currentTab === 'found' && (
        <div className="bg-white border-[2.5px] border-black rounded-3xl shadow-[4px_4px_0px_#000] space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black/10">
            <div>
              <h3 className="text-lg font-display font-black text-black flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-purple" />
                FOUND ITEM REPORTS & PRIVATE VERIFICATION DATA
              </h3>
              <p className="text-xs text-neutral-600 font-medium mt-0.5">
                Intake records showing unmasked private verification info (serial numbers, hidden scratches) for admin evaluation.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-black absolute left-3 top-2.5" />
              <input
                type="text"
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                placeholder="Search found reports..."
                className="input-tactile pl-9 pr-3 py-2 text-xs w-full bg-neutral-50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-lilac/40 border-b-2 border-black text-black font-black uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Report ID</th>
                  <th className="py-3.5 px-4">Found Item Title</th>
                  <th className="py-3.5 px-4">Finder / Desk</th>
                  <th className="py-3.5 px-4">Custody Point</th>
                  <th className="py-3.5 px-4 text-black bg-brand-yellow/50 border-x border-black/20">Private Verification Info (Admin Only)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {filteredFoundItems.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-yellow/10 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-black">{item.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-black">{item.title}</div>
                      <div className="text-[11px] text-neutral-500 font-medium">{item.category}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-black font-bold">{item.contactName || 'Finder'}</div>
                      <div className="text-[11px] text-neutral-500">{item.location}</div>
                    </td>
                    <td className="py-3.5 px-4 text-brand-purple font-black">
                      {item.dropOffLocation || 'Campus Custody Desk'}
                    </td>
                    <td className="py-3.5 px-4 bg-brand-yellow/20 text-black font-mono font-bold text-[11px] max-w-sm border-x border-black/10">
                      {item.privateVerificationInfo || item.securityAnswer || 'Standard intake log'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full border border-black bg-neutral-100 text-black">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove found report ${item.id} (${item.title})?`)) {
                            deleteItem(item.id);
                          }
                        }}
                        className="p-1.5 text-neutral-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-400 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                        title="Delete report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: RECOVERY CASES & HANDOVER TERMINAL                       */}
      {/* ============================================================== */}
      {currentTab === 'recovery' && (
        <div className="space-y-8">
          {/* Handover OTP Verification Terminal */}
          <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 shadow-[4px_4px_0px_#000] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
              <div>
                <h3 className="text-lg font-display font-black text-black flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-brand-green" />
                  CAMPUS DESK HANDOVER VERIFICATION TERMINAL
                </h3>
                <p className="text-xs text-neutral-600 font-medium">
                  Custody officers and administrators verify single-use 6-digit OTP codes presented by claimants at physical pickup desks.
                </p>
              </div>
              <span className="text-xs font-mono font-black text-black bg-brand-green px-3 py-1 rounded-xl border border-black shadow-[1px_1px_0px_#000]">
                Live Custody Gate
              </span>
            </div>

            {handoverError && (
              <div className="p-3.5 bg-red-50 border-2 border-black rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{handoverError}</span>
              </div>
            )}

            {handoverResult && (
              <div className="p-4 bg-brand-green/20 border-2 border-black rounded-2xl text-xs text-black space-y-1 shadow-[2px_2px_0px_#000]">
                <div className="font-black flex items-center gap-1.5 text-black">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" />
                  Handover Successfully Verified & Executed!
                </div>
                <p>
                  Claim <strong className="font-mono">{handoverResult.claim?.id}</strong> for{' '}
                  <strong>{handoverResult.claim?.itemTitle}</strong> marked COMPLETED.
                </p>
                <p className="text-[11px] text-neutral-700 font-medium">
                  Item status updated to RECOVERED. Community recovery archive updated.
                </p>
              </div>
            )}

            <form onSubmit={handleVerifyHandoverOtp} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
                  Claim ID (Optional)
                </label>
                <input
                  type="text"
                  value={handoverClaimIdInput}
                  onChange={(e) => setHandoverClaimIdInput(e.target.value)}
                  placeholder="e.g. CLM-7801"
                  className="input-tactile text-xs w-full"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-black text-black uppercase tracking-wider mb-1">
                  6-Digit Handover OTP Token
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={handoverOtpInput}
                  onChange={(e) => setHandoverOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 592814"
                  className="input-tactile text-lg font-mono font-black tracking-widest text-center w-full"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="btn-tactile-primary w-full py-2.5 text-xs font-black flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-brand-yellow" />
                  {isVerifyingOtp ? 'Verifying...' : 'Verify & Handover'}
                </button>
              </div>
            </form>
          </div>

          {/* List of Approved & Completed Recovery Cases */}
          <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 shadow-[4px_4px_0px_#000] space-y-4">
            <h3 className="text-lg font-display font-black text-black">
              ACTIVE RECOVERY CASES ({approvedClaimsList.length} Awaiting Pickup · {completedClaimsList.length} Completed)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-lilac/40 border-b-2 border-black text-black font-black uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Claim ID</th>
                    <th className="py-3.5 px-4">Item</th>
                    <th className="py-3.5 px-4">Claimant</th>
                    <th className="py-3.5 px-4">Pickup Custody Point</th>
                    <th className="py-3.5 px-4">Handover OTP</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {[...approvedClaimsList, ...completedClaimsList].map((claim) => (
                    <tr key={claim.id} className="hover:bg-brand-yellow/10 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-black">{claim.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-black">{claim.itemTitle}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">Item ID: {claim.itemId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-black font-bold">{claim.claimantName}</div>
                        <div className="text-[11px] text-neutral-500">{claim.claimantEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-brand-purple font-black">
                        {claim.dropOffLocation || 'Circulation Desk'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-black bg-neutral-100/60 px-2 rounded">
                        {claim.handoverOtp || '------'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full border border-black text-[11px] font-black ${
                            claim.status === 'COMPLETED' || claim.status === 'Completed'
                              ? 'bg-brand-green text-black'
                              : 'bg-brand-purple text-white'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {claim.status !== 'COMPLETED' && claim.status !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() => handleConfirmRecovery(claim.itemId)}
                            className="btn-tactile-secondary text-[11px] py-1 px-2.5"
                          >
                            Mark Picked Up
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: USERS DIRECTORY                                         */}
      {/* ============================================================== */}
      {currentTab === 'users' && (
        <div className="bg-white border-[2.5px] border-black rounded-3xl shadow-[4px_4px_0px_#000] space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black/10">
            <div>
              <h3 className="text-lg font-display font-black text-black flex items-center gap-2">
                <Users className="w-5 h-5 text-neutral-500" />
                REGISTERED CAMPUS ACCOUNTS & ROLES
              </h3>
              <p className="text-xs text-neutral-600 font-medium mt-0.5">
                Inspect platform accounts, roles, student/faculty departments, and activity metrics.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-black absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search campus members..."
                className="input-tactile pl-9 pr-3 py-2 text-xs w-full bg-neutral-50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-lilac/40 border-b-2 border-black text-black font-black uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">User ID</th>
                  <th className="py-3.5 px-4">Name & Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Department / Major</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Account Type</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-brand-yellow/10 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-black">{user.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-black">{user.name}</div>
                      <div className="text-[11px] text-neutral-500">{user.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full border border-black text-[11px] font-black uppercase tracking-wider ${
                          user.role === 'ADMIN'
                            ? 'bg-black text-white'
                            : 'bg-brand-blue text-black'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 font-medium">{user.department || 'General Campus'}</td>
                    <td className="py-3.5 px-4 text-neutral-600 font-mono">{user.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-neutral-600 font-medium">
                        {user.roleLabel || (user.role === 'ADMIN' ? 'Administrator' : 'Campus Member')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: CUSTODY DESKS & ANALYTICS                               */}
      {/* ============================================================== */}
      {currentTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Custody Desks */}
            <div className="lg:col-span-7 bg-white border-[2.5px] border-black rounded-3xl p-6 shadow-[4px_4px_0px_#000] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
                <div>
                  <h3 className="text-lg font-display font-black text-black">
                    DESIGNATED CUSTODY DROP-OFF POINTS
                  </h3>
                  <p className="text-xs text-neutral-600 font-medium">
                    Physical desks managing intake and secure OTP handovers
                  </p>
                </div>
                <span className="text-xs font-mono font-black text-black bg-brand-yellow px-2.5 py-1 rounded-full border border-black">
                  Active Desks
                </span>
              </div>

              <div className="space-y-3">
                {campusZones.map((zone, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-neutral-50 border-2 border-black rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_#000]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-yellow border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-black">{zone.name}</h4>
                        <p className="text-[11px] text-neutral-600 font-medium">Supervisor: {zone.supervisor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black font-mono text-black tabular-nums">
                        {zone.activeItems}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-medium">in custody</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="lg:col-span-5 bg-white border-[2.5px] border-black rounded-3xl p-6 shadow-[4px_4px_0px_#000] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
                <div>
                  <h3 className="text-lg font-display font-black text-black">CATEGORY DISTRIBUTION</h3>
                  <p className="text-xs text-neutral-600 font-medium">Reports by belonging category</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {analytics?.categoryBreakdown && Object.keys(analytics.categoryBreakdown).length > 0 ? (
                  Object.entries(analytics.categoryBreakdown).map(([cat, count]) => {
                    const percentage = Math.round((count / (analytics.totalReports || 1)) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-black">{cat}</span>
                          <span className="font-mono font-bold text-neutral-600">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden border border-black">
                          <div className="bg-brand-purple h-full rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-black">Electronics & Gadgets</span>
                        <span className="font-mono font-bold text-neutral-600">42%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden border border-black">
                        <div className="bg-brand-purple h-full rounded-full" style={{ width: '42%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-black">Bags & Backpacks</span>
                        <span className="font-mono font-bold text-neutral-600">26%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden border border-black">
                        <div className="bg-brand-purple h-full rounded-full" style={{ width: '26%' }} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: AUDIT HISTORY                                           */}
      {/* ============================================================== */}
      {currentTab === 'audit' && (
        <div className="bg-white border-[2.5px] border-black rounded-3xl overflow-hidden shadow-[4px_4px_0px_#000] space-y-0">
          <div className="p-6 border-b-2 border-black flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-black text-black">CHAIN OF CUSTODY & ADMINISTRATIVE AUDIT LOG</h3>
              <p className="text-xs text-neutral-600 font-medium">
                Immutable, timestamped record of administrative decisions, claim approvals, and physical handovers.
              </p>
            </div>
            <span className="text-xs font-mono font-black text-black bg-brand-green px-3 py-1 rounded-full border border-black shadow-[1px_1px_0px_#000]">
              Audit Status: Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-lilac/40 border-b-2 border-black text-black font-black uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Audit ID</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-yellow/10 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-black">{log.id}</td>
                    <td className="py-3.5 px-4 font-bold text-black">{log.actor}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-bold text-black bg-brand-blue px-2 py-0.5 rounded border border-black">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 font-medium">
                      {log.entity} #{log.entityId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-500">{log.timestamp}</td>
                    <td className="py-3.5 px-4 text-neutral-700 max-w-sm truncate">{log.details}</td>
                    <td className="py-3.5 px-4 text-right text-brand-green font-black">
                      {log.result || 'Success'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CASE DOSSIER MODAL: BOTH SIDES INSPECTION                      */}
      {/* ============================================================== */}
      {selectedCaseClaim && (() => {
        const targetItem = getLinkedItem(selectedCaseClaim.itemId);
        const relatedMatch = getLinkedMatch(selectedCaseClaim.itemId);

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white border-[3px] border-black rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-[8px_8px_0px_#000] space-y-6 my-auto max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-black/10">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-black text-black bg-white px-2 py-0.5 rounded border border-black">
                      {selectedCaseClaim.id}
                    </span>
                    <span className="text-neutral-400 font-bold">·</span>
                    <span className="text-neutral-600 font-bold">Target Item: {selectedCaseClaim.itemId}</span>
                    <span className="text-neutral-400 font-bold">·</span>
                    <span className="text-neutral-500 font-mono">Submitted: {selectedCaseClaim.createdAt?.slice(0, 10)}</span>
                  </div>
                  <h2 className="text-2xl font-display font-black text-black mt-1">
                    COMPLETE CASE DOSSIER: {selectedCaseClaim.itemTitle}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCaseClaim(null)}
                  className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* TWO SIDES SIDE-BY-SIDE INSPECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SIDE 1: CLAIMANT INFORMATION */}
                <div className="border-2 border-black rounded-2xl p-5 bg-neutral-50 space-y-4 shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black/10">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-brand-purple" />
                      <h3 className="text-sm font-black text-black uppercase tracking-wider">Claimant Information (Side A)</h3>
                    </div>
                    <span className="text-[11px] font-mono text-black font-bold bg-white px-2 py-0.5 rounded border border-black">
                      Party 1: Claiming Owner
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-neutral-500 font-black text-[11px] uppercase tracking-wider">Claimant Name:</span>
                        <p className="font-bold text-black">{selectedCaseClaim.claimantName}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500 font-black text-[11px] uppercase tracking-wider">User ID:</span>
                        <p className="font-mono text-neutral-600">{selectedCaseClaim.claimantId || 'USR-STUDENT'}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500 font-black text-[11px] uppercase tracking-wider">Email Account:</span>
                        <p className="text-black font-medium">{selectedCaseClaim.claimantEmail}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500 font-black text-[11px] uppercase tracking-wider">Phone:</span>
                        <p className="text-black font-medium">{selectedCaseClaim.claimantPhone || '+1 (555) 234-8901'}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t-2 border-black/10 space-y-2">
                      <span className="text-[11px] font-black text-black uppercase tracking-wider block">
                        Submitted Multi-Signal Evidence:
                      </span>

                      <div className="bg-white p-3.5 rounded-xl border-2 border-black/20 space-y-1.5">
                        <div>
                          <strong className="text-neutral-600 text-[11px]">Where & When Lost:</strong>
                          <p className="text-black font-bold">
                            {selectedCaseClaim.evidence?.lastSeenLocation || 'Campus Core'} · {selectedCaseClaim.evidence?.lostTime || 'Recent'}
                          </p>
                        </div>
                        <div>
                          <strong className="text-neutral-600 text-[11px]">Distinctive Marks & Unique Scratches:</strong>
                          <p className="text-black font-bold">
                            {selectedCaseClaim.evidence?.distinctiveMarks || selectedCaseClaim.proofSubmitted}
                          </p>
                        </div>
                        <div>
                          <strong className="text-neutral-600 text-[11px]">Internal Contents / Belongings:</strong>
                          <p className="text-black font-bold">
                            {selectedCaseClaim.evidence?.contentsDescription || 'No internal contents specified'}
                          </p>
                        </div>
                        <div>
                          <strong className="text-neutral-600 text-[11px]">Serial / IMEI / Receipt Reference:</strong>
                          <p className="text-black font-mono font-bold">
                            {selectedCaseClaim.evidence?.serialOrReceipt || selectedCaseClaim.evidence?.accessoryDetails || 'None recorded'}
                          </p>
                        </div>
                        {selectedCaseClaim.evidence?.confidentialAnswer && (
                          <div className="pt-1.5 border-t border-black/10">
                            <strong className="text-neutral-600 text-[11px]">Security Challenge Answer:</strong>
                            <p className="text-black font-mono font-bold">
                              "{selectedCaseClaim.evidence.confidentialAnswer}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SIDE 2: FINDER / POSTER INFORMATION */}
                <div className="border-2 border-black rounded-2xl p-5 bg-neutral-50 space-y-4 shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black/10">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-brand-purple" />
                      <h3 className="text-sm font-black text-black uppercase tracking-wider">Finder / Poster Record (Side B)</h3>
                    </div>
                    <span className="text-[11px] font-mono text-black font-bold bg-white px-2 py-0.5 rounded border border-black">
                      Party 2: Finder / Custodian
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-neutral-500 font-black text-[11px] uppercase tracking-wider">Finder Name:</span>
                        <p className="font-bold text-black">
                          {selectedCaseClaim.finderName || targetItem?.contactName || 'Campus Community Member'}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500 font-black text-[11px] uppercase tracking-wider">Custody Drop-Off Desk:</span>
                        <p className="font-black text-brand-purple">
                          {selectedCaseClaim.dropOffLocation || targetItem?.dropOffLocation || 'Campus Circulation Desk'}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-500 font-black text-[11px] uppercase tracking-wider">Contact Email:</span>
                        <p className="text-black font-medium">{targetItem?.contactEmail || 'campus.custody@campus.edu'}</p>
                      </div>
                      <div>
                        <span className="text-neutral-500 font-black text-[11px] uppercase tracking-wider">Found Location:</span>
                        <p className="text-black font-medium">{targetItem?.location || 'Campus Core'}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t-2 border-black/10 space-y-2">
                      <span className="text-[11px] font-black text-black uppercase tracking-wider block flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-brand-purple" />
                        Private Verification Details (Never Public):
                      </span>

                      <div className="bg-brand-yellow/30 p-3.5 rounded-xl border-2 border-black text-xs space-y-1.5 shadow-[1px_1px_0px_#000]">
                        <div>
                          <strong className="text-black text-[11px]">Confidential Intake Details:</strong>
                          <p className="text-black font-mono font-bold">
                            {targetItem?.privateVerificationInfo || targetItem?.securityAnswer || 'Standard desk inspection record.'}
                          </p>
                        </div>
                        {targetItem?.securityQuestion && (
                          <div>
                            <strong className="text-black text-[11px]">Intake Security Challenge:</strong>
                            <p className="text-neutral-800 italic font-bold">"{targetItem.securityQuestion}"</p>
                            <p className="text-neutral-700 text-[11px] mt-0.5">
                              Expected Answer: <span className="font-mono font-black">{targetItem.securityAnswer}</span>
                            </p>
                          </div>
                        )}
                        <div>
                          <strong className="text-black text-[11px]">Finder Intake Description:</strong>
                          <p className="text-neutral-900">{targetItem?.description || 'Item deposited at custody desk.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decision Section within Modal */}
              <div className="pt-4 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    <span className="text-neutral-500 font-bold">Current Status:</span>{' '}
                    <strong className="text-black font-mono font-black">{selectedCaseClaim.status}</strong>
                  </div>
                  {selectedCaseClaim.handoverOtp && (
                    <div className="text-xs bg-brand-yellow px-3 py-1 rounded-xl border-2 border-black shadow-[1px_1px_0px_#000]">
                      <span className="text-neutral-700 font-bold">OTP:</span>{' '}
                      <strong className="font-mono font-black text-black">{selectedCaseClaim.handoverOtp}</strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedCaseClaim.status === 'PENDING' || selectedCaseClaim.status === 'Under Review' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(selectedCaseClaim.id)}
                        className="btn-tactile-primary text-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Claim & Authorize Handover
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenRejectModal(selectedCaseClaim)}
                        className="px-3.5 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] transition-all"
                      >
                        Reject Claim
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedCaseClaim(null)}
                      className="btn-tactile-secondary text-xs"
                    >
                      Close Dossier
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Rejection Modal */}
      {rejectionModalClaim && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-[3px] border-black rounded-3xl max-w-md w-full p-6 shadow-[6px_6px_0px_#000] space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-6 h-6" />
              <h3 className="text-lg font-display font-black text-black">REJECT RECOVERY REQUEST</h3>
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              You are rejecting claim <strong className="font-mono text-black font-bold">{rejectionModalClaim.id}</strong> for{' '}
              <strong>{rejectionModalClaim.itemTitle}</strong>. Provide an administrative rationale for the claimant.
            </p>

            <div>
              <label className="text-xs font-black text-black uppercase tracking-wider block mb-1.5">
                Administrative Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="input-tactile text-xs w-full bg-neutral-50"
                placeholder="Specify why proof did not substantiate ownership..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalClaim(null)}
                className="btn-tactile-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 border-2 border-black rounded-xl transition-all shadow-[2px_2px_0px_#000]"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
