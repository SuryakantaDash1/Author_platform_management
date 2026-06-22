import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck, ShieldOff, Eye, EyeOff, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/interceptors';
import { API_ENDPOINTS } from '../../api/endpoints';

const MODULES = [
  { key: 'authors',    label: 'Authors Management' },
  { key: 'books',      label: 'Books Management' },
  { key: 'selling',    label: 'Selling Records' },
  { key: 'royalties',  label: 'Royalties & Payments' },
  { key: 'support',    label: 'Help Center / Support' },
  { key: 'reviews',    label: 'Reviews' },
  { key: 'payments',   label: 'Payment Config' },
  { key: 'calculator', label: 'Calculator Config' },
  { key: 'analytics',  label: 'Analytics & Stats' },
] as const;

type ModuleKey = typeof MODULES[number]['key'];

interface SubAdmin {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  permissions: ModuleKey[];
  createdAt: string;
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  permissions: [] as ModuleKey[],
  isActive: true,
};

const SubAdmins: React.FC = () => {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SubAdmin | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SubAdmin | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_ENDPOINTS.SUB_ADMIN.GET_ALL);
      setSubAdmins(res.data?.data?.subAdmins ?? []);
    } catch {
      toast.error('Failed to load sub-admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setShowPass(false);
    setModalOpen(true);
  };

  const openEdit = (sa: SubAdmin) => {
    setEditTarget(sa);
    setForm({
      firstName: sa.firstName,
      lastName: sa.lastName,
      email: sa.email,
      password: '',
      permissions: sa.permissions ?? [],
      isActive: sa.isActive,
    });
    setShowPass(false);
    setModalOpen(true);
  };

  const toggleModule = (key: ModuleKey) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key],
    }));
  };

  const selectAll = () => setForm(f => ({ ...f, permissions: MODULES.map(m => m.key) }));
  const clearAll  = () => setForm(f => ({ ...f, permissions: [] }));

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error('First name, last name, and email are required');
      return;
    }
    if (!editTarget && !form.password.trim()) {
      toast.error('Password is required for new sub-admin');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        const payload: any = {
          firstName: form.firstName,
          lastName: form.lastName,
          permissions: form.permissions,
          isActive: form.isActive,
        };
        if (form.password.trim()) payload.password = form.password;
        await axiosInstance.put(API_ENDPOINTS.SUB_ADMIN.UPDATE(editTarget.userId), payload);
        toast.success('Sub-admin updated');
      } else {
        await axiosInstance.post(API_ENDPOINTS.SUB_ADMIN.CREATE, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          permissions: form.permissions,
        });
        toast.success('Sub-admin created');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(API_ENDPOINTS.SUB_ADMIN.DELETE(deleteTarget.userId));
      toast.success('Sub-admin deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Sub-Admins</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Create and manage sub-admins with module-level permissions
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
          style={{ background: '#65a30d' }}
        >
          <Plus className="w-4 h-4" />
          New Sub-Admin
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-neutral-400">Loading…</div>
        ) : subAdmins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-neutral-400">
            <ShieldCheck className="w-8 h-8 opacity-30" />
            <p className="text-sm">No sub-admins yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="px-5 py-3 text-left font-semibold text-neutral-500 dark:text-neutral-400">Name</th>
                  <th className="px-5 py-3 text-left font-semibold text-neutral-500 dark:text-neutral-400">Email</th>
                  <th className="px-5 py-3 text-left font-semibold text-neutral-500 dark:text-neutral-400">Modules</th>
                  <th className="px-5 py-3 text-left font-semibold text-neutral-500 dark:text-neutral-400">Status</th>
                  <th className="px-5 py-3 text-right font-semibold text-neutral-500 dark:text-neutral-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {subAdmins.map(sa => (
                  <tr key={sa.userId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                      {sa.firstName} {sa.lastName}
                    </td>
                    <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">{sa.email}</td>
                    <td className="px-5 py-3">
                      {sa.permissions?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {sa.permissions.map(p => {
                            const mod = MODULES.find(m => m.key === p);
                            return (
                              <span
                                key={p}
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{ background: 'rgba(132,204,22,0.12)', color: '#65a30d' }}
                              >
                                {mod?.label ?? p}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-xs italic">No modules assigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {sa.isActive ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                          <ShieldCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                          <ShieldOff className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(sa)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sa)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {editTarget ? 'Edit Sub-Admin' : 'Create Sub-Admin'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">First Name</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-lime-500"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Last Name</label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-lime-500"
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Email</label>
                <input
                  type="email"
                  disabled={!!editTarget}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-lime-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">
                  {editTarget ? 'New Password (leave blank to keep unchanged)' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-lime-500"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder={editTarget ? '••••••••' : 'Min 8 characters'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Active toggle (edit only) */}
              {editTarget && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Account Active</span>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-lime-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              )}

              {/* Modules */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-500">Module Access</label>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs text-lime-600 hover:text-lime-700 font-medium">Select all</button>
                    <span className="text-neutral-300">|</span>
                    <button onClick={clearAll} className="text-xs text-neutral-400 hover:text-neutral-600 font-medium">Clear all</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MODULES.map(mod => {
                    const checked = form.permissions.includes(mod.key);
                    return (
                      <button
                        key={mod.key}
                        type="button"
                        onClick={() => toggleModule(mod.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
                          checked
                            ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-400'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border ${checked ? 'bg-lime-500 border-lime-500' : 'border-neutral-300 dark:border-neutral-600'}`}>
                          {checked && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                        {mod.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ background: '#65a30d' }}
              >
                {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Sub-Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Delete Sub-Admin</h3>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Remove <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdmins;
