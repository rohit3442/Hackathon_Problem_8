import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MOCK_USERS } from '../../services/mockData';
import { Shield, ChevronDown, Check, UserCheck } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    setIsOpen(false);
  };

  const rolesList: { role: UserRole; title: string; desc: string; userName: string }[] = [
    { role: 'project_user', title: 'Project User', desc: 'Enter project ESG data & evidence', userName: 'Rajesh Verma' },
    { role: 'bu_manager', title: 'BU Manager', desc: 'Review submissions & request corrections', userName: 'Vikram Malhotra' },
    { role: 'subsidiary_admin', title: 'Subsidiary Admin', desc: 'Consolidate & subsidiary approval', userName: 'Sunita Rao' },
    { role: 'esg_team', title: 'ESG / Sustainability Team', desc: 'Validate metrics & manage BRSR / SDGs', userName: 'Dr. Ananya Sen' },
    { role: 'group_admin', title: 'Group Admin', desc: 'Enterprise consolidation & governance', userName: 'Arvind Mehra' },
    { role: 'management', title: 'Management', desc: 'Executive KPI board & final reports', userName: 'Priya Nair / Deepak Khaitan' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/90 dark:border-emerald-800/60 rounded-lg text-xs transition-colors cursor-pointer"
        title="Switch persona to test role-based behavior"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="hidden sm:inline font-semibold text-emerald-900 dark:text-emerald-200">
          Role: <span className="font-bold underline decoration-emerald-500/50">{user?.roleTitle || 'ESG Lead'}</span>
        </span>
        <span className="sm:hidden font-semibold text-emerald-900 dark:text-emerald-200">
          {user?.role.replace('_', ' ')}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0f1714] border border-slate-200 dark:border-[#1c2e27] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Switch User Persona (6 Enterprise Roles)
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
            {rolesList.map(item => {
              const isSelected = user?.role === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => handleRoleSwitch(item.role)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors ${
                    isSelected ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isSelected ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      {item.userName}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
