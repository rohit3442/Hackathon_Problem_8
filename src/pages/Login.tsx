import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ChevronDown, Check, AlertCircle, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';

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
    id: 'project_user',
    label: 'Project User',
    subtext: 'Enter & view project-level ESG data',
    defaultIdentifier: 'rajesh.verma@meil.in',
    corporateId: 'EMP-PU-1042',
    defaultPassword: 'Password@123'
  },
  {
    id: 'bu_manager',
    label: 'Business Manager',
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
    id: 'esg_team',
    label: 'ESG Team',
    subtext: 'Validate, audit & consolidate group data',
    defaultIdentifier: 'ananya.sen@meil.in',
    corporateId: 'EMP-ESG-4021',
    defaultPassword: 'Password@123'
  },
  {
    id: 'group_admin',
    label: 'Group Admin',
    subtext: 'Full group control access',
    defaultIdentifier: 'rekha.nair@meil.in',
    corporateId: 'EMP-GA-9001',
    defaultPassword: 'Password@123'
  },
  {
    id: 'management',
    label: 'Management',
    subtext: 'Executive summary dashboard & reports',
    defaultIdentifier: 'deepak.khaitan@meil.in',
    corporateId: 'EMP-EXEC-001',
    defaultPassword: 'Password@123'
  }
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Initialized to Group Admin & rekha.nair@meil.in as demonstrated in the specification screenshot
  const [selectedRole, setSelectedRole] = useState<UserRole>('group_admin');
  const [identifier, setIdentifier] = useState('rekha.nair@meil.in');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentialsHelper, setShowCredentialsHelper] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'ECO METRICS — ESG Portal Login';
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

  const activeRoleOption = ROLE_OPTIONS.find(r => r.id === selectedRole) || ROLE_OPTIONS[4];

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

    try {
      // 1. Attempt backend API authentication
      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: identifier.trim(),
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
      } catch (networkErr) {
        // If backend connection fails, proceed with client-side RBAC validation
        console.warn('Backend API offline, falling back to local RBAC verification');
      }

      // 2. Perform client-side verification and session storage
      const result = login(identifier.trim(), selectedRole, password);

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication rejected due to role mismatch.');
        setIsLoading(false);
        return;
      }

      // 3. Navigate to the designated separated role dashboard
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

  return (
    <div className="min-h-screen bg-[#060b08] text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none font-sans">
      {/* Background Subtle Cyber Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Centered Authentication Container */}
      <div className="w-full max-w-[480px] z-10 flex flex-col items-center">
        {/* Glowing Brand Title */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-[#00e676] drop-shadow-[0_0_20px_rgba(0,230,118,0.55)]">
            ECO METRICS
          </h1>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="w-full mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-3 shadow-lg animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-300">Authentication Alert</p>
              <p className="mt-0.5 leading-relaxed text-rose-200/90">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleLoginSubmit} className="w-full flex flex-col">
          {/* 1. ACCESS ROLE FIELD */}
          <div className="w-full relative" ref={dropdownRef}>
            <label className="block text-[11px] font-bold tracking-widest text-[#00e676] uppercase mb-2">
              ACCESS ROLE
            </label>

            {/* Role Trigger Box */}
            <div
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`w-full bg-[#08120d] border ${
                isRoleDropdownOpen ? 'border-[#00e676] ring-1 ring-[#00e676]/40' : 'border-emerald-600/50 hover:border-emerald-400/80'
              } rounded-lg px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all duration-150`}
            >
              <span className="text-sm font-medium text-slate-100">
                {activeRoleOption.label}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${
                  isRoleDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Helper Text below closed selector */}
            {!isRoleDropdownOpen && (
              <p className="text-[12px] text-emerald-400/80 mt-2 font-normal">
                {activeRoleOption.subtext}
              </p>
            )}

            {/* Custom Expanded Dropdown Menu (Screenshot 2 Match) */}
            {isRoleDropdownOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#06100b] border border-emerald-500/60 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-emerald-950/70 animate-in fade-in zoom-in-95 duration-100">
                {ROLE_OPTIONS.map((option) => {
                  const isSelected = option.id === selectedRole;
                  return (
                    <div
                      key={option.id}
                      onClick={() => handleRoleSelect(option)}
                      className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-emerald-950/60 text-white'
                          : 'hover:bg-emerald-900/30 text-slate-200'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className={`text-sm font-bold ${isSelected ? 'text-[#00e676]' : 'text-slate-100'}`}>
                          {option.label}
                        </span>
                        <span className="text-[11px] text-emerald-400/70 mt-0.5 font-normal">
                          {option.subtext}
                        </span>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-[#00e676] shrink-0 ml-3" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. IDENTIFIER FIELD */}
          <div className="w-full mt-6">
            <label className="block text-[11px] font-bold tracking-widest text-[#00e676] uppercase mb-2">
              IDENTIFIER
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="email@meil.in or Corporate ID"
              required
              className="w-full bg-[#08120d] border border-emerald-600/50 focus:border-[#00e676] focus:ring-1 focus:ring-[#00e676]/40 rounded-lg px-4 py-3.5 text-sm text-slate-100 placeholder-emerald-700/50 outline-none transition-all"
            />
          </div>

          {/* 3. PASSWORD FIELD */}
          <div className="w-full mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold tracking-widest text-[#00e676] uppercase">
                PASSWORD
              </label>
              <button
                type="button"
                onClick={() => alert(`Corporate Self-Service Reset: Inquiries for account '${identifier}' have been forwarded to Group IT (secops@meil.in).`)}
                className="text-[10px] font-bold tracking-wider text-emerald-400/90 hover:text-emerald-300 uppercase cursor-pointer"
              >
                FORGOT PASSWORD?
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
                placeholder="Enter corporate password"
                required
                className="w-full bg-[#08120d] border border-emerald-600/50 focus:border-[#00e676] focus:ring-1 focus:ring-[#00e676]/40 rounded-lg px-4 py-3.5 pr-14 text-sm text-slate-100 placeholder-emerald-700/50 outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black tracking-widest text-emerald-400 hover:text-emerald-300 uppercase cursor-pointer py-1 px-1.5"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {/* 4. SIGN IN BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 py-3.5 px-6 rounded-xl font-black text-sm tracking-wider uppercase text-black bg-[#00e676] hover:bg-[#00f59b] shadow-[0_0_28px_rgba(0,230,118,0.5)] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              'SIGN IN'
            )}
          </button>

          {/* 5. FOOTER LINK */}
          <div className="mt-8 text-center text-xs text-slate-400">
            <span>New to ECO Metrics? </span>
            <button
              type="button"
              onClick={() => alert('New corporate onboarding requires Enterprise Active Directory approval. Contact your Group Admin at rekha.nair@meil.in.')}
              className="text-[#00e676] font-semibold hover:underline cursor-pointer"
            >
              Create an account
            </button>
          </div>
        </form>

        {/* 6. CREDENTIALS & ROLE TEST CHEAT-SHEET */}
        <div className="w-full mt-8 pt-4 border-t border-emerald-950/60 text-center">
          <button
            type="button"
            onClick={() => setShowCredentialsHelper(!showCredentialsHelper)}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400/80 hover:text-emerald-300 font-medium py-1 px-3 rounded-full bg-emerald-950/40 border border-emerald-800/40 cursor-pointer transition-colors"
          >
            <KeyRound className="w-3 h-3 text-[#00e676]" />
            <span>{showCredentialsHelper ? 'Hide Quick Role Accounts' : 'Show Quick Role Accounts & IDs'}</span>
          </button>

          {showCredentialsHelper && (
            <div className="mt-3 p-3.5 rounded-xl bg-[#08120d]/90 border border-emerald-800/50 text-left text-xs space-y-2 animate-in fade-in duration-150">
              <p className="text-[11px] font-bold text-[#00e676] uppercase tracking-wider mb-2">
                Click any role below to prefill credentials & test role-specific dashboards:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleRoleSelect(opt)}
                    className="p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{opt.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono">
                        {opt.corporateId}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-400/80 font-mono truncate mt-0.5">
                      {opt.defaultIdentifier}
                    </p>
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                <span>Default Password: <span className="font-mono text-emerald-300">Password@123</span></span>
                <span className="text-emerald-400">Strict RBAC Enforced</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
