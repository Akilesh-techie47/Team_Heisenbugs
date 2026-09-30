import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Shield,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  Sliders,
  Bell,
  Check,
  Building,
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, role, logout, isAuthenticated } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `text-xs sm:text-sm font-bold transition-all px-3 py-1.5 rounded-full whitespace-nowrap ${
      isActive
        ? 'bg-brand-yellow text-black border-2 border-black shadow-[2px_2px_0px_#000]'
        : 'text-neutral-800 hover:text-black hover:bg-brand-lilac/40'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-[2.5px] border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-4">
          <Link
            to={isAuthenticated ? (role === 'admin' ? '/admin' : '/home') : '/'}
            className="flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-xl group"
          >
            <span className="font-display text-2xl sm:text-3xl tracking-tight text-black group-hover:text-brand-purple transition-colors">
              LOSTFOUND
            </span>
            <span className="font-display text-2xl sm:text-3xl text-white bg-brand-purple border-2 border-black rounded-lg px-1.5 py-0 shadow-[2px_2px_0px_#000] rotate-3 group-hover:rotate-0 transition-transform">
              +
            </span>
            {role === 'admin' && (
              <span className="text-[10px] uppercase tracking-wider font-bold bg-brand-yellow text-black border border-black px-2 py-0.5 rounded-full shadow-[1.5px_1.5px_0px_#000] ml-1">
                Admin
              </span>
            )}
          </Link>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {isAuthenticated ? (
            role === 'admin' ? (
              <>
                <NavLink to="/admin" end className={navItemClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin?tab=pending" className={navItemClass}>
                  Pending
                </NavLink>
                <NavLink to="/admin?tab=claims" className={navItemClass}>
                  Claims
                </NavLink>
                <NavLink to="/admin?tab=lost" className={navItemClass}>
                  Lost
                </NavLink>
                <NavLink to="/admin?tab=found" className={navItemClass}>
                  Found
                </NavLink>
                <NavLink to="/admin?tab=recovery" className={navItemClass}>
                  Recovery
                </NavLink>
                <NavLink to="/admin?tab=users" className={navItemClass}>
                  Users
                </NavLink>
                <NavLink to="/admin?tab=analytics" className={navItemClass}>
                  Analytics
                </NavLink>
                <NavLink to="/admin?tab=audit" className={navItemClass}>
                  Audit
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/home" className={navItemClass}>
                  Home
                </NavLink>
                <NavLink to="/report" className={navItemClass}>
                  Report
                </NavLink>
                <NavLink to="/search" className={navItemClass}>
                  Search
                </NavLink>
                <NavLink to="/matches" className={navItemClass}>
                  Matches
                </NavLink>
                <NavLink to="/claims" className={navItemClass}>
                  Claims
                </NavLink>
                <NavLink to="/handover" className={navItemClass}>
                  Handover
                </NavLink>
                <NavLink to="/recovered" className={navItemClass}>
                  Recovered
                </NavLink>
              </>
            )
          ) : (
            <>
              <NavLink to="/" className={navItemClass}>
                Overview
              </NavLink>
              <NavLink to="/search" className={navItemClass}>
                Browse Items
              </NavLink>
              <NavLink to="/recovered" className={navItemClass}>
                Recovered
              </NavLink>
            </>
          )}
        </nav>

        {/* Zone 3: Notifications, Profile & Primary Actions */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative p-2 rounded-xl border-2 border-black bg-white hover:bg-brand-yellow/30 shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all text-black"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 stroke-[2.5]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-pink text-white text-[10px] font-bold rounded-full border border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div
                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setNotificationsOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b-2 border-black flex items-center justify-between bg-brand-lilac/30">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-black">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-brand-yellow text-black font-bold border border-black px-2 py-0.5 rounded-full">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="text-[11px] text-brand-purple hover:underline font-bold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 stroke-[3]" /> Mark read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-black/10">
                      {(notifications || []).length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationRead(notif.id);
                              if (notif.link) {
                                setNotificationsOpen(false);
                                navigate(notif.link);
                              }
                            }}
                            className={`p-3.5 hover:bg-brand-lilac/20 cursor-pointer transition-colors ${
                              !notif.read ? 'bg-brand-blue/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-black">{notif.title}</p>
                              {!notif.read && (
                                <span className="w-2.5 h-2.5 rounded-full bg-brand-pink border border-black shrink-0 mt-0.5" />
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-600 mt-1 leading-snug">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-neutral-500 mt-1.5 block font-mono font-medium">
                              {notif.createdAt ? notif.createdAt.replace('T', ' ').slice(0, 16) : 'Recently'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-neutral-500">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-brand-yellow/30 shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all text-left"
                  aria-expanded={profileDropdownOpen}
                >
                  <img
                    src={
                      currentUser?.avatar ||
                      `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.name || 'User'}`
                    }
                    alt={currentUser?.name || 'Avatar'}
                    className="w-7 h-7 rounded-full bg-brand-lilac object-cover border border-black"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-black truncate max-w-[100px]">
                      {currentUser?.name || 'Account'}
                    </div>
                    <div className="text-[10px] font-bold text-neutral-600 uppercase">
                      {role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-3 w-72 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b-2 border-black bg-brand-lilac/30">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-neutral-600 uppercase">Signed in as</p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-black ${
                            role === 'admin'
                              ? 'bg-brand-yellow text-black'
                              : 'bg-brand-purple text-white'
                          }`}
                        >
                          {role === 'admin' ? 'ADMINISTRATOR' : 'CAMPUS MEMBER'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-black truncate mt-1">
                        {currentUser?.name}
                      </p>
                      <p className="text-xs text-neutral-600 truncate font-mono">
                        {currentUser?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      {role === 'admin' ? (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-black hover:bg-brand-lilac/30"
                          >
                            <Shield className="w-4 h-4 text-brand-purple" />
                            Administrator Dashboard
                          </Link>
                          <Link
                            to="/admin?tab=analytics"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-neutral-700 hover:text-black hover:bg-brand-lilac/30"
                          >
                            <Building className="w-4 h-4 text-neutral-500" />
                            Custody Desks & Analytics
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/home"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-neutral-700 hover:text-black hover:bg-brand-lilac/30"
                          >
                            <User className="w-4 h-4 text-neutral-500" />
                            My Dashboard
                          </Link>
                          <Link
                            to="/claims"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-neutral-700 hover:text-black hover:bg-brand-lilac/30"
                          >
                            <CheckCircle2 className="w-4 h-4 text-neutral-500" />
                            My Claims & Recovery
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t-2 border-black pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-bold text-black hover:text-brand-purple transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn-tactile btn-tactile-purple text-xs px-4 py-1.5 shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000]"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border-2 border-black bg-white hover:bg-brand-yellow/30 shadow-[2px_2px_0px_#000]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-white px-4 pt-3 pb-5 space-y-2 shadow-hand-lg">
          {isAuthenticated ? (
            role === 'admin' ? (
              <>
                <div className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider px-1 pt-1">
                  Administrator Portal
                </div>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-black hover:text-brand-purple"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin?tab=pending"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-neutral-700 hover:text-black"
                >
                  Pending Requests
                </Link>
                <Link
                  to="/admin?tab=claims"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-neutral-700 hover:text-black"
                >
                  Claims & Decisions
                </Link>
                <Link
                  to="/admin?tab=lost"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-neutral-700 hover:text-black"
                >
                  Lost Reports
                </Link>
                <Link
                  to="/admin?tab=found"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-neutral-700 hover:text-black"
                >
                  Found Reports
                </Link>
                <Link
                  to="/admin?tab=recovery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-neutral-700 hover:text-black"
                >
                  Recovery Cases
                </Link>
                <Link
                  to="/admin?tab=users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-neutral-700 hover:text-black"
                >
                  Users Directory
                </Link>
                <Link
                  to="/admin?tab=analytics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-neutral-700 hover:text-black"
                >
                  Custody & Analytics
                </Link>
                <Link
                  to="/admin?tab=audit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-neutral-700 hover:text-black"
                >
                  Audit Trail
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-black hover:text-brand-purple"
                >
                  Home
                </Link>
                <Link
                  to="/report"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-black hover:text-brand-purple"
                >
                  Report Item
                </Link>
                <Link
                  to="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-black hover:text-brand-purple"
                >
                  Search & Browse
                </Link>
                <Link
                  to="/matches"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-black hover:text-brand-purple"
                >
                  Smart Matches
                </Link>
                <Link
                  to="/claims"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-black hover:text-brand-purple"
                >
                  Track Claims
                </Link>
                <Link
                  to="/handover"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-black hover:text-brand-purple"
                >
                  Handover Center
                </Link>
                <Link
                  to="/recovered"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-black hover:text-brand-purple"
                >
                  Recovered Stories
                </Link>
              </>
            )
          ) : (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-black"
              >
                Overview
              </Link>
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-black"
              >
                Browse Items
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-brand-purple"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-brand-purple"
              >
                Create Account
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold text-neutral-600"
              >
                Administrator Portal
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
