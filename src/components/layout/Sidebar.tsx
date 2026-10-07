import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  FolderKanban, 
  Database, 
  Leaf, 
  Users, 
  Scale, 
  FileCheck2, 
  CheckCircle, 
  BarChart3, 
  Globe2, 
  FileText, 
  History, 
  UserCog, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  TreeDeciduous,
  FileSpreadsheet,
  Upload,
  Layers,
  Bell,
  CheckCircle2,
  Award,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  indent?: boolean;
  alertCount?: number;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleAiAssistant } = useApp();

  const role = user?.role || 'project_user';

  // Role-Specific Navigation as mandated by Section 5 of the Master Specification
  const getNavGroupsForRole = (): NavGroup[] => {
    switch (role) {
      case 'project_user':
        return [
          {
            title: 'PROJECT USER PORTAL',
            items: [
              { name: 'Project Dashboard', path: '/dashboard', icon: LayoutDashboard },
              { name: 'My Projects', path: '/projects', icon: FolderKanban },
              { name: 'Project Solar Apex', path: '/projects/proj-1/overview', icon: Building2, indent: true },
              { name: 'Environmental Data', path: '/projects/proj-1/esg/environmental', icon: Leaf, indent: true },
              { name: 'Social Data', path: '/projects/proj-1/esg/social', icon: Users, indent: true },
              { name: 'Governance Data', path: '/projects/proj-1/esg/governance', icon: Scale, indent: true },
              { name: 'Documents', path: '/projects/proj-1/documents', icon: Upload, indent: true },
              { name: 'Validation & AI', path: '/projects/proj-1/validation', icon: Sparkles, indent: true },
              { name: 'Submissions', path: '/projects/proj-1/submissions', icon: CheckCircle, indent: true, badge: 'Submit' },
              { name: 'Correction Requests', path: '/correction-requests', icon: AlertTriangle, badge: 'Issues' },
            ],
          },
        ];

      case 'bu_manager':
        return [
          {
            title: 'BU OPERATIONS',
            items: [
              { name: 'BU Dashboard', path: '/dashboard', icon: LayoutDashboard },
              { name: 'Projects', path: '/projects', icon: FolderKanban },
              { name: 'Review Center', path: '/review-center', icon: FileCheck2, badge: 'Active' },
              { name: 'Correction Requests', path: '/correction-requests', icon: AlertTriangle, badge: 'Review' },
              { name: 'Approvals', path: '/approvals', icon: CheckCircle },
              { name: 'BU Analytics', path: '/analytics', icon: BarChart3 },
            ],
          },
        ];

      case 'subsidiary_admin':
        return [
          {
            title: 'SUBSIDIARY COMMAND',
            items: [
              { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
              { name: 'Organization', path: '/organization', icon: Building2 },
              { name: 'Business Units', path: '/business-units', icon: Layers },
              { name: 'Projects', path: '/projects', icon: FolderKanban },
              { name: 'Review Center', path: '/review-center', icon: FileCheck2 },
              { name: 'Correction Requests', path: '/correction-requests', icon: AlertTriangle },
              { name: 'Approvals & Signoff', path: '/approvals', icon: CheckCircle },
              { name: 'ESG Monitoring', path: '/analytics', icon: Database },
              { name: 'Reports', path: '/reports', icon: FileText },
            ],
          },
        ];

      case 'esg_team':
        return [
          {
            title: 'ESG CONTROL CENTER',
            items: [
              { name: 'ESG Control Center', path: '/dashboard', icon: LayoutDashboard },
              { name: 'Review Center', path: '/review-center', icon: FileCheck2 },
              { name: 'Correction Requests', path: '/correction-requests', icon: AlertTriangle },
              { name: 'Validation & AI', path: '/validation', icon: ShieldAlert, alertCount: 2 },
              { name: 'BRSR Section A (General)', path: '/brsr/section-a', icon: FileSpreadsheet, indent: true },
              { name: 'BRSR Section B (Process)', path: '/brsr/section-b', icon: FileSpreadsheet, indent: true },
              { name: 'BRSR Section C (P1-P9)', path: '/brsr/section-c', icon: FileSpreadsheet, indent: true, badge: 'P1-P9' },
              { name: 'SDG Mapping', path: '/sdg-mapping', icon: Globe2 },
              { name: 'Analytics', path: '/analytics', icon: BarChart3 },
              { name: 'Reports', path: '/reports', icon: FileText },
              { name: 'Audit Trail', path: '/audit-trail', icon: History },
            ],
          },
        ];

      case 'group_admin':
      case 'group_admin_management':
        return [
          {
            title: 'ENTERPRISE GOVERNANCE',
            items: [
              { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
              { name: 'Organization', path: '/organization', icon: Building2 },
              { name: 'Subsidiaries', path: '/subsidiaries', icon: Layers },
              { name: 'Business Units', path: '/business-units', icon: Building2 },
              { name: 'Projects', path: '/projects', icon: FolderKanban },
              { name: 'Review Center', path: '/review-center', icon: FileCheck2 },
              { name: 'Correction Requests', path: '/correction-requests', icon: AlertTriangle },
              { name: 'ESG Monitoring', path: '/analytics', icon: Database },
              { name: 'BRSR', path: '/brsr', icon: FileSpreadsheet },
              { name: 'Approvals', path: '/approvals', icon: CheckCircle },
              { name: 'Reports', path: '/reports', icon: FileText },
              { name: 'Users & Roles', path: '/users', icon: UserCog },
              { name: 'Audit Trail', path: '/audit-trail', icon: History },
              { name: 'Settings', path: '/settings', icon: Settings },
            ],
          },
        ];

      case 'management':
        return [
          {
            title: 'EXECUTIVE SUITE',
            items: [
              { name: 'Executive Dashboard', path: '/executive-dashboard', icon: Award },
              { name: 'ESG Analytics', path: '/analytics', icon: BarChart3 },
              { name: 'BRSR Status', path: '/brsr', icon: FileSpreadsheet },
              { name: 'Final Reports', path: '/reports', icon: FileText },
            ],
          },
        ];

      default:
        return [
          {
            title: 'CORE PLATFORM',
            items: [
              { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
              { name: 'Organization', path: '/organization', icon: Building2 },
              { name: 'Projects', path: '/projects', icon: FolderKanban },
            ],
          },
        ];
    }
  };

  const navGroups = getNavGroupsForRole();

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a110e] border-r border-slate-200/90 dark:border-[#192b23] select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
        <div 
          onClick={() => navigate(role === 'management' ? '/executive-dashboard' : '/dashboard')}
          className="flex items-center gap-2 overflow-hidden cursor-pointer"
        >
          {isCollapsed ? (
            <span className="font-black text-emerald-500 text-sm tracking-wider">
              EM
            </span>
          ) : (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold tracking-wider text-slate-900 dark:text-emerald-400 text-base font-heading leading-tight truncate">
                ECO METRICS
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase truncate">
                ESG & BRSR Platform
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Banner in Sidebar */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Role View</p>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 truncate">
            {user?.roleTitle || 'ESG Contributor'}
          </p>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (
                item.path !== '/dashboard' && 
                item.path !== '/executive-dashboard' && 
                item.path !== '/projects' && 
                item.path !== '/validation' && 
                item.path !== '/brsr' && 
                location.pathname.startsWith(item.path + '/')
              );

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    item.indent && !isCollapsed ? 'ml-3 pl-3 border-l border-slate-200 dark:border-slate-800' : ''
                  } ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-[#141f1b]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}

                  {!isCollapsed && item.alertCount && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                      {item.alertCount}
                    </span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-l" />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* AI Assistant Quick Trigger in Sidebar */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={toggleAiAssistant}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm hover:shadow-md transition-all cursor-pointer`}
          title="Open AI ESG Copilot"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            {!isCollapsed && (
              <div className="text-left">
                <p className="text-xs font-bold leading-none">AI ESG Assistant</p>
                <p className="text-[10px] text-emerald-100 opacity-90 mt-0.5">Gap analysis & BRSR aid</p>
              </div>
            )}
          </div>
        </button>

        {!isCollapsed && (
          <div className="mt-3 px-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>SEBI BRSR Core</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">FY 2025-26</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-[#0a110e] shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
