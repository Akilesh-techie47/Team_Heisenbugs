import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';
import { ASSET_IMAGES } from '../data/mockData';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Validate form
  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Required field';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Invalid email address';
    }

    if (!password) {
      errs.password = 'Required field';
    } else if (password.length < 4) {
      errs.password = 'Password must be at least 4 characters';
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
      const res = await login(email, password);
      if (res.success) {
        const dest = location.state?.from?.pathname || '/home';
        navigate(dest);
      } else {
        setServerError(res.error || 'Incorrect email or password');
      }
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickUserFill = async () => {
    setEmail('alex.rivera@campus.edu');
    setPassword('password123');
    setIsSubmitting(true);
    const res = await login('alex.rivera@campus.edu', 'password123');
    setIsSubmitting(false);
    if (res.success) {
      navigate('/home');
    } else {
      setServerError(res.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch bg-white">
      {/* LEFT: Brand side (Purple/Pink/Blue Feastables vibe) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-purple text-white p-12 flex-col justify-between overflow-hidden border-r-[3px] border-black">
        {/* Decorative background shape */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-pink/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-brand-yellow/20 rounded-full blur-2xl pointer-events-none" />

        {/* Brand header */}
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
            Find it. Verify it. Bring it home.
          </div>
        </div>

        {/* Narrative in Dutch Morgan */}
        <div className="relative z-10 max-w-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-normal tracking-tight text-white leading-tight uppercase">
            FIND IT.
            <br />
            <span className="text-black bg-brand-yellow px-2 py-0.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] inline-block my-1">
              RETURN IT.
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-body">
            Over 1,200 lost belongings returned across campus. Secured by physical desk custody and single-use cryptographic OTP verification.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t-2 border-white/20 text-xs text-white/80 flex items-center justify-between font-body">
          <span>Campus Safety & Desk Certified</span>
          <span className="font-mono text-[11px] font-bold text-brand-yellow">256-bit Token Verification</span>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-3xl border-[2.5px] border-black shadow-[6px_6px_0px_#000]">
          <div>
            <h2 className="font-display text-3xl font-normal text-black uppercase tracking-tight">
              Sign In
            </h2>
            <p className="mt-1 text-xs text-neutral-600 font-medium">
              Manage your reports, track claim status, and verify handovers.
            </p>
          </div>

          {serverError && (
            <div className="p-3.5 rounded-xl bg-red-100 border-2 border-black text-xs font-bold text-red-700 flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{serverError}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 rounded-xl bg-brand-blue border-2 border-black text-xs font-bold text-black flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-black uppercase">
                  Email Address
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
                  placeholder="alex.rivera@campus.edu"
                  className="input-tactile pl-9"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-black uppercase">
                  Password
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
                  placeholder="••••••••"
                  className="input-tactile pl-9"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs font-medium">
              <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-2 border-black text-brand-purple focus:ring-brand-purple"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => setInfoMessage('Password reset instructions dispatched to your email.')}
                className="font-bold text-brand-purple hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-tactile btn-tactile-purple text-xs w-full py-3 shadow-[3px_3px_0px_#000] hover:shadow-[5px_5px_0px_#000] disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="pt-4 border-t-2 border-black/15">
            <div className="text-[11px] font-bold text-neutral-600 mb-2 text-center uppercase tracking-wider">
              Sample Student Account
            </div>
            <button
              type="button"
              onClick={handleQuickUserFill}
              className="w-full p-3 border-2 border-black rounded-2xl text-left bg-brand-lilac/30 hover:bg-brand-lilac/50 transition-colors flex items-center justify-between shadow-[2px_2px_0px_#000]"
            >
              <div>
                <div className="text-xs font-bold text-black">Alex Rivera (Student)</div>
                <div className="text-[11px] text-neutral-600">alex.rivera@campus.edu</div>
              </div>
              <span className="text-[11px] font-bold text-black bg-brand-yellow border border-black px-2 py-1 rounded-full shadow-[1px_1px_0px_#000]">
                Quick Fill
              </span>
            </button>
          </div>

          <div className="text-center text-xs text-neutral-700 space-y-2">
            <div>
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-brand-purple hover:underline">
                Create account
              </Link>
            </div>
            <div className="pt-2 border-t border-black/10 text-[11px] text-neutral-500">
              Campus Administrator?{' '}
              <Link to="/admin/login" className="font-bold text-black hover:underline">
                Access Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
