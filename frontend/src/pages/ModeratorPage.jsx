import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { StatusBadge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  UserCheck,
  Building,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const ModeratorPage = () => {
  const { currentUser, role } = useAuth();
  const { moderationQueue, resolveModeration, items, claims } = useData();

  const [filter, setFilter] = useState('all'); // 'all' | 'pending_review' | 'approved' | 'rejected'

  const filteredQueue = moderationQueue.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleAction = async (id, status) => {
    await resolveModeration(id, status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border border-[#E3E5E8] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#199FEF] uppercase tracking-wider">
              Campus Staff & Custody Portal
            </span>
            <span className="text-xs text-[#81858D]">·</span>
            <span className="text-xs text-[#555A63]">Main Library & Security Ops</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#15161A]">
            Moderation & Quality Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#555A63] mt-1">
            Review incoming reports, evaluate duplicate flags, and safeguard the campus chain of custody.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-[#EAF7FF] border border-sky-200 text-xs font-semibold text-[#199FEF] flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>Active Moderator: {currentUser?.name}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Queue"
          value={moderationQueue.filter((m) => m.status === 'pending_review').length}
          subtext="Requires verification"
          icon={Clock}
        />
        <StatCard
          label="Reviewed Today"
          value={moderationQueue.filter((m) => m.status === 'approved').length + 8}
          subtext="Verified reports"
          icon={CheckCircle2}
        />
        <StatCard
          label="Active Custody Items"
          value={items.filter((i) => i.custodyStatus?.includes('Desk') || i.custodyStatus?.includes('Office')).length}
          subtext="Logged in physical custody"
          icon={Building}
        />
        <StatCard
          label="Duplicate Alerts"
          value="1"
          subtext="AI similarity correlation"
          icon={AlertTriangle}
        />
      </div>

      {/* Queue Table */}
      <div className="bg-white border border-[#E3E5E8] rounded-2xl overflow-hidden shadow-xs space-y-0">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E3E5E8] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-[#15161A] text-white font-semibold'
                  : 'text-[#555A63] hover:text-[#15161A]'
              }`}
            >
              All Items ({moderationQueue.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending_review')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === 'pending_review'
                  ? 'bg-[#15161A] text-white font-semibold'
                  : 'text-[#555A63] hover:text-[#15161A]'
              }`}
            >
              Pending ({moderationQueue.filter((m) => m.status === 'pending_review').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('approved')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === 'approved'
                  ? 'bg-[#1B8A4B] text-white font-semibold'
                  : 'text-[#555A63] hover:text-[#15161A]'
              }`}
            >
              Approved
            </button>
          </div>

          <span className="text-xs text-[#81858D] font-mono">
            Showing {filteredQueue.length} records
          </span>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] border-b border-[#E3E5E8] text-[#555A63] font-semibold">
              <tr>
                <th className="py-3 px-4">Queue ID</th>
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4">Flag / Reason</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E5E8]">
              {filteredQueue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-[#15161A]">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#15161A]">{item.title}</div>
                    <div className="text-[11px] text-[#81858D] font-mono">Ref: {item.itemId}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#555A63]">
                    {item.submittedBy}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      {item.flagReason}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#81858D]">
                    {item.date}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                        item.status === 'approved'
                          ? 'bg-emerald-50 text-[#1B8A4B] border border-emerald-200'
                          : item.status === 'rejected'
                          ? 'bg-red-50 text-[#C53A34] border border-red-200'
                          : 'bg-slate-100 text-[#555A63] border border-[#E3E5E8]'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {item.status === 'pending_review' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAction(item.id, 'approved')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-[#1B8A4B] hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(item.id, 'rejected')}
                          className="px-2.5 py-1 text-xs font-semibold text-[#C53A34] hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#81858D] italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
