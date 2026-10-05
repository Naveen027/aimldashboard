import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { aiModelCatalog } from '../data/aiModels';
import DeleteIcon from '../components/DeleteIcon';
interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details: string;
  ipAddress: string;
}

/* ------------------------------------------------------------------ */
/* Stat card tokens (same look as User Management cards)               */
/* ------------------------------------------------------------------ */
const CARD =
  'sl-card group flex h-[100px] items-center gap-3 px-2 py-2 sm:gap-4 sm:px-6 sm:py-6 ' +
  'rounded-[10px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ' +
  '[.ain-app.theme-dark_&]:border-[#374151] [.ain-app.theme-dark_&]:bg-[#1f2937] ' +
  'transition-[transform,box-shadow] duration-300 ease-out ' +
  'hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0';

const ICON_BOX =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] text-xl ' +
  'sm:h-[50px] sm:w-[50px] sm:text-2xl ' +
  'transition-transform duration-300 ease-out group-hover:scale-110 motion-reduce:transition-none';

const TONE = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
} as const;

const SystemLogs: React.FC = () => {
  const [logs] = useState<SystemLog[]>([
    {
      id: '1',
      timestamp: '2024-09-22 14:35:22',
      user: 'Sarah Chen (Admin)',
      action: 'User Deleted',
      resource: 'User #1024',
      status: 'success',
      details: 'User account permanently deleted',
      ipAddress: '192.168.1.100',
    },
    {
      id: '2',
      timestamp: '2024-09-22 14:30:15',
      user: 'System',
      action: 'API Rate Limit',
      resource: 'User: Mia Wong',
      status: 'warning',
      details: 'Rate limit exceeded: 5000 requests/min threshold reached',
      ipAddress: 'N/A',
    },
    {
      id: '3',
      timestamp: '2024-09-22 14:25:08',
      user: 'Alex Johnson',
      action: 'API Call',
      resource: aiModelCatalog[0].name,
      status: 'success',
      details: `Model: ${aiModelCatalog[0].name} | Tokens: 1245 | Cost: $0.04`,
      ipAddress: '203.0.113.45',
    },
    {
      id: '4',
      timestamp: '2024-09-22 14:20:33',
      user: 'System',
      action: 'Database Backup',
      resource: 'Main Database',
      status: 'success',
      details: 'Automated backup completed successfully. Size: 2.3GB',
      ipAddress: 'N/A',
    },
    {
      id: '5',
      timestamp: '2024-09-22 14:15:47',
      user: 'Admin Panel',
      action: 'Settings Updated',
      resource: 'Global Configuration',
      status: 'success',
      details: 'Rate limiting configuration changed',
      ipAddress: '192.168.1.100',
    },
    {
      id: '6',
      timestamp: '2024-09-22 14:10:22',
      user: 'System',
      action: 'Error Detected',
      resource: aiModelCatalog[3].name,
      status: 'error',
      details: `Connection timeout: ${aiModelCatalog[3].name} API - Retrying...`,
      ipAddress: 'N/A',
    },
    {
      id: '7',
      timestamp: '2024-09-22 14:05:11',
      user: 'Mia Wong',
      action: 'Login',
      resource: 'User Session',
      status: 'success',
      details: 'User logged in successfully',
      ipAddress: '203.0.113.67',
    },
    {
      id: '8',
      timestamp: '2024-09-22 13:58:45',
      user: 'System',
      action: 'Model Deployment',
      resource: aiModelCatalog[4].name,
      status: 'success',
      details: `Deployment completed: ${aiModelCatalog[4].description}`,
      ipAddress: 'N/A',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'warning' | 'error' | 'info'>('all');
  const [filterAction, setFilterAction] = useState<'all' | string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '2024-09-22', end: '2024-09-22' });

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesAction && matchesSearch;
    });
  }, [logs, filterStatus, filterAction, searchTerm]);

  const stats = {
    totalLogs: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    warning: logs.filter(l => l.status === 'warning').length,
    error: logs.filter(l => l.status === 'error').length,
  };

  const statCards: { label: string; value: number; icon: string; tone: keyof typeof TONE }[] = [
    { label: 'Total logs', value: stats.totalLogs, icon: 'bi-journal-text', tone: 'indigo' },
    { label: 'Success', value: stats.success, icon: 'bi-check-circle', tone: 'emerald' },
    { label: 'Warnings', value: stats.warning, icon: 'bi-exclamation-triangle', tone: 'amber' },
    { label: 'Errors', value: stats.error, icon: 'bi-x-octagon', tone: 'rose' },
  ];

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  const handleExportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'Details', 'IP Address'],
      ...filteredLogs.map(l => [
        l.timestamp,
        l.user,
        l.action,
        l.resource,
        l.status,
        l.details,
        l.ipAddress
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleClearOldLogs = () => {
    if (window.confirm('Delete logs older than 30 days? This action cannot be undone.')) {
      alert('Logs older than 30 days have been deleted');
    }
  };

  return (
    <AdminLayout>
    <div className={`system-logs
      [padding:0px]
      [background:#f5f5f5]
      [min-height:100vh]
      [border-radius:10px]
      [&_div]:[border-radius:10px]
      [&_.sl-header]:[display:flex]
      [&_.sl-header]:[justify-content:space-between]
      [&_.sl-header]:[align-items:flex-start]
      [&_.sl-header]:[margin-bottom:10px]
      [&_.sl-header_h1]:[font-size:25px]
      [&_.sl-header_h1]:[font-weight:700]
      [&_.sl-header_h1]:[color:#1a1a1a]
      [&_.sl-header_h1]:[margin:0_0_8px_0]
      [&_.sl-header_p]:[font-size:14px]
      [&_.sl-header_p]:[color:#6b7280]
      [&_.sl-header_p]:[margin:2px_0_0]
      [&_.header-actions]:[display:flex]
      [&_.header-actions]:[gap:12px]
      [&_.btn-primary]:[padding:10px_20px]
      [&_.btn-primary]:[border:none]
      [&_.btn-primary]:[border-radius:6px]
      [&_.btn-primary]:[font-size:14px]
      [&_.btn-primary]:[font-weight:500]
      [&_.btn-primary]:[cursor:pointer]
      [&_.btn-primary]:[transition:all_0.3s_ease]
      [&_.btn-secondary]:[padding:10px_20px]
      [&_.btn-secondary]:[border:1px_solid_#ddd]
      [&_.btn-secondary]:[border-radius:6px]
      [&_.btn-secondary]:[font-size:14px]
      [&_.btn-secondary]:[font-weight:500]
      [&_.btn-secondary]:[cursor:pointer]
      [&_.btn-secondary]:[transition:all_0.3s_ease]
      [&_.btn-primary]:[background:#667eea]
      [&_.btn-primary]:[color:white]
      [&_.btn-primary:hover]:[background:#5568d3]
      [&_.btn-primary:hover]:[box-shadow:0_4px_12px_rgba(102,_126,_234,_0.3)]
      [&_.btn-secondary]:[background:#f0f0f0]
      [&_.btn-secondary]:[color:#333]
      [&_.btn-secondary:hover]:[background:#e8e8e8]
      [&_.sl-controls]:[display:grid]
      [&_.sl-controls]:[grid-template-columns:repeat(auto-fit,_minmax(250px,_1fr))]
      [&_.sl-controls]:[gap:16px]
      [&_.sl-controls]:[margin-bottom:24px]
      [&_.sl-controls]:[background:white]
      [&_.sl-controls]:[padding:16px]
      [&_.sl-controls]:[border-radius:8px]
      [&_.sl-controls]:[box-shadow:0_2px_4px_rgba(0,_0,_0,_0.05)]
      [&_.controls-group]:[display:flex]
      [&_.controls-group]:[gap:10px]
      [&_.controls-group]:[align-items:center]
      [&_.search-input]:[padding:10px_12px]
      [&_.search-input]:[border:1px_solid_#ddd]
      [&_.search-input]:[border-radius:6px]
      [&_.search-input]:[font-size:14px]
      [&_.search-input]:[background:white]
      [&_.search-input]:[color:#333]
      [&_.filter-select]:[padding:10px_12px]
      [&_.filter-select]:[border:1px_solid_#ddd]
      [&_.filter-select]:[border-radius:6px]
      [&_.filter-select]:[font-size:14px]
      [&_.filter-select]:[background:white]
      [&_.filter-select]:[color:#333]
      [&_.date-input]:[padding:10px_12px]
      [&_.date-input]:[border:1px_solid_#ddd]
      [&_.date-input]:[border-radius:6px]
      [&_.date-input]:[font-size:14px]
      [&_.date-input]:[background:white]
      [&_.date-input]:[color:#333]
      [&_.search-input]:[flex:1]
      [&_.search-input]:[min-width:200px]
      [&_.filter-select]:[min-width:140px]
      [&_.date-input]:[min-width:140px]
      [&_.search-input::placeholder]:[color:#999]
      [&_.search-input:focus]:[outline:none]
      [&_.search-input:focus]:[border-color:#667eea]
      [&_.search-input:focus]:[box-shadow:0_0_0_3px_rgba(102,_126,_234,_0.1)]
      [&_.filter-select:focus]:[outline:none]
      [&_.filter-select:focus]:[border-color:#667eea]
      [&_.filter-select:focus]:[box-shadow:0_0_0_3px_rgba(102,_126,_234,_0.1)]
      [&_.date-input:focus]:[outline:none]
      [&_.date-input:focus]:[border-color:#667eea]
      [&_.date-input:focus]:[box-shadow:0_0_0_3px_rgba(102,_126,_234,_0.1)]
      [&_.date-separator]:[color:#999]
      [&_.date-separator]:[font-size:12px]
      [&_.date-separator]:[white-space:nowrap]
      [&_.sl-logs-container]:[background:white]
      [&_.sl-logs-container]:[border-radius:8px]
      [&_.sl-logs-container]:[overflow:hidden]
      [&_.sl-logs-container]:[box-shadow:0_2px_4px_rgba(0,_0,_0,_0.05)]
      [&_.sl-logs-container]:[margin-bottom:16px]
      [&_.logs-table]:[width:100%]
      [&_.logs-table]:[border-collapse:collapse]
      [&_.logs-table]:[font-size:13px]
      [&_.logs-table_thead]:[background:#f9f9f9]
      [&_.logs-table_thead]:[border-bottom:2px_solid_#e0e0e0]
      [&_.logs-table_th]:[padding:14px_12px]
      [&_.logs-table_th]:[text-align:left]
      [&_.logs-table_th]:[font-weight:600]
      [&_.logs-table_th]:[color:#333]
      [&_.logs-table_th]:[text-transform:uppercase]
      [&_.logs-table_th]:[font-size:11px]
      [&_.logs-table_th]:[letter-spacing:0.5px]
      [&_.logs-table_td]:[padding:12px]
      [&_.logs-table_td]:[border-bottom:1px_solid_#e8e8e8]
      [&_.logs-table_td]:[color:#555]
      [&_.logs-table_tbody_tr:hover]:[background:#fafafa]
      [&_.timestamp]:[font-family:Courier_New,_monospace]
      [&_.timestamp]:[font-size:12px]
      [&_.timestamp]:[color:#667eea]
      [&_.timestamp]:[font-weight:500]
      [&_.timestamp]:[white-space:nowrap]
      [&_.user]:[font-weight:500]
      [&_.user]:[color:#1a1a1a]
      [&_.action]:[font-weight:600]
      [&_.action]:[color:#1a1a1a]
      [&_.resource]:[color:#666]
      [&_.details]:[max-width:200px]
      [&_.details]:[white-space:nowrap]
      [&_.details]:[overflow:hidden]
      [&_.details]:[text-overflow:ellipsis]
      [&_.ip-address]:[font-family:Courier_New,_monospace]
      [&_.ip-address]:[font-size:12px]
      [&_.ip-address]:[color:#888]
      [&_.status-badge]:[display:inline-block]
      [&_.status-badge]:[padding:4px_10px]
      [&_.status-badge]:[border-radius:4px]
      [&_.status-badge]:[font-size:11px]
      [&_.status-badge]:[font-weight:600]
      [&_.status-badge]:[text-transform:capitalize]
      [&_.status-badge]:[white-space:nowrap]
      [&_.status-badge.success]:[background:#dcfce7]
      [&_.status-badge.success]:[color:#166534]
      [&_.status-badge.warning]:[background:#fef3c7]
      [&_.status-badge.warning]:[color:#92400e]
      [&_.status-badge.error]:[background:#fee2e2]
      [&_.status-badge.error]:[color:#991b1b]
      [&_.status-badge.info]:[background:#dbeafe]
      [&_.status-badge.info]:[color:#1e40af]
      [&_.logs-table_.row-success]:[border-left:3px_solid_#10b981]
      [&_.logs-table_.row-warning]:[border-left:3px_solid_#f59e0b]
      [&_.logs-table_.row-error]:[border-left:3px_solid_#ef4444]
      [&_.logs-table_.row-info]:[border-left:3px_solid_#3b82f6]
      [&_.no-logs]:[text-align:center]
      [&_.no-logs]:[padding:40px]!
      [&_.no-logs]:[color:#999]
      [&_.sl-footer]:[text-align:right]
      [&_.sl-footer]:[padding:8px_0]
      [&_.sl-footer_small]:[font-size:12px]
      [&_.sl-footer_small]:[color:#888]
      max-[1024px]:[&_.logs-table]:[font-size:12px]
      max-[1024px]:[&_.logs-table_th]:[padding:10px_8px]
      max-[1024px]:[&_.logs-table_td]:[padding:10px_8px]
      max-[1024px]:[&_.details]:[max-width:150px]
      max-[1024px]:[&_.sl-controls]:[grid-template-columns:1fr]
      max-[1024px]:[&_.controls-group]:[flex-wrap:wrap]
      max-[768px]:[&_.sl-header]:[flex-direction:column]
      max-[768px]:[&_.sl-header]:[gap:16px]
      max-[768px]:[&_.header-actions]:[flex-direction:column]
      max-[768px]:[&_.header-actions]:[width:100%]
      max-[768px]:[&_.header-actions_.btn-primary]:[width:100%]
      max-[768px]:[&_.header-actions_.btn-secondary]:[width:100%]
      max-[768px]:[&_.sl-controls]:[grid-template-columns:1fr]
      max-[768px]:[&_.controls-group]:[flex-direction:column]
      max-[768px]:[&_.controls-group]:[align-items:stretch]
      max-[768px]:[&_.search-input]:[width:100%]
      max-[768px]:[&_.search-input]:[min-width:auto]
      max-[768px]:[&_.filter-select]:[width:100%]
      max-[768px]:[&_.filter-select]:[min-width:auto]
      max-[768px]:[&_.date-input]:[width:100%]
      max-[768px]:[&_.date-input]:[min-width:auto]
      max-[768px]:[&_.date-separator]:[text-align:center]
      max-[768px]:[&_.logs-table_.ip-address]:[display:none]
      max-[768px]:[&_.logs-table_th:last-child]:[display:none]
      [.ain-app.theme-dark_&]:[color:#f3f4f6]
      [.ain-app.theme-dark_&]:[background:transparent]
      [.ain-app.theme-dark_&_.sl-header_h1]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.user]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.action]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.sl-header_p]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.logs-table_th]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.logs-table_td]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.resource]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.date-separator]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.sl-footer_small]:[color:#c1c8d3]
      [.ain-app.theme-dark_&_.sl-controls]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.sl-controls]:[background:#1f2937]
      [.ain-app.theme-dark_&_.sl-controls]:[border-color:#374151]
      [.ain-app.theme-dark_&_.sl-logs-container]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.sl-logs-container]:[background:#1f2937]
      [.ain-app.theme-dark_&_.sl-logs-container]:[border-color:#374151]
      [.ain-app.theme-dark_&_.search-input]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.search-input]:[background:#111827]
      [.ain-app.theme-dark_&_.search-input]:[border-color:#374151]
      [.ain-app.theme-dark_&_.filter-select]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.filter-select]:[background:#111827]
      [.ain-app.theme-dark_&_.filter-select]:[border-color:#374151]
      [.ain-app.theme-dark_&_.date-input]:[color:#f3f4f6]
      [.ain-app.theme-dark_&_.date-input]:[background:#111827]
      [.ain-app.theme-dark_&_.date-input]:[border-color:#374151]
      [.ain-app.theme-dark_&_.search-input::placeholder]:[color:#9ca3af]
      [.ain-app.theme-dark_&_.logs-table_thead]:[background:#273449]
      [.ain-app.theme-dark_&_.logs-table_thead]:[border-color:#374151]
      [.ain-app.theme-dark_&_.logs-table_td]:[border-color:#374151]
      [.ain-app.theme-dark_&_.logs-table_tbody_tr:hover]:[background:#273449]
      [.ain-app.theme-dark_&_.btn-secondary]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.btn-secondary]:[background:#273449]
      [.ain-app.theme-dark_&_.btn-secondary]:[border-color:#4b5563]
      [.ain-app.theme-dark_&_.btn-secondary:hover]:[background:#374151]
      max-[768px]:[&_.logs-table_th:nth-child(6)]:[display:none]
      max-[768px]:[&_.logs-table_td:nth-child(6)]:[display:none]
      max-[768px]:[&_.details]:[max-width:120px]
      max-[768px]:[&_.logs-table]:[font-size:11px]
      max-[768px]:[&_.logs-table_th]:[padding:8px_4px]
      max-[768px]:[&_.logs-table_td]:[padding:8px_4px]
      max-[480px]:[&_.logs-table_.resource]:[display:none]
      max-[480px]:[&_.logs-table_th:nth-child(4)]:[display:none]
      max-[480px]:[&_.logs-table_th]:[padding:6px_4px]
      max-[480px]:[&_.logs-table_td]:[padding:6px_4px]`}>
      {/* Smooth card entrance animation */}
      <style>{`
        @keyframes sl-card-in {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sl-value-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sl-card, .sl-card-value { animation: none !important; }
        }
      `}</style>

      <div className="sl-header">
        <div>
          <h2 className="m-0 break-words [font-size:1.6rem]! !font-bold leading-tight tracking-tight text-black dark:text-white">System Logs</h2>
          <p className="mt-0.5 mb-0 text-sm text-[color:#6b7280] dark:text-slate-400">
            Monitor all system events and user activities
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-primary [border-radius:10px]!" onClick={handleExportLogs}>
            📥 Export Logs
          </button>
          <button className="btn-secondary [border-radius:10px]!" onClick={handleClearOldLogs}>
            <DeleteIcon className="mr-1 inline-block h-5 w-4 align-[-3px]" /> Clear Old Logs
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-3 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {statCards.map((s, i) => (
          <div
            key={s.label}
            className={CARD}
            style={{ animation: `sl-card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${i * 90}ms both` }}
          >
            <span className={`${ICON_BOX} ${TONE[s.tone]}`}>
              <i className={`bi ${s.icon}`} />
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm text-slate-500 sm:text-[15px] dark:text-slate-400">
                {s.label}
              </div>
              <div
                key={s.value}
                className="sl-card-value !text-xl font-bold leading-tight text-slate-900 sm:text-[25px] dark:text-white [.ain-app.theme-dark_&]:text-white"
                style={{ animation: 'sl-value-in 0.4s ease-out both' }}
              >
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sl-controls">
        <div className="controls-group">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="controls-group">
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value as 'all' | 'success' | 'warning' | 'error' | 'info',
              )
            }
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="info">Info</option>
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        <div className="controls-group">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="date-input"
          />
          <span className="date-separator">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="date-input"
          />
        </div>
      </div>

      <div className="sl-logs-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Status</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => (
                <tr key={log.id} className={`row-${log.status}`}>
                  <td className="timestamp">{log.timestamp}</td>
                  <td className="user">{log.user}</td>
                  <td className="action">{log.action}</td>
                  <td className="resource">{log.resource}</td>
                  <td>
                    <span className={`status-badge ${log.status}`}>
                      {log.status === 'success' && '✓'}
                      {log.status === 'warning' && '⚠️'}
                      {log.status === 'error' && '✕'}
                      {log.status === 'info' && 'ℹ'}
                      {' '}{log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                  <td className="details" title={log.details}>{log.details}</td>
                  <td className="ip-address">{log.ipAddress}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="no-logs">
                  No logs found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sl-footer">
        <small>
          Showing {filteredLogs.length} of {logs.length} logs
          {filteredLogs.length !== logs.length && ' (filtered)'}
        </small>
      </div>
    </div>
    </AdminLayout>
  );
};

export default SystemLogs;