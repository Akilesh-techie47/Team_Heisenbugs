import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, User, Building, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { ASSET_IMAGES } from '../data/mockData';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: 'Undergraduate Sciences',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email format';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      errs.agreeTerms = 'You must agree to campus recovery terms';
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
      const res = await register(formData);
      if (res.success) {
        navigate('/home');
      } else {
        setServerError(res.error || 'Failed to create account');
      }
    } catch (err) {
      setServerError('An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch bg-white">
      {/* Left Brand Area */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-brand-purple text-white p-12 flex-col justify-between overflow-hidden border-r-[3px] border-black">
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
            Campus Trust Network
          </div>
        </div>

        <div className="relative z-10 space-y-5 max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>

          <h3 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-white uppercase leading-tight">
            JOIN THE VERIFIED NETWORK OF FINDERS & OWNERS.
          </h3>

          <ul className="space-y-3 text-xs text-white/90 font-medium">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-green text-black border border-black flex items-center justify-center shrink-0 font-bold">✓</span>
              Automated smart candidate match notifications
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-green text-black border border-black flex items-center justify-center shrink-0 font-bold">✓</span>
              Secure custody drop-off at library & security desks
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-green text-black border border-black flex items-center justify-center shrink-0 font-bold">✓</span>
              Cryptographic OTP verification for handovers
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-xs text-white/70 font-mono">
          Protected by university student ID verification protocol.
        </div>
      </div>

      {/* Right Form Area */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-lg space-y-6 bg-white p-8 sm:p-10 rounded-3xl border-[2.5px] border-black shadow-[6px_6px_0px_#000]">
          <div>
            <h2 className="font-display text-3xl font-normal text-black uppercase tracking-tight">
              Create Account
            </h2>
            <p className="mt-1 text-xs text-neutral-600 font-medium">
              Get real-time updates when lost belongings match your profile.
            </p>
          </div>

          {serverError && (
            <div className="p-3.5 rounded-xl bg-red-100 border-2 border-black text-xs font-bold text-red-700 flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-black uppercase">
                  Full Name
                </label>
                {errors.fullName && (
                  <span className="text-[11px] font-bold text-red-600">
                    {errors.fullName}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  placeholder="e.g. Jordan Lee"
                  className="input-tactile pl-9"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-black uppercase">
                  Campus / Personal Email
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
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="jordan.lee@campus.edu"
                  className="input-tactile pl-9"
                />
              </div>
            </div>

            {/* Affiliation / Department & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-black mb-1 uppercase">
                  Department / Major
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Computer Science"
                    className="input-tactile pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1 uppercase">
                  Campus Member Status
                </label>
                <input
                  type="text"
                  disabled
                  value="Student / Campus Member"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border-2 border-black bg-neutral-100 text-neutral-600 cursor-not-allowed font-bold"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-black uppercase">
                    Password
                  </label>
                  {errors.password && (
                    <span className="text-[10px] font-bold text-red-600">
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
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    placeholder="••••••••"
                    className="input-tactile pl-9"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-black uppercase">
                    Confirm Password
                  </label>
                  {errors.confirmPassword && (
                    <span className="text-[10px] font-bold text-red-600">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    placeholder="••••••••"
                    className="input-tactile pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-neutral-700 font-medium">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => {
                    setFormData({ ...formData, agreeTerms: e.target.checked });
                    if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: '' });
                  }}
                  className="mt-0.5 rounded border-2 border-black text-brand-purple focus:ring-brand-purple"
                />
                <span>
                  I agree to the LostFound+ Campus Integrity Honor Code and accept terms regarding honest reporting and identity verification.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-[11px] font-bold text-red-600">
                  {errors.agreeTerms}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-tactile btn-tactile-purple text-xs w-full py-3 shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000] disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          <div className="text-center text-xs text-neutral-700">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-purple hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
