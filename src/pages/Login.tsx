import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ChevronDown, Check, AlertCircle, Zap, X, Mail, ShieldAlert } from 'lucide-react';
import { ScenicBackground } from '../components/common/ScenicBackground';

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
    id: 'subsidiary_admin',
    label: 'Subsidiary Admin',
    subtext: 'Manage subsidiary organization & entity data',
    defaultIdentifier: 'sunita.rao@meil.in',
    corporateId: 'EMP-SA-3150',
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
  const { login } = useAuth();

  // Initialized to Group Admin matching screenshot
  const [selectedRole, setSelectedRole] = useState<UserRole>('group_admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    department: '',
    requestedRole: 'project_user'
  });

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
    setIsLoading(true);

    // If identifier is empty or left as dummy placeholder, use the active role's verified account
    let resolvedIdentifier = identifier.trim();
    if (!resolvedIdentifier || resolvedIdentifier === 'email@domain.com') {
      resolvedIdentifier = activeRoleOption.defaultIdentifier;
    }

    try {
      // 1. Attempt backend API authentication
      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: resolvedIdentifier,
            role: selectedRole,
            password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.error || 'Authentication failed. Please verify credentials.');
          setIsLoading(false);
          return;
        }
      } catch (_networkErr) {
        console.warn('Backend API connection notice, proceeding with local RBAC verification');
      }

      // 2. Perform client-side verification and session storage
      const result = login(resolvedIdentifier, selectedRole, password);

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication rejected due to role mismatch.');
        setIsLoading(false);
        return;
      }

      // 3. Navigate to designated role dashboard
      if (selectedRole === 'management') {
        navigate('/executive-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
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

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterSuccess(true);
    setTimeout(() => {
      setShowRegisterModal(false);
      setRegisterSuccess(false);
      setRegisterForm({ name: '', email: '', department: '', requestedRole: 'project_user' });
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

            {/* 5. FOOTER */}
            <div className="text-center text-xs text-slate-400 pt-2">
              <span>New to ECO Metrics? </span>
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="text-[#00c77f] hover:underline font-medium cursor-pointer"
              >
                Create an account
              </button>
            </div>
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

      {/* Create Account Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111a16] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-[#00c77f] flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-white">Create Enterprise Account</h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {registerSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-500/20 text-[#00c77f] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-white font-medium text-base">Request Submitted</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your access request has been routed to the Group Admin and IT Directory for security provisioning.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5">
                <p className="text-xs text-slate-400">
                  Eco Metrics enforces enterprise RBAC. New registrations require Active Directory verification.
                </p>
                <div>
                  <label className="text-[10px] font-bold tracking-wider text-[#00c77f] uppercase block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-[#17231e] border border-white/10 focus:border-[#00c77f] rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-wider text-[#00c77f] uppercase block mb-1">
                    Corporate Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="priya.sharma@meil.in"
                    className="w-full bg-[#17231e] border border-white/10 focus:border-[#00c77f] rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-[#00c77f] uppercase block mb-1">
                      Department / Business Unit
                    </label>
                    <input
                      type="text"
                      required
                      value={registerForm.department}
                      onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                      placeholder="Solar Energy BU"
                      className="w-full bg-[#17231e] border border-white/10 focus:border-[#00c77f] rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-[#00c77f] uppercase block mb-1">
                      Target Role
                    </label>
                    <select
                      value={registerForm.requestedRole}
                      onChange={(e) => setRegisterForm({ ...registerForm, requestedRole: e.target.value })}
                      className="w-full bg-[#17231e] border border-white/10 focus:border-[#00c77f] rounded-lg px-3.5 py-2 text-sm text-white outline-none cursor-pointer"
                    >
                      <option value="project_user">Project User</option>
                      <option value="bu_manager">Business Unit Manager</option>
                      <option value="subsidiary_admin">Subsidiary Admin</option>
                      <option value="esg_team">ESG Team</option>
                      <option value="group_admin">Group Admin</option>
                      <option value="management">Management</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-black bg-[#00c77f] hover:bg-[#00db8c] rounded-lg transition-colors"
                  >
                    Request Corporate Access
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
