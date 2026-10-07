import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  LogOut,
  Building2,
  Mail,
  Shield,
  Briefcase,
  IdCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

interface TopHeaderProps {
  onMobileMenuClick: () => void;
  isCollapsed: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onMobileMenuClick,
  isCollapsed,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { 
    reportingYear, 
    setReportingYear, 
    reportingYearsList 
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'project_user': return { label: 'Project User', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'bu_manager': return { label: 'Project / BU Manager', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' };
      case 'subsidiary_admin': return { label: 'Subsidiary Admin', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' };
      case 'esg_team': return { label: 'Group ESG Team', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
      case 'group_admin': return { label: 'Group Admin', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
      case 'group_admin_management': return { label: 'Group Admin & Management', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
      case 'management': return { label: 'Executive Board', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
      default: return { label: 'Enterprise User', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  const badge = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-[#0a110e]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#192b23] px-4 sm:px-6 flex items-center justify-between gap-3 transition-colors">
      {/* Left Area: Mobile Hamburger & Reporting Period */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Reporting Year Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-[#141f1b] px-2.5 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-800 text-xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <select
            value={reportingYear}
            onChange={(e) => setReportingYear(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            {reportingYearsList.map(yr => (
              <option key={yr} value={yr} className="bg-white dark:bg-[#0a110e] text-slate-800 dark:text-slate-200">
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Area: Search, Notifications, Single Icon Theme Toggle, User Profile Icon */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search */}
        <div className="hidden xl:flex items-center relative w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search metric or BRSR rule..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notifications & Validation Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0a110e]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0f1714] border border-slate-200 dark:border-[#1c2e27] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications & Alerts</span>
                <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded">
                  2 Critical
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Outlier: Effluent BOD Concentration</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">
                    WWRP-02 reported 38.4 mg/L vs limit 30 mg/L. Action required.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">15 mins ago</span>
                </div>
                <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>BRSR Core Assurance Pack Ready</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">
                    DNV reasonable assurance completed for Principle 6 GHG metrics.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Yesterday</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Light / Dark Mode Toggle (Single animated Moon/Sun icon) */}
        <ThemeToggle />

        {/* User Profile Icon Button (NO photo, pure User icon with interactive Popover) */}
        <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            type="button"
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer group"
            title="View User Profile & Position"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400/60 dark:border-emerald-600/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shadow-xs group-hover:ring-2 group-hover:ring-emerald-400/50 transition-all">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left pr-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.name || 'Authorized User'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                {user?.roleTitle || 'Position'}
              </p>
            </div>
          </button>

          {/* Interactive User Details Popover */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0c1411] border border-slate-200 dark:border-[#1e332a] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header Info */}
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {user?.name || 'User Profile'}
                    </h4>
                  </div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {user?.roleTitle || 'ESG Specialist'}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Detail Attributes */}
              <div className="py-3 space-y-2.5 text-xs">
                {user?.corporateId && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <IdCard className="w-3.5 h-3.5 text-emerald-500" />
                      Corporate ID
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {user.corporateId}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-emerald-500" />
                    Email
                  </span>
                  <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                    {user?.email || 'user@meil.in'}
                  </span>
                </div>

                {user?.project && (
                  <div className="flex items-start justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                      Facility
                    </span>
                    <span className="font-medium text-[11px] text-slate-800 dark:text-slate-200 text-right truncate max-w-[150px]">
                      {user.project}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                    Organization
                  </span>
                  <span className="text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                    {user?.organization || 'MEIL Group'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    Status
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    Active & Authenticated
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
