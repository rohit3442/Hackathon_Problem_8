import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, ShieldCheck, ArrowLeft, Mail, Building2, Calendar, History, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api';

export const UserDetail: React.FC = () => {
  const { id = 'u-1' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
  });

  const selectedUser = users.find(u => u.id === id) || {
    id,
    name: 'Rajesh Verma',
    email: 'rajesh.verma@apexgroup.com',
    role: 'project_user',
    roleTitle: 'Project Lead & Facility Engineer',
    organization: 'Apex Infrastructure Group',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/users')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Users & Roles
            </Button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-mono font-bold text-slate-500">{selectedUser.id}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
            User Profile: {selectedUser.name}
          </h1>
          <p className="text-xs text-slate-500">
            {selectedUser.roleTitle} • {selectedUser.organization}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 text-center">
          <img
            src={selectedUser.avatar}
            alt={selectedUser.name}
            className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{selectedUser.name}</h3>
            <p className="text-xs text-slate-500">{selectedUser.roleTitle}</p>
          </div>
          <div className="text-xs text-left space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedUser.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedUser.organization}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold uppercase text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                Role: {selectedUser.role}
              </span>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2 p-6 space-y-4">
          <CardHeader
            title="Assigned Privileges & Workflow Scope"
            subtitle="Configured permissions in the Eco Metrics authorization engine"
          />
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">ESG Data Entry & Drafts</p>
                <p className="text-[11px] text-slate-500">Authorized to edit and save draft metrics for assigned operational projects.</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Evidence Document Uploads</p>
                <p className="text-[11px] text-slate-500">Authorized to attach utility bills, calibration logs, and waste slips.</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Stage 1 Submission Rights</p>
                <p className="text-[11px] text-slate-500">Authorized to submit data packages to BU review queue.</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserDetail;
