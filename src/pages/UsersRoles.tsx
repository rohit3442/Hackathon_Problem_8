import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCog, 
  Shield, 
  Plus, 
  Check, 
  X, 
  Mail, 
  Building2, 
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api';
import { UserRole } from '../types';

export const UsersRoles: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, switchRole } = useAuth();
  const { addToast } = useApp();

  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('project_user');
  const [newUserTitle, setNewUserTitle] = useState('ESG Contributor');

  const { data: usersList = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return await usersApi.createUser({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        roleTitle: newUserTitle,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsNewUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      addToast('User Registered', `Account created for ${data.name}`, 'success');
      navigate(`/users/${data.id}`);
    }
  });

  const permissionsMatrix: { role: string; roleKey: UserRole; view: boolean; create: boolean; edit: boolean; submit: boolean; validate: boolean; approve: boolean }[] = [
    { role: 'Project User', roleKey: 'project_user', view: true, create: true, edit: true, submit: true, validate: false, approve: false },
    { role: 'BU Manager', roleKey: 'bu_manager', view: true, create: false, edit: true, submit: true, validate: false, approve: true },
    { role: 'Subsidiary Admin', roleKey: 'subsidiary_admin', view: true, create: true, edit: true, submit: true, validate: true, approve: true },
    { role: 'ESG / Sustainability Team', roleKey: 'esg_team', view: true, create: true, edit: true, submit: true, validate: true, approve: true },
    { role: 'Group Admin', roleKey: 'group_admin', view: true, create: true, edit: true, submit: true, validate: true, approve: true },
    { role: 'Management', roleKey: 'management', view: true, create: false, edit: false, submit: false, validate: false, approve: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading m-0">
              Users & Enterprise Role Management
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              Role-Based Access Control (RBAC)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure permission boundaries, manage stakeholder accounts, and test persona capabilities.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsNewUserModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add New User
        </Button>
      </div>

      {/* Role Permissions Matrix Table */}
      <Card>
        <CardHeader
          title="Enterprise Role Permissions Matrix"
          subtitle="Mandated separation of duties between data entry, review, validation, and signoff"
        />
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase">
                <th className="py-3 px-4">Enterprise Role</th>
                <th className="py-3 px-2 text-center">View</th>
                <th className="py-3 px-2 text-center">Create Data</th>
                <th className="py-3 px-2 text-center">Edit Draft</th>
                <th className="py-3 px-2 text-center">Submit</th>
                <th className="py-3 px-2 text-center">ESG Validate</th>
                <th className="py-3 px-2 text-center">Approve</th>
                <th className="py-3 px-4 text-right">Switch Persona</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissionsMatrix.map((p, i) => {
                const isActive = user?.role === p.roleKey;
                return (
                  <tr key={i} className={`hover:bg-slate-50/60 dark:hover:bg-[#141f1b]/60 transition-colors ${isActive ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-slate-100">{p.role}</strong>
                        {isActive && (
                          <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    {[p.view, p.create, p.edit, p.submit, p.validate, p.approve].map((allowed, idx) => (
                      <td key={idx} className="py-3.5 px-2 text-center">
                        {allowed ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mx-auto" />
                        )}
                      </td>
                    ))}
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant={isActive ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => {
                          switchRole(p.roleKey);
                          addToast('Persona Switched', `Active view is now ${p.role}`, 'info');
                        }}
                      >
                        {isActive ? 'Current' : 'Select'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Directory Table */}
      <Card>
        <CardHeader
          title="Active Corporate Stakeholder Accounts"
          subtitle="Directory of site managers, BU reviewers, and group executives"
        />
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase">
                <th className="py-2.5 px-3">User & Title</th>
                <th className="py-2.5 px-3">Role Level</th>
                <th className="py-2.5 px-3">Assigned Boundary Scope</th>
                <th className="py-2.5 px-3">Corporate Email</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-[#141f1b] transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <button
                          onClick={() => navigate(`/users/${u.id}`)}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 block text-left"
                        >
                          {u.name}
                        </button>
                        <span className="text-[10px] text-slate-400">{u.roleTitle}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {u.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {u.organization || 'Apex Infrastructure Group'}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {u.email}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/users/${u.id}`)}
                      >
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          switchRole(u.role);
                          addToast('Role Activated', `Switched to ${u.name}`, 'info');
                        }}
                      >
                        Login As
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite User Modal */}
      <Modal
        isOpen={isNewUserModalOpen}
        onClose={() => setIsNewUserModalOpen(false)}
        title="Add Stakeholder to Eco Metrics"
        subtitle="Provision RBAC access for site engineering or auditing personnel"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsNewUserModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
            >
              Save User
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input 
              type="text" 
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="e.g. Shalini Mukherjee" 
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Corporate Email</label>
            <input 
              type="email" 
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="name@apexgroup.com" 
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Role Title</label>
            <input 
              type="text" 
              value={newUserTitle}
              onChange={(e) => setNewUserTitle(e.target.value)}
              placeholder="e.g. Environmental Engineer" 
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs" 
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Assigned Role</label>
            <select 
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              <option value="project_user">Project User (Data Entry)</option>
              <option value="bu_manager">BU Manager (Review & Approval)</option>
              <option value="subsidiary_admin">Subsidiary Admin</option>
              <option value="esg_team">ESG / Sustainability Team</option>
              <option value="group_admin">Group Admin</option>
              <option value="management">Management / Final Approver</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersRoles;
