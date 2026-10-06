import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { aiModelCatalog } from '../data/aiModels';
import { Download } from 'lucide-react';

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

type SortKey = 'timestamp' | 'user' | 'action' | 'resource' | 'status' | 'details' | 'ipAddress';
type SortDirection = 'asc' | 'desc';

/* ------------------------------------------------------------------ */
/* Stat card tokens (same look as User Management cards)               */
/* ------------------------------------------------------------------ */
const CARD =
  'sl-card group flex min-h-[84px] min-w-0 items-center gap-2.5 p-3 sm:min-h-[100px] sm:gap-4 sm:px-6 sm:py-6 ' +
  'rounded-[10px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ' +
  '[.ain-app.theme-dark_&]:border-[#374151] [.ain-app.theme-dark_&]:bg-[#1f2937] ' +
  'transition-[transform,box-shadow] duration-300 ease-out ' +
  'hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0';

const ICON_BOX =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-lg ' +
  'sm:h-[50px] sm:w-[50px] sm:text-2xl ' +
  'transition-transform duration-300 ease-out group-hover:scale-110 motion-reduce:transition-none';

const TONE = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
} as const;

/* ------------------------------------------------------------------ */
/* Responsive rules                                                    */
/*  - < 640px   : table rows become stacked cards (no sideways scroll) */
/*  - 640-1023px: table scrolls horizontally inside its container      */
/*  - >= 1024px : full table                                           */
/* ------------------------------------------------------------------ */
const RESPONSIVE_CSS = `
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

.system-logs { box-sizing: border-box; min-height: 100vh; min-height: 100dvh; overflow-x: hidden; }
.system-logs *, .system-logs *::before, .system-logs *::after { box-sizing: border-box; }

/* ---------- Header ---------- */
.system-logs .sl-header { flex-wrap: wrap; align-items: center; gap: 10px 16px; margin-bottom: 12px; }
.system-logs .sl-header > div:first-child { min-width: 0; flex: 1 1 auto; }
.system-logs .sl-header h2 { margin: 0; }
.system-logs .sl-header p { margin: 4px 0 0; }
.system-logs .sl-header .header-actions { flex-wrap: wrap; gap: 10px; }
.system-logs .sl-header .header-actions button {
  display: inline-flex; align-items: center; justify-content: center;
  white-space: nowrap; min-height: 40px;
}

/* ---------- Controls ---------- */
.system-logs .sl-controls {
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
}
.system-logs .sl-controls .controls-group { flex-wrap: wrap; min-width: 0; }
.system-logs .sl-controls .search-input { flex: 1 1 100%; width: 100%; min-width: 0; }
.system-logs .sl-controls .filter-select { flex: 1 1 130px; min-width: 0; }
.system-logs .sl-controls .date-input { flex: 1 1 130px; min-width: 0; }
.system-logs .sl-controls input,
.system-logs .sl-controls select { min-height: 40px; max-width: 100%; }

/* ---------- Table: always scrolls on the X axis ---------- */
.system-logs .sl-logs-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.system-logs .sl-logs-container .logs-table { width: 100%; min-width: 900px;  }
.system-logs .sl-logs-container .logs-table th { white-space: nowrap; }
.system-logs .sl-logs-container .logs-table td { vertical-align: middle; }
.system-logs .sl-logs-container .logs-table td { border:1px solid #e3e3e3; }
.system-logs .sl-logs-container .logs-table .details { max-width: 260px; }
.system-logs .sl-logs-container .logs-table td.no-logs { white-space: normal; }

@media (max-width: 1023px) {
  .system-logs .sl-logs-container .logs-table { font-size: 12px; }
  .system-logs .sl-logs-container .logs-table th,
  .system-logs .sl-logs-container .logs-table td { padding: 10px 8px; }
}

@media (max-width: 639px) {
  .system-logs .sl-header { flex-direction: column; align-items: stretch; }
  .system-logs .sl-header .header-actions { width: 100%; }
  .system-logs .sl-header .header-actions button { flex: 1 1 140px; padding: 10px 12px; }

  .system-logs .sl-controls { grid-template-columns: 1fr; padding: 12px; gap: 12px; margin-bottom: 16px; }
  .system-logs .sl-controls .date-separator { flex: 0 0 auto; align-self: center; }
  /* 16px stops iOS Safari from zooming on focus */
  .system-logs .sl-controls input,
  .system-logs .sl-controls select { font-size: 16px; }

  .system-logs .sl-footer { text-align: center; }
}

@media (max-width: 359px) {
  .system-logs .sl-header .header-actions button { flex: 1 1 100%; }
}
`;

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
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'timestamp',
    direction: 'desc',
  });

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      const logDate = log.timestamp.slice(0, 10);
      const matchesDate =
        (!dateRange.start || logDate >= dateRange.start) &&
        (!dateRange.end || logDate <= dateRange.end);
      const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesAction && matchesDate && matchesSearch;
    });
  }, [logs, filterStatus, filterAction, searchTerm, dateRange]);

  const sortedLogs = useMemo(() => {
    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...filteredLogs].sort((left, right) =>
      left[sort.key].localeCompare(right[sort.key], undefined, {
        numeric: true,
        sensitivity: 'base',
      }) * direction,
    );
  }, [filteredLogs, sort]);

  const handleSort = (key: SortKey) => {
    setSort(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const renderSortHeader = (label: string, key: SortKey) => {
    const active = sort.key === key;
    return (
      <th aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button
          type="button"
          className="inline-flex cursor-pointer [font-size:13px]! items-center gap-1 rounded border-0 bg-transparent p-0 text-inherit  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-#b3beee"
          onClick={() => handleSort(key)}
          aria-label={`Sort by ${label}${active ? `, currently ${sort.direction}ending` : ''}`}
        >
          {label}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={`h-4 w-4 shrink-0 ${active ? 'text-#b3beee' : 'opacity-50'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {active ? (
              sort.direction === 'asc'
                ? <path d="M8 13V3m0 0L4.5 6.5M8 3l3.5 3.5" />
                : <path d="M8 3v10m0 0 3.5-3.5M8 13l-3.5-3.5" />
            ) : (
              <path d="M5 6l3-3 3 3M8 3v10m0 0-3-3m3 3 3-3" />
            )}
          </svg>
        </button>
      </th>
    );
  };

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
        l.ipAddress,
      ]),
    ]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // const handleClearOldLogs = () => {
  //   if (window.confirm('Delete logs older than 30 days? This action cannot be undone.')) {
  //     alert('Logs older than 30 days have been deleted');
  //   }
  // };

  return (
    <AdminLayout>
      <div className={`system-logs mx-auto w-full max-w-[1520px] 2xl:max-w-[1760px]
      [padding:0px]
      [background:#f5f5f5]
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
      [&_.sl-logs-container]:[box-shadow:0_2px_4px_rgba(0,_0,_0,_0.05)]
      [&_.sl-logs-container]:[margin-bottom:16px]
      [&_.logs-table]:[width:100%]
      [&_.logs-table]:[border-collapse:collapse]
      [&_.logs-table]:[font-size:13px]
      [&_.logs-table_thead]:[background:#6976b5]
      [&_.logs-table_thead]:[border:1px_solid_e7e7e7]
      [&_.logs-table_th]:[padding:14px_12px]
      [&_.logs-table_th]:[text-align:left]
      [&_.logs-table_th]:[font-weight:600]
      [&_.logs-table_th]:[color:white]
      [&_.logs-table_th]:[text-transform:uppercase]
      [&_.logs-table_th]:[font-size:11px]
      [&_.logs-table_th]:[letter-spacing:0.5px]
      [&_.logs-table_td]:[padding:12px]
      [&_.logs-table_td]:[border:1px_solid_#e8e8e8]
      [&_.logs-table_td]:[color:#555]
      [&_.logs-table_tbody_tr:hover]:[background:#fafafa;]
      [&_.logs-table_tbody]:[border:2px_solid_#d1d5db]!
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
      [.ain-app.theme-dark_&_.ip-address]:[color:#9ca3af]
      [.ain-app.theme-dark_&_.no-logs]:[color:#c1c8d3]
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
      [.ain-app.theme-dark_&_.status-badge.success]:[background:#064e3b]
      [.ain-app.theme-dark_&_.status-badge.success]:[color:#a7f3d0]
      [.ain-app.theme-dark_&_.status-badge.warning]:[background:#78350f]
      [.ain-app.theme-dark_&_.status-badge.warning]:[color:#fde68a]
      [.ain-app.theme-dark_&_.status-badge.error]:[background:#7f1d1d]
      [.ain-app.theme-dark_&_.status-badge.error]:[color:#fecaca]
      [.ain-app.theme-dark_&_.status-badge.info]:[background:#1e3a8a]
      [.ain-app.theme-dark_&_.status-badge.info]:[color:#bfdbfe]
      [.ain-app.theme-dark_&_.btn-secondary]:[color:#e5e7eb]
      [.ain-app.theme-dark_&_.btn-secondary]:[background:#273449]
      [.ain-app.theme-dark_&_.btn-secondary]:[border-color:#4b5563]
      [.ain-app.theme-dark_&_.btn-secondary:hover]:[background:#374151]`}>
        <style>{RESPONSIVE_CSS}</style>

        <div className="sl-header">
          <div>
            <h2 className="m-0 break-words [font-size:clamp(1.25rem,1rem+1.2vw,1.6rem)]! !font-bold leading-tight tracking-tight text-black dark:text-white">
              System Logs
            </h2>
            <p className="mt-0.5 mb-0 text-sm text-[color:#6b7280] dark:text-slate-400">
              Monitor all system events and user activities
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn-primary [border-radius:10px]! gap-1.5"
              onClick={handleExportLogs}
            >
              <Download size={17} />
              Export Logs
            </button>
            {/* <button className="btn-secondary [border-radius:10px]!" onClick={handleClearOldLogs}>
            <DeleteIcon className="mr-1 inline-block h-5 w-4 align-[-3px]" /> Clear Old Logs
          </button> */}
          </div>
        </div>

        {/* Stat cards: 2 columns on phones, 4 on large screens */}
        <div className="mb-3 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-5">
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
                <div className="truncate text-xs text-slate-500 sm:text-[15px] dark:text-slate-400">
                  {s.label}
                </div>
                <div
                  key={s.value}
                  className="sl-card-value !text-xl font-bold leading-tight text-slate-900 sm:!text-[25px] dark:text-white [.ain-app.theme-dark_&]:text-white"
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
              aria-label="Search logs"
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
              aria-label="Filter by status"
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
              aria-label="Filter by action"
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
              max={dateRange.end || undefined}
              onChange={(e) => setDateRange(current => ({ ...current, start: e.target.value }))}
              className="date-input"
              aria-label="Start date"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={dateRange.end}
              min={dateRange.start || undefined}
              onChange={(e) => setDateRange(current => ({ ...current, end: e.target.value }))}
              className="date-input"
              aria-label="End date"
            />
          </div>
        </div>

        <div className="sl-logs-container">
          <table className="logs-table">
            <thead>
              <tr>
                {renderSortHeader('Timestamp', 'timestamp')}
                {renderSortHeader('User', 'user')}
                {renderSortHeader('Action', 'action')}
                {renderSortHeader('Resource', 'resource')}
                {renderSortHeader('Status', 'status')}
                {renderSortHeader('Details', 'details')}
                {renderSortHeader('IP Address', 'ipAddress')}
              </tr>
            </thead>
            <tbody >
              {sortedLogs.length > 0 ? (
                sortedLogs.map(log => (
                  <tr key={log.id} className={`row-${log.status}`}>
                    <td className="timestamp" data-label="Time">{log.timestamp}</td>
                    <td className="user" data-label="User">{log.user}</td>
                    <td className="action" data-label="Action">{log.action}</td>
                    <td className="resource" data-label="Resource">{log.resource}</td>
                    <td data-label="Status">
                      <span className={`status-badge ${log.status}`}>
                        {log.status === 'success' && '✓'}
                        {log.status === 'warning' && '⚠️'}
                        {log.status === 'error' && '✕'}
                        {log.status === 'info' && 'ℹ'}
                        {' '}{log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                    <td className="details"  data-label="Details" title={log.details}>{log.details}</td>
                    <td className="ip-address" data-label="IP">{log.ipAddress}</td>
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