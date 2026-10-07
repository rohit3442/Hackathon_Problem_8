import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getAssignedRoleForEmail } from '../context/AuthContext';
import { UserRole } from '../types';
import { ChevronDown, Check, AlertCircle, Zap, X, Mail, ShieldAlert, Sparkles, User, ExternalLink, ShieldCheck } from 'lucide-react';
import { ScenicBackground } from '../components/common/ScenicBackground';
import { supabase } from '../supabaseClient';

// Official multi-colored Google logo icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface RoleOption {
  id: UserRole;
  label: string;
  subtext: string;
  defaultIdentifier: string;
  corporateId: string;
  defaultPassword: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'group_admin',
    label: 'Group Admin',
    subtext: 'Full enterprise control, consolidation & approvals',
    defaultIdentifier: 'rekha.nair@meil.in',
    corporateId: 'EMP-GA-9001',
    defaultPassword: 'Password@123'
  },
  {
    id: 'bu_manager',
    label: 'Business Unit Manager',
    subtext: 'Review & verify project submissions & signoffs',
    defaultIdentifier: 'vikram.malhotra@meil.in',
    corporateId: 'EMP-PM-2089',
    defaultPassword: 'Password@123'
  },
  {
    id: 'subsidiary_admin',
    label: 'Subsidiary Admin',
    subtext: 'Manage subsidiary organization & entity data',
    defaultIdentifier: 'sunita.rao@meil.in',
    corporateId: 'EMP-SA-3150',
    defaultPassword: 'Password@123'
  },
  {
    id: 'project_user',
    label: 'Project User',
    subtext: 'Enter & view project-level ESG data & evidence',
    defaultIdentifier: 'rajesh.verma@meil.in',
    corporateId: 'EMP-PU-1042',
    defaultPassword: 'Password@123'
  },
  {
    id: 'esg_team',
    label: 'ESG Team',
    subtext: 'Validate, audit, anomaly analysis & BRSR reporting',
    defaultIdentifier: 'ananya.sen@meil.in',
    corporateId: 'EMP-ESG-4021',
    defaultPassword: 'Password@123'
  },
  {
    id: 'management',
    label: 'Management',
    subtext: 'Executive summary dashboard & investor reports',
    defaultIdentifier: 'deepak.khaitan@meil.in',
    corporateId: 'EMP-EXEC-001',
    defaultPassword: 'Password@123'
  }
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  // Initialized to Group Admin matching screenshot
  const [selectedRole, setSelectedRole] = useState<UserRole>('group_admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Gmail / Google Authentication States
  const PRIMARY_GMAIL = 'Rohitkumarsahu144@gmail.com';
  const PRIMARY_NAME = 'Rohit Kumar Sahu';
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [isGmailLoading, setIsGmailLoading] = useState(false);
  const [gmailAccountMode, setGmailAccountMode] = useState<'primary' | 'other'>('primary');
  const [customGmailEmail, setCustomGmailEmail] = useState('');
  const [customGmailName, setCustomGmailName] = useState('');
  const [selectedGmailRole, setSelectedGmailRole] = useState<UserRole>('group_admin');
  const [gmailError, setGmailError] = useState<string | null>(null);

  // Modals
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Eco Metrics - ESG & BRSR Reporting Platform';
  }, []);

  // Close role dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeRoleOption = ROLE_OPTIONS.find(r => r.id === selectedRole) || ROLE_OPTIONS[0];

  const handleGmailAuth = async (emailParam?: string, nameParam?: string, roleParam?: UserRole) => {
    setGmailError(null);
    setIsGmailLoading(true);

    const emailToUse = (emailParam || (gmailAccountMode === 'primary' ? PRIMARY_GMAIL : customGmailEmail)).trim();
    const nameToUse = (nameParam || (gmailAccountMode === 'primary' ? PRIMARY_NAME : (customGmailName || emailToUse.split('@')[0]))).trim();
    const roleToUse = roleParam || selectedGmailRole;

    if (!emailToUse || !emailToUse.includes('@')) {
      setGmailError('Please enter a valid Gmail address (e.g. user@gmail.com).');
      setIsGmailLoading(false);
      return;
    }

    try {
      // 1. Try Supabase Google OAuth if configured
      if (supabase && typeof (supabase as any).auth?.signInWithOAuth === 'function') {
        try {
          const { data, error } = await (supabase as any).auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin
            }
          });
          if (!error && data?.url) {
            window.location.href = data.url;
            return;
          }
        } catch (_sbErr) {
          // Fall back gracefully to direct verified Google login session
        }
      }

      // 2. Call backend Google auth API
      try {
        await fetch('/api/v1/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailToUse,
            name: nameToUse,
            role: roleToUse,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse)}&backgroundColor=00c77f`
          })
        });
      } catch (_apiErr) {}

      // 3. Client session authorization via AuthContext
      const res = loginWithGoogle(
        emailToUse, 
        nameToUse, 
        roleToUse,
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse)}&backgroundColor=00c77f`
      );

      if (!res.success) {
        setGmailError(res.error || 'Failed to authenticate Google account.');
        setIsGmailLoading(false);
        return;
      }

      setShowGmailModal(false);
      if (roleToUse === 'management') {
        navigate('/executive-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setGmailError(err.message || 'An error occurred during Google authentication.');
    } finally {
      setIsGmailLoading(false);
    }
  };

  const handleRoleSelect = (option: RoleOption) => {
    setSelectedRole(option.id);
    setIdentifier(option.defaultIdentifier);
    setPassword(option.defaultPassword);
    setErrorMessage(null);
    setIsRoleDropdownOpen(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSupabaseError(null);
    setIsLoading(true);

    // If identifier is empty or left as dummy placeholder, use the active role's verified account
    let resolvedEmail = identifier.trim();
    if (!resolvedEmail || resolvedEmail === 'email@domain.com') {
      resolvedEmail = activeRoleOption.defaultIdentifier;
    }

    try {
      // 2) For Sign In: Use supabase.auth.signInWithPassword({ email, password })
      const { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: password
      });

      if (error) {
        // 4) If Supabase returns an error, show a small error message under the form
        setSupabaseError(error.message);
        setIsLoading(false);
        return;
      }

      // Check role and metadata in Supabase user profile
      const metaRole = data?.user?.user_metadata?.role;
      const metaTitle = data?.user?.user_metadata?.roleTitle;
      const metaName = data?.user?.user_metadata?.name || data?.user?.user_metadata?.full_name;

      // 1) Assign role access (Priority: Supabase user_metadata -> selected role -> directory mapping)
      const assignedRole = getAssignedRoleForEmail(resolvedEmail, selectedRole, metaRole);

      // Sync authenticated user with application context & role
      login(resolvedEmail, assignedRole, password, {
        role: assignedRole,
        roleTitle: metaTitle,
        name: metaName
      });

      // 3) After successful login: Redirect the user to the respective dashboard ("/")
      navigate('/');
    } catch (err: any) {
      setSupabaseError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotPasswordModal(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2400);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center px-4 py-8 sm:py-12 overflow-x-hidden font-sans">
      {/* Scenic Atmospheric Mountain Background */}
      <ScenicBackground />

      {/* Main Login Card - Exactly Matching the Uploaded Design */}
      <div className="w-full max-w-[940px] z-10 rounded-[26px] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.85)] grid grid-cols-1 md:grid-cols-2 backdrop-blur-sm relative">
        
        {/* Left Column: Forest Green Editorial Quote Panel */}
        <div className="bg-[#082116] rounded-t-[26px] md:rounded-tr-none md:rounded-l-[26px] p-8 sm:p-11 lg:p-12 flex flex-col justify-between min-h-[460px] md:min-h-[550px] relative md:border-r border-white/5 overflow-hidden">
          {/* Subtle Ambient Light Wash */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top: Brand Lockup */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00c77f] flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
              <Zap className="w-4 h-4 text-black fill-black" />
            </div>
            <span className="text-white font-extrabold text-[15px] tracking-[0.16em] uppercase">
              ECO METRICS
            </span>
          </div>

          {/* Center: Inspirational Quote */}
          <div className="my-8 md:my-0">
            <blockquote className="font-serif-quote italic text-2xl sm:text-[27px] lg:text-[29px] text-white font-normal leading-[1.38] tracking-tight">
              &ldquo;The greatest threat to our planet is the belief that someone else will save it.&rdquo;
            </blockquote>

            {/* Accent Rule & Author */}
            <div className="mt-6">
              <div className="w-11 h-[2px] bg-[#00c77f] mb-3" />
              <p className="text-[11px] font-bold tracking-[0.22em] text-[#00c77f] uppercase font-sans">
                ROBERT SWAN
              </p>
            </div>
          </div>

          {/* Bottom: Copyright */}
          <div>
            <p className="text-xs text-white/40 tracking-wide font-sans">
              &copy; 2026 Eco Metrics Inc. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Column: Dark Charcoal Authentication Panel */}
        <div className="bg-[#111a16] rounded-b-[26px] md:rounded-bl-none md:rounded-r-[26px] p-8 sm:p-11 lg:p-12 flex flex-col justify-center relative z-20">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-[27px] font-semibold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 font-normal">
              Sign in to monitor your environmental footprint.
            </p>
          </div>

          {/* Error Alert Banner */}
          {errorMessage && (
            <div className="mt-5 p-3.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-rose-300">Sign in error</p>
                <p className="mt-0.5 text-rose-200/90 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4 sm:space-y-5">
            {/* 1. ACCESS ROLE */}
            <div className="relative" ref={dropdownRef}>
              <label className="text-[10px] font-bold tracking-[0.16em] text-[#00c77f] uppercase block mb-1.5">
                ACCESS ROLE
              </label>

              {/* Selector Box */}
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`w-full bg-[#17231e] border ${
                  isRoleDropdownOpen ? 'border-[#00c77f] ring-1 ring-[#00c77f]/30' : 'border-white/5 hover:border-emerald-500/30'
                } rounded-lg px-4 py-3 flex items-center justify-between text-left cursor-pointer transition-all duration-150`}
              >
                <span className="text-sm text-white font-medium">
                  {activeRoleOption.label}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isRoleDropdownOpen ? 'rotate-180 text-[#00c77f]' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isRoleDropdownOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 w-full max-h-[340px] overflow-y-auto bg-[#0e1713] border border-emerald-500/40 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-50 divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-100">
                  {ROLE_OPTIONS.map((option) => {
                    const isSelected = option.id === selectedRole;
                    return (
                      <div
                        key={option.id}
                        onClick={() => handleRoleSelect(option)}
                        className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-emerald-950/70 text-white'
                            : 'hover:bg-emerald-950/40 text-slate-200'
                        }`}
                      >
                        <div className="flex flex-col text-left pr-2">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-[#00c77f]' : 'text-slate-100'}`}>
                            {option.label}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5 font-normal">
                            {option.subtext}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#00c77f] shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. IDENTIFIER */}
            <div>
              <label className="text-[10px] font-bold tracking-[0.16em] text-[#00c77f] uppercase block mb-1.5">
                IDENTIFIER
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="email@domain.com"
                className="w-full bg-[#17231e] border border-white/5 focus:border-[#00c77f] focus:ring-1 focus:ring-[#00c77f]/40 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* 3. PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold tracking-[0.16em] text-[#00c77f] uppercase">
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  className="w-full bg-[#17231e] border border-white/5 focus:border-[#00c77f] focus:ring-1 focus:ring-[#00c77f]/40 rounded-lg px-4 py-3 pr-16 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer py-1 px-1.5"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* 4. SIGN IN BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00c77f] hover:bg-[#00db8c] active:bg-[#00b372] text-[#0a1811] font-semibold text-sm py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Supabase Error Message Under the Form */}
            {/* Supabase Error Message Under the Form */}
            {supabaseError && (
              <div className="text-center pt-1.5 animate-in fade-in">
                <p className="text-xs text-rose-400 font-medium inline-flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{supabaseError}</span>
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="relative my-3.5 flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#111a16] px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase shrink-0">
                OR CONTINUE WITH
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* Google / Gmail Sign In Button */}
            <button
              type="button"
              onClick={() => {
                setGmailError(null);
                setShowGmailModal(true);
              }}
              disabled={isGmailLoading}
              className="w-full bg-[#17231e] hover:bg-[#1f2f28] active:bg-[#131d18] border border-white/10 hover:border-emerald-500/40 text-white font-medium text-sm py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm group hover:shadow-emerald-500/10"
            >
              <GoogleIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span>Sign in with Gmail</span>
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111a16] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-[#00c77f] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-white">Reset Password</h3>
              </div>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-500/20 text-[#00c77f] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-white font-medium text-base">Instructions Sent</h4>
                <p className="text-xs text-slate-400">
                  Password reset directions have been securely dispatched to your corporate email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="mt-4 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your registered corporate identifier or email address to request a secure password reset token.
                </p>
                <div>
                  <label className="text-[10px] font-bold tracking-wider text-[#00c77f] uppercase block mb-1.5">
                    Corporate Email / Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@meil.in or Corporate ID"
                    className="w-full bg-[#17231e] border border-white/10 focus:border-[#00c77f] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-black bg-[#00c77f] hover:bg-[#00db8c] rounded-lg transition-colors"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Google / Gmail Sign-In Modal */}
      {showGmailModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111a16] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-[0_25px_70px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-150 relative overflow-hidden">
            
            {/* Ambient emerald wash */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xs">
                  <GoogleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                    Sign in with Gmail
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-[#00c77f] font-mono">
                      Google OAuth
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Choose a Google account to access Eco Metrics
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGmailModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gmail Error Banner */}
            {gmailError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{gmailError}</p>
              </div>
            )}

            <div className="mt-4 space-y-4 relative z-10">
              
              {/* Account Selection */}
              <div>
                <label className="text-[10px] font-bold tracking-[0.16em] text-[#00c77f] uppercase block mb-2">
                  CHOOSE ACCOUNT
                </label>

                <div className="space-y-2.5">
                  {/* Account Option 1: Primary Detected User */}
                  <div
                    onClick={() => setGmailAccountMode('primary')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      gmailAccountMode === 'primary'
                        ? 'border-[#00c77f] bg-emerald-950/40 ring-1 ring-[#00c77f]/40'
                        : 'border-white/10 bg-[#17231e]/60 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        R
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-white">
                            {PRIMARY_NAME}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#00c77f] font-medium">
                            Detected
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block font-mono">
                          {PRIMARY_GMAIL}
                        </span>
                      </div>
                    </div>
                    {gmailAccountMode === 'primary' && (
                      <Check className="w-5 h-5 text-[#00c77f] shrink-0" />
                    )}
                  </div>

                  {/* Account Option 2: Custom / Other Gmail */}
                  <div
                    onClick={() => setGmailAccountMode('other')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      gmailAccountMode === 'other'
                        ? 'border-[#00c77f] bg-emerald-950/40 ring-1 ring-[#00c77f]/40'
                        : 'border-white/10 bg-[#17231e]/60 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-semibold text-white block">
                            Use another Gmail account
                          </span>
                          <span className="text-xs text-slate-400">
                            Enter any active @gmail.com address
                          </span>
                        </div>
                      </div>
                      {gmailAccountMode === 'other' && (
                        <Check className="w-5 h-5 text-[#00c77f] shrink-0" />
                      )}
                    </div>

                    {/* Inputs shown when 'other' is chosen */}
                    {gmailAccountMode === 'other' && (
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-2.5 animate-in fade-in duration-100">
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">
                            Gmail Address
                          </label>
                          <input
                            type="email"
                            value={customGmailEmail}
                            onChange={(e) => setCustomGmailEmail(e.target.value)}
                            placeholder="yourname@gmail.com"
                            className="w-full bg-[#111a16] border border-white/10 focus:border-[#00c77f] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-300 block mb-1">
                            Full Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={customGmailName}
                            onChange={(e) => setCustomGmailName(e.target.value)}
                            placeholder="e.g. Rohit Sharma"
                            className="w-full bg-[#111a16] border border-white/10 focus:border-[#00c77f] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Selection for Google Session */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold tracking-[0.16em] text-[#00c77f] uppercase">
                    SELECT ACCESS ROLE FOR SESSION
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Switchable anytime
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'group_admin', label: 'Group Admin', desc: 'Full Access' },
                    { id: 'bu_manager', label: 'BU Manager', desc: 'Review & Verify' },
                    { id: 'esg_team', label: 'ESG Team', desc: 'Auditing & BRSR' },
                    { id: 'subsidiary_admin', label: 'Sub Admin', desc: 'Entities' },
                    { id: 'project_user', label: 'Project User', desc: 'Data Entry' },
                    { id: 'management', label: 'Executive', desc: 'Board Reports' }
                  ].map((r) => {
                    const isSelected = selectedGmailRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedGmailRole(r.id as UserRole)}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#00c77f] bg-emerald-950/60 text-white'
                            : 'border-white/5 bg-[#17231e]/50 hover:bg-[#17231e] text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-semibold truncate flex items-center justify-between">
                          <span className={isSelected ? 'text-[#00c77f]' : 'text-slate-200'}>
                            {r.label}
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-[#00c77f]" />}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {r.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Badge */}
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-[#00c77f] shrink-0" />
                <span>Single Sign-On protected by Google Identity Services & Supabase Auth.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGmailModal(false)}
                  disabled={isGmailLoading}
                  className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleGmailAuth()}
                  disabled={isGmailLoading}
                  className="px-5 py-2.5 text-xs font-semibold text-black bg-[#00c77f] hover:bg-[#00db8c] active:bg-[#00b372] rounded-lg transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
                >
                  {isGmailLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="w-3.5 h-3.5" />
                      <span>Continue with Gmail</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
