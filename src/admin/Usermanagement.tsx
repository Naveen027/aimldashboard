import React, { useState, useMemo, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import DeleteIcon from '../components/DeleteIcon';

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

type SortKey = 'name' | 'status' | 'apiUsage';
type FormData = { name: string; email: string; role: User['role']; status: User['status'] };

const PAGE_SIZE = 8;
const EMPTY_FORM: FormData = { name: '', email: '', role: 'user', status: 'active' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatUsage = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : `${(n / 1_000).toFixed(1)}K`;

/* ------------------------------------------------------------------ */
/* Tailwind class tokens                                               */
/* ------------------------------------------------------------------ */

const ROOT_VARS = [
  // light
  '[--bg:#f5f6fa]', '[--surface:#fff]', '[--surface-2:#f9fafb]', '[--border:#e5e7eb]',
  '[--text:#111827]', '[--muted:#6b7280]', '[--input:#fff]', '[--hover:#f3f4f6]',
  '[--accent:#4f5bd5]', '[--accent-h:#4350c0]', '[--ring:rgba(79,91,213,.18)]',
  '[--danger:#dc2626]', '[--danger-h:#b91c1c]',
  '[--ok-fg:#15803d]', '[--ok-bg:rgba(34,197,94,.14)]',
  '[--off-fg:#be123c]', '[--off-bg:rgba(244,63,94,.12)]',
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
  '[.ain-app.theme-dark_&]:[--ok-fg:#86efac]',
  '[.ain-app.theme-dark_&]:[--off-fg:#fda4af]',
].join(' ');

// min-h uses dvh so mobile browser toolbars don't cause extra scroll; overflow-x-hidden prevents sideways scroll
const ROOT = `um user-management ${ROOT_VARS} mx-auto w-full max-w-[1520px] 2xl:max-w-[1760px] bg-[var(--bg)] text-[color:var(--text)] min-h-screen min-h-[100dvh] overflow-x-hidden text-[14px]`;
const cardBase = 'rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(16,24,40,0.04)]';

const FOCUS_RING = 'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--ring)]';

// Buttons (min touch height 40px on mobile, compact on >= sm)
const BTN_BASE = `inline-flex items-center justify-center gap-1.5 rounded-[10px]! border font-medium cursor-pointer whitespace-nowrap transition-[background,box-shadow,border-color] duration-150 disabled:opacity-50 disabled:cursor-not-allowed enabled:active:translate-y-px ${FOCUS_RING}`;
const BTN_MD = 'px-[14px] py-2.5 sm:py-2 text-[13px] min-h-[40px] sm:min-h-0';
const BTN_SM = 'px-3 py-2 sm:px-2.5 sm:py-1 text-xs min-h-[36px] sm:min-h-0';
const BTN_PRIMARY = 'bg-[var(--accent)] text-white border-transparent enabled:hover:bg-[var(--accent-h)] enabled:hover:text-white';
const BTN_SECONDARY = 'bg-[var(--surface)] text-[color:var(--text)] border-[color:var(--border)] enabled:hover:bg-[var(--hover)] enabled:hover:border-[color:var(--accent)] enabled:hover:text-[color:var(--accent)]';
const BTN_DANGER = 'bg-[var(--danger)] text-white border-transparent enabled:hover:bg-[var(--danger-h)] enabled:hover:text-white';

const btn = (variant: string, size: string = BTN_MD, extra = '') =>
  `${BTN_BASE} ${size} ${variant} ${extra}`.trim();

// Inputs / selects — 16px on mobile prevents iOS Safari auto-zoom on focus
const FIELD_BASE = `border rounded-[10px] bg-[var(--input)] text-[color:var(--text)] text-base sm:text-[13px] transition-[border-color,box-shadow] duration-150 placeholder:text-[color:var(--muted)] placeholder:opacity-80 ${FOCUS_RING}`;
const FIELD_NORMAL = 'border-[color:var(--border)] focus:border-[color:var(--accent)]';
const FIELD_INVALID = 'border-[color:var(--danger)]';

// Controls row
const CONTROL_SELECT = `${FIELD_BASE} ${FIELD_NORMAL} rounded-xl! h-11 px-3.5 py-0 text-base sm:text-sm cursor-pointer max-sm:flex-1 max-sm:min-w-0`;
const SEARCH_INPUT = `${FIELD_BASE} ${FIELD_NORMAL} rounded-xl! h-11 w-full py-2 pl-10 pr-[34px] text-base sm:text-sm`;
const formField = (invalid: boolean, extra = '') =>
  `${FIELD_BASE} ${invalid ? FIELD_INVALID : FIELD_NORMAL} w-full px-2.5 py-2.5 sm:py-2 ${extra}`.trim();

// Table
const TH = 'px-3 lg:px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-[color:var(--muted)] border-b border-[color:var(--border)] whitespace-nowrap';
const TD = 'px-3 lg:px-4 py-3 border-b border-[color:var(--border)] text-[color:var(--muted)] align-middle';

const STATUS_CLS: Record<User['status'], string> = {
  active: 'bg-[var(--ok-bg)] text-[color:var(--ok-fg)]',
  inactive: 'bg-[var(--off-bg)] text-[color:var(--off-fg)]',
};
const STATUS_LABEL: Record<User['status'], string> = {
  active: 'Active',
  inactive: 'Suspended',
};

// Icon buttons (44px touch target on mobile)
const ICON_BTN = `group bg-transparent border-0 p-2.5 sm:p-1.5 rounded-lg cursor-pointer grid place-items-center transition-colors duration-150 hover:bg-[var(--hover)] ${FOCUS_RING}`;
const ICON_SVG = 'w-[18px] h-[18px] transition-transform duration-150 group-hover:scale-110';

// Modal — bottom sheet on phones, centered dialog on >= sm; scrolls if content exceeds the viewport
const OVERLAY = 'fixed inset-0 bg-[rgba(15,23,42,.5)] flex items-end justify-center sm:items-center z-[1000] p-0 sm:p-4 animate-um-fade motion-reduce:animate-none';
const MODAL = 'bg-[var(--surface)] text-[color:var(--text)] border border-[color:var(--border)] rounded-t-2xl sm:rounded-[10px] p-4 sm:p-5 pb-[max(1rem,env(safe-area-inset-bottom))] w-full max-h-[92vh] max-h-[92dvh] overflow-y-auto overscroll-contain shadow-[0_20px_40px_rgba(0,0,0,.2)] animate-um-pop motion-reduce:animate-none';
const MODAL_TITLE = 'm-0 mb-0.5 text-[17px] font-bold text-[color:var(--text)] break-words';
const MODAL_SUB = 'mt-0 text-[color:var(--muted)] text-[13px]';
const FORM_LABEL = 'block mb-1 text-xs font-medium text-[color:var(--muted)]';
const FIELD_ERROR = 'mt-1 text-xs text-[color:var(--danger)]';
const FORM_ACTIONS = 'flex gap-2 justify-end mt-4 max-[400px]:flex-col-reverse max-[400px]:[&>button]:w-full';

/* ------------------------------------------------------------------ */
/* Inline action icons                                                 */
/* ------------------------------------------------------------------ */
const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  className: ICON_SVG,
};

const EyeIcon = () => (
  <svg {...svgProps}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const BanIcon = () => (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="m5.6 5.6 12.8 12.8" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.8 2.8L16 9.5" />
  </svg>
);

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

  // Lock background scroll while a modal is open (important on mobile)
  useEffect(() => {
    if (!showForm && !deleteTarget) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showForm, deleteTarget]);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = users.filter(user => {
      const matchesSearch = !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesStatus;
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
  }, [users, searchTerm, filterStatus, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagedUsers = filteredUsers.slice(pageStart, pageStart + PAGE_SIZE);
  const hasFilters = searchTerm !== '' || filterStatus !== 'all';

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    totalUsage: users.reduce((sum, u) => sum + u.apiUsage, 0),
  };

  const handleSort = (key: SortKey) => {
    setSort(prev => prev.key === key
      ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: key === 'apiUsage' ? 'desc' : 'asc' });
  };

  const resetFilters = () => {
    setSearchTerm('');
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
    notify(nextStatus === 'active' ? 'User activated' : 'User suspended');
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
          className={`inline-flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer rounded uppercase tracking-wider font-medium text-xs hover:text-[color:var(--text)] ${FOCUS_RING} ${active ? 'text-[color:var(--text)]' : ''}`}
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

  // Shared by the desktop table and the mobile cards
  const renderActions = (user: User, className = '') => (
    <div className={`flex items-center ${className}`}>
      <button
        className={`${ICON_BTN} text-[color:var(--text)]`}
        onClick={() => handleEditUser(user)}
        title="View / Edit"
        aria-label={`View ${user.name}`}
      >
        <EyeIcon />
      </button>
      <button
        className={`${ICON_BTN} ${user.status === 'active' ? 'text-orange-500' : 'text-emerald-600'}`}
        onClick={() => handleStatusToggle(user.id)}
        title={user.status === 'active' ? 'Suspend' : 'Activate'}
        aria-label={`${user.status === 'active' ? 'Suspend' : 'Activate'} ${user.name}`}
      >
        {user.status === 'active' ? <BanIcon /> : <CheckCircleIcon />}
      </button>
      <button
        className={`${ICON_BTN} text-rose-600`}
        onClick={() => setDeleteTarget(user)}
        title="Delete"
        aria-label={`Delete ${user.name}`}
      >
        <DeleteIcon className={ICON_SVG} />
      </button>
    </div>
  );

  const statusBadge = (status: User['status']) => (
    <span className={`inline-block px-3 py-0.5 rounded-full text-[13px] font-medium whitespace-nowrap ${STATUS_CLS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );

  return (
    <AdminLayout>
      <div className={ROOT}>
        {/* Header */}
        <div className="flex justify-between items-center gap-3 mb-3 max-sm:flex-col max-sm:items-stretch">
          <div className="min-w-0">
            <h2 className="m-0 break-words [font-size:1.35rem]! sm:[font-size:1.6rem]! !font-bold leading-tight tracking-tight text-black dark:text-white">User Management</h2>
            <p className="mt-0.5 mb-0 text-sm text-[color:var(--muted)]">Manage and monitor user accounts</p>
          </div>
          <button className={btn(BTN_PRIMARY, BTN_MD, 'max-sm:w-full')} onClick={handleAddUser}>
            + Add user
          </button>
        </div>

        {/* Stats: 2 cols on phones, 4 on large screens; height follows content (no fixed height) */}
        <div className="grid grid-cols-2 mb-4 gap-2.5 min-[480px]:gap-4 xl:grid-cols-4 sm:gap-5">
          {[
            { label: 'Total users', value: stats.totalUsers, icon: 'bi-people', healthy: false },
            { label: 'Active', value: stats.activeUsers, icon: 'bi-person-check', healthy: true },
            { label: 'Admins', value: stats.adminUsers, icon: 'bi-shield-lock', healthy: false },
            { label: 'Total API usage', value: formatUsage(stats.totalUsage), icon: 'bi-activity', healthy: false },
          ].map((s) => (
            <div
              key={s.label}
              className={`${cardBase} flex min-w-0 items-center gap-2.5 p-3 transition-shadow hover:shadow-md max-[360px]:flex-col max-[360px]:items-start sm:gap-4 sm:p-5 lg:p-6`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg sm:h-[50px] sm:w-[50px] sm:text-2xl ${s.healthy
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
                  }`}
              >
                <i className={`bi ${s.icon}`} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs text-slate-500 sm:text-[15px] dark:text-slate-400">
                  {s.label}
                </div>
                <div className="!text-lg font-bold leading-tight text-slate-900 sm:!text-[25px] dark:text-white">
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-4">
          <div className="relative flex-[1_1_240px] sm:max-w-[400px] max-sm:basis-full">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--muted)] pointer-events-none"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              className={SEARCH_INPUT}
              type="text"
              placeholder="Search by name or email..."
              aria-label="Search users"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
            {searchTerm && (
              <button
                className="absolute right-1 top-1/2 -translate-y-1/2 border-0 bg-transparent text-[color:var(--muted)] cursor-pointer text-xl leading-none px-2.5 py-1.5 rounded hover:bg-[var(--hover)]"
                aria-label="Clear search"
                onClick={() => { setSearchTerm(''); setPage(1); }}
              >×</button>
            )}
          </div>
          <select
            className={CONTROL_SELECT}
            aria-label="Filter by status"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as 'all' | User['status']); setPage(1); }}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Suspended</option>
          </select>
          {hasFilters && (
            <button className={btn(BTN_SECONDARY, BTN_MD, 'h-11 rounded-xl! max-sm:flex-1')} onClick={resetFilters}>Clear filters</button>
          )}
          <span className="flex-1 max-md:hidden" />
          <button className={btn(BTN_SECONDARY, BTN_MD, 'h-11 rounded-xl! max-sm:w-full')} onClick={handleExport}>Export CSV</button>
        </div>

        {/* Add / Edit modal */}
        {showForm && (
          <div className={OVERLAY} onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
            <div className={`${MODAL} sm:max-w-[440px]`} role="dialog" aria-modal="true" aria-labelledby="um-form-title">
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
                  inputMode="email"
                  autoCapitalize="none"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveUser(); }}
                  placeholder="name@company.com"
                />
                {errors.email && <div className={FIELD_ERROR}>{errors.email}</div>}
              </div>
              <div className="grid grid-cols-1 gap-x-3 min-[420px]:grid-cols-2">
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
                    <option value="inactive">Suspended</option>
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
            <div className={`${MODAL} sm:max-w-[380px]`} role="alertdialog" aria-modal="true" aria-labelledby="um-del-title">
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

        {/* Results */}
        <div className="bg-[var(--surface)] border border-[color:var(--border)] rounded-2xl overflow-hidden">
          {/* Mobile: card list (< md) */}
          {filteredUsers.length > 0 && (
            <>
              <div className="md:hidden flex items-center gap-2 px-4 py-2.5 border-b border-[color:var(--border)] bg-[var(--surface-2)]">
                <label htmlFor="um-sort" className="text-xs font-medium text-[color:var(--muted)] shrink-0">Sort by</label>
                <select
                  id="um-sort"
                  className={`${FIELD_BASE} ${FIELD_NORMAL} h-9 flex-1 min-w-0 px-2.5 py-0 cursor-pointer`}
                  value={`${sort.key}:${sort.dir}`}
                  onChange={(e) => {
                    const [key, dir] = e.target.value.split(':') as [SortKey, 'asc' | 'desc'];
                    setSort({ key, dir });
                  }}
                >
                  <option value="name:asc">Name (A–Z)</option>
                  <option value="name:desc">Name (Z–A)</option>
                  <option value="status:asc">Status (A–Z)</option>
                  <option value="status:desc">Status (Z–A)</option>
                  <option value="apiUsage:desc">Requests (high–low)</option>
                  <option value="apiUsage:asc">Requests (low–high)</option>
                </select>
              </div>
              <ul className="md:hidden m-0 p-0 list-none">
                {pagedUsers.map(user => (
                  <li key={user.id} className="px-4 py-3.5 border-b border-[color:var(--border)] last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[15px] font-medium text-[color:var(--text)] leading-snug break-words">{user.name}</div>
                        <div className="text-[13px] text-[color:var(--muted)] break-all">{user.email}</div>
                      </div>
                      {statusBadge(user.status)}
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-3 text-[13px]">
                      <div>
                        <div className="text-xs text-[color:var(--muted)]">Requests</div>
                        <div className="text-[color:var(--text)] font-medium">{user.apiUsage.toLocaleString('en-US')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[color:var(--muted)]">Last active</div>
                        <div className="text-[color:var(--text)]">{user.lastActive}</div>
                      </div>
                    </div>
                    {renderActions(user, 'justify-end gap-1 mt-2 -mr-2')}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Tablet / desktop: table (>= md). Last active column hides below lg to fit tablets */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[var(--surface-2)]">
                <tr>
                  {renderSortHeader('User', 'name')}
                  {renderSortHeader('Status', 'status')}
                  {renderSortHeader('Requests', 'apiUsage')}
                  <th className={`${TH} hidden lg:table-cell`}>Last active</th>
                  <th className={`${TH} text-right`}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map(user => (
                  <tr key={user.id} className="transition-colors duration-[120ms] hover:bg-[var(--hover)] last:[&>td]:border-b-0">
                    <td className={`${TD} max-w-[260px] lg:max-w-none`}>
                      <div className="text-[15px] font-medium text-[color:var(--text)] leading-snug truncate">{user.name}</div>
                      <div className="text-[13px] text-[color:var(--muted)] truncate">{user.email}</div>
                    </td>
                    <td className={TD}>{statusBadge(user.status)}</td>
                    <td className={`${TD} text-[15px] text-[color:var(--text)]`}>
                      {user.apiUsage.toLocaleString('en-US')}
                    </td>
                    <td className={`${TD} hidden lg:table-cell text-[15px] whitespace-nowrap`}>{user.lastActive}</td>
                    <td className={TD}>
                      {renderActions(user, 'justify-end gap-1 lg:gap-3 lg:pr-2')}
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
            <div className="flex justify-between items-center gap-2 px-4 sm:px-6 py-3 border-t border-[color:var(--border)] text-[color:var(--muted)] text-xs flex-wrap max-sm:flex-col max-sm:items-stretch max-sm:text-center">
              <span>
                Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
              </span>
              <div className="flex items-center justify-between sm:justify-end gap-1.5">
                <button className={btn(BTN_SECONDARY, BTN_SM)} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                  Previous
                </button>
                <span className="whitespace-nowrap">Page {currentPage} of {totalPages}</span>
                <button className={btn(BTN_SECONDARY, BTN_SM)} disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {toast && (
          <div
            className="fixed left-4 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:left-auto sm:right-4 sm:bottom-4 bg-[#111827] text-white px-3.5 py-[9px] rounded-[10px] text-[13px] text-center sm:text-left shadow-[0_8px_20px_rgba(0,0,0,.25)] z-[1100] animate-um-pop motion-reduce:animate-none"
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