import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound, ShieldAlert } from 'lucide-react';
import { ASSET_IMAGES } from '../data/mockData';

export const AdminLoginPage = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Invalid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await adminLogin(email, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setServerError(res.error || 'Invalid administrator credentials');
      }
    } catch (err) {
      setServerError(err.message || 'Access denied. Account does not have administrator clearance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdminFill = async () => {
    setEmail('a.vance@campus.admin.edu');
    setPassword('adminpassword123');
    setIsSubmitting(true);
    const res = await adminLogin('a.vance@campus.admin.edu', 'adminpassword123');
    setIsSubmitting(false);
    if (res.success) {
      navigate('/admin');
    } else {
      setServerError(res.error || 'Access denied');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch bg-white">
      {/* LEFT: Authority Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#15161A] text-white p-12 flex-col justify-between overflow-hidden border-r-[3px] border-black">
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-1.5 focus:outline-none">
            <span className="font-display text-3xl tracking-tight text-white">
              LOSTFOUND
            </span>
            <span className="font-display text-3xl text-black bg-brand-yellow border-2 border-black rounded-lg px-2 py-0 shadow-[2px_2px_0px_#000] rotate-3">
              +
            </span>
          </Link>
          <div className="mt-2 text-xs text-brand-yellow uppercase tracking-wider font-bold">
            Campus Operations & Decision Layer
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
            <KeyRound className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-white leading-tight uppercase">
            Authorized Platform Governance & Dispute Resolution
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-body">
            Centralized authority console for university security officers, desk supervisors, and facility administrators. Verify multi-signal ownership claims, authorize single-use handover codes, and review custody audits.
          </p>
        </div>

        <div className="relative z-10 pt-6 border-t border-neutral-800 text-xs text-neutral-400 flex items-center justify-between font-body">
          <span className="font-bold text-brand-yellow uppercase tracking-wider">Clearance: Administrator</span>
          <span className="font-mono text-[11px]">Enforced Server-Side Authorization</span>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-3xl border-[2.5px] border-black shadow-[6px_6px_0px_#000]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow border-2 border-black text-black text-xs font-bold mb-3 shadow-[2px_2px_0px_#000]">
              <KeyRound className="w-3.5 h-3.5 stroke-[2.5]" />
              Restricted Clearance
            </div>
            <h2 className="font-display text-3xl font-normal text-black uppercase tracking-tight">
              Admin Portal
            </h2>
            <p className="mt-1 text-xs text-neutral-600 font-medium">
              Restricted to authorized university staff, security personnel, and operations leads.
            </p>
          </div>

          {serverError && (
            <div className="p-3.5 rounded-xl bg-red-100 border-2 border-black text-xs font-bold text-red-700 flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-black uppercase">
                  Admin Email
                </label>
                {errors.email && (
                  <span className="text-[11px] font-bold text-red-600">
                    {errors.email}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="a.vance@campus.admin.edu"
                  className="input-tactile pl-9"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-black uppercase">
                  Master Password
                </label>
                {errors.password && (
                  <span className="text-[11px] font-bold text-red-600">
                    {errors.password}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  placeholder="••••••••••••"
                  className="input-tactile pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-tactile btn-tactile-black text-xs w-full py-3 shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000] disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating Clearance...' : 'Sign In as Administrator'}
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Demo Sign-in */}
          <div className="pt-4 border-t-2 border-black/15">
            <div className="text-[11px] font-bold text-neutral-600 mb-2 text-center uppercase tracking-wider">
              Evaluator / Demo Clearance
            </div>
            <button
              type="button"
              onClick={handleQuickAdminFill}
              className="w-full p-3 border-2 border-black rounded-2xl text-left bg-brand-yellow/30 hover:bg-brand-yellow/50 transition-colors flex items-center justify-between shadow-[2px_2px_0px_#000]"
            >
              <div>
                <div className="text-xs font-bold text-black">Dr. Arthur Vance (Administrator)</div>
                <div className="text-[11px] text-neutral-600 font-mono">a.vance@campus.admin.edu</div>
              </div>
              <span className="text-[11px] font-bold text-white bg-black px-2 py-1 rounded-full">
                Quick Fill
              </span>
            </button>
          </div>

          <div className="text-center text-xs text-neutral-700 pt-2 font-medium">
            Are you a student or campus member?{' '}
            <Link to="/login" className="font-bold text-brand-purple hover:underline">
              Standard Member Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
