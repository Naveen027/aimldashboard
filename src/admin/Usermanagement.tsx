import React, { useState, useMemo, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import editIcon from '../assets/edit.png'
import deleteIcon from '../assets/delete.png'
import enableIcon from '../assets/enable.png'
import disableIcon from '../assets/disable.png'

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'analyst';
  status: 'active' | 'inactive';
  joinDate: string;
  apiUsage: number;
  lastActive: string;
}

type SortKey = 'name' | 'role' | 'status' | 'joinDate' | 'apiUsage';
type FormData = { name: string; email: string; role: User['role']; status: User['status'] };

const PAGE_SIZE = 8;
const EMPTY_FORM: FormData = { name: '', email: '', role: 'user', status: 'active' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatUsage = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : `${(n / 1_000).toFixed(1)}K`;

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ------------------------------------------------------------------ */
/* Tailwind class tokens (replaces the old <style> block)              */
/* ------------------------------------------------------------------ */

// Theme variables: light defaults + dark overrides (same selector as before: .ain-app.theme-dark .um)
const ROOT_VARS = [
  // light
  '[--bg:#f5f6fa]', '[--surface:#fff]', '[--surface-2:#f9fafb]', '[--border:#e5e7eb]',
  '[--text:#111827]', '[--muted:#6b7280]', '[--input:#fff]', '[--hover:#f3f4f6]',
  '[--accent:#4f5bd5]', '[--accent-h:#4350c0]', '[--ring:rgba(79,91,213,.18)]',
  '[--danger:#dc2626]', '[--danger-h:#b91c1c]',
  '[--admin-fg:#b91c1c]', '[--admin-bg:rgba(239,68,68,.12)]',
  '[--user-fg:#1d4ed8]', '[--user-bg:rgba(59,130,246,.12)]',
  '[--analyst-fg:#7e22ce]', '[--analyst-bg:rgba(168,85,247,.12)]',
  '[--ok-fg:#15803d]', '[--ok-bg:rgba(34,197,94,.14)]',
  '[--off-fg:#b91c1c]', '[--off-bg:rgba(239,68,68,.12)]',
  // dark
  '[.ain-app.theme-dark_&]:[--bg:transparent]',
  '[.ain-app.theme-dark_&]:[--surface:#1f2937]',
  '[.ain-app.theme-dark_&]:[--surface-2:#273449]',
  '[.ain-app.theme-dark_&]:[--border:#374151]',
  '[.ain-app.theme-dark_&]:[--text:#f3f4f6]',
  '[.ain-app.theme-dark_&]:[--muted:#c1c8d3]',
  '[.ain-app.theme-dark_&]:[--input:#111827]',
  '[.ain-app.theme-dark_&]:[--hover:#273449]',
  '[.ain-app.theme-dark_&]:[--accent:#7c88f0]',
  '[.ain-app.theme-dark_&]:[--accent-h:#6a77e6]',
  '[.ain-app.theme-dark_&]:[--ring:rgba(124,136,240,.25)]',
  '[.ain-app.theme-dark_&]:[--admin-fg:#fca5a5]',
  '[.ain-app.theme-dark_&]:[--user-fg:#93c5fd]',
  '[.ain-app.theme-dark_&]:[--analyst-fg:#d8b4fe]',
  '[.ain-app.theme-dark_&]:[--ok-fg:#86efac]',
  '[.ain-app.theme-dark_&]:[--off-fg:#fca5a5]',
].join(' ');

const ROOT = `um user-management ${ROOT_VARS} bg-[var(--bg)] text-[color:var(--text)] min-h-screen text-[14px]`;
const cardBase = 'rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(16,24,40,0.04)]';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--ring)]';

// Buttons
const BTN_BASE = `inline-flex items-center gap-1.5 rounded-[10px]! border font-medium cursor-pointer whitespace-nowrap transition-[background,box-shadow,border-color] duration-150 disabled:opacity-50 disabled:cursor-not-allowed enabled:active:translate-y-px ${FOCUS_RING}`;
const BTN_MD = 'px-[14px] py-2 text-[13px]';
const BTN_SM = 'px-2.5 py-1 text-xs';
const BTN_PRIMARY = 'bg-[var(--accent)] text-white border-transparent enabled:hover:bg-[var(--accent-h)] enabled:hover:text-white';
const BTN_SECONDARY = 'bg-[var(--surface)] text-[color:var(--text)] border-[color:var(--border)] enabled:hover:bg-[var(--hover)] enabled:hover:border-[color:var(--accent)] enabled:hover:text-[color:var(--accent)]';
const BTN_DANGER = 'bg-[var(--danger)] text-white border-transparent enabled:hover:bg-[var(--danger-h)] enabled:hover:text-white';

const btn = (variant: string, size: string = BTN_MD, extra = '') =>
  `${BTN_BASE} ${size} ${variant} ${extra}`.trim();

// Inputs / selects
const FIELD_BASE = `border rounded-[10px] bg-[var(--input)] text-[color:var(--text)] text-[13px] transition-[border-color,box-shadow] duration-150 placeholder:text-[color:var(--muted)] placeholder:opacity-80 ${FOCUS_RING}`;
const FIELD_NORMAL = 'border-[color:var(--border)] focus:border-[color:var(--accent)]';
const FIELD_INVALID = 'border-[color:var(--danger)]';

const CONTROL_SELECT = `${FIELD_BASE} ${FIELD_NORMAL} h-9 px-2.5 py-0 cursor-pointer`;
const SEARCH_INPUT = `${FIELD_BASE} ${FIELD_NORMAL} h-9 w-full py-2 pl-[34px] pr-[30px]`;
const formField = (invalid: boolean, extra = '') =>
  `${FIELD_BASE} ${invalid ? FIELD_INVALID : FIELD_NORMAL} w-full px-2.5 py-2 ${extra}`.trim();

// Table
const TH = 'px-3 py-2.5 text-left font-semibold text-xs text-[color:var(--muted)] border-b border-[color:var(--border)] whitespace-nowrap';
const TD = 'px-3 py-2.5 border-b border-[color:var(--border)] text-[color:var(--muted)] align-middle';

// Role + status variants
const AVATAR_ROLE: Record<User['role'], string> = {
  admin: 'bg-[var(--admin-bg)] text-[color:var(--admin-fg)]',
  user: 'bg-[var(--user-bg)] text-[color:var(--user-fg)]',
  analyst: 'bg-[var(--analyst-bg)] text-[color:var(--analyst-fg)]',
};
const BADGE_ROLE = AVATAR_ROLE;
const STATUS_CLS: Record<User['status'], string> = {
  active: 'bg-[var(--ok-bg)] text-[color:var(--ok-fg)]',
  inactive: 'bg-[var(--off-bg)] text-[color:var(--off-fg)]',
};

// Icon buttons
const ICON_BTN = `group bg-transparent border-0 p-[5px] rounded-md cursor-pointer grid place-items-center transition-colors duration-150 ${FOCUS_RING}`;
const ICON_IMG = 'w-[18px] h-[18px] transition-transform duration-150 group-hover:scale-110';

// Modal
const OVERLAY = 'fixed inset-0 bg-[rgba(15,23,42,.5)] flex items-center justify-center z-[1000] p-3 animate-um-fade motion-reduce:animate-none';
const MODAL = 'bg-[var(--surface)] text-[color:var(--text)] border border-[color:var(--border)] rounded-[10px] p-5 w-full shadow-[0_20px_40px_rgba(0,0,0,.2)] animate-um-pop motion-reduce:animate-none';
const MODAL_TITLE = 'm-0 mb-0.5 text-[17px] font-bold text-[color:var(--text)]';
const MODAL_SUB = 'mt-0 text-[color:var(--muted)] text-[13px]';
const FORM_LABEL = 'block mb-1 text-xs font-medium text-[color:var(--muted)]';
const FIELD_ERROR = 'mt-1 text-xs text-[color:var(--danger)]';
const FORM_ACTIONS = 'flex gap-2 justify-end mt-4';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex.johnson@company.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-01-15',
      apiUsage: 270000,
      lastActive: '5 mins ago'
    },
    {
      id: '2',
      name: 'Mia Wong',
      email: 'mia.wong@company.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-02-20',
      apiUsage: 1510000,
      lastActive: '3 minutes ago'
    },
    {
      id: '3',
      name: 'Mana Tuung',
      email: 'mana.tuung@company.com',
      role: 'analyst',
      status: 'active',
      joinDate: '2024-03-10',
      apiUsage: 421000,
      lastActive: '3 minutes ago'
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | User['role']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | User['status']>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = useCallback((msg: string) => setToast(msg), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!showForm && !deleteTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowForm(false);
        setDeleteTarget(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showForm, deleteTarget]);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = users.filter(user => {
      const matchesSearch = !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
    const { key, dir } = sort;
    const factor = dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return cmp * factor;
    });
  }, [users, searchTerm, filterRole, filterStatus, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagedUsers = filteredUsers.slice(pageStart, pageStart + PAGE_SIZE);
  const maxUsage = useMemo(() => Math.max(1, ...users.map(u => u.apiUsage)), [users]);
  const hasFilters = searchTerm !== '' || filterRole !== 'all' || filterStatus !== 'all';

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    totalUsage: users.reduce((sum, u) => sum + u.apiUsage, 0),
  };

  const handleSort = (key: SortKey) => {
    setSort(prev => prev.key === key
      ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: key === 'apiUsage' || key === 'joinDate' ? 'desc' : 'asc' });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
    setPage(1);
  };

  const handleAddUser = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setErrors({});
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setErrors({});
    setShowForm(true);
  };

  const handleSaveUser = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const next: { name?: string; email?: string } = {};

    if (!name) next.name = 'Enter the user’s full name.';
    if (!email) next.email = 'Enter an email address.';
    else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email, like name@company.com.';
    else if (users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== editingId)) {
      next.email = 'A user with this email already exists.';
    }

    if (next.name || next.email) {
      setErrors(next);
      return;
    }

    const data = { ...formData, name, email };

    if (editingId) {
      setUsers(users.map(u => (u.id === editingId ? { ...u, ...data } : u)));
      notify('User updated');
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...data,
        joinDate: new Date().toISOString().split('T')[0],
        apiUsage: 0,
        lastActive: 'Just now',
      };
      setUsers([...users, newUser]);
      notify('User added');
    }
    setShowForm(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setUsers(users.filter(u => u.id !== deleteTarget.id));
    notify('User deleted');
    setDeleteTarget(null);
  };

  const handleStatusToggle = (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'inactive' : 'active';
    setUsers(users.map(u => (u.id === id ? { ...u, status: nextStatus } : u)));
    notify(nextStatus === 'active' ? 'User activated' : 'User deactivated');
  };

  const handleExport = () => {
    if (filteredUsers.length === 0) {
      notify('No users to export');
      return;
    }
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const header = ['Name', 'Email', 'Role', 'Status', 'Join Date', 'API Usage', 'Last Active'];
    const rows = filteredUsers.map(u =>
      [u.name, u.email, u.role, u.status, u.joinDate, u.apiUsage, u.lastActive].map(esc).join(',')
    );
    const blob = new Blob([[header.map(esc).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${filteredUsers.length} user${filteredUsers.length === 1 ? '' : 's'}`);
  };

  const renderSortHeader = (label: string, k: SortKey) => {
    const active = sort.key === k;
    return (
      <th className={TH} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button
          className={`inline-flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer rounded hover:text-[color:var(--text)] ${FOCUS_RING} ${active ? 'text-[color:var(--text)]' : ''}`}
          onClick={() => handleSort(k)}
        >
          {label}
          <span className={`text-[9px] ${active ? 'opacity-100 text-[color:var(--accent)]' : 'opacity-[.35]'}`}>
            {active ? (sort.dir === 'asc' ? '▲' : '▼') : '▲▼'}
          </span>
        </button>
      </th>
    );
  };

  return (
    <AdminLayout>
      <div className={ROOT}>
        {/* Header */}
        <div className="flex justify-between items-center gap-3 mb-2 max-md:flex-col max-md:items-start">
          <div>
            <h2 className="break-words [font-size:1.2rem] !font-bold leading-tight tracking-tight text-slate-700  dark:text-white">User Management</h2>
            <p className="mt-0.5 mb-0 text-[color:var(--muted)]">Manage and monitor user accounts</p>
          </div>
          <button className={btn(BTN_PRIMARY)} onClick={handleAddUser}>
            + Add user
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 mb-3 gap-4  [height:100px]! min-[480px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {[
            { label: 'Total users', value: stats.totalUsers, icon: 'bi-people', healthy: false },
            { label: 'Active', value: stats.activeUsers, icon: 'bi-person-check', healthy: true },
            { label: 'Admins', value: stats.adminUsers, icon: 'bi-shield-lock', healthy: false },
            { label: 'Total API usage', value: formatUsage(stats.totalUsage), icon: 'bi-activity', healthy: false },
          ].map((s) => (
            <div
              key={s.label}
              className={`${cardBase} flex items-center gap-3 px-2 py-2 transition-shadow hover:shadow-md sm:gap-4 sm:px-6 sm:py-6`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl sm:h-[50px] sm:w-[50px] sm:text-2xl ${s.healthy
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
                  }`}
              >
                <i className={`bi ${s.icon}`} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm text-slate-500 sm:text-[15px] dark:text-slate-400">
                  {s.label}
                </div>
                <div className="!text-xl font-bold leading-tight text-slate-900 sm:text-[25px] dark:text-white">
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative flex-[1_1_240px] max-w-[360px] max-md:max-w-none max-md:basis-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] pointer-events-none"
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              className={SEARCH_INPUT}
              type="text"
              placeholder="Search by name or email"
              aria-label="Search users"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
            {searchTerm && (
              <button
                className="absolute right-1.5 top-1/2 -translate-y-1/2 border-0 bg-transparent text-[color:var(--muted)] cursor-pointer text-base leading-none px-1.5 py-0.5 rounded hover:bg-[var(--hover)]"
                aria-label="Clear search"
                onClick={() => { setSearchTerm(''); setPage(1); }}
              >×</button>
            )}
          </div>
          <select
            className={CONTROL_SELECT}
            aria-label="Filter by role"
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value as 'all' | User['role']); setPage(1); }}
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="analyst">Analyst</option>
          </select>
          <select
            className={CONTROL_SELECT}
            aria-label="Filter by status"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as 'all' | User['status']); setPage(1); }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {hasFilters && (
            <button className={btn(BTN_SECONDARY, BTN_MD, 'h-9')} onClick={resetFilters}>Clear filters</button>
          )}
          <span className="flex-1 max-md:hidden" />
          <button className={btn(BTN_SECONDARY, BTN_MD, 'h-9')} onClick={handleExport}>Export CSV</button>
        </div>

        {/* Add / Edit modal */}
        {showForm && (
          <div className={OVERLAY} onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
            <div className={`${MODAL} max-w-[440px]`} role="dialog" aria-modal="true" aria-labelledby="um-form-title">
              <h2 id="um-form-title" className={MODAL_TITLE}>{editingId ? 'Edit user' : 'Add user'}</h2>
              <p className={`${MODAL_SUB} mb-3.5`}>{editingId ? 'Update this user’s details and access.' : 'Create an account and set its access level.'}</p>
              <div className="mb-3">
                <label className={FORM_LABEL} htmlFor="um-name">Name</label>
                <input
                  id="um-name"
                  className={formField(!!errors.name)}
                  type="text"
                  autoFocus
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveUser(); }}
                  placeholder="Full name"
                />
                {errors.name && <div className={FIELD_ERROR}>{errors.name}</div>}
              </div>
              <div className="mb-3">
                <label className={FORM_LABEL} htmlFor="um-email">Email</label>
                <input
                  id="um-email"
                  className={formField(!!errors.email)}
                  type="email"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveUser(); }}
                  placeholder="name@company.com"
                />
                {errors.email && <div className={FIELD_ERROR}>{errors.email}</div>}
              </div>
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <div className="mb-3">
                  <label className={FORM_LABEL} htmlFor="um-role">Role</label>
                  <select
                    id="um-role"
                    className={`${formField(false)} cursor-pointer`}
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                  >
                    <option value="user">User</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className={FORM_LABEL} htmlFor="um-status">Status</label>
                  <select
                    id="um-status"
                    className={`${formField(false)} cursor-pointer`}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className={FORM_ACTIONS}>
                <button className={btn(BTN_SECONDARY)} onClick={() => setShowForm(false)}>Cancel</button>
                <button className={btn(BTN_PRIMARY)} onClick={handleSaveUser}>
                  {editingId ? 'Save changes' : 'Add user'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {deleteTarget && (
          <div className={OVERLAY} onMouseDown={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
            <div className={`${MODAL} max-w-[380px]`} role="alertdialog" aria-modal="true" aria-labelledby="um-del-title">
              <h2 id="um-del-title" className={MODAL_TITLE}>Delete {deleteTarget.name}?</h2>
              <p className={`${MODAL_SUB} mb-0`}>
                This removes the account and its access. This can’t be undone.
              </p>
              <div className={FORM_ACTIONS}>
                <button className={btn(BTN_SECONDARY)} onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className={btn(BTN_DANGER)} onClick={confirmDelete}>Delete user</button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-[var(--surface)] border border-[color:var(--border)] rounded-[10px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead className="bg-[var(--surface-2)]">
                <tr>
                  {renderSortHeader('User', 'name')}
                  {renderSortHeader('Role', 'role')}
                  {renderSortHeader('Status', 'status')}
                  {renderSortHeader('Joined', 'joinDate')}
                  {renderSortHeader('API usage', 'apiUsage')}
                  <th className={TH}>Last active</th>
                  <th className={TH}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map(user => (
                  <tr key={user.id} className="transition-colors duration-[120ms] hover:bg-[var(--hover)] last:[&>td]:border-b-0">
                    <td className={TD}>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-[30px] h-[30px] rounded-full grid place-items-center text-[11px] font-semibold shrink-0 ${AVATAR_ROLE[user.role]}`}
                          aria-hidden="true"
                        >
                          {initials(user.name)}
                        </span>
                        <div>
                          <div className="font-semibold text-[color:var(--text)] leading-[1.3]">{user.name}</div>
                          <div className="text-xs text-[color:var(--muted)]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={TD}>
                      <span className={`inline-block px-[9px] py-0.5 rounded-full text-xs font-medium ${BADGE_ROLE[user.role]}`}>
                        {capitalize(user.role)}
                      </span>
                    </td>
                    <td className={TD}>
                      <span
                        className={`inline-flex items-center gap-1.5 px-[9px] py-0.5 rounded-full text-xs font-medium before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-current ${STATUS_CLS[user.status]}`}
                      >
                        {capitalize(user.status)}
                      </span>
                    </td>
                    <td className={TD}>{user.joinDate}</td>
                    <td className={`${TD} min-w-[90px]`}>
                      <div className="text-[color:var(--text)] font-medium">{formatUsage(user.apiUsage)}</div>
                      <div className="h-[3px] rounded-[2px] bg-[var(--border)] mt-1 overflow-hidden">
                        <span
                          className="block h-full bg-[var(--accent)] rounded-[2px]"
                          style={{ width: `${Math.max(2, (user.apiUsage / maxUsage) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className={TD}>{user.lastActive}</td>
                    <td className={TD}>
                      <div className="flex gap-0.5">
                        <button
                          className={`${ICON_BTN} hover:bg-[rgba(59,130,246,.14)]`}
                          onClick={() => handleEditUser(user)}
                          title="Edit"
                          aria-label={`Edit ${user.name}`}
                        >
                          <img className={ICON_IMG} src={editIcon} alt="" />
                        </button>
                        <button
                          className={`${ICON_BTN} hover:bg-[rgba(168,85,247,.14)]`}
                          onClick={() => handleStatusToggle(user.id)}
                          title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                          aria-label={`${user.status === 'active' ? 'Deactivate' : 'Activate'} ${user.name}`}
                        >
                          <img className={ICON_IMG} src={user.status === 'active' ? enableIcon : disableIcon} alt="" />
                        </button>
                        <button
                          className={`${ICON_BTN} hover:bg-[rgba(239,68,68,.14)]`}
                          onClick={() => setDeleteTarget(user)}
                          title="Delete"
                          aria-label={`Delete ${user.name}`}
                        >
                          <img className={ICON_IMG} src={deleteIcon} alt="" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="px-4 py-8 text-center text-[color:var(--muted)]">
              <strong className="block text-[color:var(--text)] text-sm mb-0.5 font-bold">
                {hasFilters ? 'No users match your filters' : 'No users yet'}
              </strong>
              {hasFilters ? 'Try a different search or clear the filters.' : 'Add your first user to get started.'}
              <div>
                {hasFilters
                  ? <button className={btn(BTN_SECONDARY, BTN_MD, 'mt-2.5')} onClick={resetFilters}>Clear filters</button>
                  : <button className={btn(BTN_PRIMARY, BTN_MD, 'mt-2.5')} onClick={handleAddUser}>+ Add user</button>}
              </div>
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div className="flex justify-between items-center gap-2 px-3 py-2 border-t border-[color:var(--border)] text-[color:var(--muted)] text-xs flex-wrap">
              <span>
                Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button className={btn(BTN_SECONDARY, BTN_SM)} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button className={btn(BTN_SECONDARY, BTN_SM)} disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {toast && (
          <div
            className="fixed bottom-4 right-4 bg-[#111827] text-white px-3.5 py-[9px] rounded-[10px] text-[13px] shadow-[0_8px_20px_rgba(0,0,0,.25)] z-[1100] animate-um-pop motion-reduce:animate-none"
            role="status"
          >
            {toast}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;